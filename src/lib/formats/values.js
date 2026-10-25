import { widgetOptions, widgetReady, widgetTypes } from '../../../shared/widgetInputs.js'

const textual = ['text', 'longtext']
const libraryPicks = ['character', 'product', 'brand', 'voice']

const startValue = (i) => {
  if (i.type === 'choice') return i.default ?? i.options[0].id
  if (i.type === 'count') return i.default ?? i.options[0]
  return textual.includes(i.type) ? '' : null
}

export const initialValues = (format) => Object.fromEntries(format.inputs.map((i) => [i.id, startValue(i)]))

// Inputs with `when: [choiceId, optionId]` only show, and only count, while that option is picked.
export const visibleInputs = (format, values) => format.inputs.filter((i) => !i.when || values[i.when[0]] === i.when[1])

// A motion drawing needs its arrows too: the graph reads them as its mask.
export const missingInputs = (format, values) => visibleInputs(format, values)
  .filter((i) => !i.optional && (widgetTypes.includes(i.type) || (i.type === 'draw' && i.mode !== 'motion')
    ? !widgetReady(i.type === 'draw' ? 'mask' : i.type, values[i.id])
    : i.type === 'draw' ? !values[i.id]?.url || !values[i.id]?.strokes
      : textual.includes(i.type) ? !values[i.id]?.trim() : values[i.id] == null || values[i.id] === ''))

// Picture-like inputs, in the order a ComfyUI graph's image, image2, ... slots take them.
export const pictureTypes = ['image', 'draw', 'mask', 'face', 'crop', 'character', 'product']

// The files a ComfyUI graph takes by slot: one picture per picture-like input, in the order the format
// lists them, so an empty optional input keeps its slot (a saved character or product gives its first
// picture); the first audio input; a saved voice's sample. Null when the format has none of them.
export function fileSlots(format, values) {
  const shown = new Set(visibleInputs(format, values).map((i) => i.id))
  const value = (i) => (shown.has(i.id) ? values[i.id] : null)
  const picture = (i) => {
    const v = value(i)
    if (!v) return null
    if (i.type === 'character' || i.type === 'product') return v.images?.[0] || null
    if (widgetTypes.includes(i.type) || (i.type === 'draw' && i.mode !== 'motion')) {
      const type = i.type === 'draw' ? 'mask' : i.type
      return widgetReady(type, v) ? widgetOptions(type, v).image || null : null
    }
    return v.url || null
  }
  const pictures = format.inputs.filter((i) => pictureTypes.includes(i.type)).map(picture)
  const audio = format.inputs.filter((i) => i.type === 'audio').map((i) => value(i)?.url).find(Boolean) || null
  const voice = format.inputs.filter((i) => i.type === 'voice').map((i) => value(i)?.sample).find(Boolean) || null
  if (!pictures.length && !format.inputs.some((i) => i.type === 'audio' || i.type === 'voice')) return null
  return { pictures, audio, voice }
}

// Turns a format and the sheet's values into options for gens.generate().
export function formatOptions(format, values) {
  const images = []
  const fields = {}
  const media = {}
  const refs = []
  const inputs = {}
  let widgets = {}
  let params = { ...format.params }
  const fill = {}
  for (const input of visibleInputs(format, values)) {
    const v = values[input.id]
    if (widgetTypes.includes(input.type) || (input.type === 'draw' && input.mode !== 'motion')) {
      const type = input.type === 'draw' ? 'mask' : input.type
      if (!widgetReady(type, v)) continue
      const opts = widgetOptions(type, v)
      widgets = { ...widgets, ...opts }
      inputs[input.id] = v
      if (opts.image) images.push(opts.image)
      if (opts.mask) media[`${input.id}Strokes`] = opts.mask
      if (opts.video) media[input.id] = opts.video
      if (input.field) fields[input.field] = opts.image || opts.video
      fill[input.id] = v.name || ''
    } else if (input.type === 'image') {
      if (!v) continue
      if (input.field) fields[input.field] = v.url
      else images.push(v.url)
    } else if (input.type === 'video' || input.type === 'audio') {
      if (v) media[input.id] = v.url
    } else if (input.type === 'draw') {
      if (v) { images.push(v.url); if (v.strokes) media[`${input.id}Strokes`] = v.strokes }
    } else if (libraryPicks.includes(input.type)) {
      if (v) { refs.push(v); fill[input.id] = v.name }
    } else if (input.type === 'choice') {
      const opt = input.options.find((o) => o.id === v)
      fill[input.id] = opt?.text || opt?.label || ''
      params = { ...params, ...opt?.params }
    } else if (input.type === 'count') {
      fill[input.id] = String(v)
    } else fill[input.id] = (v || '').trim()
  }
  // Collapse spaces but keep line breaks, so shot lists stay one shot per line.
  const prompt = format.prompt.replace(/\{(\w+)\}/g, (_, k) => fill[k] ?? '').replace(/[^\S\n]+/g, ' ').replace(/ *\n\s*/g, '\n').trim()
  const first = format.inputs.find((i) => i.type === 'image' || i.type === 'draw' || widgetTypes.includes(i.type))
  const slots = fileSlots(format, values)
  // A shape, length or quality choice sets the run's canvas or length; none is an input of the model.
  const { aspect: shaped, duration: timed, scale, ...rest } = params
  return {
    ...widgets, prompt, caption: format.name, images, fields, params: rest, count: 1,
    ...(slots && { slots }),
    ...(Object.keys(inputs).length && { inputs }),
    ...(Object.keys(media).length && { media }), ...(refs.length && { refs }),
    aspect: shaped || format.settings.aspect, duration: timed || format.settings.duration, ...(scale && { scale }), shape: first ? values[first.id]?.ratio : undefined,
  }
}

// Formats run on a fal endpoint unless `model` names one of our catalog ids.
// Open-weight formats run their workflow on Comfy.
export const formatModel = (format, catalog) => (format.engine === 'comfy'
  ? { id: `format:${format.id}`, provider: 'comfy', kind: format.kind, name: format.runsOn || format.name, workflow: format.workflow }
  : catalog.find((m) => m.id === format.model) || { id: `format:${format.id}`, provider: 'fal', kind: format.kind, name: format.name, model: format.model })
