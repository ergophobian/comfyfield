// ---------- 0:18 nixtamal: a night kitchen. Dried kernels pour into a clay olla of limewater (cal), steam rises,
// the clock runs through the night, the moon sets and the sun comes up; then the camera slides along the wall to the metate,
// where the mano grinds the soaked corn into a soft ball of masa.
const NIX_T0 = bar(T.nixtamal[0])
K.cue(NIX_T0 + 2 * EIGHTH, 'nixtamal: kernels splash into the limewater', 'hit')
K.cue(NIX_T0 + 6 * EIGHTH, 'nixtamal: dawn, the clock reaches six', 'soft')
K.cue(NIX_T0 + 8 * EIGHTH, 'nixtamal: first push of the mano', 'soft')
K.cue(NIX_T0 + 10 * EIGHTH, 'nixtamal: a ball of masa', 'hit')
const NIX = {
  wall: '#e6d0aa', clay: '#b4643a', clayDark: '#8e4627', wood: '#8f5d3b', stone: '#7b756f', stoneDark: '#5d5752',
  water: '#e3e7d8', kernel: '#e6a53a', wet: '#efc75a', masa: '#efd389', skin: '#b97a52',
  win: { x0: 700, x1: 920, y0: 340, top: 302, y1: 540 }, clock: { x: 165, y: 365 },
  NL: [1215, 790], du: [500, -30], dv: [40, -140], thick: 36,
}
const nixP = (u, v) => [NIX.NL[0] + u * NIX.du[0] + v * NIX.dv[0], NIX.NL[1] + u * NIX.du[1] + v * NIX.dv[1]]
function nixCanvas(key, w, fn) {
  return K.memo(key, () => { const c = document.createElement('canvas'); c.width = w; c.height = H; fn(c.getContext('2d')); return c })
}
function nixWinPath(grow = 0) {
  const { x0, x1, y0, top, y1 } = NIX.win
  const pts = [[x0 - grow, y1 + grow], [x0 - grow, y0]]
  for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push([K.lerp(x0 - grow, x1 + grow, u), y0 - (y0 - top + grow) * Math.sin(Math.PI * u)]) }
  pts.push([x1 + grow, y1 + grow])
  return pts
}
// the olla's profile, mirrored: rim, neck, a full belly, a flat foot on the hearth
function nixPotBody() {
  const prof = [[146, 512], [136, 540], [150, 572], [200, 628], [216, 682], [200, 742], [152, 790], [92, 806]]
  return K.curve([...prof.map(([x, y]) => [540 + x, y]), ...prof.slice().reverse().map(([x, y]) => [540 - x, y])], 90)
}

