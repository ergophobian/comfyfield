# ComfyField Pod status server: status, heartbeats, model downloads, runtime installs and the watchdog.
# server/podBoot.js embeds this file in the Pod's boot script. It runs with the image's
# venv Python and uses only the standard library, so it also runs in scripts/pod-checks.mjs.
import hashlib
import hmac
import json
import os
import re
import shutil
import socketserver
import subprocess
import threading
import time
import urllib.error
import urllib.parse
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
# The shell for the runtime installers and the self-terminate script: bash on a Pod. On Windows,
# process search looks in System32 before PATH and can find the WSL launcher, so it can be given.
BASH = E.get('CF_BASH') or shutil.which('bash') or 'bash'
# The models folders, from the boot script, which takes them from ComfyField's loaders.
DIRS = tuple(E.get('CF_DIRS', 'checkpoints diffusion_models text_encoders vae loras upscale_models latent_upscale_models clip_vision').split())
# Runtimes the boot script wrote an installer for, and where each one writes machine.json when it is ready.
RUNTIME_HOMES = {'freevideo': E.get('CF_FREEVIDEO_HOME', '/workspace/freevideo')}
# Secrets third-party installers never see.
SECRETS = ('RUNPOD_API_KEY', 'POD_TOKEN', 'HF_TOKEN')
# Room kept free on the volume after a download, and how long a loaded pack may take to appear.
MARGIN = float(E.get('CF_DISK_MARGIN_GB', '3')) * 1e9
LOAD_DEADLINE = int(E.get('CF_LOAD_DEADLINE', '900'))
RESTART_GRACE = float(E.get('CF_RESTART_GRACE', '15'))
USED_FILE = os.path.join(MODELS, '.cf-used.json')


def read_packs():
  # Node packs the boot script knows, from packs.tsv: id, folder, the classes ComfyUI lists once it loads,
  # and the model files that must be on the disk before it loads.
  out = {}
  try:
    with open(E.get('CF_PACKS', os.path.join(BASE, 'packs.tsv'))) as f:
      for line in f:
        parts = line.rstrip('\n').split('\t')
        if len(parts) in (3, 4) and parts[0]:
          before = [k for k in (parts[3] if len(parts) == 4 else '').split(',') if k]
          out[parts[0]] = {'folder': parts[1], 'classes': [c for c in parts[2].split(',') if c], 'before': before}
  except OSError:
    pass
  return out


PACKS = read_packs()
CFG = {
  'terminate_at': int(E.get('CF_TERMINATE_AT', '0')),
  'idle_after': int(E.get('IDLE_AFTER', '780')),
  'heartbeat_deadline': int(E.get('HEARTBEAT_DEADLINE', '600')),
  'max_life': int(E.get('MAX_LIFE', '7200')),
  'drain_grace': int(E.get('DRAIN_GRACE', '1800')),
  'boot_deadline': int(E.get('BOOT_DEADLINE', '1500')),
  'fatal_grace': int(E.get('FATAL_GRACE', '180')),
}

BOOTED = time.time()
LOCK = threading.Lock()
# One pack install at a time: they all pip into ComfyUI's Python.
PACK_LOCK = threading.Lock()
S = {'stage': 'boot', 'ready_at': None, 'hb': None, 'idle': 0, 'queue': None, 'gpu': None, 'fatal': None, 'fatal_at': None, 'ending': None,
     'restarted_at': None, 'evicted': []}
DOWNLOADS = {}
RUNTIMES = {}
WORK = []
WAKE = threading.Event()


def read_used():
  try:
    with open(USED_FILE) as f:
      return {k: float(v) for k, v in json.load(f).items()}
  except Exception:
    return {}


# When each model file was last asked for, kept on the volume so a resumed Pod still knows.
USED = read_used()


def save_used():
  try:
    with open(USED_FILE + '.tmp', 'w') as f:
      json.dump(USED, f)
    os.replace(USED_FILE + '.tmp', USED_FILE)
  except OSError:
    pass


def decide(s, cfg):
  """Why the Pod must terminate itself now, or None. Pure, so the rules can be tested."""
  now, age = s['now'], s['now'] - s['booted']
  if cfg.get('terminate_at') and now >= cfg['terminate_at']:
    return 'proof deadline reached'
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


