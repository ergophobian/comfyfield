// Generation runs as server jobs: the server keeps the run going if this page reloads, and the page waits on it again.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export class Cancelled extends Error {
  constructor() { super('Cancelled.'); this.cancelled = true }
}

export async function startJob(route, body) {
  const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ route, body }) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status, code: data.code, requestId: data.requestId, idempotencyKey: data.idempotencyKey, retryable: data.retryable })
  return data.id
}

// Resolves with the job's files. A failed job throws with the server's code, reason and fit, as a direct call would.
// hooks.onProgress hears each new progress snapshot of a running Comfy job.
export async function waitJob(id, hooks = {}) {
  let last = null
  for (let wait = 800; ; wait = Math.min(wait * 1.5, 3000)) {
    const res = await fetch(`/api/jobs/${id}`).catch(() => null)
    if (res?.status === 404) throw Object.assign(new Error('This run was lost when the app restarted. The first run may already have been charged. Retrying starts a new request and may charge again; check the provider history first.'), { code: 'interrupted' })
    const job = res?.ok ? await res.json() : null
    if (job?.status === 'done') return job.files
    if (job?.status === 'cancelled') throw new Cancelled()
    if (job?.status === 'failed') throw Object.assign(new Error(job.error?.message || 'The run failed.'), job.error)
    const progress = job?.progress ? JSON.stringify(job.progress) : null
    if (progress && progress !== last) {
      last = progress
      hooks?.onProgress?.(job.progress)
      // Live progress reads better at a steady pace than at the slow end of the backoff.
      wait = 800
    }
    await sleep(wait)
  }
}

// A tile's line for a Comfy job's progress, or null when there is none to show.
export function progressText(p) {
  if (!p) return null
  const where = (p.where || 'Comfy Cloud').replace(/^The /, 'the ')
  if (p.status === 'queued' || p.status === 'pending') return p.queuePosition ? `Queued on ${where}, ${p.queuePosition} ahead` : `Queued on ${where}`
  if (p.value == null) return `Rendering on ${where}`
  const detail = p.steps ? `step ${p.step ?? 0} of ${p.steps}` : p.nodesTotal ? `node ${p.nodesDone ?? 0} of ${p.nodesTotal}` : ''
  return `Rendering ${Math.round(p.value * 100)}%${detail ? `, ${detail}` : ''}`
}

export const cancelJob = (id) => fetch(`/api/jobs/${id}`, { method: 'DELETE' }).catch(() => {})

// hooks.onJob(id) hears each job id as it starts, so the caller can save it and wait on it after a reload.
export async function runJob(route, body, hooks = {}) {
  if (hooks.isCancelled?.()) throw new Cancelled()
  const id = await startJob(route, body)
  hooks.onJob?.(id)
  return waitJob(id, hooks)
}
