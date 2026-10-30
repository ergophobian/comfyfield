// 0:24 — the comal (1 MINUTE). An object on the paper: a ball of masa in a tortilla press is slammed flat on the
// beat, the raw tortilla flies onto a hot comal over a ring of gas flames, toasts with brown spots and PUFFS up
// (the key moment, 1.75 s). Steam rises; the flames never stop flickering.

const COMAL = { x: 610, y: 665, R: 305, sq: 0.4, KZ: 0.92 }
const COMAL_PRESS = { x: 190, y: 520, R: 96 }
const COMAL_T = { close: 0.3, slam: 0.5, open: 0.6, fly: 0.72, land: 1.0, puff: 1.64 }
const COMAL_RAW = '#f1e0b0'
{
  const t0 = bar(T.comal[0])
  K.cue(t0 + COMAL_T.slam, 'comal: the press slams the masa flat', 'hit')
  K.cue(t0 + COMAL_T.land, 'comal: the tortilla lands on the hot comal', 'soft')
  K.cue(t0 + 1.75, 'comal: the tortilla PUFFS', 'hit')
}
const comalBounce = (b) => (b < 0 || b > 0.6 ? 0 : Math.exp(-b * 9) * Math.cos(b * 34))
const comalP = (o, px, py, pz) => [o.x + px, o.y + py * COMAL.sq - pz * COMAL.KZ] // a 3/4-view point

// ---------- a tongue of gas flame: blue at the root, orange at the tip
function comalFlame(ctx, bx, by, h, w, t, seed) {
  const fl = 0.8 + 0.25 * K.noise1(t * 9 + seed, 211), sway = 5 * K.noise1(t * 6 + seed * 2, 212)
  K.shape(ctx, K.leaf(bx, by, bx + sway, by - h * fl, w, 0.35, 12), { fill: '#f2a23c', line: K.rgba('#8a3a14', 0.8), lw: 1.1, seed, wob: 0.6 })
  K.shape(ctx, K.leaf(bx, by + 1, bx + sway * 0.6, by - h * fl * 0.62, w * 0.75, 0.35, 12), { fill: '#7f9fd2', line: K.rgba('#2f4a7a', 0.7), lw: 1, seed: seed + 1, wob: 0.5 })
  K.shape(ctx, K.leaf(bx, by + 1, bx + sway * 0.4, by - h * fl * 0.35, w * 0.4, 0.35, 10), { fill: '#d9e6f4', line: null, seed: seed + 2, wob: 0.3 })
}

