// Flow sharing: what a shared flow strips, how import validates, and the gist calls against a mocked
// api.github.com. No network: every GitHub call goes to the fake fetch below.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { shareFlow, shareText, shareFileName, parseSharedFlow, isLocalMedia, originLabel, SHARE_LIMIT } from '../shared/flowShare.js'
import { gistId, createGist, readGist } from '../server/gist.js'
import { createFlows } from '../server/flows.js'
import { importFlow, shareFlowGist } from '../server/share.js'

const ID = 'aa11bb22cc33dd44ee55ff6677889900'
const flow = {
  id: 'f1', name: 'My flow / test', updated: 1, selected: true,
  nodes: [
    { id: 'p', type: 'prompt', position: { x: 0, y: 0 }, selected: true, data: { mode: 'single', text: 'A boat at dusk' } },
    { id: 'img', type: 'image', position: { x: 0, y: 200 }, data: { url: '/media/abc.png', name: 'me.png' } },
    { id: 'mask', type: 'mask', position: { x: 0, y: 400 }, data: { value: { url: '/media/m.png', maskUrl: 'data:image/png;base64,AAAA' } } },
    { id: 'm', type: 'model', position: { x: 300, y: 0 }, data: { kind: 'image', model: { id: 'comfy-flux', name: 'FLUX' }, prompt: 'Slow push in', reference: 'C:\\Users\\me\\ref.png', takes: 1 } },
    { id: 's', type: 'stitch', position: { x: 600, y: 0 }, data: { clips: [{ id: 'u', url: '/media/clip.mp4', name: 'mine.mp4' }, { id: 'up', upstream: 'm', caption: 'Hello' }], music: { url: '/media/song.mp3', name: 'song.mp3', volume: 0.4 } } },
    { id: 'o', type: 'output', position: { x: 900, y: 0 }, data: {} },
  ],
  edges: [{ id: 'p-m', source: 'p', target: 'm', animated: true }, { id: 'm-o', source: 'm', target: 'o' }],
}

// Stripping: no uploads, no local paths, no canvas state; prompts and settings stay.
const shared = shareFlow(flow)
const text = JSON.stringify(shared)
assert.equal(shared.comfyfield, 'flow')
assert.equal(shared.flow.id, undefined, 'the flow id stays local')
assert.ok(!/\/media\/|data:|C:\\\\Users|me\.png|mine\.mp4|song\.mp3/.test(text), `local media left in ${text}`)
assert.ok(!/selected|animated|updated/.test(text), 'canvas state is dropped')
const node = (id) => shared.flow.nodes.find((n) => n.id === id)
assert.deepEqual(node('img').data, { url: null, name: '' })
assert.deepEqual(node('mask').data, { value: null })
assert.equal(node('p').data.text, 'A boat at dusk')
assert.equal(node('m').data.reference, null, 'a setting that is a local path is dropped')
assert.equal(node('m').data.prompt, 'Slow push in')
assert.deepEqual(node('s').data.clips, [{ id: 'up', upstream: 'm', caption: 'Hello' }])
assert.deepEqual(node('s').data.music, { volume: 0.4 })
assert.equal(shareFileName(flow.name), 'my-flow-test.comfyfield.json')
assert.equal(shareFileName(''), 'flow.comfyfield.json')
for (const local of ['/media/a.png', 'blob:http://x/1', 'file:///a', 'D:\\a.png', '/Users/me/a.png', '/comfy/view?x']) assert.ok(isLocalMedia(local), local)
for (const remote of ['https://example.com/a.png', 'A boat', '16:9']) assert.ok(!isLocalMedia(remote), remote)

