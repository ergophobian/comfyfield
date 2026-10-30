# The soundtrack: composing it, and the BGM loop

The music is written in code with `engine/kit/music.js`: instruments synthesised from scratch (no samples, no
loops, no library cues), a score of events on the film's clock, an offline mix rendered in the page. Because
the score is data, it can be read back — and because it reads the film's cue list, sync is built in, not
nudged afterwards.

## Why stock-sounding music happens, and the rules against it

Stock music is the average of many choices: the same four chords, the same tempo band, the same instrument
kit, the same build. Each rule below moves one choice off the average. A score should break at least four.

1. **A signature you can say in one line**, written in `music.md` before any note: e.g. "son jarocho hemiola in
   D Dorian played by kitchen percussion". If you can't say what makes it this film's, it is stock.
2. **Instruments from the subject's own world.** What does the subject sound like? Hands on dough, a knife on a
   board, rain on a roof, a typewriter, a train's wheels, glass, wood, paper, metal. Build percussion and
   colour from those (`M.instrument(...)` adds your own synth voice in ~10 lines). Make the pitched instruments
   fit the place without being the cliché of the place.
3. **Metre and rhythm with a reason**: 6/8, 3/4, 5/4, 7/8, a hemiola, a rhythm from the subject (a machine's
   cycle, a heartbeat, a dance of that region). Not four-on-the-floor unless the film is about a dance floor.
4. **Harmony off the common path**: a mode (Dorian, Lydian, Mixolydian, Phrygian dominant, a pentatonic of the
   region), a borrowed chord, a pedal under moving chords, a modulation at the story's turn. Not I–V–vi–IV,
   not the four-chord loop.
5. **Form that follows the story**, through-composed — every section is the story's section: thin where the
   picture is quiet, full where it peaks, a real drop, a real ending (a resolving chord on the last image, not a
   fade). Bar-to-bar repetition high enough to sound like a loop is a fail.
6. **Answer the picture**: every cue gets a sound that means it (a pop when a thing lands, rising pitch as
   something rises, a chop on a cut, a ring when routes arrive, stop-time on a punchline).
7. **The avoid list** — write the clichés for this kind of film in `music.md` and don't use them. For explainers:
   ukulele + glockenspiel + whistling + claps; "corporate uplifting" piano; lo-fi with vinyl crackle; trailer
   braams; the region's tourist cliché (mariachi brass for Mexico, bagpipes for Scotland…).

### What listeners actually named as stock (learned making the example films)

A blind listener names a sound by its closest library cliché, whatever the score says it is. These came back:

- **Pure additive or FM tones read as keyboards**: sine-partial plucks and FM at ratio ~1.4 were heard as a Rhodes →
  "lo-fi study beats". A real plucked string is a Karplus-Strong `string`, not stacked sines.
- **Equal ± detuned pairs beat**: two voices detuned by the same amount make a full-depth tremolo — heard as a
  "detuned music box", "horror tension". Detune by unequal amounts, or use a slow drift instead.
- **High bright mallets and bells read as glockenspiel**; **a noise slap on the offbeat reads as handclaps**;
  **ticks on every subdivision read as a shaker**; **an acoustic strum with stomps reads as "stomp & clap" indie-folk**
  — together, the Kickstarter-explainer kit. Keep pitched percussion low, accents sparse, and choose one or two.
- **Switching the instrument kit per section** sounds like "stock cues spliced back-to-back". One unusual palette
  kept across the whole piece, changing register and density instead, is what flipped two listeners to "not stock".
- **Listeners are noisy**: the same mix was heard as "not stock" and "stock lounge" a minute apart. Ask two
  listeners (two models, or one model twice) and act on what both name.

## Sync: how the picture and the music meet

- Tempo and metre are chosen first (step 4 of the flow); scenes are whole bars, cuts on bar lines, key moments
  on beats/eighths. The film and the score share `bar()`.
- Scenes register cues (`K.cue(t, 'scene: what', 'hit'|'soft'|'scene')`). The score loops over `K.film.cues`
  and answers each by what it is (words in the label → which sound), so moving a cue in a fix moves its sound.
- Transitions get their own sound (a paper slide, a whoosh, a swell into an ink-wipe) from the scene's `in.type`.
- Big moments get a musical event, not only an effect: a chord change, a stop, the tune's peak.

## Levels

About -14 to -16 LUFS integrated, true peak ≤ -1 dBFS (`music.js` normalises the peak to -1.5); a loudness
range of at least ~3 LU so the arc is heard; effects under the music, never spiking out of it; low end clean
(the master high-passes at 32 Hz; one bass voice at a time).

