import { useState } from 'react'
import { Link } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { GoButton, NotWired, Section, UseMenu } from '../components/studio/Shell.jsx'
import { TypeArt } from '../components/studio/Art.jsx'
import { IconShuffle, IconCompass, IconHistory } from '../components/studio/icons.jsx'
import { builder, influencerPresets, motionModes, motionResolutions } from '../components/studio/presets.js'
import { useApp } from '../lib/appContext.js'
import { useLibrary, toRef } from '../lib/useLibrary.js'
import { modelsFor } from '../lib/tools.js'

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
const runsOnMotion = modelsFor('video').find((m) => m.id === 'wan-animate-2')?.name || 'open weights'

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

function Builder({ picks, setPicks, open, setOpen, photo, setPhoto }) {
  const toggle = (id) => setOpen((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))
  return (
    <div className="inf-build">
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
      <Field input={{ id: 'style', type: 'text', label: 'Style', optional: true, placeholder: 'Soft daylight, handheld phone feel' }} value={motion.style} onChange={set('style')} />
      <Field input={{ id: 'prompt', type: 'longtext', label: 'Prompt', optional: true, placeholder: 'Anything to add about the scene or the moves' }} value={motion.prompt} onChange={set('prompt')} />
      <div className="field">
        <label>Resolution</label>
        <div className="pills" role="group" aria-label="Resolution">
          {motionResolutions.map((r) => (
            <button key={r} type="button" aria-pressed={motion.resolution === r} className={motion.resolution === r ? 'on' : ''} onClick={() => set('resolution')(r)}>{r}</button>
          ))}
        </div>
      </div>
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
      { label: 'AI influencer video', note: 'Talks to camera', onClick: () => openFormat('ai-influencer-video', { character }) },
      { label: 'Character in any scene', onClick: () => openFormat('character-scene', { character }) },
    ]
  }
  return (
    <>
      <div className="inf-hero">
        <Fan items={fan} />
        <h2 className="rise">A face to build a following on</h2>
        <p className="rise" style={{ '--d': 'calc(2 * var(--stagger))' }}>Pick the face, body and style from the menus, or shuffle them all. Each run gives a close-up portrait and a full-body shot.</p>
      </div>
      <div className="inf-feed-tabs">
        <Segmented value={feed} onChange={setFeed} options={[{ value: 'mine', label: 'Your influencers' }, { value: 'presets', label: 'Presets' }]} />
      </div>
      {feed === 'mine' && (
        lib.ready && !lib.characters.length ? (
          <div className="empty">
            <p>No influencers yet. Characters you save show up here, ready to post and film.</p>
            <Link className="btn-blue" to="/character">Create a character</Link>
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

const blankMotion = { who: null, mode: 'transfer', video: null, style: '', prompt: '', resolution: '720p' }

export default function Influencer() {
  const [tab, setTab] = useState('create')
  const [main, setMain] = useState('explore')
  const [picks, setPicks] = useState({})
  const [open, setOpen] = useState(['type'])
  const [photo, setPhoto] = useState(null)
  const [motion, setMotion] = useState(blankMotion)
  const filled = builder.filter((g) => (g.multi ? picks[g.id]?.length : picks[g.id])).length

  const recreate = (preset) => {
    setPicks(preset.picks)
    setTab('create')
    setOpen(['type'])
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
            ? <Builder picks={picks} setPicks={setPicks} open={open} setOpen={setOpen} photo={photo} setPhoto={setPhoto} />
            : <MotionTab motion={motion} setMotion={setMotion} />}
        </div>
        <div className="inf-foot">
          <div className="inf-go">
            {tab === 'create' && (
              <button type="button" className="inf-shuffle" aria-label="Shuffle every group" title="Shuffle every group" onClick={() => setPicks(shuffle())}>
                <IconShuffle />
              </button>
            )}
            <GoButton className="inf-generate" />
          </div>
          <p className="inf-meta">
            {tab === 'create' && <span>{filled} of {builder.length} groups set{filled < builder.length ? ', the rest left to chance' : ''}.</span>}
            <NotWired runsOn={tab === 'create' ? runsOnImage : runsOnMotion} />
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
            <div className="empty">
              <p>Influencers you generate show up here with the settings that made them. Generating is not wired yet, so this stays empty for now.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
