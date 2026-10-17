# LTX-2.5 and MiniMax H3: workflows, files, versions

> In the repo these graphs are `public/workflows/ltx25_t2v.json`, `ltx25_i2v.json`, `h3_open_t2v.json` (here `h3_t2v.json`) and `h3_open_i2v.json` (here `h3_i2v_open.json`). Decisions: [newest-models.md](newest-models.md).

Research date: 2026-10-17. All probes were read-only public GET requests with no API key and no weight downloads. Safetensors headers were read with small HTTP range requests (header bytes only).

Graphs in this folder (ComfyUI API format, placeholders as whole string values):

- `ltx25_t2v.json`, `ltx25_i2v.json`
- `h3_t2v.json`, `h3_i2v_open.json`

Each graph uses core ComfyUI nodes only. No custom node pack is needed on Comfy Cloud or on the Pod.

## Sources used

| Short name | URL |
|---|---|
| Cloud files | `https://cloud.comfy.org/api/experiment/models/<folder>` (diffusion_models, text_encoders, vae, loras, latent_upscale_models, model_patches) |
| Cloud version | https://cloud.comfy.org/api/system_stats (reports `comfyui_version: v0.41.1`, `cloud_version: v0.480.0`) |
| Templates | https://github.com/Comfy-Org/workflow_templates (main at commit `9afccb38`, 2026-10-17): `templates/video_ltx2_5_t2v.json`, `video_ltx2_5_i2v.json`, `video_minimax_h3_t2v.json`, `video_minimax_h3_i2v.json`, `templates/index.json` |
| ComfyUI source | https://github.com/Comfy-Org/ComfyUI at tag `v0.33.1` (`72865f4f`), tag `v0.41.1`, and `master` (`5cc4b870`, 2026-10-16) |
| HF API | `https://huggingface.co/api/models/<repo>?blobs=true` and `/tree/main/<dir>?expand=true` |
| Comfy docs | https://docs.comfy.org/tutorials/video/ltx/ltx-2-5 , https://docs.comfy.org/tutorials/video/minimax/minimax-h3 |
| LTX card | https://huggingface.co/Lightricks/LTX-2.5 (README) |
| H3 card | https://huggingface.co/MiniMaxAI/MiniMax-H3 (README, LICENSE, docs/QA-about-License.md), https://huggingface.co/Comfy-Org/MiniMax-H3 (README) |

---

## 1. LTX-2.5 (Lightricks)

### 1.1 Base template and recipe

