# Music judge — taco, r2 (the last review)

**Verdict: FAIL.** Originality 3 · Identity 3 · Sync 8 · Arc 7 · Musicality 7 · Mix 6 · Fatigue 7 · Under the picture 6.

The composer-fixer did what round 1 asked, line by line. The score on paper is now a son band. Both blind
listeners still hear a library track, though, and the reason is in the sound, not the notes. Each new instrument
was voiced in a way that lands on a stock instrument:

- the requinto rings like a struck bar, so it is heard as a steel pan or kalimba;
- the tecomate rolls blur into a pad;
- the tarima's energy is all at 128 Hz, which is a kick drum;
- the apagón on every off-eighth is a clap.

On top of that, every note goes through `soft()`, a per-note tanh limiter that rounds off its attack. The
mix then runs about 10 dB into the render's bus compressor. The listeners call the result "sterile attacks",
"sample-library MIDI" and "heavily compressed".

Every fix below was applied to a scratch copy, rendered and measured (the numbers are at the end). One
exception is noted.

M = `listen-medium.md`, H = `listen-high.md`. Line numbers are the current `score.js`.

---

## Round-1 fixes, marked

| # | round-1 fix | mark | why |
|---|---|---|---|
| 1 | claps out (chuck/pats deleted, apagón, palmeo) | **partly** | Done as written. But the apagón (gain 0.7 × 0.75–0.85 on k2/k5 in 6/8 and k1/k3/k5 in 3/4) is now the "crisp handclaps on 2 and 4" (H) and "snare/rimshot" (M). The palmeo eighths at 3–6 s are a 155 Hz thump, which M hears as "the kick drops in at 0:03". |
| 2 | rasgueo on the jarana | **partly** | Voicings, patterns and lilt are all in, and nobody says "steel-string fingerpicking" any more. But the 10-ms attack ease (l.48–51) plus `soft()` (l.52) turned each stroke into a hammered, saturated chord: M hears "acoustic piano comping" and "brass stabs". |
| 3 | harmony: i–iv–V7, chord changes inside the bar, the Eb gone | **fixed** | The errors are gone, the leading tone is in, and the key fit is D minor, with A minor next (no longer G major). Both listeners still call the harmony "safe diatonic cycles" (Fix 8). |
| 4 | the night | **partly** | Everything listed was deleted and added. The night is 6.7 dB under the fire, against an aim of 8. Its loudest element is now the tecomate rolls (stem −26.8 dB, against −34.8 for the trémolo and −33.0 for the leona), and the A2 truck at 16.25 is the night's loudest low end. H calls it "the full groove & bass drop, 0:14–0:18". |
| 5 | the glock family out, cues mapped by meaning | **partly** | The bells, tines and pops are gone and the cue map is good. The requinto took their place in the ear: H hears "kalimba … bell/glockenspiel accents" and M hears "steelpan". |
| 6 | the lead on the requinto, three hooks | **partly** | The writing is fixed: the hooks are not doubled or wrongly transposed, there is no second lead, and HOOK_A2F was a good catch. The instrument is not fixed. It reads as a steel pan or kalimba and is the loudest stem in the fire (−20.4 dB, against −22.2 for the jarana). |
| 7 | kick, 808 and shaker → tarima | **partly** | Pattern done. The heel is still a kick: its energy is all at 70–160 Hz, the 2–5 kHz crack sits 27–31 dB down (`soft(x,4)` erases the 4-ms crack), and 96 heels come from 14 identical samples. Both listeners name a "kick" or "cajón thump". |
| 8 | the puff, the flick, the comal | **fixed** | The puff's breath measures −29 dB at 25.5 s and −13 at 25.75. The flick's arc and landing work, and the 9-s hiss is gone. |
| 9 | bites | **fixed** | The gaps measure −63/−64/−70 dB. Gm–Bb–A7 climbs, and the C#5 plays alone. Both listeners remember the "breakdown and button" at 0:30–0:35. Small catch: the three crunches are one identical sample. |
| 10 | the end remate | **fixed** | Neither listener names a glock sparkle any more ("a clean punchy button", "a polite tidy button"). |
| 11 | kitchen reverb, humanize | **partly** | Set as asked, but both listeners still say "quantised". Each stroke uses one timing draw for all its courses, the heels are always exactly −4 ms, the cache replays identical samples, and every note is soft-limited. |

