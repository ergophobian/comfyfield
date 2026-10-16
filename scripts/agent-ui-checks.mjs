import WebSocket from 'ws'
// Run against scripts/agent-ui-fixture.mjs. Uses a separate headless Chrome profile.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { startFixture } from './agent-ui-fixture.mjs'
import { chromeExecutable } from './browser.mjs'
import { setTimeout as wait } from 'node:timers/promises'

const executable = chromeExecutable()
const fixtures = [await startFixture(), await startFixture(true)]
const profile = path.resolve('.comfyfield', 'agent-chrome', String(Date.now()))
const output = path.resolve('research_notes', 'agent-harness')
fs.mkdirSync(profile, { recursive: true })
fs.mkdirSync(output, { recursive: true })
const chrome = spawn(executable, ['--headless=new', '--use-mock-keychain', '--password-store=basic', '--no-sandbox', '--disable-gpu', '--disable-extensions', '--disable-background-networking', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
chrome.stderr.on('data', (data) => process.stderr.write(data))
let socket
const pending = new Map()
let counter = 0
const errors = []
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++counter
  const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 15000)
  pending.set(id, { resolve, reject, timer })
  socket.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}
const until = async (expression) => {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(expression)) return
    await wait(100)
  }
  throw new Error(`UI did not become ready: ${expression}`)
}
const click = (text) => evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)}); if (!b || b.disabled) throw new Error('Button unavailable: ' + ${JSON.stringify(text)}); b.click() })()`)
const screenshot = async (name) => {
  await wait(350)
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  fs.writeFileSync(path.join(output, name), Buffer.from(data, 'base64'))
}
try {
  const portFile = path.join(profile, 'DevToolsActivePort')
  for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await wait(100)
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0]
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    const p = pending.get(data.id)
    if (p) { pending.delete(data.id); clearTimeout(p.timer); data.error ? p.reject(new Error(data.error.message)) : p.resolve(data.result) }
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails)
  }
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: 'http://127.0.0.1:5317/assistant' })
  await until(`document.querySelector('[aria-label="Agent"]')?.value === 'fake'`)
  await click('Start session')
  await until(`document.body.textContent.includes('Agent 1 · Ready')`)
  await evaluate(`(() => { const input = document.querySelector('textarea[aria-label="Message"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'A paper boat drifting down a rainy street at dusk'); input.dispatchEvent(new Event('input', { bubbles: true })) })()`)
  await click('Send')
  await until(`document.body.textContent.includes('Approve plan')`)
  assert.ok(await evaluate(`document.body.textContent.includes('0.0040')`))
  assert.ok(await evaluate(`document.body.textContent.includes('Fake adapter test')`))
  await screenshot('assistant-plan-desktop.png')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await evaluate(`document.querySelector('.agent-plan').scrollIntoView({ block: 'start' })`)
  await screenshot('assistant-plan-mobile.png')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 390'), 'Assistant must fit 390px')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: 'http://127.0.0.1:5317/flows' })
  await until(`document.querySelector('.agent-node-badge')?.textContent.includes('Agent 1 is working on this')`)
  await click('Assistant')
  await until(`document.querySelector('.agent-canvas-panel')?.textContent.includes('Approve plan')`)
  await screenshot('canvas-presence-desktop.png')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await screenshot('canvas-presence-mobile.png')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 390'), 'Canvas must fit 390px')
  await click('Approve plan')
  await until(`document.body.textContent.includes('Fake adapter completed. Approval worked')`)
  await until(`!document.querySelector('.agent-node-badge')`)
  await click('Stop session')
  await until(`document.body.textContent.includes('Agent 1 · Stopped')`)
  await click('Close assistant')
  await evaluate(`(async () => {
    const input = document.querySelector('[aria-label="Flow name"]')
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'My unsaved edit')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    const store = await (await fetch('/api/flows')).json()
    store.flows[0].name = 'External edit'
    await fetch('/api/flows', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(store) })
  })()`)
  await until(`document.body.textContent.includes('Export unsaved flow')`)
  assert.equal(await evaluate(`document.querySelector('[aria-label="Flow name"]').value`), 'My unsaved edit')
  await click('Reload flows')
  await until(`document.querySelector('[aria-label="Flow name"]').value === 'External edit'`)
  await send('Page.navigate', { url: 'http://127.0.0.1:5318/assistant' })
  await until(`document.body.textContent.includes('Set up a local agent') && document.body.textContent.includes('codex login')`)
  assert.equal(await evaluate(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Start session')?.disabled`), true)
  assert.ok(await evaluate(`document.body.textContent.includes('codex login')`))
  await screenshot('assistant-setup-mobile.png')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false })
  await screenshot('assistant-setup-desktop.png')
  assert.equal(errors.length, 0, JSON.stringify(errors))
  console.log('ok    desktop/mobile chat, approval, canvas presence, stop, conflicting edits and missing-agent setup; screenshots saved')
} finally {
  socket?.close()
  chrome.kill()
  await Promise.all(fixtures.map((server) => server.close()))
  for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error('Chrome closed')) }
}
