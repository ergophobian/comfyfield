import { useEffect, useSyncExternalStore } from 'react'

// The Pod as the app sees it: the server's status, and the one place a run asks before a Pod starts.
// A run never starts or resumes a Pod by itself; the start sheet answers the question.
let state = { status: null, ask: null }
let polling = false
const subs = new Set()
const set = (patch) => { state = { ...state, ...patch }; subs.forEach((f) => f()) }
const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }

const MOVING = ['starting', 'ending', 'pausing', 'resuming', 'terminating']
const money = (n) => `$${(n || 0).toFixed(2)}`
const minutes = (ms) => Math.max(0, Math.floor(ms / 60000))

async function call(url, data) {
  const r = await fetch(url, data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {})
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error(out.error || `Request failed (${r.status})`), { code: out.code })
  return out
}

export async function refreshPod() {
  // A server without the Pod routes answers with something else; keep the chip hidden then.
  try { const status = await call('/api/pod'); if (status?.phase) set({ status }) } catch {}
  return state.status
}

export const podQuote = (workflow) => call(`/api/pod/quote${workflow ? `?workflow=${encodeURIComponent(workflow)}` : ''}`)
// Sizes, every GPU with its price and stock, disk sizes and settings choices, for the Pods page.
export const podOptions = () => call('/api/pod/options')

export async function podAction(action, body = {}) {
  const status = await call(`/api/pod/${action}`, body)
  set({ status: { ...state.status, ...status } })
  refreshPod()
  return status
}

// The generation type: Instant runs on Comfy Cloud, Session on the user's Pod. Before the user picks one,
// a live Pod means Session, because a ready Pod takes every run.
export const RUN_TYPES = [
  { value: 'instant', label: 'Instant', line: 'Comfy Cloud, ready at once' },
  { value: 'session', label: 'Session', line: 'Your own GPU on RunPod' },
]
export const runTypeOf = (s) => s?.run || (s && !['none', 'paused'].includes(s.phase) ? 'session' : 'instant')

export async function setRunType(run) {
  await call('/api/connections', { id: 'comfy', values: { run } })
  return refreshPod()
}

export const downloading = (s) => (s?.downloads || []).filter((d) => d.state === 'queued' || d.state === 'downloading')
export const installing = (s) => (s?.runtimes || []).filter((e) => e.state === 'installing')

// What the chip says. `short` drops the spend for narrow screens.
export function podLabel(s, now = Date.now()) {
  if (!s) return 'Pod'
  const up = s.pod ? minutes(now - s.pod.startedAt) : 0
  if (s.phase === 'starting') {
    if (s.stage === 'placing') return 'Finding a GPU'
    return `${s.stage === 'booting' ? 'Booting' : 'Starting'} · ${up} min`
  }
  if (s.phase === 'ready') {
    const runtime = installing(s)[0]
    return runtime ? `Installing ${runtime.name}` : downloading(s).length ? 'Downloading models' : s.runs ? `${s.runs} running` : 'Ready'
  }
  return { none: 'Off', ending: 'Ending after the queue', pausing: 'Pausing', paused: 'Paused', resuming: 'Resuming', terminating: 'Terminating' }[s.phase] || 'Pod'
}

export const spendText = (s) => (s ? `${money(s.spend?.today)} of ${money(s.spend?.cap)} today` : '')

// What a waiting take says while its run is held by the Pod. Only runs sent to a starting Pod carry `pod`;
// a ready Pod takes every ComfyUI run.
export function takeLabel(it, s) {
  if (it.provider !== 'comfy' || !s || s.mode !== 'cloud') return null
  if (it.pod && s.phase !== 'ready') return 'Waiting for the Pod'
  if (s.phase === 'ready' && installing(s).length) return `Installing ${installing(s)[0].name} on the Pod`
  if (s.phase === 'ready' && downloading(s).length) return 'Downloading models on the Pod'
  return null
}

// The chip shows wherever ComfyUI runs on Comfy Cloud or a Pod, since it holds the generation type,
// and always while a Pod exists, because a Pod charges.
export const showPod = (s) => Boolean(s && (s.phase !== 'none' || s.mode === 'cloud'))

// A run Comfy Cloud cannot take asks once for a Pod. `reason` says why Cloud cannot take it. `replace`
// is the server's `fit` for a run the current Pod is too small for: the sheet then offers to terminate
// it and start one sized for the workflow.
export function askPod(workflow, reason, replace = null) {
  if (!state.ask) {
    let resolve, reject
    const promise = new Promise((a, b) => { resolve = a; reject = b })
    set({ ask: { workflow, reason, replace, promise, resolve, reject } })
    refreshPod()
  }
  return state.ask.promise
}

// With auto-start on, a run Comfy Cloud cannot take starts, resumes or keeps the Pod itself, sized for
// its workflow. The Generate click is the consent. Several runs at once share one start.
let starting = null
const startWaiters = new Set()
export function autoPod(workflow, isCancelled = () => false) {
  startWaiters.add(isCancelled)
  if (!starting) {
    starting = (async () => {
      const s = await refreshPod()
      // Skip the start only when every run waiting on it was cancelled.
      if ([...startWaiters].every((cancelled) => cancelled())) return
      const action = s?.phase === 'paused' ? 'resume' : s?.phase === 'ending' ? 'keep' : s?.phase === 'none' ? 'start' : null
      if (action) await podAction(action, action === 'start' ? { workflow } : {})
    })().finally(() => { starting = null; startWaiters.clear() })
  }
  return starting
}

// The start sheet's answer. Every run waiting on the question gets it.
export function answerPod(ok) {
  const a = state.ask
  if (!a) return
  set({ ask: null })
  if (ok) a.resolve()
  else a.reject(new Error(a.replace ? 'Cancelled. Your Pod is still running.' : 'Cancelled. No Pod was started.'))
}

// Polls fast while the Pod changes, slowly otherwise. App mounts it once.
export function usePodPolling() {
  useEffect(() => {
    if (polling) return
    polling = true
    let timer
    const loop = async () => {
      const s = await refreshPod()
      const quick = s && (MOVING.includes(s.phase) || s.runs > 0 || downloading(s).length > 0 || installing(s).length > 0 || state.ask)
      timer = setTimeout(loop, quick ? 2000 : 10000)
    }
    loop()
    return () => { clearTimeout(timer); polling = false }
  }, [])
}

export function usePod() {
  return useSyncExternalStore(subscribe, () => state)
}

export { money, MOVING }
