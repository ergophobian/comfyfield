# How the effects-loras graphs were checked

Date: 2026-10-19. ComfyUI source: `45bf90d1c91eecd782643346dcfb73cb0017667f` (the Pod and Comfy Cloud, v0.41.1). No graph was queued; these are static checks against the source plus a fill test with the app's own code.

## Method

1. **Schemas from source.** I downloaded `nodes.py`, `comfy/lora.py`, `comfy/samplers.py`, `folder_paths.py` and `comfy_extras/nodes_{wan,minimax_h3,model_advanced,video,custom_sampler,math,primitive,images,audio}.py` at the pinned commit. For each class the graphs use I wrote down its required and optional inputs, their types or combo options, and its outputs, and confirmed the class is registered (`NODE_CLASS_MAPPINGS` in `nodes.py` and `nodes_model_advanced.py`, or the extension's node list; every extras file is in the built-in list of `nodes.py`). The sampler and scheduler lists are parsed from `comfy/samplers.py` (`KSAMPLER_NAMES` plus `ddim`, `uni_pc`, `uni_pc_bh2`; `SCHEDULER_HANDLERS`), and the CLIPLoader types from `nodes.py`.
2. **Static checker** (`scratchpad/fx/checkgraphs.py`, not in the repo). For every node it checks: the class is known; every required input is set; every input name exists; every link points at an existing node and an existing output index whose type matches the input; every combo value is in the options; every number widget is a number or a whole-string placeholder; every loader file is in `MODEL_FILES` or this folder's `files.json` with the right folder; every node reaches the SaveVideo output; and every `_meta.optional` loader feeds only optional inputs. Result: **0 problems** for both graphs.
3. **Fill test** (`scratchpad/fx/simulate.mjs`). It imports `fill` and `dropOptional` from `shared/mapping.js` and `MODEL_FILES` from `shared/modelFiles.js`, fills each graph with a format's params, drops absent optional loaders, checks no placeholder is left, and lists the files a Pod would download.
4. **Files.** `files.json` is generated from the Hugging Face tree API (`lfs.oid`, `lfs.size`), with `gated` checked false for every repo, and `cloud` set from Comfy Cloud's `/api/experiment/models/<folder>` listings. Every local name matches the Pod's `SAFE_NAME` rule `^[\w.+-]+$` (`pod-statusd.py`, `scripts/pod-checks.mjs` line 474).
5. **LoRA keys.** Safetensors headers (range requests, header bytes only) show Redmond and Orbit keys as `diffusion_model.blocks.N....lora_A/lora_B` and Pupil Transition keys as `lora_unet_blocks_N_...lora_down/lora_up` with `alpha`. ComfyUI maps both forms for any model: `model_lora_keys_unet` adds `lora_unet_<key>` and the bare `diffusion_model.<key>` for every `diffusion_model.*.weight` (`comfy/lora.py` lines 196 to 202). Wan LoRA shapes are 5120 wide (Wan 14B); the Orbit LoRA's `attn.qkv_proj` and `mlp.fc1/fc2` keys are the module names H3 uses, as the turbo LoRA in `MODEL_FILES` does.

## `wan22_lora_i2v.json`

| Node | Class | Checked inputs (source) | Links (from → output type) |
|---|---|---|---|
| 1 | LoadImage | `image` = `{{image}}` (`nodes.py` 1747) | out IMAGE |
| 2 | GetImageSize | `image` (`nodes_images.py` 725) | 1[0] IMAGE → out width INT, height INT |
| 3, 4 | ComfyMathExpression | `expression`, Autogrow `values.a`/`values.b` of Float/Int/Bool (`nodes_math.py`); functions `sqrt`, `round`, `max` are in `MATH_FUNCTIONS` | 2[0], 2[1] INT; output 1 is INT (`int(result)`) |
| 5 | PrimitiveFloat | `value` = `{{duration}}` (`nodes_primitive.py` 64) | out FLOAT |
| 6 | ComfyMathExpression | `min(81, 4 * floor(a * 4) + 1)`; `floor`, `min` allowed | 5[0] FLOAT → out 1 INT |
| 7, 8 | UNETLoader | `unet_name`, `weight_dtype` `default` in `[default, fp8_e4m3fn, fp8_e4m3fn_fast, fp8_e5m2]` (`nodes.py` 992) | out MODEL |
| 9 | CLIPLoader | `clip_name`, `type` `wan` (in the list), optional `device` `default` (`nodes.py` 1017) | out CLIP |
| 10 | VAELoader | `vae_name` | out VAE |
| 11, 12 | LoraLoaderModelOnly | `model`, `lora_name`, `strength_model` (`nodes.py` 761); a strength of 0 returns the model without reading the file (`nodes.py` 740 to 742) | 7[0], 8[0] MODEL |
| 13, 14 | LoraLoaderModelOnly | Lightning files, strength 1.0 | 11[0], 12[0] MODEL |
| 15, 16 | ModelSamplingSD3 | `model`, `shift` 5.0 (`nodes_model_advanced.py` 120) | 13[0], 14[0] MODEL |
| 17, 18 | CLIPTextEncode | `text`, `clip` (`nodes.py` 58) | 9[0] CLIP → out CONDITIONING |
| 19 | WanImageToVideo | required `positive`, `negative`, `vae`, `width`, `height`, `length`, `batch_size`; optional `start_image` (`nodes_wan.py` 18 to 41) | 17[0], 18[0] CONDITIONING; 10[0] VAE; 3[1], 4[1], 6[1] INT; 1[0] IMAGE → out positive, negative, latent |
| 20 | KSamplerAdvanced | all 13 required inputs; `add_noise` `enable`, `sampler_name` `euler`, `scheduler` `simple`, `return_with_leftover_noise` `enable` (`nodes.py` 1635) | 15[0] MODEL; 19[0], 19[1] CONDITIONING; 19[2] LATENT |
| 21 | KSamplerAdvanced | `add_noise` `disable`, `noise_seed` 0, start 2, end 4, leftover `disable` | 16[0] MODEL; 19[0], 19[1]; 20[0] LATENT |
| 22 | VAEDecode | `samples`, `vae` | 21[0] LATENT, 10[0] VAE → IMAGE |
| 23 | CreateVideo | `images`, `fps` 16; `audio` optional and unset (`nodes_video.py` 210) | 22[0] IMAGE → VIDEO |
| 24 | SaveVideo | `video`, `filename_prefix`, `format` `mp4` with `format.codec` `h264`, legacy hidden `codec` `h264` (`nodes_video.py` 139 to 176) | 23[0] VIDEO |

- Required inputs: all set (checker). Combo values: all valid (checker). Optional loaders: none in this graph.
- Fill test, `building-explosion` params: 24 nodes, no placeholder left, `strength_model` and `duration` stay numbers; 8 files, 38.19 GB, largest GPU class 24; not on Cloud: the two Explosion LoRA files.
- Fill test, `eyes-in` (high noise only, low strength 0, same file in both slots): 7 files (the shared file counts once), 38.34 GB; not on Cloud: the Pupil Transition file.
- Template parity: steps, split, CFG, sampler, scheduler, shift, fps and the negative prompt equal the `video_wan2_2_14B_i2v` subgraph with "Enable 4steps LoRA?" on (nodes 85, 86, 101 to 104, 118, 122, 124, 162). Deviations are listed in `README.md` section 2.

## `h3_lora_i2v.json`

| Node | Class | Checked inputs (source) | Links |
|---|---|---|---|
| 1 | UNETLoader | `minimax_h3_fl2va_pruned_int8_convrot.safetensors`, `default` | out MODEL |
| 2 | LoraLoaderModelOnly | `{{lora}}`, `{{lora_strength}}` | 1[0] MODEL |
| 3 | CLIPLoader | `type` `minimax` (in the list) | out CLIP |
| 4, 5 | VAELoader | video fp16, audio fp32 | out VAE |
| 6 | MiniMaxH3ImageToVideo | required `clip`, `vae`, `prompt`, `width`, `height`, `length`; optional `first_frame`, `last_frame` (`nodes_minimax_h3.py` 116 to 136) | 3[0] CLIP; 4[0] VAE; 18[1], 19[1] INT; 16[0] IMAGE; 20[0] IMAGE (optional) → out CONDITIONING, LATENT |
| 7 | RandomNoise | `noise_seed` = `{{seed}}` | out NOISE |
| 8 | KSamplerSelect | `res_multistep` (in `KSAMPLER_NAMES`) | out SAMPLER |
| 9 | BasicScheduler | `model`, `scheduler` `simple`, `steps` 20, `denoise` 1.0 | 2[0] MODEL → SIGMAS |
| 10 | BasicGuider | `model`, `conditioning` | 2[0] MODEL, 6[0] CONDITIONING → GUIDER |
| 11 | SamplerCustomAdvanced | `noise`, `guider`, `sampler`, `sigmas`, `latent_image` | 7[0], 10[0], 8[0], 9[0], 6[1] LATENT → output LATENT |
| 12 | VAEDecode | | 11[0] LATENT, 4[0] VAE → IMAGE |
| 13 | VAEDecodeAudio | `samples`, `vae` (`nodes_audio.py` 116) | 11[0] LATENT, 5[0] VAE → AUDIO |
| 14 | CreateVideo | `images`, `audio`, `fps` 24 | 12[0], 13[0] → VIDEO |
| 15 | SaveVideo | as above | 14[0] VIDEO |
| 16 | LoadImage | `{{image}}` | out IMAGE |
| 17 | GetImageSize | | 16[0] IMAGE |
| 18, 19 | ComfyMathExpression | `32 * round(a * min(768 / min(a, b), 1344 / max(a, b)) / 32)` and the same for `b` | 17[0], 17[1] INT → out 1 INT |
| 20 | LoadImage | `{{image2}}`, `_meta.optional: "image2"` | out IMAGE → only 6.`last_frame`, which is `optional=True` |

- Required inputs: all set. Combo values: all valid. **Optional loader:** node 20 feeds only `last_frame`, an optional input (checker line: "optional node 20 feeds 6.last_frame: that input is optional").
- Fill test with `image2` (the `frozen-in-motion` binding): 20 nodes kept, `last_frame` linked to node 20, no placeholder left; 5 files, 42.64 GB, GPU class 32; not on Cloud: the Orbit LoRA.
- Fill test without `image2`: `dropOptional` removes node 20 and the `last_frame` link (19 nodes), no placeholder left, the graph is plain first-frame image to video.
- `{{frames}}` = 73 for a 3 s format; `align_frame_count` keeps 73 (73 % 17 = 5).
- Parity with `h3_open_i2v.json`: same files, sampler, scheduler, guider, decoders and fps; turbo LoRA removed and steps 20 (the template's turbo-off default, `PrimitiveInt` 124 = 20); size from the photo. See `README.md` section 3.

## Files

- All 21 entries in `files.json`: repo not gated (HF API `gated: false`), size and sha256 from `lfs`. The 5 Wan base files are in Comfy Cloud's `diffusion_models`, `loras` and `vae` listings under the same names; the 16 effect LoRA files are not.
- Bracketed source paths (15 Redmond files): a Python `urllib` HEAD request, as `pod-statusd.py` `fetch` makes, returned 200 for both the raw path and the percent-encoded path. The first response's `X-Linked-ETag` (`51b20f2b…` for the Explosion high noise file) equals the `lfs.oid` in `files.json`, so the Pod's sha256 check will pass. (Python 3.9 locally; `http.client` rejects only control characters and spaces in a URL.)
- No loader class or input is new: UNETLoader, CLIPLoader, VAELoader and LoraLoaderModelOnly are all in `LOADERS`, so there is no `loaders.json`. Every class is core, so there is no `packs.json`.

## Not checked

- No run on ComfyUI, so VRAM, speed and the look of each effect with the Lightning LoRA (Wan) or at 20 steps (H3) are unmeasured.
- Whether `Metalcification` was trained on the I2V or the T2V experts (the card disagrees with itself; the samples are I2V).
