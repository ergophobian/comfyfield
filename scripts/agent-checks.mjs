import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { PassThrough } from 'node:stream'
import { EventEmitter } from 'node:events'
import { createServer as httpServer } from 'node:http'
import { createHarness } from '../server/agent-harness.js'
import { createFlows } from '../server/flows.js'
import { createServer } from '../server/mcp.js'
import { claudeAdapter, codexAdapter } from '../server/agent-adapters.js'
import { agentRoutes } from '../server/agent-routes.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { falEndpointFor } from '../shared/mapping.js'
import * as core from '../server/core.js'

// Keep fixtures in the ignored local store, never use provider configuration or keys.
const directory = path.join(process.cwd(), '.comfyfield', 'agent-checks', `${Date.now()}-${process.pid}`)
fs.mkdirSync(directory, { recursive: true })
const falModel = { provider: 'fal', model: 'mock/text-to-video', name: 'Mock video' }
const schemaRequests = []
const schema = async (id) => { schemaRequests.push(id); return { properties: id.endsWith('image-to-video') ? { image_url: {} } : {} } }
assert.equal(await falEndpointFor(falModel, true, schema), 'mock/image-to-video')
assert.deepEqual(schemaRequests, ['mock/text-to-video', 'mock/image-to-video'])
assert.equal(await falEndpointFor(falModel, false, () => { throw new Error('Unexpected schema lookup') }), falModel.model)
const originalFetch = globalThis.fetch
const originalHome = process.env.COMFYFIELD_HOME
try {
  process.env.COMFYFIELD_HOME = path.join(directory, 'provider-parity')
  core.saveConnection('google', { key: 'mock-google-not-a-key' })
  let payload
  globalThis.fetch = async (url, options) => {
    assert.ok(url.includes(':generateContent'))
    payload = JSON.parse(options.body)
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'ZmFrZQ==' } }] } }] }) }
  }
  await core.generate({ model: 'g-nano-banana-2', prompt: 'Use this reference', image: 'data:image/png;base64,cmVmZXJlbmNl' })
  assert.equal(payload.contents[0].parts[0].inlineData.data, 'cmVmZXJlbmNl')
} finally {
  globalThis.fetch = originalFetch
  if (originalHome === undefined) delete process.env.COMFYFIELD_HOME
  else process.env.COMFYFIELD_HOME = originalHome
}
console.log('ok    server generation preserves reference routing for fal and Google, with mocked transport')
let generated = 0
const generate = async () => { generated++; return [{ kind: 'image', url: '/media/fake.png' }] }
const estimate = async () => ({ usd: 0.004, approx: true })
const text = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data) }] })
const model = { id: 'comfy-flux', kind: 'image', name: 'Test model' }
const node = (id, type, data = {}) => ({ id, type, position: { x: 0, y: 0 }, data })
const flow = {
  id: 'test', name: 'Approval flow', nodes: [node('p', 'prompt', { text: 'A paper boat' }), node('m', 'model', { model, kind: 'image', takes: 1 }), node('a', 'approve'), node('v', 'model', { model, kind: 'image', prompt: 'Animate' })],
  edges: [{ id: 'pm', source: 'p', target: 'm' }, { id: 'ma', source: 'm', target: 'a' }, { id: 'av', source: 'a', target: 'v' }],
}
let adapterOptions
let finish
const harness = createHarness({
  directory: () => directory, generate, estimate,
  setup: () => [{ id: 'fake', available: true }],
  adapters: { fake: async (options) => {
    adapterOptions = options
    return { send: async () => new Promise((resolve) => { finish = resolve }), stop: async () => finish?.() }
  } },
  handlers: { generate: async (args) => text(await generate(args)), write_prompts: async () => text({ prompts: ['Fake prompt'] }) },
})
const events = []
harness.subscribe((event) => events.push(event))
harness.flows.save({ revision: 0, flows: [flow], current: flow.id })
assert.throws(() => harness.flows.save({ revision: 0, flows: [flow], current: flow.id }), /changed elsewhere/)
assert.throws(() => harness.flows.connect(flow.id, { source: 'v', target: 'm' }), /loop/)
assert.throws(() => harness.flows.connect(flow.id, { source: 'p', target: 'a' }), /Invalid connection/)
const restored = createFlows({ directory: () => directory, generate })
assert.deepEqual(restored.get(flow.id), flow)
console.log('ok    shared flow persistence, conflict detection and connection validation')

