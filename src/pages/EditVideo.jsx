import { useRef } from 'react'
import FormatWorkspace from '../components/formats/Workspace.jsx'
import { Hero, Box, Cards, useParam } from '../components/studiob/Kit.jsx'
import { formatById } from '../lib/formats/index.js'

const edits = [
  { id: 'edit-video', label: 'Edit by text', note: 'Describe a change, with an optional reference' },
  { id: 'video-erase', label: 'Remove an object', note: 'Name what to erase from the clip' },
  { id: 'video-bg-remove', label: 'Remove the background', note: 'Transparent, green screen or a new scene' },
  { id: 'video-character-swap', label: 'Swap a character', note: 'A new character, same moves and timing' },
  { id: 'reshoot', label: 'New angle', note: 'The same take from another camera' },
  { id: 'color-grade', label: 'Color grade', note: 'Give the whole clip a film look' },
]

export default function EditVideo() {
  const inputCache = useRef({})
  const [edit, setEdit] = useParam('edit', edits.map((e) => e.id))
  const format = formatById(edit)

  return (
    <main className="sb-page">
      <Hero badge="Edit video" title="Change a video without reshooting it"
        sub="Upload a clip, pick an edit and set its controls. The clip's start and end times travel with the run." />
      <Box label="Edit"><Cards options={edits} value={edit} onChange={setEdit} label="Edit" /></Box>
      <FormatWorkspace key={format.id} format={format} showMore={false} inputCache={inputCache} />
    </main>
  )
}
