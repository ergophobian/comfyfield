// Runs a Blender Python script headless, on this machine or on an SSH host, and returns the file it rendered.
// The script gets the output path after "--": blender -b --python-exit-code 1 -P script.py -- --output <file>.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const invalid = (message, status = 400) => Object.assign(new Error(message), { status })
const outputs = { image: 'png', video: 'mp4' }
const tail = (text) => text.trim().split(/\r?\n/).slice(-12).join('\n')
// POSIX single quotes for the command the SSH host runs.
const quote = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`
const hostPattern = /^(?:[\w.-]+@)?[\w.-]+(?::\d+)?$/

export const blenderSample = `import bpy, sys
out = sys.argv[sys.argv.index("--output") + 1]
scene = bpy.context.scene
scene.render.resolution_x, scene.render.resolution_y = 1280, 720
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
`

export function blenderOptions({ script, output = 'image' } = {}) {
  if (typeof script !== 'string' || !script.trim()) throw invalid('Write a Blender Python script first.')
  if (script.length > 200000) throw invalid('The Blender script is too long. Keep it under 200,000 characters.')
  if (!outputs[output]) throw invalid('The Blender output is image or video.')
  return { script, output }
}

// command: [file, ...leading args]. spawn never goes through a shell, so paths with spaces stay one argument.
export function exec([file, ...lead], args, { timeout, env, what, cwd }) {
  return new Promise((resolve, reject) => {
    let out = ''
    let child
    try { child = spawn(file, [...lead, ...args], { windowsHide: true, env, cwd }) } catch (e) { return reject(Object.assign(e, { what })) }
    const timer = setTimeout(() => { child.kill(); reject(invalid(`${what} took longer than ${Math.round(timeout / 1000)} seconds and was stopped.`, 504)) }, timeout)
    const keep = (chunk) => { out = (out + chunk).slice(-64000) }
    child.stdout.on('data', keep)
    child.stderr.on('data', keep)
    child.on('error', (e) => { clearTimeout(timer); reject(Object.assign(e, { what })) })
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, out }) })
  })
}

const missingLocal = (configured) => configured
  ? invalid(`Blender was not found at ${configured}. Check the Blender path in Connections.`)
  : invalid('Blender is not on PATH. Install Blender, or set its path or an SSH host in Connections.')

const scriptFailed = (out) => invalid(`The Blender script failed:\n${tail(out) || 'Blender gave no output.'}`)
const noFile = () => invalid('Blender finished but wrote no file. Save the render to the path after --output in sys.argv.')

async function local(opts, { command, configured, timeout, env, dir }) {
  const script = path.join(dir, 'script.py')
  const file = path.join(dir, `render.${outputs[opts.output]}`)
  fs.writeFileSync(script, opts.script)
  let result
  try {
    result = await exec(command, ['-b', '--python-exit-code', '1', '-P', script, '--', '--output', file], { timeout, env, what: 'The Blender render' })
  } catch (e) {
    if (e.code === 'ENOENT' || e.code === 'EACCES' || e.code === 'EINVAL') throw missingLocal(configured)
    throw e
  }
  if (result.code !== 0) throw scriptFailed(result.out)
  if (!fs.existsSync(file) || !fs.statSync(file).size) throw noFile()
  return file
}

async function remote(opts, { host, blender, ssh, scp, timeout, env, dir }) {
  if (!hostPattern.test(host)) throw invalid('The SSH host looks like user@host or host. Check it in Connections.')
  const [address, port] = host.split(/:(?=\d+$)/)
  const sshArgs = ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', ...(port ? ['-p', port] : [])]
  const scpArgs = ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', ...(port ? ['-P', port] : [])]
  // scp runs inside the work folder with relative names: a Windows drive letter would read as a host.
  const run = async (what, command, args) => {
    try { return await exec(command, args, { timeout, env, what, cwd: dir }) } catch (e) {
      if (e.code === 'ENOENT') throw invalid('ssh and scp are not on PATH. Install an OpenSSH client to render on an SSH host.')
      throw e
    }
  }
  const reach = (r) => {
    if (r.code === 255) throw invalid(`Could not reach ${address} over SSH:\n${tail(r.out)}\nCheck the SSH host in Connections, and that key login works without a password.`)
    return r
  }
  const made = reach(await run('SSH', ssh, [...sshArgs, address, 'mktemp -d']))
  const remoteDir = made.out.trim().split(/\r?\n/).at(-1)
  if (made.code !== 0 || !remoteDir?.startsWith('/')) throw invalid(`Could not make a folder on ${address}:\n${tail(made.out)}`)
  try {
    const script = path.join(dir, 'script.py')
    fs.writeFileSync(script, opts.script)
    const name = `render.${outputs[opts.output]}`
    reach(await run('Copying the script', scp, [...scpArgs, 'script.py', `${address}:${remoteDir}/script.py`]))
    const line = [quote(blender || 'blender'), '-b', '--python-exit-code', '1', '-P', quote(`${remoteDir}/script.py`), '--', '--output', quote(`${remoteDir}/${name}`)].join(' ')
    const r = reach(await run('The Blender render', ssh, [...sshArgs, address, line]))
    if (r.code === 127) throw invalid(blender ? `Blender was not found at ${blender} on ${address}. Check the Blender path in Connections.` : `Blender is not on PATH on ${address}. Install it there, or set its path in Connections.`)
    if (r.code !== 0) throw scriptFailed(r.out)
    const file = path.join(dir, name)
    const back = reach(await run('Copying the render back', scp, [...scpArgs, `${address}:${remoteDir}/${name}`, name]))
    if (back.code !== 0 || !fs.existsSync(file) || !fs.statSync(file).size) throw noFile()
    return file
  } finally {
    await run('SSH', ssh, [...sshArgs, address, `rm -rf ${quote(remoteDir)}`]).catch(() => {})
  }
}

// config: { path, host } from Connections. command, ssh and scp override the programs (checks use fakes).
export async function renderBlender(options, { config = {}, command, ssh = ['ssh'], scp = ['scp'], timeout = 20 * 60 * 1000, env = process.env, keep } = {}) {
  const opts = blenderOptions(options)
  const host = config.host?.trim()
  const configured = config.path?.trim()
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comfyfield-blender-'))
  try {
    const file = host
      ? await remote(opts, { host, blender: configured, ssh, scp, timeout, env, dir })
      : await local(opts, { command: command || [configured || 'blender'], configured, timeout, env, dir })
    return keep(file, opts.output)
  } finally {
    // Windows can still hold the folder for a moment after ssh exits; a failed cleanup must not hide the real error.
    try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) } catch {}
  }
}

// What Save and test in Connections reports: the Blender version, or the reason it cannot run.
export async function blenderVersion({ config = {}, command, ssh = ['ssh'], timeout = 60000, env = process.env } = {}) {
  const host = config.host?.trim()
  const configured = config.path?.trim()
  if (host) {
    if (!hostPattern.test(host)) throw invalid('The SSH host looks like user@host or host. Check it in Connections.')
    const [address, port] = host.split(/:(?=\d+$)/)
    let r
    try { r = await exec(ssh, ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', ...(port ? ['-p', port] : []), address, `${quote(configured || 'blender')} --version`], { timeout, env, what: 'SSH' }) } catch (e) {
      if (e.code === 'ENOENT') throw invalid('ssh is not on PATH. Install an OpenSSH client to render on an SSH host.')
      throw e
    }
    if (r.code === 255) throw invalid(`Could not reach ${address} over SSH: ${tail(r.out)}`)
    if (r.code !== 0) throw invalid(`Blender did not start on ${address}: ${tail(r.out)}`)
    return r.out.trim().split(/\r?\n/)[0]
  }
  let r
  try { r = await exec(command || [configured || 'blender'], ['--version'], { timeout, env, what: 'Blender' }) } catch (e) {
    if (e.code === 'ENOENT' || e.code === 'EACCES' || e.code === 'EINVAL') throw missingLocal(configured)
    throw e
  }
  if (r.code !== 0) throw invalid(`Blender did not start: ${tail(r.out)}`)
  return r.out.trim().split(/\r?\n/)[0]
}
