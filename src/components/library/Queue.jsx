import { useEffect, useState } from 'react'
import { postizApi } from '../../lib/postiz.js'
import Schedule from './Schedule.jsx'

export default function Queue() {
  const [items, setItems] = useState([])
  const [channels, setChannels] = useState([])
  const [channel, setChannel] = useState('')
  const [idea, setIdea] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [schedule, setSchedule] = useState(null)
  const refresh = () => postizApi('/api/queue').then(setItems)
  useEffect(() => {
    refresh().catch((e) => setMessage(e.message))
    postizApi('/api/postiz/channels').then(setChannels, (e) => setMessage(e.message))
  }, [])
  const act = async (fn) => {
    setBusy(true)
    setMessage('')
    try { await fn(); await refresh() } catch (e) { setMessage(e.message) } finally { setBusy(false) }
  }
  return (
    <section className="postiz-queue">
      <form className="form-sheet glass" onSubmit={(e) => { e.preventDefault(); act(async () => { await postizApi('/api/queue', 'POST', { channel, idea }); setIdea('') }) }}>
        <h3>Next ideas</h3>
        <div className="field"><label htmlFor="queue-channel">Channel</label><select id="queue-channel" value={channel} onChange={(e) => setChannel(e.target.value)}><option value="">All channels</option>{channels.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.identifier}</option>)}{[...new Set(items.map((i) => i.channel))].filter((id) => !channels.some((c) => c.id === id)).map((id) => <option key={id}>{id}</option>)}</select></div>
        <div className="field"><label htmlFor="queue-idea">Idea</label><textarea id="queue-idea" value={idea} onChange={(e) => setIdea(e.target.value)} /></div>
        <button className="btn-blue" disabled={busy || !channel || !idea.trim()}>Add idea</button>
      </form>
      {message && <p role="status">{message}</p>}
      {!items.length && <p className="muted">No ideas queued yet.</p>}
      {items.filter((i) => !channel || i.channel === channel).map((i) => <article className="form-sheet glass" key={i.id}>
        <p>{i.idea}</p><p className="muted">{channels.find((c) => c.id === i.channel)?.name || i.channel}{i.when ? ` · ${new Date(i.when).toLocaleString()}` : ''}</p>
        <div className="field"><label htmlFor={`status-${i.id}`}>Status</label><select id={`status-${i.id}`} disabled={busy} value={i.status} onChange={(e) => act(() => postizApi(`/api/queue/${i.id}`, 'PATCH', { status: e.target.value }))}>{['idea', 'made', 'scheduled'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
        <div className="field"><label htmlFor={`media-${i.id}`}>Library media URL</label><input id={`media-${i.id}`} defaultValue={i.libraryItem || ''} placeholder="/media/finished.mp4" onBlur={(e) => { if (e.target.value !== (i.libraryItem || '')) act(() => postizApi(`/api/queue/${i.id}`, 'PATCH', { libraryItem: e.target.value })) }} /></div>
        <div className="postiz-actions"><button className="btn-soft" disabled={busy || !i.libraryItem || i.status === 'scheduled'} onClick={() => setSchedule(i)}>Schedule</button><button className="btn-soft" disabled={busy} onClick={() => act(() => postizApi(`/api/queue/${i.id}`, 'DELETE'))}>Remove</button></div>
      </article>)}
      {schedule && <Schedule item={{ url: schedule.libraryItem }} queueItem={schedule} onClose={() => setSchedule(null)} onSaved={refresh} />}
    </section>
  )
}
