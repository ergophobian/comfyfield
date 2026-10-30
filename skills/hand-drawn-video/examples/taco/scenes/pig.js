// 0:09 PIG — six months in three seconds. A pink piglet trots into a Jalisco farmyard (blue agave rows on the
// hills, an adobe shed under clay tiles, a rail fence, a nopal, hens pecking), stops to root in the mud and
// grows as it goes into a full-size pig that lifts its head.
const PIG_T0 = bar(T.pig[0])
K.cue(PIG_T0 + 6 * EIGHTH, 'pig: stops and roots in the mud', 'hit')
K.cue(PIG_T0 + 8 * EIGHTH, 'pig: snout flicks dirt', 'soft')
K.cue(PIG_T0 + 10 * EIGHTH, 'pig: grown, head up', 'hit')
const PIG = { gy: 948 }
const PIG_COL = { earth: '#d8b57f', earthDark: '#c49a66', mud: '#9c7650', field: '#b9845a', agave: '#7fa0ae', agaveDark: '#5d7f90', far: '#b0c1ca', wall: '#efe4cd', adobe: '#c8996b', tile: '#b65a3b', wood: '#8f7658', hoof: '#6e4a3a' }

// the pig's clock: where it is, how grown, what its head is doing
function pigClock(lt) {
  const x = K.keys(lt, [[0, 205], [1.5, 455, 'out'], [2.6, 455], [3.2, 470, 'inOut']])
  const move = 1 - K.at(lt, 1.15, 0.4, 'inOut') + K.at(lt, 2.75, 0.3) * 0.3
  const root = K.at(lt, 1.4, 0.25, 'out') * (1 - K.at(lt, 2.42, 0.3, 'out'))
  return {
    x, move, gp: K.at(lt, 0.0, 2.7, 'inOutSine'),
    // rooting: the head goes down and nods on the eighths, then comes up with a spring at 2.5
    root, pitch: root * (0.62 + 0.1 * Math.sin((lt - 1.5) * K.TAU * 2)) - 0.12 * (K.spring(lt - 2.45, 2.2, 0.35) - K.at(lt, 2.45, 0.6)),
    phase: lt * 4 * Math.PI,
  }
}

