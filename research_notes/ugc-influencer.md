# Creator videos and influencer motion

## Reference audit

Reviewed on October 19, 2026, without login or generation:

- Local audit: [Tools and studios](Higgsfield%20feature%20audit/sections/02_tools_and_studios.md), influencer, motion control and Marketing Studio sections; [Apps](Higgsfield%20feature%20audit/sections/03_apps.md), Click to Ad and creator/product apps; [Presets](Higgsfield%20feature%20audit/sections/05_presets.md), creator collections and Marketing Studio presets.
- [Public influencer page](https://higgsfield.ai/ai-influencer): character builder, a portrait/full-body pair, then a trend or uploaded motion clip. The signed-out page advertises 3–30 seconds; that is a competitor limit, not our contract.
- [Public influencer walkthrough](https://higgsfield.ai/blog/new-ai-influencer): Create/Motion on the left, Explore/History on the right, saved characters and recreate actions.
- [Public marketing overview](https://higgsfield.ai/marketing-automation): reusable generated avatars and products, with separate review, tutorial, unboxing and direct-to-camera directions.

These references establish structure, not tested provider behavior. We retain ComfyField's glass layout, media and copy. No competitor media is bundled.

## Implemented behavior

Four formats: Product review, Unboxing, Product tutorial and Presenter talking head. Each picks a fictional adult character and product from Library, plus a brief with verified product facts. The existing influencer studio gains a Creator video tab and keeps its Create/Motion and Explore/History structure. Formats also appear in the ads app hub and in each saved presenter's Use menu.

1. Qwen Image Edit 2511 stages the Library character and product together. The still is immediately saved to Library.
2. A writer drafts 8–12 spoken words for one five-second beat, using the brief and staged image. The script is editable.
3. Send to render releases the writer into an explicit approval gate. Select the script and press Send. Speech and final video cannot run before both actions.
4. Review and talking head reuse InfiniteTalk's speech graph. Unboxing and tutorial compose LTX 2.5 image-to-video, Chatterbox speech and InfiniteTalk video lipsync using native graph links. The reviewed script feeds speech only; visual direction stays separate.
5. The final video saves to Library through the existing generation adapter, including format and run metadata. History shows all stills and videos from these five formats.

Influencer motion picks a saved fictional adult and a reference video, with optional scene direction. It runs the existing Wan Animate 2 graph. The selected video trim is passed through; otherwise the first five seconds run. No real-person face upload, cloning or identity transfer is exposed by this page.

## Model and scope boundaries

Qwen 2511, LTX 2.5 and Wan Animate use the existing cloud-flagged loader files in shared/modelFiles.js. Chatterbox also has Cloud support. InfiniteTalk still needs a Session because its wav2vec2-chinese-base_fp16.safetensors dependency is cloud: false. Both final speech graphs therefore follow the existing Session fallback; this requirement appears before preparation in the format output copy. No Pod or model-file code was changed. Actual availability and visual fidelity still need a separately budgeted live run. No keys or paid runs were used here.

The character attribute builder remains an explicitly unwired scaffold. Use an already generated character saved in Library. Library does not record verifiable image provenance, so the fictional-only label is a user constraint, not an automatic identity classifier. The empty voice Library is not exposed: speech uses Chatterbox's default synthetic voice. Multi-shot editing, captions, packaging references, publishing and a community trend feed are outside these two issues. A five-second unboxing/tutorial is one demonstration beat, not a complete edited campaign. The new graphs reuse pinned nodes but have only mocked and structural verification, not live render evidence.

## Verification

Validation, mocked end-to-end behavior, build output and screenshot evidence are recorded in [the verification report](screenshots/ugc-influencer/checks.md). Screenshots use labeled synthetic fixtures, not generated provider output.
