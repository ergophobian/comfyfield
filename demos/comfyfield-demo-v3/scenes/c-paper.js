// paper — bars 14–19 (16.8–22.8), builder C.
// The glass world tears: a rip runs down the frame and the two halves are flung away, and under them is the
// taco film's warm paper. The film plays on a print; on every bar a new print slaps down on the pile (the cut),
// each landing with ink impact lines. The headline rises and gets an ink underline, the skill line is told in
// three beats, ink doodles pop on the beats, the two stamps land. At the end the page starts to turn (into the
// vortex).
;(function () {
  const C = (window.CB = window.CB || {})
  const P0 = 16.8
  const INK = '#2b2420', RED = '#c8402e', GOLD = '#e3a82b'

  // the prints: [film time it lands, taco film time at that moment] — one per bar, the last on the half bar
  const SHOTS = [[16.8, 0.5], [18.0, 7.7], [19.2, 16.3], [20.4, 22.9], [21.6, 27.3], [22.2, 31.7]]
  const SLAP = 0.14 // a print's flight onto the pile
  const PR = { x: 478, y: 540, fs: 736, m: 24 } // the pile's centre, the film's size on a print, the print's margin
  const PPOSE = [[0, 0, -0.022], [14, -8, 0.028], [-10, 10, -0.034], [12, 8, 0.016], [-8, -10, -0.03], [8, 6, 0.024]]
  const PFROM = [[0, 0], [-900, -800], [-1100, 400], [-300, 1000], [-1100, -300], [-500, -1000]]

  K.cue(16.8, 'paper: tear — the glass world rips top to bottom', 'hit')
  K.cue(17.0, 'paper: whoosh — the two halves are flung away', 'soft')
  K.cue(17.6, 'paper: ink — underline under "motion graphics."', 'hit')
  K.cue(18.0, 'paper: cut — a print slaps onto the pile (pineapple)', 'hit')
  K.cue(17.8, 'paper: rise — "An agent skill drew and scored this film in code."', 'soft')
  K.cue(19.2, 'paper: slam "No image or video model." — a print slaps down (map)', 'hit')
  K.cue(19.6, 'paper: ink — circle scribbled round it', 'soft')
  K.cue(20.4, 'paper: land — stamp "Visual loop · 3 rounds", a print slaps down (trompo)', 'hit')
  K.cue(21.0, 'paper: land — stamp "BGM loop · 2 rounds"', 'hit')
  K.cue(21.6, 'paper: cut — a print slaps down (the shave)', 'hit')
  K.cue(22.2, 'paper: cut — the last print, half a bar later (the bites)', 'hit')

  // ---------- drawn things
  function star(cx, cy, r, rot = 0) { const out = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.44 : r; out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]) } return out }
  // a doodle drawn on fast at its beat, then alive (the line boils on twos)
  function doodle(ctx, t, T, pts, o = {}) {
    const d = K.at(t, T, o.dur || 0.16, 'out')
    if (d <= 0) return
    K.line(ctx, pts, { color: o.color || INK, lw: o.lw || 5, seed: o.seed || 3, draw: d, wob: o.wob ?? 1.6, boil: 8, t, taper: o.taper ?? 10 })
  }
  function popStar(ctx, t, T, x, y, r, seed) {
    const p = K.spring(t - T, 3, 0.45)
    if (p <= 0.01) return
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.rotate((1 - p) * 0.8)
    K.shape(ctx, star(0, 0, r, 0.1), { fill: GOLD, line: INK, lw: 3.4, seed, wob: 1.6, boil: 8, t, texture: 0.4 })
    ctx.restore()
    // three little lines flicking out from it
    const f = K.at(t, T + 0.04, 0.22, 'out'), fa = 1 - K.at(t, T + 0.3, 0.3)
    if (fa > 0) for (let i = 0; i < 3; i++) {
      const a = -2.2 + i * 0.7, r0 = r * 1.35, r1 = r0 + 26 * f
      K.line(ctx, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { lw: 3.5, seed: seed + i, alpha: fa, taper: 4 })
    }
  }
  function sparkle(ctx, t, T, x, y, r, seed) {
    const p = K.spring(t - T, 3.2, 0.5), fa = 1 - K.at(t, T + 0.9, 0.4)
    if (p <= 0.01 || fa <= 0) return
    const s = r * p
    ctx.save(); ctx.globalAlpha *= fa
    K.line(ctx, [[x, y - s], [x, y + s]], { lw: 4, seed, taper: 8 })
    K.line(ctx, [[x - s * 0.7, y], [x + s * 0.7, y]], { lw: 4, seed: seed + 1, taper: 8 })
    ctx.restore()
  }
  function stamp(ctx, x, y, label, p, seed, rot) {
    if (p <= 0) return
    const sc = K.lerp(1.9, 1, K.ease.outBack(Math.min(1, p), 1.5)), a = K.clamp(p * 3)
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= a * 0.94
    ctx.font = '800 38px "Inter", sans-serif'
    const w = ctx.measureText(label).width + 70
    K.shape(ctx, K.rect(-w / 2, -46, w, 92, 14), { fill: 'rgba(200,64,46,0.06)', line: RED, lw: 4.5, seed, wob: 1.4 })
    K.shape(ctx, K.rect(-w / 2 + 9, -37, w - 18, 74, 9), { fill: null, line: RED, lw: 1.8, seed: seed + 4, wob: 1.2 })
    ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(label, 0, 2)
    ctx.restore()
  }
  // the ink spatter a stamp throws as it lands
  function spatter(ctx, t, T, x, y, seed) {
    const d = t - T
    if (d < 0 || d > 0.5) return
    const r = K.rng('c-spat' + seed), p = K.ease.out(K.clamp(d / 0.18))
    ctx.save(); ctx.fillStyle = RED; ctx.globalAlpha *= 1 - K.clamp((d - 0.25) / 0.25)
    for (let i = 0; i < 14; i++) { const a = r() * K.TAU, dd = (40 + r() * 70) * p, ex = Math.cos(a) * (250 + dd), ey = Math.sin(a) * (60 + dd * 0.6); ctx.beginPath(); ctx.arc(x + ex, y + ey, (1.5 + r() * 5) * (1 - 0.4 * p), 0, K.TAU); ctx.fill() }
    ctx.restore()
  }

  // v3: the snare. A star slams onto the page with a burst of ink rays, and a sheen of light snaps across the paper.
  function snareStar(ctx, t, T, x, y, r, seed) {
    const d = t - T
    if (d < 0) return
    popStar(ctx, t, T, x, y, r, seed)
    const p = K.ease.out(K.clamp(d / 0.09)), fa = 1 - K.clamp((d - 0.12) / 0.25)
    if (fa <= 0) return
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * K.TAU + seed, r0 = r * 1.2 + 8 * p, r1 = r0 + (44 + 30 * (i % 2)) * p
      K.line(ctx, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { lw: 8, seed: seed * 10 + i, alpha: fa, taper: 6 })
    }
  }
  function snareGlint(ctx) {
    const h = window.SONG && SONG.last('snare', 0.5), d = h ? C.M.now() - h.t : 9
    if (d < 0 || d > 0.2) return
    const u = d / 0.2, x = -500 + u * (W + 1000), a = 0.9 * h.s * (1 - u) * Math.min(1, d / 0.02)
    const g = ctx.createLinearGradient(x - 420, 0, x + 420, 160)
    g.addColorStop(0, 'rgba(255,255,250,0)'); g.addColorStop(0.5, `rgba(255,255,250,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,250,0)')
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore()
  }

  // ---------- one print: cream border, ink outline (boiling), the film inside
  function print(ctx, t, i, img, flash) {
    const fs = PR.fs, m = PR.m, s = fs + 2 * m
    K.shape(ctx, K.rect(-s / 2, -s / 2, s, s, 4), { fill: '#fbf8f1', line: INK, lw: 3, seed: 40 + i, wob: 1.3, boil: 8, t, texture: 0.5 })
    if (img) K.drawImg(ctx, img, -fs / 2, -fs / 2, fs, fs, 'cover')
    if (flash > 0.01) { ctx.save(); ctx.globalAlpha = flash; ctx.fillStyle = '#fffaf0'; ctx.fillRect(-fs / 2, -fs / 2, fs, fs); ctx.restore() }
    K.shape(ctx, K.rect(-fs / 2, -fs / 2, fs, fs, 0), { fill: null, line: INK, lw: 2, seed: 60 + i, wob: 0.9, boil: 8, t })
  }
  function shotIndex(t) { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i][0]) k = i; return k }
  function drawPile(ctx, t) {
    const top = shotIndex(t)
    const next = top + 1 < SHOTS.length && t >= SHOTS[top + 1][0] - SLAP ? top + 1 : top
    for (let i = Math.max(0, top - 2); i <= next; i++) {
      const [T, tt] = SHOTS[i], [ox, oy, rot] = PPOSE[i]
      let x = PR.x + ox, y = PR.y + oy, r = rot, sc = 1, sh = 0
      if (i > 0 && t < T) {
        // in flight: it comes from off the page, big (near the camera), and accelerates onto the pile
        const p = K.at(t, T - SLAP, SLAP, 'in')
        x += PFROM[i][0] * (1 - p); y += PFROM[i][1] * (1 - p); r += (i % 2 ? 0.35 : -0.35) * (1 - p); sc = 1 + 0.35 * (1 - p); sh = 1 - p
      } else if (i > 0) {
        // the landing: squashes a hair into the pile and settles
        const d = t - T
        sc = 1 - 0.025 * Math.exp(-d * 9) * Math.cos(d * 30)
      }
      const covered = i < next ? SHOTS[i + 1][0] : 1e9
      const img = taco.at(Math.max(0, tt + Math.min(t, covered) - T))
      if (i === next) sc *= 1 + 0.035 * C.M.env('kick', 0.22, 0.5) // v3: the pile thumps on the kick
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(sc, sc)
      const s = PR.fs + 2 * PR.m
      ctx.save(); ctx.shadowColor = 'rgba(45,30,15,' + (0.28 + 0.2 * sh).toFixed(3) + ')'; ctx.shadowBlur = 26 + 60 * sh; ctx.shadowOffsetY = 10 + 50 * sh; ctx.shadowOffsetX = 6 + 30 * sh
      ctx.fillStyle = '#fbf8f1'; ctx.fillRect(-s / 2 + 4, -s / 2 + 4, s - 8, s - 8); ctx.restore()
      print(ctx, t, i, img, i > 0 ? K.pulse(t, [T], 0.16) * 0.55 : 0)
      ctx.restore()
    }
    // impact: ink lines kicked out from the pile's edges as each print lands
    SHOTS.forEach(([T], i) => {
      if (i === 0) return
      const d = t - T
      if (d < 0 || d > 0.4) return
      const p = K.ease.out(K.clamp(d / 0.12)), fa = 1 - K.clamp((d - 0.15) / 0.25), hs = (PR.fs + 2 * PR.m) / 2 + 22, r = K.rng('c-imp' + i)
      for (let j = 0; j < 14; j++) {
        const side = [0, 2, 3][j % 3], f = 0.15 + r() * 0.7 // top, bottom, left: the right side would cut into the words
        const [bx, by, nx, ny] = side === 0 ? [-hs + f * 2 * hs, -hs, 0, -1] : side === 1 ? [hs, -hs + f * 2 * hs, 1, 0] : side === 2 ? [-hs + f * 2 * hs, hs, 0, 1] : [-hs, -hs + f * 2 * hs, -1, 0]
        const L = 26 + r() * 40, g0 = 8 + 30 * p, g1 = g0 + L * p
        K.line(ctx, [[PR.x + bx + nx * g0, PR.y + by + ny * g0], [PR.x + bx + nx * g1, PR.y + by + ny * g1]], { lw: 4, seed: j + i * 20, alpha: fa, taper: 5 })
      }
    })
  }

  // ---------- v3: the melody, written by a pen across the top of the page
  // The pen runs left to right over the scene's four seconds of song. Each melody note is a red note head inked
  // where the pen is; the ink line between them holds the last note's height and glides to the next, so with pitch
  // (B) the line is the melody's contour, and without it (A) the heights come from the notes' times and the heads'
  // size from their strength. The line's weight swells with the bass under it. A faint pencil staff is ruled first.
  const PEN = { x0: 84, x1: 1836, yTop: 14, yBot: 84, t0: 20.72, t1: 24.66 } // the lowest staff line sits clear of the pile
  const penX = (st) => K.lerp(PEN.x0, PEN.x1, K.clamp((st - PEN.t0) / (PEN.t1 - PEN.t0)))
  // with pitch, the band spans this passage's own lowest to highest note, so the contour fills it
  let PR_ = null
  const passRange = () => PR_ || (PR_ = (() => { const ps = C.M.notes(PEN.t0, PEN.t1).filter((h) => h.p != null).map((h) => h.p); return ps.length ? [Math.min(...ps), Math.max(...ps)] : null })())
  const noteY = (h) => {
    const r = h.p != null ? passRange() : null
    return r ? K.lerp(PEN.yBot - 4, PEN.yTop + 4, (h.p - r[0]) / Math.max(1, r[1] - r[0])) : K.lerp(PEN.yBot - 12, PEN.yTop + 12, C.M.h01(h.t, 11))
  }
  const envAt = (layer, dur, st, minS = 0) => { const h = window.SONG && SONG.last(layer, minS, st); if (!h) return 0; const a = st - h.t; return a >= dur ? 0 : h.s * Math.min(1, a / 0.05) * Math.pow(1 - a / dur, 1.5) }
  function penY(st, notes) {
    let y0 = (PEN.yTop + PEN.yBot) / 2, y1 = y0, tk = -1
    for (const h of notes) { if (h.t > st) break; y0 = y1; y1 = noteY(h); tk = h.t }
    return (tk < 0 ? y1 : K.lerp(y0, y1, K.ease.out(K.clamp((st - tk) / 0.07)))) + 1.6 * K.noise1(st * 7, 5)
  }
  function drawPen(ctx, x, y, ang, alpha) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(ang); ctx.scale(0.9, 0.9)
    ctx.save(); ctx.translate(10, 18); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(45,30,15,0.22)'; rr(ctx, 26, -9, 214, 20, 10); ctx.fill(); ctx.restore()
    ctx.fillStyle = '#d6a93f'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(30, -8); ctx.lineTo(35, 0); ctx.lineTo(30, 8); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(24, 0); ctx.stroke()
    ctx.fillStyle = '#1b1d2b'; rr(ctx, 33, -8, 26, 16, 4); ctx.fill()
    const g = ctx.createLinearGradient(0, -11, 0, 11); g.addColorStop(0, '#46508a'); g.addColorStop(0.45, '#232845'); g.addColorStop(1, '#141730')
    ctx.fillStyle = g; rr(ctx, 57, -11, 190, 22, 11); ctx.fill()
    ctx.fillStyle = '#d6a93f'; ctx.fillRect(150, -11, 7, 22)
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; rr(ctx, 66, -8, 160, 4, 2); ctx.fill()
    ctx.strokeStyle = INK; ctx.lineWidth = 2; rr(ctx, 57, -11, 190, 22, 11); ctx.stroke()
    ctx.restore()
  }
  function drawMelody(ctx) {
    if (!C.M.on()) return
    const now = C.M.now()
    if (now < PEN.t0) return
    const notes = C.M.notes(PEN.t0, PEN.t1), end = Math.min(now, PEN.t1)
    // the staff, ruled in pencil as the page arrives
    const rule = K.at(now, PEN.t0 + 0.05, 0.45, 'out')
    for (let k = 0; k < 3; k++) { const y = K.lerp(PEN.yTop, PEN.yBot, k / 2); K.line(ctx, [[PEN.x0 - 24, y], [K.lerp(PEN.x0 - 24, PEN.x1 + 40, rule), y + 1]], { color: INK, lw: 1.4, alpha: 0.24, seed: 70 + k, taper: 6 }) }
    // the contour, one ribbon of ink
    const pts = [], ws = []
    for (let st = PEN.t0; ; st = Math.min(end, st + 1 / 90)) { pts.push([penX(st), penY(st, notes)]); ws.push(3 + 7.5 * envAt('bass', 0.55, st)); if (st >= end) break }
    if (pts.length > 1) {
      const lft = [], rgt = []
      for (let i = 0; i < pts.length; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, w = ws[i] / 2
        lft.push([pts[i][0] - (ty / l) * w, pts[i][1] + (tx / l) * w]); rgt.push([pts[i][0] + (ty / l) * w, pts[i][1] - (tx / l) * w])
      }
      ctx.fillStyle = INK; K.pathOf(ctx, lft.concat(rgt.reverse())); ctx.fill()
    }
    // the note heads, each ringing as it is inked
    for (const h of notes) {
      if (h.t > now) break
      const x = penX(h.t), y = noteY(h), age = now - h.t, pop = K.spring(age, 3.2, 0.45), r = (7.5 + 7 * h.s) * pop
      if (r > 0.3) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.42); ctx.fillStyle = RED; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.3, r * 0.88, 0, 0, K.TAU); ctx.fill(); ctx.restore() }
      const q = K.clamp(age / 0.34)
      if (q < 1) { ctx.save(); ctx.globalAlpha = (1 - q) * Math.min(1, age / 0.03); ctx.strokeStyle = RED; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(x, y, (7.5 + 7 * h.s) * (1.4 + 2.2 * K.ease.out(q)), 0, K.TAU); ctx.stroke(); ctx.restore() }
    }
    // the pen: rides the line, dips on each note, lifts away as the page ends
    const lift = K.at(now, PEN.t1, 0.3, 'in')
    if (lift < 1) {
      const press = envAt('other', 0.16, now)
      drawPen(ctx, penX(end) + lift * 180, penY(end, notes) + 3 * press - lift * 140, -0.2 + 0.08 * press - 0.3 * lift, 1 - lift)
    }
  }

  // ---------- the paper world (also drawn under the tear, and into the vortex)
  const RX = 968
  let lineW = null
  function drawPaperWorld(ctx, t) {
    const lt = t - P0
    K.paper(ctx, W, H, B.paper, 9)
    // the camera: the page settles up from under the tear, then a slow push; a jolt on every landing; at the end
    // the page starts to turn (the vortex is coming)
    const settle = 1 - K.spring(lt - 0.06, 1.5, 0.72)
    const jolt = K.pulse(t, SHOTS.slice(1).map((s) => s[0]).concat([20.4, 21.0]), 0.22)
    const kick = C.M.env('kick', 0.22, 0.5)
    const zoom = 1.02 + 0.1 * settle + 0.035 * K.at(t, P0 + 0.5, 5.5, 'inOut') + 0.008 * jolt + 0.02 * kick // v3: the kick punches the camera in
    const turn = -0.05 * K.at(t, 22.2, 0.6, 'in')
    ctx.save()
    ctx.translate(W / 2, H / 2); ctx.rotate(turn + 0.004 * jolt * Math.sin(t * 80)); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2)
    K.paper(ctx, W, H, B.paper, 9)
    drawPile(ctx, t)
    // the headline, ink on paper, and its underline
    rise(ctx, t, ['Custom', 'skills', 'for'], RX, 214, 17.0, { size: 92, color: INK, step: 0.1 })
    const w2 = rise(ctx, t, ['motion', 'graphics.'], RX, 318, 17.3, { size: 92, colors: [INK, RED], step: 0.1 })
    doodle(ctx, t, 17.6, K.curve([[RX - 6, 352], [RX + w2 * 0.35, 340], [RX + w2 * 0.7, 356], [RX + w2 + 24, 336]], 40), { color: RED, lw: 9, seed: 7, dur: 0.22, taper: 18 })
    // the skill line, in three beats
    rise(ctx, t, ['An', 'agent', 'skill', 'drew', 'and', 'scored'], RX, 470, 17.8, { size: 48, weight: 600, color: INK, step: 0.05 })
    rise(ctx, t, ['this', 'film', 'in', 'code.'], RX, 534, 18.1, { size: 48, weight: 600, color: INK, step: 0.05 })
    if (!lineW) { ctx.save(); ctx.font = '800 60px "Inter", sans-serif'; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.04 * 60 + 'px'; lineW = ctx.measureText('No image or video model.').width; ctx.restore() }
    slam(ctx, t, 'No image or video model.', RX, 630, 19.2, { size: 60, color: INK, from: 1.5 })
    // the circle scribbled round it, then an arrow from it to the film
    const cx = RX + lineW / 2, cy = 610
    const loop = []
    for (let i = 0; i <= 64; i++) { const a = -2.95 + (i / 64) * (K.TAU + 0.4), rr = 1 + 0.03 * Math.sin(i * 0.7); loop.push([cx + Math.cos(a) * (lineW / 2 + 56) * rr, cy + 2 + Math.sin(a) * 74 * rr + i * 0.18]) }
    doodle(ctx, t, 19.5, loop, { color: RED, lw: 5, seed: 9, dur: 0.3 })
    const arrow = K.curve([[RX + 70, 708], [RX + 10, 800], [RX - 50, 850], [PR.x + PR.fs / 2 + 36, 884]], 36)
    doodle(ctx, t, 19.8, arrow, { lw: 5, seed: 12, dur: 0.2 })
    const ah = K.at(t, 19.98, 0.08, 'out')
    if (ah > 0) {
      const [a, b] = [arrow[arrow.length - 3], arrow[arrow.length - 1]], an = Math.atan2(b[1] - a[1], b[0] - a[0])
      for (const s of [-1, 1]) K.line(ctx, [[b[0], b[1]], [b[0] - Math.cos(an + s * 0.5) * 28 * ah, b[1] - Math.sin(an + s * 0.5) * 28 * ah]], { lw: 5, seed: 13 + s, taper: 4 })
    }
    // the stamps
    stamp(ctx, RX + 360, 800, 'Visual loop · 3 rounds', K.at(t, 20.4 - 0.12, 0.12, 'linear'), 1, -0.06)
    spatter(ctx, t, 20.4, RX + 360, 800, 1)
    stamp(ctx, RX + 560, 936, 'BGM loop · 2 rounds', K.at(t, 21.0 - 0.12, 0.12, 'linear'), 2, 0.045)
    spatter(ctx, t, 21.0, RX + 560, 936, 2)
    // doodles on the beats
    // v3: the stars pop on the song's snares (song time)
    const SPOTS = [[1800, 432, 56], [160, 1000, 50], [1806, 726, 54]] // clear of the words, inside the frame at full push
    C.M.hits('snare', 20.72, 24.84, 0.5).forEach((h, i) => { const [x, y, r] = SPOTS[i % SPOTS.length]; snareStar(ctx, C.M.now(), h.t, x, y, r, 21 + i) })
    sparkle(ctx, t, 18.4, 1838, 214, 30, 31)
    sparkle(ctx, t, 20.0, PR.x - PR.fs / 2 - 34, PR.y - PR.fs / 2 + 60, 26, 33)
    sparkle(ctx, t, 21.2, RX - 30, 930, 28, 35)
    sparkle(ctx, t, 22.0, 1850, 760, 30, 37)
    ctx.restore()
    snareGlint(ctx)
    drawMelody(ctx) // in screen space: the top margin above the pile and the headline, whatever the camera does
    K.grain(ctx, W, H, t, 0.05)
  }
  C.drawPaperWorld = drawPaperWorld

  // ---------- the tear
  const TEAR = (() => {
    const pts = [], r = K.rng('c-tear'), N = 70
    for (let i = 0; i <= N; i++) {
      const v = i / N, y = -80 + v * (H + 160)
      pts.push([K.lerp(1150, 860, v) + 80 * K.noise1(v * 3.4, 11) + 26 * K.noise1(v * 17, 5) + (r() - 0.5) * 16, y])
    }
    return pts
  })()
  let OFF = null
  function offscreen() { if (!OFF) { OFF = document.createElement('canvas'); OFF.width = W; OFF.height = H } const g = OFF.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; return g }
  function drawTear(ctx, t) {
    const lt = t - P0
    const front = K.lerp(-80, H + 80, K.at(lt, 0, 0.16, 'out'))
    const q = K.at(lt, 0.08, 0.45, (x) => x * x) // flung: accelerating away
    if (q >= 1) return
    // the glass world, as a sheet at this moment (on the downbeat itself it is still whole)
    if (lt < 0.001) { C.drawFormats(ctx, t); return }
    const g = offscreen(); C.drawFormats(g, t)
    const gap = (y) => (y < front ? 16 * K.clamp((front - y) / 260) : 0)
    const halves = [
      { side: -1, pts: [[-400, -400]].concat(TEAR.map(([x, y]) => [x - gap(y) / 2, y]), [[-400, H + 400]]), edge: TEAR.map(([x, y]) => [x - gap(y) / 2, y]), dx: -1250, dy: -180, rot: -0.22, piv: [0, H] },
      { side: 1, pts: [[W + 400, -400]].concat(TEAR.map(([x, y]) => [x + gap(y) / 2, y]), [[W + 400, H + 400]]), edge: TEAR.map(([x, y]) => [x + gap(y) / 2, y]), dx: 1250, dy: 220, rot: 0.17, piv: [W, 0] },
    ]
    for (const h of halves) {
      ctx.save()
      ctx.translate(h.dx * q, h.dy * q)
      ctx.translate(h.piv[0], h.piv[1]); ctx.rotate(h.rot * q); ctx.scale(1 + 0.14 * q, 1 + 0.14 * q); ctx.translate(-h.piv[0], -h.piv[1])
      // its shadow on the paper below, growing as it lifts
      ctx.save(); ctx.shadowColor = 'rgba(40,28,15,' + ((0.25 + 0.25 * K.clamp(q * 4)) * K.clamp(lt / 0.12)).toFixed(3) + ')'; ctx.shadowBlur = 18 + 60 * q; ctx.shadowOffsetX = -h.side * (6 + 40 * q); ctx.shadowOffsetY = 8 + 40 * q
      ctx.fillStyle = '#e7ebff'; C.poly(ctx, h.pts); ctx.fill(); ctx.restore()
      ctx.save(); C.poly(ctx, h.pts); ctx.clip(); ctx.drawImage(OFF, 0, 0); ctx.restore()
      // the torn edge: a white core of fibres, ragged
      const torn = h.edge.filter(([, y]) => y < front + 30)
      if (torn.length > 1) {
        const rag = K.wob(torn, { seed: 5 + h.side, amp: 3.5, freq: 0.12, closed: false, step: 4 })
        ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'
        ctx.strokeStyle = 'rgba(160,170,210,0.55)'; ctx.lineWidth = 13; K.pathOf(ctx, rag, false); ctx.stroke()
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; K.pathOf(ctx, rag, false); ctx.stroke()
        const r = K.rng('c-fib' + h.side)
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.4
        for (let i = 2; i < rag.length - 2; i += 2) {
          const [x, y] = rag[i], L = 4 + r() * 12, a = (r() - 0.5) * 1.2
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - h.side * Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke()
        }
        ctx.restore()
      }
      ctx.restore()
    }
    // the point of the rip: a hot spark running down
    if (front < H + 40 && lt < 0.2) {
      let fx = TEAR[0][0]
      for (const [x, y] of TEAR) if (y <= front) fx = x
      const rg = ctx.createRadialGradient(fx, front, 0, fx, front, 90)
      rg.addColorStop(0, 'rgba(255,255,255,0.95)'); rg.addColorStop(0.3, 'rgba(255,240,210,0.5)'); rg.addColorStop(1, 'rgba(255,240,210,0)')
      ctx.fillStyle = rg; ctx.fillRect(fx - 90, front - 90, 180, 180)
    }
  }

  K.scene({
    id: 'paper', ...span('paper'),
    draw(ctx, s) {
      drawPaperWorld(ctx, s.t)
      if (s.t - P0 < 0.75) drawTear(ctx, s.t)
    },
  })
})()