// ---------- the wall: plaster, a band of talavera tiles, the clock, the window, a shelf of clay, a chile ristra
const nixWall = () => nixCanvas('nix-wall', 1640, (g) => {
  const edge = K.wob([[0, 236], [1640, 236]], { seed: 31, amp: 3, closed: false, step: 10 })
  K.shape(g, [[0, 1080], ...edge, [1640, 1080]], { fill: NIX.wall, line: null, wob: 0, texture: 0.7, shade: { amount: 0.22, angle: 1.45 } })
  for (let x = 0; x < 1640; x += 40) for (const y of [562, 602]) {
    const cx = x + 20, cy = y + 20
    K.shape(g, K.rect(x + 1, y + 1, 38, 38, 2), { fill: '#f3eee2', line: '#8a8070', lw: 0.8, wob: 0.4, seed: x + y, texture: 0.3 })
    for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) K.shape(g, K.circle(cx + dx * 18, cy + dy * 18, 5, 14), { fill: '#2f5d9e', line: null, wob: 0.3, seed: x + dx })
    for (const [dx, dy, rx, ry] of [[9, 0, 6, 3.4], [-9, 0, 6, 3.4], [0, 9, 3.4, 6], [0, -9, 3.4, 6]]) K.shape(g, K.ellipse(cx + dx, cy + dy, rx, ry, 0, 16), { fill: '#2f5d9e', line: null, wob: 0.3, seed: x + dy })
    K.shape(g, K.circle(cx, cy, 3.6, 12), { fill: '#e3a92a', line: null, wob: 0.2, seed: y })
  }
  for (const y of [561, 642]) K.line(g, [[0, y], [1640, y]], { color: '#2c4f86', lw: 2.2, seed: y, taper: 0 })
  // the clock face (its hands move, drawn per frame)
  const { x: kx, y: ky } = NIX.clock
  K.groundShadow(g, kx + 6, ky + 8, 72, 72, 0.18)
  K.shape(g, K.circle(kx, ky, 66, 48), { fill: '#9a6438', line: C.ink, lw: 2.2, seed: 21, shade: { amount: 0.35 }, light: { amount: 0.3 }, texture: 0.6 })
  K.shape(g, K.circle(kx, ky, 55, 48), { fill: '#f7f1e3', line: C.ink, lw: 1.4, seed: 22, shade: { amount: 0.15, angle: -2 }, texture: 0.3 })
  for (let i = 0; i < 12; i++) { const a = (i / 12) * K.TAU, r0 = i % 3 ? 47 : 42; K.line(g, [[kx + Math.cos(a) * r0, ky + Math.sin(a) * r0], [kx + Math.cos(a) * 51, ky + Math.sin(a) * 51]], { color: C.ink, lw: i % 3 ? 1.4 : 2.6, wob: 0, taper: 0, seed: i }) }
  // the window: a wooden frame round an arched opening, cut through to the sky
  K.groundShadow(g, 818, 430, 150, 150, 0.15)
  K.shape(g, nixWinPath(16), { fill: NIX.wood, line: C.ink, lw: 2.2, seed: 23, shade: { amount: 0.3 }, light: { amount: 0.25 }, texture: 0.7 })
  g.save(); g.globalCompositeOperation = 'destination-out'; K.pathOf(g, nixWinPath(0)); g.fill(); g.restore()
  K.shape(g, nixWinPath(0), { fill: null, line: C.ink, lw: 1.6, seed: 24 })
  K.shape(g, K.rect(805, 300, 10, 240), { fill: NIX.wood, line: C.ink, lw: 1.3, seed: 25, wob: 0.5 })
  K.shape(g, K.rect(700, 425, 220, 9), { fill: NIX.wood, line: C.ink, lw: 1.3, seed: 26, wob: 0.5 })
  K.shape(g, K.rect(676, 540, 268, 18, 3), { fill: '#a8744a', line: C.ink, lw: 2, seed: 27, shade: { amount: 0.3, angle: 1.5 }, texture: 0.6 })
  // a little barrel cactus in a clay pot on the sill
  K.shape(g, K.blob(880, 512, 17, 4, 0.05, 32, 19), { fill: '#5f9a46', line: C.ink, lw: 1.5, seed: 28, shade: { amount: 0.35 }, light: { amount: 0.25 } })
  for (let i = -2; i <= 2; i++) K.line(g, [[880 + i * 6, 496], [880 + i * 7.5, 528]], { color: '#3f6f2e', lw: 1, seed: 40 + i, taper: 3 })
  K.shape(g, K.circle(882, 492, 5, 12), { fill: '#e46a8a', line: C.ink, lw: 1, seed: 29 })
  K.shape(g, [[864, 524], [896, 524], [892, 541], [868, 541]], { fill: NIX.clay, line: C.ink, lw: 1.5, seed: 30, shade: { amount: 0.3 } })
  // the shelf of clay pots seen at dawn
  K.shape(g, K.rect(1040, 444, 430, 14, 2), { fill: '#a8744a', line: C.ink, lw: 2, seed: 32, shade: { amount: 0.3, angle: 1.5 }, texture: 0.6 })
  for (const bx of [1085, 1425]) K.shape(g, [[bx - 6, 458], [bx + 6, 458], [bx + 6, 490]], { fill: NIX.wood, line: C.ink, lw: 1.3, seed: bx })
  K.groundShadow(g, 1255, 446, 220, 8, 0.25)
  for (const [x, r, h, col] of [[1110, 36, 60, NIX.clay], [1196, 28, 46, '#a5583a'], [1352, 30, 54, '#c07447']]) {
    K.shape(g, K.blob(x, 444 - h * 0.48, r, x, 0.04, 40, h * 0.5), { fill: col, line: C.ink, lw: 1.8, seed: x, shade: { amount: 0.4, angle: 0.4 }, light: { amount: 0.25 }, texture: 0.6 })
    K.shape(g, K.ellipse(x, 444 - h * 0.96, r * 0.55, 5, 0, 20), { fill: NIX.clayDark, line: C.ink, lw: 1.3, seed: x + 1 })
    K.line(g, [[x - r * 0.8, 444 - h * 0.45], [x, 444 - h * 0.38], [x + r * 0.8, 444 - h * 0.45]], { color: '#f0dcc0', lw: 2, seed: x + 2, taper: 4 })
  }
  K.shape(g, K.ellipse(1270, 408, 30, 34, 0, 40), { fill: '#c98a5c', line: C.ink, lw: 1.8, seed: 33, shade: { amount: 0.3 } })
  K.shape(g, K.ellipse(1270, 408, 20, 24, 0, 40), { fill: '#b06a40', line: C.ink, lw: 1.1, seed: 34, shade: { amount: 0.25, angle: -2 } })
  // a ristra of dried chiles from a nail
  K.line(g, [[1545, 252], [1545, 530]], { color: '#8a6a44', lw: 1.6, seed: 35, taper: 0 })
  for (let i = 0; i < 12; i++) {
    const y = 270 + i * 22, sd = i % 2 ? 1 : -1, x = 1545 + sd * 3
    K.shape(g, K.leaf(x, y, x + sd * 30, y + 26, 13, 0.3), { fill: i % 3 ? '#a8312a' : '#8c2720', line: C.ink, lw: 1.3, seed: 50 + i, shade: { amount: 0.35 }, light: { amount: 0.25 } })
    K.line(g, [[x, y], [x - sd * 4, y - 5]], { color: '#5d7d33', lw: 2.2, seed: 70 + i, taper: 2 })
  }
})
// the same wall at night: the plaster goes blue-dark (the window stays cut)
const nixWallNight = () => K.memo('nix-wall-night', () => {
  const d = nixWall(), c = document.createElement('canvas'); c.width = d.width; c.height = H
  const g = c.getContext('2d'); g.drawImage(d, 0, 0)
  g.globalCompositeOperation = 'multiply'; g.fillStyle = '#6077b6'; g.fillRect(0, 0, c.width, H)
  g.globalCompositeOperation = 'destination-in'; g.drawImage(d, 0, 0)
  return c
})

