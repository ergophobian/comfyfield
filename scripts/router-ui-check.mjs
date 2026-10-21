import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { build, preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { models } from '../src/lib/catalog.js'
import { expectedInputs, prompt } from './fixtures/router-payloads.mjs'

// Production bundle, fake saved connection, mock API only. No provider modules or keys load.
const routerModels = models.filter((model) => model.provider === 'comfyRouter')
const requests = []
let fakeKey = ''
let partial = false
let failedSecond = false
let failedTakes = 0
let planningDelay = 0
let failWriter = false
let failCreate = true
const writerRequests = []
const accepted = new Map()
const reference = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1cAAAAASUVORK5CYII='
const fixture = await build({ configFile: false, envFile: false, esbuild: { jsx: 'automatic' }, logLevel: 'warn', build: { write: false, minify: false, rollupOptions: { input: 'scripts/router-fixture.jsx', output: { inlineDynamicImports: true } } } })
const fixtureCode = fixture.output.find((file) => file.type === 'chunk').code
const fixtureStyles = (readFileSync('dist/index.html', 'utf8').match(/<link[^>]+rel="stylesheet"[^>]*>/g) || []).join('')
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'router-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/router-fixture') {
        res.setHeader('Content-Type', 'text/html')
        return res.end(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1">${fixtureStyles}</head><body><div id="root"></div><script type="module" src="/router-fixture.js"></script></body></html>`)
      }
      if (req.url === '/router-fixture.js') {
        res.setHeader('Content-Type', 'text/javascript')
        return res.end(fixtureCode)
      }
      if (!req.url.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      const url = new URL(req.url, 'http://localhost')
      let body
      if (req.method === 'POST') {
        let raw = ''
        for await (const chunk of req) raw += chunk
        body = url.pathname === '/api/upload' ? {} : JSON.parse(raw)
      }
      if (url.pathname === '/api/connections') {
        if (body) { assert.equal(body.id, 'comfy'); fakeKey = body.values.key }
        return res.end(JSON.stringify({ comfy: { connected: Boolean(fakeKey) }, comfyRouter: { connected: Boolean(fakeKey) } }))
      }
      if (url.pathname === '/api/connections/test') return res.end('{"ok":true}')
      if (url.pathname === '/api/comfy/requirements') {
        if (planningDelay) await new Promise((resolve) => setTimeout(resolve, planningDelay))
        return res.end(JSON.stringify({ connections: { comfyRouter: { connected: true } }, writerProviders: ['comfyRouter'], requirements: [] }))
      }
      if (url.pathname === '/api/prompt') {
        writerRequests.push(body)
        if (writerRequests.length === 1 || failWriter) {
          failWriter = false
          res.statusCode = 503
          return res.end(JSON.stringify({ error: 'Mock writer lost response' }))
        }
        return res.end(JSON.stringify({ text: 'Recovered writer prompt' }))
      }
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/upload') return res.end(JSON.stringify({ url: reference }))
      if (url.pathname.startsWith('/api/library/')) return res.end(JSON.stringify(url.pathname.endsWith('/characters') ? Array.from({ length: 5 }, (_, i) => ({ id: `char-${i}`, name: `Character ${i}`, images: [`https://example.test/character-${i}.png`] })) : []))
      if (url.pathname === '/api/comfy/router') {
        assert.equal(fakeKey, 'mock-comfy-not-a-key')
        const model = routerModels.find((model) => model.model === body.model)
        assert(model)
        assert.match(body.idempotencyKey, /^[a-f0-9-]{36}$/)
        requests.push(body)
        if (body.input.prompt === 'Create failure' && failCreate) {
          failCreate = false
          res.statusCode = 402
          return res.end(JSON.stringify({ error: 'Mock Create credits', code: 'insufficient_credits', requestId: 'credits-request' }))
        }
        if (body.input.prompt === 'Library failure') {
          if (failedTakes++ < 2) {
            res.statusCode = 503
            return res.end(JSON.stringify({ error: 'Mock take failed' }))
          }
          return res.end(JSON.stringify({ files: [{ url: `/take-${body.idempotencyKey}.png`, kind: 'image' }] }))
        }
        if (partial) {
          if (!accepted.has(body.idempotencyKey)) accepted.set(body.idempotencyKey, [{ url: `/batch-${accepted.size + 1}.png`, kind: 'image' }])
          if (accepted.size === 2 && !failedSecond) {
            failedSecond = true
            res.statusCode = 503
            return res.end(JSON.stringify({ error: 'Mock lost response after accepting image two' }))
          }
          return res.end(JSON.stringify({ files: accepted.get(body.idempotencyKey) }))
        }
        return res.end(JSON.stringify({ files: [{ url: '/mock-result.png', kind: model.kind }] }))
      }
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let browser
try {
  const errors = []
  browser = await startBrowser('router-ui', { onEvent(event) {
    if (event.method === 'Runtime.exceptionThrown') errors.push(event.params.exceptionDetails.exception?.description || event.params.exceptionDetails.text)
  } })
  const cdp = browser.send
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const wait = async (expression) => {
    for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) {
      if (await evaluate(`Boolean(${expression})`)) return
      await pause(100)
    }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${JSON.stringify(errors)}`)
  }
  const goto = async (path) => {
    await cdp('Page.navigate', { url: `${origin}${path}` })
    await wait('document.querySelector("main") && document.readyState === "complete"')
  }
  const fill = async (selector, text) => evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)})
    const prototype = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, ${JSON.stringify(text)})
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  const viewport = (width) => cdp('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: width === 390 })
  const screenshot = async (name) => {
    await pause(300)
    const data = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    mkdirSync('research_notes/screenshots/router-breadth', { recursive: true })
    writeFileSync(`research_notes/screenshots/router-breadth/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await viewport(1440)
  await goto('/image')
  await evaluate('document.querySelector(".picker-btn").click()')
  await wait('document.querySelector(".picker-pop")')
  assert.equal(await evaluate('[...document.querySelectorAll(".picker-sub")].some((element) => element.textContent.includes("via Comfy Router"))'), false)
  await goto('/connections')
  await wait('document.querySelector("#comfy-key")')
  await fill('#comfy-key', 'mock-comfy-not-a-key')
  await evaluate('document.querySelector("#comfy-key").closest(".conn").querySelector("button").click()')
  await wait('document.querySelector("#comfy-key").closest(".conn").querySelector(".status").textContent === "Connected"')
  for (const kind of ['image', 'video', 'audio']) {
    const options = routerModels.filter((model) => model.kind === kind)
    for (const model of options) {
      await viewport(1440)
      // Set the persisted selection before reloading; still choose each model through the picker.
      await evaluate(`localStorage.setItem('comfyfield.picker', JSON.stringify({ kind: ${JSON.stringify(kind)}, chosen: { ${kind}: ${JSON.stringify(options[0].id)} }, favorites: ${JSON.stringify(options.map((model) => model.id))}, extra: [] }))`)
      await goto(`/${kind}`)
      await wait(`document.querySelector('.picker-btn')?.textContent.includes(${JSON.stringify(options[0].name)})`)
      await evaluate('document.querySelector(".picker-btn").click()')
      await wait('document.querySelector(".picker-pop")')
      await evaluate('document.querySelector(".picker-rail [title=Favorites]").click()')
      await wait(`document.querySelectorAll('.picker-pick').length === ${options.length}`)
      assert.equal(await evaluate('[...document.querySelectorAll(".picker-sub")].every((element) => element.textContent.includes("via Comfy Router") && !element.textContent.includes("add key"))'), true)
      if (model === options[0]) {
        await screenshot(`${kind}-picker-desktop`)
        await viewport(390)
        assert(await evaluate('document.documentElement.scrollWidth <= 390'), `${kind} picker must fit 390px`)
        assert(await evaluate('[...document.querySelectorAll(".picker-sub")].every((el) => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)'), `${kind} price units must fit their rows`)
        await screenshot(`${kind}-picker-390`)
        await viewport(1440)
      }
      await evaluate(`[...document.querySelectorAll('.picker-pick')].find((button) => button.querySelector('.picker-name').textContent === ${JSON.stringify(model.name)}).click()`)
      await wait(`document.querySelector('.picker-btn').textContent.includes(${JSON.stringify(model.name)})`)
      await fill(kind === 'audio' ? '#script' : 'textarea[aria-label=Prompt]', prompt)
      await wait('!document.querySelector(".gen-go").disabled')
      const before = requests.length
      await evaluate('document.querySelector(".gen-go").click()')
      for (const deadline = Date.now() + uiTimeout; requests.length === before && Date.now() < deadline;) await pause(100)
      assert.equal(requests.length, before + 1)
      const payload = requests.at(-1)
      assert.equal(payload.model, model.model)
      assert.deepEqual(payload.input, expectedInputs[model.model])
      await wait('!document.querySelector(".gen-feed .pending")')
    }
  }
  // Combined upload and Library limits survive switching to a smaller model.
  const imageModels = routerModels.filter((m) => m.kind === 'image')
  await evaluate(`localStorage.setItem('comfyfield.picker', JSON.stringify({ kind: 'image', chosen: { image: 'comfy-router-flux-max' }, favorites: ${JSON.stringify(imageModels.map((m) => m.id))}, extra: [] }))`)
  await goto('/image')
  await wait(`document.querySelector('.picker-btn')?.textContent.includes('Flux 2 max')`)
  await fill('textarea[aria-label=Prompt]', prompt)
  for (let i = 0; i < 4; i++) {
    await evaluate(`document.querySelector('[aria-label="Add from Library"]').click()`)
    await wait(`document.querySelectorAll('.gen-lib').length === 5`)
    await evaluate(`document.querySelectorAll('.gen-lib')[${i}].click()`)
    await wait(`document.querySelectorAll('.ref').length === ${i + 1}`)
    await evaluate(`document.querySelector('[aria-label="Add from Library"]').click()`)
  }
  await evaluate(`(() => {
    const bytes = Uint8Array.from(atob(${JSON.stringify(reference.split(',')[1])}), (c) => c.charCodeAt(0))
    const data = new DataTransfer()
    data.items.add(new File([bytes], 'reference.png', { type: 'image/png' }))
    const input = document.querySelector('input[type=file]')
    input.files = data.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
  await wait('document.querySelectorAll(".gen-thumb img").length === 1 && !document.querySelector(".gen-thumb.busy")')
  const chooseImage = async (name) => {
    await evaluate('document.querySelector(".picker-btn").click()')
    await wait('document.querySelector(".picker-pop")')
    await evaluate('document.querySelector(".picker-rail [title=Favorites]").click()')
    await wait(`document.querySelectorAll('.picker-pick').length === ${imageModels.length}`)
    await evaluate(`[...document.querySelectorAll('.picker-pick')].find((b) => b.querySelector('.picker-name').textContent === ${JSON.stringify(name)}).click()`)
  }
  await chooseImage('Flux Kontext pro')
  await wait('document.querySelector(".gen-go").disabled && document.querySelector(".gen-notice")?.textContent.includes("up to 4")')
  const beforeInvalid = requests.length
  await evaluate(`document.querySelector('form.composer').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))`)
  await pause(100)
  assert.equal(requests.length, beforeInvalid)
  await evaluate('document.querySelector(".ref button").click()')
  await wait('!document.querySelector(".gen-go").disabled')
  assert.equal(await evaluate(`document.querySelector('[aria-label="Add reference images"]').disabled`), true)
  await evaluate(`document.querySelector('[aria-label="Add from Library"]').click()`)
  await wait(`document.querySelectorAll('.gen-lib').length === 5`)
  assert.equal(await evaluate('[...document.querySelectorAll(".gen-lib")].filter((b) => b.getAttribute("aria-pressed") === "false").every((b) => b.disabled)'), true)
  await evaluate(`document.querySelector('[aria-label="Add from Library"]').click()`)
  await evaluate('document.querySelector(".gen-go").click()')
  await wait('!document.querySelector(".gen-feed .pending")')
  assert.deepEqual(requests.at(-1).input, { prompt, aspect_ratio: '1:1', input_image: reference, input_image_2: 'https://example.test/character-1.png', input_image_3: 'https://example.test/character-2.png', input_image_4: 'https://example.test/character-3.png' })
  await chooseImage('Photon flash')
  await wait('document.querySelector(".gen-go").disabled && document.querySelector(".gen-notice")?.textContent.includes("up to 0")')

  // Exercise the real hook and provider with count three; the second accepted call loses its reply.
  await evaluate(`localStorage.removeItem('comfyfield.library')`)
  partial = true
  const beforeBatch = requests.length
  await goto('/router-fixture')
  await wait('document.querySelector("#batch")')
  await evaluate('document.querySelector("#batch").click()')
  await wait('!document.querySelector("#retry").disabled && JSON.parse(localStorage.getItem("comfyfield.library")).some((item) => item.url === "/batch-1.png")')
  assert.equal(requests.length - beforeBatch, 2)
  assert.equal(await evaluate('JSON.parse(document.querySelector("#items").textContent).filter((item) => item.url).length'), 1)
  await screenshot('partial-batch-failure')
  await evaluate('document.querySelector("#retry").click(); document.querySelector("#retry").click()')
  await wait('JSON.parse(document.querySelector("#items").textContent).filter((item) => item.url).length === 3 && !JSON.parse(document.querySelector("#items").textContent).some((item) => item.pending)')
  const batchCalls = requests.slice(beforeBatch)
  assert.equal(batchCalls.length, 4)
  assert.equal(batchCalls[1].idempotencyKey, batchCalls[2].idempotencyKey)
  assert.deepEqual(batchCalls[1], batchCalls[2])
  assert.equal(new Set(batchCalls.map((call) => call.idempotencyKey)).size, 3)
  assert.equal(batchCalls.filter((call) => call.idempotencyKey === batchCalls[0].idempotencyKey).length, 1)
  await wait('JSON.parse(localStorage.getItem("comfyfield.library")).filter((item) => item.url).length === 3')
  assert.deepEqual(await evaluate('JSON.parse(localStorage.getItem("comfyfield.library")).filter((item) => item.url).map((item) => item.url).sort()'), ['/batch-1.png', '/batch-2.png', '/batch-3.png'])
  await screenshot('partial-batch-recovered')
  await goto('/router-fixture')
  await wait('JSON.parse(document.querySelector("#items").textContent).filter((item) => item.url).length === 3')
  // Same format id with different values must produce two independent requests/sessions.
  partial = false
  const beforeConcurrent = requests.length
  planningDelay = 500
  await evaluate('document.querySelector("#concurrent").click()')
  await wait('document.querySelector("#busy").textContent === "true"')
  assert.equal(requests.length, beforeConcurrent, 'Busy is visible during preflight, before any adapter requests')
  assert.equal(await evaluate('JSON.parse(document.querySelector("#sessions").textContent).length'), 2, 'onSession fires for both shots before completion')
  await wait('JSON.parse(document.querySelector("#sessions").textContent).length === 2 && JSON.parse(document.querySelector("#sessions").textContent).every((session) => !session.busy && session.files === 1)')
  planningDelay = 0
  assert.equal(requests.length - beforeConcurrent, 2)
  assert.deepEqual(requests.slice(beforeConcurrent).map((call) => call.input.prompt).sort(), ['First concurrent shot', 'Second concurrent shot'])
  assert.equal(await evaluate('new Set(JSON.parse(document.querySelector("#sessions").textContent).map((session) => session.id)).size'), 2)

  // A later take must not erase either failed Library item for its step.
  const beforeFailure = requests.length
  await evaluate('document.querySelector("#format-failure").click()')
  await wait('JSON.parse(document.querySelector("#session").textContent)?.failed === 2 && !JSON.parse(document.querySelector("#session").textContent).busy')
  assert.equal(requests.length - beforeFailure, 3)
  const libraryBefore = await evaluate('JSON.parse(document.querySelector("#items").textContent).filter((item) => item.formatRunId === JSON.parse(document.querySelector("#session").textContent).id)')
  assert.equal(libraryBefore.filter((item) => item.failed).length, 2)
  assert.equal(libraryBefore.filter((item) => item.url).length, 1)
  await evaluate('document.querySelector("#format-retry").click()')
  await wait('JSON.parse(document.querySelector("#session").textContent)?.failed === 0 && !JSON.parse(document.querySelector("#session").textContent).busy')
  const takeCalls = requests.slice(beforeFailure)
  assert.equal(takeCalls.length, 5)
  assert.deepEqual(takeCalls[0], takeCalls[3], 'First take retry reuses its Router key')
  assert.deepEqual(takeCalls[1], takeCalls[4], 'Second take retry reuses its Router key')
  const libraryAfter = await evaluate('JSON.parse(document.querySelector("#items").textContent).filter((item) => item.formatRunId === JSON.parse(document.querySelector("#session").textContent).id)')
  assert.equal(libraryAfter.filter((item) => item.failed || item.pending).length, 0)
  assert.equal(libraryAfter.filter((item) => item.url).length, 3)
  assert(libraryAfter.some((item) => item.id === libraryBefore.find((item) => item.url).id), 'Retain the successful take in the Library')
  const beforeWriter = requests.length
  await evaluate('document.querySelector("#writer-failure").click()')
  await wait('JSON.parse(document.querySelector("#session").textContent)?.failed === 1 && !JSON.parse(document.querySelector("#session").textContent).busy')
  await evaluate('document.querySelector("#format-retry").click()')
  await wait('JSON.parse(document.querySelector("#session").textContent)?.failed === 0 && !JSON.parse(document.querySelector("#session").textContent).busy')
  assert.equal(writerRequests.length, 2)
  assert.deepEqual(writerRequests[0], writerRequests[1], 'The hook forwards the retained writer key and body')
  assert.match(writerRequests[1].idempotencyKey, /^[a-f0-9-]{36}$/)
  assert.equal(requests.length, beforeWriter, 'Writer retry keeps the review gate closed')
  await evaluate('document.querySelector("#writer-send").click()')
  await wait(`JSON.parse(document.querySelector("#items").textContent).some((item) => item.prompt === 'Recovered writer prompt' && item.url)`)
  assert.equal(requests.length, beforeWriter + 1)
  await wait('document.querySelector("#error").textContent === ""')
  // Updates from independent format sessions must preserve Create's error and retry.
  await evaluate('document.querySelector("#create-failure").click()')
  await wait('document.querySelector("#error").textContent === "Mock Create credits" && !document.querySelector("#retry").disabled')
  const failedCreateKey = requests.at(-1).idempotencyKey
  await evaluate('document.querySelector("#concurrent").click()')
  await wait('JSON.parse(document.querySelector("#sessions").textContent).length === 4 && JSON.parse(document.querySelector("#sessions").textContent).every((s) => !s.busy)')
  assert.equal(await evaluate('document.querySelector("#error").textContent'), 'Mock Create credits')
  assert.equal(await evaluate('document.querySelector("#retry").disabled'), false)
  await evaluate('document.querySelector("#retry").click()')
  await wait('!JSON.parse(document.querySelector("#items").textContent).some((i) => i.pending) && document.querySelector("#error").textContent === ""')
  assert.notEqual(requests.at(-1).idempotencyKey, failedCreateKey, 'Provider forwards terminal status so Create rotates the key')
  assert.equal(requests.at(-1).input.prompt, 'Create failure', 'The preserved Retry belongs to Create')

  failWriter = true
  const beforeSheet = requests.length
  const beforeSheetWriter = writerRequests.length
  await evaluate('document.querySelector("#writer-sheet").click()')
  await wait('document.querySelector(".sheet-foot .btn-blue")')
  await evaluate('document.querySelector(".sheet-foot .btn-blue").click()')
  await wait('[...document.querySelectorAll(".format-review button")].some((b) => b.textContent === "Retry failed")')
  assert.equal(requests.length, beforeSheet, 'Failed sheet writer spends no render calls')
  await viewport(390)
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), await evaluate('JSON.stringify({ width: innerWidth, scroll: document.documentElement.scrollWidth, overflowing: [...document.querySelectorAll("*")].filter((el) => el.getBoundingClientRect().right > 391).map((el) => el.tagName + "." + el.className).slice(0, 12) })'))
  await screenshot('sheet-writer-failure-390')
  await evaluate('[...document.querySelectorAll(".format-review button")].find((b) => b.textContent === "Retry failed").click()')
  await wait(`document.querySelector('textarea[aria-label="Written prompt"]')`)
  assert.equal(writerRequests.length, beforeSheetWriter + 2)
  assert.equal(requests.length, beforeSheet, 'Retry returns to review without rendering')
  assert.equal(await evaluate('document.querySelector(".format-review [role=alert]")'), null)
  await evaluate('[...document.querySelectorAll(".format-review button")].find((b) => b.textContent === "Send to render").click()')
  await wait('!JSON.parse(document.querySelector("#items").textContent).some((i) => i.pending) && document.querySelector(".format-review button")?.textContent === "Prompt sent"')
  assert.equal(requests.length, beforeSheet + 1)
  assert.deepEqual(errors, [])
  console.log(`Router UI checks passed: fake key gating, ${routerModels.length} picker selections and mocked generations, independent native payloads, combined reference limits, partial batch recovery with stable keys and Library persistence, concurrent format shots, per-take Library failures and session retries, independent Create error ownership, shared-sheet writer recovery, desktop and 390px layouts. Nine mock screenshots saved.`)
} finally {
  await browser?.close()
  await server.close()
}
