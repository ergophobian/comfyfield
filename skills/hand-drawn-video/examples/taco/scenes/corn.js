// 0:12 CORN — four months in three seconds. In a Sinaloa field under the Sierra Madre, a row of seedlings shoots
// up in surges on the beat, past the farmer who tips his head back and shades his eyes; then the field dries
// from the bottom leaves up, green → gold, and the ripe ears droop on the stalk the way dry corn does.
const CORN_T0 = bar(T.corn[0])
K.cue(CORN_T0 + 1 * EIGHTH, 'corn: seedlings surge up', 'soft')
K.cue(CORN_T0 + 3 * EIGHTH, 'corn: shoots past the farmer', 'hit')
K.cue(CORN_T0 + 5 * EIGHTH, 'corn: full height, tassels out', 'hit')
K.cue(CORN_T0 + 9 * EIGHTH, 'corn: dry ears droop', 'soft')
const CORN = { gy: 955, hz: 655 }
const CORN_COL = { leaf: '#5f983e', leafMid: '#a9a548', dry: '#d6b062', dryDark: '#b58b45', stalk: '#7ea24a', soil: '#8f6243', soilDark: '#76503a' }
const CORN_FRONT = [[55, 953, 585, -8], [200, 959, 628, 6], [340, 950, 600, -4], [485, 957, 632, 5], [625, 951, 592, -6], [762, 955, 560, 4]].map(([x, y, h, lean], k) => ({ x, y, h, lean, k, hero: k === 3 }))
const CORN_BACK = [130, 268, 410, 552, 690, 822, 960, 1060].map((x, i) => ({ x: x + (i % 2) * 14, y: 898 + (i % 3) * 4, h: 470 + ((i * 37) % 60), lean: (i % 2 ? 5 : -5), k: 20 + i, noEar: true }))

function cornClock(lt) {
  // growth surges land on the eighths, each with a little spring overshoot
  const g = K.springTo(lt, [[0, 0.07], [0.14, 0.3], [0.64, 0.66], [1.14, 1]], 2.1, 0.5) // each surge peaks on its eighth
  return { g: K.clamp(g, 0.07, lt > 2 ? 1 : 1.2), dry: K.at(lt, 1.5, 1.25, 'inOut'), droop: K.at(lt, 2.0, 0.55, 'inOut') + 0.06 * (K.spring(lt - 2.55, 2, 0.35) - K.at(lt, 2.55, 0.5)) }
}
const cornLeafCol = (d) => (d < 0.5 ? K.mixColor(CORN_COL.leaf, CORN_COL.leafMid, d * 2) : K.mixColor(CORN_COL.leafMid, CORN_COL.dry, d * 2 - 1))

// a strap leaf: leaves the stalk at a0 (from vertical) on `side`, arches, and its tip falls over (curl)
function cornBlade(x, y, len, a0, curl, w, side, wave = 1.6) {
  const n = 26, cen = [], st = len / n
  let X = 0, Y = 0
  for (let i = 0; i <= n; i++) {
    if (i) { const a = a0 + curl * Math.pow(i / n, 1.5); X += side * Math.sin(a) * st; Y -= Math.cos(a) * st }
    cen.push([x + X, y + Y])
  }
  const L = [], R = []
  for (let i = 0; i <= n; i++) {
    const s = i / n, a = cen[Math.max(0, i - 1)], b = cen[Math.min(n, i + 1)]
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l
    const hw = (w / 2) * Math.pow(Math.sin(Math.PI * (0.06 + 0.94 * s)), 0.55) * (s > 0.3 ? 1 - (s - 0.3) * 0.6 : 1), wv = s > 0.15 ? Math.sin(s * 34) * wave : 0
    L.push([cen[i][0] - ty * (hw + wv), cen[i][1] + tx * (hw + wv)]); R.push([cen[i][0] + ty * (hw - wv), cen[i][1] - tx * (hw - wv)])
  }
  return { pts: L.concat(R.reverse()), cen }
}
function cornLeafDraw(ctx, b, col, seed, back) {
  K.shape(ctx, b.pts, { fill: back ? K.shade(col, -0.14) : col, line: C.ink, lw: 1.6, seed, wob: 0.7, shade: { amount: 0.32, angle: 1.2 }, light: { amount: 0.22, angle: -2.2 }, texture: 0.35 })
  K.line(ctx, b.cen.slice(2, -3), { color: K.rgba('#f4f0c8', 0.55), lw: 1.3, wob: 0.3, taper: 12, seed: seed + 3 })
}

