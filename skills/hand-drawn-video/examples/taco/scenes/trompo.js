// 0:21 — the trompo (6 HOURS). Night at the taquería: pork in a red chile-and-achiote marinade is stacked slab by
// slab on a vertical spit, one slab landing on every eighth, and a whole pineapple drops on top to crown it. The
// wall of flame behind glows and flickers. The trompo* helpers are shared with scenes/shave.js.

const TROMPO = { n: 12, h: 28, r0: 56, r1: 140, sq: 0.3, tip: -410 } // local units: the base of the meat is y = 0
const TROMPO_PRE = 5                                         // slabs already on the spit when the scene opens
const TROMPO_LAND = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]  // local times the next slabs land (eighths)
const TROMPO_PINE = 2.5                                      // the pineapple lands
const TROMPO_G = 14000                                       // px/s²: the slabs fall with weight
const TROMPO_NIGHT = '#2c2431'
{
  const t0 = bar(T.trompo[0])
  K.cue(t0 + 0.5, 'trompo: first slab slaps onto the spit', 'hit')
  K.cue(t0 + 1.25, 'trompo: the stack climbs', 'soft')
  K.cue(t0 + 2.0, 'trompo: last slab lands', 'soft')
  K.cue(t0 + TROMPO_PINE, 'trompo: the pineapple crowns it', 'hit')
}
const trompoWrap = (a) => ((a % K.TAU) + K.TAU) % K.TAU
const trompoKey = (a) => Math.floor(a * 1000) % 997

// ---------- the night around the stall
function trompoNight(ctx, y0, t) {
  const edge = K.memo('trompo-edge' + y0, () => K.wob([[-10, y0], [W + 10, y0]], { seed: 404, amp: 3.5, closed: false, step: 10 }))
  K.shape(ctx, [...edge, [W + 10, H + 10], [-10, H + 10]], { fill: TROMPO_NIGHT, line: null, wob: 0, texture: 0.7 })
}
// the street behind the stall: low rooflines, a few lit windows (kept dim so the fire stays the subject)
function trompoStreet(ctx, y1) {
  ctx.drawImage(K.memo('trompo-street' + y1, () => {
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const g = c.getContext('2d'), r = K.rng('trompo-street')
    for (const [x0, x1, top] of [[-20, 120, 400], [120, 250, 450], [250, 330, 380], [760, 860, 420], [860, 990, 370], [990, 1100, 440]]) {
      K.shape(g, K.rect(x0, top, x1 - x0, y1 - top), { fill: '#352c3a', line: K.rgba('#16111a', 0.7), lw: 1.4, seed: x0 + 900, wob: 0.8, shade: { amount: 0.3, angle: 1.57 }, texture: 0.5 })
      for (let wy = top + 30; wy < y1 - 70; wy += 62) for (let wx = x0 + 18; wx < x1 - 36; wx += 46) {
        const lit = r() < 0.18
        K.shape(g, K.rect(wx, wy, 22, 30, 2), { fill: lit ? K.rgba('#d99a48', 0.55) : '#302836', line: K.rgba('#16111a', 0.8), lw: 1, seed: wx * 3 + wy, wob: 0.5 })
      }
    }
    return c
  }), 0, 0)
}
// a string of warm bulbs across the top of the band
function trompoLights(ctx, t, y0 = 262, sag = 34, o = {}) {
  const x0 = o.x0 ?? -30, x1 = o.x1 ?? W + 30, n = o.n ?? 13
  const at = (u) => [K.lerp(x0, x1, u), y0 + sag * 4 * u * (1 - u) + 3 * Math.sin(t * 1.3 + u * 4)]
  const wire = []
  for (let k = 0; k <= 30; k++) wire.push(at(k / 30))
  K.line(ctx, wire, { color: '#16111a', lw: 2.2, seed: 401, taper: 0 })
  for (let k = 1; k < n; k++) {
    const [x, y] = at(k / n), fl = 0.8 + 0.2 * K.noise1(t * 6 + k * 3.3, 402)
    for (let j = 3; j >= 1; j--) K.shape(ctx, K.circle(x, y + 12, 8 + j * 9 * fl, 24), { fill: K.rgba(C.flame, 0.06), line: null, wob: 0 })
    K.line(ctx, [[x, y], [x, y + 5]], { color: '#16111a', lw: 2, seed: k, taper: 0 })
    K.shape(ctx, K.ellipse(x, y + 12, 5.5, 7.5, 0, 16), { fill: K.mixColor(C.flame, '#fff4d0', fl - 0.8), line: '#6b4a1c', lw: 1.1, seed: 410 + k, wob: 0.4 })
  }
}

