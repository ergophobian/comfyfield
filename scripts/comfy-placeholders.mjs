// The {{placeholders}} each bundled ComfyUI graph takes, and the ones that sit only on nodes that drop
// out when the run has no such file (`_meta.optional`). format-schemas writes them, format-check
// compares them.
import { readdirSync, readFileSync } from 'node:fs'

const keys = (value) => [...JSON.stringify(value).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])

export function comfyPlaceholders(dir = 'public/workflows') {
  const comfy = {}
  const comfyOptional = {}
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const graph = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'))
    const id = file.slice(0, -5)
    comfy[id] = [...new Set(keys(graph))].sort()
    const required = new Set(Object.values(graph).filter((n) => !n?._meta?.optional).flatMap(keys))
    const optional = comfy[id].filter((k) => !required.has(k))
    if (optional.length) comfyOptional[id] = optional
  }
  return { comfy, comfyOptional }
}
