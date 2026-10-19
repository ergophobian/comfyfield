# Ads studios validation

Validated on October 19, 2026, in the isolated Windows checkout `C:\Users\User\comfyfield-ads-studios-1019`, with Node 24.11.1. Dependency installation, builds, checks, ffmpeg fixtures and headless Chrome ran on Windows, one heavy command at a time. No provider calls or live credentials were used by the new fixtures.

Commands and output:

```text
npm ci --no-audit --no-fund
added 199 packages

node scripts/format-schemas.mjs --comfy
Saved 9 public fal schemas and 110 workflows

npx vite build
337 modules transformed
built in 2.56s

node scripts/verify.mjs
18/18 check scripts passed
```

The build retains Vite's warning about chunks larger than 500 kB. It does not fail the build.

The first verification run passed 17/18 scripts. Windows selected its WSL `bash.exe` shim, and Pod shell fixtures could not open Windows paths. The successful full run set Git Bash first in the test process's path (`C:\Program Files\Git\bin;C:\Program Files\Git\usr\bin`). No Pod files or assertions were changed to resolve this environment issue.

Relevant check output:

```text
Ads checks ok: guarded and pinned public GETs, redirects, byte/time limits,
extraction, local media, writer approval, edited scripts, variant canvases,
product/presenter slots and Library metadata. No provider calls.

Graph check: 110/110 graphs fit ComfyUI v0.41.1 and the listed packs.

Ads studio browser checks ok: both links imported, bad page recovery,
editable scripts and storyboard, approval blocks rendering,
images/video/voiceover requests, result approval, Library after reload,
desktop and 390px. Three mock generations, two writer requests and one
Stitch mock; no provider calls. Ten screenshots saved.
```

A SHA-256 manifest confirmed that all 19 changed source/documentation files present at verification matched the Mac worktree byte for byte. This validation note and the screenshots are evidence artifacts added afterward.

All ten screenshots are actual browser captures of an isolated mock API. They cover Ads review/results, Marketing review/results and Library results at 1440px and 390px. Mock product/ad illustrations and a locally generated ffmpeg fixture stand in for provider media. These images prove interface layout and the complete approval/persistence flow; they do not prove paid model output quality. The Library tab strip required a scoped scrolling fix to fit 390px.

The shared format compiler also received a two-line correction: only picture-like inputs become Writer images. A reference video continues to reach the render step and is not sent to the prompt provider as an unsupported still image. The recreation fixture checks this boundary.
