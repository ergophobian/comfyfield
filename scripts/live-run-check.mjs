// Offline only: every provider request is a fake, and Connections lives in a fixture home.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { acquireLock, checkCap, dryRun, execute, guardPod, ledgerTotal, paidCall, plans, readLedger, root, savedKeysOnly } from './live-run.mjs'

fs.mkdirSync('outputs', { recursive: true })
const tmp = fs.mkdtempSync(path.resolve('outputs/live-run-check-'))
let sequence = 0
function ledger(rows = []) {
  const file = path.join(tmp, `ledger-${sequence++}.jsonl`)
  fs.writeFileSync(file, rows.map((row) => JSON.stringify(row)).join('\n'))
  return file
}
const row = (maximumCost, actualCost = null) => ({ estimatedCost: maximumCost, maximumCost, actualCost })
const denied = () => { throw new Error('Unexpected network or paid call') }
globalThis.fetch = denied

await test('cap uses unknown reservations, reported actuals, strict input and a $15 ceiling', () => {
  assert.equal(ledgerTotal([row(4), row(3, 1)]), 5)
  assert.doesNotThrow(() => checkCap([row(14)], 1, 15))
  assert.throws(() => checkCap([row(14.01)], 1, 15), /cap exceeded/)
  for (const cap of [0, -1, NaN, Infinity, 15.01]) assert.throws(() => checkCap([], 1, cap))
  assert.throws(() => dryRun('cloud', { file: ledger(), maximum: 0.01 }), /below/)
  assert.throws(() => readLedger(ledger([row(-1)])), /Invalid/)
  const broken = ledger()
  fs.appendFileSync(broken, '{')
  assert.throws(() => readLedger(broken))
})

await test('exclusive lock refuses a second process and a crashed owner lock stays fail-closed', async () => {
  const file = ledger()
  const release = acquireLock(`${file}.lock`)
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `import { acquireLock } from './scripts/live-run.mjs'; acquireLock(${JSON.stringify(`${file}.lock`)})`], { cwd: root, encoding: 'utf8' })
  assert.notEqual(child.status, 0)
  assert.match(child.stderr, /Another live run/)
  await assert.rejects(execute('router', { file, dry: true, keys: {}, print: denied }), /Another live run/)
  release()
  assert.equal(fs.existsSync(`${file}.lock`), false)
})

await test('dry runs expose exact plans and presence only, without provider imports, network or ledger writes', async () => {
  for (const backend of Object.keys(plans)) {
    const file = ledger()
    let output
    const result = await execute(backend, { file, dry: true, keys: { comfy: { key: 'never-print-this' }, runpod: { key: 'never-print-that' } }, print: (text) => { output = text } })
    assert.equal(result.backend, backend)
    assert.equal(result.dryRun, true)
    assert.equal(result.ledgerTotal, 0)
    assert(Object.values(result.keys).every((v) => v === true))
    assert(!/never-print/.test(output))
    assert.deepEqual(result.calls, plans[backend].calls)
    assert.equal(fs.readFileSync(file, 'utf8'), '')
    assert(!fs.existsSync(`${file}.lock`))
  }
})

await test('cap, approval and missing saved keys refuse before any provider work', async () => {
  const core = { readKeys: () => ({}), runComfy: denied, pod: denied, runComfyRouter: denied }
  await assert.rejects(execute('cloud', { file: ledger([row(14)]), core, allowPaid: true, print: () => {} }), /cap exceeded/)
  await assert.rejects(execute('cloud', { file: ledger(), core, print: () => {} }), /approval required/)
  const file = ledger()
  await assert.rejects(execute('pod', { file, core, allowPaid: true, print: () => {} }), /Missing Connections/)
  assert.equal(readLedger(file).length, 0)
})

