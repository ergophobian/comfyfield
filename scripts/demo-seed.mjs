import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

// Local files only. The normal Library adapter sees /media URLs and never downloads anything.
export async function seedDemo({ manifest, home }) {
  if (!manifest || !home) throw new Error('Pass --manifest <file> and --home <app home>. Stop generation/import writers first.')
  const spec = JSON.parse(fs.readFileSync(manifest, 'utf8'))
  if (!Array.isArray(spec.items) || !spec.items.length) throw new Error('Manifest needs items.')
  const files = spec.items.map((item) => {
    if (!item.label?.trim() || !item.model?.trim() || !['pre-generated', 'source-photo'].includes(item.source)) throw new Error('Each item needs label, model and source: pre-generated or source-photo.')
    if (item.source === 'pre-generated' && (!item.provider?.trim() || !item.providerJobId?.trim())) throw new Error('Pre-generated media needs its real provider and providerJobId. Do not invent evidence.')
    const file = path.resolve(path.dirname(path.resolve(manifest)), item.file)
    const ext = path.extname(file).slice(1).toLowerCase()
    const kind = ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? 'image' : null
    if (!kind) throw new Error('Use a local image or video file.')
    const bytes = fs.readFileSync(file)
    if (!bytes.length) throw new Error('Media file is empty.')
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    return { item, ext, kind, bytes, sha256 }
  })
  process.env.COMFYFIELD_HOME = path.resolve(home)
  const core = await import('../server/core.js')
  const seeded = []
  for (const { item, ext, kind, bytes, sha256 } of files) {
    const label = item.source === 'pre-generated' ? 'Pre-generated · recorded earlier' : 'Source photo · imported'
    const existing = core.libraryImports().find((entry) => entry.demoSource?.sha256 === sha256 && entry.caption === `${label} · ${item.label}`)
    if (existing) { seeded.push(existing); continue }
    const local = core.saveMedia(bytes, ext)
    seeded.push(...await core.saveToLibrary([{ ...local, kind }], {
      model: `${label} · ${item.model}`, caption: `${label} · ${item.label}`, aspect: item.aspect || '16:9',
      demoSource: { source: item.source, sha256, provider: item.provider || null, providerJobId: item.providerJobId || null },
    }))
  }
  return seeded
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { manifest: { type: 'string' }, home: { type: 'string' } } })
  seedDemo(values).then((items) => console.log(JSON.stringify(items, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1 })
}
