# Cinema journey evidence

Cinema plans an idea through the existing `/api/prompt` writer, validates 2–6 shots, and lets the creator edit prompts, camera moves, durations and continuity before Generate. Try the portal effect loads a built-in three-shot plan without a writer request; all three shots use LTX-2.5 for five seconds each. An optional uploaded start frame uses the catalog model's image workflow.

Generate saves a Flow through the shared server store before rendering. Every shot has a `comfy-ltx25` model node and its own Approve gate. Gate edges enter Stitch in shot order. Cinema's manual Stitch node waits for an explicit click. Shot Rerun closes its approval gate and marks downstream Stitch outputs stale, without rerendering other shots. Send preserves those outputs; re-stitch is explicit. The canvas labels the old cut “Out of date, stitch again” and excludes it from downstream results until re-stitching. Export stays blocked. The shared Stitch editor handles preview, trim, music, export to Library and download.

The neighboring lane's runner, preflight, Router batch, generation hook, app page and recipes files are unchanged relative to main. PR #117 is integrated; its retry behavior and checks are retained. Cinema does not use synthetic format model ids or the format runner.

## What the screenshots prove

`scripts/cinema-ui-check.mjs` serves the production build with an isolated mock API. The planner and LTX runner are mocked; video fixtures are half-second synthetic test patterns, not generated visual effects. Flow validation, disk persistence, engine actions, local ffmpeg Stitch, export and byte-verified downloads are real. A separate server-store instance verifies that the saved Flow is visible through the same storage used by MCP tools. No provider routes or environment file are loaded; outbound provider fetches are blocked. No paid calls were made.

The journey runs at 1440px and 390px. Desktop checks malformed plans, terminal writer failures (including successful HTTP responses and insufficient credits), and retryable failures with cached request keys. Mobile restarts the scene, verifies the old plan stays cleared after reload, and loads the built-in example with no writer call. Both cover edited shots, per-shot approval, replacement, stale canvas results, blocked export, explicit re-stitch, Library persistence and Flow reopening. Mobile also checks an optional image input and shot/Stitch failure recovery. Every screenshot is labeled as a mock journey.

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

## Review regressions

- Planner failures retain their key only when `keepRequestKey` allows reconciliation; terminal failures start fresh. Completed malformed plans also start fresh.
- Planner parsing extracts a balanced scene object from surrounding prose or code fences, respecting quoted braces and escaped quotes. Numeric durations snap to the nearest supported 5, 8 or 10 seconds. Two shots are accepted; fewer than two, missing fields and invalid durations fail with clear messages.
- The planner sends `promptOnly: false` to omit the generation-prompt suffix in both Router and Google payloads. Other writers retain the suffix by default.
- Plan another scene clears the plan and Flow reference. Stale Stitch output cannot appear as a current canvas result or be exported.

## Validation results

Windows verification ran in `D:/comfyfield-lanes/cinema-regressions-bba702e0`. The Mac performed editing and evidence inspection only. Provider key variables were removed from the test process; the writer payload checks use isolated fake saved keys and intercepted network calls.

- `npx vite build`: passes, with the existing chunk-size warning.
- `node scripts/cinema-checks.mjs`: passes; balanced JSON extraction, duration normalization, two-shot plans, the built-in example, both writer payloads, estimates, catalog resolution, image inputs, persistence and replacement safeguards.
- `node scripts/flow-checks.mjs`: all 25 checks pass, including stale cut exclusion and restoration after re-stitching.
- `node scripts/cinema-ui-check.mjs`: passes; covers desktop planner key recovery, the mobile built-in plan, persisted scene reset, stale canvas results, blocked export and the complete 1440px/390px journey.

- `node scripts/verify.mjs`: 27 of 28 scripts pass. Only `pod-checks.mjs` fails, with the seven known Windows bash/path failures. All seven browser check scripts pass. No Pod files changed.

The tested source diff on Windows matches the local source diff exactly.

The current build and full verification logs are retained on Windows at `D:/comfyfield-lanes/cinema-bba702e0-build.log` and `D:/comfyfield-lanes/cinema-bba702e0-verify.log`, with local copies under the ignored `outputs/` directory.