- Base: official templates `video_ltx2_5_t2v` and `video_ltx2_5_i2v` (dated 2026-08-11, `minComfyUIVersion` 0.32.0). I flattened their subgraph "Text to Video (LTX-2.5)" / "Image to Video (LTX-2.5)" into API format. [Verified: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_5_t2v.json , .../video_ltx2_5_i2v.json , .../templates/index.json]
- Model: distilled 22B transformer, Comfy int8 + convrot. The model card says the distilled DiT uses a "Fixed 8-step schedule, CFG=1". [Verified: https://huggingface.co/Lightricks/LTX-2.5 README]
- Two-stage pipeline, exactly as the template:
  - Stage 1 at half width and half height: `ManualSigmas` "1.0, 0.99375, 0.9875, 0.98125, 0.975, 0.909375, 0.725, 0.421875, 0.0" (8 steps), sampler `euler_ancestral`, `LTXVDualCFGGuider` video_cfg 1, audio_cfg 1, noise seed `{{seed}}`.
  - `LTXVLatentUpsampler` with the x2 spatial upscaler.
  - Stage 2 at full size: `ManualSigmas` "0.85, 0.7250, 0.4219, 0.0" (3 steps), `euler_ancestral`, cfg 1/1, noise seed fixed 42 (template value).
  - Decode: `VAEDecodeTiled` (512, 64, 64, 16) and `LTXVAudioVAEDecode`; `CreateVideo` at 24 fps with audio.
  - [Verified: template subgraph nodes 338-404]
- Negative prompt "pc game, console game, video game, cartoon, childish, ugly" is kept from the template. At cfg 1 it has no effect, but the guider needs the input. [Verified: template node 373] [Inference: no effect at cfg 1]
- Image-to-video adds: `LoadImage` -> `ResizeImageMaskNode` (scale longer dimension, 1536, lanczos) -> `LTXVPreprocess` (img_compression 18) -> `LTXVImgToVideoInplace` on the stage-1 latent (strength 0.7) and on the upscaled latent (strength 1.0). [Verified: template nodes 349-351, 357]
- Left out from the template (optional, off by default): the prompt enhancer (`TextGenerateLTX2Prompt` + `gemma4_e2b_it_int8_convrot.safetensors`), `ResolutionSelector`, and the prompt-enhance switch. [Verified: template wrapper widget `False` for prompt_enhance; docs say "The workflow keeps it off by default"]

### 1.2 Placeholders and limits

- `{{width}}`, `{{height}}`: final output size. Two `ComfyMathExpression` nodes ("a/2") make the stage-1 size, as the template does. Use multiples of 64, so the half size is a multiple of 32. Example for 720p 16:9: 1280 x 704 (the template's 1280 x 736 also ends at 1280 x 704, because `EmptyLTXVLatentVideo` floors to /32). [Verified: `EmptyLTXVLatentVideo` step 32 in https://github.com/Comfy-Org/ComfyUI/blob/v0.33.1/comfy_extras/nodes_lt.py ; README "Width and height divisible by 32"] [Inference: floor result 1280 x 704]
- `{{frames}}`: frame count, must be 8k+1. 5 s at 24 fps = 121. [Verified: README "num_frames % 8 == 1"; template computes `duration * fps + 1`]
- `{{duration}}`: not used. The app must convert seconds to frames (seconds x 24 + 1). [Inference]
- `{{seed}}`, `{{prompt}}`, `{{image}}`: as specified.
- API keys for dynamic inputs: `values.a` (Autogrow) and `resize_type.longer_size` (DynamicCombo) are dot-joined names. [Verified: `finalize_prefix` and `parse_class_inputs` in https://github.com/Comfy-Org/ComfyUI/blob/v0.33.1/comfy_api/latest/_io.py]

### 1.3 Model files

| Loader | Exact filename | Folder | HF source (path) | Size | Gated | On Cloud |
|---|---|---|---|---|---|---|
| UNETLoader | `ltx-2.5-22b-distilled-transformer-comfy-int8-convrot.safetensors` | diffusion_models | `Lightricks/LTX-2.5` `diffusion_models/...` | 21.504 GB (21504034224 B) | yes ("auto") | yes |
| CLIPLoader (type `ltxv`) | `gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` | text_encoders | `Lightricks/LTX-2.5` `text_encoders/...` | 15.373 GB (15372969374 B) | yes | yes |
| VAELoader | `ltx-2.5-video-vae-bf16.safetensors` | vae | `Lightricks/LTX-2.5` `vae/...` | 1.472 GB | yes | yes |
| VAELoader | `ltx-2.5-audio-vae-bf16.safetensors` | vae | `Lightricks/LTX-2.5` `vae/...` | 0.365 GB | yes | yes |
| LatentUpscaleModelLoader | `ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | latent_upscale_models | `Lightricks/LTX-2.5` `latent_upscale_models/...` | 0.996 GB | yes | yes |

Total: about 39.7 GB. [Verified: https://huggingface.co/api/models/Lightricks/LTX-2.5?blobs=true (gated "auto", created 2026-07-23, files released 2026-08-11); Cloud lists in https://cloud.comfy.org/api/experiment/models/diffusion_models , /text_encoders , /vae , /latent_upscale_models]

Gating:

- `Lightricks/LTX-2.5` is gated ("auto": click-through approval). A Pod download needs an HF token from an account that accepted the terms. [Verified: HF API `gated: "auto"`; docs.comfy.org LTX-2.5 page: "Model downloads will fail without access"]
- Ungated byte-identical mirror: `comfyicu/LTX-2.5` (same paths). The sha256 matches Lightricks for the transformer (`c4279eef...`), both VAEs (`847e14ca...`, `c52733d3...`) and the upscaler (`eb5a71fe...`). [Verified: https://huggingface.co/api/models/comfyicu/LTX-2.5?blobs=true]
- Text encoder: Lightricks replaced it on 2026-08-17 (commit "Update Gemma 4 12B text encoders", sha `6ce688a0...`). `comfyicu/LTX-2.5` keeps the older revision (sha `09a89e08...`). `PulpCut/LTX-2.5-INT8-ConvRot-safetensors` (ungated) has the current revision at the same path `text_encoders/...` (sha `6ce688a0...`, same size). [Verified: HF tree API `lastCommit` for Lightricks; HF API blobs for both mirrors]
- Header comparison of the two text encoder revisions: same 1342 tensors, same shapes and dtypes. Only the `gemma_config` metadata (adds `gemma_version: gemma4-12b-ltx-v1`) and two embedded asset tensors (`hf_asset__chat_template.jinja`, `hf_asset__tokenizer_config.json`) differ. ComfyUI v0.33.1 and master do not read `gemma_version` or `hf_asset__*`. [Verified: safetensors header range read; grep of ComfyUI source] [Inference: both revisions give the same result in ComfyUI]
- These mirrors are third-party. Prefer `Lightricks/LTX-2.5` with a token when one is available. [Inference]

### 1.4 Cloud and HF name match

All five filenames exist on Comfy Cloud today and download under the same name from HF. The only gap: the official repo is gated. Same-name ungated copies exist (see 1.3). [Verified: sources in 1.3]

### 1.5 ComfyUI v0.33.1

- LTX-2.5 support landed in PR #15499 "Add support for LTX 2.5" (commit `57ce8e1a`, 2026-08-11), first release v0.32.0. Fix #15516 "Fix float64 device in ltx diffusion decoder" is in v0.33.0. Both are in v0.33.1. [Verified: `git merge-base --is-ancestor` and `git tag --contains` on https://github.com/Comfy-Org/ComfyUI ; PR https://github.com/Comfy-Org/ComfyUI/pull/15499]
- Every node in both LTX graphs exists in v0.33.1 with the input names used: UNETLoader, CLIPLoader (type list includes `ltxv`), VAELoader, LatentUpscaleModelLoader, CLIPTextEncode, LTXVConditioning, PrimitiveInt, ComfyMathExpression, EmptyLTXVLatentVideo, LTXVEmptyLatentAudio, LTXVConcatAVLatent, LTXVSeparateAVLatent, LTXVDualCFGGuider, KSamplerSelect, ManualSigmas, RandomNoise, SamplerCustomAdvanced, LTXVLatentUpsampler, VAEDecodeTiled, LTXVAudioVAEDecode, CreateVideo, SaveVideo, LoadImage, ResizeImageMaskNode, LTXVPreprocess, LTXVImgToVideoInplace. [Verified: v0.33.1 source `comfy_extras/nodes_lt.py`, `nodes_lt_audio.py`, `nodes_lt_upsampler.py`, `nodes_hunyuan.py`, `nodes_math.py`, `nodes_primitive.py`, `nodes_post_processing.py`, `nodes_custom_sampler.py`, `nodes_video.py`, `nodes.py`]
- The same input names exist in v0.41.1 (Cloud). Only `CreateVideo` gained optional inputs (`bit_depth` became a combo, plus `color_space`, `codec`). The graphs leave those out. [Verified: schema diff v0.33.1 vs v0.41.1]
- Weight formats: the transformer header has `comfy_quant` = `{"format": "int8_tensorwise", "convrot": true, "convrot_groupsize": 256}`. v0.33.1 has `int8_tensorwise` in `comfy/quant_ops.py` and reads `convrot` in `comfy/ops.py`. The Gemma 4 12B with projection is detected in v0.33.1 `comfy/sd.py` (`TEModel.GEMMA_4_12B`, `text_embedding_projection.video_aggregate_embed.weight`). The upscaler header has `post_upsample_res_blocks.0.conv2.bias` and a `config` metadata entry, which is the LTX branch in v0.33.1 `LatentUpscaleModelLoader`. [Verified: header range reads; v0.33.1 source]
- Later fix not in v0.33.1: #16185 "Fix quantized text encoder matmul gating and Gemma4 prefill cache positions" (v0.35.0). It changes the dequantize fallback for formats a device cannot run, and Gemma 4 text generation (prompt enhancer). [Verified: commit `b7ebfd73` diff] [Inference: no effect on an RTX PRO 6000 with the prompt enhancer off]
- Conclusion: v0.33.1 runs both LTX graphs. [Inference from the checks above; not executed]
- Pod custom nodes: the graphs need none of ComfyUI-sol-attn, ComfyUI-MiniMax-H3-Turbo, comfyui-minimax-h3-blockcache-T8, ComfyUI-LTX2.5-MSR. [Verified: every class_type is a core node]

### 1.6 VRAM and speed

- RunPod sizing for LTX-2.5: 16-24 GB "Quantized/int8 variants only, lower resolutions, offloading required"; 32-48 GB "The int8 ComfyUI checkpoints run well"; 80-96 GB (RTX PRO 6000, H100) "Full bf16 distilled pipeline with headroom". [Verified: https://www.runpod.io/blog/ltx-2-5-the-open-weights-world-model-built-for-speed-and-how-to-run-it-on-runpod]
- Minimum class for these graphs: 24 GB with ComfyUI offloading; 32 GB is the comfortable minimum; 96 GB keeps all 39.7 GB of weights resident. [Inference from the RunPod tiers and the file sizes]
- Time for 5 s 720p on an RTX PRO 6000: not documented. RunPod only says that on an RTX PRO 6000 or H100 "you'll be reviewing your first synchronized audio-video clip in well under a minute". [Verified: RunPod blog] Rough estimate: 20-60 s warm for 121 frames at 1280 x 704, plus 1-3 min on the first run to load about 40 GB. [Inference]

### 1.7 License

LTX-2.x Community License Agreement: free, including commercial use, for entities under 10 million USD annual revenue; above that a paid commercial license is needed. [Verified: https://huggingface.co/Lightricks/LTX-2.5 README; license link https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x]

---

## 2. MiniMax H3 (open weights)

### 2.1 Base template and recipe

- Base: official templates `video_minimax_h3_t2v` and `video_minimax_h3_i2v` (dated 2026-08-02, `minComfyUIVersion` 0.30.0). Both use one subgraph "Image to Video (MiniMax H3)" around the core node `MiniMaxH3ImageToVideo`. No image = t2va, `first_frame` = fl2va. [Verified: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json , .../video_minimax_h3_i2v.json , index.json; docs.comfy.org H3 overview]
- Turbo path (fewest steps that is on Cloud and on HF, see 2.4): `LoraLoaderModelOnly` with `minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors` at strength 1.0, `BasicScheduler` simple, 8 steps, denoise 1.0, sampler `res_multistep`, `BasicGuider` (no CFG). [Verified: template nodes 121-126 and wrapper widgets (LoRA name, strength 1, turbo steps 8); docs: "Turning that switch on loads the turbo LoRA and drops the step count to 8 in the Text to Video and Image to Video templates"; "Every local MiniMax H3 workflow samples with res_multistep and the simple scheduler"]
- No CFG: the released checkpoints "are CFG-distilled". [Verified: https://huggingface.co/MiniMaxAI/MiniMax-H3 README]
- Shift comes from the model definition (`shift` 12, `audio_shift` 3), so no shift node. [Verified: docs.comfy.org H3 overview; v0.33.1 `comfy/supported_models.py` lines 966-967]
- Template default is turbo off (20 steps). Docs: at 8 steps speech and voice timbre are "the weakest part of the output, and 12 steps and above keep the track usable". For dialogue-heavy clips, raise `steps` to 12 or turn the LoRA off and use 20. [Verified: docs.comfy.org H3 overview, "Step count"]
- Decode: `VAEDecode` (video) and `VAEDecodeAudio` both read output 0 of `SamplerCustomAdvanced`; `CreateVideo` at 24 fps with audio (stereo). [Verified: template nodes 10, 23, 91]

### 2.2 Placeholders and limits

- `{{width}}`, `{{height}}`: native canvas has a 768 px short edge, area cap 768 x 1344, multiples of 32. 16:9 native = 1344 x 768. For "720p" use 1344 x 768 (native) or 1280 x 704. [Verified: docs "H3's native canvas is a 768px short edge, capped at 768x1344 pixels, rounded to a multiple of 32"; node `step=32`]
- `{{frames}}`: the node snaps up to the 17k+5 grid at 24 fps (`align_frame_count`). 5 s: pass 120 or 121, the node uses 124 (5.17 s). Trained range "~124-362". [Verified: v0.33.1 `comfy_extras/nodes_minimax_h3.py`]
- `{{duration}}`: not used (the template converts seconds with a math node; the app can pass frames). [Inference]
- `{{seed}}`, `{{prompt}}`, `{{image}}` (i2v only, wired to `first_frame`). The first frame is stretched to the canvas ("plain stretch"), so send an image with the same aspect ratio. [Verified: node source comment "geometry anchor: plain stretch to canvas"]

### 2.3 Model files

| Loader | Exact filename | Folder | HF source (path) | Size | Gated | On Cloud |
|---|---|---|---|---|---|---|
| UNETLoader | `minimax_h3_fl2va_pruned_int8_convrot.safetensors` | diffusion_models | `Comfy-Org/MiniMax-H3` `diffusion_models/...` | 20.970 GB (20970379616 B) | no | yes |
| LoraLoaderModelOnly | `minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors` | loras | `Comfy-Org/MiniMax-H3` `loras/...` (also `lightx2v/Minimax-h3-Turbo` at repo root, same sha `2339acdf...`) | 1.956 GB | no | yes |
| CLIPLoader (type `minimax`) | `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | text_encoders | `Comfy-Org/MiniMax-H3` `text_encoders/...` | 15.687 GB | no | yes |
| VAELoader | `minimax_h3_video_vae_fp16.safetensors` | vae | `Comfy-Org/MiniMax-H3` `vae/...` | 5.208 GB | no | yes |
| VAELoader | `minimax_h3_audio_vae_fp32.safetensors` | vae | `Comfy-Org/MiniMax-H3` `vae/...` | 0.605 GB | no | yes |

Total: about 44.4 GB. [Verified: https://huggingface.co/api/models/Comfy-Org/MiniMax-H3?blobs=true (gated false), https://huggingface.co/api/models/lightx2v/Minimax-h3-Turbo?blobs=true ; Cloud lists /diffusion_models, /loras, /text_encoders, /vae]

Notes:

- The template's own Model Links note gives sizes in GiB (for example 19.53 for the 20.97 GB file). [Verified: template note vs HF bytes]
- `Comfy-Org/MiniMax-H3` README: "This `nvfp4` text encoder does not require Blackwell GPU to use". Its header has `{"format": "nvfp4", "full_precision_matrix_mult": true}`. [Verified: README; header range read]
- Alternative text encoder on both Cloud and HF: `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` (27.141 GB). [Verified: Cloud list, HF API]

### 2.4 Cloud and HF name match, and the gaps

All five filenames in the graphs exist on Cloud and on the ungated `Comfy-Org/MiniMax-H3` under the same name. Two template defaults do not match Cloud, so the graphs change them:

- Video VAE: the template uses `minimax_h3_video_vae_int8_convrot.safetensors` (2.811 GB on HF). Cloud does not list it; Cloud lists only `minimax_h3_video_vae_fp16.safetensors`. The graphs use the fp16 VAE. [Verified: template nodes 119/11; Cloud /vae list]
- 4-step turbo LoRA: the template note offers `minimax_h3_fl2v_turbo_4step_v1.0_768p_comfyui_bf16.safetensors` (HF `Comfy-Org/MiniMax-H3/loras/` and `lightx2v/Minimax-h3-Turbo`; newer v1.1 and v1.2 768p comfyui files exist in `lightx2v`). Cloud does not list any of them. Cloud lists `minimax_h3_fl2v_lightx2v_turbo_4step_v0.1_comfy.safetensors`, `minimax_h3_fl2v_lightx2v_turbo_4step_v0.1_comfy_resized_avg_rank_21_bf16.safetensors` and `minimax_h3_turbo_v4_step600_ema_pruned_comfyui.safetensors`, but I did not find those names in the checked HF repos. So the 8-step v1.0 LoRA is the fewest-steps turbo file with one name on both. [Verified: Cloud /loras list; HF API for Comfy-Org/MiniMax-H3 and lightx2v/Minimax-h3-Turbo]
- The earlier probe's `minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16` is for the ref2va (reference) checkpoint, not for these fl2va graphs. [Verified: docs "the templates that ship the reference turbo LoRA: Reference to Video, Multiframe Reference, and Fun ControlNet Union"]

### 2.5 ComfyUI v0.33.1

- H3 support: PR #15167 "Add minimax h3 support" (`7dd46274`) and PR #15224 "feat: Support MiniMax-H3" (`57500fc5`), first release v0.30.0. Also in v0.33.1: #15334 int8_convrot VAE (v0.31.0), #15446 VAE optimization, #15477 VAEDecodeTiled NestedTensor fix, #15486 peak memory fix (v0.32.0), #15581 qkv detection (v0.33.0). [Verified: ancestry and `git tag --contains` on https://github.com/Comfy-Org/ComfyUI]
- `MiniMaxH3ImageToVideo` inputs are the same in v0.33.1 and master: clip, vae, prompt, width, height, length, optional first_frame, last_frame. [Verified: v0.33.1 and master `comfy_extras/nodes_minimax_h3.py`]
- CLIPLoader type list in v0.33.1 includes `minimax`. NVFP4 with AWQ smoothing is handled in v0.33.1 `comfy/ops.py` ("ModelOpt AWQ-style smoothing"). Pruned checkpoints (`adaln_t_table`) are read in v0.33.1 `comfy/ldm/minimax/model.py` and `comfy/model_detection.py`. [Verified: v0.33.1 source]
- The turbo LoRA keys (`diffusion_model.blocks.N.attn.qkv_proj`, `.out_proj`, `.mlp.fc1`, `.mlp.fc2`, `token_refiner...`; 624 tensors, "ComfyUI generic LoRA") match module names in v0.33.1 `comfy/ldm/minimax/model.py`. [Verified: LoRA header range read; v0.33.1 source]
- H3 fixes that are NOT in v0.33.1 (v0.33.1 is a release-branch tag: v0.33.0 plus one cherry-pick, #15588):
  - #15808 "Minimax-H3: Add missing special tokens" (v0.34.0). Matters only for prompts that use `<d>`, lyrics or caption tags. [Verified: commit `924743af` diff] [Inference: no effect on plain prompts]
  - #16485 "Fix MiniMax-H3 VAE rms_rope crash on offloaded qk_norm_scale" (v0.38.0), #16698 "Fix minimax vae offload issue" (v0.39.0), "Reduce MiniMax-H3 peak VRAM ..." (`2d6b7328`, v0.39.0). These matter when the VAE or blocks are offloaded, so on 24-32 GB cards. [Verified: commit titles and tags] [Inference: no effect on 96 GB with no offload]
  - Prompt embeddings (#15697, v0.34.0) and `MiniMaxH3AddGuide` (#15439) are not used by these graphs.
- Conclusion: v0.33.1 runs both H3 graphs. On a 96 GB card the post-0.33.1 offload fixes are not needed. [Inference from the checks above; not executed]
- Pod custom nodes: the graphs need none of the four. [Verified: every class_type is core] ComfyUI-MiniMax-H3-Turbo and comfyui-minimax-h3-blockcache-T8 are optional speed-ups for H3 (turbo sampler / block cache) per third-party listings; I did not find primary pages for ComfyUI-sol-attn or ComfyUI-LTX2.5-MSR. [Inference: from https://www.runcomfy.com/comfyui-nodes/ComfyUI-MiniMax-H3-Turbo and https://www.runcomfy.com/comfyui-nodes/comfyui-minimax-h3-blockcache-T8]
- Docs warning: the int8-convrot H3 checkpoints crash with Comfy Kitchen attention (issue #15529). Keep the default attention backend with these graphs. [Verified: docs.comfy.org H3 overview]

### 2.6 VRAM and speed

- No official VRAM matrix. Community figure: pruned INT8 + NVFP4 AWQ text encoder "~24 GB (12 GB may work w/ ample RAM + fast disk)". [Verified as a community claim: https://github.com/wildminder/awesome-minimax-H3/blob/main/guides/minimax-h3-performance.md] Comfy's launch post says dynamic offloading lets H3 run on an RTX 3060. [Verified: https://blog.comfy.org/p/minimax-h3-day-0-support-in-comfyui]
- Minimum class for these graphs: 24 GB with offloading (and preferably a ComfyUI newer than v0.33.1, see 2.5); 32 GB comfortable; 96 GB keeps all 44.4 GB resident. [Inference]
- Time for 5 s 720p on an RTX PRO 6000: not documented. The closest measured point: RTX 4070 12 GB, 576 x 832, 124 frames, 8 steps (LightX2V v1.0): 131 s; 20 steps: 273 s. [Verified as community data: awesome-minimax-H3 guide] Rough estimate for 1344 x 768, 124 frames, 8 steps on an RTX PRO 6000: about 1-2 min warm, plus first-run load time for about 44 GB. [Inference]

### 2.7 License

MiniMax H3 Community License Agreement: royalty-free use only in the "Applicable Territory", which excludes the EU, the UK, South Korea and the United States (use there needs a separate license from MiniMax); products above 20 million USD yearly revenue need written authorization, and commercial products must show "MiniMax H3" in the UI. [Verified: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE sections "Applicable Territory", "Excluded Territories", IV.1, IV.2; Q&A https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/QA-about-License.md] Comfy docs add: "Commercial use of locally generated outputs requires a MiniMax commercial license ... available through Comfy ... Generations on Comfy Cloud already include commercial rights." [Verified: docs.comfy.org H3 overview] The `lightx2v` turbo LoRA itself is Apache-2.0. [Verified: HF API lightx2v/Minimax-h3-Turbo]

---

## 3. SaveVideo across versions

The graphs use `{"format": "mp4", "codec": "h264", "format.codec": "h264"}`.

- v0.33.1: `format` is a plain combo (`auto`, `mp4`) and `codec` is a DynamicCombo (`auto`, `h264`). The extra key `format.codec` is dropped because `get_input_data` keeps only inputs that the schema defines. [Verified: v0.33.1 `comfy_extras/nodes_video.py`, `execution.py` lines 159-190]
- v0.41.1 (Cloud): `format` is a DynamicCombo whose `mp4` option holds a nested `codec` (`format.codec`). A legacy top-level `codec` input stays as an optional hidden input, and `execute` uses `format.get("codec") or codec`. A nested DynamicCombo is only added to the schema when its key is present, so the old `{"format": "mp4", "codec": "h264"}` also works there. [Verified: v0.41.1 `comfy_extras/nodes_video.py` and `comfy_api/latest/_io.py` `_expand_schema_for_dynamic`]
- Result: the same SaveVideo inputs work on both versions. The existing `public/workflows/*.json` SaveVideo form is also fine. [Inference from source; not executed]
- `CreateVideo`: leave `bit_depth` out. Its type changed (int 8/10 in v0.33.1, combo "auto"/8/10 in v0.41.1). [Verified: schema diff]

## 4. Things that can block

| Item | Cloud (v0.41.1) | Pod (v0.33.1) |
|---|---|---|
| LTX-2.5 files | All present | Official repo is gated: needs an HF token, or the ungated mirrors in 1.3 |
| LTX-2.5 nodes | All core, present | All present (support since v0.32.0) |
| H3 files | All present (fp16 VAE, 8-step LoRA; the template's int8 VAE and 4-step 768p LoRA are not on Cloud) | Ungated `Comfy-Org/MiniMax-H3` |
| H3 nodes | Present | Present (since v0.30.0); later offload and VRAM fixes missing, which matters below 96 GB |
| H3 license | Cloud generations include commercial rights (Comfy docs) | The open-weight license excludes the US, EU, UK and South Korea; local commercial use needs a MiniMax license |
| Graph validity | Not executed | Not executed |

None of the graphs was run. All compatibility claims come from reading the source of the exact tags.
