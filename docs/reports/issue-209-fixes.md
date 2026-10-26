# Integration handoff for #209

Branch: `issue-209-fixes`. Windows build passed and **68/68** check scripts passed. No push or pull-request mutation. Spend: $0.

Validated code: `23ef13379f26e7c7d7a74effcf095bbcd689c186`. Main included through `ce00c2e25b31976b9bb4661983282002cb6786ef` (#215). The final handoff commit adds this report, the captured verification log and labeled mock screenshots only.

The merge commit `f3331c80c4db7d9aa3ec66b578a41191334baff3` retains both parents: track head `3647f2d5b3802c7b81b59c013de683677cae8186` and main `a6a64b1d9812eb204da14b2c780b954900203f94` (including #213). No rebase or squash. A second conflict-free merge, `23ef133`, includes #215 and its Cinema progress and demo-kit changes.

## Conflict decisions

- `server/core.js`: combined main's Router, writer, Blender, Three.js, consent, progress and stage hooks with the branch's reference slots, realism and track helpers. Retained both `VHS_LoadVideo` support and the `clipvideo`/`previous` slots.
- `server/plugin.js`, `src/lib/useLibrary.js`, `src/components/library/Voices.jsx`: retained main's transactional Library and consented voice model, editor and error handling. Preserved character reference sets in `server/library.js` and the product-reader endpoint. Both legacy product import routes now use guarded transport.
- `src/lib/flowEngine.js`: combined upstream audio with main's upstream video handling, approval gates and existing run semantics. Added an audio-plus-video-through-approval check.
- `src/lib/formats/{index,schemas,validate}.js`: retained both catalogs, schema keys, motion trim fields, audio chaining, link autofill and confirmation handling. Windows catalog inspection found 473 runnable / 497 total formats; planned missing workflows remain in the catalog.
- `src/pages/{AdsStudio,Influencer,AudioStudio,AppPage}.jsx`: retained main's reviewed drafting, locking, approval and shared workspace flows. Added access to the new standalone ad formats, seeded persona creation, persona history and saving, and new character uses. Re-enabled Dub through the shared workspace. Moved link autofill and format limitation notes into the shared workspace and sheet instead of resurrecting the duplicate AppView.
- `src/components/{Board,formats/Fields,formats/Review}.jsx`, `src/lib/tools.js`: retained main's credit links, progress, voice picker, review locking and script limits, alongside 3d display, link-reader controls, custom review labels and Chatterbox format metadata.
- `public/workflows/infinitetalk_v2v.json`: retained the branch's frame downsampling and main's duration cap, frame count and audio trim. The duration now uses the sampled frame count; a ceiling on the sampling stride prevents mismatched source and output rates. `studio-checks.mjs` covers a short source, 35/60/120 fps and the requested trim. The auto-merged Wan graph retains main's 16 fps motion trim and optional continuation inputs.
- `scripts/{ads-checks,format-runner-checks,pod-checks}.mjs`: retained both Ads suites by moving the branch suite to `ads-link-checks.mjs`; combined fixtures and updated the merged catalog census. Main's consented voice fixtures take precedence over the old unconsented samples.

## Review fixes and checks

- Unsafe retries: used the review's explicit deadline fallback. Multi-segment SCAIL/Wan clips, H3 extensions and multi-part speech return a clear, non-retryable `multipart_unavailable` before any provider submission. `long-video-checks.mjs` and `comfy-checks.mjs` retry the refused requests and assert zero submissions. There is no claim of implemented checkpoint/resume, and therefore no part-three resume test; the multi-part path is disabled instead.
- Segment error: adds context to the original error, retaining `uncancelled`, status and all job/request metadata. `long-video-checks.mjs` checks object identity and metadata. `jobs-checks.mjs` checks propagation through persisted jobs and polling; the direct API also forwards the fields, and the Library error explains that an uncancelled job may still spend.
- Product import: pages, photos and logos use main's `publicGet`, including pinned DNS, redirect revalidation and response limits. `ads-link-checks.mjs` covers redirect-to-localhost, direct and redirected mapped IPv6, and image/logo redirects with no connection to the blocked destination. Main's `ads-checks.mjs` retains the broader public-address tests.
- Speech preflight: ffmpeg is resolved before the first child call. `strong-tracks-checks.mjs` injects missing ffmpeg and asserts zero provider calls.
- FastH3 runner: paid execution is unavailable; `--plan` remains. The script contains no Pod-start, resume or submission route. `strong-tracks-checks.mjs` verifies planning and refusal. It must be integrated with `live-run.mjs` ledger admission and cleanup before re-enabling.

## Verification

- `npm ci`: passed on Windows.
- `npx vite build`: passed on Windows at the validated code commit above.
- `node scripts/verify.mjs`: **68/68 check scripts passed**, exit 0, including the new demo-kit check from main.
- The standalone Flows check passed 29/29. The studio check passed 440 runner cases.
- Windows source files were unchanged after verification. The checkout, build logs and raw verification logs are under `D:\comfyfield-lanes\l1`; the final pass also uses that lane's temporary directory and npm cache. No install, application build or JavaScript check ran on the Mac.
- [Captured final verification log](issue-209-windows-verify.log), sha256 `1eebd0907eddabc9d2c271dd3465f33b2918fb444f90d1f3561c5b83bf7a07bc`.

The fixes passed 67/67 on `f63c341` before the last main merge. The original full pass on `78af226` was 63/67. Its failures were corrected before the passing runs:

```text
Failed cost-check.mjs: 1
AssertionError [ERR_ASSERTION]: shared/cloudSeconds.js is out of date: run node scripts/cloud-seconds.mjs

Failed studio-checks.mjs: 1
ReferenceError: round is not defined

Failed mesh-ui-check.mjs: 1
Error: Timed out: document.querySelector(".sheet-limits")

Failed studio-ui-check.mjs: 1
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
+ actual - expected

+ 'Chinese (zh)'
- 'Spanish (es)'
```

The cost table was regenerated from the merged graphs. The numeric fixture gained Python-style round and ceil, and exposed the sampled-frame duration correction. The shared renderer now retains the 3d limitation note. The Dub fixture explicitly selects Spanish because main preserves the previous language in its input cache. The mesh timeout was an absent element, not contention. No contention rerun was needed.

An earlier standalone schema check also failed before correcting the order of Wan's merged placeholder list:

```text
AssertionError [ERR_ASSERTION]: Workflow placeholders changed: refresh format schemas
```

## Mock browser evidence

These are production-build captures with mock providers and a fixture mesh. They do not establish live generation, Pod performance or model quality.

- [Character figure and rig limitation note](../screenshots/issue-209-fixes/mock-character-3d-sheet.png)
- [3d viewer and print action at 390 px](../screenshots/issue-209-fixes/mock-library-3d-mobile.png)
- [Dub form and persisted mock output at 390 px](../screenshots/issue-209-fixes/mock-dub-mobile.png)