// papel picado: cut-paper flags on a string, only where they keep clear of the subject (ranges of x)
function trompoPicado(ctx, t, y0, sag, ranges) {
  const cols = ['#c96a85', '#e0b440', '#5f9a4a', '#5684b8', '#d9822f', '#8f68ad']
  const at = (x) => y0 + sag * 4 * (x / W) * (1 - x / W)
  for (const [a, b] of ranges) {
    const wire = []
    for (let x = a; x <= b; x += 20) wire.push([x, at(x)])
    K.line(ctx, wire, { color: '#16111a', lw: 1.6, seed: 430 + a, taper: 0 })
    for (let x = a + 30, k = 0; x < b - 20; x += 62, k++) {
      const y = at(x), sw = 0.07 * Math.sin(t * 2.1 + x * 0.05) + 0.03 * K.noise1(t * 3 + k, 431)
      const fw = 25, fh = 58, pts = [[-fw, 0], [fw, 0]]
      for (let j = 0; j <= 8; j++) pts.push([fw - (2 * fw * j) / 8, fh - (j % 2 ? 0 : 7)])
      ctx.save(); ctx.translate(x, y); ctx.rotate(sw)
      const wp = K.shape(ctx, pts, { fill: cols[(k + Math.floor(a / 100)) % cols.length], line: K.rgba('#1a1218', 0.8), lw: 1.2, seed: 440 + k + a, wob: 0.6, shade: { amount: 0.3 }, alpha: 0.92 })
      ctx.save(); K.pathOf(ctx, wp); ctx.clip()
      for (const [hx, hy, hr] of [[0, 24, 7], [-12, 12, 3.5], [12, 12, 3.5], [-12, 38, 3.5], [12, 38, 3.5], [0, 44, 3]]) K.shape(ctx, K.circle(hx, hy, hr, 12), { fill: TROMPO_NIGHT, line: null, wob: 0.4, seed: hx + hy })
      ctx.restore(); ctx.restore()
    }
  }
}

