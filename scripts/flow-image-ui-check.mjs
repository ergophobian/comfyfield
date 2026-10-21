import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { startBrowser, chromeExecutable, uiTimeout } from './browser.mjs'
import api from '../server/plugin.js'

const dir = path.resolve('outputs/flow-image-ui')
fs.mkdirSync(dir, { recursive: true })
process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.join(dir, 'storage-'))
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
const legacy = `data:image/png;base64,${png.toString('base64')}`
const picked = path.join(dir, 'picked.png')
fs.writeFileSync(picked, png)

// /api/upload is mocked: it records each request, can fail on demand and answers slowly so the uploading state shows.
const uploads = []
let failNext = false
const mock = {
  name: 'flow-image-mock',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url.startsWith('/mock-media/')) { res.setHeader('Content-Type', 'image/png'); return res.end(png) }
      if (req.url !== '/api/upload') return next()
      let size = 0
      for await (const chunk of req) size += chunk.length
      uploads.push({ type: req.headers['content-type'], size })
      await new Promise((r) => setTimeout(r, 500))
      res.setHeader('Content-Type', 'application/json')
      if (failNext) { failNext = false; res.statusCode = 500; return res.end(JSON.stringify({ error: 'Disk full.' })) }
      res.end(JSON.stringify({ url: `/mock-media/${uploads.length}.png`, type: 'image/png' }))
    })
  },
}
const vite = await createServer({ configFile: false, envFile: false, cacheDir: 'node_modules/.cache/flow-image-vite', plugins: [mock, react(), api()], server: { host: '127.0.0.1', port: 0, strictPort: true, watch: { ignored: ['**/outputs/**'] } } })
await vite.listen()
const base = `http://127.0.0.1:${vite.httpServer.address().port}`
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const stored = async () => (await (await fetch(`${base}/api/flows`)).json()).flows[0].nodes

// Seed a flow saved before this change: one image node holds a data URL, the other is empty.
const node = (id, x, data) => ({ id, type: 'image', position: { x, y: 40 }, data })
const seed = await fetch(`${base}/api/flows`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: 0, current: 'legacy', flows: [{ id: 'legacy', name: 'Legacy flow', updated: 1, edges: [], nodes: [node('image-old', 0, { url: legacy, name: 'old.png' }), node('image-new', 320, { url: null, name: '' })] }] }) })
assert.equal(seed.status, 200)

let browser
try {
  browser = await startBrowser('flow-image-ui', { executable: process.env.WIDGET_CHROME || chromeExecutable() })
  const cdp = browser.send
  const js = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception.description)
    return result.result.value
  }
  const wait = async (expression) => {
    for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) { if (await js(`Boolean(${expression})`)) return; await delay(100) }
    throw new Error(`Timed out: ${expression}`)
  }
  const nodeSel = (id) => `.react-flow__node[data-id="${id}"]`
  const pick = async (id) => {
    const { root } = await cdp('DOM.getDocument')
    const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: `${nodeSel(id)} input[type=file]` })
    await cdp('DOM.setFileInputFiles', { nodeId, files: [picked] })
  }
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 860, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: `${base}/flows` })

  // The legacy data URL renders, then moves to /media through a JSON upload.
  await wait(`document.querySelector('${nodeSel('image-old')} img')`)
  await wait(`document.querySelector('${nodeSel('image-old')} img')?.getAttribute('src').startsWith('/mock-media/')`)
  assert.equal(uploads[0].type, 'application/json')
  for (let i = 0; i < 40 && (await stored())[0].data.url.startsWith('data:'); i++) await delay(100)
  assert.match((await stored())[0].data.url, /^\/mock-media\//, 'migrated URL is saved')

  // A failed upload shows a clear message and keeps the node empty.
  failNext = true
  await pick('image-new')
  await wait(`document.querySelector('${nodeSel('image-new')} [aria-busy=true]')?.textContent==='Uploading…'`)
  await wait(`document.querySelector('${nodeSel('image-new')} [role=alert]')?.textContent==='Upload failed. Disk full.'`)
  assert.equal((await stored())[1].data.url, null)

  // A picked file uploads as raw bytes and the node stores the returned URL.
  await pick('image-new')
  await wait(`document.querySelector('${nodeSel('image-new')} [aria-busy=true]')`)
  await wait(`document.querySelector('${nodeSel('image-new')} img')?.getAttribute('src').startsWith('/mock-media/')`)
  assert.ok(!(await js(`Boolean(document.querySelector('${nodeSel('image-new')} [role=alert]'))`)), 'success clears the error')
  assert.equal(uploads.at(-1).type, 'image/png')
  assert.equal(uploads.at(-1).size, png.length)
  for (let i = 0; i < 40 && !(await stored())[1].data.url; i++) await delay(100)

  // After a reload both nodes come back from the saved /media URLs.
  await cdp('Page.reload')
  await wait(`document.querySelectorAll('.react-flow__node[data-id^="image-"] img').length===2`)
  const srcs = await js(`[...document.querySelectorAll('.react-flow__node[data-id^="image-"] img')].map((i)=>i.getAttribute('src'))`)
  assert.ok(srcs.every((s) => s.startsWith('/mock-media/')), `saved URLs: ${srcs}`)
  assert.ok((await stored()).every((n) => !n.data.url.startsWith('data:')), 'no data URLs remain in the saved flow')
  const image = await cdp('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(path.join(dir, 'flow-image.png'), Buffer.from(image.data, 'base64'))
  console.log('Flow image browser checks passed: legacy data URL migrates, upload state, failure message, upload stores the URL, reload keeps it')
} catch (error) {
  const shot = await browser?.send('Page.captureScreenshot', { format: 'png' }, 3000).catch(() => null)
  if (shot) fs.writeFileSync(path.join(dir, 'failure.png'), Buffer.from(shot.data, 'base64'))
  throw error
} finally {
  await browser?.close()
  await vite.close()
}
