import { PageArt } from '../components/Art.jsx'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import ModelPicker from '../components/ModelPicker.jsx'
import PromptList, { newRows } from '../components/Batch.jsx'
import Pop from '../components/generate/Pop.jsx'
import Slot from '../components/generate/Slot.jsx'
import ShotList, { newShot, shotsPrompt, shotsTotal, snapDuration } from '../components/generate/Shots.jsx'
import { LibraryPicks, RefTags } from '../components/generate/Library.jsx'
import { PresetCard, PresetPicker, PresetRow, cameraPresets, general, presetText } from '../components/generate/Presets.jsx'
import { Banner, Feed, GoButton, PanelTabs, StatusNote, Steps, balanceText, canRun, costText, noun, useBatches, useSticky } from '../components/generate/parts.jsx'
import { asOpen, useDurations, useGenModel } from '../components/generate/useGenModel.js'
import { label, paramsFor, useModelInputs } from '../components/generate/useModelInputs.js'
import { IconAt, IconBook, IconFolder, IconMute, IconPlay, IconSound } from '../components/generate/icons.jsx'
import { IconAspect, IconClock, IconImage, IconSpark, IconStack, IconVideo } from '../components/Icons.jsx'
import { useApp } from '../lib/appContext.js'
import { usePod } from '../lib/usePod.js'
import { acceptsImage } from '../lib/providers.js'
import { openModels } from '../lib/tools.js'
import { estimate, useBalance, useModelMeta } from '../lib/cost.js'
import { flowFromBatch, openFlow } from '../lib/flowStore.js'
import { covers } from '../lib/formats/parts.js'

const panelTabs = [
  { value: 'create', label: 'Create video' },
  { value: 'edit', label: 'Edit video', to: '/video/edit' },
  { value: 'motion', label: 'Motion control' },
]
const mainTabs = [
  { value: 'history', label: <><IconFolder />History</> },
  { value: 'how', label: <><IconBook />How it works</> },
]
const animate = asOpen(openModels.find((m) => m.id === 'wan-animate-2'))

