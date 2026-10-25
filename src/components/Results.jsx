import UseIn from './formats/UseIn.jsx'
import ModelView from './ModelView.jsx'
import { useApp } from '../lib/appContext.js'
import { takeLabel, usePod } from '../lib/usePod.js'

const ratio = (a) => (/^\d+:\d+$/.test(a) ? a.replace(':', ' / ') : '1 / 1')

// Finished and rendering generations. "Use in" opens a format with the result attached, through the app's shared sheet
// unless the page passes its own onUse. size 'large' shows bigger tiles.
export default function Results({ items, onUse, size }) {
  const app = useApp()
  const { status } = usePod()
  const use = onUse || app?.openFormat
  return (
    <div className={`results${size === 'large' ? ' large' : ''}`}>
      {items.map((it) => (
        <div key={it.id} className={`result glass${it.pending ? ' pending' : ''}${it.kind === 'audio' ? ' audio' : ''}`}
          style={{ '--ar': it.kind === 'audio' ? '2 / 1' : ratio(it.aspect) }}>
          {it.pending ? <span>{takeLabel(it, status) || `Rendering with ${it.model}`}</span>
            : it.kind === 'video' ? <video src={it.url} autoPlay loop muted playsInline controls />
            : it.kind === '3d' ? <ModelView url={it.url} alt={it.caption} />
            : it.kind === 'audio' ? <div className="audio-card"><p>{it.caption}</p><audio src={it.url} controls /></div>
            : <a href={it.url} target="_blank" rel="noreferrer"><img src={it.url} alt={it.caption} /></a>}
          {!it.pending && it.kind !== 'audio' && <div className="result-cap">{it.model} · {it.caption}</div>}
          {use && !it.pending && it.url && it.kind !== 'audio' && <UseIn item={it} onUse={use} />}
        </div>
      ))}
    </div>
  )
}