// ---------- the pig, side view facing right. S = screen px per unit, gp = 0 piglet → 1 grown pig
function pigPig(ctx, x, gy, S, gp, o) {
  // the whole pig leans forward a little when it roots (about its hind feet)
  const T = (pts) => K.rotate(pts, (o.root || 0) * 0.09, -120, 0).map(([px, py]) => [x + px * S, gy + py * S])
  const a = K.lerp(126, 186, gp), b = K.lerp(84, 96, gp), L = K.lerp(70, 90, gp), hr = K.lerp(80, 68, gp)
  const bob = -Math.abs(Math.cos(o.phase)) * 7 * o.move + Math.sin(o.t * 5) * 1.2
  const cy = -(L + b * 0.6) + bob
  const pink = C.pig, dark = C.pigDark, lw = 2.1
  const sh = (pts, fill, seed, more = {}) => K.shape(ctx, T(pts), { fill, line: C.ink, lw, seed, wob: 1, texture: 0.4, ...more })
  // legs: diagonal pairs swing together (a trot); far ones a shade darker, set back a little
  const legs = [[a * 0.6 + 14, Math.PI, 0], [-a * 0.55 + 14, 0, 0], [a * 0.48, 0, 1], [-a * 0.68, Math.PI, 1]]
  const leg = ([hx, off, near], i) => {
    const sw = 0.36 * Math.sin(o.phase + off) * o.move, lift = Math.max(0, -Math.cos(o.phase + off)) * 16 * o.move
    const hip = [hx, cy + b * 0.35], len = -hip[1] - lift
    const foot = [hx + Math.sin(sw) * len, -lift]
    const dx = foot[0] - hip[0], dy = foot[1] - hip[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l
    const wt = 26 + 8 * gp, wb = 12 + 3 * gp, hb = [foot[0] - (dx / l) * 12, foot[1] - (dy / l) * 12]
    const col = near ? pink : K.shade(dark, -0.05), mid = [K.lerp(hip[0], hb[0], 0.62), K.lerp(hip[1], hb[1], 0.62)], wm = wb * 1.15
    const k = hx < 0 ? -6 : 2 // hind legs show a hock behind, front legs a knee in front
    sh([[hip[0] - nx * wt, hip[1] - ny * wt], [mid[0] - nx * wm + k, mid[1]], [hb[0] - nx * wb, hb[1] - ny * wb], [hb[0] + nx * wb, hb[1] + ny * wb], [mid[0] + nx * wm + k, mid[1]], [hip[0] + nx * wt, hip[1] + ny * wt]], col, 40 + i, { shade: { amount: 0.32, angle: 0 }, light: { amount: 0.2, angle: Math.PI } })
    // mud on the shins once it has been in the yard a while
    if (gp > 0.3) K.shape(ctx, T([[hb[0] - nx * wb * 1.05, hb[1] - ny * wb - 22], [hb[0] - nx * wb, hb[1] - ny * wb], [hb[0] + nx * wb, hb[1] + ny * wb], [hb[0] + nx * wb * 1.05, hb[1] + ny * wb - 16]]), { fill: K.rgba(PIG_COL.mud, 0.55 * K.inv(0.3, 0.8, gp)), line: null, wob: 1.5, seed: 50 + i })
    sh([[hb[0] - nx * wb, hb[1] - ny * wb], [foot[0] - nx * wb * 1.1, foot[1]], [foot[0] + nx * wb * 1.1, foot[1]], [hb[0] + nx * wb, hb[1] + ny * wb]], PIG_COL.hoof, 60 + i, { lw: 1.6 })
    K.line(ctx, T([[foot[0] + nx * 1, foot[1] - 1], [hb[0] + nx * 1 + (dx / l) * 4, hb[1] + (dy / l) * 4]]), { color: '#3a2620', lw: 1.2, wob: 0, taper: 2 })
  }
  legs.filter((l) => !l[2]).forEach(leg)
  // the curly tail, wagging
  const wag = 0.25 * Math.sin(o.t * 9) + 0.15
  const tb = [-a * 0.9, cy - b * 0.42], tc = [-a - 20, cy - b * 0.62 - 6], tail = [tb, [-a - 6, cy - b * 0.5]]
  for (let k = 0; k <= 24; k++) { const an = 0.4 + wag - (k / 24) * 9.4, r = 13 - k * 0.32; tail.push([tc[0] + Math.cos(an) * r, tc[1] + Math.sin(an) * r * 0.85]) }
  K.line(ctx, T(tail), { color: C.ink, lw: 6.2 * Math.max(0.6, S), wob: 0.3, taper: 6, seed: 3 })
  K.line(ctx, T(tail), { color: pink, lw: 3.6 * Math.max(0.6, S), wob: 0.3, taper: 6, seed: 3 })
  legs.filter((l) => l[2]).forEach(leg)
  // the barrel of the body: rump rounder than the shoulder, belly sags, back dips a hair
  const body = []
  for (let i = 0; i < 64; i++) {
    const an = (i / 64) * K.TAU, c = Math.cos(an), s = Math.sin(an)
    let px = a * Math.sign(c) * Math.pow(Math.abs(c), 0.8), py = s < 0 ? -b * Math.pow(-s, 0.6) : b * Math.pow(s, 0.85) // a level back, a round belly
    const u = 1 - (px / a) * (px / a)
    py += py > 0 ? 16 * u : 7 * u
    if (py < 0 && px < 0) py -= 7 * (-px / a) * u * 2    // the rump stands a little higher
    if (py < 0 && px > a * 0.5) py += 12 * (px / a - 0.5)  // the shoulder slopes into the neck
    body.push([px, cy + py])
  }
  sh(body, pink, 7, { shade: { amount: 0.5, angle: 1.45, color: '#9a4a44', start: 0.42 }, light: { amount: 0.5, angle: -1.9 }, hatch: { angle: -0.85, gap: 6, alpha: 0.3, side: Math.PI / 2, from: 0.62 } })
  // the belly in shadow, the back catching the light
  const [[, yb0]] = T([[0, cy + b * 0.05]]), [[, yb1]] = T([[0, cy + b * 1.12]]), [[, yt0]] = T([[0, cy - b * 1.02]]), [[, yt1]] = T([[0, cy - b * 0.45]])
  ctx.save(); K.pathOf(ctx, T(body)); ctx.clip()
  const gb = ctx.createLinearGradient(0, yb0, 0, yb1); gb.addColorStop(0, 'rgba(150,64,60,0)'); gb.addColorStop(1, 'rgba(150,64,60,0.42)'); ctx.fillStyle = gb; ctx.fillRect(0, yb0, W, yb1 - yb0 + 20)
  const gt = ctx.createLinearGradient(0, yt0, 0, yt1); gt.addColorStop(0, 'rgba(255,246,236,0.5)'); gt.addColorStop(1, 'rgba(255,246,236,0)'); ctx.fillStyle = gt; ctx.fillRect(0, yt0 - 10, W, yt1 - yt0 + 10)
  ctx.restore()
  // ham and shoulder creases, a few bristles along the back
  K.line(ctx, T(K.curve([[-a * 0.42, cy + b * 0.85], [-a * 0.38, cy + b * 0.2], [-a * 0.55, cy - b * 0.35], [-a * 0.75, cy - b * 0.5]])), { color: K.rgba(C.ink, 0.6), lw: 1.8, wob: 0.6, taper: 14, seed: 11 })
  K.line(ctx, T(K.curve([[a * 0.34, cy + b * 0.85], [a * 0.4, cy + b * 0.3], [a * 0.5, cy - b * 0.2]])), { color: K.rgba(C.ink, 0.5), lw: 1.6, wob: 0.6, taper: 14, seed: 12 })
  for (const [px, py] of [[a * 0.6, cy + b * 0.3], [a * 0.64, cy + b * 0.48]]) K.line(ctx, T(K.curve([[px, py - 14], [px + 6, py], [px, py + 14]])), { color: K.rgba(C.ink, 0.35), lw: 1.1, wob: 0.3, taper: 5 })
  for (let k = 0; k < 7; k++) { const px = -a * 0.6 + k * a * 0.2, py = cy - b * 0.98 - 3; K.line(ctx, T([[px, py + 6], [px - 3, py - 3]]), { color: K.rgba(C.ink, 0.4), lw: 1, wob: 0, taper: 2 }) }
  // the head pitches about the neck (rooting), its pieces built in body units
  const piv = [a * 0.66, cy - b * 0.05], drop = (o.root || 0) * 22, R = (pts) => T(K.move(K.rotate(pts, o.pitch, piv[0], piv[1]), 0, drop))
  const hx = a * 0.86 + hr * 0.25, hy = cy - b * 0.18, flop = 0.14 * Math.sin(o.phase * 2) * o.move + 0.1 * K.pulse(o.t, [o.upAt], 0.5)
  const ear = (bx, by, tx, ty, w, col, seed, f) => {
    const L0 = K.rotate(K.leaf(bx, by, tx, ty, w, 0.35), f, bx, by)
    K.shape(ctx, R(L0), { fill: col, line: C.ink, lw, seed, wob: 0.8, shade: { amount: 0.3, angle: 1 } })
    return L0
  }
  const es = K.lerp(1.25, 1, gp)
  ear(hx - hr * 0.42, hy - hr * 0.62, hx + hr * 0.05, hy - hr * 1.5 * es, hr * 0.62 * es, K.shade(dark, -0.08), 70, -flop * 0.7 - 0.2)
  const head = K.ellipse(hx, hy, hr * 1.05, hr * 0.92, -0.12, 48)
  K.shape(ctx, R(head), { fill: pink, line: C.ink, lw, seed: 72, wob: 1, texture: 0.4, shade: { amount: 0.3, angle: 1.2 }, light: { amount: 0.42, angle: -2.3 } })
  const sl = K.lerp(1.0, 1.14, gp), s0 = [hx + hr * 0.55, hy + hr * 0.02], s1 = [hx + hr * sl, hy + hr * 0.2], sr = hr * 0.36
  const top = K.curve([[s0[0] - hr * 0.05, s0[1] - sr * 1.15], [K.lerp(s0[0], s1[0], 0.5), K.lerp(s0[1], s1[1], 0.5) - sr * 1.12], [s1[0], s1[1] - sr]], 12)
  const bot = K.curve([[s1[0], s1[1] + sr], [K.lerp(s0[0], s1[0], 0.5), K.lerp(s0[1], s1[1], 0.5) + sr * 1.1], [s0[0] - hr * 0.2, s0[1] + sr * 1.3]], 12)
  K.shape(ctx, R(top.concat(bot)), { fill: pink, line: C.ink, lw, seed: 74, wob: 0.8, shade: { amount: 0.35, angle: 1.4, color: '#9a4a44' }, light: { amount: 0.3, angle: -1.8 } })
  for (const f of [0.22, 0.4]) K.line(ctx, R(K.curve([[K.lerp(s0[0], s1[0], f) - 3, s0[1] - sr * 1.05], [K.lerp(s0[0], s1[0], f) + 3, s0[1] - sr * 0.6]], 6)), { color: K.rgba(C.ink, 0.5), lw: 1.2, wob: 0.2, taper: 4 })
  K.shape(ctx, R(K.ellipse(s1[0], s1[1], sr * 0.58, sr * 1.04, -0.12, 32)), { fill: '#e8a092', line: C.ink, lw, seed: 75, wob: 0.6, shade: { amount: 0.25, angle: 0.3 } })
  for (const d of [-1, 1]) K.shape(ctx, R(K.ellipse(s1[0] + d * sr * 0.18, s1[1] + d * sr * 0.02, sr * 0.11, sr * 0.26, -0.12, 14)), { fill: '#8a4038', line: null, wob: 0.3, seed: 76 + d })
  K.line(ctx, R(K.curve([[s1[0] - hr * 0.08, s1[1] + sr * 1.05], [hx + hr * 0.62, hy + hr * 0.5], [hx + hr * 0.36, hy + hr * 0.4]])), { color: C.ink, lw: 2, wob: 0.5, taper: 6, seed: 77 })
  K.shape(ctx, R(K.circle(hx + hr * 0.12, hy + hr * 0.3, hr * 0.24, 20)), { fill: K.rgba('#e5727a', 0.28), line: null, wob: 0.5, seed: 78 })
  // the eye (bigger on the piglet), with a lid that blinks once
  const ex = hx + hr * 0.32, ey = hy - hr * 0.3, er = K.lerp(10, 8.5, gp), blink = K.pulse(o.t, [o.blinkAt], 0.16)
  K.shape(ctx, R(K.ellipse(ex, ey, er * 0.8, er * (1 - 0.9 * blink), 0, 20)), { fill: '#2b2420', line: null, wob: 0.2, seed: 79 })
  if (blink < 0.5) K.shape(ctx, R(K.circle(ex - er * 0.25, ey - er * 0.35, er * 0.3, 10)), { fill: '#fffaf0', line: null, wob: 0 })
  K.line(ctx, R([[ex - er * 1.2, ey - er * 1.3], [ex + er * 0.9, ey - er * 1.5]]), { color: K.rgba(C.ink, 0.7), lw: 1.4, wob: 0.4, taper: 4 })
  const L1 = ear(hx - hr * 0.15, hy - hr * 0.72, hx + hr * 0.5, hy - hr * 1.55 * es, hr * 0.72 * es, pink, 80, -flop)
  K.shape(ctx, R(K.scale(L1, 0.62, 0.62, hx - hr * 0.15, hy - hr * 0.72)), { fill: '#e48f86', line: null, wob: 0.5, seed: 81 })
  return { snout: R([s1])[0] }
}

// ---------- the farmyard behind, drawn once
function pigAgave(ctx, x, y, s, seed) {
  for (let i = 0; i < 7; i++) {
    const an = -Math.PI / 2 + (i - 3) * 0.36
    K.shape(ctx, K.leaf(x, y, x + Math.cos(an) * 15 * s, y + Math.sin(an) * 15 * s * (1 - Math.abs(i - 3) * 0.08), 4 * s), { fill: i % 2 ? PIG_COL.agave : PIG_COL.agaveDark, line: K.rgba('#3f5866', 0.8), lw: 0.7, wob: 0.2, seed: seed + i })
  }
}
function pigBack() {
  return K.memo('pig-back', () => {
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const g = c.getContext('2d')
    // far blue range with the cone of the Tequila volcano
    const far = [[0, H]]
    for (let x = 0; x <= W; x += 12) far.push([x, 530 - 40 * (0.5 + 0.5 * K.noise1(x * 0.006, 21)) - Math.max(0, 150 - Math.abs(x - 640) * 0.5) * (0.9 + 0.1 * K.noise1(x * 0.05, 3))])
    far.push([W, H])
    K.shape(g, far, { fill: PIG_COL.far, line: null, wob: 0.6, seed: 21, texture: 0.5, shade: { amount: 0.12, angle: 0.3 } })
    for (const dx of [-70, -25, 30, 80]) K.line(g, [[640 + dx * 0.25, 392 + Math.abs(dx) * 0.1], [640 + dx * 1.6, 480 + Math.abs(dx) * 0.25]], { color: K.rgba('#7f93a0', 0.5), lw: 1.4, wob: 1, taper: 20, seed: dx + 100 })
    hill(g, 585, 70, PIG_COL.field, 22, H, { shade: { amount: 0.15, angle: 1.6 } })
    // rows of blue agave following the slope (the same ridge formula hill() uses)
    const ridge = (x) => 585 - 70 * (0.5 + 0.5 * K.noise1(x * 0.004 + 22, 22))
    const r = K.rng('pig-agave')
    for (let row = 0; row < 6; row++) for (let x = (row % 2) * 12 - 10; x < W + 20; x += 22 + row * 3) pigAgave(g, x + r() * 4, ridge(x) + 10 + row * 11, 0.75 + row * 0.18, row * 100 + x)
    // the yard
    K.shape(g, [[0, 640], ...K.wob([[0, 632], [W, 638]], { seed: 6, amp: 3, closed: false, step: 14 }), [W, 645], [W, H], [0, H]], { fill: PIG_COL.earth, line: null, wob: 0, texture: 0.9 })
    for (let i = 0; i < 16; i++) { const x = r() * W, y = 680 + r() * 380, rx = 40 + r() * 120; K.shape(g, K.blob(x, y, rx, i, 0.3, 24, rx * 0.16), { fill: K.rgba(PIG_COL.earthDark, 0.45), line: null, wob: 1, seed: i }) }
    K.shape(g, K.blob(775, 962, 160, 4, 0.22, 40, 36), { fill: PIG_COL.mud, line: K.rgba(C.ink, 0.55), lw: 1.4, seed: 4, texture: 0.6, shade: { amount: 0.3, angle: 1.6 } })
    K.shape(g, K.blob(790, 957, 85, 5, 0.25, 30, 12), { fill: K.rgba('#cfc3ae', 0.55), line: null, wob: 0.5, seed: 5 })
    K.line(g, [[745, 950], [810, 946]], { color: K.rgba('#fffaf0', 0.7), lw: 2, wob: 0.5, taper: 8 })
    // grass tufts along the fence and the shed
    for (let i = 0; i < 26; i++) { const x = r() * W, y = i < 18 ? 722 + r() * 10 : 715 + r() * 8; for (let k = -2; k <= 2; k++) K.line(g, [[x + k * 3, y], [x + k * 6 + r() * 4, y - 10 - r() * 12]], { color: r() < 0.5 ? '#8aa356' : '#a3b569', lw: 1.6, wob: 0, taper: 4 }) }
    for (let i = 0; i < 90; i++) { const x = r() * W, y = 660 + Math.pow(r(), 0.8) * 420, l = 6 + r() * 10, an = r() * Math.PI; K.line(g, [[x, y], [x + Math.cos(an) * l, y + Math.sin(an) * l * 0.4]], { color: r() < 0.6 ? '#e9d08a' : '#b89455', lw: 1.3, wob: 0, taper: 2 }) }
    for (let i = 0; i < 40; i++) { const x = r() * W, y = 660 + r() * 420, s = 2 + r() * 4; K.shape(g, K.blob(x, y, s, i + 40, 0.4, 10, s * 0.6), { fill: '#b9a68c', line: K.rgba(C.ink, 0.5), lw: 0.8, wob: 0.2, seed: i }) }
    // the rail fence, weathered grey wood
    K.groundShadow(g, 700, 725, 520, 16, 0.18)
    for (const [y, sd] of [[664, 1], [700, 2]]) K.shape(g, [[290, y], [W + 10, y - 6], [W + 10, y + 6], [290, y + 12]], { fill: '#a08a6c', line: C.ink, lw: 1.5, seed: 200 + sd, shade: { amount: 0.25, angle: 1.6 }, texture: 0.6 })
    for (let x = 310; x < W + 40; x += 118) K.shape(g, K.rect(x, 640 - (x % 3) * 2, 16, 88, 3), { fill: PIG_COL.wood, line: C.ink, lw: 1.6, seed: x, shade: { amount: 0.35, angle: 0 }, texture: 0.7, hatch: { angle: 0.3, gap: 5, alpha: 0.18 } })
    // the adobe shed under clay tiles
    K.groundShadow(g, 160, 712, 230, 20, 0.25)
    K.shape(g, K.rect(-20, 488, 330, 222), { fill: PIG_COL.wall, line: C.ink, lw: 2, seed: 210, shade: { amount: 0.22, angle: 0.2 }, texture: 0.8 })
    // where the whitewash has fallen off, the adobe bricks show
    for (const [px, py, w0, h0] of [[20, 610, 90, 56], [238, 522, 64, 40]]) {
      const patch = K.blob(px + w0 / 2, py + h0 / 2, w0 / 2, px, 0.35, 20, h0 / 2)
      K.shape(g, patch, { fill: PIG_COL.adobe, line: null, seed: px, texture: 0.6 })
      g.save(); K.pathOf(g, patch); g.clip()
      for (let k = 0; k < 6; k++) for (let m = -1; m < 5; m++) K.shape(g, K.rect(px + m * 26 + (k % 2) * 13, py + k * 12 - 4, 24, 10, 2), { fill: K.shade(PIG_COL.adobe, (k * 7 + m * 3) % 5 * 0.03 - 0.06), line: K.rgba('#7a5638', 0.7), lw: 0.9, wob: 0.4, seed: k * 10 + m })
      g.restore()
      K.shape(g, patch, { fill: null, line: K.rgba(C.ink, 0.6), lw: 1.3, seed: px + 1 })
    }
    K.shape(g, K.rect(170, 575, 78, 135, 3), { fill: '#6e4e35', line: C.ink, lw: 2, seed: 212, shade: { amount: 0.3 }, hatch: { angle: 1.5, gap: 13, alpha: 0.3 } })
    K.shape(g, K.rect(60, 525, 56, 44), { fill: '#4a3a30', line: C.ink, lw: 1.8, seed: 213 })
    for (let k = 1; k < 4; k++) K.line(g, [[60 + k * 14, 527], [60 + k * 14, 567]], { color: PIG_COL.wood, lw: 2.5, wob: 0.3, taper: 0 })
    const roof = [[-30, 470], [345, 448], [352, 500], [-30, 516]]
    K.shape(g, roof, { fill: PIG_COL.tile, line: C.ink, lw: 2, seed: 214, shade: { amount: 0.3, angle: 1.5 }, texture: 0.8 })
    for (let x = -20; x < 350; x += 22) {
      const t0 = 470 - (x + 30) * 0.0587, t1 = 516 - (x + 30) * 0.042
      K.line(g, [[x, t0], [x + 1, t1]], { color: K.rgba('#6e2c1c', 0.6), lw: 1.4, wob: 0.4, taper: 3 })
      K.shape(g, K.ellipse(x + 11, t1 + 1, 11, 6), { fill: '#a54d31', line: C.ink, lw: 1.2, seed: x + 300 })
    }
    // a nopal by the fence, two red tunas on it
    for (const [px, py, rx, ry, rot] of [[985, 735, 34, 50, 0.1], [952, 668, 26, 40, -0.5], [1018, 668, 26, 38, 0.45], [985, 630, 22, 33, 0]]) {
      K.shape(g, K.ellipse(px, py, rx, ry, rot), { fill: '#7aa05a', line: '#3e5a2c', lw: 1.6, seed: px + py, shade: { amount: 0.3, angle: 0.4 }, light: { amount: 0.25 } })
      for (let k = 0; k < 6; k++) K.shape(g, K.circle(px + Math.cos(k * 2.1) * rx * 0.5, py + Math.sin(k * 2.1) * ry * 0.5, 1.6, 6), { fill: '#e8e0b0', line: null, wob: 0 })
    }
    for (const [px, py] of [[968, 602], [999, 598]]) K.shape(g, K.ellipse(px, py, 9, 12), { fill: '#c9405a', line: C.ink, lw: 1.3, seed: px, light: { amount: 0.3 } })
    return c
  })
}
// a hen that pecks on the eighths
function pigHen(ctx, x, y, s, dir, lt, col, seed) {
  const pk = K.pulse(lt, [0.25, 0.75, 1.0, 1.75, 2.25, 2.5, 3.0].map((v) => v + seed * 0.08), 0.22)
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s)
  K.groundShadow(ctx, 0, 2, 30, 6, 0.22)
  for (const lx of [-6, 6]) K.line(ctx, [[lx, -22], [lx + 2, 0], [lx + 8, 0]], { color: '#d98a2b', lw: 2.2, wob: 0, taper: 0 })
  const body = K.blob(0, -34, 26, seed, 0.12, 30, 19)
  K.shape(ctx, [[-22, -40], [-38, -66], [-30, -38]], { fill: K.shade(col, -0.15), line: C.ink, lw: 1.6, seed: seed + 1 })
  K.shape(ctx, body, { fill: col, line: C.ink, lw: 1.8, seed, shade: { amount: 0.3, angle: 1.4 }, light: { amount: 0.3 } })
  K.line(ctx, K.curve([[-12, -36], [2, -30], [12, -38]]), { color: K.rgba(C.ink, 0.5), lw: 1.2, wob: 0.4, taper: 4 })
  ctx.translate(18, -46); ctx.rotate(pk * 1.1)
  K.shape(ctx, K.circle(4, 0 + pk * 10, 11, 20), { fill: col, line: C.ink, lw: 1.6, seed: seed + 2 })
  K.shape(ctx, [[-1, -9 + pk * 10], [3, -17 + pk * 10], [7, -11 + pk * 10], [11, -16 + pk * 10], [12, -8 + pk * 10]], { fill: '#d23b2c', line: C.ink, lw: 1.2, seed: seed + 3 })
  K.shape(ctx, [[13, -3 + pk * 10], [22, 1 + pk * 10], [13, 4 + pk * 10]], { fill: '#e7a62b', line: C.ink, lw: 1.2, seed: seed + 4 })
  K.shape(ctx, K.ellipse(11, 9 + pk * 10, 3, 5), { fill: '#d23b2c', line: null, wob: 0 })
  K.shape(ctx, K.circle(7, -2 + pk * 10, 2, 8), { fill: C.ink, line: null, wob: 0 })
  ctx.restore()
}

