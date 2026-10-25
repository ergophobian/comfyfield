import fs from 'node:fs'
import path from 'node:path'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'

export const stitchDownloadLimit = 200 * 1024 * 1024
export const stitchDownloadTimeout = 30_000
const invalid = (text) => Object.assign(new Error(text), { status: 400 })

export function appMediaFile(url, mediaPath) {
  if (!/^\/media\/[^/\\?#%:]+$/.test(url) || ['.', '..'].includes(url.slice(7))) throw invalid('Choose an uploaded or generated /media file, or an http(s) URL.')
  const file = mediaPath(url)
  const real = fs.realpathSync(file)
  if (path.dirname(real) !== fs.realpathSync(path.dirname(mediaPath('sentinel')))) throw invalid('Media must stay inside the app media folder.')
  return real
}

export async function stitchMediaFile(url, dir, name, mediaPath, { limit = stitchDownloadLimit, timeout = stitchDownloadTimeout } = {}) {
  if (url.startsWith('/media/')) return appMediaFile(url, mediaPath)
  if (!/^https?:\/\//i.test(url)) throw invalid('Choose an uploaded or generated /media file, or an http(s) URL.')
  const signal = AbortSignal.timeout(timeout)
  const res = await fetch(url, { signal })
  if (!res.ok || Number(res.headers.get('content-length')) > limit) {
    await res.body?.cancel()
    throw invalid(res.ok ? 'Media download exceeds the size limit.' : `Could not download media (${res.status}).`)
  }
  let size = 0
  const cap = new Transform({ transform(chunk, encoding, next) {
    size += chunk.length
    next(size > limit ? invalid('Media download exceeds the size limit.') : null, chunk)
  } })
  const file = path.join(dir, name)
  try {
    if (!res.body) throw invalid('Media download was empty.')
    await pipeline(Readable.fromWeb(res.body), cap, fs.createWriteStream(file, { flags: 'wx' }), { signal })
    return file
  } catch (error) {
    await fs.promises.unlink(file).catch(() => {})
    throw error
  }
}
