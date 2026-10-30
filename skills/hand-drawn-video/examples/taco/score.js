// The score — "Sesquiáltera for a taco", r2. Written on the film's clock and from its cues.
// 6/8 at dotted-quarter 80: 6 eighths a bar, 1.5 s a bar, the film's 25 bars. Even bars are 6/8 (two big beats),
// odd bars 3/4 (three): the son jarocho hemiola. A son band plays the kitchen: the jarana's rasgueo (doubled
// courses, the apagón mute between strokes) is the pulse; the requinto is the taquero (the lead, every
// flourish); the leona is the bass and the trucks; the tarima is the dancers' heels; the quijada is the son's
// rattle and the dawn; the tecomate is the earth (plants, layers, the night tune); palmeo, puff, crunch, plunk
// and comal are the kitchen. The hemiola is in three places at once: the strum's texture (6/8 rolls, 3/4 is
// square), the chord rhythm (0.75 + 0.75 | 1.0 + 0.5 s) and the hook's grouping (3+3, then 2+2+2).
// D minor, i–iv–V7 with the C# leading tone; the end turns to D major, the son's Picardy third.
;(() => {
const M = K.music
M.setup({
  bpm: 240, beatsPerBar: 6, key: 'D', mode: 'aeolian',
  reverb: { seconds: 1.0, wet: 0.12, predelay: 0.006, dark: 0.55 }, // a tiled kitchen, not a hall
  master: 0.9, human: { time: 0.008, vel: 0.12 },
  instGain: {},
})
// the balance (x BUS: the band is driven into the render's bus compressor, which keeps the plucks' peaks from
// setting the whole film's level). Scene sounds (paper, whoosh, swell, wood) keep their r1 balance against the band.
const BUS = 0.6 // JUDGE TEST: at 1.8 the raw bus sat ~10 dB over the render compressor's -8 dB threshold, a constant 2:1 squash of the whole arc
M.limiter = 9.5; M.ceiling = -2.2 // JUDGE TEST: the mix limiter replaces per-note soft()
Object.entries({ jarana: 3.0, requinto: 2.4, leona: 1.15, tarima: 1.0, tecomate: 0.28, quijada: 7.0, palmeo: 2.0, crunch: 11.0, puff: 2.0, plunk: 2.0, comal: 2.0,
  wood: 1, paper: 1, whoosh: 1, swell: 1, scrape: 1, chop: 1 }).forEach(([k, v]) => { M.instGain[k] = v * BUS })
M.meta = {
  signature: 'a son jarocho band in a kitchen: jarana rasgueo with apagón mutes in the 6/8 <-> 3/4 hemiola (chords change inside the bar), requinto lead, leona bass with its buzz, tarima zapateado, quijada, tecomate; D minor i-iv-V7, Picardy D major at the end; palmeo, puff, crunch, plunk, comal',
  avoids: 'explainer kit (glock, claps, kick, shaker, pad), add9 pop voicings, I-V-vi-IV, 4/4, mariachi/flamenco/klezmer, pan flute, hall reverb',
}

// ---------- the band. Built on the kit's Karplus-Strong string; only M.sr, M.svf and M.INST.*.fn are used.
const SR = M.sr, S = (...a) => M.INST.string.fn(...a)
// a note's own attack peak, rounded off (unity at low level, the top ~6 dB softened at k = 2): plucks and heels
// keep their snap, but the first millisecond no longer sets the whole film's peak normalisation
function soft(x, k = 3) {
  let pk = 0; for (let i = 0; i < x.length; i++) pk = Math.max(pk, Math.abs(x[i]))
  if (pk > 0) for (let i = 0; i < x.length; i++) x[i] = (pk / k) * Math.tanh((k * x[i]) / pk)
  return x
}

// JARANA: a doubled course. Two KS strings 5 cents apart, the second 2–4 ms late (the jangle no single guitar has),
// cedar body low and nasal. o.single = one string (for the apagón)
M.instrument('jarana', 'pitched', 0.5, (f, dur, vel, o, r) => {
  const p = { ring: o.ring ?? 0.9, bright: o.bright ?? 0.42, pick: o.pick ?? 0.22, body: o.body ?? 0.6, bodyLo: 185, bodyMid: 1150, damp: o.damp ?? 0.05 }
  const a = S(f, dur, vel, p, r)
  if (o.single) return a
  const b = S(f * Math.pow(2, (2 + 7 * r()) / 1200), dur, vel, p, r), lag = Math.floor((0.002 + 0.002 * r()) * SR)
  const out = new Float32Array(Math.max(a.length, b.length + lag))
  for (let i = 0; i < a.length; i++) out[i] += 0.6 * a[i]
  for (let i = 0; i < b.length; i++) out[i + lag] += 0.5 * b[i]
  return out
})

// REQUINTO JAROCHO: picked at the bridge with a horn espiga. Hard click, nasal 1.5 kHz, short ring
M.instrument('requinto', 'pitched', 0.6, (f, dur, vel, o, r) => {
  // dry and short: a string that is stopped, not a bar that rings. Plucked a sixth of the way in (hollow, nasal comb),
  // no resonant formant (the 1450 Hz peak was a steel pan's octave partial)
  const x = S(f, dur, vel, { ring: o.ring ?? 0.45, bright: o.bright ?? 0.8, pick: 0.17, body: 0.6, bodyLo: 230, bodyMid: 950, damp: o.damp ?? 0.025 }, r)
  // the horn espiga scraping across the string: 6 ms of noise around 3 kHz
  const nC = Math.floor(0.006 * SR), sc = new Float32Array(nC)
  for (let i = 0; i < nC; i++) sc[i] = r() * 2 - 1
  const scr = M.svf(sc, 3000, 0.9, 'bp')
  for (let i = 0; i < nC; i++) x[i] += scr[i] * 1.2 * vel * Math.exp(-i / SR / 0.0018)
  // the string slapping the frets while it swings wide: the leona's rattle, lighter
  let pk = 0; for (let i = 0; i < x.length; i++) pk = Math.max(pk, Math.abs(x[i]))
  const th = 0.4 * pk, bz = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); bz[i] = a > th ? Math.sign(x[i]) * (a - th) * (1 + 0.6 * (r() * 2 - 1)) : 0 }
  const b = M.svf(bz, 2300, 1.0, 'bp')
  for (let i = 0; i < x.length; i++) x[i] += 1.6 * b[i]
  return x
})

