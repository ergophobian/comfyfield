import { useState } from 'react'
import Segmented from '../components/Segmented.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { Split, Box, Cards, Pills, Steps, NotWired, ErrorNote, Hero } from '../components/studiob/Kit.jsx'
import { formatById } from '../lib/formats/index.js'

const talking = formatById('talking-head')
const optionsOf = (id) => talking?.inputs.find((i) => i.id === id)?.options || []
const templates = optionsOf('template')
const languages = optionsOf('language')

const engines = [
  { id: 'infinitetalk', label: 'InfiniteTalk', note: 'A photo or a video, any length' },
  { id: 'wan-s2v', label: 'Wan 2.2 S2V', note: 'A photo, more body and camera motion' },
]
const durations = [{ id: 'audio', label: 'Match the audio' }, ...[5, 10, 15, 30].map((s) => ({ id: s, label: `${s} s` }))]

export default function LipsyncStudio() {
  const [template, setTemplate] = useState(templates[0]?.id)
  const [picking, setPicking] = useState(false)
  const [faceKind, setFaceKind] = useState('image')
  const [face, setFace] = useState(null)
  const [speech, setSpeech] = useState('text')
  const [script, setScript] = useState('')
  const [voice, setVoice] = useState(null)
  const [language, setLanguage] = useState('en')
  const [audio, setAudio] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [engine, setEngine] = useState('infinitetalk')
  const [duration, setDuration] = useState('audio')
  const [resolution, setResolution] = useState('720')
  const [error, setError] = useState(null)

  const tpl = templates.find((t) => t.id === template)
  // Wan S2V animates a still, so a video face goes to InfiniteTalk.
  const pickFace = (k) => {
    setFaceKind(k)
    setFace(null)
    if (k === 'video') setEngine('infinitetalk')
  }
  const engineName = engines.find((e) => e.id === engine)?.label
  const words = script.trim().split(/\s+/).filter(Boolean).length

  const panel = (
    <>
      <div className="sb-preview short" style={{ background: talking?.cover }}>
        <button type="button" className="btn-soft xs" aria-expanded={picking} onClick={() => setPicking((p) => !p)}>{picking ? 'Done' : 'Change'}</button>
        <strong>{tpl?.label}</strong>
      </div>
      {picking && <Pills options={templates} value={template} onChange={(v) => { setTemplate(v); setPicking(false) }} label="Scene" />}

      <Box label="Face" aside={<Segmented className="seg-sm" value={faceKind} onChange={pickFace} options={[{ value: 'image', label: 'Photo' }, { value: 'video', label: 'Video' }]} />}>
        <Field key={faceKind} input={{ id: 'face', type: faceKind, label: faceKind === 'image' ? 'A clear photo of the face' : 'A clip of the person talking' }} value={face} onChange={setFace} setError={setError} />
        <ErrorNote error={error} />
      </Box>

      <Box label="Speech" aside={<Segmented className="seg-sm" value={speech} onChange={setSpeech} options={[{ value: 'text', label: 'Type it' }, { value: 'audio', label: 'Upload audio' }]} />}>
        {speech === 'text' ? (
          <>
            <Field input={{ id: 'script', type: 'longtext', label: 'What should they say', rows: 4, placeholder: 'Hi, welcome back. Today we are trying something new.' }} value={script} onChange={setScript} />
            <div className="sb-grid2">
              <Field input={{ id: 'voice', type: 'voice', label: 'Voice', optional: true }} value={voice} onChange={setVoice} />
              <div className="field">
                <label htmlFor="ls-language">Language</label>
                <select id="ls-language" className="sb-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {languages.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </>
        ) : (
          <Field input={{ id: 'audio', type: 'audio', label: 'Speech to match' }} value={audio} onChange={setAudio} setError={setError} />
        )}
      </Box>

      <Field input={{ id: 'prompt', type: 'longtext', label: 'Scene', optional: true, rows: 2, placeholder: 'Describe the setting, the mood and how they move' }} value={prompt} onChange={setPrompt} />

      <Box label="Engine">
        <Cards options={engines.map((e) => ({ ...e, disabled: e.id === 'wan-s2v' && faceKind === 'video' }))} value={engine} onChange={setEngine} label="Engine" />
      </Box>
      <Box label="Duration"><Pills options={durations} value={duration} onChange={setDuration} label="Duration" /></Box>
      <Box label="Resolution"><Pills options={['480', '720'].map((r) => ({ id: r, label: `${r}p` }))} value={resolution} onChange={setResolution} label="Resolution" /></Box>
    </>
  )

  const summary = `${engineName}, ${duration === 'audio' ? 'as long as the audio' : `${duration} s`}, ${resolution}p${speech === 'text' && words ? `, ${words} ${words === 1 ? 'word' : 'words'}` : ''}`

  return (
    <main className="sb-page">
      <Split name="Lipsync studio" panel={panel} foot={<NotWired runsOn={engineName} summary={summary} />}>
        <div className="sb-intro">
          <Hero level={2} badge="Open models" title="Make any face talk" sub="Open lipsync models in one place. Start from a photo or a clip, add speech, pick an engine." />
          <Steps items={[
            { title: 'Add a photo or clip', text: 'Any face works as the base, a still or a video.' },
            { title: 'Add speech', text: 'Type the words and pick a voice, or upload audio.' },
            { title: 'Pick an engine', text: 'InfiniteTalk for long takes and video, Wan S2V for livelier stills.' },
          ]} />
        </div>
      </Split>
    </main>
  )
}
