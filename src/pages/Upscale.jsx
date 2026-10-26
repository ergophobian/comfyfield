import { useRef } from 'react'
import Segmented from '../components/Segmented.jsx'
import FormatWorkspace from '../components/formats/Workspace.jsx'
import { Hero, Cards, Box, Compared, useParam } from '../components/studiob/Kit.jsx'
import { useApp } from '../lib/appContext.js'
import { formatById } from '../lib/formats/index.js'

// Image upscales from the format sheet, shown on a before and after slider.
const upscales = ['image-upscale', 'upscale', 'unblur']
const edits = [
  { id: 'image-upscale', label: 'Upscale', note: 'Faithful with RealESRGAN, or Enhance with SeedVR2' },
  { id: 'unblur', label: 'Unblur', note: 'Recover detail with SeedVR2 and choose the output size' },
]

export default function Upscale() {
  const inputCache = useRef({})
  const [kind, setKind] = useParam('kind', ['image', 'video'])
  const [edit, setEdit] = useParam('edit', edits.map((e) => e.id))
  const format = formatById(kind === 'video' ? 'video-upscale' : edit)
  const { gens } = useApp()
  const upscaled = gens.items.filter((it) => upscales.includes(it.formatId) && it.kind === 'image' && it.source && it.url && !it.pending).slice(0, 6)

  return (
    <main className="sb-page">
      <Hero badge="Upscale" title="Sharper pictures and videos"
        sub="Raise the resolution and bring back detail. Choose a scale for upscaling, or an output size for unblur.">
        <Segmented value={kind} onChange={setKind} options={[{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]} />
      </Hero>
      {kind === 'image' && <Box label="Image tool"><Cards options={edits} value={edit} onChange={setEdit} label="Image tool" /></Box>}
      <FormatWorkspace key={format.id} format={format} showMore={false} inputCache={inputCache} />
      {kind === 'image' && <Compared items={upscaled} note="Drag the divider to see the detail it added" />}
    </main>
  )
}
