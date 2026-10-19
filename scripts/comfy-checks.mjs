import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { Comfy } from '@comfyorg/sdk'
import * as core from '../server/core.js'
import { comfyRouterInput } from '../shared/mapping.js'

fs.mkdirSync('outputs', { recursive: true })
process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.resolve('outputs/comfy-check-'))
process.env.COMFY_API_KEY = ''
process.env.COMFY_URL = ''
process.env.COMFY_MODE = ''
process.env.COMFY_BASE_URL = ''
const key = 'mock-comfy-key'
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } })
// A local ComfyUI is for development only, so it comes from the environment, never from saved settings.
const setup = (mode = 'local') => {
  process.env.COMFY_MODE = mode === 'local' ? 'local' : ''
  process.env.COMFY_URL = mode === 'local' ? 'http://127.0.0.1:8188' : ''
  core.saveConnection('comfy', { key })
}
const job = { request_id: 'request-1', status: 'IN_QUEUE' }
const noWait = { pause: async () => {} }

await test('Comfy Router submit, Retry-After polling, native result and credentials', async () => {
  setup()
  const calls = []
  const pauses = []
  const replies = [json(job, 201, { 'Retry-After': '3' }), json({ status: 'IN_PROGRESS' }, 200, { 'Retry-After': '7' }), json({ status: 'COMPLETED' }), json({ result: { sample: 'https://example.test/flux.png' } })]
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); assert(replies.length); return replies.shift() }
  const files = await core.runComfyRouter({ model: 'bfl/flux-2-pro', input: { prompt: 'A fox' }, idempotencyKey: 'stable-key' }, { pause: async (ms) => pauses.push(ms) })
  assert.deepEqual(files, [{ url: 'https://example.test/flux.png', kind: 'image' }])
  assert.deepEqual(pauses, [3000, 7000])
  assert.equal(calls[0].url, 'https://api.comfy.org/v2/models/bfl/flux-2-pro/requests')
  assert.equal(calls[0].options.method, 'POST')
  assert.equal(calls[0].options.headers['Idempotency-Key'], 'stable-key')
  assert.equal(calls[0].options.headers['X-API-Key'], key)
  assert.equal(calls[2].url, `${calls[0].url}/request-1/status`)
  assert.equal(calls[3].url, `${calls[0].url}/request-1`)
  assert.equal(JSON.parse(calls[0].options.body).prompt, 'A fox')
})

await test('Comfy Router rate limits and a result that is still pending', async () => {
  const replies = [json(job, 201), json({}, 429, { 'Retry-After': '0' }), json({ status: 'COMPLETED' }), json({ status: 'IN_PROGRESS' }, 202), json({ status: 'COMPLETED' }), json({ content: { video_url: 'https://example.test/seedance.mp4' } })]
  globalThis.fetch = async () => { assert(replies.length); return replies.shift() }
  // Seedance returns content.video_url, which is a video rather than an image.
  const files = await core.runComfyRouter({ model: 'byteplus/dreamina-seedance-2-5-260628', input: {} }, noWait)
  assert.equal(files[0].kind, 'video')
  assert.equal(replies.length, 0)
})

await test('Comfy Router explains credits and completed failures; never collects failed jobs', async () => {
  globalThis.fetch = async () => json({ error_type: 'insufficient_credits' }, 402)
  await assert.rejects(core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {} }, noWait), /insufficient credits/)
  const replies = [json(job, 201), json({ status: 'COMPLETED', error_type: 'provider_error', message: 'Provider unavailable' })]
  globalThis.fetch = async () => { assert(replies.length); return replies.shift() }
  await assert.rejects(core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {} }, noWait), /provider_error/)
  assert.equal(replies.length, 0)
})

