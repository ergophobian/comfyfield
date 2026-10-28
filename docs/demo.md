# Competition recording kit

Record on October 28, 2026. Target length: 120 seconds. This kit makes no paid calls. Live provider execution and the finished media are still required from the separately authorized generation lane. Do not describe offline check screenshots as provider proof.

## Recording setup

Use a 1440 × 900 browser viewport, readable zoom, and a clean recording profile. Start the app on Windows after the build and offline checks. Keep one app server, one browser, and one terminal. Set the same explicit `COMFYFIELD_HOME` for the app, the seed command and the MCP client. Never show Connections, keys, request headers or account balances in the recording. Select **Instant** in the run-type control; this forces Comfy Cloud rather than adopting a ready Pod.

Prepare three tabs: `/cinema`, `/image`, `/flows`. Pin the real finished scene video locally for the opening. Keep the repository page and `docs/setup.md` ready for the closing. Record the complete real generation journey first; edit it down to the fixed runtime. Rendering has no 33-second completion guarantee. Use an overlay **Live submission · wait shortened** when cutting time out of one continuous real run. If switching to a different earlier run, use **Pre-generated · recorded earlier** throughout that footage instead. Never splice earlier results into a current job's progress as if it completed.

The free portal example is the fixed three-shot idea. It avoids an unbudgeted text-planner call. If **Plan shots** is shown, that is an additional paid text request, requires separate authorization and has a variable result; it is not part of this budget. For this recording click **Try the portal effect**.

## The 120-second script

| Time | Exact actions and visible content | Voiceover | On-screen label and provenance |
| --- | --- | --- | --- |
| 0–12 s | Play the real exported 15-second scene from its final reveal, then cut to ComfyField with `/cinema` ready. | “ComfyField turns one idea into an editable scene. Direct each shot, approve the takes, and export a film—with your own model keys.” | “ComfyField · local-first creative studio”; “Pre-generated · recorded earlier” on opening media. |
| 12–23 s | Open **Video → Cinema studio** (`/cinema`, video mode). Scroll to **Your cinematic idea**. Paste the idea below, click **Try the portal effect**, show **Review your shot plan** and the three editable shot cards. Leave start frames empty and durations at **5 seconds**. | “Start with an idea. This built-in plan is editable before we spend anything.” | “Free built-in shot plan”. |
| 23–45 s | Show **Whole scene · ≈$0.24**, then click **Generate scene** once. Capture the actual queued/rendering text and progress bar on each Cinema shot card. Cut waiting time only after preserving a continuous raw take with the job evidence. | “Three LTX-2.5 shots, running on Comfy Cloud. Progress comes from the running jobs.” | “Live submission · wait shortened” if time-compressed. If using the earlier real take instead: “Pre-generated · recorded earlier”. |
| 45–54 s | Review previews. Click **Approve and Send shot 1**, then **Approve and Send shot 3**. On shot 2 change **Camera move** to “Slow push toward the forming portal”. Click **Rerun shot 2 · ≈$0.08** once; capture the actual replacement render, then click **Approve and Send shot 2**. | “Approve the keepers. Change one camera move and regenerate only that shot.” | “Only shot 2 regenerates”. Wait shortened or recorded-earlier label as above; never hide a failed run. |
| 54–65 s | Scroll to **Assemble your scene**. Verify order 1, 2, 3. Click **Stitch scene** (or **Re-stitch** if a preview existed). Play **Stitch preview**. Click **Export to Assets**, then **Download video**; reveal the downloaded `.mp4`. | “Stitch the approved shots locally, save to the Library, and download the finished video.” | “Local stitch and export · no generation credits”. These clicks can be live using already completed real clips. |
| 65–85 s | Open **Image → Create image** (`/image`). Click the current model chip, search “Flux 2 Pro”, choose **Flux 2 Pro · via Comfy Router**. Use **Single**, **Images per run: 1**, **Aspect ratio → 1:1**. Turn prompt enhancement off. Click **Add reference images**, choose **Upload** and the source cup photo. Paste the edit prompt below, click **Generate** once. Show input and real output together. | “The same studio handles image editing. Change the cup’s color while keeping the composition.” | “Comfy Router · Flux 2 Pro”; real wait shortened or recorded-earlier label as appropriate. Source photo is labeled as imported. |
| 85–105 s | Open `/flows`, use **Flows** menu to select the Cinema flow or the prepared “Recording · agent prompt edit” flow. Select its prompt/model node so the field is visible. Run the timed MCP command below in the visible terminal. Keep the canvas in frame as **Demo agent** cursor and “Demo agent is working on this” badge appear and the text changes. Do not click **Run**. | “An agent uses the same saved flow through MCP. Watch its cursor edit this node; execution still waits for us.” | “Live local MCP edit · no generation”. The script is a deterministic MCP client, not an autonomous language-model planning session. |
| 105–120 s | Open `github.com/ergophobian/comfyfield`. Show `docs/setup.md`, then the final scene thumbnail. | “Open source. Bring your keys, start locally, and build with Comfy Cloud and Comfy Router. Clone ComfyField and make something.” | “github.com/ergophobian/comfyfield”; setup: “Node 22+ · npm ci · npm run dev”. |

