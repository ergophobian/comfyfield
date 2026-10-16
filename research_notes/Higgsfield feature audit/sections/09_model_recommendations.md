## Open-weight models to match Higgsfield

Picks are made on quality and capability, as of 2026-10-16. Licences are not a selection criterion before the 2026-10-30 submission (Comfy is expected to cover them), so they appear only in the last column of the model table. Closed, API-only models are never picks. "Cloud" means a ComfyUI workflow on Comfy Cloud through the Comfy Developer Platform. "Runpod" means self-hosted ComfyUI on a rented GPU.

Open weights already match Higgsfield's closed video models on raw quality. They fall short on packaging: clip length, resolution and how many references one generation takes. MiniMax H3 is #1 overall on Artificial Analysis image to video (1141), ahead of every closed video model Higgsfield sells. On text to video it scores 1159, one point behind Seedance 2.5 (1160) and 15 behind Wan 3.0 (1174), and ahead of FLUX 3 Video (1146), Gemini Omni Flash 1.1 (1132), Kling 3.0 Omni (1019) and Veo 3.1. Open H3, though, renders 15 s at 768p, while Seedance 2.5 and Wan 3.0 render 30 s at 1080p to 4K, and it takes 9 image references where Cinema Studio takes 50. Each of Higgsfield's main video tools (Genjutsu, Motion Control, Omni Edit, Recast, Video Relight) has a native open counterpart (Wan Animate 2, SCAIL-2, Bernini-R, VOID, LTX-2.5 IC-LoRAs), but none has an independent benchmark. Images are the real quality gap: the best open model is #21 on text to image (Qwen-Image-2.1, 1040) against GPT Image 2.5 Sunburst at 1218, and 1083 against 1199 on editing. Audio is close: Fish Audio Drama 3 is #10 overall on TTS. MiniMax Music 3 tops the open music board, and Higgsfield has no dedicated music model, but nothing open replaces Seed Audio 1.0's one-pass dialogue, ambience and music. In 3D and worlds the open stack is level or ahead. 3D Jutsu builds its scenes from primitives and stock assets. Higgsfield's only mesh generator is Meshy 5, inside the Blender plugin, and it has no worlds tool. Higgsfield already resells nine open-weight model families: MiniMax H3, LTX-2.5 (Fast and Pro are hosted tiers), Wan 2.2 and Wan 2.2 Animate, InfiniteTalk, Z-Image, Ideogram 4.0, Kimi K3 (its default game builder), GLM-5.3 Flash and DeepSeek.

**Coverage:** 45 capabilities are listed below.
- 37 have their best open pick running on Comfy Cloud.
- 7 have a Cloud fallback, but the best pick needs Runpod: TTS, voice clone, dubbing, foley, VLM judging, video camera re-render, and LoRA training (Cloud cannot train).
- Only explorable worlds is Runpod-only.

