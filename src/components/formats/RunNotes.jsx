import { studioLimitNote } from '../../lib/studioLimits.js'

export default function RunNotes({ format, values }) {
  const limit = studioLimitNote(format, values)
  return <>
    {format.limits && <p className="sheet-limits"><strong>Good to know</strong> {format.limits}</p>}
    {format.availabilityNote && <p className="sheet-note" role="status">{format.availabilityNote}</p>}
    {format.info && <p className="sheet-note format-info"><strong>{format.info.attribution}</strong><br />{format.info.text} <a href={format.info.url} target="_blank" rel="noreferrer">Read the license</a></p>}
    {limit && <p className="sheet-note format-limit" role="status">{limit}</p>}
  </>
}
