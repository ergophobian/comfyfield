import { useRef } from 'react'
import Segmented from '../components/Segmented.jsx'
import FormatWorkspace from '../components/formats/Workspace.jsx'
import { Hero, Cards, Box, useParam } from '../components/studiob/Kit.jsx'
import { formatById } from '../lib/formats/index.js'

const edits = [
  { id: 'image-upscale', label: 'Upscale', note: 'Faithful with RealESRGAN, or Enhance with SeedVR2' },
  { id: 'unblur', label: 'Unblur', note: 'Recover detail with SeedVR2 and choose the output size' },
]

export default function Upscale() {
  const inputCache = useRef({})
  const [kind, setKind] = useParam('kind', ['image', 'video'])
  const [edit, setEdit] = useParam('edit', edits.map((e) => e.id))
  const format = formatById(kind === 'video' ? 'video-upscale' : edit)

  return (
    <main className="sb-page">
      <Hero badge="Upscale" title="Sharper pictures and videos"
        sub="Raise the resolution and bring back detail. Choose a scale for upscaling, or an output size for unblur.">
        <Segmented value={kind} onChange={setKind} options={[{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]} />
      </Hero>
      {kind === 'image' && <Box label="Image tool"><Cards options={edits} value={edit} onChange={setEdit} label="Image tool" /></Box>}
      <FormatWorkspace key={format.id} format={format} showMore={false} inputCache={inputCache} />
    </main>
  )
}
