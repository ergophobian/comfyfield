# The visual loop

The builder renders; somebody else grades. Each round has three steps: the **evidence pack** (pictures and
numbers anyone can make), the **sound-off viewer** (a fresh agent that sees only frames and says what they
show), and the **judge** (a fresh agent that scores, writes the fix list and the keep list). The builder then
fixes only the fix list and renders again. Up to 3 rounds; the fixes after round 3 ship without another judge.

Pass = **every criterion ≥ 8**. No averaging a low score away.

## 1. The evidence pack (the builder or lead makes it; `review/rN/`)

```
node engine/render.mjs review <project> --film out/draft-rN.mp4 --round N
```

From the rendered mp4 — the judge grades the real file, not the source — it makes: `sheet-a.jpg`, `sheet-b.jpg`…
(a frame every 0.5 s), `phone-1.jpg` (a frame a second at phone size: can it be read?), `frame0.png` (the
first frame alone), a `strip-…jpg` across every cut (12 frames at 1/15 s: pops, jumps, collisions). From the
project, exact and time-stamped: `key-moments.jpg` (0.15 s after every `hit` cue) and `scenes.jpg` (one frame
per scene, its caption typed). Plus `cues.json`, `evidence.md` (every picture and the time of every tile — for
the judge) and `evidence-blind.md` (the frames only — for the sound-off viewer). Add a strip of your own
(`ffmpeg -ss <t> -i film.mp4 -vf "fps=30,scale=320:-2,tile=6x2" -frames:v 1 strip.jpg`) for any fast moment
that isn't at a cut.

## 2. The sound-off viewer (fresh agent, sees frames only)

Prompt:

> You are a viewer with the sound off. You get contact sheets of a short video, listed with the time of every
> frame in `review/rN/evidence-blind.md`. For every frame, say in one line what
> you see and what you think is happening — plainly, as a first-time viewer, no guessing at intent. Then: what is
> the video about; what you'd remember; where you got lost or bored; anything you couldn't read on a phone;
> anything that looked broken (a pop, a clipped word, something through something, a frame that looks unfinished).
> Write `review/rN/blind.md`. Do not read any other file.

It must not read the story, the script, the code or the brief. Its value is not knowing.

## 3. The judge (fresh agent every round)

Prompt (fill the paths):

> You are the JUDGE of a code-drawn video. Be a harsh, specific reviewer; don't edit anything.
> Read: `story.md` (what each scene must make the viewer get, the captions), `style.md`, the criteria below,
> `review/rN/evidence.md` and every picture it lists (open each; zoom only on a doubt), the sound-off read
> `review/rN/blind.md`, and in rounds 2–3 the previous `review/r(N-1)/judge.md`. You may pull up to 8 more frames
> from `<film.mp4>` with ffmpeg on a doubt.
> Compare the sound-off read with what each scene should make the viewer get: every frame where it doesn't match
> is a miss under Clarity. Score every criterion 1–10 with a one-line reason and timestamps. In rounds 2–3 first
> mark each earlier fix fixed / partly / not fixed. Then write `review/rN/judge.md`: scores, verdict (pass =
> every score ≥ 8), a **KEEP list** (what works and must survive), a **FIX LIST** — only what lifts each score
> under 8 to 8, plus real errors at any score (a wrong fact or label, a cut-off word, something broken) — numbered,
> most important first, each as `timestamp · what's wrong · what the viewer must get instead · the score it
> lifts`, doable in an hour or two; never "make it look like X" — name the outcome. Then **Nice to have** (not for
> the fixer). In round 3 list only what a viewer would notice; its fixes ship unjudged.

## The criteria (each 1–10; what a 10 is)

1. **Hook** — frame 0 is a picture worth stopping for (subject whole, framed on purpose, already alive); at
   least 3 visible changes in the first 3 s with one motion the eye follows; the title/question is readable at
   once. Frame 0 blank or half a subject caps at 6.
2. **Clarity** — every scene makes the viewer get its idea from the picture within a moment of the caption
   arriving, by any means; the sound-off read matches the story. A missed story beat caps at 6.
3. **Drawing craft** — it looks hand-drawn by a skilled illustrator: confident ink, real shade and light, texture,
   the specific details the real thing has, one consistent hand across scenes; nothing reads as the wrong
   object; no flat placeholder shapes. Any scene that looks unfinished caps at 6.
4. **Composition** — one focal point per frame, big on a phone; subjects fill the picture area; nothing
   important clipped by the frame or hidden under text; the caption band stays clear.
5. **Motion** — eased, with weight (springs, overshoot, anticipation); a main motion per scene plus small life;
   no constant-speed slides (time-lapses excepted), no pops (things appearing with no entrance), no frozen
   stretches, no jitter at cuts. Seen in the strips.
6. **Transitions and variety** — scenes change in more than one way and each change suits its moment; laid out
   as a sheet, the scenes are different kinds of pictures (objects on paper, landscapes, diagrams, close-ups),
   not one layout refilled. One arrangement in more than half the scenes caps at 6.
7. **Readability** — every caption and label readable on a phone (`phone.jpg`): caption text ≥ ~4% of the frame
   height, labels ≥ ~2%, enough contrast on every background, nothing cut off, typing slow enough to read
   (each line fully on screen ≥ 1 s).
8. **Pacing and sync** — something new every 2–4 s; each key moment lands on its cue (the key-moments sheet
   shows it just after); captions arrive with their pictures, never late, never spoiling; the ending lands and
   holds.
9. **Truth** — every fact, label, map and number is right (check `research/facts.md`; spot-check anything that
   looks off). A false fact or a wrong map is an error at any score.
10. **Wow** — would a viewer think a studio made this and watch it twice? One moment they'd screenshot.

## The builder's fix round

Back up the scene files first (`backup-rN/`). Do the fix list in order; touch nothing on the keep list; ignore
"Nice to have". Check each fix on stills against the judge's exact "what the viewer must get" sentence, then
render once. Write `review/rN/fixed.md`: each fix number and what changed. Next round: new evidence pack, new
viewer, new judge.

## Record

Append every round's scores to `review/LOG.md` (round, date, each score, pass/fail). That file is the honest
history the hand-over quotes.
