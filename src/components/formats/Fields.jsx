import { useId, useRef, useState } from 'react'
import InputWidget from '../widgets/index.jsx'
import { widgetTypes } from '../../../shared/widgetInputs.js'
import { Link } from 'react-router-dom'
import { IconUpload } from '../Icons.jsx'
import MediaPicker from '../generate/MediaPicker.jsx'
import { uploadFile, pastedFile } from '../../lib/uploads.js'
import { useLibrary, toRef } from '../../lib/useLibrary.js'
import VoicePicker from '../generate/Voices.jsx'

const media = {
  image: { accept: 'image/png,image/jpeg,image/webp,image/gif', hint: 'Drop an image or click to choose', noun: 'an image' },
  video: { accept: 'video/*', hint: 'Drop a video or click to choose', noun: 'a video' },
  audio: { accept: 'audio/*', hint: 'Drop an audio file or click to choose', noun: 'an audio file' },
}

// Library list and tab behind each pick.
const picks = {
  character: { list: 'characters', noun: 'characters' },
  product: { list: 'products', noun: 'products' },
  brand: { list: 'brands', noun: 'brand kits' },
}

const textual = ['text', 'longtext']
const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Click opens the media picker; a file dropped or pasted on the field uploads straight away. Every kind goes to the
// server, so a model can read it, and images and videos carry their pixel ratio.
function MediaField({ input, value, onChange, setError, labelId }) {
  const { type } = input
  const m = media[type]
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [picking, setPicking] = useState(false)
  const ref = useRef(null)
  const choose = () => setPicking(true)
  const put = (next) => {
    if (value?.local) URL.revokeObjectURL(value.url)
    onChange(next)
  }

  const take = async (file) => {
    if (!file) return
    if (file.type && !file.type.startsWith(`${type}/`)) { setError(`That is not ${m.noun}.`); return }
    setBusy(true)
    setError(null)
    try { put(await uploadFile(file)) } catch (e) { setError(e.message) }
    setBusy(false)
  }

  return (
    <div className={`drop${over ? ' over' : ''}${value ? ' has' : ''}${type === 'audio' ? ' sound' : ''}`}
      role="button" tabIndex={0} aria-labelledby={labelId}
      onClick={(e) => !e.target.closest('.mp') && choose()}
      onPaste={(e) => { const f = pastedFile(e); if (f) { e.preventDefault(); take(f) } }}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choose() } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]) }}>
      {!value && <span><IconUpload />{busy ? 'Uploading' : m.hint}</span>}
      {value && type === 'image' && <img src={value.url} alt="" />}
      {value && type === 'video' && <video src={value.url} muted loop playsInline autoPlay={!calm()} />}
      {value && type === 'audio' && (
        <>
          <strong>{value.name}</strong>
          <audio src={value.url} controls onClick={(e) => e.stopPropagation()} />
        </>
      )}
      {value && <small>{busy ? 'Uploading' : 'Replace'}</small>}
      <input ref={ref} type="file" accept={m.accept} hidden
        onChange={(e) => { take(e.target.files[0]); e.target.value = '' }} />
      {picking && (
        <MediaPicker type={type} title={input.label || `Choose ${m.noun}`} accept={m.accept} setError={setError}
          onClose={() => setPicking(false)} onPick={(it) => { setPicking(false); put(it) }} />
      )}
    </div>
  )
}

