import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconChevron } from '../Icons.jsx'
import { IconPlay, IconMic } from './icons.jsx'
import { useVoices, voiceValue } from '../../lib/useLibrary.js'

export const defaultVoice = { id: 'default', name: 'Model default', note: 'Use the model’s own voice' }

export default function VoicePicker({ value, onChange, title = 'Pick a voice', tag, optional = tag !== 'Required' }) {
  const { voices, ready, error, refresh } = useVoices()
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(null)
  const [playError, setPlayError] = useState(null)
  const ref = useRef(null)
  const audio = useRef(null)
  useEffect(() => {
    if (!open) { audio.current?.pause(); setPlaying(null); return }
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', key) }
  }, [open])
  useEffect(() => () => audio.current?.pause(), [])
  const pick = (v) => { onChange(v ? voiceValue(v) : null); setOpen(false) }
  const preview = async (v) => {
    setPlayError(null)
    audio.current?.pause()
    if (playing === v.id) { setPlaying(null); return }
    const player = new Audio(v.sample)
    audio.current = player
    player.onended = () => setPlaying(null)
    setPlaying(v.id)
    try { await player.play() }
    catch { setPlaying(null); setPlayError('Could not play this sample. Try again in Library.') }
  }
  const chosen = value && value.id !== defaultVoice.id && value.sample
  const saved = voices.find((v) => v.id === value?.id)
  const name = saved?.name || value?.name || title
  return (
    <div className="voice" ref={ref}>
      <button type="button" className={`voice-card${chosen ? ' has' : ''}`} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}>
        {tag && !chosen && <em className="slot-tag">{tag}</em>}
        <span className="voice-face">{chosen ? name[0] : <IconMic />}</span>
        <span className="voice-text"><strong>{chosen ? name : title}</strong><small>{chosen ? saved?.notes || value.notes || 'Saved voice sample' : 'Choose a voice from Library'}</small></span><IconChevron />
      </button>
      {open && <div className="menu glass pop voice-menu" role="dialog" aria-label="Voices">
        {optional && <div className={`voice-row${!chosen ? ' on' : ''}`}><button type="button" className="voice-pick" onClick={() => pick(null)}><span className="voice-face sm"><IconMic /></span><span>{defaultVoice.name}<small>{defaultVoice.note}</small></span></button></div>}
        <h6>Library voices</h6>
        {!ready && <p className="menu-note">Loading voices</p>}
        {error && <p className="menu-note" role="alert">{error} <button type="button" className="link-btn" onClick={refresh}>Retry</button></p>}
        {ready && !voices.length && <p className="menu-note">No saved voices yet. Upload or record a short sample in Library.</p>}
        {voices.map((v) => <div key={v.id} className={`voice-row${value?.id === v.id ? ' on' : ''}`}>
          <button type="button" className="voice-pick" onClick={() => pick(v)}><span className="voice-face sm">{v.name[0]}</span><span>{v.name}<small>{v.notes || `${Math.round(v.duration)} second sample`}</small></span></button>
          <button type="button" className="voice-play" aria-pressed={playing === v.id} aria-label={`${playing === v.id ? 'Stop' : 'Preview'} ${v.name}`} onClick={() => preview(v)}><IconPlay /></button>
        </div>)}
        {playError && <p className="menu-note" role="alert">{playError}</p>}
        <Link className="link-btn menu-foot" to="/assets?tab=voices">Add a voice in Library</Link>
      </div>}
    </div>
  )
}

export { VoicePicker }
