# How the video-edit graphs were checked

Date: 2026-10-19. ComfyUI sources at commit `45bf90d1c91eecd782643346dcfb73cb0017667f` (v0.41.1), fetched from `raw.githubusercontent.com/comfyanonymous/ComfyUI/<commit>/`. WanVideoWrapper sources at `088128b224242e110d3906c6750e9a3a348a659b`. No graph was queued on ComfyUI.

## Method

1. **Schemas from source.** `scripts/schemas.py` parses every `comfy_extras/nodes_*.py`, `nodes.py` and the WanVideoWrapper files with Python's `ast`: V3 nodes from `io.Schema(node_id=…, inputs=[…], outputs=[…])` (name, type, `optional`, literal `options`, `min`/`max`, DynamicCombo children, Autogrow prefix or names), classic nodes from `INPUT_TYPES` (`required` / `optional`) and `RETURN_TYPES`, keyed by `NODE_CLASS_MAPPINGS`. 645 core and 80 wrapper schemas.
2. **Hand-filled gaps**, each read in the source: `SaveVideo`'s codec inputs (built by a helper; `format` options `auto`/`mp4`/`mkv`/`webm`, child `codec` `auto`/`h264`/`av1`, plus a hidden optional `codec`); `ComfyMathExpression.values` (autogrow names `a`…`z`, MultiType Float/Int/Boolean, min 1); `ImageScale` combos (`nearest-exact`, `bilinear`, `area`, `bicubic`, `lanczos`; crop `disabled`, `center`).
3. **`scripts/check.py`** checks, per node: the class exists; every input name exists (direct, `format.codec`, `values.a`, `reference_images.reference_image_N`); every link points at an existing node, at an output index that exists, and at an output whose type matches the input (MultiType: one of its types; MatchType: any); every required input is set (including required DynamicCombo children); literal combo values are in the option list; literal numbers are within `min`/`max`, INT gets no float, BOOLEAN gets a bool; a loader with `_meta.optional` feeds only optional inputs.
4. **Checker self-test.** A mutated copy of `video_bg_change` (IMAGE into MASK, output index 1 of a one-output node, missing `max_objects`, float into INT, link to a missing node, `format: "mov"`) and of `bernini_clone_edit` (optional loader into the required `vae`) produced all 9 expected errors. The checker passes the shipped `bernini_restyle`, `bernini_swap`, `bernini_headswap`, `wan_animate2` and `ltx25_i2v` graphs with 0 problems.
5. **Fill test.** `shared/mapping.js` `fill()` on each graph with sample values (`video`, `start` 1.5, `duration` 4, `seed`, `image`…`image3`, `fps` 8, `strength` 0.65, `target`, `trajectory`, `orbit` false) leaves no `{{…}}` and no `undefined`; whole-string placeholders keep their type (`blend_factor` 0.65, `PrimitiveInt.value` 8, `switch` false).
6. **Files.** A copy of `modelFilesOf` with `MODEL_FILES` + `files.json` and `LOADERS` + `loaders.json` finds every file each graph's loaders name, with the folder each loader reads. Each file's `cloud` flag equals its presence in `https://cloud.comfy.org/api/experiment/models/<folder>` today (0 mismatches). Sizes and sha256 come from `https://huggingface.co/api/models/<repo>/tree/main?recursive=true`; every repo has `gated: false`.

## Result

```
bernini_clone_edit.json: 28 nodes, placeholders [duration, image, image2, image3, prompt, seed, start, video], problems 0
bernini_edit.json: 25 nodes, placeholders [duration, prompt, seed, start, video], problems 0
bernini_edit_ref.json: 26 nodes, placeholders [duration, image, prompt, seed, start, video], problems 0
bernini_grade.json: 31 nodes, placeholders [duration, prompt, seed, start, video], problems 0
bernini_mixed.json: 34 nodes, placeholders [duration, fps, prompt, seed, start, strength, video], problems 0
bernini_recreate_ad.json: 27 nodes, placeholders [duration, image, image2, prompt, seed, start, video], problems 0
recammaster.json: 25 nodes, placeholders [duration, orbit, prompt, seed, start, trajectory, video], problems 0
scail2_character_swap.json: 34 nodes, placeholders [duration, image, prompt, seed, start, video], problems 0
video_bg_change.json: 36 nodes, placeholders [duration, prompt, seed, start, video], problems 0
void_inpaint.json: 35 nodes, placeholders [duration, prompt, seed, start, target, video], problems 0
```

## Values the checker cannot read (option lists built at run time), checked by hand

| Input | Value used | Where checked |
|---|---|---|
| `KSamplerSelect.sampler_name` | `res_multistep`, `euler` | `KSAMPLER_NAMES` in `comfy/samplers.py` |
| `BasicScheduler.scheduler` | `simple` | `SCHEDULER_HANDLERS` in `comfy/samplers.py` |
| `CLIPLoader.type` | `wan`, `cogvideox` | `CLIPLoader.INPUT_TYPES` in `nodes.py` |
| `UNETLoader.weight_dtype` | `default` | `nodes.py` |
| `WanVideoSampler.scheduler` | `unipc` | `scheduler_list` in `wanvideo/schedulers/__init__.py` |
| `WanVideoModelLoader.attention_mode` | `sdpa` | `attention_modes` in `nodes_model_loading.py` |
| `WanVideoModelLoader.model` | `Wan2_1_kwai_recammaster_1_3B_step20000_bf16.safetensors` | list = `unet_gguf` + `diffusion_models`; Cloud `diffusion_models` has the name |
| `WanVideoReCamMasterDefaultCamera.camera_type` | `{{trajectory}}`: must be one of `pan_right`, `pan_left`, `tilt_up`, `tilt_down`, `zoom_in`, `zoom_out`, `translate_up`, `translate_down`, `arc_left`, `arc_right` | `recammaster/nodes.py` |
| Loader file names | every name in `MODEL_FILES` or `files.json` | Cloud listing per folder; HF tree |

