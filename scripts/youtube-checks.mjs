// A workspace's YouTube channel against a mocked YouTube Data API v3. No key and no network.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { parseChannel, fetchChannel } from '../server/youtube.js'
import { createWorkspaces, workspaceRoute } from '../server/workspaces.js'
import { compactCount } from '../shared/workspaces.js'
import { providers } from '../server/core.js'
import { providerInfo } from '../src/lib/catalog.js'
import { youtubeMock } from './fixtures/youtube-mock.mjs'

// Every way people paste a channel.
assert.deepEqual(parseChannel('https://www.youtube.com/@NightDrives'), { handle: '@NightDrives' })
assert.deepEqual(parseChannel('youtube.com/@nightdrives/videos'), { handle: '@nightdrives' })
assert.deepEqual(parseChannel('m.youtube.com/@nightdrives?si=abc'), { handle: '@nightdrives' })
assert.deepEqual(parseChannel('@nightdrives'), { handle: '@nightdrives' })
assert.deepEqual(parseChannel(' nightdrives '), { handle: '@nightdrives' })
assert.deepEqual(parseChannel('https://www.youtube.com/channel/UCmockNightDrives000000a'), { id: 'UCmockNightDrives000000a' })
assert.deepEqual(parseChannel('UCmockNightDrives000000a'), { id: 'UCmockNightDrives000000a' })
assert.deepEqual(parseChannel('https://www.youtube.com/user/oldname'), { username: 'oldname' })
assert.throws(() => parseChannel(''), /Paste/)
assert.throws(() => parseChannel('https://www.youtube.com/watch?v=abc'), /@handle/)
assert.throws(() => parseChannel('not a handle!'), /handle/)

// The channel, then its six latest uploads; images go through the local cache.
const yt = youtubeMock()
const cached = []
const channel = await fetchChannel('youtube.com/@nightdrives', { key: 'mock-youtube-key', fetch: yt.fetch, cacheImage: async (url) => { cached.push(url); return `/media/${path.basename(url)}` } })
assert.equal(yt.calls.length, 2, 'One channels call and one playlistItems call')
assert.equal(yt.calls[0].searchParams.get('forHandle'), '@nightdrives')
assert.match(yt.calls[0].searchParams.get('part'), /snippet/)
assert.match(yt.calls[0].searchParams.get('part'), /statistics/)
assert.equal(yt.calls[1].searchParams.get('playlistId'), 'UUmockNightDrives000000a')
assert.equal(yt.calls[1].searchParams.get('maxResults'), '6')
assert.equal(channel.title, 'Night Drives')
assert.equal(channel.handle, '@nightdrives')
assert.equal(channel.subscribers, 128400)
assert.equal(channel.avatar, '/media/avatar.svg')
assert.equal(channel.banner, '/media/banner.svg=w1280')
assert.equal(channel.uploads.length, 6)
assert.deepEqual(channel.uploads.map((u) => u.thumb), [1, 2, 3, 4, 5, 6].map((n) => `/media/thumb-${n}.svg`))
assert.equal(channel.uploads[0].url, 'https://www.youtube.com/watch?v=vid1')
assert.equal(cached.length, 8, 'Avatar, banner and six thumbnails are saved locally')
assert.equal((await fetchChannel('UCmockNightDrives000000a', { key: 'mock-youtube-key', fetch: yt.fetch })).id, 'UCmockNightDrives000000a')
assert.equal((await fetchChannel('@nightdrives', { key: 'mock-youtube-key', fetch: youtubeMock({ hidden: true }).fetch })).subscribers, null, 'Hidden counts stay hidden')

await assert.rejects(fetchChannel('@nightdrives', { key: '', fetch: yt.fetch }), /Connections/)
await assert.rejects(fetchChannel('@nightdrives', { key: 'wrong', fetch: yt.fetch }), /refused the key/)
await assert.rejects(fetchChannel('@someoneelse', { key: 'mock-youtube-key', fetch: yt.fetch }), (e) => e.status === 404)
await assert.rejects(fetchChannel('@nightdrives', { key: 'k', fetch: async () => ({ ok: false, status: 403, json: async () => ({ error: { message: 'quota', errors: [{ reason: 'quotaExceeded' }] } }) }) }), /quota/)
await assert.rejects(fetchChannel('@nightdrives', { key: 'k', fetch: async () => { throw new Error('offline') } }), /Could not reach YouTube/)

assert.equal(compactCount(128400), '128K', 'Three figures, as YouTube shows it')
assert.equal(compactCount(12400), '12.4K')
assert.equal(compactCount(999), '999')
assert.equal(compactCount(2_150_000), '2.1M')
assert.equal(compactCount(150_000_000), '150M')

// The key lives in Connections, with the other provider keys.
assert.deepEqual(providers.youtube, { env: ['YOUTUBE_API_KEY'], fields: ['key'] })
assert.equal(providerInfo.youtube.fields[0].secret, true)

// Routes: connect caches the channel in workspaces.json, refresh reuses the saved link, disconnect drops it.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-youtube-'))
const service = createWorkspaces({ directory: () => dir })
const ws = service.create({ name: 'Night drives' })
const seen = []
const youtube = (input) => { seen.push(input); return fetchChannel(input, { key: 'mock-youtube-key', fetch: yt.fetch }) }
const call = async (method, pathname, data) => {
  const req = Readable.from(data ? [JSON.stringify(data)] : [])
  req.method = method
  let out
  await workspaceRoute(req, {}, new URL(pathname, 'http://local'), {
    service, youtube,
    body: async (r) => { let raw = ''; for await (const c of r) raw += c; return raw ? JSON.parse(raw) : {} },
    send: (_, status, value) => { out = { status, value } },
  })
  return out
}
const connected = (await call('POST', `/api/workspaces/${ws.id}/youtube`, { channel: '@nightdrives' })).value
assert.equal(connected.youtube.title, 'Night Drives')
assert.equal(JSON.parse(fs.readFileSync(service.file(), 'utf8')).workspaces.find((w) => w.id === ws.id).youtube.uploads.length, 6, 'Cached in workspaces.json')
assert.equal(service.list().workspaces.find((w) => w.id === ws.id).youtube.subscribers, 128400, 'Read back without calling YouTube')
await call('POST', `/api/workspaces/${ws.id}/youtube`, {})
assert.deepEqual(seen, ['@nightdrives', '@nightdrives'], 'Refresh uses the saved link')
assert.equal(service.update(ws.id, { description: 'x' }).youtube.title, 'Night Drives', 'Editing the workspace keeps the channel')
assert.equal('youtube' in (await call('DELETE', `/api/workspaces/${ws.id}/youtube`)).value, false)
fs.rmSync(dir, { recursive: true, force: true })

console.log('YouTube checks ok against a mocked Data API: link parsing, channel and six uploads, local image cache, errors, cached in workspaces.json, refresh and disconnect. The real API call is unproven without a key.')
