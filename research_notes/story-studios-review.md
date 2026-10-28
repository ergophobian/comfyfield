# Story studio review fixes

Implementation: `4aa5b83` on `story-studios`. The requested `git fetch origin` and rebase completed; `origin/main` was already included (`7ee3b1c`). All local edits stayed in `~/.t3/worktrees/comfyfield/t3-2d16bd1c`.

| Finding | Resolution |
| --- | --- |
| 1. Animation retry repurchases an image | Image and motion now run as separate formats through the shared runner and Library adapter. Each successful step enters the draft cache immediately. A failed animation retries motion alone. The regression deliberately fails `ltx25_i2v` and asserts the sequence image, failed motion, retried motion, speech. Stitch-failure reuse remains covered. |
| 2. Session requirements discovered after spending | A read-only plan reads every possible workflow before the first writer call, and every approved workflow before rendering. It aggregates `minVramOf`, `notOnCloud` and architecture requirements. An undersized or unavailable Session is refused before billing; no Session starts automatically from planning. A 24 GB Session cannot start the 32 GB animated pipeline. |
| 3. Editable controls with frozen values | Native fieldsets lock page settings from drafting through completion. Edit settings discards the draft and retry cache and unlocks the controls. Browser checks exercise locking, discard and drafting again. |
| 4. Missing estimates and writer disclosure | Shot approval shows a total and a per-shot render estimate, recomputed after shot edits. Prices use the shared `estimate()` function, graph reference runtimes and the Cloud rate or current Session rate and speed. Writer billing on Write script and Approve script is disclosed before either click. Estimates explicitly exclude writers, startup, downloads, storage and idle time. |
| 5. Long scenes freeze after five seconds | Fully animated generated shots must fit five seconds and ten narration words before approval. The shot writer receives the same limits. Stitch speeds up narration that exceeds the five-second cap, preserving its words. A 20-second shot is rejected in both runner and browser checks. |
| 6. Unavailable saved voices | Faceless and Explainer use inline sample upload instead of the empty Library voice picker. The uploaded app-media sample reaches the speech workflow's voice input. Browser checks upload an actual synthetic audio file and verify its returned URL in the speech request; no fabricated saved-voice entries are used. Without a sample the copy identifies the default speech voice. |
| 7. Unbounded text imports | Validate the complete selection before reading: text or Markdown only, at most five attachments, 100 KB each and 200 KB total. Faceless accepts one script. Reads are sequential and the combined writer context is capped at 50,000 attachment characters. Truncation is recorded and visibly disclosed. Invalid count, type, individual size and total size are checked without reading any file. |
| 8. Restyle duration exceeds the frame cap | The server inspects source fps before drafting, then checks both the fps-derived range and a bounded decoded frame count before approval/rendering. Bernini receives at most 81 frames, including variable-rate footage. Checks cover the 1.35-second limit at 60 fps and an actual-count overflow. |

The still-frame option now says the images are held for each scene; it no longer promises movement.

Stitch download handling is isolated in `server/stitchMedia.js`: a 200 MB limit, a 30-second deadline covering headers and body, streaming to disk, and cleanup of partial downloads. Local inputs must be app `/media/` paths; traversal, arbitrary local paths and links outside the media directory are refused. Render directories are removed after success, failure and timeout. The timeout waits for ffmpeg to exit before cleanup. The main Stitch diff remains small for integration with `ads-studios`.

Global format totals in checks now derive from the catalog and validation results. `scripts/verify.mjs`, RunPod files and `comfyTarget` were not edited. The widget browser fixture can choose another free port when Vite's default is occupied.

## Validation

Passed on implementation commit `4aa5b834c1d3e1d4d401631c8adc33fcad95a3bf`. All builds, checks, browser fixtures and ffmpeg work run sequentially in the scratch clone `C:/comfyfield-story-fixes-2d16` on `<windows-host>`; no heavy checks run on the Mac. Provider credentials are removed from the validation process environment before the final run. Providers are mocked; paid spend is zero.

Check output:

```text
npx vite build
336 modules transformed; built in 3.12s
node scripts/verify.mjs
19/19 check scripts passed
Story regressions passed: animation retry, pipeline preflight, estimates, scene caps, source frames and bounded imports
Stitch media checks passed: app paths only, streamed downloads, size caps, body timeout and partial cleanup
Story page checks passed: all three pages, both approvals, mock providers, real ffmpeg, playback, Library, dependency error and 390px layouts
```

The build retains the existing advisory about a bundle larger than 500 kB. The Windows source directories were clean at the tested commit; the follow-up evidence commit changes only this report and screenshots.

The Windows validation process uses Git Bash rather than the WSL Bash shim, which cannot open the Windows fixture paths. An earlier full run exposed the shim selection; another encountered an occupied default browser-fixture port. Neither failure required changes to RunPod code or the verifier.

Refreshed screenshots are labeled `mock-` in `research_notes/screenshots/story-studios/`: desktop review, finished desktop and finished 390px captures for each studio. They show real page rendering, runner approvals, ffmpeg playback and Library persistence with synthetic provider media, and do not prove live model output.
