import { useRef, useState } from 'react'
import { Field } from '../components/formats/Fields.jsx'
import { IconClose, IconLink, IconUpload } from '../components/Icons.jsx'
import { Hero, Box, Cards, Pills, Tiles, Toggle, NotWired, Empty, IconRefresh, coverAt, stagger } from '../components/studiob/Kit.jsx'
import { formatById } from '../lib/formats/index.js'

const faceless = formatById('faceless')
const optionsOf = (id) => faceless?.inputs.find((i) => i.id === id)?.options || []

const categories = [
  { id: 'education', label: 'Education', ideas: ['Why the sky turns red at sunset', 'How a vaccine teaches your body', 'What money actually is', 'Why we forget our dreams', 'How a bridge carries a city', 'What happens while you sleep', 'Why ice floats', 'How a seed knows which way is up'] },
  { id: 'history', label: 'History', ideas: ['A day as a Roman baker', 'How the printing press spread ideas', 'Trading along the Silk Road', 'Life on a sailing ship in 1750', 'The race to the South Pole', 'The night the first street lamps came on', 'How castles were really built', 'The first postal service'] },
  { id: 'kids', label: 'Kids', ideas: ['Counting stars with a sleepy owl', 'Why leaves change color', 'Shapes hiding in the kitchen', 'A raindrop goes on a trip', 'Animals that glow in the dark', 'Colors with a painting bear', 'How a caterpillar becomes a butterfly', 'The moon and its many faces'] },
  { id: 'stories', label: 'Stories', ideas: ['The lighthouse keeper and the last ship', 'The fox who borrowed the moon', 'A clockmaker and a stolen hour', 'The girl who mapped the clouds', 'The village under the lake', 'A letter that took a hundred years', 'The baker who fed a dragon', 'The island that moved at night'] },
].map((c, i) => ({ ...c, cover: coverAt(i + 6) }))

// The Faceless video format's looks, plus hand-made styles for longer series.
const styles = [
  ...optionsOf('look').map((o) => ({ id: o.id, label: o.label, note: o.note })),
  { id: 'graphics', label: 'Motion graphics', note: 'Clean shapes and type' },
  { id: 'stick', label: 'Stick figures', note: 'Simple and funny' },
  { id: 'diorama', label: 'Paper diorama', note: 'Tiny paper sets' },
  { id: 'ink', label: 'Ink sketch', note: 'Pen lines on paper' },
  { id: 'collage', label: 'Cut paper collage', note: 'Torn paper layers' },
  { id: 'clay', label: 'Clay studio', note: 'Soft clay figures' },
].map((s, i) => ({ ...s, cover: coverAt(i) }))

const narrators = [
  { id: 'storyteller', label: 'Warm storyteller', note: 'Slow and cozy' },
  { id: 'teacher', label: 'Calm teacher', note: 'Clear and patient' },
  { id: 'bright', label: 'Bright and quick', note: 'High energy' },
  { id: 'documentary', label: 'Deep documentary', note: 'Low and steady' },
  { id: 'kids', label: 'Gentle for kids', note: 'Soft and playful' },
  { id: 'wit', label: 'Dry wit', note: 'Deadpan and sharp' },
]

const formats = optionsOf('format').map((o) => ({ id: o.id, label: o.label, note: o.note }))
const steps = ['Channel', 'Episode topic', 'Episode']

