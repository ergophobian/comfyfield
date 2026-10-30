// converge — bars 19–21 (22.8–25.2), builder C.
// The paper page breaks into tiles on the downbeat; they flip over in a wave on the eighths (their backs are the
// app's clips and the film's frames) while the whole field starts to wheel round the centre. The dark comes up
// through the cracks. Tiles, clips, model chips, format chips and taco frames from beyond the frame join a
// spiral (a tipped disc, z-sorted), lurching inward on every big beat, faster each time, with light streaks
// behind them — and everything collapses into one point of light at 25.2, where the end card begins.
;(function () {
  const C = (window.CB = window.CB || {})
  const V0 = 22.8, CX = W / 2, CY = H / 2
  K.cue(22.8, 'converge: spin — the page breaks into tiles and starts to wheel', 'hit')
  K.cue(23.0, 'converge: flip — the tiles flip over in a wave', 'soft')
  K.cue(23.4, 'converge: whoosh — the vortex lurches inward', 'hit')
  K.cue(24.0, 'converge: whoosh — faster', 'hit')
  K.cue(24.6, 'converge: whoosh — fastest', 'hit')
  K.cue(24.8, 'converge: rise — everything collapses into a point of light', 'soft')

  // how far everything has fallen in (0 → 1): a lurch on every big beat, each one bigger than the last
  const UK = [[0, 0], [0.6, 0.2, 'out'], [1.2, 0.45, 'out'], [1.8, 0.72, 'out'], [2.25, 1, (x) => x * x]]
  const U = (lt) => K.keys(lt, UK)
  const SPIN = (lt) => K.TAU * (0.06 * lt + 0.2 * lt * lt)
  const TILT = (lt) => 1 - 0.38 * K.at(lt, 0.1, 0.9, 'inOut')
  const ROLL = (lt) => -0.22 * K.at(lt, 0.1, 1.2, 'inOut')

  const MODELS = ['LTX-2.5', 'LTX Video', 'MiniMax H3', 'Wan 2.2', 'HunyuanVideo-Foley']
  const GX = 16, GY = 9, TS = 120
  const ITEMS = (() => {
    const r = K.rng('c-vortex'), out = []
    let k = 0
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
      const x = i * TS + TS / 2 - CX, y = j * TS + TS / 2 - CY
      const ring = Math.max(Math.abs(x) / CX, Math.abs(y) / CY)
      const back = k++ % 5 === 0 ? { kind: 'taco', at: [0.8, 8.4, 11.6, 13.2, 17.2, 19.5, 23.8, 25.8, 28.4, 31.6][k % 10] } : { kind: 'clip', name: TILES[(i * 5 + j * 7) % TILES.length] }
      out.push({ kind: 'page', sx: i * TS, sy: j * TS, r0: Math.hypot(x, y) + 1, th0: Math.atan2(y, x), a: 0.85 + r() * 0.4, flip: V0 + Math.min(3, Math.floor(ring * 3.6)) * 0.2 + r() * 0.04, back, lift: ring * 0.08, tumble: (r() - 0.5) * 3 })
    }
    // from beyond the frame: the app's clips, the film's frames, the model and format chips
    const far = () => 1250 + r() * 900
    TILES.forEach((name, i) => out.push({ kind: 'clip', name, r0: far(), th0: r() * K.TAU, a: 0.9 + r() * 0.3, w: 200, h: 112, at: 1 + r() * 3, tumble: (r() - 0.5) * 2 }))
    MONTAGE.forEach((name, i) => out.push({ kind: 'mclip', name, r0: far(), th0: r() * K.TAU, a: 0.9 + r() * 0.3, w: 180, h: 101, at: 1 + r() * 3, tumble: (r() - 0.5) * 2 }))
    ;[0.8, 7.9, 11.4, 13.6, 17.0, 20.2, 23.6, 25.6, 28.0, 31.4].forEach((at) => out.push({ kind: 'taco', at, r0: far(), th0: r() * K.TAU, a: 0.9 + r() * 0.3, w: 170, h: 170, tumble: (r() - 0.5) * 2 }))
    MODELS.forEach((name) => out.push({ kind: 'model', name, r0: 1000 + r() * 700, th0: r() * K.TAU, a: 0.95 + r() * 0.2, tumble: 0 }))
    ;(C.FMT || []).forEach((name, i) => out.push({ kind: 'fmt', k: i, r0: 1000 + r() * 800, th0: r() * K.TAU, a: 0.95 + r() * 0.2, tumble: 0 }))
    return out
  })()
  const DUST = (() => { const r = K.rng('c-vdust'), out = []; for (let i = 0; i < 700; i++) { const arm = i % 3; out.push({ r0: 40 + Math.pow(r(), 0.7) * 1600, th0: (arm * K.TAU) / 3 + r() * 0.9, a: 0.8 + r() * 0.5, c: r() < 0.6 ? '200,212,255' : r() < 0.5 ? '255,255,255' : '170,140,255', s: 1 + r() * 2.4 }) } return out })()

  // where an item is: screen x, y, its radius now, its angle now, and the depth (sin of the angle, +1 = front)
  function at(it, lt) {
    const u = U(lt), rem = Math.max(0, 1 - u)
    const r = it.r0 * Math.pow(rem, it.a)
    // inner things wheel faster than outer ones (the page shears into arms), and faster still as they fall in
    const th = it.th0 + SPIN(lt) * Math.pow(450 / (r + 150), 0.8) + 0.85 * Math.log(it.r0 / Math.max(it.r0 * 0.015, r))
    const tilt = TILT(lt), ro = ROLL(lt)
    const x = r * Math.cos(th), y = r * Math.sin(th) * tilt, c = Math.cos(ro), s = Math.sin(ro)
    return { x: CX + x * c - y * s, y: CY + x * s + y * c, r, th, d: Math.sin(th) * (1 - tilt) / 0.38 }
  }
  const sizeK = (it, p) => Math.pow(K.clamp(p.r / it.r0), 0.45) * K.clamp(p.r / 26) * (1 + 0.16 * p.d)

  let OFF = null
  function paperNow(t) {
    if (!OFF) { OFF = document.createElement('canvas'); OFF.width = W; OFF.height = H }
    const g = OFF.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'
    C.drawPaperWorld(g, t)
    return OFF
  }

  function drawItem(ctx, it, t, lt, p) {
    const k = sizeK(it, p)
    if (k <= 0.02) return
    const swirl = p.th - it.th0 - SPIN(0)
    ctx.save(); ctx.translate(p.x, p.y)
    if (it.kind === 'page') {
      const lift = K.spring(lt - it.lift, 3, 0.55)
      const fp = K.at(t, it.flip, 0.26, 'inOut'), fx = Math.abs(Math.cos(Math.PI * fp))
      ctx.rotate(swirl * 0.9 + it.tumble * U(lt))
      const s = TS * k * (1 - 0.1 * lift) * (1 - 0.32 * K.at(t, it.flip + 0.2, 0.5, 'inOut')) + 1.2 * (1 - K.clamp(lift * 4))
      ctx.scale(Math.max(0.02, fx), 1)
      if (lift > 0.02) { ctx.fillStyle = 'rgba(0,0,10,0.45)'; ctx.fillRect(-s / 2 + 5, -s / 2 + 7, s, s) }
      if (fp < 0.5) ctx.drawImage(OFF, it.sx, it.sy, TS, TS, -s / 2, -s / 2, s, s)
      else {
        const img = it.back.kind === 'taco' ? taco.at(it.back.at) : clip[it.back.name].at(2.2, true)
        ctx.fillStyle = '#1a1f48'; ctx.fillRect(-s / 2, -s / 2, s, s)
        K.drawImg(ctx, img, -s / 2, -s / 2, s, s, 'cover', 0)
      }
      // the flip's light: the face catches the light as it turns edge-on
      const shine = 1 - fx
      if (shine > 0.05) { ctx.fillStyle = `rgba(255,255,255,${(0.5 * shine).toFixed(3)})`; ctx.fillRect(-s / 2, -s / 2, s, s) }
      if (lift > 0.02) { ctx.strokeStyle = `rgba(255,255,255,${(0.35 * lift).toFixed(3)})`; ctx.lineWidth = 1.5; ctx.strokeRect(-s / 2, -s / 2, s, s) }
    } else if (it.kind === 'clip' || it.kind === 'mclip' || it.kind === 'taco') {
      ctx.rotate(swirl * 0.6 + it.tumble * U(lt))
      const w = it.w * k, h = it.h * k
      const img = it.kind === 'taco' ? taco.at(it.at) : (it.kind === 'clip' ? clip : mclip)[it.name].at(it.at, true)
      ctx.fillStyle = '#1a1f48'; rr(ctx, -w / 2, -h / 2, w, h, 10 * k); ctx.fill()
      K.drawImg(ctx, img, -w / 2, -h / 2, w, h, 'cover', 10 * k)
      ctx.strokeStyle = 'rgba(200,210,255,0.5)'; ctx.lineWidth = 1.5; rr(ctx, -w / 2, -h / 2, w, h, 10 * k); ctx.stroke()
    } else if (it.kind === 'model') {
      ctx.rotate(Math.sin(swirl) * 0.25)
      pill(ctx, it.name, 0, 0, { size: 30, blue: true, dot: true, scale: k * 1.1 })
    } else if (it.kind === 'fmt') {
      ctx.restore()
      C.chip(ctx, it.k, p.x, p.y, k * 0.95, { rot: Math.sin(swirl) * 0.25 })
      return
    }
    ctx.restore()
  }

  // v3: the melody as stars on the spiral. With pitch (B) a note's radius comes from its pitch within this passage
  // (high notes near the core, low ones out on the arms); without it (A) from the note's time, its size from strength.
  const V0S = 24.84, V1S = 26.89
  let VR = null
  const passRange = () => VR || (VR = (() => { const ps = C.M.notes(V0S - 0.2, V1S).filter((h) => h.p != null).map((h) => h.p); return ps.length ? [Math.min(...ps), Math.max(...ps)] : null })())
  function flares(ctx, lt, now, fade) {
    if (!C.M.on() || fade <= 0) return
    ctx.save(); ctx.globalCompositeOperation = 'lighter'
    for (const h of C.M.notes(now - 0.4, now + 1e-6)) {
      const age = now - h.t, q = age / 0.4, r = h.p != null && passRange() ? (h.p - passRange()[0]) / Math.max(1, passRange()[1] - passRange()[0]) : null
      const rad = (r != null ? K.lerp(620, 140, r) : K.lerp(560, 160, C.M.h01(h.t, 5))) * (1 - 0.5 * U(lt))
      const th = C.M.h01(h.t, 9) * K.TAU + SPIN(lt) * 0.8
      const x = CX + Math.cos(th) * rad, y = CY + Math.sin(th) * rad * TILT(lt)
      const a = Math.min(1, age / 0.03) * Math.pow(1 - q, 1.5) * fade, sz = (34 + 40 * h.s) * (1 + 0.5 * q)
      const g = ctx.createRadialGradient(x, y, 0, x, y, sz * 2.2)
      g.addColorStop(0, `rgba(255,255,255,${a.toFixed(3)})`); g.addColorStop(0.25, `rgba(190,200,255,${(0.7 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(74,91,255,0)')
      ctx.fillStyle = g; ctx.fillRect(x - sz * 2.2, y - sz * 2.2, sz * 4.4, sz * 4.4)
      ctx.strokeStyle = `rgba(230,236,255,${(0.85 * a).toFixed(3)})`; ctx.lineWidth = 3
      for (let k = 0; k < 2; k++) { const an = k * Math.PI / 2 + 0.3; ctx.beginPath(); ctx.moveTo(x - Math.cos(an) * sz * 2.6, y - Math.sin(an) * sz * 2.6); ctx.lineTo(x + Math.cos(an) * sz * 2.6, y + Math.sin(an) * sz * 2.6); ctx.stroke() }
    }
    // the snare: a shockwave of light out of the core
    const sn = SONG.last('snare', 0.5), sa = sn ? now - sn.t : 9
    if (sa >= 0 && sa < 0.45) {
      const q = sa / 0.45, R = 60 + 1300 * K.ease.out(q), fl = Math.min(1, sa / 0.02) * Math.pow(1 - K.clamp(sa / 0.22), 2) * fade
      if (fl > 0.01) { const gg = ctx.createRadialGradient(CX, CY, 0, CX, CY, 1500); gg.addColorStop(0, `rgba(210,220,255,${(0.75 * fl).toFixed(3)})`); gg.addColorStop(1, `rgba(74,91,255,${(0.25 * fl).toFixed(3)})`); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H) }
      ctx.strokeStyle = `rgba(220,228,255,${(0.9 * (1 - q) * Math.min(1, sa / 0.02) * fade).toFixed(3)})`; ctx.lineWidth = 34 * (1 - q) + 3
      ctx.beginPath(); ctx.ellipse(CX, CY, R, R * TILT(lt), ROLL(lt), 0, K.TAU); ctx.stroke()
    }
    ctx.restore()
  }

  function drawConverge(ctx, t) {
    const lt = t - V0, u = U(lt)
    // the deep indigo comes up through the cracks
    ctx.fillStyle = '#0a0e2c'; ctx.fillRect(0, 0, W, H)
    // light leaks up through the cracks on the downbeat; at the very end the glow pulls in to the point too
    const crack = K.pulse(lt, [0], 0.5), pull = K.at(lt, 2.05, 0.3, 'inOut')
    const glowR = (300 + 900 * u + 500 * crack) * (1 - 0.8 * pull)
    let g = ctx.createRadialGradient(CX, CY, 0, CX, CY, glowR)
    g.addColorStop(0, `rgba(74,91,255,${(0.35 + 0.4 * u + 0.4 * crack).toFixed(3)})`); g.addColorStop(0.4, `rgba(47,63,232,${(0.18 + 0.2 * u).toFixed(3)})`); g.addColorStop(1, 'rgba(10,14,44,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    // v3: the song. The kick lurches the whole vortex round a notch and punches it toward us; the bass makes the core
    // throb; the snare sends a shockwave out of the core; every melody note flares a star on the spiral.
    const now = C.M.now(), kickE = C.M.env('kick', 0.24, 0.5), bassE = C.M.env('bass', 0.6, 0, 0.06)
    let lurch = 0
    for (const h of C.M.hits('kick', V0S, now + 1e-6, 0.5)) lurch += 0.17 * K.spring(now - h.t, 2.4, 0.72)
    const fade = 1 - K.at(lt, 2.0, 0.3, 'in') // the music's moves die out as everything collapses to the point
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(lurch * fade); ctx.scale(1 + 0.08 * kickE * fade, 1 + 0.08 * kickE * fade); ctx.translate(-CX, -CY)
    // the galaxy: dust on three arms, streaking
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'
    const da = K.clamp(lt * 4)
    for (const d of DUST) {
      const p = at(d, lt), q = at(d, lt - 0.035)
      if (p.r < 6) continue
      ctx.strokeStyle = `rgba(${d.c},${(0.55 * da * K.clamp(p.r / 80)).toFixed(3)})`; ctx.lineWidth = d.s
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(p.x, p.y + 0.01); ctx.stroke()
    }
    ctx.restore()
    // the page as it stood, for the tiles to carry
    paperNow(t)
    // everything else, back to front, each with its streak of light
    const list = ITEMS.map((it) => ({ it, p: at(it, lt) })).filter((e) => e.p.r > 2).sort((a, b) => a.p.d - b.p.d)
    for (const { it, p } of list) {
      const k = sizeK(it, p)
      if (k <= 0.02) continue
      const pts = [[p.x, p.y]]
      for (let j = 1; j <= 5; j++) { const q = at(it, lt - j * 0.022); pts.push([q.x, q.y]) }
      const sp = Math.hypot(pts[5][0] - p.x, pts[5][1] - p.y)
      if (sp > 30) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'
        const w0 = (it.kind === 'page' ? TS : it.w || 120) * k * 0.55
        for (let j = 1; j < pts.length; j++) {
          const f = 1 - j / pts.length
          ctx.strokeStyle = `rgba(140,160,255,${(0.32 * f * K.clamp((sp - 30) / 120)).toFixed(3)})`; ctx.lineWidth = Math.max(1, w0 * f)
          ctx.beginPath(); ctx.moveTo(pts[j - 1][0], pts[j - 1][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke()
        }
        ctx.restore()
      }
      drawItem(ctx, it, t, lt, p)
    }
    // the core: it swells as it swallows, flares as the last of it falls in, then is a point
    const fl = K.at(lt, 1.9, 0.35, 'in') * (1 - K.at(lt, 2.25, 0.15, 'out'))
    flares(ctx, lt, now, fade)
    ctx.restore() // the song's lurch
    const coreR = ((40 + 160 * u) * (1 - 0.7 * pull) + 500 * fl) * (1 + 0.45 * bassE * fade)
    ctx.save(); ctx.globalCompositeOperation = 'lighter'
    g = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreR)
    g.addColorStop(0, `rgba(255,255,255,${(0.5 + 0.5 * u).toFixed(3)})`); g.addColorStop(0.15, `rgba(190,200,255,${(0.35 + 0.4 * u).toFixed(3)})`); g.addColorStop(1, 'rgba(74,91,255,0)')
    ctx.fillStyle = g; ctx.fillRect(CX - coreR, CY - coreR, coreR * 2, coreR * 2)
    // the point of light: a hot core, an anamorphic streak and four rays
    const pt = K.at(lt, 0.4, 1.8, 'in')
    if (pt > 0.01) {
      const L = 200 + 900 * pt + 600 * fl
      g = ctx.createLinearGradient(CX - L, 0, CX + L, 0)
      g.addColorStop(0, 'rgba(120,140,255,0)'); g.addColorStop(0.5, `rgba(220,228,255,${(0.75 * pt).toFixed(3)})`); g.addColorStop(1, 'rgba(120,140,255,0)')
      ctx.fillStyle = g; ctx.fillRect(CX - L, CY - 3 - 3 * pt, L * 2, 6 + 6 * pt)
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4 + SPIN(lt) * 0.1, rl = (60 + 160 * pt) * (i % 2 ? 0.7 : 1)
        ctx.save(); ctx.translate(CX, CY); ctx.rotate(a)
        const rg = ctx.createLinearGradient(0, 0, rl, 0); rg.addColorStop(0, `rgba(255,255,255,${(0.7 * pt).toFixed(3)})`); rg.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(rl, 0); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill(); ctx.restore()
      }
      const cr = 10 + 18 * pt
      g = ctx.createRadialGradient(CX, CY, 0, CX, CY, cr); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g; ctx.fillRect(CX - cr, CY - cr, cr * 2, cr * 2)
    }
    ctx.restore()
  }
  C.drawConverge = drawConverge

  K.scene({ id: 'converge', ...span('converge'), draw(ctx, s) { drawConverge(ctx, s.t) } })
})()
