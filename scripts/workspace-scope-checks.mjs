// Everything made belongs to a workspace: the migration to Default, new flows and saves that keep the id.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-ws-scope-'))
// core.home() reads this, so the Library route and CLI imports use the temp folder too.
process.env.COMFYFIELD_HOME = dir
const home = path.join(dir, '.comfyfield')
fs.mkdirSync(home, { recursive: true })
const { createWorkspaces, migrateToWorkspaces, keepWorkspace } = await import('../server/workspaces.js')
const { createFlows } = await import('../server/flows.js')
const { inWorkspace, workspaceOf, DEFAULT_WORKSPACE } = await import('../shared/workspaces.js')
const directory = () => home
const file = (name) => path.join(home, name)
const json = (name) => JSON.parse(fs.readFileSync(file(name), 'utf8'))
const put = (name, value) => fs.writeFileSync(file(name), JSON.stringify(value))

// Before workspaces: characters, products, brand kits, flows and CLI imports carry no workspace id.
put('library.json', {
  characters: [{ id: 'c1', name: 'Mara' }],
  products: [{ id: 'p1', name: 'Cold brew' }, { id: 'p2', name: 'Mug', workspace: 'kept' }],
  brands: [{ id: 'b1', name: 'Northwind' }],
})
put('flows.json', { revision: 7, current: 'f1', runs: {}, flows: [{ id: 'f1', name: 'Old flow', nodes: [], edges: [] }] })
put('generation-imports.json', [{ id: 'g1', url: '/media/a.png', kind: 'image' }])

assert.equal(migrateToWorkspaces({ directory }), 5, 'Five items move to Default; one already had a workspace')
const lib = json('library.json')
assert.deepEqual([...lib.characters, ...lib.products, ...lib.brands].map((x) => x.workspace), ['default', 'default', 'kept', 'default'])
assert.equal(json('flows.json').flows[0].workspace, 'default')
assert.equal(json('flows.json').revision, 7, 'The migration is not an edit; the open canvas can still save')
assert.equal(json('generation-imports.json')[0].workspace, 'default')
const snapshot = ['library.json', 'flows.json', 'generation-imports.json'].map((n) => fs.readFileSync(file(n), 'utf8'))
assert.equal(migrateToWorkspaces({ directory }), 0, 'Running it again moves nothing')
assert.deepEqual(['library.json', 'flows.json', 'generation-imports.json'].map((n) => fs.readFileSync(file(n), 'utf8')), snapshot, 'and writes nothing')
assert.equal(migrateToWorkspaces({ directory: () => path.join(dir, 'empty') }), 0, 'A fresh install has nothing to move')

// New flows made by an agent belong to the active workspace.
const workspaces = createWorkspaces({ directory })
const night = workspaces.create({ name: 'Night drives' })
const flows = createFlows({ directory, generate: async () => [] })
const made = flows.create({ name: 'Agent flow' })
assert.equal(made.workspace, night.id)
assert.equal(flows.get(made.id).workspace, night.id)

// A canvas loaded before the migration saves flows without the id; the stored id stays.
const store = flows.read()
const stale = store.flows.map(({ workspace, ...f }) => f)
const saved = flows.save({ ...store, flows: [...stale, { id: 'f2', name: 'New in old tab', nodes: [], edges: [] }] })
assert.deepEqual(saved.flows.map((f) => f.workspace), [night.id, 'default', undefined])
assert.equal(workspaceOf(saved.flows[2]), 'default', 'A flow sent with no id at all reads as Default')
assert.deepEqual(keepWorkspace({ id: 'x', workspace: 'a' }, { workspace: 'b' }).workspace, 'a', 'A sent id wins')

// Filters: an id or Default; null scope is All.
assert.equal(workspaceOf({}), DEFAULT_WORKSPACE)
assert(inWorkspace({}, DEFAULT_WORKSPACE))
assert(!inWorkspace({ workspace: night.id }, DEFAULT_WORKSPACE))
assert(inWorkspace({ workspace: night.id }, null))

// CLI and MCP proofs land in the active workspace.
const core = await import('../server/core.js')
fs.mkdirSync(path.join(home, 'media'), { recursive: true })
const media = core.saveMedia(Buffer.from('png'), 'png')
const [imported] = await core.saveToLibrary([{ url: media.url, kind: 'image' }])
assert.equal(imported.workspace, night.id)

// The app stamps new takes, Library elements and flows with the active workspace.
const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
assert.match(read('src/lib/useGenerations.js'), /const workspace = previous\?\.workspace \|\| activeWorkspace\(\)\.id/)
assert.match(read('src/lib/useLibrary.js'), /workspace: activeWorkspace\(\)\.id, \.\.\.data/)
assert.equal(read('src/lib/flowStore.js').match(/workspace: activeWorkspace\(\)\.id/g).length, 3, 'Starters, blank and imported flows')
assert.match(read('server/plugin.js'), /migrateToWorkspaces\(\)/, 'The app server runs the migration when it starts')

fs.rmSync(dir, { recursive: true, force: true })
console.log('workspace scope checks ok: idempotent move to Default, agent flows and imports in the active workspace, stale saves keep ids, filters')
