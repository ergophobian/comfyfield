# taco music r2: what was fixed

Backup of r1: `out/music-r1/score-r1.js`. The only file edited is `score.js`. This was rendered against the film as it now
stands: 37.5 s, the bites at 31.5 / 32.25 / 33.0, the toppings at 0 / 0.5 / 1 / 1.5 / 2, "the fold opens" at 2.55, and the
apart lifts two per eighth (3.5 / 3.75 / 4.0 / 4.25, lime 4.5). Everything that answers a cue reads `K.film.cues`.

## Numbers (out/music-r2, measured on music.wav)

| | r1 | r2 | target |
|---|---|---|---|
| integrated | −15.6 LUFS | **−15.8 LUFS**, true peak −1.5 dBFS | −16..−14, ≤ −1 dBTP |
| intro 0–6 | −20/−22 | −22.4 dBFS RMS | quiet open |
| countdown 6–15 | −17.5 | **−20.6** | |
| night 15–21 | −17.2 | **−24.4** (6.7 under fire) | ≥ 6 under fire (aim 8) |
| fire 21–30 | −16.7 | **−17.7** (+3.1 over countdown) | ≥ 2.5 over countdown |
| dinner 30–34.5 / end 34.5–37.5 | | −21.7 / −23.0 | |
| <70 Hz vs 70–160 | bites −22.1 vs −20.6 | ≥ 14 dB under in every section (fire −42.6 vs −27.8) | ≥ 6 dB under |
| bite gaps (60 ms at 31.85 / 32.6) | −39 | −65 / −64 (silence −80 between) | < −35 |
| cue table | | 62/62 cues answered, 0 × "nothing within 250 ms" | |
| real-sound sync | 63/64 | 60/62 within 50 ms. The two misses are both at 0.00 s (+70 ms): the detector can't see an onset at frame 0, and r1 showed the same. The stroke is at exactly 0.000 | |
| key fit | D minor 0.75, next **G major** | D minor 0.73, next A minor | |
| Beat This | | beat every 0.26 s, bars of 1 or 3, never 4 | not 4/4 |

The judge's absolute section targets (countdown −19..−18, fire −16..−15) came out ~2 dB lower, but the ratios and LUFS are
met. A plucked band with dancers has a higher crest than r1's pad and sine-bass mix.

## The fixes

1. **Claps gone.** Deleted every `chuck` and `pats()`. The mute is now the jarana apagón: a palm-muted pitched stroke with
   the judge's exact options, plus `gain 0.7` because it is all attack. `palmeo` plays continuous alternating eighths
   (0.22 / 0.15, pan ±0.3) only in 3–6 s, and softly (0.15) in 24–27 s, skipping the puff's breath at 25.5.