LEASE_FRESH = 60


def is_busy(queue, work, leased_at, now):
  """A queued job, an unknown queue, a download or install, or a run the app leased in the last minute."""
  return (queue or 0) > 0 or queue is None or bool(work) or (leased_at is not None and now - leased_at < LEASE_FRESH)


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
        key = '%s/%s' % (d, name)
        out.append({'dir': d, 'name': name, 'bytes': os.path.getsize(p), 'usedAt': int(USED.get(key) or os.path.getmtime(p))})
  return out


def downloading():
  return any(v['state'] in ('queued', 'downloading') for v in DOWNLOADS.values())


def installing():
  # A pack that is installed but not loaded yet still keeps the Pod busy.
  return any(v['state'] in ('installing', 'loading') for v in RUNTIMES.values())


def clean_env():
  return {k: v for k, v in E.items() if k not in SECRETS and k not in ('VIRTUAL_ENV', 'PYTHONHOME')}


def runtime_ready(name):
  try:
    with open(os.path.join(RUNTIME_HOMES[name], 'machine.json')) as f:
      return json.load(f).get('ready') is True
  except Exception:
    return False


def last_error(logfile):
  # The installer's own last word is the most useful reason; prefer a line that says what failed.
  try:
    with open(logfile, errors='replace') as f:
      # A tool that writes UTF-16, such as the WSL launcher, leaves NUL bytes in a text read.
      lines = [l.replace('\x00', '').strip() for l in f.readlines()[-80:]]
      lines = [l for l in lines if l]
  except OSError:
    return None
  hits = [l for l in lines if re.search(r'error|fail|insufficient|refus|cannot|could not|not on the pod', l, re.I)]
  pick = hits or lines
  return pick[-1][:300] if pick else None


def run_installer(script, args, logfile):
  with open(logfile, 'a') as out:
    return subprocess.run([BASH, os.path.join(BASE, script)] + args, stdout=out, stderr=subprocess.STDOUT,
                          stdin=subprocess.DEVNULL, env=clean_env()).returncode


def install(name):
  # Runs the runtime's installer on every request after a failure, and once per boot otherwise.
  # "Ready" needs this boot's run to end well: an old machine.json is there while a re-run holds its locks.
  # A pack ends its install as "loading": ComfyUI must start again to list its nodes.
  logfile = os.path.join(BASE, '%s.log' % name)
  pack = name in PACKS
  log('installing %s' % name)
  try:
    # The boot script's own pip installs and FreeVideo's clone come first.
    waited = 0
    while not os.path.exists(os.path.join(BASE, '.base-ready')) and waited < 1800:
      time.sleep(2)
      waited += 2
    if pack:
      with PACK_LOCK:
        code = run_installer('runtime-pack.sh', [name], logfile)
      err = None if code == 0 else (last_error(logfile) or 'the installer stopped (exit %s)' % code)
    else:
      code = run_installer('runtime-%s.sh' % name, [], logfile)
      err = None if code == 0 and runtime_ready(name) else (last_error(logfile) or 'the installer stopped (exit %s)' % code)
  except Exception as e:
    err = str(e)
  with LOCK:
    RUNTIMES[name].update(state='failed' if err else 'loading' if pack else 'ready', error=err, endedAt=time.time())
  log('%s %s' % (name, 'failed: %s' % err if err else 'installed' if pack else 'ready'))


def want_runtime(name):
  with LOCK:
    e = RUNTIMES.get(name)
    if e and e['state'] in ('installing', 'loading', 'ready'):
      return dict(e)
    RUNTIMES[name] = {'state': 'installing', 'error': None, 'startedAt': time.time(), 'endedAt': None}
    out = dict(RUNTIMES[name])
  threading.Thread(target=install, args=(name,), daemon=True).start()
  return out


def runtimes():
  now = time.time()
  return {k: {'state': v['state'], 'error': v['error'], 'sec': int((v['endedAt'] or now) - v['startedAt']), 'pack': k in PACKS}
          for k, v in RUNTIMES.items()}


