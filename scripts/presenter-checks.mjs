import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { presenterFormats } from '../src/lib/formats/presenters.js'
import { compileFormat, runFormat as runWithPlanning } from '../src/lib/formats/runner.js'
import { offlineRequirements } from './fixtures/format-planning.mjs'
import { createPresenterSession, presenterRequirements, presenterBlock, motionSeconds, speechProblem } from '../src/lib/formats/presenterSession.js'
import { validateFormat } from '../src/lib/formats/validate.js'
import { comfyVars, fill, dropOptional } from '../shared/mapping.js'

const character = { type: 'character', id: 'fictional-adult', name: 'Fictional presenter', images: ['https://example.test/presenter.png'] }
const product = { type: 'product', id: 'cup', name: 'Demo cup', images: ['https://example.test/product.png'] }
const values = { character, product, rights: 'confirmed', brief: 'A reusable cup with a carrying handle.' }
globalThis.fetch = () => { throw new Error('No network allowed') }
// The runner preflights each run; inject offline requirements instead of a network call.
const runFormat = (format, values, options) => runWithPlanning(format, values, { requirements: offlineRequirements, ...options })
for (const format of presenterFormats) assert.deepEqual(validateFormat(format), [], format.id)
assert.equal(presenterFormats.filter((format) => format.id.startsWith('ugc-')).length, 4)
for (const format of presenterFormats.filter((format) => format.id.startsWith('ugc-'))) {
  const calls = []
  const library = []
  const session = await runFormat(format, values, {
    writePrompt: async ({ inputs, images, instructions }) => {
      assert.equal(inputs.character.id, character.id)
      assert(images.includes('https://example.test/stage.png'), 'Writer sees the staged product and presenter')
      assert(instructions.includes('Never invent'))
      return 'Carry your cup comfortably with this easy to hold handle.'
    },
    run: async (model, opts, meta) => {
      const vars = comfyVars(model.kind, opts)
      calls.push({ model, vars, meta })
      const files = [{ url: `https://example.test/${meta.stepId === 'stage' ? 'stage.png' : 'finished.mp4'}`, kind: model.kind }]
      library.push(...files.map((file) => ({ ...file, ...meta })))
      return files
    },
  })
  assert.equal(calls.length, 1, 'Only the still runs before script review')
  assert.equal(calls[0].vars.image, character.images[0])
  assert.equal(calls[0].vars.image2, product.images[0])
  assert.equal(session.engine.gate('approve-script').status, 'empty')
  session.engine.editWriter(session.flow, 'script', 'The handle makes this reusable cup easy to carry around.')
  await session.send('approve-script')
  assert.equal(calls.length, 1, 'A premature gate Send cannot bypass writer review')
  await session.sendWriter('script')
  assert.equal(calls.length, 1, 'Sending the writer must still stop at approval')
  assert.equal(session.engine.gate('approve-script').status, 'reviewing')
  const script = session.engine.reviewItems(session.flow, 'approve-script')[0]
  session.engine.togglePick(session.flow, 'approve-script', script.id)
  await session.send('approve-script')
  assert.equal(calls.length, 2)
  assert.equal(calls[1].vars.prompt, 'The handle makes this reusable cup easy to carry around.')
  assert.equal(calls[1].vars.image, 'https://example.test/stage.png')
  assert.equal(calls[1].vars.image2, product.images[0], 'Product keeps its ordered reference slot')
  assert.equal(library.length, 2)
  assert.equal(library[0].formatRunId, library[1].formatRunId)
  assert.deepEqual(session.results().map((item) => item.kind), ['image', 'video'])
  await session.send('approve-script')
  await session.engine.runNew(session.flow)
  assert.equal(calls.length, 2, 'Run and repeated Send preserve finished output')
  const graph = JSON.parse(readFileSync(`public/workflows/${calls[1].model.workflow}.json`))
  const filled = fill(dropOptional(graph, calls[1].vars), calls[1].vars)
  const speech = Object.values(filled).find((node) => node.class_type === 'FL_ChatterboxMultilingualTTS')
  assert.equal(speech.inputs.text, calls[1].vars.prompt, 'Reviewed words reach speech, not a static script')
  assert(!JSON.stringify(filled).includes('{{'), 'No unfilled graph placeholders')
  assert(!Object.values(filled).some((node) => node.class_type === 'LoadAudio'), 'Default voice needs no sample')
  if (format.id === 'ugc-unboxing' || format.id === 'ugc-tutorial') {
    assert(Object.values(filled).some((node) => node.class_type === 'LTXVImgToVideoInplace'))
    assert.equal(calls[1].vars.width % 64, 0, 'LTX 2.5 uses its native canvas')
    assert.equal(filled['102'].inputs.video[0], '32', 'Lipsync consumes the image-to-video result')
    assert.equal(filled['127'].inputs.audio[0], '202', 'Final video contains the generated speech')
  }
}
const motion = presenterFormats.find((format) => format.id === 'influencer-motion')
let vars
await runFormat(motion, { character, rights: 'confirmed', video: { url: 'https://example.test/motion.mp4', trim: { start: 2, end: 6 }, duration: 8 }, scene: 'A simple studio' }, {
  run: async (model, opts) => {
    assert.equal(model.workflow, 'wan_animate2')
    vars = comfyVars(model.kind, opts)
    return [{ kind: 'video', url: 'https://example.test/finished.mp4' }]
  },
})
assert.equal(vars.image, character.images[0])
assert.equal(vars.video, 'https://example.test/motion.mp4')
assert.equal(vars.start, 2)
assert.equal(vars.duration, 4)
assert.throws(() => compileFormat(motion, { character, rights: 'confirmed' }), /Reference motion clip/)
assert.throws(() => compileFormat(presenterFormats[0], { character, rights: 'confirmed', brief: 'A cup' }), /Product from Library/)
console.log('Presenter checks ok: four creator formats, ordered Library references, editable writer and approval gates, speech graph links, motion trim, persistence metadata and rerun safety. No network calls.')

