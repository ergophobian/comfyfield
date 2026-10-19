# How the 3D graphs were checked

Date: 2026-10-19. ComfyUI source: raw files from `Comfy-Org/ComfyUI` at `45bf90d1c91eecd782643346dcfb73cb0017667f` (v0.41.1). No ComfyUI run, no weights.

## Method

`tools/check.py` (with `tools/schema.py`) reads every `comfy_extras/*.py` at the pin with Python's `ast` module and rebuilds each V3 node's `IO.Schema`: input names, types, `optional`, combo options, min and max, `DynamicCombo` options with their nested inputs (`sign_mode.qef`, `mode.yaw`, `format.codec`), `Autogrow` slots (`images.image0`, `values.a`) and output types in order. V1 nodes (`KSampler`, `LoadImage`, `UNETLoader`, `VAELoader`, `CLIPVisionLoader`, `CLIPLoader`, `CLIPTextEncode`, `VAEDecode`, `ConditioningZeroOut`, `ModelSamplingSD3`, `RescaleCFG`) are transcribed from `nodes.py` and `comfy_extras/nodes_model_advanced.py`; sampler and scheduler names come from `comfy/samplers.py`. For every node of every graph it checks:

1. The class exists at the pin, and its file is in `nodes.py`'s built-in extra list and its extension's node list.
2. Every input key in the graph is in the schema (after expanding the chosen `DynamicCombo` option).
3. Every required input is set.
4. Every link points at an existing node, an output index in range, and an output whose type matches the input (`*` and `MatchType` match any; `MultiType` matches its list).
5. Every literal combo value is a valid option, and numbers are within min and max. Placeholders are skipped here and checked by hand below.
6. Every loader file is in `MODEL_FILES` (`shared/modelFiles.js`, current working tree) or in `files.json`, in the folder that loader reads (`folder_paths.py`: `diffusion_models`, `vae`, `clip_vision`, `text_encoders`, `background_removal`).
7. Graphs with loops go through ComfyUI's own `validate_loops` (lifted from `comfy_execution/validation.py`), which pairs `StartLoop` with `EndLoop`, rejects a body that escapes, and computes the body.

Mutation test of the checker itself: a copy of `trellis2_turntable.json` with 8 planted faults (bad `DynamicCombo` value, bad combo value, wrong link type, output index out of range, missing required input, unknown input name, unlisted model file, value below min) gave 11 problems, all of them the planted faults and the sub-inputs they orphaned. So a clean result means something.

Run: `python -I tools/check.py <comfy src> research_notes/engine/3d shared/modelFiles.js research_notes/engine/3d/files.json` (Python 3.12).

## Results

| Graph | Nodes | Links | Problems | Output node |
|---|---|---|---|---|
| `trellis2_image.json` | 35 | 63 | 0 | 35 `SaveGLB` |
| `flux_trellis2.json` | 44 | 73 | 0 | 35 `SaveGLB` |
| `trellis2_character.json` | 46 | 78 | 0 | 35 `SaveGLB` |
| `trellis2_turntable.json` | 39 | 61 | 0 | 47 `SaveVideo` |

`trellis2_turntable`: `validate_loops` pairs `StartLoop` 40 with `EndLoop` 44, body `41, 42, 43` (`ComfyMathExpression`, `CreateCameraInfo`, `RenderMesh`). `RenderMesh` reads mesh 33 from outside the body, which loop expansion keeps as an outside link (`copied_link` in `nodes_loop.py`).

Classes and where they live at the pin:

- `comfy_extras/nodes_trellis2.py`: `Trellis2Conditioning`, `Trellis2ShapeStage`, `Trellis2UpsampleStage`, `Trellis2TextureStage`, `EmptyTrellis2LatentStructure`, `VaeDecodeStructureTrellis2`, `VaeDecodeShapeTrellis`, `VaeDecodeTextureTrellis`
- `comfy_extras/nodes_mesh_postprocess.py`: `RemeshMesh`, `DecimateMesh`, `MeshSmoothNormals`, `UnwrapMesh`, `BakeTextureFromVoxel`, `BakeNormalMapFromMesh`, `BakeAmbientOcclusion`, `ApplyTextureToMesh`, `RenderMesh`
- `comfy_extras/nodes_save_3d.py`: `SaveGLB`
- `comfy_extras/nodes_bg_removal.py`: `LoadBackgroundRemovalModel`, `RemoveBackground`
- `comfy_extras/nodes_images.py`: `ImageCropToMask`
- `comfy_extras/nodes_custom_sampler.py`: `CFGOverride`
- `comfy_extras/nodes_model_advanced.py`: `ModelSamplingSD3`, `RescaleCFG`
- `comfy_extras/nodes_flux.py`: `EmptyFlux2LatentImage`; `nodes_textgen.py`: `TextGenerate`; `nodes_edit_model.py`: `ReferenceMultiLatent`
- `comfy_extras/nodes_loop.py`: `StartLoop`, `EndLoop`; `nodes_camera.py`: `CreateCameraInfo`; `nodes_math.py`: `ComfyMathExpression`; `nodes_rebatch.py`: `RebatchImages`; `nodes_video.py`: `CreateVideo`, `SaveVideo`
- `nodes.py`: `KSampler`, `LoadImage`, `UNETLoader`, `VAELoader`, `CLIPVisionLoader`, `CLIPLoader`, `CLIPTextEncode`, `VAEDecode`, `ConditioningZeroOut`

