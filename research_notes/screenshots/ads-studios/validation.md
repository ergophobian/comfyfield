# Ads studios validation

Validated on October 19, 2026 in the Windows scratch clone `C:/comfyfield-ads-fixes-8a38a3d5`, with Node 24.11.1. The source is the `ads-studios` worktree based on `515dbb9`, after fetching and rebasing onto `origin/main` (`7ee3b1c`; already an ancestor). The Mac main checkout was not used. Installation, builds, checks, ffmpeg fixtures and headless Chrome ran on Windows, one heavy command at a time. Git Bash was first in the check process path for shell fixtures. No keys or paid generations were used.

Commands and output:

```text
npm ci --no-audit --no-fund
added 199 packages in 8s

npx vite build
338 modules transformed
built in 2.34s

node scripts/verify.mjs
18/18 check scripts passed
```

Vite retains its advisory about chunks larger than 500 kB; the build passed.

Relevant regression output:

```text
Malformed 500 kB page parsed in 4 ms
Targeted format retry checks ok: stored failures, reopened gates,
repeated failures and preserved sibling outputs
ok    narration plays once, pads silence, preserves video duration
      and coexists with music
Graph check: 110/110 graphs fit ComfyUI v0.41.1 and the listed packs.
theme ok
Ads studio browser checks ok: both links imported, bad page recovery,
editable scripts and storyboard, rights and script approval block rendering,
primary photo selection, rejected page instructions, partial failure retry,
images/video/voiceover requests, result approval, Library after reload,
desktop and 390px. Four mock render attempts including one targeted retry,
two writer requests and one Stitch mock; no provider calls.
Ten screenshots saved.
```

The exact hostile parser fixture is `<title>A shop</title>` followed by 83,333 repetitions of `<meta `, isolated in a worker with a three-second termination deadline and a 1.5-second execution ceiling. It completed in 4 ms. Additional checks cover parser byte/tag caps, final prompt exclusion of rejected imported instructions, primary photo slot binding, frame/resolution caps and real template canvases. Shared runner checks exercise mixed success/failure, reopening review, repeated failed retry and successful targeted retry. Synthetic audio checks decode samples to prove the short narration is audible at the start and silent later, including coexistence with looping music.

All ten screenshots are refreshed browser captures against an isolated mock API at 1440px and 390px. They cover Ads review/results, Marketing review/results and Library. Mock product/ad illustrations and local ffmpeg video/audio stand in for provider media. They prove layout and approval/persistence behavior; no live generation quality is claimed. `source-manifest.json` records the source hashes compared against the Windows checkout after CRLF-to-LF normalization. Windows Git used CRLF on checkout; all source text matches after this normalization.

All seven red-team findings and copy nits are addressed. Recreation takes at most 81 source frames and scales to at most 848 px on the long edge; a 30-second source selection does not imply a 30-second result. Only the reviewed script and validated visible hex palette enter render text. The primary photo and optional presenter/logo remain visual inputs. Rights confirmation is required for initial render and retry. Drafting may bill through the configured writer and is disclosed before drafting.

`scripts/verify.mjs` has no diff against `origin/main`. The open browser-discovery PR #109 was inspected but not merged or modified. No protected RunPod or routing files were edited. The page importer is isolated in its module, and narration is additive to Stitch. No push or pull request was performed.
