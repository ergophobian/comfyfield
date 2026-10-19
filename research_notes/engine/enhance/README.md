# Enhance graphs: upscale, slow motion, cut-outs, new backgrounds and grades

Research date: 2026-10-19. Family: `enhance`. Scope: the `seedvr2_image`, `seedvr2_video`, `image_upscale`, `rife_interpolate`, `birefnet_image`, `birefnet_video_matte`, `birefnet_qwen_background`, `sticker_match_cut` and `image_grade` workflow ids, used by the formats `unblur`, `image-upscale`, `video-upscale`, `slow-motion`, `image-bg-remove`, `video-bg-remove`, `new-background`, `sticker-match-cut` and `photo-grade`, and by the Upscale page (`src/pages/Upscale.jsx`, tools `image-upscale` and `video-upscale`).

Tags: **[Verified: source]** means I read it in a primary source today. **[Inference]** means my conclusion. No weights were downloaded, no API keys were used, ComfyUI was not run.

Sources, read today:

- ComfyUI source at commit `45bf90d1c91eecd782643346dcfb73cb0017667f` (`comfyui_version.py` says 0.41.1), from `codeload.github.com/Comfy-Org/ComfyUI/tar.gz/<commit>`.
- Comfy-Org/workflow_templates `main` at `59a3b48bf369c5a15f29a1308bae3e279fa15505` (2026-10-18), `templates/index.json` and the template files named below.
- Comfy Cloud: `/api/system_stats` (`comfyui_version` v0.41.1, `cloud_version` v0.480.0) and `/api/experiment/models/<folder>` at 13:05 UTC; `comfy.org/cloud/supported-nodes.md`.
- Hugging Face API: `/api/models/<repo>` and `/tree/main?recursive=true` (`lfs.oid` = sha256, `lfs.size` = bytes).

## Summary

GB is decimal (bytes / 1e9), summed over the files the graph loads. GPU class is the smallest Pod rung that fits [Inference: from file sizes and the notes below].

| Graph id | Model | LoRAs | Every file on Cloud | Node packs | GPU class | Download GB | Formats served |
|---|---|---|---|---|---|---|---|
| `seedvr2_image` | SeedVR2 3B INT8 | none | yes | none | 24 | 3.96 | `unblur` |
| `image_upscale` | SeedVR2 3B INT8 | none | yes | none | 24 | 3.96 | `image-upscale` (Enhance), Upscale page (image) |
| `image_upscale_esrgan` | RealESRGAN x4plus | none | yes | none | 24 | 0.07 | `image-upscale` (Faithful) |
| `seedvr2_video` | SeedVR2 3B INT8 | none | yes | none | 24 | 3.96 | `video-upscale`, Upscale page (video) |
| `rife_interpolate` | RIFE 4.26 | none | yes | none | 24 | 0.02 | `slow-motion` |
| `birefnet_image` | BiRefNet | none | yes | none | 24 | 0.44 | `image-bg-remove` |
| `birefnet_video_matte` | BiRefNet + SAM 3.1 | none | yes | none | 24 | 2.19 | `video-bg-remove` (Green screen) |
| `birefnet_video_matte_alpha` | BiRefNet + SAM 3.1 | none | yes | VideoHelperSuite (on Cloud) | 24 | 2.19 | `video-bg-remove` (Transparent) |
| `birefnet_video_matte_scene` | BiRefNet + SAM 3.1 + Qwen-Image 2.1 Turbo | none | **no** (Qwen-Image 2.1 DiT and VAE) | none | 24 | 34.63 | `video-bg-remove` (New background) |
| `birefnet_qwen_background` | BiRefNet + Qwen-Image 2.1 Turbo | none | **no** (Qwen-Image 2.1 DiT and VAE) | none | 24 | 32.88 | `new-background` |
| `image_grade` | none (core GLSL shaders) | none | no files | none (core `GLSLShader`; needs PyOpenGL and comfy-angle) | 24 (any) | 0 | `photo-grade` |
| `sticker_match_cut` | **skipped** | | | | | | `sticker-match-cut` |

All graphs pass my checker against the pinned source with 0 problems (see `check.md`; the extractor, checker, graph builder, GLSL harness and shader sources are in `tools/`). Every class is core at the pinned commit except `VHS_VideoCombine`.

