import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Field } from '../components/formats/Fields.jsx'
import FormatReview from '../components/formats/Review.jsx'
import { stepModel } from '../lib/formats/options.js'
import Results from '../components/Results.jsx'
import { AppGrid } from '../components/apps/AppCard.jsx'
import { mainInput, pathFor, valuesFrom } from '../components/apps/data.js'
import { IconAudio, IconChevron, IconCube, IconImage, IconSpark, IconVideo } from '../components/Icons.jsx'
import { useApp } from '../lib/appContext.js'
import { appsIn, categoryOf, formatById, formats, hubs, isWired } from '../lib/formats/index.js'
import { initialValues, missingInputs, visibleInputs } from '../lib/recipes.js'
import { providerInfo } from '../lib/catalog.js'
import { estimate, money, useModelMeta } from '../lib/cost.js'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const icons = { image: IconImage, video: IconVideo, audio: IconAudio, '3d': IconCube }
const nouns = { image: 'image', video: 'video', audio: 'audio', '3d': '3D' }
const homes = { effects: '/effects', mixed: '/mixed-media', camera: '/motion' }

// Any format as its own page: the format in a card in the middle, its settings in a panel on the right.
export default function AppPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const motion = pathname.startsWith('/motion')
  const found = formatById(id)
  const format = found && isWired(found) ? found : null
  const home = motion ? { to: '/motion', name: 'Motion presets' } : { to: '/apps', name: 'Apps' }
  // Cards at the foot of the page open another app, which should start at its top.
  useEffect(() => { window.scrollTo(0, 0) }, [id])

  return (
    <main className="app-page">
      <nav className="crumbs rise" aria-label="Breadcrumb">
        <Link to={home.to}>{home.name}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{format ? format.name : 'Not found'}</span>
      </nav>
      {format ? <AppView key={format.id} format={format} motion={motion} /> : (
        <div className="empty glass rise">
          <strong>Nothing lives at this address.</strong>
          <p>The {motion ? 'preset' : 'app'} may have been renamed or removed.</p>
          <Link className="btn-blue sm" to={home.to}>Browse {home.name.toLowerCase()}</Link>
        </div>
      )}
    </main>
  )
}

