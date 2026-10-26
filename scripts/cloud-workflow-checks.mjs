// Synthetic SDK clients only. No provider traffic, credentials or generation spend.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { cloudWorkflows, models } from '../src/lib/catalog.js'
import { fill, dropOptional } from '../shared/mapping.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { podNeedsOf, notOnCloud } from '../shared/modelFiles.js'

fs.mkdirSync('outputs', { recursive: true })
process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.resolve('outputs/cloud-workflow-check-'))
for (const key of ['COMFY_API_KEY', 'COMFY_URL', 'COMFY_MODE', 'COMFY_BASE_URL', 'COMFY_RUN', 'RUNPOD_API_KEY', 'COMFYFIELD_POD_SANDBOX']) process.env[key] = ''
globalThis.fetch = async () => { throw new Error('Network is forbidden in Cloud workflow checks') }
const core = await import('../server/core.js')
core.writeKeys({ comfy: { key: 'synthetic-cloud-key' } })
const read = (name) => JSON.parse(fs.readFileSync(`public/workflows/${name}.json`, 'utf8'))
const media = 'data:image/png;base64,iVBORw0KGgo='
const vars = { prompt: 'A fox', background: 'A forest', motion: 'Slow orbit', width: 1024, height: 1024, count: 2, frames: 121, duration: 5, start: 0, seed: 7, pad: 'square', fill: 0, solid: false, image: media, image2: media, image3: media, image4: media, image5: media, video: media }
let submitted
let leased
let released
let clientBase
let uploaded
const client = {
  assets: { fromBytes: () => ({ fixture: true }) },
  workflows: { fromFile: async (file) => ({ file, json: null, setInput(id, field) { uploaded.push([id, field]) } }) },
  run: async (workflow) => {
    submitted = workflow
    return { outputs: [{ type: 'image', name: 'fixture.png', contentType: 'image/png', toBytes: async () => Buffer.from('mock') }] }
  },
}
const options = (run, phase = 'ready', vram = 200) => ({
  run, podPhase: async () => phase, podVram: () => vram, podRoom: () => ({}), podArch: () => 'blackwell',
  createClient: (key, base) => { clientBase = base; return client },
  lease: async (needs) => {
    leased = needs
    return { baseUrl: 'https://synthetic-pod.invalid', token: 'synthetic-pod-token', sandbox: false, release() { released++ } }
  },
})
const reset = () => { submitted = leased = clientBase = null; released = 0; uploaded = [] }
const expected = (name, values = vars) => fill(dropOptional(read(name), values), values)
for (const model of models.filter((m) => m.cloudWorkflow)) {
  assert.equal(model.cloudWorkflow, cloudWorkflows[model.workflow])
  if (model.imageWorkflow) assert.equal(model.cloudImageWorkflow, cloudWorkflows[model.imageWorkflow])
}
for (const [original, cloud] of Object.entries(cloudWorkflows)) {
  const blocked = notOnCloud(podNeedsOf(read(cloud))).length > 0
  reset()
  if (blocked) {
    await assert.rejects(core.runComfy(original, vars, options('instant')), (e) => e.code === 'needs_pod')
    assert.equal(submitted, null)
    assert.equal(leased, null)
    reset()
    await assert.rejects(core.runComfy(original, vars, options(undefined, 'none')), (e) => e.code === 'needs_pod')
    assert.equal(submitted, null, `${original}: automatic routing ignored Cloud blockers`)
  } else {
    // Instant must use Cloud even with a ready Session. Missing optional references must work too.
    const sparse = { ...vars }
    for (const key of schemas.comfyOptional[cloud] || []) delete sparse[key]
    for (const [run, phase, values] of [['instant', 'ready', vars], ['instant', 'ready', sparse], [undefined, 'none', vars], [undefined, 'none', sparse], [null, 'starting', vars], [null, 'ready', vars]]) {
      reset()
      await core.runComfy(original, values, options(run, phase, run === null && phase === 'ready' ? 0 : 200))
      assert.equal(path.basename(submitted.file), `${cloud}.json`)
      const plan = await core.formatRequirements([{ workflow: original, vars: values }], {
        run, phase, vramGb: run === null && phase === 'ready' ? 0 : 200, arch: 'blackwell',
      })
      assert.equal(plan.requirements[0].target, 'cloud')
      assert.equal(plan.requirements[0].selectedWorkflow, cloud, 'Preflight and execution must use the same graph resolver')
      assert.deepEqual(submitted.json, expected(cloud, values))
      assert.equal(leased, null, `${original}: Cloud alternate leased a Pod`)
      assert.equal(clientBase, undefined, `${original}: Cloud alternate used a Pod URL`)
      assert.equal(uploaded.length, core.uploadsOf(dropOptional(read(cloud), values)).length)
    }
  }
  for (const run of ['session', undefined]) {
    reset()
    await core.runComfy(original, vars, options(run))
    assert.equal(path.basename(submitted.file), `${original}.json`)
    assert.deepEqual(submitted.json, expected(original))
    assert.equal(clientBase, 'https://synthetic-pod.invalid')
    assert.equal(released, 1)
    assert.deepEqual(leased.files.map((f) => f.name).sort(), core.workflowNeeds(original).files.map((f) => f.name).sort())
  }
  reset()
  await assert.rejects(core.runComfy(original, vars, options('session', 'none')), (e) => e.code === 'needs_pod')
  assert.equal(submitted, null, `${original}: Session fell back to Cloud`)
}
// Alternate availability must never weaken the existing target guards.
reset()
await assert.rejects(core.runComfy('flux_look', vars, options('session', 'ready', 8)), (e) => e.code === 'pod_too_small')
assert.equal(submitted, null)
reset()
await core.runComfy('flux_look', vars, options(null))
assert.deepEqual(submitted.json, expected('flux_look'), 'automatic ready-Pod routing keeps the original')
reset()
const originalVram = core.workflowNeeds('flux_look').minVramGb
const alternateVram = core.workflowNeeds('flux_look_cloud').minVramGb
assert(alternateVram < originalVram, 'fixture must fit the alternate but not the original')
await core.runComfy('flux_look', vars, options(undefined, 'ready', alternateVram))
assert.deepEqual(submitted.json, expected('flux_look_cloud'))
assert.equal(leased, null, 'a smaller alternate must not change automatic Pod eligibility')
// Cancellation reaches the lease while waiting, and guards both Pod and Cloud submission.
for (const stage of ['before-run', 'lease-wait', 'after-lease', 'pod-upload', 'cloud-upload', 'pod-run', 'cloud-run']) {
  reset()
  const controller = new AbortController()
  const isCloud = stage.startsWith('cloud')
  const opts = { ...options(isCloud ? 'instant' : 'session'), signal: controller.signal }
  let started = 0
  let leaseStarted
  const waiting = new Promise((resolve) => { leaseStarted = resolve })
  const held = { baseUrl: 'https://synthetic-pod.invalid', token: 'synthetic', signal: new AbortController().signal, reason: () => null, release() { released++ } }
  opts.lease = async ({ signal }) => {
    assert.equal(signal, controller.signal)
    leaseStarted()
    if (stage === 'lease-wait') await new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }))
    if (stage === 'after-lease') controller.abort()
    return held
  }
  opts.createClient = () => ({
    ...client,
    workflows: { fromFile: async () => {
      if (stage.endsWith('upload')) controller.abort()
      return { json: null, setInput() {} }
    } },
    run: async (wf, { signal }) => {
      started++
      assert(signal, 'Every submitted run must receive the cancel signal')
      controller.abort()
      assert(signal.aborted, 'Cancellation reaches Cloud and the combined Pod signal')
      signal.throwIfAborted()
    },
  })
  if (stage === 'before-run') controller.abort()
  const running = core.runComfy('flux_look', vars, opts)
  const rejected = assert.rejects(running, (e) => e.name === 'AbortError')
  if (stage === 'lease-wait') { await waiting; controller.abort() }
  await rejected
  assert.equal(started, stage.endsWith('run') && stage !== 'before-run' ? 1 : 0, stage)
  assert.equal(released, isCloud || ['before-run', 'lease-wait'].includes(stage) ? 0 : 1, stage)
}
console.log('Cancelled Pod waits stop; pre-submit guards, Cloud/Pod signals and lease cleanup pass.')
core.writeKeys({ comfy: { key: '' } })
reset()
for (const [original] of Object.entries(cloudWorkflows)) {
  for (const run of ['instant', undefined]) {
    reset()
    await assert.rejects(core.runComfy(original, vars, options(run, 'none')), (e) => e.code === 'needs_pod' && /Comfy API key/.test(e.reason))
    assert.equal(leased, null)
    assert.equal(submitted, null)
  }
}
reset()
await assert.rejects(core.runComfy('flux_look', vars, options(undefined, 'none')), (e) => e.message === 'Comfy Cloud needs a Comfy API key on a paid plan, so this run needs a Pod. Start one in ComfyField from the Pod chip in the top bar.')
for (const [original, cloud] of Object.entries(cloudWorkflows)) assert.deepEqual(schemas.comfy[cloud], schemas.comfy[original])
console.log(`${Object.keys(cloudWorkflows).length} alternate pairs: Instant and unset runs without a fitting ready Pod select Cloud graphs; Session and fitting ready Pods preserve original graphs/files; optional uploads and target guards pass. Synthetic clients only; no live generations.`)
