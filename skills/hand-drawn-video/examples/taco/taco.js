// The taco: one drawing with layers that can lift apart (the exploded view), arrive one by one, and be bitten.
// 3/4 view, open-faced street taco on a paper plate: two corn tortillas, al pastor, pineapple, onion, cilantro,
// salsa verde, a lime wedge.
const TACO = (() => {
  const SQ = 0.4 // the ellipse squash of the 3/4 view
  // fixed scatter for each layer, made once (same taco every frame)
  function scatter(name, n, rMax, o = {}) {
    return K.memo('taco-' + name, () => {
      const r = K.rng('taco' + name), out = []
      for (let i = 0; i < n; i++) {
        const rr = Math.sqrt(r()) * rMax, a = r() * K.TAU
        out.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, r: r(), s: r(), rot: r() * K.TAU, k: i })
      }
      return out.sort((a, b) => a.y - b.y)
    })
  }
  const heapH = (p, h) => h * (1 - (p.x * p.x + p.y * p.y))

  function tortilla(ctx, cx, cy, R, seed, o = {}) {
    const pts = K.memo('tort' + seed + R, () => K.blob(0, 0, R, seed, 0.035, 72, R * SQ))
    const P = K.move(pts, cx, cy)
    // the edge: the same shape a little lower and darker
    K.shape(ctx, K.move(P, 0, 9), { fill: C.tortillaDark, line: C.ink, lw: 2, seed: seed + 1, draw: o.draw ?? 1, fillIn: o.fillIn ?? 1 })
    K.shape(ctx, P, {
      fill: C.tortilla, line: C.ink, lw: 2.2, seed, draw: o.draw ?? 1, fillIn: o.fillIn ?? 1,
      shade: { amount: 0.28, angle: 1.2 }, light: { amount: 0.35, angle: -2 }, texture: 0.9,
    })
    if ((o.fillIn ?? 1) > 0.5) {
      // toasted spots from the comal
      ctx.save(); ctx.globalAlpha *= K.inv(0.5, 1, o.fillIn ?? 1)
      K.pathOf(ctx, P); ctx.clip()
      for (const p of scatter('spots' + seed, 26, 0.95)) {
        const x = cx + p.x * R, y = cy + p.y * R * SQ
        K.shape(ctx, K.blob(x, y, 5 + p.s * 13, p.k + seed, 0.35, 16, (5 + p.s * 13) * 0.55), { fill: K.rgba(C.toast, 0.45 + p.r * 0.3), line: null, wob: 0.5, seed: p.k })
      }
      ctx.restore()
    }
  }

  function pork(ctx, cx, cy, R, o = {}) {
    const lift = o.heap ?? 70
    for (const p of scatter('pork', 58, 0.66)) {
      const x = cx + p.x * R, y = cy + p.y * R * SQ - heapH(p, lift) * (o.heapMul ?? 1)
      const rad = 19 + p.s * 16
      const col = ['#c2582f', '#a8441f', '#cf6a35', '#b34d26'][p.k % 4]
      // a shaved slice: long, thin, ragged, curled a little
      const rot = (p.rot - 3) * 0.35
      const sl = K.move(K.rotate(K.blob(0, 0, rad, p.k + 3, 0.32, 20, rad * 0.46), rot), x, y)
      K.shape(ctx, sl, { fill: col, line: '#4a1d0e', lw: 1.4, seed: p.k, shade: { amount: 0.42, angle: 1.3 }, light: { amount: 0.18 }, texture: 0.9 })
      // the crisp, charred edge from the trompo's fire
      if (p.r > 0.35) K.line(ctx, K.move(K.rotate([[-rad * 0.7, -rad * 0.2], [0, -rad * 0.42], [rad * 0.7, -rad * 0.25]], rot), x, y), { color: K.rgba(C.char, 0.8), lw: 3.2, seed: p.k + 4, taper: 6 })
      // a glint of fat
      if (p.r < 0.3) K.line(ctx, K.move(K.rotate([[-rad * 0.3, rad * 0.05], [rad * 0.25, -rad * 0.05]], rot), x, y), { color: 'rgba(255,214,170,0.55)', lw: 2, seed: p.k + 5, taper: 4 })
    }
  }
  function pineapple(ctx, cx, cy, R, o = {}) {
    for (const p of scatter('pine', 11, 0.5)) {
      const x = cx + p.x * R, y = cy + p.y * R * SQ - heapH(p, o.heap ?? 70) - 16
      const s = 15 + p.s * 7
      const pts = K.rotate([[-s, -s * 0.6], [s, -s * 0.8], [s * 0.8, s * 0.7], [-s * 0.9, s * 0.6]], p.rot * 0.4, 0, 0)
      K.shape(ctx, K.move(pts, x, y), { fill: C.pineapple, line: '#9c6a12', lw: 1.6, seed: p.k + 40, light: { amount: 0.5 }, shade: { amount: 0.25 } })
    }
  }
  function onion(ctx, cx, cy, R, o = {}) {
    for (const p of scatter('onion', 30, 0.62)) {
      const x = cx + p.x * R, y = cy + p.y * R * SQ - heapH(p, o.heap ?? 70) - 22
      const s = 6 + p.s * 4
      K.shape(ctx, K.move(K.rotate(K.rect(-s, -s, s * 2, s * 2, 2), p.rot), x, y), { fill: C.onion, line: '#7d7468', lw: 1.1, seed: p.k + 60, shade: { amount: 0.15 }, wob: 0.4 })
    }
  }
  function leafSprig(ctx, x, y, s, rot, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i - 1) * 0.95
      const lx = Math.cos(a) * s * 0.75, ly = Math.sin(a) * s * 0.75
      K.shape(ctx, K.blob(lx, ly, s * 0.55, seed + i, 0.35, 14), { fill: C.cilantro, line: '#2f5f22', lw: 1.1, seed: seed + i, light: { amount: 0.3 }, wob: 0.5 })
    }
    K.line(ctx, [[0, 0], [0, s * 0.9]], { color: '#2f5f22', lw: 1.4, seed })
    ctx.restore()
  }
  function cilantro(ctx, cx, cy, R, o = {}) {
    for (const p of scatter('cil', 24, 0.6)) {
      const x = cx + p.x * R, y = cy + p.y * R * SQ - heapH(p, o.heap ?? 70) - 28
      leafSprig(ctx, x, y, 10 + p.s * 6, p.rot, p.k)
    }
  }
  function salsa(ctx, cx, cy, R, o = {}) {
    const d = o.draw ?? 1
    if (o.splat) {
      // a spoonful of sauce lifted on its own: one glossy splat with a few drips
      const y = cy - heapH({ x: 0, y: 0 }, o.heap ?? 70) - 26
      K.shape(ctx, K.blob(cx, y, R * 0.4, 31, 0.22, 40, R * 0.13), { fill: K.rgba('#7da332', 0.94), line: '#4f6d1d', lw: 1.6, seed: 31, light: { amount: 0.3 } })
      K.shape(ctx, K.blob(cx - R * 0.12, y - R * 0.04, R * 0.14, 2, 0.2, 16, R * 0.03), { fill: 'rgba(232,244,190,0.8)', line: null, wob: 0.3 })
      for (const [dx, len] of [[-0.25, 18], [0.05, 26], [0.3, 14]]) K.line(ctx, [[cx + dx * R, y + R * 0.1], [cx + dx * R + 1, y + R * 0.1 + len]], { color: K.rgba('#7da332', 0.9), lw: 7, seed: dx * 10 + 5, taper: 6 })
      return
    }
    for (const p of scatter('salsa', 9, 0.5)) {
      if (p.k / 9 > d) continue
      const x = cx + p.x * R, y = cy + p.y * R * SQ - heapH(p, o.heap ?? 70) - 26
      const r = 11 + p.s * 9
      K.shape(ctx, K.blob(x, y, r, p.k + 31, 0.28, 18, r * 0.62), { fill: K.rgba(C.salsa, 0.92), line: '#4f6d1d', lw: 1.2, seed: p.k + 31, light: { amount: 0.35 } })
      K.shape(ctx, K.blob(x - r * 0.3, y - r * 0.2, r * 0.28, p.k + 2, 0.2, 10, r * 0.14), { fill: 'rgba(240,248,210,0.85)', line: null, wob: 0.3, seed: p.k })
      // flecks of chile and seed
      K.shape(ctx, K.circle(x + r * 0.35, y + r * 0.1, 1.8), { fill: '#3e5a17', line: null, wob: 0 })
    }
  }
  function lime(ctx, x, y, s, o = {}) {
    // a wedge on its side: green rind arc, pale pulp face with segment lines
    const rind = [], pulp = []
    for (let i = 0; i <= 20; i++) { const a = Math.PI * (i / 20); rind.push([x + Math.cos(a) * s * 1.2, y - Math.sin(a) * s * 0.75]) }
    rind.push([x - s * 1.2, y + 6], [x + s * 1.2, y + 6])
    for (let i = 0; i <= 20; i++) { const a = Math.PI * (i / 20); pulp.push([x + Math.cos(a) * s * 1.05, y - Math.sin(a) * s * 0.62]) }
    K.groundShadow(ctx, x, y + 8, s * 1.4, s * 0.3, 0.2)
    K.shape(ctx, rind, { fill: '#5d9a33', line: C.ink, lw: 1.8, seed: 81, shade: { amount: 0.3 } })
    K.shape(ctx, pulp, { fill: C.limePulp, line: '#6f8f3a', lw: 1.2, seed: 82, light: { amount: 0.3 } })
    for (let i = 1; i < 5; i++) { const a = Math.PI * (i / 5); K.line(ctx, [[x, y - 2], [x + Math.cos(a) * s * 0.95, y - Math.sin(a) * s * 0.56]], { color: '#a9c46a', lw: 1.2, seed: 90 + i, taper: 3 }) }
  }
  function plate(ctx, cx, cy, R, o = {}) {
    const a = o.alpha ?? 1
    ctx.save(); ctx.globalAlpha *= a
    K.groundShadow(ctx, cx + 10, cy + R * SQ * 0.35, R * 1.35, R * SQ * 1.1, 0.22)
    K.shape(ctx, K.ellipse(cx, cy + 14, R * 1.28, R * 1.28 * SQ), { fill: '#e9e3d6', line: C.ink, lw: 1.8, seed: 70, shade: { amount: 0.25 } })
    K.shape(ctx, K.ellipse(cx, cy + 8, R * 1.26, R * 1.26 * SQ), { fill: '#fbf8f2', line: C.ink, lw: 2, seed: 71, shade: { amount: 0.12, angle: -1.2 }, texture: 0.4 })
    K.shape(ctx, K.ellipse(cx, cy + 14, R * 1.02, R * 1.02 * SQ), { fill: '#f3efe6', line: K.rgba(C.ink, 0.35), lw: 1.1, seed: 72 })
    ctx.restore()
  }

  // o.show: layer → 0..1 (arrival), o.lift: layer → px up, o.bites: 0..3 (fractional = mid-bite), o.labels
  const LAYERS = ['tortilla2', 'tortilla1', 'pork', 'pineapple', 'onion', 'cilantro', 'salsa']
  let bitten = null
  function draw(ctx, cx, cy, R, o = {}) {
    const show = (k) => (o.show && o.show[k] != null ? o.show[k] : 1)
    const lift = (k) => (o.lift && o.lift[k]) || 0
    if (o.plate !== false) plate(ctx, cx, cy, R, { alpha: o.plateAlpha ?? 1 })
    // the food goes on its own layer so bites can be cut out of it
    if (!bitten) { bitten = document.createElement('canvas'); bitten.width = W; bitten.height = H }
    const g = bitten.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1
    const pop = (k, fn) => {
      const v = show(k)
      if (v <= 0) return
      g.save()
      const sc = K.lerp(0.6, 1, Math.min(1, v * 1.1)), dy = (1 - Math.min(1, v)) * -40
      g.globalAlpha = K.clamp(v * 2.5)
      g.translate(cx, cy - lift(k) + dy); g.scale(sc, sc); g.translate(-cx, -cy)
      fn(g)
      g.restore()
    }
    const heap = o.heap ?? 70
    pop('tortilla2', (g) => tortilla(g, cx + 10, cy + 8, R * 1.0, 11, { draw: o.drawLine ?? 1, fillIn: o.fillIn ?? 1 }))
    pop('tortilla1', (g) => tortilla(g, cx, cy, R * 0.97, 12, { draw: o.drawLine ?? 1, fillIn: o.fillIn ?? 1 }))
    pop('pork', (g) => pork(g, cx, cy, R, { heap }))
    pop('pineapple', (g) => pineapple(g, cx, cy, R, { heap }))
    pop('onion', (g) => onion(g, cx, cy, R, { heap }))
    pop('cilantro', (g) => cilantro(g, cx, cy, R, { heap }))
    pop('salsa', (g) => salsa(g, cx, cy, R, { heap, draw: K.clamp(show('salsa') * 1.4), splat: o.salsaSplat }))
    // bites: scalloped arcs taken from the front-left rim, one at a time
    const nb = o.bites || 0
    const spots = [[-0.78, 0.25, 0.9], [-0.45, 0.62, 0.95], [-0.95, -0.25, 0.85]]
    for (let i = 0; i < Math.min(3, Math.ceil(nb)); i++) {
      const p = K.clamp(nb - i), [bx, by, bs] = spots[i]
      const r0 = R * 0.3 * bs * K.ease.outBack(Math.min(1, p * 1.6), 1.2)
      const px = cx + bx * R, py = cy + by * R * SQ
      // a bite: overlapping tooth arcs
      const bite = () => {
        g.beginPath()
        for (let k = -3; k <= 3; k++) { const ax = px + k * r0 * 0.27, ay = py + Math.abs(k) * r0 * 0.1; g.moveTo(ax + r0 * 0.36, ay); g.arc(ax, ay, r0 * 0.36, 0, K.TAU) }
        g.moveTo(px - r0 * 0.4 + r0 * 0.9, py - r0 * 0.1); g.ellipse(px - r0 * 0.4, py - r0 * 0.1, r0 * 0.9, r0 * 0.6, 0, 0, K.TAU)
      }
      // the cut edge: a band of tortilla and an ink line, kept only where food remains
      g.save(); g.globalCompositeOperation = 'source-atop'
      bite(); g.lineWidth = 16; g.strokeStyle = C.tortillaDark; g.stroke()
      bite(); g.lineWidth = 7; g.strokeStyle = '#d8b26a'; g.stroke()
      g.restore()
      g.save(); g.globalCompositeOperation = 'destination-out'; bite(); g.fill(); g.restore()
      g.save(); g.globalCompositeOperation = 'source-atop'; bite(); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke(); g.restore()
    }
    ctx.drawImage(bitten, 0, 0)
    if (show('lime') > 0) {
      const v = show('lime')
      ctx.save(); ctx.globalAlpha *= K.clamp(v * 2.5)
      const lx = (o.limeAt || [cx + R * 1.02, cy + R * SQ * 0.55])
      lime(ctx, lx[0], lx[1] - (1 - Math.min(1, v)) * 40, 34)
      ctx.restore()
    }
    // crumbs after bites
    if (nb > 0) {
      const r = K.rng('crumbs')
      for (let i = 0; i < Math.floor(nb * 6); i++) {
        const x = cx - R * (0.4 + r() * 0.9), y = cy + R * SQ * (0.6 + r() * 0.5)
        K.shape(ctx, K.blob(x, y, 3 + r() * 4, i, 0.4, 10), { fill: [C.tortilla, C.pork, C.cilantro, C.onion][i % 4], line: C.ink, lw: 0.8, seed: i })
      }
    }
  }
  return { draw, lime, tortilla, pork, pineapple, onion, cilantro, salsa, leafSprig, plate, SQ, LAYERS }
})()

