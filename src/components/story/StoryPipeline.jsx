import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../lib/appContext.js'
import { writePrompt } from '../../lib/providers.js'
import { stitchRequest, uploadStitchFile } from '../../lib/stitch.js'
import { parseShots, renderStory, reviewStory, storyPlan } from '../../lib/storyStudios.js'
import { Field } from '../formats/Fields.jsx'

export default function StoryPipeline({ values, disabled = false, onComplete, onLockChange }) {
  const { gens } = useApp()
  const [quote, setQuote] = useState(null)
  const [quoteError, setQuoteError] = useState('')
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
  useEffect(() => {
    if (stage !== 'shots') return
    let cancelled = false
    setQuote(null)
    setQuoteError('')
    const timer = setTimeout(async () => {
      try {
        const shots = parseShots(text, frozen.current, session.engine.state.script.items[0].text)
        const plan = await storyPlan(frozen.current, shots)
        if (!cancelled) setQuote({ ...plan, text })
      } catch (e) { if (!cancelled) setQuoteError(e.message) }
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [stage, text, session])
  const reset = () => {
    frozen.current = null
    cache.current = new Map()
    setStage('idle')
    setSession(null)
    setText('')
    setError('')
    setResult(null)
    setQuote(null)
    onLockChange?.(false)
  }
  const draft = () => work(async () => {
    onLockChange?.(true)
    setStage('draft')
    const settings = structuredClone(values)
    const status = await fetch('/api/stitch/status').then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not check ffmpeg.')
      return data
    })
    if (!status.available) throw new Error(status.error || 'ffmpeg is missing. Run npm install to install the bundled binary.')
    const plan = await storyPlan(settings)
    if (settings.video && plan.fps) settings.video.fps = plan.fps
    let track = music
    if (music?.url?.startsWith('blob:')) {
      const blob = await fetch(music.url).then((res) => res.blob())
      track = await uploadStitchFile(new File([blob], music.name || 'music', { type: blob.type || 'audio/mpeg' }))
    }
    frozen.current = structuredClone({ ...settings, music: track })
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
    const file = await renderStory(shots, frozen.current, { generateFormat: gens.generateFormat, preflight: storyPlan, stitch: (opts) => stitchRequest('', opts), onProgress: setProgress, cache: cache.current })
    gens.add([{ ...file, storyStudio: frozen.current.studio }])
    setResult(file)
    setStage('done')
    onComplete?.(file, frozen.current)
  })
  return (
    <section className="sb-section story-pipeline" aria-label={`${values.studio} pipeline`} aria-busy={busy}>
      <h2>Review and render</h2>
      <p className="sheet-note">Review the script, then the shot list. Approving the shot list starts paid model runs. Narration sets each shot’s final length; animated visuals last up to 5 seconds per shot. Split longer scenes before approval. Longer narration is sped up to fit the 5-second animated limit. Captions follow each shot, without word timing. Narrator labels guide writing; upload a voice sample to set speech identity.</p>
      <p className="sheet-note">Writer calls bill when you click Write script and Approve script, including retries. Writer cost depends on the configured model and token use and is excluded from render estimates. No media renders until shot approval.</p>
      {stage !== 'idle' && <p className="sheet-note">Settings are locked for this draft. Edit settings discards the script, shots and retry history.</p>}
      {stage === 'idle' && <>
        <Field input={{ id: 'music', type: 'audio', label: 'Background music', optional: true }} value={music} onChange={setMusic} setError={setError} />
        <button type="button" className="btn-blue" disabled={busy || disabled} onClick={draft}>{busy ? 'Writing script…' : 'Write script'}</button>
      </>}
      {['script', 'shots'].includes(stage) && <>
        <label className="field">{stage === 'script' ? 'Script for approval' : 'Shot list for approval'}
          <textarea rows={10} aria-label={stage === 'script' ? 'Script for approval' : 'Shot list for approval'} value={text} disabled={busy} onChange={(e) => setText(e.target.value)} />
        </label>
        {stage === 'shots' && <div className="story-estimate" aria-live="polite">
          {quote ? <><p>Estimated render total: {quote.usd == null ? 'Price unavailable' : `$${quote.usd.toFixed(3)}`} on {quote.target}. Pipeline requires {quote.minVramGb} GB of GPU memory.</p>
            <ol>{quote.perShot.map((shot, i) => <li key={i}>{shot.title}: {shot.usd == null ? 'Price unavailable' : `$${shot.usd.toFixed(3)}`}</li>)}</ol>
            <p className="sheet-note">Rough GPU time estimate using reference runtimes; actual duration and cost vary with narration, settings and hardware. Excludes writer charges, Session startup, downloads, storage and idle time. Sessions keep billing while running.</p>
          </> : <p>{quoteError || 'Checking pipeline requirements and estimating render cost…'}</p>}
        </div>}
        <button type="button" className="btn-blue" disabled={busy || !text.trim() || (stage === 'shots' && (!quote || quote.text !== text))} onClick={stage === 'script' ? approveScript : render}>
          {busy ? 'Working…' : stage === 'script' ? 'Approve script' : 'Approve shots and render'}
        </button>
      </>}
      {stage === 'render' && <><p role="status">{progress}</p>{!busy && <button type="button" className="btn-blue" onClick={render}>Retry remaining steps</button>}</>}
      {error && <p role="alert" className="error">{error}</p>}
      {result && <><video className="story-result" controls src={result.url} aria-label="Finished story" /><p>Saved to the Library.</p><a className="btn-soft" href={result.url} download>Download video</a></>}
      {!busy && stage !== 'idle' && <button type="button" className="btn-soft" onClick={reset}>Edit settings</button>}
    </section>
  )
}
