// Workspaces: the stored file, the routes, and the one rule that adds content criteria to a prompt.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { createWorkspaces, workspaceRoute } from '../server/workspaces.js'
import { DEFAULT_WORKSPACE, cleanWorkspace, criteriaText, pinnedFirst, withCriteria, initialsOf } from '../shared/workspaces.js'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-workspaces-'))
const service = createWorkspaces({ directory: () => dir })

// A fresh install has only Default, and it is active.
let store = service.list()
assert.equal(store.active, DEFAULT_WORKSPACE)
assert.deepEqual(store.workspaces.map((w) => w.name), ['Default'])
assert.equal(fs.existsSync(service.file()), false, 'Reading never writes the file')

// Create: name, avatar, description, criteria (text, do, do not) and pinned formats; it becomes active.
const ws = service.create({
  name: '  Night drives  ', avatar: '/media/avatar.png', description: 'Lo-fi city drives',
  criteria: { text: 'Neon city at night, 35mm film look', do: ['Teal and orange', '', 'Rain on glass'], dont: ['Faces in frame'], extra: 'dropped' },
  pinned: ['relight', 'relight', 'color-grade'], appendCriteria: true, secret: 'dropped',
})
assert.equal(ws.name, 'Night drives')
assert.deepEqual(ws.criteria, { text: 'Neon city at night, 35mm film look', do: ['Teal and orange', 'Rain on glass'], dont: ['Faces in frame'] })
assert.deepEqual(ws.pinned, ['relight', 'color-grade'])
assert.equal('secret' in ws, false)
const saved = JSON.parse(fs.readFileSync(path.join(dir, 'workspaces.json'), 'utf8'))
assert.equal(saved.active, ws.id, 'Stored in workspaces.json with the new workspace active')
assert.equal(saved.workspaces.length, 2)
assert.throws(() => service.create({ name: '  ' }), /name/)
assert.equal(cleanWorkspace({ avatar: 'javascript:alert(1)' }).avatar, '', 'Only media, data or web URLs make an avatar')

// Update changes only the named fields; Default cannot be deleted; deleting the active one falls back to Default.
const renamed = service.update(ws.id, { description: 'City at night' })
assert.equal(renamed.name, 'Night drives')
assert.equal(renamed.criteria.text, 'Neon city at night, 35mm film look')
assert.throws(() => service.update(ws.id, { name: '' }), /name/)
assert.throws(() => service.remove(DEFAULT_WORKSPACE), /Default/)
assert.throws(() => service.activate('nope'), (e) => e.status === 404)
const other = service.create({ name: 'Kitchen tips', activate: false })
assert.equal(service.list().active, ws.id, 'activate: false keeps the current workspace')
service.activate(other.id)
assert.equal(service.active().id, other.id)
service.remove(other.id)
assert.equal(service.list().active, DEFAULT_WORKSPACE)
service.activate(ws.id)

// The rule: criteria join image and video prompts once, only while the toggle is on.
const block = criteriaText(renamed)
assert.equal(block, 'Neon city at night, 35mm film look\nDo: Teal and orange; Rain on glass.\nDo not: Faces in frame.')
const once = withCriteria('A taxi at a red light', renamed, 'image')
assert.equal(once, `A taxi at a red light\n\n${block}`)
assert.equal(withCriteria(once, renamed, 'image'), once, 'Retries and resumed runs do not add the criteria twice')
assert.equal(withCriteria('A taxi', renamed, 'audio'), 'A taxi', 'Speech and music prompts stay word for word')
assert.equal(withCriteria('', renamed, 'video'), '', 'An empty prompt (an upscale) stays empty')
assert.equal(withCriteria('A taxi', { ...renamed, appendCriteria: false }, 'video'), 'A taxi', 'Toggle off')
assert.equal(withCriteria('A taxi', { name: 'Empty', appendCriteria: true, criteria: { text: '', do: [], dont: [] } }, 'video'), 'A taxi')
assert.equal(service.withActiveCriteria('A taxi', 'video'), `A taxi\n\n${block}`, 'Server runs (Flows, MCP) read the active workspace')
service.update(ws.id, { appendCriteria: false })
assert.equal(service.withActiveCriteria('A taxi', 'video'), 'A taxi')

// Pinned formats first, in pin order; the rest keep their order.
const list = ['a', 'b', 'c', 'd'].map((id) => ({ id }))
assert.deepEqual(pinnedFirst(list, ['c', 'a']).map((f) => f.id), ['c', 'a', 'b', 'd'])
assert.equal(pinnedFirst(list, []), list)
assert.equal(initialsOf('night drives club'), 'ND')
assert.equal(initialsOf(''), '?')

// Routes, through the same handler the Vite plugin mounts.
const call = async (method, pathname, data) => {
  const req = Readable.from(data ? [JSON.stringify(data)] : [])
  req.method = method
  let out
  const handled = await workspaceRoute(req, {}, new URL(pathname, 'http://local'), {
    service,
    body: async (r) => { let raw = ''; for await (const c of r) raw += c; return raw ? JSON.parse(raw) : {} },
    send: (_, status, value) => { out = { status, value } },
  })
  return handled ? out : null
}
assert.equal((await call('GET', '/api/workspaces')).value.workspaces.length, 2)
const made = (await call('POST', '/api/workspaces', { name: 'Garden' })).value
assert.equal((await call('PATCH', `/api/workspaces/${made.id}`, { pinned: ['relight'] })).value.pinned[0], 'relight')
assert.equal((await call('POST', '/api/workspaces/active', { id: DEFAULT_WORKSPACE })).value.active, DEFAULT_WORKSPACE)
assert.equal((await call('DELETE', `/api/workspaces/${made.id}`)).value.workspaces.length, 2)
assert.equal(await call('GET', '/api/workspaceses'), null)

// A broken file reads as a fresh install instead of failing every page.
fs.writeFileSync(service.file(), '{ not json')
assert.equal(service.list().active, DEFAULT_WORKSPACE)
assert.equal(fs.readFileSync(`${service.file()}.broken`, 'utf8'), '{ not json', 'The broken file is kept')

// The two places generations start both call the shared rule.
const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
assert.match(read('src/lib/useGenerations.js'), /withCriteria\(opts\.prompt, ws, model\.kind\)/, 'Create and formats add criteria in execute')
assert.match(read('server/core.js'), /workspaces\.withActiveCriteria\(prompt, m\.kind\)/, 'Flows and MCP add criteria in core.generate')

fs.rmSync(dir, { recursive: true, force: true })
console.log('workspace checks ok: workspaces.json, routes, criteria rule, pinned order')
