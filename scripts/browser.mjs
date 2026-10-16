import { existsSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

export const browserTimeout = process.env.CI ? 60000 : 20000
export const uiTimeout = process.env.CI ? 30000 : 10000

export function chromeExecutable() {
  const executable = process.env.CHROME_PATH || [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find(existsSync)
  if (!executable) throw new Error('Set CHROME_PATH to a local Chrome executable')
  return executable
}

// Kill only the process tree owned by this check, including Chrome's renderer children.
export async function killProcessTree(child) {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null) return
  if (process.platform === 'win32') {
    await new Promise((done) => {
      const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
      killer.once('error', done)
      killer.once('close', done)
    })
  } else {
    try { process.kill(-child.pid, 'SIGKILL') } catch { child.kill('SIGKILL') }
  }
}

export async function startBrowser(name, { executable = chromeExecutable(), args = [], onEvent = () => {} } = {}) {
  const root = resolve('outputs/browser-profiles')
  mkdirSync(root, { recursive: true })
  const profile = mkdtempSync(join(root, `${name}-`))
  // Chrome binds an OS-assigned free port atomically and writes it into this fresh profile.
  const chrome = spawn(executable, [
    '--headless=new', '--use-mock-keychain', '--password-store=basic', '--no-sandbox',
    '--disable-gpu', '--disable-extensions', '--disable-background-networking',
    '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, ...args, 'about:blank',
  ], { detached: process.platform !== 'win32', windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
  let stderr = ''
  let launchError
  let exited = false
  const closed = new Promise((done) => chrome.once('close', () => { exited = true; done() }))
  chrome.once('error', (error) => { launchError = error })
  chrome.stderr.on('data', (data) => { stderr = (stderr + data).slice(-8000) })
  let socket
  let sequence = 0
  const pending = new Map()
  const rejectPending = (error) => {
    for (const task of pending.values()) { clearTimeout(task.timer); task.reject(error) }
    pending.clear()
  }
  const send = (method, params = {}, timeout = browserTimeout) => new Promise((resolve, reject) => {
    if (socket?.readyState !== WebSocket.OPEN) return reject(new Error(`CDP disconnected: ${method}`))
    const id = ++sequence
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout after ${timeout}ms: ${method}`)) }, timeout)
    pending.set(id, { resolve, reject, timer })
    try { socket.send(JSON.stringify({ id, method, params })) } catch (error) {
      clearTimeout(timer)
      pending.delete(id)
      reject(error)
    }
  })
  let closing
  const close = () => closing ||= (async () => {
    process.off('SIGINT', shutdown)
    process.off('SIGTERM', shutdown)
    process.off('message', message)
    process.off('disconnect', shutdown)
    await send('Browser.close', {}, 3000).catch(() => {})
    socket?.close()
    rejectPending(new Error('Chrome closed'))
    if (!exited) await Promise.race([closed, delay(5000, undefined, { ref: false })])
    if (!exited) await killProcessTree(chrome)
    if (!exited) await closed
  })()
  const shutdown = () => { close().finally(() => process.exit(1)) }
  const message = (value) => { if (value?.type === 'shutdown') shutdown() }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
  process.on('message', message)
  process.once('disconnect', shutdown)
  try {
    const deadline = Date.now() + browserTimeout
    let target
    let port
    while (Date.now() < deadline) {
      if (launchError) throw launchError
      if (exited) throw new Error(`Chrome exited with ${chrome.exitCode ?? chrome.signalCode}`)
      try {
        port = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0])
        const endpoint = `http://127.0.0.1:${port}`
        const version = await fetch(`${endpoint}/json/version`, { signal: AbortSignal.timeout(1000) }).then((r) => r.json())
        const pages = await fetch(`${endpoint}/json/list`, { signal: AbortSignal.timeout(1000) }).then((r) => r.json())
        target = version.webSocketDebuggerUrl && pages.find((page) => page.type === 'page' && page.webSocketDebuggerUrl)
        if (target) break
      } catch {}
      await delay(100)
    }
    if (!target) throw new Error(`DevTools endpoint was not ready after ${browserTimeout}ms`)
    socket = new WebSocket(target.webSocketDebuggerUrl)
    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      const task = pending.get(data.id)
      if (task) {
        pending.delete(data.id)
        clearTimeout(task.timer)
        if (data.error) task.reject(new Error(`${data.error.message} (${data.error.code})`))
        else task.resolve(data.result)
      } else if (data.method) onEvent(data)
    })
    socket.addEventListener('close', () => rejectPending(new Error('Chrome disconnected')))
    socket.addEventListener('error', () => rejectPending(new Error('Chrome WebSocket error')))
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('DevTools WebSocket connection timed out')), browserTimeout)
      socket.addEventListener('open', () => { clearTimeout(timer); resolve() }, { once: true })
      socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('DevTools WebSocket connection failed')) }, { once: true })
      socket.addEventListener('close', () => { clearTimeout(timer); reject(new Error('DevTools WebSocket closed before connecting')) }, { once: true })
    })
    console.log(`${name}: Chrome pid ${chrome.pid}, DevTools port ${port}, profile ${profile}`)
    return { send, close }
  } catch (error) {
    await close()
    throw new Error(`${name}: ${error.message}\n${stderr}`, { cause: error })
  }
}
