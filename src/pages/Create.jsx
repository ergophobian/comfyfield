import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chip, Option } from '../components/Composer.jsx'
import Segmented from '../components/Segmented.jsx'
import Results from '../components/Results.jsx'
import ModelPicker from '../components/ModelPicker.jsx'
import PromptList, { newRows } from '../components/Batch.jsx'
import Board from '../components/Board.jsx'
import { RecipeRow, RecipeLibrary, RecipeSheet } from '../components/Recipes.jsx'
import { IconAspect, IconClock, IconStack, IconSpark, IconClip, IconClose } from '../components/Icons.jsx'
import { aspects, styles, providerInfo } from '../lib/catalog.js'
import { durationsFor, getConnections, uploadImage } from '../lib/providers.js'
import { useModelMeta, estimate, money, useBalance } from '../lib/cost.js'

const attachedPlaceholders = {
  image: 'Describe what should change',
  video: 'Describe how the image should move',
}
const placeholders = {
  image: 'Describe the image you want',
  video: 'Describe a shot, a scene or a moment in motion',
  audio: 'Type a line to voice, or describe a sound',
}
const noun = { image: ['image', 'images'], video: ['video', 'videos'], audio: ['clip', 'clips'] }

function balanceText(b, provider) {
  const x = b[provider]
  if (!x) return null
  if (x.usd != null) return `${money(x.usd)} left on ${providerInfo[provider].name}`
  if (x.left != null) return `${x.left.toLocaleString()} ${x.unit} left`
  return x.note
}

