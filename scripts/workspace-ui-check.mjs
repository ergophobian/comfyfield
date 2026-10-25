// Workspaces in the browser: the real workspace routes on a temp folder, every other route mocked.
// Makes a workspace, pins a format, runs a mock generation with and without its content rules.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { schemas } from '../src/lib/formats/schemas.js'
import { createWorkspaces, workspaceRoute } from '../server/workspaces.js'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-ws-ui-'))
const service = createWorkspaces({ directory: () => dir })
const requests = []
const jobs = new Map()
const svg = (label, fill = '#e4e9ff') => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="${fill}"/><text x="200" y="210" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#30384d">${label}</text></svg>`
const read = async (req) => { let raw = ''; for await (const c of req) raw += c; return raw ? JSON.parse(raw) : {} }
const send = (res, status, data) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }

const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'workspace-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname === '/media/mock-avatar.svg') { res.setHeader('Content-Type', 'image/svg+xml'); return res.end(svg('ND', '#1d2350')) }
      if (url.pathname.startsWith('/mock-')) {
        res.setHeader('Content-Type', 'image/svg+xml')
        return res.end(svg(url.pathname === '/mock-photo.svg' ? 'Mock input' : 'Mock result'))
      }
      if (!url.pathname.startsWith('/api/')) return next()
      try {
        if (await workspaceRoute(req, res, url, { body: read, send, service })) return
      } catch (e) { return send(res, e.status || 500, { error: e.message }) }
      if (url.pathname === '/api/comfy/requirements') {
        const { workflows } = await read(req)
        return send(res, 200, { connections: { fal: { connected: true }, google: { connected: true }, comfyRouter: { connected: true } }, cloudConnected: true, pod: { phase: 'none' },
          requirements: workflows.map(({ workflow }) => ({ workflow, notOnCloud: [], minVramGb: 0, target: 'cloud', selectedWorkflow: workflow })) })
      }
      if (url.pathname === '/api/connections') return send(res, 200, { fal: { connected: true }, google: { connected: true } })
      if (url.pathname === '/api/fal/schema') return send(res, 200, schemas.fal[url.searchParams.get('id')] || { properties: { prompt: { type: 'string' } } })
      if (url.pathname === '/api/stitch/exports' || url.pathname === '/api/library/generations') return send(res, 200, [])
      if (url.pathname === '/api/upload') {
        // The avatar goes up as JSON with its name; a format's photo goes up as raw bytes.
        const json = (req.headers['content-type'] || '').startsWith('application/json')
        const body = json ? await read(req) : (req.resume(), {})
        return send(res, 200, { url: /avatar/.test(body.name || '') ? '/media/mock-avatar.svg' : '/mock-photo.svg' })
      }
      if (url.pathname.startsWith('/api/jobs/')) return send(res, 200, jobs.get(url.pathname.slice('/api/jobs/'.length)))
      if (url.pathname === '/api/jobs' && req.method === 'POST') {
        const { route, body } = await read(req)
        requests.push({ path: route, body })
        const id = `job-${jobs.size + 1}`
        jobs.set(id, { id, status: 'done', files: [{ url: '/mock-result.svg', kind: 'image' }] })
        return send(res, 200, { id })
      }
      req.resume()
      send(res, 200, {})
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const shots = 'research_notes/workspaces'
let browser
try {
  const errors = []
  browser = await startBrowser('workspace-ui', { onEvent(msg) {
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text)
  } })
  const cdp = browser.send
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const wait = async (expression) => {
    for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) { if (await evaluate(`Boolean(${expression})`)) return; await pause(100) }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${JSON.stringify(errors)}`)
  }
  const goto = async (p) => { await cdp('Page.navigate', { url: `${origin}${p}` }); await wait('document.querySelector("main") && document.readyState === "complete"') }
  const type = (selector, value) => evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)})
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)})
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  const click = (selector, text) => evaluate(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find((e) => ${text ? `e.textContent.trim() === ${JSON.stringify(text)}` : 'true'})
    if (!el) throw new Error('No ${selector} ${text || ''}')
    el.click()
  })()`)
  const file = (selector, name) => evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)}); const data = new DataTransfer()
    data.items.add(new File(['mock'], ${JSON.stringify(name)}, { type: 'image/png' })); input.files = data.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
  const screenshot = async (name) => {
    await evaluate('Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {}))).then(() => true)')
    await pause(200)
    const data = await cdp('Page.captureScreenshot', { format: 'png' })
    fs.mkdirSync(shots, { recursive: true })
    fs.writeFileSync(`${shots}/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })

  // A fresh install shows Default in the bar.
  await goto('/')
  await wait('document.querySelector(".ws-chip .ws-name")?.textContent === "Default"')

  // New workspace from the switcher menu.
  await click('.ws-chip')
  await wait('document.querySelector("#ws-menu")')
  await click('#ws-menu a', 'New workspace')
  await wait('document.querySelector("[role=dialog][aria-label=\'New workspace\']")')
  await file('.ws-sheet input[type=file]', 'avatar.png')
  await wait('document.querySelector(".ws-avatar-pick img")?.complete')
  await type('#ws-name', 'Night drives')
  await type('#ws-desc', 'Lo-fi drives through a city at night')
  await type('#ws-criteria', 'Neon city at night, 35mm film look')
  await type('input[aria-label="Do"]', 'Teal and orange palette')
  await click('.ws-add button', 'Add')
  await type('input[aria-label="Do not"]', 'Faces in frame')
  await evaluate('document.querySelector(\'input[aria-label="Do not"]\').nextElementSibling.click()')
  await type('input[aria-label="Find a format to pin"]', 'relight')
  await wait('[...document.querySelectorAll(".ws-found strong")].some((e) => e.textContent === "Relight")')
  await evaluate('[...document.querySelectorAll(".ws-found strong")].find((e) => e.textContent === "Relight").closest("button").click()')
  await wait('[...document.querySelectorAll(".ws-rule-list li")].some((li) => li.textContent.startsWith("Relight"))')
  await screenshot('mock-workspace-editor')
  await click('.ws-sheet .btn-blue', 'Save')
  await wait('!document.querySelector(".ws-sheet") && document.querySelector(".ws-chip .ws-name")?.textContent === "Night drives"')

  const stored = JSON.parse(fs.readFileSync(path.join(dir, 'workspaces.json'), 'utf8'))
  const night = stored.workspaces.find((w) => w.name === 'Night drives')
  assert.equal(stored.active, night.id, 'The new workspace is active and saved in workspaces.json')
  assert.deepEqual(night.criteria, { text: 'Neon city at night, 35mm film look', do: ['Teal and orange palette'], dont: ['Faces in frame'] })
  assert.deepEqual(night.pinned, ['relight'])
  assert.equal(night.avatar, '/media/mock-avatar.svg')
  assert.equal(night.appendCriteria, true)
  await wait('document.querySelector(".ws-card.on strong")?.textContent === "Night drives"')
  await screenshot('mock-workspaces-page')

  // The switcher menu: both workspaces, the rules toggle.
  await click('.ws-chip')
  await wait('document.querySelectorAll("#ws-menu .ws-item").length === 2')
  assert(await evaluate('document.querySelector("#ws-menu .switch").classList.contains("on")'), 'Rules are on for the new workspace')
  await screenshot('mock-workspace-switcher')
  await evaluate('document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))')

  // Pinned formats show first in Apps.
  await goto('/apps')
  await wait('document.querySelector(".apps-sec h2")?.textContent === "Pinned in Night drives"')
  assert.equal(await evaluate('document.querySelector(".apps-sec .recipe-card strong").textContent'), 'Relight')
  assert(await evaluate('Boolean(document.querySelector(".apps-sec .recipe-card .app-pin"))'), 'Pinned cards carry a Pinned tag')

  // A run in this workspace gets its rules; the format's own prompt stays first.
  const runRelight = async () => {
    await goto('/apps/relight')
    await wait('document.querySelector(".app-panel input[type=file], .app-main input[type=file]")')
    await file('input[type=file]', 'sample.png')
    await wait('document.querySelector(".app-go button") && !document.querySelector(".app-go button").disabled')
    const before = requests.length
    await click('.app-go button')
    for (const deadline = Date.now() + uiTimeout; requests.length === before && Date.now() < deadline;) await pause(100)
    if (requests.length === before) throw new Error(`No run started:
${await evaluate('document.querySelector(".app-panel").innerText')}`)
    return requests.at(-1).body.input.prompt
  }
  await wait('true')
  const rules = 'Neon city at night, 35mm film look\nDo: Teal and orange palette.\nDo not: Faces in frame.'
  const withRules = await runRelight()
  assert(withRules.endsWith(`\n\n${rules}`), `Content rules join the prompt: ${withRules}`)
  assert(await evaluate('document.querySelector(".ws-pin.on")?.textContent === "Pinned"'), 'The app page shows it is pinned')

  // Toggle the rules off from the switcher: the next run sends the format's prompt alone.
  await click('.ws-chip')
  await wait('document.querySelector("#ws-menu .switch.on")')
  await click('#ws-menu .switch')
  await wait('!document.querySelector("#ws-menu .switch.on")')
  assert.equal(service.active().appendCriteria, false)
  const without = await runRelight()
  assert.equal(without, withRules.slice(0, -(rules.length + 2)), 'Toggle off leaves the prompt as the format wrote it')

  // Switch back to Default: no pinned section.
  if (!await evaluate('Boolean(document.querySelector("#ws-menu"))')) await click('.ws-chip')
  await wait('document.querySelector("#ws-menu .ws-item")')
  await evaluate('[...document.querySelectorAll("#ws-menu .ws-item strong")].find((e) => e.textContent === "Default").closest("button").click()')
  await wait('document.querySelector(".ws-chip .ws-name")?.textContent === "Default"')
  assert.equal(service.list().active, 'default')
  await goto('/apps')
  await wait('document.querySelector(".apps-sec h2")')
  assert.notEqual(await evaluate('document.querySelector(".apps-sec h2").textContent'), 'Pinned in Night drives')

  // 390px: the switcher keeps its avatar and the page fits.
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true })
  await goto('/workspaces')
  await wait('document.querySelectorAll(".ws-card").length === 2')
  assert(await evaluate('document.querySelector(".ws-chip").getBoundingClientRect().width > 0'), 'The switcher shows on phones')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Workspaces fit 390px')
  await click('.ws-chip')
  await wait('document.querySelector("#ws-menu")')
  assert(await evaluate('(() => { const r = document.querySelector("#ws-menu").getBoundingClientRect(); return r.left >= 0 && r.right <= 390 })()'), 'The menu fits 390px')
  await screenshot('mock-workspaces-390')

  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('Workspace UI checks ok: create with avatar, rules and a pin; saved to workspaces.json; switcher and rules toggle; pinned first in Apps; rules join the prompt only while on; 390px. Four mock screenshots saved.')
} finally {
  await browser?.close()
  await server.close()
  fs.rmSync(dir, { recursive: true, force: true })
}
