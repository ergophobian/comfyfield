import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconPlus, IconSearch, IconClose } from '../Icons.jsx'
import { IconHome, IconGrid, IconAt, IconHeart, IconPeople, IconFolder, IconSidebar, IconSort, IconUpDown, IconFilm } from './icons.jsx'
import { useStored } from './Shell.jsx'
import { toolById } from '../../lib/tools.js'

const nav = [
  ['home', 'Home', IconHome],
  ['generations', 'My generations', IconGrid],
  ['elements', 'My elements', IconAt],
  ['favorites', 'My favorites', IconHeart],
  ['community', 'Community', IconPeople],
]
const studios = ['cinema-studio', 'cinematic-cameras', 'create-video', 'create-image', 'influencer', 'character', 'moodboard', 'photodump', 'fashion-factory']

// The studio switcher at the top of the sidebar: jump to any other studio.
function Switcher({ still }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  const here = still ? 'cinematic-cameras' : 'cinema-studio'
  return (
    <div className="cs-switch" ref={ref}>
      <button type="button" className="cs-switch-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="cs-mark"><IconFilm /></span>
        <span className="cs-switch-name">{toolById(here)?.name}</span><IconUpDown />
      </button>
      {open && (
        <div className="menu glass pop" role="menu">
          <h6>Studios</h6>
          {studios.map(toolById).filter(Boolean).map((t) => (
            <Link key={t.id} role="menuitem" to={t.route} className={t.id === here ? 'on' : ''} onClick={() => setOpen(false)}>
              {t.name}<small className="muted">{t.blurb}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CinemaSide({ view, go, projects, onNew, mini, onMini, still }) {
  const [finding, setFinding] = useState(false)
  const [q, setQ] = useState('')
  const [sort, setSort] = useStored('comfyfield.cinema.sort', 'recent')
  const [tip, setTip] = useStored('comfyfield.cinema.tip', true)
  const needle = q.trim().toLowerCase()
  const list = projects
    .filter((p) => !needle || p.name.toLowerCase().includes(needle))
    .sort(sort === 'recent' ? (a, b) => b.updated - a.updated : (a, b) => a.name.localeCompare(b.name))

  const item = (key, label, Icon) => {
    const on = view === key
    return (
      <button key={key} type="button" className={`cs-item${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}
        title={mini ? label : undefined} onClick={() => go(key)}>
        <Icon /><span>{label}</span>
      </button>
    )
  }

  return (
    <aside className={`cs-side glass${mini ? ' mini' : ''}`} aria-label="Cinema studio">
      <div className="cs-brand">
        <Switcher still={still} />
        <button type="button" className="icon-btn cs-fold" aria-label={mini ? 'Expand the sidebar' : 'Collapse the sidebar'} aria-pressed={mini} onClick={onMini}>
          <IconSidebar />
        </button>
      </div>
      <nav className="cs-nav">{nav.map(([key, label, Icon]) => item(key, label, Icon))}</nav>
      <div className="cs-projects">
        <div className="cs-projects-head">
          <span>Projects</span>
          <button type="button" className={`cs-mini-btn${finding ? ' on' : ''}`} aria-label="Search projects" aria-pressed={finding}
            onClick={() => { setFinding((f) => !f); setQ('') }}><IconSearch /></button>
          <button type="button" className="cs-mini-btn" aria-label={sort === 'recent' ? 'Sorted newest first. Sort by name' : 'Sorted by name. Sort newest first'}
            title={sort === 'recent' ? 'Newest first' : 'By name'} onClick={() => setSort(sort === 'recent' ? 'name' : 'recent')}><IconSort /></button>
        </div>
        {finding && (
          <label className="rail-search cs-search">
            <IconSearch />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a project" aria-label="Find a project" />
          </label>
        )}
        <button type="button" className="cs-item add" title={mini ? 'New project' : undefined} onClick={onNew}><IconPlus /><span>New project</span></button>
        <div className="cs-project-list">
          {list.map((p) => item(`project:${p.id}`, p.name, IconFolder))}
          {needle && !list.length && <p className="sa-hint">No project matches that.</p>}
        </div>
      </div>
      {tip && !mini && (
        <div className="cs-tip">
          <button type="button" className="cs-mini-btn" aria-label="Hide this tip" onClick={() => setTip(false)}><IconClose /></button>
          <small>How projects work</small>
          <strong>Set the director's panel once in a project and every shot you make there keeps that look.</strong>
          <button type="button" className="btn-soft sm" onClick={() => { setTip(false); onNew() }}>Start a project</button>
        </div>
      )}
    </aside>
  )
}
