// What a flow may contain and how nodes may connect. Shared by the canvas, the server store and the
// MCP tools, so a rule only lives here and every error says how to fix the flow.
import { models } from '../src/lib/catalog.js'
import { widgetTypes } from './widgetInputs.js'

export const nodeLabels = { prompt: 'Prompt', image: 'Image', writer: 'Writer', mask: 'Mask painter', face: 'Face picker', video: 'Video input', crop: 'Crop and reframe', model: 'Model', stitch: 'Stitch', approve: 'Approve', output: 'Output', note: 'Note' }
export const nodeTypes = Object.keys(nodeLabels)

// Each node has at most one input handle and one output handle; these lists say which exist.
export const sourceTypes = nodeTypes.filter((t) => !['output', 'note'].includes(t))
export const targetTypes = nodeTypes.filter((t) => !['prompt', 'image', 'note', ...widgetTypes].includes(t))
const promptTargets = ['model', 'writer']

const find = (id, kind) => models.find((m) => m.id === id) || models.find((m) => m.kind === kind)

export function nodeDefaults(type) {
  if (type === 'prompt') return { mode: 'single', text: '' }
  if (widgetTypes.includes(type)) return { value: null }
  if (type === 'image') return { url: null, name: '' }
  if (type === 'writer') return { instructions: 'Write one vivid generation prompt from the reference images and user note. Preserve visible details. Return only the finished prompt.', note: '', target: 'image' }
  if (type === 'model') return { kind: 'image', model: find(null, 'image'), aspect: '1:1', duration: 5, takes: 1, prompt: '' }
  if (type === 'note') return { text: '' }
  if (type === 'stitch') return { clips: [], aspect: '16:9' }
  return {}
}

const list = (items) => items.join(', ')
const label = (node) => `${nodeLabels[node.type] || node.type} node "${node.id}"`

export function unknownType(type) {
  return nodeTypes.includes(type) ? null : `Unknown node type "${type}". Use one of: ${list(nodeTypes)}.`
}

export function missingNode(flow, id) {
  if (flow.nodes.some((n) => n.id === id)) return null
  const ids = flow.nodes.map((n) => n.id)
  return `Flow "${flow.name}" has no node "${id}". ${ids.length ? `Its node ids are: ${list(ids)}.` : 'It has no nodes yet; add one with add_node.'}`
}

const reaches = (flow, from, to) => {
  const seen = new Set()
  const walk = (id) => id === to || flow.edges.some((e) => e.source === id && !seen.has(e.target) && (seen.add(e.target), walk(e.target)))
  return walk(from)
}

// Returns null when source -> target is allowed, else a sentence that says what to do instead.
export function connectionProblem(flow, source, target) {
  const missing = missingNode(flow, source) || missingNode(flow, target)
  if (missing) return missing
  const s = flow.nodes.find((n) => n.id === source)
  const t = flow.nodes.find((n) => n.id === target)
  if (s === t) return `A node cannot connect to itself. Pick a different target for ${label(s)}.`
  if (!sourceTypes.includes(s.type)) return `${label(s)} has no output. Connect from one of: ${list(sourceTypes)}.`
  if (!targetTypes.includes(t.type)) return `${label(t)} has no input. Connect into one of: ${list(targetTypes)}.`
  if (s.type === 'prompt' && !promptTargets.includes(t.type)) return `A Prompt node can only feed a Model or Writer node, not ${label(t)}. Put a Model or Writer between them.`
  if (flow.edges.some((e) => e.source === source && e.target === target)) return `${label(s)} already connects to ${label(t)}.`
  if (reaches(flow, target, source)) return `Connecting ${label(s)} to ${label(t)} would make a loop, because "${target}" already feeds "${source}". Remove a connection or reverse this one.`
  return null
}
