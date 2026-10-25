// Comfy Router catalog entries (GET /v2/models), shaped for the picker and the Models page.
// The catalog contract types only `id`, `provider` and `model`; every other field is optional,
// so names, kinds and prices are read from whichever common field an entry carries.

// Router provider segment to the brand the app shows. Unknown partners keep their own segment.
const BRANDS = {
  byteplus: 'bytedance', bytedance: 'bytedance', bfl: 'bfl', vertexai: 'gemini', gemini: 'gemini', veo: 'google', google: 'google',
  openai: 'openai', kling: 'kling', minimax: 'minimax', wan: 'alibaba', qwen: 'alibaba', alibaba: 'alibaba',
  elevenlabs: 'elevenlabs', luma: 'luma', ltx: 'lightricks', lightricks: 'lightricks', runway: 'runway', fal: 'fal',
}
export const routerBrand = (id = '') => {
  const provider = String(id).split('/')[0].toLowerCase()
  return BRANDS[provider] || provider || 'comfy'
}

const words = (value) => [value].flat(3).filter((v) => typeof v === 'string').join(' ').toLowerCase()
function kindOf(entry) {
  const outputs = words([entry.output_modalities, entry.outputs, entry.output, entry.output_types, entry.modalities?.output])
  const any = outputs || words([entry.modality, entry.modalities, entry.category, entry.categories, entry.type, entry.task, entry.tags])
  if (/video/.test(any)) return 'video'
  if (/image/.test(any)) return 'image'
  if (/audio|speech|sound|music|voice/.test(any)) return 'audio'
  if (/3d|mesh/.test(any)) return '3d'
  if (/text|chat|llm/.test(any)) return 'text'
  return null
}

const amountOf = (v) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) ? Number(v) : null)
function priceOf(entry) {
  for (const p of [entry.price, entry.pricing, entry.cost]) {
    if (p == null) continue
    const amount = amountOf(p) ?? amountOf(p.amount) ?? amountOf(p.usd) ?? amountOf(p.price_usd) ?? amountOf(p.price)
    const unit = (typeof p === 'object' && (p.unit || p.per)) || entry.price_unit || entry.unit
    if (amount != null && amount >= 0 && typeof unit === 'string' && unit) return { amount, unit, ...(p.estimate || p.approximate ? { estimate: true } : {}) }
  }
  const amount = amountOf(entry.price_usd)
  return amount != null && typeof entry.price_unit === 'string' ? { amount, unit: entry.price_unit } : null
}

const titled = (model) => model.replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

// One catalog entry, or null when it has no usable id.
export function routerEntry(entry) {
  const id = typeof entry?.id === 'string' ? entry.id : entry?.provider && entry?.model ? `${entry.provider}/${entry.model}` : null
  if (!id || !/^[\w.-]+\/[\w./-]+$/.test(id) || id.split('/').some((part) => !part || /^\.+$/.test(part))) return null
  const [provider, ...rest] = id.split('/')
  const name = [entry.display_name, entry.name, entry.title].find((v) => typeof v === 'string' && v.trim())
  const description = [entry.description, entry.summary].find((v) => typeof v === 'string' && v.trim())
  return {
    id, provider, model: rest.join('/'), name: (name || titled(rest.join('/'))).trim(), kind: kindOf(entry), brand: routerBrand(id),
    price: priceOf(entry), ...(description && { description: description.trim() }),
  }
}

// Joins the hand-written Router rows (which ComfyField knows how to run) with the live catalog.
// `live` is null without a key or when the catalog failed, and the hand rows stay as they are.
// A hand row takes a live price when the catalog returns one. Live rows ComfyField has no input
// mapping for come back in `unwired`, for the Models page.
export function mergeRouterModels(hand, live) {
  if (!Array.isArray(live)) return { models: hand, unwired: [], live: false }
  const byId = new Map(live.map((m) => [m.id, m]))
  const models = hand.map((m) => {
    const hit = byId.get(m.model)
    return hit?.price ? { ...m, price: hit.price } : m
  })
  const known = new Set(hand.map((m) => m.model))
  const unwired = live.filter((m) => !known.has(m.id) && ['image', 'video', 'audio'].includes(m.kind))
  return { models, unwired, live: true }
}