sceneAt('pig', {
  in: { type: 'push', dur: 0.5, dir: 'left' },
  draw(ctx, s) {
    const lt = Math.min(s.lt, 3.6), c = pigClock(lt)
    K.paper(ctx, W, H, C.paper)
    sky(ctx, 230, 600, lt, { clouds: [[260, 320, 0.9, 18], [820, 290, 0.7, 14]] })
    ctx.drawImage(pigBack(), 0, 0)
    pigHen(ctx, 915, 772, 0.8, -1, lt, '#b8713f', 3)
    const S = K.lerp(0.5, 1.3, c.gp)
    // dust kicked up on each footfall (one every eighth while it trots)
    for (let k = 1; k <= 7; k++) {
      const tf = k * 0.25, age = lt - tf
      if (age < 0 || age > 0.5 || tf > 1.4) continue
      const px = pigClock(tf).x, Sf = K.lerp(0.5, 1.3, pigClock(tf).gp), side = k % 2 ? 0.55 : -0.6
      for (let j = 0; j < 3; j++) K.shape(ctx, K.circle(px + side * 160 * Sf + (j - 1) * 14 - age * 40, PIG.gy - 8 - age * 30 - j * 4, (6 + j * 3) * (0.6 + age * 2.2), 16), { fill: K.rgba('#ecdcb6', 0.75 * (1 - age / 0.5)), line: null, wob: 0.8, seed: k * 5 + j })
    }
    K.groundShadow(ctx, c.x + 10 * S, PIG.gy + 4, 230 * S, 26 * S, 0.3)
    const pig = pigPig(ctx, c.x, PIG.gy, S, c.gp, { phase: c.phase, move: c.move, pitch: c.pitch, root: c.root, t: s.t, upAt: s.start0 + 2.5, blinkAt: s.start0 + 2.95 })
    // dirt flicked up by the snout as it roots
    for (const tf of [1.75, 2.0, 2.25]) {
      const age = lt - tf
      if (age < 0 || age > 0.45) continue
      const r = K.rng('pig-dirt' + tf)
      for (let j = 0; j < 7; j++) {
        const vx = 60 + r() * 160, vy = -(160 + r() * 200)
        K.shape(ctx, K.blob(pig.snout[0] + 10 + vx * age, pig.snout[1] + 20 + vy * age + 900 * age * age, 3 + r() * 4, j, 0.4, 10), { fill: j % 2 ? PIG_COL.mud : '#7d5c3c', line: K.rgba(C.ink, 0.6), lw: 0.8, wob: 0.3, seed: j, alpha: 1 - K.at(age, 0.3, 0.15) })
      }
    }
    pigHen(ctx, 110, 915, 1.3, 1, lt, '#f6f0e2', 9)
    cap(ctx, s, '6 MONTHS', [['A piglet grows up on a farm in Jalisco.', 0.45]])
  },
})
