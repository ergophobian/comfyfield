import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { ffmpeg, findFfmpeg } from '../server/stitch.js'

// No provider plugin, keys or real generation routes are loaded by this fixture server.
const output = 'research_notes/screenshots/ugc-influencer'
const fixtures = resolve('outputs/presenter-fixtures')
mkdirSync(output, { recursive: true })
mkdirSync(fixtures, { recursive: true })
const clip = resolve(fixtures, 'mock-motion.mp4')
await ffmpeg(['-y', '-f', 'lavfi', '-i', 'testsrc2=size=180x320:rate=12:duration=6', '-c:v', 'libx264', '-threads', '1', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', clip], { binary: await findFfmpeg() })
const requests = []
const ids = ['ugc-product-review', 'ugc-unboxing', 'ugc-tutorial', 'ugc-talking-head']
const label = (text, product = false) => `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="600"><rect width="450" height="600" fill="#e4e9ff"/>${product ? '<rect x="155" y="130" width="140" height="260" rx="30" fill="#7d8ad6"/>' : '<circle cx="225" cy="190" r="85" fill="#9b8cf5"/><path d="M60 510 Q65 300 225 300 Q385 300 390 510Z" fill="#6f7fd8"/>'}<text x="225" y="560" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#30384d">${text}</text></svg>`
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'presenter-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname === '/mock-motion.mp4') {
        const bytes = readFileSync(clip)
        const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/)
        const start = range ? Number(range[1]) : 0
        const end = range?.[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1
        res.setHeader('Content-Type', 'video/mp4')
        res.setHeader('Accept-Ranges', 'bytes')
        res.setHeader('Content-Length', end - start + 1)
        if (range) { res.statusCode = 206; res.setHeader('Content-Range', `bytes ${start}-${end}/${bytes.length}`) }
        return res.end(bytes.subarray(start, end + 1))
      }
      if (url.pathname.startsWith('/mock-')) {
        res.setHeader('Content-Type', 'image/svg+xml')
        return res.end(label(url.pathname.includes('product') ? 'Mock product' : url.pathname.includes('stage') ? 'Mock staged presenter' : 'Mock fictional presenter', url.pathname.includes('product')))
      }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/library/characters') return res.end(JSON.stringify([{ id: 'fictional-presenter', name: 'Fictional Mira', images: ['/mock-presenter.svg'], notes: 'Generated fictional adult fixture' }]))
      if (url.pathname === '/api/library/products') return res.end(JSON.stringify([{ id: 'cup', name: 'Demo cup', images: ['/mock-product.svg'], description: 'A reusable cup with a handle' }]))
      if (url.pathname === '/api/library/brands' || url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/connections') return res.end('{}')
      if (url.pathname === '/api/prompt' || url.pathname === '/api/comfy/run' || url.pathname === '/api/upload') {
        if (url.pathname === '/api/upload') { req.resume(); return res.end(JSON.stringify({ url: '/mock-motion.mp4', type: 'video/mp4' })) }
        let body = ''
        for await (const chunk of req) body += chunk
        const payload = JSON.parse(body)
        requests.push({ path: url.pathname, body: payload })
        if (url.pathname === '/api/prompt') return res.end(JSON.stringify({ text: 'Carry your reusable cup easily with this comfortable side handle.' }))
        const image = payload.workflow === 'qwen2511_edit'
        return res.end(JSON.stringify({ files: [{ url: image ? '/mock-stage.svg' : '/mock-motion.mp4', kind: image ? 'image' : 'video' }] }))
      }
      if (req.method === 'POST') { res.statusCode = 500; return res.end(JSON.stringify({ error: `Unexpected mock route: ${url.pathname}` })) }
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((done) => setTimeout(done, ms))
let browser
try {
  const errors = []
  browser = await startBrowser('presenter-ui', { onEvent(message) {
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
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
  const click = (text) => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find((button) => button.textContent.trim() === ${JSON.stringify(text)}); if (!button || button.disabled) throw new Error('Unavailable button: ' + ${JSON.stringify(text)}); button.click() })()`)
  const type = (selector, text) => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(text)}); input.dispatchEvent(new Event('input', { bubbles: true })) })()`)
  const resize = (width) => cdp('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: width === 390 })
  const goto = async (path) => {
    await cdp('Page.navigate', { url: `${origin}${path}` })
    await wait('document.querySelector("main") && document.readyState === "complete"')
  }
  const screenshot = async (name) => {
    await evaluate(`(() => { if (!document.getElementById('mock-label')) { const note = document.createElement('div'); note.id = 'mock-label'; note.textContent = 'Mock fixtures · No provider output'; note.style.cssText = 'position:fixed;bottom:0;right:0;padding:8px 14px;background:#e4e9ff;color:#30384d;z-index:99999;font:14px sans-serif'; document.body.append(note) } })()`)
    await pause(350)
    const image = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !name.includes('library') })
    writeFileSync(`${output}/${name}.png`, Buffer.from(image.data, 'base64'))
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await resize(1440)
  await goto('/influencer')
  assert.equal(await evaluate('document.querySelectorAll(".inf-photo input[type=file]").length'), 0, 'No real-face upload')
  await click('Creator video')
  await wait('document.querySelectorAll(".inf-inputs .pick").length === 2')
  assert.equal(await evaluate('document.querySelector(".inf-generate").disabled'), true, 'Library picks and brief are required')
  for (const [index, id] of ids.entries()) {
    await evaluate(`(() => { const select = document.querySelector('#presenter-format'); select.value = ${JSON.stringify(id)}; select.dispatchEvent(new Event('change', { bubbles: true })) })()`)
    await wait(`document.querySelector('#presenter-format').value === ${JSON.stringify(id)}`)
    await evaluate('document.querySelectorAll(".inf-inputs .pick").forEach((button) => button.click())')
    await type('.inf-inputs textarea', 'A reusable cup with a handle. Show how the handle makes carrying it easier.')
    await wait('!document.querySelector(".inf-generate").disabled')
    if (index === 0) {
      await screenshot('mock-creator-library-picks-desktop')
      await resize(390)
      assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Creator form fits 390px')
      await screenshot('mock-creator-library-picks-mobile')
      await resize(1440)
    }
    const before = requests.length
    await click('Prepare video')
    await wait(`document.querySelector(${JSON.stringify('textarea[aria-label="Written prompt"]')})`)
    assert.equal(requests.length, before + 2, 'Only stage and writer run before review')
    assert.equal(requests[before].body.vars.image, '/mock-presenter.svg')
    assert.equal(requests[before].body.vars.image2, '/mock-product.svg')
    assert(requests[before + 1].body.images.includes('/mock-stage.svg'))
    await type('textarea[aria-label="Written prompt"]', 'This reusable cup has a handle that makes carrying easier.')
    await click('Send to render')
    await wait('[...document.querySelectorAll(".format-review button")].some((button) => button.textContent === "Send")')
    assert.equal(requests.length, before + 2, 'Explicit approval still holds the render')
    if (index === 0) {
      await evaluate('document.querySelector(".format-review").scrollIntoView({block:"center"})')
      await screenshot('mock-script-approval-desktop')
      await resize(390)
      assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Script approval fits 390px')
      await screenshot('mock-script-approval-mobile')
      await resize(1440)
    }
    await click('Send')
    await wait(`JSON.parse(localStorage.getItem('comfyfield.library') || '[]').filter((item) => item.formatId === ${JSON.stringify(id)}).length === 2`)
    assert.equal(requests.length, before + 3)
    assert.equal(requests.at(-1).body.vars.prompt, 'This reusable cup has a handle that makes carrying easier.')
    assert.equal(requests.at(-1).body.vars.image, '/mock-stage.svg')
  }
  await click('Motion')
  await wait('document.querySelector(".inf-inputs .pick")')
  await evaluate('document.querySelector(".inf-inputs .pick").click()')
  const { root } = await cdp('DOM.getDocument')
  const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '.inf-inputs input[type=file]' })
  await cdp('DOM.setFileInputFiles', { nodeId, files: [clip] })
  await wait('document.querySelector(".widget-controls input[type=number]") && !document.querySelector(".inf-generate").disabled')
  await type('.widget-controls input[type=number]', '1')
  await evaluate('document.querySelector(".inf-scroll").scrollTop = 0')
  await screenshot('mock-influencer-motion-desktop')
  await resize(390)
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Motion form fits 390px')
  await screenshot('mock-influencer-motion-mobile')
  await click('Generate motion')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]").length === 9')
  assert.equal(requests.at(-1).body.workflow, 'wan_animate2')
  assert.equal(requests.at(-1).body.vars.image, '/mock-presenter.svg')
  assert.equal(requests.at(-1).body.vars.video, '/mock-motion.mp4')
  assert.equal(requests.at(-1).body.vars.start, 1)
  assert.equal(requests.at(-1).body.vars.duration, 5)
  await resize(1440)
  await click('History')
  await wait('document.querySelectorAll(".inf-main .result").length === 9')
  await screenshot('mock-influencer-history-desktop')
  await goto('/library')
  await wait('document.querySelectorAll(".lib-card").length === 9')
  assert.equal(await evaluate('document.querySelectorAll(".lib-card video").length'), 5)
  await evaluate(`Promise.all([...document.querySelectorAll('.lib-card video')].map(async (video) => { video.muted = true; await video.play(); video.pause() }))`)
  await wait(`[...document.querySelectorAll('.lib-card video')].every((video) => video.readyState >= 2)`)
  await screenshot('mock-library-results-desktop')
  await resize(390)
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Library fits 390px')
  await screenshot('mock-library-results-mobile')
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  writeFileSync(`${output}/mock-requests.json`, JSON.stringify(requests, null, 2) + '\n')
  console.log('Presenter UI checks ok: four creator formats and influencer motion; Library picks, edited script and explicit approval, motion upload/trim, nine results after reload, desktop and 390px. Nine mocked generations, four writer requests, nine screenshots. No provider calls.')
} finally {
  await browser?.close()
  await server.close()
}
