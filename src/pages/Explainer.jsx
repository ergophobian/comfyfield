import { useMemo, useRef, useState } from 'react'
import Segmented from '../components/Segmented.jsx'
import { Chip, Option } from '../components/Composer.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { IconAspect, IconAudio, IconClip, IconClock, IconClose, IconLink, IconSpark } from '../components/Icons.jsx'
import { Hero, Tiles, Empty, coverAt, stagger } from '../components/studiob/Kit.jsx'
import { formatById } from '../lib/formats/index.js'

const explainer = formatById('explainer')

// The Explainer video format's styles first, then more looks for longer videos.
const styles = [
  ...(explainer?.inputs.find((i) => i.id === 'style')?.options || []).map((o) => ({ id: o.id, label: o.label, note: o.note })),
  { id: 'pixel', label: 'Pixel art', note: 'Chunky retro pixels' },
  { id: 'clay', label: 'Clay motion', note: 'Squishy clay models' },
  { id: 'mixed', label: 'Mixed media', note: 'Photos meet doodles' },
  { id: 'low-poly', label: 'Low poly', note: 'Faceted 3D shapes' },
  { id: 'isometric', label: 'Isometric', note: 'Tidy tilted worlds' },
  { id: 'plush', label: 'Plush toys', note: 'Soft felt characters' },
  { id: 'chalk', label: 'Chalkboard', note: 'Chalk on slate' },
  { id: 'blueprint', label: 'Blueprint', note: 'White lines on blue' },
].map((s, i) => ({ ...s, cover: coverAt(i + 1) }))

const durations = [
  { id: '20', label: '20 seconds', s: 20 },
  { id: '30', label: '30 seconds', s: 30 },
  { id: '60', label: '1 minute', s: 60 },
  { id: '180', label: '3 minutes', s: 180 },
  { id: '300', label: '5 minutes', s: 300 },
  { id: '600', label: '10 minutes', s: 600 },
  { id: 'fit', label: 'Fit to script', note: 'Script only' },
]
const ratios = [{ id: '16:9', label: '16:9', note: 'Horizontal' }, { id: '9:16', label: '9:16', note: 'Vertical' }, { id: '1:1', label: '1:1', note: 'Square' }]
const voices = ['Clear guide', 'Warm host', 'Curious kid', 'News anchor', 'Late night radio', 'Cheerful teacher', 'Calm coach', 'Bold announcer']