// ---------- the comal on its burner stand, over a ring of flames
function comalGriddle(ctx, t) {
  const { x, y, R, sq } = COMAL, ry = 66, rx = 172, by = y + 130, floor = 985
  K.groundShadow(ctx, x + 24, floor, R * 1.05, 44, 0.32)
  K.groundShadow(ctx, x, by + 30, R * 1.3, 150, 0.2 + 0.04 * K.noise1(t * 5, 213), C.fire) // the flames' warm light
  const leg = (a, front) => {
    const [lx, ly] = [x + Math.cos(a) * rx, by + Math.sin(a) * ry]
    K.shape(ctx, [[lx - 8, ly], [lx + 8, ly], [lx + 8 + Math.cos(a) * 30, floor - (front ? 0 : 40)], [lx - 8 + Math.cos(a) * 30, floor - (front ? 0 : 40)]], { fill: '#3c3836', line: C.ink, lw: 1.8, seed: 220 + a * 10, wob: 0.6, light: { amount: 0.25, angle: Math.PI } })
  }
  leg(-Math.PI / 2, false)
  // the burner ring
  K.shape(ctx, K.ellipse(x, by + 10, rx + 10, ry + 6, 0, 48), { fill: '#3c3836', line: C.ink, lw: 2, seed: 231, shade: { amount: 0.4 } })
  K.shape(ctx, K.ellipse(x, by, rx + 10, ry + 6, 0, 48), { fill: '#5d5753', line: C.ink, lw: 2, seed: 232, light: { amount: 0.3 } })
  K.shape(ctx, K.ellipse(x, by, rx - 16, ry - 8, 0, 48), { fill: '#2d2a29', line: C.ink, lw: 1.5, seed: 233 })
  leg(Math.PI * 0.2, true); leg(Math.PI * 0.8, true)
  for (let k = 0; k < 15; k++) { // flames all round the front of the ring
    const a = Math.PI * (0.06 + (0.88 * k) / 14)
    comalFlame(ctx, x + Math.cos(a) * rx, by + Math.sin(a) * ry, 52, 22, t, 240 + k * 3)
  }
  // the comal: a heavy round griddle, its rim, two small handles
  for (const s of [-1, 1]) K.shape(ctx, K.ellipse(x + s * (R + 18), y + 8, 26, 12, 0, 24), { fill: null, line: C.ink, lw: 6, seed: 250 + s })
  K.shape(ctx, K.ellipse(x, y + 15, R, R * sq, 0, 72), { fill: '#2f2c2b', line: C.ink, lw: 2.2, seed: 251, shade: { amount: 0.3 } })
  const top = K.shape(ctx, K.ellipse(x, y, R, R * sq, 0, 72), { fill: '#4a4542', line: C.ink, lw: 2.3, seed: 252, light: { amount: 0.28, angle: -2.3 }, shade: { amount: 0.4, angle: 0.7 }, texture: 0.7 })
  ctx.save(); K.pathOf(ctx, top); ctx.clip()
  K.shape(ctx, K.ellipse(x, y + 3, R * 0.93, R * sq * 0.9, 0, 72), { fill: null, line: K.rgba('#7a736c', 0.7), lw: 1.4, seed: 253 })
  const r = K.rng('comal-seasoning') // the seasoning: faint arcs of wear
  for (let k = 0; k < 9; k++) {
    const rr = R * (0.25 + r() * 0.6), a0 = r() * K.TAU, pts = []
    for (let j = 0; j <= 10; j++) { const a = a0 + j * 0.08; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * sq]) }
    K.line(ctx, pts, { color: K.rgba('#8b847c', 0.35), lw: 1.2, seed: 260 + k, taper: 10 })
  }
  K.line(ctx, [[x - R * 0.62, y - R * sq * 0.6], [x - R * 0.2, y - R * sq * 0.86]], { color: K.rgba('#fffaf0', 0.35), lw: 5, seed: 270, taper: 20 })
  ctx.restore()
}

