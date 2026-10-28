# Final pre-public release QA

Date: 2026-10-27. Branch: `release-final`. Base: `be0a154a1cb85b84e092310e5126f45b57f59b2c`.

Recommendation: no-go until the public site certificate works and the first-run/browser gates can complete. Browser failures in this run are environment gaps, not demonstrated product regressions.

## Scope

The owner replaced the Windows host with Ubuntu and explicitly authorized Linux coverage instead. Fresh HTTPS clone in `~/comfyfield-lanes/l10/fresh-20261027`; Ubuntu 24.04, Node 22.23.4, npm 10.9.9, git 2.43.0. Historical Windows 63/63 and 68/68 results are owner-supplied context, not newly reproduced Windows evidence. Prior l2/l2b reports were read first.

All installs, builds and JavaScript checks ran sequentially on Linux in this lane. The Mac performed source edits, streaming git-history scanning and link inspection only. No paid generations, provider keys, existing key stores or environment files were read. The app used new lane-owned data and named provider variables were unset without printing values. Synthetic local video was used for Stitch. No sudo, apt, push, pull request, media deletion or history rewriting.

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Fresh clone and npm install | PASS | HTTPS clone at base; install exit 0, `found 0 vulnerabilities`. |
| Developer server serves | PASS | `npm run dev -- --host 127.0.0.1 --port 5193`; HTML 200. Server stopped in finally. |
| Visible first-run notice | FAIL, environment gap | Chrome cannot start; no visual claim. |
| Production build | PASS | `npx vite build`, exit 0; 2.12s. Existing asset-import, module-directive and chunk-size warnings. |
| README help and models | PASS | `node bin/comfyfield.js --help` and `models --kind video`, exit 0. |
| README MCP | PASS | `claude mcp add` succeeds with isolated lane config and the clone's absolute entrypoint. Stdio initialize returns protocolVersion 2024-11-05, serverInfo comfyfield 0.1.0. |
| README Stitch | PASS after correction | Original local paths fail with `Choose an uploaded or generated /media file, or an http(s) URL.` Replaced with `/media/first.mp4 /media/second.mp4`; tested using synthetic one-second clips, exit 0 and exported MP4. |
| README local links | PASS | All 19 linked paths exist, including shot images/videos, source, docs and license. |
| README external links | FAIL / incomplete | Public site fails TLS hostname validation from Mac and Linux. Node download and Comfy key page return 200. Competition page returns 403 to unauthenticated HEAD; not proven broken. Router models HEAD returns 405; actual unauthenticated GET returns expected 401. Origin clone succeeds authenticated while private. |
| Full-history pattern scan | PASS, bounded | Freshly fetched all origin heads and tags, plus all local refs; `git log --all -m -p`, 715 commits, 2,731,999 output lines. 18 synthetic fixture matches, zero suspicious candidates. |
| Personal-path scrub | PASS, current text scope | 27 tracked text files, 214 replacements; tests/fixtures unchanged. No media removed or modified. Historical commits and text embedded in media remain outside the scrub. |

## Verification

Before: `45/68 check scripts passed`, exit 1. All 23 failures were Chrome-dependent; initial install downloaded Chrome but extraction failed because no zip archiver was present. Used Python zipfile to extract the same Chrome 156.0.8078.73 without sudo. Subsequent smoke and post-scrub run use explicit CHROME_PATH, but Chrome exits 127 due to missing `libatk-1.0.so.0`.

After: `45/68 check scripts passed`, exit 1. The same 23 scripts fail at Chrome startup with the missing-library error; all 45 non-browser scripts pass before and after. Vite also emits closed-server dependency-scan errors during failed browser-check cleanup. No lane-owned Node, Chrome, ffmpeg or Vite process remained at final inspection.

No system libraries were installed. First-run visibility and all browser behavior remain unverified here. ffmpeg-static fallback successfully renders Stitch; no external ffmpeg install required. README generation was skipped because it spends money. The README Docker command is inline, not a command block; deployment/container startup was not attempted in this lane.

`npm install` under npm 10 removed nine peer metadata flags from the Linux scratch lockfile, without changing package versions or integrities. That install-generated scratch difference is not included in the commit. Runtime source is unchanged.

Failures verbatim (identical script/exit list before and after):

