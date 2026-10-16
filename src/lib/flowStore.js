import { models } from './catalog.js'
import { run } from './providers.js'
import { createEngine } from './flowEngine.js'

const KEY = 'comfyfield.flows'
const RUN = 'comfyfield.flowrun.'
const uid = () => crypto.randomUUID().slice(0, 8)
const find = (id, kind) => models.find((m) => m.id === id) || models.find((m) => m.kind === kind)

export const nodeLabels = { prompt: 'Prompt', image: 'Image', model: 'Model', approve: 'Approve', output: 'Output', note: 'Note' }

export function defaults(type) {
  if (type === 'prompt') return { mode: 'single', text: '' }
  if (type === 'image') return { url: null, name: '' }
  if (type === 'model') return { kind: 'image', model: find(null, 'image'), aspect: '1:1', duration: 5, takes: 1, prompt: '' }
  if (type === 'note') return { text: '' }
  return {}
}

export const makeNode = (type, position, data = {}) => ({ id: `${type}-${uid()}`, type, position, data: { ...defaults(type), ...data } })
const link = (a, b) => ({ id: `${a}-${b}`, source: a, target: b })

function build(name, spec, edges) {
  const nodes = spec.map(([key, type, x, y, data]) => ({ ...makeNode(type, { x, y }, data), id: key }))
  return { id: uid(), name, nodes, edges: edges.map(([a, b]) => link(a, b)), updated: Date.now() }
}

const imageModel = () => find('g-nano-banana-2', 'image')
const videoModel = () => find('g-veo-fast', 'video')

export const starters = [
  {
    id: 'prompt-list-video',
    name: 'Prompt list to video',
    blurb: 'A list of prompts, one video each. Add takes to compare.',
    steps: ['Prompts', 'Video', 'Output'],
    make: () => build('Prompt list to video', [
      ['p', 'prompt', 0, 40, { mode: 'rows', text: 'A paper boat drifting down a rainy street at dusk\nA fox stepping through fresh snow in soft morning light\nWaves folding over a black sand beach, slow motion' }],
      ['v', 'model', 360, 20, { kind: 'video', model: find('comfy-ltx', 'video'), aspect: '16:9', duration: 5, takes: 1 }],
      ['o', 'output', 720, 40],
    ], [['p', 'v'], ['v', 'o']]),
  },
  {
    id: 'image-then-animate',
    name: 'Image then animate',
    blurb: 'Make an image, approve it, then bring it to life.',
    steps: ['Prompt', 'Image', 'Approve', 'Video'],
    make: () => build('Image then animate', [
      ['p', 'prompt', 0, 60, { mode: 'single', text: 'A lighthouse on a cliff at golden hour, painterly, calm sea' }],
      ['i', 'model', 340, 20, { kind: 'image', model: imageModel(), aspect: '16:9', takes: 3 }],
      ['a', 'approve', 680, 40],
      ['v', 'model', 1060, 20, { kind: 'video', model: videoModel(), aspect: '16:9', duration: 4, takes: 1, prompt: 'Slow camera push in, waves moving, soft light' }],
      ['o', 'output', 1420, 40],
    ], [['p', 'i'], ['i', 'a'], ['a', 'v'], ['v', 'o']]),
  },
  {
    id: 'ad-variants',
    name: 'Ad variants',
    blurb: 'Several ad concepts, approve the best image of each, then animate.',
    steps: ['Concepts', 'Image', 'Approve', 'Video'],
    make: () => build('Ad variants', [
      ['p', 'prompt', 0, 40, { mode: 'rows', text: 'Cold brew can on a sunlit window ledge, condensation, bold colors\nCold brew can held up in a crowd at a summer festival\nCold brew can floating over a bright pink studio backdrop' }],
      ['i', 'model', 340, 20, { kind: 'image', model: imageModel(), aspect: '9:16', takes: 2 }],
      ['a', 'approve', 680, 40],
      ['v', 'model', 1060, 20, { kind: 'video', model: videoModel(), aspect: '9:16', duration: 4, takes: 1, prompt: 'Handheld push in, energetic, product stays sharp' }],
      ['o', 'output', 1420, 40],
    ], [['p', 'i'], ['i', 'a'], ['a', 'v'], ['v', 'o']]),
  },
]

// Create's batch list becomes prompt rows feeding one model.
export function flowFromBatch({ prompts, model, aspect, duration, takes, count }) {
  const f = build('Batch from Create', [
    ['p', 'prompt', 0, 40, { mode: 'rows', text: prompts.join('\n') }],
    ['m', 'model', 360, 20, { kind: model.kind, model, aspect, duration, takes, count }],
    ['o', 'output', 720, 40],
  ], [['p', 'm'], ['m', 'o']])
  return f
}

export function blankFlow() {
  return { id: uid(), name: 'Untitled flow', nodes: [], edges: [], updated: Date.now() }
}

const strip = (f) => ({
  ...f,
  nodes: f.nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
  edges: f.edges.map(({ id, source, target }) => ({ id, source, target })),
})

export function loadFlows() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s?.flows?.length) return s
  } catch {}
  const f = blankFlow()
  return { flows: [f], current: f.id }
}

export function saveFlows(s) {
  try { localStorage.setItem(KEY, JSON.stringify({ current: s.current, flows: s.flows.map(strip) })) } catch {}
}

export function openFlow(flow) {
  const s = loadFlows()
  saveFlows({ current: flow.id, flows: [flow, ...s.flows.filter((f) => f.id !== flow.id && f.nodes.length)] })
}

export function exportJson(flow) {
  return JSON.stringify({ comfyfield: 'flow', version: 1, flow: strip(flow) }, null, 2)
}

export function parseFlow(text) {
  const raw = JSON.parse(text)
  const f = raw.flow || raw
  if (!Array.isArray(f.nodes) || !Array.isArray(f.edges)) throw new Error('This file is not a ComfyField flow')
  const types = Object.keys(nodeLabels)
  if (f.nodes.some((n) => !types.includes(n.type))) throw new Error('This flow uses a node type this version does not know')
  return { ...strip(f), id: uid(), name: f.name || 'Imported flow', updated: Date.now() }
}

// One engine per flow so renders keep going when you switch flows or tabs.
const engines = new Map()
export function engineFor(id) {
  if (engines.has(id)) return engines.get(id)
  let timer
  const eng = createEngine({
    run,
    onChange: (state) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const clean = Object.fromEntries(Object.entries(state).map(([k, v]) => [k, {
          ...v, running: 0, items: v.items?.filter((i) => i.status === 'done'),
        }]))
        try { localStorage.setItem(RUN + id, JSON.stringify(clean)) } catch {}
      }, 400)
    },
  })
  try { eng.load(JSON.parse(localStorage.getItem(RUN + id))) } catch {}
  engines.set(id, eng)
  return eng
}
