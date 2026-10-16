import { useRef, useState } from 'react'
import { uploadImage } from '../../lib/providers.js'
import { uploadMedia } from './media.js'

export default function Upload({ type = 'image', onChange, setError }) {
  const file = useRef(null)
  const [busy, setBusy] = useState(false)
  const take = async (picked) => {
    if (!picked || busy) return
    const extension = picked.name.split('.').pop().toLowerCase()
    if (type === 'video' && !picked.type && ['mp4', 'webm', 'mov'].includes(extension)) {
      picked = new File([picked], picked.name, { type: { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' }[extension] })
    }
    if (!picked.type.startsWith(`${type}/`)) return setError(`Choose ${type === 'image' ? 'an image' : 'a video'}.`)
    setBusy(true)
    setError(null)
    try { onChange(await (type === 'image' ? uploadImage(picked) : uploadMedia(picked))) }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  return <div className="widget-upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); take(e.dataTransfer.files[0]) }}>
    <button type="button" className="btn-soft" disabled={busy} onClick={() => file.current.click()}>{busy ? 'Uploading' : `Choose ${type === 'image' ? 'an image' : 'a video'}`}</button>
    <small>{type === 'video' ? 'Drop an mp4, webm or mov, up to 200 MB' : 'Or drop an image here'}</small>
    <input ref={file} type="file" hidden accept={type === 'video' ? '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime' : 'image/png,image/jpeg,image/webp,image/gif'} onChange={(e) => { take(e.target.files[0]); e.target.value = '' }} />
  </div>
}
