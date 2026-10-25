import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import ModelPicker from '../components/ModelPicker.jsx'
import Pop, { Stepper } from '../components/generate/Pop.jsx'
import Slot from '../components/generate/Slot.jsx'
import VoicePicker, { defaultVoice } from '../components/generate/Voices.jsx'
import { Feed, GoButton, PanelTabs, StatusNote, Steps, balanceText, canRun, costText, noun, useSticky } from '../components/generate/parts.jsx'
import { useGenModel } from '../components/generate/useGenModel.js'
import { IconBook, IconFolder, IconGlobe, IconMic, IconWave } from '../components/generate/icons.jsx'
import { IconSpark, IconVideo } from '../components/Icons.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { useApp } from '../lib/appContext.js'
import { estimate, useBalance, useModelMeta } from '../lib/cost.js'
import { formatById } from '../lib/formats/index.js'
import { covers } from '../lib/formats/parts.js'
import { missingInputs } from '../lib/recipes.js'

const modes = [
  { value: 'speech', label: 'Text to speech' },
  { value: 'change', label: 'Voice change' },
  { value: 'translate', label: 'Translate' },
]
const mainTabs = [
  { value: 'history', label: <><IconFolder />History</> },
  { value: 'how', label: <><IconBook />How it works</> },
]

// Voice change and Translate run the Voice change and Dub formats, and Chatterbox speech runs Text to speech,
// so delivery and languages come from those formats and the page and the formats agree.
const tts = formatById('tts')
const change = formatById('voice-change')
const dub = formatById('dub')
const optionsOf = (f, id) => f?.inputs.find((i) => i.id === id)?.options || []
const deliveries = optionsOf(tts, 'emotion').length ? optionsOf(tts, 'emotion') : [{ id: 'neutral', label: 'Neutral' }]
const spoken = optionsOf(tts, 'language')
const targets = optionsOf(dub, 'language')
const languages = [{ id: 'auto', label: 'Auto detect' }, ...spoken]
const voiceInput = { id: 'voice', type: 'voice', label: 'Voice', optional: true }
const clipInput = { ...dub?.inputs.find((i) => i.id === 'video'), label: 'Video with speech' }

// Speech models read a script; sound effect and music models take a description instead.
const isSpeech = (m) => m.open ? /speech|voice/i.test(m.blurb) : m.mode === 'speech'
const placeholderFor = (m) => (isSpeech(m) ? 'Write exactly what the voice should say'
  : m.mode === 'sfx' || /effect/i.test(m.blurb || '') ? 'Describe a sound, e.g. rain on a tin roof with distant thunder'
  : 'Describe a song: genre, mood, instruments and any lyrics')

const explain = {
  speech: {
    title: 'Turn a script into speech',
    text: 'Lifelike voices for ads, explainers and stories.',
    steps: [
      { title: 'Choose a voice', text: 'Start from a sample voice, or save your own in Library.', art: <IconMic />, cover: covers.sky },
      { title: 'Write it, then generate', text: 'Type the script, set the delivery and the language, and press Generate.', art: <IconWave />, cover: covers.lilac },
    ],
  },
  change: {
    title: 'Give any recording a new voice',
    text: 'Same words, same timing, a different voice.',
    steps: [
      { title: 'Add a recording', text: 'Drop in a voice clip, or a video with speech in it.', art: <IconWave />, cover: covers.rose },
      { title: 'Pick the new voice', text: 'Choose a voice you saved in Library, then generate.', art: <IconMic />, cover: covers.mint },
    ],
  },
  translate: {
    title: 'Speak to a new audience',
    text: 'Translate the speech in a video, voice it again and match the lips.',
    steps: [
      { title: 'Add a video', text: 'A clip with clear speech works best.', art: <IconVideo />, cover: covers.sun },
      { title: 'Pick a language', text: 'Choose the language to dub into. The speaker keeps their voice and the lips follow the new words.', art: <IconGlobe />, cover: covers.peach },
    ],
  },
}

