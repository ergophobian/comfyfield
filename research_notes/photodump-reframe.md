# Photodump and Reframe

## Evidence and scope

Based on the signed-out 2026-10-16 Higgsfield audit: [overview](Higgsfield%20feature%20audit/README.md), [route index](Higgsfield%20feature%20audit/route-index.md), [tools and studios](Higgsfield%20feature%20audit/sections/02_tools_and_studios.md), [apps](Higgsfield%20feature%20audit/sections/03_apps.md), and [presets](Higgsfield%20feature%20audit/sections/05_presets.md). No login or generation was performed. The audit's Reframe capture is blank, so its behavior below comes from the audit's help/plugin notes, not a claimed visual reconstruction of authenticated controls.

## Photodump

Higgsfield opens a three-step modal: select a preset with four preview scenes, create or select a Soul character, then review and generate. Nine themed sets produce varied photographs of one identity. Soul 2.0 documentation describes 15 photos; the older studio described 26 and required 25 training photos. The underlying composer shows 3:4 and 2k. Outputs save to the Soul page and Assets.

ComfyField keeps the existing three-step layout, nine original themed sets and shot preview grid. Users upload one to three references, or choose a saved character's first three photos, then select 4, 8, 15 or 26 separate shots, ratio and canvas quality. Each scene has its own independent Qwen edit 2511 job and prompt; the original references feed every job rather than chaining one generated face into the next. Quality selects an explicit canvas up to 2k or 1.5k, with exact selected ratios and dimensions divisible by eight. Each result uses the shared queue and persists in the Library. This is reference inference, not character training, and identity fidelity has not been assessed live.

## Reframe

The audit documents: open Edit → Reframe, upload video, choose a target ratio, generate. The plugin tracks the subject. Ratios include 9:16, 16:9, 4:3, 3:4, 21:9 and 1:1. Still-image Expand generates new content beyond existing borders. No model is named. Video outpaint and tracking cannot be inferred from the blank captured page.

ComfyField adds image/video selection to the existing upload/stage/settings layout. Image mode takes a source, target ratio and optional direction for the new edges. Its layout preview contains the entire source. The graph scales the source to fit, pads a centered canvas, conditions Qwen edit 2511 on that padded source, generates at target dimensions, and composites the source center back with a feathered seam. Output uses the shared runner and Library. The source may be resized; this does not promise original pixel dimensions or a tracking implementation. With a matching ratio there may be no new border.

Video mode remains a clearly labeled preview with a disabled action. There is no bundled video outpaint/tracking graph, and adding the required capability would exceed a core-node, existing-model-only implementation. No invented tracking toggle or active no-op generation button remains.

## Implementation boundaries

New workflows: `qwen2511_photodump` and `qwen2511_reframe`. Both use only nodes in the core schema and already declared, Cloud-flagged Qwen edit 2511 model, encoder, VAE and Lightning LoRA files. Both are untested live. Existing `klein_character`, `flux_character_set` and `qwen_edit_outpaint` depend on models flagged unavailable on Cloud; they were reference designs rather than the selected execution paths. No routing or Pod changes.

Motion and Effects already link their presets to AppPage's format runner and remain unchanged. The shared generation adapter now stores an explicit output aspect ratio ahead of the source ratio, so reframed images retain the target shape in Library cards.

## Verification

`photodump-reframe-checks.mjs` validates every set/size combination, reference and prompt propagation, all ratio/quality variants, graph links, core nodes, declared Cloud files and the preserved-center composition. `photodump-reframe-ui-check.mjs` runs against a separate mock server without provider routes or environment loading. It covers photo and saved-character inputs, optional references, batch size, ratio, quality, error recovery, image reframe, the disabled video path and Library after reload. Mock screenshots live in `screenshots/photodump-reframe/` and are not live model outputs.

An exploratory 390px check of the existing Library page found horizontal overflow. Library persistence is verified; Library layout was outside this lane and remains unchanged. Photodump and Reframe themselves are checked at 390px.

Final Windows validation: production build passed; all 18 check scripts passed, including format, format runner, Comfy graph, integration, theme and browser checks. Pod shell fixtures used Git Bash first in the scratch process Path. The build reports a bundle-size warning. See [verification output](screenshots/photodump-reframe/verification.txt).
