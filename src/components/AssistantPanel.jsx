import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAgents, agentAction, refreshAgents } from '../lib/agents.js'

const cost = (usd) => usd == null ? 'Estimate unavailable' : usd === 0 ? 'No generation cost' : `≈$${usd.toFixed(4)}`
const statuses = { starting: 'Starting', idle: 'Ready', working: 'Working', approval: 'Waiting for approval', stopped: 'Stopped', error: 'Needs attention' }

export default function AssistantPanel() {
  const { sessions, setup, loading, error: connectionError } = useAgents()
  const [adapter, setAdapter] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const end = useRef(null)
  const session = sessions.at(-1)
  const active = session && !['stopped', 'error'].includes(session.status)
  const busy = active && session.status !== 'idle'
  const chosen = adapter || setup.find((s) => s.available)?.id || setup[0]?.id || ''
  const installed = setup.some((s) => s.id === chosen && s.available)

  useEffect(() => {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    end.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'nearest' })
  }, [session?.events.length])

  const perform = async (fn) => {
    setPending(true)
    setError('')
    try { await fn() } catch (e) { setError(e.message) } finally { setPending(false) }
  }
  const start = () => perform(async () => {
    if (session && session.status !== 'stopped') await agentAction(session.id, 'stop')
    await agentAction(null, '', { adapter: chosen })
  })
  const send = (event) => {
    event.preventDefault()
    if (!text.trim() || busy || pending || !active) return
    perform(async () => { await agentAction(session.id, 'message', { text }); setText('') })
  }
  return (
    <section className="agent-assistant" aria-label="Assistant">
      <header className="agent-heading">
        <div><span className="sb-badge">Assistant</span><h2>Make a plan, then make it real</h2></div>
        <Link className="btn-soft" to="/flows">Open flows</Link>
      </header>
      <p className="muted">Use your Claude or ChatGPT subscription. Review the models and estimated cost before each generation or flow run.</p>
      <div className="agent-controls">
        <label>Agent<select aria-label="Agent" value={chosen} onChange={(e) => setAdapter(e.target.value)} disabled={active || pending}>{setup.map((s) => <option value={s.id} key={s.id}>{s.name}{s.available ? '' : ' · Setup needed'}</option>)}</select></label>
        {active ? <button type="button" className="btn-soft" disabled={pending} onClick={() => perform(() => agentAction(session.id, 'stop'))}>Stop session</button>
          : <button type="button" className="btn-blue" disabled={loading || !installed || pending} onClick={start}>{pending ? 'Starting…' : 'Start session'}</button>}
        <span className="agent-status" role="status">{session ? `${session.name} · ${statuses[session.status] || session.status}` : loading ? 'Checking setup…' : 'Choose an agent'}</span>
      </div>
      {!active && <div className="agent-setup glass">
        <strong>{installed ? 'Ready to connect' : 'Set up a local agent'}</strong>
        {setup.filter((s) => !s.available || s.id === chosen).map((s) => <p key={s.id}><b>{s.name}.</b> {s.setup}</p>)}
        <p className="sheet-note">No provider key is needed for chat. Generations use your connections and require approval. Agent sign-in is checked when you start a session.</p>
        <button type="button" className="btn-soft" onClick={refreshAgents}>Check setup again</button>
      </div>}
      {(error || connectionError) && <p className="agent-error" role="alert">{error || connectionError}</p>}
      {session && <div className="agent-thread" role="log" aria-label="Conversation and tool activity">
        {session.events.filter((event) => ['message', 'tool', 'error', 'decision'].includes(event.type)).map((event) => (
          <div className={`agent-event agent-${event.type} ${event.role === 'user' ? 'agent-user' : ''}`} key={event.id}>
            {event.type === 'message' ? <><strong>{event.role === 'user' ? 'You' : session.name}</strong><p>{event.text}</p></>
              : event.type === 'tool' ? <p><b>{event.name.replaceAll('_', ' ')}</b> · {event.state}{event.text ? ` · ${event.text}` : ''}</p>
                : event.type === 'decision' ? <p>{event.approved ? 'Plan approved' : 'Plan rejected'}</p> : <p role="alert">{event.text}</p>}
          </div>
        ))}
        <div ref={end} />
      </div>}
      {session?.plans.map((plan) => <article key={plan.id} className="sb-plan agent-plan">
        <div className="sb-plan-head"><strong>{plan.title}</strong><span>Needs approval</span></div>
        <ol>{plan.steps.map((step, i) => <li key={i}><b>{i + 1}</b><div><strong>{step.model}</strong><span>{step.prompt}</span><small>{[step.aspect, step.duration && `${step.duration} seconds`, step.count && `${step.count} ${step.count === 1 ? 'result' : 'results'}`].filter(Boolean).join(' · ')}</small></div><span className="sb-cost">{cost(step.usd)}</span></li>)}</ol>
        <div className="sb-plan-total"><span>Estimated generation cost</span><strong>{cost(plan.usd)}</strong></div>
        <details><summary>Review exact request</summary><pre>{JSON.stringify(plan.flow || plan.args, null, 2)}</pre></details>
        <p className="sheet-note">{plan.usd == null ? 'Pricing is unavailable. Approving may spend provider credits.' : 'Estimate only. Provider charges may vary.'} This approval applies to this request once. Your agent subscription usage is separate.</p>
        <div className="agent-controls"><button type="button" className="btn-blue" disabled={pending} onClick={() => perform(() => agentAction(session.id, 'approve', { planId: plan.id, approved: true }))}>Approve plan</button><button type="button" className="btn-soft" disabled={pending} onClick={() => perform(() => agentAction(session.id, 'approve', { planId: plan.id, approved: false }))}>Reject</button></div>
      </article>)}
      <form className="composer glass agent-composer" onSubmit={send}>
        <div className="composer-inner">
          <textarea aria-label="Message" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe what you want to make, or ask the assistant to edit a flow" disabled={!active} />
          <div className="composer-foot"><span className="sheet-note">Every generation needs your approval.</span><button type="submit" className="btn-blue" disabled={!active || busy || pending || !text.trim()}>Send</button></div>
        </div>
      </form>
      {session?.status === 'stopped' && <p className="sheet-note">The session is stopped. Provider work already submitted may finish and incur its usual charge.</p>}
    </section>
  )
}
