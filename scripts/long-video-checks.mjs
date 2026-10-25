// Long video chains (shared/longVideo.js, runChain in server/core.js) against a fake Comfy client and
// real ffmpeg. No network, no keys, no generations.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { CHAINS, MAX_CHUNKS, clipChunks, extendChunks, h3ExtendFrames, wanFrames } from '../shared/longVideo.js'
import { findFfmpeg, ffmpeg, probeVideo, cutFrames, joinChunks } from '../server/stitch.js'

fs.mkdirSync('outputs', { recursive: true })
process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.resolve('outputs/long-video-check-'))
process.env.COMFY_MODE = ''
process.env.COMFY_URL = ''
process.env.COMFY_API_KEY = ''
process.env.COMFY_BASE_URL = ''
const core = await import('../server/core.js')
globalThis.fetch = async (url) => { throw new Error(`Unexpected network call: ${url}`) }

const dir = path.join(process.env.COMFYFIELD_HOME, 'fixtures')
fs.mkdirSync(dir, { recursive: true })
const binary = await findFfmpeg()
const run = (args) => ffmpeg(['-y', ...args], { binary, cwd: dir })
const enc = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '10', '-pix_fmt', 'yuv420p', '-c:a', 'aac']
// testsrc2 changes every frame, so a seam one frame off shows up as a pixel difference.
const source = path.join(dir, 'source.mp4')
await run(['-f', 'lavfi', '-i', 'testsrc2=s=160x96:r=24:d=9', '-f', 'lavfi', '-i', 'sine=frequency=330:duration=9', '-frames:v', '200', ...enc, source])
// Each file decodes once, to grey frames, and a frame is read by its index.
const decoded = new Map()
const frameAt = async (file, n) => {
  if (!decoded.has(file)) {
    const { width, height } = await probeVideo(file, { binary })
    const raw = execFileSync(binary, ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { windowsHide: true, maxBuffer: 1 << 28 })
    decoded.set(file, { raw, size: width * height })
  }
  const { raw, size } = decoded.get(file)
  return raw.subarray(n * size, (n + 1) * size)
}
const diff = (a, b) => a.reduce((sum, v, i) => sum + Math.abs(v - b[i]), 0) / a.length

test('plans: SCAIL-2 steps 76 frames with a 5-frame anchor, Wan Animate 2 steps 80 with 1', () => {
  assert.deepEqual(clipChunks(81, CHAINS.scail2_character_swap), [{ from: 0, count: 81, overlap: 0 }], 'one chunk runs the graph as it is')
  assert.deepEqual(clipChunks(200, CHAINS.scail2_character_swap), [{ from: 0, count: 81, overlap: 0 }, { from: 76, count: 81, overlap: 5 }, { from: 152, count: 45, overlap: 5 }])
  assert.deepEqual(clipChunks(200, CHAINS.wan_animate2).map((c) => [c.from, c.count, c.overlap]), [[0, 81, 0], [80, 81, 1], [160, 37, 1]])
  // A last chunk that would add fewer than 4 new frames is left out.
  assert.equal(clipChunks(160, CHAINS.scail2_character_swap).length, 2)
  for (const total of [82, 150, 300, 777]) {
    const chunks = clipChunks(total, CHAINS.scail2_character_swap)
    for (const c of chunks) assert.equal(c.count, wanFrames(c.count), 'every chunk is 4k + 1 frames, as the graph renders')
    const out = chunks.reduce((sum, c) => sum + c.count - c.overlap, 0)
    assert(out <= total && total - out <= 7, `${total} frames become ${out}`)
  }
  assert.throws(() => clipChunks(30 * 60 * 2, CHAINS.scail2_character_swap, 30), new RegExp(`most is ${MAX_CHUNKS}. Trim it to 40 seconds or less`))
})

test('plans: an H3 run over 10 seconds opens with 10 and extends by up to 8', () => {
  assert.deepEqual(extendChunks(8, CHAINS.h3_open_t2v), [8])
  assert.deepEqual(extendChunks(30, CHAINS.h3_open_t2v), [10, 8, 8, 3])
  assert.equal(h3ExtendFrames(8), 204, 'matches the frame math in h3_extend')
  for (const total of [11, 20, 45, 60]) {
    const parts = extendChunks(total, CHAINS.h3_open_t2v)
    assert(parts[0] + parts.slice(1).reduce((s, p) => s + h3ExtendFrames(p) / 24, 0) >= total)
    assert(parts.slice(1).every((p) => p >= 3 && p <= 8))
  }
  assert.throws(() => extendChunks(61, CHAINS.h3_open_t2v), /up to 60 seconds/)
})

