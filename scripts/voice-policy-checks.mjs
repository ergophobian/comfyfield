import assert from 'node:assert/strict'
import { voiceTone } from './voice-fixture.mjs'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { libraryStore, libraryRoutes } from '../server/library.js'
import { voiceRoutes } from '../server/voices.js'
import { validateWorkflowVoices } from '../server/voiceConsent.js'
import { runComfy } from '../server/core.js'
import { compileFormat } from '../src/lib/formats/runner.js'
import { formatById } from '../src/lib/formats/index.js'
import { comfyVars } from '../shared/mapping.js'

if (!process.argv.includes('--isolated')) {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--isolated'], {
    stdio: 'inherit', env: { SystemRoot: process.env.SystemRoot || '', PATH: process.env.PATH || '' },
  })
  process.exit(result.status ?? 1)
}
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'comfyfield-voice-policy-'))
process.env.COMFYFIELD_HOME = root
const home = () => path.join(root, '.comfyfield')
fs.mkdirSync(path.join(home(), 'media'), { recursive: true })
const pcm = voiceTone(6)
const library = libraryStore(home)
const body = async (req) => { let raw = ''; for await (const chunk of req) raw += chunk; return JSON.parse(raw) }
const send = (res, status, data) => { res.status = status; res.data = data }
const assets = libraryRoutes({ library, body, send })
const voices = voiceRoutes({ home, library, saveMedia: (buf, ext) => { fs.writeFileSync(path.join(home(), 'media', `saved.${ext}`), buf); return { url: `/media/saved.${ext}` } } })
const call = async (route, url, method, data, req = Readable.from([Buffer.from(JSON.stringify(data ?? {}))])) => {
  req.method = method
  const res = { setHeader() {}, end(raw) { this.data = JSON.parse(raw); this.status = this.statusCode } }
  assert(await route(req, res, new URL(url, 'http://local')))
  return res
}
let resume
let began
const started = new Promise((resolve) => { began = resolve })
const held = new Promise((resolve) => { resume = resolve })
const slow = Readable.from((async function* () {
  yield '{"name":'
  began()
  await held
  yield '"Slow character"}'
})())
const savingCharacter = call(assets, '/api/library/characters', 'POST', null, slow)
await started
const saved = await call(voices, '/api/library/voices', 'POST', { name: 'Narrator', consent: true, fileName: 'sample.wav', dataUrl: `data:audio/wav;base64,${pcm.toString('base64')}` })
assert.equal(saved.status, 200, JSON.stringify(saved.data))
const savedId = saved.data.id
resume()
assert.equal((await savingCharacter).status, 200)
assert.equal(library.read().voices[0].id, savedId, 'Slow character body must preserve the newer voice')

// Every asset route uses the same queue, including independently constructed voice routes.
for (const type of ['characters', 'products', 'brands']) {
  const item = (await call(assets, `/api/library/${type}`, 'POST', { name: type })).data
  const results = await Promise.all([
    call(assets, `/api/library/${type}/${item.id}`, 'PATCH', { name: 'Updated' }),
    call(voices, `/api/library/voices/${savedId}`, 'PATCH', { name: `Voice during ${type}` }),
  ])
  assert(results.every((r) => r.status === 200))
  assert.equal(library.read()[type].find((v) => v.id === item.id).name, 'Updated')
  assert.equal(library.read().voices[0].name, `Voice during ${type}`)
  await call(assets, `/api/library/${type}/${item.id}`, 'DELETE')
  assert(!library.read()[type].some((v) => v.id === item.id))
  assert.equal(library.read().voices.length, 1)
}
let release
const wait = new Promise((resolve) => { release = resolve })
const first = library.update(async (lib) => { await wait; lib.products.push({ id: 'queued' }) })
const second = libraryStore(home).update((lib) => { assert(lib.products.some((v) => v.id === 'queued')); lib.brands.push({ id: 'after' }) })
release()
await Promise.all([first, second])
await assert.rejects(library.update(() => { throw new Error('Deliberate transaction failure') }), /Deliberate/)
await library.update((lib) => { lib.recovered = true })
assert(library.read().recovered, 'A rejected transaction must not poison the queue')
assert(!fs.readdirSync(home()).some((name) => name.endsWith('.tmp')), 'Atomic writes leave no temp files')
console.log('Library concurrency checks passed: delayed character body preserves newer voice; create/patch/delete share one queue; failures recover; atomic temp files are renamed.')

