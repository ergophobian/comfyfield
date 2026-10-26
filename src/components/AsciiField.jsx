import { useEffect, useRef } from 'react'
import { createAsciiField, readTokens } from '../lib/asciiField.js'

// The ASCII background. Throttled to --ascii-frame, paused while the tab is hidden,
// and a single still frame when the user prefers reduced motion.
export default function AsciiField() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const tokens = readTokens()
    const field = createAsciiField(canvas, tokens)
    const { frame } = tokens
    // Kept on the element so the browser check can read the timings and drive frames.
    canvas.asciiField = field
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const born = performance.now()
    let raf = 0, last = 0, settle = 0

    const fit = () => {
      field.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
      field.draw(motion.matches ? 0 : performance.now() - born)
    }
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (now - last < frame) return
      last = now
      field.draw(now - born)
    }
    const start = () => {
      cancelAnimationFrame(raf)
      raf = 0
      if (!motion.matches && document.visibilityState === 'visible') raf = requestAnimationFrame(tick)
    }
    const refit = () => { fit(); start() }
    // A full repaint costs more than a frame, so a window drag repaints once it pauses.
    const onResize = () => { clearTimeout(settle); settle = setTimeout(refit, frame) }
    // A zoom or a move to another screen changes devicePixelRatio without always firing resize.
    let dprQuery
    const watchDpr = () => {
      dprQuery?.removeEventListener('change', onDpr)
      dprQuery = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`)
      dprQuery.addEventListener('change', onDpr)
    }
    function onDpr() { watchDpr(); refit() }

    fit()
    watchDpr()
    start()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', start)
    motion.addEventListener('change', refit)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(settle)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', start)
      motion.removeEventListener('change', refit)
      dprQuery?.removeEventListener('change', onDpr)
      delete canvas.asciiField
    }
  }, [])

  return <div className="ascii-bg" aria-hidden="true"><canvas ref={ref} /></div>
}
