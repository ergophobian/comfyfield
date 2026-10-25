// ALTER A/B, round 2: showcase sources (iPhone UGC, cinematic), through ComfyField's dev-server routes on a Pod.
// Run from the repo root with `npm run dev` up (BASE overrides http://localhost:5173). See ../README.md.
//   node research_notes/alter-target-frame/round2/run.mjs sources   LTX-2.5 source clips + product images (done: in this folder)
//   node research_notes/alter-target-frame/round2/run.mjs swaps     target frames + A (product image) and B (target frame) Bernini-R swaps
//   node research_notes/alter-target-frame/round2/run.mjs stop      terminate the Pod
// A step whose output file is already in this folder is skipped. BUDGET (USD, default 1) stops new runs near that spend.
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const BASE = process.env.BASE || 'http://localhost:5173'
const OUT = path.dirname(fileURLToPath(import.meta.url))
const MEDIA = path.resolve('.comfyfield/media')
const BUDGET = Number(process.env.BUDGET || 1)
const stateFile = path.join(OUT, 'state.json')
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : { runs: [] }
const fileOf = (label) => ['.mp4', '.png', '.webp'].map((e) => path.join(OUT, label + e)).find((p) => fs.existsSync(p))
const save = () => fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
const log = (...a) => { const l = `[${new Date().toISOString().slice(11, 19)}] ${a.join(' ')}`; console.log(l); fs.appendFileSync(path.join(OUT, 'run.log'), l + '\n') }
const dataUrl = (file) => `data:${file.endsWith('.mp4') ? 'video/mp4' : 'image/png'};base64,${fs.readFileSync(file).toString('base64')}`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const md5 = (file) => execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-map', '0:v', '-f', 'md5', '-']).toString().trim()

const SCENES = {
  ugc: {
    width: 704, height: 1280, seed: 11,
    source: 'Vertical iPhone video, real handheld phone footage filmed by a friend at golden hour on a rooftop bar. A young woman with curly dark hair and a loose linen shirt leans on the railing, lifts a coupe glass with a bright orange cocktail toward the camera and laughs, the glass catching the low sun. Slight handheld shake, warm lens flare, the city skyline soft behind her, natural skin texture, candid and spontaneous, ambient chatter and wind.',
    product: 'Product photo of one slim aluminium soda can of sparkling yuzu, pale butter yellow with a hand drawn green citrus leaf illustration wrapping around it, fine condensation droplets, standing on a sunlit pale stone ledge with a hard sun shadow, warm golden hour light, clean empty background, no text, no letters, no logos.',
    target: 'Photo retouch. Keep the photograph in image 1 exactly as it is: same framing, same woman, same face and laugh, same hair, same linen shirt, same hand and fingers, same rooftop, skyline, golden light, lens flare, focus and grain. Only the object in her hand changes: remove the coupe cocktail glass completely and put the slim yuzu soda can from image 2 in her hand instead, held up toward the camera the same way, at the real size of a slim can. The can is a real object photographed in this light: the low sun puts a warm highlight down the curved metal, condensation catches the light, and her fingers overlap the print. It must look photographed, not pasted on. No text, no letters, no logos.',
    swap: 'Replace the coupe cocktail glass in her hand with the slim pale yellow yuzu soda can from the reference throughout the video. Keep its motion, position, lighting and shadows consistent from frame to frame and leave everything else untouched.',
    frameAt: 1.7,
  },
  noir: {
    width: 1280, height: 704, seed: 23,
    source: 'Cinematic anamorphic night shot, a narrow Tokyo alley in heavy rain. Pink and cyan neon signs without readable text glow on wet walls and reflect in deep puddles. A man in a dark trench coat walks slowly toward the camera under a black umbrella, raindrops bouncing off it, steam rising from a vent. Slow dolly back, shallow depth of field, oval bokeh, teal and magenta grade, fine film grain, the sound of rain and distant traffic.',
    product: 'Product photo of one open clear transparent bubble umbrella with a thin silver frame and a black curved handle, raindrops beading on the clear canopy, shot at night against a dark wet street with soft pink and cyan neon bokeh, rim light on the edges of the canopy, no text, no letters, no logos.',
    target: 'Photo retouch. Keep the photograph in image 1 exactly as it is: same framing, same man, same trench coat, same pose and stride, same alley, same rain, neon, puddles, steam, focus, grain and colour grade. Only the umbrella changes: remove the black umbrella completely and put the clear transparent bubble umbrella from image 2 over him instead, held the same way at the same height and size. The umbrella is a real object photographed in this light: the pink and cyan neon shows through the clear canopy and glints on its curved surface, raindrops bead and run on it, and his hair and the alley behind are visible through it. It must look photographed, not pasted on. No text, no letters, no logos.',
    start: 1.6, swap: 'Replace the black umbrella with the clear transparent bubble umbrella from the reference throughout the video. The neon light and the rain show through its clear canopy and reflect on its surface. Keep its motion, position, lighting and shadows consistent from frame to frame and leave everything else untouched.',
    frameAt: 4.5,
  },
}