export default function FacelessStudio() {
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState('education')
  const [about, setAbout] = useState('')
  const [showRef, setShowRef] = useState(false)
  const [reference, setReference] = useState('')
  const [script, setScript] = useState(null)
  const [page, setPage] = useState(0)
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState('horizontal')
  const [minutes, setMinutes] = useState(3)
  const [animation, setAnimation] = useState('full')
  const [style, setStyle] = useState(styles[0]?.id)
  const [narrator, setNarrator] = useState('storyteller')
  const [voice, setVoice] = useState(null)
  const [captions, setCaptions] = useState(true)
  const [episodes, setEpisodes] = useState(4)
  const [cadence, setCadence] = useState('weekly')
  const fileRef = useRef(null)

  const cat = categories.find((c) => c.id === category)
  const ideas = Array.from({ length: 4 }, (_, i) => cat.ideas[(page * 4 + i) % cat.ideas.length])
  const readScript = (file) => {
    if (!file) return
    const r = new FileReader()
    r.onload = () => setScript({ name: file.name, text: String(r.result) })
    r.readAsText(file)
  }
  const canNext = step === 0 ? about.trim() || script : step === 1 ? topic.trim() : true
  const styleName = styles.find((s) => s.id === style)?.label
  const ratio = formats.find((f) => f.id === format)?.label

  return (
    <main className="sb-page">
      <Hero badge="Faceless studio" title="Start a faceless channel"
        sub="Describe the channel once. Every episode gets a script, narration, animation, music and captions in the same style." />

      <div className="sb-narrow">
        <ol className="sb-progress" aria-label="Steps">
          {steps.map((s, i) => (
            <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
              <button type="button" disabled={i > step} onClick={() => setStep(i)}><b>{i + 1}</b>{s}</button>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="sb-step-body rise">
            <Tiles items={categories} value={category} onChange={(id) => { setCategory(id); setPage(0) }} label="Category" />
            <form className="composer glass sb-compose" onSubmit={(e) => { e.preventDefault(); if (canNext) setStep(1) }}>
              <div className="composer-inner">
                <textarea rows={3} value={about} onChange={(e) => setAbout(e.target.value)} aria-label="Channel about"
                  placeholder={`What is the channel about? For example, ${cat.ideas[0].toLowerCase()} and other ${cat.label.toLowerCase()} questions`} />
                {showRef && (
                  <div className="import">
                    <IconLink />
                    <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="A video link to match the feel of" aria-label="Reference video link" />
                  </div>
                )}
                {script && (
                  <span className="ref">{script.name}
                    <button type="button" onClick={() => setScript(null)} aria-label="Remove script"><IconClose /></button>
                  </span>
                )}
                <div className="composer-foot">
                  <div className="chips">
                    <div className="chip"><button type="button" className={showRef ? 'lit' : ''} aria-pressed={showRef} onClick={() => setShowRef((s) => !s)}><IconLink />Reference</button></div>
                    <div className="chip"><button type="button" className={script ? 'lit' : ''} onClick={() => fileRef.current.click()}><IconUpload />Upload script</button></div>
                    <input ref={fileRef} type="file" accept=".txt,.md,text/plain" hidden onChange={(e) => { readScript(e.target.files[0]); e.target.value = '' }} />
                  </div>
                  <button className="btn-blue" disabled={!canNext}>Next</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {step === 1 && (
          <div className="sb-step-body rise">
            <Box label={`Ideas for a ${cat.label.toLowerCase()} channel`}
              aside={<button type="button" className="link-btn sb-icon-link" onClick={() => setPage((n) => n + 1)}><IconRefresh />More ideas</button>}>
              <p className="sheet-note">Starter ideas for this category. Ideas written from your channel description come once the engine is connected.</p>
              <div className="opt-grid sb-ideas" role="group" aria-label="Episode ideas">
                {ideas.map((idea, i) => (
                  <button key={`${page}-${idea}`} type="button" aria-pressed={topic === idea} className={`opt rise${topic === idea ? ' on' : ''}`} style={stagger(i)} onClick={() => setTopic(idea)}>
                    <strong>{idea}</strong>
                    <small>Episode idea {page * 4 + i + 1}</small>
                  </button>
                ))}
              </div>
              <Field input={{ id: 'topic', type: 'text', label: 'Or type your own', placeholder: 'What should this episode be about' }} value={topic} onChange={setTopic} />
            </Box>
            <div className="sb-nav">
              <button type="button" className="btn-soft" onClick={() => setStep(0)}>Back</button>
              <button type="button" className="btn-blue sm" disabled={!canNext} onClick={() => setStep(2)}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="sb-step-body rise">
            <Box label="Episode">
              <p className="sb-topic"><strong>{topic}</strong><span className="muted">{about.trim() || script?.name}</span></p>
              <div className="field"><label>Format</label><Cards options={formats} value={format} onChange={setFormat} label="Format" /></div>
              <div className="field"><label>Length</label><Pills options={[1, 2, 3, 4, 5].map((m) => ({ id: m, label: `${m} min` }))} value={minutes} onChange={setMinutes} label="Length" /></div>
              <div className="field"><label>Animation</label>
                <Cards options={[{ id: 'full', label: 'Fully animated', note: 'Motion in every scene' }, { id: 'frames', label: 'Frame by frame', note: 'Still frames with gentle moves' }]} value={animation} onChange={setAnimation} label="Animation" />
              </div>
              <Toggle on={captions} onChange={setCaptions}>Burn in captions</Toggle>
            </Box>
            <Box label="Style">
              <Tiles items={styles} value={style} onChange={setStyle} label="Style" />
            </Box>
            <Box label="Narrator">
              <Cards options={narrators} value={narrator} onChange={(v) => { setNarrator(v); setVoice(null) }} label="Narrator" />
              <Field input={{ id: 'voice', type: 'voice', label: 'Or use your own voice', optional: true }} value={voice} onChange={setVoice} />
            </Box>
            <Box label="Series">
              <div className="sb-grid2">
                <div className="field"><label>Episodes</label><Pills options={[1, 4, 8, 12].map((n) => ({ id: n, label: `${n} ${n === 1 ? 'episode' : 'episodes'}` }))} value={episodes} onChange={setEpisodes} label="Episodes" /></div>
                <div className="field"><label>New episode</label>
                  <Pills options={[['daily', 'Daily'], ['twice', 'Twice a week'], ['weekly', 'Weekly']].map(([id, label]) => ({ id, label }))} value={cadence} onChange={setCadence} label="New episode" />
                </div>
              </div>
              <p className="sheet-note">Later episodes reuse this channel's style, narrator and characters.</p>
            </Box>
            <div className="sb-nav">
              <button type="button" className="btn-soft" onClick={() => setStep(1)}>Back</button>
            </div>
            <NotWired label="Generate episode" runsOn={faceless?.runsOn}
              summary={`${minutes} min, ${ratio?.toLowerCase()}, ${styleName}, ${voice?.name || narrators.find((n) => n.id === narrator)?.label}${captions ? ', captions on' : ''}. Series of ${episodes}${episodes > 1 ? `, ${cadence === 'twice' ? 'twice a week' : cadence}` : ''}.`} />
          </div>
        )}

        <section className="sb-section">
          <div className="studio-sub"><h2>My channels</h2></div>
          <Empty title="No channels yet">A channel shows up here after its first episode is made.</Empty>
        </section>
      </div>
    </main>
  )
}
