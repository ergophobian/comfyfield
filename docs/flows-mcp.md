# Flows through MCP

Agents build and run flows with the same rules as the Flows page. The app, the dev server's Assistant and a standalone `npx comfyfield mcp` all read and write one file.

## Storage

- Flows live in `.comfyfield/flows.json` under `COMFYFIELD_HOME` (default: the working directory). The file holds `revision`, `flows`, `current` and `runs` (run state per flow: outputs and gate status).
- Every write bumps `revision`. A save with an old revision is refused with "Flows changed elsewhere. Reload flows before editing again." so two writers cannot silently overwrite each other.
- Node media is a URL (for example `/media/...` from the Library or an upload), not inline file data. Flows made before uploads went through `/api/upload` can still hold data URLs until the image is uploaded again.
- `server/flows.js` owns storage, validation and runs. `shared/flowRules.js` holds the node types, defaults and connection rule, so the canvas and MCP refuse the same things for the same reason.

## Moving flows out of the browser

Flows used to live in this browser's `localStorage` (`comfyfield.flows`, `comfyfield.flowrun.<id>`). The first time the Flows page loads, it adds every non-empty browser flow the server does not have yet, with its finished results, then sets `comfyfield.flows.migrated`. A server flow with the same id always wins. The browser copy is not deleted, so it stays as a fallback.

## How the app sees agent changes

- Changes made by the Assistant (inside the dev server) reach the page at once through the `/api/agents/events` stream.
- A standalone MCP server is a separate process, so the page reloads flows when its tab gets focus again. Switch back to ComfyField to see what the agent built.
- If you edit while an agent writes, your save gets the revision conflict above. Use Reload flows.

Live sync of other people's edits is issue #22.

## Tools

| Tool | Input | What it does |
| --- | --- | --- |
| `list_flows` | none | Flow ids, names, node counts |
| `get_flow` | `flow_id` | Nodes, connections and run state |
| `create_flow` | `name`, optional `nodes`, `edges` | Makes a flow. Nodes may set their own `id` so edges can refer to them |
| `add_node` | `flow_id`, `type`, optional `id`, `position`, `data` | Adds a node with the canvas defaults. For a model node set `data.model` to a model id from `list_models` |
| `connect_nodes` | `flow_id`, `source`, `target` | Connects source's output to target's input |
| `update_node` | `flow_id`, `node_id`, optional `data`, `position` | Merges `data` into the node |
| `remove_node` | `flow_id`, `node_id` | Removes the node, its connections and its results |
| `run_flow` | `flow_id` | Run: fills gaps, spends credits, stops at gates. Blender and Three.js nodes render locally, at no cost |

Node types: `prompt`, `image`, `writer`, `mask`, `face`, `video`, `crop`, `model`, `stitch`, `blender`, `threejs`, `approve`, `output`, `note`. Each node has at most one input and one output:

- No output: `output`, `note`.
- No input: `prompt`, `image`, `note`, `mask`, `face`, `video`, `crop`, `blender`, `threejs`.
- A `prompt` only feeds a `model` or `writer`.
- No loops, no self connections, no duplicate connections.

Errors say what to fix, for example `Flow "Kites" has no node "q". Its node ids are: p, img.` or `Connecting Model node "vid" to Model node "img" would make a loop, because "img" already feeds "vid".`

## Blender nodes

A `blender` node holds `data.script` (Blender Python) and `data.output` (`image` or `video`). Run calls `blender -b --python-exit-code 1 -P script.py -- --output <file>`. The script must save its render to that file: a PNG for an image, an MP4 for a video (set `scene.render.image_settings.file_format = 'FFMPEG'` and `scene.render.ffmpeg.format = 'MPEG4'`). The file goes to the Library and downstream, so a video feeds Stitch and an image feeds a Model node as its start image.

Connections sets where Blender runs: a Blender path on this machine, or an SSH host (`user@host` or `user@host:port`). With a host, ComfyField copies the script with `scp`, runs Blender there with `ssh` and copies the render back; the path then means Blender on that host, and key login must work without a password (`BatchMode=yes`). Errors say which part failed: Blender not on PATH, the path is wrong, the host cannot be reached, or the script raised an error. Renders stop after 20 minutes.

Blender scripts run with your user's rights on that machine; only run scripts you trust. In the Assistant, `run_flow` lists each Blender render in the plan and runs only the renders the user approved.

## Three.js nodes

A `threejs` node renders a Three.js scene to an H.264 MP4 (yuv420p) on this machine, at no cost. It holds `data.script`, `data.duration` (seconds, up to 30), `data.width` and `data.height` (even pixels, 64 to 1920) and `data.fps` (1 to 60). A video has at most 900 frames.

The script is an ES module. `three` and `three/addons/...` resolve to the installed three package (0.186). Its default export is called once and returns the scene:

```js
import * as THREE from 'three'

export default function ({ THREE, renderer, canvas, width, height, fps, duration, frames }) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.z = 4
  const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshNormalMaterial())
  scene.add(cube)
  return { scene, camera, update(time, frame) { cube.rotation.y = time * 2 } }
}
```

For each frame, ComfyField sets the clock to `frame / fps` seconds, runs pending `requestAnimationFrame` callbacks, calls `update(time, frame)` (it may be async), draws `scene` with `camera` and captures the canvas. Draw with the `renderer` you are given; to draw yourself, return only `update` and call `renderer.render` in it. `performance.now()`, `Date.now()` and `requestAnimationFrame` follow the frame clock, not the wall clock, and `Math.random` is seeded, so the same code gives the same video. `setTimeout` still uses real time; do not use it for animation.

The scene runs only in a headless Chrome page (found like the UI checks find it; `CHROME_PATH` overrides), never in Node. The page can load only itself and the three files: every other request fails, there is no DNS, and WebSocket, WebRTC and workers are off. WebGL runs on the CPU (SwiftShader), so no GPU is needed. A render stops after 10 minutes. ffmpeg (the bundled `ffmpeg-static`) encodes the frames. The MP4 goes to the Library and downstream: it is a Stitch clip, and the video input of a Model node (like a Video input node, the first clip only).

## run_flow and the Flows rules

`run_flow` is the Run button. It runs only nodes without output, never re-runs a node that has output, and stops at every Approve gate and every Writer waiting for review. It returns `ran`, `outputs`, `failed`, `blocked`, `waiting_for_send` and `next`. When a gate waits, `next` tells the agent that the user must pick takes and press Send in Flows; no tool can Send. In the Assistant, `run_flow` also waits for the user to approve the cost plan.

Example: build and run a two-step flow.

```json
{ "name": "Kite to video",
  "nodes": [
    { "id": "p", "type": "prompt", "data": { "text": "A red kite over dunes at sunset" } },
    { "id": "img", "type": "model", "data": { "model": "comfy-flux", "takes": 2 } },
    { "id": "gate", "type": "approve" },
    { "id": "vid", "type": "model", "data": { "model": "comfy-ltx-i2v", "prompt": "Slow push in" } }
  ],
  "edges": [ { "source": "p", "target": "img" }, { "source": "img", "target": "gate" }, { "source": "gate", "target": "vid" } ] }
```

Checks: `node scripts/flow-mcp-checks.mjs` (mocked generation, no keys, no spend).