// LEONA: the son's bass guitar, plucked with an espiga. Dark KS plus a rattle that only buzzes while the string swings wide
M.instrument('leona', 'pitched', 0.75, (f, dur, vel, o, r) => {
  const x = S(f, dur, vel, { ring: 0.8, bright: 0.3, pick: 0.12, body: 0.7, bodyLo: 110, bodyMid: 700, damp: 0.05 }, r)
  let pk = 0; for (let i = 0; i < x.length; i++) pk = Math.max(pk, Math.abs(x[i]))
  const th = 0.35 * pk, bz = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); bz[i] = a > th ? Math.sign(x[i]) * (a - th) * (1 + 0.5 * (r() * 2 - 1)) : 0 }
  const b = M.svf(bz, 950, 1.1, 'bp')
  for (let i = 0; i < x.length; i++) x[i] += 2.2 * b[i]
  return x
})

// TARIMA: a heel on a hollow cedar platform. Two inharmonic box modes (not a kick's single sine), a board mode,
// the nail crack and loose boards. o.heel 1 = heel (boom), 0 = toe (tak); o.box retunes (second dancer 1.08, tortilla press 1.9)
M.instrument('tarima', 'perc', 0.75, (f, dur, vel, o, r) => {
  // a hollow cedar box: a short low boom of its air, the boards' knock at 230–700 Hz (a kick's energy is all under
  // 160 Hz; this one's is in the knock), and the crack of the heel's nails on the wood
  const n = Math.ceil(0.25 * SR), x = new Float32Array(n), h = o.heel ?? 1, B = o.box ?? 1
  const P = [[118 * B, 0.045, 0.45 * h], [232 * B, 0.04, 0.8 * (0.4 + 0.6 * h)], [387 * B, 0.028, 0.6], [655 * B, 0.018, 0.5], [1320 * B, 0.008, 0.35]]
  const ph = P.map(() => r() * 0.8)
  for (let i = 0; i < n; i++) { const t = i / SR; let v = 0; for (let p = 0; p < P.length; p++) { const [fr, tau, a] = P[p]; v += a * Math.exp(-t / tau) * Math.sin(2 * Math.PI * fr * t + ph[p]) } x[i] = v }
  const nc = Math.floor(0.014 * SR), cn = new Float32Array(nc)
  for (let i = 0; i < nc; i++) cn[i] = r() * 2 - 1
  const cr = M.svf(cn, 2600, 0.6, 'bp')
  for (let i = 0; i < nc; i++) x[i] += cr[i] * (2.2 + 1.0 * (1 - h)) * Math.exp(-i / SR / 0.0025)
  for (let k = 0; k < 4; k++) { const s = Math.floor((0.012 + 0.03 * r()) * SR); for (let i = 0; i < 0.002 * SR; i++) x[s + i] += (r() * 2 - 1) * 0.25 * Math.exp(-i / SR / 0.0005) }
  return x
})

// QUIJADA: a donkey's jaw struck with the fist. A bony knock, then ~12 loose teeth bouncing in their sockets,
// each faster and softer (the accelerating "brrrt")
M.instrument('quijada', 'perc', 0.4, (f, dur, vel, o, r) => {
  const len = o.len ?? 0.6, n = Math.ceil(len * SR), x = new Float32Array(n)
  for (let i = 0; i < 0.02 * SR; i++) { const t = i / SR; x[i] += 0.7 * Math.exp(-t / 0.005) * Math.sin(2 * Math.PI * 520 * t) }
  for (let k = 0; k < 12; k++) {
    let t = 0.003 + 0.01 * r(), gap = 0.03 + 0.025 * r(), a = 0.4 + 0.4 * r(); const fr = 1800 + 2600 * r()
    while (t < len - 0.005 && a > 0.015) {
      const s = Math.floor(t * SR)
      for (let i = 0; i < 0.003 * SR; i++) x[s + i] += a * Math.exp(-i / SR / 0.0007) * Math.sin(2 * Math.PI * fr * i / SR)
      t += gap; gap *= 0.82 + 0.1 * r(); a *= 0.8
    }
  }
  const y = M.svf(x, 2400, 0.9, 'bp')
  for (let i = 0; i < n; i++) x[i] = 0.5 * x[i] + y[i]
  return soft(x, 1.5)
})

// TECOMATE: a marimba de tecomates bar. The woodbar, a gourd that boosts the fundamental, and the charleo: a membrane
// that rattles while the gourd is loud. If it reads "kazoo", lower buzz to 0.8 / raise th to 0.3
M.instrument('tecomate', 'pitched', 0.5, (f, dur, vel, o, r) => {
  const x = M.INST.woodbar.fn(f, dur, vel, { ring: Math.min(0.4, o.ring ?? 0.35) }, r), g = M.svf(x, f, 6, 'bp') // JUDGE TEST: the bar rings 0.35 (time constant 0.6 s at D3), not 1.8 s: struck notes, not a sustained pad
  for (let i = 0; i < g.length; i++) g[i] /= 6 // the SVF band-pass peaks at Q (6x); normalised so the gourd boosts, not swamps
  let pk = 0; for (let i = 0; i < g.length; i++) pk = Math.max(pk, Math.abs(g[i]))
  // the charleo: the membrane slaps the gourd's rim once a cycle while the gourd swings past th. One-sided and sharp,
  // so it buzzes at the note's own pitch (the old symmetric clip left a sine: its buzz measured 22 dB under the bar)
  const th = (o.th ?? 0.3) * pk, bz = new Float32Array(x.length)
  for (let i = 1; i < x.length; i++) if (g[i] > th && g[i - 1] <= th) { // one slap per cycle, as hard as the gourd swings past th
    const a = ((g[i] - g[i - 1]) * SR) / (2 * Math.PI * f) / pk // the slope at the crossing gives the swing's excess over th
    for (let j = 0; j < 60 && i + j < x.length; j++) bz[i + j] += a * (r() * 2 - 1) * Math.exp(-j / 14)
  }
  const z = M.svf(bz, 1900, 1.2, 'bp'), buzz = (o.buzz ?? 8) * pk
  for (let i = 0; i < x.length; i++) x[i] = x[i] + 0.8 * g[i] + buzz * z[i]
  return x
})

