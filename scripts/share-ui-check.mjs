// Share a flow from the canvas as a gist, import it back from the gist link and from a file, and show
// where it came from. Runs the real local API with api.github.com mocked inside this process.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { startBrowser, chromeExecutable, uiTimeout } from './browser.mjs'
import api from '../server/plugin.js'
import { models } from '../src/lib/catalog.js'

const dir = path.resolve('outputs/share-ui')
fs.mkdirSync(dir, { recursive: true })
process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.join(dir, 'storage-'))
fs.mkdirSync(path.join(process.env.COMFYFIELD_HOME, '.comfyfield', 'media'), { recursive: true })
fs.copyFileSync('public/art/covers/ad-variants.webp', path.join(process.env.COMFYFIELD_HOME, '.comfyfield', 'media', 'mine.webp'))

// The server's GitHub calls land here. Anything else on a GitHub host fails the check.
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
    const files = Object.fromEntries(Object.entries(posted.at(-1).files).map(([filename, f]) => [filename, { filename, content: f.content, truncated: false }]))
    return json(200, { id: GIST, html_url: `https://gist.github.com/octo/${GIST}`, owner: { login: 'octo' }, files })
  }
  return json(404, { message: 'Not Found' })
}

// Vite reads port 0 as its default 5173, which another check may hold; take a free port first.
const port = await new Promise((resolve) => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)) }) })
const vite = await createServer({ configFile: false, envFile: false, cacheDir: 'node_modules/.cache/share-ui-vite', plugins: [react(), api()], server: { host: '127.0.0.1', port, strictPort: true, watch: { ignored: ['**/outputs/**'] } } })
await vite.listen()
const base = `http://127.0.0.1:${vite.httpServer.address().port}`
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const call = async (url, method = 'GET', data) => (await realFetch(`${base}${url}`, { method, headers: { 'Content-Type': 'application/json' }, body: data && JSON.stringify(data) })).json()

assert.ok((await call('/api/connections', 'POST', { id: 'github', values: { key: 'mock-token' } })).ok)
assert.equal((await call('/api/connections')).github.connected, true)
const n = (id, type, x, y, data) => ({ id, type, position: { x, y }, data })
const seeded = await call('/api/flows', 'PUT', { revision: 0, current: 'boat', flows: [{ id: 'boat', name: 'Boat at dusk', updated: 1, nodes: [
  n('p', 'prompt', 0, 40, { mode: 'single', text: 'A paper boat on a rainy street at dusk' }),
  n('img', 'image', 0, 260, { url: '/media/mine.webp', name: 'mine.webp' }),
  n('m', 'model', 340, 40, { kind: 'image', model: models.find((m) => m.id === 'comfy-flux'), aspect: '16:9', takes: 1 }),
  n('o', 'output', 700, 40, {}),
], edges: [{ id: 'p-m', source: 'p', target: 'm' }, { id: 'm-o', source: 'm', target: 'o' }] }] })
assert.equal(seeded.revision, 1)

