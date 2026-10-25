import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PhotoGrid from '../components/studio/PhotoGrid.jsx'
import { Hero, UseMenu } from '../components/studio/Shell.jsx'
import { TypeArt } from '../components/studio/Art.jsx'
import { IconCheck, IconClose, IconPlus } from '../components/Icons.jsx'
import { useApp } from '../lib/appContext.js'
import { useLibrary } from '../lib/useLibrary.js'
import { characterUses } from '../lib/characterUses.js'
import { formatById } from '../lib/formats/index.js'
import { covers } from '../lib/formats/parts.js'

const MAX = 20
// The Assets editor keeps six reference images per character, so a plain save does too.
const KEEP = 6
// The reference set reads the first four photos and gives four views back, which lead the six pictures.
const SOURCES = 4
const refSet = formatById('character-reference-set')

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

function Builder({ onClose, onBuilt }) {
  const lib = useLibrary()
  const { gens } = useApp()
  const [name, setName] = useState('')
  const [photos, setPhotos] = useState([])
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const n = photos.length

  const saveOnly = async () => {
    if (!name.trim()) { setMsg('Give the character a name first.'); return null }
    setBusy(true); setMsg('')
    try {
      const item = await lib.create('characters', { name: name.trim(), notes: '', images: photos.slice(0, KEEP).map((p) => p.url) })
      onClose(name.trim())
      return item
    } catch (e) { setMsg(e.message); setBusy(false); return null }
  }

  // Same face, no LoRA: the character is saved at once with its photos, and the four views take the
  // front places when the run finishes.
  const buildSet = async () => {
    const item = await saveOnly()
    if (!item) return
    const values = Object.fromEntries(photos.slice(0, SOURCES).map((p, i) => [i ? 'image' + (i + 1) : 'image', { url: p.url, name: p.name }]))
    onBuilt(item.name, 'building')
    try {
      const session = await gens.generateFormat(refSet, values)
      const views = session.results().map((f) => f.url).filter(Boolean)
      if (!views.length) throw new Error('The reference set came back empty.')
      await lib.update('characters', item.id, { images: [...views, ...item.images].slice(0, KEEP), refset: new Date().toISOString() })
      onBuilt(item.name, 'done')
    } catch (e) { onBuilt(item.name, 'failed', e.message) }
  }

  return (
    <section className="chr-build glass" aria-label="New character">
      <div className="chr-build-head">
        <div>
          <h2>New character</h2>
          <p>Upload up to {MAX} photos of one person. The first {SOURCES} build a reference set: the same face in every format, with no training.</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Close" onClick={() => onClose()}><IconClose /></button>
      </div>
      <div className="chr-cols">
        <div className="chr-left">
          <PhotoGrid label="Photos" value={photos} setValue={setPhotos} max={MAX}
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
          <strong>Builds a front, three-quarter, profile and full-body view</strong>
          <span className="muted">Runs on {refSet.runsOn}. No LoRA training.</span>
        </div>
        {msg && <p className="plist-note">{msg}</p>}
        <div className="chr-acts">
          <button type="button" className="btn-soft" disabled={busy || !n || !consent} onClick={saveOnly}
            title="Saves the name and the first six photos to Assets, with no reference set">
            {busy ? 'Saving' : 'Save photos only'}
          </button>
          <button type="button" className="btn-blue" disabled={busy || !n || !consent} onClick={buildSet}
            title="Saves the character, then builds four views from the first four photos">
            Build reference set
          </button>
        </div>
      </div>
    </section>
  )
}

function CharacterCard({ item, i }) {
  const { openFormat } = useApp()
  const items = characterUses(item, openFormat)
  return (
    <div className="asset glass chr-card" style={{ '--i': Math.min(i, 12) }}>
      <div className="asset-cover">
        {item.images?.[0] ? <img src={item.images[0]} alt="" /> : <span>{item.name?.[0]}</span>}
        {item.images?.length > 1 && <i>{item.images.length}</i>}
      </div>
      <strong>{item.name}</strong>
      <span className="muted">{item.refset ? 'Reference set' : (item.images?.length || 0) + (item.images?.length === 1 ? ' reference image' : ' reference images')}</span>
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

  // The reference set renders after the builder closes, so its progress shows above the list.
  const built = (name, stage, why) => {
    if (stage === 'building') setSaved(name + ' is saved. The reference set is rendering and takes the first pictures when it is done.')
    else if (stage === 'done') setSaved(name + ' has a reference set. Use them in any format below.')
    else setSaved(name + ' is saved with your photos, but the reference set failed: ' + why)
  }
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
          text="Upload photos from a few angles and build a reference set once. The same face then shows up in every image and video you make.">
          <button type="button" className="btn-blue" onClick={() => { setSaved(''); setBuilding(true) }}><IconPlus />Create character</button>
        </Hero>
      )}
      {building && <Builder onClose={done} onBuilt={built} />}

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
