import assert from 'node:assert/strict'
import { recipes, initialValues, recipeOptions } from '../src/lib/recipes.js'
import { allFormats, formats, formatProblems } from '../src/lib/formats/index.js'
import { compileFormat, runFormat as runWithPlanning, preflight } from '../src/lib/formats/runner.js'
import { validateFormat } from '../src/lib/formats/validate.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { falInput, comfyVars } from '../shared/mapping.js'

import { offlineRequirements } from './fixtures/format-planning.mjs'
const runFormat = (format, values, options) => runWithPlanning(format, values, { requirements: offlineRequirements, ...options })

globalThis.fetch = () => { throw new Error('Network is forbidden in format checks') }
const photo = { url: 'https://example.test/photo.png', ratio: '4:5', name: 'Photo' }
const valuesFor = (f) => ({ ...initialValues(f), ...Object.fromEntries(f.inputs.filter((i) => i.type === 'image').map((i) => [i.id, photo])) })
let checked = 0

for (const recipe of recipes) {
  const defaults = valuesFor(recipe)
  const variants = [defaults, ...recipe.inputs.flatMap((input) => input.type === 'choice'
    ? input.options.map((o) => ({ ...defaults, [input.id]: o.id })) : input.type === 'text' ? [{ ...defaults, [input.id]: 'Keep the original face' }] : [])]
  for (const values of variants) {
    const calls = []
    const library = []
    const result = await runFormat(recipe, values, { run: async (model, opts, metadata) => {
      const files = [{ url: `https://example.test/${recipe.id}.png`, kind: recipe.kind }]
      calls.push({ model, opts })
      library.push(...files.map((f) => ({ ...f, ...metadata })))
      return files
    } })
    assert.equal(calls.length, 1, `${recipe.id} should run once, including multi-image tools`)
    assert.equal(calls[0].model.model, recipe.model)
    const props = schemas.fal[recipe.model].properties
    assert.deepEqual(falInput(props, calls[0].opts), falInput(props, recipeOptions(recipe, values)), `${recipe.id} changed its provider payload`)
    assert.equal(calls[0].opts.shape, photo.ratio)
    assert.equal(library[0].formatId, recipe.id)
    assert.equal(library[0].stepId, 'generate')
    assert(library[0].formatRunId)
    assert.equal(library[0].batch, undefined, 'Format output must stay visible in Create singles')
    assert.equal(result.results().length, 1)
    await result.engine.runNew(result.flow)
    assert.equal(calls.length, 1, 'Run must preserve completed output')
    checked++
  }
}

const imageRecipe = recipes.find((f) => f.id === 'nine-shots')
const videoRecipe = recipes.find((f) => f.id === 'melt')
const chain = {
  ...imageRecipe, id: 'test-chain', shape: 'chain',
  inputs: videoRecipe.inputs,
  steps: [
    { ...imageRecipe.steps[0], id: 'draft', takes: 2 },
    { id: 'review', type: 'approve' },
    { ...videoRecipe.steps[0], id: 'animate' },
  ],
  outputs: [{ step: 'animate', kind: 'video' }],
}
const calls = []
const session = await runFormat(chain, valuesFor(chain), { run: async (model, opts) => {
  const url = `https://example.test/${calls.length}.png`
  calls.push({ model, opts, url })
  return [{ url, kind: model.kind }]
} })
assert.equal(calls.length, 2, 'Approval must block the video step')
assert.equal(session.engine.gate('review').status, 'reviewing')
assert.equal(session.results().length, 0)
const picked = session.engine.reviewItems(session.flow, 'review')[1]
session.engine.togglePick(session.flow, 'review', picked.id)
await session.send('review')
assert.equal(calls.length, 3, 'Send should only run the chosen downstream image')
assert.deepEqual(calls[2].opts.images, [picked.url])
assert.equal(session.results().length, 1)
await session.send('review')
await session.engine.runNew(session.flow)
assert.equal(calls.length, 3, 'Repeated Send and Run must preserve output')
await session.engine.rerun(session.flow, 'draft')
assert.equal(calls.length, 5, 'Rerun must only execute that node')
assert.equal(session.engine.gate('review').status, 'reviewing')
await session.send('review')
assert.equal(calls.length, 5, 'Send must preserve downstream output')

