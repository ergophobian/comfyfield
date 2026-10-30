// 0:06 PINEAPPLE — about two years in three seconds. A crown drops into red Veracruz soil and grows, time-lapse,
// into a fountain of spiny leaves; a fruit rises from the centre, flowers violet, swells and ripens green→gold
// from the bottom up (as real ones do). A fast sun arcs over, the plant's shadow swings under it, the whole
// field grows with it.
const PINEAPPLE_T0 = bar(T.pineapple[0])
K.cue(PINEAPPLE_T0 + 2 * EIGHTH, 'pineapple: crown lands in the soil', 'hit')
K.cue(PINEAPPLE_T0 + 5 * EIGHTH, 'pineapple: fruit rises from the centre', 'soft')
K.cue(PINEAPPLE_T0 + 6 * EIGHTH, 'pineapple: violet flowers open', 'soft')
K.cue(PINEAPPLE_T0 + 10 * EIGHTH, 'pineapple: ripe and gold', 'hit')
const PINEAPPLE = { x: 540, y: 990, hz: 600, vp: [540, 470], fy: 300 }
const PINEAPPLE_COL = { soil: '#a65f3c', soilLight: '#bd7752', furrow: '#86472d', leaf: ['#6f8f45', '#5f8340', '#7a984d', '#668a48'], green: '#5d8c3e', gold: '#e7ad3d', bud: '#bd5a4a' }

// growth over the scene: g = the plant (0 crown → 1 grown), f = the fruit rising, ripe = the ripening front
function pineappleClock(lt) {
  return {
    g: K.at(lt, 0.5, 2.3, (x) => 1 - Math.pow(1 - x, 1.7)),
    f: K.at(lt, 1.15, 0.85, 'out'),
    flower: K.clamp((lt - 1.2) / 0.85),
    ripe: K.at(lt, 2.0, 0.75, 'inOut'),
  }
}

// one blade: a sword that leaves the base at tilt th (from vertical) toward azimuth ph and bends over as it grows
function pineappleBlade(x, y, len, th, ph, droop, w, teeth = 0) {
  const n = 22, cen = [], st = len / n
  let X = 0, Y = 0, Z = 0
  for (let i = 0; i <= n; i++) {
    if (i) { const a = th + droop * Math.pow(i / n, 1.5); X += Math.sin(a) * Math.cos(ph) * st; Y += Math.cos(a) * st; Z += Math.sin(a) * Math.sin(ph) * st }
    cen.push([x + X, y - Y + Z * 0.42])
  }
  const L = [], R = []
  for (let i = 0; i <= n; i++) {
    const s = i / n, a = cen[Math.max(0, i - 1)], b = cen[Math.min(n, i + 1)]
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l
    const hw = (w / 2) * Math.pow(1 - s, 0.8) * Math.min(1, 0.55 + s * 5) + (teeth && i > 2 && i < n - 1 && i % 2 ? teeth : 0)
    L.push([cen[i][0] - ty * hw, cen[i][1] + tx * hw]); R.push([cen[i][0] + ty * hw, cen[i][1] - tx * hw])
  }
  return { pts: L.concat(R.reverse()), cen, z: Math.sin(ph) * Math.sin(th) }
}
function pineappleLeafDraw(ctx, b, col, seed, o = {}) {
  const lw = o.lw ?? 1.6
  K.shape(ctx, b.pts, { fill: col, line: C.ink, lw, seed, wob: o.wob ?? 0.8, shade: { amount: 0.38, angle: 1.5, color: o.red ? '#6e2f22' : undefined }, light: { amount: 0.2, angle: -2.2 }, texture: 0.35, hatch: o.hatch })
  if (o.rib !== false) K.line(ctx, b.cen.slice(2, -4), { color: K.rgba('#e9efc6', 0.5), lw: lw * 0.75, wob: 0.3, taper: 10, seed: seed + 3 })
}

