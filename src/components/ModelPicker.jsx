import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { brands, brandOf, Logo } from '../lib/brands.jsx'
import { models as catalog } from '../lib/catalog.js'
import { useModelMeta, money } from '../lib/cost.js'

const Star = ({ on }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </svg>
)
const Chevron = ({ right }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d={right ? 'm9 6 6 6-6 6' : 'm6 9 6 6 6-6'} />
  </svg>
)
const OpenMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 11V8a5 5 0 0 1 9.6-2" /><rect x="5" y="11" width="14" height="9" rx="2" />
  </svg>
)
const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

const unitLabel = (p) => {
  const u = p.unit.toLowerCase()
  if (u.includes('gpu-second')) return 'per gpu sec'
  if (u.includes('megapixel')) return 'per megapixel'
  if (u.includes('second')) return 'per sec'
  if (u.includes('image')) return 'per image'
  if (u.includes('video')) return 'per video'
  if (u.includes('token')) return u.includes('1m') ? 'per 1m tokens' : 'per 1k tokens'
  if (u.includes('character')) return 'per 1k chars'
  return `per ${p.unit}`
}
export const priceText = (p) => (p ? `${p.estimate ? '≈' : ''}$${p.amount < 0.01 ? p.amount.toFixed(4) : p.amount.toFixed(3).replace(/0$/, '')} ${unitLabel(p)}` : null)

const matches = (q, ...parts) => !q || parts.join(' ').toLowerCase().includes(q.toLowerCase())

