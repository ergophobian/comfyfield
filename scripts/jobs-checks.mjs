import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createJobs } from '../server/jobs.js'
import { progressText, waitJob } from '../src/lib/jobs.js'
import { keepRequestKey } from '../src/lib/routerBatch.js'

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

  const bad = jobs.start(async () => { throw Object.assign(new Error('needs a Pod'), { status: 503, uncancelled: 'provider-job', jobId: 'provider-job', code: 'needs_pod', requestId: 'request-1', idempotencyKey: 'key-1', retryable: false, reason: 'too big', fit: { gb: 48 } }) })
  await sleep(10)
  assert.deepEqual(jobs.get(bad).error, { message: 'needs a Pod', status: 503, uncancelled: 'provider-job', jobId: 'provider-job', code: 'needs_pod', requestId: 'request-1', idempotencyKey: 'key-1', retryable: false, reason: 'too big', fit: { gb: 48 } })
  assert.equal(jobs.get(bad).status, 'failed')
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = async () => Response.json(createJobs(file).get(bad))
    await assert.rejects(waitJob(bad), (error) => {
      for (const [key, value] of Object.entries(jobs.get(bad).error)) assert.deepEqual(error[key], value)
      assert.equal(keepRequestKey(error), false, 'Explicit terminal failure overrides a retryable HTTP status')
      return true
    })
  } finally { globalThis.fetch = originalFetch }
  ok('Job errors preserve status, code, request id, key, retryability and Pod details through disk and polling')

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
  assert.match(again.get(lost.id).error.message, /first run may already have been charged/)
  assert.match(again.get(lost.id).error.message, /Retrying starts a new request and may charge again/)
  assert.equal(again.get(lost.id).error.code, 'interrupted')
  const restartFetch = globalThis.fetch
  try {
    globalThis.fetch = async () => Response.json(again.get(lost.id))
    await assert.rejects(waitJob(lost.id), (error) => error.code === 'interrupted' && /may charge again/.test(error.message))
    globalThis.fetch = async () => new Response('', { status: 404 })
    await assert.rejects(waitJob('missing'), (error) => error.code === 'interrupted' && /may already have been charged/.test(error.message))
  } finally { globalThis.fetch = restartFetch }
  ok('After a restart, finished jobs are still there and a running one is marked lost')
}

{
  const progressFile = path.join(dir, 'progress.json')
  const jobs = createJobs(progressFile)
  let report
  let release
  const id = jobs.start((ctx) => { report = ctx.onProgress; return new Promise((resolve) => { release = resolve }) })
  await sleep(5)
  report({ where: 'Comfy Cloud', status: 'running', value: 0.5, step: 10, steps: 20 })
  assert.equal(jobs.get(id).progress.value, 0.5)
  jobs.start(async () => [])
  await sleep(5)
  assert(!fs.readFileSync(progressFile, 'utf8').includes('progress'), 'Progress is not written to disk')
  const seen = []
  const originalFetch = globalThis.fetch
  try {
    let polls = 0
    globalThis.fetch = async () => {
      polls++
      if (polls === 1) return Response.json(jobs.get(id))
      if (polls === 2) { report({ where: 'Comfy Cloud', status: 'running', value: 0.9, nodesDone: 8, nodesTotal: 9 }); return Response.json(jobs.get(id)) }
      if (polls === 3) { release([{ url: '/media/clip.mp4', kind: 'video' }]); await sleep(5); return Response.json(jobs.get(id)) }
      throw new Error('Polled after done')
    }
    const files = await waitJob(id, { onProgress: (p) => seen.push(p.value) })
    assert.deepEqual(files, [{ url: '/media/clip.mp4', kind: 'video' }])
  } finally { globalThis.fetch = originalFetch }
  assert.deepEqual(seen, [0.5, 0.9], 'Each new snapshot reaches the tile once')
  assert.equal(jobs.get(id).progress, undefined, 'A finished job drops its progress')
  report({ where: 'Comfy Cloud', status: 'running', value: 0.1 })
  assert.equal(jobs.get(id).progress, undefined, 'Late progress after the end is ignored')
  assert.equal(progressText(null), null)
  assert.equal(progressText({ where: 'Comfy Cloud', status: 'queued', queuePosition: 3 }), 'Queued on Comfy Cloud, 3 ahead')
  assert.equal(progressText({ where: 'The Pod', status: 'queued', queuePosition: null }), 'Queued on the Pod')
  assert.equal(progressText({ where: 'Comfy Cloud', status: 'running', queuePosition: null }), 'Rendering on Comfy Cloud')
  assert.equal(progressText({ status: 'running', value: 0.42, step: 8, steps: 20 }), 'Rendering 42%, step 8 of 20')
  assert.equal(progressText({ status: 'running', value: 0.9, nodesDone: 8, nodesTotal: 9 }), 'Rendering 90%, node 8 of 9')
  ok('Comfy progress lives on the running job, reaches waitJob hooks and reads as a tile line')
}

fs.rmSync(dir, { recursive: true, force: true })
console.log(`all ${passed} passed`)
process.exit(0)
