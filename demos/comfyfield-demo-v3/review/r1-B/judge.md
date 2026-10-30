# Judge — v3 round 1, version B (out/draft-r1-B.mp4, 32.93 s, 1920x1080, motion blur on)

Read: BRIEF-v3.md, BRIEF-v2.md, visual-loop.md (10 criteria + an 11th, **Plays the song**), v2 `review/r1/judge.md` and
`r2/judge.md` (KEEP lists), `review/r1-B/evidence.md` and every picture it lists (frame0, sheet-a/b, phone-1,
key-moments, scenes, all 8 cut strips), `review/r1-B/blind.md`, `review/r1-A/evidence.md` + A's sheet-a/b, end strip,
`song-A.js` / `song-B.js`, the v3 diff of every scene against `backup-v3/`, `warp.js`, `score.js`.

Extra pulls (12) in `judge-extra/`: 01 spark 0.20–0.93 · 02 burst 2.10–2.83 · 03 field 4.40–5.13 · 04 montage
15.10–15.83 (the rising run) · 05 portal 12.40–13.13 · 06 Cinema hold 13.2–14.3 · 07 formats 18.60–19.33 · 08 paper
23.62 full · 09 drum cut 28.80–29.53 · 10 outro 31.35–32.08 · 11 formats 19.45 full · 12 **A** montage 15.10–15.83.