// Parsing: the round trip works, and broken or foreign files say what is wrong.
const back = parseSharedFlow(shareText(flow))
assert.equal(back.name, 'My flow / test')
assert.equal(back.nodes.length, 6)
assert.deepEqual(back.edges.map((e) => e.id), ['p-m', 'm-o'])
assert.equal(parseSharedFlow(JSON.stringify({ nodes: [], edges: [] })).name, 'Imported flow')
// An older export (plain flow with media) is stripped on the way in too.
assert.equal(parseSharedFlow(JSON.stringify({ comfyfield: 'flow', version: 1, flow })).nodes.find((n) => n.id === 'img').data.url, null)
const refuses = (input, pattern) => assert.throws(() => parseSharedFlow(input), (e) => e.status === 400 && pattern.test(e.message), String(input).slice(0, 60))
refuses('', /empty/)
refuses('{not json', /not JSON/)
refuses(JSON.stringify({ comfyfield: 'format', format: {} }), /format file/)
refuses(JSON.stringify({ hello: 1 }), /not a ComfyField flow/)
refuses(JSON.stringify({ nodes: [{ id: 'x', type: 'teleport', position: { x: 0, y: 0 } }], edges: [] }), /node type/)
refuses(JSON.stringify({ nodes: [{ id: 'x', type: 'note' }, { id: 'x', type: 'note' }], edges: [] }), /own id/)
refuses(JSON.stringify({ nodes: [{ id: 'p', type: 'prompt' }, { id: 'o', type: 'output' }], edges: [{ source: 'p', target: 'o' }] }), /connection/)
refuses(JSON.stringify({ nodes: [{ id: 'a', type: 'note', data: { text: 'x'.repeat(SHARE_LIMIT) } }], edges: [] }), /1 MB/)
assert.equal(originLabel({ kind: 'gist', owner: 'octo' }), "Imported from octo's gist")
assert.equal(originLabel({ kind: 'file', name: 'boat.comfyfield.json' }), 'Imported from boat.comfyfield.json')

// Gist links.
for (const link of [ID, `https://gist.github.com/octo/${ID}`, `https://gist.github.com/${ID}`, `https://gist.github.com/octo/${ID}/rev1abc#file-x`,
  `https://gist.githubusercontent.com/octo/${ID}/raw/abc/flow.comfyfield.json`, `https://api.github.com/gists/${ID}`]) assert.equal(gistId(link), ID, link)
for (const link of ['https://example.com/octo/' + ID, 'http://gist.github.com/octo/' + ID, 'https://gist.github.com/octo', 'nope', '']) assert.throws(() => gistId(link), /gist/, link)

// A fake api.github.com: records calls, answers like GitHub.
const calls = []
const gists = new Map()
const reply = (status, data, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } })
const github = async (url, init = {}) => {
  const u = new URL(url)
  assert.equal(u.hostname, 'api.github.com', `only api.github.com is called, not ${url}`)
  calls.push({ url, method: init.method || 'GET', headers: init.headers, body: init.body && JSON.parse(init.body) })
  if (init.headers.Authorization === 'Bearer bad') return reply(401, { message: 'Bad credentials' })
  if (u.pathname === '/gists' && init.method === 'POST') {
    const id = ID.slice(0, 31) + gists.size
    gists.set(id, { id, html_url: `https://gist.github.com/octo/${id}`, owner: { login: 'octo' }, files: Object.fromEntries(Object.entries(JSON.parse(init.body).files).map(([filename, f]) => [filename, { filename, content: f.content, truncated: false }])) })
    return reply(201, gists.get(id))
  }
  const id = /^\/gists\/(\w+)$/.exec(u.pathname)?.[1]
  return gists.has(id) ? reply(200, gists.get(id)) : reply(404, { message: 'Not Found' })
}