// Model menu: brand rail, search, list grouped by company with prices, and a preview of the hovered model.
// `open` lists open-weight models (not wired yet) as the first group; they are choosable but never run.
// variant 'row' renders the trigger as a labelled panel row, `up` opens the menu above the trigger.
export default function ModelPicker({ model, options, open = [], favorites, toggleFavorite, choose, connections, variant, up }) {
  const [isOpen, setOpen] = useState(false)
  const [rail, setRail] = useState('all')
  const [q, setQ] = useState('')
  const [hover, setHover] = useState(null)
  const ref = useRef(null)
  const search = useRef(null)
  const metaOf = useModelMeta(options)

  const withBrand = useMemo(() => options.map((m) => ({ ...m, brand: brandOf(m) })), [options])
  const opens = useMemo(() => open.map((m) => ({ ...m, open: true, brand: m.brand || 'comfy' })), [open])
  const railBrands = [...new Set(withBrand.map((m) => m.brand))]
  const list = withBrand.filter((m) =>
    (rail === 'all' || (rail === 'fav' ? favorites.includes(m.id) : m.brand === rail)) && matches(q, m.name, brands[m.brand]?.name))
  const openList = opens.filter((m) =>
    (rail === 'all' || rail === 'open' || (rail === 'fav' && favorites.includes(m.id))) && matches(q, m.name, m.vendor))
  // Group by company so the list reads as providers, not one long column.
  const groups = railBrands.map((b) => [b, list.filter((m) => m.brand === b)]).filter(([, ms]) => ms.length)
  // Shortcuts stay on the catalog models, as before the open group was added.
  const ordered = groups.flatMap(([, ms]) => ms)
  const everything = [...opens, ...withBrand]
  const preview = everything.find((m) => m.id === (hover || model.id)) || everything[0]
  const shown = model.open ? { ...model, brand: model.brand || 'comfy' } : { ...model, brand: brandOf(model) }

  useEffect(() => {
    if (!isOpen) return
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
  }, [isOpen, ordered])

  const via = (m) => (m.provider === 'fal' ? 'via fal' : m.provider === 'comfyRouter' ? 'via Comfy Router' : m.provider === 'comfy' ? m.pod ? 'on a Pod' : 'via Comfy Cloud' : 'your key')
  const pm = preview && !preview.open ? metaOf(preview) : {}
  const pick = (id) => { choose(id); setOpen(false) }
  const nothing = !ordered.length && !openList.length
  // Without a Comfy key the Router models stay out of the list; one row says how to get them.
  const kind = model.kind || options[0]?.kind
  const askKey = 'comfyRouter' in connections && !connections.comfyRouter.connected && (rail === 'all' || rail === 'comfy')
    && options.length > 0 && catalog.some((m) => m.provider === 'comfyRouter' && m.kind === kind)

  return (
    <div className={`picker${variant === 'row' ? ' as-row' : ''}${up ? ' up' : ''}`} ref={ref}>
      {variant === 'row' ? (
        <button type="button" className="picker-btn picker-line" onClick={() => setOpen((o) => !o)} aria-expanded={isOpen}>
          <span className="picker-line-text">
            <small>Model</small>
            <strong><Logo brand={shown.brand} />{model.name}{model.open && <em className="picker-todo">Not wired yet</em>}</strong>
          </span>
          <Chevron right />
        </button>
      ) : (
        <button type="button" className="picker-btn" onClick={() => setOpen((o) => !o)} aria-expanded={isOpen}>
          <Logo brand={shown.brand} />{model.name}<Chevron />
        </button>
      )}
      {isOpen && (
        <div className="picker-pop glass">
          <div className="picker-rail">
            <button type="button" className={rail === 'all' ? 'on' : ''} onClick={() => setRail('all')} title="All models">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></svg>
            </button>
            <button type="button" className={rail === 'fav' ? 'on' : ''} onClick={() => setRail('fav')} title="Favorites"><Star on /></button>
            <span className="rail-line" />
            {opens.length > 0 && (
              <button type="button" className={rail === 'open' ? 'on' : ''} onClick={() => setRail('open')} title="Open weights"><OpenMark /></button>
            )}
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
              {askKey && (
                <div className="picker-group">
                  <div className="picker-head"><Logo brand="comfy" size={12} />Comfy Router</div>
                  <Link to="/connections" className="picker-row picker-key" onClick={() => setOpen(false)}>
                    <span className="picker-pick">
                      <span className="picker-name">Add your Comfy key</span>
                      <span className="picker-sub">Hosted models with prices, through one key</span>
                    </span>
                  </Link>
                </div>
              )}
              {openList.length > 0 && (
                <div className="picker-group">
                  <div className="picker-head"><OpenMark />Open weights<em className="picker-todo">Not wired yet</em></div>
                  {openList.map((m, i) => (
                    <div key={m.id} className={`picker-row${m.id === model.id ? ' on' : ''}`} style={{ '--i': Math.min(i, 12) }} onMouseEnter={() => setHover(m.id)}>
                      <button type="button" className="picker-pick" onClick={() => pick(m.id)}>
                        <span className="picker-name">{m.name}{m.badge && <em className="picker-badge">{m.badge}</em>}</span>
                        <span className="picker-sub">{m.vendor} · <em className="picker-todo-text">Not wired yet</em></span>
                      </button>
                      <button type="button" className={`picker-star${favorites.includes(m.id) ? ' on' : ''}`} onClick={() => toggleFavorite(m.id)} aria-label="Favorite"><Star on={favorites.includes(m.id)} /></button>
                    </div>
                  ))}
                </div>
              )}
              {groups.map(([b, ms]) => (
                <div key={b} className="picker-group">
                  {(groups.length > 1 || openList.length > 0) && <div className="picker-head"><Logo brand={b} size={12} />{brands[b]?.name}</div>}
                  {ms.map((m) => {
                    const i = ordered.indexOf(m)
                    const off = m.provider !== 'comfy' && !connections[m.provider]?.connected
                    const price = priceText(metaOf(m).price)
                    return (
                      <div key={m.id} className={`picker-row${m.id === model.id ? ' on' : ''}`} style={{ '--i': Math.min(i + openList.length, 12) }} onMouseEnter={() => setHover(m.id)}>
                        <button type="button" className="picker-pick" onClick={() => pick(m.id)}>
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
              {nothing && <p className="picker-empty">{rail === 'fav' ? 'Star a model to keep it here.' : 'No models match.'}</p>}
            </div>
            <Link to="/models" className="link-btn menu-foot" onClick={() => setOpen(false)}>Browse all models</Link>
          </div>
          {preview && (
            <aside className="picker-preview" key={preview.id}>
              <div className="pv-thumb" style={pm.thumb ? { backgroundImage: `url(${pm.thumb})` } : undefined}>
                {!pm.thumb && <Logo brand={preview.brand} size={34} />}
              </div>
              <strong>{preview.name}</strong>
              <span className="pv-brand"><Logo brand={preview.brand} size={12} />{preview.open ? preview.vendor : brands[preview.brand]?.name}</span>
              <p>{(pm.description || preview.note || preview.blurb || '').split('\n')[0].slice(0, 140)}</p>
              {preview.open ? <span className="pv-todo">Not wired yet. Runs on Comfy Cloud or a Pod once its workflow is ready.</span>
                : pm.price && <span className="pv-price">{priceText(pm.price)}</span>}
            </aside>
          )}
        </div>
      )}
    </div>
  )
}

export { money }
