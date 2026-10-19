import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { answerPod, money, podAction, podQuote, spendText, usePod } from '../../lib/usePod.js'

const COPY = {
  start: { title: 'Start a Session', go: 'Start a Session and run', busy: 'Starting' },
  resume: { title: 'Resume your Pod', go: 'Resume the Pod and run', busy: 'Resuming' },
  keep: { title: 'Keep your Pod', go: 'Keep the Pod and run', busy: 'Keeping' },
}
const fileText = (f) => `${f.name.replace(/\.safetensors$/, '')} (${f.gb.toFixed(1)} GB)`
const CLOUD = { SECURE: 'Secure', COMMUNITY: 'Community' }
// "About 40 s, $0.03 a job" or "About 3 min, under $0.01 a job".
const jobTime = (sec) => (sec < 90 ? `${Math.max(1, Math.round(sec))} s` : `${Math.round(sec / 60)} min`)
const jobCost = (usd) => (usd == null ? 'price set by RunPod' : usd < 0.01 ? 'under $0.01 a job' : `${money(usd)} a job`)
const tierName = (tiers, id) => tiers.find((t) => t.id === id)?.name

// Asks once before a run starts, resumes or keeps a Pod. Every run waiting on it gets the answer.
export default function PodSheet() {
  const { status: s, ask } = usePod()
  const [quote, setQuote] = useState(null)
  const [tier, setTier] = useState(null)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const go = useRef(null)

  useEffect(() => {
    if (!ask) return
    setQuote(null)
    setErr(null)
    podQuote(ask.workflow).then((q) => { setQuote(q); setTier(q.tier) }, (e) => setErr({ message: e.message, blocking: true }))
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
  const tiers = quote?.tiers || []
  const picked = tiers.find((t) => t.id === tier) || tiers[0]
  const downloadGb = (quote?.files || []).reduce((n, f) => n + f.gb, 0)
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
  const start = () => run(() => podAction(kind, kind === 'start' ? { workflow: ask.workflow, tier: picked?.id } : {}))
  const replace = () => run(async () => { await podAction('terminate', { now: true }); await podAction('start', { workflow: ask.workflow, tier: picked?.id }) })

  return (
    <div className="scrim" onClick={cancel}>
      <div className="form-sheet glass pop pod-sheet" role="dialog" aria-modal="true" aria-labelledby="pod-sheet-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="pod-sheet-title">{copy.title}</h3>
        {kind === 'start' && <p>{ask.reason ? `${ask.reason}, so this run needs a Session: ` : 'This run needs a Session: '}a Pod, which is a GPU on RunPod that runs ComfyUI with your key. It charges by the minute until it ends, and later runs use it too.</p>}
        {kind !== 'start' && ask.reason && <p>{ask.reason}, so this run needs your Pod.</p>}
        {kind === 'resume' && <p>Your Pod is paused. Its models are still on its disk, so it is ready sooner than a new Pod.</p>}
        {kind === 'keep' && <p>Your Pod is ending after its queue. Keep it to run this too.</p>}
        {!quote && !err && <p className="pod-note">Checking prices</p>}
        {quote && kind === 'start' && tiers.length > 0 && (
          <div className="opt-grid pod-tiers" role="group" aria-label="Session tier">
            {tiers.map((t) => (
              <button type="button" key={t.id} className={`opt${picked?.id === t.id ? ' on' : ''}`} aria-pressed={picked?.id === t.id}
                disabled={!t.gpu} onClick={() => setTier(t.id)}>
                <strong>{t.name}</strong>
                <small>{t.blurb}</small>
                {t.gpu ? (
                  <>
                    <span className="pod-tier-gpu">{t.gpu.name} · {t.gpu.vramGb} GB</span>
                    <small>About {jobTime(t.gpu.seconds)}, {jobCost(t.gpu.usdPerJob)}</small>
                    <small>{t.gpu.usdPerHr != null ? `${money(t.gpu.usdPerHr)} an hour` : 'Price set by RunPod'} · {CLOUD[t.gpu.cloudType] || t.gpu.cloudType}{t.gpu.inStock === false ? ' · none free now' : ''}</small>
                    {t.sameAs && <small>Same GPU as {tierName(tiers, t.sameAs)} for this job</small>}
                  </>
                ) : <small>No GPU fits this job</small>}
              </button>
            ))}
          </div>
        )}
        {quote && (
          <dl className="pod-facts">
            {kind === 'start' && <div><dt>Ready in</dt><dd>Usually 5 to 8 minutes, then the downloads</dd></div>}
            {quote.files.length > 0 && <div><dt>Downloads</dt><dd title={quote.files.map(fileText).join('\n')}>{downloadGb.toFixed(0)} GB in {quote.files.length} {quote.files.length === 1 ? 'file' : 'files'}, the first time</dd></div>}
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
            : <button ref={go} type="button" className="btn-blue sm" disabled={busy || !quote || capped || (noKey && kind === 'start') || err?.blocking || (kind === 'start' && !picked?.gpu)} onClick={start}>
              {busy ? copy.busy : kind === 'start' && picked ? `Start ${picked.name} and run` : copy.go}</button>}
        </div>
      </div>
    </div>
  )
}
