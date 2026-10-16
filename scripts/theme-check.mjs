// Keeps the theme on its tokens: raw colors, sizes, radii and timings belong in :root in src/styles.css.
// A line can opt out with a /* theme-ok: reason */ comment.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const problems = []
const flag = (file, line, msg) => problems.push(`${file}:${line}  ${msg}`)

const cssFile = 'src/styles.css'
const css = readFileSync(cssFile, 'utf8').split(/\r?\n/)
let inRoot = false
css.forEach((text, i) => {
  const line = i + 1
  if (/^:root\s*\{/.test(text)) inRoot = true
  if (inRoot) { if (/^\}/.test(text)) inRoot = false; return }
  if (text.includes('theme-ok')) return
  const code = text.replace(/\/\*.*?\*\//g, '')
  if (/#[0-9a-f]{3,8}\b/i.test(code)) flag(cssFile, line, 'hex color outside :root, use a color token')
  if (/\b(rgba?|hsla?)\(/.test(code)) flag(cssFile, line, 'rgb() or hsl() outside :root, use a color token')
  if (/font-size:\s*\d/.test(code)) flag(cssFile, line, 'raw font-size, use a --text-* token')
  if (/font-weight:\s*(?!400|500|600)\d/.test(code)) flag(cssFile, line, 'font weight other than 400, 500 or 600')
  if (/border-radius:\s*[1-9]\d*px/.test(code)) flag(cssFile, line, 'raw border-radius, use a --r-* token')
  if (/text-transform:\s*uppercase/.test(code)) flag(cssFile, line, 'uppercase text, use sentence case')
  if (/backdrop-filter:\s*blur/.test(code)) flag(cssFile, line, 'raw backdrop blur, use a --blur-* token')
  for (const [, decl] of code.matchAll(/(?:transition|animation):\s*([^;}]+)/g)) {
    // looping animations (shimmer, clouds) run on their own clock
    if (/\binfinite\b/.test(decl)) continue
    if (/(^|[\s,(])\d*\.?\d+m?s\b/.test(decl)) flag(cssFile, line, 'raw duration, use a --dur-* token')
  }
})

const jsx = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
  d.isDirectory() ? jsx(join(dir, d.name)) : d.name.endsWith('.jsx') ? [join(dir, d.name)] : [])
for (const file of jsx('src')) {
  readFileSync(file, 'utf8').split(/\r?\n/).forEach((text, i) => {
    for (const [, style] of text.matchAll(/style=\{\{([^}]*)\}\}/g)) {
      if (/\b(color|fontSize|fontWeight|borderRadius|boxShadow)\s*:/.test(style)) flag(file, i + 1, 'inline theme style, use a class')
    }
  })
}

for (const p of problems) console.log(p)
console.log(problems.length ? `${problems.length} theme problems` : 'theme ok')
process.exit(problems.length ? 1 : 0)
