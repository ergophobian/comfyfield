// Live path check: one run per bundled Comfy workflow, through the app's own routes (runFormat,
// /api/comfy/run and the Pod manager). Run only after a RunPod key and a live-generation budget are authorized.
//   node scripts/comfy-paths-live.mjs --plan                          one format per workflow, saved as plan.json (no spend)
//   node scripts/comfy-paths-live.mjs --run --allow-paid [--only=a,b] run the plan on a Pod, resuming from results.json
// Needs `npm run dev` on BASE (default http://localhost:5173). STOP_AT_USD (default 13) stops at that day's Pod spend.
// Writes to OUT (default outputs/path-check). fal steps are skipped.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import http from 'node:http'

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..')
const OUT = path.resolve(process.env.OUT || 'outputs/path-check')
const BASE = process.env.BASE || 'http://localhost:5173'
const STOP_AT_USD = Number(process.env.STOP_AT_USD || 13)
const imp = (p) => import(new URL(`../${p}`, import.meta.url))
const { formats } = await imp('src/lib/formats/index.js')
const { selectedStep } = await imp('src/lib/formats/options.js')
const { runFormat } = await imp('src/lib/formats/runner.js')
const { comfyVars } = await imp('shared/mapping.js')
const { podNeedsFor } = await imp('server/core.js')

const args = process.argv.slice(2)
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean)
const resultsFile = path.join(OUT, 'results.json')
const results = fs.existsSync(resultsFile) ? JSON.parse(fs.readFileSync(resultsFile, 'utf8')) : {}
const save = () => fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2))
const log = (...a) => { const line = `[${new Date().toISOString().slice(11, 19)}] ${a.join(' ')}`; console.log(line); fs.appendFileSync(path.join(OUT, 'run.log'), line + '\n') }

// ---- Plan: the workflows a format step can reach, and the values that reach each one.
const media = ['image', 'video', 'audio', 'draw', 'mask', 'face', 'crop', 'character', 'product', 'brand', 'voice']
function reach(format) {
  const out = []
  for (const step of format.steps) {
    if (step.type || step.provider === 'fal') continue
    const target = step.targetInput
    const keys = step.targets ? Object.keys(step.targets) : [null]
    for (const key of keys) {
      const s = selectedStep(format, step, key ? { [target]: key } : {})
      if (s.provider !== 'comfy') continue
      const choice = key ? { [target]: key } : {}
      if (s.workflow) out.push({ workflow: s.workflow, choice, withImage: false, step: step.id })
      if (s.imageWorkflow) out.push({ workflow: s.imageWorkflow, choice, withImage: true, step: step.id })
    }
  }
  return out
}
const required = (f) => f.inputs.filter((i) => !i.optional && media.includes(i.type)).length
const plan = {}
for (const f of formats) {
  const chain = f.steps.filter((s) => !s.type).length > 1
  for (const r of reach(f)) {
    const score = (chain ? 10 : 0) + required(f) + (f.writer ? 5 : 0)
    if (!plan[r.workflow] || score < plan[r.workflow].score) plan[r.workflow] = { ...r, format: f.id, chain, writer: Boolean(f.writer || f.steps.some((s) => s.type === 'writer')), score }
  }
}
// Order by the biggest model file, so one family's runs share their downloads.
const familyOf = (w) => { const files = (podNeedsFor(w).files || []).filter((f) => !f.runtime).sort((a, b) => b.gb - a.gb); return files[0]?.name || w }
const order = Object.keys(plan).sort((a, b) => familyOf(a).localeCompare(familyOf(b)) || a.localeCompare(b))

if (args.includes('--plan')) {
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify(order.map((w) => ({ workflow: w, family: familyOf(w), ...plan[w] })), null, 2))
  for (const w of order) console.log([w, plan[w].format, JSON.stringify(plan[w].choice), plan[w].withImage ? 'image' : '', plan[w].chain ? 'chain' : '', plan[w].writer ? 'writer' : '', familyOf(w)].join('\t'))
  console.log(order.length, 'workflows')
  process.exit(0)
}
if (!args.includes('--run')) { console.log('Pass --plan or --run'); process.exit(1) }
if (!args.includes('--allow-paid')) throw new Error('Live runs start a billed Pod. Pass --allow-paid only with an approved budget.')
fs.mkdirSync(OUT, { recursive: true })

