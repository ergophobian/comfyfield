// Builder A — end (25.2–30.0 s). The converge leaves a point of light in the dark at the centre. It flares, and live
// tiles spiral out of it and SNAP into the ComfyField mark itself, big (560 px, half the frame's height): on 25.4 a
// chain of tiles locks along the mark's arc, on 25.6 along its stem and bar — the strokes read in tiles — and on 25.8
// the blue square's tiles lock in round them. The mosaic charges; at 26.4 every tile flips over at once — the backs
// are the pieces of the mark — and a shock ring turns the dark to mist. The mark slides into the lockup,
// "ComfyField" slams, "Formats that earn." rises, the pills pop on the eighths, the URL rises; the complete card
// holds 28.0–30.0 under a slow push-in.
K.cue(25.4, "end: land — a chain of tiles locks along the mark's arc", 'hit')
K.cue(25.6, 'end: land — tiles lock along the stem and the bar (the mark reads)', 'hit')
K.cue(25.8, "end: land — the blue square's tiles lock in round the strokes", 'hit')
K.cue(26.4, 'end: boom — the mosaic flips into the logo, the dark turns to light', 'hit')
K.cue(26.8, 'end: slam ComfyField', 'hit')
K.cue(27.0, 'end: rise — Formats that earn.', 'soft')
K.cue(27.2, 'end: pop — Open source · MIT', 'hit')
K.cue(27.4, 'end: pop — Runs on your computer', 'hit')
K.cue(27.6, 'end: pop — Your own keys', 'hit')
K.cue(27.8, 'end: pop — Built on the Comfy Developer Platform (and the URL rises)', 'hit')

