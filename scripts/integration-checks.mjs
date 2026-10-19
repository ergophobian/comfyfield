import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { runFormat } from '../src/lib/formats/runner.js'
import { allFormats, formats } from '../src/lib/formats/index.js'
import { effects } from '../src/lib/formats/effects.js'
import { initialValues } from '../src/lib/recipes.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { validateFormat } from '../src/lib/formats/validate.js'
import { falInput, comfyVars, comfyRouterInput } from '../shared/mapping.js'
import { createFlows } from '../server/flows.js'
import { createHarness } from '../server/agent-harness.js'
import { createServer } from '../server/mcp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import research from '../research_notes/effect-specs.json' with { type: 'json' }

globalThis.fetch = () => { throw new Error('Network is forbidden in integration checks') }
const photo = { url: '/media/photo.png', ratio: '9:16' }
const valuesFor = (format) => ({ ...initialValues(format), ...Object.fromEntries(format.inputs.filter((i) => i.type === 'image').map((i) => [i.id, photo])) })
assert.equal(effects.length, research.specs.length)
assert.deepEqual(formats, allFormats.filter((format) => !validateFormat(format).length), 'Gallery contains exactly the valid catalog formats')
assert.equal(new Set(allFormats.map((format) => format.id)).size, allFormats.length, 'Every catalog id is unique')
for (const [i, format] of effects.entries()) {
  assert.equal(format.steps[0].instructions, research.specs[i].writer_instructions)
  assert.deepEqual(validateFormat(format), [])
  for (const renderer of ['ltx', 'fal', 'router']) {
    const calls = []
    const values = { ...valuesFor(format), renderer, note: 'Keep the blue coat' }
    const session = await runFormat(format, values, {
      writePrompt: async (input) => {
        assert.equal(input.instructions, research.specs[i].writer_instructions)
        assert.equal(input.note, values.note)
        assert.equal(input.images.length, format.inputs.filter((slot) => slot.type === 'image').length)
        return 'Mock written prompt'
      },
      run: async (model, opts, metadata) => { calls.push({ model, opts, metadata }); return [{ url: '/media/result.mp4', kind: 'video' }] },
    })
    assert.equal(calls.length, 0, 'Writer must hold rendering')
    const restored = structuredClone(session.engine.state)
    session.engine.load(restored)
    session.engine.editWriter(session.flow, 'writer', 'Reviewed and edited prompt')
    await session.sendWriter('writer')
    assert.equal(calls.length, 1)
    const { model, opts, metadata } = calls[0]
    assert.equal(opts.prompt, 'Reviewed and edited prompt')
    assert.equal(opts.images[0], photo.url)
    assert.equal(metadata.formatId, format.id)
    if (renderer === 'ltx') {
      assert.equal(model.workflow, 'ltx25_i2v')
      const vars = comfyVars('video', opts)
      assert.equal(vars.image, photo.url)
      assert.equal(vars.width % 32, 0)
      assert.equal((vars.frames - 1) % 8, 0)
    } else if (renderer === 'fal') {
      assert.equal(model.provider, 'fal')
      assert.equal(falInput(schemas.fal[model.model].properties, opts).image_url, photo.url)
    } else {
      assert.equal(model.provider, 'comfyRouter')
      assert.equal(comfyRouterInput(model.model, opts).content[1].image_url.url, photo.url)
    }
    await session.engine.runNew(session.flow)
    await session.sendWriter('writer')
    assert.equal(calls.length, 1, 'Run and repeated Send preserve rendered output')
  }
}
console.log('ok    all 45 effect chains, three rendering choices, unchanged instructions, editable review gates and provider payloads')

const inpaint = allFormats.find((f) => f.id === 'inpaint')
const faceSwap = allFormats.find((f) => f.id === 'face-swap')
for (const [format, values, expected] of [
  [inpaint, { image: { ...photo, maskUrl: '/media/mask.png' }, change: 'A bowl of lemons' }, { image_url: photo.url, mask_url: '/media/mask.png' }],
  [faceSwap, { photo, character: { ...photo, name: 'Selected face', faceUrl: '/media/face.png' } }, { image_urls: [photo.url, '/media/face.png'] }],
]) {
  let mapped
  await runFormat(format, values, { run: async (model, opts) => {
    assert.deepEqual(opts.inputs, Object.fromEntries(format.inputs.filter((i) => ['mask', 'face'].includes(i.type)).map((i) => [i.id, values[i.id]])))
    mapped = falInput(schemas.fal[model.model].properties, opts)
    return [{ url: '/media/result.png', kind: 'image' }]
  } })
  for (const [key, value] of Object.entries(expected)) assert.deepEqual(mapped[key], value)
}
const trim = { start: 1, end: 3 }
const crop = { x: 0.1, y: 0, width: 0.8, height: 1 }
assert.deepEqual(falInput({ video_url: {}, start_time: {}, end_time: {}, crop: {} }, { video: '/media/clip.mp4', trim, crop }), { video_url: '/media/clip.mp4', start_time: 1, end_time: 3, crop })
console.log('ok    inpaint mask, selected face, trim and crop mapping')

