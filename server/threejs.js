// Renders a Three.js scene to an H.264 MP4: headless Chrome draws each frame on a fixed clock, ffmpeg encodes.
// The scene runs only inside the page. Chrome talks to us over a pipe (no debugging port), and every request
// the page makes is answered by us: the page, the scene and the three module files. Anything else fails.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { findFfmpeg } from './ffmpeg.js'
import { chromeExecutable } from './chrome.js'
import { threeLimits } from '../shared/flowRules.js'

const require = createRequire(import.meta.url)
const invalid = (message, status = 400) => Object.assign(new Error(message), { status })
const origin = 'https://three.comfyfield.invalid'
const buildDir = path.dirname(require.resolve('three'))
const addonsDir = path.resolve(buildDir, '../examples/jsm')

export function threeOptions({ script, duration = 5, width = 1280, height = 720, fps = 30 } = {}) {
  const { seconds, fps: maxFps, frames: maxFrames, minSize, maxSize } = threeLimits
  if (typeof script !== 'string' || !script.trim()) throw invalid('Write the Three.js scene code first.')
  if (script.length > 200000) throw invalid('The scene code is too long. Keep it under 200,000 characters.')
  const n = (v) => (v === '' || v == null ? NaN : Number(v))
  duration = n(duration); width = n(width); height = n(height); fps = n(fps)
  if (!(duration > 0 && duration <= seconds)) throw invalid(`The duration is more than 0 and at most ${seconds} seconds.`)
  if (!Number.isInteger(fps) || fps < 1 || fps > maxFps) throw invalid(`The frame rate is a whole number from 1 to ${maxFps}.`)
  for (const [name, v] of [['width', width], ['height', height]]) {
    if (!Number.isInteger(v) || v < minSize || v > maxSize || v % 2) throw invalid(`The ${name} is an even number of pixels from ${minSize} to ${maxSize}.`)
  }
  const frames = Math.round(duration * fps)
  if (frames < 1) throw invalid('The video needs at least 1 frame. Make it longer or raise the frame rate.')
  if (frames > maxFrames) throw invalid(`The video has ${frames} frames. The limit is ${maxFrames}: shorten it or lower the frame rate.`)
  return { script, duration, width, height, fps, frames }
}

// Runs before any page script: a clock that only moves when a frame is drawn, a seeded Math.random,
// and no WebRTC, sockets or workers, which page request interception cannot see.
const pagePrelude = `(() => {
  let now = 0
  let queue = []
  let next = 0
  const epoch = Date.UTC(2026, 0, 1)
  Object.defineProperty(performance, 'now', { value: () => now })
  Date.now = () => epoch + now
  window.requestAnimationFrame = (cb) => { queue.push([++next, cb]); return next }
  window.cancelAnimationFrame = (id) => { queue = queue.filter(([n]) => n !== id) }
  let seed = 1
  Math.random = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  for (const name of ['RTCPeerConnection', 'webkitRTCPeerConnection', 'RTCDataChannel', 'WebSocket', 'WebTransport', 'EventSource', 'Worker', 'SharedWorker']) {
    try { Object.defineProperty(window, name, { value: undefined, configurable: false, writable: false }) } catch {}
  }
  try { Object.defineProperty(navigator, 'serviceWorker', { value: undefined }) } catch {}
  Object.defineProperty(window, '__clock', { value: Object.freeze({
    set(ms) { now = ms },
    flush() { const due = queue; queue = []; for (const [, cb] of due) cb(now) },
  }) })
})()`

const harness = (opts) => `import * as THREE from 'three'
const { width, height, fps, duration, frames } = ${JSON.stringify({ width: opts.width, height: opts.height, fps: opts.fps, duration: opts.duration, frames: opts.frames })}
const canvas = document.createElement('canvas')
canvas.width = width
canvas.height = height
document.body.append(canvas)
let renderer
let api = {}
window.__setup = async () => {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
  } catch (e) {
    throw new Error('WebGL did not start in headless Chrome: ' + e.message)
  }
  renderer.setPixelRatio(1)
  renderer.setSize(width, height, false)
  const mod = await import('/scene.js')
  if (typeof mod.default !== 'function') throw new Error('The scene code must export default function ({ THREE, renderer, width, height, fps, duration }) and return { scene, camera, update }.')
  api = (await mod.default({ THREE, renderer, canvas, width, height, fps, duration, frames })) || {}
  if (!(api.scene && api.camera) && typeof api.update !== 'function') throw new Error('The scene function must return { scene, camera } or an update(time, frame) function that draws with renderer.')
  return true
}
window.__frame = async (frame) => {
  const time = frame / fps
  window.__clock.set(time * 1000)
  window.__clock.flush()
  if (typeof api.update === 'function') await api.update(time, frame)
  if (api.scene && api.camera) renderer.render(api.scene, api.camera)
  return canvas.toDataURL('image/png')
}
`

