# Builder brief — ComfyField demo v2 (shared by every builder)

The owner liked v1's visuals but asked for this: **"more fast paced, and ambitious, make the motion graphics more
'wow' factor — show what a talented and creative motion designer you are."** The music will be upbeat and fun: the
son jarocho band of the taco film (jarana strums, a requinto hook, tarima heels), faster, with a sound effect on
every hit. So every scene is cut to that band.

30 s, 1920x1080, 30 fps, all drawn in code on a canvas, plus the app's own footage. Project:
`C:/Users/nique/Desktop/Create/comfyfield-demo-v2/`. v1 (the calmer version) is in `../comfyfield-demo/` — read its
scene files (`field.js` has the 3D field projection, `models.js`, `formats.js`, `skill.js`, `end.js`) and reuse or
adapt anything; but v2 must feel twice as alive.

## The grid (read `film.js`)

6/8 at dotted-quarter 100: **one bar = 1.2 s, one eighth = 0.2 s, one big beat = 0.6 s.** `BARS(b)`, `at8(b, k)`,
`span(id)`, the timeline `T`. Every cut on a bar line; every hit on an eighth. Pace: something visibly changes every
0.2–0.6 s; a hit on every big beat; no shot holds still longer than one bar except the end card's last 2 s.

| id | bars | time (s) | builder |
|---|---|---|---|
| spark | 0–2 | 0–2.4 | A |
| field | 2–5 | 2.4–6.0 | A |
| slots | 5–7 | 6.0–8.4 | B |
| cinema | 7–9 | 8.4–10.8 | B |
| montage | 9–11 | 10.8–13.2 | B |
| formats | 11–14 | 13.2–16.8 | C |
| paper | 14–19 | 16.8–22.8 | C |
| converge | 19–21 | 22.8–25.2 | C |
| end | 21–25 | 25.2–30.0 | A |

Each scene: `K.scene({ id, ...span(id), in: {…}, draw(ctx, s) {…} })` in its file in `scenes/`. Transitions may be
the kit's (cut, slide, push, turn, ink, fade, drop) or — better — built inside your scenes (a zoom-through, a whip, a
tear, tiles flying); a scene is drawn ~0.5 s past its end while the next comes in, so draw sensibly past `s.dur`.
Coordinate the handoffs at your boundaries with the neighbouring builder's first/last frame via the storyboard below.

## The storyboard (what each moment must do — how is yours; beat it if you can)

