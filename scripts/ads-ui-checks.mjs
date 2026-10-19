import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import bundledFfmpeg from 'ffmpeg-static'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'

const requests = []
const product = { name: 'Linen tote', price: 'USD 48', description: 'Room for your day. Lifetime repairs.', images: ['/media/mock-product.png'] }
const brand = { name: 'Northfield Goods', logo: [], colors: ['#64775c'], about: 'Everyday goods, made to last.' }
const svg = (result) => `<svg xmlns="http://www.w3.org/2000/svg" width="896" height="1120" viewBox="0 0 896 1120"><rect width="896" height="1120" fill="#efeae0"/><circle cx="710" cy="250" r="270" fill="#dde3d4"/><text x="70" y="100" font-size="24" font-family="sans-serif" fill="#485341">Northfield Goods · Mock ${result ? 'ad' : 'product'}</text><path d="M330 435V320C330 170 560 170 560 320V435" fill="none" stroke="#71795d" stroke-width="34"/><path d="M255 390H635L685 870Q450 920 205 870Z" fill="#a6ae8f"/><path d="M285 440H605L635 825H255Z" fill="#bbc2a6"/><text x="450" y="660" font-size="25" text-anchor="middle" font-family="sans-serif" fill="#485341">Northfield</text>${result ? '<text x="70" y="1010" font-size="46" font-family="serif" fill="#303c2d">Carry beautifully.</text><text x="70" y="1070" font-size="26" font-family="sans-serif" fill="#485341">Shop the linen tote · $48</text>' : ''}</svg>`
// A local fixture is made before Chrome starts. No model or provider is involved.
const videoPath = join(mkdtempSync(join(tmpdir(), 'comfyfield-ads-')), 'mock-video.mp4')
const fixture = spawnSync(bundledFfmpeg, ['-y', '-f', 'lavfi', '-i', 'color=c=0xdde3d4:s=360x640:d=4', '-vf', 'drawbox=x=90:y=180:w=180:h=290:color=0xa6ae8f:t=fill', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', videoPath], { windowsHide: true })
assert.equal(fixture.status, 0, fixture.stderr?.toString())
const video = readFileSync(videoPath)
const audio = Buffer.alloc(44 + 64000)
audio.write('RIFF', 0)
audio.writeUInt32LE(audio.length - 8, 4)
audio.write('WAVEfmt ', 8)
audio.writeUInt32LE(16, 16)
audio.writeUInt16LE(1, 20)
audio.writeUInt16LE(1, 22)
audio.writeUInt32LE(8000, 24)
audio.writeUInt32LE(16000, 28)
audio.writeUInt16LE(2, 32)
audio.writeUInt16LE(16, 34)
audio.write('data', 36)
audio.writeUInt32LE(64000, 40)
const server = await preview({ configFile: false, envFile: false, preview: { host: '127.0.0.1', port: 0 }, plugins: [{
  name: 'ads-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const path = new URL(req.url, 'http://localhost').pathname
      if (path.startsWith('/media/mock-')) {
        res.setHeader('Content-Type', path.endsWith('.mp4') ? 'video/mp4' : path.endsWith('.wav') ? 'audio/wav' : 'image/svg+xml')
        const data = path.endsWith('.mp4') ? video : path.endsWith('.wav') ? audio : Buffer.from(svg(path.includes('result')))
        if (req.headers.range) {
          const start = Number(/bytes=(\d+)/.exec(req.headers.range)?.[1] || 0)
          res.statusCode = 206
          res.setHeader('Content-Range', `bytes ${start}-${data.length - 1}/${data.length}`)
          res.setHeader('Content-Length', data.length - start)
          return res.end(data.subarray(start))
        }
        res.setHeader('Content-Length', data.length)
        return res.end(data)
      }
      if (!path.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (req.method !== 'POST') return res.end(JSON.stringify(path.startsWith('/api/library/') || path === '/api/stitch/exports' ? [] : path === '/api/connections' ? { comfy: { connected: true }, google: { connected: true } } : {}))
      let raw = ''
      for await (const chunk of req) raw += chunk
      const body = req.headers['content-type'] === 'application/json' ? JSON.parse(raw || '{}') : { bytes: raw.length }
      requests.push({ path, body })
      if (path === '/api/ads/import') {
        if (body.url.includes('blocked')) { res.statusCode = 422; return res.end(JSON.stringify({ error: 'That page blocks reading. Enter details by hand.' })) }
        return res.end(JSON.stringify({ product, brand, url: body.url, warnings: [] }))
      }
      if (path === '/api/prompt') return res.end(JSON.stringify({ text: 'Concept: carry beautifully. Headline: Room for your day. Call to action: Shop the tote. Script: a macro of the stitching, a commuter picks up the tote, then a clean hero shot. Use only supplied product facts.' }))
      if (path === '/api/upload') return res.end(JSON.stringify({ url: '/media/mock-voice.wav' }))
      if (path === '/api/stitch') return res.end(JSON.stringify({ id: 'mock-stitched', url: '/media/mock-result.mp4', kind: 'video', model: 'Stitch', aspect: body.aspect }))
      if (path === '/api/comfy/run') return res.end(JSON.stringify({ files: [{ url: body.workflow === 'qwen2511_ad' ? '/media/mock-result.png' : '/media/mock-result.mp4', kind: body.workflow === 'qwen2511_ad' ? 'image' : 'video' }] }))
      res.statusCode = 404
      res.end(JSON.stringify({ error: `Unexpected mock route ${path}` }))
    })
  },
}] })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
let browser
const errors = []
try {
  browser = await startBrowser('ads-studios', { onEvent: (msg) => { if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text) } })
  const cdp = browser.send
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const pause = (ms) => new Promise((done) => setTimeout(done, ms))
  const wait = async (expression) => {
    for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) { if (await evaluate(`Boolean(${expression})`)) return; await pause(100) }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${JSON.stringify(errors)}`)
  }
  const goto = async (path) => { await cdp('Page.navigate', { url: origin + path }); await wait('document.querySelector("main") && document.readyState === "complete"') }
  const click = async (text) => evaluate(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)}).click()`)
  const fill = async (selector, value) => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); })()`)
  const screen = async (name, width) => {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: width === 390 })
    await evaluate('window.scrollTo(0, 0)')
    await pause(200)
    if (!await evaluate(`document.documentElement.scrollWidth <= ${width}`)) console.log(name, await evaluate(`[...document.querySelectorAll('body *')].map((el) => ({ tag: el.tagName, cls: el.className, right: el.getBoundingClientRect().right, width: el.getBoundingClientRect().width })).filter((el) => el.right > ${width}).slice(0, 20)`))
    assert(await evaluate(`document.documentElement.scrollWidth <= ${width}`), `${name} must fit ${width}px`)
    const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    mkdirSync('research_notes/screenshots/ads-studios', { recursive: true })
    writeFileSync(`research_notes/screenshots/ads-studios/${name}.png`, Buffer.from(shot.data, 'base64'))
  }
  const importPage = async () => {
    await fill('input[aria-label="Product page link"]', 'https://example.com/tote')
    await click('Read page')
    await wait('document.body.innerText.includes("Draft concepts") && [...document.querySelectorAll("input")].some((input) => input.value === "Linen tote")')
  }
  const renders = () => requests.filter((r) => r.path === '/api/comfy/run')
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  await goto('/ads')
  await fill('input[aria-label="Product page link"]', 'https://example.com/blocked')
  await click('Read page')
  await wait('document.querySelector("[role=alert]")?.textContent.includes("blocks reading")')
  await importPage()
  await click('Draft concepts')
  await wait('document.querySelector(".ad-review textarea")')
  assert.equal(renders().length, 0, 'Writer must not render before approval')
  assert(requests.find((r) => r.path === '/api/prompt').body.note.includes('Northfield Goods'))
  await fill('textarea[aria-label="Concepts and script"]', 'Edited concept: Carry beautifully. Headline: Room for your day. Call to action: Shop now.')
  await screen('mock-ads-review-desktop', 1440)
  await screen('mock-ads-review-mobile', 390)
  await click('Approve and render')
  await wait('document.body.innerText.includes("Saved to Library")')
  assert.equal(renders().length, 2)
  assert.equal(renders()[0].body.workflow, 'qwen2511_ad')
  assert.equal(renders()[0].body.vars.image, '/media/mock-product.png')
  assert(renders()[0].body.vars.prompt.includes('Edited concept: Carry beautifully.'))
  assert(renders()[0].body.vars.prompt.includes('#64775c'))
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]").length === 2')
  await click('Approve result 1')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library"))[0].approved')
  await screen('mock-ads-results-desktop', 1440)
  await screen('mock-ads-results-mobile', 390)

  await goto('/marketing')
  await importPage()
  await fill('textarea[aria-label="Brief"]', 'An unboxing for commuters with a final shop now card')
  await fill('textarea[aria-label="Scene 1"]', 'Edited opening: macro on the linen handle')
  await evaluate(`(() => { const input = document.querySelector('input[aria-label="Voiceover track"]'); const data = new DataTransfer(); data.items.add(new File(['mock audio'], 'narration.wav', { type: 'audio/wav' })); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()`)
  await wait('document.querySelector("audio")?.getAttribute("src") === "/media/mock-voice.wav"')
  await click('Draft concepts')
  await wait('document.querySelector(".ad-review textarea")')
  assert.equal(renders().length, 2)
  const marketingWriter = requests.filter((r) => r.path === '/api/prompt').at(-1)
  assert(marketingWriter.body.note.includes('Edited opening: macro on the linen handle'))
  await fill('textarea[aria-label="Concepts and script"]', 'Reviewed marketing script: show the linen handle, the tote in use and the shop now card. No dialogue; use the supplied voiceover track.')
  await screen('mock-marketing-review-desktop', 1440)
  await screen('mock-marketing-review-mobile', 390)
  await click('Approve and render')
  await wait('document.body.innerText.includes("Saved to Library")')
  assert.equal(renders().length, 3)
  assert.equal(renders().at(-1).body.workflow, 'h3_studio_ad')
  assert.equal(renders().at(-1).body.vars.duration, 15)
  assert(renders().at(-1).body.vars.prompt.includes('Edited opening: macro on the linen handle'))
  assert(renders().at(-1).body.vars.prompt.includes('Reviewed marketing script'))
  assert.equal(requests.filter((r) => r.path === '/api/stitch').length, 1)
  assert.equal(requests.find((r) => r.path === '/api/stitch').body.music.url, '/media/mock-voice.wav')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]").length === 4')
  await wait('[...document.querySelectorAll(".ad-review video")].every((video) => video.readyState >= 2)')
  await screen('mock-marketing-results-desktop', 1440)
  await screen('mock-marketing-results-mobile', 390)
  await goto('/assets')
  await wait('document.querySelectorAll(".lib-card").length >= 4')
  await screen('mock-library-mobile', 390)
  await screen('mock-library-desktop', 1440)
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('Ads studio browser checks ok: both links imported, bad page recovery, editable scripts and storyboard, approval blocks rendering, images/video/voiceover requests, result approval, Library after reload, desktop and 390px. Three mock generations, two writer requests and one Stitch mock; no provider calls. Ten screenshots saved.')
} finally {
  await browser?.close()
  await server.close()
}