// the ear: a cob wrapped in husk on a short shank, silk at the tip; the front plant's husk peels back to show it
function cornEar(ctx, x, y, ang, len, d, open, seed) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang)
  const husk = K.mixColor(K.mixColor('#7aa84a', '#b8ae58', K.clamp(d * 2)), '#d9c08a', K.clamp(d * 2 - 1)), huskLine = K.mixColor('#3f5f2a', '#8a6a3a', d)
  K.line(ctx, [[0, 6], [0, -len * 0.14]], { color: K.mixColor(CORN_COL.stalk, CORN_COL.dryDark, d), lw: 7, wob: 0.3, taper: 0 })
  const peel = (rot, k) => K.shape(ctx, K.rotate(K.leaf(0, -len * 0.12, 0, -len * 0.82, len * 0.2, 0.35), rot, 0, -len * 0.12), { fill: k ? K.shade(husk, 0.08) : K.shade(husk, -0.1), line: C.ink, lw: 1.5, seed: seed + k, shade: { amount: 0.3, angle: 0 }, texture: 0.4 })
  if (open > 0) {
    const sp = 0.25 + 0.5 * open
    peel(-sp, 0); peel(sp * 0.8, 0)
    // the cob: rows of plump kernels on a fat spindle
    const cob = K.leaf(0, -len * 0.14, 0, -len * 1.04, len * 0.34, 0.5)
    K.shape(ctx, cob, { fill: K.mixColor(C.corn, '#e6b03a', d), line: C.ink, lw: 1.6, seed: seed + 9 })
    ctx.save(); K.pathOf(ctx, cob); ctx.clip()
    for (let r = 0; r < 16; r++) for (let k = -3; k <= 3; k++) {
      const yy = -len * 0.2 - r * len * 0.052, xx = (k + (r % 2) * 0.5) * len * 0.062, edge = Math.abs(xx) / (len * 0.17)
      K.shape(ctx, K.rect(xx - len * 0.027, yy - len * 0.022, len * 0.054, len * 0.044, 3), { fill: K.shade(K.mixColor('#f4d873', '#eab84a', d), -0.25 * edge), line: K.rgba('#8a6420', 0.6), lw: 0.8, wob: 0.2, seed: r * 7 + k, light: { amount: 0.45 } })
    }
    const gr = ctx.createLinearGradient(-len * 0.17, 0, len * 0.17, 0); gr.addColorStop(0, 'rgba(90,50,10,0.25)'); gr.addColorStop(0.4, 'rgba(90,50,10,0)'); gr.addColorStop(1, 'rgba(90,50,10,0.35)')
    ctx.fillStyle = gr; ctx.fillRect(-len * 0.2, -len * 1.1, len * 0.4, len)
    ctx.restore()
    peel(sp * 0.35, 1)
  } else {
    // wrapped: one spindle of husk with a second leaf over it and the wrap lines
    K.shape(ctx, K.leaf(0, -len * 0.1, 0, -len, len * 0.32, 0.42), { fill: husk, line: C.ink, lw: 1.7, seed, shade: { amount: 0.35, angle: 0 }, light: { amount: 0.25, angle: Math.PI }, texture: 0.4 })
    K.shape(ctx, K.leaf(len * 0.04, -len * 0.12, -len * 0.03, -len * 0.9, len * 0.16, 0.35), { fill: K.shade(husk, 0.1), line: huskLine, lw: 1.2, seed: seed + 1 })
    for (const dx of [-0.07, 0.08]) K.line(ctx, K.curve([[dx * len, -len * 0.18], [dx * len * 1.3, -len * 0.5], [dx * len * 0.4, -len * 0.88]], 10), { color: K.rgba(huskLine, 0.7), lw: 1, wob: 0.3, taper: 6 })
  }
  // silk: a tuft of fine curling threads, pale green-gold turning rust brown
  const silk = K.mixColor('#e3dc8c', '#9a5a2c', d)
  for (let i = 0; i < 9; i++) {
    const a = (i - 4) * 0.16, L = len * (0.22 + (i % 3) * 0.05)
    K.line(ctx, K.curve([[0, -len * 0.95], [Math.sin(a) * L * 0.5, -len - L * 0.5], [Math.sin(a * 2) * L + 4 * Math.sin(i), -len - L * (0.8 - d * 0.5)]]), { color: silk, lw: 1.3, wob: 0.4, taper: 6, seed: seed + i })
  }
  ctx.restore()
}
// each plant's own leaves: where they sit, which side, how they arch and fold (some fold sharply, as corn does)
function cornLeafSet(k) {
  return K.memo('corn-leafset' + k, () => {
    const r = K.rng('corn-leaves' + k), out = [], N = 11
    let side = r() < 0.5 ? 1 : -1
    for (let i = 0; i < N; i++) {
      side = r() < 0.85 ? -side : side
      out.push({ i, f: 0.035 + i * 0.079 + (r() - 0.5) * 0.02, side, a0: 0.26 + r() * 0.24, curl: 0.95 + r() * 0.75, len: (0.86 + r() * 0.3) * (110 + 150 * Math.sin(Math.PI * (0.15 + 0.75 * (i / N)))), back: r() < 0.5, ph: r() * 6 })
    }
    return out
  })
}
// one corn plant: p = {x, y, h, k, hero}; grows with c.g, dries with c.dry from the bottom leaves up
function cornPlant(ctx, p, c, t) {
  const { x: bx, y: by, h, k } = p, u = h / 620, g = c.g, H0 = h * g, d = c.dry
  const sway = (y) => (7 * Math.sin(t * 1.6 + k * 1.3) + (p.lean || 0)) * Math.pow(y / h, 2)
  const P = (f) => [bx + sway(f * H0), by - f * H0]
  const leaves = []
  for (const L of cornLeafSet(k)) {
    const grow = K.ease.out(K.clamp((g - L.f * 0.55) / 0.25))
    if (grow <= 0) continue
    const dk = K.clamp(d * 1.7 - (L.i / 11) * 0.7), [nx, ny] = P(L.f)
    const b = cornBlade(nx, ny, L.len * grow * u * (1 - 0.12 * dk), L.a0 + dk * 0.35, L.curl + dk * 1.5 + 0.05 * Math.sin(t * 2 + L.ph), 22 * u * (0.55 + 0.45 * grow) * (1 - 0.35 * dk), L.side, 1.4 + 1.1 * dk)
    leaves.push({ b, col: cornLeafCol(dk), seed: k * 50 + L.i, back: L.back })
  }
  for (const L of leaves) if (L.back) cornLeafDraw(ctx, L.b, L.col, L.seed, true)
  // the stalk, tapering, with its nodes; while it grows its tip is a rolled whorl of new leaves
  const stalkCol = K.mixColor(CORN_COL.stalk, CORN_COL.dryDark, d), sl = [], sr = []
  for (let i = 0; i <= 16; i++) { const f = i / 16, [x, y] = P(f), w = K.lerp(9.5, 3.5, f) * u; sl.push([x - w, y]); sr.push([x + w, y]) }
  K.shape(ctx, sl.concat(sr.reverse()), { fill: stalkCol, line: C.ink, lw: 1.6, seed: 700 + k, wob: 0.5, shade: { amount: 0.35, angle: 0 } })
  for (const L of cornLeafSet(k)) { const [x, y] = P(L.f), w = K.lerp(10, 4, L.f) * u; K.line(ctx, [[x - w, y], [x + w, y + 2]], { color: K.rgba(C.ink, 0.6), lw: 1.3, wob: 0, taper: 2 }) }
  const ts = K.clamp((g - 0.84) / 0.16), [tx, ty] = P(1)
  if (ts < 0.98) K.shape(ctx, K.leaf(tx, ty + 30 * u * (1 - ts), tx + sway(h) * 0.2, ty - 46 * u * (1 - ts), 16 * u * (1 - ts * 0.5), 0.3), { fill: cornLeafCol(0), line: C.ink, lw: 1.5, seed: 800 + k, shade: { amount: 0.3, angle: 0 } })
  for (const L of leaves) if (!L.back) cornLeafDraw(ctx, L.b, L.col, L.seed, false)
  // the ear, from a node about halfway up, in front of the leaves; it droops once dry
  const ear = K.clamp((g - 0.5) / 0.4)
  if (ear > 0 && !p.noEar) {
    const [ex, ey] = P(0.44), side = k % 2 ? -1 : 1
    cornEar(ctx, ex + side * 4 * u, ey, side * K.lerp(0.4, 2.5, c.droop), 128 * ear * u * (p.hero ? 1.2 : 1), d, p.hero ? K.at(c.dry, 0.3, 0.5) : 0, k * 30)
  }
  // the tassel: a spike with drooping branches and little hanging anthers
  if (ts > 0) {
    const col = K.mixColor('#cfc56a', '#a4793e', d), L = 70 * ts * u
    K.line(ctx, [[tx, ty + 6], [tx + sway(h) * 0.3, ty - L]], { color: col, lw: 3, wob: 0.4, taper: 6, seed: k })
    for (let i = 0; i < 7; i++) {
      const s0 = (i % 2 ? 1 : -1) * (0.5 + (i >> 1) * 0.25), y0 = ty - L * (0.15 + 0.12 * (i >> 1)), l = L * (0.7 - 0.08 * (i >> 1))
      const br = K.curve([[tx, y0], [tx + Math.sin(s0) * l * 0.55, y0 - l * 0.35], [tx + Math.sin(s0) * l, y0 + l * (0.1 + d * 0.25)]], 10)
      K.line(ctx, br, { color: col, lw: 2.2, wob: 0.3, taper: 6, seed: k * 9 + i })
      for (let j = 2; j < br.length - 1; j += 3) K.line(ctx, [br[j], [br[j][0] + 1, br[j][1] + 5]], { color: K.mixColor('#e9dc7a', '#8c6434', d), lw: 1.4, wob: 0, taper: 1 })
    }
  }
}

