# Music judge — taco, r1 ("Sesquiáltera for a taco")

**Verdict: FAIL.** Scores: Originality 2 · Identity 2 · Sync 6 · Arc 4 · Musicality 4 · Mix 6 · Fatigue 5 · Under the picture 5.

On paper the score avoids every item on its avoid list. The listener still hears every one of them. A plain
listener cannot hear a son jarocho in this track. It hears a Kickstarter video, and each thing it names can
be traced to a line in `score.js` (see the table below). The plan is right: the hemiola, a kitchen as the
band, the 1.5-s bars. The sounds and voicings chosen to carry that plan are the stock kit.

---

## The stock version of this cue

> **Library:** "Happy Folk Explainer, 112 bpm". Fingerpicked steel-string guitar on bright major/add9 chords,
> a glockenspiel answering each phrase, claps on 2 and 4 over a stomp-kick, a shaker, a soft pad, a new layer
> every 8 bars, and an ending on a ringing add9 chord with a glock sparkle.
> **The "Mexican" variant:** La Bamba I–IV–V on nylon guitar, maracas, güiro, mariachi trumpet stabs and a grito.

**How far r1 is from it:** about 1/10 from the first line. The listener named it, item by item: "acoustic
guitar + glockenspiel + handclaps + stomp", "major pop chords", "modular layering", "clean ring-out with a
glockenspiel chime". It is about 8/10 from the second line, but only because it doesn't sound Mexican at all.
r0 was a different stock track (lo-fi Rhodes/rimshot), so changing the instruments did not get away from
stock. It only swapped one library shelf for another.

## Why the listener hears stock — every claim traced to the code

| the listener heard | caused by (score.js line) |
|---|---|
| "clean, bright **steel-string fingerpicking**" | `strum()` adds `+ 12` (l.54), so the Dm stroke is A4 D5 F5 A5 **E6**. `strum: 0.012` × 5 notes spreads each stroke over **48 ms**, which is an arpeggio and not a strum (l.55). `bright: 0.72` and single strings complete the effect. |
| "**glockenspiel** / chime bells answering the guitar" | FM `bell` on the 8 apart-lifts at D5–C6 (l.166), on 4 truck arrivals (l.174), on the puff (l.170) and at the end (l.144). `tine` at l.108, 143, 172 and 178. Cue `woodbar` is pushed up an octave (l.162 `up = …+12`, l.168, l.180), so toppings ring at D5–E6. A `woodbar` line in D4–F5 (l.92–95) sits in the hook's register. |
| "crisp, layered **handclaps** accenting the backbeat" | `chuck` (l.52) and `pat` (l.75) fall on **the same eighths** (6/8: 2, 5; 3/4: 1, 3, 5). Both are 20–30 ms noise bursts band-passed at 1.0–1.8 kHz, always opposite the stomp. Two stacked noise bursts make a clap. |
| "muted **kick** / cajón thump" | `stomp` is a 105 Hz sine with a 110 ms decay, which is a kick-drum recipe, played on every accent (l.60). `thump` is a 46 Hz pitch-swept sine, an 808 (l.114, l.132). |
| "subtle **shaker**" | `shaker` on every eighth, bars 6–9 and 14–19 (l.78, 89, 112). |
| "melodica / accordion / soft organ **pad**" | `glass` (l.86, 100, 139) plus `breath` (l.125). |
| "standard **major pop chords**, no tension" | PROG (l.35) is mostly C, G and F major triads, one per bar. Every voicing is topped by a 9th, 6th or maj7 (E on Dm, D on C, E on F, E on G, B on Am…, l.24–34). That pastel "add9" sound is the stock colour. Asus→Dm (bar 13→14) has no leading tone. The analysis confirms it: key fit D minor 0.75, **next G major**. |
| "**standard 4/4**, ~110–115" | One chord per 1.5-s bar. In the 3/4 bars, stomp and "clap" alternate on every eighth. The hemiola exists only in which eighths get accented. It never shows in the harmony or in the shape of the bass line, so the ear smooths it into 4/4. |
| "instruments stacked **modularly**… clean ring-out with a **glockenspiel chime**" | Whole blocks start on section lines (l.89, l.111). The ending is D Lydian maj7#11 (D A C# F# **G#** E) plus a tine arpeggio up to E6 plus a bell on A5 (l.139–144), which is the corporate-ending shimmer. |
| "**pristine, quantised**" | `human.time` 5 ms, every instrument on the same grid, and a 2.2-s hall reverb sent from everything (l.11–12). |

My band measurement on `music.wav` (RMS dBFS over 3-s windows):

| | full | <70 Hz | 70–160 | 160–500 | 0.5–2k | >5k |
|---|---|---|---|---|---|---|
| countdown (6–15) | −17.3/−17.8/−17.5 | −27..−33 | −22 | −22..−27 | −22..−23 | −40..−43 |
| **night** map / nixtamal | **−17.0 / −17.4** | −28 | −38 | **−18.0 / −19.4** | −27 / −23 | −42 / −51 |
| fire trompo/comal/shave | −16.5/−17.1/−16.6 | −24..−29 | −19.5 | −23..−25 | −22..−27 | **−37.8** (9-s hiss) |
| bites (32.2–34.5) | −17.9 | **−22.1** (loudest sub in the film) | −20.6 | −31.7 | −32.8 | −42 |

