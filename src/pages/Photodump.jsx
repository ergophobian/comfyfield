import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from '../components/formats/Fields.jsx'
import Results from '../components/Results.jsx'
import { useApp } from '../lib/appContext.js'
import { photodumpFormat, photodumpScenes } from '../lib/formats/photodumpReframe.js'
import { photodumpSets, setSizes, photoRatios, qualities } from '../components/studio/presets.js'

const steps = ['Pick a set', 'Pick a character', 'Check and generate']

function Pills({ list, value, onChange, label, unit, labels }) {
  return (
    <div className="pills" role="group" aria-label={label}>
      {list.map((x) => (
        <button key={x} type="button" aria-pressed={value === x} className={value === x ? 'on' : ''} onClick={() => onChange(x)}>{unit ? `${x} ${unit}` : labels?.[x] || x}</button>
      ))}
    </div>
  )
}

function SetCard({ set, on, onPick, i }) {
  return (
    <button type="button" aria-pressed={on} className={`pd-set${on ? ' on' : ''}`} style={{ '--i': Math.min(i, 12) }} onClick={onPick}>
      <span className="pd-strip">
        {set.scenes.slice(0, 4).map((s, k) => <span key={s} style={{ background: set.cover, '--k': k }}><em>{s}</em></span>)}
      </span>
      <span className="pd-set-text">
        <strong>{set.name}</strong>
        <small>{set.blurb}</small>
      </span>
    </button>
  )
}

export default function Photodump() {
  const { gens } = useApp()
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('photo')
  const [references, setReferences] = useState({})
  const [step, setStep] = useState(0)
  const [setId, setSetId] = useState(photodumpSets[0].id)
  const [character, setCharacter] = useState(null)
  const [size, setSize] = useState(15)
  const [ratio, setRatio] = useState('3:4')
  const [quality, setQuality] = useState('2k')
  const set = photodumpSets.find((s) => s.id === setId)
  const shots = photodumpScenes(set, size)
  const images = source === 'photo' ? references : Object.fromEntries((character?.images || []).slice(0, 3).map((url, i) => [i ? `image${i + 1}` : 'image', { url, name: character.name }]))
  const items = gens.items.filter((item) => item.formatId === 'photodump' && !item.failed)
  const run = async () => {
    if (running || !images.image?.url) return
    setRunning(true)
    setError(null)
    try { await gens.generateFormat(photodumpFormat(setId, size), { ...images, ratio, quality }) }
    catch (e) { setError(e.message) }
    finally { setRunning(false) }
  }
  const canNext = step === 0 ? !!set : step === 1 ? !!images.image?.url : false

  return (
    <main className="page pd">
      <section className="pd-card glass rise" aria-label="Photodump">
        <header className="pd-head">
          <span className="pd-thumb" aria-hidden="true">
            {photodumpSets.slice(0, 4).map((s) => <i key={s.id} style={{ background: s.cover }} />)}
          </span>
          <div>
            <span className="pd-tag">Photodump</span>
            <h1>Many scenes, one star</h1>
            <p>Pick a set and a character. One click shoots the whole dump.</p>
          </div>
        </header>

        <div className="pd-body" key={step}>
          {step === 0 && (
            <div className="pd-sets" role="group" aria-label="Sets">
              {photodumpSets.map((s, i) => <SetCard key={s.id} set={s} i={i} on={s.id === setId} onPick={() => setSetId(s.id)} />)}
            </div>
          )}
          {step === 1 && (
            <div className="pd-step">
              <Pills label="Reference source" list={['photo', 'character']} value={source} onChange={setSource} labels={{ photo: 'Reference photos', character: 'Saved character' }} />
              {source === 'character'
                ? <Field input={{ id: 'character', type: 'character', label: 'Saved character' }} value={character} onChange={setCharacter} setError={setError} />
                : ['image', 'image2', 'image3'].map((id, i) => <Field key={id} input={{ id, type: 'image', label: i ? `Reference ${i + 1}` : 'Character reference', optional: i > 0 }} value={references[id]} onChange={(value) => setReferences((old) => ({ ...old, [id]: value }))} setError={setError} />)}
              <p className="sa-hint">Use up to three photos of the same person or character. Saved characters supply their first three photos. This uses reference images without training. <Link to="/character">Your characters</Link></p>
            </div>
          )}
          {step === 2 && (
            <div className="pd-step">
              <div className="pd-summary">
                <span className="pick-img">{images.image?.url && <img src={images.image.url} alt="Character reference" />}</span>
                <div>
                  <strong>{source === 'character' ? character?.name : images.image?.name} in {set.name}</strong>
                  <span className="muted">{size} photos, {ratio}, {quality}</span>
                </div>
              </div>
              <div className="field"><label>Set size</label><Pills label="Set size" list={setSizes} value={size} onChange={setSize} unit="photos" /></div>
              <div className="field"><label>Aspect ratio</label><Pills label="Aspect ratio" list={photoRatios} value={ratio} onChange={setRatio} /></div>
              <div className="field"><label>Quality</label><Pills label="Quality" list={qualities} value={quality} onChange={setQuality} /></div>
            </div>
          )}
        </div>

        <footer className="pd-foot">
          <ol className="pd-steps">
            {steps.map((s, k) => (
              <li key={s} className={k === step ? 'on' : k < step ? 'done' : ''}>
                <button type="button" disabled={k > step} aria-current={k === step ? 'step' : undefined} onClick={() => setStep(k)}>
                  <b>{k + 1}</b><span>{s}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="pd-acts">
            {step > 0 && <button type="button" className="btn-soft" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 2
              ? <button type="button" className="btn-blue sm" disabled={!canNext} onClick={() => setStep(step + 1)}>{step === 0 ? 'Use this set' : 'Use this character'}</button>
              : <button type="button" className="btn-blue sm" disabled={running || !images.image?.url} onClick={run}>{running ? 'Generating photos…' : `Generate ${size} photos`}</button>}
          </div>
        </footer>
        {error && <p className="pd-note" role="alert">{error} Completed photos remain below and in the <Link to="/assets">Library</Link>.</p>}
        {step === 2 && <p className="pd-note">Qwen edit 2511 · {size} separate generations · up to {quality} · untested live</p>}
      </section>

      <div className="studio-sub">
        <h2>{set.name}</h2>
        <span className="muted">The {size} planned shots. Each generated photo also saves to the Library.</span>
      </div>
      {items.length > 0 && <section aria-label="Generated photos"><h2>Generated photos</h2><Results items={items} /></section>}
      <div className="pd-results" style={{ '--ar': ratio.replace(':', ' / ') }}>
        {shots.map((s, i) => (
          <div key={i} className="pd-slot" style={{ '--i': Math.min(i, 12) }}>
            <b>{i + 1}</b>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
