# Judge — v3 round 2, version B (out/draft-r3-B.mp4, 32.93 s, 1920x1080, motion blur on)

New judge (not round 1's). Read: BRIEF-v3.md, BRIEF-v2.md, visual-loop.md (10 criteria + the 11th, **Plays the song**),
v2 `review/r1/judge.md` and `r2/judge.md` (KEEP lists), round 1's `review/r1-B/judge.md` and `fixed.md`,
`review/r2-B/evidence.md` and every picture it lists (frame0, sheet-a/b, phone-1, key-moments, scenes, all 8 cut
strips), `review/r2-B/blind.md`, A's pack `review/r2-A/` (sheet-a/b), `song-A.js` / `song-B.js` (melody cleaned the
way `warp.js` cleans it), `warp.js`.

Extra pulls (12) in `judge-extra/`: 01 outro 31.36–31.73 (30 fps) · 02 Cinema 12.55–14.02 (every 0.13 s) · 03 slots
7.80–8.17 · 04 field 4.40–4.77 · 05 formats typing 17.80–18.53 (15 fps) · 06 flip → card 29.00–29.73 (15 fps) ·
07 paper 23.90 full frame · 08 spark 0.20–0.93 (15 fps) · 09 formats 19.55–19.92 · 10 slots 9.20–9.57 · 11 pre-flip
27.90–28.87 · 12 "earn." 29.70–30.07. I also viewed the builder's stills `out/a-outro-still/` (31.93, 32.05) and
`out/a-ripple-B-strip.jpg`.

**Measurement.** I decoded the r1 and r3 mp4s to 192x108 grey. For every hit I measured two things in the 3 frames
after it, each against the frame before. **d** is the largest frame change and **L** is the brightness rise. I compared
both against 400 random times in the same scene (the base). This is a cruder scale than round 1's, so compare numbers
only within this table.

| scene | snare L: r1 → r3 (base) | melody d: r1 → r3 (base) |
|---|---|---|
| spark | 0.8 → **12.9** (2.3) | 3.7 → 5.7 (6.1) |
| slots | −2.3 → −7.3. The reels fill blue, d 20.1 vs 15.7, a visible sweep | 13.9 → 17.4 (15.7): marginal |
| cinema | −0.4 → **13.1** (1.0) | 19.3 → 22.5 (23.8): lost under the bass surges. Bass L **23.6** (1.0) |
| formats | 3.8 → **9.5** (3.1) | 20.5 → **22.0** (15.1) |
| paper | 0.0 → **12.5** (4.1) | 13.0 → 14.0 (15.6). The pen is small by design |
| converge | −8.0 → **49.3** (−2.5) | — |
| end-card hold 30.7–32.8, icon area | — | 2.8 → **8.6** (5.8) |

## Round-1 fixes

| # | fix | status | evidence |
|---|---|---|---|
| 1 | Outro sings | **fixed, with two side effects** (fixes 1–2 below) | Pull 01: on 31.42 the icon blooms, a ring leaves it and "Your own keys" lights solid. More rings follow on 31.53 and 31.74. The blind now writes "pills highlight one by one", not "static end card". In the icon area the response per note is 3x round 1's. Side effects: the mark melts into a white blob, and every lit pill's label washes out as it decays (31.73, 32.05). |
| 2 | Cinema after the bass | **fixed** | Pull 02: the portal surges on the bass at 13.35 and 13.88, and a full-width flare streaks out on 13.48 (the snare) and 14.02. Spark fountains come at 12.82 and 13.62, and the camera steps in between 13.08 and 13.22. The caption stays untouched. The blind went from "almost no motion" to "mostly fine but slightly static". |
| 3 | Snares and weak kicks | **fixed, one miss** | Every snare in slots, cinema, formats, paper and converge now measures above its base (table). Pulls 03 and 10: a blue payline sweep runs across the reels at 7.86 and 9.39. The paper stars now come with burst lines (pull 07). Misses: **7.34** (s 0.99), where the reels are mid-zoom with no snap (strip 7.3), and 10.68, which is weak (L +3.8). |
| 4 | Pitch range (B) | **fixed** | `warp.js` moves notes below 44 to the bass layer for everyone. B's melody is now 46–72. Pull 08: "C" glints on the lowest note (0.31, MIDI 46). The field ripples now strike near the camera too (`a-ripple-B-strip`, 4.91–5.05). |
| 5 | Slots and formats notes too small | **partly** | Formats is fixed: the beads are ~40 px with glow and the passed chip lifts (pull 09). The notes now measure 22.0 vs a base of 15.1. Slots: at full size each note lights a bulb and a beam down the reel (pull 10, 9.25 and 9.47). At phone size that is a pale tint, and it measures only marginally above base. |