// the rosette's leaves: the planted crown's leaves become the long outer ones, new ones come from the centre
const PINEAPPLE_LEAVES = K.memo('pineapple-leaves', () => {
  const r = K.rng('pineapple-leaves'), out = [], N = 38
  for (let i = 0; i < N; i++) {
    const age = 1 - i / (N - 1)
    out.push({
      i, age, ph: i * 2.39996 + r() * 0.3,
      th: K.lerp(0.1, 1.0, Math.pow(age, 1.35)) + (r() - 0.5) * 0.16,
      droop: K.lerp(0.04, 0.62, age) + r() * 0.18,
      len: K.lerp(250, 470, Math.pow(age, 0.7)) * (0.86 + r() * 0.24),
      w: K.lerp(24, 36, age) * (0.9 + r() * 0.2),
      born: i < 12 ? 0 : ((i - 12) / (N - 12)) * 0.72,
      col: PINEAPPLE_COL.leaf[Math.floor(r() * 4)], red: r() < 0.4, seed: 300 + i * 7,
    })
  }
  return out
})
// the rosette at growth g: blades sorted back to front (the fruit stands at the centre, between the halves)
function pineappleRosette(x, y, g, t, sc = 1) {
  const out = []
  for (const L of PINEAPPLE_LEAVES) {
    const k = L.born === 0 ? K.ease.out(K.clamp(g / 0.95)) : K.ease.out(K.clamp((g - L.born) / 0.4))
    if (k <= 0 && L.born > 0) continue
    const len = (L.born === 0 ? K.lerp(105, L.len, k) : L.len * k) * (0.6 + 0.4 * g) * sc
    const th = K.lerp(L.born === 0 ? 0.3 + 0.35 * L.age : 0.05, L.th, k) + 0.025 * Math.sin(t * 2.1 + L.i)
    const b = pineappleBlade(x, y, len, th, L.ph + 0.02 * Math.sin(t * 1.7 + L.i * 2), L.droop * k, L.w * K.lerp(0.75, 1, k) * sc, len > 120 ? 1.4 * sc : 0)
    b.z = Math.sin(L.ph) * Math.sin(L.th) // depth from the leaf's own pose, so the layering never flips as it sways
    out.push({ b, L })
  }
  return out.sort((a, b) => a.b.z - b.b.z)
}
function pineappleLeaves(ctx, list, front, o = {}) {
  for (const { b, L } of list) {
    if ((b.z >= 0) !== front) continue
    const col = front ? L.col : K.shade(L.col, -0.16)
    pineappleLeafDraw(ctx, b, col, L.seed, { red: L.red, lw: o.lw, rib: o.rib, hatch: !front && b.z < -0.25 ? { angle: -0.8, gap: 6, alpha: 0.2 } : null })
  }
}

