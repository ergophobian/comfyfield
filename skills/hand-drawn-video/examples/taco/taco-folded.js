// The taco as it is served and eaten: folded, two small corn tortillas, the filling in the curve, on a plate whose
// rim shows all round. Seen from a little above, so the back leaf rises behind the filling and the front leaf
// holds it. Bites come from the left end, a third at a time, until only the plate is left.
const FOLDED = (() => {
  const shapeU = (cx, cy, R, top, base, n = 40) => {
    // a leaf: its top edge an arc of height `top`, its bottom the fold (a shallow smile of depth `base`)
    const pts = []
    for (let i = 0; i <= n; i++) { const u = -1 + (2 * i) / n; pts.push([cx + u * R, cy - top * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.08 * u)]) }
    for (let i = n; i >= 0; i--) { const u = -1 + (2 * i) / n; pts.push([cx + u * R * 0.985, cy + base * (1 - u * u)]) }
    return pts
  }
  // the filling's fixed scatter along the opening (made once)
  const fill = (name, n, o = {}) => K.memo('fold-' + name, () => {
    const r = K.rng('fold' + name), out = []
    for (let i = 0; i < n; i++) out.push({ u: (r() * 2 - 1) * (o.span ?? 0.82), v: r(), s: r(), rot: r() * K.TAU, k: i, r: r() })
    return out.sort((a, b) => a.v - b.v)
  })
  let food = null
  function draw(ctx, cx, cy, R, o = {}) {
    const show = (k) => (o.show && o.show[k] != null ? o.show[k] : 1)
    // o.open 0..1: the fold opens flat — the back leaf lies back, the front leaf falls toward us, the crease straightens
    const op = K.ease.inOut(K.clamp(o.open || 0))
    const backTop = K.lerp(R * 0.66, R * 0.4, op), frontTop = K.lerp(R * 0.3, -R * 0.4, op), base = K.lerp(R * 0.2, 0, op)
    // the plate, its rim showing all round
    const py = cy + R * 0.16, prx = R * 1.42, pry = R * 0.42
    ctx.save(); ctx.globalAlpha *= o.plateAlpha ?? 1
    K.groundShadow(ctx, cx + 14, py + pry * 0.55, prx * 1.04, pry * 0.6, 0.22)
    K.shape(ctx, K.ellipse(cx, py + 8, prx, pry), { fill: '#e6dfd1', line: C.ink, lw: 2, seed: 70, shade: { amount: 0.25 } })
    K.shape(ctx, K.ellipse(cx, py, prx * 0.99, pry * 0.97), { fill: '#fbf8f2', line: C.ink, lw: 2.2, seed: 71, shade: { amount: 0.1, angle: -1.2 }, texture: 0.4 })
    K.shape(ctx, K.ellipse(cx, py + 6, prx * 0.76, pry * 0.7), { fill: '#f2eee5', line: K.rgba(C.ink, 0.3), lw: 1.1, seed: 72 })
    ctx.restore()
    // the lime, on the plate's front right
    if (show('lime') > 0 && (o.limeAlpha ?? 1) > 0) {
      const v = show('lime')
      ctx.save(); ctx.globalAlpha = (o.limeAlpha ?? 1) * K.clamp(v * 2.5)
      TACO.lime(ctx, cx + R * 1.02, py + pry * 0.42 - (1 - Math.min(1, v)) * 40, 36)
      ctx.restore()
    }
    // the food on its own layer, so the bites can take it away
    if (!food) { food = document.createElement('canvas'); food.width = W; food.height = H }
    const g = food.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H)
    g.save()
    if (o.kick) { g.translate(cx, cy); g.rotate(o.kick * 0.025); g.translate(-cx, -cy) }
    K.groundShadow(g, cx, cy + base * 0.9, R * 1.02, R * 0.12, 0.3)
    // back leaves: two tortillas, the outer one a touch larger and toastier
    K.shape(g, shapeU(cx - 4, cy + 4, R * 1.02, backTop * 1.04, base), { fill: C.tortillaDark, line: C.ink, lw: 2, seed: 21, shade: { amount: 0.3 }, texture: 0.9 })
    K.shape(g, shapeU(cx, cy, R, backTop, base * 0.95), { fill: C.tortilla, line: C.ink, lw: 2.2, seed: 22, shade: { amount: 0.32, angle: 1.4 }, light: { amount: 0.25, angle: -1.6 }, texture: 0.9 })
    // the inside of the back leaf: a darker band where the filling sits
    g.save(); K.pathOf(g, shapeU(cx, cy, R, backTop, base * 0.95)); g.clip()
    for (const p of fill('spots', 24, { span: 0.95 })) {
      const x = cx + p.u * R, y = cy - backTop * Math.sqrt(1 - p.u * p.u) * (0.25 + p.v * 0.7)
      K.shape(g, K.blob(x, y, 5 + p.s * 11, p.k, 0.35, 14, (5 + p.s * 11) * 0.55), { fill: K.rgba(C.toast, 0.45), line: null, wob: 0.4, seed: p.k })
    }
    g.restore()
    const frontLeaf = () => {
    // the front leaf holds it all
    K.shape(g, shapeU(cx + 2, cy + 3, R * 1.0, frontTop, base), { fill: C.tortilla, line: C.ink, lw: 2.4, seed: 23, shade: { amount: 0.22, angle: 1.0 }, light: { amount: 0.4, angle: -1.9, start: 0.3 }, texture: 0.9 })
    g.save(); K.pathOf(g, shapeU(cx + 2, cy + 3, R, frontTop, base)); g.clip()
    for (const p of fill('fspots', 22, { span: 0.95 })) {
      const x = cx + p.u * R, y = cy + 3 - frontTop * Math.sqrt(1 - p.u * p.u) * p.v * 0.8 + base * 0.5 * (1 - p.u * p.u) * (1 - p.v)
      K.shape(g, K.blob(x, y, 5 + p.s * 12, p.k + 50, 0.35, 14, (5 + p.s * 12) * 0.55), { fill: K.rgba(C.toast, 0.5), line: null, wob: 0.4, seed: p.k + 50 })
    }
    g.restore()
    }
    if (op > 0.5) frontLeaf()
    // the al pastor, heaped in the curve and spilling over the front
    for (const p of fill('pork', 46)) {
      const lip = Math.sqrt(1 - p.u * p.u)
      const x = cx + p.u * R * 0.98, y = cy - frontTop * lip - (p.v - 0.25) * (backTop - frontTop) * lip * 0.9 - 6
      const rad = (17 + p.s * 14) * (0.75 + 0.25 * lip), rot = (p.rot - 3) * 0.4
      const col = ['#c2582f', '#a8441f', '#cf6a35', '#b34d26'][p.k % 4]
      K.shape(g, K.move(K.rotate(K.blob(0, 0, rad, p.k + 3, 0.32, 18, rad * 0.5), rot), x, y), { fill: col, line: '#4a1d0e', lw: 1.4, seed: p.k, shade: { amount: 0.42, angle: 1.3 }, light: { amount: 0.18 }, texture: 0.9 })
      if (p.r > 0.35) K.line(g, K.move(K.rotate([[-rad * 0.7, -rad * 0.2], [0, -rad * 0.42], [rad * 0.7, -rad * 0.25]], rot), x, y), { color: K.rgba(C.char, 0.8), lw: 3, seed: p.k + 4, taper: 6 })
    }
    if (op <= 0.5) frontLeaf()
    // the rim of the front leaf catches the light: a second, finer ink line just inside its top edge
    if (op < 0.4) K.line(g, K.curve([[cx - R * 0.9, cy - frontTop * 0.42], [cx - R * 0.4, cy - frontTop * 0.9], [cx + R * 0.3, cy - frontTop * 0.92], [cx + R * 0.88, cy - frontTop * 0.45]]), { color: 'rgba(255,246,220,0.7)', lw: 3, seed: 8, taper: 20, alpha: 1 - op / 0.4 })
    // toppings on the filling, each arriving with a little drop
    const drop = (k, fn) => { const v = show(k); if (v <= 0) return; g.save(); g.globalAlpha = K.clamp(v * 2.5); g.translate(0, (1 - Math.min(1, v)) * -130); fn(); g.restore() }
    const onTop = (p, lift = 0) => { const lip = Math.sqrt(1 - p.u * p.u); return [cx + p.u * R * 0.9, cy - frontTop * lip - (0.15 + p.v * 0.55) * (backTop - frontTop) * lip - lift] }
    drop('pineapple', () => { for (const p of fill('pine', 10, { span: 0.75 })) { const [x, y] = onTop(p, 14), s = 13 + p.s * 6; K.shape(g, K.move(K.rotate([[-s, -s * 0.6], [s, -s * 0.8], [s * 0.8, s * 0.7], [-s * 0.9, s * 0.6]], p.rot * 0.4), x, y), { fill: C.pineapple, line: '#9c6a12', lw: 1.5, seed: p.k + 40, light: { amount: 0.5 }, shade: { amount: 0.25 } }) } })
    drop('onion', () => { for (const p of fill('onion', 26, { span: 0.8 })) { const [x, y] = onTop(p, 20), s = 5.5 + p.s * 3.5; K.shape(g, K.move(K.rotate(K.rect(-s, -s, s * 2, s * 2, 2), p.rot), x, y), { fill: C.onion, line: '#7d7468', lw: 1, seed: p.k + 60, shade: { amount: 0.15 }, wob: 0.4 }) } })
    drop('cilantro', () => { for (const p of fill('cil', 20, { span: 0.8 })) { const [x, y] = onTop(p, 26); TACO.leafSprig(g, x, y, 9 + p.s * 5, p.rot, p.k) } })
    drop('salsa', () => {
      // salsa verde spooned along the top: a glossy ribbon with drips, a sauce, not leaves
      const pts = []
      for (let i = 0; i <= 16; i++) { const u = -0.72 + (1.44 * i) / 16, lip = Math.sqrt(1 - u * u); pts.push([cx + u * R * 0.9, cy - frontTop * lip - 0.45 * (backTop - frontTop) * lip - 28 + Math.sin(u * 9) * 7]) }
      K.line(g, pts, { color: K.rgba('#7da332', 0.92), lw: 15, seed: 5, draw: K.clamp(show('salsa') * 1.3), taper: 14, swell: 0.5 })
      K.line(g, pts.map(([x, y]) => [x - 2, y - 4]), { color: 'rgba(226,240,170,0.75)', lw: 3.5, seed: 6, draw: K.clamp(show('salsa') * 1.3), taper: 14 })
      for (const [i, len] of [[3, 16], [8, 22], [12, 14]]) if (show('salsa') > 0.8) { const [x, y] = pts[i]; K.line(g, [[x, y + 5], [x + 1, y + 5 + len]], { color: K.rgba('#7da332', 0.9), lw: 6, seed: i, taper: 6 }) }
    })
    g.restore()
    // bites: from the left, a third of the taco each; tooth marks on the cut, the plate untouched
    const nb = o.bites || 0
    if (nb > 0) {
      const edge = cx - R * 1.1 + Math.min(3, nb) * (R * 2.2 / 3) * 1.0
      const xb = nb >= 3 ? W + 100 : edge
      const r0 = R * 0.11
      const bitePath = () => {
        g.beginPath(); g.moveTo(-10, -10); g.lineTo(xb - r0 * 0.6, -10)
        for (let y = cy - R * 0.95; y < cy + R * 0.4; y += r0 * 1.2) { g.arc(xb, y + r0 * 0.6, r0 * 0.7, -Math.PI / 2, Math.PI / 2, false) }
        g.lineTo(xb - r0 * 0.6, H + 10); g.lineTo(-10, H + 10); g.closePath()
      }
      if (nb < 3) {
        g.save(); g.globalCompositeOperation = 'source-atop'; bitePath(); g.lineWidth = 18; g.strokeStyle = C.tortillaDark; g.stroke(); bitePath(); g.lineWidth = 8; g.strokeStyle = '#d8b26a'; g.stroke(); g.restore()
      }
      g.save(); g.globalCompositeOperation = 'destination-out'; bitePath(); g.fill(); g.restore()
      if (nb < 3) { g.save(); g.globalCompositeOperation = 'source-atop'; bitePath(); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke(); g.restore() }
    }
    ctx.save(); ctx.globalAlpha *= o.foodAlpha ?? 1; ctx.drawImage(food, 0, 0); ctx.restore()
    // crumbs on the plate after each bite
    if (nb > 0) {
      const r = K.rng('fold-crumbs')
      for (let i = 0; i < Math.floor(Math.min(3, nb) * 7); i++) {
        const x = cx + (r() * 2 - 1) * prx * 0.7, y = py + (r() - 0.3) * pry * 0.8
        K.shape(ctx, K.blob(x, y, 3 + r() * 5, i, 0.4, 10), { fill: [C.tortilla, C.pork, C.cilantro, C.onion, C.pineapple][i % 5], line: C.ink, lw: 0.8, seed: i })
      }
    }
  }
  return { draw }
})()