// ---------- the tortilla: raw masa → toasted, flat → puffed (a dome over its rim). o: { cook, puff, sq, rot }
function comalSpots() {
  return K.memo('comal-spots', () => {
    const r = K.rng('comal-spots'), out = []
    for (let i = 0; i < 30; i++) { const rr = Math.sqrt(r()) * 0.9, a = r() * K.TAU; out.push({ u: Math.cos(a) * rr, v: Math.sin(a) * rr, s: r(), al: r(), at: r() }) }
    return out
  })
}
function comalTortilla(ctx, x, y, R, o = {}) {
  const sq = o.sq ?? COMAL.sq, h = o.puff || 0, cook = o.cook || 0, KZ = COMAL.KZ
  const z = (u, v) => h * Math.pow(Math.max(0, 1 - u * u - v * v), 0.55) * (1 + 0.16 * u - 0.1 * v)
  const at = (u, v) => [x + u * R, y + v * R * sq - KZ * z(u, v)]
  const top = [], front = [], N = 40
  for (let i = 0; i <= N; i++) {
    const u = -Math.cos((Math.PI * i) / N), vm = Math.sqrt(Math.max(0, 1 - u * u))
    let best = 1e9
    for (let j = 0; j <= 18; j++) { const v = -vm + (2 * vm * j) / 18, sy = v * R * sq - KZ * z(u, v); if (sy < best) best = sy }
    top.push([x + u * R, y + best]); front.push([x + u * R, y + vm * R * sq])
  }
  front.reverse()
  const col = K.mixColor(COMAL_RAW, C.tortilla, cook), edge = K.mixColor('#d8c08a', C.tortillaDark, cook)
  ctx.save()
  if (o.alpha != null) ctx.globalAlpha *= o.alpha
  if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); ctx.translate(-x, -y) }
  K.shape(ctx, K.move(K.ellipse(x, y, R, R * sq, 0, 64), 0, 7), { fill: edge, line: C.ink, lw: 2, seed: 281 })
  const wp = K.shape(ctx, [...top, ...front.slice(1, -1)], { fill: col, line: null, seed: 282, wob: 1.2, shade: { amount: 0.3 + h * 0.003, angle: 1.1 }, light: { amount: 0.35 + h * 0.003, angle: -2.1 }, texture: 0.9 })
  ctx.save(); K.pathOf(ctx, wp); ctx.clip()
  for (const p of comalSpots()) { // toasted spots arrive one by one as it cooks
    const a = K.clamp((cook - p.at * 0.7) / 0.3)
    if (a <= 0) continue
    const [sx, sy] = at(p.u, p.v), rr = 5 + p.s * 12
    K.shape(ctx, K.blob(sx, sy, rr, p.at * 100, 0.35, 16, rr * 0.55), { fill: K.rgba(C.toast, a * (0.4 + p.al * 0.35)), line: null, wob: 0.5, seed: p.s * 100 })
  }
  if (h > 4) { // the dome catches the light; a soft shadow where it rises off the rim
    const hl = []
    for (let k = 0; k <= 12; k++) { const a = Math.PI * 1.1 + (k / 12) * 0.8; hl.push(at(Math.cos(a) * 0.45, Math.sin(a) * 0.45)) }
    K.line(ctx, hl, { color: K.rgba('#fffaf0', K.clamp(h / 40) * 0.7), lw: 6, seed: 290, taper: 16 })
  }
  for (const [bu, bv, b0] of [[-0.3, 0.2, 0], [0.35, -0.1, 0.05], [0.1, 0.45, 0.1], [-0.5, -0.25, 0.08], [0.55, 0.3, 0.12]]) { // blisters
    const g = K.clamp((o.blister || 0) - b0) * (1 - K.clamp(h / 20))
    if (g <= 0) continue
    const [bx, byy] = at(bu, bv)
    K.shape(ctx, K.ellipse(bx, byy, 9 * g, 6 * g, 0, 16), { fill: K.shade(col, 0.25), line: K.rgba(C.ink, 0.6), lw: 1, seed: bu * 100, light: { amount: 0.5 } })
  }
  ctx.restore()
  K.ink(ctx, wp, { color: C.ink, lw: 2.2, closed: true, seed: 293 })
  ctx.restore()
  return at(0, 0)
}

// ---------- steam: soft rising squiggles that read on dark iron and on paper alike
function comalSteam(ctx, x, y, t, n, amt, o = {}) {
  if (amt <= 0) return
  const life = o.life ?? 1.4, rise = o.rise ?? 190, spread = o.spread ?? 160
  for (let i = 0; i < n; i++) {
    const age = (t * 0.9 + (i / n) * life + (o.seed || 0)) % life, p = age / life, pts = []
    const x0 = x + (i / Math.max(1, n - 1) - 0.5) * spread
    for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push([x0 + 14 * Math.sin(u * 6 + t * 2.4 + i * 1.7) * (0.3 + u), y - p * rise * 0.55 - u * rise * 0.45]) }
    const a = amt * Math.sin(Math.PI * p)
    K.line(ctx, K.move(pts, 3, 2), { color: K.rgba('#6f7a80', 0.6 * a), lw: 2, seed: 310 + i, taper: 20 })
    K.line(ctx, pts, { color: K.rgba('#fdfbf6', 0.9 * a), lw: 7, seed: 300 + i, taper: 26, swell: 0.7 })
  }
}

