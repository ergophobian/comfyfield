// Provider logic for ComfyField, independent of Vite. Used by the dev server, the CLI and the MCP server.
// Keys live in .comfyfield/keys.json under COMFYFIELD_HOME (default: the current directory).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { models as pinned, falCategories } from '../src/lib/catalog.js'
import { comfyVars, falInput, estimate, fill } from '../shared/mapping.js'
import { renderStitch } from './stitch.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const providers = {
  comfy: { env: ['COMFY_URL', 'COMFY_API_KEY'], fields: ['url', 'key'] },
  fal: { env: ['FAL_KEY'], fields: ['key'] },
  google: { env: ['GEMINI_API_KEY'], fields: ['key'] },
  elevenlabs: { env: ['ELEVENLABS_API_KEY'], fields: ['key'] },
}

export const home = () => path.resolve(process.env.COMFYFIELD_HOME || '.', '.comfyfield')
const mediaDir = () => path.join(home(), 'media')

export function readKeys() {
  try { return JSON.parse(fs.readFileSync(path.join(home(), 'keys.json'), 'utf8')) } catch { return {} }
}

export function writeKeys(keys) {
  fs.mkdirSync(home(), { recursive: true })
  fs.writeFileSync(path.join(home(), 'keys.json'), JSON.stringify(keys, null, 2), { mode: 0o600 })
}

// Saved keys win; environment variables are the fallback.
export function config(id) {
  const saved = readKeys()[id] || {}
  const { env, fields } = providers[id]
  return Object.fromEntries(fields.map((f, i) => [f, saved[f] || process.env[env[i]] || '']))
}

export const mask = (v) => (v ? `${v.slice(0, 4)}…${v.slice(-4)}` : '')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function mimeExt(mime) {
  const t = (mime || '').split('/')[1]?.split(';')[0] || 'png'
  return t === 'jpeg' ? 'jpg' : t === 'svg+xml' ? 'svg' : t.replace(/[^a-z0-9]/gi, '') || 'png'
}

// Reads one of our saved files back by its /media/... URL.
export function readLocal(url) {
  const m = /^data:([^;,]+);base64,(.*)$/s.exec(url)
  if (m) return { buf: Buffer.from(m[2], 'base64'), mime: m[1] }
  const file = mediaPath(url)
  if (!fs.existsSync(file)) throw Object.assign(new Error('An attached image is missing. Attach it again.'), { status: 400 })
  return { buf: fs.readFileSync(file), mime: mediaTypes[path.extname(file).slice(1).toLowerCase()] || 'image/png' }
}

// Uploads go to fal storage so fal can fetch them: initiate, PUT the bytes, use the returned file_url.
// If storage is unavailable the file is sent inline as a data URI, which fal also accepts.
async function falUpload(buf, mime, key) {
  const init = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3', {
    method: 'POST', headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_type: mime, file_name: `upload.${mimeExt(mime)}` }),
  })
  if (!init.ok) throw new Error(`fal storage refused the upload (${init.status})`)
  const { upload_url, file_url } = await init.json()
  const put = await fetch(upload_url, { method: 'PUT', headers: { 'Content-Type': mime }, body: buf })
  if (!put.ok) throw new Error(`fal storage upload failed (${put.status})`)
  return file_url
}

const dataUri = (buf, mime) => `data:${mime};base64,${buf.toString('base64')}`

// Replaces our local /media/... URLs anywhere in a fal input with URLs fal can reach.
async function withFalFiles(value, key, cache = new Map()) {
  if (Array.isArray(value)) return Promise.all(value.map((v) => withFalFiles(v, key, cache)))
  if (value && typeof value === 'object') {
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([k, v]) => [k, await withFalFiles(v, key, cache)])))
  }
  if (typeof value !== 'string' || !value.startsWith('/media/')) return value
  if (!cache.has(value)) {
    cache.set(value, (async () => {
      const file = readLocal(value)
      return falUpload(file.buf, file.mime, key).catch(() => dataUri(file.buf, file.mime))
    })())
  }
  return cache.get(value)
}

