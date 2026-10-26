// Blender node: the runner, its errors, Connections, Library and Flows, with a fake Blender, ssh and scp.
// The fake writes real PNG and MP4 files with ffmpeg, so the render reaches Stitch like a real one would.
// A real Blender is used only when BLENDER_CHECK_PATH points at one.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { renderBlender, blenderOptions, blenderVersion } from '../server/blender.js'
import { findFfmpeg, ffmpeg } from '../server/stitch.js'
import { blenderScript } from '../shared/flowRules.js'

const deadline = setTimeout(() => { console.error('Blender checks exceeded 120 seconds.'); process.exit(1) }, 120_000)
deadline.unref()

const root = path.resolve('.comfyfield', 'blender-checks')
fs.mkdirSync(root, { recursive: true })
const dir = fs.mkdtempSync(path.join(root, 'run with spaces '))
process.env.COMFYFIELD_HOME = dir
const core = await import('../server/core.js')
const { createFlows } = await import('../server/flows.js')
const { createServer } = await import('../server/mcp.js')
const binary = await findFfmpeg()
const log = path.join(dir, 'calls.jsonl')
const remoteRoot = path.join(dir, 'remote')
fs.mkdirSync(remoteRoot)
const env = { ...process.env, FAKE_FFMPEG: binary, FAKE_LOG: log, FAKE_REMOTE: remoteRoot }
const calls = () => fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').map((l) => JSON.parse(l)) : []

// Fake blender: same command line as Blender. The script text picks the behaviour.
const fakeBlender = path.join(dir, 'fake-blender.mjs')
fs.writeFileSync(fakeBlender, `import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
const args = process.argv.slice(2)
fs.appendFileSync(process.env.FAKE_LOG, JSON.stringify({ tool: 'blender', args }) + '\\n')
if (args[0] === '--version') { console.log('Blender 4.5.0 (fake)'); process.exit(0) }
const script = fs.readFileSync(args[args.indexOf('-P') + 1], 'utf8')
const out = args[args.indexOf('--output') + 1]
if (script.includes('raise')) { console.error('Traceback (most recent call last):\\nRuntimeError: boom'); process.exit(1) }
if (script.includes('SLEEP')) await new Promise((r) => setTimeout(r, 5000))
if (script.includes('NOFILE')) process.exit(0)
const source = out.endsWith('.mp4') ? ['-f', 'lavfi', '-i', 'testsrc=s=320x180:r=24:d=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p'] : ['-f', 'lavfi', '-i', 'testsrc=s=320x180', '-frames:v', '1']
const r = spawnSync(process.env.FAKE_FFMPEG, ['-v', 'error', '-y', ...source, out])
process.exit(r.status)
`)
// Fake ssh runs the remote command against a local folder. Hosts named down@... refuse the connection.
const fakeSsh = path.join(dir, 'fake-ssh.mjs')
fs.writeFileSync(fakeSsh, `import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
const args = process.argv.slice(2)
fs.appendFileSync(process.env.FAKE_LOG, JSON.stringify({ tool: 'ssh', args }) + '\\n')
const command = args.at(-1)
const address = args.at(-2)
if (address.startsWith('down@')) { console.error('ssh: connect to host ' + address.slice(5) + ' port 22: Connection refused'); process.exit(255) }
const words = [...command.matchAll(/'((?:[^']|'\\\\'')*)'|(\\S+)/g)].map((m) => m[1] != null ? m[1].replace(/'\\\\''/g, "'") : m[2])
if (command === 'mktemp -d') { console.log(fs.mkdtempSync(path.join(process.env.FAKE_REMOTE, 'tmp.')).replace(/\\\\/g, '/').replace(/^[A-Za-z]:/, '/fake')); process.exit(0) }
const local = (p) => p.replace(/^\\/fake/, process.env.FAKE_REMOTE.slice(0, 2))
if (words[0] === 'rm') { fs.rmSync(local(words[2]), { recursive: true, force: true }); process.exit(0) }
if (words[0] === 'missing-blender') { console.error('bash: missing-blender: command not found'); process.exit(127) }
const r = spawnSync(process.execPath, [process.argv[1].replace('fake-ssh', 'fake-blender'), ...words.slice(1).map((w) => w.startsWith('/') ? local(w) : w)], { stdio: 'inherit', env: process.env })
process.exit(r.status)
`)
const fakeScp = path.join(dir, 'fake-scp.mjs')
fs.writeFileSync(fakeScp, `import fs from 'node:fs'
const args = process.argv.slice(2)
fs.appendFileSync(process.env.FAKE_LOG, JSON.stringify({ tool: 'scp', args, cwd: process.cwd() }) + '\\n')
const local = (p) => p.replace(/^[^:/]+@[^:]+:/, '').replace(/^\\/fake/, process.env.FAKE_REMOTE.slice(0, 2))
const [from, to] = args.slice(-2).map(local)
if (!fs.existsSync(from)) { console.error('scp: ' + from + ': No such file or directory'); process.exit(1) }
fs.copyFileSync(from, to)
`)
const node = process.execPath
const blender = [node, fakeBlender]
const ssh = [node, fakeSsh]
const scp = [node, fakeScp]
const keep = (from, output) => {
  const to = path.join(dir, `kept-${Date.now()}-${Math.random().toString(36).slice(2)}.${output === 'video' ? 'mp4' : 'png'}`)
  fs.copyFileSync(from, to)
  return to
}
const duration = async (file) => {
  const out = await ffmpeg(['-i', file], { binary, allowFailure: true })
  const m = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(out)
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null
}
const isPng = (file) => fs.readFileSync(file).subarray(1, 4).toString() === 'PNG'

