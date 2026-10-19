# How the enhance graphs were checked

Date: 2026-10-19. ComfyUI source: commit `45bf90d1c91eecd782643346dcfb73cb0017667f` (v0.41.1), the full tree from `codeload.github.com/Comfy-Org/ComfyUI/tar.gz/<commit>`. Nothing was run in ComfyUI.

## Method

1. **Schemas from source.** `tools/schemas.py` parses every node file of the pinned tree with Python's `ast` (no import, no torch): V3 nodes from `io.Schema(node_id=..., inputs=[...], outputs=[...])`, V1 nodes from `INPUT_TYPES` and `RETURN_TYPES` mapped through `NODE_CLASS_MAPPINGS`. It records each input's type, `optional`, literal combo options, `min`/`max`, and the sub-inputs of every `DynamicCombo` option. 645 classes. Two things it cannot follow were added by hand after reading the code: the Autogrow templates (`ComfyMathExpression.values` a..z with min 1; `GLSLShader` images 0..4 min 1, floats/ints 0..19, bools 0..9; `TextEncodeQwenImage21.images` image_1..image_16 min 0) and `SaveVideo`'s `_save_video_codec_input()` (each format option holds a required `codec`, plus a hidden optional top-level `codec`). `VHS_VideoCombine` was typed in from VideoHelperSuite `videohelpersuite/nodes.py` and `video_formats/webm.json` at commit `4d907bee`.
2. **Graph check.** `tools/check_graphs.py` checks, for every node of every graph:
   - the class exists at the pinned commit;
   - every input key is a real input, a sub-input of the chosen DynamicCombo option (`resize_type.longer_size`, `format.codec`), or an allowed Autogrow name (`values.a`, `bools.u_bool3`, `images.image_1`);
   - every required input is set, including the chosen DynamicCombo option's required sub-inputs and Autogrow minimums;
   - every link points at an existing node and an existing output index, and the output type overlaps the input type (`*` and MatchType pass, as in `comfy_execution/validation.py`);
   - every literal combo value is in the option list (sampler and scheduler names checked against `KSAMPLER_NAMES` and `SCHEDULER_HANDLERS` in `comfy/samplers.py`);
   - every literal number is within `min`/`max` (ComfyUI validates only literals; linked values skip these checks, see `execution.py` `validate_inputs`);
   - every loader file is in `MODEL_FILES` or `files.json`, in the folder `LOADERS` or `loaders.json` gives for that loader input;
   - `GLSLShader` uniform groups are contiguous from index 0, because uniforms bind by list position (`u_float{i}` for the i-th value in `_render_shader_batch`);
   - no node has `_meta.optional` (no graph here has optional media).
3. **Checker test.** On a copy of `seedvr2_video.json` with seven planted faults (bad DynamicCombo value, renamed input, missing required input, output index past the end, bad combo value, file not in the list, literal below `min`) and two wrong link types, the checker reported all of them.
4. **Math.** Every `ComfyMathExpression` string was evaluated with `simpleeval` 1.0.8 and the node's function table (`min`, `max`, `round`, `sqrt`, ternary, comparisons, booleans as 0/1) on sample sizes. Outputs used: 0 = FLOAT for multipliers and grain, 1 = INT for sizes, 2 = BOOL for switches.
5. **GLSL.** The look shader and Comfy's Color Adjustment and Film Grain shaders were compiled, linked and rendered with comfy-angle 0.1.1 and PyOpenGL 3.1.10 (`tools/glsl_run.py`: the node's vertex shader, RGBA32F texture upload with alpha 1 for RGB input, the same uniform names). All looks compile and render; a contact sheet looked plausible.
6. **Formats.** `validateFormat` from `src/lib/formats/validate.js` was run on the nine formats with these graphs' placeholder lists added to `schemas.comfy`, as is and with the README's format changes. With the format changes and the proposed choice-param rule, all eight served formats return no reasons. `sticker-match-cut` stays "Missing Comfy workflow".

Result: **0 problems** in all 11 graphs.

## Per graph

Links = node inputs that are links. "Classes" lists the source file of each class at the pinned commit.

### `seedvr2_image.json`: 16 nodes, 23 links

