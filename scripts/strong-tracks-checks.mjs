import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-strong-tracks-'))
const core = await import('../server/core.js')
globalThis.fetch = () => { throw new Error('Network is forbidden in strong-track checks') }

let submitted = 0
let probed = 0
await assert.rejects(core.runComfy('chatterbox_tts', { prompt: 'Hello.' + ' '.repeat(301), seed: 7 }, {
  findFfmpeg: async () => { probed++; throw new Error('ffmpeg is missing') },
  createClient: () => { submitted++; throw new Error('Must not submit') },
}), /ffmpeg is missing/)
assert.equal(probed, 1)
assert.equal(submitted, 0, 'Speech checks ffmpeg before the first provider call')

const script = 'scripts/fasth3-live.mjs'
const plan = spawnSync(process.execPath, [script, '--plan'], { encoding: 'utf8', timeout: 5000 })
assert.equal(plan.status, 0, plan.stderr)
assert.match(plan.stdout, /fast-1pic-5s/)
const refused = spawnSync(process.execPath, [script, '--run'], { encoding: 'utf8', timeout: 5000 })
assert.notEqual(refused.status, 0)
assert.match(refused.stderr, /not available yet.*spend ledger/)
assert(!fs.readFileSync(script, 'utf8').includes('/api/pod/'), 'The disabled runner cannot start, resume or submit to a Pod')
console.log('Strong-track checks passed: ffmpeg before submission and FastH3 paid execution unavailable. No provider calls.')