function CreateVideo({ preset, onPresets, setError, onRan, addBatch }) {
  const { gens, connections } = useApp()
  const { status: pod } = usePod()
  const pick = useGenModel('video')
  const { model } = pick
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)
  const [multi, setMulti] = useState(false)
  const [shots, setShots] = useState(() => [newShot(3), newShot(2)])
  const [batchMode, setBatchMode] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [rows, setRows] = useState(newRows)
  const [refs, setRefs] = useState([])
  const [aspect, setAspect] = useState('16:9')
  const [duration, setDuration] = useState(5)
  const [resolution, setResolution] = useState(null)
  const [sound, setSound] = useState(null)
  const [takes, setTakes] = useState(1)
  const navigate = useNavigate()
  const balance = useBalance()
  const metaOf = useModelMeta([model])
  const durations = useDurations(model)
  const inputs = useModelInputs(model, Boolean(start))

  const canAttach = model.open || model.provider !== 'comfy' || acceptsImage(model)
  const needsFrame = ['ltx_i2v', 'h3_i2v'].includes(model.workflow)
  const endOk = model.open || (Boolean(inputs.endFrame) && Boolean(start))
  const endNote = !canAttach ? `${model.name} starts from text only` : !model.open && !inputs.endFrame ? `${model.name} takes a start frame only` : 'Add a start frame first'
  const images = canAttach ? [start?.url, ...refs.flatMap((r) => r.images.slice(0, 1))].filter(Boolean) : []
  const ratio = inputs.ratios.includes(aspect) ? aspect : ['16:9', 'auto'].find((r) => inputs.ratios.includes(r)) || inputs.ratios[0]
  const shownRes = (resolution && inputs.resolutions?.includes(resolution) && resolution) || (inputs.resolutionDefault != null ? String(inputs.resolutionDefault) : inputs.resolutions?.[0])
  const soundOn = inputs.sound ? (inputs.sound.fixed ? true : sound ?? inputs.sound.default) : false
  const picked = durations.includes(duration) ? duration : durations.includes(5) ? 5 : durations[0] ?? duration
  const shotTotal = shotsTotal(shots)
  const dur = multi ? snapDuration(shotTotal, durations) : picked
  const move = presetText(preset, Boolean(start))
  const withMove = (p) => (move ? `${p.replace(/[\s.!?]+$/, '')}. ${move}` : p)

  const batching = batchMode && !multi
  const connected = canRun(model, connections)
  const prompts = multi ? [shotsPrompt(shots)].filter(Boolean) : batching ? rows.map((r) => r.text.trim()).filter(Boolean) : prompt.trim() ? [prompt.trim()] : []
  const perPrompt = batching ? takes : 1
  const total = prompts.length * perPrompt
  const each = estimate(model, metaOf(model), { aspect: ratio, count: 1, duration: dur, takes: perPrompt })
  const cost = each && prompts.length ? { usd: each.usd * prompts.length, approx: each.approx } : null
  const bal = !model.open && balanceText(balance, model.provider)

  const go = (e) => {
    e?.preventDefault()
    if (!prompts.length || !connected || (needsFrame && !start)) return
    const batch = { id: crypto.randomUUID(), prompts, total, model: model.name, kind: 'video' }
    if (batching) addBatch(batch)
    const params = paramsFor(inputs, { resolution, sound, endFrame: endOk && start && end ? end.url : null })
    prompts.forEach((p, r) => {
      const full = withMove(p)
      const caption = multi ? shots.map((s) => s.text.trim()).filter(Boolean).join(' / ') : p
      for (let t = 0; t < perPrompt; t++) {
        gens.generate(model, {
          prompt: full, caption, aspect: ratio, count: 1, duration: dur, images,
          ...(Object.keys(params).length && { params }), ...(refs.length && { refs }),
        }, batching ? { batch: batch.id, row: r } : {})
      }
    })
    onRan()
  }

  const openAsFlow = async () => {
    try {
      await openFlow(flowFromBatch({ prompts: prompts.map(withMove), model, aspect: ratio, duration: dur, takes, count: 1 }))
      navigate('/flows')
    } catch (e) { setError(e.message) }
  }

  return (
    <form className="gen-form" onSubmit={go}>
      <PresetCard preset={preset} model={model} onChange={onPresets} />
      <div className="gen-frames">
        <Slot id="start-frame" title="Start frame" tag={needsFrame ? 'Required' : 'Optional'} value={start} onChange={(v) => { setStart(v); if (!v) setEnd(null) }} setError={setError}
          disabled={!canAttach} note={`${model.name} starts from text only`} hint="Image to animate" />
        <Slot title="End frame" tag="Optional" value={end} onChange={setEnd} setError={setError} disabled={!endOk} note={endNote} hint="Where the shot lands" />
      </div>
      <button type="button" className={`switch gen-switch${multi ? ' on' : ''}`} aria-pressed={multi} onClick={() => setMulti((m) => !m)}
        title="Split the clip into shots, each with its own prompt and length">
        Multi-shot<i />
      </button>
      <div className="gen-box">
        {multi ? <ShotList shots={shots} setShots={setShots} /> : batching ? (
          <div className="gen-box-list"><PromptList rows={rows} setRows={setRows} kind="video" /></div>
        ) : (
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} aria-label="Prompt"
            placeholder={start ? 'Describe how the frame should move' : 'Describe a shot, e.g. a cyclist racing through a rainy night market'}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), go())} />
        )}
        <div className="chips">
          <Pop keep icon={<IconAt />} label={refs.length ? `${refs.length} ${refs.length === 1 ? 'element' : 'elements'}` : 'Elements'} lit={refs.length > 0} title="Elements from Library">
            <LibraryPicks refs={refs} setRefs={setRefs} />
          </Pop>
          {inputs.sound && (
            <div className="chip">
              <button type="button" className={soundOn ? 'lit' : ''} aria-pressed={soundOn} disabled={inputs.sound.fixed}
                title={inputs.sound.fixed ? `${model.name} always renders sound` : 'Sound'} onClick={() => setSound(!soundOn)}>
                {soundOn ? <IconSound /> : <IconMute />}{soundOn ? 'Sound on' : 'Sound off'}
              </button>
            </div>
          )}
          {!multi && (
            <Segmented className="seg-sm gen-mode" value={batchMode ? 'batch' : 'single'} onChange={(v) => setBatchMode(v === 'batch')}
              options={[{ value: 'single', label: 'Single' }, { value: 'batch', label: 'Batch' }]} />
          )}
        </div>
        <RefTags refs={refs} setRefs={setRefs} />
      </div>
      <ModelPicker variant="row" model={model} options={pick.options} open={pick.open} favorites={pick.favorites}
        toggleFavorite={pick.toggleFavorite} choose={pick.choose} connections={connections} />
      <div className="chips gen-settings">
        {durations.length > 0 && (multi ? (
          <div className="chip"><button type="button" disabled title="Set by the shot lengths"><IconClock />{dur}s</button></div>
        ) : (
          <Pop icon={<IconClock />} label={`${picked}s`} title="Duration">
            {durations.map((d) => <button key={d} type="button" className={d === picked ? 'on' : ''} onClick={() => setDuration(d)}>{d} seconds</button>)}
          </Pop>
        ))}
        <Pop icon={<IconAspect />} label={label(ratio)} title="Aspect ratio">
          {inputs.ratios.map((a) => <button key={a} type="button" className={a === ratio ? 'on' : ''} onClick={() => setAspect(a)}>{label(a)}</button>)}
        </Pop>
        {inputs.resolutions && (
          <Pop icon={<IconImage />} label={shownRes} title="Resolution">
            {inputs.resolutions.map((v) => <button key={v} type="button" className={v === shownRes ? 'on' : ''} onClick={() => setResolution(v)}>{v}</button>)}
          </Pop>
        )}
        {batching && (
          <Pop icon={<IconStack />} label={`${takes} ${takes === 1 ? 'take' : 'takes'}`} title="Takes per prompt">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} type="button" className={n === takes ? 'on' : ''} onClick={() => setTakes(n)}>
                {n} {n === 1 ? 'take' : 'takes'} per prompt{n > 1 && <small>Pick the best one after</small>}
              </button>
            ))}
          </Pop>
        )}
      </div>
      {multi && (
        <p className="gen-hint">
          {shots.length} {shots.length === 1 ? 'shot' : 'shots'} · {shotTotal}s{durations.length > 0 && dur !== shotTotal ? `, renders as ${dur}s` : ''}
        </p>
      )}
      <StatusNote model={model} connected={connected} />
      <div className="gen-go-row">
        {batching && prompts.length > 0 && !model.open && <button type="button" className="btn-soft" onClick={openAsFlow}>Open as flow</button>}
        <GoButton total={total} cost={costText(cost)} disabled={!total || !connected || (needsFrame && !start)} />
      </div>
      {connected && (
        <p className="gen-sum">
          {total > 0 ? (
            <>
              <strong>{batching ? `${prompts.length} ${prompts.length === 1 ? 'prompt' : 'prompts'} × ${perPrompt} = ` : ''}{total} {noun.video[total === 1 ? 0 : 1]}</strong>
              {cost ? ` · ${costText(cost)}` : model.provider === 'comfy' ? pod?.phase === 'ready' ? ' · runs on your Pod' : model.pod ? ' · runs on a Pod' : ' · uses Comfy credits' : model.provider === 'comfyRouter' ? ' · uses Comfy credits' : ''}
            </>
          ) : 'The cost shows on Generate before you run'}
          {bal && <span>{bal}</span>}
        </p>
      )}
    </form>
  )
}

