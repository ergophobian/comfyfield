import { generate as runComfy } from './comfy.js'
import { comfyVars, falInput, durationsFromProps } from '../../shared/mapping.js'

const schemas = new Map()
export async function falSchema(endpoint) {
  if (!schemas.has(endpoint)) {
    schemas.set(endpoint, fetch(`/api/fal/schema?id=${encodeURIComponent(endpoint)}`)
      .then((r) => (r.ok ? r.json() : { properties: {} })).catch(() => ({ properties: {} })))
  }
  return schemas.get(endpoint)
}

const num = (v) => parseFloat(String(v))

const singleImage = ['image_url', 'start_image_url', 'first_frame_url', 'input_image_url', 'image']
const manyImages = ['image_urls', 'input_image_urls', 'reference_image_urls']
const hasImageInput = (props) => [...singleImage, ...manyImages].some((k) => props[k])

export function acceptsImage(model, props) {
  if (model.provider === 'google') return true
  if (model.provider === 'fal') return hasImageInput(props || {})
  return false
}

// A text model plus an attached image runs on its image sibling: text-to-video becomes image-to-video, an image model becomes its edit endpoint.
export async function endpointFor(model, hasImage) {
  const own = model.model
  if (!hasImage || model.provider !== 'fal') return own
  if (hasImageInput((await falSchema(own)).properties)) return own
  const tries = own.endsWith('text-to-video') ? [own.replace(/text-to-video$/, 'image-to-video')]
    : own.endsWith('text-to-image') ? [own.replace(/text-to-image$/, 'image-to-image'), `${own}/edit`]
    : [`${own}/edit`]
  for (const id of tries) if (Object.keys((await falSchema(id)).properties).length) return id
  throw new Error(`${model.name} does not take an image. Pick an image-to-video or edit model.`)
}

export async function uploadImage(file) {
  const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': file.type || 'image/png' }, body: file })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`)
  const size = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve([img.naturalWidth, img.naturalHeight])
    img.onerror = () => resolve([1, 1])
    img.src = data.url
  })
  return { url: data.url, name: file.name, ratio: size.join(':') }
}

// Durations a model accepts, in seconds, read from its schema when it has an enum.
export async function durationsFor(model) {
  if (model.durations) return model.durations
  if (model.provider !== 'fal') return []
  return durationsFromProps((await falSchema(model.model)).properties)
}

async function post(url, payload) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export async function run(model, opts) {
  if (model.provider === 'comfy') {
    return runComfy(model.workflow, comfyVars(model.kind, opts))
  }
  if (model.provider === 'fal') {
    const endpoint = await endpointFor(model, Boolean(opts.images?.length))
    const { properties } = await falSchema(endpoint)
    return (await post('/api/fal', { model: endpoint, input: falInput(properties, opts) })).files
  }
  if (model.provider === 'google') {
    return (await post('/api/google', { model: model.model, mode: model.mode, prompt: opts.prompt, aspect: opts.aspect, count: opts.count, duration: opts.duration, images: opts.images || (opts.image ? [opts.image] : []) })).files
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