// ---------- the foreground: floor, the brick hearth with the olla and the cal, the table with the metate
const nixFg = () => nixCanvas('nix-fg', 2160, (g) => {
  K.shape(g, K.rect(-10, 1000, 2180, 90), { fill: '#b9784b', line: C.ink, lw: 1.8, wob: 0.8, seed: 40, texture: 0.6, shade: { amount: 0.25, angle: 1.6 } })
  for (let x = 60; x < 2160; x += 130) K.line(g, [[x, 1002], [x - 26, 1080]], { color: K.rgba(C.ink, 0.35), lw: 1, seed: x })
  // the hearth (fogón): a plastered top over a brick face, an arched fire mouth
  K.groundShadow(g, 600, 1004, 380, 18, 0.3)
  K.shape(g, K.rect(252, 806, 656, 196), { fill: '#d6bd98', line: C.ink, lw: 2, seed: 41, texture: 0.5 })
  g.save(); K.pathOf(g, K.rect(254, 808, 652, 192)); g.clip()
  const r = K.rng('nix-bricks')
  for (let row = 0; row < 7; row++) for (let x = (row % 2 ? -34 : 0) + 254; x < 906; x += 66) {
    K.shape(g, K.rect(x + 2, 810 + row * 28, 62, 24, 2), { fill: ['#b5643c', '#a95a35', '#bf6e45'][Math.floor(r() * 3)], line: K.rgba(C.ink, 0.7), lw: 1, wob: 0.7, seed: row * 40 + x, shade: { amount: 0.25 }, texture: 0.6 })
  }
  K.hatchIn(g, { x: 254, y: 808, w: 652, h: 192, cx: 580, cy: 904 }, { angle: -0.9, gap: 8, alpha: 0.22, side: 0, from: 0.7 }, 42)
  g.restore()
  g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(452, 1002); g.lineTo(452, 928); g.arc(540, 928, 88, Math.PI, 0); g.lineTo(628, 1002); g.fill(); g.restore()
  const arch = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI; arch.push([540 + Math.cos(a) * 90, 928 + Math.sin(a) * 90]) }
  K.line(g, [[452, 1000], ...arch, [628, 1000]], { color: C.ink, lw: 2.4, seed: 43, taper: 0 })
  for (let i = 1; i < 8; i++) { const a = Math.PI + (i / 8) * Math.PI; K.line(g, [[540 + Math.cos(a) * 90, 928 + Math.sin(a) * 90], [540 + Math.cos(a) * 112, 928 + Math.sin(a) * 112]], { color: C.ink, lw: 1.3, seed: 44 + i, taper: 2 }) }
  K.shape(g, K.rect(238, 784, 684, 24, 3), { fill: '#e6d5b8', line: C.ink, lw: 2.2, seed: 45, shade: { amount: 0.25, angle: 1.5 }, texture: 0.5 })
  // the olla: terracotta belly, cream painted band, little handles, a mouth full of milky limewater
  K.groundShadow(g, 552, 800, 200, 16, 0.4)
  K.shape(g, nixPotBody(), { fill: NIX.clay, line: C.ink, lw: 2.4, seed: 46, shade: { amount: 0.5, angle: 0.25 }, light: { amount: 0.3, angle: -2.6 }, hatch: { angle: -0.8, gap: 7, alpha: 0.3, side: 0.2, from: 0.72 }, texture: 0.8 })
  for (const [y, ry, w] of [[598, 20, 204], [626, 22, 214]]) {
    const arc = []; for (let i = 0; i <= 30; i++) { const a = Math.PI * (i / 30); arc.push([540 - Math.cos(a) * w, y + Math.sin(a) * ry]) }
    K.line(g, arc, { color: '#f0dcc0', lw: 2.6, seed: y, taper: 8 })
  }
  for (let i = 1; i < 14; i++) { const a = Math.PI * (i / 14), x = 540 - Math.cos(a) * 208, y = 612 + Math.sin(a) * 21; K.shape(g, K.leaf(x, y + 6, x, y - 7, 6), { fill: '#f0dcc0', line: null, wob: 0.3, seed: 60 + i }) }
  for (const sx of [-1, 1]) K.line(g, [[540 + sx * 196, 600], [540 + sx * 226, 592], [540 + sx * 232, 616], [540 + sx * 208, 640]], { color: C.ink, lw: 7, seed: 47 + sx, taper: 4 })
  for (const sx of [-1, 1]) K.line(g, [[540 + sx * 198, 601], [540 + sx * 224, 594], [540 + sx * 229, 615], [540 + sx * 208, 637]], { color: NIX.clay, lw: 3.6, seed: 48 + sx, taper: 4 })
  K.shape(g, K.ellipse(540, 512, 148, 33, 0, 64), { fill: '#c47447', line: C.ink, lw: 2.2, seed: 49, light: { amount: 0.3, angle: -2.4 }, texture: 0.6 })
  K.shape(g, K.ellipse(540, 514, 128, 25, 0, 64), { fill: '#5e2f1a', line: C.ink, lw: 1.6, seed: 50 })
  K.shape(g, K.ellipse(540, 521, 124, 20, 0, 64), { fill: NIX.water, line: null, wob: 0.6, seed: 51, shade: { amount: 0.25, angle: -1.6 }, light: { amount: 0.3 }, texture: 0.3 })
  // a paper sack of cal and its spill
  K.groundShadow(g, 832, 790, 52, 8, 0.35)
  K.shape(g, [[792, 790], [870, 790], [864, 712], [850, 698], [808, 698], [797, 712]], { fill: '#ede4cf', line: C.ink, lw: 2, seed: 52, shade: { amount: 0.3, angle: 0.4 }, texture: 0.6 })
  K.line(g, [[800, 712], [862, 712]], { color: K.rgba(C.ink, 0.6), lw: 1.2, seed: 53 })
  K.shape(g, K.blob(770, 786, 20, 5, 0.25, 24, 7), { fill: '#faf8f3', line: K.rgba(C.ink, 0.5), lw: 1, seed: 54 })
  // the table, seen from a little above
  K.groundShadow(g, 1580, 1008, 620, 26, 0.3)
  for (const lx of [1070, 2070]) K.shape(g, K.rect(lx, 930, 42, 74), { fill: '#86592f', line: C.ink, lw: 1.8, seed: lx, shade: { amount: 0.35 } })
  K.shape(g, K.rect(1040, 900, 1130, 34, 2), { fill: '#9d6b42', line: C.ink, lw: 2, seed: 55, shade: { amount: 0.35, angle: 1.5 }, texture: 0.6 })
  K.shape(g, [[1070, 642], [2170, 642], [2170, 902], [1040, 902]], { fill: '#c99a66', line: C.ink, lw: 2.2, seed: 56, shade: { amount: 0.22, angle: 1.5 }, light: { amount: 0.2, angle: -2.4 }, texture: 0.7 })
  for (const y of [708, 772, 838]) K.line(g, [[1052, y], [2170, y]], { color: K.rgba('#7a5133', 0.55), lw: 1.4, seed: y, taper: 0 })
  for (let i = 0; i < 26; i++) { const x = 1050 + r() * 1080, y = 660 + r() * 230; K.line(g, [[x, y], [x + 30, y - 2], [x + 60, y + 1]], { color: K.rgba('#7a5133', 0.3), lw: 1, seed: 80 + i, taper: 6 }) }
  // the metate: a basalt slab on stubby legs, worn smooth in the middle, pitted all over
  K.groundShadow(g, 1480, 862, 300, 26, 0.4)
  for (const u of [0.1, 0.9]) { const [x, y] = nixP(u, 0); K.shape(g, [[x - 18, y + 30], [x + 18, y + 30], [x + 12, 866], [x - 12, 866]], { fill: NIX.stoneDark, line: C.ink, lw: 1.8, seed: 57 + u, shade: { amount: 0.4 }, texture: 0.8 }) }
  const NLb = [NIX.NL[0], NIX.NL[1] + NIX.thick], NR = nixP(1, 0), NRb = [NR[0], NR[1] + NIX.thick]
  K.shape(g, [NIX.NL, NR, NRb, NLb], { fill: NIX.stoneDark, line: C.ink, lw: 2.2, seed: 58, shade: { amount: 0.35, angle: 1.4 }, hatch: { angle: -0.7, gap: 6, alpha: 0.3 }, texture: 0.9 })
  K.shape(g, [nixP(0, 0), nixP(1, 0), nixP(1, 1), nixP(0, 1)], { fill: NIX.stone, line: C.ink, lw: 2.4, seed: 59, shade: { amount: 0.3, angle: 0.6 }, light: { amount: 0.25, angle: -2.4 }, texture: 1 })
  K.shape(g, [nixP(0.05, 0.14), nixP(0.95, 0.14), nixP(0.95, 0.86), nixP(0.05, 0.86)], { fill: K.rgba('#9a938b', 0.55), line: null, wob: 2.5, seed: 60, texture: 0.6 })
  g.fillStyle = 'rgba(30,25,22,0.4)'
  for (let i = 0; i < 90; i++) { const u = r(), v = r(), [x, y] = i < 60 ? nixP(u, v) : [K.lerp(NIX.NL[0], NR[0], u), K.lerp(NIX.NL[1], NR[1], u) + 6 + v * 26]; g.beginPath(); g.arc(x, y, 0.8 + r() * 1.4, 0, K.TAU); g.fill() }
  K.line(g, [nixP(0.01, 0.02), nixP(0.99, 0.02)], { color: K.rgba('#f3eee4', 0.35), lw: 1.4, seed: 61, taper: 20 })
})

