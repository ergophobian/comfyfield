# Video edit graphs on open models

Research date: 2026-10-19. Scope: the `video-edit` family graphs `bernini_mixed`, `bernini_grade`, `bernini_edit`, `bernini_clone_edit`, `bernini_recreate_ad`, `void_inpaint`, `ltx25_clean_plate`, `video_bg_change`, `scail2_character_swap` and `recammaster`, and the formats that name them in `src/lib/formats/*.js`.

Tags: **[Verified: source]** means I read it in a primary source on this date. **[Inference]** means my conclusion. No weights were downloaded, no API keys were used and ComfyUI was not run. Graphs follow the conventions of `research_notes/engine/genjutsu.md` and the shipped `public/workflows/bernini_*.json`.

## Summary

| Graph | Model | LoRAs | Every file on Comfy Cloud | Node packs | GPU class | Download GB | Formats served |
|---|---|---|---|---|---|---|---|
| `bernini_mixed` | Bernini-R 14B (fp8, two experts) | LightX2V T2V rank 64 (3.0 high, 1.5 low) | yes | none (core only) | 24 | 38.76 | the 33 `mm-*` looks in `mixedx.js` |
| `bernini_grade` | Bernini-R + core Transfer Color | same | yes | none (KJNodes no longer needed) | 24 | 38.76 | `color-grade` |
| `bernini_edit`, `bernini_edit_ref` | Bernini-R v2v / rv2v | same | yes | none | 24 | 38.76 | `edit-video` (`_ref` when a reference is attached) |
| `bernini_clone_edit` | Bernini-R rv2v, 1 to 3 references | same | yes | none | 24 | 38.76 | `clone-edit` (one segment, see below) |
| `bernini_recreate_ad` | Bernini-R rv2v, 1 to 2 references | same | yes | none | 24 | 38.76 | `recreate-ad` (one segment, see below) |
| `void_inpaint` | VOID (Netflix, CogVideoX-Fun 5B, two passes) + SAM 3.1 text masks | none | yes | none | 32 | 34.27 | `video-erase`; proposed for `video-remove-text` |
| `video_bg_change` | Bernini-R + SAM 3.1 + BiRefNet | LightX2V T2V | yes | none | 24 | 40.95 | `video-bg-change` |
| `scail2_character_swap` | SCAIL-2 14B int8 + SAM 3.1 | SCAIL-2 DPO (1.0), LightX2V I2V 480p rank 64 (0.8) | yes | none | 24 | 28.62 | `video-character-swap` (keep-background case) |
| `recammaster` | ReCamMaster (Kling, Wan 2.1 1.3B) | none | yes | ComfyUI-WanVideoWrapper (Cloud preinstalls it) | 24 | 9.97 | `reshoot` |
| `ltx25_clean_plate` | **skipped** | | | | | | `video-remove-text` |

"Download GB" adds every file the graph's loaders name, including files already in `MODEL_FILES` (bytes / 1e9 from the Hugging Face API). Every one of these files is in Comfy Cloud's model listing under the exact name and folder, so all ten graphs can run on Cloud at once; `recammaster` also needs WanVideoWrapper, which Cloud preinstalls. [Verified: `https://cloud.comfy.org/api/experiment/models/<folder>`, `supported-nodes.md`] Cloud reports ComfyUI v0.41.1, the Pod's version. [Verified: `/api/system_stats`]

The checks in `check.md` found 0 problems in the ten graphs (the same checker passes the shipped `bernini_*`, `wan_animate2` and `ltx25_i2v` graphs).

## Conventions shared by all graphs

- Input: `LoadVideo` `{{video}}` → `Video Slice` (`{{start}}`, `{{duration}}`) → `GetVideoComponents`, as the shipped graphs. [Verified: shipped graphs]
- Size: nodes 80, 83 and 84 read the clip size and scale the long edge down to the model's size in multiples of 16 (32 for SCAIL-2), with `ComfyMathExpression`. No `{{width}}`/`{{height}}`. Clips smaller than the cap keep their size.
- Frames: node 82 caps the count to a legal `4n+1` (81 for Bernini-R, SCAIL-2 and ReCamMaster); VOID uses its own even-latent rule (117). No `{{frames}}`.
- Audio and fps: `CreateVideo` takes the trimmed clip's audio and fps. The audio can be longer than the output frames: `VideoFromComponents.save_to` cuts the waveform to `frames / fps`, so no audio trim node is needed. [Verified: `comfy_api/latest/_input_impl/video_types.py` line ~1178]
- `SaveVideo` keys copy `ltx25_i2v.json` (`format`, `codec`, `format.codec`). Prefixes are `comfyfield/<graph id>`.
- Bernini prompts start with the Bernini task prefix joined with no space, as the shipped graphs. [Verified: `SYSTEM_PROMPTS` in `bytedance/Bernini` `bernini/prompt_enhancer.py`]
- Memory: `GetVideoComponents` decodes the whole trimmed clip as float32. A 10 s 1080p 30 fps clip is about 7.5 GB of system RAM. [Inference: 300 × 1920 × 1080 × 3 × 4 bytes]

