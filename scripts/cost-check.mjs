import assert from 'node:assert/strict'
import fs from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { cloudSecondsTable } from './cloud-seconds.mjs'
import { cloudSeconds } from '../shared/cloudSeconds.js'
import { CLOUD_USD_PER_GPU_SEC } from '../shared/gpuTiers.js'
import { cloudWorkflowOf, estimate } from '../shared/mapping.js'
import { models } from '../src/lib/catalog.js'
import { upscalerModel } from '../src/lib/upscale.js'

// Estimates for Comfy Cloud and Router runs, and the session spend cap. Run `npx vite build` first.
// Mock API only: no provider route, key or paid run.
assert.deepEqual(cloudSeconds, cloudSecondsTable(), 'shared/cloudSeconds.js is out of date: run node scripts/cloud-seconds.mjs')

const byId = (id) => models.find((m) => m.id === id)
const near = (a, b) => Math.abs(a - b) < 1e-9
// Comfy Cloud: the graph's typical GPU seconds at the Cloud rate, scaled by length or count, always approximate.
const ltx = byId('comfy-ltx25')
assert.equal(cloudWorkflowOf(ltx), 'ltx25_t2v')
assert.equal(cloudWorkflowOf(ltx, { image: '/a.png' }), 'ltx25_i2v')
assert.equal(cloudWorkflowOf(byId('comfy-flux3-klein')), 'flux3_klein_t2i_cloud', 'Cloud runs the Instant alternate')
const clip = estimate(ltx, {}, { duration: 5 })
assert(near(clip.usd, cloudSeconds.ltx25_t2v * CLOUD_USD_PER_GPU_SEC) && clip.approx)
assert(near(estimate(ltx, {}, { duration: 10, takes: 2 }).usd, clip.usd * 4))
const flux = byId('comfy-flux')
assert(near(estimate(flux, {}, { count: 2 }).usd, 2 * cloudSeconds.image_flux * CLOUD_USD_PER_GPU_SEC))
assert.equal(estimate({ provider: 'comfy', workflow: 'no_such_graph', kind: 'image' }, {}, {}), null)
// Router: published units, and GPU-second Flux 2 from a typical run time.
const pro = estimate(byId('comfy-router-flux'), { price: byId('comfy-router-flux').price }, { count: 2 })
assert(near(pro.usd, 2 * 24 * 0.266 / 211) && pro.approx)
assert.deepEqual(estimate(byId('comfy-router-kontext'), { price: byId('comfy-router-kontext').price }, { count: 1 }), { usd: 0.04, approx: false })
// The Upscale run is a Comfy Cloud run too.
const up = estimate(upscalerModel('seedvr2-3b'), {}, { duration: 5 })
assert(near(up.usd, cloudSeconds.seedvr2_video * CLOUD_USD_PER_GPU_SEC))

// The spend cap, in Node with fake storage.
const store = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }
globalThis.localStorage = store()
globalThis.sessionStorage = store()
const cap = await import('../src/lib/spendCap.js')
const ask = async (answer) => {
  for (let i = 0; i < 50 && !cap.spendQuestion(); i++) await new Promise((r) => setTimeout(r, 5))
  const q = cap.spendQuestion()
  assert(q, 'a question is open')
  q.answer(answer)
  return q
}
assert.equal(await cap.checkSpend(0.5), true, 'no cap, no question')
assert.equal(cap.sessionSpend(), 0.5)
assert.equal(await cap.checkSpend(null), true, 'an unknown cost passes')
cap.setSpendCap(1)
assert.equal(cap.spendCap(), 1)
assert.equal(await cap.checkSpend(0.4), true, 'inside the cap')
// Three takes from one click ask once, for their total.
const takes = [cap.checkSpend(0.2), cap.checkSpend(0.2), cap.checkSpend(0.2)]
const q = await ask(false)
assert.deepEqual([q.runs, near(q.usd, 0.6), q.cap, near(q.spent, 0.9)], [3, true, 1, true])
assert.deepEqual(await Promise.all(takes), [false, false, false])
assert(near(cap.sessionSpend(), 0.9), 'cancelled runs are not counted')
const again = cap.checkSpend(0.3)
await ask(true)
assert.equal(await again, true)
assert(near(cap.sessionSpend(), 1.2))
cap.setSpendCap(0)
assert.equal(cap.spendCap(), null)

