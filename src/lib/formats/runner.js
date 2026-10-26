import { createEngine, downstreamOf } from '../flowEngine.js'
import { initialValues, missingInputs, visibleInputs, pictureTypes } from '../recipes.js'
import { stepModel, stepOptions } from './options.js'
import { validateFormat } from './validate.js'
import { preflightFlow } from './preflight.js'
import { aspectSize } from '../catalog.js'
import { keepRequestKey } from '../routerBatch.js'

// The canvas whose ratio is nearest a picture's 'w:h' shape, or square without one.
export function nearestAspect(shape) {
  const [w, h] = String(shape || '').split(':').map(Number)
  if (!(w > 0 && h > 0)) return '1:1'
  const gap = (a) => Math.abs(Math.log((w / h) / (aspectSize[a][0] / aspectSize[a][1])))
  return Object.keys(aspectSize).reduce((best, a) => (gap(a) < gap(best) ? a : best), '1:1')
}

export function compileFormat(format, userInputs = {}) {
  const problems = validateFormat(format)
  if (problems.length) throw new Error(`${format.name}: ${problems.join('; ')}`)
  const values = { ...initialValues(format), ...structuredClone(userInputs) }
  const missing = missingInputs(format, values)
  if (missing.length) throw new Error(`Still needed: ${missing.map((i) => i.label || i.id).join(', ')}`)
  for (const input of visibleInputs(format, values)) {
    if (input.optional && values[input.id] == null) continue
    if (input.type === 'choice' && !input.options.some((o) => o.id === values[input.id])) throw new Error(`Invalid choice for ${input.label || input.id}`)
    if (input.type === 'count' && !input.options.includes(values[input.id])) throw new Error(`Invalid count for ${input.label || input.id}`)
    if (['image', 'video', 'audio', 'draw'].includes(input.type) && !values[input.id]?.url) throw new Error(`Add a file for ${input.label || input.id}`)
  }
  const nodes = []
  const edges = []
  const steps = format.writer && !format.steps.some((s) => s.type === 'writer')
    ? [{ id: 'writer', type: 'writer', instructions: format.writer }, ...format.steps]
    : format.steps
  const receivesWriter = (from) => from.some((id) => {
    const index = steps.findIndex((s) => s.id === id)
    const source = steps[index]
    return source?.type === 'writer' || (source?.type === 'approve' && receivesWriter(source.from ?? (index ? [steps[index - 1].id] : [])))
  })
  for (const [index, step] of steps.entries()) {
    const from = step.from ?? (index ? [steps[index - 1].id] : [])
    if (step.type === 'writer') {
      const media = visibleInputs(format, values).filter((input) => pictureTypes.includes(input.type)).flatMap((input) => {
        const value = values[input.id]
        return value?.url ? [value.faceUrl || value.url] : value?.images || []
      })
      const note = visibleInputs(format, values).filter((i) => ['text', 'longtext'].includes(i.type)).map((i) => values[i.id]).filter(Boolean).join('\n\n')
      nodes.push({ id: step.id, type: 'writer', data: { instructions: step.instructions || step.writer_instructions || format.writer, note, images: media, target: step.target || format.runsOn || format.kind, ...(step.review && { review: step.review }) } })
    } else if (step.type === 'stitch') {
      // Joins the upstream clips in the order `from` lists them, each with its own sound.
      nodes.push({ id: step.id, type: 'stitch', data: { clips: [], aspect: stepOptions(format, step, values).aspect } })
    } else if (step.type === 'approve') {
      nodes.push({ id: step.id, type: 'approve', data: {} })
    } else {
      const options = stepOptions(format, step, values)
      const model = { ...stepModel(format, step, values), formatStep: { id: step.id, from, options, written: receivesWriter(from) } }
      nodes.push({ id: step.id, type: 'model', data: { model, prompt: options.prompt || format.name, aspect: options.aspect, duration: options.duration, count: options.count, takes: step.takes || 1 } })
      // One reference triggers one run, including tools whose prompt is empty or which take named image fields.
      if (!from.length) {
        const image = visibleInputs(format, values).find((i) => i.type === 'image' && values[i.id]?.url)
        if (image) {
          const id = `input:${step.id}:${image.id}`
          if (format.steps.some((s) => s.id === id)) throw new Error(`Reserved step id ${id}`)
          nodes.push({ id, type: 'image', data: { url: values[image.id].url } })
          edges.push({ source: id, target: step.id })
        }
      }
    }
    edges.push(...from.map((source) => ({ source, target: step.id })))
  }
  nodes.forEach((node, i) => { node.position = { x: i * 340, y: 0 } })
  return { id: `format:${format.id}`, name: format.name, formatId: format.id, nodes, edges, outputs: format.outputs, values }
}

