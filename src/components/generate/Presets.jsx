import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconClose } from '../Icons.jsx'
import { IconPen } from './icons.jsx'
import { formatsFor } from '../../lib/formats/index.js'
import { covers } from '../../lib/formats/parts.js'

// Motion presets are the camera move formats. In Create video a preset adds its move to the prompt for whichever model runs.
export const cameraPresets = () => formatsFor({ kind: 'video', category: 'camera', openOnly: false })

export const general = { id: 'general', name: 'General', blurb: 'No preset. Your prompt drives the camera.', cover: covers.slate }

export function groupsOf(list) {
  const names = [...new Set(list.map((f) => f.group || 'More'))]
  return names.map((g) => [g, list.filter((f) => (f.group || 'More') === g)])
}

// The move a preset adds to the prompt. Choice placeholders take their default, and lines about "the photo" drop out
// when there is no start frame.
export function presetText(f, framed) {
  if (!f || f.id === general.id) return ''
  const filled = (f.prompt || '').replace(/\{(\w+)\}/g, (_, id) => {
    const input = f.inputs?.find((x) => x.id === id)
    const o = input?.options?.find((x) => x.id === input.default)
    return o ? (o.text || o.label) : ''
  })
  return filled.split(/(?<=\.)\s+/).filter((s) => s.trim() && (framed || !/\bphoto\b/i.test(s))).join(' ').trim()
}

// The card at the top of the Create video panel: the chosen preset and the model it runs on.
export function PresetCard({ preset, model, onChange }) {
  return (
    <div className="gen-preset" style={{ background: preset.cover }}>
      <button type="button" className="gen-preset-change" onClick={onChange}><IconPen />Change</button>
      <span className="gen-preset-text">
        <strong>{preset.name}</strong>
        <small>{model.name}</small>
      </span>
    </div>
  )
}

function Tile({ f, on, onPick, i }) {
  return (
    <button type="button" className={`recipe-card gen-tile rise${on ? ' on' : ''}`} aria-pressed={on}
      style={{ '--d': `calc(${Math.min(i, 12)} * var(--stagger))` }} onClick={() => onPick(f)}>
      <span className="recipe-cover" style={{ background: f.cover }} />
      <strong>{f.name}</strong>
      <small>{f.blurb}</small>
    </button>
  )
}

// A row of preset cards that scrolls sideways, for the how it works view.
export function PresetRow({ list, value, onPick }) {
  return (
    <div className="gen-row-scroll">
      {list.map((f, i) => <Tile key={f.id} f={f} i={i} on={f.id === value.id} onPick={onPick} />)}
    </div>
  )
}

// Full preset gallery, grouped as the formats are. Portaled to the body so it sits above the nav, outside the route's stacking context.
export function PresetPicker({ value, onPick, onClose }) {
  const list = cameraPresets()
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  const pick = (f) => { onPick(f); onClose() }
  return createPortal(
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gen-presets glass pop" role="dialog" aria-label="Choose a preset">
        <header>
          <div>
            <h2>Choose a preset</h2>
            <p>{list.length} camera moves. Each adds its move to your prompt.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </header>
        <div className="gen-presets-body">
          <div className="recipe-grid">
            <Tile f={general} i={0} on={value.id === general.id} onPick={pick} />
          </div>
          {groupsOf(list).map(([g, fs]) => (
            <section key={g}>
              <h3>{g}<span className="muted">{fs.length}</span></h3>
              <div className="recipe-grid">
                {fs.map((f, i) => <Tile key={f.id} f={f} i={i} on={f.id === value.id} onPick={pick} />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
