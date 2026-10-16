import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { preview } from 'vite'
import { schemas } from '../src/lib/formats/schemas.js'
import { allFormats } from '../src/lib/formats/index.js'

// A separate Vite server with an in-process mock API never loads provider routes or keys.
const executable = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync)
assert(executable, 'Set CHROME_PATH to a local Chrome executable')

const requests = []
const svg = (label) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="600" height="750" fill="#e4e9ff"/><circle cx="300" cy="280" r="120" fill="#9b8cf5"/><path d="M100 680 Q100 380 300 390 Q500 380 500 680Z" fill="#6f7fd8"/><text x="300" y="720" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#30384d">${label}</text></svg>`
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'format-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname.startsWith('/mock-')) {
        res.setHeader('Content-Type', 'image/svg+xml')
        res.end(svg(url.pathname === '/mock-photo.svg' ? 'Mock input' : 'Mock result'))
        return
      }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/connections') return res.end(JSON.stringify({ fal: { connected: true }, google: { connected: true } }))
      if (url.pathname === '/api/fal/schema') return res.end(JSON.stringify(schemas.fal[url.searchParams.get('id')] || { properties: { prompt: { type: 'string' } } }))
      if (url.pathname === '/api/upload') { req.resume(); return res.end(JSON.stringify({ url: '/mock-photo.svg' })) }
      if (req.method === 'POST') {
        let body = ''
        for await (const chunk of req) body += chunk
        requests.push({ path: url.pathname, body: JSON.parse(body) })
        if (url.pathname === '/api/prompt') return res.end(JSON.stringify({ text: 'Mock writer prompt for review' }))
        return res.end(JSON.stringify({ files: [{ url: '/mock-result.svg', kind: 'image' }] }))
      }
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const profile = resolve(`node_modules/.cache/format-chrome-${Date.now()}`)
mkdirSync(profile, { recursive: true })
const chrome = spawn(executable, ['--headless=new', '--use-mock-keychain', '--password-store=basic', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-gpu', '--no-sandbox', 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
chrome.stderr.on('data', (data) => process.stderr.write(data))
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
let ws
try {
  for (let i = 0; i < 100 && !existsSync(`${profile}/DevToolsActivePort`); i++) await pause(100)
  const port = readFileSync(`${profile}/DevToolsActivePort`, 'utf8').split('\n')[0]
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json())
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r, { once: true }))
  let id = 0
  const pending = new Map()
  const errors = []
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id) {
      const p = pending.get(msg.id)
      if (!p) return
      clearTimeout(p.timer)
      pending.delete(msg.id)
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)))
      else p.resolve(msg.result)
    } else if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text)
  })
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; const timer = setTimeout(() => { pending.delete(key); reject(new Error(`CDP timeout: ${method}`)) }, 15000); pending.set(key, { resolve, reject, timer }); ws.send(JSON.stringify({ id: key, method, params })) })
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const wait = async (expression) => {
    for (let i = 0; i < 100; i++) { if (await evaluate(`Boolean(${expression})`)) return; await pause(100) }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${JSON.stringify(errors)}`)
  }
  const goto = async (path) => { await cdp('Page.navigate', { url: `${origin}${path}` }); await wait('document.querySelector("main") && document.readyState === "complete"') }
  const screenshot = async (name) => {
    await evaluate('window.scrollTo(0, 0)')
    await pause(300)
    const data = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    mkdirSync('research_notes/format-runner', { recursive: true })
    writeFileSync(`research_notes/format-runner/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  await goto('/apps/relight')
  await wait('document.querySelector("input[type=file]")')
  await evaluate(`(() => { const input = document.querySelector('input[type=file]'); const data = new DataTransfer(); data.items.add(new File(['mock'], 'sample.png', {type:'image/png'})); input.files = data.files; input.dispatchEvent(new Event('change', {bubbles:true})); })()`)
  await wait('document.querySelector(".app-go button") && !document.querySelector(".app-go button").disabled')
  await evaluate('document.querySelector(".app-go button").click()')
  await wait('document.querySelector(".app-results .result img")?.complete')
  assert.equal(requests[0].body.model, 'fal-ai/nano-banana-2/edit')
  assert.deepEqual(requests[0].body.input.image_urls, ['/mock-photo.svg'])
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]")[0]?.formatId === "relight"')
  await screenshot('mock-relight-desktop')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1100, deviceScaleFactor: 1, mobile: true })
  await screenshot('mock-relight-mobile')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'App must fit 390px')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  await goto('/assets')
  await wait('document.querySelector(".lib-card img")?.complete')
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("comfyfield.library"))[0].formatId'), 'relight')
  await screenshot('mock-library-desktop')
  await evaluate('document.querySelector(".lib-card").click()')
  await wait('document.querySelector(".viewer .use-in-btn")')
  await evaluate('document.querySelector(".use-in-btn").click()')
  await wait('document.querySelector(".use-in [role=menuitem]")')
  await evaluate('[...document.querySelectorAll(".use-in [role=menuitem]")].find((b) => b.textContent === "Upscale").click()')
  await wait('document.querySelector("[role=dialog][aria-label=Upscale]")')
  await wait('!document.querySelector(".sheet-foot .btn-blue").disabled')
  await screenshot('mock-shared-sheet-desktop')
  await evaluate('document.querySelector(".sheet-foot .btn-blue").click()')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]").length === 2')
  assert.equal(requests[1].body.model, 'fal-ai/seedvr/upscale/image')
  assert.equal(requests[1].body.input.image_url, '/mock-result.svg')
  assert.equal(requests[1].body.input.upscale_factor, 2)
  await goto('/video')
  await wait('document.querySelector(".gen-preset-change")')
  await evaluate('document.querySelector(".gen-preset-change").click()')
  await wait('document.querySelector("[aria-label=\\"Choose a preset\\"]")')
  assert.equal(await evaluate('document.querySelectorAll(".gen-presets .gen-tile").length'), allFormats.filter((f) => f.kind === 'video' && f.category === 'camera').length + 1)
  await evaluate('document.querySelectorAll(".gen-presets .gen-tile")[1].click()')
  await wait('!document.querySelector(".gen-presets")')
  assert(await evaluate('document.querySelector(".gen-preset-text strong").textContent !== "General"'))
  await evaluate(`localStorage.setItem('comfyfield.picker', JSON.stringify({chosen:{image:'g-nano-banana-2',video:'comfy-ltx',audio:'g-tts'}}))`)
  await goto('/image')
  await wait('document.querySelector("textarea[aria-label=Prompt]")')
  assert.equal(await evaluate('document.querySelectorAll(".gen-feed .result img").length'), 2, 'Format outputs must remain visible in Create')
  await evaluate(`(() => { const input = document.querySelector('textarea[aria-label=Prompt]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'A field of flowers'); input.dispatchEvent(new Event('input', {bubbles:true})); })()`)
  await wait('!document.querySelector(".gen-go").disabled')
  await evaluate('document.querySelector(".gen-go").click()')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]").length === 3')
  assert.equal(requests[2].path, '/api/google')
  assert.equal(requests[2].body.prompt, 'A field of flowers')
  await goto('/apps/effect-aquarium-turn')
  await wait('document.querySelector("input[type=file]")')
  await evaluate(`(() => { const input = document.querySelector('input[type=file]'); const data = new DataTransfer(); data.items.add(new File(['mock'], 'sample.png', {type:'image/png'})); input.files = data.files; input.dispatchEvent(new Event('change', {bubbles:true})); })()`)
  await wait('!document.querySelector(".app-go button").disabled')
  await evaluate('document.querySelector(".app-go button").click()')
  await wait(`document.querySelector('textarea[aria-label="Written prompt"]')`)
  assert.equal(requests.length, 4, 'Only the writer runs before review')
  assert.equal(requests[3].path, '/api/prompt')
  assert.deepEqual(requests[3].body.images, ['/mock-photo.svg'])
  await evaluate(`(() => { const input = document.querySelector('textarea[aria-label="Written prompt"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'Edited video prompt from the user'); input.dispatchEvent(new Event('input', {bubbles:true})); })()`)
  await screenshot('mock-writer-review-desktop')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1100, deviceScaleFactor: 1, mobile: true })
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Effect review must fit 390px')
  await screenshot('mock-writer-review-mobile')
  await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Send to render").click()')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]").length === 4')
  assert.equal(requests[4].path, '/api/comfy/run')
  assert.equal(requests[4].body.workflow, 'ltx_i2v')
  assert.equal(requests[4].body.vars.prompt, 'Edited video prompt from the user')
  assert.equal(requests[4].body.vars.image, '/mock-photo.svg')
  await goto('/apps/expand')
  await wait('document.body.innerText.includes("Nothing lives at this address")')
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('UI mock checks ok: app runner, shared sheet, Library after reload, 390px layout, Create generation/feed/camera presets and hidden invalid route. Four mocked generations and one reviewed writer request; no provider calls. Six screenshots saved.')
  await cdp('Browser.close').catch(() => {})
} finally {
  ws?.close()
  chrome.kill()
  await server.close()
}
