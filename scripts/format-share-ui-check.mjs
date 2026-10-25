// Import a format from a file and from a gist on /apps, find it in Yours, share it as a gist from its
// page and remove it. Real local API; api.github.com is mocked inside this process.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { startBrowser, chromeExecutable, uiTimeout } from './browser.mjs'
import api from '../server/plugin.js'
import { formats } from '../src/lib/formats/index.js'
import { formatText } from '../src/lib/formats/share.js'

const dir = path.resolve('outputs/format-share-ui')
fs.mkdirSync(dir, { recursive: true })
process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.join(dir, 'storage-'))
const base = formats.find((f) => f.id === 'relight') || formats.find((f) => f.kind === 'image' && f.hub)
const shared = { ...base, id: 'neon-dusk-relight', name: 'Neon dusk relight', blurb: 'Relight a photo in pink and blue neon at dusk.' }
const file = path.join(dir, 'neon-dusk-relight.comfyfield-format.json')
fs.writeFileSync(file, formatText(shared))

const GIST = '0f1e2d3c4b5a69788796a5b4c3d2e1f0'
const posted = []
const realFetch = globalThis.fetch
globalThis.fetch = async (url, init = {}) => {
  const u = new URL(String(url))
  if (!/github/.test(u.hostname)) return realFetch(url, init)
  assert.equal(u.hostname, 'api.github.com', `unexpected GitHub host ${u.hostname}`)
  const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
  if (u.pathname === '/gists' && init.method === 'POST') {
    assert.equal(init.headers.Authorization, 'Bearer mock-token')
    posted.push(JSON.parse(init.body))
    return json(201, { id: GIST, html_url: `https://gist.github.com/octo/${GIST}` })
  }
  if (u.pathname === `/gists/${GIST}` && posted.length) {
    const files = Object.fromEntries(Object.entries(posted.at(-1).files).map(([filename, f]) => [filename, { filename, content: f.content }]))
    return json(200, { id: GIST, html_url: `https://gist.github.com/octo/${GIST}`, owner: { login: 'octo' }, files })
  }
  return json(404, { message: 'Not Found' })
}

// Vite reads port 0 as its default 5173, which another check may hold; take a free port first.
const port = await new Promise((resolve) => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)) }) })
const vite = await createServer({ configFile: false, envFile: false, cacheDir: 'node_modules/.cache/format-share-ui-vite', plugins: [react(), api()], server: { host: '127.0.0.1', port, strictPort: true, watch: { ignored: ['**/outputs/**'] } } })
await vite.listen()
const origin = `http://127.0.0.1:${port}`
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const call = async (url, method = 'GET', data) => (await realFetch(`${origin}${url}`, { method, headers: { 'Content-Type': 'application/json' }, body: data && JSON.stringify(data) })).json()
assert.ok((await call('/api/connections', 'POST', { id: 'github', values: { key: 'mock-token' } })).ok)

