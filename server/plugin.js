// Local API for ComfyField. Runs inside the Vite server, so `npm run dev` is the whole app.
// Provider logic lives in core.js so the CLI and MCP server share it.
import fs from 'node:fs'
import path from 'node:path'
import * as core from './core.js'
import { POD_VOLUMES } from './pod.js'
import { TIER_IDS, jobSecondsOf, tierPicks } from '../shared/gpuTiers.js'
import { archOf, downloadSeconds } from '../shared/modelFiles.js'
import { upload } from './upload.js'
import { serveMedia } from './serveMedia.js'
import { agentRoutes } from './agent-routes.js'
import { planStory } from './story.js'
import { voiceRoutes } from './voices.js'
import { libraryStore, libraryRoutes } from './library.js'
import { createJobs } from './jobs.js'
import { allowedApiRequest } from './local-access.js'
import { userFormats } from './userFormats.js'

export { providers } from './core.js'

// ComfyUI hands back its own address; the browser reaches it through the /comfy proxy.
function comfyFiles(files) {
  const base = (core.config('comfy').url || 'http://127.0.0.1:8188').replace(/\/+$/, '')
  return files.map(({ path: localPath, ...f }) => ({ ...f, url: f.url.startsWith(`${base}/`) ? `/comfy${f.url.slice(base.length)}` : f.url }))
}

// The generation routes the browser can run as jobs, keyed by the route it would otherwise call directly.
const runners = {
  '/api/fal': (b, ctx) => core.runFal(b, ctx),
  '/api/comfy/router': (b, ctx) => core.runComfyRouter(b, ctx),
  '/api/comfy/run': async ({ workflow, vars }, ctx) => comfyFiles(await core.runComfy(workflow, vars, ctx)),
  '/api/elevenlabs': (b) => core.runElevenLabs(b),
  '/api/google': (b) => core.runGoogle(b),
}
let jobs
const jobStore = () => (jobs ||= createJobs(path.join(core.home(), 'jobs.json')))

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

const library = libraryStore(core.home)
const voiceRoute = voiceRoutes({ home: core.home, saveMedia: core.saveMedia, library })
const libraryRoute = libraryRoutes({ library, body, send })

const extOf = core.IMAGE_EXT

function saveDataUrl(dataUrl) {
  const m = /^data:([\w.+/-]+);base64,(.+)$/s.exec(dataUrl || '')
  if (!m || !extOf[m[1]]) throw Object.assign(new Error('Upload a png, jpg, webp, gif or svg image.'), { status: 400 })
  return core.saveMedia(Buffer.from(m[2], "base64"), extOf[m[1]]).url
}

const importUrl = (options) => core.readProduct(options)

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
  // downloadSec: about how long the files take on a Pod, before it measures its own rate.
  return { ...q, tiers, tier: core.podTier(), refSeconds, files: needs.files.map((f) => ({ name: f.name, gb: f.gb })),
    downloadSec: downloadSeconds(needs.files.reduce((n, f) => n + (f.bytes ?? f.gb * 1e9), 0)),
    runtimes: needs.runtimes.map((e) => ({ name: e.name, gb: e.gb, minutes: e.minutes })), volumeGb: needs.volumeGb }
}

// The start for a job on a Session tier: sized for it, on the tier's GPUs. The job's files start downloading
// as soon as the Pod's status server answers, while ComfyUI boots; its runtimes install from the Pod's env.
export const sessionStart = (needs, tiers, id) => ({ minVramGb: needs.minVramGb, volumeGb: needs.volumeGb, runtimes: needs.runtimes.map((e) => e.runtime),
  order: tiers.find((t) => t.id === id)?.order, tier: id, prepare: { files: needs.files, runtimes: [] } })

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
    const out = await p.start(sessionStart(needs, tiers, id))
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
  return !allowedApiRequest(headers)
}