60-ms RMS around the bites: 32.10 s **−22.6** (strum still playing), 32.25 −13.7, 32.80 −34.4, 33.0 −11.1,
33.50 **−39.0**, 33.75 −11.2.

---

## Scores

**1 · Originality: 2/10.** The listener says it is "unmistakably" the 2010s explainer formula. Two items from
the brief's own avoid list, glockenspiel and claps, are heard plainly even though neither is literally in the
score (see the table). The planned signature, the hemiola, is not heard ("standard 4/4"). Nothing in the
track would be hard to find in a library.

**2 · Identity: 2/10.** Nothing Mexican, son or kitchen reaches the listener. There is no jarana, no
zapateado, no requinto, and not one kitchen sound is named. The kitchen SFX (chop, sizzle, pat) come across
as drum-kit parts: clap, hiss, kick. Ignoring the listener's words, the score is at least in the right
family (6/8 vs 3/4 accent sets, l.48–49), which is the only reason this isn't a 1.

**3 · Sync: 6/10.** The timing is good: 63/64 cues have an onset within 50 ms, all uniformly +14..+47 ms
(mean ≈ +30 ms, which is detector lag plus the 48-ms strum smear), and 0.00 s is at +70 ms. That statistic
proves little, though, because the groove has an onset on every 0.25-s eighth and every cue is on that grid.
On meaning: 15 different actions (splash 18.5, masa ball 20.5, dawn 19.5, slab slap 21.5, flowers 7.75…) all
get the same "woodbar ping + UI pop". The key moments get buried: the **puff at 25.75** and the
**pineapple landing at 29.25** sit inside the fullest bars with nothing special to mark them. **Bite 1
(32.25) is not stop-time.** The strum on 32.0 and 32.5 and the `hook(20)` notes up to 32.5 surround it
(−22.6 dB at 32.10). Bites 2 and 3 do work (−39 dB gap at 33.5), but they are the same G chord.

**4 · Arc: 4/10 (flat caps at 6).** From 6 to 34 s the per-second level stays inside about 1.5 dB.
The **night is not a drop**: −17.0/−17.4 against a countdown of −17.3..−17.8. Its 160–500 Hz band (−18.0) is
the loudest low-mid of the whole film, from the `glass` pad (l.100) and the night bass (l.102). Ticks fill
every eighth (l.103). The **fire peak** is only +0.8 dB over the countdown. The r1 listener doesn't mention
the night at all. The r0 listener named the 15-s drop as a memorable moment, so this is a regression. What
works: the quiet open (−20/−22) and the stop between bites 2 and 3.

**5 · Musicality: 4/10.** The hook (l.64) is played on the same `string` voice, in the same register, as the
strum, so it is masked. In bars 6–9 the woodbar line (l.94) plays **exactly the hook's first-bar rhythm
[0, 2, 3, 5] in the same register**, which produces unisons and seconds: bar 6 k3 C5/C5, k5 B4/A4; bar 8 k0
A4/A4, k2 C5/D5. The woodbar line also ignores the chords: bar 9 is B4 D5 F5 over C (F5 against the strum's
E5, B4 against C5), and bar 6 has B4 over F. Clear wrong notes: `bassBar` adds `r + 10`, which puts **Eb3 on
the F bars 6 and 16**, outside the mode and against the E in the voicing (l.71). `hook(16, …, 2)` (l.124)
transposes the hook to **B4 E5 D5 B4 C#5 B4 G4 over F and G**, which puts C# against the G chord's D for no
reason. The same 2-bar hook plays 6 times with almost no variation. Bites 2 and 3 are the same chord
(l.133). The breath tune (l.125) plays at the same time as `hook(18)`, two leads at once, and lines 119–123
(bars 14–17) never sound.

**6 · Mix: 6/10.** It meets spec: −15.6 LUFS, −1.5 dBTP. The low end is not clear. Stomp at 105 Hz, thump at
46 Hz and a sine bass with 1.3-s G1/A1/Bb1 notes are all stacked under 160 Hz. The bites carry the loudest
sub in the film (−22.1 dB below 70 Hz, from the 46 Hz thump). The night's glass pad clogs 160–500 Hz. The
`sizzle` (l.117) is a **9-second static hiss** from 21 to 30 s (the solid band above 10 kHz in the
spectrogram). Nothing is truly harsh, but the hiss and the E6-topped strum on every eighth are the
brightest constant elements.

**7 · Fatigue: 5/10.** Every eighth carries 3–4 events (strum, chuck and pat on the same eighth, shaker on
every eighth). The night ticks on all 24 eighths. The same hook plays 6 times, and the static hiss runs
9 s. On a third play, what you notice is the grid and the hiss.

**8 · Under the picture: 5/10.** It never fights the picture. But the picture goes dark at 15 s and the
music doesn't, and the fire scenes don't heat up. A cue "ding" on every action is explainer
mickey-mousing, and it works against the film's own claim. A hand-drawn film whose end card says "Scored
in code" is let down by a score that sounds like it came from a library.

---

## KEEP

- The film clock: 6/8 at dotted-quarter 80, 1.5-s bars, cuts on bar lines, and the section map (l.38–42).
- The cue reader: every registered cue gets a sound by what it is (l.146–182). The scene transition SFX
  (paper, whoosh, swell) and the **wood tick at 1500 Hz on every scene change** (l.157) are the countdown's
  clock. Keep both exactly as they are.
