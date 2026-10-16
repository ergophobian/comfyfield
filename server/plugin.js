// Local API for ComfyField. Runs inside the Vite server, so `npm run dev` is the whole app.
// Provider logic lives in core.js so the CLI and MCP server share it.
import fs from 'node:fs'
import path from 'node:path'
import * as core from './core.js'

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
      if (url.pathname === '/api/google' && req.method === 'POST') {
        return send(res, 200, { files: await core.runGoogle(await body(req)) })
      }
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