// Higgsfield's Audio page: one panel with three modes, history and how it works beside it.
export default function AudioStudio() {
  const { gens, connections } = useApp()
  const [params, setParams] = useSearchParams()
  const mode = modes.some((m) => m.value === params.get('mode')) ? params.get('mode') : 'speech'
  const pick = useGenModel('audio')
  const { model } = pick
  const [voice, setVoice] = useState(defaultVoice)
  const [savedVoice, setSavedVoice] = useState(null)
  const [newVoice, setNewVoice] = useState(null)
  const [script, setScript] = useState('')
  const [delivery, setDelivery] = useState(deliveries[0].id)
  const [language, setLanguage] = useState('auto')
  const [takes, setTakes] = useState(1)
  const [recording, setRecording] = useState(null)
  const [video, setVideo] = useState(null)
  const [target, setTarget] = useState(targets[0]?.id)
  const [main, setMain] = useState('history')
  const [error, setError] = useState(null)
  const [panel, sticks] = useSticky()
  const balance = useBalance()
  const metaOf = useModelMeta([model])

  const setMode = (m) => {
    const next = new URLSearchParams(params)
    if (m === 'speech') next.delete('mode')
    else next.set('mode', m)
    setParams(next, { replace: true })
  }

  const speech = isSpeech(model)
  // An open speech model with a format of its own (Chatterbox) runs that format; the other open models are not wired.
  const viaFormat = model.open && model.format === tts?.id
  const connected = canRun(model, connections)
  const text = script.trim()
  const each = estimate(model, metaOf(model), { aspect: '1:1', count: 1, duration: 5, takes, chars: text.length })
  const cost = mode === 'speech' && each && text ? each : null
  const bal = !model.open && balanceText(balance, model.provider)
  const spokenLanguage = spoken.some((l) => l.id === language) ? language : 'en'
  // The format and its sheet values, when this mode runs through a format.
  const job = mode === 'change' ? [change, { audio: recording && { url: recording.url, name: recording.name }, voice: newVoice }]
    : mode === 'translate' ? [dub, { video, language: target }]
    : viaFormat ? [tts, { script: text, voice: savedVoice, emotion: delivery, language: spokenLanguage }]
    : null
  const ready = job ? Boolean(job[0]) && !missingInputs(...job).length : mode === 'speech' && Boolean(text) && connected
  const deliveryLabel = deliveries.find((d) => d.id === delivery)?.label
  const shownLanguages = viaFormat ? spoken : languages
  const languageLabel = shownLanguages.find((l) => l.id === (viaFormat ? spokenLanguage : language))?.label
  const formatNote = mode === 'change' ? 'Runs on Chatterbox on Comfy Cloud or a Pod. It changes the first 27 seconds.'
    : mode === 'translate' ? `Runs on ${dub?.runsOn} on a Pod. It dubs the first 30 seconds.`
    : viaFormat ? 'Runs on Chatterbox on Comfy Cloud or a Pod. A long script reads in parts and comes back as one file.'
    : null

  const go = async (e) => {
    e?.preventDefault()
    if (!ready) return
    setMain('history')
    setError(null)
    if (!job) {
      for (let t = 0; t < takes; t++) gens.generate(model, { prompt: text, caption: text, aspect: '1:1', count: 1, duration: 5, images: [] })
      return
    }
    try {
      await Promise.all(Array.from({ length: mode === 'speech' ? takes : 1 }, () => gens.generateFormat(...job)))
    } catch (err) { setError(err.message) }
  }

  const how = explain[mode]
  const explainer = (
    <div className="gen-explain">
      <div className="gen-explain-head rise">
        <h1>{how.title}</h1>
        <p>{how.text}</p>
      </div>
      <Steps steps={how.steps} />
      {mode !== 'translate' && <p className="gen-hint">Saved voices live in <Link className="link-btn" to="/assets?tab=voices">Library voices</Link></p>}
    </div>
  )

  return (
    <main className="gen gen-split">
      <aside className={`gen-panel glass${sticks ? ' stick' : ''}`} ref={panel} aria-label="Audio settings">
        <PanelTabs tabs={modes} value={mode} onChange={setMode} label="Audio modes" />
        {error && <p className="gen-status error">{error}</p>}
        <form className="gen-form" onSubmit={go} key={mode}>
          {mode === 'speech' && (
            <>
              {viaFormat ? <Field input={voiceInput} value={savedVoice} onChange={setSavedVoice} />
                : speech && <VoicePicker value={voice} onChange={setVoice} tag="Optional" />}
              <div className="gen-box">
                <label className="gen-box-label" htmlFor="script">{speech ? 'Script' : 'Prompt'}</label>
                <textarea id="script" value={script} onChange={(e) => setScript(e.target.value)} rows={5} placeholder={placeholderFor(model)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && go()} />
                {speech && (
                  <div className="chips">
                    <Pop icon={<IconSpark />} label={deliveryLabel} title="Delivery" lit={delivery !== deliveries[0].id}>
                      <h6>Delivery</h6>
                      {deliveries.map((d) => <button key={d.id} type="button" className={d.id === delivery ? 'on' : ''} onClick={() => setDelivery(d.id)}>{d.label}</button>)}
                      {!viaFormat && <p className="menu-note">Not wired yet. Speech reads in the model's own delivery for now.</p>}
                    </Pop>
                    <Pop icon={<IconGlobe />} label={languageLabel} title="Language" lit={viaFormat ? spokenLanguage !== 'en' : language !== 'auto'}>
                      <h6>Language</h6>
                      {shownLanguages.map((l) => (
                        <button key={l.id} type="button" className={l.id === (viaFormat ? spokenLanguage : language) ? 'on' : ''} onClick={() => setLanguage(l.id)}>{l.label}</button>
                      ))}
                      {!viaFormat && <p className="menu-note">The model reads the language you write in. Picking one is not wired yet.</p>}
                    </Pop>
                  </div>
                )}
              </div>
            </>
          )}
          {mode === 'change' && (
            <>
              <Slot type="media" title="Add a recording" hint="A voice clip or a video with speech" value={recording} onChange={setRecording} setError={setError} />
              <Field input={{ ...voiceInput, label: 'New voice', optional: false }} value={newVoice} onChange={setNewVoice} />
            </>
          )}
          {mode === 'translate' && (
            <>
              <Field input={clipInput} value={video} onChange={setVideo} setError={setError} />
              <div className="gen-box">
                <span className="gen-box-label" id="target-label">Translate into</span>
                <div className="pills" role="group" aria-labelledby="target-label">
                  {targets.map((l) => (
                    <button key={l.id} type="button" aria-pressed={l.id === target} className={l.id === target ? 'on' : ''} onClick={() => setTarget(l.id)}>{l.label}</button>
                  ))}
                </div>
              </div>
            </>
          )}
          {mode === 'speech' && (
            <ModelPicker variant="row" model={model} options={pick.options} open={pick.open} favorites={pick.favorites}
              toggleFavorite={pick.toggleFavorite} choose={pick.choose} connections={connections} />
          )}
          {mode === 'speech' && (
            <div className="gen-line">
              <span>Batch size</span>
              <Stepper value={takes} onChange={setTakes} label="Takes per run" />
            </div>
          )}
          {formatNote ? <p className="gen-status">{formatNote}</p> : <StatusNote model={model} connected={connected} />}
          <div className="gen-go-row">
            <GoButton total={mode === 'speech' && text ? takes : 1} cost={costText(cost)} disabled={!ready} />
          </div>
          {mode === 'speech' && connected && !viaFormat && (
            <p className="gen-sum">
              {text ? <><strong>{takes} {noun.audio[takes === 1 ? 0 : 1]}</strong>{cost ? ` · ${costText(cost)}` : ''}</> : 'The cost shows on Generate before you run'}
              {bal && <span>{bal}</span>}
            </p>
          )}
        </form>
      </aside>

      <section className="gen-main">
        <div className="gen-main-head">
          <Segmented value={main} onChange={setMain} options={mainTabs} />
        </div>
        {gens.error && <div className="notice glass error gen-notice">{gens.error}{gens.retry && <button type="button" className="link-btn" onClick={gens.retry}>Retry</button>}</div>}
        {main === 'how' ? explainer : <Feed kind={mode === 'translate' ? 'video' : 'audio'} gens={gens} batches={[]} empty={explainer} />}
      </section>
    </main>
  )
}