- The hemiola skeleton: accents on [0, 3] in 6/8 and [0, 2, 4] in 3/4, with mutes in between (l.48–49, l.60).
  It is right. It just needs to be made audible.
- Karplus-Strong `string` as the engine. It got rid of the Rhodes, and every new string instrument below is
  built on it.
- The idea that the apart-layers ring rising pitches (l.163–166), and the toppings landing on the eighths
  0.25–1.25. Change the instrument, keep the idea.
- The night's root motion Bb–A–G–A and the night tune's pitches (l.107). Change the instrument and the
  register, keep the notes.
- `chop` on the shave strokes, because it is a knife and it means one. The −39 dB stop between bites 2 and 3.
- Loudness and peak targets.

---

## FIX LIST (most important first; every fix is an edit to score.js, and new instruments are in the next section)

**1. Every eighth, bars 1–21 (l.52 `chuck`, l.73–77 `pats`) · the "handclaps".** `chuck` and `pat` are
stacked noise bursts on the same off-beat eighths, opposite the stomp, which together make a clap track.
→ Delete every `M.hit('chuck', …)` and every `pats()` call (l.89, 104, 112, 128). The mute between accents
becomes the jarana **apagón**: a palm-muted *pitched* stroke,
`M.chord('jarana', t, c.v, 0.012, vel*0.85, { strum: 0.003, damp: 0.015, bright: 0.3, body: 0.8, single: true })`.
That gives a short "chk" with pitch, all of it below 1 kHz. The kitchen pat becomes `palmeo` (recipe below:
dough between palms, low-passed at 650 Hz, body 155 Hz, dry). Play it only as continuous **eighths alternating
hands** (vel 0.22 / 0.15, pan ±0.3) in 3–6 s and softly (0.15) in 24–27 s. Never put it on the off-beats
alone. **Lifts:** Originality, Identity, Fatigue.

**2. All strum bars (l.46–57, CH l.24–34) · the strum sounds like a fingerpicked steel-string guitar.**
→ Replace `strum()` with `rasgueo()` on the new `jarana` instrument (doubled courses).
- **Drop the `+ 12`.** Use re-entrant 5-course voicings in C4–D5, written in down-stroke order, with
  **plain triads and only the dominant 7th**, no added 9ths or 6ths:
  Dm `A4 D4 F4 A4 D5` · Gm `G4 D4 G4 Bb4 D5` · A7 `A4 C#4 E4 G4 A4` · Asus `A4 D4 E4 A4 D5` ·
  C7 `G4 C4 E4 Bb4 C5` · F `A4 C4 F4 A4 C5` · Bb `F4 D4 F4 Bb4 D5` · Am `A4 C4 E4 A4 C5` · D `A4 D4 F#4 A4 D5`.
  Leona roots: D2 G2 A2 A2 C2 F2 **Bb2** A2 D2 (nothing below C2).
- **Stroke:** `strum: 0.004`, so a full stroke lasts ≤ 20 ms. Up-strokes play only the top 3 courses, reversed.
- **Pattern** (eighths; ↓ down, ↑ up on the 16th, ⊗ apagón). 6/8: ↓0(1.0) ↑0.5(.45) ↓1(.6) ⊗2(.85) ↓3(.95)
  ↑3.5(.45) ↓4(.6) ⊗5(.85). 3/4: ↓0(1.0) ⊗1(.8) ↓2(.95) ⊗3(.75) ↓4(.95) ↑4.5(.5) ⊗5(.8). The 6/8 bars
  roll ("trrum-tum-chk") and the 3/4 bars are dry and square ("tum-chk tum-chk"). That change of *texture*
  is what makes the hemiola audible.
- **The lilt:** in 6/8 bars, delay eighths 1 and 4 by +10 ms.
- **Levels:** intro 0.32→0.40, countdown 0.42 rising 0.015 a bar, fire 0.58.
- Note that the cue code reads `ch.v[2 + n % 4]`, which runs past a 5-element voicing. Change it to
  `ch.v[1 + n % 4]`.

**Lifts:** Originality, Identity, Musicality, Mix.

