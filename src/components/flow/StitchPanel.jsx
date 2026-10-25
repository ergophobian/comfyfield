import { useContext, useRef, useState } from 'react'
import { FlowCtx } from './nodes.jsx'
import { useApp } from '../../lib/appContext.js'
import { stitchInputs, stitchRequest, uploadStitchFile } from '../../lib/stitch.js'

const storedClip = ({ id, url, name, upstream, start, end, caption }) => ({ id, url: upstream ? undefined : url, name, upstream, start, end, caption })

export default function StitchPanel({ node, patch, disabled = false }) {
  const { flow, engine, state, act } = useContext(FlowCtx)
  const { gens } = useApp()
  const input = stitchInputs(flow, node.id, engine.itemsOf, (id) => state[id]?.running > 0)
  const { clips } = input
  const st = state[node.id] || {}
  const result = st.items?.find((item) => item.status === 'done')
  const failed = st.items?.find((item) => item.status === 'failed')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [saved, setSaved] = useState('')
  const upload = useRef(null)
  const musicUpload = useRef(null)
  const busy = disabled || working || st.running > 0
  const current = result && !result.stale && result.signature === input.signature && !input.blocked
  const exported = result && (result.exported || saved === result.url || gens.items.some((item) => item.url === result.url))
  const change = (data) => { setError(''); patch(node.id, data) }
  const setClips = (list) => change({ clips: list.map(storedClip) })
  const editClip = (id, data) => setClips(clips.map((clip) => clip.id === id ? { ...clip, ...data } : clip))
  const move = (at, offset) => {
    const next = [...clips]
    const clip = next[at]
    next[at] = next[at + offset]
    next[at + offset] = clip
    setClips(next)
  }
  const addFiles = async (files, music = false) => {
    setError('')
    setWorking(true)
    try {
      const uploaded = []
      for (const file of files) uploaded.push(await uploadStitchFile(file))
      if (music) change({ music: { ...node.data.music, url: uploaded[0].url, name: uploaded[0].name } })
      else setClips([...clips, ...uploaded])
    } catch (e) { setError(e.message) }
    finally { setWorking(false) }
  }
  const save = async () => {
    setWorking(true)
    setError('')
    try {
      const item = await stitchRequest('/export', { url: result.url })
      gens.add([item])
      setSaved(item.url)
    } catch (e) { setError(e.message) }
    finally { setWorking(false) }
  }
  const music = node.data.music
  return (
    <>
      <p className="muted fp-blurb">Connect video results or add clips. Run makes a preview; export saves it to your Library.</p>
      <fieldset className="stitch-fields" disabled={busy}>
        <input ref={upload} type="file" accept="video/mp4,video/webm,video/quicktime" multiple hidden onChange={(e) => { addFiles([...e.target.files]); e.target.value = '' }} />
        <button type="button" className="btn-soft sm" onClick={() => upload.current.click()}>Add clips</button>
        <label className="fp-field">From Library
          <select className="fp-text" aria-label="Add a Library clip" value="" onChange={(e) => {
            const item = gens.items.find((item) => item.id === e.target.value)
            if (item) setClips([...clips, { id: crypto.randomUUID(), url: item.url, name: item.caption || 'Library clip' }])
          }}>
            <option value="">Choose a video</option>
            {gens.items.filter((item) => item.kind === 'video' && item.url).map((item) => <option key={item.id} value={item.id}>{item.caption || item.model || 'Video'}</option>)}
          </select>
        </label>
        {clips.map((clip, i) => (
          <div className="stitch-clip" key={clip.id}>
            <div className="fp-row"><strong>{i + 1}. {clip.name || 'Connected clip'}</strong>
              <div className="fbtns">
                <button type="button" className="btn-soft xs" aria-label={`Move clip ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, -1)}>Up</button>
                <button type="button" className="btn-soft xs" aria-label={`Move clip ${i + 1} later`} disabled={i === clips.length - 1} onClick={() => move(i, 1)}>Down</button>
              </div>
            </div>
            <div className="stitch-trim">
              <label>Start (seconds)<input className="fp-text" aria-label={`Clip ${i + 1} start`} type="number" min="0" step="0.1" value={clip.start ?? ''} placeholder="0" onChange={(e) => editClip(clip.id, { start: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>
              <label>End (seconds)<input className="fp-text" aria-label={`Clip ${i + 1} end`} type="number" min="0" step="0.1" value={clip.end ?? ''} placeholder="Full clip" onChange={(e) => editClip(clip.id, { end: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>
            </div>
            <label>Caption<textarea className="fp-text" aria-label={`Clip ${i + 1} caption`} rows={2} maxLength={2000} value={clip.caption || ''} placeholder="Burn text into this clip" onChange={(e) => editClip(clip.id, { caption: e.target.value })} /></label>
            {!clip.upstream && <button type="button" className="btn-soft xs" onClick={() => setClips(clips.filter((item) => item.id !== clip.id))}>Remove clip</button>}
          </div>
        ))}
        <label className="fp-field">Output aspect
          <select className="fp-text" aria-label="Output aspect" value={node.data.aspect} onChange={(e) => change({ aspect: e.target.value })}>
            {['16:9', '9:16', '1:1', '4:5'].map((aspect) => <option key={aspect}>{aspect}</option>)}
          </select>
        </label>
        <input ref={musicUpload} type="file" accept="audio/*" hidden onChange={(e) => { if (e.target.files.length) addFiles([...e.target.files], true); e.target.value = '' }} />
        <button type="button" className="btn-soft sm" onClick={() => musicUpload.current.click()}>{music?.url ? 'Replace music' : 'Add music'}</button>
        {music?.url && <>
          <p className="muted fp-blurb">{music.name || 'Music track'} · Loops to fill the video</p>
          <label className="fp-field">Music volume ({Math.round((music.volume ?? 0.25) * 100)}%)
            <input aria-label="Music volume" type="range" min="0" max="2" step="0.05" value={music.volume ?? 0.25} onChange={(e) => change({ music: { ...music, volume: Number(e.target.value) } })} />
          </label>
          <label className="fp-field">Fade in and out (seconds)<input className="fp-text" aria-label="Music fade" type="number" min="0" step="0.1" value={music.fade ?? 1} onChange={(e) => change({ music: { ...music, fade: Number(e.target.value) } })} /></label>
          <button type="button" className="btn-soft xs" onClick={() => change({ music: undefined })}>Remove music</button>
        </>}
      </fieldset>
      {input.blocked && <p className="muted fp-blurb">{clips.length ? 'Waiting for connected video results or approval.' : 'Add clips or connect a video node to start.'}</p>}
      <button type="button" className="btn-blue sm" disabled={busy || input.blocked} onClick={() => act.rerun(node.id)}>{working || st.running > 0 ? 'Working' : node.data.manual ? result ? 'Re-stitch' : 'Stitch scene' : result ? 'Render again' : 'Preview'}</button>
      {(error || failed) && <p className="stitch-error" role="alert">{error || failed.error}</p>}
      {result && <>
        <video className="stitch-preview" aria-label="Stitch preview" src={result.url} controls playsInline preload="metadata" />
        {!current && <p className="muted fp-blurb">Settings changed. Render again before exporting.</p>}
        <button type="button" className="btn-blue sm" disabled={busy || !current || exported} onClick={save}>{exported ? 'Saved to Library' : 'Export to Library'}</button>
        {current && exported && !busy && <a className="btn-soft sm" href={result.url} download>Download video</a>}
      </>}
    </>
  )
}
