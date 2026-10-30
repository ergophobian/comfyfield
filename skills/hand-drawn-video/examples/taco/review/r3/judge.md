# Judge — round 3 (last review)

Film graded: `out/draft-r3.mp4` (37.50 s, 1080x1080, 30 fps). Read: story.md, research/facts.md, the visual-loop.md
criteria, r2/judge.md, r2/fixed.md, r3/evidence.md and every picture it lists, and r3/blind.md. I pulled 8 extra
frames at full size, exact output seek, into `judge-extra/`: f_0.25s, f_2.70s, f_3.47s (lands on 3.50), f_4.50s,
f_9.20s, f_16.80s, f_29.00s, f_32.60s.

Note on timing: sheet-a/b tiles run up to ~0.2 s late against the strips and exact frames. For example, sheet "3.0"
already shows "Let'", which the strip puts at 3.23. So the timestamps below come from the strips, key-moments and
exact frames, not from the sheet labels. The blind read uses the sheet labels.

## Round-2 fixes

| # | fix | mark | evidence |
|---|---|---|---|
| 1 | hook alive from frame 0 | **Fixed** | Frame 0 shows a whole taco with steam rising, and the title is already typing. By 0.25 it reads "How this taco was ma" (f_0.25s), and it is complete by 0.5. One change lands every half second: onion, cilantro, salsa drizzle, lime (key-moments 0.65 / 1.15 / 1.65 / 2.15). Then the fold opens at 2.7–2.9. The blind viewer no longer calls 0–3 slow: only "2.0 to 2.5 … holds". Left over: nothing is in the air at frame 0 (the pineapple is already seated), and the top ~35% is still bare paper. |
| 2 | fold opens on the same plate, then the layers lift | **Partly fixed** | The taco is still folded at 2.70 (f_2.70s). By 2.90 it lies flat on the same plate, with the lime in place (strip-3.0, tile 1). The plate dissolves away 3.1–3.43 under the opened taco. Then at 3.43→3.50, in about 2 frames, the opened taco is swapped for the thick two-tortilla stack (strip tiles 9→10, f_3.47s): the crease, the spilled pork and the thin salsa drizzle vanish and a big glossy salsa blob appears, on the same spot at the same size. Blind: "the plate vanishes and the tortilla jumps … The jump is abrupt." The story beat lands all the same. The blind viewer's first memory is "the opening taco coming apart into labeled floating ingredients". |
| 3 | apart labels | **Fixed** (one new brief fault) | f_4.50s: every label is dark ink, ~22 px caps, on clear paper. CORN TORTILLAS sits under the stack, and its leader touches no letter. PORK AL PASTOR starts 65 px from the left edge. LIME is on the left with its own leader and is complete from ~4.8, so it is readable for 1.2 s. New fault: 4.5–4.8, the lime flies from the right of the stack to the left and crosses "PINEAPPLE" (blind: "sits on the PINEAPPLE label, which looks garbled"). |
| 4 | still beat on the empty plate | **Fixed** | Bites land at 31.5 / 32.25 / 33.0 (key-moments 31.65, 32.40, 33.15), each taking about a third (f_32.60s: ~27% left). The empty plate, with crumbs and the lime, rests under the full caption 33.15–34.2, ≈1.05 s. It is sliding off at 34.40 and gone at 34.47. Compared with story.md the bites now come 0.75 s earlier. They are still on the 6/8 grid (bar 22 downbeat, its second beat, then bar 23), and score.js takes the bite times from the cues, so the music follows. |
| 5 | trompo pineapple lands on 23.5 | **Fixed** | At 23.0 the pineapple enters at the top edge (sheet-b; blind: "a pineapple dropping in"), and it is seated by 23.5 (key 23.65). |
| 6 | drop overshoot at 6.0 | **Fixed** | strip-6.0: the field comes down 6.03–6.23 and stops dead. Only one header is on screen, and the kicker types from 6.3. |
| 7 | Sinaloa on the mainland | **Fixed** | f_16.80s: the CORN icon and "Sinaloa" sit on the mainland, and a short leader runs to the dot at ~24.8°N 107.5°W (Culiacán). Nothing is printed on Baja or the gulf. |

## Sound-off read vs the story

