import { useEffect, useState } from 'react'

export default function FormatReview({ session }) {
  const [state, setState] = useState(session.engine.state)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const failure = session.error
  useEffect(() => {
    setState(session.engine.state)
    return session.engine.subscribe(() => setState(session.engine.state))
  }, [session])
  const act = async (fn) => {
    setBusy(true)
    setError(null)
    try {
      const result = await fn()
      if (result?.ok === false) setError(result.reason?.message || result.reason)
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  return <div className="format-review">
    {session.flow.nodes.filter((node) => node.type === 'writer').map((node) => {
      const item = state[node.id]?.items?.find((i) => i.status === 'done')
      if (!item) return null
      return <div className="fp-field" key={node.id}>
        <label htmlFor={`review-${node.id}`}>{node.data.review || 'Review your prompt'}</label>
        <textarea id={`review-${node.id}`} aria-label="Written prompt" className="fp-text" rows={7} disabled={busy} value={item.text} onChange={(e) => session.engine.editWriter(session.flow, node.id, e.target.value)} />
        <p className="sheet-note">Edit the prompt, then send it to the next step.</p>
        <button type="button" className="btn-blue sm" disabled={busy || state[node.id]?.sent || !item.text.trim()} onClick={() => act(() => session.sendWriter(node.id))}>{state[node.id]?.sent ? 'Prompt sent' : busy ? 'Rendering' : 'Send to render'}</button>
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
        <button type="button" className="btn-blue sm" disabled={busy} onClick={() => act(() => session.send(node.id))}>Send</button>
      </div>
    })}
    {failure && failure.code !== 'invalid_format' && <button type="button" className="btn-blue sm" disabled={busy || session.busy} onClick={() => act(() => session.retryFailed())}>Retry failed</button>}
    {(error || failure) && <p className="sheet-error" role="alert">{error || failure.message}</p>}
  </div>
}