// ---------- the wall of flame: a steel burner with a grid of glowing ceramic, flames licking up over it
function trompoFire(ctx, cx, y, w, h, t, o = {}) {
  const x = cx - w / 2
  for (let k = 5; k >= 1; k--) {
    const g = 1 + 0.03 * K.noise1(t * 4 + k, 31)
    K.shape(ctx, K.blob(cx, y + h * 0.48, (w * 0.5 + k * 46) * g, 40 + k, 0.08, 40, (h * 0.52 + k * 46) * g), { fill: K.rgba(C.fire, 0.055), line: null, wob: 0 })
  }
  K.shape(ctx, K.rect(x - 22, y - 22, w + 44, h + 44, 18), { fill: '#57514f', line: C.ink, lw: 2.2, seed: 61, shade: { amount: 0.45, angle: 0.3 }, light: { amount: 0.25 }, texture: 0.6 })
  const inner = K.shape(ctx, K.rect(x, y, w, h, 8), { fill: '#a8391a', line: '#3a1c12', lw: 1.8, seed: 62, texture: 0.5, light: { amount: 0.5, angle: 1.57, color: '#ffb347' } })
  ctx.save(); K.pathOf(ctx, inner); ctx.clip()
  // the ceramic grid glowing behind the flames
  const cols = 7, rows = 9, tw = w / cols, th = h / rows
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const glow = K.clamp(0.5 + 0.5 * K.noise1(t * 1.6 + r * 1.7 + c * 2.9, 33)) * (0.4 + 0.6 * (r / rows))
    K.shape(ctx, K.rect(x + c * tw + 3, y + r * th + 3, tw - 6, th - 6, 4), { fill: K.mixColor('#b9421c', '#ef8a34', glow), line: null, seed: r * 9 + c, wob: 0.6 })
  }
  // a bed of fire: two rows of tongues, back row tall, front row short
  for (const [row, n, base, hk] of [[0, 9, y + h + 10, 0.92], [1, 8, y + h + 10, 0.5]]) for (let c = 0; c < n; c++) {
    const bx = x + ((c + 0.5 + row * 0.5) / (n + row * 0.5)) * w, sd = row * 40 + c * 7
    trompoFlame(ctx, bx, base, (w / n) * 1.5, h * hk * (0.8 + 0.2 * K.hash(sd) / 4294967296), t, sd)
  }
  ctx.restore()
  if (o.top !== false) for (let c = 0; c < 8; c++) { // flames licking over the top of the burner
    const bx = x + 34 + c * ((w - 68) / 7)
    trompoFlame(ctx, bx, y + 6, 46, 58 + 10 * (c % 3), t, 90 + c, 3)
  }
}
// one tongue of fire: a wavering centre line, wide at the base, curling to a point; nested hot layers inside
function trompoFlame(ctx, bx, by, w, h, t, seed, layers = 4) {
  const cols = ['#e2572a', C.fire, C.flame, '#fff3cc'].slice(4 - layers)
  const fl = 0.82 + 0.22 * K.noise1(t * 5.5 + seed * 1.3, 38)
  cols.forEach((col, li) => {
    const k = 1 - li * 0.24, hh = h * fl * k, L = [], R = []
    for (let i = 0; i <= 14; i++) {
      const u = i / 14, sway = w * 0.55 * Math.pow(u, 1.4) * K.noise1(t * 2.6 - u * 2.2 + seed * 0.7, 39)
      const hw = (w / 2) * k * Math.pow(1 - u, 0.7) * Math.min(1, 0.6 + u * 3)
      const px = bx + sway, py = by - hh * u
      L.push([px - hw, py]); R.push([px + hw, py])
    }
    K.shape(ctx, [...L, ...R.reverse()], { fill: col, line: li === 0 ? K.rgba('#7a2a12', 0.7) : null, lw: 1.3, seed: seed * 5 + li, wob: 0.9 })
  })
}
// sparks rising off the fire
function trompoEmbers(ctx, x, y, w, t, n, seed) {
  const r = K.rng(seed)
  for (let i = 0; i < n; i++) {
    const life = 1.1 + r() * 1.0, ph = r() * life, x0 = x + r() * w, sp = 70 + r() * 90, drift = (r() - 0.5) * 60, sz = 1.4 + r() * 1.8
    const age = (t + ph) % life, p = age / life
    const ex = x0 + drift * p + 12 * K.noise1(t * 2 + i, seed), ey = y - age * sp
    ctx.fillStyle = K.rgba(C.flame, 0.95 * Math.sin(Math.PI * p))
    ctx.beginPath(); ctx.arc(ex, ey, sz * (1 - p * 0.5), 0, K.TAU); ctx.fill()
  }
}
// thin smoke curling off the hot meat
function trompoSmoke(ctx, x, y, t, n = 3, o = {}) {
  const life = 1.8, spread = o.spread ?? 50, rise = o.rise ?? 150
  for (let i = 0; i < n; i++) {
    const age = (t * 0.9 + (i / n) * life) % life, p = age / life, pts = []
    for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([x + (i - (n - 1) / 2) * spread * 0.6 + 16 * Math.sin(u * 5 + t * 1.6 + i * 2) * u, y - p * rise * 0.6 - u * rise * 0.5]) }
    K.line(ctx, pts, { color: K.rgba(o.color || '#efe6da', (o.alpha ?? 0.32) * Math.sin(Math.PI * p)), lw: 3.2, seed: 600 + i, taper: 24, swell: 0.8 })
  }
}

// ---------- the steel counter of the stall, painted tiles along its front
function trompoCounter(ctx, y, glowX) {
  const front = K.memo('trompo-counter' + y, () => {
    const c = document.createElement('canvas'); c.width = W; c.height = H - y
    const g = c.getContext('2d')
    g.fillStyle = '#3b2c2c'; g.fillRect(0, 0, W, H)
    const ts = 64, r = K.rng('trompo-tiles')
    for (let k = 0; k < 18; k++) {
      const tx = k * ts - 20, ty = 34
      K.shape(g, K.rect(tx + 2, ty, ts - 4, ts - 4, 3), { fill: '#b7a487', line: '#2b2420', lw: 1.2, seed: 700 + k, wob: 0.6, shade: { amount: 0.35, angle: 1.4 } })
      const mx = tx + ts / 2, my = ty + ts / 2 - 2
      for (let p = 0; p < 4; p++) { const a = (p * Math.PI) / 2 + Math.PI / 4; K.shape(g, K.leaf(mx, my, mx + Math.cos(a) * 22, my + Math.sin(a) * 22, 13, 0.5, 10), { fill: '#3d5687', line: null, wob: 0.5, seed: k * 4 + p }) }
      K.shape(g, K.circle(mx, my, 5, 12), { fill: '#c7952f', line: null, wob: 0.3, seed: k })
      for (const [qx, qy] of [[tx + 2, ty], [tx + ts - 2, ty], [tx + 2, ty + ts - 4], [tx + ts - 2, ty + ts - 4]]) K.shape(g, K.circle(qx, qy, 7, 12), { fill: '#3d5687', line: null, wob: 0.3, seed: r() * 99 })
    }
    g.globalCompositeOperation = 'multiply'
    const sh = g.createLinearGradient(0, 0, 0, H - y); sh.addColorStop(0, 'rgba(60,40,40,0.15)'); sh.addColorStop(1, 'rgba(40,25,30,0.75)')
    g.fillStyle = sh; g.fillRect(0, 0, W, H - y)
    return c
  })
  ctx.drawImage(front, 0, y + 22)
  K.shape(ctx, [[-10, y], [W + 10, y], [W + 10, y + 26], [-10, y + 26]], { fill: '#a3a6aa', line: C.ink, lw: 2, seed: 51, wob: 0.8, shade: { amount: 0.3, angle: 1.57 }, texture: 0.5 })
  K.shape(ctx, K.ellipse(glowX, y + 9, 300, 9, 0, 40), { fill: K.rgba(C.fire, 0.35), line: null, wob: 0 }) // the fire on the steel
  K.line(ctx, [[-10, y + 5], [W + 10, y + 5]], { color: K.rgba('#fffaf0', 0.5), lw: 1.6, seed: 52, taper: 0 })
}

