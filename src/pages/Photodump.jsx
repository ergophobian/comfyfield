import { heroArt, presetArt } from '../lib/formats/art.js'
import { ArtImage } from '../components/Art.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from '../components/formats/Fields.jsx'
import { GoButton, NotWired } from '../components/studio/Shell.jsx'
import { photodumpSets, setSizes, photoRatios, qualities } from '../components/studio/presets.js'
import { formatById } from '../lib/formats/index.js'

const steps = ['Pick a set', 'Pick a character', 'Check and generate']
const runsOn = formatById('influencer-post')?.runsOn || 'open weights'

// A bigger set walks the scene list again, each pass from a fresh angle.
const angles = ['', 'closer in', 'from a new angle', 'from behind']
const scenesFor = (set, n) => Array.from({ length: n }, (_, k) => {
  const pass = Math.floor(k / set.scenes.length)
  const scene = set.scenes[k % set.scenes.length]
  return pass ? `${scene}, ${angles[pass % angles.length] || 'again'}` : scene
})

function Pills({ list, value, onChange, label, unit }) {
  return (
    <div className="pills" role="group" aria-label={label}>
      {list.map((x) => (
        <button key={x} type="button" aria-pressed={value === x} className={value === x ? 'on' : ''} onClick={() => onChange(x)}>{unit ? `${x} ${unit}` : x}</button>
      ))}
    </div>
  )
}

function SetCard({ set, on, onPick, i }) {
  return (
    <button type="button" aria-pressed={on} className={`pd-set${on ? ' on' : ''}`} style={{ '--i': Math.min(i, 12) }} onClick={onPick}>
      <span className="pd-strip">
        {set.scenes.slice(0, 4).map((s, k) => <span key={s} style={{ background: set.cover, '--k': k }}><ArtImage src={presetArt('photodump', set.id)} /><em>{s}</em></span>)}
      </span>
      <span className="pd-set-text">
        <strong>{set.name}</strong>
        <small>{set.blurb}</small>
      </span>
    </button>
  )
}

export default function Photodump() {
  const [step, setStep] = useState(0)
  const [setId, setSetId] = useState(photodumpSets[0].id)
  const [character, setCharacter] = useState(null)
  const [size, setSize] = useState(15)
  const [ratio, setRatio] = useState('3:4')
  const [quality, setQuality] = useState('2k')
  const set = photodumpSets.find((s) => s.id === setId)
  const shots = scenesFor(set, size)
  const canNext = step === 0 ? !!set : step === 1 ? !!character : false

  return (
    <main className="page pd">
      <section className="pd-card glass rise" aria-label="Photodump">
        <header className="pd-head">
          <span className="pd-thumb" aria-hidden="true">
            {photodumpSets.slice(0, 4).map((s) => <i key={s.id} style={{ background: s.cover }}><ArtImage src={heroArt('photodump')} /></i>)}
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
              <Field input={{ id: 'character', type: 'character', label: 'Character' }} value={character} onChange={setCharacter} />
              <p className="sa-hint">A character trained on 20 or more photos keeps the face steadiest. <Link to="/character">Create a character</Link></p>
            </div>
          )}
          {step === 2 && (
            <div className="pd-step">
              <div className="pd-summary">
                <span className="pick-img">{character?.images?.[0] ? <img src={character.images[0]} alt="" /> : character?.name?.[0]}</span>
                <div>
                  <strong>{character?.name} in {set.name}</strong>
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
              : <GoButton className="sm" />}
          </div>
        </footer>
        {step === 2 && <p className="pd-note"><NotWired runsOn={runsOn} /></p>}
      </section>

      <div className="studio-sub">
        <h2>{set.name}</h2>
        <span className="muted">The {size} shots in this set. Photos land in these frames once generating is wired.</span>
      </div>
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
