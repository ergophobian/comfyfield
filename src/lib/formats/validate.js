import { initialValues, visibleInputs, pictureTypes } from '../recipes.js'
import { falInput, comfyRouterInput, PICTURE_SLOTS } from '../../../shared/mapping.js'
import { schemas as savedSchemas } from './schemas.js'
import { stepModel, stepOptions, selectedStep } from './options.js'
import { widgetTypes } from '../../../shared/widgetInputs.js'
import { topoOrder } from '../flowEngine.js'

const types = new Set(['text', 'longtext', 'choice', 'count', 'image', 'video', 'audio', 'draw', 'character', 'product', 'brand', 'voice', ...widgetTypes])
const media = new Set(['image', 'video', 'audio', 'draw', ...widgetTypes])
const imageFields = ['image_url', 'start_image_url', 'first_frame_url', 'input_image_url', 'image', 'image_urls', 'input_image_urls', 'reference_image_urls']
const variables = (text) => [...String(text || '').matchAll(/\{(\w+)\}/g)].map((m) => m[1])

function sampleValues(format) {
  return Object.fromEntries(format.inputs.map((i) => [i.id, i.type === 'choice' ? i.default ?? i.options?.[0]?.id
    : i.type === 'count' ? i.default ?? i.options?.[0] : media.has(i.type) ? { url: 'https://example.test/input.png', ratio: '1:1', maskUrl: 'https://example.test/mask.png', faceUrl: 'https://example.test/face.png', duration: 5, trim: { start: 0, end: 5 }, box: { x: 0, y: 0, width: 1, height: 1 } }
      : types.has(i.type) && !['text', 'longtext'].includes(i.type) ? { name: 'Sample' } : 'Sample']))
}

function checkValue(value, schema) {
  if (schema.enum && !schema.enum.includes(value)) return `must be one of ${schema.enum.join(', ')}`
  if (schema.type === 'array' && !Array.isArray(value)) return 'must be an array'
  if (schema.type === 'integer' && !Number.isInteger(value)) return 'must be an integer'
  if (['string', 'number', 'boolean'].includes(schema.type) && typeof value !== schema.type) return `must be ${schema.type}`
  return null
}

