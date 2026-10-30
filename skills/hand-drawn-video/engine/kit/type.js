// Hand-drawn video kit: words. Captions that type themselves, a small kicker over them, labels with leader
// lines. Text is drawn in the page, so its size and place are exact on every frame.
(function () {
  const K = window.K
  K.FONT = '"Delius", "Patrick Hand", "Comic Neue", sans-serif' // set your own in scene.js
  K.INK = '#2b2420'

  K.font = (size, weight = 400, family = K.FONT) => `${weight} ${size}px ${family}`

  // wrap text into lines that fit maxWidth (explicit \n always breaks)
  K.wrap = function (ctx, text, maxWidth) {
    const out = []
    for (const para of String(text).split('\n')) {
      let line = ''
      for (const w of para.split(' ')) {
        const tryLine = line ? line + ' ' + w : w
        if (ctx.measureText(tryLine).width > maxWidth && line) { out.push(line); line = w } else line = tryLine
      }
      out.push(line)
    }
    return out
  }

  // How many characters of `text` are visible at time t when typing starts at `start`.
  // Typing slows a touch after punctuation, like a hand.
  K.typed = function (text, t, start, cps = 26) {
    if (t < start) return 0
    let time = start, n = 0
    for (const ch of text) {
      time += (1 / cps) * (/[.,?!:;]/.test(ch) ? 3 : 1)
      if (time > t) break
      n++
    }
    return n
  }
  // when typing of `text` finishes
  K.typedEnd = function (text, start, cps = 26) {
    let time = start
    for (const ch of text) time += (1 / cps) * (/[.,?!:;]/.test(ch) ? 3 : 1)
    return time
  }

  // A caption block: optional kicker (small, coloured, underlined) over typed text.
  // o: { kicker, text, start, end, x, y, size, maxWidth, color, accent, cps, align, kickerStart, cursor, lineHeight, weight }
  // Returns the block's box (for keeping pictures clear of it).
  K.caption = function (ctx, t, o) {
    const size = o.size || 46, x = o.x ?? 40, y = o.y ?? 40, color = o.color || K.INK, accent = o.accent || '#c8402e'
    const cps = o.cps || 26, start = o.start ?? 0, end = o.end ?? 1e9
    const out = o.out ?? 0.18 // seconds to clear at the end
    const fade = 1 - K.at(t, end - out, out, 'in')
    if (fade <= 0 || t < Math.min(start, o.kickerStart ?? start)) return null
    ctx.save()
    ctx.globalAlpha *= fade
    ctx.textBaseline = 'top'
    ctx.textAlign = o.align || 'left'
    let cy = y
    const box = { x, y, w: 0, h: 0 }
    if (o.kicker) {
      const ks = Math.round(size * 0.52), kst = o.kickerStart ?? start
      ctx.font = K.font(ks, 400, o.kickerFont || K.FONT)
      const kt = String(o.kicker)
      const nk = o.kickerTyped === false ? kt.length : K.typed(kt, t, kst, cps * 1.4)
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = Math.round(ks * 0.08) + 'px'
      ctx.fillStyle = accent
      ctx.fillText(kt.slice(0, nk), x, cy)
      const kw = ctx.measureText(kt).width
      // underline draws from the left as the kicker appears
      const u = K.at(t, kst, 0.45, 'out')
      const ux = o.align === 'center' ? x - kw / 2 - ks * 0.4 : x - ks * 0.3
      K.line(ctx, [[ux, cy + ks * 1.28], [ux + (kw + ks * 0.9) * u, cy + ks * 1.28]], { color: accent, lw: Math.max(1.2, ks * 0.07), seed: 9, wob: 0.6, taper: 4 })
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px'
      cy += ks * 1.9
      box.w = kw
    }
    if (o.text) {
      ctx.font = K.font(size, o.weight || 400, o.font || K.FONT)
      const lines = K.wrap(ctx, o.text, o.maxWidth || 900)
      const full = lines.join('\n')
      const n = o.typed === false ? full.length : K.typed(full, t, start, cps)
      let shown = 0
      const lh = size * (o.lineHeight || 1.18)
      for (const L of lines) {
        const k = Math.max(0, Math.min(L.length, n - shown))
        ctx.fillStyle = color
        ctx.fillText(L.slice(0, k), x, cy)
        // the newest letter arrives with a quick fade
        shown += L.length + 1
        box.w = Math.max(box.w, ctx.measureText(L).width)
        cy += lh
      }
      if (o.cursor && n < full.length) {
        const blink = Math.floor(t * 4) % 2 === 0
        if (blink) {
          // cursor after the last visible char
          let rem = n, li = 0
          while (li < lines.length && rem > lines[li].length) { rem -= lines[li].length + 1; li++ }
          const lx = x + ctx.measureText((lines[li] || '').slice(0, rem)).width
          ctx.fillRect(lx + 3, y + (o.kicker ? size * 0.52 * 1.9 : 0) + li * lh + size * 0.1, Math.max(2, size * 0.06), size * 0.9)
        }
      }
    }
    box.h = cy - y
    ctx.restore()
    return box
  }

  // A label with a leader line to a point on the drawing (exploded views, maps, diagrams).
  // side: 'left' | 'right'. draw: 0..1 reveal.
  K.label = function (ctx, text, x, y, toX, toY, o = {}) {
    const size = o.size || 22, color = o.color || K.INK, draw = o.draw ?? 1, side = o.side || (toX < x ? 'left' : 'right')
    if (draw <= 0) return
    ctx.save()
    // leader
    K.line(ctx, [[toX, toY], [K.lerp(toX, x, draw), K.lerp(toY, y, draw)]], { color, lw: o.lw || 1.3, seed: K.hash(text) % 100, wob: 0.4, taper: 3, alpha: 0.85 })
    if (draw > 0.6) {
      ctx.globalAlpha *= K.inv(0.6, 1, draw)
      ctx.font = K.font(size, o.weight || 400, o.font || K.FONT)
      if (ctx.letterSpacing !== undefined && o.spacing !== 0) ctx.letterSpacing = Math.round(size * (o.spacing ?? 0.06)) + 'px'
      ctx.fillStyle = color
      ctx.textBaseline = 'middle'
      ctx.textAlign = side === 'left' ? 'right' : 'left'
      ctx.fillText(o.upper === false ? text : text.toUpperCase(), x + (side === 'left' ? -8 : 8), y)
    }
    ctx.restore()
  }

  // plain text helper
  K.text = function (ctx, str, x, y, o = {}) {
    ctx.save()
    ctx.font = K.font(o.size || 40, o.weight || 400, o.font || K.FONT)
    ctx.fillStyle = o.color || K.INK
    ctx.textAlign = o.align || 'left'
    ctx.textBaseline = o.baseline || 'alphabetic'
    if (o.alpha != null) ctx.globalAlpha *= o.alpha
    if (o.spacing && ctx.letterSpacing !== undefined) ctx.letterSpacing = o.spacing + 'px'
    ctx.fillText(str, x, y)
    const w = ctx.measureText(str).width
    ctx.restore()
    return w
  }
})()
