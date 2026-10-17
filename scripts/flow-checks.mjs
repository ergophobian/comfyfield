import assert from 'node:assert/strict'
import { createEngine, topoOrder, csvPrompts } from '../src/lib/flowEngine.js'

const img = { kind: 'image', provider: 'x', name: 'Img' }
const vid = { kind: 'video', provider: 'x', name: 'Vid' }
const n = (id, type, data = {}) => ({ id, type, position: { x: 0, y: 0 }, data })
const e = (source, target) => ({ id: `${source}-${target}`, source, target })

function mock({ failOnce = new Set() } = {}) {
  const calls = []
  let wait = 0
  const run = async (model, opts) => {
    calls.push({ model: model.name, ...opts })
    await new Promise((r) => setTimeout(r, 5))
    const tag = `${model.name}:${opts.prompt}:${calls.length}`
    if (failOnce.has(opts.prompt)) { failOnce.delete(opts.prompt); throw new Error('boom') }
    return [{ url: `mock://${tag}`, kind: model.kind }]
  }
  return { run, calls, count: (name) => calls.filter((c) => c.model === name).length }
}

const chain = () => ({
  nodes: [
    n('p', 'prompt', { mode: 'rows', text: 'one\ntwo\nthree' }),
    n('i', 'model', { model: img, takes: 2, aspect: '1:1' }),
    n('a', 'approve'),
    n('v', 'model', { model: vid, takes: 1, aspect: '16:9', duration: 5, prompt: 'push in' }),
    n('o', 'output'),
  ],
  edges: [e('p', 'i'), e('i', 'a'), e('a', 'v'), e('v', 'o')],
})

const checks = []
const check = (name, fn) => checks.push([name, fn])

check('topological order and loop detection', async () => {
  const f = chain()
  const o = topoOrder(f)
  assert.ok(o.indexOf('p') < o.indexOf('i') && o.indexOf('i') < o.indexOf('a') && o.indexOf('a') < o.indexOf('v'))
  assert.throws(() => topoOrder({ nodes: [n('x', 'model'), n('y', 'model')], edges: [e('x', 'y'), e('y', 'x')] }), /loop/)
})

check('csv first column, header skipped, quotes kept intact', async () => {
  assert.deepEqual(csvPrompts('prompt,notes\n"a, b",x\nc,y'), ['a, b', 'c'])
})

check('rows x takes fan out, rule 1: run stops at the approval gate', async () => {
  const m = mock(); const eng = createEngine({ run: m.run }); const f = chain()
  await eng.runNew(f)
  assert.equal(m.count('Img'), 6)
  assert.deepEqual(new Set(m.calls.map((c) => c.prompt)), new Set(['one', 'two', 'three']))
  assert.equal(m.count('Vid'), 0, 'video must not run before Send')
  assert.equal(eng.gate('a').status, 'reviewing')
  assert.equal(eng.itemsOf(f, 'a'), null, 'closed gate outputs nothing')
  await eng.runNew(f)
  assert.equal(m.count('Vid'), 0, 'a second Run still cannot pass the gate')
  assert.equal(m.count('Img'), 6, 'second Run fills no gaps')
})

check('approve only marks, empty never goes straight to sent', async () => {
  const m = mock(); const eng = createEngine({ run: m.run }); const f = chain()
  assert.equal((await eng.send(f, 'a')).ok, false)
  assert.equal(eng.gate('a').status, 'empty')
  await eng.runNew(f)
  const first = eng.reviewItems(f, 'a').filter((i) => i.row === 0)
  eng.togglePick(f, 'a', first[0].id)
  eng.togglePick(f, 'a', first[1].id)
  assert.deepEqual(eng.gate('a').picked, [first[1].id], 'single pick per row')
  assert.equal(m.count('Vid'), 0)
  assert.equal(eng.gate('a').status, 'reviewing')
})

