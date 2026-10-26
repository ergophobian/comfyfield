// Importing this module never loads keys or the provider core.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { fork } from 'node:child_process'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const ledgerFile = path.join(root, 'research_notes/live-runs/ledger.jsonl')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const prompt = 'A red ceramic cup on a wooden table in soft daylight'
const vars = { prompt, width: 512, height: 512, count: 1, seed: 71 }
export const plans = {
  cloud: {
    estimate: 0.6, maximum: 1.5, keys: ['comfy'],
    calls: [
      { workflow: 'image_flux', vars, patch: { '1': { ckpt_name: 'flux1-schnell-fp8.safetensors' }, '6': { steps: 4 } }, estimate: 0.1, maximum: 0.5 },
      // The half-size latent is at least 64px; 9 frames is the shortest moving 8n+1 clip.
      { workflow: 'ltx25_t2v', vars: { ...vars, width: 128, height: 128, frames: 9 }, estimate: 0.5, maximum: 1 },
    ],
  },
  router: {
    estimate: 0.002717, maximum: 0.01, keys: ['comfy'],
    calls: [{ model: 'luma/photon-flash-1', input: { prompt, aspect_ratio: '1:1' }, estimate: 0.002717, maximum: 0.01 }],
  },
  pod: {
    estimate: 1.5, maximum: 1.5, keys: ['runpod'], minutes: 45,
    calls: [
      { action: 'start', workflow: 'image_sdxl', estimate: 1.5, maximum: 1.5 },
      { workflow: 'image_sdxl', vars, estimate: 0, maximum: 0 },
      { workflow: 'image_sdxl', vars: { ...vars, seed: 72 }, estimate: 0, maximum: 0 },
      { action: 'pause' },
      { action: 'resume', workflow: 'image_sdxl', estimate: 0, maximum: 0 },
      { action: 'check-model-survived', file: 'checkpoints/sd_xl_base_1.0.safetensors' },
      { workflow: 'image_sdxl', vars: { ...vars, seed: 73 }, estimate: 0, maximum: 0 },
      { action: 'observe-idle-terminate', minutes: 10 },
      { action: 'terminate-and-verify-account' },
    ],
  },
  // A Pod whose app has gone away must end itself with RunPod's pod-scoped key. The harness only reads
  // the Pod: no heartbeat and no app-side guard. The outside guard waits five minutes past the deadline.
  podself: {
    estimate: 0.25, maximum: 0.4, keys: ['runpod'], minutes: 15, grace: 5,
    calls: [{ action: 'start-and-observe-self-terminate', estimate: 0.25, maximum: 0.4 }],
  },
}

