# How the t2i graphs were checked

Date: 2026-10-19. ComfyUI source: `45bf90d1c91eecd782643346dcfb73cb0017667f`, files fetched from `raw.githubusercontent.com/Comfy-Org/ComfyUI/<commit>/...` (the `comfyanonymous` URL redirects there). No ComfyUI was run.

## Method

Three scripts in the session scratchpad (`t2i/tools/`), none of them in the repo:

1. `check.py` holds a schema for every node class the graphs use, transcribed from the pinned source (table below). For each graph it checks:
   - the class has a schema, its anchor (`class X:` or `node_id="X"`) exists in the named source file, and each input name used appears in that source block;
   - classes from `comfy_api` extensions are in that file's `get_node_list` (this check found that `ComfySoftSwitchNode` is not registered, so no graph uses it);
   - no unknown input names; every required input is set;
   - every link `[id, n]` points at an existing node, `n` is a real output index of that class, and the output type equals the input type;
   - every combo value is in the source's option list (samplers from `KSAMPLER_NAMES`, schedulers from `SCHEDULER_HANDLERS`, CLIP types from `CLIPLoader`);
   - literal values have the input's type; whole-string placeholders in INT inputs are numeric (`seed`, `width`, `height`, `count`);
   - every loader file is in `MODEL_FILES` or `files.json` under the folder its loader reads;
   - one `SaveImage` per graph; no `_meta.optional` (none is needed in this family).
2. `fill-check.mjs` fills each graph with the repo's `comfyVars` for 1:1, 16:9, 9:16 and 4:5 (Qwen and HiDream with their proposed `sizes`), asserts no `{{` is left and that sizes and seeds are numbers, asserts HiDream sizes are multiples of 32 and Qwen sizes multiples of 32, and totals the files with the repo's `modelFilesOf`, `minVramOf` and `notOnCloud`.
3. `validate-sim.mjs` runs the repo's `validateFormat` on every format that names these graphs, with these placeholder lists added to `schemas.comfy`, once as the formats are and once with `imageWorkflow: 'qwen_image_ref'` added.

Result of `check.py`: 8 graphs, 102 links, **no problems**. Result of `fill-check.mjs`: all graphs fill; totals as in the README summary. `qwen_image.json` differs from the shipped `public/workflows/qwen_image21_t2i.json` only in `filename_prefix`.

## Node schemas used (pinned source)

