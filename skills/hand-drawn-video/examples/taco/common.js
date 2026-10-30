// How this taco was made — the shared film: size, the timeline on the music's grid, the palette, helpers.
// Every scene file reads this; nothing here is per scene.
const W = 1080, H = 1080
const BAR = 1.5          // 6/8 at dotted-quarter = 80: one bar = 1.5 s, one eighth = 0.25 s
const EIGHTH = BAR / 6
const bar = (b) => b * BAR
K.setup({ W, H, fps: 30, duration: bar(25), paper: '#efe8da', seed: 1 })
K.FONT = '"Delius", "Patrick Hand", sans-serif'
K.INK = '#2b2420'

// the timeline: one row per scene. Bars are 1.5 s; every cut sits on a bar line.
const T = {
  hero:      [0, 2],
  apart:     [2, 4],
  pineapple: [4, 6],
  pig:       [6, 8],
  corn:      [8, 10],
  map:       [10, 12],
  nixtamal:  [12, 14],
  trompo:    [14, 16],
  comal:     [16, 18],
  shave:     [18, 20],
  bites:     [20, 23],
  end:       [23, 25],
}
const at = (id) => ({ start: bar(T[id][0]), end: bar(T[id][1]) })

// the palette (sampled from the look: warm paper, soft earth colours, one red for time)
const C = {
  paper: '#efe8da', paperDark: '#e4dccb', ink: '#2b2420', red: '#c8402e',
  sky: '#b9d6e3', skyLow: '#dfeaea', cloud: '#fbf8f2', hill: '#a9c47a', hillFar: '#c5d4a2', grass: '#8bb55a', grassDark: '#6f9a45',
  leaf: '#5a8f3e', leafDark: '#41702f', soil: '#9a6a44', soilDark: '#7a5133',
  tortilla: '#e8c886', tortillaDark: '#c99d55', toast: '#a8733a',
  pork: '#b4512c', porkDark: '#8a361c', char: '#5a2312', achiote: '#c4482a',
  pineapple: '#f2c84b', pineappleDark: '#d9a52c', pineSkin: '#c78a2e',
  onion: '#f6f2ea', cilantro: '#4f9a3c', salsa: '#86ad3c', lime: '#7cb342', limePulp: '#d9eaa0',
  metal: '#b9bcc0', metalDark: '#8c9096', fire: '#f39a2b', flame: '#ffd36b',
  night: '#1e2a43', nightLine: '#7f92b8', pig: '#efb4a6', pigDark: '#d98f80', corn: '#f1d36a', cornDry: '#d9b25c', husk: '#c9b27a',
}

// caption block in the top band. lines: [[text, local start], ...]; each new line replaces the one before.
// kicker: the countdown, red, with its underline. Returns nothing; the picture lives below y ≈ 230.
function cap(ctx, s, kicker, lines, o = {}) {
  const size = o.size || 48
  const base = { x: 56, y: 46, size, maxWidth: 960, accent: o.accent || (o.color ? '#f2876b' : C.red), color: o.color || C.ink, cps: 36 }
  // the kicker arrives once the page has landed, so it never slides under the logo during a push
  const ka = s.start0 + (o.kickerAt ?? 0.45)
  if (kicker) K.caption(ctx, s.t, { ...base, kicker, kickerStart: ka, text: null, start: ka })
  // each line types under the one before and stays (a second line adds, never replaces)
  let y = base.y + (kicker ? size * 0.52 * 1.9 : 0)
  ctx.save(); ctx.font = K.font(size)
  for (const [text, st] of lines) {
    K.caption(ctx, s.t, { ...base, y, text, start: s.start0 + st })
    y += K.wrap(ctx, text, base.maxWidth).length * size * 1.18
  }
  ctx.restore()
}
// a scene wrapper that gives draw() s.start0 (the scene's start) for cap()
function sceneAt(id, def) {
  const { start, end } = at(id)
  return K.scene({ id, start, end, in: def.in, draw(ctx, s) { s.start0 = start; def.draw(ctx, s) } })
}