let browser
try {
  browser = await startBrowser('format-share-ui', { executable: process.env.WIDGET_CHROME || chromeExecutable() })
  const cdp = browser.send
  const js = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception.description)
    return result.result.value
  }
  const wait = async (expression, ms = uiTimeout) => {
    for (const deadline = Date.now() + ms; Date.now() < deadline;) { if (await js(`Boolean(${expression})`)) return; await delay(100) }
    throw new Error(`Timed out: ${expression}`)
  }
  const shot = async (name) => fs.writeFileSync(path.join(dir, name), Buffer.from((await cdp('Page.captureScreenshot', { format: 'png' })).data, 'base64'))
  const button = (text) => `([...document.querySelectorAll('main button, main a')].reduce((hit, b) => (b.textContent.trim() === ${JSON.stringify(text)} ? hit || b : hit), null) || [...document.querySelectorAll('main button, main a')].find((b) => b.textContent.trim().startsWith(${JSON.stringify(text)})))`
  const click = async (text) => { await wait(button(text)); await js(`${button(text)}.click()`) }
  const yoursCards = `[...document.querySelectorAll('.apps-sec')].find((s) => s.querySelector('h2')?.textContent === 'Yours')?.querySelectorAll('.recipe-card')`
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 860, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: `${origin}/apps` }, 120000)
  // The first visit can wait on Vite's dependency scan.
  await wait(`document.querySelector('.apps-sec')`, 90000)
  assert.ok(!(await js(`Boolean(${yoursCards})`)), 'no Yours group before an import')

  // Import from a file: the format lands in Yours, on its own tab.
  await click('Import a format')
  const { root } = await cdp('DOM.getDocument')
  const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '.apps-import input[type=file]' })
  await cdp('DOM.setFileInputFiles', { nodeId, files: [file] })
  await wait(`document.querySelector('.apps-import [role=status]')?.textContent === 'Neon dusk relight is in Yours.'`)
  await wait(`${yoursCards}?.length === 1`)
  assert.equal(new URL(await js('location.href')).searchParams.get('hub'), 'yours')
  assert.equal((await call('/api/formats')).formats[0].origin.name, 'neon-dusk-relight.comfyfield-format.json')
  await shot('format-yours.png')

  // A format this version cannot run is refused with the reason.
  const broken = path.join(dir, 'broken.comfyfield-format.json')
  fs.writeFileSync(broken, formatText({ ...shared, id: 'broken', steps: [{ id: 'g', model: 'no-such-model', kind: shared.kind }], outputs: [{ step: 'g', kind: shared.kind }] }))
  await cdp('DOM.setFileInputFiles', { nodeId, files: [broken] })
  await wait(`document.querySelector('.apps-import [role=alert]')?.textContent.includes('cannot run in this version')`)
  assert.equal((await call('/api/formats')).formats.length, 1)

  // Its page: origin, Download, gist share with the clean definition.
  await click('Close')
  await js(`${yoursCards}[0].click()`)
  await wait(`document.querySelector('.app-share')`)
  assert.ok(await js(`document.querySelector('.app-share').textContent.includes('Imported from neon-dusk-relight.comfyfield-format.json, ')`))
  await click('Share as a secret gist')
  await wait(`document.querySelector('.app-share [role=status] a')?.href === 'https://gist.github.com/octo/${GIST}'`)
  const content = Object.values(posted[0].files)[0].content
  assert.deepEqual(Object.keys(posted[0].files), ['neon-dusk-relight.comfyfield-format.json'])
  assert.equal(posted[0].public, false)
  assert.ok(!/"origin"|"hub"|mock-token/.test(content), content)
  await js(`document.querySelector('.app-share').scrollIntoView({ block: 'center' })`)
  await shot('format-share.png')

  // Remove it, then import it back from the gist link.
  await click('Remove from Yours')
  await wait(`location.pathname === '/apps'`)
  await wait(`document.querySelector('.apps-sec') && !${yoursCards}`)
  await click('Import a format')
  await js(`document.querySelector('#format-gist').focus()`)
  await cdp('Input.insertText', { text: `https://gist.github.com/octo/${GIST}` })
  await click('Import')
  await wait(`${yoursCards}?.length === 1`)
  const saved = (await call('/api/formats')).formats[0]
  assert.equal(saved.origin.kind, 'gist')
  assert.equal(saved.origin.owner, 'octo')

  // 390px: the import bar and Yours fit.
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await js('window.scrollTo(0, 0)')
  await delay(300)
  assert.ok(await js('document.documentElement.scrollWidth <= 390'), 'no sideways scroll at 390px')
  await shot('format-yours-mobile.png')
  console.log('Format share browser checks passed: file and gist import into Yours, refusal message, gist share, remove, 390px')
} catch (error) {
  const s = await browser?.send('Page.captureScreenshot', { format: 'png' }, 3000).catch(() => null)
  if (s) fs.writeFileSync(path.join(dir, 'failure.png'), Buffer.from(s.data, 'base64'))
  throw error
} finally {
  await browser?.close()
  await vite.close()
  globalThis.fetch = realFetch
}
