# Genjutsu formats on open models

Research date: 2026-10-18. Scope: the `swap-element`, `motion-transfer`, `face-swap-video`, `restyle-video`, `video-relight` and `color-grade` formats in `src/lib/formats/edit.js`, and the `Bernini-R` and `Wan Animate 2` rows of `openModels` in `src/lib/tools.js`.

Tags: **[Verified: source]** means I read it in a primary source on this date. **[Inference]** means my conclusion, not stated by a source. No weights were downloaded and no API keys were used.

## Summary

| Format | Model to use | Graph file | LoRAs | On Comfy Cloud | Main blocker |
|---|---|---|---|---|---|
| `swap-element` | Bernini-R (keep) | `bernini_swap.json` (with reference), `bernini_swap_noref.json` | LightX2V T2V turbo LoRA only | All files and nodes: yes | ComfyField cannot upload a `{{video}}` yet |
| `motion-transfer` | Wan Animate 2 Distilled (keep) | `wan_animate2.json` | None (distilled); base model needs the LightX2V I2V LoRA | All files and nodes: yes | Prompt text in `edit.js` must change; `CLIPVisionLoader` is not in `shared/modelFiles.js` |
| `face-swap-video` | Change to Bernini-R + BFS head-swap LoRA. Keep Wan 2.2 Animate Mix as a fallback | `bernini_headswap.json` (recommended), `wan22_animate_face_swap.json` (planned model) | BFS `headswap_bernini_*` high/low; Wan path: LightX2V I2V + relight LoRA | Bernini path: the 2 head-swap LoRAs are **not** on Cloud. Wan path: files yes, `DrawViTPose` not listed (not used here) | Head-swap LoRA is Pod-only unless imported; face crop input needed |
| `restyle-video` | Bernini-R (keep), prompt only | `bernini_restyle.json` | **None needed.** No public Bernini-R LoRA exists for any of the 16 presets | Yes | Same `{{video}}` upload gap |
| `video-relight` | Bernini-R | `bernini_relight.json` | None | Yes | Same |
| `color-grade` | Bernini-R + KJNodes Color Match | `bernini_grade.json` | None | Yes (KJNodes `ColorMatch` is listed) | Pod needs KJNodes installed |

All graphs are in the same folder as this file and pass a link and input-name check against the ComfyUI v0.41.1 source (`scripts-genjutsu/check_graphs.py`, 0 problems).

## 1. The models

### Bernini-R

