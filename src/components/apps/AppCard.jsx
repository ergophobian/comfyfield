import { ArtImage } from '../Art.jsx'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconCheck } from '../Icons.jsx'
import { isWired } from '../../lib/formats/index.js'
import { badgeText } from './data.js'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// A format card that opens the format's own page. With onPick it becomes a toggle instead, for picking presets to mix.
export function AppCard({ format, to, i = 0, picked = false, disabled = false, onPick, rise = true }) {
  const ref = useRef(null)
  const [live, setLive] = useState(false)
  const preview = (on) => {
    const v = ref.current
    if (!v || (on && calm())) return
    setLive(on)
    if (on) v.play().catch(() => {})
    else { v.pause(); v.currentTime = 0 }
  }
  const badge = badgeText(format)
  const props = {
    className: `format-card${rise ? ' rise' : ''}${picked ? ' on' : ''}`,
    style: { '--d': `calc(${Math.min(i, 12)} * var(--stagger))` },
    onPointerEnter: () => preview(true), onPointerLeave: () => preview(false),
    onFocus: () => preview(true), onBlur: () => preview(false),
  }
  const body = (
    <>
      <span className="format-cover" style={{ background: format.cover }}>
        <ArtImage id={format.id} alt={`${format.name} example`} />
        {format.preview && <video ref={ref} className={live ? 'on' : ''} src={format.preview} muted loop playsInline preload="none" />}
        {badge && <i className="app-badge">{badge}</i>}
        {onPick && <i className="app-check" aria-hidden="true"><IconCheck /></i>}
      </span>
      <strong>{format.name}</strong>
      <small>{format.blurb}</small>
      <span className="format-tags">
        {format.runsOn && <em title={format.runsOn}>{format.runsOn}</em>}
        {!isWired(format) && <em className="todo">Not wired yet</em>}
      </span>
    </>
  )
  if (onPick) {
    return (
      <button type="button" {...props} aria-pressed={picked} disabled={disabled} onClick={() => onPick(format)}
        title={disabled ? 'This one cannot be mixed yet' : undefined}>
        {body}
      </button>
    )
  }
  return <Link {...props} to={to}>{body}</Link>
}

export function AppGrid({ list, to = (f) => `/apps/${f.id}` }) {
  return (
    <div className="format-grid app-grid">
      {list.map((f, i) => <AppCard key={f.id} format={f} i={i} to={to(f)} />)}
    </div>
  )
}

// One scrolling row of cards, for the New and Trending strips.
export function AppStrip({ list, to = (f) => `/apps/${f.id}` }) {
  return (
    <div className="app-strip">
      {list.map((f, i) => <AppCard key={f.id} format={f} i={i} to={to(f)} />)}
    </div>
  )
}