## The composer's own check (before any judge)

`node engine/render.mjs music <project> --dir out/music-rN` writes `music-report.md` (tempo, key, loudness each
second, every cue and what the music does there, every bar's instruments and pitch classes), `pianoroll.png`
(notes by instrument; red lines = the film's cues), `spectrogram.png`, `waveform.png`, `music.wav`. Then measure
the real sound: `python engine/tools/analyze_audio.py out/music-rN/music.wav --cues out/music-rN/score-summary.json
--out out/music-rN/analysis` (sync on the real onsets, repetition, key fit, brightness). Read both. Fix what the
numbers already show (a flat loudness line, cues with nothing on them, a section that never drops).

## A real listen

The score and the measurements tell a judge what was written; only a listener tells it what it sounds like
(on one demo the score read as original and a listener heard "corporate stock music" — the listen was right).
Any model that hears video sound can listen: wrap the mix as a clip with a black picture and ask it plainly,
before showing it any intent —

```
ffmpeg -f lavfi -i color=c=black:s=320x180:r=10 -i out/music-rN/music.wav -shortest -c:v libx264 -tune stillimage -c:a aac out/music-rN/listen.mp4
```

> "Listen to the soundtrack only (the picture is black). The instruments you hear, the groove and metre, the mood,
> whether it sounds like generic stock music and why, and the three moments a listener would remember."

Give that answer to the judge as `out/music-rN/listen.md`. Ask a second listener (another model) when the first
one's answer decides a fail.

## The BGM loop (2 rounds; pass = every criterion ≥ 8)

Round 1: the composer's report and analysis → a **fresh BGM judge** → `out/music-r1/judge.md` → the composer
applies the fix list → new report → round 2 with a **new** judge, which first marks the round-1 fixes → the
composer applies the round-2 fix list → that version ships.

Judge prompt (fill the paths):

> You are the MUSIC JUDGE for a short film's soundtrack, written in code. You did not write it. Be specific and
> harsh about anything that would make a listener think "stock music".
> Read: `music.md` (the composer's intent and avoid list), `story.md` (the sections and key moments),
> `out/music-rN/music-report.md`, `out/music-rN/analysis/analysis.md`, `score.js` (the score — read the notes,
> rhythms, chords and instruments as a musician reads a score), and look at `pianoroll.png` (red lines are the
> film's cues) and `spectrogram.png`. In round 2 also the previous judge file, and mark each earlier fix fixed /
> partly / not fixed first.
> Read `out/music-rN/listen.md` — a listener's blind description of the real sound — and weigh it heavily: it is
> what the audience hears; where it disagrees with the score, the listen wins. If you can listen yourself, do; if
> there is no listen at all, say so and judge from the score and the measurements.
> Write the stock version of this cue in two lines (what a library track for this film would be) and say how far
> this score is from it. Score each criterion below 1–10 with a reason and timestamps. Verdict (pass = every
> score ≥ 8). A KEEP list. A FIX LIST — only what lifts a sub-8 score to 8, plus real errors (a wrong note
> against the chord, a cue with nothing on it, clipping, mud) — each as `bar or time · what's wrong · what it
> should be, in musical terms (notes, rhythm, instrument, level) · the score it lifts`. Then "Nice to have".
> Write `out/music-rN/judge.md`.

Criteria (what a 10 is):

1. **Originality** — far from the stock version; the signature is audible; no item from the avoid list; a
   listener couldn't name the library it came from.
2. **Identity** — it belongs to this subject (instruments and rhythm from its world) without the tourist cliché.
3. **Sync** — every key cue has a sound that means it, within ~30 ms (the measured sync agrees); every cut has
   its transition sound or a musical change; stop-time and accents land.
4. **Arc** — the loudness and density follow the story: a quiet open, a build, a real drop, a peak where the
   picture peaks, a resolving end on the last image. Flat loudness caps at 6.
5. **Musicality** — the parts fit (no note fighting the chord, voices leading smoothly, a tune with a shape), the
   groove sits, repetition is varied (through-composed or developed, never a loop).
6. **Mix** — clear low end, nothing harsh (spectrogram: no glaring band), effects inside the music, levels in
   range (-14 to -16 LUFS, peak ≤ -1).
7. **Fatigue** — still pleasant on a third play; nothing repeated so often it grates; no shrill sustained tone.
8. **Under the picture** — it supports, never fights: busiest where the picture is calm only if that is the idea;
   it leaves room for the caption's moment to be read.
