import { Link } from 'react-router-dom'
import { IconClose } from '../Icons.jsx'
import { useLibrary, toRef } from '../../lib/useLibrary.js'

export const groups = [
  ['character', 'characters', 'Characters'],
  ['product', 'products', 'Products'],
  ['brand', 'brands', 'Brand kits'],
]

// A brand kit rides along as its logo; characters and products as their first photos.
export const refOf = (type, item) => (type === 'brand' ? { ...toRef(type, item), images: item.logo ? [item.logo] : [] } : toRef(type, item))

// Menu body for the @ button and the Elements chip: saved characters, products and brand kits to attach.
export function LibraryPicks({ refs, setRefs, maxImages = Infinity }) {
  const lib = useLibrary()
  const filled = groups.filter(([, list]) => lib[list]?.length)
  const toggle = (type, item) => setRefs((rs) => (rs.some((r) => r.id === item.id) ? rs.filter((r) => r.id !== item.id) : [...rs, refOf(type, item)]))
  return (
    <>
      {!lib.ready && <p className="menu-note">Loading Assets</p>}
      {lib.ready && !filled.length && <p className="menu-note">Nothing saved yet. Save a character, product or brand kit and pull it in here.</p>}
      {filled.map(([type, list, title]) => (
        <div key={type}>
          <h6>{title}</h6>
          {lib[list].map((x) => {
            const on = refs.some((r) => r.id === x.id)
            const img = type === 'brand' ? x.logo : x.images?.[0]
            const full = !on && img && refs.filter((r) => r.images?.length).length >= maxImages
            return (
              <button key={x.id} type="button" className={`gen-lib${on ? ' on' : ''}`} aria-pressed={on} disabled={Boolean(full)} onClick={() => toggle(type, x)}>
                <span className={`gen-lib-img${type === 'brand' ? ' logo' : ''}`}>{img ? <img src={img} alt="" /> : x.name?.[0]}</span>
                <span className="gen-lib-text">{x.name}{on && <small>Added, click to remove</small>}</span>
              </button>
            )
          })}
        </div>
      ))}
      <Link className="link-btn menu-foot" to={`/assets?tab=${filled[0]?.[1] || 'characters'}`}>{filled.length ? 'Open Assets' : 'Add one in Assets'}</Link>
    </>
  )
}

// Chosen Library items, shown as removable tags.
export function RefTags({ refs, setRefs }) {
  if (!refs.length) return null
  return (
    <div className="refs">
      {refs.map((r) => (
        <span key={r.id} className="ref pop">
          {r.images[0] && <img src={r.images[0]} alt="" />}{r.name}
          <button type="button" aria-label={`Remove ${r.name}`} onClick={() => setRefs((rs) => rs.filter((x) => x.id !== r.id))}><IconClose /></button>
        </span>
      ))}
    </div>
  )
}