// About 150 words a minute of narration.
const secondsFor = (text) => Math.max(2, Math.round(text.split(/\s+/).filter(Boolean).length / 2.5))
const clock = (s) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ''}`)

function fromScript(text) {
  let parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  if (parts.length === 1) {
    const sentences = parts[0].match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) || []
    parts = []
    for (let i = 0; i < sentences.length; i += 2) parts.push(sentences.slice(i, i + 2).join(' '))
  }
  return parts.map((p, i) => ({ title: `Scene ${i + 1}`, text: p, seconds: secondsFor(p) }))
}

// Topic mode outlines the video: a hook, the middle beats that fit the length, and a close.
const middle = [
  ['The big idea', 'The one idea that explains {t}.'],
  ['Why it matters', 'Why {t} matters in everyday life.'],
  ['How it works', 'Step by step, how {t} works.'],
  ['An example', 'A real example of {t}.'],
  ['A common mistake', 'What most people get wrong about {t}.'],
  ['Zoom in', 'A close look at the smallest part of {t}.'],
  ['Zoom out', 'The bigger picture around {t}.'],
  ['Try it yourself', 'A simple way to see {t} for yourself.'],
  ['Recap', 'The key points in one breath.'],
  ['What to remember', 'One line to take away.'],
]
function outline(topic, seconds) {
  const n = Math.min(12, Math.max(3, Math.round(seconds / 12)))
  const about = topic.trim() || 'your topic'
  const picks = [['Hook', 'Open with a surprising question about {t}.'], ...middle.slice(0, n - 2), ['Wrap up', 'Close with what to look into next.']]
  const each = Math.round(seconds / n)
  return picks.map(([title, text], i) => ({ title, text: text.replace('{t}', about), seconds: i === n - 1 ? seconds - each * (n - 1) : each }))
}

export default function Explainer() {
  const [mode, setMode] = useState('topic')
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [showLink, setShowLink] = useState(false)
  const [link, setLink] = useState('')
  const [style, setStyle] = useState(styles[0]?.id)
  const [ratio, setRatio] = useState('16:9')
  const [duration, setDuration] = useState('60')
  const [voice, setVoice] = useState(voices[0])
  const [ownVoice, setOwnVoice] = useState(null)
  const fileRef = useRef(null)

  const script = mode === 'script'
  const d = durations.find((x) => x.id === duration)
  const fit = duration === 'fit' && script
  const target = d.s || 60
  const scenes = useMemo(() => (script ? fromScript(text) : outline(text || link, target)), [script, text, link, target])
  const runtime = scenes.reduce((n, s) => n + s.seconds, 0)
  const styleItem = styles.find((s) => s.id === style)
  const voiceName = ownVoice?.name || voice
  const switchMode = (m) => {
    setMode(m)
    if (m === 'topic' && duration === 'fit') setDuration('60')
  }

  return (
    <main className="sb-page">
      <Hero badge="Explainer" title="Explain anything in one video"
        sub="Type a topic, paste a script, attach a file or a link. You get a script, scenes and narration in one visual style." />

      <form className="composer glass sb-compose" onSubmit={(e) => e.preventDefault()}>
        <div className="composer-inner">
          <div className="composer-top">
            <Segmented value={mode} onChange={switchMode} options={[{ value: 'topic', label: 'Topic' }, { value: 'script', label: 'Script' }]} />
          </div>
          <textarea rows={script ? 6 : 3} value={text} onChange={(e) => setText(e.target.value)} aria-label={script ? 'Script' : 'What should the video explain'}
            placeholder={script ? 'Paste your narration. Each paragraph becomes a scene.' : 'What should the video explain? For example, how bees turn nectar into honey'} />
          {showLink && (
            <div className="import">
              <IconLink />
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="A page to explain, such as an article or a docs page" aria-label="Link" />
            </div>
          )}
          {files.length > 0 && (
            <div className="refs">
              {files.map((f) => (
                <span className="ref" key={f}>{f}
                  <button type="button" onClick={() => setFiles((x) => x.filter((n) => n !== f))} aria-label={`Remove ${f}`}><IconClose /></button>
                </span>
              ))}
            </div>
          )}
          <div className="composer-foot">
            <div className="chips">
              <div className="chip"><button type="button" className={files.length ? 'lit' : ''} onClick={() => fileRef.current.click()}><IconClip />Attach files</button></div>
              <input ref={fileRef} type="file" multiple hidden accept=".pdf,.txt,.md,.doc,.docx,.ppt,.pptx"
                onChange={(e) => { setFiles((x) => [...new Set([...x, ...[...e.target.files].map((f) => f.name)])]); e.target.value = '' }} />
              <div className="chip"><button type="button" className={showLink ? 'lit' : ''} aria-pressed={showLink} onClick={() => setShowLink((s) => !s)}><IconLink />Link</button></div>
              <Chip icon={<IconSpark />} label={styleItem?.label} lit>
                {styles.map((s) => <Option key={s.id} label={s.label} note={s.note} on={style === s.id} onClick={() => setStyle(s.id)} />)}
              </Chip>
              <Chip icon={<IconAspect />} label={ratio}>
                {ratios.map((r) => <Option key={r.id} label={r.label} note={r.note} on={ratio === r.id} onClick={() => setRatio(r.id)} />)}
              </Chip>
              <Chip icon={<IconClock />} label={fit ? 'Fit to script' : d.label}>
                {durations.map((x) => <Option key={x.id} label={x.label} note={x.note} on={duration === x.id} disabled={x.id === 'fit' && !script} onClick={() => setDuration(x.id)} />)}
              </Chip>
              <Chip icon={<IconAudio />} label={voiceName}>
                <h6>Narrator</h6>
                {voices.map((v) => <Option key={v} label={v} on={!ownVoice && voice === v} onClick={() => { setVoice(v); setOwnVoice(null) }} />)}
                <div className="sb-chip-field">
                  <Field input={{ id: 'own-voice', type: 'voice', label: 'Your own voice', optional: true }} value={ownVoice} onChange={setOwnVoice} />
                </div>
              </Chip>
            </div>
            <button type="button" className="btn-blue" disabled>Generate</button>
          </div>
        </div>
      </form>
      <p className="sb-wire muted">
        {fit ? clock(runtime) : d.label}, {ratio}, {styleItem?.label.toLowerCase()}, read by {voiceName}.
        {files.length > 0 && ' Attached files are read once the engine is connected.'}
        {' '}Not wired yet. Runs on {explainer?.runsOn || 'open weights'} once the engine is connected.
      </p>

      <section className="sb-section">
        <div className="studio-sub">
          <h2>Style</h2>
          <span className="muted">One look for every scene.</span>
        </div>
        <Tiles items={styles} value={style} onChange={setStyle} label="Style" />
      </section>

      <section className="sb-section">
        <div className="studio-sub">
          <h2>Scenes</h2>
          <span className="muted">
            {script ? `Split from your script, about ${clock(runtime)} of narration.` : `An outline for ${d.label}. The script for each scene is written when you generate.`}
          </span>
        </div>
        {scenes.length ? (
          <ol className="sb-board">
            {scenes.map((s, i) => (
              <li key={`${i}-${s.title}`} className="sb-scene glass rise" style={stagger(i)}>
                <span className="sb-scene-cover" style={{ background: styleItem?.cover }}><b>{i + 1}</b><em>{clock(s.seconds)}</em></span>
                <strong>{s.title}</strong>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        ) : (
          <Empty title="No scenes yet">Paste a script above and it splits into scenes here.</Empty>
        )}
      </section>
    </main>
  )
}
