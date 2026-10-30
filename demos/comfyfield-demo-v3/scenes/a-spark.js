// Builder A — spark (0–2.4 s), and the one 3D world that spark and field (a-field.js) share.
// Dark, and the brand is already being made at frame 0: "ComfyField" stands beside the mark while a spark of light,
// mid-stroke, draws its three strokes — each one completing with a flare on the eighths 0.2 / 0.4 / 0.6; the blue
// square slams in at 0.8; the word is sucked into the mark, which charges at
// the centre; at 1.2 it BURSTS — tiles (the app's live clips) fly at the camera, a shock ring flips the dark to
// light mist, and the rest of the tiles rain down and land into a field on the eighths. The camera drops low over
// that field and the field scene takes the same camera on at 2.4 — one continuous move.
K.cue(0.2, 'spark: ink — the spark of light finishes the first stroke of the mark (it is mid-stroke at frame 0)', 'hit')
K.cue(0.4, 'spark: ink — second stroke', 'hit')
K.cue(0.6, 'spark: ink — third stroke', 'hit')
K.cue(0.8, 'spark: slam — the blue square punches in behind the strokes (ComfyField)', 'hit')
K.cue(1.0, 'spark: rise — the word is sucked into the mark, charging', 'soft')
K.cue(1.2, 'spark: boom — the mark bursts into tiles, the world flips to light', 'hit')
K.cue(1.4, 'spark: whoosh — tiles fly past the camera', 'hit')
K.cue(1.8, 'spark: land — tiles rain down into the field', 'hit')
K.cue(2.2, 'spark: land — the last tiles land', 'hit')

// ---------- v3: the song. SONG.now is the song time of the frame (warp.js); a scene's own s.t is still v2 time.
// Layers: kick, snare, bass, other (= the melody). Under B a melody note has a pitch; under A it has none, and the
// same code places it by a hash of its time instead (u), so both versions look designed.
const MUSIC = (() => {
  const on = () => typeof SONG !== 'undefined' && SONG && SONG.data
  const now = () => (on() ? SONG.now : 0)
  const pulse = (layer, dur, minS = 0) => (on() ? SONG.pulse(layer, dur, minS) : 0)
  const last = (layer, minS = 0) => (on() ? SONG.last(layer, minS) : null)
  const count = (layer, minS = 0, t) => (on() ? SONG.count(layer, minS, t ?? SONG.now) : 0)
  const hash = (x, k = 0) => (K.hash(Math.round(x * 1000) + ':' + k) % 10007) / 10007
  // the melody notes sounding in the last `dur` s: { h, age, p (pitch 0..1 or null), u (pitch, or a hash under A) }
  // under B the melody's own range: notes below MIDI 44 are the bass bleeding into the melody stem — never melody
  const isLow = (h) => h.p != null && h.p < 44
  const melRange = () => K.memo('a-melrange', () => { const ps = (SONG.data.layers.other || []).filter((h) => h.p != null && !isLow(h)).map((h) => h.p); return ps.length ? [Math.min(...ps), Math.max(...ps)] : [46, 72] })
  const pitchOf = (h) => { if (h.p == null) return null; const [lo, hi] = melRange(); return K.clamp((h.p - lo) / Math.max(1, hi - lo)) }
  function notes(dur, minS = 0.3) {
    if (!on()) return []
    const t = SONG.now
    return SONG.hits('other', t - dur, t + 1e-6, minS).filter((h) => !isLow(h)).map((h) => { const p = pitchOf(h); return { h, age: t - h.t, p, u: p != null ? p : hash(h.t, 7) } })
  }
  const bass = (dur = 0.6) => (on() && SONG.now >= 12.48 && SONG.now < 28.94 ? SONG.pulse('bass', dur, 0.3) : 0) // the bass plays from 12.48; after 28.94 only the melody
  return { on, now, pulse, last, count, hash, notes, bass, isLow, pitchOf }
})()

