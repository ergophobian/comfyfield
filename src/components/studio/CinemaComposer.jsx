import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chip, Option } from '../Composer.jsx'
import { Field } from '../formats/Fields.jsx'
import { IconPlus, IconAspect, IconClock, IconSpark, IconClose, IconImage, IconVideo } from '../Icons.jsx'
import { IconAt, IconFilm, IconCamera, IconFrame, IconSound, IconMute, IconMinus } from './icons.jsx'
import { LightArt, Swatches } from './Art.jsx'
import DirectorPanel, { panelSummary } from './DirectorPanel.jsx'
import { GoButton, NotWired } from './Shell.jsx'
import MentionText from '../generate/Mentions.jsx'
import { useLibrary, toRef } from '../../lib/useLibrary.js'
import {
  byId, versions, stillVersions, modes, palettes, lights, durations, resolutions, videoRatios, stillRatios, emotions, runsOn,
} from './cinema.js'

const tileNames = { refs: 'References', film: 'Film setup', camera: 'Camera', palette: 'Color palette', light: 'Lighting' }

function TileArt({ id, shot }) {
  if (id === 'refs') {
    const first = shot.refs.find((r) => r.kind === 'image')
    return first ? <img src={first.url} alt="" /> : <IconPlus />
  }
  if (id === 'film') return <IconFilm />
  if (id === 'camera') return <IconCamera />
  if (id === 'palette') {
    const p = byId(palettes, shot.palette)
    return <Swatches colors={p.id === 'custom' ? shot.custom : p.colors} size="mini" />
  }
  const l = byId(lights, shot.light)
  return <LightArt light={l} color={l.id === 'custom' ? shot.lightCustom.color : undefined} />
}

