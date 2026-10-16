import { useEffect, useRef, useState } from 'react'

function Chip({ icon, label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  return (
    <div className="chip" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)}>{icon}{label}</button>
      {open && (
        <div className="menu">
          {options.map((o) => (
            <button key={o.value} type="button" className={o.value === value ? 'on' : ''}
              onClick={() => { onChange(o.value); setOpen(false) }}>
              {o.label}{o.note && <small>{o.note}</small>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Composer({ prompt, setPrompt, placeholder, chips, onGenerate, busy }) {
  const submit = (e) => {
    e.preventDefault()
    if (prompt.trim() && !busy) onGenerate()
  }
  return (
    <div className="composer-wrap">
      <form className="composer" onSubmit={submit}>
        <div className="composer-main">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit(e)}
            placeholder={placeholder}
            rows={2}
          />
          <div className="chips">{chips.map((c) => <Chip key={c.key} {...c} />)}</div>
        </div>
        <button className="generate" disabled={!prompt.trim() || busy}>
          {busy ? 'Generating' : 'Generate'}
        </button>
      </form>
    </div>
  )
}
