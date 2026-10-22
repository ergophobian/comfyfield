# Cancellation and retry review fixes

All five findings were reproduced in the integration branch and fixed. The integration base (`510aada`) already contained `origin/main`; a final fetch still showed no missing main commits. The requested branch is checked out in another Mac worktree, so this clean task branch supplies the commit pushed to `origin/integrate/ui-stack` without changing that worktree.

## Findings and regression evidence

1. Pod cancellation: `providers.js` checks cancellation before initial submission, after Pod refresh and either start sheet, before auto-start, and before workflow retries. Auto-start also checks after its own refresh. The job route passes its context into `core.runComfy`; the signal reaches lease waiting, Cloud and Pod submission, and development polling. Guards prevent submission after cancellation during asynchronous preparation. `pod-checks.mjs` exercises cancellation at six browser fallback stages. `cloud-workflow-checks.mjs` exercises cancellation before execution, during lease waiting, after lease acquisition, during preparation, and during Cloud/Pod runs, including lease cleanup.
2. Cancelled format Retry: `execute` clears the cancellation marker for the reused item id. The existing format adapter and Router batch remain intact. `router-ui-check.mjs` completes one take, cancels another, then retries only the cancelled take with the same request key and retains the successful take.
3. Queued Router Retry: pending items with saved Router batches now persist and restore even with no job ids. New batches get their keys before entering the local queue. The browser regression fills all three queue slots, queues an ambiguous Retry, reloads before submission, and verifies the original key and item recover without repeating the occupied jobs.
4. Interrupted non-Router jobs: selected the warning fallback rather than automatic provider reattachment. Restarted and missing jobs explain that the first run may already have been charged and that Retry may charge again. The saved failure reconstructs `Retry (may charge again)` on result tiles, boards, app pages and studio banners. No provider request link is available in these lost-job records. `jobs-checks.mjs` verifies restart storage and polling/404 warnings; the browser check verifies visible warning copy, Retry copy and persistence after another reload. Already accepted provider work can still finish; no refund or provider-side cancellation is claimed.
5. Historical failures: restoration reconstructs each item's Retry silently, leaving the live error banner and its Retry empty. Browser regressions cover saved batch, Create and format failures; an explicit failed-item Retry still preflights and reports a new failure normally.

Restored format items also say: "Format session ended on reload. Remaining steps will not continue." This survives recovery and appears on pending, failed and finished result tiles and the app page's separate failure list. Reload recovers saved generation steps, not the entire in-memory format session or unsent writer gates.

## Validation

Host: `pi-windows`, Node 24.11.1. Isolated worktree: `D:\comfyfield-lanes\cancel-retry-3972476d`. Provider environment variables were cleared without reading their values. Fresh dependencies and an isolated validation home were used. No paid calls or live keys were used.

- `npx vite build`: passed, with the existing bundle-size warning.
- `node scripts/verify.mjs`: 26/27 check scripts passed; exit 1. All six browser scripts and all new regressions passed.
- A final `node scripts/router-ui-check.mjs` rerun passed, including the explicit assertion that the three occupied jobs are not resubmitted after reload.
- Only `pod-checks.mjs` failed: 78 passed, seven failed. The seven are the pre-existing Windows bash-path fixtures: self-termination, FreeVideo boot/runtime reporting, node-pack boot/runtime loading, and pack-file boot/runtime loading. The new cancellation regression passed.
- The 19 changed source files matched between the Mac task checkout and Windows validation worktree by normalized-content hashes.
- `git diff --check`: passed.

Full logs remain in the Windows worktree at `outputs\cancel-retry-build.log` and `outputs\cancel-retry-verify.log`, plus `outputs\cancel-retry-router-final.log`.

The screenshots below show the production interface at 390px with synthetic stored jobs and mock connections. They prove visible recovery copy and layout, not live provider generation. Media URLs in the format fixture are synthetic.

![Restored format session note](cancel-retry/format-restored-note-390.png)

![Interrupted run charge warning](cancel-retry/interrupted-charge-warning-390.png)
