import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { brands, brandOf, Logo } from '../lib/brands.jsx'
import { providerInfo } from '../lib/catalog.js'

const Star = ({ on }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </svg>
)
const Chevron = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

// Model menu: brand rail on the left, search and list on the right, ⌘1–9 to pick, star to favorite.
export default function ModelPicker({ model, options, favorites, toggleFavorite, choose, connections }) {
  const [open, setOpen] = useState(false)
  const [rail, setRail] = useState('all')
  const [q, setQ] = useState('')
  const ref = useRef(null)
  const search = useRef(null)

  const withBrand = useMemo(() => options.map((m) => ({ ...m, brand: brandOf(m) })), [options])
  const railBrands = [...new Set(withBrand.map((m) => m.brand))]
  const list = withBrand.filter((m) =>
    (rail === 'all' || (rail === 'fav' ? favorites.includes(m.id) : m.brand === rail)) &&
    (!q || `${m.name} ${brands[m.brand]?.name}`.toLowerCase().includes(q.toLowerCase())))

  useEffect(() => {
    if (!open) return
    search.current?.focus()
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const keys = (e) => {
      if (e.key === 'Escape') setOpen(false)
      const n = Number(e.key)
      if ((e.metaKey || e.ctrlKey) && n >= 1 && n <= 9 && list[n - 1]) {
        e.preventDefault()
        choose(list[n - 1].id)
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', keys)
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', keys) }
  }, [open, list])

  const via = (m) => (m.provider === 'fal' ? 'via fal' : m.provider === 'comfy' ? 'on your ComfyUI' : 'your key')

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
            <div className="picker-list">
              {list.map((m, i) => {
                const off = m.provider !== 'comfy' && !connections[m.provider]?.connected
                return (
                  <div key={m.id} className={`picker-row${m.id === model.id ? ' on' : ''}`} style={{ '--i': i }}>
                    <button type="button" className="picker-pick" onClick={() => { choose(m.id); setOpen(false) }}>
                      <span className="picker-name">{m.name}</span>
                      <span className="picker-sub"><Logo brand={m.brand} size={12} />{brands[m.brand]?.name} · {via(m)}{off && <em> · add key</em>}</span>
                    </button>
                    {i < 9 && <kbd>{isMac ? '⌘' : 'Ctrl '}{i + 1}</kbd>}
                    <button type="button" className={`picker-star${favorites.includes(m.id) ? ' on' : ''}`} onClick={() => toggleFavorite(m.id)} aria-label="Favorite"><Star on={favorites.includes(m.id)} /></button>
                  </div>
                )
              })}
              {!list.length && <p className="picker-empty">{rail === 'fav' ? 'Star a model to keep it here.' : 'No models match.'}</p>}
            </div>
            <Link to="/models" className="picker-more" onClick={() => setOpen(false)}>Browse all {providerInfo.fal.name} models</Link>
          </div>
        </div>
      )}
    </div>
  )
}
