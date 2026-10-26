// Turns a plain description into a flow draft. The LLM writes JSON; parseDraft keeps only what
// shared/flowRules.js allows and says why it dropped the rest, so the canvas never gets a broken flow.
import { models } from '../src/lib/catalog.js'
import { nodeLabels, nodeDefaults, unknownType, connectionProblem } from './flowRules.js'

const kinds = ['image', 'video', 'audio']
const draftable = ['prompt', 'writer', 'model', 'approve', 'stitch', 'output', 'note', 'image']
const aspects = ['1:1', '16:9', '9:16', '4:5', '4:3', '3:4', '21:9']
const text = (v, max = 4000) => (typeof v === 'string' ? v.slice(0, max) : undefined)

export function draftInstructions() {
  const list = models.filter((m) => kinds.includes(m.kind)).map((m) => `- ${m.id} (${m.kind}): ${m.name}`).join('\n')
  return `You design node flows for ComfyField, a creative studio. Read the user's description and return one flow as JSON only, with no prose and no code fence.

Shape: {"name": "Short sentence case name", "nodes": [{"id": "p1", "type": "prompt", "data": {...}}], "edges": [{"source": "p1", "target": "m1"}]}

Node types and their data:
- prompt: {"mode": "single" | "rows", "text": "..."}. rows means one prompt per line, one run each.
- writer: {"instructions": "...", "note": "...", "target": "image" | "video"}. Writes a prompt the user reviews before it is sent on.
- model: {"model": "<model id from the list>", "aspect": "16:9", "duration": 5, "takes": 1, "prompt": "optional extra prompt"}.
- approve: {}. A gate. Nothing passes until the user picks takes and clicks Send.
- stitch: {}. Joins video clips into one.
- output: {}. A gallery of results. End every branch with one.
- note: {"text": "..."}. A note to the user, never connected.
- image: {}. A reference image the user uploads later.

Connection rules:
- prompt and image only feed other nodes; nothing connects into them.
- A prompt can feed only a model or a writer.
- output and note have no outputs. note has no connections at all.
- No loops, no node connected to itself.

Model ids (use only these):
${list}

Keep flows small: 3 to 8 nodes. Put an approve gate before an expensive video step when the user would want to choose a take first.`
}

// Accepts the raw LLM text. Returns { name, nodes, edges, dropped } where dropped lists what was left out and why.
export function parseDraft(raw, { makeId = (type, i) => `${type}-d${i}` } = {}) {
  const body = String(raw || '').replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  let spec
  try { spec = JSON.parse(body.slice(body.indexOf('{'), body.lastIndexOf('}') + 1)) } catch {
    throw Object.assign(new Error('The draft came back as something other than flow JSON. Try again or describe the flow in other words.'), { status: 502 })
  }
  if (!spec || !Array.isArray(spec.nodes)) throw Object.assign(new Error('The draft has no nodes. Describe what the flow should make.'), { status: 502 })

  const dropped = []
  const ids = new Map()
  const nodes = []
  spec.nodes.slice(0, 24).forEach((n, i) => {
    const ref = String(n?.id ?? i)
    const type = n?.type
    const bad = unknownType(type) || (!draftable.includes(type) && `Drafts cannot add ${nodeLabels[type]} nodes yet. Add one from the toolbar.`)
    if (bad) return dropped.push(`Node "${ref}": ${bad}`)
    if (ids.has(ref)) return dropped.push(`Node "${ref}" is listed twice. Kept the first one.`)
    const id = makeId(type, i)
    ids.set(ref, id)
    nodes.push({ id, type, position: { x: 0, y: 0 }, data: draftData(type, n.data || {}, ref, dropped) })
  })

  const flow = { name: 'Draft', nodes, edges: [] }
  for (const e of Array.isArray(spec.edges) ? spec.edges : []) {
    const s = ids.get(String(e?.source)), t = ids.get(String(e?.target))
    const where = `${e?.source} to ${e?.target}`
    if (!s || !t) { dropped.push(`Connection ${where}: it names a node the draft does not have.`); continue }
    const issue = connectionProblem(flow, s, t)
    if (issue) { dropped.push(`Connection ${where}: ${issue}`); continue }
    flow.edges.push({ id: `${s}-${t}`, source: s, target: t })
  }
  layout(flow)
  return { name: text(spec.name, 80)?.trim() || 'Drafted flow', nodes: flow.nodes, edges: flow.edges, dropped }
}

function draftData(type, data, ref, dropped) {
  const base = nodeDefaults(type)
  if (type === 'prompt') return { ...base, mode: data.mode === 'rows' ? 'rows' : 'single', text: text(data.text) ?? '' }
  if (type === 'writer') return { ...base, ...(text(data.instructions) && { instructions: text(data.instructions) }), note: text(data.note) ?? '', target: data.target === 'video' ? 'video' : 'image' }
  if (type === 'note') return { text: text(data.text) ?? '' }
  if (type !== 'model') return base
  let model = models.find((m) => m.id === data.model && kinds.includes(m.kind))
  if (!model) {
    const kind = kinds.includes(data.kind) ? data.kind : 'image'
    model = models.find((m) => m.kind === kind)
    dropped.push(`Node "${ref}": ${data.model ? `no model "${data.model}"` : 'no model given'}, so it uses ${model.name}. Pick another in the panel.`)
  }
  const out = { ...base, kind: model.kind, model }
  if (aspects.includes(data.aspect) && (!model.aspects || model.aspects.includes(data.aspect))) out.aspect = data.aspect
  if (model.kind === 'video') out.aspect = out.aspect === '1:1' ? '16:9' : out.aspect
  const durations = model.durations || [5]
  if (Number.isFinite(data.duration)) out.duration = durations.reduce((a, b) => (Math.abs(b - data.duration) < Math.abs(a - data.duration) ? b : a))
  if (Number.isInteger(data.takes)) out.takes = Math.min(4, Math.max(1, data.takes))
  if (text(data.prompt)) out.prompt = text(data.prompt)
  return out
}

// Columns by depth from the sources, rows in order within a column.
function layout(flow) {
  const depth = new Map(flow.nodes.map((n) => [n.id, 0]))
  for (let pass = 0; pass < flow.nodes.length; pass++) {
    for (const e of flow.edges) depth.set(e.target, Math.max(depth.get(e.target), depth.get(e.source) + 1))
  }
  const rows = new Map()
  for (const n of flow.nodes) {
    const d = n.type === 'note' ? -1 : depth.get(n.id)
    const r = rows.get(d) || 0
    rows.set(d, r + 1)
    n.position = d < 0 ? { x: 0, y: -200 - r * 160 } : { x: d * 360, y: r * 220 }
  }
}
