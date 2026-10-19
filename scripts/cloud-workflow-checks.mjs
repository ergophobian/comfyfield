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
const vars = { prompt: 'A fox', background: 'A forest', motion: 'Slow orbit', width: 1024, height: 1024, count: 2, frames: 121, duration: 5, start: 0, seed: 7, pad: 'square', image: media, image2: media, image3: media, image4: media, image5: media, video: media }
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
for (const [original, cloud] of Object.entries(cloudWorkflows)) assert.deepEqual(schemas.comfy[cloud], schemas.comfy[original])
console.log(`${Object.keys(cloudWorkflows).length} alternate pairs: Instant and unset runs without a fitting ready Pod select Cloud graphs; Session and fitting ready Pods preserve original graphs/files; optional uploads and target guards pass. Synthetic clients only; no live generations.`)
