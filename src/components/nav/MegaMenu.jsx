import { ArtImage } from '../Art.jsx'
import { toolArt, modelArt } from '../../lib/formats/art.js'
import { forwardRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ToolIcon, ModelIcon } from './ToolIcon.jsx'
import { currentIn, modelRoute } from './navModel.js'

export const Badge = ({ badge }) => badge ? <em className={`nav-badge ${badge.toLowerCase()}`}>{badge}</em> : null

// One row in a menu: icon tile (badge on its corner, as on Higgsfield), name and one line.
export function MenuItem({ to, icon, name, line, badge, on, art, ...rest }) {
  return (
    <Link to={to} className={`mega-item${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined} {...rest}>
      <span className="mega-icon">{icon}{art && <ArtImage src={art} />}<Badge badge={badge} /></span>
      <span className="mega-text"><strong>{name}</strong>{line && <small>{line}</small>}</span>
    </Link>
  )
}

export function menuColumns(menu) {
  return [
    { id: 'tools', label: 'Tools', items: menu.tools.map((t) => ({ id: t.id, to: t.route, name: t.name, line: t.blurb, badge: t.badge, art: toolArt(t.id), icon: <ToolIcon id={t.id} /> })) },
    { id: 'models', label: 'Open-weight models', items: menu.models.map((m) => ({ id: m.id, to: modelRoute(m), name: m.name, line: m.blurb, badge: m.badge, art: modelArt(m.kind, m.id), icon: <ModelIcon model={m} /> })) },
  ].filter((c) => c.items.length)
}

// Arrow keys move inside a column, left and right jump between columns at the same row.
function onKeys(e, panel, close) {
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); return }
  // Tab leaves the menu from its trigger, so focus carries on along the bar rather than past the header.
  if (e.key === 'Tab') { close(true); return }
  const el = e.target.closest('[data-col]')
  if (!el) return
  const col = Number(el.dataset.col)
  const row = Number(el.dataset.row)
  const items = (c) => [...panel.querySelectorAll(`[data-col="${c}"]`)]
  const here = items(col)
  const cols = panel.querySelectorAll('[data-colhead]').length
  let to
  if (e.key === 'ArrowDown') to = here[(row + 1) % here.length]
  else if (e.key === 'ArrowUp') to = here[(row - 1 + here.length) % here.length]
  else if (e.key === 'Home') to = here[0]
  else if (e.key === 'End') to = here[here.length - 1]
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const next = items((col + (e.key === 'ArrowRight' ? 1 : cols - 1)) % cols)
    to = next[Math.min(row, next.length - 1)]
  }
  if (to) { e.preventDefault(); to.focus() }
}

// Higgsfield's mega-menu: a tools column and a models column under the bar.
const MegaMenu = forwardRef(function MegaMenu({ menu, id, labelledBy, onClose, onNavigate, ...pointer }, ref) {
  const { pathname, search } = useLocation()
  const current = currentIn(menu, pathname, search)
  return (
    <div ref={ref} id={id} className="mega pop" role="menu" aria-labelledby={labelledBy}
      onKeyDown={(e) => onKeys(e, ref.current, onClose)} {...pointer}>
      <div className="mega-cols" key={menu.id}>
        {menuColumns(menu).map((c, ci) => (
          <div key={c.id} className="mega-col" role="group" aria-label={c.label}>
            <h6 aria-hidden="true" data-colhead>{c.label}</h6>
            {c.items.map((it, r) => (
              <MenuItem key={it.id} {...it} on={it.id === current} role="menuitem" tabIndex={-1}
                data-col={ci} data-row={r} onClick={onNavigate} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})

export default MegaMenu
