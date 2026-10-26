# Third-party notices

## ffmpeg and ffmpeg-static

ComfyField optionally installs `ffmpeg-static` to run ffmpeg as a separate process for Stitch. The npm package is licensed under the GNU General Public License version 3 or later. Downloaded ffmpeg executables have their own build-specific licenses; builds with GPL components (including libx264 used by Stitch) are covered by the GNU General Public License. They are not covered by ComfyField's application license.

- Package source, download scripts and build origins: https://github.com/eugeneware/ffmpeg-static
- Binary releases and associated build information: https://github.com/eugeneware/ffmpeg-static/releases
- ffmpeg source: https://ffmpeg.org/download.html#get-sources
- ffmpeg licensing: https://ffmpeg.org/legal.html
- GNU General Public License version 3: https://www.gnu.org/licenses/gpl-3.0.html

The dependency downloads binaries from upstream releases during its install lifecycle script. Consult the downloaded build's license, readme and `ffmpeg -L` output for exact terms and corresponding source/build information. Anyone redistributing a binary must preserve those notices and satisfy its license's corresponding-source obligations; this notice alone is not a source offer. ComfyField does not modify the executable. You can skip this optional dependency with `npm ci --omit=optional` and install a compatible system ffmpeg instead.

## Patched WanVideo audio encoder

