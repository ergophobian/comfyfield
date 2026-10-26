import { PageArt, ArtImage } from '../components/Art.jsx'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import { useApp } from '../lib/appContext.js'
import { Field } from '../components/formats/Fields.jsx'
import { allFormats, formatById, isWired } from '../lib/formats/index.js'

const clipInput = { id: 'clip', type: 'video', label: 'Your clip' }
const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const play = (e, on) => {
  const v = e.currentTarget.querySelector('video')
  if (!v || (on && calm())) return
  if (on) v.play().catch(() => {})
  else { v.pause(); v.currentTime = 0 }
}

// The shared sheet receives the clip, including its trim metadata.
const carry = (look, clip) => {
  const input = look.inputs.find((i) => i.type === 'video')
  return input && clip ? { [input.id]: clip } : {}
}

export default function MixedMedia() {
  const { openFormat } = useApp()
  const looks = useMemo(() => allFormats.filter((f) => f.category === 'mixed'), [])
  const groups = [...new Set(looks.map((f) => f.group).filter(Boolean))]
  const [tab, setTab] = useState('all')
  const [clip, setClip] = useState(null)
  const [error, setError] = useState(null)
  const shown = tab === 'all' ? looks : looks.filter((f) => f.group === tab)
  const restyle = formatById('restyle-video')

  const tabs = [
    { value: 'all', label: <>All looks<em>{looks.length}</em></> },
    ...groups.map((g) => ({ value: g, label: <>{g}<em>{looks.filter((f) => f.group === g).length}</em></> })),
  ]

  return (
    <main className="mixed-page">
      <aside className="mixed-panel glass rise">
        <h1>Mixed media</h1>
        <p>Restyle a short clip with a hand-made look. Upload it, then pick a look.</p>
        <Field input={clipInput} value={clip} onChange={(v) => { setClip(v); setError(null) }} setError={setError} />
        {error && <p className="sheet-error">{error}</p>}
        <p className="sheet-note">{clip ? 'Now pick a look. It opens with your clip attached.' : 'Each look processes up to 81 sampled frames. Check its effective range before Run.'}</p>
      </aside>

      <section className="mixed-looks">
        <PageArt id="mixed-media" />
        {groups.length > 1 && (
          <div className="apps-bar rise">
            <div className="apps-tabs"><Segmented options={tabs} value={tab} onChange={setTab} /></div>
          </div>
        )}
        {shown.length > 0 ? (
          <div className="look-grid" key={tab}>
            {shown.map((f, i) => (
              <button key={f.id} type="button" onClick={() => openFormat(f, carry(f, clip))} disabled={!isWired(f)} className="look rise"
                style={{ background: f.cover, '--d': `calc(${Math.min(i, 12)} * var(--stagger))` }}
                onPointerEnter={(e) => play(e, true)} onPointerLeave={(e) => play(e, false)} onFocus={(e) => play(e, true)} onBlur={(e) => play(e, false)}>
                <ArtImage id={f.id} alt={`${f.name} example`} />
                {f.preview && <video src={f.preview} muted loop playsInline preload="none" />}
                {!isWired(f) && <em className="look-tag">Not wired yet</em>}
                <span><strong>{f.name}</strong><small>{f.blurb}</small></span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty glass rise">
            <strong>No looks yet.</strong>
            {restyle && (
              <>
                <p>{restyle.name} can redraw your clip in a new style in the meantime.</p>
                <Link className="btn-blue sm" to={`/apps/${restyle.id}`} state={{ values: carry(restyle, clip) }}>Open {restyle.name}</Link>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
