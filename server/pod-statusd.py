# ComfyField Pod status server: status, heartbeats, model downloads and the watchdog.
# server/podBoot.js embeds this file in the Pod's boot script. It runs with the image's
# venv Python and uses only the standard library, so it also runs in scripts/pod-checks.mjs.
import hmac
import json
import os
import re
import shutil
import subprocess
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

E = os.environ
BASE = E.get('CF_BASE', '/root/cf')
MODELS = E.get('CF_MODELS', '/workspace/models')
COMFY = E.get('CF_COMFY_URL', 'http://127.0.0.1:8188')
PROXY = E.get('CF_PROXY_URL', 'http://127.0.0.1:8189')
HF = E.get('CF_HF_BASE', 'https://huggingface.co')
TOKEN = E.get('POD_TOKEN', '')
PORT = int(E.get('CF_STATUS_PORT', '8190'))
TICK = float(E.get('CF_TICK', '15'))
DIRS = ('checkpoints', 'diffusion_models', 'text_encoders', 'vae', 'loras', 'upscale_models', 'latent_upscale_models')
CFG = {
  'idle_after': int(E.get('IDLE_AFTER', '780')),
  'heartbeat_deadline': int(E.get('HEARTBEAT_DEADLINE', '600')),
  'max_life': int(E.get('MAX_LIFE', '7200')),
  'drain_grace': int(E.get('DRAIN_GRACE', '1800')),
  'boot_deadline': int(E.get('BOOT_DEADLINE', '1500')),
  'fatal_grace': int(E.get('FATAL_GRACE', '180')),
}

BOOTED = time.time()
LOCK = threading.Lock()
S = {'stage': 'boot', 'ready_at': None, 'hb': None, 'idle': 0, 'queue': None, 'gpu': None, 'fatal': None, 'fatal_at': None, 'ending': None}
DOWNLOADS = {}
WORK = []
WAKE = threading.Event()


