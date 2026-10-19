import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fill, comfyVars } from '../shared/mapping.js'

// Kept separate from the format runner lane's inventory checks.
for (const name of ['ltx_i2v', 'h3_i2v']) {
  const template = JSON.parse(readFileSync(new URL(`../public/workflows/${name}.json`, import.meta.url)))
  const vars = comfyVars('video', { prompt: 'A slow camera orbit', aspect: '16:9', duration: 5, image: 'start.png' })
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
    assert.equal(graph['2'].class_type, 'MinimaxHailuo03FirstLastFrameNode')
    assert.equal(graph['2'].inputs['model.duration'], 5)
    assert.equal(graph['2'].inputs['model.prompt'], vars.prompt)
  }
  console.log(`${name}: API graph, placeholders and links valid`)
}

for (const name of ['qwen2511_photodump', 'qwen2511_reframe']) {
  const template = JSON.parse(readFileSync(new URL(`../public/workflows/${name}.json`, import.meta.url)))
  const vars = comfyVars('image', { prompt: 'Continue the same scene', aspect: '9:16', image: 'reference.png', images: ['reference.png', 'second.png', 'third.png'] })
  const graph = fill(template, vars)
  assert(!JSON.stringify(graph).includes('{{'), `${name}: unresolved graph variable`)
  assert.equal(graph['7'].inputs.image, 'reference.png')
  assert.equal(graph['9'].inputs.width, vars.width)
  assert.equal(graph['9'].inputs.height, vars.height)
  assert.equal(graph['14'].inputs.prompt, vars.prompt)
  assert.equal(graph['18'].class_type, 'SaveImage')
  if (name === 'qwen2511_photodump') {
    assert.equal(graph['10'].inputs.image, 'second.png')
    assert.equal(graph['11'].inputs.image, 'third.png')
  } else {
    assert.equal(graph['25'].class_type, 'ImagePadForOutpaint')
    assert.deepEqual(graph['18'].inputs.images, ['27', 0])
    assert.equal(graph['27'].class_type, 'ImageCompositeMasked')
  }
  console.log(`${name}: references, canvas, prompt and saved output valid; untested live`)
}