// The Cinema studio prompt box: Director's panel tiles on top, the prompt, then the shot settings.
export default function CinemaComposer({ still, onKind, shot, set, setRefs }) {
  const id = useId()
  const lib = useLibrary()
  const [section, setSection] = useState(null)
  const [error, setError] = useState(null)
  const version = still ? byId(stillVersions, shot.stillVersion) : byId(versions, shot.version)
  const mode = still ? modes[0] : byId(modes, shot.mode)
  const tiles = still ? ['refs', 'camera', 'palette', 'light'] : ['refs', 'film', 'camera', 'palette', 'light']
  const used = shot.refs.length + shot.cast.length
  const over = used - version.refs

  const pickVersion = (v) => {
    const next = byId(versions, v)
    set({
      version: v,
      duration: Math.min(shot.duration, next.duration),
      mode: next.modes.includes(shot.mode) ? shot.mode : 'refs',
      clip: next.modes.includes(shot.mode) ? shot.clip : null,
      cast: shot.cast.slice(0, next.cast),
    })
  }
  // typed: the prompt with @Name already written where it was typed, from the mention list.
  const cast = (item, typed) => {
    const full = shot.cast.some((m) => m.ref.id === item.id) || shot.cast.length >= Math.min(version.cast, version.refs - shot.refs.length)
    if (full) { if (typed != null) set({ prompt: typed }); return }
    const tag = `@${item.name}`
    set({
      cast: [...shot.cast, { ref: toRef('character', item), emotion: null, intensity: 'clear' }],
      prompt: typed ?? (shot.prompt.includes(tag) ? shot.prompt : `${shot.prompt}${shot.prompt && !shot.prompt.endsWith(' ') ? ' ' : ''}${tag} `),
    })
  }
  const uncast = (refId) => set({ cast: shot.cast.filter((m) => m.ref.id !== refId) })
  const unref = (r) => {
    if (r.local) URL.revokeObjectURL(r.url)
    setRefs((xs) => xs.filter((x) => x.url !== r.url))
  }
  const ratio = still ? shot.stillRatio : shot.ratio

  return (
    <div className={`cs-dock${still ? ' still' : ''}`}>
      <div className="cs-kind" role="group" aria-label="What to make">
        <button type="button" aria-pressed={still} className={still ? 'on' : ''} onClick={() => onKind(true)}><IconImage /><span>Image</span></button>
        <button type="button" aria-pressed={!still} className={!still ? 'on' : ''} onClick={() => onKind(false)}><IconVideo /><span>Video</span></button>
      </div>
      <div className="cs-composer glass">
        <div className="cs-tiles">
          {tiles.map((t, i) => {
            const on = section === t
            return (
              <button key={t} type="button" className={`cs-tile${on ? ' on' : ''}`} style={{ '--i': i }} aria-expanded={on} aria-controls={`${id}-panel`}
                onClick={() => setSection((s) => (s === t ? null : t))}>
                <span className="cs-tile-art"><TileArt id={t} shot={shot} /></span>
                <span className="cs-tile-text">
                  <small>{tileNames[t]}</small>
                  <strong>{panelSummary[t](shot, version, still)}</strong>
                </span>
              </button>
            )
          })}
        </div>

        {section && (
          <div id={`${id}-panel`} className="cs-panel-wrap" key={section}>
            <div className="cs-panel-top">
              <h3>{tileNames[section]}</h3>
              <button type="button" className="icon-btn" aria-label="Close panel" onClick={() => setSection(null)}><IconClose /></button>
            </div>
            <DirectorPanel section={section} shot={shot} set={set} setRefs={setRefs} still={still} version={version} />
          </div>
        )}

        {(shot.refs.length > 0 || shot.cast.length > 0) && (
          <div className="cs-strip">
            {shot.cast.map((m) => (
              <span key={m.ref.id} className="ref">
                {m.ref.images?.[0] && <img src={m.ref.images[0]} alt="" />}
                {m.ref.name}{m.emotion && ` · ${byId(emotions, m.emotion).label}`}
                <button type="button" aria-label={`Remove ${m.ref.name} from the cast`} onClick={() => uncast(m.ref.id)}><IconClose /></button>
              </span>
            ))}
            {shot.refs.slice(0, 12).map((r) => (
              <span key={r.url} className="cs-thumb">
                {r.kind === 'video' ? <video src={r.url} muted playsInline preload="metadata" /> : <img src={r.url} alt="" />}
                <button type="button" aria-label={`Remove ${r.name || 'reference'}`} onClick={() => unref(r)}><IconClose /></button>
              </span>
            ))}
            {shot.refs.length > 12 && <button type="button" className="cs-more" onClick={() => setSection('refs')}>{shot.refs.length - 12} more</button>}
          </div>
        )}
        {over > 0 && (
          <p className="sheet-error cs-warn">{version.label} takes {version.refs} references. Remove {over} or pick a newer version.</p>
        )}

        {mode.clip && (
          <div className="cs-clip">
            <Field input={{ id: 'clip', type: 'video', label: `${mode.clip}, up to ${version.clip}s` }} value={shot.clip}
              onChange={(v) => set({ clip: v })} setError={setError} />
            {error && <p className="sheet-error">{error}</p>}
          </div>
        )}

        <div className="cs-write">
          <MentionText up types={['character']} value={shot.prompt} onChange={(prompt) => set({ prompt })} onPick={(type, item, text) => cast(item, text)}
            rows={2} aria-label="Prompt" placeholder={still ? 'Describe the frame. Type @ to cast a character' : mode.placeholder} />
          <GoButton />
        </div>

        <div className="cs-bar chips">
          <div className="chip">
            <button type="button" aria-label="Add references" className={section === 'refs' ? 'lit' : ''} onClick={() => setSection('refs')}><IconPlus /></button>
          </div>
          <Chip icon={<IconAt />} label={<span className="sa-sr">Cast a character</span>} lit={shot.cast.length > 0}>
            <h6>Cast a character</h6>
            {lib.characters.map((c) => {
              const on = shot.cast.some((m) => m.ref.id === c.id)
              return <Option key={c.id} on={on} label={c.name} note={on ? 'In the cast' : undefined} onClick={() => (on ? uncast(c.id) : cast(c))} />
            })}
            {lib.ready && !lib.characters.length && <Option disabled label="No characters yet" note="Create one in Character" />}
            <Link className="menu-foot link-btn" to="/character">New character</Link>
          </Chip>
          {!still && (
            <Chip icon={<IconFrame />} label={mode.label} lit={mode.id !== 'refs'}>
              <h6>Mode</h6>
              {modes.map((m) => {
                const ok = version.modes.includes(m.id)
                return <Option key={m.id} on={m.id === mode.id} disabled={!ok} label={m.label} note={ok ? m.note : 'Needs version 4.0'}
                  onClick={() => set({ mode: m.id, clip: m.clip ? shot.clip : null })} />
              })}
            </Chip>
          )}
          <Chip icon={<IconSpark />} label={version.label}>
            <h6>Version</h6>
            {(still ? stillVersions : versions).map((v) => (
              <Option key={v.id} on={v.id === version.id} label={v.label} note={v.note}
                onClick={() => (still ? set({ stillVersion: v.id }) : pickVersion(v.id))} />
            ))}
          </Chip>
          {!still && (
            <Chip label={shot.resolution}>
              <h6>Resolution</h6>
              {resolutions.map((r) => <Option key={r} on={r === shot.resolution} label={r} onClick={() => set({ resolution: r })} />)}
            </Chip>
          )}
          <Chip icon={<IconAspect />} label={ratio}>
            <h6>Aspect ratio</h6>
            {(still ? stillRatios : videoRatios).map((r) => (
              <Option key={r} on={r === ratio} label={r} onClick={() => set(still ? { stillRatio: r } : { ratio: r })} />
            ))}
          </Chip>
          {!still && (
            <Chip icon={<IconClock />} label={`${shot.duration}s`}>
              <h6>Duration</h6>
              {durations.filter((d) => d <= version.duration).map((d) => (
                <Option key={d} on={d === shot.duration} label={`${d} seconds`} onClick={() => set({ duration: d })} />
              ))}
            </Chip>
          )}
          {!still && (
            <div className="chip">
              <button type="button" className={shot.sound ? 'lit' : ''} aria-pressed={shot.sound} onClick={() => set({ sound: !shot.sound })}>
                {shot.sound ? <IconSound /> : <IconMute />}<span>Sound {shot.sound ? 'on' : 'off'}</span>
              </button>
            </div>
          )}
          {still && (
            <div className="cs-batch" role="group" aria-label="Images per run">
              <button type="button" aria-label="Fewer images" disabled={shot.batch <= 1} onClick={() => set({ batch: shot.batch - 1 })}><IconMinus /></button>
              <span>{shot.batch}/4</span>
              <button type="button" aria-label="More images" disabled={shot.batch >= 4} onClick={() => set({ batch: shot.batch + 1 })}><IconPlus /></button>
            </div>
          )}
        </div>

        <p className="cs-director">
          <IconSpark />
          <span>AI director: paste a script and it drafts each shot's prompt and settings. You still press Generate.</span>
          <span className="soon-tag">Not wired yet</span>
        </p>
      </div>
      <p className="cs-foot"><NotWired runsOn={still ? runsOn.image : runsOn.video} /></p>
    </div>
  )
}