def decide(s, cfg):
  """Why the Pod must terminate itself now, or None. Pure, so the rules can be tested."""
  now, age = s['now'], s['now'] - s['booted']
  busy = s['busy']
  if s['fatal'] and now - s['fatal_at'] >= cfg['fatal_grace']:
    return 'fatal: %s' % s['fatal']
  if not s['ready_at'] and age >= cfg['boot_deadline']:
    return 'not ready after %d minutes' % (age // 60)
  if age >= cfg['max_life'] and not (busy and age < cfg['max_life'] + cfg['drain_grace']):
    return 'lifetime limit of %d minutes' % (cfg['max_life'] // 60)
  hb = s['hb']
  if hb is not None:
    quiet = now - hb
    if quiet >= cfg['heartbeat_deadline'] and not (busy and quiet < cfg['heartbeat_deadline'] + cfg['drain_grace']):
      return 'no heartbeat for %d minutes' % (quiet // 60)
  elif s['ready_at'] and now - s['ready_at'] >= cfg['heartbeat_deadline']:
    return 'no heartbeat since it became ready'
  if s['idle'] >= cfg['idle_after']:
    return 'idle for %d minutes' % (s['idle'] // 60)
  return None


def next_idle(idle, util, queue, downloading, tick):
  # An unanswered probe counts as busy: failing closed costs money, failing open loses a run.
  if util is None or queue is None or downloading:
    return 0
  return idle + tick if util == 0 and queue == 0 else 0


def log(msg):
  line = '%s %s\n' % (time.strftime('%Y-%m-%dT%H:%M:%S'), msg)
  try:
    with open(os.path.join(BASE, 'statusd.log'), 'a') as f:
      f.write(line)
  except OSError:
    pass


def answers(url, path):
  try:
    with urllib.request.urlopen(url + path, timeout=4) as r:
      return 200 <= r.status < 300
  except Exception:
    return False


def probe_queue():
  try:
    with urllib.request.urlopen(COMFY + '/queue', timeout=4) as r:
      d = json.loads(r.read().decode())
    return len(d.get('queue_running', [])) + len(d.get('queue_pending', []))
  except Exception:
    return None


def probe_gpu():
  try:
    out = subprocess.run(['nvidia-smi', '--query-gpu=utilization.gpu,memory.used,memory.total', '--format=csv,noheader,nounits'],
                         capture_output=True, timeout=5).stdout.decode()
    u, used, total = [x.strip() for x in out.strip().split('\n')[0].split(',')]
    return {'util': int(float(u)), 'memUsedMb': int(float(used)), 'memTotalMb': int(float(total))}
  except Exception:
    return None


def models():
  out = []
  for d in DIRS:
    folder = os.path.join(MODELS, d)
    for name in sorted(os.listdir(folder)) if os.path.isdir(folder) else []:
      p = os.path.join(folder, name)
      if os.path.isfile(p) and not name.endswith('.part'):
        out.append({'dir': d, 'name': name, 'bytes': os.path.getsize(p)})
  return out


def downloading():
  return any(v['state'] in ('queued', 'downloading') for v in DOWNLOADS.values())


def snapshot():
  now = time.time()
  with LOCK:
    hb = S['hb']
    try:
      free = shutil.disk_usage(MODELS).free / 1e9
    except OSError:
      free = None
    return {
      'stage': S['stage'], 'ready': S['stage'] == 'ready', 'fatal': S['fatal'],
      'idleSec': int(S['idle']), 'uptimeSec': int(now - BOOTED), 'queue': S['queue'],
      'heartbeatAgeSec': None if hb is None else int(now - hb), 'gpu': S['gpu'],
      'diskFreeGb': None if free is None else round(free, 1), 'ending': S['ending'],
      'models': models(), 'downloads': {k: dict(v) for k, v in DOWNLOADS.items()},
    }


def terminate(reason):
  with LOCK:
    S['ending'] = reason
  log('TERMINATE %s' % reason)
  if E.get('CF_DRY_KILL'):
    with open(os.path.join(BASE, 'terminated'), 'w') as f:
      f.write(reason)
    return
  if subprocess.run(['bash', os.path.join(BASE, 'kill-pod.sh'), reason]).returncode != 0:
    # Still billing. Try again in a minute; the app's monitor also terminates from outside.
    log('could not self-terminate, trying again in 60 s')
    time.sleep(60)
    with LOCK:
      S['ending'] = None


def read_fatal():
  try:
    with open(os.path.join(BASE, '.fatal')) as f:
      return f.read().strip() or 'boot failed'
  except OSError:
    return None


def watchdog():
  while True:
    time.sleep(TICK)
    comfy = answers(COMFY, '/system_stats')
    proxy = answers(PROXY, '/api/v2/health')
    queue = probe_queue() if comfy else None
    gpu = probe_gpu()
    fatal = read_fatal()
    with LOCK:
      if fatal and not S['fatal']:
        S['fatal'], S['fatal_at'] = fatal, time.time()
      S['stage'] = 'ready' if comfy and proxy else 'comfy' if comfy else 'boot'
      if S['stage'] == 'ready' and not S['ready_at']:
        S['ready_at'] = time.time()
      S['queue'], S['gpu'] = queue, gpu
      S['idle'] = next_idle(S['idle'], gpu and gpu['util'], queue, downloading(), TICK)
      busy = (queue or 0) > 0 or queue is None or downloading()
      state = dict(S, now=time.time(), booted=BOOTED, busy=busy)
      done = S['ending']
    reason = None if done else decide(state, CFG)
    if reason:
      terminate(reason)


SAFE_NAME = re.compile(r'^[\w.+-]+$')
SAFE_REPO = re.compile(r'^[\w.-]+/[\w.-]+$')


def valid(item):
  path = str(item.get('path', ''))
  return (SAFE_REPO.match(str(item.get('repo', ''))) and item.get('dir') in DIRS and SAFE_NAME.match(str(item.get('name', '')))
          and path and '..' not in path.split('/') and not path.startswith('/'))


def fetch(item, key):
  dest = os.path.join(MODELS, item['dir'], item['name'])
  part = dest + '.part'
  url = '%s/%s/resolve/main/%s' % (HF, item['repo'], item['path'])
  have = os.path.getsize(part) if os.path.exists(part) else 0
  req = urllib.request.Request(url, headers={'Range': 'bytes=%d-' % have} if have else {})
  with urllib.request.urlopen(req, timeout=60) as r:
    if have and r.status != 206:
      have = 0
    total = int(r.headers.get('Content-Length') or 0) + have
    with LOCK:
      DOWNLOADS[key].update(state='downloading', bytes=have, total=total or None)
    with open(part, 'ab' if have else 'wb') as f:
      while True:
        chunk = r.read(1 << 20)
        if not chunk:
          break
        f.write(chunk)
        with LOCK:
          DOWNLOADS[key]['bytes'] += len(chunk)
  if total and os.path.getsize(part) != total:
    raise IOError('the download stopped at %d of %d bytes' % (os.path.getsize(part), total))
  os.replace(part, dest)


def downloader():
  while True:
    WAKE.wait()
    with LOCK:
      item = WORK.pop(0) if WORK else None
      if not WORK:
        WAKE.clear()
    if not item:
      continue
    key = '%s/%s' % (item['dir'], item['name'])
    for attempt in range(3):
      try:
        fetch(item, key)
        with LOCK:
          DOWNLOADS[key].update(state='done', error=None)
        log('downloaded %s' % key)
        break
      except Exception as e:
        err = 'disk full' if isinstance(e, OSError) and getattr(e, 'errno', 0) == 28 else str(e)
        if attempt == 2 or err == 'disk full' or (isinstance(e, urllib.error.HTTPError) and e.code in (401, 403, 404)):
          with LOCK:
            DOWNLOADS[key].update(state='failed', error=err)
          log('download failed %s: %s' % (key, err))
          break
        time.sleep(3)


class Handler(BaseHTTPRequestHandler):
  def log_message(self, *args):
    pass

  def reply(self, code, data=None):
    body = b'' if data is None else json.dumps(data).encode()
    self.send_response(code)
    if body:
      self.send_header('Content-Type', 'application/json')
    self.send_header('Content-Length', str(len(body)))
    self.end_headers()
    self.wfile.write(body)

  def authorized(self):
    got = self.headers.get('Authorization', '')
    if TOKEN and hmac.compare_digest(got, 'Bearer ' + TOKEN):
      return True
    self.reply(401, {'error': 'unauthorized'})
    return False

  def do_GET(self):
    if not self.authorized():
      return
    if self.path == '/status':
      return self.reply(200, snapshot())
    if self.path == '/log':
      try:
        with open(os.path.join(BASE, 'boot.log'), errors='replace') as f:
          lines = f.readlines()[-200:]
      except OSError:
        lines = []
      return self.reply(200, {'lines': [l.rstrip('\n') for l in lines]})
    self.reply(404, {'error': 'not found'})

  def do_POST(self):
    if not self.authorized():
      return
    if self.path == '/heartbeat':
      with LOCK:
        S['hb'] = time.time()
      return self.reply(204)
    if self.path == '/download':
      try:
        size = int(self.headers.get('Content-Length') or 0)
        files = json.loads(self.rfile.read(size).decode() or '{}').get('files') or []
      except Exception:
        return self.reply(400, {'error': 'send JSON with a files list'})
      if not isinstance(files, list) or not all(isinstance(f, dict) and valid(f) for f in files):
        return self.reply(400, {'error': 'each file needs a public repo, a path, a known dir and a plain name'})
      with LOCK:
        for f in files:
          key = '%s/%s' % (f['dir'], f['name'])
          present = os.path.isfile(os.path.join(MODELS, f['dir'], f['name']))
          if present:
            DOWNLOADS[key] = {'state': 'done', 'bytes': os.path.getsize(os.path.join(MODELS, f['dir'], f['name'])), 'total': None, 'error': None}
          elif DOWNLOADS.get(key, {}).get('state') not in ('queued', 'downloading'):
            DOWNLOADS[key] = {'state': 'queued', 'bytes': 0, 'total': None, 'error': None}
            WORK.append(f)
        if WORK:
          WAKE.set()
      return self.reply(202, {'downloads': {k: dict(v) for k, v in DOWNLOADS.items()}})
    self.reply(404, {'error': 'not found'})


def main():
  if not TOKEN:
    raise SystemExit('POD_TOKEN is not set')
  os.makedirs(BASE, exist_ok=True)
  for d in DIRS:
    os.makedirs(os.path.join(MODELS, d), exist_ok=True)
  for target in (watchdog, downloader):
    threading.Thread(target=target, daemon=True).start()
  log('status server on port %d' % PORT)
  ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()


if __name__ == '__main__':
  main()
