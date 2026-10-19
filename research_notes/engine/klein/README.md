# FLUX 3 Image Klein graphs (klein family)

Researched 2026-10-19 for the formats that run on FLUX 3 Image Klein. Twelve API-format graphs in this folder, all on the files the shipped `public/workflows/flux3_klein_t2i.json` already loads. Nothing here has run on a GPU.

Tags: **[Verified: source]** means I read it in a primary source today. **[Inference]** is my conclusion. No weights were downloaded, no ComfyUI was run, no keys were used.

## Summary

Every graph loads the same four files, all already in `MODEL_FILES`, so `files.json` is `{}` and no `loaders.json` or `packs.json` is needed.

| Graph | Model | LoRAs | Files on Comfy Cloud | Node packs | GPU | Download | Formats |
|---|---|---|---|---|---|---|---|
| `flux_look` | FLUX 3 Image Klein distilled + BFL upsampler (w4a8) | none | TE, VAE: yes. DiT, upsampler: **no** (Pod only) | none | 24 GB | 27.04 GB | all 25: the 19 `look-*` formats without a character, and `brand-colors`, `slide-visuals`, `drawing`, `sketch`, `wallpaper`, `animal` |
| `flux_look_ref` | same | none | same | none | 24 GB | 27.04 GB | the 19 `look-*` formats with a character (`imageWorkflow`) |
| `klein_edit` | same | none | same | none | 24 GB | 27.04 GB | `restyle`, `plush-toy`, `tiny-creature`, `brick-toy`, `coloring-page`, `micro-beasts`, `cartoon-me`, `anime-me` (photo shape) |
| `klein_edit_canvas` (new) | same | none | same | none | 24 GB | 27.04 GB | `sticker`, `game-style`, `all-fine`, `profile-picture`, `portrait` (fixed aspect) |
| `klein_character` | same | none | same | none | 24 GB | 27.04 GB | `character-scene` |
| `klein_character_swap` | same | none | same | none | 24 GB | 27.04 GB | `character-swap` |
| `klein_headshot` | same | none | same | none | 24 GB | 27.04 GB | `headshot` |
| `klein_retouch` | same | none | same | none | 24 GB | 27.04 GB | `skin-retouch` |
| `klein_moodboard` | same | none | same | none | 24 GB | 27.04 GB | `moodboard` |
| `flux_character_set` | same | none | same | none | 24 GB (32 GB keeps all resident) | 27.04 GB | `influencer-post` |
| `storyboard` | same | none | same | none | 24 GB (32 GB keeps all resident) | 27.04 GB | `storyboard` without a character |
| `storyboard_ref` | same | none | same | none | 24 GB (32 GB keeps all resident) | 27.04 GB | `storyboard` with a character (`imageWorkflow`) |

Files (from `MODEL_FILES`, re-checked today):

| File | Folder | Source | sha256 | Bytes | Cloud |
|---|---|---|---|---|---|
| `flux3-image-klein-bf16.safetensors` | diffusion_models | `unsloth/flux-3-image-klein` : `model.safetensors` | `c3e9813c…` | 11,097,404,512 | no |
| `qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors` | text_encoders | `ml-resources/flux-3-image-klein-comfy` | `e5d85a74…` | 6,724,090,780 | no |
| `qwen3vl_4b_bf16.safetensors` | text_encoders | `Comfy-Org/Qwen3-VL` | `36f3ff44…` | 8,875,719,384 | yes |
| `flux2-vae.safetensors` | vae | `Comfy-Org/vae-text-encorder-for-flux-klein-4b` | `868fe7b3…` | 336,211,292 | yes |

