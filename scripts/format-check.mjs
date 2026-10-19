import assert from 'node:assert/strict'
import { comfyPlaceholders } from './comfy-placeholders.mjs'
import { allFormats, formats } from '../src/lib/formats/index.js'
import { recipes } from '../src/lib/recipes.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { validateFormat } from '../src/lib/formats/validate.js'

const { comfy, comfyOptional } = comfyPlaceholders()
assert.deepEqual(comfy, schemas.comfy, 'Workflow placeholders changed: refresh format schemas')
assert.deepEqual(comfyOptional, schemas.comfyOptional || {}, 'Optional workflow placeholders changed: refresh format schemas')
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
