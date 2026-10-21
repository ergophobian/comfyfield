import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconClose } from '../Icons.jsx'
import { IconBook } from './icons.jsx'

const KEY = 'comfyfield.tips'

const hiddenTips = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(list) ? list : []
  } catch { return [] }
}

// The "where do I start" pill on a tool page. It opens the page's How it works (onLearn) or a guide (to).
// Hiding it is remembered per page.
export default function Tip({ page, onLearn, to, text = 'See how this page works, step by step.' }) {
  const [shown, setShown] = useState(() => !hiddenTips().includes(page))
  if (!shown) return null
  const hide = () => {
    setShown(false)
    try { localStorage.setItem(KEY, JSON.stringify([...new Set([...hiddenTips(), page])])) } catch {}
  }
  return (
    <aside className="tip glass rise" aria-label="Tip">
      <span className="tip-icon" aria-hidden="true"><IconBook /></span>
      <div>
        <strong>New to this tool?</strong>
        <span>{text}</span>
      </div>
      {to ? <Link to={to} className="btn-blue xs">Show me</Link> : <button type="button" className="btn-blue xs" onClick={onLearn}>Show me</button>}
      <button type="button" className="icon-btn tip-close" aria-label="Hide this tip" onClick={hide}><IconClose /></button>
    </aside>
  )
}

// Brings an on-page How it works section into view, without the glide when motion is reduced.
export const scrollToHow = (id) => () => {
  const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' })
}
