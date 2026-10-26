import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { appMediaFile, stitchMediaFile as localFile } from './stitchMedia.js'
import { findFfmpeg } from './ffmpeg.js'
export { findFfmpeg } from './ffmpeg.js'

const fonts = fileURLToPath(new URL('./fonts/', import.meta.url))
const dimensions = { '16:9': [1280, 720], '9:16': [720, 1280], '1:1': [720, 720], '4:5': [720, 900], '3:4': [720, 960], '2:3': [640, 960] }
const invalid = (message) => Object.assign(new Error(message), { status: 400 })

export function ffmpeg(args, { binary = 'ffmpeg', cwd, allowFailure = false, timeout = 10 * 60 * 1000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, ['-hide_banner', '-nostdin', ...args], { cwd, windowsHide: true })
    let stderr = ''
    let timedOut = false
    const timer = setTimeout(() => { timedOut = true; child.kill() }, timeout)
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-64000) })
    child.stdout.resume()
    child.on('error', (e) => { clearTimeout(timer); reject(e) })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (timedOut) reject(new Error(`Stitch took too long. Try shorter clips.\n${stderr.slice(-2400)}`))
      else if (code === 0 || allowFailure) resolve(stderr)
      else reject(new Error(`Stitch failed: ${stderr.slice(-2400)}`))
    })
  })
}

const seconds = (value, fallback, name) => {
  if (value == null || value === '') return fallback
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) throw invalid(`${name} must be a positive number or zero.`)
  return n
}

export function stitchOptions({ clips, aspect = '16:9', music, narration, captionStyle = 'clean' } = {}) {
  if (!['bold', 'clean', 'boxed'].includes(captionStyle)) throw invalid('Choose a supported caption style.')
  if (!Array.isArray(clips) || !clips.length || clips.length > 50) throw invalid('Choose between 1 and 50 clips.')
  if (!dimensions[aspect]) throw invalid('Choose a supported output aspect (16:9, 9:16, 1:1, 4:5, 3:4 or 2:3).')
  const ordered = clips.map((clip) => {
    const c = typeof clip === 'string' ? { url: clip } : clip
    if (!c || typeof c.url !== 'string' || !c.url.trim()) throw invalid('Each clip needs a URL or file path.')
    const start = seconds(c.start, 0, 'Trim start')
    const end = seconds(c.end, undefined, 'Trim end')
    if (end != null && end <= start) throw invalid('Trim end must come after trim start.')
    const duration = seconds(c.duration, undefined, 'Shot duration')
    if (c.kind === 'image' && !(duration > 0 && duration <= 120)) throw invalid('Still shots need a duration up to 120 seconds.')
    if (c.narration && (typeof c.narration.url !== 'string' || !c.narration.url.trim())) throw invalid('Narration needs a URL or file path.')
    const maxDuration = seconds(c.maxDuration, undefined, 'Maximum duration')
    if (maxDuration != null && !(maxDuration > 0 && maxDuration <= 120)) throw invalid('Maximum duration must be between 0 and 120 seconds.')
    return { maxDuration, url: c.url, start, end, kind: c.kind, duration, narration: c.narration && { url: c.narration.url }, caption: String(c.caption || '').slice(0, 2000) }
  })
  let track
  if (music?.url) {
    if (typeof music.url !== 'string') throw invalid('Music needs a URL or file path.')
    const volume = seconds(music.volume, 0.25, 'Music volume')
    if (volume > 2) throw invalid('Music volume must be between 0 and 2.')
    track = { url: music.url, volume, fade: seconds(music.fade, 1, 'Music fade') }
  }
  let speech
  if (narration != null) {
    if (typeof narration.url !== 'string' || !narration.url.trim()) throw invalid('Narration needs a URL or file path.')
    const volume = seconds(narration.volume, 1, 'Narration volume')
    if (volume > 2) throw invalid('Narration volume must be between 0 and 2.')
    speech = { url: narration.url, volume }
  }
  return { clips: ordered, aspect, music: track, narration: speech, captionStyle }
}

