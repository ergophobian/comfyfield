import { ArtImage } from '../components/Art.jsx'
import { heroArt, toolArt, hubArt, modelArt } from '../lib/formats/art.js'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { FormatGrid } from '../components/Recipes.jsx'
import { IconChevron } from '../components/Icons.jsx'
import { Badge } from '../components/nav/MegaMenu.jsx'
import { ToolIcon, ModelIcon, KindIcon, Glyph } from '../components/nav/ToolIcon.jsx'
import { allTools, modelRoute } from '../components/nav/navModel.js'
import { useApp } from '../lib/appContext.js'
import { toolById, openModels } from '../lib/tools.js'
import { formats, formatsFor, hubs, isOpen } from '../lib/formats/index.js'

// The old Create studio kept its place in the query string. Send those links to the page that replaced each view.
function legacyRoute(params) {
  if (params.get('show') === 'generations') return '/assets'
  const kind = params.get('kind')
  const cat = params.get('cat')
  if (cat && cat !== 'create') return cat === 'camera' ? '/motion' : cat === 'effects' ? '/effects' : '/apps'
  if (['image', 'video', 'audio'].includes(kind)) return `/${kind}`
  if (kind === '3d') return '/3d'
  return null
}

export default function Explore() {
  const [params] = useSearchParams()
  const to = legacyRoute(params)
  return to ? <Navigate to={to} replace /> : <Home />
}

const slides = [
  {
    tool: 'cinema-studio', art: 'cinema', cta: 'Open cinema studio',
    title: 'Direct every shot like you are on set',
    line: 'Pick the camera, lens and move, then block the scene one shot at a time.',
    chips: ['35 mm', 'Dolly in', 'f/1.8', '16:9'],
  },
  {
    tool: 'influencer', art: 'influencer', cta: 'Create your influencer',
    title: 'A creator who never runs out of content',
    line: 'Design a face once, then post them anywhere: photos, reels and talking clips.',
    chips: ['Same face in every post', '12 looks'],
  },
  {
    tool: 'create-video', art: 'video', cta: 'Create a video',
    title: 'Turn a prompt or a photo into a moving shot',
    line: 'Open-weight video models with keyframes, camera moves and native sound.',
    chips: ['Image to video', '5 s', 'Sound on'],
  },
]
const ROTATE_MS = 7000
const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function Art({ slide }) {
  return (
    <div className={`ex-art ${slide.art}`} aria-hidden="true">
      <ArtImage src={heroArt(slide.art === 'cinema' ? 'cinema' : slide.art)} width={1600} height={900} />
      {slide.art === 'cinema' && <><span className="ex-frame" /><span className="ex-rec">Rec</span></>}
      {slide.art === 'influencer' && (
        <span className="ex-profile"><i className="ex-avatar" /><span><b /><b /></span></span>
      )}
      {slide.art === 'video' && <><span className="ex-play"><Glyph name="playmark" /></span><span className="ex-track"><i /><i /><i /><i /><i /></span></>}
      <span className="ex-chips">{slide.chips.map((c, n) => <em key={c} style={{ '--i': n }}>{c}</em>)}</span>
    </div>
  )
}

