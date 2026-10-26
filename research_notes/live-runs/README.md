# Live backend proofs

Refs #71. The first real runs (two Pod proofs, 2026-10-25) are in [results-2026-10-25.md](results-2026-10-25.md); the ledger holds their rows with RunPod's billed amounts.

## Commands

Preview each complete backend proof without provider imports or network requests:

```sh
node scripts/live-run.mjs cloud --dry-run
node scripts/live-run.mjs router --dry-run
node scripts/live-run.mjs pod --dry-run
node scripts/live-run.mjs podself --dry-run
node scripts/live-run.mjs sweep --dry-run
```

Only after Kyle approves the spend, run one command per backend from this checkout:

```sh
node scripts/live-run.mjs cloud --allow-paid
node scripts/live-run.mjs router --allow-paid
node scripts/live-run.mjs pod --allow-paid
node scripts/live-run.mjs podself --allow-paid
```

`podself` proves that a Pod ends itself when its app is gone. It starts a proof Pod with a 15-minute deadline, then only reads it: no heartbeat and no app-side guard. The Pod's watchdog must terminate it with RunPod's pod-scoped key. The outside guard acts only five minutes after the deadline, so a Pod that ends itself in time is not ended by the harness.

`--cap 15` is the default total admission ceiling. It may be lowered, never raised above $15. `--max <dollars>` changes the command reservation; it cannot be below its planned estimate. Cloud splits that maximum 1:2 between its image and video. Pod reserves its entire maximum before creation, covering boot, all three generations, pause storage, resume, idle observation and teardown. Resume and Pod generations each have their own ledger row with zero *additional* cost because they draw from the original session reservation. Unknown or failed charges retain their maximum, including after a crash.

Use this recovery command to list and terminate **every live-proof Pod (name begins `comfyfield-live-`) on the connected account**, including paused Pods and ones missing from local state. It preserves the app's own Pods (`comfyfield-<time>`), which may be in use from another checkout, and unrelated Pods. Add `--all` to also end the app's Pods. It remains available when a stale proof lock prevents generations:

```sh
node scripts/live-run.mjs sweep
```

The harness sets `COMFYFIELD_POD_ADOPT_PREFIX=comfyfield-live-` before it loads the core, and passes it to its guard. Without it, `server/pod.js` adopts any ComfyField Pod it finds when this checkout has no `pod.json`, and its idle guard could then end the owner's Pod. The proof's empty-account checks also count only live-proof Pods.

Sweep outputs only Pod id, name, status and termination result, then lists again and fails if any ComfyField Pod remains. No account access or sweep was performed during implementation.

## Keys and prerequisites

In this checkout's Connections, save:

- Comfy API key: `comfy.key` in `.comfyfield/keys.json`, shared by Cloud and Router. Cloud needs workflow API access and credits; Router needs credits and access to the planned model.
- RunPod account API key: `runpod.key`, with Pod list/create/start/stop/delete permissions. The account needs credit and capacity on a fitting ladder GPU.

No fal, Google, ElevenLabs or Hugging Face key is needed. No shell credential is read: the runner removes provider environment fallbacks without reading their values before dynamically importing `server/core.js`. It pins the Connections home to this repository, disables local/sandbox routing, and never loads `.env`. The cleanup guard inherits only runtime paths. A dry run reads the saved file directly and prints booleans, never key values.

Do not run another app generation, another checkout's harness, or a separate provider client against the same approved budget during the proof. The ledger and exclusive lock coordinate this checkout's harness, not arbitrary clients or other ledger copies. Use one authoritative checkout and retain this ledger between runs.

## Proof plan and estimates

These are planning allowances, not provider billing quotes. Prices and model availability need rechecking before approving a real run.

| Backend | Proof | Planned cost | Default maximum |
| --- | --- | ---: | ---: |
| Cloud image | `image_flux`, `flux1-schnell-fp8.safetensors`, 4 steps, 512 × 512, batch 1 | $0.10 | $0.50 |
| Cloud video | `ltx25_t2v`, distilled int8 LTX-2.5, 128 × 128, 9 frames at 24 fps, batch 1 | $0.50 | $1.00 |
| Router | `luma/photon-flash-1`, one square image | $0.002717 | $0.01 |
| Pod | First in-stock fitting ladder rung; `image_sdxl` twice, pause, resume, confirm checkpoint before any new download, third run, observe ten-minute idle terminate, final sweep | $1.50 | $1.50 |
| Total | Cloud command includes both image and video | $2.102717 | $3.01 |

Cloud uses the app's `CLOUD_USD_PER_GPU_SEC = 4.54 / 3600`; schnell's model-file reference is four GPU-seconds (about $0.005), and LTX-2.5's full-size reference is 63 seconds (about $0.079). The allowances include uncertainty from cold loading and unmeasured runtime. The proof uses the existing distilled two-stage LTX graph with its smallest half-size latent (64 × 64), hence 128 × 128 output. Nine frames is its shortest moving `8n + 1` clip; a single-frame still would not prove motion. This deliberately tiny clip proves transport and Library persistence, not production quality. Cloud may reject these small dimensions or frame counts; that remains unverified until the approved run. There is no automatic larger retry.

