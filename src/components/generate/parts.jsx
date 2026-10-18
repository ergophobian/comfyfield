import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Results from '../Results.jsx'
import Board from '../Board.jsx'
import { IconClose } from '../Icons.jsx'
import { providerInfo } from '../../lib/catalog.js'
import { money } from '../../lib/cost.js'

export const noun = { image: ['image', 'images'], video: ['video', 'videos'], audio: ['clip', 'clips'] }

export function balanceText(b, provider) {
  const x = b[provider]
  if (!x) return null
  if (x.usd != null) return `${money(x.usd)} left on ${providerInfo[provider].name}`
  if (x.left != null) return `${x.left.toLocaleString()} ${x.unit} left`
  return x.note
}

export const costText = (cost) => (cost ? `${cost.approx ? '≈' : ''}${money(cost.usd)}` : null)

export const canRun = (model, connections) => !model.open && (model.provider === 'comfy' || Boolean(connections[model.provider]?.connected))

// Batch boards live for the browser session, so leaving a page and coming back keeps them.
const boards = { image: [], video: [], audio: [] }
export function useBatches(kind) {
  const [list, setList] = useState(() => boards[kind])
  const add = (b) => setList((bs) => (boards[kind] = [b, ...bs]))
  return [list, add]
}

const SHOWN = 48

// The results feed: this session's batch boards, then every single generation of this kind, newest first.
export function Feed({ kind, gens, batches, size, empty }) {
  const singles = gens.items.filter((i) => i.kind === kind && !i.batch && !i.failed)
  if (!batches.length && !singles.length) return empty || null
  return (
    <div className="gen-feed">
      {batches.map((b) => <Board key={b.id} batch={b} items={gens.items} onApprove={gens.toggleApprove} onDismiss={gens.dismiss} />)}
      {singles.length > 0 && <Results items={singles.slice(0, SHOWN)} size={size} />}
      {singles.length > SHOWN && <Link className="link-btn gen-more" to="/assets">See all {singles.length} in Library</Link>}
    </div>
  )
}

// Why Generate is off, or what the run needs, in one line.
export function StatusNote({ model, connected, wiredNote }) {
  if (model.open) return <p className="gen-status todo">{wiredNote || `${model.name} is not wired yet. It runs on Comfy Cloud or a Pod once its workflow is ready.`}</p>
  if (wiredNote) return <p className="gen-status todo">{wiredNote}</p>
  if (!connected) {
    return <p className="gen-status">{model.name} runs on {providerInfo[model.provider].name}. <Link to="/connections">Add your key</Link> to use it.</p>
  }
  return null
}

// Generate with the estimated cost printed on the button, like Higgsfield's credits.
export function GoButton({ total, cost, disabled, className = '' }) {
  return (
    <button className={`btn-blue gen-go ${className}`} disabled={disabled}>
      {total > 1 ? `Generate ${total}` : 'Generate'}
      {cost && <span className="gen-cost">{cost}</span>}
    </button>
  )
}

// Underlined tabs at the top of a settings panel. A tab with `to` is a link to another page.
export function PanelTabs({ tabs, value, onChange, label }) {
  return (
    <nav className="gen-tabs" aria-label={label}>
      {tabs.map((t) => (t.to ? (
        <Link key={t.value} to={t.to} className="gen-tab">{t.label}</Link>
      ) : (
        <button key={t.value} type="button" className={`gen-tab${t.value === value ? ' on' : ''}`} aria-current={t.value === value ? 'page' : undefined}
          onClick={() => onChange(t.value)}>{t.label}</button>
      )))}
    </nav>
  )
}

const BANNER = 'comfyfield.banner.influencer'

// The promo strip above the feed. Dismissed once per browser.
export function Banner() {
  const [shown, setShown] = useState(() => {
    try { return localStorage.getItem(BANNER) !== 'off' } catch { return true }
  })
  if (!shown) return null
  const hide = () => {
    setShown(false)
    try { localStorage.setItem(BANNER, 'off') } catch {}
  }
  return (
    <aside className="gen-banner glass rise">
      <div>
        <strong>Give your brand a face</strong>
        <span>Design an AI influencer once, then post them anywhere.</span>
      </div>
      <Link to="/influencer" className="btn-blue sm">Start an influencer</Link>
      <button type="button" className="icon-btn" aria-label="Hide this" onClick={hide}><IconClose /></button>
    </aside>
  )
}

// Numbered how-it-works cards. A step with onClick acts as a shortcut into the panel.
export function Steps({ steps }) {
  return (
    <ol className="gen-steps">
      {steps.map((s, i) => {
        const body = (
          <>
            <span className="gen-step-art" style={{ background: s.cover }}>{s.art}</span>
            <strong>{s.title}</strong>
            <small>{s.text}</small>
          </>
        )
        return (
          <li key={s.title} className="rise" style={{ '--d': `calc(${Math.min(i, 12)} * var(--stagger))` }}>
            {s.onClick ? <button type="button" className="gen-step" onClick={s.onClick}>{body}</button> : <div className="gen-step">{body}</div>}
          </li>
        )
      })}
    </ol>
  )
}

// Sticks the settings panel while it fits on screen; a taller panel scrolls with the page so nothing is cut off.
export function useSticky() {
  const ref = useRef(null)
  const [fits, setFits] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setFits(el.offsetHeight + 28 <= window.innerHeight)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    window.addEventListener('resize', check)
    return () => { ro.disconnect(); window.removeEventListener('resize', check) }
  }, [])
  return [ref, fits]
}

const VIEW = 'comfyfield.view'

// Grid or larger tiles for the feed, remembered per browser.
export function useView() {
  const [view, setView] = useState(() => {
    try { return localStorage.getItem(VIEW) === 'large' ? 'large' : 'grid' } catch { return 'grid' }
  })
  useEffect(() => { try { localStorage.setItem(VIEW, view) } catch {} }, [view])
  return [view, setView]
}
