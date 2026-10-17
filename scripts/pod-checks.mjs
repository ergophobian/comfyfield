// Pod checks: the boot script, the status server, the lifecycle and Pod runs. No call leaves this machine.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { test } from 'node:test'
import { podBootScript, podStartCmd, podEnv, START_CMD_MAX } from '../server/podBoot.js'

fs.mkdirSync('outputs', { recursive: true })
const tmp = fs.mkdtempSync(path.resolve('outputs/pod-check-'))
const statusd = path.resolve('server/pod-statusd.py')

// The first Python 3 on this machine, or null. CI images all have one.
function findPython() {
  const tries = [[process.env.PYTHON], ['python3'], ['python'], ['py', '-3']].filter(([c]) => c)
  for (const [cmd, ...pre] of tries) {
    const r = spawnSync(cmd, [...pre, '-c', 'import sys; print(sys.version_info[:2] >= (3, 9))'], { encoding: 'utf8' })
    if (r.status === 0 && r.stdout.trim() === 'True') return [cmd, ...pre]
  }
  return null
}
const python = findPython()

const listen = (handler) => new Promise((resolve) => {
  const server = http.createServer(handler).listen(0, '127.0.0.1', () => resolve(server))
})
const until = async (fn, ms = 8000) => {
  const end = Date.now() + ms
  for (;;) {
    const v = await fn().catch(() => null)
    if (v) return v
    if (Date.now() > end) throw new Error('timed out waiting')
    await new Promise((r) => setTimeout(r, 100))
  }
}

await test('boot script: start command fits, decodes and holds no secrets', () => {
  const script = podBootScript()
  const cmd = podStartCmd(script)
  assert.equal(cmd[0], 'bash')
  assert(Buffer.byteLength(cmd[2]) < START_CMD_MAX)
  const b64 = /^echo (\S+) \| base64 -d/.exec(cmd[2])[1]
  assert.equal(gunzipSync(Buffer.from(b64, 'base64')).toString(), script)
  assert(!/set -x/.test(script), 'no xtrace, the boot log is served')
  assert(!/RUNPOD_API_KEY=|POD_TOKEN=/.test(script), 'secrets come from the Pod env only')
  assert(/--listen 127\.0\.0\.1 --port 8188/.test(script), 'raw ComfyUI stays private')
  assert(/--port 8189 --token "\$POD_TOKEN"/.test(script), 'the proxy needs the token')
  assert(/comfy-api-proxy==0\.1\.6/.test(script))
  assert(/podTerminate/.test(script.split('runpodctl')[0]), 'GraphQL is tried before runpodctl and REST')
  assert.throws(() => podStartCmd(randomBytes(80_000).toString('base64')), /65536-byte limit/)
})

await test('boot script: env carries the token and timers, the app guard fires first', () => {
  assert.throws(() => podEnv({}), /token/)
  const env = podEnv({ token: 't' })
  assert.equal(env.POD_TOKEN, 't')
  assert.equal(env.IDLE_AFTER, '780')
  assert.equal(env.HEARTBEAT_DEADLINE, '600')
  assert(!('RUNPOD_API_KEY' in env))
})

