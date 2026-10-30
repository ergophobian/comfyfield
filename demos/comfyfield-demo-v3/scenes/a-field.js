// Builder A — field (2.4–6.0 s). The same camera as the spark (scenes/a-spark.js: WORLD) drops low and races over the
// field of live tiles; waves of tiles flip on the eighths; "Every tool." and "One field." slam in the sky on the big
// beats; on the eighths tools lift out of the field and ride beside the camera saying their names; at 5.4 one tile
// flips to show the next scene, the field bends into a bowl round it, the camera pulls up, pitches straight down and
// falls onto it — at 6.0 the tile IS the frame, and the slots scene goes on.
K.cue(2.4, 'field: whoosh — the camera drops low and races over the field', 'hit')
K.cue(3.0, 'field: slam "Every tool."', 'hit')
K.cue(3.4, 'field: pop — Relight lifts out of the field and rides beside the camera', 'hit')
K.cue(3.6, 'field: slam "One field."', 'hit')
K.cue(3.8, 'field: pop — Lipsync lifts out on the right', 'hit')
K.cue(4.2, 'field: pop — Try-on lifts out; a diagonal wave of tiles flips', 'hit')
K.cue(4.6, 'field: pop — Motion control lifts out', 'hit')
K.cue(4.8, 'field: whoosh — the words whip away, another flip wave', 'hit')
K.cue(5.4, 'field: dive — one tile flips open, the field bends into a bowl, the camera pitches down', 'hit')
K.cue(5.8, 'field: whoosh — the drop into the tile (cut to slots on 6.0)', 'hit')

