// Pod checks: the boot script, the status server, the lifecycle and Pod runs. No call leaves this machine.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { test } from 'node:test'
import { podBootScript, podStartCmd, podEnv, START_CMD_MAX, POD_IMAGE } from '../server/podBoot.js'
import { podManager, GPU_LADDER, NO_POD } from '../server/pod.js'
import { sandboxFetch } from '../server/podSandbox.js'
import { modelFilesOf, minVramOf, volumeFor, runtimesOf, podNeedsOf, MODEL_FILES } from '../shared/modelFiles.js'

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
// Later checks stub globalThis.fetch; checks that talk to a real local server keep this one.
const netFetch = globalThis.fetch

const listen = (handler) => new Promise((resolve) => {
  const server = http.createServer(handler).listen(0, '127.0.0.1', () => resolve(server))
})
// Below Linux's ephemeral ports (32768 up): polling a port nobody listens on there can make a socket
// connect to itself, which hangs the request and takes the port from the server.
const freePort = () => 20000 + Math.floor(Math.random() * 12000)
// Runs the status server and keeps its stderr. Requests wait until it has bound its port. A check
// that times out says which wait failed, how long it took, the last request error, the server's log
// and its stderr.
function startStatusd(env) {
  const proc = spawn(python[0], [...python.slice(1), statusd], { env: { ...process.env, ...env }, stdio: ['ignore', 'ignore', 'pipe'] })
  proc.err = ''
  proc.stderr.on('data', (d) => { proc.err += d })
  proc.on('exit', (code, signal) => { proc.ended = `exited (${signal || code})` })
  const readLog = () => fs.promises.readFile(path.join(env.CF_BASE, 'statusd.log'), 'utf8').catch(() => '')
  proc.ready = async (url, ok) => {
    const t0 = Date.now()
    let stage = 'bind its port'
    let last = null
    try {
      await until(async () => (await readLog()).includes('status server on port'))
      stage = `answer ${url}/status`
      await until(async () => { try { return await ok() } catch (e) { last = e.cause?.code || e.cause?.message || e.message; return false } })
    } catch {
      throw new Error(`The status server did not ${stage} within ${Math.round((Date.now() - t0) / 100) / 10} s${last ? ` (last request: ${last})` : ''}; it ${proc.ended || 'is still running'}.`
        + ` Its log: ${(await readLog()).trim().slice(-800) || 'empty'}. Its stderr: ${proc.err.trim().slice(-800) || 'empty'}`)
    }
  }
  return proc
}
const until = async (fn, ms = 8000) => {
  const end = Date.now() + ms
  for (;;) {
    const v = await fn().catch(() => null)
    if (v) return v
    if (Date.now() > end) throw new Error('timed out waiting')
    await new Promise((r) => setTimeout(r, 100))
  }
}

await test('image: pinned to a commit tag or a digest, never :latest', () => {
  assert(!/:latest$/.test(POD_IMAGE), `POD_IMAGE must not float on :latest: ${POD_IMAGE}`)
  assert(/^ghcr\.io\/bchenner\/patchwork-comfy(:[0-9a-f]{40})?(@sha256:[0-9a-f]{64})?$/.test(POD_IMAGE)
    && /[:@]/.test(POD_IMAGE.split('/').pop()), `POD_IMAGE needs a commit tag or an @sha256 digest: ${POD_IMAGE}`)
})

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
  assert(script.includes('checkout --quiet 45bf90d1c91eecd782643346dcfb73cb0017667f'), 'ComfyUI is pinned to v0.41.1 by commit')
  assert(script.indexOf('STAGE comfy-update') < script.indexOf('main.py'), 'ComfyUI moves before it starts')
  assert(/main\.py [^\n]*--disable-all-custom-nodes/.test(script))
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

await test('status server: binds its port without a hostname lookup', { skip: !python && 'no Python 3.9+ found' }, () => {
  // On macOS a hostname lookup in the bind stalled the status server for more than 8 s on CI.
  const code = `
import importlib.util, socket, sys
spec = importlib.util.spec_from_file_location('statusd', sys.argv[1])
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
def no_lookup(*a): raise RuntimeError('hostname lookup')
socket.getfqdn = no_lookup
s = m.Server(('127.0.0.1', 0), m.Handler)
print(s.server_address[1] > 0)
s.server_close()`
  const r = spawnSync(python[0], [...python.slice(1), '-c', code, statusd], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout.trim(), 'True')
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
  const port = freePort()
  const base = path.join(tmp, 'statusd')
  const proc = startStatusd({
    POD_TOKEN: 'secret', CF_BASE: base, CF_MODELS: path.join(base, 'models'), CF_STATUS_PORT: String(port),
    CF_COMFY_URL: 'http://127.0.0.1:9', CF_PROXY_URL: 'http://127.0.0.1:9', CF_HF_BASE: `http://127.0.0.1:${hf.address().port}`,
    CF_TICK: '0.2', BOOT_DEADLINE: '2', CF_DRY_KILL: '1',
  })
  t.after(() => { proc.kill(); hf.close() })
  const url = `http://127.0.0.1:${port}`
  const auth = { Authorization: 'Bearer secret' }
  await proc.ready(url, async () => (await fetch(`${url}/status`)).status === 401)
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
  assert.equal((await post([{ repo: 'org/model', path: 'a.safetensors', dir: 'vae', name: 'x.safetensors', sha256: 'not-a-hash' }])).status, 400)
  const sha256 = createHash('sha256').update(body).digest('hex')
  assert.equal((await post([{ repo: 'org/model', path: 'sub/weights.safetensors', dir: 'checkpoints', name: 'weights.safetensors', sha256 },
    { repo: 'org/model', path: 'missing.safetensors', dir: 'vae', name: 'missing.safetensors' },
    // Same bytes, wrong pinned hash: what a tampered mirror would look like.
    { repo: 'org/model', path: 'sub/weights.safetensors', dir: 'loras', name: 'tampered.safetensors', sha256: '0'.repeat(64) }])).status, 202)
  const done = await until(async () => {
    const d = (await (await fetch(`${url}/status`, { headers: auth })).json())
    const a = d.downloads['checkpoints/weights.safetensors']
    const b = d.downloads['vae/missing.safetensors']
    const c = d.downloads['loras/tampered.safetensors']
    return a?.state === 'done' && b?.state === 'failed' && c?.state === 'failed' && d
  }, 15000)
  assert.equal(fs.statSync(path.join(base, 'models/checkpoints/weights.safetensors')).size, body.length)
  assert.deepEqual(done.models.map((m) => `${m.dir}/${m.name}`), ['checkpoints/weights.safetensors'], 'the tampered file is not kept')
  assert.match(done.downloads['vae/missing.safetensors'].error, /404/)
  assert.match(done.downloads['loras/tampered.safetensors'].error, /does not match its pinned sha256/)
  assert(!fs.existsSync(path.join(base, 'models/loras/tampered.safetensors.part')))

  // ComfyUI never answers, so the boot deadline terminates the Pod (recorded, not executed).
  const reason = await until(async () => fs.existsSync(path.join(base, 'terminated')) && fs.readFileSync(path.join(base, 'terminated'), 'utf8'))
  assert.match(reason, /not ready after/)
})

// ---- lifecycle -------------------------------------------------------------------------------------

const reply = (data, status = 200) => new Response(data == null ? null : JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
const readyStatus = (extra = {}) => ({ stage: 'ready', ready: true, everReady: true, fatal: null, idleSec: 0, queue: 0, models: [], downloads: {}, ...extra })

// A programmable RunPod and Pod. `statusd` is what the Pod's /status answers, or null for no answer.
function fakeRunpod(clock) {
  const f = { calls: [], pods: new Map(), create: [], listExtra: [], statusd: null, startReply: null }
  f.fetch = async (url, init = {}) => {
    const u = new URL(url)
    const method = init.method || 'GET'
    const body = init.body ? JSON.parse(init.body) : null
    f.calls.push({ host: u.host, path: u.pathname, method, body, auth: init.headers?.Authorization })
    if (u.host === 'rest.runpod.io') {
      const [, , , id, verb] = u.pathname.split('/')
      if (!id && method === 'POST') {
        const next = f.create.shift()
        next?.then?.()
        if (next?.status) return reply(next.data, next.status)
        const pod = { id: `pod${f.pods.size + 1}`, name: body.name, desiredStatus: 'RUNNING', costPerHr: 0.5, env: body.env, createdAt: new Date(clock.t).toISOString() }
        f.pods.set(pod.id, pod)
        return reply(pod, 201)
      }
      if (!id) return reply([...f.pods.values(), ...f.listExtra])
      const pod = f.pods.get(id) || f.listExtra.find((p) => p.id === id)
      if (!pod || pod.desiredStatus === 'TERMINATED') return reply({ error: 'pod not found' }, 404)
      if (method === 'DELETE') { pod.desiredStatus = 'TERMINATED'; return reply(null, 204) }
      if (verb === 'stop') { pod.desiredStatus = 'EXITED'; return reply(pod) }
      if (verb === 'start') { if (f.startReply) return reply(...f.startReply); pod.desiredStatus = 'RUNNING'; return reply(pod) }
      // A held reply carries the state from when it was asked, like a slow answer from RunPod.
      const snap = { ...pod }
      if (f.hold) await f.hold
      return reply(snap)
    }
    if (u.host === 'api.runpod.io') return reply({ data: { myself: { id: 'me' } } })
    if (u.pathname === '/heartbeat') return reply(null, 204)
    if (u.pathname === '/download') return reply({ downloads: {} }, 202)
    if (u.pathname.startsWith('/runtime/')) return reply({ runtime: { state: 'installing', error: null, sec: 0 } }, 202)
    return f.statusd ? reply(f.statusd) : reply({ error: 'not reachable' }, 502)
  }
  f.count = (pred) => f.calls.filter(pred).length
  return f
}

function setup({ key = 'acct-key', cap, idle, at = '2026-10-17T10:00:00' } = {}) {
  const dir = fs.mkdtempSync(path.join(tmp, 'pod-'))
  const clock = { t: Date.parse(at) }
  const rp = fakeRunpod(clock)
  const opts = { fetch: rp.fetch, now: () => clock.t, keys: () => ({ key, cap, idle }), dir: () => dir, owner: true, wait: async () => { clock.t += 3000; await opts.onWait?.() } }
  const make = () => podManager(opts)
  return { dir, clock, rp, opts, make, pod: make() }
}

await test('lifecycle: start walks the ladder on capacity refusals only, and sends no account key to the Pod', async () => {
  const { pod, rp } = setup()
  await assert.rejects(setup({ key: '' }).pod.start(), /Add your RunPod key/)
  rp.create.push({ status: 500, data: { error: 'create pod: There are no instances currently available' } })
  const s = await pod.start({ minVramGb: 24, volumeGb: 18 })
  assert.equal(s.phase, 'starting')
  assert.equal(s.stage, 'waiting')
  assert.equal(s.pod.gpu, 'RTX PRO 4500')
  const creates = rp.calls.filter((c) => c.path === '/v1/pods' && c.method === 'POST')
  assert.deepEqual(creates.map((c) => c.body.gpuTypeIds[0]), [GPU_LADDER[0].gpuTypeId, GPU_LADDER[1].gpuTypeId])
  const b = creates[1].body
  assert.equal(b.cloudType, 'SECURE')
  assert.deepEqual(b.ports, ['8189/http', '8190/http'])
  assert.equal(b.volumeInGb, 120, 'room for two of the newest video models')
  assert.equal(b.volumeMountPath, '/workspace')
  assert(!('allowedCudaVersions' in b))
  assert.equal(b.env.POD_TOKEN.length, 48)
  assert(!JSON.stringify(b).includes('acct-key'), 'the account key never goes to the Pod')
  assert(creates.every((c) => c.auth === 'Bearer acct-key'))
  await assert.rejects(pod.start(), (e) => e.status === 409 && /one Pod at a time/.test(e.message))
})

await test('lifecycle: a VRAM floor skips small GPUs; a key error stops the walk; all refused names it', async () => {
  const a = setup()
  await a.pod.start({ minVramGb: 64 })
  assert.equal(a.rp.calls.find((c) => c.method === 'POST').body.gpuTypeIds[0], 'NVIDIA RTX PRO 6000 Blackwell Server Edition')
  const b = setup()
  b.rp.create.push({ status: 401, data: { error: 'unauthorized' } })
  await assert.rejects(b.pod.start(), /RunPod rejected the API key/)
  assert.equal(b.rp.count((c) => c.method === 'POST'), 1)
  const c = setup()
  for (const _ of GPU_LADDER) c.rp.create.push({ status: 500, data: { error: 'This machine does not have the resources to deploy your pod' } })
  await assert.rejects(c.pod.start(), (e) => e.code === 'no_capacity' && /tried 6 GPUs/.test(e.message))
  assert.equal(c.pod.status().phase, 'none')
})

await test('lifecycle: a 5xx that still created a Pod is found and adopted', async () => {
  const { pod, rp } = setup()
  const ghost = { id: 'ghost', name: 'comfyfield-x', desiredStatus: 'RUNNING', costPerHr: 0.5, env: { POD_TOKEN: 'tok' }, createdAt: new Date().toISOString() }
  rp.create.push({ status: 502, data: { error: 'bad gateway' }, then: () => rp.listExtra.push(ghost) })
  const s = await pod.start()
  assert.equal(s.pod.id, 'ghost')
  assert.equal(s.stage, 'waiting')
  assert.equal(rp.count((c) => c.method === 'POST' && c.host === 'rest.runpod.io'), 1, 'no second Pod')
})

await test('lifecycle: phases, heartbeats with the Pod token, and spend', async () => {
  const { pod, rp, clock } = setup()
  await pod.start()
  rp.statusd = { stage: 'boot', ready: false, queue: null, models: [], downloads: {} }
  assert.equal((await pod.tick()).stage, 'booting')
  rp.statusd = readyStatus()
  clock.t += 3_600_000
  const s = await pod.tick()
  assert.equal(s.phase, 'ready')
  const beat = rp.calls.findLast((c) => c.path === '/heartbeat')
  assert.equal(beat.host, 'pod1-8190.proxy.runpod.net')
  assert.notEqual(beat.auth, 'Bearer acct-key')
  assert(Math.abs(s.spend.today - 0.5) < 0.01, `one hour at $0.50, got ${s.spend.today}`)
})

await test('lifecycle: the daily cap refuses a new Pod but leaves a running one alone', async () => {
  const { pod, rp, clock } = setup({ cap: '1' })
  await pod.start()
  rp.statusd = readyStatus({ queue: 1 })
  clock.t += 149 * 60_000 // busy for 2 h 29 min at $0.50 is over the $1 cap
  await pod.tick()
  assert.equal(pod.status().phase, 'ready', 'the cap does not stop a running Pod')
  await pod.terminate({ now: true })
  await assert.rejects(pod.start(), (e) => e.status === 402 && /Daily cap reached: \$1\.24 of \$1\.00/.test(e.message))
})

await test('lifecycle: guards terminate an idle, silent, failed or old Pod, but not a busy one', async () => {
  const idle = setup()
  await idle.pod.start()
  idle.rp.statusd = readyStatus({ idleSec: 590 })
  assert.equal((await idle.pod.tick()).phase, 'ready')
  idle.rp.statusd = readyStatus({ idleSec: 600 })
  const run = await idle.pod.lease()
  assert.equal((await idle.pod.tick()).phase, 'ready', 'a run holds the Pod')
  run.release()
  const s = await idle.pod.tick()
  assert.equal(s.phase, 'none')
  assert.equal(s.event.text, 'Terminated after 10 idle minutes.')
  assert.equal(idle.rp.count((c) => c.method === 'DELETE'), 1)

  const dark = setup()
  await dark.pod.start()
  dark.clock.t += 19 * 60_000
  assert.equal((await dark.pod.tick()).phase, 'starting')
  dark.clock.t += 60_000
  assert.match((await dark.pod.tick()).event.text, /did not answer for 20 minutes/)

  const fatal = setup()
  await fatal.pod.start()
  fatal.rp.statusd = { stage: 'boot', ready: false, fatal: 'could not install comfy-api-proxy', models: [], downloads: {} }
  assert.match((await fatal.pod.tick()).event.text, /failed to start: could not install comfy-api-proxy/)

  const slow = setup()
  await slow.pod.start()
  slow.rp.statusd = { stage: 'comfy', ready: false, queue: null, models: [], downloads: {} }
  slow.clock.t += 25 * 60_000
  assert.match((await slow.pod.tick()).event.text, /not ready after 25 minutes/)

  const old = setup()
  await old.pod.start()
  old.rp.statusd = readyStatus({ queue: 2 })
  old.clock.t += 121 * 60_000
  assert.equal((await old.pod.tick()).phase, 'ready', 'a busy queue gets 30 more minutes')
  old.clock.t += 30 * 60_000
  assert.match((await old.pod.tick()).event.text, /2-hour limit/)
})

await test('lifecycle: Pause and Terminate end after the queue, or now; Keep cancels the end', async () => {
  const { pod, rp } = setup()
  await pod.start()
  rp.statusd = readyStatus()
  await pod.tick()
  const run = await pod.lease()
  assert.equal((await pod.pause()).phase, 'ending')
  assert.equal(pod.status().ending, 'pause')
  await assert.rejects(pod.lease(), /ending after its queue/)
  assert.equal(pod.keep().phase, 'ready')
  await pod.pause()
  await pod.tick()
  assert.equal(pod.status().phase, 'ending', 'still one run')
  run.release()
  const s = await pod.tick()
  assert.equal(s.phase, 'paused')
  assert.equal(s.event.text, 'Paused after the queue finished.')
  assert.equal(rp.count((c) => c.path.endsWith('/stop')), 1)
  await assert.rejects(pod.lease(), (e) => e.code === 'paused' && e.message === NO_POD)

  assert.equal((await pod.resume()).phase, 'starting')
  rp.statusd = readyStatus()
  await pod.tick()
  const live = await pod.lease()
  await pod.terminate({ now: true })
  assert.equal(live.signal.aborted, true)
  assert.equal(live.reason(), 'You terminated the Pod.')
  assert.equal(pod.status().phase, 'none')
})

await test('lifecycle: a paused Pod charges disk only, and a resume without a GPU says what to do', async () => {
  const { pod, rp, clock, dir } = setup()
  await pod.start({ volumeGb: 100 }) // the 120 GB floor applies
  rp.statusd = readyStatus()
  await pod.tick()
  await pod.pause({ now: true })
  assert(pod.status().spend.today < 0.01)
  clock.t += 24 * 3_600_000
  await pod.tick()
  const days = JSON.parse(fs.readFileSync(path.join(dir, 'pod-ledger.json'), 'utf8')).days
  const total = Object.values(days).reduce((n, v) => n + v, 0)
  assert(total > 0.75 && total < 0.83, `120 GB stopped for a day is about $0.79, got ${total}`)
  assert(Math.abs(pod.spentToday() - total * (10 / 24)) < 0.01, 'the 10 hours after midnight land on the new day')
  rp.startReply = [{ error: 'There are not enough free GPUs on the host machine to start this pod.' }, 500]
  await assert.rejects(pod.resume(), (e) => e.code === 'resume_no_gpu' && /Terminate it and start a new Pod/.test(e.message))
  assert.equal(pod.status().phase, 'paused')
})

await test('lifecycle: a restarted server adopts its Pod, and a lost pod.json is recovered by name', async () => {
  const a = setup()
  await a.pod.start()
  a.rp.statusd = readyStatus()
  await a.pod.tick()
  a.clock.t += 30 * 60_000 // the server was down for half an hour
  const s = await a.make().tick()
  assert.equal(s.phase, 'ready')
  assert(Math.abs(s.spend.today - 0.25) < 0.01, `the gap is charged, got ${s.spend.today}`)

  const b = setup()
  b.rp.listExtra.push({ id: 'lost', name: 'comfyfield-abc', desiredStatus: 'RUNNING', costPerHr: 0.7, env: { POD_TOKEN: 'tok' }, createdAt: new Date(b.clock.t).toISOString() })
  b.rp.statusd = readyStatus()
  assert.equal((await b.pod.tick()).pod.id, 'lost')
  assert.equal(b.rp.calls.findLast((c) => c.path === '/heartbeat').auth, 'Bearer tok')
})

await test('lifecycle: a lease waits for a starting Pod, downloads missing files and reports failures', async () => {
  await assert.rejects(setup().pod.lease(), (e) => e.code === 'no_pod' && e.message === NO_POD)

  const { pod, rp, opts } = setup()
  await pod.start()
  let waits = 0
  opts.onWait = () => {
    if (++waits === 2) rp.statusd = readyStatus({ models: [{ dir: 'vae', name: 'have.safetensors', bytes: 1 }] })
    if (waits === 4) rp.statusd = readyStatus({ downloads: { 'checkpoints/a.safetensors': { state: 'done' } } })
  }
  const stages = []
  const files = [{ repo: 'org/a', path: 'a.safetensors', dir: 'checkpoints', name: 'a.safetensors', gb: 7 }, { repo: 'org/b', path: 'have.safetensors', dir: 'vae', name: 'have.safetensors' }]
  const l = await pod.lease({ files, onStage: (s) => stages.push(s) })
  assert.deepEqual([...new Set(stages)], ['waiting', 'downloading', 'running'])
  const dl = rp.calls.find((c) => c.path === '/download')
  assert.deepEqual(dl.body.files, [{ repo: 'org/a', path: 'a.safetensors', dir: 'checkpoints', name: 'a.safetensors', bytes: 7e9 }], 'only the missing file, with its size for making room')
  assert.equal(l.baseUrl, 'https://pod1-8189.proxy.runpod.net')
  assert.equal(l.token.length, 48)
  l.release()

  rp.statusd = readyStatus({ downloads: { 'checkpoints/b.safetensors': { state: 'failed', error: 'HTTP Error 404: Not Found' } } })
  await assert.rejects(pod.lease({ files: [{ repo: 'org/b', path: 'b.safetensors', dir: 'checkpoints', name: 'b.safetensors' }] }), /Could not download b\.safetensors to the Pod: HTTP Error 404/)
  rp.statusd = readyStatus({ downloads: { 'checkpoints/c.safetensors': { state: 'failed', error: 'disk full' } } })
  await assert.rejects(pod.lease({ files: [{ repo: 'org/c', path: 'c.safetensors', dir: 'checkpoints', name: 'c.safetensors' }] }), /disk is too small for this run. Remove models on the Pods page, or start a Pod with a bigger disk/)
  assert.equal(pod.status().runs, 0, 'failed leases release themselves')
})

await test('lifecycle: the sandbox runs a whole Pod life without RunPod', async () => {
  const dir = fs.mkdtempSync(path.join(tmp, 'sandbox-'))
  const clock = { t: Date.now() }
  const net = sandboxFetch({ file: () => path.join(dir, 'pod-sandbox.json'), now: () => clock.t, mode: '1' })
  const pod = podManager({ fetch: net, now: () => clock.t, keys: () => ({ key: 'sandbox' }), dir: () => dir, sandbox: true, owner: true, wait: async () => { clock.t += 3000 } })
  assert.equal((await pod.quote({ minVramGb: 24 })).rungs[0].usdPerHr, 0.7)
  assert.equal((await pod.start()).stage, 'waiting')
  clock.t += 5000
  assert.equal((await pod.tick()).stage, 'booting')
  clock.t += 12000
  assert.equal((await pod.tick()).phase, 'ready')
  const l = await pod.lease({ files: [{ repo: 'org/a', path: 'a.safetensors', dir: 'checkpoints', name: 'a.safetensors' }] })
  l.release()
  assert.equal((await pod.pause({ now: true })).phase, 'paused')
  assert.equal((await pod.resume()).phase, 'starting')
  assert.equal((await pod.terminate({ now: true })).phase, 'none')
})

// ---- runs on the Pod -------------------------------------------------------------------------------

await test('runs: model files come from the loader nodes and the file list', () => {
  const read = (n) => JSON.parse(fs.readFileSync(`public/workflows/${n}.json`, 'utf8'))
  assert.deepEqual(modelFilesOf(read('image_sdxl')).map((f) => `${f.dir}/${f.name}`), ['checkpoints/sd_xl_base_1.0.safetensors'])
  const ltx = modelFilesOf(read('ltx_i2v'))
  assert.deepEqual(ltx.map((f) => `${f.dir}/${f.name}`), ['checkpoints/ltx-video-2b-v0.9.5.safetensors', 'text_encoders/t5xxl_fp16.safetensors'])
  assert.equal(minVramOf(ltx), 16)
  assert.equal(volumeFor(ltx), 47)
  assert.deepEqual(modelFilesOf({ 1: { class_type: 'MinimaxHailuo03FirstLastFrameNode', inputs: {} } }), [], 'a partner node needs no files')
  assert.throws(() => modelFilesOf({ 1: { class_type: 'UNETLoader', inputs: { unet_name: 'mystery.safetensors' } } }), /mystery\.safetensors is not in ComfyField's model list, so a Pod cannot download it/)
  assert.throws(() => modelFilesOf({ 1: { class_type: 'VAELoader', inputs: { vae_name: 'sd_xl_base_1.0.safetensors' } } }), /loads sd_xl_base_1\.0\.safetensors from vae/)
  assert.deepEqual(modelFilesOf({ 1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: '{{ckpt}}' } } }), [], 'placeholders wait for the filled graph')
  for (const w of fs.readdirSync('public/workflows')) modelFilesOf(read(w.replace(/\.json$/, ''))) // every bundled workflow can run on a Pod
  for (const [name, f] of Object.entries(MODEL_FILES)) assert(/^[\w.-]+\/[\w.-]+$/.test(f.repo) && /^[\w.+-]+$/.test(name), name)
})

