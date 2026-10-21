// Every shipped ComfyUI graph against the node schema of the ComfyUI the Pod and Comfy Cloud run
// (scripts/fixtures/comfy-nodes.json, built by scripts/node-schema.mjs): each node exists, in core or
// in a listed pack; each input name exists; required inputs are set; links point at a real output of
// a type the input takes; literal values fit their type and combo options; no node is a paid partner
// node (comfy_api_nodes), so every shipped graph, the picker's and the formats', is open weights. No ComfyUI runs here.
import fs from 'node:fs'
import { NODE_PACKS, RUNTIMES, LOADERS } from '../shared/modelFiles.js'

const schema = JSON.parse(fs.readFileSync('scripts/fixtures/comfy-nodes.json', 'utf8'))
const dir = process.argv[2] || 'public/workflows'

// A pack node counts only when the pack lists it, so the Pod knows to install the pack.
function spec(type) {
  if (schema.nodes[type]) return { node: schema.nodes[type] }
  for (const [id, p] of Object.entries(schema.packs)) {
    if (!p.nodes[type]) continue
    if (!NODE_PACKS[id]?.classes.includes(type)) return { error: `${type} is in ${NODE_PACKS[id]?.name || id}, but the pack's classes in shared/modelFiles.js do not list it, so no Pod would install the pack` }
    return { node: p.nodes[type], pack: id }
  }
  // A runtime with its own env (FreeVideo) checks its nodes where it is pinned.
  if (Object.values(RUNTIMES).some((r) => !r.pack && r.nodes.test?.(type))) return { unchecked: true }
  return { error: `${type} is no node of ComfyUI ${schema.comfyui} or of a listed pack` }
}

// VideoHelperSuite adds a format's own options from video_formats/<format>.json, which the registry's
// scan cannot list. These are video/webm's at the pinned commit 4d907bee.
const FORMAT_OPTIONS = {
  VHS_VideoCombine: {
    'video/webm': { pix_fmt: [['yuv420p', 'yuva420p'], 0], crf: ['INT', 0], save_metadata: ['BOOLEAN', 0], trim_to_audio: ['BOOLEAN', 0] },
  },
}

const placeholder = (v) => typeof v === 'string' && /\{\{\w+\}\}/.test(v)
const isLink = (v) => Array.isArray(v) && v.length === 2 && typeof v[0] === 'string' && Number.isInteger(v[1])
const accepts = (want, got) => want === '*' || got === '*' || got === 'COMFY_MATCHTYPE_V3' || want.split(',').includes(got) || (want === 'COMBO' && got === 'STRING')

function literal(want, v) {
  if (Array.isArray(want)) return !want.length || want.includes(v) ? null : `${JSON.stringify(v)} is not one of its options`
  if (want === 'INT') return Number.isInteger(v) ? null : 'needs a whole number'
  if (want === 'FLOAT') return typeof v === 'number' ? null : 'needs a number'
  if (want === 'BOOLEAN') return typeof v === 'boolean' ? null : 'needs true or false'
  if (want === 'STRING') return typeof v === 'string' ? null : 'needs text'
  return null
}

