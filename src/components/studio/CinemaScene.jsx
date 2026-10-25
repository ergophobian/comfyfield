import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { cinemaCost, cinemaExample, cinemaExamplePlan, cinemaFlow, cinemaInstructions, cinemaModel, cinemaPrompt, validateCinemaPlan } from '../../lib/cinema.js'
import { engineFor, openFlow, useFlowStorage } from '../../lib/flowStore.js'
import { reloadFlows } from '../../lib/remoteFlows.js'
import { keepRequestKey } from '../../lib/routerBatch.js'
import { writePrompt } from '../../lib/providers.js'
import { useApp } from '../../lib/appContext.js'
import { money } from '../../lib/cost.js'
import { FlowCtx } from '../flow/nodes.jsx'
import StitchPanel from '../flow/StitchPanel.jsx'
import { Field } from '../formats/Fields.jsx'
import { useStored } from './Shell.jsx'

function ShotFields({ shot, index, edit, frames = false, setError }) {
  return (
    <div className="cinema-shot-fields">
      <label>Prompt<textarea aria-label={`Shot ${index + 1} prompt`} rows={3} maxLength={600} value={shot.prompt} onChange={(event) => edit({ prompt: event.target.value })} /></label>
      <div className="cinema-shot-settings">
        <label>Camera move<input aria-label={`Shot ${index + 1} camera move`} maxLength={600} value={shot.camera} onChange={(event) => edit({ camera: event.target.value })} /></label>
        <label>Duration<select aria-label={`Shot ${index + 1} duration`} value={shot.duration} onChange={(event) => edit({ duration: Number(event.target.value) })}>
          {cinemaModel.durations.map((duration) => <option key={duration} value={duration}>{duration} seconds</option>)}
        </select></label>
      </div>
      <label>Continuity notes<textarea aria-label={`Shot ${index + 1} continuity notes`} rows={2} maxLength={600} value={shot.continuity} onChange={(event) => edit({ continuity: event.target.value })} /></label>
      {frames && <Field input={{ id: `frame-${index}`, type: 'image', label: `Shot ${index + 1} start frame`, optional: true }} value={shot.image || null} onChange={(image) => edit({ image })} setError={setError} />}
    </div>
  )
}

