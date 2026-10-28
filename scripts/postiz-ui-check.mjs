import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser, uiTimeout } from './browser.mjs'

let posted, added, noPostiz = false, items = [{ id: 'idea-1', channel: 'channel-1', idea: 'Mock finished story', status: 'made', libraryItem: '/media/mock.mp4' }]
const server = await preview({ configFile: false, envFile: false, plugins: [{ name: 'postiz-mock', configurePreviewServer(s) {
  s.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost')
    if (!url.pathname.startsWith('/api/')) return next()
    res.setHeader('Content-Type', 'application/json')
    if (url.pathname === '/api/postiz/channels' && noPostiz) {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Connect Postiz in Connections first.' }))
    }
    if (url.pathname === '/api/postiz/channels') return res.end(JSON.stringify([{ id: 'channel-1', name: 'Mock channel', identifier: 'bluesky' }]))
    if (url.pathname === '/api/postiz/schedule') {
      let raw = ''; for await (const chunk of req) raw += chunk
      posted = JSON.parse(raw)
      return res.end(JSON.stringify({ result: [{ postId: 'mock-post' }] }))
    }
    if (url.pathname === '/api/queue/idea-1') {
      let raw = ''; for await (const chunk of req) raw += chunk
      items[0] = { ...items[0], ...JSON.parse(raw) }
      return res.end(JSON.stringify(items[0]))
    }
    if (url.pathname === '/api/queue' && req.method === 'POST') {
      let raw = ''; for await (const chunk of req) raw += chunk
      added = { id: 'idea-2', status: 'idea', ...JSON.parse(raw) }
      items.push(added)
      return res.end(JSON.stringify(added))
    }
    if (url.pathname === '/api/queue') return res.end(JSON.stringify(items))
    if (url.pathname === '/api/library/generations') return res.end('[]')
    res.end('{}')
  })
} }], preview: { host: '127.0.0.1', port: 0 } })
let browser
try {
  browser = await startBrowser('postiz-ui')
  const evaluate = async (expression) => {
    const result = await browser.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const wait = async (expression) => {
    for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) {
      if (await evaluate(expression)) return
      await new Promise((r) => setTimeout(r, 100))
    }
    throw new Error(`Timed out ${expression}: ${await evaluate('document.body.innerText')}`)
  }
  await browser.send('Page.enable')
  await browser.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await browser.send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/library?tab=queue` })
  await wait('document.body.innerText.includes("Mock finished story")')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 390'), 'Queue fits 390px')
  await evaluate('[...document.querySelectorAll("button")].find(b => b.textContent === "Schedule").click()')
  await wait('document.querySelector("#schedule-channel option[value=channel-1]") !== null')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 390'), 'Schedule sheet fits 390px')
  mkdirSync('research_notes/postiz', { recursive: true })
  await evaluate('Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})))')
  await new Promise((r) => setTimeout(r, 100))
  const screenshot = await browser.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync('research_notes/postiz/mock-schedule-390.png', Buffer.from(screenshot.data, 'base64'))
  await evaluate('[...document.querySelectorAll("button")].find(b => b.textContent === "Save as draft").click()')
  await wait('document.body.innerText.includes("Draft saved in Postiz.")')
  assert.equal(posted.draft, true)
  assert.equal(posted.media[0], '/media/mock.mp4')
  assert.equal(items[0].status, 'made', 'Saving a draft must not mark a queue item scheduled')
  assert.ok(posted.requestKey)
  await evaluate('[...document.querySelectorAll("button")].find(b => b.textContent === "Close").click()')
  await new Promise((r) => setTimeout(r, 100))
  const queueShot = await browser.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync('research_notes/postiz/mock-queue-390.png', Buffer.from(queueShot.data, 'base64'))
  // Without Postiz the queue still takes ideas: the channel becomes a name the user types.
  noPostiz = true
  await browser.send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/library?tab=queue` })
  await wait('document.body.innerText.includes("You can still name a channel yourself")')
  assert.equal(await evaluate('document.querySelector("#queue-channel").tagName'), 'INPUT', 'Without Postiz the channel is a text field')
  const type = (selector, value) => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })) })()`)
  await type('#queue-channel', 'tiktok-main')
  await type('#queue-idea', 'Typed channel idea')
  await evaluate('[...document.querySelectorAll("button")].find(b => b.textContent === "Add idea").click()')
  await wait('document.body.innerText.includes("Typed channel idea")')
  assert.equal(added.channel, 'tiktok-main')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 390'), 'Queue without Postiz fits 390px')
  console.log('Postiz UI checks passed: 390px queue and sheet, draft request, queue status, queue without Postiz, mock screenshots. No real Postiz calls.')
} finally {
  await browser?.close()
  await new Promise((r) => server.httpServer.close(r))
}
