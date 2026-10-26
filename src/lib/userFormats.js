// Imported formats in the browser: loaded from the local server once, then kept in sync after each
// import or removal. The catalog helpers in formats/index.js read them through setUserFormats.
import { useEffect, useSyncExternalStore } from 'react'
import { setUserFormats } from './formats/index.js'
import { formatFileName, formatText } from './formats/share.js'

let snapshot = { list: [], ready: false, error: '' }
let loading
const listeners = new Set()
const emit = (next) => { snapshot = { ...snapshot, ...next }; listeners.forEach((fn) => fn()) }
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }

async function api(url, method = 'GET', data) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) })
  const result = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(result.error || 'Could not reach the local server')
  return result
}

const accept = (list) => { setUserFormats(list); emit({ list, ready: true, error: '' }) }

export function loadUserFormats() {
  loading ||= api('/api/formats').then((r) => accept(Array.isArray(r.formats) ? r.formats : []), (e) => { loading = null; emit({ ready: true, error: e.message }) })
  return loading
}

export function useUserFormats() {
  useEffect(() => { loadUserFormats() }, [])
  return useSyncExternalStore(subscribe, () => snapshot)
}

export async function importFormat(input) {
  const format = await api('/api/formats/import', 'POST', input)
  accept([format, ...snapshot.list.filter((f) => f.id !== format.id)])
  return format
}

export async function removeFormat(id) {
  accept((await api(`/api/formats/${encodeURIComponent(id)}`, 'DELETE')).formats)
}

export const shareFormatGist = (format) => api('/api/formats/share', 'POST', { format })

export function downloadFormat(format) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([formatText(format)], { type: 'application/json' }))
  a.download = formatFileName(format)
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