function MotionControl({ setError }) {
  const { connections } = useApp()
  const [video, setVideo] = useState(null)
  const [character, setCharacter] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState('720p')
  const [scene, setScene] = useState(false)
  const [from, setFrom] = useState('image')
  return (
    <form className="gen-form" onSubmit={(e) => e.preventDefault()}>
      <div className="gen-preset" style={{ background: covers.rose }}>
        <span className="gen-preset-text">
          <strong>Motion control</strong>
          <small>Copy the moves in a video onto your character</small>
        </span>
      </div>
      <div className="gen-frames">
        <Slot type="video" title="Add motion to copy" hint="A clip of 3 to 30 seconds" value={video} onChange={setVideo} setError={setError} />
        <Slot title="Add your character" hint="Face and body in view" value={character} onChange={setCharacter} setError={setError} />
      </div>
      <div className="gen-box">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} aria-label="Prompt"
          placeholder="Optional: a new setting, e.g. on a rooftop at sunset" />
      </div>
      <ModelPicker variant="row" model={animate} options={[]} open={[animate]} favorites={[]} toggleFavorite={() => {}} choose={() => {}} connections={connections} />
      <div className="chips gen-settings">
        <Pop icon={<IconSpark />} label={quality} title="Quality">
          {['720p', '1080p'].map((v) => <button key={v} type="button" className={v === quality ? 'on' : ''} onClick={() => setQuality(v)}>{v}</button>)}
        </Pop>
      </div>
      <button type="button" className={`switch gen-switch${scene ? ' on' : ''}`} aria-pressed={scene} onClick={() => setScene((s) => !s)}>
        Scene control<i />
      </button>
      {scene && (
        <div className="gen-scene pop">
          <Segmented className="seg-sm" value={from} onChange={setFrom}
            options={[{ value: 'video', label: <><IconVideo />Video</> }, { value: 'image', label: <><IconImage />Image</> }]} />
          <p className="gen-hint">Pick where the background comes from: the motion video or the character image.</p>
        </div>
      )}
      <StatusNote model={animate} connected={false} wiredNote="Motion control is not wired yet. It runs on Wan Animate 2 on Comfy Cloud or a Pod once its workflow is ready." />
      <div className="gen-go-row">
        <GoButton total={1} disabled />
      </div>
    </form>
  )
}

