export const videoTypes = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' }
export const videoLimit = 200 * 1024 * 1024
export const imageLimit = 40 * 1024 * 1024
export const widgetTypes = ['mask', 'face', 'video', 'crop']
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

export function aspectBox(aspect, sourceRatio = '1:1') {
  if (aspect === 'free') return { x: 0, y: 0, width: 1, height: 1 }
  const [w, h] = aspect.split(':').map(Number)
  const [sw, sh] = sourceRatio.split(':').map(Number)
  const relative = (w / h) / (sw / sh)
  const width = Math.min(1, relative)
  const height = Math.min(1, 1 / relative)
  return { x: (1 - width) / 2, y: (1 - height) / 2, width, height }
}

export function fitBox(box) {
  const width = clamp(box.width, 0.01, 1)
  const height = clamp(box.height, 0.01, 1)
  return { x: clamp(box.x, 0, 1 - width), y: clamp(box.y, 0, 1 - height), width, height }
}

export function trimRange(start, end, duration) {
  const last = Math.max(0, duration)
  const gap = Math.min(0.01, last)
  const from = clamp(start, 0, Math.max(0, last - gap))
  return { start: from, end: clamp(end, from + gap, last) }
}

export function widgetReady(type, value) {
  if (!value?.url) return false
  if (type === 'mask') return Boolean(value.maskUrl)
  if (type === 'face') return Boolean(value.faceUrl || value.characterId)
  if (type === 'video') return Boolean(value.duration > 0 && value.trim?.end > value.trim?.start)
  return Boolean(value.box)
}

// Stable, provider-neutral values for format runners and Flow model inputs.
export function widgetOptions(type, value) {
  if (type === 'mask') return { image: value.url, mask: value.maskUrl }
  if (type === 'face') return { image: value.faceUrl || value.url, face: value }
  if (type === 'video') return { video: value.url, trim: value.trim, poster: value.posterUrl, posterTime: value.posterTime }
  return { image: value.url, crop: value.box, cropAspect: value.aspect }
}
