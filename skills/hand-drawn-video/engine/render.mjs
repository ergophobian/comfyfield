#!/usr/bin/env node
// Renders a hand-drawn video project (a folder with index.html) with a headless Chrome or Edge and ffmpeg.
//
//   node render.mjs render  <project> [--out film.mp4] [--workers 4] [--scale 1] [--from s] [--to s]
//   node render.mjs stills  <project> --times 0,1.5,3 [--dir stills] [--scale 0.5] [--stamp]
//   node render.mjs sheet   <project> [--every 1 | --times a,b,c | --cues scene] [--out sheet.jpg] [--cols 6] [--scale 0.3]
//   node render.mjs strip   <project> --at 4.2 [--n 12] [--out strip.jpg] [--scale 0.3]
//   node render.mjs music   <project> [--dir music-report]      sound + score summary + piano roll + spectrogram + loudness
//   node render.mjs frames  <video> <dir> [--fps 30] [--width 720] [--from s] [--to s]   footage → frames for K.footage
//   node render.mjs review  <project> --film film.mp4 [--round N]   the visual loop's evidence pack → <project>/review/rN/
//   node render.mjs info    <project>
//
// Needs: Node 18+, ffmpeg on PATH (or FFMPEG=path), Chrome/Edge/Chromium (or CHROME_PATH=path), and
// `npm install` once in this folder (puppeteer-core).
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn, spawnSync } from 'node:child_process'

const FFMPEG = process.env.FFMPEG || 'ffmpeg'
const [cmd, target, ...rest] = process.argv.slice(2)
const args = {}
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) { const k = rest[i].slice(2); const v = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true; args[k] = v }
  else (args._ = args._ || []).push(rest[i])
}
const PAGE = args.page && args.page !== true ? args.page : 'index.html' // --page: another page of the same project (an A/B variant)
if (!cmd || !target) { console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('\n').slice(1, 14).join('\n')); process.exit(1) }

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const L = process.env.LOCALAPPDATA || ''
  const list = {
    win32: ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', path.join(L, 'Google/Chrome/Application/chrome.exe'), 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'],
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/snap/bin/chromium'],
  }[process.platform] || []
  const hit = list.find((p) => p && fs.existsSync(p))
  if (!hit) throw new Error('No Chrome/Edge/Chromium found. Install one or set CHROME_PATH.')
  return hit
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' }
function serve(root) {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      if (req.url.startsWith('/favicon')) { rsp.writeHead(204); rsp.end(); return }
      const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname))
      if (!p.startsWith(path.resolve(root)) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); rsp.end(); return }
      rsp.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'max-age=3600' })
      fs.createReadStream(p).pipe(rsp)
    })
    srv.listen(0, '127.0.0.1', () => res(srv))
  })
}

async function openProject(dir, scale = 1) {
  const { default: puppeteer } = await import('puppeteer-core')
  const root = path.resolve(dir)
  const srv = await serve(root)
  const browser = await puppeteer.launch({ executablePath: findBrowser(), headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--font-render-hinting=none', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] })
  const url = `http://127.0.0.1:${srv.address().port}/${PAGE}?render=1`
  async function newPage() {
    const page = await browser.newPage()
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()) })
    page.on('pageerror', (e) => console.error('[page error]', e.message))
    await page.goto(url, { waitUntil: 'load', timeout: 120000 })
    await page.waitForFunction('window.__READY__ === true', { timeout: 120000 })
    const info = await page.evaluate(() => window.filmInfo())
    await page.setViewport({ width: Math.ceil(info.W), height: Math.ceil(info.H) })
    return { page, info }
  }
  const first = await newPage()
  return { browser, srv, newPage, ...first, scale, close: async () => { await browser.close(); srv.close() } }
}

