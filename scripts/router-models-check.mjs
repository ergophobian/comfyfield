import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { models } from '../src/lib/catalog.js'
import { mergeRouterModels, routerBrand, routerEntry } from '../shared/routerModels.js'

// The Comfy Router catalog: /api/comfy/models and its ten minute cache against a mocked
// GET /v2/models, then the picker and the Models page against a mock API. Run `npx vite build` first.
// No real Router call, no key.
if (!process.argv.includes('--isolated')) {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--isolated'], {
    stdio: 'inherit', env: { SystemRoot: process.env.SystemRoot || '', PATH: process.env.PATH || '', ...(process.env.CHROME_PATH && { CHROME_PATH: process.env.CHROME_PATH }), ...(process.env.CI && { CI: process.env.CI }) },
  })
  process.exit(result.status ?? 1)
}
fs.mkdirSync('outputs', { recursive: true })
process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.resolve('outputs/router-models-check-'))
process.env.COMFY_API_KEY = ''
const core = await import('../server/core.js')

// A v2/models catalog in two pages. Only `id` is in the contract; the rest is optional.
const pages = [
  { data: [
    { id: 'bfl/flux-2-pro', provider: 'bfl', model: 'flux-2-pro', display_name: 'FLUX.2 [pro]', output_modalities: ['image'] },
    { id: 'luma/photon-flash-1', provider: 'luma', model: 'photon-flash-1', output_modalities: ['image'], pricing: { amount: 0.0019, unit: 'image' } },
    { id: 'qwen/qwen-image-3.0', provider: 'qwen', model: 'qwen-image-3.0', name: 'Qwen Image 3.0', category: 'Image' },
    { id: 'ltx/ltx-2-5-fast', output_modalities: ['video', 'audio'] },
  ], has_more: true, next_cursor: 'page/2+' },
  { data: [
    { id: 'runway/gen-5', display_name: 'Gen-5', output_modalities: ['video'], price: { usd: '0.12', unit: 'second' } },
    { id: 'openai/gpt-4.1-nano', output_modalities: ['text'] },
    { id: 'byteplus/seed-audio-1.0', tags: ['audio'] },
    { nope: true },
  ], has_more: false },
]
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
const calls = []
const realFetch = globalThis.fetch
globalThis.fetch = async (url, options = {}) => {
  const u = new URL(url)
  assert.equal(`${u.origin}${u.pathname}`, 'https://api.comfy.org/v2/models', 'only the catalog is requested')
  calls.push({ cursor: u.searchParams.get('cursor'), key: options.headers['X-API-Key'] })
  return json(pages[u.searchParams.get('cursor') ? 1 : 0])
}

// Entries: names, kinds, brands and prices from whichever field a catalog row carries.
assert.deepEqual(routerEntry({ id: 'luma/photon-flash-1', output_modalities: ['image'], pricing: { amount: 0.0019, unit: 'image' } }),
  { id: 'luma/photon-flash-1', provider: 'luma', model: 'photon-flash-1', name: 'Photon flash 1', kind: 'image', brand: 'luma', price: { amount: 0.0019, unit: 'image' } })
assert.equal(routerEntry({ id: 'ltx/ltx-2-5-fast', output_modalities: ['video', 'audio'] }).kind, 'video')
assert.deepEqual(routerEntry({ id: 'runway/gen-5', price: { usd: '0.12', unit: 'second' } }).price, { amount: 0.12, unit: 'second' })
assert.equal(routerEntry({ id: 'bfl/flux-2-pro', price: { amount: 1 } }).price, null, 'a price without a unit is no price')
assert.equal(routerEntry({ provider: 'kling', model: 'kling-v3' }).id, 'kling/kling-v3')
assert.equal(routerEntry({ id: '../etc' }), null)
assert.deepEqual(['byteplus/x', 'vertexai/x', 'ltx/x', 'acme/x'].map(routerBrand), ['bytedance', 'gemini', 'lightricks', 'acme'])

// No key: no request, and the app is told to ask for one.
assert.deepEqual(await core.comfyModels(), { connected: false, models: [] })
assert.equal(calls.length, 0)