| Area | Open weights vs Higgsfield | Key evidence |
|---|---|---|
| Video generation | Matches at 768p | H3 #1 on [AA I2V][aa-i2v] (1141); 1159 vs 1160 (Seedance 2.5) and 1174 (Wan 3.0) on [AA T2V][aa-t2v] |
| Video editing tools | Close, unbenchmarked | Only open entry on [AA video editing][aa-vedit] is H3 (#4, 1125, hosted pipeline) vs Wan 3.0 1200 |
| Images | Behind | [AA T2I][aa-t2i] 1218 vs 1040; [AA image editing][aa-iedit] 1199 vs 1083 |
| Lipsync | Close; behind on existing 4K footage | Higgsfield itself serves InfiniteTalk; Sync Lipsync 3 reaches 4K |
| Audio | Close; music matches | Drama 3 is AA TTS #10 overall (1244); MiniMax Music 3 tops the open AA Music Arena |
| 3D and worlds | Level or ahead | 3D Jutsu builds scenes from primitives and stock GLB assets; meshes only through Meshy 5 in the Blender plugin; no worlds tool |
| LLMs | Close; partly the same models | Kimi K3, GLM-5.3 Flash and DeepSeek are already in Higgsfield's pickers |

Model by model, 143 named Higgsfield models in 69 rows: 17 rows match, 40 are close, 11 are behind and 1 is not applicable. Nine of the 11 behind rows are image models. Capability by capability, of 45 rows: 11 match, 29 are close and 5 are behind.

### Model by model

This covers every model in the knowledge base's model table (`kb_howto_models.md`, 134 models). It adds 9 more from the [pricing][hf-pricing] and [API][hf-api] pages: Reve, FLUX.2 Flex and Max, Happy Horse 1.0 and 1.1, LTX 2.5 Fast, Wan 2.2 Animate, Wan 2.7 Animate, and Cinema Studio 4.0 as an API model. Scores are Artificial Analysis Elo unless noted. "Not captured" means the closed model's score was not in our research.

| Higgsfield model | Type | What Higgsfield uses it for | Best open-weight equivalent | Where it runs | Gap | License note |
|---|---|---|---|---|---|---|
| **Video generation** | | | | | | |
| Seedance 2.5, 2.5 Draft Mode, 2.5 Edit | Video | Flagship: 4 to 30 s with audio, region edits, Draw to Edit; engine of Cinema Studio 4.0 and of 3D Jutsu renders ([Cinema Studio help][hf-cinema], [3D Jutsu][hf-3dj]) | [MiniMax H3][h3-hf] FL2VA and Ref2VA | Cloud (preinstalled) or Runpod | **Close.** AA T2V 1160 vs H3 1159; H3 is #1 on AA I2V at 1141 ([AA T2V][aa-t2v], [AA I2V][aa-i2v]). Behind on length (30 s vs 15 s) and open resolution (768p) | H3 Community: no local use in US, EU, UK, KR; Cloud runs include rights; show "MiniMax H3" in the UI |
| Seedance 2.0, 2.0 Fast, 2.0 Mini, Seedance 4K, 1.5 Pro, Pro, Pro Fast | Video | Cheaper and older tiers, plugin default, 4K VFX clips, and the former Sora 2 presets ([Sora guide][hf-sora]) | H3 with the 8-step Turbo LoRA or FastH3; [LTX-2.5][ltx-hf] distilled when native 4K matters | Cloud or Runpod | **Matches.** H3 outranks Seedance 2.5, the newest tier; 2.0 scores not captured | H3 as above; LTX-2.x free under $10M revenue, bars directly competing products |
| Kling 3.0, 3.0 Turbo | Video | Multi-shot (up to 6 cuts), native 4K, 3 to 15 s, native audio, Elements ([Kling help][hf-kling]) | H3; LTX-2.5 native multi-shot for cut lists | Cloud or Runpod | **Matches** on quality: the top Kling (3.0 Omni) is AA T2V #15 at 1019 vs H3 1159. Behind on native 4K and explicit 6-cut control | H3 / LTX-2.x |
| Kling 3.0 Omni, 3.0 Omni Edit (Kling O3), O1 Video, O1 Video Edit | Video, video edit | Reference-driven generation, and prompt edits of existing footage in Edit video | Generation: H3. Editing: [Bernini-R][bernini] (V2V, reference + video), H3 Fun ControlNet masked inpaint | Cloud or Runpod | **Close.** Generation 1019 vs 1159. For editing, the only open board entry is H3 at #4 (1125), and that is MiniMax's hosted pipeline ([AA editing][aa-vedit]) | Bernini-R Apache 2.0 |
| Kling 3.0 Motion Control, 2.6 Motion Control | Video | Drive a character image with a 3 to 30 s reference video | [Wan Animate 2][wan-animate2] | Cloud or Runpod | **Close.** Same job; no public benchmark for either | Apache 2.0 |
| Kling 2.6, 2.5 Turbo, 2.1, 2.1 Master | Video | Older Kling tiers; 2.6 adds sound | H3; LTX-2.5 distilled for speed | Cloud or Runpod | **Matches.** H3 ranks above the newest Kling | H3 / LTX-2.x |
| Google Veo 3.1, 3.1 Fast, 3.1 Lite, Veo 3, Veo 3 Fast | Video | Text, start and end frame, 3-reference video with sound, 8 s; talking clips in Lipsync Studio ([Veo page][hf-veo]) | H3 (FL2VA for start and end frames, Ref2VA for references) | Cloud or Runpod | **Matches.** H3 is #4 on AA T2V with Veo 3.1 outside the top four, and #1 on I2V | H3 |
| Wan 3.0, Wan 3.0 Prime | Video | Six linked shots with sound, 12 references, 30 s, 1080p ([Wan 3.0 page][hf-wan3]) | H3; LTX-2.5 multi-shot | Cloud or Runpod | **Close.** AA T2V 1174 (#1) vs 1159; editing 1200 (#1) vs 1125; 30 s vs 15 s | H3 |
| Wan 2.7, 2.6, 2.5, 2.5 Fast, 2.7 Animate | Video | Multi-shot with sound, first and last frame, camera control, photo animation | H3; Wan Animate 2 for animation | Cloud or Runpod | **Close.** Scores not captured. Higgsfield's Wan 2.6 guide calls it Apache 2.0, but no Wan weights after 2.2 exist on Hugging Face ([Wan-AI on HF][wan-hf]) | H3; Apache 2.0 |
| Gemini Omni Flash 1.1, Gemini Omni Flash | Video, video edit | Any-input video, chat edits of up to 30 s of footage, 10 s extension steps, 4K; powers Omni VFX and Shorts Studio ([Omni page][hf-omni]) | Generation and continuation: H3. Edits: Bernini-R | Cloud or Runpod | **Close.** Generation matches (AA T2V 1132, #8, vs 1159). Conversational editing is behind: no open editor has a verified score | H3; Apache 2.0 |
| FLUX.3 Video | Video | 5 to 20 s with audio, video continuation, readable moving text ([FLUX 3 post][hf-flux3]) | H3. FLUX 3 Video weights are not released and FLUX 3 Dev has no date ([BFL][bfl-flux3]) | Cloud or Runpod | **Matches.** AA T2V 1146 and I2V #7 vs H3 1159 and #1 | H3 |
| Grok Imagine Video 1.5, 1.5 Lite, Grok Video Edit, Grok Imagine (earlier) | Video | Video with sound, extension, 7 references, 1 to 15 s ([changelog][hf-changelog]) | H3; LTX-2.5 distilled for Lite-class speed; Bernini-R for edits | Cloud or Runpod | **Close.** Score not captured; features match | H3 / LTX-2.x |
| Sora 2 (and Pro, Max tiers) | Video | Still in the footer and pricing tables, but OpenAI shut the API on 2026-09-24 and its presets moved to Seedance 2.0 ([Sora guide][hf-sora]) | H3 | Cloud or Runpod | **Matches** (retired upstream) | H3 |
| MiniMax Hailuo 2.3, 2.3 Fast, Hailuo 02 | Video | Cheap, fast clips | H3, the open successor | Cloud or Runpod | **Matches** | H3 |
| Happy Horse 1.0, 1.1; PixVerse 6 | Video | API catalog extras; PixVerse adds first and last frame ([API][hf-api]) | H3; LTX-2.5 | Cloud or Runpod | **Close.** Scores not captured | H3 / LTX-2.x |
| Higgsfield Motion | Video | Marketing Studio product motion | H3 Ref2VA with product references | Cloud or Runpod | **Close.** Engine undisclosed | H3 |
| **Already open weights (Higgsfield resells them)** | | | | | | |
| MiniMax H3 (Hailuo 3.0), H3 Max | Video | 2K video from text, keyframes, up to 9 images, 3 videos and 3 audio clips ([H3 post][hf-h3]) | Same model: H3-Base FL2VA and Ref2VA ([Comfy docs][h3-docs]) | Cloud (preinstalled, also a Cloud node) or Runpod | **Matches** at 768p. Higgsfield's 2K uses MiniMax's hosted Regenerate-2K stage, so add [SeedVR2][seedvr2] | H3 |
| LTX 2.5 Fast, LTX 2.5 Pro | Video | API models with audio and camera motion controls, 4K and 1080p ([API][hf-api]) | Same weights: LTX-2.5 distilled and dev. Fast and Pro are hosted tiers ([LTX API docs][ltx-api]) | Cloud or Runpod | **Matches** (same model; AA T2V 950) | LTX-2.x |
| Wan 2.2, Wan 2.2 Image, Wan 2.2 Animate | Video, image | Legacy video and image tier; engine of the 2025 face and character swap tools; character animation page ([swap guide][hf-swap], [Wan Animate page][hf-wan-animate]) | Same models, now superseded by Wan Animate 2, SCAIL-2 and H3 | Cloud or Runpod | **Matches** (same models) | Apache 2.0 |
| InfiniteTalk | Talking head | Long-form talking video in Lipsync Studio ([lipsync help][hf-lipsync]) | Same model ([Comfy docs][infinitetalk]) | Cloud or Runpod | **Matches** | Apache 2.0 |
| Z-Image (Turbo) | Image | Fast, lightly filtered portraits at 0.15 credits | Same model ([HF][zimage]) | Cloud or Runpod | **Matches** (AA T2I 935) | Apache 2.0 |
| Ideogram 4.0 | Image | API catalog: multilingual text for posters and packaging | Same model, gated ([card][ideogram4]) | Cloud or Runpod | **Matches** (AA T2I 1023, #2 open) | Ideogram non-commercial |
| Kimi K3, Kimi K2.6 | LLM | K3 is the default builder in Higgsfield Games; K2.6 was a Supercomputer option ([Games post][hf-games]) | Kimi K3 ([HF][kimi]) | Comfy API (OpenRouter partner node) or self-hosted | **Matches** (AA 44) | Kimi K3 License: credit needed above 100M users |
| GLM-5.3 Flash | LLM | Free Supercomputer model; 3D Jutsu agent option ([3D Jutsu][hf-3dj]) | [GLM-5.3][glm] (AA 45) | Runpod (multi-GPU); the OpenRouter node has GLM-5 | **Matches** (open family) | GLM licence, MIT-like |
| DeepSeek V4 Pro | LLM | Coding-focused Supercomputer option ([Supercomputer help][hf-super]) | [DeepSeek V4.1-Flash][deepseek] (AA 39) | Runpod; the OpenRouter node has V4 | **Matches** (open family) | MIT |
| **Higgsfield's own models and tools (closed)** | | | | | | |
| Cinema Studio 4.0 (also an API model) | Video studio | Director's panel, up to 50 references, 30 s clips, forward and backward extend, regional edits, all on Seedance 2.5 ([Cinema Studio help][hf-cinema]) | H3 + LTX-2.5 multi-shot + camera and lens prompt presets; FLUX 3 Image Klein keyframes | Cloud or Runpod | **Close.** Pixels are close (H3 ≈ Seedance 2.5). Behind on references (9 images vs 50), length and backward extend | H3 / LTX-2.x / FLUX Kommunity |
| Higgsfield DoP (Lite, Standard, Turbo) | Video | Image to video with 50+ camera and VFX presets ([DoP help][hf-dop]) | H3 i2v with ComfyField's camera-move prompts; [Wan 2.2 Fun Camera][fun-camera] for exact trajectories | Cloud or Runpod | **Close.** No benchmark for DoP | H3; Apache 2.0 |
| Higgsfield Genjutsu (Motion transfer, Object swap, Restyle) | Video edit | Rebuild part of a 4 to 30 s clip from up to 30 references, up to 1080p ([Genjutsu post][hf-genjutsu]) | Wan Animate 2 (motion), Bernini-R (swap, restyle), [SCAIL-2][scail2] (character), [VOID][void] (removal) | Cloud or Runpod | **Close.** Every mode is covered, none is benchmarked. Bernini-R defaults to 480p at 16 fps and takes far fewer references | Apache 2.0 / MIT |
| Recast, Video Face Swap, Face Swap 2, Character Swap 2.0 | Video, image | Swap a face or a whole character in a video or photo ([swap guide][hf-swap]) | Video: SCAIL-2, [Wan 2.2 Animate][wan-animate] Mix. Image: [Qwen-Image-2.1][qwen21] multi-image edit | Cloud or Runpod | **Close.** Higgsfield's engines are undisclosed | MIT / Apache 2.0; Qwen-Image-2.1 research only |
| Higgsfield Speak 2.0 | Talking head | Fast image to talking video ([lipsync help][hf-lipsync]) | InfiniteTalk | Cloud or Runpod | **Close.** No benchmark | Apache 2.0 |
| Soul 2.0, Higgsfield Soul (original) | Image | Fashion-realism house model with presets, moodboards, Soul HEX and Soul ID, at 0.12 credits ([Soul help][hf-soul]) | [Krea 2 Raw][krea2] with its official style LoRAs and style-reference template | Cloud or Runpod | **Close.** No benchmark for Soul | Krea 2: commercial only under $1M revenue ([licence][krea-lic]) |
| Soul Cinema, Cinematic Cameras (cinematic-v1) | Image | Film-grade stills; camera, lens and focal-length stills for keyframes | Krea 2 Raw with a film-look LoRA; [FLUX 3 Image Klein][klein-docs] with a trained style LoRA | Cloud or Runpod | **Close** | Krea 2 / FLUX Kommunity |
| Soul ID | Identity training | One face from 20+ photos, trained in minutes, reused across Soul and Seedance | [ai-toolkit][ai-toolkit] LoRA on the Klein base or Qwen-Image, then imported into Cloud. Zero-shot: [Qwen-Image-Edit-2511][qwen2511], H3 Ref2VA | Runpod (training), Cloud (inference) | **Close** on output. Behind on convenience, because Cloud cannot train ([import docs][cloud-import]) | FLUX Kommunity excludes commercial fine-tune distribution |
| Higgsfield Popcorn | Image | Storyboards of up to 8 consistent frames from 4 references ([Popcorn help][hf-popcorn]) | Qwen-Image-2.1 or Klein multi-reference per frame; [LTX-2.5 Ingredients][ltx-ingredients] for video | Cloud or Runpod | **Close** | research only / FLUX Kommunity |
| Marketing Studio Image | Image | Product shots in Marketing Studio | Qwen-Image-2.1 edit; Klein | Cloud or Runpod | **Close.** Engine undisclosed | research only / FLUX Kommunity |
| Angles 2.0, Relight, Video Relight, Change Color Palette, Reframe, Expand, Skin Enhancer, Background Remover | Utility | Post tools; engines not named ([relight post][hf-relight]) | Qwen-Image-Edit-2511 + [Multiple-Angles LoRA][multiangle]; Bernini-R; KJNodes color match; [Wan 2.1 VACE][vace] outpaint; [SAM 3.1][sam3] + [BiRefNet][birefnet] (see the capability table) | Cloud or Runpod | **Close.** Engines undisclosed | mostly Apache 2.0 / MIT |
| Virality Predictor, Similarity Scoring | VLM | Hook scoring; likeness and IP checks, which Higgsfield says hit 86.6% accuracy on video ([scoring post][hf-scoring]) | [Qwen3.8-Flash-Next][flash-next] FP4 (LVBench 76.6); [Qwen3-VL 8B][qwen3vl] on Cloud | Runpod (Flash-Next); Cloud (Qwen3-VL) | **Close.** Higgsfield's models are undisclosed | Qwen Community License / Apache 2.0 |
| **Lipsync partners** | | | | | | |
| Kling Avatars 2.0, Kling 2.6 Lipsync, Kling 3.0 Lipsync, Kling Speak, Wan 2.5 Speak | Talking head | Image plus audio to a talking clip ([lipsync help][hf-lipsync]) | InfiniteTalk; [LTX-2.3 IA2V][ltx23]; H3 Ref2VA with an audio reference | Cloud or Runpod | **Close.** No shared benchmark | Apache 2.0 / LTX-2.x / H3 |
| Kling Lipsync, Sync Lipsync 3, Sync Lipsync 2 Pro | Lipsync | Re-lip existing footage; Sync 3 goes up to 4K | InfiniteTalk V2V (WanVideoWrapper); [LatentSync 1.6][latentsync] | Cloud (InfiniteTalk); Runpod (LatentSync) | **Behind** on resolution: 480p or 720p, and a 512 px mouth crop, vs 4K | Apache 2.0 / OpenRAIL++ |
| **Image** | | | | | | |
| GPT Image 2.5 Sunburst | Image | Precise multi-step edits for campaign work, 16 references, 4K ([GPT Image 2.5 post][hf-gpt25]) | Qwen-Image-2.1 (generation and editing, 10 references, native 2K) | Cloud (templates) or Runpod | **Behind.** AA T2I 1218 vs 1040 (#21); AA editing 1199 vs 1083 ([AA T2I][aa-t2i], [AA image editing][aa-iedit]) | Qwen Research License: non-commercial ([licence][qwen21-lic]) |
| GPT Image 2.5 Flare, GPT Image 2 (Create image default), GPT Image 1.5 | Image | Fast everyday images, text rendering, product sheets | FLUX 3 Image Klein distilled (4 to 16 steps, 8 GB INT8) | Cloud or Runpod | **Behind.** Klein is unranked. BFL claims +91 Elo over klein 9B (AA 930); if the scales matched, that lands near 1020, still under Qwen-Image-2.1 ([BFL][klein-bfl]) | FLUX Kommunity: outputs commercial under $5M revenue ([licence][klein-lic]) |
| Nano Banana Pro, Nano Banana Pro Inpaint | Image | The most-mentioned image model: 14 references, native 4K, masked edits in Layers | Qwen-Image-2.1 (masks, 10 references); Klein for native 4K | Cloud or Runpod | **Behind.** Score not captured, but the best open model is #21; 10 references vs 14 | research only / FLUX Kommunity |
| Nano Banana 2.1, 2, 2 Lite, Nano Banana | Image | Fast generation; 2.1 holds 4 characters and 10 objects at up to 4K; plugin default ([changelog][hf-changelog]) | Klein distilled with multi-reference | Cloud or Runpod | **Behind** (scores not captured) | FLUX Kommunity |
| Seedream 5.0 Pro, 5.0 Lite, 5.0 Flash, 4.5, 4.0 | Image | Reasoning-heavy prompts, infographics, point edits; powers Higgsfield Layers ([Layers page][hf-layers]) | Qwen-Image-2.1; [Qwen-Image-Layered][qwen-layered] for layers | Cloud or Runpod | **Behind** (scores not captured) | research only; Layered is Apache 2.0 |
| FLUX 3 Image | Image | Generation and editing to 4K, multilingual text | FLUX 3 Image Klein, its open 5.6B sibling | Cloud (templates; catalog may lag) or Runpod | **Behind.** The API model is AA T2I #11 at 1115; Klein is unranked | FLUX Kommunity |
| FLUX.2 Pro, Flex, Max | Image | Speed-optimised detail, HEX and JSON control | [FLUX.2 dev][flux2] (AA 1000) or Klein | Cloud or Runpod | **Close.** FLUX.2 dev is the board anchor at 1000; Pro score not captured | FLUX.2 dev non-commercial |
| Flux Kontext | Image edit | Reference-based edits (legacy) | Klein edit, Kontext's successor. FLUX.1 Kontext dev is also open (AA editing 884) | Cloud or Runpod | **Matches.** BFL says Klein beats klein 9B (1015) by 70 Elo in editing (vendor claim) | FLUX Kommunity |
| Recraft V4.1, V4, Styles, Utility | Image | Design and concept art, brand palettes, vector mode ([Recraft post][hf-recraft]) | [Ming-Image-0.1-Design][ming] (UI, posters, infographics, transparent backgrounds) | Cloud (template; catalog unverified) or Runpod | **Behind** on vectors: no open native-SVG model found. Raster design is closer (Ming AA 998) | MIT |
| Grok Imagine 2.0 | Image | High-resolution generation and detail-preserving edits | Qwen-Image-2.1 | Cloud or Runpod | **Behind** (score not captured) | research only |
| Ideogram 4.5 | Image | Repeat edits, text replace and translate, 4 references, transparent output, reframe ([Ideogram page][hf-ideogram]) | Ideogram 4.0 open weights; Qwen-Image-2.1 for edits | Cloud or Runpod | **Close.** 4.0 is the #2 open T2I model at 1023 | Ideogram 4.0 non-commercial |
| Qwen Image 3 | Image | Bilingual text to 2K (API) | Qwen-Image-2.1 | Cloud or Runpod | **Behind.** AA 1069 (Pro 1093) vs 1040 | research only |
| Kling O1 Image, Reve | Image | Cheap tiers inside plans ([pricing][hf-pricing]) | Klein; Z-Image Turbo | Cloud or Runpod | **Close** (scores not captured) | FLUX Kommunity / Apache 2.0 |
| **Upscalers** | | | | | | |
| Topaz High-Resolution Upscaler, Topaz Generative | Image upscale | Default image upscaler (x1 to x16); the generative variant invents detail ([upscale help][hf-upscale]) | SeedVR2 image templates; RealESRGAN x4plus for faithful 4x | Cloud or Runpod | **Close.** No shared benchmark | Apache 2.0 / BSD-3 |
| Topaz Video | Video upscale | Diffusion upscale that adds detail | SeedVR2 7B | Cloud or Runpod | **Close** | Apache 2.0 |
| ByteDance Upscale | Video and image upscale | Up to 8K video and 4K image, 30 or 60 fps | SeedVR2 3B INT8 + [RIFE 4.26][rife] | Cloud or Runpod | **Close.** No open 8K evidence; SeedVR2 3B peaks near 53 GB without offload | Apache 2.0 / MIT |
| FLUX.3 Upscale | Video upscale | Precise or creative upscale to 4K | SeedVR2 (precise); [FlashVSR v1.1][flashvsr] (fast) | Cloud or Runpod | **Close.** BFL's upscaler is API-only | Apache 2.0 |
| Higgsfield Upscale (Sora 2 Upscale, 2025) | Video restore | Deflicker, stabilise, denoise and upscale | SeedVR2; LTX-2.5 Restore and Deblur IC-LoRAs | Cloud or Runpod | **Close** | Apache 2.0 / LTX-2.x |
| **Audio** | | | | | | |
| Eleven v4, Eleven v4 Turbo | TTS | Multi-speaker expressive narration in 90+ languages, 10,000 characters ([changelog][hf-changelog]) | [Fish Audio Drama 3][drama3] (83 languages, inline tags, up to 16 speakers). On Cloud: [Chatterbox Multilingual V3][chatterbox] | Runpod (Drama 3); Cloud (Chatterbox) | **Close.** Drama 3 is #10 overall on AA TTS at 1244, the top open model; Eleven scores not captured | Drama 3: commercial under $500k revenue, no hosted service |
| Eleven v3 | TTS | Emotion through inline tags ([audio post][hf-audio]) | Drama 3; [IndexTTS 2.5][indextts] for emotion vectors | Runpod | **Close** | as above; bilibili licence |
| Seed Audio 1.0 | Audio scene | Dialogue, ambience, music and effects in one pass, plus TTS, cloning and dubbing ([models help][hf-models]) | Chain: Drama 3 + [Stable Audio 3][sa3] + [MiniMax Music 3][music3]. LTX-2.5 text to audio is the only single-model option, and it is unbenchmarked | Runpod + Cloud | **Behind.** No open one-pass scene model found | mixed |
| Seed Speech | TTS | Multilingual narration, 30+ languages | Drama 3 (83 languages); [VoxCPM2][voxcpm2] (30); Chatterbox (23 to 25, Cloud) | Runpod; Cloud | **Close** | Apache 2.0 (VoxCPM2) |
| MiniMax Speech 2.8 HD | TTS | High-fidelity single-voice narration and cloning | Drama 3; [Qwen3-TTS][qwen3tts] 1.7B | Runpod | **Close** | Apache 2.0 (Qwen3-TTS) |
| Qwen Audio 3.0 | TTS, voice change, dubbing | Cheapest general TTS, 13+ languages; the Qwen-based audio redesign behind Change Voice and Translate ([changelog][hf-changelog]) | Qwen3-TTS (Base, CustomVoice, VoiceDesign); Chatterbox VC for voice change | Runpod (TTS-Audio-Suite); Cloud (Chatterbox VC) | **Close.** Qwen3-TTS is the open sibling from the same lab | Apache 2.0 / MIT |
| VibeVoice | TTS | Long-form audiobooks and podcasts (not in the current menu) | Drama 3; VoxCPM2 | Runpod | **Close.** Microsoft's VibeVoice 7B repo is disabled, so it is not counted as open | n/a |
| **3D** | | | | | | |
| Meshy 5 | 3D | 3D Model tab in the Blender plugin ([Blender post][hf-blender]) | [TRELLIS.2-4B][trellis2] (PBR GLB) | Cloud (native core) or Runpod | **Close.** No shared benchmark | MIT |
| **LLMs** | | | | | | |
| Claude Opus 5.5, Sonnet 5.5, Opus 5, Fable 5.1, Fable 5, Opus 4.6, Sonnet 4.6 | LLM | Supercomputer chat, Cinema Studio AI Director, 3D Jutsu agent, Katana ([Supercomputer help][hf-super]) | Kimi K3 through Comfy's OpenRouter node; [MiMo-V2.6-Pro][mimo] (AA 46, #1 open) self-hosted; [Qwen3.8-27B][qwen38] (AA 34) in the core Generate Text node | Comfy API; Runpod (multi-node); Cloud core node | **Close** to behind: closed AA scores not captured | Kimi credit clause; MIT; Apache 2.0 |
| GPT-6 Astra, GPT-6.1 Sol, GPT-6 Sol, GPT-6 Luna, GPT-5.6 Sol, GPT-5.5 | LLM | Games 2.0 logic, AI Motion Designer (After Effects code), Supercomputer ([Games 2.0 post][hf-games2]) | Kimi K3; Qwen3.8-27B for code (LiveCodeBench 90.3) | as above | **Close** to behind (scores not captured) | as above |
| Gemini 3.5 Flash, 3.1 Pro, 3.0 Flash; Grok 4.7, 4.3 | LLM | Supercomputer picks for drafts, multimodal briefs and research | Kimi K3 (it also reads video: Video-MME 90.0); [Gemma 4][gemma4] in the core node | Comfy API; Cloud | **Close** (scores not captured) | Apache 2.0 (Gemma 4) |
| Orchestrator (Auto), Ox Alpha | LLM router | Default router that sends each step to a suitable model; Ox Alpha was the free model before GLM-5.3 Flash | Routing rules in ComfyField, with Qwen3.8-27B as the cheap step | Cloud | **n/a** (app logic) | Apache 2.0 |

### Capability by capability

The "Comfy Cloud?" column assumes Cloud can only run its preinstalled node packs ([supported nodes][cloud-nodes]) and models from the [catalog][catalog], or weights imported on the Creator plan ([import docs][cloud-import]).

| Capability | Higgsfield's model(s) | Open-weight pick | Runner-up | Comfy Cloud? | VRAM | ComfyUI node | Gap |
|---|---|---|---|---|---|---|---|
| Text to video | Seedance 2.5, Wan 3.0, Kling 3.0, Veo 3.1, FLUX.3 Video, Grok Imagine 1.5, Gemini Omni Flash 1.1, MiniMax H3 | [MiniMax H3][h3-docs] FL2VA (FastH3 or Turbo LoRA for drafts) | [LTX-2.5][ltx-docs] distilled | Yes (preinstalled; also a Cloud node) | 16 GB with community quants; 32 GB+ comfortable; Cloud has 96 GB | Native (0.30.0+), `video_minimax_h3_*` templates | **Close.** 1159 vs Wan 3.0 1174 and Seedance 2.5 1160 ([AA T2V][aa-t2v]) |
| Image to video | As above, plus Higgsfield DoP | H3 FL2VA i2v | LTX-2.5 i2v | Yes | as above | Native `video_minimax_h3_i2v`, the most-used open video template | **Matches.** H3 is #1 overall on AA I2V at 1141 ([AA I2V][aa-i2v]) |
| First and last frame | Veo 3.1, Kling 3.0 Omni, Gemini Omni Flash 1.1, PixVerse 6, Wan (Higgsfield's first-and-last-frame pick), H3 | H3 FL2VA with first and last frames, plus multiframe reference | LTX-2.5 FLF2V for fast drafts | Yes | H3 as above; LTX needs 24 GB, 32 GB is comfortable | Native `video_minimax_h3_i2v`, `video_minimax_h3_multiframe_reference`, `video_ltx2_5_flf2v` | **Matches** (I2V #1) |
| Multi-shot | Kling 3.0 (6 cuts), Wan 3.0 (6 shots), Cinema Studio 4.0 tempo, Seedance 2.5 | LTX-2.5 native multi-shot | H3 with shots in the prompt (unverified); [LTX-2.5 Ingredients][ltx-ingredients] across separate clips | Yes (Ingredients needs import) | 24 GB minimum, 32 GB comfortable | Native LTX-2.5 t2v and i2v; Ingredients via [ComfyUI-LTXVideo][ltxvideo-pack] | **Behind.** LTX-2.5 scores 950 vs Kling 3.0 Omni 1019 and Wan 3.0 1174; shot count unverified |
| Extension | Cinema Studio 4.0 forward and backward extend to 30 s; Grok Imagine 1.5; Gemini Omni Flash 1.1 (10 s steps); FLUX.3 Video continuation | H3 i2v continuation | Wan Animate 2 extension; SVI 2.0 for Wan 2.2 (WanVideoWrapper) | Yes | as H3 | Native `video_minimax_h3_i2v_continuation` | **Close.** 4 to 15 s per call, forward only; no open backward extend found |
| Native audio with video | Seedance 2.5, Kling 3.0, Veo 3.1, Wan 3.0, Grok Imagine 1.5, FLUX.3 Video, H3 | H3 (stereo, audio references) | LTX-2.5 joint audio and video | Yes | as H3 | Native | **Matches** on capability; no separate audio score |
| Camera control presets | Higgsfield DoP (50+ presets); Cinema Studio camera, lens and move sets; Kling 3.0 camera presets | H3 i2v with ComfyField's camera-move prompts | [Wan 2.2 Fun Camera][fun-camera] for explicit trajectories | Yes | Fun Camera at fp8 uses about 84% of 24 GB | Native | **Close.** No benchmark for DoP |
| Motion transfer | Kling 3.0 Motion Control, Genjutsu Motion transfer, Gemini Omni Flash | [Wan Animate 2][wan-animate2] | [SCAIL-2][scail2] animation; Wan 2.2 Animate Move | Yes | INT8 repack; exact VRAM not published | Native `video_wan_animate2` (+ distilled) | **Close.** No public benchmark |
| Character swap (video) | Recast, Genjutsu, Gemini Omni Flash | SCAIL-2 character replacement | [Wan 2.2 Animate][wan-animate] Mix + relight LoRA | Yes | about 24 GB at INT8 (estimate) | Native + SAM3 tracking, `video_wan21_scail2_character_replacement` | **Close** |
| Object swap (video) | Genjutsu Object swap, Kling 3.0 Omni Edit, Seedance 2.5 Edit, Gemini Omni Flash | [Bernini-R][bernini] reference + video edit | Wan 2.1 VACE with SAM3 ("change any object" template); H3 Fun ControlNet masked inpaint | Yes | not stated (H100 reference) | Native `video_bernini_r_video_editing` | **Close.** Only the vendor's own arena; 480p at 16 fps by default |
| Object removal (video) | Genjutsu; "Remove object from video" | [VOID][void] (masked; also removes shadows and physical effects) | [LTX-2.5 Clean-Plate][ltx-cleanplate] (no mask) | Yes (Clean-Plate needs import) | 40 GB+ | Native `utility_void_video_inpainting` | **Close** |
| Restyle | Genjutsu Restyle (20+ styles), Shorts Studio (Gemini Omni Flash), Mixed Media | Bernini-R | Wan 2.1 VACE restyle template; H3 Fun ControlNet Union (depth, pose) | Yes | as Bernini-R | Native | **Close** |
| Relight | Video Relight (6 presets, 2 custom lights), the Relight app (image), Gemini Omni Flash | Video: Bernini-R (its template lists relighting). Image: Qwen-Image-Edit-2511 relight LoRA | [LTX-2.5 Day-To-Night][ltx-daynight] (night only); IC-Light-Native for images | Yes (Day-To-Night needs import) | Bernini-R not stated; 2511 at fp8 is 20.5 GB | Native; IC-LoRA via ComfyUI-LTXVideo; IC-Light-Native pack | **Close** |
| Color grade | Change Color Palette (50+ presets or a reference), Cinema Studio color grade, Soul HEX | Reference color match in KJNodes (no model) | Bernini-R for look changes; LTX-2.5 SDR-To-HDR and Colorization IC-LoRAs | Yes | negligible | KJNodes (preinstalled on Cloud) | **Close.** A deterministic match keeps every frame intact; stylised grades need a generative pass |
| Reframe | Higgsfield Reframe, Ideogram 4.5 reframe | [Wan 2.1 VACE][vace] video outpainting | LTX-2.3 video outpainting IC-LoRA | Yes | 14B at fp8 about 24 GB (estimate) | Native VACE templates; LTX-2.3 template with ComfyUI-LTXVideo and KJNodes | **Close** |
| Video upscale | ByteDance Upscale (8K), Topaz Video, FLUX.3 Upscale | [SeedVR2][seedvr2] 3B INT8 (7B for finals) | [FlashVSR v1.1][flashvsr] for speed | Yes (FlashVSR through a preinstalled pack) | 3B peaks about 53 GB without offload; FlashVSR 11 to 18 GB | Native `utility_seedvr2_3b_int8_upscale_video` | **Close.** No open 8K evidence |
| Frame interpolation | ByteDance Upscale (to 60 fps) | [RIFE 4.26][rife] | FILM for large motion | Yes | small | Native `FrameInterpolate` | **Matches** |
| Background removal | Background Remover (image and video), GPT Image 2.5 transparency | [SAM 3.1][sam3] tracking + [BiRefNet][birefnet] | [LTX-2.5 Alpha-Gen][ltx-alphagen] for temporally consistent mattes; Qwen-Image-2.1 RGBA for images | Yes (Alpha-Gen needs import) | BiRefNet 3.5 GB | Native `SAM3_VideoTrack`, `utility_birefnet_remove_background` | **Matches** |
| Text to image | GPT Image 2 and 2.5, Nano Banana Pro and 2.1, Seedream 5.0 Pro, FLUX 3 Image, Grok Imagine 2.0, FLUX.2 Pro, Z-Image | [FLUX 3 Image Klein][klein-docs] distilled | [Qwen-Image-2.1][qwen21] (top open on AA T2I at 1040) | Yes (templates; catalog may lag) | 8 GB at INT8; 16 to 24 GB comfortable | Native (0.41.0+) | **Behind.** GPT Image 2.5 Sunburst 1218 vs best open 1040 (#21) ([AA T2I][aa-t2i]) |
| Cinematic stills | Soul Cinema, Cinematic Cameras, Soul 2.0 | [Krea 2 Raw][krea2] + style LoRAs | Klein + a trained style LoRA | Yes | 8 GB INT8, 16 GB FP8, 24 GB BF16 | Native (t2i, style reference) | **Close.** No benchmark for Soul |
| Editing | GPT Image 2.5 Sunburst, Nano Banana Pro, Seedream 5.0, Grok Imagine 2.0, Ideogram 4.5, Flux Kontext | Qwen-Image-2.1 edit (Turbo for drafts) | Klein edit; Qwen-Image-Edit-2511 | Yes | 16 to 24 GB with int8 | Native edit and Turbo edit templates | **Behind.** 1199 vs 1083 ([AA image editing][aa-iedit]) |
| Multi-reference | Nano Banana Pro and 2.1 (14), GPT Image 2.5 (16), Popcorn (4), Cinema Studio (50) | Qwen-Image-2.1 (up to 10) | Klein (up to 10, plus bounding boxes) | Yes | as above | Native; Klein `Set Reference Multi Latent` | **Close.** 10 references vs 14 to 16 |
| Inpaint | Nano Banana Pro Inpaint, Soul Inpaint | Qwen-Image-2.1 mask or painted-mark targeting | [InstantX inpainting ControlNet][instantx]; Klein bounding boxes | Yes | as Qwen-Image-2.1 | Native `image_qwen_image_instantx_inpainting_controlnet` | **Close** |
| Outpaint | Expand image, Ideogram 4.5 reframe | Qwen-Image-2.1 with padding | Qwen-Image-Edit-2511 crop-and-stitch; generic `ImagePadForOutpaint` | Yes | as above | Native | **Close** |
| Layers | Higgsfield Layers (Seedream 5.0), Breakdown | [Qwen-Image-Layered][qwen-layered] (+ Layered-Control) | Ming-Image-0.1-Design-Layer (80 GiB, no ComfyUI) | Yes | fp8 file 20.5 GB; bf16 about 45 GB peak | Native `image_qwen_image_layered` | **Close.** 640 px recommended |
| Face swap | Face Swap 2 (image and video), Video Face Swap | Image: Qwen-Image-2.1 multi-image edit. Video: Wan 2.2 Animate Mix | SCAIL-2; Klein multi-reference | Yes | about 24 GB (video) | Native | **Close** |
| Character consistency and LoRA training | Soul ID (20+ photos), Elements, AI Influencer, Kling Elements | Training: [ai-toolkit][ai-toolkit] LoRA on the Klein base on Runpod, then import into Cloud. Zero-shot: H3 Ref2VA (video), Qwen-Image-Edit-2511 + [Multiple-Angles][multiangle] (image) | musubi-tuner (H3 with audio, Wan); HiDream-O1 personalization | Inference yes; training no ([import docs][cloud-import]) | ai-toolkit: Qwen-Image 24 GB; Wan 2.2 14B 24 GB at 4-bit | ai-toolkit (outside ComfyUI); experimental core Train LoRA node | **Close** on output; slower than Soul ID |
| Upscale image | Topaz (default), Topaz Generative, ByteDance Upscale | SeedVR2 image templates | RealESRGAN x4plus | Yes | as SeedVR2 | Native | **Close** |
| Talking heads | Higgsfield Speak 2.0, Kling Avatars 2.0, Kling 2.6 Lipsync, Wan 2.5 Speak, Veo 3.1, InfiniteTalk | [InfiniteTalk][infinitetalk] | [LTX-2.3 IA2V][ltx23]; H3 Ref2VA with audio; Wan 2.2 S2V | Yes | 24 GB minimum, 48 GB comfortable | Native `WanInfiniteTalkToVideo` | **Matches.** Higgsfield serves InfiniteTalk itself |
| Lipsync (existing video) | Kling Lipsync, Sync Lipsync 3 (to 4K) | InfiniteTalk V2V | [LatentSync 1.6][latentsync] (mouth only, 512 px) | Yes for InfiniteTalk (via WanVideoWrapper); LatentSync needs Runpod | 24 to 48 GB; LatentSync 18 to 20 GB | ComfyUI-WanVideoWrapper; ComfyUI-LatentSyncWrapper | **Behind** on resolution |
| Text to speech | Eleven v4, v4 Turbo, v3, MiniMax Speech 2.8 HD, Qwen Audio 3.0, Seed Speech, Seed Audio 1.0 | [Fish Audio Drama 3][drama3] | [Chatterbox Multilingual V3][chatterbox] (Cloud); Qwen3-TTS; VoxCPM2 | No for Drama 3; yes for Chatterbox | 41.5 GB at FP8 | None for the open weights (Comfy's Drama 3 node is a paid API); Chatterbox via Fill-ChatterBox | **Close.** AA TTS 1244, #10 overall, #1 open |
| Voice clone | Create custom voice; Seed Audio and MiniMax Speech cloning | [VoxCPM2][voxcpm2] or [Qwen3-TTS][qwen3tts] Base (3 s reference) | Chatterbox (Cloud); CosyVoice 3 | Chatterbox only | about 8 GB; 3 to 6 GB download | ComfyUI-VoxCPM; TTS-Audio-Suite | **Close** |
| Voice change | Change Voice (Qwen-based audio redesign) | Chatterbox VC | Seed-VC v2; RVC for singing | Yes (official template) | 8 GB+ (Chatterbox) | Fill-ChatterBox | **Close** |
| Dubbing | Translate (18 languages) + Lipsync Studio | Chain: Qwen3-ASR with ForcedAligner, then TranslateGemma 12B or Gemma 4, then VoxCPM2 or Qwen3-TTS cloning, then InfiniteTalk V2V | Cloud chain: Gemma 4 E4B (speech to translated text), then Chatterbox Multilingual, then InfiniteTalk | Cloud chain only (weaker) | sum of the parts | Core Generate Text + Fill-ChatterBox + native InfiniteTalk | **Close** |
| Music | Seed Audio 1.0 (music only inside one-pass scenes); no dedicated music model | [MiniMax Music 3][music3] | [ACE-Step 1.5 XL turbo][acestep]; YuE2 | Yes | about 22 GB with offload; 8 GB with layer streaming | Native | **Matches.** Top open model on AA Music Arena v1.1 |
| Sound effects | Seed Audio 1.0; native audio in video models | [Stable Audio 3 Medium][sa3] | Stable Audio 3 Small-SFX | Yes | the Small model runs on CPU | Native (day 0) | **Close** |
| Foley (sound for existing video) | No standalone tool found; native audio only | [HunyuanVideo-Foley XXL][foley] | LTX-2.5 video to audio or the LTX-2.3 Foley LoRA (Cloud, unverified); MMAudio | No (custom node) | 20 GB (12 GB with offload) | Custom node | **Matches.** Higgsfield has no equivalent |
| 3D | 3D Jutsu (an LLM blocks the scene with primitives and curated GLB and Mixamo assets; Seedance 2.5 renders it); Meshy 5 in the Blender plugin | [TRELLIS.2-4B][trellis2] for assets; render the previz with the LTX-2.5 Layout-To-Render IC-LoRA or H3 Fun ControlNet (depth) | [Hunyuan3D 2.1][hunyuan3d]; Pixal3D; TripoSplat for splats | Yes | 24 GB+ | Native core (0.34.0+) | **Matches.** 3D Jutsu generates no meshes ([3D Jutsu][hf-3dj]); Higgsfield's only mesh model is Meshy 5 in the Blender plugin |
| Worlds | None | [HY-World 2.0][hyworld] (mesh, splat, point cloud) | Matrix-3D; Lyra 1.0 | No | very large (80B panorama stage) | Partial community pack | **Matches.** Higgsfield has no worlds tool |
| Games | Higgsfield Games (Kimi K3 default), Games 2.0 (GPT-6 Astra) | [Kimi K3][kimi], the same default | Qwen3.8-27B; [Matrix-Game 4.0][matrixgame] for playable world video | Through the OpenRouter partner node | hosted (2.8T); Matrix-Game 9.2 to 12.8 GB | OpenRouter partner node; core Generate Text | **Matches** |
| LLM agent | Supercomputer: Claude, GPT-6, Gemini, Grok, DeepSeek, GLM-5.3 Flash; Orchestrator | Kimi K3 (AA 44) through the OpenRouter node | [Qwen3.8-27B][qwen38] or [Gemma 4][gemma4] 31B in the core Generate Text node; [MiMo-V2.6-Pro][mimo] (AA 46) self-hosted | Yes | hosted; Qwen3.8-27B at w4a8 fits one GPU | OpenRouter partner node; core Generate Text | **Close.** Closed AA scores not captured |
| VLM judging | Virality Predictor, Similarity Scoring | [Qwen3.8-Flash-Next][flash-next] FP4 (LVBench 76.6) | [Qwen3-VL 8B][qwen3vl] through ComfyUI-QwenVL (Cloud); Qwen3.6-27B | Runner-up only | one 96 GB GPU | Alongside ComfyUI (vLLM); QwenVL pack | **Close** |
| New camera angle | Angles 2.0, Shots, Zooms (image); Gemini Omni Flash prompts (video) | Image: Qwen-Image-Edit-2511 + Multiple-Angles LoRA (96 poses). Video: [ReCamMaster][recam] | Wan Animate 2 viewpoint control; Uni3C | Image yes; video needs imported weights or Runpod | 20.5 GB fp8; ReCamMaster 24 to 48 GB | Native `template_qwen_multiangle.app`; WanVideoWrapper | **Close** for images (purpose-built LoRA); behind for video (480p, 81 frames) |
| Storyboards | Higgsfield Popcorn (8 frames, 4 references) | Qwen-Image-2.1 multi-reference per frame | Klein; LTX-2.5 Ingredients for video | Yes | as above | Native | **Close** |
| Design, typography, vectors | Recraft V4.1 (vector mode), Ideogram 4.5, GPT Image 2.5 | [Ming-Image-0.1-Design][ming] | Qwen-Image-2.1 (typography, RGBA); Ideogram 4.0 | Yes (template; catalog unverified) | 43.3 GB download | Native t2i and edit | **Behind** on vectors (no open native-SVG model found) |

### What to wire first

The ranking puts the models that unlock the most Higgsfield features for the least integration work first. Each row names the planned workflow ids in `src/lib/formats/*.js` that should switch to the model now. Today only three workflow files exist in `public/workflows/` (`image_flux.json`, `image_sdxl.json`, `video_ltx.json`), so every id below is still to build.

| Rank | Model | Use it in these workflow ids | Higgsfield features it answers | Comfy Cloud | Why this rank |
|---|---|---|---|---|---|
| 1 | MiniMax H3 (FL2VA i2v, multiframe reference, continuation, Ref2VA, Fun ControlNet Union; Turbo LoRA for drafts) | `wan22_i2v` (every camera move, product spin, cloud surfing, mix two moves), `cinema_shot`, `wan22_flf2v` (first and last frame, transition), `wan22_extend`, `wan22_draw` (Fun ControlNet HED or Canny), `wan22_product_ad`, `wan22_bullet_time`, the video stage of `wan22_truck_ad`, `ugc_ad` and `influencer_video` (Ref2VA with an audio reference), and the video stage of `explainer` and `faceless` | Seedance, Kling, Veo, Wan 3.0, Grok, FLUX.3 Video, DoP presets, Sora presets | Yes, preinstalled | Best open model on every AA video board; one native model family covers the largest set of formats |
| 2 | Qwen-Image-2.1 (edit, Turbo edit, t2i) | `qwen_edit` (erase, replace, sketch to image, product shot, plush toy), `qwen_edit_inpaint`, `qwen_edit_outpaint`, `qwen_edit_try_on`, `qwen_edit_style_ref`, `qwen_edit_place_product`, `qwen_edit_variants`, `qwen_edit_mockup`, `qwen_edit_face_swap`. Keep Qwen-Image-Edit-2511 for `qwen_character_sheet`, because the Multiple-Angles LoRA targets 2511 | Nano Banana Pro Inpaint, GPT Image and Seedream edits, Expand, Character Swap | Yes (templates) | Top open model on AA editing (1083) and T2I (1040); one model serves 9 ids |
| 3 | FLUX 3 Image Klein (distilled INT8, edit, base for LoRAs) | `flux_look` (every look and brand colors), `flux_character_set`, `storyboard`, the image stage of `link_to_ads` and `flux_hunyuan3d`, `kontext_edit`, `kontext_retouch`, `kontext_moodboard`, `kontext_character`, `kontext_character_swap`, `kontext_headshot` | GPT Image Flare, Nano Banana 2.x, FLUX 3 Image, Flux Kontext, Soul Cinema keyframes, Soul ID (as a LoRA base) | Yes (templates; may lag a release) | Replaces FLUX.1 dev and Kontext dev with the newest open FLUX at 8 GB, and is the only open route to the "Built with FLUX" bonus ([contest][contest]) |
| 4 | LTX-2.5 distilled + IC-LoRAs (Clean-Plate, Alpha-Gen, Day-To-Night, Ingredients) | `ltx_i2v` (effects), `wan22_multishot`, draft mode for `wan22_flf2v`; add Clean-Plate to video erase, Alpha-Gen to `birefnet_video_matte`, Day-To-Night to `wan_vace_relight` | Kling 3.0 and Wan 3.0 multi-shot, LTX 2.5 Fast and Pro, Genjutsu clean-up passes | Base yes; IC-LoRAs need import | The only open native multi-shot and the fastest open video model; the $2,000 LTX bonus needs LTX as the core video model ([contest][contest]) |
| 5 | Bernini-R | `wan_vace_swap`, `wan_vace_restyle`, `wan_vace_relight`, `wan_vace_clone_edit`, `wan_vace_recreate_ad`. For `wan_vace_grade`, run the KJNodes color match first and Bernini-R only for look changes | Genjutsu Object swap and Restyle, Kling Omni Edit, Video Relight, Ad Multiplier | Yes | One Apache model replaces five VACE workflows |
| 6 | Wan Animate 2 + SCAIL-2 | `wan22_animate` becomes Wan Animate 2. `wan22_animate_face_swap` becomes SCAIL-2 for a whole character, or stays on Wan 2.2 Animate Mix for the face only. Add a video character-swap format on SCAIL-2 | Kling Motion Control, Genjutsu Motion transfer, Recast | Yes | Native templates with SAM3 tracking |
| 7 | Audio: MiniMax Music 3, Stable Audio 3 Medium, keep Chatterbox | `ace_step` becomes MiniMax Music 3; `mmaudio_t2a` becomes Stable Audio 3 Medium; `mmaudio` becomes HunyuanVideo-Foley XXL on Runpod (LTX-2.5 video to audio on Cloud, unverified). `chatterbox_tts`, `chatterbox_clone` and `chatterbox_vc` stay on Cloud, with Drama 3 or VoxCPM2 as a Runpod quality tier. `dub` becomes the Qwen3-ASR, Gemma 4, cloning TTS and InfiniteTalk chain | Seed Audio, Eleven, MiniMax Speech, Change Voice, Translate | Music, SFX and Chatterbox yes; Drama 3 and Foley no | Music 3 and Stable Audio 3 are native Cloud nodes; MMAudio is weaker |
| 8 | TRELLIS.2-4B | `hunyuan3d_image`, `hunyuan3d_character`, `hunyuan3d_turntable`, the mesh stage of `flux_hunyuan3d`. `hunyuan_world` moves to HY-World 2.0 on Runpod | 3D Jutsu assets, Meshy 5 | Yes (native core) | Native PBR GLB; Hunyuan3D 2.1 becomes the runner-up |
| 9 | LLMs: Kimi K3 (OpenRouter node) or Qwen3.8-27B (core Generate Text) | `qwen3_blender_scene`, `qwen3_coder_game`, `motion_graphics`, and the script steps of `explainer`, `faceless`, `link_to_ads` and `dub`. `qwen3_vl_hook_check` becomes Qwen3-VL 8B on Cloud, or Qwen3.8-Flash-Next on Runpod | Supercomputer, Games, AI Motion Designer, Virality Predictor | Yes | Kimi K3 is Higgsfield's own game default. Use Qwen3.8-27B or Gemma 4 for "Open Weights Only" entries, because partner nodes and APIs disqualify ([contest][contest]) |
| 10 | Keep as planned | `seedvr2_video` (SeedVR2 3B INT8; 7B for finals), `rife_interpolate` (RIFE 4.26), `birefnet_video_matte` (add SAM 3.1 tracking), `qwen_image_layered`, `infinitetalk`, `infinitetalk_v2v`, `recammaster` (Runpod or imported weights) | Upscale, frame interpolation, mattes, Layers, Lipsync Studio | Yes, except ReCamMaster weights | Already the best open picks |

### Real gaps

These are the capabilities where no open model is close today.

| Gap | Higgsfield's best | Best open today | Evidence | What to do |
|---|---|---|---|---|
| Top-tier image generation and editing | GPT Image 2.5 Sunburst, Nano Banana Pro | Qwen-Image-2.1, FLUX 3 Image Klein | [AA T2I][aa-t2i] 1218 vs 1040 (#21); [AA image editing][aa-iedit] 1199 vs 1083 | Pick the best available: Qwen-Image-2.1 for edits and typography, Klein for speed and native 4K. Add a SeedVR2 detail pass. Re-check once Klein appears on the boards |
| Long, high-resolution video in one pass | Seedance 2.5 and Wan 3.0 (30 s, 1080p to 4K), Kling 3.0 (native 4K) | H3: 4 to 15 s at 768p; 2K is hosted only ([H3 card][h3-hf]) | Open H3 output is 768p | Chain: H3 continuation or multiframe reference for length, then SeedVR2 to 1080p or 4K. Use LTX-2.5 when native 4K matters more than quality |
| Instruction editing of existing footage | Wan 3.0 (AA editing 1200), Kling 3.0 Omni Edit, Gemini Omni Flash 1.1 | Bernini-R; H3 Fun ControlNet masked inpaint | H3's 1125 (#4) is MiniMax's hosted pipeline, and open H3-Base lacks the Context-IR stage. Bernini-R has only a vendor arena and defaults to 480p at 16 fps | Chain: SAM 3.1 masks, then Bernini-R or H3 masked inpaint, then SeedVR2. Prefer targeted tools where they exist (VOID, Clean-Plate, SCAIL-2, Wan Animate 2). Accept lower quality for broad edits |
| Many-reference conditioning | Cinema Studio 4.0 (50 references), Genjutsu (30), GPT Image 2.5 (16), Nano Banana (14), Wan 3.0 (12) | H3 Ref2VA: 9 images, 3 videos, 3 audio clips (the template exposes 2); Qwen-Image-2.1 and Klein: 10 | Reference counts | Chain: compose a character or product sheet with Qwen-Image-Edit-2511 + Multiple-Angles, then feed the sheet as one reference. Use LTX-2.5 Ingredients across clips, and trained LoRAs for recurring characters |
| One-pass audio scenes | Seed Audio 1.0 (dialogue, ambience, music and effects together) | Drama 3, Stable Audio 3, MiniMax Music 3 as separate steps | No open single model found | Chain and mix in a Flow. For sound inside generated video, rely on H3 or LTX-2.5 native audio |
| High-resolution lipsync on existing footage | Sync Lipsync 3 (up to 4K) | InfiniteTalk V2V (480p or 720p); LatentSync 1.6 (512 px mouth crop) | Output resolution | Chain: InfiniteTalk V2V, then SeedVR2. Or crop the face, run LatentSync and paste it back. Accept a lower resolution |
| Re-shooting an existing clip from a new angle | Gemini Omni Flash 1.1 (by prompt) | ReCamMaster (Wan 2.1 1.3B, 832x480, 81 frames), which needs imported weights or Runpod ([ReCamMaster][recam]) | No open successor found | Ship "Re-shoot from a new angle" as a draft-quality format. For better results, re-angle a still with Qwen Multiple-Angles and animate it with H3 first and last frame |
| Native vector output | Recraft V4.1 vector mode | Ming-Image-0.1-Design (raster with transparency), Qwen-Image-2.1 RGBA | No open native-SVG generator found in our research | Pick the best raster model and add a tracing step; label vectors as approximate |
| Fast identity training on Cloud (a platform gap, not a model gap) | Soul ID, trained in minutes | ai-toolkit on Runpod; Cloud only imports LoRAs | Cloud has no training feature, and jobs are capped at 30 to 60 minutes ([import docs][cloud-import]) | Train on Runpod with the official ai-toolkit template, push to Hugging Face, and import into Cloud. Use H3 Ref2VA and Qwen-Image-Edit-2511 for instant zero-shot consistency |

[aa-t2v]: https://artificialanalysis.ai/video/leaderboard/text-to-video
[aa-i2v]: https://artificialanalysis.ai/video/leaderboard/image-to-video
[aa-vedit]: https://artificialanalysis.ai/video/leaderboard/video-editing
[aa-t2i]: https://artificialanalysis.ai/image/leaderboard/text-to-image
[aa-iedit]: https://artificialanalysis.ai/image/leaderboard/editing
[h3-hf]: https://huggingface.co/MiniMaxAI/MiniMax-H3
[h3-docs]: https://docs.comfy.org/tutorials/video/minimax/minimax-h3
[ltx-hf]: https://huggingface.co/Lightricks/LTX-2.5
[ltx-docs]: https://docs.comfy.org/tutorials/video/ltx/ltx-2-5
[ltx-api]: https://docs.ltx.io/models/ltx-2-5
[ltx-ingredients]: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients
[ltx-cleanplate]: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Clean-Plate
[ltx-alphagen]: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen
[ltx-daynight]: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night
[ltxvideo-pack]: https://github.com/Lightricks/ComfyUI-LTXVideo
[ltx23]: https://docs.comfy.org/tutorials/video/ltx/ltx-2-3.md
[klein-bfl]: https://bfl.ai/blog/flux-3-image-klein
[klein-docs]: https://docs.comfy.org/tutorials/flux/flux-3-klein.md
[klein-lic]: https://huggingface.co/black-forest-labs/flux-3-image-klein/blob/main/LICENSE.md
[bfl-flux3]: https://bfl.ai/blog/flux-3-video
[qwen21]: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1.md
[qwen21-lic]: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
[qwen2511]: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
[qwen-layered]: https://docs.comfy.org/tutorials/image/qwen/qwen-image-layered.md
[multiangle]: https://huggingface.co/fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
[instantx]: https://huggingface.co/InstantX/Qwen-Image-ControlNet-Inpainting
[krea2]: https://docs.comfy.org/tutorials/image/krea/krea-2.md
[krea-lic]: https://www.krea.ai/krea-2-licensing
[ming]: https://huggingface.co/Comfy-Org/Ming-Image
[ideogram4]: https://huggingface.co/Comfy-Org/Ideogram-4
[zimage]: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
[flux2]: https://blog.comfy.org/p/flux2-state-of-the-art-visual-intelligence
[wan-hf]: https://huggingface.co/api/models?author=Wan-AI
[bernini]: https://docs.comfy.org/tutorials/video/bytedance/bernini-r.md
[scail2]: https://docs.comfy.org/tutorials/video/zai/scail2.md
[wan-animate2]: https://blog.comfy.org/p/wan-animate-2-is-now-available-in
[wan-animate]: https://docs.comfy.org/tutorials/video/wan/wan2-2-animate.md
[vace]: https://docs.comfy.org/tutorials/video/wan/vace
[void]: https://huggingface.co/netflix/void-model
[fun-camera]: https://docs.comfy.org/tutorials/video/wan/wan2-2-fun-camera
[recam]: https://huggingface.co/KwaiVGI/ReCamMaster-Wan2.1
[infinitetalk]: https://docs.comfy.org/tutorials/video/wan/wan-infinitetalk.md
[latentsync]: https://huggingface.co/ByteDance/LatentSync-1.6
[seedvr2]: https://docs.comfy.org/tutorials/utility/seedvr2.md
[flashvsr]: https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1
[rife]: https://docs.comfy.org/tutorials/utility/frame-interpolation
[sam3]: https://docs.comfy.org/tutorials/utility/video-segment-sam3
[birefnet]: https://docs.comfy.org/tutorials/utility/remove-background-birefnet
[ai-toolkit]: https://github.com/ostris/ai-toolkit
[cloud-import]: https://docs.comfy.org/cloud/import-models.md
[cloud-nodes]: https://comfy.org/cloud/supported-nodes.md
[catalog]: https://comfy.org/p/supported-models/llms.txt
[contest]: https://blog.comfy.org/p/higgsfield-promised-to-open-source
[drama3]: https://huggingface.co/fishaudio/drama-3
[chatterbox]: https://huggingface.co/ResembleAI/chatterbox
[voxcpm2]: https://huggingface.co/openbmb/VoxCPM2
[qwen3tts]: https://github.com/QwenLM/Qwen3-TTS
[indextts]: https://huggingface.co/IndexTeam/IndexTTS-2.5
[music3]: https://huggingface.co/MiniMaxAI/MiniMax-Music3
[acestep]: https://github.com/ace-step/ACE-Step-1.5
[sa3]: https://stability.ai/news-updates/meet-stable-audio-3-the-model-family-built-for-artistic-experimentation-with-open-weight-models
[foley]: https://github.com/Tencent-Hunyuan/HunyuanVideo-Foley
[trellis2]: https://github.com/microsoft/TRELLIS.2
[hunyuan3d]: https://huggingface.co/tencent/Hunyuan3D-2.1
[hyworld]: https://github.com/Tencent-Hunyuan/HY-World-2.0
[matrixgame]: https://huggingface.co/Skywork/Matrix-Game-4.0
[kimi]: https://huggingface.co/moonshotai/Kimi-K3
[mimo]: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
[glm]: https://huggingface.co/zai-org/GLM-5.3
[deepseek]: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
[qwen38]: https://huggingface.co/Qwen/Qwen3.8-27B
[flash-next]: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
[qwen3vl]: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
[gemma4]: https://docs.comfy.org/tutorials/llm/gemma4/gemma4
[hf-cinema]: https://higgsfield.ai/creator-hub/help-center/tools/how-do-i-use-cinema-studio
[hf-3dj]: https://higgsfield.ai/blog/higgsfield-3d-jutsu
[hf-sora]: https://higgsfield.ai/blog/sora-api-migration-guide
[hf-kling]: https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-kling
[hf-pricing]: https://higgsfield.ai/pricing
[hf-veo]: https://higgsfield.ai/veo3.1
[hf-wan3]: https://higgsfield.ai/wan-3-0
[hf-omni]: https://higgsfield.ai/gemini-omni-flash
[hf-flux3]: https://higgsfield.ai/blog/flux-3-higgsfield
[hf-changelog]: https://higgsfield.ai/creator-hub/changelog
[hf-api]: https://higgsfield.ai/higgsfield-api
[hf-h3]: https://higgsfield.ai/blog/minimax-h3-higgsfield
[hf-swap]: https://higgsfield.ai/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide
[hf-wan-animate]: https://higgsfield.ai/wan-animate-ai-video
[hf-lipsync]: https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios
[hf-games]: https://higgsfield.ai/blog/higgsfield-ai-games
[hf-games2]: https://higgsfield.ai/blog/higgsfield-mcp-gpt6-astra-games-2
[hf-super]: https://higgsfield.ai/creator-hub/help-center/tools/how-do-i-use-supercomputer
[hf-dop]: https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-dop
[hf-genjutsu]: https://higgsfield.ai/blog/higgsfield-genjutsu
[hf-soul]: https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images
[hf-popcorn]: https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-popcorn
[hf-relight]: https://higgsfield.ai/blog/video-relight-color-palette-higgsfield
[hf-scoring]: https://higgsfield.ai/blog/content-scoring-higgsfield
[hf-gpt25]: https://higgsfield.ai/blog/gpt-image-2-5-higgsfield
[hf-layers]: https://higgsfield.ai/higgsfield-layers
[hf-recraft]: https://higgsfield.ai/blog/recraft-v4-higgsfield
[hf-ideogram]: https://higgsfield.ai/ideogram-4-5-intro
[hf-upscale]: https://higgsfield.ai/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do
[hf-audio]: https://higgsfield.ai/blog/higgsfield-audio
[hf-models]: https://higgsfield.ai/creator-hub/help-center/ai-models/which-ai-model-should-i-use
[hf-blender]: https://higgsfield.ai/blog/higgsfield-blender-plugin
