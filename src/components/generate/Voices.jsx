import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconChevron } from '../Icons.jsx'
import { IconPlay, IconMic } from './icons.jsx'

// Named sample voices. Picking one is not wired yet: speech reads in the model's own default voice.
export const sampleVoices = [
  { id: 'ava', name: 'Ava', note: 'Warm narrator' },
  { id: 'theo', name: 'Theo', note: 'Calm and low' },
  { id: 'mina', name: 'Mina', note: 'Bright and quick' },
  { id: 'ravi', name: 'Ravi', note: 'Clear presenter' },
  { id: 'june', name: 'June', note: 'Soft storyteller' },
  { id: 'leo', name: 'Leo', note: 'Big promo energy' },
]
export const defaultVoice = { id: 'default', name: 'Model default', note: 'The voice the model reads in today' }

// The voice card at the top of the speech panel, opening the voice list.
export default function VoicePicker({ value, onChange, title = 'Pick a voice', tag }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', key) }
  }, [open])
  const pick = (v) => { onChange(v); setOpen(false) }
  const chosen = value && value.id !== defaultVoice.id

  return (
    <div className="voice" ref={ref}>
      <button type="button" className={`voice-card${chosen ? ' has' : ''}`} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}>
        {tag && !chosen && <em className="slot-tag">{tag}</em>}
        <span className="voice-face">{chosen ? value.name[0] : <IconMic />}</span>
        <span className="voice-text">
          <strong>{chosen ? value.name : title}</strong>
          <small>{chosen ? value.note : 'Choose a sample voice or one you saved'}</small>
        </span>
        <IconChevron />
      </button>
      {open && (
        <div className="menu glass pop voice-menu" role="dialog" aria-label="Voices">
          <h6>Default</h6>
          <div className={`voice-row${!chosen ? ' on' : ''}`}>
            <button type="button" className="voice-pick" onClick={() => pick(defaultVoice)}>
              <span className="voice-face sm"><IconMic /></span>
              <span>{defaultVoice.name}<small>{defaultVoice.note}</small></span>
            </button>
          </div>
          <h6>Sample voices</h6>
          {sampleVoices.map((v) => (
            <div key={v.id} className={`voice-row${value?.id === v.id ? ' on' : ''}`}>
              <button type="button" className="voice-pick" onClick={() => pick(v)}>
                <span className="voice-face sm">{v.name[0]}</span>
                <span>{v.name}<small>{v.note}</small></span>
              </button>
              <button type="button" className="voice-play" disabled title="Not wired yet" aria-label={`Preview ${v.name}, not wired yet`}><IconPlay /></button>
            </div>
          ))}
          <p className="menu-note">Sample voices and previews are not wired yet. Speech reads in the model's default voice for now.</p>
          <h6>Library voices</h6>
          <p className="menu-note">No saved voices yet.</p>
          <Link className="link-btn menu-foot" to="/assets?tab=voices">Add a voice in Library</Link>
        </div>
      )}
    </div>
  )
}
