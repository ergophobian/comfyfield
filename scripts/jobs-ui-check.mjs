import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { jobRail, formatsForJob } from '../src/lib/formats/index.js'

// Serves the production build with a mock API that answers empty, so no provider route or key loads.
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'jobs-mock-api', configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (req.url.startsWith('/api/connections')) return res.end(JSON.stringify({ fal: { connected: true } }))
      res.end(req.url.startsWith('/api/library') || req.url.startsWith('/api/stitch') ? '[]' : '{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const shots = 'docs/screenshots/issue-26-formats-by-job'
let browser
try {
  const errors = []
  browser = await startBrowser('jobs-ui', { onEvent(msg) {
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
    throw new Error(`Timed out: ${expression}\n${JSON.stringify(errors)}`)
  }
  const screenshot = async (name) => {
    await evaluate('document.querySelector("#ex-jobs").scrollIntoView({ block: "start" })')
    await pause(300)
    const data = await cdp('Page.captureScreenshot', { format: 'png' })
    if (process.env.JOBS_SHOTS) {
      mkdirSync(shots, { recursive: true })
      writeFileSync(`${shots}/${name}.png`, Buffer.from(data.data, 'base64'))
    }
  }
  const press = async (key) => {
    const code = { ArrowRight: 39, ArrowLeft: 37 }[key]
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: code })
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code })
  }
  const tabs = 'document.querySelectorAll(".ex-jobs [role=tab]")'
  const cards = 'document.querySelectorAll("#ex-jobs-formats .format-card")'
  const rail = jobRail()

  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: `${origin}/` })
  await wait(`${tabs}.length`)

  // Jobs come first, in the fixed order, then the formats of the picked job.
  assert.deepEqual(await evaluate(`[...${tabs}].map((t) => t.firstChild.textContent)`), rail.map((j) => j.name))
  assert.equal(await evaluate('document.querySelector(".ex-jobs [aria-selected=true]").firstChild.textContent'), 'UGC')
  const first = formatsForJob(rail[0].id)
  assert.deepEqual(await evaluate(`[...${cards}].map((c) => c.querySelector("strong").textContent)`), first.slice(0, 12).map((f) => f.name))
  await screenshot('jobs-desktop')

  await evaluate(`${tabs}[0].focus()`)
  await press('ArrowRight')
  await wait('document.activeElement?.id === "ex-job-ads" && document.querySelector("#ex-job-ads").getAttribute("aria-selected") === "true"')
  const ads = formatsForJob('ads')
  assert.equal(await evaluate(`${cards}.length`), 12, 'A long job shows twelve formats first')
  assert.equal(await evaluate(`${cards}[0].querySelector("strong").textContent`), ads[0].name)
  await evaluate('[...document.querySelectorAll("section[aria-labelledby=ex-jobs] .link-btn")].find((b) => b.textContent.startsWith("See all")).click()')
  await wait(`${cards}.length === ${ads.length}`)
  assert.equal(await evaluate('document.querySelector("section[aria-labelledby=ex-jobs] .link-btn").getAttribute("aria-expanded")'), 'true')
  await press('ArrowLeft')
  await press('ArrowLeft')
  await wait(`document.activeElement?.id === "ex-job-${rail.at(-1).id}"`)
  assert.equal(await evaluate(`${cards}.length`), Math.min(12, formatsForJob(rail.at(-1).id).length), 'Switching jobs collapses See all again')

  await evaluate('document.querySelector("#ex-job-effects").click()')
  await wait(`${cards}.length === 12`)
  await screenshot('jobs-effects-desktop')

  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 2, mobile: true })
  await pause(300)
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Jobs must fit 390px')
  assert(await evaluate('(() => { const r = document.querySelector(".ex-jobs").getBoundingClientRect(); return r.height < 60 })()'), 'Jobs stay one scrolling row at 390px')
  await evaluate('document.querySelector("#ex-job-ugc").click()')
  await evaluate('document.querySelector("#ex-job-photo").click()')
  await wait('(() => { const box = document.querySelector(".ex-jobs").getBoundingClientRect(), on = document.querySelector("#ex-job-photo").getBoundingClientRect(); return on.left >= box.left - 1 && on.right <= box.right + 1 })()')
  await screenshot('jobs-390')
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log(`Jobs UI checks ok: ${rail.length} jobs in order, formats per job featured first, arrow keys, See all, 390px. Mock API only.`)
} finally {
  await browser?.close()
  await server.close()
}
