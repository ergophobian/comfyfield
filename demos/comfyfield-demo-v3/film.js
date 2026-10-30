// ComfyField — a 30 s demo. A field of live tiles (the app's tools), the open models that drive them, the
// formats, then the turn to paper: a custom skill for motion graphics, with the film it made.
// 120 bpm, 4/4: one bar = 2 s, one beat = 0.5 s. Every cut is on a bar line.
const W = 1920, H = 1080
// v2: faster. 6/8 at dotted-quarter 100 — the taco film's son jarocho, quicker: one bar = 1.2 s, one eighth = 0.2 s,
// one big beat = 0.6 s. Every cut sits on a bar line; every hit on an eighth.
const BAR = 1.2, E8 = 0.2, BEAT = 0.6, BARS = (b) => b * BAR, at8 = (b, k = 0) => b * BAR + k * E8
// the timeline, in bars (25 bars = 30 s)
const T = { spark: [0, 2], field: [2, 5], slots: [5, 7], cinema: [7, 9], montage: [9, 11], formats: [11, 14], paper: [14, 19], converge: [19, 21], end: [21, 25] }
const span = (id) => ({ start: BARS(T[id][0]), end: BARS(T[id][1]) })
K.setup({ W, H, fps: 30, duration: 30, paper: '#eef1ff', seed: 3 })
K.FONT = '"Inter", system-ui, sans-serif'
// the paper section's hand face: start loading it now, so the player's wait for document.fonts.ready covers it
if (document.fonts) for (const f of ['400 44px "Delius"', '800 96px "Inter"', '600 44px "Inter"']) document.fonts.load(f).catch(() => {})
const B = {
  ink: '#0f1222', ink2: '#4a4f66', blue: '#2f3fe8', blueHi: '#4a5bff', blueLo: '#2230c9', mist0: '#eef1ff', mist1: '#d9e0ff',
  glass: 'rgba(255,255,255,0.72)', line: 'rgba(47,63,232,0.18)', violet: '#8b5cf6', paper: '#efe8da', paperInk: '#2b2420',
}
const LOGO = 'assets/logo.svg'
const mclip = {}
const MONTAGE = ['ads', 'click-to-ad', 'color-palette', 'create-video', 'edit-video', 'enhance', 'headshot', 'inpaint', 'marketing', 'product-ad', 'transition']
const TILES = ['cinema-studio', 'product-shot', 'ai-influencer', 'roller-coaster', 'motion-control', 'turn-to-sand', 'relight', 'try-on', 'lipsync', 'character-scene', 'photodump', 'fashion-factory', '3d-studio', 'music', 'sketch-to-image', 'expand', 'video-upscale', 'effects', 'mixed-media', 'games', 'moodboard', 'face', 'cinematic-cameras', 'explainer']
const TILE_NAME = { 'cinema-studio': 'Cinema', 'product-shot': 'Product shot', 'ai-influencer': 'AI influencer', 'roller-coaster': 'Effects', 'motion-control': 'Motion control', 'turn-to-sand': 'Turn to sand', relight: 'Relight', 'try-on': 'Try-on', lipsync: 'Lipsync', 'character-scene': 'Character', photodump: 'Photodump', 'fashion-factory': 'Fashion', '3d-studio': '3D studio', music: 'Music video', 'sketch-to-image': 'Sketch to image', expand: 'Expand', 'video-upscale': 'Upscale', effects: 'Effects', 'mixed-media': 'Mixed media', games: 'Games', moodboard: 'Moodboard', face: 'Face swap', 'cinematic-cameras': 'Camera moves', explainer: 'Explainer' }
const clip = {}
for (const t of TILES) clip[t] = K.footage('frames/t-' + t, { fps: 30, count: 151 })
const shots = ['shot1', 'shot2', 'shot3'].map((s) => K.footage('frames/' + s, { fps: 30, count: 151 }))
const seed = K.footage('frames/seedance', { fps: 30, count: 240 })
const taco = K.footage('frames/taco', { fps: 30, count: 1125 })
for (const m of MONTAGE) mclip[m] = K.footage('frames/t-' + m, { fps: 30, count: 151 })
K.film.preload = [LOGO, 'assets/ui-composer.webp']