// PALMEO: masa patted between two palms. Dull, dry, fleshy; no crack above 2 kHz (that is what made pat a clap)
M.instrument('palmeo', 'perc', 0.5, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.09 * SR), x = new Float32Array(n)
  for (let i = 0; i < n; i++) x[i] = r() * 2 - 1
  const s = M.svf(x, 650, 0.7, 'lp')
  for (let i = 0; i < n; i++) { const t = i / SR; x[i] = s[i] * Math.exp(-t / 0.009) * 1.4 + 0.7 * Math.exp(-t / 0.03) * Math.sin(2 * Math.PI * (o.body || 155) * t) }
  return x
})

// PUFF: a tortilla filling with steam. A rising "fff", then the skin going taut ("pomp" at +0.26 s; start it 0.26 s early)
M.instrument('puff', 'sfx', 0.45, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.35 * SR), raw = new Float32Array(n)
  for (let i = 0; i < n; i++) raw[i] = r() * 2 - 1
  const y = M.svf(raw, (i) => 250 + 1100 * Math.pow(i / n, 0.6), 2.5, 'bp')
  for (let i = 0; i < n; i++) y[i] *= Math.pow(Math.sin(Math.PI * Math.min(1, (i / n) * 1.15)), 2)
  const s = Math.floor(0.26 * SR)
  for (let i = 0; s + i < n; i++) { const t = i / SR; y[s + i] += 0.9 * Math.exp(-t / 0.03) * Math.sin(2 * Math.PI * (180 + 120 * Math.exp(-t / 0.01)) * t) }
  return y
})

// CRUNCH: a bite through a crisp tortilla and raw onion, ~30 tiny cracks front-loaded in 0.12 s
M.instrument('crunch', 'sfx', 0.55, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.16 * SR), x = new Float32Array(n)
  for (let c = 0; c < 30; c++) {
    const s = Math.floor(Math.pow(r(), 1.8) * 0.12 * SR), a = (0.3 + 0.7 * r()) * Math.exp(-s / SR / 0.04)
    for (let i = 0; i < 0.004 * SR && s + i < n; i++) x[s + i] += a * (r() * 2 - 1) * Math.exp(-i / SR / 0.0008)
  }
  const lo = M.svf(x, 1600, 0.8, 'bp'), hi = M.svf(x, 4200, 1, 'bp')
  for (let i = 0; i < n; i++) x[i] = lo[i] + 0.6 * hi[i]
  return soft(x, 3)
})

// PLUNK: kernels dropped into limewater. A handful of small bubbles whose pitch rises as each closes
M.instrument('plunk', 'sfx', 0.4, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.25 * SR), x = new Float32Array(n)
  for (let k = 0; k < 7; k++) {
    const s = Math.floor(k * (0.012 + 0.02 * r()) * SR), F = 500 + 900 * r(), a = 0.4 + 0.6 * r()
    let ph = 0
    for (let i = 0; s + i < n && i < 0.06 * SR; i++) { const t = i / SR; ph += 2 * Math.PI * F * (1 + 6 * t) / SR; x[s + i] += a * Math.exp(-t / 0.018) * Math.sin(ph) }
  }
  return x
})

// COMAL: water and fat spitting on hot clay. Mostly pops thinning out over the note; almost no hiss
M.instrument('comal', 'sfx', 0.3, (f, dur, vel, o, r) => {
  const n = Math.ceil(dur * SR), x = new Float32Array(n)
  for (let i = 0; i < n; i++) { const d = 0.0015 * (1 - 0.7 * i / n); x[i] = (r() * 2 - 1) * 0.012 +(r() < d ? (r() * 2 - 1) * (1 + 2 * r()) : 0) }
  const y = M.svf(x, 3000, 0.7, 'hp')
  for (let i = 0; i < n; i++) y[i] *= Math.min(1, i / (0.03 * SR)) * Math.min(1, (n - i) / (0.4 * SR))
  return y
})

// ---------- the clock
const tb = (b, k = 0) => M.time(b, k) // bar b, eighth k
const odd = (b) => b % 2 === 1 // the 3/4 bars
const NB = 25
const hr = K.rng('r2-hands-b') // one humanize draw per stroke, so a stroke's courses stay in order
const jit = () => (hr() - 0.5) * 2 * M.human.time
const vj = () => 1 + (hr() - 0.5) * 2 * M.human.vel
let TK = 0 // a take index, so repeated strokes are not one cached sample

// ---------- harmony: the son's own minor. Re-entrant 5-course jarana voicings (C4–D5) in down-stroke order,
// plain triads and only the dominant 7th. Leona plays root (and the 3rd in 3/4 bars), C2–D3.
const CH = {
  Dm: { root: 'D', third: 'F', v: ['A4', 'D4', 'F4', 'A4', 'D5'] },
  Gm: { root: 'G', third: 'Bb', v: ['G4', 'D4', 'G4', 'Bb4', 'D5'] },
  A7: { root: 'A', third: 'C#', v: ['A4', 'C#4', 'E4', 'G4', 'A4'] },
  Asus: { root: 'A', third: 'D', v: ['A4', 'D4', 'E4', 'A4', 'D5'] },
  C7: { root: 'C', third: 'E', v: ['G4', 'C4', 'E4', 'Bb4', 'C5'] },
  F: { root: 'F', third: 'A', v: ['A4', 'C4', 'F4', 'A4', 'C5'] },
  Bb: { root: 'Bb', third: 'D', v: ['F4', 'D4', 'F4', 'Bb4', 'D5'] },
  Am: { root: 'A', third: 'C', v: ['A4', 'C4', 'E4', 'A4', 'C5'] },
  D: { root: 'D', third: 'F#', v: ['A4', 'D4', 'F#4', 'A4', 'D5'] },
}
// one chord, or [first, second]: the second starts at eighth 3 in 6/8 (even) bars, eighth 4 in 3/4 (odd) bars
const PROG = ['Dm', ['Dm', 'A7'], ['Dm', 'Gm'], ['A7', 'Dm'], ['Dm', 'Gm'], ['A7', 'Dm'], ['Dm', 'Gm'], ['C7', 'F'], ['Bb', 'Gm'], 'A7',
  'Bb', 'Am', 'Gm', ['Asus', 'A7'], ['Dm', 'Gm'], ['A7', 'Dm'], ['Dm', 'Gm'], ['C7', 'F'], ['Bb', 'Gm'], 'A7',
  'Dm', 'Dm', 'Gm', 'D', 'D']
