// montage — bars 9–11 (10.8–13.2 s). Out the far side of the portal into a wall of the app's clips. The cells
// change on every eighth in cascading waves: flip left to right, "Every tool on your computer," pops on a glass plate,
// the squares round into circles, flip back, the rows slide, "with your own keys." flips in under it as the circles
// stretch into pills, a diagonal flip; then the wall pulls back to a huge mosaic, and a ripple re-tiles it into the
// grid of frames the formats scene opens on.
;(function () {
  const M0 = span('montage').start, E = (k) => M0 + k * E8
  K.cue(M0, 'montage: burst — out of the portal into a wall of clips', 'hit')
  K.cue(E(1), 'montage: flip — a wave of cells flips, left to right', 'hit')
  K.cue(E(2), 'montage: slam "Every tool on your computer,"', 'hit')
  K.cue(E(3), 'montage: pop — the cells round into circles', 'hit')
  K.cue(E(4), 'montage: flip — a wave flips back, right to left', 'hit')
  K.cue(E(5), 'montage: whoosh — the rows slide', 'hit')
  K.cue(E(6), 'montage: slam "with your own keys." — the circles stretch into pills', 'hit')
  K.cue(E(7), 'montage: flip — a diagonal wave', 'soft')
  K.cue(E(8), 'montage: whoosh — the wall pulls back to a huge mosaic', 'hit')
  K.cue(E(11), 'montage: flip — a ripple re-tiles the mosaic into frames', 'hit')

  const P = 200, C = 176 // world: cell pitch and size
  const ALL = TILES.map((n) => clip[n]).concat(MONTAGE.map((n) => mclip[n]))
  const OFFS = ALL.map((_, k) => (k * 1.37) % 5)
  const CIRC = E(3), PILL = E(6), SLIDE = E(5), PULL = E(8)
  const WAVES = [[E(1), [1, 0.3]], [E(4), [-1, 0.2]], [E(7), [0.55, 0.85]]]
  // the last beat: a ripple from the centre flips the mosaic over into the grid of frames the formats scene opens
  // on (its first frame, cell for cell: 12 x 7 frames of 144 x 81, the same clips and the same moments)
  const RT = E(11) - 0.1, RF = 0.1 // 12.9: the ripple starts; each half-flip
  const ripD = (x, y) => Math.min(1, Math.hypot(x - W / 2, y - H / 2) / 1000) * 0.1
  const GRID = (() => {
    const cols = 12, rows = 7, cw = 144, ch = 81, gx = 12, gy = 12, out = [], all = TILES.concat(MONTAGE), r = K.rng('c-mos')
    const x0 = W / 2 - (cols * cw + (cols - 1) * gx) / 2, y0 = H / 2 - (rows * ch + (rows - 1) * gy) / 2
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      r(); r(); const off = r() * 3, name = all[(i * 7 + j * 5) % all.length]
      out.push({ x: x0 + i * (cw + gx) + cw / 2, y: y0 + j * (ch + gy) + ch / 2, w: cw, h: ch, off, src: MONTAGE.includes(name) ? mclip[name] : clip[name] })
    }
    return out
  })()
  function grid(ctx, t) {
    for (const c of GRID) {
      const p = (t - RT - ripD(c.x, c.y) - RF * 0.8) / RF
      if (p <= 0) continue
      const img = c.src.at(t - 10.8 + c.off, true)
      if (!img) continue
      const fx = Math.sin((Math.PI / 2) * Math.min(1, p))
      ctx.save(); ctx.translate(c.x, c.y); ctx.scale(fx, 1)
      ctx.shadowColor = 'rgba(20,28,90,0.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6
      ctx.fillStyle = '#dfe4ff'; rr(ctx, -c.w / 2, -c.h / 2, c.w, c.h, 10); ctx.fill(); ctx.shadowColor = 'transparent'
      K.drawImg(ctx, img, -c.w / 2, -c.h / 2, c.w, c.h, 'cover', 10)
      if (p < 1) { ctx.fillStyle = `rgba(14,18,60,${0.5 * (1 - fx)})`; rr(ctx, -c.w / 2, -c.h / 2, c.w, c.h, 10); ctx.fill() }
      ctx.restore()
    }
  }
  const FD = 0.24 // one flip
  const mod = (a, n) => ((a % n) + n) % n

  // the camera: arrives moving forward out of the portal and settles close; kicks on the big beats; then pulls
  // far back (log-space zoom, so the speed reads even) to the mosaic and keeps drifting out
  function cam(t) {
    const arrive = K.spring(t - M0, 1.3, 0.82)
    const pull = K.at(t, PULL - 0.04, 0.62, 'inOut')
    const zNear = K.lerp(1.25, 2.15, arrive) * (1 + 0.045 * K.pulse(t, [CIRC, PILL], 0.35))
    const zFar = 0.37 * (1 - 0.1 * K.at(t, PULL + 0.55, 1.2, 'out'))
    const z = Math.exp(K.lerp(Math.log(zNear), Math.log(zFar), pull))
    const rot = K.lerp(-0.2, -0.07, arrive) * (1 - pull) + 0.03 * pull - 0.01 * (t - M0)
    const lt = t - M0
    return { z, rot, x: K.lerp(-110 + lt * 70, 0, pull), y: K.lerp(70 - lt * 30, 0, pull) }
  }
  const toScreen = (c, x, y) => { const dx = (x - c.x) * c.z, dy = (y - c.y) * c.z, cs = Math.cos(c.rot), sn = Math.sin(c.rot); return [W / 2 + dx * cs - dy * sn, H / 2 + dx * sn + dy * cs] }
  const toWorld = (c, sx, sy) => { const dx = sx - W / 2, dy = sy - H / 2, cs = Math.cos(-c.rot), sn = Math.sin(-c.rot); return [c.x + (dx * cs - dy * sn) / c.z, c.y + (dx * sn + dy * cs) / c.z] }
  const CAMS = new Map() // the camera at each wave's time (fixed, so the cascade's delays don't wobble)
  const camAt = (T) => { if (!CAMS.has(T)) CAMS.set(T, cam(T)); return CAMS.get(T) }

  const rowShift = (j, t) => { const d = mod(j, 2) ? 1 : -1; return d * P * K.spring(t - SLIDE - mod(j, 5) * 0.022, 2.3, 0.6) }

  // v3 · the melody plays the wall: every note strikes one cell — it pops forward, flips to a new clip, lights up
  // and throws a ring of light. Under the notes method the cell follows the pitch: low notes lower left, high notes
  // upper right (the words sit in the middle, so the keyboard runs below and above them) — the wall plays the tune.
  // Without pitch (volume method) a stable hash of the note's time places it. The struck cell is fixed at the
  // note's moment (the camera then), so it travels with the wall.
  const NOTE_FD = 0.2
  let NOTES = null // this frame's struck cells: "i,j" -> [hits]
  const noteCell = (h) => K.memo('bb-notecell' + h.t.toFixed(3) + ':' + (h.p == null ? '-' : h.p), () => {
    const n = BB.note01(h), tx = K.lerp(190, 1730, n), ty = n < 0.5 ? K.lerp(930, 790, n * 2) : K.lerp(290, 150, (n - 0.5) * 2)
    const v = BB.v2(h.t), c = cam(v), [wx, wy] = toWorld(c, tx, ty)
    const j = Math.round(wy / P)
    let i = Math.round((wx - rowShift(j, v)) / P)
    if (v > PILL - 0.05 && mod(i + mod(j, 2), 2) === 1) i -= 1 // a right half folds into its pill: strike the pill
    return i + ',' + j
  })
  function struck() {
    const now = BB.now(), from = K.memo('bb-montage-from', () => BB.song(M0) - 0.05), map = new Map()
    for (const h of BB.melody(from, now + 1e-6)) { const k = noteCell(h); if (!map.has(k)) map.set(k, []); map.get(k).push(h) }
    return map
  }

  // one cell's state: which clip (each flip swaps it), its flip, its shape
  function cellState(i, j, t, wx, wy) {
    let count = 0, flip = 0, lit = 0, ring = -1
    for (let w = 0; w < WAVES.length; w++) {
      const [T, dir] = WAVES[w], c = camAt(T)
      if (t < T - 0.05) break
      const rx = (wx - c.x) * c.z, ry = (wy - c.y) * c.z
      let delay
      if (dir) { const m = Math.hypot(dir[0], dir[1]); delay = ((K.clamp((rx * dir[0] + ry * dir[1]) / m / 1150, -1, 1) + 1) / 2) * 0.24 }
      else delay = Math.min(0.4, Math.hypot(rx, ry) / 1500 * 0.36)
      if (mod(K.hash(i + ':' + j + ':' + w), 10) < 2) continue // a few cells sit a wave out
      const p = (t - T - delay) / FD
      if (p >= 0.5) count++
      if (p > 0 && p < 1) flip = p
    }
    const hs = NOTES && NOTES.get(i + ',' + j)
    if (hs) for (const h of hs) { const a = BB.now() - h.t; if (a >= NOTE_FD / 2) count++; if (a >= 0 && a < NOTE_FD) flip = a / NOTE_FD; if (a >= 0 && a < 0.55) { lit = Math.max(lit, h.s * (1 - a / 0.55)); ring = a } }
    const c3 = camAt(CIRC), d3 = Math.hypot((wx - c3.x) * c3.z, (wy - c3.y) * c3.z) / 1200
    const round = K.spring(t - CIRC - d3 * 0.16, 2.6, 0.55)
    const c6 = camAt(PILL), d6 = Math.hypot((wx - c6.x) * c6.z, (wy - c6.y) * c6.z) / 1200
    const pill = K.spring(t - PILL - d6 * 0.16, 2.3, 0.62)
    return { clip: ALL[mod(K.hash(i + '|' + j + '|' + count), ALL.length)], k: mod(K.hash(i + '|' + j + '|' + count), ALL.length), flip, round, pill, lit, ring }
  }

  // the wall at time t (also drawn inside the portal's opening)
  function wall(ctx, t) {
    // v3 · the bass makes the wall throb out from the centre (and its light glow under it); the kick punches the camera
    const now = BB.now(), throb = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => BB.bass(0.5, now - k * 0.05)), kick = BB.pulse('kick', 0.26, 0.5)
    mist(ctx, { glows: [[W * 0.5, H * 0.5, 900 + 200 * throb[0], `rgba(74,91,255,${0.18 + 0.22 * throb[0]})`], [W * 0.1, H * 0.95, 600, 'rgba(139,92,246,0.12)']] })
    NOTES = struck()
    const late = []
    const c0 = cam(t), c = { ...c0, z: c0.z * (1 + 0.03 * kick) }, m = 260
    const pts = [toWorld(c, -m, -m), toWorld(c, W + m, -m), toWorld(c, W + m, H + m), toWorld(c, -m, H + m)]
    const i0 = Math.floor(Math.min(...pts.map((p) => p[0])) / P) - 2, i1 = Math.ceil(Math.max(...pts.map((p) => p[0])) / P) + 2
    const j0 = Math.floor(Math.min(...pts.map((p) => p[1])) / P) - 1, j1 = Math.ceil(Math.max(...pts.map((p) => p[1])) / P) + 1
    const near = c.z > 0.9
    // two passes: the right halves of the pill pairs first (they shrink under their partners), then the rest
    for (const pass of [1, 0]) {
      for (let j = j0; j <= j1; j++) {
        const sh = rowShift(j, t)
        for (let i = i0; i <= i1; i++) {
          const right = mod(i + mod(j, 2), 2) === 1
          if ((right ? 1 : 0) !== pass) continue
          const wx = i * P + sh, wy = j * P
          const st = cellState(i, j, t, wx, wy)
          const pl = Math.max(0, st.pill)
          let w = C, h = C, cx = wx, sc = 1
          if (right) { sc = Math.max(0, 1 - pl); cx -= P * 0.5 * Math.min(1, pl) } else { w = C + P * pl; cx += (P * pl) / 2 }
          if (sc <= 0.01) continue
          const [sx, sy] = toScreen(c, cx, wy), rad = (Math.max(w, h) / 2 + 20) * c.z
          if (sx < -rad || sx > W + rad || sy < -rad || sy > H + rad) continue
          const img = st.clip.at(t + OFFS[st.k] + (mod(i * 3 + j, 2) ? 1.7 : 0), true)
          if (!img) continue
          const r = K.lerp(18, C / 2, K.clamp(st.round)) * Math.min(1, sc + 0.3)
          let fx = st.flip ? Math.abs(Math.cos(Math.PI * st.flip)) : 1, pop = st.flip ? 1 + 0.1 * Math.sin(Math.PI * st.flip) : 1
          if (t > RT) { const po = (t - RT - ripD(sx, sy)) / RF; if (po >= 1) continue; if (po > 0) { fx = Math.cos((Math.PI / 2) * po); st.flip = 0.5 * po } }
          pop *= 1 + 0.06 * throb[Math.min(7, Math.floor(Math.hypot(sx - W / 2, sy - H / 2) / 230))] + 0.28 * st.lit
          const cell = () => {
            if (st.lit > 0.01) { // the struck key's light on the wall round it
              const R0 = (Math.max(w, h) * 0.5 + 36) * c.z * pop, hg = ctx.createRadialGradient(sx, sy, R0 * 0.4, sx, sy, R0 * 1.2)
              hg.addColorStop(0, `rgba(110,128,255,${0.6 * st.lit})`); hg.addColorStop(1, 'rgba(110,128,255,0)')
              ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hg; ctx.fillRect(sx - R0 * 1.3, sy - R0 * 1.3, R0 * 2.6, R0 * 2.6); ctx.restore()
            }
            ctx.save(); ctx.translate(sx, sy); ctx.rotate(c.rot); ctx.scale(c.z * fx * pop * sc, c.z * pop * sc)
            if (near || st.lit > 0.01) { ctx.save(); ctx.shadowColor = st.lit > 0.01 ? `rgba(74,91,255,${0.9 * st.lit})` : 'rgba(20,26,90,0.28)'; ctx.shadowBlur = (24 + 30 * st.lit) * c.z; ctx.shadowOffsetY = 8 * c.z * (1 - st.lit); ctx.fillStyle = '#c9cff5'; rr(ctx, -w / 2 + 4, -h / 2 + 4, w - 8, h - 8, r); ctx.fill(); ctx.restore() }
            BB.cover(ctx, img, -w / 2, -h / 2, w, h, r)
            if (st.flip) { ctx.fillStyle = `rgba(14,18,60,${0.55 * (1 - fx)})`; rr(ctx, -w / 2, -h / 2, w, h, r); ctx.fill() }
            if (st.lit > 0.01) {
              const k = c.z * pop * sc
              ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(95,115,255,${0.62 * st.lit})`; rr(ctx, -w / 2, -h / 2, w, h, r); ctx.fill(); ctx.restore()
              ctx.save(); ctx.shadowColor = 'rgba(120,140,255,1)'; ctx.shadowBlur = 30; ctx.strokeStyle = `rgba(255,255,255,${st.lit})`; ctx.lineWidth = 11 / k; rr(ctx, -w / 2, -h / 2, w, h, r); ctx.stroke(); ctx.restore()
              if (st.ring >= 0) { const q = K.ease.out(st.ring / 0.55), gw = (16 + 190 * q) / k; ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - q)})`; ctx.lineWidth = (8 * (1 - q) + 2) / k; rr(ctx, -w / 2 - gw, -h / 2 - gw, w + gw * 2, h + gw * 2, r + gw); ctx.stroke() }
            }
            ctx.restore()
          }
          if (st.lit > 0.01) late.push(cell); else cell()
        }
      }
    }
    for (const f of late) f() // the struck cells come forward, over their neighbours
    // v3 · the snare: a glint sweeps across the wall
    const sa = BB.age('snare', 0.35)
    if (sa < 0.24) {
      const q = sa / 0.24, x = -400 + q * (W + 800), sn = window.SONG ? SONG.last('snare', 0.35).s : 1
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.transform(1, 0, -0.4, 1, 0, 0)
      const g = ctx.createLinearGradient(x - 160, 0, x + 160, 0)
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${0.42 * sn * (1 - q)})`); g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g; ctx.fillRect(x - 160, 0, 320 + H, H); ctx.restore()
    }
  }

  // the words, each on its own glass plate: "Every tool on your computer," pops on 11.2; on 12.0 it rises to make
  // room and "with your own keys." flips in under it (like the cells); both flip away as the ripple starts
  const L1 = 'Every tool on your computer,', L2 = 'with your own keys.', TS = 84
  function plateLine(ctx, t, text, cy, start, flipIn, color) {
    const a = flipIn ? 1 : K.spring(t - start + 0.07, 3.2, 0.6)
    const f = flipIn ? K.clamp((t - start + 0.05) / 0.16) : 1
    const gone = K.clamp((t - RT - 0.06) / RF) // v3: the song runs this stretch faster — hold the words a little longer
    if (a <= 0.001 || f <= 0 || gone >= 1) return
    const tw = BB.slamW(ctx, text, TS), pw = tw + 110, ph = 150, cx = W / 2
    const fx = Math.sin((Math.PI / 2) * f) * Math.cos((Math.PI / 2) * gone), sc = Math.min(1.12, a)
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc * fx, sc * (1 + 0.08 * Math.sin(Math.PI * f)))
    glass(ctx, -pw / 2, -ph / 2, pw, ph, 40, { fill: 'rgba(255,255,255,0.92)', blur: 60, dy: 22 })
    if (f < 1) { ctx.fillStyle = `rgba(14,18,60,${0.4 * (1 - fx)})`; rr(ctx, -pw / 2, -ph / 2, pw, ph, 40); ctx.fill() }
    ctx.restore()
    ctx.save(); ctx.translate(cx, cy); ctx.scale(fx, 1); ctx.translate(-cx, -cy)
    slam(ctx, t, text, cx, cy + TS * 0.36, start - 0.034, { size: TS, align: 'center', color, from: 1.3 })
    ctx.restore()
  }
  function plate(ctx, t) {
    const up = K.spring(t - PILL + 0.05, 2.6, 0.7) // line 1 rises as line 2 arrives
    plateLine(ctx, t, L1, K.lerp(H / 2, H / 2 - 88, up), E(2), false, B.ink)
    plateLine(ctx, t, L2, H / 2 + 88, PILL, true, B.blue)
  }

  K.scene({
    id: 'montage', ...span('montage'),
    draw(ctx, s) {
      const t = s.t
      const open = K.at(t, M0 - 0.03, 0.3, (x) => x * x)
      if (open < 1) {
        // still in the portal's light: the wall shows through an opening that grows out of it
        const p = BB.portal(ctx, t)
        BB.portalGlow(ctx, t, p, 0.75 + 0.25 * open)
        const hh = 330 + 2500 * open, ww = hh * 0.62, x = K.lerp(p[0], W / 2, 0.6), y = K.lerp(p[1], H / 2, 0.6)
        const arch = () => { ctx.beginPath(); ctx.moveTo(x - ww / 2, y + hh / 2); ctx.lineTo(x - ww / 2, y - hh / 2 + ww / 2); ctx.arc(x, y - hh / 2 + ww / 2, ww / 2, Math.PI, 0); ctx.lineTo(x + ww / 2, y + hh / 2); ctx.closePath() }
        ctx.save(); ctx.shadowColor = 'rgba(190,140,255,1)'; ctx.shadowBlur = 80; ctx.fillStyle = '#efe6ff'; arch(); ctx.fill(); ctx.restore()
        ctx.save(); arch(); ctx.clip(); wall(ctx, t); ctx.restore()
        ctx.save(); ctx.strokeStyle = 'rgba(235,220,255,0.95)'; ctx.lineWidth = 14; ctx.shadowColor = 'rgba(170,110,255,1)'; ctx.shadowBlur = 40; arch(); ctx.stroke(); ctx.restore()
        streaks(ctx, t, x, y, 1 - open, 78, { n: 70 })
      } else wall(ctx, t)
      flash(ctx, t, [M0], { dur: 0.3, amount: 0.3, color: '#f2eaff' })
      if (t > RT) grid(ctx, t)
      plate(ctx, t)
      // a sheen across the mosaic as it lands
      const sw = K.at(t, PULL + 0.45, 0.7, 'inOut')
      if (sw > 0 && sw < 1) {
        const x = -600 + sw * (W + 1200), g = ctx.createLinearGradient(x - 300, 0, x + 300, 0)
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.28)'); g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore()
      }
    },
  })
})()
