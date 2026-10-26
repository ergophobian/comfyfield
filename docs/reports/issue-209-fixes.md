# Strong-track integration handoff

Branch: `issue-209-fixes`. No push or pull-request mutation. Spend: $0.

The merge commit `f3331c80c4db7d9aa3ec66b578a41191334baff3` retains both parents: track head `3647f2d5b3802c7b81b59c013de683677cae8186` and main `a6a64b1d9812eb204da14b2c780b954900203f94` (including #213). No rebase or squash.

## Conflict decisions

- `server/core.js`: combined main's Router, writer, Blender, Three.js, consent, progress and stage hooks with the branch's reference slots, realism and track helpers. Retained both `VHS_LoadVideo` support and the `clipvideo`/`previous` slots.
- `server/plugin.js`, `src/lib/useLibrary.js`, `src/components/library/Voices.jsx`: retained main's transactional Library and consented voice model, editor and error handling. Preserved character reference sets in `server/library.js` and the product-reader endpoint. Both legacy product import routes now use guarded transport.
- `src/lib/flowEngine.js`: combined upstream audio with main's upstream video handling, approval gates and existing run semantics. Added an audio-plus-video-through-approval check.
- `src/lib/formats/{index,schemas,validate}.js`: retained both catalogs, schema keys, motion trim fields, audio chaining, link autofill and confirmation handling. Windows catalog inspection found 473 runnable / 497 total formats; planned missing workflows remain in the catalog.
- `src/pages/{AdsStudio,Influencer,AudioStudio,AppPage}.jsx`: retained main's reviewed drafting, locking, approval and shared workspace flows. Added access to the new standalone ad formats, seeded persona creation and new character uses. Re-enabled Dub through the shared workspace. Moved link autofill into that workspace instead of resurrecting the duplicate AppView.
- `src/components/{Board,formats/Fields,formats/Review}.jsx`, `src/lib/tools.js`: retained main's credit links, progress, voice picker, review locking and script limits, alongside 3d display, link-reader controls, custom review labels and Chatterbox format metadata.
- `public/workflows/infinitetalk_v2v.json`: retained the branch's frame downsampling and main's duration cap, frame count and audio trim. The auto-merged Wan graph retains main's 16 fps motion trim and optional continuation inputs.
- `scripts/{ads-checks,format-runner-checks,pod-checks}.mjs`: retained both Ads suites by moving the branch suite to `ads-link-checks.mjs`; combined fixtures and updated the merged catalog census. Main's consented voice fixtures take precedence over the old unconsented samples.

## Review fixes and checks

- Unsafe retries: used the review's explicit deadline fallback. Multi-segment SCAIL/Wan clips, H3 extensions and multi-part speech return a clear, non-retryable `multipart_unavailable` before any provider submission. `long-video-checks.mjs` and `comfy-checks.mjs` retry the refused requests and assert zero submissions. There is no claim of implemented checkpoint/resume, and therefore no part-three resume test; the multi-part path is disabled instead.
- Segment error: adds context to the original error, retaining `uncancelled`, status and all job/request metadata. `long-video-checks.mjs` checks object identity and metadata. `jobs-checks.mjs` checks propagation through persisted jobs and polling; the direct API also forwards the fields, and the Library error explains that an uncancelled job may still spend.
- Product import: pages, photos and logos use main's `publicGet`, including pinned DNS, redirect revalidation and response limits. `ads-link-checks.mjs` covers redirect-to-localhost, direct and redirected mapped IPv6, and image/logo redirects with no connection to the blocked destination. Main's `ads-checks.mjs` retains the broader public-address tests.
- Speech preflight: ffmpeg is resolved before the first child call. `strong-tracks-checks.mjs` injects missing ffmpeg and asserts zero provider calls.
- FastH3 runner: paid execution is unavailable; `--plan` remains. The script contains no Pod-start, resume or submission route. `strong-tracks-checks.mjs` verifies planning and refusal. It must be integrated with `live-run.mjs` ledger admission and cleanup before re-enabling.

## Verification

Pending the Windows heavy-job slot. No install, build or check ran on the Mac. Windows checkout and logs are confined to `D:\comfyfield-lanes\l1`.

The lightweight Windows Flows check passed 29/29; the format-runner checks also passed. Full build and verifier results will be recorded after execution.
