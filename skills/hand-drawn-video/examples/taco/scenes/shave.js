// 0:27 — the shave (NOW). Hard cut to a close-up at the trompo: the taquero's knife shaves thin slices off the
// turning stack into the tortilla in his other hand, three strokes on the beat; then the knife flicks a piece of
// pineapple off the top, it arcs through the air and lands on the taco (the key moment, 2.25 s). Uses trompo.js.

const SHAVE = { cx: 705, oy: 985, S: 1.3, tort: [395, 880], R: 185, elbow: [-160, 520] }
const SHAVE_STROKES = [0, 0.5, 1.0]  // each stroke runs down for 0.25 s: the slices fall on 0.25, 0.75, 1.25
const SHAVE_FLICK = 1.75, SHAVE_LAND = 2.25
const SHAVE_SKIN = '#c68c62', SHAVE_SLEEVE = '#efe9df'
{
  const t0 = bar(T.shave[0])
  K.cue(t0 + 0.25, 'shave: first slices fall into the tortilla', 'hit')
  K.cue(t0 + 0.75, 'shave: second stroke', 'soft')
  K.cue(t0 + 1.25, 'shave: third stroke', 'soft')
  K.cue(t0 + SHAVE_FLICK, 'shave: the knife flicks the pineapple', 'soft')
  K.cue(t0 + SHAVE_LAND, 'shave: the pineapple lands on the taco', 'hit')
}
const shaveBounce = (b) => (b < 0 || b > 0.7 ? 0 : Math.exp(-b * 8) * Math.cos(b * 30))
// where the knife hand is: grip point and angle (0 = blade straight down; negative swings the blade to the right)
function shaveGrip(lt) {
  const top = [492, 330, -0.24], bot = [548, 520, -0.24], flick = [318, 452, -1.42], rest = [70, 392, -1.72]
  const ks = [[0, top]]
  for (const s0 of SHAVE_STROKES) ks.push([s0 + 0.25, bot, 'inOut'], [s0 + 0.5, top, 'inOut'])
  ks.pop(); ks.push([1.62, flick, 'inOut'], [SHAVE_FLICK - 0.03, [flick[0] - 6, flick[1] + 6, -1.32], 'inOut'], [SHAVE_FLICK + 0.07, [flick[0] + 6, flick[1] - 10, -1.95], 'out'], [2.12, rest, 'inOut'])
  return K.keys(lt, ks)
}
const shaveTo = (g, x, y) => [g[0] + (x * Math.cos(g[2]) - y * Math.sin(g[2])) * 1.15, g[1] + (x * Math.sin(g[2]) + y * Math.cos(g[2])) * 1.15]
// the left contour of the stack at screen height y (where the blade rides)
const shaveEdge = (y) => K.lerp(SHAVE.cx - 0.94 * 140 * SHAVE.S, SHAVE.cx - 58 * SHAVE.S, K.inv(545, SHAVE.oy, y))

