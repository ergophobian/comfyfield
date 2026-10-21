import { useState } from 'react'
import Segmented from '../components/Segmented.jsx'
import { Chip, Option } from '../components/Composer.jsx'
import { FormatGrid } from '../components/Recipes.jsx'
import { IconAspect, IconClock, IconCopy, IconPlus, IconSettings, IconTrash } from '../components/Icons.jsx'
import { Hero, Box, Pills, Steps, NotWired, Empty, useParam, fitBox } from '../components/studiob/Kit.jsx'
import Tip, { scrollToHow } from '../components/generate/Tip.jsx'
import { useApp } from '../lib/appContext.js'
import { formatById, formatsFor } from '../lib/formats/index.js'

const scene3d = formatById('scene-3d')
const optionsOf = (id) => scene3d?.inputs.find((i) => i.id === id)?.options || []
// The 3D scene format's camera paths and lights, plus a few more moves for blocking.
const cameraPaths = [...optionsOf('camera').map((o) => ({ id: o.id, label: o.label })), { id: 'crane', label: 'Crane up' }, { id: 'truck', label: 'Truck left' }, { id: 'static', label: 'Locked off' }]
const lights = optionsOf('lighting').map((o) => ({ id: o.id, label: o.label }))

const kinds = [
  ['box', 'Box'], ['sphere', 'Sphere'], ['cylinder', 'Cylinder'], ['plane', 'Floor'], ['person', 'Person'],
  ['sun', 'Sun'], ['point', 'Point light'], ['spot', 'Spot light'], ['camera', 'Camera'],
]
const kindName = Object.fromEntries(kinds)
const modes = [
  { id: 'auto', label: 'Build without asking' },
  { id: 'ask', label: 'Ask before building' },
  { id: 'chat', label: 'Only answer questions' },
]
const ratios = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9']
const seconds = [5, 10, 15, 30, 60]

let nextId = 1
const make = (type, x = 50, z = 50, name) => ({ id: `o${nextId++}`, type, name: name || kindName[type], x, z })
const starter = () => [make('plane', 50, 50, 'Floor'), make('box', 38, 46, 'Front desk'), make('person', 62, 40, 'Guest'), make('sun', 20, 18, 'Sun'), make('camera', 50, 88, 'Camera')]

// Paths drawn on the floor plane in a 100 by 100 box.
const paths = {
  orbit: 'M50 20 A34 30 0 1 1 49.9 20',
  fly: 'M12 90 C30 60 70 70 60 40 S30 15 50 10',
  dolly: 'M50 92 L50 52',
  crane: 'M50 92 L50 70',
  truck: 'M80 84 L20 84',
  static: '',
}

function Glyph({ type }) {
  const p = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinejoin: 'round', strokeLinecap: 'round' }
  if (type === 'box') return <svg {...p}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>
  if (type === 'sphere') return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M4 12c2 2.5 14 2.5 16 0" /></svg>
  if (type === 'cylinder') return <svg {...p}><ellipse cx="12" cy="6" rx="7" ry="2.5" /><path d="M5 6v12c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5V6" /></svg>
  if (type === 'plane') return <svg {...p}><path d="M3 16 9 8h12l-6 8H3Z" /></svg>
  if (type === 'person') return <svg {...p}><circle cx="12" cy="6" r="3" /><path d="M7 21v-6a5 5 0 0 1 10 0v6" /></svg>
  if (type === 'camera') return <svg {...p}><rect x="3" y="7" width="12" height="10" rx="2" /><path d="m15 11 6-3v8l-6-3" /></svg>
  return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>
}

