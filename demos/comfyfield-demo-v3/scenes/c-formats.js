// formats — bars 11–14 (13.2–16.8), builder C.
// Out of the montage's mosaic: the cells blow past the camera and the phone (the Seedance post) swings in in 2.5D.
// The format chips burst out from behind it into a tilted orbit (z-sorted: they pass behind the phone and in
// front of it) and settle to a slow drift so every name reads; "Formats that earn." slams. Then, one per eighth,
// a chip swoops across the front of the phone and lands on its glass as the post's format tag (knocking the last
// one off): a squash on the glass, a ripple from the tag, a kick of the phone.
;(function () {
  const C = (window.CB = window.CB || {})
  const S0 = 13.2
  const FMT = ['Chaotic product story', 'Countdown list', 'What if', 'Object drama', 'Big question', 'Tiny worker', 'Price knockout', 'Before and after reveal']
  const FCOL = ['#2f3fe8', '#8b5cf6', '#0ea5a4', '#e0598b', '#f59e0b', '#16a34a', '#ef4444', '#0891b2']
  // when each chip lands on the post (film time): one per eighth
  const LANDS = [14.8, 15.0, 15.2, 15.4, 15.6, 15.8, 16.0, 16.2]
  const LAND_T = [...new Set(LANDS)]
  const FLY = 0.34 // a chip's flight from the ring into the screen
  const SPIN_T = 16.4, SPIN_TURN = K.TAU // after the last landing the phone whips a full turn
  C.FMT = FMT; C.FCOL = FCOL

  // ---------- v3: the song (warp.js hands it over as SONG; the scenes still run in v2 time)
  // env: a short envelope on a layer's latest hit, with a 35 ms attack so a punch never steps inside one frame's
  // motion-blur shutter. h01: a stable 0..1 from a hit's time, the stand-in for pitch when there is none (A).
  const M = (C.M = {
    on: () => !!window.SONG,
    now: () => (window.SONG ? SONG.now : 0),
    env(layer, dur = 0.25, minS = 0, atk = 0.035) {
      if (!window.SONG) return 0
      const h = SONG.last(layer, minS)
      if (!h) return 0
      const age = SONG.now - h.t
      return age >= dur ? 0 : h.s * Math.min(1, age / atk) * Math.pow(1 - age / dur, 2)
    },
    hits: (layer, a, b, minS = 0) => (window.SONG ? SONG.hits(layer, a, b, minS) : []),
    p01: (layer, h) => (window.SONG ? SONG.pitch01(layer, h) : null),
    h01: (t, salt = 0) => (K.hash(Math.round(t * 1000) + ':' + salt) % 10007) / 10007,
    // the melody's notes: under B, anything below MIDI 44 is the bass bleeding into the melody stem, never melody
    notes: (a, b) => (window.SONG ? SONG.hits('other', a, b).filter((h) => h.p == null || h.p >= 44) : []),
    // a melody note's pitch as 0..1 across the melody's own range (MIDI >= 44, the whole song), or null (A)
    mp01(h) {
      if (!h || h.p == null || !window.SONG) return null
      if (!M._mr) { const ps = (SONG.data.layers.other || []).filter((x) => x.p != null && x.p >= 44).map((x) => x.p); M._mr = ps.length ? [Math.min(...ps), Math.max(...ps)] : [44, 72] }
      return K.clamp((h.p - M._mr[0]) / Math.max(1, M._mr[1] - M._mr[0]))
    },
  })

  K.cue(13.2, 'formats: whoosh — the mosaic blows past, the phone swings in', 'hit')
  K.cue(13.6, 'formats: burst — format chips fly out into orbit', 'hit')
  K.cue(13.8, 'formats: slam "Formats that earn."', 'hit')
  K.cue(14.4, 'formats: rise "22 proven formats."', 'soft')
  K.cue(SPIN_T, 'formats: spin — the phone whips round once (its back shows the mark)', 'soft')
  LAND_T.forEach((T, i) => K.cue(T, 'formats: land — a format chip lands on the post as its format tag', i % 2 ? 'soft' : 'hit'))

  // ---------- 2.5D: world px, z away from the camera; z = 0 is drawn 1:1
  const FOC = 2200
  const proj = (x, y, z) => { const k = FOC / Math.max(80, FOC + z); return [W / 2 + x * k, H / 2 + y * k, k] }
  function rot3(x, y, z, yaw, pitch, roll) {
    let c = Math.cos(roll), s = Math.sin(roll), t
    t = x * c - y * s; y = x * s + y * c; x = t
    c = Math.cos(pitch); s = Math.sin(pitch)
    t = y * c - z * s; z = y * s + z * c; y = t
    c = Math.cos(yaw); s = Math.sin(yaw)
    t = x * c + z * s; z = -x * s + z * c; x = t
    return [x, y, z]
  }
  const P = (ps, u, v, w = 0) => { const r = rot3(u * ps.s, v * ps.s, w * ps.s, ps.yaw, ps.pitch, ps.roll); return proj(ps.x + r[0], ps.y + r[1], ps.z + r[2]) }
  function rrPts(w, h, r, n = 7) {
    const out = [], x0 = -w / 2, y0 = -h / 2
    const arc = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]) } }
    arc(x0 + w - r, y0 + r, -Math.PI / 2); arc(x0 + w - r, y0 + h - r, 0); arc(x0 + r, y0 + h - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI)
    return out
  }
  const poly = (ctx, pts) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath() }
  // an image mapped onto a plane in perspective: thin vertical strips, each an affine map of its three corners
  function planeImg(ctx, img, ps, x0, y0, w, h, n = 26, z = 0) {
    if (!img || !img.width) return
    const iw = img.width, ih = img.height, base = ctx.getTransform()
    for (let i = 0; i < n; i++) {
      const u0 = x0 + (w * i) / n, u1 = x0 + (w * (i + 1)) / n
      const a = P(ps, u0, y0, z), b = P(ps, u1, y0, z), c = P(ps, u0, y0 + h, z)
      ctx.setTransform(base.multiply(new DOMMatrix([b[0] - a[0], b[1] - a[1], c[0] - a[0], c[1] - a[1], a[0], a[1]])))
      ctx.drawImage(img, (iw * i) / n, 0, iw / n, ih, 0, 0, 1.08, 1)
    }
    ctx.setTransform(base)
  }
  C.proj = proj; C.rot3 = rot3; C.planeImg = planeImg; C.poly = poly

  // ---------- the phone
  const PH = { x: 262, y: -14, sw: 392, sh: 697, bz: 17, r: 60 }
  function kicks(t) {
    let k = 0, z = 0
    // a soft nudge per landing, ramped in (no step), so the phone and the post on it stay sharp under motion blur
    for (const T of LAND_T) { const d = t - T; if (d >= 0 && d < 1.2) { const e = Math.exp(-d * 7) * (1 - Math.exp(-d * 40)); k += e * Math.sin(d * 12); z += e } }
    return [k, z]
  }
  function pose(t) {
    const lt = t - S0, p = K.spring(lt + 0.08, 1.55, 0.6) // the swing-in: overshoots past square, settles
    const [kick, kz] = kicks(t)
    const lean = K.at(t, 16.2, 0.9, 'inOut') // the last beat: it leans in toward us
    return {
      x: K.lerp(1500, PH.x, p) - lean * 60,
      y: PH.y + (1 - p) * 160,
      z: K.lerp(3200, 0, p) - lean * 420 + kz * 14 - 80 * M.env('kick', 0.22, 0.5), // the kick: a thump toward us
      yaw: K.lerp(-1.5, -0.42, p) + 0.08 * Math.sin(lt * 2.0) + kick * 0.03 + lean * 0.22 + SPIN_TURN * K.ease.outQuart(K.at(t, SPIN_T, 0.4, 'linear')),
      pitch: 0.06 + 0.035 * Math.sin(lt * 1.5 + 1) - kick * 0.01,
      roll: K.lerp(0.42, -0.04, p) + kick * 0.006,
      s: 1,
    }
  }
  const tintOf = (col) => K.mixColor(col, '#ffffff', 0.35)
  // the tag a chip becomes on the post: the chip itself, laid flat on the glass under the island
  const TAGS = 0.8, SLOT_V = -PH.sh / 2 + 100
  const TAGC = []
  function tagCanvas(k) {
    if (TAGC[k]) return TAGC[k]
    const c = document.createElement('canvas'); c.width = 620; c.height = 140
    chip(c.getContext('2d'), k, 310, 66, 1, {})
    return (TAGC[k] = c)
  }
  function tagOnGlass(ctx, ps, k, sx, sy, du, dv, al, rot) {
    const img = tagCanvas(k), hw = 310 * TAGS * sx, hh = 70 * TAGS * sy, oy = -4 * TAGS
    const c = Math.cos(rot), s = Math.sin(rot)
    const L = (u, v) => P(ps, du + u * c - v * s, SLOT_V + oy + dv + u * s + v * c, -1)
    const a = L(-hw, -hh), b = L(hw, -hh), d = L(-hw, hh)
    const base = ctx.getTransform()
    ctx.save(); ctx.globalAlpha *= al
    ctx.setTransform(base.multiply(new DOMMatrix([b[0] - a[0], b[1] - a[1], d[0] - a[0], d[1] - a[1], a[0], a[1]])))
    ctx.drawImage(img, 0, 0, 1, 1)
    ctx.restore()
  }
  const slotWorld = (ps) => { const r = rot3(0, SLOT_V, -30, ps.yaw, ps.pitch, ps.roll); return [ps.x + r[0], ps.y + r[1], ps.z + r[2]] }
  // the phone's back: dark glass, a camera bump, the ComfyField mark (drawn mirrored: it is seen from behind)
  let BACK = null
  function backImg() {
    const bw = PH.sw + PH.bz * 2, bh = PH.sh + PH.bz * 2
    if (BACK) return BACK
    const c = document.createElement('canvas'); c.width = bw; c.height = bh
    const g = c.getContext('2d'); g.translate(bw, 0); g.scale(-1, 1)
    const gr = g.createLinearGradient(0, 0, bw, bh); gr.addColorStop(0, '#2b3266'); gr.addColorStop(0.55, '#141838'); gr.addColorStop(1, '#232a5c')
    g.fillStyle = gr; g.fillRect(0, 0, bw, bh)
    g.fillStyle = 'rgba(255,255,255,0.06)'; rr(g, 26, 26, 150, 150, 40); g.fill()
    for (const [x, y] of [[66, 66], [136, 66], [66, 136]]) { g.fillStyle = '#05060f'; g.beginPath(); g.arc(x, y, 26, 0, K.TAU); g.fill(); g.strokeStyle = 'rgba(160,170,230,0.5)'; g.lineWidth = 3; g.stroke() }
    if (K.img(LOGO)) mark(g, bw / 2 - 70, bh / 2 - 70, 140, 1)
    else return null
    BACK = c
    return BACK
  }
  function drawPhone(ctx, t, ps) {
    const lt = t - S0, bw = PH.sw + PH.bz * 2, bh = PH.sh + PH.bz * 2
    const body = rrPts(bw, bh, PH.r, 8)
    const glow = Math.max(K.pulse(t, LAND_T, 0.45), 0.85 * M.env('snare', 0.3, 0.5)) // landings, and the snare
    // facing away? (the front's corners wind the other way on screen) — then we see its back
    const c0 = P(ps, -bw / 2, -bh / 2), c1 = P(ps, bw / 2, -bh / 2), c2 = P(ps, -bw / 2, bh / 2)
    if ((c1[0] - c0[0]) * (c2[1] - c0[1]) - (c1[1] - c0[1]) * (c2[0] - c0[0]) < 0) {
      for (let w = 2; w <= 26; w += 4) { ctx.fillStyle = K.mixColor('#232845', '#0b0d1c', w / 26); poly(ctx, body.map(([u, v]) => P(ps, u, v, w))); ctx.fill() }
      const bk = body.map(([u, v]) => P(ps, u, v, 26))
      ctx.save(); poly(ctx, bk); ctx.clip(); planeImg(ctx, backImg(), ps, -bw / 2, -bh / 2, bw, bh, 26, 26); ctx.restore()
      ctx.save(); ctx.strokeStyle = 'rgba(190,200,255,0.4)'; ctx.lineWidth = 2; poly(ctx, bk); ctx.stroke(); ctx.restore()
      return glow
    }
    // the body's thickness: the outline extruded back, layer by layer, so the side shows as it turns
    for (let w = 26; w >= 2; w -= 4) {
      ctx.fillStyle = w >= 24 ? '#03040c' : K.mixColor('#232845', '#0b0d1c', w / 26)
      poly(ctx, body.map(([u, v]) => P(ps, u, v, w))); ctx.fill()
    }
    const front = body.map(([u, v]) => P(ps, u, v, 0))
    ctx.save()
    ctx.shadowColor = glow > 0.02 ? K.rgba('#4a5bff', 0.35 + 0.55 * glow) : 'rgba(15,18,60,0.35)'
    ctx.shadowBlur = 50 + 40 * glow; ctx.shadowOffsetY = 26 - 18 * glow
    const tl = front[0], br = front[Math.floor(front.length / 2)]
    const g = ctx.createLinearGradient(tl[0], tl[1], br[0], br[1]); g.addColorStop(0, '#2a2f52'); g.addColorStop(0.5, '#0f1222'); g.addColorStop(1, '#1b1f3a')
    ctx.fillStyle = g; poly(ctx, front); ctx.fill()
    ctx.restore()
    ctx.save(); ctx.strokeStyle = 'rgba(190,200,255,0.35)'; ctx.lineWidth = 2; poly(ctx, front); ctx.stroke(); ctx.restore()
    // the screen: the post, in perspective
    const scr = rrPts(PH.sw, PH.sh, 44, 8).map(([u, v]) => P(ps, u, v, -0.5))
    ctx.save(); poly(ctx, scr); ctx.clip()
    ctx.fillStyle = '#0b0d1c'; ctx.fill()
    planeImg(ctx, seed.at(Math.max(0, lt)), ps, -PH.sw / 2, -PH.sh / 2, PH.sw, PH.sh, 26, -0.5)
    // glass glare sliding with the turn
    const gx = K.lerp(-0.9, 0.9, K.clamp((ps.yaw + 0.6) / 0.9))
    const a = P(ps, PH.sw * (gx - 0.6), -PH.sh / 2), b = P(ps, PH.sw * (gx + 0.2), PH.sh / 2)
    const gl = ctx.createLinearGradient(a[0], a[1], b[0], b[1])
    gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.45, 'rgba(255,255,255,0.13)'); gl.addColorStop(0.55, 'rgba(255,255,255,0.03)'); gl.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H)
    // the snare: a bright glint wipes across the glass
    const sn = M.on() ? SONG.last('snare', 0.5) : null, sa = sn ? M.now() - sn.t : 9
    if (sa < 0.2) {
      const u = sa / 0.2, ga = P(ps, PH.sw * (u * 2.4 - 1.5), -PH.sh / 2), gb = P(ps, PH.sw * (u * 2.4 - 0.9), PH.sh / 2)
      const gg = ctx.createLinearGradient(ga[0], ga[1], gb[0], gb[1])
      gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, `rgba(255,255,255,${(0.42 * sn.s * (1 - u) * Math.min(1, sa / 0.03)).toFixed(3)})`); gg.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H)
    }
    // the format tags: each chip lands on the glass as the post's format; the next one knocks it off
    const cur = LANDS.reduce((a, T, i) => (t >= T ? i : a), -1)
    for (let i = Math.max(0, cur - 1); i <= cur; i++) {
      if (i < 0) continue
      const d = t - LANDS[i]
      let sx = 1, sy = 1, du = 0, dv = 0, al = 1, rot = 0
      if (i < LANDS.length - 1 && t >= LANDS[i + 1] - 0.09) {
        // the slot clears just before the next chip hits it
        const e = K.at(t, LANDS[i + 1] - 0.09, 0.1, 'in')
        if (e >= 1) continue
        sx = sy = 1 - 0.3 * e; dv = 110 * e; al = 1 - e
      } else if (i === cur) { const sp = K.spring(d, 3.2, 0.45); sx = 1 + 0.18 * (1 - sp); sy = 1 - 0.18 * (1 - sp) }
      tagOnGlass(ctx, ps, CHIP_OF_LAND[i], sx, sy, du, dv, al, rot)
    }
    // the impact on the glass: a ripple out from the tag (kept to the top of the screen) and a glint across it
    LANDS.forEach((T, i) => {
      const d = t - T
      if (d < 0 || d > 0.5) return
      const col = tintOf(FCOL[CHIP_OF_LAND[i]])
      for (const [lag, wgt] of [[0, 7], [0.07, 3]]) {
        const q = K.clamp((d - lag) / 0.42)
        if (q <= 0 || q >= 1) continue
        const R = 60 + 260 * K.ease.out(q), ring = []
        for (let j = 0; j < 48; j++) { const an = (j / 48) * K.TAU; ring.push(P(ps, Math.cos(an) * R, SLOT_V + Math.sin(an) * R * 0.42, -1.5)) }
        ctx.save(); ctx.globalAlpha = (1 - q) * 0.85; ctx.strokeStyle = col; ctx.lineWidth = wgt * (1 - q * 0.6); poly(ctx, ring); ctx.stroke(); ctx.restore()
      }
      const gq = K.clamp(d / 0.2)
      if (gq < 1) {
        const ga = P(ps, PH.sw * (gq * 2.2 - 1.4), -PH.sh / 2), gb = P(ps, PH.sw * (gq * 2.2 - 0.9), PH.sh / 2)
        const gg = ctx.createLinearGradient(ga[0], ga[1], gb[0], gb[1])
        gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, `rgba(255,255,255,${(0.32 * (1 - gq)).toFixed(3)})`); gg.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H)
      }
    })
    ctx.restore()
    // the island
    const isl = rrPts(118, 32, 16, 4).map(([u, v]) => P(ps, u, v - PH.sh / 2 + 30, -1))
    ctx.fillStyle = '#05060f'; poly(ctx, isl); ctx.fill()
    return glow
  }

  // ---------- the orbit: a ring round the phone, tipped toward us and rolled
  const ORB = { R: 420, RZ: 600, tilt: 0.3, roll: -0.26 }
  function ringPt(phi, R, cen) {
    const rz = R * ORB.RZ / ORB.R
    let x = R * Math.cos(phi), y = -rz * Math.sin(phi) * Math.sin(ORB.tilt), z = rz * Math.sin(phi) * Math.cos(ORB.tilt)
    const c = Math.cos(ORB.roll), s = Math.sin(ORB.roll), t = x * c - y * s
    y = x * s + y * c; x = t
    return [cen.x + x, cen.y + y, cen.z + z]
  }
  const cenOf = (ps) => ({ x: ps.x, y: ps.y + 10, z: ps.z })
  const BURST = 0.4 // local time the chips burst out
  // a chip's angle on the ring: a fast spin as they burst out, settling to a steady orbit
  // a chip's angle on the ring: a fast spin-out as they burst (done by ~13.95), then a slow drift, so the names
  // stay sharp through the motion blur
  const phiOf = (k, lt) => -K.TAU * (0.035 * lt + 0.55 * K.ease.outQuart(K.at(lt, BURST, 0.55, 'linear'))) + (k * K.TAU) / FMT.length + 0.62
  const phiSpeed = (lt) => Math.abs(phiOf(0, lt + 0.01) - phiOf(0, lt - 0.01)) / 0.02
  // which chip flies at each landing: the one furthest behind when it leaves — the hidden ones go first (up over
  // the phone's top), the readable front ones stay longest
  const CHIP_OF_LAND = (() => {
    const left = FMT.map((_, k) => k), out = []
    LANDS.forEach((T) => {
      const lt = T - FLY - S0
      let best = -1, bz = 1e9
      for (const k of left) { const z = -Math.sin(phiOf(k, lt)); if (z < bz) { bz = z; best = k } }
      out.push(best); left.splice(left.indexOf(best), 1)
    })
    return out
  })()
  const LAND_OF_CHIP = FMT.map((_, k) => LANDS[CHIP_OF_LAND.indexOf(k)])

  // a format chip, a billboard: glass pill, colour tile with a play mark, the name
  function chip(ctx, k, x, y, sc, o = {}) {
    if (sc <= 0.01) return
    const name = FMT[k], size = 32
    ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(sc * (o.sx || 1), sc * (o.sy || 1))
    ctx.globalAlpha *= o.alpha ?? 1
    ctx.font = `600 ${size}px "Inter", sans-serif`
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.01 * size + 'px'
    const tw = ctx.measureText(name).width, w = tw + 104, h = 70
    if (o.halo > 0.02) { ctx.save(); ctx.shadowColor = FCOL[k]; ctx.shadowBlur = 46; ctx.fillStyle = K.rgba(FCOL[k], 0.75 * o.halo); rr(ctx, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, h / 2 + 12); ctx.fill(); ctx.restore() } // v3: a note lights it
    ctx.shadowColor = o.glow ? K.rgba(FCOL[k], 0.7) : 'rgba(20,28,90,0.22)'; ctx.shadowBlur = o.glow ? 34 : 22; ctx.shadowOffsetY = o.glow ? 0 : 8
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, 'rgba(255,255,255,0.98)'); g.addColorStop(1, 'rgba(240,243,255,0.95)')
    ctx.fillStyle = g; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.strokeStyle = K.rgba(FCOL[k], 0.35); ctx.lineWidth = 2; rr(ctx, -w / 2 + 1, -h / 2 + 1, w - 2, h - 2, h / 2 - 1); ctx.stroke()
    const ix = -w / 2 + 12
    const ig = ctx.createLinearGradient(0, -23, 0, 23); ig.addColorStop(0, K.mixColor(FCOL[k], '#ffffff', 0.2)); ig.addColorStop(1, FCOL[k])
    ctx.fillStyle = ig; rr(ctx, ix, -23, 46, 46, 23); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(ix + 18, -10); ctx.lineTo(ix + 32, 0); ctx.lineTo(ix + 18, 10); ctx.closePath(); ctx.fill()
    ctx.fillStyle = B.ink; ctx.textBaseline = 'middle'; ctx.fillText(name, ix + 60, 2)
    if (o.tint > 0) { ctx.globalCompositeOperation = 'source-atop'; ctx.globalAlpha = o.tint; ctx.fillStyle = '#e4e8ff'; ctx.fillRect(-w / 2, -h / 2, w, h) }
    ctx.restore()
  }
  C.chip = chip

  // where chip k is at time t: world x, y, z, its scale, and how far through its flight (0 = still orbiting)
  function chipAt(k, t, ps) {
    const lt = t - S0, cen = cenOf(ps)
    const b = K.spring(lt - BURST - k * 0.035, 2.0, 0.6)
    if (b <= 0.001) return null
    const L = LAND_OF_CHIP[k], dep = L - FLY
    if (t < dep) {
      const [x, y, z] = ringPt(phiOf(k, lt), ORB.R * b, cen)
      return { x, y, z: z + (1 - K.clamp(b)) * 60, sc: 0.35 + 0.65 * K.clamp(b), fly: 0 }
    }
    if (t >= L) return null
    // leaving: a short wind-up outward, then it shoots (accelerating) along an arc into the screen
    const q = (t - dep) / FLY
    const s0 = ringPt(phiOf(k, dep - S0), ORB.R, cen)
    const wind = q < 0.25 ? Math.sin(Math.PI * (q / 0.25)) : 0
    const e = Math.pow(K.clamp((q - 0.12) / 0.88), 1.7)
    // it swoops out at the camera (big, close) and dives into the screen
    const tgt = slotWorld(ps)
    const behind = s0[2] > ps.z + 4
    // from behind: up over the phone's top edge and down onto the glass; from the front: a swoop across the front
    // of the phone at the camera (kept near the centre line so it stays in frame as it nears us)
    const ctl = behind ? [tgt[0] + (s0[0] - tgt[0]) * 0.3, tgt[1] - 470, ps.z + 40] : [tgt[0] - 260, (s0[1] + tgt[1]) / 2 + 140, -1500]
    const bz = (i) => (1 - e) * (1 - e) * s0[i] + 2 * (1 - e) * e * ctl[i] + e * e * tgt[i]
    const out = 1 + wind * 0.07
    return { x: cen.x + (bz(0) - cen.x) * out, y: cen.y + (bz(1) - cen.y) * out, z: bz(2), sc: K.lerp(1 + wind * 0.12, TAGS, e * e), fly: Math.max(0.001, e), q }
  }

  // ---------- the montage's last frame, blowing past the camera
  const MOS = (() => {
    const cols = 12, rows = 7, cw = 144, ch = 81, gx = 12, gy = 12, out = [], all = TILES.concat(MONTAGE), r = K.rng('c-mos')
    const x0 = W / 2 - (cols * cw + (cols - 1) * gx) / 2, y0 = H / 2 - (rows * ch + (rows - 1) * gy) / 2
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = x0 + i * (cw + gx) + cw / 2, y = y0 + j * (ch + gy) + ch / 2, dx = x - W / 2, dy = y - H / 2, d = Math.hypot(dx / W, dy / H)
      const a = Math.atan2(dy, dx) + (r() - 0.5) * 0.5
      out.push({ x, y, w: cw, h: ch, d, a, name: all[(i * 7 + j * 5) % all.length], spin: (r() - 0.5) * 1.2, off: r() * 3 })
    }
    return out
  })()
  // v3: the drop (16.60 in song time = this scene's start). Full strength from its first instant — no attack — so the
  // first frame of the scene is already hit; it dies over 0.15 s of song.
  const DROP = 16.6
  const dropHit = () => { const d = window.SONG ? SONG.now - DROP : 9; return d >= 0 && d < 0.15 ? Math.pow(1 - d / 0.15, 2) : 0 }
  // the montage's own frame, drawn on past its end (as the kit does under a transition), cut into tiles
  let MOFF = null
  function montageFrame(t) {
    const sc = K.film.scenes.find((s) => s.id === 'montage')
    if (!sc || String(sc.draw).includes("slam(ctx, s.t, 'montage'")) return null // still the placeholder
    if (!MOFF) { MOFF = document.createElement('canvas'); MOFF.width = W; MOFF.height = H }
    const g = MOFF.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'
    g.save(); sc.draw(g, { t, lt: t - sc.start, dur: sc.end - sc.start, p: 1, W, H, id: sc.id }); g.restore()
    return MOFF
  }
  const SHARDS = (() => {
    const out = [], r = K.rng('c-shards'), S = 120
    for (let j = 0; j < H / S; j++) for (let i = 0; i < W / S; i++) {
      const x = i * S + S / 2, y = j * S + S / 2, dx = x - W / 2, dy = y - H / 2
      out.push({ x, y, S, d: Math.hypot(dx / W, dy / H) + r() * 0.06, a: Math.atan2(dy, dx) + (r() - 0.5) * 0.6, spin: (r() - 0.5) * 1.6 })
    }
    return out
  })()
  function drawMosaic(ctx, t) {
    const lt = t - S0
    if (lt > 0.62) return
    // the camera punches through it — and on the drop itself (its very first frame) the mosaic is hit: a jolt
    const zoom = (1 + 0.5 * K.at(lt, 0, 0.5, 'out')) * (1 + 0.08 * dropHit())
    const src = montageFrame(t)
    if (src) {
      // the centre goes first: a hole opens where the phone comes through, and the rest blows outward past us
      const live = SHARDS.map((c) => ({ c, p: K.at(lt, c.d * 0.26, 0.4, (x) => Math.pow(x, 1.25)) })).filter((e) => e.p < 1).sort((u, v) => u.p - v.p)
      for (const { c, p } of live) {
        const travel = 1700 * Math.pow(p, 1.4), sc = (1 + 2.1 * p) * zoom, hs = c.S / 2
        const x = W / 2 + (c.x - W / 2) * zoom + Math.cos(c.a) * travel, y = H / 2 + (c.y - H / 2) * zoom + Math.sin(c.a) * travel
        ctx.save(); ctx.translate(x, y); ctx.rotate(c.spin * p); ctx.scale(sc, sc); ctx.globalAlpha = 1 - K.clamp((p - 0.75) / 0.25)
        if (p > 0.02) { ctx.save(); ctx.shadowColor = `rgba(20,28,90,${(0.3 * K.clamp(p * 5)).toFixed(3)})`; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; ctx.fillStyle = '#e8ecff'; ctx.fillRect(-hs, -hs, c.S, c.S); ctx.restore() }
        ctx.drawImage(src, c.x - hs, c.y - hs, c.S, c.S, -hs, -hs, c.S, c.S)
        if (p > 0.02) { ctx.strokeStyle = `rgba(255,255,255,${(0.8 * K.clamp(p * 5)).toFixed(3)})`; ctx.lineWidth = 2; ctx.strokeRect(-hs + 1, -hs + 1, c.S - 2, c.S - 2) }
        ctx.restore()
      }
      return
    }
    for (const c of MOS) {
      const p = K.at(lt, c.d * 0.22, 0.36, (x) => x * x)
      if (p >= 1) continue
      const travel = 1500 * p * p, sc = (1 + 1.6 * p) * zoom
      const x = W / 2 + (c.x - W / 2) * zoom + Math.cos(c.a) * travel, y = H / 2 + (c.y - H / 2) * zoom + Math.sin(c.a) * travel
      const img = (MONTAGE.includes(c.name) ? mclip[c.name] : clip[c.name]).at(t - 10.8 + c.off, true)
      ctx.save(); ctx.translate(x, y); ctx.rotate(c.spin * p); ctx.scale(sc, sc); ctx.globalAlpha = 1 - K.clamp((p - 0.7) / 0.3)
      ctx.shadowColor = 'rgba(20,28,90,0.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6
      ctx.fillStyle = '#dfe4ff'; rr(ctx, -c.w / 2, -c.h / 2, c.w, c.h, 10); ctx.fill(); ctx.shadowColor = 'transparent'
      K.drawImg(ctx, img, -c.w / 2, -c.h / 2, c.w, c.h, 'cover', 10)
      ctx.restore()
    }
  }

  // ---------- the melody on the ring: every note lights a bead of light on the orbit, which runs a little way round
  // it and fades. With pitch (B) the bead sits high on the ring for a high note and low for a low one (alternating
  // sides), so the ring draws the tune; without (A) its place comes from the note's time and its size from its
  // strength. The chip nearest a new bead glints.
  const noteAngle = (h) => {
    const p = M.mp01(h), side = M.h01(h.t, 7) < 0.5 ? -1 : 1
    return -Math.PI / 2 + side * (p != null ? 0.06 + 0.88 * p : 0.15 + 0.7 * M.h01(h.t, 3)) * Math.PI
  }
  const BEAD = 0.55, TRACK = 1.55 // the beads run on the outer ring, clear of the chips' names
  function beads(ctx, t, ps, half) {
    if (!M.on()) return
    const now = M.now(), cen = cenOf(ps), lt = t - S0
    for (const h of M.notes(now - BEAD, now + 1e-6)) {
      const age = now - h.t, q = age / BEAD
      const a0 = noteAngle(h) + phiOf(0, lt) - phiOf(0, lt - age) // it rides the ring's drift
      const run = -0.55 * K.ease.out(q) // and runs on round the ring the way the chips go
      const phi = a0 + run, front = Math.sin(phi) < 0
      if ((half === 'front') !== front) continue
      const P0 = proj(...ringPt(phi, ORB.R * TRACK, cen)), size = (14 + 14 * h.s) * P0[2] * (1 - 0.4 * q)
      const al = Math.min(1, age / 0.03) * (1 - q) * (front ? 1 : 0.6)
      ctx.save(); ctx.globalAlpha = al; ctx.lineCap = 'round'
      // its streak back along the ring
      ctx.strokeStyle = 'rgba(74,91,255,0.75)'; ctx.lineWidth = size * 0.8; ctx.beginPath()
      for (let j = 0; j <= 8; j++) { const pp = proj(...ringPt(phi + (0.2 * j) / 8, ORB.R * TRACK, cen)); j ? ctx.lineTo(pp[0], pp[1]) : ctx.moveTo(pp[0], pp[1]) }
      ctx.stroke()
      const g = ctx.createRadialGradient(P0[0], P0[1], 0, P0[0], P0[1], size * 2.8)
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.28, 'rgba(255,255,255,0.95)'); g.addColorStop(0.42, 'rgba(74,91,255,0.9)'); g.addColorStop(1, 'rgba(74,91,255,0)')
      ctx.fillStyle = g; ctx.fillRect(P0[0] - size * 3, P0[1] - size * 3, size * 6, size * 6)
      // the ping: a ring opening round the note as it sounds
      const pq = K.clamp(age / 0.3)
      if (pq < 1) { ctx.globalAlpha = Math.min(1, age / 0.03) * (1 - pq) * 0.9; ctx.strokeStyle = '#4a5bff'; ctx.lineWidth = 5 * (1 - pq) + 1.5; ctx.beginPath(); ctx.arc(P0[0], P0[1], size * (1.2 + 4 * K.ease.out(pq)), 0, K.TAU); ctx.stroke() }
      ctx.restore()
    }
  }
  function chipGlint(k, t) {
    if (!M.on()) return 0
    const now = M.now(), lt = t - S0
    let g = 0
    for (const h of M.notes(now - 0.3, now + 1e-6)) {
      const age = now - h.t
      const a = noteAngle(h) + phiOf(0, lt) - phiOf(0, lt - age)
      let d = Math.abs(((phiOf(k, lt) - a) % K.TAU + K.TAU * 1.5) % K.TAU - Math.PI)
      if (d < 0.5) g = Math.max(g, Math.min(1, age / 0.03) * Math.pow(1 - age / 0.3, 1.5) * (1 - 0.5 * d / 0.5))
    }
    return g
  }

  // ---------- the scene
  const DUST = (() => { const r = K.rng('c-dust'), out = []; for (let i = 0; i < 26; i++) out.push({ x: (r() - 0.5) * 3600, y: (r() - 0.5) * 2000, z: 600 + r() * 2600, s: 40 + r() * 90, rot: r() * 6, v: (r() - 0.5) * 0.6 }); return out })()
  function drawFormats(ctx, t) {
    const lt = t - S0, ps = pose(t), cen = cenOf(ps)
    const [pcx, pcy] = proj(ps.x, ps.y, ps.z)
    const bass = M.env('bass', 0.55, 0, 0.06), kick = M.env('kick', 0.22, 0.5)
    const snare = M.env('snare', 0.26, 0.5, 0.02)
    mist(ctx, { glows: [[pcx, pcy, 900 + 160 * bass, `rgba(74,91,255,${(0.26 + 0.2 * bass).toFixed(3)})`], [180, 1000, 700, 'rgba(139,92,246,0.14)'], [1900, 120, 500, 'rgba(14,165,164,0.08)']] })
    // the snare: a white bloom bursts out behind the phone
    if (snare > 0.01) { const g = ctx.createRadialGradient(pcx, pcy, 0, pcx, pcy, 1100); g.addColorStop(0, `rgba(255,255,255,${(0.85 * snare).toFixed(3)})`); g.addColorStop(0.45, `rgba(255,255,255,${(0.45 * snare).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H) }
    // far glass cards drifting in depth (parallax behind everything)
    for (const d of DUST) {
      const [x, y, k] = proj(d.x - lt * 140, d.y, d.z - lt * 260)
      const s = d.s * k
      ctx.save(); ctx.translate(x, y); ctx.rotate(d.rot + lt * d.v); ctx.globalAlpha = 0.5 * K.clamp(lt * 3)
      ctx.strokeStyle = 'rgba(74,91,255,0.35)'; ctx.lineWidth = 1.5; ctx.fillStyle = 'rgba(255,255,255,0.35)'
      rr(ctx, -s / 2, -s * 0.28, s, s * 0.56, 6 * k); ctx.fill(); ctx.stroke(); ctx.restore()
    }
    // the ring and its shockwaves, in the orbit's plane
    const ringA = K.clamp((lt - BURST) * 3)
    const ringLine = (R, alpha, lw, half) => {
      if (alpha <= 0.005) return
      ctx.save(); ctx.strokeStyle = K.rgba('#4a5bff', alpha); ctx.lineWidth = lw; ctx.beginPath()
      let started = false
      for (let j = 0; j <= 96; j++) {
        const phi = (j / 96) * K.TAU, front = Math.sin(phi) < 0
        if ((half === 'back' && front) || (half === 'front' && !front)) { started = false; continue }
        const [x, y, z] = ringPt(phi, R, cen), q = proj(x, y, z)
        if (!started) { ctx.moveTo(q[0], q[1]); started = true } else ctx.lineTo(q[0], q[1])
      }
      ctx.stroke(); ctx.restore()
    }
    ringLine(ORB.R * 1.55, (0.1 + 0.16 * bass) * ringA, 1.5 + 1.5 * bass) // the melody's track; it hums with the bass
    ringLine(ORB.R * 0.62, 0.12 * ringA, 1.5)
    const ringR = ORB.R * K.spring(lt - BURST, 2, 0.6) * (1 + 0.035 * kick), ringW = 3 + 3 * bass + 2 * kick
    ringLine(ringR, (0.35 + 0.3 * kick) * ringA, ringW, 'back')
    for (const T of LAND_T) {
      const d = t - T
      if (d < 0 || d > 0.8) continue
      const q = d / 0.8
      ringLine(80 + 1500 * K.ease.out(q), 0.45 * (1 - q), 6 * (1 - q) + 1)
    }
    // ... and a strong blue shockwave runs out through the orbit's plane
    const sn = M.on() ? SONG.last('snare', 0.5) : null, sa = sn ? M.now() - sn.t : 9
    if (sa >= 0 && sa < 0.42) { const q = sa / 0.42; ringLine(120 + 1700 * K.ease.out(q), 0.85 * (1 - q) * Math.min(1, sa / 0.02) * sn.s, 16 * (1 - q) + 2) }
    // the chips behind the phone, the phone, then the chips in front
    const chips = []
    FMT.forEach((_, k) => { const c = chipAt(k, t, ps); if (c) chips.push({ k, ...c }) })
    const trail = (pts, col, w0, a0) => {
      // a comet tail: a tapering ribbon of light back along the path
      for (let j = 1; j < pts.length; j++) {
        const f = 1 - j / pts.length
        ctx.save(); ctx.strokeStyle = K.rgba(col, a0 * f); ctx.lineWidth = Math.max(1, w0 * f); ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(pts[j - 1][0], pts[j - 1][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke(); ctx.restore()
      }
    }
    const drawChip = (c) => {
      const [x, y, kk] = proj(c.x, c.y, c.z)
      const depth = K.clamp((c.z - ps.z) / ORB.RZ) // 1 = far back of the ring
      let rot = 0
      if (c.fly > 0.001) {
        const pts = [[x, y]]
        for (let j = 1; j <= 9; j++) { const g = chipAt(c.k, t - j * 0.014, ps); if (!g) break; const q = proj(g.x, g.y, g.z); pts.push([q[0], q[1]]) }
        trail(pts, FCOL[c.k], 46 * c.sc * kk, 0.55)
        trail(pts.slice(0, 6), '#ffffff', 16 * c.sc * kk, 0.8)
      } else {
        // banked along the ring, with a light trail behind it while the ring spins fast
        const lt = t - S0, sp = phiSpeed(lt), cen2 = cenOf(ps)
        const a1 = ringPt(phiOf(c.k, lt) + 0.04, ORB.R, cen2), a0 = ringPt(phiOf(c.k, lt) - 0.04, ORB.R, cen2)
        const p1 = proj(...a1), p0 = proj(...a0)
        let ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0])
        if (ang > Math.PI / 2) ang -= Math.PI
        if (ang < -Math.PI / 2) ang += Math.PI
        rot = K.clamp(ang, -0.5, 0.5) * 0.5
        const arc = Math.min(1.1, sp * 0.07)
        const pts = []
        for (let j = 0; j <= 8; j++) { const q = proj(...ringPt(phiOf(c.k, lt) + (arc * j) / 8, ORB.R * K.clamp(K.spring(lt - BURST - c.k * 0.035, 2.0, 0.6), 0, 1.2), cen2)); pts.push([q[0], q[1]]) }
        trail(pts, FCOL[c.k], 14 * kk, 0.35 * (1 - depth * 0.5))
      }
      const gl = c.fly ? 0 : chipGlint(c.k, t)
      chip(ctx, c.k, x, y, c.sc * kk * (1 + 0.16 * gl), { tint: depth * 0.45 * (1 - gl), glow: c.fly > 0.05, halo: gl, rot })
    }
    beads(ctx, t, ps, 'back')
    chips.filter((c) => c.z > ps.z + 4).sort((a, b) => b.z - a.z).forEach(drawChip)
    drawPhone(ctx, t, ps)
    ringLine(ringR, (0.45 + 0.3 * kick) * ringA, ringW, 'front')
    beads(ctx, t, ps, 'front')
    chips.filter((c) => c.z <= ps.z + 4).sort((a, b) => b.z - a.z).forEach(drawChip)
    // the montage's mosaic blowing past (on top, for the first beat)
    drawMosaic(ctx, t)
    // the drop's impact: a white flash that starts on the scene's first frame and dies over 0.15 s
    const dh = dropHit()
    if (dh > 0.002) { ctx.save(); ctx.fillStyle = `rgba(255,255,255,${(0.45 * dh).toFixed(3)})`; ctx.fillRect(0, 0, W, H); ctx.restore() }
    // the words
    const sz = 124
    slam(ctx, t, 'Formats', 112, 318, 13.8, { size: sz })
    ctx.save(); ctx.font = `800 ${sz}px "Inter", sans-serif`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.04 * sz + 'px'
    const wThat = ctx.measureText('that ').width; ctx.restore()
    slam(ctx, t, 'that', 112, 448, 14.0, { size: sz })
    slam(ctx, t, 'earn.', 112 + wThat, 448, 14.0, { size: sz, color: B.blue })
    // "22 proven formats." — the 22 punches as the last two chips land
    const p22 = Math.sin(Math.PI * K.clamp((t - 16.2) / 0.36)) // a smooth punch (no step for the blur to double)
    ctx.save(); ctx.translate(118, 540); ctx.scale(1 + 0.12 * p22, 1 + 0.12 * p22); ctx.translate(-118, -540)
    rise(ctx, t, ['22', 'proven', 'formats.'], 118, 556, 14.4, { size: 58, weight: 800, colors: [B.blue, B.ink, B.ink], step: 0.1 })
    ctx.restore()
    // the credit, under the phone
    const cp = K.spring(lt - 1.4, 2.4, 0.6)
    if (cp > 0.01) pill(ctx, 'Made with MiniMax by the ComfyField team', 1255, 1004, { size: 27, solid: true, dot: true, scale: 0.85 + 0.15 * cp, alpha: K.clamp(cp * 2) })
  }
  C.drawFormats = drawFormats

  K.scene({ id: 'formats', ...span('formats'), draw(ctx, s) { drawFormats(ctx, s.t) } })
})()
