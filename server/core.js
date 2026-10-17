// Provider logic for ComfyField, independent of Vite. Used by the dev server, the CLI and the MCP server.
// Keys live in .comfyfield/keys.json under COMFYFIELD_HOME (default: the current directory).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { Comfy } from '@comfyorg/sdk'
import { models as pinned, falCategories } from '../src/lib/catalog.js'
import { comfyVars, comfyRouterInput, falInput, estimate, fill } from '../shared/mapping.js'
import { modelFilesOf, minVramOf, notOnCloud, volumeFor } from '../shared/modelFiles.js'

import { podManager } from './pod.js'
import { sandboxFetch } from './podSandbox.js'

export { podBootScript, podStartCmd } from './podBoot.js'
export { GPU_LADDER, NO_POD } from './pod.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const providers = {
  comfy: { env: ['COMFY_URL', 'COMFY_API_KEY', 'COMFY_MODE'], fields: ['url', 'key', 'mode'] },
  fal: { env: ['FAL_KEY'], fields: ['key'] },
  google: { env: ['GEMINI_API_KEY'], fields: ['key'] },
  elevenlabs: { env: ['ELEVENLABS_API_KEY'], fields: ['key'] },
  runpod: { env: ['RUNPOD_API_KEY', 'RUNPOD_DAILY_CAP'], fields: ['key', 'cap'] },
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

// The one Pod manager for this process. COMFYFIELD_POD_SANDBOX swaps RunPod and the Pod for fakes.
let podOne
const sandboxed = () => Boolean(process.env.COMFYFIELD_POD_SANDBOX)
// Comfy Cloud runs of the last day, so the app can say when a session would cost less on a Pod.
// About $4.54 per GPU hour: Comfy's published RTX PRO 6000 rate, which matches the Cloud workflow rate.
export const CLOUD_USD_PER_GPU_SEC = 4.54 / 3600
const HOUR = 3_600_000
const cloudRunsFile = () => path.join(home(), 'cloud-runs.json')
function readCloudRuns() {
  try { return JSON.parse(fs.readFileSync(cloudRunsFile(), 'utf8')) } catch { return [] }
}
export function logCloudRun({ seconds, minVramGb = 0, at = Date.now() }) {
  const runs = [...readCloudRuns().filter((r) => at - r.at < 24 * HOUR), { at, seconds: Math.max(0, seconds), minVramGb }]
  fs.mkdirSync(home(), { recursive: true })
  fs.writeFileSync(cloudRunsFile(), JSON.stringify(runs))
}

// Suggests a Pod when, in the last hour, Cloud runs cost at least 80% of an hour on the cheapest
// free GPU that fits them. It only informs; nothing starts.
export async function podSuggestion({ now = Date.now(), quote = (o) => pod().quote(o) } = {}) {
  const runs = readCloudRuns().filter((r) => now - r.at < HOUR)
  if (runs.length < 3) return null
  const cloudUsd = runs.reduce((n, r) => n + r.seconds, 0) * CLOUD_USD_PER_GPU_SEC
  const q = await quote({ minVramGb: Math.max(0, ...runs.map((r) => r.minVramGb || 0)) }).catch(() => null)
  const rung = q?.rungs.find((r) => r.inStock && r.usdPerHr) || q?.rungs.find((r) => r.usdPerHr)
  if (!rung || cloudUsd < 0.8 * rung.usdPerHr) return null
  return { runs: runs.length, cloudUsd, podUsdPerHr: rung.usdPerHr, gpu: rung.name }
}

// GPU time of a finished job, from its start and end when the backend reports them.
function gpuSeconds(job, t0) {
  const start = new Date(job.startedAt ?? NaN).getTime()
  const end = new Date(job.completedAt ?? NaN).getTime()
  return Number.isFinite(start) && Number.isFinite(end) && end > start ? (end - start) / 1000 : (Date.now() - t0) / 1000
}

export function pod() {
  if (!podOne) {
    const sandbox = sandboxed()
    podOne = podManager({
      dir: home, sandbox,
      keys: () => (sandbox ? { ...config('runpod'), key: 'sandbox' } : config('runpod')),
      ...(sandbox ? { fetch: sandboxFetch({ file: () => path.join(home(), 'pod-sandbox.json') }) } : {}),
    })
  }
  return podOne
}

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

export const mediaTypes = { mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4', png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon' }

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
    if (c.mode === 'cloud' || c.mode === 'pod') {
      if (!c.key) return pod().test()
      const r = await fetch('https://cloud.comfy.org/api/user', { headers: { 'X-API-Key': c.key } })
      return r.ok
    }
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
  if (id === 'runpod') return pod().test()
  return false
}

export const mediaPath = (name) => path.join(mediaDir(), path.basename(name))

