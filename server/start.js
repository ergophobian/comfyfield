import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { parseArgs } from 'node:util'
import { dataDirectory } from './startup-paths.js'
import { bindHost } from './local-access.js'
import { nodeProblem, startupChecks, storageChecks, installationStorageChecks } from './startup-checks.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

function command(binary, args, { capture = false, ...options } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { cwd: root, stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', windowsHide: true, ...options })
    let output = ''
    if (capture) { child.stdout.on('data', (data) => { output += data }); child.stderr.resume() }
    child.once('error', () => reject(new Error('Could not run the setup command. Reinstall Node.js with npm, then run npm start again.')))
    child.once('exit', (code) => code === 0 ? resolve(output.trim()) : reject(new Error('Setup did not finish. Check your internet connection and available disk space, then run npm start again.')))
  })
}

function npmCommand(args, options) {
  const npm = [process.env.npm_execpath, path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')].find((file) => file && fs.existsSync(file))
  if (npm) return command(process.execPath, [npm, ...args], options)
  if (process.platform === 'win32') return command('cmd.exe', ['/d', '/s', '/c', 'npm', ...args], options)
  return command('npm', args, options)
}

export function missingDependencies({ directory = root, dev = false, resolve = createRequire(path.join(directory, 'package.json')).resolve } = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'))
  const dependencies = { ...manifest.dependencies, ...((dev || !fs.existsSync(path.join(directory, 'dist/index.html'))) ? manifest.devDependencies : {}) }
  const entries = { '@modelcontextprotocol/sdk': '@modelcontextprotocol/sdk/server/mcp.js' }
  return Object.keys(dependencies).filter((name) => {
    try { resolve(entries[name] || name); return false } catch { return true }
  })
}

export async function ensureDependencies({ dev = false, log = console.log, directory = root, runNpm = npmCommand, resolve } = {}) {
  if (!missingDependencies({ directory, dev, resolve }).length) return
  log('Installing missing ComfyField dependencies. The first start needs an internet connection. Dependency lifecycle scripts will run; the optional ffmpeg download may be skipped if unavailable.')
  const install = fs.existsSync(path.join(directory, 'package-lock.json')) ? 'ci' : 'install'
  await runNpm([install, '--include=dev', '--no-audit', '--no-fund'], { cwd: directory })
  const missing = missingDependencies({ directory, dev, resolve })
  if (missing.length) throw new Error(`Setup is incomplete (${missing.join(', ')}). Run npm install in the app folder, then npm start again.`)
}

export async function loadEnvironment(directory = root, mode = 'production') {
  const { loadEnv } = await import('vite')
  Object.assign(process.env, loadEnv(mode, directory, ''))
}

export async function ensureApp({ dev = false, log = console.log } = {}) {
  await ensureDependencies({ dev, log })
  if (!dev && !fs.existsSync(path.join(root, 'dist', 'index.html'))) {
    log('Building ComfyField for the first start.')
    const vite = path.join(path.dirname(require.resolve('vite/package.json')), 'bin/vite.js')
    await command(process.execPath, [vite, 'build'], { env: { ...process.env, NODE_ENV: 'production' } })
  }
}

export function openBrowser(url, { platform = process.platform, launch = spawn } = {}) {
  const [binary, args] = platform === 'win32'
    ? ['rundll32', ['url.dll,FileProtocolHandler', url]]
    : platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]]
  return new Promise((resolve) => {
    const child = launch(binary, args, { stdio: 'ignore', windowsHide: true })
    child.once('error', () => resolve(false))
    child.once('exit', (code) => resolve(code === 0))
  })
}

export async function start(args = [], { dev = false, log = console.log, open = openBrowser } = {}) {
  const problem = nodeProblem(process.versions.node)
  if (problem) throw new Error(problem)
  const { values } = parseArgs({ args, options: { port: { type: 'string' }, 'no-open': { type: 'boolean' } } })
  const port = Number(values.port ?? 5173)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Choose a port between 1 and 65535, for example: npm start -- --port 5300')
  const reportStorage = (checks) => {
    for (const check of checks) log(check.message)
    if (checks.some((c) => c.level === 'error')) throw new Error('Startup paused. Free some disk space, then try again.')
  }
  const cache = await npmCommand(['config', 'get', 'cache'], { capture: true, timeout: 10000 })
  reportStorage(await installationStorageChecks(root, cache))
  await ensureDependencies({ dev, log })
  await loadEnvironment(root, dev ? 'development' : 'production')
  const directory = dataDirectory()
  reportStorage(await storageChecks(directory))
  await ensureApp({ dev, log })
  for (const check of await startupChecks(directory, { storage: false })) log(check.message)
  const { preview, createServer } = await import('vite')
  const { default: comfyfieldApi } = await import('./plugin.js')
  const host = bindHost(process.env, log)
  const allowedHosts = process.env.COMFYFIELD_HOST ? [process.env.COMFYFIELD_HOST] : []
  const options = { root, configFile: false, envFile: false, plugins: [comfyfieldApi()], logLevel: 'error' }
  let server
  let selected = port
  for (; selected <= Math.min(port + 20, 65535); selected++) {
    try {
      if (dev) {
        const { default: react } = await import('@vitejs/plugin-react')
        server = await createServer({ ...options, plugins: [react(), comfyfieldApi()], server: { host, allowedHosts, port: selected, strictPort: true, watch: { ignored: ['**/outputs/**', '**/.comfyfield/**'] } } })
        await server.listen()
      } else server = await preview({ ...options, preview: { host, allowedHosts, port: selected, strictPort: true } })
      break
    } catch (error) {
      if (server?.close) await server.close()
      if (error.code !== 'EADDRINUSE' && !/Port .* is already in use/.test(error.message)) throw error
      log(`Port ${selected} is in use. Trying ${selected + 1}.`)
    }
  }
  if (!server || selected > Math.min(port + 20, 65535)) throw new Error('No free port nearby. Try npm start -- --port 5300')
  const browserHost = ['0.0.0.0', '::', '[::]'].includes(host) ? '127.0.0.1' : host.includes(':') && !host.startsWith('[') ? `[${host}]` : host
  const url = `http://${browserHost}:${selected}`
  log(`ComfyField is ready: ${url}`)
  log(`Connections: ${url}/connections`)
  log(`Data: ${directory}`)
  log('Keep this terminal open. Press Ctrl+C to stop.')
  const close = () => new Promise((resolve) => server.httpServer.close(resolve))
  const shutdown = () => { close().finally(() => process.exit(0)) }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
  if (!values['no-open'] && !await open(url)) log(`Could not open a browser. Open ${url} yourself.`)
  return { server, url, close }
}