## The sound-off viewer's flags, verified

The blind's times run 1.5–2 s late after ~7 s (it miscounted tiles). I checked each flag against the real time.

- **"Every tool." / "One field." overlap at ~4.5 s.** This is the slam passing over line 1 for 3 frames (4.67–4.73,
  pull 04). It lands clean at 4.77. This is v2's motion (v2 KEEP 3), not an error.
- **"One field." clipped at 6.0.** This is the whip-out exit at 6.05 (sheet 6.0). v2's motion, not an error.
- **Reel text ghosted 7.5–10.** The spinning drums blur by design (v2 r1 fix 3 asked for exactly this). Every stopped
  name is sharp (sheet 9.5, pull 10). The smeared headline is its 2-frame slam (7.45–7.52). Not an error.
- **"22 proven" cut mid-word ("18.5").** Real time 18.07–18.30: the line is typing. It is whole from 18.33 and holds
  2.4 s to the tear (pull 05). Not an error.
- **Paper cluttered ("24.5–27").** Real time 21.5–24.8. This is partly true. The page now carries a red-noted staff
  across the top, three stars that accumulate (with burst lines), the stamps, the circle and the arrow (pull 07).
  The hierarchy still holds: the headline is biggest and the circled line is bold. Busy, not broken (Nice to have).
- **"Formats that ____" blank ("31 s").** Real time 29.70–29.77: "earn." rises through its mask and is whole from
  29.80 (pull 12). A 2-frame in-between, not an error.
- **The last pill "faded" ("31.5 onward").** **Real.** See fix 1.

## Scores (B)

