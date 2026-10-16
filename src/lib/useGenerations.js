import { useEffect, useRef, useState } from 'react'
import { run } from './providers.js'
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
  const active = useRef(0)
  const waiting = useRef([])
  const busy = items.some((i) => i.pending)

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
  function execute(model, opts, meta = {}) {
    const id = crypto.randomUUID()
    const base = { aspect: opts.shape || opts.aspect, caption: opts.caption, model: model.name, kind: model.kind, ...meta }
    setError(null)
    setItems((xs) => [{ id, pending: true, ...base }, ...xs])
    return new Promise((resolve, reject) => {
      waiting.current.push(async () => {
        setItems((xs) => xs.map((x) => (x.id === id ? { ...x, started: true } : x)))
        try {
          const files = await run(model, opts)
          setItems((xs) => xs.flatMap((x) => (x.id === id
            ? files.map((f, i) => ({ id: `${id}-${i}`, ...base, ...f, created: Date.now() }))
            : [x])))
          resolve(files)
        } catch (e) {
          setError(e.message)
          setItems((xs) => xs.map((x) => (x.id === id ? { ...base, id, failed: e.message } : x)))
          reject(e)
        }
      })
      pump()
    })
  }

  const generate = (model, opts, meta) => { execute(model, opts, meta).catch(() => {}) }
  const generateFormat = (format, values) => runFormat(format, values, { run: execute })

  const toggleApprove = (id) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, approved: !x.approved } : x)))
  const dismiss = (id) => setItems((xs) => xs.filter((x) => x.id !== id))

  return { items, error, busy, generate, generateFormat, toggleApprove, dismiss, clear: () => setItems([]) }
}
