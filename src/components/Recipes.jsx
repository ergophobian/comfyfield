import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconClose, IconUpload } from './Icons.jsx'
import { initialValues, missingInputs, recipeModel, recipeOptions, recipesFor } from '../lib/recipes.js'
import { models as catalog, providerInfo } from '../lib/catalog.js'
import { uploadImage } from '../lib/providers.js'
import { estimate, money, useModelMeta } from '../lib/cost.js'

const VISIBLE = 4

function Card({ recipe, onOpen, i = 0 }) {
  return (
    <button type="button" className="recipe-card rise" style={{ '--d': `${i * 45}ms` }} onClick={() => onOpen(recipe)}>
      <span className="recipe-cover" style={{ background: recipe.cover }} />
      <strong>{recipe.name}</strong>
      <small>{recipe.blurb}</small>
    </button>
  )
}

export function RecipeRow({ kind, onOpen, onAll }) {
  const list = recipesFor(kind)
  if (!list.length) return null
  return (
    <section className="recipes" key={kind}>
      <div className="recipes-head">
        <h2>Recipes</h2>
        <button type="button" className="link-btn" onClick={onAll}>See all</button>
      </div>
      <div className="recipe-row">
        {list.slice(0, VISIBLE).map((r, i) => <Card key={r.id} recipe={r} i={i} onOpen={onOpen} />)}
      </div>
    </section>
  )
}

function useDismiss(onClose) {
  const [leaving, setLeaving] = useState(false)
  const close = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(onClose, 180)
  }
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })
  return [leaving, close]
}

export function RecipeLibrary({ onOpen, onClose }) {
  const [leaving, close] = useDismiss(onClose)
  const groups = [['Video', 'video'], ['Image', 'image']]
  return (
    <div className={`scrim${leaving ? ' out' : ''}`} onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal glass" role="dialog" aria-label="All recipes">
        <div className="modal-head">
          <div>
            <h2>All recipes</h2>
            <p>A recipe is a saved setup. Add a photo, change a few words, run it.</p>
          </div>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close"><IconClose /></button>
        </div>
        {groups.map(([label, kind]) => (
          <div key={kind} className="modal-group">
            <h6>{label}</h6>
            <div className="recipe-grid">
              {recipesFor(kind).map((r, i) => <Card key={r.id} recipe={r} i={i} onOpen={(x) => { onOpen(x); onClose() }} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImageField({ input, value, onChange, setError }) {
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const ref = useRef(null)
  const take = async (file) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try { onChange(await uploadImage(file)) } catch (e) { setError(e.message) }
    setBusy(false)
  }
  return (
    <div className="field">
      <label>{input.label}</label>
      <div className={`drop${over ? ' over' : ''}${value ? ' has' : ''}`}
        onClick={() => ref.current.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]) }}>
        {value ? <img src={value.url} alt="" /> : (
          <span><IconUpload />{busy ? 'Uploading' : 'Drop an image or click to choose'}</span>
        )}
        {value && <small>{busy ? 'Uploading' : 'Replace'}</small>}
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden
          onChange={(e) => { take(e.target.files[0]); e.target.value = '' }} />
      </div>
    </div>
  )
}

export function RecipeSheet({ recipe, gens, connections, onClose }) {
  const [leaving, close] = useDismiss(onClose)
  const [values, setValues] = useState(() => initialValues(recipe))
  const [error, setError] = useState(null)
  const model = recipeModel(recipe, catalog)
  const metaOf = useModelMeta([model])
  const set = (id, v) => setValues((x) => ({ ...x, [id]: v }))
  const connected = model.provider === 'comfy' || connections[model.provider]?.connected
  const missing = missingInputs(recipe, values)
  const each = estimate(model, metaOf(model), { aspect: '1:1', count: 1, duration: recipe.settings.duration })

  const run = (e) => {
    e.preventDefault()
    if (missing.length || !connected) return
    gens.generate(model, recipeOptions(recipe, values))
    close()
  }

  return (
    <div className={`scrim side${leaving ? ' out' : ''}`} onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <form className="sheet glass" onSubmit={run} role="dialog" aria-label={recipe.name}>
        <div className="sheet-cover" style={{ background: recipe.cover }}>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close"><IconClose /></button>
        </div>
        <div className="sheet-body">
          <h2>{recipe.name}</h2>
          <p>{recipe.blurb}</p>
          {recipe.inputs.map((input) => (
            <div key={input.id}>
              {input.type === 'image' && <ImageField input={input} value={values[input.id]} onChange={(v) => set(input.id, v)} setError={setError} />}
              {input.type === 'text' && (
                <div className="field">
                  <label>{input.label}</label>
                  <input value={values[input.id]} onChange={(e) => set(input.id, e.target.value)} placeholder={input.placeholder} />
                </div>
              )}
              {input.type === 'choice' && (
                <div className="field">
                  <label>{input.label}</label>
                  <div className="pills">
                    {input.options.map((o) => (
                      <button key={o.id} type="button" className={values[input.id] === o.id ? 'on' : ''} onClick={() => set(input.id, o.id)}>{o.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {error && <p className="sheet-error">{error}</p>}
          {!connected && <p className="sheet-note">This runs on {providerInfo[model.provider].name}. <Link to="/connections">Add your key</Link> to use it.</p>}
        </div>
        <div className="sheet-foot">
          <span className="muted">{each ? `${each.approx ? '≈' : ''}${money(each.usd)} per run` : `Runs on ${providerInfo[model.provider].name}`}</span>
          <button className="btn-blue" disabled={missing.length > 0 || !connected}>Run</button>
        </div>
      </form>
    </div>
  )
}
