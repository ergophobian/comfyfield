import { useEffect, useState } from 'react'

// The live Comfy Router catalog from /api/comfy/models (cached ten minutes on the server).
// Fetched once per page load and shared. A failed fetch is not kept, so the next mount retries.
let catalog = null
let pending = null

function load() {
  if (catalog) return Promise.resolve(catalog)
  pending ||= fetch('/api/comfy/models')
    .then(async (r) => {
      const data = await r.json().catch(() => ({}))
      if (!r.ok) return { error: data.error || 'The Comfy Router catalog did not load.' }
      if (data.connected === false) return { connected: false }
      if (!Array.isArray(data.models)) return { error: 'The Comfy Router catalog did not load.' }
      catalog = { connected: true, models: data.models }
      return catalog
    })
    .catch(() => ({ error: 'The Comfy Router catalog did not load.' }))
    .finally(() => { pending = null })
  return pending
}

// { connected, models, error } once loaded, null while loading or without a Comfy key.
export function useRouterCatalog(connected) {
  const [data, setData] = useState(catalog)
  useEffect(() => {
    if (!connected) return
    let live = true
    load().then((d) => live && setData(d))
    return () => { live = false }
  }, [connected])
  return connected ? data : null
}
