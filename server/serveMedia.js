import fs from 'node:fs'

// Byte ranges let the browser seek uploaded videos without downloading them again.
export function serveMedia(req, res, file, type) {
  const size = fs.statSync(file).size
  res.setHeader('Content-Type', type)
  res.setHeader('Accept-Ranges', 'bytes')
  const range = req.headers.range
  let start = 0
  let end = size - 1
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (match && (match[1] || match[2])) {
      start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]))
      end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
    }
    if (!match || !(match[1] || match[2]) || start > end || start >= size) {
      res.statusCode = 416
      res.setHeader('Content-Range', `bytes */${size}`)
      return res.end()
    }
    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
  }
  res.setHeader('Content-Length', Math.max(0, end - start + 1))
  if (req.method === 'HEAD' || size === 0) return res.end()
  fs.createReadStream(file, { start, end }).pipe(res)
}
