# Story studio screenshots

Captured on Windows using headless Chrome and the production build, at 1440px and 390px. Writer and Comfy calls use fixtures. Video assembly, captions, music mixing, playback and Library persistence use real local code and ffmpeg. Flat colors and the synthetic tone are test media, not provider quality evidence.

Each studio has an editable shot-list approval capture (`mock-<studio>-review-desktop.png`) and finished output captures (`mock-<studio>-desktop.png`, `mock-<studio>-390.png`). The selected controls are exercised in the requests: Explainer uses clay motion and square output with an attached text file and music; Shorts uses clay world, Spanish speech and clean captions; Faceless uses full animation and saves its channel settings.

Validation ran in `C:\comfyfield-story-studios\source` on `pi-windows`, with system and bundled ffmpeg exercised by the Stitch checks. The full verifier uses Git Bash on the test process path and its explicit shell override for the existing Pod fixtures. No Pod implementation files changed.

Check output:

```text
npx vite build
  335 modules transformed
  build passed (existing large-chunk warning)
node scripts/verify.mjs
  18/18 check scripts passed
node scripts/theme-check.mjs
  theme ok
node scripts/story-ui-check.mjs
  Story page checks passed: all three pages, both approvals, mock providers, real ffmpeg, playback, Library, dependency error and 390px layouts
```

The page check and build were repeated after bounding the video preview height. No paid generations, external account operations or real API keys were used.
