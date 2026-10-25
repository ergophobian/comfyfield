import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkspaceAvatar } from './nav/WorkspaceSwitcher.jsx'
import { compactCount } from '../../shared/workspaces.js'
import { connectYoutube, disconnectYoutube } from '../lib/workspaces.js'
import { useApp } from '../lib/appContext.js'

const day = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '')

// The active workspace at the top of its page: its channel when one is connected, else a field to connect one.
export default function WorkspaceHeader({ ws }) {
  const { connections } = useApp() || {}
  const [channel, setChannel] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const yt = ws.youtube
  const keyed = Boolean(connections?.youtube?.connected)

  const connect = async (e) => {
    e?.preventDefault()
    setBusy(true); setErr('')
    try { await connectYoutube(ws.id, e ? channel : undefined); setChannel('') } catch (e2) { setErr(e2.message) }
    setBusy(false)
  }

  return (
    <section className="ws-head glass rise" aria-label={`${ws.name} workspace`}>
      {yt?.banner && <div className="ws-banner"><img src={yt.banner} alt="" /></div>}
      <div className="ws-head-main">
        {yt?.avatar ? <span className="ws-avatar lg ws-channel-avatar" aria-hidden="true"><img src={yt.avatar} alt="" /></span> : <WorkspaceAvatar ws={ws} size="lg" />}
        <div className="ws-head-text">
          <h2>{yt?.title || ws.name}</h2>
          {yt ? (
            <p>
              <a href={`https://www.youtube.com/${yt.handle?.startsWith('@') ? yt.handle : `channel/${yt.id}`}`} target="_blank" rel="noreferrer">{yt.handle || 'YouTube channel'}</a>
              {' · '}{yt.subscribers == null ? 'Subscribers hidden' : `${compactCount(yt.subscribers)} subscribers`}
              {yt.videos ? ` · ${compactCount(yt.videos)} videos` : ''}
            </p>
          ) : <p>{ws.description || 'Connect a YouTube channel to see it here.'}</p>}
        </div>
        {yt && (
          <div className="ws-head-acts">
            <button type="button" className="btn-soft sm" disabled={busy} onClick={() => connect()}>{busy ? 'Updating' : 'Refresh'}</button>
            <button type="button" className="btn-soft sm" disabled={busy} onClick={() => disconnectYoutube(ws.id).catch((e2) => setErr(e2.message))}>Disconnect</button>
          </div>
        )}
      </div>
      {yt ? (
        <>
          {yt.uploads?.length > 0 ? (
            <ul className="ws-uploads">
              {yt.uploads.slice(0, 6).map((v) => (
                <li key={v.id}>
                  <a href={v.url} target="_blank" rel="noreferrer">
                    <span className="ws-thumb">{v.thumb && <img src={v.thumb} alt="" loading="lazy" />}</span>
                    <strong>{v.title}</strong>
                    <small>{day(v.published)}</small>
                  </a>
                </li>
              ))}
            </ul>
          ) : <p className="muted ws-head-note">No public uploads yet.</p>}
          <small className="muted ws-head-note">Saved on this machine {new Date(yt.fetched).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}. Refresh to update.</small>
        </>
      ) : (
        <form className="ws-connect" onSubmit={connect}>
          <input value={channel} placeholder="youtube.com/@yourchannel or @handle" aria-label="YouTube channel link or handle" onChange={(e) => setChannel(e.target.value)} />
          <button className="btn-blue sm" disabled={busy || !channel.trim() || !keyed}>{busy ? 'Connecting' : 'Connect channel'}</button>
          {!keyed && <small className="ws-head-note">Add a YouTube Data API key in <Link to="/connections">Connections</Link> first.</small>}
        </form>
      )}
      {err && <p className="plist-note">{err}</p>}
    </section>
  )
}