Do not try to fit uncapped waiting inside a single 120-second take. Approvals and exports should show actual working controls; a render error blocks that segment until the generation lane resolves it. Imported clips can be stitched via **Add clips** without running a model, but label this as an assembly of pre-generated clips, not as a freshly rendered Cinema run.

## Recorded cut, October 27

The submitted cut was made without a live take and without paid calls. It is 115 seconds, 1920 × 1080, with burned-in captions, a matching `.srt` and an ffmpeg-synthesized pad under the clips' own LTX audio. The video files are not committed.

| Time | Segment | Source and label |
| --- | --- | --- |
| 0–10 s | The folded alley, shots 1–3 with their own sound, title "ComfyField · one idea, a finished scene" | The October 26 LTX-2.5 renders on Comfy Cloud (`site/assets/provenance.md`). "Rendered earlier with LTX-2.5 on Comfy Cloud". |
| 10–35 s | `/cinema`: type the idea, **Try the portal effect**, change shot 2's camera move, show **Whole scene · ≈$0.24**. **Generate scene** is not clicked. | Live app. "Cinema studio · free built-in plan". |
| 35–42 s | The three shots side by side | Same renders, same label. |
| 42–66 s | Flows: a Stitch node, **Add clips** with the three renders, **Stitch scene**, preview, **Export to Assets**, **Download video** | Live app, local ffmpeg. "Local stitch · no credits". |
| 66–77 s | The portal plan as a Flow: three LTX-2.5 nodes behind Approve gates, one Approve panel open | `cinemaFlow` output created through the MCP `create_flow` tool; nothing run. "The same plan as a saved Flow". |
| 77–97 s | `scripts/demo-agent.mjs --flow <id> --node prompt` edits **Recording · agent prompt edit**; the Demo agent cursor and badge appear; its real terminal output is overlaid | "Live local MCP edit · no generation"; the terminal overlay names it a scripted MCP client. |
| 97–109 s | `site/` served with `python3 -m http.server` | The domain goes live October 29. |
| 109–115 s | End card: github.com/ergophobian/comfyfield, "Bring your own Comfy key · MIT" | — |

Differences from the script above: no live Generate or Rerun, and no Flux 2 Pro cup edit (no owned source photo and no budget). Stitch is shown on the Flows canvas because the Cinema assembly panel appears only after **Generate scene**. Captions replace the voiceover.

While recording, switching from a flow with a Stitch node to a flow without that node blanked the page (`stitchInputs` in `src/lib/stitch.js` received an undefined node). Reload `/flows` with the next flow selected instead of switching from the Flows menu.

## Fixed Cinema prompts

Idea (the built-in example, exact text):

> A courier in a silver raincoat finds a glowing portal in a rain-soaked alley. The ring materialises from sparks, folds the street upward, and opens onto a sunlit ocean. Three cinematic shots, one continuous magical event.

Scene title: **The folded alley**. All shots: 5 seconds, 16:9, one take, no start frame. Code appends `Camera: <camera>` and `Continuity: <notes>` to each prompt.