function mount(server, harness) {
  // The app's server is the one process that watches the Pod: heartbeats, spend and the guards.
  // Vite restarts its server when a config file changes, so the monitor stops with it.
  core.pod().startMonitor()
  const agents = agentRoutes({ body, send, harness })
  server.httpServer?.once('close', () => { core.pod().stopMonitor(); agents.close().catch(() => {}) })
  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url, 'http://local')
    // Validate even reads: a rebinding domain can present matching Host and Origin headers.
    if ((url.pathname === '/api' || url.pathname.startsWith('/api/')) && crossSite(req.headers)) return send(res, 403, { error: 'Use the local ComfyField app. Requests from other sites are refused.' })
    try {
      if (url.pathname === '/api/postiz/channels' && req.method === 'GET') return send(res, 200, await core.postizChannels())
      if (url.pathname === '/api/postiz/schedule' && req.method === 'POST') return send(res, 200, await core.schedulePost(await body(req)))
      if (url.pathname === '/api/queue' && req.method === 'GET') return send(res, 200, core.queueList({ channel: url.searchParams.get('channel') }))
      if (url.pathname === '/api/queue' && req.method === 'POST') return send(res, 200, core.queueAdd(await body(req)))
      if (url.pathname.startsWith('/api/queue/') && req.method === 'PATCH') return send(res, 200, core.queueUpdate(decodeURIComponent(url.pathname.slice(11)), await body(req)))
      if (url.pathname.startsWith('/api/queue/') && req.method === 'DELETE') return send(res, 200, core.queueRemove(decodeURIComponent(url.pathname.slice(11))))
      if (url.pathname === '/api/pod' && req.method === 'GET') {
        const { mode, key } = core.config('comfy')
        // instant: Comfy Cloud can take runs at once.
        const status = await core.podStatus()
        const suggest = mode === 'cloud' && status.phase === 'none' && status.connected ? await core.podSuggestion() : null
        // run: the generation type the user picked (null until they pick); tier: their Session tier.
        return send(res, 200, { ...status, mode, instant: Boolean(key), auto: core.podAutoStart(), suggest, run: core.runType(), tier: core.podTier() })
      }
      if (url.pathname === '/api/comfy/requirements' && req.method === 'POST') {
        const input = await body(req)
        if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.workflows) ||
          (input.runType != null && !['instant', 'session'].includes(input.runType))) return send(res, 400, { error: 'Supply workflows and a valid run type.' })
        return send(res, 200, await core.formatRequirements(input.workflows, { run: input.runType ?? core.runType() }))
      }
      if (url.pathname === '/api/pod/quote') return send(res, 200, await podQuote(url.searchParams.get('workflow')))
      if (url.pathname === '/api/pod/options' && req.method === 'GET') return send(res, 200, await core.podOptions())
      if (url.pathname.startsWith('/api/pod/') && req.method === 'POST') return send(res, 200, await podAction(url.pathname.slice('/api/pod/'.length), await body(req)))
      if (url.pathname === '/api/story/plan' && req.method === 'POST') return send(res, 200, await planStory(await body(req)))
      if (await agents(req, res, url)) return
      if (url.pathname === '/api/formats' && req.method === 'GET') return send(res, 200, { formats: userFormats.list() })
      if (url.pathname === '/api/formats/import' && req.method === 'POST') return send(res, 200, await userFormats.import(await body(req)))
      if (url.pathname === '/api/formats/share' && req.method === 'POST') return send(res, 200, await userFormats.share((await body(req)).format))
      if (url.pathname.startsWith('/api/formats/') && req.method === 'DELETE') return send(res, 200, { formats: userFormats.remove(decodeURIComponent(url.pathname.slice('/api/formats/'.length))) })
      if (url.pathname === '/api/connections' && req.method === 'GET') return send(res, 200, core.connections())
      if (url.pathname === '/api/connections' && req.method === 'POST') {
        const { id, values } = await body(req)
        core.saveConnection(id, values)
        return send(res, 200, { ok: true })
      }
      if (url.pathname === '/api/connections/test' && req.method === 'POST') {
        const { id } = await body(req)
        return send(res, 200, await core.testConnection(id).then((ok) => ({ ok }), (e) => ({ ok: false, error: e.message })))
      }
      if (url.pathname === '/api/fal' && req.method === 'POST') {
        return send(res, 200, { files: await core.runFal(await body(req)) })
      }
      if (url.pathname === '/api/fal/models') return send(res, 200, await core.falModels(url.searchParams.toString()))
      if (url.pathname === '/api/comfy/models') return send(res, 200, await core.comfyModels())
      if (url.pathname === '/api/comfy/router/models') return send(res, 200, await core.listComfyRouterModels(Object.fromEntries(url.searchParams)))
      if (url.pathname === '/api/comfy/router' && req.method === 'POST') return send(res, 200, { files: await core.runComfyRouter(await body(req)) })
      if (url.pathname === '/api/comfy/run' && req.method === 'POST') {
        const { workflow, vars } = await body(req)
        return send(res, 200, { files: comfyFiles(await core.runComfy(workflow, vars)) })
      }
      if (url.pathname === '/api/jobs' && req.method === 'POST') {
        const { route, body: input } = await body(req)
        const runner = runners[route]
        if (!runner) return send(res, 404, { error: 'That run cannot be started as a job.' })
        return send(res, 200, { id: jobStore().start((ctx) => runner(input || {}, ctx)) })
      }
      if (url.pathname.startsWith('/api/jobs/')) {
        const id = url.pathname.slice('/api/jobs/'.length)
        const job = req.method === 'DELETE' ? jobStore().cancel(id) : jobStore().get(id)
        return job ? send(res, 200, job) : send(res, 404, { error: 'That run is gone. Run it again.' })
      }
      if (url.pathname === '/api/fal/schema') return send(res, 200, await core.falSchema(url.searchParams.get('id')))
      if (url.pathname === '/api/elevenlabs' && req.method === 'POST') {
        return send(res, 200, { files: await core.runElevenLabs(await body(req)) })
      }
      if (url.pathname === '/api/fal/meta') return send(res, 200, await core.falMeta(url.searchParams.getAll('id')))
      if (url.pathname === '/api/balance') return send(res, 200, await core.balances())
      if (url.pathname === '/api/prompts' && req.method === 'POST') return send(res, 200, { prompts: await core.writePrompts(await body(req)) })
      if (url.pathname === '/api/flow-draft' && req.method === 'POST') return send(res, 200, { draft: await core.draftFlow(await body(req)) })
      if (url.pathname === '/api/ads/import' && req.method === 'POST') return send(res, 200, await core.importBusinessPage(await body(req)))
      if (url.pathname === '/api/prompt' && req.method === 'POST') return send(res, 200, { text: await core.writePrompt(await body(req)) })
      if (url.pathname === '/api/google' && req.method === 'POST') {
        return send(res, 200, { files: await core.runGoogle(await body(req)) })
      }
      if (url.pathname === '/api/upload' && req.method === 'POST') return send(res, 200, await upload(req, core.saveMedia))
      if (url.pathname === '/api/stitch/status' && req.method === 'GET') return send(res, 200, await core.stitchStatus())
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
      if (url.pathname.startsWith('/api/library/') && await voiceRoute(req, res, url)) return
      if (url.pathname === '/api/library/generations' && req.method === 'GET') return send(res, 200, core.libraryImports())
      if (url.pathname === '/api/library/generations' && req.method === 'DELETE') {
        core.dismissLibraryImport((await body(req)).id)
        return send(res, 200, { ok: true })
      }
      // Library import and the Ads studio's Read page read a product page the same way, with no keys.
      if ((url.pathname === '/api/product/read' || url.pathname === '/api/library/import') && req.method === 'POST') return send(res, 200, await core.readProduct(await body(req)))
      if (url.pathname.startsWith('/api/library/') && await libraryRoute(req, res, url)) return
      if (url.pathname.startsWith('/media/')) {
        const file = core.mediaPath(url.pathname)
        if (!fs.existsSync(file)) return send(res, 404, { error: 'Not found' })
        return serveMedia(req, res, file, core.mediaTypes[path.extname(file).slice(1)] || 'application/octet-stream')
      }
      if (url.pathname.startsWith('/comfy/')) return proxyComfy(req, res, url)
    } catch (e) {
      return send(res, e.status || 500, { error: e.message, ...(e.uncancelled ? { uncancelled: e.uncancelled } : {}), ...(e.jobId ? { jobId: e.jobId } : {}), ...(e.requestId ? { requestId: e.requestId } : {}), ...(e.idempotencyKey ? { idempotencyKey: e.idempotencyKey } : {}), ...(e.code ? { code: e.code } : {}), ...(typeof e.retryable === 'boolean' ? { retryable: e.retryable } : {}), ...(e.reason ? { reason: e.reason } : {}), ...(e.fit ? { fit: e.fit } : {}) })
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
