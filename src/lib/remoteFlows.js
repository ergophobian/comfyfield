const listeners = new Set()
let snapshot = { store: null, ready: false, error: '' }
let initialized
let revision = 0
let dirty = false
let saving
let timer
let events
let refreshing

export async function api(url, method = 'GET', data) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'Could not reach the local server')
  return result
}

const MIGRATED = 'comfyfield.flows.migrated'
const migrated = () => { try { return localStorage.getItem(MIGRATED) === '1' } catch { return false } }
const markMigrated = () => { try { localStorage.setItem(MIGRATED, '1') } catch {} }

const emit = (next) => { snapshot = { ...snapshot, ...next }; listeners.forEach((fn) => fn()) }
export const flowSnapshot = () => snapshot
export const subscribeFlows = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
const accept = (store) => { revision = store.revision; emit({ store, ready: true, error: '' }) }

export async function refreshFlows() {
  if (dirty || saving || refreshing) return
  refreshing = api('/api/flows')
  try {
    const store = await refreshing
    if (!dirty && !saving) accept(store)
  } catch (e) { emit({ error: e.message }) } finally { refreshing = null }
}

export function initFlows(seed) {
  if (!snapshot.store) emit({ store: seed })
  if (!initialized) initialized = (async () => {
    let store = await api('/api/flows')
    const { legacy, ...local } = seed
    // One-time move of browser-only flows to the server. Flows already there (same id) win.
    const moving = legacy && !migrated() ? local.flows.filter((f) => f.nodes.length && !store.flows.some((s) => s.id === f.id)) : []
    if (moving.length || !store.flows.length) {
      const flows = [...store.flows, ...(moving.length ? moving : local.flows)]
      store = await api('/api/flows', 'PUT', { flows, current: store.current ?? local.current ?? flows[0].id, runs: local.runs, revision: store.revision })
    }
    if (legacy) markMigrated()
    accept(store)
    events = new EventSource('/api/agents/events')
    events.onmessage = (event) => { if (JSON.parse(event.data).type === 'flows') refreshFlows() }
    events.onopen = () => refreshFlows()
    // A standalone MCP server (npx comfyfield mcp) writes flows.json without telling this page,
    // so look again whenever the user comes back to the tab.
    window.addEventListener('focus', () => refreshFlows())
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshFlows() })
  })().catch((e) => { emit({ ready: false, error: e.message }); initialized = null; throw e })
  return initialized
}

export function changeFlows(fn) {
  if (!snapshot.ready) return
  const next = typeof fn === 'function' ? fn(snapshot.store) : fn
  emit({ store: next })
  dirty = true
  clearTimeout(timer)
  timer = setTimeout(() => flushFlows().catch(() => {}), 180)
}

export async function flushFlows() {
  clearTimeout(timer)
  if (saving) { await saving; return flushFlows() }
  if (!dirty) return
  if (!snapshot.ready) throw new Error(snapshot.error || 'Flows are still loading')
  const store = snapshot.store
  dirty = false
  saving = api('/api/flows', 'PUT', { ...store, revision })
  try {
    const saved = await saving
    revision = saved.revision
    if (store === snapshot.store) accept(saved)
  } catch (e) {
    dirty = true
    emit({ ready: false, error: `${e.message} Your unsaved flow is available to export.` })
    throw e
  } finally { saving = null }
  if (dirty) await flushFlows()
}

export async function reloadFlows() {
  clearTimeout(timer)
  dirty = false
  if (saving) await saving.catch(() => {})
  accept(await api('/api/flows'))
}
