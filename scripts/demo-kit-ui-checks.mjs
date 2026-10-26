// Real stdio MCP + disk-backed flows/presence + production canvas. No provider routes or keys.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'
import { setTimeout as wait } from 'node:timers/promises'
import { demoAgent, demoPrompt } from './demo-agent.mjs'
import { seedDemo } from './demo-seed.mjs'
import { demoPlan } from './demo-plan.mjs'
import { main, execute } from './live-run.mjs'
import { createFlows } from '../server/flows.js'
import { createPresence } from '../server/presence.js'
import { startBrowser, uiTimeout } from './browser.mjs'

fs.mkdirSync('outputs', { recursive: true })
const root = fs.mkdtempSync(path.resolve('outputs/demo-check-'))
const home = path.join(root, 'recording')
const directory = () => path.join(home, '.comfyfield')
const forbidden = () => { throw new Error('Provider access forbidden in demo checks') }
const originalFetch = globalThis.fetch
const originalRead = fs.readFileSync
globalThis.fetch = forbidden
fs.readFileSync = function (file, ...args) {
  if (/(^|[/\\])(keys\.json|\.env(?:\..*)?)$/.test(String(file))) throw new Error('Key/env read forbidden in demo checks')
  return originalRead.call(this, file, ...args)
}
let browser
let server
let pending
const stops = []
const streams = new Set()
const changed = (event) => { for (const res of streams) res.write(`data: ${JSON.stringify(event)}\n\n`) }
const flows = createFlows({ directory, generate: forbidden, changed })
const presence = createPresence({ directory, changed })
const flow = flows.create({ name: 'Recording · real MCP edit', nodes: [
  { id: 'prompt', type: 'prompt', position: { x: 0, y: 0 }, data: { text: 'Before the agent edit' } },
  { id: 'image', type: 'model', position: { x: 340, y: 0 }, data: { model: 'comfy-flux' } },
], edges: [{ source: 'prompt', target: 'image' }] })
const evaluate = async (expression) => {
  const result = await browser.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const until = async (expression) => {
  for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) {
    if (await evaluate(expression)) return
    await wait(100)
  }
  throw new Error(`Canvas did not show: ${expression}`)
}
try {
  const file = path.join(root, 'ledger.jsonl')
  fs.writeFileSync(file, '')
  await execute('cloud', { dry: true, file, core: { readKeys: forbidden }, print: () => {} })
  const log = console.log
  try { console.log = () => {}; await main(['cloud', '--dry-run']) } finally { console.log = log }
  console.log('ok    cloud dry-run reads no keys, env file or provider configuration')
  const plan = demoPlan()
  assert.equal(plan.cinemaJobs.length, 4)
  assert(plan.cinemaJobs.every((job) => job.vars.width === 1280 && job.vars.height === 704 && job.vars.frames === 121))
  assert.equal(plan.second.input.width, 1024)
  assert.equal(plan.second.input.height, 1024)
  assert(Math.abs(plan.totalCinemaEstimate - (0.32 + 0.266 / 211 * 24)) < 1e-9)
  console.log('ok    recording plan uses exact Cinema dimensions, four takes and the mapped image edit')

  // Test-only bytes: these are never recording media or claimed as a provider result.
  fs.writeFileSync(path.join(root, 'fixture.png'), 'Fixture bytes, not a generated image')
  const manifest = path.join(root, 'media.json')
  fs.writeFileSync(manifest, JSON.stringify({ items: [{ file: 'fixture.png', label: 'Test source only', source: 'source-photo', model: 'Test fixture' }] }))
  const seeded = await seedDemo({ manifest, home })
  const repeated = await seedDemo({ manifest, home })
  assert.equal(seeded[0].id, repeated[0].id)
  assert.match(seeded[0].caption, /^Source photo · imported/)
  assert.equal(seeded[0].demoSource.sha256.length, 64)
  assert.equal(flows.read().flows.length, 1)
  fs.writeFileSync(manifest, JSON.stringify({ items: [{ file: 'fixture.png', label: 'Missing evidence', source: 'pre-generated', model: 'Test' }] }))
  await assert.rejects(seedDemo({ manifest, home }), /providerJobId/)
  console.log('ok    local Library imports have visible provenance, byte hashes and repeat-safe ids; missing evidence is refused')

  stops.push(flows.watch(), presence.watch())
  server = await preview({ configFile: false, envFile: false, plugins: [{
    name: 'demo-offline-api', configurePreviewServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()
        res.setHeader('Content-Type', 'application/json')
        const send = (data) => res.end(JSON.stringify(data))
        if (url.pathname === '/api/agents/events') {
          res.setHeader('Content-Type', 'text/event-stream')
          res.write(': local check\n\n')
          streams.add(res)
          req.on('close', () => streams.delete(res))
          return
        }
        if (url.pathname === '/api/agents/presence') return send(presence.list())
        if (['/api/agents', '/api/agents/setup', '/api/library/generations', '/api/stitch/exports'].includes(url.pathname)) return send([])
        if (url.pathname === '/api/flows') {
          if (req.method === 'GET') return send(flows.read())
          let raw = ''
          for await (const chunk of req) raw += chunk
          try { return send(flows.save(JSON.parse(raw))) } catch (error) { res.statusCode = error.status || 500; return send({ error: error.message }) }
        }
        if (req.method === 'GET') return send({})
        res.statusCode = 403
        req.resume()
        send({ error: 'No generations in offline recording check' })
      })
    },
  }], preview: { host: '127.0.0.1', port: 0 } })
  // Browser discovery uses localhost HTTP; Node provider access remains forbidden above.
  globalThis.fetch = (url, ...args) => {
    if (!['127.0.0.1', 'localhost'].includes(new URL(url).hostname)) return forbidden()
    return originalFetch(url, ...args)
  }
  const errors = []
  browser = await startBrowser('demo-mcp', { onEvent: (event) => { if (event.method === 'Runtime.exceptionThrown') errors.push(event.params.exceptionDetails) } })
  await browser.send('Runtime.enable')
  await browser.send('Page.enable')
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
  await browser.send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/flows` })
  await until(`document.querySelector('.react-flow__node[data-id="prompt"]')?.textContent.includes('Before the agent edit')`)
  pending = demoAgent({ home, flowId: flow.id, delay: 500, hold: 6000, print: () => {} })
  await until(`document.querySelector('.react-flow__node[data-id="prompt"]')?.textContent.includes(${JSON.stringify(demoPrompt)})`)
  await until(`!!document.querySelector('[aria-label="Demo agent cursor"]') && [...document.querySelectorAll('.agent-node-badge')].some((node) => node.textContent === 'Demo agent is working on this')`)
  const agents = presence.list().agents
  assert.equal(agents[0].nodeId, 'prompt')
  assert.equal(agents[0].flowId, flow.id)
  assert(agents[0].until > Date.now())
  fs.mkdirSync('research_notes/demo', { recursive: true })
  const shot = await browser.send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('research_notes/demo/offline-real-mcp-cursor.png', Buffer.from(shot.data, 'base64'))
  const readback = await pending
  assert.equal(readback.flow.nodes[0].data.text, demoPrompt)
  await until(`!document.querySelector('[aria-label="Demo agent cursor"]')`)
  assert.equal(presence.list().agents.length, 0)
  assert.deepEqual(errors, [])
  console.log('ok    real stdio MCP edits a node; production canvas refreshes and shows cursor/badge; session exits cleanly; screenshot is offline evidence only')
} finally {
  await pending?.catch(() => {})
  for (const stop of stops) stop()
  await browser?.close()
  for (const res of streams) res.end()
  await server?.close()
  globalThis.fetch = originalFetch
  fs.readFileSync = originalRead
}