**3. PROG (l.35), `chordAt` (l.36), `bassBar` (l.68–72) · Dorian C/G/F major chords, one per bar, heard as
"major pop", plus the Eb error.** → Use the son's own minor, i–iv–V7 with the C# leading tone, and change
chords **inside the bar on the hemiola**. A 6/8 bar gets 2 chords, one per dotted quarter (change at k3). A 3/4
bar gets V7 for 2 beats and the resolution on beat 3 (change at k4). The chord rhythm becomes 0.75 + 0.75 |
1.0 + 0.5 s, which cannot be heard as 4/4.
```js
// one chord, or [first, second]: second starts at eighth 3 in 6/8 (even) bars, eighth 4 in 3/4 (odd) bars
const PROG = ['Dm', ['Dm','A7'], ['Dm','Gm'], ['A7','Dm'], ['Dm','Gm'], ['A7','Dm'], ['Dm','Gm'], ['C7','F'], ['Bb','Gm'], 'A7',
              'Bb', 'Am', 'Gm', ['Asus','A7'], ['Dm','Gm'], ['A7','Dm'], ['Dm','Gm'], ['C7','F'], ['Bb','Gm'], 'A7',
              'Dm', 'Dm', 'Gm', 'D']
const chordAt = (b, k = 0) => { const i = Math.max(0, Math.min(23, Math.floor(b))), e = PROG[i]
  return CH[typeof e === 'string' ? e : e[k >= (i % 2 ? 4 : 3) ? 1 : 0]] }
```
In the cue loop, call `chordAt(b, (b % 1) * 6)`. The **leona** (new instrument, replacing `bass`) plays the
root on every chord change. In 6/8 bars it also plays **the next bar's root on k5** as an anticipation (0.22 s,
vel ×0.6). In 3/4 bars it plays the chord's 3rd on k2 (A7: C#3). Each new root goes in the octave nearest the
last note, within C2–D3. **Delete `r + 10`**, which is the Eb3 on bars 6 and 16. Bar 13's A7 at k4 finally
gives the fire's Dm a leading tone. Don'ts that keep this from turning flamenco or klezmer: no Dm–C–Bb–A
(Andalusian) descent, no **Bb→C# step** in any melody, no parallel-thirds doubling of the hook (that is the
mariachi-trio sound). **Lifts:** Identity, Musicality, Originality.

**4. 15–21 s, bars 10–13 (l.98–108) · the night is as loud as the day (−17.0 dB) and its loudest element is
a synth pad.** →
- Delete `glass` (l.100), the string chord (l.101), the 24 ticks (l.103), `pats` (l.104) and the tine tune
  (l.108).
- Replace them with a **jarana trémolo**: soft 16th strokes (every 0.125 s, alternating down/up, top 3
  courses) at vel 0.12 × a swell `0.7 + 0.3·sin(πj/12)`, with `bright: 0.3, damp: 0.03, send: 0.6`. In
  bar 13 ("dawn") use `bright: 0.55` and vel ×1.3.
- The composer's **night tune moves to the `tecomate`, an octave down** (A3 G3 F3 E3 D3 … E3). Notes of 2
  eighths or longer are **rolled** (strikes every 0.0625 s, vel 0.22/0.18 alternating, `ring: 0.6`); single
  eighths are struck once at 0.3.
- **Leona as the truck:** root on k0 (0.4 s, vel 0.45), root on k3 (0.25 s, 0.3), fifth on k5 (0.15 s, 0.25),
  with roots Bb2/A2/G2/A2. That is an octave up from now, with no G1 to Bb1.
- **The engine and clock:** `scrape` only on k0 and k3 (`{dur: 0.22, rate: 30, tone: 1800}`, vel 0.15)
  instead of 6 ticks a bar.
- Before the drop, **bar 9 k5 is empty** (no jarana, no leona anticipation, no tarima). That one-eighth
  breath is what makes the night arrive.
- **Target:** night ≈ −25 dBFS RMS per second, 8 dB under the fire. If the integrated level falls below
  −16 LUFS, lower the bite and tarima transient peaks (they set the peak normalisation). Do not raise the
  night.

**Lifts:** Arc, Under the picture, Mix, Identity.

**5. Every glock-family ping (bell l.144/166/170/174, tine l.108/143/172/178, woodbar l.92–95/168/180, pop
l.168/170) · "glockenspiel answering the guitar", plus explainer UI pops.** → Delete `bell`, `tine` and `pop`
entirely. Re-map the cues by meaning (code switch at l.162–181):

| cue | now | becomes |
|---|---|---|
| toppings land (0.25–1.25, 30.25–31.0) | woodbar D5–E6 + pop | **requinto** single plucks rising **D4 E4 F4 A4 D5**. The dinner repeats them as a rhyme. No pop. |
| apart lifts (3.25–5.0) | FM bells D5–C6 | **tecomate D3 E3 F3 G3 A3 Bb3 C#4 E4** (lime = E4), vel 0.45, low and buzzing |
| heavy lands (6.5 crown, 21.5/22.25/23.0 slabs, 27.25 slices) | woodbar + pop | `palmeo {body: 110}` (a wet slap) + tecomate chord tone in C3–A3. The slabs climb **D3 F3 A3** as the stack climbs. |
| grow/rise (7.25, 11.5, 12.25…) | tine | a stroke at vel ×1.6 *inside* the tecomate roll (fix 6). The line itself is the growth. |
| trucks arrive (16.25, 16.5, 16.75, 17.0) | bells ratio 3.5 | tecomate **A2, E3, A3, C4**, then on 17.0 one jarana Am stroke (vel 0.35). Four states, one street corner, one chord. |
| splash 18.5 / dawn 19.5 / mano 20.0 / masa 20.5 | woodbar ×4 | `plunk` / `quijada` strike 0.3 / `scrape {dur: 0.45, rate: 90, tone: 750}` (stone on stone) / `palmeo` pair |
| crowns it 23.5 | woodbar + pop | requinto D5 + quijada 0.4 |
| press slams 24.5 / lands on comal 25.0 | chop + scrape / woodbar | `tarima {heel: 0.3, box: 1.9}` + `palmeo` 0.4 / `comal` crackle starts (dur 2.2, vel 0.35) |

The rule for the groove sections (6–15, 21–30): **no extra pitched ping.** A cue there is answered by an
accent from something already playing: a tarima heel, a full stroke in place of an apagón, a requinto note.
**Lifts:** Originality, Sync, Fatigue, Under the picture.

