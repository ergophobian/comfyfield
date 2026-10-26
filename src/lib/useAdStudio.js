import { useRef, useState } from 'react'
import { useApp } from './appContext.js'
import { usePod, runTypeOf } from './usePod.js'
import { adFormat, adValues, conceptText, approveAd } from './adStudio.js'

export function useAdStudio(id) {
  const { gens } = useApp()
  const { status } = usePod()
  const runType = runTypeOf(status) === 'session' ? 'Session' : 'Instant'
  const [session, setSession] = useState(null)
  const [script, setScript] = useState('')
  const [snapshot, setSnapshot] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [rendered, setRendered] = useState(false)
  const [rights, setRights] = useState(false)
  const locked = useRef(false)
  const act = async (work) => {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    try { return await work() } catch (e) { setError(e.message) }
    finally { locked.current = false; setBusy(false) }
  }
  const readPage = (url, apply) => act(async () => {
    const res = await fetch('/api/ads/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Could not read that page.')
    apply(data)
    setRights(false)
    setSession(null)
    setScript('')
    if (data.warnings?.length) setError(data.warnings.join(' '))
  })
  const draft = (config) => act(async () => {
    setSession(null)
    setScript('')
    setRendered(false)
    setRights(false)
    if (config.voiceover?.uploading) throw new Error('Wait for the voiceover upload to finish.')
    const values = adValues(config)
    const format = adFormat({ id, ...config })
    const next = await gens.generateFormat(format, values)
    next.format = format
    setSession(next)
    setScript(conceptText(next))
    setSnapshot(JSON.stringify(config))
  })
  const mixVoiceover = async (config) => {
    if (!config.voiceover?.url || config.kind !== 'video') return
    session.mixed ||= new Set()
    for (const file of session.results()) {
      if (session.mixed.has(file.url)) continue
      const res = await fetch('/api/stitch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clips: [{ url: file.url }], aspect: config.aspects[0], narration: { url: config.voiceover.url, volume: 1 } }) })
      const item = await res.json()
      if (!res.ok) throw new Error(item.error || 'Could not add the voiceover. The original ad is in the Library.')
      gens.add([{ ...item, formatId: id, caption: 'Ad with voiceover' }])
      session.mixed.add(file.url)
    }
  }
  const canRender = (config) => {
    if (!rights) throw new Error('Confirm you own or have permission to use these assets before rendering.')
    if (JSON.stringify(config) !== snapshot) throw new Error('Your inputs changed. Draft concepts again before approving.')
    if (!session) throw new Error('Draft concepts first.')
  }
  const approve = (config) => act(async () => {
    canRender(config)
    if (rendered) return
    try { await approveAd(session, script) }
    finally { if (session.approved) setRendered(true) }
    await mixVoiceover(config)
  })
  const retry = (item, config) => act(async () => {
    canRender(config)
    if (!session.approved || item.formatRunId !== session.formatRunId) throw new Error('Retry from the original reviewed batch.')
    // Clear failed Library placeholders only; successful renders stay in both the engine and Library.
    for (const failed of gens.items.filter((f) => f.failed && f.formatRunId === item.formatRunId && f.stepId === item.stepId)) gens.dismiss(failed.id)
    await session.retry(item.stepId)
    await mixVoiceover(config)
  })
  return { id, gens, runType, rights, setRights, retry, session, script, setScript, busy, error, rendered, draft, approve, readPage,
    current: (config) => JSON.stringify(config) === snapshot,
    items: gens.items.filter((item) => item.formatId === id) }
}