2. **Rasgueo on the new `jarana`.** The judge's re-entrant voicings (triads plus the dominant 7th only, no +12) and leona
   roots, the 6/8 and 3/4 patterns, up-strokes on the top 3 courses reversed, and the +10 ms lilt on 6/8 eighths 1 and 4.
   Changed: `strum 0.005` (the full stroke is 20 ms, the judge's upper limit) to keep five attacks from stacking. A
   stroke's courses share one humanize draw, so their order is kept. A stroke on an eighth that carries a cue is played
   on the grid without the lilt. Levels are intro 0.32→0.40 and countdown 0.42 + 0.015 a bar. The fire is 0.70, not 0.58,
   because that was needed to reach +3 dB once the tarima came down. The cue code's `ch.v[...]` index is gone along with
   the generic pings.
3. **Harmony.** Your PROG and `chordAt`, extended with a 25th bar ('D'), so chords change inside the bar. The leona plays
   the root on every change, the next bar's root on k5 of 6/8 bars, and the 3rd on k2 of 3/4 bars (A7 → C#3). Each note
   goes in the octave nearest the last, within C2–D3. `r + 10` (the Eb) is deleted. Not used: the Andalusian descent, a
   Bb→C# step, and parallel thirds.
4. **Night.** Deleted the glass, the string chord, the 24 ticks, the pats and the tine tune. Added the jarana trémolo
   (16ths, down/up, top 3 courses, swell, bright 0.3 / damp 0.03 / send 0.6; the dawn bar at bright 0.55 ×1.3). Its
   velocity is 0.075 instead of 0.12, to hit the level target. The night tune is on the `tecomate` an octave down, with
   the notes kept: long notes rolled (0.0625 s, 0.22 / 0.18, ring 0.6), single eighths struck at 0.3. The leona is the
   truck (Bb2 / A2 / G2 / A2 on k0 / k3, the 5th on k5), and `scrape` plays only on k0 and k3. Bar 9 k5 is empty.
   No tarima.
5. **No glock family.** Deleted bell, tine and pop. Cues are remapped by meaning: toppings → requinto D4 E4 F4 A4 D5, and
   the salsa, which now drizzles over 0.5 s, gets a repique. Dinner rhymes it by ingredient. Apart lifts → tecomate. Heavy
   lands → `palmeo {body 110}` plus a tecomate chord tone (the slabs climb D3 F3 A3; crown A3; slices F3). Grow cues → a
   ×1.6 strike inside the roll. Trucks → tecomate A2 E3 A3 C4 (short ring), then a jarana Am stroke at 17.0, with the
   trémolo leaning into each arrival. Splash → plunk. Dawn → quijada 0.3. Mano → stone scrape. Masa → palmeo pair. Crown →
   the hook's own D5 plus quijada, with the strum stepping back on that eighth. Press → tarima {heel 0.3, box 1.9} plus
   palmeo. Comal landing → a palmeo flop plus comal crackle. In the grooves, cues are answered by the band itself: a full
   stroke in place of the apagón, a second dancer's heel. New cue "the fold opens" (2.55) → a soft palmeo.
   **Changed: the apart lifts.** The film now lifts two layers per eighth, with one cue per pair. Each lift is a rung up
   the current chord's tones from D3, and a pair strikes the rung plus the chord tone two above it. That gives D3 · G3 ·
   Bb3 · D4 · E4 (lime). The judge's D3…Bb3 C#4 E4 line would have had the Bb→C# step and a B against Gm.
6. **Lead on the new `requinto`.** HOOK_A, HOOK_A2 and HOOK_B as written, with the ligado grace. Placement as specified,
   except **bars 6–7 use HOOK_A2's shape with k6 filled (`HOOK_A2F`)**: HOOK_A's C#5 would land on bar 7's C7. Bars
   14–15 HOOK_A with repique, 16–17 HOOK_A2, bar 18 HOOK_B k0–5 with repique, bar 19 G4 then the flick run. The note
   after the grace is slurred, at ×0.8. Deleted `hook(16,…,2)`, `hook(20)`, the breath tune and the dead lines. The woodbar
   line is now a tecomate climb rolled one note a bar: D3 E3 F3 G3 A3, then C#4 / E4 on k3, at 0.15 → 0.21 and roll
   gain 0.33.
7. **Kick, 808 and shaker gone.** Deleted `zap`, `thump`, `shaker` and the fire's k4.5 scrape. Added `tarima()` as
   specified: heels 4 ms early, toes as pickups, redobles, and the second dancer at +12 ms. Countdown bars 4–5 are heels
   only (0.45); bars 6–9 add toes (0.46), with redobles into bars 6 and 8 and nothing on bar 9 k5. The night has none. The
   fire has toes, a redoble into every bar, both dancers and a quijada on k5 of the 3/4 bars, at 0.68 / 0.38 (not
   0.75 / 0.45). The leona stays within C2–D3 and no note is longer than 0.6 s, except the 0.9 s final D2.
8. **Key moments.** The puff: the band holds its breath on 25.5. `puff` fires at cue − 0.26, and the C7 stroke, both
   heels and leona C2 come back together on 25.75. The flick: the requinto runs A4 C#5 E5 G5 **A5** G5 E5 C#5 in 16ths,
   vel 0.5 → 0.8, and lands on A4 with a full A7 stroke, both dancers and a quijada. Then k4 is the leona's A2 alone and
   k5 is a C#5 pickup. The 9-s sizzle is gone; comal crackles at 21.5 (2.5 s, 0.2) and 25.0 (2.2 s, 0.35).
9. **Bites** (they moved to 31.5 / 32.25 / 33.0, read from the cues). The groove thins to one ↓ and its apagón 0.75 / 0.5 s
   before bite 1, then silence. Each bite is a crunch plus a tutti stab (jarana dur 0.1 damp 0.04, leona root 0.25 s, both
   heels), climbing **Gm – Bb – A7**. One requinto **C#5 alone** plays at end − 0.25 (34.25) as the plate is cleared.
   The stab levels are trimmed (0.62 / 0.7 / 0.6) because they set the peak normalisation.
10. **End.** Deleted the glass, the DL chord, the tine arpeggio and the bell. The remate: both dancers' stamp, quijada
    (len 0.8), leona D2 0.9 s, a 6-stroke D-major trémolo (0.6 → 0.24), requinto D5 then F#5 with repique, and the last
    full stroke at 35.25. **Changed for the new 3-s card:** that stroke rings 2.4 s, not 0.8, so it carries the logo and
    is −55 dB by 37.5 (per-second −45 at 36, −70 at 37). Levels are trimmed for peaks.
11. **Setup.** `reverb { 1.0 s, wet 0.12, predelay 0.006, dark 0.55 }`, sends 0.4 on the tarima and leona and 0.6 on the
    requinto, `human { time 0.008, vel 0.12 }`.

## Things the numbers forced (not on the fix list)

- **The tecomate as written was 6× too loud.** The SVF band-pass peaks at Q, so the gourd (Q 6) multiplied the bar about
  6×, and the rolls set the film's peak. The gourd is now divided by 6, and rolls carry their own `gain`, because
  overlapping strikes add up.
- **Peak control** (the judge allowed lowering transient peaks), done inside the instruments:
  - `soft()`, a peak-relative tanh that is unity at low level, rounds each note's own attack on the jarana, requinto,
    leona, tarima, quijada and crunch.
  - Each jarana course eases in over its first 10 ms (from 0.55), so five courses read as one stroke.
  - Stroke humanize is capped at +4%, and secondary hits at an accent are humanized, not `exact`.
  - The instrument gains sit in one table × `BUS 1.8`, the scene sounds included, so the band drives the render's bus
    compressor a little.
  - The humanize seed is `r2-hands-b`. Seeds swing integrated by ±0.5 dB (random unison phase-locking of the doubled
    courses), and this take spreads its peaks evenly.
- `M.meta.signature` now describes the new instruments. `music.md` is not updated (it was out of scope), so it still
  lists the r1 instruments.

## Not done / open

- The 0.00 s real-sound miss is the detector's frame-0 limit and can't be fixed from the score.
- The night is 6.7 dB under the fire, not 8. Going lower cost integrated loudness below −16.
- Nice-to-haves skipped: the jarana segunda, the k5 leona slap, the snout's palmeo and scrape (that cue gets a groove
  accent and no whoosh), and the music.md update.