| scene | must get | blind viewer got | match |
|---|---|---|---|
| hero 0–3 | a folded street taco being dressed | taco, onion, cilantro and a green stripe, lime; "How this taco was made." | yes |
| apart 3–6 | 7 labelled layers + lime | "Complete exploded diagram … reads clearly as 'what a taco is made of'"; all 7 labels plus LIME; "3.0 to 3.5 … abrupt"; lime over PINEAPPLE at 4.5 | yes, with a snap |
| pineapple 6–9 | the slowest part is the pineapple | plant → green fruit → "now golden. It ripened. Clear."; "2 YEARS TO DINNER" | yes |
| pig 9–12 | the pork, from a farm | piglet grows, snout in the mud, Jalisco | yes |
| corn 12–15 | the tortilla starts as corn | young → tall with tassels → "fully dry, tan corn" | yes |
| map 15–18 | it comes from all over Mexico | CORN Sinaloa, PORK Jalisco, LIMES Michoacán, PINEAPPLE Veracruz, trucks into Mexico City; trucks "covering the city label" | yes |
| nixtamal 18–21 | how corn becomes dough | pot, CAL, night → dawn, stone slab, MASA/METATE, the dough ball grows | yes |
| trompo 21–24 | how al pastor is cooked | stack grows on the spit, "pineapple dropping in", "reads as a taco al pastor spit" | yes |
| comal 24–27 | the tortilla is cooked fresh | press, MASA, comal, "the tortilla is puffing up, steam" | yes |
| shave 27–30 | the taquero's famous move | knife slicing, the tortilla below; "pineapple flies" moment "just a yellow chunk appearing near the tortilla; I cannot see it fly" | **partial** |
| bites 30–34.5 | all that, gone in three bites | one bite, larger bite, last piece, "Empty plate with crumbs and the lime wedge" | yes |
| end 34.5–37.5 | made with ComfyField | logo, "Drawn in code. Scored in code."; the dot at 34.73 "reads like an artifact" for a moment | yes |

The blind viewer's summary is the story: a countdown from 2 YEARS to 8:02 PM, ending on "Two years to grow. Three
bites to eat." They saw no wrong object. There is one partial: the pineapple flick, which is the only beat the
caption names and the picture barely shows.

## Scores

| # | criterion | score | reason (timestamps) |
|---|---|---|---|
| 1 | Hook | **8** | Frame 0 is a whole taco framed on purpose, with steam and the title typing; the title reads by 0.5. Five visible changes come before 3.0: four toppings at 0.5/1.0/1.5/2.0 and the fold at 2.7. Held under 9: nothing is mid-air at frame 0, the toppings are small flecks that drop in ~0.2 s, and the top third of frame 0 is bare paper. |
| 2 | Clarity | **8** | Every beat matches the blind read. One miss: "Pineapple flies." (29.0–29.25) is a ~50 px cube crossing in ~7 frames (f_29.00s), and the blind viewer could not see a flight. 3.43–3.50 reads as "abrupt", though the idea still lands. |
| 3 | Drawing craft | **8** | One confident hand throughout: wobbling ink, grain, soft shade, and specific details (CAL sack, tile band, chile ristra, papel picado, a graticuled map). Still weak: the arms are flat tubes with mitten hands, coming in from the frame edge (19.5–21, 27–30; blind: "floating limbs"); the knife is sword-long (28.5–30); the comal is a deep black pan with handles (24.5–27); the bite edge is a straight vertical row of scallops (31.5–33). |
| 4 | Composition | **8** | One big focal point per frame. The plate fills the width (0–3, 30–34.2), the landscapes, map, trompo and close-up fill the square, and the caption band stays clear. Faults: LIME sits ~50 px above PINEAPPLE, the wedge almost at the pineapple leader (4.8–6.0); the trucks park on the "M" of MEXICO CITY (16.3–18.0); frame 0's top third is empty. |
| 5 | Motion | **8** | The r2 faults are fixed: the pineapple descends and settles at 23.5, and the 6.0 drop no longer bounces. Good weight on the press slam (24.5), the puff (25.75), the slab slaps (21.5–23), the bite crumbs and the logo spring (34.73–35.0). Faults left: the 2-frame object swap at 3.43–3.50; the lime crossing a label (4.5–4.8); the pig grows by uniform scaling (9.5–11.5); the flick is too small to follow (29.0–29.25). |
| 6 | Transitions & variety | **8** | Open-in-place 3.0, drop 6.0, push 9.0, turn 12.0, blind 15.0, push-up 18.0, in-scene slide 19.5, cut 21.0, push 24.0, cut 27.0, push-up 30.0, clear-and-spring 34.5. The pictures vary across the sheet too: objects on paper, landscapes, night map, interiors, night street, close-up. Blemishes: in the pushes at 9.1–9.3 and 24.1–24.3 the incoming kicker is already typing and slides under the ComfyField bug (f_9.20s: "6 MON" crossed by the logo). |
| 7 | Readability | **8** | Captions are ~4% of the height, and every line is fully on screen ≥1 s. The tightest are "Four states. One street corner." (~17.1–18.0), "Then it's ground into masa." (~19.9–21.0) and the trompo line (~22.9–24.0). Apart labels are dark, clear of the edges, and full within ~0.35 s. Faults: "PINEAPPLE" garbled by the passing lime (4.5–4.8); "MEXICO CITY" partly under the trucks (16.3–17.0). The kicker is the smallest type (~2% caps, thin red), which the blind viewer "read mostly from enlarged cells". |
| 8 | Pacing & sync | **8** | Every key moment on the key-moments sheet lands just after its cue, from the 0.65 onion to the 33.15 empty plate. Something new arrives every ≤2 s, and the empty plate now holds ~1.05 s under the caption. Held under 9: after the bites, 33.15–37.5 is a 4.3 s tail with one motion (the logo spring), which the blind viewer called "a long quiet tail". Three caption lines only just clear 1 s. |
| 9 | Truth | **9** | Checked against the graticule on f_16.80s: Culiacán ~24.8°N 107.5°W, Guadalajara ~20.7°N 103.3°W, Michoacán ~19.1°N 102.4°W, southern Veracruz ~18.1°N 96°W, Mexico City ~19.4°N 99.1°W, all at true positions, and "Sinaloa" is now on the mainland. The pineapple ~2 yr, pig 6 mo, corn 4 mo, overnight nixtamal with cal, chiles + achiote, the trompo crowned with pineapple, and two corn tortillas all match facts.md. One small drawing inaccuracy: the comal has the depth and handles of a pan rather than a flat griddle. |
| 10 | Wow | **8** | The night map and the fire-lit trompo are screenshot-worthy, and the three bites down to an intact empty plate under "Two years to grow. Three bites to eat." now land as the payoff. The blind viewer remembered both. Kept from 9: the one joke beat (the pineapple flick) is invisible, the limbs are flat, and the hook's toppings are flecks. |

