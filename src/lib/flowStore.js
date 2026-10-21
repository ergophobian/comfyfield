import { models } from './catalog.js'
import { useEffect, useSyncExternalStore } from 'react'
import { api, initFlows, changeFlows, flushFlows, refreshFlows, flowSnapshot, subscribeFlows } from './remoteFlows.js'
import { createEngine } from './flowEngine.js'
import { nodeLabels, nodeDefaults } from '../../shared/flowRules.js'

export { nodeLabels }

const KEY = 'comfyfield.flows'
const uid = () => crypto.randomUUID().slice(0, 8)
const find = (id, kind) => models.find((m) => m.id === id) || models.find((m) => m.kind === kind)

export const defaults = nodeDefaults
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
    id: 'write-then-render',
    name: 'Write then render',
    blurb: 'Turn a short note into a full prompt. Review and edit it before you send.',
    steps: ['Note', 'Writer', 'Model', 'Output'],
    make: () => build('Write then render', [
      ['p', 'prompt', 0, 40, { text: 'A paper boat on a rainy street at dusk, warm window light' }],
      ['w', 'writer', 340, 40],
      ['m', 'model', 720, 40, { kind: 'image', model: imageModel(), aspect: '16:9', takes: 1 }],
      ['o', 'output', 1080, 40],
    ], [['p', 'w'], ['w', 'm'], ['m', 'o']]),
  },
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
  {
    id: 'storyboard-to-video',
    name: 'Storyboard to video',
    blurb: 'Write the shots, approve the frames, then animate each one.',
    steps: ['Shots', 'Frames', 'Approve', 'Video'],
    make: () => build('Storyboard to video', [
      ['p', 'prompt', 0, 40, { mode: 'rows', text: 'Wide shot, a lighthouse keeper climbs a spiral stair at dusk\nClose up, his hand switches on the brass lamp\nThe beam sweeps across a dark, stormy sea\nDawn, the keeper sips tea as the storm clears' }],
      ['i', 'model', 340, 20, { kind: 'image', model: find('comfy-flux', 'image'), aspect: '16:9', takes: 2 }],
      ['a', 'approve', 680, 40],
      ['v', 'model', 1060, 20, { kind: 'video', model: find('comfy-ltx', 'video'), aspect: '16:9', duration: 5, takes: 1 }],
      ['o', 'output', 1420, 40],
    ], [['p', 'i'], ['i', 'a'], ['a', 'v'], ['v', 'o']]),
  },
  {
    id: 'draft-then-final',
    name: 'Draft then final',
    blurb: 'Cheap drafts first. Only the take you approve gets the full render.',
    steps: ['Prompt', 'Drafts', 'Approve', 'Final'],
    make: () => build('Draft then final', [
      ['p', 'prompt', 0, 60, { mode: 'single', text: 'A hot air balloon rising over misty hills at sunrise, slow and calm' }],
      ['d', 'model', 340, 20, { kind: 'video', model: find('comfy-ltx', 'video'), aspect: '16:9', duration: 3, takes: 3 }],
      ['a', 'approve', 680, 40],
      ['f', 'model', 1060, 20, { kind: 'video', model: find('comfy-ltx', 'video'), aspect: '16:9', duration: 8, takes: 1, prompt: 'Same shot, full length' }],
      ['o', 'output', 1420, 40],
      ['n', 'note', 1060, -170, { text: 'Not wired yet: the final step makes a new full length clip from its prompt. Passing the approved take into it needs video inputs in the flow engine, then a larger open model.' }],
    ], [['p', 'd'], ['d', 'a'], ['a', 'f'], ['f', 'o']]),
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

// Before server storage, flows lived in this browser's localStorage. initFlows moves them to the
// server once; the browser copy stays as a fallback.
export function loadFlows() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s?.flows?.length) return { ...s, legacy: true, runs: Object.fromEntries(s.flows.map((f) => {
      try { return [f.id, JSON.parse(localStorage.getItem(`comfyfield.flowrun.${f.id}`)) || {}] } catch { return [f.id, {}] }
    })) }
  } catch {}
  const f = blankFlow()
  return { flows: [f], current: f.id }
}

export function useFlowStorage() {
  const snapshot = useSyncExternalStore(subscribeFlows, flowSnapshot)
  useEffect(() => { initFlows(loadFlows()).catch(() => {}) }, [])
  return { ...snapshot, store: snapshot.store || loadFlows(), setStore: changeFlows }
}

export async function openFlow(flow) {
  await initFlows(loadFlows())
  changeFlows((s) => ({ ...s, current: flow.id, flows: [flow, ...s.flows.filter((f) => f.id !== flow.id && f.nodes.length)] }))
  await flushFlows()
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

// Planning stays pure in the browser; actions and run state belong to the server.
const engines = new Map()
export function engineFor(id) {
  if (engines.has(id)) return engines.get(id)
  const engine = createEngine()
  let previous
  const sync = () => {
    const state = flowSnapshot().store?.runs?.[id]
    if (state !== previous) { previous = state; engine.load(state || {}) }
  }
  subscribeFlows(sync)
  sync()
  const actions = Object.fromEntries(['runNew', 'regenerateAll', 'send', 'rerun', 'rerunGate', 'togglePick', 'stop', 'editWriter', 'sendWriter'].map((action) => [action, async (flow, node, item) => {
    await flushFlows()
    const result = await api(`/api/flows/${id}/action`, 'POST', { action, node, item })
    await refreshFlows()
    return result
  }]))
  const proxy = { ...engine, ...actions, get state() { return engine.state } }
  engines.set(id, proxy)
  return proxy
}
