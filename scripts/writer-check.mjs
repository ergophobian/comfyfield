import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { mock } from 'node:test'
import { Readable } from 'node:stream'
import { writePrompt, writePromptWithRouter } from '../server/core.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { routerInputErrors } from '../src/lib/formats/validate.js'
import { routerWriterModel } from '../src/lib/catalog.js'
import comfyfieldApi from '../server/plugin.js'
import { REAL_LOOK } from '../shared/realism.js'

// Isolate configuration so checks never read saved keys or provider environment variables.
if (!process.argv.includes('--isolated')) {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--isolated'], {
    stdio: 'inherit', env: { SystemRoot: process.env.SystemRoot || '', PATH: process.env.PATH || '' },
  })
  process.exit(result.status ?? 1)
}

const originalRead = fs.readFileSync
let key = 'mock-google-key'
let comfy = 'mock-comfy-key'
mock.method(fs, 'readFileSync', (file, ...args) => {
  if (String(file).endsWith('keys.json')) return JSON.stringify({ google: { key }, comfy: { key: comfy } })
  if (String(file).endsWith('writer-reference.png')) return Buffer.from('local image bytes')
  return originalRead(file, ...args)
})
const originalExists = fs.existsSync
mock.method(fs, 'existsSync', (file) => String(file).endsWith('writer-reference.png') || originalExists(file))
const calls = []
let response
mock.method(globalThis, 'fetch', async (url, opts) => {
  calls.push({ url, ...opts, body: JSON.parse(opts.body) })
  return response
})
const reply = (parts, finishReason = 'STOP') => ({ ok: true, json: async () => ({ candidates: [{ finishReason, content: { parts } }] }) })
const input = { instructions: 'Preserve visible details. Return one paragraph.', note: 'Warm sunset', target: 'LTX video' }
const checks = []
const check = (name, fn) => checks.push([name, fn])

check('Google request uses effect instructions, ordered inline images, note and target', async () => {
  response = reply([{ text: 'A boat ' }, { text: 'at sunset.' }, { text: 'Hidden thought', thought: true }])
  const text = await writePrompt({ ...input, images: ['data:image/jpeg;base64,aW1hZ2U=', '/media/writer-reference.png'] })
  assert.equal(text, 'A boat at sunset.')
  const call = calls.at(-1)
  assert.match(call.url, /models\/gemini-flash-latest:generateContent$/)
  assert.equal(call.headers['x-goog-api-key'], 'mock-google-key')
  assert.deepEqual(call.body.systemInstruction, { parts: [{ text: input.instructions }] })
  const parts = call.body.contents[0].parts
  assert.deepEqual(parts[0], { inlineData: { mimeType: 'image/jpeg', data: 'aW1hZ2U=' } })
  assert.deepEqual(parts[1], { inlineData: { mimeType: 'image/png', data: Buffer.from('local image bytes').toString('base64') } })
  assert.match(parts[2].text, /LTX video/)
  assert.match(parts[2].text, /Warm sunset/)
  // The anti-AI-look rule rides in the request, never in the effect's own instructions.
  assert.ok(parts[2].text.includes(`House style: ${REAL_LOOK}`))
})

check('text-only writer works without optional inputs', async () => {
  response = reply([{ text: '  A finished prompt.  ' }])
  assert.equal(await writePrompt({ instructions: 'Write a prompt' }), 'A finished prompt.')
  assert.equal(calls.at(-1).body.contents[0].parts.length, 1)
})

check('local prompt route returns text and validation errors', async () => {
  let handler
  comfyfieldApi().configureServer({ middlewares: { use: (fn) => { handler = fn } } })
  const call = async (payload) => {
    const req = Readable.from([JSON.stringify(payload)])
    req.url = '/api/prompt'
    req.headers = { host: 'localhost:5173' }
    req.method = 'POST'
    let data
    const res = { setHeader() {}, end: (body) => { data = JSON.parse(body) } }
    await handler(req, res, () => assert.fail('Writer route should handle the request'))
    return { status: res.statusCode, data }
  }
  response = reply([{ text: 'Through the local API' }])
  assert.deepEqual(await call(input), { status: 200, data: { text: 'Through the local API' } })
  assert.deepEqual(await call({ instructions: '' }), { status: 400, data: { error: 'Add writer instructions first.' } })
})

check('invalid inputs fail before network calls', async () => {
  const count = calls.length
  await assert.rejects(writePrompt({ instructions: '' }), /instructions/)
  await assert.rejects(writePrompt({ ...input, images: 'not an array' }), /local or inline/)
  await assert.rejects(writePrompt({ ...input, images: ['https://example.com/private.png'] }), /local or inline/)
  await assert.rejects(writePrompt({ ...input, images: ['data:image/svg+xml;base64,PHN2Zz4='] }), /PNG, JPG/)
  assert.equal(calls.length, count)
})

check('provider errors, empty, filtered and truncated responses fail clearly', async () => {
  response = { ok: false, status: 429, json: async () => ({ error: { message: 'Quota exceeded' } }) }
  await assert.rejects(writePrompt(input), /Quota exceeded/)
  response = reply([])
  await assert.rejects(writePrompt(input), /no prompt/)
  response = { ok: true, json: async () => ({ promptFeedback: { blockReason: 'SAFETY' } }) }
  await assert.rejects(writePrompt(input), /filtered/)
  response = reply([{ text: 'Partial' }], 'MAX_TOKENS')
  await assert.rejects(writePrompt(input), /did not finish/)
})

