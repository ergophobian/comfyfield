# Image models for ComfyField: FLUX 3 Image Klein and Qwen-Image 2.1

> In the repo the graphs are `public/workflows/flux3_klein_t2i.json` and `qwen_image21_t2i.json`; the no-upsampler variant was not added. Decisions: [newest-models.md](newest-models.md).

Checked on 2026-10-17. Comfy Cloud model listing read at 13:38 UTC that day. Sizes are decimal GB (bytes / 1e9) from the Hugging Face API with `?blobs=true`.

Every claim has a tag:

- `[Verified: URL]`: read from that primary source.
- `[Inference]`: my conclusion from verified facts. It is not stated in a source.

Graph files in this folder (API format, valid JSON):

- `flux3_klein_t2i.json`: FLUX 3 Image Klein distilled, with the official prompt upsampler (the recommended path).
- `flux3_klein_t2i_no_upsampler.json`: the same graph without the upsampler. It downloads 6.72 GB less, but BFL says that output from a short prompt is generic.
- `qwen_image21_t2i.json`: Qwen-Image 2.1 Turbo, 8 steps.

Placeholders follow `public/workflows/*.json`: `"{{prompt}}"`, `"{{width}}"`, `"{{height}}"`, `"{{seed}}"`, `"{{count}}"` (batch size). Each value is the whole placeholder string.

## Summary

| | FLUX 3 Image Klein (distilled) | Qwen-Image 2.1 Turbo |
|---|---|---|
| Graph | `flux3_klein_t2i.json` | `qwen_image21_t2i.json` |
| Sampling | KSampler, 16 steps, cfg 1, euler, simple | SamplerCustomAdvanced, 8 fixed sigmas, cfg 1, euler |
| Files the graph loads | 4 files, 27.04 GB (3 files, 20.32 GB without upsampler) | 3 files, 32.44 GB |
| On Comfy Cloud now | Text encoder and VAE: yes. **DiT and upsampler: no** | Text encoder: yes. **DiT and VAE: no** |
| First ComfyUI release | v0.41.0 (2026-10-15) | v0.37.0 (2026-09-20) |
| Runs on v0.33.1 (72865f4) | **No** | **No** |
| Gated on Hugging Face | **Yes** (official BFL repos: login and license click) | No |
| Minimum VRAM | 8 GB with int8 files; 24 GB+ for the bf16 graph | about 24 GB for the bf16 graph [Inference]; about 12 to 16 GB with int8 files [Inference] |
| Time per 1024x1024 image | 3.9 s on RTX PRO 6000 (int8, 16 steps); about 3 s on H200 | no official figure; about 3 to 5 s [Inference] |
| Custom nodes | none | none |
| License | FLUX Kommunity License (non-commercial, plus commercial outputs under US$5M revenue) | Qwen Research License (non-commercial only) |

Blockers:

1. Comfy Cloud runs ComfyUI v0.41.1, so it has every node and both architectures. But it does not have the FLUX 3 DiT, the FLUX 3 upsampler, the Qwen-Image 2.1 DiT or the Qwen-Image 2.1 VAE. Neither graph can run on Cloud today.
2. The v0.33.1 Pod does not have either architecture. Upgrade the Pod to v0.41.1 (the version Cloud runs) for both models.
3. The official FLUX 3 weights are in gated repos. `shared/modelFiles.js` says "Public Hugging Face repos only". A Pod needs an HF token that accepted the license, or a byte-identical public copy (see the FLUX "Files" section).

---

## 1. FLUX 3 Image Klein

### 1.1 Workflow (`flux3_klein_t2i.json`)

Source: the official template `templates/image_flux3_klein_distilled_t2i.json` in Comfy-Org/workflow_templates at commit `9afccb38bb9173575411189a75f4fc6cc8acd06c` (2026-10-17). I flattened its subgraph into API format. I removed the UI-only nodes (ResolutionSelector, ComfySwitchNode, PreviewAny, CreateBoundingBoxes, Flux3LayoutPrompt, MarkdownNote). [Verified: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_flux3_klein_distilled_t2i.json]

