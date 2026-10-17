import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrary } from '../../lib/useLibrary.js'
import Upload from './Upload.jsx'
import BoxEditor from './BoxEditor.jsx'
import { canvasBlob, uploadMedia } from './media.js'

export default function Face({ value, onChange, setError }) {
  const lib = useLibrary()
  const [busy, setBusy] = useState(false)
  const [source, setSource] = useState(value?.characterId ? 'library' : 'photo')
  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const img = new Image()
      img.src = value.url
      await img.decode()
      const { x, y, width, height } = value.box
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(img.naturalWidth * width))
      c.height = Math.max(1, Math.round(img.naturalHeight * height))
      c.getContext('2d').drawImage(img, x * img.naturalWidth, y * img.naturalHeight, width * img.naturalWidth, height * img.naturalHeight, 0, 0, c.width, c.height)
      const face = await uploadMedia(new File([await canvasBlob(c)], 'face.png', { type: 'image/png' }))
      onChange({ ...value, faceUrl: face.url })
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  return <div className="widget">
    <div className="pills" role="group" aria-label="Face source">
      {[['photo', 'From a photo'], ['library', 'Library character']].map(([id, label]) => <button type="button" key={id} disabled={busy} aria-pressed={source === id} className={source === id ? 'on' : ''} onClick={() => { if (source !== id) { setSource(id); onChange(null) } }}>{label}</button>)}
    </div>
    {source === 'photo' && (!value ? <Upload onChange={onChange} setError={setError} /> : <>
      <fieldset className="widget-fieldset" disabled={busy}>
        <BoxEditor face value={value} onChange={onChange} />
      </fieldset>
      <div className="widget-actions">
        <button type="button" className="btn-blue sm" disabled={busy || !value.box || Boolean(value.faceUrl)} onClick={save}>{busy ? 'Saving face' : value.faceUrl ? 'Face selected' : 'Use this face'}</button>
        <button type="button" className="link-btn" disabled={busy} onClick={() => onChange(null)}>New photo</button>
      </div>
      <p className="sheet-note">Move and resize the box around the face you want to use.</p>
    </>)}
    {source === 'library' && <>
      {!lib.ready && <p className="sheet-note">Loading Library</p>}
      {lib.ready && !lib.characters.length && <p className="sheet-note">No characters yet. <Link to="/library?tab=characters">Add a character in Library</Link></p>}
      <div className="picks" role="group" aria-label="Library characters">
        {lib.characters.map((item) => <button type="button" key={item.id} className={`pick${value?.characterId === item.id ? ' on' : ''}`} aria-pressed={value?.characterId === item.id} disabled={!item.images?.length}
          onClick={() => onChange({ url: item.images[0], faceUrl: item.images[0], name: item.name, characterId: item.id, images: item.images })}>
          <span className="pick-img">{item.images?.[0] ? <img src={item.images[0]} alt="" /> : item.name?.[0]}</span><small>{item.name}</small>
        </button>)}
      </div>
    </>}
    {value?.faceUrl && <img className="widget-face-preview" src={value.faceUrl} alt="Selected face" />}
  </div>
}
