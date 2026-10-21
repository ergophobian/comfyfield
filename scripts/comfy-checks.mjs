import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { Comfy } from '@comfyorg/sdk'
import * as core from '../server/core.js'
import { createServer } from '../server/mcp.js'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { models, aspects } from '../src/lib/catalog.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { validateFormat, routerInputErrors } from '../src/lib/formats/validate.js'
import { runFormat } from '../src/lib/formats/runner.js'
import { expectedInputs, prompt } from './fixtures/router-payloads.mjs'
import { offlineRequirements } from './fixtures/format-planning.mjs'
import { comfyRouterInput } from '../shared/mapping.js'

// No inherited provider configuration can reach these mocked checks.
if (!process.argv.includes('--isolated')) {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--isolated'], {
    stdio: 'inherit', env: { SystemRoot: process.env.SystemRoot || '', PATH: process.env.PATH || '' },
  })
  process.exit(result.status ?? 1)
}

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

await test('Every pinned Router mapping matches its public schema for all composer ratios and durations', () => {
  for (const model of models.filter((m) => m.provider === 'comfyRouter')) {
    const schema = schemas.router[model.model]
    assert(schema?.properties, model.model)
    for (const aspect of model.aspects || aspects) for (const duration of model.durations || [5]) {
      for (const images of [[], ...(model.maxImages ? [['data:image/png;base64,aW1hZ2U=']] : [])]) {
        const input = comfyRouterInput(model.model, { prompt: 'A fox', aspect, duration, count: 3, images })
        assert.deepEqual(routerInputErrors(input, { ...schema, additionalProperties: false }), [], `${model.id} ${aspect} ${duration}`)
      }
    }
  }
  assert.equal(schemas.router['byteplus/seedream-5-0-flash-260915'].properties.image.oneOf[1].maxItems, 10)
  assert(routerInputErrors({ content: [{ type: 'image_url', image_url: {} }] }, schemas.router['byteplus/dreamina-seedance-2-5-260628']).length)
  assert(routerInputErrors({ inputs: [{ text: 'Hi' }] }, schemas.router['elevenlabs/eleven_v4_turbo']).length)
  for (const item of [42, null, [], 'invalid']) assert(routerInputErrors({ inputs: [item] }, schemas.router['elevenlabs/eleven_v4_turbo']).length)
})

await test('Native payloads match independent expectations for every curated model', () => {
  for (const model of models.filter((m) => m.provider === 'comfyRouter')) {
    assert.deepEqual(comfyRouterInput(model.model, { prompt, aspect: model.kind === 'image' ? '1:1' : '16:9', duration: 5 }), expectedInputs[model.model], model.id)
  }
})

await test('Router consumes ordered format slots and character or product references', () => {
  const a = 'https://example.test/product.png'
  const b = 'https://example.test/person.png'
  const opts = { prompt: 'Edit', aspect: '1:1', slots: { pictures: [a, null, b] }, images: ['https://example.test/ignored.png'] }
  assert.deepEqual(comfyRouterInput('bfl/flux-2-pro', opts), { prompt: 'Edit', width: 1024, height: 1024, input_image: a, input_image_2: b })
  const refs = [{ type: 'product', images: [a] }, { type: 'character', images: [b] }, { type: 'brand', images: ['ignored'] }]
  assert.deepEqual(comfyRouterInput('byteplus/seedream-5-0-flash-260915', { prompt: 'Edit', aspect: '1:1', refs }), { prompt: 'Edit', size: '1024x1024', response_format: 'url', image: [a, b] })
  assert.throws(() => comfyRouterInput('luma/photon-flash-1', opts), /up to 0/)
  const mixed = comfyRouterInput('bfl/flux-2-pro', { prompt: 'Edit', aspect: '1:1', images: [a], refs })
  assert.deepEqual(mixed, { prompt: 'Edit', width: 1024, height: 1024, input_image: a, input_image_2: b })
  assert.deepEqual(comfyRouterInput('byteplus/seedance-1-0-pro-fast-251015', { prompt: 'Move', images: [a] }), { content: [{ type: 'text', text: 'Move' }, { type: 'image_url', image_url: { url: a }, role: 'first_frame' }], duration: 5, resolution: '720p' })
  assert.deepEqual(comfyRouterInput('byteplus/dreamina-seedance-2-5-260628', { prompt: 'Move', slots: { pictures: [a, b] } }), { content: [{ type: 'text', text: 'Move' }, { type: 'image_url', image_url: { url: a }, role: 'reference_image' }, { type: 'image_url', image_url: { url: b }, role: 'reference_image' }], duration: 5, resolution: '720p', ratio: '16:9' })
})

