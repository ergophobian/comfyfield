// Reads a binary glTF (.glb) the way ComfyUI's SaveGLB writes it: float positions, an index buffer, UVs,
// vertex colors and an embedded base color image. Plain JS with no DOM, so the checks run it in Node.
// It also writes the model as binary STL for a slicer and counts its open edges.

const SIZES = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }
const READERS = {
  5120: [1, (v, o) => v.getInt8(o), 127], 5121: [1, (v, o) => v.getUint8(o), 255],
  5122: [2, (v, o) => v.getInt16(o, true), 32767], 5123: [2, (v, o) => v.getUint16(o, true), 65535],
  5125: [4, (v, o) => v.getUint32(o, true), 0], 5126: [4, (v, o) => v.getFloat32(o, true), 0],
}

function chunks(buffer) {
  const view = new DataView(buffer)
  if (buffer.byteLength < 20 || view.getUint32(0, true) !== 0x46546c67) throw new Error('This file is not a .glb model.')
  let json = null
  let bin = null
  for (let at = 12; at + 8 <= buffer.byteLength;) {
    const length = view.getUint32(at, true)
    const type = view.getUint32(at + 4, true)
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, at + 8, length)))
    if (type === 0x004e4942) bin = new Uint8Array(buffer, at + 8, length)
    at += 8 + length
  }
  if (!json) throw new Error('This .glb has no scene.')
  return { json, bin }
}

// An accessor as a flat Float32Array (or Uint32Array for indices), with byte strides and normalized ints undone.
function read(gltf, bin, index, ints = false) {
  const a = gltf.accessors[index]
  const size = SIZES[a.type]
  const out = ints ? new Uint32Array(a.count * size) : new Float32Array(a.count * size)
  if (a.bufferView == null) return out
  const bv = gltf.bufferViews[a.bufferView]
  const [bytes, get, max] = READERS[a.componentType]
  const view = new DataView(bin.buffer, bin.byteOffset + (bv.byteOffset || 0) + (a.byteOffset || 0))
  const stride = bv.byteStride || bytes * size
  const scale = a.normalized && max ? 1 / max : 1
  for (let i = 0; i < a.count; i++) {
    for (let c = 0; c < size; c++) out[i * size + c] = get(view, i * stride + c * bytes) * scale
  }
  return out
}

const multiply = (a, b) => {
  const o = new Array(16)
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]
  return o
}
function local(node) {
  if (node.matrix) return node.matrix
  const [x, y, z, w] = node.rotation || [0, 0, 0, 1]
  const [sx, sy, sz] = node.scale || [1, 1, 1]
  const [tx, ty, tz] = node.translation || [0, 0, 0]
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ]
}
function transform(points, m, w) {
  for (let i = 0; i < points.length; i += 3) {
    const [x, y, z] = [points[i], points[i + 1], points[i + 2]]
    points[i] = m[0] * x + m[4] * y + m[8] * z + w * m[12]
    points[i + 1] = m[1] * x + m[5] * y + m[9] * z + w * m[13]
    points[i + 2] = m[2] * x + m[6] * y + m[10] * z + w * m[14]
  }
}

