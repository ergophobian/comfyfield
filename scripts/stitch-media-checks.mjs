import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { appMediaFile, stitchMediaFile } from '../server/stitchMedia.js'

const root = path.resolve('.comfyfield/stitch-media-checks')
fs.mkdirSync(root, { recursive: true })
const dir = fs.mkdtempSync(path.join(root, 'run-'))
const mediaPath = (name) => path.join(dir, 'media', path.basename(name))
fs.mkdirSync(path.dirname(mediaPath('sample')), { recursive: true })
fs.writeFileSync(mediaPath('sample'), 'fixture')
assert.equal(appMediaFile('/media/sample', mediaPath), fs.realpathSync(mediaPath('sample')))
for (const url of ['/etc/passwd', 'C:\\Windows\\win.ini', 'file:///etc/passwd', '../sample', '/media/../sample', '/media/%2e%2e', '/media/a\\b']) {
  assert.throws(() => appMediaFile(url, mediaPath), /uploaded or generated/)
}
const server = http.createServer((req, res) => {
  if (req.url === '/large') { res.setHeader('Content-Length', '1024'); return res.end('x'.repeat(1024)) }
  if (req.url === '/chunked') { res.write('x'.repeat(40)); return res.end('x'.repeat(40)) }
  if (req.url === '/slow') { res.write('start'); return }
  res.end('media fixture')
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`
try {
  const file = await stitchMediaFile(base, dir, 'success', mediaPath, { limit: 64 })
  assert.equal(fs.readFileSync(file, 'utf8'), 'media fixture')
  await assert.rejects(stitchMediaFile(`${base}/large`, dir, 'large', mediaPath, { limit: 64 }), /size limit/)
  await assert.rejects(stitchMediaFile(`${base}/chunked`, dir, 'chunked', mediaPath, { limit: 64 }), /size limit/)
  await assert.rejects(stitchMediaFile(`${base}/slow`, dir, 'slow', mediaPath, { timeout: 100 }))
  for (const name of ['large', 'chunked', 'slow']) assert.equal(fs.existsSync(path.join(dir, name)), false, 'Failed downloads leave no partial files')
} finally {
  server.closeAllConnections()
  await new Promise((resolve) => server.close(resolve))
}
console.log('Stitch media checks passed: app paths only, streamed downloads, size caps, body timeout and partial cleanup')
