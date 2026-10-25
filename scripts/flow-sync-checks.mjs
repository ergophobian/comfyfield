// Live canvas sync (issue #22): the event stream, the per-node last-write-wins merge, and the page's
// store client applying remote changes while it has its own edits. No keys, no network, no spend.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { createFlows } from '../server/flows.js'
import { mergeStores, cleanNode, hasEdits } from '../shared/flowMerge.js'

const directory = path.join(process.cwd(), '.comfyfield', 'flow-sync-checks', `${Date.now()}-${process.pid}`)
fs.mkdirSync(directory, { recursive: true })
const forbidden = async () => { throw new Error('No paid calls in checks') }

// Pure merge.
const node = (id, text, x = 0) => ({ id, type: 'prompt', position: { x, y: 0 }, data: { text } })
const flow = (nodes, extra = {}) => ({ id: 'f', name: 'Kites', updated: 1, nodes, edges: [], ...extra })
const store = (flows, revision = 1) => ({ revision, current: 'f', flows, runs: {} })
{
  const base = store([flow([node('a', 'A'), node('b', 'B')])])
  const remote = store([flow([node('a', 'A by agent'), node('b', 'B'), node('c', 'C by agent')])], 2)
  const local = store([flow([node('a', 'A'), { ...node('b', 'B by user'), selected: true, measured: { width: 9, height: 9 } }, node('d', 'D by user')])])
  const merged = mergeStores(base, local, remote)
  const texts = Object.fromEntries(merged.flows[0].nodes.map((n) => [n.id, n.data.text]))
  assert.deepEqual(texts, { a: 'A by agent', b: 'B by user', c: 'C by agent', d: 'D by user' }, 'edits to different nodes both survive')
  assert.equal(merged.revision, 2)
  assert.ok(hasEdits(remote, merged), 'the merged store still has edits to save')
  assert.ok(!hasEdits(base, { ...base, flows: base.flows.map((f) => ({ ...f, nodes: f.nodes.map((n) => ({ ...n, selected: true })) })) }), 'selection alone is not an edit')
}
{
  const base = store([flow([node('a', 'A'), node('b', 'B')], { edges: [{ id: 'e', source: 'a', target: 'b' }] })])
  const remote = store([flow([node('a', 'A by agent', 40), node('b', 'B by agent')], { name: 'Kites v2', edges: [{ id: 'e', source: 'a', target: 'b' }] })], 2)
  const local = store([flow([node('a', 'A by user')], { edges: [] })])
  const merged = mergeStores(base, local, remote)
  const f = merged.flows[0]
  assert.deepEqual(f.nodes.map((n) => [n.id, n.data.text, n.position.x]), [['a', 'A by user', 0]], 'the node both sides changed takes the later write whole; a node removed here stays removed')
  assert.deepEqual(f.edges, [], 'edges to removed nodes go too')
  assert.equal(f.name, 'Kites v2', 'a flow field only the remote side changed comes along')
}
{
  const base = store([flow([node('a', 'A')])])
  const remote = store([flow([node('a', 'A')]), { ...flow([]), id: 'g', name: 'New from agent' }], 2)
  const local = store([flow([node('a', 'A')], { name: 'Renamed here' })])
  const merged = mergeStores(base, local, remote)
  assert.deepEqual(merged.flows.map((f) => [f.id, f.name]), [['f', 'Renamed here'], ['g', 'New from agent']], 'flows added elsewhere appear; local renames stay')
  const untouched = mergeStores(base, base, remote)
  assert.equal(untouched.flows[0].nodes[0], base.flows[0].nodes[0], 'unchanged nodes keep their object, so the canvas does not redraw them')
}
console.log('ok    per-node merge: different nodes both survive, the later write wins a node, removals and new flows carry over')

// Server event stream: the app hears writes from a standalone MCP process through the file watcher.
{
  const events = []
  const app = createFlows({ directory: () => path.join(directory, 'watch'), generate: forbidden, changed: (e) => events.push(e) })
  const unwatch = app.watch()
  const mcp = createFlows({ directory: () => path.join(directory, 'watch'), generate: forbidden })
  mcp.create({ name: 'From a terminal', nodes: [{ id: 'p', type: 'prompt' }] })
  for (const deadline = Date.now() + 5000; !events.length && Date.now() < deadline;) await wait(50)
  unwatch()
  assert.equal(events[0]?.type, 'flows', 'a write by another process becomes a flows event')
  assert.equal(events[0].revision, 1)
  console.log('ok    the app turns flows.json writes from another process into stream events')
}

