const loopback = new Set(['localhost', '127.0.0.1', '[::1]'])

export function bindHost(env = process.env, warn = console.warn) {
  const host = env.COMFYFIELD_HOST || '127.0.0.1'
  if (!loopback.has(host)) warn('ComfyField is listening beyond localhost because COMFYFIELD_HOST is set. Anyone who can reach this address may use your saved connections and spend credits. Use a trusted network and firewall.')
  return host
}

export function allowedApiRequest(headers, env = process.env) {
  const host = headers.host
  if (typeof host !== 'string' || !/^(\[[\da-f:]+\]|[\w.-]+)(?::\d+)?$/i.test(host)) return false
  let hostname
  try { hostname = new URL(`http://${host}`).hostname } catch { return false }
  if (!loopback.has(hostname) && hostname !== env.COMFYFIELD_HOST?.toLowerCase()) return false
  const site = headers['sec-fetch-site']
  if (site && site !== 'same-origin' && site !== 'none') return false
  return !headers.origin || headers.origin === `http://${host}`
}
