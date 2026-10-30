# Craft — drawing a film by hand, in code

## The page contract

`index.html` loads the kit, the film's own scripts (a shared file, then one file per scene), the score, and
`kit/player.js` last. The film is a pure function of time: `K.drawFrame(ctx, t)` can draw any frame alone, in any
order — so render workers split the frames, and stills can be taken anywhere. Never keep state between frames;
never use `Math.random` (use `K.rng(seed)`; same seed, same take). Everything expensive that doesn't change per
frame (an outline, a scatter of 60 crumbs, a map) goes through `K.memo(key, fn)`.

Opened in a browser (from a local server or the file itself), the page is a player: space plays with sound,
arrows step a frame, the bar scrubs.

```js
K.setup({ W: 1080, H: 1080, fps: 30, duration: 36, paper: '#efe8da', seed: 1 })
K.scene({ id: 'corn', start: 12, end: 15, in: { type: 'turn', dur: 0.6, dir: 'left' }, draw(ctx, s) { … } })
// s = { t (film time), lt (time in scene), dur, p (0..1), W, H, id }
K.cue(13.25, 'corn: stalks shoot up', 'hit')          // a moment the music answers and the judges check
K.overlay((ctx, t, W, H) => K.grain(ctx, W, H, t, 0.05)) // drawn above every scene (grain, a logo bug)
```

Transitions (`in.type`): `cut`, `slide` (a new sheet slides over with a shadow), `turn` (the old sheet lifts away
like a page, its edge catching light), `push`, `ink` (the new scene shows through a growing blot, `at: [x, y]`),
`drop` (a sheet drops in with a bounce), `fade`. During a transition both scenes are drawn, so a scene must draw
fully from `lt = 0` and keep drawing sensibly for ~0.5 s past its end.

## The hand-drawn look

What makes code look drawn, in the order it matters:

1. **The ground**: paper, not a colour — `K.paper(ctx, W, H, color)` (tone blotches, fibres, tooth). Grain over
   the whole frame, changing 12 times a second (`K.grain`), sells "printed/drawn" more than anything else.
2. **The line**: ink that wobbles and swells — every `K.shape` outline is a filled ribbon whose width breathes
   along its length; `wob` (px) is how far the hand wanders; dark warm brown (`#2b2420`), never black; thicker
   on the subject, thinner on detail and on far things.
3. **The fill sits a hair off its line** (`offset`, default [0.8, 1.1]) like misregistered print.
4. **Shade and light inside the shape** (`shade: {amount, angle}`, `light: {amount}`), plus `texture` (grain in
   the fill) and `hatch` on the shadow side for an engraved feel. A shape with no shade reads as clip-art.
5. **Contact shadows** under things (`K.groundShadow`) — they put objects on the paper.
6. **Specific details**: the real thing's marks — a pineapple's diamonds, char on meat, the weave of a basket,
   rivets on a truck. Details are what make the viewer believe a person drew it.
7. **Line boil** (optional): `wob: …, boil: 8, t: s.t` redraws a line 8 times a second — use on living things
   only; a whole frame boiling looks cheap.

Kit:

- Points: `K.circle`, `K.ellipse(cx,cy,rx,ry,rot)`, `K.rect(x,y,w,h,r)`, `K.blob(cx,cy,r,seed,lump,n,ry)`,
  `K.leaf(x0,y0,x1,y1,w)`, `K.curve(pts)` (smooth through points), `K.move/scale/rotate`, `K.morph(a,b,t)`, `K.bounds`.
- Drawing: `K.shape(ctx, pts, {fill, line, lw, wob, seed, shade, light, hatch, texture, offset, draw, fillIn, alpha})`
  (`draw` 0..1 draws the outline on; `fillIn` 0..1 floods the colour), `K.line(ctx, pts, {color, lw, draw, taper})`,
  `K.ink` (the raw ribbon), `K.hatch`, `K.guide` (dashed construction line), `K.groundShadow`.
- Words: `K.caption(ctx, t, {kicker, text, start, end, x, y, size, maxWidth, accent, cps, cursor})` (types itself,
  slows after punctuation; the kicker is small, coloured, underlined as it appears), `K.label(ctx, text, x, y,
  toX, toY, {draw, size, side})` (a label with a leader line), `K.text`, `K.wrap`, `K.typed`, `K.typedEnd`.
- Media: `K.img(url)` and `K.footage(dir, {fps, count})` (frames made by `render.mjs frames <video> <dir>`);
  `K.drawImg(ctx, img, x, y, w, h, 'cover'|'contain', radius)`. They load before the frame is drawn — no
  flicker in a render. Put URLs that must be ready on the first frame in `K.film.preload`.

## Motion

- **Mass, not curves**: `K.spring(t - start, freq, damp)` overshoots and settles; `K.springTo(t, keys)` for a value
  that changes target several times (one spring per change, added — stays continuous). `K.at(t, start, dur,
  ease)` for eased moves; `K.keys(t, [[t, v], [t, v, 'ease']])` for keyframes.
- One main motion per scene the eye can follow, plus small life (drift, flicker, sway, steam).
- Things arrive: draw-on, flood-in, drop with a squash, grow from the ground — never just appear.
- Stagger on the music's grid (`start + i * EIGHTH`) so a run of arrivals is a rhythm.
- Time-lapse (growth, a sun's arc, a day passing) may run steadily; everything else eases.
- Camera: slow pushes (≤ 6% over a scene) and parallax layers; no whip pans; a cut instead of a long move.
- **Motion blur** for fast, energetic films: `K.film.blur = 6; K.film.shutter = 0.5` makes every rendered frame the
  average of 6 moments inside half a frame, like a real camera (renders take ~2–3× longer; `?noblur` in the page URL
  previews without it). Design fast moves for it — don't paint fake blur on top — and check stills and strips with it
  on: a spinning reel or a text whip that reads sharp in a preview can smear to a barcode.

## Words on screen

- One idea per caption, ≤ 2 lines, concrete. The typed caption is the narrator; it must be readable on a phone:
  ≥ 4.4% of the frame height (48 px at 1080), labels ≥ 2.2%.
- A caption band (top ~20%) kept clear of pictures; a brand bug, if asked for, in the opposite corner.
- Type at ~26–30 characters a second; every line fully on screen ≥ 1 s; a second line replaces or follows the
  first, never overlaps.
- The face is the film's own (set in `index.html` and `K.FONT`); a rounded hand-lettered face suits this look.

## Shots that make a sheet varied

Mix: an **object on paper** (isolated, lots of air, labels with leaders, a dashed axis) · a **landscape band**
(sky band with a torn top edge, layered hills, the subject living in it) · a **diagram / map** (a true outline,
routes drawing on, a north arrow and a scale bar) · a **close-up** (hands, a tool, the moment of change) · a
**lineup or ledger** (many small drawings in a row) · a **night** scene (dark ground, light ink) for contrast.
No two neighbouring scenes the same kind; no kind in more than half the film.

## Footage inside a drawn film

Real clips can sit inside a drawn world (a phone screen, a card, a framed print): `render.mjs frames clip.mp4
frames/clip --fps 30 --width 720`, then `const clip = K.footage('frames/clip', {fps: 30, count})` and
`K.drawImg(ctx, clip.at(s.lt), …)`. Draw a paper border or an ink frame around it so it belongs.

## Performance

A 1080² frame with a few hundred shapes draws in 20–60 ms. If a render is slow: memo the static outlines and
scatters (`K.memo`), lower `step` in `wob` only where needed, pre-draw a scene's static background to an
offscreen canvas once, and use `--workers` (one page per worker).