// ---------- a small 3D engine: a camera and cards (pictures in 3D), each drawn as a mesh of exact affine triangles
const CF = (() => {
  const NEAR = 0.05
  function cam(o) {
    const c = Object.assign({ x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, f: 1000, ox: 0, oy: 0 }, o)
    c.cY = Math.cos(c.yaw); c.sY = Math.sin(c.yaw); c.cP = Math.cos(c.pitch); c.sP = Math.sin(c.pitch); c.cR = Math.cos(c.roll); c.sR = Math.sin(c.roll)
    return c
  }
  // world (x right, y up, z ahead) → screen [x, y, depth]; null behind the near plane. pitch > 0 looks down.
  function proj(c, X, Y, Z) {
    const dx = X - c.x, dy = Y - c.y, dz = Z - c.z
    const x1 = dx * c.cY - dz * c.sY, z1 = dx * c.sY + dz * c.cY
    const zc = z1 * c.cP - dy * c.sP, yc = z1 * c.sP + dy * c.cP
    if (zc < NEAR) return null
    const sx = (c.f * x1) / zc, sy = (-c.f * yc) / zc
    return [W / 2 + sx * c.cR - sy * c.sR + c.ox, H / 2 + sx * c.sR + sy * c.cR + c.oy, zc]
  }
  // a card's two edge directions after rotating it: U along the picture's width, V down the picture.
  // At (0,0,0) the card faces the camera, upright. rx = π/2 lays it flat on the ground, its top edge away.
  function orient(rx, ry = 0, rz = 0) {
    const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz)
    let U = [cz, sz, 0], V = [sz, -cz, 0]
    U = [U[0], U[1] * cx - U[2] * sx, U[1] * sx + U[2] * cx]; V = [V[0], V[1] * cx - V[2] * sx, V[1] * sx + V[2] * cx]
    U = [U[0] * cy + U[2] * sy, U[1], -U[0] * sy + U[2] * cy]; V = [V[0] * cy + V[2] * sy, V[1], -V[0] * sy + V[2] * cy]
    return [U, V]
  }
  // one triangle of a picture: source points (image px) sa, sb, sc onto screen points da, db, dc. Each triangle is
  // grown by a hair so its neighbours overlap and no hairline seam shows.
  function tri(ctx, M, img, sa, sb, sc, da, db, dc) {
    const sx1 = sb[0] - sa[0], sy1 = sb[1] - sa[1], sx2 = sc[0] - sa[0], sy2 = sc[1] - sa[1]
    const det = sx1 * sy2 - sx2 * sy1
    if (Math.abs(det) < 1e-9) return
    const dx1 = db[0] - da[0], dy1 = db[1] - da[1], dx2 = dc[0] - da[0], dy2 = dc[1] - da[1]
    const a = (dx1 * sy2 - dx2 * sy1) / det, b = (dy1 * sy2 - dy2 * sy1) / det
    const c = (dx2 * sx1 - dx1 * sx2) / det, d = (dy2 * sx1 - dy1 * sx2) / det
    const e = da[0] - a * sa[0] - c * sa[1], f = da[1] - b * sa[0] - d * sa[1]
    const mx = (da[0] + db[0] + dc[0]) / 3, my = (da[1] + db[1] + dc[1]) / 3
    const grow = (p) => { const gx = p[0] - mx, gy = p[1] - my, L = Math.hypot(gx, gy) || 1; return [p[0] + (gx / L) * 0.9, p[1] + (gy / L) * 0.9] }
    const A = grow(da), Bq = grow(db), Cq = grow(dc)
    ctx.save()
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(Bq[0], Bq[1]); ctx.lineTo(Cq[0], Cq[1]); ctx.closePath(); ctx.clip()
    ctx.setTransform(M.a * a + M.c * b, M.b * a + M.d * b, M.a * c + M.c * d, M.b * c + M.d * d, M.a * e + M.c * f + M.e, M.b * e + M.d * f + M.f)
    ctx.drawImage(img, 0, 0)
    ctx.restore()
  }
  // a card: centre C, edge directions U, V, size w × h (world units). o.src = [sx, sy, sw, sh] crop of the image;
  // o.mirrorV / o.mirrorU for a back face; o.fog, o.flash (0..1), o.tint [css, a], o.alpha, o.edge (border alpha),
  // o.edgeColor, o.edgeW. Returns the projected corners (or null when it is off screen / behind the camera).
  function card(ctx, c, img, C, U, V, w, h, o = {}) {
    const pt = (u, v) => {
      if (o.mirrorU) u = 1 - u
      if (o.mirrorV) v = 1 - v
      const a = (u - 0.5) * w, b = (v - 0.5) * h
      return proj(c, C[0] + a * U[0] + b * V[0], C[1] + a * U[1] + b * V[1], C[2] + a * U[2] + b * V[2])
    }
    const P = [pt(0, 0), pt(1, 0), pt(1, 1), pt(0, 1)]
    const vis = P.filter(Boolean)
    if (!vis.length) return null
    const xs = vis.map((p) => p[0]), ys = vis.map((p) => p[1])
    if (Math.max(...xs) < -40 || Math.min(...xs) > W + 40 || Math.max(...ys) < -40 || Math.min(...ys) > H + 40) return null
    const all = vis.length === 4
    if (all) { // too small to matter
      const area = Math.abs((P[2][0] - P[0][0]) * (P[3][1] - P[1][1]) - (P[3][0] - P[1][0]) * (P[2][1] - P[0][1])) / 2
      if (area < 3) return null
    }
    const alpha = o.alpha ?? 1
    if (alpha <= 0.003) return all ? P : null
    const zs = vis.map((p) => p[2]), ratio = Math.max(...zs) / Math.min(...zs)
    let n = !all ? 8 : ratio < 1.025 ? 1 : ratio < 1.1 ? 2 : ratio < 1.3 ? 3 : ratio < 1.8 ? 4 : 6
    if (o.maxN) n = Math.min(n, o.maxN)
    ctx.save()
    ctx.globalAlpha *= alpha
    if (img && img.width) {
      const s = o.src || [0, 0, img.width, img.height]
      const G = []
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) G.push(i === 0 && j === 0 ? P[0] : i === n && j === 0 ? P[1] : i === n && j === n ? P[2] : i === 0 && j === n ? P[3] : pt(i / n, j / n))
      const M = ctx.getTransform()
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const a = G[j * (n + 1) + i], b = G[j * (n + 1) + i + 1], cc = G[(j + 1) * (n + 1) + i], d = G[(j + 1) * (n + 1) + i + 1]
        if (!a || !b || !cc || !d) continue
        const u0 = s[0] + (s[2] * i) / n, u1 = s[0] + (s[2] * (i + 1)) / n, v0 = s[1] + (s[3] * j) / n, v1 = s[1] + (s[3] * (j + 1)) / n
        tri(ctx, M, img, [u0, v0], [u1, v0], [u0, v1], a, b, cc)
        tri(ctx, M, img, [u1, v1], [u0, v1], [u1, v0], d, cc, b)
      }
    } else if (o.fill) { if (all) { ctx.fillStyle = o.fill; K.pathOf(ctx, P); ctx.fill() } }
    if (all) {
      const over = (css, a) => { if (a <= 0.004) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = css; K.pathOf(ctx, P); ctx.fill(); ctx.restore() }
      if (o.tint) over(o.tint[0], o.tint[1])
      if (o.flash) over('#ffffff', o.flash)
      if (o.fog) over(o.fogColor || 'rgb(231,235,255)', o.fog)
      const ea = o.edge ?? 0
      if (ea > 0.01) { ctx.save(); ctx.globalAlpha *= ea; ctx.strokeStyle = o.edgeColor || '#ffffff'; ctx.lineWidth = o.edgeW || 1.5; ctx.lineJoin = 'round'; K.pathOf(ctx, P); ctx.stroke(); ctx.restore() }
    }
    ctx.restore()
    return all ? P : null
  }
  return { cam, proj, orient, card, NEAR }
})()

