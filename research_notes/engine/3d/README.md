# 3D family: TRELLIS.2 graphs for ComfyField

Research date: 2026-10-19. Scope: the `image-to-3d`, `text-to-3d`, `character-to-3d`, `turntable` and `world-3d` formats in `src/lib/formats/three.js`.

Tags: **[Verified: source]** means I read it in a primary source on this date. **[Inference]** means my conclusion, not stated by a source. No weights were downloaded, no API keys were used and ComfyUI was not run.

Pinned sources:

- ComfyUI `45bf90d1c91eecd782643346dcfb73cb0017667f` (v0.41.1), raw files from `github.com/Comfy-Org/ComfyUI`.
- Template `templates/3d_pixal3d_trellis2_image_to_model.json`, Comfy-Org/workflow_templates main `59a3b48b` (2026-10-18), last changed in `69dedd6b` (2026-10-18).
- Template `templates/image_flux3_klein_distilled_image_edit.json`, same tree, last changed in `9afccb38` (2026-10-17).
- Comfy Cloud model listing read at 13:05 UTC (`cloud_version` v0.480.0, `comfyui_version` v0.41.1).

## Summary

| Graph | Model | LoRAs | Files on Comfy Cloud | Node packs | GPU class | Download | Formats |
|---|---|---|---|---|---|---|---|
| `trellis2_image` | TRELLIS.2-4B (int8) + BiRefNet | none | TRELLIS.2 DiT: no. Shape VAE: no. Texture VAE: no. DINOv3 ViT-L: no. BiRefNet: yes | none (core) | 24 GB | 8.95 GB | `image-to-3d` |
| `flux_trellis2` | FLUX 3 Image Klein (distilled) then TRELLIS.2-4B | none | as above, plus Klein DiT: no, upsampler: no, Qwen3-VL 4B: yes, flux2-vae: yes | none (core) | 24 GB | 35.99 GB | `text-to-3d` |
| `trellis2_character` | FLUX 3 Image Klein edit then TRELLIS.2-4B | none | as `flux_trellis2` | none (core) | 24 GB | 35.99 GB | `character-to-3d` |
| `trellis2_turntable` | TRELLIS.2-4B, core `RenderMesh`, no Blender | none | as `trellis2_image` | none (core) | 24 GB | 8.95 GB | `turntable` |
| `hyworld2` | skipped | | | | | | `world-3d` |

All four graphs are **Pod-only today**: Comfy Cloud runs the TRELLIS.2 nodes but does not list any TRELLIS.2 file.

Blockers the integrator must fix before a Pod run returns a `.glb` (details in "Integration"):

1. **comfy-api-proxy drops 3D outputs.** v0.1.6 (the version `server/podBoot.js` installs) and its `main` branch (`1569dc17`, 2026-08-27) map only the history keys `images`, `gifs`, `audio`, `text`, `files` and `latents`. `SaveGLB` reports under `3d`, so the job ends with no outputs and `runComfy` throws "The Pod finished but returned no media." [Verified: `comfy_api_proxy/app.py` `_OUTPUT_KIND` and `_outputs()` in the 0.1.6 wheel and on GitHub main]
2. **The Pod has no `background_removal` model folder.** `DIRS` in `server/podBoot.js` lists 8 folders, so ComfyUI on the Pod cannot see `birefnet.safetensors`. [Verified: `server/podBoot.js` line 53 and the `extra_model_paths.yaml` it writes]
3. `LOADERS` in `shared/modelFiles.js` has no `LoadBackgroundRemovalModel` (see `loaders.json`).

## 1. The model and where it runs

