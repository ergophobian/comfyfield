import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { falCategories } from '../lib/catalog.js'
import { IconSearch } from '../components/Icons.jsx'

// Browses fal's public model catalog and hands a pick to the composer.
export default function Models({ picker }) {
  const go = useNavigate()
  const [category, setCategory] = useState(falCategories[0].id)
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')

  async function load(cat, after) {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ category: cat, limit: '48' })
      if (after) params.set('cursor', after)
      const res = await fetch(`/api/fal/models?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItems((xs) => (after ? [...xs, ...data.models] : data.models))
      setCursor(data.has_more ? data.next_cursor : null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(category) }, [category])

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase()
    return items.filter((m) => m.metadata?.status !== 'deprecated' &&
      (!t || `${m.endpoint_id} ${m.metadata?.display_name}`.toLowerCase().includes(t)))
  }, [items, q])

  const use = (m) => {
    const kind = falCategories.find((c) => c.id === category).kind
    picker.use({ id: `fal:${m.endpoint_id}`, kind, provider: 'fal', name: m.metadata.display_name.trim(), note: m.endpoint_id, model: m.endpoint_id })
    go('/')
  }

  return (
    <main className="page">
      <div className="page-head">
        <h1>Models</h1>
        <p>Every text-to-media model on fal. Pick one and it lands in your composer.</p>
      </div>
      <div className="models-bar">
        <div className="seg">
          {falCategories.map((c) => (
            <button key={c.id} className={c.id === category ? 'on' : ''} onClick={() => setCategory(c.id)}>{c.label}</button>
          ))}
        </div>
        <label className="search glass"><IconSearch /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models" /></label>
      </div>
      {error && <div className="notice glass error" style={{ margin: '0 0 16px', width: 'auto' }}>{error}</div>}
      <div className="model-grid">
        {shown.map((m) => (
          <button key={m.endpoint_id} className="model-card glass" onClick={() => use(m)}>
            <div className="model-thumb" style={{ backgroundImage: m.metadata.thumbnail_url ? `url(${m.metadata.thumbnail_url})` : undefined }} />
            <div className="model-body">
              <strong>{m.metadata.display_name}</strong>
              <span>{m.metadata.description?.split('\n')[0]}</span>
              <code>{m.endpoint_id}</code>
            </div>
          </button>
        ))}
      </div>
      {cursor && !q && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="btn-soft" onClick={() => load(category, cursor)} disabled={loading}>{loading ? 'Loading' : 'Load more'}</button>
        </div>
      )}
    </main>
  )
}