// the farmer: straw hat, white shirt, a hoe; he tips his head back and shades his eyes as the corn goes up
function cornFarmer(ctx, x, y, lt, t) {
  const look = K.at(lt, 0.55, 0.55, 'inOut') * (1 - 0.6 * K.at(lt, 2.2, 0.6)), shade = K.at(lt, 0.8, 0.4, 'out') * (1 - K.at(lt, 2.3, 0.5))
  const limb = (pts, col, w) => { K.line(ctx, pts, { color: C.ink, lw: w + 4, wob: 0.6, taper: 3, seed: 5 }); K.line(ctx, pts, { color: col, lw: w, wob: 0.6, taper: 3, seed: 5 }) }
  K.groundShadow(ctx, x + 20, y + 4, 90, 14, 0.3)
  // the hoe, held in the far hand, blade on the ground
  K.line(ctx, [[x + 52, y - 205], [x + 6, y - 6]], { color: '#8a6440', lw: 6, wob: 0.3, taper: 0 })
  K.shape(ctx, [[x - 24, y - 10], [x + 14, y - 14], [x + 16, y + 2], [x - 22, y + 4]], { fill: C.metalDark, line: C.ink, lw: 1.5, seed: 2 })
  limb([[x + 20, y - 262], [x + 46, y - 220], [x + 52, y - 200]], '#e6dfcf', 20)
  // legs and boots
  for (const [dx, col] of [[12, '#435a78'], [-10, '#4f6a8a']]) {
    limb([[x + dx, y - 160], [x + dx - 2, y - 80], [x + dx - 4, y - 14]], col, 26)
    K.shape(ctx, [[x + dx - 34, y - 2], [x + dx - 30, y - 18], [x + dx + 10, y - 20], [x + dx + 12, y + 2]], { fill: '#6b452c', line: C.ink, lw: 1.6, seed: dx + 9, shade: { amount: 0.3 } })
  }
  // the shirt
  const torso = [[x - 30, y - 160], [x - 36, y - 270], [x - 18, y - 284], [x + 26, y - 284], [x + 38, y - 268], [x + 30, y - 160]]
  K.shape(ctx, torso, { fill: '#f1ece0', line: C.ink, lw: 2, seed: 21, shade: { amount: 0.35, angle: 0.3 }, hatch: { angle: -0.9, gap: 6, alpha: 0.2, side: 0, from: 0.6 } })
  K.line(ctx, [[x - 4, y - 280], [x - 2, y - 170]], { color: K.rgba(C.ink, 0.4), lw: 1.1, wob: 0.4, taper: 4 })
  K.shape(ctx, K.rect(x - 32, y - 172, 64, 12, 2), { fill: '#5a3a24', line: C.ink, lw: 1.4, seed: 22 })
  K.shape(ctx, K.rect(x - 8, y - 173, 14, 14, 2), { fill: '#d9b860', line: C.ink, lw: 1.1, seed: 23 })
  // the head tips back about the neck as he looks up
  const nx = x - 4, ny = y - 284, tilt = 0.4 * look
  ctx.save(); ctx.translate(nx, ny); ctx.rotate(tilt); ctx.translate(-nx, -ny)
  K.shape(ctx, K.rect(x - 12, y - 298, 18, 20, 4), { fill: '#a8734c', line: C.ink, lw: 1.6, seed: 30 })
  // a face in profile, looking left: brow, nose, moustache, chin, ear, dark hair under the brim
  const skin = '#b98459'
  const head = K.curve([[x - 24, y - 336], [x - 6, y - 346], [x + 14, y - 338], [x + 20, y - 316], [x + 12, y - 298], [x - 8, y - 292], [x - 22, y - 298], [x - 25, y - 306], [x - 26, y - 316], [x - 34, y - 318], [x - 25, y - 324], [x - 24, y - 336]], 48)
  K.shape(ctx, head, { fill: skin, line: C.ink, lw: 2, seed: 31, shade: { amount: 0.32, angle: 0.2 }, light: { amount: 0.25, angle: -2.6 } })
  K.shape(ctx, [[x + 2, y - 344], [x + 18, y - 336], [x + 20, y - 318], [x + 10, y - 322], [x + 4, y - 334]], { fill: '#3a2a22', line: null, wob: 0.4, seed: 38 })
  K.shape(ctx, [[x - 31, y - 314], [x - 20, y - 312], [x - 15, y - 303], [x - 27, y - 304]], { fill: '#3a2a22', line: null, wob: 0.4, seed: 32 }) // moustache
  K.shape(ctx, K.ellipse(x + 6, y - 318, 4.5, 7.5), { fill: '#a06a46', line: C.ink, lw: 1.2, seed: 33 })
  const blink = K.pulse(t, [CORN_T0 + 1.6, CORN_T0 + 2.9], 0.14)
  K.line(ctx, [[x - 19, y - 326], [x - 14, y - 325 + 3 * (1 - blink)]], { color: C.ink, lw: 2.4, wob: 0, taper: 1 })
  K.line(ctx, [[x - 22, y - 333], [x - 11, y - 333]], { color: C.ink, lw: 1.6, wob: 0.3, taper: 3 })
  // the sombrero: a wide straw brim, a domed crown, a dark band
  const brim = K.ellipse(x - 4, y - 342, 70, 15, -0.05, 48)
  K.shape(ctx, brim, { fill: '#e2c27c', line: C.ink, lw: 2, seed: 34, shade: { amount: 0.3, angle: 1.4 }, hatch: { angle: 0.6, gap: 5, alpha: 0.22 } })
  const crown = K.curve([[x - 30, y - 345], [x - 26, y - 372], [x - 4, y - 384], [x + 20, y - 372], [x + 22, y - 345]], 24)
  K.shape(ctx, crown, { fill: '#e8cb88', line: C.ink, lw: 2, seed: 35, shade: { amount: 0.3, angle: 0.2 }, hatch: { angle: -0.6, gap: 5, alpha: 0.2 } })
  K.shape(ctx, [[x - 30, y - 352], [x + 22, y - 352], [x + 22, y - 344], [x - 30, y - 344]], { fill: '#7a4a28', line: C.ink, lw: 1.3, seed: 36 })
  ctx.restore()
  // the near arm: hangs, then rises to shade his eyes under the brim
  const sh0 = [x - 22, y - 268], hand = [K.lerp(x - 30, x - 34, shade), K.lerp(y - 150, y - 345, shade)]
  const elbow = [K.lerp(x - 32, x - 66, shade), K.lerp(y - 205, y - 272, shade)]
  limb([sh0, elbow, hand], '#f1ece0', 22)
  K.shape(ctx, K.circle(hand[0], hand[1], 10, 16), { fill: '#b07d55', line: C.ink, lw: 1.6, seed: 37 })
}

