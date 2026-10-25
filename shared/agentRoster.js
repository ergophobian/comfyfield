// Who can take work in Flows, and what each one has. Assignments are agent names stored in the flow:
// `flow.assignee` for a whole flow and `node.assignee` for one node. Shared by the canvas and MCP.

export const PALETTE = 6
const slotOf = (name) => Number(/^Agent (\d+)$/.exec(name || '')?.[1]) || 0
// "Agent N" keeps the color of slot N, also while that agent is not connected.
export const colorOf = (name, live = []) => live.find((a) => a.name === name)?.color || (slotOf(name) ? `agent-${((slotOf(name) - 1) % PALETTE) + 1}` : null)
export const validAssignee = (value) => value == null || (typeof value === 'string' && value.trim().length > 0 && value.length <= 60)

export const assignedNames = (flows) => [...new Set(flows.flatMap((f) => [f.assignee, ...f.nodes.map((n) => n.assignee)]).filter(Boolean))]

// Connected agents first, then names that still have work, then the next free "Agent N" so the user
// can hand work to a terminal before starting it.
export function rosterOf(live = [], flows = []) {
  const names = new Set(live.map((a) => a.name))
  const roster = live.map((a) => ({ name: a.name, color: a.color, kind: a.kind, live: true }))
  for (const name of assignedNames(flows)) if (!names.has(name)) { names.add(name); roster.push({ name, color: colorOf(name), live: false }) }
  let next = 1
  while (names.has(`Agent ${next}`)) next++
  roster.push({ name: `Agent ${next}`, color: colorOf(`Agent ${next}`), live: false, spare: true })
  return roster.sort((a, b) => (slotOf(a.name) || 99) - (slotOf(b.name) || 99) || a.name.localeCompare(b.name))
}

const summary = (n) => n.data?.text || n.data?.prompt || n.data?.instructions || n.data?.model?.name || n.data?.model?.id || ''

// What one agent should work on: whole flows and single nodes assigned to its name.
export function tasksFor(name, flows = []) {
  return flows.flatMap((f) => {
    const whole = f.assignee === name
    const nodes = f.nodes.filter((n) => whole || n.assignee === name)
    if (!nodes.length && !whole) return []
    return [{
      flow_id: f.id, flow_name: f.name, whole_flow: whole,
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, assigned: n.assignee === name ? 'node' : 'flow', ...(summary(n) && { summary: String(summary(n)).slice(0, 200) }) })),
    }]
  })
}
