import { useEffect, useState } from 'react'
import { estimate } from '../../shared/mapping.js'

// fal thumbnails and prices, fetched once per endpoint and shared across components.
const cache = new Map()
const listeners = new Set()

async function load(ids) {
  const missing = ids.filter((id) => !cache.has(id))
  if (!missing.length) return
  missing.forEach((id) => cache.set(id, {}))
  const q = missing.map((id) => `id=${encodeURIComponent(id)}`).join('&')
  const data = await fetch(`/api/fal/meta?${q}`).then((r) => r.json()).catch(() => ({}))
  for (const [id, v] of Object.entries(data)) cache.set(id, v)
  listeners.forEach((fn) => fn())
}

export async function modelPrices(models) {
  await load(models.filter((m) => m.provider === 'fal').map((m) => m.model))
  return Object.fromEntries(models.filter((m) => m.provider === 'fal').map((m) => [m.model, cache.get(m.model) || {}]))
}

export function useModelMeta(models) {
  const [, tick] = useState(0)
  const ids = models.filter((m) => m.provider === 'fal').map((m) => m.model)
  useEffect(() => {
    const fn = () => tick((n) => n + 1)
    listeners.add(fn)
    load(ids)
    return () => listeners.delete(fn)
  }, [ids.join(',')])
  return (m) => (m.provider === 'fal' ? cache.get(m.model) || {} : { price: m.price })
}

export { estimate }

export const money = (n) => (n < 0.01 ? '<$0.01' : n < 10 ? `$${n.toFixed(2)}` : `$${Math.round(n)}`)

export function useBalance() {
  const [b, setB] = useState({})
  useEffect(() => { fetch('/api/balance').then((r) => r.json()).then(setB).catch(() => {}) }, [])
  return b
}
