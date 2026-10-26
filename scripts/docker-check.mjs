// Checks the Docker setup without Docker: the files keep secrets out of the image, and the
// container's start command (same env and args) serves the built app on all interfaces.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// fetch() always sends the URL's Host, so the Host checks use node:http.
const get = (port, host) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path: '/api/connections', headers: { host } }, (res) => {
    let body = ''
    res.on('data', (d) => { body += d })
    res.on('end', () => resolve({ status: res.statusCode, body }))
  }).on('error', reject)
})
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const dockerfile = read('Dockerfile')
const ignore = read('.dockerignore').split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'))
const compose = read('docker-compose.yml')

assert.match(dockerfile, /^FROM node:22-slim/m, 'Dockerfile uses Node 22 slim')
assert.match(dockerfile, /COMFYFIELD_HOST=0\.0\.0\.0/, 'the container binds all interfaces')
assert.match(dockerfile, /COMFYFIELD_HOME=\/data/, 'data lives under /data')
assert.match(dockerfile, /ffmpeg-static/, 'the image build proves ffmpeg-static runs')
assert.match(dockerfile, /^USER node$/m, 'the app does not run as root')
const cmd = JSON.parse(/^CMD (\[.*\])$/m.exec(dockerfile)[1])
assert.deepEqual(cmd.slice(0, 2), ['node', 'bin/comfyfield.js'])
assert.ok(cmd.includes('--no-open'), 'the container never tries to open a browser')
for (const entry of ['.comfyfield', '.env', 'node_modules', 'outputs', 'research_notes', '.git']) {
  assert.ok(ignore.includes(entry), `.dockerignore excludes ${entry}`)
}
// The app imports this file at build time, so it must stay in the context.
assert.ok(ignore.includes('!research_notes/effect-specs.json'), '.dockerignore keeps research_notes/effect-specs.json')
assert.match(compose, /- "127\.0\.0\.1:5173:5173"/, 'compose publishes the port on loopback only')
assert.match(compose, /:\/data\/\.comfyfield/, 'compose mounts the data folder')
assert.match(compose, /^volumes:\s*\n\s+comfyfield-data:/m, 'compose declares the named volume')
assert.match(read('.github/workflows/ci.yml'), /docker build -t comfyfield \./, 'CI builds the image')

if (!fs.existsSync(path.join(root, 'dist/index.html'))) {
  console.log('docker-check: files ok; skipped the start check (run npx vite build first)')
  process.exit(0)
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'comfyfield-docker-'))
const port = 20000 + Math.floor(Math.random() * 20000)
const args = [...cmd.slice(1, cmd.indexOf('--port')), '--port', String(port), ...cmd.slice(cmd.indexOf('--port') + 2)]
const env = { ...process.env, NODE_ENV: 'production', COMFYFIELD_HOME: scratch, COMFYFIELD_HOST: '0.0.0.0' }
for (const key of ['FAL_KEY', 'GEMINI_API_KEY', 'ELEVENLABS_API_KEY', 'COMFY_API_KEY', 'RUNPOD_API_KEY']) delete env[key]
const child = spawn(process.execPath, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
let log = ''
child.stdout.on('data', (d) => { log += d })
child.stderr.on('data', (d) => { log += d })

try {
  const ready = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`app did not start:\n${log}`)), 90000)
    const poll = setInterval(() => {
      const match = /ComfyField is ready: (\S+)/.exec(log)
      if (match) { clearTimeout(timer); clearInterval(poll); resolve(match[1]) }
    }, 200)
    child.once('exit', (code) => { clearTimeout(timer); clearInterval(poll); reject(new Error(`app exited with ${code}:\n${log}`)) })
  })
  assert.equal(new URL(ready).port, String(port))
  // 127.0.0.1 reaches a 0.0.0.0 bind; the host's port map arrives with Host localhost.
  const page = await fetch(`http://127.0.0.1:${port}/`)
  assert.equal(page.status, 200)
  assert.match(await page.text(), /id="root"/)
  const api = await get(port, `localhost:${port}`)
  assert.equal(api.status, 200, 'the API answers a localhost Host')
  assert.ok('comfy' in JSON.parse(api.body))
  const foreign = await get(port, `example.com:${port}`)
  assert.notEqual(foreign.status, 200, 'the API refuses a foreign Host')
  assert.ok(log.includes(path.join(scratch, '.comfyfield')), 'the app uses the COMFYFIELD_HOME data folder')
  console.log('docker-check: ok')
} finally {
  child.kill()
  try { fs.rmSync(scratch, { recursive: true, force: true }) } catch {}
}
