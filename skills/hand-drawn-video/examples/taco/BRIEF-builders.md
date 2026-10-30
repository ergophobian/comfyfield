# Builder brief — "How this taco was made." (shared by every scene builder)

A 36 s, 1080x1080, 30 fps film drawn entirely in code on a canvas (no generated images or clips, no
photos). It counts down from "~2 years to dinner" to the bite, one scene per step of a taco al pastor's
life. Music only, no voice: the typed caption carries the story. Its look is a hand-drawn illustration on
warm paper — studied from a reference film; you get the rules below, not the reference.

## Files

- `common.js` — the timeline `T` (bars; 1 bar = 1.5 s), `bar()`, `EIGHTH` (0.25 s), palette `C`, `cap()` (the
  caption + kicker), `sceneAt(id, {in, draw})`, helpers `sky()`, `cloud()`, `hill()`, `sun()`. **Read it. Don't edit it.**
- `taco.js` — the taco scenes (hero, apart, bites, end). Don't edit it. You may call `TACO.tortilla / pork /
  pineapple / onion / cilantro / leafSprig / lime` to draw those foods so they match.
- `kit/*.js` — the drawing kit (API below). Don't edit it.
- `scenes/<id>.js` — **yours**: replace the placeholder with the real scene. Helpers you write stay in your file
  (prefix their names with your scene id so files never collide — everything is global).

## The look (every frame)

- Warm paper ground (`K.paper(ctx, W, H, C.paper)` first thing in draw). Pictures are illustrations: flat
  colour fills from `C`, soft inner shade and light (`K.shape(... {shade:{amount}, light:{amount}, texture})`),
  dark brown ink outlines that wobble and swell like a pen (`K.shape` does this; `line: C.ink`, `lw` 1.5–2.5),
  hatching on shadowed sides where it helps (`hatch: {angle, gap, alpha}`), soft contact shadows under things
  (`K.groundShadow`). Never pure black, never neon, never a gradient-on-gradient digital look.
- Two kinds of shot, mix them: an **object on the paper** (isolated subject, lots of paper around it, maybe
  dashed construction guides or small labels with leader lines `K.label`) or a **landscape band** (a sky band
  from y ≈ 230 down, torn top edge — `sky()` does it — hills, ground, the subject living in it).
- Rich and specific: draw the details the real thing has (a pineapple's diamond scales and spiky crown; a
  piglet's ears, snout, curly tail; corn kernels, silk, husks; a trompo's stacked layers and char). One clear
  subject per shot, big — it fills the picture area.
- The top band (y < 230) belongs to the caption (left) and the ComfyField logo (top-right, drawn for you).
  Nothing important goes there; a sky band may start at ~230.
- Something always moves: one main motion the eye follows, plus small life (clouds drift, smoke, steam,
  grass sway, flames flicker, a wheel turns). Motion with mass — `K.spring`, `K.at(..., 'inOut')`, `K.keys`;
  never constant-speed slides. Time-lapse growth is the exception: it may run steadily.
- Drawn feel: you may boil a line or two (`wob` with `boil: 8, t: s.t`) on living things; most lines stay still.

## Your scene's timing

`s.lt` is seconds since the scene started, `s.t` film time, `s.dur` its length (3 s). The scene's transition
in is the first 0.5 s (your scene is drawn under/over the previous one then — draw it fully from `lt = 0`).
The scene is also drawn for ~0.5 s **after** its end while the next one comes in, so keep drawing sensibly past
`s.dur` (clamp, don't vanish).

The caption — exactly these words, via `cap(ctx, s, kicker, [[text, localStart], ...])` at the END of your draw:

| id | time (s) | transition in | kicker | caption lines (local start s) |
|---|---|---|---|---|
| pineapple | 6–9 | `{type:'slide', dur:0.5, dir:'left'}` | `~2 YEARS TO DINNER` | `A pineapple takes two years to grow.` (0.45) |
| pig | 9–12 | `{type:'push', dur:0.5, dir:'left'}` | `6 MONTHS` | `A piglet grows up on a farm in Jalisco.` (0.45) |
| corn | 12–15 | `{type:'turn', dur:0.6, dir:'left'}` | `4 MONTHS` | `Corn grows tall, then dries on the stalk.` (0.45) |
| map | 15–18 | `{type:'ink', dur:0.6, at:[540,640]}` | `2 DAYS` | `Trucks roll toward Mexico City.` (0.4), `Four states. One street corner.` (1.7) |
| nixtamal | 18–21 | `{type:'slide', dur:0.5, dir:'up'}` | `1 NIGHT` | `Corn soaks in limewater overnight.` (0.4), `Then it's ground into masa.` (1.7) |
| trompo | 21–24 | `{type:'drop', dur:0.6}` | `6 HOURS` | `Pork in chiles and achiote, stacked on a spit.` (0.45) |
| comal | 24–27 | `{type:'slide', dur:0.5, dir:'left'}` | `1 MINUTE` | `Tortillas puff on the hot comal.` (0.4) |
| shave | 27–30 | `{type:'cut'}` | `NOW` | `Shaved thin. Pineapple flies.` (0.3) |

Scene notes (what the viewer must get; how you draw it is yours):
- **pineapple** — a crown planted in red-brown soil becomes a plant, a fruit rises from its centre and ripens
  green→gold over the 3 s; a sun arcs over to say "time passes". Fact: 18–24 months crown to fruit.
- **pig** — a piglet trots/roots in a Jalisco farmyard (agave-blue hills far off are a nice true detail) and
  grows into a pig (scale over the 3 s).
- **corn** — a row of corn shoots up past a farmer's height (a simple farmer figure in a hat for scale), then
  the stalks and husks turn from green to dry gold.
- **map** — night-blue map of Mexico (dark scene; ink = light lines). Real outline (fetch a public-domain
  country GeoJSON — e.g. Natural Earth via a GitHub raw URL — project it, simplify, embed the points in your
  file; save the download in its own empty folder). Four origins with small icons + labels: PINEAPPLE —
  Veracruz (~18.1 N, 95.9 W), PORK — Jalisco (~20.7 N, 103.3 W), CORN — Sinaloa (~24.8 N, 107.4 W), LIMES —
  Michoacán (~19.1 N, 102.4 W). Routes draw on toward Mexico City (19.43 N, 99.13 W, a star + "MEXICO CITY")
  with little trucks moving along them, the routes arriving on the eighth grid. A north arrow and a scale bar.
- **nixtamal** — night kitchen: dried kernels pour into a big pot of limewater (cal), steam rises, a moon or
  a clock says overnight; then (from 1.7 s) a stone mill / metate grinds them into a soft ball of masa.
- **trompo** — the vertical spit: red-orange marinated pork slices stack up on beats into the cone, a whole
  pineapple crowns it, the wall of flame behind glows and flickers.
- **comal** — a round hot griddle on a burner: a ball of masa is pressed flat (tortilla press or hands), laid on
  the comal, toasts with spots and PUFFS up (the puff is the scene's key moment — land it on a beat, ~1.75 s).
- **shave** — the taquero's knife shaves thin slices off the turning trompo into a tortilla in his other hand,
  then he flicks a piece of pineapple off the top and it arcs through the air and lands on the taco (the land
  is the key moment — on a beat near 2.25 s). Hands, knife and the tortilla are enough; no full person needed.

## Cues (the music is written from them)

For every key moment register `K.cue(time, 'id: what happens', 'hit')` at the top level of your file (film
time; put each on the eighth grid: `bar(T.<id>[0]) + n * EIGHTH`). 2–5 per scene. Softer moments use
`'soft'`. Don't add sound — the composer does.

## Kit API (the parts you'll use)

- shapes as point lists: `K.circle(cx,cy,r)`, `K.ellipse(cx,cy,rx,ry,rot)`, `K.rect(x,y,w,h,radius)`,
  `K.blob(cx,cy,r,seed,lump,n,ry)`, `K.leaf(x0,y0,x1,y1,width)`, `K.curve(points)` (smooth through points),
  `K.move/scale/rotate(pts,...)`, `K.morph(a,b,t)`
- `K.shape(ctx, pts, {fill, line, lw, seed, wob, shade:{amount,angle}, light:{amount}, hatch:{angle,gap,alpha},
  texture: 0..1, draw: 0..1 (outline draws on), fillIn: 0..1, alpha})` — `line: null` = no outline
- `K.line(ctx, pts, {color, lw, seed, draw, taper, alpha})` — open pen line; `K.guide` dashed line
- `K.label(ctx, text, x, y, toX, toY, {draw, size, side})` — label with leader line (text at x,y)
- `K.text(ctx, str, x, y, {size, align, color, alpha})`, `K.groundShadow(ctx, cx, cy, rx, ry, alpha)`
- time: `K.at(t, start, dur, ease)`, `K.spring(t, freq, damp)`, `K.keys(t, [[t,v],[t,v,'ease']])`,
  `K.pulse(t, times, dur)`, `K.noise1(x, seed)`, `K.rng(seed)` (seeded — never `Math.random`), `K.memo(key, fn)`
  for anything expensive that doesn't change per frame (outlines, scatters, the map)
- colour: `K.rgba(hex, a)`, `K.mixColor(a, b, t)`, `K.shade(hex, ±amt)`

## Check your own work (the look-and-fix loop)

Render pictures of only your scene — fast, no video:

```
node C:/Users/nique/Desktop/Create/hand-drawn-video/engine/render.mjs sheet C:/Users/nique/Desktop/Create/taco --from <start> --to <end+0.5> --every 0.25 --cols 7 --scale 0.3 --out C:/Users/nique/Desktop/Create/taco/out/<id>-sheet.jpg
node C:/Users/nique/Desktop/Create/hand-drawn-video/engine/render.mjs stills C:/Users/nique/Desktop/Create/taco --times <t1>,<t2> --scale 0.6 --dir C:/Users/nique/Desktop/Create/taco/out/<id>-stills
node C:/Users/nique/Desktop/Create/hand-drawn-video/engine/render.mjs strip C:/Users/nique/Desktop/Create/taco --at <fastest moment> --out C:/Users/nique/Desktop/Create/taco/out/<id>-strip.jpg
```

Open each picture you make and look hard. Fix and look again — several rounds — until you'd put it next to a
professional illustrator's work. Hunt for: a subject too small or off-centre; empty paper where a world
should be; something that reads as the wrong thing (meat that looks like berries); a shape with no shade;
pops (something appearing with no entrance); constant-speed motion; anything in the caption band; text cut
off at the frame edge; nothing moving at some moment; a key moment that isn't on its cue.
A browser console error shows up as `[page error]` in the command output — fix every one.

Don't render the full video, don't touch other scenes' files, don't commit anything. Keep your file under ~450
lines. Finish with a report of at most 10 lines: what each scene shows, its cues (time + label), and anything you
are unsure of.
