import { ArtImage } from '../Art.jsx'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconCheck } from '../Icons.jsx'
import { isWired } from '../../lib/formats/index.js'
import { badgeText } from './data.js'
import { pinnedFirst } from '../../../shared/workspaces.js'
import { usePinned } from '../../lib/workspaces.js'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// A format card that opens the format's own page. With onPick it becomes a toggle instead, for picking presets to mix.
export function AppCard({ format, to, i = 0, picked = false, disabled = false, onPick, rise = true, pinned = false }) {
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
    className: `recipe-card${rise ? ' rise' : ''}${picked ? ' on' : ''}`,
    style: { '--d': `calc(${Math.min(i, 12)} * var(--stagger))` },
    onPointerEnter: () => preview(true), onPointerLeave: () => preview(false),
    onFocus: () => preview(true), onBlur: () => preview(false),
  }
  const body = (
    <>
      <span className="recipe-cover" style={{ background: format.cover }}>
        <ArtImage id={format.id} alt={`${format.name} example`} />
        {format.preview && <video ref={ref} className={live ? 'on' : ''} src={format.preview} muted loop playsInline preload="none" />}
        {badge && <i className="app-badge">{badge}</i>}
        {pinned && <i className="app-pin">Pinned</i>}
        {onPick && <i className="app-check" aria-hidden="true"><IconCheck /></i>}
      </span>
      <strong>{format.name}</strong>
      <small>{format.blurb}</small>
      <span className="recipe-tags">
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

// Grids and strips put the active workspace's pinned formats first.
export function AppGrid({ list, to = (f) => `/apps/${f.id}` }) {
  const pins = usePinned()
  return (
    <div className="recipe-grid app-grid">
      {pinnedFirst(list, pins).map((f, i) => <AppCard key={f.id} format={f} i={i} to={to(f)} pinned={pins.includes(f.id)} />)}
    </div>
  )
}

// One scrolling row of cards, for the New and Trending strips.
export function AppStrip({ list, to = (f) => `/apps/${f.id}` }) {
  const pins = usePinned()
  return (
    <div className="app-strip">
      {pinnedFirst(list, pins).map((f, i) => <AppCard key={f.id} format={f} i={i} to={to(f)} pinned={pins.includes(f.id)} />)}
    </div>
  )
}
