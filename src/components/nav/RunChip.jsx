import { Link } from 'react-router-dom'
import { useApp } from '../../lib/appContext.js'

// How many generations are running, from any page. Library lists them all. On a phone only the number shows.
export default function RunChip() {
  const running = useApp()?.gens?.items.filter((i) => i.pending).length || 0
  return (
    <span className="run-chip-slot" aria-live="polite">
      {running > 0 && (
        <Link to="/assets" className="status run-chip pop" title="See them in Library" aria-label={`${running} running. See them in Library`}>
          {running}<span className="run-word">running</span>
        </Link>
      )}
    </span>
  )
}