| Shot | Prompt | Camera move | Continuity notes |
| --- | --- | --- | --- |
| 1 | A courier in a silver raincoat stops in a rain-soaked alley. Violet sparks trace a ring in the wet air, reflecting in the pavement. | Slow dolly toward the ring | Silver raincoat, black satchel, violet rim light, courier faces screen right. |
| 2 | A glowing violet portal unfolds in a rain-soaked alley beside a courier in a silver raincoat. The street bends upward like a sheet, bricks lifting into an arch. | Low orbit around the forming portal | Silver raincoat, black satchel, violet rim light, courier faces screen right. |
| 3 | A courier in a silver raincoat steps through a violet portal in the folded alley. A sunlit ocean appears inside the ring; sea spray spills onto wet pavement. | Track right behind the courier | Silver raincoat, black satchel, violet rim light, courier exits screen right. |

Replacement: keep shot 2's prompt and continuity, replace only its camera move with **Slow push toward the forming portal**. Prompt repetition helps continuity but does not establish identity quality; select the real takes after review.

## Second workflow

Use one real, owned 1024 × 1024 photo of a single red ceramic cup on a wooden table in soft daylight. Include its handle and shadow; no people, labels or competing objects. Filename: `source-cup.png`. Import it as `source-photo` below, or upload it directly. The input photo must exist before recording; this kit does not fabricate it.

Model: `comfy-router-flux`, endpoint `bfl/flux-2-pro`, Comfy Router. One output, 1024 × 1024, no enhancement, no additional references. Exact prompt:

> Change only the red ceramic cup to cobalt blue. Preserve the cup shape, handle, wooden table, framing, soft daylight and shadows. Add nothing else.

`comfyRouterInput` maps this to `{ prompt, width: 1024, height: 1024, input_image: <uploaded photo> }`; the core converts local media to provider-readable image data. This is an image-edit workflow, not a product identity claim.

## Cost plan from this checkout

Run on Windows, without keys or paid flags:

```sh
node scripts/live-run.mjs cloud --dry-run
node scripts/demo-plan.mjs
```

Both commands are key-free. `live-run` dry-run never imports the provider core or opens Connections; its key-presence booleans are unchecked placeholders, not an assertion that keys are absent. It checks the existing central ledger and the exclusive run lock. Its plan is a smoke proof, not the full Cinema run. `demo-plan` prints exact mapped inputs without submitting anything. Estimates below are repository snapshots, not current provider quotes or spend authorization.

| Plan/job | Model/workflow | Resolution | Output seconds | Estimate | Harness reservation maximum |
| --- | --- | --- | --- | --- | --- |
| Minimal cloud proof, job 1 | Flux schnell; `image_flux`, checkpoint `flux1-schnell-fp8.safetensors`, 4 steps, seed 71 | 512 × 512 | Still | $0.10 | $0.50 |
| Minimal cloud proof, job 2 | LTX-2.5; `ltx25_t2v`, seed 71, 9 frames at 24 fps | 128 × 128 | 0.375 encoded; 8 frame intervals | $0.50 | $1.00 |
| Minimal cloud proof total | Two submissions; LTX-only component is job 2 | — | — | **$0.60** | **$1.50** |
| Cinema shot 1 | `comfy-ltx25` / `ltx25_t2v` | 1280 × 704 | 5 nominal; 121 frames at 24 fps | $0.08 | No harness cap on the Cinema UI |
| Cinema shot 2 | Same | 1280 × 704 | 5 nominal; 121 frames | $0.08 | Same |
| Cinema shot 3 | Same | 1280 × 704 | 5 nominal; 121 frames | $0.08 | Same |
| Regenerate shot 2 | Same, new camera move and random seed | 1280 × 704 | 5 nominal; 121 frames | $0.08 | Same |
| Cup color edit | `comfy-router-flux` / `bfl/flux-2-pro` | 1024 × 1024 | Still | ≈$0.030256 | No harness cap on this UI job |
| Cinema + regenerate + edit total | Five generation submissions | — | 20 generated nominal video seconds; 15-second final scene | **≈$0.350256** | Requires separately approved budget |
| Stitch and export | Local ffmpeg | 16:9 output | Approved clips joined | $0 generation credits | Local compute only |