const parallel = { ...imageRecipe, id: 'test-parallel', shape: 'pipeline', steps: ['a', 'b', 'c', 'd'].map((id) => ({ ...imageRecipe.steps[0], id, from: [] })), outputs: [{ step: 'd', kind: 'image' }] }
let active = 0
let peak = 0
await runFormat(parallel, valuesFor(parallel), { concurrency: 2, run: async () => {
  active++
  peak = Math.max(peak, active)
  await new Promise((r) => setTimeout(r, 5))
  active--
  return [{ url: 'https://example.test/result.png' }]
} })
assert.equal(peak, 2, 'Runner must use engine concurrency')

assert.throws(() => compileFormat(imageRecipe, {}), /Still needed/)
assert.throws(() => compileFormat(imageRecipe, { image: {} }), /Add a file/)
assert.throws(() => compileFormat(recipes.find((r) => r.id === 'new-angle'), { image: photo, angle: 'invalid' }), /Invalid choice/)
assert.throws(() => compileFormat({ ...imageRecipe, steps: [{ ...imageRecipe.steps[0], from: ['generate'] }] }, valuesFor(imageRecipe)), /loop/)
assert(validateFormat({ ...imageRecipe, name: '' }).some((r) => r.includes('Missing name')))
assert(validateFormat({ ...imageRecipe, steps: [{ ...imageRecipe.steps[0], bindings: { nonsense: 'image' } }] }).some((r) => r.includes('Unknown model field')))
assert(validateFormat({ ...imageRecipe, steps: [{ ...imageRecipe.steps[0], params: { output_format: 'wrong' } }] }).some((r) => r.includes('must be one of')))
assert(validateFormat({ ...imageRecipe, steps: [{ ...imageRecipe.steps[0], prompt: '{missing}' }] }).some((r) => r.includes('unknown prompt slot')))
assert(validateFormat({ ...imageRecipe, inputs: [...imageRecipe.inputs, { id: 'audio', type: 'audio', label: 'Audio' }] }).some((r) => r.includes('does not map')))
assert(validateFormat({ ...imageRecipe, steps: [{ id: 'generate', model: 'unknown' }] }).some((r) => r.includes('Unknown model')))
assert(validateFormat({ ...imageRecipe, outputs: [{ step: 'unknown', kind: 'image' }] }).some((r) => r.includes('Invalid output')))

const comfy = { ...imageRecipe, inputs: [{ id: 'subject', type: 'text', label: 'Subject' }], prompt: '{subject}', steps: [{ id: 'generate', provider: 'comfy', workflow: 'image_flux', kind: 'image', prompt: '{subject}', params: {} }] }
assert.deepEqual(validateFormat(comfy), [])
let comfyCall
await runFormat(comfy, { subject: 'A meadow' }, { run: async (model, opts) => { comfyCall = { model, opts }; return [{ url: 'test.png' }] } })
assert.equal(comfyCall.model.workflow, 'image_flux')
assert.equal(comfyCall.opts.aspect, '1:1')
assert.equal(comfyCall.opts.prompt, 'A meadow')
assert.equal(comfyVars('image', { ...comfyCall.opts, params: { seed: 42 }, fields: { prompt: 'Bound prompt' } }).seed, 42)
assert.equal(comfyVars('image', { ...comfyCall.opts, fields: { prompt: 'Bound prompt' } }).prompt, 'Bound prompt')