// What the page may load. Everything is read from the installed three package or built here.
function pageFiles(opts, nonce) {
  const page = `<!doctype html><html><head><meta charset="utf-8">
<script type="importmap" nonce="${nonce}">${JSON.stringify({ imports: { three: '/three/three.module.js', 'three/addons/': '/three/addons/' } })}</script>
</head><body><script type="module" src="/harness.js"></script></body></html>`
  const csp = `default-src 'none'; script-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'unsafe-inline'; worker-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`
  const js = 'text/javascript; charset=utf-8'
  const fixed = { '/': [page, 'text/html; charset=utf-8'], '/harness.js': [harness(opts), js], '/scene.js': [opts.script, js] }
  return (pathname) => {
    if (fixed[pathname]) return { body: Buffer.from(fixed[pathname][0]), type: fixed[pathname][1], csp }
    const inside = (dir, rest) => {
      const file = path.resolve(dir, rest)
      return file.startsWith(dir + path.sep) && /\.(js|json)$/.test(file) && fs.existsSync(file) ? file : null
    }
    const file = pathname.startsWith('/three/addons/') ? inside(addonsDir, decodeURIComponent(pathname.slice(14)))
      : /^\/three\/[\w.-]+\.js$/.test(pathname) ? inside(buildDir, pathname.slice(7)) : null
    return file && { body: fs.readFileSync(file), type: file.endsWith('.json') ? 'application/json' : js, csp }
  }
}

async function killTree(child) {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null) return
  if (process.platform === 'win32') {
    await new Promise((done) => {
      const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
      killer.once('error', done)
      killer.once('close', done)
    })
  } else {
    try { process.kill(-child.pid, 'SIGKILL') } catch { child.kill('SIGKILL') }
  }
}

// Chrome with --remote-debugging-pipe: CDP messages are JSON ending in a NUL byte, written to fd 3 and read from fd 4.
function launchChrome(executable, { profile, sandbox, width, height }) {
  const args = [
    '--headless=new', '--remote-debugging-pipe', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking',
    '--disable-sync', '--disable-component-update', '--disable-default-apps', '--mute-audio', '--hide-scrollbars', '--block-new-web-contents',
    // WebGL on the CPU, so a render looks the same on every machine and needs no GPU.
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    // Second fence behind request interception: no DNS, a dead proxy and no direct WebRTC.
    '--host-resolver-rules=MAP * ~NOTFOUND', '--proxy-server=127.0.0.1:9', '--webrtc-ip-handling-policy=disable_non_proxied_udp',
    `--window-size=${width},${height}`,
    ...(sandbox ? [] : ['--no-sandbox']),
    'about:blank',
  ]
  const child = spawn(executable, args, { detached: process.platform !== 'win32', windowsHide: true, stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] })
  let stderr = ''
  child.stderr.on('data', (d) => { stderr = (stderr + d).slice(-4000) })
  const pending = new Map()
  const listeners = new Set()
  let seq = 0
  let buffer = ''
  let dead
  const exited = new Promise((resolve) => child.once('exit', resolve))
  const fail = (error) => {
    dead ||= error
    for (const p of pending.values()) p.reject(error)
    pending.clear()
  }
  child.once('error', (e) => fail(e.code === 'ENOENT' ? invalid(`Chrome was not found at ${executable}. Install Google Chrome, or set CHROME_PATH to the Chrome program.`) : e))
  child.once('exit', (code) => fail(new Error(`Chrome stopped (exit ${code}).${stderr ? `\n${stderr.trim().split(/\r?\n/).slice(-6).join('\n')}` : ''}`)))
  child.stdio[3].on('error', () => {})
  child.stdio[4].on('data', (chunk) => {
    buffer += chunk.toString('utf8')
    let end
    while ((end = buffer.indexOf('\0')) >= 0) {
      const msg = JSON.parse(buffer.slice(0, end))
      buffer = buffer.slice(end + 1)
      const p = pending.get(msg.id)
      if (p) {
        pending.delete(msg.id)
        if (msg.error) p.reject(new Error(msg.error.message))
        else p.resolve(msg.result)
      } else if (msg.method) listeners.forEach((fn) => fn(msg))
    }
  })
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    if (dead) return reject(dead)
    const id = ++seq
    pending.set(id, { resolve, reject })
    child.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }) + '\0')
  })
  // force: the page is stuck (the time limit hit), so do not wait for a polite close.
  const close = async ({ force = false } = {}) => {
    if (!dead && !force) await Promise.race([send('Browser.close').catch(() => {}), new Promise((r) => setTimeout(r, 2000))])
    if (!force) await Promise.race([exited, new Promise((r) => setTimeout(r, 3000))])
    await killTree(child)
    await Promise.race([exited, new Promise((r) => setTimeout(r, 3000))])
  }
  return { send, on: (fn) => listeners.add(fn), close }
}