export function connections() {
  const out = Object.fromEntries(Object.keys(providers).map((id) => {
    const c = config(id)
    // Comfy Cloud + Pod can run with a Comfy key, or with a RunPod key through a Pod.
    const on = id !== 'comfy' ? c.key : c.mode === 'cloud' || c.mode === 'pod' ? c.key || config('runpod').key || sandboxed() : c.url || c.key
    return [id, { connected: Boolean(on), url: c.url, key: mask(c.key), ...(id === 'comfy' ? { mode: c.mode === 'pod' ? 'cloud' : c.mode || 'local' } : {}) }]
  }))
  out.comfyRouter = { connected: Boolean(config('comfy').key) }
  const rp = config('runpod')
  out.runpod = { connected: Boolean(rp.key) || sandboxed(), key: mask(rp.key), cap: pod().status().spend.cap, sandbox: sandboxed() }
  return out
}

export function saveConnection(id, values) {
  if (!providers[id]) throw Object.assign(new Error('Unknown provider'), { status: 400 })
  if (id === 'comfy' && values.mode && !['local', 'cloud'].includes(values.mode)) throw Object.assign(new Error('Choose Local or Comfy Cloud + Pod.'), { status: 400 })
  if (id === 'runpod' && values.cap != null && !(parseFloat(values.cap) > 0)) throw Object.assign(new Error('The daily cap is a dollar amount above 0.'), { status: 400 })
  if (id === 'runpod' && values.cap != null) values = { ...values, cap: String(Math.round(parseFloat(values.cap) * 100) / 100) }
  const keys = readKeys()
  keys[id] = { ...keys[id], ...values }
  writeKeys(keys)
}

const comfyBase = () => (config('comfy').url || 'http://127.0.0.1:8188').replace(/\/+$/, '')
const comfyHeaders = () => (config('comfy').key ? { 'X-API-Key': config('comfy').key } : {})

const ROUTER = 'https://api.comfy.org/v2/models'
const comfyKey = () => {
  const { key } = config('comfy')
  if (!key) throw Object.assign(new Error('Add a Comfy API key in Connections first.'), { status: 400 })
  return key
}

function comfyError(response, data) {
  const code = data.error_type || data.error?.code
  const message = response.status === 402 || code === 'insufficient_credits'
    ? 'Comfy has insufficient credits. Add credits to your Comfy workspace billing, then try again.'
    : `Comfy request failed (${code || response.status}): ${data.message || data.error?.message || 'Check the request and your connection.'}`
  return Object.assign(new Error(message), { status: response.status >= 400 ? response.status : 502 })
}

function retryAfter(response) {
  const value = response.headers.get('Retry-After')
  if (value == null) return 2000
  const seconds = Number(value)
  return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(value) - Date.now()) || 2000
}

export async function listComfyRouterModels({ limit = 50, cursor } = {}) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set('cursor', cursor)
  const response = await fetch(`${ROUTER}?${params}`, { headers: { 'X-API-Key': comfyKey() } })
  const data = await response.json()
  if (!response.ok) throw comfyError(response, data)
  return data
}

// Router returns each partner's native JSON; normalize media for the shared generation callers.
function routerFiles(data) {
  const files = []
  const visit = (value, kind) => {
    if (typeof value === 'string' && /^(https?:|data:)/.test(value) && kind) files.push({ url: value, kind })
    else if (Array.isArray(value)) value.forEach((v) => visit(v, kind))
    else if (value && typeof value === 'object') {
      for (const [key, v] of Object.entries(value)) {
        visit(v, /^(images?|image_url|sample)$/.test(key) ? 'image' : /^(videos?|video_url)$/.test(key) ? 'video' : /^(audios?|audio_url)$/.test(key) ? 'audio' : kind)
      }
    }
  }
  visit(data)
  if (!files.length) throw new Error('Comfy Router finished but returned no supported media.')
  return files
}

async function withRouterFiles(value) {
  if (Array.isArray(value)) return Promise.all(value.map(withRouterFiles))
  if (value && typeof value === 'object') return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([k, v]) => [k, await withRouterFiles(v)])))
  if (typeof value === 'string' && value.startsWith('/media/')) {
    const { buf, mime } = readLocal(value)
    return dataUri(buf, mime)
  }
  return value
}

