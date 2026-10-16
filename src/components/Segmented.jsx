import { useLayoutEffect, useRef, useState } from 'react'

// Segmented control with a pill that glides to the active option.
export default function Segmented({ options, value, onChange, className = '' }) {
  const ref = useRef(null)
  const [pill, setPill] = useState(null)

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector(`[data-value="${value}"]`)
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [value, options.length])

  return (
    <div className={`seg ${className}`} ref={ref} role="tablist">
      {pill && <span className="seg-pill" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} />}
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" data-value={o.value} aria-selected={o.value === value}
          className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