// the fruit: a barrel of diamond eyes in 3/4 view (rows smile), its own little crown on top
function pineappleFruit(ctx, cx, cy, sc, c) {
  const h = 225 * sc, R = 86 * sc, top = cy - h / 2
  const prof = (v) => Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * v)), 0.34) * (0.9 + 0.1 * Math.sin(Math.PI * v * 0.8))
  const bump = (v) => 1 + 0.03 * Math.abs(Math.sin(v * 12 * Math.PI)) // the eyes stand proud of the silhouette
  const P = (ph, v, bp = 1) => { v = K.clamp(v); return [cx + R * prof(v) * (bp ? bump(v) : 1) * Math.sin(ph), top + v * h + R * prof(v) * Math.cos(ph) * 0.16] }
  const outline = []
  for (let i = 0; i <= 24; i++) outline.push(P(Math.PI / 2, i / 24))
  for (let i = 0; i <= 10; i++) outline.push(P(Math.PI / 2 - (i / 10) * Math.PI, 1)) // bottom: the front of its ring
  for (let i = 24; i >= 0; i--) outline.push(P(-Math.PI / 2, i / 24))
  for (let i = 0; i <= 10; i++) outline.push(P(-Math.PI / 2 - (i / 10) * Math.PI, 0)) // top: the back of its ring
  const green = K.mixColor(PINEAPPLE_COL.bud, PINEAPPLE_COL.green, K.clamp(c.f * 1.8))
  const cellCol = (v, n) => {
    const rc = K.clamp((c.ripe * 1.6 - (1 - v)) * 2.2)
    return K.mixColor(K.mixColor(green, '#c8a53c', K.clamp(rc * 2)), PINEAPPLE_COL.gold, K.clamp(rc * 2 - 1) * (0.85 + 0.15 * n))
  }
  // the fruit's crown, back half first
  const crown = [], cr = K.rng('pineapple-crown')
  for (let i = 0; i < 24; i++) {
    const ph = i * 2.39996, th = 0.04 + Math.pow(cr(), 0.8) * 0.85
    crown.push(pineappleBlade(cx + Math.cos(ph) * 12 * sc, top + 8 * sc, (85 + cr() * 95) * sc * (1.2 - th * 0.45), th, ph, 0.12 + cr() * 0.25, 22 * sc, 0))
  }
  crown.sort((a, b) => a.z - b.z)
  const crownCol = K.mixColor('#4f7a45', '#5e8c52', c.ripe)
  crown.filter((b) => b.z < 0).forEach((b, i) => pineappleLeafDraw(ctx, b, K.shade(crownCol, -0.15), 500 + i, { lw: 1.4, rib: false }))
  K.shape(ctx, outline, { fill: K.shade(cellCol(0.6, 0.5), -0.25), line: null, wob: 0.6, seed: 41 })
  ctx.save(); K.pathOf(ctx, outline); ctx.clip()
  const cols = 16, rows = 12, dph = K.TAU / cols, dv = 1 / rows, fr = K.rng('pineapple-eyes')
  for (let j = 0; j <= rows; j++) {
    for (let k = -cols / 2; k <= cols / 2; k++) {
      const ph = (k + 0.5 * (j % 2)) * dph, v = j * dv, n = fr(), fl = fr()
      if (Math.cos(ph) < -0.1) continue
      const edge = 1 - Math.max(0, Math.cos(ph))
      const cell = [P(ph, v - dv), P(ph + dph / 2, v), P(ph, v + dv), P(ph - dph / 2, v)]
      const col = K.shade(cellCol(v, n), -0.28 * edge)
      K.shape(ctx, cell, { fill: col, line: K.mixColor('#38502a', '#8a5418', K.clamp(c.ripe * 1.6 - (1 - v))), lw: 1.1 * sc + 0.3, seed: j * 40 + k, wob: 0.5, step: 4 })
      // each eye: a raised lighter boss with a little dark spiny bract under it
      const [ex, ey] = P(ph, v - dv * 0.12, 0), ew = R * prof(v) * dph * Math.max(0.12, Math.cos(ph)) * 0.32, eh = dv * h * 0.5
      K.shape(ctx, K.ellipse(ex, ey, ew, eh, 0, 16), { fill: K.shade(col, 0.2), line: null, wob: 0.3, seed: j * 9 + k, light: { amount: 0.35, angle: -2.3 } })
      const rc = K.clamp((c.ripe * 1.6 - (1 - v)) * 2.2)
      K.shape(ctx, [[ex - ew * 0.45, ey + eh * 0.55], [ex, ey + eh * 1.35], [ex + ew * 0.45, ey + eh * 0.55]], { fill: K.mixColor('#3d5a26', '#6e4518', rc), line: null, wob: 0, seed: j + k })
      // the flowers come out eye by eye, bottom first, and fade as it swells
      const ft = 0.05 + (1 - v) * 0.4 + fl * 0.12, fa = K.at(c.flower, ft, 0.12, 'out') * (1 - K.at(c.flower, ft + 0.32, 0.2))
      if (fl < 0.45 && fa > 0 && Math.cos(ph) > 0.2) {
        const fs = 6.8 * sc * Math.cos(ph)
        for (let p = 0; p < 3; p++) { const a = p * 2.094 - 1.57; K.shape(ctx, K.circle(ex + Math.cos(a) * fs * 0.8, ey + Math.sin(a) * fs * 0.8, fs * 0.75 * fa, 10), { fill: '#8a64c8', line: '#4c3277', lw: 0.8, wob: 0, seed: p }) }
        K.shape(ctx, K.circle(ex, ey, fs * 0.35 * fa, 8), { fill: '#f3dc6a', line: null, wob: 0 })
      }
    }
  }
  // round it: darker toward both sides, hatched on the shadow side, a soft light on the left
  const b = K.bounds(outline), gr = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0)
  gr.addColorStop(0, 'rgba(50,30,10,0.35)'); gr.addColorStop(0.3, 'rgba(50,30,10,0)'); gr.addColorStop(0.6, 'rgba(50,30,10,0.04)'); gr.addColorStop(1, 'rgba(50,30,10,0.45)')
  ctx.fillStyle = gr; ctx.fillRect(b.x, b.y, b.w, b.h)
  K.hatchIn(ctx, { x: b.x + b.w * 0.55, y: b.y, w: b.w * 0.5, h: b.h, cx: b.x + b.w * 0.8, cy: b.cy }, { angle: -0.9, gap: 6, alpha: 0.22 }, 44)
  ctx.globalCompositeOperation = 'screen'
  const hl = ctx.createRadialGradient(cx - R * 0.35, cy - h * 0.15, 0, cx - R * 0.35, cy - h * 0.15, R * 0.8)
  hl.addColorStop(0, 'rgba(255,248,225,0.32)'); hl.addColorStop(1, 'rgba(255,248,225,0)')
  ctx.fillStyle = hl; ctx.fillRect(b.x, b.y, b.w, b.h)
  ctx.restore()
  K.shape(ctx, outline, { fill: null, line: C.ink, lw: 2, seed: 42, wob: 0.8 })
  crown.filter((b) => b.z >= 0).forEach((b, i) => pineappleLeafDraw(ctx, b, crownCol, 520 + i, { lw: 1.4, rib: false }))
}

