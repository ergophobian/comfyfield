# How the qwen-edit graphs were checked

Date: 2026-10-19. Source: ComfyUI at commit `45bf90d1c91eecd782643346dcfb73cb0017667f` (v0.41.1), fetched with `git fetch --depth 1` from `comfyanonymous/ComfyUI`. No GPU run, no ComfyUI process: every check is static or a re-run of the exact Python/JS logic the server uses.

The scripts are in the session scratchpad (`C:\Users\Bryan\AppData\Local\Temp\claude\d--Code-comfyfield\03e6c042-6fbf-4151-8e49-fb2e2da9648f\scratchpad\qe\tools\`). Copy them before the session folder goes:

- `schemas.py`: reads every node schema from the source with Python's `ast` (V3 `io.Schema(node_id=..., inputs=[...])` and V1 `INPUT_TYPES` / `RETURN_TYPES` / `NODE_CLASS_MAPPINGS`); 646 classes.
- `check_graphs.py`: the per-graph checks below.
- `registered.py`: each class is registered (V1 in `NODE_CLASS_MAPPINGS`, V3 returned by its module's `get_node_list`, module listed in `nodes.py` extras).
- `math_test.py`: evaluates every `ComfyMathExpression` with `simpleeval.simple_eval` and the node's `MATH_FUNCTIONS`, after filling placeholders the way `shared/mapping.js` `fill` does. Run with simpleeval 1.0.0 (the floor in `requirements.txt`) and 1.0.8 (latest).
- `drop_test.mjs`: runs the app's own `dropOptional` (`shared/mapping.js`) on the graphs with optional media missing, then re-checks the result.
- `validate_formats.mjs`: runs the app's own `validateFormat` (`src/lib/formats/validate.js`) on every format that names one of these graphs, today and with the proposed format changes.
- `build_graphs.py`: writes the 15 graphs (so they stay consistent).

## Checks per graph (`check_graphs.py`)

For every node:

1. The class exists at the pinned commit.
2. Every input name exists on the class, including dynamic names: Autogrow `images.image_1..16` (`TextEncodeQwenImage21`, `min=0`), `values.a..z` (`ComfyMathExpression`, `min=1`), DynamicCombo children (`ResizeImageMaskNode` `resize_type.multiplier` under `scale by multiplier`).
3. Every required input is set (dynamic children excepted, `ComfyMathExpression` needs at least `values.a`).
4. Every link names an existing node and an output index that exists, and the output type matches the input type (`MatchType` accepts any).
5. Literal combo values are in the option list (enum options such as `ResizeType.SCALE_BY` resolved to their strings); `sampler_name` is in `KSAMPLER_NAMES`, `scheduler` in `SCHEDULER_HANDLERS` (`comfy/samplers.py`).
6. Constants respect `min`/`max`. ComfyUI checks `min`/`max` only on constants, not on links (`execution.py` `validate_inputs`), so the math nodes feed `CameraAngle`, `ImageScaleToTotalPixels` and `EmptyLatentImage` through links.
7. Each loader file is in `MODEL_FILES` + `files.json`, with the folder its loader reads (`LOADERS`).
8. A loader with `_meta.optional` links only into inputs that are optional in the schema.

Result: **0 problems** on all 15 graphs:

| Graph | Nodes | Placeholders | Optional loaders |
|---|---|---|---|
| `qwen_edit` | 13 | count, image, prompt, seed | none |
| `qwen_edit_try_on` | 15 | count, image, image2, image3, prompt, seed | #6 (`image3` → `images.image_3`, optional: Autogrow `min=0`) |
| `qwen_edit_mockup` | 17 | count, height, image, prompt, seed, width | none |
| `qwen_edit_outpaint` | 19 | count, image, pad, prompt, seed | none |
| `qwen_edit_style_ref` | 14 | count, image, image2, prompt, seed | none |
| `qwen_edit_place_product` | 14 | count, image, image2, prompt, seed | none |
| `qwen_edit_variants` | 13 | count, image, prompt, seed | none |
| `qwen_character_sheet` | 17 | count, height, image, prompt, seed, width | none |
| `qwen_zoom_grid` | 13 | count, image, prompt, seed | none |
| `qwen_restore` | 21 | image, prompt, seed | none |
| `qwen_multiangle` | 87 | azimuth, batch, elevation, image, seed, zoom | none |
| `qwen_shots_grid` | 57 | image, seed | none |
| `qwen2511_relight` | 16 | image, prompt, seed | none |
| `qwen2511_edit` | 18 | image, image2, image3, prompt, seed | #10, #11 (`image2`/`image3` of `TextEncodeQwenImageEditPlus`, both `optional=True`) |
| `qwen_image_layered` | 18 | image, layers, seed | none |

Each graph has exactly one `SaveImage` (image output only).

Checker self-test: 8 deliberate faults in copies of `qwen_edit_try_on` were all reported (9 reports): a bad input name, a bad output index, the optional loader linked into a required `MODEL` input (reported twice: type and optional rule), a bad sampler, a missing required input, a bad combo value, a loader file not in the list, a value over `max`. On the shipped `qwen_image21_t2i.json` it reports nothing. On other shipped graphs it reports only inputs it cannot parse: DynamicCombo children built from variables and nested `MultiType` inputs (`SaveVideo`, `TextGenerate`, `LTXVEmptyLatentAudio`), which these graphs do not use.

## Registration (`registered.py`)

All 43 classes the graphs use are registered: `CFGGuider`, `CFGNorm`, `CLIPLoader`, `CLIPTextEncode`, `CameraAngle`, `ComfyMathExpression`, `ComfySwitchNode`, `EmptyLatentImage`, `EmptyQwenImageLayeredLatentImage`, `FluxKontextImageScale`, `FluxKontextMultiReferenceLatentMethod`, `GetImageSize`, `ImageScaleToMaxDimension`, `ImageScaleToTotalPixels`, `ImageStitch`, `KSampler`, `KSamplerSelect`, `LatentCut`, `LatentCutToBatch`, `LoadImage`, `LoraLoaderModelOnly`, `ManualSigmas`, `ModelSamplingAuraFlow`, `PrimitiveFloat`, `PrimitiveInt`, `RandomNoise`, `ReferenceLatent`, `RepeatLatentBatch`, `ResizeImageMaskNode`, `SamplerCustomAdvanced`, `SaveImage`, `SeedVR2Conditioning`, `SeedVR2PostProcessing`, `SeedVR2Preprocess`, `StringConcatenate`, `TextEncodeQwenImage21`, `TextEncodeQwenImageEditPlus`, `UNETLoader`, `VAEDecode`, `VAEDecodeTiled`, `VAEEncode`, `VAEEncodeTiled`, `VAELoader`. No custom node pack.

## Math (`math_test.py`)

- `qwen_edit_outpaint`, pad `sides` / `top-bottom` / `square` / `all`: string comparisons inside the expression evaluate in both simpleeval versions. For a 4000 x 3000 upload the source megapixel targets are 2.286 / 2.286 / 3.0 / 2.367 and the canvases 3136 x 1344, 1792 x 2368, 2048 x 2048, 2368 x 1792 (with `ImageScaleToTotalPixels` sizes computed from its own formula: `round(w * sqrt(mp * 1024 * 1024 / (w * h)) / steps) * steps`). Canvas dimensions are always multiples of 32.
- `qwen_edit_mockup` / `qwen_character_sheet`: 1280 x 720 → 2720 x 1536; 896 x 1120 → 1824 x 2304; 1024 x 1024 → 2048 x 2048; 720 x 1280 → 1536 x 2720.
- `qwen_multiangle`: all 72 combinations of the format's azimuth (0, ±45, ±90, 180), elevation (0, 35, -30, 90) and zoom (1.5, 1, 0.7) give in-range CameraAngle values; feeding them to a copy of `CameraAngle`'s term functions gives the LoRA words in README section 4.1 (for example -45, 90, 1.5 → `<sks> front-left quarter view high-angle shot close-up`). batch 12 → `True` (sheet), batch 1 → `False`.

## Optional media (`drop_test.mjs`)

The app's `dropOptional` removed the missing loaders and the inputs that link to them; the results check clean:

- `qwen_edit_try_on` without `image3`: 15 → 14 nodes; `TextEncodeQwenImage21` keeps `images.image_1`, `images.image_2`.
- `qwen2511_edit` with `image` only: 18 → 16 nodes; both encoders keep `image1` only. With `image` and `image2`: 17 nodes.

## App validator (`validate_formats.mjs`)

The 32 formats that name these graphs, validated with the graphs' placeholders added to `schemas.comfy`:

- Today, 26 pass. Failing: `expand` (`Unmapped workflow placeholder pad`), `angles` (`azimuth`, `batch`, `elevation`, `zoom` unmapped; `Workflow has no prompt placeholder`), `shots` (`Workflow has no prompt placeholder`), `layers` (`layers` unmapped; no prompt placeholder), `ai-stylist` (`image2`, `image3` unmapped), `relight-photo` (`Unknown workflow placeholder brightness`).
- With the format changes in README section 7 applied to copies, and choice-option params counted as supplied (the validator fix), all 32 pass. The 7 fixed-aspect formats also pass on `qwen_edit_mockup`.

## Checked by hand in the source

- `TextEncodeQwenImage21`: `resolution` min 0, max 4096; output 2 is the empty latent on image 1's size; `images` Autogrow `min=0`; references sorted by slot number (`comfy_extras/nodes_qwen.py`).
- `RepeatLatentBatch.amount` max 64; reference latents repeat to the batch (`comfy/conds.py` `CONDList.process_cond`).
- `EmptyLatentImage` returns `downscale_ratio_spacial` 8, and `SamplerCustomAdvanced` calls `fix_empty_latent_channels`, which converts it to Qwen-Image 2.1's 64-channel, /16 latent (`nodes.py`, `comfy/sample.py`, `comfy/latent_formats.py`).
- `ComfySwitchNode` inputs `on_false` / `on_true` are `lazy=True` with `check_lazy_status`, so the unselected branch is not executed (`comfy_extras/nodes_logic.py`).
- `CameraAngle` clamps and term tables (`comfy_extras/nodes_camera_angle.py`); `StringConcatenate` inputs `string_a`, `string_b`, `delimiter`.
- `ImageStitch` pads or matches sizes and channel counts; `spacing_width` 16 is within 0..1024, step 2.
- `ModelSamplingAuraFlow` `sampling` is an optional combo `flow` / `img_to_img_velocity`; outputs `MODEL` (inherited from `ModelSamplingSD3`).
- SeedVR2 nodes: `SeedVR2Preprocess` drops alpha, `SeedVR2PostProcessing` re-applies it; `color_correction_method` options `lab`, `wavelet`, `adain`, `none`.
- Every template value copied (sampler, scheduler, steps, cfg, shift, LoRA strengths, sigmas, tile sizes) was read from the template JSON at workflow_templates `59a3b48` with a dump of each node's `widgets_values`, including subgraph `proxyWidgets`.

## Not checked

- Comfy Cloud's `object_info` needs a login, so node availability on Cloud is inferred from its ComfyUI version (v0.41.1) and the core-only node set.
- File bytes on Cloud: the listing gives names only.
- Output quality, speed and VRAM: no run.
