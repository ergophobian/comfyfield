import { ArtImage } from '../components/Art.jsx'
import { modelArt } from '../lib/formats/art.js'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { falCategories } from '../lib/catalog.js'
import { brands, brandOf, brandName, Logo } from '../lib/brands.jsx'
import { useApp } from '../lib/appContext.js'
import { priceText } from '../components/ModelPicker.jsx'
import Segmented from '../components/Segmented.jsx'

const FIRST = 8
const sources = [{ value: 'comfy', label: 'Comfy' }, { value: 'fal', label: 'fal' }]
const comfyKinds = [{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }, { value: 'audio', label: 'Audio' }]

// Two sources: Comfy Router on the Comfy key (first), and fal's catalog on a fal key.
export default function Models({ picker }) {
  const [source, setSource] = useState('comfy')
  const [q, setQ] = useState('')
  return (
    <main className="page narrow">
      <div className="page-head rise">
        <h1>Models</h1>
        <p>Hosted models through Comfy Router on your Comfy key, or hundreds more through fal. Find one, and it goes straight to your composer.</p>
      </div>
      <label className="big-search glass rise" style={{ '--d': '60ms' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Kling, Veo, Flux, Seedance…" />
      </label>
      <div className="models-bar rise" style={{ '--d': '120ms' }}>
        <Segmented value={source} onChange={setSource} options={sources} className="models-source" />
      </div>
      {source === 'comfy' ? <ComfyModels picker={picker} q={q} /> : <FalModels picker={picker} q={q} />}
    </main>
  )
}

const hit = (q, ...parts) => !q.trim() || parts.join(' ').toLowerCase().includes(q.trim().toLowerCase())

function ComfyModels({ picker, q }) {
  const go = useNavigate()
  const { connections = {} } = useApp() || {}
  const [kind, setKind] = useState('image')
  const connected = connections.comfyRouter?.connected
  const live = picker.routerCatalog
  const runnable = picker.router.models.filter((m) => m.kind === kind && hit(q, m.name, m.model, brandName(brandOf(m))))
  const unwired = picker.router.unwired.filter((m) => m.kind === kind && hit(q, m.name, m.id, brandName(m.brand)))
  const groups = [...new Set(runnable.map(brandOf))].map((b) => [b, runnable.filter((m) => brandOf(m) === b)])
  const use = (m) => { picker.pick(m); go(`/${m.kind}`) }

  return (
    <>
      <div className="rise" style={{ '--d': '160ms', margin: '0 0 10px' }}>
        <Segmented value={kind} onChange={setKind} options={comfyKinds} />
      </div>
      {!('comfyRouter' in connections) ? (
        <div className="model-list glass">{Array.from({ length: 4 }, (_, i) => <div key={i} className="model-row skeleton" />)}</div>
      ) : !connected ? (
        <div className="model-key glass rise">
          <Logo brand="comfy" size={28} />
          <span className="model-text">
            <strong>Add your Comfy key</strong>
            <span>One key lists every Comfy Router model, with prices.</span>
          </span>
          <Link to="/connections" className="btn-blue sm">Add key</Link>
        </div>
      ) : (
        <>
          {live?.error && <div className="notice glass error models-notice">{live.error} These are the Router models ComfyField runs.</div>}
          <div className="model-list glass" key={kind}>
            {groups.map(([b, ms]) => (
              <div key={b} className="model-group">
                <div className="model-head"><Logo brand={b} size={12} />{brandName(b)}</div>
                {ms.map((m, i) => (
                  <button key={m.id} type="button" className="model-row" style={{ '--i': Math.min(i, 12) }} onClick={() => use(m)}>
                    <span className="model-logo"><ArtImage src={modelArt(kind)} alt="" /><Logo brand={b} size={20} /></span>
                    <span className="model-text">
                      <strong>{m.name}</strong>
                      <span>{m.model}{m.price && ` · ${priceText(m.price)}`}</span>
                    </span>
                    <span className="model-use">Use</span>
                  </button>
                ))}
              </div>
            ))}
            {!runnable.length && !unwired.length && <p className="picker-empty">{q ? `No models match “${q}”.` : 'No Router models here yet.'}</p>}
          </div>
          {!live && <div className="model-list glass models-more">{Array.from({ length: 3 }, (_, i) => <div key={i} className="model-row skeleton" />)}</div>}
          {unwired.length > 0 && (
            <div className="model-list glass models-more">
              <div className="model-head">More on Comfy Router<em className="picker-todo">Not wired yet</em></div>
              {unwired.slice(0, q ? undefined : 40).map((m, i) => (
                <div key={m.id} className="model-row off" style={{ '--i': Math.min(i, 12) }}>
                  <span className="model-logo"><Logo brand={m.brand} size={20} /></span>
                  <span className="model-text">
                    <strong>{m.name}</strong>
                    <span>{brandName(m.brand)} · {m.id}{m.price && ` · ${priceText(m.price)}`}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}

// fal's catalog, kept quiet: search first, a short list of popular models, the rest on demand.
function FalModels({ picker, q }) {
  const go = useNavigate()
  const [category, setCategory] = useState(falCategories[0].id)
  const [items, setItems] = useState([])
  const [more, setMore] = useState(false)
  const [error, setError] = useState(null)

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

  const matches = useMemo(() => items
    .map((m) => ({ ...m, brand: brandOf({ id: m.endpoint_id, model: m.endpoint_id, provider: 'fal' }) }))
    .filter((m) => hit(q, m.endpoint_id, m.metadata.display_name, brands[m.brand]?.name)), [items, q])

  const shown = q || more ? matches : matches.slice(0, FIRST)

  const use = (m) => {
    const kind = falCategories.find((c) => c.id === category).kind
    picker.use({ id: `fal:${m.endpoint_id}`, kind, provider: 'fal', name: m.metadata.display_name.trim(), note: m.endpoint_id, model: m.endpoint_id })
    go('/')
  }

  return (
    <>
      <div className="rise" style={{ '--d': '160ms', margin: '0 0 10px' }}>
        <Segmented value={category} onChange={setCategory} options={falCategories.map((c) => ({ value: c.id, label: c.label }))} />
      </div>

      {error && <div className="notice glass error models-notice">{error}</div>}
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
    </>
  )
}
