import { useState } from 'react'
import { IconPen } from './icons.jsx'
import { writePrompt } from '../../lib/providers.js'

const KEY = 'comfyfield.enhance'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }

const instructions = {
  image: 'You expand short image ideas into one rich generation prompt. Keep every subject, object and detail the user named. Add composition, lighting, lens, materials and mood that suit the idea. Write one paragraph under 80 words, no lists, no quotes, no preamble.',
  video: 'You expand short video ideas into one rich generation prompt. Keep every subject, action and detail the user named. Add the setting, the camera move, the pace, lighting and mood. Write one paragraph under 80 words, no lists, no quotes, no preamble.',
}

// Enhance on or off, per kind, remembered in this browser. Off until someone turns it on.
export function useEnhance(kind) {
  const [on, setOn] = useState(() => Boolean(read()[kind]))
  const set = (value) => {
    setOn(value)
    try { localStorage.setItem(KEY, JSON.stringify({ ...read(), [kind]: value })) } catch {}
  }
  return [on, set]
}

// Rewrites one prompt for the chosen model. Throws when no prompt writer is connected; the caller runs the original then.
export const enhancePrompt = (prompt, kind, model) => writePrompt({ instructions: instructions[kind], note: prompt, target: model.name })

export default function EnhanceChip({ on, setOn, busy }) {
  return (
    <div className="chip">
      <button type="button" className={on ? 'lit' : ''} aria-pressed={on} disabled={busy}
        title={on ? 'Your prompt is expanded before it runs' : 'Expand your prompt before it runs'} onClick={() => setOn(!on)}>
        <IconPen />{busy ? 'Enhancing' : on ? 'Enhance on' : 'Enhance'}
      </button>
    </div>
  )
}
