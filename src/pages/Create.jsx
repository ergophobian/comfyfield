import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Composer, { Chip, Option } from '../components/Composer.jsx'
import Results from '../components/Results.jsx'
import { IconAspect, IconClock, IconModel, IconStack, IconSpark } from '../components/Icons.jsx'
import { aspects, styles, providerInfo } from '../lib/catalog.js'
import { durationsFor, getConnections } from '../lib/providers.js'

const placeholders = {
  image: 'Describe the image you want',
  video: 'Describe a shot, a scene or a moment in motion',
  audio: 'Type a line to voice, or describe a sound',
}

export default function Create({ gens, picker }) {
  const { kind, model, options, setKind, choose } = picker
  const [prompt, setPrompt] = useState('')
  const [aspect, setAspect] = useState('1:1')
  const [count, setCount] = useState(1)
  const [durations, setDurations] = useState([])
  const [duration, setDuration] = useState(5)
  const [style, setStyle] = useState(null)
  const [connections, setConnections] = useState({})

  useEffect(() => { getConnections().then(setConnections) }, [])
  useEffect(() => { setAspect(kind === 'video' ? '16:9' : '1:1'); setStyle(null) }, [kind])
  useEffect(() => {
    let live = true
    durationsFor(model).then((ds) => {
      if (!live) return
      setDurations(ds)
      if (ds.length && !ds.includes(duration)) setDuration(ds.includes(5) ? 5 : ds[0])
    })
    return () => { live = false }
  }, [model?.id])

  const styleItem = styles.flatMap((g) => g.items).find((s) => s.id === style)
  const connected = connections[model.provider]?.connected
  const recent = gens.items.slice(0, 12)

  const onGenerate = () => {
    const full = [prompt.trim(), styleItem?.prompt].filter(Boolean).join(', ')
    gens.generate(model, { prompt: full, caption: prompt.trim(), aspect, count, duration })
  }

  const chips = [
    <Chip key="model" icon={<IconModel />} label={model.name}>
      {['comfy', 'google', 'fal', 'elevenlabs'].map((p) => {
        const list = options.filter((m) => m.provider === p)
        if (!list.length) return null
        return (
          <div key={p}>
            <h6>{providerInfo[p].name}{connections[p]?.connected ? '' : ' · not connected'}</h6>
            {list.map((m) => <Option key={m.id} on={m.id === model.id} label={m.name} note={m.note} onClick={() => choose(m.id)} />)}
          </div>
        )
      })}
      <h6><Link to="/models" style={{ color: 'var(--blue)' }}>Browse every fal model ›</Link></h6>
    </Chip>,
    kind !== 'audio' && (
      <Chip key="aspect" icon={<IconAspect />} label={aspect}>
        {aspects.map((a) => <Option key={a} on={a === aspect} label={a} onClick={() => setAspect(a)} />)}
      </Chip>
    ),
    kind === 'image' && (
      <Chip key="count" icon={<IconStack />} label={`${count} ${count === 1 ? 'image' : 'images'}`}>
        {[1, 2, 3, 4].map((n) => <Option key={n} on={n === count} label={`${n} ${n === 1 ? 'image' : 'images'}`} onClick={() => setCount(n)} />)}
      </Chip>
    ),
    kind === 'video' && durations.length > 0 && (
      <Chip key="dur" icon={<IconClock />} label={`${duration}s`}>
        {durations.map((d) => <Option key={d} on={d === duration} label={`${d} seconds`} onClick={() => setDuration(d)} />)}
      </Chip>
    ),
    kind !== 'audio' && (
      <Chip key="style" icon={<IconSpark />} label={styleItem?.name || 'Style'} lit={Boolean(styleItem)}>
        <Option on={!style} label="None" onClick={() => setStyle(null)} />
        {styles.map((g) => (
          <div key={g.group}>
            <h6>{g.group}</h6>
            {g.items.map((s) => <Option key={s.id} on={s.id === style} label={s.name} onClick={() => setStyle(s.id)} />)}
          </div>
        ))}
      </Chip>
    ),
  ]

  return (
    <main>
      <section className="hero">
        <h1>Create with <em>any model</em><br />using your own keys</h1>
        <p>Images, video and audio from ComfyUI, Google, fal and ElevenLabs. Open source, and it runs on your machine.</p>
      </section>
      <Composer kind={kind} setKind={setKind} prompt={prompt} setPrompt={setPrompt} placeholder={placeholders[kind]}
        chips={chips} onGenerate={onGenerate} busy={gens.busy} />
      {!connected && model.provider !== 'comfy' && (
        <div className="notice glass">{model.name} runs on {providerInfo[model.provider].name}. <Link to="/connections">Add your key</Link> to use it.</div>
      )}
      {gens.error && <div className="notice glass error">{gens.error}</div>}
      {recent.length > 0 && (
        <section className="results-wrap">
          <Results items={recent} />
        </section>
      )}
    </main>
  )
}