// fal queue API: submit, poll status, then fetch the result.
export async function runFal({ model, input }) {
  const { key } = config('fal')
  if (!key) throw Object.assign(new Error('Connect fal in Connections first.'), { status: 400 })
  const headers = { Authorization: `Key ${key}`, 'Content-Type': 'application/json' }
  const ready = await withFalFiles(input, key)
  const submit = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers, body: JSON.stringify(ready) })
  if (!submit.ok) throw new Error(`fal rejected the request (${submit.status}): ${(await submit.text()).slice(0, 300)}`)
  const job = await submit.json()
  for (let i = 0; i < 600; i++) {
    const s = await (await fetch(job.status_url, { headers })).json()
    if (s.status === 'COMPLETED') break
    if (s.status === 'FAILED' || s.error) throw new Error(`fal job failed: ${s.error || 'unknown error'}`)
    await sleep(2000)
  }
  const out = await (await fetch(job.response_url, { headers })).json()
  const files = []
  for (const img of out.images || []) files.push({ url: img.url, kind: 'image' })
  if (out.image?.url) files.push({ url: out.image.url, kind: 'image' })
  if (out.video?.url) files.push({ url: out.video.url, kind: 'video' })
  for (const v of out.videos || []) files.push({ url: v.url, kind: 'video' })
  if (out.audio?.url) files.push({ url: out.audio.url, kind: 'audio' })
  if (out.audio_file?.url) files.push({ url: out.audio_file.url, kind: 'audio' })
  if (!files.length) throw new Error('fal finished but returned no media.')
  return files
}

// fal's public catalog, cached for ten minutes per query.
const catalogCache = new Map()
export async function falModels(query) {
  const hit = catalogCache.get(query)
  if (hit && Date.now() - hit.at < 600_000) return hit.data
  const r = await fetch(`https://api.fal.ai/v1/models?${query}`)
  if (!r.ok) throw new Error(`fal catalog unavailable (${r.status})`)
  const data = await r.json()
  catalogCache.set(query, { at: Date.now(), data })
  return data
}

// Input fields of one fal model, read from its OpenAPI schema.
export async function falSchema(id) {
  const r = await fetch(`https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=${encodeURIComponent(id)}`)
  if (!r.ok) throw new Error(`No schema for ${id}`)
  const doc = await r.json()
  const schemas = doc.components?.schemas || {}
  const ref = doc.paths?.[`/${id}`]?.post?.requestBody?.content?.['application/json']?.schema?.$ref
  const input = (ref && schemas[ref.split('/').pop()]) || Object.entries(schemas).find(([k]) => k.endsWith('Input'))?.[1] || {}
  const resolve = (p) => (p?.$ref ? schemas[p.$ref.split('/').pop()] : p?.anyOf ? resolve(p.anyOf.find((x) => x.enum || x.$ref) || p.anyOf[0]) : p) || {}
  const props = Object.fromEntries(Object.entries(input.properties || {}).map(([k, v]) => {
    const r2 = resolve(v)
    return [k, { type: v.type || r2.type, enum: v.enum || r2.enum, default: v.default }]
  }))
  return { properties: props, required: input.required || [] }
}

// ElevenLabs: speech for voice ids, sound effects otherwise. Saves the mp3 locally.
export async function runElevenLabs({ mode, text, voice }) {
  const { key } = config('elevenlabs')
  if (!key) throw Object.assign(new Error('Connect ElevenLabs in Connections first.'), { status: 400 })
  const url = mode === 'speech'
    ? `https://api.elevenlabs.io/v1/text-to-speech/${voice || '21m00Tcm4TlvDq8ikWAM'}`
    : 'https://api.elevenlabs.io/v1/sound-generation'
  const payload = mode === 'speech' ? { text, model_id: 'eleven_multilingual_v2' } : { text }
  const r = await fetch(url, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify(payload) })
  if (!r.ok) throw new Error(`ElevenLabs rejected the request (${r.status}): ${(await r.text()).slice(0, 300)}`)
  return [{ ...saveMedia(Buffer.from(await r.arrayBuffer()), 'mp3'), kind: 'audio' }]
}

export function saveMedia(buf, ext) {
  fs.mkdirSync(mediaDir(), { recursive: true })
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const file = path.join(mediaDir(), name)
  fs.writeFileSync(file, buf)
  return { url: `/media/${name}`, path: file }
}

