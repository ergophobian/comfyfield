import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import ffmpeg from 'ffmpeg-static'
import { preview } from 'vite'
import { voiceRoutes } from '../server/voices.js'
import { voiceLimits, voiceValue } from '../shared/voices.js'
import { formatById } from '../src/lib/formats/index.js'
import { compileFormat, runFormat } from '../src/lib/formats/runner.js'
import { comfyVars, fill, dropOptional } from '../shared/mapping.js'
import { startBrowser, uiTimeout } from './browser.mjs'

// Synthetic tones exercise media persistence; they are not shipped as starter voices.
function tone(seconds) {
  const samples = Math.round(24000 * seconds)
  const out = Buffer.alloc(44 + samples * 2)
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVE', 8)
  out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22)
  out.writeUInt32LE(24000, 24); out.writeUInt32LE(48000, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34)
  out.write('data', 36); out.writeUInt32LE(samples * 2, 40)
  for (let i = 0; i < samples; i++) out.writeInt16LE(Math.round(1200 * Math.sin(i * Math.PI * 440 / 24000)), 44 + i * 2)
  return out
}
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'comfyfield-voice-check-'))
fs.mkdirSync(path.join(home, 'media'))
fs.writeFileSync(path.join(home, 'library.json'), JSON.stringify({ characters: [{ id: 'keep', name: 'Existing character' }] }))
const adapters = {
  home: () => home,
  saveMedia(buf, ext) {
    const name = `${crypto.randomUUID()}.${ext}`
    fs.writeFileSync(path.join(home, 'media', name), buf)
    return { url: `/media/${name}` }
  },
}
let route = voiceRoutes(adapters)
const mediaRequests = []
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'voice-library-fixture', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (await route(req, res, url)) return
      if (url.pathname.startsWith('/media/')) {
        mediaRequests.push(url.pathname)
        const file = path.join(home, 'media', path.basename(url.pathname))
        if (!fs.existsSync(file)) { res.statusCode = 404; res.end(); return }
        res.setHeader('Content-Type', 'audio/wav')
        res.end(fs.readFileSync(file))
        return
      }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (/^\/api\/library\/(characters|products|brands)$/.test(url.pathname)) return res.end('[]')
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const request = async (suffix = '', method = 'GET', data) => {
  const res = await fetch(`${origin}/api/library/voices${suffix}`, { method, headers: { 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined })
  return { status: res.status, data: await res.json() }
}
const source = tone(12)
const payload = { name: 'Test narrator', consent: true, fileName: 'sample.wav', dataUrl: `data:audio/wav;base64,${source.toString('base64')}`, start: 1, duration: 5 }
let browser
try {
  assert.equal((await request('', 'POST', { ...payload, consent: false })).status, 400)
  assert.equal((await request('', 'POST', { ...payload, name: '   ' })).status, 400)
  assert.equal((await request('', 'POST', { ...payload, dataUrl: 'data:audio/wav;base64,YmFk' })).status, 400)
  assert.equal((await request('', 'POST', { ...payload, fileName: 'sample.exe' })).status, 400)
  assert.equal((await request('', 'POST', { ...payload, start: 11 })).status, 400)
  assert.equal((await request('', 'POST', { ...payload, duration: 11 })).status, 400)
  for (const seconds of [2, 61]) assert.equal((await request('', 'POST', { ...payload, dataUrl: `data:audio/wav;base64,${tone(seconds).toString('base64')}` })).status, 400)
  assert.equal((await request('', 'POST', { ...payload, dataUrl: `data:audio/wav;base64,${Buffer.alloc(voiceLimits.bytes + 1).toString('base64')}` })).status, 413)
  assert.deepEqual((await request()).data, [])
  assert.equal(fs.readdirSync(path.join(home, 'media')).length, 0, 'Rejected uploads do not create media')
  const saved = await request('', 'POST', payload)
  assert.equal(saved.status, 200)
  assert.equal(saved.data.duration, 5)
  assert(saved.data.consentAt > 0)
  const sample = fs.readFileSync(path.join(home, 'media', path.basename(saved.data.sample)))
  assert.equal(sample.length, 44 + 5 * 48000)
  assert.equal(sample.readUInt16LE(22), 1, 'Saved sample is mono')
  assert.equal(sample.readUInt32LE(24), 24000)
  assert.equal(sample.readInt16LE(44 + 100), source.readInt16LE(44 + 48000 + 100), 'Trim starts at the requested second')
  assert.equal(JSON.parse(fs.readFileSync(path.join(home, 'library.json'))).characters[0].id, 'keep')
  route = voiceRoutes(adapters)
  assert.equal((await request()).data[0].id, saved.data.id, 'A fresh route reads the persisted list')
  assert.equal((await request(`/${saved.data.id}`, 'PATCH', { name: 'Renamed narrator', sample: '/outside.wav', consent: false })).data.sample, saved.data.sample)
  assert.equal((await request(`/${saved.data.id}`, 'PATCH', { name: ' ' })).status, 400)
  const value = voiceValue((await request()).data[0])
  for (const id of ['tts', 'voice-change', 'voice-clone']) {
    const inputs = id === 'voice-clone' ? { audio: value, name: 'Test clone' } : { voice: value, script: 'A test line.', audio: { url: saved.data.sample, name: 'Input recording' } }
    const flow = compileFormat(formatById(id), inputs)
    const options = flow.nodes.find((n) => n.type === 'model').data.model.formatStep.options
    const vars = comfyVars('audio', options)
    assert.equal(id === 'voice-clone' ? vars.audio : vars.voice, saved.data.sample, `${id} receives saved voice`)
    await runFormat(formatById(id), inputs, { run: async (model, opts) => {
      const vars = comfyVars('audio', opts)
      const graph = JSON.parse(fs.readFileSync(`public/workflows/${model.workflow}.json`))
      const prepared = fill(dropOptional(graph, vars), vars)
      assert(Object.values(prepared).some((n) => n.class_type === 'LoadAudio' && n.inputs.audio === saved.data.sample))
      return [{ url: '/mock-result.wav', kind: 'audio' }]
    } })
  }
  for (const workflow of ['chatterbox_tts', 'qwen3_tts', 'drama3_tts']) {
    const graph = JSON.parse(fs.readFileSync(`public/workflows/${workflow}.json`))
    const vars = comfyVars('audio', { slots: { voice: value.sample } })
    assert(Object.values(fill(dropOptional(graph, vars), vars)).some((n) => n.class_type === 'LoadAudio' && n.inputs.audio === saved.data.sample))
  }
  for (const [ext, mime, args] of [
    ['mp3', 'audio/mpeg', ['-f', 'mp3']], ['flac', 'audio/flac', ['-f', 'flac']],
    ['m4a', 'audio/mp4', ['-c:a', 'aac', '-movflags', 'frag_keyframe+empty_moov', '-f', 'mp4']],
  ]) {
    const encoded = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', 'pipe:0', ...args, 'pipe:1'], { input: source, maxBuffer: 4 * 1024 * 1024, windowsHide: true })
    assert.equal(encoded.status, 0, encoded.stderr.toString())
    const item = await request('', 'POST', { ...payload, fileName: `sample.${ext}`, dataUrl: `data:${mime};base64,${encoded.stdout.toString('base64')}` })
    assert.equal(item.status, 200, `${ext}: ${JSON.stringify(item.data)}`)
    assert.equal((await request(`/${item.data.id}`, 'DELETE')).status, 200)
  }
  const m4aFile = path.join(home, 'media', 'source.m4a')
  const m4a = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', 'pipe:0', '-c:a', 'aac', m4aFile], { input: source, windowsHide: true })
  assert.equal(m4a.status, 0, m4a.stderr.toString())
  const ordinaryM4a = await request('', 'POST', { ...payload, fileName: 'ordinary.m4a', dataUrl: `data:audio/mp4;base64,${fs.readFileSync(m4aFile).toString('base64')}` })
  assert.equal(ordinaryM4a.status, 200, `Seekable m4a: ${JSON.stringify(ordinaryM4a.data)}`)
  await request(`/${ordinaryM4a.data.id}`, 'DELETE')
  assert.equal((await request(`/${saved.data.id}`, 'DELETE')).status, 200)
  route = voiceRoutes(adapters)
  assert.deepEqual((await request()).data, [])
  assert.equal((await request(`/${saved.data.id}`, 'DELETE')).status, 404)
  console.log('Voice API checks passed: consent, size/type/duration/trim validation, four codecs, save/list/rename/delete/reload, media confinement, and saved samples in five workflow graphs. No provider calls.')

  const errors = []
  browser = await startBrowser('voice-library', { args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'], onEvent(msg) {
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text)
  } })
  const cdp = browser.send
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const wait = async (expression) => {
    for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) { if (await evaluate(`Boolean(${expression})`)) return; await pause(100) }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${errors.join('\n')}`)
  }
  const click = (text) => evaluate(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)}).click()`)
  const input = (selector, value) => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`)
  const goto = async (url) => { await cdp('Page.navigate', { url: `${origin}${url}` }); await wait('document.querySelector("main") && document.readyState === "complete"') }
  const screenshot = async (name) => {
    await pause(200)
    const data = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    fs.mkdirSync('research_notes/screenshots/voice-library', { recursive: true })
    fs.writeFileSync(`research_notes/screenshots/voice-library/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  const mobile = () => cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 960, deviceScaleFactor: 1, mobile: true })
  const desktop = () => cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await desktop()
  await goto('/assets?tab=voices')
  await wait('document.querySelector(".voice-library .empty button")')
  await click('Add a voice')
  await wait('document.querySelector("#voice-name")')
  await input('#voice-name', 'Synthetic test sample')
  await evaluate(`(() => { const el = document.querySelector('input[type=file]'); const raw = atob(${JSON.stringify(source.toString('base64'))}); const data = new DataTransfer(); data.items.add(new File([Uint8Array.from(raw, (c) => c.charCodeAt(0))], 'Synthetic test.wav', { type: 'audio/wav' })); el.files = data.files; el.dispatchEvent(new Event('change', { bubbles: true })); })()`)
  await wait('document.querySelector(".voice-library-sample audio")?.readyState >= 1')
  await input('[aria-label="Sample start"]', '1')
  await input('[aria-label="Sample length"]', '5')
  assert(await evaluate('document.querySelector(".form-sheet-foot .btn-blue").disabled'), 'Consent gates save')
  await evaluate('document.querySelector("input[type=checkbox]").click()')
  await wait('!document.querySelector(".form-sheet-foot .btn-blue").disabled')
  await screenshot('upload-desktop')
  await mobile()
  await screenshot('upload-390px')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), await evaluate('JSON.stringify([...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > 390).map((e) => [e.tagName, e.className, e.getBoundingClientRect().width]).slice(0, 20))'))
  await click('Save voice')
  await wait('document.querySelector(".voice-library-card audio")?.readyState >= 1 && !document.querySelector(".viewer")')
  await evaluate('document.querySelector(".voice-library-card audio").play()')
  assert(await evaluate('!document.querySelector(".voice-library-card audio").paused'), 'Sample plays')
  await screenshot('library-390px')
  await desktop()
  await screenshot('library-desktop')
  await goto('/assets?tab=voices')
  await wait('document.querySelector(".voice-library-card h3")?.textContent === "Synthetic test sample"')
  await click('Rename')
  await input('#voice-name', 'Renamed test sample')
  await click('Save voice')
  await wait('document.querySelector(".voice-library-card h3")?.textContent === "Renamed test sample"')
  await goto('/apps/tts')
  await wait('document.querySelector(".voice-card")')
  await evaluate('document.querySelector(".voice-card").click()')
  await wait('document.querySelector(".voice-play")')
  await evaluate('document.querySelector(".voice-play").click()')
  await wait('document.querySelector(".voice-play")?.getAttribute("aria-pressed") === "true"')
  await screenshot('picker-desktop')
  await mobile()
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Picker fits 390px')
  await screenshot('picker-390px')
  await evaluate('document.querySelector(".voice-play").parentElement.querySelector(".voice-pick").click()')
  await wait('!document.querySelector(".voice-menu") && document.querySelector(".voice-card").textContent.includes("Renamed test sample")')
  await goto('/assets?tab=voices')
  await wait('document.querySelector(".voice-library-card")')
  await click('Delete')
  await click('Keep voice')
  assert.equal((await request()).data.length, 1)
  await click('Delete')
  await click('Delete voice')
  await wait('document.querySelector(".voice-library .empty")')
  await goto('/assets?tab=voices')
  await wait('document.querySelector(".voice-library .empty")')
  await click('Add a voice')
  await input('#voice-name', 'Recorded test sample')
  await click('Record a sample')
  await wait('document.body.textContent.includes("Stop recording")')
  await pause(3800)
  await click('Stop recording')
  await wait('document.querySelector(".voice-library-sample audio")?.readyState >= 1')
  await evaluate('document.querySelector("input[type=checkbox]").click()')
  await wait('!document.querySelector(".form-sheet-foot .btn-blue").disabled')
  await click('Save voice')
  await wait('document.querySelector(".voice-library-card h3")?.textContent === "Recorded test sample"')
  assert((await request()).data[0].duration >= 3)
  assert.deepEqual(errors, [])
  assert(mediaRequests.length > 0)
  console.log('Voice browser checks passed: upload/record/trim/consent/save, playback, reload, rename, picker/preview/selection, delete/cancel/reload and 390px layout. Six synthetic-fixture screenshots saved under research_notes/screenshots/voice-library/.')
} finally {
  await browser?.close()
  await server.close()
}
