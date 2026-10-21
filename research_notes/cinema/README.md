# Cinema journey evidence

Cinema plans an idea through the existing `/api/prompt` writer, validates 3–6 shots, and lets the creator edit prompts, camera moves, durations and continuity before Generate. The portal effect is the default example. An optional uploaded start frame uses the catalog model's image workflow.

Generate saves a Flow through the shared server store before rendering. Every shot has a `comfy-ltx25` model node and its own Approve gate. Gate edges enter Stitch in shot order. Cinema's manual Stitch node waits for an explicit click. Shot Rerun closes its approval gate and marks downstream Stitch outputs stale, without rerendering other shots. Send preserves those outputs; re-stitch is explicit. The shared Stitch editor handles preview, trim, music, export to Library and download.

The neighboring lane's runner, preflight, Router batch, generation hook, app page and recipes files are unchanged relative to main. PR #117 is integrated; its retry behavior and checks are retained. Cinema does not use synthetic format model ids or the format runner.

## What the screenshots prove

`scripts/cinema-ui-check.mjs` serves the production build with an isolated mock API. The planner and LTX runner are mocked; video fixtures are half-second synthetic test patterns, not generated visual effects. Flow validation, disk persistence, engine actions, local ffmpeg Stitch, export and byte-verified downloads are real. A separate server-store instance verifies that the saved Flow is visible through the same storage used by MCP tools. No provider routes or environment file are loaded; outbound provider fetches are blocked. No paid calls were made.

The journey runs independently at 1440px and 390px, with an invalid planner response, edited shot, optional image input, shot failure/retry, per-shot approval, replacement, blocked stale export, explicit re-stitch, Stitch failure/retry, Library persistence and Flow reopening. Every screenshot is labeled as a mock journey.

| Stage | Desktop | Mobile |
| --- | --- | --- |
| Editable plan and cost | [Plan](mock-plan-desktop.png) | [Plan](mock-plan-mobile.png) |
| Per-shot review | [Review](mock-review-desktop.png) | [Review](mock-review-mobile.png) |
| Replacement before re-stitch | [Replacement](mock-replace-desktop.png) | [Replacement](mock-replace-mobile.png) |
| Export and download | [Export](mock-export-desktop.png) | [Export](mock-export-mobile.png) |
| Library after reload | [Library](mock-library-desktop.png) | [Library](mock-library-mobile.png) |

## Live runs still needed

Run this bounded validation with a Comfy key configured in Connections, no Google key, and Instant selected to keep the evidence on Comfy Cloud. These are proposed runs, not runs performed by this branch.

1. Call the prompt writer once with the default portal idea. Confirm it returns a valid, editable three-shot plan. Reserve approximately $0.01 for text planning; its actual price is unverified here.
2. Before Generate, edit shot 2 and attach a creator-supplied still to shot 1. Use three five-second, 16:9 shots. Generate once: one `ltx25_i2v` job and two `ltx25_t2v` jobs, approximately $0.24 total Cloud compute. Confirm all three clips persist in Library and the saved Flow appears in Flows and MCP.
3. Review and Send all three shots. Stitch locally, export and download. Check order, duration, sound, visible portal transformation and continuity. No additional provider generation is needed for assembly.
4. Edit shot 2 and Rerun it once: one additional five-second `ltx25_t2v` job, approximately $0.08. Confirm only that job is billed, export remains blocked until reapproval and explicit re-stitch, and the downloaded scene contains the replacement in slot 2. Reopen the app to check persistence.

Exactly four video jobs: three text-to-video and one image-to-video. Estimated Cloud compute is $0.32, plus the planning allowance, approximately $0.33 total before retries or rate variation. The estimate uses the task audit's approximately $0.08 per five-second LTX clip and the existing shared estimate/money helpers; it is not a live provider quote. Longer shots scale that baseline linearly. Session billing can differ.

## Remaining limits

Live writer JSON reliability, Comfy Cloud execution, actual generation duration, sound and visual continuity still require the runs above. Continuity notes repeat the subject and setting; independent text shots do not guarantee identical characters or scenery. Optional start frames are chosen before Generate. Cinema's still-image composer remains the existing scaffold. Existing build chunk-size warnings remain.

## Validation results

Windows verification ran in `D:/comfyfield-lanes/cinema-33`; the Mac performed editing and lightweight Flow/theme checks only.

- `npx vite build`: passes, with the existing chunk-size warning.
- `node scripts/cinema-checks.mjs`: passes; planner validation, estimates, catalog resolution, image inputs, persistence and replacement safeguards.
- `node scripts/flow-checks.mjs`: all 25 checks pass after integrating #117.
- `node scripts/cinema-ui-check.mjs`: passes at 1440px and 390px, including the final cache-aware malformed-plan recovery check.
- `node scripts/verify.mjs` after integrating #117: 27 of 28 scripts pass. Only `pod-checks.mjs` fails, with the seven known Windows bash/path failures; no Pod files changed in this branch. All seven browser check scripts pass.

The complete suite ran on implementation commit `5de4746`. The final planner request-key correction in `90e7f0f` was separately rechecked with a production build and the Cinema unit/browser journey. Subsequent evidence commits contain documentation and screenshots only. The full local log is retained at `outputs/cinema-verify-windows.log` (ignored), with the remote copy at `D:/comfyfield-lanes/cinema-33/outputs/cinema-verify.log`.
