import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IconClose, IconPlus, IconSearch, IconTrash } from '../components/Icons.jsx'
import { WorkspaceAvatar } from '../components/nav/WorkspaceSwitcher.jsx'
import { DEFAULT_WORKSPACE, MAX_PINNED, MAX_RULES, blankWorkspace } from '../../shared/workspaces.js'
import { createWorkspace, removeWorkspace, switchWorkspace, updateWorkspace, useWorkspaces } from '../lib/workspaces.js'
import { upload } from '../lib/useLibrary.js'
import { formatById, formats } from '../lib/formats/index.js'

function Rules({ label, value, onChange, placeholder }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (!v || value.length >= MAX_RULES) return
    onChange([...value, v])
    setDraft('')
  }
  return (
    <div className="field">
      <label>{label}</label>
      {value.length > 0 && (
        <ul className="ws-rule-list">
          {value.map((r, i) => (
            <li key={`${r}-${i}`}>{r}<button type="button" aria-label={`Remove ${r}`} onClick={() => onChange(value.filter((_, j) => j !== i))}><IconClose /></button></li>
          ))}
        </ul>
      )}
      {value.length < MAX_RULES && (
        <div className="ws-add">
          <input value={draft} placeholder={placeholder} aria-label={label} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} />
          <button type="button" className="btn-soft sm" disabled={!draft.trim()} onClick={add}>Add</button>
        </div>
      )}
    </div>
  )
}

function Pinned({ value, onChange }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const found = useMemo(() => (q ? formats.filter((f) => !value.includes(f.id) && `${f.name} ${f.blurb || ''}`.toLowerCase().includes(q)).slice(0, 6) : []), [q, value])
  return (
    <div className="field">
      <label>Pinned formats</label>
      {value.length > 0 && (
        <ul className="ws-rule-list">
          {value.map((id) => (
            <li key={id}>{formatById(id)?.name || id}<button type="button" aria-label={`Unpin ${formatById(id)?.name || id}`} onClick={() => onChange(value.filter((x) => x !== id))}><IconClose /></button></li>
          ))}
        </ul>
      )}
      {value.length < MAX_PINNED && (
        <div className="ws-add ws-search">
          <IconSearch />
          <input type="search" value={query} placeholder="Find a format to pin" aria-label="Find a format to pin" onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}
      {found.length > 0 && (
        <div className="ws-found">
          {found.map((f) => (
            <button key={f.id} type="button" onClick={() => { onChange([...value, f.id]); setQuery('') }}>
              <IconPlus /><strong>{f.name}</strong><small>{f.blurb}</small>
            </button>
          ))}
        </div>
      )}
      <small className="ws-hint">Pinned formats show first in Apps, Effects and Motion presets.</small>
    </div>
  )
}

function Editor({ ws, onClose }) {
  const [f, setF] = useState(() => ws ? { ...blankWorkspace(), ...ws, criteria: { ...blankWorkspace().criteria, ...ws.criteria } } : blankWorkspace())
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const file = useRef(null)
  const set = (patch) => setF((x) => ({ ...x, ...patch }))
  const setCriteria = (patch) => setF((x) => ({ ...x, criteria: { ...x.criteria, ...patch } }))
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  const pickAvatar = async (picked) => {
    if (!picked) return
    setBusy(true); setErr('')
    try { set({ avatar: await upload(picked) }) } catch (e) { setErr(e.message) }
    setBusy(false)
  }
  const save = async (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setErr('Give the workspace a name first.')
    setBusy(true); setErr('')
    const { id, created, updated, ...data } = f
    try {
      await (ws ? updateWorkspace(ws.id, data) : createWorkspace(data))
      onClose()
    } catch (e2) { setErr(e2.message); setBusy(false) }
  }

  return (
    <div className="viewer" onClick={onClose} role="dialog" aria-label={ws ? `Edit ${ws.name}` : 'New workspace'}>
      <form className="form-sheet glass pop ws-sheet" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{ws ? 'Edit workspace' : 'New workspace'}</h3>
        <div className="ws-identity">
          <button type="button" className="ws-avatar-pick" onClick={() => file.current.click()} disabled={busy} aria-label="Upload an avatar">
            <WorkspaceAvatar ws={f} size="lg" />
            <small>{f.avatar ? 'Change' : 'Upload'}</small>
          </button>
          <div className="field grow">
            <label htmlFor="ws-name">Name</label>
            <input id="ws-name" value={f.name} placeholder="Night drives channel" onChange={(e) => set({ name: e.target.value })} />
            {f.avatar && <button type="button" className="link-btn" onClick={() => set({ avatar: '' })}>Use initials</button>}
          </div>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { pickAvatar(e.target.files[0]); e.target.value = '' }} />
        </div>
        <div className="field">
          <label htmlFor="ws-desc">Description</label>
          <textarea id="ws-desc" rows={2} value={f.description} placeholder="What this channel or brand is about" onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="ws-criteria">Content rules</label>
          <textarea id="ws-criteria" rows={3} value={f.criteria.text} placeholder="Moody neon city at night, 35mm film look, no faces in frame"
            onChange={(e) => setCriteria({ text: e.target.value })} />
        </div>
        <Rules label="Do" value={f.criteria.do} onChange={(v) => setCriteria({ do: v })} placeholder="Teal and orange palette" />
        <Rules label="Do not" value={f.criteria.dont} onChange={(v) => setCriteria({ dont: v })} placeholder="Text or logos in frame" />
        <button type="button" className={`switch${f.appendCriteria ? ' on' : ''}`} aria-pressed={f.appendCriteria} onClick={() => set({ appendCriteria: !f.appendCriteria })}>
          <i />Add these rules to image and video prompts
        </button>
        <Pinned value={f.pinned} onChange={(v) => set({ pinned: v })} />
        {err && <p className="plist-note">{err}</p>}
        <div className="form-sheet-foot">
          {ws && ws.id !== DEFAULT_WORKSPACE && (
            <button type="button" className="btn-soft danger" onClick={async () => { try { await removeWorkspace(ws.id); onClose() } catch (e2) { setErr(e2.message) } }}><IconTrash />Delete</button>
          )}
          <span className="grow" />
          <button type="button" className="btn-soft" onClick={onClose}>Cancel</button>
          <button className="btn-blue sm" disabled={busy}>Save</button>
        </div>
      </form>
    </div>
  )
}