let releaseGeneration
const lockedFlows = createFlows({ directory: () => path.join(directory, 'locked'), generate: () => new Promise((resolve) => { releaseGeneration = resolve }) })
lockedFlows.save({ revision: 0, current: flow.id, flows: [flow] })
const lockedRun = lockedFlows.perform(flow.id, 'runNew')
const selectedStore = lockedFlows.read()
selectedStore.flows[0].nodes[0].selected = true
selectedStore.flows[0].updated = Date.now()
lockedFlows.save(selectedStore)
assert.throws(() => lockedFlows.update(flow.id, 'p', { data: { text: 'Changed while running' } }), /finish/)
releaseGeneration([{ kind: 'image', url: '/media/locked-fake.png' }])
await lockedRun
console.log('ok    running flows permit selection but refuse definition changes')

await assert.rejects(harness.start('missing', 'http://localhost:5173'), /Install/)
const session = await harness.start('fake', 'http://localhost:5173')
assert.equal(adapterOptions.mcp.command, process.execPath)
assert.match(adapterOptions.mcp.args[0], /agent-mcp.js$/)
assert.ok(harness.authorize(session.id, `Bearer ${adapterOptions.mcp.args[2]}`))
assert.equal(harness.authorize(session.id, 'Bearer invalid'), false)
await harness.send(session.id, 'Build a flow')
await assert.rejects(harness.send(session.id, 'Another turn'), /Wait/)
await new Promise(setImmediate)
adapterOptions.emit({ type: 'message', text: 'I will prepare a flow.' })
const added = await harness.call(session.id, 'add_node', { flow_id: flow.id, type: 'note', data: { text: 'Draft' }, position: { x: 32, y: 40 } })
await harness.call(session.id, 'update_node', { flow_id: flow.id, node_id: added.id, data: { text: 'Updated' } })
assert.equal(harness.flows.get(flow.id).nodes.at(-1).data.text, 'Updated')
assert.ok(events.some((e) => e.type === 'presence' && e.nodeId === added.id))
assert.ok(events.some((e) => e.type === 'message' && e.text.includes('prepare')))
console.log('ok    adapter session, message events, MCP attachment and canvas presence')

const waitPlan = async () => {
  for (let i = 0; i < 100; i++) {
    const plan = harness.get(session.id).plans[0]
    if (plan) return plan
    await new Promise(setImmediate)
  }
  throw new Error('Expected an approval plan')
}
let call = harness.call(session.id, 'generate', { model: model.id, prompt: 'A paper boat' })
let plan = await waitPlan()
assert.equal(generated, 0)
assert.equal(plan.usd, 0.004)
harness.decide(session.id, plan.id, true)
await call
assert.equal(generated, 1)
assert.throws(() => harness.decide(session.id, plan.id, true), /no longer/)
call = harness.call(session.id, 'generate', { model: model.id, prompt: 'A different boat' })
const rejected = assert.rejects(call, /rejected/)
plan = await waitPlan()
harness.decide(session.id, plan.id, false)
await rejected
assert.equal(generated, 1)
call = harness.call(session.id, 'write_prompts', { idea: 'A boat' })
plan = await waitPlan()
assert.equal(plan.usd, null)
harness.decide(session.id, plan.id, true)
await call
console.log('ok    generation waits, one-shot approval, rejection and paid prompt guard')

call = harness.call(session.id, 'run_flow', { flow_id: flow.id })
plan = await waitPlan()
assert.equal(plan.steps.length, 1)
assert.equal(generated, 1)
harness.flows.update(flow.id, 'p', { data: { text: 'Changed after planning' } })
const stale = assert.rejects(call, /flow changed/)
harness.decide(session.id, plan.id, true)
await stale
assert.equal(generated, 1)
call = harness.call(session.id, 'run_flow', { flow_id: flow.id })
plan = await waitPlan()
harness.decide(session.id, plan.id, true)
await call
assert.equal(generated, 2)
assert.equal(harness.flows.engine(flow.id).state.a.status, 'reviewing')
assert.equal(harness.flows.engine(flow.id).state.v, undefined)
assert.equal(restored.engine(flow.id).state.m.items[0].status, 'done')
await harness.flows.perform(flow.id, 'send', 'a')
assert.equal(generated, 3)
await harness.flows.perform(flow.id, 'runNew')
assert.equal(generated, 3)
console.log('ok    stale plans refused, server execution preserves gate and fills-gap rules')

