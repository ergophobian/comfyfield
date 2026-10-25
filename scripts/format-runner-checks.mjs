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
assert.equal(formats.length, 454)
assert.equal(allFormats.length, 482, 'Do not delete planned formats')
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
// A music video renders one shot per slice of the song, hands the song to each, then joins the shots in order.
const song = { url: '/media/song.mp3', name: 'song.mp3' }
const musicRuns = []
const musicSession = await runFormat(formats.find((f) => f.id === 'song-music-video'), { ...valuesFor(formats.find((f) => f.id === 'song-music-video')), brief: 'Synth pop', artist: null, pace: '4' }, {
  run: async (model, opts, metadata) => {
    musicRuns.push({ model, opts, metadata })
    if (model.provider === 'stitch') return [{ url: '/media/joined.mp4', kind: 'video' }]
    return [{ url: model.kind === 'audio' ? song.url : `/media/${metadata.stepId}.mp4`, kind: model.kind }]
  },
})
const musicShots = musicRuns.filter((r) => r.model.kind === 'video' && r.model.provider === 'comfy')
assert.equal(musicRuns[0].model.workflow, 'minimax_music3')
assert.equal(comfyVars('audio', musicRuns[0].opts).duration, 30, 'The song is as long as the six shots')
assert.equal(musicShots.length, 6)
assert.deepEqual(musicShots.map((r) => comfyVars('video', r.opts, r.model.sizes).audio), Array(6).fill(song.url), 'Every shot hears the song')
assert.deepEqual(musicShots.map((r) => r.opts.params.shot), [0, 1, 2, 3, 4, 5])
const stitched = musicRuns.find((r) => r.model.provider === 'stitch')
assert.deepEqual(stitched.opts.clips.map((c) => c.url), [1, 2, 3, 4, 5, 6].map((n) => `/media/shot${n}.mp4`), 'Shots join in song order')
assert.equal(stitched.opts.aspect, '16:9')
assert.equal(stitched.metadata.formatId, 'song-music-video')
assert.deepEqual(musicSession.results().map((r) => r.url), ['/media/joined.mp4'])
const uploaded = formats.find((f) => f.id === 'music-video')
const uploadFlow = compileFormat(uploaded, { ...valuesFor(uploaded), song, pace: '3', shape: 'tall' })
assert.equal(uploadFlow.nodes.filter((n) => n.type === 'model').length, 6)
assert.equal(uploadFlow.nodes.find((n) => n.type === 'stitch').data.aspect, '9:16')
const firstShot = uploadFlow.nodes.find((n) => n.id === 'shot2').data.model.formatStep.options
assert.equal(comfyVars('video', firstShot).audio, song.url)
assert.equal(comfyVars('video', firstShot).duration, 3, 'The pace sets the clip length the graph slices by')
assert.deepEqual(uploadFlow.edges.filter((e) => e.target === 'join').map((e) => e.source), ['shot1', 'shot2', 'shot3', 'shot4', 'shot5', 'shot6'])
assert.deepEqual(validateFormat({ ...uploaded, steps: [...uploaded.steps, { id: 'bad', type: 'stitch', from: [] }] }).filter((p) => p.startsWith('bad')), ['bad: A join needs upstream video steps'])

// The rap video writes a verse, sings it on the chosen beat, and performs it from the photo.
const rap = formats.find((f) => f.id === 'rap-video')
const rapRuns = []
const rapSession = await runFormat(rap, { ...valuesFor(rap), topic: 'Monday mornings', beat: 'trap' }, {
  writePrompt: async () => '[Verse] Up at six',
  run: async (model, opts) => { rapRuns.push({ model, opts }); return [{ url: model.kind === 'audio' ? song.url : '/media/rap.mp4', kind: model.kind }] },
})
assert.equal(rapRuns.length, 0, 'The verse waits for review')
await rapSession.sendWriter('lyrics')
assert.deepEqual(rapRuns.map((r) => r.model.workflow), ['minimax_music3_lyrics', 'ltx25_ia2v'])
const rapSong = comfyVars('audio', rapRuns[0].opts)
assert.equal(rapSong.prompt, '[Verse] Up at six')
assert.match(rapSong.style, /^Hard hitting trap/)
const rapVideo = comfyVars('video', rapRuns[1].opts, rapRuns[1].model.sizes)
assert.equal(rapVideo.audio, song.url)
assert.equal(rapVideo.image, photo.url)
assert.equal(rapVideo.shot, 0)

console.log(`Format runner checks ok: ${checked} recipe cases, approval and batching, concurrency, schema rejection, Comfy placeholders, writer handoff and provider failures. No network calls.`)
