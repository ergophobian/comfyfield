import { createHarness } from './agent-harness.js'
import { problem } from './flows.js'

export function agentRoutes({ harness = createHarness(), body, send }) {
  const unwatch = harness.flows.watch()
  const route = async (req, res, url) => {
    if (!/^\/api\/(agents|flows)(\/|$)/.test(url.pathname)) return false
    const host = req.headers.host
    if (req.socket?.remoteAddress && !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) throw problem('Agent tools are available on localhost only.', 403)
    if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host || '')) throw problem('Agent tools are available on localhost only.', 403)
    const origin = `http://${host}`
    if (req.headers.origin && req.headers.origin !== origin) throw problem('Use the local ComfyField app.', 403)
    const json = (data) => { send(res, 200, data); return true }
    if (url.pathname === '/api/agents/events' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
      res.write(': connected\n\n')
      const off = harness.subscribe((event) => res.write(`id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`))
      const timer = setInterval(() => res.write(': heartbeat\n\n'), 15000)
      res.on('close', () => { off(); clearInterval(timer) })
      return true
    }
    if (url.pathname === '/api/agents/setup' && req.method === 'GET') return json(harness.setup())
    if (url.pathname === '/api/agents' && req.method === 'GET') return json(harness.list())
    if (url.pathname === '/api/agents' && req.method === 'POST') return json(await harness.start((await body(req)).adapter, origin))
    const match = /^\/api\/agents\/([\w-]+)(?:\/(message|approve|stop|tool))?$/.exec(url.pathname)
    if (match) {
      const [, id, action] = match
      if (req.method === 'GET' && !action) return json(harness.get(id))
      if (req.method !== 'POST') throw problem('Method not allowed', 405)
      if (action === 'tool' && !harness.authorize(id, req.headers.authorization)) throw problem('Invalid session token', 403)
      const data = await body(req)
      if (action === 'message') return json(await harness.send(id, data.text))
      if (action === 'approve') {
        if (typeof data.approved !== 'boolean') throw problem('Choose approve or reject')
        return json(harness.decide(id, data.planId, data.approved))
      }
      if (action === 'stop') return json(await harness.stop(id))
      if (action === 'tool') return json(await harness.call(id, data.name, data.args))
    }
    if (url.pathname === '/api/flows' && req.method === 'GET') return json(harness.flows.read())
    if (url.pathname === '/api/flows' && req.method === 'PUT') return json(harness.flows.save(await body(req)))
    const run = /^\/api\/flows\/([\w-]+)\/action$/.exec(url.pathname)
    if (run && req.method === 'POST') {
      const { action, node, item } = await body(req)
      return json(await harness.flows.perform(run[1], action, node, item))
    }
    throw problem('Not found', 404)
  }
  route.close = () => { unwatch(); return harness.close() }
  return route
}
