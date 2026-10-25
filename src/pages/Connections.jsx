import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { providerInfo, plannedAccounts } from '../lib/catalog.js'
import { getConnections, saveConnection, testConnection } from '../lib/providers.js'
import { useApp } from '../lib/appContext.js'
import { refreshPod } from '../lib/usePod.js'
import { setSpendCap, useSpend } from '../lib/spendCap.js'
import { money } from '../lib/cost.js'

function Provider({ id, info, state, onSaved }) {
  const [values, setValues] = useState({})
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setMsg(null)
    const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim()))
    try {
      if (Object.keys(clean).length) await saveConnection(id, clean)
    } catch (e) {
      setMsg(e.message)
      setSaving(false)
      return
    }
    const test = await testConnection(id).catch(() => ({ ok: false }))
    setMsg(test.ok ? 'Connected' : test.error ? `Saved, but the test failed. ${test.error}` : 'Saved, but the test call failed. Check the key.')
    setValues({})
    setSaving(false)
    onSaved()
  }

  return (
    <div className="conn glass">
      <div className="conn-top">
        <h3>{info.name}</h3>
        <span className={`status${state?.connected ? ' ok' : ''}`}>{state?.connected ? info.on || 'Connected' : info.off || 'Not connected'}</span>
      </div>
      <p>{info.blurb}</p>
      {info.page && <Link className="link-btn" to={info.page.to}>{info.page.label}</Link>}
      {info.fields.map((f) => (
        <div className="field" key={f.id}>
          <label htmlFor={`${id}-${f.id}`}>{f.label}</label>
          <input
            id={`${id}-${f.id}`}
            type={f.secret ? 'password' : 'text'}
            value={values[f.id] || ''}
            onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
            placeholder={(f.secret ? state?.key : state?.[f.id]) || f.placeholder}
            autoComplete="off"
          />
        </div>
      ))}
      <div className="conn-actions">
        <button className="btn-blue" onClick={save} disabled={saving}>{saving ? 'Checking' : 'Save and test'}</button>
        {msg && <span className="muted conn-msg" role="status">{msg}</span>}
        {info.link && <a href={info.link} target="_blank" rel="noreferrer">{info.linkLabel || 'Get a key'} ›</a>}
      </div>
    </div>
  )
}

// Not a key: the optional spend cap for this session, kept in this browser.
function SpendCap() {
  const { cap, spent } = useSpend()
  const [value, setValue] = useState('')
  const [msg, setMsg] = useState(null)
  const save = () => {
    const n = parseFloat(value)
    if (!(n > 0)) return setMsg('The cap is a dollar amount above 0.')
    setSpendCap(n)
    setValue('')
    setMsg('Saved')
  }
  const off = () => { setSpendCap(0); setMsg('Cap removed') }

  return (
    <div className="conn glass spend-cap">
      <div className="conn-top">
        <h3>Spend cap</h3>
        <span className={`status${cap ? ' ok' : ''}`}>{cap ? `${money(cap)} per session` : 'Off'}</span>
      </div>
      <p>Optional. A run that would take this session past the cap asks first. It counts the estimate of each run you start in this tab, on Comfy Cloud, Comfy Router and every provider with a price.</p>
      <div className="field">
        <label htmlFor="spend-cap">Cap in US dollars</label>
        <input id="spend-cap" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()} placeholder={cap ? String(cap) : 'For example 5'} autoComplete="off" />
      </div>
      <div className="conn-actions">
        <button className="btn-blue" onClick={save} disabled={!value.trim()}>Save cap</button>
        {cap && <button type="button" className="link-btn" onClick={off}>Remove</button>}
        <span className="muted">{msg || (spent > 0 ? `This session: about ${money(spent)}` : 'Nothing spent this session')}</span>
      </div>
    </div>
  )
}

export default function Connections() {
  const { refreshConnections } = useApp()
  const [state, setState] = useState({})
  const refresh = () => getConnections().then((next) => { setState(next); refreshConnections(); refreshPod() })
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
        <SpendCap />
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