**One measurement** (not a picture; a crude check of what the eye can catch at phone size): both mp4s decoded at
192x108 grey (about a phone's width in landscape). For every kick, snare and melody note I compared the frame-to-frame
change and the brightness in the 4 frames after the hit against the 4 frames before, and against 400 random times in
the same scene. "Responds" below means clearly above the random baseline. B:

| scene | kick | snare | melody note |
|---|---|---|---|
| spark 0–2.2 | responds (3.9 vs 1.7) | no (1 snare) | responds a little (2.8 vs 1.9) |
| field 2.2–7.35 | responds (7.7 vs 2.5) | responds in brightness (10.7 vs 4.2) | a little (4.5 vs 3.3) |
| slots 7.35–10.43 | weak (2.3 vs 1.6) | **no** (luma −0.8 vs 0.7) | **no** (1.5 vs 1.6) |
| cinema 10.43–14.54 | responds (7.5 vs 2.4; the 12.48 punch) | **no** (luma −0.2 vs 2.0) | **no** (1.1 vs 2.3) |
| montage 14.54–16.6 | lost in the wall's churn | responds in brightness (15.6 vs 5.2) | brightness (9.0 vs 5.2) |
| formats 16.6–20.72 | responds (3.1 vs 1.7) | **no** (luma 0.6 vs 1.1) | responds (2.8 vs 1.7) |
| paper 20.72–24.84 | responds (5.4 vs 3.4; prints slap) | **no** (0.2 vs 1.5) | **no** (1.0 vs 2.9) |
| converge 24.84–26.89 | not separable from the spin | **no** (1 snare) | no (1.9 vs 2.2) |
| end build 26.89–28.94 | weak | responds (5.5 vs 1.8) | responds (2.9 vs 1.4) |
| outro 28.94–32.94 | — (drums out) | — | tiny, on a still card (3.5 vs 1.1) |

## Sound-off read vs what each scene must make the viewer get

| scene | must get | blind got | match |
|---|---|---|---|
| spark 0–2.2 | ComfyField; it bursts into a world of clips | brand opener, "the F has a glint", orb bursts into thumbnails | yes |
| field 3.23–7.35 | every tool in one field | "Every tool. One field.", tags read (Relight, Lipsync, Try-on, Motion control) | yes |
| slots 7.35–10.43 | open-source models at your hand | slot columns of model names, collapse to an LTX-2.5 button | yes |
| cinema 10.43–14.54 | LTX-2.5 on Comfy Cloud, rendered in ComfyField | cinematic portal clip, caption read; "holds ~2 s with almost no motion" | yes, but dead hold |
| montage 14.54–16.6 | every tool on your computer, your own keys | both lines read | yes |
| formats 16.6–20.72 | 22 proven formats; a format shapes a post | headline + "22 proven formats."; chips mostly unread; 19–19.5 "smeared pink pill, glitch" | partly (as in v2) |
| paper 20.72–24.84 | an agent skill drew and scored this film in code | "how did they do that… drawn in code" | yes |
| converge 24.84–26.89 | everything collapses to a point | spinning pile → vortex → flare | yes |
| end 26.89–32.94 | the mark built from tiles; the card | arch forms from thumbnails → icon → card; "31.5–32.5 static end card" | yes, but the outro does not sing |

## Scores (B)

| # | criterion | score | why (timestamps) |
|---|---|---|---|
| 1 | Hook | **8** | Frame 0 is v2's passing frame: "ComfyField" whole and readable, the light mid-stroke on the mark, the grid floor. In the first 3 s: strokes 0.16 / 0.67 / 1.19, square slam 1.70, burst and navy→mist flip on the first downbeat 2.20 (pull 02: white disc at 2.23), tile storm 2.3–3.0. Letters glint on the melody notes 0.31 / 0.48 / 0.72 (pull 01; the blind saw "the F has a glint"). Not 9: the logo slate now lasts 2.2 s instead of 1.2 s (the song's pickup bar), and the mark at frame 0 is still a stub. |
| 2 | Clarity | **8** | 8 of 9 scenes read as the story needs (table above), the same as v2's passing round. Still soft: formats (the chip-to-post idea reads better now, with "Big question" landing as a ~28 px tag at 19.45 in pull 11, but the blind saw 19.0–19.5 as a smeared pill glitch). New: 7.0–7.3 the reels emerge as a tiny strip in a pale radial void, which the blind read as "mostly empty… looks unfinished". |
| 3 | Craft (motion design) | **8** | v2's system is intact. The music layer is written in each scene's own vocabulary, not bolted on: ripples on the field, a marquee of bulbs over the reels, sparks out of the portal, struck cells with rings in the montage, beads riding the orbit, a **pen writing the melody on a pencil staff** across the paper's top margin (pull 08, the best new idea), star flares on the spiral, rows lighting in the end mosaic, stroke and pill pings in the outro. The drag is scale. Most of these are 10–30 px marks in a 1920 frame (outro pill dots ~10 px, beads ~12–30 px, bulbs ~15 px, Cinema sparks ~100 px in pull 06), so they are craft nobody sees. |
| 4 | Composition | **8** | Unchanged from v2: one focal point, type on calm ground, the mark mosaic at ~54 % of the height (pull 09). The additions keep off the words: the montage's struck cells run below and above the plates (pull 04), the pen sits in the paper's top margin, beads stay on the outer ring. Minor: at 23.62 the staff's low note heads, the star and the pile's top-left corner crowd into the top 130 px (pull 08). |
| 5 | Motion | **8** | The time map is smooth and monotone. Every v2 handoff holds in the strips (dive, fold, punch, arch mask, blow-past, tear, shatter, star, flip). The springs and overshoot survive the retime. Cost of the retime: the Cinema full frame now holds 12.7–14.3 (~1.6 s, v2 ~0.8 s) with only a slow push (pull 06). The blind called it "almost no motion". |
| 6 | Transitions and variety | **9** | Unchanged: a burst, a dive through a tile, reels folding to a card, a card dealing a fan, a punch to full frame, an arch mask into the wall, a mosaic blow-past, a tear, a page shatter, a star, tiles to the mark, a flip to light. Nine different kinds of picture. |
| 7 | Readability | **8** | Headlines 84–150 px on calm ground. The Cinema credit is now whole for about 1.2 s (13.1–14.3, pulls 05/06), better than v2. Chips at 19.45 are 36–44 px and sharp. "No image or video model." is up 22.4–24.84, the stamps ≥ 1.1 s, end pills ~30 px and held 2.3 s. The snare glint over "Every tool. One field." and the montage glint never wash out a word (pull 04). |
| 8 | Pacing and sync | **8** | The structure is pinned to the song and lands to the frame. The burst is on the first downbeat 2.20 (pull 02). The portal punches on the bass entry: 12.47 still the fan, 12.53 the punch (pull 05). The mosaic blows open on the drop at 16.6, the tear on 20.72, the vortex on 24.84, the star on 26.89. The flip lands as the drums cut: 28.93 mosaic, 29.00 flash (pull 09). v2's hits were snapped to drums (reel stop 8.11 on a kick, "at your hand." 9.14 on a kick, prints on kicks). Soft: the Cinema hold 12.7–14.3, and the card holds still from 30.6 to 32.94. |
| 9 | Truth | **9** | Every on-screen line is the v2 wording that passed. HunyuanVideo-Foley stays off the "video models" reels (the v2 r2 fix holds; it appears only among the vortex chips, under no headline). Nothing new is claimed. |
| 10 | Wow | **8** | v2's screenshot moments survive (tile storm, portal, page shatter, tile-grid icon). The new structural sync makes them hit harder with sound, especially the portal punch on the bass entry and the flip on the drum cut. The music layer adds two moments a motion designer would notice: the wall playing the rising run (15.14–15.92, pull 04) and the pen inking the melody on the paper. It holds below 9 because most of the music layer is too small to see. |
| 11 | **Plays the song** | **6** | **Kicks land:** mostly. Big hits sit on kicks, and the camera, phone and prints answer them (table). Slots (1.4 % scale + 7 px) and the paper zoom (0.7 %) barely register. **Snares snap:** only in field (glint across the words), montage (glint sweep) and the end build. **Nothing visible** at the snares in slots (7.86, 9.39), cinema (10.68, 11.45, 13.51: a 7 px streak), formats (17.62, 18.91, 19.68), paper (21.74, 23.02, 23.80: 34–40 px stars) or converge (25.86). **Melody answered:** visibly in the montage, the paper pen, the spark letters and the end rows. Not at phone size in slots, cinema, converge or formats. **The outro, 28.94–32.94, is the melody alone, and the card does not sing.** 13 notes get ~10 px pill dots and a faint stroke glint (pull 10); the blind wrote "static end card". **Bass:** after the punch at 12.48 its arrival is answered only by a faint purple bloom at 13.8 (pull 06). **Pitch bug (B):** spark, field, end-build and formats map pitch across the whole `other` range, 29–72. That range includes bass notes the melody stem bleeds (MIDI 29–37 at 2.16, 4.44, 6.48, 11.18, 11.49, 12.20, 12.55, 13.81, 14.73, 17.74). So the tune (46–72) uses only the top ~60 %: "C-o-m-f" never light, field ripples always strike far, and bass notes fire as melody (4.44, a near ripple). Builder B's scenes filter these (p ≥ 44); builders A's and C's spark/field/formats do not. **Never off the beat or cluttering:** true, and worth keeping. B's false bass hits at 1.25 / 2.22 / 7.45 are correctly gated out. |