const routerReply = (text = '  A Router prompt.  ', status = 'completed') => ({ ok: true, json: async () => ({ status, output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] }] }) })

check('Comfy-only writer uses the text model, instructions, ordered images and user note', async () => {
  key = ''
  response = routerReply()
  assert.equal(await writePrompt({ ...input, images: ['data:image/jpeg;base64,aW1hZ2U=', '/media/writer-reference.png'] }), 'A Router prompt.')
  const call = calls.at(-1)
  assert.equal(call.url, 'https://api.comfy.org/v2/models/openai/gpt-4.1-nano')
  assert.equal(call.headers['X-API-Key'], comfy)
  assert.equal(call.body.instructions, input.instructions)
  assert.deepEqual(routerInputErrors(call.body, { ...schemas.router[routerWriterModel], additionalProperties: false }), [])
  assert.equal(call.body.store, false)
  assert.equal(call.body.max_output_tokens, 2048)
  assert.deepEqual(call.body.input[0].content.slice(0, 2), [
    { type: 'input_image', image_url: 'data:image/jpeg;base64,aW1hZ2U=' },
    { type: 'input_image', image_url: `data:image/png;base64,${Buffer.from('local image bytes').toString('base64')}` },
  ])
  assert.match(call.body.input[0].content[2].text, /Warm sunset/)
  assert.match(call.body.input[0].content[2].text, /LTX video/)
  assert.equal(await writePrompt({ instructions: 'Text only' }), 'A Router prompt.')
  assert.equal(calls.at(-1).body.input[0].content.length, 1)
})

check('Router writer rejects empty, refused, truncated and failed output without retries', async () => {
  response = routerReply('Partial', 'incomplete')
  await assert.rejects(writePrompt(input), /did not finish/)
  response = routerReply('')
  await assert.rejects(writePrompt(input), (e) => /no prompt/.test(e.message) && e.retryable === false)
  response = { ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'refusal', refusal: 'Refused' }] }] }) }
  await assert.rejects(writePrompt(input), (e) => /no prompt/.test(e.message) && e.retryable === false)
  response = { ok: false, status: 429, json: async () => ({ error: { message: 'Quota exceeded' } }) }
  const count = calls.length
  await assert.rejects(writePrompt(input), /Quota exceeded/)
  assert.equal(calls.length, count + 1)
  const before = calls.length
  await assert.rejects(writePrompt({ ...input, images: ['data:image/svg+xml;base64,PHN2Zz4='] }), /PNG, JPG/)
  assert.equal(calls.length, before)
})

check('Router writer keeps the supplied logical key and exposes request ids on every error path', async () => {
  key = ''
  const request = { ...input, idempotencyKey: 'logical-writer-key' }
  response = { ok: false, status: 503, headers: new Headers({ 'X-Comfy-Request-Id': 'writer-request-1', 'X-Comfy-Error-Type': 'provider_unavailable' }), json: async () => { throw new SyntaxError('HTML') } }
  for (let i = 0; i < 2; i++) {
    await assert.rejects(writePrompt(request), (error) => error.requestId === 'writer-request-1' && error.idempotencyKey === request.idempotencyKey && /writer-request-1/.test(error.message))
    assert.equal(calls.at(-1).headers['Idempotency-Key'], request.idempotencyKey)
  }
  response = { ok: true, status: 200, headers: new Headers({ 'X-Comfy-Request-Id': 'writer-invalid-json' }), json: async () => null }
  await assert.rejects(writePrompt(request), (error) => error.requestId === 'writer-invalid-json' && error.idempotencyKey === request.idempotencyKey && error.retryable === true)
  response = routerReply('Partial', 'incomplete')
  response.headers = new Headers({ 'X-Comfy-Request-Id': 'writer-incomplete' })
  await assert.rejects(writePrompt(request), (error) => error.requestId === 'writer-incomplete' && error.idempotencyKey === request.idempotencyKey && error.retryable === false)
  response = routerReply('Recovered')
  assert.equal(await writePrompt(request), 'Recovered')
  assert.equal(calls.at(-1).headers['Idempotency-Key'], request.idempotencyKey)
  await writePrompt(input)
  const first = calls.at(-1).headers['Idempotency-Key']
  await writePrompt(input)
  assert(first)
  assert.notEqual(calls.at(-1).headers['Idempotency-Key'], first)
})

check('missing both keys fails without a request; Google remains preferred when configured', async () => {
  const count = calls.length
  comfy = ''
  await assert.rejects(writePrompt(input), /Add a Comfy API key/)
  await assert.rejects(writePromptWithRouter(input), /Add a Comfy API key/)
  assert.equal(calls.length, count)
  comfy = 'mock-comfy-key'
  key = 'mock-google-key'
  response = reply([{ text: 'Google preferred' }])
  assert.equal(await writePrompt(input), 'Google preferred')
  assert.match(calls.at(-1).url, /googleapis/)
})

let bad = 0
try {
  for (const [name, fn] of checks) {
    try { await fn(); console.log('ok   ', name) } catch (err) { bad++; console.log('FAIL ', name, '\n     ', err.message) }
  }
} finally { mock.restoreAll() }
console.log(bad ? `${bad} failed` : `all ${checks.length} writer checks passed (mocked network only)`)
process.exitCode = bad ? 1 : 0