**6. Hook (l.64–67, calls l.90/124/142), woodbar line (l.92–95), breath tune (l.119–125) · the lead is
masked, doubled, repeated 6× and wrongly transposed.** → Give the lead to one new instrument, the
**requinto** (espiga attack, nasal, short). Write three versions that put the hemiola *in the melody's
grouping*: 3+3 in the 6/8 bar, then 2+2+2 in the 3/4 bar.
```js
// [eighth from phrase start, pitch, eighths]
const HOOK_A  = [[0,'A4',1],[1,'D5',1],[2,'F5',1],[3,'G5',2],[5,'F5',1],[6,'E5',2],[8,'C#5',2],[10,'D5',2]]   // Dm|Gm · A7→Dm
const HOOK_A2 = [[0,'A4',1],[1,'D5',1],[2,'F5',1],[3,'G5',2],[5,'F5',1],[7,'E5',1],[8,'Bb4',2],[10,'A4',2]]   // Dm|Gm · C7→F (k6 left empty for the puff, fix 8)
const HOOK_B  = [[0,'D5',1],[1,'F5',1],[2,'D5',1],[3,'Bb4',2],[5,'A4',1],[6,'G4',1],[7,'E4',1],[8,'A4',1],[9,'C#5',1],[10,'E5',2]] // Bb|Gm · A7, ends open
function requinto(b, phrase, vel = 0.65, o = {}) {
  for (const [k, p, d] of phrase) {
    const t = tb(b) + k * 0.25, m = M.n(p)
    if (k === 0) M.note('requinto', t - 0.035, m - 2, 0.03, vel * 0.5)                  // ligado: a grace a step below
    if (o.repique && d >= 2) for (let j = 0; j < d * 2; j++) M.note('requinto', t + j * 0.125, m, 0.12, vel * [1, .55, .75, .55][j % 4])
    else M.note('requinto', t, m, d * 0.25 - 0.02, vel)
  }
}
```
Placement: bars 6–7 HOOK_A 0.60 · 8–9 HOOK_B 0.62 · 14–15 HOOK_A 0.72 `{repique: true}` · 16–17 HOOK_A2 0.72 ·
bar 18 HOOK_B k0–5 with repique · bar 19: G4 on k0, then the flick run (fix 8). The requinto stays silent in
bars 4–5 and enters with the pig. **Delete `hook(16, 0.74, 2)`** (the C# error), `hook(20)` (it collides
with the toppings and fills bite 1's gap), the breath tune (l.125: a second lead over the hook, and a
sine-plus-breath flute is the pan-flute cliché), and the dead l.119–123.