const END = (() => {
  const T0 = 25.2, BOOM = 26.4
  const MB = 560, N = 10, CELL = MB / N, GAPPX = 7 // the mark the tiles build (52 % of the frame's height), a 10 × 10 grid
  const RAD = (MB * 10) / 32, LW = (3 / 32) * MB
  const inSquare = (px, py) => { const cx = K.clamp(px, RAD, MB - RAD), cy = K.clamp(py, RAD, MB - RAD); return Math.hypot(px - cx, py - cy) <= RAD }
  const r = K.rng('end-mosaic')
  const flight = (sx, sy) => ({ te: T0 + 0.02 + r() * 0.1, th0: Math.atan2(sy, sx) + (r() - 0.5) * 1.2, spin: [(r() - 0.5) * 9, (r() - 0.5) * 9, (r() - 0.5) * 6], fd: Math.hypot(sx, sy) / (MB * 0.7) })
  const cells = []
  // the strokes: live tiles chained along each of the mark's three strokes, each turned to follow the line
  SPARK.ST.forEach((pl, k) => {
    const cl = SPARK.STL[k], len = cl[cl.length - 1], px = (len * MB) / 32
    const n = Math.max(2, Math.round(px / (LW * 1.12)))
    const at = (d) => { for (let i = 1; i < pl.length; i++) if (cl[i] >= d) { const a = (d - cl[i - 1]) / (cl[i] - cl[i - 1] || 1); return [K.lerp(pl[i - 1][0], pl[i][0], a), K.lerp(pl[i - 1][1], pl[i][1], a)] } return pl[pl.length - 1] }
    for (let i = 0; i < n; i++) {
      const d = (len * (i + 0.5)) / n, p = at(d), q0 = at(Math.max(0, d - 0.5)), q1 = at(Math.min(len, d + 0.5))
      const sx = (p[0] / 32 - 0.5) * MB, sy = (p[1] / 32 - 0.5) * MB
      cells.push({ kind: 'stroke', Tw: k === 0 ? 25.4 : 25.6, sx, sy, rz: Math.atan2(-(q1[1] - q0[1]), q1[0] - q0[0]), w: px / n - 4, h: LW * 1.08, id: TILES[(k * 7 + i * 5 + 2) % TILES.length], off: [0, 1.7, 3.4][i % 3], ...flight(sx, sy) })
    }
  })
  // the square: the grid cells inside the rounded square
  for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
    if (!inSquare((gx + 0.5) * CELL, (gy + 0.5) * CELL)) continue
    const sx = (gx + 0.5) * CELL - MB / 2, sy = (gy + 0.5) * CELL - MB / 2
    cells.push({ kind: 'bg', Tw: 25.8, gx, gy, sx, sy, rz: 0, id: TILES[(gx * 5 + gy * 3 + 7) % TILES.length], off: [0, 1.7, 3.4][(gx + gy) % 3], ...flight(sx, sy) })
  }
  // v3: where a melody note sits, 0..1 — under B its pitch across the outro's own range (so low/mid/high spread
  // over the three strokes and four pills), under A the running count of notes
  let OUT = null
  function where(n, slots) {
    if (n.p == null) return (MUSIC.count('other', 0.3, n.h.t) % slots) / Math.max(1, slots - 1)
    if (!OUT) { const ps = SONG.hits('other', 28.94, 33, 0.3).filter((h) => h.p != null && !MUSIC.isLow(h)).map((h) => MUSIC.pitchOf(h)); OUT = ps.length ? [Math.min(...ps), Math.max(...ps)] : [0, 1] }
    return K.clamp((n.p - OUT[0]) / Math.max(1e-3, OUT[1] - OUT[0]))
  }
  // the mark at the mosaic's size, cut into the square tiles' backs
  let markC = null
  function markTex() {
    if (markC) return markC
    markC = document.createElement('canvas'); markC.width = MB; markC.height = MB
    mark(markC.getContext('2d'), 0, 0, MB, 1)
    return markC
  }
  // the lockup: mark 190, gap 44, the name at 170 in Inter 800; the whole card centred on the frame
  const SZ = 190, GAP = 44, NS = 170, Y0 = 248
  let L = null
  function layout(ctx) {
    if (L) return L
    ctx.save(); ctx.font = `800 ${NS}px "Inter", sans-serif`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.04 * NS + 'px'
    const tw = ctx.measureText('ComfyField').width; ctx.restore()
    const x0 = (W - (SZ + GAP + tw)) / 2
    L = { x0, tw, mx: x0 + SZ / 2, my: Y0 + SZ / 2 }
    return L
  }

  function darkBg(ctx, t) {
    ctx.fillStyle = '#0a0e2c'; ctx.fillRect(0, 0, W, H)
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 950)
    const bass = MUSIC.bass(0.7) // v3: a low throb of light in the dark on each bass note (until 28.94)
    g.addColorStop(0, `rgba(47,63,232,${0.18 + 0.22 * K.clamp((t - T0) / 1.0) + 0.3 * bass})`); g.addColorStop(1, 'rgba(10,14,44,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    // sparks thrown out of the point, drifting outward
    const R = K.rng('end-sparks')
    ctx.save(); ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 70; i++) {
      const a = R() * K.TAU, sp = 300 + R() * 900, d = 30 + sp * (1 - Math.exp(-(t - T0) * 1.6)) / 1.6, s = 1 + R() * 2.5
      const al = (0.25 + 0.5 * R()) * K.clamp(1 - (t - T0) / 1.4)
      if (al <= 0.01) continue
      ctx.fillStyle = `rgba(180,195,255,${al})`; ctx.beginPath(); ctx.arc(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, s, 0, K.TAU); ctx.fill()
    }
    ctx.restore()
  }
  function lightBg(ctx) { mist(ctx, { glows: [[W / 2, H * 0.4, 950, 'rgba(74,91,255,0.26)'], [W * 0.1, H, 650, 'rgba(139,92,246,0.12)'], [W * 0.92, H * 0.15, 500, 'rgba(74,91,255,0.10)']] }) }

  // the mosaic, before and through the flip (25.2 → 26.7)
  function mosaic(ctx, t, cam) {
    const list = []
    const charge = K.clamp((t - 26.0) / 0.4)
    const breathe = 1 + 0.035 * K.ease.in(charge) * (1 - K.ease.inOut(K.clamp((t - BOOM) / 0.22))) + 0.012 * Math.sin((t - 26.0) * 60) * K.clamp((t - 26.15) / 0.2) * (t < BOOM ? 1 : 0)
    const close = K.ease.inOut(K.clamp((t - 26.56) / 0.12)) // the gaps close once the flip is done
    // v3: the kick pumps the mosaic and makes the swirl lurch inward; the snare snaps the placed tiles white; each
    // melody note lights a band of rows — under B the row is the pitch (high notes near the top), so the mark plays
    // the tune as it builds; under A a hash of the note's time picks the row
    const kick = MUSIC.pulse('kick', 0.3, 0.4), snare = MUSIC.pulse('snare', 0.16, 0.4)
    const tune = MUSIC.notes(0.45).map((n) => ({ row: 1 - n.u, e: n.h.s * Math.pow(1 - n.age / 0.45, 2) }))
    for (const c of cells) {
      if (t < c.te) continue
      const tf = t - c.te, stroke = c.kind === 'stroke'
      // in flight: spiralling out of the point, coming forward from deep behind it
      const th = c.th0 + 5.5 * tf, rad = (Math.hypot(c.sx, c.sy) * 1.35 + 190) * (1 - Math.exp(-tf / 0.16)) * (1 - 0.14 * kick)
      const S = [Math.cos(th) * rad, -Math.sin(th) * rad, 900 * Math.exp(-tf / 0.14) - 60]
      const q = K.at(t, c.Tw - 0.17, 0.17, 'in') // the snap, landing on its eighth
      const pumpK = 1 + 0.045 * kick
      const slot = [c.sx * breathe * pumpK, -c.sy * breathe * pumpK, stroke ? -8 : 0]
      const C = [0, 1, 2].map((k) => K.lerp(S[k], slot[k], q))
      const dec = (1 - q) * (1 - q)
      // the flip at the boom: centre first; the square's backs are the mark, the stroke tiles turn edge-on and go
      const fp = t >= BOOM ? K.spring(t - BOOM - c.fd * 0.06, 5.2, 0.8) : 0
      const ry = Math.PI * fp
      C[2] -= 150 * Math.sin(Math.min(Math.PI, ry))
      const back = Math.cos(ry) < 0
      if (stroke && back) continue
      const [U, V] = CF.orient(c.spin[0] * dec, c.spin[1] * dec + ry, c.rz + c.spin[2] * dec)
      const land = t >= c.Tw ? t - c.Tw : -1
      let note = 0
      if (land >= 0 && !back) { const v = (c.sy + MB / 2) / MB; for (const n of tune) note = Math.max(note, n.e * Math.exp(-Math.pow((v - n.row) / 0.11, 2))) }
      C[2] -= 50 * note
      const bump = (land >= 0 ? 1 + 0.22 * Math.exp(-land * 11) * Math.cos(land * 32) : 1) * (1 + 0.16 * note)
      const k = bump * (0.25 + 0.75 * K.clamp(tf / 0.12)) * breathe
      const w = (stroke ? c.w : CELL - GAPPX * (1 - close)) * k, h = (stroke ? c.h : CELL - GAPPX * (1 - close)) * k
      const ov = { edge: back ? 0 : stroke ? 1 : 0.85, edgeW: stroke ? 2.5 : 1.5 }
      if (land >= 0 && land < 0.22) ov.flash = 0.45 * (1 - land / 0.22)
      if (land >= 0) { ov.flash = Math.max(ov.flash || 0, 0.55 * note, 0.3 * snare); ov.edgeW += 2 * snare }
      if (!back) {
        // the strokes read white, the square blue — the icon is legible in tiles before the flip
        ov.tint = stroke ? ['#ffffff', 0.5 + 0.2 * K.ease.in(charge)] : ['#2f3fe8', 0.5 + 0.3 * K.ease.in(charge)]
        const sweep = K.clamp(1 - Math.abs((c.sx + c.sy) / MB - K.lerp(-1.4, 1.4, K.clamp((t - 26.0) / 0.3))) * 3)
        ov.flash = Math.max(ov.flash || 0, 0.7 * sweep * (t < BOOM ? 1 : 0))
      }
      let img, src
      if (back) { img = markTex(); const inset = (GAPPX * (1 - close)) / 2; src = [c.gx * CELL + inset, c.gy * CELL + inset, CELL - 2 * inset, CELL - 2 * inset]; ov.mirrorU = true }
      else { img = clip[c.id].at(t + c.off, true); src = [63, 0, 162, 162] }
      ov.src = src
      const pc = CF.proj(cam, C[0], C[1], C[2])
      if (pc) list.push({ img, C, U, V, w, h, ov, zc: pc[2] })
    }
    list.sort((a, b) => b.zc - a.zc)
    for (const q of list) CF.card(ctx, cam, q.img, q.C, q.U, q.V, q.w, q.h, q.ov)
  }

  function draw(ctx, s) {
    const t = s.t
    // motion blur samples frame 0 a hair before 0, where the kit falls back to the last scene (this one): give
    // those samples the spark's opening instead, so frame 0 is not dimmed by the end's point of light
    if (t < 0) { SPARK.draw(ctx, t); return }
    layout(ctx)
    const tb = t - BOOM
    // the camera: still, a shake on the boom
    const sh = tb > 0 ? 18 * Math.exp(-tb * 9) : 0
    const cam = CF.cam({ x: 0, y: 0, z: -1000, f: 1000, ox: sh * K.noise1(t * 40, 2), oy: sh * K.noise1(t * 40, 4) })
    // the slow push-in, from the boom to the end
    const zoom = 1 + 0.045 * K.ease.inOutSine(K.clamp((t - 26.5) / 3.5))
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2)
    // the world: dark, then the shock ring turns it to mist
    const R = tb < 0 ? 0 : 1350 * (1 - Math.pow(1 - K.clamp(tb / 0.3), 2))
    if (R < 1320) darkBg(ctx, t)
    if (R > 0) {
      ctx.save()
      if (R < 1320) { ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, K.TAU); ctx.clip() }
      lightBg(ctx)
      ctx.restore()
      if (R < 1320) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.max(0, R - 140), W / 2, H / 2, R + 6)
        g.addColorStop(0, 'rgba(120,140,255,0)'); g.addColorStop(0.85, `rgba(225,232,255,${0.9 * (1 - K.clamp(tb / 0.35))})`); g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore()
      }
    }
    // the point of light the converge left, flaring as the tiles burst out of it
    const pt = t - T0
    const pa = K.clamp(1 - (pt - 0.25) / 0.55)
    if (pa > 0.01) {
      const fl = (1 + 2.2 * K.pulse(t, [T0 + 0.02], 0.35)) * (1 + 0.8 * MUSIC.bass(0.7))
      SPARK.glowDot(ctx, W / 2, H / 2, 150 * fl, pa)
      SPARK.flare(ctx, W / 2, H / 2, 320 * fl, pa)
    }
    // the mark: built from tiles until the flip has closed up, then itself, gliding into the lockup
    const go = K.spring(t - 26.66, 2.4, 0.72)
    if (t < 26.7) mosaic(ctx, t, cam)
    else {
      const cx = K.lerp(W / 2, L.mx, go), cy = K.lerp(H / 2, L.my, go), sz = K.lerp(MB, SZ, go)
      // v3: the outro (28.94 →, drums gone) is the melody alone, and the mark sings it: each note lights one of its
      // three strokes — under B low notes the arc, middle the bar, high the stem; under A they take turns — and sends
      // a soft ripple out in the mark's own shape, behind the words
      const sg = [0, 0, 0]
      for (const n of MUSIC.notes(0.8)) {
        if (n.h.t < 28.94) continue
        const a = n.age / 0.8, e = n.h.s * Math.pow(1 - a, 2), u = where(n, 3)
        if (n.age < 0.6) { const k = u < 0.34 ? 0 : u < 0.67 ? 2 : 1; sg[k] = Math.max(sg[k], n.h.s * Math.pow(1 - n.age / 0.6, 2)) }
        const R2 = sz * (1.02 + 1.7 * K.ease.out(a))
        ctx.save(); ctx.globalAlpha = 0.7 * e; ctx.strokeStyle = B.blue; ctx.lineWidth = 3 + 6 * (1 - a); rr(ctx, cx - R2 / 2, cy - R2 / 2, R2, R2, (R2 * 10) / 32); ctx.stroke(); ctx.restore()
      }
      const hit = Math.max(...sg), szP = sz * (1 + 0.05 * hit) // the mark pops a hair on each note
      const mx0 = cx - szP / 2 + cam.ox, my0 = cy - szP / 2 + cam.oy
      ctx.save(); ctx.shadowColor = 'rgba(34,48,201,0.35)'; ctx.shadowBlur = 60 * sz / SZ * 0.6; ctx.shadowOffsetY = 18 * sz / SZ * 0.6
      mark(ctx, mx0, my0, szP, 1, { glow: sg })
      ctx.restore()
      if (hit > 0.02) {
        // the struck stroke flashes in its own shape — a touch thicker, with a tight light edge — so the mark always
        // reads as the logo; the square only deepens a hair behind it
        ctx.save(); ctx.globalAlpha = 0.25 * hit; ctx.fillStyle = '#1d29b8'; rr(ctx, mx0, my0, szP, szP, (szP * 10) / 32); ctx.fill(); ctx.restore()
        for (let k = 0; k < 3; k++) {
          if (sg[k] <= 0.02) continue
          ctx.save(); ctx.translate(mx0, my0); ctx.scale(szP / 32, szP / 32); ctx.lineCap = 'round'; ctx.lineJoin = 'round'
          ctx.shadowColor = `rgba(200,215,255,${0.9 * sg[k]})`; ctx.shadowBlur = 12 * sg[k]; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3 + 0.9 * sg[k]; ctx.stroke(MARK_PATHS[k])
          ctx.restore()
        }
      }
      // a slow glint across the mark during the hold
      const gl = K.clamp((t - 28.7) / 0.7)
      if (gl > 0 && gl < 1) {
        ctx.save(); rr(ctx, cx - sz / 2, cy - sz / 2, sz, sz, (sz * 10) / 32); ctx.clip()
        const gx = cx - sz + gl * sz * 2.2, g = ctx.createLinearGradient(gx - 60, cy - sz / 2, gx + 60, cy + sz / 2)
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g; ctx.fillRect(cx - sz / 2, cy - sz / 2, sz, sz); ctx.restore()
      }
    }
    // the boom's light: a bloom from the mark, not a wash over the frame
    const bl = K.pulse(t, [BOOM], 0.22)
    if (bl > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 900); g.addColorStop(0, `rgba(235,240,255,${0.95 * bl})`); g.addColorStop(0.35, `rgba(150,170,255,${0.45 * bl})`); g.addColorStop(1, 'rgba(80,100,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore() }
    // the words
    ctx.save(); ctx.shadowColor = 'rgba(238,241,255,0.9)'; ctx.shadowBlur = 24
    slam(ctx, t, 'ComfyField', L.x0 + SZ + GAP, Y0 + 152, 26.8, { size: NS, from: 1.7 })
    ctx.restore()
    rise(ctx, t, ['Formats', 'that', 'earn.'], W / 2, Y0 + 322, 27.0, { size: 66, align: 'center', weight: 700, step: 0.07, colors: [B.ink, B.ink, B.blue] })
    const pills = ['Open source · MIT', 'Runs on your computer', 'Your own keys', 'Built on the Comfy Developer Platform']
    const PS = 30
    const ws = pills.map((q) => { ctx.save(); ctx.font = `600 ${PS}px "Inter", sans-serif`; const w = ctx.measureText(q).width + PS * 1.4 + PS * 0.9; ctx.restore(); return w })
    const total = ws.reduce((a, b) => a + b, 0) + 22 * (pills.length - 1)
    let px = (W - total) / 2
    pills.forEach((q, i) => {
      const ap = K.spring(t - 27.2 - i * 0.2, 3.4, 0.5)
      if (ap > 0.001) pill(ctx, q, px + (ws[i] / 2) * (1 - ap), Y0 + 462 + (1 - Math.min(1, ap)) * 30, { size: PS, align: 'left', dot: true, solid: true, alpha: K.clamp(ap * 2), scale: Math.max(0.01, ap) })
      // v3: in the outro each note lights one whole pill — a blue rim and glow round it, a pale blue tint inside, its dot
      // swelling; the words stay ink and still. Under B the pill follows the pitch (low left, high right); A takes turns
      if (ap > 0.9) for (const n of MUSIC.notes(0.55)) {
        if (n.h.t < 28.94 || Math.min(3, Math.floor(where(n, 4) * 3.999)) !== i) continue
        const a = n.age / 0.55, e = n.h.s * Math.pow(1 - a, 1.6), dx = px + 0.95 * PS * ap, dy = Y0 + 462
        const sc = Math.max(0.01, ap), x0 = px + (ws[i] / 2) * (1 - ap), w = ws[i] * sc, h = PS * 1.9 * sc, lv = K.clamp(e * 1.15)
        ctx.save()
        ctx.shadowColor = `rgba(47,63,232,${0.85 * lv})`; ctx.shadowBlur = 34 * lv
        ctx.fillStyle = `rgba(214,220,255,${lv})`; rr(ctx, x0, dy - h / 2, w, h, h / 2); ctx.fill()
        ctx.shadowColor = 'transparent'; ctx.globalAlpha = lv; ctx.strokeStyle = B.blue; ctx.lineWidth = 4; rr(ctx, x0 + 2, dy - h / 2 + 2, w - 4, h - 4, h / 2 - 2); ctx.stroke()
        ctx.restore()
        ctx.save(); ctx.translate(x0, dy); ctx.scale(sc, sc); ctx.font = `600 ${PS}px "Inter", sans-serif`; ctx.textBaseline = 'middle'
        ctx.fillStyle = B.ink; ctx.fillText(q, PS * 0.7 + PS * 0.9, 1)
        ctx.fillStyle = B.blue; ctx.beginPath(); ctx.arc(PS * 0.95, 0, PS * 0.22 * (1 + 0.7 * lv), 0, K.TAU); ctx.fill(); ctx.restore()
      }
      px += ws[i] + 22
    })
    const ua = K.spring(t - 27.8, 3.0, 0.75)
    if (ua > 0.001) txt(ctx, 'github.com/ergophobian/comfyfield', W / 2, Y0 + 612 + (1 - ua) * 40, { size: 46, weight: 700, color: B.blue, align: 'center', alpha: K.clamp(ua * 1.6) })
    ctx.restore()
  }
  return { draw }
})()
K.scene({ id: 'end', ...span('end'), draw: END.draw })
