import { useState } from 'react'
import { IconClose, IconImage, IconVideo, IconUpload } from '../Icons.jsx'
import { IconWave } from './icons.jsx'
import MediaPicker from './MediaPicker.jsx'
import { uploadFile, pastedFile } from '../../lib/uploads.js'

const kinds = {
  image: { accept: 'image/png,image/jpeg,image/webp,image/gif', icon: <IconImage />, noun: 'an image', ok: (t) => t.startsWith('image/') },
  video: { accept: 'video/mp4,video/webm,video/quicktime', icon: <IconVideo />, noun: 'a video', ok: (t) => t.startsWith('video/') },
  media: { accept: 'audio/*,video/mp4,video/webm,video/quicktime', icon: <IconWave />, noun: 'a recording or a video', ok: (t) => t.startsWith('audio/') || t.startsWith('video/') },
}

// One upload tile. Click opens the media picker; a file dropped or pasted on the tile uploads straight away.
export default function Slot({ id, type = 'image', value, onChange, title, hint, tag, disabled, note, setError, className = '' }) {
  const k = kinds[type]
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [picking, setPicking] = useState(false)

  const choose = () => !disabled && setPicking(true)
  const put = async (file) => {
    if (!file || disabled) return
    if (file.type && !k.ok(file.type)) { setError?.(`That is not ${k.noun}.`); return }
    setBusy(true)
    setError?.(null)
    try { onChange(await uploadFile(file)) } catch (e) { setError?.(e.message) }
    setBusy(false)
  }
  const clear = (e) => {
    e.stopPropagation()
    onChange(null)
  }
  const shows = value?.kind === 'audio' ? 'audio' : value?.kind === 'video' || type === 'video' ? 'video' : 'image'

  return (
    <>
      <div id={id} className={`drop slot${over ? ' over' : ''}${value ? ' has' : ''}${disabled ? ' off' : ''} ${className}`}
        role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled || undefined} aria-label={value ? `${title}: ${value.name}. Replace` : title}
        title={disabled ? note : undefined}
        onClick={choose}
        onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choose() } }}
        onPaste={(e) => { const f = pastedFile(e); if (f && !disabled) { e.preventDefault(); put(f) } }}
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
      </div>
      {picking && (
        <MediaPicker type={type} title={title} accept={k.accept} setError={setError}
          onPick={(it) => { setPicking(false); onChange(it) }} onClose={() => setPicking(false)} />
      )}
    </>
  )
}