// ---------- a woven basket of finished tortillas under an embroidered cloth (the ones done before this one)
function comalBasket(ctx, x, y, t) {
  const rx = 118, ry = 44, hb = 74
  K.groundShadow(ctx, x + 14, y + hb + 6, rx * 1.2, 26, 0.3)
  const body = [...K.ellipse(x, y, rx, ry, 0, 48).filter(([, py]) => py >= y), [x - rx * 0.86, y + hb], [x + rx * 0.86, y + hb]]
  const bw = K.shape(ctx, [[x + rx, y], ...K.curve([[x + rx, y], [x + rx * 0.93, y + hb * 0.7], [x + rx * 0.8, y + hb]], 10), [x - rx * 0.8, y + hb], ...K.curve([[x - rx * 0.8, y + hb], [x - rx * 0.93, y + hb * 0.7], [x - rx, y]], 10)], { fill: '#c99a5b', line: C.ink, lw: 2, seed: 360, shade: { amount: 0.45, angle: 0.4 }, light: { amount: 0.25 }, texture: 0.7 })
  ctx.save(); K.pathOf(ctx, bw); ctx.clip()
  for (let k = 0; k < 4; k++) K.line(ctx, K.curve([[x - rx, y + 12 + k * 17], [x, y + 30 + k * 17 + ry * 0.4], [x + rx, y + 12 + k * 17]], 16), { color: K.rgba('#7a5428', 0.7), lw: 1.4, seed: 361 + k, taper: 0 })
  for (let k = -9; k <= 9; k++) for (let r = 0; r < 4; r++) { const wx = x + k * 13 + (r % 2) * 6.5, wy = y + 20 + r * 17 + ry * 0.4 * (1 - (k / 9) ** 2); K.line(ctx, [[wx, wy - 6], [wx + 3, wy + 6]], { color: K.rgba('#7a5428', 0.55), lw: 1.2, seed: k * 5 + r, taper: 2 }) }
  ctx.restore()
  K.shape(ctx, K.ellipse(x, y, rx, ry, 0, 48), { fill: '#b08045', line: C.ink, lw: 2, seed: 362, shade: { amount: 0.3, angle: -1.4 } })
  for (let k = 0; k < 3; k++) TACO.tortilla(ctx, x + 4 - k * 2, y - 4 - k * 9, rx * 0.84, 21 + k)
  // a corner of the cloth hangs over the front rim: cream with stitched bands
  const cl = [[x - rx * 0.98, y - 6], [x - rx * 0.5, y - 26], [x - rx * 0.05, y + ry * 0.2], [x + rx * 0.12, y + ry + 34], [x - rx * 0.55, y + ry + 16], [x - rx * 1.0, y + 18]]
  const cw = K.shape(ctx, K.curve([...cl, cl[0]], 40), { fill: '#f3ecdf', line: C.ink, lw: 1.9, seed: 363, shade: { amount: 0.35, angle: 0.8 }, light: { amount: 0.3 }, texture: 0.6 })
  ctx.save(); K.pathOf(ctx, cw); ctx.clip()
  for (const [dx, col] of [[-30, C.red], [-18, '#3d7a8a'], [-6, C.red]]) K.line(ctx, K.curve([[x - rx * 0.7 + dx, y - 30], [x - rx * 0.25 + dx, y + ry * 0.4], [x + dx * 0.5, y + ry + 40]], 16), { color: K.rgba(col, 0.85), lw: 3.2, seed: 364 + dx, taper: 0 })
  ctx.restore()
  comalSteam(ctx, x + rx * 0.55, y - 14, t + 0.6, 2, 0.4, { spread: 30, rise: 90, life: 1.8 })
}

