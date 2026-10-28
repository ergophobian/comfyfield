# Brian's stack integration

The integration starts at `origin/issue-150-pickers` (`c2b1344`) and merges `origin/main` (`76041d1`) in merge commit `dabe358`. Brian's commits retain their original identities. All eight source branch tips and main are ancestors of this integration. No source branch was rebased, squashed, pushed or closed.

This draft supersedes #143, #144, #157, #158, #159, #160, #161 and #162. It does not close those pull requests itself.

## Conflict decisions

- `scripts/format-ui-check.mjs`: retain main's writer/render failure and session-retry scenarios, and adapt the mock generation routes to Brian's start-job/poll-job protocol. Failed jobs expose the same structured errors as direct requests.
- `server/plugin.js`: retain both the local-request access guard and durable job routes. Pass each job's context into Router generation so cancellation aborts its requests and prevents further polling. Keep direct routes for other callers.
- `src/lib/providers.js`: retain `createRouterBatch`/`runRouterBatch`, native payloads, one idempotency key per call and partial-file hooks; submit each outstanding call through `runJob`. Each call saves its job id and waits on it again after reload. A failed call clears its old job id and follows `keepRequestKey` before retrying.
- `src/lib/useGenerations.js`: retain main's execute signature, shared sessions, per-step retry adapters, preflight, busy state and error ownership. Combine those with saved jobs/run options, reload recovery, failed-item Retry and Cancel. Stable result ids prevent duplicate partial files. A restored format Retry preflights only its saved failed step and retains successful takes. Non-Router reload recovery waits on the latest job, so an earlier failed Cloud attempt cannot override its Pod fallback. Recovery retains the original page for queue toasts.
- `src/pages/ImageStudio.jsx`: retain Router capability/max-reference validation and Brian's media picker, mentions, handoffs and Enhance. Both submit paths and Generate account for reference errors and an active Enhance. The media picker counts uploaded and Library images together, without silently removing existing references.

Main's Library search, selection, bulk actions and folders remain; the viewer keeps the compare slider and source metadata alongside Brian's viewer actions. The tool tips from #154 remain. These files merged without manual conflict resolution.

## Combined behavior

Router generation now runs browser batch -> durable server job -> Router. Browser reload waits on the accepted job and continues only outstanding batch calls. Partial files persist independently. Ambiguous errors preserve the request key; terminal errors rotate it, including when Retry is restored from browser storage.

Job errors preserve `status`, `code`, `requestId`, `idempotencyKey` and `retryable`, plus existing Pod details, through disk storage and browser polling. Router errors retain request identity on status/result failures. Cancel marks the server job cancelled, aborts Router requests, discards late output and prevents later batch calls.

No feature was intentionally dropped. The changed execution mechanism replaces Brian's plain Router loop and main's direct browser request with durable calls inside main's batch adapter.

## Scope for Brian to confirm

- Cancel stops ComfyField's job and remaining batch calls. An upstream provider may still finish work it already accepted; there is no new claim of provider-side refund or hard cancellation.
- Browser reload restores active generation jobs and failed generation items. It does not reconstruct an entire in-memory format graph/session or an unsent writer-review gate. Live sessions retain main's failed-step-only retry and review behavior.
- Server restart still marks unfinished jobs lost, as in Brian's job design; browser reload does not restart the server.
- Review the combined media picker, mentions, Enhance, queue chip/toasts and viewer actions before marking the draft ready. No paid provider smoke test ran.

## Windows validation

Code revision: `c023b40c4626966a572fc079e1fa5a190b422065`.

Host: `<windows-host>`, Node 24.11.1. Worktree: `<lane-root>\ui-stack`. Provider environment configuration was cleared before running checks, and the validation home was isolated. Checks use synthetic connections and mocked provider requests. No paid generation or shell key was used.

- `npx vite build`: passed. Existing large-bundle warning remains.
- `node scripts/verify.mjs`: 26/27 check scripts passed. All integration, jobs, runner, Router and browser checks passed. Only `pod-checks.mjs` failed: 77 passed and seven failed, matching the known Windows bash-path failures described in the task. The full verifier therefore exits 1; this is not an all-green run.
- New coverage: durable Router payloads/keys and partial files; failed and pending batch reloads; terminal-key rotation after reload; restored format Retry preflight and failed-take-only execution; cancellation after reload; server error fields through disk and polling; Router cancellation preserving request identity; media-picker upload with combined reference limits.

Logs remain in `<lane-root>\ui-stack\outputs\ui-stack-build.log` and `ui-stack-verify.log`. The Windows worktree remains available for review; it has not landed.

The attached phone screenshot is the production interface with mocked connections, captured by the Windows browser check. It is not evidence of a paid generation. The browser fixture also writes technical reload/retry/cancel screenshots under `research_notes/screenshots/router-breadth/integration-*.png` on Windows.

The seven Pod failures concern self-termination, FreeVideo boot, FreeVideo runtime install reporting, node-pack boot, node-pack install/load, pack-file boot requirements and pack-file runtime loading. Their diagnostics are missing Windows drive paths under `/bin/bash`, resulting exit-code assertions or dependent runtime timeouts. No Pod harness or production fix for those existing failures is included.