check('rules 2 and 3: send runs only downstream, never upstream, passes the image', async () => {
  const m = mock(); const eng = createEngine({ run: m.run }); const f = chain()
  await eng.runNew(f)
  for (const r of [0, 1, 2]) eng.togglePick(f, 'a', eng.reviewItems(f, 'a').find((i) => i.row === r).id)
  const imgCalls = m.count('Img')
  const res = await eng.send(f, 'a')
  assert.equal(res.ok, true)
  assert.equal(m.count('Img'), imgCalls, 'upstream model untouched by Send')
  assert.equal(m.count('Vid'), 3)
  assert.ok(m.calls.filter((c) => c.model === 'Vid').every((c) => c.image?.startsWith('mock://Img')), 'opts.image set')
  assert.equal(eng.gate('a').status, 'sent')
  assert.equal((await eng.send(f, 'a')).ok, false, 'send is disabled once sent')
  await eng.runNew(f)
  assert.equal(m.count('Vid'), 3, 'models with output are not re-run by Run')
})

check('send with no picks sends everything; frozen output', async () => {
  const m = mock(); const eng = createEngine({ run: m.run }); const f = chain()
  await eng.runNew(f)
  await eng.send(f, 'a')
  assert.equal(m.count('Vid'), 6)
})

check('rule 4: gates do not cascade (second gate holds the next model)', async () => {
  const m = mock(); const eng = createEngine({ run: m.run })
  const f = chain()
  f.nodes.push(n('a2', 'approve'), n('v2', 'model', { model: vid, takes: 1, prompt: 'x' }))
  f.edges.push(e('v', 'a2'), e('a2', 'v2'))
  await eng.runNew(f)
  await eng.send(f, 'a')
  assert.equal(eng.gate('a2').status, 'reviewing')
  assert.equal(m.calls.filter((c) => c.prompt === 'x').length, 0, 'v2 waits for the second Send')
  await eng.send(f, 'a2')
  assert.equal(m.calls.filter((c) => c.prompt === 'x').length > 0, true)
})

check('fan-out from one gate: nodes with output are skipped', async () => {
  const m = mock(); const eng = createEngine({ run: m.run })
  const f = chain()
  f.nodes.push(n('v3', 'model', { model: { ...vid, name: 'Vid2' }, takes: 1, prompt: 'y' }))
  f.edges.push(e('a', 'v3'))
  await eng.runNew(f)
  await eng.send(f, 'a')
  const before = m.count('Vid2')
  eng.clearGate(f, 'a')
  await eng.runNew(f)
  await eng.send(f, 'a')
  assert.equal(m.count('Vid2'), before, 'existing output is never re-run by Send')
})

check('rule 5: Run fills gaps only, failures retried, kept outputs untouched', async () => {
  const m = mock({ failOnce: new Set(['two']) }); const eng = createEngine({ run: m.run })
  const f = { nodes: [n('p', 'prompt', { mode: 'rows', text: 'one\ntwo\nthree' }), n('v', 'model', { model: vid, takes: 1 })], edges: [e('p', 'v')] }
  await eng.runNew(f)
  assert.equal(m.count('Vid'), 3)
  assert.equal(eng.state.v.items.filter((i) => i.status === 'failed').length, 1)
  await eng.runNew(f)
  assert.equal(m.count('Vid'), 4, 'only the failed row ran again')
  assert.equal(eng.state.v.items.every((i) => i.status === 'done'), true)
  f.nodes[0].data.text = 'one\ntwo\nthree\nfour'
  await eng.runNew(f)
  assert.equal(m.count('Vid'), 5, 'new row fills in')
})

check('rule 5: Regenerate all wipes and re-runs everything, gates reset', async () => {
  const m = mock(); const eng = createEngine({ run: m.run }); const f = chain()
  await eng.runNew(f)
  await eng.send(f, 'a')
  const total = m.calls.length
  const res = await eng.regenerateAll(f)
  assert.equal(m.count('Img'), 12)
  assert.equal(eng.gate('a').status, 'reviewing')
  assert.equal(m.count('Vid'), 6, 'video waits again after the wipe')
  assert.equal(eng.state.v.items.length, 0)
  assert.ok(total > 0 && res.ran === 6)
})

check('rule 6: Rerun re-runs one node, no cascade, blocked behind an unsent gate', async () => {
  const m = mock(); const eng = createEngine({ run: m.run }); const f = chain()
  await eng.runNew(f)
  assert.equal((await eng.rerun(f, 'v')).ok, false, 'video blocked while gate is closed')
  await eng.send(f, 'a')
  const vids = m.count('Vid'); const imgs = m.count('Img')
  await eng.rerun(f, 'v')
  assert.equal(m.count('Vid'), vids + 6)
  assert.equal(m.count('Img'), imgs, 'upstream not re-run')
  await eng.rerun(f, 'i')
  assert.equal(m.count('Img'), imgs + 6)
  assert.equal(m.count('Vid'), vids + 6, 'rerun does not cascade downstream')
  assert.equal(eng.gate('a').status, 'reviewing', 'gate reset after upstream rerun')
})

