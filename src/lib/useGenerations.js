import { useEffect, useRef, useState } from 'react'
import { run, writePrompt } from './providers.js'
import { modelPrices } from './cost.js'
import { runFormat } from './formats/runner.js'

const KEY = 'comfyfield.library'
const MAX_PARALLEL = 3

function load() {
  try { return (JSON.parse(localStorage.getItem(KEY)) || []).filter((i) => !i.pending) } catch { return [] }
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
  const busy = items.some((i) => i.pending) || [...sessions.current.values()].some((session) => session.busy)

  const add = (files) => setItems((xs) => [...files.filter((file) => !xs.some((item) => item.id === file.id)), ...xs])
  useEffect(() => {
    fetch('/api/stitch/exports').then((res) => res.ok ? res.json() : []).then(add).catch(() => {})
  }, [])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items.filter((i) => !i.pending).slice(0, 300))) } catch {}
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

  // meta can carry batch, row and prompt so the board can group results. `after` gets the files of a
  // run that worked, so a follow-up such as Upscale also follows a retried take.
  function execute(model, opts, meta = {}, after, id = crypto.randomUUID(), retryStep) {
    const base = { aspect: opts.shape || opts.aspect, caption: opts.caption, model: model.name, kind: model.kind, provider: model.provider, ...meta }
    const owner = meta.formatRunId || id
    clearError(meta.formatRunId ? owner : errorOwner.current)
    setItems((xs) => [{ id, pending: true, ...base }, ...xs.filter((x) => x.id !== id)])
    return new Promise((resolve, reject) => {
      waiting.current.push(async () => {
        setItems((xs) => xs.map((x) => (x.id === id ? { ...x, started: true } : x)))
        try {
          const files = await run(model, opts, {
            onFiles: (files, index) => setItems((xs) => [...files.map((f, i) => ({ ...base, ...f, id: `${id}-${index}-${i}`, created: Date.now() })), ...xs]),
            onPod: () => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, pod: true } : x))),
          })
          setItems((xs) => model.provider === 'comfyRouter' ? xs.filter((x) => x.id !== id) : xs.flatMap((x) => (x.id === id
            ? files.map((f, i) => ({ id: `${id}-${i}`, ...base, ...f, created: Date.now() }))
            : [x])))
          resolve(files)
          after?.(files)
        } catch (e) {
          // Retry queues the same run again in place of the failed take, keeping completed files and
          // resuming the original outstanding Router calls.
          let retried = false
          const retry = retryStep || (() => {
            if (retried) return
            retried = true
            setItems((xs) => xs.filter((x) => x.id !== id))
            execute(model, opts, meta, after, id).catch(() => {})
          })
          showError(owner, e.message, retry)
          setItems((xs) => xs.map((x) => (x.id === id ? { ...base, id, failed: e.message, retry } : x)))
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

  const toggleApprove = (id) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, approved: !x.approved } : x)))
  const dismiss = (id) => {
    const item = items.find((item) => item.id === id)
    if (item?.model === 'Stitch') fetch('/api/stitch/export', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: item.url }) }).catch(() => {})
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  return { items, error, retry: retryLast, busy, generate, generateFormat, add, toggleApprove, dismiss, clear: () => setItems([]) }
}
