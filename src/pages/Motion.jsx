import { ArtImage } from '../components/Art.jsx'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import { AppCard } from '../components/apps/AppCard.jsx'
import { presetGroups } from '../components/apps/data.js'
import { IconArrow, IconClose } from '../components/Icons.jsx'
import { formatById, formats } from '../lib/formats/index.js'

const MIX = 'cam-mix'

// The mix format names each move as a choice option. A preset can join a mix when both choices offer it.
const optionFor = (input, f) => input?.options.find((o) => o.id === f.id || `cam-${o.id}` === f.id
  || o.label.toLowerCase() === f.name.toLowerCase())

export default function Motion() {
  const presets = useMemo(() => formats.filter((f) => f.category === 'camera'), [])
  const groups = useMemo(() => presetGroups(presets), [presets])
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = groups.some((g) => g.name === params.get('group')) ? params.get('group') : 'all'
  const list = tab === 'all' ? presets : groups.find((g) => g.name === tab).list

  const mix = formatById(MIX)
  const [first, then] = (mix?.inputs || []).filter((i) => i.type === 'choice')
  const canMix = (f) => f.id !== MIX && Boolean(optionFor(first, f) && optionFor(then, f))
  const mixable = first && then ? presets.filter(canMix).length : 0
  const [picking, setPicking] = useState(false)
  // Toggling pick mode swaps links for toggles; skip the entrance animation so the grid does not replay it.
  const [touched, setTouched] = useState(false)
  const [picked, setPicked] = useState([])
  const [a, b] = picked.map(formatById)

  const togglePicking = () => { setTouched(true); setPicking((p) => !p) }
  // A third pick replaces the second, so the first move stays put.
  const toggle = (f) => setPicked((p) => (p.includes(f.id) ? p.filter((x) => x !== f.id) : p.length < 2 ? [...p, f.id] : [p[0], f.id]))
  const openMix = () => navigate(`/motion/${MIX}?${new URLSearchParams({ [first.id]: optionFor(first, a).id, [then.id]: optionFor(then, b).id })}`)

  const tabs = [
    { value: 'all', label: <>All<em>{presets.length}</em></> },
    ...groups.map((g) => ({ value: g.name, label: <>{g.name}<em>{g.list.length}</em></> })),
  ]
  const slot = (f, label, i) => (f ? (
    <button type="button" className="mix-slot has" onClick={() => setPicked((p) => p.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>
      <i style={{ background: f.cover }}><ArtImage id={f.id} alt={`${f.name} example`} /></i>
      <span>{f.name}</span>
      <IconClose />
    </button>
  ) : (
    <span className="mix-slot"><i /><span>{label}</span></span>
  ))

  return (
    <main className="page apps-page">
      <div className="page-head rise">
        <h1>Motion presets</h1>
        <p>Camera moves and effects for any photo. Pick a preset, add your photo and generate.</p>
      </div>

      {(groups.length > 1 || groups[0]?.list.length < presets.length) && (
        <div className="apps-bar rise">
          <div className="apps-tabs">
            <Segmented options={tabs} value={tab} onChange={(v) => { setTouched(false); setParams(v === 'all' ? {} : { group: v }) }} />
          </div>
        </div>
      )}

      {mixable > 1 && (
        <section className={`mix glass rise${picking ? ' on' : ''}`} aria-label="Mix two presets">
          <div className="mix-text">
            <strong>Mix two presets</strong>
            <small>{picking ? `Pick two on the grid. ${mixable} of ${presets.length} presets can mix so far.` : 'Chain two moves into one continuous shot.'}</small>
          </div>
          {picking && (
            <div className="mix-slots">
              {slot(a, first.label, 0)}
              <span className="mix-plus" aria-hidden="true">+</span>
              {slot(b, then.label, 1)}
            </div>
          )}
          <div className="mix-acts">
            <button type="button" className={`switch${picking ? ' on' : ''}`} aria-pressed={picking} onClick={togglePicking}><i />Pick to mix</button>
            {picking && <button type="button" className="btn-blue sm" disabled={!b} onClick={openMix}>Open the mix<IconArrow /></button>}
          </div>
        </section>
      )}

      {list.length > 0 ? (
        <div className="recipe-grid app-grid" key={tab}>
          {list.map((f, i) => (picking
            ? <AppCard key={f.id} format={f} i={i} rise={false} picked={picked.includes(f.id)} disabled={!canMix(f)} onPick={toggle} />
            : <AppCard key={f.id} format={f} i={i} rise={!touched} to={`/motion/${f.id}`} />))}
        </div>
      ) : (
        <div className="empty glass rise">No motion presets yet.</div>
      )}
    </main>
  )
}