const chordAt = (b, k = 0) => {
  const i = Math.max(0, Math.min(PROG.length - 1, Math.floor(b))), e = PROG[i]
  return CH[typeof e === 'string' ? e : e[k >= (i % 2 ? 4 : 3) ? 1 : 0]]
}
const twoChords = (b) => typeof PROG[b] !== 'string'

M.section('Intro — the taco built and taken apart', 0, 6, 'jarana alone, requinto plucks the toppings; palmeo and the tecomate lift the layers')
M.section('Countdown — growing', 6, 15, 'the son arrives: rasgueo in the hemiola, leona, tarima heels; tecomate climbs a step a bar; requinto hook from the pig')
M.section('Night — map and nixtamal', 15, 21, 'drop: a soft jarana trémolo, the night tune rolled on the tecomate, the leona as the truck; nobody dances')
M.section('Fire — trompo, comal, shave', 21, 30, 'fullest: both dancers, redobles, quijada; the puff stops the band; the requinto arcs with the pineapple')
M.section('Dinner — three bites', 30, 34.5, 'the toppings rhyme, then stop-time: Gm – Bb – A7 on the bites, the C# alone')
M.section('End card', 34.5, 37.5, 'remate: the last stamp, a D major trémolo, the Picardy third, ringing out')

// ---------- the cues, read first: the groove answers some of them by accenting what is already playing
const CUES = (K.film.cues || []).filter((c) => c.kind !== 'scene').map((c) => ({ t: c.t, L: String(c.label).toLowerCase() }))
const cueT = (re, fb) => { const c = CUES.find((c) => re.test(c.L)); return c ? c.t : fb }
const e8 = (t) => Math.round(t / 0.25)
const ACCENT = new Set(CUES.filter((c) => /stops and roots|snout flicks|ripe and gold|shoots past|tassels out/.test(c.L)).map((c) => e8(c.t)))
const ARRIVE = new Set(CUES.filter((c) => /truck reaches/.test(c.L)).map((c) => Math.round(c.t / 0.125))) // the night trémolo leans into each arrival
const ON_CUE = new Set(CUES.map((c) => e8(c.t))) // eighths that carry a cue: the band plays those on the grid, not lilted
const BACK = new Set(CUES.filter((c) => /crowns it/.test(c.L)).map((c) => e8(c.t))) // the strum steps back: the requinto's D5 and the quijada carry it
const GROW = CUES.filter((c) => /rises from|flowers open|ripe|grown|surge|shoots past|tassels/.test(c.L)).map((c) => c.t)
const BY_GROOVE = /stops and roots|snout flicks|ripe and gold|shoots past|tassels out|rises from|flowers open|grown|surge|dry ears|knife flicks|lands on the taco|puffs/

// ---------- the jarana's rasgueo. ↓ down (all 5 courses), ↑ up (top 3 courses, reversed), ⊗ apagón (palm-muted)
const PAN_J = -0.25
function stroke(t, ch, kind, vel, o = {}) {
  const j0 = o.exact ? 0 : jit(), dt = o.grid ? 0 : j0, v = vel * (o.exact ? 1 : Math.min(1.04, vj())) // a hand varies, but no stroke jumps out of the strum; a cue's eighth is on the grid
  if (kind === 'x') {
    M.chord('jarana', t + dt, ch.v, 0.012, v, { strum: 0.003, damp: 0.015, bright: 0.3, body: 0.8, single: true, pan: PAN_J, exact: true, gain: 0.5, tk: TK++ % 3 }) // all attack: its level sits under the strokes
    return
  }
  const notes = kind === 'u' ? ch.v.slice(2).reverse() : o.top ? ch.v.slice(2) : ch.v
  // a hand, not a harp: each course's gap varies (3–7 ms), and the stroke fades a little as it crosses
  let tc = t + dt
  notes.forEach((p, i) => { M.note('jarana', tc, p, o.dur ?? 0.2, v * (1 - i * 0.04), { pan: PAN_J, exact: true, tk: TK++ % 5, ...(o.opt || {}) }); tc += 0.005 * (0.6 + 0.8 * hr()) })
}
// eighths; 6/8 rolls ("trrum-tum-chk"), 3/4 is dry and square ("tum-chk tum-chk")
const PAT6 = [[0, 'd', 1.0], [0.5, 'u', 0.45], [1, 'd', 0.6], [2, 'x', 0.6], [3, 'd', 0.95], [3.5, 'u', 0.45], [4, 'd', 0.6], [5, 'x', 0.6]]
const PAT3 = [[0, 'd', 1.0], [0.5, 'u', 0.4], [1, 'd', 0.5], [2, 'd', 0.95], [2.5, 'u', 0.4], [3, 'd', 0.5], [4, 'd', 0.95], [4.5, 'u', 0.45], [5, 'x', 0.6]] // JUDGE TEST: 3/4 rings through (no off-beat mutes); only the k5 apagón
function rasgueo(b, lvl, o = {}) {
  const pat = odd(b) ? PAT3 : PAT6
  pat.forEach(([k, kind, v], i) => {
    if (o.only && !o.only.includes(k)) return
    if (o.skip && o.skip.includes(k)) return
    if (o.before != null && tb(b, k) >= o.before - 0.01) return
    const next = i + 1 < pat.length ? pat[i + 1][0] : 6
    const cueHere = Number.isInteger(k) && ON_CUE.has(e8(tb(b, k)))
    const t = tb(b, k) + (!odd(b) && (k === 1 || k === 4) && !cueHere ? 0.01 : 0) // the lilt: 6/8 eighths 1 and 4 a hair late
    let kd = kind, vv = v
    if (Number.isInteger(k) && ACCENT.has(e8(tb(b, k)))) { if (kd === 'x') { kd = 'd'; vv = 0.95 } else vv *= 1.15 } // a cue: a full stroke for the mute
    if (Number.isInteger(k) && BACK.has(e8(tb(b, k)))) vv *= 0.7
    stroke(t, chordAt(b, k), kd, lvl * vv * (o.mul ? o.mul(k) : 1), { dur: Math.max(0.1, (next - k) * 0.25 - 0.01), grid: cueHere })
  })
}

