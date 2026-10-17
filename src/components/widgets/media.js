import { imageLimit, videoLimit, videoTypes } from '../../../shared/widgetInputs.js'

export async function uploadMedia(file) {
  const video = file.type.startsWith('video/')
  if (video && !videoTypes[file.type]) throw new Error('Choose an mp4, webm or mov video.')
  if (file.size > (video ? videoLimit : imageLimit)) throw new Error(`Choose a file under ${video ? 200 : 40} MB.`)
  const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': file.type }, body: file })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`)
  return { url: data.url, name: file.name, type: data.type }
}

export const canvasBlob = (canvas) => new Promise((resolve, reject) => canvas.toBlob((blob) => {
  if (blob) resolve(blob)
  else reject(new Error('Could not export this image.'))
}, 'image/png'))

export const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
