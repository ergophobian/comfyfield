import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { brands, brandOf, Logo } from '../lib/brands.jsx'
import { useModelMeta, money } from '../lib/cost.js'

const Star = ({ on }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </svg>
)
const Chevron = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

const unitLabel = (p) => {
  const u = p.unit.toLowerCase()
  if (u.includes('megapixel')) return 'per MP'
  if (u.includes('second')) return 'per sec'
  if (u.includes('image')) return 'per image'
  if (u.includes('video')) return 'per video'
  if (u.includes('token')) return 'per 1K tokens'
  if (u.includes('character')) return 'per 1K chars'
  return `per ${p.unit}`
}
export const priceText = (p) => (p ? `${p.estimate ? '≈' : ''}$${p.amount < 0.01 ? p.amount.toFixed(4) : p.amount.toFixed(3).replace(/0$/, '')} ${unitLabel(p)}` : null)

// Model menu: brand rail, search, list grouped by company with prices, and a preview of the hovered model.
export default function ModelPicker({ model, options, favorites, toggleFavorite, choose, connections }) {
  const [open, setOpen] = useState(false)
  const [rail, setRail] = useState('all')
  const [q, setQ] = useState('')
  const [hover, setHover] = useState(null)
  const ref = useRef(null)
  const search = useRef(null)
  const metaOf = useModelMeta(options)

  const withBrand = useMemo(() => options.map((m) => ({ ...m, brand: brandOf(m) })), [options])
  const railBrands = [...new Set(withBrand.map((m) => m.brand))]
  const list = withBrand.filter((m) =>
    (rail === 'all' || (rail === 'fav' ? favorites.includes(m.id) : m.brand === rail)) &&
    (!q || `${m.name} ${brands[m.brand]?.name}`.toLowerCase().includes(q.toLowerCase())))
  // Group by company so the list reads as providers, not one long column.
  const groups = railBrands.map((b) => [b, list.filter((m) => m.brand === b)]).filter(([, ms]) => ms.length)
  const ordered = groups.flatMap(([, ms]) => ms)
  const preview = withBrand.find((m) => m.id === (hover || model.id)) || withBrand[0]

  useEffect(() => {
    if (!open) return
    search.current?.focus()
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const keys = (e) => {
      if (e.key === 'Escape') setOpen(false)
      const n = Number(e.key)
      if ((e.metaKey || e.ctrlKey) && n >= 1 && n <= 9 && ordered[n - 1]) {
        e.preventDefault()
        choose(ordered[n - 1].id)
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', keys)
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', keys) }
  }, [open, ordered])

  const via = (m) => (m.provider === 'fal' ? 'via fal' : m.provider === 'comfy' ? 'your ComfyUI' : 'your key')
  const pm = metaOf(preview)

  return (
    <div className="picker" ref={ref}>
      <button type="button" className="picker-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Logo brand={brandOf(model)} />{model.name}<Chevron />
      </button>
      {open && (
        <div className="picker-pop glass">
          <div className="picker-rail">
            <button type="button" className={rail === 'all' ? 'on' : ''} onClick={() => setRail('all')} title="All models">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></svg>
            </button>
            <button type="button" className={rail === 'fav' ? 'on' : ''} onClick={() => setRail('fav')} title="Favorites"><Star on /></button>
            <span className="rail-line" />
            {railBrands.map((b) => (
              <button key={b} type="button" className={rail === b ? 'on' : ''} onClick={() => setRail(b)} title={brands[b]?.name}>
                <Logo brand={b} size={18} />
              </button>
            ))}
          </div>
          <div className="picker-main">
            <label className="picker-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
              <input ref={search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models" />
            </label>
            <div className="picker-list" onMouseLeave={() => setHover(null)}>
              {groups.map(([b, ms]) => (
                <div key={b} className="picker-group">
                  {groups.length > 1 && <div className="picker-head"><Logo brand={b} size={12} />{brands[b]?.name}</div>}
                  {ms.map((m) => {
                    const i = ordered.indexOf(m)
                    const off = m.provider !== 'comfy' && !connections[m.provider]?.connected
                    const price = priceText(metaOf(m).price)
                    return (
                      <div key={m.id} className={`picker-row${m.id === model.id ? ' on' : ''}`} style={{ '--i': i }} onMouseEnter={() => setHover(m.id)}>
                        <button type="button" className="picker-pick" onClick={() => { choose(m.id); setOpen(false) }}>
                          <span className="picker-name">{m.name}</span>
                          <span className="picker-sub">{via(m)}{price && ` · ${price}`}{off && <em> · add key</em>}</span>
                        </button>
                        {i < 9 && <kbd>{isMac ? '⌘' : 'Ctrl '}{i + 1}</kbd>}
                        <button type="button" className={`picker-star${favorites.includes(m.id) ? ' on' : ''}`} onClick={() => toggleFavorite(m.id)} aria-label="Favorite"><Star on={favorites.includes(m.id)} /></button>
                      </div>
                    )
                  })}
                </div>
              ))}
              {!ordered.length && <p className="picker-empty">{rail === 'fav' ? 'Star a model to keep it here.' : 'No models match.'}</p>}
            </div>
            <Link to="/models" className="picker-more" onClick={() => setOpen(false)}>Browse all models</Link>
          </div>
          {preview && (
            <aside className="picker-preview" key={preview.id}>
              <div className="pv-thumb" style={pm.thumb ? { backgroundImage: `url(${pm.thumb})` } : undefined}>
                {!pm.thumb && <Logo brand={preview.brand} size={34} />}
              </div>
              <strong>{preview.name}</strong>
              <span className="pv-brand"><Logo brand={preview.brand} size={12} />{brands[preview.brand]?.name}</span>
              <p>{(pm.description || preview.note || '').split('\n')[0].slice(0, 140)}</p>
              {pm.price && <span className="pv-price">{priceText(pm.price)}</span>}
            </aside>
          )}
        </div>
      )}
    </div>
  )
}

export { money }