// Gemini TTS returns raw 16-bit PCM at 24 kHz; wrap it in a WAV header so browsers can play it.
function pcmToWav(pcm, rate = 24000) {
  const h = Buffer.alloc(44)
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8)
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22)
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34)
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([h, pcm])
}

const GEMINI = 'https://generativelanguage.googleapis.com/v1beta'

// The Router lane can replace this stub without changing the writer contract.
export async function writePromptWithRouter() {
  throw Object.assign(new Error('Connect Google AI to write a prompt. Comfy Router prompt writing is not wired yet.'), { status: 501 })
}

export async function writePrompt({ instructions, note = '', images = [], target = '' }) {
  if (typeof instructions !== 'string' || !instructions.trim()) {
    throw Object.assign(new Error('Add writer instructions first.'), { status: 400 })
  }
  if (typeof note !== 'string' || typeof target !== 'string' || !Array.isArray(images) || images.some((u) => typeof u !== 'string' || !/^(data:image\/|\/media\/)/.test(u))) {
    throw Object.assign(new Error('Writer needs a note, a target and local or inline images.'), { status: 400 })
  }
  const request = { instructions, note, images, target }
  const { key } = config('google')
  if (!key) return writePromptWithRouter(request)
  const parts = images.map((url) => {
    const { buf, mime } = readLocal(url)
    if (!/^image\/(png|jpeg|webp|gif)$/.test(mime)) {
      throw Object.assign(new Error('Writer accepts PNG, JPG, WebP or GIF images.'), { status: 415 })
    }
    return { inlineData: { mimeType: mime, data: buf.toString('base64') } }
  })
  parts.push({ text: [target && `Target model or medium: ${target}`, note && `User note: ${note}`, 'Write only the finished generation prompt.'].filter(Boolean).join('\n\n') })
  const r = await fetch(`${GEMINI}/models/gemini-flash-latest:generateContent`, {
    method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: instructions }] }, contents: [{ role: 'user', parts }] }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error?.message || `Google prompt writing failed (${r.status})`)
  const candidate = data.candidates?.[0]
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') throw new Error('Google did not finish the prompt. Try again or adjust the instructions.')
  const text = (candidate?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join('').trim()
  if (!text) throw new Error('Google returned no prompt. The request may have been filtered.')
  return text
}

// Google AI (Gemini API key): image and speech via generateContent, Veo via a long-running operation.
export async function runGoogle({ model, mode, prompt, aspect, count = 1, duration, images = [] }) {
  const { key } = config('google')
  if (!key) throw Object.assign(new Error('Connect Google AI in Connections first.'), { status: 400 })
  const headers = { 'x-goog-api-key': key, 'Content-Type': 'application/json' }
  const call = async (url, payload) => {
    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`Google rejected the request (${r.status}): ${data.error?.message || ''}`)
    return data
  }

  const inline = images.map((u) => {
    const f = readLocal(u)
    return { mimeType: f.mime, data: f.buf.toString('base64') }
  })

  if (mode === 'video') {
    const parameters = { aspectRatio: aspect === '9:16' ? '9:16' : '16:9' }
    if (duration) parameters.durationSeconds = duration
    let op = await call(`${GEMINI}/models/${model}:predictLongRunning`, {
      instances: [inline[0] ? { prompt, image: { bytesBase64Encoded: inline[0].data, mimeType: inline[0].mimeType } } : { prompt }], parameters,
    })
    for (let i = 0; i < 180 && !op.done; i++) {
      await sleep(5000)
      op = await (await fetch(`${GEMINI}/${op.name}`, { headers })).json()
    }
    if (op.error) throw new Error(`Veo failed: ${op.error.message}`)
    const samples = op.response?.generateVideoResponse?.generatedSamples || []
    if (!samples.length) throw new Error('Veo finished without a video. The prompt may have been filtered.')
    const files = []
    for (const smp of samples) {
      const v = await fetch(smp.video.uri, { headers: { 'x-goog-api-key': key } })
      files.push({ ...saveMedia(Buffer.from(await v.arrayBuffer()), 'mp4'), kind: 'video' })
    }
    return files
  }

  const generationConfig = mode === 'speech'
    ? { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
    : { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } }
  const runs = mode === 'speech' ? 1 : count
  const files = []
  for (let i = 0; i < runs; i++) {
    const data = await call(`${GEMINI}/models/${model}:generateContent`, { contents: [{ parts: [...inline.map((inlineData) => ({ inlineData })), { text: prompt }] }], generationConfig })
    for (const part of data.candidates?.[0]?.content?.parts || []) {
      if (!part.inlineData) continue
      const buf = Buffer.from(part.inlineData.data, 'base64')
      if (mode === 'speech') files.push({ ...saveMedia(pcmToWav(buf), 'wav'), kind: 'audio' })
      else files.push({ ...saveMedia(buf, part.inlineData.mimeType.split('/')[1] || 'png'), kind: 'image' })
    }
  }
  if (!files.length) throw new Error('Google returned no media. The prompt may have been filtered.')
  return files
}