const core = await import('../server/core.js')
const jsonReply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
function podMode(values = { key: 'comfy-key' }) {
  process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.join(tmp, 'run-'))
  for (const k of ['COMFY_API_KEY', 'COMFY_URL', 'COMFY_MODE', 'COMFY_BASE_URL', 'RUNPOD_API_KEY']) process.env[k] = ''
  core.saveConnection('comfy', values)
}
// The Pod-path checks below run as if a Pod were ready.
const ready = async () => 'ready'
const sdxl = { prompt: 'A fox', width: 1024, height: 1024, count: 1, seed: 7 }

await test('runs: the Pod runs a workflow through the real SDK with the Pod token, and the Comfy key only pays partner nodes', async () => {
  podMode()
  let released = 0
  const lease = async ({ files }) => {
    assert.deepEqual(files.map((f) => f.name), ['sd_xl_base_1.0.safetensors'])
    return { baseUrl: 'https://pod1-8189.proxy.runpod.net', token: 'pod-token', sandbox: false, signal: new AbortController().signal, reason: () => null, release: () => released++ }
  }
  const job = { id: 'pod-job', status: 'queued', created_at: '2026-10-17T00:00:00Z', started_at: null, completed_at: null, expires_at: null, queue_position: 0, progress: null, outputs: [], error: null, urls: {} }
  const calls = []
  const mockFetch = async (url, options) => {
    const u = new URL(url)
    calls.push(`${options.method} ${u.host}${u.pathname}`)
    assert.equal(u.host, 'pod1-8189.proxy.runpod.net')
    assert.equal(options.headers.get('Authorization'), 'Bearer pod-token')
    if (u.pathname === '/api/v2/jobs') {
      const payload = JSON.parse(options.body)
      assert.equal(payload.workflow['1'].inputs.ckpt_name, 'sd_xl_base_1.0.safetensors')
      assert.equal(payload.extra_data.api_key_comfy_org, 'comfy-key')
      return jsonReply(job, 201)
    }
    if (u.pathname === '/api/v2/jobs/pod-job') return jsonReply({ ...job, status: 'succeeded', outputs: [{ node_id: '7', name: 'fox.png', type: 'image', content_type: 'image/png', size_bytes: 3, id: 'out-1', hash: null, url: null, url_expires_at: null }] })
    if (u.pathname === '/api/v2/assets/out-1/content') return new Response('png', { headers: { 'Content-Type': 'image/png' } })
    throw new Error(`Unexpected SDK request ${options.method} ${u.pathname}`)
  }
  globalThis.fetch = async () => { throw new Error('Unexpected network call') }
  const files = await core.runComfy('image_sdxl', sdxl, { lease, podPhase: ready, createClient: (key, baseUrl) => core.comfyClient(baseUrl, key, { fetch: mockFetch }) })
  assert.equal(files[0].kind, 'image')
  assert.equal(fs.readFileSync(files[0].path, 'utf8'), 'png')
  assert.equal(released, 1)
  assert(calls.includes('POST pod1-8189.proxy.runpod.net/api/v2/jobs'))
  assert.equal(process.env.COMFY_BASE_URL, '', 'the base URL is scoped to one client')
})

await test('runs: no Pod, an ended Pod and the sandbox each fail the run with a reason', async () => {
  podMode()
  const createClient = () => { throw new Error('no client without a Pod') }
  await assert.rejects(core.runComfy('image_sdxl', sdxl, { createClient, podPhase: ready, lease: async () => { throw Object.assign(new Error(NO_POD), { code: 'no_pod' }) } }), (e) => e.message === NO_POD)

  let released = 0
  const ctl = new AbortController()
  let why = null
  const lease = async () => ({ baseUrl: 'https://pod1-8189.proxy.runpod.net', token: 't', sandbox: false, signal: ctl.signal, reason: () => why, release: () => released++ })
  const client = {
    workflows: { fromFile: async () => ({ json: null, setInput() {} }) },
    run: (wf, o) => new Promise((_, reject) => o.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))),
  }
  const running = core.runComfy('image_sdxl', sdxl, { lease, podPhase: ready, createClient: () => client })
  await new Promise((r) => setTimeout(r, 10))
  why = 'You terminated the Pod.'
  ctl.abort()
  await assert.rejects(running, (e) => e.message === 'You terminated the Pod.' && e.status === 409)
  assert.equal(released, 1)

  const sandbox = async () => ({ sandbox: true, release: () => released++ })
  await assert.rejects(core.runComfy('image_sdxl', sdxl, { lease: sandbox, podPhase: ready, createClient }), /sandbox Pod, so nothing renders/)
  assert.equal(released, 2)
})

await test('runs: Comfy Cloud + Pod is a saved choice, and the needs of a workflow size the Pod', () => {
  podMode({})
  assert.equal(core.config('comfy').mode, 'cloud')
  assert.equal(core.connections().comfy.connected, false, 'no Comfy key and no RunPod key')
  core.saveConnection('runpod', { key: 'rp-key' })
  assert.equal(core.connections().comfy.connected, true, 'a RunPod key alone can run workflows on a Pod')
  assert.throws(() => core.saveConnection('comfy', { mode: 'local' }), /runs on Comfy Cloud and Pods/)
  assert.throws(() => core.saveConnection('comfy', { url: 'http://127.0.0.1:8188' }), /COMFY_MODE=local and COMFY_URL in \.env/)
  assert.throws(() => core.saveConnection('runpod', { cap: '-3' }), /daily cap/)
  core.saveConnection('runpod', { cap: '12.345' })
  assert.equal(core.config('runpod').cap, '12.35')
  const needs = core.workflowNeeds('image_flux')
  assert.equal(needs.minVramGb, 24)
  assert.equal(needs.volumeGb, 48)
  assert.throws(() => core.workflowNeeds('../x'), /Invalid workflow/)
})

// ---- review fixes ----------------------------------------------------------------------------------

const hasBash = spawnSync('bash', ['-c', 'exit 0']).status === 0
// Git Bash as a Windows path, for the status server: Windows' process search looks in System32
// before PATH, so a plain 'bash' there can be the WSL launcher.
const bashPath = process.platform === 'win32' && hasBash ? spawnSync('bash', ['-c', 'cygpath -w "$(command -v bash)"'], { encoding: 'utf8' }).stdout.trim() : ''
await test('fixes: self-terminate succeeds only when RunPod clearly accepts it', { skip: !hasBash && 'no bash' }, () => {
  const script = podBootScript()
  const kill = script.slice(script.indexOf("<<'KILL'\n") + 9, script.indexOf('\nKILL\n'))
  const file = path.join(tmp, 'kill-pod.sh')
  fs.writeFileSync(file, kill)
  // Stubs stand in for curl and runpodctl; DELETE answers STUB_DELETE, GraphQL answers STUB_BODY and STUB_CODE.
  const stubs = `curl() { for a in "$@"; do [ "$a" = DELETE ] && { printf '%s' "$STUB_DELETE"; return 0; }; done; printf '%s\\n%s' "$STUB_BODY" "$STUB_CODE"; }
runpodctl() { echo "Error: pod not found"; return 1; }
export -f curl runpodctl`
  const run = (env) => spawnSync('bash', ['-c', `${stubs}\nbash "$1" test`, 'kill', file.replace(/\\/g, '/')], { encoding: 'utf8', env: { ...process.env, RUNPOD_POD_ID: 'p1', RUNPOD_API_KEY: 'k', STUB_DELETE: '403', ...env } }).status
  assert.equal(run({ STUB_BODY: '<html>502 Bad Gateway</html>', STUB_CODE: '502' }), 1, 'a gateway page is not a terminate')
  assert.equal(run({ STUB_BODY: 'Too Many Requests', STUB_CODE: '429' }), 1)
  assert.equal(run({ STUB_BODY: '{"data":{"podTerminate":null}}', STUB_CODE: '200' }), 0)
  assert.equal(run({ STUB_BODY: '{"errors":[{"message":"denied"}]}', STUB_CODE: '200', STUB_DELETE: '204' }), 0, 'falls through to REST')
  assert.equal(run({ STUB_BODY: '{"data":{"podTerminate":null}}', STUB_CODE: '200', RUNPOD_API_KEY: '' }), 2, 'no key, no claim of success')
})

await test('fixes: a ComfyUI restart after ready does not terminate a busy Pod', async () => {
  const { pod, rp, clock } = setup()
  await pod.start()
  rp.statusd = readyStatus()
  await pod.tick()
  const run = await pod.lease()
  clock.t += 30 * 60_000
  rp.statusd = readyStatus({ ready: false, stage: 'comfy', queue: 1 })
  await pod.tick()
  assert.equal(run.signal.aborted, false)
  assert.equal(rp.count((c) => c.method === 'DELETE'), 0)
  run.release()
})

await test('fixes: a Pod found gone after a long gap costs only its watchdog minutes, split by day', async () => {
  const a = setup()
  await a.pod.start()
  a.rp.statusd = readyStatus()
  await a.pod.tick()
  a.clock.t += 14 * 3_600_000 // the app was closed for 14 hours; the Pod terminated itself
  a.rp.pods.get('pod1').desiredStatus = 'TERMINATED'
  assert.equal((await a.make().tick()).phase, 'none')
  const led = JSON.parse(fs.readFileSync(path.join(a.dir, 'pod-ledger.json'), 'utf8'))
  const total = Object.values(led.days).reduce((n, v) => n + v, 0)
  assert(Math.abs(total - (13 / 60) * 0.5) < 0.01, `13 minutes at $0.50, got ${total}`)
  await a.make().start() // the cap is not blocked by spend that never happened

  const b = setup({ at: '2026-10-17T23:30:00' })
  await b.pod.start()
  b.rp.statusd = readyStatus({ queue: 1 })
  await b.pod.tick()
  b.clock.t += 60 * 60_000
  await b.pod.tick()
  const days = JSON.parse(fs.readFileSync(path.join(b.dir, 'pod-ledger.json'), 'utf8')).days
  assert(Math.abs(days['2026-10-17'] - 0.25) < 0.01 && Math.abs(days['2026-10-18'] - 0.25) < 0.01, JSON.stringify(days))
})

await test('fixes: a slow refresh during a resume does not bring back the old start time', async () => {
  const { pod, rp, clock } = setup()
  await pod.start()
  rp.statusd = readyStatus()
  await pod.tick()
  await pod.pause({ now: true })
  clock.t += 26 * 3_600_000
  let release
  rp.hold = new Promise((r) => { release = r })
  const ticking = pod.tick() // its GET of the Pod is slow and still says EXITED
  await new Promise((r) => setTimeout(r, 20))
  rp.hold = null
  await pod.resume()
  release()
  await ticking
  const s = pod.status()
  assert.equal(s.phase, 'starting')
  assert.equal(s.pod.startedAt, clock.t)
  assert.equal(rp.count((c) => c.method === 'DELETE'), 0)
})

await test('fixes: the CLI and MCP see a new Pod at once, and never remove a newer Pod record', async () => {
  const a = setup()
  const mcp = podManager({ ...a.opts, owner: false })
  await assert.rejects(mcp.lease(), (e) => e.code === 'no_pod')
  await a.pod.start()
  a.rp.statusd = readyStatus()
  await a.pod.tick()
  await new Promise((r) => setTimeout(r, 1100))
  const l = await mcp.lease()
  assert.equal(l.baseUrl, 'https://pod1-8189.proxy.runpod.net')
  l.release()
  await a.pod.terminate({ now: true })
  await a.pod.start() // pod2, while the MCP process still remembers pod1
  await mcp.refresh()
  assert.equal(JSON.parse(fs.readFileSync(path.join(a.dir, 'pod.json'), 'utf8')).id, 'pod2')
  assert.equal(JSON.parse(fs.readFileSync(path.join(a.dir, 'pod-ledger.json'), 'utf8')).pod, 'pod2', 'only the app writes the ledger')
})

await test('fixes: requests from other sites are refused', async () => {
  const { crossSite } = await import('../server/plugin.js')
  const host = 'localhost:5173'
  assert.equal(crossSite({ host }), false, 'curl and the CLI send neither header')
  assert.equal(crossSite({ host, origin: 'http://localhost:5173', 'sec-fetch-site': 'same-origin' }), false)
  assert.equal(crossSite({ host, 'sec-fetch-site': 'cross-site' }), true)
  assert.equal(crossSite({ host, 'sec-fetch-site': 'same-site', origin: 'http://localhost:3000' }), true)
  assert.equal(crossSite({ host, origin: 'https://evil.example' }), true)
})

