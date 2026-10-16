import { useState } from 'react'
import Segmented from '../components/Segmented.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { Hero, Box, Cards, Pills, Toggle, NotWired, ErrorNote, useParam } from '../components/studiob/Kit.jsx'
import { formatById } from '../lib/formats/index.js'

const models = [
  { id: 'seedvr2-3b', label: 'SeedVR2 3B', note: 'Faster and lighter' },
  { id: 'seedvr2-7b', label: 'SeedVR2 7B', note: 'The most detail' },
]
const modes = [
  { id: 'precise', label: 'Precise', note: 'Stays true to the source' },
  { id: 'creative', label: 'Creative', note: 'Adds new fine detail' },
]
// The Video upscale format's scale options.
const scales = (formatById('video-upscale')?.inputs.find((i) => i.id === 'factor')?.options || [{ id: '2', label: '2x' }, { id: '4', label: '4x' }])
  .map((o) => ({ id: o.id, label: o.label }))

const size = (ratio, k) => {
  const [w, h] = (ratio || '').split(':').map(Number)
  return w > 1 && h > 1 ? `${w * k} × ${h * k}` : null
}

export default function Upscale() {
  const [kind, setKind] = useParam('kind', ['image', 'video'])
  const [media, setMedia] = useState({ image: null, video: null })
  const [model, setModel] = useState('seedvr2-3b')
  const [mode, setMode] = useState('precise')
  const [scale, setScale] = useState('2')
  const [advanced, setAdvanced] = useState(false)
  const [denoise, setDenoise] = useState(true)
  const [faces, setFaces] = useState(false)
  const [fps, setFps] = useState('keep')
  const [deflicker, setDeflicker] = useState(true)
  const [error, setError] = useState(null)

  const value = media[kind]
  const k = Number(scale)
  const from = size(value?.ratio, 1)
  const to = size(value?.ratio, k)
  const video = kind === 'video'
  const modelName = models.find((m) => m.id === model)?.label

  return (
    <main className="sb-page">
      <Hero badge="Upscale" title="Sharper pictures and videos"
        sub="Raise the resolution and bring back detail, without changing what is in the frame.">
        <Segmented value={kind} onChange={(v) => { setKind(v); setError(null) }} options={[{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]} />
      </Hero>
      <div className="sb-work">
        <div className="sb-stage tall">
          <Field key={kind} input={{ id: kind, type: kind, label: video ? 'Video to upscale' : 'Image to upscale' }} value={value}
            onChange={(v) => setMedia((m) => ({ ...m, [kind]: v }))} setError={setError} />
          <ErrorNote error={error} />
          {value && (
            <p className="sb-sizes">
              <span><strong>Before</strong>{from || 'Size unknown'}</span>
              <span><strong>After</strong>{to || `${scale}x the size`}</span>
            </p>
          )}
        </div>
        <aside className="sb-side glass" aria-label="Upscale settings">
          <Box label="Model"><Cards options={models} value={model} onChange={setModel} label="Model" /></Box>
          <Box label="Mode">
            <Cards options={modes} value={mode} onChange={setMode} label="Mode" />
            {mode === 'creative' && <p className="sheet-note">Creative can invent detail that was not there. Use Precise for product shots, faces you need exact and anything with text.</p>}
          </Box>
          <Box label="Scale"><Pills options={scales} value={scale} onChange={setScale} label="Scale" /></Box>
          <button type="button" className="link-btn sb-more" aria-expanded={advanced} onClick={() => setAdvanced((a) => !a)}>
            {advanced ? 'Hide advanced settings' : 'Advanced settings'}
          </button>
          {advanced && (
            <Box label="Advanced" className="rise">
              {video ? (
                <>
                  <div className="field"><label>Frame rate</label>
                    <Pills options={[{ id: 'keep', label: 'Keep' }, { id: '30', label: '30 fps' }, { id: '60', label: '60 fps' }]} value={fps} onChange={setFps} label="Frame rate" />
                  </div>
                  <Toggle on={deflicker} onChange={setDeflicker}>Remove flicker</Toggle>
                  <p className="sheet-note">MP4 with H.264 upscales most reliably.</p>
                </>
              ) : (
                <>
                  <Toggle on={denoise} onChange={setDenoise}>Remove noise and scratches</Toggle>
                  <Toggle on={faces} onChange={setFaces}>Restore faces</Toggle>
                </>
              )}
            </Box>
          )}
          <NotWired label="Upscale" runsOn={modelName} summary={`${modelName}, ${mode}, ${scale}x${to ? `, out at ${to}` : ''}`} />
        </aside>
      </div>
    </main>
  )
}