// ---------- moving parts
function nixBasket(lt) {
  const x = 432 - 470 * (1 - K.spring(lt + 0.05, 1.5, 0.72)) - 560 * K.at(lt, 1.02, 0.42, 'in')
  const a = 0.92 * K.spring(lt - 0.12, 1.4, 0.66) * (1 - 0.8 * K.at(lt, 0.92, 0.35, 'inOut'))
  return { x, y: 470 - 10 * a, a }
}
const nixLocal = (b, px, py) => [b.x + px * Math.cos(b.a) - py * Math.sin(b.a), b.y + px * Math.sin(b.a) + py * Math.cos(b.a)]
// each kernel: when it leaves the lip, how it flies, where it lands, where it settles in the water
const nixKernels = () => K.memo('nix-kernels', () => {
  const r = K.rng('nix-k'), out = [], N = 120, g = 1700
  for (let i = 0; i < N; i++) {
    const te = 0.22 + 0.68 * (i / N) + r() * 0.01, b = nixBasket(te)
    const [x0, y0] = nixLocal(b, -4 - r() * 14, -4 - r() * 6), vx = 60 + r() * 170, vy = -30 + r() * 70
    const ys = 516 + r() * 8, tf = (-vy + Math.sqrt(vy * vy + 2 * g * (ys - y0))) / g
    const lx = x0 + vx * tf, ang = r() * K.TAU, sx = 430 + r() * 220, sy = 512 + r() * 18
    out.push({ te, x0, y0, vx, vy, g, tf, lx, ys, ang, spin: (r() - 0.5) * 14, sx, sy, k: i })
  }
  return out
})
function nixKernel(ctx, x, y, a, s, col, alpha = 1) {
  const pts = K.leaf(x - Math.cos(a) * 7 * s, y - Math.sin(a) * 7 * s, x + Math.cos(a) * 7 * s, y + Math.sin(a) * 7 * s, 10 * s, 0.62, 10)
  K.shape(ctx, pts, { fill: col, line: K.rgba('#6a4512', 0.9 * alpha), lw: 0.9, wob: 0.3, seed: Math.round(x), light: { amount: 0.3 }, alpha })
}
function nixArm(ctx, ax, ay, wx, wy, w0, w1, sleeve = 0.45) {
  const dx = wx - ax, dy = wy - ay, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L
  const at = (t, w) => [[ax + dx * t + nx * w / 2, ay + dy * t + ny * w / 2], [ax + dx * t - nx * w / 2, ay + dy * t - ny * w / 2]]
  const [a0, b0] = at(0, w0), [a1, b1] = at(1, w1), [as, bs] = at(sleeve, K.lerp(w0, w1, sleeve) + 8)
  K.shape(ctx, [a0, a1, b1, b0], { fill: NIX.skin, line: C.ink, lw: 2, seed: 90, shade: { amount: 0.35, angle: Math.atan2(ny, nx) }, texture: 0.5 })
  K.shape(ctx, [[a0[0] + nx * 4, a0[1] + ny * 4], as, bs, [b0[0] - nx * 4, b0[1] - ny * 4]], { fill: '#f3ede2', line: C.ink, lw: 2, seed: 91, shade: { amount: 0.25, angle: Math.atan2(ny, nx) }, texture: 0.4 })
  const [c0, c1] = at(sleeve - 0.04, K.lerp(w0, w1, sleeve) + 6)
  K.line(ctx, [c0, c1], { color: C.red, lw: 3.2, seed: 92, taper: 2 })
  const [d0, d1] = at(sleeve - 0.08, K.lerp(w0, w1, sleeve) + 4)
  K.line(ctx, [d0, d1], { color: '#2f8a8a', lw: 2.2, seed: 93, taper: 2 })
}
// a hand: palm with the fingers curled toward -x (rotate it so they wrap what it holds)
function nixHand(ctx, x, y, a, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s)
  K.shape(ctx, K.blob(0, 0, 25, 7, 0.08, 32, 19), { fill: NIX.skin, line: C.ink, lw: 2, seed: 94, shade: { amount: 0.35, angle: 1.2 }, light: { amount: 0.2 } })
  for (let i = 0; i < 4; i++) K.shape(ctx, K.ellipse(-20, -12 + i * 8, 7, 4.5, 0.2, 16), { fill: NIX.skin, line: C.ink, lw: 1.3, seed: 95 + i, shade: { amount: 0.25 } })
  K.line(ctx, [[8, 12], [-4, 18]], { color: K.rgba(C.ink, 0.6), lw: 1.2, seed: 99, taper: 3 })
  ctx.restore()
}
function nixSteam(ctx, t, strength) {
  for (let k = 0; k < 5; k++) {
    const bx = 468 + k * 36, ph = t * 2.3 + k * 1.7, pts = []
    for (let j = 0; j <= 13; j++) { const h = j / 13; pts.push([bx + Math.sin(h * 5.5 - ph) * (6 + 16 * h) + h * 18 * Math.sin(k), 505 - h * 250]) }
    const a = strength * (0.55 + 0.25 * Math.sin(ph * 0.7))
    for (const [i0, i1, al] of [[0, 6, 0.7], [5, 10, 0.45], [9, 13, 0.18]]) {
      K.line(ctx, pts.slice(i0, i1 + 1), { color: K.rgba('#fffdf8', al * a), lw: 9 - i0 * 0.3, seed: k * 7 + i0, taper: 10, boil: 6, t })
      K.line(ctx, pts.slice(i0, i1 + 1).map(([x, y]) => [x + 5, y + 2]), { color: K.rgba('#8f8678', al * a * 0.5), lw: 1.2, seed: k * 7 + i0 + 3, taper: 8, boil: 6, t })
    }
  }
}
function nixFire(ctx, t, f) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(452, 1002); ctx.lineTo(452, 928); ctx.arc(540, 928, 88, Math.PI, 0); ctx.lineTo(628, 1002); ctx.clip()
  ctx.fillStyle = '#2b1710'; ctx.fillRect(440, 820, 200, 190)
  const gl = ctx.createRadialGradient(540, 995, 4, 540, 990, 120); gl.addColorStop(0, K.rgba('#ff9a3a', 0.6 * f + 0.25)); gl.addColorStop(1, K.rgba('#ff9a3a', 0))
  ctx.fillStyle = gl; ctx.fillRect(440, 820, 200, 190)
  for (const [x, y, a] of [[535, 990, 0.12], [547, 982, -0.14]]) K.shape(ctx, K.move(K.rotate(K.rect(-65, -7, 130, 14, 6), a), x, y), { fill: '#5a3420', line: C.ink, lw: 1.4, seed: x })
  for (let i = 0; i < 6; i++) {
    const x = 486 + i * 22, n = K.noise1(t * 7 + i * 3.1, i), h = (40 + 46 * Math.sin(i * 1.3 + 1) ** 2 + 18 * n) * (0.3 + 0.7 * f), sway = K.noise1(t * 4 + i, i + 9) * 9
    K.shape(ctx, K.leaf(x, 990, x + sway, 990 - h, 24 * (0.5 + 0.5 * f), 0.32), { fill: C.fire, line: null, wob: 1, seed: i, t, boil: 10 })
    K.shape(ctx, K.leaf(x + 1, 990, x + sway * 0.7, 990 - h * 0.6, 12 * (0.5 + 0.5 * f), 0.32), { fill: C.flame, line: null, wob: 0.8, seed: i + 20, t, boil: 10 })
  }
  for (let i = 0; i < 8; i++) { const e = 0.5 + 0.5 * K.noise1(t * 5 + i * 2, 4); ctx.fillStyle = K.rgba('#ffd36b', e * 0.9); ctx.beginPath(); ctx.arc(478 + i * 17, 993 + (i % 2) * 4, 2.2, 0, K.TAU); ctx.fill() }
  ctx.restore()
}
// a paper tag with a leader: whole word on its own light ground, the leader leaves from the tag's edge
function nixTag(ctx, text, x, y, toX, toY, age) {
  if (age <= 0) return
  ctx.save(); ctx.font = K.font(28); if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '2px'
  const w = ctx.measureText(text).width + 30, h = 44; ctx.restore()
  const ex = K.clamp(toX, x - w / 2, x + w / 2), ey = K.clamp(toY, y - h / 2, y + h / 2), a = K.at(age, 0.1, 0.3, 'out')
  K.line(ctx, [[ex, ey], [K.lerp(ex, toX, a), K.lerp(ey, toY, a)]], { color: C.ink, lw: 2, seed: text.length, taper: 3, wob: 0.5 })
  if (a > 0.95) K.shape(ctx, K.circle(toX, toY, 4, 12), { fill: C.ink, line: null, wob: 0.3, seed: 3 })
  const sc = K.spring(age, 2.4, 0.55)
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y)
  K.shape(ctx, K.rect(x - w / 2, y - h / 2, w, h, 9), { fill: '#fbf6ea', line: C.ink, lw: 2, seed: text.length + 5, shade: { amount: 0.12, angle: 1.4 }, texture: 0.3 })
  K.text(ctx, text, x, y + 10, { size: 28, align: 'center', color: C.ink, spacing: 2 })
  ctx.restore()
}
// the mano: a stone bar across the slab at u, as a capsule resting on the surface
function nixMano(u) {
  const A = nixP(u, -0.16), B = nixP(u, 1.16), rr = 21, L = Math.hypot(B[0] - A[0], B[1] - A[1])
  const d = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], n = [-d[1], d[0]], up = -rr * 0.9, pts = []
  for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); pts.push([B[0] + rr * (n[0] * Math.cos(a) + d[0] * Math.sin(a)), B[1] + up + rr * (n[1] * Math.cos(a) + d[1] * Math.sin(a))]) }
  for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); pts.push([A[0] - rr * (n[0] * Math.cos(a) + d[0] * Math.sin(a)), A[1] + up - rr * (n[1] * Math.cos(a) + d[1] * Math.sin(a))]) }
  return { pts, A: [A[0], A[1] + up], B: [B[0], B[1] + up], n }
}