// With a key: every page, then ten minutes from the cache.
core.saveConnection('comfy', { key: 'mock-comfy-not-a-key' })
const t0 = 1_000_000
const first = await core.comfyModels({ now: t0 })
assert.deepEqual(calls, [{ cursor: null, key: 'mock-comfy-not-a-key' }, { cursor: 'page/2+', key: 'mock-comfy-not-a-key' }])
assert.equal(first.cached, false)
assert.deepEqual(first.models.map((m) => [m.id, m.kind]), [['bfl/flux-2-pro', 'image'], ['luma/photon-flash-1', 'image'], ['qwen/qwen-image-3.0', 'image'], ['ltx/ltx-2-5-fast', 'video'], ['runway/gen-5', 'video'], ['openai/gpt-4.1-nano', 'text'], ['byteplus/seed-audio-1.0', 'audio']])
const again = await core.comfyModels({ now: t0 + core.ROUTER_MODELS_TTL - 1 })
assert.equal(again.cached, true)
assert.equal(calls.length, 2, 'inside ten minutes the cache answers')
assert.equal((await core.comfyModels({ now: t0 + core.ROUTER_MODELS_TTL })).cached, false)
assert.equal(calls.length, 4, 'after ten minutes the catalog loads again')
core.saveConnection('comfy', { key: 'mock-other-not-a-key' })
await core.comfyModels({ now: t0 + core.ROUTER_MODELS_TTL + 1 })
assert.equal(calls.length, 6, 'a new key does not read the old key\'s cache')
assert.equal(calls[5].key, 'mock-other-not-a-key')

// A catalog that stops paging fails rather than looping.
globalThis.fetch = async () => json({ data: [], has_more: true })
core.saveConnection('comfy', { key: 'mock-third-not-a-key' })
await assert.rejects(core.comfyModels(), /stopped paging/)
const live = first.models
globalThis.fetch = realFetch

// Merge: hand rows stay runnable and take a live price; unmapped live rows are listed apart.
const hand = models.filter((m) => m.provider === 'comfyRouter')
assert.deepEqual(mergeRouterModels(hand, null), { models: hand, unwired: [], live: false })
const merged = mergeRouterModels(hand, live)
assert.equal(merged.models.length, hand.length, 'every hand row stays, listed or not')
assert.deepEqual(merged.models.find((m) => m.model === 'luma/photon-flash-1').price, { amount: 0.0019, unit: 'image' })
assert.deepEqual(merged.models.find((m) => m.model === 'bfl/flux-2-pro').price, hand.find((m) => m.model === 'bfl/flux-2-pro').price, 'no live price keeps the hand price')
assert.deepEqual(merged.unwired.map((m) => m.id), ['qwen/qwen-image-3.0', 'runway/gen-5', 'byteplus/seed-audio-1.0'])

