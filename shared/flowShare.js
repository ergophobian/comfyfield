// What a shared flow carries. Shared by the canvas (Download), the server (gist share and import) and
// the checks, so a shared flow never holds keys, results or files that only exist on this machine.
import { nodeTypes, connectionProblem } from './flowRules.js'
import { widgetTypes } from './widgetInputs.js'

export const FLOW_SUFFIX = '.comfyfield.json'
export const SHARE_LIMIT = 1024 * 1024

// Uploads and run outputs live under /media, /comfy or a browser blob; none of them open anywhere else.
const LOCAL = /^(data:|blob:|file:|\/media\/|\/comfy\/|\/mock-media\/|[a-z]:[\\/]|\\\\|\/(users|home|tmp|var|private)\/)/i
export const isLocalMedia = (value) => typeof value === 'string' && LOCAL.test(value.trim())

// Any local path left in node data (a pasted /media URL in a prompt field, say) is dropped too.
function scrub(value) {
  if (Array.isArray(value)) return value.map(scrub)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrub(v)]))
  return isLocalMedia(value) ? null : value
}

function shareData(type, data = {}) {
  if (type === 'image') return { ...data, url: null, name: '' }
  if (widgetTypes.includes(type)) return { ...data, value: null }
  if (type === 'stitch') {
    const { music, clips = [], ...rest } = data
    // Connected clips come from upstream nodes and carry no file; uploaded clips stay behind.
    return { ...rest, clips: clips.filter((c) => c?.upstream).map(({ url, ...c }) => c), ...(music && { music: { volume: music.volume } }) }
  }
  return data
}

export function shareFlow(flow) {
  return {
    comfyfield: 'flow',
    version: 1,
    flow: {
      name: String(flow.name || 'Shared flow'),
      nodes: flow.nodes.map(({ id, type, position, data }) => ({ id, type, position: { x: position?.x ?? 0, y: position?.y ?? 0 }, data: scrub(shareData(type, data)) })),
      edges: flow.edges.map(({ id, source, target }) => ({ id, source, target })),
    },
  }
}

export const shareText = (flow) => JSON.stringify(shareFlow(flow), null, 2)
export const shareFileName = (name) => `${String(name || '').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'flow'}${FLOW_SUFFIX}`

const fail = (message) => Object.assign(new Error(message), { status: 400 })

// Reads a shared flow file or gist. Returns { name, nodes, edges } stripped like a share, or throws a
// sentence that says what is wrong.
export function parseSharedFlow(text) {
  if (typeof text !== 'string' || !text.trim()) throw fail('The file is empty.')
  if (text.length > SHARE_LIMIT) throw fail('The flow is larger than 1 MB. Shared flows hold no media, so check that this is a flow file.')
  let raw
  try { raw = JSON.parse(text) } catch { throw fail('This file is not JSON. Pick a .comfyfield.json flow file.') }
  if (raw?.comfyfield && raw.comfyfield !== 'flow') throw fail(raw.comfyfield === 'format' ? 'This is a format file. Import it on the Apps page.' : 'This file is not a ComfyField flow.')
  const f = raw?.flow || raw
  if (!f || typeof f !== 'object' || !Array.isArray(f.nodes) || !Array.isArray(f.edges)) throw fail('This file is not a ComfyField flow.')
  if (f.nodes.length > 500 || f.edges.length > 2000) throw fail('This flow has too many nodes to import.')
  const ids = new Set()
  for (const n of f.nodes) {
    if (!n || typeof n.id !== 'string' || !/^[\w-]{1,64}$/.test(n.id) || ids.has(n.id)) throw fail('Every node needs its own id. The file may be damaged.')
    ids.add(n.id)
    if (!nodeTypes.includes(n.type)) throw fail(`This flow uses a node type this version does not know (${String(n.type).slice(0, 40)}).`)
    if (n.data != null && (typeof n.data !== 'object' || Array.isArray(n.data))) throw fail(`Node "${n.id}" has damaged settings.`)
    if (n.position != null && !(Number.isFinite(n.position.x) && Number.isFinite(n.position.y))) throw fail(`Node "${n.id}" has a damaged position.`)
  }
  const shared = shareFlow({ name: typeof f.name === 'string' && f.name.trim() ? f.name.trim().slice(0, 120) : 'Imported flow', nodes: f.nodes.map((n) => ({ ...n, data: n.data || {} })), edges: [] }).flow
  const built = { ...shared, edges: [] }
  for (const e of f.edges) {
    const issue = connectionProblem(built, e?.source, e?.target)
    if (issue) throw fail(`The flow has a connection this version cannot use. ${issue}`)
    built.edges.push({ id: `${e.source}-${e.target}`, source: e.source, target: e.target })
  }
  return { name: shared.name, nodes: shared.nodes, edges: built.edges }
}

// "Imported from ..." for the canvas. Origin is { kind: 'gist' | 'file', url?, owner?, name?, at }.
export function originLabel(origin) {
  if (!origin) return ''
  const where = origin.kind === 'gist' ? `${origin.owner ? `${origin.owner}'s` : 'a'} gist` : origin.name || 'a file'
  return `Imported from ${where}`
}