await test('Router discovery preserves pagination and encodes the cursor', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).searchParams.get('cursor'), 'opaque+/cursor')
    assert.equal(options.headers['X-API-Key'], key)
    return json({ data: [{ id: 'bfl/flux-2-pro' }], has_more: true, next_cursor: 'next', limit: 1 })
  }
  const data = await core.listComfyRouterModels({ limit: 1, cursor: 'opaque+/cursor' })
  assert.equal(data.next_cursor, 'next')
  assert.equal(data.data[0].id, 'bfl/flux-2-pro')
})

await test('Shared CLI generation preserves the requested Router image count', async () => {
  let submits = 0
  globalThis.fetch = async (url, options) => {
    if (options.method === 'POST') {
      submits++
      return json(job, 201, { 'Retry-After': '0' })
    }
    return url.endsWith('/status') ? json({ status: 'COMPLETED' }) : json({ result: { sample: 'https://example.test/image.png' } })
  }
  const files = await core.generate({ model: 'comfy-router-flux', prompt: 'A fox', count: 2 })
  assert.equal(files.length, 2)
  assert.equal(submits, 2)
})

await test('Key gating and model input mapping', async () => {
  assert.equal(core.connections().comfyRouter.connected, true)
  assert(!JSON.stringify(core.connections()).includes(key))
  const input = comfyRouterInput('byteplus/dreamina-seedance-2-5-260628', { prompt: 'Orbit', image: '/media/test.png', aspect: '16:9' })
  assert.equal(input.content[1].role, 'first_frame')
  assert(!('ratio' in input))
  core.saveConnection('comfy', { key: '' })
  assert.equal(core.connections().comfyRouter.connected, false)
  assert(!(await core.listModels({ includeFal: false })).some((m) => m.provider === 'comfyRouter'))
  globalThis.fetch = async () => { throw new Error('No request allowed without a key') }
  await assert.rejects(core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {} }), /Add a Comfy API key/)
  setup()
})

await test('Local image upload, partner credentials, submission and history', async () => {
  let submitted
  const replies = [json({ name: 'start.png', subfolder: 'input' }), json({ prompt_id: 'local-1' }), json({ 'local-1': { outputs: { '3': { videos: [{ filename: 'h3.mp4' }] } } } })]
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/upload/image')) assert(options.body instanceof FormData)
    if (url.endsWith('/prompt')) submitted = JSON.parse(options.body)
    assert(replies.length)
    return replies.shift()
  }
  const files = await core.runComfy('h3_i2v', { image: 'data:image/png;base64,aGVsbG8=', prompt: 'Orbit', duration: 5, seed: 1 })
  assert.equal(submitted.prompt['1'].inputs.image, 'input/start.png')
  assert.equal(submitted.extra_data.api_key_comfy_org, key)
  assert.equal(submitted.prompt['2'].inputs['model.duration'], 5)
  assert.equal(files[0].kind, 'video')
  assert(files[0].url.startsWith('http://127.0.0.1:8188/view?'))
})

await test('Cloud uses the SDK workflow and asset interfaces and saves downloaded media', async () => {
  setup('cloud')
  let ran = false
  const createClient = (apiKey) => {
    assert.equal(apiKey, key)
    const client = new Comfy({ apiKey })
    client.assets.fromBytes = (buf, options) => { assert.equal(Buffer.from(buf).toString(), 'hello'); assert.equal(options.contentType, 'image/png'); return { mockAsset: true } }
    client.run = async (wf, options) => {
      ran = true
      assert.equal(wf.json['1'].inputs.image.mockAsset, true)
      assert.equal(wf.json['2'].inputs['model.prompt'], 'Orbit')
      assert.equal(options.apiKey, key)
      return { outputs: [{ type: 'video', contentType: 'video/mp4', name: 'h3.mp4', toBytes: async () => Buffer.from('mock video') }] }
    }
    return client
  }
  globalThis.fetch = async () => { throw new Error('Unexpected network call') }
  const files = await core.runComfy('h3_i2v', { image: 'data:image/png;base64,aGVsbG8=', prompt: 'Orbit', duration: 5, seed: 1 }, { createClient })
  assert(ran)
  assert(files[0].url.startsWith('/media/'))
  assert.equal(files[0].kind, 'video')
  assert.equal(fs.readFileSync(files[0].path, 'utf8'), 'mock video')
  await assert.rejects(core.runComfy('../private', {}), /Invalid workflow/)
  await assert.rejects(core.runComfy('h3_i2v', { prompt: 'Missing image' }), /requires image/)
})