None of round 1's "what r2 must show" listen words came back clean: claps (H), glockenspiel (H), kick (M, H),
shaker (M, H), pad/Rhodes (M, H), stock (M, H) and 4/4 (M, H). The numbers all pass: LUFS, peak, night ≥ 6 dB
under the fire, fire ≥ 2.5 dB over the countdown, bite gaps, and the <70 Hz band.

## What the listeners named, traced to the code

| heard | who | caused by | measured |
|---|---|---|---|
| **steel pan** top line and rolls; **kalimba** "naked opening riff 0:00–0:03" | M, H | The requinto (l.56–63). `bright 0.95, pick 0.06`, plus `+0.8 × bp(1450 Hz, Q 1.4)`, puts one fixed resonant peak on every note ("clear metallic-acoustic resonance", H). `soft()` rounds the 2-ms espiga click off, so it starts like a mallet. `ring 0.7` and `send 0.6` let it ring like a bar. The repique (l.295, 442, 466) repeats the same pitch in 16ths at [1, .55, .75, .55]: that is a steel-pan roll. The requinto also plays nearly alone from 0 to 3 s (the toppings, l.464–467). | The loudest stem in the fire. Attack crest 6–7 dB in the first 30 ms; a plucked string is 13 or more. |
| **brass section**, "punchy stabs", "fanfare at 0:14–0:17" | M | `soft()` on each jarana course (l.52) saturates the whole first ~100 ms of a stroke: its peak drops 4.6 dB and the tone thickens, which with the 10-ms ease (l.48–51) gives a blown onset. PAT3 (l.233) cuts every down-stroke after one eighth with an apagón, which makes stabs. At 14.0–14.75 every voice outlines a rising A major: HOOK_B's A4–C#5–E5 (l.289), the tecomate's C#4 then E4 (l.348) and the A7 strokes. The trucks (l.449, l.474) climb A2–E3–A3–C4 while the trémolo jumps ×3 on each arrival (l.358), and an Am stroke lands on 17.0. | |
| **acoustic piano comping** / **acoustic guitar** strums | M / H | The jarana's courses are exactly 5 ms apart, every doubled course is +5 cents (one beat rate, like a piano unison), and the attack is eased like a hammer. | |
| **kick**, "soft rounded acoustic kick / cajón thump", the "beat drop at 0:03–0:05" | M, H | The tarima (l.78–85) has a 128 Hz mode at amplitude 1. The palmeo eighths at l.315 (3–6 s) and l.410 (24–27 s) are low-passed noise plus a 155 Hz sine on every eighth. | Tarima and palmeo energy is almost all at 70–160 Hz. |
| **handclaps on 2 and 4**, **snare/rimshot** | H, M | The apagón (l.225): five muted courses in 12 ms, all attack, on the off-eighths. | Its first 50 ms sits in 0.5–2 kHz, which is a clap's band. |
| **synth pad**, **Rhodes**, **marimba**, a "bass drop at 0:14–0:18" | M, H | The tecomate. `roll()` (l.301–308) strikes 16 times a second on a bar whose time constant is 1.8 s (ring 1.0; the woodbar's T = 1.5·√(220/f)), so it sounds as a sustained tone with a 16-Hz flutter. The charleo (l.111–112) is a symmetric clip of a sine, so it adds almost nothing. At 16.25 the A2 truck comes in with the D3 roll at 16.5. | The buzz sits about 28 dB under the bar. The tecomate owns 160–500 Hz in the intro, countdown and night. The night's 20–160 Hz band jumps to −24/−26 dB at 16.25–16.5, against −30 to −56 for the rest of the night. |
| "electric/synth bass, syncopated, **bouncing**" | M | The leona under `soft(x,4)`, which takes up to 12 dB off its attack. The next bar's root is anticipated on k5 of every 6/8 bar (l.281). | |
| **shakers**, hi-hats | M, H | The night `scrape` on k0 and k3 (l.364): 0.22-s bursts of clicks at 1.8 kHz. The comal's noise floor, 0.04 for 2.2–2.5 s, twice (l.164). | |
| "identical velocity curves… sterile attacks… tightly quantised… **heavily compressed**" | M, H | The kit caches by (inst, pitch, dur, vel/10, opts) (kit l.328). Per-note `soft()`. `BUS 1.8` (l.20–22) drives the raw bus to +3.6 dBFS into the render compressor, whose threshold is −8 dB. | Tarima: 96 hits from 14 samples. Palmeo: 34 from 10. Crunch: 3 bites, 1 sample. Wood: 11 from 1. Tecomate: 238 from 71. |
| "standard **4/4**", 105–120 bpm | M, H | The 3/4 bars' ↓⊗↓⊗↓ is a duple "boom-chk" skank. | Beat This hears an eighth pulse (0.26 s) with bars of 1 or 3. |
| "I–V–vi–IV", "diatonic uplifting cycles, zero dissonance" | M, H | Bars 14–19 replay bars 4–9 chord for chord. Half of that progression sits in F major (C7→F, Bb), with the leona on the root of every change. | |

## The stock version of this cue

> **Library:** "Sunny Latin Acoustic Explainer, 115 bpm": strummed acoustic guitar on diatonic minor/major
> cycles, a marimba, kalimba or steel-pan lead, claps on 2 and 4, a shaker, a cajón kick, warm bass, a soft
> pad, 4-bar blocks and a tidy button ending.
> **The "Mexican" variant:** La Bamba I–IV–V, mariachi trumpet stabs, güiro and a grito.

**How far r2 is from it:** about 2/10 from the first line. Each listener named it piece by piece, M from the
"tropical resort" shelf and H from the "lifestyle explainer" shelf. About 7/10 from the second line: M's
"brass stabs" sit close to it. Round 1 traded the folk-explainer shelf for the tropical one. The writing is
no longer the problem; the voicing of the sounds is.

## Scores

**1 · Originality: 3.** Both listeners say STOCK and list the kit (H: "kalimba/marimba, handclaps, shaker, acoustic
guitar — the Artlist/Epidemic formula"). Six items from the avoid list or round 1's list come back under new
names: claps, glock, kick, shaker, pad and 4/4. The signature, the hemiola, is not heard. It moves up from 2
because the writing itself (the hooks' grouping, the chord rhythm) is no longer generic, and nobody names a
ukulele or a whistle. The memorable moments they name are stock moments: "isolated kalimba hook" at 0:00–0:03,
"beat drop" at 0:03 and "horn fanfare" at 0:14.

**2 · Identity: 3.** Nothing Mexican, son or kitchen reaches either listener. M puts the piece in the Caribbean
("soca/calypso… a cruise commercial"), which is a different tourist cliché, for a Mexico City taquería. Neither
listener notices the kitchen sounds: puff, crunch, comal, plunk, chop, stone scrape. The band is right on
paper, which is the only thing above a 2.

**3 · Sync: 8.** 60 of 62 cues have an onset within 50 ms. The two misses at 0.00 are the detector's first
frame; the stroke is at 0.000. Every cue is answered by meaning, with no generic pings. The puff's breath, the
flick's arc and the landing all land. The bite gaps are −63 to −70 dB, and both listeners remember the
0:30–0:35 stop-time. Deductions: the truck arrivals at 16.25–17.0 are a rising arpeggio plus ×3 stabs, which
reads as a fanfare (M), and the 3–6 s palmeo turns the "apart" scene into a beat drop.

**4 · Arc: 7.** Section levels: intro −22.4, countdown −20.6, night −24.4, fire −17.7, dinner −21.7, end −23.0;
LRA 7.6 LU. The arc is not flat. But the night has a peak in its middle: the A2 truck and D3 roll at
16.25–16.5, which H hears as "the full groove & bass drop". The build is also held down by the bus compressor.
Tested: with the compressor idle, the same score's fire stands 3.2 dB over the countdown and 9.6 over the
night, against 2.1 and 6.3 with it driven.

**5 · Musicality: 7.** The hooks have shape, the chord rhythm follows the hemiola, and the leading tone is in.
Deductions:
- Bar 8 (12.0–13.5): the A3 roll sustains under Bb, a minor 9th against the jarana's Bb4 for 0.75 s (the
  pastel maj7).
- 14.0–14.75: every voice climbs an A major triad, which is a fanfare.
- Bars 14–19 replay bars 4–9's six chords exactly. Both listeners call the form "4- and 8-bar modular blocks".
- The same-pitch 16th repiques (bar 14, bar 18, 34.75) are steel-pan rolls.

**6 · Mix: 6.** The spec is met: −15.8 LUFS, −1.5 dBTP, and <70 Hz is at least 14 dB under 70–160. But every
band note is soft-limited and saturated: the requinto's attack crest is 6 dB, and a jarana stroke loses 4.6 dB
of peak. The bus compressor is engaged for most of the film, and the tecomate rolls clog 160–500 Hz. M: "heavily
compressed, EQ'd bright, pristine… lacking grit".

**7 · Fatigue: 7.** No hiss, the hooks vary, and repetition is 0.081. But 96 heels are 14 identical samples,
the 11 ticks are one sample and so are the 3 bites. The tecomate drones at 16 strikes a second through 0–21 s.
In the 3/4 bars, every off-eighth is a chk.

**8 · Under the picture: 6.** It never fights the picture, it leaves the bites room and it drops for the night.
But it puts the listener in the wrong place. M hears a "tropical vacation, cruise commercial" and H hears "daily
productivity". The film is two years of Mexican farms and one taquero, and its end card says "Scored in code"
over a score that both listeners hear as library MIDI.

---

## KEEP

- The clock, the section map, the cue reader, the transition sounds, and the 1500 Hz wood tick on every new
  step.
- PROG with chord changes inside the bar (i–iv–V7, C# leading tone); the leona within C2–D3, no note longer
  than 0.6 s.
- HOOK_A / HOOK_A2 / HOOK_A2F as written (3+3 then 2+2+2), and HOOK_B except its last three notes (Fix 6).
- The night's design: no tarima, the jarana trémolo, the leona as the truck, the empty k5 of bar 9.
- The puff's breath at 25.5. The flick arc A4–C#5–E5–G5–A5–G5–E5–C#5 landing on A4 with A7 and the quijada.
- The bites exactly as they are: crunch and tutti, Gm–Bb–A7, the C#5 alone, the silences.
- The remate and the Picardy D, with the last stroke ringing under the logo.
- The kitchen sounds: crunch, puff, plunk, comal pops, chop, stone scrape. The leona's buzz. The doubled jarana
  courses.
- The kitchen reverb, and the loudness and peak targets.

---

## FIX LIST (most noticeable first; all ten were tested together, numbers at the end)

The idea behind the list: on the sister film, cutting the acoustic strum and stomp is what flipped the
listeners. Here the jarana *is* the son's pulse, and removing it is a re-composition with no judge after it.
So this list keeps the jarana and the dancers. It removes every other member of the formula the listeners
named: claps, kick, shaker, pad and the mallet lead. What's left becomes **one family, held through every
section**: wooden things that are plucked or struck and rattle. That means the leona's buzz, a fret rattle on
the requinto, the tecomate's charleo, the tarima's loose boards and the quijada. Density and register change
from section to section; the kit does not.

**1 · The whole film, the mix chain (l.20–22, `soft()` l.32–36 and its calls at l.43/52/62/73/84, the ease at
l.48–51, `taco/kit/music.js` render) · "heavily compressed", "sterile attacks", "MIDI", "brass", "piano"**

Three stages squash every note:

- `soft()` takes the top 9.5–12 dB off each note and saturates it with tanh, so plucks lose their pick and
  strokes thicken.
- The ease gives every course a blown onset.
- `BUS 1.8` keeps a 2:1 compressor engaged across the arc.

What it should be: clean plucks, and one look-ahead limiter on the mix that touches only the loudest
transients.

- Delete `soft()` from the jarana (both returns), the requinto, the leona and the tarima. Keep it on crunch
  and quijada if you like.
- Delete l.48–51.
- `const BUS = 0.6`
- `M.limiter = 9.5; M.ceiling = -2.2`
- instGain: `requinto: 2.4, leona: 1.15, tecomate: 0.28`. The other gains stay.

In the project's own kit (`taco/kit/music.js`, `M.render`), insert this right after
`const L = res.getChannelData(0), R = …`. It is opt-in, so nothing else changes:

```js
if (M.limiter) { // look-ahead peak limiter on the mix: holds only the top M.limiter dB of the loudest transients
  let pk0 = 0; for (let i = 0; i < len; i++) pk0 = Math.max(pk0, Math.abs(L[i]), Math.abs(R[i]))
  const thr = pk0 * Math.pow(10, -M.limiter / 20), LA = Math.floor(0.0015 * SR), rel = 1 - Math.exp(-1 / (0.06 * SR))
  const need = new Float32Array(len), r = new Float32Array(len)
  for (let i = 0; i < len; i++) { const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); need[i] = a > thr ? thr / a : 1 }
  let prev = 1
  for (let i = 0; i < len; i++) { let h = 1; for (let j = i; j < i + LA && j < len; j++) if (need[j] < h) h = need[j]; prev = Math.min(h, prev + (1 - prev) * rel); r[i] = prev }
  let acc = LA // box-smooth the gain over the look-ahead so it is already down when the peak arrives
  for (let i = 0; i < len; i++) { acc += r[i] - (i >= LA ? r[i - LA] : 1); const g = acc / LA; L[i] *= g; R[i] *= g }
}
```

Then change the normalisation line to `Math.pow(10, (M.ceiling ?? -1.5) / 20) / peak`.

Tested at −15.7 LUFS, −1.3 dBTP, LRA 7.7:
- Gain reduction is 0 in the intro and the night. In the fire the median is 0.7 dB and the 90th percentile
  4.4 dB.
- Crest is 18–19 dB in the intro and night and 17.8 in the countdown, against 13–16 now. The fire stays at r2's 15 dB, but
  through a clean limiter instead of tanh on every note.
- **Set `M.limiter` last.** A new seed or event count moves the raw peak by ±1.5 dB. Aim for −15.5 to −16
  LUFS, and lower `M.ceiling` if the true peak goes above −1.
- Without the kit change the mix falls to −19.8 LUFS, so don't ship half of this fix.

Lifts Mix, Originality, Fatigue.

**2 · The requinto (l.56–63, repique l.295, salsa l.466, end l.442) · "steel pan", "kalimba"**

What's wrong: one metallic formant on every note, an attack rounded into a mallet's, a ring like a bar, and
same-pitch rolls. What it should be: a short, dry string stopped by the hand, with the espiga scraping and the
fret rattling.

```js
M.instrument('requinto', 'pitched', 0.6, (f, dur, vel, o, r) => {
  // dry and short: a string that is stopped, not a bar that rings. Plucked a sixth of the way in (a hollow comb);
  // no fixed resonant peak (one formant on every note rang like metal)
  const x = S(f, dur, vel, { ring: o.ring ?? 0.45, bright: o.bright ?? 0.8, pick: 0.17, body: 0.6, bodyLo: 230, bodyMid: 950, damp: o.damp ?? 0.025 }, r)
  const nC = Math.floor(0.006 * SR), sc = new Float32Array(nC) // the horn espiga scraping the string: 6 ms of noise near 3 kHz
  for (let i = 0; i < nC; i++) sc[i] = r() * 2 - 1
  const scr = M.svf(sc, 3000, 0.9, 'bp')
  for (let i = 0; i < nC; i++) x[i] += scr[i] * 1.2 * vel * Math.exp(-i / SR / 0.0018)
  let pk = 0; for (let i = 0; i < x.length; i++) pk = Math.max(pk, Math.abs(x[i])) // the string slapping the frets while it swings wide
  const th = 0.4 * pk, bz = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); bz[i] = a > th ? Math.sign(x[i]) * (a - th) * (1 + 0.6 * (r() * 2 - 1)) : 0 }
  const b = M.svf(bz, 2300, 1.0, 'bp')
  for (let i = 0; i < x.length; i++) x[i] += 1.6 * b[i]
  return x
})
```

The repique becomes a mordent: the note, a flick to the step above, then the note again and held.

```js
if (o.repique && d >= 2) {
  const up = [2, 1, 2, 0, 1, 2, 1, 2, 0, 2, 2, 1][m % 12] // the next note up in D minor; A goes to B, never Bb
  M.note('requinto', t, m, 0.06, vel, RQ); M.note('requinto', t + 0.0625, m + up, 0.06, vel * 0.55, RQ); M.note('requinto', t + 0.125, m, d * 0.25 - 0.145, vel * 0.75, RQ)
}
```

- Salsa (l.466): the note, then a step down one eighth later at ×0.6:
  `M.note('requinto', t, p, 0.12, v, {...RQ, exact: true}); M.note('requinto', t + 0.25, M.n(p) - 2, 0.2, v * 0.6, RQ)`
- End (l.442): F#5 once, `M.note('requinto', endT + 0.25, 'F#5', 0.5, 0.62, RQ)`.

Tested: attack crest 13–17 dB (it was 6–7). D5 is 30 dB down 0.16 s after its peak (it was 0.22 s). The
requinto now sits 2 dB under the jarana in the fire instead of 2 dB over it. Lifts Originality, Identity,
Fatigue.

**3 · The tecomate (l.107–116; rolls l.301–308 used at l.347–348 and l.370; the trucks l.449 and l.474) · "pad",
"Rhodes", "marimba", the night's "bass drop"**

What's wrong: a sustained, flutter-rolled pure bar whose buzz can't be heard. What it should be: struck notes
that die, with a charleo you can hear, which is the palette's unusual colour.

```js
M.instrument('tecomate', 'pitched', 0.5, (f, dur, vel, o, r) => {
  const x = M.INST.woodbar.fn(f, dur, vel, { ring: Math.min(0.4, o.ring ?? 0.35) }, r), g = M.svf(x, f, 6, 'bp') // a time constant of 0.6 s at D3, not 1.8 s
  for (let i = 0; i < g.length; i++) g[i] /= 6
  let pk = 0; for (let i = 0; i < g.length; i++) pk = Math.max(pk, Math.abs(g[i]))
  // the charleo: the membrane slaps the gourd's rim once a cycle while the gourd swings past th, so it buzzes at the note's own pitch
  const th = (o.th ?? 0.3) * pk, bz = new Float32Array(x.length)
  for (let i = 1; i < x.length; i++) if (g[i] > th && g[i - 1] <= th) {
    const a = ((g[i] - g[i - 1]) * SR) / (2 * Math.PI * f) / pk // the slope at the crossing gives how far the swing passes th
    for (let j = 0; j < 60 && i + j < x.length; j++) bz[i + j] += a * (r() * 2 - 1) * Math.exp(-j / 14)
  }
  const z = M.svf(bz, 1900, 1.2, 'bp'), buzz = (o.buzz ?? 8) * pk
  for (let i = 0; i < x.length; i++) x[i] = x[i] + 0.8 * g[i] + buzz * z[i]
  return x
})
```

The buzz was −28 dB of the note in 1–5 kHz; it is about −19 now.

- **The climb (l.346–348), no rolls.** Strike the bar's big beats (two in 6/8, three in 3/4), so the hemiola
  is heard in a third voice:
  ```js
  const v = 0.24 + 0.015 * (b - 4), beats = odd(b) ? [0, 2, 4] : [0, 3]
  const tec = (k, p, vv) => M.note('tecomate', tb(b, k), p, 0.5, vv, { ring: 0.35, pan: 0.3, send: 0.6 })
  if (!last) beats.forEach((k, i) => tec(k, CLIMB[b - 4], v * (i ? 0.7 : 1)))
  else { tec(0, 'C#4', v); tec(2, 'E4', v * 0.8) }
  ```
  In **bar 8**, strike **Bb3 on k0** (the Bb chord's root) and A3 on k3 (over Gm). This takes out the A3/Bb4
  minor 9th. It is the one edit here I did not render; it is a single pitch.
- **The night tune (l.367–372).** Strike each note once:
  `M.note('tecomate', t, p, d * 0.25, d >= 2 ? 0.17 : 0.13, { ring: 0.4, pan: 0.2, send: 0.8 })`
- **The trucks (l.449, l.474).** Four routes close in on one corner, as a wedge with no A2:
  `TRUCK = ['E4','E3','C4','A3']`, pans `[-0.6, 0.6, -0.25, 0]`, vel 0.26, ring 0.25.
- `roll()` is then unused and can go.

Lifts Originality, Mix, Arc, Identity.

**4 · The tarima (l.78–85) and the palmeo eighths (l.315, l.410) · "kick", "cajón", "the beat drop at 0:03",
"congas"**

What it should be: a hollow box. Its knock sits at 230–700 Hz, and the heel's nails crack on the wood.

```js
M.instrument('tarima', 'perc', 0.75, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.25 * SR), x = new Float32Array(n), h = o.heel ?? 1, B = o.box ?? 1
  const P = [[118 * B, 0.045, 0.45 * h], [232 * B, 0.04, 0.8 * (0.4 + 0.6 * h)], [387 * B, 0.028, 0.6], [655 * B, 0.018, 0.5], [1320 * B, 0.008, 0.35]]
  const ph = P.map(() => r() * 0.8)
  for (let i = 0; i < n; i++) { const t = i / SR; let v = 0; for (let p = 0; p < P.length; p++) { const [fr, tau, a] = P[p]; v += a * Math.exp(-t / tau) * Math.sin(2 * Math.PI * fr * t + ph[p]) } x[i] = v }
  const nc = Math.floor(0.014 * SR), cn = new Float32Array(nc) // the nails on cedar: 14 ms of noise near 2.6 kHz
  for (let i = 0; i < nc; i++) cn[i] = r() * 2 - 1
  const cr = M.svf(cn, 2600, 0.6, 'bp')
  for (let i = 0; i < nc; i++) x[i] += cr[i] * (2.2 + 1.0 * (1 - h)) * Math.exp(-i / SR / 0.0025)
  for (let k = 0; k < 4; k++) { const s = Math.floor((0.012 + 0.03 * r()) * SR); for (let i = 0; i < 0.002 * SR; i++) x[s + i] += (r() * 2 - 1) * 0.25 * Math.exp(-i / SR / 0.0005) }
  return x
})
```

- In the countdown, set the tarima levels to 0.36 (bars 4–5) and 0.37 (bars 6–9).
- **Delete both palmeo loops** (l.315 and l.410). The palmeo stays on its cues: the fold, the masa, the slabs,
  the press.

Tested: the heel's first 50 ms now peak at 160–500 Hz. The 20–160 Hz share falls by 5 dB and 2–5 kHz rises by
12 dB. Crest is 13 dB (it was 6). Lifts Originality, Identity, Fatigue.

**5 · The jarana's mutes and strokes (PAT6/PAT3 l.232–233, stroke() l.222–230, the jarana detune l.44) · "handclaps on
2 and 4", "snare", "soca off-beat", "piano"**

What it should be: the apagón as a pickup and not a backbeat, and a hand's stroke rather than a hammer's.

```js
const PAT6 = [[0,'d',1.0],[0.5,'u',0.45],[1,'d',0.6],[2,'x',0.6],[3,'d',0.95],[3.5,'u',0.45],[4,'d',0.6],[5,'x',0.6]]
const PAT3 = [[0,'d',1.0],[0.5,'u',0.4],[1,'d',0.5],[2,'d',0.95],[2.5,'u',0.4],[3,'d',0.5],[4,'d',0.95],[4.5,'u',0.45],[5,'x',0.6]] // 3/4 rings through; only the k5 apagón
```

- In `stroke()`, set the apagón `gain: 0.5` (it was 0.7).
- Replace the `M.chord` for d/u strokes with per-course gaps of 3–7 ms:
  ```js
  let tc = t + dt
  notes.forEach((p, i) => { M.note('jarana', tc, p, o.dur ?? 0.2, v * (1 - i * 0.04), { pan: PAN_J, exact: true, ...(o.opt || {}) }); tc += 0.005 * (0.6 + 0.8 * hr()) })
  ```
- In the instrument, give each doubled course its own detune:
  `S(f * Math.pow(2, (2 + 7 * r()) / 1200), …)` (it was a fixed +5 cents).

Tested: Beat This now hears a 0.5-s beat in bars of 3. Before, it heard an eighth pulse in bars of 1 or 3.
Lifts Originality, Identity, Musicality.

**6 · 13.5–17.0 s (bars 9 and 11) · "the horn section's fanfare stabs at 0:14–0:17"**

What it should be: the day falls into the night, and the trucks arrive quietly.

- HOOK_B's end (l.289) becomes `[8,'A4',1],[9,'G4',1],[10,'E4',2]`. It falls A–G–E over A7 and ends open on
  the 5th.
- The trémolo's arrival boost (l.358) goes from `3` to `1.5`.
- The Am stroke on 17.0 (l.474) goes from 0.24 to 0.16.
- The trucks are Fix 3's wedge.

Lifts Originality, Under the picture, Arc.

**7 · Every hand-played note (append at the end of the score) · "identical velocity curves", "MIDI"**

What it should be: no two hits are the same sample.

```js
const LIVE = new Set(['jarana','requinto','leona','tarima','tecomate','quijada','palmeo','crunch','comal','scrape','chop','plunk'])
M.events.forEach((e, i) => { if (LIVE.has(e.inst)) e.o = Object.assign({}, e.o, { tk: i }) }) // a take per event: its own noise
```

The three bites become three different crunches. Render time is unchanged (about 12 s). Lifts Fatigue,
Originality.

**8 · Bars 4–9, the leona (l.343) · "diatonic, uplifting chord cycles, zero tension"**

What it should be: a tonic pedal under the countdown. The bass holds D while the chords move over it, and the
roots only start moving when the fire comes. A7 over D (bars 5 and 9) is the tension both listeners say is
missing, and it removes the k5 anticipation that M heard as the "bouncing" bass.

```js
{ const P = (k, m, d, vv) => leona(tb(b, k), M.n(m), d, vv)   // in place of leonaBar(b, 0.56)
  if (odd(b)) { P(0, 'D2', 0.48, 0.5); P(2, 'D3', 0.45, 0.38); P(4, 'D2', 0.48, 0.45) }
  else { P(0, 'D2', 0.6, 0.5); P(3, 'D3', 0.45, 0.45); P(5, 'D2', 0.22, 0.3) } }
```

Tested: key fit D minor 0.87 (it was 0.73). Lifts Musicality, Originality, Arc.

**9 · The shaker sources (l.364, l.164) · "continuous shakers / hi-hats"**

- The night scrape plays once a bar, lower:
  `M.hit('scrape', tb(b, 0), 0.1, { dur: 0.22, rate: 30, tone: 1100, pan: -0.3 })`. Delete the k3 one.
- Lower the comal's noise floor `0.04 → 0.012`, so it is pops, not hiss.

Lifts Fatigue, Originality.

**10 · Levels after 1–9 (the arc)**

- Countdown rasgueo: `0.35 + 0.015 * (b - 4)` (it was 0.42 + …).
- Intro rasgueo: `rasgueo(1, 0.30); rasgueo(2, 0.32); rasgueo(3, 0.34)`.
- Splash plunk: 0.5 → 0.65 (so its onset reads).
- Targets, which my test met:

| section | target | tested |
|---|---|---|
| intro | −22.5 | −22.6 |
| countdown | −20.3 | −20.3 |
| night | ≥ 8 dB under the fire | −25.8 (8.4 under) |
| fire | ≥ 2.5 dB over the countdown | −17.4 (2.9 over) |
| dinner | | −22.3 |
| end | | −20.8 |
| 20–70 Hz | ≥ 10 dB under 70–160 everywhere | ✓ |
| bite gaps | < −55 dB | ✓ |
| puff | | breath −28 at 25.5, −12 at 25.75 |

Lifts Arc, Mix.

## Tested: r2 as shipped, and fixes 1–10 together (scratch copy, not the project)

| | r2 | fixes 1–10 |
|---|---|---|
| integrated / true peak / LRA | −15.8 / −1.5 / 7.6 | −15.7 / −1.3 / 7.7 |
| intro · countdown · night · fire · dinner · end (dBFS RMS) | −22.4 · −20.6 · −24.4 · −17.7 · −21.7 · −23.0 | −22.6 · −20.3 · −25.8 · −17.4 · −22.3 · −20.8 |
| crest, median per 0.5 s (intro / countdown / night / fire) | 15.1 / 15.8 / 13.3 / 15.3 | 18.8 / 17.8 / 18.2 / 15.1 |
| sync within 50 ms | 60/62 | 60/62 (both misses at 0.00 are the detector's first frame) |
| Beat This | eighths, bars of 1 or 3 | 0.5-s beat, bars of 3 or 2 |
| key fit | D minor 0.73 | D minor 0.87 |
| unique samples, tarima / crunch | 14 of 96 / 1 of 3 | 96 / 3 |

The tested files are
`C:\Users\nique\AppData\Local\Temp\claude\C--Users-nique-Desktop-SupremeGens\98391b7e-de68-4cc3-9838-aa1521319ed0\scratchpad\score-fix.js`
and `…\scratchpad\taco\kit\music.js`. Lines marked `JUDGE TEST` are the edits. The scratch folder may be
cleaned up; the code above is complete without it.

A render measures the sound but does not hear it. The one risk nobody has listened to yet is the charleo: at
`buzz 8` it should read as a gourd rattle. If the final listen says "kazoo", drop it to 5.

## Nice to have

- **If the final listen still calls the "acoustic guitar" part of a stock kit**, that is the sister film's
  lesson coming due. In bars 6–9 and 14–19, thin the jarana to its big-beat strokes only (k0 and k3 in 6/8; k0,
  k2 and k4 in 3/4), so the tecomate, leona and tarima carry the pulse under the requinto. Untested.
- Drop the requinto an octave (hook A3–A4, under the jarana), where a real requinto jarocho sits. That removes
  the last "bright melodic top line". Masking is untested.
- Quijada teeth: lower the pings from 1.8–4.4 kHz to 0.9–2.2 kHz (M heard "cowbell/agogo"). Noise clicks were
  tried and read as a shaker, so keep them tonal.
- Change bar 18's chords to `['Gm','Bb']` so the fire isn't the countdown's six chords replayed ("modular
  blocks").
- Update `music.md`'s instrument list to the son band.