const sample = '/media/explicit.wav'
fs.writeFileSync(path.join(home(), 'media', 'explicit.wav'), pcm)
const originalRead = fs.readFileSync
fs.readFileSync = (file, ...args) => {
  assert(!String(file).endsWith('keys.json'), 'Voice rejection must happen before reading provider keys')
  return originalRead(file, ...args)
}
globalThis.fetch = () => assert.fail('No network or paid provider calls permitted')
for (const workflow of ['chatterbox_tts', 'qwen3_tts', 'drama3_tts', 'chatterbox_vc', 'chatterbox_clone']) {
  const template = JSON.parse(fs.readFileSync(`public/workflows/${workflow}.json`))
  const slot = workflow === 'chatterbox_clone' ? 'audio' : 'voice'
  for (const consent of [undefined, false, 'true']) {
    await assert.rejects(runComfy(workflow, { [slot]: sample, voiceConsent: consent }), (e) => e.status === 400 && /speaker's permission/.test(e.message))
  }
  for (const value of [savedId, '/media/saved.wav']) {
    const vars = { [slot]: value }
    await validateWorkflowVoices(workflow, template, vars, home)
    assert.equal(vars[slot], '/media/saved.wav', 'Server resolves consented Library ids and URLs')
  }
  await validateWorkflowVoices(workflow, template, { [slot]: sample, voiceConsent: true }, home)
}
await library.update((lib) => { lib.voices.push({ id: 'unconsented', sample, consent: false, duration: 6 }) })
const template = JSON.parse(fs.readFileSync('public/workflows/drama3_tts.json'))
await assert.rejects(validateWorkflowVoices('drama3_tts', template, { voice: sample }, home), /speaker's permission/)
await library.update((lib) => { lib.voices.push({ id: 'short', sample: '/media/short.wav', consent: true, duration: 5.98 }) })
await assert.rejects(validateWorkflowVoices('drama3_tts', template, { voice: 'short' }, home), /at least 6/)
await validateWorkflowVoices('drama3_tts', template, {}, home)
for (const value of ['https://example.com/voice.wav', '/media/../voice.wav']) {
  await assert.rejects(validateWorkflowVoices('drama3_tts', template, { voice: value, voiceConsent: true }, home), /local voice sample/)
}
const short = Buffer.from(pcm.subarray(0, 44 + Math.round(5.98 * 48000)))
short.writeUInt32LE(short.length - 8, 4); short.writeUInt32LE(short.length - 44, 40)
fs.writeFileSync(path.join(home(), 'media', 'raw-short.wav'), short)
await assert.rejects(validateWorkflowVoices('drama3_tts', template, { voice: '/media/raw-short.wav', voiceConsent: true }, home), /between 6 and 60/)
for (const id of ['tts', 'voice-clone', 'voice-change']) {
  for (const consent of [false, true]) {
    const value = { sample, url: sample, name: 'Test sample', consent }
    const inputs = id === 'voice-clone' ? { audio: value, name: 'Narrator' } : { script: 'Test speech', voice: value, audio: { url: sample } }
    const flow = compileFormat(formatById(id), inputs)
    const opts = flow.nodes.find((n) => n.type === 'model').data.model.formatStep.options
    assert.equal(comfyVars('audio', opts).voiceConsent === true, consent, `${id} forwards only checked consent`)
  }
}
await call(voices, `/api/library/voices/${savedId}`, 'DELETE')
await assert.rejects(validateWorkflowVoices('drama3_tts', template, { voice: '/media/saved.wav' }, home), /speaker's permission/, 'Deleted voices cannot authorize future imitation')
fs.readFileSync = originalRead
console.log('Voice generation policy checks passed: five workflows reject unconsented uploads before keys/network; Library id/URL and explicit checkbox consent accepted; duration, deleted/unconsented records and format consent forwarding checked.')
