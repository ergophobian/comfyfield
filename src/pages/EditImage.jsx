import { useState } from 'react'
import Segmented from '../components/Segmented.jsx'
import { FormatGrid } from '../components/Recipes.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { Hero, Box, Pills, NotWired, Empty, ErrorNote, Compared, IconEye, useParam, stagger } from '../components/studiob/Kit.jsx'
import { useApp } from '../lib/appContext.js'
import { formatById, formatsFor } from '../lib/formats/index.js'

const inpaint = formatById('inpaint')
const layered = formatById('layers')
const inputOf = (f, id) => f?.inputs.find((i) => i.id === id)

// Starters for the change box, one per kind of fix.
const quick = [
  ['remove', 'Remove it', 'Remove it and fill in the background'],
  ['replace', 'Replace it', 'Replace it with '],
  ['restyle', 'Restyle it', 'Keep the shape, make it '],
  ['face', 'Fix a face', 'A natural, relaxed version of the same face'],
  ['text', 'Change the text', 'The sign now reads '],
  ['material', 'Change the material', 'The same object made of '],
]
const layerNames = ['Background', 'Main subject', 'Foreground', 'Text', 'Shadows', 'Props', 'Sky', 'Details']

function Inpaint({ error, setError }) {
  const [image, setImage] = useState(null)
  const [change, setChange] = useState('')
  const [quality, setQuality] = useState('medium')
  const painted = !!image?.strokes
  return (
    <div className="sb-work">
      <div className="sb-stage tall">
        <Field input={inputOf(inpaint, 'image') || { id: 'image', type: 'draw', mode: 'mask', label: 'Photo' }} value={image} onChange={setImage} setError={setError} />
        <ErrorNote error={error} />
      </div>
      <aside className="sb-side glass" aria-label="Inpaint settings">
        <Box label="Quick fixes">
          <div className="pills" role="group" aria-label="Quick fixes">
            {quick.map(([id, label, text]) => (
              <button key={id} type="button" aria-pressed={change === text} className={change === text ? 'on' : ''} onClick={() => setChange(text)}>{label}</button>
            ))}
          </div>
        </Box>
        <Field input={{ ...(inputOf(inpaint, 'change') || { id: 'change', type: 'text', label: 'What it should become' }), type: 'longtext', rows: 3 }} value={change} onChange={setChange} />
        <Box label="Quality"><Pills options={['Low', 'Medium', 'High'].map((q) => ({ id: q.toLowerCase(), label: q }))} value={quality} onChange={setQuality} label="Quality" /></Box>
        <NotWired runsOn={inpaint?.runsOn}
          summary={!image ? 'Add a photo, then paint over the part to change.' : !painted ? 'Paint over the part to change.' : change.trim() ? 'Only the painted area changes.' : 'Say what the painted area should become.'} />
      </aside>
    </div>
  )
}

function Layers({ error, setError }) {
  const [image, setImage] = useState(null)
  const counts = inputOf(layered, 'layers')
  const [count, setCount] = useState(counts?.default || 4)
  const [resolution, setResolution] = useState('2k')
  const [mode, setMode] = useState('standard')
  return (
    <div className="sb-work">
      <div className="sb-stage tall">
        <Field input={{ id: 'image', type: 'image', label: 'Photo to split' }} value={image} onChange={setImage} setError={setError} />
        <ErrorNote error={error} />
      </div>
      <aside className="sb-side glass" aria-label="Layer settings">
        <Box label="Layers">
          <Pills options={(counts?.options || [3, 4, 6, 8]).map((n) => ({ id: n, label: `${n} layers` }))} value={count} onChange={setCount} label="Layer count" />
        </Box>
        <div className="sb-grid2">
          <Box label="Resolution"><Pills options={['1K', '1.5K', '2K'].map((r) => ({ id: r.toLowerCase(), label: r }))} value={resolution} onChange={setResolution} label="Resolution" /></Box>
          <Box label="Mode"><Pills options={[{ id: 'standard', label: 'Standard' }, { id: 'fast', label: 'Fast' }]} value={mode} onChange={setMode} label="Mode" /></Box>
        </div>
        <Box label="Layer list" aside={<span className="muted">After a run</span>}>
          <ol className="sb-layers" aria-label="Layers, filled in after a run">
            {Array.from({ length: count }, (_, i) => (
              <li key={i} className="rise" style={stagger(i)}>
                <span className="sb-layer-thumb">{image && i === 0 ? <img src={image.url} alt="" /> : null}</span>
                <span>{layerNames[i] || `Layer ${i + 1}`}</span>
                <IconEye />
              </li>
            ))}
          </ol>
          <p className="sheet-note">Each layer gets its own transparent file with clean edges, and the hidden parts of the background are filled in.</p>
        </Box>
        <NotWired label="Split into layers" runsOn={layered?.runsOn} summary={`${count} layers at ${resolution.toUpperCase()}, ${mode}`} />
      </aside>
    </div>
  )
}

export default function EditImage() {
  const { openFormat, gens } = useApp()
  const [tab, setTab] = useParam('tab', ['inpaint', 'layers'])
  const [error, setError] = useState(null)
  const edits = new Set(formatsFor({ kind: 'image', category: 'image-edit', openOnly: false }).map((f) => f.id))
  const edited = gens.items.filter((it) => edits.has(it.formatId) && it.kind === 'image' && it.source && it.url && !it.pending).slice(0, 6)
  const more = formatsFor({ kind: 'image', category: 'image-edit' }).filter((f) => f.id !== 'inpaint' && f.id !== 'layers').slice(0, 12)
  return (
    <main className="sb-page">
      <Hero badge="Edit image" title="Change any part of a picture"
        sub="Paint over what should change and say what it becomes, or split the picture into layers you can edit one by one.">
        <Segmented value={tab} onChange={(t) => { setTab(t); setError(null) }} options={[{ value: 'inpaint', label: 'Inpaint' }, { value: 'layers', label: 'Layers' }]} />
      </Hero>
      {tab === 'inpaint' ? <Inpaint error={error} setError={setError} /> : <Layers error={error} setError={setError} />}

      <Compared items={edited} note="Drag the divider to see what changed" />
      <section className="sb-section">
        <div className="studio-sub"><h2>More ways to edit</h2></div>
        <FormatGrid list={more} onOpen={(f) => openFormat(f)} />
      </section>
      <section className="sb-section">
        <div className="studio-sub"><h2>My projects</h2></div>
        <Empty title="No projects yet">Edits you make here are saved as projects once editing is wired.</Empty>
      </section>
    </main>
  )
}
