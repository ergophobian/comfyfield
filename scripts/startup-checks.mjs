import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { dataDirectory } from '../server/startup-paths.js'
import { checkComfy, diskCheck, nodeProblem, startupChecks, installationStorageChecks } from '../server/startup-checks.js'
import { createRequire } from 'node:module'
import { findFfmpeg, probeFfmpeg, ffmpegFix } from '../server/ffmpeg.js'
import { openBrowser, ensureDependencies, missingDependencies, loadEnvironment } from '../server/start.js'
import { allowedApiRequest, bindHost } from '../server/local-access.js'
import vm from 'node:vm'
import { killProcessTree } from './browser.mjs'

const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'))
assert.ok(manifest.optionalDependencies['ffmpeg-static'], 'ffmpeg download failures must stay optional')
assert.ok(!manifest.dependencies['ffmpeg-static'])

assert.match(nodeProblem('20.19.0'), /Node.js 22.*nodejs.org/)
assert.equal(nodeProblem('22.0.0'), null)
assert.equal(nodeProblem('24.11.1'), null)
assert.equal(dataDirectory({ env: {}, platform: 'linux', userHome: '/home/judge' }), path.join('/home/judge', '.comfyfield'))
assert.equal(dataDirectory({ env: {}, platform: 'darwin', userHome: '/Users/judge' }), path.join('/Users/judge', '.comfyfield'))
assert.equal(dataDirectory({ env: { APPDATA: 'roaming' }, platform: 'win32', userHome: 'judge' }), path.join('roaming', 'comfyfield'))
assert.equal(dataDirectory({ env: { COMFYFIELD_HOME: 'custom' } }), path.resolve('custom', '.comfyfield'))
assert.equal(diskCheck(0n).level, 'error')
assert.equal(diskCheck(1024 ** 3).level, 'warning')
assert.equal(diskCheck(10 * 1024 ** 3).level, 'ok')
assert.equal(await findFfmpeg({ probe: async (p) => p === 'ffmpeg', bundled: () => { throw Error('unused') } }), 'ffmpeg')
assert.equal(await findFfmpeg({ probe: async (p) => p === 'bundled', bundled: () => 'bundled' }), 'bundled')
await assert.rejects(findFfmpeg({ probe: async () => false, bundled: () => null }), /npm rebuild ffmpeg-static/)
let bundled
try { bundled = createRequire(import.meta.url)('ffmpeg-static') } catch {}
if (bundled) assert.ok(await probeFfmpeg(bundled), 'An installed optional binary must run')
await findFfmpeg().catch((error) => assert.equal(error.message, ffmpegFix))
assert.equal(await findFfmpeg({ probe: async (p) => p === 'ffmpeg', bundled: () => { throw Error('download failed') } }), 'ffmpeg')
await assert.rejects(findFfmpeg({ probe: async () => false, bundled: () => { throw Error('download failed') } }), /Stitch features are disabled/)
let requested = 0
const request = (status, body = {}) => async (url, opts) => {
  requested++
  assert.equal(url, 'https://cloud.comfy.org/api/user')
  assert.equal(opts.method, 'GET')
  assert.equal(opts.headers['X-API-Key'], 'fixture-key')
  return new Response(JSON.stringify(body), { status })
}
assert.equal((await checkComfy('', { request: request(200) })).level, 'info')
assert.equal(requested, 0, 'No saved key means no provider request')
assert.match((await checkComfy('fixture-key', { request: request(200, { status: 'active' }) })).message, /entitlement is not reported/)
assert.match((await checkComfy('fixture-key', { request: request(200, { status: 'waitlisted' }) })).message, /not active/)
for (const code of [401, 402, 403, 429, 500]) assert.equal((await checkComfy('fixture-key', { request: request(code) })).level, 'warning')
assert.match((await checkComfy('fixture-key', { request: async () => { throw Error('offline') } })).message, /internet/)
for (const platform of ['win32', 'darwin', 'linux']) {
  assert.equal(await openBrowser('http://127.0.0.1:5173', { platform, launch(binary, args) {
    assert.equal(binary, { win32: 'rundll32', darwin: 'open', linux: 'xdg-open' }[platform])
    assert.ok(args.includes('http://127.0.0.1:5173'))
    const child = new EventEmitter()
    queueMicrotask(() => child.emit('exit', 0))
    return child
  } }), true)
}
assert.equal(await openBrowser('http://127.0.0.1:5173', { launch() {
  const child = new EventEmitter()
  queueMicrotask(() => child.emit('error', new Error('No desktop browser')))
  return child
} }), false)
fs.mkdirSync('outputs', { recursive: true })
const directory = fs.mkdtempSync(path.resolve('outputs/startup-'))
// A partial install must be repaired even though Vite still resolves; optional download failure is harmless.
const fixture = path.join(directory, 'install')
fs.mkdirSync(fixture)
fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ dependencies: { vite: '*', '@comfyorg/sdk': '*' }, optionalDependencies: { 'ffmpeg-static': '*' } }))
fs.writeFileSync(path.join(fixture, 'package-lock.json'), 'lock fixture')
let installed = false
const resolve = (name) => { if (name === 'vite' || installed) return name; throw Error('missing sdk') }
assert.deepEqual(missingDependencies({ directory: fixture, resolve }), ['@comfyorg/sdk'])
let installs = 0
await ensureDependencies({ directory: fixture, resolve, log() {}, runNpm: async (args) => {
  assert.equal(args[0], 'ci')
  installs++
  installed = true // npm succeeds even if its optional ffmpeg lifecycle download fails.
} })
assert.equal(installs, 1)
await ensureDependencies({ directory: fixture, resolve, log() {}, runNpm: async () => { throw Error('complete installs should be reused') } })
assert.equal(fs.readFileSync(path.join(fixture, 'package-lock.json'), 'utf8'), 'lock fixture')

