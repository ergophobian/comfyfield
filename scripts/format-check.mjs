import assert from 'node:assert/strict'
import { comfyPlaceholders } from './comfy-placeholders.mjs'
import { allFormats, formats, jobs, jobRail, formatsForJob } from '../src/lib/formats/index.js'
import { falFormats } from '../src/lib/formats/fal.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { models } from '../src/lib/catalog.js'
import { validateFormat } from '../src/lib/formats/validate.js'
import { cloudWorkflows } from '../src/lib/catalog.js'

const { comfy, comfyOptional } = comfyPlaceholders()
assert.deepEqual(comfy, schemas.comfy, 'Workflow placeholders changed: refresh format schemas')
assert.deepEqual(comfyOptional, schemas.comfyOptional || {}, 'Optional workflow placeholders changed: refresh format schemas')
// The same format bindings must work on both targets, including omitted references.
for (const [workflow, cloudWorkflow] of Object.entries(cloudWorkflows)) {
  assert(comfy[workflow] && comfy[cloudWorkflow], `${workflow}: missing Cloud alternate`)
  assert.deepEqual(comfy[cloudWorkflow], comfy[workflow], `${workflow}: Cloud alternate changes format inputs`)
  assert.deepEqual(comfyOptional[cloudWorkflow] || [], comfyOptional[workflow] || [], `${workflow}: Cloud alternate changes optional inputs`)
}
const seen = new Set()
for (const format of allFormats) {
  assert(!seen.has(format.id), `Duplicate format ${format.id}`)
  seen.add(format.id)
  const reasons = validateFormat(format, { ...schemas, comfy, comfyOptional })
  if (reasons.length) console.log(`Hidden ${format.id}: ${reasons.join('; ')}`)
  // A missing workflow is planned catalog data. Existing targets must remain valid.
  assert.deepEqual(reasons.filter((r) => !r.includes('Missing Comfy workflow')), [], format.id)
}
for (const format of falFormats) assert.deepEqual(validateFormat(format), [], format.id)
// Every format belongs to one job from the fixed list, and every job has something to run.
const jobIds = jobs.map((j) => j.id)
assert.deepEqual(jobIds.slice(0, 6), ['ugc', 'ads', 'influencer', 'cinematic', 'effects', 'edit'])
for (const format of allFormats) assert(jobIds.includes(format.job), `${format.id}: job ${format.job} is not in the job list`)
for (const format of falFormats) assert(jobIds.includes(format.job), `${format.id}: fal format without a job`)
assert.deepEqual(jobRail().map((j) => j.id), jobIds, 'A job has no runnable format')
assert.equal(jobs.reduce((n, j) => n + formatsForJob(j.id).length, 0), formats.length, 'Jobs must cover every runnable format once')
assert(validateFormat({ ...falFormats[0], job: 'Turn a photo into chrome' }).some((r) => r.startsWith('Unknown job')), 'A one-liner is not a job')
for (const effect of allFormats.filter((f) => f.id.startsWith('effect-'))) assert.notEqual(effect.blurb, effect.job, effect.id)
console.log(`Format check ok: ${formats.length} runnable, ${allFormats.length - formats.length} hidden, ${falFormats.length} migrated fal formats. No generation calls.`)

for (const model of models.filter((m) => m.provider === 'comfyRouter')) {
  const format = {
    id: `check-${model.id}`, name: 'Router schema check', job: 'photo', shape: 'tool', cover: 'sample', kind: model.kind,
    inputs: [{ id: 'prompt', type: 'text', label: 'Prompt' }, ...(model.maxImages ? [{ id: 'image', type: 'image', label: 'Reference' }] : [])],
    steps: [{ id: 'generate', model: model.id, prompt: '{prompt}', settings: { aspect: model.aspects?.[0] || '1:1', duration: 5 } }],
    outputs: [{ step: 'generate', kind: model.kind }],
  }
  assert.deepEqual(validateFormat(format), [], model.id)
}
console.log('All pinned Router models validate as formats against public schema snapshots')
