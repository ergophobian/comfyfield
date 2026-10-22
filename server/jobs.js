import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

// Provider runs live here, not in the browser request that started them, so a reload can wait on them again.
// Finished jobs are kept on disk for a day; a job still running when the app stops is marked lost on the next start.
const DAY = 24 * 3600_000

export function createJobs(file) {
  const jobs = new Map()
  const live = new Map()
  try {
    for (const j of JSON.parse(fs.readFileSync(file, 'utf8'))) {
      if (Date.now() - j.created > DAY) continue
      jobs.set(j.id, j.status === 'running' ? { ...j, status: 'failed', error: { code: 'interrupted', message: 'The app stopped while this ran. The first run may already have been charged. Retrying starts a new request and may charge again; check the provider history first.' } } : j)
    }
  } catch {}

  const save = () => {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, JSON.stringify([...jobs.values()].filter((j) => Date.now() - j.created < DAY)))
    } catch {}
  }

  // task(ctx) returns the files. ctx.onCancel(fn) lets a provider stop its own queue when the person cancels.
  function start(task) {
    const id = crypto.randomUUID()
    const controller = new AbortController()
    const ctx = { signal: controller.signal, abort: () => controller.abort(), cancelled: false, stops: [], onCancel(fn) { this.stops.push(fn) } }
    jobs.set(id, { id, status: 'running', created: Date.now() })
    live.set(id, ctx)
    save()
    Promise.resolve().then(() => task(ctx)).then(
      (files) => { if (!ctx.cancelled) jobs.set(id, { ...jobs.get(id), status: 'done', files }) },
      (e) => { if (!ctx.cancelled) jobs.set(id, { ...jobs.get(id), status: 'failed', error: { message: e.message, status: e.status, code: e.code, requestId: e.requestId, idempotencyKey: e.idempotencyKey, retryable: e.retryable, reason: e.reason, fit: e.fit } }) },
    ).finally(() => { live.delete(id); save() })
    return id
  }

  const get = (id) => jobs.get(id) || null

  function cancel(id) {
    const job = jobs.get(id)
    if (!job) return null
    const ctx = live.get(id)
    if (ctx && !ctx.cancelled) {
      ctx.cancelled = true
      ctx.abort()
      for (const stop of ctx.stops) Promise.resolve().then(stop).catch(() => {})
      jobs.set(id, { ...job, status: 'cancelled' })
      save()
    }
    return jobs.get(id)
  }

  return { start, get, cancel }
}
