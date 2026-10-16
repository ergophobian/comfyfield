# Open-weight audio, 3D and language models for ComfyField (checked 2026-10-16)

Compiled from four research passes that fetched primary pages: Hugging Face model cards and licenses, GitHub, blog.comfy.org, docs.comfy.org, comfy.org/cloud and the Artificial Analysis (AA) leaderboards. Picks follow the team decision to choose on quality and capability first. Licenses are noted for review after the 2026-10-30 submission.

**Comfy Cloud constraint behind every row:** Cloud only runs its pre-installed node packs (https://comfy.org/cloud/supported-nodes/). Users cannot install custom nodes (https://support.comfy.org/articles/6791455062-custom-nodes-on-cloud). Anything outside those packs needs a rented GPU (Runpod) running ComfyUI with custom nodes.

## Recommended pick per job

| Job | Best open-weight pick | Runs on | Strong alternatives | License note for later |
|---|---|---|---|---|
| Text to speech, multilingual, emotion | Fish Audio Drama 3 (35B MoE, 3B active, 83 languages, inline tags, up to 16 speakers; AA 1244, the top open TTS) | Runpod (41.5 GB in FP8; no open-weight ComfyUI node yet) | Breeze-TTS-2 (AA 1222, en and zh); Qwen3-TTS 1.7B (Apache, 10 languages, plain-language emotion); VoxCPM2 (Apache, 30 languages, about 8 GB); IndexTTS 2.5 (emotion vectors, 5 languages) | Drama 3: commercial use under $500k revenue, no hosted service |
| Text to speech on Comfy Cloud | Chatterbox Multilingual V3 (MIT, 23 to 25 languages, exaggeration slider) | **Comfy Cloud** (Fill-ChatterBox pack, official templates) | Chatterbox Turbo (English, inline tags) | Outputs are watermarked |
| Voice cloning (new lines in a saved voice) | VoxCPM2 or Qwen3-TTS Base (best speaker similarity among Apache models; 3 s reference) | Runpod (TTS-Audio-Suite) | CosyVoice 3; LongCat-AudioDiT (highest similarity, zh and en); Chatterbox (Cloud) | None for Apache picks |
| Voice change (speech to speech) | Chatterbox VC | **Comfy Cloud** (official template) | Seed-VC v2 (stronger similarity, archived, GPL); RVC for singing (needs per-voice training) | Seed-VC is GPL-3.0 |
| Dubbing (translate and re-voice) | Chain: Qwen3-ASR with ForcedAligner, then TranslateGemma 12B or Gemma 4, then a TTS above cloning the speaker, then InfiniteTalk for lips | Runpod; Cloud-only version is Gemma 4 E4B (native Generate Text, speech to translated text) → Chatterbox Multilingual → InfiniteTalk | Granite Speech 4.1 (top of the Open ASR leaderboard, translates to and from English); Hibiki-Zero (end to end, into English only) | Hibiki-Zero is non-commercial |
| Music with lyrics | MiniMax Music 3 (top open model on AA Music Arena v1.1) | **Comfy Cloud** (native node and template) | ACE-Step 1.5 XL turbo (MIT, native, Cloud, SongEval near Suno v5); YuE2 (native) | Music 3 must show "MiniMax-Music3" in the UI |
| Sound effects from text | Stable Audio 3 Medium | **Comfy Cloud** (native, day 0) | Stable Audio 3 Small-SFX | Free commercial use under $1M revenue |
| Sound for a video (foley) | HunyuanVideo-Foley XXL (best published video-to-audio numbers) | Runpod (custom node) | LTX-2.5 video-to-audio mode or LTX-2.3 Foley LoRA (Cloud path, unverified); MMAudio | Hunyuan excludes EU, UK, South Korea; MMAudio non-commercial |
| Photo to 3D model | TRELLIS.2-4B (PBR GLB) | **Comfy Cloud** (native core) | Pixal3D (native, multi-view); Hunyuan3D 2.1 (native, Cloud); TripoSplat for Gaussian splats | Hunyuan excludes EU, UK, South Korea |
| Text to 3D | Open image model → TRELLIS.2 | **Comfy Cloud** | TRELLIS-text v1 (the only native text-to-3D, weaker) | None |
| Rigging | SAM 3D Body for people (native, Cloud); UniRig for any mesh | Cloud / Runpod | — | SAM license |
| Explorable 3D world | HY-World 2.0 (mesh, Gaussian splat and point cloud out; authors claim parity with World Labs Marble) | Runpod (custom code, very large) | Matrix-3D (MIT); Lyra 1.0 | Tencent license excludes EU, UK, South Korea |
| Interactive world / game video | Matrix-Game 4.0 (released 2026-10-15, 5B, up to 67 fps) or Matrix-Game 3.0 (Apache) | Runpod | HY-World 1.5 WorldPlay | — |
| LLM for planning, prompts, scripts, code | Kimi K3 through Comfy's OpenRouter partner node (AA 44, top three open) | **Comfy API** (billed in Comfy credits) | MiMo-V2.6-Pro (AA 46, #1 open, MIT, multi-node self-host); GLM-5.3 (AA 45) | Kimi K3 needs credit above 100M users |
| LLM inside ComfyUI on one GPU | Qwen3.8-27B (Apache, AA 34, best small model; LiveCodeBench 90.3) | **ComfyUI core Generate Text node** (Comfy-Org w4a8 file) | Gemma 4 31B or 12B (Apache, native, Cloud templates); Qwen3.5-9B (native, Cloud) | None |
| Judging and captioning video (hook check) | Qwen3.8-Flash-Next FP4 on one 96 GB GPU (LVBench 76.6, 2 fps sampling) | Runpod | Qwen3.6-27B (Apache, VideoMME 87.7); Qwen3-VL-8B through the QwenVL pack (on Cloud, takes video frames); Gemma 4 12B (native, video frames need wiring) | Flash-Next has a custom Qwen license |

## Text to speech: main candidates

| Model | Version | License | VRAM | ComfyUI | Comfy Cloud | Released | Quality signal | Source |
|---|---|---|---|---|---|---|---|---|
| Fish Audio Drama 3 | 35B MoE, 3B active | Fish Community License (revenue cap, no hosted service) | 41.5 GB FP8 | No open-weight node (Comfy's Drama 3 node is a paid API) | No | 2026-10-01 | AA 1244 (#10 overall, #1 open) | https://huggingface.co/fishaudio/drama-3 |
| Breeze-TTS-2 | 3.5B | Non-commercial weights | 7.7 to 14.4 GiB | None found | No | 2026-08-25 | AA 1222 | https://huggingface.co/BreezeBlue/Breeze-TTS-2 |
| Fish Audio S2 Pro | about 5B | Research license, non-commercial | about 10 GB download | TTS-Audio-Suite | No | 2026-03-09 | AA 1116 | https://huggingface.co/fishaudio/s2-pro |
| Step-Audio-EditX | 3B | Weights license not stated | 12 to 16 GB | TTS-Audio-Suite and a custom node | No | 2025-11, updated 2026-01 | AA 1097; edits emotion and style of existing audio | https://huggingface.co/stepfun-ai/Step-Audio-EditX |
| Voxtral TTS | 4B | CC-BY-NC-4.0 | 16 GB+ | None found | No | 2026-03-23 | AA 1087 | https://huggingface.co/mistralai/Voxtral-4B-TTS-2603 |
| Higgs Audio v3 | 4B | Non-commercial with a creator grant | about 10 GB | TTS-Audio-Suite | No | 2026-06-04 | AA 1038; 100+ languages, 21 emotion tags | https://huggingface.co/bosonai/higgs-tts-3-4b |
| Qwen3-TTS | 12Hz 1.7B and 0.6B (Base, CustomVoice, VoiceDesign) | Apache-2.0 | 3 to 6 GB download | TTS-Audio-Suite | No (Cloud's Qwen-TTS pack is a paid API) | 2026-01-22 | Seed-TTS WER zh 0.77 / en 1.24 | https://github.com/QwenLM/Qwen3-TTS |
| VoxCPM2 | 2B | Apache-2.0 | about 8 GB | ComfyUI-VoxCPM | No | 2026-04 | 30 languages; similarity en 75.3 / zh 79.5 | https://huggingface.co/openbmb/VoxCPM2 |
| IndexTTS 2.5 | about 0.8B | bilibili license (commercial below size caps) | about 6 GB | TTS-Audio-Suite | No | 2026-08-10 | Strongest explicit emotion control | https://huggingface.co/IndexTeam/IndexTTS-2.5 |
| CosyVoice 3 | 0.5B | Apache-2.0 | about 5.4 GB download | TTS-Audio-Suite, FL-CosyVoice3 | No | 2025-12 | 9 languages, 18 dialects, instructions | https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512 |
| Chatterbox Multilingual | V3 0.5B | MIT, watermarked | 8 GB+ | Fill-ChatterBox | **Yes** | 2026-06-10 | Original Chatterbox AA 1025 | https://huggingface.co/ResembleAI/chatterbox |
| Kokoro | 82M | Apache-2.0 | CPU | comfyui-kokoro | No | 2025-01 | AA 1061; no emotion, no cloning | https://huggingface.co/hexgrad/Kokoro-82M |

Not open: Higgs Audio v2.5, CosyVoice 3.5, VibeVoice 7B (disabled), ElevenLabs, MiniMax Speech, Seed Speech.

## Music and sound: main candidates

| Model | License | VRAM | ComfyUI | Comfy Cloud | Released | Quality signal | Source |
|---|---|---|---|---|---|---|---|
| MiniMax Music 3 | MiniMax-Music3 Community License (free under $20M revenue, label required) | about 22 GB with offload; 8 GB with layer streaming | Native | **Yes** | 2026-08-13 | Top open model on AA Music Arena v1.1 | https://huggingface.co/MiniMaxAI/MiniMax-Music3 |
| ACE-Step 1.5 XL turbo | MIT | 12 GB with offload, 20 GB recommended | Native | **Yes** | 2026-04-02 | SongEval near Suno v5 (self-reported) | https://github.com/ace-step/ACE-Step-1.5 |
| YuE2-3B | CC-BY-NC-4.0 with a creator carve-out | 24 GB recommended | Native | Unverified | 2026-09-09 | WildSongBench 6.73 vs Suno v5 6.87 | https://huggingface.co/m-a-p/YuE2-3B |
| HeartMuLa 3B | Apache-2.0 | Unverified | Custom node | No | 2026-02 | SongEval near ACE-Step 1.5 | https://github.com/HeartMuLa/heartlib |
| Stable Audio 3 (Small-Music, Small-SFX, Medium) | Stability Community License | Small on CPU | Native, day 0 | Medium yes | 2026-05-20 | AA instrumental: Medium 996; no vocals | https://stability.ai/news-updates/meet-stable-audio-3-the-model-family-built-for-artistic-experimentation-with-open-weight-models |
| HunyuanVideo-Foley XXL / XL | Tencent Hunyuan Community License | 20 GB / 16 GB (12 / 8 GB with offload) | Custom node | No | 2025-08 / 2025-09 | Beats MMAudio on MovieGen-Audio-Bench | https://github.com/Tencent-Hunyuan/HunyuanVideo-Foley |
| MMAudio large 44k v2 | Weights CC-BY-NC-4.0 | about 6 GB | kijai/ComfyUI-MMAudio | No | 2024-12 | VGGSound IS 17.40 | https://github.com/hkchengrex/MMAudio |

## 3D: main candidates

| Model | Output | License | VRAM | ComfyUI | Comfy Cloud | Released | Source |
|---|---|---|---|---|---|---|---|
| TRELLIS.2-4B | Image to PBR mesh (GLB) | MIT (native port drops NVIDIA non-commercial deps) | 24 GB+ official | Native core since 0.34.0 | **Yes** | 2025-12-16, native 2026-08 | https://github.com/microsoft/TRELLIS.2 |
| Pixal3D | Image or multi-view to mesh | MIT | Unverified (low-VRAM mode) | Native core | **Yes** | 2026-05 | https://github.com/TencentARC/Pixal3D |
| Hunyuan3D 2.1 | Shape plus PBR texture | Tencent community license | 10 GB shape, 29 GB with texture | Native checkpoint; texture via ComfyUI-3D-Pack | **Yes** | 2025-06-13 | https://huggingface.co/tencent/Hunyuan3D-2.1 |
| TripoSplat | Image to Gaussian splat | MIT | about 6.6 GB | Native, day 0 | **Yes** | 2026-06-01 | https://github.com/VAST-AI-Research/TripoSplat |
| HY-World 2.0 | World mesh, splat, point cloud | Tencent HY-World license | Very large (80B panorama stage) | Partial community pack | No | 2026-04 to 05 | https://github.com/Tencent-Hunyuan/HY-World-2.0 |
| Matrix-Game 4.0 | Interactive game video | Apache-2.0 | 9.2 to 12.8 GB | None | No | 2026-10-15 | https://huggingface.co/Skywork/Matrix-Game-4.0 |

Not open: Hunyuan3D 2.5, 3.0 and 3.1, Tripo 3.x, Rodin, Meshy (all closed partner nodes in Comfy).

## Language and vision models: main candidates

| Model | Size | License | ComfyUI | Comfy Cloud | Released | Quality signal | Source |
|---|---|---|---|---|---|---|---|
| MiMo-V2.6-Pro | 1.02T total, 42B active | MIT | Alongside (vLLM / SGLang) | No | 2026-09-21 | AA 46, #1 open | https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL |
| GLM-5.3 | 753B, 40B active | GLM-5.3 License (MIT-like) | Alongside | No (OpenRouter node has GLM-5) | 2026-08 | AA 45 | https://huggingface.co/zai-org/GLM-5.3 |
| Kimi K3 | 2.8T, 104B active; text, image, video | Kimi K3 License | Alongside, or Comfy's OpenRouter node | **Yes via OpenRouter node** (images only) | 2026-07 | AA 44; Video-MME 90.0 | https://huggingface.co/moonshotai/Kimi-K3 |
| DeepSeek V4.1-Flash | 552B plus memory, 16B active | MIT | Alongside | OpenRouter node has V4 | 2026-09-10 | AA 39; Terminal-Bench 2.1 90.6 | https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash |
| Qwen3.8-27B | 27.8B dense; text, image, video | Apache-2.0 | **Core Generate Text node** (w4a8) | Core node yes, file unverified | 2026-08-14 | AA 34, best small model; LVBench 72.4 | https://huggingface.co/Qwen/Qwen3.8-27B |
| Qwen3.8-Flash-Next | 125B, 6B active | Qwen Community License 1.0 | Alongside; NVIDIA FP4 fits one 96 GB GPU | No | 2026-08-24 | LVBench 76.6 | https://huggingface.co/Qwen/Qwen3.8-Flash-Next |
| Gemma 4 | 31B, 26B-A4B, 12B, E4B, E2B; audio on small sizes | Apache-2.0 | **Core Generate Text node** | **Yes** (templates) | 2026-03 to 05 | 31B MMMU-Pro 76.9 | https://docs.comfy.org/tutorials/llm/gemma4/gemma4 |
| Qwen3-VL 8B | 8B | Apache-2.0 | Core (images) and ComfyUI-QwenVL pack (video frames) | **Yes** | 2025-10 | Video average 59.5 on Molmo2's 15 benchmarks | https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct |
| MiniCPM-V 4.7 | 35B, 3B active | Apache-2.0 | Alongside | No | 2026-10-07 | Up to 128 frames | https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B |

Not open: Qwen3.6-plus, flash and max (API only), Qwen3.7, Mistral Medium 3.5 for large companies (licence), Claude, GPT and Gemini.

## Gaps

- Exact VRAM is missing for many TTS, 3D and world models; download sizes were given where found.
- Whether Comfy Cloud's Chatterbox pack loads the V3 checkpoint, and whether Cloud's model library includes Qwen3.8-27B and Gemma 4 31B.
- LMArena ranks (arena.ai returned 403 during research).
- Live 3D Arena rankings (client-rendered).