function encoder(binary, opts, file) {
  const child = spawn(binary, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(opts.fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(opts.fps),
    '-movflags', '+faststart', file,
  ], { windowsHide: true, stdio: ['pipe', 'ignore', 'pipe'] })
  let stderr = ''
  child.stderr.on('data', (d) => { stderr = (stderr + d).slice(-4000) })
  child.stdin.on('error', () => {})
  const done = new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg could not encode the frames:\n${stderr.trim()}`)))
  })
  done.catch(() => {})
  return {
    write: (buf) => new Promise((resolve) => { if (child.stdin.write(buf)) resolve(); else child.stdin.once('drain', resolve) }),
    end: () => { child.stdin.end(); return done },
    kill: () => child.kill(),
  }
}

// keep(file, 'video') stores the MP4 and returns what the caller needs (core saves it to media and the Library).
// blocked collects every request the page tried that was refused, for checks and errors.
export async function renderThree(options, {
  keep, timeout = 10 * 60 * 1000, env = process.env, chrome, ffmpegBinary,
  sandbox = env.COMFYFIELD_CHROME_SANDBOX !== 'off', blocked = [], onFrame = () => {},
} = {}) {
  const opts = threeOptions(options)
  const executable = chrome || chromeExecutable(env)
  const binary = ffmpegBinary || await findFfmpeg()
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comfyfield-three-'))
  const file = path.join(dir, 'render.mp4')
  const nonce = crypto.randomBytes(16).toString('base64')
  const serve = pageFiles(opts, nonce)
  const browser = launchChrome(executable, { profile: path.join(dir, 'profile'), sandbox, width: opts.width, height: opts.height })
  let video
  let timer
  const limit = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(invalid(`The Three.js render took longer than ${Math.round(timeout / 1000)} seconds and was stopped.`, 504)), timeout)
  })
  limit.catch(() => {})
  const within = (promise) => Promise.race([promise, limit])
  const pageErrors = []
  let stuck = false
  try {
    const { targetId } = await within(browser.send('Target.createTarget', { url: 'about:blank' }))
    const { sessionId } = await within(browser.send('Target.attachToTarget', { targetId, flatten: true }))
    const send = (method, params) => browser.send(method, params, sessionId)
    browser.on((msg) => {
      if (msg.sessionId !== sessionId) return
      if (msg.method === 'Fetch.requestPaused') {
        const { requestId, request } = msg.params
        const url = new URL(request.url)
        const found = url.origin === origin && request.method === 'GET' && serve(url.pathname)
        if (!found) {
          blocked.push(request.url)
          send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }).catch(() => {})
          return
        }
        send('Fetch.fulfillRequest', {
          requestId, responseCode: 200, body: found.body.toString('base64'),
          responseHeaders: [{ name: 'Content-Type', value: found.type }, { name: 'Content-Security-Policy', value: found.csp }, { name: 'Cache-Control', value: 'no-store' }],
        }).catch(() => {})
      }
      if (msg.method === 'Runtime.exceptionThrown') pageErrors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text)
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') pageErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
    })
    await within(send('Fetch.enable', { patterns: [{ urlPattern: '*' }] }))
    await within(send('Runtime.enable'))
    await within(send('Page.enable'))
    await within(send('Page.addScriptToEvaluateOnNewDocument', { source: pagePrelude }))
    await within(send('Page.navigate', { url: `${origin}/` }))
    const evaluate = async (expression, what) => {
      const r = await within(send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }))
      if (r.exceptionDetails) {
        const d = r.exceptionDetails
        const detail = d.exception?.description || d.exception?.value || d.text
        throw invalid(`The Three.js scene failed ${what}:\n${String(detail).split('\n').slice(0, 8).join('\n')}${pageErrors.length ? `\n${pageErrors.slice(-3).join('\n')}` : ''}`)
      }
      return r.result.value
    }
    // The harness module defines __setup once three and the page have loaded.
    const deadline = Date.now() + 30000
    while (!(await evaluate('typeof window.__setup === "function"', 'to load'))) {
      if (Date.now() > deadline) throw invalid(`The Three.js page did not load.${pageErrors.length ? `\n${pageErrors.slice(-3).join('\n')}` : ''}`)
      await within(new Promise((r) => setTimeout(r, 50)))
    }
    await evaluate('window.__setup()', 'while setting up')
    video = encoder(binary, opts, file)
    for (let frame = 0; frame < opts.frames; frame++) {
      const url = await evaluate(`window.__frame(${frame})`, `on frame ${frame + 1}`)
      if (typeof url !== 'string' || !url.startsWith('data:image/png;base64,')) throw invalid(`Frame ${frame + 1} came back empty. Draw with the renderer passed to the scene function.`)
      await within(video.write(Buffer.from(url.slice(22), 'base64')))
      onFrame(frame + 1, opts.frames)
    }
    await within(video.end())
    if (!fs.existsSync(file) || !fs.statSync(file).size) throw invalid('ffmpeg wrote no video.')
    return await keep(file, 'video', opts)
  } catch (e) {
    stuck = e.status === 504
    video?.kill()
    throw e
  } finally {
    clearTimeout(timer)
    await browser.close({ force: stuck })
    // Chrome on Windows can hold its profile for a moment after it exits.
    await fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 }).catch(() => {})
  }
}