await test('routing: Comfy Cloud takes runs at once, a ready Pod takes every run, and a run Cloud cannot take needs a Pod', async () => {
  const fakeClient = (where) => ({
    where,
    workflows: { fromFile: async () => ({ json: null, setInput() {} }) },
    run: async () => ({ outputs: [{ type: 'image', contentType: 'image/png', name: 'x.png', toBytes: async () => Buffer.from(where) }] }),
  })
  const route = async (phase, { key = 'comfy-key', offCloud = false } = {}) => {
    podMode(key ? { key } : {})
    let leased = false
    const lease = async () => { leased = true; return { baseUrl: 'https://pod1-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }
    const createClient = (k, baseUrl) => fakeClient(baseUrl ? 'pod' : 'cloud')
    const file = MODEL_FILES['sd_xl_base_1.0.safetensors']
    if (offCloud) file.cloud = false
    try {
      const files = await core.runComfy('image_sdxl', sdxl, { lease, createClient, podPhase: async () => phase })
      return { to: fs.readFileSync(files[0].path, 'utf8'), leased }
    } catch (e) {
      return { code: e.code, reason: e.reason, message: e.message, leased }
    } finally {
      file.cloud = true
    }
  }
  assert.deepEqual(await route('ready'), { to: 'pod', leased: true }, 'a ready Pod takes the run')
  assert.deepEqual(await route('ready', { key: '' }), { to: 'pod', leased: true })
  assert.deepEqual(await route('starting'), { to: 'cloud', leased: false }, 'runs use Cloud until the Pod is ready')
  assert.deepEqual(await route('starting', { key: '' }), { to: 'pod', leased: true }, 'a run Cloud cannot take waits for the starting Pod')
  assert.deepEqual(await route('resuming', { offCloud: true }), { to: 'pod', leased: true })
  assert.deepEqual(await route('none'), { to: 'cloud', leased: false }, 'no Pod: Cloud at once')
  assert.deepEqual(await route('paused'), { to: 'cloud', leased: false })
  assert.deepEqual(await route('ending'), { to: 'cloud', leased: false })
  const noKey = await route('none', { key: '' })
  assert.equal(noKey.code, 'needs_pod')
  assert.equal(noKey.reason, 'Comfy Cloud needs a Comfy API key on a paid plan')
  assert.match(noKey.message, /so this run needs a Pod\. Start one in ComfyField from the Pod chip in the top bar\./)
  assert.equal(noKey.leased, false, 'routing never starts or leases a Pod it does not have')
  const offCloud = await route('paused', { offCloud: true })
  assert.equal(offCloud.code, 'needs_pod')
  assert.equal(offCloud.reason, 'SDXL is not on Comfy Cloud yet', 'the reason names the model as the picker shows it')
  assert.equal((await route('ending', { key: '' })).code, 'needs_pod')
})

// ---- newest models ----------------------------------------------------------------------------------

await test('models: every bundled workflow fills all its placeholders, and the new models size their canvas', async () => {
  const { comfyVars } = await import('../shared/mapping.js')
  const { models } = await import('../src/lib/catalog.js')
  const { fill } = await import('../shared/mapping.js')
  for (const w of fs.readdirSync('public/workflows')) {
    const g = JSON.parse(fs.readFileSync(`public/workflows/${w}`, 'utf8'))
    const kind = /video|v2v|i2v|t2v|ltx/.test(w) ? 'video' : 'image'
    const filled = JSON.stringify(fill(g, comfyVars(kind, { prompt: 'A fox', aspect: '16:9', duration: 5, image: 'start.png', video: 'clip.mp4' })))
    assert(!filled.includes('{{'), `${w} leaves a placeholder unfilled`)
  }
  const ltx = models.find((m) => m.id === 'comfy-ltx25')
  const qwen = models.find((m) => m.id === 'comfy-qwen-image21')
  for (const a of ['16:9', '9:16', '1:1', '4:5']) {
    const q = comfyVars('image', { prompt: 'x', aspect: a }, qwen.sizes)
    assert(q.width % 32 === 0 && q.height % 32 === 0, `Qwen-Image 2.1 ${a}`)
    const k = comfyVars('image', { prompt: 'x', aspect: a })
    assert(k.width % 16 === 0 && k.height % 16 === 0, `FLUX 3 Klein ${a}`)
  }
  for (const m of models.filter((x) => x.provider === 'comfy')) {
    const needsPod = [m.workflow, m.imageWorkflow].filter(Boolean).some((w) => core.workflowNeeds(w).files.some((f) => !f.cloud))
    assert.equal(Boolean(m.pod), needsPod, `${m.id}: the catalog pod flag matches the model list`)
  }
  const { openModels } = await import('../src/lib/tools.js')
  for (const o of openModels.filter((m) => m.catalog)) assert(models.some((m) => m.id === o.catalog && m.workflow === o.workflow), `${o.id} points at a real catalog model`)
  const h3 = models.find((m) => m.id === 'comfy-h3')
  for (const m of [ltx, h3]) {
    assert(m.imageWorkflow && fs.existsSync(`public/workflows/${m.imageWorkflow}.json`) && fs.existsSync(`public/workflows/${m.workflow}.json`))
    for (const a of ['16:9', '9:16', '1:1', '4:5']) {
      const v = comfyVars('video', { prompt: 'x', aspect: a, duration: 5 }, m.sizes)
      assert.equal(v.frames % 8, 1, 'LTX frames are 8k+1; H3 snaps them itself')
      assert.equal(v.width % (m === ltx ? 64 : 32), 0, `${m.id} ${a} width`)
      assert.equal(v.height % (m === ltx ? 64 : 32), 0, `${m.id} ${a} height`)
    }
  }
  assert.deepEqual(comfyVars('video', { prompt: 'x', aspect: '16:9', duration: 5 }).width, 768, 'models without sizes keep the old canvas')
  assert.equal(core.workflowNeeds('h3_open_t2v').minVramGb, 32)
  assert.equal(core.workflowNeeds('flux3_klein_t2i').minVramGb, 24)
  assert.deepEqual(core.workflowNeeds('qwen_image21_t2i').files.filter((f) => !f.cloud).map((f) => f.name), ['qwen_image_2.1_turbo_bf16.safetensors', 'qwen_image_2.1_vae_bf16.safetensors'], 'Qwen-Image 2.1 runs on a Pod')
  const klein = core.workflowNeeds('flux3_klein_t2i').files.find((f) => f.dir === 'diffusion_models')
  assert.equal(klein.name, 'flux3-image-klein-bf16.safetensors', 'the Pod saves the copy under the name the graph loads')
  assert.equal(klein.path, 'model.safetensors')
  assert.equal(core.workflowNeeds('ltx25_i2v').minVramGb, 32)
  assert(core.workflowNeeds('ltx25_t2v').files.every((f) => f.cloud && /^[0-9a-f]{64}$/.test(f.sha256)))
})

await test('routing: a ready Pod too small for the run sends it to Cloud, or says to start a bigger Pod', async () => {
  const client = { workflows: { fromFile: async () => ({ json: null, setInput() {} }) }, run: async () => ({ outputs: [{ type: 'video', contentType: 'video/mp4', name: 'x.mp4', toBytes: async () => Buffer.from('v') }] }) }
  const h3 = { prompt: 'A fox', width: 1344, height: 768, frames: 121, seed: 1 }
  podMode()
  let leased = false
  const lease = async () => { leased = true; throw new Error('no lease for a small Pod') }
  await core.runComfy('h3_open_t2v', h3, { createClient: () => client, lease, podPhase: async () => 'ready', podVram: () => 24 })
  assert.equal(leased, false, 'a 24 GB Pod does not take a 32 GB run; Cloud does')
  podMode({})
  await assert.rejects(core.runComfy('h3_open_t2v', h3, { createClient: () => client, lease, podPhase: async () => 'ready', podVram: () => 24 }),
    (e) => e.code === 'pod_too_small' && /needs a 32 GB GPU; your Pod has 24 GB/.test(e.message)
      && e.fit.needVramGb === 32 && e.fit.podVramGb === 24, 'the error carries the sizes for the replace sheet')
  podMode()
  leased = false
  await core.runComfy('h3_open_t2v', h3, { createClient: () => client, lease: async () => { leased = true; return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }, podPhase: async () => 'ready', podVram: () => 32 })
  assert.equal(leased, true, 'a 32 GB Pod takes it')
})

await test('models: every bundled workflow is a linked API graph that saves media', async () => {
  const { comfyVars, fill } = await import('../shared/mapping.js')
  for (const w of fs.readdirSync('public/workflows')) {
    const kind = /video|i2v|t2v|ltx/.test(w) ? 'video' : 'image'
    const graph = fill(JSON.parse(fs.readFileSync(`public/workflows/${w}`, 'utf8')), comfyVars(kind, { prompt: 'A fox', aspect: '16:9', duration: 5, image: 'start.png', video: 'clip.mp4' }))
    const visit = (value) => {
      if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && Number.isInteger(value[1])) assert(graph[value[0]], `${w}: dangling link to ${value[0]}`)
      else if (value && typeof value === 'object') Object.values(value).forEach(visit)
    }
    for (const node of Object.values(graph)) {
      assert.equal(typeof node.class_type, 'string', w)
      assert(node.inputs && !Array.isArray(node.inputs), w)
      visit(node.inputs)
    }
    // FreeVideoGenerate saves its own mp4; VideoHelperSuite saves a video that keeps its alpha.
    assert(Object.values(graph).some((n) => /^(Save(Image|Video|GLB|Animated(WEBP|PNG)|Audio\w*)|FreeVideoGenerate|VHS_VideoCombine)$/.test(n.class_type)), `${w} saves nothing`)
    if (/i2v/.test(w)) assert(Object.values(graph).some((n) => n.class_type === 'LoadImage' && n.inputs.image === 'start.png'), `${w} takes no start image`)
  }
})

// ---- Pod suggestion ---------------------------------------------------------------------------------

await test('suggestion: Cloud runs are logged with their GPU time, and a busy hour suggests a Pod', async () => {
  podMode()
  const client = {
    workflows: { fromFile: async () => ({ json: null, setInput() {} }) },
    run: async () => ({ startedAt: '2026-10-17T10:00:00Z', completedAt: '2026-10-17T10:00:42Z', outputs: [{ type: 'image', contentType: 'image/png', name: 'x.png', toBytes: async () => Buffer.from('x') }] }),
  }
  await core.runComfy('image_sdxl', sdxl, { createClient: () => client, podPhase: async () => 'none', lease: async () => { throw new Error('no lease on Cloud') } })
  const log = JSON.parse(fs.readFileSync(path.join(process.env.COMFYFIELD_HOME, '.comfyfield', 'cloud-runs.json'), 'utf8'))
  assert.equal(log.length, 1)
  assert.equal(log[0].seconds, 42)
  assert.equal(log[0].minVramGb, 12, 'SDXL needs 12 GB')

  const now = Date.now()
  const rungs = [{ name: 'RTX PRO 4000', vramGb: 24, usdPerHr: 0.7, inStock: false }, { name: 'RTX PRO 4500', vramGb: 32, usdPerHr: 0.9, inStock: true }]
  let asked
  const quote = async ({ minVramGb }) => { asked = minVramGb; return { rungs: rungs.filter((r) => r.vramGb >= minVramGb) } }
  const fresh = () => { podMode(); return now }
  fresh()
  core.logCloudRun({ seconds: 300, minVramGb: 12, at: now - 10 * 60_000 })
  core.logCloudRun({ seconds: 300, minVramGb: 24, at: now - 5 * 60_000 })
  assert.equal(await core.podSuggestion({ now, quote }), null, 'two runs are not a session')
  core.logCloudRun({ seconds: 300, minVramGb: 12, at: now - 60_000 })
  const s = await core.podSuggestion({ now, quote })
  assert.equal(asked, 24, 'sized for the largest recent run')
  assert.equal(s.runs, 3)
  assert(Math.abs(s.cloudUsd - 900 * core.CLOUD_USD_PER_GPU_SEC) < 1e-9)
  assert.equal(s.gpu, 'RTX PRO 4500', 'the cheapest GPU that is free')
  assert.equal(s.podUsdPerHr, 0.9)

  fresh()
  for (let i = 0; i < 5; i++) core.logCloudRun({ seconds: 60, at: now - i * 60_000 })
  assert.equal(await core.podSuggestion({ now, quote }), null, '$0.38 of Cloud time is under 80% of an hour on a Pod')
  fresh()
  for (let i = 0; i < 3; i++) core.logCloudRun({ seconds: 600, at: now - 2 * 3_600_000 })
  assert.equal(await core.podSuggestion({ now, quote }), null, 'only the last hour counts')
  fresh()
  for (let i = 0; i < 3; i++) core.logCloudRun({ seconds: 600, at: now })
  assert.equal(await core.podSuggestion({ now, quote: async () => ({ rungs: [{ name: 'X', vramGb: 24, usdPerHr: null }] }) }), null, 'no price, no suggestion')
  core.logCloudRun({ seconds: 1, at: now - 25 * 3_600_000 })
  core.logCloudRun({ seconds: 1, at: now })
  assert.equal(JSON.parse(fs.readFileSync(path.join(process.env.COMFYFIELD_HOME, '.comfyfield', 'cloud-runs.json'), 'utf8')).length, 4, 'the log keeps one day')
})

// ---- auto-start --------------------------------------------------------------------------------------

await test('auto-start: Generate starts, resumes or keeps the Pod by itself, once for several runs', async () => {
  const { run } = await import('../src/lib/providers.js')
  const usePod = await import('../src/lib/usePod.js')
  const model = { id: 'm', provider: 'comfy', kind: 'image', name: 'FLUX 3 Klein', workflow: 'flux3_klein_t2i' }
  const opts = { prompt: 'A fox', aspect: '1:1' }
  // A stub of the app's API: runs need a Pod until one exists.
  const api = (start = {}) => {
    const s = { phase: 'none', auto: true, connected: true, run: 'session', posts: [], ...start }
    globalThis.fetch = async (url, init = {}) => {
      const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
      if (url === '/api/pod') return reply({ phase: s.phase, auto: s.auto, connected: s.connected, run: s.run ?? null, spend: { today: 0, cap: 20 } })
      if (url.startsWith('/api/pod/')) {
        s.posts.push({ action: url.slice(9), body: JSON.parse(init.body || '{}') })
        if (s.refuse) return reply({ error: s.refuse }, 402)
        s.phase = url.endsWith('/keep') ? 'ready' : 'starting'
        return reply({ phase: s.phase })
      }
      if (url === '/api/comfy/run') {
        if (['none', 'paused', 'ending'].includes(s.phase)) return reply({ error: 'needs a Pod', code: 'needs_pod', reason: 'FLUX 3 Klein is not on Comfy Cloud yet' }, 409)
        return reply({ files: [{ url: '/media/x.png', kind: 'image' }] })
      }
      throw new Error(`unexpected ${url}`)
    }
    return s
  }

  let s = api()
  let waited = 0
  const files = await run(model, opts, { onPod: () => waited++ })
  assert.equal(files[0].url, '/media/x.png')
  assert.deepEqual(s.posts, [{ action: 'start', body: { workflow: 'flux3_klein_t2i' } }], 'sized for the service: the start names its workflow')
  assert.equal(waited, 1, 'the take is marked as waiting for the Pod')

  s = api()
  await Promise.all([run(model, opts), run(model, opts), run(model, opts)])
  assert.equal(s.posts.length, 1, 'three runs share one start')

  s = api({ phase: 'paused' })
  await run(model, opts)
  assert.deepEqual(s.posts.map((p) => p.action), ['resume'])
  s = api({ phase: 'ending' })
  await run(model, opts)
  assert.deepEqual(s.posts.map((p) => p.action), ['keep'])

  // Instant never starts a Pod, with auto-start on or off: the run fails with needs_pod and nothing is asked.
  for (const auto of [true, false]) {
    s = api({ run: 'instant', auto })
    waited = 0
    await assert.rejects(run(model, opts, { onPod: () => waited++ }), (e) => e.code === 'needs_pod', `Instant with auto-start ${auto ? 'on' : 'off'} fails, and does not wait on the start sheet`)
    assert.deepEqual(s.posts, [], 'Instant starts, resumes or keeps no Pod')
    assert.equal(waited, 0, 'the take is not marked as waiting for a Pod')
  }

  s = api({ refuse: 'Daily cap reached: $20.00 of $20.00 today. Raise it in Connections.' })
  await assert.rejects(run(model, opts), /Daily cap reached/)

  s = api({ auto: false })
  const asked = run(model, opts)
  await new Promise((r) => setTimeout(r, 20))
  assert(usePod.usePod && s.posts.length === 0, 'with auto-start off nothing starts by itself')
  s.phase = 'starting' // the sheet's button starts it
  usePod.answerPod(true)
  assert.equal((await asked)[0].url, '/media/x.png')
})

// A Pod too small for the run: the sheet offers to replace it, with auto-start on or off (docs/adr/0002).
await test('pod too small: Generate asks to replace the Pod, then terminates, starts one sized for the workflow and reruns', async () => {
  const { run } = await import('../src/lib/providers.js')
  const usePod = await import('../src/lib/usePod.js')
  const model = { id: 'm', provider: 'comfy', kind: 'video', name: 'LTX 2.5', workflow: 'ltx25_t2v' }
  const opts = { prompt: 'A fox', aspect: '16:9' }
  const fit = { needVramGb: 32, podVramGb: 24, needArch: null, podArch: null }
  const api = (start = {}) => {
    const s = { phase: 'ready', vram: 24, auto: true, connected: true, run: 'session', posts: [], runs: 0, ...start }
    globalThis.fetch = async (url, init = {}) => {
      const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
      if (url === '/api/pod') return reply({ phase: s.phase, auto: s.auto, connected: s.connected, run: s.run ?? null, spend: { today: 0, cap: 20 } })
      if (url.startsWith('/api/pod/')) {
        const action = url.slice(9)
        s.posts.push({ action, body: JSON.parse(init.body || '{}') })
        if (action === 'terminate') { s.phase = 'none'; s.vram = null }
        if (action === 'start') { s.phase = 'starting'; s.vram = 48 }
        return reply({ phase: s.phase })
      }
      if (url === '/api/comfy/run') {
        s.runs++
        if (s.vram != null && s.vram < 32) return reply({ error: 'This run needs a 32 GB GPU; your Pod has 24 GB. Terminate it and start a new Pod.', code: 'pod_too_small', fit }, 409)
        return reply({ files: [{ url: '/media/x.mp4', kind: 'video' }] })
      }
      throw new Error(`unexpected ${url}`)
    }
    return s
  }
  // Lets the run reach the sheet.
  const sheet = () => new Promise((r) => setTimeout(r, 20))

  for (const auto of [true, false]) {
    const s = api({ auto })
    let waited = 0
    const pending = run(model, opts, { onPod: () => waited++ })
    await sheet()
    assert.deepEqual(s.posts, [], `with auto-start ${auto ? 'on' : 'off'} nothing ends or starts before the person confirms`)
    assert.equal(waited, 0, 'the take is not waiting for a Pod yet')
    // The sheet's confirm button does what PodSheet's replace does, then answers.
    await usePod.podAction('terminate', { now: true })
    await usePod.podAction('start', { workflow: 'ltx25_t2v', tier: 'balanced' })
    usePod.answerPod(true)
    assert.equal((await pending)[0].url, '/media/x.mp4', 'the take runs again on the new Pod')
    assert.deepEqual(s.posts.map((p) => p.action), ['terminate', 'start'])
    assert.deepEqual(s.posts[0].body, { now: true }, 'the old Pod ends now')
    assert.equal(s.posts[1].body.workflow, 'ltx25_t2v', 'the new Pod is sized for the workflow')
    assert.equal(s.runs, 2)
    assert.equal(waited, 1, 'after the confirm the take waits for the Pod')
  }

  // Several runs too big for the Pod share one question.
  let s = api()
  const both = [run(model, opts), run(model, opts)]
  await sheet()
  s.vram = 48
  usePod.answerPod(true)
  await Promise.all(both)

  // Cancel leaves the Pod alone, and the take fails.
  s = api()
  const cancelled = run(model, opts)
  await sheet()
  usePod.answerPod(false)
  await assert.rejects(cancelled, /Cancelled\. Your Pod is still running\./)
  assert.deepEqual(s.posts, [], 'no terminate, no start')
  assert.equal(s.phase, 'ready')

  // Instant never touches a Pod (docs/adr/0001): the error stands and nothing is asked.
  s = api({ run: 'instant' })
  await assert.rejects(run(model, opts), (e) => e.code === 'pod_too_small')
  assert.deepEqual(s.posts, [])
  assert.equal(s.runs, 1)
})

await test('auto-start: the RunPod switch is saved as on or off, and on by default', () => {
  podMode()
  assert.equal(core.podAutoStart(), true)
  assert.equal(core.connections().runpod.auto, true)
  core.saveConnection('runpod', { auto: 'off' })
  assert.equal(core.podAutoStart(), false)
  assert.throws(() => core.saveConnection('runpod', { auto: 'maybe' }), /on or off/)
})

// ---- FreeVideo -------------------------------------------------------------------------------------

await test('freevideo: the boot script pins FreeVideo, loads only its node, and installs it outside the boot', () => {
  const script = podBootScript()
  assert(script.includes('git -C "$FV" checkout --quiet --force fcd24fb730e7094565d13b663e92c264ed4d470c'), 'FreeVideo is pinned to v0.4.14 by commit')
  assert(script.indexOf('STAGE freevideo-clone') > script.indexOf('STAGE comfy-update') && script.indexOf('STAGE freevideo-clone') < script.indexOf('main.py'),
    'the node is in place before ComfyUI starts')
  assert(/main\.py [^\n]*--disable-all-custom-nodes --whitelist-custom-nodes FreeVideo/.test(script), 'only FreeVideo loads of the custom nodes')
  assert(/export FREEVIDEO_HOME=\/workspace\/freevideo FREEVIDEO_BACKGROUND_COMPILE=off CUDA_VISIBLE_DEVICES="\$\{CUDA_VISIBLE_DEVICES:-0\}"/.test(script))
  const setup = script.slice(script.indexOf("<<'FVSETUP'"), script.lastIndexOf('FVSETUP'))
  for (const flag of ['--root /workspace/freevideo', '--yes --accept-model-license', '--no-launch', '--plain', '--network official', '--prepared-format fp8', '--environment unified', '--install-system-deps', '</dev/null'])
    assert(setup.includes(flag), flag)
  assert(/-u HF_TOKEN/.test(setup), 'every FreeVideo repo is public, so no token travels')
  assert(/-u RUNPOD_API_KEY -u POD_TOKEN/.test(setup), 'the installer gets neither the RunPod key nor the Pod token')
  const comfy = script.slice(script.indexOf('STAGE comfy '), script.indexOf('main.py'))
  assert(comfy.includes('unset RUNPOD_API_KEY POD_TOKEN'), 'ComfyUI and its custom nodes get neither secret')
  assert(!/setup\.sh/.test(script.slice(0, script.indexOf("<<'FVSETUP'"))), 'the 15-40 minute install never runs in the boot itself')
  assert(/\/runtime\/\$e/.test(script), 'the boot asks the status server to install what the Pod was started for')
  assert(/\[ -f \/workspace\/freevideo\/machine\.json \] && want="\$want freevideo"/.test(script), 'a resumed Pod installs FreeVideo again')
  assert(Buffer.byteLength(podStartCmd(script)[2]) < START_CMD_MAX)
  if (hasBash) {
    const f = path.join(tmp, 'boot.sh')
    fs.writeFileSync(f, script)
    const r = spawnSync('bash', ['-n', f], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
  }
  assert.equal(podEnv({ token: 't', runtimes: ['freevideo'] }).CF_RUNTIMES, 'freevideo')
  assert(!('CF_RUNTIMES' in podEnv({ token: 't' })))
  assert.throws(() => podEnv({ token: 't', runtimes: ['x; rm -rf /'] }), /Unknown runtime/)
})

await test('freevideo: the status server installs on request, reports it, counts it as busy and retries a failure', { skip: (!python || !hasBash) && 'needs Python 3.9+ and bash' }, async (t) => {
  const port = freePort()
  const base = path.join(tmp, 'statusd-fv').replace(/\\/g, '/')
  const home = `${base}/freevideo`
  fs.mkdirSync(base, { recursive: true })
  // The boot script marks when its own pip installs are done; installs wait for it.
  fs.writeFileSync(`${base}/.base-ready`, '')
  // A fake installer: the first run fails the way FreeVideo's disk preflight does, the second writes machine.json.
  fs.writeFileSync(`${base}/fail-once`, '')
  fs.writeFileSync(`${base}/runtime-freevideo.sh`, [
    '#!/bin/bash', 'echo "Installing the runtime"', 'sleep 1',
    `if [ -f "${base}/fail-once" ]; then rm "${base}/fail-once"; echo "Insufficient disk space: need 89.1 GiB"; echo "see the log"; exit 1; fi`,
    `mkdir -p "${home}" && echo '{"ready": true}' > "${home}/machine.json"`, ''].join('\n'))
  const proc = startStatusd({ POD_TOKEN: 'secret', CF_BASE: base, CF_MODELS: `${base}/models`, CF_STATUS_PORT: String(port), CF_FREEVIDEO_HOME: home,
    CF_COMFY_URL: 'http://127.0.0.1:9', CF_PROXY_URL: 'http://127.0.0.1:9', CF_TICK: '0.2', CF_DRY_KILL: '1', ...(bashPath ? { CF_BASH: bashPath } : {}) })
  t.after(() => proc.kill())
  const url = `http://127.0.0.1:${port}`
  const auth = { Authorization: 'Bearer secret' }
  const status = async () => (await netFetch(`${url}/status`, { headers: auth })).json()
  await proc.ready(url, async () => (await netFetch(`${url}/status`, { headers: auth })).ok)
  assert.deepEqual((await status()).runtimes, {}, 'nothing installs until a run asks')
  assert.equal((await netFetch(`${url}/runtime/freevideo`, { method: 'POST' })).status, 401)
  assert.equal((await netFetch(`${url}/runtime/other`, { method: 'POST', headers: auth })).status, 404)
  const asked = await netFetch(`${url}/runtime/freevideo`, { method: 'POST', headers: auth })
  assert.equal(asked.status, 202)
  assert.equal((await asked.json()).runtime.state, 'installing')
  assert.equal((await (await netFetch(`${url}/runtime/freevideo`, { method: 'POST', headers: auth })).json()).runtime.state, 'installing', 'a second ask joins the running install')
  const failed = await until(async () => { const e = (await status()).runtimes.freevideo; return e.state === 'failed' && e })
  assert.equal(failed.error, 'Insufficient disk space: need 89.1 GiB', 'the reason is the line that says what failed')
  await netFetch(`${url}/runtime/freevideo`, { method: 'POST', headers: auth })
  const ready = await until(async () => { const e = (await status()).runtimes.freevideo; return e.state === 'ready' && e })
  assert(ready.sec >= 1)
  assert(fs.readFileSync(`${base}/freevideo.log`, 'utf8').includes('Installing the runtime'), 'the installer writes its own log')

  const code = `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('statusd', sys.argv[1])
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
m.RUNTIMES['freevideo'] = {'state': 'installing', 'error': None, 'startedAt': 0, 'endedAt': None}
print(json.dumps([m.installing(), m.next_idle(600, 0, 0, m.downloading() or m.installing(), 15)]))`
  const r = spawnSync(python[0], [...python.slice(1), '-c', code, statusd], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.deepEqual(JSON.parse(r.stdout), [true, 0], 'an install keeps the idle clock at zero, though the GPU is idle')
})

await test('freevideo: a Pod started for H3 installs FreeVideo at boot; a lease waits for it and reports a failure', async () => {
  const { pod, rp, opts } = setup()
  await pod.start({ minVramGb: 96, volumeGb: 126, runtimes: ['freevideo'] })
  const create = rp.calls.find((c) => c.path === '/v1/pods' && c.method === 'POST').body
  assert.equal(create.env.CF_RUNTIMES, 'freevideo')
  assert.equal(create.volumeInGb, 130, 'room for the first install')
  assert.equal(create.gpuTypeIds[0], 'NVIDIA RTX PRO 6000 Blackwell Server Edition')

  rp.statusd = readyStatus({ runtimes: { freevideo: { state: 'installing', error: null, sec: 60 } } })
  await pod.refresh()
  assert.deepEqual(pod.status().runtimes.map((e) => [e.name, e.state]), [['FreeVideo', 'installing']])
  assert.deepEqual(pod.room().runtimes, { freevideo: 'installing' })
  rp.statusd = readyStatus({ idleSec: 900, runtimes: { freevideo: { state: 'installing', error: null, sec: 900 } } })
  await pod.refresh()
  assert.equal(pod.guard(), null, 'an install is work, so the idle guard waits')

  let waits = 0
  opts.onWait = () => { if (++waits === 3) rp.statusd = readyStatus({ downloads: { 'loras/l.safetensors': { state: 'done' } }, runtimes: { freevideo: { state: 'ready', error: null, sec: 1200 } } }) }
  const stages = []
  const lora = { repo: 'org/l', path: 'l.safetensors', dir: 'loras', name: 'l.safetensors' }
  rp.statusd = readyStatus({ downloads: { 'loras/l.safetensors': { state: 'done' } }, runtimes: { freevideo: { state: 'installing', error: null, sec: 1000 } } })
  const l = await pod.lease({ files: [lora], runtimes: ['freevideo'], onStage: (s) => stages.push(s) })
  assert.deepEqual([...new Set(stages)], ['installing', 'running'])
  assert.equal(rp.count((c) => c.path === '/runtime/freevideo' && c.method === 'POST'), 1)
  assert.equal(rp.count((c) => c.path === '/download'), 1, 'files download while the runtime installs')
  l.release()

  const before = rp.count((c) => c.path === '/runtime/freevideo')
  await pod.lease({ runtimes: ['freevideo'] }).then((x) => x.release())
  assert.equal(rp.count((c) => c.path === '/runtime/freevideo'), before, 'a ready runtime is not asked again')

  rp.statusd = readyStatus({ runtimes: { freevideo: { state: 'failed', error: 'Insufficient disk space: need 89.1 GiB', sec: 30 } } })
  opts.onWait = () => {}
  // The POST reply says installing again, then the next status says it failed.
  await assert.rejects(pod.lease({ runtimes: ['freevideo'] }), /FreeVideo could not install on the Pod: Insufficient disk space: need 89\.1 GiB/)
  assert.equal(pod.status().runs, 0)
})

await test('freevideo: H3 runs stock on Cloud and small Pods, and on FreeVideo on a 96 GB Pod with room', async () => {
  const { comfyVars } = await import('../shared/mapping.js')
  const { models } = await import('../src/lib/catalog.js')
  const comfyVarsFor = (prompt) => comfyVars('video', { prompt, aspect: '16:9', duration: 5 }, models.find((m) => m.id === 'comfy-h3').sizes)
  const sent = []
  const client = {
    assets: { fromBytes: () => ({}) },
    workflows: { fromFile: async (f) => ({ file: f, json: null, setInput(id) { this.image = id } }) },
    // The proxy lists FreeVideo's mp4 under `images`, so its kind comes from the content type.
    run: async (wf) => { sent.push({ file: path.basename(wf.file), graph: wf.json, image: wf.image }); return { outputs: [{ type: 'image', contentType: 'video/mp4', name: 'video.mp4', toBytes: async () => Buffer.from('mp4') }] } },
  }
  const vars = comfyVarsFor('A fox at dawn')
  const leases = []
  const lease = async (o) => { leases.push(o); return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }
  const run = (workflow, { phase = 'ready', vram = 96, room = { diskFreeGb: 130, runtimes: {} }, v = vars } = {}) =>
    core.runComfy(workflow, v, { createClient: () => client, lease, podPhase: async () => phase, podVram: () => vram, podRoom: () => room })

  podMode()
  const files = await run('h3_open_t2v', { phase: 'none' })
  assert.equal(sent.at(-1).file, 'h3_open_t2v.json', 'Comfy Cloud keeps stock H3')
  assert.equal(files[0].kind, 'video', 'an mp4 is a video, whatever key ComfyUI listed it under')
  assert.equal(leases.length, 0)

  await run('h3_open_t2v')
  assert.equal(sent.at(-1).file, 'h3_freevideo_t2v.json', 'a 96 GB Pod runs FreeVideo')
  const g = sent.at(-1).graph['104']
  assert.equal(g.class_type, 'FreeVideoGenerate')
  assert.deepEqual([g.inputs.text, g.inputs.width, g.inputs.height, g.inputs.seconds, typeof g.inputs.seed], ['A fox at dawn', 1344, 768, 5, 'number'])
  assert.deepEqual(leases.at(-1), { files: [], runtimes: ['freevideo'] }, 'the lease installs FreeVideo instead of downloading stock files')

  await run('h3_open_t2v', { vram: 32 })
  assert.equal(sent.at(-1).file, 'h3_open_t2v.json', 'a 32 GB Pod runs stock H3')
  assert.equal(leases.at(-1).runtimes.length, 0)
  assert(leases.at(-1).files.some((f) => f.name === 'minimax_h3_fl2va_pruned_int8_convrot.safetensors'))

  await run('h3_open_t2v', { room: { diskFreeGb: 40, runtimes: {} } })
  assert.equal(sent.at(-1).file, 'h3_open_t2v.json', 'a full disk without FreeVideo falls back to stock H3')
  await run('h3_open_t2v', { room: { diskFreeGb: 40, runtimes: { freevideo: 'ready' } } })
  assert.equal(sent.at(-1).file, 'h3_freevideo_t2v.json', 'an installed FreeVideo needs no more disk')
  await run('h3_open_t2v', { phase: 'starting' })
  assert.equal(sent.at(-1).file, 'h3_open_t2v.json', 'with a Comfy key, runs use Cloud until the Pod is ready')
  await run('h3_open_t2v', { vram: null })
  assert.equal(sent.at(-1).file, 'h3_open_t2v.json', 'a Pod of unknown size keeps stock H3')

  podMode({})
  await run('h3_open_t2v', { phase: 'starting', room: { diskFreeGb: null, runtimes: {} } })
  assert.equal(sent.at(-1).file, 'h3_freevideo_t2v.json', 'with no Comfy key, the run waits for the starting 96 GB Pod and runs FreeVideo')

  podMode()
  await run('h3_open_i2v', { v: { ...vars, image: 'data:image/png;base64,iVBORw0KGgo=' } })
  assert.equal(sent.at(-1).file, 'h3_freevideo_i2v.json', 'an attached image picks the FreeVideo start-frame graph')
  assert.equal(sent.at(-1).image, '700', 'the image is uploaded to its LoadImage node')
  assert.deepEqual(sent.at(-1).graph['104'].inputs.first, ['700', 0])
})

await test('freevideo: the model list makes FreeVideo graphs Pod-only, sizes their Pod and downloads their LoRAs', () => {
  const read = (n) => JSON.parse(fs.readFileSync(`public/workflows/${n}.json`, 'utf8'))
  assert.deepEqual(runtimesOf(read('h3_freevideo_t2v')).map((e) => e.runtime), ['freevideo'])
  assert.deepEqual(runtimesOf(read('h3_open_t2v')), [])
  assert.deepEqual(modelFilesOf(read('h3_freevideo_t2v')), [], 'FreeVideo fetches its own weights')
  const needs = core.workflowNeeds('h3_freevideo_i2v')
  assert.deepEqual([needs.minVramGb, needs.volumeGb, needs.runtimes[0].cloud], [96, 126, false])
  const pod = core.podNeedsFor('h3_open_t2v')
  assert.deepEqual([pod.minVramGb, pod.volumeGb, pod.runtimes.map((e) => e.name)], [96, 126, ['FreeVideo']], 'a Pod started for H3 is sized for FreeVideo')
  assert.equal(core.podNeedsFor('h3_open_i2v').runtimes.length, 1)
  assert.equal(core.workflowNeeds('h3_open_t2v').minVramGb, 32, 'stock H3 keeps its own needs for Cloud and small Pods')
  assert.deepEqual(core.podNeedsFor('ltx25_t2v'), core.workflowNeeds('ltx25_t2v'), 'a model without a Pod graph is sized as before')
  const lora = 'minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors'
  const graph = { 104: { class_type: 'FreeVideoGenerate', inputs: { loras: ['601', 0] } }, 601: { class_type: 'FreeVideoLoRA', inputs: { lora, strength: 1 } }, 602: { class_type: 'FreeVideoLoRA', inputs: { lora: 'None', strength: 1 } } }
  assert.deepEqual(podNeedsOf(graph).map((n) => n.runtime || `${n.dir}/${n.name}`), [`loras/${lora}`, 'freevideo'], 'a FreeVideo LoRA downloads like any LoRA; None is no file')
})

await test('freevideo: the sandbox installs FreeVideo on a Pod started for it, and again after a resume', async () => {
  const dir = fs.mkdtempSync(path.join(tmp, 'sandbox-fv-'))
  const clock = { t: Date.now() }
  const net = sandboxFetch({ file: () => path.join(dir, 'pod-sandbox.json'), now: () => clock.t, mode: '1' })
  const pod = podManager({ fetch: net, now: () => clock.t, keys: () => ({ key: 'sandbox' }), dir: () => dir, sandbox: true, owner: true, wait: async () => { clock.t += 3000 } })
  await pod.start({ minVramGb: 96, volumeGb: 126, runtimes: ['freevideo'] })
  clock.t += 16000
  const s = await pod.tick()
  assert.equal(s.phase, 'ready')
  assert.deepEqual(s.runtimes.map((e) => [e.name, e.state]), [['FreeVideo', 'installing']])
  const { podLabel, takeLabel } = await import('../src/lib/usePod.js')
  assert.equal(podLabel(s), 'Installing FreeVideo')
  assert.equal(takeLabel({ provider: 'comfy' }, { ...s, mode: 'cloud' }), 'Installing FreeVideo on the Pod')
  const l = await pod.lease({ runtimes: ['freevideo'] })
  assert.equal(pod.status().runtimes[0].state, 'ready')
  assert.equal(podLabel(pod.status()), '1 running')
  l.release()
  await pod.pause({ now: true })
  await pod.resume()
  clock.t += 12000
  assert.equal((await pod.tick()).runtimes[0].state, 'installing', 'a resumed Pod runs the installer again')
  await pod.terminate({ now: true })
})

// ---- Comfy Cloud and Pods only ----------------------------------------------------------------------

await test('cloud only: ComfyUI runs on Comfy Cloud and Pods by default, and saved settings cannot pick a local ComfyUI', async () => {
  podMode({})
  assert.equal(core.comfyMode(), 'cloud', 'a fresh install has no mode saved and no .env')
  // An old keys.json that chose Local, as the app could save before.
  core.writeKeys({ comfy: { key: 'comfy-key', mode: 'local', url: 'http://127.0.0.1:8188' } })
  assert.deepEqual([core.config('comfy').mode, core.config('comfy').url], ['cloud', ''])
  assert.equal(core.connections().comfy.mode, 'cloud')
  assert(!('url' in core.connections().comfy))
  globalThis.fetch = async () => { throw new Error('no local ComfyUI call') }
  const sent = []
  const client = { workflows: { fromFile: async () => ({ json: null, setInput() {} }) }, run: async (wf) => { sent.push(wf.json); return { outputs: [{ type: 'image', contentType: 'image/png', name: 'x.png', toBytes: async () => Buffer.from('png') }] } } }
  await core.runComfy('image_sdxl', sdxl, { createClient: () => client, podPhase: async () => 'none' })
  assert.equal(sent.length, 1, 'the old saved Local is ignored: the run went to Comfy Cloud')
  process.env.COMFY_MODE = 'local'
  assert.equal(core.comfyMode(), 'local', 'development can still use a local ComfyUI through .env')
  process.env.COMFY_MODE = ''
  const { providerInfo } = await import('../src/lib/catalog.js')
  assert.deepEqual(providerInfo.comfy.fields.map((f) => f.id), ['key'], 'the ComfyUI card asks only for the Comfy API key')
  assert.equal(providerInfo.comfy.link, 'https://platform.comfy.org/profile/api-keys')
  assert(!/your own ComfyUI|Local/.test(providerInfo.comfy.blurb))
  assert(!/COMFY_MODE=local\s*$/m.test(fs.readFileSync('.env.example', 'utf8').replace(/^#.*$/gm, '')), '.env.example does not turn on a local ComfyUI')
})

// ---- video edits -----------------------------------------------------------------------------------

const EDITS = { bernini_swap: [848, 81], bernini_swap_noref: [848, 81], bernini_restyle: [848, 81], bernini_relight: [848, 81], bernini_headswap: [640, 73], wan_animate2: [832, 81] }
const readGraph = (n) => JSON.parse(fs.readFileSync(`public/workflows/${n}.json`, 'utf8'))
// ComfyMathExpression runs Python, whose round() rounds a half to the even number.
const pyRound = (x) => { const r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 ? r - 1 : r }
const evalMath = (expr, a, b) => new Function('a', 'b', 'min', 'max', 'round', 'floor', `return ${expr}`)(a, b, Math.min, Math.max, pyRound, Math.floor)

await test('video edits: a clip travels with its trim, and a saved character stands in for a photo', async () => {
  const { comfyVars } = await import('../shared/mapping.js')
  const v = comfyVars('video', { prompt: 'x', aspect: '1:1', video: '/media/clip.mp4', trim: { start: 1.25, end: 4.5 }, duration: 5 })
  assert.deepEqual([v.video, v.start, v.duration], ['/media/clip.mp4', 1.25, 3.25])
  assert.deepEqual([comfyVars('video', { prompt: 'x', aspect: '1:1', media: { video: '/media/a.mp4' } }).video, comfyVars('video', { prompt: 'x', aspect: '1:1' }).start], ['/media/a.mp4', 0])
  assert.equal(comfyVars('video', { prompt: 'x', aspect: '1:1', duration: 8 }).duration, 8, 'without a clip, duration is the length to make')
  const ref = { type: 'character', name: 'Mia', images: ['/media/mia.png'] }
  assert.equal(comfyVars('video', { prompt: 'x', aspect: '1:1', refs: [{ type: 'brand', images: [] }, ref] }).image, '/media/mia.png')
  assert.equal(comfyVars('video', { prompt: 'x', aspect: '1:1', images: ['/media/face.png'], refs: [ref] }).image, '/media/face.png', 'a photo wins over a character')
})

await test('video edits: each graph trims, sizes and caps itself from its clip', () => {
  for (const [name, [edge, cap]] of Object.entries(EDITS)) {
    const g = readGraph(name)
    assert.equal(g['1'].class_type, 'LoadVideo')
    assert.equal(g['1'].inputs.file, '{{video}}', name)
    assert.deepEqual([g['2'].inputs.start_time, g['2'].inputs.duration], ['{{start}}', '{{duration}}'], `${name} uses the trim`)
    assert.equal(g['81'].inputs.value, cap, `${name} frame cap`)
    const at = (a, b) => [evalMath(g['83'].inputs.expression, a, b), evalMath(g['84'].inputs.expression, a, b)]
    const wide = at(1920, 1080)
    assert.equal(Math.max(...wide), edge, `${name} long edge`)
    assert(wide.every((n) => n % 16 === 0), `${name} multiples of 16`)
    assert.deepEqual(at(1080, 1920), [...wide].reverse(), `${name} portrait`)
    assert.deepEqual(at(320, 240), [320, 240], `${name} never upscales`)
    assert.equal(evalMath(g['82'].inputs.expression, 121, cap), cap, `${name} caps a long clip`)
    assert.equal(evalMath(g['82'].inputs.expression, 50, cap), 49, `${name} keeps a short clip at 4n+1`)
    assert(!JSON.stringify(g).includes('{{width}}') && !JSON.stringify(g).includes('{{frames}}'))
    for (const node of Object.values(g)) for (const [k, val] of Object.entries(node.inputs)) if (val?.[0] === '83' || val?.[0] === '84') assert(['width', 'height'].includes(k), `${name}: ${k}`)
  }
  assert.deepEqual(evalMath(readGraph('bernini_swap')['83'].inputs.expression, 1920, 1080), 848)
  assert.deepEqual(evalMath(readGraph('bernini_swap')['84'].inputs.expression, 1920, 1080), 480, '1080p becomes 848x480, as the Bernini-R template')
})

await test('video edits: Cloud takes the edits it has every file for; the face swap needs a Pod that downloads both LoRAs', async () => {
  const sent = []
  const client = {
    assets: { fromBytes: (buf, o) => ({ asset: o.filename, type: o.contentType, bytes: buf.length }) },
    workflows: { fromFile: async (f) => ({ file: f, json: null, inputs: {}, setInput(id, field, v) { this.inputs[`${id}.${field}`] = v } }) },
    run: async (wf) => { sent.push({ file: path.basename(wf.file), inputs: wf.inputs }); return { outputs: [{ type: 'image', contentType: 'video/mp4', name: 'out.mp4', toBytes: async () => Buffer.from('mp4') }] } },
  }
  const leases = []
  const lease = async (o) => { leases.push(o); return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }
  const clip = 'data:video/mp4;base64,AAAAIGZ0eXBpc29t'
  const face = 'data:image/png;base64,iVBORw0KGgo='
  const vars = { prompt: 'Swap', seed: 1, start: 0, duration: 3, video: clip, image: face }
  const run = (w, phase = 'none') => core.runComfy(w, vars, { createClient: () => client, lease, podPhase: async () => phase, podVram: () => 24, podRoom: () => ({}) })

  podMode()
  for (const w of ['bernini_swap', 'bernini_swap_noref', 'bernini_restyle', 'bernini_relight', 'wan_animate2']) {
    const files = await run(w)
    assert.equal(files[0].kind, 'video')
    assert.equal(sent.at(-1).file, `${w}.json`)
    assert.deepEqual(sent.at(-1).inputs['1.file'], { asset: 'input.mp4', type: 'video/mp4', bytes: 12 }, `${w} uploads the clip to LoadVideo`)
  }
  assert.equal(leases.length, 0, 'Comfy Cloud has every file these use')
  assert.equal(sent.find((x) => x.file === 'bernini_swap.json').inputs['12.image'].type, 'image/png', 'the reference uploads too')
  await assert.rejects(run('bernini_headswap'), (e) => e.code === 'needs_pod' && e.reason === 'The head swap LoRA is not on Comfy Cloud yet')

  await run('bernini_headswap', 'ready')
  assert.deepEqual(leases.at(-1).files.filter((f) => f.dir === 'loras').map((f) => f.name).sort(),
    ['headswap_bernini_r64_73f640_step3000_high_noise.safetensors', 'headswap_bernini_r64_73f640_step3000_low_noise.safetensors'], 'the Pod downloads both head swap LoRAs')
  assert(leases.at(-1).files.every((f) => /^[0-9a-f]{64}$/.test(f.sha256)), 'each download is pinned by sha256')
  assert.equal(core.workflowNeeds('wan_animate2').files.find((f) => f.dir === 'clip_vision').name, 'clip_vision_h.safetensors', 'a CLIP vision file downloads to its own folder')
  assert(podBootScript().includes('clip_vision: clip_vision'), 'ComfyUI on the Pod finds that folder')
  assert.equal(core.podNeedsFor('bernini_headswap').minVramGb, 24)
})

await test('video edits: local ComfyUI gets the clip through its upload route', async () => {
  podMode({})
  Object.assign(process.env, { COMFY_MODE: 'local', COMFY_URL: 'http://comfy.test' })
  const calls = []
  let prompt = null
  globalThis.fetch = async (url, init = {}) => {
    const u = new URL(url)
    calls.push(`${init.method || 'GET'} ${u.pathname}`)
    if (u.pathname === '/upload/image') {
      const file = init.body.get('image')
      return jsonReply({ name: file.name.replace(/^comfyfield-[\w-]+/, 'up'), subfolder: '' })
    }
    if (u.pathname === '/prompt') { prompt = JSON.parse(init.body).prompt; return jsonReply({ prompt_id: 'p1' }) }
    if (u.pathname === '/history/p1') return jsonReply({ p1: { outputs: { 21: { images: [{ filename: 'out.mp4', subfolder: 'comfyfield', type: 'output' }] } } } })
    throw new Error(`unexpected ${url}`)
  }
  const files = await core.runComfy('bernini_swap', { prompt: 'Swap', seed: 1, start: 0.5, duration: 2, video: 'data:video/quicktime;base64,AAAA', image: 'data:image/png;base64,iVBORw0KGgo=' })
  assert.deepEqual([prompt['1'].inputs.file, prompt['12'].inputs.image], ['up.mov', 'up.png'], 'a .mov keeps its extension, so LoadVideo lists it')
  assert.deepEqual([prompt['2'].inputs.start_time, prompt['2'].inputs.duration], [0.5, 2])
  assert.equal(calls.filter((c) => c === 'POST /upload/image').length, 2)
  assert.equal(files[0].kind, 'video')
  Object.assign(process.env, { COMFY_MODE: '', COMFY_URL: '' })
})

await test('video edits: the Genjutsu formats run on these graphs and show in the app', async () => {
  const { formats } = await import('../src/lib/formats/index.js')
  const { compileFormat } = await import('../src/lib/formats/runner.js')
  const { validateFormat } = await import('../src/lib/formats/validate.js')
  const byId = Object.fromEntries(formats.map((f) => [f.id, f]))
  for (const id of ['swap-element', 'motion-transfer', 'face-swap-video', 'restyle-video', 'video-relight']) {
    assert(byId[id], `${id} shows`)
    assert.deepEqual(validateFormat(byId[id]), [], id)
  }
  assert.equal(byId['face-swap-video'].steps[0].workflow, 'bernini_headswap')
  assert.deepEqual([byId['swap-element'].steps[0].workflow, byId['swap-element'].steps[0].imageWorkflow], ['bernini_swap_noref', 'bernini_swap'])
  const clipValue = { url: '/media/clip.mp4', duration: 6, ratio: '1920:1080', trim: { start: 1, end: 4 } }
  const motion = compileFormat(byId['motion-transfer'], { video: clipValue, image: { url: '/media/me.png' }, background: 'rooftop' }).nodes.find((n) => n.type === 'model')
  assert.equal(motion.data.prompt, 'Character appearance: the person from the image, with their own face, hair, outfit and look. Background: a city rooftop at sunset.')
  assert(!/move|gesture|perform/i.test(motion.data.prompt), 'Wan Animate 2 wants no motion words in the prompt')
  const swap = compileFormat(byId['swap-element'], { video: clipValue, change: 'the car', into: 'a scooter' }).nodes.find((n) => n.type === 'model').data.model
  assert.deepEqual([swap.workflow, swap.imageWorkflow], ['bernini_swap_noref', 'bernini_swap'], 'the reference graph waits for a reference')
  const { openModels } = await import('../src/lib/tools.js')
  assert.equal(openModels.find((m) => m.id === 'bernini-r').vendor, 'ByteDance')
})

// ---- Pods page -------------------------------------------------------------------------------------

const creates = (rp) => rp.calls.filter((c) => c.path === '/v1/pods' && c.method === 'POST').map((c) => c.body)

await test('pods page: a GPU picked by hand is the only one tried, and it must fit', async () => {
  const pick = { gpuTypeId: 'NVIDIA RTX PRO 4500 Blackwell', cloudType: 'SECURE' }
  const a = setup()
  await a.pod.start({ gpu: pick, volumeGb: 200 })
  assert.deepEqual(creates(a.rp).map((b) => [b.gpuTypeIds[0], b.cloudType, b.volumeInGb]), [[pick.gpuTypeId, 'SECURE', 200]])
  assert.equal(a.pod.status().pod.gpu, 'RTX PRO 4500')

  const b = setup()
  b.rp.create.push({ status: 500, data: { error: 'There are no instances currently available' } })
  await assert.rejects(b.pod.start({ gpu: pick }), (e) => e.code === 'no_capacity' && /no free RTX PRO 4500 on Secure cloud right now\. Pick another GPU/.test(e.message))
  assert.equal(creates(b.rp).length, 1, 'no other GPU is tried')

  const c = setup()
  await assert.rejects(c.pod.start({ gpu: { gpuTypeId: 'NVIDIA H100 80GB HBM3', cloudType: 'SECURE' } }), /does not start that GPU/)
  await assert.rejects(c.pod.start({ gpu: pick, minVramGb: 96 }), /RTX PRO 4500 has 32 GB; this needs 96 GB/)
  assert.equal(creates(c.rp).length, 0)
})

await test('pods page: FreeVideo installs only on a 96 GB GPU, with a disk big enough for it', async () => {
  const a = setup()
  await a.pod.start({ runtimes: ['freevideo'], volumeGb: 120 })
  const body = creates(a.rp)[0]
  assert.equal(body.gpuTypeIds[0], 'NVIDIA RTX PRO 6000 Blackwell Server Edition', 'smaller GPUs are skipped')
  assert.equal(body.env.CF_RUNTIMES, 'freevideo')
  assert.equal(body.volumeInGb, 130, 'the disk grows to fit FreeVideo')
  const b = setup()
  await assert.rejects(b.pod.start({ gpu: { gpuTypeId: 'NVIDIA RTX PRO 4000 Blackwell', cloudType: 'SECURE' }, runtimes: ['freevideo'] }), /FreeVideo needs a 96 GB GPU/)
  await assert.rejects(b.pod.start({ runtimes: ['nope'] }), /Unknown runtime/)
})

await test('pods page: the idle shutdown is a setting each Pod keeps, for the app and its own watchdog', async () => {
  podMode()
  assert.throws(() => core.saveConnection('runpod', { idle: '7' }), /Idle shutdown is 5, 10, 15, 30, 60 minutes/)
  assert.equal(core.connections().runpod.idle, 10, 'ten minutes by default')
  core.saveConnection('runpod', { idle: '30' })
  assert.equal(core.connections().runpod.idle, 30)

  const { pod, rp, clock } = setup({ idle: '30' })
  await pod.start()
  assert.equal(creates(rp)[0].env.IDLE_AFTER, String(30 * 60 + 180), 'the watchdog gets the same time, 3 minutes later')
  assert.equal(pod.status().pod.idleMin, 30)
  rp.statusd = readyStatus({ idleSec: 1790 })
  await pod.refresh()
  assert.equal(pod.guard(), null)
  rp.statusd = readyStatus({ idleSec: 1800 })
  await pod.refresh()
  assert.equal(pod.guard(), 'Terminated after 30 idle minutes.')
  clock.t += 1000
  const old = setup()
  await old.pod.start()
  assert.equal(old.pod.status().pod.idleMin, 10, 'a Pod started before the change keeps its time')
})

await test('pods page: the page lists sizes with the models that need them, and checks a start from it', async () => {
  const o = await core.podOptions()
  assert.deepEqual(o.tiers.map((t) => [t.label, t.vramGb, t.rung.name]), [['Small', 24, 'RTX PRO 4000'], ['Medium', 32, 'RTX PRO 4500'], ['Large', 96, 'RTX PRO 6000']])
  assert(o.tiers[0].models.includes('FLUX 3 Klein'))
  assert(o.tiers[1].models.includes('LTX-2.5') && o.tiers[1].models.includes('MiniMax H3 (open weights)'), 'stock H3 runs on 32 GB')
  assert.deepEqual(o.tiers[2].models, ['MiniMax H3 on FreeVideo'])
    assert.equal(o.rungs.length, GPU_LADDER.length)
  assert.deepEqual([o.volumes, o.idleChoices, o.runtimes[0].diskGb], [[120, 200, 300], [5, 10, 15, 30, 60], 130])

  const { podAction } = await import('../server/plugin.js')
  await assert.rejects(podAction('start', { volumeGb: 150 }), /Pick a disk of 120, 200, 300 GB/)
  await assert.rejects(podAction('start', { runtimes: 'freevideo' }), /Runtimes are a list/)
})

// ---- Generation type and Session tiers ---------------------------------------------------------------

const { tierPicks, jobSecondsOf, DEFAULT_REF_SECONDS } = await import('../shared/gpuTiers.js')
const gpu = (id, usdPerHr, speed, extra = {}) => ({ gpuTypeId: id, cloudType: 'SECURE', name: id, vramGb: 48, usdPerHr, speed, inStock: true, ...extra })
const ids = (t) => t.order.map((o) => o.gpuTypeId)

await test('tiers: Budget is the lowest cost per job, Balanced faster within 1.5 times that, Performance the fastest', () => {
  // A 60 s job: Slow costs $0.0167, Mid $0.0150, Fast $0.0167 (1.11x Mid), Fastest $0.0267 (1.78x Mid).
  const rungs = [gpu('Slow', 0.5, 0.5), gpu('Mid', 0.9, 1), gpu('Fast', 2, 2), gpu('Fastest', 4, 2.5)]
  const [budget, balanced, performance] = tierPicks(rungs, { refSeconds: 60 })
  assert.equal(budget.gpu.gpuTypeId, 'Mid', 'the cheapest per job, not the cheapest per hour')
  assert.equal(Math.round(budget.gpu.usdPerJob * 10000), 150)
  assert.equal(balanced.gpu.gpuTypeId, 'Fast', 'Fastest costs 1.78 times Budget, above the cap')
  assert.equal(performance.gpu.gpuTypeId, 'Fastest')
  assert.equal(performance.gpu.seconds, 24)
  assert.deepEqual(ids(budget), ['Mid', 'Fast', 'Slow', 'Fastest'], 'ties on cost go to the faster GPU')
  for (const t of [budget, balanced, performance]) assert.equal(t.order.length, 4, 'every fitting GPU is a fallback')
  assert(tierPicks(rungs, { refSeconds: 60, cap: 2 })[1].gpu.gpuTypeId === 'Fastest', 'the cap is a setting')
})

await test('tiers: stock moves free GPUs first, Balanced falls back to Budget, and twins are named', () => {
  const rungs = [gpu('Mid', 0.9, 1), gpu('Fast', 2, 2, { inStock: false }), gpu('Fastest', 4, 2.5)]
  const [budget, balanced, performance] = tierPicks(rungs, { refSeconds: 60 })
  assert.equal(balanced.gpu.gpuTypeId, 'Mid', 'with Fast taken, Balanced falls back to Budget, not to a GPU above the cap')
  assert.equal(balanced.sameAs, 'budget')
  assert.deepEqual(ids(balanced), ['Mid', 'Fastest', 'Fast'])
  assert.equal(performance.gpu.gpuTypeId, 'Fastest')
  assert.equal(budget.sameAs, null)
  // With one GPU, all three tiers are that GPU.
  const one = tierPicks([gpu('Only', 1, 1)], { refSeconds: 30 })
  assert.deepEqual(one.map((t) => [t.gpu.gpuTypeId, t.sameAs]), [['Only', null], ['Only', 'budget'], ['Only', 'budget']])
  // No price yet (no RunPod key): times still show, costs are unknown.
  const unpriced = tierPicks([gpu('A', null, 1), gpu('B', null, 2)], { refSeconds: 60 })
  assert.deepEqual(unpriced.map((t) => t.gpu.usdPerJob), [null, null, null])
  assert.equal(unpriced[2].gpu.gpuTypeId, 'B')
  assert.deepEqual(tierPicks([], { refSeconds: 60 }).map((t) => t.gpu), [null, null, null])
})

await test('tiers: a job takes the longest reference time of its model files', () => {
  assert.equal(jobSecondsOf([{ refSec: 40 }, { refSec: 200 }, {}]), 200)
  assert.equal(jobSecondsOf([{ gb: 3 }]), DEFAULT_REF_SECONDS)
  assert.equal(jobSecondsOf([]), DEFAULT_REF_SECONDS)
})

await test('tiers: a start walks the tier order on capacity refusals, and records the tier', async () => {
  const [small, big] = [GPU_LADDER[1], GPU_LADDER[2]]
  const { pod, rp } = setup()
  rp.create.push({ status: 500, data: { error: 'There are no instances currently available' } })
  const s = await pod.start({ minVramGb: 32, order: [big, small].map(({ gpuTypeId, cloudType }) => ({ gpuTypeId, cloudType })), tier: 'performance' })
  assert.deepEqual(creates(rp).map((b) => [b.gpuTypeIds[0], b.cloudType]), [[big.gpuTypeId, big.cloudType], [small.gpuTypeId, small.cloudType]])
  assert.equal(s.pod.gpu, small.name)
  assert.deepEqual([s.pod.tier, s.pod.fellBack], ['performance', true])
  // An order naming a GPU too small for the job skips it.
  const b = setup()
  await b.pod.start({ minVramGb: 96, order: [GPU_LADDER[0], big].map(({ gpuTypeId, cloudType }) => ({ gpuTypeId, cloudType })), tier: 'budget' })
  assert.deepEqual(creates(b.rp).map((x) => x.gpuTypeIds[0]), [big.gpuTypeId])
  assert.equal(b.pod.status().pod.fellBack, false)
})

await test('generation type: Instant never uses a Pod, Session never uses Cloud, and unset keeps the old routing', async () => {
  const client = { workflows: { fromFile: async () => ({ json: null, setInput() {} }) }, run: async () => ({ outputs: [{ type: 'image', contentType: 'image/png', name: 'x.png', toBytes: async () => Buffer.from('i') }] }) }
  let leased = 0
  const lease = async () => { leased++; return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }
  const opts = (phase, run) => ({ createClient: () => client, lease, podPhase: async () => phase, podVram: () => 96, podRoom: () => ({}), run })

  podMode()
  await core.runComfy('image_sdxl', sdxl, opts('ready', 'instant'))
  assert.equal(leased, 0, 'Instant sends the run to Cloud even with a ready Pod')
  await core.runComfy('image_sdxl', sdxl, opts('ready', null))
  assert.equal(leased, 1, 'unset: a ready Pod takes the run, as before')
  await core.runComfy('image_sdxl', sdxl, opts('ready', 'session'))
  assert.equal(leased, 2, 'Session: the Pod takes it')
  await assert.rejects(core.runComfy('image_sdxl', sdxl, opts('none', 'session')),
    (e) => e.code === 'needs_pod' && e.reason === null && /You picked Session/.test(e.message))
  await core.runComfy('image_sdxl', sdxl, opts('starting', 'session'))
  assert.equal(leased, 3, 'Session waits for a starting Pod instead of using Cloud')

  podMode({})
  await assert.rejects(core.runComfy('image_sdxl', sdxl, opts('ready', 'instant')),
    (e) => e.code === 'needs_pod' && /Comfy API key/.test(e.reason) && /needs a Session/.test(e.message))
  assert.equal(leased, 3, 'Instant without a Comfy key still never uses the Pod')

  podMode()
  assert.throws(() => core.saveConnection('comfy', { run: 'local' }), /instant or session/)
  core.saveConnection('comfy', { run: 'instant' })
  assert.equal(core.runType(), 'instant')
  assert.throws(() => core.saveConnection('runpod', { tier: 'cheap' }), /budget, balanced, performance/)
  assert.equal(core.podTier(), 'balanced')
})

await test('tiers: Session tiers may start the faster cards, and an NVFP4 run stays on Blackwell', async () => {
  const { GPU_EXTRA, GPU_CATALOG } = await import('../server/pod.js')
  const { archOf, RUNTIMES } = await import('../shared/modelFiles.js')
  const { pod, rp } = setup()
  const h200 = GPU_EXTRA.find((g) => g.name === 'H200' && g.cloudType === 'COMMUNITY')
  const s = await pod.start({ minVramGb: 32, order: [{ gpuTypeId: h200.gpuTypeId, cloudType: h200.cloudType }], tier: 'performance' })
  assert.deepEqual([s.pod.gpu, s.pod.vramGb], ['H200', 141])
  assert.equal(pod.arch(), 'hopper')
  assert.deepEqual(creates(rp).map((b) => b.gpuTypeIds[0]), ['NVIDIA H200'])
  // The ladder alone still starts only ladder GPUs, and the Pods page cannot pick an extra card by hand.
  assert(GPU_CATALOG.length === GPU_LADDER.length + GPU_EXTRA.length)
  await assert.rejects(setup().pod.start({ gpu: { gpuTypeId: h200.gpuTypeId, cloudType: h200.cloudType } }), /does not start that GPU/)
  // A quote over the catalog with an architecture keeps only that architecture.
  const q = await setup().pod.quote({ minVramGb: 32, catalog: true, arch: 'blackwell' })
  assert(q.rungs.length > 0 && q.rungs.every((r) => r.arch === 'blackwell' && r.vramGb >= 32))
  assert((await setup().pod.quote({ minVramGb: 32, catalog: true })).rungs.some((r) => r.arch === 'hopper'))
  assert.equal(archOf([{ name: 'qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors', ...MODEL_FILES['qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors'] }]), 'blackwell')
  assert.equal(RUNTIMES.freevideo.arch, 'blackwell')
  // H3's graph needs Blackwell, and a Hopper Pod is too small for it in the same way a small Pod is.
  const h3 = { prompt: 'A fox', width: 1344, height: 768, frames: 121, seed: 1 }
  const client = { workflows: { fromFile: async () => ({ json: null, setInput() {} }) }, run: async () => ({ outputs: [] }) }
  podMode({})
  await assert.rejects(core.runComfy('h3_open_t2v', h3, { createClient: () => client, lease: async () => { throw new Error('no lease') }, podPhase: async () => 'ready', podVram: () => 141, podArch: () => 'hopper', run: 'session' }),
    (e) => e.code === 'pod_too_small' && /needs a Blackwell GPU; your Pod has a Hopper one/.test(e.message)
      && e.fit.needArch === 'Blackwell' && e.fit.podArch === 'Hopper', 'the error names the GPU families for the replace sheet')
})

await test('generation type: approving a Session switches the user to it, on the tier they picked', async () => {
  podMode()
  core.saveConnection('comfy', { run: 'instant' })
  const plugin = await import('../server/plugin.js')
  await assert.rejects(plugin.podAction('start', { workflow: 'image_sdxl', tier: 'cheap' }), /The Session tier is budget, balanced, performance/)
  assert.equal(core.runType(), 'instant', 'a refused start changes nothing')
})

// ---- Every service on a Pod: node packs, early downloads, disk room, uploads ----------------------

await test('node packs: a graph\'s node classes decide its packs, and a pack Comfy Cloud has keeps the graph on Cloud', async () => {
  const { notOnCloud, RUNTIMES, NODE_PACKS } = await import('../shared/modelFiles.js')
  const graph = { 1: { class_type: 'VHS_SelectEveryNthImage', inputs: {} }, 2: { class_type: 'ColorMatch', inputs: {} }, 3: { class_type: 'KSampler', inputs: {} } }
  assert.deepEqual(runtimesOf(graph).map((r) => [r.runtime, r.pack, r.cloud]), [['vhs', true, true], ['kjnodes', true, true]])
  assert.deepEqual(notOnCloud(podNeedsOf(graph)), [], 'Cloud preinstalls both packs')
  RUNTIMES.testpack = { name: 'Test pack', pack: true, nodes: ['TestNode'], vramGb: 0, gb: 1, minutes: [1, 3], cloud: false }
  try {
    assert.deepEqual(notOnCloud(podNeedsOf({ 1: { class_type: 'TestNode', inputs: {} } })).map((r) => r.name), ['Test pack'], 'a pack Cloud lacks makes the graph Pod-only')
  } finally { delete RUNTIMES.testpack }
  for (const [id, p] of Object.entries(NODE_PACKS)) {
    assert(/^[a-z0-9]+$/.test(id) && /^[0-9a-f]{40}$/.test(p.commit) && p.classes.length && /^\d{4}-\d{2}-\d{2}$/.test(p.date), `${id} is pinned by commit, with its date and classes`)
  }
  const { pod, rp } = setup()
  await pod.start({ runtimes: ['vhs', 'kjnodes'] })
  const body = rp.calls.find((c) => c.path === '/v1/pods' && c.method === 'POST').body
  assert.equal(body.env.CF_RUNTIMES, 'vhs kjnodes')
  assert.equal(body.gpuTypeIds[0], GPU_LADDER[0].gpuTypeId, 'a pack needs no bigger GPU')
})

await test('node packs: the boot script installs packs before ComfyUI starts, keeps them on the volume and whitelists them', async () => {
  const script = podBootScript()
  assert(script.includes('vhs\tComfyUI-VideoHelperSuite\tVHS_SelectEveryNthImage'), 'the status server learns each pack and the classes to look for')
  assert(script.includes('  vhs) repo=https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git; commit=4d907bee61e92c2e65af3bd6383a4e4d356126d1; folder=ComfyUI-VideoHelperSuite; ;;'), 'each pack is pinned by commit')
  const pack = script.slice(script.indexOf("<<'PACK'"), script.lastIndexOf('\nPACK\n'))
  assert(pack.includes('P=/workspace/cf-nodes'), 'clones stay on the volume, so a paused Pod keeps them')
  assert(pack.includes('-c /root/cf/constraints.txt') && pack.includes("grep -iE '^(torch|torchvision|torchaudio|numpy"), 'a pack\'s requirements never move the image\'s torch')
  assert(pack.includes('PIP_CACHE_DIR=/workspace/.cache/pip'), 'a resumed Pod reinstalls from the cache')
  assert(pack.includes('[ -L "$C/custom_nodes/$folder" ] || rm -rf "$C/custom_nodes/$folder"'), 'an older copy in the image gives way')
  assert(/main\.py [^\n]*--whitelist-custom-nodes FreeVideo \$\(cat "\$CF\/nodes\.list" 2>\/dev\/null\)/.test(script), 'each ComfyUI start loads every installed pack')
  assert(/echo \$! > "\$CF\/comfy\.pid"/.test(script), 'the status server can restart ComfyUI')
  const at = (s) => script.indexOf(s)
  assert(at('STAGE freevideo-clone') < at('touch "$CF/.base-ready"') && at('touch "$CF/.base-ready"') < at('STAGE packs') && at('STAGE packs') < at('STAGE comfy ') && at('STAGE comfy ') < at('main.py'),
    'installs wait for the boot\'s own pip, and ComfyUI waits for the packs')
  assert(/while IFS=\$'\\t' read -r id folder classes before; do \[ -d "\/workspace\/cf-nodes\/\$folder" \] && want="\$want \$id"/.test(script), 'a resumed Pod installs its packs again')
  const { MODEL_DIRS, PACK_DIRS } = await import('../shared/modelFiles.js')
  assert(script.includes(`CF_DIRS="${[...new Set([...MODEL_DIRS, ...PACK_DIRS])].join(' ')}" nohup`), 'the status server takes its folders from the loaders and the packs')
  for (const d of MODEL_DIRS) assert(script.includes(`  ${d}: ${d}\n`), `ComfyUI finds ${d} on the volume`)
  const proxy = script.slice(script.indexOf('STAGE proxy-install'), script.indexOf('STAGE comfy-update'))
  assert(proxy.includes(`sed -i 's/^\\(    "files": "file",\\)$/\\1\\n    "3d": "file",/' "$PA"`), 'the proxy passes on 3D outputs')
  assert(!/die "[^"]*3D/.test(proxy), 'a proxy that cannot be taught 3D still runs everything else')
  assert.throws(() => podBootScript({ packs: { bad: { repo: 'x/y; rm -rf /', commit: 'a'.repeat(40), folder: 'F', classes: ['C'] } } }), /unsafe/)
  assert.throws(() => podBootScript({ packs: { ok: { repo: 'x/y', commit: 'main', folder: 'F', classes: ['C'] } } }), /unsafe/, 'a branch name is no pin')
  if (hasBash) {
    const f = path.join(tmp, 'boot-packs.sh')
    fs.writeFileSync(f, script)
    const r = spawnSync('bash', ['-n', f], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
  }
})

await test('node packs: the status server installs a pack, restarts ComfyUI with an empty queue to load it, and says when it did not load', { skip: (!python || !hasBash) && 'needs Python 3.9+ and bash' }, async (t) => {
  const port = freePort()
  const base = path.join(tmp, 'statusd-packs').replace(/\\/g, '/')
  fs.mkdirSync(base, { recursive: true })
  fs.writeFileSync(`${base}/.base-ready`, '')
  fs.writeFileSync(`${base}/packs.tsv`, 'vhs\tComfyUI-VideoHelperSuite\tVHS_SelectEveryNthImage\nkjnodes\tComfyUI-KJNodes\tColorMatch\n')
  fs.writeFileSync(`${base}/runtime-pack.sh`, ['#!/bin/bash', `env > "${base}/env-$1.txt"`, 'echo "installing $1"', 'sleep 0.3', ''].join('\n'))
  // A fake ComfyUI: it lists a pack's class once it has started again after the pack installed.
  const comfy = { queue: 1, lists: new Set(), starts: 0 }
  let dummy
  const startDummy = () => {
    dummy = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' })
    fs.writeFileSync(`${base}/comfy.pid`, String(dummy.pid))
    dummy.once('exit', () => { comfy.starts++; comfy.onRestart?.(); startDummy() })
  }
  startDummy()
  t.after(() => { dummy.removeAllListeners('exit'); dummy.kill() })
  const server = await listen((req, res) => {
    const [, , cls] = req.url.split('/')
    if (req.url === '/queue') return res.end(JSON.stringify({ queue_running: Array(comfy.queue).fill([]), queue_pending: [] }))
    if (req.url.startsWith('/object_info/')) return res.end(JSON.stringify(comfy.lists.has(cls) ? { [cls]: {} } : {}))
    res.end('{}')
  })
  t.after(() => server.close())
  const proc = startStatusd({ POD_TOKEN: 'secret', RUNPOD_API_KEY: 'acct', CF_BASE: base, CF_MODELS: `${base}/models`, CF_STATUS_PORT: String(port),
    CF_COMFY_URL: `http://127.0.0.1:${server.address().port}`, CF_PROXY_URL: 'http://127.0.0.1:9', CF_TICK: '0.2', CF_RESTART_GRACE: '0.5', CF_DRY_KILL: '1' })
  t.after(() => proc.kill())
  const url = `http://127.0.0.1:${port}`
  const auth = { Authorization: 'Bearer secret' }
  const status = async () => (await netFetch(`${url}/status`, { headers: auth })).json()
  await proc.ready(url, async () => (await netFetch(`${url}/status`, { headers: auth })).ok)
  assert.equal((await netFetch(`${url}/runtime/nopack`, { method: 'POST', headers: auth })).status, 404)
  const asked = await (await netFetch(`${url}/runtime/vhs`, { method: 'POST', headers: auth })).json()
  assert.deepEqual([asked.runtime.state, asked.runtime.pack], ['installing', true])
  await until(async () => (await status()).runtimes.vhs.state === 'loading')
  await new Promise((r) => setTimeout(r, 800))
  assert.equal(comfy.starts, 0, 'a run in the queue holds the restart')
  assert.equal((await status()).runtimes.vhs.state, 'loading', 'installed, not loaded yet')
  comfy.onRestart = () => comfy.lists.add('VHS_SelectEveryNthImage')
  comfy.queue = 0
  const ready = await until(async () => { const e = (await status()).runtimes.vhs; return e.state === 'ready' && e })
  assert.equal(ready.pack, true)
  assert.equal(comfy.starts, 1, 'one restart loads it')
  const env = fs.readFileSync(`${base}/env-vhs.txt`, 'utf8')
  assert(!/POD_TOKEN|RUNPOD_API_KEY/.test(env), 'a pack installer gets neither the Pod token nor the RunPod key')

  // A pack that does not import: ComfyUI starts again without its class, and the status says why.
  comfy.onRestart = null
  fs.writeFileSync(`${base}/comfy.log`, "Cannot import /root/h3/ComfyUI/custom_nodes/ComfyUI-KJNodes module for custom nodes: No module named 'color_matcher'\n")
  await netFetch(`${url}/runtime/kjnodes`, { method: 'POST', headers: auth })
  const failed = await until(async () => { const e = (await status()).runtimes.kjnodes; return e.state === 'failed' && e })
  assert.match(failed.error, /ComfyUI-KJNodes module for custom nodes: No module named 'color_matcher'/)
  assert.equal((await status()).runtimes.vhs.state, 'ready', 'the other pack stays loaded')
})

await test('disk: the status server makes room by removing the files used longest ago, never one a run needs', { skip: !python && 'no Python 3.9+ found' }, () => {
  const models = path.join(tmp, 'evict-models').replace(/\\/g, '/')
  for (const [d, n] of [['loras', 'old.safetensors'], ['loras', 'kept.safetensors'], ['vae', 'newer.safetensors']]) {
    fs.mkdirSync(`${models}/${d}`, { recursive: true })
    fs.writeFileSync(`${models}/${d}/${n}`, Buffer.alloc(3000))
  }
  const code = `
import collections, importlib.util, json, os, sys
os.environ['CF_MODELS'] = sys.argv[2]
os.environ['CF_DISK_MARGIN_GB'] = '0'
spec = importlib.util.spec_from_file_location('statusd', sys.argv[1])
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
U = collections.namedtuple('U', 'total used free')
free = [1000]
m.shutil.disk_usage = lambda p: U(10 ** 9, 0, free[0])
m.USED.update({'loras/old.safetensors': 100, 'loras/kept.safetensors': 50, 'vae/newer.safetensors': 300})
fits = m.make_room(500, set())
short = m.make_room(4500, {'loras/kept.safetensors'})
left = sorted('%s/%s' % (f['dir'], f['name']) for f in m.models())
free[0] = 0
stuck = m.make_room(10000, {'loras/kept.safetensors'})
print(json.dumps({'fits': fits, 'short': short, 'left': left, 'evicted': [e['name'] for e in m.S['evicted']], 'stuck': stuck,
  'used': json.load(open(os.path.join(sys.argv[2], '.cf-used.json')))}))`
  const r = spawnSync(python[0], [...python.slice(1), '-c', code, statusd, models], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  const out = JSON.parse(r.stdout)
  assert.equal(out.fits, 0, 'a download that fits removes nothing')
  assert.equal(out.short, 0)
  assert.deepEqual(out.left, ['loras/kept.safetensors'], 'the oldest unkept files go first, until the download fits')
  assert.deepEqual(out.evicted, ['old.safetensors', 'newer.safetensors'])
  assert.equal(out.stuck, 10000, 'what is still missing, when only kept files are left')
  assert.deepEqual(Object.keys(out.used), ['loras/kept.safetensors'], 'last-use times stay on the volume')
})

await test('lease: a run asks for its files while the Pod boots, keeps what other runs need, and says how much room it lacks', async () => {
  const { pod, rp, opts } = setup()
  await pod.start()
  const booting = { stage: 'boot', ready: false, everReady: false, fatal: null, idleSec: 0, queue: null, models: [], downloads: {} }
  rp.statusd = booting
  let askedWhileBooting = null
  const a = { repo: 'org/a', path: 'a.safetensors', dir: 'diffusion_models', name: 'a.safetensors', gb: 20 }
  opts.onWait = () => {
    const dl = rp.calls.find((c) => c.path === '/download')
    if (dl && askedWhileBooting === null) {
      askedWhileBooting = rp.statusd === booting
      rp.statusd = { ...booting, downloads: { 'diffusion_models/a.safetensors': { state: 'done' } } }
    } else if (dl) rp.statusd = readyStatus({ downloads: { 'diffusion_models/a.safetensors': { state: 'done' } } })
  }
  const stages = []
  const first = await pod.lease({ files: [a], onStage: (s) => stages.push(s) })
  assert.equal(askedWhileBooting, true, 'the files download while ComfyUI comes up')
  assert.deepEqual([...new Set(stages)], ['downloading', 'waiting', 'running'])
  opts.onWait = null
  const b = { repo: 'org/b', path: 'b.safetensors', dir: 'loras', name: 'b.safetensors', gb: 1 }
  rp.statusd = readyStatus({ models: [{ dir: 'diffusion_models', name: 'a.safetensors', bytes: 1 }], downloads: { 'loras/b.safetensors': { state: 'done' } } })
  ;(await pod.lease({ files: [b] })).release()
  assert.deepEqual(rp.calls.findLast((c) => c.path === '/download').body.keep, ['diffusion_models/a.safetensors'], 'making room spares a file another run holds')
  first.release()
  rp.statusd = readyStatus({ downloads: { 'loras/c.safetensors': { state: 'failed', error: 'disk full', shortGb: 11.2 } } })
  await assert.rejects(pod.lease({ files: [{ repo: 'org/c', path: 'c.safetensors', dir: 'loras', name: 'c.safetensors', gb: 40 }] }), /disk is too small for this run\. It needs about 12 GB more\./)
})

await test('prepare: a Pod gets ready for services before their first run, at start or while it runs', async () => {
  await assert.rejects(setup().pod.prepare({ files: [] }), /Start or resume a Pod first/)
  const { pod, rp } = setup()
  const a = { repo: 'org/a', path: 'a.safetensors', dir: 'checkpoints', name: 'a.safetensors', gb: 7 }
  await pod.start({ prepare: { files: [a], runtimes: ['vhs'] } })
  assert.equal(pod.status().preparing, true)
  await pod.tick()
  assert.equal(rp.count((c) => c.path === '/download'), 0, 'nothing to ask before the Pod answers')
  rp.statusd = { stage: 'boot', ready: false, everReady: false, fatal: null, idleSec: 0, queue: null, models: [], downloads: {} }
  await pod.tick()
  assert.deepEqual(rp.calls.find((c) => c.path === '/download').body.files.map((f) => f.name), ['a.safetensors'], 'the start\'s services download as soon as the Pod answers')
  assert.equal(rp.count((c) => c.path === '/runtime/vhs'), 1)
  assert.equal(pod.status().preparing, false)
  await pod.tick()
  assert.equal(rp.count((c) => c.path === '/download'), 1, 'asked once')

  rp.statusd = readyStatus()
  await pod.prepare({ files: [{ ...a, name: 'b.safetensors', path: 'b.safetensors' }] })
  assert.equal(rp.calls.findLast((c) => c.path === '/download').body.files[0].name, 'b.safetensors', 'a running Pod asks at once')
  await assert.rejects(pod.prepare({ runtimes: ['freevideo'] }), /FreeVideo needs a 96 GB GPU; this Pod has 24 GB/)
})

await test('remove: the Pods page frees one model file; a file a run uses stays', async () => {
  const { pod, rp, dir } = setup()
  await assert.rejects(pod.remove({ dir: 'loras', name: 'x.safetensors' }), /The Pod is not running/)
  await pod.start()
  rp.statusd = readyStatus({ models: [{ dir: 'loras', name: 'x.safetensors', bytes: 1 }, { dir: 'loras', name: 'y.safetensors', bytes: 1 }] })
  await pod.refresh()
  await pod.remove({ dir: 'loras', name: 'x.safetensors' })
  const del = rp.calls.find((c) => c.method === 'DELETE' && c.path.startsWith('/models/'))
  const token = JSON.parse(fs.readFileSync(path.join(dir, 'pod.json'), 'utf8')).token
  assert.deepEqual([del.path, del.auth], ['/models/loras/x.safetensors', `Bearer ${token}`], 'the Pod token, never the account key')
  rp.statusd = readyStatus({ models: [{ dir: 'loras', name: 'y.safetensors', bytes: 1 }], downloads: { 'loras/y.safetensors': { state: 'done' } } })
  const l = await pod.lease({ files: [{ repo: 'org/y', path: 'y.safetensors', dir: 'loras', name: 'y.safetensors' }] })
  await assert.rejects(pod.remove({ dir: 'loras', name: 'y.safetensors' }), /A run is using y\.safetensors/)
  l.release()
  const { podAction } = await import('../server/plugin.js')
  await assert.rejects(podAction('remove', {}), /Name the file to remove/)
  await assert.rejects(podAction('prepare', {}), /Pick a service to get ready for/)
  await assert.rejects(podAction('prepare', { services: 'flux' }), /Services are a list/)
})

await test('services: the Pods page offers each service once, with its files, size and GPU', async () => {
  const list = await core.podServices()
  const by = Object.fromEntries(list.map((s) => [s.id, s]))
  assert.equal(new Set(list.map((s) => s.id)).size, list.length, 'ids are unique')
  assert(by['flux-3-klein'].files.some((f) => f.name === 'flux3-image-klein-bf16.safetensors'))
  assert.deepEqual([by['flux-3-klein'].vramGb, by['flux-3-klein'].gb], [24, 27])
  assert(list.every((s) => s.files.length || s.runtimes.length), 'a partner node needs no files, so it is no service')
  const fv = by['minimax-h3-on-freevideo']
  assert.deepEqual([fv.vramGb, fv.runtimes.map((r) => r.name)], [96, ['FreeVideo']])
  assert(fv.gb >= 96, 'a runtime counts in the size')
  const ready = await core.podPrepareFor(['flux-3-klein', 'sdxl'], 24)
  assert.deepEqual([ready.minVramGb, ready.files.length], [24, 5])
  await assert.rejects(core.podPrepareFor(['minimax-h3-on-freevideo'], 32), /MiniMax H3 on FreeVideo needs a 96 GB GPU; this Pod has 32 GB/)
  await assert.rejects(core.podPrepareFor(['nope']), /Pick a service from the list/)
  const o = await core.podOptions()
  assert(o.services.find((s) => s.id === 'sdxl').keys.includes('checkpoints/sd_xl_base_1.0.safetensors'), 'the page knows which files each service needs')
  assert(!o.runtimes.some((r) => r.id === 'vhs'), 'node packs install by themselves, so the page offers only FreeVideo at start')
})

await test('uploads: a graph takes more pictures, a mask and audio, and an optional node drops with its links', async () => {
  const { dropOptional, comfyVars } = await import('../shared/mapping.js')
  const graph = {
    1: { class_type: 'LoadImage', inputs: { image: '{{image}}' } },
    2: { class_type: 'LoadImage', inputs: { image: '{{image3}}' }, _meta: { title: 'Second garment', optional: 'image3' } },
    3: { class_type: 'ImageScale', inputs: { image: ['2', 0] }, _meta: { optional: 'image3' } },
    4: { class_type: 'TextEncodeQwenImageEditPlus', inputs: { image1: ['1', 0], image3: ['3', 0], prompt: '{{prompt}}' } },
    5: { class_type: 'LoadImage', inputs: { image: '{{mask}}' } },
    6: { class_type: 'LoadAudio', inputs: { audio: '{{audio}}' } },
    7: { class_type: 'LoadAudio', inputs: { audio: '{{voice}}' } },
    8: { class_type: 'LoadImage', inputs: { image: '{{image7}}' } },
  }
  const without = dropOptional(graph, { image: 'a' })
  assert.deepEqual(Object.keys(without), ['1', '4', '5', '6', '7', '8'])
  assert.deepEqual(without['4'].inputs, { image1: ['1', 0], prompt: '{{prompt}}' }, 'the input linked to the dropped node goes too')
  assert.equal(dropOptional(graph, { image: 'a', image3: 'b' }), graph, 'with the file, nothing changes')
  assert.deepEqual(core.uploadsOf(graph).map((u) => `${u.id}.${u.field}=${u.key}`), ['1.image=image', '2.image=image3', '5.image=mask', '6.audio=audio', '7.audio=voice'], 'only known slots upload')

  const { fileSlots } = await import('../src/lib/recipes.js')
  const tryOn = { inputs: [{ id: 'person', type: 'image' }, { id: 'garment', type: 'image' }, { id: 'garment2', type: 'image', optional: true }, { id: 'character', type: 'character' }, { id: 'track', type: 'audio' }] }
  const slots = fileSlots(tryOn, { person: { url: '/p.png' }, garment: { url: '/g.png' }, garment2: null, character: { name: 'Mia', images: ['/mia.png'] }, track: { url: '/a.mp3' } })
  assert.deepEqual(slots, { pictures: ['/p.png', '/g.png', null, '/mia.png'], audio: '/a.mp3', voice: null }, 'an empty optional input keeps its slot')
  const v = comfyVars('image', { prompt: 'x', aspect: '1:1', slots, mask: '/m.png' })
  assert.deepEqual([v.image, v.image2, v.image3, v.image4, v.audio, v.mask], ['/p.png', '/g.png', undefined, '/mia.png', '/a.mp3', '/m.png'])
  assert.equal(fileSlots({ inputs: [{ id: 'prompt', type: 'text' }] }, {}), null, 'no slots without files')
  const composer = comfyVars('image', { prompt: 'x', aspect: '1:1', images: ['/a.png', '/b.png'] })
  assert.deepEqual([composer.image, composer.image2], ['/a.png', '/b.png'], 'the composer\'s attachments fill the slots in order')

  const { open } = await import('../src/lib/formats/parts.js')
  const { validateFormat } = await import('../src/lib/formats/validate.js')
  const { schemas } = await import('../src/lib/formats/schemas.js')
  const format = open({ id: 'slot-check', name: 'Slot check', kind: 'image', category: 'image-edit', blurb: 'Checks slots.', runsOn: 'Test', workflow: 'slot_check',
    inputs: [{ id: 'person', type: 'image', label: 'Person' }, { id: 'garment', type: 'image', label: 'Garment' }, { id: 'track', type: 'audio', label: 'Track' }], prompt: 'Dress them.', cover: 'c' })
  assert.deepEqual(validateFormat(format, { ...schemas, comfy: { ...schemas.comfy, slot_check: ['audio', 'image', 'image2', 'prompt'] } }), [], 'two pictures and audio map to image, image2 and audio')
  assert(validateFormat(format, { ...schemas, comfy: { ...schemas.comfy, slot_check: ['image', 'image3', 'prompt'] } }).some((r) => /Unmapped workflow placeholder image3/.test(r)), 'a third slot needs a third picture')
})

await test('3D: a .glb a graph saves is kept as a 3D model', async () => {
  podMode()
  const client = {
    assets: { fromBytes: () => ({}) },
    workflows: { fromFile: async (f) => ({ file: f, json: null, setInput() {} }) },
    run: async () => ({ outputs: [
      { type: 'file', contentType: 'model/gltf-binary', name: 'mesh_00001_.glb', toBytes: async () => Buffer.from('glTF') },
      { type: 'text', contentType: 'text/plain', name: 'log.txt', toBytes: async () => Buffer.from('x') },
    ] }),
  }
  const files = await core.runComfy('image_sdxl', sdxl, { createClient: () => client, podPhase: async () => 'none', lease: async () => { throw new Error('no lease on Cloud') } })
  assert.deepEqual(files.map((f) => [f.kind, path.extname(f.url)]), [['3d', '.glb']], 'text is no media')
})

await test('sandbox: packs install and load, a Pod gets ready for a service, makes room and removes a file', async () => {
  const dir = fs.mkdtempSync(path.join(tmp, 'sandbox-svc-'))
  const clock = { t: Date.now() }
  const net = sandboxFetch({ file: () => path.join(dir, 'pod-sandbox.json'), now: () => clock.t, mode: '1' })
  const pod = podManager({ fetch: net, now: () => clock.t, keys: () => ({ key: 'sandbox' }), dir: () => dir, sandbox: true, owner: true, wait: async () => { clock.t += 3000 } })
  const big = (n) => ({ repo: 'org/m', path: `${n}.safetensors`, dir: 'diffusion_models', name: `${n}.safetensors`, gb: 60 })
  await pod.start({ prepare: { files: [big('a')], runtimes: [] } })
  clock.t += 5000
  await pod.tick()
  clock.t += 12000
  await pod.tick()
  assert.deepEqual(pod.status().downloads.map((d) => d.file), ['a.safetensors'], 'the start\'s service downloads as soon as the Pod answers')
  const stages = []
  ;(await pod.lease({ runtimes: ['vhs'], onStage: (s) => stages.push(s) })).release()
  assert(stages.includes('installing') && stages.at(-1) === 'running', 'a pack installs, loads and is ready')
  clock.t += 10000
  await pod.tick()
  assert.equal(pod.status().models.length, 1)
  ;(await pod.lease({ files: [big('b')] })).release()
  const s = await pod.tick()
  assert.deepEqual(s.evicted.map((f) => f.name), ['a.safetensors'], 'a 120 GB disk holds one 60 GB model with room to spare, so the older one goes')
  assert.deepEqual(s.models.map((f) => f.name), ['b.safetensors'])
  assert.deepEqual(s.disk, { freeGb: 60, totalGb: 120 })
  await pod.remove({ dir: 'diffusion_models', name: 'b.safetensors' })
  assert.deepEqual(pod.status().models, [])
  await pod.terminate({ now: true })
})

await test('downloads: a file whose path has brackets or spaces is fetched with an encoded URL', { skip: !python && 'no Python 3.9+ found' }, () => {
  const code = `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('statusd', sys.argv[1])
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
seen = []
def fake(req, timeout=0):
  seen.append(req.full_url)
  raise RuntimeError('stop')
m.urllib.request.urlopen = fake
m.DOWNLOADS['loras/x.safetensors'] = {'state': 'queued', 'bytes': 0, 'total': None, 'error': None}
try:
  m.fetch({'repo': 'org/r', 'path': 'sub/[WAN2.2-I2V]My LoRA.safetensors', 'dir': 'loras', 'name': 'x.safetensors'}, 'loras/x.safetensors')
except RuntimeError:
  pass
print(json.dumps(seen))`
  const r = spawnSync(python[0], [...python.slice(1), '-c', code, statusd], { encoding: 'utf8', env: { ...process.env, CF_MODELS: path.join(tmp, 'quote-models') } })
  assert.equal(r.status, 0, r.stderr)
  assert.deepEqual(JSON.parse(r.stdout), ['https://huggingface.co/org/r/resolve/main/sub/%5BWAN2.2-I2V%5DMy%20LoRA.safetensors'])
})

// ---- Image services ---------------------------------------------------------------------------------

// A value for each input as a user would give it, so a format's own options fill its graph.
function sampleInputs(format) {
  const picture = { url: '/media/in.png', ratio: '4:5', name: 'in.png' }
  const values = {}
  for (const i of format.inputs) {
    if (i.type === 'choice') values[i.id] = i.default ?? i.options[0].id
    else if (i.type === 'count') values[i.id] = i.default ?? i.options[0]
    else if (i.type === 'text' || i.type === 'longtext') values[i.id] = 'Sample'
    else if (['image', 'draw', 'crop', 'face'].includes(i.type)) values[i.id] = { ...picture, faceUrl: '/media/face.png', box: { x: 0, y: 0, width: 1, height: 1 }, aspect: '1:1', strokes: '/media/strokes.png' }
    else if (i.type === 'mask') values[i.id] = { ...picture, maskUrl: '/media/mask.png' }
    else if (i.type === 'video') values[i.id] = { url: '/media/clip.mp4', ratio: '16:9', duration: 6, trim: { start: 1, end: 4 } }
    else if (i.type === 'audio') values[i.id] = { url: '/media/voice.mp3', name: 'voice.mp3' }
    else if (i.type === 'voice') values[i.id] = { name: 'Narrator', sample: '/media/narrator.wav' }
    else if (['character', 'product', 'brand'].includes(i.type)) values[i.id] = { type: i.type, name: 'Mia', images: ['/media/mia.png'] }
  }
  return values
}

await test('image services: every Comfy format that shows fills its graph with its own values and loads only listed files', async () => {
  const { formats } = await import('../src/lib/formats/index.js')
  const { stepOptions, stepModel, selectedStep } = await import('../src/lib/formats/options.js')
  const { comfyVars, fill, dropOptional } = await import('../shared/mapping.js')
  const { nearestAspect } = await import('../src/lib/formats/runner.js')
  let n = 0
  for (const f of formats) {
    for (const raw of f.steps.filter((s) => !s.type && (s.provider === 'comfy' || s.targets))) {
      for (const target of raw.targets ? Object.keys(raw.targets) : [null]) {
        const values = { ...sampleInputs(f), ...(target ? { [raw.targetInput]: target } : {}) }
        const step = selectedStep(f, raw, values)
        const model = stepModel(f, step, values)
        if (model?.provider !== 'comfy') continue
        const o = stepOptions(f, step, values)
        // A writer step writes the prompt when the format runs.
        if (f.writer || f.steps.some((s) => s.type === 'writer')) o.prompt = 'Written prompt'
        if (o.aspect === 'auto') o.aspect = nearestAspect(o.shape)
        const vars = comfyVars(model.kind, o, model.sizes)
        const w = vars.image && model.imageWorkflow ? model.imageWorkflow : model.workflow
        const graph = dropOptional(readGraph(w), vars)
        const unset = [...JSON.stringify(graph).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).filter((k) => vars[k] == null || vars[k] === '')
        assert.deepEqual(unset, [], `${f.id} leaves ${unset.join(', ')} empty in ${w}`)
        modelFilesOf(fill(graph, vars))
        n++
      }
    }
  }
  assert(n > 150, `checked ${n} format runs`)
})

await test('image services: a shape choice sets the canvas, and a character makes a look run its reference graph', async () => {
  const { formats } = await import('../src/lib/formats/index.js')
  const { stepOptions, stepModel } = await import('../src/lib/formats/options.js')
  const { comfyVars, dropOptional } = await import('../shared/mapping.js')
  const { nearestAspect } = await import('../src/lib/formats/runner.js')
  const by = Object.fromEntries(formats.map((f) => [f.id, f]))
  const run = (id, values) => {
    const f = by[id]
    const o = stepOptions(f, f.steps[0], { ...sampleInputs(f), ...values })
    if (o.aspect === 'auto') o.aspect = nearestAspect(o.shape)
    const model = stepModel(f, f.steps[0])
    const vars = comfyVars(model.kind, o, model.sizes)
    return { o, vars, workflow: vars.image && model.imageWorkflow ? model.imageWorkflow : model.workflow }
  }
  const wide = run('look-golden-hour', { shape: 'wide', character: null })
  assert.deepEqual([wide.o.aspect, 'aspect' in wide.o.params, wide.vars.width, wide.vars.height, wide.workflow], ['16:9', false, 1280, 720, 'flux_look'])
  const withMia = run('look-golden-hour', { shape: 'square' })
  assert.deepEqual([withMia.workflow, withMia.vars.image, withMia.vars.width], ['flux_look_ref', '/media/mia.png', 1024], 'a picked character is the reference')
  const qwen = run('look-cctv', { shape: 'wide', character: null })
  assert.deepEqual([qwen.workflow, qwen.vars.width, qwen.vars.height], ['qwen_image21_t2i', 1664, 928], 'a Qwen look draws on its own canvas')
  const tryOn = run('try-on', { garment2: null })
  assert.deepEqual([tryOn.vars.image, tryOn.vars.image2, tryOn.vars.image3], ['/media/in.png', '/media/in.png', undefined])
  assert(!JSON.stringify(dropOptional(readGraph('qwen_edit_try_on'), tryOn.vars)).includes('{{image3}}'), 'no second garment, no third loader')
  assert.equal(run('influencer-post', {}).vars.count, 5, 'the posts count reaches the loop')
  assert.equal(run('layers', { layers: 6 }).vars.layers, 6)
  assert.equal(run('ad-variants', { variants: 8 }).vars.count, 8)
})

await test('image services: Cloud takes compatible image variants; Session keeps original image models and downloads their files and LoRAs', async () => {
  podMode()
  const client = {
    assets: { fromBytes: (buf, o) => ({ asset: o.filename }) },
    workflows: { fromFile: async (f) => ({ file: f, json: null, setInput() {} }) },
    run: async () => ({ outputs: [{ type: 'image', contentType: 'image/png', name: 'out.png', toBytes: async () => Buffer.from('png') }] }),
  }
  const leases = []
  const lease = async (o) => { leases.push(o); return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }
  const vars = { prompt: 'A fox', width: 1024, height: 1024, count: 1, seed: 1, image: 'data:image/png;base64,iVBORw0KGgo=', image2: 'data:image/png;base64,iVBORw0KGgo=', azimuth: 45, elevation: 0, zoom: 'medium', batch: 1, layers: 4 }
  const run = (w, phase = 'none', type = null) => core.runComfy(w, vars, { createClient: () => client, lease, podPhase: async () => phase, podVram: () => 24, podRoom: () => ({}), run: type })
  for (const w of ['qwen2511_edit', 'qwen2511_relight', 'qwen_multiangle', 'qwen_image_layered', 'krea2_t2i', 'z_image', 'hidream']) {
    assert.equal((await run(w))[0].kind, 'image', w)
  }
  assert.equal(leases.length, 0, 'Comfy Cloud has every file these load')
  for (const w of ['qwen_edit', 'qwen_image_ref', 'qwen_image_logo', 'flux_look', 'flux_look_ref', 'klein_edit', 'klein_character_swap', 'storyboard']) {
    assert.equal((await run(w))[0].kind, 'image', `${w} has a Cloud alternate`)
    await assert.rejects(run(w, 'none', 'session'), (e) => e.code === 'needs_pod', `${w} in Session needs a Pod`)
  }
  await run('qwen_multiangle', 'ready')
  assert.deepEqual(leases.at(-1).files.filter((f) => f.dir === 'loras').map((f) => f.name).sort(),
    ['Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors', 'qwen-image-edit-2511-multiple-angles-lora.safetensors'], 'a Pod downloads both LoRAs')
  assert(leases.at(-1).files.every((f) => /^[0-9a-f]{64}$/.test(f.sha256)))
  const { models } = await import('../src/lib/catalog.js')
  for (const id of ['comfy-z-image-turbo', 'comfy-hidream-o1', 'comfy-qwen-image-edit-2511']) assert(!models.find((m) => m.id === id).pod, `${id} runs on Cloud`)
  const { openModels } = await import('../src/lib/tools.js')
  assert.deepEqual(['qwen-image-edit-2511', 'z-image-turbo', 'hidream-o1'].map((id) => openModels.find((m) => m.id === id).catalog), ['comfy-qwen-image-edit-2511', 'comfy-z-image-turbo', 'comfy-hidream-o1'])
})

// ---- Video services ---------------------------------------------------------------------------------

await test('video services: no format runs on the paid partner node or on LTX Video 2B', async () => {
  const { allFormats } = await import('../src/lib/formats/index.js')
  const graphs = (f) => f.steps.flatMap((s) => [s.workflow, s.imageWorkflow, ...Object.values(s.targets || {}).flatMap((t) => [t.workflow, t.imageWorkflow])])
  assert.deepEqual(allFormats.filter((f) => graphs(f).some((w) => w === 'h3_i2v' || w === 'ltx_i2v')).map((f) => f.id), [])
})

await test('video services: presets and the H3, LTX-2.5 and Wan 2.2 graphs go to Comfy Cloud at once', async () => {
  podMode()
  const sent = []
  const client = {
    assets: { fromBytes: (buf, o) => ({ asset: o.filename }) },
    workflows: { fromFile: async (f) => ({ file: f, json: null, setInput() {} }) },
    run: async (wf) => { sent.push(path.basename(wf.file)); return { outputs: [{ type: 'image', contentType: 'video/mp4', name: 'out.mp4', toBytes: async () => Buffer.from('mp4') }] } },
  }
  const leases = []
  const lease = async (o) => { leases.push(o); return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }
  const png = 'data:image/png;base64,iVBORw0KGgo='
  const vars = { prompt: 'Dolly in', width: 1344, height: 768, frames: 121, duration: 5, start: 0, seed: 1, image: png, image2: png, video: 'data:video/mp4;base64,AAAAIGZ0eXBpc29t', seconds: 5 }
  for (const w of ['h3_open_i2v', 'h3_flf2v', 'h3_i2v_audio', 'h3_extend', 'h3_t2v', 'h3_ref2v', 'h3_product_ad', 'cinema_shot', 'ltx25_i2v', 'ltx25_multishot', 'wan22_i2v', 'wan22_t2v']) {
    const files = await core.runComfy(w, vars, { createClient: () => client, lease, podPhase: async () => 'none', podVram: () => null, podRoom: () => ({}) })
    assert.equal(files[0].kind, 'video', w)
  }
  assert.equal(leases.length, 0, 'Comfy Cloud has every file these load')
  assert(readGraph('h3_open_i2v')['17'].inputs.crop === 'center', 'the start frame is cropped to the canvas, not stretched')
})

await test('video services: an effect LoRA needs a Pod, chains have Cloud alternates; first and last frame runs on FreeVideo on 96 GB', async () => {
  podMode()
  const { formats } = await import('../src/lib/formats/index.js')
  const { stepOptions } = await import('../src/lib/formats/options.js')
  const { comfyVars } = await import('../shared/mapping.js')
  const sent = []
  const client = {
    assets: { fromBytes: (buf, o) => ({ asset: o.filename }) },
    workflows: { fromFile: async (f) => ({ file: f, json: null, setInput() {} }) },
    run: async (wf) => { sent.push(path.basename(wf.file)); return { outputs: [{ type: 'image', contentType: 'video/mp4', name: 'out.mp4', toBytes: async () => Buffer.from('mp4') }] } },
  }
  const leases = []
  const lease = async (o) => { leases.push(o); return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }
  const png = 'data:image/png;base64,iVBORw0KGgo='
  const boom = formats.find((f) => f.id === 'building-explosion')
  const o = stepOptions(boom, boom.steps[0], { image: { url: png }, note: '' })
  assert.match(o.prompt, /EXPLOSION\.$/, 'the trigger ends the prompt')
  const vars = { ...comfyVars('video', { ...o, aspect: '16:9' }), seed: 1 }
  const run = (w, v, phase, vram = 24, room = {}, type = null) => core.runComfy(w, v, { createClient: () => client, lease, podPhase: async () => phase, podVram: () => vram, podRoom: () => room, run: type })
  await assert.rejects(run('wan22_lora_i2v', vars, 'none'), (e) => e.code === 'needs_pod', 'Comfy Cloud has no effect LoRA')
  await run('wan22_lora_i2v', vars, 'ready')
  assert.deepEqual(leases.at(-1).files.filter((f) => f.dir === 'loras' && /redmond/.test(f.name)).map((f) => f.name).sort(),
    ['wan22_i2v_explosion_redmond_high_noise.safetensors', 'wan22_i2v_explosion_redmond_low_noise.safetensors'], 'the Pod downloads the effect the run names, for both experts')
  const frozen = formats.find((f) => f.id === 'frozen-in-motion')
  const fo = stepOptions(frozen, frozen.steps[0], { image: { url: png } })
  assert.equal(fo.fields.image2, png, 'the orbit ends on the start photo')
  for (const w of ['klein_ltx', 'qwen_h3', 'qwen_mockup_ltx']) {
    const chainVars = { ...vars, motion: 'It moves.', width: 768, height: 1344 }
    assert.equal((await run(w, chainVars, 'none'))[0].kind, 'video', `${w} has a Cloud alternate`)
    await assert.rejects(run(w, chainVars, 'none', 24, {}, 'session'), (e) => e.code === 'needs_pod', `${w} in Session needs a Pod`)
  }
  const flf = { prompt: 'A turn', duration: 5, seed: 1, image: png, image2: png, width: 1344, height: 768, frames: 121 }
  await run('h3_flf2v', flf, 'ready', 96, {})
  assert.equal(sent.at(-1), 'h3_freevideo_flf2v.json', 'a 96 GB Pod runs first and last frame on FreeVideo')
  assert.deepEqual(leases.at(-1).runtimes, ['freevideo'])
  await run('h3_flf2v', flf, 'ready', 32, {})
  assert.equal(sent.at(-1), 'h3_flf2v.json', 'a 32 GB Pod runs stock H3')
  assert.deepEqual(core.podNeedsFor('h3_flf2v').runtimes.map((r) => r.runtime), ['freevideo'], 'a Pod started for it gets the GPU FreeVideo runs on')
})

await test('video services: each video format draws on its model\'s canvas, a draft is smaller, and arrows, seconds and a brand reach their graphs', async () => {
  const { formats } = await import('../src/lib/formats/index.js')
  const { stepOptions, stepModel, selectedStep } = await import('../src/lib/formats/options.js')
  const { comfyVars } = await import('../shared/mapping.js')
  const { nearestAspect } = await import('../src/lib/formats/runner.js')
  const by = Object.fromEntries(formats.map((f) => [f.id, f]))
  const run = (id, values) => {
    const f = by[id]
    const all = { ...sampleInputs(f), ...values }
    const step = selectedStep(f, f.steps[0], all)
    const model = stepModel(f, step, all)
    const o = stepOptions(f, step, all)
    if (o.aspect === 'auto') o.aspect = nearestAspect(o.shape)
    return { model, vars: comfyVars('video', o, model.sizes), workflow: comfyVars('video', o, model.sizes).image && model.imageWorkflow ? model.imageWorkflow : model.workflow }
  }
  const final = run('cinema-shot', { model: 'minimax', quality: 'final', image: null })
  assert.deepEqual([final.workflow, final.vars.width, final.vars.height], ['h3_open_t2v', 1344, 768])
  const draft = run('cinema-shot', { model: 'minimax', quality: 'draft' })
  assert.deepEqual([draft.workflow, draft.vars.width, draft.vars.height], ['cinema_shot', 832, 448], 'a draft is 0.6x, in multiples of 64, from the start frame')
  assert.deepEqual([run('cinema-shot', { model: 'ltx', quality: 'final', image: null }).workflow, run('cinema-shot', { model: 'wan', quality: 'final' }).workflow], ['ltx25_t2v', 'wan22_i2v'])
  const cam = run('cam-dolly-left', {})
  assert.equal(cam.workflow, 'h3_open_i2v')
  assert.deepEqual([run('cam-orbit-360', {}).vars.width, run('cam-orbit-360', {}).vars.height], [768, 960], 'auto follows the 4:5 photo on H3\'s canvas')
  assert.equal(run('draw-to-video', {}).vars.mask, '/media/strokes.png', 'the drawn arrows are the mask')
  assert.equal(run('extend-video', { seconds: 8 }).vars.seconds, 8)
  assert.equal(run('brand-video', {}).vars.image, '/media/mia.png', 'the brand\'s first picture is the reference')
  assert.deepEqual([run('human-video', { character: null }).workflow, run('human-video', {}).workflow], ['h3_open_t2v', 'h3_t2v'])
  assert.equal(run('transition', {}).vars.duration, 5)
})

// ---- Video edits and enhance tools ------------------------------------------------------------------

await test('edits and enhance: Bernini-R, VOID, SCAIL-2, SeedVR2, RIFE and BiRefNet go to Comfy Cloud; reshoot installs WanVideoWrapper on a Pod; Qwen backgrounds use Cloud alternates or original models in Session', async () => {
  podMode()
  const client = {
    assets: { fromBytes: (buf, o) => ({ asset: o.filename }) },
    workflows: { fromFile: async (f) => ({ file: f, json: null, setInput() {} }) },
    run: async () => ({ outputs: [{ type: 'image', contentType: 'video/mp4', name: 'out.mp4', toBytes: async () => Buffer.from('mp4') }] }),
  }
  const leases = []
  const lease = async (o) => { leases.push(o); return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }
  const png = 'data:image/png;base64,iVBORw0KGgo='
  const vars = { prompt: 'A look', seed: 1, start: 0, duration: 3, video: 'data:video/mp4;base64,AAAAIGZ0eXBpc29t', image: png, image2: png, image3: png,
    fps: 12, strength: 0.65, target: 'person', trajectory: 'arc_left', orbit: false, upscale_factor: 2, multiplier: 2, output: 'alpha', background: 'A beach', preset: 'natural', temperature: 0, grain: 0 }
  const run = (w, phase = 'none', vram = 24, type = null) => core.runComfy(w, vars, { createClient: () => client, lease, podPhase: async () => phase, podVram: () => vram, podRoom: () => ({}), run: type })
  for (const w of ['bernini_mixed', 'bernini_grade', 'bernini_clone_edit', 'bernini_recreate_ad', 'void_inpaint', 'video_bg_change', 'scail2_character_swap', 'recammaster',
    'seedvr2_image', 'seedvr2_video', 'image_upscale', 'image_upscale_esrgan', 'rife_interpolate', 'birefnet_image', 'birefnet_video_matte', 'birefnet_video_matte_alpha', 'image_grade']) {
    await run(w)
  }
  assert.equal(leases.length, 0, 'Comfy Cloud has every file and pack these use')
  for (const w of ['birefnet_qwen_background', 'birefnet_video_matte_scene']) {
    assert.equal((await run(w))[0].kind, 'video', `${w} has a Cloud alternate`)
    await assert.rejects(run(w, 'none', 24, 'session'), (e) => e.code === 'needs_pod', `${w} in Session needs a Pod`)
  }
  await run('recammaster', 'ready')
  assert.deepEqual(leases.at(-1).runtimes, ['wanvideo'], 'a Pod installs WanVideoWrapper for a reshoot')
  await run('birefnet_video_matte_alpha', 'ready')
  assert.deepEqual(leases.at(-1).runtimes, ['vhs'], 'and VideoHelperSuite for a transparent matte')
  assert(leases.at(-1).files.some((f) => f.dir === 'background_removal' && f.name === 'birefnet.safetensors'), 'BiRefNet downloads to its own folder')
  assert(podBootScript().includes('  background_removal: background_removal\n') && podBootScript().includes('  frame_interpolation: frame_interpolation\n'), 'ComfyUI on the Pod finds those folders')
})

await test('edits and enhance: upscale and background removal pick their graph by choice; reshoot uses ReCamMaster names', async () => {
  const { formats } = await import('../src/lib/formats/index.js')
  const { stepOptions, stepModel, selectedStep } = await import('../src/lib/formats/options.js')
  const by = Object.fromEntries(formats.map((f) => [f.id, f]))
  const pick = (id, values) => {
    const f = by[id]
    const all = { ...sampleInputs(f), ...values }
    const step = selectedStep(f, f.steps[0], all)
    return { model: stepModel(f, step, all), o: stepOptions(f, step, all) }
  }
  assert.deepEqual([pick('image-upscale', { mode: 'faithful' }).model.workflow, pick('image-upscale', { mode: 'enhance' }).model.workflow], ['image_upscale_esrgan', 'image_upscale'])
  assert.deepEqual(['transparent', 'green', 'new'].map((result) => pick('video-bg-remove', { result }).model.workflow), ['birefnet_video_matte_alpha', 'birefnet_video_matte', 'birefnet_video_matte_scene'])
  assert.equal(pick('video-bg-remove', { result: 'new', background: 'A beach' }).o.fields.background, 'A beach')
  const names = ['pan_right', 'pan_left', 'tilt_up', 'tilt_down', 'zoom_in', 'zoom_out', 'translate_up', 'translate_down', 'arc_left', 'arc_right']
  for (const opt of by.reshoot.inputs.find((i) => i.id === 'angle').options) assert(names.includes(opt.params.trajectory) && typeof opt.params.orbit === 'boolean', opt.id)
  assert.equal(pick('video-erase', { target: 'the red car' }).o.fields.target, 'the red car', 'SAM 3.1 gets the label as typed')
  assert.deepEqual([pick('edit-video', {}).model.workflow, pick('edit-video', {}).model.imageWorkflow], ['bernini_swap_noref', 'bernini_swap'])
  assert.deepEqual(['same', '2k', '4k'].map((size) => pick('unblur', { size }).o.params), [{ upscale_factor: 1, target: 0 }, { upscale_factor: 1, target: 2048 }, { upscale_factor: 1, target: 4096 }])
})

// ---- Audio, talking heads and 3D --------------------------------------------------------------------

// FLAC headers as PyAV writes them (ComfyUI's SaveAudioAdvanced): one sample of 24 kHz stereo, and 2 s.
const flacOneSample = Buffer.from('ZkxhQwAAACIJAAkAAAAPAAAPBdwC8AAAAAHx0/+EQyl3MoYt8h3E5XJi', 'base64')
const flacTwoSeconds = Buffer.from('ZkxhQwAAACIJAAkAAAAOAAAQBdwC8AAAu4D+OE9mjaKCaUwpqE69M0gd', 'base64')

await test('pack files: a pack\'s own files download with it, pinned, and the Pod links its folder from ComfyUI to the volume', () => {
  const read = (n) => JSON.parse(fs.readFileSync(`public/workflows/${n}.json`, 'utf8'))
  const key = (n) => n.runtime || `${n.dir}/${n.name}`
  const tts = podNeedsOf(read('chatterbox_tts'))
  const t3 = tts.find((n) => key(n) === 'chatterbox/chatterbox_multilingual/t3_mtl23ls_v2.safetensors')
  assert.deepEqual([t3.repo, t3.path, t3.bytes, t3.sha256.length, t3.cloud], ['ResembleAI/chatterbox', 't3_mtl23ls_v2.safetensors', 2143989752, 64, true], 'pinned by sha256, with its exact size')
  assert(tts.some((n) => n.runtime === 'chatterbox'), 'and the pack itself')
  assert(!tts.some((n) => n.dir === 'chatterbox/chatterbox_vc'), 'speech takes only the files its node reads')
  assert(!podNeedsOf(read('chatterbox_vc')).some((n) => n.dir === 'chatterbox/chatterbox_multilingual'), 'and voice change only its own')
  const qwen = podNeedsOf(read('qwen3_tts'))
  assert(qwen.some((n) => key(n) === 'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/speech_tokenizer/model.safetensors'), 'subfolders keep their place')
  const both = podNeedsOf(read('infinitetalk_tts'))
  assert.equal(new Set(both.map(key)).size, both.length, 'a file two needs share comes once')

  const script = podBootScript()
  assert(script.includes('for d in chatterbox hunyuan_foley qwen-tts; do') && script.includes('  ln -sfn "$M/$d" "$C/models/$d"'), 'each pack folder is linked to the volume')
  assert(script.includes('  [ -L "$C/models/$d" ] || rm -rf "$C/models/$d"'))
  const at = (s) => script.indexOf(s)
  assert(at('STAGE comfy-update') < at('for d in chatterbox') && at('for d in chatterbox') < at('STAGE comfy '), 'after ComfyUI moves to its pin, before it starts')
  assert(!script.includes('  chatterbox/chatterbox_vc:'), 'ComfyUI\'s own folder list never names a pack folder')
  assert(script.includes('foley\tComfyUI-HunyuanVideo_Foley\tHunyuanFoleyModelLoader,LoadDACHunyuanVAE,HunyuanFoleySampler,DACHunyuanVAEDecode\thunyuan_foley/hunyuanvideo_foley.pth,vae/vae_128d_48k.pth\n'),
    'the status server learns which files Foley waits for')
  assert(script.includes('folder=ComfyUI_Fill-ChatterBox; pip="pykakasi==2.3.0 spacy-pkuseg==1.0.1"; ;;'), 'Chatterbox gets its Japanese and Mandarin text packages, pinned')
  assert(script.includes('folder=ComfyUI-Qwen-TTS; skip="onnxruntime-openvino"; ;;'))
  for (const d of ['wav2vec2', 'asr', 'hunyuan_foley']) assert(script.includes(`  ${d}: ${d}\n`), `ComfyUI finds ${d} on the volume`)
  const ok = { repo: 'x/y', commit: 'a'.repeat(40), folder: 'F', classes: ['C'] }
  assert.throws(() => podBootScript({ packs: { x: { ...ok, pip: ['evil; rm -rf /'] } } }), /unsafe/)
  assert.throws(() => podBootScript({ packs: { x: { ...ok, pip: ['unpinned'] } } }), /unsafe/, 'an extra package is pinned')
  assert.throws(() => podBootScript({ packs: { x: { ...ok, before: ['../etc/passwd'] } } }), /unsafe/)
  if (hasBash) {
    const req = path.join(tmp, 'qwen-requirements.txt')
    fs.writeFileSync(req, 'torch\nonnxruntime-openvino\nonnxruntime-openvino>=1.18\n  onnxruntime-openvino ; sys_platform == "linux"\nonnxruntime\nsox\n')
    const r = spawnSync('bash', ['-c', `skip="onnxruntime-openvino"; grep -viE "^[[:space:]]*($skip)([[:space:]<>=!~;[]|$)" "${req.replace(/\\/g, '/')}"`], { encoding: 'utf8' })
    assert.deepEqual(r.stdout.trim().split('\n'), ['torch', 'onnxruntime', 'sox'], 'a skipped requirement goes in every spelling, and only it')
  }
})

await test('pack files: the status server downloads into a pack\'s subfolder, lists and removes it, and loads Foley only after its files', { skip: (!python || !hasBash) && 'needs Python 3.9+ and bash' }, async (t) => {
  const bytes = { 'conds.pt': Buffer.alloc(2048, 1), 'hunyuanvideo_foley.pth': Buffer.alloc(4096, 2), 'vae_128d_48k.pth': Buffer.alloc(1024, 3) }
  const hold = { release: null }
  const hf = await listen(async (req, res) => {
    const name = req.url.split('/').pop()
    if (!bytes[name]) return res.writeHead(404).end()
    if (name === 'hunyuanvideo_foley.pth') await new Promise((r) => { hold.release = r })
    res.writeHead(200, { 'Content-Length': bytes[name].length })
    res.end(bytes[name])
  })
  t.after(() => hf.close())
  const port = freePort()
  const base = path.join(tmp, 'statusd-pack-files').replace(/\\/g, '/')
  fs.mkdirSync(base, { recursive: true })
  fs.writeFileSync(`${base}/.base-ready`, '')
  fs.writeFileSync(`${base}/packs.tsv`, 'foley\tComfyUI-HunyuanVideo_Foley\tHunyuanFoleyModelLoader\thunyuan_foley/hunyuanvideo_foley.pth,vae/vae_128d_48k.pth\n')
  fs.writeFileSync(`${base}/runtime-pack.sh`, ['#!/bin/bash', 'echo "installing $1"', ''].join('\n'))
  // A fake ComfyUI that lists Foley's loader at once: the pack loads without its files, but then lists
  // no models, so only a ComfyUI started after the files counts.
  const comfy = { starts: 0 }
  let dummy
  const startDummy = () => {
    dummy = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' })
    fs.writeFileSync(`${base}/comfy.pid`, String(dummy.pid))
    dummy.once('exit', () => { comfy.starts++; startDummy() })
  }
  startDummy()
  t.after(() => { dummy.removeAllListeners('exit'); dummy.kill() })
  const server = await listen((req, res) => {
    if (req.url === '/queue') return res.end(JSON.stringify({ queue_running: [], queue_pending: [] }))
    if (req.url.startsWith('/object_info/')) return res.end(JSON.stringify({ [req.url.split('/')[2]]: {} }))
    res.end('{}')
  })
  t.after(() => server.close())
  const proc = startStatusd({ POD_TOKEN: 'secret', CF_BASE: base, CF_MODELS: `${base}/models`, CF_STATUS_PORT: String(port), CF_DIRS: 'vae hunyuan_foley chatterbox/chatterbox_vc',
    CF_HF_BASE: `http://127.0.0.1:${hf.address().port}`, CF_COMFY_URL: `http://127.0.0.1:${server.address().port}`, CF_PROXY_URL: 'http://127.0.0.1:9',
    CF_TICK: '0.2', CF_RESTART_GRACE: '0.5', CF_DRY_KILL: '1' })
  t.after(() => proc.kill())
  const url = `http://127.0.0.1:${port}`
  const auth = { Authorization: 'Bearer secret' }
  const status = async () => (await netFetch(`${url}/status`, { headers: auth })).json()
  const post = (files) => netFetch(`${url}/download`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ files }) })
  const sha = (name) => createHash('sha256').update(bytes[name]).digest('hex')
  await proc.ready(url, async () => (await netFetch(`${url}/status`, { headers: auth })).ok)
  assert(!fs.existsSync(`${base}/models/chatterbox`), 'a pack folder is made only when a file goes in')

  assert.equal((await post([{ repo: 'ResembleAI/chatterbox', path: 'conds.pt', dir: 'chatterbox/other', name: 'conds.pt' }])).status, 400, 'only the folders the boot script names')
  assert.equal((await post([{ repo: 'ResembleAI/chatterbox', path: 'conds.pt', dir: 'chatterbox/chatterbox_vc', name: 'conds.pt', sha256: sha('conds.pt'), bytes: 2048 }])).status, 202)
  const listed = await until(async () => { const s = await status(); return s.downloads['chatterbox/chatterbox_vc/conds.pt']?.state === 'done' && s })
  assert.deepEqual(listed.models.map((f) => `${f.dir}/${f.name}`), ['chatterbox/chatterbox_vc/conds.pt'], 'listed under its subfolder')
  assert.equal(fs.statSync(`${base}/models/chatterbox/chatterbox_vc/conds.pt`).size, 2048)
  assert.equal((await netFetch(`${url}/models/chatterbox/chatterbox_vc/conds.pt`, { method: 'DELETE', headers: auth })).status, 204)
  assert(!fs.existsSync(`${base}/models/chatterbox/chatterbox_vc/conds.pt`))
  assert.equal((await netFetch(`${url}/models/chatterbox/other/conds.pt`, { method: 'DELETE', headers: auth })).status, 404)

  await netFetch(`${url}/runtime/foley`, { method: 'POST', headers: auth })
  await until(async () => (await status()).runtimes.foley?.state === 'loading')
  assert.equal((await post([{ repo: 'tencent/HunyuanVideo-Foley', path: 'hunyuanvideo_foley.pth', dir: 'hunyuan_foley', name: 'hunyuanvideo_foley.pth', sha256: sha('hunyuanvideo_foley.pth') },
    { repo: 'Comfy-Org/HunyuanVideo-Foley', path: 'vae_128d_48k.pth', dir: 'vae', name: 'vae_128d_48k.pth', sha256: sha('vae_128d_48k.pth') }])).status, 202)
  await new Promise((r) => setTimeout(r, 1000))
  assert.equal(comfy.starts, 0, 'no restart while its checkpoint downloads')
  assert.equal((await status()).runtimes.foley.state, 'loading', 'listed by a ComfyUI that started without its files, so not ready')
  hold.release()
  const done = await until(async () => { const e = (await status()).runtimes.foley; return e.state === 'ready' && e }, 15000)
  assert.equal(done.error, null)
  assert.equal(comfy.starts, 1, 'one restart, once the files are in place')
})

await test('pack files: the Pods page lists and removes a pack\'s file by its subfolder, and a run sends each file\'s exact size', async () => {
  const { pod, rp } = setup()
  await pod.start()
  const deep = 'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/speech_tokenizer'
  rp.statusd = readyStatus({ models: [{ dir: deep, name: 'model.safetensors', bytes: 1 }], downloads: { [`${deep}/model.safetensors`]: { state: 'done' } } })
  await pod.refresh()
  assert.deepEqual(pod.status().downloads.map((d) => [d.dir, d.file]), [[deep, 'model.safetensors']])
  await pod.remove({ dir: deep, name: 'model.safetensors' })
  assert.equal(rp.calls.find((c) => c.method === 'DELETE').path, `/models/${deep}/model.safetensors`, 'each part of the folder travels as it is')
  const read = (n) => JSON.parse(fs.readFileSync(`public/workflows/${n}.json`, 'utf8'))
  const files = podNeedsOf(read('chatterbox_vc')).filter((n) => !n.runtime)
  rp.statusd = readyStatus({ downloads: Object.fromEntries(files.map((f) => [`${f.dir}/${f.name}`, { state: 'done' }])), runtimes: { chatterbox: { state: 'ready' } } })
  ;(await pod.lease({ files, runtimes: ['chatterbox'] })).release()
  const sent = rp.calls.find((c) => c.path === '/download').body.files.find((f) => f.name === 's3gen.pt' && f.dir === 'chatterbox/chatterbox_vc')
  assert.equal(sent.bytes, 1057165844, 'its size from the Hugging Face listing, not rounded from gigabytes')
})

await test('audio and 3D: Chatterbox, MiniMax Music 3 and Stable Audio 3 go to Comfy Cloud; Foley, InfiniteTalk, Drama 3, Qwen3-TTS and TRELLIS.2 need a Pod with their packs and files', async () => {
  podMode()
  let out = { type: 'audio', contentType: 'audio/flac', name: 'speech_00001_.flac', toBytes: async () => flacTwoSeconds }
  const client = {
    assets: { fromBytes: (buf, o) => ({ asset: o.filename }) },
    workflows: { fromFile: async (f) => ({ file: f, json: null, setInput() {} }) },
    run: async () => ({ outputs: [out] }),
  }
  const leases = []
  const lease = async (o) => { leases.push(o); return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }
  const png = 'data:image/png;base64,iVBORw0KGgo='
  const flac = `data:audio/flac;base64,${flacTwoSeconds.toString('base64')}`
  const vars = { prompt: 'A line', script: 'Hello there', lyrics: '[Instrumental]', language: 'English (en)', exaggeration: 0.5, cfg_weight: 0.5, seed: 1, start: 0, duration: 5,
    resolution: 1024, background: '#ffffff', image: png, audio: flac, voice: flac, video: 'data:video/mp4;base64,AAAAIGZ0eXBpc29t' }
  const run = (w, phase = 'none') => core.runComfy(w, vars, { createClient: () => client, lease, podPhase: async () => phase, podVram: () => 24, podRoom: () => ({}) })
  for (const w of ['chatterbox_tts', 'chatterbox_clone', 'chatterbox_vc', 'minimax_music3', 'stable_audio3']) {
    const files = await run(w)
    assert.deepEqual(files.map((f) => f.kind), ['audio'], `${w} keeps its speech`)
  }
  assert.equal(leases.length, 0, 'Comfy Cloud has these packs and files')
  for (const w of ['hunyuan_foley', 'infinitetalk', 'infinitetalk_tts', 'infinitetalk_v2v', 'drama3_tts', 'qwen3_tts', 'trellis2_image', 'flux_trellis2', 'trellis2_character', 'trellis2_turntable']) {
    await assert.rejects(run(w), (e) => e.code === 'needs_pod', `${w} needs a Pod`)
  }
  const key = (f) => `${f.dir}/${f.name}`
  await run('hunyuan_foley', 'ready')
  assert.deepEqual(leases.at(-1).runtimes, ['foley'])
  for (const k of ['hunyuan_foley/hunyuanvideo_foley.pth', 'vae/vae_128d_48k.pth', 'hunyuan_foley/siglip2/model.safetensors', 'hunyuan_foley/clap/pytorch_model.bin']) {
    assert(leases.at(-1).files.some((f) => key(f) === k), `Foley downloads ${k}`)
  }
  await run('infinitetalk_tts', 'ready')
  assert.deepEqual(leases.at(-1).runtimes, ['chatterbox', 'wanvideo'], 'a typed script runs Chatterbox, then InfiniteTalk, in one graph')
  assert(leases.at(-1).files.some((f) => key(f) === 'wav2vec2/wav2vec2-chinese-base_fp16.safetensors'))
  await run('qwen3_tts', 'ready')
  assert.deepEqual(leases.at(-1).runtimes, ['qwentts'], 'the Qwen-TTS pack that runs the open weights, not the Cloud one that calls a paid API')
  await run('drama3_tts', 'ready')
  assert(leases.at(-1).files.some((f) => key(f) === 'asr/qwen3_asr_0.6b_bf16.safetensors'))
  out = { type: 'file', contentType: 'application/octet-stream', name: 'trellis2_00001_.glb', toBytes: async () => Buffer.from('glTF') }
  assert.deepEqual((await run('trellis2_image', 'ready')).map((f) => f.kind), ['3d'])
  assert.deepEqual(leases.at(-1).runtimes, [], 'TRELLIS.2 runs on core nodes')

  // Chatterbox answers an error with one sample of silence.
  out = { type: 'audio', contentType: 'audio/flac', name: 'speech_00001_.flac', toBytes: async () => flacOneSample }
  await assert.rejects(run('chatterbox_tts'), /The voice model returned no sound/)
  assert.deepEqual([core.flacSeconds(flacOneSample) < 0.001, core.flacSeconds(flacTwoSeconds), core.flacSeconds(Buffer.from('ID3 not flac at all, long enough'))], [true, 2, null])
})

await test('audio and 3D: formats send Chatterbox its own language labels, a script or a recording, lyrics or an instrumental, and TRELLIS.2 its values', async () => {
  const { formats } = await import('../src/lib/formats/index.js')
  const { stepOptions, stepModel, selectedStep } = await import('../src/lib/formats/options.js')
  const by = Object.fromEntries(formats.map((f) => [f.id, f]))
  const pick = (id, values) => {
    const f = by[id]
    const all = { ...sampleInputs(f), ...values }
    const step = selectedStep(f, f.steps[0], all)
    return { model: stepModel(f, step, all), o: stepOptions(f, step, all) }
  }
  const nodes = JSON.parse(fs.readFileSync('scripts/fixtures/comfy-nodes.json', 'utf8'))
  const labels = nodes.packs.chatterbox.nodes.FL_ChatterboxMultilingualTTS.in.language[0]
  for (const id of ['tts', 'talking-head']) {
    for (const opt of by[id].inputs.find((i) => i.id === 'language').options) assert(labels.includes(opt.params.language), `${id} ${opt.id}: ${opt.params.language}`)
  }
  assert.equal(pick('tts', { language: 'zh' }).o.params.language, 'Chinese (zh)')
  const typed = pick('talking-head', { source: 'script', script: 'Hi, welcome back.', language: 'es', emotion: 'warm' })
  assert.deepEqual([typed.model.workflow, typed.o.fields.script, typed.o.params.language, typed.o.params.exaggeration], ['infinitetalk_tts', 'Hi, welcome back.', 'Spanish (es)', 0.6])
  assert(!typed.o.prompt.includes('welcome back'), 'the video prompt describes the scene; Chatterbox speaks the script')
  const recorded = pick('talking-head', { source: 'audio' })
  assert.deepEqual([recorded.model.workflow, recorded.o.params], ['infinitetalk', {}], 'a recording sets no speech values')
  assert(!by['talking-head'].inputs.some((i) => i.id === 'accent'), 'Chatterbox has no accent control')
  assert.deepEqual(['', '   ', null, 'Verse one'].map((lyrics) => pick('music', { lyrics }).o.fields.lyrics), ['[Instrumental]', '[Instrumental]', '[Instrumental]', 'Verse one'])
  assert.deepEqual(['draft', 'final'].map((detail) => pick('image-to-3d', { detail }).o.params.resolution), [1024, 1536])
  const spin = pick('turntable', { background: 'dark' })
  assert.deepEqual([spin.o.params.background, spin.o.prompt], ['#1c1c22', ''])
  assert.equal(pick('voice-clone', { name: 'My narrator voice' }).o.prompt, 'Hello, this is My narrator voice. It is ready to read anything you write.')
  assert.equal(pick('character-to-3d', {}).model.workflow, 'trellis2_character')
})
