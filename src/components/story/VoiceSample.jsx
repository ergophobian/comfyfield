import { useState } from 'react'
import { uploadStitchFile } from '../../lib/stitch.js'

export default function VoiceSample({ value, onChange, onBusyChange }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const take = async (file) => {
    if (!file || busy) return
    setError('')
    const type = { wav: 'audio/wav', mp3: 'audio/mpeg', flac: 'audio/flac', m4a: 'audio/mp4', ogg: 'audio/ogg' }[file.name.split('.').pop().toLowerCase()]
    if (!type || (file.type && !file.type.startsWith('audio/')) || file.size > 10 * 1024 * 1024 || !file.size) return setError('Choose a wav, mp3, flac, m4a or ogg sample, up to 10 MB.')
    setBusy(true)
    onBusyChange?.(true)
    try {
      const uploaded = await uploadStitchFile(new File([file], file.name, { type }))
      onChange({ name: file.name, sample: uploaded.url })
    } catch (e) { setError(e.message) }
    finally { setBusy(false); onBusyChange?.(false) }
  }
  return <div className="field story-voice">
    <label>Voice sample (optional)<input type="file" accept=".wav,.mp3,.flac,.m4a,.ogg,audio/*" disabled={busy} onChange={(e) => { take(e.target.files[0]); e.target.value = '' }} /></label>
    <p className="sheet-note">Upload a short, clear recording to set the speech identity. Without a sample, Chatterbox uses its default voice. Narrator cards guide writing tone.</p>
    {busy && <p role="status">Uploading voice sample…</p>}
    {value?.sample && <><p>{value.name}</p><audio controls src={value.sample} aria-label="Voice sample" /><button type="button" className="link-btn" onClick={() => onChange(null)}>Remove voice sample</button></>}
    {error && <p role="alert" className="error">{error}</p>}
  </div>
}
