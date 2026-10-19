import { ArtImage } from '../components/Art.jsx'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CinemaSide from '../components/studio/CinemaSide.jsx'
import CinemaComposer from '../components/studio/CinemaComposer.jsx'
import Segmented from '../components/Segmented.jsx'
import { IconTrash } from '../components/Icons.jsx'
import { load, save, useStored } from '../components/studio/Shell.jsx'
import { blankShot, genres, byId } from '../components/studio/cinema.js'
import { useApp } from '../lib/appContext.js'
import { useLibrary, toRef } from '../lib/useLibrary.js'
import { covers } from '../lib/formats/parts.js'

const SHOT = 'comfyfield.cinema.shot'
const PROJECTS = 'comfyfield.cinema.projects'

// Local clips only live as long as the tab, so they are never written to storage.
const keepable = (shot) => ({ ...shot, refs: shot.refs.filter((r) => !r.local), clip: null })
const restore = (shot) => ({ ...blankShot, ...shot })

const starters = [
  { genre: 'noir', cover: covers.night },
  { genre: 'epic', cover: covers.dusk },
  { genre: 'comedy', cover: covers.sun },
]

function Posters({ onStart }) {
  return (
    <div className="cs-posters">
      {starters.map((s, i) => {
        const g = byId(genres, s.genre)
        return (
          <button key={s.genre} type="button" className={`cs-poster${i === 1 ? ' mid' : ''}`} style={{ background: s.cover, '--n': i }} onClick={() => onStart(s.genre)}>
            <ArtImage id={{ noir: 'look-phone-flash', epic: 'cinema-shot', comedy: 'roller-coaster' }[s.genre]} />
            <small>New project</small>
            <strong>{g.label}</strong>
            <span>{g.note}</span>
          </button>
        )
      })}
    </div>
  )
}

function Media({ it }) {
  return it.kind === 'video'
    ? <video src={it.url} muted loop playsInline preload="metadata" />
    : <img src={it.url} alt={it.caption || ''} />
}

function Gallery({ items, empty }) {
  if (!items.length) return <div className="empty glass">{empty}</div>
  return (
    <div className="results">
      {items.map((it, i) => (
        <div key={it.id} className="result glass" style={{ '--ar': (it.aspect || '1:1').replace(':', ' / '), animationDelay: `calc(${Math.min(i, 12)} * var(--stagger))` }}>
          <Media it={it} />
          {it.caption && <span className="result-cap">{it.caption}</span>}
        </div>
      ))}
    </div>
  )
}

function Elements({ onCast, onProps }) {
  const lib = useLibrary()
  const [tab, setTab] = useState('characters')
  const list = lib[tab] || []
  return (
    <>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'characters', label: 'Characters' }, { value: 'products', label: 'Props' }]} />
      {lib.ready && !list.length && (
        <div className="empty glass">
          <p>{tab === 'characters' ? 'No characters yet. Cast the same face in every shot once you make one.' : 'No props yet. Save a product in Assets to use it as a prop.'}</p>
          <Link className="btn-blue" to={tab === 'characters' ? '/character' : '/assets?tab=products'}>{tab === 'characters' ? 'Create a character' : 'Add a prop'}</Link>
        </div>
      )}
      <div className="asset-grid">
        {list.map((it, n) => (
          <div key={it.id} className="asset glass cs-element" style={{ '--i': Math.min(n, 12) }}>
            <div className="asset-cover">{it.images?.[0] ? <img src={it.images[0]} alt="" /> : <span>{it.name?.[0]}</span>}</div>
            <strong>{it.name}</strong>
            <span className="muted">{it.images?.length || 0} {it.images?.length === 1 ? 'image' : 'images'}</span>
            {tab === 'characters'
              ? <button type="button" className="btn-soft xs" onClick={() => onCast(it)}>Cast in a shot</button>
              : <button type="button" className="btn-soft xs" disabled={!it.images?.length} onClick={() => onProps(it)}>Add as reference</button>}
          </div>
        ))}
      </div>
    </>
  )
}