// ---------- the valley behind, drawn once (green and dry versions, so the far fields can dry too)
function cornBack(dry) {
  return K.memo('corn-back' + dry, () => {
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const g = c.getContext('2d'), r = K.rng('corn-back')
    hill(g, 600, 90, '#a9b6c4', 31)
    hill(g, 640, 50, '#9aaab3', 32)
    const bands = [[648, 672, dry ? '#c9b46e' : '#9fbf6a'], [672, 700, dry ? '#b8a15c' : '#86ad57'], [700, 740, dry ? '#cdb56a' : '#93b75e']]
    for (const [y0, y1, col] of bands) K.shape(g, [[0, y0], [W, y0 - 2], [W, y1], [0, y1]], { fill: col, line: null, wob: 1, seed: y0, texture: 0.6 })
    for (let i = 0; i < 9; i++) { const x = 40 + i * 120 + r() * 50, s = 10 + r() * 8; K.shape(g, K.blob(x, 646, s, i, 0.25, 16, s * 0.8), { fill: '#6f8f55', line: '#4a5c36', lw: 1, seed: i, shade: { amount: 0.3 } }) }
    K.shape(g, K.rect(1000, 630, 30, 20), { fill: '#efe4cd', line: C.ink, lw: 1.2, seed: 3 })
    K.shape(g, [[996, 632], [1015, 620], [1034, 632]], { fill: '#b65a3b', line: C.ink, lw: 1.2, seed: 4 })
    // a far row of corn, a band of leaves
    for (let x = -10; x < W + 20; x += 9) {
      const hh = 34 + r() * 14, col = dry ? (r() < 0.5 ? CORN_COL.dry : CORN_COL.dryDark) : (r() < 0.5 ? CORN_COL.leaf : '#6fa44a')
      for (const s of [-1, 1]) K.line(g, K.curve([[x, 745], [x + s * 6, 745 - hh * 0.6], [x + s * 12, 745 - hh * 0.4]]), { color: col, lw: 3, wob: 0.3, taper: 4 })
      K.line(g, [[x, 748], [x + 1, 745 - hh]], { color: K.shade(col, -0.15), lw: 2, wob: 0.2, taper: 2 })
    }
    // the near soil: furrows running across
    K.shape(g, [[0, 742], [W, 740], [W, H], [0, H]], { fill: CORN_COL.soil, line: null, wob: 0.6, texture: 0.9 })
    for (let k = 0; k < 9; k++) { const y = 760 + k * k * 4.2 + k * 14; K.line(g, [[-10, y], [W + 10, y + 3]], { color: K.rgba(CORN_COL.soilDark, 0.7), lw: 2 + k * 0.5, wob: 1.6, taper: 0, seed: 300 + k }); K.line(g, [[-10, y - 4 - k * 0.6], [W + 10, y - 1]], { color: K.rgba('#ad7c56', 0.6), lw: 1.5 + k * 0.3, wob: 1.6, taper: 0, seed: 320 + k }) }
    for (let i = 0; i < 50; i++) { const y = 760 + Math.pow(r(), 0.8) * 320, x = r() * W, s = (2 + r() * 4) * (y - 640) / 300; K.shape(g, K.blob(x, y, s, i, 0.4, 10, s * 0.6), { fill: r() < 0.5 ? '#a87a58' : '#9b8a78', line: K.rgba(C.ink, 0.5), lw: 0.8, wob: 0.3, seed: i }) }
    return c
  })
}

