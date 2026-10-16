import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import * as core from './core.js'
import { createEngine, topoOrder } from '../src/lib/flowEngine.js'

export const problem = (message, status = 400) => Object.assign(new Error(message), { status })
export const clone = (value) => structuredClone(value)
export const flowSignature = (flow) => flow && JSON.stringify({
  id: flow.id, name: flow.name,
  nodes: flow.nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
  edges: flow.edges.map(({ id, source, target }) => ({ id, source, target })),
})

export function createFlows({ directory = core.home, generate = core.generate, changed = () => {} } = {}) {
  const engines = new Map()
  const locks = new Set()
  const file = () => path.join(directory(), 'flows.json')
  const read = () => {
    try { return JSON.parse(fs.readFileSync(file(), 'utf8')) } catch (e) {
      if (e.code !== 'ENOENT') throw e
      return { revision: 0, flows: [], current: null, runs: {} }
    }
  }
  const write = (store) => {
    fs.mkdirSync(directory(), { recursive: true })
    fs.writeFileSync(`${file()}.tmp`, JSON.stringify(store))
    fs.renameSync(`${file()}.tmp`, file())
    changed({ type: 'flows', revision: store.revision })
    return clone(store)
  }
  const get = (id) => {
    const flow = read().flows.find((f) => f.id === id)
    if (!flow) throw problem('Flow not found', 404)
    return clone(flow)
  }
  const validate = (flow) => {
    if (!flow || typeof flow.id !== 'string' || typeof flow.name !== 'string' || !Array.isArray(flow.nodes) || !Array.isArray(flow.edges)) throw problem('Invalid flow')
    const ids = new Set(flow.nodes.map((n) => n.id))
    if (ids.size !== flow.nodes.length || flow.nodes.some((n) => typeof n.id !== 'string' || !['prompt', 'image', 'model', 'approve', 'output', 'note'].includes(n.type) || !n.data || !Number.isFinite(n.position?.x) || !Number.isFinite(n.position?.y))) throw problem('Invalid node')
    for (const n of flow.nodes) {
      if (n.type === 'model' && n.data.model) core.resolveModel(n.data.model.id)
      if (n.type === 'model' && [n.data.takes ?? 1, n.data.count ?? 1].some((v) => !Number.isInteger(v) || v < 1 || v > 20)) throw problem('Use 1 to 20 takes and results')
    }
    const pairs = new Set()
    for (const e of flow.edges) {
      const source = flow.nodes.find((n) => n.id === e.source)
      const target = flow.nodes.find((n) => n.id === e.target)
      const pair = `${e.source}:${e.target}`
      if (!source || !target || source === target || pairs.has(pair) || ['output', 'note'].includes(source.type) || ['prompt', 'image', 'note'].includes(target.type) || (source.type === 'prompt' && target.type !== 'model')) throw problem('Invalid connection')
      pairs.add(pair)
    }
    topoOrder(flow)
    return flow
  }
  const save = ({ revision, flows, current, runs }) => {
    const store = read()
    if (revision !== store.revision) throw problem('Flows changed elsewhere. Reload flows before editing again.', 409)
    if (!Array.isArray(flows) || new Set(flows.map((f) => f.id)).size !== flows.length) throw problem('Invalid flows')
    flows.forEach(validate)
    for (const id of locks) if (flowSignature(store.flows.find((f) => f.id === id)) !== flowSignature(flows.find((f) => f.id === id))) throw problem('Wait for this flow to finish before editing it.', 409)
    const migrated = store.revision === 0 && runs ? Object.fromEntries(flows.map((f) => [f.id, Object.fromEntries(Object.entries(runs[f.id] || {}).filter(([id]) => f.nodes.some((n) => n.id === id)).map(([id, state]) => [id, { ...state, running: 0, items: state.items?.filter((i) => i.status === 'done') }]))])) : store.runs
    return write({ ...store, revision: store.revision + 1, flows: clone(flows), current, runs: migrated })
  }
  const edit = (id, fn) => {
    const store = read()
    const flow = get(id)
    fn(flow)
    flow.updated = Date.now()
    save({ ...store, flows: store.flows.map((f) => f.id === id ? flow : f) })
    return flow
  }
  const engine = (id) => {
    if (!engines.has(id)) {
      const eng = createEngine({
        run: (model, opts) => generate({ ...opts, model: model.id }),
        onChange: (state) => {
          const store = read()
          write({ ...store, runs: { ...store.runs, [id]: state } })
        },
      })
      eng.load(Object.fromEntries(Object.entries(read().runs[id] || {}).map(([key, value]) => [key, { ...value, running: 0, items: value.items?.filter((i) => i.status === 'done') }])))
      engines.set(id, eng)
    }
    return engines.get(id)
  }
  const perform = async (id, action, node, item, { flow = get(id), generate: guardedGenerate } = {}) => {
    if (!['runNew', 'regenerateAll', 'send', 'rerun', 'rerunGate', 'togglePick', 'stop'].includes(action)) throw problem('Unknown flow action')
    if (node && !flow.nodes.some((n) => n.id === node)) throw problem('Node not found', 404)
    if (!['runNew', 'regenerateAll'].includes(action) && !node) throw problem('Choose a node')
    if (locks.has(id)) throw problem('This flow is already running', 409)
    locks.add(id)
    try {
      // Each invocation gets its own runner so a session can gate every provider call.
      const base = engine(id)
      const eng = guardedGenerate ? createEngine({ run: (model, opts) => guardedGenerate({ ...opts, model: model.id }), onChange: (state) => base.load(state) }) : base
      if (eng !== base) eng.load(base.state)
      return await eng[action](flow, node, item)
    } finally { locks.delete(id) }
  }
  return {
    read, get, save, engine, perform, validate,
    add: (id, { type, position = { x: 0, y: 0 }, data = {} }) => {
      const node = { id: `${type}-${crypto.randomUUID().slice(0, 8)}`, type, position, data }
      edit(id, (f) => f.nodes.push(node))
      return node
    },
    connect: (id, { source, target }) => edit(id, (f) => f.edges.push({ id: `${source}-${target}`, source, target })),
    update: (id, node, { data, position }) => edit(id, (f) => {
      const n = f.nodes.find((n) => n.id === node)
      if (!n) throw problem('Node not found', 404)
      if (data) n.data = { ...n.data, ...data }
      if (position) n.position = position
    }),
  }
}

export const flows = createFlows()
