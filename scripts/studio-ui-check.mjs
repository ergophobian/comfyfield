import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import ffmpeg from 'ffmpeg-static'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'

// Production app and mock media/API only: provider routes and keys are never loaded.
const dir = 'research_notes/screenshots/issue-101'
const fixtures = 'outputs/studio-ui'
mkdirSync(dir, { recursive: true })
mkdirSync(fixtures, { recursive: true })
for (const [name, args] of [
  ['clip.webm', ['-f', 'lavfi', '-i', 'color=c=skyblue:s=160x90:r=24', '-t', '4', '-c:v', 'libvpx', '-an']],
  ['audio.wav', ['-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=16000', '-t', '2']],
]) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...args, '-y', resolve(fixtures, name)], { encoding: 'utf8', windowsHide: true })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
}
const picture = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#e4e9ff"/><circle cx="300" cy="150" r="90" fill="#9b8cf5"/><path d="M150 360 Q150 220 300 230 Q450 220 450 360Z" fill="#6f7fd8"/><text x="300" y="390" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#30384d">Mock studio media</text></svg>'
const requests = []
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'studio-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname.startsWith('/mock-')) {
        const video = url.pathname.endsWith('.webm')
        const audio = url.pathname.endsWith('.wav')
        const data = video || audio ? readFileSync(`${fixtures}/${video ? 'clip.webm' : 'audio.wav'}`) : Buffer.from(picture)
        res.setHeader('Content-Type', video ? 'video/webm' : audio ? 'audio/wav' : 'image/svg+xml')
        const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '')
        if (range) {
          const start = Number(range[1])
          const end = range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1
          res.statusCode = 206
          res.setHeader('Content-Range', `bytes ${start}-${end}/${data.length}`)
          res.setHeader('Content-Length', end - start + 1)
          return res.end(data.subarray(start, end + 1))
        }
        res.setHeader('Accept-Ranges', 'bytes')
        res.setHeader('Content-Length', data.length)
        return res.end(data)
      }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/upload') {
        req.resume()
        const type = req.headers['content-type'] || ''
        return res.end(JSON.stringify({ url: type.startsWith('video/') ? '/mock-clip.webm' : type.startsWith('audio/') ? '/mock-audio.wav' : '/mock-photo.svg' }))
      }
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/library/characters') return res.end(JSON.stringify([{ id: 'mock-character', name: 'Mock character', images: ['/mock-photo.svg'] }]))
      if (url.pathname.startsWith('/api/library/')) return res.end('[]')
      if (url.pathname === '/api/connections') return res.end(JSON.stringify(Object.fromEntries(['comfy', 'google', 'elevenlabs', 'fal'].map((p) => [p, { connected: true }]))))
      if (url.pathname === '/api/fal/schema') return res.end(JSON.stringify({ properties: { prompt: { type: 'string' } } }))
      if (req.method === 'POST') {
        let body = ''
        for await (const chunk of req) body += chunk
        const payload = JSON.parse(body)
        requests.push({ path: url.pathname, ...payload })
        const kind = ['/api/google', '/api/elevenlabs', '/api/fal'].includes(url.pathname) || /chatterbox|drama3|qwen3/.test(payload.workflow) ? 'audio' : /image_upscale|seedvr2_image/.test(payload.workflow) ? 'image' : 'video'
        return res.end(JSON.stringify({ files: [{ kind, url: kind === 'audio' ? '/mock-audio.wav' : kind === 'image' ? '/mock-photo.svg' : '/mock-clip.webm' }] }))
      }
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
let browser
let shots = 0
try {
  const errors = []
  browser = await startBrowser('studio-ui', { onEvent(msg) {
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
  const goto = async (path) => {
    await cdp('Page.navigate', { url: `${origin}${path}` })
    await wait('document.querySelector("main") && document.readyState === "complete"')
  }
  const click = async (text, selector = 'button') => {
    const expression = `[...document.querySelectorAll(${JSON.stringify(selector)})].find((b) => b.textContent.trim() === ${JSON.stringify(text)} || b.querySelector('strong')?.textContent === ${JSON.stringify(text)})`
    await wait(expression)
    await evaluate(`${expression}.click()`)
  }
  const type = async (selector, value) => {
    await wait(`document.querySelector(${JSON.stringify(selector)})`)
    await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', {bubbles:true})); })()`)
  }
  const upload = async (selector, type) => {
    await wait(`document.querySelector(${JSON.stringify(selector)})`)
    await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); const data = new DataTransfer(); data.items.add(new File(['mock fixture'], 'sample.${type === 'video/webm' ? 'webm' : type === 'audio/wav' ? 'wav' : 'png'}', {type:${JSON.stringify(type)}})); input.files = data.files; input.dispatchEvent(new Event('change', {bubbles:true})); })()`)
    await wait('!document.body.innerText.includes("Uploading")')
    if (type === 'video/webm') await wait('document.querySelector(".widget input[type=number]") && !document.querySelector(".widget-fieldset").disabled')
  }
  const generate = async (workflow, check, selector = '.app-go .btn-blue') => {
    await wait(`document.querySelector(${JSON.stringify(selector)}) && !document.querySelector(${JSON.stringify(selector)}).disabled`)
    const count = requests.length
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
    for (const deadline = Date.now() + uiTimeout; requests.length === count && Date.now() < deadline;) await pause(100)
    assert.equal(requests.length, count + 1, 'One shared runner request per click')
    const request = requests.at(-1)
    assert.equal(request.path, '/api/comfy/run')
    assert.equal(request.workflow, workflow)
    check?.(request.vars)
    await wait('!document.querySelector(".app-go .btn-blue")?.disabled && !document.querySelector(".sheet-foot .btn-blue")?.disabled')
    await wait('!JSON.parse(localStorage.getItem("comfyfield.library") || "[]").some((g) => g.pending)')
    await pause(100)
  }
  const screenshot = async (name) => {
    await evaluate('window.scrollTo(0, 0)')
    await wait('[...document.querySelectorAll("video.widget-video")].every((v) => v.readyState >= 2 && !v.seeking)')
    await pause(200)
    const { cssContentSize, cssLayoutViewport } = await cdp('Page.getLayoutMetrics')
    const clip = await evaluate('Boolean(document.querySelector(".sheet"))')
      ? { x: 0, y: 0, width: cssLayoutViewport.clientWidth, height: cssLayoutViewport.clientHeight } : cssContentSize
    const data = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...clip, scale: 1 } })
    writeFileSync(`${dir}/mock-${name}.png`, Buffer.from(data.data, 'base64'))
    shots++
  }
  const pair = async (name) => {
    assert.equal(await evaluate('document.querySelectorAll("main h1").length'), 1, `${name} has one page heading`)
    await screenshot(`${name}-desktop`)
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1100, deviceScaleFactor: 1, mobile: true })
    assert(await evaluate('document.documentElement.scrollWidth <= 390'), `${name} must fit 390px`)
    await screenshot(`${name}-390`)
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Network.enable')
  await cdp('Network.setBlockedURLs', { urls: ['https://*', 'http://*.com/*'] })
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })

  await goto('/upscale')
  await upload('.app-main input[type=file]', 'image/png')
  await click('Faithful')
  await click('4x')
  await generate('image_upscale_esrgan', (vars) => { assert.equal(vars.upscale_factor, 4); assert.equal(vars.image, '/mock-photo.svg') })
  assert((await evaluate('document.querySelector(".format-limit").textContent')).includes('4096'))
  await pair('upscale')
  await click('Enhance')
  await generate('image_upscale', (vars) => assert.equal(vars.upscale_factor, 4))
  await click('UnblurRecover detail with SeedVR2 and choose the output size')
  await wait('document.querySelector(".app-main img")')
  await click('4k')
  await generate('seedvr2_image', (vars) => assert.equal(vars.target, 4096))
  await click('Video', '.sb-hero button')
  await upload('.app-main input[type=file]', 'video/webm')
  await click('4x')
  await generate('seedvr2_video', (vars) => assert.equal(vars.upscale_factor, 4))

  await goto('/video/edit')
  assert.equal(await evaluate('document.querySelectorAll("[aria-label=Edit] .opt").length'), 6)
  await upload('.app-main input[type=file]', 'video/webm')
  await type('.widget input[type=number]', '0.25')
  await type('.app-panel textarea', 'Turn the jacket red')
  await generate('bernini_swap_noref', (vars) => { assert.equal(vars.start, 0.25); assert(vars.prompt.includes('Turn the jacket red')) })
  await pair('edit-video')
  await click('Remove an objectName what to erase from the clip')
  await wait('document.querySelector(".widget video")')
  await type('.app-panel input:not([type=file])', 'Blue chair')
  await generate('void_inpaint', (vars) => { assert.equal(vars.target, 'Blue chair'); assert.equal(vars.start, 0.25) })
  await click('Remove the backgroundTransparent, green screen or a new scene')
  await generate('birefnet_video_matte_alpha')
  await click('Swap a characterA new character, same moves and timing')
  await click('Saved character', '.app-panel .pills button')
  await click('Mock character', '.app-panel .pick')
  await generate('scail2_character_swap', (vars) => assert.equal(vars.image, '/mock-photo.svg'))
  await click('New angleThe same take from another camera')
  await click('Orbit around')
  await generate('recammaster', (vars) => { assert.equal(vars.trajectory, 'arc_right'); assert.equal(vars.orbit, true) })
  assert((await evaluate('document.querySelector(".format-limit").textContent')).includes('81'))
  await pair('reshoot')
  await click('Color gradeGive the whole clip a film look')
  await click('Icy blue')
  await generate('bernini_grade', (vars) => assert(vars.prompt.includes('icy blue')))

  await goto('/audio?model=chatterbox-multilingual')
  assert(!(await evaluate('document.querySelector(".app-panel").innerText')).includes('Auto detect'))
  await type('.app-panel textarea', 'This is a mock speech check.')
  await click('Excited')
  await click('Mandarin')
  await upload('.app-panel input[type=file]', 'audio/wav')
  await generate('chatterbox_tts', (vars) => { assert.equal(vars.language, 'Chinese (zh)'); assert.equal(vars.exaggeration, 0.9); assert.equal(vars.voice, '/mock-audio.wav'); assert.equal(vars.prompt, 'This is a mock speech check.') })
  await pair('audio')
  await click('Drama 3Read a script, optionally in a sample voice')
  await wait('document.querySelector(".format-info")?.textContent.includes("Built with Fish Audio")')
  assert((await evaluate('document.querySelector(".format-info").textContent')).includes('$500,000'))
  assert((await evaluate('document.querySelector(".app-panel").textContent')).includes('prior consent'))
  await generate('drama3_tts')
  await pair('drama3')
  await click('Qwen3-TTSRead a script in an uploaded sample voice')
  await generate('qwen3_tts', (vars) => assert.equal(vars.voice, '/mock-audio.wav'))
  await click('Voice change', '.sb-hero button')
  await upload('.app-main input[type=file]', 'audio/wav')
  await generate('chatterbox_vc', (vars) => { assert.equal(vars.audio, '/mock-audio.wav'); assert.equal(vars.voice, '/mock-audio.wav') })
  await pair('voice-change')
  const beforeTranslate = requests.length
  await click('Translate', '.sb-hero button')
  assert(await evaluate('document.querySelector(".empty button").disabled'))
  assert.equal(requests.length, beforeTranslate)

  await goto('/lipsync')
  await click('About 480p')
  assert(await evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent === "720p unavailable").disabled'))
  await upload('.app-main input[type=file]', 'image/png')
  await type('.app-panel textarea', 'A mock talking head.')
  await click('Japanese')
  await generate('infinitetalk_tts', (vars) => { assert.equal(vars.script, 'A mock talking head.'); assert.equal(vars.language, 'Japanese (ja)') })
  await pair('lipsync')
  await click('Use recorded audio')
  await upload('.app-panel input[type=file]', 'audio/wav')
  await generate('infinitetalk', (vars) => assert.equal(vars.audio, '/mock-audio.wav'))
  await click('Video', '.sb-hero button')
  await upload('.app-main input[type=file]', 'video/webm')
  await generate('infinitetalk_v2v', (vars) => { assert.equal(vars.video, '/mock-clip.webm'); assert.equal(vars.audio, '/mock-audio.wav') })
  await pair('lipsync-video')

  await goto('/mixed-media')
  await wait('document.querySelectorAll(".look").length === 33')
  assert.equal(await evaluate('document.querySelectorAll(".look-tag").length'), 0, 'All bundled mixed looks validate')
  await upload('.mixed-panel input[type=file]', 'video/webm')
  await type('.widget input[type=number]', '0.5')
  await pair('mixed-media')
  await evaluate('document.querySelector(".look").click()')
  await wait('document.querySelector(".sheet .widget video")')
  await click('FullThe look takes over', '.sheet button')
  await click('Every third frameSource rate ÷ 3, e.g. 10 fps from 30 fps', '.sheet button')
  assert((await evaluate('document.querySelector(".sheet .format-limit").textContent')).includes('81'))
  await pair('mixed-media-sheet')
  await generate('bernini_mixed', (vars) => { assert.equal(vars.video, '/mock-clip.webm'); assert.equal(vars.start, 0.5); assert.equal(vars.stride, 3); assert.equal(vars.strength, 0.85) }, '.sheet-foot .btn-blue')
  await wait('!document.querySelector(".sheet")')
  for (const [query, path, field, expected] of [
    ['el-sfx', '/api/elevenlabs', 'mode', 'sfx'],
    ['el-speech', '/api/elevenlabs', 'mode', 'speech'],
    ['g-tts', '/api/google', 'model', 'gemini-3.8-flash-tts'],
    ['fal:minimax/music-3', '/api/fal', 'model', 'minimax/music-3'],
  ]) {
    await goto(`/audio?model=${encodeURIComponent(query)}`)
    await type('#provider-audio-prompt', 'A mock provider request')
    const count = requests.length
    await click('Generate audio')
    await wait('!JSON.parse(localStorage.getItem("comfyfield.library") || "[]").some((g) => g.pending)')
    assert.equal(requests.length, count + 1)
    assert.equal(requests.at(-1).path, path)
    assert.equal(requests.at(-1)[field], expected)
    await goto('/audio')
    await wait('document.querySelector("#provider-audio-prompt")')
    if (query === 'el-sfx') await pair('audio-provider')
  }
  await evaluate(`localStorage.setItem('comfyfield.picker', JSON.stringify({kind:'audio',chosen:{audio:'fal:custom-audio'},extra:[{id:'fal:custom-audio',kind:'audio',provider:'fal',name:'Custom audio',model:'mock/audio'}],favorites:[]}))`)
  await goto('/audio')
  await type('#provider-audio-prompt', 'A saved custom fal model')
  const providerCount = requests.length
  await click('Generate audio')
  await wait('!JSON.parse(localStorage.getItem("comfyfield.library") || "[]").some((g) => g.pending)')
  assert.equal(requests.length, providerCount + 1)
  assert.equal(requests.at(-1).model, 'mock/audio')
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("comfyfield.library")).length'), requests.length, 'Every output persists in Library')
  console.log(`Studio UI mock checks ok: ${requests.length} shared runner submissions, five studios, all six video edits, real upload URLs, language/delivery/voice/trim vars, Library persistence, disabled unavailable paths and 390px layouts. ${shots} labeled mock screenshots saved to ${dir}. No provider calls.`)
} finally {
  await browser?.close()
  await server.close()
}