export const mediaTypes = { mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m4a: 'audio/mp4', ogg: 'audio/ogg', flac: 'audio/flac', png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon' }

// Thumbnails and prices for specific fal endpoints. Prices need a fal key; thumbnails do not.
export async function falMeta(ids) {
  const q = ids.map((id) => `endpoint_id=${encodeURIComponent(id)}`).join('&')
  const out = Object.fromEntries(ids.map((id) => [id, {}]))
  const meta = await fetch(`https://api.fal.ai/v1/models?${q}`).then((r) => r.json()).catch(() => ({}))
  for (const m of meta.models || []) out[m.endpoint_id] = { thumb: m.metadata?.thumbnail_url, description: m.metadata?.description }
  const { key } = config('fal')
  if (key) {
    const pr = await fetch(`https://api.fal.ai/v1/models/pricing?${q}`, { headers: { Authorization: `Key ${key}` } }).then((r) => r.json()).catch(() => ({}))
    for (const p of pr.prices || []) out[p.endpoint_id].price = { amount: p.unit_price, unit: p.unit }
  }
  return out
}

// What each provider lets us read about remaining balance.
export async function balances() {
  const out = {}
  const fal = config('fal').key
  if (fal) {
    const r = await fetch('https://api.fal.ai/v1/account/billing?expand=credits', { headers: { Authorization: `Key ${fal}` } })
    const d = await r.json().catch(() => ({}))
    const credits = d.credits?.current_balance ?? d.credits?.balance
    out.fal = r.ok && credits != null ? { usd: credits } : { note: 'Needs an admin key to show balance' }
  }
  const el = config('elevenlabs').key
  if (el) {
    const d = await fetch('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': el } }).then((r) => r.json()).catch(() => ({}))
    out.elevenlabs = d.character_limit ? { left: d.character_limit - d.character_count, unit: 'characters' } : { note: 'Key cannot read usage (needs user_read)' }
  }
  if (config('google').key) out.google = { note: 'Billed to your Google Cloud account' }
  return out
}

// Turns one idea into N distinct prompts with a cheap Gemini text model.
export async function writePrompts({ idea, n = 6, kind = 'video' }) {
  const { key } = config('google')
  if (!key) throw Object.assign(new Error('Connect Google AI to write prompts with AI.'), { status: 400 })
  const ask = `Write ${n} distinct ${kind} generation prompts for this idea: "${idea}". Vary subject, setting, camera and mood. Each prompt is one vivid sentence under 40 words. Return only a JSON array of strings.`
  const r = await fetch(`${GEMINI}/models/gemini-flash-latest:generateContent`, {
    method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: ask }] }], generationConfig: { responseMimeType: 'application/json' } }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error?.message || 'Gemini request failed')
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
  const list = JSON.parse(text)
  return Array.isArray(list) ? list.map(String).slice(0, n) : []
}

