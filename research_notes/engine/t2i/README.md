# t2i family: text to image graphs for ComfyField

Research date: 2026-10-19. Scope: the `qwen_image` formats (6), `qwen_image_logo` (logo), `krea2_t2i` (ai-human), and the two `openModels` rows in `src/lib/tools.js` with no graph yet: `z_image` (Z-Image Turbo) and `hidream` (HiDream-O1).

Tags: **[Verified: source]** means I read it in a primary source today. **[Inference]** means my conclusion. No weights were downloaded, no ComfyUI was run, no keys were used.

Pinned sources:

- ComfyUI `45bf90d1c91eecd782643346dcfb73cb0017667f` (the commit Cloud and the Pod run). Cloud `system_stats` today: `"comfyui_version":"v0.41.1"`. [Verified: https://cloud.comfy.org/api/system_stats]
- Comfy-Org/workflow_templates `59a3b48bf369c5a15f29a1308bae3e279fa15505` (2026-10-18).
- Comfy Cloud model listing, read 2026-10-19 13:05 UTC (`/api/experiment/models/<folder>`).
- Sizes and sha256 from the Hugging Face tree API (`lfs.size`, `lfs.oid`). GB = bytes / 1e9.

## Summary

| Graph id | Model | LoRAs | Every file on Comfy Cloud | Node packs | GPU class | Download | Formats served |
|---|---|---|---|---|---|---|---|
| `qwen_image` | Qwen-Image 2.1 Turbo (bf16) | none | **no** (DiT and VAE missing) | none (core) | 24 GB | 32.44 GB (3 files, all already in `MODEL_FILES`) | look-magazine-90s, look-cctv, look-comic-book, banner, thumbnail, design-graphic, when no picture is attached |
| `qwen_image_ref` | Qwen-Image 2.1 Turbo, one reference picture | none | **no** | none | 24 GB | 32.44 GB (same 3 files) | the 3 looks with a saved character, thumbnail with "Your face" |
| `qwen_image_logo` | Qwen-Image 2.1 Turbo, native transparent output | none | **no** | none | 24 GB | 32.44 GB (same 3 files) | logo |
| `qwen_image_logo_birefnet` (fallback, not the pick) | Qwen-Image 2.1 Turbo + BiRefNet | none | **no** (BiRefNet itself: yes) | none | 24 GB | 32.88 GB (adds `birefnet.safetensors`) | logo |
| `krea2_t2i` | Krea 2 **Turbo** (fp8) | none | **yes** | none | 24 GB | 22.27 GB (2 new files + `qwen3vl_4b_bf16`) | ai-human |
| `krea2_raw_t2i` (as the format names it) | Krea 2 **Raw** (fp8) | none | **yes** | none | 24 GB | 22.27 GB | ai-human |
| `z_image` | Z-Image Turbo (bf16) | none | **yes** | none | 24 GB | 20.69 GB (3 new files) | model picker (`z-image-turbo`) |
| `hidream` | HiDream-O1-Image, full (bf16) | none | **yes** | none | 24 GB | 16.37 GB (1 new file) | model picker (`hidream-o1`) |

Main points:

1. **Qwen-Image 2.1 can take a reference picture in text to image.** `TextEncodeQwenImage21` has an optional `images` input (`image_1` to `image_16`) and an optional `vae`. [Verified: `comfy_extras/nodes_qwen.py` line 115] The character formats should run `qwen_image_ref` when a picture is attached and `qwen_image` when not, with the app's existing `workflow` / `imageWorkflow` pair (as `swap-element` does with `bernini_swap_noref` / `bernini_swap`). No `_meta.optional` node is needed.
2. **Logo: use Qwen-Image 2.1's own alpha channel, not BiRefNet.** The 2.1 VAE decodes RGBA and core `SaveImage` writes it as an RGBA PNG. The graph wraps the prompt in Qwen's documented RGBA wording. The BiRefNet graph is a fallback only.
3. **Krea 2: Krea itself says "TRAIN on Raw and RUN on Turbo".** Raw has no post-training, is trained to 1K only and needs 52 steps with CFG. I recommend `krea2_t2i` = Turbo. `krea2_raw_t2i` is ready if the team wants Raw anyway.
4. **Qwen-Image 2.1 is still not on Comfy Cloud** (no `qwen_image_2.1_*` file in `diffusion_models` or `vae`), so all four Qwen graphs are Pod-only. Krea 2, Z-Image Turbo, HiDream-O1 and BiRefNet are fully on Cloud.
5. No custom node packs and no LoRAs. Every node is core at the pinned commit. `packs.json` is not needed.

---

## 1. `qwen_image` and `qwen_image_ref` (Qwen-Image 2.1 Turbo)

### Template and nodes

- **Template:** `templates/image_qwen_image_2_1_turbo_t2i.json` (last change `0cf483d1dc`, 2026-10-13) for text to image. The reference wiring (`vae` and `images.image_1` into `TextEncodeQwenImage21`) follows `templates/image_qwen_image_2_1_turbo_image_edit.json` (same commit). [Verified]
- **`qwen_image`** is the shipped `public/workflows/qwen_image21_t2i.json` with a different `filename_prefix`: UNETLoader `qwen_image_2.1_turbo_bf16` → CLIPLoader `qwen3vl_8b_bf16` (`qwen_image`) → TextEncodeQwenImage21 (`{{prompt}}`, empty negative, resolution 1024) → CFGGuider cfg 1 → KSamplerSelect `euler` + ManualSigmas (the Turbo 8-step schedule) + RandomNoise `{{seed}}` + EmptyLatentImage `{{width}}`x`{{height}}`x`{{count}}` → SamplerCustomAdvanced → VAEDecode (`qwen_image_2.1_vae_bf16`) → SaveImage. The integrator can alias `qwen_image` to the shipped file instead of adding a copy. [Inference]
- **`qwen_image_ref`** adds LoadImage `{{image}}` → `TextEncodeQwenImage21.images.image_1`, and links the VAE into `TextEncodeQwenImage21.vae`, so the reference reaches both the Qwen3-VL encoder and the DiT (as VAE reference latents). [Verified: `execute` in `nodes_qwen.py`]
- **Prompt with a reference:** `Create a new image whose main subject is the person or character in <image1>. Keep their face, facial features, hair, skin tone and body shape recognizable from <image1>, and follow this description for everything else: {{prompt}}`
  - The prompt addresses references by index as `<image1>`. [Verified: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1, template note "Mention them in the prompt as `<image1>`"]
  - The tokenizer puts `<image1>` plus the vision block before the user text when an image is given. [Verified: `comfy/text_encoders/qwen_image21.py` lines 22 to 24]
  - Qwen shows multi-reference generation of new scenes ("Group photograph generated from six portrait references", Turbo "Multi-Reference Composition"). [Verified: https://huggingface.co/Qwen/Qwen-Image-2.1, https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo] The wording above is mine; test it on a few saved characters. [Inference]
- **Placeholders:** `qwen_image`: prompt, seed, width, height, count. `qwen_image_ref`: the same plus `image`.

### Deviations

- The output canvas comes from `{{width}}`x`{{height}}`, not from the encode node's `latent` output (the reference size). The template warns that another size "can shift the edit"; this graph makes a new picture, not an in-place edit, so a shift does not matter. [Verified: template note] [Inference]
- `resolution` 1024 (node default; the edit template ships 0). 1024 resizes the reference to about 1 MP, which is enough for identity and keeps the run cheap. [Verified: node tooltip, docs "Resolution"] [Inference]
- No `QwenImage21Cache`. The template node is set to `auto` / `default`, which is what the model does without the node. [Verified: node description]
- No prompt enhancer (off by default in the template). [Verified: template]
- Output is RGBA (alpha opaque unless the prompt asks for transparency), as in the shipped graph. [Verified: `comfy/sd.py` line 844 reads `output_channels` from the decoder head; `SaveImage` uses `Image.fromarray` on the 4-channel array]

### Why not one graph with an optional reference

- I first planned one graph with an optional LoadImage and a prompt that changes when the picture is absent. The only core node that picks "whichever input is connected" is `ComfySoftSwitchNode`, and the pinned commit does not register it (commented out in `LogicExtension.get_node_list`). `ComfySwitchNode` returns `None` when the selected input is missing. [Verified: `comfy_extras/nodes_logic.py` lines 337 to 351, 114 to 116]
- A single graph with an optional reference but a fixed prompt would leave `<image1>` in the prompt with no image, or give the model a picture the prompt never mentions. The `workflow` / `imageWorkflow` pair avoids both. [Inference]

### Format changes needed

All checked with the repo's `validateFormat` and a schema list that includes these graphs (script `tools/validate-sim.mjs` in the scratchpad, results below).

1. **Add `imageWorkflow: 'qwen_image_ref'`** to `qwenType` in `src/lib/formats/jobsx.js` line 7 and to the three looks in `src/lib/formats/looks.js` (lines 52, 59, 149). Without it, the validator hides the looks ("Input character does not map to a target model") and thumbnail ("Input image does not map to a target model"). With it, thumbnail validates. [Verified: simulation]
2. **Shape choices (`params: { aspect }`) do not reach the graph.** `validate.js` rejects `aspect` as "Unknown workflow placeholder aspect" for the looks, banner and design-graphic, and no code moves `params.aspect` into the run's aspect. The looks have no `settings.aspect`, so `comfyVars` would get `aspect: undefined` and fail. `stepOptions` / `recipeOptions` should use `params.aspect` as the aspect, and the validator should accept it. This affects every shape format, not only this family. [Verified: simulation; `grep params.aspect` finds nothing]
3. **Qwen canvas sizes.** Format steps get `aspectSize` (1280x720 for 16:9, 720x1280 for 9:16); 720 is not a multiple of 32, which the Qwen template asks for. Give the Qwen format steps Qwen's sizes (the `comfy-qwen-image21` catalog sizes are all multiples of 32). [Verified: template note "Prefer multiples of 32"; `pod-checks.mjs` asserts multiples of 32 for that catalog entry]
4. **Banner "Leaderboard" is `21:9`, which `aspectSize` does not have.** `comfyVars` throws ("undefined is not iterable"). Add a 21:9 size, for example `[2016, 864]` (both multiples of 32, exactly 21:9). [Verified: fill check output]
5. **Brand (banner, design-graphic):** the prompt says "Use the brand colors and logo when a brand is given", but no slot or placeholder carries the brand, and the validator reports "Input brand does not map to a target model". `brand` is not in `pictureTypes` in the working-tree `recipes.js`. Smallest fix: put `{brand}` in the prompt (it fills with the brand name). A logo reference would need its own graph with logo wording; I did not draft it. [Verified: simulation, `src/lib/recipes.js`]

---

## 2. `qwen_image_logo` (Qwen-Image 2.1 Turbo, transparent background)

### Template and nodes

- Same nodes and values as `qwen_image`. The prompt is Qwen's recommended RGBA format around the format prompt: `This is an RGBA image with transparency. {{prompt}} The image has alpha channel and the background is transparent.` [Verified: "Transparent Image Generation (RGBA)", https://huggingface.co/Qwen/Qwen-Image-2.1]
- Qwen-Image 2.1 generates transparency natively ("Generate regular or transparent (RGBA) images from text"), and Turbo lists "Transparent Image Generation" in its showcase. [Verified: both model cards]
- Comfy: "the VAE carries four channels, so transparent-background images can be generated and edited directly instead of being cut out afterwards". [Verified: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1]
- `SaveImage` saves the 4-channel tensor as an RGBA PNG with no extra node. [Verified: `nodes.py` lines 1702 to 1720]
- **Placeholders:** prompt, seed, width, height, count.
- Why not BiRefNet: a matting model can fill letter counters (the holes in "a", "e", "o") or drop thin strokes on flat graphics; native alpha avoids a second model and 0.44 GB. [Inference]

### Format changes needed

1. Remove "on a plain white background" from the `logo` prompt in `jobsx.js` (line 189); it contradicts the RGBA wording. Suggested: `... Clean, vector-like shapes with the name spelled exactly, centered with generous empty space around it and no mockup. Colors: {colors}` [Inference]
2. Set `runsOn: 'Qwen-Image 2.1'` (no BiRefNet in the pick).
3. Minor: when `colors` is empty the prompt ends in "Colors:". [Inference]

### Fallback: `qwen_image_logo_birefnet`

- Generates on white with `{{prompt}}` as the format has it, then core BiRefNet: `LoadBackgroundRemovalModel` (`birefnet.safetensors`) → `RemoveBackground` (foreground mask) → `InvertMask` → `JoinImageWithAlpha` (which stores `1 - mask` as alpha) → SaveImage. This is the wiring of `templates/utility_birefnet_remove_background.json`. [Verified: template; `comfy_extras/nodes_bg_removal.py`; `nodes_compositing.py` line 207]
- `RemoveBackground` takes the RGBA decode directly: `clip_preprocess` keeps the first 3 channels. [Verified: `comfy/clip_model.py` line 7]
- It needs `loaders.json` (`LoadBackgroundRemovalModel.bg_removal_name` → `background_removal`, the folder in `folder_paths.py` line 59) and the `birefnet.safetensors` entry in `files.json`. Ship it only if native alpha fails in tests; then rename it to `qwen_image_logo` and keep the format prompt as it is.

---

## 3. `krea2_t2i` and `krea2_raw_t2i` (Krea 2)

### Turbo or Raw

- Krea: "Krea 2 RAW is the base model. It's a pretrained checkpoint with no distillation ... it's what you should use for fine-tuning". "Use the **Turbo** model for fast inference with high quality results. The **Raw** model is an undistilled checkpoint without any step / cfg guidance distillation and posttraining ... In short, **TRAIN on Raw and RUN on Turbo**." [Verified: https://github.com/krea-ai/krea-2 README at `db3984fb`]
- Raw: "trained to generate upto 1k resolution", `--steps 52 --cfg 3.5`. Turbo: "1k ~ 2k resolution", 8 steps, CFG off, mu 1.15. [Verified: same README]
- Comfy's docs and templates only have Turbo workflows; there is no Raw template. [Verified: https://docs.comfy.org/tutorials/image/krea/krea-2, template tree]
- **Recommendation: `krea2_t2i` = Turbo.** Raw costs about 13 times the sampler work (52 steps x 2 for CFG against 8 x 1) and skips the post-training that makes Turbo's people look finished. I found no source that says Raw renders people more lifelike. [Inference] If the team wants Raw, ship `krea2_raw_t2i.json` under the id `krea2_t2i`.

### `krea2_t2i` (Turbo)

- **Template:** `templates/image_krea2_turbo_t2i.json` (`3e50a92ca0`, 2026-10-07); API key names match `benchmarks/image_krea2_turbo_t2i_int8.json`. [Verified]
- **Nodes:** UNETLoader `krea2_turbo_fp8_scaled` → KSampler (`{{seed}}`, 8 steps, cfg 1, `euler`, `simple`, denoise 1). CLIPLoader `qwen3vl_4b_bf16` (`krea2`) → TextGenerate (prompt enhancement, template values: max_length 512, sampling on, temperature 0.7, top_k 64, top_p 0.95, min_p 0.05, repetition_penalty 1.05, seed 0, presence_penalty 0, thinking off, default template on, mtp auto) → CLIPTextEncode → positive; ConditioningZeroOut → negative. EmptyLatentImage `{{width}}`x`{{height}}`x`{{count}}`. VAEDecode `qwen_image_vae` → SaveImage. [Verified: template widgets]
- The TextGenerate prompt is the template's system text followed directly by `{{prompt}}`; the template joins them with `StringConcatenate` and an empty delimiter, so one string is the same input. I used the template's current system text (it differs from the older benchmark copy). [Verified: template subgraph nodes 17, 18]
- **Placeholders:** prompt, seed, width, height, count.
- **Deviations:**
  - Text encoder `qwen3vl_4b_bf16` instead of the template's `qwen3vl_4b_fp8_scaled`. It is the same Qwen3-VL-4B, is on Cloud, and is already in `MODEL_FILES` (same sha256 `36f3ff44…` in Comfy-Org/Krea-2 and Comfy-Org/Qwen3-VL), so FLUX 3 Klein and Krea share one download. [Verified: HF API] [Inference for the choice]
  - The style-LoRA branch is left out (template default: LoRA off).
  - The enhancer stays on, as in the template. Its rule 4 tells the LLM to end prompts with "Absolutely no text ... pure imagery only" unless the user writes words in quotes, which suits `ai-human`. [Verified: system text]

### `krea2_raw_t2i` (Raw, no template)

- Same graph with `krea2_raw_fp8_scaled`, KSampler 52 steps, **cfg 4.5**, `euler`, `simple`, a real negative (CLIPTextEncode of `""`), and ModelSamplingFlux (max_shift 0.90625, base_shift 0.5, `{{width}}`, `{{height}}`).
- **cfg 4.5, not 3.5:** Krea's sampler computes `v = cond + guidance * (cond - uncond)`, which is ComfyUI's `uncond + cfg * (cond - uncond)` with `cfg = guidance + 1`. [Verified: `sampling.py` in krea-ai/krea-2]
- **Shift:** Krea's Raw schedule uses mu from 0.5 at 256x256 to 1.15 at 1280x1280, linear in pixel count, and the time shift `exp(mu) / (exp(mu) + (1/t - 1))`. ComfyUI's Krea2 default is a fixed shift 1.15 (`ModelType.FLUX`, `ModelSamplingFlux`). `ModelSamplingFlux` fits its line from 256 px to 1024 px, so base 0.5 and max 0.90625 give exactly Krea's line (mu 0.906 at 1024x1024). [Verified: krea `sampling.py`; ComfyUI `comfy/supported_models.py` class Krea2, `comfy/model_sampling.py` line 413, `nodes_model_advanced.py` line 181] [Inference: the line equality is arithmetic]
- Keep Raw at about 1 MP or below (its trained limit). The default 4:5 size, 896x1120, is fine.

### Format changes needed

- `ai-human`: `runsOn: 'Krea 2 Turbo'` if `krea2_t2i` is Turbo. The validator passes `ai-human` with this graph as it is. [Verified: simulation]
- **License:** Krea 2 Community License: commercial use only for companies under US$1M annual revenue, and deployers "must implement reasonable and appropriate Content Filter measures" (section 4.2). ComfyField's users run the model with their own keys, but this is a license item for the after-submission review. [Verified: `docs/KREA-2-COMMUNITY-LICENSE` in krea-ai/krea-2]

---

## 4. `z_image` (Z-Image Turbo)

- **Template:** `templates/image_z_image_turbo.json` (`e7cd011d4d`, 2026-09-28); the graph equals `benchmarks/image_z_image_turbo.json` with placeholders. [Verified]
- **Nodes:** UNETLoader `z_image_turbo_bf16` → ModelSamplingAuraFlow (shift 3, sampling `flow`) → KSampler (`{{seed}}`, 8 steps, cfg 1, `res_multistep`, `simple`, denoise 1). CLIPLoader `qwen_3_4b` (`lumina2`) → CLIPTextEncode `{{prompt}}`; ConditioningZeroOut → negative. EmptySD3LatentImage `{{width}}`x`{{height}}`x`{{count}}`. VAEDecode `ae` → SaveImage.
- **Placeholders:** prompt, seed, width, height, count. **Deviations:** none.
- Size: the default `aspectSize` canvas (about 1 MP, multiples of 16) fits Z-Image Turbo, which Tongyi runs at 1024x1024; `EmptySD3LatentImage` steps by 16. No `sizes` needed. [Verified: HF card example, `nodes_sd3.py` line 47]
- Z-Image Turbo is still the newest Z-Image text to image model (Z-Image base 2026-01-23 is the undistilled parent; Z-Image-Edit is not released). [Verified: HF API `author=Tongyi-MAI`]
- License Apache-2.0. "Fits within 16GB VRAM". [Verified: HF card, Comfy docs]

**Catalog entry** (`src/lib/catalog.js`), and `catalog: 'comfy-z-image-turbo'` on the `z-image-turbo` row in `tools.js`:

```js
{ id: 'comfy-z-image-turbo', kind: 'image', provider: 'comfy', name: 'Z-Image Turbo', note: 'Open weights from Alibaba Tongyi. On Comfy Cloud or a Pod.', workflow: 'z_image' },
```

No `pod: true`: every file is on Cloud, and `pod-checks.mjs` requires the flag to match the files. [Verified: `scripts/pod-checks.mjs` lines 730 to 733]

---

## 5. `hidream` (HiDream-O1-Image)

- **Template:** `templates/image_hidream_o1.json` (`e7cd011d4d`, 2026-09-28), text to image path (the template's "Switch to Image Edit" off, prompt refine off). [Verified]
- **Nodes:** CheckpointLoaderSimple `hidream_o1_image_bf16` (MODEL, CLIP, VAE; the CLIP is a tokenizer and the VAE a pixel-space pass-through) → ModelNoiseScale 8 → HiDreamO1PatchSeamSmoothing (0.8, 1.0, `single_shift`, `ramp_2_4`, `median`, 1.0) → SamplerCustom (add noise, `{{seed}}`, cfg 5). BasicScheduler (`normal`, 40 steps, denoise 1) on the ModelNoiseScale model, as in the template. KSamplerSelect `dpmpp_2m_sde_gpu`. CLIPTextEncode `{{prompt}}` and `""`. EmptyHiDreamO1LatentImage `{{width}}`x`{{height}}`x`{{count}}`. VAEDecode → SaveImage. [Verified: template widgets; `comfy/supported_models.py` class HiDreamO1]
- **Placeholders:** prompt, seed, width, height, count. **Deviations:** none from the template. HiDream's own script uses 50 steps; the template uses 40. [Verified: HF card `--model_type full`: 50 steps, guidance 5.0, shift 3.0]
- Full, not Dev: Dev is guidance-distilled (28 steps, cfg 1) but scores far lower (Artificial Analysis 808 against 973 for full, per the lineup note). [Verified: template `image_hidream_o1_dev.json`] [Inference for the pick]
- **Canvas:** "The model was trained at ~4 megapixels; lower resolutions go off-distribution and quality regresses noticeably." Trained sizes include 2048x2048, 2560x1440, 1440x2560, 1792x2304. The default `aspectSize` (about 1 MP) would hurt quality, so the catalog entry must set `sizes`. [Verified: `EmptyHiDreamO1LatentImage` description, `nodes_hidream_o1.py` line 18]
- Cost: 40 steps x 2 (CFG) at 4 MP, plus 2 to 4 extra passes in the last 20% of steps for seam smoothing; expect tens of seconds to minutes per image on a 24 GB card, and keep `{{count}}` low. [Inference]
- License MIT. [Verified: HF API]

**Catalog entry**, and `catalog: 'comfy-hidream-o1'` on the `hidream-o1` row in `tools.js`:

```js
{ id: 'comfy-hidream-o1', kind: 'image', provider: 'comfy', name: 'HiDream-O1', note: 'Open weights from HiDream. On Comfy Cloud or a Pod.', workflow: 'hidream',
  sizes: { '16:9': [2560, 1440], '9:16': [1440, 2560], '1:1': [2048, 2048], '4:5': [1792, 2304] } },
```

All four are trained sizes and multiples of 32. 1792x2304 is 7:9, the trained size nearest 4:5. No `pod: true`.

---

## 6. Files

New files (in `files.json`; the Qwen-Image 2.1 files and `qwen3vl_4b_bf16` are already in `MODEL_FILES`). All repos are ungated. [Verified: HF API `gated: false`]

| File | Folder | Repo / path | Bytes | sha256 | On Cloud (same name) | License |
|---|---|---|---|---|---|---|
| `krea2_turbo_fp8_scaled.safetensors` | diffusion_models | Comfy-Org/Krea-2 / `diffusion_models/` | 13,141,730,784 | `eb4dd8c6…502f1` | yes | Krea 2 Community |
| `krea2_raw_fp8_scaled.safetensors` | diffusion_models | Comfy-Org/Krea-2 / `diffusion_models/` | 13,141,730,784 | `48cd5d6c…54cd61` | yes | Krea 2 Community |
| `qwen_image_vae.safetensors` | vae | Comfy-Org/Krea-2 / `vae/` (same bytes in Comfy-Org/Qwen-Image_ComfyUI) | 253,806,246 | `a70580f0…23d1f` | yes | Apache-2.0 (tag of Comfy-Org/Qwen-Image_ComfyUI) |
| `z_image_turbo_bf16.safetensors` | diffusion_models | Comfy-Org/z_image_turbo / `split_files/diffusion_models/` | 12,309,866,400 | `24076130…574a6` | yes | Apache-2.0 |
| `qwen_3_4b.safetensors` | text_encoders | Comfy-Org/z_image_turbo / `split_files/text_encoders/` | 8,044,982,048 | `6c671498…edfc5a` | yes | Apache-2.0 |
| `ae.safetensors` | vae | Comfy-Org/z_image_turbo / `split_files/vae/` (same bytes in Comfy-Org/Lumina_Image_2.0_Repackaged) | 335,304,388 | `afc8e282…29e38` | yes | Apache-2.0 (tag of Comfy-Org/z_image_turbo) |
| `hidream_o1_image_bf16.safetensors` | checkpoints | Comfy-Org/HiDream-O1-Image / `checkpoints/` | 16,365,209,824 | `0520134a…ff1aa` | yes | MIT |
| `birefnet.safetensors` (fallback only) | background_removal | Comfy-Org/BiRefNet / `background_removal/` | 444,473,596 | `9ab37426…6a154` | yes | MIT |

Full sha256 values are in `files.json`. Cloud has each name in the folder the graph loads it from. [Verified: Cloud listing 2026-10-19] For `qwen_image_vae` and `ae`, Cloud's copies are probably the Comfy-Org repacks named above. [Inference]

Smaller options, if a 24 GB Pod gets tight: `krea2_turbo_int8_convrot` (13.49 GB, the int8 template), `z_image_turbo_int8_convrot` (6.20 GB), `hidream_o1_image_fp8_scaled` (8.07 GB). All are on Cloud. [Verified: HF tree, Cloud listing]

## 7. All changes needed outside the graphs

1. `shared/modelFiles.js`: add the `files.json` entries. Add `loaders.json` to `LOADERS` only if the BiRefNet fallback ships.
2. `public/workflows/`: copy `qwen_image.json` (or alias the shipped `qwen_image21_t2i`), `qwen_image_ref.json`, `qwen_image_logo.json`, `krea2_t2i.json`, `z_image.json`, `hidream.json`; refresh `src/lib/formats/schemas.js` (`format-check.mjs` compares placeholders).
3. `jobsx.js` line 7 and `looks.js` lines 52, 59, 149: `imageWorkflow: 'qwen_image_ref'`.
4. Shape `params.aspect` must become the run's aspect (runner and validator), for the looks, banner and design-graphic.
5. Qwen sizes for Qwen format steps, plus a 21:9 size for the banner's Leaderboard option.
6. Banner and design-graphic: give `brand` a slot (`{brand}` in the prompt at least).
7. `logo`: drop "on a plain white background", `runsOn: 'Qwen-Image 2.1'`.
8. `ai-human`: `runsOn: 'Krea 2 Turbo'` (or ship the Raw graph under `krea2_t2i`).
9. `catalog.js`: the `comfy-z-image-turbo` and `comfy-hidream-o1` entries above; `tools.js`: their `catalog` keys.

## 8. Licenses (review deferred)

- Qwen-Image 2.1 (and Turbo): Qwen Research License, non-commercial. [Verified: earlier note `newest-image-models.md`; license unchanged on the HF card]
- Krea 2 Raw and Turbo: Krea 2 Community License (commercial under US$1M revenue, content filtering required).
- Z-Image Turbo: Apache-2.0. HiDream-O1-Image: MIT. BiRefNet: MIT.

## 9. Method

- Templates read in UI format and converted by hand; Krea, Qwen and Z-Image API key names cross-checked with the official `benchmarks/*.json` API graphs.
- Each graph was checked by `tools/check.py` (scratchpad) against schemas transcribed from the pinned ComfyUI source, then filled with the repo's `comfyVars` (`tools/fill-check.mjs`), then run through the repo's `validateFormat` (`tools/validate-sim.mjs`). Details in `check.md`.
- The scratchpad also holds the saved sources: ComfyUI files at the pinned commit, the templates, the HF trees and the Cloud listings.