def lists_classes(classes):
  for c in classes:
    try:
      with urllib.request.urlopen(COMFY + '/object_info/' + c, timeout=4) as r:
        if c not in json.loads(r.read().decode() or '{}'):
          return False
    except Exception:
      return False
  return True


def restart_comfy():
  # The boot script's loop starts ComfyUI again, with every installed pack on its whitelist.
  try:
    with open(os.path.join(BASE, 'comfy.pid')) as f:
      pid = int(f.read().strip())
    os.kill(pid, 15)
    log('restarted ComfyUI to load node packs')
    return True
  except Exception as e:
    log('could not restart ComfyUI: %s' % e)
    return False


def comfy_started():
  # The boot script writes ComfyUI's pid each time it starts it.
  try:
    return os.path.getmtime(os.path.join(BASE, 'comfy.pid'))
  except OSError:
    return None


def files_since(k):
  """When a pack became loadable: its install's end, or later, when the last file it reads as it loads
  was placed. None while one of those files is missing."""
  t = RUNTIMES[k]['endedAt']
  for key in PACKS[k]['before']:
    p = os.path.join(MODELS, key)
    if not os.path.isfile(p):
      return None
    t = max(t, os.path.getmtime(p))
  return t


def load_packs(comfy, queue, now):
  """Moves installed packs to ready once ComfyUI lists their classes. ComfyUI loads custom nodes only when
  it starts, so a pack installed while it runs needs one restart, made only with an empty queue and with
  no other pack still installing, so several packs share it. A pack that reads model files as it loads
  waits for them, and counts as ready only from a ComfyUI that started after they were placed."""
  with LOCK:
    waiting = [k for k, v in RUNTIMES.items() if k in PACKS and v['state'] == 'loading']
    busy = any(k in PACKS and v['state'] == 'installing' for k, v in RUNTIMES.items())
    restarted = S['restarted_at']
  since = {}
  for k in waiting:
    s = files_since(k)
    if s is not None:
      since[k] = s
      continue
    with LOCK:
      fetching = any(DOWNLOADS.get(key, {}).get('state') in ('queued', 'downloading') for key in PACKS[k]['before'])
      if not fetching and now - RUNTIMES[k]['endedAt'] > LOAD_DEADLINE:
        RUNTIMES[k].update(state='failed', error='its model files are not on the Pod')
  if not since or not comfy:
    for k, s in since.items():
      if now - s > LOAD_DEADLINE:
        with LOCK:
          RUNTIMES[k].update(state='failed', error='ComfyUI did not start again to load it')
    return
  started = comfy_started() or restarted or 0
  stale = []
  for k, s in since.items():
    if lists_classes(PACKS[k]['classes']) and (not PACKS[k]['before'] or started > s):
      with LOCK:
        RUNTIMES[k].update(state='ready', error=None)
      log('%s ready' % k)
    elif restarted and restarted > s and now - restarted > RESTART_GRACE:
      # ComfyUI started after the install and still lacks the nodes: the pack failed to import.
      # The grace skips the moment the old ComfyUI still answers.
      with LOCK:
        RUNTIMES[k].update(state='failed', error=comfy_error(PACKS[k]['folder']) or 'ComfyUI did not load it')
      log('%s did not load' % k)
    elif not restarted or restarted < s:
      # Installed (or its files placed) after the last restart, or with none yet: this pack needs one.
      stale.append(k)
  if stale and not busy and queue == 0:
    with LOCK:
      S['restarted_at'] = time.time()
    restart_comfy()


def recheck_packs(comfy, now):
  """A ready pack must still load after each ComfyUI start: a later install (FreeVideo's shared Python env,
  another pack's requirements) can break its import, and runs would then fail with its nodes missing while
  it still shows as ready. A broken pack is marked failed, so the next run that needs it installs it again."""
  started = comfy_started()
  if not comfy or not started or now - started < RESTART_GRACE:
    return
  with LOCK:
    due = [k for k, v in RUNTIMES.items() if k in PACKS and v['state'] == 'ready' and v.get('checkedStart') != started]
  for k in due:
    ok = lists_classes(PACKS[k]['classes'])
    with LOCK:
      if RUNTIMES[k]['state'] != 'ready':
        continue
      RUNTIMES[k]['checkedStart'] = started
      if not ok:
        RUNTIMES[k].update(state='failed', error=comfy_error(PACKS[k]['folder']) or 'ComfyUI no longer loads it')
    if not ok:
      log('%s no longer loads' % k)


