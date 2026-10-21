import { useEffect } from 'react'
import UseIn from './formats/UseIn.jsx'
import { useApp } from '../lib/appContext.js'
import { IconCheck, IconDownload, IconCopy, IconTrash, IconClose, IconChevron } from './Icons.jsx'

export const ext = { image: 'png', video: 'mp4', audio: 'mp3' }

export function Media({ it, full }) {
  if (it.kind === 'video') return <video src={it.url} autoPlay={full} loop muted={!full} playsInline controls={full} />
  if (it.kind === 'audio') return <div className="audio-card"><p>{it.caption}</p><audio src={it.url} controls /></div>
  return <img src={it.url} alt={it.caption} />
}

export function Act({ label, on, onClick, children }) {
  return <button type="button" className={`lib-act${on ? ' on' : ''}`} aria-label={label} title={label} onClick={(e) => { e.stopPropagation(); onClick() }}>{children}</button>
}

const copyPrompt = async (it) => { try { await navigator.clipboard.writeText(it.caption || '') } catch {} }

// Full-screen look at one generation, with arrows through the rest. Library and every generator page open it.
export default function Viewer({ items, at, setAt, copy = copyPrompt, onClose }) {
  const it = items[at]
  const { openFormat, gens } = useApp()
  useEffect(() => {
    const key = (e) => {
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
      <div className="viewer-card glass pop" key={it.id} onClick={(e) => e.stopPropagation()}>
        <div className="viewer-media"><Media it={it} full /></div>
        <div className="viewer-foot">
          <div className="viewer-text">
            <p>{it.caption}</p>
            <span>{it.model}{it.aspect ? ` · ${it.aspect}` : ''}</span>
          </div>
          <div className="viewer-acts">
            {/* The viewer sits above the format sheet, so it closes first. */}
            <UseIn item={it} up onUse={(format, values) => { onClose(); openFormat(format, values) }} />
            <Act label={it.approved ? 'Remove approval' : 'Approve'} on={it.approved} onClick={() => gens.toggleApprove(it.id)}><IconCheck /></Act>
            <a className="lib-act" href={it.url} download={`${it.id}.${ext[it.kind] || 'png'}`} aria-label="Download" title="Download"><IconDownload /></a>
            <Act label="Copy prompt" onClick={() => copy(it)}><IconCopy /></Act>
            <Act label="Delete" onClick={() => { gens.dismiss(it.id); items.length === 1 ? onClose() : setAt(Math.min(at, items.length - 2)) }}><IconTrash /></Act>
          </div>
        </div>
      </div>
      <button className="viewer-nav next" aria-label="Next" disabled={at === items.length - 1} onClick={(e) => { e.stopPropagation(); setAt(at + 1) }}><IconChevron /></button>
      <button className="viewer-close" aria-label="Close" onClick={onClose}><IconClose /></button>
    </div>
  )
}
