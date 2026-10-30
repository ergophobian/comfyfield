// Hand-drawn video kit: core. Seeded randomness, noise, easing, springs and timing.
// Everything is a pure function of time, so any frame can be drawn on its own, in any order.
(function () {
  const K = (window.K = window.K || {})

  // ---- randomness: the same key always gives the same numbers (a take is reproducible)
  function hash(s) {
    s = String(s)
    let h = 1779033703 ^ s.length
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353)
      h = (h << 13) | (h >>> 19)
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return (h ^= h >>> 16) >>> 0
  }
  K.hash = hash
  K.rng = function (seed) {
    let a = typeof seed === 'number' ? seed >>> 0 : hash(seed)
    return function () {
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  K.SEED = 1 // a different take: change it in scene.js

  // ---- value noise, -1..1, smooth
  function h1(i, s) {
    let x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9e3779b1), 0x27d4eb2d)
    x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13
    return (x >>> 0) / 4294967296
  }
  function h2(i, j, s) { return h1(i + Math.imul(j | 0, 7919), s + 101) }
  K.noise1 = function (x, seed = 0) {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f)
    return (h1(i, seed) * (1 - u) + h1(i + 1, seed) * u) * 2 - 1
  }
  K.noise2 = function (x, y, seed = 0) {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy)
    const a = h2(i, j, seed), b = h2(i + 1, j, seed), c = h2(i, j + 1, seed), d = h2(i + 1, j + 1, seed)
    return ((a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy) * 2 - 1
  }
  K.fbm = function (x, y, seed = 0, oct = 4) {
    let v = 0, amp = 0.5, f = 1
    for (let o = 0; o < oct; o++) { v += amp * K.noise2(x * f, y * f, seed + o * 31); f *= 2; amp *= 0.5 }
    return v
  }

  // ---- numbers
  K.clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
  K.lerp = (a, b, t) => a + (b - a) * t
  K.inv = (a, b, v) => K.clamp((v - a) / (b - a))
  K.map = (v, a, b, c, d) => c + (d - c) * K.inv(a, b, v)
  K.TAU = Math.PI * 2

  // ---- easing (t in 0..1)
  const E = (K.ease = {
    linear: (t) => t,
    in: (t) => t * t * t,
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuart: (t) => 1 - Math.pow(1 - t, 4),
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outBack: (t, s = 1.6) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  })

  // progress of [start, start+dur] at time t, eased
  K.at = function (t, start, dur, ease = 'inOut') {
    const p = K.clamp((t - start) / Math.max(1e-6, dur))
    return typeof ease === 'function' ? ease(p) : E[ease](p)
  }

  // a damped spring's step response: 0 at t<=0, settles at 1 with overshoot. Mass, not a curve.
  K.spring = function (t, freq = 2.2, damp = 0.42) {
    if (t <= 0) return 0
    const w = K.TAU * freq
    if (damp < 1) {
      const wd = w * Math.sqrt(1 - damp * damp)
      return 1 - Math.exp(-damp * w * t) * (Math.cos(wd * t) + ((damp * w) / wd) * Math.sin(wd * t))
    }
    return 1 - Math.exp(-w * t) * (1 + w * t)
  }
  // a value that changes target several times stays continuous: one spring per change, added
  // keys = [[time, value], ...]; the first value is where it starts
  K.springTo = function (t, keys, freq, damp) {
    let v = keys[0][1]
    for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * K.spring(t - keys[i][0], freq, damp)
    return v
  }
  // piecewise keyframes: [[t, v], [t, v, 'ease'], ...] (ease belongs to the segment arriving at that key)
  K.keys = function (t, ks) {
    if (t <= ks[0][0]) return ks[0][1]
    for (let i = 1; i < ks.length; i++) {
      if (t <= ks[i][0]) {
        const a = ks[i - 1], b = ks[i]
        const p = K.at(t, a[0], b[0] - a[0], b[2] || 'inOut')
        return Array.isArray(a[1]) ? a[1].map((x, k) => K.lerp(x, b[1][k], p)) : K.lerp(a[1], b[1], p)
      }
    }
    return ks[ks.length - 1][1]
  }
  // a pulse on each time in `times`: rises fast, falls over `dur` (for hits synced to the music)
  K.pulse = function (t, times, dur = 0.35) {
    let v = 0
    for (const x of times) { const d = t - x; if (d >= 0 && d < dur) v = Math.max(v, Math.pow(1 - d / dur, 2)) }
    return v
  }
  // stepped time for "drawn on twos" motion and line boil (fps of the drawing, not the video)
  K.onTwos = (t, fps = 12) => Math.floor(t * fps) / fps

  // memo: cache anything expensive that does not change per frame (wobbled outlines, textures)
  const memo = new Map()
  K.memo = function (key, fn) {
    if (!memo.has(key)) memo.set(key, fn())
    return memo.get(key)
  }

  // colour helpers
  K.hex = function (h) {
    h = h.replace('#', '')
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  K.rgba = (h, a = 1) => { const [r, g, b] = K.hex(h); return `rgba(${r},${g},${b},${a})` }
  K.mixColor = function (a, b, t) {
    const A = K.hex(a), B = K.hex(b)
    return '#' + A.map((x, i) => Math.round(K.lerp(x, B[i], t)).toString(16).padStart(2, '0')).join('')
  }
  K.shade = (h, amt) => (amt < 0 ? K.mixColor(h, '#1b1410', -amt) : K.mixColor(h, '#fffaf0', amt))
})()
