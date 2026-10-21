import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { upload } from '../server/upload.js'
import { createEngine } from '../src/lib/flowEngine.js'
import { uploadFlowImage, migrateDataUrl, legacyImages, patchNode, isDataUrl } from '../src/lib/flowImage.js'

const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
const n = (id, type, data = {}) => ({ id, type, position: { x: 0, y: 0 }, data })
const flow = (url) => ({ id: 'f1', name: 'Legacy', nodes: [n('img', 'image', { url, name: 'old.png' }), n('m', 'model', { model: { kind: 'video', provider: 'x', name: 'Vid' }, takes: 1, duration: 5, prompt: 'push in' })], edges: [{ id: 'img-m', source: 'img', target: 'm' }] })

// Route fetch('/api/upload') through the real server handler, so the client and server agree on the contract.
const calls = []
const saved = (buf, ext) => ({ url: `/media/saved-${calls.length}.${ext}` })
globalThis.fetch = async (url, init) => {
  calls.push({ url, type: init.headers['Content-Type'] })
  assert.equal(url, '/api/upload')
  const body = init.body instanceof Blob ? Buffer.from(await init.body.arrayBuffer()) : Buffer.from(init.body)
  const req = Object.assign(Readable.from([body]), { headers: { 'content-type': init.headers['Content-Type'] } })
  try { return new Response(JSON.stringify(await upload(req, saved)), { status: 200 }) }
  catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: e.status || 500 }) }
}

// A picked file uploads as raw bytes and the node keeps the /media URL, not a data URL.
const file = new File([Buffer.from(png.split(',')[1], 'base64')], 'pick.png', { type: 'image/png' })
const picked = await uploadFlowImage(file)
assert.match(picked.url, /^\/media\/saved-\d+\.png$/)
assert.equal(picked.name, 'pick.png')
assert.equal(calls.at(-1).type, 'image/png')
const store = { current: 'f1', flows: [flow(null), { ...flow(null), id: 'f2' }] }
const next = patchNode(store, 'f1', 'img', picked)
assert.equal(next.flows[0].nodes[0].data.url, picked.url)
assert.equal(next.flows[1].nodes[0].data.url, null, 'only the named flow changes')
assert.equal(isDataUrl(next.flows[0].nodes[0].data.url), false)

// Non-images and failed uploads reject with a message the node can show.
await assert.rejects(uploadFlowImage(new File(['x'], 'a.txt', { type: 'text/plain' })), /Choose an image file/)
await assert.rejects(uploadFlowImage(new File([], 'empty.png', { type: 'image/png' })), /No file received/)

// Legacy flows with data URLs still load and still feed downstream nodes as is.
const legacy = flow(png)
assert.deepEqual(legacyImages(legacy).map((x) => x.id), ['img'])
const eng = createEngine({ run: async () => [] })
assert.deepEqual(eng.itemsOf(legacy, 'img').map((i) => i.url), [png])
assert.equal(eng.plan(legacy, 'm').blocked, false)
assert.equal(eng.plan(legacy, 'm').units[0].opts.image, png)

// Migration moves the data URL to /media, but never overwrites a node the user changed meanwhile.
const moved = await migrateDataUrl(png)
assert.match(moved, /^\/media\/saved-\d+\.png$/)
assert.equal(calls.at(-1).type, 'application/json')
const legacyStore = { current: 'f1', flows: [legacy] }
assert.equal(patchNode(legacyStore, 'f1', 'img', { url: moved }, png).flows[0].nodes[0].data.url, moved)
const changed = patchNode(legacyStore, 'f1', 'img', { url: '/media/new.png' })
assert.equal(patchNode(changed, 'f1', 'img', { url: moved }, png).flows[0].nodes[0].data.url, '/media/new.png')
assert.deepEqual(legacyImages(patchNode(legacyStore, 'f1', 'img', { url: moved }, png).flows[0]), [])
await assert.rejects(migrateDataUrl('data:text/plain;base64,aGk='), /Attach an image/)

console.log('flow image checks ok')