let browser
try {
  browser = await startBrowser('share-ui', { executable: process.env.WIDGET_CHROME || chromeExecutable() })
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
  const shot = async (name) => fs.writeFileSync(path.join(dir, name), Buffer.from((await cdp('Page.captureScreenshot', { format: 'png' })).data, 'base64'))
  const button = (text) => `[...document.querySelectorAll('.flows button, .flows a')].find((b) => b.textContent.trim().startsWith(${JSON.stringify(text)}))`
  const click = async (text) => { await wait(button(text)); await js(`${button(text)}.click()`) }
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 820, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: `${base}/flows` })
  // The first visit can wait on Vite's dependency scan, so allow longer than a click.
  for (const deadline = Date.now() + 90000; Date.now() < deadline && !(await js(`Boolean(document.querySelector('.react-flow__node[data-id="img"] img'))`));) await delay(250)
  await wait(`document.querySelector('.react-flow__node[data-id="img"] img')`)

  // Share as a secret gist: the post holds no upload, no token, no results.
  await click('Share')
  await wait(button('Download flow file'))
  assert.ok(await js(`document.querySelector('.fpop .menu').textContent.includes('boat-at-dusk.comfyfield.json')`), 'the download names a .comfyfield.json file')
  await shot('share-menu.png')
  await click('Share as a secret gist')
  await wait(`document.querySelector('.fshare a')?.textContent === 'https://gist.github.com/octo/${GIST}'`)
  assert.equal(posted.length, 1)
  assert.equal(posted[0].public, false)
  const content = Object.values(posted[0].files)[0].content
  assert.deepEqual(Object.keys(posted[0].files), ['boat-at-dusk.comfyfield.json'])
  assert.ok(!content.includes('/media/') && !content.includes('mine.webp') && !content.includes('mock-token'), content)
  assert.equal(JSON.parse(content).flow.nodes.length, 4)
  await shot('share-gist.png')
  await click('Done')

  // Import from the gist link: a new flow opens and says where it came from.
  await click('Flows')
  await click('Import from a gist')
  await wait(`document.querySelector('#gist-link')`)
  await js(`document.querySelector('#gist-link').focus()`)
  await cdp('Input.insertText', { text: `https://gist.github.com/octo/${GIST}` })
  await click('Import')
  await wait(`document.querySelector('.forigin')?.textContent.startsWith("Imported from octo's gist, ")`)
  assert.equal(await js(`document.querySelector('.forigin a').href`), `https://gist.github.com/octo/${GIST}`)
  const store = await call('/api/flows')
  const imported = store.flows.find((f) => f.id === store.current)
  assert.notEqual(imported.id, 'boat')
  assert.equal(imported.origin.kind, 'gist')
  assert.equal(imported.nodes.find((x) => x.id === 'img').data.url, null)
  await wait(`document.querySelector('.fname').value === 'Boat at dusk'`)
  await shot('share-imported.png')

  // A bad link explains itself in the form.
  await click('Flows')
  await click('Import from a gist')
  await js(`document.querySelector('#gist-link').focus()`)
  await cdp('Input.insertText', { text: 'https://example.com/not-a-gist' })
  await click('Import')
  await wait(`document.querySelector('.fshare [role=alert]')?.textContent.includes('not a GitHub gist link')`)
  await click('Cancel')

  // Import a downloaded file: the origin names the file.
  const file = path.join(dir, 'rainy-street.comfyfield.json')
  fs.writeFileSync(file, content.replace('Boat at dusk', 'Rainy street'))
  const { root } = await cdp('DOM.getDocument')
  const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '.ftool input[type=file]' })
  await cdp('DOM.setFileInputFiles', { nodeId, files: [file] })
  await wait(`document.querySelector('.forigin')?.textContent.startsWith('Imported from rainy-street.comfyfield.json, ')`)
  await wait(`document.querySelector('.fname').value === 'Rainy street'`)

  // 390px: the toolbar wraps, the origin line and the share menu stay on screen.
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 780, deviceScaleFactor: 2, mobile: true })
  await wait(`document.querySelector('.forigin')`)
  const fits = await js(`(() => { const r = document.querySelector('.forigin').getBoundingClientRect(); const t = document.querySelector('.ftool').getBoundingClientRect(); return r.right <= 390 && r.top >= t.bottom - 1 && document.documentElement.scrollWidth <= 390 })()`)
  assert.ok(fits, 'origin line sits under the toolbar inside 390px')
  await shot('share-mobile.png')
  await click('Share')
  const menu = await js(`(() => { const r = document.querySelector('.fpop .menu').getBoundingClientRect(); return r.left >= 0 && r.right <= 390 })()`)
  assert.ok(menu, 'share menu fits at 390px')
  console.log('Share browser checks passed: gist share strips uploads, import from gist and file, origin shown, bad link message, 390px')
} catch (error) {
  const s = await browser?.send('Page.captureScreenshot', { format: 'png' }, 3000).catch(() => null)
  if (s) fs.writeFileSync(path.join(dir, 'failure.png'), Buffer.from(s.data, 'base64'))
  throw error
} finally {
  await browser?.close()
  await vite.close()
  globalThis.fetch = realFetch
}
