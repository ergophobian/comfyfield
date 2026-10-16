import { useEffect, useId, useLayoutEffect, useRef } from 'react'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// A rolling picker: scroll, drag, click or use the arrow keys, and the row in the middle is the pick.
export default function Wheel({ label, options, value, onChange, art }) {
  const id = useId()
  const list = useRef(null)
  const timer = useRef(0)
  const at = Math.max(0, options.findIndex((o) => o.id === value))
  const current = useRef(at)
  current.current = at

  const center = (k, smooth) => {
    const el = list.current
    const row = el?.children[k]
    if (!row) return
    el.scrollTo({ top: row.offsetTop - (el.clientHeight - row.offsetHeight) / 2, behavior: smooth && !calm() ? 'smooth' : 'auto' })
  }
  useLayoutEffect(() => { center(at, false) }, [])
  useEffect(() => { center(at, true) }, [at])
  useEffect(() => () => clearTimeout(timer.current), [])

  // Wait for the scroll to settle, then pick whichever row sits closest to the middle.
  const settle = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const el = list.current
      if (!el) return
      const mid = el.scrollTop + el.clientHeight / 2
      let best = 0
      let gap = Infinity
      ;[...el.children].forEach((row, k) => {
        const d = Math.abs(row.offsetTop + row.offsetHeight / 2 - mid)
        if (d < gap) { gap = d; best = k }
      })
      if (best !== current.current) onChange(options[best].id)
    }, 140)
  }

  const key = (e) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = Math.min(options.length - 1, Math.max(0, at + step))
    if (next !== at) onChange(options[next].id)
  }

  const picked = options[at]
  return (
    <div className="sa-wheel">
      <span className="sa-wheel-label" id={`${id}-label`}>{label}</span>
      {art && <span className="sa-wheel-art">{art(picked)}</span>}
      <div className="sa-wheel-win">
        <div ref={list} className="sa-wheel-list" role="listbox" tabIndex={0} aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-${at}`} onScroll={settle} onKeyDown={key}>
          {options.map((o, k) => (
            <div key={o.id} id={`${id}-${k}`} role="option" aria-selected={k === at}
              className={`sa-wheel-row${k === at ? ' on' : ''}`} onClick={() => onChange(o.id)}>
              <strong>{o.label}</strong>
              {o.note && <small>{o.note}</small>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
