// Format sharing: export as plain data, import through the catalog validator, the Yours store and the
// gist calls against a mocked api.github.com. No network.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { formats, allFormats, appsIn, formatById, isWired, setUserFormats, userFormats } from '../src/lib/formats/index.js'
import { cleanFormat, formatFile, formatText, formatFileName, parseSharedFormat, freeId, FORMAT_LIMIT } from '../src/lib/formats/share.js'
import { appGroups } from '../src/components/apps/data.js'
import { createUserFormats } from '../server/userFormats.js'

// Every validated catalog format exports and imports cleanly.
for (const f of formats) parseSharedFormat(formatText(f))
const comfy = formats.find((f) => f.steps.some((s) => s.provider === 'comfy' || s.workflow))
const fal = formats.find((f) => f.steps.some((s) => s.provider === 'fal'))
assert.ok(comfy && fal, 'the catalog has a Comfy and a fal format to test with')

// Export is data only: no listing, origin, remote preview or functions; covers are gradients.
const exported = formatFile({ ...comfy, hub: 'trending', origin: { kind: 'file' }, preview: 'https://x.test/a.mp4', featured: true, extra: () => 1, cover: 'url(https://tracker.test/a.png)' }).format
for (const field of ['hub', 'origin', 'preview', 'featured', 'extra']) assert.equal(exported[field], undefined, field)
assert.match(exported.cover, /^linear-gradient\(/)
assert.equal(cleanFormat({ ...comfy, cover: 'linear-gradient(135deg, #fff, #000)' }).cover, 'linear-gradient(135deg, #fff, #000)')
assert.equal(formatFileName({ id: 'my look' }), 'my-look.comfyfield-format.json')

// Import refuses what this version cannot run, and says why.
const text = (format) => JSON.stringify({ comfyfield: 'format', version: 1, format })
const refuses = (input, pattern) => assert.throws(() => parseSharedFormat(input), (e) => e.status === 400 && pattern.test(e.message), String(input).slice(0, 80))
refuses('', /empty/)
refuses('nope', /not JSON/)
refuses(JSON.stringify({ comfyfield: 'flow', flow: {} }), /flow file/)
refuses(JSON.stringify({ id: 'x' }), /not a ComfyField format/)
refuses(text({ ...comfy, id: '../x' }), /needs an id/)
refuses(text({ ...comfy, name: '' }), /needs a name/)
refuses(text({ ...comfy, kind: 'hologram' }), /unknown kind/)
refuses(text({ ...comfy, steps: comfy.steps.map((s) => (s.type ? s : { ...s, workflow: 'not_a_bundled_workflow' })) }), /cannot run in this version.*not_a_bundled_workflow/)
refuses(text({ ...fal, steps: fal.steps.map((s) => (s.type ? s : { ...s, endpoint: 'fal-ai/not-a-real-endpoint' })) }), /cannot run in this version/)
refuses(text({ ...comfy, steps: [{ id: 'g', model: 'no-such-model', kind: comfy.kind }], outputs: [{ step: 'g', kind: comfy.kind }] }), /Unknown model/)
refuses(text({ ...comfy, blurb: 'x'.repeat(FORMAT_LIMIT) }), /larger than 256 KB/)
assert.equal(freeId('a', new Set()), 'a')
assert.equal(freeId('a', new Set(['a'])), 'a-yours')
assert.equal(freeId('a', new Set(['a', 'a-yours'])), 'a-yours-2')

// The Yours store: built-in ids get a suffix, the origin is stamped, the same id again replaces.
const ID = 'aa11bb22cc33dd44ee55ff6677889900'
const posted = []
const github = async (url, init = {}) => {
  const u = new URL(url)
  assert.equal(u.hostname, 'api.github.com', `only api.github.com is called, not ${url}`)
  const reply = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
  if (u.pathname === '/gists' && init.method === 'POST') {
    posted.push({ headers: init.headers, body: JSON.parse(init.body) })
    return reply(201, { id: ID, html_url: `https://gist.github.com/octo/${ID}` })
  }
  if (u.pathname === `/gists/${ID}` && posted.length) {
    const files = Object.fromEntries(Object.entries(posted.at(-1).body.files).map(([filename, f]) => [filename, { filename, content: f.content }]))
    return reply(200, { id: ID, html_url: `https://gist.github.com/octo/${ID}`, owner: { login: 'octo' }, files })
  }
  return reply(404, { message: 'Not Found' })
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comfyfield-formats-'))
try {
  const store = createUserFormats({ directory: () => dir, builtIns: async () => new Set(allFormats.map((f) => f.id)) })
  assert.deepEqual(store.list(), [])
  const a = await store.import({ text: formatText(comfy), name: 'C:\\Users\\me\\look.comfyfield-format.json' }, { now: 7 })
  assert.equal(a.id, `${comfy.id}-yours`, 'a built-in id gets a suffix')
  assert.deepEqual(a.origin, { kind: 'file', name: 'look.comfyfield-format.json', at: 7 })
  const custom = { ...cleanFormat(comfy), id: 'my-own-look', name: 'My own look' }
  await store.import({ text: formatText(custom) })
  await store.import({ text: formatText({ ...custom, name: 'My own look, v2' }) })
  assert.deepEqual(store.list().map((f) => [f.id, f.name]), [['my-own-look', 'My own look, v2'], [a.id, a.name]])
  const count = store.list().length
  await assert.rejects(store.import({ text: text({ ...comfy, steps: [{ id: 'g', model: 'no-such-model', kind: comfy.kind }], outputs: [{ step: 'g', kind: comfy.kind }] }) }), (e) => e.status === 400)
  assert.equal(store.list().length, count, 'a refused format is not saved')
  await assert.rejects(store.import({}), /gist link or a format file/)

  // Gist share posts the clean definition with the token; import from that gist names its owner.
  await assert.rejects(store.share(custom, { fetch: github, token: '' }), /Add a GitHub token/)
  const gist = await store.share({ ...custom, hub: 'yours', origin: { kind: 'file' } }, { fetch: github, token: 'tok' })
  assert.equal(gist.url, `https://gist.github.com/octo/${ID}`)
  assert.equal(posted[0].headers.Authorization, 'Bearer tok')
  assert.equal(posted[0].body.public, false)
  assert.deepEqual(Object.keys(posted[0].body.files), ['my-own-look.comfyfield-format.json'])
  const content = posted[0].body.files['my-own-look.comfyfield-format.json'].content
  assert.ok(!content.includes('"origin"') && !content.includes('"hub"') && !content.includes('tok'), content)
  await assert.rejects(store.share({ ...custom, steps: [] }, { fetch: github, token: 'tok' }), (e) => e.status === 400)
  const fromGist = await store.import({ gist: gist.url }, { fetch: github, token: '', now: 9 })
  assert.deepEqual(fromGist.origin, { kind: 'gist', url: gist.url, id: ID, owner: 'octo', name: 'my-own-look.comfyfield-format.json', at: 9 })
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'formats.json'), 'utf8')).formats.length, 2)

  // In the app: imported formats are found by id, wired, and listed first as Yours.
  setUserFormats(store.list())
  assert.equal(formatById('my-own-look').hub, 'yours')
  assert.ok(isWired(formatById('my-own-look')))
  assert.equal(appsIn('yours').length, 2)
  assert.equal(appGroups()[0].id, 'yours')
  assert.equal(appGroups()[0].name, 'Yours')
  store.remove('my-own-look')
  assert.deepEqual(store.list().map((f) => f.id), [a.id])
  assert.throws(() => store.remove('my-own-look'), (e) => e.status === 404)
  setUserFormats([])
  assert.equal(userFormats().length, 0)
  assert.notEqual(appGroups()[0].id, 'yours', 'no Yours group without imports')
} finally { fs.rmSync(dir, { recursive: true, force: true }) }

console.log(`Format share checks passed: ${formats.length} catalog formats round-trip, refusals, Yours store, mocked gist share and import`)
