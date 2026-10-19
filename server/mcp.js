// MCP server over stdio. Tools run on the user's own keys from .comfyfield/keys.json.
import path from 'node:path'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import * as core from './core.js'
import { flows } from './flows.js'

const text = (data) => ({ content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }] })
const fail = (e) => ({ isError: true, content: [{ type: 'text', text: e.message || String(e) }] })
const tool = (fn) => async (args) => { try { return text(await fn(args)) } catch (e) { return fail(e) } }

export function createServer({ invoke, handlers = new Map(), flowService = flows } = {}) {
  const server = new McpServer({ name: 'comfyfield', version: '0.1.0' })
  const register = (name, definition, handler) => {
    const schema = z.object(definition.inputSchema)
    const checked = (args) => handler(schema.parse(args))
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

  const flow = { flow_id: z.string() }
  const position = z.object({ x: z.number(), y: z.number() })
  register('list_flows', { description: 'List locally saved flows.', inputSchema: {} }, tool(() => flowService.read().flows.map(({ id, name }) => ({ id, name }))))
  register('get_flow', { description: 'Read nodes, connections and run state of a flow.', inputSchema: flow }, tool(({ flow_id }) => ({ flow: flowService.get(flow_id), state: flowService.engine(flow_id).state })))
  register('add_node', {
    description: 'Add a node to a flow. For model nodes, data.model must be a model object with an id from list_models.',
    inputSchema: { ...flow, type: z.enum(['prompt', 'image', 'mask', 'face', 'video', 'crop', 'writer', 'stitch', 'model', 'approve', 'output', 'note']), position: position.optional(), data: z.record(z.string(), z.unknown()).optional() },
  }, tool(({ flow_id, ...args }) => flowService.add(flow_id, args)))
  register('connect_nodes', { description: 'Connect two nodes without creating a loop.', inputSchema: { ...flow, source: z.string(), target: z.string() } }, tool(({ flow_id, ...args }) => flowService.connect(flow_id, args)))
  register('update_node', { description: 'Update a node’s data or position.', inputSchema: { ...flow, node_id: z.string(), data: z.record(z.string(), z.unknown()).optional(), position: position.optional() } }, tool(({ flow_id, node_id, ...args }) => flowService.update(flow_id, node_id, args)))
  register('run_flow', { description: 'Fill gaps in a flow. Approval gates remain closed until the user sends them in Flows. Requires approval in an assistant session.', inputSchema: flow }, tool(({ flow_id }) => flowService.perform(flow_id, 'runNew')))
  return server
}

export async function startMcp() {
  await createServer().connect(new StdioServerTransport())
}
