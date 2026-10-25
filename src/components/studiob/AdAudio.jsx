import { useState } from 'react'
import { upload } from '../../lib/useLibrary.js'

export default function AdAudio({ value, onChange }) {
  const [error, setError] = useState('')
  const take = async (file) => {
    if (!file) return
    setError('')
    onChange({ uploading: true })
    try { onChange({ url: await upload(file), name: file.name }) }
    catch (e) { setError(e.message); onChange(null) }
  }
  return <div className="field">
    <label>Optional voiceover track
      <input type="file" accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/ogg,audio/flac" aria-label="Voiceover track" disabled={value?.uploading} onChange={(e) => take(e.target.files[0])} />
    </label>
    {value?.uploading && <p className="sheet-note" role="status">Uploading voiceover…</p>}
    {value?.url && <><audio src={value.url} controls /><button type="button" className="link-btn" onClick={() => onChange(null)}>Remove voiceover</button></>}
    {error && <p className="sheet-error" role="alert">{error}</p>}
  </div>
}