| Class | Source (line) | Inputs used (required / optional) | Outputs |
|---|---|---|---|
| UNETLoader | `nodes.py` 992 | unet_name, weight_dtype (`default`) | MODEL |
| CLIPLoader | `nodes.py` 1017 | clip_name, type (`qwen_image`, `krea2`, `lumina2` all in the list) / device (`default`) | CLIP |
| VAELoader | `nodes.py` 776 | vae_name | VAE |
| CheckpointLoaderSimple | `nodes.py` 621 | ckpt_name | MODEL, CLIP, VAE |
| LoadImage | `nodes.py` 1747 | image | IMAGE, MASK |
| CLIPTextEncode | `nodes.py` 58 | text, clip | CONDITIONING |
| ConditioningZeroOut | `nodes.py` 274 | conditioning | CONDITIONING |
| EmptyLatentImage | `nodes.py` 1255 | width, height, batch_size (step 8) | LATENT |
| KSampler | `nodes.py` 1606 | model, seed, steps, cfg, sampler_name, scheduler, positive, negative, latent_image, denoise | LATENT |
| VAEDecode | `nodes.py` 321 | samples, vae | IMAGE |
| SaveImage | `nodes.py` 1669 | images, filename_prefix | (output node) |
| TextEncodeQwenImage21 | `comfy_extras/nodes_qwen.py` 115 | clip, prompt, negative_prompt, resolution / vae, images.image_1 (Autogrow, `min=0`, so every slot is optional) | CONDITIONING (positive), CONDITIONING (negative), LATENT |
| CFGGuider | `comfy_extras/nodes_custom_sampler.py` 827 | model, positive, negative, cfg | GUIDER |
| KSamplerSelect | `nodes_custom_sampler.py` 383 | sampler_name | SAMPLER |
| ManualSigmas | `nodes_custom_sampler.py` 1129 | sigmas | SIGMAS |
| RandomNoise | `nodes_custom_sampler.py` 1007 | noise_seed | NOISE |
| SamplerCustomAdvanced | `nodes_custom_sampler.py` 1024 | noise, guider, sampler, sigmas, latent_image | LATENT (output), LATENT (denoised) |
| BasicScheduler | `nodes_custom_sampler.py` 21 | model, scheduler, steps, denoise | SIGMAS |
| SamplerCustom | `nodes_custom_sampler.py` 737 | model, add_noise, noise_seed, cfg, positive, negative, sampler, sigmas, latent_image | LATENT (output), LATENT (denoised) |
| TextGenerate | `comfy_extras/nodes_textgen.py` 28 | clip, prompt, max_length, sampling_mode `on` with temperature, top_k, top_p, min_p, repetition_penalty, seed / presence_penalty, thinking, use_default_template, mtp (`auto`) | STRING (generated_text), STRING (thinking) |
| ModelSamplingFlux | `comfy_extras/nodes_model_advanced.py` 166 | model, max_shift, base_shift, width, height | MODEL |
| ModelSamplingAuraFlow | `nodes_model_advanced.py` 151 | model, shift / sampling (`flow`) | MODEL |
| ModelNoiseScale | `nodes_model_advanced.py` 332 | model, noise_scale | MODEL |
| EmptySD3LatentImage | `comfy_extras/nodes_sd3.py` 44 | width, height, batch_size (step 16) | LATENT |
| EmptyHiDreamO1LatentImage | `comfy_extras/nodes_hidream_o1.py` 18 | width, height, batch_size (step 32) | LATENT |
| HiDreamO1PatchSeamSmoothing | `nodes_hidream_o1.py` 143 | model, start_percent, end_percent, pattern (`single_shift`), passes (`ramp_2_4`), blend (`median`), strength | MODEL |
| LoadBackgroundRemovalModel | `comfy_extras/nodes_bg_removal.py` 12 | bg_removal_name (folder `background_removal`, `folder_paths.py` 59) | BACKGROUND_REMOVAL |
| RemoveBackground | `nodes_bg_removal.py` 34 | bg_removal_model, image | MASK |
| InvertMask | `comfy_extras/nodes_mask.py` 207 | mask | MASK |
| JoinImageWithAlpha | `comfy_extras/nodes_compositing.py` 193 | image, alpha | IMAGE |

All the `comfy_extras` modules above are in the built-in extras list of `nodes.py`.

## Per graph

### `qwen_image` (12 nodes, 12 links)

- Classes: UNETLoader, CLIPLoader, VAELoader, TextEncodeQwenImage21, EmptyLatentImage, CFGGuider, KSamplerSelect, ManualSigmas, RandomNoise, SamplerCustomAdvanced, VAEDecode, SaveImage. All exist with these input names.
- Links: CFGGuider positive ← TextEncodeQwenImage21[0], negative ← [1] (both CONDITIONING); SamplerCustomAdvanced ← RandomNoise[0] NOISE, CFGGuider[0] GUIDER, KSamplerSelect[0] SAMPLER, ManualSigmas[0] SIGMAS, EmptyLatentImage[0] LATENT; VAEDecode ← SamplerCustomAdvanced[0] LATENT and VAELoader[0]; SaveImage ← VAEDecode[0].
- Required inputs: all set. Combos: `euler`, `qwen_image`, `default` valid. Sigmas string identical to the template's ManualSigmas.
- Optional loaders: none.

### `qwen_image_ref` (13 nodes, 14 links)

- As `qwen_image`, plus LoadImage `{{image}}` → `TextEncodeQwenImage21.images.image_1` (IMAGE into an optional Autogrow slot) and VAELoader[0] → `TextEncodeQwenImage21.vae` (optional VAE).
- `{{image}}` is required here: the app runs this graph only when a picture is attached (`imageWorkflow`).
- Validator: thumbnail validates with this pair; the looks still fail only on the shape `aspect` param (README, format change 2).

### `qwen_image_logo` (12 nodes, 12 links)

