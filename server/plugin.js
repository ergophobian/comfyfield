// Local API for ComfyField. Runs inside the Vite server, so `npm run dev` is the whole app.
// Provider logic lives in core.js so the CLI and MCP server share it.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import * as core from './core.js'

export { providers } from './core.js'

async function body(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  return raw ? JSON.parse(raw) : {}
}

async function rawBody(req, limit = 40 * 1024 * 1024) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw Object.assign(new Error('That file is too large (40 MB max).'), { status: 413 })
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

// Accepts a raw image body, or JSON { dataUrl } / { data, type } where data is base64 or a data URI.
async function upload(req) {
  const type = (req.headers['content-type'] || '').split(';')[0]
  let buf
  let mime = type
  if (type === 'application/json') {
    const json = JSON.parse((await rawBody(req)).toString('utf8') || '{}')
    const data = json.dataUrl || json.data || ''
    const m = /^data:([^;,]+);base64,/.exec(data)
    mime = m ? m[1] : json.type || 'image/png'
    buf = Buffer.from(m ? data.slice(m[0].length) : data, 'base64')
  } else {
    buf = await rawBody(req)
  }
  if (!buf.length) throw Object.assign(new Error('No file received.'), { status: 400 })
  if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(mime)) throw Object.assign(new Error('Attach a PNG, JPG, WebP, GIF or SVG image.'), { status: 415 })
  return { url: core.saveMedia(buf, core.mimeExt(mime)).url, type: mime }
}

function send(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

const libFile = () => path.join(core.home(), 'library.json')
const shape = {
  characters: { name: 's', notes: 's', images: ['a', 6] },
  products: { name: 's', description: 's', price: 's', url: 's', images: ['a', 8] },
  brands: { name: 's', logo: 's', voice: 's', url: 's', colors: ['a', 8] },
}

function readLib() {
  try { return JSON.parse(fs.readFileSync(libFile(), 'utf8')) } catch { return {} }
}

function writeLib(lib) {
  fs.mkdirSync(core.home(), { recursive: true })
  fs.writeFileSync(libFile(), JSON.stringify(lib, null, 2))
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
  return core.saveMedia(Buffer.from(m[2], "base64"), extOf[m[1]]).url
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
    return buf.length < 8_000_000 ? core.saveMedia(buf, extOf[type]).url : null
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
      if (url.pathname === '/api/connections' && req.method === 'GET') return send(res, 200, core.connections())
      if (url.pathname === '/api/connections' && req.method === 'POST') {
        const { id, values } = await body(req)
        core.saveConnection(id, values)
        return send(res, 200, { ok: true })
      }
      if (url.pathname === '/api/connections/test' && req.method === 'POST') {
        const { id } = await body(req)
        return send(res, 200, { ok: await core.testConnection(id).catch(() => false) })
      }
      if (url.pathname === '/api/fal' && req.method === 'POST') {
        return send(res, 200, { files: await core.runFal(await body(req)) })
      }
      if (url.pathname === '/api/fal/models') return send(res, 200, await core.falModels(url.searchParams.toString()))
      if (url.pathname === '/api/fal/schema') return send(res, 200, await core.falSchema(url.searchParams.get('id')))
      if (url.pathname === '/api/elevenlabs' && req.method === 'POST') {
        return send(res, 200, { files: await core.runElevenLabs(await body(req)) })
      }
      if (url.pathname === '/api/fal/meta') return send(res, 200, await core.falMeta(url.searchParams.getAll('id')))
      if (url.pathname === '/api/balance') return send(res, 200, await core.balances())
      if (url.pathname === '/api/prompts' && req.method === 'POST') return send(res, 200, { prompts: await core.writePrompts(await body(req)) })
      if (url.pathname === '/api/prompt' && req.method === 'POST') return send(res, 200, { text: await core.writePrompt(await body(req)) })
      if (url.pathname === '/api/google' && req.method === 'POST') {
        return send(res, 200, { files: await core.runGoogle(await body(req)) })
      }
      if (url.pathname === '/api/upload' && req.method === 'POST') return send(res, 200, await upload(req))
      if (url.pathname === '/api/library/import' && req.method === 'POST') return send(res, 200, await importUrl(await body(req)))
      if (url.pathname.startsWith('/api/library/') && await libraryRoute(req, res, url)) return
      if (url.pathname.startsWith('/media/')) {
        const file = core.mediaPath(url.pathname)
        if (!fs.existsSync(file)) return send(res, 404, { error: 'Not found' })
        res.setHeader('Content-Type', core.mediaTypes[path.extname(file).slice(1)] || 'application/octet-stream')
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
  const c = core.config('comfy')
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
