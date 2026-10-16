import { useEffect, useRef, useState } from 'react'
import { IconPlus, IconClose } from '../Icons.jsx'

const maxSamples = 3

function Editor({ onClose }) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [samples, setSamples] = useState([])
  const input = useRef(null)
  const live = useRef(samples)
  live.current = samples

  useEffect(() => {
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  // Samples are local previews only, so free each file when the editor closes.
  useEffect(() => () => live.current.forEach((s) => URL.revokeObjectURL(s.url)), [])

  const add = (files) => {
    const picked = [...files].filter((f) => f.type.startsWith('audio/')).slice(0, maxSamples - samples.length)
    setSamples([...samples, ...picked.map((f) => ({ id: crypto.randomUUID(), name: f.name, url: URL.createObjectURL(f) }))])
  }
  const remove = (s) => {
    URL.revokeObjectURL(s.url)
    setSamples(samples.filter((x) => x.id !== s.id))
  }

  return (
    <div className="viewer" onClick={onClose} role="dialog" aria-label="Add a voice">
      <form className="form-sheet glass pop" onClick={(e) => e.stopPropagation()} onSubmit={(e) => e.preventDefault()}>
        <h3>Add a voice</h3>
        <div className="field">
          <label htmlFor="voice-name">Name</label>
          <input id="voice-name" value={name} placeholder="Narrator, warm and low" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Samples, up to {maxSamples}</label>
          <div className="samples">
            {samples.map((s) => (
              <div className="sample pop" key={s.id}>
                <span>{s.name}</span>
                <audio src={s.url} controls />
                <button type="button" aria-label={`Remove ${s.name}`} onClick={() => remove(s)}><IconClose /></button>
              </div>
            ))}
            {samples.length < maxSamples && (
              <button type="button" className="sample-add" onClick={() => input.current.click()}><IconPlus />Add a sample</button>
            )}
          </div>
          <input ref={input} type="file" accept="audio/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = '' }} />
        </div>
        <div className="field">
          <label htmlFor="voice-notes">Notes</label>
          <textarea id="voice-notes" rows={3} value={notes} placeholder="Accent, pace, mood" onChange={(e) => setNotes(e.target.value)} />
        </div>
        <p className="form-note muted">Not wired yet. Saving voices comes with the backend.</p>
        <div className="form-sheet-foot">
          <span className="grow" />
          <button type="button" className="btn-soft" onClick={onClose}>Cancel</button>
          <button className="btn-blue sm" disabled>Save</button>
        </div>
      </form>
    </div>
  )
}

export default function Voices() {
  const [editing, setEditing] = useState(false)
  return (
    <>
      <div className="empty glass">
        <p>Save a voice from a short sample, then use it in any script.</p>
        <button className="btn-blue" onClick={() => setEditing(true)}>Add a voice</button>
      </div>
      {editing && <Editor onClose={() => setEditing(false)} />}
    </>
  )
}
