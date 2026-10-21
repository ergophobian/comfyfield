import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { cinemaPlan } from './fixtures/cinema-plan.mjs'
import { createFlows } from '../server/flows.js'
import { ffmpeg, findFfmpeg } from '../server/stitch.js'
import * as core from '../server/core.js'

// Real disk-backed Flows and local Stitch/export; only the writer and LTX runners are fakes.
// No provider routes, environment file, or keys are loaded by this server.
const root = fs.mkdtempSync(path.join(tmpdir(), 'comfyfield-cinema-ui-'))
process.env.COMFYFIELD_HOME = root
const media = path.join(core.home(), 'media')
fs.mkdirSync(media, { recursive: true })
const binary = await findFfmpeg()
await ffmpeg(['-f', 'lavfi', '-i', 'testsrc2=s=320x180:r=24:d=0.5', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path.join(media, 'mock.mp4')], { binary })
await ffmpeg(['-i', path.join(media, 'mock.mp4'), '-frames:v', '1', path.join(media, 'start.png')], { binary })
const calls = []
const assemblies = []
const exports = []
let plannerCalls = 0
let failPlan = false
let failRender = false
let failStitch = false
const flows = createFlows({ directory: core.home, generate: async (options) => {
  calls.push(options)
  if (failRender) { failRender = false; throw new Error('Mock shot failure; retry this shot') }
  const name = `mock-shot-${calls.length}.mp4`
  fs.copyFileSync(path.join(media, 'mock.mp4'), path.join(media, name))
  return [{ kind: 'video', url: `/media/${name}` }]
}, stitch: async (options) => {
  assemblies.push(options)
  if (failStitch) { failStitch = false; throw new Error('Mock Stitch failure; retry locally') }
  return core.stitch({ ...options, preview: true })
}, writePrompt: async () => { throw new Error('The scene Flow must not plan or render on Send') } })
const send = (res, data) => res.end(JSON.stringify(data))
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'cinema-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname.startsWith('/media/')) {
        const file = path.join(media, path.basename(url.pathname))
        res.setHeader('Content-Type', file.endsWith('.png') ? 'image/png' : 'video/mp4')
        res.setHeader('Content-Length', fs.statSync(file).size)
        return fs.createReadStream(file).pipe(res)
      }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      try {
        if (url.pathname === '/api/agents/events') {
          res.setHeader('Content-Type', 'text/event-stream')
          return res.write(': mock stream\n\n')
        }
        if (url.pathname === '/api/connections') return send(res, { comfy: { connected: true } })
        if (url.pathname === '/api/flows' && req.method === 'GET') return send(res, flows.read())
        if (url.pathname === '/api/stitch/exports') return send(res, core.stitchedExports())
        if (url.pathname === '/api/upload') { req.resume(); return send(res, { url: '/media/start.png' }) }
        let raw = ''
        for await (const chunk of req) raw += chunk
        const data = raw ? JSON.parse(raw) : {}
        if (url.pathname === '/api/flows' && req.method === 'PUT') return send(res, flows.save(data))
        const action = /^\/api\/flows\/([\w-]+)\/action$/.exec(url.pathname)
        if (action) return send(res, await flows.perform(action[1], data.action, data.node, data.item))
        if (url.pathname === '/api/prompt') {
          plannerCalls++
          assert.match(data.instructions, /3 to 6 shots/)
          return send(res, { text: failPlan ? '{"shots":[]}' : JSON.stringify(cinemaPlan) })
        }
        if (url.pathname === '/api/stitch/export') {
          const item = core.exportStitch(data.url)
          exports.push(item)
          return send(res, item)
        }
        return send(res, {})
      } catch (error) { res.statusCode = error.status || 500; send(res, { error: error.message }) }
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const network = global.fetch
global.fetch = (url, ...args) => {
  if (!String(url).startsWith(origin)) throw new Error(`Unexpected provider call in Cinema check: ${url}`)
  return network(url, ...args)
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let browser
try {
  const errors = []
  browser = await startBrowser('cinema-ui', { onEvent(message) {
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
  } })
  const cdp = browser.send
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const wait = async (expression) => {
    for (const deadline = Date.now() + Math.max(uiTimeout, 30000); Date.now() < deadline;) {
      if (await evaluate(`Boolean(${expression})`)) return
      await pause(100)
    }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${JSON.stringify(errors)}`)
  }
  const click = async (label) => {
    await wait(`[...document.querySelectorAll('button')].some((button) => button.textContent.trim() === ${JSON.stringify(label)} && !button.disabled)`)
    await evaluate(`[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === ${JSON.stringify(label)}).click()`)
  }
  const fill = async (label, value) => evaluate(`(() => {
    const field = document.querySelector('[aria-label=${JSON.stringify(label)}]')
    Object.getOwnPropertyDescriptor(field.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(field, ${JSON.stringify(value)})
    field.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  const screenshot = async (name) => {
    // Evidence is clearly labelled as synthetic footage without adding test copy to the product.
    await evaluate(`(() => { let label = document.querySelector('[data-mock-evidence]'); if (!label) { label = document.createElement('p'); label.dataset.mockEvidence = 'true'; (document.querySelector('.cs-main') || document.querySelector('main')).prepend(label) } label.textContent = 'Mock journey: synthetic shot footage and planner; real saved Flow, local Stitch and export'; window.scrollTo(0, 0) })()`)
    await pause(250)
    const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    fs.mkdirSync('research_notes/cinema', { recursive: true })
    fs.writeFileSync(`research_notes/cinema/${name}.png`, Buffer.from(shot.data, 'base64'))
  }
  const goto = async (route) => {
    await cdp('Page.navigate', { url: `${origin}${route}` })
    await wait('document.querySelector("main") && document.readyState === "complete"')
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: root })
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })

  for (const width of [1440, 390]) {
    const label = width === 1440 ? 'desktop' : 'mobile'
    const start = calls.length
    const startAssemblies = assemblies.length
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: width === 390 })
    await goto('/cinema')
    if (width === 390) {
      await click('Plan another scene')
      await click('Try the portal effect')
    }
    await wait('document.querySelector("textarea[aria-label=\"Cinematic idea\"]")')
    await fill('Cinematic idea', 'A portal materialises and folds a rainy street upward beside a courier in a silver raincoat.')
    failPlan = width === 1440
    await click('Plan shots')
    if (failPlan) {
      await wait('document.querySelector("[role=alert]")?.textContent.includes("3 to 6 shots")')
      assert.equal(calls.length, start)
      failPlan = false
      await click('Plan shots')
    }
    await wait('document.querySelectorAll(".cinema-plan .cinema-shot").length === 3')
    assert.equal(calls.length, start, 'Planning never renders')
    await fill('Shot 2 prompt', `Edited ${label}: the violet portal lifts bricks into a spiral around the courier`)
    assert(await evaluate('document.querySelector(".cinema-budget").textContent.includes("$0.24")'), 'Whole-scene estimate appears before Generate')
    await screenshot(`mock-plan-${label}`)
    assert(await evaluate(`document.documentElement.scrollWidth <= ${width}`), 'Plan fits the viewport')
    if (width === 390) {
      // Exercise the image sibling through the existing upload field as well as text-only shots.
      await evaluate(`(() => { const input = document.querySelector('.cinema-shot input[type=file]'); const files = new DataTransfer(); files.items.add(new File(['fixture'], 'start.png', {type:'image/png'})); input.files = files.files; input.dispatchEvent(new Event('change', {bubbles:true})) })()`)
      await wait('document.querySelector(".cinema-shot .drop img")?.complete')
    }
    failRender = width === 390
    await click('Generate scene')
    await wait('document.querySelectorAll(".cinema-scene .cinema-shot").length === 3 && !document.querySelector(".cinema-scene > button").disabled')
    const id = flows.read().current
    assert.equal(flows.get(id).nodes.filter((node) => node.type === 'model').length, 3)
    assert.equal(calls.length, start + 3)
    assert.match(calls[start + 1].prompt, new RegExp(`Edited ${label}`))
    assert(calls.slice(start).every((options) => options.model === 'comfy-ltx25'))
    if (width === 390) {
      assert.equal(calls[start].image, '/media/start.png')
      await wait('document.body.innerText.includes("Mock shot failure")')
      await evaluate('document.querySelectorAll(".cinema-actions .btn-soft")[0].click()')
    }
    await wait('document.querySelectorAll(".cinema-shot video").length === 3 && [...document.querySelectorAll(".cinema-actions .btn-blue")].every((button) => !button.disabled)')
    await screenshot(`mock-review-${label}`)
    for (let index = 1; index <= 3; index++) await click(`Approve and Send shot ${index}`)
    assert.equal(assemblies.length, startAssemblies, 'Per-shot Send does not silently stitch')
    failStitch = width === 390
    await click('Stitch scene')
    if (width === 390) {
      await wait('document.body.innerText.includes("Mock Stitch failure")')
      failStitch = false
      await click('Stitch scene')
    }
    await wait('document.querySelector(".stitch-preview")?.readyState >= 2')
    await wait('[...document.querySelectorAll("button")].some((button) => button.textContent === "Export to Library" && !button.disabled)')
    const before = calls.length
    await fill('Shot 2 prompt', `Replacement ${label}: a bright ocean swells through the portal`)
    await evaluate('document.querySelectorAll(".cinema-actions .btn-soft")[1].click()')
    await wait('document.querySelectorAll(".cinema-actions .btn-blue")[1] && !document.querySelectorAll(".cinema-actions .btn-blue")[1].disabled')
    assert.equal(calls.length, before + 1, 'Only the edited shot reruns')
    assert.match(calls.at(-1).prompt, /Replacement/)
    assert.equal(flows.engine(id).state['scene-stitch'].items[0].stale, true)
    assert(await evaluate('[...document.querySelectorAll("button")].find((button) => button.textContent === "Export to Library").disabled'))
    const count = assemblies.length
    await click('Approve and Send shot 2')
    assert.equal(assemblies.length, count, 'Replacement Send must preserve stale Stitch output')
    await screenshot(`mock-replace-${label}`)
    await click('Re-stitch')
    await wait('[...document.querySelectorAll("button")].some((button) => button.textContent === "Export to Library" && !button.disabled)')
    assert.equal(assemblies.length, count + 1)
    assert(assemblies.at(-1).clips[1].url.endsWith(`mock-shot-${calls.length}.mp4`), 'The replacement occupies its original slot')
    await click('Export to Library')
    await wait('document.querySelector("a[download]")')
    const exported = exports.at(-1)
    assert(fs.statSync(core.mediaPath(exported.url)).size > 0, 'Export is a real local video')
    await screenshot(`mock-export-${label}`)
    await evaluate('document.querySelector("a[download]").click()')
    for (let deadline = Date.now() + uiTimeout; Date.now() < deadline && !fs.existsSync(path.join(root, path.basename(exported.url)));) await pause(100)
    assert.deepEqual(fs.readFileSync(path.join(root, path.basename(exported.url))), fs.readFileSync(core.mediaPath(exported.url)), 'Download matches the exported video bytes')
    await goto('/cinema')
    await wait('document.querySelectorAll(".cinema-shot video").length === 3 && document.querySelector("a[download]")')
    assert.equal(calls.length, before + 1, 'Reload does not regenerate')
    await goto('/flows')
    await wait('document.querySelector("input[aria-label=\"Flow name\"]")?.value === "The folded alley"')
    assert.equal(createFlows({ directory: core.home }).get(id).id, id, 'An independent MCP store sees the Cinema Flow')
    await goto('/assets')
    await wait('document.querySelectorAll(".lib-card video").length > 0')
    assert(await evaluate(`JSON.parse(localStorage.getItem('comfyfield.library')).some((item) => item.url === ${JSON.stringify(exported.url)})`))
    assert(await evaluate(`document.documentElement.scrollWidth <= ${width}`), 'Library fits the viewport')
    await screenshot(`mock-library-${label}`)
  }
  assert.equal(plannerCalls, 3, 'Two successful plans and one validation failure')
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('Cinema browser journey ok at 1440px and 390px: plan, invalid plan, edit, Generate, t2v/i2v, per-shot Send, isolated replacement, explicit re-stitch, export, byte-verified download, Library, saved Flow reload and MCP visibility. Shot and Stitch retry paths checked. Ten labelled mock screenshots; no paid calls or keys.')
} finally {
  global.fetch = network
  await browser?.close()
  await server.close()
}
