// Local API for ComfyField. Runs inside the Vite server, so `npm run dev` is the whole app.
// Provider logic lives in core.js so the CLI and MCP server share it.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import * as core from './core.js'
import { POD_VOLUMES } from './pod.js'
import { TIER_IDS, jobSecondsOf, tierPicks } from '../shared/gpuTiers.js'
import { archOf } from '../shared/modelFiles.js'
import { upload } from './upload.js'
import { serveMedia } from './serveMedia.js'
import { agentRoutes } from './agent-routes.js'

export { providers } from './core.js'

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

export default function comfyfieldApi({ harness } = {}) {
  return {
    name: 'comfyfield-api',
    configureServer: (server) => mount(server, harness),
    configurePreviewServer: (server) => mount(server, harness),
  }
}

// Pod actions from the chip and the start sheet. Only these start, pause, resume or terminate a Pod.
// A workflow name decides the GPU memory, the disk and the runtimes; a workflow with a file no Pod can get fails here.
const podNeeds = (workflow) => (workflow ? core.podNeedsFor(workflow) : { files: [], runtimes: [], minVramGb: 0, volumeGb: 60 })

// What a Session costs for a workflow: the Budget, Balanced and Performance picks over the GPUs that
// fit it, at live prices, and what the Pod downloads before the first run.
async function sessionQuote(workflow) {
  const needs = podNeeds(workflow)
  const all = [...needs.files, ...needs.runtimes]
  const q = await core.pod().quote({ minVramGb: needs.minVramGb, catalog: true, arch: archOf(all) })
  const refSeconds = jobSecondsOf(all)
  return { q, needs, refSeconds, tiers: tierPicks(q.rungs, { refSeconds }) }
}

async function podQuote(workflow) {
  const { q, needs, refSeconds, tiers } = await sessionQuote(workflow)
  return { ...q, tiers, tier: core.podTier(), refSeconds, files: needs.files.map((f) => ({ name: f.name, gb: f.gb })),
    runtimes: needs.runtimes.map((e) => ({ name: e.name, gb: e.gb, minutes: e.minutes })), volumeGb: needs.volumeGb }
}

// A start names a workflow (sized for it, on a Session tier's GPUs), or comes from the Pods page: a size,
// or a GPU picked by hand, a disk size, runtimes to install and services to get ready for. The Pod manager
// checks the GPU and the runtimes. `prepare` gets a running Pod ready for services; `remove` frees one
// model file. Starting, resuming or keeping a Pod is choosing a Session, so later runs use the Pod.
export async function podAction(action, { workflow, now, minVramGb, gpu, volumeGb, runtimes, services, dir, name, tier } = {}) {
  const p = core.pod()
  const session = (out) => { core.saveConnection('comfy', { run: 'session' }); return out }
  if (services != null && (!Array.isArray(services) || !services.every((s) => typeof s === 'string'))) throw Object.assign(new Error('Services are a list.'), { status: 400 })
  if (action === 'start' && workflow) {
    if (tier != null && !TIER_IDS.includes(tier)) throw Object.assign(new Error(`The Session tier is ${TIER_IDS.join(', ')}.`), { status: 400 })
    const id = tier || core.podTier()
    const { needs, tiers } = await sessionQuote(workflow)
    const out = await p.start({ minVramGb: needs.minVramGb, volumeGb: needs.volumeGb, runtimes: needs.runtimes.map((e) => e.runtime),
      order: tiers.find((t) => t.id === id)?.order, tier: id })
    core.saveConnection('runpod', { tier: id })
    return session(out)
  }
  if (action === 'start') {
    if (volumeGb != null && !POD_VOLUMES.includes(Number(volumeGb))) throw Object.assign(new Error(`Pick a disk of ${POD_VOLUMES.join(', ')} GB.`), { status: 400 })
    if (runtimes != null && !Array.isArray(runtimes)) throw Object.assign(new Error('Runtimes are a list.'), { status: 400 })
    const ready = services?.length ? await core.podPrepareFor(services) : null
    return session(await p.start({ minVramGb: Math.max(0, Number(minVramGb) || 0, ready?.minVramGb || 0), volumeGb: Math.max(Number(volumeGb) || POD_VOLUMES[0], ready?.volumeGb || 0),
      runtimes: (runtimes || []).map(String), gpu: gpu ? { gpuTypeId: String(gpu.gpuTypeId), cloudType: String(gpu.cloudType) } : null, prepare: ready }))
  }
  if (action === 'prepare') {
    if (!services?.length) throw Object.assign(new Error('Pick a service to get ready for.'), { status: 400 })
    return p.prepare(await core.podPrepareFor(services, p.vramGb()))
  }
  if (action === 'remove') {
    if (typeof dir !== 'string' || typeof name !== 'string') throw Object.assign(new Error('Name the file to remove.'), { status: 400 })
    return p.remove({ dir, name })
  }
  if (action === 'pause') return p.pause({ now: Boolean(now) })
  if (action === 'resume') return session(await p.resume())
  if (action === 'terminate') return p.terminate({ now: Boolean(now) })
  if (action === 'keep') return session(await p.keep())
  throw Object.assign(new Error('Unknown Pod action'), { status: 404 })
}