| # | criterion | score | why (timestamps) |
|---|---|---|---|
| 1 | Hook | **8** | Frame 0 is v2's passing frame: "ComfyField" whole, light mid-stroke on the mark, grid floor. In the first 3 s: strokes at 0.16 / 0.67 / 1.19, letter glints per note (now from "C" on, pull 08), the snare snap on the name at 1.16 (L +12.9), the square slam at 1.70, the burst and navy→mist flip at 2.20, and the tile storm. Not 9: the logo slate holds 2.2 s (the song's pickup bar), and the letter glints are small sparkles. |
| 2 | Clarity | **8** | The sound-off read matches every scene's idea: brand, tools in one field, model slots → LTX-2.5, Cinema, "every tool on your computer, with your own keys", formats / 22 proven, the agent skill drew it in code, the vortex, the card. Soft, as in v2: why the models are "picked", what "earn" means, and 7.0–7.3 reads as "a small slot strip in a pale screen". |
| 3 | Craft (motion design) | **8** | The music layer is now visible at the frame's scale, in each scene's own vocabulary: payline sweeps on the reels, portal surges and anamorphic flares, burst-lined stars on the paper, a white snap through the vortex, rings off the end icon. Held at 8 by two slips on the final card. The mark melts: on notes the struck stroke blooms into a white blob (31.43–31.53, 31.93, 32.05). Lit pills wash out as they decay (31.73, 32.05). The v2 leftover smear of chips flying into the phone persists (19.6–19.9, pull 09). |
| 4 | Composition | **8** | One focal point per frame, and type stays on calm ground. No addition covers a must-read word: the Cinema flare crosses the man, not the caption, and the stars stay off the text column. The paper page is busier than v2's (staff, three stars, burst lines). At 23.90 the staff's highest note head almost touches the frame top (pull 07). |
| 5 | Motion | **8** | The time map is smooth, and every v2 handoff holds in the cut strips. The Cinema hold now moves: surges, a camera step, flares. Still: 7.25–7.58 is a linear-feeling zoom of the reels out of a void. The built mosaic sits nearly still 28.1–28.85 (pull 11). The icon travels under heavy blur 29.40–29.53 (pull 06, a v2 leftover). |
| 6 | Transitions and variety | **9** | Unchanged and excellent: burst, dive through a tile, reels fold to a card, fan deal, portal punch, arch mask, blow-past with an impact frame on the drop (16.60), tear, shatter → vortex → star, tiles → mark → grid icon, flip to light. Nine kinds of picture. |
| 7 | Readability | **8** | Headlines are 84–150 px on calm ground. Stopped reel names are sharp, the Cinema credit is whole ≥ 1.2 s, "22 proven formats." holds 2.4 s, and the paper lines and stamps are readable on phone-1. Not higher: as a pill decays, its label's contrast collapses (fix 1), and the end pills and URL are small at phone size (v2-level). |
| 8 | Pacing and sync | **9** | The structure lands to the frame on the song: burst 2.20, portal 12.48 on the bass entry, blow-past 16.60 on the drop with an impact frame, tear 20.72, vortex 24.84, star 26.89, flip 29.00 on the drum cut (pull 06). Both of round 1's soft spots are gone: the Cinema hold and the still card. Remaining: 0.75 s of near-still mosaic before the flip (28.1–28.85). |
| 9 | Truth | **9** | Every line is v2's passing wording. The reels show only LTX-2.5, LTX Video, Wan 2.2 and MiniMax H3 (pulls 03 and 10). Nothing new is claimed. |
| 10 | Wow | **8** | v2's screenshot moments survive (tile storm, portal, page shatter, grid icon). With the song they hit harder: the portal now breathes and flares with the bass, the wall plays the rising run, the pen inks the melody, and the outro sings. Not 9: slots' and the spark's music layer is still decoration-sized, and the end card's bloom cheapens the mark. |
| 11 | **Plays the song** | **8** (was 6) | **Kicks:** the structure and v2's stops sit on kicks. The camera dips (field), steps in (Cinema 13.25), the phone kicks, the prints slap and the vortex lurches. In slots the kick can't be told apart from the spin, but the reel stops land on it. **Snares:** every scene now snaps (table). Misses: 7.34 (s 0.99) at the reels' arrival, which zoom on and arrive full-size at ~7.58, and 10.68 (weak). **Melody:** visibly answered in field (white ripple discs), montage (the keyboard), formats (beads, chip lifts), paper (the pen), the end-build rows and the outro (bloom, ring, pill per note). Weak in slots (a pale beam) and in Cinema, where the bass rightly dominates. **Bass:** gated to 12.48–28.94, and the Cinema surge (L 23.6 vs 1.0) sells its arrival. **Nothing off the beat:** true. The only clutter is the busy paper page. |

**Verdict: PASS.** Every criterion is ≥ 8. Transitions, Pacing and Truth are 9. Nothing on v2's KEEP lists is broken.
The two fixes below are real errors on the final card and take minutes. They need a stills check, not another judge.

## KEEP (must survive any further change)

1. Everything on v2 r2's KEEP list (1–15) and round 1's KEEP (1–12). All of it is intact.
2. The time map landing to the frame: burst 2.20, portal 12.48 on the bass entry, blow-past 16.60 on the drop (with
   the 1.08x impact frame), tear 20.72, vortex 24.84, star 26.89, flip 29.00 on the drum cut.
3. 12.55–14.3 Cinema: portal surges on the bass (13.35, 13.88), the camera stepping in on the kick, the full-width flare on the
   snare (13.48), the note spark fountains, with the caption untouched (pull 02).
4. Slots: the blue payline sweep across the three reels on each snare (7.86, 9.39), and the bulb plus beam per note
   (pulls 03 and 10). The reel stops on kicks with the ray flash (8.11).
5. Paper: the pen inking the melody on its staff, prints slapping on kicks, stars landing on snares with burst
   lines (pull 07).
