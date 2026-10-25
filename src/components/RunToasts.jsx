import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../lib/appContext.js'
import { IconClose } from './Icons.jsx'

const SHOW_MS = 7000
const noun = { image: 'image', video: 'video', audio: 'audio' }

// Says when a run finishes or fails while you are on a different page from the one it started on.
export default function RunToasts() {
  const items = useApp()?.gens?.items || []
  const { pathname, search } = useLocation()
  const here = useRef('')
  here.current = pathname + search
  const was = useRef(null)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const pending = new Map(items.filter((i) => i.pending).map((i) => [i.id, i]))
    const before = was.current
    was.current = pending
    if (!before) return
    const next = []
    for (const [id, it] of before) {
      if (pending.has(id) || it.from === here.current) continue
      const failed = items.find((x) => x.id === id && x.failed)
      const done = items.find((x) => x.id.startsWith(`${id}-`) && !x.pending)
      // Neither means the run was cancelled, which needs no message.
      if (failed) next.push({ id, failed: true, text: `${it.model} failed`, link: 'See why', to: it.from })
      else if (done) next.push({ id, text: `Your ${noun[it.kind] || 'result'} is ready`, link: 'See it', to: it.from || '/assets' })
    }
    if (next.length) setToasts((ts) => [...ts, ...next].slice(-3))
  }, [items])

  useEffect(() => {
    if (!toasts.length) return
    const t = setTimeout(() => setToasts((ts) => ts.slice(1)), SHOW_MS)
    return () => clearTimeout(t)
  }, [toasts])

  const drop = (id) => setToasts((ts) => ts.filter((t) => t.id !== id))
  return (
    <div className="run-toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`run-toast rise${t.failed ? ' failed' : ''}`} role="status">
          <span>{t.text}</span>
          {t.to && <Link className="link-btn" to={t.to} onClick={() => drop(t.id)}>{t.link}</Link>}
          <button type="button" className="icon-btn" aria-label="Close" onClick={() => drop(t.id)}><IconClose /></button>
        </div>
      ))}
    </div>
  )
}
