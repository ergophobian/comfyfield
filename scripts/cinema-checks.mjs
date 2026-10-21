import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cinemaPlan } from './fixtures/cinema-plan.mjs'
import { cinemaCost, cinemaExamplePlan, cinemaFlow, cinemaInstructions, cinemaPrompt, validateCinemaPlan } from '../src/lib/cinema.js'
import { createFlows } from '../server/flows.js'
import { comfyVars } from '../shared/mapping.js'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { writeKeys, writePrompt } from '../server/core.js'

// No saved keys or provider environment variables can reach the mocked writer checks.
if (!process.argv.includes('--isolated')) {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--isolated'], {
    stdio: 'inherit', env: { SystemRoot: process.env.SystemRoot || '', PATH: process.env.PATH || '' },
  })
  process.exit(result.status ?? 1)
}
process.env.COMFYFIELD_HOME = mkdtempSync(join(tmpdir(), 'comfyfield-cinema-writer-'))

const network = global.fetch
global.fetch = () => { throw new Error('Cinema unit checks must never call a provider') }
try {
  assert.deepEqual(validateCinemaPlan(JSON.stringify(cinemaPlan)), cinemaPlan)
  assert.deepEqual(validateCinemaPlan('```json\n' + JSON.stringify(cinemaPlan) + '\n```'), cinemaPlan)
  for (const value of ['', 'not json', 'null', '{}', JSON.stringify({ ...cinemaPlan, shots: [] }), JSON.stringify({ ...cinemaPlan, shots: Array(7).fill(cinemaPlan.shots[0]) })]) assert.throws(() => validateCinemaPlan(value))
  for (const invalid of [null, {}, ...[null, '', 'bad', true, {}, 0, -1, Infinity].map((duration) => ({ ...cinemaPlan.shots[0], duration })), { ...cinemaPlan.shots[0], camera: '' }, { ...cinemaPlan.shots[0], prompt: 'x'.repeat(601) }, { ...cinemaPlan.shots[0], continuity: [] }, { ...cinemaPlan.shots[0], image: { url: 'https://example.org/frame.png' } }]) {
    assert.throws(() => validateCinemaPlan({ ...cinemaPlan, shots: [invalid, ...cinemaPlan.shots.slice(1)] }))
  }
  const quoted = { ...cinemaPlan, title: 'A "portal" {opens} \\ in rain' }
  assert.deepEqual(validateCinemaPlan('Here is the plan:\n```json\n' + JSON.stringify(quoted) + '\n```\nReady to edit.'), quoted)
  assert.throws(() => validateCinemaPlan('A partial plan: {"shots": ['), /invalid shot plan/)
  assert.throws(() => validateCinemaPlan({ ...cinemaPlan, shots: cinemaPlan.shots.slice(0, 1) }), /2 to 6 shots/)
  const twoShots = validateCinemaPlan({ ...cinemaPlan, shots: cinemaPlan.shots.slice(0, 2) })
  assert.equal(cinemaFlow(twoShots).nodes.filter((node) => node.type === 'model').length, 2)
  for (const [duration, expected] of [['5', 5], [6, 5], ['7', 8], [9.5, 10]]) {
    const normalized = validateCinemaPlan({ ...cinemaPlan, shots: cinemaPlan.shots.map((shot) => ({ ...shot, duration })) })
    assert(normalized.shots.every((shot) => shot.duration === expected))
  }
  assert.equal(validateCinemaPlan(cinemaExamplePlan).shots.length, 3)
  assert(cinemaExamplePlan.shots.every((shot) => shot.duration === 5))
  assert(cinemaFlow(cinemaExamplePlan).nodes.filter((node) => node.type === 'model').every((node) => node.data.model.id === 'comfy-ltx25'))

  // Exercise both provider payloads with fake saved keys and a fully intercepted network.
  for (const google of [false, true]) {
    writeKeys({ comfy: { key: 'mock-comfy' }, google: { key: google ? 'mock-google' : '' } })
    const payloads = []
    global.fetch = async (url, options) => {
      payloads.push(JSON.parse(options.body))
      return { ok: true, json: async () => google
        ? { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(cinemaPlan) }] } }] }
        : { status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(cinemaPlan) }] }] } }
    }
    const request = { instructions: cinemaInstructions, note: 'Fold the street', target: 'Shot plan' }
    await writePrompt({ ...request, promptOnly: false })
    await writePrompt(request)
    const content = payloads.map((body) => google ? body.contents[0].parts[0].text : body.input[0].content[0].text)
    assert(!content[0].includes('Write only the finished generation prompt.'), 'Planner opts out of the generation-prompt suffix')
    assert(content[1].includes('Write only the finished generation prompt.'), 'Other writers keep their default suffix')
    assert(payloads.every((body) => (google ? body.systemInstruction.parts[0].text : body.instructions) === cinemaInstructions))
  }
  global.fetch = () => { throw new Error('Cinema unit checks must never call a provider') }
  assert.throws(() => validateCinemaPlan({ ...cinemaPlan, title: '' }))
  assert.throws(() => validateCinemaPlan('x'.repeat(16001)), /too long/)
  assert.deepEqual(validateCinemaPlan({ ...cinemaPlan, malicious: true }).shots, cinemaPlan.shots, 'Only validated fields survive')
  assert.equal(cinemaCost(cinemaPlan.shots), 0.24)
  assert.equal(cinemaCost([{ duration: 10 }, { duration: 5 }, { duration: 8 }]), 0.368)

  const directory = mkdtempSync(join(tmpdir(), 'comfyfield-cinema-check-'))
  const calls = []
  const stitches = []
  const store = createFlows({ directory: () => directory, generate: async (options) => {
    calls.push(options)
    return [{ kind: 'video', url: `/media/${options.prompt.includes('Replaced') ? 'replacement' : calls.length}.mp4` }]
  }, stitch: async (options) => {
    stitches.push(options)
    return { kind: 'video', url: `/media/scene-${stitches.length}.mp4` }
  } })
  const flow = cinemaFlow(cinemaPlan, { id: 'cinema-check', idea: 'Portal effect' })
  assert.equal(store.validate(flow), flow)
  assert.equal(flow.nodes.filter((node) => node.type === 'model').length, 3)
  assert.equal(flow.nodes.filter((node) => node.type === 'approve').length, 3)
  assert.deepEqual(flow.edges.filter((edge) => edge.target === 'scene-stitch').map((edge) => edge.source), ['shot-1-approve', 'shot-2-approve', 'shot-3-approve'])
  assert(flow.nodes.filter((node) => node.type === 'model').every((node) => node.data.model.id === 'comfy-ltx25' && node.data.model.workflow === 'ltx25_t2v'))
  store.save({ ...store.read(), flows: [flow], current: flow.id })
  assert.equal(JSON.parse(readFileSync(join(directory, 'flows.json'))).flows[0].id, flow.id)
  assert.equal(createFlows({ directory: () => directory }).get(flow.id).name, cinemaPlan.title, 'Standalone MCP sees the saved Flow')
  await store.perform(flow.id, 'runNew')
  assert.equal(calls.length, 3)
  assert.equal(stitches.length, 0)
  assert(calls.every((options) => options.model === 'comfy-ltx25' && options.duration === 5))
  await store.perform(flow.id, 'runNew')
  assert.equal(calls.length, 3, 'Run fills gaps without regenerating shots')
  for (let index = 1; index <= 3; index++) await store.perform(flow.id, 'send', `shot-${index}-approve`)
  assert.equal(stitches.length, 0, 'Cinema waits for an explicit Stitch even after every Send')
  await store.perform(flow.id, 'rerun', 'scene-stitch')
  assert.deepEqual(stitches[0].clips.map((clip) => clip.url), ['/media/1.mp4', '/media/2.mp4', '/media/3.mp4'])
  const old = store.engine(flow.id).state['scene-stitch'].items[0]
  const replacement = { ...cinemaPlan.shots[1], prompt: 'Replaced portal: the bricks spiral around the ring' }
  store.update(flow.id, 'shot-2', { data: { prompt: cinemaPrompt(replacement), cinemaShot: replacement } })
  await store.perform(flow.id, 'rerun', 'shot-2')
  assert.equal(calls.length, 4, 'Replacing only reruns one shot')
  assert.equal(store.engine(flow.id).gate('shot-2-approve').status, 'reviewing')
  assert.equal(store.engine(flow.id).gate('shot-1-approve').status, 'sent')
  assert.equal(store.engine(flow.id).state['scene-stitch'].items[0].stale, true)
  assert.deepEqual(store.engine(flow.id).reviewItems(flow, 'scene-output'), [], 'Stale cut is excluded from canvas results')
  assert.equal(store.read().runs[flow.id]['scene-stitch'].items[0].stale, true, 'Invalidation persists across app reloads')
  assert.equal((await store.perform(flow.id, 'rerun', 'scene-stitch')).ok, false, 'Replacement needs another approval')
  await store.perform(flow.id, 'send', 'shot-2-approve')
  assert.equal(stitches.length, 1, 'Send preserves the stale output until explicit re-stitch')
  assert.equal(store.engine(flow.id).state['scene-stitch'].items[0].url, old.url)
  await store.perform(flow.id, 'rerun', 'scene-stitch')
  assert.equal(stitches.length, 2)
  assert.equal(stitches[1].clips[1].url, '/media/replacement.mp4')
  assert(!store.engine(flow.id).state['scene-stitch'].items[0].stale)

  const framed = structuredClone(cinemaPlan)
  framed.shots[0].image = { url: '/media/start.png', name: 'Start frame' }
  const imageFlow = cinemaFlow(framed, { id: 'cinema-image' })
  store.validate(imageFlow)
  store.save({ ...store.read(), flows: [...store.read().flows, imageFlow] })
  await store.perform(imageFlow.id, 'runNew')
  const input = calls.slice(4).find((options) => options.image)
  assert.equal(input.image, '/media/start.png')
  const model = imageFlow.nodes.find((node) => node.id === 'shot-1').data.model
  assert.equal(model.imageWorkflow, 'ltx25_i2v')
  assert.equal(comfyVars(model.kind, input, model.sizes).image, input.image)
  console.log('Cinema checks ok: planner validation, edited durations/cost, catalog models, t2v/i2v inputs, disk persistence, independent gates, one-shot replacement and explicit re-stitch. No provider calls.')
} finally { global.fetch = network }
