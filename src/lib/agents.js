import { useEffect, useSyncExternalStore } from 'react'
import { api } from './remoteFlows.js'

let snapshot = { sessions: [], setup: [], presence: [], skew: 0, loading: true, error: '' }
const listeners = new Set()
let events
let timer
let request
let again = false
const emit = (data) => { snapshot = { ...snapshot, ...data }; listeners.forEach((fn) => fn()) }

export async function refreshAgents() {
  if (request) { again = true; return request }
  request = Promise.all([api('/api/agents'), api('/api/agents/setup')]).then(([sessions, setup]) => emit({ sessions, setup, loading: false, error: '' })).catch((e) => emit({ loading: false, error: e.message }))
  try { await request } finally {
    request = null
    if (again) { again = false; refreshAgents() }
  }
}

// Every agent with a name and a color: Assistant sessions and terminal MCP servers.
let presenceTimer
export async function refreshPresence() {
  try {
    const { agents, now } = await api('/api/agents/presence')
    emit({ presence: Array.isArray(agents) ? agents : [], skew: Number.isFinite(now) ? now - Date.now() : 0 })
  } catch {}
}

export function useAgents() {
  useEffect(() => {
    if (!events) {
      events = new EventSource('/api/agents/events')
      events.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'agents') { clearTimeout(presenceTimer); presenceTimer = setTimeout(refreshPresence, 30); return }
        if (!data.sessionId) return
        clearTimeout(timer)
        timer = setTimeout(refreshAgents, 30)
      }
      events.onopen = () => { refreshAgents(); refreshPresence() }
      events.onerror = () => emit({ error: 'Reconnecting to the local server…' })
      refreshAgents()
      refreshPresence()
    }
  }, [])
  return useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn) }, () => snapshot)
}

export async function agentAction(id, action, data = {}) {
  const result = await api(`/api/agents${id ? `/${id}/${action}` : ''}`, 'POST', data)
  await refreshAgents()
  return result
}
