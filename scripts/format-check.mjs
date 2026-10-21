import assert from 'node:assert/strict'
import { comfyPlaceholders } from './comfy-placeholders.mjs'
import { allFormats, formats } from '../src/lib/formats/index.js'
import { recipes } from '../src/lib/recipes.js'
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
for (const recipe of recipes) assert.deepEqual(validateFormat(recipe), [], recipe.id)
console.log(`Format check ok: ${formats.length} runnable, ${allFormats.length - formats.length} hidden, ${recipes.length} migrated recipes. No generation calls.`)

for (const model of models.filter((m) => m.provider === 'comfyRouter')) {
  const format = {
    id: `check-${model.id}`, name: 'Router schema check', job: 'Check a mapped prompt', shape: 'tool', cover: 'sample', kind: model.kind,
    inputs: [{ id: 'prompt', type: 'text', label: 'Prompt' }, ...(model.maxImages ? [{ id: 'image', type: 'image', label: 'Reference' }] : [])],
    steps: [{ id: 'generate', model: model.id, prompt: '{prompt}', settings: { aspect: model.aspects?.[0] || '1:1', duration: 5 } }],
    outputs: [{ step: 'generate', kind: model.kind }],
  }
  assert.deepEqual(validateFormat(format), [], model.id)
}
console.log('All pinned Router models validate as formats against public schema snapshots')
