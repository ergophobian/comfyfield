const hex = (n) => n.toString(16).padStart(2, '0')

// Dominant colors of an image, bucketed coarsely so near shades merge. Skips near white, near black and grey.
export async function paletteFrom(src, n = 4) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })
  const c = document.createElement('canvas')
  c.width = c.height = 48
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, 48, 48)
  const { data } = ctx.getImageData(0, 0, 48, 48)
  const bins = new Map()
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
    if (a < 200) continue
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max > 240 && min > 230) continue
    if (max < 25 || max - min < 22) continue
    const k = `${r >> 5}-${g >> 5}-${b >> 5}`
    const e = bins.get(k) || { n: 0, r: 0, g: 0, b: 0 }
    e.n++; e.r += r; e.g += g; e.b += b
    bins.set(k, e)
  }
  return [...bins.values()].sort((x, y) => y.n - x.n).slice(0, n)
    .map((e) => `#${hex(Math.round(e.r / e.n))}${hex(Math.round(e.g / e.n))}${hex(Math.round(e.b / e.n))}`)
}