// The app against a mock API.
let connected = false
const requests = []
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'router-models-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (!url.pathname.startsWith('/api/')) return next()
      requests.push(url.pathname)
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/connections') return res.end(JSON.stringify({ comfy: { connected }, comfyRouter: { connected } }))
      if (url.pathname === '/api/comfy/models') return res.end(JSON.stringify(connected ? { connected: true, models: live, cached: false } : { connected: false, models: [] }))
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const shots = 'research_notes/issue-2-router-models'
let browser
try {
  const errors = []
  browser = await startBrowser('router-models', { onEvent(msg) {
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
  const text = (selector) => evaluate(`[...document.querySelectorAll(${JSON.stringify(selector)})].map((e) => { const marks = [...e.querySelectorAll('.logo-mark')]; marks.forEach((m) => { m.style.display = 'none' }); const t = e.innerText; marks.forEach((m) => { m.style.display = '' }); return t }).map((t) => t.replace(/\\s+/g, ' ').trim())`)
  const screenshot = async (name) => {
    await pause(400)
    const data = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    fs.mkdirSync(shots, { recursive: true })
    fs.writeFileSync(`${shots}/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  const size = (width) => cdp('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 720 })
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await size(1280)

  // No key: Models opens on Comfy with the key state, and the picker has one row for it.
  await cdp('Page.navigate', { url: `${origin}/api/stitch/exports` })
  await wait('location.pathname === "/api/stitch/exports" && document.readyState === "complete"')
  await evaluate('localStorage.clear()')
  await cdp('Page.navigate', { url: `${origin}/models` })
  await wait('document.querySelector(".model-key")')
  assert.deepEqual(await text('.models-source [aria-selected=true]'), ['Comfy'])
  assert.match((await text('.model-key'))[0], /^Add your Comfy key One key lists every Comfy Router model, with prices\. Add key$/)
  await screenshot('mock-models-no-key')
  await cdp('Page.navigate', { url: `${origin}/image` })
  await wait('document.querySelector(".picker-btn")')
  await evaluate('document.querySelector(".picker-btn").click()')
  await wait('document.querySelector(".picker-key")')
  assert.deepEqual(await text('.picker-key'), ['Add your Comfy key Hosted models with prices, through one key'])
  assert.equal(await evaluate('document.querySelector(".picker-key").getAttribute("href")'), '/connections')
  assert(!requests.includes('/api/comfy/models'), 'no catalog request without a key')

  // With a key: Router models grouped by company, with the live price where the catalog has one.
  connected = true
  await cdp('Page.navigate', { url: `${origin}/models` })
  await wait('document.querySelector(".model-head") && document.querySelector(".models-more .model-row:not(.skeleton)")')
  const heads = await text('.model-list:not(.models-more) .model-head')
  assert.deepEqual(heads, ['Black Forest Labs', 'Luma AI', 'ByteDance'])
  const rows = await text('.model-list:not(.models-more) .model-row')
  assert(rows.some((r) => r.startsWith('Photon flash luma/photon-flash-1 · $0.0019 per image')), rows.join('\n'))
  assert(rows.some((r) => r.startsWith('Flux 2 Pro bfl/flux-2-pro · $0.0013 per gpu sec')), rows.join('\n'))
  assert.deepEqual(await text('.models-more .model-row'), ['Qwen Image 3.0 Alibaba · qwen/qwen-image-3.0'])
  assert(!(await text('.models-more .model-row')).some((r) => r.includes('Use')), 'unwired rows have no Use')
  await screenshot('mock-models-comfy-desktop')
  await size(390)
  await screenshot('mock-models-comfy-mobile')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Models must fit 390px')
  await size(1280)
  await evaluate('[...document.querySelectorAll(".seg button")].find((b) => b.textContent === "Video").click()')
  await wait('[...document.querySelectorAll(".models-more .model-row")].some((r) => r.textContent.includes("Gen-5"))')
  assert.deepEqual(await text('.models-more .model-row'), ['Gen-5 Runway · runway/gen-5 · $0.12 per sec'])
  assert((await text('.model-list:not(.models-more) .model-head')).includes('Lightricks'))

  // Use sends a Router model to its studio, and the picker groups it with the others.
  await evaluate('[...document.querySelectorAll(".seg button")].find((b) => b.textContent === "Image").click()')
  await wait('[...document.querySelectorAll(".model-row")].some((r) => r.querySelector("strong")?.textContent === "Photon flash")')
  await evaluate('[...document.querySelectorAll(".model-row")].find((r) => r.querySelector("strong")?.textContent === "Photon flash").click()')
  await wait('location.pathname === "/image" && document.querySelector(".picker-btn")?.textContent.includes("Photon flash")')
  await evaluate('document.querySelector(".picker-btn").click()')
  await wait('document.querySelector(".picker-pop")')
  assert(!(await evaluate('Boolean(document.querySelector(".picker-key"))')), 'no key row with a key')
  const pickerHeads = await text('.picker-head')
  assert.deepEqual(pickerHeads.slice(0, 3), ['Black Forest Labs', 'Luma AI', 'ByteDance'])
  assert((await text('.picker-row')).some((r) => r.startsWith('Photon flash via Comfy Router · $0.0019 per image')))
  await screenshot('mock-picker-comfy')
  assert.equal(requests.filter((r) => r === '/api/comfy/models').length, 1, 'one catalog request per page load')
  assert.deepEqual(errors, [], 'no browser runtime exceptions')
  console.log('Router models checks ok: catalog paging, ten minute cache per key, merge with hand rows, no-key state on Models and in the picker, company groups with live prices, 390px. Mocked catalog only; screenshots saved.')
} finally {
  await browser?.close()
  await server.close()
}