// ---------- a forearm in a rolled cream sleeve, from a wrist to a point off the frame
function shaveArm(ctx, w0, w1, elbow, wid, seed) {
  const dx = elbow[0] - w0[0], dy = elbow[1] - w0[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L
  const at = (u, hw) => [[w0[0] + dx * u + nx * hw, w0[1] + dy * u + ny * hw], [w0[0] + dx * u - nx * hw, w0[1] + dy * u - ny * hw]]
  const [a0, b0] = [w0, w1], [a1, b1] = at(1, wid * 0.75)
  K.shape(ctx, [a0, a1, b1, b0], { fill: SHAVE_SKIN, line: C.ink, lw: 2, seed, shade: { amount: 0.4, angle: Math.atan2(ny, nx) }, light: { amount: 0.2 }, texture: 0.5 })
  const u0 = Math.min(0.5, 115 / L), [c0, d0] = at(u0, wid * 0.62), [c1, d1] = at(1.1, wid * 0.9)
  const sl = K.shape(ctx, [c0, c1, d1, d0], { fill: SHAVE_SLEEVE, line: C.ink, lw: 2, seed: seed + 1, shade: { amount: 0.35, angle: Math.atan2(ny, nx) }, texture: 0.5 })
  ctx.save(); K.pathOf(ctx, sl); ctx.clip()
  for (const u of [0.08, 0.2]) { const [p, q] = at(u0 + u * (1 - u0), wid * 0.8); K.line(ctx, [p, q], { color: K.rgba(C.ink, 0.45), lw: 1.4, seed: seed + u * 10, taper: 6 }) }
  ctx.restore()
}
// ---------- the knife hand: fist round the handle, the long thin taquero's blade below it (local frame at the grip)
function shaveKnifeHand(ctx, g) {
  shaveArm(ctx, shaveTo(g, -50, -38), shaveTo(g, -50, 34), SHAVE.elbow, 72, 501)
  ctx.save(); ctx.translate(g[0], g[1]); ctx.rotate(g[2]); ctx.scale(1.15, 1.15)
  const blade = [[-9, 42], [24, 42], [25, 80], [26, 180], [22, 262], [13, 314], [3, 338], [-5, 318], [-9, 250], [-10, 140]]
  K.shape(ctx, blade, { fill: '#c8cbcf', line: C.ink, lw: 1.9, seed: 511, light: { amount: 0.45, angle: Math.PI }, shade: { amount: 0.3, angle: 0 }, texture: 0.3 })
  K.line(ctx, [[17, 50], [18, 180], [14, 262], [6, 318]], { color: K.rgba('#ffffff', 0.85), lw: 2.2, seed: 512, taper: 10 }) // the honed edge catches the fire
  K.line(ctx, [[-5, 52], [-6, 200], [-3, 290]], { color: K.rgba(C.ink, 0.35), lw: 1.2, seed: 513, taper: 10 })
  K.shape(ctx, K.rect(-13, 30, 40, 15, 3), { fill: C.metalDark, line: C.ink, lw: 1.6, seed: 514 })
  K.shape(ctx, K.rect(-13, -84, 26, 118, 9), { fill: '#5b3a24', line: C.ink, lw: 1.8, seed: 515, light: { amount: 0.3, angle: Math.PI }, texture: 0.5 })
  K.shape(ctx, K.circle(0, -68, 3.5, 12), { fill: C.metal, line: C.ink, lw: 1, seed: 516 })
  // the fist: the back of the hand, four fingers wrapped over the handle, the thumb on top
  K.shape(ctx, K.blob(-26, -4, 32, 517, 0.06, 32, 40), { fill: SHAVE_SKIN, line: C.ink, lw: 2, seed: 517, shade: { amount: 0.35, angle: 1.2 }, light: { amount: 0.2 } })
  for (let k = 0; k < 4; k++) {
    const y = -32 + k * 17.5, len = 48 - Math.abs(k - 1.2) * 4
    K.shape(ctx, K.rect(-30, y - 9.5, len, 19, 9.5), { fill: SHAVE_SKIN, line: C.ink, lw: 1.8, seed: 520 + k, shade: { amount: 0.35, angle: 1.4 }, light: { amount: 0.15 } })
    K.line(ctx, [[-22, y - 6], [-19, y], [-22, y + 6]], { color: K.rgba(C.ink, 0.5), lw: 1.1, seed: 530 + k, taper: 3 })
  }
  K.shape(ctx, K.rotate(K.rect(-40, -58, 46, 21, 10.5), -0.12, -40, -48), { fill: SHAVE_SKIN, line: C.ink, lw: 1.8, seed: 540, shade: { amount: 0.3, angle: 1.4 }, light: { amount: 0.25 } })
  K.shape(ctx, K.rotate(K.ellipse(-2, -48, 7, 5.5, 0, 14), -0.12, -40, -48), { fill: K.shade(SHAVE_SKIN, 0.35), line: K.rgba(C.ink, 0.6), lw: 1, seed: 541 })
  ctx.restore()
}
// ---------- the other hand: palm up under the tortillas, fingertips peeking below, thumb over the rim
function shaveTacoHand(ctx, x, y, R, under) {
  if (under) {
    shaveArm(ctx, [x - R * 0.75, y + 52], [x - R * 0.2, y + 92], [x - R * 1.6, H + 140], 74, 551)
    K.shape(ctx, K.blob(x - R * 0.42, y + 66, 92, 553, 0.08, 36, 42), { fill: SHAVE_SKIN, line: C.ink, lw: 2, seed: 553, shade: { amount: 0.45, angle: 1.3 }, light: { amount: 0.2 } })
    for (let k = 0; k < 4; k++) K.shape(ctx, K.ellipse(x + R * 0.12 + k * 33, y + R * 0.4 + 6 - k * 6, 17, 12, -0.2, 20), { fill: SHAVE_SKIN, line: C.ink, lw: 1.8, seed: 556 + k, shade: { amount: 0.4, angle: 1.4 } })
    return
  }
  const th = K.rotate(K.rect(x - R * 1.02, y + 4, 74, 25, 12.5), -0.42, x - R * 1.02, y + 16)
  K.shape(ctx, th, { fill: SHAVE_SKIN, line: C.ink, lw: 1.9, seed: 560, shade: { amount: 0.35, angle: 1.4 }, light: { amount: 0.25 } })
  const [nx, ny] = K.rotate([[x - R * 1.02 + 60, y + 15]], -0.42, x - R * 1.02, y + 16)[0]
  K.shape(ctx, K.ellipse(nx, ny, 9, 7, -0.42, 14), { fill: K.shade(SHAVE_SKIN, 0.35), line: K.rgba(C.ink, 0.6), lw: 1, seed: 561 })
}
// a thin shaved slice of pork: a curled ribbon
function shaveSlice(ctx, x, y, rot, s, seed) {
  const pts = []
  for (let k = 0; k <= 10; k++) { const u = k / 10, a = u * 2.2; pts.push([Math.cos(a) * 16 * s - 8 * s, Math.sin(a) * 9 * s + u * 6 * s]) }
  for (let k = 10; k >= 0; k--) { const u = k / 10, a = u * 2.2; pts.push([Math.cos(a) * 9 * s - 8 * s, Math.sin(a) * 4 * s + u * 6 * s - 3 * s]) }
  const P = K.move(K.rotate(pts, rot), x, y)
  K.shape(ctx, P, { fill: [C.achiote, C.pork, '#c95a31'][seed % 3], line: C.ink, lw: 1.4, seed, wob: 0.6, shade: { amount: 0.4 }, light: { amount: 0.3 } })
  K.line(ctx, P.slice(0, 11), { color: K.rgba(C.char, 0.8), lw: 2.4, seed: seed + 1, taper: 6, wob: 0 })
}
// a wedge of pineapple: gold flesh with fibres running to the pale core, a strip of scaly skin on its outer edge
function shaveWedge(ctx, x, y, rot, s, sx, sy) {
  const R0 = 80, a0 = Math.PI / 2 - 0.62, a1 = Math.PI / 2 + 0.62, ay = -40 // apex (the core) above, skin below
  const arc = (r) => { const out = []; for (let k = 0; k <= 14; k++) { const a = K.lerp(a0, a1, k / 14); out.push([Math.cos(a) * r, ay + Math.sin(a) * r]) } return out }
  const T_ = (pts) => K.move(K.rotate(K.scale(pts, s * sx, s * sy), rot), x, y)
  const outer = arc(R0), inner = arc(R0 - 13)
  K.shape(ctx, T_([[0, ay], ...outer]), { fill: C.pineapple, line: '#8a5c10', lw: 2, seed: 571, light: { amount: 0.5, angle: -2.2 }, shade: { amount: 0.3 }, texture: 0.6 })
  const skin = K.shape(ctx, T_([...outer, ...inner.slice().reverse()]), { fill: '#b07a2c', line: '#6b4512', lw: 1.6, seed: 572, shade: { amount: 0.35 } })
  for (let k = 1; k < 7; k++) { const a = K.lerp(a0, a1, k / 7); K.line(ctx, T_([[Math.cos(a) * (R0 - 12), ay + Math.sin(a) * (R0 - 12)], [Math.cos(a + 0.09) * (R0 - 1), ay + Math.sin(a + 0.09) * (R0 - 1)]]), { color: K.rgba('#5a3a10', 0.8), lw: 1.4, seed: 573 + k, taper: 3 }) }
  for (let k = 1; k < 6; k++) { const a = K.lerp(a0, a1, k / 6); K.line(ctx, T_([[Math.cos(a) * 18, ay + Math.sin(a) * 18], [Math.cos(a) * (R0 - 17), ay + Math.sin(a) * (R0 - 17)]]), { color: K.rgba('#d29a26', 0.7), lw: 1.3, seed: 580 + k, taper: 8 }) }
  K.shape(ctx, T_(K.leaf(0, ay + 2, 0, ay + 26, 13, 0.5, 10)), { fill: '#f7e6a6', line: null, wob: 0.4, seed: 586 })
}
// the slices: four per stroke, each peeled off where the blade rides and flung into the tortilla
function shaveSlices() {
  return K.memo('shave-slices', () => {
    const r = K.rng('shave-slices'), out = []
    SHAVE_STROKES.forEach((s0, k) => {
      for (let j = 0; j < 4; j++) {
        const t0 = s0 + 0.05 + j * 0.05, g = shaveGrip(t0), y0 = g[1] + 250
        out.push({ t0, x0: shaveEdge(y0) - 4, y0, t1: t0 + 0.3, x1: SHAVE.tort[0] - 60 + r() * 130, y1: SHAVE.tort[1] - 30 - r() * 25, spin: (r() - 0.5) * 18, s: 1.35 + r() * 0.6, seed: k * 4 + j })
      }
    })
    return out
  })
}
const shaveGrav = 2600
function shaveFlight(p, t) { // a thrown thing from (x0,y0,t0) to (x1,y1,t1) under gravity; p.rise: lob it this high first
  const T_ = p.t1 - p.t0, u = t - p.t0, dy = p.y1 - p.y0
  const g = p.rise ? ((Math.sqrt(2 * p.rise) + Math.sqrt(2 * p.rise + 2 * dy)) / T_) ** 2 : shaveGrav
  const vy = (dy - 0.5 * g * T_ * T_) / T_
  return [K.lerp(p.x0, p.x1, u / T_), p.y0 + vy * u + 0.5 * g * u * u]
}

sceneAt('shave', {
  in: { type: 'cut' },
  draw(ctx, s) {
    K.paper(ctx, W, H, C.paper)
    const lt = s.lt, t = s.t, { cx, oy, S, R } = SHAVE
    trompoNight(ctx, 238, t)
    trompoLights(ctx, t, 258, 30, { x0: -30, x1: 470, n: 6 })
    trompoFire(ctx, cx + 20, 300, 560, 760, t)
    trompoEmbers(ctx, cx - 260, 300, 560, t, 16, 33)
    // the trompo, close: turning, its left flank shaved fresh
    const rot = t * 0.9, ndone = 1 + K.clamp(Math.floor(lt / 0.5), 0, 2)
    ctx.save(); ctx.translate(cx, oy); ctx.scale(S, S)
    const st = trompoDraw(ctx, { lt, rot, lands: [], floor: 92, cut: K.clamp(0.4 + ndone * 0.2) })
    const flown = lt >= SHAVE_FLICK
    trompoPineapple(ctx, 0, st.topY + 4, 1.25, { rot, cut: flown ? K.at(lt, SHAVE_FLICK, 0.05, 'out') : 0, sway: 0.03 * Math.sin(t * 2) + (flown ? 0.12 * Math.exp(-(lt - SHAVE_FLICK) * 4) * Math.sin((lt - SHAVE_FLICK) * 18) : 0) })
    ctx.restore()
    // the taco in the other hand: it gives a little as each slice lands, and lifts toward us at the end
    const slices = shaveSlices(), landed = slices.reduce((n, p) => n + K.at(lt, p.t1, 0.1, 'out'), 0)
    const dip = slices.reduce((v, p) => v + 2.5 * shaveBounce(lt - p.t1), 0) + 12 * shaveBounce(lt - SHAVE_LAND)
    const lift = K.at(lt, 2.45, 0.6, 'inOut'), tx = SHAVE.tort[0] + 45 * lift, ty = SHAVE.tort[1] + dip - 25 * lift
    shaveTacoHand(ctx, tx, ty, R, true)
    TACO.tortilla(ctx, tx + 10, ty + 8, R, 11)
    TACO.tortilla(ctx, tx, ty, R * 0.97, 12)
    shaveTacoHand(ctx, tx, ty, R, false)
    const g = K.clamp(0.3 + 0.7 * (landed / slices.length)), k = 0.55 + 0.45 * g
    ctx.save(); ctx.translate(tx, ty + 6); ctx.scale(k, k); ctx.translate(-tx, -ty - 6)
    TACO.pork(ctx, tx, ty, R * 1.05, { heap: 58 })
    ctx.restore()
    // the pineapple: flicked off the top, it arcs over and lands on the meat
    const pine = { t0: SHAVE_FLICK, x0: cx - 74, y0: oy + st.topY * S - 90, t1: SHAVE_LAND, x1: tx + 12, y1: ty - 84, rise: 160 }
    if (lt >= SHAVE_LAND) {
      const e = shaveBounce(lt - SHAVE_LAND)
      shaveWedge(ctx, pine.x1, pine.y1 + 4 * e, 0.12, 1.2, 1 + 0.18 * e, 1 - 0.22 * e)
    }
    trompoSmoke(ctx, tx, ty - 60, t, 3, { spread: 70, rise: 160, alpha: 0.3 })
    // the knife hand, then the slices peeling off its blade
    shaveKnifeHand(ctx, shaveGrip(lt))
    for (const p of slices) {
      if (lt < p.t0 || lt >= p.t1) continue
      const [x, y] = shaveFlight(p, lt), u = (lt - p.t0) / (p.t1 - p.t0)
      shaveSlice(ctx, x, y, p.spin * u + 1.2, p.s * K.lerp(0.6, 1, Math.min(1, u * 4)), p.seed)
    }
    if (lt >= SHAVE_FLICK && lt < SHAVE_LAND + 0.3) { // its arc, drawn behind it as a dashed trail that fades after it lands
      const trail = [], tEnd = Math.min(lt, SHAVE_LAND)
      for (let q = SHAVE_FLICK; q <= tEnd; q += 0.015) trail.push(shaveFlight(pine, q))
      if (trail.length > 1) K.guide(ctx, trail, { color: '#f6e8cf', lw: 3, alpha: 0.6 * (1 - K.at(lt, SHAVE_LAND, 0.3, 'out')), dash: [10, 9] })
    }
    if (lt >= SHAVE_FLICK && lt < SHAVE_LAND) { // the wedge flies, spinning a turn and a half
      const [x, y] = shaveFlight(pine, lt), u = (lt - SHAVE_FLICK) / (SHAVE_LAND - SHAVE_FLICK)
      shaveWedge(ctx, x, y, 0.12 + (1 - u) * 3 * Math.PI, K.lerp(0.8, 1.2, Math.min(1, u * 5)), 1, 1)
    }
    if (lt >= SHAVE_LAND && lt < SHAVE_LAND + 0.25) { // the landing: a pop of marks round it
      const a = 1 - (lt - SHAVE_LAND) / 0.25
      for (let j = 0; j < 7; j++) {
        const ang = Math.PI * (1.0 + j / 6), d0 = 64 + (1 - a) * 30
        K.line(ctx, [[pine.x1 + Math.cos(ang) * d0, pine.y1 + 10 + Math.sin(ang) * d0 * 0.8], [pine.x1 + Math.cos(ang) * (d0 + 20), pine.y1 + 10 + Math.sin(ang) * (d0 + 20) * 0.8]], { color: K.rgba('#f6e8cf', a), lw: 2.6, seed: 580 + j, taper: 4 })
      }
    }
    cap(ctx, s, 'NOW', [['Shaved thin. Pineapple flies.', 0.3]])
  },
})