// ---------- the world behind it, drawn once: hills with palms, the red field in perspective rows
function pineapplePalm(ctx, x, y, s, seed) {
  const top = [x + 12 * s, y - 78 * s]
  K.line(ctx, K.curve([[x, y], [x + 8 * s, y - 40 * s], top]), { color: '#7b6a48', lw: 4.5 * s, wob: 0.3, taper: 2, seed })
  for (let i = 0; i < 8; i++) {
    const ph = i % 2 ? 0 : Math.PI, th = 0.5 + (i >> 1) * 0.32
    const b = pineappleBlade(top[0], top[1], 34 * s, th, ph + (i % 3) * 0.3, 1.1, 9 * s)
    K.shape(ctx, b.pts, { fill: i < 4 ? '#5f7f4c' : '#6f8f55', line: '#4a5c36', lw: 0.9, wob: 0.3, seed: seed + i })
  }
}
function pineappleBack() {
  return K.memo('pineapple-back', () => {
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const g = c.getContext('2d')
    hill(g, 545, 95, C.hillFar, 3)
    ;[[150, 498, 0.9], [205, 505, 0.75], [700, 490, 0.85], [905, 520, 0.8]].forEach(([x, y, s], i) => pineapplePalm(g, x, y, s, 60 + i))
    hill(g, 600, 62, C.hill, 8, H, { shade: { amount: 0.15, angle: 1.6 } })
    const rb = K.rng('pineapple-bush')
    for (let i = 0; i < 11; i++) {
      const x0 = rb() * W, y0 = 578 + rb() * 18
      for (let j = 0; j < 3; j++) { const r0 = 8 + rb() * 7, x = x0 + (j - 1) * 13, y = y0 - (j === 1 ? 5 : 0); K.shape(g, K.blob(x, y, r0, i * 3 + j, 0.3, 14, r0 * 0.8), { fill: j === 1 ? '#7f9f58' : '#89a960', line: '#566f3c', lw: 0.9, wob: 0.4, seed: i * 3 + j, shade: { amount: 0.35, angle: 0.8 } }) }
    }
    ;[[60, 585, 0.7], [330, 572, 0.65], [980, 580, 0.75]].forEach(([x, y, s], i) => pineapplePalm(g, x, y, s, 70 + i))
    // the field: raised red beds converging on the horizon
    const top = PINEAPPLE.hz, [vx, vy] = PINEAPPLE.vp
    K.shape(g, [[0, top + 4], ...K.wob([[0, top], [W, top]], { seed: 5, amp: 2.5, closed: false, step: 12 }), [W, top + 4], [W, H], [0, H]], { fill: PINEAPPLE_COL.soil, line: null, wob: 0, texture: 0.8 })
    g.save(); g.beginPath(); g.rect(0, top + 2, W, H); g.clip()
    const dk = (y, xbot) => [vx + (xbot - vx) * ((y - vy) / (H - vy)), y]
    for (let k = -8; k <= 8; k++) {
      const xa = 540 + k * 230 - 70, xb = 540 + k * 230 + 70
      K.shape(g, [dk(top, xa), dk(top, xb), dk(H + 40, xb), dk(H + 40, xa)], { fill: PINEAPPLE_COL.furrow, line: null, wob: 1.2, seed: 90 + k, texture: 0.6, alpha: 0.85 })
      K.line(g, [dk(top + 3, xb + 8), dk(H + 40, xb + 22)], { color: K.rgba(PINEAPPLE_COL.soilLight, 0.7), lw: 2.5, wob: 1, seed: 120 + k, taper: 30 })
      K.line(g, [dk(top + 3, xa - 6), dk(H + 40, xa - 18)], { color: K.rgba(C.ink, 0.25), lw: 1.4, wob: 1, seed: 140 + k, taper: 30 })
    }
    // clods and stones
    const r = K.rng('pineapple-clods')
    for (let i = 0; i < 70; i++) {
      const y = top + 20 + Math.pow(r(), 0.7) * (H - top), d = (y - vy) / (H - vy), x = r() * W, s = (2 + r() * 5) * d * 1.6
      K.shape(g, K.blob(x, y, s, i, 0.4, 10, s * 0.6), { fill: r() < 0.5 ? PINEAPPLE_COL.soilLight : '#9b8a78', line: K.rgba(C.ink, 0.5), lw: 0.8, wob: 0.3, seed: i })
    }
    g.restore()
    g.fillStyle = 'rgba(60,30,15,0.12)'; g.fillRect(0, top, W, 14) // a darker band where the field meets the hill
    return c
  })
}
// the neighbours: sprites of a grown plant (back leaves / front leaves) and its fruit, scaled per plant
const PINEAPPLE_SPR = { w: 1000, h: 900, bx: 500, by: 640, fy: 310 }
function pineappleSprite(part) {
  return K.memo('pineapple-spr-' + part, () => {
    const c = document.createElement('canvas'); c.width = PINEAPPLE_SPR.w; c.height = PINEAPPLE_SPR.h
    const g = c.getContext('2d')
    if (part === 'back' || part === 'front') pineappleLeaves(g, pineappleRosette(PINEAPPLE_SPR.bx, PINEAPPLE_SPR.by, 1, 0), part === 'front', { lw: 2.4, rib: part === 'front' })
    else pineappleFruit(g, PINEAPPLE_SPR.bx, PINEAPPLE_SPR.fy, 1, { f: 1, ripe: part === 'gold' ? 1 : 0, flower: 0 })
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = K.rgba(C.skyLow, 0.3); g.fillRect(0, 0, c.width, c.height) // distance haze
    return c
  })
}
const PINEAPPLE_FIELD = K.memo('pineapple-field', () => {
  const out = [], [vx, vy] = PINEAPPLE.vp, r = K.rng('pineapple-field')
  for (let k = -7; k <= 7; k++) {
    const xb = 540 + k * 230 + 185
    for (let m = 0; m < 7; m++) {
      const d = 0.22 * Math.pow(1.3, m) + (r() - 0.5) * 0.02, y = vy + (H - vy) * d, x = vx + (xb - vx) * d + (r() - 0.5) * 20
      if (y < PINEAPPLE.hz + 6 || y > 790 || x < -150 || x > W + 150) continue
      out.push({ x, y, s: d * 0.5 * (0.85 + r() * 0.3) })
    }
  }
  return out.sort((a, b) => a.y - b.y)
})
function pineappleNeighbour(ctx, p, c) {
  const s = p.s * (0.28 + 0.72 * c.g), S = PINEAPPLE_SPR
  ctx.drawImage(pineappleSprite('back'), p.x - S.bx * s, p.y - S.by * s, S.w * s, S.h * s)
  if (c.f > 0) {
    const fs = s * K.lerp(0.05, 1, c.f), fcy = p.y - (S.by - S.fy) * s * c.f
    const x = p.x - S.bx * fs, y = fcy - S.fy * fs
    ctx.drawImage(pineappleSprite('green'), x, y, S.w * fs, S.h * fs)
    if (c.ripe > 0) { ctx.save(); ctx.globalAlpha *= c.ripe; ctx.drawImage(pineappleSprite('gold'), x, y, S.w * fs, S.h * fs); ctx.restore() }
  }
  ctx.drawImage(pineappleSprite('front'), p.x - S.bx * s, p.y - S.by * s, S.w * s, S.h * s)
}