export function checkGraph(graph) {
  const problems = []
  const bad = (id, msg) => problems.push(`node ${id} (${graph[id]?.class_type}): ${msg}`)
  const specs = {}
  for (const [id, n] of Object.entries(graph)) {
    if (!n || typeof n.class_type !== 'string' || typeof n.inputs !== 'object') { problems.push(`node ${id}: needs class_type and inputs`); continue }
    const s = spec(n.class_type)
    if (s.error) bad(id, s.error)
    // The Open Weights Only prize allows no partner nodes, and they spend Comfy credits and cannot run on a Pod.
    if (s.node?.api) bad(id, 'is a paid Comfy partner node, not open weights; ship an open-weights graph instead')
    specs[id] = s
  }
  const outType = (link) => {
    const [from, i] = link
    const s = specs[from]
    if (!graph[from]) return { error: `links to node ${from}, which does not exist` }
    if (!s?.node) return { type: '*' }
    if (i >= s.node.out.length) return { error: `links to output ${i} of node ${from}, which has ${s.node.out.length}` }
    return { type: s.node.out[i] }
  }
  for (const [id, n] of Object.entries(graph)) {
    const s = specs[id]
    if (!s?.node) continue
    const ins = { ...s.node.in, ...FORMAT_OPTIONS[n.class_type]?.[n.inputs.format] }
    // Inputs a dynamic combo's choice brings, and an autogrow's names.
    const nested = (name) => {
      const [parent, child] = [name.slice(0, name.indexOf('.')), name.slice(name.indexOf('.') + 1)]
      const p = ins[parent]
      if (!p) return { error: `has no input ${parent}` }
      if (p[0] === 'COMFY_DYNAMICCOMBO_V3') {
        const opt = p[2]?.[n.inputs[parent]]
        if (!opt) return placeholder(n.inputs[parent]) ? { spec: ['*', 0] } : { error: `${parent} has no choice ${JSON.stringify(n.inputs[parent])}` }
        return opt[child] ? { spec: opt[child] } : { error: `${parent} ${JSON.stringify(n.inputs[parent])} has no input ${child}` }
      }
      if (p[0] === 'COMFY_AUTOGROW_V3') {
        const { names = [], ...tpl } = p[2] || {}
        if (names.length && !names.includes(child)) return { error: `${parent} has no slot ${child}` }
        return { spec: Object.values(tpl)[0] || ['*', 0] }
      }
      if (p[0] === 'COMFY_DYNAMICGROUP_V3') return { spec: ['*', 0] }
      return { error: `${parent} takes no ${child}` }
    }
    for (const [name, v] of Object.entries(n.inputs)) {
      const found = name.includes('.') ? nested(name) : ins[name] ? { spec: ins[name] } : { error: `has no input ${name}` }
      if (found.error) { bad(id, found.error); continue }
      const [want] = found.spec
      if (isLink(v)) {
        const out = outType(v)
        if (out.error) bad(id, `${name} ${out.error}`)
        else if (!Array.isArray(want) && !accepts(want, out.type)) bad(id, `${name} takes ${want}, but node ${v[0]} gives ${out.type}`)
      } else if (!placeholder(v) && !['COMFY_DYNAMICCOMBO_V3', 'COMFY_AUTOGROW_V3', 'COMFY_DYNAMICGROUP_V3'].includes(want)) {
        // A loader's file list is whatever the machine holds; the model list checks those names.
        const why = LOADERS[n.class_type]?.[name] ? null : literal(want, v)
        if (why) bad(id, `${name} ${why}`)
      } else if (want === 'COMFY_DYNAMICCOMBO_V3' && !placeholder(v)) {
        const opt = found.spec[2]?.[v]
        if (!opt) bad(id, `${name} has no choice ${JSON.stringify(v)}`)
        else for (const [child, c] of Object.entries(opt)) if (c[1] && !(`${name}.${child}` in n.inputs)) bad(id, `${name} ${JSON.stringify(v)} needs ${child}`)
      }
    }
    for (const [name, [want, required]] of Object.entries(ins)) {
      if (required && !(name in n.inputs) && want !== 'COMFY_AUTOGROW_V3' && want !== 'COMFY_DYNAMICGROUP_V3') bad(id, `needs ${name}`)
    }
  }
  // A node that drops without its file may feed only inputs ComfyUI lets go empty, or nodes that drop with it.
  for (const [id, n] of Object.entries(graph)) {
    const key = n?._meta?.optional
    if (!key) continue
    for (const [to, m] of Object.entries(graph)) {
      for (const [name, v] of Object.entries(m?.inputs || {})) {
        if (!isLink(v) || v[0] !== id || m._meta?.optional === key) continue
        const s = specs[to]?.node
        const required = name.includes('.') ? 0 : s?.in[name]?.[1]
        if (required) bad(to, `${name} is required, so it cannot link to node ${id}, which drops without ${key}`)
      }
    }
  }
  return problems
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/').replace(/^(?=[A-Za-z]:)/, '/')}`) {
  let failed = 0
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  for (const f of files) {
    const problems = checkGraph(JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8')))
    if (problems.length) { failed++; console.log(`${f}:\n  ${problems.join('\n  ')}`) }
  }
  console.log(`Graph check: ${files.length - failed}/${files.length} graphs fit ComfyUI ${schema.comfyui} and the listed packs.`)
  process.exitCode = failed ? 1 : 0
}
