// Flow execution rules, ported from PatchWork's WORKFLOW-SPEC.
// Pure: no React, no fetch. Inject run(model, opts) -> files, writePrompt(input) -> text and
// render(type, opts) -> file for nodes that render outside a provider (Blender, Three.js).
import { widgetTypes, widgetReady, widgetOptions } from '../../shared/widgetInputs.js'
import { stitchInputs } from './stitch.js'

const byId = (flow, id) => flow.nodes.find((n) => n.id === id)
const sources = (flow, id) => flow.edges.filter((e) => e.target === id).map((e) => e.source)
const targets = (flow, id) => flow.edges.filter((e) => e.source === id).map((e) => e.target)
const cmp = (a, b) => (a.row - b.row) || (a.take - b.take)
export const renderTypes = ['blender', 'threejs']
export const executableTypes = ['model', 'writer', 'stitch', ...renderTypes]
const executable = (n) => executableTypes.includes(n.type)
const renderKind = (n) => (n.type === 'threejs' || n.data.output === 'video' ? 'video' : 'image')

export function topoOrder(flow) {
  const left = new Map(flow.nodes.map((n) => [n.id, sources(flow, n.id).length]))
  const order = []
  const queue = flow.nodes.filter((n) => left.get(n.id) === 0).map((n) => n.id)
  while (queue.length) {
    const id = queue.shift()
    order.push(id)
    for (const t of targets(flow, id)) {
      left.set(t, left.get(t) - 1)
      if (left.get(t) === 0) queue.push(t)
    }
  }
  if (order.length < flow.nodes.length) throw new Error('This flow has a loop')
  return order
}

export function downstreamOf(flow, id) {
  const seen = new Set()
  const walk = (x) => targets(flow, x).forEach((t) => { if (!seen.has(t)) { seen.add(t); walk(t) } })
  walk(id)
  return seen
}

export function csvPrompts(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += c
  }
  row.push(cell)
  rows.push(row)
  const col = rows.map((r) => (r[0] || '').trim()).filter(Boolean)
  return /^prompts?$/i.test(col[0] || '') ? col.slice(1) : col
}

export function promptsOf(node) {
  const text = node.data.text || ''
  if (node.data.mode === 'rows') return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  return text.trim() ? [text.trim()] : []
}

export const emptyGate = () => ({ status: 'empty', picked: [], sent: [] })

