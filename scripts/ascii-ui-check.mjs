import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'

// The ASCII background: the Settings toggle, throttling, hidden tab, reduced motion,
// devicePixelRatio, resize and the 2 ms frame budget at 1440px and 390px.
// Run `npx vite build` first. A mock API answers; no provider routes or keys load.
// Set ASCII_SHOTS=<folder> to save screenshots of both backgrounds at both widths.
const BUDGET_MS = 2
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'ascii-mock-api', configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/connections') return res.end(JSON.stringify({ fal: { connected: true } }))
      if (url.pathname === '/api/agents/events') { res.setHeader('Content-Type', 'text/event-stream'); return res.write(': mock\n\n') }
      if (/^\/api\/(agents|stitch\/exports|flows)$/.test(url.pathname)) return res.end('[]')
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
let browser
try {
  const errors = []
  browser = await startBrowser('ascii-ui', { onEvent(msg) {
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
    throw new Error(`Timed out: ${expression}\n${JSON.stringify(errors)}`)
  }
  const size = (width, deviceScaleFactor = 1) => cdp('Emulation.setDeviceMetricsOverride', { width, height: width > 720 ? 900 : 844, deviceScaleFactor, mobile: width <= 720 })
  const motion = (value) => cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] })
  const load = async () => {
    await cdp('Page.navigate', { url: `${origin}/image` })
    await wait('document.readyState === "complete" && document.querySelector(".nav-menu")')
  }
  const stats = () => evaluate('({ ...document.querySelector(".ascii-bg canvas").asciiField.stats })')
  const shots = process.env.ASCII_SHOTS
  const shot = async (name) => {
    if (!shots) return
    await pause(400)
    const data = await cdp('Page.captureScreenshot', { format: 'png' })
    mkdirSync(shots, { recursive: true })
    writeFileSync(`${shots}/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  // Drives the field's own draw call once per animation frame, as the live loop does, at the throttled
  // clock step, and times each call in the page. The live loop is paused (tab marked hidden) meanwhile.
  const bench = (frames) => evaluate(`new Promise((done) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    const field = document.querySelector('.ascii-bg canvas').asciiField
    const step = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ascii-frame'))
    const times = []
    let changed = 0
    // One untimed frame first: jumping from the live clock to the bench clock repaints most cells.
    field.draw(100000 - step)
    const frame = () => {
      const start = performance.now()
      changed += field.draw(100000 + times.length * step)
      times.push(performance.now() - start)
      if (times.length < ${frames}) return requestAnimationFrame(frame)
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
      document.dispatchEvent(new Event('visibilitychange'))
      times.sort((a, b) => a - b)
      const { cols, rows } = field.size()
      const at = (q) => times[Math.min(times.length - 1, Math.floor(times.length * q))]
      done({ cells: cols * rows, changedPerFrame: Math.round(changed / ${frames}),
        mean: times.reduce((a, b) => a + b, 0) / times.length, p95: at(0.95), p99: at(0.99), max: times[times.length - 1] })
    }
    requestAnimationFrame(frame)
  })`)
  const report = (label, r) => console.log(`${label}: ${r.cells} cells, ${r.changedPerFrame} redrawn per frame, mean ${r.mean.toFixed(3)} ms, p95 ${r.p95.toFixed(3)} ms, p99 ${r.p99.toFixed(3)} ms, max ${r.max.toFixed(3)} ms`)

  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await motion('no-preference')
  await size(1440)
  await cdp('Page.navigate', { url: `${origin}/api/connections` })
  await wait('document.readyState === "complete"')
  await evaluate('localStorage.clear()')
  await load()

  // Sky is the default; the toggle lives in the Settings menu and persists.
  assert(await evaluate('Boolean(document.querySelector(".sky")) && !document.querySelector(".ascii-bg")'), 'Sky is the default background')
  await shot('sky-1440')
  await evaluate('[...document.querySelectorAll(".nav-menu button")].find((b) => b.textContent.trim() === "Settings").click()')
  await wait('document.querySelector("#settings-menu [role=menuitemradio]")')
  assert.deepEqual(await evaluate('[...document.querySelectorAll("#settings-menu [role=menuitemradio]")].map((b) => [b.textContent, b.getAttribute("aria-checked")])'), [['Sky', 'true'], ['ASCII', 'false']])
  await evaluate('[...document.querySelectorAll("#settings-menu [role=menuitemradio]")].find((b) => b.textContent === "ASCII").click()')
  await wait('document.querySelector(".ascii-bg canvas")?.asciiField')
  assert(!(await evaluate('Boolean(document.querySelector(".sky"))')), 'ASCII replaces the sky')
  assert.equal(await evaluate('localStorage.getItem("comfyfield.backdrop")'), 'ascii')
  assert.equal(await evaluate('document.querySelector("#settings-menu [aria-checked=true]").textContent'), 'ASCII')
  await shot('ascii-menu-1440')
  await evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))')
  await wait('!document.querySelector("#settings-menu")')

  // The field draws characters, and the canvas matches the viewport in device pixels.
  assert.deepEqual(await evaluate('[document.querySelector(".ascii-bg canvas").width, document.querySelector(".ascii-bg canvas").height]'), [1440, 900])
  const inked = () => evaluate(`(() => {
    const c = document.querySelector('.ascii-bg canvas')
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
    let n = 0
    for (let i = 3; i < d.length; i += 4) if (d[i]) n++
    return n / (d.length / 4)
  })()`)
  const ink = await inked()
  assert(ink > 0.01 && ink < 0.5, `the field is subtle but present (${(ink * 100).toFixed(1)}% of pixels inked)`)

  // Throttled: about 15 frames a second, not 60.
  let before = await stats()
  await pause(2000)
  let after = await stats()
  const fps = (after.frames - before.frames) / 2
  console.log(`live loop: ${fps} frames per second, worst live frame ${after.max.toFixed(3)} ms, full repaint ${after.full.toFixed(3)} ms`)
  assert(fps >= 8 && fps <= 22, `the loop is throttled to about 15 fps (${fps})`)
  await shot('ascii-1440')

  // Hidden tab: the loop stops, and starts again when the tab shows.
  await evaluate('Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" }); document.dispatchEvent(new Event("visibilitychange"))')
  before = await stats()
  await pause(700)
  after = await stats()
  assert.equal(after.frames, before.frames, 'no frames while the tab is hidden')
  await evaluate('Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" }); document.dispatchEvent(new Event("visibilitychange"))')
  await pause(700)
  assert((await stats()).frames > after.frames, 'frames resume when the tab shows')

  // The budget, at 1440px and 390px.
  const wide = await bench(300)
  report('1440px, 1x', wide)
  await size(390)
  await wait('document.querySelector(".ascii-bg canvas").width === 390')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'the page fits 390px')
  const narrow = await bench(300)
  report('390px, 1x', narrow)
  await shot('ascii-390')

  // devicePixelRatio: a sharp canvas at 2x, and the budget still holds.
  await size(1440, 2)
  await load()
  await wait('document.querySelector(".ascii-bg canvas")?.width === 2880')
  const retina = await bench(300)
  report('1440px, 2x', retina)
  for (const [label, r] of [['1440px', wide], ['390px', narrow], ['1440px 2x', retina]]) {
    assert(r.p95 < BUDGET_MS, `${label}: p95 frame ${r.p95.toFixed(3)} ms is over ${BUDGET_MS} ms`)
    assert(r.mean < BUDGET_MS, `${label}: mean frame ${r.mean.toFixed(3)} ms is over ${BUDGET_MS} ms`)
  }

  // Reduced motion: one still frame, no loop.
  await size(1440)
  await motion('reduce')
  await load()
  await wait('document.querySelector(".ascii-bg canvas")?.asciiField')
  await pause(1000)
  const still = await stats()
  assert.equal(still.frames, 1, `reduced motion draws one still frame (${still.frames})`)
  assert((await inked()) > 0.01, 'the still frame shows the field')

  // At 390px the toggle sits in the menu sheet; back to the sky from there.
  await size(390)
  await motion('no-preference')
  await load()
  await evaluate('document.querySelector(".nav-burger").click()')
  await wait('document.querySelector(".mnav [role=radiogroup]")')
  assert.deepEqual(await evaluate('[...document.querySelectorAll(".mnav [role=radio]")].map((b) => [b.textContent, b.getAttribute("aria-checked")])'), [['Sky', 'false'], ['ASCII', 'true']])
  await evaluate('document.querySelector(".mnav-body").scrollTop = 1e6')
  await shot('ascii-menu-390')
  await evaluate('[...document.querySelectorAll(".mnav [role=radio]")].find((b) => b.textContent === "Sky").click()')
  await wait('document.querySelector(".sky") && !document.querySelector(".ascii-bg")')
  assert.equal(await evaluate('localStorage.getItem("comfyfield.backdrop")'), 'sky')
  await evaluate('document.querySelector(".mnav-close").click()')
  await wait('!document.querySelector(".mnav")')
  await shot('sky-390')
  assert.deepEqual(errors, [])
  console.log('ascii ui ok')
} finally {
  await browser?.close()
  await server.close()
}