// ---------- 0:00 the taco, drawn and dressed in the first seconds
const HERO = { x: W / 2, y: 660, R: 370 }
const FOLD = { x: W / 2, y: 640, R: 330 } // the folded taco: the dish fills the middle of the square
const DRESS = { tortilla2: 0, tortilla1: 0, pork: -1, pineapple: -0.08, onion: 0.5, cilantro: 1.0, salsa: 1.5, lime: 2.0 } // local times; the pineapple is already in the air on frame 0
Object.entries(DRESS).forEach(([k, v]) => v > -0.5 && v !== 0 && K.cue(Math.max(0, v), 'taco: ' + k + ' lands', 'hit'))
K.cue(2.55, 'taco: the fold opens', 'soft')
function dressed(lt) {
  const o = {}
  for (const [k, v] of Object.entries(DRESS)) o[k] = v <= 0 ? 1 : K.spring(lt - v, 2.4, 0.5)
  return o
}
function steam(ctx, cx, cy, t, n = 4, a = 1) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.55 + i / n) % 1, x0 = cx + (i - (n - 1) / 2) * 70
    const pts = []
    for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([x0 + Math.sin(u * 5 + t * 2 + i) * 16 * u, cy - u * 170 - ph * 60]) }
    K.line(ctx, pts, { color: '#ffffff', lw: 5, alpha: 0.55 * a * Math.sin(Math.PI * ph), seed: i, taper: 30 })
  }
}
sceneAt('hero', {
  draw(ctx, s) {
    K.paper(ctx, W, H, C.paper)
    // a slow push in while the toppings land on the eighths
    const z = K.lerp(1, 1.05, K.at(s.lt, 0, 3.2, 'inOutSine'))
    ctx.save(); ctx.translate(FOLD.x, FOLD.y); ctx.scale(z, z); ctx.translate(-FOLD.x, -FOLD.y)
    const open = K.at(s.lt, 2.55, 0.45, 'inOut')
    FOLDED.draw(ctx, FOLD.x, FOLD.y, FOLD.R, { show: dressed(s.lt), open })
    steam(ctx, FOLD.x, FOLD.y - FOLD.R * 0.55, s.t + 0.6, 4, 1 - open)
    ctx.restore()
    cap(ctx, s, null, [['How this taco was made.', -0.3]])
  },
})

