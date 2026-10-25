// What a flow may contain and how nodes may connect. Shared by the canvas, the server store and the
// MCP tools, so a rule only lives here and every error says how to fix the flow.
import { models } from '../src/lib/catalog.js'
import { widgetTypes } from './widgetInputs.js'

export const nodeLabels = { prompt: 'Prompt', image: 'Image', writer: 'Writer', mask: 'Mask painter', face: 'Face picker', video: 'Video input', crop: 'Crop and reframe', model: 'Model', stitch: 'Stitch', blender: 'Blender', threejs: 'Three.js', approve: 'Approve', output: 'Output', note: 'Note' }
export const nodeTypes = Object.keys(nodeLabels)

// Each node has at most one input handle and one output handle; these lists say which exist.
export const sourceTypes = nodeTypes.filter((t) => !['output', 'note'].includes(t))
export const targetTypes = nodeTypes.filter((t) => !['prompt', 'image', 'note', 'blender', 'threejs', ...widgetTypes].includes(t))
const promptTargets = ['model', 'writer']

// Starter scripts render Blender's default cube with Cycles on the CPU, which needs no GPU on a render host.
// Each reads its output path after --output and saves exactly there.
const blenderSetup = `import bpy, sys
out = sys.argv[sys.argv.index("--output") + 1]
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 32
scene.render.resolution_x, scene.render.resolution_y = 1280, 720
scene.render.filepath = out
`
export const blenderScript = `${blenderSetup}scene.render.image_settings.file_format = "PNG"
bpy.ops.render.render(write_still=True)
`
export const blenderVideoScript = `${blenderSetup}scene.frame_start, scene.frame_end = 1, 48
cube = bpy.data.objects.get("Cube")
if cube:
    cube.rotation_euler = (0, 0, 0)
    cube.keyframe_insert("rotation_euler", frame=1)
    cube.rotation_euler = (0, 0, 3.1416)
    cube.keyframe_insert("rotation_euler", frame=48)
scene.render.image_settings.file_format = "FFMPEG"
scene.render.ffmpeg.format = "MPEG4"
scene.render.ffmpeg.codec = "H264"
bpy.ops.render.render(animation=True)
`

// Three.js nodes: an ES module renders in headless Chrome, one frame per tick of a fixed clock.
// Limits keep a render inside the time limit on a CPU (Chrome draws WebGL with SwiftShader).
export const threeLimits = { seconds: 30, fps: 60, frames: 900, minSize: 64, maxSize: 1920 }
export const threeScript = `import * as THREE from 'three'

// Called once. Return the scene and camera; update(time, frame) runs before each frame is drawn.
// time is in seconds and comes from a fixed clock, so every render of this code is the same.
export default function ({ renderer, width, height }) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b1020)
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 1.2, 4)
  camera.lookAt(0, 0, 0)
  const cube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.MeshStandardMaterial({ color: 0x6d7cff, roughness: 0.35 }))
  scene.add(cube, new THREE.HemisphereLight(0xffffff, 0x223344, 1.5))
  const sun = new THREE.DirectionalLight(0xffffff, 2)
  sun.position.set(3, 4, 2)
  scene.add(sun)
  return {
    scene,
    camera,
    update(time) {
      cube.rotation.set(time * 0.6, time * 1.2, 0)
    },
  }
}
`

const find = (id, kind) => models.find((m) => m.id === id) || models.find((m) => m.kind === kind)

// data: what the caller sets, so a Blender node made for video starts with the video script.
export function nodeDefaults(type, data = {}) {
  if (type === 'prompt') return { mode: 'single', text: '' }
  if (widgetTypes.includes(type)) return { value: null }
  if (type === 'image') return { url: null, name: '' }
  if (type === 'writer') return { instructions: 'Write one vivid generation prompt from the reference images and user note. Preserve visible details. Return only the finished prompt.', note: '', target: 'image' }
  if (type === 'model') return { kind: 'image', model: find(null, 'image'), aspect: '1:1', duration: 5, takes: 1, prompt: '' }
  if (type === 'note') return { text: '' }
  if (type === 'stitch') return { clips: [], aspect: '16:9' }
  if (type === 'threejs') return { script: threeScript, duration: 5, width: 1280, height: 720, fps: 30 }
  if (type === 'blender') return { script: data.output === 'video' ? blenderVideoScript : blenderScript, output: 'image' }
  return {}
}

const list = (items) => items.join(', ')
const label = (node) => `${nodeLabels[node.type] || node.type} node "${node.id}"`

export function unknownType(type) {
  return nodeTypes.includes(type) ? null : `Unknown node type "${type}". Use one of: ${list(nodeTypes)}.`
}

export function missingNode(flow, id) {
  if (flow.nodes.some((n) => n.id === id)) return null
  const ids = flow.nodes.map((n) => n.id)
  return `Flow "${flow.name}" has no node "${id}". ${ids.length ? `Its node ids are: ${list(ids)}.` : 'It has no nodes yet; add one with add_node.'}`
}

const reaches = (flow, from, to) => {
  const seen = new Set()
  const walk = (id) => id === to || flow.edges.some((e) => e.source === id && !seen.has(e.target) && (seen.add(e.target), walk(e.target)))
  return walk(from)
}

// Returns null when source -> target is allowed, else a sentence that says what to do instead.
export function connectionProblem(flow, source, target) {
  const missing = missingNode(flow, source) || missingNode(flow, target)
  if (missing) return missing
  const s = flow.nodes.find((n) => n.id === source)
  const t = flow.nodes.find((n) => n.id === target)
  if (s === t) return `A node cannot connect to itself. Pick a different target for ${label(s)}.`
  if (!sourceTypes.includes(s.type)) return `${label(s)} has no output. Connect from one of: ${list(sourceTypes)}.`
  if (!targetTypes.includes(t.type)) return `${label(t)} has no input. Connect into one of: ${list(targetTypes)}.`
  if (s.type === 'prompt' && !promptTargets.includes(t.type)) return `A Prompt node can only feed a Model or Writer node, not ${label(t)}. Put a Model or Writer between them.`
  if (flow.edges.some((e) => e.source === source && e.target === target)) return `${label(s)} already connects to ${label(t)}.`
  if (reaches(flow, target, source)) return `Connecting ${label(s)} to ${label(t)} would make a loop, because "${target}" already feeds "${source}". Remove a connection or reverse this one.`
  return null
}
