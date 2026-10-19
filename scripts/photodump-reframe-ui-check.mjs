import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'

// A separate Vite server with an in-process mock API never loads provider routes or keys.
const requests = []
let failNext = false
let failShotAt = 4
let uploadUrl = '/mock-photo.svg'
const svg = (label, width = 600, height = 750) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 600 750"><rect width="600" height="750" fill="#e4e9ff"/><circle cx="300" cy="280" r="120" fill="#9b8cf5"/><path d="M100 680 Q100 380 300 390 Q500 380 500 680Z" fill="#6f7fd8"/><text x="300" y="720" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#30384d">${label}</text></svg>`
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'format-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname.startsWith('/mock-')) {
        res.setHeader('Content-Type', 'image/svg+xml')
        res.end(svg(url.pathname === '/mock-result.svg' ? 'Mock result' : 'Mock input', ...(url.pathname === '/mock-wide.svg' ? [10000, 100] : url.pathname === '/mock-tall.svg' ? [100, 10000] : [600, 750])))
        return
      }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/connections') return res.end(JSON.stringify({ fal: { connected: true }, google: { connected: true } }))
      if (url.pathname.startsWith('/api/library/')) return res.end(JSON.stringify(url.pathname.endsWith('characters') ? [{ id: 'test-character', name: 'Sample character', images: ['/mock-photo.svg', '/mock-second.svg', '/mock-third.svg'] }] : []))
      if (url.pathname === '/api/upload') {
        req.resume()
        return res.end(JSON.stringify({ url: uploadUrl }))
      }
      if (req.method === 'POST') {
        let body = ''
        for await (const chunk of req) body += chunk
        requests.push({ path: url.pathname, body: JSON.parse(body) })
        assert.equal(url.pathname, '/api/comfy/run', 'Only mocked Comfy generations are allowed')
        if (failNext || requests.length === failShotAt) {
          failNext = false
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'Mock generation failure' }))
        }
        return res.end(JSON.stringify({ files: [{ url: '/mock-result.svg', kind: 'image' }] }))
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
  browser = await startBrowser('photodump-reframe-ui', { onEvent(msg) {
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text)
  } })
  const cdp = browser.send
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const wait = async (expression) => {
    const deadline = Date.now() + uiTimeout
    while (Date.now() < deadline) {
      if (await evaluate(`Boolean(${expression})`)) return
      await pause(100)
    }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${JSON.stringify(errors)}`)
  }
  const goto = async (path) => {
    await cdp('Page.navigate', { url: `${origin}${path}` })
    await wait('document.querySelector("main") && document.readyState === "complete"')
  }
  const screenshot = async (name) => {
    await evaluate('window.scrollTo(0, 0)')
    const viewport = await evaluate('({ width: innerWidth, height: innerHeight })')
    const height = await evaluate('Math.max(innerHeight, document.documentElement.scrollHeight)')
    // Paint the whole page inside the viewport to avoid offscreen glass compositing artifacts.
    await cdp('Emulation.setDeviceMetricsOverride', { ...viewport, height, deviceScaleFactor: 1, mobile: viewport.width <= 720 })
    await pause(300)
    const data = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await cdp('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: viewport.width <= 720 })
    mkdirSync('research_notes/screenshots/photodump-reframe', { recursive: true })
    writeFileSync(`research_notes/screenshots/photodump-reframe/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  const click = async (text) => {
    await evaluate(`(() => {
      const button = [...document.querySelectorAll('main button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)})
      if (!button || button.disabled) throw new Error('Missing enabled button: ' + ${JSON.stringify(text)})
      button.click()
    })()`)
  }
  const upload = async (index = 0) => {
    await evaluate(`(() => {
      const input = document.querySelectorAll('main input[type=file]')[${index}]
      const data = new DataTransfer()
      data.items.add(new File(['mock'], 'reference.png', { type: 'image/png' }))
      input.files = data.files
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })()`)
    await wait(`document.querySelectorAll('main .drop.has').length >= ${index + 1}`)
  }
  const librarySize = async (size) => wait(`JSON.parse(localStorage.getItem('comfyfield.library') || '[]').filter((item) => !item.failed).length === ${size}`)
  const mobile = async (name) => {
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1100, deviceScaleFactor: 1, mobile: true })
    await wait('document.documentElement.scrollWidth <= 390')
    await screenshot(`${name}-mobile`)
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  }
  await goto('/photodump')
  await screenshot('mock-photodump-presets-desktop')
  await mobile('mock-photodump-presets')
  await click('Use this set')
  await wait('document.querySelector("main input[type=file]")')
  assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Use this character").disabled'))
  await upload()
  await upload(1)
  await upload(2)
  assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Use this character").disabled'), 'References require permission')
  await click('These are photos of me, or I have permission to use this face')
  await screenshot('mock-photodump-references-desktop')
  await mobile('mock-photodump-references')
  await click('Use this character')
  await click('4 photos')
  await click('2:3')
  await click('1.5k')
  await screenshot('mock-photodump-review-desktop')
  await mobile('mock-photodump-review')
  await click('These are photos of me, or I have permission to use this face')
  assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Generate 4 photos").disabled'))
  assert.equal(requests.length, 0, 'Revoked permission sends no generations')
  await click('These are photos of me, or I have permission to use this face')
  await click('Generate 4 photos')
  await librarySize(3)
  await wait('document.querySelectorAll("[data-status=done]").length === 3 && document.querySelectorAll("[data-status=failed]").length === 1')
  await wait('[...document.querySelectorAll("button")].some((b) => b.textContent === "Retry" && !b.disabled)')
  assert.equal(requests.length, 4, 'A partial failure makes only the four original requests')
  const completed = await evaluate('JSON.parse(localStorage.getItem("comfyfield.library")).filter((i) => !i.failed).map((i) => i.id).sort()')
  await screenshot('mock-photodump-partial-desktop')
  await mobile('mock-photodump-partial')
  await click('These are photos of me, or I have permission to use this face')
  assert(await evaluate('document.querySelector("[data-status=failed] button").disabled'), 'Retry requires permission too')
  await click('These are photos of me, or I have permission to use this face')
  failNext = true
  await click('Retry failed photos')
  await wait('[...document.querySelectorAll("button")].some((b) => b.textContent === "Retry" && !b.disabled)')
  assert.equal(requests.length, 5, 'Bulk retry sends exactly one failed shot, even when it fails again')
  await click('Retry')
  await librarySize(4)
  await wait('document.querySelectorAll("[data-status=done]").length === 4')
  assert.equal(requests.length, 6, 'Per-shot Retry sends exactly one request')
  const withoutSeed = (req) => ({ ...req, body: { ...req.body, vars: { ...req.body.vars, seed: null } } })
  assert.deepEqual(withoutSeed(requests[5]), withoutSeed(requests[3]), 'Retry keeps the failed shot prompt, references and settings')
  assert.deepEqual(await evaluate('JSON.parse(localStorage.getItem("comfyfield.library")).filter((i) => !i.failed).map((i) => i.id).filter((id) => ' + JSON.stringify(completed) + '.includes(id)).sort()'), completed, 'Completed photos keep their original ids')
  await wait(`document.querySelector('[aria-label="Generated photos"] .result img')?.complete`)
  assert.equal(requests.length, 6)
  assert.equal(new Set(requests.map((req) => req.body.vars.prompt)).size, 4)
  for (const req of requests) {
    assert.equal(req.body.workflow, 'qwen2511_photodump')
    assert.equal(req.body.vars.image, '/mock-photo.svg')
    assert.equal(req.body.vars.image2, '/mock-photo.svg')
    assert.equal(req.body.vars.image3, '/mock-photo.svg')
    assert.equal(req.body.vars.width, 1024)
    assert.equal(req.body.vars.height, 1536)
    assert.equal(req.body.vars.count, 1)
  }
  assert(await evaluate('JSON.parse(localStorage.getItem("comfyfield.library")).every((item) => item.aspect === "2:3")'))
  await screenshot('mock-photodump-results-desktop')
  await mobile('mock-photodump-results')
  await click('Start a new set')
  await click('Use this set')
  await click('Saved character')
  await wait('document.querySelector(".pick")')
  await click('Sample character')
  assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Use this character").disabled'), 'Saved characters also require permission')
  await click('These are photos of me, or I have permission to use this face')
  await click('Reference photos')
  assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Use this character").disabled'), 'Switching references resets permission')
  await click('Saved character')
  await click('These are photos of me, or I have permission to use this face')
  await click('Use this character')
  await click('Generate 4 photos')
  await librarySize(8)
  assert.equal(requests[6].body.vars.image2, '/mock-second.svg')
  assert.equal(requests[6].body.vars.image3, '/mock-third.svg')
  await goto('/reframe')
  assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Generate reframe").disabled'))
  await upload()
  const beforeGuards = requests.length
  await click('4:5')
  await wait('document.body.innerText.includes("already matches the target ratio")')
  assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Generate reframe").disabled'))
  await screenshot('mock-reframe-matching-ratio-desktop')
  await mobile('mock-reframe-matching-ratio')
  for (const url of ['/mock-wide.svg', '/mock-tall.svg']) {
    uploadUrl = url
    await upload()
    await wait('document.body.innerText.includes("Crop extreme panoramas")')
    assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Generate reframe").disabled'))
    assert.equal(requests.length, beforeGuards, 'Unsupported ratios never submit')
  }
  await screenshot('mock-reframe-extreme-ratio-desktop')
  await mobile('mock-reframe-extreme-ratio')
  uploadUrl = '/mock-photo.svg'
  await upload()
  await wait('document.body.innerText.includes("already matches the target ratio")')
  assert.equal(requests.length, beforeGuards, 'Matching ratios never submit')
  await evaluate(`(() => {
    const input = document.querySelector('main textarea')
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'Continue the beach and sky')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  await click('21:9')
  await screenshot('mock-reframe-preview-desktop')
  await mobile('mock-reframe-preview')
  await click('Generate reframe')
  await librarySize(9)
  const reframe = requests[10].body
  assert.equal(reframe.workflow, 'qwen2511_reframe')
  assert.equal(reframe.vars.width, 1568)
  assert.equal(reframe.vars.height, 672)
  assert.equal(reframe.vars.image, '/mock-photo.svg')
  assert(reframe.vars.prompt.includes('Continue the beach and sky'))
  assert(reframe.vars.prompt.includes('21:9'))
  await wait(`document.querySelector('[aria-label="Reframed images"] .result img')?.complete`)
  await screenshot('mock-reframe-results-desktop')
  await mobile('mock-reframe-results')
  failNext = true
  await click('Generate reframe')
  await wait('document.body.innerText.includes("Mock generation failure")')
  assert.equal(await evaluate(`document.querySelectorAll('[aria-label="Reframed images"] .result img').length`), 1)
  await screenshot('mock-reframe-error-desktop')
  await click('Generate reframe')
  await librarySize(10)
  const beforeVideo = requests.length
  await click('Video')
  await wait('document.body.innerText.includes("No bundled video outpaint")')
  assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "Reframe video").disabled'))
  assert.equal(requests.length, beforeVideo)
  await screenshot('mock-reframe-video-unwired-desktop')
  await mobile('mock-reframe-video-unwired')
  await goto('/assets')
  await wait('document.querySelectorAll(".lib-card img").length === 10')
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("comfyfield.library")).filter((item) => item.formatId === "reframe-image" && !item.failed).length'), 2)
  await screenshot('mock-library-desktop')
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('Photodump and Reframe mock browser checks passed: 10 saved images, three references, permission gates, saved character, dimensions, prompts, 3-success/1-failure per-shot and bulk recovery, matching/extreme ratio guards, unwired video, Library after reload and desktop/390px screenshots. No provider calls.')
} finally {
  await browser?.close()
  await server.close()
}
