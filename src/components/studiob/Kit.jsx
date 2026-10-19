import { PageArt, ArtImage } from '../Art.jsx'
import { useEffect, useId, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { covers } from '../../lib/formats/parts.js'
import { IconPlus } from '../Icons.jsx'

// Shared pieces for the studio pages: marketing, ads, faceless, explainer, shorts, 3D, lipsync,
// image and video edits, upscale, reframe and the assistant.

const sv = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const IconMinus = () => <svg {...sv}><path d="M5 12h14" /></svg>
export const IconSend = () => <svg {...sv}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
export const IconRefresh = () => <svg {...sv} strokeWidth={2}><path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4" /></svg>
export const IconEye = () => <svg {...sv} strokeWidth={2}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /></svg>

const coverList = Object.values(covers)
export const coverAt = (i) => coverList[i % coverList.length]
export const stagger = (i) => ({ '--d': `calc(${Math.min(i, 12)} * var(--stagger))` })
// A frame of `ratio` centered in a box of aspect `box`, as large as it fits, in percent of the box.
export function fitBox(ratio, box = 1.6, room = 88) {
  const [w, h] = ratio.split(':').map(Number)
  const a = w / h
  return a >= box ? { width: `${room}%`, height: `${(room * box) / a}%` } : { height: `${room}%`, width: `${(room * a) / box}%` }
}
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// A tab or tool kept in the URL so links and back work.
export function useParam(name, ids, fallback = ids[0]) {
  const [params, setParams] = useSearchParams()
  const raw = params.get(name)
  const value = ids.includes(raw) ? raw : fallback
  const set = (v) => {
    const next = new URLSearchParams(params)
    if (v === fallback) next.delete(name)
    else next.set(name, v)
    setParams(next, { replace: true })
  }
  return [value, set]
}

// level 2 when the page already has its h1, as in the Split layout.
export function Hero({ badge, title, sub, level = 1, children }) {
  const H = level === 2 ? 'h2' : 'h1'
  return (
    <header className="sb-hero rise">
      <PageArt />
      {badge && <span className="sb-badge">{badge}</span>}
      <H>{title}</H>
      {sub && <p>{sub}</p>}
      {children}
    </header>
  )
}

// Nothing on these pages generates yet, so every Generate, Run and Approve stays off and says why.
export function NotWired({ label = 'Generate', runsOn, summary, inline }) {
  return (
    <div className={`sb-go${inline ? ' inline' : ''}`}>
      {summary && <span className="sb-sum">{summary}</span>}
      <button type="button" className="btn-blue" disabled>{label}</button>
      <span className="muted">Not wired yet. Runs on {runsOn || 'open weights'} once the engine is connected.</span>
    </div>
  )
}

// Settings on the left, the workspace on the right, the way Higgsfield lays out its studio tools.
export function Split({ name, panel, foot, children }) {
  return (
    <div className="sb-split">
      <aside className="sb-panel glass" aria-label={`${name} settings`}>
        <h1 className="sb-name">{name}</h1>
        <div className="sb-panel-body">{panel}</div>
        {foot && <div className="sb-foot">{foot}</div>}
      </aside>
      <section className="sb-main" aria-label={name}>{children}</section>
    </div>
  )
}

export function Box({ label, optional, aside, children, className = '' }) {
  const id = useId()
  return (
    <div className={`sb-box ${className}`} role="group" aria-labelledby={label ? id : undefined}>
      {(label || aside) && (
        <div className="sb-box-head">
          {label && <span id={id}>{label}{optional && <span className="field-opt">Optional</span>}</span>}
          {aside}
        </div>
      )}
      {children}
    </div>
  )
}

// options: [{ id, label, note?, disabled? }]. multi keeps an array of ids.
export function Pills({ options, value, onChange, multi, label }) {
  return (
    <div className="pills" role="group" aria-label={label}>
      {options.map((o) => {
        const on = multi ? value.includes(o.id) : value === o.id
        const pick = () => onChange(multi ? (on ? value.filter((x) => x !== o.id) : [...value, o.id]) : o.id)
        return (
          <button key={o.id} type="button" aria-pressed={on} className={on ? 'on' : ''} disabled={o.disabled} onClick={pick} title={o.note}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Cards({ options, value, onChange, label, multi }) {
  return (
    <div className="opt-grid" role="group" aria-label={label}>
      {options.map((o) => {
        const on = multi ? value.includes(o.id) : value === o.id
        const pick = () => onChange(multi ? (on ? value.filter((x) => x !== o.id) : [...value, o.id]) : o.id)
        return (
          <button key={o.id} type="button" aria-pressed={on} className={`opt${on ? ' on' : ''}`} disabled={o.disabled} onClick={pick}>
            <strong>{o.label}</strong>
            {o.note && <small>{o.note}</small>}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({ on, onChange, children }) {
  return (
    <button type="button" className={`switch${on ? ' on' : ''}`} aria-pressed={on} onClick={() => onChange(!on)}>
      <i />{children}
    </button>
  )
}

export function Stepper({ value, onChange, min = 1, max = 4, label, noun = 'items' }) {
  return (
    <div className="sb-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${noun}`}><IconMinus /></button>
      <output aria-live="polite">{value}<span>/{max}</span></output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${noun}`}><IconPlus /></button>
    </div>
  )
}

// Each ratio is drawn as its own little frame, scaled so the long side is 30px.
export function Ratios({ options, value, onChange, label }) {
  return (
    <div className="sb-ratios" role="group" aria-label={label}>
      {options.map((r) => {
        const [w, h] = r.id.split(':').map(Number)
        const k = 30 / Math.max(w, h)
        const on = value === r.id
        return (
          <button key={r.id} type="button" aria-pressed={on} className={`sb-ratio${on ? ' on' : ''}`} onClick={() => onChange(r.id)}>
            <span><i style={{ width: w * k, height: h * k }} /></span>
            <strong>{r.id}</strong>
            {r.note && <small>{r.note}</small>}
          </button>
        )
      })}
    </div>
  )
}

// A grid of named looks. lead is an extra first tile, such as "make your own".
export function Tiles({ items, value, onChange, label, tall, lead }) {
  return (
    <div className={`sb-tiles${tall ? ' tall' : ''}`} role="group" aria-label={label}>
      {lead}
      {items.map((t, i) => {
        const on = value === t.id
        return (
          <button key={t.id} type="button" aria-pressed={on} className={`sb-tile rise${on ? ' on' : ''}`}
            style={{ ...stagger(i), background: t.image ? undefined : t.cover || coverAt(i) }} onClick={() => onChange(t.id)}>
            {t.image ? <img src={t.image} alt="" /> : <ArtImage id={t.id} alt={`${t.label} example`} />}
            <span>{t.label}{t.note && <small>{t.note}</small>}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Steps({ items }) {
  return (
    <ol className="sb-steps">
      {items.map((s, i) => (
        <li key={s.title} className="sb-step glass rise" style={stagger(i + 2)}>
          <span className="sb-step-cover" style={{ background: s.cover || coverAt(i + 2) }}><b>{i + 1}</b></span>
          <strong>{s.title}</strong>
          <small>{s.text}</small>
        </li>
      ))}
    </ol>
  )
}

// A square slot next to a prompt, like Higgsfield's Avatar and Product tiles. children gets close().
export function Slot({ label, value, image, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const out = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', out)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', key) }
  }, [open])
  return (
    <div className="sb-slot" ref={ref}>
      <button type="button" className={`sb-slot-btn${value ? ' on' : ''}`} aria-expanded={open} aria-label={value ? `${label}: ${value}` : `Add ${label.toLowerCase()}`}
        onClick={() => setOpen((o) => !o)}>
        <span className="sb-slot-img">{image ? <img src={image} alt="" /> : <IconPlus />}</span>
        <small>{value || label}</small>
      </button>
      {open && <div className="sb-pop glass pop" role="dialog" aria-label={label}>{children(() => setOpen(false))}</div>}
    </div>
  )
}

export function Empty({ title, children }) {
  return (
    <div className="sb-empty">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}

export function ErrorNote({ error }) {
  return error ? <p className="sheet-error" role="alert">{error}</p> : null
}