- Same nodes and links as `qwen_image`; only the prompt string differs (Qwen's RGBA wording around `{{prompt}}`).
- RGBA path: VAE `output_channels` comes from the decoder head (`comfy/sd.py` 844), and `SaveImage` writes the 4-channel array with `Image.fromarray` (`nodes.py` 1707 to 1708).

### `qwen_image_logo_birefnet` (16 nodes, 17 links)

- Adds LoadBackgroundRemovalModel[0] BACKGROUND_REMOVAL → RemoveBackground.bg_removal_model; VAEDecode[0] IMAGE → RemoveBackground.image and JoinImageWithAlpha.image; RemoveBackground[0] MASK → InvertMask.mask; InvertMask[0] MASK → JoinImageWithAlpha.alpha; JoinImageWithAlpha[0] IMAGE → SaveImage.
- Alpha sense: RemoveBackground returns the foreground mask; JoinImageWithAlpha stores `1 - alpha`, so the inverted mask gives alpha 1 on the logo (`nodes_compositing.py` 207), as in the BiRefNet template.
- `LoadBackgroundRemovalModel` is not in `LOADERS`; see `loaders.json`.

### `krea2_t2i` (10 nodes, 11 links)

- Links: TextGenerate ← CLIPLoader[0]; CLIPTextEncode.text ← TextGenerate[0] STRING (a link into a STRING widget input), clip ← CLIPLoader[0]; ConditioningZeroOut ← CLIPTextEncode[0]; KSampler ← UNETLoader[0], CLIPTextEncode[0], ConditioningZeroOut[0], EmptyLatentImage[0]; VAEDecode ← KSampler[0], VAELoader[0]; SaveImage ← VAEDecode[0].
- TextGenerate keys and values equal `benchmarks/image_krea2_turbo_t2i_int8.json` (node `30:16`), including `mtp: auto` and `sampling_mode.seed: 0`.
- Combos: `krea2`, `euler`, `simple`, `on`, `auto` valid.

### `krea2_raw_t2i` (11 nodes, 12 links)

- As `krea2_t2i`, with ModelSamplingFlux ← UNETLoader[0] and KSampler.model ← ModelSamplingFlux[0]; the negative is CLIPTextEncode `""` ← CLIPLoader[0].
- ModelSamplingFlux width and height are `{{width}}`/`{{height}}` (INT, step 8; default sizes are multiples of 16).

### `z_image` (10 nodes, 10 links)

- Node-for-node equal to `benchmarks/image_z_image_turbo.json` (values and links), with `{{prompt}}`, `{{width}}`, `{{height}}`, `{{count}}`, `{{seed}}` in place of the literals.
- Combos: `lumina2`, `res_multistep`, `simple`, `flow` valid.

### `hidream` (11 nodes, 14 links)

- Links: ModelNoiseScale ← CheckpointLoaderSimple[0] MODEL; HiDreamO1PatchSeamSmoothing ← ModelNoiseScale[0]; BasicScheduler ← ModelNoiseScale[0]; both CLIPTextEncode ← CheckpointLoaderSimple[1] CLIP; SamplerCustom ← PatchSeamSmoothing[0] MODEL, CLIPTextEncode[0] (positive, negative), KSamplerSelect[0], BasicScheduler[0], EmptyHiDreamO1LatentImage[0]; VAEDecode ← SamplerCustom[0] LATENT and CheckpointLoaderSimple[2] VAE; SaveImage ← VAEDecode[0].
- Values equal the template's widgets (SamplerCustom cfg 5, BasicScheduler `normal` 40 1.0, KSamplerSelect `dpmpp_2m_sde_gpu`, ModelNoiseScale 8, seam smoothing 0.8 / 1 / `single_shift` / `ramp_2_4` / `median` / 1).
- Sizes: proposed `sizes` are multiples of 32 (EmptyHiDreamO1LatentImage step 32).

## Not checked

- Cloud's `object_info` needs a key, so node availability on Cloud rests on its version (v0.41.1) and the nodes being core.
- Output quality (identity from `<image1>`, alpha edges, Turbo against Raw) needs real runs on a Pod.