sceneAt('nixtamal', {
  in: { type: 'slide', dur: 0.5, dir: 'up' },
  draw(ctx, s) {
    const lt = s.lt, t = s.t
    K.paper(ctx, W, H, C.paper)
    const pan = K.at(lt, 1.45, 0.45, 'inOut'), camX = 960 * pan, bgX = camX * 0.55
    const dawn = K.at(lt, 0.75, 0.75, 'inOutSine'), fire = 1 - 0.7 * K.at(lt, 0.45, 0.95, 'inOut')
    // ---- the wall layer, with the sky behind its window
    ctx.save(); ctx.translate(-bgX, 0)
    ctx.save(); K.pathOf(ctx, nixWinPath(2)); ctx.clip()
    const sk = ctx.createLinearGradient(0, 300, 0, 540)
    sk.addColorStop(0, K.mixColor('#1d2a46', '#8095bb', dawn)); sk.addColorStop(1, K.mixColor('#2e3f66', '#f4b984', dawn))
    ctx.fillStyle = sk; ctx.fillRect(690, 290, 240, 260)
    const sr = K.rng('nix-stars')
    for (let i = 0; i < 14; i++) { const x = 705 + sr() * 210, y = 310 + sr() * 150, tw = 0.6 + 0.4 * K.noise1(t * 3 + i, 2); ctx.fillStyle = K.rgba('#fff6dc', (1 - dawn) * tw); ctx.beginPath(); ctx.arc(x, y, 1.2 + sr() * 1.3, 0, K.TAU); ctx.fill() }
    const m = K.at(lt, 0.1, 1.2, 'inOut'), mx = 742 + 150 * m, my = 362 + 30 * m + 150 * m * m
    const mg = ctx.createRadialGradient(mx, my, 10, mx, my, 60); mg.addColorStop(0, K.rgba('#fff3cf', 0.35 * (1 - dawn))); mg.addColorStop(1, K.rgba('#fff3cf', 0))
    ctx.fillStyle = mg; ctx.fillRect(mx - 60, my - 60, 120, 120)
    K.shape(ctx, K.circle(mx, my, 19, 32), { fill: '#f6efd6', line: K.rgba(C.ink, 0.5), lw: 1.2, seed: 5, shade: { amount: 0.25 } })
    for (const [dx, dy, rr] of [[-6, -4, 4], [5, 5, 3], [4, -8, 2.2]]) { ctx.fillStyle = 'rgba(160,150,120,0.45)'; ctx.beginPath(); ctx.arc(mx + dx, my + dy, rr, 0, K.TAU); ctx.fill() }
    const sun = K.at(lt, 0.95, 0.7, 'out')
    if (sun > 0) {
      const sy = 548 - 62 * sun, sgl = ctx.createRadialGradient(862, sy, 8, 862, sy, 90); sgl.addColorStop(0, K.rgba('#ffe29a', 0.6 * sun)); sgl.addColorStop(1, K.rgba('#ffe29a', 0))
      ctx.fillStyle = sgl; ctx.fillRect(760, sy - 90, 180, 180)
      K.shape(ctx, K.circle(862, sy, 24, 32), { fill: '#ffd36b', line: K.rgba('#c98d1c', 0.8), lw: 1.4, seed: 8, light: { amount: 0.4 } })
    }
    K.shape(ctx, [[690, 560], [690, 505], [740, 488], [800, 500], [860, 482], [930, 498], [930, 560]], { fill: K.mixColor('#202a44', '#9a8e78', dawn), line: null, wob: 1.2, seed: 6 })
    ctx.restore()
    ctx.drawImage(nixWall(), 0, 0)
    if (dawn < 1) { ctx.save(); ctx.globalAlpha = 1 - dawn; ctx.drawImage(nixWallNight(), 0, 0); ctx.restore() }
    // the clock runs through the night: ten at night to six in the morning, the minute hand a blur
    const { x: kx, y: ky } = NIX.clock, night = (tt) => K.at(tt, 0.3, 1.15, 'inOut')
    const hr = 22 + 8 * night(lt), spin = night(lt) - night(lt - 0.06)
    const ma = (hr % 1) * K.TAU - Math.PI / 2, ha = ((hr % 12) / 12) * K.TAU - Math.PI / 2
    for (let k = 3; k >= 1; k--) if (spin > 0.01) K.line(ctx, [[kx, ky], [kx + Math.cos(ma - k * 0.28) * 44, ky + Math.sin(ma - k * 0.28) * 44]], { color: K.rgba(C.ink, 0.12 * (4 - k)), lw: 3, wob: 0, taper: 6, seed: k })
    K.line(ctx, [[kx, ky], [kx + Math.cos(ha) * 30, ky + Math.sin(ha) * 30]], { color: C.ink, lw: 5, wob: 0.2, taper: 4, seed: 1 })
    K.line(ctx, [[kx, ky], [kx + Math.cos(ma) * 46, ky + Math.sin(ma) * 46]], { color: C.ink, lw: 3, wob: 0.2, taper: 4, seed: 2 })
    K.shape(ctx, K.circle(kx, ky, 4.5, 12), { fill: C.red, line: C.ink, lw: 1, seed: 3 })
    if (camX < 700) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'
      const wg = ctx.createRadialGradient(540, 880, 40, 540, 800, 520); wg.addColorStop(0, K.rgba('#c8742e', 0.55 * fire * (1 - dawn))); wg.addColorStop(1, K.rgba('#c8742e', 0))
      ctx.fillStyle = wg; ctx.fillRect(0, 236, 1200, 844); ctx.restore()
    }
    ctx.restore()
    // ---- the room
    ctx.save(); ctx.translate(-camX, 0)
    if (camX < 700) nixFire(ctx, t, fire)
    ctx.drawImage(nixFg(), 0, 0)
    if (camX < 700) {
      // firelight on the hearth's face and the pot's belly
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'
      const fg = ctx.createRadialGradient(540, 960, 20, 540, 900, 420); fg.addColorStop(0, K.rgba('#ffb75a', 0.7 * fire)); fg.addColorStop(1, K.rgba('#ffb75a', 0))
      ctx.fillStyle = fg; ctx.fillRect(100, 480, 900, 600); ctx.restore()
      K.text(ctx, 'CAL', 831, 760, { size: 26, align: 'center', color: C.red })
      // kernels already in: they drift and sink into the milky water
      const ks = nixKernels()
      ctx.save(); K.pathOf(ctx, K.ellipse(540, 521, 122, 19, 0, 48)); ctx.clip()
      for (const k of ks) {
        const th = k.te + k.tf; if (lt < th) continue
        const sink = K.at(lt, th, 0.8, 'out')
        nixKernel(ctx, K.lerp(k.lx, k.sx, sink), K.lerp(k.ys, k.sy, sink), k.ang + k.spin * k.tf, 1.1, K.mixColor(NIX.kernel, '#d9cfa0', sink * 0.6), 1 - 0.45 * sink)
      }
      ctx.restore()
      for (const k of ks) {
        const th = k.te + k.tf, age = lt - th
        if (lt >= k.te && lt < th) { const dt = lt - k.te; nixKernel(ctx, k.x0 + k.vx * dt, k.y0 + k.vy * dt + 0.5 * k.g * dt * dt, k.ang + k.spin * dt, 1.3, NIX.kernel) }
        if (age >= 0 && age < 0.4) {
          ctx.strokeStyle = K.rgba('#ffffff', 0.75 * (1 - age / 0.4)); ctx.lineWidth = 1.6
          ctx.beginPath(); ctx.ellipse(k.lx, k.ys, 4 + age * 70, (4 + age * 70) * 0.22, 0, 0, K.TAU); ctx.stroke()
          if (k.k % 2 === 0 && age < 0.3) for (const sd of [-1, 1]) { const x = k.lx + sd * age * 70, y = k.ys - 200 * age + 0.5 * 1700 * age * age; ctx.fillStyle = K.rgba('#f4f7ef', 0.9); ctx.beginPath(); ctx.arc(x, Math.min(k.ys, y), 2.4, 0, K.TAU); ctx.fill() }
        }
      }
      nixSteam(ctx, t, 0.75 + 0.25 * fire)
      // the basket of dried corn, tipped by a hand from the left
      const b = nixBasket(lt)
      if (b.x > -260) {
        const [hx, hy] = nixLocal(b, -96, 80)
        nixArm(ctx, hx - 340, hy + 170, hx - 8, hy + 6, 74, 52, 0.5)
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a)
        const left = Math.max(0, 1 - K.inv(0.3, 0.95, lt))
        K.shape(ctx, K.blob(-86, -6, 72, 11, 0.12, 30, 8 + 22 * left), { fill: NIX.kernel, line: C.ink, lw: 1.6, seed: 12, light: { amount: 0.3 }, texture: 0.6 })
        const bowl = K.curve([[-176, 0], [-160, 58], [-88, 86], [-18, 60], [0, 0]], 40)
        K.shape(ctx, bowl, { fill: '#c9995a', line: C.ink, lw: 2.2, seed: 13, shade: { amount: 0.4, angle: 1.0 }, hatch: { angle: 0.7, gap: 9, alpha: 0.35 }, texture: 0.7 })
        K.hatch(ctx, bowl, { angle: -0.7, gap: 9, alpha: 0.3 }, 14)
        K.shape(ctx, K.rect(-182, -6, 186, 13, 6), { fill: '#a87a3f', line: C.ink, lw: 2, seed: 15, shade: { amount: 0.3 } })
        ctx.restore()
        nixHand(ctx, hx, hy, b.a + 2.2, 1.25)
      }
    }
    if (camX > 300) {
      // ---- the metate at dawn: the mano pushes on the beat, masa gathers into a ball
      const PUSH = [[1.75, 2.0], [2.25, 2.5], [2.75, 3.0], [3.25, 3.5]]
      const u = K.keys(lt, [[1.75, 0.8], [2.0, 0.35], [2.25, 0.8], [2.5, 0.35], [2.75, 0.8], [3.0, 0.35], [3.25, 0.8], [3.5, 0.35]])
      const grind = K.at(lt, 1.75, 0.25, 'out') * 0.45 + K.at(lt, 2.25, 0.25, 'out') * 0.3 + K.at(lt, 2.75, 0.25, 'out') * 0.25
      for (const [pu, pv, pr, k] of [[0.26, 0.5, 46, 0], [0.38, 0.42, 52, 1], [0.5, 0.56, 48, 2], [0.6, 0.44, 42, 3], [0.68, 0.55, 34, 4]]) {
        const [x, y] = nixP(pu, pv), a = K.clamp(grind * 1.6 - k * 0.18)
        if (a > 0) K.shape(ctx, K.blob(x, y, pr, 70 + k, 0.3, 28, pr * 0.42), { fill: K.rgba(NIX.masa, 0.9 * a), line: K.rgba('#a8843c', 0.5 * a), lw: 1, wob: 1.2, seed: 70 + k, texture: 0.8, shade: { amount: 0.2 } })
      }
      for (let i = 0; i < 4; i++) { const uu = 0.27 + i * 0.11; K.line(ctx, [nixP(uu, 0.3), nixP(uu + 0.012, 0.5), nixP(uu, 0.7)], { color: K.rgba('#b8964c', 0.55 * grind), lw: 1.2, seed: 71 + i, taper: 6 }) }
      const heap = K.memo('nix-heap', () => { const r = K.rng('nix-heap'), o = []; for (let i = 0; i < 64; i++) { const hu = 0.78 + r() * 0.19, hv = 0.1 + r() * 0.8; o.push({ hu, hv, lift: 26 * (1 - Math.abs(hv - 0.5) * 2) * r(), a: r() * K.TAU }) } return o.sort((a, b) => a.hu - b.hu) })
      const keep = Math.round(heap.length * (1 - 0.75 * grind))
      for (const k of heap.slice(heap.length - keep).sort((a, b) => b.hv - a.hv)) { const [x, y] = nixP(k.hu, k.hv); nixKernel(ctx, x, y - k.lift, k.a, 1.3, NIX.wet) }
      // the ball of masa, growing at each push
      const grow = 0.48 * K.spring(lt - 2.0, 2.2, 0.5) + 0.34 * K.spring(lt - 2.5, 2.2, 0.5) + 0.18 * K.spring(lt - 3.0, 2.2, 0.5)
      const [bx, by] = nixP(0.1, 0.5)
      if (grow > 0.02) {
        const R = 74 * grow, cy = by - R * 0.7
        K.groundShadow(ctx, bx + 6, by + 4, R * 1.2, R * 0.32, 0.45)
        K.shape(ctx, K.blob(bx, cy, R, 9, 0.07, 48, R * 0.82), { fill: NIX.masa, line: C.ink, lw: 2.2, seed: 72, shade: { amount: 0.4, angle: 0.7 }, light: { amount: 0.45, angle: -2.3 }, texture: 1 })
        for (const [dx, dy, l] of [[-0.3, -0.2, 0.3], [0.2, 0.1, 0.25], [0.05, -0.45, 0.2]]) K.line(ctx, [[bx + dx * R, cy + dy * R], [bx + (dx + l) * R, cy + (dy + 0.05) * R]], { color: K.rgba('#b18f45', 0.7), lw: 1.1, seed: 73 + dx * 10, taper: 4 })
      }
      for (const pt of [2.0, 2.5, 3.0]) {
        const age = lt - pt
        if (age < 0 || age > 0.35) continue
        const fr = K.rng('nix-fleck' + pt)
        for (let i = 0; i < 7; i++) {
          const [x0, y0] = nixP(0.33, 0.2 + fr() * 0.6), vx = -60 - fr() * 120, vy = -90 - fr() * 120
          K.shape(ctx, K.circle(x0 + vx * age, y0 - 14 + vy * age + 900 * age * age, 2.5 + fr() * 2.5, 10), { fill: NIX.masa, line: K.rgba(C.ink, 0.6), lw: 0.8, wob: 0.3, seed: i, alpha: 1 - age / 0.35 })
        }
      }
      // the dough the stone pushes ahead of itself, then hands to the ball at the end of the push
      let wave = 0, speed = 0
      for (const [a, b] of PUSH) { if (lt >= a && lt < b) { wave = K.at(lt, a, b - a, 'out'); speed = Math.sin(Math.PI * (lt - a) / (b - a)) } else if (lt >= b && lt < b + 0.12) wave = 1 - K.at(lt, b, 0.12, 'in') }
      if (wave > 0.02) {
        const L = [], Rr = []
        for (let i = 0; i <= 10; i++) { const v = 0.1 + 0.8 * (i / 10), bulge = 1 - Math.pow(2 * v - 1, 2) * 0.55, du = (0.014 + 0.034 * wave) * bulge; const [x0, y0] = nixP(u - 0.05 - du, v), [x1, y1] = nixP(u - 0.03, v); L.push([x0, y0 - 10 * wave * bulge]); Rr.push([x1, y1 - 4]) }
        K.shape(ctx, [...L, ...Rr.reverse()], { fill: NIX.masa, line: C.ink, lw: 1.6, seed: 76, shade: { amount: 0.35, angle: 0.6 }, light: { amount: 0.35, angle: -2.4 }, texture: 0.9 })
      }
      // the mano and the two hands that push it
      const mano = nixMano(u), mid = nixP(u, 0.5)
      K.groundShadow(ctx, mid[0] + 10, mid[1] + 4, 34, 70, 0.35)
      K.shape(ctx, mano.pts, { fill: '#918a83', line: C.ink, lw: 2.2, seed: 74, shade: { amount: 0.4, angle: 0.3 }, light: { amount: 0.3, angle: -2.6 }, texture: 1 })
      K.line(ctx, [[mano.A[0] - mano.n[0] * 10, mano.A[1] - mano.n[1] * 10], [mano.B[0] - mano.n[0] * 10, mano.B[1] - mano.n[1] * 10]], { color: K.rgba('#f3eee4', 0.4), lw: 2, seed: 75, taper: 20 })
      // speed strokes trail the stone while it is pushed
      if (speed > 0.15) for (const v of [0.22, 0.5, 0.78]) { const [x, y] = nixP(u + 0.07, v); K.line(ctx, [[x, y - 18], [x + 34 * speed, y - 20]], { color: K.rgba(C.ink, 0.55 * speed), lw: 2, seed: v * 10, taper: 6 }) }
      const far = [mano.B[0] + 4, mano.B[1] - 8], near = [mano.A[0] + 6, mano.A[1] - 4]
      nixArm(ctx, camX + 1150, 470, far[0] + 16, far[1] - 4, 70, 48, 0.42)
      nixHand(ctx, far[0], far[1], -0.25, 1.3)
      nixArm(ctx, camX + 1150, 610, near[0] + 18, near[1] - 2, 80, 54, 0.42)
      nixHand(ctx, near[0], near[1], -0.1, 1.4)
      nixTag(ctx, 'MASA', camX + 160, 808, bx - 46, by - 18, lt - 2.05)
      nixTag(ctx, 'METATE', 1400, 910, 1405, 822, lt - 1.9)
    }
    ctx.restore()
    // dawn comes in through the window and lies across the room
    if (dawn > 0) {
      ctx.save(); ctx.translate(-bgX, 0); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.4 * dawn; ctx.filter = 'blur(18px)'
      ctx.fillStyle = '#fff0c4'; K.pathOf(ctx, [[700, 330], [920, 300], [1420, 1000], [1060, 1060]]); ctx.fill(); ctx.restore()
    }
    cap(ctx, s, '1 NIGHT', [['Corn soaks in limewater overnight.', 0.4], ["Then it's ground into masa.", 1.35]])
  },
})