async function inspect(file, binary, timeout) {
  const log = await ffmpeg(['-protocol_whitelist', 'file,pipe', '-i', file], { binary, timeout, allowFailure: true })
  const m = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(log)
  if (!m) throw invalid('Could not read the clip or track duration. Use a supported media file.')
  return { fps: Number(/(\d+(?:\.\d+)?) fps/.exec(log)?.[1]), duration: Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]), audio: /Stream #.*Audio:/.test(log), video: /Stream #.*Video:/.test(log) }
}

export async function inspectStoryFootage(url, { mediaPath, binary, timeout = 30000, range } = {}) {
  const file = appMediaFile(url, mediaPath)
  binary ||= await findFfmpeg()
  const info = await inspect(file, binary, timeout)
  if (!info.video || !(info.fps > 0)) throw invalid('Could not read the source frame rate. Turn off Restyle footage or upload another video.')
  if (range) {
    // Count decoded source frames too: average fps alone can miss a variable-rate burst.
    const log = await ffmpeg(['-protocol_whitelist', 'file,pipe', '-ss', String(range.start), '-i', file, '-t', String(range.end - range.start), '-map', '0:v:0', '-an', '-frames:v', '82', '-fps_mode', 'passthrough', '-f', 'null', '-'], { binary, timeout })
    const counts = [...log.matchAll(/frame=\s*(\d+)/g)]
    info.frames = Number(counts.at(-1)?.[1])
  }
  return info
}