export function readLedger(file) {
  if (!fs.existsSync(file)) throw new Error('The central ledger is missing. Restore it before running.')
  return fs.readFileSync(file, 'utf8').split('\n').filter((line) => line.trim()).map((line) => {
    const row = JSON.parse(line)
    for (const field of ['estimatedCost', 'maximumCost']) {
      if (!Number.isFinite(row[field]) || row[field] < 0) throw new Error('Invalid spend ledger.')
    }
    if (row.actualCost != null && (!Number.isFinite(row.actualCost) || row.actualCost < 0)) throw new Error('Invalid actual cost in ledger.')
    return row
  })
}
export const ledgerTotal = (rows) => rows.reduce((total, row) => total + (row.actualCost ?? row.maximumCost), 0)
const money = (value, name) => {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid ${name}.`)
  return n
}
export function checkCap(rows, maximum, cap = 15) {
  money(cap, 'cap')
  if (cap > 15) throw new Error('The live-test ceiling is $15; --cap can only lower it.')
  if (ledgerTotal(rows) + maximum > cap + 1e-9) throw new Error('Spend cap exceeded; no call made.')
}
function writeLedger(file, rows) {
  const tmp = `${file}.${randomUUID()}.tmp`
  const fd = fs.openSync(tmp, 'wx', 0o600)
  try {
    fs.writeFileSync(fd, rows.map((row) => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''))
    fs.fsyncSync(fd)
  } finally { fs.closeSync(fd) }
  fs.renameSync(tmp, file)
}
export function acquireLock(file) {
  let fd
  try { fd = fs.openSync(file, 'wx', 0o600) } catch (e) {
    if (e.code === 'EEXIST') throw new Error('Another live run holds the lock. Stop its owner and sweep any Pod before recovering the lock.')
    throw e
  }
  fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, time: new Date().toISOString() }))
  fs.fsyncSync(fd)
  fs.closeSync(fd)
  return () => fs.unlinkSync(file)
}
export function dryRun(backend, { keys = {}, file = ledgerFile, cap = 15, maximum = plans[backend]?.maximum } = {}) {
  const plan = plans[backend]
  if (!plan) throw new Error('Choose cloud, router, pod, podself or sweep.')
  maximum = money(maximum, 'per-run maximum')
  if (maximum < plan.estimate) throw new Error('Per-run maximum is below the planned estimate.')
  checkCap(readLedger(file), maximum, cap)
  return {
    backend, dryRun: true, keysChecked: false, keyFile: '.comfyfield/keys.json',
    keys: Object.fromEntries(plan.keys.map((id) => [`${id}.key`, Boolean(keys[id]?.key?.trim())])),
    estimate: plan.estimate, maximum, ledgerTotal: ledgerTotal(readLedger(file)), cap,
    calls: plan.calls,
    ...(backend === 'cloud' ? { target: 'Comfy Cloud via core.runComfy and the SDK; never a Pod' } : {}),
    ...(backend === 'router' ? { discovery: 'GET https://api.comfy.org/v2/models, all pages; require luma/photon-flash-1', target: 'POST https://api.comfy.org/v2/models/luma/photon-flash-1/requests via core.runComfyRouter', pricing: 'Cheapest fixed-price text-to-image model in the published pricing snapshot; catalog has no prices' } : {}),
    library: '.comfyfield/media + generation-imports.json → /api/library/generations',
    ...(backend === 'podself' ? { safety: `proof deadline ${plan.minutes} minutes after create; outside guard at ${plan.minutes + plan.grace}; final sweep of this proof's Pod only`, gpu: 'first in-stock ladder rung' } : {}),
    ...(backend === 'pod' ? { safety: '10 minute idle, 45 minute absolute deadline, detached parent-death guard, final account sweep', gpu: 'first in-stock ladder rung fitting image_sdxl; reject quote above reserved maximum', volumeGb: 120 } : {}),
  }
}

// Reserve before submitting. A crash leaves the maximum charged locally until reconciled.
export async function paidCall({ file, backend, call, runId = randomUUID(), invoke }) {
  const rows = readLedger(file)
  const row = { time: new Date().toISOString(), backend, model: call.model || call.workflow, action: call.action || 'generate', estimatedCost: call.estimate, maximumCost: call.maximum, actualCost: null, runId, providerRunId: null, outcome: 'reserved' }
  rows.push(row)
  const save = () => writeLedger(file, rows)
  save()
  const onSubmitted = ({ id }) => { row.providerRunId = id; row.outcome = 'submitted'; save() }
  const onComplete = ({ actualCost, seconds }) => {
    if (actualCost != null && Number.isFinite(actualCost) && actualCost >= 0) row.actualCost = actualCost
    if (Number.isFinite(seconds)) row.seconds = seconds
    save()
  }
  try {
    const result = await invoke({ onSubmitted, onComplete, runId })
    if (row.actualCost != null && row.actualCost > row.maximumCost) throw new Error('Reported cost exceeded the per-call maximum; no further calls will be submitted.')
    row.outcome = 'succeeded'
    return result
  } catch (e) {
    // Provider errors can contain signed URLs or echoed keys. Store only class and status.
    // A job that timed out and refused to cancel may still be spending: stop and check the provider.
    row.outcome = e.uncancelled ? 'uncancelled' : 'failed'
    if (e.uncancelled) e.message = `Job ${e.uncancelled} did not cancel and may still be running. Cancel it in Comfy Cloud before another run.`
    e.liveCall = true
    row.error = { name: e.name, status: e.status ?? e.httpStatus ?? null }
    throw e
  } finally { save() }
}

