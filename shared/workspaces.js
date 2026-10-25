// Workspaces: one per channel, brand or project. Plain JS so the app, the server and the checks share
// the same rules for what a workspace holds and how its content criteria join a prompt.

export const DEFAULT_WORKSPACE = 'default'
export const MAX_PINNED = 24
export const MAX_RULES = 12
// Criteria describe how a picture or a clip looks. Speech, music and sound read prompts word for word.
export const CRITERIA_KINDS = ['image', 'video']

const text = (v, max) => String(v ?? '').slice(0, max)
const list = (v, max, each) => (Array.isArray(v) ? v.map((x) => text(x, each).trim()).filter(Boolean).slice(0, max) : [])

export const blankWorkspace = (patch = {}) => ({
  name: '', avatar: '', description: '',
  criteria: { text: '', do: [], dont: [] },
  pinned: [], appendCriteria: true,
  ...patch,
})

export const defaultWorkspace = () => ({ id: DEFAULT_WORKSPACE, ...blankWorkspace({ name: 'Default', appendCriteria: false }), created: 0 })

// Keeps only known fields, with sizes capped. Missing fields stay missing so a PATCH changes only what it names.
export function cleanWorkspace(data = {}) {
  const out = {}
  if ('name' in data) out.name = text(data.name, 80).trim()
  if ('avatar' in data) out.avatar = /^(\/media\/|data:image\/|https?:)/.test(String(data.avatar || '')) ? text(data.avatar, 2000) : ''
  if ('description' in data) out.description = text(data.description, 600)
  if ('criteria' in data) {
    const c = data.criteria && typeof data.criteria === 'object' ? data.criteria : {}
    out.criteria = { text: text(c.text, 2000), do: list(c.do, MAX_RULES, 200), dont: list(c.dont, MAX_RULES, 200) }
  }
  if ('pinned' in data) out.pinned = [...new Set(list(data.pinned, MAX_PINNED, 80))]
  if ('appendCriteria' in data) out.appendCriteria = Boolean(data.appendCriteria)
  return out
}

// One line per part: the free text, then what to do, then what to avoid.
export function criteriaText(ws) {
  const c = ws?.criteria
  if (!c) return ''
  return [
    c.text?.trim(),
    c.do?.length ? `Do: ${c.do.join('; ')}.` : '',
    c.dont?.length ? `Do not: ${c.dont.join('; ')}.` : '',
  ].filter(Boolean).join('\n')
}

// The one rule for adding a workspace's criteria to a prompt. It runs again on retries and resumed
// runs, so a prompt that already ends with the criteria stays as it is.
export function withCriteria(prompt, ws, kind) {
  if (typeof prompt !== 'string' || !prompt.trim() || !ws?.appendCriteria || !CRITERIA_KINDS.includes(kind)) return prompt
  const block = criteriaText(ws)
  if (!block || prompt.endsWith(block)) return prompt
  return `${prompt.trimEnd()}\n\n${block}`
}

// Pinned formats first, in the order they were pinned; everything else keeps its order.
export function pinnedFirst(items, pinned = [], idOf = (f) => f.id) {
  if (!pinned?.length) return items
  const rank = new Map(pinned.map((id, i) => [id, i]))
  const pins = items.filter((f) => rank.has(idOf(f))).sort((a, b) => rank.get(idOf(a)) - rank.get(idOf(b)))
  return [...pins, ...items.filter((f) => !rank.has(idOf(f)))]
}

// Items made before workspaces carry no id; they belong to Default.
export const workspaceOf = (item) => (typeof item?.workspace === 'string' && item.workspace) || DEFAULT_WORKSPACE
// scope: a workspace id, or null for All.
export const inWorkspace = (item, scope) => !scope || workspaceOf(item) === scope

export const initialsOf = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?'

// 12,400 → 12.4K and 128,400 → 128K, the way YouTube shows subscriber counts.
export function compactCount(n) {
  if (n == null) return ''
  if (n < 1000) return String(n)
  const [div, unit] = n >= 1e9 ? [1e9, 'B'] : n >= 1e6 ? [1e6, 'M'] : [1e3, 'K']
  const v = n / div
  return `${v >= 100 ? Math.floor(v) : Math.floor(v * 10) / 10}${unit}`
}
