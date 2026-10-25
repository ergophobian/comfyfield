import { useEffect } from 'react'
import { useSpend } from '../lib/spendCap.js'
import { money } from '../lib/cost.js'

// Asks before a run takes the session past the spend cap set in Connections.
export default function SpendAsk() {
  const { question: q } = useSpend()
  useEffect(() => {
    if (!q) return
    const keys = (e) => e.key === 'Escape' && q.answer(false)
    document.addEventListener('keydown', keys)
    return () => document.removeEventListener('keydown', keys)
  }, [q])
  if (!q) return null
  const runs = q.runs === 1 ? 'This run costs' : `These ${q.runs} runs cost`
  return (
    <div className="viewer" onClick={() => q.answer(false)} role="dialog" aria-modal="true" aria-label="Spend cap">
      <div className="form-sheet glass pop spend-ask" onClick={(e) => e.stopPropagation()}>
        <h3>Run past your spend cap?</h3>
        <p>{runs} about {money(q.usd)}. {q.spent > 0 ? `This session has spent about ${money(q.spent)} of your ${money(q.cap)} cap.` : `Your cap for this session is ${money(q.cap)}.`}</p>
        <p className="muted">Estimates are approximate. Change the cap in Connections.</p>
        <div className="form-sheet-foot">
          <span className="grow" />
          <button type="button" className="btn-soft" onClick={() => q.answer(false)}>Cancel</button>
          <button type="button" className="btn-blue sm" autoFocus onClick={() => q.answer(true)}>Run anyway</button>
        </div>
      </div>
    </div>
  )
}
