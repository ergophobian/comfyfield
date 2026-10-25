import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from './formats/Fields.jsx'
import FormatReview from './formats/Review.jsx'
import { initialValues, missingInputs, visibleInputs } from '../lib/formats/values.js'
import { stepModel } from '../lib/formats/options.js'
import { formatById, isWired } from '../lib/formats/index.js'
import { providerInfo } from '../lib/catalog.js'
import { estimate, money, useModelMeta } from '../lib/cost.js'
import { useApp } from '../lib/appContext.js'
import { useHandoff } from '../lib/handoff.js'

// A format picked in a composer: its values, its run and its review, kept by the page while the composer swaps
// its own controls for the format's inputs.
export function useComposerFormat(kind) {
  const { gens, connections } = useApp()
  const [format, setFormat] = useState(null)
  const [values, setValues] = useState({})
  const [session, setSession] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  const pick = (f, picked = {}) => {
    const next = typeof f === 'string' ? formatById(f) : f
    if (!next || next.kind !== kind || !isWired(next)) return
    // Picking a variant of the same format keeps what is already filled in.
    setValues((v) => ({ ...initialValues(next), ...(format?.id === next.id ? v : {}), ...picked }))
    setFormat(next)
    setSession(null)
    setError(null)
  }
  const clear = () => { setFormat(null); setSession(null); setError(null) }
  // Any page can open a format in this composer: openFormat hands it over through the router.
  useHandoff((h) => { if (h.format) pick(h.format, h.values || {}) })

  const step = format?.steps.find((s) => !s.type)
  const model = format && stepModel(format, step, values)
  const metaOf = useModelMeta(model ? [model] : [])
  const provider = model && providerInfo[model.provider === 'comfyRouter' ? 'comfy' : model.provider]
  const connected = Boolean(model) && (model.provider === 'comfy' || connections[model.provider === 'comfyRouter' ? 'comfy' : model.provider]?.connected)
  const missing = format ? missingInputs(format, values) : []
  const each = model && estimate(model, metaOf(model), { aspect: '1:1', count: 1, duration: format.settings?.duration })

  const set = (id, v) => { setSession(null); setValues((x) => ({ ...x, [id]: v })) }
  const run = async () => {
    if (!format || missing.length || !connected || running) return
    setRunning(true)
    setError(null)
    try {
      const next = await gens.generateFormat(format, values, { onSession: setSession })
      if (!next.flow.nodes.some((node) => ['writer', 'approve'].includes(node.type))) setSession(null)
    } catch (e) { if (e.session) setSession(e.session); setError(e.message) } finally { setRunning(false) }
  }
  return { kind, format, values, set, pick, clear, run, running, session, error, setError, missing, connected, provider, each }
}

// The picked format's inputs, inline in the composer.
export function FormatFields({ fmt, className = '' }) {
  const { format, values, set, setError, session, error, connected, provider } = fmt
  return (
    <div className={`fc ${className}`} key={format.id}>
      <p className="fc-line">{format.blurb}{format.runsOn && <em>{format.runsOn}</em>}</p>
      <div className="fc-fields">
        {visibleInputs(format, values).map((input) => (
          <Field key={input.id} input={input} value={values[input.id]} onChange={(v) => set(input.id, v)} setError={setError} />
        ))}
      </div>
      {error && !session && <p className="gen-status error" role="alert">{error}</p>}
      {session && <FormatReview session={session} />}
      {!connected && <p className="gen-status">This runs on {provider.name}. <Link to="/connections">Add your key</Link> to use it.</p>}
    </div>
  )
}

// Generate for a format, with its price per run.
export function FormatGo({ fmt }) {
  const { missing, connected, running, each } = fmt
  const why = missing.length ? `Add ${missing.map((i) => i.label.toLowerCase()).join(', ')}` : null
  return (
    <span className="fc-go">
      {why && <small className="muted">{why}</small>}
      <button type="button" className="btn-blue gen-go" disabled={running || missing.length > 0 || !connected} onClick={fmt.run}>
        {running ? 'Working' : 'Generate'}{each && !running ? ` · ${each.approx ? '≈' : ''}${money(each.usd)}` : ''}
      </button>
    </span>
  )
}