call = harness.call(session.id, 'generate', { model: model.id, prompt: 'Never submit' })
const stopped = assert.rejects(call, /Session stopped/)
await waitPlan()
await harness.stop(session.id)
await stopped
await assert.rejects(harness.call(session.id, 'list_flows', {}), /Session stopped/)
assert.equal(harness.get(session.id).plans.length, 0)
assert.equal(generated, 3)
console.log('ok    stop cancels approvals and blocks subsequent tools')

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
const mcp = createServer({ flowService: harness.flows })
const client = new Client({ name: 'agent-checks', version: '1' })
await Promise.all([mcp.connect(serverTransport), client.connect(clientTransport)])
const tools = (await client.listTools()).tools.map((t) => t.name)
for (const name of ['generate', 'list_flows', 'get_flow', 'add_node', 'connect_nodes', 'update_node', 'run_flow']) assert.ok(tools.includes(name))
const result = await client.callTool({ name: 'list_flows', arguments: {} })
assert.equal(JSON.parse(result.content[0].text)[0].id, flow.id)
const invalid = await client.callTool({ name: 'add_node', arguments: { flow_id: flow.id, type: 'unknown' } }).catch((e) => ({ isError: true }))
assert.equal(invalid.isError, true)
await client.close()
await mcp.close()
console.log('ok    MCP protocol discovers and invokes shared flow tools, validates input')

let claudeOptions
const claudeEvents = []
let interrupted = false
const claude = await claudeAdapter({ emit: (e) => claudeEvents.push(e), mcp: { command: 'mock' }, loadSdk: async () => ({ query: (options) => {
  claudeOptions = options
  return { interrupt: async () => { interrupted = true }, async *[Symbol.asyncIterator]() {
    yield { type: 'assistant', session_id: 'fake-claude-session', message: { content: [{ type: 'text', text: 'Hello' }, { type: 'tool_use', name: 'mcp__comfyfield__list_flows' }] } }
  } }
} }) })
await claude.send('Hello')
assert.deepEqual(claudeOptions.options.tools, [])
assert.equal(claudeOptions.options.mcpServers.comfyfield.command, 'mock')
await claude.send('Continue')
assert.equal(claudeOptions.options.resume, 'fake-claude-session')
assert.ok(claudeEvents.some((e) => e.type === 'tool'))
await claude.stop()
assert.equal(interrupted, true)
console.log('ok    Claude SDK adapter resumes, normalizes events and interrupts')

const requests = []
const codexEvents = []
let launchArgs
const codex = await codexAdapter({ emit: (e) => codexEvents.push(e), mcp: { command: 'mock', args: ['bridge'] }, command: { command: 'mock-codex', args: [] }, launch: (command, args) => {
  launchArgs = args
  const child = new EventEmitter()
  child.stdout = new PassThrough()
  child.stderr = new PassThrough()
  child.stdin = { write: (line) => {
    const request = JSON.parse(line)
    requests.push(request)
    if (!request.method || request.id == null) return
    queueMicrotask(() => {
      const result = request.method === 'thread/start' ? { thread: { id: 'fake-thread' } } : {}
      child.stdout.write(`${JSON.stringify({ id: request.id, result })}\n`)
      if (request.method === 'turn/start') {
        child.stdout.write(`${JSON.stringify({ method: 'item/started', params: { item: { type: 'mcpToolCall', tool: 'list_flows' } } })}\n`)
        child.stdout.write(`${JSON.stringify({ id: 999, method: 'item/commandExecution/requestApproval', params: {} })}\n`)
        child.stdout.write(`${JSON.stringify({ method: 'item/completed', params: { item: { type: 'agentMessage', text: 'Hello from Codex' } } })}\n`)
        child.stdout.write(`${JSON.stringify({ method: 'turn/completed', params: { turn: { status: 'completed' } } })}\n`)
      }
    })
  } }
  child.kill = () => child.emit('exit', 0)
  return child
} })
await codex.send('Hello')
assert.ok(launchArgs.some((v) => v.includes('mcp_servers=') && v.includes('comfyfield')))
assert.equal(requests.find((r) => r.method === 'thread/start').params.sandbox, 'read-only')
assert.equal(requests.find((r) => r.id === 999).result.decision, 'decline')
assert.ok(codexEvents.some((e) => e.type === 'message' && e.text === 'Hello from Codex'))
await codex.stop()
console.log('ok    Codex handshake, MCP configuration, events and denied shell approvals')