await test('Router chains reject unsupported upstream images before any generation, including gates and targets', async () => {
  const base = { id: 'router-chain', name: 'Router chain', job: 'Test chain', shape: 'chain', kind: 'image', cover: 'test', inputs: [], steps: [{ id: 'first', model: 'comfy-router-flux' }, { id: 'gate', type: 'approve' }, { id: 'last', model: 'comfy-router-photon', settings: { aspect: '16:9' } }], outputs: [{ step: 'last', kind: 'image' }] }
  let calls = 0
  for (const [model, kind] of [['comfy-router-photon', 'image'], ['comfy-router-ltx', 'video']]) {
    const format = { ...base, steps: [...base.steps.slice(0, 2), { ...base.steps[2], model, kind }], outputs: [{ step: 'last', kind }] }
    assert(validateFormat(format).some((error) => /up to 0/.test(error)))
    await assert.rejects(runFormat(format, {}, { run: async () => { calls++; return [] } }), /up to 0/)
  }
  const targets = { ...base, inputs: [{ id: 'target', type: 'choice', label: 'Target', default: 'flux', options: [{ id: 'flux', label: 'Flux' }, { id: 'photon', label: 'Photon' }] }], steps: [...base.steps.slice(0, 2), { ...base.steps[2], model: 'comfy-router-flux', targetInput: 'target', targets: { flux: { model: 'comfy-router-flux' }, photon: { model: 'comfy-router-photon' } } }] }
  assert(validateFormat(targets).some((error) => /up to 0/.test(error)))
  assert.equal(calls, 0)
  assert.deepEqual(validateFormat({ ...base, steps: [base.steps[0], { ...base.steps[2], model: 'comfy-router-flux' }] }), [])
  const product = { ...base, inputs: [{ id: 'product', type: 'product', label: 'Product' }], steps: [{ id: 'last', model: 'comfy-router-flux' }] }
  assert.deepEqual(validateFormat(product), [])
  let mapped = false
  await runFormat(product, { product: { name: 'Cup', images: ['https://example.test/cup.png'] } }, { requirements: offlineRequirements, run: async (model, opts) => {
    mapped = true
    assert.equal(comfyRouterInput(model.model, opts).input_image, 'https://example.test/cup.png')
    return [{ url: 'https://example.test/output.png', kind: 'image' }]
  } })
  assert(mapped)
})

await test('Seedream base64 is saved locally and octet-stream audio is playable for both audio models', async () => {
  setup()
  const bytes = Buffer.from('mock generated png')
  let replies = [json(job), json({ status: 'COMPLETED' }), json({ data: [{ b64_json: bytes.toString('base64') }] })]
  globalThis.fetch = async () => replies.shift()
  const [image] = await core.runComfyRouter({ model: 'byteplus/seedream-5-0-flash-260915', input: { response_format: 'b64_json' } }, noWait)
  assert.equal(image.kind, 'image')
  assert.deepEqual(core.readLocal(image.url).buf, bytes)
  assert.deepEqual(fs.readFileSync(image.path), bytes)
  const [saved] = await core.saveFiles([image], path.join(process.env.COMFYFIELD_HOME, 'saved'))
  assert.deepEqual(fs.readFileSync(saved), bytes)
  for (const model of ['elevenlabs/eleven_v4_turbo', 'elevenlabs/eleven_sfx_v2']) {
    replies = [json(job), json({ status: 'COMPLETED' }), new Response('mock audio', { headers: { 'Content-Type': 'application/octet-stream' } })]
    const [audio] = await core.runComfyRouter({ model, input: {} }, noWait)
    assert.equal(audio.kind, 'audio')
    assert.match(audio.url, /\.mp3$/)
    assert.equal(core.readLocal(audio.url).buf.toString(), 'mock audio')
  }
})