check('gate rerun regenerates feeder and returns to empty/reviewing', async () => {
  const m = mock(); const eng = createEngine({ run: m.run }); const f = chain()
  await eng.runNew(f)
  await eng.rerunGate(f, 'a')
  assert.equal(m.count('Img'), 12)
  assert.equal(m.count('Vid'), 0)
})

check('stop halts: output stays null and nothing runs', async () => {
  const m = mock(); const eng = createEngine({ run: m.run }); const f = chain()
  await eng.runNew(f)
  eng.stop(f, 'a')
  assert.equal(eng.gate('a').status, 'stopped')
  assert.equal(eng.itemsOf(f, 'a'), null)
  await eng.runNew(f)
  assert.equal(m.count('Vid'), 0)
})

check('concurrency never exceeds 3', async () => {
  const m = mock(); const eng = createEngine({ run: m.run, concurrency: 3 }); const f = chain()
  await eng.runNew(f)
  assert.ok(eng.peak <= 3 && eng.peak > 1, `peak ${eng.peak}`)
})

check('fan-in waits for every input', async () => {
  const m = mock(); const eng = createEngine({ run: m.run })
  const f = {
    nodes: [n('p', 'prompt', { mode: 'single', text: 'hi' }), n('i1', 'model', { model: img, takes: 1 }), n('a1', 'approve'),
      n('i2', 'model', { model: img, takes: 1 }), n('a2', 'approve'), n('v', 'model', { model: vid, takes: 1 })],
    edges: [e('p', 'i1'), e('p', 'i2'), e('i1', 'a1'), e('i2', 'a2'), e('a1', 'v'), e('a2', 'v')],
  }
  await eng.runNew(f)
  await eng.send(f, 'a1')
  assert.equal(m.count('Vid'), 0, 'one gate sent, the other still closed')
  await eng.send(f, 'a2')
  assert.equal(m.count('Vid'), 2)
})

const writerFlow = () => ({
  nodes: [n('p', 'prompt', { text: 'Keep the red coat' }), n('i', 'image', { url: 'mock://reference' }),
    n('w', 'writer', { instructions: 'Describe the images', note: 'At dusk', target: 'video' }),
    n('v', 'model', { model: vid, takes: 1 })],
  edges: [e('p', 'w'), e('i', 'w'), e('w', 'v')],
})

check('writer gathers images and note, waits for review, sends edited text without rewriting', async () => {
  const m = mock()
  const writes = []
  const eng = createEngine({ run: m.run, writePrompt: async (input) => { writes.push(input); return 'A red coat at dusk' } })
  const f = writerFlow()
  assert.equal((await eng.sendWriter(f, 'w')).ok, false)
  await eng.runNew(f)
  assert.deepEqual(writes, [{ instructions: 'Describe the images', note: 'At dusk\n\nKeep the red coat', images: ['mock://reference'], target: 'video' }])
  assert.equal(eng.hasOutput(f), true)
  assert.equal(eng.state.w.items[0].text, 'A red coat at dusk')
  assert.equal(eng.itemsOf(f, 'w'), null)
  assert.equal(m.calls.length, 0)
  await eng.runNew(f)
  assert.equal(writes.length, 1)
  eng.editWriter(f, 'w', '')
  assert.equal((await eng.sendWriter(f, 'w')).ok, false)
  eng.editWriter(f, 'w', 'Edited prompt')
  assert.equal((await eng.sendWriter(f, 'w')).ok, true)
  assert.equal(m.calls[0].prompt, 'Edited prompt')
  assert.equal(writes.length, 1)
  assert.equal((await eng.sendWriter(f, 'w')).ok, false)
  eng.editWriter(f, 'w', 'Second edit')
  await eng.sendWriter(f, 'w')
  assert.equal(m.calls.length, 1, 'Send preserves existing model output')
  await eng.rerun(f, 'v')
  assert.equal(m.calls[1].prompt, 'Second edit')
})

