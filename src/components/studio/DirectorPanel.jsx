import { useState } from 'react'
import { Link } from 'react-router-dom'
import Wheel from './Wheel.jsx'
import EmotionWheel from './EmotionWheel.jsx'
import PhotoGrid from './PhotoGrid.jsx'
import { CameraArt, LightArt, Swatches } from './Art.jsx'
import { IconSearch } from '../Icons.jsx'
import { useLibrary, toRef } from '../../lib/useLibrary.js'
import {
  genres, eras, tempos, cameraTypes, stillBodies, lenses, focals, apertures, rigPresets,
  moves, palettes, lights, emotions, byId,
} from './cinema.js'

function Opts({ list, value, onChange, label }) {
  return (
    <div className="opt-grid" role="group" aria-label={label}>
      {list.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} className={`opt${value === o.id ? ' on' : ''}`} onClick={() => onChange(o.id)}>
          <strong>{o.label}</strong>{o.note && <small>{o.note}</small>}
        </button>
      ))}
    </div>
  )
}

function Pills({ list, value, onChange, label }) {
  return (
    <div className="pills" role="group" aria-label={label}>
      {list.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  )
}

const Group = ({ title, aside, children }) => (
  <div className="cs-group">
    <div className="cs-group-head"><h4>{title}</h4>{aside}</div>
    {children}
  </div>
)

function FilmSetup({ shot, set }) {
  return (
    <>
      <Group title="Genre"><Opts label="Genre" list={genres} value={shot.genre} onChange={(v) => set({ genre: v })} /></Group>
      <Group title="Era"><Pills label="Era" list={eras} value={shot.era} onChange={(v) => set({ era: v })} /></Group>
      <Group title="Tempo"><Opts label="Tempo" list={tempos} value={shot.tempo} onChange={(v) => set({ tempo: v })} /></Group>
    </>
  )
}

function Camera({ shot, set, still, version }) {
  const [q, setQ] = useState('')
  const found = moves.filter((m) => m.label.toLowerCase().includes(q.trim().toLowerCase()))
  const art = (o) => <CameraArt kind={o.art} />
  const rig = rigPresets.find((r) => r.body === shot.body && r.lens === shot.lens && r.focal === shot.focal && r.aperture === shot.aperture)
  return (
    <>
      <div className={`cs-rig${still && !version.aperture ? ' three' : ''}`}>
        {still
          ? <Wheel label="Camera body" options={stillBodies} value={shot.body} onChange={(v) => set({ body: v })} art={art} />
          : <Wheel label="Camera type" options={cameraTypes} value={shot.camera} onChange={(v) => set({ camera: v })} art={art} />}
        <Wheel label="Lens" options={lenses} value={shot.lens} onChange={(v) => set({ lens: v })} />
        <Wheel label="Focal length" options={focals} value={shot.focal} onChange={(v) => set({ focal: v })} />
        {(!still || version.aperture) && <Wheel label="Aperture" options={apertures} value={shot.aperture} onChange={(v) => set({ aperture: v })} />}
      </div>
      {still && version.aperture && (
        <Group title="Recommended rigs">
          <div className="pills" role="group" aria-label="Recommended rigs">
            {rigPresets.map((r) => (
              <button key={r.id} type="button" aria-pressed={rig?.id === r.id} className={rig?.id === r.id ? 'on' : ''}
                onClick={() => set({ body: r.body, lens: r.lens, focal: r.focal, aperture: r.aperture })}>{r.label}</button>
            ))}
          </div>
        </Group>
      )}
      {!still && (
        <Group title="Camera move" aside={(
          <label className="cs-find">
            <IconSearch />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${moves.length} moves`} aria-label="Search camera moves" />
          </label>
        )}>
          <div className="pills cs-moves" role="group" aria-label="Camera move">
            {found.map((m) => (
              <button key={m.id} type="button" aria-pressed={shot.move === m.id} className={shot.move === m.id ? 'on' : ''} onClick={() => set({ move: m.id })}>{m.label}</button>
            ))}
            {!found.length && <span className="sa-hint">No move matches that.</span>}
          </div>
        </Group>
      )}
    </>
  )
}

function Palette({ shot, set }) {
  return (
    <>
      <div className="cs-palettes" role="group" aria-label="Color palette">
        {palettes.map((p, i) => {
          const on = shot.palette === p.id
          return (
            <button key={p.id} type="button" aria-pressed={on} className={`cs-pal${on ? ' on' : ''}`} style={{ '--i': Math.min(i, 12) }} onClick={() => set({ palette: p.id })}>
              <Swatches colors={p.id === 'custom' ? shot.custom : p.colors} />
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>
      {shot.palette === 'custom' && (
        <Group title="Your palette">
          <div className="swatches">
            {shot.custom.map((c, k) => (
              <span className="swatch" key={k}>
                <input type="color" value={c} aria-label={`Palette color ${k + 1}`}
                  onChange={(e) => set({ custom: shot.custom.map((x, j) => (j === k ? e.target.value : x)) })} />
              </span>
            ))}
          </div>
        </Group>
      )}
    </>
  )
}

function Range({ label, value, onChange, min = 0, max = 100, unit = '%', ends }) {
  return (
    <label className="cs-range">
      <span><strong>{label}</strong><em>{value}{unit}</em></span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {ends && <small><i>{ends[0]}</i><i>{ends[1]}</i></small>}
    </label>
  )
}

function Lighting({ shot, set }) {
  const c = shot.lightCustom
  const setC = (patch) => set({ lightCustom: { ...c, ...patch } })
  const rad = (c.angle * Math.PI) / 180
  const customAt = { x: Math.round(50 + 44 * Math.sin(rad)), y: Math.round(50 - 44 * Math.cos(rad)) }
  return (
    <>
      <div className="cs-lights" role="group" aria-label="Lighting">
        {lights.map((l) => {
          const on = shot.light === l.id
          const custom = l.id === 'custom'
          return (
            <button key={l.id} type="button" aria-pressed={on} className={`cs-light${on ? ' on' : ''}`} onClick={() => set({ light: l.id })}>
              {custom ? <LightArt light={{ ...l, ...customAt }} color={c.color} glow={c.diffusion} strength={c.brightness} /> : <LightArt light={l} />}
              <strong>{l.label}</strong>
              <small>{l.note}</small>
            </button>
          )
        })}
      </div>
      {shot.light === 'custom' && (
        <div className="cs-custom-light">
          <label className="cs-color">
            <span className="swatch"><input type="color" value={c.color} aria-label="Light color" onChange={(e) => setC({ color: e.target.value })} /></span>
            <strong>Color</strong>
          </label>
          <Range label="Brightness" value={c.brightness} onChange={(v) => setC({ brightness: v })} ends={['Dim', 'Bright']} />
          <Range label="Diffusion" value={c.diffusion} onChange={(v) => setC({ diffusion: v })} ends={['Hard', 'Soft']} />
          <Range label="Angle" value={c.angle} max={359} unit="°" onChange={(v) => setC({ angle: v })} ends={['Above', 'Full turn']} />
        </div>
      )}
    </>
  )
}

function References({ shot, set, setRefs, still, version }) {
  const lib = useLibrary()
  const [directing, setDirecting] = useState(null)
  const max = version.refs
  const castMax = Math.min(version.cast, Math.max(0, max - shot.refs.length))
  const castIds = shot.cast.map((m) => m.ref.id)
  const toggle = (item) => {
    if (castIds.includes(item.id)) {
      set({ cast: shot.cast.filter((m) => m.ref.id !== item.id) })
      if (directing === item.id) setDirecting(null)
    } else if (shot.cast.length < castMax) {
      set({ cast: [...shot.cast, { ref: toRef('character', item), emotion: null, intensity: 'clear' }] })
      setDirecting(item.id)
    }
  }
  const lead = shot.cast.find((m) => m.ref.id === directing) || shot.cast[0]
  const refRoom = Math.max(0, max - shot.cast.length)
  return (
    <>
      <PhotoGrid label={still ? 'Images' : 'Images and clips'} value={shot.refs} setValue={setRefs} max={refRoom} video={!still} small
        hint={`The look, places and props. Version ${version.id} takes ${max} references in all, cast included.`} />
      <Group title="Cast" aside={<span className="sa-count">{shot.cast.length} of {Math.min(version.cast, max)}</span>}>
        {!lib.ready && <p className="sa-hint">Loading characters</p>}
        {lib.ready && !lib.characters.length && (
          <p className="sa-hint">No characters yet. <Link to="/character">Create a character</Link> to cast them in every shot.</p>
        )}
        {lib.characters.length > 0 && (
          <div className="picks" role="group" aria-label="Cast from your characters">
            {lib.characters.map((item) => {
              const on = castIds.includes(item.id)
              return (
                <button key={item.id} type="button" aria-pressed={on} disabled={!on && shot.cast.length >= castMax} className={`pick${on ? ' on' : ''}`} onClick={() => toggle(item)}>
                  <span className="pick-img">{item.images?.[0] ? <img src={item.images[0]} alt="" /> : item.name?.[0]}</span>
                  <small>{item.name}</small>
                </button>
              )
            })}
          </div>
        )}
      </Group>
      {lead && (
        <Group title="Performance" aside={<span className="sa-hint">Type @{lead.ref.name} in the prompt to direct them</span>}>
          {shot.cast.length > 1 && (
            <div className="pills" role="group" aria-label="Cast member to direct">
              {shot.cast.map((m) => (
                <button key={m.ref.id} type="button" aria-pressed={m === lead} className={m === lead ? 'on' : ''} onClick={() => setDirecting(m.ref.id)}>
                  {m.ref.name}{m.emotion && ` · ${byId(emotions, m.emotion).label}`}
                </button>
              ))}
            </div>
          )}
          <EmotionWheel name={lead.ref.name} value={lead.emotion} intensity={lead.intensity}
            onChange={(p) => set({ cast: shot.cast.map((m) => (m === lead ? { ...m, ...p } : m)) })} />
        </Group>
      )}
    </>
  )
}

export const panelSummary = {
  refs: (shot, version) => `${shot.refs.length + shot.cast.length}/${version.refs}`,
  film: (shot) => {
    const g = byId(genres, shot.genre)
    return shot.genre === 'general' && shot.era === 'auto' ? 'Auto' : `${g.label}${shot.era !== 'auto' ? `, ${shot.era}` : ''}`
  },
  camera: (shot, version, still) => (still ? byId(stillBodies, shot.body) : byId(cameraTypes, shot.camera)).label,
  palette: (shot) => byId(palettes, shot.palette).label,
  light: (shot) => byId(lights, shot.light).label,
}

export default function DirectorPanel({ section, shot, set, setRefs, still, version }) {
  const props = { shot, set, still, version }
  return (
    <div className="cs-panel" role="region" aria-label="Director's panel">
      {section === 'refs' && <References {...props} setRefs={setRefs} />}
      {section === 'film' && <FilmSetup {...props} />}
      {section === 'camera' && <Camera {...props} />}
      {section === 'palette' && <Palette {...props} />}
      {section === 'light' && <Lighting {...props} />}
    </div>
  )
}
