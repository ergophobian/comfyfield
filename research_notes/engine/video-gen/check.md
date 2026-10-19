# How the video-gen graphs were checked

Date: 2026-10-19. No graph was run. Every check below is static, against source code at the pinned versions.

## Method

1. **Schemas from source.** I downloaded the ComfyUI tree at `45bf90d1c91eecd782643346dcfb73cb0017667f` (v0.41.1) as a GitHub archive and parsed `nodes.py` and every `comfy_extras/*.py` with Python's `ast` module (no imports, no torch). For V3 nodes it reads each `io.Schema(node_id=..., inputs=[...], outputs=[...])`: input names, types, `optional=True`, combo options, `min`/`max`, Autogrow names (`values.a`, `ref_images.ref_image_0`, `images.image0`) and DynamicCombo sub-inputs (`sampling_mode.temperature`). For V1 nodes it reads `INPUT_TYPES` (`required`/`optional`) and `RETURN_TYPES` through `NODE_CLASS_MAPPINGS`. 651 node schemas. FreeVideo's `freevideo_engine/comfy_nodes.py` at `fcd24fb7` was parsed the same way.
2. **Graph checker.** For each graph it checks:
   - every `class_type` exists at the pinned commit;
   - every input name exists (dotted dynamic names included);
   - every required input is set (top level and inside the chosen DynamicCombo option);
   - every link points at an existing node and an existing output index, and the output type matches the input type (exact, or one of a `MultiType` input's types);
   - every literal combo value is one of the options, every literal INT/FLOAT is the right type and inside `min`/`max`;
   - numeric placeholders (`{{width}}`, `{{duration}}`, ...) go only into INT/FLOAT inputs and text placeholders only into text;
   - a node with `_meta.optional` links only into inputs that are optional in the consumer's schema;
   - every loader file is in `MODEL_FILES` (`shared/modelFiles.js` as it is in this worktree) or in `files.json`, in the folder `LOADERS` (plus `loaders.json`) maps the loader input to;
   - exactly one output node, and every node reaches it.
3. **Checker sanity run.** The same checker on the shipped `h3_open_i2v`, `h3_open_t2v`, `ltx25_t2v`, `bernini_swap`, `wan_animate2`, `flux3_klein_t2i`, `qwen_image21_t2i` and `h3_freevideo_i2v` gives no problems. On `ltx25_i2v` it gives 4 false alarms, all on `ResizeImageMaskNode` (a `MatchType` input and a DynamicCombo built by a helper that the parser does not follow). No graph here uses that node.
4. **Hand checks** for what the parser cannot resolve (listed below), and for runtime behaviour that the graphs depend on, read in the node code.

## Result per graph

| Graph | Nodes | Static check | Placeholders | Optional loaders |
|---|---|---|---|---|
| `h3_t2v` | 17 | 0 problems | duration, height, image, prompt, seed, width | none |
| `h3_ref2v` | 17 | 0 problems | duration, height, image, prompt, seed, width | none |
| `h3_product_ad` | 17 | 0 problems | duration, height, image, prompt, seed, width | none |
| `h3_flf2v` | 22 | 0 problems | duration, image, image2, prompt, seed | none |
| `h3_freevideo_flf2v` | 6 | 0 problems | duration, image, image2, prompt, seed | none |
| `h3_i2v_audio` | 21 | 0 problems | duration, image, prompt, seed | none |
| `cinema_shot` | 19 | 0 problems | duration, height, image, prompt, seed, width | none |
| `h3_extend` | 34 | 0 problems | duration, prompt, seconds, seed, start, video | none |
| `h3_loop` | 28 | 0 problems | duration, height, prompt, seed, width | none |
| `h3_truck_ad` | 29 | 0 problems (1 hand check) | duration, height, image, prompt, seed, width | none |
| `h3_draw` | 30 | 0 problems | duration, image, mask, prompt, seed | none |
| `ltx25_multishot` | 36 | 0 problems | frames, height, image, prompt, seed, width | `41` (`image`) → `TextGenerateLTX2Prompt.image`, optional |
| `wan22_i2v` | 20 | 0 problems | duration, height, image, image2, prompt, seed, width | `17` (`image2`) → `WanFirstLastFrameToVideo.end_image`, optional |
| `wan22_t2v` | 18 | 0 problems | duration, height, prompt, seed, width | none |

Files each graph loads, and whether Cloud lists them (Cloud listing read 2026-10-19 13:03 UTC):

| Graph | Files | Not on Cloud |
|---|---|---|
| `h3_t2v`, `h3_ref2v`, `h3_product_ad` | ref2va int8, nvfp4 text encoder, fp16 video VAE, fp32 audio VAE | none |
| `h3_flf2v`, `h3_i2v_audio`, `cinema_shot`, `h3_extend` | fl2va int8, turbo 8-step LoRA, text encoder, video VAE, audio VAE | none |
| `h3_loop` | the fl2va set without the audio VAE, plus Klein DiT, Klein upsampler, `qwen3vl_4b_bf16`, `flux2-vae` | `flux3-image-klein-bf16`, `qwen3.5_9b_flux3_prompt_upsampler_w4a8` |
| `h3_truck_ad` | the fl2va set, plus `qwen_image_2.1_turbo_bf16`, `qwen3vl_8b_bf16`, `qwen_image_2.1_vae_bf16` | `qwen_image_2.1_turbo_bf16`, `qwen_image_2.1_vae_bf16` |
| `h3_draw` | the ref2va set plus the Fun ControlNet 2.0 patch | `minimax_h3_fun_controlnet_union_2.0_pruned_int8_convrot` |
| `ltx25_multishot` | the five `ltx25_t2v` files plus `gemma4_e2b_it_int8_convrot` | none |
| `wan22_i2v` / `wan22_t2v` | high and low fp8 experts, two LightX2V LoRAs, `umt5_xxl_fp8_e4m3fn_scaled`, `Wan2_1_VAE_bf16` | none |
| `h3_freevideo_flf2v` | no loaders (FreeVideo installs its own weights) | FreeVideo is not a Cloud pack |

## Node classes and where they are defined

All at the pinned ComfyUI commit, except `FreeVideoGenerate` (FreeVideo `fcd24fb7`).

| Class | File | API |
|---|---|---|
| `AudioConcat`, `AudioMerge`, `EmptyAudio`, `TrimAudioDuration`, `VAEDecodeAudio` | `comfy_extras/nodes_audio.py` | V3 |
| `BasicGuider`, `BasicScheduler`, `CFGGuider`, `KSamplerSelect`, `ManualSigmas`, `RandomNoise`, `SamplerCustomAdvanced` | `comfy_extras/nodes_custom_sampler.py` | V3 |
| `BatchImagesNode` | `comfy_extras/nodes_post_processing.py` | V3 |
| `CLIPLoader`, `CLIPTextEncode`, `EmptyLatentImage`, `ImageScale`, `KSampler`, `KSamplerAdvanced`, `LoadImage`, `LoraLoaderModelOnly`, `UNETLoader`, `VAEDecode`, `VAEDecodeTiled`, `VAELoader` | `nodes.py` | V1 |
| `ComfyMathExpression` | `comfy_extras/nodes_math.py` | V3 |
| `CreateVideo`, `GetVideoComponents`, `LoadVideo`, `SaveVideo`, `Video Slice` | `comfy_extras/nodes_video.py` | V3 |
| `EmptyFlux2LatentImage` | `comfy_extras/nodes_flux.py` | V3 |
| `EmptyHunyuanLatentVideo`, `LatentUpscaleModelLoader` | `comfy_extras/nodes_hunyuan.py` | V3 |
| `EmptyLTXVLatentVideo`, `LTXVConcatAVLatent`, `LTXVConditioning`, `LTXVDualCFGGuider`, `LTXVSeparateAVLatent` | `comfy_extras/nodes_lt.py` | V3 |
| `LTXVAudioVAEDecode`, `LTXVEmptyLatentAudio` | `comfy_extras/nodes_lt_audio.py` | V3 |
| `LTXVLatentUpsampler` | `comfy_extras/nodes_lt_upsampler.py` | V3 |
| `GetImageSize`, `ImageFromBatch` | `comfy_extras/nodes_images.py` | V3 |
| `GrowMask`, `ImageCompositeMasked`, `ImageToMask`, `ThresholdMask` | `comfy_extras/nodes_mask.py` | V3 |
| `MiniMaxH3AddGuide`, `MiniMaxH3FunControlNetApply`, `MiniMaxH3ImageToVideo`, `MiniMaxH3ReferenceToVideo` | `comfy_extras/nodes_minimax_h3.py` | V3 |
| `ModelPatchLoader` | `comfy_extras/nodes_model_patch.py` | V1 |
| `ModelSamplingSD3` | `comfy_extras/nodes_model_advanced.py` | V1 |
| `PrimitiveFloat`, `PrimitiveInt` | `comfy_extras/nodes_primitive.py` | V3 |
| `TextEncodeQwenImage21` | `comfy_extras/nodes_qwen.py` | V3 |
| `TextGenerate`, `TextGenerateLTX2Prompt` | `comfy_extras/nodes_textgen.py` | V3 |
| `WanFirstLastFrameToVideo` | `comfy_extras/nodes_wan.py` | V3 |
| `FreeVideoGenerate` | FreeVideo `freevideo_engine/comfy_nodes.py` | V3 |

## Hand checks (inputs the parser could not resolve)

- `SaveVideo`: `format` is a DynamicCombo whose options are built by `_save_video_codec_input`; `mp4` holds a nested `codec` (`format.codec`) with options `auto`, `h264`, `av1`, and a hidden legacy top-level `codec` stays (`execute` uses `format.get("codec") or codec`). The graphs use the shipped `{"format": "mp4", "codec": "h264", "format.codec": "h264"}`. [`nodes_video.py` lines 76-200]
- `TextEncodeQwenImage21.images.image_1`: Autogrow `TemplateNames` with names `image_1` .. `image_16` (a list comprehension the parser does not evaluate). [`nodes_qwen.py`]
- `TextGenerateLTX2Prompt`: `inputs=parent_schema.inputs` of `TextGenerate`, so the same inputs (`clip`, `prompt`, optional `image`, `max_length`, `sampling_mode` with `on` holding `temperature`, `top_k`, `top_p`, `min_p`, `repetition_penalty`, `seed`, optional `presence_penalty`, optional `thinking`, `use_default_template`, `mtp`, `system_prompt`). `system_prompt` is `force_input=True`; like the shipped `flux3_klein_t2i` the graphs pass it as a literal in API format. [`nodes_textgen.py`]
- Sampler and scheduler names: `res_multistep`, `euler`, `euler_ancestral` are in `KSAMPLER_NAMES`; `simple` is in `SCHEDULER_HANDLERS`. [`comfy/samplers.py` lines 971-974, 1365-1376]
- `CLIPLoader.type` values `minimax`, `ltxv`, `wan`, `qwen_image`, `flux3` are all in the option list (the parser resolved it).
- `ModelPatchLoader`: one input `name`, from `folder_paths.get_filename_list("model_patches")`; `model_patches` is a folder in `folder_paths.py` (line 55). [`nodes_model_patch.py` lines 247-260]
- Output indices used: `ComfyMathExpression` 0 FLOAT, 1 INT; `GetImageSize` 0 width, 1 height, 2 batch_size; `GetVideoComponents` 0 images, 1 audio; `MiniMaxH3ImageToVideo` / `MiniMaxH3ReferenceToVideo` 0 positive, 1 latent; `MiniMaxH3AddGuide` 0 positive; `WanFirstLastFrameToVideo` and `TextEncodeQwenImage21` 0 positive, 1 negative, 2 latent; `TextGenerate*` 0 generated_text; `LoadImage` 0 IMAGE. INT-typed inputs (`width`, `height`, `length`, `ImageFromBatch.length`) take output 1 of `ComfyMathExpression`; FLOAT inputs (`EmptyAudio.duration`) take output 0.

## Behaviour the graphs rely on, read in the source

| Behaviour | Where |
|---|---|
| H3 snaps `length` up to 17k+5; trained range "~124-362" | `nodes_minimax_h3.py` `align_frame_count`, input tooltip |
| `first_frame` is stretched to the canvas, `last_frame` center-cropped | `MiniMaxH3ImageToVideo.execute` (`_resize(..., "disabled")` / `"center"`) |
| `adapt_canvas`: 768 px short edge, area cap 768x1344, multiples of 32; the graphs' two math expressions give the same sizes for 16:9, 9:16, 1:1, 4:5, 21:9, 3:2, 4:3, 1920x1080, 1080x1920 and 4032x3024 | `nodes_minimax_h3.py`; computed both ways in Python |
| `ComfyMathExpression` has `min`, `max`, `round`, `sqrt`, `floor`; INT output is `int(result)` | `nodes_math.py` `MATH_FUNCTIONS`, `execute` |
| Template length expression gives 73, 124, 192, 243, 362 frames for 3, 5, 8, 10, 15 s; `h3_extend` gives 107, 158, 226 for 3, 5, 8 s; Wan `floor(a * 16) + 1` gives 49, 81, 129, 161 (all 4n + 1) | computed |
| Reference images without `vae` condition only the text encoder | `MiniMaxH3ReferenceToVideo` (`ref_blocks` filled only `if vae is not None`; `vae` tooltip) |
| Picture tags the encoder sees: fl2va `<Picture 1>: ... [<Picture 2>: ...]`, ref2va `<Picture i>: ...` in input order | `comfy/text_encoders/minimax.py` docstring and `tokenize_with_weights` |
| Add Guide: a clip guide is cropped to 17k+5 frames (22 is valid), `frame_idx + frames` must fit, audio guides start at the same index; keyframes and references can share one packed layout | `MiniMaxH3AddGuide.execute`; `comfy/ldm/minimax/model.py` `PackedLayout` |
| Fun patch: `mask` 1 = regenerate, `source_video` read only with a mask, a one-frame mask or source repeats over every frame (index clamp) | `MiniMaxH3FunControlNetApply`, `MiniMaxH3FunControlPatch._fit_frames`, `prepare_control_latent` |
| Fun 2.0 file header has `control_blocks_places` `[0, 5, ..., 45]` and `inpaint_masked_pixel_mode: post_norm`; the loader reads both | safetensors header (HTTP range read); `nodes_model_patch.py` lines 306-324 |
| `LoadImage` converts to RGB (transparent pixels keep their stored RGB) and gives `MASK = 1 - alpha` | `nodes.py` `LoadImage` |
| `ImageFromBatch` accepts a negative `batch_index` (counted from the end) and clamps `length` | `nodes_images.py` `ImageFromBatch.execute` |
| A linked output that is `None` (a silent clip's audio) is passed on as `None`; `AudioMerge`, `TrimAudioDuration`, `AudioConcat` handle `None` | `execution.py` `get_input_data` lines 179-193; `nodes_audio.py` |
| `AudioMerge` pads or trims `audio2` to `audio1`'s length and matches sample rates | `nodes_audio.py` `AudioMerge.execute`, `match_audio_sample_rates` |
| `WanFirstLastFrameToVideo` with only `start_image` keeps the first latent frame like `WanImageToVideo`; both center-crop | `nodes_wan.py` |
| `LTXVImgToVideoInplace` center-crops the start image | `nodes_lt.py` `common_upscale(..., "center")` |
| Qwen-Image 2.1 names reference pictures `<image1>`, `<image2>`, ... | `comfy/text_encoders/qwen_image21.py` |
| An empty `EmptyLatentImage` is converted to the model's channels and spatial ratio | `comfy/sample.py` `fix_empty_latent_channels` |
| `FreeVideoGenerate`: `first`/`last` optional (FL2VA), width/height 256..4096 step 32, `seconds` 1.625..60, `continue_from` takes an MP4 path, `references` is "Experimental Ref2VA" | FreeVideo `comfy_nodes.py` |
| Template values copied: H3 R2V / Fun template 20 steps, turbo off; H3 i2v turbo 8 steps; Wan 2.2 Lightning path (shift 5, 4 steps, cfg 1, split 2); LTX-2.5 enhancer widgets; Qwen 2.1 Turbo edit wrapper widgets | template JSON at `workflow_templates@59a3b48b`, dumped node by node |

## Not checked

- No graph was run, on Cloud or on a Pod. Model quality, VRAM peaks and run times are not measured.
- Cloud `object_info` needs a key, so the node list on Cloud was not read. Cloud reports ComfyUI v0.41.1, the commit the schemas come from.
- That the app's `dropOptional`, slot mapping and uploads behave as `shared/mapping.js` and `server/core.js` read today; they are changing in this worktree.