check('writer works with approval gates, persistence, rerun and regenerate all', async () => {
  const m = mock()
  let writes = 0
  const opts = { run: m.run, writePrompt: async () => `Draft ${++writes}` }
  const eng = createEngine(opts)
  const f = writerFlow()
  f.nodes.push(n('a', 'approve'))
  f.edges = [e('p', 'w'), e('i', 'w'), e('w', 'a'), e('a', 'v')]
  await eng.runNew(f)
  await eng.sendWriter(f, 'w')
  assert.equal(eng.gate('a').status, 'reviewing')
  assert.equal(eng.reviewItems(f, 'a')[0].kind, 'text')
  assert.equal(m.calls.length, 0)
  eng.editWriter(f, 'w', 'Final draft')
  assert.equal(eng.gate('a').status, 'empty')
  await eng.sendWriter(f, 'w')
  const restored = createEngine(opts)
  restored.load(JSON.parse(JSON.stringify(eng.state)))
  await restored.send(f, 'a')
  assert.equal(m.calls[0].prompt, 'Final draft')
  assert.equal(writes, 1)
  await restored.rerunGate(f, 'a')
  assert.equal(writes, 2)
  assert.equal(restored.itemsOf(f, 'w'), null)
  assert.equal(restored.gate('a').status, 'empty')
  await restored.sendWriter(f, 'w')
  await restored.send(f, 'a')
  assert.equal(m.calls.length, 1)
  await restored.regenerateAll(f)
  assert.equal(writes, 3)
  assert.equal(restored.state.v.items.length, 0)
  assert.equal(restored.itemsOf(f, 'w'), null)
})

check('writer failures retry without rendering and respect upstream gates', async () => {
  const m = mock()
  let writes = 0
  const eng = createEngine({ run: m.run, writePrompt: async () => { if (++writes === 1) throw new Error('LLM unavailable'); return 'Recovered' } })
  const f = writerFlow()
  f.nodes.push(n('a', 'approve'))
  f.edges = [e('i', 'a'), e('a', 'w'), e('p', 'w'), e('w', 'v')]
  await eng.runNew(f)
  assert.equal(writes, 0)
  await eng.send(f, 'a')
  assert.equal(eng.state.w.items[0].error, 'LLM unavailable')
  assert.equal(m.calls.length, 0)
  await eng.runNew(f)
  assert.equal(writes, 2)
  assert.equal(m.calls.length, 0)
  await eng.sendWriter(f, 'w')
  assert.equal(m.calls[0].prompt, 'Recovered')
})

check('widget inputs hold until ready and pass structured values through approval gates', async () => {
  const values = {
    mask: { url: '/media/photo.png', maskUrl: '/media/mask.png' },
    face: { url: '/media/group.png', faceUrl: '/media/face.png', box: { x: 0.1, y: 0.1, width: 0.3, height: 0.3 } },
    video: { url: '/media/clip.mp4', duration: 4, trim: { start: 1, end: 3 }, posterUrl: '/media/poster.png', posterTime: 2 },
    crop: { url: '/media/photo.png', aspect: '9:16', box: { x: 0.2, y: 0, width: 0.4, height: 1 } },
  }
  for (const [type, value] of Object.entries(values)) {
    const m = mock()
    const eng = createEngine({ run: m.run })
    const f = { nodes: [n('w', type, { value: null }), n('a', 'approve'), n('m', 'model', { model: img, prompt: 'edit' })], edges: [e('w', 'a'), e('a', 'm')] }
    await eng.runNew(f)
    assert.equal(m.calls.length, 0)
    f.nodes[0].data.value = value
    await eng.runNew(f)
    assert.equal(m.calls.length, 0, 'approval still holds the widget')
    await eng.send(f, 'a')
    assert.deepEqual(m.calls[0].inputs.w, value)
    if (type === 'mask') assert.equal(m.calls[0].mask, value.maskUrl)
    if (type === 'face') assert.equal(m.calls[0].face.faceUrl, value.faceUrl)
    if (type === 'video') assert.deepEqual(m.calls[0].trim, value.trim)
    if (type === 'crop') assert.deepEqual(m.calls[0].crop, value.box)
    await eng.runNew(f)
    assert.equal(m.calls.length, 1, 'Run does not repeat the model')
  }
})

