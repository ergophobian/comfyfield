// 3D checks: the TRELLIS.2 graphs' print pass, and the Library's .glb reader, open edge count and STL
// writer, on small models built here. No ComfyUI and no network.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseGlb, openEdges, toStl } from '../src/lib/glb.js'

// The print pass: core FillHoles between DecimateMesh and the UV unwrap, so filled holes get UVs and
// texture, and the remesher drops its inner shell only when the format asks for a solid print.
for (const w of ['trellis2_image', 'flux_trellis2', 'trellis2_character']) {
  const g = JSON.parse(readFileSync(`public/workflows/${w}.json`, 'utf8'))
  const id = (cls) => Object.keys(g).filter((k) => g[k].class_type === cls)
  const [fill] = id('FillHoles')
  assert(fill, `${w} has a FillHoles pass`)
  assert.equal(g[fill].inputs.max_perimeter, '{{fill}}', `${w}: the format sets the hole size, 0 turns it off`)
  assert.equal(g[g[fill].inputs.mesh[0]].class_type, 'DecimateMesh', `${w} fills holes after decimating`)
  const [smooth] = id('MeshSmoothNormals').filter((k) => g[k].inputs.mesh[0] === fill)
  assert(smooth, `${w} smooths the filled mesh`)
  const [unwrap] = id('UnwrapMesh')
  assert.equal(g[unwrap].inputs.mesh[0], smooth, `${w} unwraps the filled mesh, so new faces get texture`)
  const [remesh] = id('RemeshMesh')
  assert.equal(g[remesh].inputs['sign_mode.drop_inverted_components'], '{{solid}}', `${w}: a print drops the inner shell`)
}
assert(!readFileSync('public/workflows/trellis2_turntable.json', 'utf8').includes('FillHoles'), 'the turntable renders, it does not print')

// A .glb the way SaveGLB writes one: positions, uint32 indices, UVs, an embedded PNG, one node.
function glb({ positions, indices, uvs, png, translation, extensionsRequired }) {
  const parts = [new Float32Array(positions), new Uint32Array(indices), new Float32Array(uvs), png]
  const views = []
  let offset = 0
  for (const p of parts) {
    views.push({ buffer: 0, byteOffset: offset, byteLength: p.byteLength })
    offset += Math.ceil(p.byteLength / 4) * 4
  }
  const bin = new Uint8Array(offset)
  parts.forEach((p, i) => bin.set(new Uint8Array(p.buffer, p.byteOffset, p.byteLength), views[i].byteOffset))
  const json = {
    asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, ...(translation ? { translation } : {}) }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, TEXCOORD_0: 2 }, indices: 1, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 } } }], textures: [{ source: 0 }], images: [{ bufferView: 3, mimeType: 'image/png' }],
    buffers: [{ byteLength: offset }], bufferViews: views,
    accessors: [
      { bufferView: 0, componentType: 5126, count: positions.length / 3, type: 'VEC3' },
      { bufferView: 1, componentType: 5125, count: indices.length, type: 'SCALAR' },
      { bufferView: 2, componentType: 5126, count: uvs.length / 2, type: 'VEC2' },
    ],
    ...(extensionsRequired ? { extensionsRequired } : {}),
  }
  let text = new TextEncoder().encode(JSON.stringify(json))
  const padded = new Uint8Array(Math.ceil(text.length / 4) * 4).fill(0x20)
  padded.set(text)
  text = padded
  const out = new Uint8Array(12 + 8 + text.length + 8 + bin.length)
  const v = new DataView(out.buffer)
  v.setUint32(0, 0x46546c67, true); v.setUint32(4, 2, true); v.setUint32(8, out.length, true)
  v.setUint32(12, text.length, true); v.setUint32(16, 0x4e4f534a, true); out.set(text, 20)
  const at = 20 + text.length
  v.setUint32(at, bin.length, true); v.setUint32(at + 4, 0x004e4942, true); out.set(bin, at + 8)
  return out.buffer
}

// A 2 by 1 by 1 box with its own 4 corners per face, as a UV unwrap splits them at every seam.
const corners = [[-1, -0.5, -0.5], [1, -0.5, -0.5], [1, 0.5, -0.5], [-1, 0.5, -0.5], [-1, -0.5, 0.5], [1, -0.5, 0.5], [1, 0.5, 0.5], [-1, 0.5, 0.5]]
const quads = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]]
function box(skip = 0) {
  const positions = []
  const indices = []
  const uvs = []
  quads.slice(skip).forEach((q) => {
    const base = positions.length / 3
    for (const c of q) positions.push(...corners[c])
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1)
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  })
  return { positions, indices, uvs }
}
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])

const closed = parseGlb(glb({ ...box(), png, translation: [0, 2, 0] }))
assert.equal(closed.faces, 12)
assert.deepEqual([closed.min, closed.max], [[-1, 1.5, -0.5], [1, 2.5, 0.5]], 'node transforms move the mesh')
assert.deepEqual([...closed.parts[0].image.bytes], [...png], 'the base color picture comes out whole')
assert.equal(closed.parts[0].uvs.length, 48)
assert.equal(openEdges(closed), 0, 'a closed box has no open edges, even split at UV seams')
assert.equal(openEdges(parseGlb(glb({ ...box(1), png }))), 4, 'a box with one face missing has a 4 edge hole')

const stl = toStl(closed)
const view = new DataView(stl)
assert.equal(stl.byteLength, 84 + 12 * 50)
assert.equal(view.getUint32(80, true), 12)
const zs = []
const xs = []
for (let t = 0; t < 12; t++) {
  for (let c = 0; c < 3; c++) {
    xs.push(view.getFloat32(84 + t * 50 + 12 + c * 12, true))
    zs.push(view.getFloat32(84 + t * 50 + 20 + c * 12, true))
  }
}
assert.deepEqual([Math.min(...xs), Math.max(...xs)], [-50, 50], 'the longest side is 100 mm')
assert.deepEqual([Math.min(...zs), Math.max(...zs)], [0, 50], 'Y up becomes Z up, resting on the bed')
const n = [0, 1, 2].map((i) => view.getFloat32(84 + i * 4, true))
assert(Math.abs(Math.hypot(...n) - 1) < 1e-6, 'each facet has a unit normal')

assert.throws(() => parseGlb(new ArrayBuffer(24)), /not a \.glb/)
assert.throws(() => parseGlb(glb({ ...box(), png, extensionsRequired: ['KHR_draco_mesh_compression'] })), /compressed meshes/)
console.log('Mesh checks ok: the print pass in 3 TRELLIS.2 graphs, .glb reading, open edges and STL. No ComfyUI.')
