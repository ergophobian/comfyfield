// Grouping and lookup helpers for the Apps, Effects, Motion and Mixed media pages. Everything reads the format data.
import { appsIn, categories, formats, hubs, userFormats, yoursHub } from '../../lib/formats/index.js'

const media = ['image', 'video', 'audio', 'draw', 'mask', 'face', 'crop']
// An input marked main: false (an optional style reference) stays in the settings panel, out of the stage.
export const mainInput = (format) => format.inputs.find((i) => media.includes(i.type) && i.main !== false)

export const matches = (f, q) => !q || `${f.name} ${f.blurb} ${f.runsOn || ''}`.toLowerCase().includes(q)

// Higgsfield's hubs that have apps. Until formats name a hub, the categories stand in so the page is never blank.
// Imported formats come first, as "Yours".
export function appGroups() {
  const yours = userFormats().length ? [{ ...yoursHub, list: userFormats() }] : []
  const fromHubs = hubs.map((h) => ({ ...h, list: appsIn(h.id) })).filter((g) => g.list.length)
  if (fromHubs.length) return [...yours, ...fromHubs]
  return [...yours, ...categories.map((c) => ({ ...c, list: formats.filter((f) => f.category === c.id) })).filter((g) => g.list.length)]
}

const badgeOf = (f) => String(f.badge || '').toLowerCase()
export const badgeText = (f) => {
  const b = badgeOf(f)
  return b && b[0].toUpperCase() + b.slice(1)
}
export const isNew = (f) => badgeOf(f) === 'new' || f.group === 'New'
export const isTrending = (f) => ['trending', 'top'].includes(badgeOf(f)) || f.group === 'Trending' || Boolean(f.featured)

// Higgsfield's preset categories in the order its library lists them. A group sorts by its first word,
// so 'Basic' takes the place of 'Basic camera control'. Unknown groups keep their data order after these.
const presetOrder = ['effects', 'basic', 'epic', 'catch', 'mix', 'new', 'trending']
const rank = (name) => {
  const i = presetOrder.indexOf(name.toLowerCase().split(' ')[0])
  return i < 0 ? presetOrder.length : i
}
export function presetGroups(list) {
  const names = [...new Set(list.map((f) => f.group).filter(Boolean))]
  return names.sort((a, b) => rank(a) - rank(b)).map((name) => ({ name, list: list.filter((f) => f.group === name) }))
}

// Starting values handed to an app page: choice, count and text values from the query string,
// and any value (an uploaded clip, say) from router state.
export function valuesFrom(format, params, state) {
  const out = {}
  for (const i of format.inputs) {
    const v = params.get(i.id)
    if (v == null) continue
    if (i.type === 'choice' && i.options.some((o) => o.id === v)) out[i.id] = v
    else if (i.type === 'count' && i.options.includes(Number(v))) out[i.id] = Number(v)
    else if (i.type === 'text' || i.type === 'longtext') out[i.id] = v
  }
  const ids = new Set(format.inputs.map((i) => i.id))
  for (const [k, v] of Object.entries(state?.values || {})) if (ids.has(k)) out[k] = v
  return out
}

export const pathFor = (f) => (f.category === 'camera' ? `/motion/${f.id}` : `/apps/${f.id}`)