// ---------- the trompo itself (local units: the base of the meat at 0,0, up is -y)
function trompoRadius(i) {
  const u = i / (TROMPO.n - 1)
  return (TROMPO.r0 + (TROMPO.r1 - TROMPO.r0) * Math.pow(u, 0.7)) * (i === TROMPO.n - 1 ? 0.94 : 1) * trompoSlabData(i).rj
}
function trompoSlabData(i) {
  return K.memo('trompo-slab' + i, () => {
    const r = K.rng('trompo-slab' + i), spots = [], folds = [], glints = []
    for (let k = 0; k < 14; k++) spots.push({ a: r() * K.TAU, v: 0.45 + r() * 0.6, s: 0.6 + r() * 0.9, al: 0.55 + r() * 0.35 })
    for (let k = 0; k < 7; k++) folds.push({ a: r() * K.TAU, len: 0.5 + r() * 1.3, v: 0.2 + r() * 0.6 })
    for (let k = 0; k < 5; k++) glints.push({ a: r() * K.TAU, v: 0.15 + r() * 0.5, len: 0.12 + r() * 0.2 })
    return { col: ['#bb3c22', '#a9341f', '#c54a27', '#a1331f'][i % 4], seed: 300 + i * 13, spots, folds, glints, rj: 0.95 + r() * 0.1, dx: (r() - 0.5) * 9, hk: 0.85 + r() * 0.3 }
  })
}
// one slab: its back rim, its flank and the ragged edge of meat hanging at its front. yb = its bottom
function trompoSlab(ctx, i, yb, rot, o = {}) {
  const { h, sq } = TROMPO, d = trompoSlabData(i), sx = o.sx || 1, sy = o.sy || 1
  const rT = trompoRadius(i) * sx, rB = rT * 0.92, hh = h * d.hk * sy, yt = yb - hh
  const pts = []
  for (let k = 0; k <= 20; k++) { const a = Math.PI + (Math.PI * k) / 20; pts.push([Math.cos(a) * rT, yt + Math.sin(a) * rT * sq]) }
  for (let k = 0; k <= 44; k++) {
    const a = (Math.PI * k) / 44, f = a - rot
    const lobe = (1 + 15 * Math.max(0, K.noise2(Math.cos(f) * 2.4 + i * 3.7, Math.sin(f) * 2.4, d.seed) + 0.1)) * (0.3 + 0.7 * Math.sin(a))
    pts.push([Math.cos(a) * rB, yb + Math.sin(a) * rB * sq + lobe])
  }
  ctx.save(); ctx.translate(d.dx, 0)
  if (o.alpha != null) ctx.globalAlpha *= o.alpha
  const wp = K.shape(ctx, pts, { fill: d.col, line: null, seed: d.seed, wob: 1.1, shade: { amount: 0.6, angle: 0.15 }, light: { amount: 0.14, angle: Math.PI + 0.5 }, texture: 0.45 })
  ctx.save(); K.pathOf(ctx, wp); ctx.clip()
  const rAt = (v) => K.lerp(rT, rB, v), yAt = (v, a) => yt + hh * v + Math.sin(a) * rAt(v) * sq
  for (const f of d.folds) { // where one thin slice laps over the next
    const line = []
    for (let k = 0; k <= 14; k++) {
      const a = trompoWrap(f.a + rot + (f.len * k) / 14)
      if (a > 0.1 && a < Math.PI - 0.1) line.push([Math.cos(a) * rAt(f.v), yAt(f.v, a)]); else if (line.length) break
    }
    if (line.length > 2) K.line(ctx, line, { color: K.rgba('#6e2614', 0.75), lw: 1.3, seed: d.seed + f.v * 50, taper: 8 })
  }
  for (const g of d.glints) { // the marinade shines where the light catches it
    const a = trompoWrap(g.a + rot)
    if (a < Math.PI * 0.55 || a > Math.PI - 0.1) continue
    const line = []
    for (let k = 0; k <= 5; k++) { const aa = a - (g.len * k) / 5; line.push([Math.cos(aa) * rAt(g.v), yAt(g.v, aa)]) }
    K.line(ctx, line, { color: K.rgba('#f4a06a', 0.6), lw: 1.8, seed: d.seed + g.v * 30, taper: 5 })
  }
  for (const sp of d.spots) { // char from the fire
    const a = trompoWrap(sp.a + rot)
    if (a > Math.PI - 0.04 || a < 0.04) continue
    const fs = Math.sin(a), x = Math.cos(a) * rAt(sp.v), y = yAt(sp.v, a)
    K.shape(ctx, K.blob(x, y, 9 * sp.s * (0.35 + 0.65 * fs), d.seed + trompoKey(sp.a), 0.45, 14, 4.2 * sp.s), { fill: K.rgba(C.char, sp.al), line: null, wob: 0.5, seed: trompoKey(sp.a) })
  }
  if (o.cut) { // where the knife has passed, the flank is shaved back to fresh, paler meat
    const cw = rT * 0.3 * o.cut, cut = [[-rT - 6, yt - rT * sq], [-rT + cw, yt - rT * sq * 0.6], [-rB + cw * 0.9, yb + 14], [-rB - 6, yb + 14]]
    const cp = K.shape(ctx, cut, { fill: K.rgba('#dc7c4c', 0.9), line: null, seed: d.seed + 7, wob: 2.2, light: { amount: 0.3, angle: Math.PI } })
    for (let k = 1; k < 4; k++) K.line(ctx, [[-rT - 4, yt + (hh * k) / 4], [-rT + cw * 0.9, yt + (hh * k) / 4 + 3]], { color: K.rgba('#a8432a', 0.6), lw: 1, seed: d.seed + k * 3, taper: 6 })
  }
  K.line(ctx, K.move(pts.slice(21), 0, -2), { color: K.rgba('#4a170c', 0.5), lw: 9, seed: d.seed + 3, taper: 30, wob: 0, swell: 0.7 })
  ctx.globalCompositeOperation = 'screen' // the fire behind rims both flanks with light
  for (const side of [-1, 1]) {
    const x0 = side * rT, gr = ctx.createLinearGradient(x0, 0, x0 - side * 34, 0)
    gr.addColorStop(0, K.rgba(C.fire, 0.4 * (o.rim ?? 1))); gr.addColorStop(1, K.rgba(C.fire, 0))
    ctx.fillStyle = gr; ctx.fillRect(Math.min(x0, x0 - side * 34), yt - rT * sq - 4, 34, hh + rT * sq * 2 + 24)
  }
  ctx.restore()
  K.ink(ctx, wp, { color: C.ink, lw: 1.9, closed: true, seed: d.seed + 11 })
  ctx.restore()
  return yt
}
// the flat top of the stack, the cut ends of the thin slices showing as rings around the spit
function trompoTop(ctx, i, yt, rot, o = {}) {
  const sq = TROMPO.sq, d = trompoSlabData(i), rT = trompoRadius(i) * (o.sx || 1)
  ctx.save(); ctx.translate(d.dx, 0)
  const wp = K.shape(ctx, K.blob(0, yt, rT * 0.985, d.seed + 5, 0.03, 56, rT * sq * 0.985), { fill: K.shade(d.col, 0.07), line: C.ink, lw: 1.7, seed: d.seed + 5, light: { amount: 0.3, angle: -2.4 }, shade: { amount: 0.35, angle: 0.4 }, texture: 0.45 })
  ctx.save(); K.pathOf(ctx, wp); ctx.clip()
  for (let k = 1; k <= 3; k++) {
    const rr = rT * (0.26 + k * 0.21), pts = [], a0 = rot + k * 1.7
    for (let j = 0; j <= 22; j++) { const a = a0 + (j / 22) * 4.4; pts.push([Math.cos(a) * rr, yt + Math.sin(a) * rr * sq]) }
    K.line(ctx, pts, { color: K.rgba('#6e2614', 0.6), lw: 1.2, seed: d.seed + k, taper: 10 })
  }
  for (let k = 0; k < 7; k++) { const a = rot + k * 0.9; K.shape(ctx, K.blob(Math.cos(a) * rT * 0.9, yt + Math.sin(a) * rT * sq * 0.9, 9, k + i, 0.4, 12, 4), { fill: K.rgba(C.char, 0.7), line: null, wob: 0.4, seed: k }) }
  ctx.restore(); ctx.restore()
}
function trompoSpit(ctx, y0, y1) { // steel skewer from its point (y0) down to y1
  const w = 6.5
  K.shape(ctx, [[0, y0 - 18], [w, y0], [w, y1], [-w, y1], [-w, y0]], { fill: C.metal, line: C.ink, lw: 1.6, seed: 71, wob: 0.4, light: { amount: 0.5, angle: Math.PI }, shade: { amount: 0.35, angle: 0 } })
  K.line(ctx, [[-2.5, y0 + 2], [-2.5, y1]], { color: K.rgba('#ffffff', 0.55), lw: 1.3, seed: 72, taper: 6 })
}
// the round plate under the meat, the spit down to a drip pan standing on yFloor
function trompoBase(ctx, yFloor) {
  const sq = TROMPO.sq, pr = 118, py = yFloor - 16
  K.groundShadow(ctx, 14, yFloor + 2, pr * 1.25, 24, 0.45, '#120c10')
  K.shape(ctx, K.ellipse(0, py + 12, pr, pr * sq, 0, 48), { fill: C.metalDark, line: C.ink, lw: 1.9, seed: 81, shade: { amount: 0.45, angle: 0.3 } })
  K.shape(ctx, K.ellipse(0, py, pr, pr * sq, 0, 48), { fill: C.metal, line: C.ink, lw: 1.9, seed: 82, light: { amount: 0.3 }, shade: { amount: 0.3, angle: 0.3 } })
  K.shape(ctx, K.ellipse(2, py + 2, pr * 0.8, pr * 0.8 * sq, 0, 48), { fill: '#8e3f24', line: K.rgba(C.ink, 0.6), lw: 1.2, seed: 83, light: { amount: 0.25, angle: -2.2 }, shade: { amount: 0.35 } })
  trompoSpit(ctx, 4, py + 2)
  K.shape(ctx, K.ellipse(0, 9, 72, 72 * sq, 0, 40), { fill: C.metalDark, line: C.ink, lw: 1.6, seed: 84 })
  K.shape(ctx, K.ellipse(0, 4, 72, 72 * sq, 0, 40), { fill: C.metal, line: C.ink, lw: 1.6, seed: 85, light: { amount: 0.4 } })
}
// a leaf of the crown: a curved blade from its base
function trompoBlade(ctx, bx, by, ang, L, Wd, bend, col, seed) {
  const L1 = [], R1 = []
  for (let k = 0; k <= 12; k++) {
    const u = k / 12, a = ang + bend * u, px = bx + Math.cos(ang + bend * u * 0.5) * L * u, py = by + Math.sin(ang + bend * u * 0.5) * L * u
    const w = (Wd / 2) * Math.pow(1 - u, 0.8) * Math.min(1, 0.4 + u * 4)
    L1.push([px - Math.sin(a) * w, py + Math.cos(a) * w]); R1.push([px + Math.sin(a) * w, py - Math.cos(a) * w])
  }
  K.shape(ctx, [...L1, ...R1.reverse()], { fill: col, line: '#28461c', lw: 1.3, seed, wob: 0.6, light: { amount: 0.25 }, shade: { amount: 0.25 } })
}
// a whole pineapple, scales wrapping round it, a spiky crown. yb = where it sits. o: { sy (squash), sway, rot, cut }
function trompoPineapple(ctx, x, yb, s, o = {}) {
  const sy = o.sy || 1, sx = 1 + (1 - sy) * 0.7, rot = o.rot || 0, sway = o.sway || 0
  const rx = 40 * s * sx, ry = 50 * s * sy, cy = yb - ry
  const cb = [x, cy - ry * 0.86]
  const leaves = [[-2.75, 44, -0.25], [-0.4, 46, 0.25], [-2.35, 60, -0.2], [-0.8, 62, 0.2], [-1.95, 72, -0.12], [-1.2, 74, 0.12], [-1.57, 80, 0.05]]
  leaves.forEach(([a, L, b], k) => trompoBlade(ctx, cb[0], cb[1] + 4 * s, a + sway * (0.6 + k * 0.08), L * s * (0.9 + 0.1 * sy), 15 * s, b, k % 2 ? C.leafDark : '#4c7f34', 800 + k))
  const wp = K.shape(ctx, K.blob(x, cy, rx, 91, 0.035, 48, ry), { fill: '#cf9436', line: C.ink, lw: 2, seed: 92, shade: { amount: 0.55, angle: 0.25 }, light: { amount: 0.35, angle: -2.5 }, texture: 0.8 })
  ctx.save(); K.pathOf(ctx, wp); ctx.clip()
  const step = 0.5, ph = trompoWrap(rot) % step, P = (th, w) => [x + rx * Math.sqrt(Math.max(0, 1 - w * w)) * Math.sin(th), cy + ry * w]
  for (const dir of [1, -1]) for (let c = -7; c <= 7; c++) { // the diamond lattice, wrapped round the fruit
    const pts = []
    for (let k = 0; k <= 16; k++) { const w = -1 + (2 * k) / 16, th = c * step + ph + dir * 1.25 * w; if (Math.abs(th) < Math.PI / 2) pts.push(P(th, w)) }
    if (pts.length > 2) K.line(ctx, pts, { color: K.rgba('#6b4512', 0.75), lw: 1.2, seed: 93 + c * 2 + dir, taper: 4, wob: 0.5 })
  }
  for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) { // a spiky eye in each diamond
    const A = (i + 0.5) * step + ph, B = (j + 0.5) * step + ph, w = (B - A) / 2.5, th = (A + B) / 2
    if (Math.abs(w) > 0.9 || Math.abs(th) > 1.35) continue
    const [ex, ey] = P(th, w), f = Math.cos(th)
    K.shape(ctx, K.ellipse(ex - 1.5 * s, ey - 2 * s, 3.2 * s * f, 2.4 * s, 0, 10), { fill: K.rgba('#f3cf63', 0.7), line: null, wob: 0 })
    K.shape(ctx, K.ellipse(ex, ey, 2 * s * f, 1.6 * s, 0, 8), { fill: '#5a3a10', line: null, wob: 0 })
  }
  if (o.cut) { // a wedge sliced off its left side shows the gold flesh
    const c = K.clamp(o.cut)
    K.shape(ctx, K.blob(x - rx * 0.95, cy + ry * 0.05, rx * 0.42 * c, 95, 0.1, 18, ry * 0.36 * c), { fill: C.pineapple, line: '#9c6a12', lw: 1.4, seed: 96, light: { amount: 0.5 } })
  }
  ctx.restore()
}
const trompoBounce = (b) => (b < 0 || b > 0.6 ? 0 : Math.exp(-b * 9) * Math.cos(b * 34))
// something falling down the spit to land at `land`: appears (fade + grow) just before it drops
function trompoFall(lt, land, yRest, yFrom) {
  const tf = Math.sqrt((2 * (yRest - yFrom)) / TROMPO_G), t0 = land - tf
  if (lt < t0 - 0.05 || lt >= land) return null
  const u = Math.max(0, lt - t0)
  return { y: Math.min(yRest, yFrom + 0.5 * TROMPO_G * u * u), a: K.clamp((lt - (t0 - 0.05)) / 0.05), v: TROMPO_G * u }
}
// the whole trompo at local time lt, turning by rot. o.lands[i]: when slab i lands (-9 = already there)
function trompoDraw(ctx, o) {
  const { rot, lt } = o, n = o.count ?? TROMPO.n, lands = o.lands || [], h = TROMPO.h
  trompoBase(ctx, o.floor ?? 92)
  let y = 0, top = -1, topY = 0, fall = null
  for (let i = 0; i < n; i++) {
    const land = lands[i] ?? -9
    if (lt < land) {
      const f = trompoFall(lt, land, y, Math.max(TROMPO.tip + 30, y - 120))
      if (f) fall = { i, ...f }
      break
    }
    const e = trompoBounce(lt - land), sy = 1 - 0.32 * e
    topY = trompoSlab(ctx, i, y, rot + i * 0.37, { sx: 1 + 0.08 * e, sy, cut: i >= 2 && i <= 10 ? o.cut : 0 })
    top = i; y = topY
  }
  if (top >= 0) trompoTop(ctx, top, topY, rot + top * 0.37, { sx: 1 + 0.08 * trompoBounce(lt - (lands[top] ?? -9)) })
  if (o.spit !== false) trompoSpit(ctx, TROMPO.tip, topY)
  if (fall) {
    ctx.save(); ctx.globalAlpha *= fall.a
    const g = K.lerp(0.75, 1, fall.a)
    const yt = trompoSlab(ctx, fall.i, fall.y, rot + fall.i * 0.37, { sx: g, sy: 0.85 })
    trompoTop(ctx, fall.i, yt, rot + fall.i * 0.37, { sx: g })
    trompoSpit(ctx, TROMPO.tip, yt)
    ctx.restore()
    for (const m of [-0.7, 0, 0.7]) { // speed marks above it
      const r = trompoRadius(fall.i)
      K.line(ctx, [[m * r, yt - 34], [m * r * 0.95, yt - 34 - Math.min(70, fall.v * 0.03)]], { color: K.rgba('#f6e8cf', 0.5 * fall.a), lw: 2, seed: 90 + m * 10, taper: 10 })
    }
  }
  for (let k = 0; k < Math.min(n, lands.length); k++) { // the newest slab lands with a slap
    const b = lt - lands[k]
    if (b < 0 || b > 0.18) continue
    const yb = -k * h - h * 0.4, r = trompoRadius(k) * 1.08, a = 1 - b / 0.18
    for (const side of [-1, 1]) for (let m = 0; m < 3; m++) {
      const ang = (side < 0 ? Math.PI : 0) + (m - 1) * 0.45 * side, d0 = r + 10 + b * 120, d1 = d0 + 16
      K.line(ctx, [[Math.cos(ang) * d0, yb + Math.sin(ang) * d0 * 0.6], [Math.cos(ang) * d1, yb + Math.sin(ang) * d1 * 0.6]], { color: K.rgba('#f6e8cf', 0.8 * a), lw: 2.2, seed: k * 7 + m, taper: 4 })
    }
  }
  return { topY, top }
}

