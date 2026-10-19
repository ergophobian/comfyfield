import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { answerPod, money, podAction, podQuote, spendText, usePod } from '../../lib/usePod.js'

const COPY = {
  start: { title: 'Start a Pod', go: 'Start a Pod and run', busy: 'Starting' },
  resume: { title: 'Resume your Pod', go: 'Resume the Pod and run', busy: 'Resuming' },
  keep: { title: 'Keep your Pod', go: 'Keep the Pod and run', busy: 'Keeping' },
}
const fileText = (f) => `${f.name.replace(/\.safetensors$/, '')} (${f.gb.toFixed(1)} GB)`

// Asks once before a run starts, resumes or keeps a Pod. Every run waiting on it gets the answer.
export default function PodSheet() {
  const { status: s, ask } = usePod()
  const [quote, setQuote] = useState(null)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const go = useRef(null)

  useEffect(() => {
    if (!ask) return
    setQuote(null)
    setErr(null)
    podQuote(ask.workflow).then(setQuote, (e) => setErr({ message: e.message, blocking: true }))
  }, [ask])
  // While a start is in flight the server may still create the Pod, so the sheet cannot be cancelled.
  const cancel = () => { if (!busy) answerPod(false) }
  useEffect(() => {
    if (!ask) return
    const key = (e) => e.key === 'Escape' && cancel()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [ask, busy])
  useEffect(() => { if (quote) go.current?.focus() }, [quote])

  if (!ask) return null
  const kind = s?.phase === 'paused' ? 'resume' : s?.phase === 'ending' ? 'keep' : 'start'
  const copy = COPY[kind]
  const rung = quote?.rungs.find((r) => r.inStock) || quote?.rungs[0]
  const capped = quote && kind !== 'keep' && quote.spend?.today >= quote.spend?.cap
  const noKey = quote && !quote.connected

  const run = async (fn) => {
    setBusy(true)
    setErr(null)
    try {
      await fn()
      answerPod(true)
    } catch (e) {
      setErr({ message: e.message, code: e.code })
    } finally {
      setBusy(false)
    }
  }
  const start = () => run(() => podAction(kind, kind === 'start' ? { workflow: ask.workflow } : {}))
  const replace = () => run(async () => { await podAction('terminate', { now: true }); await podAction('start', { workflow: ask.workflow }) })

  return (
    <div className="scrim" onClick={cancel}>
      <div className="form-sheet glass pop pod-sheet" role="dialog" aria-modal="true" aria-labelledby="pod-sheet-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="pod-sheet-title">{copy.title}</h3>
        {kind === 'start' && <p>{ask.reason ? `${ask.reason}, so this run needs a Pod: ` : 'This run needs a Pod: '}a GPU on RunPod that runs ComfyUI with your key. It charges by the minute until it terminates.</p>}
        {kind !== 'start' && ask.reason && <p>{ask.reason}, so this run needs your Pod.</p>}
        {kind === 'resume' && <p>Your Pod is paused. Its models are still on its disk, so it is ready sooner than a new Pod.</p>}
        {kind === 'keep' && <p>Your Pod is ending after its queue. Keep it to run this too.</p>}
        {!quote && !err && <p className="pod-note">Checking prices</p>}
        {quote && (
          <dl className="pod-facts">
            {kind === 'start' && rung && <div><dt>GPU</dt><dd>{rung.name} · {rung.vramGb} GB</dd></div>}
            {kind === 'start' && <div><dt>Price</dt><dd>{rung?.usdPerHr != null ? `${money(rung.usdPerHr)} an hour` : 'Set by RunPod at start'}</dd></div>}
            {kind === 'start' && <div><dt>Ready in</dt><dd>Usually 5 to 8 minutes</dd></div>}
            {quote.files.length > 0 && <div><dt>Models</dt><dd>{quote.files.map(fileText).join(', ')}</dd></div>}
            {quote.runtimes?.map((e) => <div key={e.name}><dt>Installs</dt><dd>{e.name}, about {e.gb} GB, in {e.minutes[0]} to {e.minutes[1]} minutes the first time</dd></div>)}
            <div><dt>Spent</dt><dd>{spendText(quote)}</dd></div>
          </dl>
        )}
        {kind === 'start' && quote && <p className="sheet-note">It terminates after 10 idle minutes. Pause or terminate it any time from the Pod chip in the top bar.</p>}
        {s?.sandbox && <p className="sheet-note">Sandbox mode: no real Pod and no charges.</p>}
        {noKey && kind === 'start' && <p className="sheet-error">Add your RunPod key in <Link to="/connections" onClick={() => answerPod(false)}>Connections</Link> to start a Pod.</p>}
        {capped && <p className="sheet-error">Daily cap reached: {spendText(quote)}. Raise it on the <Link to="/pods" onClick={() => answerPod(false)}>Pods page</Link>.</p>}
        {err && <p className="sheet-error">{err.message}</p>}
        <div className="form-sheet-foot">
          <span className="grow" />
          <button type="button" className="btn-soft" disabled={busy} onClick={cancel}>Cancel</button>
          {err?.code === 'resume_no_gpu'
            ? <button type="button" className="btn-blue sm" disabled={busy} onClick={replace}>Terminate it and start a new Pod</button>
            : <button ref={go} type="button" className="btn-blue sm" disabled={busy || !quote || capped || (noKey && kind === 'start') || err?.blocking} onClick={start}>{busy ? copy.busy : copy.go}</button>}
        </div>
      </div>
    </div>
  )
}
