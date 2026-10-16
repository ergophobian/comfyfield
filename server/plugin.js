// Local API for ComfyField. Runs inside the Vite server, so `npm run dev` is the whole app.
// Keys are saved to .comfyfield/keys.json on this machine and never sent to the browser.
import fs from 'node:fs'
import path from 'node:path'

const DIR = path.resolve('.comfyfield')
const FILE = path.join(DIR, 'keys.json')

export const providers = {
  comfy: { env: ['COMFY_URL', 'COMFY_API_KEY'], fields: ['url', 'key'] },
  fal: { env: ['FAL_KEY'], fields: ['key'] },
  google: { env: ['GEMINI_API_KEY'], fields: ['key'] },
  elevenlabs: { env: ['ELEVENLABS_API_KEY'], fields: ['key'] },
}

const MEDIA = path.join(DIR, 'media')

function readKeys() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { return {} }
}

function writeKeys(keys) {
  fs.mkdirSync(DIR, { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(keys, null, 2), { mode: 0o600 })
}

// Saved keys win; environment variables are the fallback.
function config(id) {
  const saved = readKeys()[id] || {}
  const { env, fields } = providers[id]
  return Object.fromEntries(fields.map((f, i) => [f, saved[f] || process.env[env[i]] || '']))
}

const mask = (v) => (v ? `${v.slice(0, 4)}…${v.slice(-4)}` : '')

async function body(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  return raw ? JSON.parse(raw) : {}
}

function send(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// fal queue API: submit, poll status, then fetch the result.
async function runFal({ model, input }) {
  const { key } = config('fal')
  if (!key) throw Object.assign(new Error('Connect fal in Connections first.'), { status: 400 })
  const headers = { Authorization: `Key ${key}`, 'Content-Type': 'application/json' }
  const submit = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers, body: JSON.stringify(input) })
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
async function falModels(query) {
  const hit = catalogCache.get(query)
  if (hit && Date.now() - hit.at < 600_000) return hit.data
  const r = await fetch(`https://api.fal.ai/v1/models?${query}`)
  if (!r.ok) throw new Error(`fal catalog unavailable (${r.status})`)
  const data = await r.json()
  catalogCache.set(query, { at: Date.now(), data })
  return data
}

// Input fields of one fal model, read from its OpenAPI schema.
async function falSchema(id) {
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
async function runElevenLabs({ mode, text, voice }) {
  const { key } = config('elevenlabs')
  if (!key) throw Object.assign(new Error('Connect ElevenLabs in Connections first.'), { status: 400 })
  const url = mode === 'speech'
    ? `https://api.elevenlabs.io/v1/text-to-speech/${voice || '21m00Tcm4TlvDq8ikWAM'}`
    : 'https://api.elevenlabs.io/v1/sound-generation'
  const payload = mode === 'speech' ? { text, model_id: 'eleven_multilingual_v2' } : { text }
  const r = await fetch(url, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify(payload) })
  if (!r.ok) throw new Error(`ElevenLabs rejected the request (${r.status}): ${(await r.text()).slice(0, 300)}`)
  return [{ url: saveMedia(Buffer.from(await r.arrayBuffer()), 'mp3'), kind: 'audio' }]
}

function saveMedia(buf, ext) {
  fs.mkdirSync(MEDIA, { recursive: true })
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  fs.writeFileSync(path.join(MEDIA, name), buf)
  return `/media/${name}`
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
async function runGoogle({ model, mode, prompt, aspect, count = 1, duration }) {
  const { key } = config('google')
  if (!key) throw Object.assign(new Error('Connect Google AI in Connections first.'), { status: 400 })
  const headers = { 'x-goog-api-key': key, 'Content-Type': 'application/json' }
  const call = async (url, payload) => {
    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`Google rejected the request (${r.status}): ${data.error?.message || ''}`)
    return data
  }

  if (mode === 'video') {
    const parameters = { aspectRatio: aspect === '9:16' ? '9:16' : '16:9' }
    if (duration) parameters.durationSeconds = duration
    let op = await call(`${GEMINI}/models/${model}:predictLongRunning`, { instances: [{ prompt }], parameters })
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
      files.push({ url: saveMedia(Buffer.from(await v.arrayBuffer()), 'mp4'), kind: 'video' })
    }
    return files
  }

  const generationConfig = mode === 'speech'
    ? { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
    : { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } }
  const runs = mode === 'speech' ? 1 : count
  const files = []
  for (let i = 0; i < runs; i++) {
    const data = await call(`${GEMINI}/models/${model}:generateContent`, { contents: [{ parts: [{ text: prompt }] }], generationConfig })
    for (const part of data.candidates?.[0]?.content?.parts || []) {
      if (!part.inlineData) continue
      const buf = Buffer.from(part.inlineData.data, 'base64')
      if (mode === 'speech') files.push({ url: saveMedia(pcmToWav(buf), 'wav'), kind: 'audio' })
      else files.push({ url: saveMedia(buf, part.inlineData.mimeType.split('/')[1] || 'png'), kind: 'image' })
    }
  }
  if (!files.length) throw new Error('Google returned no media. The prompt may have been filtered.')
  return files
}

