// Assigning agents to flows and nodes (issue #24): stored in the flow, merged per node like any edit,
// and returned to the calling agent by the my_tasks MCP tool. No keys, no provider calls.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createFlows } from '../server/flows.js'
import { createPresence } from '../server/presence.js'
import { createServer } from '../server/mcp.js'
import { rosterOf, tasksFor, colorOf } from '../shared/agentRoster.js'
import { mergeStores } from '../shared/flowMerge.js'

const root = path.join(process.cwd(), '.comfyfield', 'agent-assign-checks', `${Date.now()}-${process.pid}`)
fs.mkdirSync(root, { recursive: true })
const dir = () => root
const forbidden = async () => { throw new Error('No paid calls in checks') }
const flows = createFlows({ directory: dir, generate: forbidden })
const presence = createPresence({ directory: dir })

const a = flows.create({ name: 'Trailer', nodes: [{ id: 'p', type: 'prompt', data: { text: 'A lighthouse in a storm' } }, { id: 'm', type: 'model', data: { model: 'comfy-flux' } }], edges: [{ source: 'p', target: 'm' }] })
const b = flows.create({ name: 'Poster', nodes: [{ id: 'w', type: 'writer', data: { instructions: 'Write a tagline' } }, { id: 'n', type: 'note' }] })

// Storage and validation.
flows.assign(a.id, null, 'Agent 1')
flows.assign(b.id, 'w', 'Agent 2')
assert.equal(flows.get(a.id).assignee, 'Agent 1', 'a whole flow is assigned in the flow data')
assert.equal(flows.get(b.id).nodes[0].assignee, 'Agent 2', 'a node is assigned in the flow data')
assert.throws(() => flows.assign(b.id, 'nope', 'Agent 2'), /no node "nope"/)
assert.throws(() => flows.assign(b.id, 'w', '   '), /Name the agent/)
const bad = flows.read()
bad.flows[0].nodes[0].assignee = 42
assert.throws(() => flows.save(bad), /assignee/)
flows.assign(b.id, 'n', 'Agent 2')
flows.assign(b.id, 'n', null)
assert.ok(!('assignee' in flows.get(b.id).nodes[1]), 'null clears an assignment')
console.log('ok    flows and nodes store an assignee, null clears it, and bad names are refused')

// The roster: connected agents, names with work, and the next free name to hand work to.
{
  const live = [{ name: 'Agent 1', color: 'agent-1', kind: 'assistant' }]
  const roster = rosterOf(live, flows.read().flows)
  assert.deepEqual(roster.map((x) => [x.name, x.color, x.live, Boolean(x.spare)]), [['Agent 1', 'agent-1', true, false], ['Agent 2', 'agent-2', false, false], ['Agent 3', 'agent-3', false, true]])
  assert.equal(colorOf('Agent 8'), 'agent-2', 'colors repeat after the palette')
  console.log('ok    the roster lists connected agents, names with work and the next free name, each with its color')
}

// my_tasks answers for the calling agent only.
const call = async (agent, name, args = {}) => {
  const [x, y] = InMemoryTransport.createLinkedPair()
  await createServer({ flowService: flows, presence, agent }).connect(y)
  const client = new Client({ name: 'checks', version: '1' })
  await client.connect(x)
  const result = await client.callTool({ name, arguments: args })
  await client.close()
  if (result.isError) throw new Error(result.content[0].text)
  return JSON.parse(result.content[0].text)
}
const one = presence.join({ kind: 'terminal' })
const two = presence.join({ kind: 'terminal' })
const mine = await call(one, 'my_tasks')
assert.equal(mine.agent, 'Agent 1')
assert.deepEqual(mine.tasks.map((t) => [t.flow_id, t.whole_flow, t.nodes.map((n) => n.id)]), [[a.id, true, ['p', 'm']]], 'Agent 1 has the whole Trailer flow')
const theirs = await call(two, 'my_tasks')
assert.deepEqual(theirs.tasks.map((t) => [t.flow_id, t.whole_flow, t.nodes.map((n) => [n.id, n.assigned, n.summary])]), [[b.id, false, [['w', 'node', 'Write a tagline']]]], 'Agent 2 has one writer node')
await call(one, 'assign_agent', { flow_id: a.id, node_id: 'm', agent: 'Agent 2' })
assert.deepEqual((await call(two, 'my_tasks')).tasks.map((t) => t.flow_id), [b.id, a.id], 'an agent can hand a node to another agent')
const nobody = presence.join({ kind: 'terminal', name: 'Agent 6' })
assert.match((await call(nobody, 'my_tasks')).next, /Nothing is assigned/)
await assert.rejects(call(null, 'my_tasks'), /no agent name/)
const agents = await call(one, 'list_agents')
assert.equal(agents.you, 'Agent 1')
assert.deepEqual(agents.agents.map((x) => x.name), ['Agent 1', 'Agent 2', 'Agent 6'])
assert.deepEqual(tasksFor('Agent 2', flows.read().flows).flatMap((t) => t.nodes.map((n) => n.id)), ['w', 'm'])
console.log('ok    my_tasks returns what is assigned to the calling agent; assign_agent and list_agents work over MCP')

// An assignment made in one tab and an agent edit to the same flow both survive the per-node merge.
{
  const base = flows.read()
  const local = structuredClone(base)
  local.flows.find((f) => f.id === b.id).nodes.find((n) => n.id === 'n').assignee = 'Agent 1'
  flows.update(b.id, 'w', { data: { instructions: 'Write two taglines' } })
  const merged = mergeStores(base, local, flows.read())
  const poster = merged.flows.find((f) => f.id === b.id)
  assert.deepEqual(poster.nodes.map((n) => [n.id, n.assignee, n.data.instructions]), [['w', 'Agent 2', 'Write two taglines'], ['n', 'Agent 1', undefined]])
  console.log('ok    assignments merge per node with remote edits')
}