// Discard provider environment variables without reading their values, before loading the core.
export function savedKeysOnly() {
  for (const name of ['COMFY_API_KEY', 'COMFY_URL', 'COMFY_MODE', 'COMFY_RUN', 'COMFY_BASE_URL', 'COMFYFIELD_POD_SANDBOX', 'FAL_KEY', 'GEMINI_API_KEY', 'ELEVENLABS_API_KEY', 'RUNPOD_API_KEY', 'RUNPOD_DAILY_CAP', 'RUNPOD_AUTO_START', 'RUNPOD_IDLE_MIN', 'RUNPOD_TIER']) delete process.env[name]
  process.env.COMFYFIELD_HOME = root
  // The account may hold the owner's own ComfyField Pod. The proof must never adopt or end it.
  process.env.COMFYFIELD_POD_ADOPT_PREFIX = LIVE_PREFIX
}
async function loadCore() {
  savedKeysOnly()
  return import('../server/core.js')
}
export const LIVE_PREFIX = 'comfyfield-live-'
const prefixOf = (id) => `${LIVE_PREFIX}${id}`

export async function guardPod({ manager, alive, deadline, prefix, wait = sleep, now = Date.now, ready = () => {} }) {
  ready()
  for (;;) {
    if (!alive() || now() >= deadline) {
      const rows = await manager.sweep({ prefix }).catch(() => null)
      // A crashed create may appear on the account late. Retry through the deadline.
      if (rows && rows.every((row) => row.terminated) && now() >= deadline + 120_000) return
    }
    await wait(5000)
  }
}
async function launchGuard(id, deadline) {
  const child = fork(fileURLToPath(import.meta.url), ['guard', id, String(process.pid), String(deadline)], {
    detached: true, stdio: ['ignore', 'ignore', 'ignore', 'ipc'], execArgv: [],
    env: { PATH: process.env.PATH, ...(process.platform === 'win32' ? { SystemRoot: process.env.SystemRoot, TEMP: process.env.TEMP } : {}), COMFYFIELD_HOME: root, COMFYFIELD_POD_ADOPT_PREFIX: LIVE_PREFIX },
  })
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error('Pod cleanup guard did not start.')) }, 10000)
    child.once('message', (m) => { if (m.ready) { clearTimeout(timer); resolve() } })
    child.once('error', (e) => { clearTimeout(timer); reject(e) })
    child.once('exit', () => { clearTimeout(timer); reject(new Error('Pod cleanup guard exited before readiness.')) })
  })
  child.unref()
  child.channel.unref()
  return () => { if (child.connected) child.send({ done: true }, () => child.disconnect()) }
}
async function until(manager, predicate, deadline) {
  while (Date.now() < deadline) {
    await manager.tick()
    const status = manager.status()
    if (predicate(status)) return status
    await sleep(3000)
  }
  throw new Error('Pod proof deadline reached.')
}
// Only live-proof Pods count. Other ComfyField Pods on the account belong to someone's app.
export async function assertAccountEmpty(manager) {
  if ((await manager.sweep({ dryRun: true, prefix: LIVE_PREFIX })).length) throw new Error('Live-proof Pods already exist. Run sweep separately before a proof.')
}
export async function podProof(core, { file, id, maximum, launchCleanup = launchGuard }) {
  const manager = core.pod()
  await assertAccountEmpty(manager)
  const needs = core.workflowNeeds('image_sdxl')
  const quote = await manager.quote({ minVramGb: needs.minVramGb })
  const gpu = quote.rungs.find((r) => r.inStock && r.usdPerHr > 0)
  // Running volume + container disk, paused volume and a two-minute cleanup margin.
  if (!gpu || (gpu.usdPerHr + 170 * 0.2 / 730) * 47 / 60 > maximum) throw new Error('No fitting Pod quote within the per-run maximum.')
  const deadline = Date.now() + plans.pod.minutes * 60_000
  const stopGuard = await launchCleanup(id, deadline)
  const evidence = { gpu: gpu.name, quotePerHour: gpu.usdPerHr, deadline: new Date(deadline).toISOString(), runs: [] }
  try {
    const timed = async (action) => {
      const t0 = Date.now()
      const call = plans.pod.calls.find((c) => c.action === action)
      return paidCall({ file, backend: 'pod', call: { ...call, maximum: action === 'start' ? maximum : 0 }, invoke: async ({ onSubmitted }) => {
        if (action === 'start') await manager.start({ ...needs, volumeGb: 120, gpu, proof: { id, terminateAt: deadline } })
        else await manager.resume()
        onSubmitted({ id: manager.status().pod.id })
        const rate = manager.status().pod.costPerHr
        if (!rate || (rate + 170 * 0.2 / 730) * 47 / 60 > maximum) throw new Error('Created Pod rate exceeds the reserved maximum.')
        const ready = await until(manager, (s) => s.phase === 'ready', deadline)
        if (!ready.safety.selfTerminateReady || ready.safety.proofDeadline !== Math.floor(deadline / 1000)) throw new Error('Pod did not confirm its independent termination guard.')
        evidence[`${action}ToReadySeconds`] = (Date.now() - t0) / 1000
        return ready
      } })
    }
    await timed('start')
    const generate = async (index) => {
      const call = plans.pod.calls.filter((c) => c.vars)[index]
      await paidCall({ file, backend: 'pod', call, invoke: async (hooks) => {
        const files = await core.runComfy(call.workflow, call.vars, { run: 'session', ...hooks, timeoutMs: Math.max(1, deadline - Date.now()) })
        const items = await core.saveToLibrary(files, { model: 'Sdxl proof', caption: prompt, backend: 'pod', proofId: id })
        evidence.runs.push(items.map((item) => item.url))
      } })
    }
    await generate(0)
    await generate(1)
    await manager.pause({ now: true })
    await timed('resume')
    // Check before lease() can download missing files and conceal a lost /workspace.
    if (!manager.models().some((f) => f.name === 'sd_xl_base_1.0.safetensors' && f.dir === 'checkpoints')) throw new Error('Sdxl did not survive pause/resume.')
    evidence.modelSurvived = true
    await generate(2)
    const idle = await until(manager, (s) => s.phase === 'none', deadline)
    if (!/10 idle minutes/.test(idle.event?.text || '')) throw new Error('Pod ended without the expected ten-minute idle evidence.')
    evidence.idleTermination = idle.event.text
    return evidence
  } finally {
    manager.stopMonitor()
    const results = await manager.sweep({ prefix: prefixOf(id) })
    if (results.every((row) => row.terminated)) {
      await assertAccountEmpty(manager)
      stopGuard()
    } else throw new Error('Pod cleanup failed. The detached guard is retrying; run sweep.')
  }
}

