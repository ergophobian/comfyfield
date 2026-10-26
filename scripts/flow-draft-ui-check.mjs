// Describe a flow in the browser: the draft shows as ghost nodes, Discard removes them, Accept makes them real.
// /api/flow-draft runs the real server parsing with a mock writer, so no key or network is used.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import net from 'node:net'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { startBrowser, chromeExecutable, uiTimeout } from './browser.mjs'
import api from '../server/plugin.js'
import { draftFlow } from '../server/core.js'

const dir = path.resolve('outputs/flow-draft-ui')
fs.mkdirSync(dir, { recursive: true })
process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.join(dir, 'storage-'))

// The mock writer answers with one connection the flow rules refuse (Prompt straight into Output).
const reply = JSON.stringify({
  name: 'Sneaker shots to video',
  nodes: [
    { id: 'p', type: 'prompt', data: { mode: 'rows', text: 'A red sneaker on wet asphalt at night\nThe same sneaker on a white plinth' } },
    { id: 'i', type: 'model', data: { model: 'comfy-flux', aspect: '4:5', takes: 3 } },
    { id: 'a', type: 'approve', data: {} },
    { id: 'v', type: 'model', data: { model: 'comfy-ltx', duration: 5, prompt: 'Slow orbit around the shoe' } },
    { id: 'o', type: 'output', data: {} },
  ],
  edges: [{ source: 'p', target: 'i' }, { source: 'i', target: 'a' }, { source: 'a', target: 'v' }, { source: 'v', target: 'o' }, { source: 'p', target: 'o' }],
})
const requests = []
const mock = {
  name: 'flow-draft-mock',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url !== '/api/flow-draft') return next()
      let body = ''
      for await (const chunk of req) body += chunk
      requests.push(JSON.parse(body))
      await new Promise((r) => setTimeout(r, 300))
      const draft = await draftFlow(JSON.parse(body), { write: async () => reply })
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ draft }))
    })
  },
}
// Vite reads port 0 as its default port, so ask the OS for a free one first.
const port = await new Promise((done) => { const s = net.createServer().listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => done(port)) }) })
const vite = await createServer({ configFile: false, envFile: false, cacheDir: 'node_modules/.cache/flow-draft-vite', plugins: [mock, react(), api()], server: { host: '127.0.0.1', port, strictPort: true, watch: { ignored: ['**/outputs/**'] } } })
await vite.listen()
const base = `http://127.0.0.1:${vite.httpServer.address().port}`
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const saved = async () => (await (await fetch(`${base}/api/flows`)).json()).flows[0]

