// Live sync between the canvas, other tabs and agents. Last write wins per node: what this page changed
// since the store it last saw (`base`) is its newer write, so it goes on top of the remote store;
// every node, edge and flow it did not touch comes from the remote store as it is.

export const STALE = 'Flows changed elsewhere. Reload flows before editing again.'

// Canvas state that belongs to one page, never to the shared store.
export const cleanNode = ({ selected, measured, dragging, resizing, ...node }) => node
export const cleanFlow = (flow) => ({ ...flow, nodes: flow.nodes.map(cleanNode) })

const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).filter((k) => value[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`
  return JSON.stringify(value)
}
const same = (a, b) => stable(a) === stable(b)

// Three-way merge of lists of items with ids. `combine` decides an item both sides changed.
function mergeList(base = [], local = [], remote = [], { clean = (x) => x, combine = (b, l) => l } = {}) {
  const before = new Map(base.map((x) => [x.id, x]))
  const mine = new Map(local.map((x) => [x.id, x]))
  const touched = (id) => !same(before.has(id) ? clean(before.get(id)) : null, mine.has(id) ? clean(mine.get(id)) : null)
  const out = []
  const seen = new Set()
  for (const r of remote) {
    seen.add(r.id)
    const l = mine.get(r.id)
    if (!touched(r.id)) out.push(l && same(clean(l), clean(r)) ? l : r)
    else if (l) out.push(combine(before.get(r.id), l, r))
    // Removed here, still there: the removal is the newer write.
  }
  // Added here, or changed here after the remote side removed it.
  for (const l of local) if (!seen.has(l.id) && touched(l.id)) out.push(l)
  return out
}

function mergeFlow(base, local, remote) {
  if (!base) return local
  const nodes = mergeList(base.nodes, local.nodes, remote.nodes, { clean: cleanNode })
  const ids = new Set(nodes.map((n) => n.id))
  const pairs = new Set()
  const edges = mergeList(base.edges, local.edges, remote.edges).filter((e) => {
    const pair = `${e.source}>${e.target}`
    if (!ids.has(e.source) || !ids.has(e.target) || pairs.has(pair)) return false
    pairs.add(pair)
    return true
  })
  const out = { ...remote }
  for (const key of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    if (['nodes', 'edges', 'updated'].includes(key)) continue
    if (!same(base[key], local[key])) out[key] = local[key]
  }
  return { ...out, nodes, edges, updated: Math.max(local.updated || 0, remote.updated || 0) || undefined }
}

// Replays this page's edits since `base` on top of `remote`. Run state stays the server's.
export function mergeStores(base, local, remote) {
  if (!base) return remote
  const flows = mergeList(base.flows, local.flows, remote.flows, { clean: cleanFlow, combine: mergeFlow })
  const pickCurrent = same(base.current, local.current) ? remote.current : local.current
  const current = flows.some((f) => f.id === pickCurrent) ? pickCurrent : (flows[0]?.id ?? null)
  return { ...remote, flows, current }
}

// True when this page has edits the remote store does not have yet.
export const hasEdits = (base, local) => !base || !same(base.flows.map(cleanFlow), local.flows.map(cleanFlow)) || !same(base.current, local.current)