// ---------- 0:03 take it apart: each layer rises on an eighth, its label draws in as it settles
const APART = [ // layer, lift px, label, side, half-width of the layer (× stack radius)
  ['salsa', 520, 'Salsa verde', 'right', 0.5],
  ['cilantro', 430, 'Cilantro', 'left', 0.6],
  ['onion', 345, 'White onion', 'right', 0.62],
  ['pineapple', 265, 'Pineapple', 'left', 0.5],
  ['pork', 175, 'Pork al pastor', 'left', 0.66],
  ['tortilla1', 70, null, 'right', 0.97],
  ['tortilla2', 0, null, 'right', 1.0], // labelled under the stack
]
const APART_GO = (i) => 0.5 + Math.floor(i / 2) * EIGHTH // two layers lift on each eighth
APART.forEach(([k], i) => { if (i % 2 === 0 || i === APART.length - 1) K.cue(bar(T.apart[0]) + APART_GO(i), 'apart: ' + k + ' lifts', 'soft') })
sceneAt('apart', {
  draw(ctx, s) {
    K.paper(ctx, W, H, C.paper)
    const cx = FOLD.x
    // the opened taco from the last frame of the hero hands over to its layers (a short cross-fade, same spot)
    const hand = K.at(s.lt, 0.42, 0.1, 'inOut') // swapped as the layers start to lift (a longer cross-fade showed a double outline — judge r3 fix 4, reverted)
    const limeUp = K.spring(s.lt - 1.5, 1.4, 0.6)
    FOLDED.draw(ctx, FOLD.x, FOLD.y, FOLD.R, { open: 1, plateAlpha: 1 - K.at(s.lt, 0.05, 0.45), foodAlpha: 1 - hand, limeAlpha: limeUp > 0.001 ? 0 : 1 })
    const lifts = {}
    APART.forEach(([k, px], i) => { lifts[k] = px * K.spring(s.lt - APART_GO(i), 1.5, 0.62) })
    // the whole stack sinks to make room as it opens
    const sink = 170 * K.at(s.lt, 0.5, 0.7, 'inOut'), y = FOLD.y + sink
    const R = K.lerp(FOLD.R, HERO.R * 0.78, K.at(s.lt, 0.5, 0.7))
    // the lime leaves the plate where it lay and rises to the left of the stack
    const limeX = K.lerp(FOLD.x + FOLD.R * 1.02, cx - 225, limeUp), limeY = K.lerp(FOLD.y + FOLD.R * 0.16 + FOLD.R * 0.42 * 0.42, y - 335, limeUp) - Math.sin(Math.PI * K.clamp(limeUp)) * 240 // arcs high, over the label row
    ctx.save(); ctx.globalAlpha *= hand
    TACO.draw(ctx, cx, y, R, { lift: lifts, heap: K.lerp(40, 26, K.at(s.lt, 0.1, 0.6)), plate: false, limeAt: [limeX, limeY], salsaSplat: true, show: { lime: K.clamp(limeUp * 4) } })
    ctx.restore()
    APART.forEach(([k, px, label, side, half], i) => {
      if (!label) return
      const go = APART_GO(i)
      const ly = y - lifts[k] - 22
      const edge = side === 'left' ? cx - R * half - 10 : cx + R * half + 10
      const lx = side === 'left' ? 300 : W - 300
      K.label(ctx, label, lx, ly, edge, ly, { draw: K.at(s.lt, go + 0.12, 0.22, 'out'), size: 25, side })
    })
    // the tortillas: labelled under the stack, on clear paper
    const tl = K.at(s.lt, APART_GO(6) + 0.12, 0.22, 'out'), ty = y + R * 0.4 + 22
    if (tl > 0) { K.line(ctx, [[cx, ty], [cx, ty + 26 * tl]], { color: C.ink, lw: 1.3, seed: 3, alpha: 0.85, taper: 3 }); K.text(ctx, 'CORN TORTILLAS', cx, ty + 58, { size: 25, align: 'center', spacing: 1.5, alpha: K.inv(0.5, 1, tl) }) }
    if (limeUp > 0.3) K.label(ctx, 'Lime', limeX - 110, limeY - 6, limeX - 48, limeY - 6, { draw: K.at(s.lt, 1.62, 0.22, 'out'), size: 25, side: 'left' })
    cap(ctx, s, null, [["Let's take it apart.", 0.1]])
  },
})
K.cue(bar(T.apart[0]) + 1.5, 'apart: lime rises', 'soft')