await test('Connection checks are read-only for Local and Cloud', async () => {
  setup('cloud')
  globalThis.fetch = async (url, options) => {
    assert.equal(options.method, undefined)
    assert.equal(options.headers['X-API-Key'], key)
    assert.equal(url, 'https://cloud.comfy.org/api/user')
    return json({ status: 'active' })
  }
  assert(await core.testConnection('comfy'))
  setup('local')
  globalThis.fetch = async (url) => { assert(url.endsWith('/system_stats')); return json({}) }
  assert(await core.testConnection('comfy'))
})

await test('Real Cloud SDK against mocked HTTP: asset upload, submit, poll, download and credits', async () => {
  setup('cloud')
  const calls = []
  let credits = true
  const state = {
    id: 'cloud-1', status: 'queued', created_at: '2026-10-16T00:00:00Z', started_at: null, completed_at: null,
    expires_at: '2026-10-17T00:00:00Z', queue_position: 0, progress: null, outputs: [], error: null,
    urls: { self: '/api/v2/jobs/cloud-1', events: '/api/v2/jobs/cloud-1/events', cancel: '/api/v2/jobs/cloud-1/cancel' },
  }
  const mockFetch = async (url, options) => {
    const route = new URL(url).pathname
    calls.push(`${options.method} ${route}`)
    assert.equal(options.headers.get('Authorization'), `Bearer ${key}`)
    if (options.method === 'HEAD') return new Response(null, { status: 404 })
    if (route === '/api/v2/assets') {
      assert(options.body instanceof FormData)
      return json({ id: 'input-asset', content_type: 'image/png', size_bytes: 5, hash: null, created_at: state.created_at, url: 'https://example.test/input', url_expires_at: state.expires_at }, 201)
    }
    if (route === '/api/v2/jobs') {
      const payload = JSON.parse(options.body)
      assert.equal(payload.workflow['1'].inputs.image.__type, 'core/ASSET')
      assert.equal(payload.workflow['1'].inputs.image.info.id, 'input-asset')
      assert.equal(payload.extra_data.api_key_comfy_org, key)
      assert(options.headers.get('Idempotency-Key'))
      if (!credits) return json({ code: 'insufficient_credits', message: 'No balance' }, 402)
      return json(state, 201)
    }
    if (route === '/api/v2/jobs/cloud-1') return json({ ...state, status: 'succeeded', outputs: [{ node_id: '3', name: 'h3.mp4', type: 'video', content_type: 'video/mp4', size_bytes: 10, id: 'output-asset', hash: null, url: 'https://example.test/output', url_expires_at: state.expires_at }] })
    if (route === '/api/v2/assets/output-asset/content') return new Response('wire video', { headers: { 'Content-Type': 'video/mp4' } })
    throw new Error(`Unexpected SDK request ${options.method} ${route}`)
  }
  const createClient = (apiKey) => new Comfy({ apiKey, fetch: mockFetch })
  const vars = { image: 'data:image/png;base64,aGVsbG8=', prompt: 'Orbit', duration: 5, seed: 1 }
  const files = await core.runComfy('h3_i2v', vars, { createClient })
  assert.equal(fs.readFileSync(files[0].path, 'utf8'), 'wire video')
  assert(calls.includes('POST /api/v2/jobs'))
  assert(calls.includes('GET /api/v2/jobs/cloud-1'))
  assert(calls.includes('GET /api/v2/assets/output-asset/content'))
  credits = false
  await assert.rejects(core.runComfy('h3_i2v', vars, { createClient }), /insufficient credits/)
})
