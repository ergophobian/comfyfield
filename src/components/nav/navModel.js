import { menus, tools, toolsIn, modelsFor, toolById } from '../../lib/tools.js'

// The top bar, left to right, mirroring Higgsfield's: Explore, the three media menus, then studios and your work.
const link = (id, name) => {
  const t = toolById(id)
  return { id, name: name || t.name, to: t.route, badge: t.badge }
}
export const barItems = [
  link('explore'),
  ...menus.map((m) => ({ ...m, menu: m.id })),
  link('apps'),
  { id: 'div', divider: true },
  link('cinema-studio'),
  link('influencer'),
  link('ads'),
  link('assets'),
  link('canvas'),
]

// Studio pages the bar has no room for; the mobile menu lists them under More.
const inBar = new Set(barItems.map((b) => b.id))
export const moreTools = toolsIn('studio').filter((t) => !inBar.has(t.id))

// Canvas is declared with the image tools; in the video menu Higgsfield lists it after Explainer.
const placeAfter = { video: { canvas: 'explainer' } }
const ordered = (id) => {
  const list = toolsIn(id)
  for (const [tool, anchor] of Object.entries(placeAfter[id] || {})) {
    const t = list.find((x) => x.id === tool)
    if (!t || !list.some((x) => x.id === anchor)) continue
    list.splice(list.indexOf(t), 1)
    list.splice(list.findIndex((x) => x.id === anchor) + 1, 0, t)
  }
  return list
}

export const menuOf = (id) => {
  const m = menus.find((x) => x.id === id)
  return m && { ...m, tools: ordered(id), models: modelsFor(id) }
}

export const modelRoute = (m) => `/${m.kind}?model=${m.id}`

const pathOf = (route) => route.split('?')[0]

// -1 when the route does not match the location, otherwise how many of its query params matched.
export function routeScore(route, pathname, search) {
  const [path, query = ''] = route.split('?')
  if (path !== pathname) return -1
  const now = new URLSearchParams(search)
  let n = 0
  for (const [k, v] of new URLSearchParams(query)) {
    if (now.get(k) !== v) return -1
    n++
  }
  return n
}

// Which bar item the current page belongs to. Direct links win, then the menu with the closest tool route.
export function sectionOf(pathname, search) {
  const direct = barItems.find((b) => b.to && (b.to === '/' ? pathname === '/'
    : pathname === pathOf(b.to) || pathname.startsWith(`${pathOf(b.to)}/`)))
  if (direct) return direct.id
  let best = null
  let score = -1
  for (const m of menus) {
    for (const t of toolsIn(m.id)) {
      const n = routeScore(t.route, pathname, search)
      if (n > score) { score = n; best = m.id }
    }
  }
  if (best) return best
  const kind = pathname.slice(1)
  return menus.some((m) => m.id === kind) ? kind : null
}

// The one tool or model in a menu that matches the location, so it can show as current.
export function currentIn(menu, pathname, search) {
  const model = new URLSearchParams(search).get('model')
  if (model && pathname === `/${menu.id}` && menu.models.some((m) => m.id === model)) return model
  let best = null
  let score = -1
  for (const t of menu.tools) {
    const n = routeScore(t.route, pathname, search)
    if (n > score) { score = n; best = t.id }
  }
  return best
}

export const allTools = tools.filter((t) => t.id !== 'explore')
