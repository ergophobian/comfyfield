import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Segmented from '../Segmented.jsx'
import { IconCheck, IconDownload, IconCopy, IconTrash, IconClose, IconChevron } from '../Icons.jsx'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'approved', label: 'Approved' },
]
const ratio = (a) => (a || '1:1').replace(':', ' / ')
const ext = { image: 'png', video: 'mp4', audio: 'mp3' }

function Media({ it, full }) {
  if (it.kind === 'video') return <video src={it.url} autoPlay={full} loop muted={!full} playsInline controls={full} />
  if (it.kind === 'audio') return <div className="audio-card"><p>{it.caption}</p><audio src={it.url} controls /></div>
  return <img src={it.url} alt={it.caption} />
}

function Act({ label, on, onClick, children }) {
  return <button type="button" className={`lib-act${on ? ' on' : ''}`} aria-label={label} title={label} onClick={(e) => { e.stopPropagation(); onClick() }}>{children}</button>
}

function Viewer({ items, at, setAt, gens, copy, onClose }) {
  const it = items[at]
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

export default function Generations({ gens }) {
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)
  const [copied, setCopied] = useState(null)
  const done = useMemo(() => gens.items.filter((i) => !i.pending && !i.failed && i.url), [gens.items])
  const items = done.filter((i) => (filter === 'all' ? true : filter === 'approved' ? i.approved : i.kind === filter))

  const copy = async (it) => {
    try { await navigator.clipboard.writeText(it.caption || '') } catch {}
    setCopied(it.id)
    setTimeout(() => setCopied((c) => (c === it.id ? null : c)), 1400)
  }

  if (!done.length) {
    return (
      <div className="empty glass">
        <p>Nothing made yet. Your images, videos and audio land here.</p>
        <Link className="btn-blue" to="/">Start creating</Link>
      </div>
    )
  }

  return (
    <>
      <div className="lib-filters"><Segmented className="seg-sm" value={filter} onChange={setFilter} options={filters} /></div>
      {items.length === 0 ? (
        <div className="empty glass">
          <p>{filter === 'approved' ? 'Approve a take to keep it here.' : 'Nothing in this view yet.'}</p>
          <button className="btn-blue" onClick={() => setFilter('all')}>Show everything</button>
        </div>
      ) : (
        <div className="lib-grid">
          {items.map((it, n) => (
            <div key={it.id} className={`lib-card glass${it.approved ? ' approved' : ''}${it.kind === 'audio' ? ' audio' : ''}`}
              style={{ '--ar': it.kind === 'audio' ? '2 / 1' : ratio(it.aspect), '--i': Math.min(n, 12) }}
              onClick={() => it.kind !== 'audio' && setOpen(n)}>
              <Media it={it} />
              <div className="lib-acts">
                <Act label={it.approved ? 'Remove approval' : 'Approve'} on={it.approved} onClick={() => gens.toggleApprove(it.id)}><IconCheck /></Act>
                <a className="lib-act" href={it.url} download={`${it.id}.${ext[it.kind] || 'png'}`} aria-label="Download" title="Download" onClick={(e) => e.stopPropagation()}><IconDownload /></a>
                <Act label="Copy prompt" onClick={() => copy(it)}><IconCopy /></Act>
                <Act label="Delete" onClick={() => gens.dismiss(it.id)}><IconTrash /></Act>
              </div>
              {copied === it.id && <span className="lib-toast pop">Prompt copied</span>}
              {it.kind !== 'audio' && <div className="result-cap">{it.model} · {it.caption}</div>}
            </div>
          ))}
        </div>
      )}
      {open != null && items[open] && <Viewer items={items} at={open} setAt={setOpen} gens={gens} copy={copy} onClose={() => setOpen(null)} />}
    </>
  )
}
