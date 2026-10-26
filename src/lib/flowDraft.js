// Ghost nodes for a flow draft: shown on the canvas, never saved, until Accept copies them into the flow.
const GAP = 160

// Moves the draft to the right of the existing nodes and marks every node and edge as a ghost.
export function placeDraft(flow, draft) {
  const right = flow.nodes.length ? Math.max(...flow.nodes.map((n) => n.position.x + (n.measured?.width || 320))) + GAP : 0
  const top = flow.nodes.length ? Math.min(...flow.nodes.map((n) => n.position.y)) : 0
  const ids = new Set(flow.nodes.map((n) => n.id))
  const rename = new Map(draft.nodes.map((n) => [n.id, ids.has(n.id) ? `${n.id}-${Math.random().toString(36).slice(2, 6)}` : n.id]))
  return {
    name: draft.name,
    dropped: draft.dropped || [],
    nodes: draft.nodes.map((n) => ({
      id: rename.get(n.id), type: n.type, data: n.data,
      position: { x: n.position.x + right, y: n.position.y + top },
      className: 'ghost', draggable: false, selectable: false, connectable: false, deletable: false, focusable: false, ariaLabel: `Draft ${n.type} node`,
    })),
    edges: draft.edges.map((e) => ({ id: `ghost:${rename.get(e.source)}-${rename.get(e.target)}`, source: rename.get(e.source), target: rename.get(e.target), className: 'ghost', selectable: false, deletable: false, focusable: false })),
  }
}

// Returns the flow with the draft's nodes and edges as real ones. An empty untitled flow takes the draft's name.
export function acceptDraft(flow, draft) {
  if (!draft) return flow
  const named = !flow.nodes.length && /^Untitled flow$/.test(flow.name)
  return {
    ...flow,
    name: named ? draft.name : flow.name,
    nodes: [...flow.nodes.map((n) => ({ ...n, selected: false })), ...draft.nodes.map(({ id, type, position, data }) => ({ id, type, position, data }))],
    edges: [...flow.edges, ...draft.edges.map(({ source, target }) => ({ id: `${source}-${target}`, source, target }))],
  }
}
