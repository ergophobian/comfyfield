// Hand-drawn video kit: drawing. Paper, ink lines that wobble and swell like a pen, fills that sit a hair
// off their outline like print, soft inner shade, hatching, grain, labels with leader lines.
// Every shape is a list of points [[x, y], ...] so it can be wobbled, morphed, drawn on, clipped.
(function () {
  const K = window.K

  // ---------- shapes as points
  K.ellipse = function (cx, cy, rx, ry = rx, rot = 0, n = 64) {
    const c = Math.cos(rot), s = Math.sin(rot), out = []
    for (let i = 0; i < n; i++) {
      const a = (i / n) * K.TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry
      out.push([cx + x * c - y * s, cy + x * s + y * c])
    }
    return out
  }
  K.circle = (cx, cy, r, n = 64) => K.ellipse(cx, cy, r, r, 0, n)
  K.rect = function (x, y, w, h, r = 0) {
    if (!r) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
    r = Math.min(r, w / 2, h / 2)
    const out = [], arc = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]) } }
    arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI)
    return out
  }
  // an organic closed blob: lumpiness 0..1
  K.blob = function (cx, cy, r, seed = 1, lump = 0.18, n = 48, ry) {
    const out = []
    for (let i = 0; i < n; i++) {
      const a = (i / n) * K.TAU
      const k = 1 + lump * K.noise1(Math.cos(a) * 1.7 + 10, seed) + lump * 0.5 * K.noise1(Math.sin(a) * 3.1 + 20, seed + 7)
      out.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * (ry || r) * k])
    }
    return out
  }
  // a leaf / petal / tear: from base (x0,y0) to tip (x1,y1), width w, bulge position 0..1
  K.leaf = function (x0, y0, x1, y1, w, bulge = 0.4, n = 24) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, out = []
    for (let i = 0; i <= n; i++) { const t = i / n, h = Math.sin(Math.PI * Math.pow(t, bulge / 0.5 * 0.5 + 0.25)) * w / 2; out.push([x0 + dx * t + nx * h, y0 + dy * t + ny * h]) }
    for (let i = n - 1; i > 0; i--) { const t = i / n, h = Math.sin(Math.PI * Math.pow(t, bulge / 0.5 * 0.5 + 0.25)) * w / 2; out.push([x0 + dx * t - nx * h, y0 + dy * t - ny * h]) }
    return out
  }
  // quadratic/cubic curves as points (open)
  K.curve = function (pts, n = 32) {
    // Catmull-Rom through the given points
    const out = []
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]
      const m = Math.max(2, Math.round(n / (pts.length - 1)))
      for (let j = 0; j < m; j++) {
        const t = j / m, t2 = t * t, t3 = t2 * t
        out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)))
      }
    }
    out.push(pts[pts.length - 1].slice())
    return out
  }
  K.move = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
  K.scale = (pts, sx, sy = sx, cx = 0, cy = 0) => pts.map(([x, y]) => [cx + (x - cx) * sx, cy + (y - cy) * sy])
  K.rotate = function (pts, a, cx = 0, cy = 0) {
    const c = Math.cos(a), s = Math.sin(a)
    return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c])
  }
  K.bounds = function (pts) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
    for (const [x, y] of pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }
  }
  // two shapes with the same point count blend into each other
  K.morph = (a, b, t) => a.map((p, i) => [K.lerp(p[0], b[i][0], t), K.lerp(p[1], b[i][1], t)])

  // ---------- the hand: resample a line at even spacing and push each point along its normal by noise
  K.resample = function (pts, step = 6, closed = true) {
    const P = closed ? pts.concat([pts[0]]) : pts, out = []
    let carry = 0
    for (let i = 0; i < P.length - 1; i++) {
      const [ax, ay] = P[i], [bx, by] = P[i + 1], L = Math.hypot(bx - ax, by - ay)
      let d = carry
      while (d < L) { out.push([ax + ((bx - ax) * d) / L, ay + ((by - ay) * d) / L]); d += step }
      carry = d - L
    }
    if (!closed) out.push(P[P.length - 1].slice())
    return out
  }
  // amp: how far the hand wanders (px). freq: wanders per px. boil: redraw rate (drawings per second, 0 = still)
  K.wob = function (pts, o = {}) {
    const { seed = 1, amp = 1.4, freq = 0.035, step = 5, closed = true, t = 0, boil = 0 } = o
    const s = seed + (boil ? Math.floor(t * boil) * 977 : 0)
    const R = K.resample(pts, step, closed), n = R.length, out = []
    let dist = 0
    for (let i = 0; i < n; i++) {
      const a = R[(i - 1 + n) % n], b = R[(i + 1) % n]
      const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1
      if (i) dist += Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1])
      const k = amp * (K.noise1(dist * freq, s) + 0.35 * K.noise1(dist * freq * 4.3, s + 3))
      out.push([R[i][0] - (ty / L) * k, R[i][1] + (tx / L) * k])
    }
    return out
  }

  K.pathOf = function (ctx, pts, closed = true) {
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
    if (closed) ctx.closePath()
  }

  // ---------- an ink stroke that swells and thins like a pen: a filled ribbon, not a fixed-width line
  // draw: 0..1 how much of it is drawn so far (draw-on). taper: px of thinning at each open end.
  K.ink = function (ctx, pts, o = {}) {
    const { color = '#2b2420', lw = 2.2, closed = false, seed = 3, swell = 0.45, taper = 14, draw = 1, alpha = 1 } = o
    if (draw <= 0 || pts.length < 2) return
    let P = closed ? pts.concat([pts[0]]) : pts
    // cut at draw progress
    if (draw < 1) {
      let total = 0
      for (let i = 1; i < P.length; i++) total += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])
      let want = total * draw, acc = 0
      const cut = [P[0]]
      for (let i = 1; i < P.length; i++) {
        const L = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])
        if (acc + L >= want) { const f = (want - acc) / L; cut.push([K.lerp(P[i - 1][0], P[i][0], f), K.lerp(P[i - 1][1], P[i][1], f)]); break }
        cut.push(P[i]); acc += L
      }
      P = cut
      if (P.length < 2) return
    }
    const n = P.length, cum = [0]
    for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]))
    const total = cum[n - 1] || 1, left = [], right = []
    const ends = closed && draw >= 1 ? 0 : taper
    for (let i = 0; i < n; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)]
      const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1
      let w = lw * (1 + swell * K.noise1(cum[i] * 0.02, seed))
      if (ends) w *= Math.min(1, 0.25 + 0.75 * Math.min(cum[i], total - cum[i]) / ends)
      w = Math.max(0.3, w) / 2
      left.push([P[i][0] - (ty / L) * w, P[i][1] + (tx / L) * w])
      right.push([P[i][0] + (ty / L) * w, P[i][1] - (tx / L) * w])
    }
    ctx.save()
    ctx.globalAlpha *= alpha
    ctx.fillStyle = color
    K.pathOf(ctx, left.concat(right.reverse()))
    ctx.fill()
    ctx.restore()
  }

  // ---------- grain textures (made once, reused)
  function noiseCanvas(w, h, seed, contrast = 1) {
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const g = c.getContext('2d'), img = g.createImageData(w, h), r = K.rng(seed)
    for (let i = 0; i < w * h; i++) {
      const v = 128 + (r() - 0.5) * 255 * contrast
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v
      img.data[i * 4 + 3] = 255
    }
    g.putImageData(img, 0, 0)
    return c
  }
  K.grainTile = (seed = 1) => K.memo('grain' + seed, () => noiseCanvas(256, 256, seed))

  // the sheet of paper: base colour, soft blotches, fibres, fine tooth. Cached per colour and size.
  K.paperCanvas = function (W, H, color = '#efe8da', seed = 5) {
    return K.memo(`paper${W}x${H}${color}${seed}`, () => {
      const c = document.createElement('canvas')
      c.width = W; c.height = H
      const g = c.getContext('2d'), r = K.rng(seed)
      g.fillStyle = color
      g.fillRect(0, 0, W, H)
      // blotches: the uneven tone of real paper
      for (let i = 0; i < 70; i++) {
        const x = r() * W, y = r() * H, rad = (0.08 + r() * 0.25) * Math.max(W, H)
        const gr = g.createRadialGradient(x, y, 0, x, y, rad)
        const dark = r() < 0.5
        gr.addColorStop(0, dark ? 'rgba(120,95,60,0.018)' : 'rgba(255,252,240,0.035)')
        gr.addColorStop(1, 'rgba(0,0,0,0)')
        g.fillStyle = gr
        g.fillRect(x - rad, y - rad, rad * 2, rad * 2)
      }
      // fibres
      g.lineCap = 'round'
      for (let i = 0; i < (W * H) / 2500; i++) {
        const x = r() * W, y = r() * H, a = r() * K.TAU, L = 4 + r() * 14
        g.strokeStyle = r() < 0.5 ? 'rgba(110,90,60,0.06)' : 'rgba(255,255,250,0.10)'
        g.lineWidth = 0.6 + r() * 0.8
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.5) * L * 0.6, y + Math.sin(a + 0.5) * L * 0.6, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke()
      }
      // tooth
      g.globalCompositeOperation = 'overlay'
      g.globalAlpha = 0.16
      const tile = K.grainTile(seed)
      g.fillStyle = g.createPattern(tile, 'repeat')
      g.fillRect(0, 0, W, H)
      return c
    })
  }
  K.paper = function (ctx, W, H, color, seed) { ctx.drawImage(K.paperCanvas(W, H, color, seed), 0, 0) }

  // moving film grain over the whole frame (changes 12 times a second, like a drawing on twos)
  K.grain = function (ctx, W, H, t = 0, amount = 0.07) {
    const k = Math.floor(t * 12) % 4, tile = K.grainTile(100 + k)
    ctx.save()
    ctx.globalCompositeOperation = 'overlay'
    ctx.globalAlpha = amount
    ctx.fillStyle = ctx.createPattern(tile, 'repeat')
    const ox = (k * 97) % 256, oy = (k * 53) % 256
    ctx.translate(-ox, -oy)
    ctx.fillRect(0, 0, W + 256, H + 256)
    ctx.restore()
  }

  // ---------- a full drawn shape
  // style: { fill, line, lw, seed, wob (amp px, 0 = clean), shade: {color, angle, amount}, light: {...},
  //          hatch: {...}, texture: 0..1, offset: [dx, dy] fill off its outline, draw: 0..1 outline drawn on,
  //          fillIn: 0..1 fill reveal, boil, t, alpha }
  K.shape = function (ctx, pts, s = {}) {
    const seed = s.seed ?? 1
    const wp = s.wob === 0 ? pts : K.wob(pts, { seed, amp: s.wob ?? 1.3, t: s.t || 0, boil: s.boil || 0, step: s.step || 5 })
    const fillIn = s.fillIn ?? 1
    ctx.save()
    if (s.alpha != null) ctx.globalAlpha *= s.alpha
    if (s.fill && fillIn > 0) {
      const [dx, dy] = s.offset || [0.8, 1.1]
      ctx.save()
      ctx.globalAlpha *= fillIn
      ctx.translate(dx, dy)
      K.pathOf(ctx, wp)
      ctx.fillStyle = s.fill
      ctx.fill()
      // everything below is clipped to the fill
      ctx.clip()
      const b = K.bounds(wp)
      if (s.shade) shadeIn(ctx, b, s.shade, false)
      if (s.light) shadeIn(ctx, b, s.light, true)
      if (s.hatch) K.hatchIn(ctx, b, s.hatch, seed)
      if (s.texture) {
        ctx.globalCompositeOperation = 'soft-light'
        ctx.globalAlpha *= s.texture * 0.8 // relative: a shape drawn at alpha 0 must not leave its grain behind
        ctx.fillStyle = ctx.createPattern(K.grainTile(7), 'repeat')
        ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4)
      }
      ctx.restore()
    }
    if (s.line !== null && s.line !== false) {
      K.ink(ctx, wp, { color: s.line || '#2b2420', lw: s.lw ?? 2.2, closed: true, seed: seed + 11, draw: s.draw ?? 1, swell: s.swell ?? 0.45 })
    }
    ctx.restore()
    return wp
  }
  // soft shade across a shape: a gradient from one side. inner=true makes a highlight.
  function shadeIn(ctx, b, o, light) {
    const a = o.angle ?? (light ? -2.2 : 0.9), amt = o.amount ?? 0.35
    const cx = b.cx, cy = b.cy, r = Math.max(b.w, b.h) / 2
    const gx = Math.cos(a) * r, gy = Math.sin(a) * r
    const g = ctx.createLinearGradient(cx - gx, cy - gy, cx + gx, cy + gy)
    const col = o.color || (light ? '#fffaf0' : '#3a2a1c')
    g.addColorStop(0, K.rgba(col, 0))
    g.addColorStop(o.start ?? 0.45, K.rgba(col, 0))
    g.addColorStop(1, K.rgba(col, amt))
    ctx.save()
    ctx.globalCompositeOperation = light ? 'screen' : 'multiply'
    ctx.fillStyle = g
    ctx.fillRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8)
    ctx.restore()
  }
  // hatching inside the current clip: wobbly parallel strokes, only over the shaded side if `side` given
  K.hatchIn = function (ctx, b, o = {}, seed = 1) {
    const { angle = -0.9, gap = 7, color = '#2b2420', lw = 0.9, alpha = 0.35, side, from = 0.55 } = o
    const r = K.rng(seed + 55), c = Math.cos(angle), s = Math.sin(angle), R = Math.hypot(b.w, b.h) / 2 + 6
    ctx.save()
    ctx.globalAlpha *= alpha
    for (let d = -R; d <= R; d += gap) {
      // only the far part of the shape along the side direction
      if (side != null) {
        const sc = Math.cos(side), ss = Math.sin(side)
        // line offset projected on the side direction
        const proj = (-s * d * sc + c * d * ss) / R
        if (proj < from * 2 - 1) continue
      }
      const x0 = b.cx - s * d - c * R, y0 = b.cy + c * d - s * R
      const x1 = b.cx - s * d + c * R, y1 = b.cy + c * d + s * R
      K.ink(ctx, K.wob([[x0, y0], [x1, y1]], { seed: seed + d, amp: 0.8, closed: false, step: 8 }), { color, lw: lw * (0.8 + r() * 0.4), taper: 6 })
    }
    ctx.restore()
  }
  K.hatch = function (ctx, pts, o = {}, seed = 1) {
    ctx.save(); K.pathOf(ctx, pts); ctx.clip(); K.hatchIn(ctx, K.bounds(pts), o, seed); ctx.restore()
  }

  // an open drawn line (stems, cords, steam, motion lines)
  K.line = function (ctx, pts, s = {}) {
    const wp = s.wob === 0 ? pts : K.wob(pts, { seed: s.seed ?? 1, amp: s.wob ?? 1.0, closed: false, t: s.t || 0, boil: s.boil || 0 })
    K.ink(ctx, wp, { color: s.color || '#2b2420', lw: s.lw ?? 2, closed: false, seed: (s.seed ?? 1) + 5, draw: s.draw ?? 1, taper: s.taper ?? 12, alpha: s.alpha ?? 1, swell: s.swell ?? 0.45 })
  }

  // soft contact shadow under an object
  K.groundShadow = function (ctx, cx, cy, rx, ry, alpha = 0.18, color = '#3a2a1c') {
    ctx.save()
    ctx.translate(cx, cy); ctx.scale(1, ry / rx)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
    g.addColorStop(0, K.rgba(color, alpha)); g.addColorStop(0.6, K.rgba(color, alpha * 0.5)); g.addColorStop(1, K.rgba(color, 0))
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(0, 0, rx, 0, K.TAU); ctx.fill()
    ctx.restore()
  }

  // a dashed construction / guide line (like a technical drawing), drawn on with `draw`
  K.guide = function (ctx, pts, o = {}) {
    const { color = '#2b2420', lw = 1, alpha = 0.35, dash = [6, 6], draw = 1, closed = false } = o
    ctx.save()
    ctx.globalAlpha *= alpha
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.lineCap = 'round'
    let P = closed ? pts.concat([pts[0]]) : pts
    if (draw < 1) P = P.slice(0, Math.max(2, Math.ceil(P.length * draw)))
    K.pathOf(ctx, P, false); ctx.stroke()
    ctx.restore()
  }
}
)()