**Verdict: PASS.** Every score is ≥ 8 (Truth 9, the rest 8). The round-1 fixes are all in, and of the seven
round-2 fixes, six are fixed and one is partly fixed.

## KEEP (must survive the last fix round)

- The countdown system: a red kicker and a typed caption per scene, slowest first, read in order by the blind viewer.
- Hero 0–3: the whole folded taco on the big plate, steam from frame 0, and the title typing from frame 0, readable by 0.5. Toppings land on 0.5/1.0/1.5/2.0, and the fold opens flat on the same plate at 2.7–2.9.
- Apart: the layers lifting in pairs on the eighths; every label dark, clear of the edges, on clear paper with clean leaders; CORN TORTILLAS under the stack; the lime moving to the left of the stack with its own LIME leader; the glossy salsa blob.
- The 6.0 drop with no overshoot. The 9.0 push, the 12.0 page turn with its soft shadow, the 15.0 blind, the 18.0 push-up, the 21.0 and 27.0 hard cuts, the 24.0 push, the 30.0 push-up.
- Pineapple 6–9: the crown in the soil, the field filling in, ripening to gold, the moving sun. Pig 9–12: the adobe yard, nopal, chicken, rooting at 10.5. Corn 12–15: surge, tassels, dry gold, birds, the farmer.
- Map 15–18: the true outline and origin points, "Sinaloa" on the mainland, the haloed state names, the icons, the trucks parking round the glowing star, the graticule, compass and scale, and the bug turning white on dark.
- Nixtamal 18–21: night kitchen, CAL sack, night → dawn on screen, the metate with kernels → dough trail → growing ball, MASA/METATE tags.
- Trompo 21–24: the slabs slapping on, the pineapple descending and settling on 23.5, the papel picado night street and the fire wall.
- Comal 24–27: the press slam on 24.5, the puff on 25.75 with steam, the COMAL label, the cloth basket.
- Shave 27–30: the knife strokes, the slices falling into the tortilla, the cut face left on the pineapple.
- Bites: the re-dressing 30.25–31.0. The bites on 31.5 / 32.25 / 33.0, a third each, with crumbs. The intact empty plate with crumbs and lime held 33.15–34.2 under "Three bites to eat.", then cleared.
- End: the clean page, the logo springing from a dot at 34.73, "Drawn in code. Scored in code.", held to 37.5.
- The ComfyField bug top-right in every scene, readable on paper and on night.

## FIX LIST (last fixer; ships unjudged; most important first)

Each fix changes only what it names. Check each one on stills at the listed times before the single render. If a
fix makes any of those stills worse than today's frame, revert that fix and leave it as it is.

