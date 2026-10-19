# How the i2v-chains graphs were checked

Date: 2026-10-19. Nothing was run in ComfyUI and no weights were downloaded. All checks are static, against the source of ComfyUI commit `45bf90d1c91eecd782643346dcfb73cb0017667f` (`comfyui_version.py`: 0.41.1), plus ComfyField's own placeholder and format code from this worktree.

## 1. Node schemas from the pinned source

- The ComfyUI tarball of that commit was unpacked, and a script parsed every `io.Schema(...)` (V3 nodes) and `INPUT_TYPES` / `RETURN_TYPES` (V1 nodes) with Python's `ast` module. For each class it records the input names, `optional` flags, combo options, dynamic combo options and their sub-inputs, Autogrow templates (names or prefix, `min`, `max`, template optional flag) and the output types.
- Facts the parser cannot resolve were added by hand from the source, each read today:
  - `TextGenerate.sampling_mode` options `on` (temperature, top_k, top_p, min_p, repetition_penalty, seed, optional presence_penalty) and `off`: `comfy_extras/nodes_textgen.py` lines 8-25.
  - `SaveVideo.format` options and the `codec` sub-input from `_save_video_codec_input` (h264 has an optional `encoding`): `comfy_extras/nodes_video.py` lines 76-130.
  - `ResizeImageMaskNode.resize_type` option keys are the `ResizeType` values (`"scale longer dimension"`, `"scale dimensions"`, ...) and `crop` takes `disabled` or `center`: `comfy_extras/nodes_post_processing.py` lines 261-270, 417-441.
  - Sampler names from `KSAMPLER_NAMES` plus `ddim`, `uni_pc`, `uni_pc_bh2`, and scheduler names from `SCHEDULER_HANDLERS`: `comfy/samplers.py`.
  - `ModelSamplingAuraFlow` returns `MODEL` (inherited from `ModelSamplingSD3`): `comfy_extras/nodes_model_advanced.py`.
- Every class is registered at that commit: V1 classes are keys in `NODE_CLASS_MAPPINGS`, V3 classes are in their extension's `get_node_list`, and each `comfy_extras` file is in the built-in list in `nodes.py`.

Classes used, by source file:

| File | Classes |
|---|---|
| `nodes.py` | CLIPLoader, CLIPTextEncode, ConditioningZeroOut, EmptyLatentImage, KSampler, LoadImage, LoraLoaderModelOnly, UNETLoader, VAEDecode, VAEDecodeTiled, VAEEncode, VAELoader |
| `comfy_extras/nodes_custom_sampler.py` | BasicGuider, BasicScheduler, CFGGuider, KSamplerSelect, ManualSigmas, RandomNoise, SamplerCustomAdvanced, SamplerEulerAncestral |
| `comfy_extras/nodes_lt.py` | EmptyLTXVLatentVideo, LTXVAddGuide, LTXVConcatAVLatent, LTXVConditioning, LTXVCropGuides, LTXVDualCFGGuider, LTXVImgToVideoInplace, LTXVPreprocess, LTXVSeparateAVLatent |
| `comfy_extras/nodes_lt_audio.py` | LTXVAudioVAEDecode, LTXVEmptyLatentAudio |
| `comfy_extras/nodes_lt_upsampler.py` | LTXVLatentUpsampler |
| `comfy_extras/nodes_hunyuan.py` | LatentUpscaleModelLoader |
| `comfy_extras/nodes_minimax_h3.py` | MiniMaxH3ImageToVideo |
| `comfy_extras/nodes_audio.py` | VAEDecodeAudio |
| `comfy_extras/nodes_video.py` | CreateVideo, SaveVideo |
| `comfy_extras/nodes_qwen.py` | TextEncodeQwenImage21, TextEncodeQwenImageEditPlus |
| `comfy_extras/nodes_textgen.py` | TextGenerate |
| `comfy_extras/nodes_edit_model.py` | ReferenceMultiLatent |
| `comfy_extras/nodes_flux.py` | FluxKontextImageScale, FluxKontextMultiReferenceLatentMethod |
| `comfy_extras/nodes_post_processing.py` | BatchImagesNode, ImageScaleToTotalPixels, ResizeImageMaskNode |
| `comfy_extras/nodes_compositing.py` | SplitImageWithAlpha |
| `comfy_extras/nodes_images.py` | GetImageSize |
| `comfy_extras/nodes_math.py` | ComfyMathExpression |
| `comfy_extras/nodes_primitive.py` | PrimitiveInt, PrimitiveStringMultiline |
| `comfy_extras/nodes_cfg.py` | CFGNorm |
| `comfy_extras/nodes_model_advanced.py` | ModelSamplingAuraFlow |