// ---------- the world: a field of live tiles on the ground (y = 0), the burst that builds it, the camera over it
const WORLD = (() => {
  const S = 1, D = 0.5625, GAP = 0.15, PX = S + GAP, PZ = D + GAP, Z0 = 3.4
  const COLS = 12, ROWS = 62
  const BURST = [0, 2.5, 5] // where the mark bursts (the camera looks straight at it from (0, 2.5, 0))
  const T_BOOM = 1.2
  const OFFS = [0, 1.7, 3.4] // three play offsets, so a frame needs at most 72 pictures
  const r = K.rng('cf-world-v2')
  const pick = (avoid) => { let id; do id = TILES[Math.floor(r() * TILES.length)]; while (avoid.includes(id)); return id }
  const tiles = [], at = new Map()
  for (let j = 0; j < ROWS; j++) for (let i = -COLS; i <= COLS; i++) {
    const left = at.get(i - 1 + ',' + j), back = at.get(i + ',' + (j - 1))
    const a = pick([left?.a, back?.a].filter(Boolean))
    const tl = { i, j, x: i * PX, z: Z0 + j * PZ, a, b: pick([a, left?.b, back?.b].filter(Boolean)), off: OFFS[Math.floor(r() * 3)], flips: [], kind: 'ripple' }
    tl.d = Math.hypot(tl.x - BURST[0], tl.z - BURST[2])
    tl.ta = 1.3 + 0.042 * tl.d // the field ripples in from under the burst
    tiles.push(tl); at.set(i + ',' + j, tl)
  }
  const tileAt = (i, j) => at.get(i + ',' + j)
  // each tile's back: a clip none of its four neighbours shows on either face (flips mix the faces)
  for (const tl of tiles) {
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([di, dj]) => at.get(tl.i + di + ',' + (tl.j + dj))).filter(Boolean)
    const avoid = [tl.a]; for (const n of nb) avoid.push(n.a, n.b)
    if (avoid.slice(1).includes(tl.b) || tl.b === tl.a) tl.b = pick(avoid.filter(Boolean))
  }

  // landers: tiles that fly out of the burst and land in their slot of the field on an eighth
  const LAND = [1.6, 1.8, 2.0, 2.2]
  {
    const cand = tiles.filter((tl) => Math.abs(tl.i) <= 6 && tl.z > 5.6 && tl.z < 12.5)
    cand.forEach((tl) => {
      if (r() > 0.55) return
      tl.kind = 'lander'
      // nearer the camera land later, so the last ones slam down right in front of it
      const k = K.clamp(Math.floor((12.5 - tl.z) / 1.9 + r() * 1.3), 0, 3)
      tl.T = LAND[k]
      const s0 = [BURST[0] + (r() - 0.5) * 0.5, BURST[1] + (r() - 0.5) * 0.5, BURST[2] + (r() - 0.5) * 0.3]
      tl.delay = r() * 0.1; tl.g = 5 + 19 * r() // each its own arc: some skim low, some go high out of frame
      const T = tl.T - T_BOOM - tl.delay
      tl.s0 = s0; tl.v0 = [(tl.x - s0[0]) / T, (0 - s0[1] + 0.5 * tl.g * T * T) / T, (tl.z - s0[2]) / T]
      const sp = () => (r() < 0.5 ? -1 : 1) * (Math.PI * (1 + Math.floor(r() * 3)))
      tl.spin = [sp(), sp() * 0.5, sp() * 0.5]
    })
  }
  // flyers: tiles that shoot straight at the camera and past it
  const flyers = []
  for (let k = 0; k < 34; k++) {
    const hero = k < 3
    const phi = r() * K.TAU, L = hero ? 0.25 + r() * 0.35 : 1.5 + 8 * r()
    flyers.push({
      id: TILES[(k * 7 + 3) % TILES.length], off: OFFS[k % 3],
      v: [Math.cos(phi) * L, Math.sin(phi) * L * 0.75, -(hero ? 9 + 3 * k : 8 + 10 * r())],
      w: [(r() - 0.5) * (hero ? 3 : 14), (r() - 0.5) * (hero ? 3 : 14), (r() - 0.5) * 8],
      delay: hero ? 0.02 + 0.05 * k : r() * 0.08, sc: hero ? 1.1 : 0.7 + r() * 0.5,
    })
  }

  // ---------- the camera
  // (v3: the camera no longer bobs on v2's beats; it answers the song's kicks in camAt)
  const START = { x: 0, y: 2.5, z: 0, yaw: 0, pitch: 0, roll: 0 }
  // the field flight (2.4 →): low, fast, accelerating, swaying on a long S with a bank into the turn
  function fly(t) {
    const u = t - 2.4, A = 1.1, w = 1.35
    const vz = 5 + 1.3 * u, vx = A * w * Math.sin(w * u), ax = A * w * w * Math.cos(w * u)
    return {
      x: A * (1 - Math.cos(w * u)), y: 1.0, z: 3 + 5 * u + 0.65 * u * u,
      yaw: Math.atan2(vx, vz) * 0.85, pitch: 0.2, roll: -0.05 * ax, vz,
    }
  }
  // the dive: the camera pulls up, pitches down over one tile and drops onto it until it fills the frame at 6.0
  const DIVE0 = 5.4, DIVE1 = 6.0
  const target = (() => {
    const c = fly(DIVE0)
    let best = null
    for (const tl of tiles) { const d = Math.hypot(tl.x - c.x, tl.z - (c.z + 4.2)); if (!best || d < best.d) best = { tl, d } }
    best.tl.kind = 'target'
    return best.tl
  })()
  const HF = 1000 / W // camera height at which a tile exactly fills the frame
  // forward over the target (fast, then settling), up to 2.6 and over the top (5.4–5.67), then a drop whose zoom
  // runs at a steady, quickening rate (height falls geometrically) until the tile is the frame at 6.0
  const TOP = 2.6, PK = 0.45
  function dive(t) {
    const f0 = fly(DIVE0)
    const p = K.clamp((t - DIVE0) / (DIVE1 - DIVE0))
    const ez = 1 - Math.pow(1 - p, 3)
    const x = K.lerp(f0.x, target.x, ez), z = K.lerp(f0.z, target.z, ez)
    const y = p < PK ? K.lerp(f0.y, TOP, K.ease.inOut(p / PK)) : TOP * Math.pow(HF / TOP, Math.pow((p - PK) / (1 - PK), 1.45))
    const pitch = Math.atan2(y - 0.0, Math.max(1e-5, target.z - z))
    const e = K.ease.inOut(p)
    return { x, y, z, yaw: f0.yaw * (1 - e), pitch, roll: K.lerp(f0.roll, 0, e) - 0.55 * 6.75 * e * (1 - e) * (1 - e) }
  }
  const mix = (a, b, w) => { const o = {}; for (const k of ['x', 'y', 'z', 'yaw', 'pitch', 'roll']) o[k] = K.lerp(a[k], b[k], w); return o }
  function camAt(t, music = true) {
    let c
    if (t <= T_BOOM) c = Object.assign({}, START)
    else if (t < 2.4) {
      // from the burst to the flight: Hermite on z (rest → the flight's speed), eased height and pitch, a recoil
      const tau = (t - T_BOOM) / 1.2, f = fly(2.4)
      const z = (-2 * tau ** 3 + 3 * tau * tau) * f.z + (tau ** 3 - tau * tau) * f.vz * 1.2
      const kick = (t - T_BOOM) / 0.09, recoil = 0.55 * kick * Math.exp(1 - kick)
      const e = K.ease.inOut(tau)
      c = { x: 0, y: K.lerp(START.y, f.y, e), z: z - recoil, yaw: 0, pitch: K.lerp(0, f.pitch, e), roll: 0 }
    } else if (t < DIVE0) c = fly(t)
    else c = mix(fly(t), dive(t), K.ease.inOut(K.clamp((t - DIVE0) / 0.12)))
    // a camera shake on the burst
    const sh = t > T_BOOM ? 22 * Math.exp(-(t - T_BOOM) * 9) : 0
    c.ox = sh * K.noise1(t * 40, 7); c.oy = sh * K.noise1(t * 40, 9)
    // v3: the camera plays the drums — a dip and a bank on each kick (left, right, in turn), a jolt on each snare;
    // faded out through the dive so the tile still lands exactly on the frame
    if (music && t > T_BOOM && MUSIC.on()) {
      const fade = 1 - K.clamp((t - DIVE0 - 0.1) / 0.3)
      const k = MUSIC.pulse('kick', 0.34, 0.4) * fade, side = MUSIC.count('kick', 0.4) % 2 ? 1 : -1
      c.y -= 0.09 * k; c.pitch += 0.035 * k; c.roll += 0.05 * k * side
      const sn = MUSIC.pulse('snare', 0.14, 0.4) * fade
      c.ox += 16 * sn * K.noise1(t * 70, 3); c.oy += 16 * sn * K.noise1(t * 70, 5); c.roll += 0.02 * sn * (MUSIC.count('snare', 0.4) % 2 ? 1 : -1)
    }
    return CF.cam(c)
  }

  // ---------- flips: waves of tiles flip over (the far edge rises toward the camera and over), each on an eighth
  const reserved = new Set() // tiles a label sits on (they do not flip)
  // riders: a tile lifts out of the field, tilts up to the viewer and rides along with the camera while its name
  // shows, then drops back and rushes home to its slot
  const riders = new Map()
  // where a rider sits relative to the camera is fixed when it lifts (across, ahead in the camera's heading), so
  // it holds still on screen while the field streams under it
  const rel = (R, t) => { const c = fly(t), cy = Math.cos(c.yaw), sy = Math.sin(c.yaw); return [c.x + R.lat * cy + R.ahead * sy, c.z - R.lat * sy + R.ahead * cy, c.yaw] }
  function ride(tl, T, Tout) {
    const c = fly(T), cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), dx = tl.x - c.x, dz = tl.z - c.z
    riders.set(tl, { T, Tout, lat: dx * cy - dz * sy, ahead: dx * sy + dz * cy }); reserved.add(tl)
  }
  function riderPose(tl, R, t) {
    const k = (1 - Math.exp(-(Math.min(t, R.Tout) - R.T) / 0.1)) * (1 - K.ease.inOut(K.clamp((t - R.Tout) / 0.45)))
    const q = rel(R, Math.min(t, R.Tout))
    const lv = K.spring(t - R.T, 2.6, 0.55) * (1 - K.spring(t - R.Tout, 2.6, 0.75))
    return { C: [K.lerp(tl.x, q[0], k), 0.36 * lv + 0.003, K.lerp(tl.z, q[1], k)], rx: Math.PI / 2 - 0.85 * lv, ry: q[2] * k, sc: 1 + 0.12 * lv, lv }
  }
  let flipsReady = false
  function addFlips() {
    if (flipsReady) return
    flipsReady = true
    // a wave front sweeping forward from the camera, every other tile (checkerboard)
    const sweep = (T0, speed, parity, depth = 16) => {
      const c = fly(T0)
      for (const tl of tiles) {
        const ahead = tl.z - c.z
        if (ahead < 0.5 || ahead > depth || (tl.i + tl.j + 64) % 2 !== parity) continue
        tl.flips.push(T0 + ahead / speed)
      }
    }
    // a ring from a point on the field
    const ring = (T0, cx, cz, speed, R) => {
      for (const tl of tiles) { const d = Math.hypot(tl.x - cx, tl.z - cz); if (d < R) tl.flips.push(T0 + d / speed) }
    }
    // a diagonal sweep across the field
    const diag = (T0, speed, depth = 14) => {
      const c = fly(T0)
      for (const tl of tiles) { const ahead = tl.z - c.z; if (ahead < 0.5 || ahead > depth) continue; if ((tl.j + 64) % 3 === 0) continue; tl.flips.push(T0 + (tl.x - c.x + 9 + ahead * 0.5) / speed) }
    }
    sweep(2.6, 26, 0)
    { const c = fly(3.0); ring(3.0, c.x, c.z + 9, 16, 9) }
    { const c = fly(3.6); ring(3.6, c.x - 2, c.z + 8, 16, 8) }
    diag(4.2, 32)
    sweep(4.8, 30, 1)
    for (const tl of tiles) {
      if (reserved.has(tl) || tl === target) tl.flips = []
      tl.flips.sort((a, b) => a - b)
    }
    target.flips = [DIVE0]
  }
  const flipAngle = (tl, t) => { let th = 0; for (const T of tl.flips) { if (t < T) break; th += Math.PI * K.spring(t - T, 2.6, 0.6) } return th }

  // ---------- the sky: mist, and a haze along the horizon so the field fades into it
  function horizon(c) {
    const L = 6000, M = 4000
    const a = CF.proj(c, c.x + L * c.sY - M * c.cY, c.y, c.z + L * c.cY + M * c.sY)
    const b = CF.proj(c, c.x + L * c.sY + M * c.cY, c.y, c.z + L * c.cY - M * c.sY)
    return a && b ? [a, b] : null
  }
  function haze(ctx, c, amt = 1) {
    const hz = horizon(c)
    if (!hz || amt <= 0.01) return
    const [a, b] = hz, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
    let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L
    if (ny < 0) { nx = -nx; ny = -ny } // pointing toward the ground (down the screen)
    const g = ctx.createLinearGradient(mx - nx * 260, my - ny * 260, mx + nx * 380, my + ny * 380)
    g.addColorStop(0, 'rgba(234,238,255,0)'); g.addColorStop(0.38, 'rgba(234,238,255,0.97)'); g.addColorStop(0.5, 'rgba(234,238,255,0.9)'); g.addColorStop(1, 'rgba(234,238,255,0)')
    ctx.save(); ctx.globalAlpha *= amt; ctx.fillStyle = g; ctx.fillRect(-50, -50, W + 100, H + 100); ctx.restore()
  }
  function sky(ctx) {
    mist(ctx, { glows: [[W * 0.5, H * 0.18, 1000, 'rgba(74,91,255,0.22)'], [W * 0.12, H * 0.9, 700, 'rgba(139,92,246,0.10)'], [W * 0.92, H * 0.75, 600, 'rgba(74,91,255,0.10)']] })
  }

  // ---------- the portal: the tile we dive into shows the next scene (slots) at its first frame, so the cut at 6.0
  // lands on exactly the picture the tile has grown into
  let portalC = null, inPortal = false
  function portal() {
    if (!portalC) { portalC = document.createElement('canvas'); portalC.width = W; portalC.height = H }
    const g = portalC.getContext('2d')
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'
    g.fillStyle = K.film.paper; g.fillRect(0, 0, W, H)
    const sc = K.film.scenes.find((x) => x.id === 'slots')
    if (sc && !inPortal) {
      inPortal = true
      g.save()
      try { sc.draw(g, { t: sc.start, lt: 0, dur: sc.end - sc.start, p: 0, W, H, id: sc.id }) } catch (e) { console.warn('portal: slots draw failed', e.message); mist(g) }
      g.restore()
      inPortal = false
    } else mist(g)
    return portalC
  }

  // ---------- one frame of the world (t ≥ 1.2)
  function draw(ctx, t, o = {}) {
    addFlips()
    const c = camAt(t)
    const flat = [], up = [], shadows = [], rings = []
    const fogOf = (zc) => K.clamp((zc - 6.5) / 8.5)
    // v3: the song in the field. Each melody note sends a ring of tiles hopping up toward the camera from a point on
    // the field ahead — under B the point's depth is the pitch (high notes far, low notes near), so the field draws the
    // tune; under A a hash of the note's time places it. The kick pumps every tile; the snare snaps their edges white.
    const kick = MUSIC.pulse('kick', 0.3, 0.4), snare = MUSIC.pulse('snare', 0.16, 0.4)
    const ripples = MUSIC.notes(0.55).map((n) => {
      const v = SONG.v2At(n.h.t)
      if (v < T_BOOM + 0.15) return null
      if (v > DIVE0) return { x: target.x, z: target.z, age: n.age, R: 2.2 + 2.2 * n.h.s, s: n.h.s }
      const cb = camAt(Math.min(v, DIVE0), false), ahead = n.p != null ? K.lerp(5, 8.5, n.p) : 5 + 3.5 * MUSIC.hash(n.h.t, 1), across = (MUSIC.hash(n.h.t, 2) - 0.5) * 2.6
      return { x: cb.x + across * cb.cY + ahead * cb.sY, z: cb.z - across * cb.sY + ahead * cb.cY, age: n.age, R: 2.4 + 1.8 * n.h.s, s: n.h.s }
    }).filter(Boolean)
    // the field
    for (const tl of tiles) {
      // cheap reject: far behind or far ahead of the camera / outside the fog
      const ahead = (tl.z - c.z) * c.cY + (tl.x - c.x) * c.sY
      if (ahead < -1.5 || ahead > 17) continue
      let C, U, V, w = S, h = D, img, ov = {}, isUp = false, lit = 0
      if (tl.kind === 'lander' && t < tl.T) {
        const tau = Math.max(0, t - T_BOOM - tl.delay), e = K.clamp(tau / (tl.T - T_BOOM - tl.delay)), dec = (1 - e) * (1 - e)
        C = [tl.s0[0] + tl.v0[0] * tau, tl.s0[1] + tl.v0[1] * tau - 0.5 * tl.g * tau * tau, tl.s0[2] + tl.v0[2] * tau]
        C[1] = Math.max(C[1], 0.01);
        [U, V] = CF.orient(Math.PI / 2 + tl.spin[0] * dec, tl.spin[1] * dec, tl.spin[2] * dec)
        const grow = K.clamp(tau / 0.12); w = S * (0.3 + 0.7 * grow); h = D * (0.3 + 0.7 * grow)
        img = clip[tl.a].at(t + tl.off, true); isUp = true
        shadows.push({ x: C[0], z: C[2], hgt: C[1], w })
      } else if (riders.has(tl) && t >= riders.get(tl).T && t < riders.get(tl).Tout + 0.6) {
        const R = riders.get(tl), q = riderPose(tl, R, t)
        ;[U, V] = CF.orient(q.rx, q.ry, 0)
        C = q.C; w = S * q.sc; h = D * q.sc; isUp = true
        img = clip[tl.a].at(t + tl.off, true)
        ov.edge = 1; ov.edgeW = 2.5; ov.flash = 0.5 * K.pulse(t, [R.T], 0.3)
        shadows.push({ x: C[0], z: C[2], hgt: C[1] * 4, w })
      } else {
        // appear: ripple tiles drop in and flatten; landers squash on impact
        let sc = 1, lift = 0, tilt = 0
        if (tl.kind === 'lander') {
          const d = t - tl.T; sc = 1 + 0.12 * Math.exp(-d * 9) * Math.cos(d * 30); ov.flash = 0.75 * Math.exp(-d * 10)
          if (d < 0.35) rings.push({ tl, p: d / 0.35 })
        } else {
          if (t < tl.ta) continue
          const p = K.spring(t - tl.ta, 2.4, 0.55)
          sc = Math.max(0.001, p); lift = (1 - K.clamp(p)) * 0.5; tilt = (1 - K.clamp(p)) * 0.9
          if (t - tl.ta < 0.25) ov.flash = 0.5 * (1 - (t - tl.ta) / 0.25)
        }
        // flips
        const th = tl.flips.length ? flipAngle(tl, t) : 0
        const face = Math.floor((th + Math.PI / 2) / Math.PI) % 2
        // a melody note's ring passing under this tile: it hops up and tips toward the camera
        let hop = 0
        // and as the wavefront reaches it, it lights white for ~3 frames (edges and face) — readable through the blur
        if (tl !== target) for (const R of ripples) { const d = Math.hypot(tl.x - R.x, tl.z - R.z); if (d > R.R) continue; const a = R.age - d / 14; if (a > 0 && a < 0.32) hop = Math.max(hop, R.s * Math.sin((Math.PI * a) / 0.32) * Math.sqrt(1 - d / R.R)); if (a > -0.015 && a < 0.17) lit = Math.max(lit, Math.min(1, R.s * 1.2) * (1 - Math.max(0, a) / 0.17)) }
        const rx = Math.PI / 2 - th - tilt - 1.0 * hop
        ;[U, V] = CF.orient(rx, 0, 0)
        const sn = Math.abs(Math.sin(th))
        C = [tl.x, lift + 0.4 * hop + (D / 2) * sn * sc + 0.002, tl.z]
        const pump = tl === target ? 1 : 1 + 0.07 * kick
        w = S * sc * pump; h = D * sc * pump
        if (sn > 0.02 || lift > 0.01 || hop > 0.02) isUp = true
        const id = face ? tl.b : tl.a
        img = tl === target && face ? portal() : clip[id].at(t + tl.off, true)
        if (face) ov.mirrorV = true
        ov.flash = Math.max(ov.flash || 0, 0.45 * sn * sn, 0.75 * hop)
        // the dive: the field round the target bends up into a bowl — a sinkhole of live tiles, each tilted to the
        // bowl's slope — so the camera falls down a funnel onto the one tile it chose
        if (t > DIVE0 && tl !== target) {
          const dx = tl.x - target.x, dz = tl.z - target.z, dd = Math.hypot(dx, dz)
          const b = dd < 6 ? K.spring(t - (DIVE0 + 0.03 + dd * 0.035), 2.0, 0.72) : 0
          if (b > 0.001) {
            const kb = 0.17 * b, ph = Math.atan(2 * kb * dd)
            const k = [-dz / dd, 0, dx / dd], cs = Math.cos(ph), sn2 = Math.sin(ph)
            const rot = (v) => { const kv = k[0] * v[0] + k[2] * v[2], cr = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]]; return [0, 1, 2].map((i) => v[i] * cs + cr[i] * sn2 + k[i] * kv * (1 - cs)) }
            U = rot(U); V = rot(V)
            C = [C[0], C[1] + kb * dd * dd, C[2]]
            ov.flash = Math.max(ov.flash || 0, 0.18 * K.clamp(b) * K.clamp(1 - dd / 6))
            isUp = true
          }
        }
        if (tl === target && t > DIVE0) { ov.edge = 1; ov.edgeW = 3; ov.flash = Math.max(0, ov.flash - 0.45 * K.at(t, DIVE0 + 0.15, 0.2)) }
      }
      const pc = CF.proj(c, C[0], C[1], C[2])
      if (!pc) continue
      ov.fog = fogOf(pc[2])
      if (ov.fog > 0.985) continue
      ov.edge = ov.edge ?? 0.85 * (1 - ov.fog)
      if (lit > 0.01) { ov.flash = Math.max(ov.flash || 0, 0.95 * lit); ov.edge = 1; ov.edgeW = 1.5 + 5 * lit; ov.fog *= 1 - 0.7 * lit }
      if (snare > 0.01 && tl !== target) { ov.edge = Math.min(1, ov.edge + snare); ov.edgeW = (ov.edgeW || 1.5) + 3.5 * snare; ov.flash = Math.max(ov.flash || 0, 0.4 * snare) }
      ;(isUp ? up : flat).push({ img, C, U, V, w, h, ov, zc: pc[2], tl })
    }
    // the flyers
    for (const f of o.flyers === false ? [] : flyers) {
      const tau = t - T_BOOM - f.delay
      if (tau <= 0 || tau > 1.2) continue
      const g = 0.3 * (1 - Math.exp(-tau / 0.07)) + 0.75 * tau // a blast: very fast out of the mark, then coasting
      const C = [BURST[0] + f.v[0] * g, BURST[1] + f.v[1] * g, BURST[2] + f.v[2] * g]
      const [U, V] = CF.orient(f.w[0] * g, f.w[1] * g, f.w[2] * g)
      const pc = CF.proj(c, C[0], C[1], C[2])
      if (!pc) continue
      const grow = K.clamp(tau / 0.08), near = K.clamp((pc[2] - 0.2) / 0.35)
      up.push({ img: clip[f.id].at(t + f.off, true), C, U, V, w: S * f.sc * (0.25 + 0.75 * grow), h: D * f.sc * (0.25 + 0.75 * grow), ov: { alpha: near, edge: 0.9, maxN: near < 1 ? 2 : 6 }, zc: pc[2] })
    }
    flat.sort((a, b) => b.zc - a.zc)
    up.sort((a, b) => b.zc - a.zc)
    const out = { cam: c, cards: new Map() }
    const drawList = (list) => { for (const q of list) { const P = CF.card(ctx, c, q.img, q.C, q.U, q.V, q.w, q.h, q.ov); if (q.tl && P) out.cards.set(q.tl, P) } }
    drawList(flat)
    // landing rings: a white outline that spreads out from a tile as it lands
    for (const R of rings) {
      const k = 1 + 0.7 * K.ease.out(R.p), hw = (S / 2) * k, hd = (D / 2) * k, tl = R.tl
      const P = [[tl.x - hw, tl.z + hd], [tl.x + hw, tl.z + hd], [tl.x + hw, tl.z - hd], [tl.x - hw, tl.z - hd]].map(([x, z]) => CF.proj(c, x, 0.01, z))
      if (P.some((p) => !p)) continue
      ctx.save(); ctx.globalAlpha = 0.85 * (1 - R.p); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * (1 - R.p) + 1; ctx.lineJoin = 'round'; K.pathOf(ctx, P); ctx.stroke(); ctx.restore()
    }
    // the far field fades into the haze; nearer things are drawn over it
    haze(ctx, c, o.haze ?? 1)
    // shadows of the tiles in flight, on the ground under them
    for (const s of shadows) {
      const p = CF.proj(c, s.x, 0, s.z)
      if (!p) continue
      const rx = (c.f * s.w * 0.6) / p[2], a = 0.22 * K.clamp(1 - s.hgt / 3)
      if (a < 0.01) continue
      ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(1, 0.32)
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(20,26,90,${a})`); g.addColorStop(1, 'rgba(20,26,90,0)')
      ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore()
    }
    drawList(up)
    // v3: each melody note's wave (drawn over the tiles it lifts) — a ring of light spreading over the field from where the note struck (under B:
    // near for low notes, far for high), the tiles hopping as it passes
    for (const R of ripples) {
      const rad = 0.15 + Math.min(R.R + 0.6, R.age * 14), a = R.s * Math.pow(1 - R.age / 0.55, 1.1)
      if (a <= 0.02 || rad < 0.05) continue
      ctx.save(); ctx.lineJoin = 'round'
      ctx.beginPath(); let pen = false
      for (let k = 0; k <= 56; k++) { const q = CF.proj(c, R.x + Math.cos((k / 56) * K.TAU) * rad, 0.14, R.z + Math.sin((k / 56) * K.TAU) * rad); if (!q) { pen = false; continue } if (pen) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); pen = true }
      ctx.strokeStyle = `rgba(255,255,255,${0.75 * a})`; ctx.lineWidth = 16; ctx.stroke()
      ctx.strokeStyle = `rgba(47,63,232,${a})`; ctx.lineWidth = 5; ctx.stroke()
      ctx.restore()
    }
    return out
  }

  return { draw, camAt, fly, tiles, tileAt, target, reserved, ride, riders, portal, S, D, BURST, T_BOOM, DIVE0, DIVE1, sky, haze, flipAngle }
})()

// ---------- the spark: the mark drawn in light, the name, the charge and the burst
const SPARK = (() => {
  const MS = 230, NS = 150, NAME = 'ComfyField', GAPX = 46
  const bez = (p0, p1, p2, p3, n) => { const out = []; for (let k = 0; k <= n; k++) { const s = k / n, m = 1 - s; out.push([0, 1].map((i) => m * m * m * p0[i] + 3 * m * m * s * p1[i] + 3 * m * s * s * p2[i] + s * s * s * p3[i])) } return out }
  // the logo's three strokes as polylines in its 32-unit box (assets/logo.svg)
  const ST = [bez([9, 21], [9, 15], [13, 11], [18, 11], 26).concat(bez([18, 11], [20, 11], [22, 11.6], [23, 12.6], 8).slice(1)), [[23, 11], [23, 21]], [[16, 16], [23, 16]]]
  const STL = ST.map((pl) => { const c = [0]; for (let i = 1; i < pl.length; i++) c.push(c[i - 1] + Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1])); return c })
  const STT = [[-0.16, 0.36], [0.27, 0.13], [0.49, 0.11]] // each stroke: start, how long the light takes — each ENDS on its eighth
  const ease = (f) => 0.6 * f + 0.4 * f * f * f // steady, quickening into the hit
  const prog = (k, t) => ease(K.clamp((t - STT[k][0]) / STT[k][1]))
  function partial(k, f) { // the drawn part of stroke k (f 0..1) and its tip
    const pl = ST[k], cl = STL[k], want = cl[cl.length - 1] * f, out = [pl[0]]
    for (let i = 1; i < pl.length; i++) {
      if (cl[i] >= want) { const a = (want - cl[i - 1]) / (cl[i] - cl[i - 1] || 1); const p = [K.lerp(pl[i - 1][0], pl[i][0], a), K.lerp(pl[i - 1][1], pl[i][1], a)]; out.push(p); return { pts: out, tip: p } }
      out.push(pl[i])
    }
    return { pts: out, tip: pl[pl.length - 1] }
  }
  let L = null
  function layout(ctx) {
    if (L) return L
    ctx.save(); ctx.font = `800 ${NS}px "Inter", sans-serif`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.035 * NS + 'px'
    const tw = ctx.measureText(NAME).width
    const xs = []; for (let i = 0; i <= NAME.length; i++) xs.push(ctx.measureText(NAME.slice(0, i)).width)
    ctx.restore()
    const x0 = (W - (MS + GAPX + tw)) / 2
    L = { x0, tw, xs, mx: x0 + MS / 2, my: H / 2, tx: x0 + MS + GAPX, ty: H / 2 + NS * 0.36 }
    return L
  }
  // where the mark is (its centre) and how big, before the burst
  function markPose(t) {
    const go = K.ease.inOut(K.clamp((t - 1.04) / 0.13))
    const punch = t >= 0.8 ? 0.07 * Math.exp(-(t - 0.8) * 7) * Math.cos((t - 0.8) * 26) : 0
    const charge = 1 - 0.2 * K.ease.in(K.clamp((t - 1.02) / 0.16))
    const shake = t > 1.08 ? 5 * K.clamp((t - 1.08) / 0.1) : 0
    const kick = 0.07 * MUSIC.pulse('kick', 0.28, 0.4) // v3: the mark thumps on each kick
    return { x: K.lerp(L.mx, W / 2, go) + shake * K.noise1(t * 90, 3), y: L.my + shake * K.noise1(t * 90, 5), s: MS * (1 + punch + kick) * charge * (1 + 0.04 * K.ease.inOut(K.clamp((t - 0.8) / 0.4))) }
  }
  const toScr = (P, p) => [P.x + (p[0] / 32 - 0.5) * P.s, P.y + (p[1] / 32 - 0.5) * P.s]
  // the spark: a comet arriving at the first stroke on 0.2, then the tip of each stroke as it draws
  function sparkAt(t, P) {
    for (let k = 2; k >= 0; k--) if (t >= STT[k][0]) {
      const f = K.clamp((t - STT[k][0]) / STT[k][1])
      if (f < 1) return toScr(P, partial(k, ease(f)).tip)
      // between strokes, the light jumps to the next stroke's start
      if (k < 2 && t < STT[k + 1][0]) { const a = K.ease.inOut(K.clamp((t - STT[k][0] - STT[k][1]) / (STT[k + 1][0] - STT[k][0] - STT[k][1]))); const e = toScr(P, ST[k][ST[k].length - 1]), s = toScr(P, ST[k + 1][0]); return [K.lerp(e[0], s[0], a), K.lerp(e[1], s[1], a)] }
      return k === 2 && t < STT[2][0] + STT[2][1] + 0.12 ? toScr(P, ST[2][ST[2].length - 1]) : null
    }
    return null
  }
  function glowDot(ctx, x, y, r, a, core = '#ffffff') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(190,205,255,${0.9 * a})`); g.addColorStop(0.25, `rgba(110,130,255,${0.45 * a})`); g.addColorStop(1, 'rgba(60,80,255,0)')
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2)
    ctx.restore()
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = core; ctx.beginPath(); ctx.arc(x, y, Math.max(2, r * 0.09), 0, K.TAU); ctx.fill(); ctx.restore()
  }
  function flare(ctx, x, y, len, a) { // a thin four-point star
    if (a <= 0.01) return
    ctx.save(); ctx.globalCompositeOperation = 'lighter'
    for (const [dx, dy, l] of [[1, 0, len], [0, 1, len * 0.55]]) {
      const g = ctx.createLinearGradient(x - dx * l, y - dy * l, x + dx * l, y + dy * l)
      g.addColorStop(0, 'rgba(120,140,255,0)'); g.addColorStop(0.5, `rgba(235,240,255,${a})`); g.addColorStop(1, 'rgba(120,140,255,0)')
      ctx.fillStyle = g
      if (dx) ctx.fillRect(x - l, y - 2, l * 2, 4); else ctx.fillRect(x - 2, y - l, 4, l * 2)
    }
    ctx.restore()
  }
  // the dark: deep indigo, a glow behind the mark, drifting motes, and the unlit field below the horizon
  function dark(ctx, t, c) {
    ctx.fillStyle = '#0a0e2c'; ctx.fillRect(0, 0, W, H)
    const gx = L ? markPose(Math.min(t, 1.2)).x : W / 2
    const g = ctx.createRadialGradient(gx, H / 2, 0, gx, H / 2, 900); g.addColorStop(0, `rgba(47,63,232,${0.22 + 0.2 * K.clamp((t - 0.6) / 0.6) + 0.2 * MUSIC.pulse('kick', 0.3, 0.4)})`); g.addColorStop(1, 'rgba(10,14,44,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    // the field is already there in the dark: its tiles' edges, faintly, converging on the mark
    const ga = 0.11 + 0.16 * MUSIC.pulse('kick', 0.3, 0.4) // v3: the unlit floor thumps with the kick
    if (ga > 0.005) {
      ctx.save(); ctx.strokeStyle = `rgba(120,140,255,${ga})`; ctx.lineWidth = 1.2
      for (const tl of WORLD.tiles) {
        if (tl.z > 26 || Math.abs(tl.x) > tl.z * 1.2 + 2) continue
        const P = [[-0.5, 0.28125], [0.5, 0.28125], [0.5, -0.28125], [-0.5, -0.28125]].map(([a, b]) => CF.proj(c, tl.x + a, 0, tl.z + b))
        if (P.some((p) => !p)) continue
        const fa = K.clamp(1 - (tl.z - 6) / 20)
        ctx.globalAlpha = fa; K.pathOf(ctx, P); ctx.stroke()
      }
      ctx.restore()
    }
    // motes drifting toward the camera
    const rr_ = K.rng('motes')
    ctx.save()
    for (let k = 0; k < 90; k++) {
      const x = (rr_() - 0.5) * 18, y = rr_() * 7 - 1, z0 = rr_() * 20, sp = 0.8 + rr_() * 1.4
      const z = ((z0 - t * sp - c.z) % 20 + 20) % 20 + 0.6 + c.z
      const p = CF.proj(c, x, y, z)
      if (!p) continue
      const s = Math.min(5, 11 / p[2]), a = K.clamp(1.3 - p[2] / 16) * (0.45 + 0.4 * Math.sin(t * 6 + k))
      ctx.fillStyle = `rgba(170,185,255,${a})`; ctx.beginPath(); ctx.arc(p[0], p[1], s, 0, K.TAU); ctx.fill()
    }
    ctx.restore()
  }
  function drawStrokes(ctx, P, t, neon) {
    const lw = (3 / 32) * P.s
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    for (let k = 0; k < 3; k++) {
      const f = prog(k, t)
      if (f <= 0.001) continue
      const pts = partial(k, f).pts.map((p) => toScr(P, p))
      const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]) }
      // neon: a wide blue bloom and a pale halo under a white core (fades once the square is in)
      const bell = K.pulse(t, [STT[k][0] + STT[k][1]], 0.45)
      if (neon > 0.01) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'
        path(); ctx.strokeStyle = `rgba(74,91,255,${0.28 * neon})`; ctx.lineWidth = lw * (4.2 + 1.5 * bell); ctx.stroke()
        path(); ctx.strokeStyle = `rgba(150,165,255,${(0.42 + 0.3 * bell) * neon})`; ctx.lineWidth = lw * 2; ctx.stroke()
        ctx.restore()
      }
      path(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = lw; ctx.stroke()
    }
    ctx.restore()
  }
  function drawSquare(ctx, P, sq) {
    if (sq <= 0.001) return
    ctx.save(); ctx.translate(P.x, P.y); ctx.scale(sq, sq)
    ctx.shadowColor = 'rgba(74,91,255,0.85)'; ctx.shadowBlur = 70
    const g = ctx.createLinearGradient(0, -P.s / 2, 0, P.s / 2); g.addColorStop(0, '#4a5bff'); g.addColorStop(1, '#2230c9')
    ctx.fillStyle = g; rr(ctx, -P.s / 2, -P.s / 2, P.s, P.s, (P.s * 10) / 32); ctx.fill()
    ctx.restore()
  }
  function pre(ctx, t) {
    layout(ctx)
    const c = WORLD.camAt(0)
    dark(ctx, t, c)
    const P = markPose(t)
    // v3: the snare cracks the dark — a frame-wide streak of light through the lockup, the glow flaring, a jolt
    const crack = MUSIC.pulse('snare', 0.24, 0.4)
    if (crack > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, 1100); g.addColorStop(0, `rgba(90,110,255,${0.45 * crack})`); g.addColorStop(1, 'rgba(40,60,200,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore() }
    ctx.save(); ctx.translate(14 * crack * K.noise1(t * 80, 11), 8 * crack * K.noise1(t * 80, 13))
    // inward light streaks while it charges
    const ch = K.clamp((t - 0.98) / 0.22)
    if (ch > 0) {
      const R = K.rng('charge')
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'
      for (let i = 0; i < 70; i++) {
        const a = R() * K.TAU, d0 = 300 + R() * 1100, ph = ((t - 0.98) * (3 + R() * 3) + R()) % 1, d = d0 * (1 - ph) + P.s * 0.4, len = (80 + R() * 260) * (1 - ph) * ch
        ctx.strokeStyle = `rgba(170,185,255,${(0.2 + R() * 0.5) * ch})`; ctx.lineWidth = 1 + R() * 2.5
        ctx.beginPath(); ctx.moveTo(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d); ctx.lineTo(P.x + Math.cos(a) * (d + len), P.y + Math.sin(a) * (d + len)); ctx.stroke()
      }
      ctx.restore()
    }
    // the ring the slam throws
    const rp = K.clamp((t - 0.8) / 0.45)
    if (rp > 0 && rp < 1) { ctx.save(); ctx.globalAlpha = 0.8 * (1 - rp); ctx.strokeStyle = '#aab6ff'; ctx.lineWidth = 8 * (1 - rp) + 1; ctx.beginPath(); ctx.arc(P.x, P.y, P.s * (0.6 + 2.6 * K.ease.out(rp)), 0, K.TAU); ctx.stroke(); ctx.restore() }
    // the square, the strokes
    const sq = t >= 0.8 ? K.spring(t - 0.8, 4.6, 0.45) : 0
    const neon = 1 - 0.75 * K.clamp((t - 0.8) / 0.2)
    drawSquare(ctx, P, sq)
    drawStrokes(ctx, P, t, neon)
    // white heat as it charges
    const hot = K.ease.in(K.clamp((t - 1.06) / 0.14))
    if (hot > 0) { ctx.save(); ctx.globalAlpha = hot * 0.85; ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#c9d2ff'; ctx.shadowBlur = 80 * hot; rr(ctx, P.x - P.s / 2, P.y - P.s / 2, P.s, P.s, (P.s * 10) / 32); ctx.fill(); ctx.restore() }
    // the name: whole from frame 0, a glint running along it with the light; punches with the slam, sucked into the mark (1.06 →)
    ctx.save()
    ctx.font = `800 ${NS}px "Inter", sans-serif`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.035 * NS + 'px'
    ctx.textBaseline = 'alphabetic'
    // v3: each melody note lights one letter of the name — under B the letter is the pitch (low left, high right),
    // so the name plays the tune; under A a hash of the note's time picks it. The snare snaps the whole name.
    const lit = new Array(NAME.length).fill(0), spots = []
    for (const n of MUSIC.notes(0.42)) {
      const i = Math.round(n.u * (NAME.length - 1)), e = n.h.s * Math.pow(1 - n.age / 0.42, 2)
      for (let j = 0; j < NAME.length; j++) lit[j] = Math.max(lit[j], e * (j === i ? 1 : Math.abs(j - i) === 1 ? 0.3 : 0))
    }
    const snap = MUSIC.pulse('snare', 0.18, 0.4)
    for (let i = 0; i < NAME.length; i++) {
      const ti = -0.6 + i * 0.022, p = K.spring(t - ti, 4.2, 0.5)
      if (p <= 0.001) continue
      const cw = L.xs[i + 1] - L.xs[i], hx = L.tx + L.xs[i] + cw / 2, hy = L.ty
      const suck = K.ease.in(K.clamp((t - 1.06 - i * 0.008) / 0.08))
      if (suck >= 1) continue
      const sc = K.lerp(1.6, 1, Math.min(1.2, p)) * (1 + (t >= 0.8 ? 0.05 * Math.exp(-(t - 0.8) * 9) : 0)) * (1 - 0.9 * suck)
      const x = K.lerp(hx, P.x, suck), y = K.lerp(hy - NS * 0.36, P.y, suck) + NS * 0.36 * (1 - suck)
      const lift = (24 * lit[i] + 6 * snap) * (1 - suck)
      ctx.save(); ctx.translate(x, y - NS * 0.36 - lift); ctx.rotate(-1.2 * suck); ctx.scale(sc * (1 + suck * 0.6 + 0.12 * lit[i]), sc * (1 - suck * 0.4 + 0.12 * lit[i])); ctx.translate(-x, -(y - NS * 0.36))
      ctx.globalAlpha = K.clamp(p * 3) * (1 - suck * 0.5)
      ctx.shadowColor = lit[i] > 0.05 ? `rgba(150,170,255,${0.8 + 0.2 * lit[i]})` : 'rgba(90,110,255,0.8)'; ctx.shadowBlur = 30 + 30 * K.pulse(t, [0.8], 0.4) + 90 * lit[i] + 30 * snap
      const fresh = Math.exp(-Math.pow((t * 1.9 - i / NAME.length) * 5, 2)) // a glint sweeping across the name, 0 → 0.5
      ctx.fillStyle = K.mixColor(K.mixColor('#ffffff', '#b8c4ff', fresh), '#ffffff', Math.max(lit[i], snap))
      ctx.fillText(NAME[i], x - cw / 2, y)
      if (lit[i] > 0.3 && suck < 0.3) spots.push([x, y - NS * 0.82 - lift, lit[i]])
      ctx.restore()
    }
    ctx.restore()
    for (const [x, y, e] of spots) { flare(ctx, x, y, 70 * e, e); glowDot(ctx, x, y, 50 * e, e) } // the note's sparkle over its letter
    // the spark itself
    const sp = sparkAt(t, P)
    if (sp) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'
      let prev = sp
      for (let k = 1; k <= 10; k++) { const q = sparkAt(Math.max(0, t - k * 0.012), P); if (!q) break; ctx.strokeStyle = `rgba(200,212,255,${0.5 * (1 - k / 10)})`; ctx.lineWidth = 9 * (1 - k / 11); ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); prev = q }
      ctx.restore()
      glowDot(ctx, sp[0], sp[1], 120, 1)
      flare(ctx, sp[0], sp[1], 160 + 40 * Math.sin(t * 50), 0.8)
    }
    // a flare at the end of each stroke as it completes
    for (let k = 0; k < 3; k++) { const e = STT[k][0] + STT[k][1], v = K.pulse(t, [e], 0.3); if (v > 0.01) { const q = toScr(P, ST[k][ST[k].length - 1]); flare(ctx, q[0], q[1], 260 * v, v); glowDot(ctx, q[0], q[1], 160 * v, v) } }
    if (t >= 0.8) flash(ctx, t, [0.8], { dur: 0.2, amount: 0.18, color: '#8f9cff' })
    ctx.restore()
    if (crack > 0.01) { flare(ctx, P.x, P.y, 1500 * crack, crack); flare(ctx, W / 2, L.ty - NS * 0.36, 1200 * crack, 0.7 * crack) }
  }
  // the burst and after: the world, revealed by a shock ring that turns the dark to mist
  function post(ctx, t) {
    layout(ctx)
    const tb = t - WORLD.T_BOOM
    const R = 1320 * (1 - Math.pow(1 - K.clamp(tb / 0.24), 2))
    const c = WORLD.camAt(t)
    if (R < 1300) dark(ctx, t, c)
    ctx.save()
    if (R < 1300) { ctx.beginPath(); ctx.arc(W / 2 + c.ox, H / 2 + c.oy, Math.max(1, R), 0, K.TAU); ctx.clip() }
    WORLD.sky(ctx)
    ctx.restore()
    // the ring's bright edge
    if (R < 1300) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'
      const rw = 40 + 120 * K.clamp(tb / 0.2)
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.max(0, R - rw), W / 2, H / 2, R + 8)
      g.addColorStop(0, 'rgba(120,140,255,0)'); g.addColorStop(0.85, `rgba(225,232,255,${0.95 * (1 - K.clamp(tb / 0.3))})`); g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore()
    }
    WORLD.draw(ctx, t, { haze: K.clamp(tb / 0.35) })
    // the white-hot core of the burst, fading
    const core = Math.exp(-tb * 9)
    if (core > 0.02) { glowDot(ctx, W / 2 + c.ox, H / 2 + c.oy, 700 * (0.6 + tb * 3), core); flare(ctx, W / 2 + c.ox, H / 2 + c.oy, 1400 * (0.5 + tb * 2), core) }
    flash(ctx, t, [WORLD.T_BOOM], { dur: 0.07, amount: 0.45 })
    // speed streaks while the tiles fly at the camera
    const sk = K.clamp(1 - tb / 0.5) * K.clamp(tb / 0.05)
    if (sk > 0) streaks(ctx, t, W / 2 + c.ox, H / 2 + c.oy, sk, 11, { n: 50, color: `rgba(255,255,255,${0.5 * sk})` })
  }
  function draw(ctx, t) { if (t < WORLD.T_BOOM) pre(ctx, t); else post(ctx, t) }
  return { draw, markPose, layout, glowDot, flare, ST, STL }
})()
K.scene({ id: 'spark', ...span('spark'), draw(ctx, s) { SPARK.draw(ctx, s.t) } })
