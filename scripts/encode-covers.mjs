import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const root = fileURLToPath(new URL('../', import.meta.url))
const source = process.argv[2]
if (!source) throw new Error('Usage: node scripts/encode-covers.mjs <source folder>')
const output = join(root, 'public/art/video')
let bundledFfmpeg
try { bundledFfmpeg = createRequire(import.meta.url)('ffmpeg-static') } catch {}
const ffmpeg = process.env.FFMPEG_PATH || bundledFfmpeg || 'ffmpeg'
const ffprobe = process.env.FFPROBE_PATH || 'ffprobe'
const limit = 600000
// Clips whose 1.5 second frame is mid-motion take their poster from a steadier moment.
const posterAt = { extras: 1, 'fashion-factory': 4.2, 'swap-element': 3.4, transition: 3.4 }
mkdirSync(output, { recursive: true })

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
  if (result.error || result.status !== 0) throw new Error(`${command}: ${result.error?.message || result.stderr}`)
  return result.stdout
}

for (const file of readdirSync(resolve(source)).filter((file) => !file.startsWith('._') && file.endsWith('.mp4')).sort()) {
  const id = basename(file, '.mp4')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`Invalid cover id: ${id}`)
  const input = join(resolve(source), file)
  const metadata = JSON.parse(run(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,duration:format=duration', '-of', 'json', input]))
  const stream = metadata.streams[0]
  const duration = Number(stream.duration || metadata.format.duration)
  if (!Number.isFinite(duration) || duration < 2) throw new Error(`Cover must be at least 2 seconds: ${file}`)
  const [width, height] = stream.width >= stream.height ? [640, 360] : [360, 640]
  const seconds = Math.floor(duration * 24) / 24
  const scale = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1,fps=24,format=yuv420p`
  // Blend the final half second into a frozen opening frame, without extending the clip.
  const filter = `[0:v]${scale},trim=duration=${seconds},setpts=PTS-STARTPTS,split[body][first];[first]trim=end_frame=1,loop=loop=-1:size=1:start=0,trim=duration=0.5,setpts=PTS-STARTPTS[opening];[body][opening]xfade=transition=fade:duration=0.5:offset=${seconds - 0.5},trim=duration=${seconds},format=yuv420p[out]`
  const video = join(output, `${id}.mp4`)
  let quality = 28
  for (; quality <= 40; quality += 2) {
    run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-filter_complex_threads', '1', '-i', input,
      '-filter_complex', filter, '-map', '[out]', '-an', '-c:v', 'libx264', '-threads', '2',
      '-preset', 'slow', '-crf', String(quality), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', video])
    if (statSync(video).size < limit) break
  }
  if (statSync(video).size >= limit) throw new Error(`Cover exceeds ${limit} bytes even at crf 40: ${id}`)
  const poster = join(output, `${id}.webp`)
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(posterAt[id] ?? 1.5), '-i', video,
    '-frames:v', '1', '-c:v', 'libwebp', '-threads', '1', '-quality', '78', poster])
  if (statSync(poster).size > 80000) throw new Error(`Poster exceeds 80000 bytes: ${id}`)
  console.log(`${id}: ${width}x${height}, ${seconds.toFixed(2)}s, crf ${quality}, mp4 ${statSync(video).size} bytes, poster ${statSync(poster).size} bytes`)
}

const files = readdirSync(output)
const ids = files.filter((file) => !file.startsWith('._') && file.endsWith('.mp4')).map((file) => basename(file, '.mp4')).sort()
for (const id of ids) if (!files.includes(`${id}.webp`)) throw new Error(`Missing poster: ${id}`)
writeFileSync(join(output, 'index.json'), `${JSON.stringify(ids, null, 2)}\n`)
console.log(`Video index written: ${ids.length} covers`)
