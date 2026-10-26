import { takeLabel, usePod } from '../lib/usePod.js'
import CreditsLink from './CreditsLink.jsx'
import { progressText } from '../lib/jobs.js'
import ProgressBar from './ProgressBar.jsx'

const ratio = (a) => (/^\d+:\d+$/.test(a) ? a.replace(':', ' / ') : '1 / 1')

function Take({ it, onApprove, onDismiss }) {
  const { status } = usePod()
  return (
    <div className={`take${it.pending ? ' pending' : ''}${it.approved ? ' approved' : ''}${it.failed ? ' failed' : ''}`} style={{ '--ar': ratio(it.aspect) }}>
      {it.failed ? (
        <span className="take-msg">
          Failed
          {typeof it.failed === 'string' && <small title={it.failed}>{it.failed}</small>}
          <span className="take-acts">
            <CreditsLink message={it.failed} />
            {it.retry && <button type="button" onClick={it.retry}>{it.retry.label || 'Retry'}</button>}
            <button type="button" onClick={() => onDismiss(it.id)}>Dismiss</button>
          </span>
        </span>
      )
        : it.pending ? <span className="take-msg">{takeLabel(it, status) || progressText(it.progress) || (it.started ? 'Rendering' : 'Queued')}{!takeLabel(it, status) && <ProgressBar progress={it.progress} />}</span>
        : it.kind === 'video' ? <video src={it.url} autoPlay loop muted playsInline />
        : it.kind === 'audio' ? <audio src={it.url} controls />
        : <img src={it.url} alt={it.caption} />}
      {!it.pending && !it.failed && (
        <button type="button" className="take-ok" onClick={() => onApprove(it.id)} aria-pressed={Boolean(it.approved)} aria-label="Approve take">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
        </button>
      )}
    </div>
  )
}

// Results of one batch, one row per prompt, takes side by side, approve the winners.
export default function Board({ items, batch, onApprove, onDismiss }) {
  const mine = items.filter((i) => i.batch === batch.id)
  // An upscaled copy sits beside its take but is not one of the takes the batch counts.
  const done = mine.filter((i) => !i.pending && !i.upscaled).length
  const approved = mine.filter((i) => i.approved)
  const rows = batch.prompts.map((p, r) => ({ p, takes: mine.filter((i) => i.row === r).reverse() }))

  return (
    <section className="board glass">
      <header className="board-head">
        <div>
          <strong>{batch.prompts.length} prompts · {batch.total} {batch.kind === 'image' ? 'images' : batch.kind === 'audio' ? 'clips' : 'videos'}</strong>
          <span>{batch.model}</span>
        </div>
        <div className="board-progress">
          <span>{done} of {batch.total} done{approved.length ? ` · ${approved.length} approved` : ''}</span>
          <i style={{ '--p': `${(done / batch.total) * 100}%` }} />
        </div>
      </header>
      {rows.map(({ p, takes }, r) => (
        <div className="board-row" key={r} style={{ '--i': Math.min(r, 12) }}>
          <div className="board-prompt"><span>{r + 1}</span><p>{p}</p></div>
          <div className="board-takes">
            {takes.map((t) => <Take key={t.id} it={t} onApprove={onApprove} onDismiss={onDismiss} />)}
          </div>
        </div>
      ))}
    </section>
  )
}
