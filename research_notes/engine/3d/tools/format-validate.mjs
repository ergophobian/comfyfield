// Runs validateFormat on the 3D formats against this folder's graphs, then on the README's proposed changes (in memory).
// Usage: node format-validate.mjs <repo root>
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
const repo = process.argv[2]
const imp = (p) => import(pathToFileURL(`${repo}/${p}`).href)
const { allFormats } = await imp('src/lib/formats/index.js')
const { schemas } = await imp('src/lib/formats/schemas.js')
const { validateFormat } = await imp('src/lib/formats/validate.js')
const comfy = { ...schemas.comfy }
for (const id of ['trellis2_image', 'flux_trellis2', 'trellis2_character', 'trellis2_turntable']) {
  const text = readFileSync(`${repo}/research_notes/engine/3d/${id}.json`, 'utf8')
  comfy[id] = [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))].sort()
  console.log(id, comfy[id].join(','))
}
for (const f of allFormats.filter((f) => f.kind === '3d')) {
  console.log(f.id, f.workflow, JSON.stringify(validateFormat(f, { ...schemas, comfy })))
}
// The format changes the README proposes, applied in memory only.
const { defineFormat } = await imp('src/lib/formats/spec.js')
const pick = (id) => allFormats.find((f) => f.id === id)
const raw = (f) => ({ ...f, steps: undefined, outputs: undefined })
const fixed = [
  defineFormat({ ...raw(pick('image-to-3d')), params: { resolution: 1024 } }),
  defineFormat({ ...raw(pick('turntable')), prompt: '', params: { background: '#ffffff' } }),
  defineFormat({ ...raw(pick('character-to-3d')), runsOn: 'FLUX 3 Image Klein and TRELLIS.2',
    prompt: 'Turn the character in the first image into a full body figure {pose}. Keep their face, hair, outfit and colors. Show the whole figure centered on a plain white background, in soft even light.' }),
]
for (const f of fixed) console.log('after change:', f.id, JSON.stringify(validateFormat(f, { ...schemas, comfy })), JSON.stringify(f.steps[0].params))
