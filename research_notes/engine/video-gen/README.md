# Video generation graphs (family `video-gen`)

Research date: 2026-10-19. Scope: the graphs that the `h3_t2v`, `h3_flf2v`, `h3_i2v_audio`, `h3_extend`, `h3_ref2v`, `h3_loop`, `h3_bullet_time`, `h3_product_ad`, `h3_truck_ad`, `h3_draw`, `ltx25_multishot` and `cinema_shot` formats name, the Wan 2.2 row of `openModels` (`wan22_i2v`), and a review of the camera and effect presets that run on `h3_i2v` and `ltx_i2v`.

Tags: **[Verified: source]** means I read it in a primary source on this date. **[Inference]** means my conclusion. Nothing here was run on a GPU, no weights were downloaded and no keys were used. Graph validity was checked statically against the ComfyUI source at the pinned commit (see `check.md`).

Sources used:

| Short name | Where |
|---|---|
| ComfyUI source | `comfyanonymous/ComfyUI` at `45bf90d1c91eecd782643346dcfb73cb0017667f` (v0.41.1), the full tree read from the GitHub archive of that commit |
| Templates | `Comfy-Org/workflow_templates` at `59a3b48b` (main, 2026-10-18): `video_minimax_h3_{t2v,i2v,r2v,multiframe_reference,fun_controlnet_union,i2v_continuation}`, `video_ltx2_5_{t2v,i2v}`, `video_wan2_2_14B_{t2v,i2v,flf2v}`, `image_qwen_image_2_1_turbo_image_edit`, `templates/index.json` |
| Comfy docs | `docs.comfy.org/tutorials/video/minimax/minimax-h3`, `-native`, `-multiframe`, `-fun-controlnet`, `-prompt-guide`; `.../ltx/ltx-2-5`; `.../wan/wan2_2` |
| Cloud files | `cloud.comfy.org/api/experiment/models/<folder>`, read 2026-10-19 13:03 UTC; `api/system_stats` says ComfyUI v0.41.1, cloud v0.480.0 |
| HF API | `huggingface.co/api/models/<repo>` and `/tree/main?recursive=true` (sha256 = `lfs.oid`) for `Comfy-Org/MiniMax-H3`, `Comfy-Org/Wan_2.2_ComfyUI_Repackaged`, `Comfy-Org/gemma-4`, `alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0`, `Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients` |
| Model guides | `MiniMaxAI/MiniMax-H3/docs/VIDEO_PROMPT_WRITING_GUIDE_base_en.md`; `docs.ltx.io/api-documentation/implementation-guides/prompting-guide.md` |
| FreeVideo | `FlashML-org/FreeVideo` at `fcd24fb7` (v0.4.14), `freevideo_engine/comfy_nodes.py` |

## Summary

All graphs use core ComfyUI nodes only (plus FreeVideo for the one FreeVideo graph). No new custom node pack, so there is no `packs.json`. GB is the total of every file the graph loads (decimal GB). GPU is the class the main model needs, with ComfyUI offloading the rest.

| Graph | Model | LoRAs | Every file on Cloud | Packs | GPU | GB | Formats served |
|---|---|---|---|---|---|---|---|
| `h3_t2v` | MiniMax H3 ref2va (character as `<Picture 1>`) | none (20 steps) | yes | none | 32 | 42.48 | `human-video`, `animation` when a character is picked; `asmr-host` (proposed) |
| (shipped) `h3_open_t2v` | MiniMax H3 fl2va | H3 turbo 8-step | yes | none | 32 | 44.44 | `human-video`, `animation` with no character |
| `h3_flf2v` | MiniMax H3 fl2va, first and last frame | H3 turbo 8-step | yes | none | 32 | 44.44 | `first-last-frame`, `transition`, `cam-roll-transition` |
| `h3_freevideo_flf2v` | VDN-H3 on FreeVideo, FL2VA | none | no (FreeVideo is Pod-only) | FreeVideo runtime | 96 (FreeVideo rule) | 0 (FreeVideo fetches its own 52.7 GB) | same as `h3_flf2v` on a 96 GB Pod |
| `h3_i2v_audio` | MiniMax H3 fl2va, first frame, 12 steps | H3 turbo 8-step (run at 12) | yes | none | 32 | 44.44 | `asmr-classic` |
| `h3_extend` | MiniMax H3 fl2va + Add Guide (last 22 frames and their sound) | H3 turbo 8-step | yes | none | 32 | 44.44 | `extend-video` |
| `h3_ref2v` | MiniMax H3 ref2va (brand as `<Picture 1>`) | none (20 steps) | yes | none | 32 | 42.48 | `brand-video` |
| `h3_product_ad` | MiniMax H3 ref2va (product as `<Picture 1>`) | none (20 steps) | yes | none | 32 | 42.48 | `product-ad`, `chameleon`, `macro-scene`, `magic-button`, `giant-product`, `kick-ad`, `fridge-ad`, `volcano-ad`, `macroshot-product`, and the three `h3_bullet_time` formats (`packshot`, `bullet-time-scene`, `bullet-time-splash`) |
| `h3_loop` | FLUX 3 Image Klein still, then H3 fl2va with the still as first and last frame | H3 turbo 8-step | **no** (Klein DiT and upsampler) | none | 32 | 70.87 | `loop-background` |
| `h3_truck_ad` | Qwen-Image 2.1 Turbo puts the ad on a truck, then H3 fl2va animates it | H3 turbo 8-step | **no** (Qwen DiT and VAE) | none | 32 | 76.88 | `truck-ad` |
| `h3_draw` | MiniMax H3 ref2va + Add Guide + Fun ControlNet Union 2.0 inpaint | none (20 steps) | **no** (Fun 2.0 patch) | none | 32 | 47.01 | `draw-to-video` |
| `ltx25_multishot` | LTX-2.5 distilled + its Gemma 4 E2B prompt enhancer | none | yes | none | 32 | 44.90 | `multi-shot` |
| `cinema_shot` | MiniMax H3 fl2va from a start frame, cropped to the shot | H3 turbo 8-step | yes | none | 32 | 44.44 | `cinema-shot` (MiniMax H3 with a start frame) |
| `wan22_i2v` | Wan 2.2 I2V A14B, optional last frame | LightX2V I2V 4-step v1 (high, low) | yes | none | 24 | 38.03 | Wan 2.2 row of `openModels`; `cinema-shot` (Wan 2.2 with a start frame) |
| `wan22_t2v` | Wan 2.2 T2V A14B | LightX2V T2V 4-step v1.1 (high, low) | yes | none | 24 | 38.03 | `cinema-shot` (Wan 2.2, no start frame) |

