// Provider logic for ComfyField, independent of Vite. Used by the dev server, the CLI and the MCP server.
// Keys live in the per-user data folder, or .comfyfield under COMFYFIELD_HOME.
import fs from 'node:fs'
import { dataDirectory } from './startup-paths.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { Comfy } from '@comfyorg/sdk'
import { models as pinned, falCategories, podWorkflows, routerWriterModel } from '../src/lib/catalog.js'
import { comfyVars, comfyRouterInput, falInput, estimate, fill, falEndpointFor, dropOptional } from '../shared/mapping.js'
import { renderStitch } from './stitch.js'
import { archOf, minVramOf, notOnCloud, podNeedsOf, volumeFor, RUNTIMES } from '../shared/modelFiles.js'
import { DEFAULT_TIER, TIER_IDS } from '../shared/gpuTiers.js'

import { podManager, GPU_LADDER, IDLE_CHOICES, POD_VOLUMES, STOPPED_DISK_USD_GB_MONTH, idleMinutes } from './pod.js'
import { sandboxFetch } from './podSandbox.js'

// Instant workflow variants (kept separate from provider imports).
import { cloudWorkflows } from '../src/lib/catalog.js'

export { podBootScript, podStartCmd } from './podBoot.js'
export { GPU_LADDER, NO_POD } from './pod.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const providers = {
  comfy: { env: ['COMFY_URL', 'COMFY_API_KEY', 'COMFY_MODE', 'COMFY_RUN'], fields: ['url', 'key', 'mode', 'run'] },
  fal: { env: ['FAL_KEY'], fields: ['key'] },
  google: { env: ['GEMINI_API_KEY'], fields: ['key'] },
  elevenlabs: { env: ['ELEVENLABS_API_KEY'], fields: ['key'] },
  runpod: { env: ['RUNPOD_API_KEY', 'RUNPOD_DAILY_CAP', 'RUNPOD_AUTO_START', 'RUNPOD_IDLE_MIN', 'RUNPOD_TIER'], fields: ['key', 'cap', 'auto', 'idle', 'tier'] },
}

export const home = () => dataDirectory()
const mediaDir = () => path.join(home(), 'media')

export function readKeys() {
  try { return JSON.parse(fs.readFileSync(path.join(home(), 'keys.json'), 'utf8')) } catch { return {} }
}

export function writeKeys(keys) {
  fs.mkdirSync(home(), { recursive: true })
  fs.writeFileSync(path.join(home(), 'keys.json'), JSON.stringify(keys, null, 2), { mode: 0o600 })
}

// ComfyUI runs on Comfy Cloud and Pods: ComfyField assumes its users do not run ComfyUI on their own GPU.
// A local ComfyUI is for development only, through COMFY_MODE=local and COMFY_URL in .env. Saved
// settings cannot pick it, so an old saved "local" no longer sends runs to a machine without ComfyUI.
export const comfyMode = () => (process.env.COMFY_MODE === 'local' ? 'local' : 'cloud')

// Saved keys win; environment variables are the fallback.
export function config(id) {
  const saved = readKeys()[id] || {}
  const { env, fields } = providers[id]
  const out = Object.fromEntries(fields.map((f, i) => [f, saved[f] || process.env[env[i]] || '']))
  return id === 'comfy' ? { ...out, mode: comfyMode(), url: process.env.COMFY_URL || '' } : out
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

// On Generate, a run that needs a Pod starts one by itself unless the user turned this off.
export const podAutoStart = () => config('runpod').auto !== 'off'

// The generation type the user picked: 'instant' (Comfy Cloud) or 'session' (their Pod). Null until they
// pick one, and then a ready Pod takes every run and Cloud takes the rest, as before the choice existed.
export const RUN_TYPES = ['instant', 'session']
const ARCH_NAMES = { blackwell: 'Blackwell', hopper: 'Hopper' }
export const runType = () => (RUN_TYPES.includes(config('comfy').run) ? config('comfy').run : null)
export const podTier = () => (TIER_IDS.includes(config('runpod').tier) ? config('runpod').tier : DEFAULT_TIER)

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
  return t === 'jpeg' ? 'jpg' : t === 'svg+xml' ? 'svg' : t === 'quicktime' ? 'mov' : t.replace(/[^a-z0-9]/gi, '') || 'png'
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

export async function writePromptWithRouter({ instructions, note = '', images = [], target = '', promptOnly = true, idempotencyKey = randomUUID() }) {
  const content = images.map((url) => {
    const { buf, mime } = readLocal(url)
    if (!/^image\/(png|jpeg|webp|gif)$/.test(mime)) {
      throw Object.assign(new Error('Writer accepts PNG, JPG, WebP or GIF images.'), { status: 415 })
    }
    return { type: 'input_image', image_url: dataUri(buf, mime) }
  })
  content.push({ type: 'input_text', text: [target && `Target model or medium: ${target}`, note && `User note: ${note}`, promptOnly && 'Write only the finished generation prompt.'].filter(Boolean).join('\n\n') })
  const response = await fetch(`${ROUTER}/${routerWriterModel}`, {
    method: 'POST', headers: { 'X-API-Key': comfyKey(), 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ instructions, input: [{ role: 'user', content }], max_output_tokens: 2048, store: false }),
  }).catch((error) => { throw Object.assign(error, { idempotencyKey }) })
  const data = await routerJson(response)
  const fail = (detail) => Object.assign(comfyError(response, detail), { idempotencyKey })
  if (!response.ok || data.error || data.error_type) throw fail(data)
  if (data.status !== 'completed') throw fail({ ...data, error_type: data.status ? 'prompt_failed' : 'invalid_response', retryable: !data.status, message: 'Comfy Router did not finish the prompt.' })
  const text = (data.output || []).filter((item) => item.type === 'message' && item.role === 'assistant').flatMap((item) => item.content || []).filter((part) => part.type === 'output_text').map((part) => part.text || '').join('').trim()
  if (!text) throw fail({ ...data, error_type: 'prompt_filtered', retryable: false, message: 'Comfy Router returned no prompt. The request may have been filtered.' })
  return text
}