// ---------- 0:30 dinner: the last toppings land, then three bites on the beat
const BITES = [bar(21), bar(21.5), bar(22)]
BITES.forEach((t, i) => K.cue(t, 'bite ' + (i + 1), 'hit'))
const FINAL_DRESS = { onion: 0.25, cilantro: 0.5, salsa: 0.75, lime: 1.0 }
Object.entries(FINAL_DRESS).forEach(([k, v]) => K.cue(bar(T.bites[0]) + v, 'dinner: ' + k + ' lands', 'hit'))
sceneAt('bites', {
  in: { type: 'slide', dur: 0.5, dir: 'up' },
  draw(ctx, s) {
    K.paper(ctx, W, H, C.paper)
    const show = { pineapple: 1 }
    for (const [k, v] of Object.entries(FINAL_DRESS)) show[k] = K.spring(s.lt - v, 2.4, 0.5)
    let bites = 0
    BITES.forEach((b) => { bites += K.at(s.t, b, 0.14, 'outBack') })
    // the taco gives at each bite; after the last, the plate is cleared away
    const kick = K.pulse(s.t, BITES, 0.3)
    const clear = K.at(s.t, bar(T.end[0]) - 0.35, 0.35, 'in')
    ctx.save(); ctx.translate(0, clear * 900)
    FOLDED.draw(ctx, FOLD.x, FOLD.y + 10, FOLD.R, { show, bites, kick })
    ctx.restore()
    cap(ctx, s, '8:02 PM', [['Two years to grow.', 0.3], ['Three bites to eat.', 1.0]])
  },
})

// ---------- 0:34.5 the end card: ComfyField
sceneAt('end', {
  in: { type: 'cut' },
  draw(ctx, s) {
    K.paper(ctx, W, H, C.paper)
    const img = K.img(LOGO)
    const a = K.spring(s.lt - 0.15, 1.6, 0.55)
    const size = 120 * a
    ctx.save()
    ctx.font = '700 84px "Inter", sans-serif'
    const name = 'ComfyField', tw = ctx.measureText(name).width, gap = 30
    const total = 120 + gap + tw, x0 = (W - total) / 2, y0 = H / 2 - 60
    if (img) ctx.drawImage(img, x0 + (120 - size) / 2, y0 + (120 - size) / 2, size, size)
    ctx.globalAlpha = K.at(s.lt, 0.35, 0.4, 'out')
    ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'
    ctx.fillText(name, x0 + 120 + gap, y0 + 64)
    ctx.restore()
    K.text(ctx, 'Drawn in code. Scored in code.', W / 2, y0 + 210, { size: 38, align: 'center', alpha: K.at(s.lt, 0.75, 0.4, 'out'), color: '#5b5048' })
  },
})
K.overlay((ctx, t, W, H) => K.grain(ctx, W, H, t, 0.05))
