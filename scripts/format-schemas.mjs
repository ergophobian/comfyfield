// Public metadata only. No keys and no generation requests.
// --comfy refreshes only the ComfyUI placeholders and keeps the saved fal and Router schemas (no network).
import { writeFileSync } from 'node:fs'
import { allFormats } from '../src/lib/formats/index.js'
import { stepModel } from '../src/lib/formats/options.js'
import { falSchema } from '../server/core.js'
import { schemas as saved } from '../src/lib/formats/schemas.js'
import { comfyPlaceholders } from './comfy-placeholders.mjs'

const comfyOnly = process.argv.includes('--comfy')
const fal = comfyOnly ? saved.fal : {}
const targets = allFormats.flatMap((f) => f.steps.filter((s) => !s.type).flatMap((s) => s.targets ? Object.keys(s.targets).map((target) => stepModel(f, s, { [s.targetInput]: target })) : [stepModel(f, s)]))
for (const endpoint of comfyOnly ? [] : new Set(targets.filter((m) => m?.provider === 'fal').map((m) => m.model))) {
  fal[endpoint] = await falSchema(endpoint)
}
const { comfy, comfyOptional } = comfyPlaceholders()
const router = comfyOnly ? saved.router : {}
for (const model of comfyOnly ? [] : new Set(targets.filter((m) => m?.provider === 'comfyRouter').map((m) => m.model))) {
  const response = await fetch(`https://docs.comfy.org/router-schemas/${model}.json`)
  if (!response.ok) throw new Error(`No public Router schema for ${model}`)
  const document = await response.json()
  const input = document.paths[`/v2/models/${model}`].post.requestBody.content['application/json'].schema
  router[model] = { required: input.required, properties: Object.fromEntries(Object.entries(input.properties).map(([key, value]) => [key, { type: value.type, enum: value.enum }])) }
}
writeFileSync('src/lib/formats/schemas.js', `// Public fal/Router schemas and bundled Comfy placeholders. Refresh with node scripts/format-schemas.mjs.\nexport const schemas = ${JSON.stringify({ fal, comfy, comfyOptional, router }, null, 2)}\n`)
console.log(`Saved ${Object.keys(fal).length} public fal schemas and ${Object.keys(comfy).length} workflows`)