`cinemaCost` uses $0.08/5 s. The independent shared compute estimate uses 63 GPU seconds per LTX clip × ($4.54/3600) = $0.07945 each. Thus four clips + the edit total ≈$0.348056 using shared compute, versus the displayed Cinema budget ≈$0.350256. The edit uses 24 typical GPU seconds × ($0.266/211). These are GPU-time estimates, not a fixed per-image price. The tiny proof's deliberately conservative $0.50 estimate is not the full-resolution Cinema price. Running both the standard proof and the recording jobs estimates ≈$0.950256 before any extra retries/planning. Source-photo creation, any text-planner call and any extra takes are excluded and need separate budgeting.

LTX graphs load the distilled 22B int8 LTX-2.5 transformer, Gemma encoder, video/audio decoders, latent upscaler, and run 8 + 3 sampling steps. Output is H.264 video with audio. The minimal 9-frame clip proves plumbing only; it cannot prove final resolution, duration, continuity or visual quality. A full-size shot is needed before declaring the recording lane ready.

## Ledger, identity and timeout rules

`research_notes/live-runs/ledger.jsonl` is the harness's central ledger. Before submitting, `paidCall` durably reserves `maximumCost`, with a fresh local `runId`, then records `providerRunId` through `onSubmitted`. Unknown actual cost continues to consume the maximum. The existing ledger already contains earlier runs; do not erase or zero it. A lock excludes concurrent harness runs; a crash leaves it for deliberate recovery. Actual Cloud cost is currently reported as null even on success; recorded GPU seconds do not automatically settle the ledger.

Router calls carry `Idempotency-Key: runId`. The UI's planner/Router paths retain logical keys for ambiguous retries, but an intentional edited prompt is a new logical request. Cloud graph submissions do **not** use the ledger `runId` as provider idempotency. Re-invoking the harness creates new ids and submissions: it is not a resume command. Cinema UI jobs do not pass through the harness's central spend ledger or enforce its cap. Do not claim otherwise.

The cloud proof gives each job a timeout derived from its reserved maximum / `CLOUD_USD_PER_GPU_SEC`: approximately 396.475 seconds for Flux and 792.951 seconds for LTX at default reservations. General Cloud runs default to a 30-minute wait. On wait failure, the core attempts `job.cancel()`; a failed cancel sets `uncancelled` to the provider job id. Cancellation response is not billing reconciliation.

After timeout, interruption, uncertain submit or restart: stop. Never press Generate, Rerun, Retry or re-invoke the harness to recover that logical job. Preserve raw evidence and the local run/job id, provider job id, timestamps and model. Check that exact provider id in Comfy Cloud history (or Router request history) to establish terminal status, recover successful output and reconcile actual billing before considering any separate new take. If `providerRunId` is null, acceptance is unknown: find the job by timestamp/model in provider history; do not interpret null as rejection. Keep the ledger reservation until billing is known. A server restart marks unfinished local jobs interrupted; it does not reattach to Cloud, and local `jobs.json` ids are not provider ids. The current UI does not persist every Cloud provider id, so retain provider history alongside the raw recording. Automatic Cloud reattachment/reconciliation is not supplied by this kit. If history cannot resolve acceptance, that recording segment is blocked; use an explicitly labeled earlier completed run.

## Visible agent edit

This client launches the actual local stdio MCP server, calls `get_flow`, then `update_node` after a visible delay. It never calls `run_flow`, `generate`, a writer or an external agent provider. It inherits only operating-system essentials, not provider environment keys. It does not load an env file. The app must run against the same explicit home; the user must open the selected flow (MCP reads do not navigate their browser).

Create the recording-only flow once, with enough time to select it:

```sh
node scripts/demo-agent.mjs --home D:/comfyfield-lanes/l4/recording --delay 15000 --hold 6000
```

Open **Flows → Recording · agent prompt edit**, select the left prompt node and leave its panel visible. The command prints its flow id. For the actual take, repeat against that flow with different starting text, or target the real Cinema shot 2 using its saved flow id:

```sh
node scripts/demo-agent.mjs --home D:/comfyfield-lanes/l4/recording --flow <saved-flow-id> --node shot-2 --delay 5000 --hold 6000 --prompt "A violet portal opens over wet cobblestones. Camera: Slow push toward the forming portal. Continuity: Silver raincoat, black satchel, violet rim light, courier faces screen right."
```

