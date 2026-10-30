# Example: "How this taco was made."

A 37.5 s, 1080x1080 film made with this skill (2026-10-29): a countdown from "2 years to dinner" to three bites, drawn
and scored entirely in code. Render it:

```
node ../../engine/render.mjs render . --out out/final.mp4 --workers 4
```

- `common.js` — the timeline on a 1.5 s bar grid, palette, caption helper, the ComfyField logo bug
- `taco.js`, `taco-folded.js` — the taco (exploded and folded), hero, apart, bites, end card; `scenes/` — one file a scene (built by three parallel builders from `BRIEF-builders.md`)
- `score.js` — the soundtrack (son jarocho band in code; its own instruments)
- `story.md`, `research/` — the story, the facts with sources, the reference's music measured
- `review/` — every visual-loop round: the sound-off read, the judge, what was fixed; `review/LOG.md` the scores
- `out/music-r*/` — every BGM-loop round: the report, the judge, the listens

The visual loop passed on round 3. The BGM loop ran its 2 rounds; blind listeners still split on "stock" (see
LOG.md) — the honest record is kept, not smoothed over.
