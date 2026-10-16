// Minimal client for the ComfyUI HTTP API, reached through the /comfy dev proxy.
import { fill } from '../../shared/mapping.js'

const BASE = '/comfy'

export async function loadWorkflow(name, vars) {
  const res = await fetch(`/workflows/${name}.json`)
  if (!res.ok) throw new Error(`Workflow ${name} not found`)
  return fill(await res.json(), vars)
}

export async function queue(graph) {
  const res = await fetch(`${BASE}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: graph, client_id: 'comfyfield' }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(res.status === 502 || res.status === 504
      ? 'Could not reach ComfyUI. Start it or set COMFY_URL in .env.'
      : `ComfyUI rejected the workflow (${res.status}). ${text.slice(0, 200)}`)
  }
  return (await res.json()).prompt_id
}

export async function waitFor(promptId, { signal, interval = 1500 } = {}) {
  for (;;) {
    if (signal?.aborted) throw new Error('Cancelled')
    const res = await fetch(`${BASE}/history/${promptId}`)
    if (res.ok) {
      const entry = (await res.json())[promptId]
      if (entry?.status?.status_str === 'error') throw new Error('Generation failed in ComfyUI')
      if (entry?.outputs && Object.keys(entry.outputs).length) return collect(entry.outputs)
    }
    await new Promise((r) => setTimeout(r, interval))
  }
}

function collect(outputs) {
  const files = []
  for (const out of Object.values(outputs)) {
    for (const f of [...(out.images || []), ...(out.gifs || []), ...(out.videos || [])]) {
      const q = new URLSearchParams({ filename: f.filename, subfolder: f.subfolder || '', type: f.type || 'output' })
      const isVideo = /\.(mp4|webm|mov)$/i.test(f.filename)
      files.push({ url: `${BASE}/view?${q}`, kind: isVideo ? 'video' : 'image', name: f.filename })
    }
  }
  return files
}

export async function generate(workflow, vars) {
  const res = await fetch('/api/comfy/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow, vars }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Comfy request failed (${res.status})`)
  return data.files
}
