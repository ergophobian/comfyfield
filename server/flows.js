import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import * as core from './core.js'
import { createEngine, topoOrder, executableTypes } from '../src/lib/flowEngine.js'
import { nodeLabels, nodeDefaults, unknownType, missingNode, connectionProblem } from '../shared/flowRules.js'
import { STALE } from '../shared/flowMerge.js'
import { validAssignee } from '../shared/agentRoster.js'

export const problem = (message, status = 400) => Object.assign(new Error(message), { status })
export const clone = (value) => structuredClone(value)
export const flowSignature = (flow) => flow && JSON.stringify({
  id: flow.id, name: flow.name,
  nodes: flow.nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
  edges: flow.edges.map(({ id, source, target }) => ({ id, source, target })),
})

const actions = ['runNew', 'regenerateAll', 'send', 'rerun', 'rerunGate', 'togglePick', 'stop', 'editWriter', 'sendWriter']
const idPattern = /^[\w-]{1,64}$/
const shortId = () => crypto.randomUUID().slice(0, 8)
const fresh = (state) => Object.fromEntries(Object.entries(state || {}).map(([key, value]) => [key, { ...value, running: 0, items: value.items?.filter((i) => i.status === 'done') }]))

// Agents may name a model by id; flows store the catalog model object the canvas expects.
function withModel(type, data) {
  if (type !== 'model' || data.model === undefined || data.model === null) return data
  const id = typeof data.model === 'string' ? data.model : data.model?.id
  if (typeof id !== 'string') throw problem('Set data.model to a model id from list_models, such as "comfy-flux", or fal:<endpoint>.')
  let model
  try { model = core.resolveModel(id) } catch (e) { throw problem(e.message) }
  const resolved = typeof data.model === 'string' ? model : { ...model, ...data.model }
  return { ...data, model: resolved, ...(['image', 'video', 'audio'].includes(resolved.kind) && { kind: resolved.kind }) }
}

