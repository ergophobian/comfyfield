import { createRequire } from 'node:module'
import { execFile } from 'node:child_process'

const require = createRequire(import.meta.url)
export const ffmpegFix = 'Stitch features are disabled until ffmpeg is available. ffmpeg is missing or cannot run. Run npm rebuild ffmpeg-static to download it again, or install ffmpeg and add it to your system path.'

export function probeFfmpeg(binary) {
  return new Promise((resolve) => {
    execFile(binary, ['-version'], { timeout: 5000, windowsHide: true }, (error) => resolve(!error))
  })
}

export async function findFfmpeg({ probe = probeFfmpeg, bundled = () => require('ffmpeg-static') } = {}) {
  if (await probe('ffmpeg')) return 'ffmpeg'
  let binary
  try { binary = bundled() } catch {}
  if (binary && await probe(binary)) return binary
  throw new Error(ffmpegFix)
}