// a soft sky band with drifting clouds, for scenes that open into a landscape (top edge y0)
function sky(ctx, y0, y1, t, o = {}) {
  const g = ctx.createLinearGradient(0, y0, 0, y1)
  g.addColorStop(0, o.top || C.sky); g.addColorStop(1, o.low || C.skyLow)
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0)
  // the band's top edge is torn paper, not a ruler line
  ctx.save(); ctx.fillStyle = C.paper
  K.pathOf(ctx, [[0, y0 - 30], ...K.wob([[0, y0], [W, y0]], { seed: 77, amp: 3, closed: false, step: 10 }), [W, y0 - 30]]); ctx.fill(); ctx.restore()
  for (const [cx, cy, sc, sp] of o.clouds || [[220, y0 + 70, 1, 6], [760, y0 + 50, 0.8, 4]]) {
    const x = ((cx + t * sp) % (W + 300)) - 100
    cloud(ctx, x, cy, sc)
  }
}
function cloud(ctx, x, y, sc = 1) {
  const pts = []
  const bumps = [[-60, 0, 34], [-25, -18, 38], [18, -24, 42], [55, -6, 32], [80, 6, 24], [-85, 8, 22]]
  ctx.save()
  for (const [dx, dy, r] of bumps) K.shape(ctx, K.circle(x + dx * sc, y + dy * sc, r * sc, 28), { fill: C.cloud, line: null, wob: 0.6, seed: dx + 9 })
  K.shape(ctx, K.rect(x - 105 * sc, y - 4 * sc, 210 * sc, 30 * sc, 15 * sc), { fill: C.cloud, line: null, wob: 0.6 })
  ctx.restore()
}
// rolling hills: a wobbly ridge filled down to y1
function hill(ctx, y, amp, color, seed, y1 = H, o = {}) {
  const pts = [[0, y1]]
  for (let x = 0; x <= W; x += 20) pts.push([x, y - amp * (0.5 + 0.5 * K.noise1(x * 0.004 + seed, seed))])
  pts.push([W, y1])
  K.shape(ctx, pts, { fill: color, line: o.line ?? null, lw: 1.4, wob: 0.8, seed, shade: o.shade, texture: 0.5 })
}
function sun(ctx, x, y, r, t) {
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * K.TAU + t * 0.2
    K.line(ctx, [[x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35], [x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75]], { color: '#e3a92a', lw: 2.2, seed: i })
  }
  K.shape(ctx, K.circle(x, y, r), { fill: '#f6cf55', line: '#c98d1c', lw: 1.6, light: { amount: 0.4 }, seed: 3 })
}

// ---------- the brand: ComfyField's logo and name, quiet in the corner the whole film (not over the end card)
const LOGO = 'assets/logo.svg'
K.film.preload = [LOGO]
K.overlay((ctx, t) => {
  const endStart = bar(T.end[0])
  const a = 1 - K.at(t, endStart - 0.2, 0.4, 'inOut')
  if (a <= 0) return
  // dark scenes turn the name light
  const dark = K.clamp(K.at(t, bar(T.map[0]), 0.6) - K.at(t, bar(T.map[1]), 0.6))
  const img = K.img(LOGO)
  const s = 40, y = 44
  ctx.save(); ctx.globalAlpha = a * 0.92
  ctx.font = '700 25px "Inter", sans-serif'
  const name = 'ComfyField', tw = ctx.measureText(name).width
  const gap = 12
  const right = W - 56, tx = right - tw, lx = tx - gap - s
  if (img) ctx.drawImage(img, lx, y, s, s)
  ctx.fillStyle = K.mixColor(C.ink, '#f3eee4', dark)
  ctx.textBaseline = 'middle'
  ctx.fillText(name, tx, y + s / 2 + 1)
  ctx.restore()
})