await test('reservation is durable before submission, failures preserve ids and reserve unknown charges', async () => {
  const file = ledger()
  await assert.rejects(paidCall({ file, backend: 'cloud', call: plans.cloud.calls[0], invoke: async ({ onSubmitted }) => {
    assert.equal(readLedger(file)[0].outcome, 'reserved')
    onSubmitted({ id: 'provider-run-1' })
    assert.equal(readLedger(file)[0].providerRunId, 'provider-run-1')
    throw new Error('secret-provider-body')
  } }), /secret-provider-body/)
  const [saved] = readLedger(file)
  assert.equal(saved.outcome, 'failed')
  assert.equal(saved.maximumCost, 0.5)
  assert.equal(saved.actualCost, null)
  assert.equal(saved.providerRunId, 'provider-run-1')
  assert(!fs.readFileSync(file, 'utf8').includes('secret-provider-body'))
  assert.equal(ledgerTotal(readLedger(file)), 0.5)
})

await test('reported cost replaces reservation without adding a second line per call', async () => {
  const file = ledger()
  await paidCall({ file, backend: 'router', call: plans.router.calls[0], invoke: async ({ onComplete }) => onComplete({ actualCost: 0.002717 }) })
  const rows = readLedger(file)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].outcome, 'succeeded')
  assert.equal(ledgerTotal(rows), 0.002717)
})

await test('shell key fallbacks are discarded without reading them', () => {
  process.env.COMFY_API_KEY = 'mock-shell-key'
  process.env.RUNPOD_API_KEY = 'mock-shell-pod-key'
  process.env.COMFY_MODE = 'local'
  process.env.COMFY_BASE_URL = 'https://wrong.test'
  savedKeysOnly()
  assert.equal(process.env.COMFY_API_KEY, undefined)
  assert.equal(process.env.RUNPOD_API_KEY, undefined)
  assert.equal(process.env.COMFY_MODE, undefined)
  assert.equal(process.env.COMFY_BASE_URL, undefined)
})

process.env.COMFYFIELD_HOME = tmp
const core = await import('../server/core.js')
core.writeKeys({ comfy: { key: 'mock-saved-key' }, runpod: { key: 'mock-runpod-key', idle: 60 } })
const { podManager } = await import('../server/pod.js')
const { podEnv } = await import('../server/podBoot.js')
const json = (value, status = 200) => new Response(JSON.stringify(value), { status })

await test('cloud proof uses core, pins instant routing, patches schnell to four steps and submits twice', async () => {
  const calls = []
  const file = ledger()
  const fake = {
    ...core,
    runComfy: async (workflow, vars, opts) => {
      assert.equal(opts.run, 'instant')
      assert.equal(await opts.podPhase(), 'none')
      assert(opts.timeoutMs > 0)
      calls.push({ workflow, vars })
      const graph = opts.patchGraph(JSON.parse(fs.readFileSync(`public/workflows/${workflow}.json`, 'utf8')))
      if (workflow === 'image_flux') {
        assert.equal(graph['1'].inputs.ckpt_name, 'flux1-schnell-fp8.safetensors')
        assert.equal(graph['6'].inputs.steps, 4)
      } else assert.deepEqual([vars.width, vars.height, vars.frames], [128, 128, 9])
      opts.onSubmitted({ id: `job-${calls.length}` })
      return [{ url: '/media/mock.png', kind: workflow === 'image_flux' ? 'image' : 'video' }]
    },
  }
  await execute('cloud', { file, core: fake, allowPaid: true, print: () => {} })
  assert.equal(calls.length, 2)
  assert.equal(readLedger(file).length, 2)
  assert.equal(core.libraryImports().length, 2)
})