const failedSession = await runFormat(imageRecipe, valuesFor(imageRecipe), { run: async () => { throw new Error('Mock provider failure') } })
assert.equal(failedSession.error.message, 'Mock provider failure')
assert.equal(failedSession.engine.state.generate.items[0].status, 'failed')
const writerFormat = { ...imageRecipe, writer: 'Describe the scene' }
assert.match((await runFormat(writerFormat, valuesFor(imageRecipe), { run: async () => { throw new Error('Must not run') } })).error.message, /writing is not connected/)
let writerPrompt
const writerSession = await runFormat(writerFormat, valuesFor(writerFormat), {
  writePrompt: async ({ instructions, inputs }) => { assert.equal(instructions, writerFormat.writer); assert.equal(inputs.image.url, photo.url); return 'Written prompt' },
  run: async (_, opts) => { writerPrompt = opts.prompt; return [{ url: 'written.png' }] },
})
assert.equal(writerPrompt, undefined, 'Writer holds rendering for review')
writerSession.engine.editWriter(writerSession.flow, 'writer', 'Edited written prompt')
await writerSession.sendWriter('writer')
assert.equal(writerPrompt, 'Edited written prompt')
const writerOnly = { ...writerFormat, prompt: '', inputs: [...writerFormat.inputs, { id: 'brief', type: 'text', label: 'Brief' }], steps: [{ ...writerFormat.steps[0], prompt: '' }] }
assert.deepEqual(validateFormat(writerOnly), [], 'A writer can supply the required prompt from a brief slot')
const briefSession = await runFormat(writerOnly, { ...valuesFor(writerOnly), brief: 'Change the mood' }, {
  writePrompt: async ({ inputs }) => inputs.brief,
  run: async (_, opts) => { assert.equal(opts.prompt, 'Change the mood'); return [{ url: 'written.png' }] },
})
await briefSession.sendWriter('writer')

// Fail one of two takes: retry pays for only that take, then fills downstream gaps.
const resilient = { ...chain, steps: [chain.steps[0], { ...chain.steps[2], from: ['draft'] }] }
const retryCalls = []
let failTake = true
let retrySession
const snapshots = []
const retainedValues = structuredClone(valuesFor(resilient))
retrySession = await runFormat(resilient, retainedValues, {
  onSession: (s) => { retrySession = s },
  onChange: (_, s) => { if (s) snapshots.push(s.busy) },
  run: async (model, opts, meta) => {
    assert.equal(retrySession.busy, true)
    assert(retrySession.cost, 'Cost is present before the first adapter request')
    retryCalls.push(meta)
    if (meta.stepId === 'draft' && retryCalls.length === 2 && failTake) throw Object.assign(new Error('One take failed'), { code: 'mock_failure' })
    return [{ url: `https://example.test/retry-${retryCalls.length}.png`, kind: model.kind }]
  },
})
assert.equal(retryCalls.length, 2, 'Do not spend downstream while an upstream take has failed')
assert.equal(retrySession.failures.length, 1)
assert.equal(retrySession.reason.code, 'mock_failure')
assert.equal(retrySession.busy, false)
assert(snapshots.includes(true))
const kept = retrySession.engine.state.draft.items.find((i) => i.status === 'done')
retainedValues.image.url = 'https://example.test/changed.png'
assert.equal(retrySession.flow.values.image.url, photo.url, 'Capture inputs instead of following form edits')
failTake = false
await retrySession.retry('draft')
assert.equal(retryCalls.filter((m) => m.stepId === 'draft').length, 3)
assert.equal(retryCalls.filter((m) => m.stepId === 'animate').length, 2)
assert.equal(retrySession.engine.state.draft.items.find((i) => i.id === kept.id), kept)
assert.equal(retrySession.error, null)
assert.equal(new Set(retryCalls.map((m) => m.formatRunId)).size, 1)
await retrySession.retryFailed()
assert.equal(retryCalls.length, 5, 'Retry with nothing failed is free')

// Retry one failed branch must leave other failed and untouched branches alone.
const branchCalls = []
let branchFail = true
const branches = await runFormat(parallel, valuesFor(parallel), { run: async (_, opts, meta) => {
  branchCalls.push(meta.stepId)
  if (branchFail && ['a', 'b'].includes(meta.stepId)) throw new Error('branch failed')
  return [{ url: 'https://example.test/branch.png' }]
} })
branchFail = false
await branches.retry('a')
assert.deepEqual(branchCalls.slice(4), ['a'])
assert.equal(branches.failures[0].stepId, 'b')
await branches.retryFailed()
assert.deepEqual(branchCalls.slice(4), ['a', 'b'])