def comfy_error(folder):
  # ComfyUI logs a failed custom node import with the folder name.
  try:
    with open(os.path.join(BASE, 'comfy.log'), errors='replace') as f:
      lines = [l.strip() for l in f.readlines()[-400:]]
  except OSError:
    return None
  hits = [l for l in lines if folder in l and re.search(r'fail|error|cannot', l, re.I)]
  return hits[-1][:300] if hits else None


def snapshot():
  now = time.time()
  with LOCK:
    hb = S['hb']
    try:
      disk = shutil.disk_usage(MODELS)
      free, total = disk.free / 1e9, disk.total / 1e9
    except OSError:
      free = total = None
    return {
      'stage': S['stage'], 'ready': S['stage'] == 'ready', 'everReady': S['ready_at'] is not None, 'fatal': S['fatal'],
      'idleSec': int(S['idle']), 'uptimeSec': int(now - BOOTED), 'queue': S['queue'],
      'heartbeatAgeSec': None if hb is None else int(now - hb), 'gpu': S['gpu'],
      'selfTerminateReady': bool(E.get('RUNPOD_POD_ID') and E.get('RUNPOD_API_KEY')),
      'proofDeadline': CFG.get('terminate_at'),
      'diskFreeGb': None if free is None else round(free, 1), 'diskTotalGb': None if total is None else round(total, 1), 'ending': S['ending'],
      'models': models(), 'downloads': {k: dict(v) for k, v in DOWNLOADS.items()}, 'runtimes': runtimes(), 'evicted': list(S['evicted']),
    }


def terminate(reason):
  with LOCK:
    S['ending'] = reason
  log('TERMINATE %s' % reason)
  if E.get('CF_DRY_KILL'):
    with open(os.path.join(BASE, 'terminated'), 'w') as f:
      f.write(reason)
    return
  ok = subprocess.run([BASH, os.path.join(BASE, 'kill-pod.sh'), reason]).returncode == 0
  # A terminate that worked stops this process. Still here later means it failed, whatever the
  # script said, so the watchdog decides again. The app's monitor also terminates from outside.
  time.sleep(90 if ok else 60)
  log('still running after a terminate (%s), trying again' % reason)
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
      # An install downloads and compiles with the GPU idle, so it counts as work.
      work = downloading() or installing()
      S['idle'] = next_idle(S['idle'], gpu and gpu['util'], queue, work, TICK)
      busy = is_busy(queue, work, S.get('leased_at'), time.time())
      state = dict(S, now=time.time(), booted=BOOTED, busy=busy)
      done = S['ending']
    reason = None if done else decide(state, CFG)
    if reason:
      terminate(reason)
    elif not done:
      load_packs(comfy, queue, time.time())
      recheck_packs(comfy, time.time())


SAFE_NAME = re.compile(r'^[\w.+-]+$')
SAFE_REPO = re.compile(r'^[\w.-]+/[\w.-]+$')
SAFE_SHA = re.compile(r'^[0-9a-f]{64}$')


def valid(item):
  path = str(item.get('path', ''))
  return (SAFE_REPO.match(str(item.get('repo', ''))) and item.get('dir') in DIRS and SAFE_NAME.match(str(item.get('name', '')))
          and path and '..' not in path.split('/') and not path.startswith('/')
          and (item.get('sha256') is None or SAFE_SHA.match(str(item['sha256'])))
          and (item.get('bytes') is None or (isinstance(item['bytes'], int) and item['bytes'] >= 0)))


def plain_key(key):
  # A pack's own files sit in subfolders, so the name is what follows the last slash.
  d, _, name = str(key).rpartition('/')
  return d in DIRS and SAFE_NAME.match(name) is not None


