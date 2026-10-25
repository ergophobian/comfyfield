import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { preview } from 'vite'
import { startBrowser } from './browser.mjs'

const phase = process.argv[2] || 'after'
assert(['before', 'after'].includes(phase))
const dir = 'research_notes/screenshots/placeholder-assets'
mkdirSync(dir, { recursive: true })
const server = await preview({ configFile: false, envFile: false, plugins: [{
  name: 'art-capture-offline', configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url.startsWith('/api/')) return next()
      res.setHeader('Content-Type', 'application/json')
      res.end((req.url.startsWith('/api/stitch/exports') || req.url.startsWith('/api/library/')) ? '[]' : '{}')
    })
  },
}], preview: { host: '127.0.0.1', port: 0 } })
let browser
const evidence = []
try {
  const errors = []
  browser = await startBrowser(`art-${phase}`, { onEvent(event) {
    if (event.method === 'Runtime.exceptionThrown') errors.push(event.params.exceptionDetails.exception?.description || event.params.exceptionDetails.text)
  } })
  const cdp = browser.send
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  for (const width of [1440, 390]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width === 390 })
    const routes = [['explore', '/'], ['app-hub', '/apps?hub=professional'], ['studio', '/character'], ['library', '/assets']]
    if (phase === 'after' && width === 390) routes.push(...[
      ['apps-all', '/apps', false], ['image', '/image', false], ['video', '/video', false],
      ['audio', '/audio', false], ['shorts', '/shorts', false], ['mixed-media', '/mixed-media', false],
      ['photodump', '/photodump', false], ['fashion', '/fashion', false],
    ])
    for (const [name, route, capture = true] of routes) {
      await cdp('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}${route}` })
      for (let i = 0; i < 100; i++) {
        if (await evaluate('document.readyState === "complete" && !!document.querySelector("main")')) break
        await new Promise((r) => setTimeout(r, 100))
      }
      await evaluate('document.fonts.ready')
      // Scroll to load the art in rows below the fold before taking a full-page capture.
      await evaluate('(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)) } window.scrollTo(0, 0); const images = [...document.querySelectorAll(".art-image")]; images.forEach(i => i.loading = "eager"); await Promise.race([Promise.all(images.map(i => i.decode().catch(() => {}))), new Promise(r => setTimeout(r, 5000))]) })()')
      await new Promise((r) => setTimeout(r, 350))
      const status = await evaluate('({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, images: [...document.querySelectorAll(".art-image")].map(i => ({ src: i.getAttribute("src"), loaded: i.complete && i.naturalWidth > 0, alt: i.alt, width: i.width, height: i.height })) })')
      if (phase === 'after') assert(status.scrollWidth <= width, `${name} overflows at ${width}px: ${status.scrollWidth}`)
      if (phase === 'after') {
        assert(status.images.length, `${name} needs generated art`)
        assert(status.images.every((i) => i.loaded), `${name} has a broken art image`)
      }
      const file = capture ? `${phase}-${name}-${width}.png` : null
      if (capture) {
        const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
        writeFileSync(`${dir}/${file}`, Buffer.from(shot.data, 'base64'))
      }
      evidence.push({ file, route, ...status })
      console.log(`${file || route}: ${status.images.length} art images, ${status.scrollWidth}px page width`)
    }
  }
  if (phase === 'after') assert.deepEqual(errors, [])
  writeFileSync(`${dir}/${phase}-evidence.json`, JSON.stringify({ pages: evidence, errors }, null, 2) + '\n')
} finally {
  await browser?.close()
  await server.httpServer.close()
}