await test('HTML retry responses preserve the queued job and honor Retry-After before JSON parsing', async () => {
  setup()
  const replies = [json(job, 201, { 'Retry-After': '1' }), new Response('<html>Busy</html>', { status: 503, headers: { 'Retry-After': '2' } }), new Response('<html>Limit</html>', { status: 429, headers: { 'Retry-After': '3' } }), json({ status: 'COMPLETED' }), new Response('<html>Busy</html>', { status: 503, headers: { 'Retry-After': '4' } }), json({ status: 'COMPLETED' }), new Response('<html>Limit</html>', { status: 429, headers: { 'Retry-After': '5' } }), json({ status: 'COMPLETED' }), json({ result: { sample: 'https://example.test/image.png' } })]
  const pauses = []
  let submits = 0
  globalThis.fetch = async (url, opts) => { if (opts.method === 'POST') submits++; assert(replies.length); return replies.shift() }
  assert.equal((await core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {}, idempotencyKey: 'original-key' }, { pause: async (ms) => pauses.push(ms) })).length, 1)
  assert.deepEqual(pauses, [1000, 2000, 3000, 4000, 5000])
  assert.equal(submits, 1)
  for (const stage of ['submit', 'status', 'result']) {
    const html = new Response('<html>Bad gateway</html>', { status: 502, headers: { 'X-Comfy-Request-Id': `bad-${stage}` } })
    const next = stage === 'submit' ? [html] : stage === 'status' ? [json(job), html] : [json(job), json({ status: 'COMPLETED' }), html]
    globalThis.fetch = async () => next.shift()
    await assert.rejects(core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {} }, noWait), (error) => !(error instanceof SyntaxError) && error.requestId === `bad-${stage}`)
  }
})

await test('Malformed successful Router JSON fails with recovery context, without parser exceptions', async () => {
  setup()
  for (const value of [null, [], 42, '<html>']) {
    for (const stage of ['status', 'result']) {
      const bad = typeof value === 'string' ? new Response(value) : json(value)
      const replies = stage === 'status' ? [json(job), bad] : [json(job), json({ status: 'COMPLETED' }), bad]
      globalThis.fetch = async () => replies.shift()
      await assert.rejects(core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {} }, noWait), (error) => error.requestId === job.request_id && /invalid/.test(error.message))
    }
  }
})

await test('Router references keep their order, unsupported inputs fail, and prices use the published units', async () => {
  const images = ['data:image/png;base64,YQ==', 'data:image/png;base64,Yg==']
  const flux = comfyRouterInput('bfl/flux-2-max', { prompt: 'Edit', aspect: '4:5', images })
  assert.deepEqual([flux.input_image, flux.input_image_2], images)
  assert.deepEqual([flux.width, flux.height], [896, 1120])
  assert.deepEqual(comfyRouterInput('byteplus/seedream-5-0-flash-260915', { prompt: 'Edit', aspect: '1:1', images }).image, images)
  assert.throws(() => comfyRouterInput('luma/photon-flash-1', { images }), /up to 0/)
  assert.throws(() => comfyRouterInput('ltx/ltx-2-5-fast', { aspect: '1:1' }), /16:9 or 9:16/)
  assert.throws(() => comfyRouterInput('byteplus/seedance-1-0-pro-fast-251015', { images }), /up to 1/)
  const multi = comfyRouterInput('byteplus/dreamina-seedance-2-5-260628', { prompt: 'Blend', aspect: '16:9', images })
  assert.deepEqual(multi.content.slice(1).map((item) => [item.image_url.url, item.role]), images.map((url) => [url, 'reference_image']))
  assert.equal(multi.ratio, '16:9')
  assert.equal(await core.estimateCost({ model: 'comfy-router-flux-max' }), null)
  assert.equal((await core.estimateCost({ model: 'comfy-router-kontext', count: 3 })).usd, 0.12)
  assert(Math.abs((await core.estimateCost({ model: 'comfy-router-ltx', duration: 10 })).usd - 1.287) < 1e-10)
  assert.equal((await core.estimateCost({ model: 'comfy-router-speech', prompt: 'a'.repeat(1000) })).usd, 0.0572)
  assert.equal((await core.estimateCost({ model: 'comfy-router-seedance-fast', duration: 5 })).usd, 0.108)
})