// The app against a mock API: the Create video estimate with Upscale, the cap in Connections, and the ask.
const requests = []
const jobs = new Map()
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'cost-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/connections' && req.method === 'GET') return res.end(JSON.stringify({ comfy: { connected: true }, comfyRouter: { connected: true } }))
      if (url.pathname === '/api/comfy/models') return res.end(JSON.stringify({ connected: true, models: [] }))
      if (url.pathname.startsWith('/api/jobs/')) return res.end(JSON.stringify(jobs.get(url.pathname.slice('/api/jobs/'.length))))
      if (req.method === 'POST' && ['/api/jobs', '/api/comfy/run'].includes(url.pathname)) {
        let body = ''
        for await (const chunk of req) body += chunk
        const data = JSON.parse(body)
        requests.push(data.route ? data.body : data)
        const files = [{ url: '/mock-take.mp4', kind: 'video' }]
        if (url.pathname !== '/api/jobs') return res.end(JSON.stringify({ files }))
        const id = `job-${jobs.size + 1}`
        jobs.set(id, { id, status: 'done', files })
        return res.end(JSON.stringify({ id }))
      }
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const shots = 'research_notes/issue-126-cost-cap'
let browser
try {
  const errors = []
  browser = await startBrowser('cost', { onEvent(msg) {
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
  const click = (selector, text) => evaluate(`[...document.querySelectorAll(${JSON.stringify(selector)})].find((b) => b.textContent.trim() === ${JSON.stringify(text)}).click()`)
  const type = (selector, value) => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })) })()`)
  const screenshot = async (name) => {
    await pause(400)
    const data = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    fs.mkdirSync(shots, { recursive: true })
    fs.writeFileSync(`${shots}/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: `${origin}/api/stitch/exports` })
  await wait('location.pathname === "/api/stitch/exports" && document.readyState === "complete"')
  await evaluate(`localStorage.clear(); localStorage.setItem('comfyfield.picker', JSON.stringify({ kind: 'video', chosen: { video: 'comfy-ltx25' } }))`)

  // Connections: set a $0.10 cap.
  await cdp('Page.navigate', { url: `${origin}/connections` })
  await wait('document.querySelector("#spend-cap")')
  assert.match(await evaluate('document.querySelector(".spend-cap .status").textContent'), /^Off$/)
  await type('#spend-cap', '0.10')
  await click('.spend-cap button', 'Save cap')
  await wait('document.querySelector(".spend-cap .status").textContent === "$0.10 per session"')
  assert.equal(await evaluate('localStorage.getItem("comfyfield.spendCap")'), '0.1')
  await evaluate('document.querySelector(".spend-cap").scrollIntoView({ block: "center" })')
  await screenshot('mock-connections-spend-cap')

  // Create video on LTX-2.5 (Comfy Cloud): an approximate estimate, and Upscale adds its own run.
  await cdp('Page.navigate', { url: `${origin}/video` })
  await wait('document.querySelector("textarea[aria-label=Prompt]")')
  await type('textarea[aria-label=Prompt]', 'A cyclist in a rainy night market')
  await wait('document.querySelector(".gen-sum")?.textContent.includes("≈")')
  const take = estimate(ltx, {}, { duration: 5 }).usd
  const sum = () => evaluate('document.querySelector(".gen-sum strong").parentElement.textContent')
  assert.match(await sum(), new RegExp(`1 video · ≈\\$${take.toFixed(2).replace('.', '\\.')}`))
  await click('.gen-switch', 'Upscale')
  await wait('document.querySelector(".gen-upscale")')
  const both = take + up.usd
  await wait(`document.querySelector(".gen-sum").textContent.includes("≈$${both.toFixed(2)}")`)

  // Generate would pass the cap, so it asks. Cancel starts nothing; Run anyway starts the take.
  await evaluate('document.querySelector(".gen-go").click()')
  await wait('document.querySelector(".spend-ask")')
  assert((await evaluate('document.querySelector(".spend-ask").textContent')).startsWith(`Run past your spend cap?This run costs about $${both.toFixed(2)}. Your cap for this session is $0.10.`))
  await screenshot('mock-spend-ask')
  await click('.spend-ask button', 'Cancel')
  await wait('!document.querySelector(".spend-ask")')
  await pause(500)
  assert.equal(requests.length, 0, 'a cancelled run sends nothing')
  await evaluate('document.querySelector(".gen-go").click()')
  await wait('document.querySelector(".spend-ask")')
  await click('.spend-ask button', 'Run anyway')
  await wait('!document.querySelector(".spend-ask")')
  for (const deadline = Date.now() + uiTimeout; Date.now() < deadline && !requests.length;) await pause(100)
  assert.equal(requests[0]?.workflow, 'ltx25_t2v', JSON.stringify(requests))
  // The Upscale run that follows was counted with its take, so it does not ask again.
  for (const deadline = Date.now() + uiTimeout; Date.now() < deadline && requests.length < 2;) await pause(100)
  assert.equal(requests[1]?.workflow, 'seedvr2_video', JSON.stringify(requests))
  assert(!(await evaluate('Boolean(document.querySelector(".spend-ask"))')))
  assert(Number(await evaluate('sessionStorage.getItem("comfyfield.sessionSpend")')) > 0.15, 'the take and its Upscale count toward the session')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1000, deviceScaleFactor: 1, mobile: true })
  await cdp('Page.navigate', { url: `${origin}/connections` })
  await wait('document.querySelector(".spend-cap .muted")?.textContent.startsWith("This session: about")')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Connections must fit 390px')
  assert.deepEqual(errors, [], 'no browser runtime exceptions')
  console.log('Cost checks ok: Cloud seconds table, Comfy Cloud and Router estimates, Upscale in the Create video estimate, spend cap batching, Connections cap, ask, Cancel and Run anyway, 390px. Mocked runs only; screenshots saved.')
} finally {
  await browser?.close()
  await server.close()
}
