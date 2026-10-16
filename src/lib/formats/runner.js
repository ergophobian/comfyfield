import { createEngine } from '../flowEngine.js'
import { initialValues, missingInputs, visibleInputs } from '../recipes.js'
import { stepModel, stepOptions } from './options.js'
import { validateFormat } from './validate.js'

export function compileFormat(format, userInputs = {}) {
  const problems = validateFormat(format)
  if (problems.length) throw new Error(`${format.name}: ${problems.join('; ')}`)
  const values = { ...initialValues(format), ...userInputs }
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
      const media = visibleInputs(format, values).flatMap((input) => {
        const value = values[input.id]
        return value?.url ? [value.faceUrl || value.url] : value?.images || []
      })
      const note = visibleInputs(format, values).filter((i) => ['text', 'longtext'].includes(i.type)).map((i) => values[i.id]).filter(Boolean).join('\n\n')
      nodes.push({ id: step.id, type: 'writer', data: { instructions: step.instructions || step.writer_instructions || format.writer, note, images: media, target: step.target || format.runsOn || format.kind } })
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

// run(model, options, metadata) must resolve to files and persist them to the caller's Library.
// writePrompt is supplied by the prompt-writer lane; no writer calls are implicit.
export async function runFormat(format, inputs, { run, writePrompt, onChange, concurrency } = {}) {
  if (typeof run !== 'function') throw new Error('A Library generation adapter is required')
  const flow = compileFormat(format, inputs)
  const batch = globalThis.crypto.randomUUID()
  const engine = createEngine({
    concurrency,
    onChange,
    writePrompt: writePrompt ? (input) => writePrompt({ ...input, inputs: flow.values, format }) : undefined,
    run: (model, unit) => {
      const { formatStep, ...target } = model
      const options = { ...formatStep.options, count: unit.count, caption: format.name }
      if (formatStep.written && unit.prompt) options.prompt = unit.prompt
      if (formatStep.from.length && unit.image) options.images = [unit.image]
      if (target.provider === 'comfy' && options.aspect === 'auto') options.aspect = '1:1'
      return run(target, options, { formatId: format.id, stepId: formatStep.id, formatRunId: batch, prompt: options.prompt })
    },
  })
  const results = () => flow.outputs.flatMap((out) => engine.itemsOf(flow, out.step) || [])
  const check = () => {
    const failed = Object.values(engine.state).flatMap((s) => s.items || []).find((i) => i.status === 'failed')
    if (failed) throw new Error(failed.error)
  }
  await engine.runNew(flow)
  check()
  return { flow, engine, results, sendWriter: async (id) => { const result = await engine.sendWriter(flow, id); check(); return result }, send: async (id) => { const result = await engine.send(flow, id); check(); return result } }
}
