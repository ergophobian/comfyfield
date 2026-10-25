import { useState } from 'react'
import { planUpscale, targets, upscalers } from '../../lib/upscale.js'

const KEY = 'comfyfield.upscale'
const load = () => {
  try { return { on: false, target: null, upscaler: upscalers[0].id, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return { on: false, target: null, upscaler: upscalers[0].id } }
}

// The switch, the target and the upscaler stay as the person left them. The source belongs to one
// model, so it lives with the page.
export function useUpscalePrefs() {
  const [prefs, setPrefs] = useState(load)
  const update = (patch) => setPrefs((p) => {
    const next = { ...p, ...patch }
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
    return next
  })
  return [prefs, update]
}

function Choices({ label, value, autoLabel, options, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="pills" role="group" aria-label={label}>
        <button type="button" className={value == null ? 'on' : ''} aria-pressed={value == null} title={`Auto picks ${autoLabel}`} onClick={() => onChange(null)}>Auto</button>
        {options.map((o) => (
          <button key={o.id} type="button" className={o.id === value ? 'on' : ''} aria-pressed={o.id === value} disabled={o.disabled}
            title={o.note} onClick={() => onChange(o.id)}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}

// Upscale for Create video. On, it picks the source and target itself; Advanced lets the person pick them.
export default function AutoUpscale({ prefs, setPrefs, sources, source, setSource }) {
  const [advanced, setAdvanced] = useState(false)
  const plan = planUpscale(sources, { source, target: prefs.target })
  const autoSource = planUpscale(sources, { target: prefs.target }).source
  const autoTarget = planUpscale(sources, { source }).target
  const upscaler = upscalers.find((u) => u.id === prefs.upscaler) || upscalers[0]
  const floor = plan.source?.short ?? 0

  return (
    <>
      <button type="button" className={`switch gen-switch${prefs.on ? ' on' : ''}`} aria-pressed={prefs.on} onClick={() => setPrefs({ on: !prefs.on })}
        title="Make the clip at a lower resolution, then upscale it">
        Upscale<i />
      </button>
      {prefs.on && (
        <div className="gen-scene gen-upscale pop">
          <p className="gen-hint">
            {plan.source ? `Makes ${plan.source.label}, then ${upscaler.name} upscales it to ${plan.target.label}` : `${upscaler.name} upscales the clip to ${plan.target.label}`} on Comfy Cloud or a Pod.
            {' '}<button type="button" className="link-btn" aria-expanded={advanced} onClick={() => setAdvanced((a) => !a)}>{advanced ? 'Hide advanced' : 'Advanced'}</button>
          </p>
          {advanced && (
            <div className="gen-upscale-more rise">
              {sources.length > 0 ? (
                <Choices label="Source" value={plan.source && source === plan.source.id ? source : null} autoLabel={autoSource?.label}
                  options={sources.map((s) => ({ ...s, note: s.native ? 'The size this model makes' : s.scale ? 'A smaller draft, faster to make' : undefined }))}
                  onChange={setSource} />
              ) : <p className="gen-hint">Source: this model makes one size, so the upscale starts from it.</p>}
              <Choices label="Target" value={prefs.target && prefs.target === plan.target.id ? prefs.target : null} autoLabel={autoTarget.label}
                options={targets.map((t) => ({ ...t, disabled: t.short <= floor, note: t.short <= floor ? 'Pick a target above the source' : undefined }))}
                onChange={(t) => setPrefs({ target: t })} />
              <div className="field">
                <label>Upscaler</label>
                <div className="pills" role="group" aria-label="Upscaler">
                  {upscalers.map((u) => (
                    <button key={u.id} type="button" className={u.id === upscaler.id ? 'on' : ''} aria-pressed={u.id === upscaler.id}
                      title={u.note} onClick={() => setPrefs({ upscaler: u.id })}>{u.name}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