Not drafted, and why:

- **`h3_bullet_time`**: it is the same graph as `h3_product_ad` (a product reference plus the format's prompt). Point the three formats at `h3_product_ad`. The only extra that a separate graph could add is the community embedding `minimaxh3_bullet_time` (`Comfy-Org/MiniMax-H3/embeddings/`, sha256 `e318b200...bcae`, used as `embedding:minimaxh3_bullet_time` in the prompt) [Verified: HF tree; docs prompt guide]. The Pod downloads only files that loader nodes name, and Cloud's `embeddings` folder does not have it, so it is left out. [Inference]
- **`human-video` / `animation` with no character**: the shipped `h3_open_t2v` already serves them.
- **`cinema-shot` on LTX-2.5**: the shipped `ltx25_t2v` and `ltx25_i2v` serve it. `LTXVImgToVideoInplace` center-crops the start frame to the canvas, so no new graph is needed [Verified: `comfy_extras/nodes_lt.py` `common_upscale(..., "center")`].
- **`cinema-shot` on H3 with no start frame**: the shipped `h3_open_t2v` serves it.

## Cross-cutting changes the app needs

These block or degrade several graphs at once. Each is a small change outside this folder.

1. **Format models have no `sizes`.** `stepModel` (`src/lib/formats/options.js`) returns no `sizes`, so `comfyVars` falls back to `videoSize` (60% of `aspectSize`): 16:9 becomes 768x448 (0.34 MP) instead of H3's native 1344x768. Give each format step the canvas of its model family, for example from the catalog row: H3 `{ '16:9': [1344, 768], '9:16': [768, 1344], '1:1': [768, 768], '4:5': [768, 960], '21:9': [1536, 672] }`, LTX-2.5 the `comfy-ltx25` sizes, Wan 2.2 `{ '16:9': [1280, 720], '9:16': [720, 1280], '1:1': [960, 960], '4:5': [768, 960] }` (or 832x480 for 480p drafts). [Verified: `options.js`, `shared/mapping.js` `comfyVars`] [Inference: the sizes; the H3 ones are `adapt_canvas` of each ratio]
2. **A choice's `params.aspect` never reaches the canvas.** `human-video`, `brand-video` (`shape`) and `loop-background` (`use`) set `params: { aspect }`, but `recipeOptions` keeps `aspect: recipe.settings.aspect` and passes `aspect` on only as a `{{aspect}}` value. `validate.js` will also flag `aspect` as an unknown placeholder. Apply `params.aspect` (and `params.duration`) to the run's aspect and duration, and drop them from the placeholder params. [Verified: `src/lib/recipes.js` `recipeOptions`; `validate.js` line 157; grep finds no other use of `params.aspect`]
3. **`aspect: 'auto'` becomes `1:1`** for Comfy in `runFormat` (`src/lib/formats/runner.js` line 79). H3's `first_frame` is stretched to the canvas, "so an off-aspect image comes out stretched" [Verified: `nodes_minimax_h3.py` `_resize(..., "disabled")`; docs native page]. The first-frame graphs here (`h3_flf2v`, `h3_i2v_audio`, `h3_extend`, `h3_draw`, `h3_freevideo_flf2v`) size the canvas from the input with core nodes, so they ignore `{{width}}`/`{{height}}`. The reference graphs (`h3_t2v`, `h3_ref2v`, `h3_product_ad`) do not stretch the reference (`ref_image_size: match` keeps its aspect), so they keep `{{width}}`/`{{height}}`; for their `auto` formats, map `auto` to the nearest supported aspect of the source picture (`options.shape` already carries its ratio) instead of `1:1`. [Inference]
4. **Placeholders the formats do not supply yet:**
   - `{{image2}}`: picked up through `slots.pictures` for `first-last-frame`, `transition` and `cam-roll-transition` (two image inputs each). No change. [Verified: `fileSlots`, `comfyVars`]
   - `{{mask}}` for `h3_draw`: a `draw` input in `motion` mode keeps its arrows in `media.<id>Strokes`, and `comfyVars` reads `mask` only from `o.mask`. Map the strokes PNG of a motion draw to `mask`, and let `validate.js` count `mask` as supplied for it (today it does so only for `draw` with `mode !== 'motion'`). The graph accepts the PNG as drawn (blue `--blue` #2f3fe8 arrows on transparent) or as white arrows on black. [Verified: `recipes.js`, `mapping.js`, `validate.js` line 147, `src/styles.css`]
   - `{{seconds}}` for `h3_extend`: add `bindings: { seconds: 'seconds' }` to the `extend-video` step. `defineFormat` does not copy a format-level `bindings` into its default step, so give the format explicit `steps` or teach `defineFormat` to copy `bindings`. [Verified: `spec.js`, `options.js` `stepOptions`]
   - Optional placeholders: `scripts/format-schemas.mjs` records every `{{...}}` in a graph, including those inside `_meta.optional` nodes. `cinema-shot` on `wan22_i2v` (one picture) would then fail with "Unmapped workflow placeholder image2". Record optional keys apart and skip them in that check. [Verified: `format-schemas.mjs`, `validate.js` lines 150-151]
   - `brand` is not in `pictureTypes`, so `brand-video` gets `{{image}}` only through the `refs` fallback in `comfyVars` (the brand's first picture). Add `brand` to `pictureTypes` to make it a slot. [Verified: `recipes.js` line 158, `mapping.js`]
5. **`model_patches` is not a Pod model folder.** `server/podBoot.js` `DIRS` lists `checkpoints diffusion_models text_encoders vae loras upscale_models latent_upscale_models clip_vision`, so `extra_model_paths.yaml` has no `model_patches` and `ModelPatchLoader` would not find the Fun ControlNet file. Add `model_patches` to `DIRS`, and add `ModelPatchLoader: { name: 'model_patches' }` to `LOADERS` (`loaders.json`). [Verified: `podBoot.js` line 53; ComfyUI `folder_paths.py` line 55, `nodes_model_patch.py` `ModelPatchLoader`]
6. **FreeVideo swaps only catalog graphs.** `podWorkflowOf` finds the catalog row by `workflow`/`imageWorkflow`, so a format graph (`h3_flf2v`, `h3_i2v_audio`, ...) never runs on FreeVideo. Formats that point at the shipped `h3_open_i2v` or `h3_open_t2v` do get the swap. To use `h3_freevideo_flf2v`, add a per-workflow map (for example `h3_flf2v` to `h3_freevideo_flf2v`). [Verified: `server/core.js` `modelOf`, `podWorkflowOf`]
7. **`21:9` is not in `aspectSize`.** `loop-background` offers "Stage screen" at `21:9`; `videoSize('21:9')` would throw. Add the aspect (H3 canvas 1536x672). [Verified: `src/lib/catalog.js` line 83]

## Shared decisions for the MiniMax H3 graphs

- **Two checkpoints.** First-frame, first-and-last-frame and continuation graphs use `minimax_h3_fl2va_pruned_int8_convrot` (already in `MODEL_FILES`). Graphs that pass a picture as an identity or product reference use `minimax_h3_ref2va_pruned_int8_convrot` (20.97 GB, on Cloud, new in `files.json`). The docs say "R2V uses `ref2va`, not the T2V/I2V `fl2va` model", and the reference conditioning is only read by the ref2va node path. [Verified: docs native page "Weights"; `nodes_minimax_h3.py`; Cloud `diffusion_models`]
- **Steps.** fl2va graphs keep the shipped turbo path: `minimax_h3_fl2v_turbo_8step_v1.0` at 1.0, `res_multistep`, `simple`, 8 steps, `BasicGuider` [Verified: templates; docs "With turbo on: 8 for T2V/I2V (and continuation)"]. ref2va graphs keep the template default, turbo off at 20 steps, because "Reference shots need more steps: reference tokens ride every step, so 4-step turbo can barely apply references (pose/face drift). For tight reference match, keep turbo off" [Verified: docs overview]. The 4-step file `minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16` (1.96 GB, sha256 `5b9ab5ad...b84c`) is on Cloud if speed matters more [Verified: HF tree, Cloud `loras`].
- **Files.** Video VAE `minimax_h3_video_vae_fp16`, not the template's int8 VAE, because Cloud lists only the fp16 one (same choice as the shipped graphs). [Verified: Cloud `vae`]
- **Length.** The graphs compute frames from `{{duration}}` with the templates' own expression `max(5, round(a * 24)) + (5 - (max(5, round(a * 24)) % 17)) % 17`, so 5 s is 124 frames, 8 s is 192 and 10 s is 243. The shipped graphs pass `{{frames}}` (duration * 24 + 1), which the node snaps up (8 s becomes 209 frames, 8.7 s). [Verified: template node 131; `align_frame_count`] [Inference: the template math keeps 8 s at 8.0 s]
- **Canvas from the input.** For first-frame graphs the canvas is H3's own `adapt_canvas` (768 px short edge, area cap 768x1344, multiples of 32) written as two `ComfyMathExpression` nodes on `GetImageSize`. Checked against `adapt_canvas` for 16:9, 9:16, 1:1, 4:5, 21:9, 3:2, 4:3 and phone photo sizes: identical. [Verified: `nodes_minimax_h3.py` `adapt_canvas`; `nodes_math.py` function list includes `sqrt`, `min`, `max`, `round`] [Inference: the computed match]
- **Prompt alignment lines.** The H3 text encoder sees fl2va pictures as `<Picture 1>: <vision> [<Picture 2>: <vision>] <prompt>`, and ref2va references the same way [Verified: `comfy/text_encoders/minimax.py`]. The official guide says I2VA "always uses" `For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.` and FL2VA "always uses" the "How the reference pictures align with the target video" line [Verified: H3 base prompt guide section 2.1]. The first-frame graphs put that line before `{{prompt}}`; the reference graphs put a one-line role for `<Picture 1>` there, as the Comfy R2V templates do. This is a deviation from the shipped `h3_open_i2v`, which passes `{{prompt}}` alone. [Inference]
- **Licence.** MiniMax H3 Community License: the territory excludes the US, EU, UK and South Korea; Comfy Cloud generations include commercial rights. The Fun ControlNet 2.0 patch carries the same licence. [Verified: earlier lineup note; HF card of `alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0`] Licence review is deferred per project memory.

## Per graph

### `h3_t2v` (a person or character from a saved picture)

- **Use:** `human-video` and `animation` set `workflow: 'h3_open_t2v'` (shipped, no character) and `imageWorkflow: 'h3_t2v'` (this graph, character picked). `spec.js`, `stepModel` and `providers.run` already pick `imageWorkflow` when `{{image}}` is set. [Verified: `spec.js`, `options.js`, `src/lib/providers.js` lines 69-71]
- **Template:** `video_minimax_h3_r2v` (2026-08-02): `MiniMaxH3ReferenceToVideo` with `vae`, `audio_vae`, `ref_image_size: match`, `ref_images.ref_image_0`, `BasicScheduler simple 20`, `res_multistep`, `BasicGuider`, `VAEDecode` + `VAEDecodeAudio`, `CreateVideo` 24 fps. [Verified]
- **Placeholders:** `{{image}}` (the character's first picture), `{{prompt}}`, `{{width}}`, `{{height}}`, `{{duration}}`, `{{seed}}`.
- **Prompt:** the graph prefixes `<Picture 1> is the main character. Keep the same face, hair, body and outfit as <Picture 1> in every shot.` The formats need no prompt change.
- **Deviations:** fp16 video VAE (Cloud). Template math for the length instead of `{{frames}}`.
- **Also fits `asmr-host`:** that format turns the person in a photo into a host in a new studio set, so the photo is an identity reference, not a first frame. Point it at `h3_t2v` (it keeps 9:16 and runs 20 steps, which also helps the whispered audio). [Inference]
- **FreeVideo:** its Ref2VA is "Experimental ... VDN is not reference-trained", so keep stock H3 on every Pod. [Verified: FreeVideo `comfy_nodes.py` `references` tooltip]

### `h3_flf2v` (first and last frame)

- **Template:** `video_minimax_h3_i2v` subgraph "Image to Video (MiniMax H3)": `MiniMaxH3ImageToVideo` with `first_frame` and `last_frame`, turbo 8 steps. [Verified]
- **Nodes:** `LoadImage` `{{image}}` (first) and `{{image2}}` (last); canvas from the first picture; prompt = FL2VA alignment line (`... Picture 2 (from Shot 1) aligns with the {{duration}}-second mark ...`) + `{{prompt}}`.
- **Behaviour:** the node stretches `first_frame` to the canvas and center-crops `last_frame` [Verified: node source comments "plain stretch" and "aspect-preserving cover-crop"]. With the canvas taken from the first picture, the first frame keeps its shape.
- **Format change:** `transition` uses 3 s, which is 73 frames. The node's tooltip gives "trained range is ~124-362". Raise it to 5 s, or accept the risk. [Verified: node tooltip] [Inference]
- **FreeVideo:** supported. `FreeVideoGenerate` takes `first` ("Center-cropped to the selected canvas") and `last` ("With first frame enables FL2VA"). `h3_freevideo_flf2v.json` is that graph (canvas from the first picture, `{{duration}}` in seconds, the shipped Light quality: two passes, 8 + 3 steps, 2x). It needs change 6 above to be picked. [Verified: `comfy_nodes.py` input tooltips; shipped `h3_freevideo_i2v.json`]

### `h3_i2v_audio` (photo to video with native sound)

- **Template:** `video_minimax_h3_i2v`, turbo 8-step LoRA, but run at **12 steps**: "Audio converges later than video in the joint denoise. Speech and timbre need **12+** steps; at **8** steps audio is often the weak link." [Verified: docs overview]
- **Nodes:** as `h3_open_i2v`, plus the canvas from the photo (so `asmr-classic`'s `auto` aspect does not stretch), the I2VA alignment line, and the template length math.
- **Format change:** move `asmr-host` to `h3_t2v` (see above). With only `asmr-classic` left on this graph, its `auto` aspect is exactly what the graph serves.
- **FreeVideo:** I2VA is supported (`first`), so the shipped `h3_freevideo_i2v` serves this mode on a 96 GB Pod. FreeVideo's "High" level (one pass of 16 steps, `easycache-av`) is the closer match to a voice-first clip. [Verified: freevideo.md tiers] [Inference]

### `h3_extend` (extend a video by N seconds)

- **Approach:** the docs' own continuation recipe: `MiniMaxH3AddGuide` with "first 22 frames of a clip at frame 0 continues both streams", here the **last** 22 frames of the user's clip and their sound. The docs' other route, "chain I2V continuations from each clip's last frame", loses motion and sound continuity. [Verified: docs native page "Anchoring guides"; overview "Long videos"]
- **Nodes:** `LoadVideo {{video}}` → `Video Slice {{start}}/{{duration}}` → `GetVideoComponents`; canvas from the clip; all frames scaled to the canvas (`ImageScale` lanczos, center crop); `ImageFromBatch(-22, 22)` for the guide clip; the clip's sound padded to the clip's exact length (`EmptyAudio` + `AudioMerge add`, so a silent clip gives silence instead of no audio) and `TrimAudioDuration(-0.916667, 0.916667)` for the guide sound; `MiniMaxH3ImageToVideo` (no frames) with length `22 + seconds * 24`, snapped to 17k+5; `MiniMaxH3AddGuide(frame_idx 0, image, audio)`; turbo 8 steps; then the output joins the original frames with the new frames after the overlap (`ImageFromBatch(22, 4096)`, `BatchImagesNode`) and the original sound with the new sound after 0.916667 s (`TrimAudioDuration`, `AudioConcat`).
- **Placeholders:** `{{video}}`, `{{start}}`, `{{duration}}` (the trim), `{{seconds}}` (new), `{{prompt}}`, `{{seed}}`.
- **New frames:** 3 s adds 85 frames (3.54 s), 5 s adds 136 (5.67 s), 8 s adds 204 (8.5 s), because the total snaps up to 17k+5. [Verified: computed with the same expression]
- **Limits:**
  - The guide frames are read as 24 fps ("Reference video is read as 24fps with no metadata. Convert other frame rates to 24fps before load"), and the joined output is written at 24 fps. Have the app convert an uploaded clip to 24 fps before the run (it already bundles ffmpeg for stitching); H3 and LTX-2.5 outputs are 24 fps already. [Verified: docs native page, R2V tip 4] [Inference: the fix]
  - Every frame of the trimmed clip is decoded into RAM (about 25 MB a frame at 1080p before scaling), so cap the trim at about 15 s. [Inference]
  - A linked `None` (a silent clip's audio) reaches `AudioMerge`, which returns `audio1` then. ComfyUI passes linked outputs on as they are. [Verified: `execution.py` `get_input_data` lines 179-193; `nodes_audio.py` `AudioMerge.execute`]
- **Format change:** the `{{seconds}}` binding (change 4).
- **FreeVideo:** supported natively: `continue_from` "continue after this MP4 ... an absolute path inside ComfyUI output or input", 22 overlap frames, and `voice_reference` / `first_frame_reference`; "the saved MP4 contains only new frames". A FreeVideo version needs the uploaded clip's path on the Pod as a string placeholder (not a `LoadVideo` upload) and a join step, so it is not drafted here. [Verified: FreeVideo `comfy_nodes.py` `continue_from`, `frames` tooltips]

### `h3_ref2v` (brand film from the brand's picture)

- **Template:** `video_minimax_h3_r2v`, as `h3_t2v`. Prompt prefix: `<Picture 1> is the brand reference. Use the logo, colors and type from <Picture 1> exactly as shown.`
- **Inputs:** `{{image}}` is the brand's first picture (change 4, `brand` and `pictureTypes`). 10 s gives 243 frames, inside the trained range.
- **Option:** the node takes up to 9 reference images. A brand kit with logo, palette and type sheets could pass `image2`..`image5` as optional `ref_images.ref_image_1..4` (all optional inputs) once the Library pick gives more than its first picture. [Verified: node schema `max=9`] [Inference]
- **FreeVideo:** not used (Ref2VA experimental).

### `h3_product_ad` (product effects; also serves `h3_bullet_time`)

- **Why a reference, not a first frame:** the formats build a new scene around the product ("Build a styled scene that suits this product", "against {background}"), and the code comment in `appsx.js` says "Product effects keep the product exact by passing it to H3 as a reference." A first frame would pin the opening to the product photo. [Verified: `src/lib/formats/appsx.js` line 13] [Inference]
- **Template:** `video_minimax_h3_r2v`. Prompt prefix: `<Picture 1> is the product. Keep the exact shape, label, logo and colors of the product in <Picture 1> in every frame.`
- **Inputs:** `{{image}}` = the product photo or the `product` pick. `product-ad`'s optional `brand` is not passed as a picture (a static prefix cannot mention a picture that may be missing); put the brand name in the prompt with `{brand}` instead. [Inference]
- **Format change:** point `packshot`, `bullet-time-scene` and `bullet-time-splash` (`bulletTime` in `appsx.js`, `ads.js` line 123) at `h3_product_ad`.

### `h3_loop` (seamless looping background)

- **Approach:** FLUX 3 Image Klein makes a still (the format's `runsOn` names it); H3 fl2va uses the same still as `first_frame` and `last_frame`, so the clip returns to its opening frame; the graph drops the final frame (`GetImageSize` → `a - 1` → `ImageFromBatch`) so the loop point has no repeated frame. [Inference]
- **Nodes:** the shipped `flux3_klein_t2i` nodes unchanged (16 steps, cfg 1, euler, simple, the official upsampler `TextGenerate` with its system prompt), prompt `A still frame from this video, with no text or letters in it: {{prompt}}`, size `{{width}}`x`{{height}}`, batch 1; then H3 with the FL2VA alignment line, turbo 8 steps.
- **Deviation:** the output has **no sound**. An H3 soundtrack does not loop, and the targets (site hero, stream backdrop, stage screen) play muted. The audio VAE is not loaded (0.61 GB less). [Inference]
- **Cloud:** no. The Klein DiT and its upsampler are not on Cloud, so this graph runs on a Pod. A Cloud-capable variant could make the still with H3 itself (a 5-frame t2v pass, frame 0), at lower still quality. [Verified: `MODEL_FILES` `cloud: false`] [Inference: the variant]
- **Format change:** `21:9` (change 7) and `params.aspect` (change 2).
- **FreeVideo:** FL2VA with the same picture as `first` and `last` is supported; the Klein stage would stay core. FreeVideo saves its own MP4 before the frame drop, so the run would return two videos. [Verified: FreeVideo node is an output node] [Inference]

### `h3_truck_ad` (the ad wrapped on a truck)

- **Approach:** as `runsOn` says: Qwen-Image 2.1 Turbo makes the opening frame with the ad on the truck's side panel, then H3 i2v animates it. [Verified: `ads.js` line 157]
- **Template:** stage one follows `image_qwen_image_2_1_turbo_image_edit` (2026-10-13): `TextEncodeQwenImage21` (`images.image_1` = the ad, `vae`, `resolution` 1024, the template's "Official default"), `CFGGuider` cfg 1, `euler`, the turbo `ManualSigmas`, and its `custom_size` path (`EmptyLatentImage` `{{width}}`x`{{height}}`) because the frame must be 16:9, not the ad's shape. The prompt names the ad `<image1>`, the label the Qwen-Image 2.1 tokenizer gives the first picture. Stage two is `h3_open_i2v` with the I2VA line. [Verified: template wrapper widgets `[0, prompt, false, false, 4096, '', 1, false, 1024, 1024, 'euler', ...]`; `comfy/text_encoders/qwen_image21.py`]
- **Deviations:** the shipped bf16 Qwen files (`qwen_image_2.1_turbo_bf16`, `qwen3vl_8b_bf16`, `qwen_image_2.1_vae_bf16`, already in `MODEL_FILES`) instead of the template's int8 files and `QwenImage21Cache`, so no new download; the prompt enhancer stays off (template default).
- **Cloud:** no (Qwen DiT and VAE). Licence: the Qwen Research License is non-commercial. [Verified: earlier lineup note]
- **Risk:** H3 keeps frame 0 exact, but small text on a moving panel can warp later in the clip. [Inference]

### `h3_draw` (draw arrows, get the motion)

- **What the Fun ControlNet can and cannot do:** the patch follows Canny, Depth, HED, MLSD or Pose control video (2.0 adds Scribble, Layout and Gray) and does video inpainting, where "regions marked `1` are regenerated ... while the rest of the frame stays fixed". It has no arrow or trajectory input. [Verified: docs Fun ControlNet page; 2.0 model card] So the graph uses it for what the format promises outside the arrows ("everything unmarked stays steady") and lets the text encoder read the arrows. [Inference]
- **Nodes:**
  - photo `{{image}}` and arrows `{{mask}}` scaled to the H3 canvas of the photo;
  - stroke mask = `ImageToMask(blue)` + `ThresholdMask(0.25)` (works for the blue drawing and for white arrows on black);
  - an annotated picture = the photo with the arrows composited on it (`ImageCompositeMasked`), passed to `MiniMaxH3ReferenceToVideo` as `<Picture 1>` **without `vae`**, so "reference images ... only condition the text encoder" and the arrows never enter the video latents [Verified: node tooltip on `vae`];
  - the clean photo anchored at frame 0 with `MiniMaxH3AddGuide` (Add Guide pictures "are not visible to the text encoder") [Verified: docs multiframe tip 2];
  - Fun ControlNet Union **2.0** inpaint: `mask` = the stroke mask grown by 72 px (`GrowMask`, about 9% of the 768 px short edge), `source_video` = the photo; the patch repeats a one-frame mask and source over every frame [Verified: `MiniMaxH3FunControlPatch._fit_frames` and mask indices clamp];
  - ref2va checkpoint (the Fun template's), 20 steps, prompt prefix explaining the arrows.
- **Why 2.0 and not the template's v1 patch:** 2.0 is newer (HF 2026-09-22, Comfy-Org upload 2026-09-24), injects into 10 blocks instead of 5, and uses the `post_norm` inpaint recipe that "improves how filled regions blend with kept regions". The core loader at the pinned commit reads its `control_blocks_places` and `inpaint_masked_pixel_mode: post_norm` metadata (both present in the file header). [Verified: model card; `nodes_model_patch.py` lines 306-324; safetensors header read]
- **Tunable:** `GrowMask.expand` decides how much around each arrow may move. Too small and a large object tears at the mask edge; too large and the lock fades. To drop the lock entirely, remove nodes 45, 47 and 48 and feed model `1` to the scheduler and guider. [Inference]
- **Cloud:** no, the Fun 2.0 patch (4.53 GB) is not in Cloud's `model_patches`. Pod blocker: change 5 (`model_patches` folder). [Verified: Cloud `model_patches`]
- **Format change:** `{{mask}}` for motion draws (change 4).
- **FreeVideo:** no model patches or masks, so stock H3 only. [Verified: `FreeVideoGenerate` inputs]
- **Untested:** whether H3 reads drawn arrows on an encoder-only reference as motion directions is not documented. Test before shipping. [Inference]

### `ltx25_multishot` (one scene, several shots)

- **Approach:** LTX-2.5 multi-shot is a prompt feature ("several distinct shots joined by explicit cuts inside one prompt"), not a node. Lightricks asks for "one chronological paragraph" and "Do **not** use a shot list, numbered beats, or screenplay sluglines unless you also describe the cut in prose", and "Prefer 2–4 shots". The format's prompt has a shot list and offers up to 6 shots, so the graph adds the template's own prompt enhancer with a multi-shot system prompt that turns the request into that paragraph. [Verified: LTX prompting guide "Multi-Shot Prompts"; Comfy LTX-2.5 docs]
- **Template:** `video_ltx2_5_t2v` = the shipped `ltx25_t2v` (unchanged sampling: 8 + 3 manual sigmas, `euler_ancestral`, cfg 1/1, x2 latent upsampler) plus the template's enhancer branch: `CLIPLoader gemma4_e2b_it_int8_convrot (ltxv)` → `TextGenerateLTX2Prompt` (template values: `max_length` 600 raised to 768, sampling on, temperature 0.7, top_k 64, top_p 0.95, min_p 0.05, repetition penalty 1.15, seed 0) → `CLIPTextEncode`. The node takes a `system_prompt` that replaces its built-in one. [Verified: template nodes 380-383, 393; `nodes_textgen.py`]
- **Character:** an optional `{{image}}` goes only into the enhancer's optional `image` input, and the system prompt says the picture shows the main character and is not a frame, so every cut re-identifies the same person in text. A first-frame image would lock shot 1 to the portrait, and LTX's own guide says image-to-video "prefer[s] a single continuous take". The official `LTX-2.5-22b-IC-LoRA-Ingredients` (reference-sheet consistency) is gated and has no ungated copy I could find, so it is not used. [Verified: LTX guide; HF API `gated: auto`] [Inference: text identity is weaker than a reference LoRA]
- **Files:** `gemma4_e2b_it_int8_convrot.safetensors` (5.20 GB, `Comfy-Org/gemma-4`, Apache-2.0, not gated, on Cloud). [Verified]
- **Placeholders:** `{{prompt}}`, `{{width}}`, `{{height}}`, `{{frames}}`, `{{seed}}`, `{{image}}` (optional).
- **Format change:** consider `shots` options `[2, 3, 4]` (the guide's range). [Inference]

### `cinema_shot` (H3 from a start frame)

- **Routing:** the format picks the model with a choice, so use step `targets` instead of `params: { model }` (which would also fail validation as an unknown placeholder):
  ```js
  steps: [{ id: 'generate', provider: 'comfy', kind: 'video', targetInput: 'model', targets: {
    minimax: { workflow: 'h3_open_t2v', imageWorkflow: 'cinema_shot' },
    ltx: { workflow: 'ltx25_t2v', imageWorkflow: 'ltx25_i2v' },
    wan: { workflow: 'wan22_t2v', imageWorkflow: 'wan22_i2v' },
  } }]
  ```
  `selectedStep` merges `targets[values.model]` and keeps `imageWorkflow`. [Verified: `options.js`]
- **This graph:** `h3_open_i2v` plus `ImageScale(lanczos, {{width}}, {{height}}, crop center)` before `first_frame`, so a start frame of another shape is cropped to the 16:9 shot instead of stretched, the I2VA line and the template length math.
- **Quality:** "Draft" and "Final" ("same seed and settings") cannot be a graph placeholder without a numeric value. Let the runner consume `quality`: draft = about 0.6x the canvas (rounded to 32 for H3, 64 for LTX-2.5, 16 for Wan), final = 1x, and reuse the draft's seed for the final run (`comfyVars` draws a new random seed each run today). [Verified: `mapping.js`] [Inference]
- **FreeVideo:** t2v and i2v are supported; the swap happens only if the step points at the shipped `h3_open_*` ids or change 6 maps `cinema_shot` to `h3_freevideo_i2v`.

### `wan22_i2v` and `wan22_t2v` (Wan 2.2 14B)

- **Templates:** `video_wan2_2_14B_i2v` and `_t2v` (the "Lightning" switch path) and `video_wan2_2_14B_flf2v` for the last frame: `UNETLoader` high and low `fp8_scaled`, `LoraLoaderModelOnly` LightX2V 4-step (high and low, 1.0), `ModelSamplingSD3` shift 5, `KSamplerAdvanced` high (`add_noise enable`, 4 steps, cfg 1, euler, simple, 0→2, leftover noise on) and low (`disable`, 2→4), `CreateVideo` 16 fps, length `floor(a * 16) + 1` from `{{duration}}` (5 s = 81 frames). [Verified: template nodes 85-131 / 78-129]
- **Deviations:**
  - The templates ship with the Lightning switch off (20 steps, cfg 3.5, split 10); these graphs use the switch-on values for speed, as the shipped Bernini graphs do.
  - i2v uses `WanFirstLastFrameToVideo` with an optional `end_image` (`{{image2}}`, `_meta.optional`), so one graph covers "Image to video, first and last frame". With only a start image it builds the same mask and concat latent as `WanImageToVideo` (first latent frame kept). [Verified: `nodes_wan.py` both nodes]
  - VAE `Wan2_1_VAE_bf16` (already in `MODEL_FILES`, on Cloud) instead of the template's `wan_2.1_vae.safetensors` (a different file, sha256 `2fc39d31...`, same Wan 2.1 VAE), so no extra download. [Verified: HF tree] [Inference: same weights]
- **Canvas:** both nodes center-crop the input to `{{width}}`x`{{height}}` (multiples of 16), so `auto` gives a crop, not a stretch. Add a catalog row with Wan sizes (change 1). [Verified: `common_upscale(..., "center")`]
- **Newer LoRAs:** Cloud also lists `wan2.2_i2v_A14b_{high,low}_noise_lora_rank64_lightx2v_4step_1022` and `wan2.2_t2v_A14b_..._4step_1217`; I did not trace their Hugging Face source, so the graphs keep the template files. [Verified: Cloud `loras`]
- **Licence:** Apache-2.0 (`Comfy-Org/Wan_2.2_ComfyUI_Repackaged`). [Verified: HF API]

## Camera and effect presets: move off `h3_i2v` and `ltx_i2v`

Today: 97 formats run on `h3_i2v` (71 camera moves, 19 effects, 7 others; 95 of them `auto`, 5 s) and 143 effects on `ltx_i2v` (98 `auto`; 45 at 9:16 or 16:9, 4 to 15 s). [Verified: counted from `allFormats`]

- `h3_i2v` is Comfy's **paid MiniMax partner node** (`MinimaxHailuo03FirstLastFrameNode`, `model: "MiniMax H3"`, 768P, Comfy credits). It is not open weights, and the contest's "Open Weights Only" prize requires "no partner nodes or APIs". [Verified: `public/workflows/h3_i2v.json`; lineup note on the contest post]
- `ltx_i2v` is LTX Video 2B v0.9.5 (2025, no audio, 30 steps, cfg 3). [Verified: `public/workflows/ltx_i2v.json`]

**Recommendation: yes, move both.**

| From | To | What it needs |
|---|---|---|
| `h3_i2v` (camera, H3 effects) | `h3_open_i2v` (open fl2va, all files on Cloud) | The `auto` aspect: H3 stretches `first_frame`, and `runFormat` turns `auto` into `1:1`, so a 16:9 photo would be squeezed into a 768x768 canvas. Either size the canvas from the photo (the `h3_i2v_audio` graph is `h3_open_i2v` + canvas from the photo + the I2VA line + 12 steps; a copy with `steps` 8 suits the presets), or map `auto` to the nearest aspect (change 3) **and** add a center-crop `ImageScale` to `h3_open_i2v`. Format `sizes` (change 1). Durations are 5 s (124 frames) except one 8 s cinema format: fine. On a 96 GB Pod only the shipped id `h3_open_i2v` gets the FreeVideo swap (change 6). |
| `ltx_i2v` (effects) | `ltx25_i2v` (LTX-2.5 distilled, with sound, all files on Cloud) | `LTXVImgToVideoInplace` center-crops, so `auto` → `1:1` gives a square crop, not a stretch; mapping `auto` to the nearest aspect (change 3) keeps more of the photo. LTX sizes (multiples of 64) for format models (change 1). Durations of 4-15 s give 97-361 frames, all `8n + 1`; `LTXVEmptyLatentAudio` allows up to 1000. Rename `runsOn` (`index.js` line 76 maps it to "LTX Video 2B"). Prompts may name sounds now, since LTX-2.5 generates audio. |

[Verified: node sources and `runner.js` line 79] [Inference: the recommendation]

## Risks and open points

- None of the graphs was run. The static check covers class names, input names, link types, required inputs, combo values and optional loaders, not model behaviour.
- `h3_draw` (arrows through an encoder-only reference) and `h3_extend` (22-frame guide on the fl2va checkpoint; the multiframe template uses ref2va) follow the documented node behaviour but have no published example of this exact use. [Inference]
- The prompt-prefix lines change the text the encoder sees compared with the shipped graphs. A/B test them against plain `{{prompt}}`. [Inference]