export async function testConnection(id) {
  const c = config(id)
  if (id === 'comfy') {
    const r = await fetch(`${c.url || 'http://127.0.0.1:8188'}/system_stats`, { headers: c.key ? { 'X-API-Key': c.key } : {} })
    return r.ok
  }
  if (id === 'google') {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(c.key)}`)
    return r.ok
  }
  if (id === 'elevenlabs') {
    // Restricted keys often lack user_read, so check with the models list instead.
    const r = await fetch('https://api.elevenlabs.io/v1/models', { headers: { 'xi-api-key': c.key } })
    return r.ok
  }
  if (id === 'fal') return Boolean(c.key) // fal has no free auth-check endpoint
  return false
}

export const mediaPath = (name) => path.join(mediaDir(), path.basename(name))

const stitchIndex = () => path.join(home(), 'stitch', 'index.json')
function readStitches() {
  try { return JSON.parse(fs.readFileSync(stitchIndex(), 'utf8')) } catch { return [] }
}
function writeStitches(items) {
  fs.mkdirSync(path.dirname(stitchIndex()), { recursive: true })
  fs.writeFileSync(stitchIndex(), JSON.stringify(items, null, 2))
}

export const stitchedExports = () => readStitches().filter((item) => item.exported)

export function dismissStitch(url) {
  writeStitches(readStitches().map((item) => item.url === url ? { ...item, exported: false } : item))
}

export function exportStitch(url) {
  const items = readStitches()
  const item = items.find((item) => item.url === url)
  if (!item || !fs.existsSync(item.path)) throw Object.assign(new Error('Render a Stitch preview first.'), { status: 400 })
  const saved = { ...item, exported: true }
  writeStitches(items.map((item) => item.url === url ? saved : item))
  return saved
}

export async function stitch({ preview = false, ...options } = {}) {
  const file = await renderStitch(options, { home, mediaPath })
  const item = { ...file, id: path.basename(file.path), model: 'Stitch', caption: 'Stitched video', created: Date.now(), exported: !preview }
  writeStitches([item, ...readStitches()])
  return item
}

export function connections() {
  return Object.fromEntries(Object.keys(providers).map((id) => {
    const c = config(id)
    return [id, { connected: Boolean(id === 'comfy' ? c.url || c.key : c.key), url: c.url, key: mask(c.key) }]
  }))
}

export function saveConnection(id, values) {
  if (!providers[id]) throw Object.assign(new Error('Unknown provider'), { status: 400 })
  const keys = readKeys()
  keys[id] = { ...keys[id], ...values }
  writeKeys(keys)
}

const comfyBase = () => config('comfy').url || 'http://127.0.0.1:8188'
const comfyHeaders = () => (config('comfy').key ? { 'X-API-Key': config('comfy').key } : {})

// Runs a bundled workflow on the user's ComfyUI and returns absolute file URLs.
export async function runComfy(workflow, vars) {
  const file = path.join(ROOT, 'public', 'workflows', `${workflow}.json`)
  if (!fs.existsSync(file)) throw new Error(`Workflow ${workflow} not found`)
  const graph = fill(JSON.parse(fs.readFileSync(file, 'utf8')), vars)
  const base = comfyBase()
  const headers = { 'Content-Type': 'application/json', ...comfyHeaders() }
  let res
  try {
    res = await fetch(`${base}/prompt`, { method: 'POST', headers, body: JSON.stringify({ prompt: graph, client_id: 'comfyfield' }) })
  } catch {
    throw new Error('Could not reach ComfyUI. Check the URL in Connections.')
  }
  if (!res.ok) throw new Error(`ComfyUI rejected the workflow (${res.status}). ${(await res.text().catch(() => '')).slice(0, 200)}`)
  const id = (await res.json()).prompt_id
  for (let i = 0; i < 1200; i++) {
    const h = await fetch(`${base}/history/${id}`, { headers: comfyHeaders() })
    if (h.ok) {
      const entry = (await h.json())[id]
      if (entry?.status?.status_str === 'error') throw new Error('Generation failed in ComfyUI')
      if (entry?.outputs && Object.keys(entry.outputs).length) return collectComfy(base, entry.outputs)
    }
    await sleep(1500)
  }
  throw new Error('ComfyUI took too long.')
}

function collectComfy(base, outputs) {
  const files = []
  for (const out of Object.values(outputs)) {
    for (const f of [...(out.images || []), ...(out.gifs || []), ...(out.videos || [])]) {
      const q = new URLSearchParams({ filename: f.filename, subfolder: f.subfolder || '', type: f.type || 'output' })
      files.push({ url: `${base}/view?${q}`, kind: /\.(mp4|webm|mov)$/i.test(f.filename) ? 'video' : 'image', name: f.filename })
    }
  }
  return files
}

const fileDataUri = (p) => {
  const ext = path.extname(p).slice(1).toLowerCase()
  const type = mediaTypes[ext] || 'application/octet-stream'
  return `data:${type};base64,${fs.readFileSync(p).toString('base64')}`
}

// Resolves a catalog id, a short alias, or fal:<endpoint> to a model record.
export function resolveModel(id) {
  const hit = pinned.find((m) => m.id === id || m.id === `fal:${id}` || m.model === id)
  if (hit) return hit
  if (id.startsWith('fal:')) return { id, kind: 'unknown', provider: 'fal', name: id.slice(4), model: id.slice(4) }
  throw new Error(`Unknown model ${id}. Use list_models, or fal:<endpoint> for any fal model.`)
}

export async function listModels({ kind, query, includeFal = true, limit = 25 } = {}) {
  const out = pinned.filter((m) => !kind || m.kind === kind).map((m) => ({
    id: m.id, kind: m.kind, provider: m.provider, name: m.name, note: m.note, pinned: true, durations: m.durations,
  }))
  if (includeFal && (query || kind)) {
    const cats = kind ? falCategories.filter((c) => c.kind === kind) : falCategories
    for (const c of cats) {
      const params = new URLSearchParams({ category: c.id, limit: String(limit) })
      if (query) params.set('q', query)
      const data = await falModels(params.toString()).catch(() => ({ models: [] }))
      for (const m of data.models || []) {
        if (m.metadata?.status === 'deprecated' || out.some((x) => x.id === `fal:${m.endpoint_id}`)) continue
        out.push({ id: `fal:${m.endpoint_id}`, kind: c.kind, provider: 'fal', name: m.metadata?.display_name || m.endpoint_id, note: m.metadata?.description?.slice(0, 120), pinned: false })
      }
    }
  }
  return out
}

// One generation on any model. `image` is a URL or a local file path (sent to fal as a data URI).
export async function generate({ model, prompt, aspect = '16:9', count = 1, duration, image }) {
  if (!prompt) throw new Error('A prompt is required.')
  const m = resolveModel(model)
  const o = { prompt, aspect, count, duration, image: image && !/^(https?:|data:|\/media\/)/.test(image) ? fileDataUri(image) : image }
  if (m.provider === 'comfy') return runComfy(m.workflow, comfyVars(m.kind, { ...o, duration: duration || 5 }))
  if (m.provider === 'fal') {
    const { properties } = await falSchema(m.model)
    return runFal({ model: m.model, input: falInput(properties, o) })
  }
  if (m.provider === 'google') return runGoogle({ model: m.model, mode: m.mode, prompt, aspect, count, duration })
  if (m.provider === 'elevenlabs') return runElevenLabs({ mode: m.mode, text: prompt })
  throw new Error(`${m.provider} is not wired up yet.`)
}

// Rough cost before running; null when the price is unknown.
export async function estimateCost({ model, aspect = '16:9', count = 1, duration }) {
  const m = resolveModel(model)
  const meta = m.provider === 'fal' ? (await falMeta([m.model]).catch(() => ({})))[m.model] : { price: m.price }
  return estimate(m, meta, { aspect, count, duration })
}

// Copies generated files into a folder. Remote URLs are downloaded; local media is copied.
export async function saveFiles(files, dir) {
  fs.mkdirSync(dir, { recursive: true })
  const saved = []
  for (const [i, f] of files.entries()) {
    if (f.path) {
      const dest = path.join(dir, path.basename(f.path))
      fs.copyFileSync(f.path, dest)
      saved.push(dest)
      continue
    }
    const r = await fetch(f.url, { headers: f.url.startsWith(comfyBase()) ? comfyHeaders() : {} })
    if (!r.ok) throw new Error(`Download failed (${r.status}) for ${f.url}`)
    const ext = path.extname(new URL(f.url).pathname).slice(1) || (f.kind === 'video' ? 'mp4' : f.kind === 'audio' ? 'mp3' : 'png')
    const dest = path.join(dir, `${Date.now()}-${i + 1}.${ext}`)
    fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()))
    saved.push(dest)
  }
  return saved
}