function captionFile(text, width, height, style) {
  const literal = text.replace(/\\/g, '＼').replace(/\{/g, '｛').replace(/\}/g, '｝').replace(/\r?\n/g, '\\N')
  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans,${Math.round(width / (style === 'bold' ? 20 : 24))},&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,${style === 'bold' ? -1 : 0},0,0,0,100,100,0,0,${style === 'boxed' ? 3 : 1},2,1,2,40,40,${Math.round(height / 16)},1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,9:59:59.00,Default,,0,0,0,,${literal}
`
}

// Normalize each clip separately so silent clips, mixed sizes and frame rates can concatenate.
export async function renderStitch(options, { home, mediaPath, binary, timeout, onProgress = () => {} } = {}) {
  const opts = stitchOptions(options)
  binary ||= await findFfmpeg()
  const base = path.join(home(), 'stitch')
  fs.mkdirSync(base, { recursive: true })
  const dir = fs.mkdtempSync(path.join(base, 'render-'))
  try {
    return await renderSegments(opts, { dir, mediaPath, binary, timeout, onProgress })
  } finally {
    await fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
  }
}

async function renderSegments(opts, { dir, mediaPath, binary, timeout, onProgress }) {
  const [width, height] = dimensions[opts.aspect]
  fs.copyFileSync(path.join(fonts, 'NotoSans-Regular.ttf'), path.join(dir, 'NotoSans-Regular.ttf'))
  let duration = 0
  for (const [i, clip] of opts.clips.entries()) {
    const file = await localFile(clip.url, dir, `input-${i}`, mediaPath)
    const info = clip.kind === 'image' ? { video: true, audio: false, duration: clip.duration } : await inspect(file, binary, timeout)
    if (!info.video) throw invalid(`Clip ${i + 1} has no video.`)
    if (clip.start >= info.duration || (clip.end != null && clip.end > info.duration + 0.05)) throw invalid(`Clip ${i + 1} trim is outside its duration (${info.duration}s).`)
    const narration = clip.narration ? await localFile(clip.narration.url, dir, `narration-${i}`, mediaPath) : null
    const speech = narration ? await inspect(narration, binary, timeout) : null
    if (speech && !speech.audio) throw invalid(`Shot ${i + 1} narration has no playable audio.`)
    if (speech && speech.duration > 120) throw invalid(`Shot ${i + 1} narration exceeds 120 seconds. Split it into shorter shots.`)
    const length = Math.min(speech?.duration || (clip.end ?? info.duration) - clip.start, clip.maxDuration ?? Infinity)
    // Round every segment to whole frames; the soundtrack must match the joined video.
    const frames = Math.max(1, Math.round(length * 30))
    duration += frames / 30
    const args = ['-y', '-protocol_whitelist', 'file,pipe']
    if (clip.kind === 'image') args.push('-loop', '1', '-framerate', '30')
    args.push('-ss', String(clip.start), '-i', file)
    if (narration) args.push('-i', narration)
    else if (!info.audio) args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo')
    let video = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,trim=duration=${(clip.end ?? info.duration) - clip.start},tpad=stop_mode=clone:stop_duration=${Math.ceil(length)}`
    if (clip.caption) {
      fs.writeFileSync(path.join(dir, `caption-${i}.ass`), captionFile(clip.caption, width, height, opts.captionStyle))
      video += `,ass=filename=caption-${i}.ass:fontsdir=.`
    }
    args.push('-map', '0:v:0', '-map', narration || !info.audio ? '1:a:0' : '0:a:0', '-vf', video,
      '-af', `${speech?.duration > length ? `atempo=${speech.duration / length},` : ''}aresample=48000,apad`, '-t', String(frames / 30), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-ac', '2', `clip-${i}.mp4`)
    onProgress(`Encode clip ${i + 1}`)
    await ffmpeg(args, { binary, timeout, cwd: dir })
  }
  fs.writeFileSync(path.join(dir, 'clips.txt'), opts.clips.map((_, i) => `file 'clip-${i}.mp4'`).join('\n'))
  const args = ['-y', '-f', 'concat', '-safe', '1', '-i', 'clips.txt']
  const filters = []
  const tracks = ['[0:a]']
  if (opts.music) {
    const file = await localFile(opts.music.url, dir, 'music-input', mediaPath)
    const track = await inspect(file, binary, timeout)
    if (!track.audio || track.duration <= 0) throw invalid('The music track has no playable audio.')
    fs.copyFileSync(file, path.join(dir, 'music-source'))
    // A finite playlist avoids ffmpeg 6's looped-input shutdown hang on Apple Silicon.
    fs.writeFileSync(path.join(dir, 'music.txt'), Array.from({ length: Math.ceil(duration / track.duration) }, () => "file 'music-source'").join('\n'))
    const fade = Math.min(opts.music.fade, duration / 2)
    args.push('-f', 'concat', '-safe', '1', '-i', 'music.txt')
    filters.push(`[1:a]aresample=48000,volume=${opts.music.volume},atrim=duration=${duration},afade=t=in:d=${fade},afade=t=out:st=${duration - fade}:d=${fade}[music]`)
    tracks.push('[music]')
  }
  if (opts.narration) {
    const file = await localFile(opts.narration.url, dir, 'narration-input', mediaPath)
    const track = await inspect(file, binary, timeout)
    if (!track.audio || track.duration <= 0) throw invalid('The narration track has no playable audio.')
    args.push('-i', file)
    // Narration is read once; apad supplies silence through the remaining video.
    filters.push(`[${tracks.length}:a]aresample=48000,volume=${opts.narration.volume},apad,atrim=duration=${duration}[narration]`)
    tracks.push('[narration]')
  }
  if (filters.length) {
    filters.push(`${tracks.join('')}amix=inputs=${tracks.length}:duration=first:normalize=0[audio]`)
    args.push('-filter_complex', filters.join(';'), '-map', '0:v:0', '-map', '[audio]')
  } else args.push('-map', '0:v:0', '-map', '0:a:0')
  args.push('-t', String(duration), '-c:v', 'copy', '-c:a', 'aac', '-movflags', '+faststart', 'result.mp4')
  onProgress('Join clips and mix audio')
  await ffmpeg(args, { binary, timeout, cwd: dir })
  const name = `stitch-${path.basename(dir)}.mp4`
  const output = mediaPath(name)
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.renameSync(path.join(dir, 'result.mp4'), output)
  return { url: `/media/${name}`, path: output, kind: 'video', aspect: opts.aspect, duration, width, height }
}