function AppView({ format, motion }) {
  const { gens, connections } = useApp()
  const { state } = useLocation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [values, setValues] = useState(() => ({ ...initialValues(format), ...valuesFrom(format, params, state) }))
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)
  const [running, setRunning] = useState(false)
  const results = useRef(null)
  const set = (id, v) => { setSession(null); setValues((x) => ({ ...x, [id]: v })) }

  const model = stepModel(format, format.steps.find((step) => !step.type), values)
  const metaOf = useModelMeta([model])
  const provider = providerInfo[model.provider === 'comfyRouter' ? 'comfy' : model.provider]
  const wired = isWired(format)
  const connected = model.provider === 'comfy' || connections[model.provider === 'comfyRouter' ? 'comfy' : model.provider]?.connected
  const missing = missingInputs(format, values)
  const each = estimate(model, metaOf(model), { aspect: '1:1', count: 1, duration: format.settings?.duration })
  const main = mainInput(format)
  const rest = visibleInputs(format, values).filter((i) => i.id !== main?.id)
  const Icon = icons[format.kind] || IconSpark

  const mine = gens.items.filter((g) => g.formatId === format.id)
  const done = mine.filter((g) => !g.failed)
  const failed = mine.filter((g) => g.failed)
  const pending = mine.filter((g) => g.pending).length
  const last = useRef(pending)
  useEffect(() => {
    if (pending > last.current) results.current?.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'nearest' })
    last.current = pending
  }, [pending])

  const more = useMemo(() => {
    const pool = format.hub ? appsIn(format.hub) : formats.filter((f) => f.category === format.category)
    return pool.filter((f) => f.id !== format.id).slice(0, 10)
  }, [format])
  const where = format.hub ? hubs.find((h) => h.id === format.hub)?.name : categoryOf(format.category, format.kind)?.name
  const seeAll = motion ? '/motion' : format.hub ? `/apps?hub=${format.hub}` : homes[format.category] || `/apps?hub=${format.category}`

  const run = async (e) => {
    e.preventDefault()
    if (!wired || missing.length || !connected) return
    setRunning(true)
    setError(null)
    setSession(null)
    try { setSession(await gens.generateFormat(format, values, { onSession: setSession })) } catch (e) { if (e.session) setSession(e.session); setError(e.message) }
    finally { setRunning(false) }
  }
  const use = (id, initial) => {
    const f = formatById(id)
    if (f) navigate(pathFor(f), { state: { values: initial } })
  }

  let note = null
  if (!wired) note = <>Not wired yet. Runs on {format.runsOn || 'open weights'} once the engine is connected.</>
  else if (!connected) note = <>This runs on {provider.name}. <Link to="/connections">Add your key</Link> to use it.</>
  else if (missing.length) note = <>Still needed: {missing.map((i) => i.label).join(', ')}</>
  else if (!each) note = <>Runs on {provider.name}</>

  return (
    <>
      <form className="app-layout" onSubmit={run}>
        <section className="app-stage">
          <div className="app-hero glass rise">
            {!(main && values[main.id]) && (
              <span className="app-cover" style={{ background: format.cover }}>
                {format.preview && <video src={format.preview} muted loop playsInline autoPlay={!calm()} />}
              </span>
            )}
            <h1>{format.name}</h1>
            <p>{format.blurb}</p>
            <span className="recipe-tags app-tags">
              {format.runsOn && <em title={format.runsOn}>{format.runsOn}</em>}
              {!wired && <em className="todo">Not wired yet</em>}
            </span>
            {main && (
              <div className="app-main">
                <Field input={main} value={values[main.id]} onChange={(v) => set(main.id, v)} setError={setError} />
              </div>
            )}
          </div>
        </section>

        <aside className="app-panel glass" aria-label={`${format.name} settings`}>
          <h2><Icon />{format.name}</h2>
          {format.output && <p className="sheet-output"><strong>You get</strong> {format.output}</p>}
          {rest.length > 0 ? rest.map((input) => (
            <Field key={input.id} input={input} value={values[input.id]} onChange={(v) => set(input.id, v)} setError={setError} />
          )) : (
            <p className="sheet-note">Nothing else to set. Add your {(main?.label || 'media').toLowerCase()} and generate.</p>
          )}
          {error && !session && <p className="sheet-error">{error}</p>}
          {session && <FormatReview key={session.flow.id + session.flow.values.renderer} session={session} />}
          <div className="app-go">
            <button className="btn-blue" disabled={running || !wired || missing.length > 0 || !connected}>
              {running ? 'Working' : `Generate ${nouns[format.kind] || ''}`}
              {wired && each && <span className="app-cost">{each.approx ? '≈' : ''}{money(each.usd)}</span>}
            </button>
            {note && <p className="sheet-note">{note}</p>}
          </div>
        </aside>
      </form>

      {mine.length > 0 && (
        <section className="app-results" ref={results}>
          <div className="apps-sec-head">
            <div>
              <h2>Your results</h2>
              <p>Each one is saved to your Library as it finishes.</p>
            </div>
            <Link className="link-btn" to="/library">Open Library<IconChevron /></Link>
          </div>
          {failed.map((g) => (
            <p key={g.id} className="app-failed">
              <span>{g.failed}{g.restoreNote && <> {g.restoreNote}</>}</span>
              {g.retry && <button type="button" className="link-btn" onClick={g.retry}>{g.retry.label || 'Retry'}</button>}
              <button type="button" className="link-btn" onClick={() => gens.dismiss(g.id)}>Dismiss</button>
            </p>
          ))}
          {done.length > 0 && <Results items={done} onUse={use} />}
        </section>
      )}

      {more.length > 0 && (
        <section className="app-more">
          <div className="apps-sec-head">
            <div>
              <h2>{motion ? 'Explore more presets' : 'Explore more apps'}</h2>
              {where && <p>More in {where}</p>}
            </div>
            <Link className="link-btn" to={seeAll}>See all<IconChevron /></Link>
          </div>
          <AppGrid list={more} to={(f) => (motion ? `/motion/${f.id}` : `/apps/${f.id}`)} />
        </section>
      )}
    </>
  )
}
