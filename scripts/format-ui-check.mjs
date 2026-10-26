import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { schemas } from '../src/lib/formats/schemas.js'
import { allFormats } from '../src/lib/formats/index.js'

// A separate Vite server with an in-process mock API never loads provider routes or keys.
const requests = []
let generationImports = []
const jobs = new Map()
let connected = true
const savedKeys = []
// A Comfy render that reports live progress, as the Cloud SDK's events() stream does, until the check finishes it.
let progressRender = false
let progressJob = null
let failPrompt = false
let failRender = false
const svg = (label) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="600" height="750" fill="#e4e9ff"/><circle cx="300" cy="280" r="120" fill="#9b8cf5"/><path d="M100 680 Q100 380 300 390 Q500 380 500 680Z" fill="#6f7fd8"/><text x="300" y="720" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#30384d">${label}</text></svg>`
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'format-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname.startsWith('/mock-')) {
        res.setHeader('Content-Type', 'image/svg+xml')
        res.end(svg(url.pathname === '/mock-photo.svg' ? 'Mock input' : url.pathname === '/mock-proof.svg' ? 'Mock proof import' : 'Mock result'))
        return
      }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/comfy/requirements') {
        let body = ''
        for await (const chunk of req) body += chunk
        return res.end(JSON.stringify({
          connections: { fal: { connected: true }, google: { connected: true }, comfyRouter: { connected: true } },
          cloudConnected: true, pod: { phase: 'none' },
          requirements: JSON.parse(body).workflows.map(({ workflow }) => ({ workflow, notOnCloud: [], minVramGb: 0, target: 'cloud', selectedWorkflow: workflow })),
        }))
      }
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/library/generations') {
        if (req.method === 'DELETE') {
          let raw = ''
          for await (const chunk of req) raw += chunk
          generationImports = generationImports.filter((item) => item.id !== JSON.parse(raw).id)
          return res.end('{}')
        }
        return res.end(JSON.stringify(generationImports))
      }
      if (url.pathname === '/api/connections/test') { req.resume(); return res.end(JSON.stringify({ ok: true })) }
      if (url.pathname === '/api/connections' && req.method === 'POST') {
        let raw = ''
        for await (const chunk of req) raw += chunk
        savedKeys.push(JSON.parse(raw))
        connected = true
        return res.end('{}')
      }
      if (url.pathname === '/api/connections') return res.end(JSON.stringify({ fal: { connected }, google: { connected } }))
      if (url.pathname === '/api/fal/schema') return res.end(JSON.stringify(schemas.fal[url.searchParams.get('id')] || { properties: { prompt: { type: 'string' } } }))
      if (url.pathname === '/api/upload') { req.resume(); return res.end(JSON.stringify({ url: '/mock-photo.svg' })) }
      if (url.pathname.startsWith('/api/jobs/')) return res.end(JSON.stringify(jobs.get(url.pathname.slice('/api/jobs/'.length))))
      if (req.method === 'POST') {
        let body = ''
        for await (const chunk of req) body += chunk
        // Generations run as server jobs; record the route the job runs, as a direct call would show it.
        let path = url.pathname
        let data = JSON.parse(body)
        const job = path === '/api/jobs'
        if (job) ({ route: path, body: data } = data)
        requests.push({ path, body: data })
        const failed = (path === '/api/prompt' && failPrompt) || (path === '/api/comfy/run' && failRender)
        if (failed) {
          failPrompt = false
          failRender = false
          if (!job) {
            res.statusCode = 402
            return res.end(JSON.stringify({ error: 'Mock insufficient credits', code: 'insufficient_credits' }))
          }
        }
        if (path === '/api/prompt') return res.end(JSON.stringify({ text: 'Mock writer prompt for review' }))
        const files = [{ url: '/mock-result.svg', kind: 'image' }]
        if (!job) return res.end(JSON.stringify({ files }))
        const id = `job-${jobs.size + 1}`
        if (!failed && progressRender && path === '/api/comfy/run') {
          progressJob = { id, files }
          jobs.set(id, { id, status: 'running', progress: { where: 'Comfy Cloud', status: 'running', value: 0.42, step: 8, steps: 20, nodesDone: 4, nodesTotal: 9, node: 'KSampler' } })
          return res.end(JSON.stringify({ id }))
        }
        jobs.set(id, failed ? { id, status: 'failed', error: { message: 'Mock insufficient credits', status: 402, code: 'insufficient_credits' } } : { id, status: 'done', files })
        return res.end(JSON.stringify({ id }))
      }
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
let browser
try {
  const errors = []
  browser = await startBrowser('format-ui', { onEvent(msg) {
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
  await goto('/')
  await wait('document.querySelector(".ex-art [data-video-cover] img")?.naturalWidth > 0')
  assert(await evaluate('document.querySelector(".ex-art [data-video-cover] img").src.endsWith("/art/video/cinema-studio.webp")'), 'Reduced motion shows the video poster')
  assert.equal(await evaluate('document.querySelectorAll("video").length'), 0, 'Reduced motion must never load or play a video')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await wait('document.querySelector(".ex-art video")?.currentTime > 0')
  assert(await evaluate('(() => { const v = document.querySelector(".ex-art video"); return v.muted && v.loop && v.playsInline && v.preload === "none" && !v.controls && v.getAttribute("aria-hidden") === "true" })()'), 'Decorative covers use muted inline looping playback')
  // Keep the hero selected while recording the two viewports.
  await evaluate('document.querySelector(".ex-hero").dispatchEvent(new PointerEvent("pointerover", {bubbles:true}))')
  mkdirSync('research_notes/video-covers-ui', { recursive: true })
  const coverScreenshot = async (name) => {
    await evaluate('Promise.all(document.getAnimations().filter((animation) => animation.effect?.getTiming().iterations !== Infinity).map((animation) => animation.finished.catch(() => {})))')
    const data = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    writeFileSync(`research_notes/video-covers-ui/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  await coverScreenshot('video-cover-desktop')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1100, deviceScaleFactor: 1, mobile: true })
  await wait('document.querySelector(".ex-art video")?.currentTime > 0 && !document.querySelector(".ex-art video").paused')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Video covers must fit 390px')
  await coverScreenshot('video-cover-390')
  await evaluate('window.scrollTo(0, document.body.scrollHeight)')
  await wait('document.querySelector(".ex-art video")?.paused')
  assert(await evaluate('[...document.querySelectorAll("video")].filter((v) => !v.paused).length <= 4'), 'At most four covers may play')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await wait('!document.querySelector("video")')
  // A fresh document starts with Save-Data enabled, independently of reduced motion.
  const saveData = await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(navigator, 'connection', {configurable:true, value:new EventTarget()}); Object.defineProperty(navigator.connection, 'saveData', {configurable:true, value:true})` })
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await goto('/')
  await wait('document.querySelector(".ex-art [data-video-cover] img")?.naturalWidth > 0')
  assert.equal(await evaluate('document.querySelectorAll("video").length'), 0, 'Save-Data must never load or play a video')
  await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier: saveData.identifier })
  await cdp('Network.enable')
  await cdp('Network.setBlockedURLs', { urls: ['*/art/video/*'] })
  await goto('/')
  await wait('document.querySelector(".ex-art [data-video-cover] img")?.src.endsWith("/art/heroes/cinema.webp") && document.querySelector(".ex-art [data-video-cover] img").naturalWidth > 0')
  await wait('!document.querySelector(".ex-art video")')
  await cdp('Network.setBlockedURLs', { urls: ['*/art/*'] })
  await goto('/')
  await wait('document.querySelector(".ex-art [data-video-cover]") && !document.querySelector(".ex-art [data-video-cover] img") && !document.querySelector(".ex-art video")')
  assert(await evaluate('getComputedStyle(document.querySelector(".ex-art")).backgroundImage.includes("gradient")'), 'Failed media preserves the original gradient')
  await cdp('Network.setBlockedURLs', { urls: [] })
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  console.log('Video cover browser checks ok: poster under reduced motion and Save-Data, visible inline playback, offscreen pause, four-cover ceiling, failed media falls back to still then gradient, desktop/390px screenshots')
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
  assert.deepEqual(await evaluate('[...document.querySelectorAll(".bar-item.on")].map((e) => e.textContent.trim())'), ['Assets'], 'Only the current route is active')
  await screenshot('mock-library-desktop')
  // A narrow desktop pushes Assets past the bar's edge; it must still show in full, clear of the fade.
  await cdp('Emulation.setDeviceMetricsOverride', { width: 900, height: 1100, deviceScaleFactor: 1, mobile: false })
  await goto('/assets')
  await pause(300)
  assert(await evaluate(`(() => {
    const bar = document.querySelector('.bar-list'), on = bar.querySelector('.bar-item.on')
    const fade = parseFloat(getComputedStyle(bar.parentElement, '::after').width) || 0
    const b = bar.getBoundingClientRect(), r = on.getBoundingClientRect()
    return bar.scrollWidth > bar.clientWidth && r.left >= b.left && r.right <= b.right - fade + 1
  })()`), 'The active nav item must show in full, clear of the fade')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  await goto('/assets')
  await wait('document.querySelector(".lib-card img")?.complete')
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
  progressRender = true
  await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Send to render").click()')
  // Live Cloud progress shows on the generation tile while the job runs.
  await wait('document.querySelector(".result-wait [role=progressbar]")')
  assert.match(await evaluate('document.querySelector(".result-wait").innerText'), /Rendering 42%, step 8 of 20/)
  assert.equal(await evaluate('document.querySelector(".result-wait [role=progressbar]").getAttribute("aria-valuenow")'), '42')
  await evaluate('document.querySelector(".app-results")?.scrollIntoView()')
  await pause(300)
  const progressShot = await cdp('Page.captureScreenshot', { format: 'png' })
  mkdirSync('research_notes/format-runner', { recursive: true })
  writeFileSync('research_notes/format-runner/mock-cloud-progress-mobile.png', Buffer.from(progressShot.data, 'base64'))
  progressRender = false
  jobs.set(progressJob.id, { id: progressJob.id, status: 'done', files: progressJob.files })
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]").length === 4')
  assert.equal(requests[4].path, '/api/comfy/run')
  assert.equal(requests[4].body.workflow, 'ltx25_i2v')
  assert.equal(requests[4].body.vars.prompt, 'Edited video prompt from the user')
  assert.equal(requests[4].body.vars.image, '/mock-photo.svg')
  await goto('/apps/podcast-clips')
  await wait('document.body.innerText.includes("Nothing lives at this address")')
  // Both a failed writer and a failed render retain the app's session and review panel.
  const beforeRecovery = requests.length
  failPrompt = true
  await goto('/apps/effect-aquarium-turn')
  await wait('document.querySelector("input[type=file]")')
  await evaluate(`(() => { const input = document.querySelector('input[type=file]'); const data = new DataTransfer(); data.items.add(new File(['mock'], 'retry.png', {type:'image/png'})); input.files = data.files; input.dispatchEvent(new Event('change', {bubbles:true})); })()`)
  await wait('!document.querySelector(".app-go button").disabled')
  await evaluate('document.querySelector(".app-go button").click()')
  const retryVisible = '[...document.querySelectorAll(".format-review button")].some((b) => b.textContent === "Retry failed" && !b.disabled)'
  await wait(retryVisible)
  assert.equal(requests.length, beforeRecovery + 1)
  await screenshot('mock-app-writer-failure-mobile')
  await evaluate('[...document.querySelectorAll(".format-review button")].find((b) => b.textContent === "Retry failed").click()')
  await wait(`document.querySelector('textarea[aria-label="Written prompt"]')`)
  assert.equal(requests.length, beforeRecovery + 2, 'Writer retry must not render before Send')
  failRender = true
  await evaluate('[...document.querySelectorAll(".format-review button")].find((b) => b.textContent === "Send to render").click()')
  await wait(retryVisible)
  // An insufficient credits failure links to the Comfy workspace to add credits.
  assert.equal(await evaluate('document.querySelector(".format-review [role=alert] a")?.textContent'), 'Add Comfy credits')
  assert.equal(await evaluate('document.querySelector(".format-review [role=alert] a").href'), 'https://platform.comfy.org/')
  assert.equal(await evaluate('document.querySelector(".format-review [role=alert] a").target'), '_blank')
  await screenshot('mock-app-credits-link-mobile')
  await evaluate('[...document.querySelectorAll(".format-review button")].find((b) => b.textContent === "Retry failed").click()')
  await wait('!document.querySelector(".format-review [role=alert]") && !document.querySelector(".app-results .pending")')
  assert.deepEqual(requests.slice(beforeRecovery).map((r) => r.path), ['/api/prompt', '/api/prompt', '/api/comfy/run', '/api/comfy/run'])
  assert.equal(await evaluate('document.querySelector(".format-review button").textContent'), 'Prompt sent')
  connected = false
  await goto('/')
  await wait('document.querySelector(".notice[role=status] a")')
  assert.match(await evaluate('document.querySelector(".notice[role=status]").innerText'), /No keys yet/)
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'First-run notice must fit 390px')
  await screenshot('mock-startup-mobile')
  await evaluate('document.querySelector(".notice[role=status] a").click()')
  await wait('location.pathname === "/connections" && !document.querySelector(".notice[role=status]")')
  // Comfy comes first in Connections, named as the key to get.
  assert.equal(await evaluate('document.querySelector(".conn h3").textContent'), 'ComfyUI')
  assert.match(await evaluate('document.querySelector(".conn .conn-lead").textContent'), /^Start here\. One Comfy key/)
  assert.equal(await evaluate('document.querySelector(".conn .conn-actions a").textContent'), 'Get a Comfy key ›')
  await screenshot('mock-connections-comfy-first-mobile')
  // Create shows one inline Connect Comfy prompt instead of the app-wide notice, and connects in place.
  // A first visit has no saved results or picks.
  await evaluate('localStorage.removeItem("comfyfield.library"); localStorage.removeItem("comfyfield.picker")')
  for (const route of ['/video', '/image']) {
    await goto(route)
    await wait('document.querySelector(".connect-comfy")')
    assert.equal(await evaluate('document.querySelectorAll(".connect-comfy").length'), 1, `${route} shows one Connect Comfy prompt`)
    assert(!(await evaluate('document.querySelector(".notice[role=status]")')), `${route} hides the app-wide notice`)
    assert(await evaluate('document.documentElement.scrollWidth <= 390'), `${route} Connect Comfy prompt must fit 390px`)
  }
  await screenshot('mock-first-run-create-mobile')
  await evaluate('document.querySelector(".connect-comfy input").focus()')
  await cdp('Input.insertText', { text: 'mock-comfy-key' })
  await evaluate('document.querySelector(".connect-comfy .btn-blue").click()')
  await wait('!document.querySelector(".connect-comfy")')
  assert.deepEqual(savedKeys, [{ id: 'comfy', values: { key: 'mock-comfy-key' } }])
  connected = true
  generationImports = [{ id: 'mock-proof-import', url: '/mock-proof.svg', kind: 'image', model: 'Mock proof import', aspect: '4:5', caption: 'Mock imported proof; no paid run', created: Date.now(), imported: true }]
  await evaluate('localStorage.removeItem("comfyfield.library")')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  await goto('/assets')
  await wait('document.querySelector(".lib-card img")?.complete')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]")[0]?.id === "mock-proof-import"')
  assert.equal(await evaluate('document.querySelectorAll(".lib-card").length'), 1)
  const proofScreenshot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
  mkdirSync('research_notes/live-runs', { recursive: true })
  writeFileSync('research_notes/live-runs/mock-library-import.png', Buffer.from(proofScreenshot.data, 'base64'))
  await goto('/assets')
  await wait('document.querySelector(".lib-card img")?.complete')
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("comfyfield.library")).length'), 1, 'Server import is deduplicated on reload')
  await evaluate('document.querySelector(".lib-card [aria-label=Delete]").click()')
  await wait('document.querySelectorAll(".lib-card").length === 0')
  await goto('/assets')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]").length === 0')
  assert.equal(generationImports.length, 0, 'Delete persists to server imports')
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('UI mock checks ok: app runner, shared sheet, Library after reload, 390px layout, Create generation/feed/camera presets and hidden invalid route. Failed writer and render sessions recover through Retry failed without repeating completed steps, and insufficient credits links to Comfy; no provider calls. First-run Connections notice and link, Comfy first in Connections, and the inline Connect Comfy prompt on Create checked at 390px. Labeled mock proof import deduplicates on reload and deletes on the server. Live Comfy progress on the render tile. Eleven screenshots saved.')
} finally {
  await browser?.close()
  await server.close()
}
