import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { mock } from 'node:test'
import { comfyRequirements, pod } from '../server/core.js'
import comfyfieldApi from '../server/plugin.js'
import { offlineRequirements } from './fixtures/format-planning.mjs'

// Provider configuration in this child comes exclusively from the file stub below.
if (!process.argv.includes('--isolated')) {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--isolated'], {
    stdio: 'inherit', env: { SystemRoot: process.env.SystemRoot || '', PATH: process.env.PATH || '' },
  })
  process.exit(result.status ?? 1)
}
const read = fs.readFileSync
mock.method(fs, 'readFileSync', (file, ...args) => {
  if (String(file).endsWith('keys.json')) return JSON.stringify({ comfy: { key: 'fixture', run: 'instant' }, fal: { key: 'fixture' } })
  if (String(file).includes('.comfyfield')) throw new Error('No saved state in this check')
  return read(file, ...args)
})
mock.method(globalThis, 'fetch', () => assert.fail('Requirements must never make network requests'))
try {
  const workflows = ['image_flux', 'qwen_image21_t2i', 'ltx25_i2v'].map((workflow) => ({ workflow, vars: { image: 'preflight://image', prompt: 'A meadow' } }))
  const expected = offlineRequirements(workflows).requirements
  assert.deepEqual(comfyRequirements(workflows), expected)
  assert(expected[1].notOnCloud.length)
  assert(expected[2].minVramGb > expected[0].minVramGb)
  assert.throws(() => comfyRequirements([{ workflow: '../keys' }]), /Invalid workflow/)
  assert.throws(() => comfyRequirements({}), /up to 200/)
  let handler
  comfyfieldApi().configureServer({ middlewares: { use: (fn) => { handler = fn } } })
  const req = Readable.from([JSON.stringify({ workflows })])
  Object.assign(req, { url: '/api/comfy/requirements', method: 'POST', headers: {} })
  let payload
  const res = { setHeader() {}, end: (body) => { payload = JSON.parse(body) } }
  await handler(req, res, () => assert.fail('Requirements route was not handled'))
  assert.equal(res.statusCode, 200)
  assert.deepEqual(payload.requirements, expected)
  assert.equal(payload.cloudConnected, true)
  assert.equal(payload.connections.fal.connected, true)
  assert.equal(payload.connections.google.connected, false)
  assert.deepEqual(payload.connections.comfy, { connected: true })
  assert(!JSON.stringify(payload).includes('fixture'), 'Only connection booleans leave the requirements endpoint')
  assert.equal(payload.runType, 'instant')
  assert.equal(payload.pod.phase, 'none')
  console.log('Requirements checks ok: real workflow files, Cloud availability, minimum memory, validation and read-only endpoint. No keys or network access.')
} finally {
  pod().stopMonitor()
  mock.restoreAll()
}