// { parts: [{ positions, normals?, uvs?, colors?, colorSize, indices, color, image? }], min, max, faces }.
// Positions are in scene space; `image` is the embedded base color picture as { bytes, mime }.
export function parseGlb(buffer) {
  const { json: gltf, bin } = chunks(buffer)
  const compressed = (gltf.extensionsRequired || []).find((e) => /draco|meshopt/i.test(e))
  if (compressed) throw new Error('This .glb uses compressed meshes, which the preview cannot read. Download it instead.')
  const parts = []
  const visit = (id, parent) => {
    const node = gltf.nodes[id]
    const m = multiply(parent, local(node))
    for (const p of node.mesh != null ? gltf.meshes[node.mesh].primitives : []) {
      if ((p.mode ?? 4) !== 4 || p.attributes.POSITION == null) continue
      const positions = read(gltf, bin, p.attributes.POSITION)
      transform(positions, m, 1)
      const normals = p.attributes.NORMAL != null ? read(gltf, bin, p.attributes.NORMAL) : null
      if (normals) transform(normals, m, 0)
      const count = positions.length / 3
      const indices = p.indices != null ? read(gltf, bin, p.indices, true) : Uint32Array.from({ length: count }, (_, i) => i)
      const material = gltf.materials?.[p.material]?.pbrMetallicRoughness || {}
      const texture = material.baseColorTexture && gltf.textures?.[material.baseColorTexture.index]
      const picture = texture && gltf.images?.[texture.source]
      const view = picture?.bufferView != null && gltf.bufferViews[picture.bufferView]
      parts.push({
        positions, normals, indices,
        uvs: p.attributes.TEXCOORD_0 != null ? read(gltf, bin, p.attributes.TEXCOORD_0) : null,
        colors: p.attributes.COLOR_0 != null ? read(gltf, bin, p.attributes.COLOR_0) : null,
        colorSize: p.attributes.COLOR_0 != null ? SIZES[gltf.accessors[p.attributes.COLOR_0].type] : 0,
        color: material.baseColorFactor || [1, 1, 1, 1],
        image: view ? { bytes: bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength), mime: picture.mimeType || 'image/png' } : null,
      })
    }
    for (const child of node.children || []) visit(child, m)
  }
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  const scene = gltf.scenes?.[gltf.scene ?? 0]
  for (const id of scene?.nodes || gltf.nodes?.map((_, i) => i) || []) visit(id, identity)
  if (!parts.length) throw new Error('This .glb has no mesh.')
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const { positions } of parts) {
    for (let i = 0; i < positions.length; i++) {
      min[i % 3] = Math.min(min[i % 3], positions[i])
      max[i % 3] = Math.max(max[i % 3], positions[i])
    }
  }
  return { parts, min, max, faces: parts.reduce((n, p) => n + p.indices.length / 3, 0) }
}

// Edges that do not join exactly two faces, after welding the copies a UV seam makes. Zero means the
// surface is closed, which a slicer needs to tell inside from outside.
export function openEdges(model) {
  const size = Math.max(...model.max.map((v, i) => v - model.min[i])) || 1
  const step = size * 1e-5
  const ids = new Map()
  const weld = (p, i) => {
    const key = `${Math.round(p[i] / step)},${Math.round(p[i + 1] / step)},${Math.round(p[i + 2] / step)}`
    let id = ids.get(key)
    if (id == null) ids.set(key, (id = ids.size))
    return id
  }
  const edges = new Map()
  for (const { positions, indices } of model.parts) {
    const welded = new Uint32Array(positions.length / 3)
    for (let v = 0; v < welded.length; v++) welded[v] = weld(positions, v * 3)
    for (let t = 0; t < indices.length; t += 3) {
      const tri = [welded[indices[t]], welded[indices[t + 1]], welded[indices[t + 2]]]
      if (tri[0] === tri[1] || tri[1] === tri[2] || tri[0] === tri[2]) continue
      for (let e = 0; e < 3; e++) {
        const a = tri[e]
        const b = tri[(e + 1) % 3]
        const key = a < b ? a * 2 ** 26 + b : b * 2 ** 26 + a
        edges.set(key, (edges.get(key) || 0) + 1)
      }
    }
  }
  let open = 0
  for (const n of edges.values()) if (n !== 2) open++
  return open
}

// Binary STL, Z up, scaled so the longest side is `longest` millimeters (slicers read STL units as mm).
export function toStl(model, longest = 100) {
  const size = Math.max(...model.max.map((v, i) => v - model.min[i])) || 1
  const k = longest / size
  const center = model.min.map((v, i) => (v + model.max[i]) / 2)
  const out = new ArrayBuffer(84 + model.faces * 50)
  const view = new DataView(out)
  new TextEncoder().encodeInto('ComfyField STL', new Uint8Array(out, 0, 80))
  view.setUint32(80, model.faces, true)
  let at = 84
  // glTF is Y up and a print bed is Z up: (x, y, z) becomes (x, -z, y), resting on the bed.
  const point = (p, i) => [(p[i] - center[0]) * k, -(p[i + 2] - center[2]) * k, (p[i + 1] - model.min[1]) * k]
  for (const { positions, indices } of model.parts) {
    for (let t = 0; t < indices.length; t += 3) {
      const [a, b, c] = [0, 1, 2].map((j) => point(positions, indices[t + j] * 3))
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
      const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
      const len = Math.hypot(...n) || 1
      for (const x of [...n.map((x) => x / len), ...a, ...b, ...c]) { view.setFloat32(at, x, true); at += 4 }
      at += 2
    }
  }
  return out
}
