import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fill, comfyVars } from '../shared/mapping.js'
import { h3Sizes } from '../src/lib/catalog.js'

// Kept separate from the format runner lane's inventory checks.
for (const name of ['ltx_i2v', 'h3_open_i2v']) {
  const template = JSON.parse(readFileSync(new URL(`../public/workflows/${name}.json`, import.meta.url)))
  const vars = comfyVars('video', { prompt: 'A slow camera orbit', aspect: '16:9', duration: 5, image: 'start.png' }, name === 'h3_open_i2v' ? h3Sizes : undefined)
  const placeholders = [...JSON.stringify(template).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])
  assert(placeholders.includes('image') && placeholders.includes('prompt'))
  for (const key of placeholders) assert(vars[key] != null, `${name}: no value for ${key}`)
  const graph = fill(template, vars)
  assert(!JSON.stringify(graph).includes('{{'))
  const visit = (value) => {
    if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && Number.isInteger(value[1])) {
      assert(graph[value[0]], `${name}: dangling link ${value[0]}`)
      assert(value[1] >= 0)
    } else if (value && typeof value === 'object') Object.values(value).forEach(visit)
  }
  for (const node of Object.values(graph)) {
    assert.equal(typeof node.class_type, 'string')
    assert(node.inputs && !Array.isArray(node.inputs))
    visit(node.inputs)
  }
  assert(Object.values(graph).some((node) => node.class_type === 'LoadImage' && node.inputs.image === vars.image))
  assert(Object.values(graph).some((node) => node.class_type === 'SaveVideo'))
  if (name === 'ltx_i2v') {
    const latent = Object.values(graph).find((node) => node.class_type === 'LTXVImgToVideo')
    assert.equal(latent.inputs.width % 32, 0)
    assert.equal(latent.inputs.height % 32, 0)
    assert.equal((latent.inputs.length - 1) % 8, 0)
    assert.deepEqual(graph['9'].inputs.latent_image, ['6', 2])
  } else {
    // The open-weights H3 graph, not the paid MiniMax partner node.
    assert.equal(graph['6'].class_type, 'MiniMaxH3ImageToVideo')
    assert.deepEqual([graph['6'].inputs.width, graph['6'].inputs.height], [1344, 768])
    assert.equal(graph['6'].inputs.prompt, vars.prompt)
  }
  console.log(`${name}: API graph, placeholders and links valid`)
}