// Rotates through three featured tools. Hover, focus or the pause button stop it; reduced motion never starts it.
function Hero() {
  const [at, setAt] = useState(0)
  const [held, setHeld] = useState(false)
  const [paused, setPaused] = useState(calm)
  const tabs = useRef(null)
  const slide = slides[at]
  const tool = toolById(slide.tool)

  useEffect(() => {
    if (held || paused) return
    const t = setTimeout(() => setAt((i) => (i + 1) % slides.length), ROTATE_MS)
    return () => clearTimeout(t)
  }, [at, held, paused])

  const tabKeys = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: slides.length - 1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = (at + step) % slides.length
    setAt(next)
    tabs.current?.querySelectorAll('[role=tab]')[next]?.focus()
  }

  return (
    <section className="ex-hero glass" aria-roledescription="carousel" aria-label="Featured tools"
      onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}>
      <div className="ex-slide" id="ex-slide" role="tabpanel" aria-roledescription="slide" aria-label={`${at + 1} of ${slides.length}: ${tool.name}`} key={slide.tool}>
        <div className="ex-copy">
          <span className="ex-kicker"><ToolIcon id={tool.id} />{tool.name}<Badge badge={tool.badge} /></span>
          <h1>{slide.title}</h1>
          <p>{slide.line}</p>
          <Link className="btn-blue" to={tool.route}>{slide.cta}</Link>
        </div>
        <Art slide={slide} />
      </div>
      <div className="ex-tabs">
        <div role="tablist" aria-label="Featured tools" ref={tabs} onKeyDown={tabKeys}>
          {slides.map((s, n) => (
            <button key={s.tool} type="button" role="tab" aria-selected={n === at} aria-controls="ex-slide" tabIndex={n === at ? 0 : -1}
              aria-label={toolById(s.tool).name} className={`ex-tab${n === at ? ' on' : ''}`} onClick={() => setAt(n)}>
              <i /><span>{toolById(s.tool).name}</span>
            </button>
          ))}
        </div>
        <button type="button" className="icon-btn ex-pause" aria-label={paused ? 'Play slides' : 'Pause slides'} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          <Glyph name={paused ? 'playmark' : 'pause'} />
        </button>
      </div>
    </section>
  )
}

// Rows that scroll sideways get arrow buttons in their header, for people without a trackpad.
function useStrip() {
  const ref = useRef(null)
  const [ends, setEnds] = useState([true, true])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setEnds([el.scrollLeft < 2, el.scrollLeft + el.clientWidth > el.scrollWidth - 2])
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    el.addEventListener('scroll', measure, { passive: true })
    return () => { ro.disconnect(); el.removeEventListener('scroll', measure) }
  }, [])
  const go = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: calm() ? 'auto' : 'smooth' })
  return { ref, ends, go }
}

function Row({ id, title, line, more, strip, children }) {
  const s = useStrip()
  return (
    <section className="ex-row" aria-labelledby={`ex-${id}`}>
      <div className="ex-row-head">
        <div>
          <h2 id={`ex-${id}`}>{title}</h2>
          <p>{line}</p>
        </div>
        <div className="ex-row-acts">
          {more}
          {strip && <>
            <button type="button" className="icon-btn ex-arrow" aria-label={`Scroll ${title.toLowerCase()} back`} aria-controls={`ex-${id}-strip`} disabled={s.ends[0]} onClick={() => s.go(-1)}><IconChevron dir="left" /></button>
            <button type="button" className="icon-btn ex-arrow" aria-label={`Scroll ${title.toLowerCase()} forward`} aria-controls={`ex-${id}-strip`} disabled={s.ends[1]} onClick={() => s.go(1)}><IconChevron /></button>
          </>}
        </div>
      </div>
      {strip ? <div className="ex-strip" id={`ex-${id}-strip`} ref={s.ref}>{children}</div> : children}
    </section>
  )
}

const kindName = { image: 'Image', video: 'Video', audio: 'Audio', '3d': '3D' }
const kindOfTool = (t) => [t.menu].flat().find((m) => kindName[m])
const tagOfTool = (t) => ([t.menu].flat().includes('studio') ? 'Studio' : null)

// Higgsfield's small tool card: icon, medium chip, name with badge, one line.
function Tile({ to, icon, kind, tag, name, badge, line, sub, i, art, artId }) {
  return (
    <Link to={to} className="ex-tile rise" style={{ '--d': `calc(${Math.min(i, 12)} * var(--stagger))` }}>
      {art && <span className="ex-tile-art"><ArtImage id={artId} src={art} alt={`${name} example`} /></span>}
      <span className="ex-tile-top">
        <span className="mega-icon">{icon}</span>
        {(kind || tag) && <span className="ex-kind">{kind ? <><KindIcon kind={kind} />{kindName[kind]}</> : tag}</span>}
      </span>
      <strong>{name}<Badge badge={badge} /></strong>
      {sub && <span className="ex-sub">{sub}</span>}
      <small>{line}</small>
    </Link>
  )
}