const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// Upload a photo, then paint on it: a mask of what to change, or arrows for where things should move.
function DrawField({ input, value, onChange, setError, labelId }) {
  const canvas = useRef(null)
  const path = useRef(null)
  const motion = input.mode === 'motion'

  if (!value) {
    return <MediaField input={{ ...input, type: 'image' }} value={null} labelId={labelId} setError={setError}
      onChange={(v) => onChange({ ...v, strokes: null })} />
  }

  // Draw at the photo's own resolution so a mask lines up with the pixels it covers.
  const fit = (e) => {
    const c = canvas.current
    const img = e.currentTarget
    if (!c || !img.naturalWidth) return
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    if (value.strokes) {
      const s = new Image()
      s.onload = () => c.getContext('2d').drawImage(s, 0, 0)
      s.src = value.strokes
    }
  }
  const at = (e) => {
    const r = canvas.current.getBoundingClientRect()
    const k = canvas.current.width / r.width
    return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]
  }
  const pen = () => {
    const ctx = canvas.current.getContext('2d')
    ctx.strokeStyle = ctx.fillStyle = token('--blue')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = canvas.current.width * (motion ? 0.008 : 0.05)
    return ctx
  }
  const down = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    path.current = [at(e)]
  }
  const move = (e) => {
    const pts = path.current
    if (!pts) return
    const p = at(e)
    const ctx = pen()
    ctx.beginPath()
    ctx.moveTo(...pts[pts.length - 1])
    ctx.lineTo(...p)
    ctx.stroke()
    pts.push(p)
  }
  const up = () => {
    const pts = path.current
    path.current = null
    if (!pts) return
    const ctx = pen()
    if (pts.length === 1 && !motion) {
      ctx.beginPath()
      ctx.arc(...pts[0], ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    if (motion && pts.length > 2) {
      const [x, y] = pts[pts.length - 1]
      const [px, py] = pts[Math.max(0, pts.length - 6)]
      const angle = Math.atan2(y - py, x - px)
      const size = ctx.lineWidth * 4
      ctx.beginPath()
      for (const turn of [2.6, -2.6]) {
        ctx.moveTo(x, y)
        ctx.lineTo(x + size * Math.cos(angle + turn), y + size * Math.sin(angle + turn))
      }
      ctx.stroke()
    }
    onChange({ ...value, strokes: canvas.current.toDataURL('image/png') })
  }
  const clear = () => {
    const c = canvas.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
    onChange({ ...value, strokes: null })
  }

  return (
    <div className="draw" role="group" aria-labelledby={labelId}>
      <div className="draw-stage">
        <img src={value.url} alt="" onLoad={fit} draggable={false} />
        <canvas ref={canvas} className={motion ? 'motion' : 'mask'} aria-label={motion ? 'Draw arrows on the photo' : 'Paint over the photo'}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
      </div>
      <div className="draw-bar">
        <span>{motion ? 'Draw an arrow from each thing to where it should go.' : 'Paint over the part to change.'}</span>
        <span className="draw-acts">
          <button type="button" className="link-btn" onClick={clear} disabled={!value.strokes}>Clear</button>
          <button type="button" className="link-btn" onClick={() => onChange(null)}>New photo</button>
        </span>
      </div>
    </div>
  )
}

function Choice({ input, value, onChange, labelId }) {
  if (input.confirmation) return <label className="presenter-confirmation"><input type="checkbox" checked={value === input.options[0].id} onChange={(event) => onChange(event.target.checked ? input.options[0].id : null)} />{input.options[0].note}</label>
  const cards = input.options.some((o) => o.note)
  return (
    <div className={cards ? 'opt-grid' : 'pills'} role="group" aria-labelledby={labelId}>
      {input.options.map((o) => {
        const on = value === o.id
        return cards ? (
          <button key={o.id} type="button" aria-pressed={on} className={`opt${on ? ' on' : ''}`} onClick={() => onChange(o.id)}>
            <strong>{o.label}</strong>
            {o.note && <small>{o.note}</small>}
          </button>
        ) : (
          <button key={o.id} type="button" aria-pressed={on} className={on ? 'on' : ''} onClick={() => onChange(o.id)}>{o.label}</button>
        )
      })}
    </div>
  )
}

const unitFor = (n, unit) => (n === 1 ? unit.replace(/s$/, '') : unit)

function Count({ input, value, onChange, labelId }) {
  return (
    <div className="pills" role="group" aria-labelledby={labelId}>
      {input.options.map((n) => (
        <button key={n} type="button" aria-pressed={value === n} className={value === n ? 'on' : ''} onClick={() => onChange(n)}>
          {input.unit ? `${n} ${unitFor(n, input.unit)}` : n}
        </button>
      ))}
    </div>
  )
}

function LibraryPick({ input, value, onChange, labelId }) {
  const lib = useLibrary()
  const { list, noun } = picks[input.type]
  const items = lib[list] || []
  if (!lib.ready) return <p className="sheet-note">Loading Assets</p>
  if (!items.length) return <p className="sheet-note">No {noun} yet. <Link to={`/library?tab=${list}`}>Add one in Assets</Link></p>
  const brand = input.type === 'brand'
  return (
    <div className="picks" role="group" aria-labelledby={labelId}>
      {items.map((item) => {
        const on = value?.id === item.id
        const img = (brand && item.logo) || item.images?.[0]
        return (
          <button key={item.id} type="button" aria-pressed={on} className={`pick${on ? ' on' : ''}`}
            onClick={() => onChange(on ? null : toRef(input.type, item))}>
            <span className={`pick-img${brand ? ' logo' : ''}`}>{img ? <img src={img} alt="" /> : item.name?.[0]}</span>
            <small>{item.name}</small>
          </button>
        )
      })}
    </div>
  )
}

export function Field({ input, value, onChange, setError = () => {} }) {
  const id = useId()
  const labelId = `${id}-label`
  const { type } = input
  const props = { input, value, onChange, labelId }
  let body
  if (type === 'voice' || input.voiceSample) body = <VoicePicker value={value} onChange={onChange} title={input.label} optional={!!input.optional} />
  else if (widgetTypes.includes(type) || (type === 'draw' && input.mode !== 'motion')) body = <InputWidget type={type === 'draw' ? 'mask' : type} {...props} setError={setError} />
  else if (media[type]) body = <MediaField {...props} setError={setError} />
  else if (type === 'draw') body = <DrawField {...props} setError={setError} />
  else if (type === 'text') body = <input id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={input.placeholder} />
  else if (type === 'longtext') body = <textarea id={id} rows={input.rows || 3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={input.placeholder} />
  else if (type === 'choice') body = <Choice {...props} />
  else if (type === 'count') body = <Count {...props} />
  else if (picks[type]) body = <LibraryPick {...props} />
  else return null
  return (
    <div className={`field${input.half ? ' half' : ''}`}>
      <label id={labelId} htmlFor={textual.includes(type) ? id : undefined}>
        {input.label}
        {input.optional && <span className="field-opt">Optional</span>}
      </label>
      {body}
    </div>
  )
}