// ---------- type and glass
function txt(ctx, s, x, y, o = {}) {
  ctx.save()
  ctx.font = `${o.weight || 700} ${o.size || 64}px ${o.font || '"Inter", sans-serif'}`
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (o.track ?? -0.02) * (o.size || 64) + 'px'
  ctx.fillStyle = o.color || B.ink
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic'
  ctx.globalAlpha *= o.alpha ?? 1
  ctx.fillText(s, x, y)
  const w = ctx.measureText(s).width
  ctx.restore()
  return w
}
// a headline whose words rise into place one after another (masked), on the beat
function rise(ctx, t, words, x, y, start, o = {}) {
  const size = o.size || 96, gap = o.gap ?? size * 0.28, step = o.step ?? 0.12
  ctx.save(); ctx.font = `${o.weight || 800} ${size}px "Inter", sans-serif`
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.035 * size + 'px'
  const widths = words.map((w) => ctx.measureText(w).width)
  const total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1)
  let cx = o.align === 'center' ? x - total / 2 : x
  const out = o.out != null ? K.at(t, o.out, 0.35, 'in') : 0
  words.forEach((w, i) => {
    const p = K.spring(t - start - i * step, 2.2, 0.75)
    ctx.save()
    ctx.beginPath(); ctx.rect(cx - 10, y - size * 1.05, widths[i] + 30, size * 1.35); ctx.clip()
    ctx.fillStyle = o.colors?.[i] || o.color || B.ink
    ctx.globalAlpha *= K.clamp(p * 1.5) * (1 - out) // relative, so a scene's own fade-out reaches its headline
    ctx.fillText(w, cx, y + (1 - p) * size * 1.1 - out * size * 0.3)
    ctx.restore()
    cx += widths[i] + gap
  })
  ctx.restore()
  return total
}
function glass(ctx, x, y, w, h, r = 28, o = {}) {
  ctx.save()
  ctx.shadowColor = 'rgba(34,48,201,0.18)'; ctx.shadowBlur = o.blur ?? 40; ctx.shadowOffsetY = o.dy ?? 14
  ctx.fillStyle = o.fill || B.glass
  rr(ctx, x, y, w, h, r); ctx.fill()
  ctx.restore()
  ctx.save(); ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.5
  rr(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); ctx.stroke(); ctx.restore()
}
function pill(ctx, s, x, y, o = {}) {
  ctx.save()
  const size = o.size || 26
  ctx.font = `600 ${size}px "Inter", sans-serif`
  const w = ctx.measureText(s).width + size * 1.4 + (o.dot ? size * 0.9 : 0), h = size * 1.9
  const a = o.alpha ?? 1, sc = o.scale ?? 1
  ctx.globalAlpha *= a
  ctx.translate(x, y); ctx.scale(sc, sc)
  const x0 = o.align === 'left' ? 0 : -w / 2
  ctx.shadowColor = 'rgba(15,18,34,0.18)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
  if (o.blue) { g.addColorStop(0, '#4554f5'); g.addColorStop(0.6, B.blue); g.addColorStop(1, '#2a37d6') } else if (o.solid) { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#f4f6ff') } else { g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(244,246,255,0.92)') }
  ctx.fillStyle = g
  rr(ctx, x0, -h / 2, w, h, h / 2); ctx.fill()
  ctx.shadowColor = 'transparent'
  if (o.dot) { ctx.fillStyle = o.blue ? '#fff' : B.blue; ctx.beginPath(); ctx.arc(x0 + size * 0.95, 0, size * 0.22, 0, K.TAU); ctx.fill() }
  ctx.fillStyle = o.blue ? '#fff' : B.ink; ctx.textBaseline = 'middle'
  ctx.fillText(s, x0 + size * 0.7 + (o.dot ? size * 0.9 : 0), 1)
  ctx.restore()
  return w
}
function mist(ctx, o = {}) {
  const g = ctx.createLinearGradient(0, 0, W * 0.4, H)
  g.addColorStop(0, o.a || B.mist0); g.addColorStop(1, o.b || B.mist1)
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  // two slow glows
  for (const [x, y, r, c] of o.glows || [[W * 0.8, H * 0.15, 700, 'rgba(74,91,255,0.20)'], [W * 0.1, H * 0.95, 600, 'rgba(139,92,246,0.12)']]) {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H)
  }
}
// a rounded rectangle with true arcs (K.rect cuts its corners into 6 straight segments, which shows when big)
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath(); ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}
// the logo mark, as assets/logo.svg: the blue rounded square (rx 10 of 32) and its white strokes.
// draw: 0..1 how much of the strokes is drawn (nothing at all at 0 — never a stray round-cap dot).
// o.glow: [a, b, c] 0..1, a soft light running along each stroke (the logo bells)
const MARK_PATHS = [new Path2D('M9 21c0-6 4-10 9-10 2 0 4 .6 5 1.6'), new Path2D('M23 11v10'), new Path2D('M16 16h7')]
function mark(ctx, x, y, s, draw = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 32, s / 32)
  if (o.square !== false) {
    const g = ctx.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, '#4a5bff'); g.addColorStop(1, '#2230c9')
    ctx.fillStyle = g; rr(ctx, 0, 0, 32, 32, 10); ctx.fill()
  }
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  const len = [24.5, 10, 7], total = len[0] + len[1] + len[2]
  const seg = (i) => K.clamp((draw * total - len.slice(0, i).reduce((a, b) => a + b, 0)) / len[i])
  for (let i = 0; i < 3; i++) {
    const p = seg(i)
    if (p <= 0.001) continue
    ctx.setLineDash(p >= 1 ? [] : [len[i] * p, 100]); ctx.stroke(MARK_PATHS[i])
  }
  ctx.setLineDash([])
  if (o.glow) o.glow.forEach((gv, i) => {
    if (gv <= 0.01 || seg(i) <= 0) return
    ctx.save(); ctx.globalAlpha *= gv; ctx.shadowColor = 'rgba(200,215,255,1)'; ctx.shadowBlur = 14 * s / 32 * 0.12
    ctx.lineWidth = 3 + 1.2 * gv; ctx.strokeStyle = '#ffffff'; ctx.stroke(MARK_PATHS[i]); ctx.restore()
  })
  ctx.restore()
}
// the three logo bells (score.js) light the three strokes in turn
const markGlow = (t, times) => times.map((x) => K.pulse(t, [x], 0.45))