// ---------- the tortilla press: a base plate, a lid on a hinge at the back, a lever handle
function comalLid(lt) { // how far the lid stands open (radians)
  const d = K.keys(lt, [[0, 74], [COMAL_T.close, 74], [COMAL_T.slam, 0, 'in'], [COMAL_T.open, 0], [COMAL_T.open + 0.22, 78, 'out']])
  return ((d + 5 * comalBounce(lt - COMAL_T.slam) * (lt > COMAL_T.slam ? 1 : 0) * 0) * Math.PI) / 180
}
function comalPress(ctx, lt, t, masa) {
  const o = COMAL_PRESS, R = o.R, th = comalLid(lt), P = (a, b, c) => comalP(o, a, b, c)
  const ring = (z, r = R) => { const out = []; for (let k = 0; k < 48; k++) { const a = (k / 48) * K.TAU; out.push(P(Math.cos(a) * r, Math.sin(a) * r, z)) } return out }
  const lid = (off) => { // the lid's face, rotated about the hinge; off = along its normal
    const out = [], ny = -Math.sin(th), nz = Math.cos(th)
    for (let k = 0; k < 48; k++) { const a = (k / 48) * K.TAU, dy = R * Math.sin(a) + R; out.push(P(R * Math.cos(a), -R + dy * Math.cos(th) + ny * off, 18 + dy * Math.sin(th) + nz * off)) }
    return out
  }
  const kick = comalBounce(lt - COMAL_T.slam) * 4
  ctx.save(); ctx.translate(0, kick)
  K.groundShadow(ctx, o.x + 14, o.y + 22, R * 1.35, R * COMAL.sq * 1.25, 0.28)
  K.shape(ctx, ring(0), { fill: '#5e5a58', line: C.ink, lw: 2, seed: 201, shade: { amount: 0.4 } })
  K.shape(ctx, ring(14), { fill: '#8f8b88', line: C.ink, lw: 2, seed: 202, light: { amount: 0.35 }, shade: { amount: 0.3 }, texture: 0.6 })
  K.shape(ctx, ring(14, R * 0.8), { fill: null, line: K.rgba(C.ink, 0.4), lw: 1.2, seed: 216 })
  for (const hx of [-34, 34]) { const [lx, ly] = P(hx, -R, 26); K.shape(ctx, K.rect(lx - 9, ly - 12, 18, 24, 5), { fill: '#7c8086', line: C.ink, lw: 1.5, seed: 203 + hx }) }
  const inner = th > 0.41 // past ~24° we look at the lid's pressing face
  const drawLid = () => {
    const [a, b] = inner ? [lid(12), lid(0)] : [lid(0), lid(12)]
    K.shape(ctx, a, { fill: '#4d4947', line: C.ink, lw: 2, seed: 205 })
    const face = K.shape(ctx, b, { fill: inner ? '#a19d99' : '#76716e', line: C.ink, lw: 2, seed: 206, light: { amount: 0.3, angle: -2 }, shade: { amount: 0.35 }, texture: 0.6 })
    const cen = K.bounds(face)
    if (inner) K.shape(ctx, K.scale(b, 0.78, 0.78, cen.cx, cen.cy), { fill: null, line: K.rgba(C.ink, 0.45), lw: 1.3, seed: 214 })
    else for (let k = -2; k <= 2; k++) K.line(ctx, [K.lerp(b[12], b[36], 0.5 + k * 0.17), K.lerp(b[12], b[36], 0.5 + k * 0.17)].map((p, j) => [p[0] + (j ? 1 : -1) * Math.sqrt(1 - (k * 0.34) ** 2) * R * 0.85, p[1]]), { color: K.rgba(C.ink, 0.5), lw: 1.4, seed: 215 + k, taper: 6 })
    const dy0 = 2 * R, dy1 = 2 * R + 70, nz = Math.cos(th), ny = -Math.sin(th) // the lever handle out of its front
    const h0 = P(0, -R + dy0 * Math.cos(th) + ny * 6, 18 + dy0 * Math.sin(th) + nz * 6), h1 = P(0, -R + dy1 * Math.cos(th) + ny * 6, 18 + dy1 * Math.sin(th) + nz * 6)
    K.line(ctx, [h0, h1], { color: C.ink, lw: 15, seed: 207, taper: 0, wob: 0 })
    K.line(ctx, [h0, h1], { color: '#6e6a67', lw: 10, seed: 208, taper: 0, wob: 0 })
    K.shape(ctx, K.circle(h1[0], h1[1], 13, 20), { fill: '#9a6a44', line: C.ink, lw: 1.8, seed: 209, light: { amount: 0.4 } })
  }
  if (inner) drawLid()
  if (masa === 'ball') { // squashed by the lid as it comes down
    const lidZ = 18 + R * Math.sin(th), hb = K.clamp(lidZ - 14, 6, 64), rx = 32 * Math.sqrt(64 / hb) ** 0.8
    const [bx, by] = P(0, 0, 14 + hb / 2)
    K.groundShadow(ctx, bx + 4, P(0, 0, 14)[1] + 3, rx * 1.1, 9, 0.3)
    K.shape(ctx, K.blob(bx, by, rx, 291, 0.05, 32, hb / 2 + 4), { fill: COMAL_RAW, line: C.ink, lw: 2, seed: 291, shade: { amount: 0.35, angle: 0.9 }, light: { amount: 0.4 }, texture: 0.9, boil: 8, t })
  } else if (masa === 'flat') comalTortilla(ctx, o.x, P(0, 0, 16)[1], 84, { sq: COMAL.sq })
  if (!inner) drawLid()
  if (lt > COMAL_T.slam && lt < COMAL_T.slam + 0.2) { // the slam: marks and a breath of flour
    const a = 1 - (lt - COMAL_T.slam) / 0.2
    for (let k = 0; k < 7; k++) {
      const ang = Math.PI + (k / 6) * Math.PI, d0 = R * 1.15 + (1 - a) * 30
      K.line(ctx, [[o.x + Math.cos(ang) * d0, o.y + Math.sin(ang) * d0 * 0.55], [o.x + Math.cos(ang) * (d0 + 18), o.y + Math.sin(ang) * (d0 + 18) * 0.55]], { color: K.rgba(C.ink, a), lw: 2, seed: 330 + k, taper: 4 })
    }
  }
  ctx.restore()
}

