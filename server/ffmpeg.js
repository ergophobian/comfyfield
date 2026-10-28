import { createRequire } from 'node:module'
import { execFile } from 'node:child_process'

const require = createRequire(import.meta.url)
export const ffmpegFix = 'Stitch features are disabled until ffmpeg is available. ffmpeg is missing or cannot run. Run npm rebuild ffmpeg-static to download it again, or install ffmpeg and add it to your system path.'

export function probeFfmpeg(binary) {
  return new Promise((resolve) => {
    execFile(binary, ['-version'], { timeout: 5000, windowsHide: true }, (error) => resolve(!error))
  })
}

// Captions burn in through the ass filter, which needs libass. Homebrew's ffmpeg 9 is built without it,
// so a system ffmpeg that cannot caption loses to the bundled build, and only wins when nothing else runs.
export function hasCaptions(binary) {
  return new Promise((resolve) => {
    execFile(binary, ['-hide_banner', '-filters'], { timeout: 5000, windowsHide: true }, (error, stdout) => resolve(!error && /^\s*\S*\s+ass\s/m.test(stdout)))
  })
}

export async function findFfmpeg({ probe = probeFfmpeg, bundled = () => require('ffmpeg-static'), captions = hasCaptions } = {}) {
  const found = []
  if (await probe('ffmpeg')) found.push('ffmpeg')
  let binary
  try { binary = bundled() } catch {}
  if (binary && await probe(binary)) found.push(binary)
  for (const candidate of found) if (await captions(candidate)) return candidate
  if (found.length) return found[0]
  throw new Error(ffmpegFix)
}
