import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Segmented from '../Segmented.jsx'
import { IconClose, IconUpload } from '../Icons.jsx'
import { useApp } from '../../lib/appContext.js'
import { useLibrary } from '../../lib/useLibrary.js'
import { recentUploads, uploadFile, pastedFile, kindOf } from '../../lib/uploads.js'

const kinds = { image: ['image'], video: ['video'], media: ['audio', 'video'] }

function Thumb({ it }) {
  if (it.kind === 'video') return <video src={it.url} muted playsInline preload="metadata" />
  if (it.kind === 'audio') return <span className="mp-audio">{it.name}</span>
  return <img src={it.url} alt="" loading="lazy" />
}

// Pick what fills an upload tile: a new file (click, drop or paste), an earlier upload, a generation or a Library element.
export default function MediaPicker({ type = 'image', title, accept, onPick, onClose, setError }) {
  const ok = kinds[type]
  const { gens } = useApp() || {}
  const lib = useLibrary()
  const [tab, setTab] = useState('uploads')
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const file = useRef(null)
  const card = useRef(null)

  const uploads = useMemo(() => recentUploads().filter((u) => ok.includes(u.kind)), [type])
  const made = (gens?.items || []).filter((i) => !i.pending && !i.failed && i.url && ok.includes(i.kind))
    .map((i) => ({ url: i.url, name: i.caption || i.model, kind: i.kind, ratio: i.aspect, key: i.id }))
  const elements = type === 'image'
    ? [...(lib.characters || []), ...(lib.products || [])].flatMap((x) => (x.images || []).map((url, n) => ({ url, name: x.name, kind: 'image', key: `${x.id}-${n}` })))
    : []
  const tabs = [
    { value: 'uploads', label: 'Uploads' },
    { value: 'generations', label: 'Generations' },
    ...(type === 'image' ? [{ value: 'elements', label: 'Elements' }] : []),
  ]

  const take = async (picked) => {
    if (!picked || busy) return
    if (!ok.includes(kindOf(picked))) { setError?.(`That is not ${type === 'image' ? 'an image' : type === 'video' ? 'a video' : 'a recording or a video'}.`); return }
    setBusy(true)
    setError?.(null)
    try { onPick(await uploadFile(picked)) } catch (e) { setError?.(e.message) }
    setBusy(false)
  }
  const pick = ({ key, ...it }) => onPick(it)

  useEffect(() => { card.current?.focus() }, [])
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && onClose()
    const paste = (e) => { const f = pastedFile(e); if (f) { e.preventDefault(); take(f) } }
    window.addEventListener('keydown', key)
    window.addEventListener('paste', paste)
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('paste', paste) }
  }, [busy])

  const list = tab === 'uploads' ? uploads : tab === 'generations' ? made : elements
  const empty = {
    uploads: null,
    generations: 'Nothing made yet. Your generations show here.',
    elements: <>No saved characters or products yet. <Link className="link-btn" to="/assets?tab=characters" onClick={onClose}>Add one in Library</Link></>,
  }[tab]

  // On the body, so a transformed panel around the tile cannot trap the fixed backdrop.
  return createPortal(
    <div className="mp" onClick={onClose}>
      <div className="mp-card pop" ref={card} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="mp-head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><IconClose /></button>
        </div>
        <Segmented className="seg-sm" value={tab} onChange={setTab} options={tabs} />
        <div className="mp-grid">
          {tab === 'uploads' && (
            <button type="button" className={`drop mp-upload${over ? ' over' : ''}`} disabled={busy} onClick={() => file.current.click()}
              onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]) }}>
              <i className="slot-icon"><IconUpload /></i>
              <strong>{busy ? 'Uploading' : 'Upload'}</strong>
              <small>Click, drop or paste</small>
            </button>
          )}
          {list.map((it, n) => (
            <button key={it.key || it.url} type="button" className="mp-tile" style={{ '--i': Math.min(n, 12) }} onClick={() => pick(it)} aria-label={`Use ${it.name || 'this'}`} title={it.name}>
              <Thumb it={it} />
            </button>
          ))}
          {!list.length && empty && <p className="mp-empty">{empty}</p>}
        </div>
        <input ref={file} type="file" accept={accept} hidden onChange={(e) => { take(e.target.files[0]); e.target.value = '' }} />
      </div>
    </div>,
    document.body,
  )
}
