import { useState } from 'react'
import PhotoGrid from '../components/studio/PhotoGrid.jsx'
import { Hero, GoButton, NotWired, useStored } from '../components/studio/Shell.jsx'
import { FormatGrid } from '../components/Formats.jsx'
import { IconCheck, IconClose, IconPlus, IconTrash } from '../components/Icons.jsx'
import { useApp } from '../lib/appContext.js'
import { formats, formatById } from '../lib/formats/index.js'

const KEY = 'comfyfield.moodboards'
const MAX = 80
const tips = ['One look across every image', 'No faces', 'Nothing blurry', 'No mixed styles']

// Curated boards are the Looks formats: each is already a whole-picture style.
const curated = formats.filter((f) => f.category === 'looks' && f.group !== 'Custom')
// "Match a moodboard" takes up to three references; the board's first three go in.
const matchInputs = (formatById('moodboard')?.inputs || []).filter((i) => i.type === 'image').map((i) => i.id)

function Builder({ board, count, onSave, onClose }) {
  const [name, setName] = useState(board?.name || `Moodboard ${count + 1}`)
  const [images, setImages] = useState(board?.images || [])
  const ready = images.length > 0 && name.trim()
  return (
    <section className="mb-build glass" aria-label={board ? 'Edit moodboard' : 'New moodboard'}>
      <div className="chr-build-head">
        <div>
          <h2>{board ? 'Edit moodboard' : 'New moodboard'}</h2>
          <p>About 10 references is enough. 20 to 30 is better.</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><IconClose /></button>
      </div>
      <div className="field">
        <label htmlFor="mb-name">Style name</label>
        <input id="mb-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Warm lamp light" />
      </div>
      <PhotoGrid label="References" value={images} setValue={setImages} max={MAX} small />
      <ul className="mb-tips">{tips.map((t) => <li key={t}><IconCheck />{t}</li>)}</ul>
      <div className="chr-foot">
        <div className="chr-time">
          <strong>Saved boards stay in this browser</strong>
          <NotWired runsOn="an IP-Adapter style workflow on ComfyUI" />
        </div>
        <div className="chr-acts">
          <button type="button" className="btn-soft" disabled={!ready}
            onClick={() => onSave({ id: board?.id || crypto.randomUUID(), name: name.trim(), images, created: board?.created || Date.now() })}>
            Save moodboard
          </button>
          <GoButton label="Save as style preset" />
        </div>
      </div>
    </section>
  )
}

function BoardCard({ board, i, onUse, onEdit, onDelete }) {
  const four = board.images.slice(0, 4)
  return (
    <div className="mb-card glass" style={{ '--i': Math.min(i, 12) }}>
      <button type="button" className={`mb-collage n${four.length}`} onClick={onEdit} aria-label={`Edit ${board.name}`}>
        {four.map((x) => <img key={x.url} src={x.url} alt="" />)}
      </button>
      <div className="mb-card-text">
        <strong>{board.name}</strong>
        <span className="muted">{board.images.length} {board.images.length === 1 ? 'reference' : 'references'}</span>
      </div>
      <div className="mb-card-acts">
        <button type="button" className="btn-blue xs" onClick={onUse}>Use in Create image</button>
        <button type="button" className="lib-act mb-del" aria-label={`Delete ${board.name}`} onClick={onDelete}><IconTrash /></button>
      </div>
    </div>
  )
}

export default function Moodboard() {
  const { openFormat } = useApp()
  const [boards, setBoards] = useStored(KEY, [])
  const [editing, setEditing] = useState(null)
  const list = Array.isArray(boards) ? boards : []

  const save = (b) => {
    setBoards((xs) => (xs.some((x) => x.id === b.id) ? xs.map((x) => (x.id === b.id ? b : x)) : [b, ...xs]))
    setEditing(null)
  }
  const use = (b) => openFormat('moodboard', Object.fromEntries(
    matchInputs.map((id, k) => [id, b.images[k] && { url: b.images[k].url, name: b.images[k].name || b.name, ratio: b.images[k].ratio }]).filter(([, v]) => v),
  ))
  const cards = [
    ...list.flatMap((b) => b.images.slice(0, 1)).map((x) => ({ img: x.url })),
    ...curated.map((f) => ({ cover: f.cover })),
  ].slice(0, 4)

  return (
    <main className="page mb">
      {!editing && (
        <Hero cards={cards} title="Build your moodboard"
          text="Turn your references into one focused style: color, light, texture and mood you can use again and again.">
          <button type="button" className="btn-blue" onClick={() => setEditing('new')}><IconPlus />Build your moodboard</button>
        </Hero>
      )}
      {editing && (
        <Builder key={editing === 'new' ? 'new' : editing.id} board={editing === 'new' ? null : editing} count={list.length}
          onSave={save} onClose={() => setEditing(null)} />
      )}

      <div className="studio-sub">
        <h2>Your moodboards</h2>
        <span className="muted">Kept in this browser</span>
      </div>
      {!list.length ? (
        <div className="empty glass"><p>No moodboards yet. Build one from your own references and it shows up here.</p></div>
      ) : (
        <div className="mb-grid">
          {list.map((b, i) => (
            <BoardCard key={b.id} board={b} i={i} onUse={() => use(b)} onEdit={() => setEditing(b)}
              onDelete={() => setBoards((xs) => xs.filter((x) => x.id !== b.id))} />
          ))}
        </div>
      )}

      <div className="studio-sub">
        <h2>Curated</h2>
        <span className="muted">Ready-made styles. Pick one to open it in Create image.</span>
      </div>
      <FormatGrid list={curated} onOpen={(f) => openFormat(f)} />
    </main>
  )
}