await test('SDK submission id is recorded before polling; failed polling requests cancellation', async () => {
  const order = []
  const client = {
    workflows: { fromFile: async () => ({ json: null }) },
    submit: async (wf) => {
      assert.equal(wf.json['6'].inputs.steps, 4)
      order.push('submit')
      return { id: 'sdk-job-71', wait: async () => { order.push('wait'); throw new Error('timeout') }, cancel: async () => { order.push('cancel') } }
    },
  }
  await assert.rejects(core.runComfy('image_flux', varsForTest(), {
    run: 'instant', podPhase: async () => 'none', createClient: () => client,
    patchGraph: (g) => { g['6'].inputs.steps = 4; return g },
    onSubmitted: ({ id }) => { assert.equal(id, 'sdk-job-71'); order.push('record') },
  }), /timeout/)
  assert.deepEqual(order, ['submit', 'record', 'wait', 'cancel'])
  // A cancel that fails is reported with the job id, so the harness stops instead of moving on.
  const stuck = { ...client, submit: async () => ({ id: 'sdk-job-stuck', wait: async () => { throw new Error('timeout') }, cancel: async () => { throw new Error('HTTP 502') } }) }
  const err = await core.runComfy('image_flux', varsForTest(), { run: 'instant', podPhase: async () => 'none', createClient: () => stuck, onSubmitted: () => {} }).catch((e) => e)
  assert.equal(err.uncancelled, 'sdk-job-stuck')
  const file = ledger()
  await assert.rejects(paidCall({ file, backend: 'cloud', call: plans.cloud.calls[0], invoke: async () => { throw err } }), /did not cancel/)
  assert.equal(readLedger(file)[0].outcome, 'uncancelled')
  assert.equal(ledgerTotal(readLedger(file)), 0.5, 'an uncancelled job keeps its full reservation')
})
function varsForTest() { return { prompt: 'test', width: 512, height: 512, count: 1, seed: 71 } }

