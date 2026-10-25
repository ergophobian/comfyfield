// MCP server over stdio. Tools run on the user's own keys from .comfyfield/keys.json.
import path from 'node:path'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import * as core from './core.js'
import { flows } from './flows.js'
import { createPresence } from './presence.js'
import { nodeTypes, sourceTypes, targetTypes } from '../shared/flowRules.js'

const text = (data) => ({ content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }] })
const fail = (e) => ({ isError: true, content: [{ type: 'text', text: e.message || String(e) }] })
const tool = (fn) => async (args, context) => { try { return text(await fn(args, context)) } catch (e) { return fail(e) } }

// `agent` is who calls the tools: the terminal session itself, or, in the Assistant, the session the
// harness passes in as `{ agent }` with each call. Flow tools move that agent's cursor to the node.
export function createServer({ invoke, handlers = new Map(), flowService = flows, presence = null, agent = null } = {}) {
  const server = new McpServer({ name: 'comfyfield', version: '0.1.0' })
  const register = (name, definition, handler) => {
    const schema = z.object(definition.inputSchema)
    const checked = (args, context) => handler(schema.parse(args), context?.agent ? context : { agent })
    handlers.set(name, checked)
    server.registerTool(name, definition, invoke ? tool((args) => invoke(name, args)) : checked)
  }
  const kind = z.enum(['image', 'video', 'audio']).optional().describe('Filter by media kind')

  register('stitch', {
    description: 'Join ordered clips locally with ffmpeg, preserving clip audio. Optional trims, burned captions and looped music with volume and fade. No paid calls. Set preview to review first, then call export_stitch to save that exact file to the Library.',
    inputSchema: {
      clips: z.array(z.object({ url: z.string(), start: z.number().min(0).optional(), end: z.number().positive().optional(), caption: z.string().optional() })).min(1).max(50),
      aspect: z.enum(['16:9', '9:16', '1:1', '4:5']).optional(),
      music: z.object({ url: z.string(), volume: z.number().min(0).max(2).optional(), fade: z.number().min(0).optional() }).optional(),
      preview: z.boolean().optional(),
    },
  }, tool((args) => core.stitch(args)))

  register('export_stitch', {
    description: 'Save an existing Stitch preview to the Library without rendering again.',
    inputSchema: { url: z.string().describe('The /media URL returned by stitch') },
  }, tool(({ url }) => core.exportStitch(url)))

  register('list_models', {
    description: 'List pinned models and search fal.ai catalog. Ids look like g-veo, comfy-flux or fal:<endpoint>; any fal endpoint can be used as fal:<endpoint>.',
    inputSchema: { kind, query: z.string().optional().describe('Search fal catalog, for example "kling"'), limit: z.number().int().min(1).max(50).optional() },
  }, tool(({ kind, query, limit }) => core.listModels({ kind, query, limit })))

  register('generate', {
    description: 'Generate images, video or audio with the user\'s own provider keys. Spends their credits. Saves files locally and returns paths, URLs and an estimated cost.',
    inputSchema: {
      model: z.string().describe('Model id from list_models, or fal:<endpoint>'),
      prompt: z.string(),
      aspect: z.enum(['1:1', '16:9', '9:16', '4:5']).optional().describe('Default 16:9'),
      count: z.number().int().min(1).max(4).optional().describe('Images per run'),
      duration: z.number().optional().describe('Video length in seconds'),
      image: z.string().optional().describe('Start image: URL or local file path'),
      out: z.string().optional().describe('Folder to save into. Default outputs in the per-user data folder'),
    },
  }, tool(async ({ out, ...args }) => {
    const cost = await core.estimateCost(args).catch(() => null)
    const files = await core.generate(args)
    const saved = await core.saveFiles(files, path.resolve(out || path.join(core.home(), 'outputs')))
    return {
      files: files.map((f, i) => ({ kind: f.kind, path: saved[i], url: f.url })),
      estimated_cost_usd: cost ? { amount: Number(cost.usd.toFixed(4)), approximate: cost.approx } : null,
    }
  }))

  register('get_model_schema', {
    description: 'Input fields of a fal model (types, enums, defaults, required). Pinned fal ids and fal:<endpoint> both work.',
    inputSchema: { model: z.string() },
  }, tool(async ({ model }) => {
    const m = core.resolveModel(model)
    if (m.provider !== 'fal') return { provider: m.provider, note: 'Only fal models have a schema.', durations: m.durations, mode: m.mode }
    return { endpoint: m.model, ...(await core.falSchema(m.model)), price: (await core.falMeta([m.model]).catch(() => ({})))[m.model]?.price }
  }))

  register('balance', {
    description: 'Remaining balance for connected providers where the provider exposes it.',
    inputSchema: {},
  }, tool(async () => ({ connections: Object.fromEntries(Object.entries(core.connections()).map(([k, v]) => [k, v.connected])), balances: await core.balances() })))

  register('write_prompts', {
    description: 'Turn one idea into several distinct generation prompts with Gemini. Needs a Google key.',
    inputSchema: { idea: z.string(), n: z.number().int().min(1).max(20).optional(), kind: z.enum(['image', 'video']).optional() },
  }, tool(async (a) => ({ prompts: await core.writePrompts(a) })))

  // Flow tools share flows.json with the app (see docs/flows-mcp.md). Errors say what to fix.
  const flow = { flow_id: z.string().describe('Flow id from list_flows or create_flow') }
  const position = z.object({ x: z.number(), y: z.number() }).describe('Canvas position in pixels. Default: right of the last node')
  const data = z.record(z.string(), z.unknown()).describe('Node settings, merged over the defaults. prompt: { text, mode: "single"|"rows" }. model: { model: "<model id>", aspect, duration, takes, count, prompt }. image: { url }. writer: { instructions, note, target }. note: { text }')
  const nodeType = z.enum(nodeTypes).describe(`Node type. Outputs: ${sourceTypes.join(', ')}. Inputs: ${targetTypes.join(', ')}. A prompt only feeds model or writer`)
  const newNode = z.object({ id: z.string().optional().describe('Optional id to refer to the node in edges, such as "p" or "video"'), type: nodeType, position: position.optional(), data: data.optional() })
  const edge = z.object({ source: z.string().describe('Node id that sends its output'), target: z.string().describe('Node id that receives it') })
  const summary = (f) => ({ id: f.id, name: f.name, nodes: f.nodes.length, updated: f.updated })
  // Point the calling agent's cursor at the node it just worked on.
  const at = (context, flowId, nodeId) => {
    if (!presence || !context?.agent?.id || !flowId) return
    try {
      const node = flowService.get(flowId).nodes.find((n) => n.id === nodeId)
      presence.touch(context.agent.id, { flowId, nodeId: node?.id ?? null, position: node?.position ?? null })
    } catch {}
  }

  register('list_flows', {
    description: 'List flows saved in this ComfyField folder. The app shows the same flows in Flows.',
    inputSchema: {},
  }, tool(() => flowService.read().flows.map(summary)))
  register('get_flow', {
    description: 'Read a flow: nodes, connections and run state (outputs, gate status).',
    inputSchema: flow,
  }, tool(({ flow_id }) => ({ flow: flowService.get(flow_id), state: flowService.engine(flow_id).state })))
  register('create_flow', {
    description: 'Create a flow. Optionally pass nodes and edges to build it in one call; edges refer to the node ids you set. Does not run anything.',
    inputSchema: { name: z.string(), nodes: z.array(newNode).max(100).optional(), edges: z.array(edge).max(200).optional() },
  }, tool((args, context) => { const made = flowService.create(args); at(context, made.id, made.nodes[0]?.id); return made }))
  register('add_node', {
    description: 'Add one node to a flow. For a model node set data.model to a model id from list_models. Returns the node with its id.',
    inputSchema: { ...flow, ...newNode.shape },
  }, tool(({ flow_id, ...args }, context) => { const node = flowService.add(flow_id, args); at(context, flow_id, node.id); return node }))
  register('connect_nodes', {
    description: 'Connect the output of source to the input of target. Each node has one input and one output. Loops are refused.',
    inputSchema: { ...flow, ...edge.shape },
  }, tool(({ flow_id, ...args }, context) => { const edge = flowService.connect(flow_id, args); at(context, flow_id, edge.target); return edge }))
  register('update_node', {
    description: 'Change a node\'s data (merged over what it has) or its position.',
    inputSchema: { ...flow, node_id: z.string(), data: data.optional(), position: position.optional() },
  }, tool(({ flow_id, node_id, ...args }, context) => { at(context, flow_id, node_id); const node = flowService.update(flow_id, node_id, args); at(context, flow_id, node_id); return node }))
  register('remove_node', {
    description: 'Remove a node, its connections and its results.',
    inputSchema: { ...flow, node_id: z.string() },
  }, tool(({ flow_id, node_id }, context) => { at(context, flow_id, node_id); return flowService.remove(flow_id, node_id) }))
  register('run_flow', {
    description: 'Run fills gaps: it runs only nodes that have no output yet and spends provider credits. It stops at Approve gates and Writer review; the user must press Send in Flows to continue. Returns outputs and what waits for the user.',
    inputSchema: flow,
  }, tool(async ({ flow_id }, context) => {
    at(context, flow_id, flowService.get(flow_id).nodes.find((n) => n.type === 'model')?.id)
    return flowService.report(flow_id, await flowService.perform(flow_id, 'runNew'))
  }))
  return server
}

// A terminal session joins the shared roster with a name and a color, and leaves when it ends.
export async function startMcp() {
  const presence = createPresence()
  const agent = presence.join({ kind: 'terminal', name: process.env.COMFYFIELD_AGENT_NAME })
  let left = false
  const leave = () => { if (!left) { left = true; try { presence.leave(agent.id) } catch {} } }
  process.on('exit', leave)
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, () => { leave(); process.exit(0) })
  process.stdin.on('end', leave)
  await createServer({ presence, agent }).connect(new StdioServerTransport())
}
