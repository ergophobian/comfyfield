import { imageLimit, videoLimit, videoTypes } from '../shared/widgetInputs.js'

const imageTypes = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' }
const audioTypes = { 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/flac': 'flac' }
const fail = (message, status) => { throw Object.assign(new Error(message), { status }) }

async function read(req, limit) {
  if (Number(req.headers['content-length']) > limit) fail('That file is too large.', 413)
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) fail('That file is too large.', 413)
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function upload(req, saveMedia) {
  let mime = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
  let buf
  if (mime === 'application/json') {
    let json
    try { json = JSON.parse((await read(req, Math.ceil(videoLimit * 4 / 3) + 1024)).toString('utf8') || '{}') }
    catch (e) { if (e.status) throw e; fail('Invalid upload data.', 400) }
    const data = json.dataUrl || json.data || ''
    if (typeof data !== 'string') fail('Invalid upload data.', 400)
    const match = /^data:([^;,]+);base64,/.exec(data)
    mime = (match ? match[1] : json.type || 'image/png').toLowerCase()
    buf = Buffer.from(match ? data.slice(match[0].length) : data, 'base64')
  } else {
    if (!imageTypes[mime] && !videoTypes[mime] && !audioTypes[mime]) fail('Attach an image, video or audio file.', 415)
    buf = await read(req, videoTypes[mime] ? videoLimit : imageLimit)
  }
  const ext = imageTypes[mime] || videoTypes[mime] || audioTypes[mime]
  if (!ext) fail('Attach an image, video or audio file.', 415)
  if (!buf.length) fail('No file received.', 400)
  const limit = videoTypes[mime] ? videoLimit : imageLimit
  if (buf.length > limit) fail(`That file is too large (${videoTypes[mime] ? 200 : 40} MB max).`, 413)
  return { url: saveMedia(buf, ext).url, type: mime }
}
