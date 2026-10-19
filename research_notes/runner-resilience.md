# Runner resilience

The format runner retains one in-memory session across failures, approvals and retries. Generation adapters still receive `(model, options, metadata)` and persist results to the Library. The existing `flow`, `engine`, `results()`, `send(id)` and `sendWriter(id)` members and successful return shapes remain available. Failures reject with an Error carrying `error.session`; existing catch-based page handling continues to work.

## Session api

```js
let session
try {
  session = await gens.generateFormat(format, values, {
    onSession: (current) => { session = current; setSession(current) },
    onChange: (_, current) => setError(current.error?.message || null),
  })
} catch (error) {
  session = error.session
  setError(error.message)
}
// The same catch/error display applies to retry and Send operations.
await session.retry(stepId)
await session.retryFailed()
```

- `id` and `formatRunId` are aliases. Library metadata keeps that original `formatRunId` through retries, including #111's session reconciliation.
- `retry(stepId)` retries failed units in that step, then downstream steps without output. `retryFailed()` does the same for all failed steps. Successful takes and Library files stay intact. With nothing failed, neither operation makes generation requests. Neither opens an approval or writer gate.
- A failed take retains `status: 'failed'`, `error` and any provider `code` and `reason` in `engine.state`. `session.failures` adds the step id. `session.error` is an Error with `session` attached; `session.reason` is `{ code, stepId?, message, ...details }`. `session.ok` reflects current failures. Initial validation and preflight failures reject with the same retained-session contract.
- `send` and `sendWriter` retain successful `ok`, `ran` and `reason` shapes, and reject on generation/preflight failures with `error.session`. A stored failure does not prevent the engine from opening a gate for available outputs. Retry downstream failures through the session. `start()` fills gaps and resumes a session blocked before execution.
- `busy` covers planning, queued requests, execution and Send/retry operations. `onSession` exposes the session before planning; `onChange(state, session)` and the existing engine subscription let pages repaint live getters. The hook repaints automatically, and its `busy` includes preflight. Disable Run and editable inputs while the relevant session is busy. Overlapping actions on one session resolve with a `busy` reason.
- Every `generateFormat` call creates its own session. Different per-shot calls with the same format id run independently, including Photodump's concurrent calls. Pages prevent duplicate clicks with the busy signal. The session captures values at creation; retry uses those original values.
- Adapter options persist by engine step and unit across failures. Router batches retain completed internal calls and the original idempotency keys/body after ambiguous failures. Writer requests retain their key too, including through the hook. Explicit engine Rerun after success gets fresh adapter state. This extends #108's `routerBatch.js` contract rather than replacing it. In-memory retention does not promise recovery after reload/process loss or an unlimited provider idempotency retention window.
- Library Retry routes through the owning session's `retry(stepId)`. Only the exact failed Library item being queued again is replaced. Another take starting in the same step does not remove failed siblings; successful Router files remain visible. Ordinary single-generation retry keeps its existing behavior and stable fourth `execute` item-id argument.

## Approval limitation

Sending a partially successful upstream step freezes the gate's current selection. If another upstream take later recovers, it does not join that already-sent gate. The page must explicitly reopen the gate for re-review (`engine.clearGate(flow, gateId)`), let the user review the recovered takes, then Send again. Send still preserves downstream nodes that already have output; retry does not expand a partially completed downstream node. To include newly reviewed takes there, the user must explicitly Rerun that downstream step. Do not silently reopen gates, regenerate completed outputs or start a fresh whole-pipeline run as recovery.

## Preflight and estimates

```js
import { preflight } from '../lib/formats/runner.js'
const plan = await preflight(format, values, { runType: 'instant' })
if (!plan.ok) setError(plan.reason.message)
```

Preflight compiles every selected step, input binding, upstream image and step behind a gate before calling any writer or generation adapter. The read-only `POST /api/comfy/requirements` endpoint accepts `{ workflows: [{ workflow, vars }], runType? }`. Invalid/null entries or vars return 400. It returns connection booleans, writer providers, target context and requirements per workflow. No download, Pod start, upload or paid generation occurs.

Core's requirements endpoint and `runComfy` share `resolveComfyRoute` and `cloudGraphOf`; the client does not select Cloud alternates or copy the target policy. That resolver includes #112's server `cloudWorkflows` map and catalog `cloudImageWorkflow`, so an inline `flux3_klein_t2i` can run instantly and Qwen with a reference keeps `qwen_edit_cloud` instead of becoming text-to-image. The adapter sends the original selected workflow to the server, which rechecks live routing at execution. Existing `comfyTarget` policy is unchanged. Router is an available writer whenever a Comfy key is set, alongside Google.

Planning reports all blockers before spending. `needs_pod`, `pod_too_small` and `missing_key` identify the blocking step in `plan.reasons`. Starting/resizing a Session remains an explicit user action; then call `session.start()` or `session.retryFailed()` to recheck and resume. Changed live conditions can still fail at execution, preserving the session.

