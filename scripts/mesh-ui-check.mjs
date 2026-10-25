// The Library's 3D viewer and the 3D format sheet in headless Chrome, on the production build with a mock
// API. The model is a potion bottle written by ComfyUI's own save_glb, so it has SaveGLB's layout.
// Screenshots go to research_notes/3d-viewer/. No provider calls.
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'

const glb = readFileSync('scripts/fixtures/potion-bottle.glb')
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'mesh-mock-api', configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname === '/media/potion-bottle.glb') {
        res.setHeader('Content-Type', 'model/gltf-binary')
        return res.end(glb)
      }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/connections') return res.end(JSON.stringify({ comfy: { connected: true } }))
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const item = { id: 'potion', kind: '3d', url: '/media/potion-bottle.glb', model: 'Photo to 3D model', caption: 'A glowing potion bottle with a cork and a gold band', created: 1 }
let browser
try {
  const errors = []
  // Chrome runs headless without a GPU, so WebGL draws on SwiftShader.
  browser = await startBrowser('mesh-ui', { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], onEvent(msg) {
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text)
  } })
  const cdp = browser.send
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const wait = async (expression, timeout = uiTimeout) => {
    for (const deadline = Date.now() + timeout; Date.now() < deadline;) { if (await evaluate(`Boolean(${expression})`)) return; await pause(100) }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${JSON.stringify(errors)}`)
  }
  const goto = async (path) => { await cdp('Page.navigate', { url: `${origin}${path}` }); await wait('document.querySelector("main") && document.readyState === "complete"') }
  const screenshot = async (name) => {
    await pause(300)
    const data = await cdp('Page.captureScreenshot', { format: 'png' })
    mkdirSync('research_notes/3d-viewer', { recursive: true })
    writeFileSync(`research_notes/3d-viewer/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })

  // The format sheet says the mesh is not rig-ready and offers the print pass.
  await goto('/apps/character-to-3d')
  await wait('document.querySelector(".sheet-limits")')
  assert.match(await evaluate('document.querySelector(".sheet-limits").innerText'), /Not rig-ready/)
  const sheet = await evaluate('document.querySelector(".app-panel").innerText')
  for (const text of ['Made for', 'Screens', '3D printing', 'A pose']) assert(sheet.includes(text), `the sheet shows ${text}`)
  await screenshot('character-to-3d-sheet')

  await goto('/library')
  await evaluate(`localStorage.setItem('comfyfield.library', ${JSON.stringify(JSON.stringify([item]))})`)
  await goto('/library')
  await wait('document.querySelector(".lib-card .model-view")')
  const webgl = await evaluate('Boolean(document.createElement("canvas").getContext("webgl2"))')
  const filters = await evaluate('[...document.querySelectorAll(".seg-sm [role=tab]")].map((b) => b.textContent)')
  assert(filters.includes('3D'), 'the Library filters 3D models')
  assert.equal(await evaluate('document.querySelector(".lib-card a[download]").getAttribute("download")'), 'potion.glb', 'a model downloads as .glb')
  if (webgl) {
    // The card shows a still of the model, not a broken image.
    await wait('document.querySelector(".lib-card .model-view > img")?.naturalWidth > 0')
    await screenshot('library-3d-card')
    await evaluate('document.querySelector(".lib-card").click()')
    await wait('document.querySelector(".viewer .model-view.full.ready canvas")')
    await wait('document.querySelector(".viewer-text span").innerText.includes("closed surface, ready to slice")')
    assert.match(await evaluate('document.querySelector(".viewer-text span").innerText'), /2,880 faces/)
    assert(await evaluate('Boolean(document.querySelector(".viewer [aria-label=\'Save as STL for 3D printing\']"))'), 'the viewer saves STL')
    // Drag to turn the model.
    const box = await evaluate('(() => { const r = document.querySelector(".viewer canvas").getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2] })()')
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: box[0], y: box[1], button: 'left', clickCount: 1 })
    await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box[0] + 120, y: box[1] + 30, button: 'left' })
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box[0] + 120, y: box[1] + 30, button: 'left' })
    await screenshot('library-3d-viewer')
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
    await pause(400)
    // The Library's own tab row already makes the page wider than 390px, so this measures against the viewer.
    const [view, card] = await evaluate('[".viewer .model-view", ".viewer-card"].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.right, r.width, r.height] })')
    assert(view[0] >= card[0] && view[1] <= card[1] && Math.abs(view[2] - view[3]) < 2, `the model fills the viewer card as a square at 390px: ${view} in ${card}`)
    await screenshot('library-3d-viewer-mobile')
  } else {
    await wait('document.querySelector(".lib-card .model-view.failed")')
    console.log('No WebGL 2 in this Chrome: checked the fallback only.')
  }
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log(`Mesh UI checks ok: not rig-ready note and print choice on the sheet, 3D filter, ${webgl ? 'card still, viewer with drag, closed surface note, STL action and 390px fit' : 'no-preview fallback'}. No provider calls.`)
} finally {
  await browser?.close()
  await server.close()
}
