# i2v chains: an image edit and a video model in one ComfyUI graph

Family `i2v-chains`. Checked on 2026-10-19. Comfy Cloud model listing read at 13:08 UTC that day.

Every claim has a tag:

- **[Verified: source]**: read in a primary source today.
- **[Inference]**: my conclusion from verified facts.

Sources used:

- ComfyUI at commit `45bf90d1c91eecd782643346dcfb73cb0017667f` (`comfyui_version.py` says 0.41.1), downloaded as a tarball. Every class, input name, combo value and output index below was read there. [Verified]
- Comfy-Org/workflow_templates at commit `59a3b48bf369c5a15f29a1308bae3e279fa15505` (2026-10-18). [Verified: GitHub API]
- Comfy Cloud: `system_stats` reports `comfyui_version` v0.41.1, `cloud_version` v0.480.0, templates 0.7.64. [Verified: https://cloud.comfy.org/api/system_stats]
- Hugging Face API (`?blobs=true`) for every file: all repos are ungated, and every sha256 and size in `shared/modelFiles.js` matches. [Verified]
- ComfyField's own `fill`, `dropOptional`, `modelFilesOf`, `validateFormat` and `stepOptions` (working copy of this worktree), run on the drafts. See `check.md`. [Verified]

## Summary

| Graph | Image stage, then video stage | LoRAs | All files on Cloud | Node packs | GPU class | Download | Formats |
|---|---|---|---|---|---|---|---|
| `klein_ltx` | FLUX 3 Image Klein edit, then LTX-2.5 i2v | none | **no** (Klein DiT, upsampler) | none | 32 GB | 66.74 GB | render-3d, pixel-game, glossy-vinyl, cafe-60s, mascot, renaissance |
| `klein_h3` | FLUX 3 Image Klein edit, then MiniMax H3 i2v | H3 turbo 8-step | **no** (Klein DiT, upsampler) | none | 32 GB | 71.48 GB | open-world-hero, open-world, idol-stage |
| `qwen_ltx` | Qwen-Image 2.1 Turbo edit, then LTX-2.5 i2v | none | **no** (Qwen 2.1 DiT, VAE) | none | 32 GB | 72.14 GB | tokyo-cover, victory-card, japanese-poster, comic-story, booking-photo, social-icons (poster: see below) |
| `qwen_h3` | Qwen-Image 2.1 Turbo on a fixed canvas (photo optional), then H3 i2v | H3 turbo 8-step | **no** | none | 32 GB | 76.88 GB | invitation-video, and poster (proposed) |
| `qwen_multi_h3` | Qwen-Image 2.1 Turbo with 1 to 5 references, then H3 i2v | H3 turbo 8-step | **no** | none | 32 GB | 76.88 GB | squad-strike |
| `qwen_try_on_h3` | Qwen-Image 2.1 Turbo, garments and a character on a fixed canvas, then H3 i2v | H3 turbo 8-step | **no** | none | 32 GB | 76.88 GB | outfit-shot |
| `qwen_mockup_ltx` | Qwen-Image 2.1 Turbo mural, a second Qwen pass for the bare wall, then LTX-2.5 first and last frame | none | **no** | none | 32 GB | 71.14 GB | graffiti-ad |
| `qwen2511_ltx` (optional) | Qwen-Image-Edit-2511 with Lightning, then LTX-2.5 i2v | 2511 Lightning 4-step | **yes, all 9 files** | none | 32 GB | 70.71 GB | the six `qwen_ltx` formats, on Comfy Cloud |

- GPU class, download and "not on Cloud" come from ComfyField's `minVramOf`, `modelFilesOf` and `notOnCloud`. The class is the larger of the two models: LTX-2.5 and H3 are both 32 GB in `MODEL_FILES`; Klein and Qwen-Image 2.1 are 24 GB. [Verified: `shared/modelFiles.js`, `check.md`]
- Files the seven main graphs load are all in `MODEL_FILES` already, so `files.json` lists only the four files of the optional `qwen2511_ltx`. No new loader class or input is used, so there is no `loaders.json`. No custom node pack is used, so there is no `packs.json`. [Verified]
- Pod-only files: `flux3-image-klein-bf16.safetensors` (11.10 GB) and `qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors` (6.72 GB) for Klein; `qwen_image_2.1_turbo_bf16.safetensors` (14.23 GB) and `qwen_image_2.1_vae_bf16.safetensors` (0.68 GB) for Qwen-Image 2.1. Cloud lists no FLUX 3 DiT, no upsampler and no Qwen-Image 2.1 DiT or VAE today. [Verified: https://cloud.comfy.org/api/experiment/models/diffusion_models, `/vae`, `/text_encoders`]
- Placeholders: all graphs take `{{prompt}}` (the still), `{{motion}}` (the video), `{{image}}`, `{{seed}}`, `{{frames}}`. `qwen_h3` and `qwen_try_on_h3` also take `{{width}}`/`{{height}}`, as an aspect ratio only. `qwen_multi_h3` takes `{{image2}}` to `{{image5}}` (optional), `qwen_try_on_h3` takes `{{image2}}` to `{{image4}}` (optional). `qwen_h3` has an optional `{{image}}`. [Verified: `check.md`]
- No newer open release changes the picks: the newest repos of Qwen, black-forest-labs, Lightricks, MiniMaxAI and Comfy-Org are the ones already used, plus LTX-2.5 IC-LoRAs and `Comfy-Org/MOSS-Image` (a text-to-image model). [Verified: https://huggingface.co/api/models?author=<vendor>&sort=createdAt]

## Verdict: one graph now, two format steps later

**Ship one graph per chain now.** Reasons:

1. It runs with today's runner. A format gives the still prompt as `prompt` and the motion as `params: { motion: '...' }`; `validateFormat` accepts all 20 formats against these graphs with that one change, and rejects each one without it ("Unmapped workflow placeholder motion"), so a format stays hidden until it is done. [Verified: `check.md`, section "ComfyField checks"]
2. The graph sizes the video from the still. A split would feed the still into `ltx25_i2v.json` or `h3_open_i2v.json`, which take `{{width}}`/`{{height}}`, and the runner sends `1:1` for `aspect: 'auto'` (`if (target.provider === 'comfy' && options.aspect === 'auto') options.aspect = '1:1'`). `MiniMaxH3ImageToVideo` stretches the first frame to the canvas with no crop ("geometry anchor: plain stretch to canvas"), so a 4:5 still would become a stretched 1:1 video. [Verified: `src/lib/formats/runner.js`; `comfy_extras/nodes_minimax_h3.py` lines 145-149]
3. All seven main chains need a Pod anyway (Klein and Qwen-Image 2.1 are not on Cloud), so one graph is one Pod job: no still upload between steps and one queue entry. [Inference]
4. `graffiti-ad` needs two stills (the bare wall and the mural) for a first and last frame video. The runner gives a step one upstream image (`options.images = [unit.image]`), so this chain can only be one graph. [Verified: `runner.js`]

**Split into two format steps later, for the one-photo chains**, when the i2v graphs size themselves from `{{image}}` as these chains do. Then the split is better:

- Higgsfield's versions of these apps have an image or video type switch ("Poster: Product image; type switch", "Nano Strike: Set Generation type"). Two steps give the still for free. [Verified: `research_notes/Higgsfield feature audit/sections/03_apps.md`]
- A user can re-roll only the motion and keep a still they like. Flows rule: a model node with output does not re-run except through its own Rerun. [Verified: AGENTS.md]
- A failed video keeps the still in the Library, and the video step could go to Comfy Cloud while the image step runs on a Pod. [Inference]
- The prompts carry over: the still prompt becomes step 1's `prompt`, `params.motion` becomes step 2's `prompt`.

## Two prompts per chain

A chain needs a still prompt and a motion prompt. One shared prompt does not work well:

- The image model then reads motion it cannot show ("then it flips over", "the render resolves from wireframe"), and the video model reads a restyle instruction ("Turn the person into ...") that the first frame already shows, which invites morphing. [Inference]
- Text-heavy stills (posters, covers, cards, invitations) are rendered by the image model. Video models smear text that moves, so the motion prompt must keep the text still. [Inference]

So every graph has two placeholders: `{{prompt}}` goes to the image stage and `{{motion}}` goes to the video encoder.

- **Today:** give `motion` as a format param, `params: { motion: '...' }`. Format params become placeholders of the same name, and `comfyVars` spreads `o.params`. It is fixed text, so `{note}` and choice texts go into `prompt`. That suits these formats: the note and the choices describe the look, and the still carries the look into the video. [Verified: `spec.js` `params: format.params`; `recipes.js` `let params = { ...recipe.params }`; `mapping.js` `...o.params`]
- **If a motion must use slots later:** add a `motion` template to the step, filled like `prompt` (`recipeOptions` with `prompt: step.motion`), and add `motion` to `supplied` in `validate.js`. Not needed for these 20 formats. [Inference]
- `template()` passes `params` through `...rest`. `adBeat()` drops unknown keys, so `graffiti-ad` needs `adBeat` to accept `params` or to become an `open()` format. [Verified: `src/lib/formats/appsx.js`]
- How to write the motion: LTX-2.5 templates open with "Use the provided start image as the first frame." (first and last frame: "... and the provided end image as the final frame anchor."). H3 labels the first frame `<Picture 1>` in its token stream; its template prompt names the frame that way, says "The scene opens exactly on image 1" and ends with an "Audio:" line. Both models make sound, so each motion names the sound. [Verified: templates `video_ltx2_5_i2v`, `video_ltx2_5_flf2v`, `video_minimax_h3_i2v`; `comfy/text_encoders/minimax.py` line 175]

The proposed `prompt` and `params.motion` for all 20 formats are in "Format changes", below.

## Shared stages

### Image stage A: FLUX 3 Image Klein edit (nodes 1-14 in `klein_*`)

Template: `templates/image_flux3_klein_distilled_image_edit.json` (2026-10-15, min ComfyUI 0.41.0), flattened to API format without its UI nodes (CreateBoundingBoxes, Flux3LayoutPrompt, ComfySwitchNode, PreviewAny, ImageCompare, MarkdownNote). [Verified: template and `index.json`]

```
LoadImage({{image}}) -> ImageScaleToTotalPixels(lanczos, 1.0 MP, steps 16) -> BatchImagesNode
CLIPLoader(upsampler w4a8, flux3) -> TextGenerate(i2i system prompt, image, "...User request: {{prompt}}...") -> CLIPTextEncode(qwen3vl_4b_bf16, flux3)
  -> ConditioningZeroOut -> ReferenceMultiLatent(keep resolution, image0) -> KSampler(16, cfg 1, euler, simple) <- UNETLoader(flux3-image-klein-bf16)
  -> VAEDecode(flux2-vae) = the still (RGB)
```

Kept from the template: 16 steps, cfg 1, `euler`, `simple`, denoise 1; positive and zeroed negative through `ReferenceMultiLatent`, as the template does; TextGenerate `max_length` 3584, `sampling_mode` on, temperature 1, `top_k` 1, `top_p` 0.95, `min_p` 0, `repetition_penalty` 1.05, `presence_penalty` 0, `thinking` false, `use_default_template` true, `mtp` off. The presence penalty is 0 for edits, as BFL says ("presence penalty 1.5 for text-to-image and 0 for edits"); the template's edit widgets have 0 in that slot and its text-to-image widgets have 1.5. [Verified: template widgets against `TextGenerate.define_schema` order; https://huggingface.co/black-forest-labs/flux-3-image-klein-pup README]

Deviations:

- **One ~1 MP copy of the photo** feeds the upsampler and the reference latent, and `ReferenceMultiLatent` uses "keep resolution". The template resizes only inside `ReferenceMultiLatent` ("resize", 1 MP) and gives the upsampler the photo as loaded. The Qwen3.5 vision tower accepts up to 12,845,056 pixels, so a 12 MP phone photo becomes about 12,000 vision tokens for a 9B model. The output size is the same about 1 MP, now in multiples of 16. [Verified: `comfy_extras/nodes_edit_model.py`; `comfy/text_encoders/qwen_vl.py` `max_pixels`] [Inference for the token count]
- **System prompt** is `system_prompts.json["i2i"]` from `black-forest-labs/flux-3-image-klein-pup` with real line breaks. The template's widget holds the same text with literal `\n` escapes. [Verified: both files]
- **User message** is BFL's three-line scaffold: "Reference images follow in order (the first image, the second image, ...).", "User request: {{prompt}}", "Output the caption." The template sends the request as typed. [Verified: pup README "For an edit ... this text, three lines"] [Inference that the scaffold matches the fine-tune better]
- `sampling_mode.seed` is fixed at 0, as in the shipped `flux3_klein_t2i.json`: with `top_k` 1 the caption does not depend on it, and a re-roll reuses the cached caption. [Inference, as in `newest-image-models.md`]
- bf16 DiT and bf16 text encoder (the shipped files), not the template's int8 ones. The template says to use bf16 "With more than 24 GB of VRAM". [Verified: template MarkdownNote]

### Image stage B: Qwen-Image 2.1 Turbo edit (nodes 1-12 in `qwen_*`)

Template: `templates/image_qwen_image_2_1_turbo_image_edit.json` (2026-10-13, min ComfyUI 0.39.0). [Verified]

```
LoadImage({{image}}) -> TextEncodeQwenImage21(qwen3vl_8b_bf16, vae, resolution 1024, images.image_1..) -> CFGGuider(cfg 1) <- UNETLoader(qwen_image_2.1_turbo_bf16)
KSamplerSelect(euler), ManualSigmas(8-step Turbo), RandomNoise({{seed}}), latent = encoder output 2 (or EmptyLatentImage for a fixed canvas)
  -> SamplerCustomAdvanced -> VAEDecode(qwen_image_2.1_vae_bf16) = the still (RGBA)
```

Kept: cfg 1, `euler`, the Turbo sigmas `1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0`, negative "", prompt enhancer off (the template default), canvas from the encoder's `latent` output when the source shape stays ("custom_size off"). [Verified: template subgraph widgets]

Deviations:

- **`resolution` 1024, not the template's 0.** 0 "keeps each reference at its own size", so a 12 MP photo would be a 12 MP canvas. 1024 is "about resolution x resolution pixels, at multiples of 32" and is the node default; the template note calls 1024 the "official default". [Verified: `TextEncodeQwenImage21` tooltip and code, `comfy_extras/nodes_qwen.py` lines 123-167; template note] The single-stage draft `research_notes/engine/qwen-edit/qwen_edit.json` uses 2048 for a native 2K still; a chain keeps 1024 because its video stage works at 0.9 to 1 MP, so a 4 MP still costs about four times the image compute for no gain in the video. [Inference]
- `QwenImage21Cache` is left out: its default `auto` is what the model does without it. [Verified: node description]
- **The still is RGBA.** The 2.1 VAE head has 4 output channels (`decoder.head.2.weight` shape `[4, 144, 1, 3, 3]`). `LTXVPreprocess` encodes the frame as `rgb24`, so the LTX chains drop the alpha with `SplitImageWithAlpha` first. The H3 chains do not need it: `MiniMaxH3ImageToVideo` reads `image[..., :3]`. [Verified: safetensors header by HTTP range request; `comfy_extras/nodes_lt.py` `encode_single_frame`; `nodes_minimax_h3.py` `_resize`]
- **Fixed canvas** (`qwen_h3`, `qwen_try_on_h3`): `EmptyLatentImage` at about 1 MP in the aspect of `{{width}}`x`{{height}}`, multiples of 32, as the template's "custom_size on" path does. Only the ratio of `{{width}}`/`{{height}}` is used, because format runs get the small `videoSize` canvas (448x768 for 9:16). [Verified: template; `shared/mapping.js` `videoSize`]
- Reference images are labelled `<image1>`, `<image2>`, ... in the order the encoder gets them, counting only the images present. So prompts name images by role ("the first image", "the other images"), not by a number that an absent optional image would shift. [Verified: `comfy/text_encoders/qwen_image21.py` line 23]

### Video stage A: LTX-2.5 image to video (nodes 30-32, 60-92 in `klein_ltx`, `qwen_ltx`, `qwen2511_ltx`)

Template: `templates/video_ltx2_5_i2v.json`, as already shipped in `public/workflows/ltx25_i2v.json`: distilled int8 DiT, half-size first pass with 8 sigmas and `euler_ancestral`, x2 latent upscaler, second pass with sigmas `0.85, 0.7250, 0.4219, 0.0` and seed 42, `LTXVImgToVideoInplace` at 0.7 then 1.0, `LTXVPreprocess` 18, `VAEDecodeTiled` 512/64/64/16, audio decode, 24 fps. Prompt enhancer off, as the template's exposed switch. [Verified: template subgraph]

Changes from `ltx25_i2v.json`: the prompt is `{{motion}}`, and the canvas comes from the still, not from `{{width}}`/`{{height}}`. The first pass is `round(480 * sqrt(w / h) / 32) * 32` by `round(480 * sqrt(h / w) / 32) * 32` (at least 64, the node minimum), so the output is about 0.92 MP in multiples of 64, the same sizes ComfyField's LTX-2.5 catalog entry uses (1280x704 at 16:9, 960x960 at 1:1). `LTXVImgToVideoInplace` center-crops the still to the latent if the rounding differs. [Verified: `src/lib/catalog.js` sizes; `nodes_lt.py` lines 165-166]

The negative prompt is the template's. At `video_cfg` = `audio_cfg` = 1 the guider falls back to single CFG at 1, and ComfyUI skips the negative pass at cfg 1, so it has no effect. [Verified: `nodes_lt.py` `Guider_LTXAVDualCFG.predict_noise`; `comfy/samplers.py` line 610]

### Video stage B: LTX-2.5 first and last frame (`qwen_mockup_ltx`)

Template: `templates/video_ltx2_5_flf2v.json` (min ComfyUI 0.32.0): one full-size pass, `LTXVAddGuide` on frame 0 and frame -1 at strength 0.7, `SamplerEulerAncestral` eta 0, 8 sigmas, `denoised_output` of the sampler, `LTXVCropGuides` before decode. No upscaler, so it loads 4 LTX files. Canvas: about 0.92 MP from the mural still, multiples of 32. [Verified: template subgraph]

Deviations: `lanczos` instead of `nearest-exact` when the stills are resized to the canvas (both stills are already near that size; nearest aliases). The negative is the i2v template's short one instead of the FLF template's demo-specific list; neither is used at cfg 1. [Inference]

### Video stage C: MiniMax H3 image to video (nodes 30-32, 60-74 in `*_h3`)

Template: `templates/video_minimax_h3_i2v.json`, as already shipped in `public/workflows/h3_open_i2v.json`: int8 fl2va DiT, turbo LoRA 8-step at 1.0, `res_multistep`, `simple`, 8 steps, `BasicGuider`, fp16 video VAE, audio VAE, 24 fps. The template's exposed default is the LoRA off with 20 steps; ComfyField's shipped graph chose turbo, and these chains keep it. [Verified: template widgets `[..., false, "minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors", 1, 8]`]

Changes from `h3_open_i2v.json`: the prompt is `{{motion}}`, the first frame is the still, and the canvas follows H3's own rule from `adapt_canvas`: 768 short edge, area capped at 768x1344, multiples of 32. Because the node stretches the first frame to the canvas, the canvas must keep the still's ratio; the graph computes it from `GetImageSize` of the still. `length` stays `{{frames}}`: the node snaps it up to the 17k+5 grid (121 becomes 124 at 5 s), as in the shipped graph. [Verified: `nodes_minimax_h3.py` `adapt_canvas`, `align_frame_count`, lines 145-149]

### Sizes (computed with the graphs' own expressions)

The video sizes are the same from the Klein still and from the Qwen still for every row.

| Source photo | Klein still | Qwen still | LTX i2v video | LTX FLF video | H3 video |
|---|---|---|---|---|---|
| 4032x3024 | 1184x880 | 1184x896 | 1088x832 | 1088x832 | 1024x768 |
| 3024x4032 | 880x1184 | 896x1184 | 832x1088 | 832x1088 | 768x1024 |
| 1080x1920 | 768x1360 | 768x1376 | 704x1280 | 704x1280 | 768x1344 |
| 1920x1080 | 1360x768 | 1376x768 | 1280x704 | 1280x704 | 1344x768 |
| 1080x1350 | 912x1152 | 928x1152 | 832x1088 | 864x1056 | 768x960 |
| 1024x1024 | 1024x1024 | 1024x1024 | 960x960 | 960x960 | 768x768 |

Fixed canvas from `videoSize` at 9:16 (448x768): Qwen canvas 768x1344, H3 768x1344. At 4:5 (544x672): Qwen 928x1152, H3 768x960. The H3 column equals `adapt_canvas` for every row. [Verified: the graphs' expressions evaluated in Python, `check.md` section 6]

### GPU, memory and time

- GPU class 32 GB for every chain (the video model). ComfyUI loads the image model, samples, then frees VRAM for the video model, so the two never need to fit together. [Verified: `minVramOf` result] [Inference for the load order]
- System RAM: one run reads 66 to 77 GB of weights in sequence. ComfyUI may keep the offloaded image model in RAM. On a Pod with less RAM than that, expect paging on the first run; test on the RTX PRO 4500 class before release. [Inference]
- No measured times. Klein's own figure is 3.9 s for a 1024x1024 image on an RTX PRO 6000 with int8 files, upsampler time not stated. [Verified: `newest-image-models.md` 1.5]

## Per graph

### `klein_ltx`

- Nodes: Klein stage (1-14), LTX i2v stage (30-32, 60-92). 50 nodes. Output `comfyfield/klein_ltx`.
- Placeholders: `prompt`, `motion`, `image`, `seed`, `frames`.
- Formats: render-3d and pixel-game (`open()`, prompt has `{note}`), glossy-vinyl, cafe-60s, mascot, renaissance (`template()`, which appends ` {note}` to the prompt). Each needs the prompt split and `params.motion` (below).

### `klein_h3`

- Nodes: Klein stage (1-14), H3 stage (30-32, 60-74). 32 nodes. Output `comfyfield/klein_h3`.
- Placeholders: `prompt`, `motion`, `image`, `seed`, `frames`.
- Formats: open-world-hero (`open()`), open-world and idol-stage (`template()`).

### `qwen_ltx`

- Nodes: Qwen stage (1-12), `SplitImageWithAlpha` (13), LTX i2v stage. 48 nodes.
- Placeholders: `prompt`, `motion`, `image`, `seed`, `frames`. The canvas keeps the photo's shape.
- Formats: the six `aspect: 'auto'` ones. **poster** is `aspect: '9:16'` with a product photo of any shape, which this graph cannot give without `{{width}}`/`{{height}}`. Move poster to `qwen_h3` (fixed canvas). Its photo loader is optional there, and poster's product photo is required, so the loader is always kept; `validateFormat` accepts it (see `check.md`). Set `runsOn: 'Qwen-Image 2.1 and MiniMax H3'`. The other way is `aspect: 'auto'` on `qwen_ltx`, which makes the poster follow the photo's shape.

### `qwen_h3`

- Nodes: Qwen stage on a fixed canvas (1-14, 40-43), H3 stage. 34 nodes; 33 without the photo.
- Placeholders: `prompt`, `motion`, `image` (optional, `_meta.optional: "image"`), `width`, `height`, `seed`, `frames`.
- The optional loader links only to `TextEncodeQwenImage21.images.image_1`, an optional Autogrow slot (`min=0`). Without a photo the encoder runs as text-to-image, as `qwen_image21_t2i.json` does. [Verified: `nodes_qwen.py`; `comfy_api/latest/_io.py` `_expand_schema_for_dynamic`]
- Formats: invitation-video; poster (proposed).
- Option not taken: a first and last frame video where the details "appear", as the current prompt says, from a text-free still to the finished card. Text that forms over time is where video models fail, so the drafted path shows the card with its text from frame 0 and moves only the decorations. [Inference]

### `qwen_multi_h3`

- Nodes: Qwen stage with `images.image_1` to `image_5` (loaders 5, 15-18), H3 stage. 33 nodes; 29 with one person.
- Placeholders: `prompt`, `motion`, `image`, `image2` to `image5` (optional), `seed`, `frames`. The canvas keeps person 1's photo shape (`aspect: 'auto'`).
- Each reference is resized to about 1 MP and spliced into the sequence as a VAE latent, so five people make the DiT sequence about six times as long as a one-photo edit. Expect the image stage to be several times slower with five people. [Verified: `TextEncodeQwenImage21` code] [Inference for the cost]
- Format: squad-strike. A group walking at the camera may read better at `aspect: '16:9'`; that needs the fixed-canvas variant (as `qwen_h3`). Not changed here.

### `qwen_try_on_h3`

- Nodes: Qwen stage on a fixed canvas, loaders 5 (garment), 15-16 (garments 2 and 3, optional), 17 (saved character, optional), H3 stage. 37 nodes; 34 with one garment and no character.
- Slots follow the format's order: garment `{{image}}`, garment2 `{{image2}}`, garment3 `{{image3}}`, character `{{image4}}`. An empty optional input keeps its slot. [Verified: `fileSlots` in `src/lib/recipes.js`, run in `check.md`]
- The graph wires the character into `images.image_1`, ahead of the garments, so the person is the first image the encoder sees when there is one. The template calls image 1 "the edit target. The rest are references." [Verified: template note] [Inference that person-first suits try-on]
- Format: outfit-shot (`aspect: '9:16'`).

### `qwen_mockup_ltx`

- Nodes: Qwen pass 1 (1-13: the mural from the product), Qwen pass 2 (20-27: the same frame with the mural and the people removed, prompt fixed in the graph), LTX first and last frame (30-32, 60-87). 48 nodes.
- Placeholders: `prompt`, `motion`, `image`, `seed`, `frames`.
- Why two passes: the format wants "a time lapse of the mural being sprayed on, ending on the finished wall". An i2v video starts on the finished mural. The bare wall is the first frame, the mural is the last. [Inference]
- Format: graffiti-ad.

### `qwen2511_ltx` (optional, Comfy Cloud)

- Template: `templates/image_qwen_image_edit_2511.json` with its "Enable 4steps LoRA" path: fp8mixed DiT, `ModelSamplingAuraFlow` shift 3.1, `CFGNorm` 1, Lightning 4-step LoRA at 1, `FluxKontextImageScale`, `TextEncodeQwenImageEditPlus` positive and empty negative, `FluxKontextMultiReferenceLatentMethod` `index_timestep_zero`, `KSampler` 4 steps, cfg 1, `euler`, `simple`, latent from `VAEEncode` of the scaled photo. Then the LTX i2v stage. 51 nodes. [Verified: template subgraph]
- Every file is on Cloud under these names, so the six `qwen_ltx` formats can run on Comfy Cloud now. The cost is quality: Artificial Analysis image editing has Qwen-Image-2.1 at 1083 and Qwen Image Edit 2511 at 991. [Verified: Cloud listing] [From `Open weight model lineup/image_and_video.md`, not re-checked today]
- To use it, point those formats at `qwen2511_ltx` and set `runsOn: 'Qwen-Image-Edit-2511 and LTX-2.5'`.
- The same swap would give Cloud variants of `qwen_h3` and `qwen_mockup_ltx`, but not of `qwen_multi_h3` (5 photos) or `qwen_try_on_h3` (4 photos): `TextEncodeQwenImageEditPlus` takes at most `image1` to `image3`. Not drafted. [Verified: `nodes_qwen.py` schema]

## Format changes

Every chain format needs (1) its prompt split into a still `prompt` and a fixed `params.motion`, and (2) a schema refresh (`node scripts/format-schemas.mjs`) after the graphs are copied to `public/workflows/`. The texts below keep the current wording where it describes the still.

klein_ltx (LTX motion opener: "Use the provided start image as the first frame."):

- **render-3d** `prompt`: "Turn the main subject of this photo into a clean 3D model with smooth stylized materials, shown inside a 3D modeling viewport with a gray grid floor, a soft studio light rig and a move gizmo beside it. Keep its shape, colors and character. {note}" `motion`: "Use the provided start image as the first frame. The 3D model turns slowly on the grid while a thin wireframe overlay sweeps across it and fades, and the viewport camera eases around it a little. The interface stays still. Soft interface clicks."
- **pixel-game** `prompt`: "Turn the person in this photo into an 8-bit pixel art character with chunky pixels and a tiny palette, keeping their hair and outfit colors, standing at the start of a side scrolling level with blocks, coins and a little enemy. A retro console look. {note}" `motion`: "Use the provided start image as the first frame. The pixel character runs and jumps through the side scrolling level, bouncing on blocks, grabbing coins and hopping over the little enemy as the level scrolls past. The pixel art look stays the same. Chiptune music and coin sounds."
- **glossy-vinyl** `prompt`: "Restyle the person in this photo in a sleek high fashion outfit of glossy black vinyl, a fitted jacket with a high collar and matching wide trousers, with mirror shine highlights and tasteful runway styling, in a clean studio. Keep their face and hair." `motion`: "Use the provided start image as the first frame. They turn slowly toward the camera as studio light glides across the glossy vinyl and the highlights slide over the folds. Their face, hair and outfit stay the same. Soft studio ambience."
- **cafe-60s** `prompt`: "Place the person from this photo in a 1960s coffee shop with a chrome counter, red vinyl stools, a glowing jukebox in the corner, a checkered floor and a cup of coffee in front of them, in period hair and clothes, with warm faded film color and soft grain. Keep their face." `motion`: "Use the provided start image as the first frame. They lift the cup, sip the coffee and glance out the window as a waitress passes behind them. Warm faded film look throughout. Jukebox music and quiet cafe chatter."
- **mascot** `prompt`: "Turn the person in this photo into a big furry sports mascot costume with an oversized head that looks like a cartoon version of them, in invented team colors with a made-up crest, on the sidelines of a stadium with fans in the stands behind." `motion`: "Use the provided start image as the first frame. The mascot dances and pumps up the crowd, waving its arms, while the fans cheer and wave in the stands. Stadium crowd noise and a drum beat."
- **renaissance** `prompt`: "Turn the person in this photo into a Renaissance oil portrait in an ornate gold frame, with soft hazy light, a rich dark background, period clothing and fine cracks in the varnish. The painting hangs in a crowded museum gallery with visitors in front of it." `motion`: "Use the provided start image as the first frame. Visitors gather in front of the painting, point and take photos with their phones, and the painted figure subtly blinks and smiles. The frame and the painting stay in place. Quiet gallery murmur."

klein_h3 (H3 motion opener: "The video opens exactly on <Picture 1>."):

- **open-world-hero** `prompt`: "Redraw the person in this photo as the hero of an open world city game: a painted loading screen illustration with bold outlines, saturated sunset color and palm lined streets behind. Keep their face recognizable. {note}" `motion`: "The video opens exactly on <Picture 1>. The hero turns to the camera with a confident look as a sports car rolls up beside them. The painted illustration style holds in every frame. Audio: an engine rumble and a short synth sting."
- **open-world** `prompt`: "Turn the person in this photo into the player character of a third person open world game on a sunny city street, seen from over the shoulder with a minimap and a health bar on screen. Game engine graphics, their face, hair and outfit recognizable." `motion`: "The video opens exactly on <Picture 1>. The character sprints down the street, vaults a low wall and hops into an open top car that drives off, the camera following over the shoulder. The minimap and health bar stay fixed on screen. Audio: footsteps, an engine and city sounds."
- **idol-stage** `prompt`: "Restyle the person in this photo as a pop idol in a sparkling stage outfit, standing on a big concert stage under spotlights with a sea of light sticks in the crowd. Keep their face." `motion`: "The video opens exactly on <Picture 1>. They hit a pose, dance a short routine and wave to the crowd while spotlights sweep, confetti falls and a crane camera glides past. Audio: an upbeat pop track and a cheering crowd."

qwen_ltx:

- **tokyo-cover** `prompt`: "Turn this photo into the cover of a Japanese street fashion magazine: the person styled in layered street fashion, a bold invented masthead, stacked vertical cover lines, small badges and a barcode, bright pastel color and a crisp studio look. Keep their face." `motion`: "Use the provided start image as the first frame. The cover comes alive: the person makes a small pose change and a wink while the camera pushes in slowly. Every piece of text and graphics stays sharp and unchanged. Upbeat city pop."
- **victory-card** `prompt`: "Turn the person in this photo into the face of a royal playing card, their portrait mirrored top and bottom with ornate gold borders and corner letters. The card lies face up on green felt among stacks of poker chips as the winning card of a hand. Keep their face recognizable." `motion`: "Use the provided start image as the first frame. The card lifts off the felt, spins once in slow motion and lands face up again as the chips scatter. The card art stays the same. Chips clatter." (The current "it flips over" would end on the card's back.)
- **japanese-poster** `prompt`: "Design a Japanese style poster around the person in this photo: a striking cutout of them over flat color blocks, big vertical Japanese headline type, small English captions, halftone textures and a bold red circle. Keep their face." `motion`: "Use the provided start image as the first frame. The poster comes alive with a slow drift: the color blocks and the red circle pulse gently and the halftone shimmers, while all the type stays sharp and unchanged. A soft synth pad." (The current "the type slides into place" asks the video model to move text.)
- **comic-story** `prompt`: "Turn the person in this photo into the hero of a short comic book page told in four panels, with bold ink lines, halftone shading, caption boxes and speech bubbles with short exclamations spelled correctly. The story: {plot} Keep their face recognizable." `motion`: "Use the provided start image as the first frame. The camera glides from panel to panel across the comic page, and each panel comes to life with small movements as the camera passes. The ink lines, panel borders and lettering stay the same. Page turn and comic sound effects."
- **booking-photo** `prompt`: "Turn this photo into a playful police booking photo: the person stands against a height chart holding a placard with a made-up number and today's date, under flat, harsh light. Lighthearted, with nothing incriminating written." `motion`: "Use the provided start image as the first frame. They turn to the side for the profile shot and back to the camera with a cheeky smile as the flash pops. The placard text stays the same. Camera shutter and flash sounds."
- **social-icons** `prompt`: "Surround the person in this photo with glossy 3D icons of hearts, thumbs up, chat bubbles, play buttons, bells and stars, all generic with no real logos, floating around them with small notification counters." `motion`: "Use the provided start image as the first frame. The icons float and orbit around the person, pop with little bursts and stack up like notifications as the counters tick upward. Bright pops and chimes."

qwen_h3:

- **poster** (move to `qwen_h3`) `prompt`: "Design a vertical promo poster around the product in this photo: {style}, with the product large and exactly as it is, and the headline \"{headline}\" in big clean type, spelled exactly." `motion`: "The video opens exactly on <Picture 1>. The poster comes to life with a subtle push in, light sweeping across the type and small graphic shapes drifting. The product and the headline stay sharp and unchanged. Audio: a short upbeat music sting."
- **invitation-video** `prompt`: "A vertical {event} invitation card in {style}, with these details in clear, elegant type, spelled exactly: {details} If a photo is attached, frame it on the card as a keepsake picture." `motion`: "The video opens exactly on <Picture 1>. The decorations come alive: petals, confetti or foil shimmer drift and sparkle around the card while the camera pushes in slowly. The printed text stays perfectly still, sharp and unchanged. Audio: soft celebratory music." The photo sentence is conditional because the photo is optional and a prompt cannot branch. [Inference: test with and without a photo]

qwen_multi_h3:

- **squad-strike** `prompt`: "Turn the people in these photos into a tactical team game squad in matching armor, helmets and gear, each keeping their own face, standing together in a dusty arena. A game cinematic look with no gore. {note}" `motion`: "The video opens exactly on <Picture 1>. The squad walks toward the camera in slow motion across the dusty arena while a burst of colored smoke goes off behind them. Audio: heavy footsteps, rattling gear and a deep boom."

qwen_try_on_h3:

- **outfit-shot** option texts for `model`: new "a professional fashion model wearing the garments shown in the images"; character "the person in the first image, with the same face, hair and body, wearing the garments shown in the other images". `prompt`: "A vertical full-length fashion photo of {model}. Combine the garments into one outfit and match each garment's fabric, color, print and cut exactly. The shoot is {set}." `motion`: "The video opens exactly on <Picture 1>. The model turns, takes a step toward the camera and poses, and the fabric moves naturally with each step while the camera moves smoothly with them. The outfit, face and setting stay the same. Audio: a light fashion beat."

qwen_mockup_ltx:

- **graffiti-ad** (needs `adBeat` to pass `params`, or `open()`) `prompt`: "Paint the product from the photo as a large, colorful graffiti piece on a brick wall in a city alley, true to its shape, label and colors, with spray drips and bold outlines, in afternoon light with a few people walking past. {note}" `motion`: "Use the provided start image as the first frame and the provided end image as the final frame anchor. Time lapse: a street artist sprays the mural onto the bare brick wall, outlines first, then the color fills, highlights and drips, until it matches the finished piece, while the afternoon light shifts and people walk past. Spray can hiss and street sounds." The `adBeat` suffix "keeps its exact shape, label and colors in every frame" can stay on the still prompt.

Other changes:

- `runsOn` stays as it is for all formats except poster (if moved) and the `qwen2511_ltx` option.
- No new binding and no input change is needed. `outfit-shot` already shows `character` only `when: ['model', 'character']`, and an absent pick drops loader 17. [Verified: `check.md`]

## Considered and not used

- **LTX-2.5 Cinemagraph LoRA** (`Lightricks/LTX-2.5-22b-LoRA-Cinemagraph`, 2026-09-10): it keeps a frame still and moves one element, which suits text-heavy stills. Not used: the repo is gated ("auto"), Cloud has only the LTX-2.3 version, and its card asks for the base model at 30 steps, guidance 4 and STG, with camera and body motion out of scope; the distilled 8-step path and these motions do not match it. [Verified: HF API and README; Cloud `loras` listing]
- **H3 Ref2VA** (`minimax_h3_ref2va_pruned_int8_convrot`, on Cloud) could take the garments or the people as references and skip the still. Not used: the formats are defined as an image model then a video model, and the still is the product (see the type switch). [Verified: Cloud listing] [Inference]
- **Int8 Klein and Qwen files** (the templates' defaults) would cut the download by 9.29 GB per Klein chain (DiT 11.10 to 5.83, text encoder 8.88 to 4.86) and 15.15 GB per Qwen chain (DiT 14.23 to 7.26, text encoder 17.53 to 9.35). The video stage needs the 32 GB class anyway, and the shipped single-stage graphs use bf16, so these keep bf16. [Verified: sizes in `newest-image-models.md` 1.2 and 2.2] [Inference for the choice]

## Licences (not a blocker for now)

- FLUX 3 Image Klein: FLUX Kommunity License (non-commercial, plus commercial outputs under US$5M revenue). Qwen-Image 2.1: Qwen Research License, non-commercial only. [From `newest-image-models.md`, verified 2026-10-17]
- LTX-2.5 and the Cinemagraph LoRA: LTX-2 community license, which bars use in a product that "directly competes" with Lightricks. MiniMax H3: community licence that excludes the US, EU, UK and South Korea. [From `Open weight model lineup/image_and_video.md`]
- Qwen-Image-Edit-2511, its Lightning LoRA and the Qwen-Image VAE and text encoder repacks: Apache-2.0. [Verified: HF API `cardData.license`]

## Method

- Templates: converted by hand from the UI JSON (subgraph widget values mapped to inputs in `define_schema` order). Graphs built by a script so that node ids and links are exact; the script, the checker and the inputs are in the session scratchpad, not in the repo.
- Checks: `check.md` lists what was checked and how, with the checker's output.
- Not done: no weights downloaded, no ComfyUI run, no generation. Prompt wording, the two-pass graffiti frame and the person-first try-on order need a real run.
