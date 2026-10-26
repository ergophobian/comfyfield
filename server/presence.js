// Who is working on which flow. Every MCP session joins with a name and a color: the Assistant inside
// the app and every terminal running `npx comfyfield mcp`. They share .comfyfield/agents.json, so the
// app can show a terminal agent that is a separate process.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import * as core from './core.js'

// Color tokens --agent-1 to --agent-6 in src/styles.css.
export const PALETTE = 6
// A terminal agent has no turns, so it counts as idle this long after its last flow tool.
export const IDLE_MS = 8000

const alive = (pid) => {
  if (!Number.isInteger(pid)) return false
  try { process.kill(pid, 0); return true } catch (e) { return e.code === 'EPERM' }
}

export function createPresence({ directory = core.home, changed = () => {}, now = Date.now } = {}) {
  const file = () => path.join(directory(), 'agents.json')
  const read = () => {
    try { return JSON.parse(fs.readFileSync(file(), 'utf8')).agents.filter((a) => a && typeof a.id === 'string') } catch { return [] }
  }
  const write = (agents) => {
    fs.mkdirSync(directory(), { recursive: true })
    const tmp = `${file()}.${process.pid}.tmp`
    fs.writeFileSync(tmp, JSON.stringify({ agents }))
    fs.renameSync(tmp, file())
    changed({ type: 'agents' })
  }
  // Agents whose process ended without leaving (a closed terminal) drop out.
  const live = () => {
    const agents = read()
    const kept = agents.filter((a) => alive(a.pid))
    if (kept.length !== agents.length) write(kept)
    return kept
  }
  const change = (id, fn) => {
    const agents = live()
    const agent = agents.find((a) => a.id === id)
    if (!agent) return null
    fn(agent)
    write(agents)
    return { ...agent }
  }
  return {
    file,
    list: () => ({ agents: live(), now: now() }),
    // Names are "Agent 1", "Agent 2"... the lowest number no live agent has. The number picks the color.
    join({ kind = 'terminal', name } = {}) {
      const agents = live()
      const taken = new Set(agents.map((a) => a.slot))
      let slot = Number(/^Agent (\d+)$/.exec(name || '')?.[1]) || 0
      if (!slot) for (slot = 1; taken.has(slot); slot++);
      const agent = { id: crypto.randomUUID(), name: name?.trim() || `Agent ${slot}`, slot, color: `agent-${((slot - 1) % PALETTE) + 1}`, kind, pid: process.pid, joined: now(), active: now(), until: now() }
      write([...agents, agent])
      return { ...agent }
    },
    // The agent is on this node now. A terminal agent stays shown for IDLE_MS; an Assistant turn
    // stays shown until rest() at the end of the turn.
    touch(id, { flowId, nodeId, position } = {}) {
      return change(id, (a) => {
        Object.assign(a, { flowId, nodeId: nodeId ?? null, position: position ?? null, active: now() })
        a.until = a.kind === 'assistant' ? null : now() + IDLE_MS
      })
    },
    rest: (id) => change(id, (a) => { a.until = now() }),
    leave(id) {
      const agents = read()
      if (agents.some((a) => a.id === id)) write(agents.filter((a) => a.id !== id))
    },
    // A terminal MCP server is another process; poll the file so the app hears it join, move and leave.
    watch() {
      const target = file()
      const seen = (cur, prev) => { if (cur.mtimeMs !== prev.mtimeMs) changed({ type: 'agents' }) }
      fs.watchFile(target, { interval: 300, persistent: false }, seen)
      return () => fs.unwatchFile(target, seen)
    },
  }
}