**Lineup claim checked.** "SeedVR2 3B INT8, RIFE 4.26 and BiRefNet are native and on Cloud" is true:

- Native: `SeedVR2Preprocess`, `SeedVR2Conditioning`, `SeedVR2PostProcessing`, `SeedVR2TemporalChunk`, `SeedVR2TemporalMerge` (`comfy_extras/nodes_seedvr.py`), `FrameInterpolationModelLoader` and `FrameInterpolate` (`nodes_frame_interpolation.py`, RIFE and FILM), `LoadBackgroundRemovalModel` and `RemoveBackground` (`nodes_bg_removal.py`, BiRefNet). `nodes.py` loads all three modules. [Verified: source at the pinned commit]
- On Cloud: `diffusion_models/seedvr2_3b_int8_convrot.safetensors`, `vae/seedvr2_ema_vae_fp16.safetensors`, `frame_interpolation/rife_v4.26.safetensors`, `background_removal/birefnet.safetensors`, `upscale_models/RealESRGAN_x4plus.safetensors`, `checkpoints/sam3.1_multiplex_fp16.safetensors`. [Verified: Cloud listing]
- Self-fetched models: none. I found no `hf_hub_download`, `snapshot_download`, `urlretrieve`, `requests.get` or `torch.hub` call in the SeedVR2, BiRefNet, frame interpolation, SAM 3, GLSL or Qwen-Image 2.1 code; BiRefNet's config (`comfy/background_removal/birefnet.json`) and the tokenizers ship inside ComfyUI. [Verified: grep of the pinned source] VideoHelperSuite uses a system ffmpeg or the binary inside the `imageio-ffmpeg` wheel. [Inference]

## Changes the repo needs (all graphs)

