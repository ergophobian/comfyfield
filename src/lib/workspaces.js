import { useEffect, useSyncExternalStore } from 'react'
import { DEFAULT_WORKSPACE, defaultWorkspace } from '../../shared/workspaces.js'

// The app's copy of .comfyfield/workspaces.json. Generations read the active workspace when they start.
let state = { workspaces: [defaultWorkspace()], active: DEFAULT_WORKSPACE, ready: false, error: '' }
let started = false
const subs = new Set()
const set = (patch) => { state = { ...state, ...patch }; subs.forEach((f) => f()) }
const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }

async function call(url, method = 'GET', data) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(out.error || 'Could not reach the local server.')
  return out
}

const accept = (store) => {
  const workspaces = Array.isArray(store?.workspaces) && store.workspaces.length ? store.workspaces : [defaultWorkspace()]
  const active = workspaces.some((w) => w.id === store?.active) ? store.active : workspaces[0].id
  set({ workspaces, active, ready: true, error: '' })
}

export const refreshWorkspaces = () => call('/api/workspaces').then(accept, (e) => set({ ready: true, error: e.message }))

export const activeWorkspace = () => state.workspaces.find((w) => w.id === state.active) || state.workspaces[0]

export async function createWorkspace(data) {
  const ws = await call('/api/workspaces', 'POST', data)
  await refreshWorkspaces()
  return ws
}

export async function updateWorkspace(id, data) {
  const ws = await call(`/api/workspaces/${id}`, 'PATCH', data)
  set({ workspaces: state.workspaces.map((w) => (w.id === id ? ws : w)) })
  return ws
}

export const removeWorkspace = async (id) => accept(await call(`/api/workspaces/${id}`, 'DELETE'))

export async function switchWorkspace(id) {
  if (id === state.active) return
  const before = state.active
  set({ active: id })
  try { accept(await call('/api/workspaces/active', 'POST', { id })) } catch (e) { set({ active: before, error: e.message }) }
}

export async function togglePinned(formatId) {
  const ws = activeWorkspace()
  const pinned = ws.pinned?.includes(formatId) ? ws.pinned.filter((id) => id !== formatId) : [...(ws.pinned || []), formatId]
  return updateWorkspace(ws.id, { pinned })
}

export function useWorkspaces() {
  const snap = useSyncExternalStore(subscribe, () => state)
  useEffect(() => { if (!started) { started = true; refreshWorkspaces() } }, [])
  const active = snap.workspaces.find((w) => w.id === snap.active) || snap.workspaces[0]
  return { ...snap, current: active }
}

// The pinned format ids of the active workspace, for galleries that list formats.
export const usePinned = () => useWorkspaces().current.pinned || []