// ---------- the tarima: zapateado, counted in 16ths (s = 0..11, 0.125 s). Heels 4 ms early; toes are pickups into
// the heels, never on the off-beats; a redoble into the next bar; the second dancer 12 ms late, heels only
function heel(t, v, two) {
  M.hit('tarima', t - 0.004, v, { heel: 1, pan: 0.12, send: 0.4 })
  if (two) M.hit('tarima', t + 0.012, v * 0.7, { heel: 1, box: 1.08, pan: -0.15, send: 0.4 })
}
function tarima(b, lvl, o = {}) {
  const t0 = tb(b), three = odd(b), ok = (s) => !(o.skip && o.skip.includes(s))
  const heels = three ? [0, 4, 8] : [0, 6], toes = three ? [3, 7, 11] : [5, 11]
  for (const s of heels) if (ok(s)) {
    const acc = ACCENT.has(e8(t0 + s * 0.125)) && s % 2 === 0
    heel(t0 + s * 0.125, lvl * (s === 0 ? 1 : 0.85) * (acc ? 1.1 : 1), o.two || acc)
  }
  if (o.toes) for (const s of toes) if (ok(s) && !(o.redoble && s === 11)) M.hit('tarima', t0 + s * 0.125, lvl * 0.45, { heel: 0, pan: 0.1, send: 0.4 })
  if (o.redoble) [[9, 0.4], [10, 0.5], [11, 0.7]].forEach(([s, m]) => { if (ok(s)) M.hit('tarima', t0 + s * 0.125, lvl * m, { heel: s === 11 ? 0.4 : 0, pan: 0.1, send: 0.4 }) })
}

// ---------- the leona: root on every chord change; in 6/8 the next bar's root on k5; in 3/4 the 3rd on k2.
// Each new note in the octave nearest the last one, within C2–D3. Nothing longer than 0.6 s.
const PCN = { C: 0, 'C#': 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 }
let lastLow = M.n('D2')
function low(pc) {
  let best = 0
  for (let m = 36; m <= 50; m++) if (m % 12 === PCN[pc] && (!best || Math.abs(m - lastLow) < Math.abs(best - lastLow))) best = m
  return best
}
function leona(t, m, dur, vel, o = {}) { lastLow = m; M.note('leona', t, m, Math.min(0.6, dur), vel, { pan: 0.05, send: 0.4, ...o }) }
function leonaBar(b, lvl, o = {}) {
  const ok = (k) => !(o.skip && o.skip.includes(k)), c1 = chordAt(b, 0), c2 = chordAt(b, 5), two = twoChords(b)
  const L = (k, pc, d, v) => { if (ok(k)) leona(tb(b, k), low(pc), d, v) }
  if (odd(b)) { L(0, c1.root, 0.48, lvl); L(2, c1.third, 0.45, lvl * 0.75); if (two) L(4, c2.root, 0.48, lvl * 0.9) }
  else { L(0, c1.root, 0.6, lvl); if (two) L(3, c2.root, 0.45, lvl * 0.9); if (!o.noAnt && b + 1 < NB) L(5, chordAt(b + 1, 0).root, 0.22, lvl * 0.6) }
}

// ---------- the requinto: the taquero. The hemiola in the melody's grouping: 3+3 in the 6/8 bar, 2+2+2 in the 3/4
// [eighth from phrase start, pitch, eighths]
const HOOK_A = [[0, 'A4', 1], [1, 'D5', 1], [2, 'F5', 1], [3, 'G5', 2], [5, 'F5', 1], [6, 'E5', 2], [8, 'C#5', 2], [10, 'D5', 2]] // Dm|Gm · A7→Dm
const HOOK_A2 = [[0, 'A4', 1], [1, 'D5', 1], [2, 'F5', 1], [3, 'G5', 2], [5, 'F5', 1], [7, 'E5', 1], [8, 'Bb4', 2], [10, 'A4', 2]] // Dm|Gm · C7→F (k6 left empty for the puff)
const HOOK_A2F = [[0, 'A4', 1], [1, 'D5', 1], [2, 'F5', 1], [3, 'G5', 2], [5, 'F5', 1], [6, 'E5', 2], [8, 'Bb4', 2], [10, 'A4', 2]] // the same over C7→F, k6 filled (bars 6–7: HOOK_A's C#5 would sit on C7)
const HOOK_B = [[0, 'D5', 1], [1, 'F5', 1], [2, 'D5', 1], [3, 'Bb4', 2], [5, 'A4', 1], [6, 'G4', 1], [7, 'E4', 1], [8, 'A4', 1], [9, 'G4', 1], [10, 'E4', 2]] // Bb|Gm · A7, falls into the night, ends open on the 5th
const RQ = { pan: 0.2, send: 0.6 }
function requinto(b, phrase, vel = 0.65, o = {}) {
  for (const [k, p, d] of phrase) {
    const t = tb(b) + k * 0.25, m = M.n(p)
    if (k === 0) M.note('requinto', t - 0.035, m - 2, 0.03, vel * 0.5, RQ) // ligado: a grace a step below
    if (o.repique && d >= 2) { // a mordent, not a roll: the note, a flick to the step above, the note again and held (a same-pitch roll is a steel pan's)
      const up = [2, 1, 2, 0, 1, 2, 1, 2, 0, 2, 2, 1][m % 12]
      M.note('requinto', t, m, 0.06, vel, RQ); M.note('requinto', t + 0.0625, m + up, 0.06, vel * 0.55, RQ); M.note('requinto', t + 0.125, m, d * 0.25 - 0.145, vel * 0.75, RQ)
    }
    else M.note('requinto', t, m, d * 0.25 - 0.02, vel * (k === 0 ? 0.8 : 1), RQ) // the ligado's note is slurred from the grace, not re-picked
  }
}

// ---------- the tecomate: rolled notes (strikes every 0.0625 s, two mallets). A growth cue swells one strike ×1.6
function roll(t, p, dur, v0, v1, o = {}) {
  const n = Math.max(1, Math.round(dur / 0.0625))
  for (let j = 0; j < n; j++) {
    const tj = t + j * 0.0625, grow = GROW.some((g) => Math.abs(g - tj) < 0.031)
    const v = (o.alt ? (j % 2 ? o.alt[1] : o.alt[0]) : (v0 + ((v1 - v0) * j) / Math.max(1, n - 1)) * (j % 2 ? 0.82 : 1)) * (grow ? 1.6 : 1)
    M.note('tecomate', tj, p, 0.0625, v, { ring: 0.6, pan: o.pan ?? 0.3, send: o.send ?? 0.8, gain: o.gain ?? 0.5, tk: j % 3 }) // overlapping strikes add up: a roll sits lower than a single strike
  }
}

