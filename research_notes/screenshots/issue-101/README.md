# Studio wiring evidence

All screenshots use a production build with a local mock API. The portrait, silent color clip and tone are fixtures, not model outputs. No provider routes, keys or paid generations are used.

Reproduce with `npx vite build` followed by `node scripts/studio-ui-check.mjs`. The script opens headless Chrome only, one instance, and saves paired 1440px desktop and 390px captures for Upscale, Edit video, Audio speech, voice change, Lipsync photo, Lipsync video, Mixed media and its shared format sheet.

The browser check submits 18 mocked runs through the shared generation path and checks the submitted workflow and variables, required sample uploads, Library persistence, retained clip trim, unavailable controls and mobile overflow. `node scripts/studio-checks.mjs` additionally checks 423 runner cases against filled workflow graphs, including every mixed media look and its strength/frame-rate combinations.

All 33 mixed looks validate against the existing `public/workflows/bernini_mixed.json`. Translate stays disabled because `dub.json` is absent. Lipsync uses the available roughly 480p InfiniteTalk models and the first 30 seconds; 720p and Wan 2.2 S2V remain unavailable.

Validation runs on `pi-windows` in `C:/Users/User/comfyfield-issue-101`, with Git Bash (`C:/Program Files/Git/bin`) first in that process's path. The default Windows `bash` resolved to the WSL launcher and could not execute the native Windows Pod-check fixtures. No Pod implementation files were changed.