export async function writePrompt({ instructions, note = '', images = [], target = '', promptOnly = true, idempotencyKey }) {
  if (typeof instructions !== 'string' || !instructions.trim()) {
    throw Object.assign(new Error('Add writer instructions first.'), { status: 400 })
  }
  if (typeof promptOnly !== 'boolean' || typeof note !== 'string' || typeof target !== 'string' || !Array.isArray(images) || images.some((u) => typeof u !== 'string' || !/^(data:image\/|\/media\/)/.test(u))) {
    throw Object.assign(new Error('Writer needs a note, a target and local or inline images.'), { status: 400 })
  }
  const request = { instructions, note, images, target, promptOnly, idempotencyKey }
  const { key } = config('google')
  if (!key) return writePromptWithRouter(request)
  const parts = images.map((url) => {
    const { buf, mime } = readLocal(url)
    if (!/^image\/(png|jpeg|webp|gif)$/.test(mime)) {
      throw Object.assign(new Error('Writer accepts PNG, JPG, WebP or GIF images.'), { status: 415 })
    }
    return { inlineData: { mimeType: mime, data: buf.toString('base64') } }
  })
  parts.push({ text: [target && `Target model or medium: ${target}`, note && `User note: ${note}`, promptOnly && 'Write only the finished generation prompt.'].filter(Boolean).join('\n\n') })
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

export const mediaTypes = { mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m4a: 'audio/mp4', ogg: 'audio/ogg', flac: 'audio/flac', glb: 'model/gltf-binary', png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon' }

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
    if (c.mode === 'cloud') {
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
  const out = Object.fromEntries(Object.keys(providers).map((id) => {
    const c = config(id)
    // Comfy Cloud + Pod can run with a Comfy key, or with a RunPod key through a Pod.
    const on = id !== 'comfy' ? c.key : c.mode === 'cloud' ? c.key || config('runpod').key || sandboxed() : c.url || c.key
    return [id, { connected: Boolean(on), key: mask(c.key), ...(id === 'comfy' ? { mode: c.mode } : {}) }]
  }))
  out.comfyRouter = { connected: Boolean(config('comfy').key) }
  const rp = config('runpod')
  out.runpod = { connected: Boolean(rp.key) || sandboxed(), key: mask(rp.key), cap: pod().status().spend.cap, auto: podAutoStart(), idle: idleMinutes(rp.idle), sandbox: sandboxed() }
  return out
}

export function saveConnection(id, values) {
  if (!providers[id]) throw Object.assign(new Error('Unknown provider'), { status: 400 })
  if (id === 'comfy' && (values.mode || values.url)) throw Object.assign(new Error('ComfyUI runs on Comfy Cloud and Pods. A local ComfyUI is for development only: set COMFY_MODE=local and COMFY_URL in .env.'), { status: 400 })
  if (id === 'comfy' && values.run != null && !RUN_TYPES.includes(values.run)) throw Object.assign(new Error('The generation type is instant or session.'), { status: 400 })
  if (id === 'runpod' && values.tier != null && !TIER_IDS.includes(values.tier)) throw Object.assign(new Error(`The Session tier is ${TIER_IDS.join(', ')}.`), { status: 400 })
  if (id === 'runpod' && values.auto != null && !['on', 'off'].includes(values.auto)) throw Object.assign(new Error('Start Pods automatically is on or off.'), { status: 400 })
  if (id === 'runpod' && values.cap != null && !(parseFloat(values.cap) > 0)) throw Object.assign(new Error('The daily cap is a dollar amount above 0.'), { status: 400 })
  if (id === 'runpod' && values.idle != null && !IDLE_CHOICES.includes(Number(values.idle))) throw Object.assign(new Error(`Idle shutdown is ${IDLE_CHOICES.join(', ')} minutes.`), { status: 400 })
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

async function routerJson(response) {
  const data = await response.json().catch(() => null)
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
}

function comfyError(response, data) {
  const code = response.headers?.get('X-Comfy-Error-Type') || data.error_type || data.error?.code
  const requestId = response.headers?.get('X-Comfy-Request-Id') || data.request_id
  const message = response.status === 402 || code === 'insufficient_credits'
    ? 'Comfy has insufficient credits. Add credits to your Comfy workspace billing, then try again.'
    : `Comfy request failed (${code || response.status}): ${data.message || data.error?.message || (typeof data.detail === 'string' ? data.detail : '') || 'Check the request and your connection.'}`
  return Object.assign(new Error(`${message}${requestId ? ` Request ${requestId}.` : ''}`), { status: response.status >= 400 ? response.status : 502, requestId, code,
    retryable: data.retryable ?? (response.status === 408 || response.status === 429 || response.status >= 500) })
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
function routerFiles(data, model) {
  if (model === 'byteplus/seedream-5-0-flash-260915') data = { images: (data.data || []).map((image) => {
    if (image.url) return image.url
    if (image.b64_json) return saveMedia(Buffer.from(image.b64_json, 'base64'), 'png').url
    return null
  }).filter(Boolean) }
  if (model === 'luma/photon-flash-1') data = { image: data.assets?.image }
  const files = []
  const visit = (value, kind) => {
    if (typeof value === 'string' && /^(https?:|data:|\/media\/)/.test(value) && kind) files.push({ url: value, kind, ...(value.startsWith('/media/') && { path: mediaPath(value) }) })
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
  const job = await routerJson(response)
  if (!response.ok || job.error_type) throw Object.assign(comfyError(response, job), { idempotencyKey })
  if (!job.request_id) throw Object.assign(new Error('Comfy Router did not return a request id.'), { code: 'invalid_response', retryable: true })
  // Derive URLs from the documented route so credentials never follow an arbitrary response URL.
  const resultUrl = `${base}/${encodeURIComponent(job.request_id)}`
  let previous = response
  for (let i = 0; i < 1200; i++) {
    await pause(retryAfter(previous))
    const status = await fetch(`${resultUrl}/status`, { headers })
    previous = status
    if (status.status === 429 || status.status === 503) continue
    const update = await routerJson(status)
    if (status.ok && !update.status && !update.error_type) throw comfyError(status, { request_id: job.request_id, error_type: 'invalid_response', retryable: true, message: 'Router returned an invalid status response. Retry with the same request key.' })
    if (['FAILED', 'CANCELLED', 'CANCELED'].includes(update.status)) throw comfyError(status, { request_id: job.request_id, ...update, error_type: update.error_type || 'job_failed', retryable: false })
    if (!status.ok || update.error_type) throw comfyError(status, { request_id: job.request_id, ...update, ...(update.status === 'COMPLETED' && update.error_type ? { retryable: false } : {}) })
    if (update.status !== 'COMPLETED') continue
    const result = await fetch(resultUrl, { headers })
    previous = result
    if (result.status === 202 || result.status === 429 || result.status === 503) continue
    const mime = (result.headers.get('Content-Type') || '').split(';')[0]
    if (result.ok && (/^audio\//.test(mime) || (mime === 'application/octet-stream' && model.startsWith('elevenlabs/')))) {
      const buf = Buffer.from(await result.arrayBuffer())
      if (!buf.length) throw new Error('Comfy Router returned empty audio.')
      return [{ ...saveMedia(buf, mime === 'application/octet-stream' || mime.includes('mpeg') ? 'mp3' : mimeExt(mime)), kind: 'audio' }]
    }
    const data = await routerJson(result)
    if (!result.ok || data.error_type) throw comfyError(result, { request_id: job.request_id, ...data })
    if (!Object.keys(data).length) throw comfyError(result, { request_id: job.request_id, error_type: 'invalid_response', retryable: true, message: 'Router returned an invalid result response. Retry with the same request key.' })
    return routerFiles(data, model)
  }
  throw new Error(`Comfy Router took too long. Request ${job.request_id} may still be running; do not submit again without checking it.`)
}

async function comfyMedia(source) {
  if (/^https?:/.test(source)) {
    const r = await fetch(source)
    if (!r.ok) throw new Error(`Could not download an input file (${r.status}).`)
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

// What a Pod needs for a workflow before its first run: the files, the runtimes, the GPU memory and the disk.
export function workflowNeeds(workflow) {
  const needs = podNeedsOf(readWorkflow(workflow).template)
  return { files: needs.filter((n) => !n.runtime), runtimes: needs.filter((n) => n.runtime), minVramGb: minVramOf(needs), volumeGb: volumeFor(needs) }
}

const invalidRequirements = () => Object.assign(new Error('Supply up to 200 workflow objects with object vars.'), { status: 400 })
const workflowMetadata = ({ workflow, needs }) => ({ workflow, notOnCloud: notOnCloud(needs), minVramGb: minVramOf(needs), arch: archOf(needs) })

function workflowGraph(workflow, vars) {
  const { file, template: source } = readWorkflow(workflow)
  const template = dropOptional(source, vars)
  const graph = fill(template, vars)
  return { workflow, file, template, graph, needs: podNeedsOf(graph) }
}

// Both execution and preflight resolve alternates from the selected workflow, including image variants.
function cloudGraphOf(workflow, vars) {
  const name = cloudWorkflowOf(workflow)
  if (!name) return null
  const graph = workflowGraph(name, vars)
  return !unsetInput(graph.template, vars) && !notOnCloud(graph.needs).length ? graph : null
}

// Read-only pipeline planning. No clients, uploads, leases or downloads are created.
export function comfyRequirements(workflows = []) {
  if (!Array.isArray(workflows) || workflows.length > 200) throw invalidRequirements()
  return workflows.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.workflow !== 'string' ||
      ('vars' in entry && (!entry.vars || typeof entry.vars !== 'object' || Array.isArray(entry.vars)))) throw invalidRequirements()
    const { workflow, vars = {} } = entry
    return workflowMetadata(workflowGraph(workflow, vars))
  })
}

export async function formatRequirements(workflows = [], { run = runType(), phase, vramGb, arch, local = comfyMode() === 'local' } = {}) {
  phase ??= await pod().phaseNow()
  vramGb ??= pod().vramGb()
  arch ??= pod().arch()
  const requirements = comfyRequirements(workflows)
  const connected = connections()
  for (const [index, entry] of workflows.entries()) {
    const requirement = requirements[index]
    const vars = entry.vars || {}
    const original = workflowGraph(entry.workflow, vars)
    const cloud = cloudGraphOf(entry.workflow, vars)
    requirement.cloud = workflowMetadata(cloud || original)
    try {
      const route = local ? { ...original, target: 'local' } : await resolveComfyRoute(original, vars, {
        run, podPhase: () => phase, podVram: () => vramGb, podArch: () => arch,
      })
      requirement.target = route.target
      requirement.selectedWorkflow = route.workflow
    } catch (error) {
      if (!['needs_pod', 'pod_too_small'].includes(error.code)) throw error
      requirement.target = null
      requirement.reason = { code: error.code, message: error.message, detail: error.reason }
    }
  }
  return {
    requirements,
    connections: Object.fromEntries(Object.entries(connected).map(([id, c]) => [id, { connected: c.connected }])),
    writerProviders: ['google', ...(config('comfy').key ? ['comfyRouter'] : [])],
    runType: run,
    pod: { phase, vramGb, arch, auto: podAutoStart() },
    cloudConnected: Boolean(config('comfy').key),
    local,
  }
}

// The catalog model a workflow belongs to, and the graph a big enough Pod runs for it instead.
const modelOf = (workflow) => pinned.find((m) => m.workflow === workflow || m.imageWorkflow === workflow)
function podWorkflowOf(workflow) {
  const m = modelOf(workflow)
  return (m && (workflow === m.imageWorkflow ? m.podImageWorkflow : m.podWorkflow)) || podWorkflows[workflow] || null
}

function cloudWorkflowOf(workflow) {
  const m = modelOf(workflow)
  return (m && (workflow === m.imageWorkflow ? m.cloudImageWorkflow : m.cloudWorkflow)) || cloudWorkflows[workflow] || null
}

// A Pod started for a workflow is sized for its Pod graph, so H3 gets the GPU FreeVideo runs on.
export const podNeedsFor = (workflow) => workflowNeeds(podWorkflowOf(workflow) || workflow)

// What the Pods page offers: one size per GPU memory class on the ladder, with its cheapest free GPU
// and the models that need that size, then every GPU for a pick by hand, the disk sizes and the settings.
export async function podOptions() {
  const q = await pod().quote({ minVramGb: 0 })
  const needs = []
  for (const [i, m] of pinned.entries()) {
    if (m.provider !== 'comfy' || !m.workflow) continue
    const stock = workflowNeeds(m.workflow)
    // A model with no files to load (a partner node) needs no Pod GPU.
    if (stock.files.length) needs.push({ name: m.name, gb: stock.minVramGb, i })
    const alt = podWorkflowOf(m.workflow)
    if (alt) needs.push({ name: `${m.name.split(' (')[0]} on ${workflowNeeds(alt).runtimes.map((r) => r.name).join(', ')}`, gb: workflowNeeds(alt).minVramGb, i })
  }
  // The biggest, then the newest (later in the catalog), name each size first.
  needs.sort((a, b) => b.gb - a.gb || b.i - a.i)
  const sizes = [...new Set(GPU_LADDER.map((r) => r.vramGb))].sort((a, b) => a - b)
  const LABELS = ['Small', 'Medium', 'Large']
  const priced = (rs) => [...rs].sort((a, b) => (b.inStock !== false) - (a.inStock !== false) || (a.usdPerHr ?? Infinity) - (b.usdPerHr ?? Infinity))[0]
  const tiers = sizes.map((gb, i) => ({
    vramGb: gb, label: LABELS[i] || `${gb} GB`, rung: priced(q.rungs.filter((r) => r.vramGb === gb)),
    models: needs.filter((n) => n.gb <= gb && n.gb > (sizes[i - 1] ?? -1)).map((n) => n.name),
  }))
  return {
    ...q, tiers, volumes: POD_VOLUMES, idleChoices: IDLE_CHOICES, diskUsdPerGbMonth: STOPPED_DISK_USD_GB_MONTH,
    // diskGb: the smallest disk a Pod that installs the runtime gets. Node packs install by themselves.
    runtimes: Object.entries(RUNTIMES).filter(([, r]) => !r.pack).map(([id, r]) => ({ id, name: r.name, gb: r.gb, vramGb: r.vramGb, minutes: r.minutes, diskGb: Math.ceil(volumeFor([r]) / 10) * 10 })),
    services: (await podServices()).map(({ id, name, also, gb, vramGb, runtimes, files }) => ({ id, name, also, gb, vramGb, runtimes: runtimes.map((r) => r.name), keys: files.map((f) => `${f.dir}/${f.name}`) })),
  }
}

// Services a Pod can get ready for before their first run: each catalog model, and each group of formats
// that runs on the same model, with the files and runtimes their graphs need on a Pod. Services that
// need the same files are one entry. A partner node needs no files, so it is no service here.
let services = null
const sizeOf = (needs) => Math.round(needs.reduce((n, f) => n + f.gb, 0) * 10) / 10
export async function podServices() {
  if (services && Date.now() - services.at < 30_000) return services.list
  const { formats } = await import('../src/lib/formats/index.js')
  const groups = new Map()
  const add = (name, workflows) => {
    const g = groups.get(name) || new Set()
    for (const w of workflows) if (w) g.add(w)
    groups.set(name, g)
  }
  for (const m of pinned) if (m.provider === 'comfy') add(m.name, [m.workflow, m.imageWorkflow])
  for (const f of formats) {
    for (const s of f.steps || []) {
      if (s.provider !== 'comfy') continue
      for (const t of s.targets ? Object.values(s.targets).map((x) => ({ ...s, ...x })) : [s]) add(f.runsOn || f.name, [t.workflow, t.imageWorkflow])
    }
  }
  const bySet = new Map()
  for (const [name, set] of groups) {
    const needs = []
    for (const w of set) { try { needs.push(...podNeedsOf(readWorkflow(w).template)) } catch {} }
    const files = [...new Map(needs.filter((n) => !n.runtime).map((n) => [`${n.dir}/${n.name}`, n])).values()]
    const runtimes = [...new Map(needs.filter((n) => n.runtime).map((n) => [n.runtime, n])).values()]
    if (!files.length) continue
    const sig = [...files.map((f) => `${f.dir}/${f.name}`), ...runtimes.map((r) => r.runtime)].sort().join('|')
    const hit = bySet.get(sig)
    if (hit) { hit.also.push(name); continue }
    bySet.set(sig, { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), name, also: [], files, runtimes,
      gb: sizeOf([...files, ...runtimes]), vramGb: minVramOf([...files, ...runtimes]) })
  }
  // The Pod graph a big enough Pod runs instead (H3 on FreeVideo) is a service of its own.
  for (const m of pinned) {
    for (const w of [m.podWorkflow, m.podImageWorkflow].filter(Boolean)) {
      const needs = podNeedsOf(readWorkflow(w).template)
      const name = `${m.name.split(' (')[0]} on ${needs.filter((n) => n.runtime).map((n) => n.name).join(', ')}`
      if ([...bySet.values()].some((s) => s.name === name)) continue
      const files = needs.filter((n) => !n.runtime)
      const runtimes = needs.filter((n) => n.runtime)
      bySet.set(`pod:${w}`, { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, also: [], files, runtimes,
        gb: sizeOf([...files, ...runtimes]), vramGb: minVramOf(needs) })
    }
  }
  services = { at: Date.now(), list: [...bySet.values()] }
  return services.list
}

// The files and runtimes for services picked on the Pods page, checked against the Pod's GPU.
export async function podPrepareFor(ids, vramGb = null) {
  const list = await podServices()
  const picked = ids.map((id) => list.find((s) => s.id === id))
  if (!picked.length || picked.some((s) => !s)) throw Object.assign(new Error('Pick a service from the list.'), { status: 400 })
  const big = picked.find((s) => vramGb != null && s.vramGb > vramGb)
  if (big) throw Object.assign(new Error(`${big.name} needs a ${big.vramGb} GB GPU; this Pod has ${vramGb} GB.`), { status: 400 })
  const files = [...new Map(picked.flatMap((s) => s.files).map((f) => [`${f.dir}/${f.name}`, f])).values()]
  const runtimes = [...new Set(picked.flatMap((s) => s.runtimes.map((r) => r.runtime)))]
  return { files, runtimes, minVramGb: Math.max(0, ...picked.map((s) => s.vramGb)), volumeGb: volumeFor([...files, ...runtimes.map((r) => RUNTIMES[r])]) }
}

// The Pod's status for the app, with the services that use each model file on its disk.
export async function podStatus() {
  const s = pod().status()
  if (!s.models.length) return s
  const used = new Map()
  for (const svc of await podServices().catch(() => [])) {
    for (const f of svc.files) used.set(`${f.dir}/${f.name}`, [...(used.get(`${f.dir}/${f.name}`) || []), svc.name])
  }
  return { ...s, models: s.models.map((f) => ({ ...f, usedBy: used.get(`${f.dir}/${f.name}`) || [] })) }
}

// A Pod can take a graph when its GPU is big enough and its disk has room for the runtimes it has not
// installed. Unknown disk counts as room: a Pod started for the graph was sized for it.
function podHasRoom(needs, vram, room = {}, arch = null) {
  if (vram == null || vram < minVramOf(needs)) return false
  if (arch && archOf(needs) && archOf(needs) !== arch) return false
  return needs.filter((n) => n.runtime && !['ready', 'installing', 'loading'].includes(room.runtimes?.[n.runtime]))
    .every((n) => room.diskFreeGb == null || room.diskFreeGb >= n.gb)
}

const unsetInput = (template, vars) => [...JSON.stringify(template).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).find((k) => vars[k] == null || vars[k] === '')
// The loader inputs a run uploads its own files to, by placeholder: attached images and a mask, a video
// edit's clip, and audio (a recording, or a saved voice's sample).
export const UPLOAD_KEYS = {
  LoadImage: ['image', ['image', 'image2', 'image3', 'image4', 'image5', 'mask']],
  LoadVideo: ['file', ['video']],
  LoadAudio: ['audio', ['audio', 'voice']],
}
export const uploadsOf = (template) => Object.entries(template).flatMap(([id, node]) => {
  const [field, keys] = UPLOAD_KEYS[node.class_type] || []
  const key = field && /^\{\{(\w+)\}\}$/.exec(node.inputs?.[field] || '')?.[1]
  return key && keys.includes(key) ? [{ id, field, key }] : []
})
async function readUploads(uploads, vars) {
  const out = {}
  for (const { key } of uploads) out[key] ??= await comfyMedia(vars[key])
  return out
}

// Comfy Cloud is the Instant option and a Pod the Session one. With no generation type picked, a ready
// Pod takes every ComfyUI run and Cloud takes the rest. Instant never uses a Pod; Session never uses
// Cloud. A run neither can take fails with needs_pod so the app can offer a Session. It never starts a Pod.
async function comfyTarget(files, podPhase, podVram, label, run = null, podArch = () => null) {
  const phase = await podPhase()
  // A Pod too small for the run's models, or of the wrong GPU architecture, is no Pod for this run.
  // Unknown memory or architecture counts as enough.
  const need = minVramOf(files)
  const vram = podVram()
  const needArch = archOf(files)
  const arch = podArch()
  const archOk = !needArch || !arch || arch === needArch
  const fits = (vram == null || vram >= need) && archOk
  if (run !== 'instant' && phase === 'ready' && fits) return 'pod'
  const missing = notOnCloud(files)
  const why = run === 'session' ? null
    : !config('comfy').key ? 'Comfy Cloud needs a Comfy API key on a paid plan'
      : missing.length ? `${label || missing[0].label || missing[0].name} is not on Comfy Cloud yet` : null
  if (run !== 'session' && !why) return 'cloud'
  const needs = (text, code, status = 409, extra = {}) => Object.assign(new Error(text), { status, code, reason: why, ...extra })
  if (run === 'instant') throw needs(`${why}, so this run needs a Session. Start one from the run type in the top bar.`, 'needs_pod')
  if (!fits && phase !== 'none') {
    const gap = archOk ? `a ${need} GB GPU; your Pod has ${vram} GB` : `a ${ARCH_NAMES[needArch] || needArch} GPU; your Pod has a ${ARCH_NAMES[arch] || arch} one`
    // `fit` lets the app offer to replace the Pod with one sized for the run: sizes and GPU families only.
    throw needs(`${why ? `${why}, and this` : 'This'} run needs ${gap}. Terminate it and start a new Pod.`, 'pod_too_small', 409,
      { fit: { needVramGb: need, podVramGb: vram, needArch: ARCH_NAMES[needArch] || needArch, podArch: ARCH_NAMES[arch] || arch } })
  }
  if (phase === 'starting' || phase === 'resuming') return 'pod'
  throw needs(why ? `${why}, so this run needs a Pod. Start one in ComfyField from the Pod chip in the top bar.` : 'You picked Session, so this run needs a Pod. Start one from the run type in the top bar.', 'needs_pod')
}

// Resolve graphs and target policy without uploads or generation, shared with pipeline planning.
async function resolveComfyRoute(original, vars, { run, podPhase, podVram, podArch }) {
  let selected = original
  let targetPhase = podPhase
  let targetRun = run
  if (run !== 'session' && cloudWorkflowOf(original.workflow) && config('comfy').key) {
    const phase = await podPhase()
    targetPhase = () => phase
    const vram = podVram()
    const arch = podArch()
    const readyPod = phase === 'ready' && (vram == null || vram >= minVramOf(original.needs)) &&
      (!archOf(original.needs) || !arch || arch === archOf(original.needs))
    if (run === 'instant' || !readyPod) {
      const alternate = cloudGraphOf(original.workflow, vars)
      if (alternate) {
        selected = alternate
        // An original that cannot use this Pod must not send its smaller alternate there.
        targetRun = 'instant'
      }
    }
  }
  const target = await comfyTarget(selected.needs, targetPhase, podVram, modelOf(original.workflow)?.name, targetRun, podArch)
  return { ...selected, target }
}

// Runs a bundled workflow on Comfy Cloud or the Pod, or in development on a local ComfyUI, and returns file URLs.
export async function runComfy(workflow, vars = {}, { createClient = (key, baseUrl) => comfyClient(baseUrl, key), lease = (o) => pod().lease(o), podPhase = () => pod().phaseNow(), podVram = () => pod().vramGb(), podRoom = () => pod().room(), podArch = () => pod().arch(), run = runType() } = {}) {
  const original = workflowGraph(workflow, vars)
  let { file, template, graph } = original
  const unset = unsetInput(template, vars)
  if (unset) throw new Error(`Workflow ${workflow} requires ${unset}.`)
  if (comfyMode() === 'cloud') {
    const route = await resolveComfyRoute(original, vars, { run, podPhase, podVram, podArch })
    file = route.file
    template = route.template
    graph = route.graph
    let needs = route.needs
    const target = route.target
    // A run that goes to a Pod big enough for the model's Pod graph runs that graph: H3 on FreeVideo.
    const alt = target === 'pod' && podWorkflowOf(workflow)
    if (alt) {
      const w = readWorkflow(alt)
      w.template = dropOptional(w.template, vars)
      const g = unsetInput(w.template, vars) ? null : fill(w.template, vars)
      const n = g && podNeedsOf(g)
      if (n && podHasRoom(n, podVram(), podRoom(), podArch())) {
        ({ file, template } = w)
        graph = g
        needs = n
      }
    }
    const uploads = uploadsOf(template)
    const media = await readUploads(uploads, vars)
    // On the Pod the proxy token is the server credential; the Comfy key, when set, only pays partner nodes.
    let held = null
    let client
    let partner
    if (target === 'pod') {
      held = await lease({ files: needs.filter((n) => !n.runtime), runtimes: needs.filter((n) => n.runtime).map((n) => n.runtime) })
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
      for (const { id, field, key } of uploads) wf.setInput(id, field, client.assets.fromBytes(media[key].buf, { filename: `input.${mimeExt(media[key].mime)}`, contentType: media[key].mime }))
      const t0 = Date.now()
      const job = await client.run(wf, { apiKey: partner, timeoutMs: 30 * 60 * 1000, ...(held ? { signal: held.signal } : {}) })
      if (target === 'cloud') {
        try { logCloudRun({ seconds: gpuSeconds(job, t0), minVramGb: minVramOf(needs) }) } catch {}
      }
      const files = []
      for (const output of job.outputs) {
        const kind = outputKind(output.contentType, output.name, output.type)
        if (!kind) continue
        const buf = Buffer.from(await output.toBytes())
        // Chatterbox answers an error with one sample of silence, which ComfyUI counts as a success.
        if (kind === 'audio' && flacSeconds(buf) != null && flacSeconds(buf) < 0.1) {
          throw new Error('The voice model returned no sound. Try a shorter script or another voice sample.')
        }
        files.push({ ...saveMedia(buf, outputExt(output.contentType, output.name)), kind, name: output.name })
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
  const uploads = uploadsOf(template)
  const media = await readUploads(uploads, vars)
  // ComfyUI's upload route takes any input file, a video too.
  const names = {}
  for (const [key, file] of Object.entries(media)) {
    const form = new FormData()
    form.append('image', new Blob([file.buf], { type: file.mime }), `comfyfield-${randomUUID()}.${mimeExt(file.mime)}`)
    const upload = await fetch(`${base}/upload/image`, { method: 'POST', headers: comfyHeaders(), body: form })
    if (!upload.ok) throw new Error(`ComfyUI upload failed (${upload.status}).`)
    const uploaded = await upload.json()
    names[key] = [uploaded.subfolder, uploaded.name].filter(Boolean).join('/')
  }
  for (const { id, field, key } of uploads) graph[id].inputs[field] = names[key]
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

// ComfyUI lists a saved video under `images`, and a 3D model as a plain file, so the content type and
// the file name decide the kind. Anything else (text, latents) is not media.
const MODEL_3D = /\.(glb|gltf)$/i
function outputKind(contentType = '', name = '', type = '') {
  const kind = /^(image|video|audio)\//.exec(contentType)?.[1]
  if (kind) return kind
  if (/^model\//.test(contentType) || MODEL_3D.test(name)) return '3d'
  if (/\.(mp4|webm|mov)$/i.test(name)) return 'video'
  if (/\.(wav|mp3|flac|ogg|m4a|opus)$/i.test(name)) return 'audio'
  return ['image', 'video', 'audio'].includes(type) ? type : null
}
// The length of a FLAC file in seconds, from its STREAMINFO block (a 20-bit sample rate, then a 36-bit
// sample count). Null for another format, or when the encoder left the count out.
export function flacSeconds(buf) {
  if (buf.length < 26 || buf.toString('latin1', 0, 4) !== 'fLaC' || (buf[4] & 0x7f) !== 0) return null
  const rate = (buf[18] << 12) | (buf[19] << 4) | (buf[20] >> 4)
  const samples = (buf[21] & 0x0f) * 2 ** 32 + buf.readUInt32BE(22)
  return rate && samples ? samples / rate : null
}
const outputExt = (contentType, name) => {
  const ext = /\.(\w{2,5})$/.exec(name || '')?.[1]?.toLowerCase()
  return ext && mediaTypes[ext] ? ext : mimeExt(contentType)
}

function collectComfy(base, outputs) {
  const files = []
  for (const out of Object.values(outputs)) {
    for (const f of Object.values(out).filter(Array.isArray).flat()) {
      if (!f?.filename) continue
      const kind = outputKind('', f.filename) || 'image'
      const q = new URLSearchParams({ filename: f.filename, subfolder: f.subfolder || '', type: f.type || 'output' })
      files.push({ url: `${base}/view?${q}`, kind, name: f.filename })
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
    id: m.id, kind: m.kind, provider: m.provider, name: m.name, note: m.note, pinned: true, durations: m.durations, price: m.price, model: m.model, maxImages: m.maxImages, aspects: m.aspects,
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
export async function generate({ model, prompt, aspect = '16:9', count = 1, duration, image, images, ...options }) {
  if (!prompt) throw new Error('A prompt is required.')
  const m = resolveModel(model)
  const o = { ...options, images, prompt, aspect, count, duration, image: image && !/^(https?:|data:|\/media\/)/.test(image) ? fileDataUri(image) : image }
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
    const endpoint = await falEndpointFor(m, Boolean(o.images?.length || o.image), falSchema)
    const { properties } = await falSchema(endpoint)
    return runFal({ model: endpoint, input: falInput(properties, o) })
  }
  if (m.provider === 'google') return runGoogle({ model: m.model, mode: m.mode, prompt, aspect, count, duration, images: o.images || (o.image ? [o.image] : []) })
  if (m.provider === 'elevenlabs') return runElevenLabs({ mode: m.mode, text: prompt })
  throw new Error(`${m.provider} is not wired up yet.`)
}

// Rough cost before running; null when the price is unknown.
export async function estimateCost({ model, aspect = '16:9', count = 1, duration, image, prompt = '' }) {
  const m = resolveModel(model)
  const endpoint = await falEndpointFor(m, Boolean(image), falSchema)
  const meta = m.provider === 'fal' ? (await falMeta([endpoint]).catch(() => ({})))[endpoint] : { price: m.price }
  return estimate(m, meta, { aspect, count, duration, chars: prompt.length })
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