// ---------- 0–6 s, bars 0–3: the taco built, then taken apart
stroke(0, CH.Dm, 'd', 0.32, { exact: true, dur: 0.7 }) // the hero stroke, exactly on 0
stroke(tb(0, 3), CH.Dm, 'd', 0.3, { dur: 0.7 })
rasgueo(1, 0.30)
rasgueo(2, 0.32); rasgueo(3, 0.34)
// JUDGE TEST: the continuous palmeo eighths (a 155 Hz thump on every eighth = the "kick drops in at 0:03") are gone
leonaBar(2, 0.42); leonaBar(3, 0.42)
// the layers rise on the tecomate, low and buzzing: each lift a rung higher up the chord tones from D3 (the lime is
// the top rung). Two layers lifting on the same eighth strike two bars at once: the rung and the chord tone two above.
{
  // a lift cue names the top layer of what lifts; the layers below it, up to the next cue's layer, lift with it
  const STACK = ['salsa', 'cilantro', 'onion', 'pineapple', 'pork', 'tortilla1', 'tortilla2']
  const lifts = CUES.filter((c) => /^apart:/.test(c.L)).map((c) => ({ t: c.t, at: STACK.findIndex((k) => c.L.includes(`: ${k} lifts`)) }))
  const groups = []
  lifts.forEach((c, i) => {
    const nxt = lifts.slice(i + 1).find((d) => d.at >= 0), n = c.at < 0 ? 1 : Math.max(1, (nxt ? nxt.at : STACK.length) - c.at)
    const g = groups.find((g) => Math.abs(g.t - c.t) < 0.02); if (g) g.n += n; else groups.push({ t: c.t, n })
  })
  let rung = M.n('C#3')
  groups.forEach((g, i) => {
    const b = (g.t - M.offset) / M.barLen(), pcs = new Set(chordAt(b, (b % 1) * 6).v.map((p) => M.n(p) % 12))
    let m = rung + 1; while (!pcs.has(m % 12)) m++
    rung = m
    M.note('tecomate', g.t, m, 0.5, 0.32, { ring: 0.8, pan: i % 2 ? -0.3 : 0.3, send: 0.8, exact: true })
    if (g.n > 1) { let m2 = m, k = 0; while (k < 2) { m2++; if (pcs.has(m2 % 12)) k++ } M.note('tecomate', g.t, m2, 0.5, 0.19, { ring: 0.8, pan: i % 2 ? 0.3 : -0.3, send: 0.8, exact: true }) }
  })
}

// ---------- 6–15 s, bars 4–9: the countdown, the son arrives
const CLIMB = ['D3', 'E3', 'F3', 'G3', 'A3']
for (let b = 4; b < 10; b++) {
  const last = b === 9 // its k5 is empty: one eighth of breath before the night
  rasgueo(b, 0.35 + 0.015 * (b - 4), { skip: last ? [5] : [] }) // JUDGE TEST: 1.5 dB under r2, so the fire stands 3 dB over it after the limiter
  { // JUDGE TEST: the countdown's bass holds D (D2, D3 on the middle beat) while the chords move over it; roots arrive with the fire
    const P = (k, m, d, vv) => leona(tb(b, k), M.n(m), d, vv)
    if (odd(b)) { P(0, 'D2', 0.48, 0.5); P(2, 'D3', 0.45, 0.38); P(4, 'D2', 0.48, 0.45) }
    else { P(0, 'D2', 0.6, 0.5); P(3, 'D3', 0.45, 0.45); P(5, 'D2', 0.22, 0.3) }
  }
  if (b < 6) tarima(b, 0.36, { redoble: b === 5 }) // JUDGE TEST: the new heel has its crack, so it reads 2.5 dB louder at the same level
  else tarima(b, 0.37, { toes: true, redoble: b === 7, skip: last ? [10, 11] : [] })
  // the earth climbs a step a bar, struck on the bar's big beats (2 in 6/8, 3 in 3/4): the hemiola in a third voice, not a pad
  const v = 0.24 + 0.015 * (b - 4), beats = odd(b) ? [0, 2, 4] : [0, 3]
  const tec = (k, p, vv) => M.note('tecomate', tb(b, k), p, 0.5, vv, { ring: 0.35, pan: 0.3, send: 0.6 })
  if (!last) beats.forEach((k, i) => tec(k, CLIMB[b - 4], v * (i ? 0.7 : 1)))
  else { tec(0, 'C#4', v); tec(2, 'E4', v * 0.8) }
}
requinto(6, HOOK_A2F, 0.56) // the requinto enters with the pig
requinto(8, HOOK_B, 0.58)

// ---------- 15–21 s, bars 10–13: night. Nobody dances on the night shift
for (let b = 10; b < 14; b++) {
  const dawn = b === 13
  for (let j = 0; j < 12; j++) { // a soft trémolo: 16th strokes, down/up, top 3 courses, swelling through the bar
    const arr = ARRIVE.has(Math.round((tb(b) + j * 0.125) / 0.125))
    const ch = chordAt(b, j / 2), v = 0.075 * (0.7 + 0.3 * Math.sin((Math.PI * j) / 12)) * (dawn ? 1.3 : 1) * (arr ? 1.5 : 1)
    const notes = j % 2 ? ch.v.slice(2).reverse() : ch.v.slice(2)
    M.chord('jarana', tb(b) + j * 0.125 + (arr ? 0 : jit() * 0.5), notes, 0.14, v, { strum: 0.004, bright: dawn ? 0.55 : 0.3, damp: 0.03, send: 0.6, pan: -0.2, exact: true, tk: j % 3 })
  }
  const r = M.n(['Bb2', 'A2', 'G2', 'A2'][b - 10]) // the leona is the truck
  leona(tb(b, 0), r, 0.4, 0.34); leona(tb(b, 3), r, 0.25, 0.24); M.note('leona', tb(b, 5), r + 7, 0.15, 0.2, { pan: 0.05, send: 0.4 })
  M.hit('scrape', tb(b, 0), 0.1, { dur: 0.22, rate: 30, tone: 1100, pan: -0.3 }) // JUDGE TEST: the engine, once a bar and lower (two 0.22-s noise bursts a bar read as a shaker)
}
// the night tune, an octave down on the tecomate: falls and rises like a road. Long notes rolled, eighths struck once
const NIGHT = [['A3', 0, 2], ['G3', 2, 1], ['F3', 3, 2], ['E3', 5, 1], ['D3', 6, 3], ['E3', 9, 1], ['F3', 10, 2], ['A3', 12, 3], ['C4', 15, 1], ['Bb3', 16, 2], ['A3', 18, 3], ['G3', 21, 1], ['E3', 22, 2]]
for (const [p, k, d] of NIGHT) {
  const t = tb(10) + k * 0.25
  M.note('tecomate', t, p, d * 0.25, d >= 2 ? 0.17 : 0.13, { ring: d >= 2 ? 1.0 : 0.6, pan: 0.2, send: 0.8 }) // struck once and left to ring: a tune, not a pad
}