// ---------- v2 kinetic helpers
// a word or line that punches in on its beat: scale overshoot, a quick blur-in, then rock-steady
function slam(ctx, t, text, x, y, start, o = {}) {
  const size = o.size || 140, p = K.spring(t - start, 3.2, 0.55)
  if (p <= 0.001) return 0
  const out = o.out != null ? K.at(t, o.out, 0.18, 'in') : 0
  ctx.save()
  ctx.font = `${o.weight || 800} ${size}px "Inter", sans-serif`
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.04 * size + 'px'
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic'
  const w = ctx.measureText(text).width
  const ax = o.align === 'center' ? x : x + w / 2, ay = y - size * 0.35
  const sc = K.lerp(o.from ?? 1.6, 1, Math.min(1.2, p)) * (1 - out * 0.3)
  ctx.translate(ax, ay); ctx.scale(sc, sc); ctx.translate(-ax, -ay)
  ctx.globalAlpha = K.clamp(p * 2.5) * (1 - out)
  const blur = (1 - K.clamp(p * 1.6)) * 14
  if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`
  ctx.fillStyle = o.color || B.ink
  ctx.fillText(text, x, y)
  ctx.restore()
  return w
}
// a flash of light across the frame on a hit (0 → peak → 0 in `dur`)
function flash(ctx, t, times, o = {}) {
  const v = K.pulse(t, times, o.dur || 0.25)
  if (v <= 0.002) return
  ctx.save(); ctx.globalCompositeOperation = o.mode || 'screen'; ctx.globalAlpha = v * (o.amount ?? 0.6)
  ctx.fillStyle = o.color || '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.restore()
}
// speed lines streaking from a point (for whips and dives)
function streaks(ctx, t, cx, cy, amount, seed = 1, o = {}) {
  if (amount <= 0.01) return
  const r = K.rng('streaks' + seed)
  ctx.save(); ctx.lineCap = 'round'
  for (let i = 0; i < (o.n || 60); i++) {
    const a = r() * K.TAU, d0 = 200 + r() * 900, ph = (t * (2 + r() * 3) + r()) % 1, d = d0 * (0.4 + ph)
    const len = (60 + r() * 220) * amount
    ctx.strokeStyle = o.color || `rgba(255,255,255,${(0.15 + r() * 0.35) * amount})`; ctx.lineWidth = 1 + r() * 3
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d); ctx.lineTo(cx + Math.cos(a) * (d + len), cy + Math.sin(a) * (d + len)); ctx.stroke()
  }
  ctx.restore()
}
K.film.blur = 6; K.film.shutter = 0.5 // motion blur for renders (6 samples across half a frame); add ?noblur for quick previews
