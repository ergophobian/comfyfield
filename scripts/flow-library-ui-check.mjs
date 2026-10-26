import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { ffmpeg, findFfmpeg } from '../server/stitch.js'

// Flow outputs reach Library > Generations, tagged with the flow name, through the real server
// flow store and saveToLibrary. Only the provider call is a fake: no keys, no provider routes.
// Serves the production build, so run `npx vite build` first.
const root = fs.mkdtempSync(path.join(tmpdir(), 'comfyfield-flow-library-'))
process.env.COMFYFIELD_HOME = root
const core = await import('../server/core.js')
const { createFlows } = await import('../server/flows.js')
const { starters } = await import('../src/lib/flowStore.js')

const media = path.join(core.home(), 'media')
fs.mkdirSync(media, { recursive: true })
const covers = ['ad-variants', 'billboard', 'angles'].map((name) => path.join('public/art/covers', `${name}.webp`))
await ffmpeg(['-f', 'lavfi', '-i', 'testsrc2=s=320x180:r=24:d=0.5', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path.join(media, 'mock.mp4')], { binary: await findFfmpeg() })

const calls = []
const generate = async (options) => {
  calls.push(options)
  const n = calls.length
  if (options.model.includes('veo') || options.model.includes('ltx')) {
    fs.copyFileSync(path.join(media, 'mock.mp4'), path.join(media, `mock-${n}.mp4`))
    return [{ kind: 'video', url: `/media/mock-${n}.mp4` }]
  }
  fs.copyFileSync(covers[(n - 1) % covers.length], path.join(media, `mock-${n}.webp`))
  return [{ kind: 'image', url: `/media/mock-${n}.webp` }]
}
const imports = () => core.libraryImports()

// 1. The store alone: Approve, Send and Rerun keep their rules, and every model output is saved and tagged.
{
  const flows = createFlows({ directory: core.home, generate, writePrompt: async () => 'unused' })
  const starter = starters.find((s) => s.id === 'image-then-animate').make()
  const flow = flows.create({ name: 'Image then animate', nodes: starter.nodes, edges: starter.edges })
  const id = flow.id
  await flows.perform(id, 'runNew')
  assert.equal(calls.length, 3, 'Run makes the three image takes')
  assert.equal(flows.engine(id).gate('a').status, 'reviewing', 'The Approve gate waits')
  assert.equal(flows.engine(id).state.v, undefined, 'Nothing passes the gate before Send')
  assert.equal(imports().length, 3, 'Every image take is in the Library')
  assert.ok(imports().every((item) => item.flowName === 'Image then animate' && item.flowId === id && item.flowNode === 'i' && item.kind === 'image' && item.imported), 'Image takes are tagged with the flow')

  const picked = flows.engine(id).itemsOf(flows.get(id), 'i')[1]
  await flows.perform(id, 'togglePick', 'a', picked.id)
  await flows.perform(id, 'send', 'a')
  assert.equal(calls.length, 4, 'Send runs only the downstream video, once')
  assert.equal(calls[3].image, picked.url, 'The video starts from the approved take')
  const video = imports().find((item) => item.kind === 'video')
  assert.ok(video && video.flowName === 'Image then animate' && video.flowNode === 'v', 'The video is in the Library, tagged')

  const store = flows.read()
  flows.save({ ...store, flows: store.flows.map((f) => f.id === id ? { ...f, name: 'Lighthouse' } : f) })
  await flows.perform(id, 'rerun', 'v')
  assert.equal(calls.length, 5, 'Rerun repeats only its own node')
  assert.equal(calls.filter((c) => !c.model.includes('veo')).length, 3, 'Rerun never re-runs the image takes upstream')
  assert.equal(imports()[0].flowName, 'Lighthouse', 'A rerun is tagged with the current flow name')
  assert.equal(imports().length, 5, 'Earlier takes stay in the Library after a rerun')
  await flows.perform(id, 'runNew')
  assert.equal(calls.length, 5, 'Run fills gaps only')

  // A Library failure never fails the step.
  const failing = createFlows({ directory: core.home, generate, library: async () => { throw new Error('Disk full') } })
  const warn = console.warn
  console.warn = () => {}
  try {
    const other = failing.create({ name: 'Broken disk', nodes: [{ id: 'p', type: 'prompt', data: { text: 'A kite' } }, { id: 'm', type: 'model', data: { model: 'g-nano-banana-2' } }], edges: [{ source: 'p', target: 'm' }] })
    await failing.perform(other.id, 'runNew')
    assert.equal(failing.engine(other.id).state.m.items[0].status, 'done', 'The step keeps its file when the Library save fails')
  } finally { console.warn = warn }

  // A store on a scratch folder never writes the app's Library.
  const before = imports().length
  const scratch = createFlows({ directory: () => path.join(root, 'scratch'), generate })
  const loose = scratch.create({ name: 'Scratch', nodes: [{ id: 'p', type: 'prompt', data: { text: 'A kite' } }, { id: 'm', type: 'model', data: { model: 'g-nano-banana-2' } }], edges: [{ source: 'p', target: 'm' }] })
  await scratch.perform(loose.id, 'runNew')
  assert.equal(imports().length, before, 'Scratch stores do not save to the Library')
  fs.rmSync(path.join(core.home(), 'generation-imports.json'))
  fs.rmSync(path.join(core.home(), 'flows.json'))
  console.log('ok    flow store: outputs saved and tagged; Approve, Send, Rerun and Run rules unchanged')
}

// 2. The app: Run and Send on the Flows page, then Library > Generations shows the tagged takes.
calls.length = 0
const flows = createFlows({ directory: core.home, generate, writePrompt: async () => { throw new Error('No writer in this flow') } })
const starter = starters.find((s) => s.id === 'image-then-animate').make()
const made = flows.create({ name: 'Image then animate', nodes: starter.nodes, edges: starter.edges })
flows.save({ ...flows.read(), current: made.id })

