import { useEffect, useState } from 'react'
import { providerInfo, plannedAccounts } from '../lib/catalog.js'
import { getConnections, saveConnection, testConnection } from '../lib/providers.js'
import { useApp } from '../lib/appContext.js'

function Provider({ id, info, state, onSaved }) {
  const [values, setValues] = useState({})
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setMsg(null)
    const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim()))
    if (Object.keys(clean).length) await saveConnection(id, clean)
    const ok = await testConnection(id).catch(() => false)
    setMsg(ok ? 'Connected' : 'Saved, but the test call failed. Check the key.')
    setValues({})
    setSaving(false)
    onSaved()
  }

  return (
    <div className="conn glass">
      <div className="conn-top">
        <h3>{info.name}</h3>
        <span className={`status${state?.connected ? ' ok' : ''}`}>{state?.connected ? 'Connected' : 'Not connected'}</span>
      </div>
      <p>{info.blurb}</p>
      {info.fields.filter((f) => !(id === 'comfy' && f.id === 'url' && (values.mode || state?.mode) === 'cloud')).map((f) => (
        <div className="field" key={f.id}>
          <label htmlFor={`${id}-${f.id}`}>{f.label}</label>
          {f.options ? <select className="sb-select" id={`${id}-${f.id}`} value={values[f.id] || state?.[f.id] || 'local'} onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select> : <input
            id={`${id}-${f.id}`}
            type={f.secret ? 'password' : 'text'}
            value={values[f.id] || ''}
            onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
            placeholder={(f.secret ? state?.key : state?.[f.id]) || f.placeholder}
            autoComplete="off"
          />}
        </div>
      ))}
      <div className="conn-actions">
        <button className="btn-blue" onClick={save} disabled={saving}>{saving ? 'Checking' : 'Save and test'}</button>
        {msg && <span className="muted">{msg}</span>}
        <a href={info.link} target="_blank" rel="noreferrer">Get a key ›</a>
      </div>
    </div>
  )
}

export default function Connections() {
  const { refreshConnections } = useApp()
  const [state, setState] = useState({})
  const refresh = () => getConnections().then((next) => { setState(next); refreshConnections() })
  useEffect(() => { refresh() }, [])

  return (
    <main className="page">
      <div className="page-head">
        <h1>Connections</h1>
        <p>Bring your own keys. They are saved to <code>.comfyfield/keys.json</code> on this machine and never reach the browser.</p>
      </div>
      <div className="conn-grid">
        {Object.entries(providerInfo).filter(([, i]) => !i.soon).map(([id, info]) => (
          <Provider key={id} id={id} info={info} state={state[id]} onSaved={refresh} />
        ))}
      </div>
      <div className="note glass">
        <strong>Coming next: account sign-in</strong>
        <ul className="planned">
          {plannedAccounts.map((a) => <li key={a.name}><strong>{a.name}</strong> · {a.how}</li>)}
        </ul>
      </div>
    </main>
  )
}