const dataUrlToBuf = (d) => Buffer.from(d.slice(d.indexOf(',') + 1), 'base64')
function ff(argv, opts = {}) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...argv], { encoding: 'utf8', maxBuffer: 1 << 28, ...opts })
  if (r.status !== 0) throw new Error('ffmpeg failed: ' + (r.stderr || '').slice(-800))
  return r
}
function scaleFilter(info, scale) { const w = Math.round((info.W * scale) / 2) * 2; return w === info.W ? [] : ['-vf', `scale=${w}:-2:flags=lanczos`] }

async function stills(P, times, dir, o = {}) {
  fs.mkdirSync(dir, { recursive: true })
  const files = []
  for (let i = 0; i < times.length; i++) {
    const png = await P.page.evaluate((t, st) => window.renderFrame(t, { type: 'image/png', stamp: st }), times[i], !!o.stamp)
    const raw = path.join(dir, `_raw_${i}.png`), out = path.join(dir, `${o.prefix || 'still'}_${String(i).padStart(3, '0')}_${times[i].toFixed(2)}s.png`)
    fs.writeFileSync(raw, dataUrlToBuf(png))
    if (o.scale && o.scale !== 1) { ff(['-i', raw, ...scaleFilter(P.info, o.scale), out]); fs.unlinkSync(raw) } else fs.renameSync(raw, out)
    files.push(out)
  }
  return files
}
function tile(files, out, cols) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hdv-'))
  files.forEach((f, i) => fs.copyFileSync(f, path.join(tmp, `t_${String(i).padStart(4, '0')}.png`)))
  const rows = Math.ceil(files.length / cols)
  ff(['-framerate', '1', '-i', path.join(tmp, 't_%04d.png'), '-vf', `tile=${cols}x${rows}:padding=4:color=0x222222`, '-frames:v', '1', '-q:v', '3', out])
  fs.rmSync(tmp, { recursive: true, force: true })
}