let browser
let errors
try {
  errors = []
  browser = await startBrowser('flow-draft-ui', { executable: process.env.WIDGET_CHROME || chromeExecutable(), onEvent(data) {
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text)
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') errors.push(data.params.args.map((a) => a.value ?? a.description).join(' '))
  } })
  const cdp = browser.send
  const js = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception.description)
    return result.result.value
  }
  const wait = async (expression, timeout = uiTimeout) => {
    for (const deadline = Date.now() + timeout; Date.now() < deadline;) { if (await js(`Boolean(${expression})`)) return; await delay(100) }
    throw new Error(`Timed out: ${expression}`)
  }
  const button = (label, scope = 'document') => `[...${scope}.querySelectorAll('button')].find((b) => b.textContent === ${JSON.stringify(label)})`
  const shot = async (name) => fs.writeFileSync(path.join(dir, name), Buffer.from((await cdp('Page.captureScreenshot', { format: 'png' })).data, 'base64'))
  const describe = async (text, picture) => {
    await wait(button('Describe'))
    await js(`${button('Describe')}.click()`)
    await wait(`document.querySelector('#fdescribe-text')`)
    await js(`document.querySelector('#fdescribe-text').focus()`)
    await cdp('Input.insertText', { text })
    await wait(`!${button('Draft flow')}.disabled`)
    if (picture) { await delay(400); await shot(picture) }
    await js(`${button('Draft flow')}.click()`)
    await wait(`document.querySelectorAll('.react-flow__node.ghost').length === 5`)
    await wait(`document.querySelector('.fdraft')`)
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 860, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: `${base}/flows` })
  // The first load waits for Vite to bundle the app's dependencies.
  await wait(`document.querySelector('.fempty')`, uiTimeout * 6)

  // A draft arrives as ghost nodes and edges, with the refused connection reported.
  await describe('Two sneaker shots, I pick the best, then a short video', 'flow-draft-describe.png')
  assert.equal(requests[0].description, 'Two sneaker shots, I pick the best, then a short video')
  assert.equal(await js(`document.querySelectorAll('.react-flow__edge.ghost').length`), 4)
  assert.match(await js(`document.querySelector('.fdraft').textContent`), /Draft: Sneaker shots to video5 nodes, 4 connections1 thing left out/)
  await js(`document.querySelector('.fdraft details').open = true`)
  assert.match(await js(`document.querySelector('.fdraft li').textContent`), /Connection p to o: A Prompt node can only feed a Model or Writer node/)
  assert.ok(!(await js(`Boolean(document.querySelector('.fempty'))`)), 'the starter cards hide while a draft shows')
  assert.equal(await js(`getComputedStyle(document.querySelector('.react-flow__node.ghost')).pointerEvents`), 'none')
  assert.equal(await js(`getComputedStyle(document.querySelector('.react-flow__node.ghost .fnode')).borderTopStyle`), 'dashed')
  await delay(600)
  await shot('flow-draft-ghost.png')
  assert.equal((await saved()).nodes.length, 0, 'ghost nodes are never saved')

  // Discard removes the ghosts and leaves the flow empty.
  await js(`${button('Discard')}.click()`)
  await wait(`!document.querySelector('.react-flow__node.ghost') && !document.querySelector('.fdraft') && document.querySelector('.fempty')`)
  assert.equal((await saved()).nodes.length, 0)

  // Accept turns the draft into real, saved nodes and names the empty flow.
  await describe('Two sneaker shots, I pick the best, then a short video')
  await js(`${button('Accept')}.click()`)
  await wait(`!document.querySelector('.react-flow__node.ghost') && document.querySelectorAll('.react-flow__node').length === 5`)
  for (let i = 0; i < 40 && (await saved()).nodes.length !== 5; i++) await delay(100)
  const flow = await saved()
  assert.equal(flow.nodes.length, 5)
  assert.equal(flow.edges.length, 4)
  assert.equal(flow.name, 'Sneaker shots to video')
  assert.ok(flow.nodes.every((n) => !n.className && !('selectable' in n)), 'saved nodes are plain')
  assert.equal(flow.nodes.find((n) => n.type === 'model' && n.data.kind === 'image').data.model.id, 'comfy-flux')
  assert.ok(flow.edges.every((e) => !e.id.startsWith('ghost:')))
  await js(`document.querySelector('.react-flow__node[data-id^="model-"]').click()`)
  await wait(`document.querySelector('.fpanel')`)

  // 390px: a second draft lands beside the accepted nodes, and the draft bar fits the screen.
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await describe('Add a second variant')
  assert.equal(await js(`document.querySelectorAll('.react-flow__node:not(.ghost)').length`), 5)
  assert.ok(!(await js(`Boolean(document.querySelector('.fpanel'))`)), 'the node panel steps aside for the draft bar')
  const bar = await js(`(() => { const r = document.querySelector('.fdraft').getBoundingClientRect(); return { left: r.left, right: r.right, bottom: r.bottom } })()`)
  assert.ok(bar.left >= 0 && bar.right <= 390 && bar.bottom <= 844, `draft bar fits 390px: ${JSON.stringify(bar)}`)
  await delay(600)
  await shot('flow-draft-390.png')
  await js(`${button('Discard')}.click()`)
  await wait(`!document.querySelector('.react-flow__node.ghost')`)
  assert.equal((await saved()).nodes.length, 5)
  console.log('Flow draft browser checks passed: ghost nodes and edges, dropped reason, discard, accept saves real nodes, 390px')
} catch (error) {
  if (errors?.length) console.error(errors.join(String.fromCharCode(10)))
  const shot = await browser?.send('Page.captureScreenshot', { format: 'png' }, 3000).catch(() => null)
  if (shot) fs.writeFileSync(path.join(dir, 'failure.png'), Buffer.from(shot.data, 'base64'))
  throw error
} finally {
  await browser?.close()
  await vite.close()
}
