import { useEffect, useSyncExternalStore } from 'react'
import { api } from './remoteFlows.js'

let snapshot = { sessions: [], setup: [], loading: true, error: '' }
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

export function useAgents() {
  useEffect(() => {
    if (!events) {
      events = new EventSource('/api/agents/events')
      events.onmessage = (event) => {
        if (!JSON.parse(event.data).sessionId) return
        clearTimeout(timer)
        timer = setTimeout(refreshAgents, 30)
      }
      events.onopen = refreshAgents
      events.onerror = () => emit({ error: 'Reconnecting to the local server…' })
      refreshAgents()
    }
  }, [])
  return useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn) }, () => snapshot)
}

export async function agentAction(id, action, data = {}) {
  const result = await api(`/api/agents${id ? `/${id}/${action}` : ''}`, 'POST', data)
  await refreshAgents()
  return result
}
