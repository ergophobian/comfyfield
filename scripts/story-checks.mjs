import assert from 'node:assert/strict'
import { parseShots, footageFormat, reviewStory, renderStory, shotFormat, storyNote, readStoryDocuments } from '../src/lib/storyStudios.js'
import { runFormat as runWithPlanning } from '../src/lib/formats/runner.js'
import { offlineRequirements } from './fixtures/format-planning.mjs'
// The runner preflights each run; inject offline requirements instead of a network call.
const runFormat = (format, values, options) => runWithPlanning(format, values, { requirements: offlineRequirements, ...options })
import { workflowNeeds } from '../server/core.js'
import { planStory } from '../server/story.js'
import { validateFormat } from '../src/lib/formats/validate.js'

const values = { studio: 'Explainer', topic: 'Why ice floats', style: 'Paper cutout', ratio: '9:16', animation: 'full', language: 'es', emotion: 'warm', voice: { sample: '/voice.flac', name: 'Sample' }, captions: true, captionStyle: 'boxed', music: { url: '/music.wav' }, documents: [{ name: 'facts.txt', text: 'Ice is less dense than water.' }] }
const narration = 'Ice floats because it is less dense than water.'
const shots = [{ title: 'Ice', narration, visual: 'Ice on a lake', seconds: 5 }]
const written = []
const review = reviewStory(values, async (input) => {
  written.push(input)
  return written.length === 1 ? narration : JSON.stringify(shots)
})
await review.engine.runNew(review.flow)
assert.equal(written.length, 1, 'Script cannot trigger shots or renders')
assert.equal(review.engine.gate('approve-script').status, 'empty')
await review.engine.sendWriter(review.flow, 'script')
assert.equal(written.length, 1, 'Writer Send still stops at explicit approval')
await review.engine.send(review.flow, 'approve-script')
assert.equal(written.length, 2)
assert(written[1].note.includes(narration), 'Approved script reaches shot writer')
assert(written[0].note.includes('Ice is less dense'), 'Text attachment contents reach writer')
assert(!storyNote({ ...values, video: { url: '/input.mp4' } }).includes('/input.mp4'), 'Writer context excludes media URLs')
assert.equal(review.engine.gate('approve-shots').status, 'empty')
const parsed = parseShots(review.engine.state.shots.items[0].text, values, narration)
assert.equal(parsed[0].source, 'generate')
assert.throws(() => parseShots('bad', values), /JSON array/)
assert.throws(() => parseShots(JSON.stringify(shots), values, 'Changed script'), /preserve/)
assert.throws(() => parseShots(JSON.stringify([{ ...shots[0], source: 'footage', start: 0, end: 6 }]), { video: { url: '/input.mp4', duration: 5 } }), /valid range/)
assert.deepEqual(validateFormat(shotFormat(shots[0], values)), [])
const calls = []
const run = async (model, opts, meta) => {
  calls.push({ model, opts, meta })
  return [{ kind: model.kind, url: `/${model.kind}-${calls.length}` }]
}
const adapter = { generateFormat: (format, inputs) => runFormat(format, inputs, { run }), stitch: async (opts) => ({ ...opts, kind: 'video', url: '/final.mp4' }) }
const result = await renderStory(parsed, values, adapter)
assert.deepEqual(calls.map((call) => call.model.workflow), ['image_flux', 'ltx25_i2v', 'chatterbox_tts'])
assert.equal(calls[0].opts.aspect, '9:16')
assert.equal(calls[0].opts.prompt, 'Paper cutout. Ice on a lake')
assert.equal(calls[1].opts.images[0], '/image-1', 'Image feeds motion')
assert.equal(calls[2].opts.prompt, narration)
assert.equal(calls[2].opts.slots.voice, '/voice.flac')
assert.equal(calls[2].opts.params.language, 'Spanish (es)')
assert.equal(result.clips[0].narration.url, '/audio-3')
assert.equal(result.captionStyle, 'boxed')
assert.equal(result.music.url, '/music.wav')
const cache = new Map()
let fail = true
const retryAdapter = { ...adapter, cache, stitch: async () => {
  if (fail) throw new Error('Stitch temporarily failed')
  return { url: '/retried.mp4' }
} }
await assert.rejects(renderStory(parsed, values, retryAdapter), /temporarily/)
const count = calls.length
fail = false
await renderStory(parsed, values, retryAdapter)
assert.equal(calls.length, count, 'Retry does not buy completed visuals or voice again')
const source = parseShots(JSON.stringify([{ ...shots[0], source: 'footage', start: 1, end: 3 }]), { video: { url: '/input.mp4', duration: 4 } })
const footage = await renderStory(source, { ...values, video: { url: '/input.mp4' }, captions: false, music: null }, adapter)
assert.equal(footage.clips[0].url, '/input.mp4')
assert.equal(footage.clips[0].start, 1)
assert.equal(footage.clips[0].caption, '')
console.log('Story checks passed: approval gates, writer context, model bindings, narration, footage, music and retry reuse')

assert.deepEqual(validateFormat(footageFormat()), [])
const restyled = await renderStory(source, { ...values, restyle: true, video: { url: '/input.mp4', duration: 4, fps: 30 } }, adapter)
assert.equal(calls.at(-2).model.workflow, 'bernini_restyle')
assert.deepEqual(calls.at(-2).opts.trim, { start: 1, end: 3 })
assert.equal(restyled.clips[0].start, undefined, 'Restyled result must not be trimmed a second time')
assert.throws(() => parseShots(JSON.stringify([{ ...shots[0], source: 'footage', start: 0, end: 4 }]), { restyle: true, video: { url: '/input.mp4', duration: 5, fps: 30 } }), /81-frame/)