const route = agentRoutes({ harness, body: async (req) => req.data, send: (res, status, data) => Object.assign(res, { status, data }) })
const res = {}
await route({ method: 'GET', headers: { host: 'localhost:5173' } }, res, new URL('http://localhost/api/agents/setup'))
assert.equal(res.status, 200)
await assert.rejects(route({ method: 'POST', headers: { host: 'localhost:5173', origin: 'https://other.example' } }, {}, new URL('http://localhost/api/agents')), /local ComfyField/)
await assert.rejects(route({ method: 'POST', headers: { host: 'other.example' } }, {}, new URL('http://localhost/api/agents')), /localhost only/)
await assert.rejects(route({ method: 'POST', headers: { host: 'localhost:5173' } }, {}, new URL(`http://localhost/api/agents/${session.id}/tool`)), /token/)
console.log('ok    local routes reject cross-origin calls, remote hosts and invalid bridge tokens')

const networkRoute = agentRoutes({ harness, body: async (req) => {
  let raw = ''
  for await (const chunk of req) raw += chunk
  return JSON.parse(raw || '{}')
}, send: (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)) } })
const http = httpServer(async (req, res) => {
  try { await networkRoute(req, res, new URL(req.url, 'http://localhost')) } catch (e) {
    res.writeHead(e.status || 500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: e.message }))
  }
})
await new Promise((resolve) => http.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${http.address().port}`
const post = async (url, data) => {
  const res = await fetch(`${origin}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  assert.equal(res.status, 200, await res.clone().text())
  return res.json()
}
let stream
let bridgeClient
try {
  const session = await post('/api/agents', { adapter: 'fake' })
  stream = (await fetch(`${origin}/api/agents/events`)).body.getReader()
  await stream.read()
  await post(`/api/agents/${session.id}/message`, { text: 'Exercise the real bridge' })
  bridgeClient = new Client({ name: 'bridge-checks', version: '1' })
  await bridgeClient.connect(new StdioClientTransport({ command: process.execPath, args: adapterOptions.mcp.args }))
  const list = await bridgeClient.callTool({ name: 'list_flows', arguments: {} })
  assert.equal(JSON.parse(list.content[0].text)[0].id, flow.id)
  const waiting = bridgeClient.callTool({ name: 'generate', arguments: { model: model.id, prompt: 'A bridge test' } })
  let plan
  for (let i = 0; i < 100 && !plan; i++) {
    plan = harness.get(session.id).plans[0]
    if (!plan) await new Promise((resolve) => setTimeout(resolve, 10))
  }
  assert.ok(plan)
  await post(`/api/agents/${session.id}/approve`, { planId: plan.id, approved: true })
  const result = await waiting
  assert.equal(result.isError, undefined)
  assert.equal(generated, 4)
  const chunk = new TextDecoder().decode((await stream.read()).value)
  assert.match(chunk, /data:.*"type"/)
  await post(`/api/agents/${session.id}/stop`, {})
  const blocked = await bridgeClient.callTool({ name: 'list_flows', arguments: {} })
  assert.equal(blocked.isError, true)
} finally {
  await bridgeClient?.close()
  await stream?.cancel()
  await networkRoute.close()
  http.closeAllConnections()
  await new Promise((resolve) => http.close(resolve))
}
console.log('ok    real HTTP/SSE and stdio MCP bridge carry fake adapter tools through approval')

const endingSession = await harness.start('fake', 'http://localhost:5173')
await harness.send(endingSession.id, 'End before approval')
await new Promise(setImmediate)
const endingCall = harness.call(endingSession.id, 'generate', { model: model.id, prompt: 'Expired plan' })
const ended = assert.rejects(endingCall, /turn ended/)
await new Promise(setImmediate)
assert.equal(harness.get(endingSession.id).plans.length, 1)
finish()
await ended
assert.equal(harness.get(endingSession.id).plans.length, 0)
assert.equal(generated, 4)
await harness.close()
console.log('ok    an ended agent turn invalidates pending approvals without spending')
console.log('all agent checks passed; no paid calls')
