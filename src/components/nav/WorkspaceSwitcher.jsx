import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IconCheck, IconChevron, IconPlus } from '../Icons.jsx'
import { initialsOf, criteriaText } from '../../../shared/workspaces.js'
import { switchWorkspace, updateWorkspace, useWorkspaces } from '../../lib/workspaces.js'

export function WorkspaceAvatar({ ws, size = 'sm' }) {
  return (
    <span className={`ws-avatar ${size}`} aria-hidden="true">
      {ws?.avatar ? <img src={ws.avatar} alt="" /> : initialsOf(ws?.name)}
    </span>
  )
}

// A small pill in the top bar. The menu switches workspace and turns its prompt rules on or off.
export default function WorkspaceSwitcher() {
  const { workspaces, current } = useWorkspaces()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const btn = useRef(null)
  const { pathname } = useLocation()
  const rules = criteriaText(current)

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    ref.current?.querySelector('[role=menuitemradio][aria-checked=true]')?.focus()
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const key = (e) => {
      if (e.key !== 'Escape') return
      if (ref.current?.contains(document.activeElement)) btn.current?.focus()
      setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('focusin', away)
    window.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('focusin', away)
      window.removeEventListener('keydown', key)
    }
  }, [open])

  const onKeyDown = (e) => {
    if (!open || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return
    e.preventDefault()
    const items = [...ref.current.querySelectorAll('[role^=menuitem]')]
    const at = items.indexOf(document.activeElement)
    items[(at + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus()
  }

  return (
    <div className="nav-menu ws" ref={ref} onKeyDown={onKeyDown}>
      <button ref={btn} type="button" className="ws-chip" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? 'ws-menu' : undefined}
        aria-label={`Workspace: ${current.name}`} onClick={() => setOpen((o) => !o)}>
        <WorkspaceAvatar ws={current} />
        <span className="ws-name">{current.name}</span>
        <IconChevron />
      </button>
      {open && (
        <div id="ws-menu" className="menu glass pop ws-menu" role="menu" aria-label="Workspaces">
          <h6>Workspaces</h6>
          {workspaces.map((w) => (
            <button key={w.id} type="button" role="menuitemradio" aria-checked={w.id === current.id} tabIndex={-1}
              className={`ws-item${w.id === current.id ? ' on' : ''}`} onClick={() => { switchWorkspace(w.id); setOpen(false) }}>
              <WorkspaceAvatar ws={w} />
              <span className="ws-text"><strong>{w.name}</strong>{w.description && <small>{w.description}</small>}</span>
              {w.id === current.id && <IconCheck />}
            </button>
          ))}
          <div className="ws-rules">
            <button type="button" role="menuitemcheckbox" aria-checked={Boolean(current.appendCriteria)} tabIndex={-1} disabled={!rules}
              className={`switch${current.appendCriteria && rules ? ' on' : ''}`} onClick={() => updateWorkspace(current.id, { appendCriteria: !current.appendCriteria })}>
              <i />Add {current.name} rules to prompts
            </button>
            {!rules && <small>No content rules yet.</small>}
          </div>
          <Link to="/workspaces?new=1" role="menuitem" tabIndex={-1} className="ws-link"><IconPlus />New workspace</Link>
          <Link to="/workspaces" role="menuitem" tabIndex={-1} className="ws-link">Manage workspaces</Link>
        </div>
      )}
    </div>
  )
}
