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
export async function waitJob(id) {
  for (let wait = 800; ; wait = Math.min(wait * 1.5, 3000)) {
    const res = await fetch(`/api/jobs/${id}`).catch(() => null)
    if (res?.status === 404) throw new Error('This run was lost when the app restarted. Run it again.')
    const job = res?.ok ? await res.json() : null
    if (job?.status === 'done') return job.files
    if (job?.status === 'cancelled') throw new Cancelled()
    if (job?.status === 'failed') throw Object.assign(new Error(job.error?.message || 'The run failed.'), job.error)
    await sleep(wait)
  }
}

export const cancelJob = (id) => fetch(`/api/jobs/${id}`, { method: 'DELETE' }).catch(() => {})

// hooks.onJob(id) hears each job id as it starts, so the caller can save it and wait on it after a reload.
export async function runJob(route, body, hooks = {}) {
  const id = await startJob(route, body)
  hooks.onJob?.(id)
  return waitJob(id)
}