`session.preflight` contains the steps, requirements, reasons and costs. `session.cost.steps` contains `{ stepId, usd, approx }`; unknown prices have `usd: null`. `total` is `{ usd, approx }` only when every step is known, otherwise null. Writer costs stay unknown. GPU-time rates remain unknown without measured `executionSeconds`; output duration is not execution time. Guessed durations and token estimates are approximate. Approval fan-out assumes all images are sent; choosing fewer can lower cost. The quote describes the original pipeline, not remaining spend.

Headless adapters can inject `requirements(workflows, { runType, pod })` or an equivalent metadata object, including each Comfy requirement's server-resolved `target`/`selectedWorkflow` or structured `reason`. Prices accept a model-endpoint metadata map or async `(models) => map`. Operation methods accept planning overrides as their last argument. Resume ignores blockers for completed steps and unrelated retry branches. Offline checks use workflow files and synthetic connection/target state without reading provider keys.

## Adoption by branch

No studio page is edited by this shared-runner branch. Existing successful awaits, catch-based error messages and approval helpers remain compatible. Migrate only behavior that currently creates a new format run for recovery or needs live busy/retry controls; no wholesale page rewrite is required.

| Branch | Required adoption where behavior changes |
| --- | --- |
| #107 `issue-101-studio-wiring` | Upscale, Edit video, Audio, Lipsync and Mixed media retain the session through `onSession` or `error.session`; replace fresh-run retry with `session.retryFailed()` and use its busy signal. Existing normal runs/catches stay as written. |
| #110 `photodump-reframe` | Keep concurrent per-shot calls; each gets its own session. Store the failed shot's `error.session` and retry only that session. Reframe image mode retains its session instead of starting over. Existing per-shot progress and successful output reconciliation remain page-owned. |
| #111 `ads-studios` | `useAdStudio` can keep comparing `formatRunId` because it aliases `id`. Preserve catch-based approval handling; retain `error.session` where a failed await previously lost the handle. Change only fresh-run retry paths and add busy controls where absent. |
| #113 `story-studios` | Shorts, Faceless and Explainer keep their script/shot approval and stitching helpers. Retain each format session, retry its failed units instead of starting that format again, and keep the existing approved-script/shot selections. Page-owned stitching outside the runner keeps its own recovery. |
| #114 `ugc-influencer` | Keep the requested rejection contract and capture `error.session` on failure. Retry failed creator/motion steps through that session; add `onSession` only where the page needs activity before completion. Existing successful awaits/catches need no migration. |

#108's Router batch and writer changes and #112's Cloud alternates are stacked prerequisites. #109's automatic browser-check discovery is merged too. For per-step controls use `await session.retry(stepId)`. Subscribe via `onChange` or the engine and catch rejected operations to display errors. Recovered upstream takes sent earlier require the explicit re-review described above.

## Merge resolutions

- Rebase onto `origin/main`: already up to date.
- `origin/router-breadth`: `src/lib/useGenerations.js` conflicted in imports, `execute` signature and retry closure. Kept price/session support and Router partial-batch retry behavior, with stable item id as the fourth argument and session retry as the fifth. Final integration preserves mutable Router adapter options across attempts.
- `origin/instant-ports`: merged without conflicts. Kept the server alternate maps, image variants and routing guards; preflight now shares that resolver.
- `origin/verify-browser-pattern`: `scripts/verify.mjs` conflicted between an explicit browser list and automatic discovery. Kept automatic discovery, which includes Router and all future browser checks, with sequential execution and existing timeout/cleanup handling.

## Validation

All builds/checks run sequentially on `pi-windows` in `C:/Users/kylek1/comfyfield-runner-resilience-437c496c`, a scratch clone of the stacked branch. Git Bash is first in `Path`; bundled `ffmpeg-static` is installed. Provider environment fields are cleared before launching checks; fixtures supply synthetic configuration. No real keys or paid calls are used.

Focused checks cover exact retry request counts, real Router-batch lost-response reconciliation, writer key reuse, fresh explicit Rerun keys, failed-item retention, captured values, the run-id alias, early session/busy signals, concurrent hook calls with different values, approval gates, null endpoint inputs, inline/image Cloud alternates, target-policy agreement and unknown GPU-time prices. Inventory assertions derive valid counts and unique ids from the loaded catalog instead of fixed 450/479 totals.

Final Windows output on 2026-10-19:

- `npx vite build`: 335 modules transformed, built in 2.08 seconds; bundle-size warning only.
- `node scripts/verify.mjs`: `20/20 check scripts passed`, exit 0, including all four browser suites.
- Focused output: 21 Router/core checks, 24 engine checks, 31 recipe cases, requirements regressions and 39 Cloud alternate pairs passed.
- The first verifier runs exposed transferred macOS archive metadata and a stacked Router fixture missing offline requirements. Metadata was quarantined outside the scratch clone; the fixture now injects offline requirements. The final full run includes both corrections.
- Runtime/check files matched the local worktree byte for byte before the final run. No direct studio or protected Pod-file edits were made in the fix; inherited Router studio changes remain in the required merge.
