# Studio wiring evidence

The branch was rebased onto `origin/main` at `7ee3b1c`, including Instant/Session and Skills, without conflicts. The original implementation commit `3b6b1c2` became `1a8b3a9`. The final source candidate is `eeb9534737f68bea754c1ba849076ddf6db90b91`; the evidence commit changes only this directory.

All seven review findings are addressed:

1. Audio keeps Gemini, ElevenLabs speech and sound effects, and fal models through the existing provider runner, including saved/custom picker entries. Chatterbox, Drama 3, Qwen3 and voice change use their shared format runner. Mock browser checks cover provider URLs, saved selections, a custom fal entry, payloads and Library persistence.
2. Video lipsync separates source fps from selected seconds. Its slice is capped at 30 seconds; conditioning frames derive from duration × source fps and the available frame count. Conditioning and output use the trimmed audio. Numeric checks resolve the actual graph links at 15, 24 and 60 fps, including a selection longer than 30 seconds. Photo lipsync checks assert 750 frames / 25 fps and the 30-second audio trim directly.
3. Qwen3 is format-only: its catalog entry is removed from the generic Flows picker, while its Audio format requires a voice sample and its model link still opens that format.
4. Before Generate or Run, the workspace and shared sheet show the 81-frame effective range, selected start, sampling stride where relevant, and a labeled 30 fps time example. Longer trim selections remain selectable, but the note explicitly says their remainder is not generated. This discloses the graph limit rather than claiming longer graph support.
5. Mixed media uses explicit source-frame sampling. Labels say every third, second or every frame and show actual-rate examples: 30 fps becomes 10, 15 or 30 fps. The graph receives the chosen stride. The pinned core-node schemas do not offer exact-rate conversion. Checks cover all 33 looks, strengths, strides and four source rates.
6. Upscale shows expected dimensions and effective scale from uploaded dimensions, plus the 4096px image / 3840px video enlargement limit. A 1920 × 1080 video at 4x visibly reports 3840 × 2160 (2x). Numeric graph checks exercise the 4x cap in both image workflows and video.
7. Drama 3 displays “Built with Fish Audio,” a short revenue/hosted-service/voice-rights note and the [license](https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE) in the studio and format info. Voice samples have an adjacent consent/right-to-use line. No licensing policy decision was made; the disclosures do not establish eligibility or permission for a hosted deployment.

The studio graph assertion recursively rejects unresolved placeholders, actual `undefined` values and embedded `undefined` text, including explicit missing-variable regressions. Studio workspaces use a second-level format heading beneath the page heading; browser checks require one page heading.

All screenshots use a production build with a local mock API. The portrait, silent color clip and tone are synthetic fixtures, not model outputs. No provider routes, real keys or paid generations are used. The capture waits for decoded, paused video frames.

Reproduce on `<windows-host>` with `npx vite build`, then `node scripts/verify.mjs`. The owned scratch clone is `<lane-root>/issue101-review-20261019`. Put Git Bash (`C:/Program Files/Git/bin` and `C:/Program Files/Git/usr/bin`) first in that process's path; the default Windows `bash` is the WSL launcher and cannot run the native Windows shell fixtures. Commands run sequentially, with one headless Chrome instance per browser check. Protected Pod files and main's Comfy target routing are unchanged.

The suite passes all 18 check scripts, including 436 studio runner cases and 23 mocked generation requests (18 format runs plus five restored provider paths). It writes 25 labeled mock screenshots: 12 desktop/390px pairs plus the scrolled mixed-media controls capture. Exact output is in [validation.txt](validation.txt).

Review examples: [video upscale cap](mock-upscale-video-390.png), [Drama 3 attribution and consent](mock-drama3-390.png), [ReCamMaster effective range](mock-reshoot-desktop.png), [mixed-media sampling and range](mock-mixed-media-sheet-controls-390.png), and [restored ElevenLabs sound effects](mock-audio-provider-390.png).

Translate remains disabled because its dub graph is missing. Lipsync remains about 480p; the unavailable 720p model and Wan 2.2 S2V are still disclosed as unavailable. These checks prove local wiring and mocked provider payloads, not live generation quality.
