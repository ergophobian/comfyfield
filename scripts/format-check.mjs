import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { allFormats, formats } from '../src/lib/formats/index.js'
import { recipes } from '../src/lib/recipes.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { validateFormat } from '../src/lib/formats/validate.js'

const comfy = {}
for (const file of readdirSync('public/workflows').filter((f) => f.endsWith('.json'))) {
  const text = readFileSync(`public/workflows/${file}`, 'utf8')
  JSON.parse(text)
  comfy[file.slice(0, -5)] = [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))].sort()
}
assert.deepEqual(comfy, schemas.comfy, 'Workflow placeholders changed: refresh format schemas')
const seen = new Set()
for (const format of allFormats) {
  assert(!seen.has(format.id), `Duplicate format ${format.id}`)
  seen.add(format.id)
  const reasons = validateFormat(format, { ...schemas, comfy })
  if (reasons.length) console.log(`Hidden ${format.id}: ${reasons.join('; ')}`)
  // A missing workflow is planned catalog data. Existing targets must remain valid.
  assert.deepEqual(reasons.filter((r) => !r.includes('Missing Comfy workflow')), [], format.id)
}
for (const recipe of recipes) assert.deepEqual(validateFormat(recipe), [], recipe.id)
console.log(`Format check ok: ${formats.length} runnable, ${allFormats.length - formats.length} hidden, ${recipes.length} migrated recipes. No generation calls.`)
