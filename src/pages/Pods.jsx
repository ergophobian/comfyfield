import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getConnections, saveConnection } from '../lib/providers.js'
import { downloading, money, podAction, podLabel, podOptions, refreshPod, spendText, usePod } from '../lib/usePod.js'

const CLOUD = { SECURE: 'Secure', COMMUNITY: 'Community' }
const gpuKey = (r) => `${r.gpuTypeId}|${r.cloudType}`
const price = (r) => (r?.usdPerHr != null ? `${money(r.usdPerHr)} an hour` : 'Price set at start')
const stock = (r) => (r.inStock === false ? 'None free now' : r.inStock ? 'Free now' : null)
const pct = (d) => (d.total ? Math.min(100, (d.bytes / d.total) * 100) : 0)
// A size names its first models, then how many more.
const shortList = (names) => (names.length > 3 ? `${names.slice(0, 3).join(', ')} and ${names.length - 3} more` : names.join(', '))

// Pods: what your Pod is doing, a start by size or by a GPU you pick, and the Pod settings.
// The RunPod key stays in Connections.
export default function Pods() {
  const { status: s } = usePod()
  const [opts, setOpts] = useState(null)
  const [rp, setRp] = useState(null)
  const [size, setSize] = useState(null)
  const [advanced, setAdvanced] = useState(false)
  const [gpu, setGpu] = useState(null)
  const [disk, setDisk] = useState(null)
  const [install, setInstall] = useState(false)
  const [cap, setCap] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [, setNow] = useState(0)

  const loadSettings = () => getConnections().then((c) => setRp(c.runpod || null))
  useEffect(() => {
    podOptions().then((o) => {
      setOpts(o)
      setSize((v) => v ?? o.tiers[0]?.vramGb ?? null)
      setDisk((v) => v ?? o.volumes[0])
    }, (e) => setErr({ message: e.message }))
    loadSettings()
    refreshPod()
    // Minutes keep counting between polls.
    const t = setInterval(() => setNow((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const p = s?.phase || 'none'
  const picked = gpu && opts?.rungs.find((r) => gpuKey(r) === gpu)
  const vram = picked ? picked.vramGb : size
  const fv = opts?.runtimes.find((r) => r.id === 'freevideo')
  const canInstall = Boolean(fv && vram >= fv.vramGb)
  const installs = canInstall && install
  const diskGb = Math.max(disk || 0, installs ? fv.diskGb : 0)
  const noKey = s && !s.connected
  const capped = s && s.spend?.today >= s.spend?.cap

  const act = async (action, body) => {
    setBusy(true)
    setErr(null)
    try { await podAction(action, body) } catch (e) { setErr({ message: e.message, code: e.code }) } finally { setBusy(false) }
  }
  const start = () => act('start', {
    ...(picked ? { gpu: { gpuTypeId: picked.gpuTypeId, cloudType: picked.cloudType } } : { minVramGb: size }),
    volumeGb: disk, runtimes: installs ? [fv.id] : [],
  })
  const setting = async (values) => {
    setErr(null)
    try {
      await saveConnection('runpod', values)
      await loadSettings()
      refreshPod()
      return true
    } catch (e) {
      setErr({ message: e.message })
      return false
    }
  }

  return (
    <main className="page pods">
      <div className="page-head">
        <h1>Pods</h1>
        <p>A Pod is a GPU on RunPod that runs ComfyUI for you, billed by the minute until it terminates. Comfy Cloud covers a couple of runs; a Pod suits a long session.</p>
      </div>
      <div className="pods-grid">
        <section className="conn glass" aria-labelledby="pods-main">
          {p === 'none'
            ? <StartPod {...{ opts, size, setSize, gpu, setGpu, picked, vram, advanced, setAdvanced, disk, setDisk, fv, canInstall, installs, setInstall, diskGb, s, noKey, capped, busy, start }} />
            : <YourPod s={s} busy={busy} act={act} />}
          {err && <p className="sheet-error" role="alert">{err.message}</p>}
        </section>
        <section className="conn glass" aria-labelledby="pods-settings">
          <div className="conn-top"><h3 id="pods-settings">Settings</h3></div>
          <div className="field">
            <label id="pods-auto">Start Pods automatically</label>
            <button type="button" className={`switch${rp?.auto ? ' on' : ''}`} aria-pressed={Boolean(rp?.auto)} aria-labelledby="pods-auto" disabled={!rp}
              onClick={() => setting({ auto: rp?.auto ? 'off' : 'on' })}>
              <i />Generate starts a Pod sized for the service when one is needed.
            </button>
          </div>
          <div className="field">
            <label id="pods-idle">Idle shutdown</label>
            <div className="pills" role="group" aria-labelledby="pods-idle">
              {(opts?.idleChoices || []).map((n) => (
                <button type="button" key={n} className={rp?.idle === n ? 'on' : ''} aria-pressed={rp?.idle === n} onClick={() => setting({ idle: String(n) })}>{n} min</button>
              ))}
            </div>
            <p className="pod-note">A Pod with no runs, downloads or installs terminates after this long. It applies to Pods you start after a change.</p>
          </div>
          <div className="field">
            <label htmlFor="pods-cap">Daily cap in dollars</label>
            <div className="pods-cap">
              <input id="pods-cap" inputMode="decimal" value={cap} placeholder={rp?.cap != null ? String(rp.cap) : '20'} onChange={(e) => setCap(e.target.value)} />
              <button type="button" className="btn-soft sm" disabled={!cap.trim()} onClick={async () => { if (await setting({ cap })) setCap('') }}>Save</button>
            </div>
            <p className="pod-note">When today's Pod spend reaches it, no new Pod starts. A running Pod is not touched.</p>
          </div>
          <p className="pod-note">Your RunPod key is in <Link to="/connections">Connections</Link>.</p>
        </section>
      </div>
    </main>
  )
}

function StartPod({ opts, size, setSize, gpu, setGpu, picked, vram, advanced, setAdvanced, disk, setDisk, fv, canInstall, installs, setInstall, diskGb, s, noKey, capped, busy, start }) {
  return (
    <>
      <div className="conn-top">
        <h3 id="pods-main">Start a Pod</h3>
        <span className="status">Off</span>
      </div>
      <p>Pick a size. ComfyField starts the cheapest free GPU of that size, and a bigger size also runs everything a smaller one runs.</p>
      {!opts && <p className="pod-note">Checking prices</p>}
      {opts && (
        <div className="opt-grid pods-sizes" role="group" aria-label="Size">
          {opts.tiers.map((t) => (
            <button type="button" key={t.vramGb} className={`opt${!picked && size === t.vramGb ? ' on' : ''}`} aria-pressed={!picked && size === t.vramGb}
              onClick={() => { setSize(t.vramGb); setGpu(null) }}>
              <strong>{t.label} · {t.vramGb} GB</strong>
              <small>{t.rung?.name} · {price(t.rung)}</small>
              {t.models.length > 0 && <small>For {shortList(t.models)}</small>}
            </button>
          ))}
        </div>
      )}
      <button type="button" className="link-btn pods-more" aria-expanded={advanced} aria-controls="pods-advanced" onClick={() => setAdvanced((a) => !a)}>
        {advanced ? 'Hide advanced options' : 'Advanced options'}
      </button>
      {advanced && opts && (
        <div id="pods-advanced" className="pods-adv">
          <div className="field">
            <label id="pods-gpu">GPU</label>
            <p className="pod-note">Pick one to start exactly that GPU. ComfyField tries no other.</p>
            <div className="opt-grid pods-gpus" role="group" aria-labelledby="pods-gpu">
              {opts.rungs.map((r) => (
                <button type="button" key={gpuKey(r)} className={`opt${gpu === gpuKey(r) ? ' on' : ''}`} aria-pressed={gpu === gpuKey(r)} disabled={r.inStock === false}
                  onClick={() => setGpu((g) => (g === gpuKey(r) ? null : gpuKey(r)))}>
                  <strong>{r.name}</strong>
                  <small>{r.vramGb} GB · {CLOUD[r.cloudType] || r.cloudType}</small>
                  <small>{price(r)}{stock(r) ? ` · ${stock(r)}` : ''}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label id="pods-disk">Disk</label>
            <div className="pills" role="group" aria-labelledby="pods-disk">
              {opts.volumes.map((v) => <button type="button" key={v} className={disk === v ? 'on' : ''} aria-pressed={disk === v} onClick={() => setDisk(v)}>{v} GB</button>)}
            </div>
            {diskGb > disk && <p className="pod-note">{fv.name} needs room, so this Pod gets {diskGb} GB.</p>}
            <p className="pod-note">Models stay on the disk while the Pod is paused, at {money((diskGb * opts.diskUsdPerGbMonth * 12) / 365)} a day. A terminated Pod costs nothing.</p>
          </div>
          {fv && (
            <div className="field">
              <label id="pods-install">Install at start</label>
              <button type="button" className={`switch${installs ? ' on' : ''}`} aria-pressed={installs} aria-labelledby="pods-install" disabled={!canInstall} onClick={() => setInstall((v) => !v)}>
                <i />{fv.name} for MiniMax H3: about {fv.gb} GB, {fv.minutes[0]} to {fv.minutes[1]} minutes the first time
              </button>
              {!canInstall && <p className="pod-note">Needs a {fv.vramGb} GB GPU.</p>}
            </div>
          )}
        </div>
      )}
      <dl className="pod-facts">
        <div><dt>Starts</dt><dd>{picked ? `${picked.name} · ${CLOUD[picked.cloudType] || picked.cloudType}` : vram ? `The cheapest free ${vram} GB GPU` : 'Pick a size'}</dd></div>
        <div><dt>Disk</dt><dd>{diskGb} GB</dd></div>
        <div><dt>Ready in</dt><dd>Usually 5 to 8 minutes{installs ? `, then ${fv.name} installs` : ''}</dd></div>
        <div><dt>Spent</dt><dd>{spendText(s)}</dd></div>
      </dl>
      {s?.sandbox && <p className="pod-note">Sandbox mode: no real Pod and no charges.</p>}
      {noKey && <p className="sheet-error">Add your RunPod key in <Link to="/connections">Connections</Link> to start a Pod.</p>}
      {capped && <p className="sheet-error">Daily cap reached: {spendText(s)}. Raise it under Settings.</p>}
      <div className="conn-actions">
        <button type="button" className="btn-blue" disabled={busy || !opts || noKey || capped || !vram} onClick={start}>{busy ? 'Starting' : 'Start a Pod'}</button>
      </div>
    </>
  )
}

function YourPod({ s, busy, act }) {
  const p = s.phase
  const up = s.pod ? Math.max(0, Math.floor((Date.now() - s.pod.startedAt) / 60000)) : 0
  const going = Math.max(s.runs || 0, s.queue || 0)
  const ending = ['pausing', 'terminating'].includes(p)
  return (
    <>
      <div className="conn-top">
        <h3 id="pods-main">Your Pod</h3>
        <span className={`status${p === 'ready' ? ' ok' : ''}`}>{podLabel(s)}</span>
      </div>
      {s.pod && (
        <dl className="pod-facts">
          <div><dt>GPU</dt><dd>{s.pod.gpu}{s.pod.vramGb ? ` · ${s.pod.vramGb} GB` : ''}{s.pod.cloudType ? ` · ${CLOUD[s.pod.cloudType] || s.pod.cloudType}` : ''}</dd></div>
          {p === 'paused'
            ? <div><dt>Disk while paused</dt><dd>{money(s.pod.pausedDiskPerDay)} a day</dd></div>
            : <div><dt>Rate</dt><dd>{money(s.pod.costPerHr)} an hour</dd></div>}
          {p !== 'paused' && <div><dt>Up for</dt><dd>{up} min</dd></div>}
          <div><dt>Disk</dt><dd>{s.pod.volumeGb} GB</dd></div>
          <div><dt>Idle shutdown</dt><dd>After {s.pod.idleMin} min</dd></div>
          <div><dt>Spent</dt><dd>{spendText(s)}</dd></div>
        </dl>
      )}
      {downloading(s).map((d) => (
        <div className="pod-dl" key={`${d.dir}/${d.file}`}>
          <span><em title={d.file}>{d.file}</em><b>{Math.round(pct(d))}%</b></span>
          <i style={{ '--p': `${pct(d)}%` }} />
        </div>
      ))}
      {(s.runtimes || []).filter((e) => e.state !== 'ready').map((e) => (
        <p className={e.state === 'failed' ? 'sheet-error' : 'pod-note'} key={e.runtime}>{e.state === 'failed'
          ? `${e.name} could not install: ${e.error || 'unknown error'}`
          : `Installing ${e.name} · ${Math.floor((e.sec || 0) / 60)} min.${e.minutes ? ` The first install takes ${e.minutes[0]} to ${e.minutes[1]} minutes.` : ''}`}</p>
      ))}
      {p === 'ready' && <p className="pod-note">ComfyUI runs use this Pod.</p>}
      {going > 0 && ['ready', 'starting'].includes(p) && <p className="pod-note">{going} {going === 1 ? 'run is' : 'runs are'} going. Pause and Terminate wait for {going === 1 ? 'it' : 'them'} to finish.</p>}
      {s.event && <p className="pod-note">{s.event.text}</p>}
      {s.sandbox && <p className="pod-note">Sandbox mode: no real Pod and no charges.</p>}
      <div className="pod-acts">
        {p === 'paused' && <button type="button" className="btn-blue sm" disabled={busy} onClick={() => act('resume')}>Resume</button>}
        {p === 'ending' && <button type="button" className="btn-blue sm" disabled={busy} onClick={() => act('keep')}>Keep the Pod</button>}
        {p === 'ready' && <button type="button" className="btn-soft sm" disabled={busy} onClick={() => act('pause')}>Pause</button>}
        {!ending && p !== 'resuming' && <button type="button" className="btn-soft sm danger" disabled={busy} onClick={() => act('terminate')}>Terminate</button>}
      </div>
    </>
  )
}