const checks = []
const check = (name, fn) => checks.push([name, fn])

check('options need a script and an image or video output', () => {
  assert.throws(() => blenderOptions({ script: ' ' }), /Write a Blender Python script/)
  assert.throws(() => blenderOptions({ script: 'x', output: 'gif' }), /image or video/)
  assert.deepEqual(blenderOptions({ script: 'x' }), { script: 'x', output: 'image' })
})

check('a local render runs blender -b -P with the output path and returns a PNG', async () => {
  fs.rmSync(log, { force: true })
  const file = await renderBlender({ script: 'import bpy' }, { command: blender, env, keep })
  assert(isPng(file))
  const [call] = calls()
  assert.deepEqual(call.args.slice(0, 4), ['-b', '--python-exit-code', '1', '-P'])
  assert.equal(path.basename(call.args[4]), 'script.py')
  assert.deepEqual(call.args.slice(5, 7), ['--', '--output'])
  assert.match(call.args[7], /render\.png$/)
  assert(!fs.existsSync(path.dirname(call.args[4])), 'The work folder is removed')
})

check('a video render returns a playable MP4', async () => {
  const file = await renderBlender({ script: 'import bpy', output: 'video' }, { command: blender, env, keep })
  assert(Math.abs(await duration(file) - 1) < 0.1)
})

check('script errors, missing files and slow scripts give clear errors', async () => {
  await assert.rejects(renderBlender({ script: 'raise RuntimeError("boom")' }, { command: blender, env, keep }), /The Blender script failed:[\s\S]*RuntimeError: boom/)
  await assert.rejects(renderBlender({ script: 'NOFILE' }, { command: blender, env, keep }), /wrote no file/)
  await assert.rejects(renderBlender({ script: 'SLEEP' }, { command: blender, env, keep, timeout: 800 }), /took longer than 1 seconds/)
})

check('Blender missing from PATH or at a wrong path says so', async () => {
  const empty = fs.mkdtempSync(path.join(dir, 'empty-path-'))
  const bare = { PATH: empty, Path: empty, SystemRoot: process.env.SystemRoot || '' }
  await assert.rejects(renderBlender({ script: 'x' }, { env: bare, keep }), /Blender is not on PATH\. Install Blender, or set its path or an SSH host in Connections\./)
  const wrong = path.join(dir, 'no such', 'blender')
  await assert.rejects(renderBlender({ script: 'x' }, { config: { path: wrong }, env, keep }), new RegExp(`Blender was not found at ${wrong.replace(/\\/g, '\\\\')}`))
  await assert.rejects(blenderVersion({ config: { path: wrong }, env }), /Blender was not found at/)
  assert.equal(await blenderVersion({ command: blender, env }), 'Blender 4.5.0 (fake)')
})

