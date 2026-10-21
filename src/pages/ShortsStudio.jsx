import { useEffect, useState } from 'react'
import Segmented from '../components/Segmented.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { IconPlus, IconSearch } from '../components/Icons.jsx'
import { Split, Box, Ratios, Pills, Tiles, Toggle, Steps, NotWired, Empty, ErrorNote, coverAt, slug } from '../components/studiob/Kit.jsx'
import Tip from '../components/generate/Tip.jsx'
import { covers } from '../lib/formats/parts.js'
import { Pictures } from '../components/studiob/Inputs.jsx'
import { formatById } from '../lib/formats/index.js'

// Looks named after a color or a mood get a matching cover; the rest cycle through the palette.
const tints = [[/blue|ocean|winter|frost/i, 'sky'], [/golden|sunny|summer|desert/i, 'sun'], [/mint|forest/i, 'mint'], [/neon|night|noir|glitch/i, 'night'],
  [/pastel|dream/i, 'lilac'], [/clay|cozy|cafe/i, 'peach'], [/silver|white|minimal/i, 'slate'], [/concert|sticker/i, 'rose']]
const tint = (label) => covers[tints.find(([re]) => re.test(label))?.[1]]

const looks = ['Street bold', 'Mint punch', 'Quiet city', 'Golden hour', 'Sunny border', 'Silver screen', 'Clay world', 'Neon night',
  'Retro tape', 'Film grain', 'Comic panel', 'Paper cut', 'Pastel dream', 'Hard flash', 'Desert road', 'Ocean blue', 'Forest walk',
  'Cozy cafe', 'Gym energy', 'Studio white', 'Late night talk', 'Big captions', 'News flash', 'Game overlay', 'Tech review',
  'Cooking close', 'Travel diary', 'Runway week', 'Study beats', 'Glitch', 'Anime frame', 'Watercolor wash', 'Pixel arcade',
  'Noir shadow', 'Summer haze', 'Winter frost', 'Kinetic type', 'Split screen', 'Instant photo', 'Magazine cover', 'Sticker bomb',
  'Sport replay', 'Concert lights', 'Minimal grid'].map((label, i) => ({ id: slug(label), label, cover: tint(label) || coverAt(i) }))

// Same languages as the Talking head format, with auto detect first.
const languages = [{ id: 'auto', label: 'Auto detect' }, ...(formatById('talking-head')?.inputs.find((i) => i.id === 'language')?.options || [])]
const captionStyles = ['Bold', 'Clean', 'Word by word', 'Boxed'].map((c) => ({ id: slug(c), label: c }))

function PresetMaker({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [refs, setRefs] = useState([])
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="form-sheet glass pop" role="dialog" aria-label="Make a preset from references"
        onSubmit={(e) => { e.preventDefault(); if (name.trim() && refs.length) onSave({ id: `own-${Date.now()}`, label: name.trim(), image: refs[0], note: 'Yours' }) }}>
        <h3>Make a preset from references</h3>
        <p className="form-note muted">Add up to 3 stills from shorts you like. The preset copies their color, type and graphics.</p>
        <Field input={{ id: 'name', type: 'text', label: 'Name', placeholder: 'My channel look' }} value={name} onChange={setName} />
        <Pictures label="References" max={3} value={refs} onChange={setRefs} />
        <div className="form-sheet-foot">
          <span className="grow" />
          <button type="button" className="btn-soft" onClick={onClose}>Cancel</button>
          <button className="btn-blue sm" disabled={!name.trim() || !refs.length}>Save preset</button>
        </div>
      </form>
    </div>
  )
}

export default function ShortsStudio() {
  const [tab, setTab] = useState('presets')
  const [query, setQuery] = useState('')
  const [own, setOwn] = useState([])
  const [preset, setPreset] = useState(looks[0].id)
  const [making, setMaking] = useState(false)
  const [video, setVideo] = useState(null)
  const [language, setLanguage] = useState('auto')
  const [captions, setCaptions] = useState(true)
  const [captionStyle, setCaptionStyle] = useState('bold')
  const [ratio, setRatio] = useState('9:16')
  const [error, setError] = useState(null)

  const all = [...own, ...looks]
  const current = all.find((p) => p.id === preset)
  const q = query.trim().toLowerCase()
  const shown = q ? all.filter((p) => p.label.toLowerCase().includes(q)) : all
  const change = () => {
    setTab('presets')
    document.querySelector('.sb-main .sb-tiles')?.scrollIntoView({ block: 'nearest' })
  }

  const panel = (
    <>
      <div className="sb-preview" style={{ background: current?.image ? undefined : current?.cover }}>
        {current?.image && <img src={current.image} alt="" />}
        <button type="button" className="btn-soft xs" onClick={change}>Change</button>
        <strong>{current?.label}</strong>
      </div>
      <Field input={{ id: 'video', type: 'video', label: 'Footage, up to 2 minutes' }} value={video} onChange={setVideo} setError={setError} />
      <ErrorNote error={error} />
      <Box label="Language">
        <select className="sb-select" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language">
          {languages.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </Box>
      <Box label="Captions" aside={<Toggle on={captions} onChange={setCaptions}>{captions ? 'On' : 'Off'}</Toggle>}>
        {captions && <Pills options={captionStyles} value={captionStyle} onChange={setCaptionStyle} label="Caption style" />}
      </Box>
      <Box label="Output ratio">
        <Ratios options={[{ id: '9:16', note: 'Vertical' }, { id: '16:9', note: 'Horizontal' }, { id: '1:1', note: 'Square' }]} value={ratio} onChange={setRatio} label="Output ratio" />
      </Box>
    </>
  )

  return (
    <main className="sb-page">
      <Split name="Shorts studio" panel={panel}
        foot={<NotWired runsOn="Qwen3-VL, Wan VACE and Chatterbox" summary={`${current?.label}, ${ratio}, captions ${captions ? 'on' : 'off'}. Output at 720p.`} />}>
        <div className="sb-bar">
          <Segmented value={tab} onChange={setTab} options={[{ value: 'presets', label: 'Presets' }, { value: 'history', label: 'History' }, { value: 'how', label: 'How it works' }]} />
          {tab === 'presets' && (
            <label className="rail-search sb-search">
              <IconSearch />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search looks" aria-label="Search looks" />
            </label>
          )}
        </div>
        <Tip page="shorts" onLearn={() => setTab('how')} />
        {tab === 'presets' && (
          <Tiles tall items={shown} value={preset} onChange={setPreset} label="Looks"
            lead={!q && (
              <button type="button" className="sb-tile make" onClick={() => setMaking(true)}>
                <IconPlus />
                <span>Make a preset from references<small>Copy the look of shorts you like</small></span>
              </button>
            )} />
        )}
        {tab === 'presets' && !shown.length && <Empty title={`No looks match "${query}"`}>Try a mood, a color or a place.</Empty>}
        {tab === 'history' && <Empty title="No shorts yet">Finished shorts land here and in Assets.</Empty>}
        {tab === 'how' && (
          <Steps items={[
            { title: 'Pick a look', text: 'Choose one of 44 looks, or make your own from a few stills.' },
            { title: 'Upload footage', text: 'Up to 2 minutes. The spoken language is picked up for captions.' },
            { title: 'Generate', text: 'Pick vertical, horizontal or square. Shorts come back at 720p.' },
          ]} />
        )}
      </Split>
      {making && <PresetMaker onClose={() => setMaking(false)} onSave={(p) => { setOwn((x) => [p, ...x]); setPreset(p.id); setMaking(false) }} />}
    </main>
  )
}
