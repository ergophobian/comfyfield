import { PageArt } from '../Art.jsx'
import { useEffect, useRef, useState } from 'react'
import { IconPlus, IconClose, IconTrash } from '../Icons.jsx'
import { IconMic } from '../generate/icons.jsx'
import { uploadMedia } from '../widgets/media.js'
import { useLibrary } from '../../lib/useLibrary.js'

const maxSamples = 3

// The first sample is the one a voice model clones from, so it should be 10 to 30 seconds of clear speech.
function Editor({ item, onClose }) {
  const lib = useLibrary()
  const [name, setName] = useState(item?.name || '')
  const [notes, setNotes] = useState(item?.notes || '')
  const [samples, setSamples] = useState(item?.samples || [])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const input = useRef(null)

  useEffect(() => {
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  const add = async (files) => {
    const picked = [...files].filter((f) => f.type.startsWith('audio/')).slice(0, maxSamples - samples.length)
    if (!picked.length) return
    setBusy(true); setErr('')
    try {
      const urls = []
      for (const f of picked) urls.push((await uploadMedia(f)).url)
      setSamples((s) => [...s, ...urls])
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  const save = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setErr('Give it a name first.')
    if (!samples.length) return setErr('Add a sample first.')
    setBusy(true); setErr('')
    try {
      await (item ? lib.update('voices', item.id, { name, notes, samples }) : lib.create('voices', { name, notes, samples }))
      onClose()
    } catch (e2) { setErr(e2.message); setBusy(false) }
  }

  return (
    <div className="viewer" onClick={onClose} role="dialog" aria-label={item ? `Edit ${item.name}` : 'Add a voice'}>
      <form className="form-sheet glass pop" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{item ? 'Edit voice' : 'Add a voice'}</h3>
        <div className="field">
          <label htmlFor="voice-name">Name</label>
          <input id="voice-name" value={name} placeholder="Narrator, warm and low" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Samples, up to {maxSamples}</label>
          <div className="samples">
            {samples.map((url, i) => (
              <div className="sample pop" key={url}>
                <span>{i === 0 ? 'Sample 1, the one models clone' : `Sample ${i + 1}`}</span>
                <audio src={url} controls />
                <button type="button" aria-label={`Remove sample ${i + 1}`} onClick={() => setSamples(samples.filter((u) => u !== url))}><IconClose /></button>
              </div>
            ))}
            {samples.length < maxSamples && (
              <button type="button" className="sample-add" disabled={busy} onClick={() => input.current.click()}><IconPlus />{busy ? 'Uploading' : 'Add a sample'}</button>
            )}
          </div>
          <input ref={input} type="file" accept="audio/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = '' }} />
        </div>
        <div className="field">
          <label htmlFor="voice-notes">Notes</label>
          <textarea id="voice-notes" rows={3} value={notes} placeholder="Accent, pace, mood" onChange={(e) => setNotes(e.target.value)} />
        </div>
        <p className="form-note muted">10 to 30 seconds of clear speech, with no music, clones best.</p>
        {err && <p className="plist-note">{err}</p>}
        <div className="form-sheet-foot">
          {item && <button type="button" className="btn-soft danger" onClick={async () => { await lib.remove('voices', item.id); onClose() }}><IconTrash />Delete</button>}
          <span className="grow" />
          <button type="button" className="btn-soft" onClick={onClose}>Cancel</button>
          <button className="btn-blue sm" disabled={busy}>Save</button>
        </div>
      </form>
    </div>
  )
}

export default function Voices() {
  const lib = useLibrary()
  const [editing, setEditing] = useState(null)
  if (!lib.ready) return null
  const list = lib.voices || []
  return (
    <>
      {list.length === 0 ? (
        <div className="empty glass">
          <PageArt id={'audio'} className="empty-art" />
          <p>Save a voice from a short sample, then use it in any script.</p>
          <button className="btn-blue" onClick={() => setEditing('new')}>Add a voice</button>
        </div>
      ) : (
        <>
          <div className="lib-filters"><button className="btn-blue sm" onClick={() => setEditing('new')}><IconPlus />Add a voice</button></div>
          <div className="asset-grid">
            {list.map((v, n) => (
              <button key={v.id} className="asset glass" style={{ '--i': Math.min(n, 12) }} onClick={() => setEditing(v)}>
                <div className="asset-cover"><IconMic /></div>
                <strong>{v.name}</strong>
                <span className="muted">{v.samples?.length || 0} {v.samples?.length === 1 ? 'sample' : 'samples'}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {editing && <Editor item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  )
}