const FIELD = (() => {
  // on the eighths 3.4 → 4.6 a tool lifts out of the field and rides along beside the camera, saying its name:
  // [time, across (− left), ahead, tool] — left and right in turn, flanking the words in the sky.
  const RIDE = [[3.4, -2.0, 3.4, 'relight'], [3.8, 2.0, 3.4, 'lipsync'], [4.2, -2.0, 3.4, 'try-on'], [4.6, 2.0, 3.4, 'motion-control']]
  const HOLD = 0.8
  const pills = []
  {
    const used = new Set()
    for (const [T, across, ahead, id] of RIDE) {
      const c = WORLD.fly(T), cy = Math.cos(c.yaw), sy = Math.sin(c.yaw)
      const gx = c.x + across * cy + ahead * sy, gz = c.z - across * sy + ahead * cy
      let best = null
      for (const tl of WORLD.tiles) {
        if (tl.kind === 'target' || used.has(tl) || WORLD.reserved.has(tl)) continue
        const d = Math.hypot(tl.x - gx, tl.z - gz)
        if (!best || d < best.d) best = { tl, d }
      }
      best.tl.a = id; best.tl.b = id; used.add(best.tl)
      WORLD.ride(best.tl, T, T + HOLD)
      pills.push({ tl: best.tl, T, Tout: T + HOLD, name: TILE_NAME[id] })
    }
  }

  // the two lines of type, slammed into the sky; they whip up and away on 4.8
  const Y1 = 300, Y1UP = 228, Y2 = 404, SIZE = 160
  function words(ctx, t) {
    const OUT = 4.8
    const away = K.ease.in(K.clamp((t - OUT) / 0.22))
    if (away >= 1) return
    ctx.save()
    ctx.translate(0, -away * 420)
    ctx.globalAlpha = 1 - away
    // v3: the words punch with each kick (a hair — they must stay readable)
    const kp = 1 + 0.022 * MUSIC.pulse('kick', 0.26, 0.4)
    ctx.translate(W / 2, 330); ctx.scale(kp, kp); ctx.translate(-W / 2, -330)
    // a calm ground behind the words: the sky brightens under them as they land
    const g0 = K.clamp((t - 2.95) / 0.2)
    if (g0 > 0) {
      ctx.save(); ctx.globalAlpha *= g0
      const g = ctx.createRadialGradient(W / 2, 300, 0, W / 2, 300, 760); g.addColorStop(0, 'rgba(240,243,255,0.85)'); g.addColorStop(0.6, 'rgba(240,243,255,0.5)'); g.addColorStop(1, 'rgba(240,243,255,0)')
      ctx.translate(W / 2, 300); ctx.scale(1, 0.42); ctx.translate(-W / 2, -300); ctx.fillStyle = g; ctx.fillRect(0, -500, W, 1660)
      ctx.restore()
    }
    ctx.shadowColor = 'rgba(238,241,255,0.95)'; ctx.shadowBlur = 30
    // "Every tool." slams centred, then rides up a line when "One field." slams under it
    const up = K.spring(t - 3.6, 2.6, 0.62)
    slam(ctx, t, 'Every tool.', W / 2, K.lerp(Y1, Y1UP, up), 3.0, { size: SIZE, align: 'center', from: 2.0 })
    const w2 = slam(ctx, t, 'One field.', W / 2, Y2, 3.6, { size: SIZE, align: 'center', from: 2.0, color: B.ink })
    // "field." in the brand blue: drawn again over the ink, masked to its own word
    if (w2 > 0) {
      ctx.save()
      ctx.font = `800 ${SIZE}px "Inter", sans-serif`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = -0.04 * SIZE + 'px'
      const x0 = W / 2 - w2 / 2 + ctx.measureText('One ').width
      ctx.beginPath(); ctx.rect(x0 - 6, Y2 - 200, w2, 280); ctx.clip()
      slam(ctx, t, 'One field.', W / 2, Y2, 3.6, { size: SIZE, align: 'center', from: 2.0, color: B.blue })
      ctx.restore()
    }
    // v3: each snare runs a glint through the settled letters — a pale band sweeping left to right in 0.3 s
    const sh = MUSIC.last('snare', 0.4), age = sh ? MUSIC.now() - sh.t : 9
    if (age >= 0 && age < 0.3 && t > 3.2) {
      const bx = K.lerp(-250, W + 250, K.ease.out(age / 0.3))
      ctx.save(); ctx.shadowColor = 'transparent'
      ctx.beginPath(); ctx.moveTo(bx - 40, 0); ctx.lineTo(bx + 70, 0); ctx.lineTo(bx - 80, H); ctx.lineTo(bx - 190, H); ctx.closePath(); ctx.clip()
      const o = { size: SIZE, weight: 800, track: -0.04, align: 'center', color: '#e4e9ff' }
      txt(ctx, 'Every tool.', W / 2, K.lerp(Y1, Y1UP, up), o)
      if (t > 3.8) txt(ctx, 'One field.', W / 2, Y2, o)
      ctx.restore()
    }
    ctx.restore()
    // speed lines as they whip away
    if (away > 0) streaks(ctx, t, W / 2, 300 - away * 420, away * (1 - away) * 4, 5, { n: 40, color: 'rgba(47,63,232,0.25)' })
  }

  // each rider's name sits on its top edge, popping on with the lift and off as it drops
  function names(ctx, t, out) {
    for (const pl of pills) {
      if (t < pl.T || t > pl.Tout + 0.15) continue
      const P = out.cards.get(pl.tl)
      if (!P) continue
      const pop = K.spring(t - pl.T - 0.04, 3.2, 0.5), gone = K.ease.in(K.clamp((t - pl.Tout) / 0.12))
      const a = K.clamp(pop * 2.5) * (1 - gone)
      if (a <= 0.01) continue
      const x = (P[0][0] + P[1][0]) / 2, y = (P[0][1] + P[1][1]) / 2
      pill(ctx, pl.name, x, y - 8, { size: 30, dot: true, solid: true, scale: (0.6 + 0.4 * pop) * (1 - 0.5 * gone), alpha: a })
    }
  }

  function draw(ctx, s) {
    const t = s.t
    if (t >= WORLD.DIVE1) { ctx.drawImage(WORLD.portal(), 0, 0); return } // past the cut: the next scene's first frame
    WORLD.sky(ctx)
    const out = WORLD.draw(ctx, t)
    words(ctx, t)
    names(ctx, t, out)
    // the dive: speed lines from the tile we fall into
    const dv = K.clamp((t - 5.62) / 0.12) * (1 - K.clamp((t - 5.94) / 0.06))
    if (dv > 0) streaks(ctx, t, W / 2, H / 2, dv * 1.4, 21, { n: 70, color: `rgba(255,255,255,${0.55 * dv})` })
  }
  return { draw, pills }
})()
K.scene({ id: 'field', ...span('field'), draw: FIELD.draw })