The API conversion follows the official API-format benchmark of the same template, which Comfy-Org later removed because the weights are gated (commit `283a4c3`, 2026-10-15). It uses the same node set, input names and `sampling_mode.*` keys. [Verified: https://github.com/Comfy-Org/workflow_templates/commit/283a4c3bdf52a49f679aa8cb0c1b93e9d0d6b719]

Graph:

```
UNETLoader(flux3-image-klein-bf16) ───────────────────────────────┐
CLIPLoader(qwen3.5_9b_flux3_prompt_upsampler_w4a8, flux3) → TextGenerate("{{prompt}}", t2i system prompt)
CLIPLoader(qwen3vl_4b_bf16, flux3) → CLIPTextEncode(upsampled caption) → KSampler ← EmptyFlux2LatentImage({{width}},{{height}},{{count}})
                                   → CLIPTextEncode("") (negative) ──┘
VAELoader(flux2-vae) → VAEDecode → SaveImage("comfyfield/flux3-klein")
```

Nodes and the first ComfyUI version that has each one:

| Node | Where | In v0.33.1 | Notes |
|---|---|---|---|
| UNETLoader, CLIPLoader, VAELoader, CLIPTextEncode, KSampler, VAEDecode, SaveImage | `nodes.py` | yes | CLIPLoader `type: "flux3"` was added in v0.41.0 (commit 20b46065) |
| EmptyFlux2LatentImage | `comfy_extras/nodes_flux.py` | yes | added with FLUX.2 |
| TextGenerate | `comfy_extras/nodes_textgen.py` | yes, but old | `mtp` input from v0.37.0; `system_prompt` input from v0.37.2 (commit 0fd655fb) |

[Verified: `git grep` over the tags of https://github.com/Comfy-Org/ComfyUI; commit https://github.com/Comfy-Org/ComfyUI/commit/0fd655fb93d658f45e712035c78dcd937881fd7a]

Settings and why:

- **Checkpoint: distilled.** BFL recommends it for "generation and editing, self-hosting". It is "the same model in 16 steps without CFG, about 6x faster" than Base, and it is the checkpoint behind the BFL API. [Verified: https://github.com/black-forest-labs/flux-3-image-klein] [Verified: https://huggingface.co/black-forest-labs/flux-3-image-klein]
- **Steps 16, cfg 1, sampler `euler`, scheduler `simple`, denoise 1.** These are the exposed values of the official template (the inner KSampler widget has 15/`er_sde`, but the subgraph inputs override them with 16/`euler`/`simple`). The model card says "16 steps and no guidance for the distilled checkpoint". The docs allow 4 to 16 steps. [Verified: template above] [Verified: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy] [Verified: https://docs.comfy.org/tutorials/flux/flux-3-klein]
- KSampler works for this flow-map model. ComfyUI's FLUX 3 model reads the target time from `transformer_options["sample_sigmas"]`, so any scheduler gives it the next sigma. [Verified: `comfy/ldm/flux3/model.py` lines 162-168, https://github.com/Comfy-Org/ComfyUI/blob/master/comfy/ldm/flux3/model.py]
- **Prompt upsampler on.** BFL: "Do not use the model without a prompt upsampler... a short prompt sent as typed gives generic output." The official template has the upsampler on by default. [Verified: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy]
- TextGenerate values are copied from the current distilled template: `max_length` 3584, `sampling_mode` on, temperature 1, `top_k` 1 (greedy in effect), `top_p` 0.95, `min_p` 0, `repetition_penalty` 1.05, `presence_penalty` 1.5, `thinking` false, `use_default_template` true, `mtp` "off". The system prompt is `system_prompts.json["t2i"]` from the upsampler repo. It matches the template's text except for one trailing newline. BFL's own decoding is "greedy, top_p 0.95, top_k 20, presence penalty 1.5 for text-to-image". [Verified: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup] [Verified: https://github.com/black-forest-labs/flux-3-image-klein/blob/main/src/flux3/pup.py]
- **Change from the template:** `sampling_mode.seed` is fixed at `0`, not linked to `{{seed}}`. With `top_k` 1 the caption does not depend on the seed. A fixed value lets ComfyUI reuse the cached caption when only the seed changes, which avoids a second 9B-model run per re-roll. [Inference]
- The template sends the prompt as typed. It does not add a "TARGET CANVAS: W:H" line, and BFL's `pup.py` does not add one for text-to-image either. [Verified: pup.py above]
- Negative prompt: an empty CLIPTextEncode, as in the template. At cfg 1, ComfyUI skips the negative pass. [Verified: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1 (same KSampler behaviour)]
- Size: EmptyFlux2LatentImage has step 16, so width and height must be multiples of 16. BFL lists output "up to 4K". [Verified: `comfy_extras/nodes_flux.py`] [Verified: https://github.com/black-forest-labs/flux-3-image-klein]
- Weights: bf16 DiT and bf16 text encoder. The template ships int8 "to keep the footprint small" and says: "With more than 24 GB of VRAM, use the bf16 weights instead". An RTX PRO 6000 or H100 Pod has more than 24 GB. The `qwen3vl_4b_bf16.safetensors` name also exists on Cloud. For an 8 to 16 GB GPU, use `flux3-image-klein-int8-convrot.safetensors` and `qwen3vl_4b_int8_convrot.safetensors`. [Verified: template MarkdownNote]
- Upsampler: w4a8, as in the current template (smallest and fastest). The bf16 file is byte-identical to BFL's reference upsampler, if exact reference behaviour is needed. [Verified: sha256 in the HF API, see 1.2]
- Model support detail: FLUX 3 runs in bf16 or fp32 only (`supported_inference_dtypes = [torch.bfloat16, torch.float32]`). [Verified: `comfy/supported_models.py`, class Flux3]

### 1.2 Files

Folder for all official files: `black-forest-labs/flux-3-image-klein-comfy`, **gated: "auto"** (log in and accept the FLUX Kommunity License; approval is automatic; downloads need a token). [Verified: https://huggingface.co/api/models/black-forest-labs/flux-3-image-klein-comfy?blobs=true]

Files the graph loads:

| Loader filename | ComfyUI folder | Official HF repo : path | Size | Gated | On Cloud |
|---|---|---|---|---|---|
| `flux3-image-klein-bf16.safetensors` | diffusion_models | black-forest-labs/flux-3-image-klein-comfy : `diffusion_models/flux3-image-klein-bf16.safetensors` | 11.10 GB (11,097,404,512 B) | yes | **no** |
| `qwen3vl_4b_bf16.safetensors` | text_encoders | black-forest-labs/flux-3-image-klein-comfy : `text_encoders/qwen3vl_4b_bf16.safetensors` | 8.88 GB (8,875,719,408 B) | yes | **yes, same name** |
| `flux2-vae.safetensors` | vae | black-forest-labs/flux-3-image-klein-comfy : `vae/flux2-vae.safetensors` | 0.34 GB (336,211,292 B) | yes | **yes, same name** |
| `qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors` | text_encoders | black-forest-labs/flux-3-image-klein-comfy : `text_encoders/qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors` | 6.72 GB (6,724,090,780 B) | yes | **no** |

Other precisions in the same repo:

| File | Size |
|---|---|
| `diffusion_models/flux3-image-klein-int8-convrot.safetensors` (template default) | 5.83 GB |
| `diffusion_models/flux3-image-klein-nvfp4.safetensors` (needs Blackwell) | 5.28 GB |
| `text_encoders/qwen3vl_4b_int8_convrot.safetensors` (template default) | 4.86 GB |
| `text_encoders/qwen3.5_9b_flux3_prompt_upsampler_int8_convrot.safetensors` | 9.75 GB |
| `text_encoders/qwen3.5_9b_flux3_prompt_upsampler_bf16.safetensors` | 18.82 GB |
| Base checkpoint: `diffusion_models/flux3-image-klein-base-{bf16,int8-convrot,nvfp4}.safetensors` | 11.08 / 5.81 / 5.26 GB |

[Verified: HF API above]

Sources without the gate (sha256 is from the HF API LFS metadata):

| Need | Ungated source | Identity |
|---|---|---|
| `flux2-vae.safetensors` | Comfy-Org/vae-text-encorder-for-flux-klein-4b : `split_files/vae/flux2-vae.safetensors` | **byte-identical** (sha256 `868fe7b3…` on both, and equal to BFL's `ae.safetensors`) [Verified: https://huggingface.co/api/models/Comfy-Org/vae-text-encorder-for-flux-klein-4b?blobs=true] |
| `qwen3vl_4b_bf16.safetensors` | Comfy-Org/Qwen3-VL : `text_encoders/qwen3vl_4b_bf16.safetensors` (8.88 GB, 8,875,719,384 B) | not byte-identical: the BFL copy adds `__metadata__ {"format":"pt"}` (24 bytes). Both are Qwen3-VL-4B-Instruct. The 713 tensor names, shapes, dtypes and data offsets are equal, and 7 sampled 64 KB data ranges are equal. [Verified: safetensors headers by HTTP range request; https://huggingface.co/Comfy-Org/Qwen3-VL] Same weights [Inference] |
| upsampler (bf16) | black-forest-labs/flux-3-image-klein-pup : `model.safetensors` (18.82 GB, Apache-2.0, **not gated**) | **byte-identical** to `qwen3.5_9b_flux3_prompt_upsampler_bf16.safetensors` (sha256 `f5062a1f…`). It must be saved under that loader name. [Verified: https://huggingface.co/api/models/black-forest-labs/flux-3-image-klein-pup?blobs=true] |
| DiT (any precision) | no Comfy-Org copy. Third-party ungated mirror: `ml-resources/flux-3-image-klein-comfy` has every file of the official comfy repo with **identical sha256** (for example, bf16 DiT `c3e9813c…`, w4a8 upsampler `e5d85a74…`). `unsloth/flux-3-image-klein` : `model.safetensors` is identical to the bf16 DiT. | byte-identical [Verified: https://huggingface.co/api/models/ml-resources/flux-3-image-klein-comfy?blobs=true]. Third-party redistribution: decide on the license before use (the team deferred the license review). |

The bf16 DiT is also the gated `black-forest-labs/flux-3-image-klein` : `model.safetensors` (same sha256). [Verified: https://huggingface.co/api/models/black-forest-labs/flux-3-image-klein?blobs=true]

**Name churn warning.** On 2026-10-17 the templates renamed `flux3_image_klein_sd_int8_convrot.safetensors` to `flux3-image-klein-int8-convrot.safetensors` (commit c6ebd1e). docs.comfy.org still shows the old names. The names in this file match the HF repo and the templates on 2026-10-17. [Verified: https://github.com/Comfy-Org/workflow_templates/commit/c6ebd1eef2b431e855b42104f0cb4d3862f68941] [Verified: https://docs.comfy.org/tutorials/flux/flux-3-klein]

### 1.3 Comfy Cloud

Cloud listing, 2026-10-17 13:38 UTC: I read all 136 folders, and no folder has a name with `flux3`, `flux-3` or `upsampler`. [Verified: https://cloud.comfy.org/api/experiment/models and each `/api/experiment/models/<folder>`]

- diffusion_models: **no FLUX 3 file.** Cloud has FLUX.2 Klein only (`flux-2-klein-4b.safetensors`, `flux-2-klein-9b.safetensors` and their variants). [Verified: https://cloud.comfy.org/api/experiment/models/diffusion_models]
- text_encoders: `qwen3vl_4b_bf16.safetensors` and `qwen3vl_4b_fp8_scaled.safetensors` exist. `qwen3vl_4b_int8_convrot.safetensors` (the template default) does not. No upsampler file exists. `qwen3.5_9b_bf16.safetensors` is the stock Qwen3.5-9B, not BFL's fine-tune. [Verified: https://cloud.comfy.org/api/experiment/models/text_encoders]
- vae: `flux2-vae.safetensors` exists. Both HF files with this name (Comfy-Org/flux2-dev, sha256 `d64f3a68…`, and the Klein 4B copy, sha256 `868fe7b3…`) are byte-identical to FLUX 3 Klein VAE files (`vae/diffusion_pytorch_model.safetensors` and `ae.safetensors`). So Cloud's file has the FLUX 3 VAE weights, whichever copy it is. [Verified: HF API sha256] [Inference for which copy Cloud has]
- Cloud reports `"comfyui_version":"v0.41.1"`, so it has the FLUX 3 architecture and the `flux3` CLIP type. [Verified: https://cloud.comfy.org/api/system_stats]
- docs.comfy.org shows "Run on Comfy Cloud" buttons for the FLUX 3 templates, but the listing does not have the files. Cloud will possibly add them soon. [Verified: https://docs.comfy.org/tutorials/flux/flux-3-klein] [Inference]

Graph with names on both Cloud and HF: no such graph exists today, because Cloud has no FLUX 3 DiT. `flux3_klein_t2i.json` uses the two names that exist on both (`qwen3vl_4b_bf16.safetensors`, `flux2-vae.safetensors`). If Cloud adds the DiT under the HF name, only the upsampler stays missing. Then the fallback is `flux3_klein_t2i_no_upsampler.json`, or TextGenerate on Cloud's `qwen3.5_9b_bf16.safetensors` with the same system prompt. BFL says "any other LLM can do the job" with `system_prompts.json`. [Verified: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup] [Inference that the stock model gives acceptable captions]

### 1.4 ComfyUI version

- **v0.33.1 (72865f4, 2026-08-13) cannot run the graph.** It has no FLUX 3 model detection or `comfy/ldm/flux3/`, and its CLIPLoader `type` list has no `"flux3"`. Prompt validation fails on the CLIPLoader type, and UNETLoader cannot detect the model. TextGenerate in v0.33.1 also has no `system_prompt` or `mtp` input. [Verified: `git show v0.33.1:nodes.py`, `git show v0.33.1:comfy/supported_models.py`, https://github.com/Comfy-Org/ComfyUI/tree/v0.33.1]
- **First release: v0.41.0** (tag commit `98cc0bf84b7cb1383654c5b402e7612d875d6d22`, 2026-10-15). It contains "Support Flux3-image (#17064)", commit `20b46065ef7f34fa21e8abebe8d0cca90a904d6d`: the model, the `flux3` CLIP type, the `Flux3LayoutPrompt` node and LoRA keys. [Verified: https://github.com/Comfy-Org/ComfyUI/commit/20b46065ef7f34fa21e8abebe8d0cca90a904d6d; `git merge-base --is-ancestor 20b46065 v0.41.0`]
- The template index says `"minComfyUIVersion": "0.41.0"`. docs.comfy.org says "0.41.0 or later (shipped in the 0.41.1 backport, ComfyUI#17070)". [Verified: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/index.json] [Verified: https://docs.comfy.org/tutorials/flux/flux-3-klein]
- Quantized formats: int8 convrot from v0.27.0 (commit 1a510f04), w4a8 from v0.31.0 (commit 344b4398). Both are in v0.33.1, but that does not help without the architecture. [Verified: `git tag --contains`]
- The Pod upgrade also changes Python pins (v0.33.1 to v0.41.1): `comfy-kitchen` 0.2.31 to 0.2.37, `comfy-aimdo` 0.4.13 to 0.5.6, `av>=17.0.0`, frontend 1.55.17, templates 0.11.85. `torchaudio` is no longer in `requirements.txt`. [Verified: `git diff v0.33.1 v0.41.1 -- requirements.txt`]

### 1.5 VRAM and speed

- ComfyUI int8 files: "The int8 files run on 8 GB GPUs such as the RTX 3070." This is the minimum, with ComfyUI offload. [Verified: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy] [Verified: https://github.com/black-forest-labs/flux-3-image-klein]
- bf16 in ComfyUI: the template says to use bf16 "with more than 24 GB of VRAM". **Use 24 GB as the minimum for `flux3_klein_t2i.json`.** [Verified: template note] On a 24 GB card, ComfyUI must swap the 9B upsampler out before it loads the DiT. On 80 to 96 GB, all four files stay resident (about 27 GB of weights). [Inference]
- Reference code (not ComfyUI), B200, 1024x1024, upsampler off: peak 31 GB bf16, 26 GB FP8, 25 GB NVFP4. "The prompt upsampler adds about 28 GB on an 80 GB GPU" (the reference code reserves 35% of the GPU for it). [Verified: https://huggingface.co/black-forest-labs/flux-3-image-klein] [Verified: https://github.com/black-forest-labs/flux-3-image-klein]
- Speed, distilled, 16 steps, text-to-image at 1024x1024, "fastest build per GPU": **RTX PRO 6000 (int8, the ComfyUI files) 3.9 s**, RTX 5090 4.1 s, GB300 (NVFP4) 0.55 s. At 2048x2048: RTX PRO 6000 12.1 s. [Verified: chart `assets/benchmark_distilled.png` in https://github.com/black-forest-labs/flux-3-image-klein]
- "On one H200 at 1 MP: about 3 s [distilled] against 12 s [Base] per image." There is no H100 figure. H100 is probably close to H200 for this compute-bound model, so about 3 to 4 s. [Verified: same README] [Inference for H100]
- The charts do not say if the upsampler time is included. A 9B w4a8 model that writes a 100 to 350 word caption probably adds a few seconds per new prompt. [Inference]

### 1.6 Custom nodes and license

- Custom nodes: **none.** Every node is in core ComfyUI v0.41.0 or later. [Verified: node table above]
- License: FLUX Kommunity License v1.0. It allows non-commercial use, plus commercial output generation for Qualifying Users with less than US$5M gross annual revenue. The text encoder (Qwen3-VL-4B-Instruct) and the upsampler are Apache-2.0. [Verified: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy]

---

## 2. Qwen-Image 2.1

### 2.1 Workflow (`qwen_image21_t2i.json`)

Source: the official template `templates/image_qwen_image_2_1_turbo_t2i.json` in Comfy-Org/workflow_templates (last changed in commit `0cf483d1dcb548b8b8d3f38ddf0ff41c89896cdb`, 2026-10-14), flattened to API format. The input names match the official API-format benchmark `benchmarks/image_qwen_image_2_1_t2i.json`. [Verified: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json] [Verified: https://github.com/Comfy-Org/workflow_templates/blob/main/benchmarks/image_qwen_image_2_1_t2i.json]

Graph:

```
UNETLoader(qwen_image_2.1_turbo_bf16) ─────────────────────────────┐
CLIPLoader(qwen3vl_8b_bf16, qwen_image) → TextEncodeQwenImage21("{{prompt}}", "") → CFGGuider(cfg 1)
KSamplerSelect(euler), ManualSigmas(8-step), RandomNoise({{seed}}), EmptyLatentImage({{width}},{{height}},{{count}})
  → SamplerCustomAdvanced → VAEDecode ← VAELoader(qwen_image_2.1_vae_bf16) → SaveImage("comfyfield/qwen-image-2.1")
```

| Node | In v0.33.1 | First release |
|---|---|---|
| TextEncodeQwenImage21 | **no** | v0.37.0 (commit 6bfaacc6) |
| UNETLoader, CLIPLoader (`qwen_image` type), VAELoader, EmptyLatentImage, VAEDecode, SaveImage | yes (but no Qwen-Image 2.1 model, text encoder or VAE support) | Qwen-Image 2.1 support: v0.37.0 |
| CFGGuider, KSamplerSelect, ManualSigmas, RandomNoise, SamplerCustomAdvanced | yes | |

[Verified: `git grep` over the tags; https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_extras/nodes_qwen.py]

Settings and why:

- **Checkpoint: Turbo.** It is "an accelerated checkpoint of Qwen-Image-2.1... with 8 denoising steps", with the same 7B architecture. Base needs about 40 to 50 steps (the template uses 25). [Verified: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo] [Verified: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1]
- **Sigmas `1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0`, sampler `euler`, cfg 1.** These are the template values. The first 8 values are the `sample_sigmas` that Qwen saved in the Turbo `model_index.json`; the template adds the final 0. Qwen: "Setting `num_inference_steps` alone does not override it... other schedules have not been evaluated". [Verified: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/model_index.json] [Verified: Turbo README]
- cfg 1 is the published path, and at cfg 1 the negative prompt has no effect. [Verified: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1]
- `TextEncodeQwenImage21.resolution` = 1024 is the node default. It only resizes reference images, so it has no effect on text-to-image. [Verified: `comfy_extras/nodes_qwen.py`]
- **Not included (optional in the template):**
  - The **prompt enhancer.** It is off by default in both Qwen templates. It needs `thinking` on and a 4096 to 16256 token budget, so "a single rewrite" can "run for many minutes". [Verified: template MarkdownNote "Note: PE"]
  - **QwenImage21Cache.** It is experimental, and its default `auto` is what the model already uses without the node. [Verified: node description in `comfy_extras/nodes_qwen.py`]
- EmptyLatentImage gives a 4-channel /8 latent. ComfyUI converts an empty latent to the model's 64-channel /16 format (`fix_empty_latent_channels`), and the template does the same. [Verified: `comfy/sample.py`, `comfy/latent_formats.py` class QwenImage21]
- Size: native 2K. The official presets go up to 2048x2048 (1:1), 2752x1536 (16:9) and 1536x2752 (9:16). Use multiples of 32. [Verified: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo] [Verified: template note "Prefer multiples of 32"]
- Output is **RGBA**: the 2.1 VAE decodes 4 channels, so SaveImage writes RGBA PNGs. Alpha is opaque unless the prompt asks for transparency ("This is an RGBA image with transparency. ... The image has alpha channel and the background is transparent."). [Verified: commit 6bfaacc6 `comfy/sd.py` "RGBA", `pad_channel_value = 1.0`; https://huggingface.co/Qwen/Qwen-Image-2.1] [Inference that every output has 4 channels]
- Weights: bf16 DiT and bf16 text encoder, for quality on a large GPU. `qwen3vl_8b_bf16.safetensors` is also on Cloud. For 12 to 16 GB GPUs, use `qwen_image_2.1_turbo_int8_convrot.safetensors` and `qwen3vl_8b_int8_convrot.safetensors` (the template defaults). [Inference]
- Model support detail: bf16 or fp32 only. [Verified: `comfy/supported_models.py`, class QwenImage21]

### 2.2 Files

Folder: `Comfy-Org/Qwen-Image-2.1`, **not gated**. It is the ComfyUI repack of Qwen/Qwen-Image-2.1 and Qwen/Qwen-Image-2.1-Turbo (both also not gated). [Verified: https://huggingface.co/api/models/Comfy-Org/Qwen-Image-2.1?blobs=true] [Verified: https://huggingface.co/api/models/Qwen/Qwen-Image-2.1?blobs=true]

Files the graph loads:

| Loader filename | ComfyUI folder | HF repo : path | Size | Gated | On Cloud |
|---|---|---|---|---|---|
| `qwen_image_2.1_turbo_bf16.safetensors` | diffusion_models | Comfy-Org/Qwen-Image-2.1 : `diffusion_models/qwen_image_2.1_turbo_bf16.safetensors` | 14.23 GB (14,230,280,616 B) | no | **no** |
| `qwen3vl_8b_bf16.safetensors` | text_encoders | Comfy-Org/Qwen-Image-2.1 : `text_encoders/qwen3vl_8b_bf16.safetensors` | 17.53 GB (17,534,334,616 B) | no | **yes, same name** |
| `qwen_image_2.1_vae_bf16.safetensors` | vae | Comfy-Org/Qwen-Image-2.1 : `vae/qwen_image_2.1_vae_bf16.safetensors` | 0.68 GB (675,509,688 B) | no | **no** |

`qwen3vl_8b_bf16.safetensors` in Comfy-Org/Qwen-Image-2.1 and in Comfy-Org/Qwen3-VL has the same sha256 (`68bdc82b…`), so it is the stock Qwen3-VL-8B-Instruct repack. [Verified: https://huggingface.co/api/models/Comfy-Org/Qwen3-VL?blobs=true]

Other files in Comfy-Org/Qwen-Image-2.1:

| File | Size |
|---|---|
| `diffusion_models/qwen_image_2.1_turbo_int8_convrot.safetensors` | 7.26 GB |
| `diffusion_models/qwen_image_2.1_bf16.safetensors` / `_int8_convrot` (base) | 14.23 / 7.26 GB |
| `text_encoders/qwen3vl_8b_int8_convrot.safetensors` | 9.35 GB |
| `text_encoders/qwen3vl_8b_w4a8.safetensors` | 6.31 GB |
| `text_encoders/qwen3.5_9b_qwen_image_2.1_pe_t2i.int8_convrot.safetensors` / `_pe_t2i_w4a8` (prompt enhancer) | 9.47 / 6.72 GB |
| `loras/qwen_image_2.1_turbo_lora_avg_rank_178_bf16.safetensors` (Turbo as a LoRA on base) | 0.91 GB |
| `model_patches/qwen_image_2.1_fun_controlnet_union_{bf16,int8_convrot}.safetensors` | 7.55 / 3.78 GB |

The template MarkdownNote shows sizes in GiB ("13.25 GB", "6.76 GB"). The HF byte counts above are the exact values. [Verified: HF API]

### 2.3 Comfy Cloud

- diffusion_models: **no `qwen_image_2.1_*` file** in any precision. Cloud has only Qwen-Image 1.x files (`qwen_image_bf16`, `qwen_image_2512_*`, `qwen_image_edit_25xx_*`, `qwen_image_layered_*`). [Verified: https://cloud.comfy.org/api/experiment/models/diffusion_models]
- vae: **no `qwen_image_2.1_vae_bf16.safetensors`.** Cloud's `qwen_image_vae.safetensors` is the Qwen-Image 1.x VAE (16 channels). It cannot replace the 64-channel RGBA 2.1 VAE. [Verified: https://cloud.comfy.org/api/experiment/models/vae] [Inference for the incompatibility, from the latent formats in `comfy/latent_formats.py`]
- text_encoders: `qwen3vl_8b_bf16.safetensors`, `qwen3vl_8b_fp8_scaled.safetensors` and `qwen3vl_8b_nvfp4.safetensors` exist. `qwen3vl_8b_int8_convrot.safetensors` (the template default), `qwen3vl_8b_w4a8.safetensors` and the PE models do not. [Verified: https://cloud.comfy.org/api/experiment/models/text_encoders]
- Cloud's ComfyUI v0.41.1 has every node in the graph. [Verified: https://cloud.comfy.org/api/system_stats]

Graph with names on both Cloud and HF: only the text encoder name can be shared, and `qwen_image21_t2i.json` uses it (`qwen3vl_8b_bf16.safetensors`). The DiT and the VAE are not on Cloud. **Qwen-Image 2.1 cannot run on Cloud today.**

### 2.4 ComfyUI version

- **v0.33.1 cannot run the graph.** It has no `TextEncodeQwenImage21` node, no `comfy/ldm/qwen_image21`, no Qwen3-VL-8B `qwen_image` text-encoder path and no RGBA 2.1 VAE support. [Verified: `git show v0.33.1:comfy/sd.py` has no `qwen_image21`; node check above]
- **First release: v0.37.0** (tag commit `73c9bad4d21e7addbe1d13bc92eee0f1431b017d`, 2026-09-20). It contains "feat: Qwen-image 2.1 support (CORE-423) (#16400)", commit `6bfaacc67c2103481e5f0c84d75257cd0581d86a` (2026-09-19). [Verified: https://github.com/Comfy-Org/ComfyUI/commit/6bfaacc67c2103481e5f0c84d75257cd0581d86a]
- Later fixes:
  - v0.38.0: KV cache location logic, and a crash fix for RGBA references (edit only).
  - v0.39.0: crash fix for the int8/int4 cache option.
  - v0.40.0: a fix for low-VRAM conditions. [Verified: `git log --grep qwen` with `git tag --contains`]
- The template index says `minComfyUIVersion` 0.37.2 for base text-to-image (it uses the TextGenerate `system_prompt` input, added in v0.37.2) and 0.39.0 for Turbo. [Verified: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/index.json]
- **Recommendation:** use the same version as FLUX 3 (v0.41.1). [Inference]

### 2.5 VRAM and speed

- No official minimum VRAM. Official and engine figures:
  - vLLM-Omni on GB300, 1024x1024, 40 steps, everything resident: peak 34.0 GB bf16, 3.3 to 4.5 s per image. [Verified: https://recipes.vllm.ai/Qwen/Qwen-Image-2.1]
  - SGLang on RTX 5090 (32 GB): "the full resident pipeline exceeds one consumer GPU's memory" and needs offload. With offload, peak 17.0 GB and 14.12 s at 1024px and 40 steps. [Verified: https://docs.sglang.io/cookbook/diffusion/Qwen-Image/Qwen-Image-2.1]
  - docs.comfy.org: about 0.3 s per step at about 1 MP on an RTX 5090 (edit workflow). [Verified: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1]
- In ComfyUI, the text encoder (17.5 GB bf16) and the DiT (14.2 GB bf16) do not have to be resident together. So `qwen_image21_t2i.json` needs about **24 GB** minimum, and the int8 files need about 12 to 16 GB. [Inference]
- Time per 1024x1024 Turbo image on RTX PRO 6000 or H100: there is no official figure. From 0.3 s per step on a 5090, 8 steps plus encode and decode is about 3 to 5 s. [Inference]

### 2.6 Custom nodes and license

- Custom nodes: **none.** Every node is in core ComfyUI v0.37.0 or later. [Verified: node table above]
- License: Qwen Research License Agreement (2026-09-20). It is "for non-commercial purposes only". Commercial use needs a separate license from Alibaba's Tongyi Lab (model-business@notice.qwencloud.com). The Qwen3-VL-8B text encoder repack is Apache-2.0. [Verified: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE] [Verified: https://huggingface.co/Comfy-Org/Qwen3-VL]

---

## 3. Suggested `shared/modelFiles.js` entries

These entries follow the existing fields (`repo`, `path`, `dir`, `gb`, `vramGb`, `cloud`). Text encoders keep `vramGb: 0`, as `t5xxl_fp16` does. The `vramGb` values are my [Inference] from section 1.5 and 2.5.

```js
// FLUX 3 Image Klein. The official DiT and upsampler are gated (black-forest-labs/flux-3-image-klein-comfy).
'flux3-image-klein-bf16.safetensors': { repo: 'black-forest-labs/flux-3-image-klein-comfy', path: 'diffusion_models/flux3-image-klein-bf16.safetensors', dir: 'diffusion_models', gb: 11.10, vramGb: 24, cloud: false },
'qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors': { repo: 'black-forest-labs/flux-3-image-klein-comfy', path: 'text_encoders/qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors', dir: 'text_encoders', gb: 6.72, vramGb: 0, cloud: false },
'qwen3vl_4b_bf16.safetensors': { repo: 'Comfy-Org/Qwen3-VL', path: 'text_encoders/qwen3vl_4b_bf16.safetensors', dir: 'text_encoders', gb: 8.88, vramGb: 0, cloud: true },
'flux2-vae.safetensors': { repo: 'Comfy-Org/vae-text-encorder-for-flux-klein-4b', path: 'split_files/vae/flux2-vae.safetensors', dir: 'vae', gb: 0.34, vramGb: 0, cloud: true },
// Qwen-Image 2.1 Turbo. All public.
'qwen_image_2.1_turbo_bf16.safetensors': { repo: 'Comfy-Org/Qwen-Image-2.1', path: 'diffusion_models/qwen_image_2.1_turbo_bf16.safetensors', dir: 'diffusion_models', gb: 14.23, vramGb: 24, cloud: false },
'qwen3vl_8b_bf16.safetensors': { repo: 'Comfy-Org/Qwen-Image-2.1', path: 'text_encoders/qwen3vl_8b_bf16.safetensors', dir: 'text_encoders', gb: 17.53, vramGb: 0, cloud: true },
'qwen_image_2.1_vae_bf16.safetensors': { repo: 'Comfy-Org/Qwen-Image-2.1', path: 'vae/qwen_image_2.1_vae_bf16.safetensors', dir: 'vae', gb: 0.68, vramGb: 0, cloud: false },
```

The two gated entries need an HF token in the Pod download step. Alternatives:

- Use the byte-identical ungated mirror `ml-resources/flux-3-image-klein-comfy` (same paths). This is a license decision.
- For the upsampler only, use `black-forest-labs/flux-3-image-klein-pup` : `model.safetensors` saved as `qwen3.5_9b_flux3_prompt_upsampler_bf16.safetensors` (18.82 GB, ungated). The graph must then name the bf16 file.

## 4. Method notes

- The ComfyUI repo was cloned from https://github.com/Comfy-Org/ComfyUI (moved from comfyanonymous/ComfyUI) at master `5cc4b870` (v0.41.0-11, 2026-10-16). Version claims come from `git tag --contains`, `git merge-base --is-ancestor` and `git show <tag>:<file>`.
- workflow_templates was cloned at `9afccb38` (2026-10-17).
- No model weights were downloaded. To compare the two `qwen3vl_4b_bf16` files, I used HTTP range requests: the safetensors headers (about 88 KB each) and seven 64 KB data samples.
- Cloud `object_info` needs authentication, so I did not check the node list on Cloud. The Cloud claims use `system_stats` (ComfyUI v0.41.1) and the model listing.