Photon Flash 1 is the cheapest fixed-price text-to-image entry in the [published Router pricing table](https://docs.comfy.org/development/comfy-router/pricing), listed at $0.002717 per generation when checked on 2026-10-21. Native input/output follow its [published schema](https://docs.comfy.org/router-schemas/luma/photon-flash-1.json). The runner checks the complete authenticated Router catalog for this exact id before submission. The [catalog contract](https://docs.comfy.org/api-reference/router/comfy-router/list-the-models-comfy-router-can-run) does not expose prices. Consequently this is a pinned cheapest fixed-price proof, not a claim to rank token-priced or GPU-second models by an unknown eventual bill. A missing model fails without substituting a more expensive one.

Pod's $1.50 allowance is retained from #71. A live quote selects the first in-stock rung that fits SDXL and passes a 47-minute GPU plus disk allowance against the reservation; the runner pins that GPU rather than falling back to a more expensive one. The minimum app volume is 120 GB, plus a 50 GB container disk. Boot/download time, two boots and the idle observation are included. No Pod quote was requested during implementation.

## Spend ledger and output path

`research_notes/live-runs/ledger.jsonl` has one row per attempted billable operation, with `time`, `backend`, `model`, `action`, `estimatedCost`, `maximumCost`, nullable `actualCost`, local `runId`, nullable `providerRunId`, and `outcome`. The row is reserved and fsynced **before** submission; its provider id is persisted before polling. Completion atomically updates that same row, rather than counting a second charge. Errors persist the error class and status without storing provider bodies or signed URLs. The cap sums reported actuals when present and otherwise reservations. Corrupt/missing ledgers fail closed.

Cloud submits through `core.runComfy`, with its bundled `image_flux` graph patched in memory to schnell/four steps and the bundled `ltx25_t2v` unchanged. It pins `run: 'instant'` and bypasses Pod discovery. Router submits through `core.runComfyRouter`; Pod lifecycle, quote, preparation, leases and sweep use `core.pod()` / `server/pod.js`. There is no second provider implementation.

`core.saveToLibrary` retains local SDK outputs in `.comfyfield/media` and downloads Router media there too. It writes the same item shape consumed by `useGenerations` to `.comfyfield/generation-imports.json`. On app load, `/api/library/generations` imports these items into `comfyfield.library`, deduplicated by id; dismissing an imported item also removes its server import. Reload the app after a command to see its results in Library. No live media or rendered-media screenshots exist yet.

## Pod termination path

Existing guards remain intact:

1. `server/pod.js`: idle terminate at ten minutes, 20-minute dark terminate, boot failure, two-hour lifetime with a 30-minute busy drain.
2. `server/podBoot.js → podEnv → server/pod-statusd.py → watchdog → decide → terminate → kill-pod.sh`: the Pod independently terminates on 13-minute idle (app idle plus three-minute backup margin), missing heartbeat, boot failure or lifetime. `kill-pod.sh` tries GraphQL `podTerminate`, then runpodctl, then REST deletion, and the watchdog retries on failure.
3. The account key stays on the client. RunPod supplies its own pod-scoped `RUNPOD_API_KEY` inside the container. The app sends only a random `POD_TOKEN` to protect the status/proxy ports. This follows [runpodctl's pod-scoped key contract](https://github.com/runpod/runpodctl). The harness checks `selfTerminateReady` before generation; this confirms key presence, not successful authorization of a real termination.

Added proof guards:

1. `podProof → launchGuard`: starts a detached Node cleanup process and waits for its readiness message **before** creating a Pod. It uses `server/pod.js.sweep` with the unique `comfyfield-live-<proof id>` name. On parent death or at the 45-minute deadline, it repeatedly terminates that proof's running **or paused** Pod. It continues through the deadline plus a two-minute late-create margin; failed deletions keep retrying. A healthy proof disarms it only after cleanup and account-empty verification.
2. `podProof → manager.start({ proof }) → podEnv({ terminateAt }) → CF_TERMINATE_AT → statusd.decide`: absolute 45-minute deadline, checked before busy/drain rules. The original timestamp is part of the Pod env and survives a pause/resume, so resume cannot reset the proof budget. Saved idle settings are overridden to ten minutes for proof Pods. This also terminates a busy run if the harness disappears.
3. `podProof.finally → manager.sweep`: always attempts teardown, including exceptions during boot, run, pause or resume. A create with a lost response is recoverable by its unique account-visible name. The external guard covers the stopped interval, when no in-Pod process can run.

The guards protect a harness process crash. A paused Pod cannot self-terminate during a simultaneous loss of the entire client host; run sweep from another host in that case. Provider outages, revoked keys or a failed termination request can delay deletion. The $15 gate is a conservative admission cap, not a provider-enforced billing limit: Cloud cancellation is requested on a wait failure, and unknown costs retain reservations, but no local script can guarantee a vendor's eventual debit or a hard stop during a control-plane outage. Do not rerun an unknown request before reconciling its id and charge. No speculative request is retried as a new paid generation.

## Recovery and remaining evidence

If a run crashes, leave its reservation in the ledger. First run sweep, inspect the provider history by the recorded id, and reconcile `actualCost` only against reported billing. Once the owning process and guard are stopped and account cleanup is verified, move the stale `ledger.jsonl.lock` to trash (on macOS use `/usr/bin/trash`). Never clear a lock while its owner is alive. Commit the updated ledger after an approved run; never commit `.comfyfield/` or `.env`.

The real run still needs Kyle's spend approval, saved Connections keys, provider credits/access, GPU capacity, Cloud compatibility at the tiny LTX settings, and account cleanup verification. #71 remains open until real Library media, start/resume timing, model survival, ten-minute idle termination, scoped-key termination, per-backend spend and account-empty evidence have been captured. The Pod command prints its start/resume timing, model-survival check, output URLs and idle-termination reason when successful.
