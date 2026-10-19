# Startup verification

Implemented issues #40, #42 and #44 on `one-command-start`. Issue #41 already had `ffmpeg-static` and a Stitch fallback in this checkout; this lane adds the shared, executable-checked resolver without changing `server/stitch.js`.

## Commands

From a fresh source checkout, run `npm start`. No separate dependency install or build is needed. After a maintainer publishes the package, `npx comfyfield` invokes the same launcher with a bundled production build. No package was published during this work.

The launcher prints the studio URL, Connections URL and data folder, opens the default browser, and serves the production app and existing local API on one loopback port. `--no-open` disables browser launch; `--port 5300` chooses a starting port.

## Checks and messages

| Check | Behavior |
| --- | --- |
| Node.js | Below 22: explains the required version, links to the installer and asks the user to reopen the terminal. |
| Busy port | Reports the occupied port and tries the next port, up to 20 alternatives. |
| ffmpeg | Probes the system binary, then the npm binary. If neither runs, explains `npm rebuild ffmpeg-static` or a system installation. Does not block browsing. |
| No saved keys | Prints the Connections link. The app shows “No keys yet” with an Open Connections link. |
| Comfy account | Uses only a saved key and the read-only account endpoint. Explains rejected keys, unavailable access, inactive accounts, service errors and offline checks. An active account does not prove paid-plan entitlement; the message says so. |
| Disk | Reports available data-drive space, warns below 5 GB, and pauses below 200 MB. Explains freeing space or choosing another drive. |
| Data folder | Explains how to choose a writable folder if creation or access fails. |
| Browser | Uses the native open command on each platform; if it fails, asks the user to open the printed URL. |

App, CLI and agent server share `~/.comfyfield` on macOS/Linux or `%APPDATA%\comfyfield` on Windows. The existing `COMFYFIELD_HOME` override still means `<folder>/.comfyfield`.

## Platform results

| Platform | Evidence |
| --- | --- |
| Windows x64, Node 24.11.1 | Fresh scratch clone installed dependencies and built through `npm start`; production page and same-port Connections API passed. `npx vite build` passed. Full verification passed all 17 check scripts. |
| macOS arm64, Node 26.8.1 | Fresh scratch clone installed 199 packages in 4 seconds and built in 1.51 seconds through `npm start`; production page and same-port Connections API passed. Startup checks passed, including an isolated default per-user folder. Node heap capped at 512 MB; measured maximum resident size about 370 MiB. No full browser suite ran on the Mac. |
| Ubuntu under WSL, Linux x64, Node 22.22.0 | Fresh-clone `npm start`, production page, same-port API and `npx vite build` passed. Full verification passed all 17 check scripts with headless Chromium. |
| Standalone Linux npm package | Installed the packed artifact into its own project with `--omit=dev` (158 dependencies), without the React development plugin or source pages. `npm exec --offline -- comfyfield --no-open --port 5488` served the built page and API without reinstalling dependencies. This exercises npm's hoisted dependency layout. |

The automated startup output includes:

```text
Startup checks passed on win32/x64: production app, same-port API, occupied port fallback, isolated per-user storage, no keys, ffmpeg, browser commands and failure guidance
Startup checks passed on darwin/arm64: production app, same-port API, occupied port fallback, isolated per-user storage, no keys, ffmpeg, browser commands and failure guidance
17/17 check scripts passed
Packed npm executable passed on linux/x64; production page and same-port API, no credentials.
```

Startup checks cover upgrade guidance, disk thresholds, writable storage, missing/corrupt saved connections, Comfy responses and timeouts, system/bundled/missing ffmpeg, browser commands and failures, occupied-port fallback, production serving and the local API. Both real system and npm ffmpeg executables were checked. The existing Stitch suite rendered synthetic fixtures with both executables. The browser fixture checks the no-keys notice and its link at 390px; its screenshot is `research_notes/format-runner/mock-startup-mobile.png` in the verification scratch clones.

All launch smoke tests used `--no-open`; native browser command selection and failure handling were tested with an injected launcher. All actual browser tests were headless. Provider credentials were cleared for verification; Comfy responses used fake keys and mocked requests. No paid generations or real account checks ran.

Windows verification needs Git Bash before the WSL bash launcher in the test process path. WSL Snap Chromium needs its test profiles under the Linux home directory rather than `/tmp`. One Windows rerun encountered a transient busy port 5173 in an existing browser fixture; no unrelated process was stopped. Local logs and the inspected mock screenshot are retained under ignored `outputs/startup-verification/`.

## Stitch integration hook

`server/stitch.js` was left untouched. Its existing exported `findFfmpeg()` can delegate to the new resolver by replacing its body with this one line:

```js
return (await import('./ffmpeg.js')).findFfmpeg()
```

The shared helper validates that the selected binary can actually run and supplies the same repair message used by startup diagnostics.
