// MCP flow tools and server flow storage. Generation is mocked: no keys are read and nothing is spent.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createFlows } from '../server/flows.js'
import { createServer } from '../server/mcp.js'
import { connectionProblem } from '../shared/flowRules.js'

const directory = path.join(process.cwd(), '.comfyfield', 'flow-mcp-checks', `${Date.now()}-${process.pid}`)
fs.mkdirSync(directory, { recursive: true })
const dir = (name) => () => path.join(directory, name)
let spent = 0
const generate = async ({ prompt }) => { spent++; return [{ kind: 'image', url: `/media/mock-${spent}.png`, prompt }] }
const forbidden = async () => { throw new Error('No paid calls in checks') }

// Storage round trip: a second store on the same folder (the standalone MCP server) sees the same flows.
const app = createFlows({ directory: dir('shared'), generate })
const made = app.create({ name: 'Round trip', nodes: [{ id: 'p', type: 'prompt', data: { text: 'A kite' } }, { id: 'm', type: 'model', data: { model: 'comfy-flux' } }], edges: [{ source: 'p', target: 'm' }] })
const mcpSide = createFlows({ directory: dir('shared'), generate: forbidden })
assert.deepEqual(mcpSide.get(made.id), app.get(made.id))
assert.equal(mcpSide.get(made.id).nodes[1].data.model.id, 'comfy-flux')
assert.equal(mcpSide.get(made.id).nodes[1].data.takes, 1, 'MCP nodes get the canvas defaults')
assert.equal(mcpSide.read().current, made.id, 'the first flow becomes current')
const raw = JSON.parse(fs.readFileSync(path.join(directory, 'shared', 'flows.json'), 'utf8'))
assert.equal(raw.flows[0].id, made.id)
await app.perform(made.id, 'runNew')
assert.equal(mcpSide.engine(made.id).state.m.items[0].url, '/media/mock-1.png', 'run state written by one process is read by the other')
console.log('ok    flows round-trip through flows.json and both processes share run state')

// Legacy migration: browser-only flows move to the server with their results, once, without overwriting.
const legacyFlow = { id: 'legacy1', name: 'From this browser', updated: 1, nodes: [{ id: 'p', type: 'prompt', position: { x: 0, y: 0 }, data: { text: 'Old' } }, { id: 'm', type: 'model', position: { x: 300, y: 0 }, data: { model: { id: 'comfy-flux', kind: 'image' }, takes: 1 } }], edges: [{ id: 'p-m', source: 'p', target: 'm' }] }
const legacyRuns = { legacy1: { m: { items: [{ id: 'm:0||0#0', unit: '0||0', status: 'done', url: '/media/old.png' }, { id: 'x', status: 'pending' }], running: 2 } } }
const local = new Map([['comfyfield.flows', JSON.stringify({ flows: [legacyFlow, { ...legacyFlow, id: made.id, name: 'Stale copy' }], current: 'legacy1' })], [`comfyfield.flowrun.legacy1`, JSON.stringify(legacyRuns.legacy1)]])
globalThis.localStorage = { getItem: (k) => local.get(k) ?? null, setItem: (k, v) => local.set(k, String(v)) }
globalThis.window = { addEventListener: () => {} }
globalThis.document = { addEventListener: () => {} }
globalThis.EventSource = class { close() {} }
globalThis.fetch = async (url, { method = 'GET', body } = {}) => {
  try {
    const result = method === 'PUT' ? app.save(JSON.parse(body)) : app.read()
    return { ok: true, json: async () => result }
  } catch (e) { return { ok: false, json: async () => ({ error: e.message }) } }
}
const { loadFlows } = await import('../src/lib/flowStore.js')
const { initFlows } = await import('../src/lib/remoteFlows.js')
await initFlows(loadFlows())
let store = app.read()
assert.deepEqual(store.flows.map((f) => f.id), [made.id, 'legacy1'], 'legacy flows are added, server copies win')
assert.equal(store.flows[0].name, 'Round trip')
assert.deepEqual(store.runs.legacy1.m.items.map((i) => i.url), ['/media/old.png'], 'kept results come along, pending ones do not')
assert.equal(store.runs.legacy1.m.running, 0)
assert.equal(local.get('comfyfield.flows.migrated'), '1')
assert.ok(local.get('comfyfield.flows'), 'the browser copy stays as a fallback')
console.log('ok    browser-only flows migrate once with their results and never overwrite server flows')

// Every MCP tool: happy path and a validation error that says what to fix.
const flows = createFlows({ directory: dir('mcp'), generate })
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
const server = createServer({ flowService: flows })
const client = new Client({ name: 'flow-mcp-checks', version: '1' })
await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
const call = async (name, args) => {
  const result = await client.callTool({ name, arguments: args })
  const text = result.content.map((c) => c.text).join('\n')
  return result.isError ? { error: text } : JSON.parse(text)
}
const tools = (await client.listTools()).tools.map((t) => t.name)
for (const name of ['list_flows', 'get_flow', 'create_flow', 'add_node', 'connect_nodes', 'update_node', 'remove_node', 'run_flow']) assert.ok(tools.includes(name), name)

assert.match((await call('create_flow', { name: '  ' })).error, /Give the flow a name/)
assert.match((await call('create_flow', { name: 'Bad', nodes: [{ id: 'p', type: 'prompt' }], edges: [{ source: 'p', target: 'q' }] })).error, /no node "q".*Its node ids are: p/)
const flow = await call('create_flow', { name: 'Agent built' })
assert.equal(flow.name, 'Agent built')

