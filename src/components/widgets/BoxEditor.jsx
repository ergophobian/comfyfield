import { useRef } from 'react'
import { aspectBox, fitBox } from '../../../shared/widgetInputs.js'

export default function BoxEditor({ value, onChange, face = false }) {
  const drag = useRef(null)
  const box = value.box || aspectBox(face ? '1:1' : 'free', value.ratio)
  const aspect = value.aspect || 'free'
  const update = (next) => onChange({ ...value, box: fitBox(next), faceUrl: null })
  const resize = (key, number) => {
    const next = { ...box, [key]: number }
    if (aspect !== 'free' && ['width', 'height'].includes(key)) {
      const relative = aspectBox(aspect, value.ratio)
      const ratio = relative.width / relative.height
      if (key === 'width') next.height = next.width / ratio
      else next.width = next.height * ratio
      const scale = Math.min(1, 1 / next.width, 1 / next.height)
      next.width *= scale
      next.height *= scale
    }
    update(next)
  }
  return <div className="widget">
    <div className="widget-stage widget-box-stage" onPointerDown={(e) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.currentTarget.querySelector('[tabindex]').focus()
      e.currentTarget.setPointerCapture(e.pointerId)
      drag.current = { x: e.clientX, y: e.clientY, box, rect: e.currentTarget.getBoundingClientRect() }
    }} onPointerMove={(e) => {
      const d = drag.current
      if (d) update({ ...d.box, x: d.box.x + (e.clientX - d.x) / d.rect.width, y: d.box.y + (e.clientY - d.y) / d.rect.height })
    }} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
      <img src={value.url} alt={face ? 'Choose a face in this photo' : 'Choose the crop area'} draggable={false} onLoad={(e) => {
        const img = e.currentTarget
        const ratio = `${img.naturalWidth}:${img.naturalHeight}`
        if (!value.box || value.ratio !== ratio) onChange({ ...value, ratio, aspect: value.aspect || (face ? '1:1' : 'free'), box: value.box || aspectBox(face ? '1:1' : 'free', ratio) })
      }} />
      <div className="widget-box" role="group" tabIndex={0} aria-label={face ? 'Face selection. Arrow keys move the box.' : 'Crop selection. Arrow keys move the box.'}
        style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.width * 100}%`, height: `${box.height * 100}%` }}
        onKeyDown={(e) => {
          const delta = { ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0], ArrowUp: [0, -0.01], ArrowDown: [0, 0.01] }[e.key]
          if (delta) { e.preventDefault(); update({ ...box, x: box.x + delta[0] * (e.shiftKey ? 5 : 1), y: box.y + delta[1] * (e.shiftKey ? 5 : 1) }) }
        }} />
    </div>
    {!face && <div className="pills" role="group" aria-label="Crop aspect">
      {['free', '1:1', '4:5', '9:16', '16:9', '21:9'].map((a) => <button key={a} type="button" className={aspect === a ? 'on' : ''} aria-pressed={aspect === a} onClick={() => onChange({ ...value, aspect: a, box: aspectBox(a, value.ratio) })}>{a === 'free' ? 'Free' : a}</button>)}
    </div>}
    <div className="widget-controls">
      {['x', 'y', 'width', 'height'].map((key) => <label className="widget-control" key={key}>{({ x: 'Left', y: 'Top', width: 'Width', height: 'Height' })[key]}
        <input type="range" min={key === 'width' || key === 'height' ? 1 : 0} max="100" step="0.1" value={box[key] * 100} onChange={(e) => resize(key, Number(e.target.value) / 100)} /><output>{Math.round(box[key] * 100)}%</output>
      </label>)}
    </div>
    <p className="sheet-note">Drag to move the box, or use arrow keys and the size controls.</p>
  </div>
}
