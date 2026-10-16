import { useRef, useState } from 'react'
import { IconClose, IconPlus } from '../Icons.jsx'
import { uploadImage } from '../../lib/providers.js'

const sizeOf = (ratio) => (ratio || '').split(':').map(Number)
// Below this on the long side a photo still works, but faces come out softer.
const SHARP = 960

// A grid of uploaded photos with a counter. setValue is a React state setter so uploads can land one by one.
export default function PhotoGrid({ value, setValue, max, min = 0, video = false, label, hint, small = false }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(null)
  const [over, setOver] = useState(false)
  const [err, setErr] = useState('')
  const room = max - value.length

  const add = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/') || (video && f.type.startsWith('video/')))
    if (!list.length) { setErr(video ? 'Add images or video clips.' : 'Add image files.'); return }
    const take = list.slice(0, room)
    setErr(list.length > room ? `Only ${max} fit. The first ${room} were added.` : '')
    for (let k = 0; k < take.length; k++) {
      const f = take[k]
      setBusy([k + 1, take.length])
      try {
        if (f.type.startsWith('video/')) {
          const url = URL.createObjectURL(f)
          setValue((xs) => [...xs, { url, name: f.name, kind: 'video', local: true }])
        } else {
          const r = await uploadImage(f)
          setValue((xs) => [...xs, { ...r, kind: 'image' }])
        }
      } catch (e) { setErr(e.message) }
    }
    setBusy(null)
  }

  const drop = (item) => {
    if (item.local) URL.revokeObjectURL(item.url)
    setValue((xs) => xs.filter((x) => x.url !== item.url))
  }

  const soft = value.filter((x) => {
    const [w, h] = sizeOf(x.ratio)
    return x.kind === 'image' && w && Math.max(w, h) < SHARP
  }).length

  return (
    <div className={`sa-photos${over ? ' over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(false) }}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (room > 0) add(e.dataTransfer.files) }}>
      <div className="sa-photos-head">
        <strong>{label}</strong>
        <span className="sa-count" aria-live="polite">
          {busy ? `Uploading ${busy[0]} of ${busy[1]}` : `${value.length} of ${max}`}
        </span>
      </div>
      {min > 0 && (
        <div className="sa-meter" role="progressbar" aria-label={`${min} photos needed`} aria-valuemin={0} aria-valuemax={min} aria-valuenow={Math.min(value.length, min)}>
          <i style={{ '--p': `${Math.min(100, (value.length / min) * 100)}%` }} />
          <span>{value.length >= min ? 'Enough photos to train' : `${min - value.length} more to go`}</span>
        </div>
      )}
      <div className={`sa-photo-grid${small ? ' small' : ''}`}>
        {room > 0 && (
          <button type="button" className="sa-photo add" disabled={!!busy} onClick={() => input.current.click()}>
            <IconPlus /><span>{busy ? 'Uploading' : 'Add'}</span>
          </button>
        )}
        {value.map((x, i) => {
          const [w, h] = sizeOf(x.ratio)
          const low = x.kind === 'image' && w && Math.max(w, h) < SHARP
          return (
            <div key={x.url} className="sa-photo" style={{ '--i': Math.min(i, 12) }}>
              {x.kind === 'video' ? <video src={x.url} muted playsInline preload="metadata" /> : <img src={x.url} alt="" />}
              {low && <em title={`${w} by ${h}. ${SHARP}px or more is sharper.`}>Small</em>}
              {x.kind === 'video' && <em>Clip</em>}
              <button type="button" aria-label={`Remove ${x.name || 'photo'}`} onClick={() => drop(x)}><IconClose /></button>
            </div>
          )
        })}
      </div>
      {hint && <p className="sa-hint">{hint}{soft > 0 && ` ${soft} ${soft === 1 ? 'photo is' : 'photos are'} under ${SHARP}px.`}</p>}
      {err && <p className="plist-note">{err}</p>}
      <input ref={input} type="file" hidden multiple accept={video ? 'image/*,video/*' : 'image/*'}
        onChange={(e) => { add(e.target.files); e.target.value = '' }} />
    </div>
  )
}
