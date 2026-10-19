# Router breadth

Public metadata researched on 2026-10-19. No keys, paid generations or provider account changes. Quality positioning below is a selection rationale, not a measured quality ranking.

Sources: [public documentation index](https://docs.comfy.org/llms.txt), [Router pricing](https://docs.comfy.org/development/comfy-router/pricing), [model schemas](https://docs.comfy.org/development/comfy-router/schemas), [queue contract](https://docs.comfy.org/development/comfy-router/queue). Input snapshots come from `https://docs.comfy.org/router-schemas/<provider>/<model>.json`. Pricing uses Comfy serving rates, with 211 credits per dollar, rather than partner list prices.

| Model id | Kind | Published price | Why chosen |
| --- | --- | --- | --- |
| `bfl/flux-2-pro` | Image and edit | 0.266 credits per gpu second, about $0.001261 | Existing general image model; now maps up to nine ordered references |
| `bfl/flux-2-max` | Image and edit | Same gpu time rate as Pro | Premium detail option with the same reference contract |
| `bfl/flux-kontext-pro` | Image edit and generation | $0.04 per image | Predictable fixed price edits; up to four references |
| `luma/photon-flash-1` | Text to image | 0.5733 credits, about $0.002717 per image | Very low published fixed image price |
| `byteplus/seedream-5-0-flash-260915` | Image and edit | 5.4311 credits, about $0.025740 per image | Budget edits and image generation; up to ten references |
| `byteplus/dreamina-seedance-2-5-260628` | Text and image to video | $15.301 per million video tokens at 720p, without a reference video | Existing premium video path; single first frame or ordered multiple reference images |
| `byteplus/seedance-1-0-pro-fast-251015` | Text and image to video | $1 per million video tokens | Budget video with a first frame; defaults to 720p |
| `ltx/ltx-2-5-fast` | Text to video with audio | $0.1287 per second at 720p | A different video family with a simple time rate |
| `elevenlabs/eleven_v4_turbo` | Speech | $0.0572 per thousand characters | Lowest published character rate among the listed ElevenLabs speech models; one dialogue input uses the public Rachel voice |
| `elevenlabs/eleven_sfx_v2` | Sound effects | $0.14 per minute | Duration priced sound effects, with an explicit five second default |
| `openai/gpt-4.1-nano` | Text and image input, text output | $0.10 input and $0.40 output per million tokens | Low cost writer without reasoning output; kept outside the media picker |

Other public candidates: `pruna/p-video-2` draft costs $0.02145 per second at 720p; `xai/grok-imagine-video-1.5-lite` costs $0.0286 per second at 480p or $0.0429 at 720p. `veo/veo-3.1-lite-generate-001` is available with nested native image/video inputs. These remain outside this bounded selection. `openai/gpt-5-nano` has a lower input rate ($0.05 per million tokens, output $0.40), but the non-reasoning 4.1 Nano contract is a better bounded writer default. `elevenlabs/eleven_multilingual_v2` costs $0.24 per thousand characters, so the cheaper v4 turbo dialogue model supplies one voice here. `byteplus/seed-audio-1.0` and its multilingual sibling cost $0.003575 per generated second; this differs from character billing, so they cannot be ranked against speech without a sample duration. These comparisons do not establish an absolute cheapest or best model across differing units and settings.

## Implementation

Ten media models are exposed through the existing Comfy-key gate in the picker and shared core catalog. Eight are new. The writer uses a separate text model. Image count remains one native request per requested image, shared by app and core callers; native single-image models receive no invented count field. Composer mappings cover dimensions or aspect, supported duration, and ordered references. Router image attachment controls and video aspect choices follow the catalog capabilities. Ltx is text-only through this Router contract; it does not silently accept an image.

Public schema refresh uses `node scripts/format-schemas.mjs --router`, retaining fal snapshots and never reading provider configuration. Local references and composed `allOf` schemas are resolved before snapshotting nested validation constraints. Format validation covers every curated Router model, including media fields, ranges and nested required values. The public writer schema is snapshotted too.

`writePrompt` keeps its existing validation and editable-review contract. Google remains preferred when configured. With only a Comfy key, the synchronous Router text endpoint receives unchanged instructions, note, target and ordered inline images. Only completed assistant text is returned. Refusal, incomplete output, provider errors and empty output fail clearly, without resubmission.

Native image results are collected from Seedream `data[].url`, Luma `assets.image`, and existing result contracts. Echoed Luma input references cannot be mistaken for generated outputs. Binary audio is saved locally, including a playable mp3 extension for `audio/mpeg`.

## Limits and open questions

- Actual availability for a particular Comfy account, media quality and billed charges remain unverified. All generation and writer checks use mocks.
- Flux charges by gpu time; no duration-based cost is invented from composer settings. The picker displays its unit rate and run estimates remain unknown.
- Seedance video token estimates assume 720p and 24 frames per second and remain approximate. Native overrides or account/provider routing can change charges.
- Speech uses Rachel by default. Native callers can supply `params.voice_id`; the existing sample voice picker and delivery/language controls remain scaffolds.
- Only public metadata was fetched. No protected RunPod files or `comfyTarget` / `runComfy` routing were changed.

## Evidence

Windows validation checkout: `C:/Users/User/cf-router-breadth-32a4422e`, host `pi-windows`. Build and check processes run sequentially; Chrome is headless. Provider configuration is removed from the verification process environment. The runner explicitly selects Git Bash instead of the Windows WSL Bash alias for shell fixtures.

Picker screenshots use a fake key saved through the mocked Connections page, then show Router favorites with native model names and published unit prices. No real output media is depicted.

- [Desktop image picker](screenshots/router-breadth/image-picker-desktop.png)
- [390px image picker](screenshots/router-breadth/image-picker-390.png)
- [Desktop video picker](screenshots/router-breadth/video-picker-desktop.png)
- [390px video picker](screenshots/router-breadth/video-picker-390.png)
- [Desktop audio picker](screenshots/router-breadth/audio-picker-desktop.png)
- [390px audio picker](screenshots/router-breadth/audio-picker-390.png)

Validation completed:

- `npx vite build`: passed, 328 modules; existing large chunk warning remains.
- `node scripts/verify.mjs`: 17/17 check scripts passed.
- `scripts/comfy-checks.mjs`: 15/15 checks, including all curated mappings, native results, counts and cli/mcp listing.
- `scripts/writer-check.mjs`: 8/8 checks, including Comfy-only writing, Google preference and failure handling.
- Router browser fixture: ten model selections and mocked requests; desktop and 390px checks; six screenshots; no runtime exceptions.
- `git diff --check`: passed. Protected file paths and workflow routing were checked unchanged.

The first Windows full run used the WSL Bash alias and failed unchanged Pod shell fixtures. Selecting installed Git Bash made all 75 Pod checks pass, then the complete final suite passed. No repository workaround was needed.

[Full build and verification output](screenshots/router-breadth/verification.txt).

## Review fixes after rebasing main

Rebased `90e1e1c` onto `origin/main` at `7ee3b1c` without conflicts; the original breadth commit is now `3f17537`. Main's Instant/Session and Skills code is retained. The protected Pod files and `comfyTarget` / `runComfy` routing remain unchanged relative to main.

All seven review findings are fixed:

1. Partial image batches save each completed image to the Library immediately. A batch snapshots its native body and assigns one stable key per image. Retry skips completed images, reuses outstanding keys, and ignores duplicate retry clicks. The real hook/browser fixture loses the second accepted response in a three-image batch: four submissions use three unique keys, all three images persist, and image one is never submitted twice. Retry state lives in the current session; completed Library items survive reload.
2. The Router mapper consumes ordered `slots.pictures`, including saved character and product pictures. Without slots it combines uploaded pictures and saved character/product references without duplicating pictures already present in `images`. Validation samples now contain real reference-shaped values, rather than silently empty Library entries.
3. Seedream `b64_json` results decode to local image files. Their media paths also support the shared CLI download/copy adapter.
4. The Router writer sends `Idempotency-Key`, accepts a caller-supplied stable key, retains the key on errors, and includes `X-Comfy-Request-Id` in diagnostic errors. The browser assigns the key to the logical writer request before sending; the local route preserves both diagnostic fields. This follows the public [error guidance](https://docs.comfy.org/development/comfy-router/errors) and [header contract](https://docs.comfy.org/development/comfy-router/headers). Tests cover same-key recovery, generated keys, incomplete output and malformed responses.
5. Format validation injects an upstream image into Router options, matching the runtime adapter. Flux to Photon/Ltx fails before any generation, including approval-gated chains and alternate targets. Supported Flux chains still validate.
6. Queued status/result reads handle retryable responses before parsing, honor `Retry-After`, and retain the original job. Malformed or non-object JSON produces a contextual error rather than a parser exception. Checks cover HTML 429/503 responses at both read stages and malformed successful responses.
7. Image studio limits combine uploads and Library pictures, reserve slots while uploads are pending, prevent further Library attachment at capacity, and block Generate after switching to a model with a smaller limit. Existing references remain visible so the user can remove them explicitly.

Additional review items are fixed: both audio models accept binary `application/octet-stream` as mp3; object schemas reject numbers, null, arrays and strings; every picker model has a hand-written native payload expectation independent of the production mapper; 390px picker price units wrap visibly rather than clipping.

Windows scratch clone: `C:/Users/User/cf-router-review-32a4422e`. Commands run sequentially with only an allowlist of operating-system environment variables, Git Bash on the path, no `.env` or saved configuration, and mocked provider requests. No keys or paid generations were used. Live provider behavior, account availability and billing remain unverified.

Final validation: production build passes (334 modules, existing chunk-size warning); `node scripts/verify.mjs` passes 17/17 scripts, including 21 core checks, 9 writer checks, 82 unchanged Pod checks, and the extended Router browser fixture. The latter checks ten picker models, native payloads, combined references, partial recovery, duplicate-click protection, Library reload, and 390px layout.

- [Full review build and check output](screenshots/router-breadth/review-verification.txt)
- [Partial batch after failure](screenshots/router-breadth/partial-batch-failure.png)
- [Recovered batch with three results](screenshots/router-breadth/partial-batch-recovered.png)
