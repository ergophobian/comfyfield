import { useEffect, useState } from 'react'
import { run } from './providers.js'

const KEY = 'comfyfield.library'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

// Generations, newest first. Finished items persist in this browser for the Library page.
export function useGenerations() {
  const [items, setItems] = useState(load)
  const [error, setError] = useState(null)
  const busy = items.some((i) => i.pending)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items.filter((i) => !i.pending).slice(0, 200))) } catch {}
  }, [items])

  async function generate(model, opts) {
    const id = crypto.randomUUID()
    const meta = { aspect: opts.aspect, caption: opts.caption, model: model.name, kind: model.kind }
    setError(null)
    setItems((xs) => [{ id, pending: true, ...meta }, ...xs])
    try {
      const files = await run(model, opts)
      setItems((xs) => xs.flatMap((x) => (x.id === id
        ? files.map((f, i) => ({ id: `${id}-${i}`, ...meta, ...f, created: Date.now() }))
        : [x])))
    } catch (e) {
      setError(e.message)
      setItems((xs) => xs.filter((x) => x.id !== id))
    }
  }

  return { items, error, busy, generate, clear: () => setItems([]) }
}