await test('router proof checks paginated catalog then submits one native request and saves local media', async () => {
  let submits = 0
  let pages = 0
  const fake = {
    ...core,
    listComfyRouterModels: async ({ cursor }) => {
      pages++
      return cursor ? { data: [{ id: 'luma/photon-flash-1' }], has_more: false } : { data: [], has_more: true, next_cursor: 'page-2' }
    },
    runComfyRouter: async (request, hooks) => {
      submits++
      assert.equal(request.model, 'luma/photon-flash-1')
      assert.equal(request.input.aspect_ratio, '1:1')
      hooks.onSubmitted({ id: 'router-71' })
      return [{ url: 'https://media.test/result.png', kind: 'image' }]
    },
  }
  globalThis.fetch = async (url) => { assert.equal(url, 'https://media.test/result.png'); return new Response('mock-image', { headers: { 'Content-Type': 'image/png' } }) }
  const result = await execute('router', { file: ledger(), core: fake, allowPaid: true, print: () => {} })
  assert.equal(submits, 1)
  assert.equal(pages, 2)
  assert.match(result[0][0].url, /^\/media\//)
  assert.equal(fs.readFileSync(core.mediaPath(result[0][0].url), 'utf8'), 'mock-image')
  assert(!('path' in result[0][0]))
  core.dismissLibraryImport(result[0][0].id)
  assert(!core.libraryImports().some((item) => item.id === result[0][0].id))
  globalThis.fetch = denied
})

await test('account sweep covers running and paused ComfyField Pods, preserves other Pods and hides env', async () => {
  const deletes = []
  const manager = podManager({ dir: () => path.join(tmp, 'sweep'), keys: () => ({ key: 'mock-account-key' }), fetch: async (url, opts) => {
    assert.equal(opts.headers.Authorization, 'Bearer mock-account-key')
    if (opts.method === 'DELETE') { deletes.push(url); return json({}, url.endsWith('/failed') ? 503 : 200) }
    return json([{ id: 'running', name: 'comfyfield-live-one', desiredStatus: 'RUNNING', env: { RUNPOD_API_KEY: 'hidden' } }, { id: 'paused', name: 'comfyfield-two', desiredStatus: 'EXITED' }, { id: 'other', name: 'training', desiredStatus: 'RUNNING' }, { id: 'failed', name: 'comfyfield-failed', desiredStatus: 'RUNNING' }])
  } })
  const preview = await manager.sweep({ dryRun: true })
  assert.equal(preview.length, 3)
  assert.equal(deletes.length, 0)
  const result = await manager.sweep()
  assert.equal(deletes.length, 3)
  assert.equal(result.filter((r) => r.terminated).length, 2)
  assert(!JSON.stringify(result).includes('hidden'))
  await assert.rejects(manager.sweep({ prefix: 'training' }), /only targets/)
})

await test('detached guard sweeps on parent death, including paused resources, and retries failures', async () => {
  let clock = 0
  let attempts = 0
  const prefix = 'comfyfield-live-fixture'
  await guardPod({ manager: { sweep: async (opts) => { assert.equal(opts.prefix, prefix); attempts++; if (attempts === 1) throw new Error('network'); return [{ id: 'paused', terminated: true }] } }, alive: () => false, deadline: 1000, prefix, now: () => clock, wait: async () => { clock += 60_000 } })
  assert(attempts >= 3)
})

await test('proof watchdog env carries an absolute deadline which survives a resume', () => {
  const env = podEnv({ token: 'mock', idleMin: 10, terminateAt: 1_900_000_000_000 })
  assert.equal(env.CF_TERMINATE_AT, '1900000000')
  assert.equal(env.IDLE_AFTER, '780')
  assert(!('RUNPOD_API_KEY' in env))
  assert.throws(() => podEnv({ token: 'mock', terminateAt: NaN }), /deadline/)
})

await test('reported overrun stops a backend before its next generation', async () => {
  let submits = 0
  const file = ledger()
  const fake = { ...core, runComfy: async (workflow, vars, hooks) => { submits++; hooks.onSubmitted({ id: 'overrun' }); hooks.onComplete({ actualCost: 2 }); return [] }, saveToLibrary: async () => [] }
  await assert.rejects(execute('cloud', { file, core: fake, allowPaid: true, print: () => {} }), /per-call maximum/)
  assert.equal(submits, 1)
  assert.equal(readLedger(file)[0].actualCost, 2)
})

await test('Pod lifecycle reserves the whole session before creation and cleans up after pause failure', async () => {
  const { podProof } = await import('./live-run.mjs')
  const file = ledger()
  const order = []
  let deadline
  const manager = {
    sweep: async ({ dryRun, prefix }) => { order.push(dryRun ? 'list' : 'cleanup'); return [] },
    quote: async () => ({ rungs: [{ name: 'Mock gpu', inStock: true, usdPerHr: 0.57 }] }),
    start: async ({ proof, gpu }) => { assert.equal(readLedger(file)[0].maximumCost, 1.5); assert.equal(gpu.usdPerHr, 0.57); deadline = proof.terminateAt; order.push('start') },
    tick: async () => {},
    status: () => ({ phase: 'ready', pod: { id: 'pod-71', costPerHr: 0.57 }, safety: { selfTerminateReady: true, proofDeadline: Math.floor(deadline / 1000) } }),
    pause: async () => { order.push('pause'); throw new Error('pause failed') },
    stopMonitor: () => {},
  }
  const fake = { ...core, pod: () => manager, workflowNeeds: () => ({ minVramGb: 16 }), runComfy: async (_, __, opts) => { assert.equal(opts.run, 'session'); order.push('generate'); opts.onSubmitted({ id: 'sdxl-71' }); return [] }, saveToLibrary: async () => [] }
  await assert.rejects(podProof(fake, { file, id: 'fixture', maximum: 1.5, launchCleanup: async () => { order.push('guard-ready'); return () => order.push('guard-disarmed') } }), /pause failed/)
  assert.deepEqual(order, ['list', 'guard-ready', 'start', 'generate', 'generate', 'pause', 'cleanup', 'list', 'guard-disarmed'])
  assert.equal(ledgerTotal(readLedger(file)), 1.5)
})

await test('Pod proof start pins ten-minute idle and the absolute deadline without forwarding account keys', async () => {
  const id = '12345678-1234-1234-1234-123456789abc'
  const deadline = Date.now() + 45 * 60_000
  let body
  const manager = podManager({ dir: () => path.join(tmp, 'proof-start'), keys: () => ({ key: 'mock-account-only', idle: 60 }), fetch: async (url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer mock-account-only')
    if (options.method === 'POST') { body = JSON.parse(options.body); return json({ id: 'pod-proof', costPerHr: 0.57 }) }
    return json([])
  } })
  await manager.start({ proof: { id, terminateAt: deadline }, minVramGb: 16 })
  assert.equal(body.name, `comfyfield-live-${id}`)
  assert.equal(body.env.IDLE_AFTER, '780')
  assert.equal(body.env.CF_TERMINATE_AT, String(Math.floor(deadline / 1000)))
  assert(!JSON.stringify(body).includes('mock-account-only'))
  assert(!('RUNPOD_API_KEY' in body.env))
  assert.equal(manager.status().pod.idleMin, 10)
})
