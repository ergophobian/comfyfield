// A slow field of ASCII characters drawn on one canvas, for the app background.
// Each frame computes a density level per cell from drifting value noise and redraws only
// the cells whose level changed, from a glyph atlas, and it updates every other row in turn,
// so a frame stays well under 2 ms.

const RAMP = ' .,:-=+*#'

// Fixed seed, so the field looks the same on every load and in screenshots.
const perm = new Uint8Array(512)
const vals = new Float32Array(256)
{
  let s = 1337
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  const p = [...Array(256).keys()]
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]] }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  for (let i = 0; i < 256; i++) vals[i] = rand()
}

// x and y stay positive, so `| 0` floors.
function noise(x, y) {
  const xi = x | 0, yi = y | 0
  const xf = x - xi, yf = y - yi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = perm[(xi & 255) + perm[yi & 255]], b = perm[((xi + 1) & 255) + perm[yi & 255]]
  const c = perm[(xi & 255) + perm[(yi + 1) & 255]], d = perm[((xi + 1) & 255) + perm[(yi + 1) & 255]]
  const top = vals[a] + (vals[b] - vals[a]) * u
  const bottom = vals[c] + (vals[d] - vals[c]) * u
  return top + (bottom - top) * v
}

// Reads the --ascii-* tokens from :root, so the field follows the theme like the CSS does.
export function readTokens(el = document.documentElement) {
  const css = getComputedStyle(el)
  const get = (name) => css.getPropertyValue(name).trim()
  const ms = (value) => (value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000)
  return {
    ink: get('--ascii-ink'),
    font: get('--ascii-font'),
    type: parseFloat(get('--ascii-type')),
    cellW: parseFloat(get('--ascii-cell-w')),
    cellH: parseFloat(get('--ascii-cell-h')),
    frame: ms(get('--ascii-frame')),
    drift: ms(get('--ascii-drift')),
    floor: parseFloat(get('--ascii-floor')),
  }
}

export function createAsciiField(canvas, tokens) {
  const ctx = canvas.getContext('2d')
  const atlas = document.createElement('canvas')
  let cols = 0, rows = 0, cw = 0, ch = 0, levels = new Uint8Array(0), weight = new Float32Array(0)
  let parity = 0, full = true
  const stats = { frames: 0, total: 0, max: 0, last: 0, full: 0 }

  function resize(width, height, dpr) {
    cw = Math.max(1, Math.round(tokens.cellW * dpr))
    ch = Math.max(1, Math.round(tokens.cellH * dpr))
    canvas.width = Math.ceil(width * dpr)
    canvas.height = Math.ceil(height * dpr)
    cols = Math.ceil(canvas.width / cw)
    rows = Math.ceil(canvas.height / ch)
    levels = new Uint8Array(cols * rows)
    // Denser toward the bottom, like the sky's clouds, so text up top stays clear.
    weight = new Float32Array(rows)
    for (let y = 0; y < rows; y++) { const k = y / Math.max(1, rows - 1); weight[y] = tokens.floor + (1 - tokens.floor) * k * k }
    atlas.width = cw * RAMP.length
    atlas.height = ch
    const a = atlas.getContext('2d')
    a.clearRect(0, 0, atlas.width, atlas.height)
    a.font = `${tokens.type * dpr}px ${tokens.font}`
    a.textAlign = 'center'
    a.textBaseline = 'middle'
    a.fillStyle = tokens.ink
    for (let i = 1; i < RAMP.length; i++) {
      a.globalAlpha = 0.4 + 0.6 * (i / (RAMP.length - 1))
      a.fillText(RAMP[i], i * cw + cw / 2, ch / 2)
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 255 marks every cell dirty, so the next frame paints every row of the field.
    levels.fill(255)
    full = true
  }

  function draw(ms) {
    const start = performance.now()
    const t = ms / tokens.drift
    const max = RAMP.length - 1
    // Two octaves drifting in different directions; cell coordinates are in CSS cells, not pixels.
    const ax = t, ay = t * 0.35, bx = t * 0.2, by = t * 0.9
    const whole = full
    // At the drift speed a row changes slowly, so half the rows per frame is enough.
    const step = whole ? 1 : 2
    const first = whole ? 0 : parity
    parity ^= 1
    full = false
    let changed = 0
    for (let y = first; y < rows; y += step) {
      const w = weight[y]
      const ny = y * 0.11
      for (let x = 0; x < cols; x++) {
        const nx = x * 0.06
        const n = noise(nx + ax, ny + ay) * 0.65 + noise(nx * 2.3 + bx, ny * 2.3 + by) * 0.35
        let level = Math.round(Math.max(0, (n - 0.36) * 2.6) * w * max)
        if (level > max) level = max
        const i = y * cols + x
        const was = levels[i]
        if (was === level) continue
        levels[i] = level
        changed++
        // 255 follows a resize, which already cleared the canvas.
        if (was !== 255) ctx.clearRect(x * cw, y * ch, cw, ch)
        if (level) ctx.drawImage(atlas, level * cw, 0, cw, ch, x * cw, y * ch, cw, ch)
      }
    }
    const spent = performance.now() - start
    stats.frames++
    stats.total += spent
    stats.last = spent
    if (whole) stats.full = spent
    else if (spent > stats.max) stats.max = spent
    return changed
  }

  return { resize, draw, stats, size: () => ({ cols, rows }) }
}
