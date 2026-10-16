import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PhotoGrid from '../components/studio/PhotoGrid.jsx'
import { GoButton, Hero, NotWired, UseMenu } from '../components/studio/Shell.jsx'
import { TypeArt } from '../components/studio/Art.jsx'
import { IconCheck, IconClose, IconPlus } from '../components/Icons.jsx'
import { useApp } from '../lib/appContext.js'
import { useLibrary, toRef } from '../lib/useLibrary.js'
import { formatById } from '../lib/formats/index.js'
import { covers } from '../lib/formats/parts.js'

const MIN = 20
const MAX = 80
// The Assets editor keeps six reference images per character, so a save without training does too.
const KEEP = 6

const good = [
  'Different angles and expressions',
  'Good, even light',
  'Recent photos',
  'At least one full-height shot',
  'One person in every photo',
]
const avoid = [
  'Sunglasses, hats or anything over the face',
  'Heavy shadows or strong filters',
  'Tight crops that cut the face',
  'Group shots',
]

// Formats that take a saved character, with any extra value they need to use it.
const targets = [
  ['character-scene', {}],
  ['influencer-post', {}],
  ['ai-influencer-video', {}],
  ['multi-shot', {}],
  ['ugc-ad', {}],
  ['face-swap', {}],
  ['character-swap', {}],
  ['face-swap-video', { source: 'character' }],
]

// Rough guide from the audit: 3 minutes at 20 photos, up to 5 at 80.
const minutes = (n) => (n < MIN ? null : Math.round(3 + ((Math.min(n, MAX) - MIN) / (MAX - MIN)) * 2))

function Builder({ onClose }) {
  const lib = useLibrary()
  const [name, setName] = useState('')
  const [photos, setPhotos] = useState([])
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const n = photos.length
  const est = minutes(n)

  const saveOnly = async () => {
    if (!name.trim()) { setMsg('Give the character a name first.'); return }
    setBusy(true); setMsg('')
    try {
      await lib.create('characters', { name: name.trim(), notes: '', images: photos.slice(0, KEEP).map((p) => p.url) })
      onClose(name.trim())
    } catch (e) { setMsg(e.message); setBusy(false) }
  }

  return (
    <section className="chr-build glass" aria-label="New character">
      <div className="chr-build-head">
        <div>
          <h2>New character</h2>
          <p>Upload {MIN} to {MAX} photos of one person. More variety makes a steadier face.</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Close" onClick={() => onClose()}><IconClose /></button>
      </div>
      <div className="chr-cols">
        <div className="chr-left">
          <PhotoGrid label="Photos" value={photos} setValue={setPhotos} min={MIN} max={MAX}
            hint={`Photos ${960}px or larger on the long side give the sharpest face.`} />
        </div>
        <div className="chr-right">
          <div className="field">
            <label htmlFor="chr-name">Name</label>
            <input id="chr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mara, the barista" />
          </div>
          <div className="chr-guide">
            <h4>Works well</h4>
            <ul>{good.map((g) => <li key={g}><IconCheck />{g}</li>)}</ul>
            <h4>Leave out</h4>
            <ul className="bad">{avoid.map((g) => <li key={g}><IconClose />{g}</li>)}</ul>
          </div>
          <button type="button" className={`switch${consent ? ' on' : ''}`} aria-pressed={consent} onClick={() => setConsent((c) => !c)}>
            <i />These are photos of me, or I have permission to use this face
          </button>
        </div>
      </div>
      <div className="chr-foot">
        <div className="chr-time">
          <strong>{est ? `Training takes about ${est} minutes` : `Training takes 3 to 5 minutes once you have ${MIN} photos`}</strong>
          <NotWired runsOn="a FLUX LoRA trainer on ComfyUI" />
        </div>
        {msg && <p className="plist-note">{msg}</p>}
        <div className="chr-acts">
          <button type="button" className="btn-soft" disabled={busy || !n || !consent} onClick={saveOnly}
            title={`Saves the name and the first ${KEEP} photos to Assets, untrained`}>
            {busy ? 'Saving' : 'Save without training'}
          </button>
          <GoButton label="Train" />
        </div>
      </div>
    </section>
  )
}

function CharacterCard({ item, i }) {
  const { openFormat } = useApp()
  const ref = toRef('character', item)
  const items = targets
    .map(([id, extra]) => [formatById(id), extra])
    .filter(([f]) => f)
    .map(([f, extra]) => {
      const input = f.inputs.find((x) => x.type === 'character')
      return { label: f.name, note: f.kind === 'video' ? 'Video' : 'Image', onClick: () => openFormat(f.id, { ...extra, [input.id]: ref }) }
    })
  return (
    <div className="asset glass chr-card" style={{ '--i': Math.min(i, 12) }}>
      <div className="asset-cover">
        {item.images?.[0] ? <img src={item.images[0]} alt="" /> : <span>{item.name?.[0]}</span>}
        {item.images?.length > 1 && <i>{item.images.length}</i>}
      </div>
      <strong>{item.name}</strong>
      <span className="muted">{item.trained ? 'Trained' : `${item.images?.length || 0} reference ${item.images?.length === 1 ? 'image' : 'images'}`}</span>
      <div className="chr-card-acts">
        <UseMenu items={items} />
        <Link className="link-btn" to="/assets?tab=characters">Edit</Link>
      </div>
    </div>
  )
}

export default function Character() {
  const lib = useLibrary()
  const [building, setBuilding] = useState(false)
  const [saved, setSaved] = useState('')
  const listRef = useRef(null)
  const faces = lib.characters.filter((c) => c.images?.[0]).map((c) => ({ img: c.images[0] }))
  const art = ['average', 'bold', 'average', 'extreme'].map((k, i) => ({ cover: [covers.peach, covers.sky, covers.sun, covers.lilac][i], art: <TypeArt kind={k} /> }))
  const cards = [...faces, ...art].slice(0, 4)

  const done = (name) => {
    setBuilding(false)
    if (name) {
      setSaved(`${name} is saved. Use them in any format below.`)
      setTimeout(() => listRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 50)
    }
  }

  return (
    <main className="page chr">
      {!building && (
        <Hero cards={cards} title="Make a character that stays the same"
          text="Upload photos from a few angles and train once. The same face then shows up in every image and video you make.">
          <button type="button" className="btn-blue" onClick={() => { setSaved(''); setBuilding(true) }}><IconPlus />Create character</button>
        </Hero>
      )}
      {building && <Builder onClose={done} />}

      <div className="studio-sub" ref={listRef}>
        <h2>Your characters</h2>
        <span className="muted">{lib.characters.length ? `${lib.characters.length} saved in Assets` : 'Saved in Assets'}</span>
      </div>
      {saved && <p className="chr-saved status ok" role="status">{saved}</p>}
      {lib.ready && !lib.characters.length && (
        <div className="empty glass">
          <p>No characters yet. Create one above, or add reference photos in Assets.</p>
          <Link className="btn-soft" to="/assets?tab=characters">Open Assets</Link>
        </div>
      )}
      <div className="asset-grid">
        {lib.characters.map((c, i) => <CharacterCard key={c.id} item={c} i={i} />)}
      </div>
    </main>
  )
}
