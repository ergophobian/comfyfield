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
import { podManager, GPU_LADDER, NO_POD } from '../server/pod.js'
import { sandboxFetch } from '../server/podSandbox.js'

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

// ---- lifecycle -------------------------------------------------------------------------------------

const reply = (data, status = 200) => new Response(data == null ? null : JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
const readyStatus = (extra = {}) => ({ stage: 'ready', ready: true, fatal: null, idleSec: 0, queue: 0, models: [], downloads: {}, ...extra })

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
      return reply(pod)
    }
    if (u.host === 'api.runpod.io') return reply({ data: { myself: { id: 'me' } } })
    if (u.pathname === '/heartbeat') return reply(null, 204)
    if (u.pathname === '/download') return reply({ downloads: {} }, 202)
    return f.statusd ? reply(f.statusd) : reply({ error: 'not reachable' }, 502)
  }
  f.count = (pred) => f.calls.filter(pred).length
  return f
}

function setup({ key = 'acct-key', cap } = {}) {
  const dir = fs.mkdtempSync(path.join(tmp, 'pod-'))
  const clock = { t: Date.parse('2026-10-17T10:00:00') }
  const rp = fakeRunpod(clock)
  const opts = { fetch: rp.fetch, now: () => clock.t, keys: () => ({ key, cap }), dir: () => dir, wait: async () => { clock.t += 3000; await opts.onWait?.() } }
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
  assert.equal(b.volumeInGb, 60)
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
  const { pod, rp, clock } = setup()
  await pod.start({ volumeGb: 100 })
  rp.statusd = readyStatus()
  await pod.tick()
  await pod.pause({ now: true })
  assert(pod.status().spend.today < 0.01)
  clock.t += 24 * 3_600_000
  await pod.tick()
  const day = pod.spentToday()
  assert(day > 0.6 && day < 0.7, `100 GB stopped for a day is about $0.66, got ${day}`)
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
  assert.deepEqual(dl.body.files, [{ repo: 'org/a', path: 'a.safetensors', dir: 'checkpoints', name: 'a.safetensors' }], 'only the missing file')
  assert.equal(l.baseUrl, 'https://pod1-8189.proxy.runpod.net')
  assert.equal(l.token.length, 48)
  l.release()

  rp.statusd = readyStatus({ downloads: { 'checkpoints/b.safetensors': { state: 'failed', error: 'HTTP Error 404: Not Found' } } })
  await assert.rejects(pod.lease({ files: [{ repo: 'org/b', path: 'b.safetensors', dir: 'checkpoints', name: 'b.safetensors' }] }), /Could not download b\.safetensors to the Pod: HTTP Error 404/)
  rp.statusd = readyStatus({ downloads: { 'checkpoints/c.safetensors': { state: 'failed', error: 'disk full' } } })
  await assert.rejects(pod.lease({ files: [{ repo: 'org/c', path: 'c.safetensors', dir: 'checkpoints', name: 'c.safetensors' }] }), /disk is full/)
  assert.equal(pod.status().runs, 0, 'failed leases release themselves')
})

await test('lifecycle: the sandbox runs a whole Pod life without RunPod', async () => {
  const dir = fs.mkdtempSync(path.join(tmp, 'sandbox-'))
  const clock = { t: Date.now() }
  const net = sandboxFetch({ file: () => path.join(dir, 'pod-sandbox.json'), now: () => clock.t, mode: '1' })
  const pod = podManager({ fetch: net, now: () => clock.t, keys: () => ({ key: 'sandbox' }), dir: () => dir, sandbox: true, wait: async () => { clock.t += 3000 } })
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