- **TRELLIS.2-4B** (Microsoft, MIT, released 2025-12-01 on Hugging Face, not gated). Image to PBR-textured mesh at a voxel resolution of 512³ to 1536³. Upstream pipelines: `512`, `1024`, `1024_cascade` (default) and `1536_cascade`. [Verified: HF API `microsoft/TRELLIS.2-4B`; `pipeline.json`; `trellis2/pipelines/trellis2_image_to_3d.py`]
- Upstream sampler values: sparse structure 12 steps, guidance 7.5, rescale 0.7, interval [0.6, 1.0], `rescale_t` 5; shape 12 steps, 7.5, rescale 0.5, interval [0.6, 1.0], `rescale_t` 3; texture 12 steps, guidance 1.0. Background removal: BiRefNet with RMBG-2.0 weights. [Verified: `pipeline.json`]
- Upstream hardware note: "An NVIDIA GPU with at least 24GB of memory is necessary." H100 times: 512³ about 3 s, 1024³ about 17 s, 1536³ about 60 s. [Verified: model card] ComfyUI's port uses an int8 file of 5.25 GB and offloads between stages, so the 24 GB rung should hold it; the mesh post-processing (remesh at 768, UV unwrap, 4096 bakes) has no published memory figure. [Inference]
- **Native core:** yes. `comfy_extras/nodes_trellis2.py` at the pin registers `Trellis2Conditioning`, `Trellis2ShapeStage`, `Trellis2UpsampleStage`, `Trellis2TextureStage`, `EmptyTrellis2LatentStructure`, `VaeDecodeStructureTrellis2`, `VaeDecodeShapeTrellis`, `VaeDecodeTextureTrellis` (plus the Pixal3D conditioning nodes). Comfy's blog dates native support to 0.34.0 (post of 2026-08-31). [Verified: source at the pin; [blog.comfy.org](https://blog.comfy.org/p/trellis2-and-pixal3d-are-now-native); template `minComfyUIVersion` 0.34.0]
- **On Comfy Cloud: not as the lineup note says.** Cloud runs v0.41.1, so it has the nodes. But a search of all 136 Cloud model folders finds no `trellis_2_*`, no `pixal3d_*`, no `dino_v3_vit_l` and no `dino_v3_L_naf_fp32`; `clip_vision` has only `dino_v3_vit_h.safetensors`. The listing is complete for other recent files (`wan_animate_2_distill_int8_convrot`, `minimax_h3_fl2va_pruned_int8_convrot`, `triposplat_fp16` are present). [Verified: `https://cloud.comfy.org/api/experiment/models/<folder>`, 13:05 UTC] The Comfy blog offers "Try on Comfy Cloud". [Verified: blog] So Cloud may hold the files outside the public listing. Test one run on Cloud with a key before marking any file `cloud: true`. [Inference]
- **Licenses:** TRELLIS.2 MIT; Comfy-Org repacks MIT; BiRefNet MIT. The DINOv3 encoder comes from Meta under the DINOv3 License (the official `facebook/dinov3-vitl16-pretrain-lvd1689m` is gated "manual", license `dinov3-license`); the Comfy-Org copy is ungated, but that license still applies to the weights. FLUX 3 Image Klein: FLUX Kommunity License (see `newest-image-models.md`). [Verified: HF API] [Inference: license carry-over]

## 2. The output: `SaveGLB`

- **Class:** `SaveGLB`, display name "Save 3D Model", `comfy_extras/nodes_save_3d.py`, an output node. Inputs: `mesh` (a `MESH`, or any `File3D*`) and `filename_prefix` (default `3d/ComfyUI`). [Verified]
- **File:** one binary glTF 2.0 file per batch item, named `<prefix name>_<counter:05>_.glb` (note the trailing underscore), in the output folder plus the prefix's subfolder. With `filename_prefix: "comfyfield/trellis2"` the first file is `output/comfyfield/trellis2_00001_.glb`. Content: positions, normals, UVs, tangents, a base color texture, an ORM texture (occlusion, roughness, metallic) and a normal map, all embedded as PNG; `asset.generator` is "ComfyUI" and `asset.extras` carries the prompt unless ComfyUI runs with `--disable-metadata`. [Verified: `SaveGLB.execute`, `mesh_item_to_glb_bytes`, `save_glb`] Expect tens of MB per model (700k faces plus a 4096² base color). [Inference]
- **History entry** (`/history/<prompt_id>`, `outputs["35"]`): [Verified: `UI.Saved3DModels.as_dict()` and `UI.SavedResult` in `comfy_api/latest/_ui.py`]

  ```json
  { "3d": [{ "filename": "trellis2_00001_.glb", "subfolder": "comfyfield", "type": "output" }],
    "camera_info": [null], "model_3d_info": [] }
  ```

  Media enrichment can add a `metadata` key to the file entry; it is best effort. [Verified: `comfy_execution/media_enrichment.py`]
