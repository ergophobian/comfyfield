// Local API for ComfyField. Runs inside the Vite server, so `npm run dev` is the whole app.
// Keys are saved to .comfyfield/keys.json on this machine and never sent to the browser.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

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

const mediaTypes = { mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4', png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon' }

// Thumbnails and prices for specific fal endpoints. Prices need a fal key; thumbnails do not.
async function falMeta(ids) {
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
async function balances() {
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
    if (d.character_limit) out.elevenlabs = { left: d.character_limit - d.character_count, unit: 'characters' }
  }
  if (config('google').key) out.google = { note: 'Billed to your Google Cloud account' }
  return out
}

// Turns one idea into N distinct prompts with a cheap Gemini text model.
async function writePrompts({ idea, n = 6, kind = 'video' }) {
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


// Library: characters, products and brand kits in .comfyfield/library.json, images in media.
const LIB = path.join(DIR, 'library.json')
const shape = {
  characters: { name: 's', notes: 's', images: ['a', 6] },
  products: { name: 's', description: 's', price: 's', url: 's', images: ['a', 8] },
  brands: { name: 's', logo: 's', voice: 's', url: 's', colors: ['a', 8] },
}

function readLib() {
  try { return JSON.parse(fs.readFileSync(LIB, 'utf8')) } catch { return {} }
}

function writeLib(lib) {
  fs.mkdirSync(DIR, { recursive: true })
  fs.writeFileSync(LIB, JSON.stringify(lib, null, 2))
}

function clean(type, data) {
  const out = {}
  for (const [k, kind] of Object.entries(shape[type])) {
    if (!(k in data)) continue
    out[k] = Array.isArray(kind)
      ? (Array.isArray(data[k]) ? data[k].filter((v) => typeof v === 'string').slice(0, kind[1]) : [])
      : String(data[k] ?? '').slice(0, 2000)
  }
  return out
}

const extOf = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico' }

function saveDataUrl(dataUrl) {
  const m = /^data:([\w.+/-]+);base64,(.+)$/s.exec(dataUrl || '')
  if (!m || !extOf[m[1]]) throw Object.assign(new Error('Upload a png, jpg, webp, gif or svg image.'), { status: 400 })
  return saveMedia(Buffer.from(m[2], 'base64'), extOf[m[1]])
}

async function libraryRoute(req, res, url) {
  const m = /^\/api\/library\/(characters|products|brands)(?:\/([\w-]+))?$/.exec(url.pathname)
  if (!m) return false
  const [, type, id] = m
  const lib = readLib()
  const list = lib[type] || []
  if (req.method === 'GET' && !id) return send(res, 200, list), true
  if (req.method === 'POST' && !id) {
    const item = { id: crypto.randomUUID(), ...clean(type, await body(req)), created: Date.now() }
    if (!item.name?.trim()) return send(res, 400, { error: 'Give it a name first.' }), true
    writeLib({ ...lib, [type]: [item, ...list] })
    return send(res, 200, item), true
  }
  const at = list.findIndex((x) => x.id === id)
  if (at < 0) return send(res, 404, { error: 'Not found' }), true
  if (req.method === 'PATCH') {
    const item = { ...list[at], ...clean(type, await body(req)) }
    writeLib({ ...lib, [type]: list.map((x, i) => (i === at ? item : x)) })
    return send(res, 200, item), true
  }
  if (req.method === 'DELETE') {
    writeLib({ ...lib, [type]: list.filter((x) => x.id !== id) })
    return send(res, 200, { ok: true }), true
  }
  return false
}

const decode = (s = '') => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'").trim()

function attrs(tag) {
  const out = {}
  for (const a of tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) out[a[1].toLowerCase()] = decode(a[3] ?? a[4])
  return out
}

function parsePage(html, base) {
  const meta = {}
  for (const t of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(t[0])
    const k = (a.property || a.name || '').toLowerCase()
    if (k && a.content && !(k in meta)) meta[k] = a.content
  }
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((t) => attrs(t[0])).filter((a) => a.rel && a.href)
  let product = null
  for (const t of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n) => {
        if (!n || product) return
        if (Array.isArray(n)) return n.forEach(walk)
        if (typeof n !== 'object') return
        const types = [].concat(n['@type'] || [])
        if (types.includes('Product')) product = n
        else walk(n['@graph'])
      }
      walk(JSON.parse(t[1]))
    } catch {}
  }
  const abs = (u) => { try { return new URL(decode(u), base).href } catch { return null } }
  const offer = [].concat(product?.offers || [])[0] || {}
  const amount = offer.price ?? offer.lowPrice ?? meta['product:price:amount'] ?? meta['og:price:amount']
  const currency = offer.priceCurrency || meta['product:price:currency'] || meta['og:price:currency'] || ''
  const price = amount != null && amount !== '' ? `${currency === 'USD' || !currency ? '$' : `${currency} `}${amount}` : ''
  const pimg = [].concat(product?.image || []).map((i) => (typeof i === 'string' ? i : i?.url)).filter(Boolean)
  const images = [meta['og:image'], meta['twitter:image'], ...pimg].filter(Boolean).map(abs).filter(Boolean)
  const icon = links.find((a) => /apple-touch-icon/i.test(a.rel)) || links.find((a) => /(^|\s)icon/i.test(a.rel))
  const title = decode(product?.name || meta['og:title'] || meta['twitter:title'] || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')
  return {
    title,
    description: decode(product?.description || meta['og:description'] || meta.description || ''),
    price,
    images: [...new Set(images)].slice(0, 4),
    siteName: decode(meta['og:site_name'] || ''),
    themeColor: /^#[0-9a-f]{3,8}$/i.test(meta['theme-color'] || '') ? meta['theme-color'] : '',
    logo: abs(icon?.href) || '',
  }
}