const directory = fs.mkdtempSync(path.resolve('outputs/integration-check-'))
const saved = []
const stitched = []
const adapters = {
  directory: () => directory,
  generate: async (input) => { saved.push(input); return [{ kind: 'video', url: '/media/render.mp4' }] },
  writePrompt: async () => 'Server writer output',
  stitch: async (input) => { stitched.push(input); return { kind: 'video', url: '/media/stitched.mp4' } },
}
const node = (id, type, data = {}) => ({ id, type, data, position: { x: 0, y: 0 } })
const edge = (source, target) => ({ id: `${source}-${target}`, source, target })
const widgetValues = {
  mask: { ...photo, maskUrl: '/media/mask.png' },
  face: { ...photo, faceUrl: '/media/face.png' },
  video: { url: '/media/clip.mp4', duration: 4, trim, posterUrl: '/media/poster.png' },
  crop: { ...photo, aspect: '9:16', box: crop },
}
const flow = { id: 'integration', name: 'Writer to Stitch', nodes: [
  node('writer', 'writer', { instructions: 'Describe the references' }),
  node('model', 'model', { model: { id: 'comfy-ltx', kind: 'video' } }),
  node('stitch', 'stitch'),
  ...Object.entries(widgetValues).map(([type, value]) => node(type, type, { value })),
], edges: [edge('writer', 'model'), edge('model', 'stitch'), ...Object.keys(widgetValues).map((type) => edge(type, 'model'))] }
let flows = createFlows(adapters)
flows.save({ revision: 0, current: flow.id, flows: [flow] })
await flows.perform(flow.id, 'runNew')
assert.equal(saved.length, 0)
await flows.perform(flow.id, 'editWriter', 'writer', 'User edited on server')
flows = createFlows(adapters)
assert.equal(flows.engine(flow.id).state.writer.items[0].text, 'User edited on server')
assert.deepEqual(flows.get(flow.id).nodes.find((n) => n.id === 'video').data.value, widgetValues.video)
await flows.perform(flow.id, 'sendWriter', 'writer')
assert.equal(saved.length, 1)
assert.equal(saved[0].prompt, 'User edited on server')
assert.deepEqual(saved[0].inputs, widgetValues)
assert.equal(stitched.length, 1)
assert.equal(stitched[0].preview, true)
await flows.perform(flow.id, 'runNew')
assert.equal(saved.length, 1)
assert.equal(stitched.length, 1)
const handlers = new Map()
const mcp = createServer({ handlers, flowService: flows })
for (const name of ['stitch', 'export_stitch', 'list_flows', 'get_flow', 'add_node', 'connect_nodes', 'update_node', 'run_flow']) assert(handlers.has(name))
const added = await handlers.get('add_node')({ flow_id: flow.id, type: 'writer', data: { instructions: 'MCP writer' } })
assert(!added.isError)
await mcp.close()
const client = new Client({ name: 'integration-check', version: '1' })
try {
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ['bin/comfyfield.js', 'mcp'], env: { COMFYFIELD_HOME: path.join(directory, 'stdio') }, stderr: 'pipe' }))
  const { tools } = await client.listTools()
  for (const name of ['stitch', 'export_stitch', 'list_flows', 'get_flow', 'add_node', 'connect_nodes', 'update_node', 'run_flow']) assert(tools.some((tool) => tool.name === name))
} finally { await client.close() }
console.log('ok    server Writer edits and widget inputs survive restart, downstream Stitch runs once, combined MCP accepts new nodes')

let finish
const harness = createHarness({ ...adapters,
  directory: () => path.join(directory, 'harness'),
  setup: () => [{ id: 'fake', available: true }],
  adapters: { fake: async () => ({ send: () => new Promise((resolve) => { finish = resolve }), stop: async () => finish?.() }) },
})
harness.flows.save({ revision: 0, current: 'writer-only', flows: [{ id: 'writer-only', name: 'Review prompt', nodes: [node('w', 'writer', { instructions: 'Paid writer' })], edges: [] }] })
const session = await harness.start('fake', 'http://127.0.0.1:1')
await harness.send(session.id, 'Write a prompt')
await Promise.resolve()
const planned = new Promise((resolve) => harness.subscribe((event) => { if (event.type === 'plan') resolve(event.plan) }))
const call = harness.call(session.id, 'run_flow', { flow_id: 'writer-only' })
const plan = await planned
assert(plan)
assert.equal(plan.usd, null, 'Unknown writer cost requires explicit approval')
assert.equal(harness.flows.engine('writer-only').state.w, undefined)
harness.decide(session.id, plan.id, true)
await call
assert.equal(harness.flows.engine('writer-only').state.w.sent, false)
await harness.close()
console.log('ok    agent flow plans include Writer cost, approval precedes writing, and output remains held for review')
console.log('All cross-lane integration checks passed. No keys or provider calls.')