export default function CinemaStudio() {
  const { gens } = useApp()
  const [params, setParams] = useSearchParams()
  const still = params.get('mode') === 'image'
  const [view, setView] = useState('home')
  const [back, setBack] = useState('home')
  const [mini, setMini] = useStored('comfyfield.cinema.mini', false)
  const [home, setHome] = useState(() => restore(load(SHOT, {})))
  const [projects, setProjects] = useState(() => load(PROJECTS, []).map((p) => ({ ...p, shot: restore(p.shot) })))

  useEffect(() => { save(SHOT, keepable(home)) }, [home])
  useEffect(() => { save(PROJECTS, projects.map((p) => ({ ...p, shot: keepable(p.shot) }))) }, [projects])

  const projectId = view.startsWith('project:') ? view.slice(8) : null
  const project = projects.find((p) => p.id === projectId)
  const go = (v) => {
    if (v === 'home' || v.startsWith('project:')) setBack(v)
    setView(v)
  }
  useEffect(() => { if (projectId && !project) setView('home') }, [projectId, project])

  // A shot setter for whichever composer is on screen. Accepts a patch, or an updater for the refs list.
  const editShot = (target) => {
    const change = (fn) => (target === 'home'
      ? setHome(fn)
      : setProjects((ps) => ps.map((p) => (p.id === target ? { ...p, shot: fn(p.shot), updated: Date.now() } : p))))
    return {
      set: (patch) => change((s) => ({ ...s, ...patch })),
      setRefs: (fn) => change((s) => ({ ...s, refs: typeof fn === 'function' ? fn(s.refs) : fn })),
    }
  }
  const editProject = (id, patch) => setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch, updated: Date.now() } : p)))

  const newProject = (genre) => {
    const g = genre ? byId(genres, genre) : null
    const n = projects.length + 1
    const p = {
      id: crypto.randomUUID(), name: g ? `${g.label} project` : `Untitled project ${n}`, brief: '',
      created: Date.now(), updated: Date.now(),
      shot: { ...blankShot, ...(genre ? { genre } : {}) },
    }
    setProjects((ps) => [p, ...ps])
    go(`project:${p.id}`)
  }
  const removeProject = (id) => {
    setProjects((ps) => ps.filter((p) => p.id !== id))
    go('home')
  }

  const target = back.startsWith('project:') ? back.slice(8) : 'home'
  const castAndReturn = (item) => {
    const { set } = editShot(target)
    const shot = target === 'home' ? home : projects.find((p) => p.id === target)?.shot || home
    if (!shot.cast.some((m) => m.ref.id === item.id)) {
      set({ cast: [...shot.cast, { ref: toRef('character', item), emotion: null, intensity: 'clear' }], prompt: `${shot.prompt}${shot.prompt ? ' ' : ''}@${item.name} ` })
    }
    setView(back)
  }
  const propsAndReturn = (item) => {
    editShot(target).setRefs((xs) => [...xs, ...item.images.filter((u) => !xs.some((x) => x.url === u)).map((url) => ({ url, name: item.name, kind: 'image' }))])
    setView(back)
  }

  const onKind = (img) => setParams(img ? { mode: 'image' } : {}, { replace: true })
  const made = gens.items.filter((i) => !i.pending && !i.failed && i.url && (i.kind === 'image' || i.kind === 'video'))

  let body
  if (view === 'home') {
    const h = editShot('home')
    body = (
      <>
        <div className="cs-hero">
          <Posters onStart={newProject} />
          <h1 className="rise">{still ? 'Frame every still like a cinematographer' : 'Direct your story shot by shot'}</h1>
        </div>
        <CinemaComposer still={still} onKind={onKind} shot={home} set={h.set} setRefs={h.setRefs} />
      </>
    )
  } else if (project) {
    const h = editShot(project.id)
    body = (
      <>
        <div className="cs-project-head rise">
          <input className="cs-name" value={project.name} aria-label="Project name" onChange={(e) => editProject(project.id, { name: e.target.value })}
            onBlur={(e) => !e.target.value.trim() && editProject(project.id, { name: 'Untitled project' })} />
          <button type="button" className="btn-soft sm danger" onClick={() => removeProject(project.id)}><IconTrash />Delete</button>
        </div>
        <div className="field cs-brief">
          <label htmlFor={`brief-${project.id}`}>Project brief</label>
          <textarea id={`brief-${project.id}`} rows={2} value={project.brief} onChange={(e) => editProject(project.id, { brief: e.target.value })}
            placeholder="What the film is about, who is in it and how it should feel. The look you set below holds for every shot." />
        </div>
        <CinemaComposer still={still} onKind={onKind} shot={project.shot} set={h.set} setRefs={h.setRefs} />
        <div className="studio-sub"><h2>Shots</h2><span className="muted">Every shot made in this project lands here.</span></div>
        <div className="empty glass">No shots yet. Generating is not wired yet, so this stays empty for now.</div>
      </>
    )
  } else if (view === 'generations') {
    body = (
      <>
        <div className="studio-head"><h1>My generations</h1><p>Images and videos you have made, newest first.</p></div>
        <Gallery items={made} empty={<p>Nothing yet. What you make shows up here and in <Link to="/assets">Assets</Link>.</p>} />
      </>
    )
  } else if (view === 'favorites') {
    body = (
      <>
        <div className="studio-head"><h1>My favorites</h1><p>Generations you approved.</p></div>
        <Gallery items={made.filter((i) => i.approved)} empty={<p>No favorites yet. Approve a generation in <Link to="/assets">Assets</Link> to keep it here.</p>} />
      </>
    )
  } else if (view === 'elements') {
    body = (
      <>
        <div className="studio-head"><h1>My elements</h1><p>Characters and props you can cast in any shot.</p></div>
        <Elements onCast={castAndReturn} onProps={propsAndReturn} />
      </>
    )
  } else {
    body = (
      <>
        <div className="studio-head"><h1>Community</h1><p>Projects other people share.</p></div>
        <div className="empty glass">
          <p>Sharing is not built yet. Your projects stay in this browser for now.</p>
          <button type="button" className="btn-blue" onClick={() => newProject()}>Start a project</button>
        </div>
      </>
    )
  }

  return (
    <main className={`cs${mini ? ' mini' : ''}`}>
      <CinemaSide view={view} go={go} projects={projects} onNew={() => newProject()} mini={mini} onMini={() => setMini(!mini)} still={still} />
      <section className="cs-main" key={view}>{body}</section>
    </main>
  )
}
