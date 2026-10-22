import { ArtImage } from '../components/Art.jsx'
import { modelArt } from '../lib/formats/art.js'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { falCategories } from '../lib/catalog.js'
import { brands, brandOf, Logo } from '../lib/brands.jsx'
import Segmented from '../components/Segmented.jsx'

const FIRST = 8

// fal's catalog, kept quiet: search first, a short list of popular models, the rest on demand.
export default function Models({ picker }) {
  const go = useNavigate()
  const [category, setCategory] = useState(falCategories[0].id)
  const [items, setItems] = useState([])
  const [more, setMore] = useState(false)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    let live = true
    setItems([]); setMore(false); setError(null)
    // fal returns the catalog in popularity order; two pages covers nearly everything people use.
    const load = async () => {
      let cursor = null
      const all = []
      for (let page = 0; page < 3; page++) {
        const params = new URLSearchParams({ category, limit: '50' })
        if (cursor) params.set('cursor', cursor)
        const res = await fetch(`/api/fal/models?${params}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        all.push(...data.models)
        if (!data.has_more) break
        cursor = data.next_cursor
      }
      return all
    }
    load().then((all) => live && setItems(all.filter((m) => m.metadata?.status !== 'deprecated')))
      .catch((e) => live && setError(e.message))
    return () => { live = false }
  }, [category])

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase()
    return items
      .map((m) => ({ ...m, brand: brandOf({ id: m.endpoint_id, model: m.endpoint_id, provider: 'fal' }) }))
      .filter((m) => !t || `${m.endpoint_id} ${m.metadata.display_name} ${brands[m.brand]?.name}`.toLowerCase().includes(t))
  }, [items, q])

  const shown = q || more ? matches : matches.slice(0, FIRST)

  const use = (m) => {
    const kind = falCategories.find((c) => c.id === category).kind
    picker.use({ id: `fal:${m.endpoint_id}`, kind, provider: 'fal', name: m.metadata.display_name.trim(), note: m.endpoint_id, model: m.endpoint_id })
    go('/')
  }

  return (
    <main className="page narrow">
      <div className="page-head rise">
        <h1>Models</h1>
        <p>Hundreds of models through one fal key. Find one, and it goes straight to your composer.</p>
      </div>
      <label className="big-search glass rise" style={{ '--d': '60ms' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Kling, Veo, Flux, Seedance…" />
      </label>
      <div className="rise" style={{ '--d': '120ms', margin: '18px 0 10px' }}>
        <Segmented value={category} onChange={setCategory} options={falCategories.map((c) => ({ value: c.id, label: c.label }))} />
      </div>

      {error && <div className="notice glass error" style={{ width: 'auto', margin: '0 0 12px' }}>{error}</div>}
      <div className="model-list glass" key={category}>
        {!items.length && !error && Array.from({ length: 6 }, (_, i) => <div key={i} className="model-row skeleton" />)}
        {shown.map((m, i) => (
          <button key={m.endpoint_id} className="model-row" style={{ '--i': Math.min(i, 12) }} onClick={() => use(m)}>
            <span className="model-logo"><ArtImage src={modelArt(falCategories.find((c) => c.id === category)?.kind)} alt="" /><Logo brand={m.brand} size={20} /></span>
            <span className="model-text">
              <strong>{m.metadata.display_name.trim()}</strong>
              <span>{brands[m.brand]?.name || 'fal'}</span>
            </span>
            <span className="model-use">Use</span>
          </button>
        ))}
        {items.length > 0 && !shown.length && <p className="picker-empty">No models match “{q}”.</p>}
      </div>
      {!q && !more && matches.length > FIRST && (
        <button className="link-btn show-more" onClick={() => setMore(true)}>Show all {matches.length}</button>
      )}
    </main>
  )
}