## 1. `bernini_mixed` (33 mixed media looks)

- **Template:** `video_bernini_r_video_editing` (2026-06-14), Turbo values: LightX2V T2V 3.0 / 1.5, `res_multistep`, `simple`, 6 steps split 3, CFG 1, `ref_max_size` 848. [Verified: template JSON] Same core block as the shipped `bernini_restyle.json`, with its shortened negative and the v2v prefix.
- **Frame drop with core nodes only.** Core v0.41.1 has no "select every nth frame" node and no video frame rate change node. [Verified: node list of `comfy_extras/*.py`] But `RebatchImages` takes and returns lists (`is_input_list=True`, output `is_output_list=True`), and a normal node run on a list runs once per item. [Verified: `comfy_extras/nodes_rebatch.py`] So:
  - #86 `n = max(1, floor(source_fps / {{fps}}))`
  - #87 `RebatchImages(batch_size=n)` splits the clip into chunks of n frames
  - #88 `ImageFromBatch(batch_index 0, length 1)` keeps the first frame of each chunk
  - #89 `RebatchImages(batch_size 4096)` joins them into one batch again
  - #90 output fps = `source_fps / n`, so the timing and the audio stay exact.

  `floor` keeps the result at or above the asked rate: 24 fps → 8 / 12 / 24 exact; 30 fps → 10 / 15 / 30; 25 fps → 8.33 / 12.5 / 25; 60 fps → 8.57 / 12 / 30. [Inference: computed] The frames are dropped before Bernini, so the 81-frame cap covers 10.1 s at 8 fps, 6.75 s at 12 fps and 3.4 s at 24 fps (24 fps source). [Inference]
  The alternatives need a pack: VideoHelperSuite `VHS_SelectEveryNthImage` (already pinned in `NODE_PACKS`) or a VHS `force_rate` load (but `{{video}}` must go into core `LoadVideo`). Both are preinstalled on Cloud; the core path needs neither. [Verified: `shared/modelFiles.js`, `supported-nodes.md`]
