import { useEffect, useRef, useState } from 'react'
import { run, writePrompt } from './providers.js'
import { modelPrices } from './cost.js'
import { createRouterBatch } from './routerBatch.js'
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
  const sessions = useRef(new Map())
  const [, changed] = useState(0)
  const active = useRef(0)
  const waiting = useRef([])
  const busy = items.some((i) => i.pending)

  const add = (files) => setItems((xs) => [...files.filter((file) => !xs.some((item) => item.id === file.id)), ...xs])
  useEffect(() => {
    fetch('/api/stitch/exports').then((res) => res.ok ? res.json() : []).then(add).catch(() => {})
  }, [])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items.filter((i) => !i.pending).slice(0, 300))) } catch {}
  }, [items])

  const pump = () => {
    while (active.current < MAX_PARALLEL && waiting.current.length) {
      const job = waiting.current.shift()
      active.current++
      job().finally(() => { active.current--; pump() })
    }
  }

  // meta can carry batch, row and prompt so the board can group results.
  async function execute(model, opts, meta = {}, id = crypto.randomUUID(), retryStep) {
    const base = { aspect: opts.shape || opts.aspect, caption: opts.caption, model: model.name, kind: model.kind, provider: model.provider, ...meta }
    setError(null)
    setRetryLast(null)
    setItems((xs) => [{ id, pending: true, ...base }, ...xs])
    return new Promise((resolve, reject) => {
      waiting.current.push(async () => {
        setItems((xs) => xs.map((x) => (x.id === id ? { ...x, started: true } : x)))
        try {
          if (model.provider === 'comfyRouter' && !opts.routerBatch) opts = { ...opts, routerBatch: createRouterBatch(model, opts) }
          const files = await run(model, opts, {
            onFiles: (files, index) => setItems((xs) => [...files.map((f, i) => ({ ...base, ...f, id: `${id}-${index}-${i}`, created: Date.now() })), ...xs]),
            onPod: () => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, pod: true } : x))),
          })
          setItems((xs) => model.provider === 'comfyRouter' ? xs.filter((x) => x.id !== id) : xs.flatMap((x) => (x.id === id
            ? files.map((f, i) => ({ id: `${id}-${i}`, ...base, ...f, created: Date.now() }))
            : [x])))
          resolve(files)
        } catch (e) {
          // Keep completed files and resume the original outstanding Router calls.
          let retried = false
          const retry = retryStep || (() => {
            if (retried) return
            retried = true
            setItems((xs) => xs.filter((x) => x.id !== id))
            execute(model, opts, meta, id).catch(() => {})
          })
          setError(e.message)
          setRetryLast(() => retry)
          setItems((xs) => xs.map((x) => (x.id === id ? { ...base, id, failed: e.message, retry } : x)))
          reject(e)
        }
      })
      pump()
    })
  }

  const generate = (model, opts, meta) => { execute(model, opts, meta).catch(() => {}) }
  const generateFormat = (format, values, options = {}) => {
    const previous = sessions.current.get(format.id)
    if (previous && (previous.pending || previous.session?.busy)) return previous.session?.inFlight?.then(() => previous.session) || previous.promise
    const record = { pending: true }
    sessions.current.set(format.id, record)
    record.promise = runFormat(format, values, {
      prices: modelPrices,
      ...options,
      run: (model, opts, meta) => {
        // A successful retry replaces the failed Library take for the same session step.
        setItems((xs) => xs.filter((x) => !(x.failed && x.formatRunId === meta.formatRunId && x.stepId === meta.stepId)))
        return execute(model, opts, meta, undefined, () => record.session.retry(meta.stepId))
      },
      writePrompt: ({ instructions, note, images, target }) => writePrompt({ instructions, note, images, target }),
      onSession: (session) => { record.session = session; options.onSession?.(session) },
      onChange: (state, session) => {
        changed((n) => n + 1)
        setError(session?.error?.message || null)
        options.onChange?.(state, session)
      },
    }).finally(() => { record.pending = false })
    return record.promise
  }

  const toggleApprove = (id) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, approved: !x.approved } : x)))
  const dismiss = (id) => {
    const item = items.find((item) => item.id === id)
    if (item?.model === 'Stitch') fetch('/api/stitch/export', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: item.url }) }).catch(() => {})
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  return { items, error, retry: retryLast, busy, generate, generateFormat, add, toggleApprove, dismiss, clear: () => setItems([]) }
}
