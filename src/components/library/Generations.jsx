import Schedule from './Schedule.jsx'
import { PageArt } from '../Art.jsx'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Segmented from '../Segmented.jsx'
import Pop from '../generate/Pop.jsx'
import Viewer, { Media, Act, ext } from '../Viewer.jsx'
import { useFolders } from '../../lib/folders.js'
import { IconCheck, IconDownload, IconCopy, IconTrash, IconSearch, IconClose, IconPlus } from '../Icons.jsx'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: '3d', label: '3D' },
  { value: 'approved', label: 'Approved' },
]
const ratio = (a) => (a || '1:1').replace(':', ' / ')
const fileName = (it) => `${it.id}.${ext[it.kind] || 'png'}`

// Browsers drop most of a burst of downloads, so space them out.
function downloadAll(list) {
  list.forEach((it, i) => setTimeout(() => {
    const a = document.createElement('a')
    a.href = it.url
    a.download = fileName(it)
    document.body.appendChild(a)
    a.click()
    a.remove()
  }, i * 250))
}

export default function Generations({ gens }) {
  const [schedule, setSchedule] = useState(null)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [folder, setFolder] = useState('all')
  const [selecting, setSelecting] = useState(false)
  const [picked, setPicked] = useState([])
  const [sheet, setSheet] = useState(null)
  const [open, setOpen] = useState(null)
  const [copied, setCopied] = useState(null)
  const fs = useFolders()
  const done = useMemo(() => gens.items.filter((i) => !i.pending && !i.failed && i.url), [gens.items])
  const q = query.trim().toLowerCase()
  const items = done.filter((i) => (filter === 'all' ? true : filter === 'approved' ? i.approved : i.kind === filter))
    .filter((i) => folder === 'all' || fs.of[i.id] === folder)
    .filter((i) => !q || [i.caption, i.prompt, i.model, i.flowName].some((t) => t && String(t).toLowerCase().includes(q)))
  const chosen = done.filter((i) => picked.includes(i.id))
  const current = fs.folders.find((f) => f.id === folder)

  useEffect(() => { if (folder !== 'all' && !current) setFolder('all') }, [folder, current])
  // Flow runs and agents save on the server; fetch them each time the Library opens.
  useEffect(() => { gens.refresh?.() }, [])

  const stopSelecting = () => { setSelecting(false); setPicked([]) }
  useEffect(() => {
    if (!selecting || open != null) return
    const key = (e) => e.key === 'Escape' && stopSelecting()
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [selecting, open])

  const toggle = (id) => {
    setSelecting(true)
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }
  const remove = () => {
    const ids = chosen.map((i) => i.id)
    ids.forEach((id) => gens.dismiss(id))
    fs.forget(ids)
    stopSelecting()
  }
  const moveTo = (id) => { fs.move(chosen.map((i) => i.id), id); stopSelecting() }

  const copy = async (it) => {
    try { await navigator.clipboard.writeText(it.caption || '') } catch {}
    setCopied(it.id)
    setTimeout(() => setCopied((c) => (c === it.id ? null : c)), 1400)
  }

  if (!done.length) {
    return (
      <div className="empty glass">
        <PageArt id="library" className="empty-art" />
        <p>Nothing made yet. Your images, videos, audio and 3D models land here.</p>
        <Link className="btn-blue" to="/">Start creating</Link>
      </div>
    )
  }

  const count = (id) => done.filter((i) => fs.of[i.id] === id).length
  const showAll = () => { setFilter('all'); setFolder('all'); setQuery('') }

  return (
    <>
      <div className="lib-tools">
        <label className="apps-search lib-search">
          <IconSearch />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search prompts and models" aria-label="Search generations" />
          {query && <button type="button" className="apps-clear" onClick={() => setQuery('')} aria-label="Clear search"><IconClose /></button>}
        </label>
        <Segmented className="seg-sm" value={filter} onChange={setFilter} options={filters} />
        <button type="button" className={`btn-soft sm lib-select${selecting ? ' on' : ''}`} aria-pressed={selecting}
          onClick={() => (selecting ? stopSelecting() : setSelecting(true))}>
          {selecting ? 'Done' : 'Select'}
        </button>
      </div>

      <div className="lib-folders">
        <div className="pills" role="group" aria-label="Folders">
          <button type="button" className={folder === 'all' ? 'on' : ''} aria-pressed={folder === 'all'} onClick={() => setFolder('all')}>All</button>
          {fs.folders.map((f) => (
            <button type="button" key={f.id} className={folder === f.id ? 'on' : ''} aria-pressed={folder === f.id} onClick={() => setFolder(f.id)}>
              {f.name}<span className="lib-count">{count(f.id)}</span>
            </button>
          ))}
        </div>
        <button type="button" className="link-btn lib-new" onClick={() => setSheet({ mode: 'new' })}><IconPlus />New folder</button>
        {current && (
          <span className="lib-folder-acts">
            <button type="button" className="btn-soft xs" onClick={() => setSheet({ mode: 'rename', folder: current })}>Rename</button>
            <button type="button" className="btn-soft xs danger" onClick={() => setSheet({ mode: 'delete', folder: current })}>Delete folder</button>
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty glass">
          <p>{q ? `Nothing matches "${query.trim()}".` : current ? 'This folder is empty. Select takes and move them here.' : filter === 'approved' ? 'Approve a take to keep it here.' : 'Nothing in this view yet.'}</p>
          <button className="btn-blue" onClick={q ? () => setQuery('') : showAll}>{q ? 'Clear search' : 'Show everything'}</button>
        </div>
      ) : (
        <div className={`lib-grid${selecting ? ' selecting' : ''}`}>
          {items.map((it, n) => {
            const on = picked.includes(it.id)
            return (
              <div key={it.id} className={`lib-card glass${it.approved ? ' approved' : ''}${on ? ' picked' : ''}${it.kind === 'audio' ? ' audio' : ''}`}
                style={{ '--ar': it.kind === 'audio' ? '2 / 1' : ratio(it.aspect), '--i': Math.min(n, 12) }}
                onClick={() => (selecting ? toggle(it.id) : it.kind !== 'audio' && setOpen(n))}>
                <Media it={it} />
                <button type="button" className={`lib-pick${on ? ' on' : ''}`} aria-pressed={on} aria-label={on ? 'Deselect' : 'Select'}
                  onClick={(e) => { e.stopPropagation(); toggle(it.id) }}><IconCheck /></button>
                {!selecting && (
                  <div className="lib-acts">
                    <Act label={it.approved ? 'Remove approval' : 'Approve'} on={it.approved} onClick={() => gens.toggleApprove(it.id)}><IconCheck /></Act>
                    <a className="lib-act" href={it.url} download={fileName(it)} aria-label="Download" title="Download" onClick={(e) => e.stopPropagation()}><IconDownload /></a>
                    {['image', 'video'].includes(it.kind) && <button type="button" className="btn-soft xs" onClick={(e) => { e.stopPropagation(); setSchedule(it) }}>Schedule</button>}
                    <Act label="Copy prompt" onClick={() => copy(it)}><IconCopy /></Act>
                    <Act label="Delete" onClick={() => { gens.dismiss(it.id); fs.forget([it.id]) }}><IconTrash /></Act>
                  </div>
                )}
                {copied === it.id && <span className="lib-toast pop">Prompt copied</span>}
                {it.flowName && <span className="lib-flow" title={`Made in the flow ${it.flowName}`}>Flow · {it.flowName}</span>}
                {it.kind !== 'audio' && <div className="result-cap">{it.model} · {it.caption}</div>}
              </div>
            )
          })}
        </div>
      )}

      {selecting && (
        <div className="lib-bulk glass rise" role="toolbar" aria-label="Selected items">
          <span className="lib-bulk-count" aria-live="polite">{chosen.length} selected</span>
          {chosen.length < items.length && <button type="button" className="link-btn" onClick={() => setPicked(items.map((i) => i.id))}>Select all</button>}
          <span className="lib-bulk-grow" />
          <button type="button" className="btn-soft sm" disabled={!chosen.length} onClick={() => downloadAll(chosen)}><IconDownload />Download</button>
          <Pop up right className="lib-move" label="Move to folder" disabled={!chosen.length}>
            <h6>Move {chosen.length} to</h6>
            {fs.folders.map((f) => <button type="button" key={f.id} onClick={() => moveTo(f.id)}>{f.name}</button>)}
            <button type="button" onClick={() => moveTo(null)}>No folder</button>
            <button type="button" className="menu-foot" onClick={() => setSheet({ mode: 'new', move: true })}>New folder</button>
          </Pop>
          <button type="button" className="btn-soft sm danger" disabled={!chosen.length} onClick={remove}><IconTrash />Delete</button>
          <button type="button" className="btn-soft sm" onClick={stopSelecting}>Clear</button>
        </div>
      )}

      {schedule && <Schedule item={schedule} onClose={() => setSchedule(null)} />}
      {sheet && <FolderSheet sheet={sheet} onClose={() => setSheet(null)}
        onSave={(name) => {
          if (sheet.mode === 'rename') fs.rename(sheet.folder.id, name)
          else if (sheet.mode === 'delete') { fs.remove(sheet.folder.id); setFolder('all') }
          else {
            const id = fs.create(name)
            if (sheet.move) moveTo(id)
          }
          setSheet(null)
        }} />}
      {open != null && items[open] && <Viewer items={items} at={open} setAt={setOpen} copy={copy} onClose={() => setOpen(null)} />}
    </>
  )
}

function FolderSheet({ sheet, onClose, onSave }) {
  const [name, setName] = useState(sheet.folder?.name || '')
  const [err, setErr] = useState('')
  const del = sheet.mode === 'delete'
  const title = del ? `Delete "${sheet.folder.name}"?` : sheet.mode === 'rename' ? 'Rename folder' : 'New folder'

  useEffect(() => {
    const key = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [])

  const save = (e) => {
    e.preventDefault()
    if (del) return onSave()
    if (!name.trim()) return setErr('Give it a name first.')
    onSave(name.trim())
  }

  return (
    <div className="viewer" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <form className="form-sheet glass pop lib-sheet" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{title}</h3>
        {del ? <p className="muted">The folder goes away. Its takes stay in All.</p> : (
          <div className="field">
            <label htmlFor="folder-name">Name</label>
            <input id="folder-name" autoFocus value={name} maxLength={40} onChange={(e) => { setName(e.target.value); setErr('') }} placeholder="Campaign shots" />
          </div>
        )}
        {err && <p className="plist-note">{err}</p>}
        <div className="form-sheet-foot">
          <span className="grow" />
          <button type="button" className="btn-soft" onClick={onClose}>Cancel</button>
          <button type="submit" className={del ? 'btn-soft danger' : 'btn-blue sm'}>{del ? 'Delete folder' : sheet.mode === 'rename' ? 'Save' : 'Create folder'}</button>
        </div>
      </form>
    </div>
  )
}