const made = await createGist({ token: 'tok', filename: 'a.comfyfield.json', content: shareText(flow), description: 'ComfyField flow: x', fetch: github })
assert.match(made.url, /^https:\/\/gist\.github\.com\/octo\//)
assert.equal(calls[0].headers.Authorization, 'Bearer tok')
assert.equal(calls[0].body.public, false, 'gists are secret')
assert.ok(!calls[0].body.files['a.comfyfield.json'].content.includes('/media/'))
await assert.rejects(createGist({ token: '', filename: 'a', content: '{}', fetch: github }), /Add a GitHub token/)
await assert.rejects(createGist({ token: 'bad', filename: 'a', content: '{}', fetch: github }), (e) => e.status === 401 && /refused the token/.test(e.message))
await assert.rejects(createGist({ token: 'tok', filename: 'a', content: 'x'.repeat(SHARE_LIMIT + 1), fetch: github }), /too large/)

const read = await readGist(made.url, { suffix: '.comfyfield.json', fetch: github })
assert.equal(read.origin.owner, 'octo')
assert.equal(read.origin.url, made.url)
assert.equal(parseSharedFlow(read.text).nodes.length, 6)
assert.equal(calls.at(-1).headers.Authorization, undefined, 'reading needs no token')
await assert.rejects(readGist(`https://gist.github.com/octo/${'f'.repeat(32)}`, { suffix: '.comfyfield.json', fetch: github }), (e) => e.status === 404)
gists.set('b'.repeat(32), { id: 'b'.repeat(32), files: { 'x.comfyfield.json': { filename: 'x.comfyfield.json', content: '{}', truncated: true } } })
await assert.rejects(readGist('b'.repeat(32), { suffix: '.comfyfield.json', fetch: github }), /larger than 1 MB/)
gists.set('c'.repeat(32), { id: 'c'.repeat(32), files: { 'a.md': { filename: 'a.md', content: '#' }, 'b.json': { filename: 'b.json', content: '{}' }, 'c.json': { filename: 'c.json', content: '{}' } } })
await assert.rejects(readGist('c'.repeat(32), { suffix: '.comfyfield.json', fetch: github }), /no \.comfyfield\.json file/)
const big = async () => new Response('x'.repeat(10), { headers: { 'content-length': String(SHARE_LIMIT * 5) } })
await assert.rejects(readGist(ID, { suffix: '.comfyfield.json', fetch: big }), (e) => e.status === 413)

// Through the flow store: share reads the saved flow, import adds a new flow with its origin.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comfyfield-share-'))
try {
  const store = createFlows({ directory: () => dir })
  const saved = store.create({ name: 'Boat', nodes: [{ id: 'p', type: 'prompt', data: { text: 'A boat' } }, { id: 'img', type: 'image', data: { url: '/media/x.png', name: 'x.png' } }, { id: 'o', type: 'output' }] })
  store.add(saved.id, { id: 'm', type: 'model', data: { model: 'comfy-flux' } })
  store.connect(saved.id, { source: 'p', target: 'm' })
  const gist = await shareFlowGist(store, saved.id, { fetch: github, token: 'tok' })
  const posted = calls.at(-1).body
  assert.equal(Object.keys(posted.files)[0], 'boat.comfyfield.json')
  assert.ok(!JSON.stringify(posted).includes('/media/'), 'the gist holds no uploads')
  assert.ok(!JSON.stringify(posted).includes('tok'), 'the gist holds no token')
  await assert.rejects(shareFlowGist(store, saved.id, { fetch: github, token: '' }), /Add a GitHub token/)

  const before = store.read().flows.length
  const imported = await importFlow(store, { gist: gist.url }, { fetch: github, token: '', now: 1700000000000 })
  assert.notEqual(imported.id, saved.id, 'an import is a new flow')
  assert.deepEqual(imported.origin, { kind: 'gist', url: gist.url, id: gist.id, owner: 'octo', name: 'boat.comfyfield.json', at: 1700000000000 })
  const after = store.read()
  assert.equal(after.flows.length, before + 1)
  assert.equal(after.current, imported.id, 'the imported flow opens')
  assert.equal(after.runs[imported.id], undefined, 'no results come along')
  assert.equal(after.flows.find((f) => f.id === imported.id).nodes.find((n) => n.id === 'img').data.url, null)

  const file = await importFlow(store, { text: shareText(saved), name: 'C:\\evil/..\\boat.comfyfield.json' }, { now: 5 })
  assert.deepEqual(file.origin, { kind: 'file', name: 'boat.comfyfield.json', at: 5 })
  // The server checks models too: a flow naming a model this catalog lacks is refused, and nothing is saved.
  const unknown = JSON.stringify({ nodes: [{ id: 'm', type: 'model', position: { x: 0, y: 0 }, data: { model: { id: 'nope-model-xyz' } } }], edges: [] })
  const count = store.read().flows.length
  await assert.rejects(importFlow(store, { text: unknown, name: 'x.json' }), (e) => e.status === 400)
  assert.equal(store.read().flows.length, count)
  await assert.rejects(importFlow(store, {}), /gist link or a flow file/)
} finally { fs.rmSync(dir, { recursive: true, force: true }) }

console.log('Share checks passed: stripping, parsing, gist links, mocked gist create and read, import with origin')
