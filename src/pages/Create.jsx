import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Composer from '../components/Composer.jsx'
import Results from '../components/Results.jsx'
import { IconAspect, IconClock, IconModel, IconStack, IconCamera } from '../components/Icons.jsx'
import { useGenerations } from '../lib/useGenerations.js'
import { imageModels, videoModels, aspects, aspectSize, durations, cameraMoves, gradient } from '../lib/catalog.js'

const copy = {
  image: { title: 'Start creating with', accent: 'open image models', sub: 'Describe a scene, a character or a mood, and watch it render.', placeholder: 'Describe the scene you imagine' },
  video: { title: 'Prompt to motion with', accent: 'LTX video', sub: 'Every shot runs through a ComfyUI workflow you can open and remix.', placeholder: 'Describe any visual idea, we will turn it into video' },
  cinema: { title: 'Direct the shot in', accent: 'Cinema studio', sub: 'Pick a camera move, describe the scene, roll camera.', placeholder: 'Describe the scene the camera should capture' },
}

// LTX wants dimensions divisible by 32 and frame counts of 8n + 1.
const videoSize = (a) => aspectSize[a].map((n) => Math.round((n * 0.6) / 32) * 32)

export default function Create({ mode, cinema = false }) {
  const preset = useLocation().state
  const isVideo = mode === 'video'
  const models = isVideo ? videoModels : imageModels
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState(models[0].id)
  const [aspect, setAspect] = useState(isVideo ? '16:9' : '1:1')
  const [count, setCount] = useState(1)
  const [duration, setDuration] = useState(5)
  const [move, setMove] = useState(cinema ? cameraMoves[0].id : null)
  const { items, error, busy, run } = useGenerations()
  const c = copy[cinema ? 'cinema' : mode]

  const onGenerate = () => {
    const m = models.find((x) => x.id === model)
    const parts = [prompt.trim()]
    if (preset?.prompt) parts.push(preset.prompt)
    if (move) parts.push(cameraMoves.find((x) => x.id === move).prompt)
    const full = parts.join(', ')
    const [width, height] = isVideo ? videoSize(aspect) : aspectSize[aspect]
    run({
      workflow: m.workflow,
      vars: { prompt: full, width, height, count, frames: duration * 24 + 1 },
      aspect,
      caption: prompt.trim(),
      kind: isVideo ? 'video' : 'image',
    })
  }

  const chips = [
    { key: 'model', icon: <IconModel />, label: models.find((x) => x.id === model).name, value: model, onChange: setModel,
      options: models.map((x) => ({ value: x.id, label: x.name, note: x.note })) },
    { key: 'aspect', icon: <IconAspect />, label: aspect, value: aspect, onChange: setAspect,
      options: aspects.map((a) => ({ value: a, label: a })) },
    isVideo
      ? { key: 'dur', icon: <IconClock />, label: `${duration}s`, value: duration, onChange: setDuration,
          options: durations.map((d) => ({ value: d, label: `${d} seconds` })) }
      : { key: 'count', icon: <IconStack />, label: `${count}/4`, value: count, onChange: setCount,
          options: [1, 2, 3, 4].map((n) => ({ value: n, label: `${n} ${n === 1 ? 'image' : 'images'}` })) },
  ]

  return (
    <main className="create">
      {preset?.name && <div className="muted" style={{ marginBottom: 12 }}>Effect: <strong style={{ color: 'var(--text)' }}>{preset.name}</strong></div>}
      {cinema && (
        <div className="moves">
          {cameraMoves.map((m) => (
            <button key={m.id} className={`move${move === m.id ? ' on' : ''}`} onClick={() => setMove(m.id)}>
              <IconCamera size={20} /><span>{m.name}</span>
            </button>
          ))}
        </div>
      )}
      {items.length || error ? <Results items={items} error={error} /> : (
        <div className="create-empty">
          <div>
            <div className="stack">
              {[[16, 290], [200, 30], [330, 180], [40, 250]].map((h, i) => (
                <div key={i} className="tile" style={{ background: gradient(h, i) }} />
              ))}
            </div>
            <h1 className="h1">{c.title}<br /><span>{c.accent}</span></h1>
            <p className="muted" style={{ marginTop: 14 }}>{c.sub}</p>
          </div>
        </div>
      )}
      <Composer prompt={prompt} setPrompt={setPrompt} placeholder={c.placeholder} chips={chips} onGenerate={onGenerate} busy={busy} />
    </main>
  )
}