export function validateFormat(format, schemas = savedSchemas) {
  const reasons = []
  const bad = (message) => reasons.push(message)
  for (const field of ['id', 'name', 'job', 'shape', 'cover']) {
    if (typeof format[field] !== 'string' || !format[field].trim()) bad(`Missing ${field}`)
  }
  if (!['preset', 'chain', 'tool', 'pipeline'].includes(format.shape)) bad(`Unknown shape ${format.shape}`)
  if (!Array.isArray(format.inputs)) bad('Missing typed inputs')
  if (!Array.isArray(format.steps) || !format.steps.length) bad('Missing steps')
  if (!Array.isArray(format.outputs) || !format.outputs.length) bad('Missing outputs')
  if (reasons.length) return reasons

  const slots = new Map()
  for (const input of format.inputs) {
    if (!input.id || slots.has(input.id)) bad(`Missing or duplicate input id ${input.id}`)
    slots.set(input.id, input)
    if (typeof input.label !== 'string' || !input.label.trim()) bad(`Missing label for ${input.id}`)
    if (!types.has(input.type)) bad(`Unknown input type ${input.type}`)
    if (input.type === 'choice' && (!input.options?.length || input.options.some((o) => !o.id))) bad(`Invalid choices for ${input.id}`)
    if (input.type === 'count' && (!input.options?.length || input.options.some((o) => !Number.isInteger(o) || o < 1))) bad(`Invalid counts for ${input.id}`)
    if (input.default != null && input.options && !input.options.some((o) => (o.id ?? o) === input.default)) bad(`Invalid default for ${input.id}`)
  }
  for (const input of format.inputs) {
    if (input.when && !slots.get(input.when[0])?.options?.some((o) => o.id === input.when[1])) bad(`Invalid condition for ${input.id}`)
  }
  const ids = new Set()
  for (const step of format.steps) {
    if (!step.id || ids.has(step.id)) bad(`Missing or duplicate step id ${step.id}`)
    ids.add(step.id)
    if (step.from != null && (!Array.isArray(step.from) || step.from.some((id) => typeof id !== 'string'))) bad(`Invalid dependencies for ${step.id}`)
    if (step.takes != null && (!Number.isInteger(step.takes) || step.takes < 1)) bad(`Invalid takes for ${step.id}`)
    if (step.type === 'approve') continue
    if (step.type === 'writer') {
      if (!(step.instructions || step.writer_instructions || format.writer)?.trim()) bad(`${step.id}: Missing writer instructions`)
      continue
    }
    if (step.type) bad(`Unknown step type ${step.type}`)
    if (!stepModel(format, step)) bad(`Unknown model ${step.model}`)
    for (const slot of variables(step.prompt ?? format.prompt)) if (!slots.has(slot)) bad(`${step.id}: unknown prompt slot ${slot}`)
    for (const slot of Object.values(step.bindings || {}).flat().map((path) => path.split('.')[0])) if (!slots.has(slot)) bad(`${step.id}: unknown binding slot ${slot}`)
  }
  if (reasons.length) return reasons
  const edges = format.steps.flatMap((s, i) => (s.from ?? (i ? [format.steps[i - 1].id] : [])).map((source) => ({ source, target: s.id })))
  if (edges.some((e) => !ids.has(e.source))) bad('Unknown upstream step')
  else {
    try { topoOrder({ nodes: format.steps, edges }) } catch (e) { bad(e.message) }
  }
  for (const out of format.outputs) {
    const step = format.steps.find((s) => s.id === out.step)
    if (!step || ['approve', 'writer'].includes(step.type) || !out.kind || out.kind !== (step.kind || format.kind)) bad(`Invalid output ${out.step}`)
  }
  for (const step of format.steps.filter((s) => s.type === 'approve')) if (!edges.some((e) => e.target === step.id)) bad(`${step.id}: Approval needs an upstream step`)
  if (reasons.length) return reasons

  const used = new Set()
  const hasWriter = format.writer || format.steps.some((s) => s.type === 'writer')
  if (hasWriter) for (const input of format.inputs) used.add(input.id)
  const optionsFor = (step, values) => {
    const opts = stepOptions(format, step, values)
    if (hasWriter) opts.prompt = 'Written prompt'
    return opts
  }
  let missingTarget = false
  for (const raw of format.steps.filter((s) => !s.type)) {
    for (const target of raw.targets ? Object.keys(raw.targets) : [null]) {
      const selected = target ? { [raw.targetInput]: target } : {}
      const step = selectedStep(format, raw, selected)
      if (raw.targetInput) used.add(raw.targetInput)
      const model = stepModel(format, step)
      const label = `${step.id}:`
      const schema = model.provider === 'fal' ? schemas.fal[model.model] : model.provider === 'comfyRouter' ? schemas.router?.[model.model] : schemas.comfy[model.workflow]
      if (!schema) {
        missingTarget = true
        bad(`${label} ${model.provider === 'comfy' ? 'Missing Comfy workflow' : 'Missing input schema for'} ${model.workflow || model.model}`)
        continue
      }
      const sources = (id) => {
        const source = format.steps.find((s) => s.id === id)
        return source.type === 'approve' ? edges.filter((e) => e.target === id).flatMap((e) => sources(e.source)) : [source]
      }
      const upstream = edges.filter((e) => e.target === step.id).flatMap((e) => sources(e.source)).filter((s) => s.type !== 'writer')
      for (const source of upstream) {
        if (source && (source.kind || format.kind) !== 'image') bad(`${label} Only image outputs can feed another model yet`)
      }
      const values = { ...sampleValues(format), ...selected }
      const variants = [values, ...format.inputs.flatMap((input) => input.type === 'choice' && input.id !== raw.targetInput ? input.options.map((o) => ({ ...values, [input.id]: o.id })) : [])]
      for (const slot of variables(step.prompt ?? format.prompt)) used.add(slot)
      for (const slot of Object.values(step.bindings || {}).flat()) used.add(slot.split('.')[0])
      if (model.provider === 'fal') {
        const props = schema.properties
        for (const input of format.inputs) {
          if (input.field && props[input.field]) used.add(input.id)
          else if (input.type === 'image' && imageFields.some((field) => props[field])) used.add(input.id)
          else if (input.type === 'choice' && input.options.every((o) => Object.keys(o.params || {}).length)) used.add(input.id)
        }
        for (const variant of variants) {
          const opts = optionsFor(step, variant)
          const mapped = falInput(props, opts)
          if (upstream.length) {
            const field = imageFields.find((f) => props[f])
            if (!field) bad(`${label} Target does not accept upstream images`)
            else mapped[field] = props[field].type === 'array' ? ['https://example.test/output.png'] : 'https://example.test/output.png'
          }
          for (const field of schema.required || []) if (mapped[field] == null) bad(`${label} Required model field ${field} is not mapped`)
          for (const [field, value] of Object.entries(mapped)) {
            if (value == null) continue
            if (!props[field]) bad(`${label} Unknown model field ${field}`)
            else {
              const reason = checkValue(value, props[field])
              if (reason) bad(`${label} ${field} ${reason}`)
            }
          }
        }
      } else if (model.provider === 'comfy') {
        // A step with an image graph runs it when an image is attached, so both graphs must fit.
        const imageSchema = model.imageWorkflow ? schemas.comfy[model.imageWorkflow] : null
        if (model.imageWorkflow && !imageSchema) bad(`${label} Missing Comfy workflow ${model.imageWorkflow}`)
        const hasVideo = format.inputs.some((i) => i.type === 'video')
        // Each picture-like input fills one slot in order, so a format with three gives image to image3.
        const pictures = format.inputs.filter((i) => pictureTypes.includes(i.type)).length
        const files = [...PICTURE_SLOTS.slice(1, pictures), ...(format.inputs.some((i) => i.type === 'mask' || (i.type === 'draw' && i.mode !== 'motion')) ? ['mask'] : []),
          ...(format.inputs.some((i) => i.type === 'audio') ? ['audio'] : []), ...(format.inputs.some((i) => i.type === 'voice') ? ['voice'] : [])]
        const supplied = new Set(['prompt', 'width', 'height', 'count', 'frames', 'duration', 'start', 'seed', ...(hasVideo ? ['video'] : []), ...(stepOptions(format, step, values).images.length || upstream.length || pictures ? ['image'] : []), ...files, ...Object.keys(step.params || {}), ...Object.keys(step.bindings || {})])
        // A choice that always shows, and whose every option sets a param, supplies it.
        for (const input of format.inputs) {
          if (input.type !== 'choice' || input.when) continue
          for (const field of new Set(input.options.flatMap((o) => Object.keys(o.params || {})))) if (input.options.every((o) => field in (o.params || {}))) supplied.add(field)
        }
        // A placeholder only on nodes that drop without their file may stay empty.
        const optional = (w) => new Set(schemas.comfyOptional?.[w] || [])
        for (const field of schema) if (!supplied.has(field) && !optional(model.workflow).has(field)) bad(`${label} Unmapped workflow placeholder ${field}`)
        for (const field of imageSchema || []) if (!supplied.has(field) && !optional(model.imageWorkflow).has(field) && field !== 'image') bad(`${label} Unmapped workflow placeholder ${field}`)
        if (imageSchema && !imageSchema.includes('image')) bad(`${label} Image workflow ${model.imageWorkflow} takes no image`)
        const all = [...new Set([...schema, ...(imageSchema || [])])]
        if ((step.prompt || format.prompt || format.writer) && !schema.includes('prompt')) bad(`${label} Workflow has no prompt placeholder`)
        for (const variant of variants) {
          const opts = stepOptions(format, step, variant)
          for (const field of [...Object.keys(opts.params), ...Object.keys(opts.fields)]) if (!schema.includes(field)) bad(`${label} Unknown workflow placeholder ${field}`)
        }
        for (const input of format.inputs) {
          // A shape choice sets the run's canvas, so it maps without a placeholder.
          if (input.type === 'choice' && input.options.every((o) => Object.keys(o.params || {}).length && Object.keys(o.params).every((field) => field === 'aspect' || all.includes(field)))) used.add(input.id)
        }
        // A saved character or product gives its first image.
        if (PICTURE_SLOTS.some((k) => all.includes(k))) for (const input of format.inputs) if (pictureTypes.includes(input.type)) used.add(input.id)
        if (all.includes('video')) for (const input of format.inputs) if (input.type === 'video') used.add(input.id)
        if (all.includes('audio')) for (const input of format.inputs) if (input.type === 'audio') used.add(input.id)
        if (all.includes('voice')) for (const input of format.inputs) if (input.type === 'voice') used.add(input.id)
      } else if (model.provider === 'comfyRouter' && model.model === 'byteplus/dreamina-seedance-2-5-260628') {
        for (const variant of variants) {
          const mapped = comfyRouterInput(model.model, optionsFor(step, variant))
          for (const field of schema.required || []) if (mapped[field] == null) bad(`${label} Required Router field ${field} is not mapped`)
          for (const [field, value] of Object.entries(mapped)) {
            if (!schema.properties[field]) bad(`${label} Unknown Router field ${field}`)
            else if (checkValue(value, schema.properties[field])) bad(`${label} ${field} ${checkValue(value, schema.properties[field])}`)
          }
        }
        for (const input of format.inputs) if (input.type === 'image') used.add(input.id)
      } else bad(`${label} Provider ${model.provider} has no format schema validator yet`)
    }
  }
  // A choice that decides which inputs show is used through them.
  for (const input of format.inputs) if (input.when) used.add(input.when[0])
  if (!missingTarget) for (const input of format.inputs) if (!used.has(input.id)) bad(`Input ${input.id} does not map to a target model`)
  // Check a missing optional slot cannot leave a required model field unmapped.
  for (const step of format.steps.filter((s) => !s.type)) {
    const model = stepModel(format, step)
    const schema = schemas.fal[model.model]
    if (!schema || model.provider !== 'fal') continue
    const values = { ...initialValues(format), ...sampleValues(format) }
    for (const input of visibleInputs(format, values)) if (input.optional) values[input.id] = null
    const mapped = falInput(schema.properties, optionsFor(step, values))
    for (const field of schema.required || []) if (mapped[field] == null) bad(`${step.id}: Optional slot cannot supply required ${field}`)
  }
  return [...new Set(reasons)]
}
