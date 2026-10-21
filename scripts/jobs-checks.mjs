import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createJobs } from '../server/jobs.js'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-jobs-'))
const file = path.join(dir, 'jobs.json')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let passed = 0
const ok = (name) => { passed++; console.log(`ok    ${name}`) }

{
  const jobs = createJobs(file)
  const id = jobs.start(async () => { await sleep(40); return [{ url: '/media/a.png', kind: 'image' }] })
  assert.equal(jobs.get(id).status, 'running')
  await sleep(80)
  assert.equal(jobs.get(id).status, 'done')
  assert.deepEqual(jobs.get(id).files, [{ url: '/media/a.png', kind: 'image' }])
  ok('A job runs on its own and keeps its files')

  const bad = jobs.start(async () => { throw Object.assign(new Error('needs a Pod'), { code: 'needs_pod', reason: 'too big', fit: { gb: 48 } }) })
  await sleep(10)
  assert.deepEqual(jobs.get(bad).error, { message: 'needs a Pod', code: 'needs_pod', reason: 'too big', fit: { gb: 48 } })
  assert.equal(jobs.get(bad).status, 'failed')
  ok('A failed job keeps the code, reason and fit the browser routes on')

  let stopped = 0
  const slow = jobs.start(async (ctx) => { ctx.onCancel(() => { stopped++ }); await sleep(60); return [{ url: '/media/late.png' }] })
  await sleep(5)
  assert.equal(jobs.cancel(slow).status, 'cancelled')
  await sleep(90)
  assert.equal(stopped, 1)
  assert.equal(jobs.get(slow).status, 'cancelled')
  assert.equal(jobs.get(slow).files, undefined)
  ok('Cancel calls the provider stop once and ignores a late result')

  assert.equal(jobs.get('nope'), null)
  assert.equal(jobs.cancel('nope'), null)
  ok('An unknown job is null, so the route answers 404')

  jobs.start(() => new Promise(() => {}))
  await sleep(10)
  const again = createJobs(file)
  assert.equal(again.get(id).status, 'done')
  const states = JSON.parse(fs.readFileSync(file, 'utf8')).map((j) => again.get(j.id).status).sort()
  assert.deepEqual(states, ['cancelled', 'done', 'failed', 'failed'])
  const lost = JSON.parse(fs.readFileSync(file, 'utf8')).find((j) => j.status === 'running')
  assert.match(again.get(lost.id).error.message, /app stopped/)
  ok('After a restart, finished jobs are still there and a running one is marked lost')
}

fs.rmSync(dir, { recursive: true, force: true })
console.log(`all ${passed} passed`)
process.exit(0)