function Scene() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('ask')
  const [length, setLength] = useState(15)
  const [ratio, setRatio] = useState('16:9')
  const [objects, setObjects] = useState(starter)
  const [selected, setSelected] = useState(null)
  const [camera, setCamera] = useState('orbit')
  const [light, setLight] = useState(lights[0]?.id)

  const sel = objects.find((o) => o.id === selected)
  const patch = (id, p) => setObjects((list) => list.map((o) => (o.id === id ? { ...o, ...p } : o)))
  const add = (type) => {
    const o = make(type, 45 + Math.round(Math.random() * 10), 45 + Math.round(Math.random() * 10))
    setObjects((list) => [...list, o])
    setSelected(o.id)
  }
  const duplicate = (o) => {
    const copy = make(o.type, Math.min(95, o.x + 6), Math.min(95, o.z + 6), `${o.name} copy`)
    setObjects((list) => [...list, copy])
    setSelected(copy.id)
  }
  const remove = (id) => {
    setObjects((list) => list.filter((o) => o.id !== id))
    if (selected === id) setSelected(null)
  }

  return (
    <>
      <form className="composer glass sb-compose" onSubmit={(e) => e.preventDefault()}>
        <div className="composer-inner">
          <textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="Scene"
            placeholder="Describe the scene to block out, such as an office lobby with five people, a round front desk and an exit door" />
          <div className="composer-foot">
            <div className="chips">
              <Chip icon={<IconSettings />} label={modes.find((m) => m.id === mode).label}>
                {modes.map((m) => <Option key={m.id} label={m.label} on={mode === m.id} onClick={() => setMode(m.id)} />)}
              </Chip>
              <Chip icon={<IconClock />} label={`${length} s`}>
                {seconds.map((s) => <Option key={s} label={`${s} seconds`} on={length === s} onClick={() => setLength(s)} />)}
              </Chip>
              <Chip icon={<IconAspect />} label={ratio}>
                {ratios.map((r) => <Option key={r} label={r} on={ratio === r} onClick={() => setRatio(r)} />)}
              </Chip>
            </div>
            <button type="button" className="btn-blue" disabled>Block out</button>
          </div>
        </div>
      </form>
      <p className="sb-wire muted">Building a scene from a prompt is not wired yet. Block it out by hand below for now.</p>

      <div className="sb-work">
        <div className="sb-viewport glass" aria-label="Scene viewport" onPointerDown={(e) => !e.target.closest('.sb-obj') && setSelected(null)}>
          <span className="sb-guide" style={fitBox(ratio, 1.6, 86)} aria-hidden="true" />
          <div className="sb-floor">
            {paths[camera] && (
              <svg className="sb-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={paths[camera]} /></svg>
            )}
            {objects.map((o) => (
              <button key={o.id} type="button" className={`sb-obj ${o.type}${selected === o.id ? ' on' : ''}`} style={{ left: `${o.x}%`, top: `${o.z}%` }}
                aria-pressed={selected === o.id} aria-label={o.name} onClick={() => setSelected(o.id)}>
                <span><Glyph type={o.type} /></span>
              </button>
            ))}
          </div>
          <span className="sb-vp-tag">{ratio} · {length} s · {lights.find((l) => l.id === light)?.label}</span>
        </div>

        <aside className="sb-side glass" aria-label="Scene settings">
          <Box label="Objects" aside={(
            <Chip icon={<IconPlus />} label="Add">
              {kinds.map(([id, label]) => <Option key={id} label={label} onClick={() => add(id)} />)}
            </Chip>
          )}>
            {objects.length ? (
              <ul className="sb-objects">
                {objects.map((o) => (
                  <li key={o.id} className={selected === o.id ? 'on' : ''}>
                    <button type="button" className="sb-obj-pick" aria-pressed={selected === o.id} onClick={() => setSelected(o.id)} aria-label={`Select ${o.name}`}><Glyph type={o.type} /></button>
                    <input value={o.name} onChange={(e) => patch(o.id, { name: e.target.value })} aria-label={`${kindName[o.type]} name`} onFocus={() => setSelected(o.id)} />
                    <button type="button" className="plist-x" onClick={() => duplicate(o)} aria-label={`Duplicate ${o.name}`}><IconCopy /></button>
                    <button type="button" className="plist-x" onClick={() => remove(o.id)} aria-label={`Delete ${o.name}`}><IconTrash /></button>
                  </li>
                ))}
              </ul>
            ) : <Empty title="Empty scene">Add a box, a person or a light to start.</Empty>}
            {sel && (
              <div className="sb-move">
                <label>Left and right<input type="range" min="2" max="98" value={sel.x} onChange={(e) => patch(sel.id, { x: Number(e.target.value) })} /></label>
                <label>Near and far<input type="range" min="2" max="98" value={sel.z} onChange={(e) => patch(sel.id, { z: Number(e.target.value) })} /></label>
              </div>
            )}
          </Box>
          <Box label="Camera path"><Pills options={cameraPaths} value={camera} onChange={setCamera} label="Camera path" /></Box>
          <Box label="Lighting"><Pills options={lights} value={light} onChange={setLight} label="Lighting" /></Box>
          <Box label="Export">
            <div className="sb-tags">
              {['MP4', 'Still', 'GLB'].map((x) => <button key={x} type="button" className="btn-soft xs" disabled>{x}</button>)}
            </div>
          </Box>
          <NotWired label="Render to video" runsOn="Wan 2.2" summary={`${objects.length} objects, ${cameraPaths.find((c) => c.id === camera)?.label.toLowerCase()}, ${length} s at ${ratio}`} />
        </aside>
      </div>

      <section className="sb-section" id="how-3d">
        <div className="studio-sub"><h2>How it works</h2></div>
        <Steps items={[
          { title: 'Build the set', text: 'Describe it, or add boxes, people and lights by hand.' },
          { title: 'Stage it', text: 'Move things around, pick a light and a camera path.' },
          { title: 'Film it', text: 'Render the take to video, or export a still or a model.' },
        ]} />
      </section>
    </>
  )
}