await test('Router normalizes native Seedream, Luma and Ltx results, and saves binary audio', async () => {
  setup()
  for (const [model, result, kind, url] of [
    ['byteplus/seedream-5-0-flash-260915', { data: [{ url: 'https://example.test/image.png' }] }, 'image', 'https://example.test/image.png'],
    ['luma/photon-flash-1', { assets: { image: 'https://example.test/image.png', video: null }, request: { image_ref: [{ url: 'https://example.test/input.png' }] } }, 'image', 'https://example.test/image.png'],
    ['ltx/ltx-2-5-fast', { result: { video_url: 'https://example.test/video.mp4' } }, 'video', 'https://example.test/video.mp4'],
  ]) {
    const replies = [json(job), json({ status: 'COMPLETED' }), json(result)]
    globalThis.fetch = async () => replies.shift()
    assert.deepEqual(await core.runComfyRouter({ model, input: {} }, noWait), [{ url, kind }])
  }
  const replies = [json(job), json({ status: 'COMPLETED' }), new Response(Buffer.from('mock audio'), { headers: { 'Content-Type': 'audio/mpeg' } })]
  globalThis.fetch = async () => replies.shift()
  const [audio] = await core.runComfyRouter({ model: 'elevenlabs/eleven_v4_turbo', input: {} }, noWait)
  assert.equal(audio.kind, 'audio')
  assert.equal(core.readLocal(audio.url).buf.toString(), 'mock audio')
  const listed = await core.listModels({ includeFal: false })
  for (const model of models.filter((m) => m.provider === 'comfyRouter')) assert(listed.some((m) => m.id === model.id && m.model === model.model))
})

await test('CLI and MCP list every Router model through the shared core', async () => {
  setup()
  const handlers = new Map()
  const server = createServer({ handlers })
  const mcp = await handlers.get('list_models')({})
  assert(!mcp.isError)
  const cli = spawnSync(process.execPath, ['bin/comfyfield.js', 'models', '--json'], {
    encoding: 'utf8', env: { SystemRoot: process.env.SystemRoot || '', PATH: process.env.PATH || '', COMFYFIELD_HOME: process.env.COMFYFIELD_HOME },
  })
  assert.equal(cli.status, 0, cli.stderr)
  for (const entries of [JSON.parse(mcp.content[0].text), JSON.parse(cli.stdout)]) {
    assert.deepEqual(entries.filter((m) => m.provider === 'comfyRouter').map((m) => m.id), models.filter((m) => m.provider === 'comfyRouter').map((m) => m.id))
  }
  await server.close()
})

await test('New Router image models preserve count through core generation', async () => {
  setup()
  for (const id of ['comfy-router-flux-max', 'comfy-router-kontext', 'comfy-router-photon', 'comfy-router-seedream']) {
    const model = core.resolveModel(id)
    let submits = 0
    globalThis.fetch = async (url, options) => {
      if (options.method === 'POST') {
        submits++
        const input = JSON.parse(options.body)
        assert.equal(input.count, undefined)
        return json(job, 201, { 'Retry-After': '0' })
      }
      if (url.endsWith('/status')) return json({ status: 'COMPLETED' }, 200, { 'Retry-After': '0' })
      return json(model.id === 'comfy-router-photon' ? { assets: { image: 'https://example.test/result.png' } } : model.id === 'comfy-router-seedream' ? { data: [{ url: 'https://example.test/result.png' }] } : { result: { sample: 'https://example.test/result.png' } })
    }
    const files = await core.generate({ model: id, prompt: 'A field', count: 3 })
    assert.equal(submits, 3, id)
    assert.equal(files.length, 3, id)
  }
})

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

await test('Router terminal answers and uncertain responses carry retry classification', async () => {
  setup('cloud')
  for (const [reply, retryable, code] of [
    [json({ error_type: 'insufficient_credits', request_id: 'credits' }, 402), false, 'insufficient_credits'],
    [json({ error_type: 'validation_error' }, 422), false, 'validation_error'],
    [json({ error_type: 'rate_limited' }, 429), true, 'rate_limited'],
    [json({ error_type: 'unavailable' }, 503), true, 'unavailable'],
  ]) {
    globalThis.fetch = async () => reply
    await assert.rejects(core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {} }, noWait), (e) => e.retryable === retryable && e.code === code)
  }
  for (const failed of [{ status: 'FAILED' }, { status: 'COMPLETED', error_type: 'provider_error' }]) {
    const replies = [json(job, 201), json(failed)]
    globalThis.fetch = async () => { assert(replies.length); return replies.shift() }
    await assert.rejects(core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {} }, noWait), (e) => e.retryable === false && e.requestId === job.request_id)
  }
  const replies = [json(job, 201), json({})]
  globalThis.fetch = async () => replies.shift()
  await assert.rejects(core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {} }, noWait), (e) => e.retryable === true && e.code === 'invalid_response')
})

