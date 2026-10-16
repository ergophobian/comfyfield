import { useEffect, useRef, useState } from 'react'
import { IconMinus } from './icons.jsx'
import { IconPlus } from '../Icons.jsx'

// A chip that opens a menu. `up` opens it above (the pinned prompt bar), `right` aligns it to the right edge,
// `keep` leaves it open after a pick so several items can be toggled.
export default function Pop({ icon, label, lit, up, right, keep, disabled, title, className = '', children }) {
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
  return (
    <div className={`chip gen-pop${up ? ' up' : ''}${right ? ' right' : ''} ${className}`} ref={ref}>
      <button type="button" className={lit ? 'lit' : ''} aria-haspopup="menu" aria-expanded={open} aria-label={label ? undefined : title}
        disabled={disabled} title={title} onClick={() => setOpen((o) => !o)}>
        {icon}{label}
      </button>
      {open && (
        <div className="menu glass pop" role="menu" onClick={(e) => !keep && e.target.closest('button') && setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  )
}

// Minus, value out of max, plus. Higgsfield's batch counter.
export function Stepper({ value, min = 1, max = 4, onChange, label }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`Fewer, ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}><IconMinus /></button>
      <span aria-live="polite">{value}/{max}</span>
      <button type="button" aria-label={`More, ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}><IconPlus /></button>
    </div>
  )
}
