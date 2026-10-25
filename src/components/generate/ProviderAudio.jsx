import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../lib/appContext.js'
import Results from '../Results.jsx'
import { canRun } from './parts.jsx'
import { Stepper } from './Pop.jsx'

// Preserve the existing provider runner, including user-added fal audio models.
export default function ProviderAudio({ model }) {
  const { gens, connections } = useApp()
  const [prompt, setPrompt] = useState('')
  const [takes, setTakes] = useState(1)
  const connected = canRun(model, connections)
  const speech = model.mode === 'speech'
  const go = (e) => {
    e.preventDefault()
    if (!prompt.trim() || !connected || model.open) return
    for (let t = 0; t < takes; t++) gens.generate(model, { prompt: prompt.trim(), caption: prompt.trim(), aspect: '1:1', count: 1, duration: 5, images: [] })
  }
  const items = gens.items.filter((g) => g.kind === 'audio' && g.model === model.name)
  return <>
    <form className="app-panel glass" onSubmit={go} aria-label={`${model.name} settings`}>
      <h2>{model.name}</h2>
      <div className="field">
        <label htmlFor="provider-audio-prompt">{speech ? 'Script' : 'Prompt'}</label>
        <textarea id="provider-audio-prompt" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={speech ? 'Write exactly what the voice should say' : model.mode === 'sfx' ? 'Describe a sound' : 'Describe music or audio'} />
      </div>
      <div className="gen-line"><span>Batch size</span><Stepper value={takes} onChange={setTakes} label="Takes per run" /></div>
      {model.open ? <p className="sheet-note">Not wired yet. This model has no runnable format.</p> : !connected && <p className="sheet-note"><Link to="/connections">Connect this provider</Link> to generate audio.</p>}
      {gens.error && <p className="sheet-error">{gens.error}{gens.retry && <button type="button" className="link-btn" onClick={gens.retry}>{gens.retry.label || 'Retry'}</button>}</p>}
      <button className="btn-blue" disabled={!prompt.trim() || !connected || model.open}>Generate audio</button>
    </form>
    {items.length > 0 && <Results items={items.filter((g) => !g.failed)} />}
  </>
}
