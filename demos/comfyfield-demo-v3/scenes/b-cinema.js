// cinema — bars 7–9 (8.4–10.8 s). The LTX-2.5 card the reels folded into shrinks to a chip and deals its three
// Cinema shots out of it as a fan, like a hand of cards, each turning face-on as it lands. The fan opens, winds
// up (the portal shot glows, the room dims), and at 9.6 — the film's biggest hit — the portal shot punches to full
// frame: a flash, light rays and a shockwave from the portal, the side shots blown off the frame, the camera shaken.
// The caption lands; the camera pushes in on the portal and dives through it into the montage.
;(function () {
  const C0 = span('cinema').start, E = (k) => C0 + k * E8
  const DEAL = [E(1), E(2), E(3)] // 8.6, 8.8, 9.0
  const OPEN = E(4), WIND = E(5), PUNCH = E(6), CAP = E(7), FLARE = E(9), DIVE = E(11) // 9.2 9.4 9.6 9.8 10.2 10.6
  K.cue(C0, 'cinema: land — the reels land as one card, LTX-2.5', 'hit')
  DEAL.forEach((x, i) => K.cue(x, `cinema: burst — shot ${i + 1} deals out of the card into the fan`, 'hit'))
  K.cue(OPEN, 'cinema: whoosh — the fan opens wide', 'soft')
  K.cue(WIND, 'cinema: rise — the fan winds up, the portal glows', 'soft')
  K.cue(PUNCH, 'cinema: boom — the portal shot punches to full frame', 'hit')
  K.cue(CAP, 'cinema: slam "Cinema" — the caption lands', 'hit')
  K.cue(FLARE, 'cinema: pop — the portal flares', 'soft')
  K.cue(DIVE, 'cinema: dive — into the portal', 'hit')

  const CX = W / 2, PIV = [CX, 1500], RAD = 1000, ANG = [-0.4, 0, 0.4], CW = 980, CH = 539, CR = 24
  const CHIP = { x: CX, y: 985, w: 330, h: 104 }
  const OFF = [0.4, 0.2, 3.1] // where each shot starts playing (shot 3 from its beach)
  const shotT = (i, t) => OFF[i] + Math.max(0, t - DEAL[i])
  // where the portal is in shot 2 (0..1 of the picture), as the shot's camera drifts
  const PORTAL = [[0, [0.17, 0.53]], [0.8, [0.16, 0.55], 'linear'], [1.6, [0.145, 0.62], 'linear'], [2.0, [0.15, 0.66], 'linear'], [2.4, [0.14, 0.72], 'linear'], [3.0, [0.13, 0.78], 'linear']]
  const portalAt = (st) => K.keys(st, PORTAL)

  // the full-frame zoom after the punch: a slow push, a kick on the flare, then the dive accelerates in
  const dive = (t) => 3.6 * Math.pow(K.clamp((t - (DIVE - 0.16)) / 0.56), 2.2)
  const zoomAt = (t) => 1 + 0.07 * K.at(t, PUNCH + 0.15, 0.9, 'inOutSine') + 0.035 * K.pulse(t, [FLARE], 0.45) + dive(t)
  // shot 2 full frame at time t (the montage draws this too, as it comes out the far side). Returns the portal on screen.
  // v3 · after the punch the camera steps in a notch on every kick (and stays in), pumps on it, and swells with the bass
  const punchSong = () => K.memo('bb-punch-song', () => BB.song(PUNCH))
  function camMusic() {
    const now = BB.now(), ps = punchSong()
    let z = 1
    for (const k of BB.hits('kick', ps - 0.05, now + 1e-6, 0.5)) z *= 1 + 0.05 * K.spring(now - k.t, 3.2, 0.62)
    return z * (1 + 0.035 * BB.pulse('kick', 0.22, 0.5)) * (1 + 0.045 * BB.bass(0.6))
  }
  BB.portal = function (ctx, t, rect) {
    const img = shots[1].at(shotT(1, t)), [ax, ay] = portalAt(shotT(1, t)), z = zoomAt(t) * camMusic()
    const r = rect || { x: 0, y: 0, w: W, h: H, r: 0 }
    return BB.view(ctx, img, r.x, r.y, r.w, r.h, r.r, z, ax, ay, K.clamp((z - 1.15) / 1.8))
  }
  BB.portalGlow = function (ctx, t, p, amt) { // the portal's light flooding the frame as we dive
    if (amt <= 0.003) return
    ctx.save(); ctx.globalCompositeOperation = 'screen'
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 300 + 1500 * amt)
    g.addColorStop(0, `rgba(235,220,255,${Math.min(1, amt * 1.3)})`); g.addColorStop(0.4, `rgba(170,110,255,${amt * 0.8})`); g.addColorStop(1, 'rgba(120,60,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore()
  }

  // the deck: the LTX-2.5 card the reels folded into, shrinking a step with each card it deals, to a chip
  const deckM = (t) => 0.4 * K.spring(t - DEAL[0] + 0.03, 2.3, 0.72) + 0.32 * K.spring(t - DEAL[1] + 0.03, 2.3, 0.72) + 0.28 * K.spring(t - DEAL[2] + 0.03, 2.3, 0.72)
  function deck(t) {
    const S = BB.SLOT_CARD, s0 = BB.slotsCam(C0).s, m = deckM(t)
    const w0 = S.w * s0, h0 = S.h * s0
    return { m, w: K.lerp(w0, CHIP.w, m), h: K.lerp(h0, CHIP.h, m), x: K.lerp(S.cx, CHIP.x, m), y: K.lerp(S.cy, CHIP.y, m), r: K.lerp(S.r * s0, CHIP.h / 2, m), size: K.lerp(108 * s0, 56, m), s0 }
  }
  const FROM = DEAL.map((x) => deck(x))
  // a fan card at time t: where it is, its tilt, scale and turn
  function card(i, t) {
    const b = K.spring(t - DEAL[i], 2.5, 0.58)
    if (b <= 0.001) return null
    const spread = 1 + 0.16 * K.spring(t - OPEN, 2.4, 0.6) - 0.3 * K.spring(t - WIND, 2.6, 0.7)
    const ang = ANG[i] * spread, sx = PIV[0] + Math.sin(ang) * RAD, sy = PIV[1] - Math.cos(ang) * RAD
    const f = FROM[i]
    let x = K.lerp(f.x, sx, b), y = K.lerp(f.y, sy, b), rot = ang * Math.min(1.1, b), sc = K.lerp((f.w / CW) * 0.8, 1, b)
    const yaw = (1 - K.clamp(b * 1.15)) * 1.4 * (i === 2 ? -1 : 1)
    // the wind-up: the portal card draws back and trembles; then the punch blows the others away
    if (t < PUNCH) { const kick = BB.pulse('kick', 0.3, 0.5); sc *= 1 + 0.06 * kick; y += 16 * kick } // v3: the kick
    if (i === 1) { sc *= 1 - 0.07 * K.spring(t - WIND, 2.4, 0.7); const tr = K.clamp((t - WIND - 0.05) / 0.15) * (t < PUNCH ? 1 : 0); x += K.noise1(t * 60, 4) * 3 * tr; y += K.noise1(t * 60, 5) * 3 * tr }
    else if (t > PUNCH) { const o = K.at(t, PUNCH, 0.4, 'out'), d = i === 0 ? -1 : 1; x += d * 1500 * o; y -= 160 * o; rot += d * 0.8 * o; sc *= 1 + 0.35 * o }
    return { x, y, rot, sc, yaw, b }
  }
  function cardFace(i, t) {
    const [c, g] = BB.g('cine' + i, CW, CH)
    BB.cover(g, shots[i].at(shotT(i, t)), 0, 0, CW, CH, CR)
    g.strokeStyle = 'rgba(255,255,255,0.92)'; g.lineWidth = 6; rr(g, 3, 3, CW - 6, CH - 6, CR - 2); g.stroke()
    return c
  }
  const backFace = () => K.memo('bb-cineback', () => {
    const c = document.createElement('canvas'); c.width = CW; c.height = CH; const g = c.getContext('2d')
    const gr = g.createLinearGradient(0, 0, CW * 0.4, CH); gr.addColorStop(0, '#3c4cf2'); gr.addColorStop(1, '#1d29b8')
    g.fillStyle = gr; rr(g, 0, 0, CW, CH, CR); g.fill(); g.globalAlpha = 0.9; mark(g, CW / 2 - 70, CH / 2 - 70, 140, 1, { square: false }); return c
  })
  function drawCard(ctx, i, t) {
    const k = card(i, t)
    if (!k) return
    ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(k.rot); ctx.scale(k.sc, k.sc)
    ctx.globalAlpha = K.clamp(k.b * 3)
    if (Math.abs(k.yaw) > 0.015) {
      const map = BB.hinge(-CW / 2, CW / 2, k.yaw)
      const ol = BB.plane(ctx, null, null, -CW / 2, -CH / 2, CW, CH, map, { vx: 0, vy: 0, dry: true })
      ctx.save(); ctx.shadowColor = 'rgba(20,24,80,0.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; ctx.fillStyle = '#222'; BB.poly(ctx, BB.grow(ol, -8)); ctx.fill(); ctx.restore()
      BB.plane(ctx, cardFace(i, t), backFace(), -CW / 2, -CH / 2, CW, CH, map, { vx: 0, vy: 0, n: 110 })
    } else {
      ctx.save(); ctx.shadowColor = 'rgba(20,24,80,0.32)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24; ctx.fillStyle = '#1a1a22'; rr(ctx, -CW / 2 + 6, -CH / 2 + 6, CW - 12, CH - 12, CR); ctx.fill(); ctx.restore()
      BB.cover(ctx, shots[i].at(shotT(i, t)), -CW / 2, -CH / 2, CW, CH, CR)
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 6; rr(ctx, -CW / 2 + 3, -CH / 2 + 3, CW - 6, CH - 6, CR - 2); ctx.stroke()
    }
    // v3 · the snare: each card's face flashes white and its rim burns, card after card
    const sa = BB.age('snare', 0.3) - [0.035, 0, 0.07][i]
    if (Math.abs(k.yaw) <= 0.015 && sa >= 0 && sa < 0.2) {
      const q = 1 - sa / 0.2
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(235,225,255,${0.5 * q * q})`; rr(ctx, -CW / 2, -CH / 2, CW, CH, CR); ctx.fill(); ctx.restore()
      ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${q})`; ctx.lineWidth = 6 + 12 * q; ctx.shadowColor = 'rgba(170,120,255,1)'; ctx.shadowBlur = 30; rr(ctx, -CW / 2, -CH / 2, CW, CH, CR); ctx.stroke(); ctx.restore()
    }
    // the deal: a flash along the card as it lands
    const fl = K.pulse(t, [DEAL[i] + 0.12], 0.3)
    if (fl > 0.01) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,255,255,${0.35 * fl})`; rr(ctx, -CW / 2, -CH / 2, CW, CH, CR); ctx.fill() }
    ctx.restore()
    // speed lines behind a card while it flies
    const d = t - DEAL[i]
    if (d > 0 && d < 0.22) {
      const a = 1 - d / 0.22, dx = k.x - FROM[i].x, dy = k.y - FROM[i].y, m = Math.hypot(dx, dy) || 1
      ctx.save(); ctx.strokeStyle = `rgba(47,63,232,${0.35 * a})`; ctx.lineCap = 'round'
      const r = K.rng('deal' + i)
      for (let j = 0; j < 9; j++) { const o = (r() - 0.5) * CH * 0.8 * k.sc, len = 120 + r() * 200; ctx.lineWidth = 2 + r() * 3; const px = k.x - (dy / m) * o - (dx / m) * (CW * 0.3 * k.sc), py = k.y + (dx / m) * o - (dy / m) * (CH * 0.3 * k.sc); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - (dx / m) * len * a, py - (dy / m) * len * a); ctx.stroke() }
      ctx.restore()
    }
  }
  // the LTX-2.5 card → the chip the fan is dealt from
  function chip(ctx, t) {
    const d = deck(t), kick = 1 - 0.035 * K.pulse(t, [C0], 0.2) + 0.05 * K.pulse(t, DEAL, 0.25) + 0.05 * BB.pulse('kick', 0.26, 0.5) + 0.07 * BB.env(BB.melody(BB.now() - 0.3, BB.now() + 1e-6), 0.3) // v3: kick and notes pop the deck
    ctx.save(); ctx.translate(d.x, d.y); ctx.scale(kick, kick)
    BB.ltxCard(ctx, -d.w / 2, -d.h / 2, d.w, d.h, d.r, { size: d.size })
    ctx.restore()
  }

  // v3 · the melody: every note shoots a fountain of sparks out of the portal. Under the notes method a higher note
  // flies higher and burns whiter; without pitch the note's strength sets its size and a hash its spread.
  function sparks(ctx, o, sc = 1) {
    const now = BB.now(), notes = BB.melody(now - 0.6, now + 1e-6)
    if (!notes.length) return
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'
    for (const h of notes) {
      const age = now - h.t, n = BB.note01(h), pitched = h.p != null, r = K.rng('bb-spark' + h.t.toFixed(3)), life = 0.6
      const fade = 1 - age / life, col = K.hex(K.mixColor('#9b6bff', '#ffffff', pitched ? n : 0.5))
      // the core flash at the portal
      if (age < 0.2) { const R = 240 * sc, c = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], R); c.addColorStop(0, `rgba(240,228,255,${0.9 * h.s * (1 - age / 0.2)})`); c.addColorStop(0.3, `rgba(190,140,255,${0.45 * h.s * (1 - age / 0.2)})`); c.addColorStop(1, 'rgba(190,140,255,0)'); ctx.fillStyle = c; ctx.fillRect(o[0] - R, o[1] - R, R * 2, R * 2) }
      for (let j = 0; j < 24; j++) {
        const a = -Math.PI / 2 + (r() - 0.5) * (pitched ? 1.0 : 1.6), v = (pitched ? 650 + 850 * n : 800 + 500 * h.s) * (0.7 + 0.5 * r()) * sc
        const vx = Math.cos(a) * v, vy = Math.sin(a) * v, gr = 1900 * sc
        const x = o[0] + vx * age, y = o[1] + vy * age + 0.5 * gr * age * age
        const tx = vx, ty = vy + gr * age, m = Math.hypot(tx, ty) || 1, len = Math.min(130 * sc, m * 0.07)
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.95 * fade})`; ctx.lineWidth = (6 + 4 * h.s) * sc
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (tx / m) * len, y - (ty / m) * len); ctx.stroke()
      }
    }
    ctx.restore()
  }
  // where the portal is on screen before the punch: inside the dealt portal card (or the deck, before it is dealt)
  function portalPre(t) {
    const k = card(1, t)
    if (!k) return [null, 0] // not dealt yet: the deck itself answers the note (it pops), so nothing flies into the words
    const [ax, ay] = portalAt(shotT(1, t)), lx = (ax - 0.5) * CW * k.sc, ly = (ay - 0.5) * CH * k.sc, c = Math.cos(k.rot), s = Math.sin(k.rot)
    return [[k.x + lx * c - ly * s, k.y + lx * s + ly * c], k.sc]
  }

  // a line whose words snap up into place almost together (masked), right-aligned at rx: whole within ~0.15 s
  function snapLine(ctx, t, words, rx, y, start, size) {
    ctx.save(); ctx.font = `700 ${size}px "Inter", sans-serif`
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.02 * size + 'px'
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic'
    const gap = size * 0.27, ws = words.map((w) => ctx.measureText(w).width)
    let x = rx - ws.reduce((a, b) => a + b, 0) - gap * (words.length - 1)
    words.forEach((w, i) => {
      const p = K.spring(t - start - i * 0.008, 5.5, 0.85)
      if (p > 0.001) {
        ctx.save(); ctx.beginPath(); ctx.rect(x - 8, y - size * 1.05, ws[i] + 16, size * 1.4); ctx.clip()
        ctx.globalAlpha *= K.clamp(p * 1.5); ctx.fillText(w, x, y + (1 - p) * size * 1.1); ctx.restore()
      }
      x += ws[i] + gap
    })
    ctx.restore()
  }

  K.scene({
    id: 'cinema', ...span('cinema'),
    draw(ctx, s) {
      const t = s.t
      const q = t >= PUNCH ? K.spring(t - PUNCH, 4.2, 0.6) : 0
      // the shake after the punch
      const shake = t > PUNCH ? Math.exp(-(t - PUNCH) * 8) : 0
      ctx.save(); if (shake > 0.01) ctx.translate(K.noise1(t * 42, 1) * 22 * shake, K.noise1(t * 42, 2) * 16 * shake)
      if (t < PUNCH) { const sn = BB.pulse('snare', 0.16, 0.3), side = window.SONG && SONG.count('snare', 0.3) % 2 ? 1 : -1; if (sn > 0.01) { ctx.translate(W / 2, H / 2); ctx.rotate(side * 0.018 * sn); ctx.scale(1 - 0.02 * sn, 1 - 0.02 * sn); ctx.translate(-W / 2, -H / 2) } } // v3: the snare jolts the table
      if (q < 0.999 || t < PUNCH + 0.4) {
        // the table: mist and the last of the jackpot rays; a purple glow builds behind the portal shot; the room dims
        BB.slotsBack(ctx, t)
        const wind = K.at(t, WIND - 0.1, 0.3, 'inOut')
        BB.rays(ctx, CX, 500, -t * 0.5 - BB.notches('snare', 0.2), 0.06 + 0.16 * wind + 0.12 * BB.pulse('kick', 0.3, 0.5), { color: '150,100,255', n: 16, r: 1400 })
        if (wind > 0) {
          const g = ctx.createRadialGradient(CX, 520, 100, CX, 520, 1150); g.addColorStop(0, 'rgba(10,14,44,0)'); g.addColorStop(1, `rgba(10,14,44,${0.45 * wind})`)
          ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, H + 80)
          const pg = ctx.createRadialGradient(CX, 500, 50, CX, 500, 700); pg.addColorStop(0, `rgba(170,110,255,${0.55 * wind})`); pg.addColorStop(1, 'rgba(170,110,255,0)')
          ctx.fillStyle = pg; ctx.fillRect(0, 0, W, H)
        }
        BB.slotsText(ctx, t)
        if (t < PUNCH) { drawCard(ctx, 0, t); drawCard(ctx, 2, t); drawCard(ctx, 1, t); chip(ctx, t); const [o, sc] = portalPre(t); if (o) sparks(ctx, o, 0.55 + 0.45 * sc) }
      }
      if (t >= PUNCH) {
        // the punch: the portal card's box opens to the frame (and a little past it, then settles)
        const k = card(1, PUNCH), w0 = CW * k.sc, h0 = CH * k.sc
        const rect = { x: K.lerp(k.x - w0 / 2, 0, q), y: K.lerp(k.y - h0 / 2, 0, q), w: K.lerp(w0, W, q), h: K.lerp(h0, H, q), r: CR * k.sc * K.clamp(1 - q) }
        if (q > 1) { const e = (q - 1) * 0.5; rect.x -= W * e; rect.y -= H * e; rect.w += W * e * 2; rect.h += H * e * 2 }
        const p = BB.portal(ctx, t, rect)
        if (t < PUNCH + 0.45) { drawCard(ctx, 0, t); drawCard(ctx, 2, t) }
        // light: the flash, rays and a shockwave out of the portal
        const d = t - PUNCH
        BB.rays(ctx, p[0], p[1], d * 1.2, 0.3 * K.pulse(t, [PUNCH + 0.04], 0.6), { color: '215,170,255', n: 18, r: 2000, w: 0.26, mode: 'lighter' })
        if (d < 0.55) {
          const u = K.ease.out(d / 0.55)
          ctx.save(); ctx.strokeStyle = `rgba(235,220,255,${0.85 * (1 - u)})`; ctx.lineWidth = 46 * (1 - u) + 2; ctx.shadowColor = 'rgba(170,110,255,0.9)'; ctx.shadowBlur = 30
          ctx.beginPath(); ctx.arc(p[0], p[1], 80 + 1700 * u, 0, K.TAU); ctx.stroke(); ctx.restore()
        }
        flash(ctx, t, [PUNCH + 0.033], { dur: 0.22, amount: 0.6, color: '#efe4ff' })
        // the flare on 10.2, and the dive's flood of light; v3 · the bass makes the portal breathe and the frame throb
        const bass = BB.bass(0.55)
        BB.portalGlow(ctx, t, p, 0.35 * K.pulse(t, [FLARE], 0.5) + 0.75 * K.clamp((zoomAt(t) - 1.12) / 1.31) + 0.8 * bass)
        if (bass > 0.01) { const vg = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1100); vg.addColorStop(0, 'rgba(30,8,90,0)'); vg.addColorStop(1, `rgba(30,8,90,${0.62 * bass})`); ctx.fillStyle = vg; ctx.fillRect(-40, -40, W + 80, H + 80) }
        // v3 · the snare: an anamorphic streak of the portal's light across the frame
        const sa = BB.age('snare', 0.35)
        if (sa < 0.32) {
          const q = 1 - sa / 0.32, sn = Math.max(0.6, window.SONG ? SONG.last('snare', 0.35).s : 1)
          ctx.save(); ctx.globalCompositeOperation = 'lighter'
          if (sa < 0.12) { ctx.fillStyle = `rgba(150,110,255,${0.22 * sn * (1 - sa / 0.12)})`; ctx.fillRect(0, 0, W, H) }
          for (const [hh, al] of [[220, 0.22], [60, 0.4], [16, 0.95]]) {
            const g = ctx.createLinearGradient(p[0] - 2000, 0, p[0] + 2000, 0)
            g.addColorStop(0, 'rgba(190,150,255,0)'); g.addColorStop(0.5, `rgba(230,212,255,${al * q * sn})`); g.addColorStop(1, 'rgba(190,150,255,0)')
            ctx.fillStyle = g; ctx.fillRect(p[0] - 2000, p[1] - (hh * (0.5 + 0.5 * q)) / 2, 4000, hh * (0.5 + 0.5 * q))
          }
          ctx.restore()
        }
        sparks(ctx, p, 1)
        const dv = K.clamp((t - DIVE + 0.1) / 0.5)
        if (dv > 0) streaks(ctx, t, p[0], p[1], dv, 77, { n: 80 })
        // the caption: on a dark wash, top right, clear of the portal
        // the dive carries the caption out past the camera
        // in fast (whole by ~9.95), still through the push and the dive, out past the camera only in its last frames
        const OUT = span('cinema').end - 0.041, fly = K.clamp((t - OUT) / 0.041), fs = 1 + 0.35 * fly
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(fs, fs); ctx.translate(-W / 2, -H / 2)
        const cin = K.at(t, CAP - 0.05, 0.2, 'out') * (1 - fly)
        if (cin > 0) {
          const g = ctx.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, `rgba(8,8,26,${0.62 * cin})`); g.addColorStop(0.6, `rgba(8,8,26,${0.3 * cin})`); g.addColorStop(1, 'rgba(8,8,26,0)')
          ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, 460)
        }
        const RX = 1800, w1 = BB.slamW(ctx, 'Cinema', 132)
        slam(ctx, t, 'Cinema', RX - w1, 196, CAP, { size: 132, color: '#fff', out: OUT })
        const words = ['LTX-2.5', 'on', 'Comfy', 'Cloud,', 'rendered', 'in', 'ComfyField']
        ctx.globalAlpha = 1 - fly
        snapLine(ctx, t, words, RX, 278, CAP, 52)
        ctx.restore()
      }
      ctx.restore()
    },
  })
})()
