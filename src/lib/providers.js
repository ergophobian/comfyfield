import { generate as runComfy } from './comfy.js'
import { aspectSize, defaultDurations } from './catalog.js'

// LTX wants dimensions divisible by 32 and frame counts of 8n + 1.
const videoSize = (a) => aspectSize[a].map((n) => Math.round((n * 0.6) / 32) * 32)
const falSize = { '1:1': 'square_hd', '16:9': 'landscape_16_9', '9:16': 'portrait_16_9', '4:5': 'portrait_4_3' }

const schemas = new Map()
export async function falSchema(endpoint) {
  if (!schemas.has(endpoint)) {
    schemas.set(endpoint, fetch(`/api/fal/schema?id=${encodeURIComponent(endpoint)}`)
      .then((r) => (r.ok ? r.json() : { properties: {} })).catch(() => ({ properties: {} })))
  }
  return schemas.get(endpoint)
}

const num = (v) => parseFloat(String(v))

// Durations a model accepts, in seconds, read from its schema when it has an enum.
export async function durationsFor(model) {
  if (model.durations) return model.durations
  if (model.provider !== 'fal') return []
  const d = (await falSchema(model.model)).properties.duration
  if (!d) return []
  return d.enum ? d.enum.map(num).filter((n) => !Number.isNaN(n)) : defaultDurations
}

// Maps the composer's settings onto whatever inputs this fal model declares.
function falInput(props, o) {
  const input = {}
  input[props.prompt || !props.text ? 'prompt' : 'text'] = o.prompt
  if (props.aspect_ratio) {
    const e = props.aspect_ratio.enum
    if (!e || e.includes(o.aspect)) input.aspect_ratio = o.aspect
  }
  if (props.image_size && !props.aspect_ratio) {
    const e = props.image_size.enum
    if (!e || e.includes(falSize[o.aspect])) input.image_size = falSize[o.aspect]
  }
  if (props.num_images) input.num_images = o.count
  if (props.duration && o.duration) {
    const d = props.duration
    const numeric = d.enum?.filter((v) => !Number.isNaN(num(v)))
    if (numeric?.length) {
      input.duration = numeric.reduce((best, v) => (Math.abs(num(v) - o.duration) < Math.abs(num(best) - o.duration) ? v : best))
    } else {
      input.duration = d.type === 'string' ? String(o.duration) : o.duration
    }
  }
  return input
}

async function post(url, payload) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export async function run(model, opts) {
  if (model.provider === 'comfy') {
    const [width, height] = model.kind === 'video' ? videoSize(opts.aspect) : aspectSize[opts.aspect]
    return runComfy(model.workflow, {
      prompt: opts.prompt, width, height, count: opts.count,
      frames: opts.duration * 24 + 1, seed: Math.floor(Math.random() * 2 ** 31),
    })
  }
  if (model.provider === 'fal') {
    const { properties } = await falSchema(model.model)
    return (await post('/api/fal', { model: model.model, input: falInput(properties, opts) })).files
  }
  if (model.provider === 'google') {
    return (await post('/api/google', { model: model.model, mode: model.mode, prompt: opts.prompt, aspect: opts.aspect, count: opts.count, duration: opts.duration })).files
  }
  if (model.provider === 'elevenlabs') {
    return (await post('/api/elevenlabs', { mode: model.mode, text: opts.prompt })).files
  }
  throw new Error(`${model.provider} is not wired up yet.`)
}

export async function getConnections() {
  const res = await fetch('/api/connections')
  return res.ok ? res.json() : {}
}

export async function saveConnection(id, values) {
  await post('/api/connections', { id, values })
}

export async function testConnection(id) {
  return (await post('/api/connections/test', { id })).ok
}
