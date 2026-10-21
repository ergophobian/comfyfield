import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'

// Upscale in Create video against a mock API: the switch, Advanced, and a take that goes on to SeedVR2.
// Run `npx vite build` first. No provider routes or keys load.
const model = 'bytedance/seedance-2.5/text-to-video'
const schema = { properties: { prompt: { type: 'string' }, duration: { enum: ['5', '10'], default: '5' }, resolution: { enum: ['480p', '720p', '1080p'], default: '720p' } } }
const requests = []
const jobs = new Map()
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'upscale-mock-api', configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      // Not a real video, so the page cannot measure it and falls back to the planned source.
      if (url.pathname.startsWith('/mock-')) { res.statusCode = 404; return res.end() }
      if (!url.pathname.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      if (url.pathname === '/api/stitch/exports') return res.end('[]')
      if (url.pathname === '/api/connections') return res.end(JSON.stringify({ fal: { connected: true } }))
      if (url.pathname === '/api/fal/schema') return res.end(JSON.stringify(schema))
      if (url.pathname.startsWith('/api/jobs/')) return res.end(JSON.stringify(jobs.get(url.pathname.slice('/api/jobs/'.length))))
      if (req.method === 'POST') {
        let body = ''
        for await (const chunk of req) body += chunk
        // Generations run as server jobs; record the route the job runs, as a direct call would show it.
        let path = url.pathname
        let data = JSON.parse(body)
        const job = path === '/api/jobs'
        if (job) ({ route: path, body: data } = data)
        requests.push({ path, body: data })
        const files = [{ url: path === '/api/comfy/run' ? '/mock-upscaled.mp4' : '/mock-take.mp4', kind: 'video' }]
        if (!job) return res.end(JSON.stringify({ files }))
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
const until = async (test, what) => {
  for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) { if (test()) return; await pause(100) }
  throw new Error(`Timed out: ${what}\n${JSON.stringify(requests)}`)
}
let browser
try {
  const errors = []
  browser = await startBrowser('upscale-ui', { onEvent(msg) {
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
  const hint = () => evaluate('document.querySelector(".gen-upscale .gen-hint").textContent')
  const screenshot = async (name) => {
    await evaluate('window.scrollTo(0, 0)')
    await pause(300)
    const data = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    mkdirSync('research_notes/format-runner', { recursive: true })
    writeFileSync(`research_notes/format-runner/${name}.png`, Buffer.from(data.data, 'base64'))
  }
  const generate = async (prompt) => {
    await evaluate(`(() => { const input = document.querySelector('textarea[aria-label=Prompt]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, ${JSON.stringify(prompt)}); input.dispatchEvent(new Event('input', {bubbles:true})); })()`)
    await wait('!document.querySelector(".gen-go").disabled')
    await evaluate('document.querySelector(".gen-go").click()')
  }
  await cdp('Runtime.enable')
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  // The app saves its own picker state on mount and can overwrite ours on a slow machine,
  // so the model is picked on a same-origin API page that runs no app code.
  await cdp('Page.navigate', { url: `${origin}/api/stitch/exports` })
  await wait('location.pathname === "/api/stitch/exports" && document.readyState === "complete"')
  await evaluate(`localStorage.clear(); localStorage.setItem('comfyfield.picker', JSON.stringify({ kind: 'video', chosen: { video: 'fal:${model}' } }))`)
  await cdp('Page.navigate', { url: `${origin}/video` })
  await wait('document.querySelector("textarea[aria-label=Prompt]") && document.querySelector(".gen-settings [title=Resolution]")')

  // Off, the Resolution chip sets the size. On, Upscale picks it: 720p made, 1080p delivered.
  await click('.gen-switch', 'Upscale')
  await wait('document.querySelector(".gen-upscale")')
  assert(!(await evaluate('Boolean(document.querySelector(".gen-settings [title=Resolution]"))')), 'Upscale owns the resolution while it is on')
  assert.equal(await hint(), 'Makes 720p, then SeedVR2 3B upscales it to 1080p on Comfy Cloud or a Pod. Advanced')
  await click('.gen-upscale .link-btn', 'Advanced')
  await wait('document.querySelector(".gen-upscale-more")')
  assert.deepEqual(await evaluate('[...document.querySelectorAll(".gen-upscale-more .pills")].map((p) => [...p.querySelectorAll("button")].map((b) => b.textContent + (b.disabled ? " (off)" : "")))'), [
    ['Auto', '480p', '720p', '1080p'],
    ['Auto', '1080p', '1440p', '4K'],
    ['SeedVR2 3B', 'SeedVR2 7B'],
  ])
  assert.deepEqual(await evaluate('[...document.querySelectorAll(".gen-upscale-more .pills")].slice(0, 2).map((p) => p.querySelector("button").title)'), ['Auto picks 720p', 'Auto picks 1080p'])
  await screenshot('mock-video-upscale-desktop')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 1100, deviceScaleFactor: 1, mobile: true })
  await screenshot('mock-video-upscale-mobile')
  assert(await evaluate('document.documentElement.scrollWidth <= 390'), 'Create video must fit 390px')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })

  // A source of 1080p makes 1080p no target; Auto then goes to 4K.
  await click('.gen-upscale-more .pills button', '1080p')
  assert.equal(await hint(), 'Makes 1080p, then SeedVR2 3B upscales it to 4K on Comfy Cloud or a Pod. Hide advanced')
  assert(await evaluate('[...document.querySelectorAll(".gen-upscale-more .pills")][1].querySelectorAll("button")[1].disabled'), 'a target at the source is off')
  assert.equal(await evaluate('[...document.querySelectorAll(".gen-upscale-more .pills")][1].querySelector("button").title'), 'Auto picks 4K')
  await click('.gen-upscale-more .pills button', 'Auto')

  // The take renders at the model's default 720p, then goes to SeedVR2 at 1080 / 720.
  await generate('A cyclist in a rainy night market')
  await until(() => requests.some((r) => r.path === '/api/comfy/run'), 'the upscale run')
  const [take, up] = requests
  assert.equal(take.path, '/api/fal')
  assert.equal(take.body.model, model)
  assert.equal(take.body.input.resolution, undefined, 'the default resolution is not sent')
  assert.equal(up.body.workflow, 'seedvr2_video')
  assert.deepEqual([up.body.vars.video, up.body.vars.upscale_factor, up.body.vars.duration, up.body.vars.start], ['/mock-take.mp4', 1.5, 6, 0])
  await wait('JSON.parse(localStorage.getItem("comfyfield.library") || "[]").length === 2')
  const library = await evaluate('JSON.parse(localStorage.getItem("comfyfield.library"))')
  assert.deepEqual(library.map((i) => [i.model, i.caption, i.upscaled ?? null]), [
    ['SeedVR2 3B', 'A cyclist in a rainy night market', '1080p'],
    ['Seedance 2.5', 'A cyclist in a rainy night market', null],
  ])

  // 4K and the 7B upscaler: the take renders at 1080p and is doubled. The choices stay after a reload.
  await click('.gen-upscale-more .pills button', '4K')
  await click('.gen-upscale-more .pills button', 'SeedVR2 7B')
  assert.equal(await hint(), 'Makes 1080p, then SeedVR2 7B upscales it to 4K on Comfy Cloud or a Pod. Hide advanced')
  await cdp('Page.reload')
  // The source size shows once the model's schema loads again, which can trail the panel on a slow machine.
  await wait('document.querySelector(".gen-upscale .gen-hint")?.textContent.startsWith("Makes ")')
  assert.equal(await hint(), 'Makes 1080p, then SeedVR2 7B upscales it to 4K on Comfy Cloud or a Pod. Advanced')
  await generate('A lighthouse in a storm')
  await until(() => requests.filter((r) => r.path === '/api/comfy/run').length === 2, 'the second upscale run')
  assert.equal(requests[2].body.input.resolution, '1080p')
  assert.deepEqual([requests[3].body.workflow, requests[3].body.vars.upscale_factor], ['seedvr2_video_7b', 2])

  // Off again, a take is not upscaled.
  await click('.gen-switch', 'Upscale')
  await wait('!document.querySelector(".gen-upscale") && document.querySelector(".gen-settings [title=Resolution]")')
  await generate('A fox in the snow')
  await until(() => requests.length === 5, 'the third take')
  await pause(500)
  assert.equal(requests.length, 5, 'no upscale run with Upscale off')
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('Upscale UI checks ok: auto source and target, Advanced picks, 390px layout, and takes that go on to SeedVR2 3B and 7B. Mocked runs only; two screenshots saved.')
} finally {
  await browser?.close()
  await server.close()
}
