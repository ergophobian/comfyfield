// Upscale in Create video: the automatic source and target, the SeedVR2 scale factor, and the graphs it runs.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { comfyVars, fill } from '../shared/mapping.js'
import { podNeedsOf, notOnCloud } from '../shared/modelFiles.js'
import { models } from '../src/lib/catalog.js'
import { MAX_LONG, planUpscale, shortOf, sourcesFor, targets, upscaleJob, upscalerModel, upscalers } from '../src/lib/upscale.js'

const ids = (list) => list.map((x) => x?.id ?? null)
const fal = (resolutions) => sourcesFor({ provider: 'fal' }, { resolutions }, '16:9')
const plan = (sources, pick) => { const p = planUpscale(sources, pick); return [p.source?.id ?? null, p.target.id] }

assert.deepEqual(['480p', '720P', '1080p', '4k', '2K', 'auto', '1K'].map(shortOf), [480, 720, 1080, 2160, 1440, null, null])

// A fal model's resolution choices, smallest first; choices with no short side are left out.
assert.deepEqual(ids(fal(['1080p', 'auto', '480p', '720p'])), ['480p', '720p', '1080p'])
assert.equal(fal(['768P', '1080P'])[0].resolution, '768P', 'the run sends the value the model listed')
assert.deepEqual(sourcesFor({ provider: 'google' }, { resolutions: null }, '16:9'), [], 'a model with no choice has no sources')

// An open model's sources are its own canvas and smaller drafts, each the size comfyVars makes.
for (const m of models.filter((x) => x.provider === 'comfy' && x.kind === 'video' && x.sizes)) {
  for (const aspect of ['16:9', '9:16', '1:1', '4:5', '21:9']) {
    const list = sourcesFor(m, { resolutions: null }, aspect)
    assert.equal(list.length, 3, `${m.id} ${aspect}`)
    assert(list.at(-1).native && list.at(-1).scale === 1, `${m.id} ${aspect}: the largest source is the model's own canvas`)
    for (const s of list) {
      const v = comfyVars('video', { prompt: 'x', aspect, duration: 5, scale: s.scale }, m.sizes)
      assert.equal(Math.min(v.width, v.height), s.short, `${m.id} ${aspect} at ${s.scale}`)
      assert.equal(s.label, `${s.short}p`)
    }
  }
}
const h3 = sourcesFor(models.find((m) => m.id === 'comfy-h3'), { resolutions: null }, '16:9')
assert.deepEqual(h3.map((s) => s.short), [384, 576, 768])

// Auto: the largest source under the target, and 1080p or 4K above the source.
assert.deepEqual(plan(fal(['480p', '720p', '1080p'])), ['720p', '1080p'])
assert.deepEqual(plan(fal(['480p', '720p', '1080p']), { target: '4k' }), ['1080p', '4k'])
assert.deepEqual(plan(fal(['480p', '720p', '1080p']), { target: '1440p' }), ['1080p', '1440p'])
assert.deepEqual(plan(fal(['1080p'])), ['1080p', '4k'], 'a model that only makes 1080p goes to 4K')
assert.deepEqual(plan(fal(['1080p']), { target: '1080p' }), ['1080p', '4k'], 'a target at the source is no target')
assert.deepEqual(plan(fal(['720p', '1080p']), { source: '1080p', target: '1080p' }), ['1080p', '4k'])
assert.deepEqual(plan(fal(['720p', '1080p']), { source: '720p', target: '4k' }), ['720p', '4k'], 'picks the person made stay')
assert.deepEqual(plan(fal(['720p', '1080p']), { source: '540p' }), ['720p', '1080p'], 'a source from another model falls back to auto')
assert.deepEqual(plan(h3), ['x1', '1080p'], 'an open model makes its own canvas')
assert.deepEqual(plan(h3, { source: 'x0.5' }), ['x0.5', '1080p'])
assert.deepEqual(plan([]), [null, '1080p'], 'with no sources the clip is measured when it comes back')
assert.deepEqual(plan([], { target: '1440p' }), [null, '1440p'])
assert.deepEqual(targets.map((t) => t.short), [1080, 1440, 2160])

// The scale factor comes from the clip as it came back, capped where the graph caps it.
const t = Object.fromEntries(targets.map((x) => [x.id, x]))
assert.deepEqual(upscaleJob(t['1080p'], { width: 1280, height: 720, seconds: 5.04 }), { factor: 1.5, duration: 7 })
assert.deepEqual(upscaleJob(t['1080p'], { width: 720, height: 1280, seconds: 5 }), { factor: 1.5, duration: 6 }, 'portrait reads the short side too')
assert.equal(upscaleJob(t['4k'], { width: 1344, height: 768, seconds: 5 }).factor, 2.813)
assert.equal(upscaleJob(t['4k'], { width: 1536, height: 672, seconds: 5 }).factor, MAX_LONG / 1536, 'a 21:9 clip stops at 3840 wide')
assert.equal(upscaleJob(t['1080p'], { width: 1920, height: 1080, seconds: 5 }), null, 'a clip at the target is not upscaled')
assert.equal(upscaleJob(t['1080p'], { width: 1856, height: 1040, seconds: 5 }), null, 'nor one within 5% of it')
assert.deepEqual(upscaleJob(t['1080p'], null, { short: 540, seconds: 8 }), { factor: 2, duration: 9 }, 'an unread clip uses the planned source')
assert.deepEqual(upscaleJob(t['1080p'], null), { factor: 1.5, duration: 6 })
assert.equal(upscaleJob(t['1080p'], { width: 1280, height: 720, seconds: Infinity }, { seconds: 4 }).duration, 5)

// Both upscalers are SeedVR2 graphs on Comfy Cloud that differ only in the model file.
const graph = (w) => JSON.parse(fs.readFileSync(`public/workflows/${w}.json`, 'utf8'))
assert.equal(upscalerModel('nope').workflow, 'seedvr2_video', 'an unknown pick runs the 3B')
for (const u of upscalers) {
  const m = upscalerModel(u.id)
  assert.equal(m.provider, 'comfy')
  const g = graph(m.workflow)
  const unet = Object.values(g).find((n) => n.class_type === 'UNETLoader').inputs.unet_name
  assert.equal(unet, `seedvr2_${u.id.split('-')[1]}_int8_convrot.safetensors`, u.id)
  const needs = podNeedsOf(g)
  assert(needs.some((f) => f.name === unet), `${u.id}: a Pod downloads ${unet}`)
  assert.deepEqual(notOnCloud(needs), [], `${u.id} runs on Comfy Cloud`)
  const filled = fill(g, comfyVars('video', { prompt: '', aspect: '16:9', count: 1, video: '/media/take.mp4', duration: 7, params: { upscale_factor: 1.5 } }))
  const node = (type) => Object.values(filled).find((n) => n.class_type === type).inputs
  assert.equal(node('LoadVideo').file, '/media/take.mp4')
  assert.equal(node('PrimitiveFloat').value, 1.5)
  assert.deepEqual([node('Video Slice').start_time, node('Video Slice').duration], [0, 7])
  assert(!JSON.stringify(filled).includes('{{'), `${m.workflow} fills every placeholder`)
}
const strip = (g) => JSON.stringify(g).replace(/seedvr2_(3b|7b)_int8_convrot|seedvr2_video(_7b)?"/g, '')
assert.equal(strip(graph('seedvr2_video')), strip(graph('seedvr2_video_7b')))

console.log('upscale checks passed')