function RenderedScene({ flow, setStore, storageError, ready }) {
  const { gens } = useApp()
  const engine = engineFor(flow.id)
  const state = useSyncExternalStore(engine.subscribe, () => engine.state)
  const [drafts, setDrafts] = useState({})
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const shots = flow.nodes.filter((node) => node.type === 'model' && node.data.cinemaShot)
  const stitch = flow.nodes.find((node) => node.type === 'stitch')
  const busy = working || engine.isRunning() || !ready
  const edited = shots.some((node) => drafts[node.id] && JSON.stringify(drafts[node.id]) !== JSON.stringify(node.data.cinemaShot))

  useEffect(() => {
    const files = shots.flatMap((node) => (state[node.id]?.items || []).filter((item) => item.status === 'done').map((item) => ({
      ...item, id: `${flow.id}:${item.id}:${item.created}`, model: cinemaModel.name, provider: 'comfy', flowId: flow.id, caption: item.prompt,
    })))
    if (files.length) gens.add(files)
  }, [state, flow.id])

  const patch = (id, data) => setStore((store) => ({ ...store, flows: store.flows.map((value) => value.id === flow.id ? {
    ...value, updated: Date.now(), nodes: value.nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, ...data } } : node),
  } : value) }))
  const act = async (action) => {
    setError('')
    setWorking(true)
    try {
      const result = await action()
      if (result?.ok === false) throw new Error(result.reason)
    } catch (value) { setError(value.message) }
    finally { setWorking(false) }
  }
  const replace = (node) => act(async () => {
    const shot = drafts[node.id] || node.data.cinemaShot
    validateCinemaPlan({ title: flow.name, shots: shots.map((value) => value.id === node.id ? shot : value.data.cinemaShot) })
    patch(node.id, { cinemaShot: shot, prompt: cinemaPrompt(shot), duration: shot.duration })
    const result = await engine.rerun(flow, node.id)
    if (result.ok) setDrafts((values) => { const { [node.id]: _, ...rest } = values; return rest })
    return result
  })

  return (
    <div className="cinema-scene">
      <div className="cinema-scene-heading"><h2>{flow.name}</h2><Link className="btn-soft sm" to="/flows" onClick={() => setStore((store) => ({ ...store, current: flow.id }))}>Open saved Flow</Link></div>
      <p className="muted">Review every shot, then Send it to the scene. Rerun replaces only that shot. Stitch the approved clips when you are ready.</p>
      <button type="button" className="btn-soft sm" disabled={busy} onClick={() => act(() => engine.runNew(flow))}>Render missing shots</button>
      <div className="cinema-shots">
        {shots.map((node, index) => {
          const shot = drafts[node.id] || node.data.cinemaShot
          const item = state[node.id]?.items?.find((value) => value.status === 'done')
          const failed = state[node.id]?.items?.find((value) => value.status === 'failed')
          const gate = engine.gate(`${node.id}-approve`)
          const dirty = JSON.stringify(shot) !== JSON.stringify(node.data.cinemaShot)
          return (
            <article className="cinema-shot glass" key={node.id}>
              <div className="cinema-scene-heading"><h3>Shot {index + 1}</h3><span className="muted">{state[node.id]?.running ? 'Rendering' : failed ? 'Render failed' : gate.status === 'sent' ? 'Approved and sent' : item ? 'Ready for review' : 'Not rendered'}</span></div>
              {item && <video aria-label={`Shot ${index + 1} preview`} src={item.url} controls playsInline preload="metadata" />}
              <fieldset disabled={busy} className="cinema-fields">
                <ShotFields shot={shot} index={index} edit={(data) => setDrafts((values) => ({ ...values, [node.id]: { ...shot, ...data } }))} />
              </fieldset>
              {dirty && <p className="muted">Edits await Rerun. The current clip still uses its previous prompt.</p>}
              {failed && <p className="sheet-error" role="alert">{failed.error}</p>}
              <div className="cinema-actions">
                <button type="button" className="btn-soft sm" disabled={busy} onClick={() => replace(node)}>Rerun shot {index + 1} · ≈{money(cinemaCost([shot]))}</button>
                <button type="button" className="btn-blue sm" disabled={busy || dirty || gate.status !== 'reviewing'} onClick={() => act(() => engine.send(flow, `${node.id}-approve`))}>Approve and Send shot {index + 1}</button>
              </div>
            </article>
          )
        })}
      </div>
      <section className="cinema-assembly glass" aria-label="Scene assembly">
        <h2>Assemble your scene</h2>
        {edited && <p className="muted">Rerun your edited shots before stitching or exporting.</p>}
        <FlowCtx.Provider value={{ flow, engine, state, act: { rerun: (id) => act(() => engine.rerun(flow, id)) } }}>
          <StitchPanel key={flow.id} node={stitch} patch={patch} disabled={busy || edited} />
        </FlowCtx.Provider>
      </section>
      {(error || storageError) && <p className="sheet-error" role="alert">{error || storageError}</p>}
    </div>
  )
}

