import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fill, comfyVars, dropOptional } from '../shared/mapping.js'
import { cloudWorkflows, h3Sizes } from '../src/lib/catalog.js'
import { podNeedsOf, notOnCloud, MODEL_FILES } from '../shared/modelFiles.js'
import { schemas } from '../src/lib/formats/schemas.js'
import { checkGraph } from './graph-check.mjs'

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

// Instant workflow variant contracts (independent of format inventory checks).
const nodeSchema = JSON.parse(readFileSync('scripts/fixtures/comfy-nodes.json', 'utf8')).nodes
const graphOf = (name) => JSON.parse(readFileSync(`public/workflows/${name}.json`, 'utf8'))
const evidence = JSON.parse(readFileSync('research_notes/instant-ports/public-evidence.json', 'utf8'))
for (const file of evidence.huggingFace) {
  const name = file.path.split('/').at(-1)
  assert.equal(MODEL_FILES[name].sha256, file.sha256, `${name}: public file hash changed`)
  assert.equal(MODEL_FILES[name].cloud, true)
}
const affected = (graph) => Object.values(graph).some((n) => ['flux3-image-klein-bf16.safetensors', 'qwen_image_2.1_turbo_bf16.safetensors'].includes(n.inputs.unet_name))
for (const file of readdirSync('public/workflows').filter((f) => f.endsWith('.json'))) {
  if (affected(graphOf(file.slice(0, -5)))) assert(cloudWorkflows[file.slice(0, -5)], `${file}: no Cloud alternate`)
}
for (const [original, cloud] of Object.entries(cloudWorkflows)) {
  const graph = graphOf(cloud)
  assert(affected(graphOf(original)), `${original}: unexpected alternate`)
  assert(!affected(graph), `${cloud}: still loads a Pod-only image model`)
  for (const node of Object.values(graph)) {
    assert(nodeSchema[node.class_type], `${cloud}: requires a custom node ${node.class_type}`)
    assert(!['TextGenerate', 'TextEncodeQwenImage21', 'ReferenceMultiLatent'].includes(node.class_type), `${cloud}: retains a newer model contract`)
  }
  assert.deepEqual(checkGraph(graph), [], cloud)
  for (const node of Object.values(graph).filter((n) => n.class_type === 'SamplerCustomAdvanced')) {
    const guider = graph[node.inputs.guider[0]]
    let model = graph[guider.inputs.model[0]]
    while (model.inputs.model) model = graph[model.inputs.model[0]]
    const file = model.inputs.unet_name
    const klein = file === 'flux-2-klein-4b-fp8.safetensors'
    const edit = file === 'qwen_image_edit_2511_int8_convrot.safetensors'
    const t2i = file === 'qwen_image_2512_fp8_e4m3fn.safetensors'
    if (!klein && !edit && !t2i) continue
    const schedule = graph[node.inputs.sigmas[0]]
    assert.equal(schedule.class_type, klein ? 'Flux2Scheduler' : 'BasicScheduler')
    assert.equal(schedule.inputs.steps, t2i ? 50 : 4)
    assert.equal(guider.inputs.cfg, t2i ? 4 : 1)
    assert.equal(graph[node.inputs.sampler[0]].inputs.sampler_name, 'euler')
  }
  const optional = schemas.comfyOptional[cloud] || []
  // Exercise every subset, including a later reference supplied without earlier optional ones.
  for (let bits = 0; bits < 2 ** optional.length; bits++) {
    const vars = Object.fromEntries(schemas.comfy[cloud].map((key) => [key, key.startsWith('image') || key === 'video' ? 'example.png' : key === 'pad' ? 'square' : key === 'prompt' || key === 'motion' || key === 'background' ? 'A fox' : key === 'width' || key === 'height' ? 1024 : key === 'frames' ? 121 : key === 'solid' ? false : key === 'fill' ? 0 : 1]))
    optional.forEach((key, i) => { if (!(bits & (1 << i))) delete vars[key] })
    const filled = fill(dropOptional(graph, vars), vars)
    assert(!JSON.stringify(filled).includes('{{'), `${cloud}: unresolved placeholder`)
    assert.deepEqual(checkGraph(filled), [], `${cloud}: optional subset ${bits}`)
  }
  const missing = notOnCloud(podNeedsOf(graph)).map((f) => f.name)
  if (['flux_trellis2', 'trellis2_character'].includes(original)) {
    assert.deepEqual(missing.sort(), ['dino_v3_vit_l.safetensors', 'trellis_2_int8_convrot.safetensors', 'trellis_2_shape_vae_bf16.safetensors', 'trellis_2_texture_vae_bf16.safetensors'])
  } else assert.deepEqual(missing, [], `${cloud}: remaining Cloud blockers`)
}
console.log(`${Object.keys(cloudWorkflows).length} Cloud alternates: core node contracts, links, placeholders and optional references valid; two Trellis graphs retain other Pod-only files. No live runs.`)
// End Instant workflow variant contracts.