- Classes: LoadImage, SaveImage, UNETLoader, VAELoader, KSampler, VAEEncodeTiled, VAEDecodeTiled (`nodes.py`); JoinImageWithAlpha (`nodes_compositing.py`); GetImageSize (`nodes_images.py`); PrimitiveFloat, PrimitiveInt (`nodes_primitive.py`); ComfyMathExpression (`nodes_math.py`); ResizeImageMaskNode (`nodes_post_processing.py`); SeedVR2Preprocess, SeedVR2Conditioning, SeedVR2PostProcessing (`nodes_seedvr.py`).
- Combos: `resize_type` "scale longer dimension" (sub-input `longer_size`, linked INT), `scale_method` lanczos, `weight_dtype` default, `sampler_name` euler, `scheduler` simple, `color_correction_method` none.
- Literals in range: VAEEncodeTiled/VAEDecodeTiled `tile_size` 512 (64..4096), `overlap` 128 (0..4096), `temporal_size` 4096 (8..4096), `temporal_overlap` 8 (min 4).
- Types: SeedVR2Conditioning outputs 0/1 → KSampler positive/negative (CONDITIONING); VAEEncodeTiled LATENT → SeedVR2Conditioning `vae_conditioning` and KSampler `latent_image`; ResizeImageMaskNode (MatchType) → SeedVR2Preprocess and `original_resized_images`.
- Files: `seedvr2_3b_int8_convrot.safetensors` (diffusion_models), `seedvr2_ema_vae_fp16.safetensors` (vae), both new, both on Cloud.
- Placeholders: image, seed, target, upscale_factor.

### `image_upscale.json`: 15 nodes, 22 links

- As `seedvr2_image`, without PrimitiveInt, with `resize_type` "scale by multiplier" (sub-input `multiplier`, linked FLOAT from ComfyMathExpression output 0).
- Placeholders: image, seed, upscale_factor.

### `image_upscale_esrgan.json`: 9 nodes, 11 links

- Classes: LoadImage, SaveImage (`nodes.py`); UpscaleModelLoader, ImageUpscaleWithModel (`nodes_upscale_model.py`); GetImageSize; PrimitiveFloat; ComfyMathExpression; ResizeImageMaskNode (`area`); JoinImageWithAlpha (alpha from LoadImage output 1, MASK).
- File: `RealESRGAN_x4plus.safetensors` (upscale_models; `UpscaleModelLoader.model_name` is already in `LOADERS`), on Cloud.
- Placeholders: image, upscale_factor.

### `seedvr2_video.json`: 19 nodes, 28 links

- Classes: as `image_upscale`, plus LoadVideo, Video Slice, GetVideoComponents, CreateVideo, SaveVideo (`nodes_video.py`) and SeedVR2TemporalChunk, SeedVR2TemporalMerge (`nodes_seedvr.py`).
- Combos: `chunking_mode` auto (no sub-inputs), SaveVideo `format` mp4 with `format.codec` h264 and hidden `codec` h264 (the keys of the shipped `ltx25_i2v.json`).
- List semantics (by reading the code and the template wiring): SeedVR2TemporalChunk output 0 is `is_output_list=True`, so SeedVR2Conditioning and KSampler run once per chunk; SeedVR2TemporalMerge is `is_input_list=True` and takes all chunks plus output 1 (`temporal_overlap`, INT, `force_input`). This is the template's wiring with its switch on.
- Types: GetVideoComponents 0 IMAGE, 1 AUDIO → CreateVideo `audio` (optional), 2 FLOAT → CreateVideo `fps`.
- Placeholders: duration, seed, start, upscale_factor, video.

### `rife_interpolate.json`: 13 nodes, 18 links

- Classes: LoadVideo, Video Slice, GetVideoComponents, CreateVideo, SaveVideo; GetImageSize; PrimitiveInt; ComfyMathExpression (twice: edge INT, and BOOL for the switch); ResizeImageMaskNode; ComfySwitchNode (`nodes_logic.py`, lazy `on_true`/`on_false`, `switch` linked BOOLEAN); FrameInterpolationModelLoader, FrameInterpolate (`nodes_frame_interpolation.py`).
- `multiplier` is linked from PrimitiveInt `{{multiplier}}`; the format gives 2, 4 or 8 (node range 2..16, not validated for links). `values.a` is set on both math nodes (Autogrow min 1; the checker caught a first draft that used only `values.c`).
- File: `rife_v4.26.safetensors` (frame_interpolation, needs the new loader entry), on Cloud.
- Placeholders: duration, multiplier, start, video.

### `birefnet_image.json`: 15 nodes, 19 links

- Classes: LoadImage, SaveImage, EmptyImage (`nodes.py`); LoadBackgroundRemovalModel, RemoveBackground (`nodes_bg_removal.py`); InvertMask, ImageCompositeMasked (`nodes_mask.py`); JoinImageWithAlpha; GetImageSize; StringCompare (`nodes_string.py`, mode Equal); PrimitiveInt; ComfySwitchNode (twice).
- Types: RemoveBackground MASK → InvertMask, ImageCompositeMasked `mask` (optional input); EmptyImage `color` linked from a ComfySwitchNode over two PrimitiveInt (INT); final ComfySwitchNode picks the RGBA cut-out or the composite (both IMAGE).
- Literals: PrimitiveInt 65280 and 16777215 (EmptyImage `color` max 0xFFFFFF is checked only for literals; both values are within it anyway).
- File: `birefnet.safetensors` (background_removal, needs the new loader entry), on Cloud.
- Placeholders: image, output.

