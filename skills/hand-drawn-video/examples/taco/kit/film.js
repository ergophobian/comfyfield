// Hand-drawn video kit: the film. Scenes on a timeline, transitions between them, overlays on top, cues that
// the music and the reviewers read, and pictures/footage loaded before a frame is drawn.
(function () {
  const K = window.K
  const F = (K.film = { W: 1080, H: 1080, fps: 30, duration: 10, scenes: [], overlays: [], cues: [], paper: '#efe8da' })

  K.setup = function (o) {
    Object.assign(F, o)
    if (o.seed != null) K.SEED = o.seed
    return F
  }

  // scene: { id, start, end, draw(ctx, s), in: { type: 'cut'|'slide'|'turn'|'push'|'ink'|'fade'|'drop', dur, dir, at } }
  // s = { t (film time), lt (time since start), dur, p (0..1 through the scene), W, H, id }
  K.scene = function (sc) {
    sc.in = Object.assign({ type: 'cut', dur: 0 }, sc.in || {})
    if (sc.in.type === 'cut') sc.in.dur = 0
    F.scenes.push(sc)
    F.scenes.sort((a, b) => a.start - b.start)
    K.cue(sc.start, sc.id, 'scene')
    return sc
  }
  // drawn above every scene (a logo, a frame, the grain): fn(ctx, t, W, H)
  K.overlay = (fn) => F.overlays.push(fn)
  // a moment the music should know about. kind: 'scene' | 'hit' | 'caption' | 'soft' | any word
  K.cue = function (t, label, kind = 'hit') {
    F.cues.push({ t: +t.toFixed(3), label, kind })
    F.cues.sort((a, b) => a.t - b.t)
    return t
  }

  // ---------- media: pictures and footage, loaded before the frame that needs them
  const cache = new Map()
  const pending = new Set()
  K.img = function (url) {
    const c = cache.get(url)
    if (c && c.done) return c.img
    if (!c) {
      const img = new Image()
      const entry = { img, done: false }
      entry.p = new Promise((res) => { img.onload = () => { entry.done = true; res() }; img.onerror = () => { entry.done = true; entry.err = true; console.warn('missing ' + url); res() } })
      img.src = url
      cache.set(url, entry)
    }
    pending.add(cache.get(url).p)
    return null
  }
  // footage = a folder of frames made by `render.mjs frames` (frame_00001.jpg …)
  K.footage = function (dir, o = {}) {
    const fps = o.fps || 30, count = o.count || 1e9, ext = o.ext || 'jpg'
    return {
      fps, count, dir,
      at(time, loop = false) {
        let i = Math.floor(time * fps)
        if (loop) i = ((i % count) + count) % count
        i = Math.max(0, Math.min(count - 1, i))
        return K.img(`${dir}/frame_${String(i + 1).padStart(5, '0')}.${ext}`)
      },
    }
  }
  K.mediaPending = () => pending.size
  K.mediaWait = async function () {
    const all = [...pending]; pending.clear()
    await Promise.all(all)
    // drop old footage frames so a long render does not fill memory
    if (cache.size > 600) { let k = 0; for (const key of cache.keys()) { if (k++ > 200) break; cache.delete(key) } }
  }
  // draw an image to fit a box: mode 'cover' | 'contain'
  K.drawImg = function (ctx, img, x, y, w, h, mode = 'cover', r = 0) {
    if (!img || !img.width) return
    const s = mode === 'cover' ? Math.max(w / img.width, h / img.height) : Math.min(w / img.width, h / img.height)
    const dw = img.width * s, dh = img.height * s
    ctx.save()
    if (r) { K.pathOf(ctx, K.rect(x, y, w, h, r)); ctx.clip() }
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
    ctx.restore()
  }

  // ---------- layers
  let layers = null
  function layer(i) {
    if (!layers) layers = [0, 1].map(() => { const c = document.createElement('canvas'); c.width = F.W; c.height = F.H; return c })
    const c = layers[i], g = c.getContext('2d')
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'
    g.clearRect(0, 0, F.W, F.H)
    return c
  }
  function drawScene(ctx, sc, t) {
    const lt = t - sc.start, dur = sc.end - sc.start
    ctx.save()
    sc.draw(ctx, { t, lt, dur, p: K.clamp(lt / dur), W: F.W, H: F.H, id: sc.id })
    ctx.restore()
  }

  // the transition of `b` over `a` at progress p (0..1)
  function composite(ctx, A, B, tr, p) {
    const W = F.W, H = F.H, e = K.ease.inOut(p)
    const dir = tr.dir || 'left'
    const v = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[dir] // direction the new sheet travels
    const shadow = (x, y, w, h) => {
      // the shadow a sheet throws on the one under it, at its leading edge
      ctx.save()
      ctx.shadowColor = 'rgba(40,28,15,0.35)'; ctx.shadowBlur = 30
      ctx.shadowOffsetX = -v[0] * 6; ctx.shadowOffsetY = -v[1] * 6
      ctx.fillStyle = F.paper; ctx.fillRect(x, y, w, h)
      ctx.restore()
    }
    switch (tr.type) {
      case 'fade':
        ctx.drawImage(A, 0, 0); ctx.globalAlpha = e; ctx.drawImage(B, 0, 0); ctx.globalAlpha = 1; break
      case 'push': {
        ctx.drawImage(A, v[0] * W * e, v[1] * H * e)
        ctx.drawImage(B, v[0] * W * (e - 1), v[1] * H * (e - 1)); break
      }
      case 'slide': {
        // a new sheet slides over the old one; the old one drifts a little and darkens
        ctx.drawImage(A, v[0] * W * e * 0.18, v[1] * H * e * 0.18)
        ctx.fillStyle = `rgba(30,20,10,${0.18 * e})`; ctx.fillRect(0, 0, W, H)
        const x = v[0] * W * (e - 1), y = v[1] * H * (e - 1)
        shadow(x, y, W, H); ctx.drawImage(B, x, y); break
      }
      case 'turn': {
        // the old sheet is lifted away like a page, its edge curling; the new one is underneath
        ctx.drawImage(B, 0, 0)
        const x = v[0] * W * e * 1.05, y = v[1] * H * e * 1.05
        ctx.save()
        ctx.shadowColor = 'rgba(40,28,15,0.4)'; ctx.shadowBlur = 40
        ctx.drawImage(A, x, y)
        ctx.restore()
        // the curl: a lit strip along the trailing edge
        const cw = 36 * Math.sin(Math.PI * p)
        ctx.save()
        if (v[0]) {
          const ex = v[0] < 0 ? x + W : x
          const g = ctx.createLinearGradient(ex - v[0] * cw, 0, ex, 0)
          g.addColorStop(0, 'rgba(255,250,240,0)'); g.addColorStop(0.75, 'rgba(250,244,230,0.35)'); g.addColorStop(1, 'rgba(120,100,70,0.35)')
          ctx.fillStyle = g; ctx.fillRect(Math.min(ex, ex - v[0] * cw), 0, cw, H)
        } else {
          const ey = v[1] < 0 ? y + H : y
          const g = ctx.createLinearGradient(0, ey - v[1] * cw, 0, ey)
          g.addColorStop(0, 'rgba(255,250,240,0)'); g.addColorStop(0.75, 'rgba(250,244,230,0.35)'); g.addColorStop(1, 'rgba(120,100,70,0.35)')
          ctx.fillStyle = g; ctx.fillRect(0, Math.min(ey, ey - v[1] * cw), W, cw)
        }
        ctx.restore(); break
      }
      case 'ink': {
        // the new scene shows through a wobbly blot that grows from a point
        ctx.drawImage(A, 0, 0)
        const [cx, cy] = tr.at || [W / 2, H / 2]
        const R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.15 * K.ease.inOut(p)
        ctx.save()
        K.pathOf(ctx, K.blob(cx, cy, Math.max(1, R), 17, 0.12, 64)); ctx.clip()
        ctx.drawImage(B, 0, 0)
        ctx.restore(); break
      }
      case 'drop': {
        // the new sheet drops in from above with a small bounce
        ctx.drawImage(A, 0, 0)
        const y = -H * Math.max(0, 1 - K.spring(p * (tr.dur || 0.6), 1.6, 0.55)) // lands, never overshoots past the top
        ctx.fillStyle = `rgba(30,20,10,${0.15 * e})`; ctx.fillRect(0, 0, W, H)
        shadow(0, y, W, H); ctx.drawImage(B, 0, y); break
      }
      default:
        ctx.drawImage(B, 0, 0)
    }
  }

  // ---------- the frame
  K.drawFrame = function (ctx, t) {
    const W = F.W, H = F.H
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.fillStyle = F.paper
    ctx.fillRect(0, 0, W, H)
    // the scene showing now, and the one it is turning into
    let cur = null, prev = null
    for (let i = 0; i < F.scenes.length; i++) {
      const s = F.scenes[i]
      if (t >= s.start && t < s.end) { cur = s; prev = F.scenes[i - 1] || null }
    }
    if (!cur) cur = F.scenes[F.scenes.length - 1]
    if (cur) {
      const tr = cur.in, p = tr.dur ? (t - cur.start) / tr.dur : 1
      if (prev && tr.type !== 'cut' && p < 1) {
        const A = layer(0), B = layer(1)
        drawScene(A.getContext('2d'), prev, t)
        drawScene(B.getContext('2d'), cur, t)
        composite(ctx, A, B, tr, K.clamp(p))
      } else drawScene(ctx, cur, t)
    }
    for (const o of F.overlays) { ctx.save(); o(ctx, t, W, H); ctx.restore() }
  }
})()