export default function CinemaScene({ storageKey, initialIdea = '' }) {
  const [draft, setDraft] = useStored(storageKey, { idea: initialIdea || cinemaExample, plan: null, flowId: null })
  const { store, setStore, ready, error: storageError } = useFlowStorage()
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const request = useRef(null)
  const flow = store.flows.find((value) => value.id === draft.flowId)
  let planError = ''
  if (draft.plan) { try { validateCinemaPlan(draft.plan) } catch (value) { planError = value.message } }

  const plan = async () => {
    setWorking(true)
    setError('')
    try {
      if (!request.current || request.current.note !== draft.idea) request.current = { instructions: cinemaInstructions, note: draft.idea, target: 'LTX-2.5 cinematic shot plan as JSON', promptOnly: false, idempotencyKey: crypto.randomUUID() }
      const response = await writePrompt(request.current)
      request.current = null
      const result = validateCinemaPlan(response)
      setDraft((value) => ({ ...value, plan: result, flowId: null }))
    } catch (value) {
      if (!keepRequestKey(value)) request.current = null
      setError(value.message)
    } finally { setWorking(false) }
  }
  const loadExample = () => {
    request.current = null
    setError('')
    setDraft({ idea: cinemaExample, plan: validateCinemaPlan(cinemaExamplePlan), flowId: null })
  }
  const generate = async () => {
    setWorking(true)
    setError('')
    try {
      const next = cinemaFlow(draft.plan, { idea: draft.idea })
      await openFlow(next)
      setDraft((value) => ({ ...value, flowId: next.id }))
      await engineFor(next.id).runNew(next)
    } catch (value) { setError(value.message) }
    finally { setWorking(false) }
  }
  const edit = (index, data) => setDraft((value) => ({ ...value, plan: { ...value.plan, shots: value.plan.shots.map((shot, at) => at === index ? { ...shot, ...data } : shot) } }))

  return (
    <div className="cinema-journey">
      {!flow && <>
        <section className="cinema-idea cs-composer glass">
          <div className="cinema-scene-heading"><h2>From idea to finished scene</h2><span className="muted">LTX-2.5 on Comfy Cloud</span></div>
          <p className="muted">Plan 2–6 shots, shape each one, then render. Use the prompt writer in Connections or start with the portal example.</p>
          <label htmlFor={`${storageKey}-idea`}>Your cinematic idea</label>
          <div className="cs-write">
            <textarea id={`${storageKey}-idea`} aria-label="Cinematic idea" rows={4} maxLength={4000} value={draft.idea} onChange={(event) => setDraft((value) => ({ ...value, idea: event.target.value }))} />
            <button type="button" className="btn-blue" disabled={working || !draft.idea.trim()} onClick={plan}>{working ? 'Working' : draft.plan ? 'Plan again' : 'Plan shots'}</button>
          </div>
          <button type="button" className="btn-soft sm" disabled={working} onClick={loadExample}>Try the portal effect</button>
          <p className="muted">Planning uses text credits. The example is free to load. Video renders when you click Generate.</p>
        </section>
        {draft.plan && <section className="cinema-plan" aria-label="Editable shot plan">
          <h2>Review your shot plan</h2>
          <label className="cinema-title">Scene title<input aria-label="Scene title" maxLength={100} value={draft.plan.title} disabled={working} onChange={(event) => setDraft((value) => ({ ...value, plan: { ...value.plan, title: event.target.value } }))} /></label>
          <div className="cinema-shots">
            {draft.plan.shots.map((shot, index) => <article className="cinema-shot glass" key={index}>
              <h3>Shot {index + 1}</h3>
              <fieldset disabled={working} className="cinema-fields"><ShotFields shot={shot} index={index} edit={(data) => edit(index, data)} frames setError={setError} /></fieldset>
            </article>)}
          </div>
          <div className="cinema-budget glass">
            <strong>Whole scene · ≈{money(cinemaCost(draft.plan.shots))}</strong>
            <p className="muted">{draft.plan.shots.length} LTX-2.5 clips · {draft.plan.shots.reduce((sum, shot) => sum + shot.duration, 0)} seconds · 16:9. Cloud compute estimate based on about $0.08 per 5-second clip. Planning and retries are extra; Session billing varies. Stitch and export run locally.</p>
            <button type="button" className="btn-blue" disabled={working || !ready || !!planError} onClick={generate}>Generate scene</button>
            {planError && <p className="sheet-error" role="alert">{planError}</p>}
          </div>
        </section>}
      </>}
      {draft.flowId && ready && !flow && <p role="status">This scene's Flow was deleted. Plan again to make a new one.</p>}
      {flow && <>
        <RenderedScene flow={flow} ready={ready} setStore={setStore} storageError={storageError} />
        <button type="button" className="btn-soft sm" disabled={working} onClick={() => setDraft((value) => ({ ...value, plan: null, flowId: null }))}>Plan another scene</button>
      </>}
      {(error || storageError) && <p className="sheet-error" role="alert">{error || storageError}</p>}
      {storageError && <button type="button" className="btn-soft sm" onClick={() => reloadFlows().catch((value) => setError(value.message))}>Reload saved Flows</button>}
    </div>
  )
}