- **Download:** `/view?filename=trellis2_00001_.glb&subfolder=comfyfield&type=output`. The content type comes from Python's `mimetypes`; CPython 3.12 and 3.13 do not know `.glb` (3.14 adds `model/gltf-binary`), so expect `application/octet-stream` unless the OS mime table has it. Decide the kind by the `.glb` name. [Verified: `server.py` `/view`; CPython `Lib/mimetypes.py` 3.13 and 3.14]
- **The app:** `runComfy` at `HEAD` keeps only image, video and audio. The working tree already has an uncommitted `outputKind()` in `server/core.js` that maps `.glb` / `model/*` to `3d`, saves with the `.glb` extension, and a `collectComfy()` that reads every array key, which skips `camera_info: [null]`. That covers local and Cloud history; the Pod path still needs the proxy fix (blocker 1). [Verified: `git diff server/core.js` in this worktree]
- **Comfy Cloud / SDK:** the SDK's output type is one of `image | video | audio | text | file | latent` ("nothing silently dropped"); how Cloud labels a `.glb` is untested without a key. [Verified: `@comfyorg/sdk` 0.5.0 `types.gen.ts`] [Inference: likely `file`]

## 3. Graphs

Common to all four (the TRELLIS.2 half, nodes 2 to 35):

- **Template:** `3d_pixal3d_trellis2_image_to_model` with its switch set to TRELLIS.2 (`PrimitiveBoolean` 316 = true picks `UNETLoader` 40 and `Trellis2Conditioning` 299). Pixal3D, MoGe and the switches are removed. [Verified: template]
- **Chain:** image → `LoadBackgroundRemovalModel` (`birefnet.safetensors`) → `RemoveBackground` → `ImageCropToMask` (1024×1024, black) → `CLIPVisionLoader` + `Trellis2Conditioning` → structure `KSampler` (12 steps, CFG 7.5, `euler`/`normal`; model through `CFGOverride` 1.0 from 0.667, `RescaleCFG` 0.7, `ModelSamplingSD3` 5) → `VaeDecodeStructureTrellis2` (`"32"`) → `Trellis2ShapeStage` → 512 shape `KSampler` (20 steps, 7.5, `euler`/`normal`; model through `CFGOverride` 1.0 from 0.769, `RescaleCFG` 0.5) → `Trellis2UpsampleStage` → high-resolution shape `KSampler` (12 steps, 7.5, `euler`/`simple`) → `VaeDecodeShapeTrellis` → `Trellis2TextureStage` → texture `KSampler` (12 steps, CFG 1, `euler`/`normal`, plain model) → `VaeDecodeTextureTrellis` → `RemeshMesh` (768, `udf`, 20 smoothing passes) → `DecimateMesh` (700,000 faces, `midpoint`) → `MeshSmoothNormals` (180) → `UnwrapMesh` (`pec`, 4096, padding 1, weld 0.0002) → `BakeTextureFromVoxel` (4096, reference = dense mesh) + `BakeNormalMapFromMesh` (2048, 0.05) + `BakeAmbientOcclusion` (1024, 64 samples, 0.71) → `ApplyTextureToMesh` → `MeshSmoothNormals` → `SaveGLB`. Every value is the template's widget value. The CFG override and rescale reproduce upstream's guidance interval and rescale, as the template's note says. [Verified: template, `pipeline.json`]
- **Files:** `trellis_2_int8_convrot.safetensors`, `trellis_2_shape_vae_bf16.safetensors`, `trellis_2_texture_vae_bf16.safetensors`, `dino_v3_vit_l.safetensors` (all Comfy-Org/TRELLIS.2) and `birefnet.safetensors` (Comfy-Org/BiRefNet). Exact shapes in `files.json`. [Verified: HF API tree, `lfs.oid`, `lfs.size`]
- **Deviations from the template, and why:**
  - `ImageCropToMask.pad_factor` 1.0, not 1.1. The template shares one crop between Pixal3D (1.1) and TRELLIS.2; the node's tooltip says "pad_factor=1.0 for TRELLIS.2", and upstream crops with `size = int(size * 1)`. [Verified: `nodes_trellis2.py` tooltip; upstream `preprocess_image`]
  - DINOv3 file: `dino_v3_vit_l.safetensors` from Comfy-Org/TRELLIS.2, not the template's `dino_v3_L_naf_fp32.safetensors` from Comfy-Org/Pixal3D. The NAF weights in the latter are read only by Pixal3D conditioning; `CLIPVisionLoader` loads either (NAF is optional, "dinov3 large" is detected by key). [Verified: `comfy/clip_vision.py`, `_build_pixal3d_conditioning` is the only `.naf` user]
  - All four seeds are `{{seed}}`; the template fixes 56, 42, 42 and 43.
  - `PreviewImage`, `MaskPreview`, `Preview3DAdvanced`, `GetMeshInfo`, `PaintMesh`, `VoxelToMesh` and the `MeshToFile3D` → `Save3DAdvanced` pair are dropped. Previews would add image outputs that the app saves as results; `GetMeshInfo` only passes the mesh through. `SaveGLB` takes the `MESH` directly and uses the same serializer as `MeshToFile3D` (`mesh_item_to_glb_bytes`); `Save3DAdvanced` needs a viewport widget value (`viewport_state`) that an API graph does not have. [Verified: `nodes_save_3d.py`]