export async function podSelfProof(core, { file, id, maximum, launchCleanup = launchGuard, wait = sleep, now = Date.now }) {
  const { minutes, grace } = plans.podself
  const manager = core.pod()
  await assertAccountEmpty(manager)
  const quote = await manager.quote({ minVramGb: 0 })
  const gpu = quote.rungs.find((r) => r.inStock && r.usdPerHr > 0)
  const costOf = (rate) => (rate + 170 * 0.2 / 730) * (minutes + grace + 2) / 60
  if (!gpu || costOf(gpu.usdPerHr) > maximum) throw new Error('No fitting Pod quote within the per-run maximum.')
  const t0 = now()
  const terminateAt = t0 + minutes * 60_000
  const stopGuard = await launchCleanup(id, terminateAt + grace * 60_000)
  const evidence = { gpu: gpu.name, quotePerHour: gpu.usdPerHr, deadline: new Date(terminateAt).toISOString() }
  try {
    await paidCall({ file, backend: 'pod', call: { ...plans.podself.calls[0], maximum }, invoke: async ({ onSubmitted }) => {
      await manager.start({ gpu, proof: { id, terminateAt } })
      onSubmitted({ id: manager.status().pod.id })
      const rate = manager.status().pod.costPerHr
      if (!rate || costOf(rate) > maximum) throw new Error('Created Pod rate exceeds the reserved maximum.')
      while (now() < terminateAt + grace * 60_000) {
        await manager.refresh()
        const s = manager.status()
        if (s.phase === 'ready' && evidence.startToReadySeconds == null) {
          if (!s.safety.selfTerminateReady || s.safety.proofDeadline !== Math.floor(terminateAt / 1000)) throw new Error('Pod did not confirm its independent termination guard.')
          evidence.startToReadySeconds = (now() - t0) / 1000
        }
        if (s.phase === 'none') {
          evidence.goneAfterSeconds = (now() - t0) / 1000
          evidence.goneAfterDeadlineSeconds = (now() - terminateAt) / 1000
          evidence.event = s.event?.text || null
          return
        }
        await wait(5000)
      }
      throw new Error('The Pod did not terminate itself before the outside guard.')
    } })
    if (evidence.startToReadySeconds == null) throw new Error('The Pod ended before it was ready; self-termination is not proven.')
    return evidence
  } finally {
    manager.stopMonitor()
    const results = await manager.sweep({ prefix: prefixOf(id) })
    evidence.sweptByHarness = results.filter((row) => row.terminated).length
    if (results.every((row) => row.terminated)) {
      await assertAccountEmpty(manager)
      stopGuard()
    } else throw new Error('Pod cleanup failed. The detached guard is retrying; run sweep.')
  }
}

