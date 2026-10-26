import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { setTimeout as wait } from 'node:timers/promises'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const demoPrompt = 'A red ceramic cup on wet slate, morning sunlight, steam curling above the rim, slow push in'

// Only pass operating-system essentials. Never inherit provider keys or load an env file.
export function demoEnv(home) {
  const env = { COMFYFIELD_HOME: path.resolve(home), COMFYFIELD_AGENT_NAME: 'Demo agent' }
  for (const name of ['PATH', 'Path', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'APPDATA']) {
    if (process.env[name] !== undefined) env[name] = process.env[name]
  }
  return env
}

export async function demoAgent({ home, flowId, nodeId = 'prompt', prompt = demoPrompt, delay = 5000, hold = 6000, print = console.log }) {
  if (!home) throw new Error('Pass --home matching the running app. No keys are needed.')
  for (const value of [delay, hold]) if (!Number.isFinite(value) || value < 0 || value > 60000) throw new Error('Delay and hold must be 0–60000 milliseconds.')
  const client = new Client({ name: 'ComfyField recording client', version: '1' })
  const call = async (name, args) => {
    const result = await client.callTool({ name, arguments: args })
    if (result.isError) throw new Error(result.content?.[0]?.text || 'Flow tool failed')
    return JSON.parse(result.content[0].text)
  }
  try {
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(root, 'bin/cli.js'), 'mcp'], cwd: root, env: demoEnv(home) }))
    if (!flowId) {
      const flow = await call('create_flow', {
        name: 'Recording · agent prompt edit',
        nodes: [
          { id: 'prompt', type: 'prompt', position: { x: 0, y: 0 }, data: { text: 'A red ceramic cup on a table' } },
          { id: 'image', type: 'model', position: { x: 340, y: 0 }, data: { model: 'comfy-flux', takes: 1 } },
          { id: 'review', type: 'approve', position: { x: 680, y: 0 } },
        ],
        edges: [{ source: 'prompt', target: 'image' }, { source: 'image', target: 'review' }],
      })
      flowId = flow.id
    }
    const opened = await call('get_flow', { flow_id: flowId })
    const node = opened.flow.nodes.find((node) => node.id === nodeId)
    if (!node || !['prompt', 'model'].includes(node.type)) throw new Error('Choose a prompt or model node with --node.')
    print(`Open Flows, select "${opened.flow.name}", then select node "${nodeId}". Edit in ${delay} ms. Flow id: ${flowId}`)
    await wait(delay)
    await call('update_node', { flow_id: flowId, node_id: nodeId, data: node.type === 'prompt' ? { text: prompt } : { prompt } })
    const readback = await call('get_flow', { flow_id: flowId })
    print(`Edited ${nodeId} through MCP. Cursor remains active for 8 seconds; holding connection ${hold} ms. No generation requested.`)
    await wait(hold)
    return readback
  } finally { await client.close() }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: Object.fromEntries(['home', 'flow', 'node', 'prompt', 'delay', 'hold'].map((name) => [name, { type: 'string' }])) })
  demoAgent({ home: values.home, flowId: values.flow, nodeId: values.node, prompt: values.prompt, delay: Number(values.delay ?? 5000), hold: Number(values.hold ?? 6000) }).catch((error) => { console.error(error.message); process.exitCode = 1 })
}
