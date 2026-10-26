import { ArtImage } from '../components/Art.jsx'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { GoButton, NotWired, Section, UseMenu } from '../components/studio/Shell.jsx'
import { TypeArt } from '../components/studio/Art.jsx'
import { IconShuffle, IconCompass, IconHistory } from '../components/studio/icons.jsx'
import { builder, influencerPresets } from '../components/studio/presets.js'
import { useApp } from '../lib/appContext.js'
import { useLibrary, toRef } from '../lib/useLibrary.js'
import { modelsFor } from '../lib/tools.js'
import { presenterFormats } from '../lib/formats/presenters.js'
import { initialValues, missingInputs, visibleInputs } from '../lib/recipes.js'
import FormatReview from '../components/formats/Review.jsx'
import Results from '../components/Results.jsx'
import { motionSeconds } from '../lib/formats/presenterSession.js'

const pickOne = (list) => list[Math.floor(Math.random() * list.length)]
const labelOf = (group, id) => group.options.find((o) => o.id === id)?.label
const summaryOf = (group, value) => {
  if (group.multi) return value?.length ? value.map((id) => labelOf(group, id)).join(', ') : null
  return value ? labelOf(group, value) : null
}
const shuffle = () => Object.fromEntries(builder.map((g) => {
  if (!g.multi) return [g.id, pickOne(g.options).id]
  const n = Math.floor(Math.random() * 3)
  return [g.id, [...g.options].sort(() => Math.random() - 0.5).slice(0, n).map((o) => o.id)]
}))
const runsOnImage = modelsFor('image').find((m) => m.id === 'z-image-turbo')?.name || 'open weights'
const ugcFormats = presenterFormats.filter((format) => format.id.startsWith('ugc-'))
const motionFormat = presenterFormats.find((format) => format.id === 'influencer-motion')

