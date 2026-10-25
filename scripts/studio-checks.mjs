import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { allFormats, formatById, isWired } from '../src/lib/formats/index.js'
import { initialValues, missingInputs } from '../src/lib/recipes.js'
import { runFormat as runWithPlanning } from '../src/lib/formats/runner.js'
import { offlineRequirements } from './fixtures/format-planning.mjs'
import { comfyVars, dropOptional, fill } from '../shared/mapping.js'
import { studioLimitNote, upscaleOutput } from '../src/lib/studioLimits.js'
import { models } from '../src/lib/catalog.js'

// Exercise the same runner as the studio workspace. No provider or key loading.
globalThis.fetch = () => { throw new Error('Network is forbidden in studio checks') }
const runFormat = (format, values, options) => runWithPlanning(format, values, { requirements: offlineRequirements, ...options })
const image = { url: '/mock-photo.png', ratio: '160:90', name: 'Mock photo' }
const video = { url: '/mock-clip.webm', ratio: '160:90', name: 'Mock clip', duration: 12, trim: { start: 2.125, end: 7.375 } }
const audio = { url: '/mock-audio.wav', name: 'Mock recording' }
const voice = { name: 'Mock voice', sample: '/mock-voice.wav' }
const defaults = (format) => ({ ...initialValues(format), ...Object.fromEntries(format.inputs.flatMap((i) => {
  const v = i.type === 'image' ? image : i.type === 'video' ? video : i.type === 'audio' ? audio : i.type === 'voice' ? voice
    : i.type === 'character' ? { name: 'Mock character', images: ['/mock-character.png'] }
    : ['text', 'longtext'].includes(i.type) ? 'A quiet garden' : undefined
  return v === undefined ? [] : [[i.id, v]]
})) })
function assertFilled(value, path = 'graph') {
  assert.notEqual(value, undefined, `${path} must not become undefined during fill`)
  if (typeof value === 'string') assert(!/\{\{|undefined/.test(value), `${path} has an unresolved value`)
  if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) assertFilled(child, `${path}.${key}`)
}
assert.throws(() => assertFilled(fill({ inputs: { missing: '{{absent}}' } }, {})), /undefined/)
assert.throws(() => assertFilled(fill({ inputs: { missing: 'prefix {{absent}}' } }, {})), /unresolved/)

// Resolve the actual numeric graph links rather than searching serialized copy.
function numberAt(graph, link, fixtures = {}) {
  if (!Array.isArray(link)) return link
  const [id, output] = link
  if (fixtures[id]) return fixtures[id][output]
  const node = graph[id]
  if (node.class_type.startsWith('Primitive')) return node.inputs.value
  assert.equal(node.class_type, 'ComfyMathExpression', `Unsupported numeric test node ${id}`)
  const vars = Object.entries(node.inputs).filter(([key]) => key.startsWith('values.'))
  const keys = vars.map(([key]) => key.slice(7))
  const values = vars.map(([, value]) => numberAt(graph, value, fixtures))
  const result = Function(...keys, 'min', 'max', 'floor', `return ${node.inputs.expression}`)(...values, Math.min, Math.max, Math.floor)
  return output === 1 ? Math.trunc(result) : result
}
let checked = 0
async function run(id, values = {}) {
  const format = formatById(id)
  assert(format && isWired(format), `${id} must validate`)
  let result
  const session = await runFormat(format, { ...defaults(format), ...values }, { run: async (model, options, meta) => {
    const vars = comfyVars(model.kind, options, model.sizes)
    const workflow = vars.image && model.imageWorkflow ? model.imageWorkflow : model.workflow
    const graph = fill(dropOptional(JSON.parse(readFileSync(`public/workflows/${workflow}.json`, 'utf8')), vars), vars)
    assert.equal(meta.formatId, id)
    assert.equal(meta.stepId, 'generate')
    assertFilled(graph)
    result = { model, options, vars, workflow, graph }
    return [{ url: '/mock-result', kind: model.kind }]
  } })
  assert.equal(session.results().length, 1)
  checked++
  return result
}

for (const mode of ['faithful', 'enhance']) {
  for (const factor of ['2', '4']) {
    const r = await run('image-upscale', { mode, factor })
    assert.equal(r.workflow, mode === 'faithful' ? 'image_upscale_esrgan' : 'image_upscale')
    assert.equal(r.vars.upscale_factor, Number(factor))
    assert.equal(r.graph[mode === 'faithful' ? '3' : '4'].inputs.value, Number(factor))
  }
}
for (const [size, target] of [['same', 0], ['2k', 2048], ['4k', 4096]]) {
  const r = await run('unblur', { size })
  assert.equal(r.vars.target, target)
  assert.equal(r.graph['5'].inputs.value, target)
  assert.equal(r.vars.upscale_factor, 1)
}
for (const factor of ['2', '4']) {
  const r = await run('video-upscale', { factor })
  assert.equal(r.graph['5'].inputs.value, Number(factor))
}

const editIds = ['edit-video', 'video-erase', 'video-bg-remove', 'video-character-swap', 'reshoot', 'color-grade']
for (const id of [...editIds, 'video-upscale']) {
  const format = formatById(id)
  const variants = [{}, ...format.inputs.flatMap((i) => i.type === 'choice' ? i.options.map((o) => ({ [i.id]: o.id })) : [])]
  for (const values of variants) {
    const r = await run(id, values)
    assert.equal(r.vars.video, video.url)
    assert.equal(r.vars.start, 2.125)
    assert.equal(r.vars.duration, 5.25)
    assert.deepEqual(r.options.inputs.video.trim, video.trim)
    assert.equal(r.graph['2'].inputs.start_time, 2.125)
    assert.equal(r.graph['2'].inputs.duration, 5.25)
  }
}
assert.equal((await run('edit-video', { ref: null })).workflow, 'bernini_swap_noref')
assert.equal((await run('edit-video')).workflow, 'bernini_swap')
assert.equal((await run('video-erase', { target: 'The blue chair' })).graph['92'].inputs.text, 'The blue chair')
assert.equal((await run('video-character-swap', { source: 'photo' })).vars.image, image.url)
assert.equal((await run('video-character-swap', { source: 'character' })).vars.image, '/mock-character.png')
for (const [angle, trajectory, orbit] of [['left', 'arc_left', false], ['right', 'arc_right', false], ['above', 'translate_up', false], ['low', 'translate_down', false], ['orbit', 'arc_right', true]]) {
  const r = await run('reshoot', { angle })
  assert.equal(r.graph['11'].inputs.camera_type, trajectory)
  assert.equal(r.graph['13'].inputs.switch, orbit)
}
for (const [result, workflow] of [['transparent', 'birefnet_video_matte_alpha'], ['green', 'birefnet_video_matte'], ['new', 'birefnet_video_matte_scene']]) {
  const r = await run('video-bg-remove', { result, background: 'A sunny garden' })
  assert.equal(r.workflow, workflow)
  if (result === 'new') assert(r.graph['24'].inputs.prompt.includes('A sunny garden'))
}
for (const grade of formatById('color-grade').inputs.find((i) => i.id === 'grade').options) {
  assert((await run('color-grade', { grade: grade.id })).graph['10'].inputs.text.includes(grade.text))
}

const tts = formatById('tts')
const languages = tts.inputs.find((i) => i.id === 'language').options
assert(!languages.some((l) => l.id === 'auto'), 'Chatterbox has no auto detect language')
for (const language of languages) {
  for (const emotion of tts.inputs.find((i) => i.id === 'emotion').options) {
    const r = await run('tts', { language: language.id, emotion: emotion.id, script: 'Read these exact words.' })
    assert.equal(r.graph['2'].inputs.language, language.params.language)
    assert.equal(r.graph['2'].inputs.exaggeration, emotion.params.exaggeration)
    assert.equal(r.graph['2'].inputs.cfg_weight, emotion.params.cfg_weight)
    assert.equal(r.graph['2'].inputs.text, 'Read these exact words.')
    assert.equal(r.graph['1'].inputs.audio, voice.sample)
  }
}
assert(!('1' in (await run('tts', { voice: null })).graph), 'Default speech drops the optional voice loader')
const changed = await run('voice-change')
assert.equal(changed.graph['1'].inputs.audio, audio.url)
assert.equal(changed.graph['3'].inputs.audio, voice.sample)
assert(missingInputs(formatById('voice-change'), { audio, voice: { name: 'No sample' } }).some((i) => i.id === 'voice'))
for (const id of ['drama3-tts', 'qwen3-tts']) {
  const r = await run(id, { script: 'Exact sample script' })
  assert.equal(r.vars.prompt, 'Exact sample script')
  assert.equal(r.vars.voice, voice.sample)
  assert.equal(models.some((m) => m.workflow === r.workflow), id !== 'qwen3-tts', 'Qwen requires its format voice input and must stay out of the generic picker')
}
assert(!('3' in (await run('drama3-tts', { voice: null })).graph))
await assert.rejects(() => run('qwen3-tts', { voice: null }), /Still needed: Voice sample/)

const spoken = await run('talking-head', { source: 'script', script: 'Words to say', language: 'zh', emotion: 'excited' })
assert.equal(spoken.workflow, 'infinitetalk_tts')
assert.equal(spoken.vars.script, 'Words to say')
assert.equal(spoken.vars.language, 'Chinese (zh)')
assert.equal(spoken.vars.exaggeration, 0.9)
const recorded = await run('talking-head', { source: 'audio', script: '', voice: null })
assert.equal(recorded.workflow, 'infinitetalk')
assert.equal(recorded.vars.audio, audio.url)
const synced = await run('lipsync')
assert.equal(synced.workflow, 'infinitetalk_v2v')
assert.equal(synced.vars.video, video.url)
assert.equal(synced.vars.audio, audio.url)
for (const r of [spoken, recorded, synced]) {
  assert(JSON.stringify(r.graph).includes('480p'), 'Only the available 480p model is used')
  if (r.workflow !== 'infinitetalk_v2v') {
    assert.equal(r.graph['16'].inputs.num_frames / r.graph['16'].inputs.fps, 30)
    assert.equal(r.graph['21'].inputs.duration, 30)
  }
}

const looks = allFormats.filter((f) => f.category === 'mixed')
assert.equal(looks.length, 33)
for (const look of looks) {
  if (!isWired(look)) continue
  for (const strength of look.inputs.find((i) => i.id === 'strength').options) {
    for (const fps of look.inputs.find((i) => i.id === 'fps').options) {
      const r = await run(look.id, { strength: strength.id, fps: fps.id })
      assert.equal(r.workflow, 'bernini_mixed')
      assert.equal(r.graph['85'].inputs.value, fps.params.stride)
      for (const sourceFps of [15, 24, 30, 60]) {
        const actual = numberAt(r.graph, ['90', 0], { '3': [null, null, sourceFps] })
        assert.equal(actual, sourceFps / fps.params.stride)
      }
      assert.equal(r.graph['93'].inputs.blend_factor, strength.params.strength)
      assert.equal(r.vars.start, 2.125)
      assert.equal(r.vars.duration, 5.25)
      assert(r.graph['10'].inputs.text.includes(strength.text))
    }
  }
}
for (const [duration, sourceFps] of [[5.25, 15], [30, 15], [60, 15], [30, 60], [0.5, 24]]) {
  const r = await run('lipsync', { video: { ...video, trim: { start: 2, end: 2 + duration } } })
  const fixtures = { '3': [null, null, sourceFps], '5': [160, 90, Math.ceil(Math.min(30, duration) * sourceFps)] }
  const frames = numberAt(r.graph, r.graph['22'].inputs.num_frames, fixtures)
  const audioDuration = numberAt(r.graph, r.graph['27'].inputs.duration, fixtures)
  assert.equal(numberAt(r.graph, r.graph['2'].inputs.duration, fixtures), Math.min(30, duration))
  assert.equal(numberAt(r.graph, r.graph['28'].inputs.fps, fixtures), sourceFps)
  assert.equal(frames, Math.floor(Math.min(30, duration) * sourceFps))
  assert.equal(audioDuration, Math.min(30, duration))
  assert(frames / sourceFps <= 30)
  assert.deepEqual(r.graph['22'].inputs.audio_1, ['27', 0])
}
for (const id of ['edit-video', 'video-character-swap', 'reshoot', 'color-grade', looks[0].id]) {
  const r = await run(id)
  assert.equal(r.graph['81'].inputs.value, 81)
  assert.equal(numberAt(r.graph, ['82', 1], { '80': [0, 0, 300], '79': [0, 0, 150] }), 81)
  const note = studioLimitNote(formatById(id), { video, fps: '24' })
  assert(note.includes('81') && note.includes('from 2.13 seconds') && note.includes('selected clip is not generated'))
}
assert.deepEqual(upscaleOutput({ ratio: '1920:1080' }, 4, 3840), { width: 3840, height: 2160, scale: 2 })
assert.deepEqual(upscaleOutput({ ratio: '1920:1080' }, 4, 4096), { width: 4096, height: 2304, scale: 4096 / 1920 })
for (const [id, mode, node, source, divisor] of [
  ['image-upscale', 'faithful', '4', '2', 4],
  ['image-upscale', 'enhance', '5', '3', 1],
  ['video-upscale', null, '6', '4', 1],
]) {
  const r = await run(id, { factor: '4', ...(mode && { mode }) })
  const scale = numberAt(r.graph, [node, 0], { [source]: [1920, 1080] })
  assert.equal(scale * divisor, id === 'image-upscale' ? 4096 / 1920 : 2)
  assert(studioLimitNote(formatById(id), { image: { ratio: '1920:1080' }, video: { ratio: '1920:1080' }, factor: '4' }).includes(id === 'image-upscale' ? '4096' : '3840'))
}
const info = formatById('drama3-tts').info
assert.equal(info.attribution, 'Built with Fish Audio')
for (const term of ['$500,000', 'Hosted', 'prior consent', 'separate written license']) assert(info.text.includes(term))
assert.equal(info.url, 'https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE')
console.log(`Studio checks ok: ${checked} runner cases; upscale modes/scale/size, all six video edits and trim, speech language/delivery/voice, Drama 3/Qwen3-TTS, photo/video lipsync and ${looks.filter(isWired).length}/33 mixed media looks. No provider calls.`)