// The page's store client against a real flow service, with the event stream and fetch stubbed.
const listeners = []
const server = createFlows({ directory: () => path.join(directory, 'client'), generate: forbidden, changed: (e) => listeners.forEach((fn) => fn(e)) })
server.save({ revision: 0, current: 'f', flows: [flow([node('a', 'A', 0), node('b', 'B', 300)])] })
let puts = 0
let beforePut = null
globalThis.localStorage = { getItem: () => '1', setItem: () => {} }
globalThis.window = { addEventListener: () => {} }
globalThis.document = { addEventListener: () => {} }
globalThis.EventSource = class {
  constructor() { listeners.push((e) => this.onmessage?.({ data: JSON.stringify(e) })) }
  close() {}
}
globalThis.fetch = async (url, { method = 'GET', body } = {}) => {
  await wait(5)
  try {
    if (method === 'PUT') { puts++; const hook = beforePut; beforePut = null; await hook?.() }
    const result = method === 'PUT' ? server.save(JSON.parse(body)) : server.read()
    return { ok: true, status: 200, json: async () => result }
  } catch (e) { return { ok: false, status: e.status || 500, json: async () => ({ error: e.message }) } }
}
const client = await import('../src/lib/remoteFlows.js')
await client.initFlows({ flows: [], current: null })
const text = (s, id) => s.flows[0].nodes.find((n) => n.id === id)?.data.text
const edit = (id, value) => client.changeFlows((s) => ({ ...s, flows: s.flows.map((f) => ({ ...f, nodes: f.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, text: value } } : n) })) }))
const settle = async () => { for (let i = 0; i < 40; i++) await wait(10) }

{
  // The user edits b and has a node selected; before the save goes out, an agent edits a.
  client.changeFlows((s) => ({ ...s, flows: s.flows.map((f) => ({ ...f, nodes: f.nodes.map((n) => n.id === 'b' ? { ...n, selected: true, data: { ...n.data, text: 'B by user' } } : n) })) }))
  server.update('f', 'a', { data: { text: 'A by agent' } })
  await settle()
  const shown = client.flowSnapshot().store
  assert.equal(text(shown, 'a'), 'A by agent', 'the remote edit shows while the page has unsaved edits')
  assert.equal(text(shown, 'b'), 'B by user', 'the local edit is kept')
  await client.flushFlows()
  const saved = server.read()
  assert.deepEqual([text(saved, 'a'), text(saved, 'b')], ['A by agent', 'B by user'], 'both edits are saved')
  assert.ok(saved.flows[0].nodes.every((n) => !('selected' in n) && !('measured' in n)), 'selection never reaches the shared store')
  assert.equal(client.flowSnapshot().error, '')
}
{
  // Both write node a. The agent saves while the page's save is on the way, so the page's save is stale.
  const before = puts
  edit('a', 'A by user')
  beforePut = async () => { server.update('f', 'a', { data: { text: 'A by agent again' } }); server.update('f', 'b', { position: { x: 500, y: 0 } }) }
  await client.flushFlows()
  const saved = server.read()
  assert.equal(puts - before, 2, 'a stale save is merged and sent again, not refused')
  assert.equal(text(saved, 'a'), 'A by user', 'the later write wins the node both changed')
  assert.equal(saved.flows[0].nodes.find((n) => n.id === 'b').position.x, 500, 'the agent move of another node survives')
  assert.equal(client.flowSnapshot().ready, true, 'no conflict error is shown')
  // Then the agent writes the node again: now that is the later write, and the page shows it.
  server.update('f', 'a', { data: { text: 'A by agent last' } })
  await settle()
  assert.equal(text(client.flowSnapshot().store, 'a'), 'A by agent last')
}
console.log('ok    the page applies remote changes during its own edits, retries stale saves with a merge, and keeps selection local')
