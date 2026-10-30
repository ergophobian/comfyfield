// slots — bars 5–7 (6.0–8.4 s). The field dove through a tile, and inside it is a slot machine: three glass
// reels of the open video models swing open like a triptych, spin with blur and lock one by one on the big
// beats on LTX-2.5, Wan 2.2, MiniMax H3 (a jolt, a glow, sparks, the jackpot rays brighten); "at your hand.";
// then the side reels fold over the middle one like a closing triptych, leaving one card — LTX-2.5 — which the
// cinema scene deals its shots from.

// ---------- builder B's shared pieces (slots, cinema and montage use them; this file loads first)
const BB = {}
BB.cv = (key, w, h) => K.memo('bb-cv-' + key, () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c })
// a cleared offscreen canvas and its context
BB.g = function (key, w, h) {
  const c = BB.cv(key, Math.round(w), Math.round(h)), g = c.getContext('2d')
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'
  g.clearRect(0, 0, c.width, c.height)
  return [c, g]
}
// an image cover-cropped into a box with true round corners (crops the source, so small cells stay cheap)
BB.cover = function (ctx, img, x, y, w, h, r = 0) {
  if (!img || !img.width || w < 1 || h < 1) return false
  const s = Math.max(w / img.width, h / img.height), sw = w / s, sh = h / s
  ctx.save()
  if (r > 0) { rr(ctx, x, y, w, h, r); ctx.clip() }
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h)
  ctx.restore()
  return true
}
// a picture in a box: cover-fit, then zoomed by z about the picture point (ax, ay) (0..1), which is pulled
// toward the box centre by `pull`; it always covers the box. Returns where that point lands on screen.
BB.view = function (ctx, img, x, y, w, h, r, z = 1, ax = 0.5, ay = 0.5, pull = 0) {
  if (!img || !img.width) return [x + w * ax, y + h * ay]
  const s0 = Math.max(w / img.width, h / img.height), dw0 = img.width * s0, dh0 = img.height * s0
  const bx = x + (w - dw0) / 2, by = y + (h - dh0) / 2, Ax = bx + ax * dw0, Ay = by + ay * dh0
  const Tx = K.lerp(Ax, x + w / 2, pull), Ty = K.lerp(Ay, y + h / 2, pull), dw = dw0 * z, dh = dh0 * z
  const ix = Math.min(x, Math.max(x + w - dw, Tx - (Ax - bx) * z)), iy = Math.min(y, Math.max(y + h - dh, Ty - (Ay - by) * z))
  ctx.save()
  if (r > 0.5) { rr(ctx, x, y, w, h, r); ctx.clip() }
  ctx.drawImage(img, ix, iy, dw, dh)
  ctx.restore()
  return [ix + ax * dw, iy + ay * dh]
}
// a flat card (canvas `front`, its back face `back`) seen in true perspective. Flat, it covers x..x+w, y..y+h
// on screen; `map(px)` gives where its column px (0..w) sits in 3D: [X (screen x at depth 0), Z (depth, + away)].
// Drawn in thin vertical strips, each scaled by its depth; where the columns run backwards we see the back.
// Returns its outline (4 corners) for shadows and glows; o.dry: outline only.
BB.plane = function (ctx, front, back, x, y, w, h, map, o = {}) {
  const f = o.f || 1600, vx = o.vx ?? W / 2, vy = o.vy ?? y + h / 2, n = o.n || 72
  const P = (px) => { const [X, Z] = map(px), k = f / (f + Z); return [vx + (X - vx) * k, vy + (y - vy) * k, vy + (y + h - vy) * k] }
  const first = P(0)
  if (o.dry) { const e = P(w); return [[first[0], first[1]], [e[0], e[1]], [e[0], e[2]], [first[0], first[2]]] }
  const fw = front.width / w
  let a = first
  for (let i = 1; i <= n; i++) {
    const px0 = ((i - 1) / n) * w, px1 = (i / n) * w, b = P(px1)
    const top = (a[1] + b[1]) / 2, bot = (a[2] + b[2]) / 2
    if (b[0] >= a[0]) { if (b[0] - a[0] > 0.05) ctx.drawImage(front, px0 * fw, 0, (px1 - px0) * fw, front.height, a[0] - 0.35, top, b[0] - a[0] + 0.7, bot - top) }
    else if (back) { const bw = back.width / w; ctx.drawImage(back, (w - px1) * bw, 0, (px1 - px0) * bw, back.height, b[0] - 0.35, top, a[0] - b[0] + 0.7, bot - top) }
    a = b
  }
  return [[first[0], first[1]], [a[0], a[1]], [a[0], a[2]], [first[0], first[2]]]
}
// a card hinged on a vertical axis at `pivot` px from its left edge x (may lie outside), turned by yaw
// (+ sends its right side away); then optionally the whole rig turned by `orbit` about the screen column ox
BB.hinge = (x, pivot, yaw, orbit = 0, ox = W / 2) => {
  const c = Math.cos(yaw), s = Math.sin(yaw), co = Math.cos(orbit), so = Math.sin(orbit)
  return (px) => { const d = px - pivot, X = x + pivot + d * c, Z = d * s; return orbit ? [ox + (X - ox) * co - Z * so, (X - ox) * so + Z * co] : [X, Z] }
}
// a polygon with round corners
BB.rpoly = (ctx, pts, r) => {
  const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  ctx.beginPath(); const m0 = mid(pts[n - 1], pts[0]); ctx.moveTo(m0[0], m0[1])
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], m = mid(p, q); ctx.arcTo(p[0], p[1], m[0], m[1], r) }
  ctx.closePath()
}
// grow a polygon about its centre
BB.grow = (pts, g) => { const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length; return pts.map(([x, y]) => { const dx = x - cx, dy = y - cy, m = Math.hypot(dx, dy) || 1; return [x + (dx / m) * g, y + (dy / m) * g] }) }
BB.poly = (ctx, pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath() }
// the width of a line set the way slam() sets it
BB.slamW = function (ctx, text, size, weight = 800) {
  ctx.save(); ctx.font = `${weight} ${size}px "Inter", sans-serif`
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.04 * size + 'px'
  const w = ctx.measureText(text).width; ctx.restore(); return w
}
// the width of a headline set the way rise() sets it
BB.riseW = function (ctx, words, size, weight = 800) {
  ctx.save(); ctx.font = `${weight} ${size}px "Inter", sans-serif`
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.035 * size + 'px'
  const w = words.reduce((a, s) => a + ctx.measureText(s).width, 0) + size * 0.28 * (words.length - 1); ctx.restore(); return w
}
// the jackpot sunburst: soft rays turning behind a point
BB.rays = function (ctx, cx, cy, rot, alpha, o = {}) {
  if (alpha <= 0.003) return
  const n = o.n || 20, R = o.r || 1500
  ctx.save()
  const g = ctx.createRadialGradient(cx, cy, o.r0 || 60, cx, cy, R)
  const col = o.color || '74,91,255'
  g.addColorStop(0, `rgba(${col},${alpha})`); g.addColorStop(0.45, `rgba(${col},${alpha * 0.45})`); g.addColorStop(1, `rgba(${col},0)`)
  ctx.fillStyle = g; ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const a0 = rot + (i / n) * K.TAU, a1 = a0 + (K.TAU / n) * (o.w || 0.42)
    ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); ctx.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); ctx.closePath()
  }
  if (o.mode) ctx.globalCompositeOperation = o.mode
  ctx.fill(); ctx.restore()
}
// sparks thrown off a rectangle's rim on a hit (screen space)
BB.sparks = function (ctx, t, at, x, y, w, h, seed, o = {}) {
  const d = t - at, life = o.life || 0.42
  if (d < 0 || d > life) return
  const r = K.rng('bb-sparks' + seed), p = d / life, n = o.n || 18
  ctx.save(); ctx.lineCap = 'round'
  for (let i = 0; i < n; i++) {
    const side = Math.floor(r() * 4), u = r(), sp = 70 + r() * 150, len = 14 + r() * 26
    let px, py, nx, ny
    if (side === 0) { px = x + u * w; py = y; nx = (u - 0.5) * 0.8; ny = -1 } else if (side === 1) { px = x + w; py = y + u * h; nx = 1; ny = (u - 0.5) * 0.8 } else if (side === 2) { px = x + u * w; py = y + h; nx = (u - 0.5) * 0.8; ny = 1 } else { px = x; py = y + u * h; nx = -1; ny = (u - 0.5) * 0.8 }
    const m = Math.hypot(nx, ny); nx /= m; ny /= m
    const go = K.ease.outQuart(p) * sp
    ctx.strokeStyle = i % 3 ? (o.color || 'rgba(47,63,232,') + (1 - p) * 0.9 + ')' : `rgba(255,255,255,${(1 - p) * 0.95})`
    ctx.lineWidth = (o.lw || 4) * (1 - p * 0.6)
    ctx.beginPath(); ctx.moveTo(px + nx * go, py + ny * go); ctx.lineTo(px + nx * (go + len * (1 - p)), py + ny * (go + len * (1 - p))); ctx.stroke()
  }
  ctx.restore()
}
// the LTX-2.5 card: the face the slots end on and the cinema scene deals from (drawn straight, any size)
BB.ltxCard = function (ctx, x, y, w, h, r, o = {}) {
  ctx.save()
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(34,48,201,0.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18 }
  const g = ctx.createLinearGradient(x, y, x + w * 0.4, y + h); g.addColorStop(0, '#5867ff'); g.addColorStop(0.55, '#2f3fe8'); g.addColorStop(1, '#2230c9')
  ctx.fillStyle = g; rr(ctx, x, y, w, h, r); ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip()
  const sh = ctx.createLinearGradient(x, y, x + w, y + h); sh.addColorStop(0, 'rgba(255,255,255,0.22)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sh; ctx.fillRect(x, y, w, h)
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; rr(ctx, x + 1, y + 1, w - 2, h - 2, Math.max(1, r - 1)); ctx.stroke()
  const size = o.size || Math.min(h * 0.3, w * 0.2)
  const tx = x + w / 2, ty = y + h / 2 + (o.sub ? -size * 0.3 : size * 0.04)
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.font = `800 ${size}px "Inter", sans-serif`
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.04 * size + 'px'
  ctx.fillText('LTX-2.5', tx, ty)
  if (o.sub) { ctx.globalAlpha *= o.sub; pill(ctx, 'Cinema', tx, ty + size * 1.0, { size: Math.max(26, size * 0.27), solid: true, dot: true }) }
  ctx.restore()
}

// ---------- v3: the song (window.SONG, from warp.js, which loads after the scenes — so read it only while drawing).
// Every helper is safe without it. Song time is SONG.now; the scenes' own s.t stays v2 time.
BB.now = () => (window.SONG ? SONG.now : 0)
BB.hits = (layer, a, b, minS = 0) => (window.SONG ? SONG.hits(layer, a, b, minS) : [])
BB.pulse = (layer, dur = 0.22, minS = 0) => (window.SONG ? SONG.pulse(layer, dur, minS) : 0)
BB.v2 = (songT) => (window.SONG ? SONG.v2At(songT) : songT)
BB.song = (v2T) => (window.SONG ? SONG.songAt(v2T) : v2T)
// the notes method also hears a few bass-register notes in the melody layer: those belong to the bass
BB.isLow = (h) => h.p != null && h.p < 44
BB.melody = (a, b) => BB.hits('other', a, b).filter((h) => !BB.isLow(h))
// the tune's own range (the melody notes of the whole song)
BB.melRange = () => K.memo('bb-melrange', () => { const ps = ((window.SONG_DATA || {}).layers?.other || []).filter((h) => h.p != null && h.p >= 44).map((h) => h.p); return ps.length ? [Math.min(...ps), Math.max(...ps)] : [46, 72] })
// where a note sits, 0..1: its pitch across the tune (notes method, B), or — no pitch (volume method, A) — a stable
// hash of its time, so the picture still answers every note
BB.note01 = (h) => { if (h.p != null) { const [a, b] = BB.melRange(); return K.clamp((h.p - a) / Math.max(1, b - a)) } return (K.hash('note' + h.t.toFixed(3)) % 997) / 996 }
// an envelope over a list of hits at song time t: jumps to the hit's strength, falls over dur
BB.env = (list, dur, t = BB.now()) => list.reduce((v, h) => { const a = t - h.t; return a >= 0 && a < dur ? Math.max(v, h.s * Math.pow(1 - a / dur, 2)) : v }, 0)
// the bass, from where it enters (12.48): the bass layer plus the low notes the melody layer heard
BB.BASS_IN = 12.4
BB.bass = (dur = 0.45, t = BB.now()) => {
  if (!window.SONG || t < BB.BASS_IN) return 0
  return BB.env(BB.hits('bass', t - dur, t + 1e-6, 0.15).concat(BB.hits('other', t - dur, t + 1e-6).filter(BB.isLow)), dur, t)
}
// the age of the latest hit of a layer (song seconds), Infinity if none
BB.age = (layer, minS = 0) => { const h = window.SONG ? SONG.last(layer, minS) : null; return h ? SONG.now - h.t : Infinity }
// a turn that steps a notch on every hit of a layer and stays there (springing into place)
BB.notches = (layer, step, minS = 0.3) => { const now = BB.now(); return BB.hits(layer, 0, now + 1e-6, minS).reduce((v, h) => v + step * K.spring(now - h.t, 3.2, 0.62), 0) }

;(function () {
  const S0 = span('slots').start, E = (k) => S0 + k * E8
  const STOP = [E(3), E(6), E(9)] // 6.6, 7.2, 7.8 — the big beats
  const FOLD = [E(10), E(11)] // the right reel folds over at 8.0 (down 8.2), the left at 8.2 (down 8.4)
  K.cue(S0, 'slots: spin — the reels swing open, spinning', 'soft')
  K.cue(E(1), 'slots: slam "Open-source video models,"', 'hit')
  K.cue(STOP[0], 'slots: stop — reel 1 locks on LTX-2.5', 'hit')
  K.cue(STOP[1], 'slots: stop — reel 2 locks on Wan 2.2', 'hit')
  K.cue(E(7), 'slots: slam "at your hand."', 'hit')
  K.cue(STOP[2], 'slots: stop — reel 3 locks on MiniMax H3 (the jackpot)', 'hit')
  K.cue(FOLD[0], 'slots: whoosh — the right reel folds over', 'hit')
  K.cue(FOLD[1], 'slots: land — the left reel folds down on top', 'hit')

  const RW = 540, RH = 420, GAP = 36, RES = 1.25, CX = W / 2, CY = 560
  const X0 = [CX - RW * 1.5 - GAP, CX - RW / 2, CX + RW / 2 + GAP], Y0 = CY - RH / 2
  // each reel's drum: the five open models twice round, in its own order
  const STRIPS = [
    ['Wan 2.2', 'LTX-2.5', 'LTX Video', 'MiniMax H3', 'LTX Video', 'Wan 2.2', 'LTX Video', 'LTX Video', 'LTX-2.5', 'MiniMax H3'],
    ['LTX Video', 'MiniMax H3', 'Wan 2.2', 'LTX-2.5', 'LTX Video', 'MiniMax H3', 'LTX-2.5', 'LTX Video', 'Wan 2.2', 'LTX Video'],
    ['LTX Video', 'LTX-2.5', 'LTX Video', 'Wan 2.2', 'MiniMax H3', 'LTX-2.5', 'LTX Video', 'Wan 2.2', 'MiniMax H3', 'LTX Video'],
  ]
  const TARGET = ['LTX-2.5', 'Wan 2.2', 'MiniMax H3']
  const N = 10, STEP = K.TAU / N, R = 330, V = 8, DEC = 0.36, L = (V * DEC) / 3 // ~0.45 of a row a frame: a whip the motion blur smears, names still names
  const FS = 80, MAXW = RW * 0.84
  const sizeOf = (name) => K.memo('bb-reelsize-' + name, () => {
    const c = BB.cv('measure', 8, 8).getContext('2d'); c.font = `800 ${FS}px "Inter", sans-serif`
    if (c.letterSpacing !== undefined) c.letterSpacing = -0.03 * FS + 'px'
    return Math.min(FS, (FS * MAXW) / c.measureText(name).width)
  })
  // a reel's drum angle and speed: full spin, then a cubic brake that arrives dead on the beat, then a clunk
  function reel(i, t) {
    const ts = STOP[i], fin = STRIPS[i].indexOf(TARGET[i]) * STEP + 4 * K.TAU
    if (t >= ts) { const d = t - ts; return { a: fin + 0.085 * Math.sin(d * 46) * Math.exp(-d * 10), w: 0 } }
    const u = (ts - t) / DEC
    if (u <= 1) return { a: fin - L * u * u * u, w: V * u * u }
    return { a: fin - L - V * (ts - DEC - t), w: V }
  }
  const lockOf = (i, t) => K.clamp((t - STOP[i]) / 0.1)

  function reelFace(i, t) {
    const [c, g0] = BB.g('reel' + i, RW * RES, RH * RES)
    let g = g0
    g.scale(RES, RES)
    const { a, w } = reel(i, t), lk = lockOf(i, t), hitP = K.pulse(t, [STOP[i]], 0.45)
    g.save(); rr(g, 0, 0, RW, RH, 34); g.clip()
    const bg = g.createLinearGradient(0, 0, 0, RH); bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#eef1ff')
    g.fillStyle = bg; g.fillRect(0, 0, RW, RH)
    // the payline band: lights on the lock
    if (lk > 0) {
      const bh = 128 * (0.6 + 0.4 * K.spring(t - STOP[i], 3, 0.5))
      g.fillStyle = K.rgba('#2f3fe8', 0.08 * lk + 0.22 * hitP); g.fillRect(0, RH / 2 - bh / 2, RW, bh)
    }
    // the names on the drum, on their own layer; while it spins each is smeared along its travel and softened
    const outer = g
    const [lc, lg] = BB.g('reelnames' + i, RW * RES, RH * RES)
    lg.scale(RES, RES)
    g = lg
    g.textAlign = 'center'; g.textBaseline = 'middle'
    if (g.letterSpacing !== undefined) g.letterSpacing = -0.03 * FS + 'px'
    const spread = 0, n = 1 // the film's motion blur smears the drum; drawn crisp here
    // the dividers between the rows ride the drum with the names
    for (let k = 0; k < N; k++) {
      let ph = (k + 0.5) * STEP - a
      ph = ((((ph + Math.PI) % K.TAU) + K.TAU) % K.TAU) - Math.PI
      if (Math.abs(ph) > 1.5) continue
      const cs = Math.cos(ph), y = RH / 2 - R * Math.sin(ph)
      g.fillStyle = `rgba(47,63,232,${0.28 * cs})`; g.fillRect(26, y - 1.5 * cs, RW - 52, 3 * cs)
    }
    for (let k = 0; k < N; k++) {
      let phi = k * STEP - a
      phi = ((((phi + Math.PI) % K.TAU) + K.TAU) % K.TAU) - Math.PI
      if (Math.abs(phi) > 1.55 + spread) continue
      const name = STRIPS[i][k], win = lk > 0 && name === TARGET[i] && Math.abs(phi) < 0.4
      const size = sizeOf(name), sc = win ? 1 + 0.2 * hitP : 1
      g.font = `800 ${size}px "Inter", sans-serif`
      g.fillStyle = win ? B.blue : lk > 0 ? '#9aa1c4' : B.ink
      for (let j = 0; j < n; j++) {
        const ph = phi + (n > 1 ? (j / (n - 1) - 0.5) * spread : 0)
        if (Math.abs(ph) > 1.52) continue
        const cs = Math.cos(ph)
        g.save(); g.translate(RW / 2, RH / 2 - R * Math.sin(ph)); g.scale(sc, cs * sc)
        g.globalAlpha = Math.pow(cs, 1.3) * (n > 1 ? Math.min(1, 3 / n) : 1)
        if (win && hitP > 0.02) { g.shadowColor = 'rgba(74,91,255,0.9)'; g.shadowBlur = 30 * hitP }
        g.fillText(name, 0, 0)
        g.restore()
      }
      if (win && i === 2) { // the narrower truth: MiniMax H3 is the open-weights one
        const pp = K.spring(t - STOP[i] - 0.1, 2.6, 0.55)
        g.textAlign = 'left'; if (g.letterSpacing !== undefined) g.letterSpacing = '0px'
        if (pp > 0.01) pill(g, 'open weights', RW / 2, RH / 2 + 76, { size: 28, blue: true, scale: pp, alpha: K.clamp(pp * 2) })
        g.textAlign = 'center'; if (g.letterSpacing !== undefined) g.letterSpacing = -0.03 * FS + 'px'
      }
    }
    g = outer
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0)
    g.drawImage(lc, 0, 0); g.restore()
    // the drum's curve: shade at top and bottom
    const sh = g.createLinearGradient(0, 0, 0, RH)
    sh.addColorStop(0, 'rgba(24,30,92,0.34)'); sh.addColorStop(0.24, 'rgba(24,30,92,0)'); sh.addColorStop(0.76, 'rgba(24,30,92,0)'); sh.addColorStop(1, 'rgba(24,30,92,0.34)')
    g.fillStyle = sh; g.fillRect(0, 0, RW, RH)
    // v3 · the snare: the reel snaps — its glass flashes blue and the payline burns, reel after reel
    const sa = BB.age('snare', 0.3) - i * 0.035
    if (sa >= 0 && sa < 0.2) { const q = 1 - sa / 0.2, bh = 96 + 60 * (1 - q); g.fillStyle = `rgba(74,91,255,${0.4 * q * q})`; g.fillRect(0, 0, RW, RH); g.fillStyle = `rgba(47,63,232,${0.35 * q * q})`; g.fillRect(0, RH / 2 - bh / 2, RW, bh) }
    // payline pointers
    g.fillStyle = lk > 0 ? B.blue : 'rgba(47,63,232,0.45)'
    for (const sx of [0, RW]) { const d = sx ? -1 : 1; g.beginPath(); g.moveTo(sx, RH / 2 - 16); g.lineTo(sx + d * 20, RH / 2); g.lineTo(sx, RH / 2 + 16); g.closePath(); g.fill() }
    g.restore()
    // the rim, and once locked a light that runs round it
    g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 2.5; rr(g, 1.5, 1.5, RW - 3, RH - 3, 33); g.stroke()
    // v3 · the snare: and the rim flashes blue
    if (sa >= 0 && sa < 0.2) { const q = 1 - sa / 0.2; g.save(); g.strokeStyle = `rgba(255,255,255,${0.95 * q})`; g.lineWidth = 14 * q + 1; g.shadowColor = 'rgba(74,91,255,1)'; g.shadowBlur = 18; rr(g, 4, 4, RW - 8, RH - 8, 31); g.stroke(); g.restore() }
    if (lk > 0) {
      g.save(); g.strokeStyle = B.blueHi; g.lineWidth = 6; g.lineCap = 'round'; g.shadowColor = 'rgba(74,91,255,0.9)'; g.shadowBlur = 16
      g.setLineDash([150, 1700]); g.lineDashOffset = -(t - STOP[i]) * 2600; rr(g, 4, 4, RW - 8, RH - 8, 31); g.stroke(); g.restore()
    }
    return c
  }
  const markBack = () => K.memo('bb-markback', () => {
    const c = document.createElement('canvas'); c.width = RW * RES; c.height = RH * RES
    const g = c.getContext('2d'); g.scale(RES, RES)
    const gr = g.createLinearGradient(0, 0, RW * 0.4, RH); gr.addColorStop(0, '#3c4cf2'); gr.addColorStop(1, '#1d29b8')
    g.fillStyle = gr; rr(g, 0, 0, RW, RH, 34); g.fill()
    g.globalAlpha = 0.9; mark(g, RW / 2 - 70, RH / 2 - 70, 140, 1, { square: false }); return c
  })
  const ltxBack = () => K.memo('bb-ltxback', () => {
    const c = document.createElement('canvas'); c.width = RW * RES; c.height = RH * RES
    const g = c.getContext('2d'); g.scale(RES, RES); BB.ltxCard(g, 0, 0, RW, RH, 34, { shadow: false }); return c
  })

  // the camera: the dive's momentum carries the machine up to us, then a slow push; each lock jolts it
  BB.slotsCam = function (t) {
    const e = K.spring(t - S0, 1.55, 0.78)
    let s = K.lerp(0.5, 1, e) * (1 + 0.035 * K.at(t, S0 + 0.3, 2.1, 'inOutSine'))
    const jolt = STOP.reduce((v, x) => v + (t > x ? Math.sin((t - x) * 34) * Math.exp(-(t - x) * 13) : 0), 0)
    s *= 1 + 0.012 * K.pulse(t, STOP, 0.3)
    return { s, dy: 9 * jolt }
  }
  // the camera orbits the machine: it swings in from the side, then leans toward each reel as it locks
  BB.slotsOrbit = (t) => K.springTo(t, [[S0, -0.34], [S0 + 0.02, 0], [STOP[0], 0.075], [STOP[1], 0], [STOP[2], -0.075], [FOLD[0] - 0.1, 0]], 1.5, 0.62)
  // the side reels' swing: they open from almost shut as we arrive, rest turned in a little, then fold shut
  const REST = 0.2
  function yawOf(side, t) { // side -1 left (hinge on its right), +1 right (hinge on its left)
    const open = K.spring(t - S0 - 0.04, 1.9, 0.52)
    let a = K.lerp(1.28, REST, open)
    const f = FOLD[side < 0 ? 1 : 0], fp = K.clamp((t - f) / (E8 * 0.999))
    if (t >= f) a = K.lerp(REST, Math.PI, 0.5 * fp * fp + 0.5 * fp * fp * (3 - 2 * fp)) // a slap, but not at full speed (the motion blur)
    return side < 0 ? a : -a
  }
  // background: mist, then the jackpot rays (each lock turns them up)
  BB.slotsBack = function (ctx, t) {
    mist(ctx)
    const kick = BB.pulse('kick', 0.32, 0.5) // v3 · the kick punches the jackpot rays out; the snare snaps them round a notch
    const lvl = 0.05 + 0.05 * STOP.filter((x) => t >= x).length + 0.14 * K.pulse(t, STOP, 0.5) + 0.3 * kick
    const fade = 1 - K.at(t, FOLD[1] + 0.25, 0.5, 'inOut')
    BB.rays(ctx, CX, CY, t * 0.35 + BB.notches('snare', 0.2), lvl * fade, { n: 22, r: 1500 * (1 + 0.15 * kick) })
  }
  // the words (also drawn by the cinema scene as they leave)
  BB.slotsText = function (ctx, t) {
    const out = FOLD[1] + E8 // 8.4: both lines leave as the card lands and the cinema shots deal out
    slam(ctx, t, 'Open-source video models,', CX, 228, E(1), { size: 100, align: 'center', out: out + 0.06 })
    slam(ctx, t, 'at your hand.', CX, 958, E(7), { size: 100, align: 'center', color: B.blue, out })
  }
  BB.SLOT_CARD = { x: X0[1], y: Y0, w: RW, h: RH, r: 34, cx: CX, cy: CY }

  // v3 · the melody: a marquee of 15 bulbs along the reels' tops; every note lights one — under the notes method
  // the bulb follows the pitch (low notes left, high notes right), so the marquee plays the tune; without pitch a
  // stable hash of the note's time picks it. A lit bulb spills light down onto its reel.
  function bulbs(ctx, p, outline, kk) {
    const vis = 1 - K.clamp((Math.abs(p.yaw) - 0.35) / 0.4)
    if (vis <= 0.01) return
    const now = BB.now(), notes = BB.melody(now - 0.5, now + 1e-6)
    for (let k = 0; k < 5; k++) {
      const u = (k + 0.5) / 5, gi = p.i * 5 + k
      const x = K.lerp(outline[0][0], outline[1][0], u), y = K.lerp(outline[0][1], outline[1][1], u) - 26 * kk
      const lit = BB.env(notes.filter((h) => Math.round(BB.note01(h) * 14) === gi), 0.5)
      ctx.save(); ctx.globalAlpha *= vis
      if (lit > 0.01) {
        // its light floods down its reel's glass (clear of the payline's name), and blooms round the bulb (kept
        // flat, below the headline)
        ctx.save(); BB.rpoly(ctx, outline, 34 * kk); ctx.clip()
        // a beam of its light down the whole reel, soft-edged
        const top = Math.min(outline[0][1], outline[1][1]), bot = Math.max(outline[2][1], outline[3][1]), bw = 120 * kk
        const fl = ctx.createLinearGradient(0, top, 0, bot)
        fl.addColorStop(0, `rgba(74,91,255,${0.62 * lit})`); fl.addColorStop(0.45, `rgba(74,91,255,${0.3 * lit})`); fl.addColorStop(1, `rgba(74,91,255,${0.12 * lit})`)
        ctx.fillStyle = fl; ctx.fillRect(x - bw, top, bw * 2, bot - top)
        const ed = ctx.createLinearGradient(x - bw * 1.6, 0, x + bw * 1.6, 0) // feather the beam's sides
        ed.addColorStop(0, 'rgba(74,91,255,0)'); ed.addColorStop(0.25, `rgba(74,91,255,${0.18 * lit})`); ed.addColorStop(0.75, `rgba(74,91,255,${0.18 * lit})`); ed.addColorStop(1, 'rgba(74,91,255,0)')
        ctx.fillStyle = ed; ctx.fillRect(x - bw * 1.6, top, bw * 3.2, bot - top); ctx.restore()
        ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.55)
        const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, 170 * kk)
        hg.addColorStop(0, `rgba(110,128,255,${0.95 * lit})`); hg.addColorStop(0.35, `rgba(110,128,255,${0.45 * lit})`); hg.addColorStop(1, 'rgba(110,128,255,0)')
        ctx.fillStyle = hg; ctx.fillRect(-170 * kk, -170 * kk, 340 * kk, 340 * kk); ctx.restore()
        ctx.shadowColor = 'rgba(74,91,255,1)'; ctx.shadowBlur = 40 * lit
      }
      ctx.fillStyle = lit > 0.01 ? `rgba(255,255,255,${0.7 + 0.3 * lit})` : 'rgba(47,63,232,0.4)'
      ctx.beginPath(); ctx.arc(x, y, (9 + 19 * lit) * kk, 0, K.TAU); ctx.fill()
      if (lit <= 0.01) { ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.stroke() }
      ctx.restore()
    }
  }

  function drawMachine(ctx, t) {
    const lk = [0, 1, 2].map((i) => lockOf(i, t)), orb = BB.slotsOrbit(t)
    // order: middle, then the right reel, then the left (it folds down last, on top)
    const planes = [
      { i: 1, x: X0[1], pivot: RW / 2, yaw: 0 },
      { i: 2, x: X0[2], pivot: -GAP / 2, yaw: yawOf(1, t), back: markBack },
      { i: 0, x: X0[0], pivot: RW + GAP / 2, yaw: yawOf(-1, t), back: ltxBack },
    ]
    for (const p of planes) {
      const folded = Math.abs(p.yaw) > Math.PI / 2, map = BB.hinge(p.x, p.pivot, p.yaw, orb)
      const outline = BB.plane(ctx, null, null, p.x, Y0, RW, RH, map, { vy: CY, dry: true })
      const kk = Math.abs(outline[2][1] - outline[1][1]) / RH // the near edge's scale, for the corner radius
      // shadow first (an inset outline, so the round corners stay clean)
      ctx.save(); ctx.shadowColor = 'rgba(34,48,201,0.22)'; ctx.shadowBlur = 46; ctx.shadowOffsetY = 18; ctx.fillStyle = 'rgba(255,255,255,0.9)'
      const ocx = (outline[0][0] + outline[1][0]) / 2
      BB.poly(ctx, outline.map(([x, y]) => [K.lerp(x, ocx, 0.05), K.lerp(y, CY, 0.06)])); ctx.fill(); ctx.restore()
      // the lock glow, under the reel
      if (!folded && lk[p.i] > 0) {
        const gl = 0.45 + 0.55 * K.pulse(t, [STOP[p.i]], 0.5)
        ctx.save(); ctx.globalAlpha = gl * (1 - K.at(t, FOLD[0], 0.2)); ctx.shadowColor = 'rgba(74,91,255,1)'; ctx.shadowBlur = 60; ctx.strokeStyle = 'rgba(74,91,255,0.9)'; ctx.lineWidth = 8
        BB.rpoly(ctx, outline, 34 * kk); ctx.stroke(); ctx.restore()
      }
      BB.plane(ctx, reelFace(p.i, t), p.back ? p.back() : null, p.x, Y0, RW, RH, map, { vy: CY })
      // a quick light ring thrown off on the lock
      const d = t - STOP[p.i]
      if (!folded && d > 0 && d < 0.35) {
        const q = K.ease.out(d / 0.35), gw = 14 + 60 * q
        ctx.save(); ctx.strokeStyle = `rgba(74,91,255,${0.7 * (1 - q)})`; ctx.lineWidth = 5 * (1 - q) + 1
        BB.rpoly(ctx, BB.grow(outline, gw), 34 * kk + gw); ctx.stroke(); ctx.restore()
      }
      bulbs(ctx, p, outline, kk)
      if (!folded) { const xs = outline.map((q) => q[0]), ys = outline.map((q) => q[1]), bx = Math.min(...xs), by = Math.min(...ys); BB.sparks(ctx, t, STOP[p.i], bx, by, Math.max(...xs) - bx, Math.max(...ys) - by, 'slot' + p.i, { n: p.i === 2 ? 30 : 20 }) }
    }
    // the stack lands: a ring of light where each fold slaps down
    for (const f of FOLD) {
      const d = t - (f + E8)
      if (d > 0 && d < 0.3) { const q = d / 0.3; ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - q)})`; ctx.lineWidth = 4; const gw = 10 + 50 * K.ease.out(q); rr(ctx, X0[1] - gw, Y0 - gw, RW + gw * 2, RH + gw * 2, 34 + gw); ctx.stroke(); ctx.restore() }
    }
  }

  K.scene({
    id: 'slots', ...span('slots'),
    draw(ctx, s) {
      const t = s.t
      BB.slotsBack(ctx, t)
      // v3 · the kick gives the machine weight (it drops and swells); the snare jolts it (a quick roll and pinch)
      const cam = BB.slotsCam(t), kick = BB.pulse('kick', 0.3, 0.5), sn = BB.pulse('snare', 0.16, 0.3), side = window.SONG && SONG.count('snare', 0.3) % 2 ? 1 : -1
      const ks = cam.s * (1 + 0.045 * kick - 0.02 * sn)
      ctx.save(); ctx.translate(CX, CY + cam.dy + 18 * kick); ctx.rotate(side * 0.016 * sn); ctx.scale(ks, ks); ctx.translate(-CX, -CY)
      drawMachine(ctx, t)
      ctx.restore()
      BB.slotsText(ctx, t)
      // the tile we dove through: its rim rushing out past the frame, speed lines with it
      const d = t - S0
      if (d < 0.32) {
        const q = K.ease.out(d / 0.32), sc = 1.02 + q * 0.9
        ctx.save(); ctx.translate(CX, H / 2); ctx.scale(sc, sc)
        ctx.strokeStyle = `rgba(255,255,255,${0.95 * (1 - q)})`; ctx.lineWidth = 22 * (1 - q) + 2
        ctx.shadowColor = 'rgba(34,48,201,0.35)'; ctx.shadowBlur = 40
        rr(ctx, -W / 2, -H / 2, W, H, 60); ctx.stroke(); ctx.restore()
        streaks(ctx, t, CX, CY, 1 - q, 51, { color: 'rgba(47,63,232,0.28)', n: 70 })
      }
    },
  })
})()
