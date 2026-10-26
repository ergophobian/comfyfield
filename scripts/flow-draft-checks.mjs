// Flow drafts: the LLM's JSON is checked against shared/flowRules.js, the call uses the Google key
// first and the Comfy key second, and Accept and Discard handle the ghost nodes. No network, no keys.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { mock } from 'node:test'

// Isolate configuration so checks never read saved keys or provider environment variables.
if (!process.argv.includes('--isolated')) {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--isolated'], {
    stdio: 'inherit', env: { SystemRoot: process.env.SystemRoot || '', PATH: process.env.PATH || '' },
  })
  process.exit(result.status ?? 1)
}

let keys = {}
const originalRead = fs.readFileSync
mock.method(fs, 'readFileSync', (file, ...args) => (String(file).endsWith('keys.json') ? JSON.stringify(keys) : originalRead(file, ...args)))

const { parseDraft, draftInstructions } = await import('../shared/flowDraft.js')
const { connectionProblem, nodeTypes } = await import('../shared/flowRules.js')
const { draftFlow } = await import('../server/core.js')
const { placeDraft, acceptDraft } = await import('../src/lib/flowDraft.js')

const good = {
  name: 'Product shots then video',
  nodes: [
    { id: 'p', type: 'prompt', data: { mode: 'rows', text: 'A red sneaker on wet asphalt\nThe same sneaker on a white plinth' } },
    { id: 'i', type: 'model', data: { model: 'comfy-flux', aspect: '4:5', takes: 9 } },
    { id: 'a', type: 'approve', data: {} },
    { id: 'v', type: 'model', data: { model: 'comfy-ltx', duration: 6, prompt: 'Slow orbit' } },
    { id: 'o', type: 'output', data: {} },
    { id: 'n', type: 'note', data: { text: 'Pick the sharpest take.' } },
  ],
  edges: [{ source: 'p', target: 'i' }, { source: 'i', target: 'a' }, { source: 'a', target: 'v' }, { source: 'v', target: 'o' }],
}

// A valid draft keeps every node and connection, with catalog model records and clamped settings.
const d = parseDraft(`\`\`\`json\n${JSON.stringify(good)}\n\`\`\``)
assert.equal(d.name, 'Product shots then video')
assert.deepEqual(d.nodes.map((n) => n.type), ['prompt', 'model', 'approve', 'model', 'output', 'note'])
assert.equal(d.edges.length, 4)
assert.deepEqual(d.dropped, [])
const [, image, , video] = d.nodes
assert.equal(image.data.model.id, 'comfy-flux')
assert.equal(image.data.kind, 'image')
assert.equal(image.data.aspect, '4:5')
assert.equal(image.data.takes, 4, 'takes are clamped to 4')
assert.equal(video.data.kind, 'video')
assert.equal(video.data.duration, 5, 'duration snaps to the nearest the model supports')
assert.equal(video.data.aspect, '16:9', 'a video model does not keep the square default')
assert.equal(d.nodes[0].data.mode, 'rows')
// Layout: columns follow the connections, the note sits above.
assert.deepEqual(d.nodes.map((n) => n.position.x), [0, 360, 720, 1080, 1440, 0])
assert.ok(d.nodes[5].position.y < 0)
// The kept flow passes the shared rules edge by edge.
const rebuilt = { name: 'x', nodes: d.nodes, edges: [] }
for (const e of d.edges) { assert.equal(connectionProblem(rebuilt, e.source, e.target), null); rebuilt.edges.push(e) }

// Invalid nodes and edges are dropped with the reason from the shared rules.
const bad = parseDraft(JSON.stringify({
  name: 'Bad',
  nodes: [
    { id: 'p', type: 'prompt', data: { text: 'x' } }, { id: 'o', type: 'output' }, { id: 'm', type: 'model', data: { model: 'gpt-9000' } },
    { id: 'z', type: 'teleporter' }, { id: 'f', type: 'face' }, { id: 'p', type: 'prompt' }, { id: 'n', type: 'note' },
  ],
  edges: [
    { source: 'p', target: 'o' }, { source: 'o', target: 'm' }, { source: 'm', target: 'm' }, { source: 'p', target: 'm' },
    { source: 'm', target: 'o' }, { source: 'p', target: 'm' }, { source: 'm', target: 'ghost' }, { source: 'n', target: 'm' }, { source: 'm', target: 'n' },
  ],
}))
assert.deepEqual(bad.nodes.map((n) => n.type), ['prompt', 'output', 'model', 'note'])
assert.deepEqual(bad.edges.map((e) => `${e.source}>${e.target}`), ['prompt-d0>model-d2', 'model-d2>output-d1'])
const why = bad.dropped.join('\n')
assert.match(why, /Node "m": no model "gpt-9000", so it uses /)
assert.match(why, /Node "z": Unknown node type "teleporter"/)
assert.match(why, /Node "f": Drafts cannot add Face picker nodes yet/)
assert.match(why, /Node "p" is listed twice/)
assert.match(why, /Connection p to o: A Prompt node can only feed a Model or Writer node/)
assert.match(why, /Connection o to m: Output node "output-d1" has no output/)
assert.match(why, /Connection m to m: A node cannot connect to itself/)
assert.match(why, /Connection p to m: .* already connects to/)
assert.match(why, /Connection m to ghost: it names a node the draft does not have/)
assert.match(why, /Connection n to m: Note node .* has no output/)
assert.match(why, /Connection m to n: Note node .* has no input/)
assert.equal(bad.dropped.length, 11)

