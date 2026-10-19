import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { serveMedia } from '../server/serveMedia.js'
import { planStory } from '../server/story.js'
import { ffmpeg, findFfmpeg, renderStitch, inspectStoryFootage } from '../server/stitch.js'

// Provider calls are fixtures. The production page, runner, ffmpeg and Library are real.
const root = path.resolve('.comfyfield/story-ui-check')
fs.mkdirSync(root, { recursive: true })
const dir = fs.mkdtempSync(path.join(root, 'run-'))
const mediaPath = (name) => path.join(dir, path.basename(name))
const binary = await findFfmpeg()
await ffmpeg(['-y', '-f', 'lavfi', '-i', 'color=c=skyblue:s=320x180:r=30:d=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', mediaPath('footage.mp4')], { binary })
await ffmpeg(['-y', '-f', 'lavfi', '-i', 'color=c=orange:s=320x180', '-frames:v', '1', mediaPath('image.png')], { binary })
await ffmpeg(['-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', mediaPath('voice.wav')], { binary })
const requests = []
const exports = []
let available = true
const narration = 'Ice floats because it is less dense than water.'
const server = await preview({ configFile: false, envFile: false, plugins: [{ name: 'story-mock-api', configurePreviewServer(server) {
  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname.startsWith('/media/')) {
      return serveMedia(req, res, mediaPath(url.pathname), url.pathname.endsWith('.png') ? 'image/png' : url.pathname.endsWith('.wav') ? 'audio/wav' : 'video/mp4')
    }
    if (!url.pathname.startsWith('/api/')) return next()
    res.setHeader('Content-Type', 'application/json')
    const reply = (data) => res.end(JSON.stringify(data))
    if (url.pathname === '/api/stitch/status') return reply({ available, error: available ? undefined : 'ffmpeg is missing. Run npm install to install the bundled binary.' })
    if (url.pathname === '/api/stitch/exports') return reply(exports)
    if (url.pathname === '/api/connections') return reply({ comfy: { connected: true }, google: { connected: true } })
    if (url.pathname === '/api/upload' || url.pathname === '/api/stitch/upload') {
      if (req.headers['content-type']?.startsWith('audio/')) {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const name = `upload-${Date.now()}.wav`
        fs.writeFileSync(mediaPath(name), Buffer.concat(chunks))
        return reply({ url: `/media/${name}` })
      }
      req.resume()
      return reply({ url: '/media/footage.mp4' })
    }
    if (req.method !== 'POST') return reply({})
    let body = ''
    for await (const chunk of req) body += chunk
    const input = JSON.parse(body)
    requests.push({ path: url.pathname, input })
    try {
      if (url.pathname === '/api/story/plan') return reply(await planStory(input, { connection: () => ({ run: 'session' }), status: () => ({ phase: 'ready', pod: { vramGb: 48, costPerHr: 1 } }), inspect: (url, range) => inspectStoryFootage(url, { mediaPath, binary, range }) }))
      if (url.pathname === '/api/prompt') {
        if (input.target === 'Shot list') {
          const footage = input.note.includes('Shorts studio')
          return reply({ text: JSON.stringify([{ title: 'Ice on water', narration, visual: 'An ice cube floating on a lake', seconds: 1, source: footage ? 'footage' : 'generate', ...(footage && { start: 0, end: 1 }) }]) })
        }
        return reply({ text: narration })
      }
      if (url.pathname === '/api/comfy/run') {
        const kind = input.workflow === 'chatterbox_tts' ? 'audio' : ['ltx25_i2v', 'bernini_restyle'].includes(input.workflow) ? 'video' : 'image'
        return reply({ files: [{ url: `/media/${kind === 'audio' ? 'voice.wav' : kind === 'video' ? 'footage.mp4' : 'image.png'}`, kind }] })
      }
      if (url.pathname === '/api/stitch') {
        const file = await renderStitch(input, { binary, home: () => dir, mediaPath })
        const item = { ...file, id: path.basename(file.path), model: 'Stitch', caption: 'Mock provider story', created: Date.now() }
        exports.push(item)
        return reply(item)
      }
      throw new Error(`Unexpected API request: ${url.pathname}`)
    } catch (e) {
      res.statusCode = 500
      reply({ error: e.message })
    }
  })
} }], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let browser
try {
  const errors = []
  browser = await startBrowser('story-ui', { onEvent(event) {
    if (event.method === 'Runtime.exceptionThrown') errors.push(event.params.exceptionDetails.exception?.description || event.params.exceptionDetails.text)
  } })
  const cdp = browser.send
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const wait = async (expression) => {
    for (const deadline = Date.now() + uiTimeout * 3; Date.now() < deadline;) {
      if (await evaluate(`Boolean(${expression})`)) return
      await pause(100)
    }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${JSON.stringify(errors)}`)
  }
  const goto = async (route) => {
    await cdp('Page.navigate', { url: `${origin}${route}` })
    await wait('document.querySelector("main") && document.readyState === "complete"')
  }
  const fill = async (selector, text) => evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)})
    Object.getOwnPropertyDescriptor(input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(text)})
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  const click = async (label) => {
    const expression = `[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === ${JSON.stringify(label)} && !button.disabled)`
    await wait(expression)
    await evaluate(`${expression}.click()`)
  }
  const screenshot = async (name) => {
    await evaluate('window.scrollTo(0, 0)')
    await pause(200)
    const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    fs.mkdirSync('research_notes/screenshots/story-studios', { recursive: true })
    fs.writeFileSync(`research_notes/screenshots/story-studios/mock-${name}.png`, Buffer.from(data, 'base64'))
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  for (const studio of ['explainer', 'faceless', 'shorts']) {
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
    await goto(`/${studio}`)
    if (studio === 'explainer') {
      await fill('textarea[aria-label="What should the video explain"]', 'Why ice floats. Include the test source facts.')
      await evaluate(`(() => {
        const input = document.querySelector('input[type=file][accept*=".txt"]')
        const transfer = new DataTransfer()
        transfer.items.add(new File(['Attachment fact: frozen water expands.'], 'facts.txt', { type: 'text/plain' }))
        input.files = transfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })()`)
      await wait('document.body.innerText.includes("facts.txt")')
      await evaluate("[...document.querySelectorAll('[aria-label=Style] button')].find((button) => button.textContent.includes('Clay motion')).click()")
      await click('16:9')
      await evaluate("[...document.querySelectorAll('.menu button')].find((button) => button.textContent.startsWith('1:1')).click()")
      await evaluate(`(async () => {
        const input = document.querySelector('.story-pipeline input[type=file]')
        const blob = await fetch('/media/voice.wav').then((res) => res.blob())
        const transfer = new DataTransfer()
        transfer.items.add(new File([blob], 'music.wav', { type: 'audio/wav' }))
        input.files = transfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })()`)
      await wait('document.querySelector(".story-pipeline").textContent.includes("music.wav")')
    } else if (studio === 'faceless') {
      await fill('textarea[aria-label="Channel about"]', 'Science stories for curious adults')
      await click('Next')
      await fill('input[placeholder="What should this episode be about"]', 'Why ice floats')
      await click('Next')
      await evaluate(`(async () => {
        const input = document.querySelector('.story-voice input[type=file]')
        const blob = await fetch('/media/voice.wav').then((res) => res.blob())
        const transfer = new DataTransfer()
        transfer.items.add(new File([blob], 'my-voice.wav', { type: 'audio/wav' }))
        input.files = transfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })()`)
      await wait('document.querySelector(".story-voice audio")')
    } else {
      await evaluate(`(() => {
        const input = document.querySelector('input[type=file][accept*="video"]')
        const transfer = new DataTransfer()
        transfer.items.add(new File(['mock'], 'ice.mp4', { type: 'video/mp4' }))
        input.files = transfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })()`)
      await fill('textarea[placeholder^="Paste the spoken words"]', 'Ice floats because it is less dense than water.')
      await evaluate("[...document.querySelectorAll('[aria-label=Looks] button')].find((button) => button.textContent.includes('Clay world')).click()")
      await evaluate(`(() => {
        const select = document.querySelector('[aria-label=Language]')
        select.value = 'es'
        select.dispatchEvent(new Event('change', { bubbles: true }))
      })()`)
      await click('Clean')
    }
    const before = requests.filter((r) => r.path === '/api/comfy/run').length
    await click('Write script')
    await wait('document.querySelector("textarea[aria-label=\\"Script for approval\\"]")')
    assert.equal(requests.filter((r) => r.path === '/api/comfy/run').length, before, 'No generation before script approval')
    assert(await evaluate('[...document.querySelectorAll("fieldset.story-settings button, fieldset.story-settings input, fieldset.story-settings textarea, fieldset.story-settings select")].every((el) => el.matches(":disabled"))'), 'Page settings lock during review')
    assert(await evaluate('document.querySelector(".story-pipeline").textContent.includes("Writer calls bill")'))
    await click('Edit settings')
    await wait('document.querySelector(".story-pipeline button").textContent === "Write script" || [...document.querySelectorAll(".story-pipeline button")].some((b) => b.textContent === "Write script")')
    assert(await evaluate('[...document.querySelectorAll("fieldset.story-settings textarea")].every((el) => !el.matches(":disabled"))'))
    await click('Write script')
    await wait('document.querySelector("textarea[aria-label=\\"Script for approval\\"]")')
    await click('Approve script')
    await wait('document.querySelector("textarea[aria-label=\\"Shot list for approval\\"]")')
    assert.equal(requests.filter((r) => r.path === '/api/comfy/run').length, before, 'No generation before shot approval')
    await wait('document.querySelector(".story-estimate")?.textContent.includes("Estimated render total")')
    if (studio === 'faceless') {
      const approved = await evaluate('document.querySelector("textarea[aria-label=\\"Shot list for approval\\"]").value')
      const tooLong = JSON.parse(approved)
      tooLong[0].seconds = 20
      await fill('textarea[aria-label="Shot list for approval"]', JSON.stringify(tooLong))
      await wait('document.querySelector(".story-estimate").textContent.includes("5 seconds")')
      assert(await evaluate('[...document.querySelectorAll(".story-pipeline button")].find((button) => button.textContent === "Approve shots and render").disabled'))
      await fill('textarea[aria-label="Shot list for approval"]', approved)
      await wait('document.querySelector(".story-estimate").textContent.includes("Estimated render total")')
    }
    await screenshot(`${studio}-review-desktop`)
    await click('Approve shots and render')
    await wait('document.querySelector("video[aria-label=\\"Finished story\\"]")')
    await wait('document.querySelector("video[aria-label=\\"Finished story\\"]").readyState >= 2')
    await evaluate(`(() => {
      const player = document.querySelector('.story-pipeline video')
      player.muted = true
      return player.play()
    })()`)
    await wait("document.querySelector('.story-pipeline video').currentTime > 0.2")
    await evaluate("document.querySelector('.story-pipeline video').pause()")
    const latest = exports.at(-1)
    const stored = await evaluate('JSON.parse(localStorage.getItem("comfyfield.library"))')
    assert(stored.some((item) => item.url === latest.url), 'Stitched video persists in Library')
    assert.equal(latest.duration, 2, 'Narration determines shot duration')
    const writer = requests.filter((r) => r.path === '/api/prompt' && r.input.target === 'Narration script').at(-1)
    assert(writer.input.note.includes(studio === 'faceless' ? 'Science stories' : studio === 'shorts' ? 'Ice floats' : 'test source facts'), 'Page values reach writer')
    const stitch = requests.filter((r) => r.path === '/api/stitch').at(-1).input
    assert.equal(stitch.aspect, studio === 'shorts' ? '9:16' : studio === 'explainer' ? '1:1' : '16:9')
    assert.equal(stitch.clips[0].caption, narration)
    if (studio === 'explainer') {
      assert(writer.input.note.includes('Attachment fact: frozen water expands.'), 'Attachment contents reach the writer')
      assert.match(stitch.music.url, /^\/media\/upload-/, 'Uploaded music reaches Stitch')
      assert(requests.filter((r) => r.path === '/api/comfy/run' && r.input.workflow === 'image_flux').at(-1).input.vars.prompt.includes('Clay motion'))
    }
    if (studio === 'shorts') {
      const restyle = requests.filter((r) => r.path === '/api/comfy/run' && r.input.workflow === 'bernini_restyle').at(-1)
      assert.equal(restyle.input.vars.video, '/media/footage.mp4')
      assert(restyle.input.vars.prompt.includes('Clay world'))
      assert.equal(stitch.captionStyle, 'clean')
      assert.equal(requests.filter((r) => r.path === '/api/comfy/run' && r.input.workflow === 'chatterbox_tts').at(-1).input.vars.language, 'Spanish (es)')
      assert.equal(restyle.input.vars.start, 0)
      assert.equal(restyle.input.vars.duration, 1)
    }
    if (studio === 'faceless') {
      const speech = requests.filter((r) => r.path === '/api/comfy/run' && r.input.workflow === 'chatterbox_tts').at(-1)
      assert.match(speech.input.vars.voice, /^\/media\/upload-/, 'Uploaded voice sample reaches speech model')
    }
    if (studio === 'faceless') assert.equal((await evaluate('JSON.parse(localStorage.getItem("comfyfield.story-channels"))[0]')).channel, 'Science stories for curious adults')
    await screenshot(`${studio}-desktop`)
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1000, deviceScaleFactor: 1, mobile: true })
    await screenshot(`${studio}-390`)
    assert(await evaluate('document.documentElement.scrollWidth <= 390'), `${studio} must fit 390px`)
    await goto('/assets')
    await wait('document.querySelector(".lib-card")')
    assert(await evaluate(`JSON.parse(localStorage.getItem('comfyfield.library')).some((item) => item.url === ${JSON.stringify(latest.url)})`))
  }
  available = false
  await goto('/explainer')
  await fill('textarea[aria-label="What should the video explain"]', 'Missing dependency test')
  const before = requests.length
  await click('Write script')
  await wait('document.querySelector(".story-pipeline [role=alert]")')
  assert((await evaluate('document.querySelector(".story-pipeline [role=alert]").textContent')).includes('ffmpeg is missing'))
  assert.equal(requests.length, before, 'Missing ffmpeg blocks paid writer and model calls')
  assert.deepEqual(errors, [])
  console.log('Story page checks passed: all three pages, both approvals, mock providers, real ffmpeg, playback, Library, dependency error and 390px layouts')
} finally {
  await browser?.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
