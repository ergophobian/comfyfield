# L2b dependency and notice follow-up

Date: 2026-10-25. Branch: `release-deps`, based on `origin/release-gates` at `a5c9434`. No push or pull request was made. Spend: $0; no real provider generation, keys or environment files were used.

## Dependency changes

`npm audit fix` without force fixed the compatible transitive dependencies. The remaining findings required direct major upgrades: Vite 5 to 6 and React Router 6 to 7. Vite 6.4.4 is the first 6.x version outside all ranges reported by this audit; there was no need to jump to Vite 8. The existing React plugin remains compatible. Dependency remediation changes only `package.json` and `package-lock.json`; no application code changed.

| Original package finding | Final installed version | Disposition |
| --- | --- | --- |
| Vite, high | 6.4.4 | Fixed Windows path/deny bypass, optimized-map traversal, editor handling and custom middleware findings reported by npm |
| body-parser, high | 2.4.0 | Fixed compressed-request trailing-bytes denial of service |
| esbuild, moderate | 0.25.12 | Fixed development-server cross-origin response exposure via the Vite upgrade |
| fast-uri, moderate | 3.1.9 | Fixed scheme spoofing, host canonicalization, normalization and suffix-reference findings |
| react-router, moderate | 7.18.4 | Fixed backslash redirect and server hydration constructor injection findings |
| react-router-dom, moderate | 7.18.4 | Fixed dependent finding via patched react-router |

The initial audit reproduced six package findings: two high and four moderate. After the non-force fix, four remained; targeted installation of `vite@6.4.4` and `react-router-dom@7.18.4` cleared those. No residual-advisory applicability exception is needed. Audit results describe the registry advisory database at execution time, not proof that dependencies have no undiscovered vulnerabilities.

## Notices

- `NOTICE.md` now identifies the patched Apache-2.0 WanVideo encoder and its exact upstream commit, includes provider-logo trademark/identification wording, and inventories every model/pack source in `shared/modelFiles.js`, including pack-owned support files.
- Added the unmodified Apache-2.0 license text at `server/pack-patches/LICENSE-APACHE-2.0`. The encoder file and its existing attribution/change header are unchanged. The pinned upstream file was inspected and has no separate copyright header to restore.
- License names come from existing research notes, linked in the inventory. Missing or unrecorded names use "license not stated upstream" with an explicit scope explanation. This inventory makes no release-clearance or unrestricted-use claim and does not resolve custom terms or research metadata conflicts.

## Windows evidence

- Host: `<windows-host>`, Windows x64, Node 24.11.1, npm 11.6.2. Before execution: about 220 GB free on D: and 11 GB available memory.
- A unique `/tmp/comfyfield-l2b-20261025-verify.bundle` was transferred to `<lane-root>\l2b\`; the verification checkout was cloned from that bundle on branch `release-deps` at `f48f917`.
- Installs, build, verification scripts and browser fixtures ran sequentially on Windows. No Mac npm install or build ran. No integration checkout or other lane was modified. An initial partial verification was stopped to move temporary test storage from the Windows default temp directory into lane-owned `scratch`; only the restarted completed run counts below. The initial npm operations used npm's default cache; the final run sets its cache under the lane as well.
- Final launcher sets `PATH=C:\Program Files\Git\bin;%PATH%`, `TEMP`, `TMP`, `COMFYFIELD_HOME` and npm cache to lane-owned paths, and clears provider key variables by name without reading values. Fresh clones contain no environment files or saved keys.
- Committed runtime inputs tested (LF blobs): `package.json` SHA-256 `851c01c2eea412a690e5700707398fc254faeb12b93f11c3a5773007df159a2a`; `package-lock.json` SHA-256 `3fce75ccbe830a5b0f04fa28ff5aeff924214ded322fbd6f092282b15ab7b0d3`. Subsequent changes are notice/report documentation only.

- Windows checkout uses CRLF: actual tested `package.json` SHA-256 `c4731b5c53cef976ab4f4c72ffdfe339f638125345c912e2f2eab60726ff7c94`; lockfile `e225a594c6c1e7b884404f9ff8453fa261abc46f20f6f8734052ff103d1d2844`. Both match the local committed files byte-for-byte after CRLF-to-LF normalization.

## Final results

- `npm ci`: exit 0.
- `npx vite build`: exit 0. Existing public-asset-import and chunk-size warnings remain. React Router 7 also emits ignored `"use client"` module-directive warnings; browser verification passes.
- `node scripts/verify.mjs`: exit 0. Exact summary: `62/62 check scripts passed`.
- Failures verbatim: none.
- `npm audit`: exit 0. Exact summary: `found 0 vulnerabilities`. JSON totals: 0 info, 0 low, 0 moderate, 0 high, 0 critical, 0 total.
- No major upgrade was retained without the successful build and full verification. These are offline/mock functional fixtures and audit evidence, not live-provider proof.
- Completed logs: `<lane-root>\l2b\ci.log`, `build.log`, `verify-final.log`, `verify-final-exit.txt`, `audit.log`, `audit.json`, `tested-sha.txt`. Small copies remain in ignored `outputs/release-gates/l2b/` locally. Final process inspection found no remaining Node, Chrome or ffmpeg process whose command line referenced this lane; unrelated processes were left alone.
- Tested implementation commit: `f48f917`. The final report/notice correction commit changes documentation only; the runtime manifests remain the tested inputs above. Use `git rev-parse release-deps` for the final handoff commit.
