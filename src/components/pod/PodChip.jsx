import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { downloading, money, podAction, podLabel, showPod, spendText, usePod } from '../../lib/usePod.js'

const CLOUD = { SECURE: 'Secure', COMMUNITY: 'Community' }
const tone = (phase) => (phase === 'ready' ? ' ok' : phase === 'none' || phase === 'paused' ? '' : ' busy')
const pct = (d) => (d.total ? Math.min(100, (d.bytes / d.total) * 100) : 0)

// The Pod in the top bar: what it is doing and what it costs, on every page. It shows in Pod mode,
// or whenever a Pod exists, because a Pod charges by the minute. Its popover holds the actions.
export default function PodChip() {
  const { status: s } = usePod()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [, setNow] = useState(0)
  const ref = useRef(null)
  const btn = useRef(null)
  const { pathname } = useLocation()

  // Minutes keep counting between polls.
  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => { if (!open) { setConfirm(null); setErr(null) } }, [open])
  useEffect(() => {
    if (!open) return
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const key = (e) => {
      if (e.key !== 'Escape') return
      if (ref.current?.contains(document.activeElement)) btn.current?.focus()
      setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('focusin', away)
    window.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('focusin', away)
      window.removeEventListener('keydown', key)
    }
  }, [open])

  if (!showPod(s)) return null

  const act = async (action, body) => {
    setBusy(true)
    setErr(null)
    try {
      await podAction(action, body)
      setConfirm(null)
      return true
    } catch (e) {
      setErr({ message: e.message, code: e.code })
      return false
    } finally {
      setBusy(false)
    }
  }
  const replace = async () => { if (await act('terminate', { now: true })) await act('start') }
  const going = Math.max(s.runs || 0, s.queue || 0)
  const end = (how) => (going > 0 ? setConfirm(how) : act(how, { now: true }))
  const label = podLabel(s)
  const p = s.phase
  const files = downloading(s)
  const up = s.pod ? Math.max(0, Math.floor((Date.now() - s.pod.startedAt) / 60000)) : 0

  return (
    <div className="nav-menu pod" ref={ref}>
      <button ref={btn} type="button" className={`btn-soft pod-chip${open ? ' on' : ''}`} aria-expanded={open} aria-haspopup="dialog"
        aria-controls={open ? 'pod-pop' : undefined} onClick={() => setOpen((o) => !o)}>
        <i className={`pod-dot${tone(p)}`} aria-hidden="true" />
        <span>Pod · {label}</span>
        {p !== 'none' && <span className="pod-spend">· {money(s.spend?.today)} today</span>}
      </button>
      {open && (
        <div id="pod-pop" className="pod-pop glass pop" role="dialog" aria-label="Pod">
          <div className="pod-head">
            <strong>Pod</strong>
            {s.sandbox && <span className="todo">Sandbox</span>}
            <span className={`status${p === 'ready' ? ' ok' : ''}`}>{label}</span>
          </div>
          {s.pod ? (
            <dl className="pod-facts">
              <div><dt>GPU</dt><dd>{s.pod.gpu}{s.pod.cloudType ? ` · ${CLOUD[s.pod.cloudType] || s.pod.cloudType}` : ''}</dd></div>
              {p === 'paused'
                ? <div><dt>Disk while paused</dt><dd>{money(s.pod.pausedDiskPerDay)} a day</dd></div>
                : <div><dt>Rate</dt><dd>{money(s.pod.costPerHr)} an hour</dd></div>}
              {p !== 'paused' && <div><dt>Up for</dt><dd>{up} min</dd></div>}
              <div><dt>Spent</dt><dd>{spendText(s)}</dd></div>
            </dl>
          ) : (
            <>
              <p className="pod-note">{s.instant
                ? 'ComfyUI runs use Comfy Cloud at once. Start a Pod for a long session: it costs less when you run a lot, and it runs any model.'
                : 'Add a Comfy API key in Connections for instant runs on Comfy Cloud, or start a Pod.'}</p>
              <dl className="pod-facts"><div><dt>Spent</dt><dd>{spendText(s)}</dd></div></dl>
            </>
          )}
          {files.map((d) => (
            <div className="pod-dl" key={`${d.dir}/${d.file}`}>
              <span><em>{d.file}</em><b>{Math.round(pct(d))}%</b></span>
              <i style={{ '--p': `${pct(d)}%` }} />
            </div>
          ))}
          {p === 'ready' && <p className="pod-note">ComfyUI runs use this Pod.</p>}
          {p === 'starting' && s.instant && <p className="pod-note">Runs use Comfy Cloud until the Pod is ready.</p>}
          {s.event && <p className="pod-note">{s.event.text}</p>}
          {s.sandbox && <p className="pod-note">Sandbox mode: no real Pod and no charges.</p>}
          {!s.connected && <p className="pod-note">Add your RunPod key in <Link to="/connections">Connections</Link> to start a Pod.</p>}
          {err && <p className="sheet-error">{err.message}</p>}
          <div className="pod-acts">
            {confirm ? (
              <>
                <p>{going} {going === 1 ? 'run is' : 'runs are'} still going.</p>
                <button type="button" className="btn-soft sm" disabled={busy} onClick={() => act(confirm)}>After {going === 1 ? 'it finishes' : `${going} finish`}</button>
                <button type="button" className="btn-soft sm danger" disabled={busy} onClick={() => act(confirm, { now: true })}>{confirm === 'pause' ? 'Pause now' : 'Terminate now'}</button>
                <button type="button" className="link-btn" onClick={() => setConfirm(null)}>Cancel</button>
              </>
            ) : p === 'none' ? (
              <button type="button" className="btn-blue sm" disabled={busy || !s.connected} onClick={() => act('start')}>{busy ? 'Starting' : 'Start a Pod'}</button>
            ) : p === 'paused' ? (
              <>
                <button type="button" className="btn-blue sm" disabled={busy} onClick={() => act('resume')}>{busy ? 'Resuming' : 'Resume'}</button>
                <button type="button" className="btn-soft sm danger" disabled={busy} onClick={() => act('terminate', { now: true })}>Terminate</button>
              </>
            ) : p === 'ending' ? (
              <>
                <button type="button" className="btn-blue sm" disabled={busy} onClick={() => act('keep')}>Keep the Pod</button>
                <button type="button" className="btn-soft sm danger" disabled={busy} onClick={() => act('terminate', { now: true })}>Terminate now</button>
              </>
            ) : p === 'starting' || p === 'ready' ? (
              <>
                <button type="button" className="btn-soft sm" disabled={busy} onClick={() => end('pause')}>Pause</button>
                <button type="button" className="btn-soft sm danger" disabled={busy} onClick={() => end('terminate')}>Terminate</button>
              </>
            ) : null}
            {err?.code === 'resume_no_gpu' && <button type="button" className="btn-blue sm" disabled={busy} onClick={replace}>Terminate it and start a new Pod</button>}
          </div>
          <Link className="link-btn menu-foot" to="/connections">Pod settings</Link>
        </div>
      )}
    </div>
  )
}