// ---------- 21–30 s, bars 14–19: fire — the fullest bars
const FJ = 0.7, FT = 0.68, FL = 0.88, FR = 0.8 // the fire's levels: jarana, tarima, leona, requinto
const puffT = cueT(/puffs/, 25.75), flickT = cueT(/knife flicks/, 28.75), landT = cueT(/lands on the taco/, 29.25)
lastLow = M.n('A2')
for (let b = 14; b < 20; b++) {
  const puffBar = b === 17, landBar = b === 19
  if (puffBar) { // the band holds its breath on k0; the puff's "pomp" brings everyone back on k1
    M.hit('puff', puffT - 0.26, 0.7, { exact: true }) // its taut "pomp" lands 0.26 s in
    rasgueo(b, FJ, { skip: [0, 1] })
    stroke(puffT, CH.C7, 'd', FJ, { exact: true, dur: 0.24 })
    heel(puffT, FT * 0.85, true)
    leona(puffT, M.n('C2'), 0.24, FL)
    leona(tb(b, 2), low('E'), 0.45, FL * 0.75); leona(tb(b, 4), low('F'), 0.48, FL * 0.9)
    tarima(b, FT, { toes: true, redoble: true, two: true, skip: [0, 1, 2] })
  } else if (landBar) { // the pineapple flies (the requinto run) and lands on k3
    rasgueo(b, FJ, { only: [0, 1, 2], mul: (k) => (k ? 0.7 : 1) })
    stroke(landT, CH.A7, 'd', FJ * 1.05, { exact: true, dur: 0.24 })
    heel(landT, 0.68, true)
    M.hit('quijada', landT, 0.48, { pan: -0.3 })
    leona(tb(b, 0), low('A'), 0.48, FL); leona(tb(b, 2), low('C#'), 0.45, FL * 0.75)
    leona(tb(b, 4), M.n('A2'), 0.45, 0.8) // k4: the leona alone
    tarima(b, FT, { toes: true, two: true, skip: [6, 7, 8, 9, 10, 11] })
  } else {
    rasgueo(b, FJ)
    leonaBar(b, FL)
    tarima(b, FT, { toes: true, redoble: true, two: true })
  }
  if (odd(b) && !landBar) M.hit('quijada', tb(b, 5), 0.38, { pan: -0.3 })
}
requinto(14, HOOK_A, FR, { repique: true })
requinto(16, HOOK_A2, FR)
requinto(18, HOOK_B.filter(([k]) => k < 6), FR, { repique: true })
M.note('requinto', tb(19, 0), 'G4', 0.22, 0.65, RQ)
;['A4', 'C#5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C#5'].forEach((p, j) => M.note('requinto', flickT + j * 0.0625, p, 0.07, 0.5 + (0.3 * j) / 7, RQ)) // the arc: apex A5 at 29.0
M.note('requinto', landT, 'A4', 0.5, 0.74, RQ)
M.note('requinto', tb(19, 5), 'C#5', 0.22, 0.6, RQ) // pickup into the dinner
// JUDGE TEST: the 24–27 s palmeo eighths are gone too

// ---------- 30–34.5 s, bars 20–22: dinner, then three bites in stop-time
// The groove thins to one stroke and its mute, 0.75 and 0.5 s before the first bite, then silence until it.
const BITE_T = CUES.filter((c) => /^bite/.test(c.L)).map((c) => c.t)
const b1 = BITE_T.length ? BITE_T[0] : tb(21, 3), lastCall = b1 - 0.75
lastLow = M.n('A2')
for (let b = 20; tb(b) < lastCall - 0.01; b++) rasgueo(b, 0.42, { skip: [1, 4], before: lastCall })
leona(tb(20, 0), low('D'), 0.6, 0.65)
heel(tb(20), 0.45)
stroke(lastCall, chordAt((lastCall - M.offset) / M.barLen()), 'd', 0.45, { dur: 0.24 }); stroke(lastCall + 0.25, CH.Dm, 'x', 0.4)
if (lastCall - tb(20) > 0.4) leona(lastCall, low('D'), 0.22, 0.6)
heel(lastCall, 0.4)
const BITE = [['Gm', 'G2'], ['Bb', 'Bb2'], ['A7', 'A2']] // the chords climb to the end
BITE_T.forEach((t, i) => {
  const [cn, r] = BITE[Math.min(i, 2)]
  M.hit('crunch', t, 0.8, { exact: true })
  stroke(t, CH[cn], 'd', 0.62, { exact: true, dur: 0.1, opt: { damp: 0.04 } })
  leona(t, M.n(r), 0.25, 0.7)
  heel(t, 0.6, true)
})
const endT = ((K.film.cues || []).find((c) => c.kind === 'scene' && c.label === 'end') || { t: tb(23) }).t
M.note('requinto', endT - 0.25, 'C#5', 0.24, 0.62, RQ) // the leading tone alone in the last gap, as the plate is cleared