function call(method, url, body) {
  const data = body ? JSON.stringify(body) : null
  return new Promise((resolve, reject) => {
    const req = http.request(BASE + url, { method, headers: data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {} }, (res) => {
      let text = ''
      res.on('data', (c) => { text += c })
      res.on('end', () => {
        let j = {}
        try { j = JSON.parse(text) } catch {}
        if (res.statusCode >= 400) reject(Object.assign(new Error(j.error || j.message || `HTTP ${res.statusCode}`), { code: j.code, status: res.statusCode }))
        else resolve(j)
      })
    })
    req.setTimeout(0)
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}
const pod = () => call('GET', '/api/pod')

async function spendGuard() {
  const s = await pod()
  state.baseline ??= s.spend?.today ?? 0
  save()
  const used = (s.spend?.today ?? 0) - state.baseline
  log(`Pod ${s.phase}, spend this round $${used.toFixed(3)} of $${BUDGET}`)
  if (used >= BUDGET * 0.9) throw new Error(`Stop: spend $${used.toFixed(2)} is near the $${BUDGET} budget`)
  return s
}

async function ensurePod() {
  const s = await spendGuard()
  if (s.phase === 'paused') { log('resume Pod'); await call('POST', '/api/pod/resume', {}) }
  else if (s.phase === 'none') { log('start Pod'); await call('POST', '/api/pod/start', { minVramGb: 32, volumeGb: 200 }) }
  for (let i = 0; i < 90; i++) {
    const p = await pod().catch(() => ({}))
    if (p.phase === 'ready') { log(`Pod ready: ${p.pod?.gpu || ''}`); return }
    // Another session can terminate the shared Pod; never start a second one behind its back.
    if (i > 0 && p.phase === 'none') throw new Error(`The Pod is gone: ${p.event?.text || 'no reason given'}`)
    if (i % 4 === 0) log(`waiting: ${p.phase} ${p.stage || ''}`)
    await sleep(15000)
  }
  throw new Error('The Pod did not get ready in about 25 minutes')
}

// A Pod video run can also return its input clip, so a source md5 drops that file.
async function run(label, workflow, vars, { notMd5 } = {}) {
  const done = fileOf(label)
  if (done) return done
  await spendGuard()
  for (let tries = 0; ; tries++) {
    const t0 = Date.now()
    log(`[${label}] ${workflow} ...`)
    try {
      const { files } = await call('POST', '/api/comfy/run', { workflow, vars })
      const secs = (Date.now() - t0) / 1000
      let keep = files.map((f) => ({ url: f.url, local: path.join(MEDIA, path.basename(f.url)) }))
      if (notMd5) keep = keep.filter((f) => md5(f.local) !== notMd5)
      const pick = keep[0]
      const file = path.join(OUT, `${label}${path.extname(pick.url)}`)
      fs.copyFileSync(pick.local, file)
      state.runs.push({ label, workflow, wallSec: secs, file: path.basename(file), returned: files.length })
      save()
      log(`[${label}] done in ${secs.toFixed(0)} s, ${files.length} file(s) -> ${file}`)
      return file
    } catch (e) {
      log(`[${label}] error: ${e.code || ''} ${e.message}`)
      if (['needs_pod', 'no_pod', 'paused'].includes(e.code) && tries < 2) { await ensurePod(); continue }
      if (tries < 1 && !/not terminal after/.test(e.message)) { await sleep(20000); continue }
      throw e
    }
  }
}

const stage = process.argv[2]
if (stage === 'sources') {
  await ensurePod()
  for (const [id, s] of Object.entries(SCENES)) {
    await run(`${id}-source`, 'ltx25_t2v', { prompt: s.source, seed: s.seed, width: s.width, height: s.height, frames: 121 })
  }
  for (const [id, s] of Object.entries(SCENES)) {
    await run(`${id}-product`, 'z_image', { prompt: s.product, seed: s.seed, width: 1024, height: 1024, count: 1 })
  }
} else if (stage === 'swaps') {
  await ensurePod()
  for (const [id, s] of Object.entries(SCENES)) {
    const src = fileOf(`${id}-source`)
    const frame = path.join(OUT, `${id}-frame.png`)
    if (!fs.existsSync(frame)) execFileSync('ffmpeg', ['-v', 'error', '-ss', String(s.frameAt), '-i', src, '-frames:v', '1', frame, '-y'])
    await run(`${id}-target`, 'qwen2511_edit', { image: dataUrl(frame), image2: dataUrl(path.join(OUT, `${id}-product.png`)), prompt: s.target, seed: 1 })
  }
  for (const [id, s] of Object.entries(SCENES)) {
    const src = fileOf(`${id}-source`)
    const common = { video: dataUrl(src), start: s.start || 0, duration: 3.375, prompt: s.swap, seed: 42 }
    await run(`${id}-A-product`, 'bernini_swap', { ...common, image: dataUrl(path.join(OUT, `${id}-product.png`)) }, { notMd5: md5(src) })
    await run(`${id}-B-target`, 'bernini_swap', { ...common, image: dataUrl(path.join(OUT, `${id}-target.png`)) }, { notMd5: md5(src) })
  }
} else if (stage === 'stop') {
  log(JSON.stringify(await call('POST', '/api/pod/terminate', { now: true })).slice(0, 200))
}
await spendGuard().catch((e) => log(e.message))
