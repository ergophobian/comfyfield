import { useEffect, useState } from 'react'
import { speechProblem, speechWords } from '../../lib/formats/presenterSession.js'

export default function FormatReview({ session, onActivityChange }) {
  const [state, setState] = useState(session.engine.state)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => {
    setState(session.engine.state)
    return session.engine.subscribe(() => setState(session.engine.state))
  }, [session])
  const act = async (fn) => {
    if (busy || session.engine.isRunning()) return
    setBusy(true)
    onActivityChange?.(true)
    setError(null)
    try { await fn() } catch (e) { setError(e.message) }
    finally { setBusy(false); onActivityChange?.(false) }
  }
  const locked = busy || session.engine.isRunning()
  const script = session.flow.nodes.find((node) => node.type === 'writer')
  const text = state[script?.id]?.items?.find((item) => item.status === 'done')?.text || ''
  const limitError = session.scriptLimits ? speechProblem(text) : null
  const stale = session.scriptLimits && session.renderedScript != null && session.renderedScript !== text
  return <div className="format-review">
    {stale && <div className="presenter-stale" role="status">
      <p className="sheet-note">The video uses an older script. Send and approve the edited script, then explicitly rerun the video step.</p>
      {session.flow.nodes.filter((node) => node.type === 'model' && node.data.model.kind === 'video').map((node) => <button key={node.id} type="button" className="btn-soft sm" disabled={locked || !!limitError || session.engine.plan(session.flow, node.id).blocked} onClick={() => act(() => session.rerun(node.id))}>Rerun video</button>)}
    </div>}
    {session.flow.nodes.filter((node) => node.type === 'writer').map((node) => {
      const item = state[node.id]?.items?.find((i) => i.status === 'done')
      if (!item) return null
      return <div className="fp-field" key={node.id}>
        <label htmlFor={`review-${node.id}`}>Review your prompt</label>
        <textarea id={`review-${node.id}`} aria-label="Written prompt" className="fp-text" rows={7} disabled={locked} value={item.text} onChange={(e) => session.engine.editWriter(session.flow, node.id, e.target.value)} />
        <p className="sheet-note">{session.scriptLimits ? `Approximately 480p canvas. Speech is capped at 30 seconds. Keep to 60 words or fewer; ${speechWords(item.text)} words now. Edit, then send and approve the script.` : 'Edit the prompt, then send it to the next step.'}</p>
        {limitError && <p className="sheet-error" role="alert">{limitError}</p>}
        <button type="button" className="btn-blue sm" disabled={locked || !!limitError || state[node.id]?.sent || !item.text.trim()} onClick={() => act(() => session.sendWriter(node.id))}>{state[node.id]?.sent ? 'Prompt sent' : busy ? 'Rendering' : 'Send to render'}</button>
      </div>
    })}
    {session.flow.nodes.filter((node) => node.type === 'approve').map((node) => {
      const gate = session.engine.gate(node.id)
      if (gate.status !== 'reviewing') return null
      return <div key={node.id}>
        <p className="sheet-note">Review the results before sending them to the next step.</p>
        <div className="format-review-media">{session.engine.reviewItems(session.flow, node.id).map((item) => <button type="button" key={item.id} aria-pressed={gate.picked.includes(item.id)} onClick={() => session.engine.togglePick(session.flow, node.id, item.id)}>
          {item.kind === 'image' ? <img src={item.url} alt="Result to review" /> : item.kind === 'video' ? <video src={item.url} controls /> : <span>{item.text || 'Result'}</span>}
        </button>)}</div>
        <button type="button" className="btn-blue sm" disabled={locked || !!limitError} onClick={() => act(() => session.send(node.id))}>Send</button>
      </div>
    })}
    {error && <p className="sheet-error" role="alert">{error}</p>}
  </div>
}
