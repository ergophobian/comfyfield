// Agent presence (issue #23): every MCP session joins with a name and a color, flow tools move its
// cursor to the node, and it goes idle and leaves. A real `comfyfield mcp` process is started over
// stdio with a throwaway COMFYFIELD_HOME. No keys, no provider calls.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { createPresence, IDLE_MS, PALETTE } from '../server/presence.js'
import { createFlows } from '../server/flows.js'
import { createServer } from '../server/mcp.js'

const root = path.join(process.cwd(), '.comfyfield', 'agent-presence-checks', `${Date.now()}-${process.pid}`)
fs.mkdirSync(root, { recursive: true })
const forbidden = async () => { throw new Error('No paid calls in checks') }
const css = fs.readFileSync('src/styles.css', 'utf8')
const parse = (result) => { assert.ok(!result.isError, result.content?.[0]?.text); return JSON.parse(result.content[0].text) }

{
  let clock = 1000
  const events = []
  const dir = () => path.join(root, 'roster')
  const presence = createPresence({ directory: dir, changed: (e) => events.push(e), now: () => clock })
  const one = presence.join({ kind: 'assistant' })
  const two = presence.join()
  assert.deepEqual([one.name, one.color, two.name, two.color], ['Agent 1', 'agent-1', 'Agent 2', 'agent-2'], 'names and colors come from the lowest free slot')
  for (let i = 1; i <= PALETTE; i++) assert.match(css, new RegExp(`--agent-${i}: #`), `--agent-${i} is a color token`)
  presence.leave(one.id)
  assert.equal(presence.join().name, 'Agent 1', 'a slot frees when its agent leaves')
  assert.equal(presence.join({ name: 'Agent 5' }).color, 'agent-5', 'a chosen "Agent N" name keeps its color')
  // An agent whose process is gone (a closed terminal) drops out.
  const file = JSON.parse(fs.readFileSync(presence.file(), 'utf8'))
  file.agents.push({ ...file.agents[0], id: 'gone', pid: 999999999 })
  fs.writeFileSync(presence.file(), JSON.stringify(file))
  assert.ok(!presence.list().agents.some((a) => a.id === 'gone'))
  // A terminal agent is working for IDLE_MS after a flow tool; an Assistant until its turn ends.
  const moved = presence.touch(two.id, { flowId: 'f', nodeId: 'n', position: { x: 1, y: 2 } })
  assert.equal(moved.until, clock + IDLE_MS)
  const turn = presence.join({ kind: 'assistant' })
  assert.equal(presence.touch(turn.id, { flowId: 'f', nodeId: 'n' }).until, null)
  clock += 5
  assert.equal(presence.rest(turn.id).until, clock, 'the end of a turn makes the Assistant idle')
  assert.ok(events.every((e) => e.type === 'agents') && events.length > 5)
  console.log('ok    sessions join with a name and a palette color, free their slot, drop out when their process ends, and go idle')
}

{
  // In-app MCP: flow tools move the calling agent's cursor to the node they edit.
  const dir = () => path.join(root, 'tools')
  const presence = createPresence({ directory: dir })
  const flows = createFlows({ directory: dir, generate: forbidden })
  const agent = presence.join()
  const [a, b] = InMemoryTransport.createLinkedPair()
  await createServer({ flowService: flows, presence, agent }).connect(b)
  const client = new Client({ name: 'checks', version: '1' })
  await client.connect(a)
  const made = parse(await client.callTool({ name: 'create_flow', arguments: { name: 'Presence', nodes: [{ id: 'p', type: 'prompt' }] } }))
  const where = () => presence.list().agents.find((x) => x.id === agent.id)
  assert.deepEqual([where().flowId, where().nodeId], [made.id, 'p'])
  parse(await client.callTool({ name: 'add_node', arguments: { flow_id: made.id, id: 'm', type: 'model', position: { x: 400, y: 80 } } }))
  assert.deepEqual([where().nodeId, where().position], ['m', { x: 400, y: 80 }], 'the cursor goes to the new node')
  parse(await client.callTool({ name: 'update_node', arguments: { flow_id: made.id, node_id: 'p', data: { text: 'Kites' } } }))
  assert.equal(where().nodeId, 'p', 'then to the node it edits')
  parse(await client.callTool({ name: 'list_flows', arguments: {} }))
  assert.equal(where().nodeId, 'p', 'reading does not move it')
  await client.close()
  console.log('ok    flow tools move the calling agent to the node it edits')
}

{
  // A terminal MCP server joins the shared roster, shows where it works, and leaves when it ends.
  const home = path.join(root, 'terminal')
  const presence = createPresence({ directory: () => path.join(home, '.comfyfield') })
  const env = { ...process.env, COMFYFIELD_HOME: home }
  for (const key of ['FAL_KEY', 'GEMINI_API_KEY', 'ELEVENLABS_API_KEY', 'COMFY_API_KEY', 'COMFY_URL', 'COMFY_MODE', 'COMFYFIELD_AGENT_NAME']) delete env[key]
  const client = new Client({ name: 'terminal', version: '1' })
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ['bin/cli.js', 'mcp'], env }))
  const [joined] = presence.list().agents
  assert.deepEqual([joined?.name, joined?.color, joined?.kind], ['Agent 1', 'agent-1', 'terminal'])
  const made = parse(await client.callTool({ name: 'create_flow', arguments: { name: 'From a terminal', nodes: [{ id: 'p', type: 'prompt' }] } }))
  const [working] = presence.list().agents
  assert.deepEqual([working.flowId, working.nodeId], [made.id, 'p'])
  assert.ok(working.until > Date.now(), 'working right after a flow tool')
  await client.close()
  for (let i = 0; i < 100 && presence.list().agents.length; i++) await new Promise((resolve) => setTimeout(resolve, 50))
  assert.deepEqual(presence.list().agents, [], 'the terminal agent leaves when its session ends')
  console.log('ok    a terminal MCP server registers, moves to the node it edits and leaves on exit')
}