- All four repos are ungated and their `lfs.oid` equals the `MODEL_FILES` sha256. [Verified: https://huggingface.co/api/models/<repo>/tree/main/<dir>, 2026-10-19]
- Comfy Cloud runs ComfyUI v0.41.1. Its `diffusion_models` folder has only FLUX.2 Klein files, and `text_encoders` has no FLUX 3 upsampler. It does have `qwen3vl_4b_bf16.safetensors` and `flux2-vae.safetensors`. So every graph here is Pod only. [Verified: https://cloud.comfy.org/api/system_stats and /api/experiment/models/{diffusion_models,text_encoders,vae}, 13:12 UTC]
- LoRAs: none. On Hugging Face, the only FLUX 3 Klein LoRAs are two experimental SimpleTuner aesthetics LoRAs, about 600 downloads each, and they have no task LoRA (relight, retouch, identity). [Verified: https://huggingface.co/api/models?search=flux-3-image-klein]
- License: FLUX Kommunity License for the DiT; Apache-2.0 for the upsampler and the Qwen3-VL text encoder. Not a blocker for now. [Verified: earlier note `newest-image-models.md` §1.6, upsampler README]
- GPU: the four bf16 files are 27 GB of weights. On a 24 GB card ComfyUI swaps the upsampler and the DiT out between stages, as for the shipped t2i graph. The loop graphs swap once per post or shot, so a 32 GB card runs them faster. [Inference]

## What the official templates do with references

Sources: `templates/image_flux3_klein_distilled_image_edit.json` (last changed `9afccb3`, 2026-10-17) and `image_flux3_klein_distilled_t2i.json` (last changed `369c1ed`, 2026-10-17) in Comfy-Org/workflow_templates at `59a3b48` (2026-10-18). BFL's `src/flux3/pup.py` at `bfc8889` (2026-10-17) and `black-forest-labs/flux-3-image-klein-pup` at `3f3edb52`. ComfyUI source at `45bf90d1` (v0.41.1).

1. **References go through `ReferenceMultiLatent` ("Set Reference Multi Latent"), a core node in `comfy_extras/nodes_edit_model.py`.** Its inputs:
   - `positive`
   - `negative` (optional)
   - `vae` (optional)
   - `resolution`, a DynamicCombo: `keep resolution`, or `resize` with `megapixels`. The template uses `resize`, 1.0.
   - `images.image0`, `images.image1`, ... Autogrow, every slot is `optional=True`, up to 100 slots.

   It VAE-encodes each reference, appends the list as `reference_latents` to positive and negative, and outputs `empty_latent` (the first reference latent × 0). The edit template feeds `empty_latent` to KSampler, so an edit takes its reference's shape at about 1 MP. The negative is `ConditioningZeroOut(positive)`. With no image, the node passes the conditioning through and outputs a square latent. [Verified: source and template]
2. **FLUX 3 takes references of any size.** Each one gets its own position index (`ref_ids`: -1, -2, ...). BFL's limit is 10 references (`MAX_REFERENCES = 10`). `vae.encode` crops pixels to the VAE's 16 px grid and drops alpha. [Verified: `comfy/ldm/flux3/model.py`, `comfy/sd.py` `vae_encode_crop_pixels`, `pup.py`]
3. **The upsampler must see the references. Do not skip it for edits.** The distilled edit template feeds the image to `TextGenerate.image` (through `BatchImagesNode`) with the edit system prompt. BFL: "No reference -> t2i prompt, with references -> i2i prompt", and the model "is not meant to run without a prompt upsampler in front of it, for text-to-image, editing and layout alike". [Verified: template, `pup.py` docstring, upsampler README]
4. **ComfyUI's `TextGenerate` does not add BFL's i2i user message.** BFL sends the images first, then the text "Reference images follow in order (the first image, the second image, ...).\nUser request: {instruction}\nOutput the caption." The template sends the bare request. The Qwen3.5 template in ComfyUI already puts images before the text. Every i2i call here wraps the request in BFL's three lines. [Verified: `pup.py` `I2I_SCAFFOLD`, `comfy/text_encoders/qwen35.py` `llama_template_images`]
5. **Template bug: the edit template's system prompt is escaped twice.** Its paragraph breaks are the characters `\n\n` and its quotes are `\"`. The upsampler would read backslashes. The graphs use BFL's `system_prompts.json["i2i"]` exactly. The t2i text in the shipped graph equals BFL's `t2i` exactly. [Verified: character diff of template node 48 against `system_prompts.json`]
6. **Decoding:** the template values: `sampling_mode` on, temperature 1, `top_k` 1 (greedy), `top_p` 0.95, `min_p` 0, repetition penalty 1.05, `seed` 0, `max_length` 3584, `thinking` false, `mtp` off. `presence_penalty` is 1.5 for t2i and 0 for edits. BFL uses the same presence penalties. [Verified: template widgets, `pup.py` `PRESENCE_PENALTY`]
7. **Upsampler image size.** BFL resizes references for the upsampler to at most 1 MP (one reference), 724×724 (two) or 512×512 (three to ten), in multiples of 32. ComfyUI's Qwen processor accepts up to 12.8 MP (`max_pixels=12845056`), so a phone photo would cost about 12,000 vision tokens. The graphs scale the upsampler's copy with `ImageScaleToTotalPixels` (steps 32) to BFL's budget. The DiT still gets the full reference through `ReferenceMultiLatent`. [Verified: `pup.py` `MAX_PIXELS_BY_REFS`, `comfy/text_encoders/qwen_vl.py`] [Inference for the token count]
8. **`TextGenerate` takes one IMAGE batch.** `BatchImagesNode` resizes and center-crops every image to the first one's shape. Where a crop could cut a face (character swap), the graph letterboxes with `ResizeAndPadImage` first. [Verified: `batch_images` in `nodes_post_processing.py`]

Sampler: KSampler 16 steps, cfg 1, `euler`, `simple`, denoise 1. These are the distilled edit template's KSampler values and the shipped t2i values. [Verified: template]

## Shared building blocks

- Loaders 1 to 4 are the same as in `flux3_klein_t2i.json`. The DiT and the Qwen3-VL-4B text encoder are bf16, the upsampler is w4a8, and both CLIPLoaders use type `flux3`.
- **i2i call:** `TextGenerate`(upsampler, BFL i2i system prompt, `presence_penalty` 0, image scaled to BFL's budget, request wrapped in BFL's scaffold) → `CLIPTextEncode` → `ConditioningZeroOut` → `ReferenceMultiLatent`(`resize`, 1.0 MP, references) → `KSampler` → `VAEDecode` → `SaveImage("comfyfield/<graph id>")`.
- **The optional character** (`flux_look`, `storyboard`) is a `workflow` / `imageWorkflow` pair. `run()` in `src/lib/providers.js` runs `imageWorkflow` when the run has an `image`, else `workflow`.
  - `flux_look` and `storyboard` have no `LoadImage` and use the t2i upsampler call (bare request, t2i system prompt).
  - `flux_look_ref` and `storyboard_ref` take a required `{{image}}` (the character) and use the i2i call (scaffold, i2i system prompt, the character).
  - This follows BFL's rule that the upsampler mode depends on whether references exist.
  - An earlier draft switched inside one graph with `ComfySoftSwitchNode`. That class is defined in `comfy_extras/nodes_logic.py` but commented out of `LogicExtension.get_node_list` at the pinned commit, so v0.41.1 does not register it. [Verified: source; `scripts/fixtures/comfy-nodes.json`]
- **Loops** (`flux_character_set`, `storyboard`): core `StartLoop` (mode `simple`) / `EndLoop` (`accumulate` true) from `comfy_extras/nodes_loop.py`, in the API shape that ComfyUI's own tests use (`"mode": "simple", "mode.num_iterations": N`). `validate_prompt` computes the loop body (`_loop_body`) server-side. `EndLoop` returns a list of IMAGEs, and `SaveImage` after the loop runs once per item. `cache_iterations` is true, so a re-roll with only a new seed reuses the captions. [Verified: `comfy_execution/validation.py validate_loops`, `tests-unit/execution_test/test_nested_loop_execution.py`]
- No graph uses a custom node. Every class is in ComfyUI v0.41.1 core. [Verified: `check.md`]

## Per graph

### `flux_look` and `flux_look_ref`: text to image in a look, with or without a character

- **`flux_look`** follows the distilled t2i template:
  - Loaders 1 to 4.
  - 20 `TextGenerate` t2i (`{{prompt}}`).
  - 30 encode, 31 zero-out.
  - 33 `EmptyFlux2LatentImage({{width}}, {{height}}, {{count}})`.
  - 34 to 36: KSampler, decode, save.
  - **Placeholders:** `prompt`, `width`, `height`, `count`, `seed`.
- **`flux_look_ref`** adds the distilled edit template's reference wiring:
  - 10 `LoadImage {{image}}` (required).
  - 11 upsampler copy at 1 MP.
  - 21 `TextGenerate` i2i (scaffold + `{{prompt}}` + "The person or character in the first image is the main subject of the picture; keep their face, hair and build.").
  - 30 to 32: encode, zero-out, `ReferenceMultiLatent` (character).
  - Then the same canvas, sampler and save as `flux_look`.
  - **Placeholders:** `prompt`, `image`, `width`, `height`, `count`, `seed`.
- **Deviations:** the negative is `ConditioningZeroOut` instead of the t2i template's empty `CLIPTextEncode`. At cfg 1 ComfyUI skips the negative, so this has no effect. The subject hint line is mine: the looks' prompt never names the character ("A picked character travels as a ref"). [Inference]

### `klein_edit`: edit one photo, keep its shape

- **Template:** distilled image edit, as is: the reference at 1 MP sets the output shape.
- **Nodes:** loaders; 10 `LoadImage {{image}}`; 11 upsampler copy at 1 MP; 20 i2i `TextGenerate`; 30 to 32 encode, zero-out, `ReferenceMultiLatent`; 34 KSampler on `empty_latent`; 35 to 36 decode, save.
- **Placeholders:** `prompt`, `image`, `seed`. No `{{width}}`/`{{height}}`.
- **Deviations:** BFL's i2i text and scaffold (see the findings above). The template also has UI-only nodes, which I removed: `CreateBoundingBoxes`, `Flux3LayoutPrompt`, `PreviewAny`, `ComfySwitchNode` and `ImageCompare`.

### `klein_edit_canvas` (new): edit one photo onto a fixed canvas

- Same as `klein_edit`, but the latent is `EmptyFlux2LatentImage({{width}}, {{height}}, {{count}})`, so the format's aspect decides the output. FLUX 3 references are separate tokens, so the canvas can differ from the photo. [Verified: `flux3/model.py` `ref_ids`]
- It exists because five `klein_edit` formats set a fixed aspect: `sticker` 1:1, `game-style` 16:9, `all-fine` 16:9, `profile-picture` 1:1, `portrait` 4:5. `klein_edit` would ignore that aspect.

### `klein_character`: a saved character in a new scene

- The distilled edit wiring with the character as the only reference, on a `{{width}}`×`{{height}}` canvas (the format sets 1:1).
- **Placeholders:** `prompt`, `image` (the character's first picture), `width`, `height`, `count`, `seed`.

### `klein_character_swap`: put a saved character into a photo

- 10 `LoadImage {{image}}` (photo), 11 `LoadImage {{image2}}` (character). `ReferenceMultiLatent` gets both, photo first, so the output takes the photo's shape.
- The upsampler sees the photo at 0.5 MP (BFL's two-reference budget) and the character letterboxed in white into the same frame (`GetImageSize` → `ResizeAndPadImage`), then `BatchImagesNode`. Without the letterbox, Batch Images would center-crop a portrait character to the photo's shape and could cut the face.
- **Placeholders:** `prompt`, `image`, `image2`, `seed`.

### `klein_headshot`

- The same graph as `klein_edit_canvas`: the photo is the reference, and the canvas is `{{width}}`×`{{height}}` (the format sets 4:5, 896×1120).

### `klein_retouch`

- The same graph as `klein_edit`, with `ReferenceMultiLatent` at **2.0 MP**, so the output is about 2 MP and keeps more skin texture. The template note says to "raise the megapixels for more reference detail at a higher cost", and BFL's own pipeline keeps references at native size up to about 16 MP. [Verified: template note, docs.comfy.org FLUX 3 Klein "Reference size is a cost dial"] The 2 MP choice is mine. [Inference]

### `klein_moodboard`: 1 to 3 style references

- 10 `{{image}}` (ref1, required), 11 `{{image2}}`, 12 `{{image3}}` (both optional). The optional loaders link only into `BatchImagesNode.images.image1/2` and `ReferenceMultiLatent.images.image1/2`. Both are optional slots: Batch Images has `min=1`, so only `image0` is required.
- The upsampler copy is the batch scaled to 0.25 MP each. That is BFL's 512×512 budget for three references, and it is used for any count because the graph cannot know the count. Batch Images crops refs 2 and 3 to ref 1's shape, which is harmless for style. [Inference]
- The output is a `{{width}}`×`{{height}}` canvas from the shape choice.
- **Placeholders:** `prompt`, `image`, `image2`, `image3`, `width`, `height`, `count`, `seed`.

### `flux_character_set`: `{{count}}` posts of one character

- **No template** covers this. It is the `klein_character` wiring inside a core loop that runs `{{count}}` times:
  - `StringFormat` builds each request: scaffold + `{{prompt}}` + "Caption post N of this set only ... a moment, setting and outfit that differ from the earlier posts ..." + every earlier caption.
  - The loop carries the captions (`initial_iteration_value` "" → `StringFormat "{a}\nPost {b}: {c}"`).
  - The KSampler seed is `{{seed}} + index`.
- **Why a loop:** a batch of one caption gives N near-copies of one setting. The format asks for "a different moment, setting and outfit" per post. The upsampler writes one caption per call, so each post needs its own call. [Inference]
- **Placeholders:** `prompt`, `image`, `count`, `width`, `height`, `seed`.

### `storyboard` and `storyboard_ref`: several consistent shots

- **Format and steps:** one default `generate` step, no writer. The filled prompt already holds the idea, the shot count, the planning mode (auto, or the user's shot list) and the look. **No writer step is needed:** the graph plans and captions each shot with the upsampler.
- **Shot 1** is drawn like `flux_look` (in `storyboard`) or like `flux_look_ref` (in `storyboard_ref`, with the character). The request ends with "Caption shot 1 of this storyboard only: one single frame, not a grid or a sheet of panels."
- **Shots 2 to `{{count}}`** are drawn in a core loop (`max(0, {{count}} - 1)` iterations):
  - The upsampler (i2i) sees shot 1.
  - Its request is scaffold + `{{prompt}}` + "Caption shot N only ... same characters, outfits, setting, lighting and style as the first image" + every earlier caption.
  - `ReferenceMultiLatent` gets shot 1, and in `storyboard_ref` also the character.
  - The seed is `{{seed}} + index + 1`.
- `CreateList` joins shot 1 and the loop's list in order for one `SaveImage`.
- This is frame anchoring, as Higgsfield Popcorn does ("connected frames"). Its quality is not measured. [Inference]
- **Placeholders:** `storyboard`: `prompt`, `count`, `width`, `height`, `seed`. `storyboard_ref` adds `image`.
- **If a writer step is added later:** keep the shot list in `{{prompt}}`, one shot per line. Each shot's request includes the whole prompt, so the graph works without changes.

## Format changes needed

I checked these with `validateFormat` from the current working tree, with these graphs added to `schemas.comfy` and with changes 1 and 2 applied in the simulation. Every format then passes except `slide-visuals` (change 5). Two earlier gaps are already fixed in the working tree: `recipeOptions` now takes the run's aspect from the chosen option's `params.aspect`, and `aspectSize` now has `'21:9'`.

1. **The 19 `look-*` formats:** add `imageWorkflow: 'flux_look_ref'`. A run with a character then uses `flux_look_ref`, and a run without one uses `flux_look`. Without this line, the validator reports "Input character does not map to a target model".
2. **`storyboard`:** add `imageWorkflow: 'storyboard_ref'`, for the same reason.
3. **The six `flux_look` formats with no picture input** (`brand-colors`, `slide-visuals`, `drawing`, `sketch`, `wallpaper`, `animal`): no change. They have no `imageWorkflow`, and `flux_look` has no `{{image}}`, so a brand's picture can never become the subject.
4. **`count` for the loops.** `influencer-post` needs `count` = `posts`, and `storyboard` needs `count` = `shots`. Today `recipeOptions` sends `count: 1`, so each would make one post or one shot. Add a step binding (`bindings: { count: 'posts' }` or `{ count: 'shots' }`). `comfyVars` spreads `o.fields` last, so the binding sets `{{count}}`. `defineFormat` does not copy format-level bindings into its default step, so these two formats need an explicit step. For `storyboard`, that step also carries `imageWorkflow`.
5. **`slide-visuals`:** its prompt has no `{brand}` ("Input brand does not map to a target model"). `brand-colors` gets only the brand's name in text, so the palette must reach the prompt some other way, for example from the brand's notes.
6. **Fixed-aspect edits:** set `workflow: 'klein_edit_canvas'` on `sticker`, `game-style`, `all-fine`, `profile-picture` and `portrait`, or change their aspect to `'auto'`.
7. **Refer to references by order (recommended).** BFL's i2i upsampler names references by order, and a Library name means nothing to the model:
   - `character-scene`: "`{shot} of {character}`" → "`{shot} of the person in the first image`"
   - `character-swap`: "`with {character}`" → "`with the person in the second image`"
   - `influencer-post`: "`photos of {character}`" → "`photos of the person in the first image`"

   The upsampler can usually infer this from the image. [Inference]

## Not verified

- No graph has run. Static checks only (see `check.md`). The first live run should use `klein_edit` (one reference, the template's own wiring), then `flux_look_ref`, then `klein_moodboard` with one reference (to prove the optional drop), then `storyboard` at 4 shots.
- Whether the fine-tuned upsampler follows the "Caption shot N" and "Caption post N" instructions and keeps settings distinct across posts. [Inference]
- Speed. BFL measured 3.9 s per 1 MP image on an RTX PRO 6000 (int8, 16 steps), and this does not include the upsampler. A 9B w4a8 caption of 100 to 350 words probably adds several seconds per call, so an 8-shot storyboard is probably 1 to 3 minutes. [Verified: BFL benchmark chart, earlier note] [Inference for the rest]