await test('A cancelled Router job aborts polling and keeps its request identity', async () => {
  setup('cloud')
  const controller = new AbortController()
  let calls = 0
  globalThis.fetch = async (url, options) => {
    assert.equal(options.signal, controller.signal)
    calls++
    return json(job, 201)
  }
  await assert.rejects(core.runComfyRouter({ model: 'bfl/flux-2-pro', input: {}, idempotencyKey: 'cancel-key' }, {
    signal: controller.signal,
    pause: async () => controller.abort(),
  }), (error) => error.name === 'AbortError' && error.idempotencyKey === 'cancel-key' && error.requestId === job.request_id)
  assert.equal(calls, 1, 'No status or result requests follow cancellation')
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

await test('Local image upload, Comfy credentials, submission and history', async () => {
  let submitted
  const replies = [json({ name: 'start.png', subfolder: 'input' }), json({ prompt_id: 'local-1' }), json({ 'local-1': { outputs: { '15': { videos: [{ filename: 'h3.mp4' }] } } } })]
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/upload/image')) assert(options.body instanceof FormData)
    if (url.endsWith('/prompt')) submitted = JSON.parse(options.body)
    assert(replies.length)
    return replies.shift()
  }
  const files = await core.runComfy('h3_open_i2v', { image: 'data:image/png;base64,aGVsbG8=', prompt: 'Orbit', width: 1344, height: 768, frames: 121, seed: 1 })
  assert.equal(submitted.prompt['16'].inputs.image, 'input/start.png')
  assert.equal(submitted.extra_data.api_key_comfy_org, key)
  assert.equal(submitted.prompt['6'].inputs.length, 121)
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
      assert.equal(wf.json['16'].inputs.image.mockAsset, true)
      assert.equal(wf.json['6'].inputs.prompt, 'Orbit')
      assert.equal(options.apiKey, key)
      return { outputs: [{ type: 'video', contentType: 'video/mp4', name: 'h3.mp4', toBytes: async () => Buffer.from('mock video') }] }
    }
    return client
  }
  globalThis.fetch = async () => { throw new Error('Unexpected network call') }
  const files = await core.runComfy('h3_open_i2v', { image: 'data:image/png;base64,aGVsbG8=', prompt: 'Orbit', width: 1344, height: 768, frames: 121, seed: 1 }, { createClient })
  assert(ran)
  assert(files[0].url.startsWith('/media/'))
  assert.equal(files[0].kind, 'video')
  assert.equal(fs.readFileSync(files[0].path, 'utf8'), 'mock video')
  await assert.rejects(core.runComfy('../private', {}), /Invalid workflow/)
  await assert.rejects(core.runComfy('h3_open_i2v', { prompt: 'Missing image', width: 1344, height: 768, frames: 121, seed: 1 }), /requires image/)
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
      assert.equal(payload.workflow['16'].inputs.image.__type, 'core/ASSET')
      assert.equal(payload.workflow['16'].inputs.image.info.id, 'input-asset')
      assert.equal(payload.extra_data.api_key_comfy_org, key)
      assert(options.headers.get('Idempotency-Key'))
      if (!credits) return json({ code: 'insufficient_credits', message: 'No balance' }, 402)
      return json(state, 201)
    }
    if (route === '/api/v2/jobs/cloud-1') return json({ ...state, status: 'succeeded', outputs: [{ node_id: '15', name: 'h3.mp4', type: 'video', content_type: 'video/mp4', size_bytes: 10, id: 'output-asset', hash: null, url: 'https://example.test/output', url_expires_at: state.expires_at }] })
    if (route === '/api/v2/assets/output-asset/content') return new Response('wire video', { headers: { 'Content-Type': 'video/mp4' } })
    throw new Error(`Unexpected SDK request ${options.method} ${route}`)
  }
  const createClient = (apiKey) => new Comfy({ apiKey, fetch: mockFetch })
  const vars = { image: 'data:image/png;base64,aGVsbG8=', prompt: 'Orbit', width: 1344, height: 768, frames: 121, seed: 1 }
  const files = await core.runComfy('h3_open_i2v', vars, { createClient })
  assert.equal(fs.readFileSync(files[0].path, 'utf8'), 'wire video')
  assert(calls.includes('POST /api/v2/jobs'))
  assert(calls.includes('GET /api/v2/jobs/cloud-1'))
  assert(calls.includes('GET /api/v2/assets/output-asset/content'))
  credits = false
  await assert.rejects(core.runComfy('h3_open_i2v', vars, { createClient }), /insufficient credits/)
})