- **Strength.** Recommended mapping: the prompt word the format already adds (`{strength}` text) plus a final core `ImageBlend` (`normal`, `blend_factor = {{strength}}`) of the look over the same frames of the real footage, resized and center-cropped as Bernini does (#91, #92, #93). "Subtle" 0.45 keeps 55 % of the footage, which is what its copy says ("the real footage shows through"). [Verified: `ImageBlend` code: `image1 * (1 - f) + image2 * f`] Why not the other two:
  - *Denoise:* `BerniniConditioning` returns an all-zero latent and puts the source in `context_latents`, so `denoise < 1` on that latent starts from black, not from the clip. [Verified: `comfy_extras/nodes_bernini.py`] An SDEdit start would need a `VAEEncode` of the clip. Even then, the default shift is 8 and the graph adds no shift node, so 0.85 / 0.65 / 0.45 on the 6-step schedule start at sigma 0.98 / 0.94 / 0.87, almost the same noise. [Verified: `WAN21_T2V.sampling_settings` shift 8.0, `WAN21` handles Bernini's `context_latents` in `comfy/model_base.py`, `BasicScheduler` code] [Inference: Bernini-R, a 16-channel A14B model, loads as `WAN21_T2V`; sigma values computed]
  - *Sigma split:* `SplitSigmas` only decides which expert does which steps. It is not a strength control. [Inference]
- **Nodes:** 1-3 input; 85-90 frame drop; 80-84 size and length from the dropped frames; 4-18 Bernini Turbo; 91-93 blend; 19-20 output.
- **Placeholders:** `video`, `start`, `duration`, `prompt`, `seed`, `fps`, `strength`. Both params exist in `mixedx.js`.
- **Deviations from the template:** the frame drop and the blend; size and length from the clip; output fps from the drop. [Inference: Bernini-R was trained at 16 fps; 8 fps input has twice the motion per frame. Untested.]
- **Format changes:** none required. Update the comment in `mixedx.js` ("core ComfyUI has no node that drops frames"), which is no longer true for this graph. The label "1 to 10 seconds" holds only at 8 fps; at 24 fps the first 3.4 s are processed.

## 2. `bernini_grade` (`color-grade`)

- **Base:** genjutsu's draft (Bernini-R v2v + KJNodes `ColorMatch`), brought to the shipped conventions. Two changes make it better than the draft:
  - **Core `ColorTransfer` replaces KJNodes `ColorMatch`.** v0.41.1 has `ColorTransfer` (display name "Transfer Color", methods `reinhard_lab`, `mkl_lab`, `histogram`; `source_stats` `per_frame` / `uniform` / `target_frame`). [Verified: `comfy_extras/nodes_post_processing.py`] KJNodes `ColorMatch` is marked `DEPRECATED = True` at the pinned commit `17195fcf` (2026-10-15), with `ColorMatchV2` as its successor. [Verified: `ComfyUI-KJNodes/nodes/image_nodes.py` at that commit] So the graph needs no pack. The SCAIL-2 template also uses core `ColorTransfer`. [Verified: template]
  - **Whole clip at full size.** Bernini grades up to 81 frames picked evenly over the whole clip (#85 `n = ceil(frames / 81)`, the same core frame drop as `bernini_mixed`). `ColorTransfer` with `mkl_lab` and `uniform` pools the color statistics of all original frames and of all Bernini frames and applies one Lab transform to every original frame. [Verified: `_build_lab_transform`, uniform branch] The output keeps the clip's full length, size, fps and audio, and grades it like a LUT. [Inference] `per_frame` would map frames past the Bernini range onto the last Bernini frame (`ri = min(i, B_ref - 1)`), so it is not used. [Verified: code]
- **Nodes:** 1-3; 80 size; 85-88 spread frames; 79, 81, 82 length of the spread frames; 83-84 size; 4-18 Bernini Turbo (v2v, restyle negative); 90 `ColorTransfer`; 19-20 output.
- **Placeholders:** `video`, `start`, `duration`, `prompt`, `seed`.
- **Limits:** one global transform, so a grade cannot differ per shot; the affine Lab map can tint shadows and highlights differently through the L-to-a/b covariance but cannot do curves. [Inference] Full-size frames are held twice in RAM (input and output).
- **KJNodes fallback (not used):** repo `kijai/ComfyUI-KJNodes`, commit `17195fcfa8a05f601b766a0f09c9733284f47416` (2026-10-15, newest on main today, already the `kjnodes` pin in `NODE_PACKS`), class `ColorMatch` (or `ColorMatchV2`), requirements `pillow>=10.3.0`, `color-matcher`, `matplotlib`, `mss`, `opencv-python-headless`, Cloud: yes, downloads no models. [Verified: GitHub API, `requirements.txt`]
- **Format change:** `runsOn: 'Bernini-R'` (drop "KJNodes color match").

## 3. `bernini_edit` and `bernini_edit_ref` (`edit-video`)

- **Template:** as `bernini_swap_noref.json` and `bernini_swap.json`: v2v prefix without a reference, rv2v prefix with `{{image}}` in `reference_images.reference_image_0`. Full Wan negative, Turbo values. [Verified: template, shipped graphs]
- One graph cannot serve both cases, because the task prefix in the prompt text must change with the reference. The shipped pattern is two graphs and `imageWorkflow`: the app runs the image graph when an image is attached. [Verified: `src/lib/providers.js` line 71, `server/core.js` line 834, `edit.js` `swap-element`]
- The two files have the same nodes, values and links as `bernini_swap_noref.json` / `bernini_swap.json`; only node ids and the `SaveVideo` prefix differ. The format can point at the shipped files instead. [Verified: structural comparison of the four graphs]
- **SAM 3.1 is not used.** Bernini-R takes no mask (`BerniniConditioning` has no mask input), and a free instruction names no region to track. [Verified: node schema]
- **Format changes:** `workflow: 'bernini_edit', imageWorkflow: 'bernini_edit_ref'` (or the swap pair); `runsOn: 'Bernini-R'`. Optional: say "the reference image" in the prompt when `ref` is set.

## 4. `bernini_clone_edit` and `bernini_recreate_ad`

- Both formats name "Bernini-R and MiniMax H3" and promise a shot-for-shot remake of a whole edit or ad. The core of each is one Bernini-R rv2v pass: the reference video is the source, the cast or product images are references, and v2v keeps the cuts, pacing and camera. [Verified: template task table "rv2v: source_video + reference_image(s)"] That pass is one graph, so I drafted it. A full-length remake is a multi-step pipeline: split the reference at its cuts (or in 77-frame steps), run the graph per segment, join the clips. That pipeline and any H3 step are not drafted. [Inference]
- **`bernini_clone_edit`:** `{{image}}` → `reference_image_0` (cast 1), `{{image2}}` → `reference_image_1` and `{{image3}}` → `reference_image_2` with `_meta.optional`. All slots of the autogrow `reference_images` are optional (`min=0`), so a missing optional loader leaves a valid node. [Verified: `nodes_bernini.py`] Each slot is its own in-context stream; the authors report about 5 reliable streams. [Verified: template note]
- **`bernini_recreate_ad`:** product (Library pick) → `{{image}}`, character → `{{image2}}` (optional). `brand` is not treated as an image, per the contract (only character and product count). [Inference: if brand gives a logo image, character becomes `{{image3}}`]
- **Limit:** like every Bernini graph, only the first 81 frames of the trimmed clip are made (3.4 s at 24 fps). [Verified: `source_video[:length]` in the node code]
- **Format changes:** `runsOn: 'Bernini-R'`; mention the references by order in the prompt (the template advises "image0, image1, …"); say in the UI that one run remakes the first few seconds, or build the segment pipeline.

## 5. `void_inpaint` (`video-erase`)

- **Template:** `utility_void_video_inpainting` (2026-05-14), subgraph "Video Inpaint (VOID)": CLIPLoader `t5xxl_fp16` type `cogvideox`; VAELoader `cogvideox_vae`; `VOIDInpaintConditioning`; pass 1 `UNETLoader void_pass1` → `CFGGuider` cfg 6 → `BasicScheduler simple` 30 steps → `SamplerCustomAdvanced` with `RandomNoise` and `VOIDSampler`; pass 2 `void_pass2` with `OpticalFlowLoader` RAFT → `VOIDWarpedNoise` (from the pass 1 frames) → `VOIDWarpedNoiseSource`, cfg 6, 30 steps. Default 672×384. [Verified: template JSON]
- **Mask:** core SAM 3.1: `CheckpointLoaderSimple sam3.1_multiplex_fp16` → `CLIPTextEncode("{{target}}")` on its CLIP output → `SAM3_VideoTrack` (threshold 0.5, up to 4 objects, detect every frame) → `SAM3_TrackToMask` (all objects). The mask goes straight into `quadmask` as in the template (1 = remove). [Verified: `nodes_sam3.py`, `nodes_void.py`, template links]
- **Deviations:** `SAM3_VideoTrack` instead of the template's per-frame `SAM3_Detect`, for masks that stay on one object over time (the SCAIL-2 template tracks the same way); size from the clip, long edge 672; frames capped at 117 (latent 30, even, about the template's 5 s); pass 2 always runs; one `VOIDSampler` shared by both passes. [Inference]
- **Placeholders:** `video`, `start`, `duration`, `prompt`, `seed`, `target`.
- **VRAM:** the VOID README says "Requires a GPU with 40GB+ VRAM (e.g., A100)" for its own pipeline, at up to 197 frames. [Verified: Netflix/void-model README] ComfyUI offloads, and this graph caps at 117 frames at 672 px, so I class it 32 GB. [Inference: untested; use the 96 GB card if it runs out]
- **Format changes:** add `bindings: { target: 'target' }` so the raw `target` text reaches SAM; rewrite the prompt to describe the clean scene, not the removal: the VOID docs say "Describe the scene after removal. Focus on what remains" and the SAM prompt is "a short label", max 32 tokens. [Verified: docs.comfy.org VOID tutorial] Suggested prompt: `The same scene with a clean, natural background that continues the surroundings, with consistent lighting, texture and camera motion.` Suggested placeholder: `Person in the blue jacket`.

## 6. `ltx25_clean_plate` (`video-remove-text`): skipped

- The LTX-2.5 Clean-Plate IC-LoRA (`Lightricks/LTX-2.5-22b-IC-LoRA-Clean-Plate`, file `ltx-2.5-22b-ic-lora-clean-plate-1.0.safetensors`, 327,318,439 bytes, created 2026-09-09) is gated (`gated: "auto"`), its sha256 is hidden from the anonymous API, I found no ungated mirror on Hugging Face (searches `clean-plate`, `ic-lora`), and Comfy Cloud does not list it (Cloud has only the LTX-2.3 Clean-Plate). [Verified: HF API, HF search, Cloud `loras`] So a Pod cannot fetch it under the rules.
- It is also the wrong task: the three examples on its card all ask for "An empty clean plate of the exact same scene/location … No people, no humans", one also "no vehicles", that is, removing people and moving subjects, not on-screen text. [Verified: HF `cardData.widget`]
- **Proposal:** run `video-remove-text` on `void_inpaint`, with a `target` param per option (for example `all` → `text`, `subtitles` → `subtitles`, `captions` → `title text`, `logo` → `logo`) and the clean-scene prompt above. [Inference: SAM 3.1 segmenting text overlays is untested; test before shipping]
- **Cloud-only alternative:** Comfy's templates `template_ltx2_3_lora_remove_subtitles_from_video` and `template_ltx2_3_remove_watermark_from_video` (2026-05-21) use LTX-2.3 22B dev with `ltx2.3-ic-subtitles-remove-general.safetensors` (strength 1.2) or `ltx2.3-ic-watermark-remove-general.safetensors` (1.5), and need ComfyUI-LTXVideo and KJNodes. Cloud has both LoRAs, but I found no Hugging Face repo for them, so they cannot go into `MODEL_FILES`. [Verified: template JSON and index, Cloud listing, HF search]

## 7. `video_bg_change` (`video-bg-change`)

- **Base:** the Bernini-R v2v Turbo graph with the full Wan negative makes the new background from `{{prompt}}`. SAM 3.1 and BiRefNet then put the original person back over it:
  - #90-#91 the same frames as Bernini, scaled and center-cropped to its size
  - #92-#95 SAM 3.1 tracks `person` (up to 4) → #96 `GrowMask` 16 px
  - #97-#98 core `LoadBackgroundRemovalModel birefnet.safetensors` → `RemoveBackground` (a foreground mask, 1 = person, run frame by frame) [Verified: `nodes_bg_removal.py`, `comfy/bg_removal_model.py`]
  - #99 `MaskComposite multiply`: BiRefNet's soft edge (hair) limited to the tracked people
  - #100 `ImageCompositeMasked` of the original frames over Bernini's frames.
- **Template sources:** `video_bernini_r_video_editing`, `utility_birefnet_remove_background` (2026-05-10), `utility_video_segment_sam3`. No template does this combination. [Verified: template index]
- **Trade-off:** the person keeps the filmed light, because their pixels are the original ones; Bernini's relit person is discarded. Drop #90-#100 and wire #18 to #19 for a fully regenerated, relit result. [Inference]
- **Placeholders:** `video`, `start`, `duration`, `prompt`, `seed`.
- **Format change:** none needed. The copy "matching the light direction and color" overstates what the composite does. [Inference]

## 8. `scail2_character_swap` (`video-character-swap`)

- **Template:** `video_wan21_scail2_character_replacement_int8` (2026-07-13), subgraph "Character Replacement (SCAIL-2 Int8 Base)", Turbo on: `UNETLoader wan2.1_14B_SCAIL_2_int8_convrot` → `LoraLoaderModelOnly wan2.1_SCAIL_2_DPO_lora_bf16` 1.0 → `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16` 0.8 → `ModelSamplingSD3` 5; `BasicScheduler` on the LoRA model (not the shifted one, as the template) `simple` 6 steps; `KSamplerSelect euler`; `SamplerCustom` CFG 1; `VAEDecode` of `denoised_output` (output 1); `CLIPVisionEncode` crop `none`; SAM 3.1 tracks on the driving frames and the reference image → `SCAIL2ColoredMask` → `WanSCAILToVideo` (replacement mode, pose strength 1, start 0, end 1, `previous_frame_count` 5); empty negative. [Verified: template JSON, `nodes_scail.py`]
- **Deviations:** size from the clip, long edge 896 in multiples of 32 (the template's 896×512; `WanSCAILToVideo` steps 32); SAM text `human` on both sides (the template's driving text "girl, handkerchief" fits its sample clip only; the docs' default is `human`); `SCAIL2ColoredMask` `sort_by: area`, `object_indices: "0"` so only the biggest person is swapped ("the main person"), where the template swaps all tracked people left to right; `ImageScale` (area, center) instead of `ResizeImageMaskNode` with the same method; one segment only (the template's Extend subgraph continues in 76-frame steps). [Verified: template, docs] [Inference: the main-person rule]
- **Placeholders:** `video`, `start`, `duration`, `prompt`, `seed`, `image`. The `face` photo and the saved `character` are alternatives (`when`), so whichever is visible is `{{image}}`.
- **Format changes:**
  - Prompt: SCAIL-2's prompt is an "output video description". [Verified: docs.comfy.org SCAIL-2 tutorial] Replace the instruction with a description, for example `The character from the reference image, with their own face, hair, body and outfit, performing the movements of the original video in the original scene.`
  - `background` (green screen, new scene) and `scene` are not in this graph: replacement mode keeps the filmed background. They need a second step, for example `video_bg_change` on the result. [Verified: replacement mode keeps the driving background, `nodes_scail.py` and template note] [Inference: the second step]
  - `voice` is a separate Chatterbox voice-change step on the audio; not in this graph.

## 9. `recammaster` (`reshoot`)

- **Model:** ReCamMaster (Kling team), Wan 2.1 T2V 1.3B, Apache-2.0 on `KlingTeam/ReCamMaster-Wan2.1` (last change 2025-04-09). [Verified: HF API]
- **Newer open options found today** (not drafted; the brief names ReCamMaster):
  - `Cseti/LTX2.3-22B_IC-LoRA-CrossView-Prompt` (2026-07-11, Apache-2.0, 117 likes, v0.9 "proof-of-concept"): an LTX-2.3 IC-LoRA that re-renders a reference video from a prompted angle, for example `crossview. new camera angle: to the left, higher, further.` That vocabulary fits the format's left / right / above / low options. The file `LTX2.3-22B_IC-LoRA-CrossView-Prompt_v0.9_13700.safetensors` (100,767,456 bytes, sha256 `27ddb7f740f397c24a5db6346567c4807081368cca8ee08fbd105811faf82685`) is on Cloud, `Lightricks/LTX-2.3` is not gated, and core v0.41.1 has the IC-LoRA nodes (`GetICLoRAParameters`, `LTXVAddGuide`, as in the template `video_ltx2_3_ic_lora`). It gives a new static viewpoint, not a camera move. [Verified: HF API and card, Cloud `loras`, core source] [Inference: worth an A/B test against ReCamMaster]
  - `morphic/reshoot-anything` (2026-03-31, Apache-2.0): two rank-512 LoRAs (9.82 GB each) on Wan 2.2 I2V A14B that follow a camera path given as an "anchor video", which needs a 4D reconstruction step outside ComfyUI core. [Verified: HF card] [Inference: no ComfyUI node found, so not a graph today]
  - `KlingTeam/CamCloneMaster-Wan2.1` (2025-10-03) is "Reference-based Camera Control": the camera move comes from a reference video, not from a named trajectory. [Verified: HF card title] Kijai's ComfyUI copy `Wan2_1_kwai_recammaster_1_3B_step20000_bf16.safetensors` is in Cloud's `diffusion_models`. [Verified: Cloud listing, HF API]
- **Template:** `example_workflows/wanvideo_1_3B_ReCamMaster_example_01.json` in ComfyUI-WanVideoWrapper (no Comfy-Org template exists): `WanVideoModelLoader` (bf16, quantization disabled, offload_device, sdpa) → `WanVideoEncode` of the source (tiling off, 272/272/144/128, noise aug 0, latent strength 1) → `WanVideoReCamMasterDefaultCamera` → `WanVideoReCamMasterCameraEmbed` → `WanVideoSampler` (20 steps, CFG 6, shift 5, `unipc`, riflex 0, denoise 1, `rope_function comfy`) → `WanVideoDecode`. [Verified: example JSON, node sources at the pinned commit]
- **Deviations:** core `CLIPLoader umt5_xxl_fp8_e4m3fn_scaled` + `CLIPTextEncode` + `WanVideoTextEmbedBridge` instead of the wrapper's own T5 loader (the example ships this bridge path, muted), so no new text encoder file; core `LoadVideo` instead of `VHS_LoadVideo`; size from the clip, long edge 832 (the example fixes 832×480); output at the source fps (the example writes 16 fps); no Florence-2 caption, TeaCache or experimental args. [Verified: example JSON] [Inference: ReCamMaster was trained at 832×480, so portrait clips are untested]
- **Trajectory:** the default camera node takes one of `pan_right`, `pan_left`, `tilt_up`, `tilt_down`, `zoom_in`, `zoom_out`, `translate_up`, `translate_down`, `arc_left`, `arc_right`. [Verified: `recammaster/nodes.py`] An orbit is a separate node, `WanVideoReCamMasterGenerateOrbitCamera` (90°, frames from #82). A core lazy `ComfySwitchNode` picks one by `{{orbit}}`, so only the picked branch runs. [Verified: `nodes_logic.py` `check_lazy_status`] The unpicked camera node is still validated, so `{{trajectory}}` must always be a valid name. [Inference]
- **Placeholders:** `video`, `start`, `duration`, `prompt`, `seed`, `trajectory`, `orbit`.
- **Format changes:** the current trajectory values `rise`, `lower` and `orbit` are not ReCamMaster names. Use: left `{ trajectory: 'arc_left', orbit: false }`, right `{ trajectory: 'arc_right', orbit: false }`, above `{ trajectory: 'translate_up', orbit: false }`, low `{ trajectory: 'translate_down', orbit: false }`, orbit `{ trajectory: 'arc_right', orbit: true }`. The example's prompt is a caption of the clip (Florence-2); the format's instruction prompt is weaker. Consider a caption step. [Inference]

## Files

`files.json` lists the 10 files not yet in `MODEL_FILES`. All repos are ungated; sizes and sha256 are the Hugging Face LFS values. [Verified: HF API `tree/main?recursive=true`]

| File | Folder | Repo | GB | License | Used by |
|---|---|---|---|---|---|
| `sam3.1_multiplex_fp16.safetensors` | checkpoints | Comfy-Org/sam3.1 | 1.75 | "other" (SAM License) | void, bg change, SCAIL-2 |
| `birefnet.safetensors` | background_removal | Comfy-Org/BiRefNet | 0.44 | MIT | bg change |
| `void_pass1.safetensors`, `void_pass2.safetensors` | diffusion_models | Comfy-Org/void-model | 11.14 each | Apache-2.0 (CogVideoX base terms not read) | void |
| `cogvideox_vae.safetensors` | vae | Comfy-Org/void-model | 0.43 | Apache-2.0 | void |
| `raft_large_C_T_SKHT_V2-ff5fadd5.safetensors` | optical_flow | Comfy-Org/void-model | 0.02 | Apache-2.0 | void |
| `wan2.1_14B_SCAIL_2_int8_convrot.safetensors` | diffusion_models | Comfy-Org/SCAIL-2 | 16.65 | MIT | SCAIL-2 |
| `wan2.1_SCAIL_2_DPO_lora_bf16.safetensors` | loras | Comfy-Org/SCAIL-2 | 1.23 | MIT | SCAIL-2 |
| `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors` | loras | Comfy-Org/Wan-Animate-2 | 0.74 | Apache-2.0 | SCAIL-2 |
| `Wan2_1_kwai_recammaster_1_3B_step20000_bf16.safetensors` | diffusion_models | Kijai/WanVideo_comfy | 2.98 | no tag on Kijai's repo; original Apache-2.0 | recammaster |

`t5xxl_fp16`, `umt5_xxl_fp8_e4m3fn_scaled`, `Wan2_1_VAE_bf16`, `clip_vision_h`, both Bernini-R experts and the LightX2V T2V LoRA are already in `MODEL_FILES`. `vramGb`: VOID 32, SCAIL-2 24, ReCamMaster 24 (1.3B; the lineup notes quote 24 GB minimum), side files 0. [Inference]

`loaders.json` adds `OpticalFlowLoader.model_name` → `optical_flow`, `LoadBackgroundRemovalModel.bg_removal_name` → `background_removal` (both folders registered in `folder_paths.py` v0.41.1), `WanVideoModelLoader.model` → `diffusion_models` and `WanVideoVAELoader.model_name` → `vae`. [Verified: `folder_paths.py`, WanVideoWrapper `nodes_model_loading.py`]

`packs.json` pins ComfyUI-WanVideoWrapper at `088128b224242e110d3906c6750e9a3a348a659b` (2026-05-24, newest commit on main, no tags; Apache-2.0). Cloud lists all nine classes the graph uses. It downloads nothing for these nodes. Its last commit is five months older than ComfyUI v0.41.1, so test it on a Pod first. [Verified: GitHub API, `requirements.txt`, `supported-nodes.md`]

## Format and app changes, all graphs

1. `color-grade`: `runsOn: 'Bernini-R'`.
2. `edit-video`: `imageWorkflow: 'bernini_edit_ref'`; `runsOn: 'Bernini-R'`.
3. `clone-edit`, `recreate-ad`: `runsOn: 'Bernini-R'`; one segment per run; refer to references by order.
4. `video-erase`: `bindings: { target: 'target' }`; clean-scene prompt.
5. `video-remove-text`: `workflow: 'void_inpaint'`, a `target` param per option, clean-scene prompt, `runsOn: 'VOID with SAM 3.1'`.
6. `video-character-swap`: descriptive prompt; `background`/`scene` and `voice` need extra steps.
7. `reshoot`: `trajectory` values from the ReCamMaster list plus an `orbit` boolean on every option.
8. `mm-*`: comment and length copy only.
9. App: `validate.js` (line 145) supplies only `image` among image placeholders; `bernini_clone_edit` and `bernini_recreate_ad` need `image2`/`image3` and the `_meta.optional` removal described in the contract. [Verified: `src/lib/formats/validate.js`]

## Not tested

No graph was queued. Untested points: Bernini-R on 8 or 12 fps input; the `ImageBlend` look at 0.45; the uniform grade on long clips; SAM 3.1 on long free-text targets and on text overlays; VOID memory on 32 GB; WanVideoWrapper on v0.41.1; ReCamMaster on portrait clips. [Inference]

## Sources

- ComfyUI at commit `45bf90d1c91eecd782643346dcfb73cb0017667f`: `nodes.py`, `folder_paths.py`, `comfy/samplers.py`, `comfy/supported_models.py`, `comfy/bg_removal_model.py`, `comfy_api/latest/_io.py`, `comfy_api/latest/_input_impl/video_types.py`, `comfy_extras/nodes_{bernini,video,images,rebatch,post_processing,mask,math,logic,sam3,void,scail,bg_removal,custom_sampler,audio,lt}.py`
- Templates (Comfy-Org/workflow_templates `templates/`): `index.json`, `video_bernini_r_video_editing`, `utility_void_video_inpainting`, `video_wan21_scail2_character_replacement_int8`, `utility_birefnet_remove_background`, `utility_video_segment_sam3`, `template_ltx2_3_lora_remove_subtitles_from_video`, `template_ltx2_3_remove_watermark_from_video`, `video_ltx2_3_ic_lora`
- kijai/ComfyUI-WanVideoWrapper at `088128b2`: `recammaster/nodes.py`, `nodes.py`, `nodes_model_loading.py`, `nodes_sampler.py`, `wanvideo/schedulers/__init__.py`, `requirements.txt`, `example_workflows/wanvideo_1_3B_ReCamMaster_example_01.json`
- kijai/ComfyUI-KJNodes at `17195fcf`: `nodes/image_nodes.py`, `requirements.txt`
- bytedance/Bernini `bernini/prompt_enhancer.py`; Netflix/void-model README
- Hugging Face API: Comfy-Org/{sam3.1, BiRefNet, void-model, SCAIL-2, Wan-Animate-2}, netflix/void-model, zai-org/SCAIL-2, Kijai/WanVideo_comfy, KlingTeam/ReCamMaster-Wan2.1, Lightricks/LTX-2.5-22b-IC-LoRA-Clean-Plate, comfyicu/LTX-2.5, PulpCut/LTX-2.5-INT8-ConvRot-safetensors, model search (`clean-plate`, `ic-lora`, `subtitle`, `watermark`)
- Comfy Cloud: `/api/system_stats`, `/api/experiment/models` and the folders `checkpoints`, `diffusion_models`, `loras`, `text_encoders`, `vae`, `clip_vision`, `background_removal`, `optical_flow`, `latent_upscale_models`; `https://comfy.org/cloud/supported-nodes.md`
- Comfy docs: `tutorials/utility/void-video-inpainting.md`, `tutorials/video/zai/scail2.md`
- Higgsfield audit: `research_notes/Higgsfield feature audit/sections/02_tools_and_studios.md` (Mixed Media: "mixes illustration with live action at a low frame rate", 8 fps, 1 to 10 s)