export default function Workspaces() {
  const { workspaces, current, error } = useWorkspaces()
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState(params.get('new') ? 'new' : null)
  useEffect(() => { if (params.get('new')) { setEditing('new'); setParams({}, { replace: true }) } }, [params])

  return (
    <main className="page ws-page">
      <div className="page-head rise">
        <h1>Workspaces</h1>
        <p>One for each channel, brand or project. Each keeps its own look, content rules and pinned formats.</p>
      </div>
      <div className="lib-filters rise"><button type="button" className="btn-blue sm" onClick={() => setEditing('new')}><IconPlus />New workspace</button></div>
      {error && <p className="plist-note">{error}</p>}
      <div className="ws-grid">
        {workspaces.map((w, n) => (
          <article key={w.id} className={`ws-card glass rise${w.id === current.id ? ' on' : ''}`} style={{ '--d': `calc(${Math.min(n, 12)} * var(--stagger))` }}>
            <div className="ws-card-head">
              <WorkspaceAvatar ws={w} size="md" />
              <div>
                <strong>{w.name}</strong>
                {w.id === current.id ? <em className="ws-tag">Active</em> : null}
              </div>
            </div>
            <p>{w.description || 'No description yet.'}</p>
            <small className="muted">
              {[w.criteria?.text || w.criteria?.do?.length || w.criteria?.dont?.length ? (w.appendCriteria ? 'Rules on' : 'Rules off') : 'No rules',
                `${w.pinned?.length || 0} pinned`].join(' · ')}
            </small>
            <div className="ws-card-foot">
              <button type="button" className="btn-soft sm" onClick={() => setEditing(w)}>Edit</button>
              {w.id !== current.id && <button type="button" className="btn-soft sm" onClick={() => switchWorkspace(w.id)}>Switch to</button>}
            </div>
          </article>
        ))}
      </div>
      {editing && <Editor ws={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </main>
  )
}