`server/pack-patches/wanvideo/multitalk/wav2vec2.py` is a patched copy of [kijai/ComfyUI-WanVideoWrapper](https://github.com/kijai/ComfyUI-WanVideoWrapper/blob/088128b224242e110d3906c6750e9a3a348a659b/multitalk/wav2vec2.py) at commit `088128b224242e110d3906c6750e9a3a348a659b`, under Apache-2.0. The license text is included in [server/pack-patches/LICENSE-APACHE-2.0](server/pack-patches/LICENSE-APACHE-2.0). The file retains its existing attribution and modification header, and its attribution to Hugging Face Transformers. The pinned upstream file has no separate copyright header; none has been removed or invented. ComfyField's change collects encoder hidden states when the installed Transformers version returns none.

## Provider logos

The assets in `public/logos/` identify Alibaba Cloud, Anthropic, Black Forest Labs, ByteDance, Comfy, ElevenLabs, fal, Gemini, Google, Kling, MiniMax and OpenAI. These logos and names are trademarks of their respective owners, used only to identify the provider. Their inclusion does not imply endorsement. ComfyField's application license does not license these marks.

## Runtime model weights and node packs

The inventory below covers the sources pinned in `shared/modelFiles.js`, including pack-owned model and tokenizer files. Weights are downloaded at runtime rather than bundled with the application. Exact filenames, hashes and pack commits remain in that manifest. Groups share a research license note; exceptions are explicit. These are names recorded in existing research, not legal conclusions, permission grants, or a completed rights review. Custom license terms, repack metadata discrepancies and unknowns still need owner review before use or redistribution.

Research references: [image/video lineup](research_notes/Open%20weight%20model%20lineup/image_and_video.md) (iv), [audio/3d/language lineup](research_notes/Open%20weight%20model%20lineup/audio_3d_llm.md) (al), [image models](research_notes/engine/newest-image-models.md) (im), [video models](research_notes/engine/newest-video-models.md) (vm), [image generation](research_notes/engine/t2i/README.md) (ti), [video editing](research_notes/engine/video-edit/README.md) (ve), [Genjutsu](research_notes/engine/genjutsu.md) (ge), [enhancement](research_notes/engine/enhance/README.md) (en), [Qwen editing](research_notes/engine/qwen-edit/README.md) (qe), [audio/talking heads](research_notes/engine/audio-talk/README.md) (at), [audio pack inventory](research_notes/engine/audio-talk/packs.json) (ap), [3d](research_notes/engine/3d/README.md) (3d).

| Pinned weights / source repositories | License name recorded in research | Note |
| --- | --- | --- |
| `black-forest-labs/FLUX.2-klein-4b-fp8` | Apache-2.0 | iv, FLUX.2 klein 4B |
| `Comfy-Org/Qwen-Image_ComfyUI`, `Comfy-Org/Qwen-Image-Edit_ComfyUI`, `Comfy-Org/Qwen-Image-Layered_ComfyUI`; `lightx2v/Qwen-Image-Edit-2511-Lightning`; `fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA` | Apache-2.0 | iv, qe |
| `Comfy-Org/flux1-dev`, `Comfy-Org/flux1-schnell`, `stabilityai/stable-diffusion-xl-base-1.0`, `Lightricks/LTX-Video`, `comfyanonymous/flux_text_encoders` | license not stated upstream | No license name for these exact pinned artifacts recorded in the reviewed notes |
| `comfyicu/LTX-2.5`, `PulpCut/LTX-2.5-INT8-ConvRot-safetensors` | LTX-2.x Community License Agreement | vm; encoder repack-specific terms not separately recorded |
| `Comfy-Org/MiniMax-H3`; `pablodawson/MiniMax-H3-360-Orbit-LoRA` | MiniMax H3 Community License; orbit LoRA: license not stated upstream | iv; no orbit-specific license note found |
| `unsloth/flux-3-image-klein` | FLUX Kommunity License v1.0 | im; mirror of the original weights |
| `ml-resources/flux-3-image-klein-comfy` (prompt upsampler); `Comfy-Org/Qwen3-VL` | Apache-2.0 | im |
| `Comfy-Org/vae-text-encorder-for-flux-klein-4b` | license not stated upstream | No separate VAE license name recorded |
| `Comfy-Org/Qwen-Image-2.1` | Qwen Research License Agreement; Qwen3-VL text encoder: Apache-2.0 | im; model/VAE and encoder distinguished |
| `Comfy-Org/Bernini-R`, `Comfy-Org/Wan_2.1_ComfyUI_repackaged`, `Comfy-Org/Wan-Animate-2`, `Comfy-Org/Wan_2.2_ComfyUI_Repackaged`, `Kijai/WanVideo_comfy_fp8_scaled` | Apache-2.0 | ge, iv, at |
| `Kijai/WanVideo_comfy` (ReCamMaster, lightx2v, InfiniteTalk and encoder files) | license not stated upstream; originals: Apache-2.0 | ve, ge, at; no license tag on the repack repository; exact encoder terms not separately recorded |
| `Alissonerdx/BFS-Best-Face-Swap-Video` | LTX-2 Community License Agreement (repository tag) | ge explicitly flags the tag on Wan/Bernini files as unresolved |
| `artificialguybr/Explosion-Redmond-WAN2-I2V-14B`, `artificialguybr/Spontaneous-Combustion-Redmond-WAN2-I2V-14B`, `artificialguybr/Disintegration-Redmond-WAN2-I2V-14B`, `artificialguybr/Metalcification-Redmond-WAN2-I2V-14B`, `artificialguybr/ThunderHero-Redmond-WAN2-I2V-14B`, `artificialguybr/SkinMorph-Redmond-WAN2-I2V-14B`, `artificialguybr/Disappearing-Redmond-WAN2-I2V-14B`; `p4ss3r2/wan22_Pupil_Transition_LoRa` | license not stated upstream | No license names for these exact files recorded in the reviewed notes |
| `Comfy-Org/sam3.1` | SAM License | ve, en |
| `Comfy-Org/void-model` | Apache-2.0 | ve; notes say CogVideoX base terms were not read |
| `Comfy-Org/SCAIL-2`, `Comfy-Org/BiRefNet`, `Comfy-Org/HiDream-O1-Image` | MIT | ve, en, ti |
| `Comfy-Org/SeedVR2` | Apache-2.0 | en, qe |
| `Comfy-Org/Real-ESRGAN_repackaged` | BSD-3-Clause | en |
| `Comfy-Org/frame_interpolation` | MIT (repository tag: mit-and-apache-2.0) | en |
| `Comfy-Org/Krea-2` | Krea 2 Community License; `qwen_image_vae.safetensors`: Apache-2.0 | ti |
| `Comfy-Org/z_image_turbo` | Apache-2.0 | ti |
| `Comfy-Org/Qwen3.5` | license not stated upstream | Exact pinned 2B encoder/repack terms not recorded |
| `Comfy-Org/gemma-4` | Apache-2.0 | [video generation research](research_notes/engine/video-gen/README.md), exact E2B encoder |
| `Comfy-Org/MiniMax-Music-3` | MiniMax-Music3 Community License | at notes a conflicting Apache-2.0 repack tag |
| `Comfy-Org/stable-audio-3` | Stability AI Community License (metadata: stable-audio-community) | at |
| `tencent/HunyuanVideo-Foley` | Tencent Hunyuan Community License | at, including pack-owned synchformer weights |
| `google/siglip2-base-patch16-512`, `laion/larger_clap_general` | Apache-2.0 | at, including pack-owned support files |
| `PedroMarinhoDev/Drama-3-ComfyUI` | Fish Audio Community License v1.0 | at notes the conflicting fish-audio-research-license card tag |
| `PedroMarinhoDev/Qwen3-ASR-ComfyUI`, `Kijai/wav2vec2_safetensors` | license not stated upstream | Exact repack license names not recorded |
| `Comfy-Org/TRELLIS.2` | MIT; `dino_v3_vit_l.safetensors`: DINOv3 License | 3d distinguishes the DINOv3 encoder |
| `ResembleAI/chatterbox` (pack-owned weights/support files) | MIT | at, ap |
| `Qwen/Qwen3-TTS-12Hz-1.7B-Base`, `Qwen/Qwen3-TTS-Tokenizer-12Hz` (pack-owned files) | Apache-2.0 (Qwen3-TTS family) | al; tokenizer-specific terms not separately recorded |

For rows marked "license not stated upstream", the existing research either explicitly reports missing metadata or does not record a license for that pinned artifact. This label does not assert that no license exists today; upstream was not re-audited for this inventory.

| Pinned node pack | License name recorded in research | Note |
| --- | --- | --- |
| `Kosinkadink/ComfyUI-VideoHelperSuite` | license not stated upstream | No license name recorded in reviewed notes |
| `kijai/ComfyUI-KJNodes` | license not stated upstream | No license name recorded in reviewed notes |
| `kijai/ComfyUI-WanVideoWrapper` | Apache-2.0 | ve |
| `filliptm/ComfyUI_Fill-ChatterBox` | license not stated upstream | at: package has no license field; separate from MIT Chatterbox weights |
| `BobRandomNumber/ComfyUI-HunyuanVideo_Foley` | license not stated upstream | at records model licenses, not a pack code license |
| `PedroMarinhoDev/ComfyUI-Drama3` | GPL-3.0 | ap; separate from Fish Audio weights |
| `flybirdxx/ComfyUI-Qwen-TTS` | license not stated upstream | at, ap: no license file recorded |
