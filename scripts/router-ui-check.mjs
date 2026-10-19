import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { models } from '../src/lib/catalog.js'
import { comfyRouterInput } from '../shared/mapping.js'

// Production bundle, fake saved connection, mock API only. No provider modules or keys load.
const routerModels = models.filter((model) => model.provider === 'comfyRouter')
const requests = []
let fakeKey = ''
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'router-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      const url = new URL(req.url, 'http://localhost')
      let body
      if (req.method === 'POST') {
        let raw = ''
        for await (const chunk of req) raw += chunk
        body = JSON.parse(raw)
      }
      if (url.pathname === '/api/connections') {
        if (body) { assert.equal(body.id, 'comfy'); fakeKey = body.values.key }
        return res.end(JSON.stringify({ comfy: { connected: Boolean(fakeKey) }, comfyRouter: { connected: Boolean(fakeKey) } }))
      }
      if (url.pathname === '/api/connections/test') return res.end('{"ok":true}')
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/comfy/router') {
        assert.equal(fakeKey, 'mock-comfy-not-a-key')
        const model = routerModels.find((model) => model.model === body.model)
        assert(model)
        requests.push(body)
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
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}`)
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
        await screenshot(`${kind}-picker-390`)
        await viewport(1440)
      }
      await evaluate(`[...document.querySelectorAll('.picker-pick')].find((button) => button.querySelector('.picker-name').textContent === ${JSON.stringify(model.name)}).click()`)
      await wait(`document.querySelector('.picker-btn').textContent.includes(${JSON.stringify(model.name)})`)
      const prompt = 'A quiet field at sunrise'
      await fill(kind === 'audio' ? '#script' : 'textarea[aria-label=Prompt]', prompt)
      await wait('!document.querySelector(".gen-go").disabled')
      const before = requests.length
      await evaluate('document.querySelector(".gen-go").click()')
      for (const deadline = Date.now() + uiTimeout; requests.length === before && Date.now() < deadline;) await pause(100)
      assert.equal(requests.length, before + 1)
      const payload = requests.at(-1)
      assert.equal(payload.model, model.model)
      assert.deepEqual(payload.input, comfyRouterInput(model.model, { prompt, aspect: kind === 'image' ? '1:1' : kind === 'video' ? '16:9' : '1:1', duration: 5, count: 1 }))
      await wait('!document.querySelector(".gen-feed .pending")')
    }
  }
  assert.deepEqual(errors, [])
  console.log(`Router UI checks passed: fake key gating, ${routerModels.length} picker selections and mocked generations, desktop and 390px layouts. Six mock screenshots saved.`)
} finally {
  await browser?.close()
  await server.close()
}