function writeWav(file, sr, chunks) {
  const total = chunks.reduce((n, c) => n + c.length, 0), h = Buffer.alloc(44)
  h.write('RIFF', 0); h.writeUInt32LE(36 + total, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20)
  h.writeUInt16LE(2, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(total, 40)
  fs.writeFileSync(file, Buffer.concat([h, ...chunks]))
}
async function renderSound(P, file) {
  const a = await P.page.evaluate(() => window.renderAudio())
  const chunks = []
  for (let from = 0; from < a.length; from += 480000) chunks.push(Buffer.from(await P.page.evaluate((f, n) => window.audioSlice(f, n), from, 480000), 'base64'))
  writeWav(file, a.sr, chunks)
  return a
}

async function renderVideo(P, out, o) {
  const { info } = P, fps = info.fps
  const f0 = Math.round((o.from ?? 0) * fps), f1 = Math.round((o.to ?? info.duration) * fps)
  const workers = Math.max(1, Math.min(+o.workers || Math.min(4, os.cpus().length - 1), 8))
  const tmp = fs.mkdtempSync(path.join(path.dirname(path.resolve(out)), '.render-'))
  const per = Math.ceil((f1 - f0) / workers), segs = []
  const started = Date.now()
  let done = 0
  const tick = setInterval(() => process.stderr.write(`\r  frames ${done}/${f1 - f0}  ${((Date.now() - started) / 1000).toFixed(0)} s`), 2000)
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const a = f0 + w * per, b = Math.min(f1, a + per)
    if (a >= b) return
    const seg = path.join(tmp, `seg_${w}.mp4`); segs[w] = seg
    const page = w === 0 ? P.page : (await P.newPage()).page
    const enc = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', ...scaleFilter(info, o.scale || 1), '-c:v', 'libx264', '-preset', 'medium', '-crf', String(o.crf || 17), '-pix_fmt', 'yuv420p', '-r', String(fps), seg], { stdio: ['pipe', 'inherit', 'inherit'] })
    const closed = new Promise((r, j) => enc.on('close', (c) => (c === 0 ? r() : j(new Error('encoder exited ' + c)))))
    for (let f = a; f < b; f++) {
      const jpg = await page.evaluate((t) => window.renderFrame(t, { quality: 0.95 }), f / fps)
      if (!enc.stdin.write(dataUrlToBuf(jpg))) await new Promise((r) => enc.stdin.once('drain', r))
      done++
    }
    enc.stdin.end(); await closed
  }))
  clearInterval(tick); process.stderr.write('\n')
  const list = path.join(tmp, 'list.txt')
  fs.writeFileSync(list, segs.filter(Boolean).map((s) => `file '${s.replace(/\\/g, '/')}'`).join('\n'))
  const silent = path.join(tmp, 'video.mp4')
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent])
  const wav = path.join(tmp, 'music.wav')
  await renderSound(P, wav)
  const offset = (o.from ?? 0)
  ff(['-i', silent, '-ss', String(offset), '-t', String((f1 - f0) / fps), '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out])
  if (o.keepWav) fs.copyFileSync(wav, out.replace(/\.mp4$/, '.wav'))
  fs.rmSync(tmp, { recursive: true, force: true })
  console.log(`wrote ${out}  (${((f1 - f0) / fps).toFixed(2)} s, ${workers} workers, ${((Date.now() - started) / 1000).toFixed(0)} s)`)
}

async function musicReport(P, dir) {
  fs.mkdirSync(dir, { recursive: true })
  const wav = path.join(dir, 'music.wav')
  const a = await renderSound(P, wav)
  const sum = await P.page.evaluate(() => window.musicSummary())
  fs.writeFileSync(path.join(dir, 'score-summary.json'), JSON.stringify(sum, null, 1))
  fs.writeFileSync(path.join(dir, 'pianoroll.png'), dataUrlToBuf(await P.page.evaluate(() => window.drawRoll(2400, 760))))
  ff(['-i', wav, '-lavfi', 'showspectrumpic=s=2000x600:legend=1:scale=log:fscale=log:color=intensity', path.join(dir, 'spectrogram.png')])
  ff(['-i', wav, '-filter_complex', 'showwavespic=s=2000x300:split_channels=0:colors=0x333333', '-frames:v', '1', path.join(dir, 'waveform.png')])
  const eb = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', wav, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const summ = eb.slice(eb.lastIndexOf('Summary:'))
  const pick = (re) => (summ.match(re) || [])[1]
  // loudness per second (momentary RMS) so swells and drops can be read against the cues
  const st = spawnSync(FFMPEG, ['-hide_banner', '-i', wav, '-af', 'asetnsamples=48000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const rms = [...st.matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map((m) => (m[1] === '-inf' ? -99 : Math.round(+m[1])))
  const lines = [
    '# Music report', '',
    `- length ${(a.length / a.sr).toFixed(2)} s · ${sum.bpm} bpm · ${sum.beatsPerBar} pulses a bar (${sum.barSeconds} s) · ${sum.key} ${sum.mode} · ${sum.notes} events`,
    `- integrated loudness ${pick(/I:\s+(-?[\d.]+) LUFS/)} LUFS · loudness range ${pick(/LRA:\s+(-?[\d.]+) LU/)} LU · true peak ${pick(/Peak:\s+(-?[\d.]+) dBFS/)} dBFS (want about -16 LUFS for a phone, peak under -1)`,
    `- instruments: ${Object.entries(sum.perInstrument).map(([k, v]) => `${k} ${v}`).join(', ')}`,
    `- loudness each second (dBFS RMS): ${rms.join(' ')}`, '',
    '## Sections', ...(sum.sections || []).map((s) => `- ${s.from}–${s.to} s ${s.label}${s.note ? ' — ' + s.note : ''}`), '',
    '## Cues → what the music does there (nearest event / nearest strong event)',
    ...sum.sync.map((c) => `- ${c.t.toFixed(2)} s [${c.kind}] ${c.cue}: ${c.nearest} / ${c.strongest}`), '',
    '## Bars', ...sum.bars.map((b) => `- bar ${b.bar} @${b.t}s: ${b.events} events · ${b.insts.join(' ')} · ${b.pitchClasses.join(' ')}`), '',
    'Pictures: pianoroll.png (notes by instrument, red lines = film cues), spectrogram.png, waveform.png. Sound: music.wav.',
  ]
  fs.writeFileSync(path.join(dir, 'music-report.md'), lines.join('\n'))
  console.log(`wrote ${dir}/music-report.md, pianoroll.png, spectrogram.png, waveform.png, music.wav`)
}

// the evidence pack for one visual-loop round (reference/visual-loop.md): from the real mp4, plus exact
// frames from the project at every key moment and every caption
async function reviewPack(P, project, a) {
  if (!a.film) throw new Error('review <project> --film <mp4> [--round N]')
  const N = a.round && a.round !== true ? a.round : 1, dir = path.join(project, 'review', 'r' + N)
  fs.mkdirSync(dir, { recursive: true })
  const dur = +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.film], { encoding: 'utf8' }).stdout.trim()
  const lines = [`# Evidence — round ${N}`, '', `Film: ${path.resolve(a.film)} (${dur.toFixed(2)} s)`, '', 'Tiles read left to right, top to bottom.', '']
  const blind = [`# Frames — round ${N}`, '', 'Tiles read left to right, top to bottom.', '']
  const sw = P.info.W >= P.info.H ? 320 : 200
  for (let s = 0, k = 0; s < dur; s += 18, k++) {
    const f = `sheet-${String.fromCharCode(97 + k)}.jpg`
    ff(['-ss', String(s), '-t', '18', '-i', a.film, '-vf', `fps=2,scale=${sw}:-2,tile=6x6:padding=3:color=0x222222`, '-frames:v', '1', '-q:v', '3', path.join(dir, f)])
    const times = []; for (let x = s; x < Math.min(dur, s + 18); x += 0.5) times.push(x.toFixed(1))
    lines.push(`- ${f}: a frame every 0.5 s — ${times.join(', ')} s`); blind.push(`- ${f}: frames at ${times.join(', ')} s`)
  }
  for (let s = 0, k = 0; s < dur; s += 36, k++) {
    const f = `phone-${k + 1}.jpg`
    ff(['-ss', String(s), '-t', '36', '-i', a.film, '-vf', `fps=1,scale=${P.info.W >= P.info.H ? 360 : 200}:-2,tile=6x6:padding=3:color=0x222222`, '-frames:v', '1', '-q:v', '3', path.join(dir, f)])
    lines.push(`- ${f}: phone size, a frame every second from ${s} s`)
  }
  ff(['-i', a.film, '-frames:v', '1', path.join(dir, 'frame0.png')]); lines.push('- frame0.png: the first frame, full size'); blind.push('- frame0.png: the first frame')
  const cuts = P.info.scenes.filter((s) => s.start > 0)
  for (const c of cuts) {
    const f = `strip-${c.start.toFixed(1)}s-${c.id}.jpg`
    ff(['-ss', String(Math.max(0, c.start - 0.1)), '-i', a.film, '-vf', `fps=15,scale=${sw}:-2,tile=6x2:padding=3:color=0x222222`, '-frames:v', '1', '-q:v', '3', path.join(dir, f)])
    lines.push(`- ${f}: 12 frames, every 1/15 s from ${(c.start - 0.1).toFixed(2)} s — the ${c.in} into "${c.id}"`)
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hdv-rv-'))
  const hits = P.info.cues.filter((c) => c.kind === 'hit').map((c) => +(c.t + 0.15).toFixed(3)).filter((t) => t < dur)
  if (hits.length) {
    const files = await stills(P, hits, path.join(tmp, 'k'), { scale: sw / P.info.W, stamp: true })
    tile(files, path.join(dir, 'key-moments.jpg'), 6)
    lines.push(`- key-moments.jpg: 0.15 s after every key moment (stamped): ` + P.info.cues.filter((c) => c.kind === 'hit').map((c) => `${c.t}s ${c.label}`).join('; '))
  }
  const caps = P.info.scenes.map((s) => +(s.start + Math.min(1.8, (s.end - s.start) * 0.7)).toFixed(2))
  const cf = await stills(P, caps, path.join(tmp, 'c'), { scale: sw / P.info.W, stamp: true })
  tile(cf, path.join(dir, 'scenes.jpg'), 6)
  lines.push(`- scenes.jpg: one frame per scene (stamped), its caption typed: ` + P.info.scenes.map((s, i) => `${caps[i]}s ${s.id}`).join(', '))
  fs.rmSync(tmp, { recursive: true, force: true })
  fs.writeFileSync(path.join(dir, 'cues.json'), JSON.stringify(P.info.cues, null, 1))
  lines.push('- cues.json: every cue (time, label, kind)')
  fs.writeFileSync(path.join(dir, 'evidence.md'), lines.join('\n') + '\n')
  fs.writeFileSync(path.join(dir, 'evidence-blind.md'), blind.join('\n') + '\nOpen the sheets above and frame0.png only.\n')
  console.log(`wrote ${dir}/evidence.md (+ evidence-blind.md for the sound-off viewer)`)
}

const num = (v, d) => (v == null || v === true ? d : +v)
const list = (v) => String(v).split(',').filter(Boolean).map(Number)

try {
  if (cmd === 'frames') {
    const out = args._?.[0]
    if (!out) throw new Error('frames <video> <dir>')
    fs.mkdirSync(out, { recursive: true })
    const vf = [`fps=${num(args.fps, 30)}`, `scale=${num(args.width, 720)}:-2:flags=lanczos`].join(',')
    ff([...(args.from ? ['-ss', String(args.from)] : []), ...(args.to ? ['-to', String(args.to)] : []), '-i', target, '-vf', vf, '-q:v', '3', path.join(out, 'frame_%05d.jpg')])
    console.log(`wrote ${fs.readdirSync(out).length} frames to ${out}`)
    process.exit(0)
  }
  const P = await openProject(target)
  const scale = num(args.scale, cmd === 'render' ? 1 : cmd === 'stills' ? 0.5 : 0.3)
  if (cmd === 'info') console.log(JSON.stringify(P.info, null, 1))
  else if (cmd === 'render') await renderVideo(P, args.out || path.join(target, 'out', 'film.mp4'), { workers: args.workers, scale, from: args.from ? +args.from : undefined, to: args.to ? +args.to : undefined, crf: args.crf, keepWav: args.wav })
  else if (cmd === 'stills') { const f = await stills(P, list(args.times), args.dir || path.join(target, 'out', 'stills'), { scale, stamp: !!args.stamp }); console.log(f.join('\n')) }
  else if (cmd === 'sheet' || cmd === 'strip') {
    let times
    if (cmd === 'strip') { const at = +args.at, n = num(args.n, 12); times = Array.from({ length: n }, (_, i) => +(at + (i - n / 2) / P.info.fps).toFixed(4)).filter((x) => x >= 0) }
    else if (args.times) times = list(args.times)
    else if (args.cues) times = P.info.cues.filter((c) => args.cues === true || c.kind === args.cues).map((c) => +(c.t + num(args.after, 0.9)).toFixed(3))
    else { const ev = num(args.every, 1); times = []; for (let x = num(args.from, 0); x < num(args.to, P.info.duration); x += ev) times.push(+x.toFixed(3)) }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hdv-st-'))
    const files = await stills(P, times, tmp, { scale, stamp: true })
    const out = args.out || path.join(target, 'out', cmd + '.jpg')
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true })
    tile(files, out, num(args.cols, cmd === 'strip' ? 6 : 6))
    fs.rmSync(tmp, { recursive: true, force: true })
    console.log(`wrote ${out} (${times.length} frames: ${times.join(', ')})`)
  } else if (cmd === 'music') await musicReport(P, args.dir || path.join(target, 'out', 'music-report'))
  else if (cmd === 'review') await reviewPack(P, target, args)
  else throw new Error('unknown command ' + cmd)
  await P.close()
  process.exit(0)
} catch (e) {
  console.error(e.stack || e.message)
  process.exit(1)
}
