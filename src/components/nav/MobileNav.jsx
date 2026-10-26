import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IconClose, IconChevron } from '../Icons.jsx'
import { MenuItem, menuColumns } from './MegaMenu.jsx'
import { ToolIcon, KindIcon, Glyph } from './ToolIcon.jsx'
import { barItems, menuOf, moreTools, sectionOf, currentIn } from './navModel.js'
import { backdrops, setBackdrop, useBackdrop } from '../../lib/backdrop.js'

const settings = [
  { id: 'models', to: '/models', name: 'Models', line: 'Browse and add more models', icon: <Glyph name="bars" /> },
  { id: 'connections', to: '/connections', name: 'Connections', line: 'Keys, ComfyUI and other services', icon: <Glyph name="link" /> },
  { id: 'pods', to: '/pods', name: 'Pods', line: 'Your GPU on RunPod, sizes and settings', icon: <Glyph name="gpu" /> },
]

// Under 720px the bar folds into this full-width sheet with every menu section.
export default function MobileNav({ id, onClose }) {
  const { pathname, search } = useLocation()
  const section = sectionOf(pathname, search)
  const backdrop = useBackdrop()
  const [expanded, setExpanded] = useState(() => (barItems.some((b) => b.menu && b.id === section) ? section : null))
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.querySelector('.mnav-close')?.focus()
    const root = document.documentElement
    const was = root.style.overflow
    root.style.overflow = 'hidden'
    return () => { root.style.overflow = was }
  }, [])

  // Keep Tab inside the sheet while it covers the page.
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(true); return }
    if (e.key !== 'Tab') return
    const all = [...ref.current.querySelectorAll('a[href], button:not(:disabled)')]
    const first = all[0]
    const last = all[all.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  const links = barItems.filter((b) => b.to)
  const done = () => onClose(false)

  return (
    <div ref={ref} id={id} className="mnav" role="dialog" aria-modal="true" aria-label="Menu" onKeyDown={onKeyDown}>
      <div className="mnav-head">
        <Link to="/" className="brand" onClick={done}><img src="/logo.svg" alt="" />ComfyField</Link>
        <button type="button" className="icon-btn mnav-close" aria-label="Close menu" onClick={() => onClose(true)}><IconClose /></button>
      </div>
      <nav className="mnav-body" aria-label="Main">
        <div className="mnav-group">
          {links.slice(0, 1).map((b) => (
            <MenuItem key={b.id} to={b.to} name={b.name} icon={<ToolIcon id={b.id} />} on={section === b.id} onClick={done} />
          ))}
          {barItems.filter((b) => b.menu).map((b) => {
            const menu = menuOf(b.menu)
            const open = expanded === b.id
            const current = currentIn(menu, pathname, search)
            return (
              <div key={b.id}>
                <button type="button" className={`mnav-toggle${section === b.id ? ' on' : ''}`} aria-expanded={open} aria-controls={`${id}-${b.id}`}
                  onClick={() => setExpanded(open ? null : b.id)}>
                  <span className="mega-icon"><KindIcon kind={b.id} /></span>{b.name}<span className="mnav-chev"><IconChevron /></span>
                </button>
                {open && (
                  <div id={`${id}-${b.id}`} className="mnav-sub">
                    {menuColumns(menu).map((c) => (
                      <div key={c.id} role="group" aria-label={c.label}>
                        <h3 aria-hidden="true">{c.label}</h3>
                        {c.items.map((it) => <MenuItem key={it.id} {...it} on={section === b.id && it.id === current} onClick={done} />)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mnav-group">
          <h2>Studios and your work</h2>
          {links.slice(1).map((b) => (
            <MenuItem key={b.id} to={b.to} name={b.name} badge={b.badge} icon={<ToolIcon id={b.id} />} on={section === b.id} onClick={done} />
          ))}
        </div>
        <div className="mnav-group">
          <h2>More</h2>
          {moreTools.map((t) => <MenuItem key={t.id} to={t.route} name={t.name} line={t.blurb} icon={<ToolIcon id={t.id} />} on={pathname === t.route} onClick={done} />)}
        </div>
        <div className="mnav-group">
          <h2>Settings</h2>
          {settings.map((p) => <MenuItem key={p.id} {...p} on={pathname === p.to} onClick={done} />)}
          <a className="mega-item" href="https://github.com/ergophobian/comfyfield" target="_blank" rel="noreferrer">
            <span className="mega-icon"><Glyph name="code" /></span>
            <span className="mega-text"><strong>GitHub</strong><small>Source code and issues</small></span>
          </a>
        </div>
        <div className="mnav-group">
          <h2 id={`${id}-backdrop`}>Background</h2>
          <div className="menu-pick" role="radiogroup" aria-labelledby={`${id}-backdrop`}>
            {backdrops.map((b) => (
              <button key={b.id} type="button" role="radio" aria-checked={backdrop === b.id}
                className={backdrop === b.id ? 'on' : ''} onClick={() => setBackdrop(b.id)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