// Planning is read-only; requirements can be injected for offline adapters and checks.
export async function preflight(format, values, options) {
  return preflightFlow(compileFormat(format, values), options)
}

// run(model, options, metadata) must resolve to files and persist them to the caller's Library.
export async function runFormat(format, inputs, { run, writePrompt, onChange = () => {}, onSession = () => {}, concurrency, ...planning } = {}) {
  let flow
  let setupError
  try {
    flow = compileFormat(format, inputs)
    if (typeof run !== 'function') throw new Error('A Library generation adapter is required')
  } catch (error) {
    setupError = error
    flow ||= { nodes: [], edges: [], outputs: [], values: {} }
  }
  const batch = globalThis.crypto.randomUUID()
  let session
  let operating = false
  let operationError = setupError || null
  let plan = null
  let inFlight = null
  const adapters = new Map()
  const adapterFor = ({ stepId, unitId }, options) => {
    const key = JSON.stringify([stepId, unitId])
    const { routerBatch, ...body } = options
    const signature = JSON.stringify(body)
    let adapter = adapters.get(key)
    // Only an identical retry can reconcile the original request.
    if (!adapter || adapter.done || adapter.signature !== signature) {
      adapter = { options, signature, itemId: crypto.randomUUID(), done: false }
      adapters.set(key, adapter)
    }
    return adapter
  }
  const notify = () => onChange(engine.state, session)
  // Edits and upscales keep the picture they started from, so the result can be compared with it.
  const sourceInput = !setupError && format.kind === 'image' && ['image-edit', 'enhance'].includes(format.category)
    && visibleInputs(format, flow.values).find((i) => ['image', 'draw', 'mask', 'product'].includes(i.type) && flow.values[i.id]?.url)
  const source = sourceInput ? flow.values[sourceInput.id].url : undefined
  const join = format.steps.find((s) => s.type === 'stitch')
  const engine = createEngine({
    concurrency,
    onChange: notify,
    // A join runs through the same adapter, so it queues and saves to the Library like a generation.
    stitch: async (opts) => (await run({ id: `format:${format.id}:${join.id}`, provider: 'stitch', kind: 'video', name: 'Stitch' }, { ...opts, caption: format.name },
      { formatId: format.id, stepId: join.id, formatRunId: batch }))[0],
    writePrompt: writePrompt ? async (input, identity) => {
      const adapter = adapterFor(identity, { ...input, inputs: flow.values, format })
      adapter.options.idempotencyKey ||= crypto.randomUUID()
      try {
        const text = await writePrompt(adapter.options)
        if (typeof text === 'string' && text.trim()) adapter.done = true
        else delete adapter.options.idempotencyKey
        return text
      } catch (error) {
        if (!keepRequestKey(error)) delete adapter.options.idempotencyKey
        throw error
      }
    } : undefined,
    run: async (model, unit, identity) => {
      const { formatStep, ...target } = model
      const options = { ...formatStep.options, count: unit.count, caption: format.name }
      if (formatStep.written && unit.prompt) options.prompt = unit.prompt
      if (formatStep.from.length && unit.image) {
        options.images = [unit.image]
        // An upstream picture takes the first slot; the format's other pictures keep theirs.
        if (options.slots) options.slots = { ...options.slots, pictures: [unit.image, ...options.slots.pictures.slice(1)] }
      }
      // An upstream song is the graph's audio file.
      if (formatStep.from.length && unit.audio) {
        options.audio = unit.audio
        if (options.slots) options.slots = { ...options.slots, audio: unit.audio }
      }
      // A graph needs a canvas: 'auto' takes the one nearest the first picture's shape.
      if (target.provider === 'comfy' && options.aspect === 'auto') options.aspect = nearestAspect(options.shape)
      const adapter = adapterFor(identity, options)
      const files = await run(target, adapter.options, { formatId: format.id, stepId: formatStep.id, formatRunId: batch, itemId: adapter.itemId, prompt: adapter.options.prompt, ...(source && { source }) })
      adapter.done = true
      return files
    },
  })
  const failures = () => Object.entries(engine.state).flatMap(([stepId, state]) => (state.items || []).filter((i) => i.status === 'failed').map((item) => ({ stepId, ...item })))
  const retryScope = (ids = failures().map((f) => f.stepId)) => {
    const failed = new Set(failures().map((f) => f.stepId))
    return new Set(ids.filter((id) => failed.has(id)).flatMap((id) => [id, ...downstreamOf(flow, id)]))
  }
  async function perform(action, overrides = {}, only = null) {
    if (session.busy) return { ok: false, reason: { code: 'busy', message: 'This session is already running.' } }
    if (setupError) throw session.error
    operating = true
    operationError = null
    notify()
    try {
      plan = await preflightFlow(flow, { ...planning, ...overrides })
      // A resumed run does not need the credentials or target of an already paid step.
      const completed = new Set(Object.entries(engine.state).filter(([, s]) => s.items?.length && s.items.every((i) => i.status === 'done')).map(([id]) => id))
      const reasons = plan.reasons.filter((r) => !completed.has(r.stepId) && (!only || only.has(r.stepId)))
      plan = { ...plan, reasons, reason: reasons[0] || null, ok: !reasons.length }
      notify()
      if (!plan.ok) throw session.error
      const result = await action()
      if (session.error) throw session.error
      return result
    } catch (error) {
      if (!error.session) operationError = error
      throw Object.assign(error, { session })
    } finally {
      operating = false
      notify()
    }
  }
  const launch = (action, options, only) => {
    if (session.busy) return Promise.resolve({ ok: false, reason: { code: 'busy', message: 'This session is already running.' } })
    inFlight = perform(action, options, only)
    return inFlight
  }
  const queuedRetries = new Map()
  const retry = (id, options) => {
    if (queuedRetries.has(id)) return queuedRetries.get(id)
    if (!session.busy) {
      // Hold the step until this retry settles, so a second click cannot pay for it again.
      const launched = launch(() => engine.retryFailed(flow, [id]), options, retryScope([id]))
        .finally(() => { if (queuedRetries.get(id) === launched) queuedRetries.delete(id) })
      queuedRetries.set(id, launched)
      return launched
    }
    if (!inFlight) return Promise.reject(Object.assign(new Error('This session is already running. Try again when it finishes.'), { session, code: 'busy' }))
    const queued = inFlight.catch(() => {}).then(() => {
      queuedRetries.delete(id)
      return retry(id, options)
    })
    queuedRetries.set(id, queued)
    return queued
  }
  session = {
    flow, engine, id: batch, formatRunId: batch,
    results: () => flow.outputs.flatMap((out) => engine.itemsOf(flow, out.step) || []),
    get busy() { return operating || engine.isRunning() },
    get inFlight() { return inFlight },
    get preflight() { return plan },
    get cost() { return plan?.cost || null },
    get failures() { return failures() },
    get reason() {
      if (operationError) return { code: operationError.code || (setupError ? 'invalid_format' : 'preflight_failed'), message: operationError.message }
      if (plan && !plan.ok) return plan.reason
      const failed = failures()[0]
      return failed ? { code: failed.code || 'step_failed', stepId: failed.stepId, message: failed.error, detail: failed.reason } : null
    },
    get error() { const reason = session.reason; return reason ? Object.assign(new Error(reason.message), reason, { session }) : null },
    get ok() { return !session.reason },
    start: (options) => launch(() => engine.runNew(flow), options),
    retry,
    retryFailed: (options) => launch(() => Object.keys(engine.state).length ? engine.retryFailed(flow) : engine.runNew(flow), options, Object.keys(engine.state).length ? retryScope() : null),
    sendWriter: (id, options) => launch(() => engine.sendWriter(flow, id), options, downstreamOf(flow, id)),
    send: (id, options) => launch(() => engine.send(flow, id), options, downstreamOf(flow, id)),
  }
  onSession(session)
  await session.start()
  return session
}