1. **Model files.** Add `files.json` to `MODEL_FILES`. `birefnet.safetensors` and `sam3.1_multiplex_fp16.safetensors` are the same entries as in `research_notes/engine/video-edit/files.json` (same repo, path, size, sha256, `vramGb: 0`, label). [Verified: both files]
2. **Loaders.** Add `loaders.json` to `LOADERS`: `LoadBackgroundRemovalModel.bg_removal_name` reads `background_removal` and `FrameInterpolationModelLoader.model_name` reads `frame_interpolation`. [Verified: `folder_paths.py` lines 59 and 61, and the two loaders' `folder_paths.get_filename_list(...)` calls]
3. **Pod folders.** `DIRS` in `server/podBoot.js` (extra_model_paths.yaml and `mkdir`) and `DIRS` in `server/pod-statusd.py` (the download whitelist, `item.get('dir') in DIRS`) lack `background_removal` and `frame_interpolation`. Without them the Pod refuses the BiRefNet and RIFE downloads and ComfyUI does not see the files. [Verified: both files]
4. **Node pack.** Add `VHS_VideoCombine` to `NODE_PACKS.vhs.classes` (same commit `4d907bee`, 2026-09-02). See `packs.json`. [Verified: VHS `videohelpersuite/nodes.py` at that commit; Cloud lists `VHS_VideoCombine`]
5. **Format validator.** `validateFormat` counts only `step.params` and `step.bindings` as supplied placeholders, not choice `params`. So every graph here that reads a choice param (`upscale_factor`, `target`, `multiplier`, `output`, `preset`, `temperature`, `grain`) fails with "Unmapped workflow placeholder". [Verified: ran `validateFormat` from `src/lib/formats/validate.js` with these graphs' placeholders] Proposed fix in the comfy branch of `validate.js`: a choice param is supplied when every option of that choice sets it.

   ```js
   const choiceParams = format.inputs.filter((i) => i.type === 'choice')
     .flatMap((i) => Object.keys(i.options[0]?.params || {}).filter((k) => i.options.every((o) => o.params && k in o.params)))
   // then add ...choiceParams to `supplied`
   ```

   With this rule and the format changes below, all eight served formats validate with no reasons. [Verified: same harness]
6. **Trim default.** The video graphs cut the clip with `Video Slice` from `{{start}}` and `{{duration}}`, like the shipped Bernini graphs. Without a trim, `comfyVars` sets `duration` to the format's duration or 5, so only the first 5 s run. [Verified: `shared/mapping.js`] This also bounds RAM (see each video graph).
7. **Format changes**, details under each graph:
   - `unblur`: every `size` option sets both `upscale_factor` and `target`.
   - `image-upscale`: an explicit step with `targetInput: 'mode'` and per-mode `workflow`; drop the `model` params.
   - `video-bg-remove`: `prompt: ''`, an explicit step with `targetInput: 'result'` and per-result `workflow`, the `background` binding on the `new` target; drop the `output` params.
   - `video-upscale`, `slow-motion`, `image-bg-remove`, `new-background`, `photo-grade`: none (beyond the validator rule).
8. **Comfy SDK outputs.** `birefnet_video_matte_alpha` saves through VHS, whose UI output key is `gifs`. `collectComfy` (local ComfyUI) reads every array with a `filename`, so it works there. Check that the Comfy SDK's `job.outputs` on Cloud and the Pod also reports VHS files. [Verified: `server/core.js`] [Inference: SDK behavior not checked]

## Per graph

### `seedvr2_image` (unblur)

- **Template:** `utility_seedvr2_3b_int8_upscale_image` (2026-07-13, `minComfyUIVersion` 0.28.0), subgraph "Upscale Image (SeedVR2 3B Int8)". [Verified]
- **Nodes:** LoadImage → JoinImageWithAlpha (image + LoadImage MASK, as the template) → ResizeImageMaskNode (lanczos) → SeedVR2Preprocess → VAEEncodeTiled (512, 128, 4096, 8) → SeedVR2Conditioning → KSampler (1 step, cfg 1, `euler`, `simple`, denoise 1, `{{seed}}`) → VAEDecodeTiled (512, 128, 4096, 8) → SeedVR2PostProcessing (`none`) → SaveImage. Loaders: UNETLoader `seedvr2_3b_int8_convrot`, VAELoader `seedvr2_ema_vae_fp16`. [Verified: template widgets]
- **Placeholders:** `{{image}}`, `{{upscale_factor}}`, `{{target}}`, `{{seed}}`.
- **Deviation:** the template scales by a multiplier (default 4). The format asks for a size, so the graph uses "scale longer dimension" with `long edge = target` when `target > 0`, else `source long edge × upscale_factor` (GetImageSize → ComfyMathExpression). "Scale by multiplier" caps at 8.0, which a 4K target from a small photo can pass. [Verified: `ResizeImageMaskNode` options in `nodes_post_processing.py`]
- **Format change:** each `size` option must set both params, because `runComfy` refuses a graph with an unset placeholder (`unsetInput`): `same: { upscale_factor: 1, target: 0 }`, `2k: { upscale_factor: 1, target: 2048 }`, `4k: { upscale_factor: 1, target: 4096 }`. [Verified: `server/core.js`]
- **Color:** the template default `color_correction_method` is `none`; `lab` is "the most faithful" per the node tooltip and is the option to try if colors drift. [Verified: node tooltip]
- **Output:** an RGBA PNG (alpha 1 for opaque photos, kept for transparent PNGs). SeedVR2PostProcessing re-applies the alpha. [Verified: node code]

### `image_upscale` (Enhance) and `image_upscale_esrgan` (Faithful)

- **How the format picks:** one graph per model. Give the format an explicit step that picks by `mode`, and drop the now-unused `model` params from the `mode` options (the validator flags `model` as an unknown placeholder):

  ```js
  steps: [{ id: 'generate', provider: 'comfy', workflow: 'image_upscale', kind: 'image', targetInput: 'mode', targets: {
    faithful: { workflow: 'image_upscale_esrgan' },
    enhance: { workflow: 'image_upscale' },
  } }],
  ```

  `selectedStep` merges the chosen target over the step. [Verified: `src/lib/formats/options.js`]
- **`image_upscale`:** the SeedVR2 template exactly, with "scale by multiplier" = `upscale_factor`, except a cap: the multiplier is `max(1, min(upscale_factor, 4096 / long edge))`, so the output long edge stays at or below 4096 px. [Inference: a 4x of a 2048 px photo is a 67 MP SeedVR2 frame; remove the cap on a 96 GB Pod if wanted] Placeholders `{{image}}`, `{{upscale_factor}}`, `{{seed}}`.
- **`image_upscale_esrgan`:** from `utility-gan_upscaler` (a video template, 2026-01-26): UpscaleModelLoader `RealESRGAN_x4plus.safetensors` → ImageUpscaleWithModel. The model always gives 4x; the template note says "Upscale 4x first, then use a resize node to bring it down to your target resolution", so a ResizeImageMaskNode (`area`, the tooltip's choice for downscaling) scales by `cap(upscale_factor) / 4`, and JoinImageWithAlpha puts back the source alpha. Same 4096 px cap. Placeholders `{{image}}`, `{{upscale_factor}}`. [Verified: template and node tooltips]
- **Upscale page:** its 3B and 7B choice maps to the UNETLoader file only. The `utility_seedvr2_7b_int8_upscale_image` template differs from the 3B one only in `unet_name`. [Verified: diff of both templates] The 7B file is `seedvr2_7b_int8_convrot.safetensors` (Comfy-Org/SeedVR2 `diffusion_models/`, 8,334,897,976 B = 8.33 GB, sha256 `5aa0d25fc9d35e449b659d0c9a5dcb22e2a4fa04032101b95a39da42b32c1be6`, on Cloud); it is not in `files.json` because no graph here loads it. Its "Precise" mode fits `image_upscale_esrgan` for images, and "Creative" fits SeedVR2 [Inference]. The page's "Remove noise", "Restore faces", "Frame rate" and "Remove flicker" toggles have no graph input.

### `seedvr2_video` (video-upscale)

- **Template:** `utility_seedvr2_3b_int8_upscale_video` (2026-07-14, min 0.28.0), subgraph "Upscale Video (SeedVR2 3B Int8)". [Verified]
- **Nodes:** LoadVideo → Video Slice → GetVideoComponents → ResizeImageMaskNode (scale by multiplier, lanczos) → SeedVR2Preprocess → VAEEncodeTiled (512, 128, 64, 8) → SeedVR2TemporalChunk (`auto`, overlap 1) → SeedVR2Conditioning → KSampler (as the image graph) → SeedVR2TemporalMerge → VAEDecodeTiled (512, 128, 64, 8) → SeedVR2PostProcessing (`none`) → CreateVideo (audio and fps of the trimmed clip) → SaveVideo (mp4, h264 keys copied from `ltx25_i2v.json`).
- **Placeholders:** `{{video}}`, `{{start}}`, `{{duration}}`, `{{upscale_factor}}`, `{{seed}}`.
- **Deviations:**
  - Temporal chunking is on. The template has it off by default and says to trim long clips to avoid OOM. `auto` "predict[s] the largest chunk that fits free VRAM" and returns the whole latent unchanged when it fits, so it costs nothing on a short clip. Overlap 1 latent frame crossfades chunk seams with a Hann window. [Verified: `SeedVR2TemporalChunk` and `SeedVR2TemporalMerge` code] [Inference: overlap 1 is my pick; the template uses 0]
  - The multiplier is capped so the output long edge stays at or below 3840 px (`max(1, min(upscale_factor, 3840 / long edge))`). [Inference]
  - The template's trim switch is replaced by the app's trim, and CreateVideo does not link `bit_depth` (as the shipped graphs). [Verified: shipped graphs]
- **RAM:** every frame of every stage sits in system RAM as float32. A 5 s, 24 fps clip at 3840×2160 is 121 × 3840 × 2160 × 3 × 4 B ≈ 12 GB per full tensor, and the resized, padded, decoded and post-processed tensors can be alive at once (about 50 GB). [Inference] Keep 4K outputs to about 5 s, or use the 96 GB rung. [Inference: larger RunPod GPUs come with more system RAM; not checked]

### `rife_interpolate` (slow-motion)

- **Template:** `utility_video_frame_interpolation` (2026-04-27, min 0.20.0), subgraph "Frame Interpolation". The note lists `rife_v4.25`, `rife_v4.25_heavy`, `rife_v4.25_lite`, `rife_v4.26`, `rife_v4.26_heavy` and `film_net_fp16`; the template itself loads FILM. [Verified]
- **Nodes:** LoadVideo → Video Slice → GetVideoComponents → (ResizeImageMaskNode only when the clip is too big, via ComfySwitchNode) → FrameInterpolationModelLoader `rife_v4.26.safetensors` → FrameInterpolate (`multiplier` 2 to 16) → CreateVideo (source fps) → SaveVideo.
- **Placeholders:** `{{video}}`, `{{start}}`, `{{duration}}`, `{{multiplier}}`.
- **Deviations:**
  - The template's "Apply multiplier to FPS?" is on (smooth motion, same length). Slow motion needs it off: the graph keeps the source fps, so 2x/4x/8x play 2/4/8 times longer. [Verified: template; `FrameInterpolate` returns `(frames − 1) × multiplier + 1` frames]
  - Audio is dropped, because it would end long before the slowed video. [Inference]
  - Size cap: 2x and 4x keep at most a 1920 px long edge, 8x at most 1280 px. `FrameInterpolate` allocates every output frame in RAM at once: 8x of a 5 s 1080p clip is 961 frames, about 24 GB in float32; at 1280 px it is about 10.6 GB. [Verified: `torch.empty((total_out_frames, 3, H, W))` in the node] [Inference: sizes]
- **Model choice:** RIFE 4.26 (2024-09-21) is the newest Practical-RIFE model; its authors say "it is recommended to choose 4.25 by default for most scenes". `rife_v4.25.safetensors` (22,674,688 B, sha256 `1505884b9bdae956795430d2a70f7e2317b2abd8f130f8cfdb35a5759f909481`) is also in Comfy-Org/frame_interpolation and on Cloud, so switching is one string. [Verified: Practical-RIFE README, HF API, Cloud listing] The format says RIFE 4.26, so the graph keeps it.

### `birefnet_image` (image-bg-remove)

- **Template:** `utility_birefnet_remove_background` (2026-05-10, min 0.21.0): LoadBackgroundRemovalModel `birefnet.safetensors` → RemoveBackground → InvertMask → JoinImageWithAlpha. [Verified] `JoinImageWithAlpha` stores `1 − mask`, which is why the foreground mask is inverted first. [Verified: `nodes_compositing.py`]
- **Output by `{{output}}`:** `alpha` saves the RGBA cut-out. `white` and `green` composite the photo over an EmptyImage of the source size in white (`0xFFFFFF`) or chroma green (`0x00FF00`) with ImageCompositeMasked and the BiRefNet mask. Two StringCompare (`Equal`) nodes drive two ComfySwitchNode; the switch inputs are lazy, so only the chosen branch runs. [Verified: `nodes_logic.py`, `nodes_string.py`]
- **Placeholders:** `{{image}}`, `{{output}}`. No format change beyond the validator fix.
- **Note:** RemoveBackground runs BiRefNet at 1024×1024 and resizes the mask back. [Verified: `birefnet.json`, `bg_removal_model.py`] Comfy-Org/BiRefNet also has `lucida.safetensors` (a 2026-07 BiRefNet_HR fine-tune, MIT, vendor benchmark only, not on Cloud); not used. [Verified: HF API, Cloud listing]

### `birefnet_video_matte`, `birefnet_video_matte_alpha`, `birefnet_video_matte_scene` (video-bg-remove)

- **Templates:** BiRefNet as above, run on the whole frame batch (RemoveBackground loops over the batch one frame at a time, despite the docs' "one image at a time"); SAM 3.1 loader from `utility_video_segment_sam3` (2026-04-27). [Verified: `bg_removal_model.py`, template] There is no official BiRefNet + SAM video matte template, so the matte is my design. [Inference]
- **Shared matte (nodes 1 to 20):** LoadVideo → Video Slice → GetVideoComponents → size cap 1920 px (ComfySwitchNode, only when bigger) → BiRefNet soft mask per frame. BiRefNet's mask of frame 1 (ImageFromBatch → RemoveBackground → ThresholdMask 0.5) seeds `SAM3_VideoTrack` (`initial_mask`, `max_objects` 1, no text, so it tracks that one subject) → `SAM3_TrackToMask`. The final matte is `BiRefNet × grow(SAM, 16 px)` plus `shrink(SAM, 8 px)` (GrowMask and MaskComposite `multiply` and `add`, clamped to 0..1). BiRefNet keeps hair-level edges; the SAM track removes flicker and other objects away from the subject and fills holes inside it. [Verified: SAM3 node and tracker take `[N_obj, 1, H, W]` first-frame masks; MaskComposite clamps] [Inference: quality untested]
- **Why three graphs:** core `SaveVideo` writes `rgb24` frames only, so it cannot keep alpha [Verified: `VideoFromComponents.save_to`], and the New background option needs a `{{background}}` placeholder the other two cannot fill. One graph per choice, picked by `result`:

  ```js
  prompt: '',  // no graph reads {{prompt}}; the validator rejects a prompt the graph does not use
  steps: [{ id: 'generate', provider: 'comfy', kind: 'video', workflow: 'birefnet_video_matte_alpha', targetInput: 'result', targets: {
    transparent: { workflow: 'birefnet_video_matte_alpha' },
    green: { workflow: 'birefnet_video_matte' },
    new: { workflow: 'birefnet_video_matte_scene', bindings: { background: 'background' } },
  } }],
  ```

  Also drop the `output` params from the `result` options (no graph reads them).
- **`birefnet_video_matte` (green):** EmptyImage (frame size, batch = frame count, `0x00FF00`) → ImageCompositeMasked → CreateVideo (audio, fps) → SaveVideo mp4. Cloud: yes.
- **`birefnet_video_matte_alpha` (transparent):** InvertMask → JoinImageWithAlpha → `VHS_VideoCombine` (`video/webm`, `pix_fmt` `yuva420p`, crf 20, audio): WebM VP9 with alpha, which plays with transparency in Chrome, Edge and Firefox. For editing apps that want ProRes 4444, set `format` to `video/ProRes` and add `profile: "4444"` (VHS picks `yuva444p10le` when the frames have alpha). [Verified: VHS `webm.json`, `ProRes.json`, `nodes.py`] Cloud: yes (VHS is preinstalled).
- **`birefnet_video_matte_scene` (new background):** a Qwen-Image 2.1 Turbo text-to-image plate, the shipped `qwen_image21_t2i.json` sampler (8 manual sigmas, `euler`, cfg 1) at about 1 MP in the clip's aspect (multiples of 32), prompt `An empty background plate with no people and no main subject, for compositing a person in front of it: {{background}}`, → SplitImageWithAlpha (the 2.1 VAE decodes RGBA) → ResizeImageMaskNode `match size` to the frame (center crop) → RepeatImageBatch (frame count) → ImageCompositeMasked → CreateVideo → SaveVideo. The plate is a still and its light is not matched to the subject. [Inference] Pod only. Needs the `background` binding above.
- **Placeholders:** all three `{{video}}`, `{{start}}`, `{{duration}}`; the scene graph adds `{{background}}` and `{{seed}}`.
- **Cost:** GrowMask runs scipy per frame and per pixel of growth, so 121 frames × 24 passes at 1920 px take on the order of a minute on CPU. [Inference] The core `Morphology` node (kornia, GPU) is a faster swap if needed.

### `birefnet_qwen_background` (new-background)

- **Model pick:** Qwen-Image 2.1 Turbo edit, as the format's `runsOn` says. Its three files are already in `MODEL_FILES` and shared with the `qwen-edit` family graphs (`research_notes/engine/qwen-edit/qwen_edit.json` uses the same files). It is Pod only and under the Qwen Research License (non-commercial). [Verified: MODEL_FILES, HF API `license_name: qwen-research`] Qwen-Image-Edit 2511 would run on Cloud (all its files are listed) under Apache 2.0, at the cost of a second edit stack. [Verified: Cloud listing] License review is deferred per project memory.
- **Template:** `image_qwen_image_2_1_turbo_image_edit` (2026-10-13, min 0.39.0): TextEncodeQwenImage21 with `images.image_1` and the VAE → its latent output → CFGGuider cfg 1 → SamplerCustomAdvanced (RandomNoise, KSamplerSelect `euler`, ManualSigmas `1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0`) → VAEDecode. The prompt enhancer is off, as the template's default. [Verified: template widgets]
- **Nodes:** LoadImage → BiRefNet → InvertMask → JoinImageWithAlpha (an RGBA cut-out) → TextEncodeQwenImage21 → sampler → VAEDecode → SplitImageWithAlpha (RGB) → SaveImage.
- **Why an RGBA cut-out:** TextEncodeQwenImage21 shows the vision tower "alpha over white" and keeps all four channels for the RGBA VAE, and Comfy's `image_qwen_image_2_1_background_removal` template shows the model reads and writes transparency. So the old background cannot leak into the new scene. [Verified: `nodes_qwen.py` line 170, template] [Inference: that Turbo fills the transparent area with the prompted scene; if it leaves holes, composite the cut-out over mid gray before encoding instead]
- **Deviations:** `resolution` is `min(2048, max(512, √(w·h)))` in multiples of 32, instead of the template's 0 ("keep each reference at its own size"), so a 12 MP photo does not run above the model's native 2K and small photos stay small. The template's `QwenImage21Cache` (`auto`, `default`) is left out because those are the model's defaults. [Verified: node descriptions]
- **Placeholders:** `{{image}}`, `{{prompt}}`, `{{seed}}`. The format's prompt works as is; it already says to keep the subject and match light. No format change.

### `image_grade` (photo-grade)

- **Pack:** none. `GLSLShader` is a core node (`comfy_extras/nodes_glsl.py`, GLSL ES 3.00 through EGL and ANGLE). Comfy's own color blueprints (`blueprints/Color Adjustment.json`, `Film Grain.json`) and the template `basic_image_color_adjustment` (2026-04-24, min 0.19.0) use it. [Verified: source, blueprints, template index]
- **Nodes:** LoadImage → GLSLShader 1 (look) → GLSLShader 2 (the official Color Adjustment shader, verbatim, `u_float0` = temperature) → GLSLShader 3 (the official Film Grain shader, verbatim: amount, size 1.5, color 0, luminance bias 0.5, smooth mode) → SplitImageWithAlpha (GLSL outputs RGBA) → SaveImage.
- **Looks:** shader 1 is mine. Seven StringCompare nodes turn `{{preset}}` into `u_bool0..6` (`split_tone`, `soft_skin`, `old_lens`, `16mm`, `faded`, `mono`, `warm_70s`); all false is `natural` (no change). The looks use lift, contrast, saturation, split toning, a 16-tap disc blur for glow and halation, and a vignette. 16mm adds a grain floor: amount = `max(grain, 25 if 16mm) / 100`. [Inference: the look values are my design, not an official preset set]
- **Checked by running:** I compiled and rendered all three shaders with comfy-angle 0.1.1 and PyOpenGL 3.1.10 in a scratch venv on Windows, with the same vertex shader, texture upload and uniform binding as `nodes_glsl.py`, on a 720×403 photo: every look and the official shaders compile, link and give plausible output. [Verified: local ANGLE render] Uniforms bind by list position (`u_float{i}` for the i-th value), so each group is contiguous from index 0. [Verified: `_render_shader_batch`]
- **Placeholders:** `{{image}}`, `{{preset}}`, `{{temperature}}` (−20, 0, 20 on the shader's −100..100 scale), `{{grain}}` (0, 15, 40 → amount 0, 0.15, 0.40).
- **Risks:** PyOpenGL and comfy-angle are listed under "non essential dependencies" in ComfyUI's `requirements.txt`; if an image lacks them, `nodes_glsl` fails to import and `GLSLShader` is missing. The Pod runs `pip install -r requirements.txt` only when it moves to the pinned commit. Headless EGL needs a default display, Mesa surfaceless or ANGLE's Vulkan backend; RunPod containers without the NVIDIA graphics capability may have none. [Verified: `requirements.txt`, `_get_egl_display`, `server/podBoot.js`] [Inference: run one grade on a Pod before shipping] Cloud's core node list needs a login, so `GLSLShader` on Cloud is not verified; Cloud runs the same v0.41.1 and lists the template. [Inference]

### `sticker_match_cut`: skipped

The format asks for a sticker cut-out "and on each beat cut to a new matching pose that pops over a frozen background with a small bounce and a sparkle burst". Core v0.41.1 cannot do that right:

- No core node detects beats or onsets (`comfy_extras/nodes_audio.py` has none). [Verified]
- No core node animates per frame: `GLSLShader` gives every frame of a batch the same uniforms and no frame index; transforms (`ImageCompositeMasked` x/y, `ResizeImageMaskNode`) take one value per batch. [Verified: `nodes_glsl.py`, `nodes_mask.py`]
- The sparkle burst needs overlay art or a particle effect.

What exists: the matte (`birefnet_video_matte_alpha` gives an RGBA cut-out per frame) and a sticker edge (`GrowMask` minus the matte, filled white or with a GLSL holo or glitter shader) are core. The beat-timed cuts, bounce and sparkles need either an app-side ffmpeg compositor over that RGBA output, or a custom pack. Cloud preinstalls ComfyUI_Fill-Nodes (`FL Audio BPM Analyzer`, `FL Audio Drum Detector`, `FL Audio Reactive Scale`, `FL Audio Music Video Sequencer`) and nodesweet (`AudioReactiveTransform`), which may cover beats and bounce. [Verified: Cloud supported-nodes list] [Inference: not pinned or read; a separate task] Also note the format sets `settings: still` and has no audio input, so "each beat" has no track yet.

## Files

`files.json` holds every file these graphs load that is not in `MODEL_FILES`. All repos are not gated. [Verified: HF API]

| File | Folder | Repo / path | Bytes | sha256 | License | Cloud |
|---|---|---|---|---|---|---|
| `seedvr2_3b_int8_convrot.safetensors` | diffusion_models | Comfy-Org/SeedVR2 / `diffusion_models/` | 3,458,259,704 | `c3dec8bc…f53a157` | Apache-2.0 | yes |
| `seedvr2_ema_vae_fp16.safetensors` | vae | Comfy-Org/SeedVR2 / `vae/` | 501,324,814 | `20678548…a8612ca1` | Apache-2.0 | yes |
| `RealESRGAN_x4plus.safetensors` | upscale_models | Comfy-Org/Real-ESRGAN_repackaged / root | 66,857,836 | `37f9a931…bfe9a60bb` | BSD-3-Clause | yes |
| `rife_v4.26.safetensors` | frame_interpolation | Comfy-Org/frame_interpolation / `frame_interpolation/` | 22,674,688 | `15187459…e8d317c94` | MIT (repo tag "mit-and-apache-2.0") | yes |
| `birefnet.safetensors` | background_removal | Comfy-Org/BiRefNet / `background_removal/` | 444,473,596 | `9ab37426…ce356a154` | MIT | yes |
| `sam3.1_multiplex_fp16.safetensors` | checkpoints | Comfy-Org/sam3.1 / `checkpoints/` | 1,745,546,848 | `9ba99c92…6368eb03` | SAM License (the official facebook/sam3.1 is gated "manual"; the Comfy-Org copy is not) | yes |

Already in `MODEL_FILES` and used here: `qwen_image_2.1_turbo_bf16.safetensors` (not on Cloud), `qwen3vl_8b_bf16.safetensors` (on Cloud), `qwen_image_2.1_vae_bf16.safetensors` (not on Cloud).

`vramGb`: 24 for the main model of a graph (SeedVR2 3B, RealESRGAN, RIFE), 0 for BiRefNet and SAM 3.1 to match the `video-edit` family's entries. On the current ladder, 0 and 24 pick the same rung. [Verified: `minVramOf`, GPU ladder]

## Model notes

- **SeedVR2** (ByteDance Seed, Apache-2.0): one-step diffusion restoration, ICLR 2026; `ByteDance-Seed/SeedVR2-3B` and `-7B` from 2025-06-10/11 are still the newest SeedVR releases on Hugging Face. [Verified: HF API, docs.comfy.org SeedVR2 page] The docs' troubleshooting: an all-black INT8 output comes from FlashAttention; run with the default attention backend. [Verified: docs]
- **RIFE** (MIT): see the slow-motion section. FILM (`film_net_fp16`, Apache-2.0) is the same loader's alternative for large motion.
- **BiRefNet** (MIT): Comfy-Org repack of `ZhengPeng7/BiRefNet`; newer ZhengPeng7 variants (HR, dynamic, matting, up to 2025-07) are not repacked by Comfy-Org. [Verified: HF API]
- **SAM 3.1** (Meta, SAM License): Object Multiplex checkpoint, core `SAM3_*` nodes. [Verified]
- **Qwen-Image 2.1 Turbo** (Alibaba, Qwen Research License): see `research_notes/engine/newest-image-models.md`.