const graphFor = async (workflow) => JSON.parse(readFileSync(`public/workflows/${workflow}.json`))
for (const format of presenterFormats.filter((format) => format.id.startsWith('ugc-'))) {
  const requirements = await presenterRequirements(compileFormat(format, values), graphFor)
  assert.equal(requirements.steps.length, 2, 'Every generation workflow is checked before starting')
  assert(requirements.session, 'wav2vec requires a Session')
  const demo = ['ugc-unboxing', 'ugc-tutorial'].includes(format.id)
  assert.equal(requirements.vram, demo ? 32 : 24)
  const block = presenterBlock(requirements, { phase: 'none' }, 'instant')
  assert.equal(block.message, demo ? 'This format needs a Session with a 32 GB GPU' : 'Speech videos need a Session')
  assert.equal(block.workflow, demo ? 'ugc_presenter_demo' : 'ugc_presenter_talk')
  assert(presenterBlock(requirements, { phase: 'ready', pod: { vramGb: 16 } }, 'session'))
  assert.equal(presenterBlock(requirements, { phase: 'ready', pod: { vramGb: 32 } }, 'session'), null)
}
let staged = 0
let written = 0
const retained = createPresenterSession(presenterFormats[0], values, {
  run: async () => { staged++; return [{ kind: 'image', url: 'stage.png' }] },
  writePrompt: async () => { written++; if (written === 1) throw new Error('Writer unavailable'); return 'Carry the cup easily.' },
})
await assert.rejects(retained.resume(), (error) => error.message === 'Writer unavailable' && error.session === retained)
await retained.resume()
assert.equal(staged, 1, 'Retry must keep the paid stage output')
assert.equal(written, 2, 'Only the failed writer retries')
let callsBeforeBlocked = 0
const blocked = createPresenterSession(presenterFormats[0], values, {
  guard: async () => { throw new Error('Speech videos need a Session') },
  run: async () => { callsBeforeBlocked++ }, writePrompt: async () => { callsBeforeBlocked++ },
})
await assert.rejects(blocked.resume(), /Speech videos need a Session/)
assert.equal(callsBeforeBlocked, 0, 'No writer or staging when preflight blocks')
assert.throws(() => createPresenterSession(presenterFormats[0], { ...values, rights: null }, {}), /consent/)
assert(speechProblem(Array(61).fill('word').join(' ')))
assert.equal(speechProblem(Array(60).fill('word').join(' ')), null)
const motionGraph = await graphFor('wan_animate2')
assert.equal(motionGraph['1'].inputs.force_rate, 16, '30 fps and 60 fps sources normalize before the frame cap')
assert.equal(motionGraph['25'].inputs.fps, 16)
assert(!('audio' in motionGraph['25'].inputs), 'Reference audio never reaches the output')
assert.equal(vars.motion_start, 32)
assert.equal(vars.motion_frames, 61)
assert.equal(motionSeconds({ trim: { start: 2, end: 6 } }), 61 / 16)
assert.equal(motionSeconds({ trim: { start: 0, end: 10 } }), 81 / 16)
console.log('Presenter regression checks ok: full-format Session preflight, no duplicate staging on writer retry, rights, speech length and normalized silent motion.')
