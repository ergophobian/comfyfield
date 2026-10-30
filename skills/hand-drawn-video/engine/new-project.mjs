#!/usr/bin/env node
// Starts a project: copies the page template and a fresh copy of the kit into <dir>.
//   node new-project.mjs <dir>
// Each project keeps its own kit copy, so changing one film never changes another.
import fs from 'node:fs'
import path from 'node:path'
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const dir = process.argv[2]
if (!dir) { console.log('node new-project.mjs <dir>'); process.exit(1) }
if (fs.existsSync(path.join(dir, 'index.html'))) { console.log(`${dir} already has a project; nothing copied`); process.exit(1) }
fs.mkdirSync(path.join(dir, 'kit'), { recursive: true })
for (const f of fs.readdirSync(path.join(here, 'template'))) fs.copyFileSync(path.join(here, 'template', f), path.join(dir, f))
for (const f of fs.readdirSync(path.join(here, 'kit'))) fs.copyFileSync(path.join(here, 'kit', f), path.join(dir, 'kit', f))
fs.mkdirSync(path.join(dir, 'out'), { recursive: true })
console.log(`project ready in ${dir}
  preview:  open ${path.join(dir, 'index.html')} in a browser (or serve the folder)
  stills:   node "${path.join(here, 'render.mjs')}" stills "${dir}" --times 0,1,2
  render:   node "${path.join(here, 'render.mjs')}" render "${dir}" --out "${path.join(dir, 'out', 'film.mp4')}"`)
