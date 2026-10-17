// Local UI fixture only. No real agent or provider is started.
import fs from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'
import comfyfieldApi from '../server/plugin.js'
import { pathToFileURL } from 'node:url'
import { createHarness } from '../server/agent-harness.js'

for (const key of ['FAL_KEY', 'GEMINI_API_KEY', 'ELEVENLABS_API_KEY', 'COMFY_API_KEY', 'COMFY_URL', 'COMFY_MODE']) delete process.env[key]

export async function startFixture(setupOnly = false, port = 0) {
  const directory = path.resolve('.comfyfield', 'agent-ui-fixture', `${Date.now()}-${setupOnly}`)
  fs.mkdirSync(directory, { recursive: true })
  process.env.COMFYFIELD_HOME = directory
  const harness = createHarness({
    directory: () => directory,
    setup: () => setupOnly ? [
      { id: 'claude', name: 'Claude Code', available: false, setup: 'Install @anthropic-ai/claude-agent-sdk in this project, then sign in with Claude Code using your subscription.' },
      { id: 'codex', name: 'Codex', available: false, setup: 'Install @openai/codex, then run codex login with your ChatGPT account.' },
    ] : [{ id: 'fake', name: 'Fake agent (UI test)', available: true, setup: 'Deterministic fixture. No subscription or provider calls.' }],
    estimate: async () => ({ usd: 0.004, approx: true }),
    handlers: { generate: async () => ({ content: [{ type: 'text', text: JSON.stringify({ files: [], note: 'Fake adapter completed. No media was generated.' }) }] }) },
    adapters: { fake: async ({ emit, mcp }) => {
      let stopped = false
      const call = async (name, args) => {
        const response = await fetch(mcp.args[1], { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mcp.args[2]}` }, body: JSON.stringify({ name, args }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        return result
      }
      return {
        async send(text) {
          emit({ type: 'message', text: 'Fake adapter test: I will update the prompt in your flow, then request one image at an estimated $0.004. No provider calls or real media are used in this fixture.' })
          await call('update_node', { flow_id: 'fixture', node_id: 'prompt', data: { text } })
          if (!stopped) await call('generate', { model: 'comfy-flux', prompt: text, aspect: '1:1', count: 1 })
          emit({ type: 'message', text: 'Fake adapter completed. Approval worked; no media was generated.' })
        },
        async stop() { stopped = true },
      }
    } },
  })
  harness.flows.save({ revision: 0, current: 'fixture', flows: [{
    id: 'fixture', name: 'Paper boat concept', nodes: [
      { id: 'prompt', type: 'prompt', position: { x: 0, y: 0 }, data: { text: 'A paper boat on a rainy street' } },
      { id: 'model', type: 'model', position: { x: 350, y: 0 }, data: { model: { id: 'comfy-flux', name: 'Flux', kind: 'image', provider: 'comfy' }, kind: 'image', takes: 1 } },
      { id: 'output', type: 'output', position: { x: 700, y: 0 }, data: {} },
    ], edges: [{ id: 'p-m', source: 'prompt', target: 'model' }, { id: 'm-o', source: 'model', target: 'output' }],
  }] })
  const server = await preview({ configFile: false, envFile: false, plugins: [comfyfieldApi({ harness })], preview: { host: '127.0.0.1', port, strictPort: true } })
  console.log(`Agent UI fixture: http://127.0.0.1:${server.httpServer.address().port}/assistant`)

  return server
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await startFixture(process.argv.includes('--setup-only'), process.argv.includes('--setup-only') ? 5318 : 5317)
