import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'
import { spawn, spawnSync } from 'node:child_process'
import { createServer as createViteServer } from 'vite'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import * as core from '../server/core.js'
import { createServer } from '../server/mcp.js'

// A fresh isolated home: never inspect real keys or load .env.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comfyfield-postiz-'))
process.env.COMFYFIELD_HOME = dir
for (const provider of Object.values(core.providers)) for (const name of provider.env) process.env[name] = ''
let creates = 0, uploads = 0, payload, failCreate = false, createStatus = 500, incomplete = false
const mock = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  if (req.headers.authorization !== 'mock-postiz-key') { res.statusCode = 401; return res.end('{}') }
  if (req.url === '/public/v1/integrations') return res.end(JSON.stringify([{ id: 'channel-1', name: 'Mock channel', identifier: 'bluesky' }]))
  let raw = ''
  for await (const chunk of req) raw += chunk
  if (req.url === '/public/v1/upload') {
    uploads++
    assert.match(req.headers['content-type'], /multipart\/form-data/)
    assert.match(raw, /name="file"/)
    assert.match(raw, /name="adjust"/)
    return res.end(JSON.stringify({ id: 'media-1', path: 'https://uploads.postiz.com/mock.png' }))
  }
  if (req.url === '/public/v1/posts') {
    creates++
    payload = JSON.parse(raw)
    if (failCreate) { res.statusCode = createStatus; return res.end('{}') }
    if (incomplete) return res.end('[]')
    return res.end(JSON.stringify([{ postId: 'post-1', integration: 'channel-1' }]))
  }
  res.statusCode = 404
  res.end('{}')
})
await new Promise((r) => mock.listen(0, '127.0.0.1', r))
const url = `http://127.0.0.1:${mock.address().port}/public/v1`
let server, client
try {
  assert.equal(core.config('postiz').url, 'https://api.postiz.com/public/v1')
  core.saveConnection('postiz', { key: 'mock-postiz-key', url })
  assert.equal(core.connections().postiz.url, url)
  await assert.rejects(core.schedulePost(null), { status: 400 })
  assert.equal((await core.postizChannels())[0].id, 'channel-1')
  assert.equal(await core.testConnection('postiz'), true)
  assert.equal(creates + uploads, 0)
  fs.mkdirSync(path.dirname(core.mediaPath('sample.png')), { recursive: true })
  fs.writeFileSync(core.mediaPath('sample.png'), Buffer.from('mock image'))
  const input = { media: ['/media/sample.png'], caption: 'Caption', channels: ['channel-1'], date: '2099-10-30T17:00:00Z', requestKey: 'test-1' }
  assert.equal((await core.schedulePost(input)).result[0].postId, 'post-1')
  assert.equal(uploads, 1)
  assert.equal(payload.type, 'schedule')
  assert.equal(payload.posts[0].settings.__type, 'bluesky')
  assert.deepEqual(payload.posts[0].value[0], { content: 'Caption', image: [{ id: 'media-1', path: 'https://uploads.postiz.com/mock.png' }] })
  await assert.rejects(core.schedulePost(input), /already reserved/)
  assert.equal(creates, 1)
  await core.schedulePost({ ...input, requestKey: 'draft', draft: true, date: undefined })
  assert.equal(payload.type, 'draft')
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'past', date: '2000-01-01T00:00:00Z' }), /future/)
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'unknown', channels: ['missing'] }), /unavailable/)
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'escape', media: [path.join(dir, 'outside.png')] }), /missing/)
  fs.writeFileSync(path.join(dir, 'outside.png'), 'private')
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'outside', media: [path.join(dir, 'outside.png')] }), /inside/)
  if (process.platform !== 'win32') {
    fs.symlinkSync(path.join(dir, 'outside.png'), core.mediaPath('escape.png'))
    await assert.rejects(core.schedulePost({ ...input, requestKey: 'symlink', media: ['/media/escape.png'] }), /inside/)
  }
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'private', media: ['http://127.0.0.1/secret.png'] }), /Private|reserved/)
  failCreate = true
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'uncertain' }), /500/)
  failCreate = false
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'uncertain' }), /already reserved/)
  createStatus = 429
  failCreate = true
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'rate-limited' }), /rate limit/)
  failCreate = false
  incomplete = true
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'incomplete' }), /incomplete result/)
  incomplete = false
  await assert.rejects(core.schedulePost({ ...input, requestKey: 'incomplete' }), /already reserved/)
  const concurrent = await Promise.allSettled([core.schedulePost({ ...input, requestKey: 'concurrent' }), core.schedulePost({ ...input, requestKey: 'concurrent' })])
  assert.equal(concurrent.filter((r) => r.status === 'fulfilled').length, 1)
  const restart = spawnSync(process.execPath, ['--input-type=module', '-e', `import { schedulePost } from './server/core.js'; try { await schedulePost(${JSON.stringify(input)}); process.exit(2) } catch(e) { if(e.status !== 409) process.exit(3) }`], { encoding: 'utf8', timeout: 20000 })
  assert.equal(restart.status, 0, restart.stderr)
  core.saveConnection('postiz', { key: 'bad' })
  await assert.rejects(core.postizChannels(), /rejected the API key/)
  core.saveConnection('postiz', { key: 'mock-postiz-key' })
  const item = core.queueAdd({ channel: 'channel-1', idea: 'Next story' })
  assert.equal(core.queueList({ channel: 'channel-1' }).length, 1)
  assert.equal(core.queueList({ channel: 'other' }).length, 0)
  assert.equal(core.queueUpdate(item.id, { status: 'made', libraryItem: '/media/sample.png' }).status, 'made')
  assert.throws(() => core.queueUpdate(item.id, { status: 'invalid' }), /status/)
  assert.equal(core.queueRemove(item.id).id, item.id)
  assert.equal(core.queueList().length, 0)
  assert.throws(() => core.queueUpdate(item.id, {}), /not found/)
  const handlers = new Map()
  server = createServer({ handlers })
  client = new Client({ name: 'postiz-checks', version: '1' })
  const [a, b] = InMemoryTransport.createLinkedPair()
  await Promise.all([server.connect(a), client.connect(b)])
  const listed = (await client.listTools()).tools.map((t) => t.name)
  for (const name of ['postiz_channels', 'schedule_post', 'queue_list', 'queue_add', 'queue_update', 'queue_remove']) assert.ok(listed.includes(name), name)
  assert.equal((await client.callTool({ name: 'postiz_channels', arguments: {} })).isError, undefined)
  const vite = await createViteServer({ envFile: false, server: { host: '127.0.0.1', port: 0 }, optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'error' })
  try {
    await vite.listen()
    const base = `http://127.0.0.1:${vite.httpServer.address().port}`
    assert.equal((await (await fetch(`${base}/api/postiz/channels`)).json())[0].id, 'channel-1')
    const added = await (await fetch(`${base}/api/queue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: 'channel-1', idea: 'HTTP idea' }) })).json()
    assert.equal(added.idea, 'HTTP idea')
    assert.equal((await (await fetch(`${base}/api/queue/${added.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'made' }) })).json()).status, 'made')
    assert.equal((await fetch(`${base}/api/queue/${added.id}`, { method: 'DELETE' })).status, 200)
    const scheduled = await fetch(`${base}/api/postiz/schedule`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, requestKey: 'http-draft', draft: true }) })
    assert.equal(scheduled.status, 200)
    assert.equal(payload.type, 'draft')
  } finally { await vite.close() }
  const cli = spawnSync(process.execPath, ['bin/comfyfield.js', 'queue', 'add', '--channel', 'channel-1', '--idea', 'CLI idea'], { encoding: 'utf8', timeout: 20000 })
  assert.equal(cli.status, 0, cli.stderr)
  assert.equal(JSON.parse(cli.stdout).idea, 'CLI idea')
  const cliSchedule = () => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['bin/comfyfield.js', 'schedule', '/media/sample.png', '--channel', 'channel-1', '--at', input.date, '--caption', 'CLI post'], { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = '', stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.once('error', reject)
    child.once('close', (status) => resolve({ status, stdout, stderr }))
  })
  const cliPost = await cliSchedule()
  assert.equal(cliPost.status, 0, cliPost.stderr)
  assert.match(JSON.parse(cliPost.stdout).requestKey, /^cli-/)
  const retry = await cliSchedule()
  assert.equal(retry.status, 1)
  assert.match(retry.stderr, /already reserved/)

  console.log('Postiz checks passed: channels, upload/create, drafts, duplicate/restart/concurrency refusal, validation, local containment, private URL refusal, uncertain responses, bad key, queue CRUD, CLI and MCP listing')
} finally {
  await client?.close()
  await server?.close()
  await new Promise((r) => mock.close(r))
  // Temporary fixtures are intentionally retained for inspection.
}