- **No optional loaders** in any graph, so no `_meta.optional`.

### `trellis2_image` (Photo to 3D model)

- Node 1 `LoadImage` `{{image}}`. Placeholders: `{{image}}`, `{{seed}}`, `{{resolution}}`.
- `{{resolution}}` goes into `Trellis2UpsampleStage.target_resolution` (INT, 1024 to 2048, step 128). 1024 is upstream's default `1024_cascade`; 1536 is `1536_cascade` and the template's value. [Verified]
- **Format change:** the `detail` choice must send `resolution: 1024` (Draft) and `resolution: 1536` (Final), not 512 and 1024. 512 is below the input's minimum and fails validation; a true 512 pipeline skips the upsample stage, which a param cannot do. Also add a format-level `params: { resolution: 1024 }`: `validateFormat` counts only `step.params` keys as supplied for Comfy graphs, and reports "Unmapped workflow placeholder resolution" without it. [Verified: `src/lib/formats/validate.js` line 149; checked in memory with `validateFormat`, 0 reasons after the change]

### `flux_trellis2` (Text to 3D model)

- Nodes 51 to 60 are nodes 1 to 10 of `public/workflows/flux3_klein_t2i.json` (upsampler on, 16 steps, CFG 1), with `EmptyFlux2LatentImage` fixed at 1024×1024 and batch 1, not `{{width}}`/`{{height}}`/`{{count}}`: 3D formats have no aspect, and the crop wants a square. `VAEDecode` 60 feeds `RemoveBackground` and `ImageCropToMask`. `target_resolution` 1536 (the template's value). Placeholders: `{{prompt}}`, `{{seed}}`.
- The format's prompt already asks for one object, three quarter view, plain white background and soft light; the t2i system prompt keeps explicit constraints, so the background survives the upsampler. BiRefNet then cuts it out. [Verified: system prompt text] No format change needed (validates with 0 reasons).

### `trellis2_character` (Character figure)

- The saved character's first picture is `{{image}}` (node 1). TRELLIS.2 takes no text, so the `pose` choice and the format's prompt can only act through an image step. Nodes 60 to 70 follow `image_flux3_klein_distilled_image_edit`: `TextGenerate` (Klein upsampler, image attached) → `CLIPTextEncode` → `ConditioningZeroOut` negative → `ReferenceMultiLatent` (`resize`, 1.0 MP, `images.image0` = the character) → `KSampler` (16 steps, CFG 1, `euler`/`simple`) → `VAEDecode` → the TRELLIS.2 half at 1536. Placeholders: `{{image}}`, `{{prompt}}`, `{{seed}}`.
- **Deviations from that template:**
  - Output latent is a 1024×1024 `EmptyFlux2LatentImage` (the template's own note offers it) instead of the reference-shaped latent, so a head-and-shoulders picture can become a full body figure on a square canvas.
  - The system prompt is BFL's `system_prompts.json["i2i"]` with real line breaks. The template's copy holds literal `\n` and `\"` sequences. [Verified: `black-forest-labs/flux-3-image-klein-pup` (ungated), and BFL's own `workflows/flux3_klein_bf16_i2i.json` uses the same text]
  - The user text goes in BFL's i2i scaffold: `Reference images follow in order (the first image, the second image, ...).\nUser request: {{prompt}}\nOutput the caption.` [Verified: `I2I_SCAFFOLD` in BFL `src/flux3/pup.py` and `StringFormat` 134 in BFL's i2i workflow] Upsampler presence penalty 0 (BFL's i2i value; the template also has 0); the other sampling values are the template's.
  - Not copied: BFL's own workflow adds `ModelSamplingFlux` with mu = ln(16) = 2.77; Comfy's template uses the model default (shift 1.93586). [Verified: both files, `comfy/supported_models.py` `Flux3`] I kept Comfy's, as the shipped t2i graph does.
- **Format change:** `runsOn: 'FLUX 3 Image Klein and TRELLIS.2'`. The prompt's `{character}` fills with the saved name, which the edit model cannot tie to the picture. Proposed: `Turn the character in the first image into a full body figure {pose}. Keep their face, hair, outfit and colors. Show the whole figure centered on a plain white background, in soft even light.` (validates with 0 reasons today).

### `trellis2_turntable` (3D turntable video)

- **Core nodes can render it without Blender.** [Verified] The pin has `RenderMesh` (ray-cast, one view per call, modes `auto`/`texture`/`vertex colors`/`solid`/`normal`/`depth`, `background` color, optional `camera_info`), `CreateCameraInfo` (`orbit` mode: yaw, pitch, distance about a target, Y-up), and core loops (`StartLoop`/`EndLoop`; the server finds the loop body itself in `validate_loops`, so an API graph needs no extra metadata). [Verified: `nodes_mesh_postprocess.py`, `nodes_camera.py`, `nodes_loop.py`, `comfy_execution/validation.py`]
- **Graph:** the TRELLIS.2 half at `target_resolution` 1024 (the faster cascade; the video shows the model at 1024 px [Inference]), base color only (bake at 2048) → `ApplyTextureToMesh` 33 → `StartLoop` (`simple`, 96 iterations) → `ComfyMathExpression` `a * 360 / 96` → `CreateCameraInfo` (orbit, yaw from the loop, pitch 15°, distance 2.4, fov 35, target origin) → `RenderMesh` (`texture`, 1024×1024, `{{background}}`) → `EndLoop` (accumulate) → `RebatchImages` (96) → `CreateVideo` (24 fps) → `SaveVideo` (mp4, h264). Output: a 4 s MP4 under `images` in history, like every `SaveVideo`. Placeholders: `{{image}}`, `{{seed}}`, `{{background}}`.
- **Why these values:** TRELLIS.2 meshes sit in a unit cube about the origin; at fov 35 a distance of 2.4 shows ±0.76 at the center plane, so the object fills about two thirds of the frame. Yaw 0 looks from +Z, the side the photo shows after the Z-up to Y-up turn in `VaeDecodeShapeTrellis` (the same front `RenderMesh` uses by default). [Verified: the axis code] [Inference: framing and front side; check one render]
- **Limits:** `RenderMesh` in `texture` mode shows the unlit base color. It ignores metallic, roughness, normal and AO maps, has no lights or shadows, and builds a BVH on every frame. So "even studio light" and "a soft rim light" are not possible, and the run time for 96 frames of a 700k-face mesh is unknown. Normal and AO bakes are dropped because nothing reads them, and the texture is 2048 for a 1024 px render. [Verified: `_render_view`] [Inference: time] A clay-lit look is possible by also rendering `solid` and blending, untested.
- **Format changes:** `runsOn: 'TRELLIS.2'`; `prompt: ''` (the graph takes no text, and `validateFormat` reports "Workflow has no prompt placeholder" while the format has one); option params become colors, for example `{ background: '#ffffff' }`, `{ background: '#1c1c22' }`, `{ background: '#e6e9f5' }`, plus a format-level `params: { background: '#ffffff' }`; the "Soft color" option is a flat color, not a gradient, and "Dark studio" has no rim light, so their wording should change. The result is an MP4, not a `.glb`, in a format of kind `3d`. Hex values in `three.js` do not trip `theme-check` (it scans `src/styles.css` and JSX `style` attributes). [Verified: `scripts/theme-check.mjs`; `validateFormat` gives 0 reasons after the change]

### `hyworld2` (Explorable world): skipped

No real ComfyUI path. HY-World 2.0's world generation chains HY-Pano 2.0 (about 80B), WorldNav, WorldStereo 2.0 (about 17B) and WorldMirror 2.0 with multi-GPU trajectory rendering and custom CUDA builds (gsplat, FlashAttention, navmesh). The only ComfyUI wrapper, `guoyouworld/ComfyUI-HY-World-2.0` (1 star, last push 2026-06-12), needs that separate install; Cloud lists no HY-World pack. [Verified: Tencent-Hunyuan/HY-World-2.0 README, GitHub API, `comfy.org/cloud/supported-nodes.md`] A core-only stand-in would be a 360° panorama (Qwen-Image with the 425M `HY-Pano-2-Qwen` LoRA) → MoGe panorama to mesh (template `3d_moge_panorama_to_mesh`). Not drafted. [Inference]

## 4. Integration

1. Add the five entries of `files.json` to `MODEL_FILES`, and `loaders.json` to `LOADERS`. FLUX 3 files are already listed.
2. Add `background_removal` to `DIRS` in `server/podBoot.js`, so the Pod creates and maps the folder.
3. Patch comfy-api-proxy on the Pod so `3d` outputs reach the SDK, for example after its `pip install`: insert `"3d": "file",` into `_OUTPUT_KIND` in `site-packages/comfy_api_proxy/app.py`, and raise it upstream (Comfy-Org/comfy-api-proxy). Without it a Pod run makes the `.glb` but returns no output.
4. Copy the four graphs to `public/workflows/` and refresh `schemas.comfy` (`scripts/format-check.mjs` asserts it). Apply the format changes above.
5. Test once on a Pod: one `image-to-3d` Draft run (check the `.glb` opens), one `turntable` run (check framing, front side and time).

## Sources

- ComfyUI at the pin: `comfy_extras/nodes_trellis2.py`, `nodes_save_3d.py`, `nodes_mesh_postprocess.py`, `nodes_bg_removal.py`, `nodes_images.py`, `nodes_camera.py`, `nodes_gaussian_splat.py`, `nodes_loop.py`, `nodes_edit_model.py`, `nodes_textgen.py`, `nodes_video.py`, `nodes_rebatch.py`, `nodes_math.py`, `nodes_custom_sampler.py`, `nodes_model_advanced.py`, `nodes.py`, `folder_paths.py`, `server.py`, `execution.py`, `comfy_execution/validation.py`, `comfy_execution/media_enrichment.py`, `comfy_api/latest/_ui.py`, `comfy_api/latest/_io.py`, `comfy/clip_vision.py`, `comfy/supported_models.py`, `comfy/samplers.py`.
- [workflow_templates](https://github.com/Comfy-Org/workflow_templates): `templates/3d_pixal3d_trellis2_image_to_model.json`, `templates/image_flux3_klein_distilled_image_edit.json`, `templates/index.json`.
- Hugging Face API: [Comfy-Org/TRELLIS.2](https://huggingface.co/Comfy-Org/TRELLIS.2), [Comfy-Org/BiRefNet](https://huggingface.co/Comfy-Org/BiRefNet), [Comfy-Org/Pixal3D](https://huggingface.co/Comfy-Org/Pixal3D), [microsoft/TRELLIS.2-4B](https://huggingface.co/microsoft/TRELLIS.2-4B), [facebook/dinov3-vitl16-pretrain-lvd1689m](https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m), [black-forest-labs/flux-3-image-klein-pup](https://huggingface.co/black-forest-labs/flux-3-image-klein-pup), [ml-resources/flux-3-image-klein-comfy](https://huggingface.co/ml-resources/flux-3-image-klein-comfy) (BFL workflows).
- [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2) (`trellis2/pipelines/trellis2_image_to_3d.py`), [black-forest-labs/flux-3-image-klein](https://github.com/black-forest-labs/flux-3-image-klein) (`src/flux3/pup.py`).
- Comfy Cloud: `https://cloud.comfy.org/api/experiment/models` and `/api/system_stats`; [supported nodes](https://comfy.org/cloud/supported-nodes.md); [Comfy blog, 2026-08-31](https://blog.comfy.org/p/trellis2-and-pixal3d-are-now-native).
- comfy-api-proxy 0.1.6 wheel (PyPI) and [GitHub main](https://github.com/Comfy-Org/comfy-api-proxy); `@comfyorg/sdk` 0.5.0 in `node_modules`.
- [Tencent-Hunyuan/HY-World-2.0](https://github.com/Tencent-Hunyuan/HY-World-2.0), [guoyouworld/ComfyUI-HY-World-2.0](https://github.com/guoyouworld/ComfyUI-HY-World-2.0).
