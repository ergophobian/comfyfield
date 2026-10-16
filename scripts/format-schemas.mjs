// Public metadata only. No keys and no generation requests.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { recipes } from '../src/lib/recipes.js'
import { falSchema } from '../server/core.js'

const fal = {}
for (const endpoint of new Set(recipes.map((r) => r.model))) {
  fal[endpoint] = await falSchema(endpoint)
}
const comfy = {}
for (const file of readdirSync('public/workflows').filter((f) => f.endsWith('.json'))) {
  comfy[file.slice(0, -5)] = [...new Set([...readFileSync(`public/workflows/${file}`, 'utf8').matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))].sort()
}
writeFileSync('src/lib/formats/schemas.js', `// Public fal input schemas and bundled Comfy placeholders. Refresh with node scripts/format-schemas.mjs.\nexport const schemas = ${JSON.stringify({ fal, comfy }, null, 2)}\n`)
console.log(`Saved ${Object.keys(fal).length} public fal schemas and ${Object.keys(comfy).length} workflows`)
