// Live test of FastH3 Omni (fasth3_omni_r2v) on a Pod, against base H3 on the same graph (h3_omni_r2v).
// Each case runs through the app's own /api/comfy/run, so it tests the real Pod path and model downloads.
//   node scripts/fasth3-live.mjs --plan                       list the cases and the media they use (no spend)
//   node scripts/fasth3-live.mjs --run --allow-paid [--only=a,b] [--pics=a.png,b.jpg] [--clip=c.mp4] [--voice=v.wav]
// Without --pics the run uses the ComfyUI template's own reference picture. The clip and voice cases run
// only when you pass --clip and --voice. Needs `npm run dev` on BASE (default http://localhost:5173).
// STOP_AT_USD (default 5) stops at that day's Pod spend. Writes to OUT (default outputs/fasth3).
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { execFileSync } from 'node:child_process'

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..')
const OUT = path.resolve(process.env.OUT || 'outputs/fasth3')
const BASE = process.env.BASE || 'http://localhost:5173'
const STOP_AT_USD = Number(process.env.STOP_AT_USD || 5)
const TEMPLATE_PICTURE = 'https://raw.githubusercontent.com/Comfy-Org/workflow_templates/refs/heads/main/input/yellow_plane_ref.png'

const args = process.argv.slice(2)
const flag = (name) => (args.find((a) => a.startsWith(`--${name}=`)) || '').slice(name.length + 3)
const only = flag('only').split(',').filter(Boolean)
const pics = flag('pics').split(',').filter(Boolean)
const clip = flag('clip')
const voice = flag('voice')

// The template's own prompt for its plane picture, so the first case is a known-good run.
const planePrompt = 'A 5-second, multi-cut cinematic aviation film. [Shot 1] A wide shot matches <Picture 1>: the yellow propeller plane climbs straight up above the towering cumulus cloud, smoke trail curling, and the camera tilts up with it. [Shot 2] At 00:02.000, the shot cuts to a close-up of the propeller and yellow nose as it slows at the top; the plane stalls, flips over and the camera follows it diving toward the bright cloud. Sound: straining engine, wind, a sudden silence at the stall and a roaring dive, with tense rising strings.'
const userPrompt = (n) => `${Array.from({ length: n }, (_, i) => `<Picture ${i + 1}>`).join(', ')} are the references. Keep every person, product and place exactly as shown in them. A handheld cinematic shot that brings them together in one scene, with natural light and real sound.`

const cases = [
  { id: 'fast-1pic-5s', workflow: 'fasth3_omni_r2v', pictures: 1, seconds: 5 },
  { id: 'base-1pic-5s', workflow: 'h3_omni_r2v', pictures: 1, seconds: 5, note: 'Base H3, 20 steps, same graph, picture, prompt and seed.' },
  { id: 'fast-1pic-15s', workflow: 'fasth3_omni_r2v', pictures: 1, seconds: 15 },
  { id: 'fast-9pic-10s', workflow: 'fasth3_omni_r2v', pictures: 9, seconds: 10, needsPics: 2 },
  { id: 'fast-clip-voice-10s', workflow: 'fasth3_omni_r2v', pictures: 1, seconds: 10, clip: true, voice: true },
]

const log = (...a) => { const line = `[${new Date().toISOString().slice(11, 19)}] ${a.join(' ')}`; console.log(line); fs.appendFileSync(path.join(OUT, 'run.log'), line + '\n') }
fs.mkdirSync(OUT, { recursive: true })

function runnable(c) {
  if (c.needsPics && pics.length < c.needsPics) return `needs --pics with ${c.needsPics} or more pictures`
  if (c.clip && !clip) return 'needs --clip'
  if (c.voice && !voice) return 'needs --voice'
  return null
}

if (args.includes('--plan')) {
  for (const c of cases) console.log([c.id, c.workflow, `${c.pictures} pic`, `${c.seconds}s`, c.clip ? 'clip' : '', c.voice ? 'voice' : '', runnable(c) || 'ready'].join('\t'))
  process.exit(0)
}
if (!args.includes('--run')) { console.log('Pass --plan or --run'); process.exit(1) }
if (!args.includes('--allow-paid')) throw new Error('Live runs start a billed Pod. Pass --allow-paid only with an approved budget.')

