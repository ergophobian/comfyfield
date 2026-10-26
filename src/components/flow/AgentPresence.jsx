import { useEffect, useState } from 'react'
import { ViewportPortal } from '@xyflow/react'
import { useAgents } from '../../lib/agents.js'

// How long an idle agent stays on screen while it fades out. Matches --dur-hero in styles.css.
const FADE_MS = 700
export const agentColor = (color) => /^agent-\d+$/.test(color || '') ? `var(--${color})` : 'var(--blue)'

// Agents with a flow open: working until `until` passes (null: until the Assistant turn ends), then idle and fading.
export function useAgentPresence() {
  const { presence, skew } = useAgents()
  const [now, setNow] = useState(() => Date.now())
  const at = now + skew
  const shown = presence.filter((p) => p.flowId && (p.until == null || p.until + FADE_MS > at))
  const ticking = shown.length > 0
  useEffect(() => {
    if (!ticking) return
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(timer)
  }, [ticking, presence])
  return shown.map((p) => ({ ...p, idle: p.until != null && p.until <= at }))
}

export function AgentPresence({ flow, presence }) {
  const here = presence.filter((p) => p.flowId === flow.id).map((p) => {
    const node = flow.nodes.find((n) => n.id === p.nodeId)
    return { ...p, node, at: node?.position || p.position || { x: 0, y: 0 } }
  })
  const stack = new Map()
  const place = (p) => { const key = p.node?.id ?? `${p.at.x},${p.at.y}`; const i = stack.get(key) || 0; stack.set(key, i + 1); return i }
  const byNode = [...here.filter((p) => p.node).reduce((m, p) => m.set(p.node.id, [...(m.get(p.node.id) || []), p]), new Map()).values()]
  return <ViewportPortal>
    {here.map((p) => (
      <div key={p.id} className={`agent-presence${p.idle ? ' idle' : ''}`} style={{ '--agent': agentColor(p.color), '--stack': place(p), transform: `translate(${p.at.x}px, ${p.at.y}px)` }}>
        <span className="agent-cursor" aria-label={`${p.name} cursor`}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2 16 10 10 11 8 17Z" fill="currentColor" /></svg>{p.name}</span>
      </div>
    ))}
    {byNode.map((agents) => {
      const { node } = agents[0]
      const idle = agents.every((p) => p.idle)
      return <div key={`badge-${node.id}`} className={`agent-node-badges${idle ? ' idle' : ''}`} style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }}>
        {agents.map((p) => <span key={p.id} className="agent-node-badge" style={{ '--agent': agentColor(p.color) }}>{agents.length === 1 ? `${p.name} is working on this` : p.name}</span>)}
      </div>
    })}
  </ViewportPortal>
}

// Who each node belongs to, as a chip on its top right corner.
export function AgentAssignments({ flow, nodes, roster }) {
  return <ViewportPortal>{nodes.filter((n) => n.assignee || flow.assignee).map((n) => {
    const name = n.assignee || flow.assignee
    const color = roster.find((a) => a.name === name)?.color
    return <div key={n.id} className="agent-assigned" style={{ '--agent': agentColor(color), width: n.measured?.width || 0, transform: `translate(${n.position.x}px, ${n.position.y}px)` }}>
      <span title={n.assignee ? `${name} has this node` : `${name} has this flow`}><i className="agent-dot" />{name}</span>
    </div>
  })}</ViewportPortal>
}