check('an SSH host gets the script by scp, runs Blender there and copies the render back', async () => {
  fs.rmSync(log, { force: true })
  const file = await renderBlender({ script: 'import bpy', output: 'video' }, { config: { host: 'artist@render-box:2222', path: "/opt/blender's/blender" }, ssh, scp, env, keep })
  assert(Math.abs(await duration(file) - 1) < 0.1)
  const seen = calls()
  const sshCalls = seen.filter((c) => c.tool === 'ssh')
  assert.deepEqual(sshCalls[0].args.slice(0, 6), ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', '-p', '2222'])
  assert.equal(sshCalls[0].args.at(-2), 'artist@render-box')
  assert.match(sshCalls[1].args.at(-1), /^'\/opt\/blender'\\''s\/blender' -b --python-exit-code 1 -P '\/.*\/script\.py' -- --output '\/.*\/render\.mp4'$/)
  const scpCalls = seen.filter((c) => c.tool === 'scp')
  assert.equal(scpCalls.length, 2)
  assert(scpCalls.every((c) => c.args.includes('-P') && c.args.includes('2222')))
  assert.equal(scpCalls[0].args.at(-2), 'script.py', 'scp sends a relative name, so a Windows drive letter cannot read as a host')
  assert.match(scpCalls[1].args.at(-2), /^artist@render-box:\/.*\/render\.mp4$/)
  assert.match(sshCalls.at(-1).args.at(-1), /^rm -rf '/)
  assert.deepEqual(fs.readdirSync(remoteRoot), [], 'The remote folder is removed')
})

check('SSH failures say which part failed', async () => {
  await assert.rejects(renderBlender({ script: 'x' }, { config: { host: 'down@render-box' }, ssh, scp, env, keep }), /Could not reach down@render-box over SSH:[\s\S]*Connection refused[\s\S]*key login works/)
  await assert.rejects(renderBlender({ script: 'x' }, { config: { host: 'artist@render-box', path: 'missing-blender' }, ssh, scp, env, keep }), /Blender was not found at missing-blender on artist@render-box/)
  await assert.rejects(renderBlender({ script: 'x' }, { config: { host: 'a b; rm -rf /' }, ssh, scp, env, keep }), /looks like user@host/)
  await assert.rejects(renderBlender({ script: 'x' }, { config: { host: 'artist@render-box' }, ssh: [path.join(dir, 'no-ssh')], scp, env, keep }), /ssh and scp are not on PATH/)
  // A slow resolver (some VPN DNS setups) times out instead of refusing; both messages say what failed.
  const real = spawnSync('ssh', ['-V'], { windowsHide: true })
  if (real.error) return console.log('      (no system ssh: real SSH failure not checked)')
  await assert.rejects(renderBlender({ script: 'x' }, { config: { host: 'nobody@comfyfield-check.invalid' }, env: process.env, keep, timeout: 30000 }), /Could not reach nobody@comfyfield-check\.invalid over SSH|SSH took longer than 30 seconds/)
})

check('Connections saves the Blender path and host, and Save and test reports why Blender cannot run', async () => {
  assert.equal(core.connections().blender.connected, false)
  const wrong = path.join(dir, 'missing blender')
  core.saveConnection('blender', { path: wrong, host: '' })
  assert.deepEqual(core.connections().blender, { connected: true, path: wrong, host: '' })
  await assert.rejects(core.testConnection('blender'), /Blender was not found at/)
  assert.throws(() => core.saveConnection('blender', { path: 'blender\n--python evil.py' }), /each on one line/)
  assert.throws(() => core.saveConnection('blender', { key: 'x' }), /path and an SSH host/)
  core.saveConnection('blender', { path: '' })
})

const fakeRender = (opts, ctx) => renderBlender(opts, { ...ctx, command: blender, env })

check('a render is saved to media and the Library', async () => {
  const item = await core.blender({ script: 'import bpy', output: 'video' }, { render: fakeRender })
  assert.equal(item.kind, 'video')
  assert.match(item.url, /^\/media\/.*\.mp4$/)
  assert(fs.existsSync(core.mediaPath(item.url)))
  assert.equal(item.prompt, undefined, 'No placeholder prompt leaks into a downstream model')
  const library = core.libraryImports()
  assert.equal(library[0].id, item.id)
  assert.equal(library[0].model, 'Blender')
})

check('in Flows a Blender video feeds a real Stitch, and a Blender image feeds a model', async () => {
  const jobs = []
  const flows = createFlows({
    directory: () => path.join(dir, 'flows'),
    generate: async (job) => { jobs.push(job); return [{ kind: 'video', url: '/media/mock-video.mp4' }] },
    render: (type, opts) => core.blender(opts, { render: fakeRender }),
  })
  const flow = flows.create({ name: 'Blender to Stitch', nodes: [
    { id: 'b', type: 'blender', data: { output: 'video' } },
    { id: 's', type: 'stitch' },
    { id: 'still', type: 'blender' },
    { id: 'v', type: 'model', data: { model: 'comfy-ltx-i2v', prompt: 'Slow orbit' } },
    { id: 'o', type: 'output' },
  ], edges: [{ source: 'b', target: 's' }, { source: 's', target: 'o' }, { source: 'still', target: 'v' }] })
  assert.match(flow.nodes[0].data.script, /animation=True/, 'A Blender node made for video starts with the video script')
  assert.match(flow.nodes[2].data.script, /write_still=True/)
  const report = flows.report(flow.id, await flows.perform(flow.id, 'runNew'))
  assert.deepEqual(report.failed, [])
  assert.equal(report.outputs.b[0].kind, 'video')
  assert.equal(report.outputs.still[0].kind, 'image')
  const stitched = report.outputs.s[0]
  assert.equal(stitched.kind, 'video')
  assert(Math.abs(await duration(core.mediaPath(stitched.url)) - 1) < 0.1, 'Stitch joined the Blender clip')
  assert.equal(jobs[0].image, report.outputs.still[0].url)
  assert.equal(jobs[0].prompt, 'Slow orbit')
  assert.throws(() => flows.connect(flow.id, { source: 'o', target: 'b' }), /no output|no input/)
})

check('MCP flow tools add and describe Blender nodes', async () => {
  const flows = createFlows({ directory: () => path.join(dir, 'mcp'), render: async () => ({ kind: 'image', url: '/media/x.png' }) })
  const server = createServer({ flowService: flows })
  const [a, b] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'blender-check', version: '1' })
  await Promise.all([server.connect(b), client.connect(a)])
  const { tools } = await client.listTools()
  const add = tools.find((t) => t.name === 'add_node')
  assert(add.inputSchema.properties.type.enum.includes('blender'))
  assert.match(add.inputSchema.properties.data.description, /blender: \{ script/)
  const made = JSON.parse((await client.callTool({ name: 'create_flow', arguments: { name: 'Agent Blender' } })).content[0].text)
  const added = JSON.parse((await client.callTool({ name: 'add_node', arguments: { flow_id: made.id, type: 'blender', id: 'cube', data: { script: 'import bpy', output: 'image' } } })).content[0].text)
  assert.equal(added.type, 'blender')
  const ran = JSON.parse((await client.callTool({ name: 'run_flow', arguments: { flow_id: made.id } })).content[0].text)
  assert.equal(ran.outputs.cube[0].url, '/media/x.png')
  await client.close()
})

check('a real Blender renders when BLENDER_CHECK_PATH is set', async () => {
  const real = process.env.BLENDER_CHECK_PATH
  if (!real) return console.log('      (BLENDER_CHECK_PATH not set: a real Blender render is not checked)')
  const file = await renderBlender({ script: blenderScript }, { config: { path: real }, keep })
  assert(isPng(file))
})

let bad = 0
for (const [name, fn] of checks) {
  try { await fn(); console.log('ok   ', name) } catch (err) { bad++; console.log('FAIL ', name, '\n     ', err.stack || err.message) }
}
fs.rmSync(dir, { recursive: true, force: true })
console.log(bad ? `${bad} failed` : `all ${checks.length} passed`)
process.exit(bad ? 1 : 0)
