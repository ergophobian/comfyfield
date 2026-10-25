import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import bundledFfmpeg from 'ffmpeg-static'

const fonts = fileURLToPath(new URL('./fonts/', import.meta.url))
const dimensions = { '16:9': [1280, 720], '9:16': [720, 1280], '1:1': [720, 720], '4:5': [720, 900] }
const invalid = (message) => Object.assign(new Error(message), { status: 400 })

export function ffmpeg(args, { binary = 'ffmpeg', cwd, allowFailure = false, timeout = 10 * 60 * 1000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, ['-hide_banner', '-nostdin', ...args], { cwd, windowsHide: true })
    let stderr = ''
    const timer = setTimeout(() => { child.kill(); reject(new Error(`Stitch took too long. Try shorter clips.\n${stderr.slice(-2400)}`)) }, timeout)
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-64000) })
    child.stdout.resume()
    child.on('error', (e) => { clearTimeout(timer); reject(e) })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0 || allowFailure) resolve(stderr)
      else reject(new Error(`Stitch failed: ${stderr.slice(-2400)}`))
    })
  })
}

export async function findFfmpeg() {
  try { await ffmpeg(['-version']); return 'ffmpeg' } catch {}
  if (!bundledFfmpeg || !fs.existsSync(bundledFfmpeg)) throw new Error('ffmpeg is missing. Run npm install to install the bundled binary.')
  return bundledFfmpeg
}

const seconds = (value, fallback, name) => {
  if (value == null || value === '') return fallback
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) throw invalid(`${name} must be a positive number or zero.`)
  return n
}

export function stitchOptions({ clips, aspect = '16:9', music } = {}) {
  if (!Array.isArray(clips) || !clips.length || clips.length > 50) throw invalid('Choose between 1 and 50 clips.')
  if (!dimensions[aspect]) throw invalid('Choose 16:9, 9:16, 1:1 or 4:5 for the output aspect.')
  const ordered = clips.map((clip) => {
    const c = typeof clip === 'string' ? { url: clip } : clip
    if (!c || typeof c.url !== 'string' || !c.url.trim()) throw invalid('Each clip needs a URL or file path.')
    const start = seconds(c.start, 0, 'Trim start')
    const end = seconds(c.end, undefined, 'Trim end')
    if (end != null && end <= start) throw invalid('Trim end must come after trim start.')
    return { url: c.url, start, end, caption: String(c.caption || '').slice(0, 2000) }
  })
  let track
  if (music?.url) {
    if (typeof music.url !== 'string') throw invalid('Music needs a URL or file path.')
    const volume = seconds(music.volume, 0.25, 'Music volume')
    if (volume > 2) throw invalid('Music volume must be between 0 and 2.')
    track = { url: music.url, volume, fade: seconds(music.fade, 1, 'Music fade') }
  }
  return { clips: ordered, aspect, music: track }
}

async function localFile(url, dir, name, mediaPath) {
  if (url.startsWith('/media/')) return mediaPath(url)
  if (/^https?:\/\//i.test(url)) {
    const res = await fetch(url, { signal: AbortSignal.timeout(120000) })
    if (!res.ok) throw invalid(`Could not download a clip or music track (${res.status}).`)
    const file = path.join(dir, name)
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()))
    return file
  }
  if (/^\w+:/.test(url) && !/^[a-z]:[\\/]/i.test(url)) throw invalid('Use a local file, /media URL, or http(s) URL.')
  return path.resolve(url)
}

async function inspect(file, binary, timeout) {
  const log = await ffmpeg(['-protocol_whitelist', 'file,pipe', '-i', file], { binary, timeout, allowFailure: true })
  const m = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(log)
  if (!m) throw invalid('Could not read the clip or track duration. Use a supported media file.')
  return { duration: Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]), audio: /Stream #.*Audio:/.test(log), video: /Stream #.*Video:/.test(log) }
}

