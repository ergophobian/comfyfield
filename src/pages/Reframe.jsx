import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from '../components/formats/Fields.jsx'
import Results from '../components/Results.jsx'
import { Hero, Box, Ratios, Pills, ErrorNote, fitBox } from '../components/studiob/Kit.jsx'
import { useApp } from '../lib/appContext.js'
import { reframeFormat, reframeRatios, reframeIssue } from '../lib/formats/photodumpReframe.js'

export default function Reframe() {
  const { gens } = useApp()
  const [mode, setMode] = useState('image')
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [target, setTarget] = useState('9:16')
  const [direction, setDirection] = useState('')
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)
  const issue = image?.url ? reframeIssue(image.ratio, target) : null
  const media = mode === 'image' ? image : video
  const items = gens.items.filter((item) => item.formatId === reframeFormat.id && !item.failed)
  const run = async () => {
    if (running || mode !== 'image' || !image?.url || issue) return
    setRunning(true)
    setError(null)
    try { await gens.generateFormat(reframeFormat, { image, ratio: target, direction }) }
    catch (e) { setError(e.message) }
    finally { setRunning(false) }
  }

  return (
    <main className="sb-page">
      <Hero badge="Reframe" title="Fit a scene to any screen"
        sub="Choose a new ratio and extend a photo with matching edges." />
      <div className="sb-work">
        <div className="sb-stage tall">
          <Box label="Media type"><Pills options={[{ id: 'image', label: 'Image' }, { id: 'video', label: 'Video' }]} value={mode} onChange={setMode} label="Media type" /></Box>
          <Field key={mode} input={{ id: mode, type: mode, label: `${mode === 'image' ? 'Image' : 'Video'} to reframe` }} value={media} onChange={mode === 'image' ? setImage : setVideo} setError={setError} />
          <ErrorNote error={error} />
          {media && (
            <Box label="Framing preview" aside={<span className="muted">To {target}</span>}>
              <div className="sb-reframe">
                <div className="sb-reframe-frame fill" style={fitBox(target, 1.6, 92)}>
                  {mode === 'image' ? <img className="reframe-source" src={media.url} alt="Source fitted inside the target canvas" /> : <video src={media.url} muted playsInline controls />}
                </div>
              </div>
              <p className="sheet-note">{mode === 'image' ? 'Layout preview. The photo fits inside the new canvas. Generation fills the edges and blends the seam around the original center.' : 'Video preview only. Video outpainting and subject tracking are not wired yet.'}</p>
            </Box>
          )}
        </div>
        <aside className="sb-side glass" aria-label="Reframe settings">
          <Box label="Target ratio"><Ratios options={reframeRatios.map((id) => ({ id }))} value={target} onChange={setTarget} label="Target ratio" /></Box>
          {mode === 'image' ? (
            <>
              <Field input={{ id: 'direction', type: 'longtext', label: 'New edges', optional: true, placeholder: 'Continue the beach and sky' }} value={direction} onChange={setDirection} />
              <p className="sheet-note">Qwen edit 2511. The source scales to fit, then the center is composited back with a blended seam. New workflow, untested live.</p>
              <button type="button" className="btn-blue" disabled={!image?.url || !!issue || running} onClick={run}>{running ? 'Reframing…' : 'Generate reframe'}</button>
              {issue && <p className="sheet-note" role="status">{issue}</p>}
              <p className="sheet-note">Results save to the <Link to="/assets">Library</Link>.</p>
            </>
          ) : (
            <div className="sb-go">
              <button type="button" className="btn-blue" disabled>Reframe video</button>
              <p className="sheet-note">Not wired yet. No bundled video outpaint or subject tracking workflow is available. Target ratio is a preview setting only.</p>
            </div>
          )}
        </aside>
      </div>
      {items.length > 0 && <section aria-label="Reframed images"><h2>Reframed images</h2><Results items={items} /></section>}
    </main>
  )
}