sceneAt('corn', {
  in: { type: 'turn', dur: 0.6, dir: 'left' },
  draw(ctx, s) {
    const lt = Math.min(s.lt, 3.6), t = s.t, c = cornClock(lt)
    K.paper(ctx, W, H, C.paper)
    // late-season light warms the sky as the field dries
    sky(ctx, 230, CORN.hz, lt, { top: K.mixColor(C.sky, '#c6d3d2', c.dry), low: K.mixColor(C.skyLow, '#f1e2bf', c.dry), clouds: [[180, 320, 0.85, 22], [700, 285, 0.65, 16], [1100, 350, 0.7, 20]] })
    ctx.drawImage(cornBack(false), 0, 0)
    if (c.dry > 0) { ctx.save(); ctx.globalAlpha = c.dry; ctx.drawImage(cornBack(true), 0, 0); ctx.restore() }
    // blackbirds cross the dry field
    for (let i = 0; i < 5; i++) {
      const bt = lt - 1.75 - i * 0.1
      if (bt < 0) continue
      const bx = -40 + bt * 300 + (i % 3) * 40, by = 300 + (i % 3) * 18 - bt * 22 + (i >> 1) * 12, fl = Math.sin(lt * 16 + i * 2) * 9
      K.line(ctx, K.curve([[bx - 17, by - fl], [bx - 7, by - 3], [bx, by + 2], [bx + 7, by - 3], [bx + 17, by - fl]], 12), { color: '#3a302a', lw: 3, wob: 0, taper: 6 })
    }
    // the row behind, drawn on its own layer and washed back with the haze of distance
    const lay = K.memo('corn-layer', () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv }), lg = lay.getContext('2d')
    lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1; lg.clearRect(0, 0, W, H)
    CORN_BACK.forEach((p) => cornPlant(lg, p, c, t))
    lg.globalCompositeOperation = 'source-atop'; lg.fillStyle = K.rgba(K.mixColor('#dfe8df', '#efe2c4', c.dry), 0.38); lg.fillRect(0, 0, W, H)
    ctx.drawImage(lay, 0, 0)
    for (const p of CORN_FRONT) K.groundShadow(ctx, p.x + 10, p.y + 6, 60 + 50 * c.g, 11 + 5 * c.g, 0.28)
    CORN_FRONT.forEach((p) => cornPlant(ctx, p, c, t))
    ctx.save(); ctx.translate(905, 985); ctx.scale(0.9, 0.9); ctx.translate(-905, -985)
    cornFarmer(ctx, 905, 985, lt, t)
    ctx.restore()
    cap(ctx, s, '4 MONTHS', [['Corn grows tall, then dries on the stalk.', 0.45]])
  },
})