// library saves model outputs to Library > Generations. It defaults on only for the app's own
// folder, so checks that point flows at a scratch folder never write the real Library.
export function createFlows({ directory = core.home, generate = core.generate, writePrompt = core.writePrompt, stitch = core.stitch, render = core.render, library = directory === core.home ? core.saveToLibrary : null, changed = () => {} } = {}) {
  const engines = new Map()
  const locks = new Set()
  let quiet = false
  let own = null
  const file = () => path.join(directory(), 'flows.json')
  const read = () => {
    try { return { runs: {}, ...JSON.parse(fs.readFileSync(file(), 'utf8')) } } catch (e) {
      if (e.code !== 'ENOENT') throw e
      return { revision: 0, flows: [], current: null, runs: {} }
    }
  }
  const write = (store) => {
    fs.mkdirSync(directory(), { recursive: true })
    fs.writeFileSync(`${file()}.tmp`, JSON.stringify(store))
    fs.renameSync(`${file()}.tmp`, file())
    try { own = fs.statSync(file()).mtimeMs } catch {}
    changed({ type: 'flows', revision: store.revision })
    return clone(store)
  }
  // A standalone MCP server (npx comfyfield mcp) is another process that writes the same file, also
  // run state that keeps the revision. Polling the file passes its writes on to every open page.
  const watch = () => {
    const target = file()
    const seen = (cur, prev) => {
      if (cur.mtimeMs === prev.mtimeMs || cur.mtimeMs === own) return
      try { changed({ type: 'flows', revision: read().revision }) } catch {}
    }
    fs.watchFile(target, { interval: 250, persistent: false }, seen)
    return () => fs.unwatchFile(target, seen)
  }
  const get = (id) => {
    const { flows } = read()
    const flow = flows.find((f) => f.id === id)
    if (!flow) throw problem(`No flow "${id}". ${flows.length ? `Flow ids: ${flows.map((f) => `${f.id} (${f.name})`).join(', ')}.` : 'There are no flows yet; make one with create_flow.'}`, 404)
    return clone(flow)
  }
  const validate = (flow) => {
    if (!flow || typeof flow.id !== 'string' || typeof flow.name !== 'string' || !Array.isArray(flow.nodes) || !Array.isArray(flow.edges)) throw problem('A flow needs a string id, a string name, a nodes array and an edges array.')
    if (!validAssignee(flow.assignee)) throw problem(`Flow "${flow.name}": set assignee to an agent name such as "Agent 2", or null.`)
    const seen = new Set()
    for (const n of flow.nodes) {
      if (!validAssignee(n?.assignee)) throw problem(`Node "${n?.id}": set assignee to an agent name such as "Agent 2", or null.`)
      if (typeof n?.id !== 'string' || !n.id) throw problem(`Every node needs a string id. Check the node of type "${n?.type}".`)
      if (seen.has(n.id)) throw problem(`Node id "${n.id}" is used twice in flow "${flow.name}". Give each node its own id.`)
      seen.add(n.id)
      const type = unknownType(n.type)
      if (type) throw problem(`Node "${n.id}": ${type}`)
      if (!n.data || typeof n.data !== 'object' || Array.isArray(n.data)) throw problem(`Node "${n.id}" needs a data object, for example {}.`)
      if (!Number.isFinite(n.position?.x) || !Number.isFinite(n.position?.y)) throw problem(`Node "${n.id}" needs a position with numeric x and y, for example { "x": 0, "y": 0 }.`)
      if (n.type === 'model' && n.data.model) {
        if (typeof n.data.model.id !== 'string') throw problem(`Model node "${n.id}" needs data.model set to a model id from list_models.`)
        try { core.resolveModel(n.data.model.id) } catch (e) { throw problem(`Model node "${n.id}": ${e.message}`) }
      }
      if (n.type === 'model') for (const key of ['takes', 'count']) {
        const value = n.data[key] ?? 1
        if (!Number.isInteger(value) || value < 1 || value > 20) throw problem(`Model node "${n.id}": set data.${key} to a whole number from 1 to 20 (it is ${JSON.stringify(value)}).`)
      }
    }
    const built = { ...flow, edges: [] }
    for (const e of flow.edges) {
      const issue = connectionProblem(built, e?.source, e?.target)
      if (issue) throw problem(issue)
      built.edges.push(e)
    }
    topoOrder(flow)
    return flow
  }
  const save = ({ revision, flows, current, runs }) => {
    const store = read()
    if (revision !== store.revision) throw problem(STALE, 409)
    if (!Array.isArray(flows)) throw problem('Send flows as an array.')
    const ids = flows.map((f) => f?.id)
    const twice = ids.find((id, i) => ids.indexOf(id) !== i)
    if (twice !== undefined) throw problem(`Flow id "${twice}" is used twice. Give each flow its own id.`)
    flows.forEach(validate)
    for (const id of locks) if (flowSignature(store.flows.find((f) => f.id === id)) !== flowSignature(flows.find((f) => f.id === id))) throw problem('Wait for this flow to finish before editing it.', 409)
    // Run state is server-owned. It is only accepted for flows the server has not seen, which is how
    // browser-only flows bring their results along when the app moves them here.
    const known = new Set(store.flows.map((f) => f.id))
    const imported = Object.fromEntries(flows.filter((f) => !known.has(f.id) && runs?.[f.id] && !store.runs[f.id]).map((f) => [f.id, fresh(Object.fromEntries(Object.entries(runs[f.id]).filter(([id]) => f.nodes.some((n) => n.id === id))))]))
    return write({ ...store, revision: store.revision + 1, flows: clone(flows), current, runs: { ...store.runs, ...imported } })
  }
  const edit = (id, fn) => {
    const store = read()
    const flow = get(id)
    const result = fn(flow)
    flow.updated = Date.now()
    save({ ...store, flows: store.flows.map((f) => f.id === id ? flow : f) })
    return result === undefined ? flow : result
  }
  // Build a node the way the canvas does, so MCP-made nodes open with the same defaults.
  const makeNode = (flow, { id, type, position, data = {} }) => {
    const issue = unknownType(type)
    if (issue) throw problem(issue)
    if (id !== undefined && !idPattern.test(id)) throw problem(`Node id "${id}" is not valid. Use 1 to 64 letters, digits, "-" or "_".`)
    if (id !== undefined && flow.nodes.some((n) => n.id === id)) throw problem(`Flow "${flow.name}" already has a node "${id}". Pick another id or leave id out.`)
    const last = flow.nodes.at(-1)?.position
    return { id: id ?? `${type}-${shortId()}`, type, position: position || (last ? { x: last.x + 340, y: last.y } : { x: 0, y: 40 }), data: withModel(type, { ...nodeDefaults(type, data), ...data }) }
  }
  const link = (flow, { source, target }) => {
    const issue = connectionProblem(flow, source, target)
    if (issue) throw problem(issue)
    const edge = { id: `${source}-${target}`, source, target }
    flow.edges.push(edge)
    return edge
  }
  // A failed Library save never fails the step: the engine keeps the provider file either way.
  const keep = (id, generator) => async (model, opts, unit = {}) => {
    const onProgress = (progress) => {
      const eng = engine(id)
      const node = eng.state[unit.stepId]
      // Late provider events must not restore pending state after completion.
      if (!node?.items?.some((item) => item.unit === unit.unitId && item.status === 'pending')) return
      eng.load({ ...eng.state, [unit.stepId]: { ...node, items: node.items.map((item) => item.unit === unit.unitId && item.status === 'pending' ? { ...item, progress } : item) } })
    }
    const files = await generator({ ...opts, model: model.id, onProgress })
    if (!library || !Array.isArray(files)) return files
    try {
      const flow = read().flows.find((f) => f.id === id)
      await library(files.filter((f) => f?.url), {
        model: model.name, kind: model.kind, provider: model.provider, caption: opts.prompt, aspect: opts.aspect,
        flowId: id, flowName: flow?.name, flowNode: unit.stepId, from: '/flows',
      })
    } catch (e) { console.warn(`Flow "${id}": could not save to the Library. ${e.message}`) }
    return files
  }
  const engine = (id) => {
    if (!engines.has(id)) {
      const eng = createEngine({
        run: keep(id, generate),
        writePrompt,
        stitch: (opts) => stitch({ ...opts, preview: true }),
        render,
        onChange: (state) => {
          if (quiet) return
          const store = read()
          write({ ...store, runs: { ...store.runs, [id]: state } })
        },
      })
      eng.load(fresh(read().runs[id]))
      engines.set(id, eng)
      return eng
    }
    // The app and a standalone MCP server share flows.json; pick up runs the other process wrote.
    const eng = engines.get(id)
    const stored = read().runs[id] || {}
    if (!locks.has(id) && !eng.isRunning() && JSON.stringify(stored) !== JSON.stringify(eng.state)) {
      quiet = true
      try { eng.load(fresh(stored)) } finally { quiet = false }
    }
    return eng
  }
  const perform = async (id, action, node, item, { flow = get(id), generate: guardedGenerate, writePrompt: guardedWriter, stitch: guardedStitch, render: guardedRender } = {}) => {
    if (!actions.includes(action)) throw problem(`Unknown flow action "${action}". Use one of: ${actions.join(', ')}.`)
    if (node) { const missing = missingNode(flow, node); if (missing) throw problem(missing, 404) }
    if (!['runNew', 'regenerateAll'].includes(action) && !node) throw problem(`Choose a node for ${action}.`)
    if (locks.has(id)) throw problem('This flow is already running. Wait for it to finish.', 409)
    locks.add(id)
    try {
      // Each invocation gets its own runner so a session can gate every provider call.
      const base = engine(id)
      const eng = guardedGenerate ? createEngine({
        run: keep(id, guardedGenerate),
        writePrompt: guardedWriter,
        stitch: guardedStitch,
        render: guardedRender,
        onChange: (state) => base.load(state),
      }) : base
      if (eng !== base) eng.load(base.state)
      return await eng[action](flow, node, item)
    } finally { locks.delete(id) }
  }
  // What an agent needs after Run: what ran, what failed, and which gates wait for the user.
  const report = (id, result = {}) => {
    const flow = get(id)
    const eng = engine(id)
    const name = (n) => `${nodeLabels[n.type]} "${n.id}"`
    const waiting = flow.nodes.filter((n) => n.type === 'approve' && eng.gate(n.id).status === 'reviewing').map((n) => n.id)
    const writers = flow.nodes.filter((n) => n.type === 'writer' && !eng.state[n.id]?.sent && eng.state[n.id]?.items?.some((i) => i.status === 'done')).map((n) => n.id)
    const failed = flow.nodes.flatMap((n) => (eng.state[n.id]?.items || []).filter((i) => i.status === 'failed').map((i) => ({ node: n.id, error: i.error })))
    const blocked = flow.nodes.filter((n) => executableTypes.includes(n.type) && !eng.state[n.id]?.items?.some((i) => i.status === 'done') && eng.plan(flow, n.id).blocked).map((n) => n.id)
    const made = Object.fromEntries(flow.nodes.map((n) => [n.id, (eng.state[n.id]?.items || []).filter((i) => i.status === 'done').map(({ kind, url, text, prompt }) => ({ kind, url, text, prompt }))]).filter(([, items]) => items.length))
    const next = [
      ...waiting.map((n) => `${name(flow.nodes.find((x) => x.id === n))} is waiting for review. The user must pick takes and press Send in Flows; agents cannot send it.`),
      ...writers.map((n) => `Writer "${n}" wrote a prompt. The user must review it and press Send in Flows.`),
      ...blocked.filter((n) => !waiting.length && !writers.length).map((n) => `${name(flow.nodes.find((x) => x.id === n))} has no input yet. Fill its prompt, model or upstream node.`),
    ]
    return { flow_id: id, ran: result.ran ?? 0, waiting_for_send: waiting, writers_waiting_for_send: writers, blocked, failed, outputs: made, next }
  }
  return {
    read, get, save, engine, perform, validate, report, watch,
    create: ({ name, nodes = [], edges = [] }) => {
      if (typeof name !== 'string' || !name.trim()) throw problem('Give the flow a name.')
      const flow = { id: shortId(), name: name.trim(), nodes: [], edges: [], updated: Date.now() }
      nodes.forEach((n) => flow.nodes.push(makeNode(flow, n)))
      edges.forEach((e) => link(flow, e))
      const store = read()
      save({ ...store, flows: [flow, ...store.flows], current: store.current ?? flow.id })
      return flow
    },
    // A shared flow arrives as a new flow with its own id; blank flows make room for it, as on the canvas.
    insert: ({ name, nodes, edges, origin }) => {
      const flow = validate({ id: shortId(), name, nodes, edges, ...(origin && { origin }), updated: Date.now() })
      const store = read()
      save({ ...store, flows: [flow, ...store.flows.filter((f) => f.nodes.length)], current: flow.id })
      return clone(flow)
    },
    add: (id, spec) => edit(id, (f) => { const node = makeNode(f, spec); f.nodes.push(node); return node }),
    connect: (id, edge) => edit(id, (f) => link(f, edge)),
    update: (id, node, { data, position }) => edit(id, (f) => {
      const missing = missingNode(f, node)
      if (missing) throw problem(missing, 404)
      const n = f.nodes.find((x) => x.id === node)
      if (data) n.data = withModel(n.type, { ...n.data, ...data })
      if (position) n.position = position
      return n
    }),
    // Assign a whole flow (no node) or one node to an agent name; null clears it.
    assign: (id, node, agent) => {
      if (!validAssignee(agent)) throw problem('Name the agent, such as "Agent 2", or send null to clear the assignment.')
      const name = agent?.trim() || null
      return edit(id, (f) => {
        if (!node) { if (name) f.assignee = name; else delete f.assignee; return { flow_id: id, assignee: name } }
        const missing = missingNode(f, node)
        if (missing) throw problem(missing, 404)
        const n = f.nodes.find((x) => x.id === node)
        if (name) n.assignee = name; else delete n.assignee
        return { flow_id: id, node_id: node, assignee: name }
      })
    },
    remove: (id, node) => {
      const removed = edit(id, (f) => {
        const missing = missingNode(f, node)
        if (missing) throw problem(missing, 404)
        const edges = f.edges.filter((e) => e.source === node || e.target === node)
        f.nodes = f.nodes.filter((n) => n.id !== node)
        f.edges = f.edges.filter((e) => !edges.includes(e))
        return { removed: node, edges_removed: edges.map((e) => e.id) }
      })
      const eng = engine(id)
      if (eng.state[node]) { const { [node]: _, ...rest } = eng.state; eng.load(rest) }
      return removed
    },
  }
}

export const flows = createFlows()
