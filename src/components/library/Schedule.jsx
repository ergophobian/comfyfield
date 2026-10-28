import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { postizApi } from '../../lib/postiz.js'

export default function Schedule({ item, queueItem, onClose, onSaved }) {
  const [channels, setChannels] = useState([])
  const [channel, setChannel] = useState(queueItem?.channel || '')
  const [caption, setCaption] = useState(item.caption || queueItem?.idea || '')
  const [date, setDate] = useState('')
  const [settings, setSettings] = useState('{}')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const requestKey = useRef(crypto.randomUUID())
  useEffect(() => { postizApi('/api/postiz/channels').then(setChannels, (e) => setMessage(e.message)) }, [])
  useEffect(() => {
    const key = (e) => { if (e.key === 'Escape' && !busy) onClose() }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [busy, onClose])
  const save = async (draft) => {
    let extra
    try { extra = JSON.parse(settings) } catch { return setMessage('Enter valid channel settings.') }
    if (!draft && (!date || !Number.isFinite(new Date(date).getTime()))) return setMessage('Choose a schedule date.')
    setBusy(true)
    setMessage('')
    try {
      const when = date ? new Date(date).toISOString() : undefined
      const result = await postizApi('/api/postiz/schedule', 'POST', { media: [item.url], caption, channels: [channel], date: when, draft, requestKey: requestKey.current, settings: { [channel]: extra } })
      setSent(true)
      setMessage(draft ? 'Draft saved in Postiz.' : 'Post scheduled in Postiz.')
      if (queueItem && !draft) {
        try {
          await postizApi(`/api/queue/${queueItem.id}`, 'PATCH', { status: 'scheduled', postizId: result.result?.[0]?.postId, when })
          onSaved?.()
        } catch { setMessage('Post scheduled. Queue update failed; update its status manually.') }
      }
    } catch (e) { setMessage(e.message) } finally { setBusy(false) }
  }
  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label="Schedule post" onClick={() => { if (!busy) onClose() }}>
      <div className="form-sheet glass pop postiz-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Schedule post</h3>
        <p className="muted">Choose a connected Postiz channel. <Link to="/connections">Connections</Link></p>
        <div className="field"><label htmlFor="schedule-channel">Channel</label><select autoFocus id="schedule-channel" value={channel} disabled={busy || sent} onChange={(e) => setChannel(e.target.value)}><option value="">Choose a channel</option>{channels.filter((c) => !c.disabled).map((c) => <option key={c.id} value={c.id}>{c.name} · {c.identifier}</option>)}</select></div>
        <div className="field"><label htmlFor="schedule-caption">Caption</label><textarea id="schedule-caption" value={caption} disabled={busy || sent} onChange={(e) => setCaption(e.target.value)} /></div>
        <div className="field"><label htmlFor="schedule-date">Date and time (your timezone)</label><input id="schedule-date" type="datetime-local" value={date} disabled={busy || sent} onChange={(e) => setDate(e.target.value)} /></div>
        <details><summary>Channel settings</summary><p className="muted">Some channels require extra settings, such as a YouTube title. <a href="https://docs.postiz.com/public-api/posts/create" target="_blank" rel="noreferrer">Settings reference</a></p><div className="field"><label htmlFor="schedule-settings">Settings object</label><textarea id="schedule-settings" value={settings} disabled={busy || sent} onChange={(e) => setSettings(e.target.value)} /></div></details>
        {message && <p role="status">{message}</p>}
        <div className="postiz-actions"><button className="btn-soft" disabled={busy} onClick={onClose}>Close</button><button className="btn-soft" disabled={busy || sent || !channel} onClick={() => save(true)}>Save as draft</button><button className="btn-blue" disabled={busy || sent || !channel || !date} onClick={() => save(false)}>{busy ? 'Saving' : 'Schedule'}</button></div>
      </div>
    </div>
  )
}
