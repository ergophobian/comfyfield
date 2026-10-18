import { generate as runComfy } from './comfy.js'
import { askPod, autoPod, refreshPod } from './usePod.js'
import { comfyVars, comfyRouterInput, falInput, durationsFromProps, hasImageInput, falEndpointFor } from '../../shared/mapping.js'

const schemas = new Map()
export async function falSchema(endpoint) {
  if (!schemas.has(endpoint)) {
    schemas.set(endpoint, fetch(`/api/fal/schema?id=${encodeURIComponent(endpoint)}`)
      .then((r) => (r.ok ? r.json() : { properties: {} })).catch(() => ({ properties: {} })))
  }
  return schemas.get(endpoint)
}

const num = (v) => parseFloat(String(v))

export function acceptsImage(model, props) {
  if (model.provider === 'comfy') return Boolean(model.imageWorkflow) || ['ltx_i2v', 'h3_i2v'].includes(model.workflow)
  if (model.provider === 'comfyRouter') return model.kind === 'video'
  if (model.provider === 'google') return true
  if (model.provider === 'fal') return hasImageInput(props || {})
  return false
}

// A text model plus an attached image runs on its image sibling: text-to-video becomes image-to-video, an image model becomes its edit endpoint.
export function endpointFor(model, hasImage) {
  return falEndpointFor(model, hasImage, falSchema)
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

// hooks.onPod: the run is waiting for a Pod, after the start sheet.
export async function run(model, opts, hooks = {}) {
  if (model.provider === 'comfyRouter') {
    const files = []
    for (let i = 0; i < (model.kind === 'image' ? opts.count || 1 : 1); i++) {
      files.push(...(await post('/api/comfy/router', { model: model.model, input: comfyRouterInput(model.model, opts) })).files)
    }
    return files
  }
  if (model.provider === 'comfy') {
    // Comfy Cloud takes the run at once. When it cannot, the server says needs_pod. With auto-start on,
    // the app starts a Pod sized for this workflow; with it off, the start sheet asks once. Then the
    // same run goes again and waits for the Pod.
    const vars = comfyVars(model.kind, opts, model.sizes)
    // A model with a start-image workflow uses it when an image is attached.
    const workflow = vars.image && model.imageWorkflow ? model.imageWorkflow : model.workflow
    try {
      return await runComfy(workflow, vars)
    } catch (e) {
      if (e.code !== 'needs_pod') throw e
      hooks.onPod?.()
      const s = await refreshPod()
      if (s?.auto && s?.connected) await autoPod(workflow)
      else await askPod(workflow, e.reason)
      return runComfy(workflow, vars)
    }
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

export async function writePrompt(input) {
  return (await post('/api/prompt', input)).text
}

export async function saveConnection(id, values) {
  await post('/api/connections', { id, values })
}

export async function testConnection(id) {
  return (await post('/api/connections/test', { id })).ok
}
