import { useState } from 'react'
import { Link } from 'react-router-dom'
import { providerInfo } from '../../lib/catalog.js'
import { saveConnection, testConnection } from '../../lib/providers.js'
import { useApp } from '../../lib/appContext.js'
import { refreshPod } from '../../lib/usePod.js'

// First visit with no keys: one place on Create to paste a Comfy key, without leaving the page.
// Not a <form>, so it can sit inside a composer form.
export default function ConnectComfy() {
  const { refreshConnections } = useApp()
  const [key, setKey] = useState('')
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)

  const connect = async () => {
    if (!key.trim() || saving) return
    setSaving(true)
    setMsg(null)
    try {
      await saveConnection('comfy', { key: key.trim() })
    } catch (e) {
      setMsg(e.message)
      setSaving(false)
      return
    }
    const ok = await testConnection('comfy').catch(() => false)
    setSaving(false)
    setKey('')
    if (!ok) setMsg('Saved, but the test call failed. Check the key in Connections.')
    refreshConnections()
    refreshPod()
  }

  return (
    <section className="connect-comfy glass rise" aria-label="Connect Comfy">
      <h2>Connect Comfy to start creating</h2>
      <p>One Comfy key runs FLUX, LTX and the other open models on Comfy Cloud, and partner models through Comfy Router.</p>
      <div className="connect-comfy-row">
        <input type="password" aria-label="Comfy API key" placeholder="Paste your Comfy API key" autoComplete="off" value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); connect() } }} />
        <button type="button" className="btn-blue" disabled={!key.trim() || saving} onClick={connect}>{saving ? 'Checking' : 'Connect'}</button>
      </div>
      <p className="connect-comfy-links">
        <a href={providerInfo.comfy.link} target="_blank" rel="noreferrer">{providerInfo.comfy.linkLabel} ›</a>
        <Link to="/connections">Other providers</Link>
      </p>
      {msg && <p className="connect-comfy-msg" role="alert">{msg}</p>}
    </section>
  )
}
