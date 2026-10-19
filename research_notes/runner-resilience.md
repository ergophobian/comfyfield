# Runner resilience

The format runner retains one session across failure, approval and retry. Generation adapters still receive `(model, options, metadata)` and persist each result to the Library. The existing `flow`, `engine`, `results()`, `send(id)` and `sendWriter(id)` members remain available. Failed operations now resolve instead of throwing; read `session.error` or `session.reason` after awaiting them.

## Session api

```js
const session = await gens.generateFormat(format, values, {
  onSession: setSession,
  onChange: (_, session) => setError(session.error?.message || null),
})
await session.retry(stepId)
await session.retryFailed()
```

- `retry(stepId)` retries failed units in that step, then downstream steps without output. `retryFailed()` does the same for all failed steps. Both keep successful takes, Library files and the original `formatRunId`. No failure means no generation requests. Neither operation opens an approval or writer gate.
- A failed take retains `status: 'failed'`, `error` and any provider `code` and `reason` in `engine.state`. `session.failures` adds the step id to each failed item. `session.error` is an Error; `session.reason` is `{ code, stepId?, message, ...details }`. `session.ok` reflects the current error state.
- `send` and `sendWriter` keep their previous result shapes (`ok`, `ran`, `reason`). A stored failure no longer throws before the gate can open. Retry downstream failures through the session; never create another format run to retry. `start()` fills gaps and can resume a session blocked before execution.
- `busy` covers planning, queued requests, execution and Send/retry operations. `onSession` exposes the session before planning starts; `onChange(state, session)` lets a page repaint its live getters. Lock inputs and Run with `session?.busy`. Concurrent session actions resolve with a `busy` reason. `generateFormat` deduplicates calls for the same format while its session is busy, even if the edited values differ. The session captures input values at creation.
- `session.preflight` contains all selected steps, requirements, reasons and cost. `session.cost.steps` contains `{ stepId, usd, approx }`; an unknown step has `usd: null`. `session.cost.total` is `{ usd, approx }` only when every step is known, otherwise null. No format totals are hardcoded. Approval fan-out assumes all images are sent, so choosing fewer can lower the cost. Writer costs remain unknown. The hook loads the existing public fal price metadata; catalog prices use the same shared estimate helper.
- Library Retry calls the owning session's `retry(stepId)`, preserving completed takes and allowing dependent steps to continue. The ordinary single-generation retry path is unchanged.

## Preflight

```js
import { preflight } from '../lib/formats/runner.js'
const plan = await preflight(format, values, { runType: 'instant', pod })
if (!plan.ok) setError(plan.reason.message)
```

`preflight` compiles the same selected targets and input bindings as execution, including image workflows, steps behind gates, optional workflow nodes and any declared `cloudWorkflow` alternate. The read-only `POST /api/comfy/requirements` endpoint accepts `{ workflows: [{ workflow, vars }] }`; core reads the bundled graphs and derives `notOnCloud`, `minVramGb` and graphics card architecture using `shared/modelFiles.js`. Its response includes only connection booleans, current target selection and Pod memory/architecture. No model download, Pod start, upload or provider generation occurs.

Planning checks every step before calling the writer or generation adapter. `needs_pod`, `pod_too_small` and `missing_key` identify the blocking step; all blockers are in `plan.reasons`. Pages can use “Run as a Session” for a Pod requirement. Starting or resizing the Session remains the existing explicit user action. Then call `session.start()` or `session.retryFailed()` to recheck and resume. Do not bypass `comfyTarget`; server execution still makes the final routing decision. Conditions can change after planning, so runtime failures still stay on the session.

Advanced/headless adapters can inject `requirements(workflows)` or an equivalent metadata object, and `prices` as a model-endpoint metadata map or async `(models) => map`. The offline checks inject real workflow metadata with fixture connection state; they never read provider keys. Operation methods accept planning overrides as their last argument. Resume checks exclude completed steps and unrelated retry branches from blockers; their stored outputs need no credentials or target. The cost quote describes the original pipeline, not a remaining-spend counter. `runFormat` also returns a session for input-validation or preflight failures; standalone `compileFormat` retains its throwing validation contract.

## Page adoption

Keep the returned session in page state, use `onSession` to capture it immediately, and subscribe through `onChange` or the existing engine subscription. The hook itself repaints on changes. Each page's retry replacement is one line:

| Branch/page | Replace a fresh format run on retry with |
| --- | --- |
| `issue-101-studio-wiring` (#107): `Upscale.jsx` | `await session.retryFailed()` |
| `issue-101-studio-wiring` (#107): `EditVideo.jsx` | `await session.retryFailed()` |
| `issue-101-studio-wiring` (#107): `AudioStudio.jsx` | `await session.retryFailed()` |
| `issue-101-studio-wiring` (#107): `LipsyncStudio.jsx` | `await session.retryFailed()` |
| `issue-101-studio-wiring` (#107): `MixedMedia.jsx` | `await session.retryFailed()` |
| `router-breadth` (#108): formats using Router models | `await session.retryFailed()` |
| `photodump-reframe` (#110): `Photodump.jsx` | `await session.retryFailed()` |
| `photodump-reframe` (#110): `Reframe.jsx` image mode | `await session.retryFailed()` |
| `story-studios`: story studio pipelines | `await session.retryFailed()` |
| `ads-studios`: ad studio pipelines | `await session.retryFailed()` |
| `ugc-influencer`: creator pipelines | `await session.retryFailed()` |

For a per-step retry button, use `await session.retry(stepId)`. Replace catch-only error handling with `setError(session.error?.message || null)`, and disable editable controls with `disabled={session?.busy}`. Keep page-specific reconciliation for a provider's internal batch: the runner sees one adapter invocation as one unit. In particular, #108's `routerBatch.js` remains responsible for retaining completed requests inside a Router unit; this change neither replaces nor changes that contract. When #108 wires Router prompt writing, add `comfyRouter` to core's `writerProviders` response alongside Google so preflight recognizes that newly available writer connection. Main currently has an explicit Router-writer stub, so preflight correctly requires Google.

## Validation

Run the build and `scripts/verify.mjs` on Windows in a scratch clone. Focused checks cover exact request counts after a partial failure, independent failed branches, approval after failure, writer retry, retained metadata/outputs, busy exclusion, captured inputs, Cloud-only blockers, a 24 gigabyte Pod encountering a 32 gigabyte step, missing provider keys, Cloud alternates, derived per-step costs and the requirements endpoint. The engine regression verifies partial failures block automatic downstream work and retries preserve completed units and closed gates. All generation and connection results are fixtures; no paid calls are needed.
