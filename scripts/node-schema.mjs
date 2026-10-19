// Builds scripts/fixtures/comfy-nodes.json, the node schema graph-check reads: every core node of the
// ComfyUI version the Pod and Comfy Cloud run, and the nodes of each pack in shared/modelFiles.js.
// It is a development tool, not a check. Run it after moving the ComfyUI pin or adding a pack:
//
//   1. Start that ComfyUI on any machine, CPU is fine:  python main.py --cpu --disable-all-custom-nodes --port 8288
//   2. node scripts/node-schema.mjs http://127.0.0.1:8288     (or a saved object_info.json)
//
// Pack nodes come from the Comfy registry (api.comfy.org), so no pack code runs here. A pack the
// registry lacks, or has without a node scan, takes the schema in scripts/fixtures/pack-nodes.json.
import fs from 'node:fs'
import { NODE_PACKS } from '../shared/modelFiles.js'
import { COMFY_VERSION, COMFY_COMMIT } from '../server/podBoot.js'

const source = process.argv[2]
if (!source) throw new Error('Pass the ComfyUI URL or an object_info.json file.')
const info = source.startsWith('http') ? await (await fetch(`${source.replace(/\/$/, '')}/object_info`)).json() : JSON.parse(fs.readFileSync(source, 'utf8'))
if (source.startsWith('http')) {
  const stats = await (await fetch(`${source.replace(/\/$/, '')}/system_stats`)).json()
  if (`v${stats.system.comfyui_version}` !== COMFY_VERSION) throw new Error(`That ComfyUI is v${stats.system.comfyui_version}; the Pod runs ${COMFY_VERSION}.`)
}

// One input as [type, required, extra]: a combo's type is its option list (empty when it lists model
// files, which the model list checks instead); dynamic inputs keep what their sub-inputs may be.
function input(spec, required) {
  const [type, o = {}] = spec
  if (Array.isArray(type)) return [type, required]
  if (type === 'COMBO') return [o.options || [], required]
  if (type === 'COMFY_DYNAMICCOMBO_V3') return [type, required, Object.fromEntries((o.options || []).map((opt) => [opt.key, inputs(opt.inputs || {})]))]
  if (type === 'COMFY_AUTOGROW_V3') return [type, required, { names: o.template?.names || [], ...inputs(o.template?.input || {}) }]
  if (type === 'COMFY_DYNAMICGROUP_V3') return [type, required, inputs(o.template || {})]
  if (type === 'COMFY_MATCHTYPE_V3') return ['*', required]
  return [type, required]
}
function inputs(spec) {
  return Object.fromEntries([...Object.entries(spec.required || {}).map(([k, v]) => [k, input(v, 1)]), ...Object.entries(spec.optional || {}).map(([k, v]) => [k, input(v, 0)])])
}
const node = (n) => ({ in: inputs(n.input || {}), out: n.output || [], ...(String(n.python_module || '').startsWith('comfy_api_nodes') ? { api: 1 } : {}) })

const nodes = Object.fromEntries(Object.entries(info).sort(([a], [b]) => a.localeCompare(b)).map(([k, n]) => [k, node(n)]))

// The registry scans some versions only, so the newest version whose scan lists the pack's classes
// stands for the pinned commit.
const api = async (p) => (await fetch(`https://api.comfy.org/nodes/${p}`)).json()
async function scan(reg, version) {
  const list = []
  for (let page = 1; ; page++) {
    const r = await api(`${reg}/versions/${version}/comfy-nodes?limit=100&page=${page}`)
    list.push(...(r.comfy_nodes || []))
    if (!r.comfy_nodes?.length || page >= (r.totalNumberOfPages || 1)) break
  }
  return Object.fromEntries(list.map((n) => [n.comfy_node_name, { in: inputs(JSON.parse(n.input_types || '{}')), out: Array.isArray(n.return_types) ? n.return_types : JSON.parse(n.return_types || '[]') }]))
}
// The registry entry whose repository is the pack's repo: some ids differ from the repo name, and one
// repo name (ComfyUI-Qwen-TTS) belongs to another pack. The scans are case-sensitive, so the id is the
// registry's own spelling.
async function registryId(repo) {
  const same = (u) => String(u || '').toLowerCase().replace(/\.git$/, '') === `https://github.com/${repo.toLowerCase()}`
  const r = await api(`search?search=${encodeURIComponent(repo.split('/')[1])}&limit=50`)
  return (r.nodes || []).find((n) => same(n.repository))?.id
}
// Packs the registry does not list come with hand schemas read from their pinned source.
const hand = JSON.parse(fs.readFileSync('scripts/fixtures/pack-nodes.json', 'utf8')).packs
const packs = {}
for (const [id, p] of Object.entries(NODE_PACKS)) {
  const reg = await registryId(p.repo)
  if (!reg && hand[id]) {
    packs[id] = { registry: null, version: hand[id].source, nodes: hand[id].nodes }
    continue
  }
  if (!reg) throw new Error(`The Comfy registry has no ${p.repo}, and scripts/fixtures/pack-nodes.json has no schema for it.`)
  const versions = (await api(`${reg}/versions?limit=40`)).map?.((v) => v.version) || []
  if (!versions.length) throw new Error(`The Comfy registry has no ${reg}.`)
  for (const version of versions) {
    const nodes = await scan(reg, version)
    if (p.classes.every((c) => nodes[c])) { packs[id] = { registry: reg, version, nodes }; break }
  }
  if (!packs[id] && hand[id]) packs[id] = { registry: reg, version: hand[id].source, nodes: hand[id].nodes }
  if (!packs[id]) throw new Error(`No ${p.name} version in the registry lists ${p.classes.join(', ')}.`)
}

fs.mkdirSync('scripts/fixtures', { recursive: true })
fs.writeFileSync('scripts/fixtures/comfy-nodes.json', JSON.stringify({ comfyui: COMFY_VERSION, commit: COMFY_COMMIT, nodes, packs }))
console.log(`Wrote ${Object.keys(nodes).length} core nodes and ${Object.keys(packs).length} packs (${Object.values(packs).map((p) => `${p.registry} ${p.version}`).join(', ')}).`)