await test('status server: watchdog rules', { skip: !python && 'no Python 3.9+ found' }, () => {
  const code = `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('statusd', sys.argv[1])
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
cfg = dict(idle_after=780, heartbeat_deadline=600, max_life=7200, drain_grace=1800, boot_deadline=900, fatal_grace=180)
base = dict(now=10000, booted=10000 - 1000, ready_at=9500, hb=9990, idle=0, busy=False, fatal=None, fatal_at=None)
def d(**k): return m.decide(dict(base, **k), cfg)
print(json.dumps({
  'healthy': d(),
  'fatalEarly': d(fatal='model download', fatal_at=9900),
  'fatalLate': d(fatal='model download', fatal_at=9800),
  'bootDeadline': d(ready_at=None, booted=10000 - 900),
  'lifetime': d(booted=10000 - 7200),
  'lifetimeBusy': d(booted=10000 - 7200, busy=True),
  'lifetimeBusyOver': d(booted=10000 - 9000, busy=True),
  'noHeartbeat': d(hb=10000 - 600),
  'noHeartbeatBusy': d(hb=10000 - 600, busy=True),
  'neverBeaten': d(hb=None, ready_at=10000 - 600),
  'idle': d(idle=780),
  'nextIdle': [m.next_idle(30, 0, 0, False, 15), m.next_idle(30, 5, 0, False, 15), m.next_idle(30, None, 0, False, 15), m.next_idle(30, 0, None, False, 15), m.next_idle(30, 0, 0, True, 15)],
}))`
  const r = spawnSync(python[0], [...python.slice(1), '-c', code, statusd], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  const out = JSON.parse(r.stdout)
  assert.equal(out.healthy, null)
  assert.equal(out.fatalEarly, null, 'a fatal stays readable during its grace')
  assert.equal(out.fatalLate, 'fatal: model download')
  assert.match(out.bootDeadline, /not ready after 15 minutes/)
  assert.match(out.lifetime, /lifetime limit of 120 minutes/)
  assert.equal(out.lifetimeBusy, null, 'a busy queue gets the drain grace')
  assert.match(out.lifetimeBusyOver, /lifetime/)
  assert.match(out.noHeartbeat, /no heartbeat for 10 minutes/)
  assert.equal(out.noHeartbeatBusy, null)
  assert.match(out.neverBeaten, /no heartbeat since it became ready/)
  assert.match(out.idle, /idle for 13 minutes/)
  assert.deepEqual(out.nextIdle, [45, 0, 0, 0, 0], 'only a known-idle GPU and queue count; unknown is busy')
})

await test('status server: auth, status, heartbeat, downloads and a boot-deadline terminate', { skip: !python && 'no Python 3.9+ found' }, async (t) => {
  const body = Buffer.alloc(3 * 1024 * 1024, 7)
  const hf = await listen((req, res) => {
    if (req.url === '/org/model/resolve/main/sub/weights.safetensors') {
      res.writeHead(200, { 'Content-Length': body.length })
      return res.end(body)
    }
    res.writeHead(404).end()
  })
  const port = 20000 + Math.floor(Math.random() * 20000)
  const base = path.join(tmp, 'statusd')
  const proc = spawn(python[0], [...python.slice(1), statusd], {
    env: {
      ...process.env, POD_TOKEN: 'secret', CF_BASE: base, CF_MODELS: path.join(base, 'models'), CF_STATUS_PORT: String(port),
      CF_COMFY_URL: 'http://127.0.0.1:9', CF_PROXY_URL: 'http://127.0.0.1:9', CF_HF_BASE: `http://127.0.0.1:${hf.address().port}`,
      CF_TICK: '0.2', BOOT_DEADLINE: '2', CF_DRY_KILL: '1',
    },
    stdio: 'ignore',
  })
  t.after(() => { proc.kill(); hf.close() })
  const url = `http://127.0.0.1:${port}`
  const auth = { Authorization: 'Bearer secret' }
  await until(async () => (await fetch(`${url}/status`)).status === 401)
  assert.equal((await fetch(`${url}/status`, { headers: { Authorization: 'Bearer wrong' } })).status, 401)

  const s = await (await fetch(`${url}/status`, { headers: auth })).json()
  for (const k of ['stage', 'ready', 'fatal', 'idleSec', 'uptimeSec', 'queue', 'heartbeatAgeSec', 'gpu', 'diskFreeGb', 'models', 'downloads']) assert(k in s, k)
  assert.equal(s.stage, 'boot')
  assert.equal(s.ready, false)
  assert.equal(s.heartbeatAgeSec, null)

  assert.equal((await fetch(`${url}/heartbeat`, { method: 'POST', headers: auth })).status, 204)
  assert.equal((await (await fetch(`${url}/status`, { headers: auth })).json()).heartbeatAgeSec, 0)

  const post = (files) => fetch(`${url}/download`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ files }) })
  assert.equal((await post([{ repo: 'org/model', path: '../etc/passwd', dir: 'checkpoints', name: 'x.safetensors' }])).status, 400)
  assert.equal((await post([{ repo: 'org/model', path: 'a.safetensors', dir: 'nowhere', name: 'x.safetensors' }])).status, 400)
  assert.equal((await post([{ repo: 'org/model', path: 'sub/weights.safetensors', dir: 'checkpoints', name: 'weights.safetensors' },
    { repo: 'org/model', path: 'missing.safetensors', dir: 'vae', name: 'missing.safetensors' }])).status, 202)
  const done = await until(async () => {
    const d = (await (await fetch(`${url}/status`, { headers: auth })).json())
    const a = d.downloads['checkpoints/weights.safetensors']
    const b = d.downloads['vae/missing.safetensors']
    return a?.state === 'done' && b?.state === 'failed' && d
  })
  assert.equal(fs.statSync(path.join(base, 'models/checkpoints/weights.safetensors')).size, body.length)
  assert.deepEqual(done.models.map((m) => `${m.dir}/${m.name}`), ['checkpoints/weights.safetensors'])
  assert.match(done.downloads['vae/missing.safetensors'].error, /404/)

  // ComfyUI never answers, so the boot deadline terminates the Pod (recorded, not executed).
  const reason = await until(async () => fs.existsSync(path.join(base, 'terminated')) && fs.readFileSync(path.join(base, 'terminated'), 'utf8'))
  assert.match(reason, /not ready after/)
})
