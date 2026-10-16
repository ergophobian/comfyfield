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