export async function execute(backend, { file = ledgerFile, cap = 15, maximum = plans[backend]?.maximum, core, allowPaid = false, print = console.log, dry = false, keys = dry ? {} : core?.readKeys() || {}, signal } = {}) {
  const release = acquireLock(`${file}.lock`)
  try {
    const preview = dryRun(backend, { file, cap, maximum, keys })
    print(JSON.stringify(preview, null, 2))
    if (dry) return preview
    if (!allowPaid) throw new Error('Spend approval required. After Kyle approves, pass --allow-paid.')
    if (Object.values(preview.keys).some((present) => !present)) throw new Error('Missing Connections key; no call made.')
    const id = randomUUID()
    if (backend === 'pod') return await podProof(core, { file, id, maximum })
    if (backend === 'podself') return await podSelfProof(core, { file, id, maximum })
    const results = []
    for (const call of plans[backend].calls) {
      const limit = maximum * call.maximum / plans[backend].maximum
      checkCap(readLedger(file), limit, cap)
      results.push(await paidCall({ file, backend, call: { ...call, maximum: limit }, invoke: async (hooks) => {
        let files
        if (backend === 'router') {
          let cursor
          let found = false
          for (let page = 0; page < 100; page++) {
            const catalog = await core.listComfyRouterModels({ cursor })
            found ||= catalog.data.some((m) => m.id === call.model)
            if (!catalog.has_more) break
            if (!catalog.next_cursor || catalog.next_cursor === cursor) throw new Error('Router catalog pagination failed.')
            cursor = catalog.next_cursor
          }
          if (!found) throw new Error('The planned cheapest Router model is unavailable; no substitute submitted.')
          files = await core.runComfyRouter({ model: call.model, input: call.input, idempotencyKey: hooks.runId }, { ...hooks, ...(signal && { signal }) })
        } else {
          files = await core.runComfy(call.workflow, call.vars, {
            run: 'instant', podPhase: async () => 'none', ...hooks, ...(signal && { signal }),
            timeoutMs: Math.floor(limit / core.CLOUD_USD_PER_GPU_SEC * 1000),
            patchGraph: (graph) => {
              for (const [node, inputs] of Object.entries(call.patch || {})) Object.assign(graph[node].inputs, inputs)
              return graph
            },
          })
        }
        return core.saveToLibrary(files, { model: call.model || call.workflow, caption: prompt, backend, proofId: id })
      } }))
      if (ledgerTotal(readLedger(file)) > cap) throw new Error('Reported cost exceeded the cap. No further calls submitted.')
    }
    return results
  } finally { release() }
}