// Higgsfield's Create video: settings on the left, history and how it works on the right.
export default function VideoStudio() {
  const { gens } = useApp()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'motion' ? 'motion' : 'create'
  const presets = cameraPresets()
  const [preset, setPreset] = useState(() => presets.find((f) => f.id === params.get('preset')) || general)
  const [picking, setPicking] = useState(false)
  const [main, setMain] = useState('history')
  const [error, setError] = useState(null)
  const [batches, addBatch] = useBatches('video')
  const [panel, sticks] = useSticky()

  const setTab = (t) => {
    const next = new URLSearchParams(params)
    if (t === 'motion') next.set('tab', 'motion')
    else next.delete('tab')
    setParams(next, { replace: true })
  }
  const choosePreset = (f) => { setPreset(f); if (tab !== 'create') setTab('create') }

  const explainer = tab === 'motion' ? (
    <div className="gen-explain">
      <div className="gen-explain-head rise">
        <PageArt id="video" />
        <h1>Put your character in any move</h1>
        <p>Take the motion from one video and play it back with the character from your photo.</p>
      </div>
      <Steps steps={[
        { title: 'Add a motion video', text: 'One clear subject, no camera cuts, 3 to 30 seconds.', art: <IconVideo />, cover: covers.rose },
        { title: 'Add your character', text: 'Arms and hands in view, with room around the body.', art: <IconImage />, cover: covers.lilac },
        { title: 'Get a video', text: 'Your character performs the same moves, timing and expressions.', art: <IconPlay />, cover: covers.sky },
      ]} />
    </div>
  ) : (
    <div className="gen-explain">
      <div className="gen-explain-head rise">
        <PageArt id="video" />
        <h1>Turn a still into a shot</h1>
        <p>{presets.length} camera moves to start from, or General for full control with your own prompt.</p>
      </div>
      <Steps steps={[
        { title: 'Add an image', text: 'Drop in a start frame, or skip it and describe the shot.', art: <IconImage />, cover: covers.sky,
          onClick: () => document.getElementById('start-frame')?.click() },
        { title: 'Choose a preset', text: 'Pick a camera move, or keep General.', art: <IconSpark />, cover: covers.lilac, onClick: () => setPicking(true) },
        { title: 'Get a video', text: 'Press Generate. Your clip lands in History.', art: <IconPlay />, cover: covers.peach },
      ]} />
      <div className="gen-sub">
        <h2>Motion presets</h2>
        <button type="button" className="link-btn" onClick={() => setPicking(true)}>See all</button>
      </div>
      <PresetRow list={presets} value={preset} onPick={choosePreset} />
    </div>
  )

  return (
    <main className="gen gen-split">
      <aside className={`gen-panel glass${sticks ? ' stick' : ''}`} ref={panel} aria-label="Video settings">
        <PanelTabs tabs={panelTabs} value={tab} onChange={setTab} label="Video tools" />
        {error && <p className="gen-status error">{error}</p>}
        {tab === 'motion' ? <MotionControl setError={setError} /> : (
          <CreateVideo preset={preset} onPresets={() => setPicking(true)} setError={setError}
            onRan={() => setMain('history')} addBatch={addBatch} />
        )}
      </aside>

      <section className="gen-main">
        <div className="gen-main-head">
          <Segmented value={main} onChange={setMain} options={mainTabs} />
        </div>
        <Banner />
        {gens.error && <div className="notice glass error gen-notice">{gens.error}{gens.retry && <button type="button" className="link-btn" onClick={gens.retry}>Retry</button>}</div>}
        {main === 'how' ? explainer : <Feed kind="video" gens={gens} batches={batches} empty={explainer} />}
      </section>

      {picking && <PresetPicker value={preset} onPick={choosePreset} onClose={() => setPicking(false)} />}
    </main>
  )
}