### `birefnet_video_matte.json`: 24 nodes, 36 links

- Classes: LoadVideo, Video Slice, GetVideoComponents, CreateVideo, SaveVideo; GetImageSize (twice); ComfyMathExpression; ResizeImageMaskNode; ComfySwitchNode; LoadBackgroundRemovalModel; RemoveBackground (twice); ImageFromBatch (`nodes_images.py`, batch_index 0, length 1); ThresholdMask; CheckpointLoaderSimple; SAM3_VideoTrack, SAM3_TrackToMask (`nodes_sam3.py`); GrowMask (twice); MaskComposite (multiply, add); EmptyImage; ImageCompositeMasked.
- Types: CheckpointLoaderSimple output 0 MODEL → SAM3_VideoTrack `model`; ThresholdMask MASK → `initial_mask` (optional input); SAM3_VideoTrack SAM3_TRACK_DATA → SAM3_TrackToMask; GetImageSize output 2 (batch_size) → EmptyImage `batch_size`.
- Literals: `max_objects` 1 (0..64), `detect_interval` 1 (min 1), `detection_threshold` 0.5, GrowMask `expand` 16 and −8.
- Files: `birefnet.safetensors`, `sam3.1_multiplex_fp16.safetensors` (checkpoints, already a `LOADERS` folder), both on Cloud.
- Placeholders: duration, start, video.

### `birefnet_video_matte_alpha.json`: 23 nodes, 32 links

- Shared matte as above, then InvertMask → JoinImageWithAlpha → `VHS_VideoCombine` (VHS at `4d907bee`): `format` video/webm, `pix_fmt` yuva420p, `crf` 20 (0..100), `loop_count` 0, `frame_rate` linked FLOAT (type `FLOAT,INT`), `audio` linked AUDIO (optional), `pingpong` false, `save_output` true, `save_metadata` true, `trim_to_audio` false. VHS sets `has_alpha` from a 4-channel first frame and pipes `rgba` to ffmpeg.
- Placeholders: duration, start, video.

### `birefnet_video_matte_scene.json`: 39 nodes, 55 links

- Shared matte, plus the Qwen-Image 2.1 Turbo plate: UNETLoader, CLIPLoader (`type` qwen_image, `device` default), VAELoader, TextEncodeQwenImage21 (`nodes_qwen.py`; no images, no VAE: both optional, Autogrow min 0), ComfyMathExpression ×2 (INT width and height), EmptyLatentImage, CFGGuider, KSamplerSelect (euler), ManualSigmas, RandomNoise, SamplerCustomAdvanced (`nodes_custom_sampler.py`), VAEDecode, SplitImageWithAlpha, ResizeImageMaskNode (`match size`, sub-inputs `match` linked IMAGE and `crop` center), RepeatImageBatch (`amount` linked INT), ImageCompositeMasked.
- EmptyLatentImage gives a 4-channel latent; `fix_empty_latent_channels` in `comfy/sample.py` resizes an all-zero latent to the model's channels and downscale, as the shipped `qwen_image21_t2i.json` relies on.
- Files: as the matte, plus the three Qwen-Image 2.1 files from `MODEL_FILES` (DiT and VAE not on Cloud).
- Placeholders: background, duration, seed, start, video.

### `birefnet_qwen_background.json`: 19 nodes, 24 links

- Classes: LoadImage, SaveImage, UNETLoader, CLIPLoader, VAELoader, VAEDecode; LoadBackgroundRemovalModel, RemoveBackground; InvertMask; JoinImageWithAlpha; SplitImageWithAlpha; GetImageSize; ComfyMathExpression (INT `resolution`); TextEncodeQwenImage21 (`images.image_1` linked IMAGE, `vae` linked); CFGGuider; KSamplerSelect; ManualSigmas; RandomNoise; SamplerCustomAdvanced (`latent_image` = TextEncodeQwenImage21 output 2, LATENT, as the template with custom size off).
- Placeholders: image, prompt, seed.

### `image_grade.json`: 16 nodes, 16 links

- Classes: LoadImage, SaveImage; StringCompare ×7; GLSLShader ×3 (`nodes_glsl.py`, `size_mode` from_input); PrimitiveFloat ×2; ComfyMathExpression (FLOAT, `values.b` linked BOOLEAN); SplitImageWithAlpha.
- Uniforms: shader 1 `images.image0`, `bools.u_bool0..6` (linked BOOLEAN); shader 2 `floats.u_float0` linked, `u_float1..3` literal 0.0; shader 3 `floats.u_float0` linked, `u_float1..3` literals, `ints.u_int0` 0. All groups contiguous from 0.
- The shader text has no `{{`, so `fill()` leaves it untouched; the only placeholders are grain, image, preset, temperature.
- No model files.

### `sticker_match_cut`

Not drafted. See the README for why.
