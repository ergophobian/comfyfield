import { PageArt } from '../Art.jsx'
import { useEffect, useRef, useState } from 'react'
import { useLibrary } from '../../lib/useLibrary.js'
import { voiceAccept, voiceLimits } from '../../../shared/voices.js'

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('Could not read that sample.'))
  reader.readAsDataURL(file)
})

export function VoiceEditor({ item, onClose }) {
  const lib = useLibrary()
  const [name, setName] = useState(item?.name || '')
  const [notes, setNotes] = useState(item?.notes || '')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [sourceDuration, setSourceDuration] = useState(0)
  const [start, setStart] = useState(0)
  const [duration, setDuration] = useState(10)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const recorder = useRef(null)
  const stream = useRef(null)
  const timer = useRef(null)
  const recordedDuration = useRef(0)
  const mounted = useRef(true)
  const audio = useRef(null)
  const uploadInput = useRef(null)
  const form = useRef(null)
  const returnFocus = useRef(document.activeElement)

  useEffect(() => {
    mounted.current = true
    form.current.querySelector('input')?.focus()
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
      if (recorder.current?.state === 'recording') recorder.current.stop()
      stream.current?.getTracks().forEach((track) => track.stop())
      returnFocus.current?.focus()
    }
  }, [])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const take = (picked, recorded = false) => {
    setError(null)
    setFile(null)
    setPreview(null)
    setSourceDuration(0)
    setStart(0)
    setConsent(false)
    if (!picked) return
    if (!recorded && !/\.(wav|mp3|flac|m4a)$/i.test(picked.name)) { setError('Choose a wav, mp3, flac or m4a sample.'); return }
    if (picked.size > voiceLimits.bytes) { setError('Sample must be 11 MB or smaller.'); return }
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }
  const stop = () => {
    clearTimeout(timer.current)
    if (recorder.current?.state === 'recording') recorder.current.stop()
    stream.current?.getTracks().forEach((track) => track.stop())
    setRecording(false)
  }
  const record = async () => {
    setError(null)
    setRequesting(true)
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mounted.current) { mic.getTracks().forEach((track) => track.stop()); return }
      stream.current = mic
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find((type) => MediaRecorder.isTypeSupported(type))
      const rec = new MediaRecorder(mic, mimeType ? { mimeType } : undefined)
      recorder.current = rec
      const chunks = []
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
      rec.onstop = () => {
        mic.getTracks().forEach((track) => track.stop())
        if (!mounted.current) return
        const type = rec.mimeType.split(';')[0]
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm'
        take(new File(chunks, `Recording.${ext}`, { type }), true)
        recordedDuration.current = Math.min(59, (performance.now() - began) / 1000)
        setRecording(false)
      }
      const began = performance.now()
      rec.start()
      setRecording(true)
      timer.current = setTimeout(stop, 59000)
    } catch { stream.current?.getTracks().forEach((track) => track.stop()); setError('Microphone unavailable. Allow access or upload a sample.') }
    finally { if (mounted.current) setRequesting(false) }
  }
  const metadata = async () => {
    let length = audio.current.duration
    if (!Number.isFinite(length) && file) {
      const context = new AudioContext()
      try { length = (await context.decodeAudioData(await file.arrayBuffer())).duration }
      catch {}
      finally { await context.close() }
      if (!mounted.current) return
    }
    if (!Number.isFinite(length) || length < voiceLimits.minSeconds || length > 60) {
      // Some recorder containers have no duration header; the server validates their decoded length.
      if (recordedDuration.current >= voiceLimits.minSeconds && file?.name.startsWith('Recording.') && !Number.isFinite(length)) {
        const recorded = Math.floor((recordedDuration.current - 0.2) * 10) / 10
        setSourceDuration(recorded)
        setDuration(Math.min(10, recorded))
        return
      }
      setError('Use a recording between 6 and 60 seconds.')
      setSourceDuration(0)
      return
    }
    setSourceDuration(length)
    setDuration(Math.min(10, Math.floor(length * 100) / 100))
  }
  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (item) await lib.update('voices', item.id, { name, notes })
      else await lib.create('voices', { name, notes, consent, fileName: file.name, dataUrl: await readFile(file), start, duration })
      onClose()
    } catch (e) { setError(e.message) }
    finally { if (mounted.current) setBusy(false) }
  }
  const key = (e) => {
    if (e.key === 'Escape' && !busy) { e.preventDefault(); onClose() }
    if (e.key !== 'Tab') return
    const els = [...form.current.querySelectorAll('button:not(:disabled), input:not([hidden]):not(:disabled), textarea, audio')]
    const first = els[0]
    const last = els[els.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
  return (
    <div className="viewer voice-library-overlay" role="dialog" aria-modal="true" aria-label={item ? 'Edit voice' : 'Add a voice'} onKeyDown={key} onClick={() => { if (!busy) onClose() }}>
      <form ref={form} className="form-sheet glass pop voice-library-editor" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{item ? 'Edit voice' : 'Add a voice'}</h3>
        <div className="field"><label htmlFor="voice-name">Name</label><input id="voice-name" required maxLength={120} value={name} placeholder="My narrator" onChange={(e) => setName(e.target.value)} /></div>
        {!item && <>
          <p className="form-note">Use one speaker, without music or background noise. Upload up to 11 MB and 60 seconds, then keep 6 to 10 seconds of clear speech.</p>
          <div className="voice-library-upload">
            <button type="button" className="btn-soft" disabled={busy || recording || requesting} onClick={() => uploadInput.current.click()}>Upload a sample</button>
            <input ref={uploadInput} aria-label="Voice sample" type="file" accept={voiceAccept} hidden onChange={(e) => { take(e.target.files[0]); e.target.value = '' }} />
            {navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined' && <button type="button" className="btn-soft" disabled={busy || requesting} onClick={recording ? stop : record}>{recording ? 'Stop recording' : requesting ? 'Opening microphone' : 'Record a sample'}</button>}
          </div>
          {recording && <p role="status">Recording. Read a few sentences naturally, then stop. Recording stops after 59 seconds.</p>}
          {preview && <div className="voice-library-sample">
            <span>{file.name}</span>
            <audio ref={audio} src={preview} controls onLoadedMetadata={metadata} onError={() => setError('Could not preview this audio. Try another file.')} onTimeUpdate={() => { if (audio.current.currentTime >= start + duration) audio.current.pause() }} onPlay={() => { if (audio.current.currentTime < start || audio.current.currentTime >= start + duration) audio.current.currentTime = start }} />
            <div className="voice-library-trim">
              <label>Start, seconds<input aria-label="Sample start" type="number" min="0" max={Math.max(0, sourceDuration - voiceLimits.minSeconds)} step="0.1" value={start} onChange={(e) => setStart(Number(e.target.value))} /></label>
              <label>Length, seconds<input aria-label="Sample length" type="number" min={voiceLimits.minSeconds} max="10" step="0.01" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></label>
            </div>
            <p className="form-note">Saved as a mono wav. Preview plays your selected segment.</p>
          </div>}
          <label className="voice-library-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />I have the speaker's permission</label>
        </>}
        <div className="field"><label htmlFor="voice-notes">Notes</label><textarea id="voice-notes" rows={2} maxLength={2000} value={notes} placeholder="Accent, pace, mood" onChange={(e) => setNotes(e.target.value)} /></div>
        {error && <p className="voice-library-error" role="alert">{error}</p>}
        <div className="form-sheet-foot"><span className="grow" /><button type="button" className="btn-soft" disabled={busy} onClick={onClose}>Cancel</button><button className="btn-blue sm" disabled={busy || !name.trim() || (!item && (!file || !consent || recording || requesting || !sourceDuration || duration < voiceLimits.minSeconds || duration > 10 || start < 0 || start + duration > sourceDuration + 0.02))}>{busy ? 'Saving' : 'Save voice'}</button></div>
      </form>
    </div>
  )
}

export default function Voices() {
  const { voices, ready, error: loadError, refresh, remove } = useLibrary()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)
  const erase = async (item) => {
    setBusy(item.id)
    setError(null)
    try { await remove('voices', item.id); setDeleting(null) }
    catch (e) { setError(e.message) }
    finally { setBusy(null) }
  }
  return <section className="voice-library" aria-label="Saved voices">
    {(!ready || loadError) && <p role="status">{loadError || 'Loading voices'} {loadError && <button className="link-btn" onClick={refresh}>Retry</button>}</p>}
    {ready && !voices.length && <div className="empty glass"><PageArt id="audio" className="empty-art" /><p>Save a voice from a short sample, then use it in any script.</p><button className="btn-blue" onClick={() => setEditing({})}>Add a voice</button></div>}
    {!!voices.length && <>
      <div className="voice-library-toolbar"><p>{voices.length} saved {voices.length === 1 ? 'voice' : 'voices'}</p><button className="btn-blue" onClick={() => setEditing({})}>Add a voice</button></div>
      <div className="voice-library-grid">{voices.map((item) => <article className="glass voice-library-card" key={item.id}>
        <h3>{item.name}</h3><p className="muted">{Math.round(item.duration * 10) / 10} seconds{item.notes ? ` · ${item.notes}` : ''}</p>
        <audio controls preload="metadata" src={item.sample} aria-label={`Preview ${item.name}`} />
        <div className="voice-library-actions">{deleting === item.id ? <><span>Delete this voice? The sample file stays available to existing flows.</span><button className="link-btn" disabled={!!busy} onClick={() => erase(item)}>{busy === item.id ? 'Deleting' : 'Delete voice'}</button><button className="link-btn" disabled={!!busy} onClick={() => setDeleting(null)}>Keep voice</button></> : <><button className="btn-soft" onClick={() => setEditing(item)}>Rename</button><button className="link-btn" onClick={() => setDeleting(item.id)}>Delete</button></>}</div>
      </article>)}</div>
    </>}
    {error && <p className="voice-library-error" role="alert">{error}</p>}
    {editing && <VoiceEditor item={editing.id ? editing : null} onClose={() => setEditing(null)} />}
  </section>
}
