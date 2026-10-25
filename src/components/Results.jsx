import { useRef, useState } from 'react'
import UseIn from './formats/UseIn.jsx'
import Viewer, { Act, ext } from './Viewer.jsx'
import { useApp } from '../lib/appContext.js'
import { takeLabel, usePod } from '../lib/usePod.js'
import { IconCheck, IconDownload, IconTrash } from './Icons.jsx'
import { progressText } from '../lib/jobs.js'
import ProgressBar from './ProgressBar.jsx'

const ratio = (a) => (/^\d+:\d+$/.test(a) ? a.replace(':', ' / ') : '1 / 1')
const viewable = (it) => !it.pending && it.url && it.kind !== 'audio'

// Finished and rendering generations. A finished image or video opens in the viewer. "Use in" opens a format with the
// result attached, through the app's shared sheet unless the page passes its own onUse. size 'large' shows bigger tiles.
export default function Results({ items, onUse, size }) {
  const app = useApp()
  const { status } = usePod()
  const use = onUse || app?.openFormat
  const shown = items.filter(viewable)
  // Track the open result by id, so new results arriving above it do not move the viewer. If it is deleted, stay at its place.
  const [open, setOpen] = useState(null)
  const found = open ? shown.findIndex((it) => it.id === open.id) : -1
  const at = found >= 0 || !open ? found : Math.min(open.i, shown.length - 1)
  const show = (it) => setOpen({ id: it.id, i: shown.indexOf(it) })
  // The viewer's key handler keeps the first step it was given, so read the current list and place from a ref.
  const live = useRef()
  live.current = { shown, at }
  const step = (next) => {
    const { shown: list, at: from } = live.current
    const i = typeof next === 'function' ? next(from) : next
    setOpen(list[i] ? { id: list[i].id, i } : null)
  }
  // Clicks on the tile's own controls do their own job, not open the viewer.
  const onTile = (e, it) => !e.target.closest('.use-in, .lib-acts') && show(it)
  return (
    <div className={`results${size === 'large' ? ' large' : ''}`}>
      {items.map((it) => (
        <div key={it.id} className={`result glass${it.pending ? ' pending' : ''}${it.failed ? ' failed' : ''}${it.kind === 'audio' ? ' audio' : ''}${viewable(it) ? ' opens' : ''}${it.restoreNote ? ' restored' : ''}`}
          style={{ '--ar': it.kind === 'audio' ? '2 / 1' : ratio(it.aspect) }}
          {...(viewable(it) && {
            role: 'button', tabIndex: 0, 'aria-label': `Open ${it.caption || 'result'}`, onClick: (e) => onTile(e, it),
            onKeyDown: (e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(it) } },
          })}>
          {it.pending ? (
            <span className="result-wait">
              {takeLabel(it, status) || progressText(it.progress) || (it.started || it.jobs ? `Rendering with ${it.model}` : 'Queued')}
              {!takeLabel(it, status) && <ProgressBar progress={it.progress} />}
              {it.restoreNote && <small>{it.restoreNote}</small>}
              {app?.gens?.cancel && <button type="button" className="btn-soft xs" onClick={() => app.gens.cancel(it.id)}>Cancel</button>}
            </span>
          ) : it.failed ? (
            <span className="result-fail">
              <strong>{it.model} failed</strong>
              {typeof it.failed === 'string' && <small title={it.failed}>{it.failed}</small>}
              {it.restoreNote && <small>{it.restoreNote}</small>}
              <span className="result-fail-acts">
                {it.retry && <button type="button" className="btn-soft xs" onClick={it.retry}>{it.retry.label || 'Retry'}</button>}
                {app?.gens && <button type="button" className="btn-soft xs" onClick={() => app.gens.dismiss(it.id)}>Dismiss</button>}
              </span>
            </span>
          ) : it.kind === 'video' ? <video src={it.url} autoPlay loop muted playsInline />
            : it.kind === 'audio' ? <div className="audio-card"><p>{it.caption}</p>{it.restoreNote && <small>{it.restoreNote}</small>}<audio src={it.url} controls /></div>
            : <img src={it.url} alt={it.caption} />}
          {viewable(it) && <div className="result-cap">{it.model} · {it.caption}{it.restoreNote && <div>{it.restoreNote}</div>}</div>}
          {viewable(it) && app?.gens && (
            <div className="lib-acts">
              <Act label={it.approved ? 'Remove approval' : 'Approve'} on={it.approved} onClick={() => app.gens.toggleApprove(it.id)}><IconCheck /></Act>
              <a className="lib-act" href={it.url} download={`${it.id}.${ext[it.kind] || 'png'}`} aria-label="Download" title="Download" onClick={(e) => e.stopPropagation()}><IconDownload /></a>
              <Act label="Delete" onClick={() => app.gens.dismiss(it.id)}><IconTrash /></Act>
            </div>
          )}
          {use && viewable(it) && <UseIn item={it} onUse={use} />}
        </div>
      ))}
      {at >= 0 && <Viewer items={shown} at={at} setAt={step} onClose={() => setOpen(null)} />}
    </div>
  )
}