All core. No custom node pack.

## 2. What the graph checker tests

For each graph:

1. Every `class_type` exists at the pinned commit.
2. Every input key is a real input. Dotted keys are walked: a dynamic combo key (`sampling_mode.temperature`, `resize_type.longer_size`, `resize_type.crop`, `format.codec`, ReferenceMultiLatent `resolution`) must belong to the option the base key selects; an Autogrow key (`images.image0`, `images.image_1`, `values.a`) must be a legal slot name (TemplatePrefix under `max`, TemplateNames in `names`).
3. Every link `[id, index]` points at an existing node, the index is below that node's output count, and the output type fits the input type (MultiType accepts INT, FLOAT, BOOLEAN; MatchType accepts any; a FLOAT input accepts INT).
4. Every required input is set, including required sub-inputs of the selected dynamic option and required Autogrow slots (`i < min` and the template input not optional).
5. Every literal combo value is a valid option: CLIPLoader `type` (`flux3`, `qwen_image`, `ltxv`, `minimax`), `device` `default`, UNETLoader `weight_dtype` `default`, samplers `euler`, `euler_ancestral`, `res_multistep`, scheduler `simple`, TextGenerate `mtp` `off` and `sampling_mode` `on`, ReferenceMultiLatent `keep resolution`, `scale_method` / `upscale_method` `lanczos`, `crop` `center`, `reference_latents_method` `index_timestep_zero`, SaveVideo `format` `mp4` and `format.codec` `h264`.
6. Every loader file name is in `MODEL_FILES` (or in this folder's `files.json`) with the folder its loader reads (`LOADERS` in `shared/modelFiles.js`), and every loader class is in `LOADERS`.
7. A node with `_meta.optional` links only into optional inputs. Then the optional nodes are removed (as ComfyField's `dropOptional` does) and checks 1-6 run again on the smaller graph.
8. Exactly one output node, and every node reaches it.

Control: the shipped `public/workflows/ltx25_i2v.json` and `h3_open_i2v.json` pass the same checker.

Mutation test (on a copy of `qwen_multi_h3.json`): a wrong input name, an output index past the end, a bad sampler name, an optional loader into a required input (`GetImageSize.image`), a removed required input (`vae`), a VAE into a CLIP input, a bad CLIP type and an Autogrow slot past the names list are each reported. A link of an INT into an INT widget is accepted.

## 3. Checker output

```
== klein_h3.json: 32 nodes, placeholders ['frames', 'image', 'motion', 'prompt', 'seed'], optional []
== klein_ltx.json: 50 nodes, placeholders ['frames', 'image', 'motion', 'prompt', 'seed'], optional []
== qwen2511_ltx.json: 51 nodes, placeholders ['frames', 'image', 'motion', 'prompt', 'seed'], optional []
== qwen_h3.json: 34 nodes, placeholders ['frames', 'height', 'image', 'motion', 'prompt', 'seed', 'width'], optional ['image']
   note: optional #5 -> #6 TextEncodeQwenImage21.images.image_1 (optional input)
   with no optional files: 33 nodes, 0 problems
== qwen_ltx.json: 48 nodes, placeholders ['frames', 'image', 'motion', 'prompt', 'seed'], optional []
== qwen_mockup_ltx.json: 48 nodes, placeholders ['frames', 'image', 'motion', 'prompt', 'seed'], optional []
== qwen_multi_h3.json: 33 nodes, placeholders ['frames', 'image', 'image2', 'image3', 'image4', 'image5', 'motion', 'prompt', 'seed'], optional ['image2', 'image3', 'image4', 'image5']
   note: optional #15 -> #6 TextEncodeQwenImage21.images.image_2 (optional input)
   note: optional #16 -> #6 TextEncodeQwenImage21.images.image_3 (optional input)
   note: optional #17 -> #6 TextEncodeQwenImage21.images.image_4 (optional input)
   note: optional #18 -> #6 TextEncodeQwenImage21.images.image_5 (optional input)
   with no optional files: 29 nodes, 0 problems
== qwen_try_on_h3.json: 37 nodes, placeholders ['frames', 'height', 'image', 'image2', 'image3', 'image4', 'motion', 'prompt', 'seed', 'width'], optional ['image2', 'image3', 'image4']
   note: optional #17 -> #6 TextEncodeQwenImage21.images.image_1 (optional input)
   note: optional #15 -> #6 TextEncodeQwenImage21.images.image_3 (optional input)
   note: optional #16 -> #6 TextEncodeQwenImage21.images.image_4 (optional input)
   with no optional files: 34 nodes, 0 problems
== ltx25_i2v.json: 38 nodes, placeholders ['frames', 'height', 'image', 'prompt', 'seed', 'width'], optional []
== h3_open_i2v.json: 16 nodes, placeholders ['frames', 'height', 'image', 'prompt', 'seed', 'width'], optional []
ALL OK
```

Why the optional links are legal: `TextEncodeQwenImage21.images` is an Autogrow with `TemplateNames(..., min=0)`, and `_expand_schema_for_dynamic` makes every slot at or past `min` optional. [Verified: `comfy_extras/nodes_qwen.py` line 125-131; `comfy_api/latest/_io.py` lines 1179-1220]

## 4. ComfyField checks (its own code, read only)

`shared/mapping.js` `fill` and `dropOptional`, and `shared/modelFiles.js` `modelFilesOf`, `podNeedsOf`, `notOnCloud`, `minVramOf`, `volumeFor`, run on each graph with every optional file present, then with none:

| Graph | Files | GB | minVram | Volume | Not on Cloud | Filled, all optional / none |
|---|---|---|---|---|---|---|
| klein_h3 | 9 | 71.48 | 32 | 102 | Klein DiT 11.1, upsampler 6.72 | 32 nodes, no unfilled placeholder, no broken link |
| klein_ltx | 9 | 66.74 | 32 | 97 | Klein DiT, upsampler | 50 nodes, ok |
| qwen_ltx | 8 | 72.14 | 32 | 103 | Qwen 2.1 DiT 14.23, VAE 0.68 | 48 nodes, ok |
| qwen_h3 | 8 | 76.88 | 32 | 107 | Qwen 2.1 DiT, VAE | 34 / 33 nodes, ok |
| qwen_multi_h3 | 8 | 76.88 | 32 | 107 | Qwen 2.1 DiT, VAE | 33 / 29 nodes, ok |
| qwen_try_on_h3 | 8 | 76.88 | 32 | 107 | Qwen 2.1 DiT, VAE | 37 / 34 nodes, ok |
| qwen_mockup_ltx | 7 | 71.14 | 32 | 102 | Qwen 2.1 DiT, VAE | 48 nodes, ok |
| qwen2511_ltx (with `files.json`) | 9 | 70.71 | 32 | 101 | none | 51 nodes, ok |

Whole-string placeholders keep their type after `fill` (`{{seed}}` and `{{width}}` become numbers). [Verified]

`validateFormat` (working copy) on the 20 formats that name these graphs, with the drafted graphs' placeholders added to `schemas.comfy`:

- As they are now, each one fails with "generate: Unmapped workflow placeholder motion", so it stays hidden. [Verified]
- With only `params: { motion: '...' }` added, all 20 pass, and `stepOptions` plus `comfyVars` give `motion` to the graph. [Verified]
- poster with `workflow: 'qwen_h3'` and `params.motion` passes. [Verified]
- outfit-shot with model "Saved character", garment and garment3 set and garment2 empty gives `image`=garment, `image2` empty, `image3`=garment3, `image4`=the character's first picture, so `dropOptional` removes only loader 15. [Verified]
- invitation-video without a photo: `image` is empty, loader 5 and its link drop out, `TextEncodeQwenImage21` keeps `clip`, `prompt`, `negative_prompt`, `vae`, `resolution`, and the canvas reads 448 x 768 (9:16). [Verified]

## 5. Files

For the 17 model files the seven main graphs load, the Hugging Face API gives `gated: false` for every repo, the `lfs.sha256` equals the sha256 in `MODEL_FILES`, `size / 1e9` rounds to its `gb`, and the `cloud` flag equals the Cloud listing of that folder (13:08 UTC). For the four files in `files.json` the same was checked, and each exact name is in Cloud's listing for its folder. [Verified: https://huggingface.co/api/models/<repo>?blobs=true; https://cloud.comfy.org/api/experiment/models/<folder>]

## 6. Sizes and expressions

The `ComfyMathExpression` strings use only `max`, `min`, `sqrt`, `round`, `/`, `*` and the names `a`, `b`, all in `MATH_FUNCTIONS` of `comfy_extras/nodes_math.py` (simpleeval). Evaluated in Python for nine source shapes from 640x480 to 800x6400:

- the H3 canvas equals `adapt_canvas` in `nodes_minimax_h3.py` for every shape;
- the LTX first pass is never below 64 (the `EmptyLTXVLatentVideo` minimum) and the final size is about 0.9 MP;
- the Qwen fixed canvas from 448x768, 768x448, 544x672 and 608x608 is 768x1344, 1344x768, 928x1152 and 1024x1024.

## 7. Other facts the graphs rely on

| Fact | Source |
|---|---|
| The Qwen-Image 2.1 VAE decodes 4 channels: `decoder.head.2.weight` is `[4, 144, 1, 3, 3]`, and `output_channels` is read from it | safetensors header of `qwen_image_2.1_vae_bf16.safetensors` (HTTP range request); `comfy/sd.py` lines 840-845 |
| `LTXVPreprocess` encodes `rgb24`, so it needs 3 channels; `SplitImageWithAlpha` returns `image[:, :, :3]` | `comfy_extras/nodes_lt.py` lines 827-865; `nodes_compositing.py` lines 165-186 |
| `MiniMaxH3ImageToVideo` stretches `first_frame` to the canvas and reads `[..., :3]`; `length` snaps to 17k+5 | `nodes_minimax_h3.py` lines 38-91, 139-163 |
| `LTXVImgToVideoInplace` and `LTXVAddGuide` center-crop the image to the latent | `nodes_lt.py` lines 165-166 and 303-311 |
| `ReferenceMultiLatent` with "keep resolution" returns the first reference latent times 0 as `empty_latent` | `nodes_edit_model.py` lines 65-89 |
| `TextEncodeQwenImage21` latent output is on the first present image's size; with no image it is 1024x1024 | `nodes_qwen.py` lines 144-182 |
| Empty 4-channel latents are converted to the model's 64 channels and /16 | `comfy/sample.py` `fix_empty_latent_channels`; `comfy/latent_formats.py` `QwenImage21` |
| At cfg 1 the negative pass is skipped (LTX dual guider falls back to single CFG when both scales are equal) | `comfy/samplers.py` line 610; `nodes_lt.py` `Guider_LTXAVDualCFG.predict_noise` |
| Server validation checks `min` and `max`, not `step` | `execution.py` lines 1033-1050 |
| TextGenerate widget order (prompt, max_length, sampling_mode and its 7 sub-inputs, thinking, use_default_template, mtp), so the edit template's 10th value is `presence_penalty` 0 | `nodes_textgen.py` lines 8-44; template widgets `["", 3584, "on", 1, 1, 0.95, 0, 1.05, 0, 0, false, true, "off"]` |

## 8. Not checked

- No run: VRAM peaks, system RAM use across the two stages, speed, and output quality are not measured.
- Cloud `object_info` needs a login, so the node list on Cloud was not read; Cloud reports ComfyUI v0.41.1 and these are core nodes.
- Prompt wording, the graffiti bare-wall pass, the person-first try-on order and the 0.7 guide strength on the last frame need a real run.
