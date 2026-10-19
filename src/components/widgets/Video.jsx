import { useRef, useState } from 'react'
import { clamp, trimRange } from '../../../shared/widgetInputs.js'
import Upload from './Upload.jsx'
import { canvasBlob, uploadMedia } from './media.js'

const two = (n) => Number(n.toFixed(2))

export default function Video({ value, onChange, setError }) {
  const player = useRef(null)
  const [busy, setBusy] = useState(false)
  const [time, setTime] = useState(value?.posterTime || 0)
  if (!value) return <Upload type="video" onChange={onChange} setError={setError} />
  const duration = value.duration || 0
  const trim = value.trim || { start: 0, end: duration }
  const setTrim = (key, n) => {
    const next = trimRange(key === 'start' ? n : trim.start, key === 'end' ? n : trim.end, duration)
    onChange({ ...value, trim: next })
    player.current.pause()
    player.current.currentTime = next.start
  }
  const poster = async () => {
    const v = player.current
    if (v.readyState < 2 || v.seeking) return setError('Wait for the video frame to load, then try again.')
    setBusy(true)
    setError(null)
    const posterTime = v.currentTime
    v.pause()
    try {
      const c = document.createElement('canvas')
      c.width = v.videoWidth
      c.height = v.videoHeight
      c.getContext('2d').drawImage(v, 0, 0)
      const image = await uploadMedia(new File([await canvasBlob(c)], 'poster.png', { type: 'image/png' }))
      onChange({ ...value, posterUrl: image.url, posterTime })
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  return <div className="widget">
    <video ref={player} className="widget-video" src={value.url} poster={value.posterUrl} controls playsInline preload="metadata"
      onLoadedMetadata={(e) => {
        const v = e.currentTarget
        if (!Number.isFinite(v.duration) || v.duration <= 0) return setError('This video has no readable duration. Try another file.')
        if (!value.duration) onChange({ ...value, duration: v.duration, ratio: `${v.videoWidth}:${v.videoHeight}`, trim: { start: 0, end: v.duration }, posterTime: 0 })
      }} onError={() => setError('This browser cannot preview this video. Try an mp4 or webm file.')}
      onTimeUpdate={(e) => {
        const v = e.currentTarget
        setTime(v.currentTime)
        if (!v.paused && (v.currentTime >= trim.end || v.currentTime < trim.start)) { v.pause(); v.currentTime = trim.start }
      }} />
    <fieldset className="widget-fieldset" disabled={busy || !duration}>
      <div className="widget-controls">
        {/* Bounds round like the value: an end shown as 2.07 over a max of 2.0667 would block the form's submit. */}
        {['start', 'end'].map((key) => <label className="widget-control" key={key}>{key === 'start' ? 'Start (seconds)' : 'End (seconds)'}
          <input type="number" min={key === 'end' ? two(trim.start + 0.01) : 0} max={two(key === 'start' ? Math.max(0, trim.end - 0.01) : duration)} step="0.01" value={two(trim[key])} onChange={(e) => { if (e.target.value !== '') setTrim(key, Number(e.target.value)) }} />
        </label>)}
        <label className="widget-control">Preview frame <input type="range" min="0" max={duration} step="0.01" value={clamp(time, 0, duration)} onChange={(e) => { const n = Number(e.target.value); player.current.pause(); player.current.currentTime = n; setTime(n) }} /><output>{time.toFixed(2)}s</output></label>
      </div>
      <button type="button" className="btn-soft" onClick={poster}>{busy ? 'Saving poster' : 'Use this frame as poster'}</button>
    </fieldset>
    {value.posterUrl && <img className="widget-poster" src={value.posterUrl} alt={`Poster at ${value.posterTime.toFixed(2)} seconds`} />}
    <p className="sheet-note" role="status">{value.duration ? `${(trim.end - trim.start).toFixed(2)} seconds selected. Trim settings travel with the original video.` : 'Loading video metadata'}</p>
    <button type="button" className="link-btn" disabled={busy} onClick={() => { setTime(0); onChange(null) }}>New video</button>
  </div>
}
