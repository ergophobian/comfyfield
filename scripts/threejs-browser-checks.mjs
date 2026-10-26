// Three.js node: real local renders in headless Chrome, encoded by the bundled ffmpeg. Free: no provider calls.
// Covers the frame clock, the network fence, the time and frame limits, the Library, Stitch and the MCP tools.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { renderThree, threeOptions } from '../server/threejs.js'
import { findFfmpeg, ffmpeg } from '../server/stitch.js'
import { threeScript, threeLimits, nodeDefaults } from '../shared/flowRules.js'

const deadline = setTimeout(() => { console.error('Three.js checks exceeded 280 seconds.'); process.exit(1) }, 280_000)
deadline.unref()
// Chrome's sandbox cannot start on some Linux CI runners; the UI checks run Chrome without it there too.
if (process.env.CI && process.platform === 'linux') process.env.COMFYFIELD_CHROME_SANDBOX ??= 'off'

const root = path.resolve('.comfyfield', 'threejs-checks')
fs.mkdirSync(root, { recursive: true })
const dir = fs.mkdtempSync(path.join(root, 'run with spaces '))
process.env.COMFYFIELD_HOME = dir
const core = await import('../server/core.js')
const { createFlows } = await import('../server/flows.js')
const { createServer } = await import('../server/mcp.js')
const binary = await findFfmpeg()

const keep = (from) => {
  const to = path.join(dir, `kept-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`)
  fs.copyFileSync(from, to)
  return to
}
// ffmpeg -i for the container, then a full decode to count the frames that really play.
const probe = async (file) => {
  const info = await ffmpeg(['-i', file], { binary, allowFailure: true })
  const decoded = await ffmpeg(['-i', file, '-map', '0:v:0', '-f', 'null', '-'], { binary })
  const d = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(info)
  const frames = [...decoded.matchAll(/frame=\s*(\d+)/g)].at(-1)
  return {
    duration: d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : null,
    frames: frames ? Number(frames[1]) : null,
    stream: /Stream #.*Video: (.*)/.exec(info)?.[1] || '',
  }
}
const cube = { script: threeScript, duration: 1, fps: 10, width: 320, height: 180 }

const checks = []
const check = (name, fn) => checks.push([name, fn])

check('options keep the size, rate, duration and frame count inside the limits', () => {
  assert.deepEqual(threeOptions(cube), { ...cube, frames: 10 })
  assert.throws(() => threeOptions({ ...cube, script: ' ' }), /Write the Three.js scene code/)
  assert.throws(() => threeOptions({ ...cube, duration: 0 }), /more than 0 and at most 30 seconds/)
  assert.throws(() => threeOptions({ ...cube, duration: 31 }), /at most 30 seconds/)
  assert.throws(() => threeOptions({ ...cube, fps: 61 }), /1 to 60/)
  assert.throws(() => threeOptions({ ...cube, fps: 12.5 }), /whole number/)
  assert.throws(() => threeOptions({ ...cube, width: 321 }), /width is an even number/)
  assert.throws(() => threeOptions({ ...cube, height: 4000 }), /height is an even number of pixels from 64 to 1920/)
  assert.throws(() => threeOptions({ ...cube, duration: 20, fps: 60 }), new RegExp(`1200 frames. The limit is ${threeLimits.frames}`))
  const d = nodeDefaults('threejs')
  assert.equal(threeOptions(d).frames, 150, 'The default node renders as it is')
})

