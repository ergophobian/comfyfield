import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { photodumpFormat, reframeFormat, reframeRatios, reframeIssue } from '../src/lib/formats/photodumpReframe.js'
import { photodumpSets, setSizes, photoRatios, qualities } from '../src/components/studio/presets.js'
import { compileFormat, runFormat } from '../src/lib/formats/runner.js'
import { validateFormat } from '../src/lib/formats/validate.js'
import { comfyVars, fill, dropOptional } from '../shared/mapping.js'
import { tools } from '../src/lib/tools.js'
import { formats, allFormats } from '../src/lib/formats/index.js'
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
      assert.deepEqual(graph['25'].inputs.feathering, ['24', 1])
      assert.equal(graph['21'].inputs.crop, 'disabled')
      // Exercise the exact sizing expressions for portrait, landscape and square inputs.
      for (const [a, b] of [[1600, 900], [900, 1600], [1024, 1024], [4000, 1000], [1000, 4000], [10000, 100], [100, 10000], [997, 613]]) {
        const evaluate = (id, values) => {
          const js = graph[id].inputs.expression.replaceAll('floor(', 'Math.floor(').replaceAll('min(', 'Math.min(').replaceAll('max(', 'Math.max(')
          return Function(...Object.keys(values), `return (${js})`)(...Object.values(values))
        }
        const w = evaluate('19', { a, b })
        const h = evaluate('20', { a, b })
        assert.equal(w + evaluate('22', { a: w }) + evaluate('28', { a: w }), vars.width)
        assert.equal(h + evaluate('23', { a: h }) + evaluate('29', { a: h }), vars.height)
        assert(w <= vars.width && h <= vars.height)
        const scale = Math.min(vars.width / a, vars.height / b)
        assert(Math.abs(w - a * scale) <= 0.5, 'Fit rounds to a pixel, not an eight-pixel grid')
        assert(Math.abs(h - b * scale) <= 0.5)
        if (a / b >= 0.25 && a / b <= 4) assert(Math.abs((w / h) / (a / b) - 1) < 0.005, 'Supported centers preserve proportions')
        const feather = evaluate('24', { a: w, b: h })
        assert.equal(feather, Math.min(32, Math.floor((Math.min(w, h) - 1) / 2)))
        assert(feather > 0 && 2 * feather < Math.min(w, h), 'Core padding must keep feathering enabled even on thin centers')
        // The pinned ImagePadForOutpaint squares (feather - distance) / feather.
        const alpha = (d) => 1 - Math.max(0, (feather - d) / feather) ** 2
        assert.equal(alpha(0), 0)
        assert(alpha(feather / 2) > 0 && alpha(feather / 2) < 1)
        assert.equal(alpha(feather), 1)
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
const photodump = graphFor('qwen2511_photodump')
assert(!Object.values(photodump).some((node) => node.class_type === 'FluxKontextImageScale'))
for (const id of ['12', '14']) {
  assert.deepEqual(photodump[id].inputs.image1, ['7', 0], 'Qwen receives the entire identity reference, including wide photos')
  assert.deepEqual(photodump[id].inputs.image2, ['10', 0])
  assert.deepEqual(photodump[id].inputs.image3, ['11', 0])
}
for (const ratio of reframeRatios) {
  const [w, h] = ratio.split(':').map(Number)
  assert.match(reframeIssue(`${w * 100}:${h * 100}`, ratio), /already matches/)
}
for (const ratio of ['10000:100', '100:10000', '401:100', '100:401']) assert.match(reframeIssue(ratio, '9:16'), /between 1:4 and 4:1/)
for (const ratio of ['400:100', '100:400', '1600:900']) assert.equal(reframeIssue(ratio, '9:16'), null)
for (const ratio of [null, '0:100', 'NaN:100', 'Infinity:100']) assert.match(reframeIssue(ratio, '9:16'), /dimensions/)
for (const id of ['photodump', 'reframe-image']) {
  assert(allFormats.some((f) => f.id === id), `${id} remains in the catalog`)
  assert(formats.some((f) => f.id === id), `${id} is runnable in the gallery`)
}
const reframeTool = tools.find((tool) => tool.id === 'reframe')
assert.equal(reframeTool.menu, 'image')
assert.match(reframeTool.blurb, /image.*Video is not wired yet/)
const single = dropOptional(graphFor('qwen2511_photodump'), { image: reference.url })
assert(!single['10'] && !single['11'])
assert(!single['14'].inputs.image2 && !single['14'].inputs.image3)
assert.deepEqual(checkGraph(single), [])
await assert.rejects(runFormat(photodumpFormat('nap', 4), {}, { run: async () => [] }), /Still needed/)
assert.throws(() => photodumpFormat('missing', 4), /valid photo set/)
assert.throws(() => photodumpFormat('nap', 99), /valid photo set/)
console.log('Photodump and Reframe checks passed: scene fan-out, references, ratios, quality, graph variables, center composition, uncropped identity, no-op and extreme-ratio guards, adaptive feathering, runnable ids, image navigation and Cloud files. No provider calls.')