**Verdict: FAIL.** Plays the song is 6. The other ten are ≥ 8 (Transitions and Truth 9, the rest 8). Nothing v2's
KEEP lists protect was broken.

## KEEP (must survive the fixes)

1. Everything on v2 r2's KEEP list (1–15). All of it is intact in v3: frame 0, strokes, the slam, the burst and tile
   storm, the flight and the pills, the bowl dive, the reels as drums, the fold and the fan, the portal punch, the arch
   mask, the morph with plates, the blow-past, the orbit and left block, the tear, the paper page, the shatter → vortex
   → star, the tiles → mark → grid icon, the end card, and every line's wording.
2. The time map's structure, landing to the frame: burst 2.20, field 3.23, portal 12.48 on the bass, formats 16.60 on
   the drop, tear 20.72, vortex 24.84, star 26.89, and the flip 28.94 as the drums cut out (pulls 02, 05, 09).
3. v2's strong hits snapped onto kicks and snares (reel stop 8.11, "at your hand." 9.14, prints on the kicks).
4. 15.14–15.92 the montage as a keyboard. Under B the struck cell follows pitch, low-left to high-right, and runs below
   and above the plates, never over the words. The rising run climbs across the wall (pull 04).
5. 20.72–24.66 the pen writing the melody: a pencil staff ruled as the page arrives, an ink contour, red note heads
   ringing as they're inked, a real pen riding it, and the stroke swelling with the bass (pull 08).
6. The spark's letters glinting per note, and the snare snap on the name (pull 01).
7. Field: the camera dips and banks on the kicks, and a snare glint sweeps the words.
8. The montage's snare glint sweep and its bass throb out from the centre.
9. The end mosaic: rows light per note and the snare snaps the placed tiles white.
10. The restraint. No reaction covers a must-read word, nothing fires off the beat, and every bass reaction is gated
    to 12.48–28.94.
11. The Cinema credit is whole ≥ 1.2 s (13.1–14.3).
12. The A fallbacks look designed: hash placement keeps the struck cells off the plates (pull 12).

## FIX LIST (shared code, so each fixes A and B; check every fix on a motion-blurred strip at the hit times, not the preview)

1. **28.94–32.94 · Outro.** The melody plays alone for 4 s, and the card reads as a still frame (blind: "31.5–32.5 static
   end card"). Its 13 notes (B: 29.01, 29.31, 29.36, 29.53, 29.70, 30.18, 30.46, 31.02, 31.42, 31.53, 31.74, 31.87,
   32.20) are answered by ~10 px dots on the pills and a faint stroke glint (pull 10) · **The viewer must be able to
   count the notes at phone size with the sound off.** On each note the struck stroke of the mark flashes white with a
   glow you can see on a phone, and the struck pill visibly lights as a whole (not only its dot). The mark's ripple
   must read as a ring leaving the icon. The words must not move enough to blur, and the 30.6–32.94 hold stays a hold
   in layout · lifts Plays the song.