## Checked by hand

**Placeholders and their types.**

- `{{image}}`: whole string in `LoadImage.image` (node 1), the upload slot `runComfy` fills.
- `{{seed}}`: whole string in every `KSampler.seed` (INT, 0 to 2^64-1; `comfyVars` gives under 2^31).
- `{{resolution}}`: whole string in `Trellis2UpsampleStage.target_resolution` (INT, min 1024, max 2048, step 128). The proposed params 1024 and 1536 are valid; the current 512 is not.
- `{{prompt}}`: whole string in `TextGenerate.prompt` (`flux_trellis2` node 55), and inside a longer string in `trellis2_character` node 64.
- `{{background}}`: whole string in `RenderMesh.background`, a `COLOR` widget (a `#rrggbb` string; `RenderMesh` parses 6 hex digits).

**The TRELLIS.2 half against the template.** Template id → graph id: 122 → 1, 193 → 2, 192 → 3, 312 → 4, 15 → 5, 299 → 6, 40 → 7, 117 → 8, 118 → 9, 199 → 10, 125 → 11, 108 → 12, 279 → 13, 126 → 14, 87 → 15, 3 → 16, 119 → 17, 91 → 18, 18 → 19, 94 → 20, 23 → 21, 92 → 22, 98 → 23, 12 → 24, 93 → 25, 241 → 26, 186 → 27, 238 → 28, 196 → 29, 147 → 30, 224 → 31, 233 → 32, 210 → 33, 260 → 34, 322 → 35 (as `SaveGLB`). Every link of the template's TRELLIS.2 branch maps to the same link here, with these exceptions:

- The switches 314, 315 and 318 are resolved to their `on_true` side.
- `GetMeshInfo` 202 is removed (pass-through).
- The template feeds `ApplyTextureToMesh` through `PreviewImage` 164, 207, 208, 226 and 235. Here those inputs link to the bake outputs directly.
- `UnwrapMesh.resolution` and `BakeTextureFromVoxel.texture_size` take the value of `PrimitiveInt` 288 (4096) as a literal.

Widget values were mapped in input order, including the `DynamicCombo` sub-inputs (`RemeshMesh` `[768, 'udf', False, False, False, 1, 0, False, 20, 0.01, 20000000]`).

**The Klein edit half against its template.** Template id → graph id: 1 → 60, 2 → 61, 3 → 62, 46 → 63, 47 → 64, 4 → 65, 32 → 66, 17 → 67, 44 → 68, 7 → 69, 8 → 70. Changes, listed in the README:

- File names are the bf16 files ComfyField already lists.
- `KSampler.latent_image` comes from 68, not from `17.empty_latent`.
- The system prompt is BFL's own text.
- The prompt uses BFL's i2i scaffold.
- `BatchImagesNode` 50 is skipped: one image, so `TextGenerate.image` takes `LoadImage` directly.

`TextGenerate.image` and `ReferenceMultiLatent.images.image0` are optional inputs; `LoadImage` 1 is not optional media, so the app's removal rule does not apply.

**FLUX t2i half.** Nodes 51 to 60 are a renumbered copy of `public/workflows/flux3_klein_t2i.json` 1 to 10. The only edits are width 1024, height 1024 and batch 1.

**Optional loaders.** None. No graph has `_meta.optional`.

**Format validation.** `src/lib/formats/validate.js` was run in memory against the four graphs' placeholder sets (`node tools/format-validate.mjs <repo root>`, repo files read only):

- `text-to-3d` and `character-to-3d`: 0 reasons.
- `image-to-3d`: "Unmapped workflow placeholder resolution".
- `turntable`: "Unmapped workflow placeholder background" and "Workflow has no prompt placeholder".

With the README's format changes applied in memory (format-level `params`, `turntable` prompt `''`), both give 0 reasons.

**Not checkable without a GPU.** These need a test run:

- VRAM on the 24 GB rung.
- Run time, in particular `RenderMesh` × 96.
- The turntable framing and which side faces the camera at yaw 0.
- Whether FLUX 3 Klein keeps a plain white background through the upsampler.
- How Comfy Cloud labels a `.glb` output.
