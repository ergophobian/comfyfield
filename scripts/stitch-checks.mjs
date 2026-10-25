import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createServer as createViteServer } from 'vite'
import { findFfmpeg, ffmpeg, renderStitch, stitchOptions } from '../server/stitch.js'
import * as core from '../server/core.js'
import { createServer } from '../server/mcp.js'

let bundledFfmpeg
try { bundledFfmpeg = createRequire(import.meta.url)('ffmpeg-static') } catch {}

const deadline = setTimeout(() => {
  console.error('Stitch checks exceeded 90 seconds. See the last progress message for the stalled operation.')
  process.exit(1)
}, 90_000)
deadline.unref()

// Keep fixtures inside the workspace, including paths with spaces and apostrophes.
const root = path.resolve('.comfyfield', 'stitch-checks')
fs.mkdirSync(root, { recursive: true })
const dir = fs.mkdtempSync(path.join(root, "clips with spaces ' "))
process.env.COMFYFIELD_HOME = dir
const binary = await findFfmpeg()
console.log(`check synthetic fixtures with ${binary} on ${process.platform}/${process.arch}`)
const run = (args) => ffmpeg(args, { binary, cwd: dir })
const red = path.join(dir, 'red.mp4')
const blue = path.join(dir, 'blue.mp4')
const music = path.join(dir, 'music.wav')
await run(['-f', 'lavfi', '-i', 'color=c=red:s=320x180:r=24:d=1.2', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1.2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', red])
await run(['-f', 'lavfi', '-i', 'color=c=blue:s=180x320:r=25:d=1.3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', blue])
await run(['-f', 'lavfi', '-i', 'sine=frequency=220:duration=0.3', music])
console.log('check input validation and system ffmpeg preview')
const raw = (file, args) => execFileSync(binary, ['-v', 'error', '-i', file, ...args], { maxBuffer: 16 * 1024 * 1024, timeout: 30000, windowsHide: true })
const frame = (file, at) => raw(file, ['-ss', String(at), '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
const rms = (file, at) => {
  const buf = raw(file, ['-ss', String(at), '-t', '0.06', '-vn', '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'])
  let total = 0
  for (let i = 0; i < buf.length; i += 4) total += buf.readFloatLE(i) ** 2
  return Math.sqrt(total / (buf.length / 4))
}
const originalFetch = global.fetch
global.fetch = async (url, ...args) => {
  if (!/^http:\/\/(localhost|127\.0\.0\.1):/.test(String(url))) throw new Error(`Unexpected network call: ${url}`)
  return originalFetch(url, ...args)
}
assert.throws(() => stitchOptions({ clips: [] }), /1 and 50/)
assert.throws(() => stitchOptions({ clips: [{ url: red, start: 1, end: 0.5 }] }), /after/)
assert.throws(() => stitchOptions({ clips: [red], aspect: '3:2' }), /aspect/)
assert.throws(() => stitchOptions({ clips: [red], music: { url: music, volume: -1 } }), /volume/)
await assert.rejects(core.stitch({ clips: [{ url: red, start: 9 }] }), /outside/)
await assert.rejects(core.stitch({ clips: [music] }), /no video/)

const spec = { clips: [{ url: red, start: 0.2, end: 0.7, caption: "First: 100% 'quoted' \\ {literal}\nSecond line" }, { url: blue, start: 0.1, end: 0.8 }], aspect: '1:1', preview: true }
const preview = await core.stitch(spec)
console.log('check decoded frame pixels and audio samples')
assert.equal(preview.duration, 1.2)
assert.equal(core.stitchedExports().length, 0, 'Preview is not yet in the Library')
const a = frame(preview.path, 0.2)
const b = frame(preview.path, 0.8)
assert.equal(a.length, 720 * 720 * 3)
const center = (360 * 720 + 360) * 3
assert.ok(a[center] > 200 && a[center + 2] < 30, 'First clip is red')
assert.ok(b[center + 2] > 200 && b[center] < 30, 'Second clip is blue')
let white = 0
for (let i = 540 * 720 * 3; i < a.length; i += 3) if (a[i] > 210 && a[i + 1] > 210 && a[i + 2] > 210) white++
assert.ok(white > 100, 'Captions are burned into the frame')
assert.ok(rms(preview.path, 0.2) > 0.03, 'Original clip audio survives')
assert.ok(rms(preview.path, 0.8) < 0.001, 'Silent clips receive silence')
const bytes = fs.readFileSync(preview.path)
assert.equal(core.exportStitch(preview.url).exported, true)
assert.deepEqual(fs.readFileSync(preview.path), bytes, 'Export reuses the exact preview')
assert.equal(core.stitchedExports().length, 1)
core.dismissStitch(preview.url)
assert.equal(core.stitchedExports().length, 0, 'Dismissed exports do not reappear on reload')
core.exportStitch(preview.url)
assert.throws(() => core.exportStitch('/media/missing.mp4'), /preview/)
console.log('ok    trims, mixed formats, ordering, captions, clip audio, preview and Library export')

if (bundledFfmpeg) {
  // Exercise the bundled binary even when system ffmpeg exists, as on this Windows machine.
  console.log(`check bundled preview with ${bundledFfmpeg}`)
  const mixed = await renderStitch({ clips: [{ url: blue, start: 0, end: 1.2, caption: 'Bundled captions' }], aspect: '9:16', music: { url: music, volume: 0.4, fade: 0.3 } }, { home: core.home, mediaPath: core.mediaPath, binary: bundledFfmpeg, timeout: 30000, onProgress: console.log })
  assert.equal(frame(mixed.path, 0.5).length, 720 * 1280 * 3)
  const middle = rms(mixed.path, 0.55)
  assert.ok(middle > 0.015 && middle < 0.05, `Music volume applied (${middle})`)
  assert.ok(rms(mixed.path, 0.02) < middle * 0.5, 'Music fades in')
  assert.ok(rms(mixed.path, 1.1) < middle * 0.5, 'Music fades out')
  console.log('ok    bundled ffmpeg, portrait aspect, music looping, volume and fades')
} else console.log('Optional ffmpeg binary unavailable; system ffmpeg fixtures passed')

console.log('check narration plays once, then silence')
assert.throws(() => stitchOptions({ clips: [blue], narration: { url: music, volume: 3 } }), /Narration volume/)
assert.throws(() => stitchOptions({ clips: [blue], narration: { url: '' } }), /Narration needs/)
const narrated = await renderStitch({ clips: [{ url: blue, end: 1.2 }], narration: { url: music, volume: 1 } }, { home: core.home, mediaPath: core.mediaPath, binary: bundledFfmpeg, timeout: 30000 })
assert.equal(narrated.duration, 1.2)
assert(rms(narrated.path, 0.1) > 0.03, 'Narration is audible initially')
assert(rms(narrated.path, 0.7) < 0.001, 'Short narration does not repeat')
assert(rms(narrated.path, 1.1) < 0.001, 'Narration tail is silent through the video end')
const both = await renderStitch({ clips: [{ url: blue, end: 1.2 }], music: { url: music, volume: 0.2, fade: 0 }, narration: { url: music, volume: 1 } }, { home: core.home, mediaPath: core.mediaPath, binary: bundledFfmpeg, timeout: 30000 })
assert(rms(both.path, 0.1) > rms(both.path, 0.7) * 3, 'Narration and looping music can coexist')
console.log('ok    narration plays once, pads silence, preserves video duration and coexists with music')

const specFile = path.join(dir, 'stitch.json')
console.log('check CLI subprocess')
fs.writeFileSync(specFile, JSON.stringify({ clips: [{ url: blue, end: 0.2 }], aspect: '4:5' }))
const cli = JSON.parse(execFileSync(process.execPath, ['bin/comfyfield.js', 'stitch', '--spec', specFile, '--json'], { encoding: 'utf8', timeout: 30000, windowsHide: true }))
assert.equal(cli.exported, true)
assert.equal(cli.width / cli.height, 4 / 5)
assert.ok(fs.existsSync(cli.path))
console.log('ok    CLI stitch and automatic Library export')

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
console.log('check MCP tools')
const server = createServer()
const client = new Client({ name: 'stitch-check', version: '1' })
await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
try {
  const result = await client.callTool({ name: 'stitch', arguments: { clips: [{ url: red, end: 0.2 }], preview: true } })
  assert.ok(!result.isError, JSON.stringify(result))
  const file = JSON.parse(result.content[0].text)
  const exported = await client.callTool({ name: 'export_stitch', arguments: { url: file.url } })
  assert.equal(JSON.parse(exported.content[0].text).exported, true)
} finally { await client.close(); await server.close() }
console.log('ok    MCP stitch and export_stitch tools')

const vite = await createViteServer({ envFile: false, server: { host: '127.0.0.1', port: 0 }, optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'error' })
console.log('check HTTP routes')
await vite.listen()
const base = `http://127.0.0.1:${vite.httpServer.address().port}`
try {
  const uploaded = await (await fetch(`${base}/api/stitch/upload`, { method: 'POST', headers: { 'Content-Type': 'video/mp4' }, body: fs.readFileSync(blue) })).json()
  assert.ok(uploaded.url)
  const res = await fetch(`${base}/api/stitch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clips: [{ url: uploaded.url, end: 0.2 }], preview: true }) })
  assert.equal(res.status, 200)
  const file = await res.json()
  const media = await fetch(`${base}${file.url}`)
  assert.equal(media.headers.get('content-type'), 'video/mp4')
  assert.ok((await media.arrayBuffer()).byteLength > 1000)
  const range = await fetch(`${base}${file.url}`, { headers: { Range: 'bytes=0-31' } })
  assert.equal(range.status, 206)
  assert.equal((await range.arrayBuffer()).byteLength, 32)
  const saved = await fetch(`${base}/api/stitch/export`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: file.url }) })
  assert.equal(saved.status, 200)
  assert.ok((await (await fetch(`${base}/api/stitch/exports`)).json()).some((item) => item.url === file.url))
} finally { await vite.close(); global.fetch = originalFetch }
console.log('ok    HTTP upload, preview, media playback and Library export')
console.log(`All Stitch checks passed. Synthetic fixtures retained at ${dir}`)
