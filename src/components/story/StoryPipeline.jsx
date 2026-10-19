import { useRef, useState } from 'react'
import { useApp } from '../../lib/appContext.js'
import { writePrompt } from '../../lib/providers.js'
import { stitchRequest, uploadStitchFile } from '../../lib/stitch.js'
import { parseShots, renderStory, reviewStory } from '../../lib/storyStudios.js'
import { Field } from '../formats/Fields.jsx'

export default function StoryPipeline({ values, disabled = false, onComplete }) {
  const { gens } = useApp()
  const [session, setSession] = useState(null)
  const [stage, setStage] = useState('idle')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState(null)
  const [music, setMusic] = useState(null)
  const frozen = useRef(null)
  const cache = useRef(new Map())
  const work = async (fn) => {
    setBusy(true)
    setError('')
    try { await fn() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const check = (run) => {
    const failed = Object.values(run.engine.state).flatMap((s) => s.items || []).find((i) => i.status === 'failed')
    if (failed) throw new Error(failed.error)
  }
  const draft = () => work(async () => {
    const status = await fetch('/api/stitch/status').then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not check ffmpeg.')
      return data
    })
    if (!status.available) throw new Error(status.error || 'ffmpeg is missing. Run npm install to install the bundled binary.')
    let track = music
    if (music?.url?.startsWith('blob:')) {
      const blob = await fetch(music.url).then((res) => res.blob())
      track = await uploadStitchFile(new File([blob], music.name || 'music', { type: blob.type || 'audio/mpeg' }))
    }
    frozen.current = structuredClone({ ...values, music: track })
    cache.current = new Map()
    setResult(null)
    const run = reviewStory(frozen.current, writePrompt)
    setSession(run)
    await run.engine.runNew(run.flow)
    check(run)
    setText(run.engine.state.script.items[0].text)
    setStage('script')
  })
  const approveScript = () => work(async () => {
    session.engine.editWriter(session.flow, 'script', text)
    await session.engine.sendWriter(session.flow, 'script')
    await session.engine.send(session.flow, 'approve-script')
    check(session)
    setText(session.engine.state.shots.items[0].text)
    setStage('shots')
  })
  const render = () => work(async () => {
    const shots = parseShots(text, frozen.current, session.engine.state.script.items[0].text)
    session.engine.editWriter(session.flow, 'shots', text)
    await session.engine.sendWriter(session.flow, 'shots')
    await session.engine.send(session.flow, 'approve-shots')
    setStage('render')
    const file = await renderStory(shots, frozen.current, { generateFormat: gens.generateFormat, stitch: (opts) => stitchRequest('', opts), onProgress: setProgress, cache: cache.current })
    gens.add([{ ...file, storyStudio: frozen.current.studio }])
    setResult(file)
    setStage('done')
    onComplete?.(file, frozen.current)
  })
  return (
    <section className="sb-section story-pipeline" aria-label={`${values.studio} pipeline`} aria-busy={busy}>
      <h2>Review and render</h2>
      <p className="sheet-note">Review the script, then the shot list. Approving the shot list starts paid model runs. Narration sets each shot’s final length. Captions follow each shot, without word timing. Narrator labels guide writing; choose a saved voice to set speech identity.</p>
      {stage === 'idle' && <>
        <Field input={{ id: 'music', type: 'audio', label: 'Background music', optional: true }} value={music} onChange={setMusic} setError={setError} />
        <button type="button" className="btn-blue" disabled={busy || disabled} onClick={draft}>{busy ? 'Writing script…' : 'Write script'}</button>
      </>}
      {['script', 'shots'].includes(stage) && <>
        <label className="field">{stage === 'script' ? 'Script for approval' : 'Shot list for approval'}
          <textarea rows={10} aria-label={stage === 'script' ? 'Script for approval' : 'Shot list for approval'} value={text} disabled={busy} onChange={(e) => setText(e.target.value)} />
        </label>
        <button type="button" className="btn-blue" disabled={busy || !text.trim()} onClick={stage === 'script' ? approveScript : render}>
          {busy ? 'Working…' : stage === 'script' ? 'Approve script' : 'Approve shots and render'}
        </button>
      </>}
      {stage === 'render' && <><p role="status">{progress}</p>{!busy && <button type="button" className="btn-blue" onClick={render}>Retry remaining steps</button>}</>}
      {error && <p role="alert" className="error">{error}</p>}
      {result && <><video className="story-result" controls src={result.url} aria-label="Finished story" /><p>Saved to the Library.</p><a className="btn-soft" href={result.url} download>Download video</a></>}
      {!busy && stage !== 'idle' && <button type="button" className="btn-soft" onClick={() => {
        setStage('idle')
        setSession(null)
        setText('')
        setError('')
        setResult(null)
      }}>Start a new draft</button>}
    </section>
  )
}