function ModelTab({ id, others }) {
  const { openFormat } = useApp()
  const f = formatById(id)
  if (!f) return <Empty title="This format is missing">It may have been renamed.</Empty>
  return (
    <>
      <div className="sb-launch glass rise">
        <span className="sb-launch-cover" style={{ background: f.cover }} />
        <div>
          <h2>{f.name}</h2>
          <p>{f.blurb}</p>
          <p className="muted">{f.output}. Runs on {f.runsOn}.</p>
          <button type="button" className="btn-blue sm" onClick={() => openFormat(id)}>Open {f.name.toLowerCase()}</button>
        </div>
      </div>
      <section className="sb-section">
        <div className="studio-sub"><h2>More in 3D</h2></div>
        <FormatGrid list={others} onOpen={(x) => openFormat(x)} />
      </section>
    </>
  )
}

const tabs = { scene: null, photo: 'image-to-3d', text: 'text-to-3d' }

export default function ThreeD() {
  const { openFormat } = useApp()
  const [tab, setTab] = useParam('tab', Object.keys(tabs))
  // The model tabs open their format straight away; the page stays behind the sheet to reopen it.
  const go = (t) => {
    setTab(t)
    if (tabs[t]) openFormat(tabs[t])
  }
  const others = formatsFor({ kind: '3d' }).filter((f) => f.id !== tabs[tab])

  return (
    <main className="sb-page">
      <Hero badge="3D studio" title="Block out a 3D scene, then film it"
        sub="Place props, people, lights and a camera, then render the take to video.">
        <Segmented value={tab} onChange={go} options={[{ value: 'scene', label: 'Scene' }, { value: 'photo', label: 'Photo to 3D model' }, { value: 'text', label: 'Text to 3D' }]} />
      </Hero>
      {tab === 'scene' && <Tip page="3d" onLearn={scrollToHow('how-3d')} />}
      {tab === 'scene' ? <Scene /> : <ModelTab id={tabs[tab]} others={others} />}
    </main>
  )
}
