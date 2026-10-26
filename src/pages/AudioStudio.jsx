import { useRef } from 'react'
import ModelPicker from '../components/ModelPicker.jsx'
import ProviderAudio from '../components/generate/ProviderAudio.jsx'
import { useGenModel } from '../components/generate/useGenModel.js'
import { useApp } from '../lib/appContext.js'
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
  { id: 'chatterbox-multilingual', format: 'tts', label: 'Chatterbox', note: 'Language and delivery controls, optional voice sample' },
  { id: 'comfy-drama3-tts', format: 'drama3-tts', label: 'Drama 3', note: 'Read a script, optionally in a sample voice' },
  { id: 'qwen3-tts', format: 'qwen3-tts', label: 'Qwen3-TTS', note: 'Read a script in an uploaded sample voice' },
]

export default function AudioStudio() {
  const inputCache = useRef({})
  const [mode, setMode] = useParam('mode', modes.map((m) => m.value))
  const pick = useGenModel('audio')
  const { connections } = useApp()
  const selected = voices.find((v) => v.id === pick.model.id)
  const formatModels = pick.open.filter((m) => voices.some((v) => v.id === m.id)).map((m) => ({ ...m, open: false, provider: 'comfy' }))
  const pickerModel = formatModels.find((m) => m.id === pick.model.id) || pick.model
  const format = formatById(mode === 'change' ? 'voice-change' : selected?.format)

  return (
    <main className="sb-page">
      <Hero badge="Audio" title="Give your words a voice"
        sub="Read a script or give a recording a new voice. Upload a voice sample to guide the sound.">
        <Segmented value={mode} onChange={setMode} options={modes} />
      </Hero>
      {mode === 'translate' ? (
        <FormatWorkspace format={formatById('dub')} showMore={false} inputCache={inputCache} />
      ) : (
        <>
          {mode === 'speech' && <Box label="Audio model">
            <Cards options={voices} value={pick.model.id} onChange={pick.choose} label="Speech model" />
            <ModelPicker variant="row" model={pickerModel} options={[...pick.options, ...formatModels]} open={pick.open.filter((m) => !formatModels.some((f) => f.id === m.id))} favorites={pick.favorites} toggleFavorite={pick.toggleFavorite} choose={pick.choose} connections={connections} />
          </Box>}
          {mode === 'speech' && selected?.format === 'tts' && <p className="sheet-note">Choose the script's language. Chatterbox does not support auto detect.</p>}
          {mode === 'change' && <p className="sheet-note">Voice change uses the first 27 seconds of an audio recording.</p>}
          {format ? <FormatWorkspace key={format.id} format={format} showMore={false} inputCache={inputCache} /> : <ProviderAudio key={pick.model.id} model={pick.model} />}
        </>
      )}
    </main>
  )
}