// Approval after a failure remains usable; neither Send nor retry repeats the paid draft.
let animationFails = true
const gateCalls = []
const gatedFailure = await runFormat(chain, valuesFor(chain), { run: async (_, opts, meta) => {
  gateCalls.push(meta.stepId)
  if (meta.stepId === 'animate' && animationFails) throw new Error('animate failed')
  return [{ url: `https://example.test/gate-${gateCalls.length}.png` }]
} })
await gatedFailure.send('review')
assert.equal(gatedFailure.failures.length, 2)
assert.equal(gatedFailure.engine.gate('review').status, 'sent')
gatedFailure.engine.clearGate(gatedFailure.flow, 'review')
animationFails = false
await gatedFailure.send('review')
assert.equal(gatedFailure.error, null)
assert.equal(gateCalls.filter((s) => s === 'draft').length, 2)
assert.equal(gateCalls.filter((s) => s === 'animate').length, 4)
await gatedFailure.retryFailed()
assert.equal(gateCalls.length, 6)

// A failed writer retries without rendering or opening the writer review gate.
let writes = 0
let renders = 0
const writerRetry = await runFormat(writerFormat, valuesFor(writerFormat), {
  writePrompt: async () => { if (++writes === 1) throw new Error('writer failed'); return 'Recovered prompt' },
  run: async () => { renders++; return [{ url: 'https://example.test/written.png' }] },
})
await writerRetry.retryFailed()
assert.equal(writes, 2)
assert.equal(renders, 0)
await writerRetry.sendWriter('writer')
assert.equal(writes, 2)
assert.equal(renders, 1)

// A completed provider step needs no key on retry; its paid outputs are sufficient.
const crossProvider = { ...chain, steps: [chain.steps[0], { id: 'animate', model: 'comfy-ltx25', kind: 'video', prompt: '{note}' }] }
let cloudFail = true
const crossCalls = []
const crossSession = await runFormat(crossProvider, valuesFor(crossProvider), { run: async (_, opts, meta) => {
  crossCalls.push(meta.stepId)
  if (meta.stepId === 'animate' && cloudFail) throw new Error('render failed')
  return [{ url: 'https://example.test/cross.png' }]
} })
cloudFail = false
await crossSession.retryFailed({ requirements: (w) => ({ ...offlineRequirements(w), connections: { comfyRouter: { connected: true } } }) })
assert.equal(crossSession.error, null)
assert.equal(crossCalls.filter((s) => s === 'draft').length, 2)
assert.equal(crossCalls.filter((s) => s === 'animate').length, 4)

// An in-flight send rejects overlapping retry/start operations without a second request.
let release
let markStarted
const started = new Promise((r) => { markStarted = r })
const held = await runFormat(chain, valuesFor(chain), { run: async (_, opts, meta) => {
  if (meta.stepId === 'animate') { markStarted(); await new Promise((r) => { release = r }) }
  return [{ url: 'https://example.test/held.png' }]
} })
held.engine.togglePick(held.flow, 'review', held.engine.reviewItems(held.flow, 'review')[0].id)
const sending = held.send('review')
await started
assert.equal(held.busy, true)
assert.equal((await held.retryFailed()).reason.code, 'busy')
assert.equal((await held.start()).reason.code, 'busy')
release()
await sending
assert.equal(held.busy, false)

