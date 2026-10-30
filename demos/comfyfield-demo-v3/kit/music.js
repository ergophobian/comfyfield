// Hand-drawn video kit: music. A small synth whose instruments are made from scratch in code (no samples,
// no loops), a score written as events on the film's own clock, and a mix rendered offline in the page.
// Because the score is data, it can be read back: a summary and a piano roll with the film's cues on it.
(function () {
  const K = window.K
  const SR = 48000
  const M = (K.music = {
    sr: SR, bpm: 120, beatsPerBar: 4, offset: 0, key: 'C', mode: 'ionian', events: [], sections: [], meta: {},
    reverb: { seconds: 2.4, wet: 0.2, predelay: 0.018, dark: 0.6 }, master: 0.9, human: { time: 0.006, vel: 0.07 },
    instGain: {},
  })

  M.setup = function (o) { Object.assign(M, o); if (o.reverb) M.reverb = Object.assign({ seconds: 2.4, wet: 0.2, predelay: 0.018, dark: 0.6 }, o.reverb); return M }
  // time of bar b, pulse k (pulses are whatever bpm counts: quarters at 120, eighths at 240…)
  M.time = (b, k = 0) => M.offset + (b * M.beatsPerBar + k) * (60 / M.bpm)
  M.pulse = () => 60 / M.bpm
  M.barLen = () => M.beatsPerBar * (60 / M.bpm)
  M.section = (label, from, to, note = '') => M.sections.push({ label, from, to, note })

  // ---------- pitch
  const NAMES = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 }
  M.n = function (p) {
    if (typeof p === 'number') return p
    const m = /^([A-G][#b]?)(-?\d)$/.exec(p)
    if (!m) throw new Error('bad pitch ' + p)
    return NAMES[m[1]] + (parseInt(m[2]) + 1) * 12
  }
  M.name = (m) => ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][((Math.round(m) % 12) + 12) % 12] + (Math.floor(Math.round(m) / 12) - 1)
  M.hz = (m) => 440 * Math.pow(2, (m - 69) / 12)
  M.MODES = {
    ionian: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], locrian: [0, 1, 3, 5, 6, 8, 10],
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11], melodicMinor: [0, 2, 3, 5, 7, 9, 11], lydianDominant: [0, 2, 4, 6, 7, 9, 10],
    phrygianDominant: [0, 1, 4, 5, 7, 8, 10], doubleHarmonic: [0, 1, 4, 5, 7, 8, 11], hungarianMinor: [0, 2, 3, 6, 7, 8, 11],
    wholeTone: [0, 2, 4, 6, 8, 10], pentMajor: [0, 2, 4, 7, 9], pentMinor: [0, 3, 5, 7, 10], hirajoshi: [0, 2, 3, 7, 8],
    inSen: [0, 1, 5, 7, 10], yo: [0, 2, 5, 7, 9], prometheus: [0, 2, 4, 6, 9, 10], enigmatic: [0, 1, 4, 6, 8, 10, 11],
  }
  // deg → midi in a mode (deg can be negative or past the octave). root like 'D3'.
  M.scale = function (root, mode = 'ionian') {
    const r = M.n(root), s = M.MODES[mode] || mode
    return (deg) => { const o = Math.floor(deg / s.length), i = ((deg % s.length) + s.length) % s.length; return r + o * 12 + s[i] }
  }

  // ---------- writing the score
  let hr = K.rng('humanize')
  M.note = function (inst, t, pitch, dur = 0.5, vel = 0.7, o = {}) {
    if (!INST[inst]) throw new Error('no instrument ' + inst)
    const h = o.exact ? 0 : 1
    M.events.push({
      inst, t: Math.max(0, t + h * (hr() - 0.5) * 2 * M.human.time), midi: pitch == null ? null : M.n(pitch), dur,
      vel: K.clamp(vel * (1 + h * (hr() - 0.5) * 2 * M.human.vel), 0, 1.5), pan: o.pan ?? 0, send: o.send ?? 1, o,
    })
  }
  M.chord = function (inst, t, pitches, dur, vel = 0.6, o = {}) {
    const strum = o.strum ?? 0, list = o.up ? pitches.slice().reverse() : pitches
    list.forEach((p, i) => M.note(inst, t + i * strum, p, dur, vel * (1 - i * (o.taper ?? 0.04)), o))
  }
  // a percussion hit or a sound effect (no pitch)
  M.hit = (inst, t, vel = 0.7, o = {}) => M.note(inst, t, null, o.dur ?? 0.3, vel, o)
  M.sfx = M.hit

  // ---------- DSP pieces
  function svf(x, fc, q = 0.707, type = 'lp') {
    // TPT state-variable filter; fc may be a number or a function of the sample index
    const out = new Float32Array(x.length), k = 1 / q
    let ic1 = 0, ic2 = 0, g, a1, a2, a3, last = -1
    for (let i = 0; i < x.length; i++) {
      const f = typeof fc === 'function' ? fc(i) : fc
      if (f !== last) { g = Math.tan((Math.PI * Math.min(f, SR * 0.45)) / SR); a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2; last = f }
      const v3 = x[i] - ic2, v1 = a1 * ic1 + a2 * v3, v2 = ic2 + a2 * ic1 + a3 * v3
      ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2
      out[i] = type === 'lp' ? v2 : type === 'bp' ? v1 : x[i] - k * v1 - v2
    }
    return out
  }
  M.svf = svf
  const noise = (n, r) => { const b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = r() * 2 - 1; return b }
  const buf = (sec) => new Float32Array(Math.max(1, Math.ceil(sec * SR)))
  // release after the note's length (dampened when the player lets go)
  function release(b, dur, rel = 0.08) {
    const s = Math.floor(dur * SR)
    for (let i = s; i < b.length; i++) b[i] *= Math.exp(-(i - s) / SR / rel)
    return b
  }
  function attack(b, sec) { const n = Math.floor(sec * SR); for (let i = 0; i < n && i < b.length; i++) b[i] *= i / n; return b }

  // ---------- instruments: (freq, dur, vel, o, rng) → Float32Array mono. kind tells the reports what it is.
  const INST = (M.INST = {})
  function def(name, kind, gain, fn) { INST[name] = { kind, gain, fn } }

  // wooden bar (marimba-like): tuned 1 : 4 : 10 partials, a mallet thock, the bar's ring shorter up high
  def('woodbar', 'pitched', 0.55, (f, dur, vel, o, r) => {
    const T = K.clamp(1.5 * Math.sqrt(220 / f), 0.2, 2.2) * (o.ring || 1)
    const b = buf(Math.min(T * 3, 4))
    const P = [[1, 1, T], [3.99, 0.28 * (0.4 + vel), T * 0.2], [9.95, 0.08 * vel, T * 0.08]]
    for (const [ratio, amp, tau] of P) {
      const w = (2 * Math.PI * f * ratio) / SR
      for (let i = 0; i < b.length; i++) b[i] += amp * Math.exp(-i / SR / tau) * Math.sin(w * i)
    }
    const m = svf(noise(Math.floor(0.008 * SR), r), 800 + 2600 * vel, 0.8)
    for (let i = 0; i < m.length; i++) b[i] += m[i] * 0.5 * vel * (1 - i / m.length)
    attack(b, 0.0012)
    return o.damp ? release(b, dur, 0.06) : b
  })
  // thumb-piano tine: inharmonic partials, a little buzz
  def('tine', 'pitched', 0.5, (f, dur, vel, o, r) => {
    const T = K.clamp(1.6 * Math.sqrt(330 / f), 0.4, 2.6)
    const b = buf(T * 3)
    const P = [[1, 1, T], [5.93, 0.22, T * 0.15], [13.2, 0.06, T * 0.05], [2.01, 0.04, T * 0.6]]
    for (const [ratio, amp, tau] of P) { const w = (2 * Math.PI * f * ratio) / SR; for (let i = 0; i < b.length; i++) b[i] += amp * Math.exp(-i / SR / tau) * Math.sin(w * i) }
    const buzz = o.buzz ?? 0.15
    for (let i = 0; i < b.length; i++) if (buzz) b[i] = b[i] + buzz * Math.sign(b[i]) * Math.pow(Math.abs(b[i]), 3)
    attack(b, 0.001)
    return o.damp ? release(b, dur, 0.1) : b
  })
  // plucked string: harmonics that lose their brightness first, a pick position, a body bump
  def('pluck', 'pitched', 0.5, (f, dur, vel, o, r) => {
    const T = K.clamp(2.2 * Math.sqrt(196 / f), 0.4, 3.5) * (o.ring || 1)
    const b = buf(Math.min(T * 2.5, 5))
    const pick = o.pick ?? 0.18, bright = o.bright ?? 0.5
    for (let k = 1; k <= 16; k++) {
      if (f * k > 16000) break
      const amp = Math.abs(Math.sin(Math.PI * k * pick)) / Math.pow(k, 1.35 - bright * 0.5)
      const tau = T / (1 + (k - 1) * (k - 1) * (0.06 - bright * 0.04))
      const w = (2 * Math.PI * f * k * (1 + 0.00025 * k * k)) / SR, ph = r() * 6
      for (let i = 0; i < b.length; i++) b[i] += amp * Math.exp(-i / SR / tau) * Math.sin(w * i + ph)
    }
    const nz = svf(noise(Math.floor(0.004 * SR), r), 3000, 0.7)
    for (let i = 0; i < nz.length; i++) b[i] += nz[i] * 0.25 * vel
    attack(b, 0.002)
    return release(b, dur, o.rel ?? 0.12)
  })
  // FM bell: a bright strike that mellows. ratio sets how metallic (1.4 glassy, 3.5 bell, 7.1 tin)
  def('bell', 'pitched', 0.3, (f, dur, vel, o) => {
    const T = o.ring || 2.6, b = buf(T * 2.2), ratio = o.ratio || 3.5, I0 = (o.index || 3) * (0.5 + vel)
    const wc = (2 * Math.PI * f) / SR, wm = wc * ratio
    for (let i = 0; i < b.length; i++) { const t = i / SR; b[i] = Math.exp(-t / T) * Math.sin(wc * i + I0 * Math.exp(-t / 0.5) * Math.sin(wm * i)) }
    return attack(b, 0.001)
  })
  // glass pad: bowed-glass partials, slow breath in and out, gently beating voices
  def('glass', 'pitched', 0.22, (f, dur, vel, o) => {
    const atk = o.attack ?? Math.min(0.6, dur * 0.4), rel = o.rel ?? 0.9
    const b = buf(dur + rel)
    const P = [[1, 1], [2, 0.32], [3, 0.12], [2.76, 0.06 * (o.glassy ?? 1)], [4.02, 0.04]]
    for (const [ratio, amp] of P) for (const det of [-0.0016, 0.0016]) {
      const w = (2 * Math.PI * f * ratio * (1 + det)) / SR
      for (let i = 0; i < b.length; i++) b[i] += 0.5 * amp * Math.sin(w * i)
    }
    const n = b.length, s = Math.floor(dur * SR)
    for (let i = 0; i < n; i++) {
      const t = i / SR, e = Math.min(1, t / atk) * (i > s ? Math.exp(-(i - s) / SR / (rel / 3)) : 1)
      b[i] *= e * e * (1 + 0.08 * Math.sin(2 * Math.PI * 4.6 * t))
    }
    return b
  })
  // round bass: a sine with a little growl, a finger thump, a short slide into the note
  def('bass', 'pitched', 0.6, (f, dur, vel, o) => {
    const b = buf(dur + 0.25)
    let ph = 0
    for (let i = 0; i < b.length; i++) {
      const t = i / SR, ff = f * (1 + 0.04 * Math.exp(-t / 0.02))
      ph += (2 * Math.PI * ff) / SR
      const e = Math.exp(-t / (o.decay || 0.9)) * 0.75 + 0.25 * Math.exp(-t / 0.08)
      b[i] = e * (Math.sin(ph) + 0.22 * Math.sin(2 * ph) + 0.07 * Math.sin(3 * ph))
    }
    attack(b, 0.004)
    return release(b, dur, 0.06)
  })
  // breathy reed/flute lead: a sine with breath, vibrato that arrives late
  def('breath', 'pitched', 0.32, (f, dur, vel, o, r) => {
    const b = buf(dur + 0.2), nz = svf(noise(b.length, r), f * 2.2, 3, 'bp')
    let ph = 0
    for (let i = 0; i < b.length; i++) {
      const t = i / SR, vib = 1 + 0.005 * Math.sin(2 * Math.PI * 5.2 * t) * K.clamp((t - 0.25) / 0.3)
      ph += (2 * Math.PI * f * vib) / SR
      b[i] = Math.sin(ph) + 0.12 * Math.sin(2 * ph) + nz[i] * (o.air ?? 0.6)
    }
    attack(b, o.attack ?? 0.06)
    return release(b, dur, 0.12)
  })
  // a real plucked string (Karplus-Strong): a burst of noise circulating in a tuned delay line, losing its top
  // each trip. Sounds like gut, nylon or wire, not like a keyboard. o: ring (s to -60 dB), bright 0..1 (pick
  // hardness), pick 0..0.5 (where it is plucked), body (resonance mix), damp (s, how fast it stops after dur)
  def('string', 'pitched', 0.55, (f, dur, vel, o, r) => {
    const T = o.ring ?? K.clamp(2.4 * Math.sqrt(196 / f), 0.5, 4), bright = o.bright ?? 0.55
    const len = Math.ceil(Math.min(dur + Math.min(T, 2.5), 6) * SR), out = new Float32Array(len)
    const N = SR / f - 0.5, M = Math.floor(N) + 4, D = new Float32Array(M)
    let lp = 0
    const exc = new Float32Array(M)
    for (let i = 0; i < M; i++) { lp += (0.15 + 0.85 * bright * (0.6 + 0.4 * vel)) * ((r() * 2 - 1) - lp); exc[i] = lp }
    const pd = Math.max(1, Math.floor(N * (o.pick ?? 0.13)))
    for (let i = 0; i < M; i++) D[i] = exc[i] - 0.85 * exc[(i + pd) % M]
    const gHold = Math.pow(0.001, 1 / (f * T)), gDamp = Math.pow(0.001, 1 / (f * (o.damp ?? 0.09)))
    const s = 0.5 - 0.35 * bright * 0.5 // the averaging filter: lower = brighter
    let w = Math.ceil(N) + 1, prev = 0
    const stop = Math.floor(dur * SR)
    for (let i = 0; i < len; i++) {
      const rp = w - N, i0 = Math.floor(rp), fr = rp - i0
      const y = D[((i0 % M) + M) % M] * (1 - fr) + D[(((i0 + 1) % M) + M) % M] * fr
      const g = i < stop ? gHold : gDamp
      D[w % M] = g * ((1 - s) * y + s * prev)
      prev = y; out[i] = y; w++
    }
    // the body: a wooden box's low and mid resonances
    const bodyMix = o.body ?? 0.35
    if (bodyMix) { const lo = svf(out, o.bodyLo || 240, 1.6, 'bp'), mid = svf(out, o.bodyMid || 2400, 1.2, 'bp'); for (let i = 0; i < len; i++) out[i] = out[i] + bodyMix * (lo[i] * 1.6 + mid[i] * 0.6) }
    attack(out, 0.0015)
    return out
  })
  // a muted strum stroke (the "chuck" of a rasgueo): strings stopped by the palm the moment they sound
  def('chuck', 'perc', 0.35, (f, dur, vel, o, r) => {
    const b = buf(0.12), nz = svf(noise(b.length, r), 1800, 0.8, 'bp'), body = svf(noise(b.length, r), 300, 3, 'bp')
    for (let i = 0; i < b.length; i++) { const t = i / SR; b[i] = (nz[i] * 1.2 + body[i] * 2.5) * Math.exp(-t / 0.022) }
    return attack(b, 0.001)
  })
  // a heel on a wooden platform (zapateado on a tarima): a hollow low knock with the board's ring
  def('stomp', 'perc', 0.7, (f, dur, vel, o, r) => {
    const b = buf(0.35), nz = svf(noise(b.length, r), 900, 0.7)
    const P = [[o.tone || 105, 0.11, 1], [(o.tone || 105) * 2.31, 0.05, 0.45], [(o.tone || 105) * 4.1, 0.025, 0.25]]
    for (let i = 0; i < b.length; i++) { const t = i / SR; let v = 0; for (const [fr, tau, a] of P) v += a * Math.exp(-t / tau) * Math.sin(2 * Math.PI * fr * t); b[i] = v + nz[i] * Math.exp(-t / 0.008) * 0.8 }
    return attack(b, 0.0008)
  })

  // percussion
  def('thump', 'perc', 0.8, (f, dur, vel) => {
    const b = buf(0.5); let ph = 0
    for (let i = 0; i < b.length; i++) { const t = i / SR; ph += (2 * Math.PI * (46 + 80 * Math.exp(-t / 0.03))) / SR; b[i] = Math.exp(-t / 0.16) * Math.sin(ph) }
    return attack(b, 0.001)
  })
  def('pat', 'perc', 0.6, (f, dur, vel, o, r) => {
    // an open hand on dough or a drum head: a slap and a short body
    const b = buf(0.25), nz = svf(noise(b.length, r), o.tone || 1100, 0.9, 'bp')
    for (let i = 0; i < b.length; i++) { const t = i / SR; b[i] = nz[i] * Math.exp(-t / 0.028) * 1.6 + 0.6 * Math.exp(-t / 0.05) * Math.sin(2 * Math.PI * (o.body || 190) * t) }
    return attack(b, 0.0008)
  })
  def('wood', 'perc', 0.4, (f, dur, vel, o) => {
    const b = buf(0.2), F0 = o.tone || 1650
    for (let i = 0; i < b.length; i++) { const t = i / SR; b[i] = Math.exp(-t / 0.035) * (Math.sin(2 * Math.PI * F0 * t) + 0.4 * Math.sin(2 * Math.PI * F0 * 2.73 * t) * Math.exp(-t / 0.01)) }
    return attack(b, 0.0005)
  })
  def('shaker', 'perc', 0.25, (f, dur, vel, o, r) => {
    const len = o.len || 0.09, b = svf(noise(Math.ceil((len + 0.05) * SR), r), 5200, 0.7, 'hp')
    for (let i = 0; i < b.length; i++) { const t = i / SR; b[i] *= Math.min(1, t / (len * 0.35)) * Math.exp(-Math.max(0, t - len * 0.35) / (len * 0.3)) }
    return b
  })
  def('tick', 'perc', 0.25, (f, dur, vel, o, r) => {
    const b = svf(noise(Math.ceil(0.03 * SR), r), o.tone || 4000, 2, 'bp')
    for (let i = 0; i < b.length; i++) b[i] *= Math.exp(-i / SR / 0.006)
    return b
  })
  def('scrape', 'perc', 0.3, (f, dur, vel, o, r) => {
    // a stick along ridges: many tiny clicks, rate in clicks per second
    const len = dur, b = buf(len + 0.05), rate = o.rate || 38
    for (let c = 0; c < len * rate; c++) {
      const s = Math.floor((c / rate) * SR), a = 0.5 + 0.5 * Math.sin(Math.PI * (c / (len * rate)))
      for (let i = 0; i < 0.006 * SR && s + i < b.length; i++) b[s + i] += (r() * 2 - 1) * a * Math.exp(-i / SR / 0.0015)
    }
    return svf(b, o.tone || 2600, 1.2, 'bp')
  })
  def('snap', 'perc', 0.4, (f, dur, vel, o, r) => {
    const b = svf(noise(Math.ceil(0.12 * SR), r), 2200, 1.1, 'bp')
    for (let i = 0; i < b.length; i++) b[i] *= Math.exp(-i / SR / 0.018) * 1.8
    return b
  })
  def('brush', 'perc', 0.2, (f, dur, vel, o, r) => {
    const len = o.len || 0.25, b = svf(noise(Math.ceil(len * SR), r), 3500, 0.6)
    for (let i = 0; i < b.length; i++) { const t = i / len / SR; b[i] *= Math.sin(Math.PI * t) * (0.6 + 0.4 * Math.sin(t * 40)) }
    return b
  })

  // sound effects for things on screen
  def('whoosh', 'sfx', 0.4, (f, dur, vel, o, r) => {
    const len = o.len || 0.5, n = Math.ceil(len * SR), lo = o.lo || 300, hi = o.hi || 2600
    const b = svf(noise(n, r), (i) => lo + (hi - lo) * Math.sin(Math.PI * Math.pow(i / n, o.skew || 0.7)), 1.4, 'bp')
    for (let i = 0; i < n; i++) b[i] *= Math.pow(Math.sin(Math.PI * Math.pow(i / n, o.skew || 0.7)), 1.5)
    return b
  })
  def('paper', 'sfx', 0.35, (f, dur, vel, o, r) => {
    // a sheet sliding or turning: crackle over a soft rush
    const len = o.len || 0.45, n = Math.ceil(len * SR), raw = new Float32Array(n)
    for (let i = 0; i < n; i++) { const env = Math.sin(Math.PI * i / n); raw[i] = ((r() * 2 - 1) * 0.35 + (r() < 0.004 ? (r() * 2 - 1) * 4 : 0)) * env }
    return svf(raw, o.tone || 3800, 0.6, 'bp')
  })
  def('pop', 'sfx', 0.35, (f, dur, vel, o) => {
    const b = buf(0.12), F0 = o.tone || 700; let ph = 0
    for (let i = 0; i < b.length; i++) { const t = i / SR; ph += (2 * Math.PI * F0 * (0.45 + 0.55 * Math.exp(-t / 0.02))) / SR; b[i] = Math.exp(-t / 0.035) * Math.sin(ph) }
    return attack(b, 0.0008)
  })
  def('sizzle', 'sfx', 0.18, (f, dur, vel, o, r) => {
    const n = Math.ceil(dur * SR), raw = new Float32Array(n)
    for (let i = 0; i < n; i++) raw[i] = (r() * 2 - 1) * 0.3 + (r() < 0.003 ? (r() * 2 - 1) * 3 : 0)
    const b = svf(raw, 4500, 0.6, 'hp')
    for (let i = 0; i < n; i++) b[i] *= Math.min(1, i / (0.15 * SR)) * Math.min(1, (n - i) / (0.2 * SR))
    return b
  })
  def('chop', 'sfx', 0.45, (f, dur, vel, o, r) => {
    const b = buf(0.15), nz = svf(noise(b.length, r), 2500, 0.8)
    for (let i = 0; i < b.length; i++) { const t = i / SR; b[i] = Math.exp(-t / 0.04) * Math.sin(2 * Math.PI * 170 * t) + nz[i] * Math.exp(-t / 0.006) }
    return b
  })
  def('swell', 'sfx', 0.25, (f, dur, vel, o, r) => {
    // a rising breath of filtered noise into a moment
    const n = Math.ceil(dur * SR), b = svf(noise(n, r), (i) => 200 + 5000 * Math.pow(i / n, 2), 0.9)
    for (let i = 0; i < n; i++) b[i] *= Math.pow(i / n, 2)
    return b
  })

  // add your own: M.instrument('name', 'pitched'|'perc'|'sfx', gain, (freq, dur, vel, opts, rng) => Float32Array)
  M.instrument = def

  // ---------- render
  function impulse(ctx) {
    const { seconds, predelay, dark } = M.reverb, n = Math.ceil((seconds + predelay) * SR), ir = ctx.createBuffer(2, n, SR)
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c), r = K.rng('ir' + c)
      let lp = 0
      for (let i = Math.floor(predelay * SR); i < n; i++) {
        const t = i / SR, a = 1 - Math.min(0.97, dark * (t / seconds) + 0.15)
        lp = lp + a * ((r() * 2 - 1) - lp)
        d[i] = lp * Math.exp((-t * 6.9) / seconds)
      }
    }
    return ir
  }
  const synthCache = new Map()
  function synth(e) {
    const I = INST[e.inst], f = e.midi == null ? 0 : M.hz(e.midi + (e.o.cents || 0) / 100)
    const key = `${e.inst}|${e.midi}|${Math.round(e.dur * 50)}|${Math.round(e.vel * 10)}|${JSON.stringify(e.o)}`
    if (synthCache.has(key)) return synthCache.get(key)
    const r = K.rng(key)
    const x = I.fn(f, e.dur, e.vel, e.o, r)
    synthCache.set(key, x)
    return x
  }

  M.render = async function (duration = K.film.duration) {
    const len = Math.ceil(duration * SR), ctx = new OfflineAudioContext(2, len, SR)
    const bus = ctx.createGain()
    const verb = ctx.createConvolver(); verb.buffer = impulse(ctx)
    const wet = ctx.createGain(); wet.gain.value = M.reverb.wet
    const low = ctx.createBiquadFilter(); low.type = 'highpass'; low.frequency.value = 32
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -8; comp.ratio.value = 2; comp.attack.value = 0.012; comp.release.value = 0.25; comp.knee.value = 8
    const out = ctx.createGain(); out.gain.value = M.master
    verb.connect(wet); wet.connect(bus); bus.connect(low); low.connect(comp); comp.connect(out); out.connect(ctx.destination)
    // a supplied song (M.track = { url, gain, at }): decoded in the page and laid under the score's effects, past the
    // bus compressor so its own master is left as it is; the effects are written against its beats
    if (M.track) {
      const ab = await (await fetch(M.track.url)).arrayBuffer(), song = await ctx.decodeAudioData(ab)
      const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = song; g.gain.value = M.track.gain ?? 1
      src.connect(g); g.connect(out); src.start(M.track.at ?? 0)
    }
    for (const e of M.events) {
      if (e.t >= duration) continue
      const x = synth(e)
      const b = ctx.createBuffer(1, x.length, SR); b.copyToChannel(x, 0)
      const src = ctx.createBufferSource(); src.buffer = b
      const g = ctx.createGain(); g.gain.value = e.vel * INST[e.inst].gain * (M.instGain[e.inst] ?? 1) * (e.o.gain ?? 1)
      const p = ctx.createStereoPanner(); p.pan.value = K.clamp(e.pan, -1, 1)
      src.connect(g); g.connect(p); p.connect(bus)
      if (e.send) { const s = ctx.createGain(); s.gain.value = e.send; p.connect(s); s.connect(verb) }
      src.start(e.t)
    }
    const res = await ctx.startRendering()
    const L = res.getChannelData(0), R = res.getChannelData(1)
    if (M.limiter) { // a look-ahead peak limiter on the mix: only the top M.limiter dB of the loudest transients is held down
      let pk0 = 0; for (let i = 0; i < len; i++) pk0 = Math.max(pk0, Math.abs(L[i]), Math.abs(R[i]))
      const thr = pk0 * Math.pow(10, -M.limiter / 20), LA = Math.floor(0.0015 * SR), rel = 1 - Math.exp(-1 / (0.06 * SR))
      const need = new Float32Array(len), r = new Float32Array(len)
      for (let i = 0; i < len; i++) { const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); need[i] = a > thr ? thr / a : 1 }
      let prev = 1
      for (let i = 0; i < len; i++) { let h = 1; for (let j = i; j < i + LA && j < len; j++) if (need[j] < h) h = need[j]; prev = Math.min(h, prev + (1 - prev) * rel); r[i] = prev }
      let acc = LA
      for (let i = 0; i < len; i++) { acc += r[i] - (i >= LA ? r[i - LA] : 1); const g = acc / LA; L[i] *= g; R[i] *= g }
    }
    let peak = 0
    for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
    // M.ceiling: the peak to normalise to (dBFS, default -1.5); M.fixedNorm: a fixed gain instead
    const norm = M.fixedNorm != null ? M.fixedNorm : (peak > 0 ? Math.pow(10, (M.ceiling ?? -1.5) / 20) / peak : 1); M.lastPeak = peak
    const fadeN = Math.floor(0.04 * SR)
    for (let i = 0; i < len; i++) { const f = i > len - fadeN ? (len - i) / fadeN : 1; L[i] *= norm * f; R[i] *= norm * f }
    return { sr: SR, left: L, right: R, peakBefore: peak }
  }

  // ---------- reading the score back
  M.summary = function () {
    const ev = M.events.slice().sort((a, b) => a.t - b.t), bl = M.barLen()
    const per = {}
    for (const e of ev) per[e.inst] = (per[e.inst] || 0) + 1
    const bars = []
    const nb = Math.ceil(((K.film.duration || 0) - M.offset) / bl)
    for (let b = 0; b < nb; b++) {
      const t0 = M.time(b), t1 = t0 + bl, inBar = ev.filter((e) => e.t >= t0 - 0.02 && e.t < t1 - 0.02)
      const pcs = [...new Set(inBar.filter((e) => e.midi != null).map((e) => M.name(e.midi).replace(/-?\d+$/, '')))]
      bars.push({ bar: b, t: +t0.toFixed(2), events: inBar.length, insts: [...new Set(inBar.map((e) => e.inst))], pitchClasses: pcs, low: inBar.filter((e) => e.midi != null).reduce((m, e) => Math.min(m, e.midi), 999) })
    }
    const strong = ev.filter((e) => INST[e.inst].kind !== 'pitched' || e.vel > 0.7)
    const sync = (K.film.cues || []).map((c) => {
      let best = null
      for (const e of ev) { const d = e.t - c.t; if (Math.abs(d) < 0.25 && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, inst: e.inst } }
      let bestStrong = null
      for (const e of strong) { const d = e.t - c.t; if (Math.abs(d) < 0.25 && (!bestStrong || Math.abs(d) < Math.abs(bestStrong.d))) bestStrong = { d, inst: e.inst } }
      return { t: c.t, cue: c.label, kind: c.kind, nearest: best ? `${best.inst} ${Math.round(best.d * 1000)} ms` : 'nothing within 250 ms', strongest: bestStrong ? `${bestStrong.inst} ${Math.round(bestStrong.d * 1000)} ms` : '—' }
    })
    return { bpm: M.bpm, beatsPerBar: M.beatsPerBar, barSeconds: +bl.toFixed(3), key: M.key, mode: M.mode, meta: M.meta, sections: M.sections, notes: ev.length, perInstrument: per, bars, sync }
  }

  // a piano roll of the whole score with the film's cues as red lines (what a reviewer reads instead of hearing)
  M.drawRoll = function (ctx, W, H) {
    const ev = M.events, dur = K.film.duration, padL = 60, padB = 90, top = 30
    ctx.fillStyle = '#fbf8f1'; ctx.fillRect(0, 0, W, H)
    const pitched = ev.filter((e) => e.midi != null)
    const lo = Math.min(...pitched.map((e) => e.midi), 48) - 2, hi = Math.max(...pitched.map((e) => e.midi), 72) + 2
    const x = (t) => padL + (t / dur) * (W - padL - 20), y = (m) => top + (1 - (m - lo) / (hi - lo)) * (H - top - padB - 60)
    // bars
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1
    for (let b = 0; M.time(b) <= dur; b++) { ctx.beginPath(); ctx.moveTo(x(M.time(b)), top); ctx.lineTo(x(M.time(b)), H - padB); ctx.stroke() }
    ctx.font = '11px sans-serif'; ctx.fillStyle = '#888'
    for (let m = Math.ceil(lo / 12) * 12; m <= hi; m += 12) { ctx.fillText(M.name(m), 6, y(m) + 4); ctx.fillRect(padL - 6, y(m), 4, 1) }
    const insts = [...new Set(ev.map((e) => e.inst))]
    const col = (i) => `hsl(${(insts.indexOf(i) * 67) % 360},55%,45%)`
    for (const e of pitched) { ctx.fillStyle = col(e.inst); ctx.globalAlpha = 0.35 + 0.6 * Math.min(1, e.vel); ctx.fillRect(x(e.t), y(e.midi) - 2, Math.max(2, x(e.t + e.dur) - x(e.t)), 4) }
    ctx.globalAlpha = 1
    // percussion and effects as ticks on rows at the bottom
    const rows = insts.filter((i) => INST[i].kind !== 'pitched')
    rows.forEach((name, ri) => {
      const ry = H - padB - 50 + ri * 9
      ctx.fillStyle = '#666'; ctx.fillText(name, 4, ry + 4)
      ctx.fillStyle = col(name)
      for (const e of ev) if (e.inst === name) ctx.fillRect(x(e.t), ry - 3, 2, 7)
    })
    // cues
    for (const c of K.film.cues) {
      ctx.strokeStyle = c.kind === 'scene' ? 'rgba(200,40,40,0.75)' : 'rgba(200,40,40,0.35)'; ctx.lineWidth = c.kind === 'scene' ? 2 : 1
      ctx.beginPath(); ctx.moveTo(x(c.t), top); ctx.lineTo(x(c.t), H - padB + 6); ctx.stroke()
    }
    ctx.save(); ctx.fillStyle = '#b02a2a'; ctx.font = '11px sans-serif'
    K.film.cues.filter((c) => c.kind === 'scene').forEach((c, i) => { ctx.save(); ctx.translate(x(c.t) + 3, H - padB + 14 + (i % 3) * 13); ctx.fillText(String(c.label).slice(0, 18), 0, 0); ctx.restore() })
    ctx.restore()
    ctx.fillStyle = '#333'; ctx.font = '13px sans-serif'
    ctx.fillText(`${M.bpm} bpm · ${M.beatsPerBar}/bar · ${M.key} ${M.mode} · instruments: ${insts.join(', ')}   (red = film cues; grey = bar lines)`, padL, 18)
    for (let s = 0; s <= dur; s += 5) ctx.fillText(s + 's', x(s) - 8, H - 4)
  }
})()
