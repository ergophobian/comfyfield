import { generate as runComfy } from './comfy.js'
import { runJob } from './jobs.js'
import { askPod, autoPod, refreshPod, runTypeOf } from './usePod.js'
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
  if (model.provider === 'comfy') return Boolean(model.imageWorkflow) || model.workflow === 'ltx_i2v'
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

// hooks.onPod: the run is waiting for a Pod, after the start sheet. hooks.onJob: a server job started for this run.
export async function run(model, opts, hooks = {}) {
  const post = (route, payload) => runJob(route, payload, hooks)
  if (model.provider === 'comfyRouter') {
    const files = []
    for (let i = 0; i < (model.kind === 'image' ? opts.count || 1 : 1); i++) {
      files.push(...(await post('/api/comfy/router', { model: model.model, input: comfyRouterInput(model.model, opts) })))
    }
    return files
  }
  if (model.provider === 'comfy') {
    // Comfy Cloud takes the run at once. When it cannot, the server says needs_pod. On Instant the run
    // fails there: Instant never starts a Pod, the person switches to Session (docs/adr/0001). Otherwise,
    // with auto-start on, the app starts a Pod sized for this workflow; with it off, the start sheet
    // asks once. Then the same run goes again and waits for the Pod.
    // A Pod too small for the run (pod_too_small) is never replaced by itself, with auto-start on or off:
    // terminating ends a billed Pod and its other runs, so the sheet asks first (docs/adr/0002).
    const vars = comfyVars(model.kind, opts, model.sizes)
    // A model with a start-image workflow uses it when an image is attached.
    const workflow = vars.image && model.imageWorkflow ? model.imageWorkflow : model.workflow
    try {
      return await runComfy(workflow, vars, hooks)
    } catch (e) {
      if (e.code !== 'needs_pod' && e.code !== 'pod_too_small') throw e
      const s = await refreshPod()
      if (runTypeOf(s) === 'instant') throw e
      if (e.code === 'pod_too_small') {
        await askPod(workflow, e.reason, e.fit || {})
        hooks.onPod?.()
        return runComfy(workflow, vars, hooks)
      }
      hooks.onPod?.()
      if (s?.auto && s?.connected) await autoPod(workflow)
      else await askPod(workflow, e.reason)
      return runComfy(workflow, vars, hooks)
    }
  }
  if (model.provider === 'fal') {
    const endpoint = await endpointFor(model, Boolean(opts.images?.length))
    const { properties } = await falSchema(endpoint)
    return post('/api/fal', { model: endpoint, input: falInput(properties, opts) })
  }
  if (model.provider === 'google') {
    return post('/api/google', { model: model.model, mode: model.mode, prompt: opts.prompt, aspect: opts.aspect, count: opts.count, duration: opts.duration, images: opts.images || (opts.image ? [opts.image] : []) })
  }
  if (model.provider === 'elevenlabs') {
    return post('/api/elevenlabs', { mode: model.mode, text: opts.prompt })
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
