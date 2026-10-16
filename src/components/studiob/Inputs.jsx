import { useRef, useState } from 'react'
import { IconClose, IconPlus } from '../Icons.jsx'
import { upload } from '../../lib/useLibrary.js'

const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// A row of small photos with an upload tile, capped at max.
export function Pictures({ label, value, onChange, max = 8 }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const add = async (files) => {
    setBusy(true)
    setErr('')
    try {
      const urls = []
      for (const f of [...files].slice(0, max - value.length)) urls.push(await upload(f))
      onChange([...value, ...urls])
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }
  return (
    <div className="field">
      <label>{label} <span className="field-opt">{value.length} of {max}</span></label>
      <div className="pics">
        {value.map((u) => (
          <div className="pic" key={u}>
            <img src={u} alt="" />
            <button type="button" aria-label="Remove photo" onClick={() => onChange(value.filter((x) => x !== u))}><IconClose /></button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" className="pic add" disabled={busy} onClick={() => input.current.click()}>
            {busy ? <span className="muted">Saving</span> : <><IconPlus /><span>Upload</span></>}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={max > 1} hidden onChange={(e) => { add(e.target.files); e.target.value = '' }} />
      {err && <p className="sheet-error">{err}</p>}
    </div>
  )
}

export function Colors({ label = 'Colors', value, onChange, max = 6 }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="swatches">
        {value.map((c, i) => (
          <span className="swatch" key={i}>
            <input type="color" value={c} aria-label={`Color ${i + 1}`} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" aria-label={`Remove color ${i + 1}`} onClick={() => onChange(value.filter((_, j) => j !== i))}><IconClose /></button>
          </span>
        ))}
        {value.length < max && (
          <button type="button" className="swatch add" aria-label="Add a color" onClick={() => onChange([...value, token('--blue') || value[value.length - 1]])}><IconPlus /></button>
        )}
      </div>
    </div>
  )
}
