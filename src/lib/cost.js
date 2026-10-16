import { useEffect, useState } from 'react'
import { aspectSize } from './catalog.js'

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

// Price per run in USD, or null when the unit can't be estimated from the composer settings.
export function estimate(model, meta, o) {
  const price = meta?.price
  if (!price) return null
  const unit = price.unit.toLowerCase()
  const [w, h] = aspectSize[o.aspect] || [1024, 1024]
  const takes = o.takes || 1
  let usd = null
  let approx = Boolean(price.estimate)
  if (unit.includes('megapixel')) usd = price.amount * (w * h) / 1e6 * (o.count || 1)
  else if (unit.includes('image')) usd = price.amount * (o.count || 1)
  else if (unit.includes('second')) usd = price.amount * (o.duration || 5)
  else if (unit.includes('video') || unit.includes('request') || unit.includes('generation')) usd = price.amount
  else if (unit.includes('token') && model.kind === 'video') {
    // Video token models bill roughly width × height × fps × seconds / 1024 at 720p.
    const [vw, vh] = w >= h ? [1280, 720] : [720, 1280]
    usd = price.amount * (vw * vh * 24 * (o.duration || 5)) / 1024 / 1000
    approx = true
  } else if (unit.includes('character')) {
    usd = price.amount * (o.chars || 0) / (unit.includes('1000') ? 1000 : 1)
    approx = true
  }
  return usd == null ? null : { usd: usd * takes, approx }
}

export const money = (n) => (n < 0.01 ? '<$0.01' : n < 10 ? `$${n.toFixed(2)}` : `$${Math.round(n)}`)

export function useBalance() {
  const [b, setB] = useState({})
  useEffect(() => { fetch('/api/balance').then((r) => r.json()).then(setB).catch(() => {}) }, [])
  return b
}