const beforeHome = process.env.COMFYFIELD_HOME
const dotenvHome = path.join(directory, 'dotenv-data')
fs.writeFileSync(path.join(fixture, '.env'), `COMFYFIELD_HOME=${JSON.stringify(dotenvHome.replaceAll('\\', '/'))}\n`)
delete process.env.COMFYFIELD_HOME
await loadEnvironment(fixture)
assert.equal(dataDirectory(), path.join(dotenvHome, '.comfyfield'))
if (beforeHome === undefined) delete process.env.COMFYFIELD_HOME
else process.env.COMFYFIELD_HOME = beforeHome
const drives = []
const space = await installationStorageChecks(fixture, path.join(fixture, 'new-cache'), { disk: async (dir) => {
  drives.push(dir)
  return { bavail: dir === fixture && drives.length === 2 ? 0n : 10n * 1024n ** 3n, bsize: 1n }
} })
assert.deepEqual(drives, [fixture, fixture])
assert.equal(space[1].level, 'error')
assert.match(space[1].message, /npm cache drive/)

const oldExit = new Error('old node exit')
let guidance = ''
assert.throws(() => vm.runInNewContext(fs.readFileSync('bin/comfyfield.js', 'utf8'), {
  process: { versions: { node: '16.20.2' }, exit(code) { assert.equal(code, 1); throw oldExit } },
  console: { error(message) { guidance = message } },
}), (error) => error === oldExit)
assert.match(guidance, /Node.js 22.*16.20.2/)
assert.equal(bindHost({}, () => { throw Error('loopback needs no warning') }), '127.0.0.1')
let warning = ''
assert.equal(bindHost({ COMFYFIELD_HOST: '0.0.0.0' }, (text) => { warning = text }), '0.0.0.0')
assert.match(warning, /spend credits/)
for (const host of ['localhost:5173', '127.0.0.1:5173', '[::1]:5173']) {
  assert.equal(allowedApiRequest({ host, origin: `http://${host}` }, {}), true)
  assert.equal(allowedApiRequest({ host, origin: 'https://foreign.example' }, {}), false)
}
for (const host of ['127.1', '2130706433', '0x7f000001', 'localhost.evil']) assert.equal(allowedApiRequest({ host }, {}), false)
assert.equal(allowedApiRequest({ host: 'rebind.example:5173', origin: 'http://rebind.example:5173' }, {}), false)
assert.equal(allowedApiRequest({ host: 'studio.example:5173', origin: 'http://studio.example:5173' }, { COMFYFIELD_HOST: 'studio.example' }), true)
assert.equal(allowedApiRequest({ host: 'unconfigured.example:5173' }, { COMFYFIELD_HOST: '0.0.0.0' }), false)
const { resolveConfig } = await import('vite')
const config = await resolveConfig({ envFile: false }, 'serve')
assert.equal(config.server.host, '127.0.0.1', 'npm run dev defaults to loopback')
assert.equal(config.preview.host, '127.0.0.1')
const checks = await startupChecks(directory, {
  disk: async () => ({ bavail: 10n * 1024n ** 3n, bsize: 1n }),
  ffmpeg: async () => { throw new Error(ffmpegFix) },
  request: async () => { throw Error('Must not call a provider') },
})
assert.ok(checks.some((c) => c.connections && /No keys yet/.test(c.message)))
assert.ok(checks.some((c) => /npm rebuild ffmpeg-static/.test(c.message)))
fs.writeFileSync(path.join(directory, 'keys.json'), '{bad json')
assert.ok((await startupChecks(directory, { ffmpeg: async () => {} })).some((c) => /Could not read saved/.test(c.message)))
fs.writeFileSync(path.join(directory, 'keys.json'), '{}')
const denied = path.join(directory, 'not-a-folder')
fs.writeFileSync(denied, '')
await assert.rejects(startupChecks(denied), /writable folder/)

