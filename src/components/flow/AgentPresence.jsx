import { ViewportPortal } from '@xyflow/react'
import { useAgents } from '../../lib/agents.js'

export function useAgentPresence() {
  const { sessions } = useAgents()
  return sessions.filter((s) => ['working', 'approval'].includes(s.status)).map((s) => ({ ...s.events.findLast((e) => e.type === 'presence'), agent: s.name })).filter((e) => e.flowId)
}

export function AgentPresence({ flow, presence }) {
  return <ViewportPortal>{presence.filter((p) => p.flowId === flow.id).map((p) => {
    const node = flow.nodes.find((n) => n.id === p.nodeId)
    return <div key={p.agent} className="agent-presence" style={{ transform: `translate(${p.position.x}px, ${p.position.y}px)` }}>
      <span className="agent-cursor" aria-label={`${p.agent} cursor`}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2 16 10 10 11 8 17Z" fill="currentColor" /></svg>{p.agent}</span>
      {node && <span className="agent-node-badge">{p.agent} is working on this</span>}
    </div>
  })}</ViewportPortal>
}
