import { useState } from 'react'
import { Link } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import Results from '../components/Results.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { Section, UseMenu } from '../components/studio/Shell.jsx'
import { TypeArt } from '../components/studio/Art.jsx'
import { IconShuffle, IconCompass, IconHistory } from '../components/studio/icons.jsx'
import { builder, influencerPresets, motionModes, personaText } from '../components/studio/presets.js'
import { useApp } from '../lib/appContext.js'
import { useLibrary } from '../lib/useLibrary.js'
import { characterUses, trendIds } from '../lib/characterUses.js'
import { formatById } from '../lib/formats/index.js'
import { initialValues, missingInputs } from '../lib/recipes.js'

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
const persona = formatById('influencer-persona')
// Motion transfer copies the moves onto the character; the swap puts the character into the clip.
const motionFormats = { transfer: formatById('motion-transfer'), swap: formatById('video-character-swap') }
// What each run of this page can make, so History shows only these.
const madeHere = new Set(['influencer-persona', 'influencer-post', 'ai-influencer-video', 'character-scene', ...trendIds])

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

function Builder({ picks, setPicks, open, setOpen, photo, setPhoto, name, setName }) {
  const toggle = (id) => setOpen((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))
  return (
    <div className="inf-build">
      <Field input={{ id: 'name', type: 'text', label: 'Name', optional: true, placeholder: 'Mara, the rooftop runner' }} value={name} onChange={setName} />
      <div className="inf-photo">
        <Field input={{ id: 'photo', type: 'image', label: 'Your photo', optional: true }} value={photo} onChange={setPhoto} />
        <p className="sa-hint">Keeps your face. Use only your own, or one you have permission to use.</p>
      </div>
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

function MotionTab({ motion, setMotion }) {
  const set = (k) => (v) => setMotion((m) => ({ ...m, [k]: v }))
  return (
    <div className="inf-build inf-motion">
      <Field input={{ id: 'who', type: 'character', label: 'Influencer' }} value={motion.who} onChange={set('who')} />
      <div className="field">
        <label>Mode</label>
        <div className="opt-grid" role="group" aria-label="Mode">
          {motionModes.map((m) => (
            <button key={m.id} type="button" aria-pressed={motion.mode === m.id} className={`opt${motion.mode === m.id ? ' on' : ''}`} onClick={() => set('mode')(m.id)}>
              <strong>{m.label}</strong><small>{m.note}</small>
            </button>
          ))}
        </div>
      </div>
      <Field input={{ id: 'video', type: 'video', label: 'Reference video, 4 to 30s' }} value={motion.video} onChange={set('video')} />
      {motion.mode === 'transfer' && (
        <>
          <Field input={{ id: 'style', type: 'text', label: 'Style', optional: true, placeholder: 'Soft daylight, handheld phone feel' }} value={motion.style} onChange={set('style')} />
          <Field input={{ id: 'prompt', type: 'longtext', label: 'Prompt', optional: true, placeholder: 'Anything to add about the look or the scene' }} value={motion.prompt} onChange={set('prompt')} />
        </>
      )}
    </div>
  )
}

// The values each motion format takes from this tab.
function motionValues(motion) {
  if (motion.mode === 'swap') return { video: motion.video, source: 'character', character: motion.who }
  const image = motion.who?.images?.[0] ? { url: motion.who.images[0], name: motion.who.name } : null
  return { video: motion.video, image, note: [motion.style, motion.prompt].map((x) => x.trim()).filter(Boolean).join('. ') }
}

// Each persona run gives a portrait and a full-body shot; Save keeps both as a character in Assets.
function History({ onSave, saved }) {
  const { gens } = useApp()
  const mine = gens.items.filter((g) => madeHere.has(g.formatId))
  const runs = []
  for (const item of mine.filter((g) => g.formatId === 'influencer-persona')) {
    const run = runs.find((r) => r.id === item.formatRunId)
    if (run) run.items.push(item)
    else runs.push({ id: item.formatRunId, items: [item] })
  }
  const other = mine.filter((g) => g.formatId !== 'influencer-persona' && !g.failed)
  if (!mine.length) {
    return (
      <div className="empty">
        <p>Influencers you generate show up here. Save one to post, film and put into any trend.</p>
      </div>
    )
  }
  return (
    <div className="inf-history">
      {runs.map((run) => {
        // The portrait comes first, as the character's main picture.
        const shown = [...run.items].sort((a, b) => (b.stepId === 'portrait') - (a.stepId === 'portrait'))
        const done = shown.filter((i) => i.url && !i.pending && !i.failed)
        const failed = run.items.find((i) => i.failed)
        const busy = run.items.some((i) => i.pending)
        return (
          <section key={run.id} className="inf-run">
            <Results items={shown.filter((i) => !i.failed)} />
            <div className="inf-run-foot">
              {failed && <p className="plist-note">{failed.failed}</p>}
              {saved[run.id] ? <span className="status ok" role="status">Saved as {saved[run.id]}</span> : (
                <button type="button" className="btn-soft sm" disabled={!done.length || busy} onClick={() => onSave(run.id, done.map((i) => i.url), run.items[0].prompt)}>
                  {busy ? 'Rendering' : 'Save as influencer'}
                </button>
              )}
            </div>
          </section>
        )
      })}
      {other.length > 0 && (
        <>
          <h3 className="inf-history-head">Posts, videos and trends</h3>
          <Results items={other} />
        </>
      )}
    </div>
  )
}

function Fan({ items }) {
  return (
    <div className="inf-fan" aria-hidden="true">
      {items.slice(0, 5).map((c, i) => (
        <span key={i} className="inf-fan-card" style={{ '--n': i - 2, background: c.cover }}>
          {c.img ? <img src={c.img} alt="" /> : <TypeArt kind={c.type} />}
        </span>
      ))}
    </div>
  )
}

// "Bring them into any trend": the formats that put a saved character into a video that already exists.
function Trends({ onMotion }) {
  const lib = useLibrary()
  const { openFormat } = useApp()
  const first = lib.characters.find((c) => c.images?.length)
  const mix = () => {
    const [omni] = first ? characterUses(first, openFormat, ['omni-reference']) : []
    if (omni) omni.onClick()
    else openFormat('omni-reference')
  }
  return (
    <div className="inf-trends rise" style={{ '--d': 'calc(3 * var(--stagger))' }}>
      <strong>Bring them into any trend</strong>
      <div className="inf-trend-acts">
        <button type="button" className="btn-soft sm" onClick={() => onMotion('transfer')}>Copy the moves</button>
        <button type="button" className="btn-soft sm" onClick={() => onMotion('swap')}>Swap into a video</button>
        <button type="button" className="btn-soft sm" onClick={mix}>Mix references</button>
      </div>
    </div>
  )
}

function Explore({ onRecreate, onMotion }) {
  const lib = useLibrary()
  const { openFormat } = useApp()
  const [feed, setFeed] = useState('mine')
  const fan = [
    ...lib.characters.filter((c) => c.images?.[0]).map((c) => ({ img: c.images[0] })),
    ...influencerPresets.map((p) => ({ cover: p.cover, type: p.picks.type })),
  ]
  const uses = (item) => characterUses(item, openFormat, ['influencer-post', 'ai-influencer-video', 'character-scene', ...trendIds])
  return (
    <>
      <div className="inf-hero">
        <Fan items={fan} />
        <h2 className="rise">A face to build a following on</h2>
        <p className="rise" style={{ '--d': 'calc(2 * var(--stagger))' }}>Pick the face, body and style from the menus, or shuffle them all. Each run gives a close-up portrait and a full-body shot.</p>
        <Trends onMotion={onMotion} />
      </div>
      <div className="inf-feed-tabs">
        <Segmented value={feed} onChange={setFeed} options={[{ value: 'mine', label: 'Your influencers' }, { value: 'presets', label: 'Presets' }]} />
      </div>
      {feed === 'mine' && (
        lib.ready && !lib.characters.length ? (
          <div className="empty">
            <p>No influencers yet. Generate one, save it, and it shows up here, ready to post and film.</p>
            <Link className="btn-soft" to="/character">Or make one from your photos</Link>
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
              <span className="inf-card-cover" style={{ background: p.cover }}><TypeArt kind={p.picks.type} /></span>
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

const blankMotion = { who: null, mode: 'transfer', video: null, style: '', prompt: '' }

export default function Influencer() {
  const { gens } = useApp()
  const lib = useLibrary()
  const [tab, setTab] = useState('create')
  const [main, setMain] = useState('explore')
  const [picks, setPicks] = useState({})
  const [open, setOpen] = useState(['type'])
  const [photo, setPhoto] = useState(null)
  const [name, setName] = useState('')
  const [motion, setMotion] = useState(blankMotion)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState({})
  const filled = builder.filter((g) => (g.multi ? picks[g.id]?.length : picks[g.id])).length

  // What Generate runs on the open tab, with the values it sends.
  const format = tab === 'create' ? persona : motionFormats[motion.mode]
  const values = { ...initialValues(format), ...(tab === 'create'
    ? { persona: personaText(picks), start: photo ? 'photo' : 'text', photo }
    : motionValues(motion)) }
  const missing = missingInputs(format, values)
  // The motion tab names its own fields; the format's labels would ask for a "Who performs it".
  const still = tab === 'motion' ? [!motion.who && 'an influencer', !motion.video && 'a reference video'].filter(Boolean) : missing.map((i) => i.label.toLowerCase())

  const recreate = (preset) => {
    setPicks(preset.picks)
    setName(preset.name)
    setTab('create')
    setOpen(['type'])
  }
  const toMotion = (mode) => {
    setMotion((m) => ({ ...m, mode }))
    setTab('motion')
  }

  // A run takes minutes, so Generate only queues it; History shows it rendering.
  const generate = () => {
    if (missing.length) return
    setError('')
    setMain('history')
    gens.generateFormat(format, values).catch((e) => setError(e.message))
  }

  const save = async (runId, images, notes) => {
    const title = name.trim() || `Influencer ${lib.characters.length + 1}`
    setError('')
    try {
      await lib.create('characters', { name: title, notes: notes || personaText(picks), images })
      setSaved((s) => ({ ...s, [runId]: title }))
    } catch (e) { setError(e.message) }
  }

  return (
    <main className="inf">
      <aside className="inf-panel glass" aria-label="Build an influencer">
        <div className="inf-title">
          <small>Build a character with</small>
          <h1>AI influencer</h1>
        </div>
        <Segmented value={tab} onChange={setTab} className="inf-seg"
          options={[{ value: 'create', label: 'Create influencer' }, { value: 'motion', label: 'Motion' }]} />
        <div className="inf-scroll" key={tab}>
          {tab === 'create'
            ? <Builder picks={picks} setPicks={setPicks} open={open} setOpen={setOpen} photo={photo} setPhoto={setPhoto} name={name} setName={setName} />
            : <MotionTab motion={motion} setMotion={setMotion} />}
        </div>
        <div className="inf-foot">
          <div className="inf-go">
            {tab === 'create' && (
              <button type="button" className="inf-shuffle" aria-label="Shuffle every group" title="Shuffle every group" onClick={() => setPicks(shuffle())}>
                <IconShuffle />
              </button>
            )}
            <button type="button" className="btn-blue inf-generate" disabled={missing.length > 0} onClick={generate}>Generate</button>
          </div>
          <p className="inf-meta">
            {tab === 'create' && <span>{filled} of {builder.length} groups set{filled < builder.length ? ', the rest left to chance' : ''}.</span>}
            {still.length > 0 ? <span>Still needed: {still.join(', ')}.</span> : <span>Runs on {format.runsOn}.</span>}
            {error && <span className="inf-error" role="alert">{error}</span>}
          </p>
        </div>
      </aside>
      <section className="inf-main glass">
        <div className="inf-main-tabs" role="group" aria-label="Show">
          <button type="button" aria-pressed={main === 'explore'} className={main === 'explore' ? 'on' : ''} onClick={() => setMain('explore')}><IconCompass />Explore</button>
          <button type="button" aria-pressed={main === 'history'} className={main === 'history' ? 'on' : ''} onClick={() => setMain('history')}><IconHistory />History</button>
        </div>
        <div key={main} className="inf-main-body">
          {main === 'explore' ? <Explore onRecreate={recreate} onMotion={toMotion} /> : <History onSave={save} saved={saved} />}
        </div>
      </section>
    </main>
  )
}