```text
Failed cost-check.mjs: 1
Failed router-models-check.mjs: 1
Failed ads-ui-checks.mjs: 1
Failed agent-ui-checks.mjs: 1
Failed ascii-ui-check.mjs: 1
Failed cinema-ui-check.mjs: 1
Failed demo-kit-ui-checks.mjs: 1
Failed flow-draft-ui-check.mjs: 1
Failed flow-image-ui-check.mjs: 1
Failed flow-library-ui-check.mjs: 1
Failed format-share-ui-check.mjs: 1
Failed format-ui-check.mjs: 1
Failed mesh-ui-check.mjs: 1
Failed photodump-reframe-ui-check.mjs: 1
Failed presenter-ui-check.mjs: 1
Failed router-ui-check.mjs: 1
Failed share-ui-check.mjs: 1
Failed story-ui-check.mjs: 1
Failed studio-ui-check.mjs: 1
Failed threejs-browser-checks.mjs: 1
Failed upscale-ui-check.mjs: 1
Failed voice-library-ui-check.mjs: 1
Failed widget-browser-checks.mjs: 1
```

## Scrub inventory

Counts are replacement occurrences, not changed lines. Neutral forms include `~`, `<user>`, `<windows-host>`, `<private-host>` and `<lane-root>`. The latter stands for the original drive-specific research lane root. Remaining generic path/IP literals in checks are intentional fixtures (macOS home behavior, local-path rejection, private-address rejection and Pod transport).

| File | Replacements |
| --- | ---: |
| `docs/demo.md` | 4 |
| `docs/reports/issue-209-fixes.md` | 1 |
| `docs/reports/issue-209-windows-verify.log` | 24 |
| `docs/startup-verification.md` | 1 |
| `research_notes/cinema/README.md` | 3 |
| `research_notes/engine/qwen-edit/check.md` | 1 |
| `research_notes/live-runs/validation.json` | 1 |
| `research_notes/placeholder-assets-sources.json` | 98 |
| `research_notes/placeholder-assets.md` | 1 |
| `research_notes/release-gates/l2-report.md` | 3 |
| `research_notes/release-gates/l2b-report.md` | 3 |
| `research_notes/router-breadth.md` | 3 |
| `research_notes/runner-resilience.md` | 4 |
| `research_notes/screenshots/issue-101/README.md` | 2 |
| `research_notes/screenshots/issue-101/validation.txt` | 8 |
| `research_notes/screenshots/photodump-reframe/verification.txt` | 1 |
| `research_notes/screenshots/placeholder-assets/captures.txt` | 1 |
| `research_notes/screenshots/placeholder-assets/verify-first-attempt.txt` | 23 |
| `research_notes/screenshots/placeholder-assets/verify.txt` | 5 |
| `research_notes/screenshots/router-breadth/review-verification.txt` | 8 |
| `research_notes/screenshots/router-breadth/verification.txt` | 8 |
| `research_notes/screenshots/story-studios/README.md` | 1 |
| `research_notes/screenshots/ugc-influencer/checks.md` | 1 |
| `research_notes/screenshots/voice-library/validation.md` | 2 |
| `research_notes/story-studios-review.md` | 2 |
| `research_notes/ui-stack/cancel-retry-review.md` | 2 |
| `research_notes/ui-stack/report.md` | 3 |

## Evidence

Full logs, scripts, the user-local Chrome download and synthetic clips remain under `~/comfyfield-lanes/l10/` on the Linux host. Key logs: `install.log`, `build.log`, `verify-before.log`, `verify-after.log`, `smoke.log`, `smoke-chrome.log`, `claude-add.log`, `readme-stitch.log`, `readme-stitch-fixed.log`. Small evidence copies are in ignored `outputs/release-gates/l10/` locally. History candidate metadata records only commit, path, type and fixture classification, never credential values. All 18 matches are credential assignments in `scripts/live-run-check.mjs`, explicitly synthetic test data.

The history scan checks private-key headers, common GitHub/provider token formats, long quoted credential assignments and URL credentials, including removed lines and merge-parent patches. It does not establish absence of every possible secret: binary contents, OCR, unreachable objects and unfetched pull-request refs are excluded. Personal paths in old commits remain reachable by design; this scrub does not anonymize repository history.