function captionFile(text, width, height) {
  const literal = text.replace(/\\/g, '＼').replace(/\{/g, '｛').replace(/\}/g, '｝').replace(/\r?\n/g, '\\N')
  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans,${Math.round(width / 24)},&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,40,40,${Math.round(height / 16)},1
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
  const [width, height] = dimensions[opts.aspect]
  fs.copyFileSync(path.join(fonts, 'NotoSans-Regular.ttf'), path.join(dir, 'NotoSans-Regular.ttf'))
  let duration = 0
  for (const [i, clip] of opts.clips.entries()) {
    const file = await localFile(clip.url, dir, `input-${i}`, mediaPath)
    const info = await inspect(file, binary, timeout)
    if (!info.video) throw invalid(`Clip ${i + 1} has no video.`)
    if (clip.start >= info.duration || (clip.end != null && clip.end > info.duration + 0.05)) throw invalid(`Clip ${i + 1} trim is outside its duration (${info.duration}s).`)
    const length = (clip.end ?? info.duration) - clip.start
    // Round every segment to whole frames; the soundtrack must match the joined video.
    const frames = Math.max(1, Math.round(length * 30))
    duration += frames / 30
    const args = ['-y', '-protocol_whitelist', 'file,pipe', '-ss', String(clip.start), '-i', file]
    if (!info.audio) args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo')
    let video = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration=1`
    if (clip.caption) {
      fs.writeFileSync(path.join(dir, `caption-${i}.ass`), captionFile(clip.caption, width, height))
      video += `,ass=filename=caption-${i}.ass:fontsdir=.`
    }
    args.push('-map', '0:v:0', '-map', info.audio ? '0:a:0' : '1:a:0', '-vf', video,
      '-af', 'aresample=48000,apad', '-t', String(frames / 30), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-ac', '2', `clip-${i}.mp4`)
    onProgress(`Encode clip ${i + 1}`)
    await ffmpeg(args, { binary, timeout, cwd: dir })
  }
  fs.writeFileSync(path.join(dir, 'clips.txt'), opts.clips.map((_, i) => `file 'clip-${i}.mp4'`).join('\n'))
  const args = ['-y', '-f', 'concat', '-safe', '1', '-i', 'clips.txt']
  if (opts.music) {
    const file = await localFile(opts.music.url, dir, 'music-input', mediaPath)
    const track = await inspect(file, binary, timeout)
    if (!track.audio || track.duration <= 0) throw invalid('The music track has no playable audio.')
    fs.copyFileSync(file, path.join(dir, 'music-source'))
    // A finite playlist avoids ffmpeg 6's looped-input shutdown hang on Apple Silicon.
    fs.writeFileSync(path.join(dir, 'music.txt'), Array.from({ length: Math.ceil(duration / track.duration) }, () => "file 'music-source'").join('\n'))
    const fade = Math.min(opts.music.fade, duration / 2)
    args.push('-f', 'concat', '-safe', '1', '-i', 'music.txt',
      '-filter_complex', `[1:a]aresample=48000,volume=${opts.music.volume},atrim=duration=${duration},afade=t=in:d=${fade},afade=t=out:st=${duration - fade}:d=${fade}[music];[0:a][music]amix=inputs=2:duration=first:normalize=0[audio]`,
      '-map', '0:v:0', '-map', '[audio]')
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

// Long video chains (shared/longVideo.js): read a clip's frame rate and frame count, cut chunks by frame
// number, and join the rendered chunks over their overlap.
export async function probeVideo(file, { binary, timeout } = {}) {
  binary ||= await findFfmpeg()
  const log = await ffmpeg(['-i', file, '-map', '0:v:0', '-c', 'copy', '-f', 'null', '-'], { binary, timeout, allowFailure: true })
  const stream = /Stream #.*Video:.*/.exec(log)?.[0] || ''
  const size = /, (\d{2,5})x(\d{2,5})/.exec(stream)
  const fps = Number(/([\d.]+) fps/.exec(stream)?.[1] || /([\d.]+) tbr/.exec(stream)?.[1])
  const frames = Number([...log.matchAll(/frame=\s*(\d+)/g)].pop()?.[1])
  if (!size || !(fps > 0)) throw invalid('Could not read the clip frame rate. Use a supported video file.')
  return { width: Number(size[1]), height: Number(size[2]), fps, frames: frames || 0, audio: /Stream #.*Audio:/.test(log) }
}

const chunkVideo = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p']

// The trimmed part of a clip at a constant frame rate, so chunks cut by frame number line up.
export async function normalizeClip(file, out, { start = 0, duration, fps, binary, timeout } = {}) {
  binary ||= await findFfmpeg()
  const info = await probeVideo(file, { binary, timeout })
  const args = ['-y', '-ss', String(start), ...(duration ? ['-t', String(duration)] : []), '-i', file,
    '-map', '0:v:0', ...(info.audio ? ['-map', '0:a:0', '-c:a', 'aac', '-ar', '48000', '-ac', '2'] : []),
    '-vf', `fps=${fps},scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=1`, ...chunkVideo, out]
  await ffmpeg(args, { binary, timeout })
  return { ...(await probeVideo(out, { binary, timeout })), fps, path: out }
}

// `sound` keeps the clip's sound over the same frames, when it has any.
export async function cutFrames(file, out, { from, count, fps, sound = false, binary, timeout } = {}) {
  binary ||= await findFfmpeg()
  const audio = sound && (await probeVideo(file, { binary, timeout })).audio
  await ffmpeg(['-y', '-i', file, '-map', '0:v:0', '-vf', `trim=start_frame=${from}:end_frame=${from + count},setpts=PTS-STARTPTS`, '-r', String(fps), ...chunkVideo,
    ...(audio ? ['-map', '0:a:0', '-af', `atrim=start=${from / fps}:end=${(from + count) / fps},asetpts=PTS-STARTPTS`, '-c:a', 'aac', '-ar', '48000', '-ac', '2'] : ['-an']), out], { binary, timeout })
  return out
}

// Joins chunks whose first `overlap` frames repeat the end of the chunk before. With `blend` the overlap
// crossfades; without it those frames drop. `audio` is a file to lay under the whole video, or 'chunks'
// to join each chunk's own sound with its overlap dropped. `duration` trims the end.
export async function joinChunks(chunks, out, { fps, blend = false, audio, duration, binary, timeout } = {}) {
  binary ||= await findFfmpeg()
  if (!chunks.length) throw invalid('Nothing to join.')
  if (blend && audio === 'chunks') throw invalid('A blended join takes its sound from one file.')
  const infos = []
  for (const c of chunks) infos.push(await probeVideo(c.file, { binary, timeout }))
  const { width, height } = infos[0]
  const args = ['-y']
  for (const c of chunks) args.push('-i', c.file)
  const filters = chunks.map((c, i) => `[${i}:v]fps=${fps},scale=${width}:${height},setsar=1,format=yuv420p,settb=AVTB${blend ? '' : `,trim=start_frame=${c.overlap},setpts=PTS-STARTPTS`}[v${i}]`)
  let length = 0
  if (blend) {
    let last = 'v0'
    length = infos[0].frames / fps
    chunks.slice(1).forEach((c, k) => {
      const i = k + 1
      const fade = Math.max(1, c.overlap) / fps
      filters.push(`[${last}][v${i}]xfade=transition=fade:duration=${fade}:offset=${Math.max(0, length - fade)}[x${i}]`)
      length += infos[i].frames / fps - fade
      last = `x${i}`
    })
    filters.push(`[${last}]null[video]`)
  } else {
    length = chunks.reduce((sum, c, i) => sum + (infos[i].frames - c.overlap) / fps, 0)
    if (audio === 'chunks') {
      chunks.forEach((c, i) => {
        filters.push(infos[i].audio ? `[${i}:a]aresample=48000,atrim=start=${c.overlap / fps}:end=${infos[i].frames / fps},asetpts=PTS-STARTPTS,apad=whole_dur=${(infos[i].frames - c.overlap) / fps}[a${i}]`
          : `anullsrc=r=48000:cl=stereo,atrim=duration=${(infos[i].frames - c.overlap) / fps}[a${i}]`)
      })
      filters.push(`${chunks.map((_, i) => `[v${i}][a${i}]`).join('')}concat=n=${chunks.length}:v=1:a=1[video][sound]`)
    } else filters.push(`${chunks.map((_, i) => `[v${i}]`).join('')}concat=n=${chunks.length}:v=1:a=0[video]`)
  }
  const total = duration ? Math.min(duration, length) : length
  const sound = audio && audio !== 'chunks' ? chunks.length : null
  if (sound != null) args.push('-i', audio)
  args.push('-filter_complex', filters.join(';'), '-map', '[video]')
  if (audio === 'chunks') args.push('-map', '[sound]')
  else if (sound != null) args.push('-map', `${sound}:a:0?`)
  args.push('-t', String(total), ...chunkVideo.slice(0, 4), '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', out)
  await ffmpeg(args, { binary, timeout })
  return { path: out, duration: total, width, height }
}
