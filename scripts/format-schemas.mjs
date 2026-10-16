// Public metadata only. No keys and no generation requests.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { allFormats } from '../src/lib/formats/index.js'
import { stepModel } from '../src/lib/formats/options.js'
import { falSchema } from '../server/core.js'

const fal = {}
const targets = allFormats.flatMap((f) => f.steps.filter((s) => !s.type).flatMap((s) => s.targets ? Object.keys(s.targets).map((target) => stepModel(f, s, { [s.targetInput]: target })) : [stepModel(f, s)]))
for (const endpoint of new Set(targets.filter((m) => m?.provider === 'fal').map((m) => m.model))) {
  fal[endpoint] = await falSchema(endpoint)
}
const comfy = {}
for (const file of readdirSync('public/workflows').filter((f) => f.endsWith('.json'))) {
  comfy[file.slice(0, -5)] = [...new Set([...readFileSync(`public/workflows/${file}`, 'utf8').matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))].sort()
}
const router = {}
for (const model of new Set(targets.filter((m) => m?.provider === 'comfyRouter').map((m) => m.model))) {
  const response = await fetch(`https://docs.comfy.org/router-schemas/${model}.json`)
  if (!response.ok) throw new Error(`No public Router schema for ${model}`)
  const document = await response.json()
  const input = document.paths[`/v2/models/${model}`].post.requestBody.content['application/json'].schema
  router[model] = { required: input.required, properties: Object.fromEntries(Object.entries(input.properties).map(([key, value]) => [key, { type: value.type, enum: value.enum }])) }
}
writeFileSync('src/lib/formats/schemas.js', `// Public fal/Router schemas and bundled Comfy placeholders. Refresh with node scripts/format-schemas.mjs.\nexport const schemas = ${JSON.stringify({ fal, comfy, router }, null, 2)}\n`)
console.log(`Saved ${Object.keys(fal).length} public fal schemas and ${Object.keys(comfy).length} workflows`)