// ---- HTTP helpers against the dev server.
// node:http, since fetch drops a request after 5 minutes without headers, and a run waits for Pod
// boot and downloads.
function post(url, payload) {
  const body = JSON.stringify(payload)
  return new Promise((resolve, reject) => {
    const req = http.request(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      let text = ''
      res.on('data', (c) => { text += c })
      res.on('end', () => {
        let data = {}
        try { data = JSON.parse(text) } catch {}
        if (res.statusCode >= 400) reject(Object.assign(new Error(data.error || `${url} failed (${res.statusCode})`), { code: data.code, reason: data.reason }))
        else resolve(data)
      })
    })
    req.setTimeout(0)
    req.on('error', reject)
    req.end(body)
  })
}
const get = async (url) => (await fetch(BASE + url)).json()
async function upload(file, type) {
  const res = await fetch(BASE + '/api/upload', { method: 'POST', headers: { 'Content-Type': type }, body: fs.readFileSync(file) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'upload failed')
  return data.url
}
const local = (url) => path.join(REPO, '.comfyfield', url.replace(/^\/+/, ''))
const probe = (file) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,duration,codec_type:format=duration', '-of', 'json', file]).toString())

async function spend() { const s = await get('/api/pod'); return { today: s.spend?.today ?? 0, phase: s.phase } }

// Starts one PRO 6000 Pod with the biggest disk, since H3 on FreeVideo needs 96 GB of VRAM.
let started = false
async function ensurePod() {
  if (started) return
  started = true
  const s = await get('/api/pod')
  if (s.phase === 'paused') { log('resume Pod'); await post('/api/pod/resume', {}); return }
  if (s.phase !== 'none') return
  log('start Pod')
  const out = await post('/api/pod/start', { minVramGb: 96, volumeGb: 300, gpu: { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition', cloudType: 'COMMUNITY' } })
  log('Pod', JSON.stringify(out).slice(0, 300))
}

// The app's run adapter for a Comfy step, with the Pod started up front instead of by the sheet.
async function comfyRun(model, opts) {
  const vars = comfyVars(model.kind, opts, model.sizes)
  const workflow = vars.image && model.imageWorkflow ? model.imageWorkflow : model.workflow
  hit.add(workflow)
  for (let tries = 0; ; tries++) {
    try { return (await post('/api/comfy/run', { workflow, vars })).files } catch (e) {
      if ((e.code === 'needs_pod' || e.code === 'no_pod' || e.code === 'paused') && tries < 2) { started = false; await ensurePod(); continue }
      // A run that reaches a booting Pod can ask its status server for downloads too early.
      if (/refused the model download: HTTP 404/.test(e.message) && tries < 2) { log('Pod not ready, wait'); await waitReady(); continue }
      // A dev server restart drops the open request.
      if (e.code === 'ECONNRESET' && tries < 2) { log('connection reset, retry'); await new Promise((r) => setTimeout(r, 5000)); continue }
      // One retry for anything else, such as a 405 while a first download runs. The result records it.
      // A job past its deadline still runs on the Pod, so a retry would queue the same work twice.
      if (tries < 1 && !/not terminal after/.test(e.message)) { log('retry after:', e.message); retried.push(`${workflow}: ${e.message}`); await waitReady(); continue }
      throw e
    }
  }
}
let hit = new Set()
let retried = []
async function waitReady() {
  for (let i = 0; i < 120; i++) {
    const s = await get('/api/pod').catch(() => ({}))
    // The app can carry the last Pod's ready, and its disk, over to a new Pod. A Pod boots in 5 to 8 minutes.
    if (s.phase === 'ready' && s.pod?.uptimeSec >= 360) return
    await new Promise((r) => setTimeout(r, 10000))
  }
  throw new Error('The Pod did not get ready in 20 minutes')
}

// ---- Test media, made by the first runs and saved as fixtures.json.
const fixturesFile = path.join(OUT, 'fixtures.json')
let fx = fs.existsSync(fixturesFile) ? JSON.parse(fs.readFileSync(fixturesFile, 'utf8')) : {}
async function fixtures() {
  const need = async (key, make) => { if (!fx[key]) { log('fixture', key); fx[key] = await make(); fs.writeFileSync(fixturesFile, JSON.stringify(fx, null, 2)) } }
  const t2i = (prompt, aspect) => async () => (await comfyRun({ kind: 'image', workflow: 'qwen_image21_t2i' }, { prompt, aspect, count: 1 }))[0].url
  await need('portrait', t2i('Natural light portrait photo of a woman in her thirties with short dark hair, looking at the camera, plain light gray wall behind her, head and shoulders', '4:5'))
  await need('person', t2i('Full body photo of a young man in a plain white t-shirt and blue jeans standing in a bright studio, facing the camera, white background', '9:16'))
  await need('product', t2i('Product photo of a matte black glass perfume bottle with a silver cap on a white seamless background, soft studio light', '1:1'))
  await need('scene', t2i('Photo of a quiet city street at golden hour, a cafe with outdoor tables on the left, a parked red bicycle in the center', '16:9'))
  await need('logo', t2i('A simple flat vector logo of a stylized sun with the word LUMEN below it, black on white', '1:1'))
  await need('clip', async () => (await comfyRun({ kind: 'video', workflow: 'ltx25_i2v' }, { prompt: 'The woman smiles and slowly turns her head to the left, then back to the camera, natural light', images: [fx.portrait], aspect: '4:5', duration: 5, count: 1 }))[0].url)
  await need('voice', async () => (await comfyRun({ kind: 'audio', workflow: 'chatterbox_tts' }, { prompt: 'Hi, I am testing ComfyField today. This is a short voice sample with a calm, friendly tone.', count: 1, params: { language: 'English (en)', exaggeration: 0.5, cfg_weight: 0.5 } }))[0].url)
  await need('mask', async () => {
    // White box over the center of the scene: the area to change.
    const { streams } = probe(local(fx.scene))
    const { width, height } = streams[0]
    const file = path.join(OUT, 'mask.png')
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', `color=black:s=${width}x${height}`, '-vf', `drawbox=x=${Math.round(width * 0.35)}:y=${Math.round(height * 0.35)}:w=${Math.round(width * 0.3)}:h=${Math.round(height * 0.45)}:color=white:t=fill`, '-frames:v', '1', file])
    return upload(file, 'image/png')
  })
}
const ratioOf = (url) => { const s = probe(local(url)).streams.find((x) => x.width); return `${s.width}:${s.height}` }

// Values for every visible required input, plus the image that reaches an image workflow.
function valuesFor(format, p) {
  const v = { ...p.choice }
  const pick = (i) => {
    const l = `${i.label || ''} ${i.id}`.toLowerCase()
    if (/product|bottle|item|packag/.test(l)) return fx.product
    if (/logo/.test(l)) return fx.logo
    if (/scene|background|place|room|street|location|photo to edit|layout/.test(l)) return fx.scene
    if (/body|outfit|model|person|pose|garment|cloth/.test(l)) return fx.person
    return fx.portrait
  }
  const img = (url) => ({ url, name: path.basename(url), ratio: ratioOf(url) })
  for (const i of format.inputs) {
    if (i.when && (v[i.when[0]] ?? format.inputs.find((x) => x.id === i.when[0])?.default) !== i.when[1]) continue
    const wantImage = p.withImage && i.type === 'image' && !format.inputs.some((x) => !x.optional && x.type === 'image' && x !== i && format.inputs.indexOf(x) < format.inputs.indexOf(i))
    if (i.optional && !wantImage) continue
    const url = pick(i)
    if (i.type === 'text' || i.type === 'longtext') v[i.id] = i.placeholder || i.default || `A ${format.name.toLowerCase()} test, natural light`
    else if (i.type === 'image') v[i.id] = img(url)
    // A motion drawing sends its arrows as `strokes`; a mask drawing as `maskUrl`.
    else if (i.type === 'draw' || i.type === 'mask') v[i.id] = { ...img(fx.scene), maskUrl: fx.mask, ...(i.mode === 'motion' && { strokes: fx.mask }) }
    else if (i.type === 'face') v[i.id] = { ...img(fx.portrait), faceUrl: fx.portrait }
    else if (i.type === 'crop') v[i.id] = { ...img(url), box: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 }, aspect: 'free' }
    else if (i.type === 'character') v[i.id] = { name: 'Mara', images: [fx.portrait] }
    else if (i.type === 'product') v[i.id] = { name: 'Noir perfume', images: [fx.product] }
    else if (i.type === 'brand') v[i.id] = { name: 'Lumen', url: fx.logo, images: [fx.logo] }
    else if (i.type === 'voice') v[i.id] = { name: 'Test voice', sample: fx.voice }
    else if (i.type === 'audio') v[i.id] = { url: fx.voice, name: 'voice.flac' }
    else if (i.type === 'video') {
      const d = parseFloat(probe(local(fx.clip)).format.duration)
      v[i.id] = { ...img(fx.clip), duration: d, trim: { start: 0, end: d }, posterUrl: fx.portrait, posterTime: 0 }
    }
  }
  return v
}

// A stand-in for the Google prompt writer, which has no key this round.
const writePrompt = async ({ format, note }) => `${format.blurb || format.name}. ${note || ''} Natural light, clear subject, realistic detail.`.trim()

// ---- Run.
const first = await get('/api/pod')
if (first.phase !== 'none') { log('wait for Pod'); await waitReady() }
await fixtures()
for (const w of order) {
  if (only.length && !only.includes(w)) continue
  if (results[w]?.status === 'pass' || results[w]?.status === 'fail') continue
  const s = await spend()
  if (s.today >= STOP_AT_USD) { log(`stop: spend $${s.today.toFixed(2)} reached $${STOP_AT_USD}`); break }
  const p = plan[w]
  const format = formats.find((f) => f.id === p.format)
  hit = new Set()
  retried = []
  const t0 = Date.now()
  log('run', w, 'via', p.format, JSON.stringify(p.choice), p.withImage ? '+image' : '')
  try {
    const values = valuesFor(format, p)
    const session = await runFormat(format, values, { run: (model, opts) => comfyRun(model, opts), writePrompt })
    // Writer steps wait for Send, as in the app.
    for (const n of session.flow.nodes.filter((n) => n.type === 'writer')) await session.sendWriter(n.id)
    const files = session.results()
    const dir = path.join(OUT, 'outputs', w)
    fs.mkdirSync(dir, { recursive: true })
    const saved = files.filter((f) => f.url).map((f) => {
      const src = local(f.url)
      const dest = path.join(dir, path.basename(src))
      if (fs.existsSync(src)) fs.copyFileSync(src, dest)
      return { url: f.url, kind: f.kind, file: dest }
    })
    results[w] = { status: saved.length ? 'pass' : 'fail', format: p.format, choice: p.choice, seconds: Math.round((Date.now() - t0) / 1000), workflows: [...hit], files: saved, writerStub: p.writer, retried, error: saved.length ? null : 'No output files' }
  } catch (e) {
    results[w] = { status: 'fail', format: p.format, choice: p.choice, seconds: Math.round((Date.now() - t0) / 1000), workflows: [...hit], retried, error: e.message, code: e.code || null }
  }
  save()
  log(results[w].status, w, `${results[w].seconds}s`, results[w].error || '', `spend $${(await spend()).today.toFixed(2)}`)
}
log('done', JSON.stringify(Object.values(results).reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {})))
