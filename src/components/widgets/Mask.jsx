import { useRef, useState } from 'react'
import Upload from './Upload.jsx'
import { canvasBlob, token, uploadMedia } from './media.js'
import { clamp } from '../../../shared/widgetInputs.js'

export default function Mask({ value, onChange, setError }) {
  const canvas = useRef(null)
  const path = useRef(null)
  const [tool, setTool] = useState('brush')
  const [size, setSize] = useState(5)
  const [cursor, setCursor] = useState([0.5, 0.5])
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const changed = () => onChange({ ...value, maskUrl: null, strokes: null })
  const fit = (e) => {
    const c = canvas.current
    c.width = e.currentTarget.naturalWidth
    c.height = e.currentTarget.naturalHeight
    if (value.maskUrl) {
      const mask = new Image()
      mask.onload = () => {
        const ctx = c.getContext('2d')
        ctx.drawImage(mask, 0, 0, c.width, c.height)
        const pixels = ctx.getImageData(0, 0, c.width, c.height)
        for (let i = 0; i < pixels.data.length; i += 4) {
          pixels.data[i + 3] = pixels.data[i]
          pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 255
        }
        ctx.putImageData(pixels, 0, 0)
        setReady(true)
      }
      mask.onerror = () => { setReady(true); setError('Could not load the saved mask. Paint a new one.'); changed() }
      mask.src = value.maskUrl
    } else setReady(true)
  }
  const point = (e) => {
    const rect = canvas.current.getBoundingClientRect()
    return [clamp((e.clientX - rect.left) / rect.width, 0, 1), clamp((e.clientY - rect.top) / rect.height, 0, 1)]
  }
  const paint = (from, to) => {
    const c = canvas.current
    const ctx = c.getContext('2d')
    ctx.globalCompositeOperation = tool === 'erase' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = ctx.fillStyle = token('--mask-on')
    ctx.lineWidth = c.width * size / 100
    ctx.lineCap = ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from[0] * c.width, from[1] * c.height)
    ctx.lineTo(to[0] * c.width, to[1] * c.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(to[0] * c.width, to[1] * c.height, ctx.lineWidth / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }
  const key = (e) => {
    if (busy || !ready) return
    const delta = { ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0], ArrowUp: [0, -0.01], ArrowDown: [0, 0.01] }[e.key]
    if (delta) {
      e.preventDefault()
      const next = cursor.map((n, i) => clamp(n + delta[i] * (e.shiftKey ? 5 : 1), 0, 1))
      setCursor(next)
      return
    }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); paint(cursor, cursor); changed() }
  }
  const invert = () => {
    const c = canvas.current
    const ctx = c.getContext('2d')
    const pixels = ctx.getImageData(0, 0, c.width, c.height)
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 255
      pixels.data[i + 3] = 255 - pixels.data[i + 3]
    }
    ctx.putImageData(pixels, 0, 0)
    changed()
  }
  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const c = document.createElement('canvas')
      c.width = canvas.current.width
      c.height = canvas.current.height
      const ctx = c.getContext('2d')
      ctx.fillStyle = token('--mask-off')
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.drawImage(canvas.current, 0, 0)
      const uploaded = await uploadMedia(new File([await canvasBlob(c)], 'mask.png', { type: 'image/png' }))
      onChange({ ...value, maskUrl: uploaded.url, strokes: uploaded.url })
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  if (!value) return <Upload onChange={onChange} setError={setError} />
  return <div className="widget">
    <div className="widget-stage widget-mask">
      <img src={value.url} alt="Photo to mask" onLoad={fit} draggable={false} />
      <canvas ref={canvas} tabIndex={0} aria-label="Mask painter. Arrow keys move the brush; Space or Enter paints. Shift moves faster." onKeyDown={key}
        onPointerDown={(e) => { if (e.button !== 0 || busy || !ready) return; e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); path.current = point(e); setCursor(path.current); paint(path.current, path.current) }}
        onPointerMove={(e) => { if (!path.current) return; const next = point(e); paint(path.current, next); path.current = next; setCursor(next) }}
        onPointerUp={() => { if (path.current) { path.current = null; changed() } }}
        onPointerCancel={() => { if (path.current) { path.current = null; changed() } }} />
      <i className="widget-cursor" style={{ left: `${cursor[0] * 100}%`, top: `${cursor[1] * 100}%`, width: `${size}%` }} />
    </div>
    <div className="pills" role="group" aria-label="Mask tools">
      {['brush', 'erase'].map((t) => <button type="button" key={t} className={tool === t ? 'on' : ''} aria-pressed={tool === t} onClick={() => setTool(t)}>{t === 'brush' ? 'Brush' : 'Erase'}</button>)}
      <button type="button" disabled={busy || !ready} onClick={invert}>Invert</button>
      <button type="button" disabled={busy || !ready} onClick={() => { const c = canvas.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); changed() }}>Clear</button>
    </div>
    <label className="widget-control">Brush size <input type="range" min="1" max="30" value={size} onChange={(e) => setSize(Number(e.target.value))} /><output>{size}%</output></label>
    <p className="sheet-note">Paint the area to change. Arrow keys move the brush; Space paints.</p>
    <div className="widget-actions">
      <button type="button" className="btn-blue sm" disabled={busy || !ready || Boolean(value.maskUrl)} onClick={save}>{busy ? 'Saving mask' : value.maskUrl ? 'Mask saved' : 'Save mask'}</button>
      <button type="button" className="link-btn" disabled={busy} onClick={() => { setReady(false); onChange(null) }}>New photo</button>
    </div>
    <span className="sheet-note" role="status">{value.maskUrl ? 'Mask uploaded. White changes; black stays.' : 'Save the mask to use this input.'}</span>
  </div>
}