// Exercise the actual no-subcommand launcher and API with a busy port, no credentials, and no browser.
const occupied = http.createServer((req, res) => res.end('occupied'))
await new Promise((resolve) => occupied.listen(0, '127.0.0.1', resolve))
const port = occupied.address().port
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(COMFY|FAL|GEMINI|ELEVENLABS|RUNPOD)/.test(key)))
env.HOME = path.join(directory, 'user-home')
env.APPDATA = path.join(directory, 'roaming')
const child = spawn(process.execPath, ['bin/comfyfield.js', '--no-open', '--port', String(port)], {
  env, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32', windowsHide: true,
})
let output = ''
child.stdout.on('data', (data) => { output += data })
child.stderr.on('data', (data) => { output += data })
let launchError
child.on('error', (error) => { launchError = error })
try {
  const deadline = Date.now() + 60000
  let match
  while (Date.now() < deadline) {
    if (launchError) throw launchError
    if (child.exitCode != null) throw Error(`Launcher exited: ${output}`)
    match = /ComfyField is ready: (http:\/\/127\.0\.0\.1:\d+)/.exec(output)
    if (match) break
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  assert.ok(match, `Launcher did not start: ${output}`)
  const origin = match[1]
  assert.ok(Number(new URL(origin).port) > port, output)
  assert.match(output, /is in use/)
  assert.match(output, /No keys yet/)
  const expectedData = dataDirectory({ env, userHome: env.HOME })
  assert.ok(output.includes(`Data: ${expectedData}`), output)
  assert.ok(fs.existsSync(expectedData), 'The launcher creates the per-user folder, outside the package')
  assert.ok(output.includes(`${origin}/connections`))
  const html = await fetch(`${origin}/connections`).then((r) => r.text())
  assert.match(html, /<div id="root">/)
  assert.ok(!html.includes('/@vite/client'), 'Launcher serves the production build')
  const apiRequest = (method, headers) => new Promise((resolve, reject) => {
    const request = http.request(`${origin}/api/connections`, { method, headers }, (response) => { response.resume(); response.on('end', () => resolve(response.statusCode)) })
    request.on('error', reject)
    request.end()
  })
  for (const method of ['GET', 'POST']) {
    assert.equal(await apiRequest(method, { host: 'rebind.example', origin: 'http://rebind.example' }), 403)
    assert.equal(await apiRequest(method, { origin: 'https://foreign.example' }), 403)
    assert.equal(await apiRequest(method, { 'sec-fetch-site': 'cross-site' }), 403)
  }
  assert.equal(await apiRequest('GET', { origin }), 200)
  assert.equal(await apiRequest('GET', { host: `localhost:${new URL(origin).port}` }), 200)
  const connections = await fetch(`${origin}/api/connections`).then((r) => r.json())
  assert.ok(Object.values(connections).every((c) => !c.connected), 'API is on the same port without any keys')
  console.log(`Startup checks passed on ${process.platform}/${process.arch}: production app, same-port API, occupied port fallback, isolated per-user storage, no keys, ffmpeg fallback, rebinding and origin guards, dependency repair, dotenv, disk drives, old Node guidance and browser commands`)
} finally {
  await killProcessTree(child)
  await new Promise((resolve) => occupied.close(resolve))
}
