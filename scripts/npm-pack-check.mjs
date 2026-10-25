// Packs the npm package, unpacks it outside the repo and runs it from a clean folder:
// only needed files ship, every server import is inside the package, `comfyfield --help`
// prints usage, `comfyfield mcp` answers an MCP initialize over stdio, and `comfyfield`
// serves the bundled build. Offline: dependencies come from this checkout's node_modules
// through a link, the way an install would place them. Nothing is published.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
if (!fs.existsSync(path.join(root, 'dist/index.html'))) {
  console.log('npm-pack-check: skipped (run npx vite build first; npm pack builds through prepack)')
  process.exit(0)
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'comfyfield-pack-'))
const win = process.platform === 'win32'
// prepack would rebuild dist; the check packs the build that already exists.
const npmCli = [process.env.npm_execpath, path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'), path.join(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')]
  .find((file) => file && /npm-cli\.js$/.test(file) && fs.existsSync(file))
const packArgs = ['pack', '--json', '--ignore-scripts', '--pack-destination', scratch]
const packed = npmCli
  ? spawnSync(process.execPath, [npmCli, ...packArgs], { cwd: root, encoding: 'utf8', windowsHide: true })
  : spawnSync(win ? 'npm.cmd' : 'npm', packArgs.map((a) => JSON.stringify(a)), { cwd: root, encoding: 'utf8', shell: win, windowsHide: true })
assert.equal(packed.status, 0, `npm pack failed:\n${packed.stderr}`)
const [info] = JSON.parse(packed.stdout.slice(packed.stdout.indexOf('[')))
const files = info.files.map((f) => f.path)
const shipped = new Set(files)

// Contents
assert.equal(info.name, 'comfyfield')
for (const need of ['package.json', 'README.md', 'LICENSE', 'bin/comfyfield.js', 'bin/cli.js', 'server/mcp.js', 'server/start.js', 'dist/index.html', 'docs/setup.md']) {
  assert.ok(shipped.has(need), `the package ships ${need}`)
}
assert.ok(files.some((f) => /^public\/workflows\/.+\.json$/.test(f)), 'the package ships the bundled workflows')
const allowedRoots = ['bin/', 'server/', 'shared/', 'src/lib/', 'dist/', 'public/workflows/', 'public/art/video/index.json', 'research_notes/effect-specs.json', 'docs/setup.md', 'NOTICE.md', 'README.md', 'LICENSE', 'package.json']
for (const file of files) {
  assert.ok(allowedRoots.some((r) => file === r || file.startsWith(r)), `unexpected file in the package: ${file}`)
  assert.ok(!/(^|\/)(\.comfyfield|\.env|keys\.json|outputs|node_modules|__pycache__|browser-profiles)(\/|$)/.test(file), `the package must not ship ${file}`)
}
const unpackedMb = info.unpackedSize / 1e6
assert.ok(unpackedMb < 80, `the package unpacks to ${unpackedMb.toFixed(1)} MB; check what ships`)

// Every relative import reachable from the CLI and server stays inside the package.
const importPattern = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]+)\1/g
const seen = new Set()
const queue = files.filter((f) => /^(bin|server)\/[^/]+\.js$/.test(f))
while (queue.length) {
  const file = queue.pop()
  if (seen.has(file)) continue
  seen.add(file)
  if (!file.endsWith('.js')) continue
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  for (const [, , spec] of source.matchAll(importPattern)) {
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec))
    assert.ok(shipped.has(target), `${file} imports ${spec}, which the package does not ship`)
    queue.push(target)
  }
}

// Unpack outside the repo and link dependencies in, as an install would.
const tarball = path.join(scratch, info.filename)
const unpacked = path.join(scratch, 'unpacked')
fs.mkdirSync(unpacked)
const tar = spawnSync('tar', ['-xzf', path.basename(tarball), '-C', 'unpacked'], { cwd: scratch, encoding: 'utf8', windowsHide: true })
assert.equal(tar.status, 0, `tar failed:\n${tar.stderr}`)
const pkg = path.join(unpacked, 'package')
fs.symlinkSync(path.join(root, 'node_modules'), path.join(pkg, 'node_modules'), win ? 'junction' : 'dir')
const clean = path.join(scratch, 'clean')
fs.mkdirSync(clean)
const env = { ...process.env, COMFYFIELD_HOME: path.join(scratch, 'home'), NODE_ENV: 'production' }
for (const key of ['FAL_KEY', 'GEMINI_API_KEY', 'ELEVENLABS_API_KEY', 'COMFY_API_KEY', 'RUNPOD_API_KEY', 'COMFYFIELD_HOST']) delete env[key]
const bin = path.join(pkg, 'bin/comfyfield.js')
const run = (args, options = {}) => spawn(process.execPath, [bin, ...args], { cwd: clean, env, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, ...options })

