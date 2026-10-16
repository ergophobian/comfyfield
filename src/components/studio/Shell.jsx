import { useEffect, useId, useRef, useState } from 'react'
import { IconChevron } from '../Icons.jsx'

// The note every unwired run button sits next to, worded as on format sheets.
export function NotWired({ runsOn }) {
  return <span className="muted sa-not-wired">Not wired yet. Runs on {runsOn || 'open weights'} once the engine is connected.</span>
}

// A run button that stays off until the engine is connected.
export function GoButton({ label = 'Generate', className = '' }) {
  return <button type="button" className={`btn-blue ${className}`} disabled title="Not wired yet">{label}</button>
}

// A builder group that folds open, with its option count and the current pick in the header.
export function Section({ title, count, summary, icon, open, onToggle, children }) {
  const id = useId()
  return (
    <section className={`sa-sec${open ? ' open' : ''}`}>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          {icon}
          <span>{title}{count != null && <em> · {count}</em>}</span>
          {summary && !open && <small>{summary}</small>}
          <IconChevron />
        </button>
      </h3>
      {open && <div id={id} className="sa-sec-body">{children}</div>}
    </section>
  )
}

// The fanned hero used by the character and moodboard landings: four cards, a title, a line and one action.
export function Hero({ cards, title, text, children }) {
  return (
    <header className="sa-hero">
      <div className="sa-fan" aria-hidden="true">
        {cards.slice(0, 4).map((c, i) => (
          <span key={i} className={`sa-fan-card${i === 2 ? ' round' : ''}`} style={{ '--n': i, background: c.cover }}>
            {c.img ? <img src={c.img} alt="" /> : c.art}
          </span>
        ))}
      </div>
      <h1 className="rise">{title}</h1>
      <p className="rise" style={{ '--d': 'calc(2 * var(--stagger))' }}>{text}</p>
      <div className="sa-hero-act rise" style={{ '--d': 'calc(4 * var(--stagger))' }}>{children}</div>
    </header>
  )
}

// A small "Use in" menu for saved items, built on the same classes as the one on generations.
export function UseMenu({ items, label = 'Use in' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  if (!items.length) return null
  return (
    <div ref={ref} className={`use-in sa-use${open ? ' open' : ''}`}>
      <button type="button" className="use-in-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{label}</button>
      {open && (
        <div className="menu glass pop" role="menu">
          {items.map((it) => (
            <button key={it.label} type="button" role="menuitem" onClick={() => { setOpen(false); it.onClick() }}>
              {it.label}{it.note && <small>{it.note}</small>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Read and write one value in localStorage, falling back to memory when storage is off.
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}
export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}
export function useStored(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback))
  useEffect(() => { save(key, value) }, [key, value])
  return [value, setValue]
}
