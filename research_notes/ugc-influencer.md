# Creator videos and influencer motion

## Reference audit

Reviewed on October 19, 2026, without login or generation:

- Local audit: [Tools and studios](Higgsfield%20feature%20audit/sections/02_tools_and_studios.md), influencer, motion control and Marketing Studio sections; [Apps](Higgsfield%20feature%20audit/sections/03_apps.md), Click to Ad and creator/product apps; [Presets](Higgsfield%20feature%20audit/sections/05_presets.md), creator collections and Marketing Studio presets.
- [Public influencer page](https://higgsfield.ai/ai-influencer): character builder, a portrait/full-body pair, then a trend or uploaded motion clip. The signed-out page advertises 3–30 seconds; that is a competitor limit, not our contract.
- [Public influencer walkthrough](https://higgsfield.ai/blog/new-ai-influencer): Create/Motion on the left, Explore/History on the right, saved characters and recreate actions.
- [Public marketing overview](https://higgsfield.ai/marketing-automation): reusable generated avatars and products, with separate review, tutorial, unboxing and direct-to-camera directions.

These references establish structure, not tested provider behavior. We retain ComfyField's glass layout, media and copy. No competitor media is bundled.

## Implemented behavior

Four formats: Product review, Unboxing, Product tutorial and Presenter talking head. Each picks a fictional adult character and product from Library, plus a brief with verified product facts. An unchecked rights confirmation requires permission for the presenter photos or likeness, product images and reference clip while explicitly excluding real-person presenters. The existing influencer studio gains a Creator video tab and keeps its Create/Motion and Explore/History structure. Formats also appear in the ads app hub and in each saved presenter's Use menu.

Before any writer or generation request, all step workflows are checked with `podNeedsOf`, `notOnCloud` and `minVramOf` against the current run type and Session state. Speech requires a ready Session; unboxing/tutorial require at least 32 GB of graphics memory. A blocked format offers the existing Run as a Session action.

1. Qwen Image Edit 2511 stages the Library character and product together. The still is immediately saved to Library.
2. A writer drafts 8–12 spoken words for one five-second beat, using the brief and staged image. The script is editable. The editor discloses the approximately 480p canvas and 30-second limit, counts words and blocks scripts over 60 words. The workflows also cap speech to 30 seconds.
3. Send to render releases the writer into an explicit approval gate. Select the script and press Send. Speech and final video cannot run before both actions.
4. Review and talking head reuse InfiniteTalk's speech graph. Unboxing and tutorial compose LTX 2.5 image-to-video, Chatterbox speech and InfiniteTalk video lipsync using native graph links. The reviewed script feeds speech only; visual direction stays separate.
5. The final video saves to Library through the existing generation adapter, including format and run metadata. History shows all stills and videos from these five formats. The page retains its engine/session before starting, retries failures without rerunning completed staging, and locks input/format changes throughout final rendering. Editing a completed script marks its video as older; Send and approval keep that video until the user explicitly chooses Rerun video.

Influencer motion picks a saved fictional adult and a reference video, with optional scene direction. It runs the existing Wan Animate 2 graph. The selected trim is normalized to 16 fps and capped at 81 frames. Length rounds down to 4n+1 frames: five seconds becomes 77 frames (4.81 seconds), and the maximum is 81 frames (5.06 seconds). The form shows the computed output length. Reference audio is always dropped; there is no keep-audio option. The pinned [VideoHelperSuite loader](https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite/blob/4d907bee61e92c2e65af3bd6383a4e4d356126d1/videohelpersuite/load_video_nodes.py) applies the forced rate before skipping/capping frames. No real-person face upload, cloning or identity transfer is exposed by this page.

## Model and scope boundaries

Qwen 2511, LTX 2.5 and Wan Animate use the existing cloud-flagged loader files in shared/modelFiles.js. Chatterbox also has Cloud support. InfiniteTalk still needs a Session because its wav2vec2-chinese-base_fp16.safetensors dependency is cloud: false. Both final speech graphs therefore block before preparation until the full format fits a ready Session. No Pod or routing code was changed. Shared support only adds the normalized video loader to the existing upload and pinned pack maps, motion frame variables, and an unchecked affirmative confirmation choice. Actual availability and visual fidelity still need a separately budgeted live run. No keys or paid runs were used here.

The character attribute builder remains an explicitly unwired scaffold. Use an already generated character saved in Library. Library does not record verifiable image provenance, so the required fictional-only and rights confirmation is a user attestation, not automatic identity or provenance verification. The empty voice Library is not exposed: speech uses Chatterbox's default synthetic voice. Multi-shot editing, captions, packaging references, publishing and a community trend feed are outside these two issues. A five-second unboxing/tutorial is one demonstration beat, not a complete edited campaign. The new graphs reuse pinned nodes but have only mocked and structural verification, not live render evidence.

## Verification

Validation, mocked end-to-end behavior, build output and screenshot evidence are recorded in [the verification report](screenshots/ugc-influencer/checks.md). Screenshots use labeled synthetic fixtures, not generated provider output.

## Shared runner handoff

`src/lib/formats/runner.js` is unchanged. Today its `runFormat` awaits the initial engine pass and throws before returning the session when a writer or model fails. `presenterSession.js` temporarily owns the compiled engine and the same Library adapter before that pass; the studio receives it through `generateFormat(..., { onSession })`. Returning that same session on failure (for example, attaching `{ session }` to the thrown error before any failure check) would let the page retain `error.session` and retry `session.engine.runNew(session.flow)` without the duplicated presenter adapter. An optional `onSession(session)` callback before the initial pass would additionally expose activity while the first pass is still running. The shared change should preserve the existing throwing behavior and Send/Rerun rules.