For the default recording-only flow use `--node prompt` and omit `--prompt` to apply: “A red ceramic cup on wet slate, morning sunlight, steam curling above the rim, slow push in”. Restore a different starting prompt in the panel before every retake so the edit is visible. On a Cinema model node this changes the actual Flow prompt, not `cinemaShot` editor metadata; record that edit on the canvas, and do not imply it rendered or return to Cinema to regenerate it.

Terminal presence is active for 8 seconds after the tool, then fades; default hold is 6 seconds, then the MCP session exits and leaves the roster. Disk watchers propagate the edit in about half a second. The production canvas draws the named cursor and node badge. Offline evidence is `scripts/demo-kit-ui-checks.mjs`: the real separate MCP process edits the disk-backed flow; the production browser displays the new prompt, cursor and badge; exit removes presence. Existing `agent-presence-checks`, `flow-sync-checks` and `agent-ui-checks` cover the underlying roster, event merge, motion, fade and mobile layout.

## Seed real media into the Library

The existing `core.saveMedia` + `core.saveToLibrary` adapter is used by `scripts/demo-seed.mjs`. Only local files are accepted; no downloading, key reads or generations. Stop other Library import/generation writers during seeding because the adapter is a read/append/write file store. The script validates the entire manifest before writing, copies bytes to the app's media directory and imports normal Library items. Matching byte hash + caption is reused on repeated runs. It does not inject flow outputs, approval states or job progress.

Create an untracked manifest outside the checkout. Replace the example paths and job ids with actual evidence; placeholders below must never be used as real provenance:

```json
{
  "items": [
    { "file": "source-cup.png", "label": "Cup source", "source": "source-photo", "model": "Owned photograph", "aspect": "1:1" },
    { "file": "shot-1.mp4", "label": "The folded alley · shot 1", "source": "pre-generated", "model": "LTX-2.5", "provider": "Comfy Cloud", "providerJobId": "replace-with-real-job-id", "aspect": "16:9" },
    { "file": "cup-blue.png", "label": "Cup edit", "source": "pre-generated", "model": "Flux 2 Pro", "provider": "Comfy Router", "providerJobId": "replace-with-real-request-id", "aspect": "1:1" }
  ]
}
```

Add shot 2, shot 3 and the replacement shot 2 with their own real files/job ids. For an assembled final export, retain its constituent job evidence and seed the four original provider clips; use the app's actual Stitch/export path to create the final Library item. A supplied job id is operator-attested metadata, not a provider verification performed by this script.

```sh
node scripts/demo-seed.mjs --home D:/comfyfield-lanes/l4/recording --manifest D:/comfyfield-lanes/l4/recording-media/media.json
```

Reload `/assets` and select **Generations**. Captions and model labels visibly begin **Pre-generated · recorded earlier** or **Source photo · imported**. Each import retains `demoSource.sha256`, provider and provider job id for audit. Keep the recorded-earlier overlay when presenting imported media even if a player hides its caption. No generated media ships in this branch. Never use check fixtures, synthetic test clips or mock screenshots as competition outputs.

## Recording checklist

- [ ] Build and all offline check outcomes recorded against the exact candidate commit on Windows; no Mac builds or installs.
- [ ] Separately authorized generation lane supplies a full-resolution real LTX proof, all three shots, one replacement and the real cup edit, with job ids and billing evidence.
- [ ] Review identity, portal progression, continuity, motion, image edit preservation and all clip audio. Drop or replace unusable takes only within a separately approved budget.
- [ ] App uses Instant; correct home and recording profile; source photo and all pre-generated items labeled; no secrets visible.
- [ ] Verify a real progress event in the raw capture; no fake percentages or substituted result under a live label.
- [ ] Test per-shot approval, isolated shot 2 rerun, explicit stitch/re-stitch, export, real downloaded video playback and Library persistence.
- [ ] Run agent script against the visible flow and correct node; confirm prompt changes and cursor/badge are readable; reset prompt for retakes.
- [ ] Keep full raw takes and evidence; label time compression and earlier footage; do not imply a 120-second wall-clock generation.
- [ ] Cut to exactly 120 seconds using the fixed windows. Check every on-screen label uses sentence case, speech is clear, and closing URL is readable.
- [ ] Stop every app/fixture server started by this lane. No push, pull request or changes to main.