// ---- HTTP helpers against the dev server. node:http, since fetch drops a request after 5 minutes
// without headers, and a first run waits for the Pod to download about 44 GB of models.
function post(url, payload) {
  const body = JSON.stringify(payload)
  return new Promise((resolve, reject) => {
    const req = http.request(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      let text = ''
      res.on('data', (c) => { text += c })
      res.on('end', () => {
        let data = {}
        try { data = JSON.parse(text) } catch {}
        if (res.statusCode >= 400) reject(Object.assign(new Error(data.error || `${url} failed (${res.statusCode})`), { code: data.code }))
        else resolve(data)
      })
    })
    req.setTimeout(0)
    req.on('error', reject)
    req.end(body)
  })
}
const get = async (url) => (await fetch(BASE + url)).json()
const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.flac': 'audio/flac' }
async function upload(file) {
  const res = await fetch(BASE + '/api/upload', { method: 'POST', headers: { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' }, body: fs.readFileSync(file) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `upload of ${file} failed`)
  return data.url
}
const local = (url) => path.join(REPO, '.comfyfield', url.replace(/^\/+/, ''))
const probe = (file) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', file]).toString())
const spend = async () => (await get('/api/pod')).spend?.today ?? 0

// FastH3 Omni shares H3's NVFP4 text encoder, so the Pod must be Blackwell. One PRO 6000 takes every case.
async function ensurePod() {
  const s = await get('/api/pod')
  if (s.phase === 'paused') { log('resume Pod'); await post('/api/pod/resume', {}) } else if (s.phase === 'none') {
    log('start Pod')
    await post('/api/pod/start', { minVramGb: 48, volumeGb: 150, gpu: { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition', cloudType: 'COMMUNITY' } })
  }
  for (let i = 0; i < 120; i++) {
    const p = await get('/api/pod').catch(() => ({}))
    if (p.phase === 'ready') return
    await new Promise((r) => setTimeout(r, 10000))
  }
  throw new Error('The Pod did not get ready in 20 minutes')
}

// ---- Media.
let pictureUrls = []
if (pics.length) pictureUrls = await Promise.all(pics.map(upload))
else {
  const file = path.join(OUT, 'yellow_plane_ref.png')
  if (!fs.existsSync(file)) fs.writeFileSync(file, Buffer.from(await (await fetch(TEMPLATE_PICTURE)).arrayBuffer()))
  pictureUrls = [await upload(file)]
}
const clipUrl = clip ? await upload(clip) : null
const voiceUrl = voice ? await upload(voice) : null

// ---- Run.
const resultsFile = path.join(OUT, 'results.json')
const results = fs.existsSync(resultsFile) ? JSON.parse(fs.readFileSync(resultsFile, 'utf8')) : {}
await ensurePod()
for (const c of cases) {
  if (only.length && !only.includes(c.id)) continue
  const skip = runnable(c)
  if (skip) { log('skip', c.id, skip); continue }
  if (results[c.id]?.status === 'pass') continue
  const today = await spend()
  if (today >= STOP_AT_USD) { log(`stop: spend $${today.toFixed(2)} reached $${STOP_AT_USD}`); break }
  const n = Math.min(c.pictures, pictureUrls.length)
  const refs = pictureUrls.slice(0, n)
  let prompt = pics.length ? userPrompt(n) : planePrompt
  // The clip goes in with its sound, which takes <Audio 1>, so the voice is <Audio 2>.
  if (c.clip) prompt += ' Move the camera the way <Video 1> moves, over the sound of <Audio 1>.'
  if (c.voice) prompt += ` One person speaks a short line in the voice of <Audio ${c.clip ? 2 : 1}>.`
  const vars = {
    prompt, width: 1344, height: 768, seconds: c.seconds, duration: c.seconds, seed: 771204598,
    ...Object.fromEntries(['image', 'image2', 'image3', 'image4', 'image5', 'image6', 'image7', 'image8', 'image9'].map((k, i) => [k, refs[i]])),
    // The clip's own length, so the graph takes all of it (up to 15 s).
    clipvideo: c.clip ? clipUrl : undefined, start: 0, ...(c.clip && { duration: Number(probe(clip).format.duration) }), audio: c.voice ? voiceUrl : undefined,
  }
  log('run', c.id)
  const t0 = Date.now()
  try {
    const { files } = await post('/api/comfy/run', { workflow: c.workflow, vars })
    const seconds = Math.round((Date.now() - t0) / 1000)
    const saved = files.filter((f) => f.url).map((f) => {
      const dest = path.join(OUT, `${c.id}${path.extname(f.url)}`)
      fs.copyFileSync(local(f.url), dest)
      const p = probe(dest)
      return { file: dest, length: Number(p.format.duration).toFixed(2), audio: p.streams.some((s) => s.codec_type === 'audio'), size: p.streams.filter((s) => s.width).map((s) => `${s.width}x${s.height}`)[0] }
    })
    results[c.id] = { status: saved.length ? 'pass' : 'fail', workflow: c.workflow, seconds, files: saved, note: c.note || null }
  } catch (e) {
    results[c.id] = { status: 'fail', workflow: c.workflow, seconds: Math.round((Date.now() - t0) / 1000), error: e.message, code: e.code || null }
  }
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2))
  log(results[c.id].status, c.id, `${results[c.id].seconds}s`, results[c.id].error || '', `spend $${(await spend()).toFixed(2)}`)
}
// The first run on a fresh Pod includes the model downloads, so compare runs after it.
log('done. Wall time includes the queue, model loading and the upload of the result.')