export async function main(args = process.argv.slice(2)) {
  const [backend, ...options] = args
  if (backend === 'guard') {
    const [id, owner, deadline] = options
    if (!/^[a-f0-9-]{36}$/.test(id) || !Number.isSafeInteger(Number(owner)) || !Number.isSafeInteger(Number(deadline))) throw new Error('Invalid guard arguments.')
    const core = await loadCore()
    let disconnected = false
    process.once('disconnect', () => { disconnected = true })
    process.on('message', (m) => { if (m.done) process.exit(0) })
    return guardPod({ manager: core.pod(), prefix: prefixOf(id), deadline: Number(deadline), alive: () => { if (disconnected) return false; try { process.kill(Number(owner), 0); return true } catch { return false } }, ready: () => process.send?.({ ready: true }) })
  }
  if (!['cloud', 'router', 'pod', 'podself', 'sweep'].includes(backend)) throw new Error('Usage: node scripts/live-run.mjs cloud|router|pod|podself|sweep [--dry-run] [--cap 15] [--max dollars] [--allow-paid] [--all, sweep only]')
  let cap = 15
  let maximum = plans[backend]?.maximum
  let dry = false
  let allowPaid = false
  let all = false
  for (let i = 0; i < options.length; i++) {
    if (options[i] === '--dry-run') dry = true
    else if (options[i] === '--allow-paid') allowPaid = true
    else if (options[i] === '--all' && backend === 'sweep') all = true
    else if (options[i] === '--cap') cap = money(options[++i], 'cap')
    else if (options[i] === '--max') maximum = money(options[++i], 'per-run maximum')
    else throw new Error('Unknown live-run option.')
  }
  if (dry && backend !== 'sweep') {
    // Planning must work without opening Connections or importing provider code.
    return execute(backend, { cap, maximum, keys: {}, dry: true })
  }
  if (dry && backend === 'sweep') {
    return console.log(JSON.stringify({ dryRun: true, keysChecked: false, calls: ['List account Pods via server/pod.js', `Terminate every ${all ? 'comfyfield-' : LIVE_PREFIX}* Pod, including paused Pods`, 'List again and fail if any live-proof Pod remains'] }, null, 2))
  }
  const core = await loadCore()
  if (backend === 'sweep') {
    // Recovery remains available when a crashed owner left its spend lock behind.
    // `--all` also ends Pods the app started, which may be in use from another checkout.
    const rows = await core.pod().sweep(all ? {} : { prefix: LIVE_PREFIX })
    console.log(JSON.stringify(rows, null, 2))
    if (rows.some((row) => !row.terminated)) throw new Error('Some ComfyField Pods could not be terminated. Retry sweep.')
    await assertAccountEmpty(core.pod())
    return
  }
  // Ctrl-C cancels the job in flight instead of leaving it running.
  const stop = new AbortController()
  for (const name of ['SIGINT', 'SIGTERM']) process.once(name, () => stop.abort())
  const result = await execute(backend, { cap, maximum, core, allowPaid, dry, signal: stop.signal })
  if (!dry) console.log(JSON.stringify(result, null, 2))
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.liveCall || e.status || e.httpStatus ? 'Provider run failed. Check the ledger run id and provider history before retrying; run sweep for Pod cleanup.' : e.message)
    process.exitCode = 1
  })
}
