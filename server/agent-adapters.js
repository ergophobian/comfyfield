import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const instructions = 'You are Agent 1, the ComfyField creative assistant. Use only the comfyfield MCP tools to inspect and edit flows or generate media. Explain your plan in plain words before requesting generation. Every generate, write_prompts and run_flow call waits for approval in the app. Never bypass that approval or execute shell commands. Approval gates in flows must be sent by the user in Flows.'

function environment() {
  const env = { ...process.env }
  for (const key of ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'FAL_KEY', 'GEMINI_API_KEY', 'ELEVENLABS_API_KEY', 'COMFY_API_KEY']) delete env[key]
  return env
}

export function codexCommand() {
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    // npm shims cannot be spawned without a shell on Windows.
    const cli = path.join(dir, 'node_modules', '@openai', 'codex', 'bin', 'codex.js')
    if (fs.existsSync(cli)) return { command: process.execPath, args: [cli] }
    const binary = path.join(dir, process.platform === 'win32' ? 'codex.exe' : 'codex')
    if (fs.existsSync(binary)) return { command: binary, args: [] }
  }
  return null
}

export function adapterSetup() {
  let claude = false
  try { require.resolve('@anthropic-ai/claude-agent-sdk'); claude = true } catch {}
  return [
    { id: 'claude', name: 'Claude Code', available: claude, setup: 'Install @anthropic-ai/claude-agent-sdk in this project, then sign in with Claude Code using your subscription.' },
    { id: 'codex', name: 'Codex', available: Boolean(codexCommand()), setup: 'Install @openai/codex, then run codex login with your ChatGPT account.' },
  ]
}

export async function claudeAdapter({ emit, mcp, loadSdk = () => import('@anthropic-ai/claude-agent-sdk') }) {
  const { query } = await loadSdk()
  let conversation
  let active
  let stopped = false
  return {
    async send(text) {
      if (stopped) throw new Error('Session stopped')
      active = query({ prompt: text, options: {
        cwd: process.cwd(), env: environment(), resume: conversation,
        tools: [], settingSources: [], systemPrompt: instructions,
        mcpServers: { comfyfield: mcp }, allowedTools: ['mcp__comfyfield__*'],
        canUseTool: async () => ({ behavior: 'deny', message: 'Use the ComfyField tools.' }),
      } })
      for await (const event of active) {
        if (stopped) break
        if (event.session_id) conversation = event.session_id
        if (event.type === 'assistant') for (const block of event.message?.content || []) {
          if (block.type === 'text') emit({ type: 'message', text: block.text })
          if (block.type === 'tool_use') emit({ type: 'tool', name: block.name, state: 'running' })
        }
        if (event.type === 'result' && event.is_error) throw new Error(event.errors?.join('\n') || 'Claude could not finish this turn')
      }
    },
    async stop() { stopped = true; await active?.interrupt(); active?.close?.() },
  }
}

export async function codexAdapter({ emit, mcp, launch = spawn, command = codexCommand() }) {
  if (!command) throw new Error('Install Codex and run codex login first.')
  const config = { comfyfield: { ...mcp, required: true, tool_timeout_sec: 3600 } }
  const child = launch(command.command, [...command.args, 'app-server', '-c', `mcp_servers=${JSON.stringify(config).replace(/"([^"\\]+)":/g, '"$1"=')}`, '-c', 'features.shell_tool=false', '-c', 'features.apps=false', '-c', 'web_search="disabled"'], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, env: environment() })
  let next = 1
  let thread
  let completion
  let closed = false
  const pending = new Map()
  const write = (data) => child.stdin.write(`${JSON.stringify(data)}\n`)
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = next++
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Codex timed out: ${method}`)) }, 30000)
    pending.set(id, { resolve, reject, timer })
    write({ id, method, params })
  })
  const fail = (error) => {
    closed = true
    for (const p of pending.values()) { clearTimeout(p.timer); p.reject(error) }
    pending.clear()
    completion?.reject(error)
    completion = null
  }
  child.on('error', fail)
  child.on('exit', () => fail(new Error('Codex app-server stopped. Check that you are signed in.')))
  child.stderr.on('data', () => {})
  const lines = createInterface({ input: child.stdout })
  lines.on('line', (line) => {
    let data
    try { data = JSON.parse(line) } catch { return }
    if (data.id != null && !data.method) {
      const p = pending.get(data.id)
      if (p) { clearTimeout(p.timer); pending.delete(data.id); data.error ? p.reject(new Error(data.error.message)) : p.resolve(data.result) }
      return
    }
    if (data.id != null) {
      // Built-in command/file/permission requests never grant access outside MCP.
      if (data.method === 'item/permissions/requestApproval') write({ id: data.id, result: { permissions: {}, scope: 'turn' } })
      else if (['item/commandExecution/requestApproval', 'item/fileChange/requestApproval'].includes(data.method)) write({ id: data.id, result: { decision: 'decline' } })
      else write({ id: data.id, error: { code: -32601, message: 'Use the ComfyField tools and approval panel.' } })
      return
    }
    const p = data.params || {}
    if (data.method === 'item/completed' && p.item?.type === 'agentMessage') emit({ type: 'message', text: p.item.text })
    if (data.method === 'item/started' && p.item?.type === 'mcpToolCall') emit({ type: 'tool', name: p.item.tool, state: 'running' })
    if (data.method === 'turn/completed') {
      if (p.turn.status === 'completed') completion?.resolve()
      else completion?.reject(new Error(p.turn.error?.message || `Codex turn ${p.turn.status}`))
      completion = null
    }
    if (data.method === 'error') emit({ type: 'error', text: p.error?.message || p.message || 'Codex error' })
  })
  try {
    await request('initialize', { clientInfo: { name: 'comfyfield', title: 'ComfyField', version: '0.1.0' } })
    write({ method: 'initialized', params: {} })
    const result = await request('thread/start', { cwd: process.cwd(), sandbox: 'read-only', approvalPolicy: 'on-request', baseInstructions: instructions })
    thread = result.thread.id
  } catch (e) { child.kill(); throw e }
  return {
    async send(text) {
      if (closed) throw new Error('Session stopped')
      const done = new Promise((resolve, reject) => { completion = { resolve, reject } })
      // Attach a rejection handler before the request, including early process exits.
      const result = Promise.all([request('turn/start', { threadId: thread, input: [{ type: 'text', text }] }), done])
      await result
    },
    async stop() { fail(new Error('Session stopped')); child.kill(); lines.close() },
  }
}
