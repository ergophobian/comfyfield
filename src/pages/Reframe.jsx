import { useState } from 'react'
import { Field } from '../components/formats/Fields.jsx'
import { Hero, Box, Ratios, Toggle, NotWired, ErrorNote, fitBox } from '../components/studiob/Kit.jsx'

const targets = [
  { id: '9:16', note: 'Stories and reels' },
  { id: '1:1', note: 'Square feed' },
  { id: '4:5', note: 'Tall feed' },
  { id: '16:9', note: 'Widescreen' },
  { id: '21:9', note: 'Cinema' },
]

const gcd = (a, b) => (b ? gcd(b, a % b) : a)
const simplify = (ratio) => {
  const [w, h] = (ratio || '').split(':').map(Number)
  if (!(w > 0 && h > 0)) return null
  const g = gcd(w, h)
  const r = `${w / g}:${h / g}`
  return r.length > 6 ? `${(w / h).toFixed(2)}:1` : r
}

export default function Reframe() {
  const [video, setVideo] = useState(null)
  const [target, setTarget] = useState('9:16')
  const [tracking, setTracking] = useState(true)
  const [error, setError] = useState(null)
  const source = simplify(video?.ratio)

  return (
    <main className="sb-page">
      <Hero badge="Reframe" title="Fit a video to any screen"
        sub="Turn a wide video into a vertical one, or the other way round, and keep the subject in the shot." />
      <div className="sb-work">
        <div className="sb-stage tall">
          <Field input={{ id: 'video', type: 'video', label: 'Video to reframe' }} value={video} onChange={setVideo} setError={setError} />
          <ErrorNote error={error} />
          {video && (
            <Box label="Preview" aside={<span className="muted">{source ? `${source} to ${target}` : `To ${target}`}</span>}>
              <div className="sb-reframe">
                <div className={`sb-reframe-frame${tracking ? ' crop' : ' fill'}`} style={fitBox(target, 1.6, 92)}>
                  <video src={video.url} muted loop playsInline autoPlay={!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches} />
                </div>
              </div>
              <p className="sheet-note">
                {tracking
                  ? 'A rough center crop. Subject tracking moves the frame to follow the main subject in every shot.'
                  : 'The striped area is new picture, painted in to match the scene.'}
              </p>
            </Box>
          )}
        </div>
        <aside className="sb-side glass" aria-label="Reframe settings">
          <Box label="Target ratio"><Ratios options={targets} value={target} onChange={setTarget} label="Target ratio" /></Box>
          <Box label="Framing">
            <Toggle on={tracking} onChange={setTracking}>Follow the subject</Toggle>
            <p className="sheet-note">{tracking ? 'Crops in and follows the person or product as they move.' : 'Keeps the whole frame and fills in the new edges.'}</p>
          </Box>
          <p className="sheet-note">Captions, prices and on-screen text are not moved, so fix them before you reframe.</p>
          <NotWired runsOn={tracking ? 'SAM 3.1 and Wan VACE' : 'Wan VACE'} summary={video ? `${source || 'Your video'} to ${target}, ${tracking ? 'following the subject' : 'filling the edges'}` : 'Upload a video to start.'} />
        </aside>
      </div>
    </main>
  )
}