1. **29.0–29.25** · "Pineapple flies." is the only beat the caption names, but the flying piece is a ~50 px cube.
   It leaves the knife tip at 29.0 (f_29.00s) and is on the taco by 29.25, about 7 frames as the smallest moving
   thing in the frame. The blind viewer saw "just a yellow chunk appearing near the tortilla" · The viewer must see
   a piece of pineapple fly off the knife onto the taco. Make it about twice today's size (~100 px across), turning
   as it travels, on a visible arc that stays below the caption band, and land it on the taco at 29.25 as now.
   Knife, stack and timing stay the same. Check stills at 29.05 / 29.12 / 29.20 / 29.30 · lifts **Clarity**
   (and Wow).
2. **16.3–18.0** · The trucks parked round the star sit on, or touch, the "M" of MEXICO CITY. The blind viewer, at
   16.5: "covering the city label"; at 17.5 the trucks still touch it · "MEXICO CITY" must be readable whole in
   every frame from its appearance to 18.0. Draw it above the trucks with its halo, or nudge the label clear of the
   cluster. The trucks still finish round the star. Check stills at 16.5 / 17.0 / 17.8 · lifts **Readability**
   (and Composition).
3. **9.1–9.3 and 24.1–24.3** · In the two side pushes, the incoming page's red kicker is already typing while its
   page slides in, so "6 MON" / "1 MINU" and its red rule pass under the ComfyField bug (f_9.20s). The blind
   viewer noted "6 MONT jammed against the logo" and "1 MINU" · No kicker letter or rule may touch the bug in any
   frame. The incoming kicker shows only once its page has landed, or is at least clear of the bug. The caption's
   start time does not change. Check stills at 9.15 / 9.25 / 24.15 / 24.25 · lifts **Transitions**
   (and Readability).
4. **3.43–3.50** · The opened taco turns into the two-tortilla stack in about two frames, right as the lift
   starts. The crease, the spilled pork and the thin salsa drizzle vanish, and a large glossy salsa blob appears
   (strip-3.0 tiles 9→10, f_3.47s). Blind: "The jump is abrupt." · The viewer must see the opened taco become the
   stack without a snap. Spread the change over ≥0.25 s (about 3.3–3.55), on the same spot at the same size, and
   have the salsa begin to lift as it completes. Check stills at 3.35 / 3.45 / 3.55. If the longer change shows a
   double outline that reads worse than today's snap, leave it as it is · lifts **Motion**.
5. **4.5–4.8** · The lime flies from the right of the stack to its place on the left and crosses "PINEAPPLE"
   (blind: "garbled") · "PINEAPPLE" must stay whole in every frame. Route the lime above the label row, or draw the
   labels over the flying lime. It ends exactly where it ends now, and LIME's label timing is unchanged. Check
   stills at 4.55 / 4.65 / 4.75 · lifts **Readability**.

## Nice to have (not for the fixer)

- Arms and hands are flat tubes with mitten hands that enter from the frame edge (19.5–21, 27–30), and the knife
  is sword-long. A wrist, fingers and a shoulder or body edge would stop the "floating limbs" read.
- The comal is a deep black pan with handles (24.5–27). A flat, thin griddle would read at once and be more
  accurate.
- The bite edge is a straight vertical row of scallops (31.5–33). An arc of tooth marks would read as a bite.
- The kicker is the film's clock but the smallest type on screen (~2% caps, thin red). A bolder or slightly larger
  kicker would read better on a phone. It needs a layout check across all 11 headers, so it isn't safe unjudged.
- The pig grows by uniform scaling and ends near door height (11.5). The farmer mostly holds one pose.
- The tail, 33.15–37.5, has one motion: the logo spring. A slow breath on the end card would keep it alive.
- Headers sit kicker-only for ~0.4 s at 21.0, 27.0 and 30.0. The tagline and the map's ocean and product tags are
  small and faint.
- Frame 0 shows "How this t" on purpose. When uploading, pick a cover frame from ≥0.6 s so the thumbnail shows the
  whole title.
- The plate dissolves away under the opened taco (3.1–3.43) rather than being lifted off. That's fine, but a lift
  would read as more physical.
- Story choices, not faults: the "street corner" isn't shown until 21.0, and CAL isn't explained.
- Sound was not judged (frames only).

Record for review/LOG.md (the lead appends it; this judge edits only this file):
`| visual | 3 | 2026-10-29 | Hook 8 · Clarity 8 · Craft 8 · Composition 8 · Motion 8 · Transitions 8 · Readability 8 · Pacing 8 · Truth 9 · Wow 8 (round-2 fixes: 6 fixed, 1 partly) | PASS → 5 last fixes (unjudged) |`