export function createEngine({ run, writePrompt, stitch, render, onChange = () => {}, concurrency = 3 } = {}) {
  let S = {}
  const subs = new Set()
  let active = 0
  let peak = 0
  const waiting = []

  const emit = () => { subs.forEach((f) => f()); onChange(S) }
  const edit = (id, fn) => { S = { ...S, [id]: { ...(S[id] || {}), ...fn(S[id] || {}) } }; emit() }

  const pump = () => {
    while (active < concurrency && waiting.length) {
      const job = waiting.shift()
      active++
      peak = Math.max(peak, active)
      job().finally(() => { active--; pump() })
    }
  }
  const limit = (fn) => new Promise((resolve, reject) => {
    waiting.push(() => fn().then(resolve, reject))
    pump()
  })

  const doneItems = (id) => (S[id]?.items || []).filter((i) => i.status === 'done').sort(cmp)
  const running = (id) => (S[id]?.running || 0) > 0
  const failed = (id) => (S[id]?.items || []).some((i) => i.status === 'failed')
  const gate = (id) => ({ ...emptyGate(), ...S[id] })

  // What a node hands downstream. null means the gate is closed or nothing exists yet.
  function itemsOf(flow, id) {
    const n = byId(flow, id)
    if (widgetTypes.includes(n.type)) {
      const value = n.data.value
      return widgetReady(n.type, value) ? [{ id: n.id, kind: n.type === 'video' ? 'video' : 'image', url: n.type === 'face' ? value.faceUrl || value.url : value.url, row: 0, take: 0, prompt: '', inputType: n.type, value }] : []
    }
    if (n.type === 'image') return n.data.url ? [{ id: n.id, kind: 'image', url: n.data.url, row: 0, take: 0, prompt: '' }] : []
    if (n.type === 'model') return doneItems(id)
    if (n.type === 'stitch') return doneItems(id).filter((item) => !item.stale)
    if (renderTypes.includes(n.type)) return doneItems(id)
    if (n.type === 'writer') return S[id]?.sent ? doneItems(id) : null
    if (n.type === 'approve') return gate(id).status === 'sent' ? gate(id).sent : null
    return []
  }

  function reviewItems(flow, id) {
    return sources(flow, id).flatMap((s) => (byId(flow, s).type === 'prompt' ? [] : itemsOf(flow, s) || []))
  }

  // Work a model node would do right now: one unit per prompt row (or upstream image) per take.
  function plan(flow, id) {
    const n = byId(flow, id)
    if (n.type === 'writer') {
      const notes = [n.data.note || '']
      const images = [...(n.data.images || [])]
      let blocked = !n.data.instructions?.trim()
      for (const s of sources(flow, id)) {
        const src = byId(flow, s)
        if (src.type === 'prompt') {
          const texts = promptsOf(src)
          if (!texts.length) blocked = true
          notes.push(...texts)
        } else {
          const out = itemsOf(flow, s)
          if (!out?.length || running(s) || failed(s)) blocked = true
          for (const it of out || []) {
            if (it.kind === 'image') images.push(it.url)
            if (it.kind === 'text') notes.push(it.text)
          }
        }
      }
      return { blocked, units: blocked ? [] : [{ key: 'writer', row: 0, take: 0, opts: { instructions: n.data.instructions, note: notes.filter(Boolean).join('\n\n'), images, target: n.data.target || '' } }] }
    }
    if (n.type === 'blender') {
      const script = n.data.script || ''
      const opts = { script, output: renderKind(n) }
      return script.trim() ? { blocked: false, units: [{ key: 'blender', row: 0, take: 0, opts, signature: JSON.stringify(opts) }] } : { blocked: true, units: [] }
    }
    if (n.type === 'threejs') {
      const { script = '', duration, width, height, fps } = n.data
      const opts = { script, duration, width, height, fps }
      return script.trim() ? { blocked: false, units: [{ key: 'threejs', row: 0, take: 0, opts, signature: JSON.stringify(opts) }] } : { blocked: true, units: [] }
    }
    if (n.type === 'stitch') {
      const input = stitchInputs(flow, id, itemsOf, running)
      return { blocked: input.blocked, units: input.blocked ? [] : [{ key: 'stitch', row: 0, take: 0, opts: input.options, signature: input.signature }] }
    }
    const model = n.data.model
    if (!model) return { blocked: true, units: [] }
    let texts = []
    const images = []
    const clips = []
    const inputs = {}
    let widgetOpts = {}
    let blocked = false
    let promptEdge = false
    for (const s of sources(flow, id)) {
      const src = byId(flow, s)
      if (src.type === 'prompt') { promptEdge = true; texts.push(...promptsOf(src)) } else {
        const out = itemsOf(flow, s)
        if (!out || !out.length || running(s) || failed(s)) blocked = true
        else {
          const written = out.filter((i) => i.kind === 'text').map((i) => i.text)
          if (written.length) { promptEdge = true; texts.push(...written) }
          images.push(...out.filter((i) => i.kind === 'image' && !i.inputType))
          // A rendered or generated video (Three.js, Blender, Stitch, a video model) can be the model's video input.
          clips.push(...out.filter((i) => i.kind === 'video' && !i.inputType))
          for (const item of out.filter((i) => i.inputType)) {
            inputs[item.id] = item.value
            widgetOpts = { ...widgetOpts, ...widgetOptions(item.inputType, item.value) }
          }
        }
      }
    }
    if (promptEdge && !texts.length) blocked = true
    if (!promptEdge && n.data.prompt?.trim()) texts = [n.data.prompt.trim()]
    if (!texts.length && !images.length && !clips.length && !Object.keys(inputs).length) blocked = true
    if (blocked) return { blocked: true, units: [] }

    const takes = Math.max(1, n.data.takes || 1)
    // Like a Video input node, the first upstream clip is the video input; it does not add runs.
    const clip = !widgetOpts.video && clips[0] ? { video: clips[0].url } : {}
    const base = { aspect: n.data.aspect, duration: n.data.duration, count: n.data.count || 1, ...widgetOpts, ...clip, ...(Object.keys(inputs).length && { inputs }) }
    const units = []
    if (images.length) {
      images.forEach((img, k) => {
        const row = img.row ?? k
        const prompt = promptEdge ? (texts[row] ?? texts[0]) : (texts[0] ?? img.prompt ?? '')
        for (let t = 0; t < takes; t++) {
          units.push({ key: `${row}|${img.id}|${t}`, row, take: t, opts: { ...base, prompt, caption: prompt, image: img.url } })
        }
      })
    } else {
      const rows = texts.length ? texts : ['']
      rows.forEach((prompt, row) => {
        for (let t = 0; t < takes; t++) units.push({ key: `${row}||${t}`, row, take: t, opts: { ...base, prompt, caption: prompt } })
      })
    }
    return { blocked: false, units }
  }

  const todo = (flow, id) => {
    const p = plan(flow, id)
    const done = new Set(doneItems(id).map((i) => i.unit))
    return p.units.filter((u) => !done.has(u.key))
  }

  // Empty -> reviewing only when upstream finished and has something to look at. Never straight to sent.
  function syncGates(flow) {
    for (const n of flow.nodes.filter((x) => x.type === 'approve')) {
      const items = reviewItems(flow, n.id)
      const busy = sources(flow, n.id).some((s) => running(s))
      const g = gate(n.id)
      if (g.status === 'empty' && items.length && !busy) edit(n.id, () => ({ status: 'reviewing' }))
      else if (g.status === 'reviewing' && !items.length) edit(n.id, () => ({ status: 'empty', picked: [] }))
      else if (g.status !== 'sent') {
        const ids = new Set(items.map((i) => i.id))
        if (g.picked?.some((p) => !ids.has(p))) edit(n.id, (s) => ({ picked: s.picked.filter((p) => ids.has(p)) }))
      }
    }
  }

  // Walk downstream and close the first approval gates reached. Never recurse past one.
  function resetGatesBelow(flow, id) {
    const seen = new Set()
    const walk = (x) => targets(flow, x).forEach((t) => {
      if (seen.has(t)) return
      seen.add(t)
      if (byId(flow, t).type === 'approve') edit(t, () => emptyGate())
      else walk(t)
    })
    walk(id)
  }

  // A replacement can reuse its item id or URL. Mark existing assemblies stale explicitly,
  // including across approval gates; Send still keeps all existing downstream outputs.
  function invalidateStitchesBelow(flow, id) {
    for (const target of downstreamOf(flow, id)) {
      if (byId(flow, target).type === 'stitch') edit(target, (s) => ({ items: (s.items || []).map((item) => ({ ...item, stale: true })) }))
    }
  }

  async function runNode(flow, id) {
    const n = byId(flow, id)
    const units = todo(flow, id)
    if (!units.length) return 0
    const model = n.type === 'stitch' ? { kind: 'video' } : renderTypes.includes(n.type) ? { kind: renderKind(n) } : n.data.model || { kind: 'text' }
    const pending = units.map((u) => ({
      id: `${id}:${u.key}`, unit: u.key, row: u.row, take: u.take, prompt: u.opts.prompt,
      kind: model.kind, aspect: u.opts.aspect, signature: u.signature, status: 'pending',
    }))
    edit(id, (s) => ({ items: [...(s.items || []).filter((i) => i.status === 'done'), ...pending], running: (s.running || 0) + 1, ...(n.type === 'writer' ? { sent: false } : {}) }))
    await Promise.all(units.map(async (u, k) => {
      let next
      try {
        const files = await limit(async () => {
          if (n.type === 'stitch') return [await stitch(u.opts)]
          if (renderTypes.includes(n.type)) {
            if (!render) throw new Error('Local renders are not connected.')
            return [await render(n.type, u.opts, { stepId: id, unitId: u.key })]
          }
          if (n.type !== 'writer') return run(model, u.opts, { stepId: id, unitId: u.key })
          if (!writePrompt) throw new Error('Prompt writing is not connected.')
          const text = await writePrompt(u.opts, { stepId: id, unitId: u.key })
          if (typeof text !== 'string' || !text.trim()) throw new Error('Writer returned no prompt.')
          return [{ kind: 'text', text: text.trim(), prompt: text.trim() }]
        })
        next = files.map((f, i) => ({ ...pending[k], id: `${pending[k].id}#${i}`, kind: model.kind, ...f, status: 'done', created: Date.now() }))
      } catch (e) {
        next = [{ ...pending[k], status: 'failed', error: e.message || String(e), ...(e.code && { code: e.code }), ...(e.reason && { reason: e.reason }) }]
      }
      edit(id, (s) => ({ items: s.items.flatMap((i) => (i.id === pending[k].id ? next : [i])) }))
    }))
    edit(id, (s) => ({ running: s.running - 1 }))
    syncGates(flow)
    return units.length
  }

  // Dependency-ordered passes. A node runs once per pass, only when every input has data.
  async function pass(flow, { only = null, skipWithOutput = false, retryIds = new Set() } = {}) {
    const ran = new Set()
    let total = 0
    for (;;) {
      const ready = topoOrder(flow).filter((id) => {
        const n = byId(flow, id)
        return executable(n) && !ran.has(id) && (!only || only.has(id)) && !running(id)
          && !(n.type === 'stitch' && n.data.manual)
          && !(skipWithOutput && !retryIds.has(id) && doneItems(id).length) && todo(flow, id).length > 0
      })
      if (!ready.length) break
      ready.forEach((id) => ran.add(id))
      total += (await Promise.all(ready.map((id) => runNode(flow, id)))).reduce((a, b) => a + b, 0)
    }
    syncGates(flow)
    return { ran: total }
  }

  return {
    get state() { return S },
    get peak() { return peak },
    load(state) { S = state || {}; emit() },
    subscribe(f) { subs.add(f); return () => subs.delete(f) },
    gate,
    itemsOf: (flow, id) => itemsOf(flow, id),
    reviewItems,
    plan,
    pending: (flow, id) => todo(flow, id).length,
    hasOutput: (flow) => flow.nodes.some((n) => executable(n) && doneItems(n.id).length),
    isRunning: () => Object.values(S).some((s) => s.running > 0),

    // Run: fill gaps only. Kept outputs and sent gates stay; gates still block.
    async runNew(flow) {
      topoOrder(flow)
      syncGates(flow)
      return pass(flow)
    },

    // Retry keeps successful units, scopes the pass, and never opens an approval gate.
    async retryFailed(flow, ids = flow.nodes.map((n) => n.id)) {
      if (Object.values(S).some((s) => s.running > 0)) return { ok: false, reason: 'Already running' }
      const retryIds = new Set(ids.filter((id) => failed(id)))
      const only = new Set([...retryIds].flatMap((id) => [id, ...downstreamOf(flow, id)]))
      return { ok: true, ...await pass(flow, { only, skipWithOutput: true, retryIds }) }
    },

    // Regenerate all: wipe every model output and gate, then run from scratch.
    async regenerateAll(flow) {
      topoOrder(flow)
      for (const n of flow.nodes) {
        if (executable(n)) edit(n.id, () => ({ items: [], running: 0, sent: false }))
        if (n.type === 'approve') edit(n.id, () => emptyGate())
      }
      return pass(flow)
    },

    // Send: open the gate, then run only downstream nodes that have no output yet. Never touches upstream.
    async send(flow, id) {
      const g = gate(id)
      if (g.status !== 'reviewing' && g.status !== 'stopped') return { ok: false, reason: 'Nothing to send yet' }
      const items = reviewItems(flow, id)
      if (!items.length) return { ok: false, reason: 'Nothing to send yet' }
      const chosen = items.filter((i) => g.picked.includes(i.id))
      edit(id, () => ({ status: 'sent', sent: chosen.length ? chosen : items }))
      const res = await pass(flow, { only: downstreamOf(flow, id), skipWithOutput: true })
      return { ok: true, ...res }
    },

    editWriter(flow, id, text) {
      if (byId(flow, id)?.type !== 'writer' || running(id) || !doneItems(id).length) return
      edit(id, (s) => ({ sent: false, items: s.items.map((i) => i.status === 'done' ? { ...i, text, prompt: text } : i) }))
      resetGatesBelow(flow, id)
    },

    async sendWriter(flow, id) {
      if (byId(flow, id)?.type !== 'writer' || running(id) || S[id]?.sent || !doneItems(id)[0]?.text?.trim()) return { ok: false, reason: 'Write and review a prompt first' }
      edit(id, () => ({ sent: true }))
      return { ok: true, ...await pass(flow, { only: downstreamOf(flow, id), skipWithOutput: true }) }
    },

    stop(flow, id) {
      if (gate(id).status === 'reviewing') edit(id, () => ({ status: 'stopped' }))
    },

    // Approve only marks a take. One pick per row. It never sends.
    togglePick(flow, id, itemId) {
      const items = reviewItems(flow, id)
      const it = items.find((i) => i.id === itemId)
      if (!it) return
      const on = gate(id).picked.includes(itemId)
      const sameRow = new Set(items.filter((i) => i.row === it.row).map((i) => i.id))
      edit(id, (s) => ({ picked: [...(s.picked || []).filter((p) => !sameRow.has(p)), ...(on ? [] : [itemId])] }))
    },

    // Rerun re-executes this one node. No cascade; downstream gates close.
    async rerun(flow, id) {
      const p = plan(flow, id)
      if (p.blocked) return { ok: false, reason: 'Waiting on an upstream node or approval' }
      if (running(id)) return { ok: false, reason: 'Already running' }
      edit(id, () => ({ items: [] }))
      invalidateStitchesBelow(flow, id)
      resetGatesBelow(flow, id)
      const ran = await runNode(flow, id)
      return { ok: true, ran }
    },

    // Rerun from a gate: regenerate the node feeding it and go back to empty.
    async rerunGate(flow, id) {
      edit(id, () => emptyGate())
      let ran = 0
      for (const s of sources(flow, id)) {
        if (!executable(byId(flow, s)) || running(s) || plan(flow, s).blocked) continue
        edit(s, () => ({ items: [] }))
        invalidateStitchesBelow(flow, s)
        ran += await runNode(flow, s)
      }
      return { ok: true, ran }
    },

    clearGate(flow, id) {
      edit(id, () => emptyGate())
      syncGates(flow)
    },

    syncGates,
  }
}
