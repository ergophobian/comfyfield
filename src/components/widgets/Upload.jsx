import { useRef, useState } from 'react'
import MediaPicker from '../generate/MediaPicker.jsx'
import { uploadFile, pastedFile } from '../../lib/uploads.js'

const accepts = { image: 'image/png,image/jpeg,image/webp,image/gif', video: '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime' }

// The button opens the media picker; a file dropped or pasted here uploads straight away.
export default function Upload({ type = 'image', onChange, setError }) {
  const file = useRef(null)
  const [busy, setBusy] = useState(false)
  const [picking, setPicking] = useState(false)
  const take = async (picked) => {
    if (!picked || busy) return
    const extension = picked.name.split('.').pop().toLowerCase()
    if (type === 'video' && !picked.type && ['mp4', 'webm', 'mov'].includes(extension)) {
      picked = new File([picked], picked.name, { type: { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' }[extension] })
    }
    if (!picked.type.startsWith(`${type}/`)) return setError(`Choose ${type === 'image' ? 'an image' : 'a video'}.`)
    setBusy(true)
    setError(null)
    try { onChange(await uploadFile(picked)) }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  return <div className="widget-upload" tabIndex={-1} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); take(e.dataTransfer.files[0]) }}
    onPaste={(e) => { const f = pastedFile(e); if (f) { e.preventDefault(); take(f) } }}>
    <button type="button" className="btn-soft" disabled={busy} onClick={() => setPicking(true)}>{busy ? 'Uploading' : `Choose ${type === 'image' ? 'an image' : 'a video'}`}</button>
    <small>{type === 'video' ? 'Drop or paste an mp4, webm or mov, up to 200 MB' : 'Or drop or paste an image here'}</small>
    <input ref={file} type="file" hidden accept={accepts[type]} onChange={(e) => { take(e.target.files[0]); e.target.value = '' }} />
    {picking && (
      <MediaPicker type={type} title={type === 'image' ? 'Choose an image' : 'Choose a video'} accept={accepts[type]} setError={setError}
        onClose={() => setPicking(false)} onPick={(it) => { setPicking(false); onChange(it) }} />
    )}
  </div>
}