function finish(child, ms = 30000) {
  return new Promise((resolve, reject) => {
    let out = ''
    let err = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { err += d })
    const timer = setTimeout(() => { child.kill(); reject(new Error(`timed out:\n${out}\n${err}`)) }, ms)
    child.once('exit', (code) => { clearTimeout(timer); resolve({ code, out, err }) })
  })
}

const children = []
try {
  // comfyfield --help
  const help = await finish(run(['--help']))
  assert.equal(help.code, 0, help.err)
  assert.match(help.out, /comfyfield mcp\s+Start the MCP server on stdio/)

  // The formats module loads from the package: the Pod service list reads it.
  const formats = await finish(spawn(process.execPath, ['--input-type=module', '-e', `const core = await import(${JSON.stringify(new URL('server/core.js', `file:///${pkg.replaceAll('\\', '/')}/`).href)}); console.log((await core.podServices()).length)`], { cwd: clean, env, windowsHide: true }))
  assert.equal(formats.code, 0, `server/core.js podServices failed from the package:\n${formats.err}`)
  assert.ok(Number(formats.out) > 0, 'the packaged formats list Pod services')

  // comfyfield mcp answers initialize and lists tools over stdio.
  const mcp = run(['mcp'])
  children.push(mcp)
  let buffer = ''
  let stderr = ''
  const replies = new Map()
  mcp.stderr.on('data', (d) => { stderr += d })
  mcp.stdout.on('data', (d) => {
    buffer += d
    let line
    while ((line = buffer.indexOf('\n')) >= 0) {
      const message = JSON.parse(buffer.slice(0, line))
      buffer = buffer.slice(line + 1)
      if (message.id != null) replies.set(message.id, message)
    }
  })
  const send = (message) => mcp.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`)
  const reply = (id) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no MCP reply ${id}:\n${stderr}`)), 30000)
    const poll = setInterval(() => {
      if (!replies.has(id)) return
      clearTimeout(timer); clearInterval(poll); resolve(replies.get(id))
    }, 50)
  })
  send({ id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'npm-pack-check', version: '1' } } })
  const init = await reply(1)
  assert.equal(init.result?.serverInfo?.name, 'comfyfield', JSON.stringify(init))
  send({ method: 'notifications/initialized' })
  send({ id: 2, method: 'tools/list' })
  const tools = (await reply(2)).result.tools.map((t) => t.name)
  for (const name of ['list_models', 'generate', 'list_flows', 'run_flow']) assert.ok(tools.includes(name), `MCP lists ${name}`)
  mcp.kill()

  // comfyfield (start) serves the bundled build without building or installing.
  const port = 20000 + Math.floor(Math.random() * 20000)
  const app = run(['--port', String(port), '--no-open'])
  children.push(app)
  let log = ''
  app.stdout.on('data', (d) => { log += d })
  app.stderr.on('data', (d) => { log += d })
  const url = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`the packaged app did not start:\n${log}`)), 90000)
    const poll = setInterval(() => {
      const match = /ComfyField is ready: (\S+)/.exec(log)
      if (match) { clearTimeout(timer); clearInterval(poll); resolve(match[1]) }
    }, 200)
    app.once('exit', (code) => { clearTimeout(timer); clearInterval(poll); reject(new Error(`the packaged app exited with ${code}:\n${log}`)) })
  })
  assert.ok(!/Installing missing|Building ComfyField/.test(log), `the packaged app installed or built on start:\n${log}`)
  const page = await fetch(url)
  assert.equal(page.status, 200)
  assert.match(await page.text(), /id="root"/)
  app.kill()

  console.log(`npm-pack-check: ok (${files.length} files, ${unpackedMb.toFixed(1)} MB unpacked, ${tools.length} MCP tools; not published)`)
} finally {
  for (const child of children) child.kill()
  await new Promise((resolve) => setTimeout(resolve, 500))
  // Remove the link first so the cleanup never follows it into the checkout's node_modules.
  const link = path.join(pkg, 'node_modules')
  try { fs.unlinkSync(link) } catch { try { fs.rmdirSync(link) } catch {} }
  let linked = true
  try { fs.lstatSync(link) } catch { linked = false }
  if (!linked) try { fs.rmSync(scratch, { recursive: true, force: true }) } catch {}
}
