import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { parseArgs } from 'node:util'
import { dataDirectory } from './startup-paths.js'
import { nodeProblem, startupChecks, storageChecks } from './startup-checks.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

function viteEntry() {
  try { return path.join(path.dirname(require.resolve('vite/package.json')), 'bin/vite.js') } catch { return null }
}

function command(binary, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { cwd: root, stdio: 'inherit', windowsHide: true, ...options })
    child.once('error', () => reject(new Error('Could not run the setup command. Reinstall Node.js with npm, then run npm start again.')))
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error('Setup did not finish. Check your internet connection and available disk space, then run npm start again.')))
  })
}

export async function ensureApp({ dev = false, log = console.log } = {}) {
  let vite = viteEntry()
  if (!vite) {
    log('Installing ComfyField dependencies. The first start needs an internet connection.')
    const npm = [process.env.npm_execpath, path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')].find((file) => file && fs.existsSync(file))
    if (npm) await command(process.execPath, [npm, 'install', '--include=dev', '--no-audit', '--no-fund'])
    else if (process.platform === 'win32') await command('cmd.exe', ['/d', '/s', '/c', 'npm install --include=dev --no-audit --no-fund'])
    else await command('npm', ['install', '--include=dev', '--no-audit', '--no-fund'])
    vite = viteEntry()
    if (!vite) throw new Error('Vite is missing after setup. Run npm install in the app folder, then npm start again.')
  }
  if (!dev && !fs.existsSync(path.join(root, 'dist', 'index.html'))) {
    log('Building ComfyField for the first start.')
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
  const directory = dataDirectory()
  const storage = await storageChecks(directory)
  for (const check of storage) log(check.message)
  if (storage.some((c) => c.level === 'error')) throw new Error('Startup paused. Free some disk space, then try again.')
  await ensureApp({ dev, log })
  for (const check of await startupChecks(directory, { storage: false })) log(check.message)
  const { preview, createServer } = await import('vite')
  const { default: comfyfieldApi } = await import('./plugin.js')
  const options = { root, configFile: false, envFile: false, plugins: [comfyfieldApi()], logLevel: 'error' }
  let server
  let selected = port
  for (; selected <= Math.min(port + 20, 65535); selected++) {
    try {
      if (dev) {
        const { default: react } = await import('@vitejs/plugin-react')
        server = await createServer({ ...options, plugins: [react(), comfyfieldApi()], server: { host: '127.0.0.1', port: selected, strictPort: true, watch: { ignored: ['**/outputs/**', '**/.comfyfield/**'] } } })
        await server.listen()
      } else server = await preview({ ...options, preview: { host: '127.0.0.1', port: selected, strictPort: true } })
      break
    } catch (error) {
      if (server?.close) await server.close()
      if (error.code !== 'EADDRINUSE' && !/Port .* is already in use/.test(error.message)) throw error
      log(`Port ${selected} is in use. Trying ${selected + 1}.`)
    }
  }
  if (!server || selected > Math.min(port + 20, 65535)) throw new Error('No free port nearby. Try npm start -- --port 5300')
  const url = `http://127.0.0.1:${selected}`
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
