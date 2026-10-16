import { useState } from 'react'
import { generate } from './comfy.js'

// Tracks a list of generations, newest first. Each run renders as a pending card until ComfyUI returns.
export function useGenerations() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const busy = items.some((i) => i.pending)

  async function run({ workflow, vars, aspect, caption, kind }) {
    const id = crypto.randomUUID()
    setError(null)
    setItems((xs) => [{ id, pending: true, aspect, caption, kind }, ...xs])
    try {
      const files = await generate(workflow, { seed: Math.floor(Math.random() * 2 ** 31), ...vars })
      setItems((xs) => xs.flatMap((x) => x.id === id
        ? files.map((f, i) => ({ id: `${id}-${i}`, aspect, caption, ...f }))
        : [x]))
    } catch (e) {
      setError(e.message)
      setItems((xs) => xs.filter((x) => x.id !== id))
    }
  }

  return { items, error, busy, run }
}
