import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { createServer } from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { upload } from '../server/upload.js'
import { serveMedia } from '../server/serveMedia.js'
import { aspectBox, fitBox, trimRange, widgetReady, videoLimit, imageLimit } from '../shared/widgetInputs.js'
import { initialValues, missingInputs, formatOptions } from '../src/lib/formats/values.js'

const req = (type, chunks, headers = {}) => Object.assign(Readable.from(chunks.map((c) => Buffer.isBuffer(c) ? c : Buffer.from(c))), { headers: { 'content-type': type, ...headers } })
const saved = []
const save = (buf, ext) => { saved.push({ buf, ext }); return { url: `/media/test.${ext}` } }
for (const [type, ext] of Object.entries({ 'image/png': 'png', 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' })) {
  assert.deepEqual(await upload(req(type, [Buffer.from('local fixture')]), save), { url: `/media/test.${ext}`, type })
  assert.equal(saved.at(-1).ext, ext)
}
assert.equal((await upload(req('application/json', [JSON.stringify({ dataUrl: 'data:image/png;base64,aGVsbG8=' })]), save)).url, '/media/test.png')
assert.equal((await upload(req('application/json', [JSON.stringify({ type: 'video/webm', data: 'aGVsbG8=' })]), save)).url, '/media/test.webm')
await assert.rejects(upload(req('video/avi', [Buffer.from('x')]), save), { status: 415 })
await assert.rejects(upload(req('image/png', []), save), { status: 400 })
await assert.rejects(upload(req('application/json', ['{']), save), { status: 400 })
await assert.rejects(upload(req('video/mp4', [], { 'content-length': videoLimit + 1 }), save), { status: 413 })
await assert.rejects(upload(req('image/png', [], { 'content-length': imageLimit + 1 }), save), { status: 413 })
const chunk = Buffer.alloc(1024 * 1024)
const chunks = (n) => Array.from({ length: n }, () => chunk)
assert.equal((await upload(req('video/mp4', chunks(200)), save)).type, 'video/mp4')
await assert.rejects(upload(req('video/mp4', chunks(201)), save), { status: 413 })
await assert.rejects(upload(req('image/png', chunks(41)), save), { status: 413 })
assert.deepEqual(fitBox({ x: -1, y: 1, width: 0.5, height: 0.5 }), { x: 0, y: 0.5, width: 0.5, height: 0.5 })
assert.deepEqual(trimRange(8, 2, 5), { start: 4.99, end: 5 })
const box = aspectBox('9:16', '1920:1080')
assert.equal((box.width * 1920) / (box.height * 1080), 9 / 16)
assert.equal(widgetReady('mask', { url: '/photo' }), false)
assert.equal(widgetReady('face', { url: '/photo' }), false)
const format = { name: 'Widget test', prompt: 'Use {face}', settings: {}, inputs: ['mask', 'face', 'video', 'crop'].map((type) => ({ id: type, type })) }
assert.equal(missingInputs(format, initialValues(format)).length, 4)
const values = {
  mask: { url: '/photo', maskUrl: '/mask' },
  face: { url: '/group', faceUrl: '/face', name: 'Selected face' },
  video: { url: '/video', duration: 8, trim: { start: 1, end: 3 }, posterUrl: '/poster', posterTime: 2 },
  crop: { url: '/photo', box, aspect: '9:16' },
}
assert.equal(missingInputs(format, values).length, 0)
const opts = formatOptions(format, values)
assert.deepEqual(opts.inputs, values)
assert.deepEqual(opts.images, ['/photo', '/face', '/photo'])
assert.deepEqual(opts.media, { maskStrokes: '/mask', video: '/video' })
assert.equal(opts.prompt, 'Use Selected face')

const dir = path.resolve('outputs/widget-checks')
fs.mkdirSync(dir, { recursive: true })
const file = path.join(dir, 'range-fixture.webm')
fs.writeFileSync(file, '0123456789')
const server = createServer((request, response) => serveMedia(request, response, file, 'video/webm'))
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
try {
  const url = `http://127.0.0.1:${server.address().port}`
  const response = await fetch(url, { headers: { Range: 'bytes=2-5' } })
  assert.equal(response.status, 206)
  assert.equal(response.headers.get('content-range'), 'bytes 2-5/10')
  assert.equal(await response.text(), '2345')
  const suffix = await fetch(url, { headers: { Range: 'bytes=-3' } })
  assert.equal(await suffix.text(), '789')
  assert.equal((await fetch(url, { headers: { Range: 'bytes=20-' } })).status, 416)
  assert.equal((await fetch(url, { method: 'HEAD' })).headers.get('content-length'), '10')
} finally { server.close() }
console.log('Widget geometry, format values, upload limits and video byte ranges passed')
