// Hand-drawn video kit: the page. Opened in a browser it is a player (space = play, arrows = step, the bar
// scrubs). Driven by render.mjs it draws exact frames and hands back the mixed sound.
(function () {
  const K = window.K, F = K.film
  const params = new URLSearchParams(location.search)
  const RENDER = params.has('render')
  const canvas = document.getElementById('c') || document.body.appendChild(document.createElement('canvas'))
  canvas.width = F.W; canvas.height = F.H
  const ctx = canvas.getContext('2d')

  // render.mjs: draw frame at time t (loads any picture it needs first), return it as an image
  window.renderFrame = async function (t, o = {}) {
    K.drawFrame(ctx, t)
    for (let i = 0; i < 4 && K.mediaPending(); i++) { await K.mediaWait(); K.drawFrame(ctx, t) }
    if (o.stamp) {
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, F.H - 44, 150, 44)
      ctx.fillStyle = '#fff'; ctx.font = '28px monospace'; ctx.fillText(t.toFixed(2) + 's', 10, F.H - 12); ctx.restore()
    }
    return canvas.toDataURL(o.type || 'image/jpeg', o.quality ?? 0.94)
  }
  window.filmInfo = () => ({ W: F.W, H: F.H, fps: F.fps, duration: F.duration, cues: F.cues, scenes: F.scenes.map((s) => ({ id: s.id, start: s.start, end: s.end, in: s.in.type })) })

  let audio = null
  async function ensureAudio() { if (!audio) audio = await K.music.render(F.duration); return audio }
  // render.mjs pulls the sound in slices (16-bit interleaved stereo, base64)
  window.renderAudio = async function () { const a = await ensureAudio(); return { sr: a.sr, length: a.left.length, peakBefore: a.peakBefore } }
  window.audioSlice = function (from, count) {
    const a = audio, n = Math.min(count, a.left.length - from), bytes = new Uint8Array(n * 4), dv = new DataView(bytes.buffer)
    for (let i = 0; i < n; i++) {
      dv.setInt16(i * 4, Math.max(-1, Math.min(1, a.left[from + i])) * 32767, true)
      dv.setInt16(i * 4 + 2, Math.max(-1, Math.min(1, a.right[from + i])) * 32767, true)
    }
    let s = ''
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
    return btoa(s)
  }
  window.musicSummary = () => K.music.summary()
  window.drawRoll = function (W = 2400, H = 700) {
    const c = document.createElement('canvas'); c.width = W; c.height = H
    K.music.drawRoll(c.getContext('2d'), W, H)
    return c.toDataURL('image/png')
  }

  const ready = document.fonts ? document.fonts.ready : Promise.resolve()
  ready.then(async () => {
    // make sure every face the film names is loaded before the first frame
    try { await document.fonts.load(K.font(40, 400)); await document.fonts.load(K.font(40, 700)) } catch (e) {}
    if (F.preload) await Promise.all(F.preload.map((u) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = u })))
    window.__READY__ = true
    if (!RENDER) startPlayer()
  })

  function startPlayer() {
    document.body.style.cssText = 'margin:0;background:#1d1a17;color:#eee;font:14px sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:10px'
    canvas.style.cssText = 'max-width:96vw;max-height:84vh;box-shadow:0 10px 40px rgba(0,0,0,.5)'
    const bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:10px;align-items:center;width:min(96vw,900px)'
    const btn = document.createElement('button'); btn.textContent = 'Play'; btn.style.cssText = 'padding:6px 14px'
    const range = document.createElement('input'); range.type = 'range'; range.min = 0; range.max = F.duration; range.step = 1 / F.fps; range.value = 0; range.style.flex = '1'
    const lab = document.createElement('span'); lab.style.cssText = 'font-family:monospace;min-width:110px'
    bar.append(btn, range, lab); document.body.append(bar)
    let t = 0, playing = false, ac = null, src = null, t0 = 0, startT = 0
    const show = async (x) => { t = Math.max(0, Math.min(F.duration, x)); await window.renderFrame(t); range.value = t; lab.textContent = t.toFixed(2) + ' / ' + F.duration.toFixed(1) }
    async function play() {
      btn.textContent = 'Rendering sound…'
      const a = await ensureAudio()
      ac = ac || new AudioContext({ sampleRate: a.sr })
      const b = ac.createBuffer(2, a.left.length, a.sr); b.copyToChannel(a.left, 0); b.copyToChannel(a.right, 1)
      src = ac.createBufferSource(); src.buffer = b; src.connect(ac.destination)
      startT = t >= F.duration ? 0 : t; src.start(0, startT); t0 = ac.currentTime; playing = true; btn.textContent = 'Pause'
      const tick = async () => { if (!playing) return; const now = startT + ac.currentTime - t0; if (now >= F.duration) { stop(); return } await show(now); requestAnimationFrame(tick) }
      tick()
    }
    function stop() { playing = false; if (src) try { src.stop() } catch (e) {} btn.textContent = 'Play' }
    btn.onclick = () => (playing ? stop() : play())
    range.oninput = () => { stop(); show(+range.value) }
    addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); playing ? stop() : play() } if (e.code === 'ArrowRight') { stop(); show(t + 1 / F.fps) } if (e.code === 'ArrowLeft') { stop(); show(t - 1 / F.fps) } })
    show(0)
  }
})()