2. **12.6–14.3 · Cinema after the bass enters.** About 1.6 s of a near-still frame (blind: "holds a long time with almost
   no motion"). The bass notes 12.58, 13.39 and 13.81 get one faint bloom (13.8). The kick at 13.25 gets a 2 % zoom.
   The snare at 13.51 gets a 7 px streak. The melody notes 12.59, 12.87, 13.37 and 13.92 get ~100 px sparks (pull 06) ·
   **The viewer must feel that the bass has just arrived and that the shot is moving to it.** On every bass note the
   portal's light visibly surges and the frame throbs. On each kick the camera pushes in a visible notch. The snare at
   13.51 throws a flare clearly across the frame. Each note's sparks are big enough to see at phone size. The caption
   stays untouched and readable · lifts Plays the song (and the blind's dead hold).
3. **Snares, and the weak kicks, in slots, cinema, formats, paper and converge.** At the snares 7.86, 9.39, 10.68,
   11.45, 17.62, 18.91, 19.68, 21.74, 23.02, 23.80 and 25.86 the picture shows no change you can measure or see. The
   payline flash, the card glint, the glass glint, the 34–40 px stars and the shockwave ring are all too faint. The
   kick in slots (1.4 % + 7 px) and on the paper (0.7 % zoom) is felt by no one · **On every snare, something in that
   scene snaps visibly within 1–2 frames at phone size**, in the scene's own vocabulary and on the beat. The same goes
   for every kick in slots and on the paper. Field and montage already do this and are the bar · lifts Plays the
   song.
4. **0–2.2, 3.23–7.35, 16.6–20.72, 26.89–28.94 · Pitch range (B).** Spark, field, formats and the end-build rows map
   `SONG.pitch01('other')` over 29–72, a range that includes the bass notes the melody stem bleeds. So the tune fills
   only the top ~60 %: "C-o-m-f" never light, the field ripples always land far, the beads ride high. The bass notes
   2.16, 4.44, 6.48, 17.74 are answered as melody · **Under B, each instrument must use its whole span for the tune:**
   all ten letters, ripples from near to far, the full height of the ring, every row of the mosaic. Bass-register
   notes are never answered as melody. Use the same melody range (p ≥ 44) and low-note filter that slots, cinema and
   montage already use · lifts Plays the song (B).
5. **7.35–10.43 slots and 16.6–20.72 formats · Melody answers below phone scale.** The bulbs are ~15 px. The beads are
   12–30 px. The chip glint is a 7 % scale change. No change was measured at slots' notes (7.71, 8.54, 8.72, 9.25,
   9.47, 10.03) · **Each note must make a change the eye catches at phone size:** the lit bulb and its light on the
   reel, and the bead and the chip it passes, clearly brighter and bigger. The names on the reels and the chips must
   stay readable · lifts Plays the song.

## Nice to have (not for the fixer)

- 27.6–28.94 (B): there are no melody notes between 27.57 and 29.01, and the kick at 28.69 is weak. The built mosaic sits
  about 1 s nearly still before the flip (sheet 28.0 / 28.5; pull 09, 28.80–28.93 are near-identical). A build on the
  beats and hats into 28.94 would make the drum cut land harder. A has five notes here and is livelier.
- 19.0–19.5: a format chip flying into the phone is a smeared pill. The blind read it as a glitch (a v2 leftover).
- 7.0–7.3: the reels are a tiny strip in a pale radial void as the dive lands (blind: "looks unfinished").
- 29.33–29.53: the icon travels to the wordmark under heavy blur (v2 leftover).
- 23.62: the top-left of the paper crowds together: the staff's low note heads, the star and the pile's corner. Keep the
  staff's lowest line ~20 px above the pile.
- 4.5 / 6.0: "One field." doubles over "Every tool." as it slams, and is clipped at the top as it whips out. This is
  v2's motion, flagged again by this blind.
- 0–2.2: the opener is now a 2.2 s logo slate. A bigger per-note lift on the letters would sell "this is playing the
  song" from the first note.

## A vs B

Same picture, same code. At sheet scale (0.5 s) A and B are near-identical, and every difference is in the per-note
layer. The song files explain the difference. **42 % of A's "melody" hits (35 of 83) fall within 60 ms of a kick or
snare. For B it is 1 %** (1 of 92, with the bass bleed filtered). A's volume method mostly hears the arrangement's
loud moments. So under A the melody answers double the drums, and the picture hits the same beat twice with nothing
between. Under B the answers fall *between* the drums, where the tune is, which gives the picture a second rhythm that
is the melody. Pitch also makes B draw the tune's shape. In the montage's rising run, 15.14–15.92, B strikes six cells
climbing left to right and low to high (pull 04). A strikes two cells at hashed places (pull 12, 15.17 upper right).
The paper pen draws B's contour and a random zigzag under A. The outro gets 13 notes under B and 7 under A. A is
livelier in only one place: 27.6–28.94 (5 notes, B has none). **B reads better**, and it is the only one of the two
that visibly plays the tune. Both need fixes 1–3 and 5. Fix 4 is B's.
