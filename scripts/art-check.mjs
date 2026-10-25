import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { allFormats, formats, featuredFor, railFor, hubs, categories } from '../src/lib/formats/index.js'
import { tools, openModels } from '../src/lib/tools.js'
import { coverArt, heroArt, heroSources, hubArt, categoryArt, toolArt, modelArt } from '../src/lib/formats/art.js'

const sizes = JSON.parse(readFileSync('research_notes/placeholder-assets-sizes.json'))
const prompts = JSON.parse(readFileSync('research_notes/placeholder-assets-prompts.json'))
const sources = JSON.parse(readFileSync('research_notes/placeholder-assets-sources.json'))
const priority = new Set(allFormats.filter((f) => f.featured).map((f) => f.id))
for (const kind of ['image', 'video', 'audio', '3d']) {
  featuredFor(kind).forEach((f) => priority.add(f.id))
  railFor(kind, false).forEach((c) => priority.add(formats.find((f) => f.kind === kind && f.category === c.id).id))
}
for (const hub of hubs) formats.filter((f) => f.hub === hub.id).slice(0, 5).forEach((f) => priority.add(f.id))
const asset = (url) => {
  assert(url?.startsWith('/art/'), `Missing art: ${url}`)
  const path = `public${url}`
  assert(existsSync(path), `Missing asset: ${path}`)
  const bytes = readFileSync(path)
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
  const size = sizes.find((s) => s.path === path)
  assert(size, `Missing size record: ${path}`)
  assert.equal(size.bytes, statSync(path).size)
  assert(size.bytes <= (url.includes('/heroes/') ? 200000 : 80000), `Over budget: ${path}`)
  assert(Math.max(size.width, size.height) <= (url.includes('/heroes/') ? 1600 : 768))
}
for (const id of priority) { assert(coverArt[id], `Priority format needs art: ${id}`); asset(coverArt[id]) }
Object.values(coverArt).forEach(asset)
Object.keys(heroSources).forEach((id) => asset(heroArt(id)))
hubs.forEach((h) => asset(hubArt(h.id)))
categories.forEach((c) => asset(categoryArt(c.id)))
tools.forEach((t) => asset(toolArt(t.id)))
openModels.forEach((m) => asset(modelArt(m.kind, m.id)))
for (const source of sources) assert(prompts.some((p) => p.id === source.id && p.prompt === source.prompt), `Missing exact prompt: ${source.id}`)
assert.equal(coverArt['unknown-format'], undefined, 'Unmapped formats must preserve their gradients')
console.log(`art ok: ${priority.size} priority formats, ${sources.length} generated originals, ${sizes.length} optimized assets, ${sizes.reduce((n, s) => n + s.bytes, 0)} bytes`)