async function pullImage(src) {
  try {
    const r = await fetch(src, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': UA } })
    const type = (r.headers.get('content-type') || '').split(';')[0].trim()
    if (!r.ok || !extOf[type]) return null
    const buf = Buffer.from(await r.arrayBuffer())
    return buf.length < 8_000_000 ? saveMedia(buf, extOf[type]) : null
  } catch { return null }
}

const UA = 'Mozilla/5.0 (compatible; ComfyField/0.1; +https://github.com/ergophobian/comfyfield)'

async function importUrl({ url }) {
  let target
  try { target = new URL(url) } catch { throw Object.assign(new Error('That does not look like a web address.'), { status: 400 }) }
  if (!/^https?:$/.test(target.protocol)) throw Object.assign(new Error('Use an http or https address.'), { status: 400 })
  let r
  try { r = await fetch(target, { signal: AbortSignal.timeout(10000), redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' } }) } catch {
    throw Object.assign(new Error('Could not reach that page.'), { status: 502 })
  }
  if (!r.ok) throw Object.assign(new Error(`That page answered ${r.status}.`), { status: 502 })
  const html = (await r.text()).slice(0, 2_000_000)
  const page = parsePage(html, r.url || target.href)
  const images = (await Promise.all(page.images.map(pullImage))).filter(Boolean)
  const logo = page.logo ? await pullImage(page.logo) : null
  return { ...page, images, logo: logo || '', url: target.href, host: target.hostname.replace(/^www\./, '') }
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
      if (url.pathname === '/api/fal/meta') return send(res, 200, await falMeta(url.searchParams.getAll('id')))
      if (url.pathname === '/api/balance') return send(res, 200, await balances())
      if (url.pathname === '/api/prompts' && req.method === 'POST') return send(res, 200, { prompts: await writePrompts(await body(req)) })
      if (url.pathname === '/api/google' && req.method === 'POST') {
        return send(res, 200, { files: await runGoogle(await body(req)) })
      }
      if (url.pathname === '/api/upload' && req.method === 'POST') return send(res, 200, { url: saveDataUrl((await body(req)).dataUrl) })
      if (url.pathname === '/api/library/import' && req.method === 'POST') return send(res, 200, await importUrl(await body(req)))
      if (url.pathname.startsWith('/api/library/') && await libraryRoute(req, res, url)) return
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
