// Pod checks: the boot script, the status server, the lifecycle and Pod runs. No call leaves this machine.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { test } from 'node:test'
import { podBootScript, podStartCmd, podEnv, START_CMD_MAX } from '../server/podBoot.js'
import { podManager, GPU_LADDER, NO_POD } from '../server/pod.js'
import { sandboxFetch } from '../server/podSandbox.js'
import { modelFilesOf, minVramOf, volumeFor, MODEL_FILES } from '../shared/modelFiles.js'

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
    return f.statusd ? reply(f.statusd) : reply({ error: 'not reachable' }, 502)
  }
  f.count = (pred) => f.calls.filter(pred).length
  return f
}

function setup({ key = 'acct-key', cap, at = '2026-10-17T10:00:00' } = {}) {
  const dir = fs.mkdtempSync(path.join(tmp, 'pod-'))
  const clock = { t: Date.parse(at) }
  const rp = fakeRunpod(clock)
  const opts = { fetch: rp.fetch, now: () => clock.t, keys: () => ({ key, cap }), dir: () => dir, owner: true, wait: async () => { clock.t += 3000; await opts.onWait?.() } }
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
  assert.deepEqual(modelFilesOf(read('h3_i2v')), [], 'a partner node needs no files')
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
  core.saveConnection('comfy', { mode: 'cloud', ...values })
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
  assert.throws(() => core.saveConnection('comfy', { mode: 'gpu' }), /Choose Local or Comfy Cloud \+ Pod/)
  assert.throws(() => core.saveConnection('comfy', { mode: 'pod' }), /Choose Local or Comfy Cloud \+ Pod/)
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
  assert.equal(offCloud.reason, 'sd_xl_base_1.0.safetensors is not on Comfy Cloud')
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
    const filled = JSON.stringify(fill(g, comfyVars(kind, { prompt: 'A fox', aspect: '16:9', duration: 5, image: 'start.png' })))
    assert(!filled.includes('{{'), `${w} leaves a placeholder unfilled`)
  }
  const ltx = models.find((m) => m.id === 'comfy-ltx25')
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
  assert.equal(core.workflowNeeds('h3_open_t2v').minVramGb, 96)
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
  assert.equal(leased, false, 'a 24 GB Pod does not take a 96 GB run; Cloud does')
  podMode({})
  await assert.rejects(core.runComfy('h3_open_t2v', h3, { createClient: () => client, lease, podPhase: async () => 'ready', podVram: () => 24 }),
    (e) => e.code === 'pod_too_small' && /needs a 96 GB GPU; your Pod has 24 GB/.test(e.message))
  podMode()
  leased = false
  await core.runComfy('h3_open_t2v', h3, { createClient: () => client, lease: async () => { leased = true; return { baseUrl: 'https://p-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} } }, podPhase: async () => 'ready', podVram: () => 96 })
  assert.equal(leased, true, 'a 96 GB Pod takes it')
})

await test('models: every bundled workflow is a linked API graph that saves media', async () => {
  const { comfyVars, fill } = await import('../shared/mapping.js')
  for (const w of fs.readdirSync('public/workflows')) {
    const kind = /video|i2v|t2v|ltx/.test(w) ? 'video' : 'image'
    const graph = fill(JSON.parse(fs.readFileSync(`public/workflows/${w}`, 'utf8')), comfyVars(kind, { prompt: 'A fox', aspect: '16:9', duration: 5, image: 'start.png' }))
    const visit = (value) => {
      if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && Number.isInteger(value[1])) assert(graph[value[0]], `${w}: dangling link to ${value[0]}`)
      else if (value && typeof value === 'object') Object.values(value).forEach(visit)
    }
    for (const node of Object.values(graph)) {
      assert.equal(typeof node.class_type, 'string', w)
      assert(node.inputs && !Array.isArray(node.inputs), w)
      visit(node.inputs)
    }
    assert(Object.values(graph).some((n) => /^Save(Image|Video|Animated(WEBP|PNG)|Audio\w*)$/.test(n.class_type)), `${w} saves nothing`)
    if (/i2v/.test(w)) assert(Object.values(graph).some((n) => n.class_type === 'LoadImage' && n.inputs.image === 'start.png'), `${w} takes no start image`)
  }
})
