import { useEffect, useRef, useState } from 'react'
import { parseGlb, openEdges, toStl } from '../lib/glb.js'
import { IconCube } from './Icons.jsx'

// A .glb preview on WebGL 2 with no 3D library. Cards show a still drawn once by one shared renderer,
// since a browser allows only a few WebGL contexts; the viewer spins the model and lets you drag it.

// A TRELLIS.2 model is tens of megabytes, so only the last few stay parsed.
const parsed = new Map()
export function loadModel(url) {
  if (!parsed.has(url)) {
    const p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`Could not load the model (${r.status}).`)
      return r.arrayBuffer()
    }).then(parseGlb)
    p.catch(() => parsed.delete(url))
    parsed.set(url, p)
    while (parsed.size > 3) parsed.delete(parsed.keys().next().value)
  }
  return parsed.get(url)
}

export async function saveStl(url, name) {
  const blob = new Blob([toStl(await loadModel(url))], { type: 'model/stl' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${name}.stl`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

const VS = `#version 300 es
in vec3 p; in vec3 n; in vec2 uv; in vec4 col;
uniform mat4 mvp; uniform mat3 nm;
out vec3 vn; out vec2 vuv; out vec4 vcol;
void main() { gl_Position = mvp * vec4(p, 1.0); vn = nm * n; vuv = uv; vcol = col; }`
// Base color times a soft headlight. COLOR_0 is linear in glTF, so it goes back to sRGB for the screen.
const FS = `#version 300 es
precision highp float;
in vec3 vn; in vec2 vuv; in vec4 vcol;
uniform sampler2D tex; uniform vec4 base;
out vec4 o;
void main() {
  vec4 c = texture(tex, vuv) * vec4(pow(vcol.rgb, vec3(1.0 / 2.2)), vcol.a) * base;
  float d = max(dot(normalize(vn), normalize(vec3(0.35, 0.55, 1.0))), 0.0);
  o = vec4(c.rgb * (0.6 + 0.45 * d), 1.0);
}`

// Column-major 4x4 helpers.
const mul = (a, b) => {
  const o = new Float32Array(16)
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]
  return o
}
const rotY = (t) => [Math.cos(t), 0, -Math.sin(t), 0, 0, 1, 0, 0, Math.sin(t), 0, Math.cos(t), 0, 0, 0, 0, 1]
const rotX = (t) => [1, 0, 0, 0, 0, Math.cos(t), Math.sin(t), 0, 0, -Math.sin(t), Math.cos(t), 0, 0, 0, 0, 1]
const move = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]
const FOV = 0.6
const perspective = (aspect, near, far) => {
  const f = 1 / Math.tan(FOV / 2)
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0]
}

// Vertex normals from the faces, for a mesh saved without them.
function faceNormals({ positions, indices }) {
  const n = new Float32Array(positions.length)
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t] * 3, indices[t + 1] * 3, indices[t + 2] * 3]
    const u = [0, 1, 2].map((i) => positions[b + i] - positions[a + i])
    const v = [0, 1, 2].map((i) => positions[c + i] - positions[a + i])
    const x = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
    for (const k of [a, b, c]) for (let i = 0; i < 3; i++) n[k + i] += x[i]
  }
  return n
}

function renderer(canvas, opts = {}) {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, ...opts })
  if (!gl) throw new Error('This browser cannot show 3D previews.')
  const shader = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS))
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS))
  gl.linkProgram(prog)
  const loc = Object.fromEntries(['p', 'n', 'uv', 'col'].map((k) => [k, gl.getAttribLocation(prog, k)]))
  const uni = Object.fromEntries(['mvp', 'nm', 'tex', 'base'].map((k) => [k, gl.getUniformLocation(prog, k)]))
  const white = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, white)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]))
  let parts = []
  let fit = null

  const unload = () => {
    for (const p of parts) {
      gl.deleteVertexArray(p.vao)
      p.buffers.forEach((b) => gl.deleteBuffer(b))
      if (p.texture !== white) gl.deleteTexture(p.texture)
    }
    parts = []
  }
  async function load(model) {
    unload()
    const center = model.min.map((v, i) => (v + model.max[i]) / 2)
    const radius = Math.hypot(...model.max.map((v, i) => v - model.min[i])) / 2 || 1
    fit = { center, radius }
    for (const part of model.parts) {
      const vao = gl.createVertexArray()
      gl.bindVertexArray(vao)
      const buffers = []
      const attr = (name, data, size) => {
        if (loc[name] < 0) return
        if (!data) return gl.disableVertexAttribArray(loc[name])
        const b = gl.createBuffer()
        buffers.push(b)
        gl.bindBuffer(gl.ARRAY_BUFFER, b)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
        gl.enableVertexAttribArray(loc[name])
        gl.vertexAttribPointer(loc[name], size, gl.FLOAT, false, 0, 0)
      }
      attr('p', part.positions, 3)
      attr('n', part.normals || faceNormals(part), 3)
      attr('uv', part.uvs, 2)
      attr('col', part.colors, part.colorSize)
      const ib = gl.createBuffer()
      buffers.push(ib)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, part.indices, gl.STATIC_DRAW)
      gl.bindVertexArray(null)
      let texture = white
      if (part.image && part.uvs) {
        const bitmap = await createImageBitmap(new Blob([part.image.bytes], { type: part.image.mime }))
        texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap)
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        bitmap.close?.()
      }
      parts.push({ vao, buffers, texture, count: part.indices.length, color: part.color, uvs: Boolean(part.uvs), colors: Boolean(part.colors) })
    }
  }
  function draw(yaw, pitch, zoom = 1) {
    const w = canvas.width
    const h = canvas.height
    gl.viewport(0, 0, w, h)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    if (!fit) return
    gl.enable(gl.DEPTH_TEST)
    gl.useProgram(prog)
    const dist = (fit.radius / Math.sin(FOV / 2)) * 1.02 * zoom
    const model = mul(rotX(pitch), mul(rotY(yaw), move(-fit.center[0], -fit.center[1], -fit.center[2])))
    const mvp = mul(perspective(w / h, dist / 20, dist * 4), mul(move(0, 0, -dist), model))
    gl.uniformMatrix4fv(uni.mvp, false, mvp)
    gl.uniformMatrix3fv(uni.nm, false, [model[0], model[1], model[2], model[4], model[5], model[6], model[8], model[9], model[10]])
    gl.uniform1i(uni.tex, 0)
    gl.activeTexture(gl.TEXTURE0)
    for (const p of parts) {
      gl.bindVertexArray(p.vao)
      if (!p.uvs && loc.uv >= 0) gl.vertexAttrib2f(loc.uv, 0, 0)
      if (!p.colors && loc.col >= 0) gl.vertexAttrib4f(loc.col, 1, 1, 1, 1)
      gl.bindTexture(gl.TEXTURE_2D, p.texture)
      gl.uniform4fv(uni.base, p.color)
      gl.drawElements(gl.TRIANGLES, p.count, gl.UNSIGNED_INT, 0)
    }
    gl.bindVertexArray(null)
  }
  return { load, draw, unload }
}

// Stills for the cards, one at a time on one hidden canvas.
const posters = new Map()
let shared = null
let line = Promise.resolve()
function poster(url) {
  if (!posters.has(url)) {
    const job = line.then(async () => {
      if (!shared) {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 512
        shared = { canvas, r: renderer(canvas, { preserveDrawingBuffer: true }) }
      }
      await shared.r.load(await loadModel(url))
      shared.r.draw(-0.6, 0.3)
      const still = shared.canvas.toDataURL('image/webp', 0.85)
      shared.r.unload()
      return still
    })
    line = job.catch(() => {})
    job.catch(() => posters.delete(url))
    posters.set(url, job)
  }
  return posters.get(url)
}

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// `full` spins the model and lets you drag and zoom it; `onInfo` gets its face count and open edges.
export default function ModelView({ url, alt, full, onInfo }) {
  const canvas = useRef(null)
  const [still, setStill] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    if (full) return
    let live = true
    setState('loading')
    poster(url).then((s) => { if (live) { setStill(s); setState('ready') } }, () => live && setState('failed'))
    return () => { live = false }
  }, [url, full])

  useEffect(() => {
    if (!full) return
    const el = canvas.current
    let r
    try { r = renderer(el) } catch { setState('failed'); return }
    let live = true
    let frame = 0
    const view = { yaw: -0.6, pitch: 0.3, zoom: 1, spin: !calm(), drag: null }
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const [w, h] = [Math.round(el.clientWidth * dpr), Math.round(el.clientHeight * dpr)]
      if (el.width !== w || el.height !== h) [el.width, el.height] = [w, h]
    }
    const tick = () => {
      if (!live) return
      size()
      if (view.spin && !view.drag) view.yaw += 0.006
      r.draw(view.yaw, view.pitch, view.zoom)
      frame = requestAnimationFrame(tick)
    }
    const down = (e) => { view.drag = [e.clientX, e.clientY]; view.spin = false; el.setPointerCapture(e.pointerId) }
    const drag = (e) => {
      if (!view.drag) return
      view.yaw += (e.clientX - view.drag[0]) * 0.01
      view.pitch = Math.max(-1.4, Math.min(1.4, view.pitch + (e.clientY - view.drag[1]) * 0.01))
      view.drag = [e.clientX, e.clientY]
    }
    const up = () => { view.drag = null }
    const wheel = (e) => { e.preventDefault(); view.zoom = Math.max(0.4, Math.min(3, view.zoom * (e.deltaY > 0 ? 1.1 : 0.9))) }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', drag)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    setState('loading')
    loadModel(url).then(async (model) => {
      if (!live) return
      await r.load(model)
      if (!live) return
      setState('ready')
      size()
      tick()
      // Welding and counting edges takes a moment on a big mesh, so it runs after the first frame.
      if (onInfo) setTimeout(() => live && onInfo({ faces: model.faces, open: openEdges(model) }), 50)
    }).catch(() => live && setState('failed'))
    return () => {
      live = false
      cancelAnimationFrame(frame)
      r.unload()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', drag)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [url, full])

  return (
    <div className={`model-view${full ? ' full' : ''} ${state}`}>
      {full ? <canvas ref={canvas} role="img" aria-label={alt ? `3D model: ${alt}` : '3D model'} title="Drag to turn, scroll to zoom" />
        : still && <img src={still} alt={alt ? `3D model: ${alt}` : '3D model'} />}
      {state !== 'ready' && (
        <span className="model-note"><IconCube />{state === 'failed' ? '3D model, no preview' : 'Loading 3D model'}</span>
      )}
      {!full && state === 'ready' && <span className="model-badge"><IconCube />3D</span>}
    </div>
  )
}
