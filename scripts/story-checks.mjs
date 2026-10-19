import assert from 'node:assert/strict'
import { parseShots, footageFormat, reviewStory, renderStory, shotFormat, storyNote } from '../src/lib/storyStudios.js'
import { runFormat } from '../src/lib/formats/runner.js'
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
const restyled = await renderStory(source, { ...values, restyle: true, video: { url: '/input.mp4', duration: 4 } }, adapter)
assert.equal(calls.at(-2).model.workflow, 'bernini_restyle')
assert.deepEqual(calls.at(-2).opts.trim, { start: 1, end: 3 })
assert.equal(restyled.clips[0].start, undefined, 'Restyled result must not be trimmed a second time')
assert.throws(() => parseShots(JSON.stringify([{ ...shots[0], source: 'footage', start: 0, end: 4 }]), { restyle: true, video: { url: '/input.mp4', duration: 5 } }), /3-second/)