- **spark (A)** — Deep indigo dark (`#0a0e2c`), the ComfyField mark's three white strokes draw on with a glow on the
  eighths 0.2 / 0.4 / 0.6, "ComfyField" types/slams beside it, then at **1.2 the mark bursts**: dozens of tiles (the
  app's live clips) fly out of it toward the camera and the world flips to light mist. One "how did they do that".
- **field (A)** — The camera flies low and fast over a field of live tiles (v1's projection, faster, closer), tiles
  flipping in waves on the eighths; kinetic type slams on big beats: "Every tool." then "One field."; tool name pills
  pop across the field on eighths (`TILE_NAME`). At ~5.4 the camera pitches down and **dives through one tile** (a
  zoom-through) into the next scene.
- **slots (B)** — "Open-source video models" slams; three slot-machine reels of model names spin with blur and
  **stop one by one on big beats** (6.6, 7.2, 7.8) on LTX-2.5, Wan 2.2, MiniMax H3 (glow + click on each stop); "at
  your hand." Then the reels fold into one card.
- **cinema (B)** — The three Cinema shots (`shots[0..2]`) burst out as a fan on eighths; at **9.6 shot 2 (the
  portal) punches to full frame** — the film's biggest hit; caption "Cinema — LTX-2.5 on Comfy Cloud, rendered in
  ComfyField".
- **montage (B)** — Through the portal into a beat-cut wall of the app's clips (`clip[...]`, `mclip[...]`): cells swap
  / flip / slide on every eighth in cascading waves, shapes changing (squares → circles → pills), then the wall pulls
  back to a huge mosaic. Words: "Every tool." / "Every format." (no counts you can't verify).
- **formats (C)** — The phone (`seed` = the Seedance post) swings in in 2.5D (fake 3D: scaleX by cos, skew), format
  chips orbit it on a tilted ellipse (z-sorted, in front and behind), then **shoot into the screen on eighths**;
  "Formats that earn." slams; "22 proven formats." Credit stays: "Made with Seedance 2.5 by the ComfyField team".
- **paper (C)** — The glass world **tears** (a torn paper edge rips across) and we're on the taco film's warm paper:
  "Custom skills for motion graphics." (ink-drawn underline), the taco film (`taco.at(filmTime)`, 1080² frames at
  800 px, 37.5 s) plays big in a hand-drawn frame and **cuts on every bar** to its best moments, ink doodles pop on
  the beats (arrows, stars, a pen line), and the line "An agent skill drew and scored this film in code. No image or
  video model." (≥ 44 px). Optional stamps (exact words only): "Visual loop · 3 rounds", "BGM loop · 2 rounds".
- **converge (C)** — Everything accelerates: tiles, model chips, taco frames, format chips spiral into the centre
  like a vortex (streaks, blur), faster each beat, and **collapse into a point of light at 25.2**.
- **end (A)** — From that point the ComfyField mark is **built from tiles snapping into its shape** on eighths, then
  "ComfyField" slams, "Formats that earn." rises, pills (Open source · MIT / Runs on your computer / Your own keys /
  Built on the Comfy Developer Platform) pop on eighths, "github.com/ergophobian/comfyfield". The complete card holds
  ≥ 2 s (28.0–30.0) with a slow push-in.

## The look

- Brand: light glass in ComfyField's indigo (`B` in film.js: `#2f3fe8`, `#4a5bff`, mist `#eef1ff`→`#d9e0ff`), Inter
  700–900 for type (`slam`, `rise`, `txt`), glass cards (`glass`, `pill`). Deep indigo (`#0a0e2c`) for contrast
  moments (the spark, the vortex). The paper section in the taco film's look (`K.paper`, Delius for hand notes).
- **Wow**: real depth (2.5D projection, parallax layers, z-sorting), masks and reveals, kinetic type that punches on
  the beat (`slam`), speed lines on whips (`streaks`), light flashes on the biggest hits (`flash`, sparingly), springs
  with overshoot everywhere, no linear slides, no static holds. Every scene has one moment a viewer would screenshot.
- Footage: `clip[TILE].at(t, true)`, `mclip[NAME].at(t, true)`, `shots[i].at(t)`, `seed.at(t)`, `taco.at(t)`;
  `K.drawImg(ctx, img, x, y, w, h, 'cover', radius)`. Images load before the frame — never draw a blank rect for a
  missing one.
- Readability: every word a viewer must read is ≥ 44 px (labels/pills ≥ 26 px), on a calm ground, on screen ≥ 0.8 s.
- The final render uses **motion blur** (`K.film.blur = 4`): fast moves will smear like a camera — design for it,
  don't fake blur on top. Preview without it (it's off unless set).

## Truth (every claim on screen must be one of these, word for word or narrower)

"Every tool. One field." · "Open-source video models, at your hand." · model rows: LTX-2.5, LTX Video, MiniMax H3
(open weights), Wan 2.2, HunyuanVideo-Foley (sound for video) · "Cinema — LTX-2.5 on Comfy Cloud, rendered in
ComfyField" · "Formats that earn." · "22 proven formats." · "Made with Seedance 2.5 by the ComfyField team" · tool names
from `TILE_NAME` · "Custom skills for motion graphics." · "An agent skill drew and scored this film in code. No image
or video model." · "Every tool on your computer, with your own keys." · the end-card lines above. Nothing else factual.

## Cues (the band answers these — label words matter)

Register every hit with `K.cue(time, '<id>: <word> …', 'hit' | 'soft')` at the top of your file, on the eighth grid.
Start each label with one of these words so the composer can score it: **boom** (the three biggest: 1.2 burst, 9.6
portal, the end logo), **slam** (type punches in), **stop** (a reel locks), **burst**, **dive** (zoom-through),
**whoosh** (a fast move/whip), **flip** (tiles flip), **pop** (a small thing appears), **land** (a thing lands),
**tear**, **ink** (a pen line), **cut** (a film cut), **spin**, **rise**. 4–10 cues per scene.

## Check your own work

```
node C:/Users/nique/Desktop/Create/hand-drawn-video/engine/render.mjs sheet C:/Users/nique/Desktop/Create/comfyfield-demo-v2 --from <start> --to <end+0.4> --every 0.2 --cols 6 --scale 0.22 --out C:/Users/nique/Desktop/Create/comfyfield-demo-v2/out/<id>-sheet.jpg
node …/render.mjs strip … --at <fastest moment> --out …/out/<id>-strip.jpg
node …/render.mjs stills … --times a,b --scale 0.5 --dir …/out/<id>-stills
```

Open every picture and look hard; rounds until it's the best motion design you can make. Hunt for: a hold longer than
a bar, linear motion, a pop with no entrance, unreadable text, empty halves of the frame, a handoff that jumps. Fix
every `[page error]` and every missing-frame 404. Don't render the full film, don't edit other builders' files or
`film.js`/kit (ask the lead in your report if you need a shared helper). Report in ≤ 8 lines: what each scene does,
its cues, anything unsure.
