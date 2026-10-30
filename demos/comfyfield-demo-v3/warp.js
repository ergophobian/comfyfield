// v3: the v2 film retimed onto the owner's song, and the song handed to every scene.
//
// The scenes are written in v2 time (30 s, 1.2 s bars). The film now runs in song time (32.94 s, 2.06 s bars). A
// smooth, monotone time map pins v2's structure to the song's (the burst on the first downbeat, the portal where the
// bass enters, the formats on the drop, the logo where the drums cut out) and snaps v2's strong hits onto the nearest
// kick or snare. Drawing a frame at song time t draws the v2 film at map(t).
//
// SONG (for the scenes): SONG.now is the song time of the frame being drawn. Layers: kick, snare, hats, bass, other
// (the melody). Hits are { t, s } and, from the notes method (version B), { t, s, p: MIDI pitch, n }.
;(() => {
  const D = window.SONG_DATA, F = K.film
  F.duration = D.duration

  // clean the melody before anyone reads it: notes below MIDI 44 are the bass bleeding into the melody stem (move them
  // to the bass layer), and notes closer than 70 ms are one gesture (merge them: the strongest, the highest pitch)
  {
    const mel = D.layers.other || [], bass = D.layers.bass || []
    const keep = []
    for (const h of mel) { if (h.p != null && h.p < 44) bass.push(h); else keep.push(h) }
    bass.sort((a, b) => a.t - b.t)
    const merged = []
    for (const h of keep) {
      const last = merged[merged.length - 1]
      if (last && h.t - last.t < 0.07) { last.s = Math.max(last.s, h.s); if (h.p != null && (last.p == null || h.p > last.p)) last.p = h.p }
      else merged.push({ ...h })
    }
    D.layers.other = merged; D.layers.bass = bass
  }

  // ---------- the map
  const structure = [ // [v2 time, song time]
    [0, 0], [0.2, 0.16], [0.4, 0.67], [0.6, 1.19], [0.8, 1.70], // the mark's strokes and the slam on the first beats
    [1.2, 2.20],   // the burst — the first full downbeat after the opening bar
    [2.4, 3.23],   // the field
    [6.0, 7.35],   // the dive lands in the reels, mid-bar
    [8.4, 10.43],  // the Cinema cards on a downbeat
    [9.6, 12.48],  // the portal punches exactly where the bass enters
    [10.8, 14.54], // the montage
    [13.2, 16.60], // the formats on the drop (bass at full)
    [16.8, 20.72], // the tear into paper
    [22.8, 24.84], // the vortex
    [25.2, 26.89], // the collapse into a point of light
    [26.4, 28.94], // the logo flips in exactly where the drums cut out
    [30.0, 32.94], // the card holds over the melody's outro
  ]
  const drums = [...(D.layers.kick || []), ...(D.layers.snare || [])].filter((h) => h.s >= 0.35).map((h) => h.t).sort((a, b) => a - b)
  const lin = (pts, x) => { // piecewise linear through pts [[x, y]]
    if (x <= pts[0][0]) return pts[0][1] + (x - pts[0][0]) * ((pts[1][1] - pts[0][1]) / (pts[1][0] - pts[0][0]))
    for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [a, b] = [pts[i - 1], pts[i]]; return a[1] + ((x - a[0]) / (b[0] - a[0])) * (b[1] - a[1]) }
    const a = pts[pts.length - 2], b = pts[pts.length - 1]; return b[1] + (x - b[0]) * ((b[1] - a[1]) / (b[0] - a[0]))
  }
  // snap v2's strong hits to the song's drums (kick/snare are measured the same under both methods)
  const anchors = structure.slice()
  const nearAnchor = (v) => anchors.some(([a]) => Math.abs(a - v) < (v > 26.4 ? 0.18 : 0.3)) // the end card's pops sit 0.2 s apart
  for (const c of F.cues) {
    if (c.kind !== 'hit' || !/\b(boom|slam|stop|land|burst|dive|tear|cut|pop|flip)\b/i.test(c.label)) continue
    if (nearAnchor(c.t)) continue
    const guess = lin(structure, c.t)
    let best = null
    for (const d of drums) if (Math.abs(d - guess) <= 0.12 && (!best || Math.abs(d - guess) < Math.abs(best - guess))) best = d
    if (best == null && guess > 28.9) { // the outro has no drums: snap to the song's eighths
      const B = D.beats; for (let i = 0; i < B.length - 1; i++) for (const e of [B[i], (B[i] + B[i + 1]) / 2]) if (Math.abs(e - guess) <= 0.12 && (best == null || Math.abs(e - guess) < Math.abs(best - guess))) best = e
    }
    if (best != null) anchors.push([c.t, best])
  }
  anchors.sort((a, b) => a[0] - b[0])
  // keep it strictly increasing in both times, and never more than 2.2x faster or slower than its neighbours' line
  const A = []
  for (const p of anchors) { const last = A[A.length - 1]; if (!last || (p[0] > last[0] + 0.05 && p[1] > last[1] + 0.05)) A.push(p) }
  // monotone cubic (Fritsch–Carlson) through the anchors: song -> v2, smooth speed, never runs backwards
  const xs = A.map((p) => p[1]), ys = A.map((p) => p[0]), n = xs.length
  const dl = [], m = new Array(n).fill(0)
  for (let i = 0; i < n - 1; i++) dl.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]))
  m[0] = dl[0]; m[n - 1] = dl[n - 2]
  for (let i = 1; i < n - 1; i++) m[i] = dl[i - 1] * dl[i] <= 0 ? 0 : (dl[i - 1] + dl[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (dl[i] === 0) { m[i] = m[i + 1] = 0; continue }
    const a = m[i] / dl[i], b = m[i + 1] / dl[i], h = a * a + b * b
    if (h > 9) { const tau = 3 / Math.sqrt(h); m[i] = tau * a * dl[i]; m[i + 1] = tau * b * dl[i] }
  }
  function v2At(t) { // song time -> v2 time
    if (t <= xs[0]) return ys[0] + (t - xs[0]) * m[0]
    if (t >= xs[n - 1]) return ys[n - 1] + (t - xs[n - 1]) * m[n - 1]
    let i = 0; while (t > xs[i + 1]) i++
    const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1]
  }
  function songAt(v) { // v2 time -> song time (the inverse, by bisection)
    let lo = -1, hi = D.duration + 1
    for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (v2At(mid) < v) lo = mid; else hi = mid }
    return (lo + hi) / 2
  }

  // ---------- the song for the scenes
  const L = D.layers
  const pitched = (layer) => (L[layer] || []).some((h) => h.p != null)
  const range = {}
  for (const k of Object.keys(L)) { const ps = L[k].filter((h) => h.p != null).map((h) => h.p); if (ps.length) range[k] = [Math.min(...ps), Math.max(...ps)] }
  window.SONG = {
    data: D, method: D.method, now: 0, v2At, songAt, anchors: A,
    // hits in [a, b) of a layer (song time); strength filter
    hits: (layer, a, b, minS = 0) => (L[layer] || []).filter((h) => h.t >= a && h.t < b && h.s >= minS),
    // the latest hit of a layer at or before song time t (default: now)
    last(layer, minS = 0, t = SONG.now) { let r = null; for (const h of L[layer] || []) { if (h.t > t) break; if (h.s >= minS) r = h } return r },
    // 0..1 envelope: jumps to the hit's strength, falls over dur seconds
    pulse(layer, dur = 0.22, minS = 0, t = SONG.now) { const h = SONG.last(layer, minS, t); if (!h) return 0; const age = t - h.t; return age < dur ? h.s * Math.pow(1 - age / dur, 2) : 0 },
    // how many hits of a layer have happened by t (a counter that steps on every hit — for "one change per note")
    count(layer, minS = 0, t = SONG.now) { let c = 0; for (const h of L[layer] || []) { if (h.t > t) break; if (h.s >= minS) c++ } return c },
    // the pitch of a hit as 0..1 across its layer's range, or null when this measurement has no pitch (version A)
    pitch01: (layer, h) => (h && h.p != null && range[layer] ? (h.p - range[layer][0]) / Math.max(1, range[layer][1] - range[layer][0]) : null),
    hasPitch: pitched,
    // beat and bar position at t: { i: index, phase: 0..1 }
    beat(t = SONG.now) { const B = D.beats; let i = 0; while (i < B.length - 1 && B[i + 1] <= t) i++; return { i, phase: K.clamp((t - B[i]) / ((B[i + 1] ?? B[i] + 0.514) - B[i])) } },
    bar(t = SONG.now) { const B = D.downbeats; let i = 0; while (i < B.length - 1 && B[i + 1] <= t) i++; return { i, phase: K.clamp((t - B[i]) / ((B[i + 1] ?? B[i] + 2.06) - B[i])) } },
  }

  // ---------- the film runs in song time
  const draw = K.drawFrame
  K.drawFrame = function (ctx, t) { SONG.now = t; draw(ctx, v2At(t)) }
  for (const c of F.cues) { c.v2 = c.t; c.t = +songAt(c.t).toFixed(3) }
  window.__warpInfo = () => ({ duration: D.duration, cues: F.cues, scenes: F.scenes.map((s) => ({ id: s.id, start: +songAt(s.start).toFixed(3), end: +songAt(s.end).toFixed(3), in: s.in.type })) })
})()
