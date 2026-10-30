// The film: its size, length, look, and every scene on the timeline.
// Plan the timeline on the music's grid first (score.js sets the tempo), so cuts land on bar lines.
const W = 1080, H = 1080
K.setup({ W, H, fps: 30, duration: 6, paper: '#efe8da', seed: 1 })
const BAR = 1.5 // seconds per bar — keep in step with score.js

K.scene({
  id: 'hello', start: 0, end: 6,
  draw(ctx, s) {
    K.paper(ctx, W, H, K.film.paper)
    const grow = K.spring(s.lt - 0.4, 1.8, 0.5)
    K.groundShadow(ctx, W / 2, 700, 230 * grow, 40 * grow)
    K.shape(ctx, K.blob(W / 2, 560, 200 * grow + 1, 4, 0.12), { fill: '#e8a33d', shade: { amount: 0.4 }, light: { amount: 0.3 }, texture: 0.6, seed: 4 })
    K.caption(ctx, s.t, { kicker: 'Example', text: 'Something drawn by hand, in code.', start: 0.3, x: 54, y: 50, size: 46 })
  },
})
K.cue(0.4, 'blob grows', 'hit')
K.overlay((ctx, t, W, H) => K.grain(ctx, W, H, t, 0.06))