sceneAt('comal', {
  in: { type: 'slide', dur: 0.5, dir: 'left' },
  draw(ctx, s) {
    K.paper(ctx, W, H, C.paper)
    const lt = s.lt, t = s.t, T_ = COMAL_T
    comalGriddle(ctx, t)
    comalBasket(ctx, 165, 845, t)
    comalPress(ctx, lt, t, lt < T_.slam ? 'ball' : lt < T_.fly ? 'flat' : null)
    const { x, y, R } = COMAL
    if (lt >= T_.fly && lt < T_.land) { // the raw tortilla flies over onto the comal
      const p = K.at(lt, T_.fly, T_.land - T_.fly, 'inOut'), [x0, y0] = comalP(COMAL_PRESS, 0, 0, 16)
      const fx = K.lerp(x0, x - 10, p), fy = K.lerp(y0, y - 2, p) - 150 * Math.sin(Math.PI * p)
      comalTortilla(ctx, fx, fy, K.lerp(80, 180, p), { sq: COMAL.sq * (1 + 0.5 * Math.sin(Math.PI * p)), rot: -0.35 * Math.sin(Math.PI * p) })
      for (let k = 0; k < 3; k++) K.line(ctx, [[fx - 110 - k * 4, fy - 20 + k * 22], [fx - 170 - k * 10, fy + 10 + k * 26]], { color: K.rgba(C.ink, 0.5 * Math.sin(Math.PI * p)), lw: 2, seed: 340 + k, taper: 8 })
    }
    let top = null
    if (lt >= T_.land) {
      const e = comalBounce(lt - T_.land), b = lt - T_.puff
      const puff = 100 * K.spring(b, 3.4, 0.45) + 3 * Math.sin(t * 3.1) * K.at(lt, 2.2, 0.4)
      K.groundShadow(ctx, x - 2, y + 8, 194, 80, 0.45, '#1b1410')
      top = comalTortilla(ctx, x - 10, y - 2, 180 * (1 + 0.05 * e), { cook: K.at(lt, T_.land + 0.05, 0.7, 'out'), puff, sq: COMAL.sq * (1 - 0.12 * e), blister: K.at(lt, 1.36, 0.3, 'out') * 1.15 })
      const bm = lt - 1.72
      if (bm > 0 && bm < 0.3) { // the puff: marks spring out round the dome
        const a = Math.min(1, bm / 0.03) * (1 - bm / 0.3)
        for (let k = 0; k < 9; k++) {
          const ang = Math.PI * (1.05 + (k / 8) * 0.9), d0 = 200 + bm * 140
          K.line(ctx, [[x - 10 + Math.cos(ang) * d0, y - 50 + Math.sin(ang) * d0 * 0.6], [x - 10 + Math.cos(ang) * (d0 + 26), y - 50 + Math.sin(ang) * (d0 + 26) * 0.6]], { color: K.rgba(C.ink, a), lw: 2.4, seed: 350 + k, taper: 5 })
        }
      }
      comalSteam(ctx, x - 10, (top ? top[1] : y) - 10, t, 6, 0.45 * K.at(lt, T_.land, 0.3) + 0.55 * K.at(lt, 1.75, 0.25, 'out'), { spread: 200, rise: 230 })
    }
    K.label(ctx, 'Masa', 300, 330, COMAL_PRESS.x + 16, COMAL_PRESS.y - 40, { draw: K.at(lt, 0.05, 0.35, 'out') * (1 - K.at(lt, 0.42, 0.1)), size: 24, side: 'right' })
    K.label(ctx, 'Comal', 935, 540, x + R * 0.84, y - 40, { draw: K.at(lt, 1.15, 0.4, 'out'), size: 24, side: 'right' })
    cap(ctx, s, '1 MINUTE', [['Tortillas puff on the hot comal.', 0.4]])
  },
})