def make_room(need, protect):
  """Frees `need` bytes on the volume for new downloads by removing the model files used longest ago,
  never one in `protect` (files a waiting run needs, or downloads in flight). Returns the bytes still
  missing, 0 when it fits. Runs under LOCK."""
  try:
    free = shutil.disk_usage(MODELS).free
  except OSError:
    return 0
  short = need + MARGIN - free
  if short <= 0:
    return 0
  for f in sorted(models(), key=lambda f: f['usedAt']):
    key = '%s/%s' % (f['dir'], f['name'])
    if key in protect:
      continue
    try:
      os.remove(os.path.join(MODELS, f['dir'], f['name']))
    except OSError:
      continue
    DOWNLOADS.pop(key, None)
    USED.pop(key, None)
    S['evicted'] = (S['evicted'] + [{'dir': f['dir'], 'name': f['name'], 'bytes': f['bytes'], 'at': int(time.time())}])[-20:]
    log('removed %s to make room' % key)
    short -= f['bytes']
    if short <= 0:
      break
  save_used()
  return max(0, short)


def fetch(item, key):
  dest = os.path.join(MODELS, item['dir'], item['name'])
  part = dest + '.part'
  # A pack's subfolders are made only when a file goes in: some packs take a folder that exists as complete.
  os.makedirs(os.path.dirname(dest), exist_ok=True)
  # Some repos keep files under names with brackets or spaces; the URL carries them encoded.
  url = '%s/%s/resolve/main/%s' % (HF, item['repo'], urllib.parse.quote(item['path'], safe='/'))
  have = os.path.getsize(part) if os.path.exists(part) else 0
  req = urllib.request.Request(url, headers={'Range': 'bytes=%d-' % have} if have else {})
  digest = hashlib.sha256()
  with urllib.request.urlopen(req, timeout=60) as r:
    if have and r.status != 206:
      have = 0
    if have:
      # A resumed download hashes the bytes it already has first.
      with open(part, 'rb') as old:
        for block in iter(lambda: old.read(1 << 20), b''):
          digest.update(block)
    total = int(r.headers.get('Content-Length') or 0) + have
    with LOCK:
      DOWNLOADS[key].update(state='downloading', bytes=have, total=total or None)
    with open(part, 'ab' if have else 'wb') as f:
      while True:
        chunk = r.read(1 << 20)
        if not chunk:
          break
        f.write(chunk)
        digest.update(chunk)
        with LOCK:
          DOWNLOADS[key]['bytes'] += len(chunk)
  if total and os.path.getsize(part) != total:
    raise IOError('the download stopped at %d of %d bytes' % (os.path.getsize(part), total))
  # A pinned hash makes a mirror safe to use: only the expected bytes are kept.
  if item.get('sha256') and digest.hexdigest() != item['sha256']:
    os.remove(part)
    raise ValueError('the file does not match its pinned sha256')
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
        if attempt == 2 or err == 'disk full' or isinstance(e, ValueError) or (isinstance(e, urllib.error.HTTPError) and e.code in (401, 403, 404)):
          with LOCK:
            DOWNLOADS[key].update(state='failed', error=err)
          log('download failed %s: %s' % (key, err))
          break
        time.sleep(3)


