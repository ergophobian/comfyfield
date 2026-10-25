import { ArtImage } from './Art.jsx'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconClose } from './Icons.jsx'
import { Field } from './formats/Fields.jsx'
import { initialValues, missingInputs, visibleInputs } from '../lib/formats/values.js'
import { stepModel } from '../lib/formats/options.js'
import FormatReview from './formats/Review.jsx'
import { isWired } from '../lib/formats/index.js'
import { providerInfo } from '../lib/catalog.js'
import { estimate, money, useModelMeta } from '../lib/cost.js'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function Card({ format, onOpen, i = 0 }) {
  const ref = useRef(null)
  const [live, setLive] = useState(false)
  const preview = (on) => {
    const v = ref.current
    if (!v || (on && calm())) return
    setLive(on)
    if (on) v.play().catch(() => {})
    else { v.pause(); v.currentTime = 0 }
  }
  return (
    <button type="button" className="format-card rise" style={{ '--d': `calc(${Math.min(i, 12)} * var(--stagger))` }} onClick={() => onOpen(format)}
      onPointerEnter={() => preview(true)} onPointerLeave={() => preview(false)} onFocus={() => preview(true)} onBlur={() => preview(false)}>
      <span className="format-cover" style={{ background: format.cover }}>
        <ArtImage id={format.id} alt={`${format.name} example`} />
        {format.preview && <video ref={ref} className={live ? 'on' : ''} src={format.preview} muted loop playsInline preload="none" />}
      </span>
      <strong>{format.name}</strong>
      <small>{format.blurb}</small>
      <span className="format-tags">
        {format.runsOn && <em title={format.runsOn}>{format.runsOn}</em>}
        {!isWired(format) && <em className="todo">Not wired yet</em>}
      </span>
    </button>
  )
}

export function FormatGrid({ list, onOpen }) {
  return (
    <div className="format-grid">
      {list.map((f, i) => <Card key={f.id} format={f} i={i} onOpen={onOpen} />)}
    </div>
  )
}

function useDismiss(onClose) {
  const [leaving, setLeaving] = useState(false)
  const close = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(onClose, 180)
  }
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })
  return [leaving, close]
}

export function FormatSheet({ format, gens, connections, onClose, initial }) {
  const [leaving, close] = useDismiss(onClose)
  const [values, setValues] = useState(() => ({ ...initialValues(format), ...initial }))
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)
  const [running, setRunning] = useState(false)
  const model = stepModel(format, format.steps.find((step) => !step.type), values)
  const provider = providerInfo[model.provider === 'comfyRouter' ? 'comfy' : model.provider]
  const metaOf = useModelMeta([model])
  const set = (id, v) => { setSession(null); setValues((x) => ({ ...x, [id]: v })) }
  const wired = isWired(format)
  const connected = model.provider === 'comfy' || connections[model.provider === 'comfyRouter' ? 'comfy' : model.provider]?.connected
  const missing = missingInputs(format, values)
  const each = estimate(model, metaOf(model), { aspect: '1:1', count: 1, duration: format.settings?.duration })

  const run = async (e) => {
    e.preventDefault()
    if (!wired || missing.length || !connected) return
    setRunning(true)
    setError(null)
    try {
      const next = await gens.generateFormat(format, values, { onSession: setSession })
      if (next.flow.nodes.some((node) => ['writer', 'approve'].includes(node.type))) setSession(next)
      else close()
    } catch (e) { if (e.session) setSession(e.session); setError(e.message) }
    finally { setRunning(false) }
  }

  return (
    <div className={`scrim side${leaving ? ' out' : ''}`} onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <form className={`sheet glass${format.layout === 'wide' ? ' wide' : ''}`} onSubmit={run} role="dialog" aria-label={format.name}>
        <div className="sheet-cover" style={{ background: format.cover }}>
          <ArtImage id={format.id} alt={`${format.name} example`} />
          {format.preview && <video src={format.preview} muted loop playsInline autoPlay={!calm()} />}
          <button type="button" className="icon-btn" onClick={close} aria-label="Close"><IconClose /></button>
          {format.runsOn && <span className="sheet-tag">{format.runsOn}</span>}
        </div>
        <div className="sheet-body">
          <h2>{format.name}</h2>
          <p className="sheet-blurb">{format.blurb}</p>
          {format.output && <p className="sheet-output"><strong>You get</strong> {format.output}</p>}
          <div className="sheet-fields">
            {visibleInputs(format, values).map((input) => (
              <Field key={input.id} input={input} value={values[input.id]} onChange={(v) => set(input.id, v)} setError={setError} />
            ))}
          </div>
          {error && !session && <p className="sheet-error">{error}</p>}
          {session && <FormatReview session={session} />}
          {wired && !connected && <p className="sheet-note">This runs on {provider.name}. <Link to="/connections">Add your key</Link> to use it.</p>}
        </div>
        <div className="sheet-foot">
          {wired ? (
            <span className="muted">{each ? `${each.approx ? '≈' : ''}${money(each.usd)} per run` : `Runs on ${provider.name}`}</span>
          ) : (
            <span className="muted">Not wired yet. Runs on {format.runsOn || 'open weights'} once the engine is connected.</span>
          )}
          <button className="btn-blue" disabled={running || !wired || missing.length > 0 || !connected}>{running ? 'Working' : 'Run'}</button>
        </div>
      </form>
    </div>
  )
}
