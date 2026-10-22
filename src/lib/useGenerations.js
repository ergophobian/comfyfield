import { useEffect, useRef, useState } from 'react'
import { run, writePrompt } from './providers.js'
import { modelPrices } from './cost.js'
import { runFormat } from './formats/runner.js'
import { preflightFlow } from './formats/preflight.js'
import { waitJob, cancelJob, Cancelled } from './jobs.js'
import { createRouterBatch } from './routerBatch.js'

const KEY = 'comfyfield.library'
const MAX_PARALLEL = 3
const restorable = (item) => !item.pending || item.jobs?.length || item.run?.opts.routerBatch
const formatReloadNote = 'Format session ended on reload. Remaining steps will not continue.'

function load() {
  try {
    return (JSON.parse(localStorage.getItem(KEY)) || []).filter(restorable)
      .map((item) => item.formatRunId && (item.pending || item.failed) ? { ...item, restoreNote: formatReloadNote } : item)
  } catch { return [] }
}

// Generations, newest first. Jobs queue up and run three at a time; finished items persist for the Library.
export function useGenerations() {
  const [items, setItems] = useState(load)
  const [error, setError] = useState(null)
  const [retryLast, setRetryLast] = useState(null)
  const errorOwner = useRef(null)
  const sessions = useRef(new Map())
  const [, changed] = useState(0)
  const active = useRef(0)
  const waiting = useRef([])
  const cancelled = useRef(new Set())
  const restored = useRef(false)
  const live = useRef(items)
  live.current = items
  const busy = items.some((i) => i.pending) || [...sessions.current.values()].some((session) => session.busy)

  const add = (files) => setItems((xs) => [...files.filter((file) => !xs.some((item) => item.id === file.id)), ...xs])
  const patch = (id, fn) => setItems((xs) => xs.map((x) => (x.id === id ? fn(x) : x)))
  useEffect(() => {
    fetch('/api/stitch/exports').then((res) => res.ok ? res.json() : []).then(add).catch(() => {})
  }, [])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items.filter(restorable).slice(0, 300))) } catch {}
  }, [items])

  const clearError = (owner) => {
    if (errorOwner.current !== owner) return
    errorOwner.current = null
    setError(null)
    setRetryLast(null)
  }
  const showError = (owner, message, retry) => {
    errorOwner.current = owner
    setError(message)
    setRetryLast(() => retry)
  }

  const pump = () => {
    while (active.current < MAX_PARALLEL && waiting.current.length) {
      const job = waiting.current.shift()
      active.current++
      job().finally(() => { active.current--; pump() })
    }
  }

  const finish = (id, base, files) => setItems((xs) => xs.flatMap((x) => (x.id === id
    ? files.map((f, i) => ({ id: `${id}-${i}`, ...base, ...f, created: Date.now() }))
    : [x])))

  const partial = (id, base, files, index) => setItems((xs) => {
    if (cancelled.current.has(id)) return xs
    const results = files.map((f, i) => ({ ...base, ...f, id: `${id}-${index}-${i}`, created: Date.now() }))
    return [...results, ...xs.filter((x) => !results.some((f) => f.id === x.id))]
  })

  const fail = (id, base, message, retryStep, after, { silent = false } = {}) => {
    let retried = false
    const retry = retryStep || (base.run && (async () => {
      if (retried) return
      retried = true
      const { model, opts, meta } = base.run
      try {
        // The session was in memory; after reload, check only the saved failed step before spending.
        if (meta.formatRunId) {
          const plan = await preflightFlow({ nodes: [{ id: meta.stepId, type: 'model', data: { model: { ...model, formatStep: { options: opts } } } }], edges: [] })
          if (!plan.ok) throw new Error(plan.reason.message)
        }
        execute(model, opts, meta, after, id).catch(() => {})
      } catch (error) {
        retried = false
        showError(meta.formatRunId || id, error.message, retry)
      }
    }))
    if (retry) retry.label = base.retryMayCharge ? 'Retry (may charge again)' : 'Retry'
    if (!silent) showError(base.run?.meta.formatRunId || id, message, retry)
    patch(id, () => ({ ...base, id, failed: message, retry }))
  }

  // A Router batch resumes its saved call before submitting any outstanding calls. Other providers
  // have a single job to wait on. Failed items reconstruct their Retry without an in-memory session.
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    for (const it of live.current) {
      const { id, pending, jobs, started, pod, retry, failed, ...base } = it
      if (failed && base.run) fail(id, base, failed, undefined, undefined, { silent: true })
      if (!pending) continue
      if (base.run?.model.provider === 'comfyRouter' && base.run.opts.routerBatch) {
        execute(base.run.model, base.run.opts, base.run.meta, undefined, id).catch(() => {})
      } else {
        if (!jobs?.length) continue
        // A Pod fallback supersedes the failed Cloud job in this same run.
        const currentJobs = base.run?.model.provider === 'comfyRouter' ? jobs : jobs.slice(-1)
        Promise.all(currentJobs.map(waitJob)).then(
          (files) => { if (!cancelled.current.has(id)) finish(id, base, files.flat()) },
          (e) => {
            if (e instanceof Cancelled || cancelled.current.has(id)) setItems((xs) => xs.filter((x) => x.id !== id))
            else fail(id, { ...base, retryMayCharge: e.code === 'interrupted' }, e.message)
          },
        )
      }
    }
  }, [])

  // `after` also follows a retried take. Stable ids and the session retry adapter retain completed
  // format steps; the saved run retains outstanding Router calls and their request keys on reload.
  function execute(model, opts, meta = {}, after, id = crypto.randomUUID(), retryStep) {
    cancelled.current.delete(id)
    // A Router input the model cannot take fails this item, not the caller's loop.
    let setupError
    if (model.provider === 'comfyRouter') {
      try { opts.routerBatch ||= createRouterBatch(model, opts) } catch (e) { setupError = e }
    }
    const previous = live.current.find((item) => item.id === id)
    const from = previous?.from || window.location.pathname + window.location.search
    const base = { aspect: opts.shape || opts.aspect, caption: opts.caption, model: model.name, kind: model.kind, provider: model.provider, from, restoreNote: previous?.restoreNote, ...meta, run: { model, opts, meta } }
    const owner = meta.formatRunId || id
    clearError(meta.formatRunId ? owner : errorOwner.current)
    setItems((xs) => [{ id, pending: true, ...base, jobs: opts.routerBatch?.calls.map((call) => call.jobId).filter(Boolean) || [] }, ...xs.filter((x) => x.id !== id)])
    return new Promise((resolve, reject) => {
      waiting.current.push(async () => {
        if (cancelled.current.has(id)) return reject(new Cancelled())
        patch(id, (x) => ({ ...x, started: true }))
        try {
          if (setupError) throw setupError
          const files = await run(model, opts, {
            isCancelled: () => cancelled.current.has(id),
            onFiles: (files, index) => partial(id, base, files, index),
            onPod: () => patch(id, (x) => ({ ...x, pod: true })),
            onJob: (job) => {
              patch(id, (x) => ({ ...x, jobs: [...(x.jobs || []), job] }))
              if (cancelled.current.has(id)) cancelJob(job)
            },
          })
          if (cancelled.current.has(id)) throw new Cancelled()
          if (model.provider === 'comfyRouter') {
            opts.routerBatch.calls.forEach((call, index) => partial(id, base, call.files, index))
            setItems((xs) => xs.filter((x) => x.id !== id))
          } else finish(id, base, files)
          resolve(files)
          after?.(files)
        } catch (e) {
          if (e instanceof Cancelled || cancelled.current.has(id)) {
            setItems((xs) => xs.filter((x) => x.id !== id))
            return reject(new Cancelled())
          }
          fail(id, { ...base, retryMayCharge: e.code === 'interrupted' }, e.message, retryStep, after)
          reject(e)
        }
      })
      pump()
    })
  }

  const generate = (model, opts, meta, after) => { execute(model, opts, meta, after).catch(() => {}) }
  const generateFormat = (format, values, options = {}) => {
    let session
    return runFormat(format, values, {
      prices: modelPrices,
      ...options,
      run: (model, opts, meta) => execute(model, opts, meta, undefined, meta.itemId, () => session.retry(meta.stepId).catch(() => {})),
      writePrompt: ({ instructions, note, images, target, idempotencyKey }) => writePrompt({ instructions, note, images, target, idempotencyKey }),
      onSession: (current) => {
        session = current
        sessions.current.set(session.id, session)
        options.onSession?.(session)
      },
      onChange: (state, session) => {
        if (session?.busy) sessions.current.set(session.id, session)
        else if (session) sessions.current.delete(session.id)
        changed((n) => n + 1)
        if (session?.error && (!errorOwner.current || errorOwner.current === session.id)) {
          showError(session.id, session.error.message, () => session.retryFailed().catch(() => {}))
        } else if (session && !session.error) clearError(session.id)
        options.onChange?.(state, session)
      },
    })
  }

  // Providers may finish already accepted work, but cancelled jobs publish no files or later calls.
  const cancel = (id) => {
    cancelled.current.add(id)
    for (const job of live.current.find((x) => x.id === id)?.jobs || []) cancelJob(job)
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  const toggleApprove = (id) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, approved: !x.approved } : x)))
  const dismiss = (id) => {
    const item = items.find((item) => item.id === id)
    if (item?.model === 'Stitch') fetch('/api/stitch/export', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: item.url }) }).catch(() => {})
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  return { items, error, retry: retryLast, busy, generate, generateFormat, add, cancel, toggleApprove, dismiss, clear: () => setItems([]) }
}