sceneAt('pineapple', {
  in: { type: 'drop', dur: 0.6 },
  draw(ctx, s) {
    const lt = Math.min(s.lt, 3.6), t = s.t, c = pineappleClock(lt)
    K.paper(ctx, W, H, C.paper)
    // the time-lapse sky: a sun arcs left to right behind fast clouds
    sky(ctx, 230, PINEAPPLE.hz + 6, lt, { clouds: [] })
    const u = K.clamp((lt + 0.1) / 3.6), sa = Math.PI - 0.38 - (Math.PI - 0.76) * u
    const sx = 540 + 470 * Math.cos(sa), sy = 650 - 355 * Math.sin(sa)
    sun(ctx, sx, sy, 34, lt * 2)
    for (const [cx, cy, sc, sp] of [[120, 330, 0.75, 120], [640, 300, 0.55, 95], [-380, 380, 0.65, 140]]) cloud(ctx, ((cx + lt * sp) % (W + 300)) - 100, cy, sc)
    ctx.drawImage(pineappleBack(), 0, 0)
    for (const p of PINEAPPLE_FIELD) if (p.y < PINEAPPLE.y - 40) pineappleNeighbour(ctx, p, c)
    // the hero's shadow swings opposite the sun
    const shx = -(sx - 540) * 0.32, gs = 0.35 + 0.65 * c.g
    K.groundShadow(ctx, PINEAPPLE.x + shx * gs, PINEAPPLE.y + 14, 340 * gs, 52 * gs, 0.3)
    // planting: the crown falls into the bed and throws up soil
    const drop = K.at(lt, 0, 0.5, 'in'), land = lt - 0.5
    const y0 = PINEAPPLE.y - 330 * (1 - drop), squash = land > 0 ? 1 - 0.12 * Math.exp(-land * 9) * Math.cos(land * 30) : 1
    K.shape(ctx, K.blob(PINEAPPLE.x, PINEAPPLE.y + 2, 70 + 40 * c.g, 9, 0.25, 24, 14 + 6 * c.g), { fill: PINEAPPLE_COL.furrow, line: K.rgba(C.ink, 0.35), lw: 1, seed: 9, texture: 0.6, alpha: 0.7 })
    ctx.save(); ctx.translate(PINEAPPLE.x, y0); ctx.scale(1 / squash, squash); ctx.rotate(0.12 * (1 - drop)); ctx.translate(-PINEAPPLE.x, -y0)
    const ros = pineappleRosette(PINEAPPLE.x, y0, c.g, t)
    if (lt < 0.55) K.shape(ctx, K.ellipse(PINEAPPLE.x, y0 + 4, 30, 12), { fill: '#c99a5a', line: C.ink, lw: 1.4, seed: 4, shade: { amount: 0.3 } }) // the cut base
    pineappleLeaves(ctx, ros, false)
    if (c.f > 0) {
      const fs = K.lerp(0.06, 1, c.f), fy = K.lerp(PINEAPPLE.y - 30, PINEAPPLE.y - PINEAPPLE.fy, c.f)
      K.line(ctx, [[PINEAPPLE.x, PINEAPPLE.y - 10], [PINEAPPLE.x + 2, fy + 100 * fs]], { color: '#5c7d3a', lw: 26 * fs, wob: 0.5, taper: 0, seed: 7 })
      pineappleFruit(ctx, PINEAPPLE.x + 3, fy, fs, c)
    }
    pineappleLeaves(ctx, ros, true)
    ctx.restore()
    // soil kicked up by the landing
    if (land > 0 && land < 0.8) {
      const r = K.rng('pineapple-puff')
      for (let i = 0; i < 18; i++) {
        const a = -Math.PI * (0.12 + 0.76 * r()), v = 200 + r() * 260, x0 = PINEAPPLE.x + (r() - 0.5) * 50
        const x = x0 + Math.cos(a) * v * land, y = PINEAPPLE.y - 8 + Math.sin(a) * v * land + 1000 * land * land
        if (y < PINEAPPLE.y + 25) K.shape(ctx, K.blob(x, y, 4 + r() * 6, i, 0.4, 10), { fill: i % 3 ? PINEAPPLE_COL.soil : PINEAPPLE_COL.soilLight, line: K.rgba(C.ink, 0.7), lw: 1, wob: 0.3, seed: i, alpha: 1 - K.at(land, 0.45, 0.3) })
      }
      K.groundShadow(ctx, PINEAPPLE.x, PINEAPPLE.y - 10, 120 * (0.4 + land), 30 * (0.4 + land), 0.25 * (1 - land / 0.8), '#8a5a3a')
    }
    for (const p of PINEAPPLE_FIELD) if (p.y >= PINEAPPLE.y - 40) pineappleNeighbour(ctx, p, c)
    cap(ctx, s, '2 YEARS TO DINNER', [['A pineapple takes about two years to grow.', 0.45]])
  },
})
