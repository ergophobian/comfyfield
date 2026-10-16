import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import ModelPicker from '../components/ModelPicker.jsx'
import PromptList, { newRows } from '../components/Batch.jsx'
import Pop, { Stepper } from '../components/generate/Pop.jsx'
import { LibraryPicks, RefTags } from '../components/generate/Library.jsx'
import { Banner, Feed, GoButton, StatusNote, balanceText, canRun, costText, noun, useBatches, useView } from '../components/generate/parts.jsx'
import { useGenModel } from '../components/generate/useGenModel.js'
import { label, paramsFor, useModelInputs } from '../components/generate/useModelInputs.js'
import { IconAt, IconGrid } from '../components/generate/icons.jsx'
import { IconAspect, IconClose, IconImage, IconPlus, IconSpark } from '../components/Icons.jsx'
import { useApp } from '../lib/appContext.js'
import { uploadImage } from '../lib/providers.js'
import { estimate, useBalance, useModelMeta } from '../lib/cost.js'
import { flowFromBatch, openFlow } from '../lib/flowStore.js'
import { covers } from '../lib/formats/parts.js'

const MAX_REFS = 8
const fan = [covers.peach, covers.dusk, covers.sky, covers.rose]

// Higgsfield's Create image: the feed fills the page and the prompt bar is pinned to the bottom.
export default function ImageStudio() {
  const { gens, connections } = useApp()
  const pick = useGenModel('image')
  const { model } = pick
  const [batchMode, setBatchMode] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [rows, setRows] = useState(newRows)
  const [aspect, setAspect] = useState('1:1')
  const [quality, setQuality] = useState(null)
  const [resolution, setResolution] = useState(null)
  const [count, setCount] = useState(1)
  const [uploads, setUploads] = useState([])
  const [uploading, setUploading] = useState(0)
  const [refs, setRefs] = useState([])
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [view, setView] = useView()
  const [batches, addBatch] = useBatches('image')
  const fileRef = useRef(null)
  const navigate = useNavigate()
  const balance = useBalance()
  const metaOf = useModelMeta([model])

  // ComfyUI's FLUX and SDXL workflows have no image input; every other model takes references.
  const canAttach = model.open || model.provider !== 'comfy'
  const images = canAttach ? [...uploads.map((u) => u.url), ...refs.flatMap((r) => r.images.slice(0, 1))] : []
  const inputs = useModelInputs(model, images.length > 0)
  const ratio = inputs.ratios.includes(aspect) ? aspect : ['1:1', 'auto'].find((r) => inputs.ratios.includes(r)) || inputs.ratios[0]
  const shownQuality = (quality && inputs.qualities?.includes(quality) && quality) || (inputs.qualityDefault != null ? String(inputs.qualityDefault) : inputs.qualities?.[0])
  const shownRes = (resolution && inputs.resolutions?.includes(resolution) && resolution) || (inputs.resolutionDefault != null ? String(inputs.resolutionDefault) : inputs.resolutions?.[0])
  // A model without a count input gets one call per image instead.
  const perCall = inputs.numImages ? count : 1
  const calls = inputs.numImages ? 1 : count

  const connected = canRun(model, connections)
  const prompts = batchMode ? rows.map((r) => r.text.trim()).filter(Boolean) : prompt.trim() ? [prompt.trim()] : []
  const total = prompts.length * count
  const avgChars = prompts.reduce((n, p) => n + p.length, 0) / Math.max(1, prompts.length)
  const each = estimate(model, metaOf(model), { aspect: ratio, count: perCall, duration: 5, takes: calls, chars: avgChars })
  const cost = each && prompts.length ? { usd: each.usd * prompts.length, approx: each.approx } : null
  const bal = !model.open && balanceText(balance, model.provider)

  const attach = async (files) => {
    if (!canAttach) return
    const list = [...files].filter((f) => !f.type || f.type.startsWith('image/')).slice(0, MAX_REFS - uploads.length)
    if (!list.length) { if (files.length) setError('Add images: PNG, JPG, WebP or GIF.'); return }
    setError(null)
    setUploading((n) => n + list.length)
    await Promise.all(list.map(async (f) => {
      try {
        const up = await uploadImage(f)
        setUploads((us) => [...us, up].slice(0, MAX_REFS))
      } catch (e) { setError(e.message) }
      setUploading((n) => n - 1)
    }))
  }

  const go = () => {
    if (!prompts.length || !connected || uploading) return
    const batch = { id: crypto.randomUUID(), prompts, total, model: model.name, kind: 'image' }
    if (batchMode) addBatch(batch)
    const params = paramsFor(inputs, { quality, resolution })
    prompts.forEach((p, r) => {
      for (let t = 0; t < calls; t++) {
        gens.generate(model, {
          prompt: p, caption: p, aspect: ratio, count: perCall, duration: 5, images,
          ...(Object.keys(params).length && { params }), ...(refs.length && { refs }),
        }, batchMode ? { batch: batch.id, row: r } : {})
      }
    })
  }

  const openAsFlow = async () => {
    try {
      await openFlow(flowFromBatch({ prompts, model, aspect: ratio, duration: 5, takes: calls, count: perCall }))
      navigate('/flows')
    } catch (e) { setError(e.message) }
  }

  const dropOk = (e) => canAttach && e.dataTransfer.types.includes('Files')
  const attachTitle = !canAttach ? `${model.name} on your ComfyUI does not take reference images` : uploads.length >= MAX_REFS ? `Up to ${MAX_REFS} references` : 'Add reference images'

  const hero = (
    <div className="gen-hero">
      <div className="gen-fan" aria-hidden="true">
        {fan.map((c, i) => <i key={i} style={{ background: c, '--i': i }} />)}
      </div>
      <h1 className="rise">Start with {model.name}</h1>
      <p className="rise">Describe a scene, a character, a mood or a style in the bar below. Add references with the plus button, or pull a saved character in with @.</p>
    </div>
  )

  return (
    <main className="gen gen-image">
      <div className="gen-top">
        <Pop right icon={<IconGrid />} label="View" className="gen-view">
          <button type="button" className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>Grid<small>More results on screen</small></button>
          <button type="button" className={view === 'large' ? 'on' : ''} onClick={() => setView('large')}>Large tiles<small>Bigger previews</small></button>
        </Pop>
      </div>
      <Banner />

      <section className="gen-canvas" aria-label="Your images">
        <Feed kind="image" gens={gens} batches={batches} size={view} empty={hero} />
      </section>

      {(error || gens.error) && <div className="notice glass error gen-notice">{error || gens.error}</div>}

      <form className={`composer glass gen-bar${dragging ? ' dragging' : ''}`} onSubmit={(e) => { e.preventDefault(); go() }}
        onDragOver={(e) => { if (dropOk(e)) { e.preventDefault(); setDragging(true) } }}
        onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setDragging(false)}
        onDrop={(e) => { if (!canAttach) return; e.preventDefault(); setDragging(false); attach(e.dataTransfer.files) }}>
        <div className="composer-inner">
          {(uploads.length > 0 || uploading > 0 || refs.length > 0) && (
            <div className="gen-attached">
              {uploads.map((u) => (
                <span key={u.url} className="gen-thumb pop">
                  <img src={u.url} alt="" />
                  <button type="button" aria-label={`Remove ${u.name}`} onClick={() => setUploads((us) => us.filter((x) => x.url !== u.url))}><IconClose /></button>
                </span>
              ))}
              {Array.from({ length: uploading }, (_, i) => <span key={`up-${i}`} className="gen-thumb busy" aria-label="Uploading" />)}
              <RefTags refs={refs} setRefs={setRefs} />
            </div>
          )}
          <div className="gen-bar-body">
            <div className="gen-bar-text" key={batchMode ? 'b' : 's'}>
              {batchMode ? <PromptList rows={rows} setRows={setRows} kind="image" /> : (
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} aria-label="Prompt"
                  placeholder={images.length ? 'Describe what to make with your references' : 'Describe the image you want'}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), go())} />
              )}
            </div>
            <Segmented className="seg-sm" value={batchMode ? 'batch' : 'single'} onChange={(v) => setBatchMode(v === 'batch')}
              options={[{ value: 'single', label: 'Single' }, { value: 'batch', label: 'Batch' }]} />
          </div>
          <div className="gen-bar-foot">
            <div className="chips">
              <div className="chip gen-icon">
                <button type="button" aria-label="Add reference images" title={attachTitle} disabled={!canAttach || uploads.length >= MAX_REFS}
                  className={uploads.length ? 'lit' : ''} onClick={() => fileRef.current.click()}><IconPlus /></button>
              </div>
              <Pop up keep className="gen-icon" icon={<IconAt />} title="Add from Library" lit={refs.length > 0}>
                <LibraryPicks refs={refs} setRefs={setRefs} />
              </Pop>
              <ModelPicker up model={model} options={pick.options} open={pick.open} favorites={pick.favorites}
                toggleFavorite={pick.toggleFavorite} choose={pick.choose} connections={connections} />
              <Pop up icon={<IconAspect />} label={label(ratio)} title="Aspect ratio">
                {inputs.ratios.map((a) => <button key={a} type="button" className={a === ratio ? 'on' : ''} onClick={() => setAspect(a)}>{label(a)}</button>)}
              </Pop>
              {inputs.qualities && (
                <Pop up icon={<IconSpark />} label={label(shownQuality)} title="Quality">
                  {inputs.qualities.map((v) => <button key={v} type="button" className={v === shownQuality ? 'on' : ''} onClick={() => setQuality(v)}>{label(v)}</button>)}
                </Pop>
              )}
              {inputs.resolutions && (
                <Pop up icon={<IconImage />} label={shownRes} title="Resolution">
                  {inputs.resolutions.map((v) => <button key={v} type="button" className={v === shownRes ? 'on' : ''} onClick={() => setResolution(v)}>{v}</button>)}
                </Pop>
              )}
              <Stepper value={count} onChange={setCount} label="Images per run" />
            </div>
            <div className="foot-actions">
              {batchMode && prompts.length > 0 && !model.open && <button type="button" className="btn-soft" onClick={openAsFlow}>Open as flow</button>}
              <GoButton total={total} cost={costText(cost)} disabled={!total || !connected || uploading > 0} />
            </div>
          </div>
          <div className="gen-bar-note">
            <StatusNote model={model} connected={connected} />
            {connected && (total > 0 ? (
              <span>
                <strong>{batchMode ? `${prompts.length} ${prompts.length === 1 ? 'prompt' : 'prompts'} × ${count} = ` : ''}{total} {noun.image[total === 1 ? 0 : 1]}</strong>
                {cost ? ` · ${costText(cost)}` : model.provider === 'comfy' ? ' · runs on your GPU, no API cost' : ''}
              </span>
            ) : <span>{batchMode ? 'Add prompts to see the total' : 'The cost shows on Generate before you run'}</span>)}
            {bal && <span>{bal}</span>}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden
          onChange={(e) => { attach(e.target.files); e.target.value = '' }} />
      </form>
    </main>
  )
}
