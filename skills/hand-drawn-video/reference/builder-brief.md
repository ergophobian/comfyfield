# Builder brief — template (one copy per film, shared by every scene builder)

Copy this into the project as `BRIEF-builders.md` and fill every `<…>`. Each builder gets the same brief plus
the names of its own scenes; each scene belongs to exactly one builder. A filled example:
`examples/taco/BRIEF-builders.md`.

---

# Builder brief — "<film title>"

A <length> s, <W>x<H>, <fps> fps film drawn entirely in code on a canvas (no generated images or clips, no
photos). <One sentence: what it is about and its arc.> <Music only / narration>: the typed caption carries the
story.

## Files

- `<shared file>.js` — the timeline (bars; 1 bar = <s> s), `bar()`, `EIGHTH`, the palette `C`, the caption helper,
  the scene wrapper, shared helpers. **Read it. Don't edit it.**
- `<shared drawings>.js` — drawings more than one scene uses (call them so things match). Don't edit it.
- `kit/*.js` — the drawing kit. Don't edit it.
- `scenes/<id>.js` — **yours**. Helpers you write stay in your file, prefixed with your scene id (all scripts
  share one global scope).

## The look (every frame)

<From style.md: the ground, the line, fills and shade, the two or three kinds of shot, where the caption band and
any brand bug sit, what must always move, the detail level. Name outcomes, not other films to copy.>

## Your scene's timing

`s.lt` = seconds since the scene started; `s.t` = film time; `s.dur` = its length. The first `<dur>` s is the
transition in (draw fully from `lt = 0`); the scene is also drawn for ~0.5 s past its end.

| id | time (s) | transition in | kicker | caption lines (local start s) |
|---|---|---|---|---|
| <id> | <a–b> | <{type, dur, dir}> | <kicker> | <exact words> (<start>) |

Scene notes — what the viewer must get, and the one key moment (with its time); how it is drawn is the builder's:
- **<id>** — <…>

## Cues

For every key moment: `K.cue(time, '<id>: what happens', 'hit')` at the top of the file (film time, on the
<eighth> grid). 2–5 per scene; softer ones `'soft'`. No sound — the composer answers the cues.

## Kit API

<Paste the kit list from reference/craft.md, or point to it.>

## Check your own work

```
node <skill>/engine/render.mjs sheet <project> --from <a> --to <b+0.5> --every 0.25 --cols 7 --scale 0.3 --out <project>/out/<id>-sheet.jpg
node <skill>/engine/render.mjs stills <project> --times <t1>,<t2> --scale 0.6 --dir <project>/out/<id>-stills
node <skill>/engine/render.mjs strip <project> --at <fastest moment> --out <project>/out/<id>-strip.jpg
```

Open every picture and look hard; fix and look again until it would sit beside a professional illustrator's
work. Hunt for: a small or off-centre subject; empty paper where a world should be; something that reads as
the wrong thing; a shape with no shade; pops; constant-speed motion; anything in the caption band; clipped text;
a moment where nothing moves; a key moment off its cue. Fix every `[page error]`.

Don't render the full film, don't touch other scenes' files. Finish with a ≤ 10-line report: what each scene
shows, its cues (time + label), anything you're unsure of.
