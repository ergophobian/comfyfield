import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cinemaPlan } from './fixtures/cinema-plan.mjs'
import { cinemaCost, cinemaFlow, cinemaPrompt, validateCinemaPlan } from '../src/lib/cinema.js'
import { createFlows } from '../server/flows.js'
import { comfyVars } from '../shared/mapping.js'

const network = global.fetch
global.fetch = () => { throw new Error('Cinema unit checks must never call a provider') }
try {
  assert.deepEqual(validateCinemaPlan(JSON.stringify(cinemaPlan)), cinemaPlan)
  assert.deepEqual(validateCinemaPlan('```json\n' + JSON.stringify(cinemaPlan) + '\n```'), cinemaPlan)
  for (const value of ['', 'not json', 'null', '{}', JSON.stringify({ ...cinemaPlan, shots: [] }), JSON.stringify({ ...cinemaPlan, shots: Array(7).fill(cinemaPlan.shots[0]) })]) assert.throws(() => validateCinemaPlan(value))
  for (const invalid of [null, {}, { ...cinemaPlan.shots[0], duration: '5' }, { ...cinemaPlan.shots[0], duration: 6 }, { ...cinemaPlan.shots[0], camera: '' }, { ...cinemaPlan.shots[0], prompt: 'x'.repeat(601) }, { ...cinemaPlan.shots[0], continuity: [] }, { ...cinemaPlan.shots[0], image: { url: 'https://example.org/frame.png' } }]) {
    assert.throws(() => validateCinemaPlan({ ...cinemaPlan, shots: [invalid, ...cinemaPlan.shots.slice(1)] }))
  }
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
  const input = calls[4]
  assert.equal(input.image, '/media/start.png')
  const model = imageFlow.nodes.find((node) => node.id === 'shot-1').data.model
  assert.equal(model.imageWorkflow, 'ltx25_i2v')
  assert.equal(comfyVars(model.kind, input, model.sizes).image, input.image)
  console.log('Cinema checks ok: planner validation, edited durations/cost, catalog models, t2v/i2v inputs, disk persistence, independent gates, one-shot replacement and explicit re-stitch. No provider calls.')
} finally { global.fetch = network }
