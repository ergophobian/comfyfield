import assert from 'node:assert/strict'
import { recipes, initialValues, recipeOptions } from '../src/lib/recipes.js'
import { allFormats, formats, formatProblems } from '../src/lib/formats/index.js'
import { compileFormat, runFormat as runWithPlanning, preflight } from '../src/lib/formats/runner.js'
import { validateFormat } from '../src/lib/formats/validate.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { falInput, comfyVars } from '../shared/mapping.js'

import { offlineRequirements } from './fixtures/format-planning.mjs'
const runFormat = (format, values, options) => runWithPlanning(format, values, { requirements: offlineRequirements, ...options })
const failedRun = async (...args) => {
  let session
  await assert.rejects(runFormat(...args), (error) => {
    assert(error instanceof Error)
    assert(error.session)
    assert.equal(error.session.error.message, error.message)
    session = error.session
    return true
  })
  return session
}

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

const failedSession = await failedRun(imageRecipe, valuesFor(imageRecipe), { run: async () => { throw new Error('Mock provider failure') } })
assert.equal(failedSession.error.message, 'Mock provider failure')
assert.equal(failedSession.engine.state.generate.items[0].status, 'failed')
const writerFormat = { ...imageRecipe, writer: 'Describe the scene' }
assert.match((await failedRun(writerFormat, valuesFor(imageRecipe), { run: async () => { throw new Error('Must not run') } })).error.message, /writing is not connected/)
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
retrySession = await failedRun(resilient, retainedValues, {
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
assert.equal(retrySession.formatRunId, retrySession.id)
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
const branches = await failedRun(parallel, valuesFor(parallel), { run: async (_, opts, meta) => {
  branchCalls.push(meta.stepId)
  if (branchFail && ['a', 'b'].includes(meta.stepId)) throw new Error('branch failed')
  return [{ url: 'https://example.test/branch.png' }]
} })
branchFail = false
await assert.rejects(branches.retry('a'), (error) => error.session === branches)
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
await assert.rejects(gatedFailure.send('review'), (error) => error.session === gatedFailure)
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
const writerRetry = await failedRun(writerFormat, valuesFor(writerFormat), {
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
const crossSession = await failedRun(crossProvider, valuesFor(crossProvider), { run: async (_, opts, meta) => {
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

const cloudMissing = { ...comfy, steps: [comfy.steps[0], { ...comfy.steps[0], id: 'later', workflow: 'h3_freevideo_t2v' }], outputs: [{ step: 'later', kind: 'image' }] }
const tooBig = { ...comfy, steps: [comfy.steps[0], { id: 'later', model: 'comfy-ltx25', kind: 'video', prompt: '{subject}', from: ['generate'] }], outputs: [{ step: 'later', kind: 'video' }] }
// Use the selected catalog id rather than a format-specific cost or requirement total.
const ltx = (await import('../src/lib/catalog.js')).models.find((m) => m.workflow === 'ltx25_t2v')
tooBig.steps[1].model = ltx.id
const planningCases = [
  [cloudMissing, { subject: 'A meadow' }, { runType: 'instant' }, 'needs_pod'],
  [chain, valuesFor(chain), { requirements: (w) => ({ ...offlineRequirements(w), connections: {} }) }, 'missing_key'],
]
for (const [format, values, options, code] of planningCases) {
  let paid = 0
  const blocked = await failedRun(format, values, { ...options, run: async () => { paid++; return [] } })
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
assert(details.steps[1].minVramGb > 0)
assert.equal(details.cost.total, null, 'Unknown GPU prices stay unknown')
const alternate = { ...comfy, steps: [{ ...comfy.steps[0], workflow: 'flux3_klein_t2i' }] }
const alternateCalls = []
const cloudAlternate = await runFormat(alternate, { subject: 'A meadow' }, { runType: 'instant', run: async (model) => { alternateCalls.push(model.workflow); return [{ url: 'https://example.test/alternate.png' }] } })
assert.equal(cloudAlternate.error, null)
assert.deepEqual(alternateCalls, ['flux3_klein_t2i'], 'Pass the original workflow to the server resolver')
assert(cloudAlternate.preflight.steps[0].notOnCloud.length)
assert.equal(cloudAlternate.preflight.steps[0].cloud.notOnCloud.length, 0)
assert.equal(cloudAlternate.preflight.steps[0].selectedWorkflow, 'flux3_klein_t2i_cloud')

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
// The real Router batch must reconcile a lost response with the original body and key.
const { createRouterBatch, runRouterBatch } = await import('../src/lib/routerBatch.js')
const routerFormat = { ...comfy, steps: [{ id: 'generate', model: 'comfy-router-flux', kind: 'image', prompt: '{subject}' }] }
const submitted = []
const accepted = new Map()
let lostReply = true
const adapterOptions = []
const routerSession = await failedRun(routerFormat, { subject: 'A meadow' }, { run: async (model, options) => {
  adapterOptions.push(options)
  options.routerBatch ||= createRouterBatch(model, { ...options, count: 3 })
  return runRouterBatch(options.routerBatch, async (payload) => {
    submitted.push(structuredClone(payload))
    if (!accepted.has(payload.idempotencyKey)) accepted.set(payload.idempotencyKey, [{ url: `https://example.test/router-${accepted.size}.png` }])
    if (accepted.size === 2 && lostReply) { lostReply = false; throw new Error('Reply lost after acceptance') }
    return accepted.get(payload.idempotencyKey)
  })
} })
await routerSession.retryFailed()
assert.equal(adapterOptions[0], adapterOptions[1], 'Adapter options survive a retry by identity')
assert.equal(submitted.length, 4)
assert.deepEqual(submitted[1], submitted[2], 'Ambiguous Router failure retries the original idempotency key and body')
assert.equal(accepted.size, 3)
assert.equal(routerSession.results().length, 3)
await routerSession.engine.rerun(routerSession.flow, 'generate')
assert.equal(accepted.size, 6, 'A deliberate Rerun gets fresh Router keys')

// Writer retries retain their key too, including the hook provider input contract.
const writerInputs = []
const keyedWriter = await failedRun(writerFormat, valuesFor(writerFormat), {
  writePrompt: async (input) => {
    writerInputs.push(input)
    if (writerInputs.length === 1) throw new Error('Writer response lost')
    return 'Recovered writer'
  },
  run: async () => [{ url: 'https://example.test/writer.png' }],
})
await keyedWriter.retryFailed()
assert.equal(writerInputs[0], writerInputs[1])
assert.match(writerInputs[1].idempotencyKey, /^[a-f0-9-]{36}$/)

for (const unit of ['gpu-second', 'GPU seconds', 'gpu_second']) {
  const meta = { price: { amount: 0.02, unit } }
  assert.equal(estimate({}, meta, { duration: 5 }), null, 'Output duration is not GPU execution time')
  assert.deepEqual(estimate({}, meta, { executionSeconds: 12 }), { usd: 0.24, approx: false })
}
const gpuQuote = await preflight(routerFormat, { subject: 'A meadow' }, { requirements: offlineRequirements })
assert.equal(gpuQuote.cost.steps[0].usd, null)
assert.equal(gpuQuote.cost.total, null)

const invalidSession = await failedRun(imageRecipe, {}, { run: async () => assert.fail('Invalid input cannot spend') })
assert.equal(invalidSession.reason.code, 'invalid_format')
assert.equal(invalidSession.results().length, 0)
assert.equal(invalidSession.busy, false)
console.log('Runner resilience checks ok: exact retry counts, retained outputs and run id, approval and writer recovery, busy exclusion, input snapshots, whole-pipeline preflight, Cloud alternates and derived costs.')
assert.equal(formats.length, allFormats.filter((format) => !validateFormat(format).length).length)
assert.equal(new Set(allFormats.map((format) => format.id)).size, allFormats.length)

// Edits and upscales carry the picture they started from, for the before and after slider.
const sourceOf = async (f, extra) => {
  let meta
  await runFormat(f, { ...valuesFor(f), ...extra }, { run: async (_, __, m) => { meta = m; return [{ url: 'out.png' }] } })
  return meta.source
}
assert.equal(await sourceOf(allFormats.find((f) => f.id === 'image-upscale')), photo.url)
assert.equal(await sourceOf(allFormats.find((f) => f.id === 'erase'), { target: 'The sign' }), photo.url)
assert.equal(await sourceOf(imageRecipe), undefined, 'Only edits and upscales carry a source')
// Dub runs on one bundled graph. The language choice gives Chatterbox its own label and names the
// language in Gemma 4's instructions; the clip's trim sets the part that is dubbed.
const dub = formats.find((f) => f.id === 'dub')
assert(dub, 'dub runs on bundled graphs')
const dubCalls = []
const clipValue = { url: '/media/talk.mp4', name: 'talk.mp4', ratio: '9:16', duration: 40, trim: { start: 2, end: 32 } }
await runFormat(dub, { ...valuesFor(dub), video: clipValue, language: 'zh' }, { run: async (model, opts) => { dubCalls.push({ model, opts }); return [{ url: 'dub.mp4', kind: 'video' }] } })
assert.equal(dubCalls[0].model.workflow, 'dub')
assert.equal(dubCalls[0].opts.params.language, 'Chinese (zh)')
assert.match(dubCalls[0].opts.prompt, /conversational Mandarin/)
const dubVars = comfyVars('video', dubCalls[0].opts)
assert.deepEqual([dubVars.start, dubVars.duration, dubVars.video], [2, 30, '/media/talk.mp4'])
assert.equal(dub.inputs.find((i) => i.id === 'language').options[0].id, 'es', 'Spanish stays the first dub language')
assert.equal(formats.length, 452)
assert.equal(allFormats.length, 480, 'Do not delete planned formats')
assert.equal(allFormats.filter((f) => f.category === 'camera').length > 0, true, 'Keep Create prompt presets')
assert(allFormats.filter((f) => !formats.includes(f)).every((f) => formatProblems.get(f.id).length))

// An optional start image picks the image graph; without one the format runs its text graph.
const anime = formats.find((f) => f.id === 'anime-video')
const animeGraph = (values) => compileFormat(anime, { ...valuesFor(anime), scene: 'Two friends race downhill', ...values }).nodes.find((n) => n.type === 'model').data.model
assert.equal(animeGraph({ image: null }).workflow, 'h3_open_t2v')
assert.equal(animeGraph({ image: { url: '/media/a.png', name: 'a.png', ratio: '16:9' } }).imageWorkflow, 'h3_open_i2v')
assert.deepEqual(comfyVars('video', { prompt: 'p', aspect: '16:9' }).image, undefined, 'a text start sends no image')

// A motion drawing is ready only once its arrows are drawn, since the graph reads them as its mask.
const motion = formats.find((f) => f.inputs.some((i) => i.type === 'draw' && i.mode === 'motion'))
const frame = { url: '/media/frame.png', name: 'frame.png', ratio: '16:9' }
assert.throws(() => compileFormat(motion, { ...valuesFor(motion), image: frame }), /Still needed/)
assert.doesNotThrow(() => compileFormat(motion, { ...valuesFor(motion), image: { ...frame, strokes: 'data:image/png;base64,AA==' } }))
console.log(`Format runner checks ok: ${checked} recipe cases, approval and batching, concurrency, schema rejection, Comfy placeholders, writer handoff and provider failures. No network calls.`)

// A writer edit changes the request even when the downstream text unit keeps its unit id.
const editedCalls = []
const editedSession = await runFormat({ ...routerFormat, writer: 'Write a prompt' }, { subject: 'A meadow' }, {
  writePrompt: async () => 'Original prompt',
  run: async (model, options) => {
    options.routerBatch ||= createRouterBatch(model, options)
    editedCalls.push(structuredClone(options))
    if (editedCalls.length === 1) throw new Error('Lost render response')
    return [{ url: 'https://example.test/edited.png' }]
  },
})
await assert.rejects(editedSession.sendWriter('writer'))
editedSession.engine.editWriter(editedSession.flow, 'writer', 'Edited prompt')
await editedSession.sendWriter('writer')
assert.equal(editedCalls[1].prompt, 'Edited prompt')
assert.notEqual(editedCalls[0].routerBatch.calls[0].idempotencyKey, editedCalls[1].routerBatch.calls[0].idempotencyKey)

// Terminal failures get a new key; uncertain requests reconcile with the same key.
for (const [failure, keep] of [
  [new TypeError('Network lost'), true],
  [Object.assign(new Error('Timeout'), { status: 408 }), true],
  [Object.assign(new Error('Rate limit'), { status: 429 }), true],
  [Object.assign(new Error('Server error'), { status: 503 }), true],
  [Object.assign(new Error('Invalid response'), { status: 502, code: 'invalid_response', retryable: true }), true],
  [Object.assign(new Error('Credits'), { status: 402, code: 'insufficient_credits' }), false],
  [Object.assign(new Error('Validation'), { status: 422 }), false],
  [Object.assign(new Error('Job failed'), { status: 502, code: 'job_failed', retryable: false }), false],
]) {
  const model = (await import('../src/lib/catalog.js')).models.find((m) => m.id === 'comfy-router-flux')
  const batch = createRouterBatch(model, { prompt: 'Retry', aspect: '1:1', count: 2 })
  const keys = []
  let failed = false
  const submit = async (payload) => {
    keys.push(payload.idempotencyKey)
    if (keys.length === 2 && !failed) { failed = true; throw failure }
    return [{ url: `https://example.test/${keys.length}.png` }]
  }
  await assert.rejects(runRouterBatch(batch, submit))
  await runRouterBatch(batch, submit)
  assert.equal(keys.length, 3, 'A completed batch call must not repeat')
  assert.equal(keys[1] === keys[2], keep, failure.message)
}
for (const empty of [false, true]) {
  const writerKeys = []
  const failedWriter = await failedRun(writerFormat, valuesFor(writerFormat), {
    writePrompt: async (input) => {
      writerKeys.push(input.idempotencyKey)
      if (writerKeys.length > 1) return 'Recovered prompt'
      if (empty) return ''
      throw Object.assign(new Error('Filtered prompt'), { status: 502, code: 'prompt_filtered', retryable: false })
    },
    run: async () => assert.fail('Writer review must remain closed'),
  })
  await failedWriter.retryFailed()
  assert.notEqual(writerKeys[0], writerKeys[1], 'A terminal writer failure gets a new key')
}

for (const phase of ['none', 'stopped', 'starting']) {
  const plan = await preflight(cloudMissing, { subject: 'A meadow' }, { requirements: offlineRequirements, runType: 'session', pod: { phase, auto: true } })
  assert.equal(plan.ok, true, `Session ${phase} must reach the runtime Pod flow`)
  if (phase !== 'starting') assert(plan.warnings.some((w) => w.code === 'needs_pod'))
}
const replacePlan = await preflight(tooBig, { subject: 'A meadow' }, { requirements: offlineRequirements, runType: 'session', pod: { phase: 'ready', vramGb: 24, auto: true } })
assert.equal(replacePlan.ok, true)
assert(replacePlan.warnings.some((w) => w.code === 'pod_too_small'))
// With auto-start off the run still reaches the confirm sheet for a Pod that is too small (docs/adr/0002).
const manualPlan = await preflight(tooBig, { subject: 'A meadow' }, { requirements: offlineRequirements, runType: 'session', pod: { phase: 'ready', vramGb: 24, auto: false } })
assert.equal(manualPlan.ok, true)
assert(manualPlan.warnings.some((w) => w.code === 'pod_too_small'))

// Library retry waits for the current take instead of silently returning busy.
let busySession
let finishTake
let takeStarted
const taking = new Promise((resolve) => { takeStarted = resolve })
const busyCalls = []
const busyRun = runFormat({ ...routerFormat, steps: [{ ...routerFormat.steps[0], takes: 2 }] }, { subject: 'A meadow' }, {
  concurrency: 1, onSession: (current) => { busySession = current },
  run: async (_, options, meta) => {
    busyCalls.push(meta.itemId)
    if (busyCalls.length === 1) throw new Error('First take failed')
    if (busyCalls.length === 2) { takeStarted(); await new Promise((resolve) => { finishTake = resolve }) }
    return [{ url: `https://example.test/busy-${busyCalls.length}.png` }]
  },
})
const initialFailure = assert.rejects(busyRun)
await taking
const queuedRetry = busySession.retry('generate')
const duplicateRetry = busySession.retry('generate')
assert.equal(busyCalls.length, 2)
finishTake()
await initialFailure
await Promise.all([queuedRetry, duplicateRetry])
assert.equal(busyCalls.length, 3)
assert.equal(busySession.failures.length, 0)
assert.equal(busySession.results().length, 2)

// Two Retry clicks on an idle session pay for one retry.
let onceCalls = 0
const once = await failedRun(routerFormat, { subject: 'A meadow' }, { run: async () => { if (++onceCalls === 1) throw new Error('First take failed'); return [{ url: 'https://example.test/once.png' }] } })
await Promise.all([once.retry('generate'), once.retry('generate')])
assert.equal(onceCalls, 2)
console.log('Runner review regressions ok: edited options, terminal key rotation, Pod warnings and queued Library retries.')