const send = (res, data, status = 200) => { res.statusCode = status; res.end(JSON.stringify(data ?? null)) }
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'flow-library-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname.startsWith('/media/')) {
        const file = path.join(media, path.basename(url.pathname))
        if (!fs.existsSync(file)) { res.statusCode = 404; return res.end() }
        res.setHeader('Content-Type', file.endsWith('.webp') ? 'image/webp' : 'video/mp4')
        res.setHeader('Content-Length', fs.statSync(file).size)
        return fs.createReadStream(file).pipe(res)
      }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      try {
        if (url.pathname === '/api/agents/events') { res.setHeader('Content-Type', 'text/event-stream'); return res.write(': mock stream\n\n') }
        if (url.pathname === '/api/agents') return send(res, [])
        if (url.pathname === '/api/connections') return send(res, { fal: { connected: true }, google: { connected: true } })
        if (url.pathname === '/api/stitch/exports') return send(res, [])
        if (url.pathname === '/api/flows' && req.method === 'GET') return send(res, flows.read())
        if (url.pathname === '/api/library/generations' && req.method === 'GET') return send(res, core.libraryImports())
        let raw = ''
        for await (const chunk of req) raw += chunk
        const data = raw ? JSON.parse(raw) : {}
        if (url.pathname === '/api/library/generations' && req.method === 'DELETE') { core.dismissLibraryImport(data.id); return send(res, { ok: true }) }
        if (url.pathname === '/api/flows' && req.method === 'PUT') return send(res, flows.save(data))
        const action = /^\/api\/flows\/([\w-]+)\/action$/.exec(url.pathname)
        if (action) return send(res, await flows.perform(action[1], data.action, data.node, data.item))
        return send(res, { error: `No mock for ${url.pathname}` }, 404)
      } catch (e) { return send(res, { error: e.message }, e.status || 500) }
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const shots = 'outputs/flow-library-ui'
let browser
try {
  const errors = []
  browser = await startBrowser('flow-library-ui', { onEvent(message) {
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
  const screenshot = async (name) => {
    await evaluate(`(() => { let label = document.querySelector('[data-mock-evidence]'); if (!label) { label = document.createElement('p'); label.dataset.mockEvidence = 'true'; label.className = 'muted'; (document.querySelector('.page-head') || document.querySelector('main')).append(label) } label.textContent = 'Mock run: placeholder media from a fake provider; real flow store, Library save and UI'; window.scrollTo(0, 0) })()`)
    await pause(300)
    const shot = await cdp('Page.captureScreenshot', { format: 'png' })
    fs.mkdirSync(shots, { recursive: true })
    fs.writeFileSync(`${shots}/${name}.png`, Buffer.from(shot.data, 'base64'))
  }
  const goto = async (route) => {
    await cdp('Page.navigate', { url: `${origin}${route}` }, 60000)
    await wait('document.querySelector("main, .flows") && document.readyState === "complete"')
  }
  const approve = '.react-flow__node[data-id="a"]'
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })

  await goto('/flows')
  await wait(`document.querySelector('input[aria-label="Flow name"]')?.value === "Image then animate"`)
  await wait(`[...document.querySelectorAll('.ftool button')].some((b) => b.textContent === 'Run' && !b.disabled)`)
  await evaluate(`[...document.querySelectorAll('.ftool button')].find((b) => b.textContent === 'Run').click()`)
  await wait(`document.querySelectorAll('${approve} .fpick').length === 3`)
  assert.equal(calls.length, 3, 'Run stops at the Approve gate')
  await evaluate(`document.querySelectorAll('${approve} .fpick')[0].click()`)
  await wait(`document.querySelector('${approve} .fpick[aria-pressed=true]')`)
  await evaluate(`[...document.querySelectorAll('${approve} button')].find((b) => b.textContent === 'Send').click()`)
  await wait(`document.querySelector('.react-flow__node[data-id="v"] video')`)
  assert.equal(calls.length, 4, 'Send runs the video only')

  await goto('/assets')
  await wait(`document.querySelectorAll('.lib-card .lib-flow').length === 4`)
  const tags = await evaluate(`[...document.querySelectorAll('.lib-card .lib-flow')].map((tag) => tag.textContent)`)
  assert.ok(tags.every((tag) => tag === 'Flow · Image then animate'), `Library tags: ${tags}`)
  assert.equal(await evaluate(`document.querySelectorAll('.lib-card video').length`), 1, 'The animated clip is in the Library')
  await evaluate(`(() => { const field = document.querySelector('input[aria-label="Search generations"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, 'then animate'); field.dispatchEvent(new Event('input', { bubbles: true })) })()`)
  await wait(`document.querySelectorAll('.lib-card').length === 4`)
  await evaluate(`(() => { const field = document.querySelector('input[aria-label="Search generations"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, ''); field.dispatchEvent(new Event('input', { bubbles: true })) })()`)
  await screenshot('library-desktop')

  // After a reload the takes come back from the server, once each.
  await evaluate('localStorage.removeItem("comfyfield.library")')
  await goto('/assets')
  await wait(`document.querySelectorAll('.lib-card .lib-flow').length === 4`)

  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await goto('/assets')
  await wait(`document.querySelectorAll('.lib-card .lib-flow').length === 4`)
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Library fits 390px')
  await screenshot('library-mobile')
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('ok    Flows page Run and Send save four tagged takes to Library > Generations, at 1440px and 390px; no keys or paid calls')
} finally {
  await browser?.close()
  await server.close()
}
