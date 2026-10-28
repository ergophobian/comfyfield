import path from 'node:path'
import { createHash } from 'node:crypto'
import { parseArgs } from 'node:util'
import fs from 'node:fs'

const help = `ComfyField: generate with your own keys from the terminal or any agent.

Usage
  comfyfield [start] [--port 5173] [--no-open]  Start the app and open the browser
  comfyfield models [--kind image|video|audio] [--search <text>]
  comfyfield generate "<prompt>" --model <id> [--ratio 16:9] [--duration 5] [--count 1] [--image <url|file>] [--out ./dir]
  comfyfield connect <comfy|fal|google|elevenlabs|runpod|postiz> --key <key> [--url <api-base>]
  comfyfield schedule <library-file> --channel <id> --at <iso> --caption <text> [--request-key <key>] [--draft] [--settings <json>]
  comfyfield channels
  comfyfield queue list|add|update|remove [id] [--channel <id>] [--idea <text>] [--status idea|made|scheduled]
  comfyfield balance
  comfyfield stitch <clip> [<clip> ...] [--ratio 16:9] [--music <file>] [--volume 0.25] [--fade 1] [--out ./dir]
  comfyfield stitch --spec <stitch.json> [--preview] [--out ./dir]
  comfyfield mcp      Start the MCP server on stdio
  comfyfield dev      Start the development server

Keys use the per-user data folder (or .comfyfield under COMFYFIELD_HOME), then fall back to
FAL_KEY, GEMINI_API_KEY, ELEVENLABS_API_KEY, COMFY_API_KEY and RUNPOD_API_KEY.
ComfyUI runs use a ready Pod, else Comfy Cloud; the CLI never starts a Pod.`

const options = {
  channel: { type: 'string', multiple: true }, at: { type: 'string' }, caption: { type: 'string' }, draft: { type: 'boolean' },
  'request-key': { type: 'string' }, settings: { type: 'string' }, url: { type: 'string' },
  idea: { type: 'string' }, status: { type: 'string' }, format: { type: 'string' }, 'library-item': { type: 'string' }, 'postiz-id': { type: 'string' },
  kind: { type: 'string' }, search: { type: 'string' }, model: { type: 'string', short: 'm' },
  ratio: { type: 'string' }, duration: { type: 'string' }, count: { type: 'string' }, image: { type: 'string' },
  out: { type: 'string', short: 'o' }, key: { type: 'string' }, json: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
  spec: { type: 'string' }, music: { type: 'string' }, volume: { type: 'string' }, fade: { type: 'string' }, preview: { type: 'boolean' },
}

function die(msg) {
  console.error(msg)
  process.exit(1)
}

async function main() {
  const command = process.argv[2]
  if (!command || ['start', 'dev'].includes(command) || command.startsWith('--port') || command === '--no-open') {
    const { start } = await import('../server/start.js')
    return start(process.argv.slice(['start', 'dev'].includes(command) ? 3 : 2), { dev: command === 'dev' })
  }
  const { values: v, positionals: [cmd, ...rest] } = parseArgs({ options, allowPositionals: true })
  if (!cmd || v.help || cmd === 'help') return console.log(help)

  if (cmd === 'mcp') return (await import('../server/mcp.js')).startMcp()


  const core = await import('../server/core.js')

  if (cmd === 'channels') return console.log(JSON.stringify(await core.postizChannels(), null, 2))
  if (cmd === 'schedule') {
    const input = { media: rest, channels: v.channel, caption: v.caption || '', date: v.at, draft: Boolean(v.draft), settings: v.settings ? JSON.parse(v.settings) : {} }
    // Identical CLI invocations retain a key across process restarts.
    const requestKey = v['request-key'] || `cli-${createHash('sha256').update(JSON.stringify(input)).digest('hex')}`
    return console.log(JSON.stringify(await core.schedulePost({ ...input, requestKey }), null, 2))
  }
  if (cmd === 'queue') {
    const [action = 'list', id] = rest
    const fields = Object.fromEntries(Object.entries({ channel: v.channel?.[0], idea: v.idea, status: v.status, format: v.format, libraryItem: v['library-item'], postizId: v['postiz-id'], when: v.at }).filter(([, value]) => value != null))
    const result = action === 'list' ? core.queueList(fields) : action === 'add' ? core.queueAdd(fields) : action === 'update' ? core.queueUpdate(id, fields) : action === 'remove' ? core.queueRemove(id) : die('Queue action must be list, add, update or remove.')
    return console.log(JSON.stringify(result, null, 2))
  }
  if (cmd === 'stitch') {
    const spec = v.spec ? JSON.parse(fs.readFileSync(v.spec, 'utf8')) : { clips: rest }
    if (v.ratio) spec.aspect = v.ratio
    if (v.music) spec.music = { url: v.music, volume: v.volume == null ? 0.25 : Number(v.volume), fade: v.fade == null ? 1 : Number(v.fade) }
    const file = await core.stitch({ ...spec, preview: Boolean(v.preview) })
    const saved = v.out ? await core.saveFiles([file], path.resolve(v.out)) : [file.path]
    return console.log(v.json ? JSON.stringify({ ...file, path: saved[0] }, null, 2) : saved[0])
  }

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
    if (!Object.keys(values).length) die('Pass --key.')
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
