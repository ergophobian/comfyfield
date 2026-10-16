import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SettingsMenu from '../SettingsMenu.jsx'
import MegaMenu, { Badge } from './MegaMenu.jsx'
import MobileNav from './MobileNav.jsx'
import { Glyph } from './ToolIcon.jsx'
import { barItems, menuOf, sectionOf } from './navModel.js'

const PANEL = 'mega-panel'
const SHEET = 'mobile-nav'
// Long enough to cross the gap between a trigger and its panel.
const LEAVE_MS = 160
const touch = (e) => e.pointerType === 'touch'

export default function TopBar() {
  const { pathname, search } = useLocation()
  const section = sectionOf(pathname, search)
  const [open, setOpen] = useState(null)
  const [sheet, setSheet] = useState(false)
  const [more, setMore] = useState(false)
  const how = useRef(null)
  const timer = useRef(null)
  const quiet = useRef(false)
  const focusTo = useRef(null)
  const panel = useRef(null)
  const list = useRef(null)
  const burger = useRef(null)
  const triggers = useRef({})

  const openRef = useRef(null)
  openRef.current = open

  const cancel = () => clearTimeout(timer.current)
  const show = (id, by) => { cancel(); how.current = by; setOpen(id) }
  const close = (refocus) => {
    const t = triggers.current[openRef.current]
    cancel()
    setOpen(null)
    // Focus going back to the trigger must not reopen it through onFocus.
    if (refocus && t && document.activeElement !== t) { quiet.current = true; t.focus() }
  }
  const leave = (e) => { if (!touch(e)) { cancel(); timer.current = setTimeout(() => setOpen(null), LEAVE_MS) } }
  const enter = (e) => { if (!touch(e)) cancel() }

  useEffect(() => { setOpen(null); setSheet(false) }, [pathname, search])
  useEffect(() => () => cancel(), [])

  // Click or tap outside, Escape, or focus moving elsewhere closes the open menu.
  useEffect(() => {
    if (!open) return
    const inside = (t) => panel.current?.contains(t) || triggers.current[open]?.contains(t)
    const down = (e) => !inside(e.target) && setOpen(null)
    // Another trigger taking focus opens its own menu in its onFocus, so leave that to it.
    const focus = (e) => !inside(e.target) && !Object.values(triggers.current).includes(e.target) && setOpen(null)
    const key = (e) => e.key === 'Escape' && close(panel.current?.contains(document.activeElement))
    document.addEventListener('pointerdown', down)
    document.addEventListener('focusin', focus)
    window.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('focusin', focus)
      window.removeEventListener('keydown', key)
    }
  }, [open])

  // Opening from the keyboard lands on the first (or last) item.
  const focusIn = (where) => {
    const items = panel.current?.querySelectorAll('[data-col="0"]')
    const el = where === 'last' ? items?.[items.length - 1] : items?.[0]
    el?.focus()
  }
  useEffect(() => {
    if (!open || !focusTo.current) return
    focusIn(focusTo.current)
    focusTo.current = null
  }, [open])

  // The sheet is only for narrow screens; drop it if the window grows past the breakpoint.
  useEffect(() => {
    if (!sheet) return
    const mq = window.matchMedia('(min-width: 721px)')
    const wide = () => mq.matches && setSheet(false)
    mq.addEventListener('change', wide)
    return () => mq.removeEventListener('change', wide)
  }, [sheet])

  // Fade the bar's right edge while more items sit off screen, as Higgsfield does.
  useLayoutEffect(() => {
    const el = list.current
    if (!el) return
    const measure = () => setMore(el.scrollWidth - el.scrollLeft - el.clientWidth > 1)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    el.addEventListener('scroll', measure, { passive: true })
    return () => { ro.disconnect(); el.removeEventListener('scroll', measure) }
  }, [])

  const keyOpen = (id, where) => {
    if (open === id && panel.current) { how.current = 'key'; focusIn(where); return }
    focusTo.current = where
    show(id, 'key')
  }
  const triggerProps = (id) => ({
    ref: (el) => { triggers.current[id] = el },
    id: `bar-${id}`,
    'aria-haspopup': 'menu',
    'aria-expanded': open === id,
    'aria-controls': open === id ? PANEL : undefined,
    onPointerEnter: (e) => { if (!touch(e)) show(id, 'hover') },
    onPointerLeave: leave,
    onFocus: (e) => {
      if (quiet.current) { quiet.current = false; return }
      if (e.currentTarget.matches(':focus-visible')) show(id, 'focus')
    },
    onClick: (e) => {
      if (e.detail === 0) return keyOpen(id, 'first')
      if (open === id && how.current !== 'hover') return close(false)
      show(id, 'click')
    },
    onKeyDown: (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); keyOpen(id, 'first') }
      if (e.key === 'ArrowUp') { e.preventDefault(); keyOpen(id, 'last') }
    },
  })

  // Left and right walk the bar itself.
  const barKeys = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const items = [...list.current.querySelectorAll('.bar-item')]
    const at = items.indexOf(e.target)
    if (at < 0) return
    e.preventDefault()
    items[(at + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length].focus()
  }

  const closeSheet = (refocus) => { setSheet(false); if (refocus) burger.current?.focus() }

  return (
    <header className="nav">
      <Link to="/" className="brand"><img src="/logo.svg" alt="" />ComfyField</Link>
      <nav className={`bar${more ? ' more' : ''}`} aria-label="Main">
        <ul className="bar-list" ref={list} onKeyDown={barKeys}>
          {barItems.map((b) => (
            b.divider ? <li key={b.id} className="bar-div" aria-hidden="true" /> : (
              <li key={b.id}>
                {b.menu ? (
                  <button type="button" className={`bar-item${section === b.id ? ' on' : ''}`} {...triggerProps(b.id)}>{b.name}</button>
                ) : (
                  <Link to={b.to} className={`bar-item${section === b.id ? ' on' : ''}`} aria-current={section === b.id ? 'page' : undefined}
                    onPointerEnter={(e) => { if (!touch(e) && open) close(false) }}>
                    {b.name}<Badge badge={b.badge} />
                  </Link>
                )}
              </li>
            )
          ))}
        </ul>
      </nav>
      <div className="nav-right">
        <SettingsMenu />
        <a className="btn-soft" href="https://github.com/ergophobian/comfyfield" target="_blank" rel="noreferrer">GitHub ›</a>
        <button ref={burger} type="button" className="icon-btn nav-burger" aria-label="Menu" aria-expanded={sheet} aria-controls={SHEET}
          onClick={() => setSheet(true)}><Glyph name="menu" /></button>
      </div>
      {open && (
        <MegaMenu ref={panel} id={PANEL} menu={menuOf(open)} labelledBy={`bar-${open}`} onClose={close}
          onNavigate={() => close(false)} onPointerEnter={enter} onPointerLeave={leave} />
      )}
      {sheet && <MobileNav id={SHEET} onClose={closeSheet} />}
    </header>
  )
}
