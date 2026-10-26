import { useEffect, useSyncExternalStore } from 'react'
import { voiceValue } from '../../shared/voices.js'

const types = ['characters', 'products', 'brands', 'voices']
let state = { characters: [], products: [], brands: [], voices: [], ready: false, error: null }
let started = false
const subs = new Set()

const set = (patch) => { state = { ...state, ...patch }; subs.forEach((f) => f()) }
const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }

async function call(url, method = 'GET', data) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(out.error || 'Something went wrong.')
  return out
}

async function refresh() {
  const errors = []
  const lists = await Promise.all(types.map((t) => call(`/api/library/${t}`).then((list) => Array.isArray(list) ? list : []).catch((e) => { errors.push(e.message); return state[t] })))
  set({ ...Object.fromEntries(types.map((t, i) => [t, lists[i]])), ready: true, error: errors[0] || null })
}

export const upload = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = () => reject(new Error('Could not read that file.'))
  reader.onload = () => call('/api/upload', 'POST', { name: file.name, dataUrl: reader.result }).then((r) => resolve(r.url), reject)
  reader.readAsDataURL(file)
})

export const create = async (type, data) => {
  const item = await call(`/api/library/${type}`, 'POST', data)
  set({ [type]: [item, ...state[type]] })
  return item
}

export const update = async (type, id, data) => {
  const item = await call(`/api/library/${type}/${id}`, 'PATCH', data)
  set({ [type]: state[type].map((x) => (x.id === id ? item : x)) })
  return item
}

export const remove = async (type, id) => {
  await call(`/api/library/${type}/${id}`, 'DELETE')
  set({ [type]: state[type].filter((x) => x.id !== id) })
}

export const importUrl = (url) => call('/api/library/import', 'POST', { url })
export const readProduct = (url) => call('/api/product/read', 'POST', { url })

// What a product page says, short enough for an ad prompt: name, price, then the description.
export const pageSummary = (page) => {
  const head = [page.title, page.price].filter(Boolean).join(', ')
  const text = [head && `${head}.`, page.description].filter(Boolean).join(' ')
  return text.length > 400 ? `${text.slice(0, 400).replace(/\s+\S*$/, '')}...` : text
}

// Shared across the app: composer, recipes and flows read the same lists.
export function useLibrary() {
  const snap = useSyncExternalStore(subscribe, () => state)
  useEffect(() => { if (!started) { started = true; refresh() } }, [])
  return { ...snap, refresh, create, update, remove, upload, importUrl }
}

// What a generate call receives in opts.refs.
export const toRef = (type, item) => type === 'voice' ? voiceValue(item) : ({
  type, id: item.id, name: item.name, images: item.images || [],
  ...(type === 'product' ? { description: item.description, price: item.price } : { notes: item.notes }),
})

export { voiceValue }

export function useVoices() {
  const { voices, ready, error, refresh } = useLibrary()
  return { voices, ready, error, refresh, toValue: voiceValue }
}
