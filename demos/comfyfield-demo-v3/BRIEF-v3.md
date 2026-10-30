# Brief v3 — the film plays the owner's song (shared by builders A, B, C)

The owner loved v2 ("the video came out good") and asked: **make another version synced to their song
(`assets/song.mp3`, 32.94 s, ~116.7 bpm, 4/4) — and show yourself as a great motion designer, like v2.** They also
want to compare the two music-sync methods they built for SupremeGens: **A = "volume"** (a melody hit wherever the
melody stem gets suddenly louder: the punchy notes only, no pitch) and **B = "notes"** (Basic Pitch: every melody
note, with its MIDI pitch). Same picture, same code; only the measured song differs.

Project: `C:/Users/nique/Desktop/Create/comfyfield-demo-v3/` — a copy of v2 with your scenes in `scenes/`. Read
`warp.js` (the time map and the SONG API) — it is shared; don't edit it. Your v2 scene code is unchanged; your job is
to **add the music**.

## How v3 works (already done)

- The film runs in **song time** (32.94 s). Each frame at song time t draws your v2 scene at `SONG.v2At(t)`. So `s.t`,
  `s.lt` in your draw are still **v2 time** — everything you wrote still works.
- The structure is pinned to the song: burst 2.20 (first downbeat), field 3.23, slots 7.35, Cinema 10.43, **portal
  punch 12.48 = where the bass enters**, montage 14.54, **formats 16.60 = the drop**, paper 20.72, vortex 24.84,
  collapse 26.89, **logo flip 28.94 = where the drums cut out** (melody-only outro to 32.94). Your strong hit cues were
  snapped onto the song's kicks and snares.
- `SONG.now` = the song time of the frame being drawn (read it inside draw). Layers: `kick`, `snare`, `hats`, `bass`,
  `other` (= the melody). A hit is `{ t, s }`; under B also `{ p: MIDI pitch, n }`.
  - `SONG.pulse(layer, dur = 0.22, minS = 0)` → 0..1, jumps on each hit and falls over `dur`
  - `SONG.last(layer, minS)` → the latest hit (with `.t`, `.s`, maybe `.p`); `SONG.count(layer, minS)` → hits so far
  - `SONG.hits(layer, a, b, minS)` → hits in [a, b) of song time
  - `SONG.pitch01(layer, hit)` → 0..1 across the layer's pitch range, or **null under A** (no pitch)
  - `SONG.beat()`, `SONG.bar()` → `{ i, phase }`
- The sound is the song plus effects on your cues (`score.js`); you don't write sound.

## Your job: make every scene play the song

Not a visualiser bolted on top — the scene's own things answer the music, so a viewer feels the picture is
*performing* the track. Each scene should answer at least: the **kick** (weight: a punch of scale, a camera nudge, a
thing landing), the **snare** (snap: a glint, a flip, a jolt), the **melody** (`other`: something per note — this is
where A and B differ), and the **bass** where it plays (from 12.48: depth, glow, low throb). Ideas, yours to beat:

- spark: the strokes and the comet flare on the first beats; the name's letters light per melody note.
- field: tiles flip on melody notes in a travelling wave — under B, the wave's position along the field follows
  pitch (high notes far, low notes near); the camera banks on the kick; pills lift on snares.
- slots: reel ticks on every melody note; the jackpot rays pulse with the kick.
- cinema: the dealt cards land on kicks; the portal's light breathes with the bass; sparks per note.
- montage: each melody note flips one cell — under B, the column follows pitch, so the wall *plays the tune* left
  to right / low to high; the bass makes the wall throb.
- formats: the orbit's chips glint per note; the phone kicks on the kick; landings on the drums.
- paper: ink dots/notes written per melody note across the page (under B, their height = pitch: the pen writes the
  melody's contour), stars on snares, prints slap on kicks.
- converge: the vortex lurches on each kick and flares per note.
- end: tiles snap per note as the mark builds; after 28.94 (drums gone) only the melody remains — the mark and card
  answer each note softly (a glint, a ripple), so the outro sings.

**Same code for A and B.** Use pitch when a hit has it (`h.p != null` / `SONG.pitch01 != null`), otherwise a fallback
that still looks designed (strength → size/brightness, a hash of the hit time → position). Never break or look empty
under A.

## Rules

- Keep v2's look, cues and what passed review (v2's KEEP lists: `../comfyfield-demo-v2/review/r1/judge.md`,
  `r2/judge.md`). Additions must not cover words that must be read, or clutter: tasteful, purposeful, on the beat.
- Motion blur is on (`K.film.blur = 6`): reactions are short punches, design them to read through blur.
- Test both versions: `--page index-B.html` (B, default) and `--page index-A.html` (A) on the render commands:
  ```
  node C:/Users/nique/Desktop/Create/hand-drawn-video/engine/render.mjs sheet C:/Users/nique/Desktop/Create/comfyfield-demo-v3 --page index-B.html --from <a> --to <b> --every 0.1 --cols 8 --scale 0.18 --out …/out/<id>-B.jpg
  node …/render.mjs strip … --page index-A.html --at <t> --out …/out/<id>-A-strip.jpg
  ```
  (times are **song** time). To check sync, render a short piece with sound and look at its frames next to the
  hits: `node …/render.mjs render … --from <a> --to <b> --out …/out/<id>-test.mp4 --workers 2`, and read the hits from
  `song-A.js` / `song-B.js`.
- Edit only your own scene files. Back them up to `backup-v3/` first. No `[page error]`, no 404s.
- Report in ≤ 8 lines: what each scene now does with the kick, snare, melody (A vs B) and bass.