function Choices({ group, value, onChange }) {
  const multi = !!group.multi
  const on = (id) => (multi ? (value || []).includes(id) : value === id)
  const flip = (id) => {
    if (!multi) return onChange(value === id ? null : id)
    const cur = value || []
    onChange(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])
  }
  if (group.kind === 'type') {
    return (
      <div className="inf-types" role="group" aria-label={group.label}>
        {group.options.map((o, i) => (
          <button key={o.id} type="button" aria-pressed={on(o.id)} className={`inf-type${on(o.id) ? ' on' : ''}`} style={{ '--i': Math.min(i, 12) }} onClick={() => flip(o.id)}>
            <TypeArt kind={o.id} />
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    )
  }
  if (group.kind === 'swatch') {
    return (
      <div className="inf-swatches" role="group" aria-label={group.label}>
        {group.options.map((o) => (
          <button key={o.id} type="button" aria-pressed={on(o.id)} className={`inf-swatch${on(o.id) ? ' on' : ''}`} onClick={() => flip(o.id)}>
            <b style={{ background: o.color }} />
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    )
  }
  return (
    <div className="pills" role="group" aria-label={group.label}>
      {group.options.map((o) => (
        <button key={o.id} type="button" aria-pressed={on(o.id)} className={on(o.id) ? 'on' : ''} onClick={() => flip(o.id)}>{o.label}</button>
      ))}
    </div>
  )
}

function Builder({ picks, setPicks, open, setOpen }) {
  const toggle = (id) => setOpen((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))
  return (
    <div className="inf-build">
      <p className="sa-hint">Design a generated fictional character. Use a saved fictional presenter in Motion or Creator video.</p>
      {builder.map((g) => {
        const value = picks[g.id]
        const set = summaryOf(g, value)
        return (
          <Section key={g.id} title={g.label} count={g.options.length} summary={set} open={open.includes(g.id)} onToggle={() => toggle(g.id)}>
            <Choices group={g} value={value} onChange={(v) => setPicks((p) => ({ ...p, [g.id]: v }))} />
            {set && <button type="button" className="link-btn inf-clear" onClick={() => setPicks((p) => ({ ...p, [g.id]: g.multi ? [] : null }))}>Clear</button>}
          </Section>
        )
      })}
    </div>
  )
}

function PresenterFields({ format, values, setValues, setError }) {
  return <div className="inf-build inf-motion">
    <p className="sa-hint">{format.output}</p>
    {format.id === 'influencer-motion' && values.video?.duration && <p className="sheet-note" role="status">Output length: {motionSeconds(values.video).toFixed(2)} seconds at 16 fps. Original audio is dropped.</p>}
    {visibleInputs(format, values).map((input) => <Field key={input.id} input={input} value={values[input.id]}
      onChange={(value) => setValues((current) => ({ ...current, [input.id]: value }))} setError={setError} />)}
  </div>
}

function Fan({ items }) {
  return (
    <div className="inf-fan" aria-hidden="true">
      {items.slice(0, 5).map((c, i) => (
        <span key={i} className="inf-fan-card" style={{ '--n': i - 2, background: c.cover }}>
          {c.img ? <img src={c.img} alt="" /> : <><TypeArt kind={c.type} /><ArtImage id={['character-scene', 'face-swap', 'headshot', 'look-phone-flash', 'human-video'][i]} /></>}
        </span>
      ))}
    </div>
  )
}

function Explore({ onRecreate }) {
  const lib = useLibrary()
  const { openFormat } = useApp()
  const [feed, setFeed] = useState('mine')
  const fan = [
    ...lib.characters.filter((c) => c.images?.[0]).map((c) => ({ img: c.images[0] })),
    ...influencerPresets.map((p) => ({ cover: p.cover, type: p.picks.type })),
  ]
  const uses = (item) => {
    const character = toRef('character', item)
    return [
      { label: 'AI influencer post', note: 'A set of photos to post', onClick: () => openFormat('influencer-post', { character }) },
      { label: 'Influencer motion', note: 'Perform a reference clip', onClick: () => openFormat('influencer-motion', { character }) },
      ...ugcFormats.map((format) => ({ label: format.name, onClick: () => openFormat(format.id, { character }) })),
      { label: 'Character in any scene', onClick: () => openFormat('character-scene', { character }) },
    ]
  }
  return (
    <>
      <div className="inf-hero">
        <Fan items={fan} />
        <h2 className="rise">A face to build a following on</h2>
        <p className="rise" style={{ '--d': 'calc(2 * var(--stagger))' }}>Design a fictional character with the menus, or use a saved Library presenter for a reference motion clip or a creator video.</p>
      </div>
      <div className="inf-feed-tabs">
        <Segmented value={feed} onChange={setFeed} options={[{ value: 'mine', label: 'Your influencers' }, { value: 'presets', label: 'Presets' }]} />
      </div>
      {feed === 'mine' && (
        lib.ready && !lib.characters.length ? (
          <div className="empty">
            <p>No influencers yet. Save a generated fictional character in Library to use it in videos.</p>
            <Link className="btn-blue" to="/library?tab=characters">Open character Library</Link>
          </div>
        ) : (
          <div className="inf-grid">
            {lib.characters.map((c, i) => (
              <div key={c.id} className="inf-card" style={{ '--i': Math.min(i, 12) }}>
                <span className="inf-card-cover">{c.images?.[0] ? <img src={c.images[0]} alt="" /> : <b>{c.name?.[0]}</b>}</span>
                <span className="inf-card-foot">
                  <strong>{c.name}</strong>
                  <UseMenu items={uses(c)} />
                </span>
              </div>
            ))}
          </div>
        )
      )}
      {feed === 'presets' && (
        <div className="inf-grid">
          {influencerPresets.map((p, i) => (
            <div key={p.id} className="inf-card" style={{ '--i': Math.min(i, 12) }}>
              <span className="inf-card-cover" style={{ background: p.cover }}><TypeArt kind={p.picks.type} /><ArtImage id={p.art} /></span>
              <span className="inf-card-foot">
                <strong>{p.name}</strong>
                <button type="button" className="btn-soft xs" onClick={() => onRecreate(p)}>Recreate</button>
              </span>
              <small className="inf-card-tags">
                {builder.filter((g) => p.picks[g.id] && !g.multi && g.id !== 'type').slice(0, 3).map((g) => labelOf(g, p.picks[g.id])).join(', ')}
              </small>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default function Influencer() {
  const [tab, setTab] = useState('create')
  const [main, setMain] = useState('explore')
  const [picks, setPicks] = useState({})
  const [open, setOpen] = useState(['type'])
  const { gens } = useApp()
  const [ugcId, setUgcId] = useState(ugcFormats[0].id)
  const [valuesById, setValuesById] = useState({})
  const [session, setSession] = useState(null)
  const [running, setRunning] = useState(false)
  const [engineState, setEngineState] = useState({})
  const [sessionAction, setSessionAction] = useState(null)
  const operation = useRef(false)
  const locked = running || Object.values(engineState).some((state) => state.running > 0)
  useEffect(() => {
    if (!session) { setEngineState({}); return }
    const sync = () => setEngineState(session.engine.state)
    sync()
    return session.engine.subscribe(sync)
  }, [session])
  const [error, setError] = useState(null)
  const format = tab === 'motion' ? motionFormat : ugcFormats.find((item) => item.id === ugcId)
  const values = valuesById[format.id] || initialValues(format)
  const missing = missingInputs(format, values)
  const setValues = (update) => {
    if (operation.current || session?.engine.isRunning()) return
    setSession(null)
    setSessionAction(null)
    setValuesById((current) => ({ ...current, [format.id]: update(current[format.id] || initialValues(format)) }))
  }
  const changeTab = (value) => { if (operation.current || locked || session?.engine.isRunning()) return; setTab(value); setSession(null); setSessionAction(null); setError(null) }
  const generate = async () => {
    if (operation.current || locked || session?.engine.isRunning() || missing.length) return
    operation.current = true
    setRunning(true)
    setMain('history')
    setError(null)
    setSessionAction(null)
    try {
      if (session) await session.resume()
      else await gens.generateFormat(format, values, { onSession: setSession })
    } catch (error) {
      setError(error.message)
      if (error.runAsSession) setSessionAction(() => error.runAsSession)
    } finally { operation.current = false; setRunning(false) }
  }
  const currentScript = engineState.script?.items?.find((item) => item.status === 'done')?.text
  const history = gens.items.filter((item) => presenterFormats.some((format) => format.id === item.formatId)).map((item) => (
    item.kind === 'video' && item.formatRunId === session?.formatRunId && currentScript && item.prompt !== currentScript
      ? { ...item, caption: `${item.caption} · Older script` } : item
  ))
  const filled = builder.filter((g) => (g.multi ? picks[g.id]?.length : picks[g.id])).length

  const recreate = (preset) => {
    setPicks(preset.picks)
    changeTab('create')
    setOpen(['type'])
  }

  return (
    <main className="inf">
      <aside className="inf-panel glass" aria-label="Build an influencer">
        <div className="inf-title">
          <small>Build a character with</small>
          <h1>Influencer studio</h1>
        </div>
        <Segmented value={tab} onChange={changeTab} className="inf-seg"
          options={[{ value: 'create', label: 'Create influencer' }, { value: 'motion', label: 'Motion' }, { value: 'ugc', label: 'Creator video' }]} />
        <div className="inf-scroll" key={tab}>
          {tab === 'create' ? <Builder picks={picks} setPicks={setPicks} open={open} setOpen={setOpen} /> : <>
            {tab === 'ugc' && <div className="field">
              <label htmlFor="presenter-format">Video format</label>
              <select id="presenter-format" value={ugcId} disabled={locked} onChange={(event) => { if (operation.current || session?.engine.isRunning()) return; setUgcId(event.target.value); setSession(null); setSessionAction(null); setError(null) }}>
                {ugcFormats.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>}
            <fieldset disabled={locked} className="inf-inputs">
              <PresenterFields format={format} values={values} setValues={setValues} setError={setError} />
            </fieldset>
            {session && <FormatReview session={session} onActivityChange={(active) => { operation.current = active; setRunning(active) }} />}
            {sessionAction && <button type="button" className="btn-soft" disabled={locked} onClick={async () => {
              try { await sessionAction(); setError(null); setSessionAction(null) } catch (error) { setError(error.message) }
            }}>Run as a Session</button>}
            {error && <p className="sheet-error" role="alert">{error}</p>}
          </>}
        </div>
        <div className="inf-foot">
          <div className="inf-go">
            {tab === 'create' && (
              <button type="button" className="inf-shuffle" aria-label="Shuffle every group" title="Shuffle every group" onClick={() => setPicks(shuffle())}>
                <IconShuffle />
              </button>
            )}
            {tab === 'create' ? <GoButton className="inf-generate" /> : <button type="button" className="btn-blue inf-generate" disabled={locked || missing.length > 0} onClick={generate}>
              {locked ? 'Working' : tab === 'ugc' ? 'Prepare video' : 'Generate motion'}
            </button>}
          </div>
          <p className="inf-meta">
            {tab === 'create' && <span>{filled} of {builder.length} groups set{filled < builder.length ? ', the rest left to chance' : ''}.</span>}
            {tab === 'create' ? <NotWired runsOn={runsOnImage} /> : <span>{missing.length ? `Still needed: ${missing.map((input) => input.label).join(', ')}` : format.runsOn}</span>}
          </p>
        </div>
      </aside>
      <section className="inf-main glass">
        <div className="inf-main-tabs" role="group" aria-label="Show">
          <button type="button" aria-pressed={main === 'explore'} className={main === 'explore' ? 'on' : ''} onClick={() => setMain('explore')}><IconCompass />Explore</button>
          <button type="button" aria-pressed={main === 'history'} className={main === 'history' ? 'on' : ''} onClick={() => setMain('history')}><IconHistory />History</button>
        </div>
        <div key={main} className="inf-main-body">
          {main === 'explore' ? <Explore onRecreate={recreate} /> : (
            history.length ? <>
              <p className="sheet-note">Presenter stills and finished videos save to Library as each step finishes.</p>
              {history.filter((item) => item.failed).map((item) => <p key={item.id} className="sheet-error" role="alert">{item.failed}</p>)}
              <Results items={history.filter((item) => !item.failed)} />
            </> : <div className="empty"><p>Your presenter stills and motion clips will appear here and in Library.</p></div>
          )}
        </div>
      </section>
    </main>
  )
}
