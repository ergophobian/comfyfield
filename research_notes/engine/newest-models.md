# The newest open models in ComfyField

Researched 2026-10-17 for [Run the newest open models](https://github.com/ergophobian/comfyfield/issues/75). The full sourced reports are [newest-image-models.md](newest-image-models.md) and [newest-video-models.md](newest-video-models.md). Nothing here has run on a GPU yet; the live runs belong to [Prove Comfy Cloud, Router and the Pod with live runs](https://github.com/ergophobian/comfyfield/issues/71).

## What runs where

| Model | Workflows | Comfy Cloud | Pod GPU | Recipe |
|---|---|---|---|---|
| FLUX 3 Klein (distilled) | `flux3_klein_t2i` | No: the model and the prompt upsampler are missing | 24 GB | 16 steps, cfg 1, euler/simple, BFL's prompt upsampler (w4a8) |
| Qwen-Image 2.1 Turbo | `qwen_image21_t2i` | No: the model and its VAE are missing | 24 GB | 8 fixed sigmas, cfg 1, euler; RGBA output |
| LTX-2.5 (distilled int8) | `ltx25_t2v`, `ltx25_i2v` | Yes, every file | 32 GB | Two stages (8 + 3 steps), euler_ancestral, cfg 1, with sound |
| MiniMax H3 (open weights) | `h3_open_t2v`, `h3_open_i2v` | Yes, every file | 32 GB | 8-step turbo LoRA, res_multistep/simple, no cfg, with sound |

Every graph comes from the official Comfy template for the model, flattened to API format, with core nodes only. A run goes to Comfy Cloud at once when Cloud has every file, else to a Pod.

## Decisions

- **The Pod runs ComfyUI v0.41.1** (commit `45bf90d1`), the version Comfy Cloud runs. The image ships v0.33.1, which lacks FLUX 3 Klein (v0.41.0) and Qwen-Image 2.1 (v0.37.0) and the MiniMax H3 offload fixes (v0.38–v0.39). The boot script moves ComfyUI to the pinned commit and installs its requirements, then starts it without the image's custom nodes, which no workflow uses.
- **Every Pod download is pinned by sha256.** The status server hashes each file as it downloads and rejects a mismatch. That lets the Pod use ungated copies of gated official repos, byte for byte:
  - LTX-2.5: `comfyicu/LTX-2.5` (transformer, VAEs, upscaler) and `PulpCut/LTX-2.5-INT8-ConvRot-safetensors` (current text encoder), equal to the gated `Lightricks/LTX-2.5`.
  - FLUX 3 Klein: `unsloth/flux-3-image-klein` (DiT) and `ml-resources/flux-3-image-klein-comfy` (upsampler), equal to the gated `black-forest-labs/flux-3-image-klein-comfy`. The VAE and text encoder come from Comfy-Org.
  - MiniMax H3 and Qwen-Image 2.1 come from Comfy-Org's ungated repacks.
- **Each model sizes its canvas:** multiples of 64 for LTX-2.5, a 768 px short edge for H3, multiples of 32 near 1.5–2 MP for Qwen-Image 2.1. FLUX 3 Klein uses the standard sizes (multiples of 16).
- **The Pod volume is at least 120 GB**, room for two of the 40–44 GB video models.

## After submission

Licenses are not a selection criterion before the contest; these are recorded for later:

- FLUX 3 Klein: FLUX Kommunity License (non-commercial, plus commercial output under US$5M revenue). The Pod downloads from mirrors, so the click-through on the official repo is not accepted on the user's behalf.
- Qwen-Image 2.1: Qwen Research License, non-commercial only.
- LTX-2.5: LTX-2.x Community License, free under US$10M revenue.
- MiniMax H3: royalty-free outside the US, EU, UK and South Korea; Comfy Cloud generations include commercial rights.
