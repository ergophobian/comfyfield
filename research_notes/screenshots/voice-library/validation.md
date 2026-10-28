# Voice library validation

Validated on 2026-10-19 in the isolated Windows clone `C:~/comfyfield-voice-library-81c1eca8`, through `ssh <windows-host>`, using Node 24.11.1. Installation, build, checks and headless Chrome ran sequentially on Windows. No provider requests or paid generations were made. No keys or environment files were loaded by the voice fixture.

Commands:

```sh
npm ci
npx vite build
node scripts/verify.mjs
```

Final output:

```text
built in 2.35s
Voice API checks passed: consent, size/type/duration/trim validation, four codecs, save/list/rename/delete/reload, media confinement, and saved samples in five workflow graphs. No provider calls.
Voice browser checks passed: upload/record/trim/consent/save, playback, reload, rename, picker/preview/selection, delete/cancel/reload and 390px layout. Six synthetic-fixture screenshots saved under research_notes/screenshots/voice-library/.
17/17 check scripts passed
Validated source matches local worktree: 9 files
```

The existing Pod checks require Git Bash rather than the Windows WSL launcher. The final run prepended `C:/Program Files/Git/bin` and `C:/Program Files/Git/usr/bin` to the validation process's path. No Pod source files or check scripts were changed. The production build retains its existing bundle-size warning.

The voice check covers both fragmented and ordinary m4a recordings. Uploads are decoded and trimmed with the real voice route; metadata is persisted in an isolated Library file and samples in its media directory. The browser microphone uses Chrome's synthetic device, not a person's microphone. Format execution is injected and produces no external generations.

Screenshots:

- `upload-desktop.png`, `upload-390px.png`: consented upload and selected segment before saving.
- `library-desktop.png`, `library-390px.png`: persisted sample and active audio playback.
- `picker-desktop.png`, `picker-390px.png`: shared format voice picker with a saved sample and its preview control.

The sample is explicitly labeled synthetic. Screenshots demonstrate the real built interface, local persistence and audio controls; they do not demonstrate the output quality of a cloning model. Source file hashes were compared between the Windows validation clone and the local worktree before committing.

The studio handoff and value contract are in `docs/voice-library.md`. No studio page was changed. Branch: `voice-library`. No push or pull request was made.
