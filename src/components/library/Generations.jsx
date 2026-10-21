import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Segmented from '../Segmented.jsx'
import Viewer, { Media, Act, ext } from '../Viewer.jsx'
import { IconCheck, IconDownload, IconCopy, IconTrash } from '../Icons.jsx'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'approved', label: 'Approved' },
]
const ratio = (a) => (a || '1:1').replace(':', ' / ')

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
      {open != null && items[open] && <Viewer items={items} at={open} setAt={setOpen} copy={copy} onClose={() => setOpen(null)} />}
    </>
  )
}
