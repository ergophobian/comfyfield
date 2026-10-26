import { studioLimitNote } from '../../lib/studioLimits.js'

export default function RunNotes({ format, values }) {
  const limit = studioLimitNote(format, values)
  return <>
    {format.info && <p className="sheet-note format-info"><strong>{format.info.attribution}</strong><br />{format.info.text} <a href={format.info.url} target="_blank" rel="noreferrer">Read the license</a></p>}
    {limit && <p className="sheet-note format-limit" role="status">{limit}</p>}
  </>
}