assert.deepEqual((await call('list_flows', {})).map((f) => f.id), [flow.id])
assert.match((await call('get_flow', { flow_id: 'nope' })).error, new RegExp(`No flow "nope". Flow ids: ${flow.id} \\(Agent built\\)`))

const prompt = await call('add_node', { flow_id: flow.id, id: 'p', type: 'prompt', data: { text: 'A red kite over dunes' } })
const model = await call('add_node', { flow_id: flow.id, id: 'img', type: 'model', data: { model: 'comfy-flux', takes: 2 } })
assert.equal(model.data.model.name, 'FLUX')
assert.equal(model.position.x, prompt.position.x + 340, 'new nodes line up to the right')
await call('add_node', { flow_id: flow.id, id: 'gate', type: 'approve' })
await call('add_node', { flow_id: flow.id, id: 'vid', type: 'model', data: { model: 'comfy-flux', prompt: 'Next step' } })
await call('add_node', { flow_id: flow.id, id: 'out', type: 'output' })
const unknown = await call('add_node', { flow_id: flow.id, type: 'sticker' })
assert.match(unknown.error, /prompt/)
assert.match(unknown.error, /approve/)
assert.match((await call('add_node', { flow_id: flow.id, id: 'p', type: 'note' })).error, /already has a node "p"/)
assert.match((await call('add_node', { flow_id: flow.id, type: 'model', data: { model: 'not-a-model' } })).error, /Unknown model not-a-model. Use list_models/)
assert.match((await call('add_node', { flow_id: flow.id, type: 'model', data: { takes: 40 } })).error, /data.takes to a whole number from 1 to 20/)

for (const [source, target] of [['p', 'img'], ['img', 'gate'], ['gate', 'vid'], ['vid', 'out']]) await call('connect_nodes', { flow_id: flow.id, source, target })
assert.match((await call('connect_nodes', { flow_id: flow.id, source: 'p', target: 'gate' })).error, /Prompt node can only feed a Model or Writer/)
assert.match((await call('connect_nodes', { flow_id: flow.id, source: 'out', target: 'vid' })).error, /Output node "out" has no output. Connect from one of: prompt, image/)
assert.match((await call('connect_nodes', { flow_id: flow.id, source: 'img', target: 'p' })).error, /Prompt node "p" has no input. Connect into one of: writer, model/)
assert.match((await call('connect_nodes', { flow_id: flow.id, source: 'vid', target: 'img' })).error, /would make a loop/)
assert.match((await call('connect_nodes', { flow_id: flow.id, source: 'p', target: 'img' })).error, /already connects/)
assert.match((await call('connect_nodes', { flow_id: flow.id, source: 'p', target: 'ghost' })).error, /no node "ghost". Its node ids are: p, img, gate, vid, out/)

const updated = await call('update_node', { flow_id: flow.id, node_id: 'p', data: { mode: 'rows', text: 'A red kite\nA blue kite' }, position: { x: 10, y: 20 } })
assert.equal(updated.data.mode, 'rows')
assert.deepEqual(updated.position, { x: 10, y: 20 })
assert.match((await call('update_node', { flow_id: flow.id, node_id: 'nope', data: {} })).error, /no node "nope"/)

await call('add_node', { flow_id: flow.id, id: 'memo', type: 'note', data: { text: 'Remove me' } })
await call('connect_nodes', { flow_id: flow.id, source: 'img', target: 'out' })
const removed = await call('remove_node', { flow_id: flow.id, node_id: 'memo' })
assert.equal(removed.removed, 'memo')
assert.match((await call('remove_node', { flow_id: flow.id, node_id: 'memo' })).error, /no node "memo"/)

// run_flow fills gaps and stops at the Approve gate; only the user can Send.
const run = await call('run_flow', { flow_id: flow.id })
assert.equal(run.ran, 4, 'two prompt rows times two takes')
assert.deepEqual(run.waiting_for_send, ['gate'])
assert.match(run.next[0], /press Send in Flows/)
assert.equal(run.outputs.img.length, 4)
assert.equal(run.outputs.vid, undefined, 'nothing passes the gate before Send')
const again = await call('run_flow', { flow_id: flow.id })
assert.equal(again.ran, 0, 'Run fills gaps only')
assert.equal(spent, 5)
const state = (await call('get_flow', { flow_id: flow.id })).state
assert.equal(state.gate.status, 'reviewing')
assert.match((await call('run_flow', { flow_id: 'nope' })).error, /No flow "nope"/)
const removedModel = await call('remove_node', { flow_id: flow.id, node_id: 'img' })
assert.deepEqual(removedModel.edges_removed.sort(), ['img-gate', 'img-out', 'p-img'])
assert.equal(flows.engine(flow.id).state.img, undefined, 'a removed node takes its results with it')
await client.close()
await server.close()
console.log('ok    every MCP flow tool works and each validation error names the fix')

// The canvas uses the same rule, so a connection the app refuses gives the same reason through MCP.
const canvas = { name: 'Canvas', nodes: [{ id: 'a', type: 'note' }, { id: 'b', type: 'model' }], edges: [] }
assert.match(connectionProblem(canvas, 'a', 'b'), /no output/)
assert.equal(connectionProblem({ ...canvas, nodes: [{ id: 'a', type: 'image' }, canvas.nodes[1]] }, 'a', 'b'), null)
console.log('ok    canvas and MCP share one connection rule')

fs.rmSync(directory, { recursive: true, force: true })
console.log('all flow MCP checks passed; no paid calls')