class Server(ThreadingHTTPServer):
  # HTTPServer.server_bind looks up this host's full name (socket.getfqdn), which can stall for
  # many seconds on macOS. Nothing here uses that name.
  def server_bind(self):
    socketserver.TCPServer.server_bind(self)
    self.server_name, self.server_port = self.server_address[:2]


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
    if self.path in ('/log', '/log/comfy'):
      # The boot log, or ComfyUI's own log, where a node's import error or traceback lands.
      name, keep = ('comfy.log', 300) if self.path == '/log/comfy' else ('boot.log', 200)
      try:
        with open(os.path.join(BASE, name), errors='replace') as f:
          lines = f.readlines()[-keep:]
      except OSError:
        lines = []
      return self.reply(200, {'lines': [l.rstrip('\n') for l in lines]})
    self.reply(404, {'error': 'not found'})

  def do_POST(self):
    if not self.authorized():
      return
    if self.path == '/heartbeat':
      # The app sends how many runs it has leased to this Pod; an older app sends no body.
      leases = 0
      try:
        size = int(self.headers.get('Content-Length') or 0)
        leases = int((json.loads(self.rfile.read(size).decode() or '{}') if size else {}).get('leases') or 0)
      except Exception:
        pass
      with LOCK:
        S['hb'] = time.time()
        S['leased_at'] = S['hb'] if leases > 0 else None
      return self.reply(204)
    if self.path == '/download':
      try:
        size = int(self.headers.get('Content-Length') or 0)
        body = json.loads(self.rfile.read(size).decode() or '{}')
        files = body.get('files') or []
      except Exception:
        return self.reply(400, {'error': 'send JSON with a files list'})
      if not isinstance(files, list) or not all(isinstance(f, dict) and valid(f) for f in files):
        return self.reply(400, {'error': 'each file needs a public repo, a path, a known dir and a plain name'})
      # `keep`: files other runs on this Pod still need, which making room must not remove.
      keep = set(k for k in (body.get('keep') or []) if plain_key(k))
      with LOCK:
        now = time.time()
        new = []
        for f in files:
          key = '%s/%s' % (f['dir'], f['name'])
          USED[key] = now
          present = os.path.isfile(os.path.join(MODELS, f['dir'], f['name']))
          if present:
            DOWNLOADS[key] = {'state': 'done', 'bytes': os.path.getsize(os.path.join(MODELS, f['dir'], f['name'])), 'total': None, 'error': None}
          elif DOWNLOADS.get(key, {}).get('state') not in ('queued', 'downloading'):
            new.append((key, f))
        flight = {k for k, v in DOWNLOADS.items() if v['state'] in ('queued', 'downloading')}
        pending = sum(max(0, (v.get('want') or v.get('total') or 0) - v['bytes']) for k, v in DOWNLOADS.items() if k in flight)
        need = pending + sum(f.get('bytes') or 0 for _, f in new)
        short = make_room(need, keep | flight | {'%s/%s' % (f['dir'], f['name']) for f in files}) if new else 0
        for key, f in new:
          if short > 0:
            DOWNLOADS[key] = {'state': 'failed', 'bytes': 0, 'total': None, 'want': f.get('bytes'), 'error': 'disk full', 'shortGb': round(short / 1e9, 1)}
          else:
            DOWNLOADS[key] = {'state': 'queued', 'bytes': 0, 'total': None, 'want': f.get('bytes'), 'error': None}
            WORK.append(f)
        save_used()
        if WORK:
          WAKE.set()
      return self.reply(202, {'downloads': {k: dict(v) for k, v in DOWNLOADS.items()}})
    if self.path.startswith('/runtime/'):
      name = self.path[len('/runtime/'):]
      if name not in RUNTIME_HOMES and name not in PACKS:
        return self.reply(404, {'error': 'unknown runtime'})
      return self.reply(202, {'runtime': dict(want_runtime(name), pack=name in PACKS)})
    self.reply(404, {'error': 'not found'})

  def do_DELETE(self):
    # Removes one model file to free the disk. A download in flight is not removed.
    if not self.authorized():
      return
    key = urllib.parse.unquote(self.path[len('/models/'):]) if self.path.startswith('/models/') else ''
    if not plain_key(key):
      return self.reply(404, {'error': 'not found'})
    path = os.path.join(MODELS, *key.rpartition('/')[::2])
    with LOCK:
      if DOWNLOADS.get(key, {}).get('state') in ('queued', 'downloading'):
        return self.reply(409, {'error': 'it is still downloading'})
      if not os.path.isfile(path):
        return self.reply(404, {'error': 'not on the Pod'})
      os.remove(path)
      DOWNLOADS.pop(key, None)
      USED.pop(key, None)
      save_used()
    log('removed %s' % key)
    return self.reply(204)


def main():
  if not TOKEN:
    raise SystemExit('POD_TOKEN is not set')
  os.makedirs(BASE, exist_ok=True)
  for d in DIRS:
    if '/' not in d:
      os.makedirs(os.path.join(MODELS, d), exist_ok=True)
  for target in (watchdog, downloader):
    threading.Thread(target=target, daemon=True).start()
  log('starting on port %d' % PORT)
  # Bind first, so the log line means the port answers.
  server = Server(('0.0.0.0', PORT), Handler)
  log('status server on port %d' % PORT)
  server.serve_forever()


if __name__ == '__main__':
  main()