const cloudMissing = { ...comfy, steps: [comfy.steps[0], { ...comfy.steps[0], id: 'later', workflow: 'qwen_image21_t2i' }], outputs: [{ step: 'later', kind: 'image' }] }
const tooBig = { ...comfy, steps: [comfy.steps[0], { id: 'later', model: 'comfy-ltx25', kind: 'video', prompt: '{subject}', from: ['generate'] }], outputs: [{ step: 'later', kind: 'video' }] }
// Use the selected catalog id rather than a format-specific cost or requirement total.
const ltx = (await import('../src/lib/catalog.js')).models.find((m) => m.workflow === 'ltx25_t2v')
tooBig.steps[1].model = ltx.id
const planningCases = [
  [cloudMissing, { subject: 'A meadow' }, { runType: 'instant' }, 'needs_pod'],
  [tooBig, { subject: 'A meadow' }, { runType: 'session', pod: { phase: 'ready', vramGb: 24 } }, 'pod_too_small'],
  [chain, valuesFor(chain), { requirements: (w) => ({ ...offlineRequirements(w), connections: {} }) }, 'missing_key'],
]
for (const [format, values, options, code] of planningCases) {
  let paid = 0
  const blocked = await runFormat(format, values, { ...options, run: async () => { paid++; return [] } })
  assert.equal(paid, 0, 'Every requirement must be checked before any paid step')
  assert.equal(blocked.reason.code, code, blocked.error?.message)
  assert(blocked.preflight.steps.some((s) => s.stepId === (code === 'missing_key' ? 'animate' : 'later')))
  assert.equal(blocked.busy, false)
  await blocked.retryFailed({ runType: 'session', pod: { phase: 'ready', vramGb: 128 }, requirements: offlineRequirements })
  // The chain still waits at its approval gate.
  assert(paid > 0)
}
const details = await preflight(cloudMissing, { subject: 'A meadow' }, { requirements: offlineRequirements, runType: 'instant' })
assert(details.steps[1].notOnCloud.length > 0)
assert(details.steps[1].minVramGb >= 24)
assert.equal(details.cost.total, null, 'Unknown GPU prices stay unknown')
const alternate = { ...cloudMissing, steps: [comfy.steps[0], { ...cloudMissing.steps[1], cloudWorkflow: 'image_flux' }] }
const alternateCalls = []
const cloudAlternate = await runFormat(alternate, { subject: 'A meadow' }, { runType: 'instant', run: async (model) => { alternateCalls.push(model.workflow); return [{ url: 'https://example.test/alternate.png' }] } })
assert.equal(cloudAlternate.error, null)
assert.deepEqual(alternateCalls, ['image_flux', 'image_flux'])
assert(cloudAlternate.preflight.steps[1].notOnCloud.length)
assert.equal(cloudAlternate.preflight.steps[1].cloud.notOnCloud.length, 0)

const priced = { ...chain, steps: [{ ...imageRecipe.steps[0], id: 'first', takes: 2 }, { id: 'review', type: 'approve' }, { ...videoRecipe.steps[0], id: 'second', settings: { duration: 4 } }], outputs: [{ step: 'second', kind: 'video' }] }
const prices = { [imageRecipe.model]: { price: { amount: 0.01, unit: 'image' } }, [videoRecipe.model]: { price: { amount: 0.02, unit: 'second' } } }
const quote = await preflight(priced, valuesFor(priced), { requirements: offlineRequirements, prices })
const { stepModel } = await import('../src/lib/formats/options.js')
const { estimate } = await import('../shared/mapping.js')
for (const [index, stepIndex] of [[0, 0], [2, 2]]) {
  const model = stepModel(priced, priced.steps[stepIndex], valuesFor(priced))
  assert.equal(quote.cost.steps[index].usd, estimate(model, prices[model.model], { ...quote.steps[index].options, takes: 2 }).usd)
}
assert.equal(quote.cost.total.usd, quote.cost.steps.reduce((n, s) => n + s.usd, 0))
const invalidSession = await runFormat(imageRecipe, {}, { run: async () => assert.fail('Invalid input cannot spend') })
assert.equal(invalidSession.reason.code, 'invalid_format')
assert.equal(invalidSession.results().length, 0)
assert.equal(invalidSession.busy, false)
console.log('Runner resilience checks ok: exact retry counts, retained outputs and run id, approval and writer recovery, busy exclusion, input snapshots, whole-pipeline preflight, Cloud alternates and derived costs.')
assert.equal(formats.length, 450)
assert.equal(allFormats.length, 479, 'Do not delete planned formats')
assert.equal(allFormats.filter((f) => f.category === 'camera').length > 0, true, 'Keep Create prompt presets')
assert(allFormats.filter((f) => !formats.includes(f)).every((f) => formatProblems.get(f.id).length))
console.log(`Format runner checks ok: ${checked} recipe cases, approval and batching, concurrency, schema rejection, Comfy placeholders, writer handoff and provider failures. No network calls.`)