check('widget references supplement image rows instead of adding unwanted generations', async () => {
  const m = mock()
  const eng = createEngine({ run: m.run })
  const face = { url: '/media/face.png', characterId: 'actor' }
  const f = { nodes: [n('i', 'image', { url: '/media/source.png' }), n('f', 'face', { value: face }), n('m', 'model', { model: img })], edges: [e('i', 'm'), e('f', 'm')] }
  await eng.runNew(f)
  assert.equal(m.calls.length, 1)
  assert.equal(m.calls[0].image, '/media/source.png')
  assert.deepEqual(m.calls[0].face, face)
})

check('Stitch waits for Send, preserves clip order and trim options, and fills gaps only', async () => {
  const m = mock()
  const calls = []
  const eng = createEngine({ run: m.run, stitch: async (opts) => {
    calls.push(opts)
    return { url: 'mock://stitched', kind: 'video' }
  } })
  const f = {
    nodes: [n('p', 'prompt', { mode: 'rows', text: 'one\ntwo' }), n('v', 'model', { model: vid }), n('a', 'approve'), n('s', 'stitch', { aspect: '9:16' }), n('o', 'output')],
    edges: [e('p', 'v'), e('v', 'a'), e('a', 's'), e('s', 'o')],
  }
  await eng.runNew(f)
  assert.equal(calls.length, 0)
  assert.equal(eng.plan(f, 's').blocked, true)
  await eng.send(f, 'a')
  assert.equal(calls.length, 1)
  assert.equal(m.calls.length, 2, 'Send did not regenerate clips')
  assert.deepEqual(calls[0].clips.map((clip) => clip.url), eng.itemsOf(f, 'a').map((item) => item.url))
  assert.equal(eng.reviewItems(f, 'o')[0].url, 'mock://stitched')
  await eng.runNew(f)
  assert.equal(calls.length, 1)
  const clips = eng.itemsOf(f, 'a')
  f.nodes.find((node) => node.id === 's').data.clips = [
    { id: clips[1].id, upstream: true, start: 0.2, end: 1, caption: 'Second first' },
    { id: clips[0].id, upstream: true },
  ]
  await eng.rerun(f, 's')
  assert.equal(calls.length, 2)
  assert.equal(calls[1].clips[0].url, clips[1].url)
  assert.equal(calls[1].clips[0].caption, 'Second first')
  assert.equal(calls[1].clips[0].start, 0.2)
  assert.equal(m.calls.length, 2)
  await eng.regenerateAll(f)
  assert.equal(eng.state.s.items.length, 0)
  assert.equal(calls.length, 2, 'Regenerate resets Stitch and closes its upstream gate')
})

check('Stitch retries failures, waits for every input, and preserves outputs on Send', async () => {
  let count = 0
  const eng = createEngine({ stitch: async () => {
    count++
    if (count === 1) throw new Error('retry me')
    return { url: 'mock://joined', kind: 'video' }
  } })
  const f = { nodes: [n('s', 'stitch', { clips: [{ id: 'local', url: '/media/local.mp4' }] }), n('a', 'approve'), n('s2', 'stitch')], edges: [e('s', 'a'), e('a', 's2')] }
  await eng.runNew(f)
  assert.equal(eng.state.s.items[0].status, 'failed')
  await eng.runNew(f)
  assert.equal(count, 2)
  assert.equal(eng.plan(f, 's2').blocked, true)
  await eng.send(f, 'a')
  assert.equal(count, 3)
  eng.clearGate(f, 'a')
  await eng.send(f, 'a')
  assert.equal(count, 3)
  f.nodes.push(n('empty', 'approve'))
  f.edges.push(e('empty', 's2'))
  assert.equal((await eng.rerun(f, 's2')).ok, false)
  const partial = { nodes: [n('v', 'model', { model: vid }), n('s', 'stitch')], edges: [e('v', 's')] }
  eng.load({ v: { running: 1, items: [{ id: 'partial', url: 'mock://partial', kind: 'video', status: 'done' }] } })
  assert.equal(eng.plan(partial, 's').blocked, true, 'Wait until all clips in the upstream run finish')
})

let bad = 0
for (const [name, fn] of checks) {
  try { await fn(); console.log('ok   ', name) } catch (err) { bad++; console.log('FAIL ', name, '\n     ', err.message) }
}
console.log(bad ? `${bad} failed` : `all ${checks.length} passed`)
process.exit(bad ? 1 : 0)
