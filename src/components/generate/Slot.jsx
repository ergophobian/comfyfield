import { useEffect, useRef, useState } from 'react'
import { IconClose, IconImage, IconVideo, IconUpload } from '../Icons.jsx'
import { IconWave } from './icons.jsx'
import { uploadImage } from '../../lib/providers.js'

const kinds = {
  image: { accept: 'image/png,image/jpeg,image/webp,image/gif', icon: <IconImage />, noun: 'an image', ok: (t) => t.startsWith('image/') },
  video: { accept: 'video/*', icon: <IconVideo />, noun: 'a video', ok: (t) => t.startsWith('video/') },
  media: { accept: 'audio/*,video/*', icon: <IconWave />, noun: 'a recording or a video', ok: (t) => t.startsWith('audio/') || t.startsWith('video/') },
}

// Images go to the server so models can read them. Video and audio stay in the browser until the backend takes uploads of them.
async function take(file, type) {
  if (type === 'image') return uploadImage(file)
  return { url: URL.createObjectURL(file), name: file.name, local: true, kind: file.type.split('/')[0] }
}

// One upload tile: click or drop a file, see it, remove it.
export default function Slot({ id, type = 'image', value, onChange, title, hint, tag, disabled, note, setError, className = '' }) {
  const k = kinds[type]
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const live = useRef(value)
  live.current = value
  useEffect(() => () => live.current?.local && URL.revokeObjectURL(live.current.url), [])

  const choose = () => !disabled && ref.current.click()
  const put = async (file) => {
    if (!file || disabled) return
    if (file.type && !k.ok(file.type)) { setError?.(`That is not ${k.noun}.`); return }
    setBusy(true)
    setError?.(null)
    try {
      const next = await take(file, type)
      if (value?.local) URL.revokeObjectURL(value.url)
      onChange(next)
    } catch (e) { setError?.(e.message) }
    setBusy(false)
  }
  const clear = (e) => {
    e.stopPropagation()
    if (value?.local) URL.revokeObjectURL(value.url)
    onChange(null)
  }
  const shows = value?.kind === 'audio' ? 'audio' : value?.kind === 'video' || type === 'video' ? 'video' : 'image'

  return (
    <div id={id} className={`drop slot${over ? ' over' : ''}${value ? ' has' : ''}${disabled ? ' off' : ''} ${className}`}
      role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled || undefined} aria-label={value ? `${title}: ${value.name}. Replace` : title}
      title={disabled ? note : undefined}
      onClick={choose}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choose() } }}
      onDragOver={(e) => { if (disabled) return; e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { if (disabled) return; e.preventDefault(); setOver(false); put(e.dataTransfer.files[0]) }}>
      {tag && !value && <em className="slot-tag">{tag}</em>}
      {!value && (
        <span className="slot-empty">
          <i className="slot-icon">{busy ? <IconUpload /> : k.icon}</i>
          <strong>{busy ? 'Uploading' : title}</strong>
          {hint && <small>{disabled && note ? note : hint}</small>}
        </span>
      )}
      {value && shows === 'image' && <img src={value.url} alt="" />}
      {value && shows === 'video' && <video src={value.url} muted loop playsInline autoPlay={!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches} />}
      {value && shows === 'audio' && (
        <span className="slot-audio">
          <strong>{value.name}</strong>
          <audio src={value.url} controls onClick={(e) => e.stopPropagation()} />
        </span>
      )}
      {value && <button type="button" className="icon-btn slot-x" aria-label={`Remove ${title.toLowerCase()}`} onClick={clear}><IconClose /></button>}
      <input ref={ref} type="file" accept={k.accept} hidden onChange={(e) => { put(e.target.files[0]); e.target.value = '' }} />
    </div>
  )
}
