import { IconClose, IconPlus } from '../Icons.jsx'
import { IconUp, IconDown } from './icons.jsx'
import Pop from './Pop.jsx'

export const MAX_SHOTS = 6
const lengths = [1, 2, 3, 4, 5, 6, 8, 10]
let seq = 0
export const newShot = (len = 3) => ({ id: ++seq, text: '', len })

export const shotsTotal = (shots) => shots.reduce((n, s) => n + s.len, 0)

// One prompt for the whole sequence: numbered shots with their lengths, cut together.
export const shotsPrompt = (shots) => {
  const used = shots.filter((s) => s.text.trim())
  if (!used.length) return ''
  return `A multi-shot sequence with clean cuts between shots. ${used.map((s, i) => `Shot ${i + 1}, ${s.len} seconds: ${s.text.trim().replace(/\.$/, '')}.`).join(' ')}`
}

// Snaps the sequence to the nearest length the model renders, ties going longer.
export const snapDuration = (total, durations) => (durations.length
  ? durations.reduce((best, d) => (Math.abs(d - total) < Math.abs(best - total) || (Math.abs(d - total) === Math.abs(best - total) && d > best) ? d : best))
  : total)

// Higgsfield's custom multi-shot: each shot has its own prompt and length, and can be moved or removed.
export default function ShotList({ shots, setShots }) {
  const set = (id, patch) => setShots((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const move = (i, by) => setShots((ss) => {
    const next = [...ss]
    const [s] = next.splice(i, 1)
    next.splice(i + by, 0, s)
    return next
  })
  const remove = (id) => setShots((ss) => (ss.length > 1 ? ss.filter((s) => s.id !== id) : ss))
  return (
    <div className="shots">
      <ol>
        {shots.map((s, i) => (
          <li key={s.id} className="shot rise" style={{ '--d': `calc(${Math.min(i, 12)} * var(--stagger))` }}>
            <div className="shot-head">
              <span className="plist-n">{i + 1}</span>
              <Pop label={`${s.len}s`} title="Shot length" className="shot-len">
                {lengths.map((n) => (
                  <button key={n} type="button" className={n === s.len ? 'on' : ''} onClick={() => set(s.id, { len: n })}>{n} {n === 1 ? 'second' : 'seconds'}</button>
                ))}
              </Pop>
              <span className="shot-acts">
                <button type="button" aria-label={`Move shot ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}><IconUp /></button>
                <button type="button" aria-label={`Move shot ${i + 1} down`} disabled={i === shots.length - 1} onClick={() => move(i, 1)}><IconDown /></button>
                <button type="button" aria-label={`Remove shot ${i + 1}`} disabled={shots.length === 1} onClick={() => remove(s.id)}><IconClose /></button>
              </span>
            </div>
            <textarea rows={2} value={s.text} onChange={(e) => set(s.id, { text: e.target.value })}
              placeholder={i === 0 ? 'Opening shot, e.g. a wide view of the harbor at dawn' : 'What happens next'} aria-label={`Shot ${i + 1} prompt`} />
          </li>
        ))}
      </ol>
      <button type="button" className="btn-soft sm" disabled={shots.length >= MAX_SHOTS} onClick={() => setShots((ss) => [...ss, newShot(2)])}>
        <IconPlus />{shots.length >= MAX_SHOTS ? `Up to ${MAX_SHOTS} shots` : 'Add shot'}
      </button>
    </div>
  )
}
