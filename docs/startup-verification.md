# Startup verification

Issues #40, #41, #42 and #44 on `one-command-start`. The red-team fixes were implemented at `ea34191`; the follow-up commit enforces exact allowed hostname spelling, records this evidence and corrects two test fixtures. `git fetch origin` and `git rebase origin/main` completed first; the branch already contained `origin/main` (`7ee3b1c`). Nothing was pushed or published.

## Findings and fixes

| Finding | Result |
| --- | --- |
| Rebinding Host/Origin bypass | Every `/api` route, including reads, checks the hostname against localhost, 127.0.0.1, [::1] or the explicitly configured `COMFYFIELD_HOST`. Matching foreign Host/Origin headers are rejected before route execution. Foreign Origin and cross-site fetch headers are rejected too. |
| Default bind address | Both Vite development and the production launcher explicitly default to 127.0.0.1. An explicit non-loopback `COMFYFIELD_HOST` prints a warning about network access and spending. Wildcard binding does not allow arbitrary API Host headers. |
| Mandatory ffmpeg download | `ffmpeg-static` and its exclusive transitive dependencies are optional. Failed downloads or unsupported architectures no longer block the app. The resolver probes system ffmpeg, then the optional binary, then warns that Stitch features are disabled. |
| Launcher ignores .env | The launcher uses Vite's `loadEnv` for its mode before choosing the data folder, building or importing provider code. Existing environment values retain precedence. |
| Partial dependency install | Every required manifest dependency is resolved, plus development dependencies when a build or development server needs them. Missing packages trigger installation even when Vite exists. A lockfile selects `npm ci`; startup preserves it. |
| Old Node bootstrap crash | The executable contains no static imports. Its version gate runs before dynamically importing the CLI, so Node 16 prints actionable upgrade guidance. |
| Agent output directory | The default generation output uses `path.join(core.home(), 'outputs')`, shared with the app and CLI's per-user storage. Explicit output directories still work. |
| Licensing and install scripts | `NOTICE.md` and the setup guide identify ffmpeg-static, build-specific ffmpeg/GNU General Public License terms, source/build origins, and lifecycle scripts. The notice is included in the package file list. |
| Disk checks | Startup checks the checkout and actual npm-cache drives before installing, then the selected data drive. A missing cache directory is checked through its existing ancestor. |
| Stitch integration | `origin/main` still had the same small `findFfmpeg()` implementation. Stitch now imports/re-exports the shared resolver and has no mandatory ffmpeg-static import. Other Stitch rendering behavior was preserved. |

The writer fixture now supplies a legitimate local Host header. The widget browser fixture permits Vite's next-port fallback: this Vite version treats port 0 as the default port, and port 5173 can be occupied. `scripts/verify.mjs` and all protected Pod/GPU files were left untouched.

## Current results

All substantial build/check work ran in the fresh Windows scratch clone `C:\Users\<user>\comfyfield-startup-review-20261019`, one command at a time. Provider credentials were cleared and data folders isolated. The ordinary macOS user (uid 501) ran only the requested lightweight fresh-clone startup smoke, with `NODE_OPTIONS=--max-old-space-size=512` and no browser opened.

| Check | Evidence |
| --- | --- |
| Windows x64, Node 24.11.1 | `npx vite build` passed in 2.26 seconds. `node scripts/verify.mjs` passed all 17 scripts, including browser fixtures and synthetic Stitch renders with system and bundled ffmpeg. The build retains its existing large-chunk warning. |
| Windows fresh clone | `npm start -- --no-open --port 5490` installed and built, served the production page and same-port API, honored synthetic `.env` storage, and left the lockfile unchanged. The ffmpeg download URL deliberately pointed to a refused local port with an isolated npm cache: its real lifecycle script failed and npm continued without that optional package. System ffmpeg worked. |
| Windows partial install | With Vite present but `node_modules/@comfyorg/sdk` moved aside, `npm start` performed locked dependency repair and served the API. |
| Windows no ffmpeg | With the optional package moved aside and system ffmpeg excluded from the child process path, startup warned that Stitch features were disabled and still served the API. Netstat confirmed the actual listener was 127.0.0.1 only. The optional package was restored afterward. |
| Real Node 16.20.2 | `npx --yes --package=node@16 -- node bin/comfyfield.js --help` exited 1 with the Node 22 upgrade message, without an import error. |
| macOS arm64, Node 26.8.1 | Fresh-clone `npm start` installed, built in 1.09 seconds, and passed the same production page, API, synthetic `.env`, unchanged-lockfile and failed optional-download/system-ffmpeg checks. The smoke completed in 4.92 seconds with a 512 MB Node heap cap. No full verification/browser suite ran on the Mac. |
| Startup regression script | Checks local/foreign/rebinding hosts, origins and fetch metadata; alternate numeric hostname rejection; explicit host warnings; default development bind configuration; dependency repair and optional dependency metadata; synthetic dotenv storage; checkout/cache disk thresholds; old Node guidance; ffmpeg fallbacks; browser command selection; occupied-port fallback; actual production API requests. |

The first full Windows run found the missing-Host writer fixture and the widget port collision. After fixing those fixtures, the entire build and verification run passed. A final audit tightened the allowlist to reject normalized numeric aliases such as 127.1; the full Windows build/verification and fresh macOS startup passed again after that change. Windows ssh uses an elevated token; a non-admin Windows run was not verified. Windows arm64 was not available for hardware testing; missing/throwing optional-module behavior was exercised instead. Earlier Linux/package results are historical and were not rerun for these fixes.

## Captured output

```text
17/17 check scripts passed
Fresh npm start passed on win32/x64: install, failed optional download, system ffmpeg fallback, build, production page, same-port API, dotenv storage, unchanged lockfile
Partial-install npm start passed: Vite present, SDK missing, automatic locked repair, same-port API
No-ffmpeg startup passed: warning, working API, actual loopback-only listen socket
ComfyField needs Node.js 22 or newer; you have 16.20.2.
Fresh npm start passed on darwin/arm64: install, failed optional download, system ffmpeg fallback, build, production page, same-port API, dotenv storage, unchanged lockfile
```

Local evidence and smoke harnesses are under ignored `outputs/startup-review/`; Windows logs are copied there. The macOS fresh clone and its logs are under `outputs/startup-review/mac-fresh/`. Browser screenshots remain in the Windows scratch clone. All smoke processes were stopped. Browser opening was suppressed for live smoke tests; native command selection and failure handling were tested with an injected launcher. No real keys, account checks, paid generations, account changes or external submissions were used.
