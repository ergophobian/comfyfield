import { useRef } from 'react'
import Segmented from '../components/Segmented.jsx'
import FormatWorkspace from '../components/formats/Workspace.jsx'
import { Hero, Box, Pills, useParam } from '../components/studiob/Kit.jsx'
import { formatById } from '../lib/formats/index.js'

export default function LipsyncStudio() {
  const inputCache = useRef({})
  const [kind, setKind] = useParam('kind', ['image', 'video'])
  const format = formatById(kind === 'video' ? 'lipsync' : 'talking-head')

  return (
    <main className="sb-page">
      <Hero badge="Lipsync studio" title="Make a face talk"
        sub="Start from a photo or a video and add speech. InfiniteTalk makes about 480p and covers the first 30 seconds.">
        <Segmented value={kind} onChange={setKind} options={[{ value: 'image', label: 'Photo' }, { value: 'video', label: 'Video' }]} />
      </Hero>
      <Box label="Resolution">
        <Pills options={[{ id: '480', label: 'About 480p' }, { id: '720', label: '720p unavailable', disabled: true }]} value="480" onChange={() => {}} label="Resolution" />
        <p className="sheet-note">720p needs an InfiniteTalk model we do not have. Wan 2.2 S2V is not wired yet because its workflow is missing.</p>
      </Box>
      {kind === 'video' && <p className="sheet-note">Video lipsync needs recorded audio. Use Photo to speak a typed script.</p>}
      <FormatWorkspace key={format.id} format={format} showMore={false} inputCache={inputCache} />
    </main>
  )
}
