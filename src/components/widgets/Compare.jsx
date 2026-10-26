import { useRef, useState } from 'react'
import { IconChevron } from '../Icons.jsx'

const clamp = (n) => Math.min(100, Math.max(0, n))
const keySteps = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 }

// The source under the result, with a divider to drag between them. The result sets the size; the source is
// stretched over it, so an upscale's smaller source lines up with its larger result.
export default function Compare({ before, after, alt = '', className = '' }) {
  const [at, setAt] = useState(50)
  const [dragging, setDragging] = useState(false)
  const box = useRef()
  const handle = useRef()
  const moveTo = (x) => {
    const r = box.current.getBoundingClientRect()
    if (r.width) setAt(clamp(((x - r.left) / r.width) * 100))
  }
  const down = (e) => {
    if (e.button > 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    moveTo(e.clientX)
    handle.current.focus({ preventScroll: true })
  }
  const key = (e) => {
    const step = keySteps[e.key]
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? 100 : step != null ? at + step * (e.shiftKey ? 2 : 1) : null
    if (next == null) return
    // Arrows here move the divider, not the viewer to the next item.
    e.preventDefault()
    e.stopPropagation()
    setAt(clamp(next))
  }
  return (
    <div ref={box} className={`compare${dragging ? ' dragging' : ''} ${className}`} style={{ '--at': `${at}%` }}
      onPointerDown={down} onPointerMove={(e) => dragging && moveTo(e.clientX)}
      onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}
      onClick={(e) => e.stopPropagation()}>
      <img className="compare-after" src={after} alt={alt ? `After: ${alt}` : 'After'} draggable={false} />
      <img className="compare-before" src={before} alt={alt ? `Before: ${alt}` : 'Before'} draggable={false} />
      <span className="compare-tag before">Before</span>
      <span className="compare-tag after">After</span>
      <span className="compare-line" />
      <span ref={handle} className="compare-handle" role="slider" tabIndex={0} aria-label="Before and after divider"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(at)} aria-valuetext={`${Math.round(at)}% before`}
        aria-orientation="horizontal" onKeyDown={key}>
        <IconChevron dir="left" /><IconChevron />
      </span>
    </div>
  )
}
