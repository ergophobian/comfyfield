import assert from 'node:assert/strict'
import { recipes, initialValues, recipeOptions } from '../src/lib/recipes.js'
import { allFormats, formats, formatProblems } from '../src/lib/formats/index.js'
import { compileFormat, runFormat } from '../src/lib/formats/runner.js'
import { validateFormat } from '../src/lib/formats/validate.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { falInput, comfyVars } from '../shared/mapping.js'

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

await assert.rejects(runFormat(imageRecipe, valuesFor(imageRecipe), { run: async () => { throw new Error('Mock provider failure') } }), /Mock provider failure/)
const writerFormat = { ...imageRecipe, writer: 'Describe the scene' }
await assert.rejects(runFormat(writerFormat, valuesFor(imageRecipe), { run: async () => { throw new Error('Must not run') } }), /writing is not connected/)
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
assert.equal(formats.length, 342)
assert.equal(allFormats.length, 479, 'Do not delete planned formats')
assert.equal(allFormats.filter((f) => f.category === 'camera').length > 0, true, 'Keep Create prompt presets')
assert(allFormats.filter((f) => !formats.includes(f)).every((f) => formatProblems.get(f.id).length))
console.log(`Format runner checks ok: ${checked} recipe cases, approval and batching, concurrency, schema rejection, Comfy placeholders, writer handoff and provider failures. No network calls.`)
