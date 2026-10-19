import { useRef } from 'react'
import Segmented from '../components/Segmented.jsx'
import FormatWorkspace from '../components/formats/Workspace.jsx'
import { Hero, Box, Cards, useParam } from '../components/studiob/Kit.jsx'
import { formatById } from '../lib/formats/index.js'

const modes = [
  { value: 'speech', label: 'Text to speech' },
  { value: 'change', label: 'Voice change' },
  { value: 'translate', label: 'Translate' },
]
const voices = [
  { id: 'tts', format: 'tts', label: 'Chatterbox', note: 'Language and delivery controls, optional voice sample' },
  { id: 'fish-drama-3', format: 'drama3-tts', label: 'Drama 3', note: 'Read a script, optionally in a sample voice' },
  { id: 'qwen3-tts', format: 'qwen3-tts', label: 'Qwen3-TTS', note: 'Read a script in an uploaded sample voice' },
]

export default function AudioStudio() {
  const inputCache = useRef({})
  const [mode, setMode] = useParam('mode', modes.map((m) => m.value))
  const [model, setModel] = useParam('model', voices.map((m) => m.id))
  const format = formatById(mode === 'change' ? 'voice-change' : voices.find((v) => v.id === model).format)

  return (
    <main className="sb-page">
      <Hero badge="Audio" title="Give your words a voice"
        sub="Read a script or give a recording a new voice. Upload a voice sample to guide the sound.">
        <Segmented value={mode} onChange={setMode} options={modes} />
      </Hero>
      {mode === 'translate' ? (
        <div className="empty glass rise">
          <strong>Translate is not wired yet.</strong>
          <p>The dub workflow is not available. Translation will need speech recognition, translation, a new voice and lipsync.</p>
          <button type="button" className="btn-blue" disabled>Translate</button>
        </div>
      ) : (
        <>
          {mode === 'speech' && <Box label="Speech model"><Cards options={voices} value={model} onChange={setModel} label="Speech model" /></Box>}
          {mode === 'speech' && model === 'tts' && <p className="sheet-note">Choose the script's language. Chatterbox does not support auto detect.</p>}
          {mode === 'change' && <p className="sheet-note">Voice change uses the first 27 seconds of an audio recording.</p>}
          <FormatWorkspace key={format.id} format={format} showMore={false} inputCache={inputCache} />
        </>
      )}
    </main>
  )
}
