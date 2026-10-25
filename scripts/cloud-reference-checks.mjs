// Offline reference-conditioning and canvas checks. No models, keys or providers.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { cloudWorkflows } from '../src/lib/catalog.js'
import { dropOptional, fill } from '../shared/mapping.js'
import { schemas } from '../src/lib/formats/schemas.js'

const read = (name) => JSON.parse(readFileSync(`public/workflows/${name}.json`, 'utf8'))
for (const cloud of Object.values(cloudWorkflows)) {
  assert(!Object.values(read(cloud)).some((n) => n.class_type === 'ImageStitch'), `${cloud}: reference contact sheet returned`)
}

// Follow the conditioning contract: the encoder appends its image latents, then each
// ReferenceLatent appends one more. Missing optional latent inputs pass through.
function references(graph, link) {
  const node = graph[link[0]]
  const input = node.inputs
  if (node.class_type === 'TextEncodeQwenImageEditPlus') {
    const images = ['image1', 'image2', 'image3'].filter((key) => input[key]).map((key) => imageOf(graph, input[key]))
    return { vision: images, latent: images }
  }
  if (node.class_type === 'ReferenceLatent') {
    const previous = references(graph, input.conditioning)
    return { ...previous, latent: [...previous.latent, ...(input.latent ? [imageOf(graph, input.latent)] : [])] }
  }
  assert.equal(node.class_type, 'FluxKontextMultiReferenceLatentMethod')
  return references(graph, input.conditioning)
}
function imageOf(graph, link) {
  const node = graph[link[0]]
  if (node.class_type === 'LoadImage') return node.inputs.image
  if (node.class_type === 'VAEEncode') return imageOf(graph, node.inputs.pixels)
  assert.equal(node.class_type, 'ImageScaleToTotalPixels')
  assert.equal(node.inputs.megapixels, 1)
  assert.equal(node.inputs.resolution_steps, 8)
  return imageOf(graph, node.inputs.image)
}
const cases = [
  ['qwen_multi_h3_cloud', ['image', 'image2', 'image3', 'image4', 'image5']],
  ['qwen_try_on_h3_cloud', ['image4', 'image', 'image2', 'image3']],
]
for (const [name, order] of cases) {
  const template = read(name)
  const optional = schemas.comfyOptional[name]
  for (let bits = 0; bits < 2 ** optional.length; bits++) {
    const values = { image: 'image', image2: 'image2', image3: 'image3', image4: 'image4', image5: 'image5', prompt: 'A scene', width: 1024, height: 1024 }
    optional.forEach((key, i) => { if (!(bits & (1 << i))) delete values[key] })
    const graph = fill(dropOptional(template, values), values)
    const guider = graph['7'].inputs
    const expected = { vision: order.slice(0, 3).filter((key) => values[key]), latent: order.filter((key) => values[key]) }
    assert.deepEqual(references(graph, guider.positive), expected, `${name}: positive references, optional subset ${bits}`)
    assert.deepEqual(references(graph, guider.negative), expected, `${name}: negative references, optional subset ${bits}`)
    const latent = graph[graph['11'].inputs.latent_image[0]]
    assert.equal(latent.class_type, 'EmptySD3LatentImage')
    if (name === 'qwen_multi_h3_cloud') {
      const size = graph['86']
      assert.equal(size.class_type, 'GetImageSize')
      assert.equal(imageOf(graph, size.inputs.image), 'image')
      for (const [width, height] of [[1024, 1024], [1600, 900], [900, 1600]]) {
        const dimensions = ['width', 'height'].map((key, i) => {
          const math = graph[latent.inputs[key][0]]
          assert.equal(math.class_type, 'ComfyMathExpression')
          assert.equal(math.inputs.expression, `max(32, round(1024 * sqrt(${i ? 'b / a' : 'a / b'}) / 32) * 32)`)
          assert.deepEqual(math.inputs['values.a'], ['86', 0])
          assert.deepEqual(math.inputs['values.b'], ['86', 1])
          return Math.max(32, Math.round(1024 * Math.sqrt(i ? height / width : width / height) / 32) * 32)
        })
        assert.deepEqual(dimensions, width === height ? [1024, 1024] : width > height ? [1376, 768] : [768, 1376])
      }
    } else {
      // Try-on already uses the requested aspect, independent of reference count.
      assert.deepEqual(latent.inputs.width, ['42', 1])
      assert.deepEqual(latent.inputs.height, ['43', 1])
      assert.equal(graph['40'].inputs.value, values.width)
      assert.equal(graph['41'].inputs.value, values.height)
    }
  }
}
console.log('Cloud references: separate vision images and ordered latents survive every optional subset; first-reference and requested-aspect canvases stay independent of reference count. No live runs.')