- **Authors:** ByteDance. Paper "Bernini: Latent Semantic Planning for Video Diffusion", Chenchen Liu, Junyi Chen, Lei Li, Lu Chi, Mingzhen Sun, Zhuoying Li and others, corresponding author Zehuan Yuan, arXiv 2605.22344, v1 2026-05-21, v2 2026-09-02. [Verified: [HF model card](https://huggingface.co/ByteDance/Bernini-R), [arXiv](https://arxiv.org/abs/2605.22344)]
- **What it is:** the renderer-only part of Bernini, fine-tuned from Wan2.2-T2V-A14B (two 14B experts, high noise and low noise). It takes the source video and reference images as in-context streams. The full Bernini adds a Qwen2.5-VL-7B planner. [Verified: [docs/bernini_r.md](https://github.com/bytedance/Bernini/blob/main/docs/bernini_r.md), [Comfy docs](https://docs.comfy.org/tutorials/video/bytedance/bernini-r.md)]
- **Release:** weights 2026-06-01 (`ByteDance/Bernini-R`, created 2026-06-01). 1.3B variant 2026-06-09. Full Bernini 2026-06-11, Bernini-v2 2026-08-13. Training code 2026-07-13. ComfyUI repack `Comfy-Org/Bernini-R` created 2026-06-09. [Verified: repo README news, HF API]
- **Repos:** [github.com/bytedance/Bernini](https://github.com/bytedance/Bernini) (Apache-2.0, 1,340 stars), [ByteDance/Bernini-R](https://huggingface.co/ByteDance/Bernini-R), [Comfy-Org/Bernini-R](https://huggingface.co/Comfy-Org/Bernini-R). [Verified: GitHub API, HF API]
- **License:** Apache-2.0, not gated. [Verified: HF API `cardData.license`, `gated: false`]
- **Tasks:** t2v, v2v (edit or restyle a video), mv2v (edit that changes motion), rv2v (edit with reference images: garment swap, insertion), r2v, ads2v (insert a reference video). [Verified: README, `gradio_demo.py` `TASK_TYPE_CHOICES`]
- **Benchmarks (vendor):** Bernini-R 14B EditVerse 7.99, OpenVE 3.78, Bernini-v2v 3.25, Bernini-rv2v 3.34. Bernini-v2 7+14B: 8.02, 3.96, 3.49, 3.55. The authors' blind arena puts Bernini "in the first tier" of closed editors. [Verified: GitHub README table] It is not on the Artificial Analysis video-editing board. The only entry there with a Hugging Face weights link is MiniMax H3 (768p) at #4, Elo 1125; Wan 3.0 leads at 1200. [Verified: [AA board](https://artificialanalysis.ai/video/leaderboard/video-editing)]
- **ComfyField fix:** `tools.js` says vendor "Open source". The vendor is ByteDance. [Verified]

### Wan Animate 2

- **Authors:** Wan team (Alibaba; project page humanaigc.github.io): Guangyuan Wang, Li Hu, Dechao Meng, Zhongyi Zhang, Peng Zhang and others, sponsor Bang Zhang. Paper "Wan-Animate-2: Pushing the Application Boundaries of Character Animation", arXiv 2608.06009, 2026-08-06. [Verified: [HF card](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B), [arXiv](https://arxiv.org/abs/2608.06009)]
- **What it is:** end-to-end character animation. A reference image gives the identity, the raw driving video gives the motion (no pose or skeleton extraction), and the text prompt gives the background and camera. The output background does not come from the reference image or the driving video. [Verified: Comfy template note in `video_wan_animate2`, [Comfy docs](https://docs.comfy.org/tutorials/video/wan/wan-animate-2.md)]
- **Release:** 2026-08-07, base and distillation (10 steps, no CFG) weights. A "Lite" real-time variant is in the paper but not in the repo. [Verified: HF card release notes and file list]
- **Repos:** [Wan-AI/Wan2.2-Animate-2-14B](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B), [github.com/Wan-Video/Wan-Animate-2](https://github.com/Wan-Video/Wan-Animate-2), repack [Comfy-Org/Wan-Animate-2](https://huggingface.co/Comfy-Org/Wan-Animate-2). [Verified]
- **License:** Apache-2.0, not gated. [Verified: HF API]
- **Benchmarks:** none published. The abstract claims "superior motion fidelity and identity preservation" with no numbers or named baselines. [Verified: arXiv abstract]
- **No replace mode:** `WanAnimate2ToVideo` has no `background_video` or `character_mask` input, so it cannot replace a person inside the filmed scene. [Verified: `comfy_extras/nodes_wan.py` v0.41.1]

### Is each the best open choice today?

| Job | Verdict | Why | Better or alternative open options |
|---|---|---|---|
| Swap an element (person, setting, object) | **Bernini-R, keep** | Native core node, on Cloud, one model for v2v and rv2v edits, Apache-2.0, strongest published open edit scores I found [Verified: scores]; best practical pick [Inference] | **Bernini-v2** (full planner) scores higher (OpenVE 3.96 vs 3.78) but needs the community `rzgar/Bernini-v2-ComfyUI` node, not on Cloud [Verified: [HF](https://huggingface.co/rzgar/Bernini-v2-ComfyUI)]. **LTX-2.5 Edit Anything v2** IC-LoRA (Alissonerdx, Apache-2.0 tag, base LTX-2.5) does replace, remove, add and restyle, but the author calls it "far from production-ready" [Verified: [HF](https://huggingface.co/Alissonerdx/EditAnything)]. **MiniMax H3 Ref2VA** takes up to 3 reference videos but regenerates the shot and its license excludes the US, EU, UK and South Korea [Verified: [LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)]. |
| Motion transfer | **Wan Animate 2, keep** | Newest Wan character model, no pose preprocessing, native, on Cloud [Verified] | **SCAIL-2** (Z.ai, MIT, 2026-06-09, Wan2.1-14B, core nodes + SAM 3.1, on Cloud) also animates or replaces [Verified: HF API, template]. **Wan 2.2 Animate Move** (older, needs pose preprocessing). |
| Video face swap | **Change to Bernini-R + BFS head-swap LoRA** | Purpose-trained for head swap on Bernini-R, runs with core nodes only, and reuses the Bernini-R files the other formats load [Verified: LoRA files and cheat sheet in the BFS workflow]; quality vs Wan 2.2 Animate not measured [Inference] | **Wan 2.2 Animate Mix** replaces the whole character from the reference image, not only the face [Verified: [Comfy docs](https://docs.comfy.org/tutorials/video/wan/wan2-2-animate.md) "Mix: use the reference image to replace the character"]. Same BFS repo has **LTX-2.5** head-swap IC-LoRAs (v1.1, r64/r128) and an **MiniMax H3** one; Cloud has the **LTX-2.3** v3 head-swap LoRAs [Verified: HF API, Cloud listing]. **DreamID-V** (ByteDance/Tsinghua, Apache-2.0, Wan2.1-1.3B, 2026-01) is a dedicated face-swap model but needs a RunningHub custom node [Verified: [HF](https://huggingface.co/XuGuo699/DreamID-V)]. |
| Restyle a whole video | **Bernini-R, keep** | Comfy docs list v2v as "Video-to-video restyling"; the authors list style transfer as a "simple task" [Verified] | **ID-V2V** (Eyeline Labs, SIGGRAPH Asia 2026, Apache-2.0, Wan2.1-I2V-14B + VACE) restyles from a stylized keyframe and keeps the actors' identity; core support since ComfyUI v0.38.0, weights `Kijai/Wan_ID_V2V_comfy`, not on Cloud [Verified: [HF](https://huggingface.co/Eyeline-Labs/ID-V2V), PR #15139]. It keeps people realistic, so it fits "new setting and light" better than "anime" [Inference]. **H3 Fun ControlNet Union 2.0** restyles from pose/depth, H3 license limits apply. |
| Relight | **Bernini-R** | Comfy markets the Bernini-R template for relighting [Verified: template description] | **LTX-2.3 IC-LoRA Relight** (Lightricks, 2026-07-27, gated "auto", LTX-2 community license) [Verified: HF API]; ID-V2V relights the scene around the subject. |
| Color grade | **Bernini-R + KJNodes Color Match** | Color Match moves only the colors onto the original frames, so detail stays exact [Inference from the node code] | — |

A closed option now exists in Comfy: the partner node `HiggsfieldMotionTransferNode` ("Genjutsu 1.0", template `api_higgsfield_genjutsu_motion_transfer`, 2026-10-12, min ComfyUI 0.39.2). It takes a video of at least 4 s (first 30 s used), 1 to 8 references, 480p/720p/1080p, billed per output second. [Verified: template JSON and note]

## 2. API-format graphs

Common rules for all graphs [Verified unless marked]:

- Placeholders: `{{video}}` (LoadVideo `file`), `{{image}}` (LoadImage), `{{prompt}}`, `{{seed}}`, `{{width}}`, `{{height}}`, `{{frames}}`, and `{{duration}}` (seconds; `comfyVars` in `shared/mapping.js` already sets `duration`).
- Frame count: nodes 80 to 82 read the frame count of the trimmed clip and compute `min(4*floor((a-1)/4)+1, {{frames}})`, so `length` is always a legal 4n+1 count and never longer than the clip. This follows the Bernini-R template, which reads the length from the trimmed clip (#109 Video Slice, #111 GetImageSize). [Verified: template] Set `{{frames}}` per workflow as a cap (81 for Bernini and Wan Animate 2, 73 for the head swap). [Inference]
- `{{width}}` and `{{height}}` must follow the source clip's aspect ratio in multiples of 16 (for example 848x480 or 480x848). The source is resized to this size with a center crop. [Verified: `BerniniConditioning` code] The formats use `aspect: 'auto'`, so ComfyField must read the clip size first. [Inference]
- Audio and fps come from the trimmed clip. `SaveVideo` uses the same `format`/`codec`/`format.codec` keys as the existing `public/workflows/ltx25_i2v.json`.
- Bernini prompts start with the Bernini task prefix, joined with no space, as upstream does (`prompt = system_prompt + _prompt_clean(prompt)` in `bernini/pipeline.py`). [Verified]

### swap-element: `bernini_swap.json` and `bernini_swap_noref.json`

- **Template:** `video_bernini_r_video_editing` (Comfy-Org/workflow_templates, 2026-06-14), subgraph "Video Edit (Bernini-R)". [Verified]
- **Nodes:** LoadVideo → Video Slice → GetVideoComponents; CLIPLoader (umt5, `wan`); VAELoader (Wan2_1_VAE_bf16); UNETLoader high and low (fp8_scaled); LoraLoaderModelOnly LightX2V T2V at **3.0** (high) and **1.5** (low); CLIPTextEncode positive and negative; LoadImage `{{image}}` (with-reference graph only) → `BerniniConditioning.reference_images.reference_image_0`; KSamplerSelect `res_multistep`; BasicScheduler `simple`, 6 steps; SplitSigmas at 3; SamplerCustom high (add noise, `{{seed}}`, CFG 1) → SamplerCustom low (no noise, CFG 1); VAEDecode → CreateVideo → SaveVideo. These are the template's "Turbo" values. [Verified: template widgets]
- **Prefix:** with reference `You are a helpful assistant specialized in video editing with reference.` (rv2v); without `You are a helpful assistant specialized in video editing.` (v2v). [Verified: `SYSTEM_PROMPTS` in `bernini/prompt_enhancer.py`]
- **Quality mode (template "Turbo OFF"):** remove both LightX2V LoRAs, 40 steps, split 20, CFG 5. The official recipe also uses APG guidance, which the template does not copy. [Verified: template note] Upstream default `flow_shift` is 5.0; the template adds no shift node, so ComfyUI uses the Wan T2V default of 8.0. [Verified: `gradio_demo.py`, `supported_models.py`] [Inference: shift 5 may match upstream better; untested]
- **Prompt:** the `edit.js` prompt ("Replace {change} with {into}... leave everything else untouched") matches the authors' advice "what to change + what stays unchanged". [Verified: template note]

### motion-transfer: `wan_animate2.json`

- **Template:** `video_wan_animate2_distilled` (2026-08-07), subgraph "Motion Transfer (Wan Animate 2 Distilled)", one segment only (the template's StartLoop/EndLoop extension is left out). [Verified]
- **Nodes:** UNETLoader `wan_animate_2_distill_int8_convrot`; CLIPLoader umt5; CLIPVisionLoader `clip_vision_h`; VAELoader; ImageScale on the driving frames and on the reference to `{{width}}`x`{{height}}`; CLIPVisionEncode of the reference and of the first driving frame (`clip_vision_output_pose`); three CLIPTextEncode (main `{{prompt}}`, pose prompt, negative); `WanAnimate2ToVideo`; `WanAnimate2Cache` (`cpu`, `int8`); ModelSamplingSD3 shift 5; KSamplerSelect `lcm`; BasicScheduler `simple` 10 steps; SamplerCustom CFG 1; TrimVideoLatent (`trim_latent` output); VAEDecode → CreateVideo → SaveVideo. [Verified: template widgets]
- **Deviations:** cache on `cpu` instead of the template's `gpu`, because the Comfy note says "Set WanAnimate2Cache device to cpu to avoid VRAM spikes". The pose prompt is a fixed generic line. [Inference: a per-clip motion description, as the template does, may be better]
- **Base model option:** `wan_animate_2_int8_convrot` + LoRA `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16` at 1.0, 6 steps. [Verified: template `video_wan_animate2`]
- **Prompt fix needed:** the main prompt must describe looks and background only, for example `Character appearance description: ... Background description: ...`, with no motion words. [Verified: template note "describe the LOOKS only, no motion words"] The current `edit.js` prompt ("performs the exact movements...") is a motion prompt. Put `{note}` into the background part.
- **Longer clips:** chain segments with `continue_motion` and `video_frame_offset`, or use the core loop nodes (ComfyUI 0.36.0+). Each extra segment adds `fragment_length - 1` frames. [Verified: Comfy docs]

### face-swap-video, recommended: `bernini_headswap.json`

- **Base:** the Bernini-R template graph, plus the BFS workflow `workflows/workflow_wan22_bernini_head_swap_drag_and_drop_v1.0.json` from `Alissonerdx/BFS-Best-Face-Swap-Video`. [Verified]
- **Nodes:** as the swap graph, without LightX2V, plus LoraLoaderModelOnly `headswap_bernini_r64_73f640_step3000_high_noise` on the high expert and `..._low_noise` on the low expert at **1.0**; prompt `head_swap:\n{{prompt}}`; KSamplerSelect `er_sde` (as BFS); 40 steps split 20; **CFG 4**; `ref_max_size` 512.
- **Two BerniniConditioning nodes:** #13 gets source + head image and feeds the positive; #14 gets the source only and feeds the negative. This copies the BFS node's `amplify_reference=True` mode (positive context = guide + head, negative = guide only, so CFG amplifies the identity). [Verified: `headswap_node.py` in [ComfyUI-BFSNodes](https://github.com/alisson-anjos/ComfyUI-BFSNodes) and core `nodes_bernini.py` use the same stream order: source = stream 1, first reference = stream 2] [Inference: the core pair gives the same result as the BFS node when the guide is already at `{{width}}`x`{{height}}`]
- **LoRA cheat sheet (author):** base must be Bernini-R, not plain Wan 2.2; strength 0.7 to 1.0; trained at **73 frames and 640 px long edge**, consistency breaks far above that; crop the reference to head and shoulders; trigger `head_swap:` alone works, optional `FACE:` / `ACTION:` template; with amplified reference use CFG 3 to 5 and no LightX2V. [Verified: MarkdownNote #151 in the BFS workflow]
- **Not on Cloud:** the BFS conditioning node is not in Cloud's BFSNodes pack (only "Reserved Region Frame Composer" is listed), which is why this graph uses core nodes. [Verified: [supported nodes](https://comfy.org/cloud/supported-nodes.md)]

### face-swap-video, as planned: `wan22_animate_face_swap.json`

- **Templates:** `video_wan2_2_14B_animate` (official "Mix" mode) and `template_purz_wan22_animate_auto_character_replace` (automatic, no Points Editor). [Verified]
- **Nodes:** UNETLoader `Wan2_2-Animate-14B_fp8_e4m3fn_scaled_KJ` → LightX2V I2V LoRA 1.0 → `WanAnimate_relight_lora_fp16` 1.0 → ModelSamplingSD3 shift 8; CLIPVisionEncode of the reference; DWPreprocessor (body + hands) for `pose_video`, as the official template #101; `OnnxDetectionModelLoader` (`vitpose-l-wholebody.onnx`, `yolov10m.onnx`) → `PoseAndFaceDetection` output 1 (512x512 face crops) for `face_video`, as the Purz template; core SAM 3.1 (`CheckpointLoaderSimple` → `SAM3_VideoTrack` with text "face" → `SAM3_TrackToMask`) → GrowMask 10 → KJ BlockifyMask 32 → KJ DrawMaskOnImage black for `background_video` and `character_mask`; `WanAnimateToVideo` (length from node 82); KSampler 6 steps, CFG 1, `euler`, `simple`; TrimVideoLatent; ImageFromBatch from `trim_image`; CreateVideo → SaveVideo. [Verified: node inputs from the v0.41.1, KJNodes, controlnet_aux and WanAnimatePreprocess sources]
- **Deviations:** the official template uses an interactive Points Editor + SAM2 for the mask; I use a text-prompted core SAM 3.1 track so the graph runs from the API. [Verified: SAM3 nodes are core in v0.41.1] The mask text "face" keeps hair and body as filmed; "person" swaps the whole person. A face-only mask is outside what Wan-Animate was trained on. [Inference: test before shipping]

### restyle-video: `bernini_restyle.json`

- Same graph as `bernini_swap_noref.json`, v2v prefix, Turbo values. [Verified: template]
- Negative prompt drops the Wan words for "vivid colors, overexposed, style, artwork, painting, picture, static, greyish", which fight a look change. At CFG 1 the negative is not used, so this matters only in quality mode (CFG 5). [Inference]
- `mv2v` prefix (`...You might need to adjust the video's style, lighting, colors, textures, and the subject's pose or action.`) is the template's "Video Editing (Style / Motion)" choice. The authors use mv2v for edits that change motion, so v2v is the safer default when motion must stay. [Verified: README] [Inference: A/B test both]

### video-relight: `bernini_relight.json`

- Same as restyle, prefix v2v. Bernini docs also list relighting under rv2v with a light reference image; the format has no reference input. [Verified: Comfy docs task table]

### color-grade: `bernini_grade.json`

- Restyle graph plus ImageFromBatch (original frames, same length) and KJNodes `ColorMatch` (`image_ref` = Bernini output, `image_target` = original frames, `mkl`, strength 1). CreateVideo takes the Color Match output. [Verified: ColorMatch inputs in KJNodes `nodes/image_nodes.py`]
- Color Match runs per frame and needs the same frame count in both inputs, which node 82 ensures. The reference can be smaller than the target. [Verified: code loops `images_ref[i]`] [Inference: sizes may differ for `mkl`]
- Original frames stay at source size, so a 4K clip uses a lot of RAM (about 12 GB for 121 float32 4K frames). Scale them to 1080p first if needed. [Inference]

## 3. Files and LoRAs

Sizes are bytes from the Hugging Face API (`?blobs=true`), GB = bytes / 1e9. sha256 = HF LFS sha256. All repos below are not gated. [Verified: HF API, 2026-10-18]

### Shared Bernini-R files (swap, restyle, relight, grade, head swap)

| File | Folder | Source (repo / path) | Size | sha256 | License | Strength |
|---|---|---|---|---|---|---|
| `wan2.2_bernini_r_high_noise_fp8_scaled.safetensors` | diffusion_models | Comfy-Org/Bernini-R / `diffusion_models/` | 15,574,833,216 (15.57 GB) | `9ff3d7369da98f8eaf71045f7d0e99d5e344eea5e7dc934a930608786fe73f52` | Apache-2.0 | — |
| `wan2.2_bernini_r_low_noise_fp8_scaled.safetensors` | diffusion_models | Comfy-Org/Bernini-R / `diffusion_models/` | 15,574,833,216 (15.57 GB) | `ce35c070f345c91abe43d6bf29b0eccb8687e4026fadc0e0a70a73c9afb7bbb3` | Apache-2.0 | — |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | text_encoders | Comfy-Org/Wan_2.1_ComfyUI_repackaged / `split_files/text_encoders/` (same bytes in Comfy-Org/Wan-Animate-2 `text_encoders/`) | 6,735,906,897 (6.74 GB) | `c3355d30191f1f066b26d93fba017ae9809dce6c627dda5f6a66eaa651204f68` | Apache-2.0 | — |
| `Wan2_1_VAE_bf16.safetensors` | vae | Comfy-Org/Wan-Animate-2 / `vae/` (same bytes in Kijai/WanVideo_comfy root) | 253,806,278 (0.25 GB) | `1ab9a32cc2c740f6e39d80d367ce5dcc28db8c71b79b28670546b8973e9d75f9` | Apache-2.0 (Comfy-Org copy) | — |
| `lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors` | loras | Kijai/WanVideo_comfy / `Lightx2v/` | 630,697,104 (0.63 GB) | `37d49218544b9e0bfb8e831d1399f451fbc5068aff6474f42a90c928363c3573` | No license tag on Kijai's repo; the original lightx2v repo is Apache-2.0 | 3.0 high, 1.5 low (Turbo); no trigger |

Optional: `wan2.2_bernini_r_{high,low}_noise_int8_convrot.safetensors` (14,535,868,680 bytes each, sha256 `9d9a84f6e70032bd8f1dab40f5b0270fefd259ac5111a52b4acb752773c119b3` / `98fe00c6e38a745929cd7770a84ae3814c834d2ed7bef6b8a0a526c896fe8e5c`), also on Cloud. [Verified] Comfy says int8 convrot gives "higher quality than fp8 while running faster" for SCAIL-2. [Verified: template text] [Inference: likely true for Bernini-R too]

Optional community turbo: `rzgar/Bernini-R-LightX2V-4step-loras` (`Bernini-R_LightX2V_{high,low}_noise.safetensors`, 1,244,141,856 bytes each, sha256 `9a7e8d5f9b42b91a069ad98a8d114f66ce11ccf6b21ec5d86e0caf49aef67945` / `86910e35a56af3b782ab8b7f857953c3dfce681ff89386c0a7b6ce764f8b527b`, Apache-2.0, strength 1.0, 4 steps, `dpmpp_2m_sde` + `sgm_uniform`). The author says it fixes blurry fingers and glitchy fast motion of the template's Wan 2.1 LoRA. Not on Cloud. [Verified: HF card] [Inference: unbenchmarked]

### Head swap (face-swap-video, recommended)

| File | Folder | Source | Size | sha256 | License | Trigger | Strength |
|---|---|---|---|---|---|---|---|
| `headswap_bernini_r64_73f640_step3000_high_noise.safetensors` | loras | Alissonerdx/BFS-Best-Face-Swap-Video / `wan22/` | 613,551,752 (0.61 GB) | `d7e541b7913c31625fb9808ae7d58803b10ec3dd512ba64cfde987c62ad74f50` | Repo tag: "other", `ltx-2-community-license-agreement` (set for the whole repo) | `head_swap:` | 0.7 to 1.0 |
| `headswap_bernini_r64_73f640_step3000_low_noise.safetensors` | loras | same / `wan22/` | 613,551,752 (0.61 GB) | `b2d142a3bd97331f73bc06a95f0a1ed0b9d83461d0191c95d5c931edd5665b90` | same | `head_swap:` | 0.7 to 1.0 |

[Verified: HF API, BFS workflow note] The repo license tag names the LTX-2 license even for this Wan/Bernini file. [Inference: ask the author before commercial use; license review is deferred per project memory]

### Wan Animate 2 (motion-transfer)

| File | Folder | Source | Size | sha256 | License | Strength |
|---|---|---|---|---|---|---|
| `wan_animate_2_distill_int8_convrot.safetensors` | diffusion_models | Comfy-Org/Wan-Animate-2 / `diffusion_models/` | 16,653,175,528 (16.65 GB) | `d2e566ecac3f164cb1a6b63dc7d868d6678c9affa49fbceb3abe4f9458f89c8a` | Apache-2.0 | — |
| `wan_animate_2_int8_convrot.safetensors` (base option) | diffusion_models | same | 16,653,175,528 (16.65 GB) | `0580ecdd65e47e97c30df9670d13a6c4a131d26de5a1faf2ccc78392d5167584` | Apache-2.0 | — |
| `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors` (base option only) | loras | Comfy-Org/Wan-Animate-2 / `loras/` (same bytes in Kijai/WanVideo_comfy `Lightx2v/`) | 738,005,744 (0.74 GB) | `85c4a61c30e0497aa44b91d93a893b624708461a56fe5485183b28fa07e2dfb3` | Apache-2.0 | 1.0, no trigger |
| `clip_vision_h.safetensors` | clip_vision | Comfy-Org/Wan-Animate-2 / `clip_vision/` | 1,264,219,396 (1.26 GB) | `64a7ef761bfccbadbaa3da77366aac4185a6c58fa5de5f589b42a65bcc21f161` | Apache-2.0 | — |
| umt5 and Wan2_1_VAE_bf16 | | as above | | | | |

No LoRA is needed with the distilled model. [Verified: template]

### Wan 2.2 Animate Mix (face-swap-video fallback)

| File | Folder | Source | Size | sha256 | License |
|---|---|---|---|---|---|
| `Wan2_2-Animate-14B_fp8_e4m3fn_scaled_KJ.safetensors` | diffusion_models | Kijai/WanVideo_comfy_fp8_scaled / `Wan22Animate/` | 18,401,760,586 (18.40 GB) | `2936b31473a967e7a429a6646bba60e7862d0938e178b58b2a140f391dd5b8e6` | Apache-2.0 |
| `WanAnimate_relight_lora_fp16.safetensors` (strength 1.0) | loras | Kijai/WanVideo_comfy / `LoRAs/Wan22_relight/` | 1,436,672,440 (1.44 GB) | `fc646c74c73f4b251f5fd9bc440ef21b03b27305f499966c68b2b3aa31498561` | no tag (Kijai) |
| `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors` (1.0) | loras | as above | | | |
| `wan_2.1_vae.safetensors` | vae | Comfy-Org/Wan_2.1_ComfyUI_repackaged / `split_files/vae/` | 253,815,318 (0.25 GB) | `2fc39d31359a4b0a64f55876d8ff7fa8d780956ae2cb13463b0223e15148976b` | Apache-2.0 |
| `vitpose-l-wholebody.onnx` | detection | JunkyByte/easy_ViTPose / `onnx/wholebody/` | 1,234,579,166 (1.23 GB) | `89bdf6692d9224dbd5004dcef23a9ba2d54c5776212b359d5a5b5068ac14fd08` | no tag |
| `yolov10m.onnx` | detection | Wan-AI/Wan2.2-Animate-14B / `process_checkpoint/det/` | 61,659,339 (0.06 GB) | `89b526498a6d55f869a6ab52e3a2eb20ad45b3711c1f7de3dd9ca0b399dfd6d7` | Apache-2.0 (repo tag) |
| `sam3.1_multiplex_fp16.safetensors` | checkpoints | Comfy-Org/sam3.1 / `checkpoints/` | 1,745,546,848 (1.75 GB) | `9ba99c92703c2e8b4f47de2d34a539bb8e18923049e238b780d70dbe6368eb03` | "other" (SAM license) |
| `yolox_l.onnx`, `dw-ll_ucoco_384_bs5.torchscript.pt` | controlnet_aux auto-download (`yzd-v/DWPose`, `hr16/DWPose-TorchScript-BatchSize5`) | 216,746,733 / 135,059,124 | `7860ae79de6c89a3c1eb72ae9a2756c0ccfbe04b7791bb5880afabd97855a411` / `d86a0b2b59fddc0901a7076e9f59c9f8602602133ed72511c693fd11eea23d91` | Apache-2.0 |

Comfy-Org alternatives also on Cloud: `wan2.2_animate_14B_int8_convrot.safetensors` (Comfy-Org/Wan_2.2_ComfyUI_Repackaged `split_files/diffusion_models/`, 18,413,068,672, `419aa0b3d9079a8a39126f2894c3cb2427c288189d2dc8342c61cf0663731cb3`) and `wan2.2_animate_14B_relight_lora_bf16.safetensors` (`split_files/loras/`, 1,436,673,432, `5f4b6b9d3bc745a86e7bfd511f3880d90cf59c3bded9584d92c028f583fa74a3`), both Apache-2.0. [Verified]

### Restyle presets: LoRA per style

**Bernini-R restyles from the prompt alone. No LoRA is needed, and no public Bernini-R LoRA exists for any of the 16 presets.** [Verified: Comfy docs "v2v: Video-to-video restyling"; authors: the 1.3B model is "close to the 14B variant on simple tasks such as style transfer"; HF search "Bernini" and Civitai search "bernini" return no style LoRA for these looks. The only Bernini style LoRA found is the reverse direction, Civitai model 2788237 "bernini_r_real_life_style_transfer" (anime to real, trigger `Real life style transfer.`, versions 3141778 high / 3141792 low, 599,138 KB each, SHA256 `047080AB2333FD69A0188BDB8FB7D8F24F23BD37FC0D62D95DF8FFE082790ED0` / `45D87CB48ECAFD2B72143D418127ABC42316CB92604F50F262ACDFDB2AAE93E9`)]

| Preset | LoRA for Bernini-R | Note |
|---|---|---|
| anime, claymation, watercolor, comic, 3d, oil, pixel, sketch, paper, bricks, cartoon, woodblock, low-poly, neon, noir, pop-art | none: prompt only (the `text` of each option in `edit.js`) | [Verified: no LoRA exists] |

Possible boosters, all **[Inference: untested with Bernini-R's in-context streams; they may reduce edit fidelity]**. Bernini-R is a Wan2.2-T2V-A14B fine-tune, so Wan 2.2 T2V A14B LoRAs load on it, and Wan 2.1 T2V 14B LoRAs usually load on the low-noise expert. Public examples from Civitai (data from the Civitai API): "Dark Ghibli Fairytales" (model 1349631, v2324878, Wan 2.2 T2V, `DarkGhibliWan2.2Low_low_noise.safetensors`, trigger `Studio Ghibli Dark Fairytale`); "Hyperdetailed Colored Pencil" (1155749, v2328497, Wan 2.2 T2V, trigger `ArsMJStyle, Colored pencil hyperdetailed realism,`); "UniPixel - Style" (2091170, v2366093, Wan 2.2 T2V, trigger `nv-p1xel4rt`); "[WAN2.1] Realistic Oil Paintings" (1767231, v1999987, trigger `oil painting in op artstyle`); "Low Poly Papercraft" (1342716, v2116323, Wan 2.1); "ComicBook-Wan2.2/2.1" (1776896, v2086190, zip). None found for watercolor, toy bricks, rubber hose, woodblock, noir or pop art on Wan. Most allow image use and renting, not selling the model. [Verified: Civitai API `allowCommercialUse`] I do not recommend them for launch. [Inference]

A LoRA-per-style path does exist on Comfy Cloud for **LTX-2.3** (not Bernini, not LTX-2.5): `LTX_2.3_Clay_Mation_Style.safetensors`, `LTX_2.3_Paper_Cut_Out_Style.safetensors`, `LTX_2.3_Pixar_Toon_Style.safetensors`, `LTX_2.3_Fantasy_Anime_Style.safetensors`, `LTX_2.3_90s_Animation_Style.safetensors`, `LTX_2.3_Cinematic_Sci-fi-Cyberpunk_Style.safetensors`, `LTX_2.3_Fantasy_Painterly_Style.safetensors` (vrgamedevgirl84 on HF, 352,679,880 bytes each, e.g. Claymation sha256 `e1098c8b7e6f8bc6a183ce21f5aa9b7f528e3de1c9294eecc4d82d0c3dc3f923`, no license tag). They are text-to-video style LoRAs; video restyle would need them plus the LTX-2.3 Union Control IC-LoRA (depth or canny). [Verified: Cloud listing, HF API] [Inference: no official template for that combination]

### Ready entries for `shared/modelFiles.js`

`vramGb` values are my estimate (section 5). [Inference]

```js
'wan2.2_bernini_r_high_noise_fp8_scaled.safetensors': { repo: 'Comfy-Org/Bernini-R', path: 'diffusion_models/wan2.2_bernini_r_high_noise_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 15.57, vramGb: 24, cloud: true, sha256: '9ff3d7369da98f8eaf71045f7d0e99d5e344eea5e7dc934a930608786fe73f52' },
'wan2.2_bernini_r_low_noise_fp8_scaled.safetensors': { repo: 'Comfy-Org/Bernini-R', path: 'diffusion_models/wan2.2_bernini_r_low_noise_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 15.57, vramGb: 24, cloud: true, sha256: 'ce35c070f345c91abe43d6bf29b0eccb8687e4026fadc0e0a70a73c9afb7bbb3' },
'umt5_xxl_fp8_e4m3fn_scaled.safetensors': { repo: 'Comfy-Org/Wan_2.1_ComfyUI_repackaged', path: 'split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors', dir: 'text_encoders', gb: 6.74, vramGb: 0, cloud: true, sha256: 'c3355d30191f1f066b26d93fba017ae9809dce6c627dda5f6a66eaa651204f68' },
'Wan2_1_VAE_bf16.safetensors': { repo: 'Comfy-Org/Wan-Animate-2', path: 'vae/Wan2_1_VAE_bf16.safetensors', dir: 'vae', gb: 0.25, vramGb: 0, cloud: true, sha256: '1ab9a32cc2c740f6e39d80d367ce5dcc28db8c71b79b28670546b8973e9d75f9' },
'wan_2.1_vae.safetensors': { repo: 'Comfy-Org/Wan_2.1_ComfyUI_repackaged', path: 'split_files/vae/wan_2.1_vae.safetensors', dir: 'vae', gb: 0.25, vramGb: 0, cloud: true, sha256: '2fc39d31359a4b0a64f55876d8ff7fa8d780956ae2cb13463b0223e15148976b' },
'lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors': { repo: 'Kijai/WanVideo_comfy', path: 'Lightx2v/lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors', dir: 'loras', gb: 0.63, vramGb: 0, cloud: true, sha256: '37d49218544b9e0bfb8e831d1399f451fbc5068aff6474f42a90c928363c3573' },
'lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors': { repo: 'Comfy-Org/Wan-Animate-2', path: 'loras/lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors', dir: 'loras', gb: 0.74, vramGb: 0, cloud: true, sha256: '85c4a61c30e0497aa44b91d93a893b624708461a56fe5485183b28fa07e2dfb3' },
'headswap_bernini_r64_73f640_step3000_high_noise.safetensors': { repo: 'Alissonerdx/BFS-Best-Face-Swap-Video', path: 'wan22/headswap_bernini_r64_73f640_step3000_high_noise.safetensors', dir: 'loras', gb: 0.61, vramGb: 0, cloud: false, sha256: 'd7e541b7913c31625fb9808ae7d58803b10ec3dd512ba64cfde987c62ad74f50' },
'headswap_bernini_r64_73f640_step3000_low_noise.safetensors': { repo: 'Alissonerdx/BFS-Best-Face-Swap-Video', path: 'wan22/headswap_bernini_r64_73f640_step3000_low_noise.safetensors', dir: 'loras', gb: 0.61, vramGb: 0, cloud: false, sha256: 'b2d142a3bd97331f73bc06a95f0a1ed0b9d83461d0191c95d5c931edd5665b90' },
'wan_animate_2_distill_int8_convrot.safetensors': { repo: 'Comfy-Org/Wan-Animate-2', path: 'diffusion_models/wan_animate_2_distill_int8_convrot.safetensors', dir: 'diffusion_models', gb: 16.65, vramGb: 24, cloud: true, sha256: 'd2e566ecac3f164cb1a6b63dc7d868d6678c9affa49fbceb3abe4f9458f89c8a' },
'clip_vision_h.safetensors': { repo: 'Comfy-Org/Wan-Animate-2', path: 'clip_vision/clip_vision_h.safetensors', dir: 'clip_vision', gb: 1.26, vramGb: 0, cloud: true, sha256: '64a7ef761bfccbadbaa3da77366aac4185a6c58fa5de5f589b42a65bcc21f161' },
'Wan2_2-Animate-14B_fp8_e4m3fn_scaled_KJ.safetensors': { repo: 'Kijai/WanVideo_comfy_fp8_scaled', path: 'Wan22Animate/Wan2_2-Animate-14B_fp8_e4m3fn_scaled_KJ.safetensors', dir: 'diffusion_models', gb: 18.40, vramGb: 24, cloud: true, sha256: '2936b31473a967e7a429a6646bba60e7862d0938e178b58b2a140f391dd5b8e6' },
'WanAnimate_relight_lora_fp16.safetensors': { repo: 'Kijai/WanVideo_comfy', path: 'LoRAs/Wan22_relight/WanAnimate_relight_lora_fp16.safetensors', dir: 'loras', gb: 1.44, vramGb: 0, cloud: true, sha256: 'fc646c74c73f4b251f5fd9bc440ef21b03b27305f499966c68b2b3aa31498561' },
'sam3.1_multiplex_fp16.safetensors': { repo: 'Comfy-Org/sam3.1', path: 'checkpoints/sam3.1_multiplex_fp16.safetensors', dir: 'checkpoints', gb: 1.75, vramGb: 0, cloud: true, sha256: '9ba99c92703c2e8b4f47de2d34a539bb8e18923049e238b780d70dbe6368eb03' },
'vitpose-l-wholebody.onnx': { repo: 'JunkyByte/easy_ViTPose', path: 'onnx/wholebody/vitpose-l-wholebody.onnx', dir: 'detection', gb: 1.23, vramGb: 0, cloud: true, sha256: '89bdf6692d9224dbd5004dcef23a9ba2d54c5776212b359d5a5b5068ac14fd08' },
'yolov10m.onnx': { repo: 'Wan-AI/Wan2.2-Animate-14B', path: 'process_checkpoint/det/yolov10m.onnx', dir: 'detection', gb: 0.06, vramGb: 0, cloud: true, sha256: '89b526498a6d55f869a6ab52e3a2eb20ad45b3711c1f7de3dd9ca0b399dfd6d7' },
```

## 4. Comfy Cloud availability

Cloud runs **ComfyUI v0.41.1** (`cloud_version` v0.480.0, templates 0.7.64), the same version as the Pod, so every core node in v0.41.1 is on Cloud. [Verified: public `https://cloud.comfy.org/api/system_stats`]

**Files** (exact names in `https://cloud.comfy.org/api/experiment/models/<folder>`) [Verified]:

| File | Folder | On Cloud |
|---|---|---|
| `wan2.2_bernini_r_high_noise_fp8_scaled.safetensors`, `..._low_noise_fp8_scaled.safetensors` (also fp16, int8_convrot, mxfp8, and `wan2.1_bernini_1.3B_fp16`) | diffusion_models | yes |
| `wan_animate_2_distill_int8_convrot.safetensors`, `wan_animate_2_int8_convrot.safetensors` (also bf16) | diffusion_models | yes |
| `Wan2_2-Animate-14B_fp8_e4m3fn_scaled_KJ.safetensors`, `wan2.2_animate_14B_int8_convrot.safetensors` | diffusion_models | yes |
| `lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors`, `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors`, `WanAnimate_relight_lora_fp16.safetensors` | loras | yes |
| `headswap_bernini_r64_73f640_step3000_high_noise.safetensors`, `..._low_noise.safetensors` | loras | **no** |
| `Bernini-R_LightX2V_high_noise.safetensors` (rzgar) | loras | **no** |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | text_encoders | yes |
| `Wan2_1_VAE_bf16.safetensors`, `wan_2.1_vae.safetensors` | vae | yes |
| `clip_vision_h.safetensors` | clip_vision | yes |
| `vitpose-l-wholebody.onnx`, `yolov10m.onnx` | detection | yes |
| `sam3.1_multiplex_fp16.safetensors` | checkpoints | yes |
| `ltx23-head_swap_v3_rank_64.safetensors` (BFS, LTX-2.3) | loras | yes (alternative) |

**Nodes:**

- Core (in v0.41.1, so on Cloud): `BerniniConditioning`, `WanAnimate2ToVideo`, `WanAnimate2Cache`, `WanAnimateToVideo`, `TrimVideoLatent`, `SAM3_VideoTrack`, `SAM3_TrackToMask`, `GrowMask`, `LoadVideo`, `Video Slice`, `GetVideoComponents`, `CreateVideo`, `SaveVideo`, `SamplerCustom`, `SplitSigmas`, `BasicScheduler`, `KSamplerSelect`, `ModelSamplingSD3`, `ImageFromBatch`, `GetImageSize`, `PrimitiveInt`, `ComfyMathExpression`, `ImageScale`, loaders, `CLIPVisionEncode`, `KSampler`. [Verified: v0.41.1 source]
- Custom packs on Cloud: KJNodes (`Color Match`, `Blockify Mask`, `Draw Mask On Image` listed), comfyui_controlnet_aux (`DWPose Estimator` = `DWPreprocessor`), ComfyUI-WanAnimatePreprocess (`ONNX Detection Model Loader`, `Pose and Face Detection` listed; **`Draw ViT Pose` not listed**, so I did not use it), ComfyUI-segment-anything-2. [Verified: [supported-nodes.md](https://comfy.org/cloud/supported-nodes.md)]
- Not on Cloud: `BFSHeadSwapBerniniConditioning` (BFSNodes on Cloud has 1 node only), the community Bernini-v2 node, ID-V2V weights. [Verified]

## 5. VRAM, ComfyUI version, input limits

| Workflow | GPU memory | First ComfyUI release with the nodes | Input limits |
|---|---|---|---|
| Bernini-R (swap, restyle, relight, grade, head swap) | Two 15.57 GB fp8 experts; ComfyUI holds one at a time. A third-party Bernini-R node measured **~18.8 GB peak** for fp8 + offload at 480p, 81 frames, on an A10 24 GB [Verified: [neuregex/ComfyUI-BerniniR README](https://github.com/neuregex/ComfyUI-BerniniR), third party, different code]. Plan **24 GB** for 480p, **48 GB+** for 720p/121 frames, and **64 GB+ system RAM** for offload [Inference] | `BerniniConditioning`: **v0.25.0** (2026-06-16) [Verified: GitHub compare, commit f8e51b67 of 2026-06-09] | Width and height multiples of 16; default 848x480 (`max_image_size` 848), 81 frames at 16 fps; the authors show 1280 long edge, 121 frames, 24 fps for insertion; length 4n+1; up to 8 reference slots, about 5 reliable; references long edge ≤ `ref_max_size` (848) [Verified: README, template note, node code] |
| Head swap LoRA | as Bernini-R; shorter clip at 640 px uses less [Inference] | v0.25.0 | Trained at 73 frames, 640 px long edge; head-and-shoulders crop [Verified: BFS note] |
| Wan Animate 2 | 16.65 GB int8 weights; a third-party guide labels the int8 path "24 GB" [Verified: [localaimaster guide](https://localaimaster.com/blog/wan-animate-2-local-guide), third party]. `WanAnimate2Cache` needs about **12.5 GB system RAM** at 480x832, 81 frames in bf16; int8 halves it [Verified: node tooltip] | `WanAnimate2ToVideo`: **v0.31.0** (2026-08-08) [Verified: compare, commit a464ac33]; loop extension needs **v0.36.0+** [Verified: Comfy docs] | 81-frame segments (~3.4 s at 24 fps); frames are taken 1:1 from the driving video, so resample to 16 to 24 fps; keep the reference framing like the driving video (full body to full body) [Verified: template note]. Repo defaults target 720p on 8x A800, 480p tested on 2x A800 [Verified: HF card] |
| Wan 2.2 Animate Mix | 18.40 GB fp8 + SAM 3.1 1.75 GB + ONNX pose models; plan **24 GB+** [Inference] | `WanAnimateToVideo` replace inputs since 2025-09; SAM3 nodes core in v0.41.1 [Verified] | 77-frame segments by default; width and height multiples of 16 [Verified: Comfy docs] |

The Pod's v0.41.1 meets every version above. [Verified]

## 6. Blockers for ComfyField

1. **No video upload.** `runComfy` uploads only `LoadImage` nodes whose input is `{{image}}`. Every graph here needs `{{video}}` on a `LoadVideo` node, so the engine must upload the clip (Comfy SDK `assets.fromBytes` on Cloud and Pod, `/upload/image` on local ComfyUI). [Verified: `server/core.js`] [Inference: the local endpoint accepts video files]
2. **Missing loaders in `shared/modelFiles.js`.** `LOADERS` has no `CLIPVisionLoader` (`clip_name` → `clip_vision`) and no `OnnxDetectionModelLoader` (`vitpose_model`, `yolo_model` → `detection`), so a Pod would not download `clip_vision_h` or the ONNX files. [Verified: code]
3. **Source size.** The formats use `aspect: 'auto'`, but `comfyVars` sizes come from a fixed aspect table. The engine must read the clip's size and pass `{{width}}`/`{{height}}` in multiples of 16. [Verified: `shared/mapping.js`] [Inference: fix]
4. **Frame cap per model.** `comfyVars` sets `frames = duration * 24 + 1` (121 for 5 s). Pass 81 for Bernini and Wan Animate 2 and 73 for the head swap; the graphs cap to that and to the clip length. [Verified: code] [Inference: values]
5. **Motion-transfer prompt.** Change it to describe only the character and the background. [Verified: template note]
6. **Head-swap LoRA is not on Cloud.** Run on the Pod, or import it into Cloud (Cloud model import, plan-dependent). [Verified: Cloud listing] [Inference: import is allowed on paid plans, not checked today]
7. **Custom nodes on the Pod.** `bernini_grade` needs KJNodes; `wan22_animate_face_swap` needs KJNodes, comfyui_controlnet_aux and ComfyUI-WanAnimatePreprocess. The other graphs are core-only. [Verified: graphs]
8. **H3 alternatives** carry the MiniMax territory exclusion (US, EU, UK, South Korea). [Verified: LICENSE]
9. **Not tested.** No graph has been queued. Expect small fixes (for example the `SaveVideo` codec keys, which copy the existing LTX graph). [Inference]

## Sources

- Bernini: [HF ByteDance/Bernini-R](https://huggingface.co/ByteDance/Bernini-R), [GitHub bytedance/Bernini](https://github.com/bytedance/Bernini) (README, `docs/bernini_r.md`, `gradio_demo.py`, `bernini/prompt_enhancer.py`, `bernini/pipeline.py`, test cases), [HF Comfy-Org/Bernini-R](https://huggingface.co/Comfy-Org/Bernini-R), [HF Bernini-Diffusers-v2](https://huggingface.co/ByteDance/Bernini-Diffusers-v2), [arXiv 2605.22344](https://arxiv.org/abs/2605.22344), [Comfy docs](https://docs.comfy.org/tutorials/video/bytedance/bernini-r.md)
- Wan Animate 2: [HF Wan-AI/Wan2.2-Animate-2-14B](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B), [HF Comfy-Org/Wan-Animate-2](https://huggingface.co/Comfy-Org/Wan-Animate-2), [arXiv 2608.06009](https://arxiv.org/abs/2608.06009), [Comfy docs](https://docs.comfy.org/tutorials/video/wan/wan-animate-2.md)
- Wan 2.2 Animate: [Comfy docs](https://docs.comfy.org/tutorials/video/wan/wan2-2-animate.md), HF Wan-AI/Wan2.2-Animate-14B, Kijai/WanVideo_comfy_fp8_scaled, Kijai/WanVideo_comfy
- Templates (github.com/Comfy-Org/workflow_templates `templates/`): `video_bernini_r_video_editing`, `video_bernini_r_image_editing`, `video_wan_animate2`, `video_wan_animate2_distilled`, `video_wan2_2_14B_animate`, `template_purz_wan22_animate_auto_character_replace`, `video_wan21_scail2_character_replacement_int8`, `video_minimax_h3_r2v`, `api_higgsfield_genjutsu_motion_transfer`, `index.json`
- ComfyUI source at tag v0.41.1 (`comfy_extras/nodes_bernini.py`, `nodes_wan.py`, `nodes_sam3.py`, `nodes_video.py`, `nodes_math.py`, `comfy/supported_models.py`), GitHub releases, tags and compare API, PR #15139
- Head swap: [HF Alissonerdx/BFS-Best-Face-Swap-Video](https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video) (README, Bernini workflow), [github alisson-anjos/ComfyUI-BFSNodes](https://github.com/alisson-anjos/ComfyUI-BFSNodes) `headswap_node.py`
- Others: HF Eyeline-Labs/ID-V2V, Kijai/Wan_ID_V2V_comfy, zai-org/SCAIL-2, XuGuo699/DreamID-V, Alissonerdx/EditAnything, rzgar/Bernini-R-LightX2V-4step-loras, rzgar/Bernini-v2-ComfyUI, Lightricks author listing, vrgamedevgirl84 LTX-2.3 style LoRAs, MiniMaxAI/MiniMax-H3 LICENSE, lightx2v repos, JunkyByte/easy_ViTPose, yzd-v/DWPose, hr16/DWPose-TorchScript-BatchSize5, Comfy-Org/sam3.1
- Civitai API: `/api/v1/models?baseModels=Wan Video 2.2 T2V-A14B` and `Wan Video 14B t2v` (top 301 and 460 LoRAs), `/api/v1/models/2788237`, query "bernini"
- Comfy Cloud: `/api/system_stats`, `/api/experiment/models/{diffusion_models,loras,text_encoders,vae,clip_vision,detection,sam2,checkpoints}`, [supported nodes](https://comfy.org/cloud/supported-nodes.md)
- Leaderboard: [Artificial Analysis video editing](https://artificialanalysis.ai/video/leaderboard/video-editing)
- Third-party VRAM: [neuregex/ComfyUI-BerniniR](https://github.com/neuregex/ComfyUI-BerniniR), [localaimaster Wan Animate 2 guide](https://localaimaster.com/blog/wan-animate-2-local-guide)