// A page on another site can send a request to localhost even when it cannot read the answer.
// Browsers mark those; tools like curl and the CLI send neither header.
export function crossSite(headers) {
  const site = headers['sec-fetch-site']
  if (site && site !== 'same-origin' && site !== 'none') return true
  const origin = headers.origin
  if (!origin) return false
  try { return new URL(origin).host !== headers.host } catch { return true }
}

function mount(server, harness) {
  // The app's server is the one process that watches the Pod: heartbeats, spend and the guards.
  // Vite restarts its server when a config file changes, so the monitor stops with it.
  core.pod().startMonitor()
  const agents = agentRoutes({ body, send, harness })
  server.httpServer?.once('close', () => { core.pod().stopMonitor(); agents.close().catch(() => {}) })
  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url, 'http://local')
    // Anything that spends money or changes saved data must come from ComfyField's own pages.
    if (url.pathname.startsWith('/api/') && req.method !== 'GET' && crossSite(req.headers)) return send(res, 403, { error: 'Requests from other sites are refused.' })
    try {
      if (url.pathname === '/api/pod' && req.method === 'GET') {
        const { mode, key } = core.config('comfy')
        // instant: Comfy Cloud can take runs at once.
        const status = await core.podStatus()
        const suggest = mode === 'cloud' && status.phase === 'none' && status.connected ? await core.podSuggestion() : null
        // run: the generation type the user picked (null until they pick); tier: their Session tier.
        return send(res, 200, { ...status, mode, instant: Boolean(key), auto: core.podAutoStart(), suggest, run: core.runType(), tier: core.podTier() })
      }
      if (url.pathname === '/api/comfy/requirements' && req.method === 'POST') return send(res, 200, core.formatRequirements((await body(req)).workflows))
      if (url.pathname === '/api/pod/quote') return send(res, 200, await podQuote(url.searchParams.get('workflow')))
      if (url.pathname === '/api/pod/options' && req.method === 'GET') return send(res, 200, await core.podOptions())
      if (url.pathname.startsWith('/api/pod/') && req.method === 'POST') return send(res, 200, await podAction(url.pathname.slice('/api/pod/'.length), await body(req)))
      if (await agents(req, res, url)) return
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
      if (url.pathname === '/api/comfy/router/models') return send(res, 200, await core.listComfyRouterModels(Object.fromEntries(url.searchParams)))
      if (url.pathname === '/api/comfy/router' && req.method === 'POST') return send(res, 200, { files: await core.runComfyRouter(await body(req)) })
      if (url.pathname === '/api/comfy/run' && req.method === 'POST') {
        const { workflow, vars } = await body(req)
        const files = await core.runComfy(workflow, vars)
        const base = (core.config('comfy').url || 'http://127.0.0.1:8188').replace(/\/+$/, '')
        return send(res, 200, { files: files.map(({ path: localPath, ...f }) => ({ ...f, url: f.url.startsWith(`${base}/`) ? `/comfy${f.url.slice(base.length)}` : f.url })) })
      }
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
      if (url.pathname === '/api/upload' && req.method === 'POST') return send(res, 200, await upload(req, core.saveMedia))
      if (url.pathname === '/api/stitch' && req.method === 'POST') return send(res, 200, await core.stitch(await body(req)))
      if (url.pathname === '/api/stitch/exports' && req.method === 'GET') return send(res, 200, core.stitchedExports())
      if (url.pathname === '/api/stitch/export' && req.method === 'POST') return send(res, 200, core.exportStitch((await body(req)).url))
      if (url.pathname === '/api/stitch/export' && req.method === 'DELETE') {
        core.dismissStitch((await body(req)).url)
        return send(res, 200, { ok: true })
      }
      if (url.pathname === '/api/stitch/upload' && req.method === 'POST') {
        return send(res, 200, await upload(req, core.saveMedia))
      }
      if (url.pathname === '/api/library/import' && req.method === 'POST') return send(res, 200, await importUrl(await body(req)))
      if (url.pathname.startsWith('/api/library/') && await libraryRoute(req, res, url)) return
      if (url.pathname.startsWith('/media/')) {
        const file = core.mediaPath(url.pathname)
        if (!fs.existsSync(file)) return send(res, 404, { error: 'Not found' })
        return serveMedia(req, res, file, core.mediaTypes[path.extname(file).slice(1)] || 'application/octet-stream')
      }
      if (url.pathname.startsWith('/comfy/')) return proxyComfy(req, res, url)
    } catch (e) {
      return send(res, e.status || 500, { error: e.message, ...(e.code ? { code: e.code } : {}), ...(e.reason ? { reason: e.reason } : {}) })
    }
    next()
  })
}

async function proxyComfy(req, res, url) {
  const c = core.config('comfy')
  const target = `${(c.url || 'http://127.0.0.1:8188').replace(/\/+$/, '')}${url.pathname.replace(/^\/comfy/, '')}${url.search}`
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
