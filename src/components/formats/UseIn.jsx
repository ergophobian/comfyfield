import { useEffect, useRef, useState } from 'react'
import { useIn, prefill, formatById, isWired } from '../../lib/formats/index.js'

// Sends a finished generation into a format that takes it as an input.
export default function UseIn({ item, onUse, up }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    // Escape closes this menu first, not the viewer behind it.
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  const targets = (useIn[item.kind] || []).map(([id, input, label]) => [formatById(id), input, label]).filter(([f]) => f)
  if (!targets.length) return null

  return (
    <div ref={ref} className={`use-in${up ? ' up' : ''}${open ? ' open' : ''}`} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="use-in-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Use in</button>
      {open && (
        <div className="menu glass pop" role="menu">
          {targets.map(([f, input, label]) => (
            <button key={f.id} type="button" role="menuitem" onClick={() => { setOpen(false); onUse(f.id, prefill(input, item)) }}>
              {label}{!isWired(f) && <small>Not wired yet</small>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
