import { useRef, useState } from 'react'
import { useLibrary } from '../../lib/useLibrary.js'
import { groups } from './Library.jsx'

// The @ the caret is in, if any: an @ at the start or after a space, then up to 30 characters with no line break.
function mentionAt(text, caret) {
  const before = text.slice(0, caret)
  const at = before.lastIndexOf('@')
  if (at < 0 || (at > 0 && !/\s/.test(before[at - 1]))) return null
  const query = before.slice(at + 1)
  if (query.length > 30 || /[\n@]/.test(query)) return null
  return { at, query }
}

// A prompt box where typing @ lists saved Library elements. Picking one writes @Name into the prompt and calls
// onPick(type, item, nextText), so the page attaches the element and keeps the new text in one update.
// types limits the list, e.g. ['character'] for Cinema's cast. up opens the list above the box.
export default function MentionText({ value, onChange, onPick, types = ['character', 'product', 'brand'], up, onKeyDown, ...props }) {
  const lib = useLibrary()
  const box = useRef(null)
  const [found, setFound] = useState(null)
  const [hi, setHi] = useState(0)

  const options = found
    ? groups.filter(([type]) => types.includes(type))
      .flatMap(([type, list]) => (lib[list] || []).map((item) => ({ type, item })))
      .filter(({ item }) => item.name?.toLowerCase().includes(found.query.toLowerCase()))
      .slice(0, 8)
    : []
  const open = found && options.length > 0

  const look = (el) => { setFound(mentionAt(el.value, el.selectionStart)); setHi(0) }
  const pick = ({ type, item }) => {
    const tag = `@${item.name} `
    const caret = found.at + 1 + found.query.length
    const next = value.slice(0, found.at) + tag + value.slice(caret).replace(/^ /, '')
    setFound(null)
    onPick(type, item, next)
    requestAnimationFrame(() => {
      const el = box.current
      if (!el) return
      el.focus()
      el.setSelectionRange(found.at + tag.length, found.at + tag.length)
    })
  }
  const keys = (e) => {
    if (open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        setHi((i) => (i + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pick(options[hi]); return }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setFound(null); return }
    }
    onKeyDown?.(e)
  }

  return (
    <div className={`mention${up ? ' up' : ''}`}>
      <textarea ref={box} value={value} {...props} onKeyDown={keys} role="combobox" aria-expanded={Boolean(open)} aria-autocomplete="list"
        onChange={(e) => { onChange(e.target.value); look(e.target) }}
        onClick={(e) => look(e.target)} onBlur={() => setTimeout(() => setFound(null), 150)} />
      {open && (
        <div className="menu glass pop mention-menu" role="listbox" aria-label="Elements from Library">
          {options.map((o, i) => {
            const img = o.type === 'brand' ? o.item.logo : o.item.images?.[0]
            return (
              <button key={o.item.id} type="button" role="option" aria-selected={i === hi} className={`gen-lib${i === hi ? ' on' : ''}`}
                onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setHi(i)} onClick={() => pick(o)}>
                <span className={`gen-lib-img${o.type === 'brand' ? ' logo' : ''}`}>{img ? <img src={img} alt="" /> : o.item.name?.[0]}</span>
                <span className="gen-lib-text">{o.item.name}<small>{groups.find(([t]) => t === o.type)[2].replace(/s$/, '')}</small></span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
