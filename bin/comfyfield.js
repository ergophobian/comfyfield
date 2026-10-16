#!/usr/bin/env node
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const help = `ComfyField: generate with your own keys from the terminal or any agent.

Usage
  comfyfield models [--kind image|video|audio] [--search <text>]
  comfyfield generate "<prompt>" --model <id> [--ratio 16:9] [--duration 5] [--count 1] [--image <url|file>] [--out ./dir]
  comfyfield connect <comfy|fal|google|elevenlabs> --key <key> [--url <comfy url>]
  comfyfield balance
  comfyfield mcp      Start the MCP server on stdio
  comfyfield dev      Start the app

Keys are read from .comfyfield/keys.json in the current directory (or COMFYFIELD_HOME), then from
FAL_KEY, GEMINI_API_KEY, ELEVENLABS_API_KEY, COMFY_URL and COMFY_API_KEY.`

const options = {
  kind: { type: 'string' }, search: { type: 'string' }, model: { type: 'string', short: 'm' },
  ratio: { type: 'string' }, duration: { type: 'string' }, count: { type: 'string' }, image: { type: 'string' },
  out: { type: 'string', short: 'o' }, key: { type: 'string' }, url: { type: 'string' }, json: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
}

function die(msg) {
  console.error(msg)
  process.exit(1)
}

async function main() {
  const { values: v, positionals: [cmd, ...rest] } = parseArgs({ options, allowPositionals: true })
  if (!cmd || v.help || cmd === 'help') return console.log(help)

  if (cmd === 'mcp') return (await import('../server/mcp.js')).startMcp()

  if (cmd === 'dev') {
    const bin = path.join(ROOT, 'node_modules', '.bin', 'vite')
    const child = spawn(bin, ['--config', path.join(ROOT, 'vite.config.js'), '--root', ROOT], { stdio: 'inherit', env: { ...process.env, COMFYFIELD_HOME: process.env.COMFYFIELD_HOME || process.cwd() } })
    return child.on('exit', (code) => process.exit(code ?? 0))
  }

  const core = await import('../server/core.js')

  if (cmd === 'models') {
    const list = await core.listModels({ kind: v.kind, query: v.search })
    if (v.json) return console.log(JSON.stringify(list, null, 2))
    for (const m of list) console.log(`${m.id.padEnd(48)} ${m.kind.padEnd(6)} ${m.name}`)
    return
  }

  if (cmd === 'generate') {
    const prompt = rest.join(' ')
    if (!prompt || !v.model) die('Usage: comfyfield generate "<prompt>" --model <id>')
    const args = { model: v.model, prompt, aspect: v.ratio, count: v.count ? Number(v.count) : 1, duration: v.duration ? Number(v.duration) : undefined, image: v.image }
    const cost = await core.estimateCost(args).catch(() => null)
    if (cost) console.error(`Estimated cost: ${cost.approx ? '~' : ''}$${cost.usd.toFixed(2)}`)
    console.error('Generating...')
    const files = await core.generate(args)
    const saved = await core.saveFiles(files, path.resolve(v.out || '.'))
    saved.forEach((p) => console.log(p))
    return
  }

  if (cmd === 'connect') {
    const [id] = rest
    if (!core.providers[id]) die(`Provider must be one of: ${Object.keys(core.providers).join(', ')}`)
    const values = {}
    if (v.key) values.key = v.key
    if (v.url) values.url = v.url
    if (!Object.keys(values).length) die('Pass --key (and --url for comfy).')
    core.saveConnection(id, values)
    return console.log(`Saved ${id} to .comfyfield/keys.json`)
  }

  if (cmd === 'balance') {
    const connected = core.connections()
    const balances = await core.balances()
    for (const [id, c] of Object.entries(connected)) {
      const b = balances[id]
      console.log(`${id.padEnd(11)} ${c.connected ? 'connected' : 'not connected'}${b ? `  ${b.usd != null ? `$${b.usd}` : b.left != null ? `${b.left} ${b.unit}` : b.note}` : ''}`)
    }
    return
  }

  die(`Unknown command ${cmd}\n\n${help}`)
}

main().catch((e) => die(e.message))
