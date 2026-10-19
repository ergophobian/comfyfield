import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { photodumpFormat, reframeFormat, reframeRatios } from '../src/lib/formats/photodumpReframe.js'
import { photodumpSets, setSizes, photoRatios, qualities } from '../src/components/studio/presets.js'
import { compileFormat, runFormat } from '../src/lib/formats/runner.js'
import { validateFormat } from '../src/lib/formats/validate.js'
import { comfyVars, fill, dropOptional } from '../shared/mapping.js'
import { MODEL_FILES, LOADERS } from '../shared/modelFiles.js'
import { checkGraph } from './graph-check.mjs'

const core = JSON.parse(readFileSync('scripts/fixtures/comfy-nodes.json', 'utf8')).nodes
const graphFor = (name) => JSON.parse(readFileSync(`public/workflows/${name}.json`, 'utf8'))
// The schema snapshot's LoadImage combo lists fixture files, not runtime uploads.
const checkFilled = (graph) => {
  const checked = structuredClone(graph)
  for (const node of Object.values(checked)) if (node.class_type === 'LoadImage') node.inputs.image = '{{image}}'
  return checkGraph(checked)
}
const reference = { url: '/reference.png', name: 'Reference', ratio: '1600:900' }
for (const set of photodumpSets) {
  for (const count of setSizes) {
    const format = photodumpFormat(set.id, count)
    assert.deepEqual(validateFormat(format), [], `${set.id}/${count}`)
    const flow = compileFormat(format, { image: reference })
    const nodes = flow.nodes.filter((node) => node.type === 'model')
    assert.equal(nodes.length, count)
    assert.equal(flow.outputs.length, count)
    assert.equal(new Set(nodes.map((node) => node.data.prompt)).size, count)
    assert(nodes.every((node) => node.data.prompt.includes(set.blurb)))
    assert(nodes.every((node) => node.data.model.formatStep.from.length === 0))
  }
}
for (const ratio of photoRatios) {
  for (const quality of qualities) {
    const format = photodumpFormat('glow', 4)
    const records = []
    const run = await runFormat(format, { image: reference, image2: { url: '/second.png' }, image3: { url: '/third.png' }, ratio, quality }, {
      run: async (model, options, meta) => {
        const vars = comfyVars('image', options, model.sizes)
        records.push({ model, options, vars, meta })
        return [{ url: `/result-${meta.stepId}.png`, kind: 'image' }]
      },
    })
    assert.equal(run.results().length, 4)
    assert.equal(records.length, 4)
    for (const { model, options, vars, meta } of records) {
      assert.equal(meta.formatId, 'photodump')
      assert.equal(options.aspect, ratio)
      assert.equal(Math.max(vars.width, vars.height) <= (quality === '2k' ? 2048 : 1536), true)
      const [w, h] = ratio.split(':').map(Number)
      assert.equal(vars.width / vars.height, w / h)
      assert.equal(vars.image, reference.url)
      assert.equal(vars.image2, '/second.png')
      assert.equal(vars.image3, '/third.png')
      assert.equal(vars.width % 8, 0)
      assert.equal(vars.height % 8, 0)
      const graph = fill(graphFor(model.workflow), vars)
      assert.deepEqual(graph['9'].inputs, { width: vars.width, height: vars.height, batch_size: 1 })
      assert.equal(graph['14'].inputs.prompt, options.prompt)
      assert(!JSON.stringify(graph).includes('{{'))
      assert.deepEqual(checkFilled(graph), [])
    }
  }
}
for (const ratio of reframeRatios) {
  await runFormat(reframeFormat, { image: reference, ratio, direction: 'Continue the sea' }, {
    run: async (model, options) => {
      const vars = comfyVars('image', options, model.sizes)
      assert.equal(options.aspect, ratio)
      assert(vars.prompt.includes('Continue the sea'))
      assert(vars.prompt.includes(ratio))
      const graph = fill(graphFor(model.workflow), vars)
      assert.deepEqual(checkFilled(graph), [])
      assert.equal(graph['7'].inputs.image, reference.url)
      assert.deepEqual(graph['18'].inputs.images, ['27', 0])
      assert.deepEqual(graph['27'].inputs.source, ['25', 0])
      assert.deepEqual(graph['27'].inputs.mask, ['26', 0])
      // Exercise the exact sizing expressions for portrait, landscape and square inputs.
      for (const [a, b] of [[1600, 900], [900, 1600], [1024, 1024]]) {
        const evaluate = (id, values) => {
          const js = graph[id].inputs.expression.replaceAll('floor(', 'Math.floor(').replaceAll('min(', 'Math.min(').replaceAll('max(', 'Math.max(')
          return Function(...Object.keys(values), `return (${js})`)(...Object.values(values))
        }
        const w = evaluate('19', { a, b })
        const h = evaluate('20', { a, b })
        assert.equal(w + 2 * evaluate('22', { a: w }), vars.width)
        assert.equal(h + 2 * evaluate('23', { a: h }), vars.height)
        assert(w <= vars.width && h <= vars.height)
        assert(Math.abs(w / h - a / b) < 0.04)
      }
      return [{ url: '/reframed.png', kind: 'image' }]
    },
  })
}
for (const name of ['qwen2511_photodump', 'qwen2511_reframe']) {
  const graph = graphFor(name)
  assert.deepEqual(checkFilled(graph), [])
  for (const node of Object.values(graph)) {
    assert(core[node.class_type], `${name}: core nodes only`)
    for (const field of Object.keys(LOADERS[node.class_type] || {})) {
      const file = node.inputs[field]
      if (file) assert(MODEL_FILES[file]?.cloud, `${name}: ${file} must be declared on Cloud`)
    }
  }
}
const single = dropOptional(graphFor('qwen2511_photodump'), { image: reference.url })
assert(!single['10'] && !single['11'])
assert(!single['14'].inputs.image2 && !single['14'].inputs.image3)
assert.deepEqual(checkGraph(single), [])
await assert.rejects(runFormat(photodumpFormat('nap', 4), {}, { run: async () => [] }), /Still needed/)
assert.throws(() => photodumpFormat('missing', 4), /valid photo set/)
assert.throws(() => photodumpFormat('nap', 99), /valid photo set/)
console.log('Photodump and Reframe checks passed: scene fan-out, references, ratios, quality, graph variables, center composition and Cloud files. No provider calls.')