// Loops are refused.
const loop = parseDraft(JSON.stringify({ nodes: [{ id: 'a', type: 'model' }, { id: 'b', type: 'approve' }], edges: [{ source: 'a', target: 'b' }, { source: 'b', target: 'a' }] }))
assert.equal(loop.edges.length, 1)
assert.match(loop.dropped.join('\n'), /would make a loop/)
assert.equal(loop.name, 'Drafted flow')

// Text that is not flow JSON fails with a clear message.
assert.throws(() => parseDraft('Sure! Here is your flow.'), (e) => e.status === 502 && /other than flow JSON/.test(e.message))
assert.throws(() => parseDraft('{"name":"x"}'), /no nodes/)

// The system prompt names every draftable node type and real model ids.
const instructions = draftInstructions()
for (const t of ['prompt', 'writer', 'model', 'approve', 'output', 'note']) assert.ok(nodeTypes.includes(t) && instructions.includes(`- ${t}:`), t)
assert.match(instructions, /comfy-flux \(image\)/)

// draftFlow sends the description to the writer as a note and returns the checked draft.
let seen
const fromWriter = await draftFlow({ description: '  Sneaker shots, then a video  ' }, { write: async (req) => { seen = req; return JSON.stringify(good) } })
assert.equal(seen.note, 'Sneaker shots, then a video')
assert.equal(seen.promptOnly, false)
assert.equal(seen.instructions, instructions)
assert.equal(fromWriter.nodes.length, 6)
assert.ok(fromWriter.nodes.every((n) => /^[a-z]+-[0-9a-f]{8}$/.test(n.id)), 'server ids are unique per draft')
await assert.rejects(draftFlow({ description: ' ' }), (e) => e.status === 400)

// With no keys, it asks for a Google or Comfy key and calls nothing.
const calls = []
globalThis.fetch = async (url, init) => {
  calls.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) })
  if (String(url).includes('generativelanguage')) return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(good) }] } }] }))
  return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(good) }] }] }))
}
await assert.rejects(draftFlow({ description: 'x' }), (e) => e.status === 400 && /Google or Comfy key/.test(e.message))
assert.equal(calls.length, 0)

// The Google key goes to Gemini with the draft instructions as the system prompt.
keys = { google: { key: 'mock-google' }, comfy: { key: 'mock-comfy' } }
assert.equal((await draftFlow({ description: 'Sneaker shots' })).nodes.length, 6)
assert.match(calls[0].url, /generativelanguage\.googleapis\.com/)
assert.equal(calls[0].headers['x-goog-api-key'], 'mock-google')
assert.equal(calls[0].body.systemInstruction.parts[0].text, instructions)
assert.match(calls[0].body.contents[0].parts.at(-1).text, /User note: Sneaker shots/)

// With only a Comfy key, the Comfy Router writer gets the same request.
keys = { comfy: { key: 'mock-comfy' } }
assert.equal((await draftFlow({ description: 'Sneaker shots' })).edges.length, 4)
assert.match(calls[1].url, /api\.comfy\.org\/v2\/models\//)
assert.equal(calls[1].headers['X-API-Key'], 'mock-comfy')
assert.equal(calls[1].body.instructions, instructions)
assert.equal(calls.length, 2)

// Ghost placement: right of the existing nodes, not selectable, ids that do not clash.
const flow = { id: 'f', name: 'Untitled flow', nodes: [{ id: 'model-d1', type: 'model', position: { x: 100, y: 50 }, data: {} }], edges: [] }
const raw = parseDraft(JSON.stringify(good))
const ghost = placeDraft(flow, raw)
assert.ok(ghost.nodes.every((n) => n.className === 'ghost' && n.selectable === false && n.draggable === false && n.connectable === false))
assert.ok(ghost.nodes.every((n) => n.position.x >= 100 + 320))
assert.notEqual(ghost.nodes[1].id, 'model-d1', 'a clashing id is renamed')
assert.equal(ghost.edges[0].target, ghost.nodes[1].id, 'edges follow renamed ids')
assert.ok(ghost.edges.every((e) => e.id.startsWith('ghost:')))

// Accept adds plain nodes and edges; the flow keeps its own name unless it was an empty untitled flow.
const accepted = acceptDraft(flow, ghost)
assert.equal(accepted.nodes.length, 7)
assert.ok(accepted.nodes.every((n) => !('className' in n) && !('selectable' in n)))
assert.ok(accepted.edges.every((e) => !e.id.startsWith('ghost:') && !('className' in e)))
assert.equal(accepted.name, 'Untitled flow')
assert.equal(acceptDraft({ ...flow, nodes: [] }, placeDraft({ ...flow, nodes: [] }, raw)).name, 'Product shots then video')
assert.equal(acceptDraft(flow, null), flow, 'Discard leaves the flow as it was')

console.log('Flow draft checks passed: flow rules, dropped reasons, Google and Comfy keys, ghost placement, accept and discard')
