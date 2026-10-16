import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IconSettings } from './Icons.jsx'

const pages = [
  ['/models', 'Models', 'Browse and add more models'],
  ['/connections', 'Connections', 'Keys, ComfyUI and other services'],
]

// Models and Connections live here so the top bar stays about making things.
export default function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const btn = useRef(null)
  const fromKeys = useRef(false)
  const { pathname } = useLocation()
  const here = pages.some(([to]) => to === pathname)

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    if (fromKeys.current) { fromKeys.current = false; ref.current?.querySelector('[role=menuitem]')?.focus() }
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
    const items = [...ref.current.querySelectorAll('[role=menuitem]')]
    const at = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) { fromKeys.current = true; setOpen(true); return }
      const step = e.key === 'ArrowDown' ? 1 : items.length - 1
      items[at < 0 ? 0 : (at + step) % items.length]?.focus()
    }
  }

  return (
    <div className="nav-menu" ref={ref} onKeyDown={onKeyDown}>
      <button ref={btn} type="button" className={`btn-soft${here ? ' on' : ''}`} aria-expanded={open} aria-haspopup="menu" aria-controls={open ? 'settings-menu' : undefined}
        onClick={(e) => { fromKeys.current = e.detail === 0; setOpen((o) => !o) }}>
        <IconSettings />Settings
      </button>
      {open && (
        <div id="settings-menu" className="menu glass pop" role="menu" aria-label="Settings">
          {pages.map(([to, name, line]) => (
            <Link key={to} to={to} role="menuitem" tabIndex={-1} className={pathname === to ? 'on' : ''} aria-current={pathname === to ? 'page' : undefined}
              onClick={() => setOpen(false)}>
              <strong>{name}</strong><small>{line}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