export default function Create({ gens, picker }) {
  const { kind, model, options, setKind, choose } = picker
  const [batchMode, setBatchMode] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [rows, setRows] = useState(newRows)
  const [aspect, setAspect] = useState('1:1')
  const [count, setCount] = useState(1)
  const [takes, setTakes] = useState(1)
  const [durations, setDurations] = useState([])
  const [duration, setDuration] = useState(5)
  const [style, setStyle] = useState(null)
  const [connections, setConnections] = useState({})
  const [batches, setBatches] = useState([])
  const [attached, setAttached] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [recipe, setRecipe] = useState(null)
  const [allRecipes, setAllRecipes] = useState(false)
  const fileRef = useRef(null)
  const balance = useBalance()
  const metaOf = useModelMeta([model])

  useEffect(() => { getConnections().then(setConnections) }, [])
  useEffect(() => { setAspect(kind === 'video' ? '16:9' : '1:1'); setStyle(null) }, [kind])
  useEffect(() => {
    let live = true
    durationsFor(model).then((ds) => {
      if (!live) return
      setDurations(ds)
      if (ds.length && !ds.includes(duration)) setDuration(ds.includes(5) ? 5 : ds[0])
    })
    return () => { live = false }
  }, [model?.id])

  const styleItem = styles.flatMap((g) => g.items).find((s) => s.id === style)
  const connected = model.provider === 'comfy' || connections[model.provider]?.connected
  const prompts = batchMode ? rows.map((r) => r.text.trim()).filter(Boolean) : prompt.trim() ? [prompt.trim()] : []
  const perPrompt = kind === 'image' ? count * takes : takes
  const total = prompts.length * perPrompt
  const opts = { aspect, count, duration }
  const avgChars = prompts.reduce((n, p) => n + p.length, 0) / Math.max(1, prompts.length)
  const each = estimate(model, metaOf(model), { ...opts, takes, chars: avgChars })
  const cost = each && prompts.length ? { usd: each.usd * prompts.length, approx: each.approx } : null

  const canAttach = kind !== 'audio' && model.provider !== 'comfy'
  const images = canAttach && attached ? [attached.url] : []

  const attach = async (file) => {
    if (!file || !canAttach) return
    setUploading(true)
    setUploadError(null)
    try { setAttached(await uploadImage(file)) } catch (e) { setUploadError(e.message) }
    setUploading(false)
  }

  const go = () => {
    if (!prompts.length || !connected) return
    const batch = { id: crypto.randomUUID(), prompts, total, model: model.name, kind }
    if (batchMode) setBatches((bs) => [batch, ...bs])
    prompts.forEach((p, r) => {
      const full = [p, styleItem?.prompt].filter(Boolean).join(', ')
      for (let t = 0; t < takes; t++) {
        gens.generate(model, { prompt: full, caption: p, ...opts, images }, batchMode ? { batch: batch.id, row: r } : {})
      }
    })
  }

  const chips = [
    canAttach && (
      <div key="attach" className={`chip attach${attached ? ' has' : ''}`}>
        <button type="button" className={attached ? 'lit' : ''} onClick={() => (attached ? setAttached(null) : fileRef.current.click())}
          title={attached ? 'Remove image' : 'Attach an image for image to video or editing'}>
          {attached ? <img src={attached.url} alt="" /> : <IconClip />}
          {uploading ? 'Uploading' : attached ? 'Image attached' : 'Image'}
          {attached && <IconClose />}
        </button>
      </div>
    ),
    <ModelPicker key="model" model={model} options={options} favorites={picker.favorites}
      toggleFavorite={picker.toggleFavorite} choose={choose} connections={connections} />,
    kind !== 'audio' && (
      <Chip key="aspect" icon={<IconAspect />} label={aspect}>
        {aspects.map((a) => <Option key={a} on={a === aspect} label={a} onClick={() => setAspect(a)} />)}
      </Chip>
    ),
    kind === 'image' && (
      <Chip key="count" icon={<IconStack />} label={`${count} per run`}>
        {[1, 2, 3, 4].map((n) => <Option key={n} on={n === count} label={`${n} ${noun.image[n === 1 ? 0 : 1]} per run`} onClick={() => setCount(n)} />)}
      </Chip>
    ),
    kind === 'video' && durations.length > 0 && (
      <Chip key="dur" icon={<IconClock />} label={`${duration}s`}>
        {durations.map((d) => <Option key={d} on={d === duration} label={`${d} seconds`} onClick={() => setDuration(d)} />)}
      </Chip>
    ),
    <Chip key="takes" icon={<IconStack />} label={`${takes} ${takes === 1 ? 'take' : 'takes'}`}>
      {[1, 2, 3, 4].map((n) => <Option key={n} on={n === takes} label={`${n} ${n === 1 ? 'take' : 'takes'} per prompt`} note={n > 1 ? 'Pick the best one after' : null} onClick={() => setTakes(n)} />)}
    </Chip>,
    kind !== 'audio' && (
      <Chip key="style" icon={<IconSpark />} label={styleItem?.name || 'Style'} lit={Boolean(styleItem)}>
        <Option on={!style} label="None" onClick={() => setStyle(null)} />
        {styles.map((g) => (
          <div key={g.group}>
            <h6>{g.group}</h6>
            {g.items.map((s) => <Option key={s.id} on={s.id === style} label={s.name} onClick={() => setStyle(s.id)} />)}
          </div>
        ))}
      </Chip>
    ),
  ]

  const singles = gens.items.filter((i) => !i.batch && !i.failed).slice(0, 12)
  const bal = balanceText(balance, model.provider)

  return (
    <main>
      <section className="hero rise">
        <h1>Create with <em>any model</em><br />using your own keys</h1>
        <p>One prompt or a whole content batch. Images, video and audio from ComfyUI, Google, fal and ElevenLabs.</p>
      </section>

      <form className={`composer glass${batchMode ? ' is-batch' : ''}${dragging ? ' dragging' : ''}`} onSubmit={(e) => { e.preventDefault(); go() }}
        onDragOver={(e) => { if (canAttach && e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragging(true) } }}
        onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setDragging(false)}
        onDrop={(e) => { if (!canAttach) return; e.preventDefault(); setDragging(false); attach(e.dataTransfer.files[0]) }}>
        <div className="composer-inner">
          <div className="composer-top">
            <Segmented value={kind} onChange={setKind}
              options={['image', 'video', 'audio'].map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }))} />
            <Segmented className="seg-sm" value={batchMode ? 'batch' : 'single'} onChange={(v) => setBatchMode(v === 'batch')}
              options={[{ value: 'single', label: 'Single' }, { value: 'batch', label: 'Batch' }]} />
          </div>
          <div className="composer-body" key={batchMode ? 'b' : 's'}>
            {batchMode ? <PromptList rows={rows} setRows={setRows} kind={kind} /> : (
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder={(attached && canAttach && attachedPlaceholders[kind]) || placeholders[kind]}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), go())} />
            )}
          </div>
          <div className="chips">{chips}</div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden
            onChange={(e) => { attach(e.target.files[0]); e.target.value = '' }} />
          <div className="composer-foot">
            <div className="summary">
              {total > 0 ? (
                <span><strong>{batchMode ? `${prompts.length} ${prompts.length === 1 ? 'prompt' : 'prompts'} × ${perPrompt} = ` : ''}{total} {noun[kind][total === 1 ? 0 : 1]}</strong>
                  {cost ? ` · ${cost.approx ? '≈' : ''}${money(cost.usd)}` : model.provider === 'comfy' ? ' · runs on your GPU, no API cost' : ''}</span>
              ) : <span className="muted">{batchMode ? 'Add prompts to see the total' : 'The cost shows here before you run'}</span>}
              {bal && <span className="muted">{bal}</span>}
            </div>
            <button className="btn-blue" disabled={!total || !connected}>{total > 1 ? `Generate ${total}` : 'Generate'}</button>
          </div>
        </div>
      </form>

      <RecipeRow kind={kind} onOpen={setRecipe} onAll={() => setAllRecipes(true)} />
      {allRecipes && <RecipeLibrary onOpen={setRecipe} onClose={() => setAllRecipes(false)} />}
      {recipe && <RecipeSheet key={recipe.id} recipe={recipe} gens={gens} connections={connections} onClose={() => setRecipe(null)} />}

      {!connected && (
        <div className="notice glass">{model.name} runs on {providerInfo[model.provider].name}. <Link to="/connections">Add your key</Link> to use it.</div>
      )}
      {uploadError && <div className="notice glass error">{uploadError}</div>}
      {gens.error && <div className="notice glass error">{gens.error}</div>}

      <div className="results-wrap">
        {batches.map((b) => <Board key={b.id} batch={b} items={gens.items} onApprove={gens.toggleApprove} onDismiss={gens.dismiss} />)}
        {singles.length > 0 && <Results items={singles} />}
      </div>
    </main>
  )
}
