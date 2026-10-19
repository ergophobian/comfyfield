# Qwen edit family: Pod-ready graphs

Research date: 2026-10-19. Scope: the graph ids `qwen_edit`, `qwen_edit_try_on`, `qwen_edit_mockup`, `qwen_edit_outpaint`, `qwen_edit_style_ref`, `qwen_edit_place_product`, `qwen_edit_variants`, `qwen_character_sheet`, `qwen_multiangle`, `qwen_shots_grid`, `qwen_zoom_grid`, `qwen2511_relight`, `qwen_image_layered`, `qwen_restore`, and the `qwen-image-edit-2511` row of `openModels` in `src/lib/tools.js` (one extra graph, `qwen2511_edit`, serves that row).

Tags: **[Verified: source]** means I read it in a primary source on this date. **[Inference]** means my conclusion. No weights were downloaded, ComfyUI was not run, no keys were used.

Pinned sources:

- ComfyUI v0.41.1, commit `45bf90d1c91eecd782643346dcfb73cb0017667f` (fetched from `comfyanonymous/ComfyUI`). Comfy Cloud reports `comfyui_version` `v0.41.1` [Verified: https://cloud.comfy.org/api/system_stats].
- Comfy-Org/workflow_templates at `59a3b48bf369c5a15f29a1308bae3e279fa15505` (2026-10-18).
- Comfy Cloud model listing read 2026-10-19 about 13:20 UTC [Verified: https://cloud.comfy.org/api/experiment/models/<folder>].
- Hugging Face API tree listings for sizes and sha256 [Verified: `https://huggingface.co/api/models/<repo>/tree/main?recursive=true`].

## Summary

| Graph | Model | LoRAs | Every file on Comfy Cloud | Node packs | GPU class | Download | Formats served |
|---|---|---|---|---|---|---|---|
| `qwen_edit` | Qwen-Image 2.1 Turbo | none | **no** (DiT, VAE) | none | 24 GB | 32.44 GB | erase, replace, sketch-to-image, product-shot, signboard, meme, style-snap, hairstyle, age-progression, remove-text; also figure-box, behind-the-scenes, life-sim, game-show, photocard, outfit-vending, paint-app (these 7 should move to `qwen_edit_mockup`, see below) |
| `qwen_edit_try_on` | Qwen-Image 2.1 Turbo | none | no | none | 24 GB | 32.44 GB | try-on (ai-stylist should move to `qwen_edit`) |
| `qwen_edit_mockup` | Qwen-Image 2.1 Turbo | none | no | none | 24 GB | 32.44 GB | billboard, mural (+ the 7 fixed-aspect formats above) |
| `qwen_edit_outpaint` | Qwen-Image 2.1 Turbo | none | no | none | 24 GB | 32.44 GB | expand |
| `qwen_edit_style_ref` | Qwen-Image 2.1 Turbo | none | no | none | 24 GB | 32.44 GB | copy-style |
| `qwen_edit_place_product` | Qwen-Image 2.1 Turbo | none | no | none | 24 GB | 32.44 GB | place-product |
| `qwen_edit_variants` | Qwen-Image 2.1 Turbo | none | no | none | 24 GB (32 GB advised for 12 variants [Inference]) | 32.44 GB | ad-variants |
| `qwen_character_sheet` | Qwen-Image 2.1 Turbo | none | no | none | 24 GB | 32.44 GB | character-sheet |
| `qwen_zoom_grid` | Qwen-Image 2.1 Turbo | none | no | none | 24 GB | 32.44 GB | zooms |
| `qwen_restore` | Qwen-Image 2.1 Turbo, then SeedVR2 7B int8 | none | no (Qwen DiT, VAE) | none | 24 GB | 41.27 GB | photo-restore |
| `qwen_multiangle` | Qwen-Image-Edit 2511 int8 | fal Multiple-Angles, Lightning 4-step | **yes** | none | 24 GB | 31.28 GB | angles |
| `qwen_shots_grid` | Qwen-Image-Edit 2511 int8 | fal Multiple-Angles, Lightning 4-step | **yes** | none | 24 GB | 31.28 GB | shots |
| `qwen2511_relight` | Qwen-Image-Edit 2511 int8 | Lightning 4-step (no relight LoRA: relight is built into 2511) | **yes** | none | 24 GB | 30.98 GB | relight-photo |
| `qwen2511_edit` (new) | Qwen-Image-Edit 2511 int8 | Lightning 4-step | **yes** | none | 24 GB | 30.98 GB | `openModels` row `qwen-image-edit-2511` |
| `qwen_image_layered` | Qwen-Image-Layered fp8mixed | none | **yes** | none | 24 GB | 30.16 GB | layers |

- All 15 graphs use core ComfyUI nodes only. No `packs.json` and no `loaders.json` are needed: every loader is `UNETLoader`, `CLIPLoader`, `VAELoader` or `LoraLoaderModelOnly`, which `LOADERS` already maps.
- `files.json` adds 9 files (all `cloud: true`). The three Qwen-Image 2.1 files are already in `MODEL_FILES`. All 12 files of the family together are 93.33 GB.
- Skipped: none. Every graph id could be made with core nodes.
- Download sizes are the sum of each graph's files; files shared between graphs download once.

## 1. Model choice: Qwen-Image 2.1 or Qwen-Image-Edit 2511

Artificial Analysis image editing board, read today: **Qwen-Image-2.1 1083, Qwen-Image-2.1-Turbo 1065, Qwen Image Edit Plus 2511 990**. Board leader GPT Image 2.5 Sunburst (max) 1199. [Verified: https://artificialanalysis.ai/image/leaderboard/editing, Elo values in the page data]

| | Qwen-Image 2.1 Turbo | Qwen-Image-Edit 2511 |
|---|---|---|
| Editing Elo | 1065 (Turbo); 1083 (Base) | 990 |
| Size | 7B DiT, Qwen3-VL-8B encoder, 64-channel RGBA VAE | 20B MMDiT, Qwen2.5-VL-7B encoder |
| Native canvas | 2K (2048 x 2048 level) | about 1 MP (FluxKontextImageScale) |
| References | up to 10 (16 slots in ComfyUI), addressed as `<image1>`, `<image2>` ... | up to 3 (`image1` to `image3`) |
| Steps | 8 (fixed ManualSigmas), cfg 1 | 40 at cfg 4, or 4 at cfg 1 with Lightning |
| On Comfy Cloud | **no**: DiT and VAE missing | **yes**: `qwen_image_edit_2511_int8_convrot`, `_fp8mixed`, `_bf16`, Lightning, Multiple-Angles |
| License | Qwen Research License (non-commercial) | Apache 2.0 |

[Verified: https://huggingface.co/Qwen/Qwen-Image-2.1, https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo, https://huggingface.co/Qwen/Qwen-Image-Edit-2511, `comfy_extras/nodes_qwen.py`, Cloud listing]

Rule I applied, per graph:

- **Qwen-Image 2.1 wherever no 2511-only LoRA is needed.** The gap (1065 vs 990, 75 Elo for Turbo) is not close, so the Cloud tie-break does not apply. [Inference]
- **2511 where a 2511 LoRA gives a capability 2.1 lacks**: precise 96-pose camera control (`qwen_multiangle`, `qwen_shots_grid`).
- **2511 for relight**: Qwen says 2511 "integrates selected popular LoRAs directly into the base model ... For example, Lighting Enhancement LoRA. Realistic lighting control is now achievable out-of-the-box". No public 2511 LoRA gives better directional control (section 6.3). Neither model has a relight benchmark, so I treat relight quality as close and take the Cloud model. [Verified: Qwen-Image-Edit-2511 model card] [Inference for "close"] If tests show weak direction control, point `relight-photo` at `qwen_edit` (2.1); the prompt works unchanged.

Turbo or Base for 2.1: **Turbo**. It is 18 Elo below Base (1065 vs 1083) at 8 steps instead of 25 to 50, and its DiT `qwen_image_2.1_turbo_bf16.safetensors` is already in `MODEL_FILES` for `qwen_image21_t2i`, so the family adds no 2.1 download. [Verified: AA board; `shared/modelFiles.js`] For Base quality, swap the DiT for `qwen_image_2.1_bf16.safetensors` (14.23 GB, sha256 `89f4158d066cc33906a199fca85634f766892dd78f49b6698dabf187ac86c4bc`) and replace the ManualSigmas sampler chain with a `KSampler` (25 steps, cfg 1, euler, simple), as the base edit template does. [Verified: `image_qwen_image_2_1_image_edit.json`, HF tree of Comfy-Org/Qwen-Image-2.1]

Precision: Qwen-Image 2.1 in bf16 (as `qwen_image21_t2i`). 2511 in `int8_convrot` (20.50 GB), as the newest official 2511 templates (`image_qwen_image_edit_2511_int8`, 2026-07-10; `template_qwen_multiangle.app`, 2026-10-13); the bf16 file is 40.86 GB and would need the 96 GB class. Layered in `fp8mixed` (20.53 GB), the lower-VRAM file the template note offers; its bf16 file is 40.86 GB. [Verified: templates, HF tree] [Inference: the 8-bit files cost little quality]

## 2. Shared contract details (all Qwen-Image 2.1 graphs)

Template: `templates/image_qwen_image_2_1_turbo_image_edit.json` (index date 2026-10-13, min ComfyUI 0.39.0), subgraph "Image Edit (Qwen Image 2.1 Turbo)", with `refine_prompt` off and `custom_size` off (the template defaults). [Verified]

Node chain: `UNETLoader` (Turbo bf16) → `CFGGuider` (cfg 1) ← `TextEncodeQwenImage21` (clip, `{{prompt}}`, negative `""`, vae, `resolution`, `images.image_1` ...) · `KSamplerSelect` euler · `ManualSigmas` `1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0` · `RandomNoise` `{{seed}}` → `SamplerCustomAdvanced` → `VAEDecode` → `SaveImage`. These are the template's values. [Verified: template widgets]

- **Canvas from the photo.** `TextEncodeQwenImage21` output 2 is "Empty latent on the first reference image's size, to match with sampling as any other size shifts the edit". The graphs use it, so edits keep the source shape without `{{width}}`/`{{height}}`. [Verified: `comfy_extras/nodes_qwen.py`]
- **`resolution` 2048** (deviation: template 0, node default 1024). `resolution` is a pixel budget: 2048 gives about 4.2 MP in the photo's aspect, rounded to multiples of 32. Qwen: "both checkpoints default to the 2048 resolution level", and the Turbo card's edit example runs at 2048 x 2048. The template's 0 keeps the upload's own size, so a 12 MP phone photo would sample at 12 MP, above the trained 2K size ("Targets well above the model's 2K trained size ... lose prompt adherence"). [Verified: https://github.com/QwenLM/Qwen-Image-2.1 README, Turbo card, https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1] `qwen_edit_variants` and `qwen_restore` use 1024 (see their sections).
- **Several references.** The tokenizer writes `<image1><vision> <image2><vision> ...` in slot order, and the official edit system prompt says: "For Multi-Image Input (N >= 2), the rewritten instruction MUST use `<image1>`, `<image2>`, ... Do not use natural language references like ... 'the first image'". So multi-image format prompts should use the tags. The first image is the canvas. [Verified: `comfy/text_encoders/qwen_image21.py`; https://github.com/QwenLM/Qwen-Image-2.1/blob/main/prompt_rewrite/prompts/system_prompt_edit.txt]
- **`{{count}}`** goes to `RepeatLatentBatch.amount` (1 to 64). Reference latents repeat to the batch size (`CONDList.process_cond`), so a batch is valid. [Verified: `nodes.py`, `comfy/conds.py`]
- **Output is RGBA** (the 2.1 VAE decodes 4 channels; alpha is opaque unless the prompt asks for transparency). SaveImage writes RGBA PNG. [Verified: docs.comfy.org Qwen-Image 2.1 "Alpha channel output"]
- **Not used:** the prompt enhancer (off in the template; a 9B rewrite can "run for many minutes"), `QwenImage21Cache` (its default `auto` equals no node), and the unofficial texture-fix VAE (it "trades a little reconstruction accuracy for cleaner texture"; edits want reconstruction accuracy). [Verified: template notes, `nodes_qwen.py`, docs.comfy.org] [Inference for the VAE]

## 3. Qwen-Image 2.1 graphs

### 3.1 `qwen_edit` (17 formats)

- Nodes: as section 2, one `LoadImage` `{{image}}` into `images.image_1`, `resolution` 2048, `RepeatLatentBatch` `{{count}}`.
- Placeholders: `image`, `prompt`, `seed`, `count`.
- Formats: single-image prompts need no tags. A Library product (product-shot) is `{{image}}` (its first picture).
- **Format change (7 formats).** figure-box (4:5), behind-the-scenes (16:9), life-sim (16:9), game-show (16:9), photocard (4:5), outfit-vending (4:5) and paint-app (4:3) set a fixed aspect, but `qwen_edit` follows the photo's shape and ignores `{{width}}`/`{{height}}`. Point them at `qwen_edit_mockup`, which takes the canvas from the aspect. Also, `aspectSize` in `src/lib/catalog.js` has no `4:3`, so paint-app gets no `{{width}}`/`{{height}}` at all: add `'4:3': [1152, 864]` or change its aspect. (The format runner turns `auto` into `1:1` for Comfy; source-shaped graphs ignore that.) [Verified: `src/lib/formats/runner.js`, `src/lib/catalog.js`]

### 3.2 `qwen_edit_try_on`

- Nodes: `LoadImage` `{{image}}` (person, canvas), `{{image2}}` (garment), `{{image3}}` (second garment, `_meta.optional: "image3"`) into `images.image_1..3`. `images.*` is an Autogrow with `min=0`, so every slot is optional in ComfyUI and removing the optional loader is safe. [Verified: `comfy_api/latest/_io.py` `_expand_schema_for_dynamic`]
- Placeholders: `image`, `image2`, `image3`, `prompt`, `seed`, `count`.
- Template deviation: none beyond section 2. The docs' try-on example is "Keep the character and pose in <image1> unchanged, put this light blue denim shirt from <image2> on the character". [Verified: docs.comfy.org]
- **Format changes:** try-on prompt to tags, for example: `Dress the person in <image1> in the clothing from <image2> and any further reference image, {fit}. Match each garment's fabric, color, pattern, print and details with natural folds and lighting, and keep the face, hair, body, pose and background of <image1> exactly the same.` **ai-stylist has one photo**, so move it to `qwen_edit`: with this graph the app validator reports `Unmapped workflow placeholder image2/image3` [Verified: `validate.js` run on a copy, check.md].

### 3.3 `qwen_edit_mockup` (canvas from the aspect)

- Template path: the same subgraph with `custom_size` on (EmptyLatentImage from the Resolution Selector). [Verified: template]
- Nodes: `PrimitiveInt` `{{width}}`, `{{height}}` → two `ComfyMathExpression` (`32 * round(a * sqrt(4194304 / (a * b)) / 32)` and the same for b) → `EmptyLatentImage` (batch `{{count}}`) → sampler. The ad is `images.image_1` at `resolution` 2048.
- Canvas sizes (evaluated with simpleeval 1.0.0 and 1.0.8, as ComfyUI runs them): 16:9 → 2720 x 1536, 4:5 → 1824 x 2304, 1:1 → 2048 x 2048, 9:16 → 1536 x 2720. Qwen's own 2K presets are 2752 x 1536 (16:9) and 2048 x 2048. [Verified: math run, check.md; Qwen README]
- Why 2K and not the app's 1 MP sizes: "For output resolution, always use 2K-level resolution" (official edit system prompt). [Verified]
- Placeholders: `image`, `prompt`, `seed`, `count`, `width`, `height`.
- The template warns "keep it close to the resized image_1 size, or the edit can shift". For a mockup or a new scene the shift is the point; for a same-shape edit use `qwen_edit`. [Verified: template note] [Inference]

### 3.4 `qwen_edit_outpaint` (expand, `pad` param)

How Qwen-Image 2.1 outpaints: the official edit system prompt says "For outpainting tasks ... do NOT simply follow the input image's ratio ... infer the new ratio from the extension direction ... estimate the extended area as roughly 30%–50% additional space ... Extend all sides: keep the original ratio". The output canvas is larger and the photo is a reference. The model centers each reference on the target grid ("half a token where a reference grid has the other parity, so it centres on the target"). [Verified: `system_prompt_edit.txt`; `comfy/ldm/qwen_image21/model.py` `build_sequence`]

Nodes:

1. `GetImageSize` of the upload.
2. `ComfyMathExpression` (FLOAT): source megapixels so the extended canvas lands at the 2K level: `4.0 / (1.75 if '{{pad}}' == 'sides' else 1.75 if '{{pad}}' == 'top-bottom' else 1.69 if '{{pad}}' == 'all' else max(a, b) / min(a, b))`. The app fills `{{pad}}` inside the string, so the format's existing string param works with no change.
3. `ImageScaleToTotalPixels` (lanczos, that many megapixels, `resolution_steps` 32), so both sides are multiples of 32.
4. `GetImageSize` of the scaled photo → two `ComfyMathExpression` (INT) for the canvas: sides x1.75 width; top-bottom x1.75 height; all x1.3 each side; square → `max(a, b)` both.
5. `TextEncodeQwenImage21` with `resolution` 0 (keeps the scaled photo exactly), `EmptyLatentImage` canvas, batch `{{count}}`, Turbo sampler.

Canvas sizes for a 4000 x 3000 photo: sides 3136 x 1344, top-bottom 1792 x 2368, square 2048 x 2048, all 2368 x 1792 (all about 4.2 MP). [Verified: simpleeval run, check.md] Factors: 1.75 is +37.5% per side, inside Qwen's 30–50%; `all` x1.3 adds 69% area. [Inference]

- Placeholders: `image`, `pad`, `prompt`, `seed`, `count`.
- Deviations: no official 2.1 outpaint template exists; the graph follows the edit template plus the official system prompt's outpaint rule. I did **not** paste the original pixels back: if the model shifts or rescales the photo inside the canvas, a paste-back leaves a visible ghost. Test it; if the photo stays pixel-aligned, add `ImagePadForOutpaint` + `InvertMask` + `ImageCompositeMasked` to keep the original area exact. [Inference]
- Known limit: extending an already extreme shape gives a very long canvas (a 1080 x 1920 photo, top-bottom → 1152 x 3648). Qwen's presets stop at 16:9 / 9:16. [Inference: quality may drop there]
- Format: no change to inputs or params. The prompt already names the operation as outpainting, as the system prompt asks. The app validator reports `Unmapped workflow placeholder pad` because it counts only `step.params`, not choice-option params: see section 7.

### 3.5 `qwen_edit_style_ref` and `qwen_edit_place_product`

- Two required loaders: `{{image}}` (canvas: the photo / the scene) and `{{image2}}` (style reference / product, a Library pick gives its first picture). `resolution` 2048. The official canvas table: style transfer → the content image; compositing a subject into a scene → the scene image. [Verified: `system_prompt_edit.txt`]
- Placeholders: `image`, `image2`, `prompt`, `seed`, `count`.
- **Format changes (prompt tags):** copy-style: `Redraw <image1> in the visual style of <image2>: its medium, palette, brushwork or texture, lighting and mood. Keep the composition, subjects, poses and layout of <image1>, and do not copy any objects from <image2>. {note}`. place-product: `Place the product from <image2> ({product}) into the scene in <image1>, {placement}. ...` (rest unchanged).

### 3.6 `qwen_edit_variants`

- As `qwen_edit`, with `resolution` 1024 (deviation, about 1 MP per variant) because the batch is up to 12: 12 images at 4 MP is about 196k image tokens per step. [Inference]
- Placeholders: `image`, `prompt`, `seed`, `count`.
- **Format changes:** the `variants` count input only fills prompt text today, and `count` stays 1 (`recipeOptions` returns `count: 1`). Add a step binding so the graph gets it: `steps: [{ id: 'generate', provider: 'comfy', workflow: 'qwen_edit_variants', bindings: { count: 'variants' } }]` (`comfyVars` spreads `fields` after `count`). Each image in the batch reads the same prompt, so reword it to one variant per image: `Make a new variant of this ad: {change}. Keep the product exactly as it is and all text legible.` As written ("Make 4 variants of this ad"), each image may draw several ads. [Verified: `src/lib/recipes.js`, `shared/mapping.js`] [Inference for the prompt effect]
- Note: variety comes only from the seed per batch item; a distilled model can vary less between seeds. A prompt writer that gives each variant its own instruction would need N runs. [Inference]

### 3.7 `qwen_character_sheet`

- Choice: **Qwen-Image 2.1, not 2511** (the format says 2511). A sheet is a new multi-panel composition from one reference; 2.1 ranks 75 Elo higher, renders natively at 2K and Qwen shows "Storyboard generated from a three-view character reference". The official system prompt has a rule for "Three-view drawings and multi-grid generation". The Multiple-Angles LoRA cannot draw the expression row. [Verified: Qwen-Image-2.1 README showcase, system prompt] [Inference]
- Graph: identical to `qwen_edit_mockup` (canvas from `{{width}}`/`{{height}}` at the 2K level; 16:9 → 2720 x 1536).
- Placeholders: `image`, `prompt`, `seed`, `count`, `width`, `height`.
- **Format change:** `runsOn: 'Qwen-Image 2.1'`.

### 3.8 `qwen_zoom_grid`

- One pass of the edit template on the photo's canvas at `resolution` 2048. A 3x3 sheet of panels in the photo's aspect has the photo's aspect, which the official system prompt states for grids ("3×3 grid of square panels → 1:1"; combined ratio = panel W x columns : panel H x rows). [Verified: system prompt]
- Why one pass and not nine edits: the format's prompt is one sheet, a single pass keeps light and style consistent across panels, and the pull-backs are outpaints the grid can invent. Each panel is about 680 px wide on a 2048 canvas, enough for "pick and upscale". [Inference] Alternative not used: `Qwen-Image-Edit-2511-Zoom-Master-8800.safetensors` (on Cloud; repo `prithivMLmods/QIE-2511-Zoom-Master`) zooms one frame at a time and does not pull back.
- Placeholders: `image`, `prompt`, `seed`, `count`.
- Format: "Start the tightest crop on this detail: {focus}" ends in a dangling phrase when `focus` is empty; reword so it reads well without it.

### 3.9 `qwen_restore` (Qwen-Image 2.1, then SeedVR2)

- Stage 1: the edit template at `resolution` 1024 (deviation, about 1 MP): the restore and colorize step works at 1 MP, and SeedVR2 then adds real detail. [Inference]
- Stage 2: `templates/utility_seedvr2_7b_int8_upscale_image.json` (core nodes, 2026-07-13): `ResizeImageMaskNode` (`scale by multiplier`, **2**, lanczos) → `SeedVR2Preprocess` → `VAEEncodeTiled` (512, 128, 4096, 8) → `SeedVR2Conditioning` → `KSampler` (1 step, cfg 1, euler, simple, denoise 1) → `VAEDecodeTiled` → `SeedVR2PostProcessing` (`none`) → `SaveImage`. Deviation: multiplier 2 instead of 4, so the result is about 4 MP (the 2K level) and not 16 MP. [Verified: template widgets]
- SeedVR2 nodes are core at the pinned commit (`comfy_extras/nodes_seedvr.py`); Preprocess drops alpha and PostProcessing puts the Qwen output's alpha back, so the RGBA output needs no `SplitImageWithAlpha`. [Verified]
- Files: `seedvr2_7b_int8_convrot.safetensors` (8.33 GB) and `seedvr2_ema_vae_fp16.safetensors` (0.50 GB), Comfy-Org/SeedVR2, Apache-2.0, both on Cloud. The graph is Pod-only because of the Qwen-Image 2.1 files. [Verified]
- Placeholders: `image`, `prompt`, `seed`. Format: no change.

## 4. Qwen-Image-Edit 2511 graphs

Shared base, from `template_qwen_multiangle.app.json` (2026-10-13, min 0.40.0) and `image_qwen_image_edit_2511_int8.json` [Verified]:

`UNETLoader` `qwen_image_edit_2511_int8_convrot` → (`LoraLoaderModelOnly` Multiple-Angles 1.0, only the angle graphs) → `ModelSamplingAuraFlow` shift 3.1, `flow` → `CFGNorm` 1 → `LoraLoaderModelOnly` `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16` 1.0 → `KSampler` 4 steps, cfg 1, euler, simple, denoise 1. `CLIPLoader` `qwen_2.5_vl_7b_fp8_scaled` (`qwen_image`), `VAELoader` `qwen_image_vae`. `LoadImage` → `FluxKontextImageScale` → `VAEEncode` (latent) and `TextEncodeQwenImageEditPlus` image1; positive and empty negative each through `FluxKontextMultiReferenceLatentMethod` `index_timestep_zero`.

- Lightning is the official fast path: the 2511 templates carry a switch "Enable 4steps LoRA?" (4 steps cfg 1 on, 40 steps cfg 4 off). The multi-angle app ships it on; the plain 2511 templates ship it off. I use it in every 2511 graph. Quality mode: remove the Lightning loader, 40 steps, cfg 4. [Verified: templates]
- Canvas: FluxKontextImageScale picks the nearest Kontext resolution (about 1 MP) with a center crop. [Verified: `comfy_extras/nodes_flux.py`]

### 4.1 `qwen_multiangle`

- LoRA: `fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA`, Apache-2.0, ungated, 96 poses (8 azimuths x 4 elevations x 3 distances), prompt format `<sks> [azimuth] [elevation] [distance]`, "`<sks>` trigger is essential", strength 0.8 to 1.0 (templates use 1.0). [Verified: model card; fal's own `comfyui-workflow-multiple-angles.json` uses `<sks>` and 1.0]
- Prompt words: core node `CameraAngle` (v0.41.1, `comfy_extras/nodes_camera_angle.py`) writes exactly the LoRA's terms from numbers: 8 azimuth sectors of 45 degrees; elevation `< -15` low-angle, `< 15` eye-level, `< 45` elevated, else high-angle (range -30..60); zoom 0..10, `< 2` wide shot, `< 6` medium shot, else close-up. The official app template wires its output into the prompt. Deviation: the app template feeds it without `<sks>`; I prepend `<sks> ` with `StringConcatenate`, as the LoRA card and fal's workflow do. [Verified]
- Param mapping (ComfyMathExpression before CameraAngle, because CameraAngle validates its constants and the format's values fall outside its ranges):

| Format value | Graph math | LoRA words |
|---|---|---|
| azimuth 0 / 45 / -45 / 90 / -90 / 180 | `a % 360` → 0 / 45 / 315 / 90 / 270 / 180 | front view / front-right quarter view / front-left quarter view / right side view / left side view / back view |
| elevation 0 / 35 / -30 / 90 | `max(-30, min(60, a))` → 0 / 35 / -30 / 60 | eye-level shot / elevated shot / low-angle shot / high-angle shot |
| zoom 1.5 / 1 / 0.7 | `max(0, min(10, 10 * (a - 0.7) / 0.8))` → 10 / 3.75 / 0 | close-up / medium shot / wide shot |
| batch 1 / 12 | `a > 1` (BOOL) → ComfySwitchNode | one render / 4x3 sheet |

"Top down" (90°) becomes the LoRA's highest pose, 60°. "Same" distance is the LoRA's reference "medium shot". [Verified: all 72 single-angle combinations evaluated, check.md]

- batch 12: twelve fixed renders (the eight azimuths at eye level, medium; front low-angle medium; front-right elevated medium; front high-angle wide; front eye-level close-up), stitched 4 x 3 with `ImageStitch` (16 px white gutters). `ComfySwitchNode` inputs are `lazy=True`, so only the selected branch runs: one render costs one render. [Verified: `comfy_extras/nodes_logic.py`]
- Placeholders: `image`, `seed`, `azimuth`, `elevation`, `zoom`, `batch`.
- **Format change:** set `prompt: ''`. The graph builds the LoRA prompt, so `{{prompt}}` is not in it, and the validator rejects a prompt the graph does not take (`Workflow has no prompt placeholder`). The app also needs the validator fix in section 7 for the choice params.

### 4.2 `qwen_shots_grid`

- Nine renders with the Multiple-Angles LoRA, stitched 3 x 3 with 16 px white gutters ("thin white gutters"):

| Cell | LoRA prompt |
|---|---|
| Establishing wide | `<sks> front view elevated shot wide shot` |
| Full shot | `<sks> front view eye-level shot wide shot` |
| Medium | `<sks> front view eye-level shot medium shot` |
| Medium, angled | `<sks> front-right quarter view eye-level shot medium shot` |
| Close up | `<sks> front view eye-level shot close-up` |
| Detail close up | `<sks> front-left quarter view eye-level shot close-up` |
| Low angle | `<sks> front view low-angle shot medium shot` |
| High angle | `<sks> front view high-angle shot medium shot` |
| Over the shoulder | `<sks> back-right quarter view eye-level shot medium shot` |

- The LoRA has three distances only, so "medium close up", "extreme close up on a telling detail" and a true "over the shoulder" are approximations. [Verified: LoRA card vocabulary] [Inference for the mapping]
- Placeholders: `image`, `seed`. Output: one sheet, about 3,600 x 2,700 px for 1 MP cells. Save the nine cells too if "pick and upscale" should not crop.
- **Format change:** set `prompt: ''` (the graph has fixed prompts); optionally rewrite the blurb to the nine cells above.

### 4.3 `qwen2511_relight`

- The shared base with no extra LoRA, prompt `{{prompt}}`. Placeholders: `image`, `prompt`, `seed`.
- **Format changes:** remove `params: { brightness }` from the three brightness options (keep their `text`): the graph has no `{{brightness}}`, and the validator reports `Unknown workflow placeholder brightness`. Set `runsOn: 'Qwen-Image Edit 2511'`. "Light color: {color}" dangles when the optional color is empty; reword.
- Relight LoRAs I checked and rejected are in section 6.3.

### 4.4 `qwen2511_edit` (new, for the `openModels` row)

- `openModels` row `qwen-image-edit-2511` names `qwen_edit`, which now runs Qwen-Image 2.1. This graph is a plain 2511 edit: `{{image}}` plus optional `{{image2}}`, `{{image3}}` into `TextEncodeQwenImageEditPlus` `image2`/`image3` (optional inputs in the schema). Prompts address them as "image 1", "image 2" (the encoder labels them "Picture 1", "Picture 2"). [Verified: `nodes_qwen.py`; 2511 template prompt "in image 1 ... in image 2"]
- **Change:** point the row at `qwen2511_edit`. Optional: give the `qwen-image-2-1` row `imageWorkflow: 'qwen_edit'`, so an attached image runs the 2.1 edit.

## 5. `qwen_image_layered`

- Template: `templates/image_qwen_image_layered.json` (2025-12-22), subgraph "Image to Layers": `ImageScaleToMaxDimension` lanczos 640 ("640px is recommended") → `VAEEncode` → `ReferenceLatent` on positive and negative; `UNETLoader` → `ModelSamplingAuraFlow` shift 1; `CLIPLoader` `qwen_2.5_vl_7b_fp8_scaled` (`qwen_image`); `GetImageSize` → `EmptyQwenImageLayeredLatentImage` (layers `{{layers}}`); `KSampler` 20 steps, cfg 2.5, euler, simple; `LatentCut` (t, 1, 16384) drops the full-image frame; `LatentCutToBatch` (t, 1) → `VAEDecode` → `SaveImage`. [Verified: template; docs.comfy.org Qwen-Image-Layered]
- Deviations: fp8mixed DiT (section 1). The upstream settings are 50 steps and cfg 4 ("will at least double the generation time"); I keep the template's 20 / 2.5. The caption stays empty: "The text prompt is intended to describe the overall content of the input image ... not designed to control the semantic content of individual layers". The diffusers pipeline auto-captions an image without a prompt; ComfyUI does not. [Verified: docs, model card]
- **Output:** one `SaveImage` with a batch of `layers` RGBA images, so ComfyUI returns `layers` PNG files from one node. `runComfy` already returns every output file, so the app gets one Library item per layer. Keep them in file order: "A layer's position in the stack is ... its index in the batch"; there is "no z-index field". The docs do not say whether index 1 is the bottom. Stacking all layers recreates the image, so store the order with the items. [Verified: docs; `server/core.js` loop over `job.outputs`]
- Placeholders: `image`, `layers`, `seed`.
- **Format changes:** add `bindings: { layers: 'layers' }` (a `count` input only fills text); set `prompt: ''`.

## 6. Files and LoRAs

### 6.1 New files (`files.json`)

| File | Repo : path | Folder | GB | Cloud | sha256 |
|---|---|---|---|---|---|
| `qwen_image_edit_2511_int8_convrot.safetensors` | Comfy-Org/Qwen-Image-Edit_ComfyUI : `split_files/diffusion_models/...` | diffusion_models | 20.50 | yes | `11b5af5ac601821d73930c84846c9a158e67177356daf927ce1c8d10f3963829` |
| `qwen_2.5_vl_7b_fp8_scaled.safetensors` | Comfy-Org/Qwen-Image_ComfyUI : `split_files/text_encoders/...` | text_encoders | 9.38 | yes | `cb5636d852a0ea6a9075ab1bef496c0db7aef13c02350571e388aea959c5c0b4` |
| `qwen_image_vae.safetensors` | Comfy-Org/Qwen-Image_ComfyUI : `split_files/vae/...` | vae | 0.25 | yes | `a70580f0213e67967ee9c95f05bb400e8fb08307e017a924bf3441223e023d1f` |
| `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors` | lightx2v/Qwen-Image-Edit-2511-Lightning : root | loras | 0.85 | yes | `22226e8d05d354bb356627d428809f5afd7819399b077238a2b70a82883a904f` |
| `qwen-image-edit-2511-multiple-angles-lora.safetensors` | fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA : root | loras | 0.30 | yes | `42426ded4e25fd22879d9e198b857556445ef4ca56e8da3246d0345155bb6765` |
| `qwen_image_layered_fp8mixed.safetensors` | Comfy-Org/Qwen-Image-Layered_ComfyUI : `split_files/diffusion_models/...` | diffusion_models | 20.53 | yes | `e68c406b1bc08c97382a46dce6ed46699bc18a0f50422d97952ee4e8b63ad50a` |
| `qwen_image_layered_vae.safetensors` | Comfy-Org/Qwen-Image-Layered_ComfyUI : `split_files/vae/...` | vae | 0.25 | yes | `c5320595fc61859ccdd0282184208f7b781c983b8ce4c6bc3e7723a807d3d28d` |
| `seedvr2_7b_int8_convrot.safetensors` | Comfy-Org/SeedVR2 : `diffusion_models/...` | diffusion_models | 8.33 | yes | `5aa0d25fc9d35e449b659d0c9a5dcb22e2a4fa04032101b95a39da42b32c1be6` |
| `seedvr2_ema_vae_fp16.safetensors` | Comfy-Org/SeedVR2 : `vae/...` | vae | 0.50 | yes | `20678548f420d98d26f11442d3528f8b8c94e57ee046ef93dbb7633da8612ca1` |

The six repos are ungated and Apache-2.0. Cloud "yes" means the exact file name is in Cloud's listing for that folder; the listing does not give hashes, so byte identity on Cloud is assumed from the name. `qwen_2.5_vl_7b_fp8_scaled` has the same sha256 in Comfy-Org/HunyuanVideo_1.5_repackaged (the templates link that copy). [Verified: HF API, Cloud listing] Another family may also add the SeedVR2 files; the entries must match.

`vramGb` [Inference]: 24 for the 2511 int8 (20.50 GB) and layered fp8mixed (20.53 GB) DiTs: they fit a 24 GB card at about 1 MP, or 640 px for layered, once ComfyUI unloads the text encoder; 24 for SeedVR2 7B int8 (8.33 GB). For `qwen_edit_variants` at 12 x 1 MP, a 32 GB card is safer.

### 6.2 Licenses

Qwen-Image 2.1 / Turbo: Qwen Research License, non-commercial (Comfy-Org/Qwen-Image-2.1 lists `license: other`). Qwen-Image-Edit 2511, Qwen-Image-Layered, the Lightning LoRA, the Multiple-Angles LoRA and SeedVR2: Apache-2.0. [Verified: HF API `cardData.license`; earlier lineup notes] The team deferred license review; noted only.

### 6.3 Relight LoRAs checked and not used

| LoRA | Base | Why not | File, sha256 |
|---|---|---|---|
| lilylilith/QIE-2511-MP-AnyLight (Apache-2.0) | 2511 | Needs a Blender render of a 3D model as image 2, and a Material Preview pre-pass | `QIE-2511-AnyLight_.safetensors`, `1417a0d7c1a1e28eee877fcad37751b5e9a4749fd13de1d3fe3002635a52cd28` (Cloud lists `Qwen-Image-Edit-2511-AnyLight.safetensors`, probably this file [Inference]) |
| zooeyy/Qwen-Edit-2511_LightingRemap_Alpha0.2 (MIT) | 2511 | Needs a colored block painted at the light's edge; the author: "Not recommended for commercial final output" | `Qwen-编辑-2511_LightningRemap_Alpha0.2.safetensors`, `269691d4662c7e7ab09daa8015379ea75dcaec08ff790759a42583be44c10b71` |
| Kun1009/qwen-image-edit-2511-lora-relight (no license field) | 2511 | Portrait flash effect only, 0 downloads | `epoch-2.safetensors`, `134140ae767fa5d6cf7584d4538168f387fa6b1c3b688bb45b684fa19699902c` |
| dx8152/Qwen-Edit-2509-Multi-Angle-Lighting (Apache-2.0) | 2509 | Direction words plus a black-and-white light map as image 2; a user reports that front/back and above/below give similar light, and the author answers that the dataset is too small; a user reports it ignores light color | `多角度灯光-251121.safetensors`, `cffb85904608283d3920fee2f0e9e74af0712008fd29edb33042742f5fbce6ce` |
| dx8152/Qwen-Image-Edit-2509-Relight (Apache-2.0) | 2509 | 2511 already integrates the "Lighting Enhancement LoRA"; stacking it again is untested | Comfy repack `Qwen-Image-Edit-2509-Relight.safetensors`, `2a11c2b74ce0965abf35a8c8db52305072e970a689ca904b5a5b5a94d0aab86c` (on Cloud) |

[Verified: each model card and HF tree; HF discussions #4 and #5 on the Multi-Angle-Lighting repo] The format's `brightness` values (25/50/85) fit only the 2509 Multi-Angle-Lighting light map; that is why section 4.3 drops the param.

## 7. Changes outside the formats

1. **Validator:** `src/lib/formats/validate.js` builds `supplied` from `step.params` and `step.bindings` only, so placeholders from choice-option params are reported as `Unmapped workflow placeholder` (expand: `pad`; angles: `azimuth`, `elevation`, `zoom`, `batch`). Add every choice option's `params` keys to `supplied`. With that change and the format changes above, all 32 formats of this family validate. [Verified: validator run on copies, check.md]
2. `aspectSize` needs `'4:3'` for paint-app (section 3.1).
3. `openModels`: `qwen-image-edit-2511` → `qwen2511_edit`; optional `qwen-image-2-1` `imageWorkflow: 'qwen_edit'` (section 4.4).

## 8. Risks and open points

- Nothing here ran on a GPU. Speed and VRAM figures are estimates. Before shipping, run each graph once at the cheapest settings.
- Comfy Cloud lacks the Qwen-Image 2.1 DiT and VAE (it has the text encoder): 10 of the 15 graphs (and 28 of the 32 formats) are Pod-only until Cloud adds `qwen_image_2.1_turbo_bf16` and `qwen_image_2.1_vae_bf16`. [Verified: Cloud listing]
- Outpaint alignment and the 12-angle and 9-shot cell choices are untested design choices (sections 3.4, 4.1, 4.2).
- 2511 relight quality versus 2.1 is untested (section 1).
- Overlap with other families' drafts (read 2026-10-19): `research_notes/engine/i2v-chains/files.json` uses `qwen_image_edit_2511_fp8mixed.safetensors` (20.53 GB) where this family uses `qwen_image_edit_2511_int8_convrot.safetensors` (20.50 GB); a Pod serving both downloads both. Pick one for all 2511 graphs; I suggest `int8_convrot`, the file of the newest official 2511 templates. `research_notes/engine/enhance/files.json` uses `seedvr2_3b_int8_convrot.safetensors` (3.46 GB) where `qwen_restore` uses the 7B int8 (8.33 GB, chosen on quality); switch `qwen_restore` to the 3B file if one SeedVR2 file is preferred. The shared entries (`qwen_2.5_vl_7b_fp8_scaled`, `qwen_image_vae`, the 2511 Lightning LoRA, `seedvr2_ema_vae_fp16`) have the same sha256 in all drafts.
