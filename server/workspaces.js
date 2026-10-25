// Workspaces saved in .comfyfield/workspaces.json. The Default workspace always exists, so there is
// always an active one to fall back to.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { dataDirectory } from './startup-paths.js'
import { DEFAULT_WORKSPACE, blankWorkspace, cleanWorkspace, defaultWorkspace, withCriteria } from '../shared/workspaces.js'

const fail = (message, status = 400) => Object.assign(new Error(message), { status })

export function createWorkspaces({ directory = () => dataDirectory() } = {}) {
  const file = () => path.join(directory(), 'workspaces.json')
  const read = () => {
    let store
    try { store = JSON.parse(fs.readFileSync(file(), 'utf8')) } catch (e) {
      if (e.code !== 'ENOENT' && !(e instanceof SyntaxError)) throw e
      // Keep a copy of a broken file before the next save replaces it.
      if (e instanceof SyntaxError && !fs.existsSync(`${file()}.broken`)) fs.copyFileSync(file(), `${file()}.broken`)
      store = {}
    }
    const workspaces = Array.isArray(store.workspaces) ? store.workspaces.filter((w) => w && typeof w.id === 'string') : []
    if (!workspaces.some((w) => w.id === DEFAULT_WORKSPACE)) workspaces.unshift(defaultWorkspace())
    const active = workspaces.some((w) => w.id === store.active) ? store.active : DEFAULT_WORKSPACE
    return { ...store, version: 1, active, workspaces }
  }
  const write = (store) => {
    fs.mkdirSync(directory(), { recursive: true })
    fs.writeFileSync(`${file()}.tmp`, JSON.stringify(store, null, 2))
    fs.renameSync(`${file()}.tmp`, file())
    return store
  }
  const find = (store, id) => {
    const ws = store.workspaces.find((w) => w.id === id)
    if (!ws) throw fail('That workspace is gone. Pick another one.', 404)
    return ws
  }

  const service = {
    file,
    list: () => read(),
    active: () => { const s = read(); return s.workspaces.find((w) => w.id === s.active) },
    create(data) {
      const fields = cleanWorkspace(data)
      if (!fields.name) throw fail('Give the workspace a name first.')
      const store = read()
      const ws = { id: crypto.randomUUID().slice(0, 8), ...blankWorkspace(), ...fields, created: Date.now(), updated: Date.now() }
      write({ ...store, workspaces: [...store.workspaces, ws], active: data.activate === false ? store.active : ws.id })
      return ws
    },
    update(id, data) {
      const store = read()
      const fields = cleanWorkspace(data)
      if ('name' in fields && !fields.name) throw fail('A workspace needs a name.')
      const ws = { ...find(store, id), ...fields, updated: Date.now() }
      write({ ...store, workspaces: store.workspaces.map((w) => (w.id === id ? ws : w)) })
      return ws
    },
    remove(id) {
      if (id === DEFAULT_WORKSPACE) throw fail('The Default workspace stays. Rename it instead.')
      const store = read()
      find(store, id)
      return write({ ...store, workspaces: store.workspaces.filter((w) => w.id !== id), active: store.active === id ? DEFAULT_WORKSPACE : store.active })
    },
    activate(id) {
      const store = read()
      find(store, id)
      return write({ ...store, active: id })
    },
    // Server-side runs (Flows, MCP) add the active workspace's criteria the same way the app does.
    withActiveCriteria: (prompt, kind) => withCriteria(prompt, service.active(), kind),
  }
  return service
}

export const workspaces = createWorkspaces()

// Moves everything made before workspaces into Default: Library elements, flows and CLI imports.
// It only fills a missing workspace id, so running it again changes nothing. Returns how many items moved.
export function migrateToWorkspaces({ directory = () => dataDirectory() } = {}) {
  let moved = 0
  const stamp = (item) => {
    if (!item || typeof item !== 'object' || typeof item.workspace === 'string') return item
    moved++
    return { ...item, workspace: DEFAULT_WORKSPACE }
  }
  const update = (name, fn) => {
    const file = path.join(directory(), name)
    let data
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return }
    const before = moved
    const next = fn(data)
    if (moved === before) return
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(next, null, 2))
    fs.renameSync(`${file}.tmp`, file)
  }
  update('library.json', (lib) => Object.fromEntries(Object.entries(lib).map(([type, list]) => [type, Array.isArray(list) ? list.map(stamp) : list])))
  // The revision stays: a workspace id is not an edit, and the open canvas must still be able to save.
  update('flows.json', (store) => ({ ...store, flows: Array.isArray(store.flows) ? store.flows.map(stamp) : store.flows }))
  update('generation-imports.json', (list) => (Array.isArray(list) ? list.map(stamp) : list))
  return moved
}

// A save from a page loaded before the migration may drop the id; keep the one already stored.
// A flow with no id at all reads as Default (workspaceOf), so it stays as it was sent.
export const keepWorkspace = (next, previous) => (typeof next.workspace !== 'string' && typeof previous?.workspace === 'string' ? { ...next, workspace: previous.workspace } : next)

// /api/workspaces routes. Returns false when the path is not a workspace route.
export async function workspaceRoute(req, res, url, { body, send, service = workspaces }) {
  if (url.pathname === '/api/workspaces' && req.method === 'GET') return send(res, 200, service.list()), true
  if (url.pathname === '/api/workspaces' && req.method === 'POST') return send(res, 200, service.create(await body(req))), true
  if (url.pathname === '/api/workspaces/active' && req.method === 'POST') return send(res, 200, service.activate((await body(req)).id)), true
  const m = /^\/api\/workspaces\/([\w-]{1,64})$/.exec(url.pathname)
  if (!m) return false
  if (req.method === 'PATCH') return send(res, 200, service.update(m[1], await body(req))), true
  if (req.method === 'DELETE') return send(res, 200, service.remove(m[1])), true
  return false
}
