// Public metadata only. No keys and no generation requests.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { allFormats } from '../src/lib/formats/index.js'
import { stepModel } from '../src/lib/formats/options.js'
import { falSchema } from '../server/core.js'

const fal = {}
const targets = allFormats.flatMap((f) => f.steps.filter((s) => s.type !== 'approve').map((s) => stepModel(f, s)))
for (const endpoint of new Set(targets.filter((m) => m?.provider === 'fal').map((m) => m.model))) {
  fal[endpoint] = await falSchema(endpoint)
}
const comfy = {}
for (const file of readdirSync('public/workflows').filter((f) => f.endsWith('.json'))) {
  comfy[file.slice(0, -5)] = [...new Set([...readFileSync(`public/workflows/${file}`, 'utf8').matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))].sort()
}
writeFileSync('src/lib/formats/schemas.js', `// Public fal input schemas and bundled Comfy placeholders. Refresh with node scripts/format-schemas.mjs.\nexport const schemas = ${JSON.stringify({ fal, comfy }, null, 2)}\n`)
console.log(`Saved ${Object.keys(fal).length} public fal schemas and ${Object.keys(comfy).length} workflows`)
