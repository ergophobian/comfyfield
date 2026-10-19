import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { mock } from 'node:test'
import { comfyRequirements, formatRequirements, pod } from '../server/core.js'
import comfyfieldApi from '../server/plugin.js'
import { preflight } from '../src/lib/formats/runner.js'
import { comfyVars } from '../shared/mapping.js'
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
  const expected = offlineRequirements(workflows).requirements.map(({ workflow, notOnCloud, minVramGb, arch }) => ({ workflow, notOnCloud, minVramGb, arch }))
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
  assert.deepEqual(payload.requirements.map(({ workflow, notOnCloud, minVramGb, arch }) => ({ workflow, notOnCloud, minVramGb, arch })), expected)
  assert.equal(payload.cloudConnected, true)
  assert.equal(payload.connections.fal.connected, true)
  assert.equal(payload.connections.google.connected, false)
  assert.deepEqual(payload.connections.comfy, { connected: true })
  assert(!JSON.stringify(payload).includes('fixture'), 'Only connection booleans leave the requirements endpoint')
  assert.equal(payload.runType, 'instant')
  assert.equal(payload.pod.phase, 'none')
  assert.deepEqual(payload.writerProviders, ['google', 'comfyRouter'])
  const request = async (input) => {
    const req = Readable.from([JSON.stringify(input)])
    Object.assign(req, { url: '/api/comfy/requirements', method: 'POST', headers: {} })
    let data
    const res = { setHeader() {}, end: (body) => { data = JSON.parse(body) } }
    await handler(req, res, () => assert.fail('Requirements route was not handled'))
    return { ok: res.statusCode === 200, status: res.statusCode, json: async () => data }
  }
  for (const input of [null, {}, { workflows: [null] }, { workflows: [{ workflow: 'image_flux', vars: null }] }, { workflows: [{ workflow: 'image_flux', vars: [] }] }, { workflows: null }, { workflows: [], runType: 'invalid' }]) {
    assert.equal((await request(input)).status, 400, JSON.stringify(input))
  }
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/comfy/requirements')
    return request(JSON.parse(options.body))
  })
  const format = { id: 'server-plan', name: 'Server plan', job: 'Check the runner', cover: '/mock-result.png', shape: 'preset', kind: 'image',
    inputs: [{ id: 'subject', type: 'text', label: 'Subject' }],
    steps: [{ id: 'generate', provider: 'comfy', workflow: 'flux3_klein_t2i', kind: 'image', prompt: '{subject}' }],
    outputs: [{ step: 'generate', kind: 'image' }],
  }
  const inline = await preflight(format, { subject: 'A meadow' }, { runType: 'instant' })
  assert.equal(inline.ok, true)
  assert.equal(inline.steps[0].target, 'cloud')
  assert.equal(inline.steps[0].selectedWorkflow, 'flux3_klein_t2i_cloud')
  const qwen = { ...format, inputs: [...format.inputs, { id: 'image', type: 'image', label: 'Reference' }],
    steps: [{ id: 'generate', model: 'comfy-qwen-image21', kind: 'image', prompt: '{subject}' }],
  }
  const image = { url: 'preflight://reference', ratio: '1:1' }
  const reference = await preflight(qwen, { subject: 'A meadow', image }, { runType: 'instant' })
  assert.equal(reference.ok, true)
  assert.equal(reference.steps[0].workflow, 'qwen_edit')
  assert.equal(reference.steps[0].selectedWorkflow, 'qwen_edit_cloud')
  const direct = await formatRequirements([{ workflow: 'qwen_edit', vars: comfyVars('image', { prompt: 'A meadow', images: [image.url] }) }])
  assert.equal(direct.requirements[0].selectedWorkflow, reference.steps[0].selectedWorkflow)
  console.log('Requirements checks ok: read-only endpoint, null input rejection, Router writer availability, inline Cloud alternates and Qwen reference-image resolution. Synthetic connections only.')
} finally {
  pod().stopMonitor()
  mock.restoreAll()
}