6. Converge: the white snap through the vortex on the snare (25.86).
7. Field: the note ripple discs of tiles whitening and tipping, the camera dip on the kick, the snare glint over the words.
8. Outro: one visible answer per note, with a ring off the icon and a pill lighting by pitch (B) or in turn (A). The layout
   holds still and the words never move.
9. "earn." rising through its mask (29.70–29.80) and the pills popping on the eighths in the drumless outro.
10. The restraint: no reaction covers a must-read word, nothing fires off the beat, and the bass is gated to 12.48–28.94.
11. The melody cleaning in `warp.js` (below 44 goes to bass, notes within 70 ms merge).

## FIX LIST (real errors only; shared code, so A and B both get them; check on motion-blurred stills at the note times)

1. **29.0–32.94 · Lit pills wash out as they decay.** Fill and text cross-fade together, so mid-decay a label reads grey
   on lilac or white on pale lilac. At 31.73, "Built on the Comfy Developer Platform" nearly vanishes (pull 01, last
   tile; the blind's "faded pill"). At 32.05, "Runs on your computer" is low-contrast (builder still). With 12 notes
   in 4 s, some pill is mid-wash most of the hold · **Every pill's words stay clearly readable at every frame of the
   light-and-decay.** Light the pill with fill and glow while the text keeps a strong contrast, or flip the text colour
   only once the fill is dark enough. The pills never look "still fading in" · lifts Readability and Craft (real
   error on the final card).
2. **29.0–32.94 · The mark melts on the notes.** The struck stroke blooms into a soft white blob. At 31.43–31.53 the icon
   reads as a white cloud, not the ComfyField mark. At 31.93 and 32.05 a white smear sits over the bar (builder
   stills). On the brand's final hold, the logo loses its shape every few tenths of a second · **The struck stroke
   flashes in its own shape:** a crisp, brighter copy of that stroke with its glow outside the icon's silhouette, plus
   the ring. The mark reads as the ComfyField mark in every frame. Keep the ring and the per-note count · lifts Craft
   (real error, brand on the end card).

## Nice to have (not for the fixer)

- 7.25–7.58: the reels zoom up from a tiny strip and reach full size ~0.24 s after the strong snare at 7.34 (s 0.99),
  with no snap on it. Landing them on 7.34 would answer the snare and shorten the "small strip in a pale void" that the
  blind flagged two rounds running.
- 28.1–28.85 (B): the built mosaic sits nearly still for 0.75 s (pull 11). B has no melody notes there, but the hats at
  28.18 / 28.43 / 28.57 could tick tiles into the drum cut. A is livelier here (five notes).
- Slots notes: the bulb's beam is a pale tint at phone size. A brighter lit bulb, with the name it lands on brightening,
  would read.
- 19.55–19.92: a format chip flying into the phone is a smeared pink pill (v2 leftover; the blind reads it as clutter).
- 23.90: keep the staff's top note heads ≥ 20 px inside the frame, and let older stars dim as the next lands, so the
  page reads calmer.
- 29.40–29.53: the icon travels to the wordmark under heavy blur (v2 leftover).
- 10.68: the Cinema snare is weak (the first card deal sits 0.07 s later). A glint on the card as it leaves would catch it.
- 0–2.2: a bigger per-note lift on the letters (not only a sparkle) would sell "this plays the song" from the first note.

## A vs B

Same picture and same code. At sheet scale A and B are identical except the per-note layer (both pack's sheets).
After `warp.js`'s cleaning, **42 % of A's 83 melody hits fall within 60 ms of a kick or snare. For B it is 0 % of
87.** So A's note answers mostly double the drums. The measurement shows it: A's montage notes flash L +29.8 against
B's +5.5, and A's Cinema notes +9.7 against B's −2.7. That is the drum and bass reaction, counted twice. B's answers fall
between the drums, and pitch lets B draw the tune: the keyboard climbs, the pen draws the contour, the letters light
in order, and the outro has 12 notes to A's 7. A is livelier only in 27.9–28.7 (five notes against none). **B reads
better**, and it is the version that visibly plays the melody. Both versions need fixes 1–2.