// ---------- 34.5–37.5 s, bars 23–24: the end card — a remate, D major, ringing out under the logo
heel(endT, 0.6, true) // both dancers' last stamp
M.hit('quijada', endT, 0.32, { len: 0.8, pan: -0.3 })
M.note('leona', endT, 'D2', 0.9, 0.6, { pan: 0.05, send: 0.4 })
for (let j = 0; j < 6; j++) stroke(endT + j * 0.125, CH.D, j % 2 ? 'u' : 'd', 0.6 - (0.36 * j) / 5, { dur: 0.13 })
stroke(endT + 0.75, CH.D, 'd', 0.6, { dur: 2.2, opt: { ring: 2.4 } }) // the last full stroke rings under the logo, -55 dB by 37.5
M.note('leona', endT + 0.75, 'D2', 0.6, 0.55, { pan: 0.05, send: 0.4 })
M.note('requinto', endT, 'D5', 0.22, 0.6, RQ)
M.note('requinto', endT + 0.25, 'F#5', 0.5, 0.62, RQ) // the Picardy third, once

// ---------- the cues: every moment the scenes registered gets its sound, from what it is
const sceneSound = { slide: 'paper', turn: 'paper', drop: 'whoosh', push: 'whoosh', ink: 'swell', fade: null, cut: null }
const kinds = {}
for (const sc of K.film.scenes) kinds[sc.id] = sc.in.type
const TOP = { pineapple: 'D4', onion: 'E4', cilantro: 'F4', salsa: 'A4', lime: 'D5' } // the toppings ring a rising line; the dinner rhymes it
const TRUCK = ['E4', 'E3', 'C4', 'A3'], TPAN = [-0.6, 0.6, -0.25, 0] // four routes close in from both sides on one corner (A3): a wedge, not a fanfare
const SLAB = ['D3', 'F3', 'A3'] // the stack climbs
let nTruck = 0, nSlab = 0
const wet = (t, v, tone) => { M.hit('palmeo', t, v, { body: 110, pan: 0.1, send: 0.3 }); M.note('tecomate', t, tone, 0.4, 0.34, { ring: 0.6, pan: 0.3, send: 0.8 }) }
for (const c of K.film.cues) {
  const L = String(c.label).toLowerCase(), t = c.t
  if (c.kind === 'scene') {
    const fx = sceneSound[kinds[c.label]]
    if (fx === 'swell') M.hit('swell', Math.max(0, c.t - 0.45), 0.5, { dur: 0.5 })
    else if (fx) M.hit(fx, Math.max(0, c.t - 0.02), 0.45, { len: 0.45, pan: 0.1 })
    if (c.t > 0) M.hit('wood', c.t, 0.5, { tone: 1500, pan: -0.3 }) // the countdown's tick on every new step
    continue
  }
  if (/^bite/.test(L) || /^apart:/.test(L) || BY_GROOVE.test(L)) continue // scored above, by the band itself
  let m
  if ((m = /^(taco|dinner): (\w+) lands/.exec(L))) {
    const p = TOP[m[2]] || 'D4', v = m[1] === 'taco' ? 0.42 : 0.55
    if (m[1] === 'taco' && m[2] === 'salsa') { M.note('requinto', t, p, 0.12, v, { ...RQ, exact: true }); M.note('requinto', t + 0.25, M.n(p) - 2, 0.2, v * 0.6, RQ) } // it drizzles off: the note and a step down
    else M.note('requinto', t, p, 0.22, v, { ...RQ, exact: true })
  }
  else if (/unfold|fold opens/.test(L)) M.hit('palmeo', t, 0.3, { body: 120, send: 0.3 }) // the tortilla laid flat
  else if (/crown lands/.test(L)) wet(t, 0.34, 'A3')
  else if (/slab|stack climbs/.test(L)) { wet(t, 0.34, SLAB[Math.min(nSlab, 2)]); if (nSlab === 0) M.hit('comal', t, 0.2, { dur: 2.5, pan: 0.2 }); nSlab++ } // the trompo's fat
  else if (/slices fall/.test(L)) wet(t, 0.34, 'F3')
  else if (/trucks set off/.test(L)) M.note('leona', t, 'Bb2', 0.3, 0.35, { pan: 0.05, send: 0.4 })
  else if (/truck reaches/.test(L)) { M.note('tecomate', t, TRUCK[Math.min(nTruck, 3)], 0.3, 0.26, { ring: 0.25, pan: TPAN[Math.min(nTruck, 3)], send: 0.8 }); if (nTruck === 3) stroke(t, CH.Am, 'd', 0.16, { dur: 0.5 }); nTruck++ }
  else if (/splash/.test(L)) M.hit('plunk', t, 0.65, { pan: 0.2 })
  else if (/dawn/.test(L)) M.hit('quijada', t, 0.3, { pan: -0.3 })
  else if (/mano/.test(L)) M.hit('scrape', t, 0.35, { dur: 0.45, rate: 90, tone: 750 }) // stone on stone
  else if (/masa/.test(L)) { M.hit('palmeo', t, 0.4, { pan: -0.2, send: 0.3 }); M.hit('palmeo', t + 0.125, 0.3, { pan: 0.2, send: 0.3 }) }
  else if (/crowns it/.test(L)) {
    if (!M.events.some((e) => e.inst === 'requinto' && Math.abs(e.t - t) < 0.03)) M.note('requinto', t, 'D5', 0.22, 0.7, RQ)
    M.hit('quijada', t, 0.3, { pan: -0.3 })
  }
  else if (/press slams/.test(L)) { M.hit('tarima', t, 0.7, { heel: 0.3, box: 1.9, send: 0.4 }); M.hit('palmeo', t, 0.4, { send: 0.3 }) }
  else if (/hot comal/.test(L)) { M.hit('palmeo', t, 0.3, { body: 140, send: 0.3 }); M.hit('comal', t, 0.35, { dur: 2.2, pan: 0.2 }) } // it flops onto the clay, then spits
  else if (/stroke/.test(L)) M.hit('chop', t, 0.55, { pan: -0.1 }) // the knife
  else M.hit('palmeo', t, 0.25, { send: 0.3 }) // anything new still gets a sound
}
// every hand-played note is its own take: the synth caches by (inst, pitch, dur, vel/10, options), so 96 heels were
// 14 identical samples and the three bites one. A take number per event gives each its own noise, so no two are alike.
const LIVE = new Set(['jarana', 'requinto', 'leona', 'tarima', 'tecomate', 'quijada', 'palmeo', 'crunch', 'comal', 'scrape', 'chop', 'plunk'])
M.events.forEach((e, i) => { if (LIVE.has(e.inst)) e.o = Object.assign({}, e.o, { tk: i }) })
})()
