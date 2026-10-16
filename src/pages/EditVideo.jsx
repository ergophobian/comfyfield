import { useState } from 'react'
import { Field } from '../components/formats/Fields.jsx'
import { Hero, Box, Cards, NotWired, ErrorNote } from '../components/studiob/Kit.jsx'
import { formatById } from '../lib/formats/index.js'

// Each edit borrows the settings of the format that will run it. Remove has no format of its own yet.
const edits = [
  { id: 'swap', label: 'Swap an element', note: 'Change one thing, keep the rest', format: 'swap-element', mark: true },
  { id: 'restyle', label: 'Restyle', note: 'Redraw it in a new style', format: 'restyle-video' },
  { id: 'relight', label: 'Relight', note: 'New light on the same take', format: 'video-relight' },
  { id: 'remove', label: 'Remove an object', note: 'Erase it from every frame', mark: true, runsOn: 'Wan VACE', inputs: [
    { id: 'target', type: 'text', label: 'What to remove', placeholder: 'The person walking past in the back' },
    { id: 'fill', type: 'choice', label: 'Fill the gap with', default: 'scene', options: [
      { id: 'scene', label: 'Matching background' },
      { id: 'blur', label: 'A soft blur' },
    ] },
  ] },
  { id: 'reshoot', label: 'New angle', note: 'The same take from another camera', format: 'reshoot' },
  { id: 'extend', label: 'Extend', note: 'Keep it going past the end', format: 'extend-video' },
].map((e) => {
  const f = e.format && formatById(e.format)
  return { ...e, runsOn: e.runsOn || f?.runsOn, inputs: e.inputs || (f?.inputs || []).filter((i) => i.type !== 'video' && i.id !== 'note') }
})

const defaults = () => Object.fromEntries(edits.map((e) => [e.id, Object.fromEntries(e.inputs.filter((i) => i.default != null).map((i) => [i.id, i.default]))]))

// One still from early in the clip, to paint the area on.
const grabFrame = (url) => new Promise((resolve, reject) => {
  const v = document.createElement('video')
  v.muted = true
  v.preload = 'auto'
  v.onloadeddata = () => { v.currentTime = Math.min(0.5, (v.duration || 1) / 2) }
  v.onseeked = () => {
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    resolve({ url: c.toDataURL('image/jpeg', 0.9), name: 'Frame', ratio: `${v.videoWidth}:${v.videoHeight}`, strokes: null })
  }
  v.onerror = () => reject(new Error('Could not read a frame from that video.'))
  v.src = url
})

export default function EditVideo() {
  const [clip, setClip] = useState(null)
  const [edit, setEdit] = useState('swap')
  const [values, setValues] = useState(defaults)
  const [frame, setFrame] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState(null)

  const e = edits.find((x) => x.id === edit)
  const set = (id, v) => setValues((all) => ({ ...all, [edit]: { ...all[edit], [id]: v } }))
  const takeClip = (v) => { setClip(v); setFrame(null) }
  const mark = async () => {
    setError(null)
    try { setFrame(await grabFrame(clip.url)) } catch (err) { setError(err.message) }
  }

  return (
    <main className="sb-page">
      <Hero badge="Edit video" title="Change a video without reshooting it"
        sub="Upload a clip, pick an edit and describe it. Everything you do not touch stays as it was." />
      <div className="sb-work">
        <div className="sb-stage tall">
          <Field input={{ id: 'clip', type: 'video', label: 'Clip, 3 to 10 seconds works best' }} value={clip} onChange={takeClip} setError={setError} />
          <ErrorNote error={error} />
          {e.mark && clip && (
            <Box label="Mark the area" optional aside={!frame && <button type="button" className="link-btn" onClick={mark}>Paint on a frame</button>}>
              {frame
                ? <Field input={{ id: 'frame', type: 'draw', mode: 'mask', label: 'Paint over what should change' }} value={frame} onChange={setFrame} setError={setError} />
                : <p className="sheet-note">Paint over the part to change on one frame, and the edit follows it through the clip.</p>}
            </Box>
          )}
        </div>
        <aside className="sb-side glass" aria-label="Edit settings">
          <Box label="Edit"><Cards options={edits} value={edit} onChange={setEdit} label="Edit" /></Box>
          <div className="sb-fields rise" key={edit}>
            {e.inputs.map((input) => (
              <Field key={input.id} input={input} value={values[edit][input.id]} onChange={(v) => set(input.id, v)} setError={setError} />
            ))}
          </div>
          <Field input={{ id: 'prompt', type: 'longtext', label: 'Describe the change', optional: true, rows: 3, placeholder: 'Anything else, such as keep the shadows soft and the colors warm' }} value={prompt} onChange={setPrompt} />
          <NotWired runsOn={e.runsOn} summary={clip ? `${e.label} on ${clip.name}` : 'Upload a clip to start.'} />
        </aside>
      </div>
    </main>
  )
}
