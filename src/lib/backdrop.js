import { useSyncExternalStore } from 'react'

// The app background behind the glass: the CSS sky or the canvas ASCII field.
export const backdrops = [
  { id: 'sky', label: 'Sky' },
  { id: 'ascii', label: 'ASCII' },
]
const KEY = 'comfyfield.backdrop'
const listeners = new Set()
let memory = 'sky'

const read = () => {
  try { memory = backdrops.some((b) => b.id === localStorage.getItem(KEY)) ? localStorage.getItem(KEY) : 'sky' } catch {}
  return memory
}
const notify = () => listeners.forEach((fn) => fn())

export function setBackdrop(id) {
  memory = id
  try { localStorage.setItem(KEY, id) } catch {}
  notify()
}

const subscribe = (fn) => {
  listeners.add(fn)
  window.addEventListener('storage', fn)
  return () => { listeners.delete(fn); window.removeEventListener('storage', fn) }
}

export const useBackdrop = () => useSyncExternalStore(subscribe, read, () => 'sky')
