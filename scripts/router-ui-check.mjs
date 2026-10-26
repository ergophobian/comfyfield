import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { build, preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { createJobs } from '../server/jobs.js'
import { randomUUID } from 'node:crypto'
import { models } from '../src/lib/catalog.js'
import { expectedInputs, prompt } from './fixtures/router-payloads.mjs'

// Production bundle, fake saved connection, mock API only. No provider modules or keys load.
const routerModels = models.filter((model) => model.provider === 'comfyRouter')
const requests = []
const jobs = createJobs(`outputs/router-jobs-${randomUUID()}.json`)
const jobRequests = []
const cancelledJobs = []
let holdJobs = false
let releaseHeld
let held = null
let fakeKey = ''
let partial = false
let failedSecond = false
let failedTakes = 0
let planningDelay = 0
let preflightConnected = true
let failWriter = false
let failCreate = true
let failAmbiguous = true
let cancelFormatRequests = 0
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
        return res.end(JSON.stringify({ connections: { comfyRouter: { connected: preflightConnected } }, writerProviders: ['comfyRouter'], requirements: [] }))
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
      if (url.pathname.startsWith('/api/jobs/')) {
        const id = url.pathname.slice('/api/jobs/'.length)
        if (req.method === 'DELETE') cancelledJobs.push(id)
        const job = req.method === 'DELETE' ? jobs.cancel(id) : jobs.get(id)
        res.statusCode = job ? 200 : 404
        return res.end(JSON.stringify(job || { error: 'Job not found' }))
      }
      if (url.pathname === '/api/jobs') {
        assert.equal(body.route, '/api/comfy/router')
        jobRequests.push(body)
        body = body.body
      }
      if (url.pathname === '/api/comfy/router' || url.pathname === '/api/jobs') {
        const respond = (status, data) => {
          assert.equal(url.pathname, '/api/jobs', 'Router generation must use a durable server job')
          const id = jobs.start(async () => {
            if (holdJobs) await held
            if (status >= 400) throw Object.assign(new Error(data.error), { status, ...data })
            return data.files
          })
          return res.end(JSON.stringify({ id }))
        }
        assert.equal(fakeKey, 'mock-comfy-not-a-key')
        const model = routerModels.find((model) => model.model === body.model)
        assert(model)
        assert.match(body.idempotencyKey, /^[a-f0-9-]{36}$/)
        requests.push(body)
        if (body.input.prompt === 'Cancel format') holdJobs = cancelFormatRequests++ === 1
        if (body.input.prompt === 'Ambiguous failure') {
          if (failAmbiguous) {
            failAmbiguous = false
            return respond(503, { error: 'Mock ambiguous failure', retryable: true })
          }
          return respond(200, { files: [{ url: `/recovered-${body.idempotencyKey}.png`, kind: 'image' }] })
        }
        if (body.input.prompt === 'Create failure' && failCreate) {
          failCreate = false
          return respond(402, { error: 'Mock Create credits', code: 'insufficient_credits', requestId: 'credits-request', idempotencyKey: body.idempotencyKey, retryable: false })
        }
        if (body.input.prompt === 'Library failure') {
          if (failedTakes++ < 2) {
            return respond(503, { error: 'Mock take failed', retryable: true })
          }
          return respond(200, { files: [{ url: `/take-${body.idempotencyKey}.png`, kind: 'image' }] })
        }
        if (partial) {
          if (!accepted.has(body.idempotencyKey)) accepted.set(body.idempotencyKey, [{ url: `/batch-${accepted.size + 1}.png`, kind: 'image' }])
          if (accepted.size === 2 && !failedSecond) {
            failedSecond = true
            return respond(503, { error: 'Mock lost response after accepting image two', code: 'provider_error', requestId: 'partial-request', idempotencyKey: body.idempotencyKey, retryable: true })
          }
          return respond(200, { files: accepted.get(body.idempotencyKey) })
        }
        return respond(200, { files: [{ url: '/mock-result.png', kind: model.kind }] })
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
      // Audio runs Router models through the provider panel on the Audio studio.
      const go = kind === 'audio' ? '.app-panel .btn-blue' : '.gen-go'
      await fill(kind === 'audio' ? '#provider-audio-prompt' : 'textarea[aria-label=Prompt]', prompt)
      await wait(`!document.querySelector('${go}').disabled`)
      const before = requests.length
      await evaluate(`document.querySelector('${go}').click()`)
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
    await evaluate(`document.querySelector('[aria-label="Add from Assets"]').click()`)
    await wait(`document.querySelectorAll('.gen-lib').length === 5`)
    await evaluate(`document.querySelectorAll('.gen-lib')[${i}].click()`)
    await wait(`document.querySelectorAll('.ref').length === ${i + 1}`)
    await evaluate(`document.querySelector('[aria-label="Add from Assets"]').click()`)
  }
  await evaluate(`document.querySelector('[aria-label="Add reference images"]').click()`)
  await wait('document.querySelector(".mp input[type=file]")')
  await evaluate(`(() => {
    const bytes = Uint8Array.from(atob(${JSON.stringify(reference.split(',')[1])}), (c) => c.charCodeAt(0))
    const data = new DataTransfer()
    data.items.add(new File([bytes], 'reference.png', { type: 'image/png' }))
    const input = document.querySelector('.mp input[type=file]')
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
  await evaluate(`document.querySelector('[aria-label="Add from Assets"]').click()`)
  await wait(`document.querySelectorAll('.gen-lib').length === 5`)
  assert.equal(await evaluate('[...document.querySelectorAll(".gen-lib")].filter((b) => b.getAttribute("aria-pressed") === "false").every((b) => b.disabled)'), true)
  await evaluate(`document.querySelector('[aria-label="Add from Assets"]').click()`)
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
  // A fresh document has no retry closures. It must restore the failed batch and its keys from storage.
  await goto('/router-fixture')
  await wait('!document.querySelector("#retry-first-failed").disabled')
  assert.equal(await evaluate('document.querySelector("#error").textContent'), '', 'Historical batch failures restore silently')
  assert.equal(requests.length - beforeBatch, 2, 'Reload never resubmits a failed batch until Retry')
  await screenshot('integration-batch-failure-after-reload')
  await evaluate('document.querySelector("#retry-first-failed").click(); document.querySelector("#retry-first-failed").click()')
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
  await screenshot('integration-batch-recovered')
  await goto('/router-fixture')
  await wait('JSON.parse(document.querySelector("#items").textContent).filter((item) => item.url).length === 3')
  partial = false
  holdJobs = true
  held = new Promise((resolve) => { releaseHeld = resolve })
  const beforeReload = requests.length
  await evaluate('document.querySelector("#batch").click()')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library")).some((i) => i.pending && i.jobs?.length)')
  const pendingId = await evaluate('JSON.parse(localStorage.getItem("comfyfield.library")).find((i) => i.pending).id')
  await goto('/router-fixture')
  await wait('JSON.parse(document.querySelector("#items").textContent).some((i) => i.pending)')
  assert.equal(requests.length - beforeReload, 1, 'Reload waits on the accepted job instead of resubmitting')
  await screenshot('integration-pending-after-reload')
  holdJobs = false
  releaseHeld()
  await wait('!JSON.parse(document.querySelector("#items").textContent).some((i) => i.pending)')
  assert.equal(requests.length - beforeReload, 3, 'Reload continues the remaining batch calls')
  assert.equal(await evaluate(`JSON.parse(document.querySelector('#items').textContent).filter((i) => i.id.startsWith(${JSON.stringify(pendingId)})).length`), 3)

  holdJobs = true
  held = new Promise((resolve) => { releaseHeld = resolve })
  const beforeCancel = requests.length
  await evaluate('document.querySelector("#batch").click()')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library")).some((i) => i.pending && i.jobs?.length)')
  await goto('/router-fixture')
  await wait('!document.querySelector("#cancel").disabled')
  await evaluate('document.querySelector("#cancel").click()')
  await wait('!JSON.parse(document.querySelector("#items").textContent).some((i) => i.pending)')
  for (const deadline = Date.now() + uiTimeout; !cancelledJobs.length && Date.now() < deadline;) await pause(100)
  assert.equal(cancelledJobs.length, 1)
  assert.equal(jobs.get(cancelledJobs[0]).status, 'cancelled')
  holdJobs = false
  releaseHeld()
  await pause(1000)
  assert.equal(requests.length - beforeCancel, 1, 'Cancel prevents the remaining batch calls')
  assert.equal(jobs.get(cancelledJobs[0]).files, undefined, 'Cancelled jobs discard late files')
  await screenshot('integration-cancelled-after-reload')
  assert.equal(jobRequests.length, requests.length, 'Every Router payload goes through the server job route')

  partial = false
  held = new Promise((resolve) => { releaseHeld = resolve })
  const beforeFormatCancel = requests.length
  await evaluate('document.querySelector("#cancel-format").click()')
  await wait('JSON.parse(document.querySelector("#items").textContent).some((i) => i.pending && i.run?.opts.prompt === "Cancel format" && i.jobs?.length) && JSON.parse(document.querySelector("#items").textContent).some((i) => i.url && i.run?.opts.prompt === "Cancel format")')
  const cancelFormatItems = await evaluate('JSON.parse(document.querySelector("#items").textContent).filter((i) => i.run?.opts.prompt === "Cancel format")')
  await evaluate('document.querySelector("#cancel").click()')
  await wait('JSON.parse(document.querySelector("#session").textContent)?.failed === 1 && !JSON.parse(document.querySelector("#session").textContent).busy')
  holdJobs = false
  releaseHeld()
  await evaluate('document.querySelector("#format-retry").click()')
  await wait('JSON.parse(document.querySelector("#session").textContent)?.failed === 0 && !JSON.parse(document.querySelector("#session").textContent).busy')
  const cancelCalls = requests.slice(beforeFormatCancel)
  assert.equal(cancelCalls.length, 3, 'Retry runs only the cancelled take')
  assert.deepEqual(cancelCalls[1], cancelCalls[2], 'Cancel Retry retains the same Router reconciliation key')
  assert(await evaluate(`JSON.parse(document.querySelector('#items').textContent).some((i) => i.id === ${JSON.stringify(cancelFormatItems.find((i) => i.url).id)})`), 'Cancel Retry keeps the successful take')

  await evaluate('document.querySelector("#ambiguous-failure").click()')
  await wait('JSON.parse(document.querySelector("#items").textContent).some((i) => i.failed === "Mock ambiguous failure")')
  const ambiguousKey = requests.at(-1).idempotencyKey
  holdJobs = true
  held = new Promise((resolve) => { releaseHeld = resolve })
  await evaluate('document.querySelector("#saturate").click()')
  await wait('JSON.parse(document.querySelector("#items").textContent).filter((i) => i.pending && i.jobs?.length).length === 3')
  await evaluate('document.querySelector("#retry-first-failed").click()')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library")).some((i) => i.pending && !i.jobs?.length && i.run?.opts.prompt === "Ambiguous failure")')
  const queuedRetry = await evaluate('JSON.parse(localStorage.getItem("comfyfield.library")).find((i) => i.pending && !i.jobs?.length && i.run?.opts.prompt === "Ambiguous failure")')
  assert.equal(queuedRetry.run.opts.routerBatch.calls[0].idempotencyKey, ambiguousKey)
  await goto('/router-fixture')
  holdJobs = false
  releaseHeld()
  await wait('!JSON.parse(document.querySelector("#items").textContent).some((i) => i.pending)')
  assert.deepEqual(requests.filter((r) => r.input.prompt === 'Ambiguous failure').map((r) => r.idempotencyKey), [ambiguousKey, ambiguousKey], 'Queued Retry survives reload with its original key')
  assert.equal(requests.filter((r) => r.input.prompt === 'Hold queue').length, 3, 'Reload reattaches the three occupied jobs without submitting replacements')
  assert(await evaluate(`JSON.parse(document.querySelector('#items').textContent).some((i) => i.id.startsWith(${JSON.stringify(queuedRetry.id)}) && i.url)`))

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
  await goto('/router-fixture')
  await wait('!document.querySelector("#retry-first-failed").disabled')
  assert.equal(await evaluate('document.querySelector("#error").textContent'), '', 'Saved failures do not show a live error on reload')
  assert.equal(await evaluate('document.querySelector("#retry").disabled'), true, 'Saved failures do not own the live banner Retry')
  await evaluate('document.querySelector("#retry-first-failed").click()')
  await wait('!JSON.parse(document.querySelector("#items").textContent).some((i) => i.pending) && document.querySelector("#error").textContent === ""')
  assert.notEqual(requests.at(-1).idempotencyKey, failedCreateKey, 'Provider forwards terminal status so Create rotates the key')
  assert.equal(requests.at(-1).input.prompt, 'Create failure', 'The preserved Retry belongs to Create')

  failedTakes = 0
  await evaluate('document.querySelector("#format-failure").click()')
  await wait('JSON.parse(document.querySelector("#session").textContent)?.failed === 2 && !JSON.parse(document.querySelector("#session").textContent).busy')
  const reloadTakes = await evaluate('JSON.parse(document.querySelector("#items").textContent).filter((i) => i.formatRunId === JSON.parse(document.querySelector("#session").textContent).id)')
  const beforeTakeRetry = requests.length
  await goto('/router-fixture')
  await wait('!document.querySelector("#retry-first-failed").disabled')
  assert.equal(await evaluate('document.querySelector("#error").textContent'), '', 'Historical format failures restore silently')
  assert(await evaluate('[...document.querySelectorAll(".result small")].some((el) => el.textContent.includes("Remaining steps will not continue"))'), 'Restored format items explain the memory-only session limit')
  assert(await evaluate('JSON.parse(document.querySelector("#items").textContent).filter((i) => i.formatRunId && !i.pending && !i.failed).every((i) => !i.restoreNote)'), 'Finished format outputs carry no reload note')
  await viewport(390)
  await goto('/image')
  await wait('[...document.querySelectorAll(".result small")].some((el) => el.textContent.includes("Remaining steps will not continue"))')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Restored format notes fit the phone layout')
  await screenshot('integration-format-restored-note-390')
  await viewport(1440)
  await goto('/router-fixture')
  await wait('!document.querySelector("#retry-first-failed").disabled')
  preflightConnected = false
  await evaluate('document.querySelector("#retry-first-failed").click()')
  await wait('document.querySelector("#error").textContent.includes("Connect comfyRouter")')
  assert.equal(requests.length, beforeTakeRetry, 'Reloaded format Retry checks requirements before spending')
  preflightConnected = true
  for (const failedCount of [1, 0]) {
    await evaluate('document.querySelector("#retry-first-failed").click()')
    await wait(`JSON.parse(document.querySelector('#items').textContent).filter((i) => i.failed).length === ${failedCount} && !JSON.parse(document.querySelector('#items').textContent).some((i) => i.pending)`)
  }
  assert.equal(requests.length, beforeTakeRetry + 2, 'Reloaded Retry runs only the two failed takes')
  assert(await evaluate(`JSON.parse(document.querySelector('#items').textContent).some((i) => i.id === ${JSON.stringify(reloadTakes.find((i) => i.url).id)})`), 'Reloaded Retry retains the successful format take')

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

  // A non-Router job lost on restart must explain the possible charge at both Retry entry points.
  const interrupted = { id: 'interrupted-run', pending: true, jobs: ['missing-non-router-job'], kind: 'image', model: 'Mock Google', from: '/image', run: { model: { provider: 'google', kind: 'image', name: 'Mock Google' }, opts: { prompt: 'Lost on restart' }, meta: {} } }
  await evaluate(`localStorage.setItem('comfyfield.library', JSON.stringify([${JSON.stringify(interrupted)}]))`)
  await goto('/router-fixture')
  await wait('document.querySelector(".result-fail button")?.textContent === "Retry (may charge again)"')
  assert.match(await evaluate('document.querySelector("#error").textContent'), /first run may already have been charged/)
  assert.match(await evaluate('document.querySelector(".result-fail").textContent'), /Retrying starts a new request/)
  await goto('/router-fixture')
  await wait('document.querySelector(".result-fail button")?.textContent === "Retry (may charge again)"')
  assert.equal(await evaluate('document.querySelector("#error").textContent'), '', 'Restart warning remains on the item without recreating the live banner')
  await viewport(390)
  await goto('/image')
  await wait('document.querySelector(".result-fail button")?.textContent === "Retry (may charge again)"')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'))
  await screenshot('integration-interrupted-charge-warning-390')
  assert.deepEqual(errors, [])
  console.log(`Router UI checks passed: fake key gating, ${routerModels.length} picker selections and mocked generations, independent native payloads, combined reference limits, durable jobs, partial batch recovery and pending resumption after reload, cancellation and cancelled-take Retry, queued Retry reload with stable keys, silent historical failures, restored format preflight and session-limit notes, interrupted-run charge warning and Retry copy, concurrent format shots, per-take Library failures and session retries, independent Create error ownership, shared-sheet writer recovery, desktop and 390px layouts. Mock screenshots saved.`)
} finally {
  await browser?.close()
  await server.close()
}