check('a spinning cube renders 1 s at 10 fps to a 10-frame H.264 MP4 in yuv420p', async () => {
  const blocked = []
  const frames = []
  const file = await renderThree(cube, { keep, blocked, onFrame: (n) => frames.push(n) })
  const { duration, frames: count, stream } = await probe(file)
  assert.equal(count, 10, 'ffmpeg decodes 10 frames')
  assert(Math.abs(duration - 1) < 0.05, `The video lasts 1 s, not ${duration}`)
  assert.match(stream, /^h264 .*yuv420p.*320x180.* 10 fps/)
  assert.deepEqual(frames, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  assert.deepEqual(blocked.filter((u) => !u.endsWith('/favicon.ico')), [], 'The page loads only the scene and three')
})

check('the clock moves only per frame, Math.random is seeded, and addons load from three', async () => {
  const script = `import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
export default function ({ width, height, fps }) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10)
  camera.position.z = 3
  const box = new THREE.Mesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.1), new THREE.MeshNormalMaterial())
  scene.add(box)
  if (performance.now() !== 0) throw new Error('clock started at ' + performance.now())
  if (/native code/.test(String(Math.random)) || Math.random() === Math.random()) throw new Error('Math.random is not the seeded one')
  let raf = -1
  requestAnimationFrame((t) => { raf = t })
  return { scene, camera, async update(time, frame) {
    if (frame === 0 && raf !== 0) throw new Error('requestAnimationFrame got ' + raf)
    if (Math.abs(performance.now() - frame * 1000 / fps) > 1e-6) throw new Error('performance.now() is ' + performance.now() + ' on frame ' + frame)
    if (Date.now() !== Date.UTC(2026, 0, 1) + frame * 1000 / fps) throw new Error('Date.now() follows the wall clock')
    await new Promise((r) => setTimeout(r, 30))
    if (performance.now() !== frame * 1000 / fps) throw new Error('the clock moved between frames')
    box.rotation.y = time
  } }
}`
  const file = await renderThree({ ...cube, script, duration: 0.5 }, { keep })
  assert.equal((await probe(file)).frames, 5)
})

check('the scene has no Node, no sockets and no network beyond its own page', async () => {
  const blocked = []
  const script = `export default async function ({ THREE }) {
  const seen = []
  if (typeof process !== 'undefined' || typeof require !== 'undefined') seen.push('node')
  if (typeof WebSocket !== 'undefined' || typeof RTCPeerConnection !== 'undefined' || typeof Worker !== 'undefined') seen.push('sockets')
  for (const url of ['https://example.com/', 'http://127.0.0.1:5173/api/connections', '/api/connections']) {
    try { await fetch(url); seen.push('fetched ' + url) } catch {}
  }
  await new Promise((done) => { const img = new Image(); img.onload = img.onerror = done; img.src = '/private.png' })
  if (!(await fetch('/three/three.module.js')).ok) seen.push('three did not load')
  if (seen.length) throw new Error('Escaped: ' + seen.join(', '))
  return { scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera() }
}`
  await renderThree({ ...cube, script, duration: 0.1 }, { keep, blocked })
  assert(blocked.some((u) => u.endsWith('/private.png')), 'Unknown paths on the page origin are refused')
  assert(blocked.some((u) => u.endsWith('/api/connections')), 'The page cannot call the app API')
})

check('scene errors say what failed, and a hung scene stops at the time limit', async () => {
  await assert.rejects(renderThree({ ...cube, script: 'export default function ( {' }, { keep }), /The Three.js scene failed while setting up:[\s\S]*SyntaxError/)
  await assert.rejects(renderThree({ ...cube, script: 'export const x = 1' }, { keep }), /must export default function/)
  await assert.rejects(renderThree({ ...cube, script: 'export default () => ({ update(t, f) { if (f === 3) throw new Error("boom at 3") } })' }, { keep }), /failed on frame 4:[\s\S]*boom at 3/)
  const started = Date.now()
  await assert.rejects(renderThree({ ...cube, script: 'export default () => ({ update() { for (;;) {} } })' }, { keep, timeout: 6000 }), /took longer than 6 seconds and was stopped/)
  assert(Date.now() - started < 30000, 'The stuck Chrome is closed promptly')
  await assert.rejects(renderThree(cube, { keep, chrome: path.join(dir, 'no chrome', 'chrome.exe') }), /Chrome was not found at/)
})

check('a render is saved to media and the Library as a video', async () => {
  const item = await core.threejs(cube)
  assert.equal(item.kind, 'video')
  assert.match(item.url, /^\/media\/.*\.mp4$/)
  assert.equal((await probe(core.mediaPath(item.url))).frames, 10)
  assert.equal(core.libraryImports()[0].model, 'Three.js')
})

check('in Flows a Three.js video feeds a real Stitch and a video model', async () => {
  const jobs = []
  const flows = createFlows({
    directory: () => path.join(dir, 'flows'),
    generate: async (job) => { jobs.push(job); return [{ kind: 'video', url: '/media/mock-video.mp4' }] },
  })
  const flow = flows.create({ name: 'Three.js to Stitch', nodes: [
    { id: 't', type: 'threejs', data: { duration: 1, fps: 10, width: 320, height: 180 } },
    { id: 's', type: 'stitch' },
    { id: 'v', type: 'model', data: { model: 'comfy-ltx', prompt: 'Restyle as watercolor' } },
    { id: 'o', type: 'output' },
  ], edges: [{ source: 't', target: 's' }, { source: 't', target: 'v' }, { source: 's', target: 'o' }] })
  assert.equal(flow.nodes[0].data.script, threeScript, 'A new node starts with the spinning cube')
  const report = flows.report(flow.id, await flows.perform(flow.id, 'runNew'))
  assert.deepEqual(report.failed, [])
  assert.equal(report.outputs.t[0].kind, 'video')
  const stitched = report.outputs.s[0]
  assert.equal(stitched.kind, 'video')
  const joined = await probe(core.mediaPath(stitched.url))
  assert(Math.abs(joined.duration - 1) < 0.1, `Stitch joined the 1 s render, got ${joined.duration}`)
  assert.equal(jobs[0].video, report.outputs.t[0].url, 'The render is the model video input')
  assert.equal(jobs[0].prompt, 'Restyle as watercolor')
  assert.throws(() => flows.connect(flow.id, { source: 's', target: 't' }), /no input/)
})

check('MCP flow tools add and describe Three.js nodes', async () => {
  const flows = createFlows({ directory: () => path.join(dir, 'mcp'), render: async (type) => ({ kind: 'video', url: `/media/${type}.mp4` }) })
  const server = createServer({ flowService: flows })
  const [a, b] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'threejs-check', version: '1' })
  await Promise.all([server.connect(b), client.connect(a)])
  const { tools } = await client.listTools()
  const add = tools.find((t) => t.name === 'add_node')
  assert(add.inputSchema.properties.type.enum.includes('threejs'))
  assert.match(add.inputSchema.properties.data.description, /threejs: \{ script/)
  const made = JSON.parse((await client.callTool({ name: 'create_flow', arguments: { name: 'Agent Three.js' } })).content[0].text)
  const added = JSON.parse((await client.callTool({ name: 'add_node', arguments: { flow_id: made.id, type: 'threejs', id: 'cube', data: { duration: 2 } } })).content[0].text)
  assert.equal(added.type, 'threejs')
  assert.equal(added.data.fps, 30)
  const ran = JSON.parse((await client.callTool({ name: 'run_flow', arguments: { flow_id: made.id } })).content[0].text)
  assert.equal(ran.outputs.cube[0].url, '/media/threejs.mp4')
  await client.close()
})

let bad = 0
for (const [name, fn] of checks) {
  const started = Date.now()
  try { await fn(); console.log('ok   ', name, `(${((Date.now() - started) / 1000).toFixed(1)} s)`) } catch (err) { bad++; console.log('FAIL ', name, '\n     ', err.stack || err.message) }
}
await fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 }).catch(() => {})
console.log(bad ? `${bad} failed` : `all ${checks.length} passed`)
process.exit(bad ? 1 : 0)