export async function runComfyRouter({ model, input, idempotencyKey = randomUUID() }, { pause = sleep } = {}) {
  if (!/^[\w.-]+\/[\w./-]+$/.test(model) || model.split('/').includes('..')) throw new Error('Use a Comfy Router provider/model id.')
  const headers = { 'X-API-Key': comfyKey(), 'Content-Type': 'application/json' }
  const base = `${ROUTER}/${model}/requests`
  const response = await fetch(base, { method: 'POST', headers: { ...headers, 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(await withRouterFiles(input)) })
  const job = await response.json()
  if (!response.ok || job.error_type) throw comfyError(response, job)
  if (!job.request_id) throw new Error('Comfy Router did not return a request id.')
  // Derive URLs from the documented route so credentials never follow an arbitrary response URL.
  const resultUrl = `${base}/${encodeURIComponent(job.request_id)}`
  let previous = response
  for (let i = 0; i < 1200; i++) {
    await pause(retryAfter(previous))
    const status = await fetch(`${resultUrl}/status`, { headers })
    const update = await status.json()
    previous = status
    if (status.status === 429 || status.status === 503) continue
    if (!status.ok || update.error_type) throw comfyError(status, update)
    if (update.status !== 'COMPLETED') continue
    const result = await fetch(resultUrl, { headers })
    const data = await result.json()
    previous = result
    if (result.status === 202 || result.status === 429 || result.status === 503) continue
    if (!result.ok || data.error_type) throw comfyError(result, data)
    return routerFiles(data)
  }
  throw new Error(`Comfy Router took too long. Request ${job.request_id} may still be running; do not submit again without checking it.`)
}

async function comfyImage(source) {
  if (/^https?:/.test(source)) {
    const r = await fetch(source)
    if (!r.ok) throw new Error(`Could not download the input image (${r.status}).`)
    return { buf: Buffer.from(await r.arrayBuffer()), mime: r.headers.get('content-type') || 'image/png' }
  }
  return readLocal(source)
}

// The SDK reads COMFY_BASE_URL only when a client is made, so scope it to one `new Comfy()`.
// Always pass apiKey: a key left in the environment would otherwise go to whatever URL is set.
export function comfyClient(baseUrl, apiKey, options = {}) {
  const saved = process.env.COMFY_BASE_URL
  if (baseUrl) process.env.COMFY_BASE_URL = baseUrl
  else delete process.env.COMFY_BASE_URL
  try {
    return new Comfy({ apiKey: apiKey || undefined, clientInfo: 'comfyfield', ...options })
  } finally {
    if (saved === undefined) delete process.env.COMFY_BASE_URL
    else process.env.COMFY_BASE_URL = saved
  }
}

function readWorkflow(workflow) {
  if (!/^[a-z0-9_]+$/.test(workflow || '')) throw Object.assign(new Error('Invalid workflow name.'), { status: 400 })
  const file = path.join(ROOT, 'public', 'workflows', `${workflow}.json`)
  if (!fs.existsSync(file)) throw Object.assign(new Error(`Workflow ${workflow} not found`), { status: 404 })
  return { file, template: JSON.parse(fs.readFileSync(file, 'utf8')) }
}

// What a Pod needs for a workflow before its first run: the files, the GPU memory and the disk.
export function workflowNeeds(workflow) {
  const files = modelFilesOf(readWorkflow(workflow).template)
  return { files, minVramGb: minVramOf(files), volumeGb: volumeFor(files) }
}

// Comfy Cloud is the instant option and a Pod the long-term one. A ready Pod takes every ComfyUI run;
// otherwise a run goes to Comfy Cloud at once, unless Cloud cannot take it. Then it waits for a
// starting Pod, or fails with needs_pod so the app can offer to start one. It never starts a Pod.
async function comfyTarget(files, podPhase, podVram, label) {
  const phase = await podPhase()
  // A Pod too small for the run's models is no Pod for this run. Unknown memory counts as enough.
  const need = minVramOf(files)
  const vram = podVram()
  const fits = vram == null || vram >= need
  if (phase === 'ready' && fits) return 'pod'
  const missing = notOnCloud(files)
  const why = !config('comfy').key ? 'Comfy Cloud needs a Comfy API key on a paid plan'
    : missing.length ? `${label || missing[0].name} is not on Comfy Cloud yet` : null
  if (!why) return 'cloud'
  if (!fits && phase !== 'none') {
    throw Object.assign(new Error(`${why}, and this run needs a ${need} GB GPU; your Pod has ${vram} GB. Terminate it and start a new Pod.`), { status: 409, code: 'pod_too_small', reason: why })
  }
  if (phase === 'starting' || phase === 'resuming') return 'pod'
  throw Object.assign(new Error(`${why}, so this run needs a Pod. Start one in ComfyField from the Pod chip in the top bar.`), { status: 409, code: 'needs_pod', reason: why })
}

// Runs a bundled workflow on Local ComfyUI, Comfy Cloud or the Pod, and returns file URLs.
export async function runComfy(workflow, vars = {}, { createClient = (key, baseUrl) => comfyClient(baseUrl, key), lease = (o) => pod().lease(o), podPhase = () => pod().phaseNow(), podVram = () => pod().vramGb() } = {}) {
  const { file, template } = readWorkflow(workflow)
  const inputs = [...JSON.stringify(template).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])
  for (const input of inputs) if (vars[input] == null || vars[input] === '') throw new Error(`Workflow ${workflow} requires ${input}.`)
  const graph = fill(template, vars)
  const loaders = Object.entries(template).filter(([, node]) => node.class_type === 'LoadImage' && node.inputs.image === '{{image}}')
  const image = loaders.length ? await comfyImage(vars.image) : null
  const mode = config('comfy').mode
  // 'pod' was its own choice before the Pod joined Comfy Cloud; read it as Comfy Cloud + Pod.
  if (mode === 'cloud' || mode === 'pod') {
    const needs = modelFilesOf(graph)
    // Errors name the model as the picker shows it.
    const label = pinned.find((m) => m.workflow === workflow || m.imageWorkflow === workflow)?.name
    const target = await comfyTarget(needs, podPhase, podVram, label)
    // On the Pod the proxy token is the server credential; the Comfy key, when set, only pays partner nodes.
    let held = null
    let client
    let partner
    if (target === 'pod') {
      held = await lease({ files: needs })
      if (held.sandbox) {
        held.release()
        throw new Error('This is the sandbox Pod, so nothing renders. Unset COMFYFIELD_POD_SANDBOX to run on a real Pod.')
      }
      client = createClient(held.token, held.baseUrl)
      partner = config('comfy').key || undefined
    } else {
      partner = comfyKey()
      client = createClient(partner)
    }
    const where = target === 'pod' ? 'The Pod' : 'Comfy Cloud'
    try {
      const wf = await client.workflows.fromFile(file)
      wf.json = graph
      for (const [id] of loaders) wf.setInput(id, 'image', client.assets.fromBytes(image.buf, { filename: `input.${mimeExt(image.mime)}`, contentType: image.mime }))
      const t0 = Date.now()
      const job = await client.run(wf, { apiKey: partner, timeoutMs: 30 * 60 * 1000, ...(held ? { signal: held.signal } : {}) })
      if (target === 'cloud') {
        try { logCloudRun({ seconds: gpuSeconds(job, t0), minVramGb: minVramOf(needs) }) } catch {}
      }
      const files = []
      for (const output of job.outputs) {
        if (!['image', 'video', 'audio'].includes(output.type)) continue
        files.push({ ...saveMedia(Buffer.from(await output.toBytes()), mimeExt(output.contentType)), kind: output.type, name: output.name })
      }
      if (!files.length) throw new Error(`${where} finished but returned no media.`)
      return files
    } catch (e) {
      // A Pod paused or terminated mid-run says why, instead of an abort error.
      if (held?.reason()) throw Object.assign(new Error(held.reason()), { status: 409 })
      if (e.httpStatus === 402 || e.code === 'insufficient_credits') throw comfyError({ status: 402 }, {})
      throw e
    } finally {
      held?.release()
    }
  }
  const base = comfyBase()
  if (image) {
    const form = new FormData()
    form.append('image', new Blob([image.buf], { type: image.mime }), `comfyfield-${randomUUID()}.${mimeExt(image.mime)}`)
    const upload = await fetch(`${base}/upload/image`, { method: 'POST', headers: comfyHeaders(), body: form })
    if (!upload.ok) throw new Error(`ComfyUI image upload failed (${upload.status}).`)
    const uploaded = await upload.json()
    for (const [id] of loaders) graph[id].inputs.image = [uploaded.subfolder, uploaded.name].filter(Boolean).join('/')
  }
  const headers = { 'Content-Type': 'application/json', ...comfyHeaders() }
  let res
  try {
    res = await fetch(`${base}/prompt`, { method: 'POST', headers, body: JSON.stringify({ prompt: graph, client_id: 'comfyfield', ...(config('comfy').key ? { extra_data: { api_key_comfy_org: config('comfy').key } } : {}) }) })
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
  const out = pinned.filter((m) => (!kind || m.kind === kind) && (m.provider !== 'comfyRouter' || config('comfy').key)).map((m) => ({
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
  if (m.provider === 'comfyRouter') {
    const files = []
    for (let i = 0; i < (m.kind === 'image' ? count : 1); i++) files.push(...await runComfyRouter({ model: m.model, input: comfyRouterInput(m.model, o) }))
    return files
  }
  if (m.provider === 'comfy') {
    const vars = comfyVars(m.kind, { ...o, duration: duration || 5 }, m.sizes)
    return runComfy(vars.image && m.imageWorkflow ? m.imageWorkflow : m.workflow, vars)
  }
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