const mediaTypes = { mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4', png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', webp: 'image/webp' }

async function testConnection(id) {
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
    const r = await fetch('https://api.elevenlabs.io/v1/user', { headers: { 'xi-api-key': c.key } })
    return r.ok
  }
  if (id === 'fal') return Boolean(c.key) // fal has no free auth-check endpoint
  return false
}

export default function comfyfieldApi() {
  return {
    name: 'comfyfield-api',
    configureServer: (server) => mount(server.middlewares),
    configurePreviewServer: (server) => mount(server.middlewares),
  }
}

function mount(app) {
  app.use(async (req, res, next) => {
    const url = new URL(req.url, 'http://local')
    try {
      if (url.pathname === '/api/connections' && req.method === 'GET') {
        return send(res, 200, Object.fromEntries(Object.keys(providers).map((id) => {
          const c = config(id)
          return [id, { connected: Boolean(id === 'comfy' ? c.url || c.key : c.key), url: c.url, key: mask(c.key) }]
        })))
      }
      if (url.pathname === '/api/connections' && req.method === 'POST') {
        const { id, values } = await body(req)
        if (!providers[id]) return send(res, 400, { error: 'Unknown provider' })
        const keys = readKeys()
        keys[id] = { ...keys[id], ...values }
        writeKeys(keys)
        return send(res, 200, { ok: true })
      }
      if (url.pathname === '/api/connections/test' && req.method === 'POST') {
        const { id } = await body(req)
        return send(res, 200, { ok: await testConnection(id).catch(() => false) })
      }
      if (url.pathname === '/api/fal' && req.method === 'POST') {
        return send(res, 200, { files: await runFal(await body(req)) })
      }
      if (url.pathname === '/api/fal/models') return send(res, 200, await falModels(url.searchParams.toString()))
      if (url.pathname === '/api/fal/schema') return send(res, 200, await falSchema(url.searchParams.get('id')))
      if (url.pathname === '/api/elevenlabs' && req.method === 'POST') {
        return send(res, 200, { files: await runElevenLabs(await body(req)) })
      }
      if (url.pathname === '/api/google' && req.method === 'POST') {
        return send(res, 200, { files: await runGoogle(await body(req)) })
      }
      if (url.pathname.startsWith('/media/')) {
        const file = path.join(MEDIA, path.basename(url.pathname))
        if (!fs.existsSync(file)) return send(res, 404, { error: 'Not found' })
        res.setHeader('Content-Type', mediaTypes[path.extname(file).slice(1)] || 'application/octet-stream')
        return fs.createReadStream(file).pipe(res)
      }
      if (url.pathname.startsWith('/comfy/')) return proxyComfy(req, res, url)
    } catch (e) {
      return send(res, e.status || 500, { error: e.message })
    }
    next()
  })
}

async function proxyComfy(req, res, url) {
  const c = config('comfy')
  const target = `${c.url || 'http://127.0.0.1:8188'}${url.pathname.replace(/^\/comfy/, '')}${url.search}`
  const headers = { 'Content-Type': req.headers['content-type'] || 'application/json' }
  if (c.key) headers['X-API-Key'] = c.key
  let upstream
  try {
    upstream = await fetch(target, { method: req.method, headers, body: req.method === 'POST' ? JSON.stringify(await body(req)) : undefined })
  } catch {
    return send(res, 502, { error: 'Could not reach ComfyUI. Check the URL in Connections.' })
  }
  res.statusCode = upstream.status
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream')
  res.end(Buffer.from(await upstream.arrayBuffer()))
}