// Regression: the image is already billed when animation fails.
const stepCalls = []
let animationFails = true
const stepAdapter = { ...adapter, cache: new Map(), generateFormat: (format, inputs) => runFormat(format, inputs, { run: async (model) => {
  stepCalls.push(model.workflow)
  if (model.workflow === 'ltx25_i2v' && animationFails) throw new Error('Animation failed')
  return [{ kind: model.kind, url: `/media/${model.workflow}` }]
} }) }
await assert.rejects(renderStory(parsed, values, stepAdapter), /Animation failed/)
animationFails = false
await renderStory(parsed, values, stepAdapter)
assert.deepEqual(stepCalls, ['image_flux', 'ltx25_i2v', 'ltx25_i2v', 'chatterbox_tts'], 'Retry only rebills the failed animation')
assert.throws(() => parseShots(JSON.stringify([{ ...shots[0], seconds: 20 }]), values), /5 seconds/)
assert.throws(() => parseShots(JSON.stringify([{ ...shots[0], narration: 'word '.repeat(11) }]), values), /10 narration words/)
const footageAt = (end) => JSON.stringify([{ ...shots[0], source: 'footage', start: 0, end }])
const highFps = { ...values, restyle: true, video: { url: '/media/60fps.mp4', duration: 5, fps: 60 } }
assert.throws(() => parseShots(footageAt(3), highFps), /81-frame/)
assert.equal(parseShots(footageAt(1.35), highFps).length, 1)
assert.throws(() => parseShots(footageAt(1.36), highFps), /81-frame/)
assert.throws(() => parseShots(footageAt(1), { ...highFps, video: { ...highFps.video, fps: null } }), /81-frame/)
const sessionStatus = (vramGb) => ({ phase: 'ready', pod: { vramGb, costPerHr: 1, gpuTypeId: 'NVIDIA RTX PRO 4500 Blackwell' } })
const dependencies = { connection: () => ({ run: 'session' }), status: () => sessionStatus(24) }
let renders = 0
await assert.rejects(renderStory(parsed, values, { generateFormat: () => { renders++ }, preflight: (values, shots) => planStory({ values, shots }, dependencies) }), /32 GB/)
assert.equal(renders, 0, 'Entire pipeline is checked before the first billed image')
await assert.rejects(planStory({ values }, dependencies), /32 GB/, 'Drafting also checks the whole pipeline before billing the writer')
const quote = await planStory({ values, shots: parsed }, { ...dependencies, status: () => sessionStatus(32) })
assert.equal(quote.minVramGb, 32)
assert(quote.usd > 0)
assert.equal(quote.usd, quote.perShot.reduce((n, shot) => n + shot.usd, 0))
assert.deepEqual(quote.perShot[0].steps.map((s) => s.workflow), ['image_flux', 'ltx25_i2v', 'chatterbox_tts'])
await assert.rejects(planStory({ values, shots: parsed }, { ...dependencies, status: () => ({ phase: 'none' }) }), /ready Session/)
await assert.rejects(planStory({ values, shots: parsed }, { ...dependencies, connection: () => ({ run: 'instant', key: 'fixture' }), needs: (workflow) => { const n = workflowNeeds(workflow); return { ...n, runtimes: [...n.runtimes, ...(workflow === 'chatterbox_tts' ? [{ name: 'Unavailable test runtime', cloud: false, vramGb: 8 }] : [])] } } }), /unavailable on Comfy Cloud/)
await assert.rejects(planStory({ values: highFps, shots: JSON.parse(footageAt(2)) }, { ...dependencies, status: () => sessionStatus(32), inspect: async () => ({ fps: 60 }) }), /81-frame/, 'Server uses the inspected source fps')

let reads = 0
const doc = (name = 'facts.txt', size = 100, text = 'fact') => ({ name, size, type: 'text/plain', text: async () => { reads++; return text } })
await assert.rejects(readStoryDocuments([doc('large.txt', 101 * 1024)]), /100 KB/)
await assert.rejects(readStoryDocuments(Array.from({ length: 6 }, () => doc())), /5 text/)
await assert.rejects(readStoryDocuments([doc('facts.pdf')]), /only .txt/)
await assert.rejects(readStoryDocuments([doc('a.txt', 100 * 1024), doc('b.txt', 100 * 1024), doc('c.txt', 1)]), /200 KB/)
assert.equal(reads, 0, 'Reject the entire invalid selection before reading any file')
const documents = await readStoryDocuments([doc('a.txt', 30000, 'a'.repeat(30000)), doc('b.md', 30000, 'b'.repeat(30000))])
assert.equal(documents.documents.reduce((n, doc) => n + doc.text.length, 0), 50000)
assert.equal(documents.truncated, true)
assert.equal(documents.documents[1].truncated, true)
await assert.rejects(readStoryDocuments([doc()], Array.from({ length: 5 }, () => ({ name: 'old.txt', size: 100, text: 'old' }))), /5 text/)
console.log('Story regressions passed: animation retry, pipeline preflight, estimates, scene caps, source frames and bounded imports')

await assert.rejects(planStory({ values: { ...highFps, video: { ...highFps.video, fps: 24 } }, shots: JSON.parse(footageAt(1)) }, { ...dependencies, status: () => sessionStatus(32), inspect: async (_, range) => range ? { fps: 24, frames: 82 } : { fps: 24 } }), /81-frame/, 'Variable frame rate footage is limited by decoded frame count too')
