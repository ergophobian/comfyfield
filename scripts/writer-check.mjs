import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { mock } from 'node:test'
import { Readable } from 'node:stream'
import { writePrompt, writePromptWithRouter } from '../server/core.js'
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
mock.method(fs, 'readFileSync', (file, ...args) => {
  if (String(file).endsWith('keys.json')) return JSON.stringify({ google: { key } })
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
    req.headers = {}
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

check('missing Google key reaches the explicit Router fallback stub without a call', async () => {
  const count = calls.length
  key = ''
  await assert.rejects(writePrompt(input), (e) => e.status === 501 && /Comfy Router/.test(e.message))
  await assert.rejects(writePromptWithRouter(input), /not wired yet/)
  assert.equal(calls.length, count)
  key = 'mock-google-key'
})

let bad = 0
try {
  for (const [name, fn] of checks) {
    try { await fn(); console.log('ok   ', name) } catch (err) { bad++; console.log('FAIL ', name, '\n     ', err.message) }
  }
} finally { mock.restoreAll() }
console.log(bad ? `${bad} failed` : `all ${checks.length} writer checks passed (mocked network only)`)
process.exitCode = bad ? 1 : 0