## Per graph

Every class below exists at the pinned commit with the input names used; all links, types, required inputs and literal values passed the checks above.

- **bernini_mixed** — core: `LoadVideo`, `Video Slice`, `GetVideoComponents`, `CreateVideo`, `SaveVideo` (`nodes_video.py`); `RebatchImages` (`nodes_rebatch.py`, `is_input_list=True`, output `is_output_list=True`); `ImageFromBatch`, `GetImageSize` (`nodes_images.py`); `ImageBlend` (`nodes_post_processing.py`); `ComfyMathExpression` (`nodes_math.py`); `PrimitiveInt`; `BerniniConditioning`; `KSamplerSelect`, `BasicScheduler`, `SplitSigmas`, `SamplerCustom`; `CLIPLoader`, `CLIPTextEncode`, `VAELoader`, `UNETLoader`, `LoraLoaderModelOnly`, `VAEDecode`, `ImageScale` (`nodes.py`). List flow: #87 returns a list, #88 runs once per chunk, #89 takes the list (`is_input_list`) and returns one batch, so every node after #89 runs once. `CreateVideo.fps` is FLOAT 1 to 120: `source_fps / n` stays in range for 8 to 120 fps sources. `ImageBlend.blend_factor` FLOAT 0 to 1: 0.45 / 0.65 / 0.85.
- **bernini_grade** — as above without `ImageBlend`/`ImageScale`, plus `ColorTransfer` (`method` `mkl_lab` in its literal list; `source_stats` `uniform` is a DynamicCombo key with no children). `image_target` takes all trimmed frames, `image_ref` the Bernini frames; `uniform` pools both, so the counts need not match.
- **bernini_edit / bernini_edit_ref** — the same nodes, values and links as the shipped `bernini_swap_noref` / `bernini_swap` (compared structurally, ignoring node ids and the save prefix).
- **bernini_clone_edit** — `LoadImage` `{{image2}}` and `{{image3}}` carry `_meta.optional` and feed only `reference_images.reference_image_1` / `_2`. `reference_images` is `optional=True` with `min=0`, so each slot is optional; the checker confirms no optional loader feeds a required input.
- **bernini_recreate_ad** — as clone edit with two slots; `{{image2}}` is optional.
- **void_inpaint** — core `nodes_void.py`: `VOIDInpaintConditioning` (width/height step 8: the graph gives multiples of 16; `length` from #82, a value with an even latent count), `VOIDSampler` (no inputs), `VOIDWarpedNoise`, `VOIDWarpedNoiseSource`, `OpticalFlowLoader` (`optical_flow` folder in `folder_paths.py`); `nodes_sam3.py`: `SAM3_VideoTrack` (`detection_threshold` 0.5, `max_objects` 4, `detect_interval` 1 within limits), `SAM3_TrackToMask`; `nodes_custom_sampler.py`: `RandomNoise`, `CFGGuider`, `BasicScheduler`, `SamplerCustomAdvanced`. `CheckpointLoaderSimple` output 1 (CLIP) feeds the SAM text encode, as the template.
- **video_bg_change** — Bernini block plus `CheckpointLoaderSimple`, `SAM3_VideoTrack`, `SAM3_TrackToMask`, `GrowMask`, `LoadBackgroundRemovalModel` (`background_removal` folder in `folder_paths.py`), `RemoveBackground` (MASK out), `MaskComposite` (`multiply`), `ImageCompositeMasked` (`resize_source` false; source and destination are both `#83`×`#84`, so no resize is needed).
- **scail2_character_swap** — `nodes_scail.py`: `WanSCAILToVideo` (width/height step 32: the graph rounds to 32; `previous_frame_count` 5 with step 4 from min 1), `SCAIL2ColoredMask` (`sort_by` `area` in its list; `ref_track_data` MultiType SAM3 track or MASK: gets a track); `ModelSamplingSD3` (`nodes_model_advanced.py`); `CLIPVisionLoader`, `CLIPVisionEncode` (`crop` `none` in its list); `SamplerCustom` output 1 (`denoised_output`) into `VAEDecode`, as the template.
- **recammaster** — WanVideoWrapper classes read from the pinned sources: `WanVideoModelLoader`, `WanVideoVAELoader` (`nodes_model_loading.py`), `WanVideoEncode`, `WanVideoDecode`, `WanVideoTextEmbedBridge` (`nodes.py`), `WanVideoSampler` (`nodes_sampler.py`), `WanVideoReCamMasterDefaultCamera`, `WanVideoReCamMasterGenerateOrbitCamera`, `WanVideoReCamMasterCameraEmbed` (`recammaster/nodes.py`). Types match: `WANVAE`, `WANVIDEOMODEL`, `LATENT`, `CAMERAPOSES`, `WANVIDIMAGE_EMBEDS`, `WANVIDEOTEXTEMBEDS`. Core `ComfySwitchNode` has lazy optional MatchType inputs, so only the picked camera node runs. `GenerateOrbitCamera.num_frames` takes the same frame count as the encoded latent, so its 21 poses (81 frames, every 4th) match the latent length, as the default camera does.

## Scripts

`scripts/make_graphs.py <out_dir>` writes the ten graphs. `scripts/schemas.py <out.json> <source dirs>` builds the schemas. `scripts/check.py <schemas.json>[,<more.json>] <graphs…>` runs the checks.