The **woodbar line becomes a tecomate climb in the low register**: one **rolled** note a bar (strikes every
0.0625 s, vel 0.15 rising to 0.23, `ring: 0.6`, pan 0.3) on **D3 · E3 · F3 · G3 · A3 · [C#4 then E4 on k3]**
for bars 4–9. It sits two octaves under the hook and never shares its rhythm. **Lifts:** Musicality,
Originality, Fatigue.

**7. Stomp + thump + shaker (l.58–62, 78, 114, 132) · a kick, an 808 and a shaker on the grid.** →
- Delete `zap()`, `thump` and `shaker`. Also delete the fire `scrape` on k4.5 (l.115), which is a güiro in
  all but name and a Latin-library sound.
- Replace them with `tarima()` on the new **tarima** instrument (zapateado on a hollow cedar platform),
  counted in 16ths (s = 0..11, 0.125 s):
  - **Heels** (`heel: 1`, 4 ms early): 6/8 on s0 and s6; 3/4 on s0, s4, s8. The first is at vel 1, the
    rest at ×0.85.
  - **Toes** (`heel: 0`, ×0.45) as **pickups into the heels**, never on the off-beats: 6/8 s5, s11;
    3/4 s3, s7, s11.
  - **Redoble** into the next bar: s9 s10 s11 at ×0.4, 0.5, 0.7.
  - **Second dancer** (`box: 1.08`, +12 ms, heels only, ×0.7).
- Plan by section:
  - **Countdown:** bars 4–5 heels only at 0.5. Bars 6–9 add toes, with a redoble on bars 5 and 7. Nothing on
    bar 9 k5.
  - **Night:** no tarima. Nobody dances on the night shift.
  - **Fire, bars 14–19:** 0.75 with toes, redoble into every bar, both dancers, and `quijada` on k5 of each
    3/4 bar (vel 0.45).
  - With the jarana at 0.58 and the leona at 0.9, the fire ends up **+3 dB over the countdown**. Target:
    countdown −19..−18, fire −16..−15 dBFS RMS.
- **The low end:** the leona plays nothing below C2, no note is longer than 0.6 s, and the fundamental sits
  under its own buzz harmonics. The <70 Hz band should end up at least 6 dB under 70–160 Hz everywhere
  (bites now: −22.1 vs −20.6).

**Lifts:** Identity, Arc, Mix, Fatigue.

**8. Key moments · the puff, the flick and the landing are buried.**
- **Puff, 25.75 (bar 17 k1).** **The band holds its breath on bar 17 k0** (25.5): no jarana, no tarima and no
  leona on that downbeat. `puff` starts at 25.49, so its taut "pomp" lands on 25.75. At 25.75 everyone
  re-enters together: a full ↓ C7 stroke (vel 0.65), both dancers' heels and leona C2. HOOK_A2 already leaves
  k6 empty.
- **Flick, 28.75 → land, 29.25 (bar 19).** The requinto plays a run that **arcs like the pineapple's
  flight**, in 16ths of 0.0625 s with vel 0.5 rising to 0.8: A4 C#5 E5 G5 **A5** (the apex at 29.0) G5 E5 C#5,
  and **lands on A4 at 29.25** (0.5 s, vel 0.9). On the landing, add a full A7 stroke, both dancers and a
  quijada strike (0.55). Then k4 is the leona's A2 alone, and k5 is a requinto C#5 pickup into bar 20.
- **Comal (24–27).** The 9-s `sizzle` (l.117) becomes a `comal` crackle at 25.0 (dur 2.2, vel 0.35), plus
  one at 21.5 for the trompo's fat (dur 2.5, vel 0.2). Pops thin out as the water burns off, with almost no
  hiss.

**Lifts:** Sync, Under the picture, Mix, Fatigue.

**9. Bites, 32.25 / 33.0 / 33.75 (l.128–136) · bite 1 is not in stop-time, and bites 2 and 3 are the same
chord.**
- Bar 21: play only ↓ on 31.5 and ⊗ on 31.75, then **silence from 32.0** (and `hook(20)` is gone, fix 6).
- Each bite is the `crunch` instrument (0.8) plus a tutti stab: a full jarana stroke (dur 0.1, damp 0.04,
  vel 0.75), the leona root (0.25 s, 0.85), and both dancers' heels.
- The chords climb to the end: **Gm (G2) – Bb (Bb2) – A7 (A2)**. One requinto **C#5 alone at 34.25** is the
  leading tone in the last gap, resolving into the D at 34.5.
- Gaps should be < −35 dB between all three bites.

**Lifts:** Sync, Arc, Musicality.

**10. End, 34.5–36 (l.138–144) · a Lydian maj7#11 with a glock sparkle, which the listener named as the
stock ring-out.** → Delete the glass, the DL chord, the tine arpeggio and the bell. Replace them with a
**remate**:
- At 34.5: both dancers' final stamp (0.9 / 0.75) and a `quijada` strike (0.5, `len: 0.8`), with leona D2
  (0.9 s, 0.8).
- A jarana **D major trémolo** of 6 strokes every 0.125 s, decrescendo 0.6 → 0.24, then one last full stroke
  at 35.25 (`ring: 0.8`) that has died away by 36.0.
- The requinto plays **D5** at 34.5, then **F#5** with repique (4 × 0.125 s) at 34.75.

The Picardy third (minor to major) is the son's resolution; the #11 shimmer belongs to the corporate film.
**Lifts:** Originality, Arc, Musicality.

**11. Setup (l.11–12) · "pristine, quantised".** → Set
`reverb: { seconds: 1.0, wet: 0.12, predelay: 0.006, dark: 0.55 }`, a tiled kitchen and not a hall. Use send
0.4 on the tarima and leona and 0.6 on the requinto. Set `human: { time: 0.008, vel: 0.12 }`. Keep the
systematic feel too: the jarana lilt from fix 2 and the tarima heels 4 ms early. **Lifts:** Originality,
Fatigue.

---

## New instruments (put these after `M.setup`; they use only `M.sr`, `M.svf` and `M.INST.*.fn`)

```js
const SR = M.sr, S = (...a) => M.INST.string.fn(...a)

// JARANA: a doubled course. Two KS strings 5 cents apart, the second 2–4 ms late (the jangle no single guitar has),
// cedar body low and nasal. o.single = one string (for the apagón)
M.instrument('jarana', 'pitched', 0.5, (f, dur, vel, o, r) => {
  const p = { ring: o.ring ?? 0.9, bright: o.bright ?? 0.42, pick: o.pick ?? 0.22, body: o.body ?? 0.6, bodyLo: 185, bodyMid: 1150, damp: o.damp ?? 0.05 }
  const a = S(f, dur, vel, p, r)
  if (o.single) return a
  const b = S(f * Math.pow(2, 5 / 1200), dur, vel, p, r), lag = Math.floor((0.002 + 0.002 * r()) * SR)
  const out = new Float32Array(Math.max(a.length, b.length + lag))
  for (let i = 0; i < a.length; i++) out[i] += 0.6 * a[i]
  for (let i = 0; i < b.length; i++) out[i + lag] += 0.5 * b[i]
  return out
})

// REQUINTO JAROCHO: picked at the bridge with a horn espiga. Hard click, nasal 1.5 kHz, short ring
M.instrument('requinto', 'pitched', 0.6, (f, dur, vel, o, r) => {
  const x = S(f, dur, vel, { ring: o.ring ?? 0.7, bright: o.bright ?? 0.95, pick: 0.06, body: 0.45, bodyLo: 260, bodyMid: 1500, damp: o.damp ?? 0.04 }, r)
  const nC = Math.floor(0.002 * SR)
  for (let i = 0; i < nC; i++) x[i] += (r() * 2 - 1) * 0.6 * vel * (1 - i / nC)
  const nas = M.svf(x, 1450, 1.4, 'bp')
  for (let i = 0; i < x.length; i++) x[i] += 0.8 * nas[i]
  return x
})

// LEONA: the son's bass guitar, plucked with an espiga. Dark KS plus a rattle that only buzzes while the string swings wide
M.instrument('leona', 'pitched', 0.75, (f, dur, vel, o, r) => {
  const x = S(f, dur, vel, { ring: 0.8, bright: 0.3, pick: 0.12, body: 0.7, bodyLo: 110, bodyMid: 700, damp: 0.05 }, r)
  let pk = 0; for (let i = 0; i < x.length; i++) pk = Math.max(pk, Math.abs(x[i]))
  const th = 0.35 * pk, bz = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); bz[i] = a > th ? Math.sign(x[i]) * (a - th) * (1 + 0.5 * (r() * 2 - 1)) : 0 }
  const b = M.svf(bz, 950, 1.1, 'bp')
  for (let i = 0; i < x.length; i++) x[i] += 2.2 * b[i]
  return x
})

// TARIMA: a heel on a hollow cedar platform. Two inharmonic box modes (not a kick's single sine), a board mode,
// the nail crack and loose boards. o.heel 1 = heel (boom), 0 = toe (tak); o.box retunes (second dancer 1.08, tortilla press 1.9)
M.instrument('tarima', 'perc', 0.75, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.3 * SR), x = new Float32Array(n), h = o.heel ?? 1, B = o.box ?? 1
  const P = [[128 * B, 0.07, h], [197 * B, 0.05, 0.6 * h], [455 * B, 0.03, 0.5 + 0.4 * (1 - h)], [1210 * B, 0.012, 0.1 + 0.3 * (1 - h)]]
  for (let i = 0; i < n; i++) { const t = i / SR; let v = 0; for (const [fr, tau, a] of P) v += a * Math.exp(-t / tau) * Math.sin(2 * Math.PI * fr * t); x[i] = v }
  for (let i = 0; i < 0.004 * SR; i++) x[i] += (r() * 2 - 1) * 1.1 * Math.exp(-i / SR / 0.0009)
  for (let k = 0; k < 4; k++) { const s = Math.floor((0.012 + 0.03 * r()) * SR); for (let i = 0; i < 0.002 * SR; i++) x[s + i] += (r() * 2 - 1) * 0.15 * Math.exp(-i / SR / 0.0005) }
  return x
})

// QUIJADA: a donkey's jaw struck with the fist. A bony knock, then ~12 loose teeth bouncing in their sockets,
// each faster and softer (the accelerating "brrrt")
M.instrument('quijada', 'perc', 0.4, (f, dur, vel, o, r) => {
  const len = o.len ?? 0.6, n = Math.ceil(len * SR), x = new Float32Array(n)
  for (let i = 0; i < 0.02 * SR; i++) { const t = i / SR; x[i] += 0.7 * Math.exp(-t / 0.005) * Math.sin(2 * Math.PI * 520 * t) }
  for (let k = 0; k < 12; k++) {
    let t = 0.003 + 0.01 * r(), gap = 0.03 + 0.025 * r(), a = 0.4 + 0.4 * r(); const fr = 1800 + 2600 * r()
    while (t < len - 0.005 && a > 0.015) {
      const s = Math.floor(t * SR)
      for (let i = 0; i < 0.003 * SR; i++) x[s + i] += a * Math.exp(-i / SR / 0.0007) * Math.sin(2 * Math.PI * fr * i / SR)
      t += gap; gap *= 0.82 + 0.1 * r(); a *= 0.8
    }
  }
  const y = M.svf(x, 2400, 0.9, 'bp')
  for (let i = 0; i < n; i++) x[i] = 0.5 * x[i] + y[i]
  return x
})

// TECOMATE: a marimba de tecomates bar. The woodbar, a gourd that boosts the fundamental, and the charleo: a membrane
// that rattles while the gourd is loud. If it reads "kazoo", lower buzz to 0.8 / raise th to 0.3
M.instrument('tecomate', 'pitched', 0.5, (f, dur, vel, o, r) => {
  const x = M.INST.woodbar.fn(f, dur, vel, { ring: o.ring ?? 1.0 }, r), g = M.svf(x, f, 6, 'bp')
  let pk = 0; for (let i = 0; i < g.length; i++) pk = Math.max(pk, Math.abs(g[i]))
  const th = (o.th ?? 0.18) * pk, bz = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) { const a = Math.abs(g[i]); bz[i] = a > th ? Math.sign(g[i]) * (a - th) * (1 + 0.4 * (r() * 2 - 1)) : 0 }
  const z = M.svf(bz, 2100, 1.3, 'bp'), buzz = o.buzz ?? 1.4
  for (let i = 0; i < x.length; i++) x[i] = x[i] + 0.8 * g[i] + buzz * z[i]
  return x
})

// PALMEO: masa patted between two palms. Dull, dry, fleshy; no crack above 2 kHz (that is what made pat a clap)
M.instrument('palmeo', 'perc', 0.5, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.09 * SR), x = new Float32Array(n)
  for (let i = 0; i < n; i++) x[i] = r() * 2 - 1
  const s = M.svf(x, 650, 0.7, 'lp')
  for (let i = 0; i < n; i++) { const t = i / SR; x[i] = s[i] * Math.exp(-t / 0.009) * 1.4 + 0.7 * Math.exp(-t / 0.03) * Math.sin(2 * Math.PI * (o.body || 155) * t) }
  return x
})

// PUFF: a tortilla filling with steam. A rising "fff", then the skin going taut ("pomp" at +0.26 s; start it 0.26 s early)
M.instrument('puff', 'sfx', 0.45, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.35 * SR), raw = new Float32Array(n)
  for (let i = 0; i < n; i++) raw[i] = r() * 2 - 1
  const y = M.svf(raw, (i) => 250 + 1100 * Math.pow(i / n, 0.6), 2.5, 'bp')
  for (let i = 0; i < n; i++) y[i] *= Math.pow(Math.sin(Math.PI * Math.min(1, (i / n) * 1.15)), 2)
  const s = Math.floor(0.26 * SR)
  for (let i = 0; s + i < n; i++) { const t = i / SR; y[s + i] += 0.9 * Math.exp(-t / 0.03) * Math.sin(2 * Math.PI * (180 + 120 * Math.exp(-t / 0.01)) * t) }
  return y
})

// CRUNCH: a bite through a crisp tortilla and raw onion, ~30 tiny cracks front-loaded in 0.12 s
M.instrument('crunch', 'sfx', 0.55, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.16 * SR), x = new Float32Array(n)
  for (let c = 0; c < 30; c++) {
    const s = Math.floor(Math.pow(r(), 1.8) * 0.12 * SR), a = (0.3 + 0.7 * r()) * Math.exp(-s / SR / 0.04)
    for (let i = 0; i < 0.004 * SR && s + i < n; i++) x[s + i] += a * (r() * 2 - 1) * Math.exp(-i / SR / 0.0008)
  }
  const lo = M.svf(x, 1600, 0.8, 'bp'), hi = M.svf(x, 4200, 1, 'bp')
  for (let i = 0; i < n; i++) x[i] = lo[i] + 0.6 * hi[i]
  return x
})

// PLUNK: kernels dropped into limewater. A handful of small bubbles whose pitch rises as each closes
M.instrument('plunk', 'sfx', 0.4, (f, dur, vel, o, r) => {
  const n = Math.ceil(0.25 * SR), x = new Float32Array(n)
  for (let k = 0; k < 7; k++) {
    const s = Math.floor(k * (0.012 + 0.02 * r()) * SR), F = 500 + 900 * r(), a = 0.4 + 0.6 * r()
    let ph = 0
    for (let i = 0; s + i < n && i < 0.06 * SR; i++) { const t = i / SR; ph += 2 * Math.PI * F * (1 + 6 * t) / SR; x[s + i] += a * Math.exp(-t / 0.018) * Math.sin(ph) }
  }
  return x
})

// COMAL: water and fat spitting on hot clay. Mostly pops thinning out over the note; almost no hiss
M.instrument('comal', 'sfx', 0.3, (f, dur, vel, o, r) => {
  const n = Math.ceil(dur * SR), x = new Float32Array(n)
  for (let i = 0; i < n; i++) { const d = 0.0015 * (1 - 0.7 * i / n); x[i] = (r() * 2 - 1) * 0.04 + (r() < d ? (r() * 2 - 1) * (1 + 2 * r()) : 0) }
  const y = M.svf(x, 3000, 0.7, 'hp')
  for (let i = 0; i < n; i++) y[i] *= Math.min(1, i / (0.03 * SR)) * Math.min(1, (n - i) / (0.4 * SR))
  return y
})
```

The roles once these are in. Jarana: the kitchen's pulse. Requinto: the taquero, the lead and every flourish.
Leona: the bass and the trucks. Tarima: the dancers and the comal floor. Quijada: the son's rattle and the
dawn. Tecomate: the earth, for the plants, the layers and the night tune. Palmeo, puff, crunch, plunk and
comal: the kitchen. The score keeps the paper, whoosh, swell, wood tick, chop and scrape it already has.
No library kit puts the tarima, quijada, leona buzz, requinto espiga, charleo and the doubled-course
apagón together.

## Nice to have

- A second jarana in fire only (bars 14–19): a *jarana segunda* voicing an octave lower, panned +0.35,
  playing ↓ strokes only.
- The leona could slap its string on k5 of the 3/4 bars together with the quijada (`palmeo {body: 90}` at 0.3).
- 11.0 "snout flicks dirt" is caught by the flick regex and gets the pineapple's whoosh. Give it a soft
  `palmeo` and a short `scrape` (dirt).
- Make the 0.00 s hero stroke start exactly on 0 (the faster strum from fix 2 should already pull +70 ms
  under 20).
- Update `M.meta.signature` and `music.md`'s instrument list to the new instruments, so the report and the
  listener check agree.

## What r2 must show to pass

- **listen.md** must not use the words fingerpicked/steel guitar, glockenspiel/chimes, claps, kick/stomp-clap,
  shaker, pad/organ/melodica, "explainer"/"corporate"/"stock", and must not call it 4/4. It should be able to
  hear a strummed folk string band with dancing feet and a rattle, even without naming son jarocho. If it
  names *flamenco*, *klezmer*, *mariachi* or *pan flute*, the don'ts in fix 3 and fix 6 were broken.
- Night (15–21 s) at least 6 dB under the fire. Fire at least 2.5 dB over the countdown. Bites with gaps
  under −35 dB. The <70 Hz band at least 6 dB under 70–160 Hz in every section.
- −16 to −14 LUFS, peak ≤ −1 dBTP.