const topIds = ['create-image', 'create-video', 'cinema-studio', 'influencer', 'canvas', 'ads', 'lipsync', 'text-to-speech']

// Featured first, open weights before fal, as featuredFor ranks a kind.
const rank = (f) => (f.featured ? 0 : 2) + (isOpen(f) ? 0 : 1)
const pick = (list, n = 12) => [...list].sort((a, b) => rank(a) - rank(b)).slice(0, n)

function Home() {
  const { openFormat } = useApp()
  const navigate = useNavigate()
  const [allShown, setAllShown] = useState(false)

  const effects = pick(['video', 'image'].flatMap((kind) => formatsFor({ kind, category: 'effects', openOnly: false })))
  const motion = pick(formatsFor({ kind: 'video', category: 'camera', openOnly: false }))
  const apps = pick(formats.filter((f) => f.hub))
  const shown = allShown ? allTools : topIds.map(toolById)
  const openFx = (f) => (f.hub ? navigate(`/apps/${f.id}`) : openFormat(f))

  return (
    <main className="page explore">
      <Hero />

      <Row id="tools" title="Top tools" line="Start with the main studios and generators." more={
        <button type="button" className="link-btn" aria-expanded={allShown} aria-controls="ex-tools" onClick={() => setAllShown((v) => !v)}>
          {allShown ? 'Show fewer' : 'See all'}
        </button>
      }>
        <div className="ex-tools" id="ex-tools">
          {shown.map((t, i) => (
            <Tile key={t.id} i={i} to={t.route} art={toolArt(t.id)} icon={<ToolIcon id={t.id} />} kind={kindOfTool(t)} tag={tagOfTool(t)} name={t.name} badge={t.badge} line={t.blurb} />
          ))}
        </div>
      </Row>

      <Row id="effects" strip title="Effects" line="One photo in, a short effect clip out." more={<Link className="link-btn" to="/effects">See all</Link>}>
        <FormatGrid list={effects} onOpen={openFx} />
      </Row>

      <Row id="apps" strip title="Apps" line="Single-purpose tools for photos and videos." more={<Link className="link-btn" to="/apps">See all</Link>}>
        {apps.length ? <FormatGrid list={apps} onOpen={(f) => navigate(`/apps/${f.id}`)} /> : (
          // Until formats carry a hub, show the hubs themselves.
          <div className="ex-tiles">
            {hubs.map((h, i) => <Tile key={h.id} i={i} to={`/apps#${h.id}`} art={hubArt(h.id)} artId={h.id} icon={<ToolIcon id="apps" />} name={h.name} line={h.blurb} />)}
          </div>
        )}
      </Row>

      <Row id="motion" strip title="Motion presets" line="Camera moves for any photo." more={<Link className="link-btn" to="/motion">See all</Link>}>
        <FormatGrid list={motion} onOpen={(f) => navigate(`/motion/${f.id}`)} />
      </Row>

      <Row id="models" strip title="Open-weight models" line="The models behind each generator, ready to run on ComfyUI." more={<Link className="link-btn" to="/models">See all</Link>}>
        <div className="ex-tiles">
          {openModels.map((m, i) => (
            <Tile key={m.id} i={i} to={modelRoute(m)} art={modelArt(m.kind, m.id)} icon={<ModelIcon model={m} />} kind={m.kind} name={m.name} badge={m.badge} sub={m.vendor} line={m.blurb} />
          ))}
        </div>
      </Row>
    </main>
  )
}