sceneAt('trompo', {
  in: { type: 'cut' },
  draw(ctx, s) {
    K.paper(ctx, W, H, C.paper)
    const lt = s.lt, t = s.t, cx = 540, floor = 972, S = 1.15, oy = floor - 92 * S
    trompoNight(ctx, 238, t)
    trompoStreet(ctx, floor)
    trompoPicado(ctx, t, 300, 30, [[-20, 285], [795, W + 20]])
    trompoLights(ctx, t)
    trompoFire(ctx, cx, 345, 480, 570, t)
    trompoEmbers(ctx, cx - 240, 330, 480, t, 18, 21)
    trompoCounter(ctx, floor, cx)
    const lands = []
    for (let i = 0; i < TROMPO.n; i++) lands.push(i < TROMPO_PRE ? -9 : TROMPO_LAND[i - TROMPO_PRE])
    const rot = t * 0.9
    ctx.save(); ctx.translate(cx, oy); ctx.scale(S, S)
    const st = trompoDraw(ctx, { lt, rot, lands })
    // the pineapple comes down the spit from above the picture (clipped at the band's torn edge), gathering speed,
    // and crowns it on the beat with a squash, a small hop and its crown swaying
    const restY = st.topY + 4, edgeY = (241 - oy) / S, fall0 = TROMPO_PINE - 0.44
    if (lt >= fall0 && lt < TROMPO_PINE) {
      const u = (lt - fall0) / (TROMPO_PINE - fall0), y = K.lerp(edgeY, restY, u * u)
      ctx.save(); ctx.beginPath(); ctx.rect(-2000, edgeY, 4000, 4000); ctx.clip()
      trompoPineapple(ctx, 0, y, 1.25, { sy: 1 + 0.06 * u, rot, sway: -0.06 * u })
      for (const m of [-34, 0, 34]) K.line(ctx, [[m, y - 150 - 40 * u], [m, y - 180 - 90 * u]], { color: K.rgba('#f6e8cf', 0.55 * u), lw: 2, seed: 95 + m, taper: 10 })
      ctx.restore()
    }
    if (lt >= TROMPO_PINE) {
      const b = lt - TROMPO_PINE, sway = 0.22 * Math.exp(-b * 3) * Math.sin(b * 16) + 0.03 * Math.sin(t * 2)
      const hop = b < 0.18 ? 11 * Math.exp(-b * 6) * Math.max(0, Math.sin(b * 18)) : 0
      trompoPineapple(ctx, 0, restY - hop, 1.25, { sy: 1 - 0.25 * trompoBounce(b), sway, rot })
      if (b < 0.2) for (const side of [-1, 1]) for (let m = 0; m < 3; m++) { // the thump: marks at its base
        const a = 1 - b / 0.2, ang = (side < 0 ? Math.PI : 0) + (m - 1) * 0.4 * side, d0 = 58 + b * 110
        K.line(ctx, [[Math.cos(ang) * d0, restY - 12 + Math.sin(ang) * d0 * 0.5], [Math.cos(ang) * (d0 + 16), restY - 12 + Math.sin(ang) * (d0 + 16) * 0.5]], { color: K.rgba('#f6e8cf', 0.85 * a), lw: 2.2, seed: 120 + m * 3 + side, taper: 4 })
      }
      trompoSmoke(ctx, -100, st.topY - 10, t, 2, { spread: 40, rise: 140 })
      trompoSmoke(ctx, 110, st.topY - 10, t + 0.7, 2, { spread: 40, rise: 120 })
    } else trompoSmoke(ctx, 0, st.topY - 30, t, 3, { spread: 60, rise: 120, alpha: 0.25 })
    ctx.restore()
    cap(ctx, s, '6 HOURS', [['Pork in chiles and achiote, stacked on a spit.', 0.45]])
  },
})
