import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import UseIn from './formats/UseIn.jsx'
import Compare from './widgets/Compare.jsx'
import ModelView, { saveStl } from './ModelView.jsx'
import { useApp } from '../lib/appContext.js'
import { handoffFor } from '../lib/handoff.js'
import { create } from '../lib/useLibrary.js'
import { IconCheck, IconDownload, IconCopy, IconTrash, IconClose, IconChevron } from './Icons.jsx'

export const ext = { image: 'png', video: 'mp4', audio: 'mp3', '3d': 'glb' }

export function Media({ it, full, onInfo }) {
  if (it.kind === '3d') return <ModelView url={it.url} alt={it.caption} full={full} onInfo={onInfo} />
  if (it.kind === 'video') return <video src={it.url} autoPlay={full} loop muted={!full} playsInline controls={full} />
  if (it.kind === 'audio') return <div className="audio-card"><p>{it.caption}</p><audio src={it.url} controls /></div>
  return <img src={it.url} alt={it.caption} />
}

export function Act({ label, on, wide, onClick, children }) {
  return <button type="button" className={`lib-act${on ? ' on' : ''}${wide ? ' wide' : ''}`} aria-label={label} title={label} onClick={(e) => { e.stopPropagation(); onClick() }}>{children}</button>
}

// A slicer needs a closed surface, so the viewer says whether the mesh has any open edges.
const meshNote = ({ faces, open }) => `${faces.toLocaleString()} faces · ${open ? `${open.toLocaleString()} open edges` : 'closed surface, ready to slice'}`

const copyPrompt = async (it) => { try { await navigator.clipboard.writeText(it.caption || '') } catch {} }

// Keeps an image as a Library character or product, so @ and the media picker can use it again.
function SaveToElements({ it, onDone }) {
  const [name, setName] = useState((it.caption || 'New element').split(/\s+/).slice(0, 4).join(' '))
  const [state, setState] = useState(null)
  const save = async (type) => {
    if (!name.trim()) return
    setState('saving')
    try {
      await create(type, type === 'characters' ? { name: name.trim(), notes: '', images: [it.url] } : { name: name.trim(), description: it.caption || '', images: [it.url] })
      setState(type)
    } catch (e) { setState({ error: e.message }) }
  }
  if (state === 'characters' || state === 'products') {
    return (
      <div className="viewer-save rise" role="status">
        <span>Saved {name.trim()} to {state === 'characters' ? 'Characters' : 'Products'}.</span>
        <Link className="link-btn" to={`/assets?tab=${state}`}>Open Assets</Link>
        <button type="button" className="btn-soft xs" onClick={onDone}>Done</button>
      </div>
    )
  }
  return (
    <form className="viewer-save rise" onSubmit={(e) => { e.preventDefault(); save('characters') }}>
      <label className="field"><input value={name} onChange={(e) => setName(e.target.value)} aria-label="Element name" autoFocus /></label>
      <button type="submit" className="btn-blue xs" disabled={state === 'saving' || !name.trim()}>Save as character</button>
      <button type="button" className="btn-soft xs" disabled={state === 'saving' || !name.trim()} onClick={() => save('products')}>Save as product</button>
      <button type="button" className="btn-soft xs" onClick={onDone}>Cancel</button>
      {state?.error && <small className="viewer-save-error">{state.error}</small>}
    </form>
  )
}

// Full-screen look at one generation, with arrows through the rest. Library and every generator page open it.
export default function Viewer({ items, at, setAt, copy = copyPrompt, onClose }) {
  const it = items[at]
  const { openFormat, gens, picker } = useApp()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [mesh, setMesh] = useState(null)
  useEffect(() => { setSaving(false); setMesh(null) }, [it?.id])
  const go = (action) => {
    const h = handoffFor(action, it, picker)
    if (!h) return
    onClose()
    navigate(h.to, { state: { handoff: h.handoff } })
  }
  const more = [
    ['recreate', 'Recreate'],
    ['reference', 'Use as reference'],
    ['video', 'Turn to video'],
  ].filter(([action]) => it && handoffFor(action, it, picker))
  useEffect(() => {
    const key = (e) => {
      // Typing a name for Save to elements must not page through results.
      if (e.target.closest?.('input, textarea')) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setAt((i) => Math.min(i + 1, items.length - 1))
      if (e.key === 'ArrowLeft') setAt((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [items.length])
  if (!it) return null
  return (
    <div className="viewer" onClick={onClose} role="dialog" aria-label="Viewer">
      <button className="viewer-nav prev" aria-label="Previous" disabled={at === 0} onClick={(e) => { e.stopPropagation(); setAt(at - 1) }}><IconChevron dir="left" /></button>
      <div className={`viewer-card glass pop${it.kind === '3d' ? ' model' : ''}`} key={it.id} onClick={(e) => e.stopPropagation()}>
        <div className="viewer-media">{it.kind === 'image' && it.source ? <Compare before={it.source} after={it.url} alt={it.caption} /> : <Media it={it} full onInfo={setMesh} />}</div>
        <div className="viewer-foot">
          <div className="viewer-text">
            <p>{it.caption}</p>
            <span>{it.model}{it.kind !== '3d' && it.aspect ? ` · ${it.aspect}` : ''}{mesh && ` · ${meshNote(mesh)}`}</span>
          </div>
          <div className="viewer-acts">
            {/* The viewer sits above the format sheet, so it closes first. */}
            <UseIn item={it} up onUse={(format, values) => { onClose(); openFormat(format, values) }} />
            <Act label={it.approved ? 'Remove approval' : 'Approve'} on={it.approved} onClick={() => gens.toggleApprove(it.id)}><IconCheck /></Act>
            <a className="lib-act" href={it.url} download={`${it.id}.${ext[it.kind] || 'png'}`} aria-label="Download" title="Download"><IconDownload /></a>
            {it.kind === '3d' && <Act label="Save as STL for 3D printing" wide onClick={() => saveStl(it.url, it.id).catch(() => {})}>STL</Act>}
            <Act label="Copy prompt" onClick={() => copy(it)}><IconCopy /></Act>
            <Act label="Delete" onClick={() => { gens.dismiss(it.id); items.length === 1 ? onClose() : setAt(Math.min(at, items.length - 2)) }}><IconTrash /></Act>
          </div>
        </div>
        {(more.length > 0 || it.kind === 'image') && !saving && (
          <div className="viewer-more">
            {more.map(([action, label]) => <button key={action} type="button" className="btn-soft xs" onClick={() => go(action)}>{label}</button>)}
            {it.kind === 'image' && <button type="button" className="btn-soft xs" onClick={() => setSaving(true)}>Save to elements</button>}
          </div>
        )}
        {saving && <SaveToElements it={it} onDone={() => setSaving(false)} />}
      </div>
      <button className="viewer-nav next" aria-label="Next" disabled={at === items.length - 1} onClick={(e) => { e.stopPropagation(); setAt(at + 1) }}><IconChevron /></button>
      <button className="viewer-close" aria-label="Close" onClick={onClose}><IconClose /></button>
    </div>
  )
}
