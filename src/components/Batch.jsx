import { useRef, useState } from 'react'
import { IconClose } from './Icons.jsx'

let seq = 0
const row = (text = '') => ({ id: ++seq, text })

// The prompt list for batch mode. Pasting several lines splits them into rows.
export default function PromptList({ rows, setRows, kind }) {
  const [idea, setIdea] = useState('')
  const [writing, setWriting] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [note, setNote] = useState(null)
  const file = useRef(null)

  const update = (id, text) => setRows((rs) => {
    const next = rs.map((r) => (r.id === id ? { ...r, text } : r))
    return next[next.length - 1].text.trim() ? [...next, row()] : next
  })
  const remove = (id) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : [row()]))
  const addMany = (lines) => setRows((rs) => [...rs.filter((r) => r.text.trim()), ...lines.map((t) => row(t)), row()])

  const onPaste = (e, id) => {
    const lines = e.clipboardData.getData('text').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) return
    e.preventDefault()
    setRows((rs) => rs.filter((r) => r.id !== id || r.text.trim()))
    addMany(lines)
  }

  const importCsv = async (f) => {
    const text = await f.text()
    // First column of each line, quotes stripped; skip a header row named "prompt".
    const lines = text.split(/\r?\n/).map((l) => l.split(',')[0].replace(/^"|"$/g, '').trim()).filter(Boolean)
    addMany(lines[0]?.toLowerCase() === 'prompt' ? lines.slice(1) : lines)
  }

  const write = async () => {
    if (!idea.trim()) return
    setWriting(true)
    setNote(null)
    try {
      const res = await fetch('/api/prompts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea, n: 6, kind }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      addMany(data.prompts)
      setAiOpen(false)
      setIdea('')
    } catch (e) {
      setNote(e.message)
    } finally {
      setWriting(false)
    }
  }

  return (
    <div className="plist">
      <ol className="plist-rows">
        {rows.map((r, i) => (
          <li key={r.id} className="plist-row">
            <span className="plist-n">{i + 1}</span>
            <input value={r.text} onChange={(e) => update(r.id, e.target.value)} onPaste={(e) => onPaste(e, r.id)}
              placeholder={i === rows.length - 1 ? (i ? 'Add another prompt' : 'First prompt, or paste a list') : ''} />
            {r.text && <button type="button" className="plist-x" onClick={() => remove(r.id)} aria-label="Remove prompt"><IconClose /></button>}
          </li>
        ))}
      </ol>
      <div className="plist-tools">
        <button type="button" className="btn-soft sm" onClick={() => setAiOpen((o) => !o)}>Write with AI</button>
        <button type="button" className="btn-soft sm" onClick={() => file.current?.click()}>Import CSV</button>
        <input ref={file} type="file" accept=".csv,.txt" hidden onChange={(e) => e.target.files[0] && importCsv(e.target.files[0])} />
        {rows.some((r) => r.text) && <button type="button" className="btn-soft sm" onClick={() => setRows([row()])}>Clear</button>}
      </div>
      {aiOpen && (
        <div className="plist-ai pop">
          <input value={idea} onChange={(e) => setIdea(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), write())}
            placeholder="One idea, e.g. a skincare brand's morning routine" autoFocus />
          <button type="button" className="btn-blue sm" onClick={write} disabled={writing || !idea.trim()}>{writing ? 'Writing' : 'Write 6'}</button>
        </div>
      )}
      {note && <p className="plist-note">{note}</p>}
    </div>
  )
}

export const newRows = () => [row()]
