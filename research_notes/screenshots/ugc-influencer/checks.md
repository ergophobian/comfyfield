# Verification report

Verified October 19, 2026 on pi-windows, Windows 11, Node 24.11.1. Builds and checks ran sequentially in the scratch clone `C:/comfyfield-ugc-fixes-cb037261`. The Mac edited files, inspected screenshots and committed. No provider calls, keys, paid generations or live Sessions were used.

`git fetch origin` and `git rebase origin/main` completed before changes; the branch was already current. Implementation base: `738dfc26ebcaf27f5a7e5242480f6cd7d01f9c94`. Main: `7ee3b1c9c84ba1c5e59b9b4b3069f8af6ecef0c1`. All 19 implementation/test files in [the source manifest](tested-source.json) matched the Windows clone by sha256. This report, documentation and artifacts are excluded from that manifest.

## Findings resolved

1. Full-format preflight fetches every model step's bundled workflow and uses `podNeedsOf`, `notOnCloud` and `minVramOf` before starting an engine pass. It checks the current run type and ready Session's memory. Speech formats block with “Speech videos need a Session”; unboxing/tutorial require 32 GB. The studio offers Run as a Session through the existing Session sheet using the final workflow, before any writer/staging request. Browser mocks prove zero generation or writer requests for Instant speech and a 24 GB unboxing Session.
2. The studio receives and retains a compiled engine/session before execution. Prepare resumes that same session and fills gaps, preserving successful staging. A simulated first writer failure followed by retry produces exactly one staging request and two writer attempts. The shared `runner.js` is unchanged.
3. The parent subscribes to engine state and receives review activity. Inputs, format selector and Prepare stay disabled during final rendering; synchronous guards also reject input/tab changes and replacing a running session. A held mock final render verifies these locks and unchanged inputs.
4. Motion decoding normalizes to 16 fps before skip/cap. It uses at most 81 frames, rounded down to 4n+1 frames. A five-second trim therefore renders 77 frames (4.81 seconds); the maximum is 81 frames (5.06 seconds). The studio displays the actual planned length. The video loader is registered in the existing upload/pinned-pack maps; Comfy routing is unchanged.
5. All presenter formats require an initially unchecked confirmation that the presenter is fictional, not a real person, and that its photos or likeness, product images and reference clips are authorized. This covers Library images without claiming automatic provenance verification. Motion output always drops the reference audio; no keep-original-audio option is offered.
6. Editing a completed script marks its video as older. Reapproval preserves the previous model output. Only Rerun video reruns that video node, after the revised script is sent and approved. A browser mock verifies no render on reapproval and one render on explicit Rerun. The editor discloses the approximately 480p canvas and 30-second speech cap, counts words, and blocks more than 60 words; workflow speech caps remain in place.
7. Catalog assertions derive runnable entries from validated formats and explicitly require all five new format ids. Fixed 455/484 counts are removed from both checks.

## Check output

- `npx vite build`: passed, 336 modules. Existing bundle-size warning remains. [Build output](build.log).
- `node scripts/verify.mjs`: **18/18 check scripts passed**, including **82/82 Pod tests, none skipped**. [Full output](verify.log).
- Presenter checks: four creator pipelines, ordered references, writer and explicit approval gates, persistence, failure retry, full-format requirements, consent, speech limit, normalized motion and silent output passed.
- Presenter browser checks: writer-only retry, active-render input locks, Session blockers, speech length, stale-video reapproval and explicit Rerun passed. Ten mocked generations and five writer requests produced four stills and six videos, all persisted after Library reload. Desktop and 390px layouts passed with no browser exceptions.
- Graph checks: 110/110 workflows fit the pinned schemas and listed packs.
- `git diff --check`: passed after normalizing captured Windows text logs to line feeds.

The initial environment run selected the WSL Bash launcher and lacked bundled ffmpeg after installing dependencies with scripts disabled. Selecting Git Bash for this validation process and rebuilding `ffmpeg-static` resolved those fixture failures. No Pod implementation files were changed to make checks pass.

## Screenshot evidence

All screenshots are labeled mock fixtures, not provider output. The fictional character/product use simple vector shapes; the reference video is an ffmpeg test pattern. [Request payloads](mock-requests.json) show only mocked calls.

- Session preflight: [speech](mock-session-required-desktop.png), [32 GB demonstration](mock-32gb-required-desktop.png).
- Library picks: [desktop](mock-creator-library-picks-desktop.png), [390px](mock-creator-library-picks-mobile.png).
- Script and approval: [desktop](mock-script-approval-desktop.png), [390px](mock-script-approval-mobile.png).
- [Stale script and explicit video rerun](mock-stale-script-desktop.png).
- Silent normalized motion: [desktop](mock-influencer-motion-desktop.png), [390px](mock-influencer-motion-mobile.png).
- [Influencer history](mock-influencer-history-desktop.png).
- Persisted Library: [desktop](mock-library-results-desktop.png), [390px](mock-library-results-mobile.png).

## Runner handoff and remaining boundaries

The shared runner should construct its session before the first pass and attach that same object as `error.session` on initial writer/model failure while preserving the rejection. The page could then keep `error.session` and retry `engine.runNew(flow)`, eliminating the temporary presenter engine adapter. An optional `onSession(session)` callback before the initial pass would also expose first-pass activity. This branch does not edit the shared runner or Flows engine.

All protected Pod files, Session tiers, `usePod.js`, routing and `verify.mjs` are unchanged. Shared additive changes support unchecked confirmation choices, script review, motion frame variables, the normalized loader's existing upload/pack registration, and derived catalog assertions. Styles are appended in their own commented block.

Provider fidelity, real Cloud/Session availability and automatic image provenance remain unverified. Speech uses the existing default synthetic voice. The character builder remains an unwired scaffold; multi-shot editing, captions, publishing and a community trend feed remain outside this task. No push or pull request is part of this handoff.