test('graphs: each chunk graph takes the chunk before as an optional {{previous}}', () => {
  for (const [workflow, node, field] of [['scail2_character_swap', 'WanSCAILToVideo', 'previous_frames'], ['wan_animate2', 'WanAnimate2ToVideo', 'continue_motion']]) {
    const graph = JSON.parse(fs.readFileSync(`public/workflows/${workflow}.json`, 'utf8'))
    const target = Object.values(graph).find((n) => n.class_type === node)
    const [frames] = target.inputs[field]
    assert.equal(graph[frames].class_type, 'GetVideoComponents')
    const loader = graph[graph[frames].inputs.video[0]]
    assert.equal(loader.inputs.file, '{{previous}}')
    assert.equal(loader._meta.optional, 'previous')
    assert.equal(graph[frames]._meta.optional, 'previous', 'the frames node drops with its loader')
    assert(core.uploadsOf(graph).some((u) => u.key === 'previous'), 'the previous chunk uploads like a clip')
  }
})

await test('ffmpeg: cut by frame number, and a blended join over the overlap keeps every frame in place', async () => {
  const info = await probeVideo(source, { binary })
  assert.equal(info.fps, 24)
  assert.equal(info.frames, 200)
  const chunks = clipChunks(info.frames, CHAINS.scail2_character_swap)
  const parts = []
  for (const [i, c] of chunks.entries()) parts.push({ file: await cutFrames(source, path.join(dir, `part-${i}.mp4`), { from: c.from, count: c.count, fps: 24, binary }), overlap: c.overlap })
  assert.equal((await probeVideo(parts[1].file, { binary })).frames, 81)
  const joined = await joinChunks(parts, path.join(dir, 'joined.mp4'), { fps: 24, blend: true, audio: source, binary })
  const out = await probeVideo(joined.path, { binary })
  assert.equal(out.frames, 197)
  assert(out.audio)
  // Frames across both seams match the source frame at the same index, and not its neighbour.
  for (const n of [40, 76, 78, 80, 152, 154, 190]) {
    const same = diff(await frameAt(joined.path, n), await frameAt(source, n))
    assert(same < 3, `frame ${n} is off by ${same}`)
    assert(diff(await frameAt(joined.path, n), await frameAt(source, n + 1)) > same * 2, `frame ${n} could be its neighbour`)
  }
})

