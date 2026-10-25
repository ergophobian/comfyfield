import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'
import { schemas } from '../src/lib/formats/schemas.js'
import { formats, formatsForJob } from '../src/lib/formats/index.js'

// Serves the production build with an in-process mock API: no provider route or key loads, no paid run.
const requests = []
const jobs = new Map()
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><rect width="600" height="750" fill="#e4e9ff"/><text x="300" y="380" text-anchor="middle" font-size="40">Mock</text></svg>'
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'picker-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname.startsWith('/mock-')) { res.setHeader('Content-Type', 'image/svg+xml'); return res.end(svg) }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/connections') return res.end(JSON.stringify({ fal: { connected: true }, google: { connected: true } }))
      if (url.pathname.startsWith('/api/library') || url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/fal/schema') return res.end(JSON.stringify(schemas.fal[url.searchParams.get('id')] || { properties: { prompt: { type: 'string' } } }))
      if (url.pathname === '/api/comfy/requirements') {
        let body = ''
        for await (const chunk of req) body += chunk
        return res.end(JSON.stringify({
          connections: { fal: { connected: true }, google: { connected: true }, comfyRouter: { connected: true } }, cloudConnected: true, pod: { phase: 'none' },
          requirements: JSON.parse(body).workflows.map(({ workflow }) => ({ workflow, notOnCloud: [], minVramGb: 0, target: 'cloud', selectedWorkflow: workflow })),
        }))
      }
      if (url.pathname === '/api/upload') { req.resume(); return res.end(JSON.stringify({ url: '/mock-photo.svg' })) }
      if (url.pathname.startsWith('/api/jobs/')) return res.end(JSON.stringify(jobs.get(url.pathname.slice('/api/jobs/'.length))))
      if (req.method === 'POST') {
        let body = ''
        for await (const chunk of req) body += chunk
        const data = JSON.parse(body || '{}')
        if (url.pathname === '/api/jobs') {
          requests.push({ path: data.route, body: data.body })
          const id = `job-${jobs.size + 1}`
          jobs.set(id, { id, status: 'done', files: [{ url: '/mock-result.svg', kind: 'image' }] })
          return res.end(JSON.stringify({ id }))
        }
        requests.push({ path: url.pathname, body: data })
        return res.end(JSON.stringify({ files: [{ url: '/mock-result.svg', kind: 'image' }] }))
      }
      res.end('{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const shots = 'docs/screenshots/issue-27-stacked-picker'
let browser
try {
  const errors = []
  browser = await startBrowser('picker-ui', { onEvent(msg) {
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
  const goto = async (path) => { await cdp('Page.navigate', { url: `${origin}${path}` }); await wait('document.querySelector("main") && document.readyState === "complete"') }
  const screenshot = async (name) => {
    await pause(400)
    const data = await cdp('Page.captureScreenshot', { format: 'png' })
    if (process.env.PICKER_SHOTS) {
      mkdirSync(shots, { recursive: true })
      writeFileSync(`${shots}/${name}.png`, Buffer.from(data.data, 'base64'))
    }
  }
  const key = async (k) => {
    const codes = { ArrowDown: 40, ArrowUp: 38, ArrowRight: 39, ArrowLeft: 37, Enter: 13, Escape: 27 }
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k, windowsVirtualKeyCode: codes[k], ...(k === 'Enter' && { text: '\r' }) })
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k, windowsVirtualKeyCode: codes[k] })
  }
  const type = (text) => cdp('Input.insertText', { text })
  const pop = 'document.querySelector(".fpk-pop[role=dialog]")'
  const head = 'document.querySelector(".fpk-level .picker-head")?.textContent'
  const active = 'document.querySelector(".fpk-row.active .picker-name")?.firstChild?.textContent'

  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await goto('/image')
  await wait('document.querySelector(".fpk > button")')

  // Level one: the jobs that have image formats, keyboard first.
  await evaluate('document.querySelector(".fpk > button").click()')
  await wait(`${pop} && document.activeElement?.getAttribute("aria-label") === "Search formats"`)
  const imageJobs = [...new Set(formats.filter((f) => f.kind === 'image').map((f) => f.job))]
  assert.equal(await evaluate('document.querySelectorAll(".fpk-row").length'), imageJobs.length)
  assert.equal(await evaluate(head), 'Pick a job')
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".fpk-level")).animationName'), 'rise', 'Levels rise in')
  await key('ArrowDown')
  await key('ArrowDown')
  const thirdJob = await evaluate(active)
  await key('Enter')
  await wait(`${head} === ${JSON.stringify(thirdJob)}`)
  assert.equal(await evaluate('document.querySelector(".fpk-level").classList.contains("in")'), true)
  await key('ArrowLeft')
  await wait(`${head} === "Pick a job"`)
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".fpk-level")).animationName'), 'pop', 'Going back uses pop')
  assert.equal(await evaluate(active), thirdJob, 'Back lands on the job it came from')
  await screenshot('picker-jobs-desktop')

  // Level two and See all.
  await evaluate('[...document.querySelectorAll(".fpk-row")].find((r) => r.textContent.startsWith("Edit")).click()')
  await wait(`${head} === "Edit"`)
  const edit = formatsForJob('edit').filter((f) => f.kind === 'image')
  if (edit.length > 8) {
    assert.equal(await evaluate('document.querySelectorAll(".fpk-row").length'), 9, 'Eight formats, then See all')
    await key('End')
    await key('Enter')
    await wait(`document.querySelectorAll(".fpk-row").length === ${edit.length}`)
  }
  await screenshot('picker-formats-desktop')

  // Type to search, then level three: Relight's lighting variants.
  await type('relight')
  await wait('document.querySelector(".fpk-level .picker-head")?.textContent.endsWith("formats") || document.querySelector(".fpk-level .picker-head")?.textContent.endsWith("format")')
  const hits = await evaluate('[...document.querySelectorAll(".fpk-row .picker-name")].map((n) => n.firstChild.textContent)')
  const at = hits.indexOf('Relight')
  assert(at >= 0, `Search finds Relight: ${hits}`)
  for (let i = 0; i < at; i++) await key('ArrowDown')
  await key('Enter')
  await wait(`${head} === "Lighting"`)
  await screenshot('picker-variants-desktop')
  await key('ArrowDown')
  await key('Enter')
  await wait(`!${pop}`)
  assert.equal(await evaluate('document.querySelector(".fpk .fpk-label").textContent'), 'Relight · Studio softbox')

  // The format's inputs are in the composer, not a side sheet.
  assert(await evaluate('Boolean(document.querySelector(".gen-bar .fc .drop"))'), 'Photo input sits in the composer')
  assert.equal(await evaluate('document.querySelectorAll(".scrim, .sheet").length'), 0, 'No side sheet')
  assert.equal(await evaluate('document.querySelector("textarea[aria-label=Prompt]")'), null, 'The prompt bar gives way to the format inputs')
  assert(await evaluate('document.querySelector(".fc-go .gen-go").disabled'), 'Generate waits for the photo')
  await evaluate(`(() => { const input = document.querySelector('.gen-bar input[type=file]'); const data = new DataTransfer(); data.items.add(new File(['mock'], 'sample.png', {type:'image/png'})); input.files = data.files; input.dispatchEvent(new Event('change', {bubbles:true})); })()`)
  await wait('!document.querySelector(".fc-go .gen-go").disabled')
  await screenshot('composer-format-desktop')
  await evaluate('document.querySelector(".fc-go .gen-go").click()')
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]")[0]?.formatId === "relight"')
  assert.equal(requests[0].body.model, 'fal-ai/nano-banana-2/edit')
  assert.match(requests[0].body.input.prompt, /studio softbox/)

  // Escape walks back one level at a time, then closes.
  await evaluate('document.querySelector(".fpk > button").click()')
  await wait(`${head} === "Edit"`)
  await key('Escape')
  await wait(`${head} === "Pick a job"`)
  await key('Escape')
  await wait(`!${pop}`)
  await evaluate('document.querySelector(".fpk-clear").click()')
  await wait('document.querySelector("textarea[aria-label=Prompt]")')

  // Opening a format from another page lands in that medium's composer.
  const card = formatsForJob('edit').slice(0, 12).find((f) => !f.hub && f.category !== 'camera' && f.kind === 'image')
  await goto('/')
  await wait('document.querySelector("#ex-job-edit")')
  await evaluate('document.querySelector("#ex-job-edit").click()')
  await evaluate(`[...document.querySelectorAll("#ex-jobs-formats .format-card")].find((c) => c.querySelector("strong").textContent === ${JSON.stringify(card.name)}).click()`)
  await wait(`location.pathname === "/image" && document.querySelector(".fpk .fpk-label")?.textContent.startsWith(${JSON.stringify(card.name)})`)
  assert.equal(await evaluate('document.querySelectorAll(".scrim, .sheet").length'), 0)

  // Video and audio composers carry the same picker.
  for (const kind of ['video', 'audio']) {
    await goto(`/${kind}`)
    await wait('document.querySelector(".fpk > button")')
    await evaluate('document.querySelector(".fpk > button").click()')
    await wait(pop)
    await key('Enter')
    await wait(`${head} !== "Pick a job"`)
    await key('Enter')
    await wait(`!${pop} || ${head}`)
    if (await evaluate(`Boolean(${pop})`)) await key('Enter')
    await wait('document.querySelector(".gen-panel .fc")')
  }

  // Reduced motion: no level animation. 390px: everything fits.
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await goto('/image')
  await wait('document.querySelector(".fpk > button")')
  await evaluate('document.querySelector(".fpk > button").click()')
  await wait(pop)
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".fpk-level")).animationName'), 'none', 'Reduced motion stops the level motion')
  assert(await evaluate(`(() => { const r = ${pop}.getBoundingClientRect(); return r.left >= 0 && r.right <= 390 && r.top >= 0 })()`), 'Picker fits 390px')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'))
  await screenshot('picker-jobs-390')
  await evaluate('[...document.querySelectorAll(".fpk-row")].find((r) => r.textContent.startsWith("Edit")).click()')
  await wait(`${head} === "Edit"`)
  await type('relight')
  await key('Enter')
  await wait(`${head} === "Lighting"`)
  await key('Enter')
  await wait('document.querySelector(".gen-bar .fc .drop")')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Format inputs fit 390px')
  await screenshot('composer-format-390')

  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('Picker UI checks ok: job, format and variant levels with arrows, Enter, Left, Escape and search; See all; rise and pop motion off under reduced motion; format inputs inside the image composer and a mocked run; openFormat lands in the composer; video and audio pickers; 390px. Mock API only.')
} finally {
  await browser?.close()
  await server.close()
}
