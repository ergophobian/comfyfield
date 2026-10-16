import { useEffect, useRef, useState } from 'react'

export function Chip({ icon, label, lit, children }) {
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
      <button type="button" className={lit ? 'lit' : ''} onClick={() => setOpen((o) => !o)}>{icon}{label}</button>
      {open && <div className="menu glass" onClick={(e) => e.target.closest('button') && setOpen(false)}>{children}</div>}
    </div>
  )
}

export function Option({ on, disabled, label, note, onClick }) {
  return (
    <button type="button" className={on ? 'on' : ''} disabled={disabled} onClick={onClick}>
      {label}{note && <small>{note}</small>}
    </button>
  )
}

export default function Composer({ kind, setKind, prompt, setPrompt, placeholder, chips, onGenerate, busy }) {
  const submit = (e) => {
    e.preventDefault()
    if (prompt.trim() && !busy) onGenerate()
  }
  return (
    <form className="composer glass" onSubmit={submit}>
      <div className="composer-inner">
        <div className="composer-main">
          <div className="seg" role="tablist">
            {['image', 'video', 'audio'].map((k) => (
              <button key={k} type="button" className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>
                {k[0].toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit(e)}
            placeholder={placeholder}
            rows={2}
          />
          <div className="chips">{chips}</div>
        </div>
        <button className="btn-blue" disabled={!prompt.trim() || busy}>
          {busy ? 'Generating' : 'Generate'}
        </button>
      </div>
    </form>
  )
}