// A fake Comfy client on a ready Pod. The "model" returns its input clip for the chunk graphs, and for
// H3 a test clip: 10 seconds to open, and the tail it got plus the new seconds to extend.
function fakePod() {
  const runs = []
  const client = {
    workflows: { fromFile: async (file) => ({ file, json: null, inputs: {}, setInput(id, field, value) { this.inputs[id] = value } }) },
    assets: { fromBytes: (buf) => ({ buf: Buffer.from(buf) }) },
    run: async (wf) => {
      const graph = wf.json
      const classes = Object.values(graph).map((n) => n.class_type)
      const name = path.basename(wf.file, '.json')
      runs.push({ name, graph, inputs: wf.inputs })
      const file = path.join(dir, `out-${runs.length}.mp4`)
      if (classes.includes('WanSCAILToVideo') || classes.includes('WanAnimate2ToVideo')) {
        fs.writeFileSync(file, wf.inputs['1'].buf)
      } else if (classes.includes('MiniMaxH3AddGuide')) {
        const tail = path.join(dir, `tail-in-${runs.length}.mp4`)
        fs.writeFileSync(tail, wf.inputs['50'].buf)
        const n = (await probeVideo(tail, { binary })).frames
        const add = h3ExtendFrames(Number(graph['60'].inputs.value)) / 24
        await run(['-i', tail, '-f', 'lavfi', '-i', `color=c=blue:s=256x144:r=24:d=${add}`, '-f', 'lavfi', '-i', `sine=frequency=550:duration=${add}`,
          '-filter_complex', `[0:v]scale=256:144,setsar=1[a];[a][0:a][1:v][2:a]concat=n=2:v=1:a=1[v][s]`, '-map', '[v]', '-map', '[s]', ...enc, file])
        assert.equal(n, 24, 'h3_extend gets the last second')
      } else {
        await run(['-f', 'lavfi', '-i', 'testsrc2=s=256x144:r=24:d=10', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=10', ...enc, '-shortest', file])
      }
      return { outputs: [{ type: 'video', contentType: 'video/mp4', name: 'out.mp4', toBytes: async () => fs.readFileSync(file) }] }
    },
  }
  const lease = async () => ({ baseUrl: 'https://pod1-8189.proxy.runpod.net', token: 't', sandbox: false, signal: new AbortController().signal, reason: () => null, release() {} })
  return { runs, opts: { createClient: () => client, lease, podPhase: async () => 'ready', podVram: () => 48, podRoom: () => ({}), podArch: () => null } }
}

const media = () => { const folder = path.dirname(core.mediaPath('x')); return new Set(fs.existsSync(folder) ? fs.readdirSync(folder) : []) }

await test('runs: a character swap longer than one segment renders three chained segments as one video', async () => {
  const clip = core.saveMedia(fs.readFileSync(source), 'mp4')
  const { runs, opts } = fakePod()
  const vars = { video: clip.url, image: core.saveMedia(Buffer.from('png'), 'png').url, prompt: 'Swap', seed: 7, start: 0, duration: 200 / 24 }
  const before = media()
  const files = await core.runComfy('scail2_character_swap', vars, opts)
  assert.equal(runs.length, 3)
  assert(!runs[0].graph['90'], 'the first segment has nothing before it')
  for (const r of runs.slice(1)) {
    assert.deepEqual(r.graph['25'].inputs.previous_frames, ['91', 0])
    assert(r.inputs['90'].buf.length > 0, 'the segment before is uploaded')
  }
  assert(runs.every((r) => r.graph['28'].inputs.noise_seed === 7), 'one seed for every segment')
  assert.equal(files.length, 1)
  assert.equal(files[0].kind, 'video')
  const out = await probeVideo(files[0].path, { binary })
  assert.equal(out.frames, 197)
  assert(out.audio, 'the clip sound runs under the whole video')
  assert(diff(await frameAt(files[0].path, 154), await frameAt(source, 154)) < 4, 'the second seam lines up with the clip')
  const left = [...media()].filter((f) => !before.has(f))
  assert.deepEqual(left, [path.basename(files[0].path)], 'segments and cuts leave the media folder')
})

await test('runs: a clip that fits one segment runs the graph once, unchanged', async () => {
  const short = path.join(dir, 'short.mp4')
  await run(['-i', source, '-frames:v', '60', ...enc, short])
  const { runs, opts } = fakePod()
  const vars = { video: core.saveMedia(fs.readFileSync(short), 'mp4').url, image: core.saveMedia(Buffer.from('png'), 'png').url, prompt: 'Swap', seed: 1, start: 0, duration: 2.5 }
  await core.runComfy('wan_animate2', vars, opts)
  assert.equal(runs.length, 1)
  assert.equal(runs[0].graph['2'].inputs.duration, 2.5, 'the user trim reaches the graph')
  assert(!runs[0].graph['90'])
})

await test('runs: a 30-second H3 prompt opens with 10 seconds and extends three times into one video', async () => {
  const { runs, opts } = fakePod()
  const vars = { prompt: 'A hiker crosses a ridge', width: 1344, height: 768, frames: 721, duration: 30, seed: 3 }
  const files = await core.runComfy('h3_open_t2v', vars, opts)
  assert.deepEqual(runs.map((r) => r.name), ['h3_open_t2v', 'h3_extend', 'h3_extend', 'h3_extend'])
  assert.equal(runs[0].graph['6'].inputs.length, 241, 'the opening part is 10 seconds')
  for (const r of runs.slice(1)) assert.match(r.graph['6'].inputs.prompt, /^Continue the video seamlessly .* A hiker crosses a ridge$/)
  assert.deepEqual(runs.slice(1).map((r) => r.graph['60'].inputs.value), [8, 8, 3])
  const out = await probeVideo(files[0].path, { binary })
  assert(Math.abs(out.frames - 720) <= 1, `${out.frames} frames`)
  assert(out.audio)
  // Each extension's copy of the tail drops, so the first blue frame follows the opening part directly.
  const opening = diff(await frameAt(files[0].path, 239), await frameAt(files[0].path, 238))
  assert(diff(await frameAt(files[0].path, 240), await frameAt(files[0].path, 239)) > opening, 'the extension starts at frame 240')
})

await test('runs: a short H3 run and a failed segment', async () => {
  const { runs, opts } = fakePod()
  await core.runComfy('h3_open_t2v', { prompt: 'Short', width: 1344, height: 768, frames: 121, duration: 5, seed: 3 }, opts)
  assert.equal(runs.length, 1, 'five seconds is one run')
  let n = 0
  const failing = { ...opts, createClient: () => ({ ...opts.createClient(), run: async (wf) => { if (++n === 2) throw new Error('GPU out of memory'); return opts.createClient().run(wf) } }) }
  await assert.rejects(core.runComfy('h3_open_t2v', { prompt: 'Long', width: 1344, height: 768, frames: 481, duration: 20, seed: 3 }, failing), /^Error: Segment 2 of 3 failed. GPU out of memory$/)
  // With no Pod and no Comfy key the run needs a Pod: that reaches the app as it is, so it can offer one.
  await assert.rejects(core.runComfy('h3_open_t2v', { prompt: 'Long', width: 1344, height: 768, frames: 481, duration: 20, seed: 3 }, { ...opts, podPhase: async () => 'none' }),
    (e) => e.code === 'needs_pod' && !e.message.startsWith('Segment'))
})
