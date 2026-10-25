# Models in ComfyField: strengths, weaknesses and why each runs where it does

Compiled 2026-10-22 from the research notes listed in [Sources](#sources) and from the code (`src/lib/tools.js`, `src/lib/catalog.js`, `src/lib/formats/`, `src/lib/recipes.js`, `shared/modelFiles.js`, `server/core.js`). It merges what the notes found; it adds no new research.

**Read this first**

- **Nothing here has run on a GPU yet.** Every graph check is static (schemas against ComfyUI v0.41.1, commit `45bf90d1`). Speed, VRAM and quality figures marked *(est.)* are estimates in the notes; *(unverified)* means the notes could not confirm it.
- **AA** = Artificial Analysis arena Elo. LMArena returned 403 on every fetch, so no LMArena rank is verified.
- **Cloud** = every file and node the graph needs is on Comfy Cloud. **Pod** = at least one file is not, so the run needs a rented GPU (Session).

## Contents

1. [How models were picked](#1-how-models-were-picked)
2. [Map at a glance](#2-map-at-a-glance)
3. [Image models](#3-image-models)
4. [Video generation models](#4-video-generation-models)
5. [Video editing models](#5-video-editing-models)
6. [Effect LoRAs and speed LoRAs](#6-effect-loras-and-speed-loras)
7. [Audio models](#7-audio-models)
8. [Talking heads and lipsync](#8-talking-heads-and-lipsync)
9. [Enhance: upscale, interpolate, matte](#9-enhance-upscale-interpolate-matte)
10. [3D](#10-3d)
11. [Language models (writer, planner, judge)](#11-language-models)
12. [Closed and API models still in the app](#12-closed-and-api-models-still-in-the-app)
13. [Models considered and not used](#13-models-considered-and-not-used)
14. [Gaps: mappings with no written reason, and mismatches](#14-gaps-and-mismatches)
15. [Open questions to settle with live runs](#15-open-questions)
16. [Sources](#sources)

---

## 1. How models were picked

These rules decide most mappings. Later sections refer back to them.

1. **Quality first, licence later.** The lineup (2026-10-16) began with "licences, not quality, decide most picks" and chose commercially safe defaults. On 2026-10-17 the project reversed that: licences are recorded but reviewed after the 10/30 submission. This one decision explains why Qwen-Image 2.1 (non-commercial) replaced Qwen-Image-Edit 2511 (Apache) for most image edits.
2. **Open weights only.** The "Open Weights Only" prize bars partner nodes and APIs. The paid MiniMax partner node (`h3_i2v`) was removed in PR #123, and `graph-check` now fails on any partner node. Closed models (Wan 3.0, FLUX 3 Video, Qwen-Image 3.0, Veo, Seedance, Kling) stay out of the open lineup even when they rank higher.
3. **Newest generation.** Target the newest open releases (FLUX 3 Klein, MiniMax H3, LTX-2.5, Qwen-Image 2.1) over 2025 models (FLUX.1, Wan 2.1, LTX Video 2B).
4. **The FLUX 3 bonus.** FLUX 3 Image Klein is the only open-weight FLUX 3 model, so it is the only way to meet "FLUX3 must be the core model". Whether it counts is *(unverified)*.
5. **Cloud when possible, Pod when needed.** A run goes to Comfy Cloud when Cloud has every file, otherwise to a Pod. Ties between near-equal models break toward the one on Cloud. A clear quality gap (for example 75 Elo) overrides that.
6. **One graph per job, from the official template.** Graphs come from Comfy's own templates, flattened to API format, with core nodes where possible. A custom node pack is used only when core cannot do the job (InfiniteTalk length looping, Foley, Chatterbox, Drama 3).
7. **Copy Higgsfield's structure.** Each Higgsfield feature gets the nearest open model. Where Higgsfield names a closed model (Kling Motion Control, Seedance Cinema, Genjutsu), the open substitute is chosen on the same job.

---

## 2. Map at a glance

| Job | Model | Runs on | Why, in one line |
|---|---|---|---|
| Text to image, looks, storyboards, moodboards, Klein edits, character scenes | FLUX 3 Image Klein | Pod | Newest open FLUX 3; only route to the FLUX 3 bonus; up to 10 references |
| Instruction edits, mockups, try-on, logo, banners, thumbnails, outpaint, restore | Qwen-Image 2.1 Turbo | Pod | #1 open on AA text-to-image (1040) and editing (1083 / Turbo 1065) |
| Camera angles, shot grids, relight | Qwen-Image-Edit 2511 + LoRAs | Cloud | Needs the Multiple-Angles LoRA (96 poses) or built-in lighting that 2.1 lacks |
| Layer split | Qwen-Image-Layered | Cloud | Only native, Apache layered model |
| Lifelike people (`ai-human`) | Krea 2 Turbo | Cloud | Krea's own advice: train on Raw, run on Turbo |
| Picker options | Z-Image Turbo, HiDream-O1 | Cloud | Fast Apache fallback; MIT model with readable text |
| Camera moves, body-move effects, product ads, cinema default, extend, first/last frame | MiniMax H3 (open) | Cloud (FreeVideo on a 96 GB Pod) | #1 open on every AA video board, #1 overall on image-to-video, native sound |
| Most prompt-only effects, multi-shot, image-to-video chains | LTX-2.5 | Cloud | Fast, with sound; the only open model with native multi-shot |
| Effect LoRAs, cinema option | Wan 2.2 | Pod (LoRAs) / Cloud | Apache; the only effect-LoRA ecosystem that met the bar |
| Restyle, relight, swap, grade, mixed media, video edit | Bernini-R | Cloud | One Apache model for v2v and reference edits, strongest published open edit scores |
| Video face swap | Bernini-R + BFS head-swap LoRA | Pod | Purpose-trained head swap; LoRA not on Cloud |
| Motion transfer | Wan Animate 2 | Cloud | Newest Wan character model, no pose preprocessing |
| Character swap in a filmed scene | SCAIL-2 | Cloud | MIT, native, with SAM 3.1 tracking |
| Erase objects from video | VOID + SAM 3.1 | Cloud | Removes objects together with their shadows |
| Reshoot from a new camera path | ReCamMaster | Cloud | Only commercially licensed open re-render model |
| Speech, voice clone, voice change | Chatterbox Multilingual / VC | Cloud | TTS that runs on Cloud, 23 languages |
| Top-quality speech (picker) | Fish Audio Drama 3 | Pod | #1 open TTS (AA 1244) |
| Voice design (picker) | Qwen3-TTS | Pod | Clones from 3 s, plain-language emotion |
| Music | MiniMax Music 3 | Cloud | Top open model on AA Music Arena |
| Sound effects | Stable Audio 3 Medium | Cloud | Native on Cloud from day 0 |
| Add sound to a video | HunyuanVideo-Foley | Pod | Best published video-to-audio numbers |
| Talking head, lipsync | InfiniteTalk | Pod | Any length, Apache |
| Upscale, unblur | SeedVR2 3B / RealESRGAN | Cloud | Faithful one-step restore; ESRGAN for the light "faithful" mode |
| Slow motion | RIFE 4.26 | Cloud | MIT, core, tiny |
| Background removal | BiRefNet (+ SAM 3.1 for video) | Cloud | Template model, hair-level edges |
| Photo, text or character to 3D, turntable | TRELLIS.2 (+ Klein) | Pod | Image to PBR-textured GLB, native core |
| Prompt writing (Writer steps) | Gemini (`gemini-flash-latest`) | Google | Only working prompt writer today |

---

## 3. Image models

### FLUX 3 Image Klein (Black Forest Labs)

5.6B DiT, released 2026-10-15. Qwen3-VL-4B text encoder, optional Qwen3.5-9B prompt upsampler. 11.1 GB bf16 / 5.8 GB int8; the graph loads 27 GB. 8 GB VRAM at int8, 24 GB+ at bf16. FLUX Kommunity License (commercial output under $5M revenue).

**Strengths**
- The only open FLUX 3 model; FLUX 3 Video, Image and Dev are API-only or unreleased.
- Native 4K output, editing, up to 10 references, bounding-box placement. References of any size each get their own position index.
- Fast: 16 steps at 1024² in about 4 s on an RTX 5090 or RTX PRO 6000.
- BFL's own eval puts it #1 among open models (+91 Elo over FLUX.2 klein 9B for T2I, +70 for edits). *Vendor claim; no public board ranks it.*
- Core nodes only (ComfyUI v0.41.0+).

**Weaknesses**
- **Not on Comfy Cloud.** The DiT and upsampler are missing, so every Klein graph needs a Pod. The lineup assumed it was on Cloud; the engine notes found it is not.
- BFL says not to run it without the prompt upsampler: short prompts give generic output. The upsampler adds 6.7 GB and a few seconds per new prompt.
- Official repos are gated; the Pod pulls sha256-matched mirrors.
- ComfyUI's edit template has a double-escaped system prompt, and `TextGenerate` omits BFL's image-to-image scaffold; the graphs add it themselves.
- Only two experimental LoRAs exist.

**Where it runs:** `flux3_klein_t2i` (picker), `flux_look` / `flux_look_ref` (25 looks, `brand-colors`, `slide-visuals`, `drawing`, `sketch`, `wallpaper`, `animal`), `klein_edit` / `klein_edit_canvas` (restyle, plush-toy, cartoon-me, anime-me, sticker, profile picture and others), `klein_character`, `klein_character_swap` (Character swap tool), `klein_headshot`, `klein_retouch`, `klein_moodboard`, `flux_character_set` (`influencer-post`), `storyboard` / `storyboard_ref`, and the image stage of `klein_ltx`, `klein_h3`, `h3_loop`, `flux_trellis2`, `trellis2_character`.

**Why there:** default text-to-image pick: newest, small at int8, native, and the most plausible route to the FLUX 3 bonus. Distilled over Base because BFL recommends it for self-hosting and it is about 6x faster. The upsampler stays on, and must see the references for edits. *The notes do not say why the 25 looks use Klein instead of Qwen 2.1.*

### Qwen-Image 2.1 / 2.1 Turbo (Alibaba Qwen)

About 7B DiT, Qwen3-VL-8B encoder, 64-channel RGBA VAE. Turbo runs 8 steps. Graph loads 32 GB; about 24 GB VRAM bf16 *(est.)*. **Qwen Research License: non-commercial only** (every earlier Qwen-Image release was Apache).

**Strengths**
- **#1 open model on AA text-to-image (1040, #21 overall) and AA image editing (Base 1083, Turbo 1065).**
- One model for generation and edits; native 2K; strong typography; native transparent (RGBA) output.
- Up to 10 references, with mask or painted-mark targeting. Its edit template is the most-used image template (19,517 runs).
- Turbo is only 18 Elo below Base at 8 steps instead of 25–50; about 3–5 s per 1024² image *(est.)*.

**Weaknesses**
- **Not on Comfy Cloud** (DiT and the 2.1 VAE missing; the 1.x VAE cannot substitute). 28 of 32 Qwen formats need a Pod.
- Non-commercial licence conflicts with Comfy Cloud's "every model is cleared for commercial use" claim; unresolved.
- Sizes must be multiples of 32; prompt adherence drops well above 2K. The official prompt enhancer can take minutes, so it is off.
- A distilled model may vary less between seeds *(est.)*.

**Where it runs:** `qwen_image21_t2i` (picker; `banner`, `thumbnail`, `design-graphic`, looks magazine-90s, cctv, comic-book), `qwen_image_ref`, `qwen_image_logo`, `qwen_edit` (erase, replace, sketch-to-image, product-shot, signboard, meme, hairstyle, age-progression, remove-text, style-snap, ai-stylist), `qwen_edit_try_on`, `qwen_edit_mockup`, `qwen_edit_outpaint` (`expand`), `qwen_edit_style_ref`, `qwen_edit_place_product`, `qwen_edit_variants`, `qwen_character_sheet`, `qwen_zoom_grid`, `qwen_restore` (+ SeedVR2), `birefnet_qwen_background`, and the image stage of `qwen_ltx`, `qwen_h3`, `qwen_multi_h3`, `qwen_try_on_h3`, `qwen_mockup_ltx`.

**Why there:** the rule is "Qwen-Image 2.1 wherever no 2511-only LoRA is needed". The gap to 2511 is 75 Elo, "not close", so the Cloud tie-break does not apply. Character sheet uses 2.1 because of that gap, native 2K and Qwen's own three-view showcase. Turbo over Base because it loses only 18 Elo. The logo uses 2.1's own alpha instead of a cut-out model. It carries the "Top" badge in `tools.js`.

### Qwen-Image-Edit 2511 (Alibaba Qwen)

20B MMDiT with Qwen2.5-VL-7B. int8 file 20.5 GB; the graph loads about 31 GB, fits the 24 GB class. Apache-2.0.

**Strengths**
- Best Apache model on AA editing (990–991). Better single- and multi-person identity than earlier edits.
- **Fully on Comfy Cloud**, including the Lightning (4-step) and Multiple-Angles LoRAs.
- Built-in relight ("realistic lighting control out of the box"). Multiple-Angles gives 96 poses (8 azimuths × 4 elevations × 3 distances). Big LoRA ecosystem.

**Weaknesses**
- 75 Elo below Qwen 2.1 Turbo. About 1 MP canvas, 3 references only. 40 steps at cfg 4 without Lightning.
- Only 3 distances, so close-ups and over-the-shoulder shots are approximations.
- Relight quality against 2.1 is untested.

**Where it runs:** `qwen_multiangle` (`angles`), `qwen_shots_grid` (`shots`), `qwen2511_relight` (`relight-photo`), `qwen2511_edit` (picker), `qwen2511_ltx` (Cloud-only chain).

**Why there:** used only where a 2511 LoRA gives something 2.1 lacks (precise camera control) or where the two are close and Cloud breaks the tie (relight). It was the lineup's original commercial default for editing, before the licence review was deferred.

### Qwen-Image-Layered (Alibaba Qwen)

fp8 20.5 GB, 640 px recommended. Apache-2.0.

- **Strengths:** splits an image into any number of RGBA layers; the only native, Apache layered model; on Cloud.
- **Weaknesses:** the prompt cannot target single layers; layer order is undocumented; no auto-caption in ComfyUI; the template uses fewer steps (20, cfg 2.5) than upstream (50, cfg 4).
- **Where / why:** `qwen_image_layered` → `layers`. The lineup's default for layered decomposition.

### Krea 2 Turbo (Krea)

12.8B, fp8 13 GB. Krea 2 Community License (commercial only under $1M revenue; content filter mandatory).

- **Strengths:** on Cloud; 1K–2K output in 8 steps, CFG off; 9 official style LoRAs; popular template (9,388 runs).
- **Weaknesses:** tightest commercial cap in the lineup; no editing; which AA entry matches the open weights is *(unverified)*. Raw needs 52 steps with CFG (about 13x the work) and has no template.
- **Where / why:** `krea2_t2i` → `ai-human`. Turbo over Raw on Krea's own advice ("train on Raw, run on Turbo"); no source says Raw draws people more lifelike. It shares the Qwen3-VL-4B encoder with Klein, so one download serves both. *No note says why Krea was chosen for `ai-human` over Klein or Z-Image.*

### Z-Image Turbo (Alibaba Tongyi-MAI)

6B, 8-step distilled. About 21 GB download, fits 16 GB. Apache-2.0.

- **Strengths:** fast, fully on Cloud, very popular (14,611 template runs), Fun ControlNet Union, a good path to prove LoRA training.
- **Weaknesses:** lower rank (AA 935); Z-Image-Edit is not released; the ControlNet mask path is experimental.
- **Where / why:** `z_image` in the picker ("Instant lifelike portraits"). The lineup's fast Apache fallback.

### HiDream-O1-Image (HiDream)

8B pixel-space transformer, no VAE, up to 2048². bf16 16.4 GB. MIT.

- **Strengths:** AA text-to-image 973, editing 956; readable text; identity and layout conditioning; on Cloud.
- **Weaknesses:** trained near 4 MP, and lower sizes "regress noticeably"; slow (40 steps × 2 for CFG, tens of seconds to minutes per image on 24 GB *(est.)*).
- **Where / why:** `hidream` in the picker, fixed to 4 MP sizes. The MIT alternative for organisations above Klein's $5M cap. Full over Dev because Dev scores 808 against 973.

---

## 4. Video generation models

### MiniMax H3, open weights (MiniMax)

33.1B, CFG-distilled, weights open since 2026-08-03. Pruned int8 file 21 GB; graph about 42–44 GB. 32 GB class (24 GB possible with pruned int8). MiniMax H3 Community License.

**Strengths**
- **AA image-to-video #1 overall (1141); text-to-video 1159 (rank 2–6; #1 is closed Wan 3.0 at 1174); video editing #4 and the only open entry.** (The edit score comes from MiniMax's hosted pipeline, which has a stage the open weights lack.)
- Native stereo sound. 24 fps, 4–15 s, 768p.
- First frame, first + last frame, continuation, and Ref2VA with up to 9 images, 3 videos and 3 audio clips. Fun ControlNet Union template.
- Native in ComfyUI from day 0, every file on Cloud, most-used open video template (18,776 runs). An 8-step turbo LoRA (Apache).

**Weaknesses**
- Licence excludes the US, EU, UK and South Korea for local use; Comfy Cloud generations include commercial rights; a US local licence is resold by Comfy from $5,000/month. "MiniMax H3" must show in the UI of commercial products.
- Open model is 768p only; 2K and "H3 Max" are hosted only.
- At 8 steps, sound is the weakest part. 4-step turbo "can barely apply references" (pose and face drift), so reference graphs run 20 steps.
- An off-aspect first frame is stretched. Clips under about 124 frames (5 s) are outside its training range.
- Multi-shot and Ref2VA lipsync quality are *(unverified)*.

**Where it runs**
- `h3_open_t2v` / `h3_open_i2v`: picker, every camera move (about 96 `cam-*`), body-move effects (action-run, boxing, catwalk and others), `human-video`, `animation`, `anime-video`, `product-spin`, `car-video`, `animal-video`, `nature-video`, `sketch-to-video`, `cloud-surfing`, and the default target of `cinema-shot`.
- `h3_flf2v` (`first-last-frame`, `transition`, `cam-roll-transition`), `h3_extend` (`extend-video`), `h3_ref2v` (`brand-video`), `h3_product_ad` (12 product ads and bullet time), `h3_t2v` (`asmr-host`), `h3_i2v_audio` (`asmr-classic`, 12 steps), `h3_draw` (`draw-to-video`, Pod), `h3_loop`, `h3_truck_ad`, `h3_lora_i2v` (`frozen-in-motion`, Pod).
- Video stage of `klein_h3`, `qwen_h3`, `qwen_multi_h3`, `qwen_try_on_h3`.

**Why there:** the best open video quality, native, every file on Cloud, with sound. Body moves run on H3 rather than LTX because "body moves need believable mechanics". Product ads pass the product to H3 as a reference to keep it exact. Speech clips get 12 steps because "speech and timbre need 12+". First/last frame runs on H3 in the shipped graphs, although the lineup had named LTX-2.5 the default for that job.

### VDN-H3 via FreeVideo (OpenVDN / FlashML)

H3 distilled to 8 steps with linear attention. 52.7 GB download, about 89 GiB free disk on first install. H3 licence on the weights.

- **Strengths:** 1.6–60 s clips (over 15 s is experimental), chained continuation; 10 s at 1344×768 in 122 s on an RTX 5090.
- **Weaknesses:** Pod only; never run on this stack; release pace was 15 tags in 6 days; Ref2VA is experimental, no masks or patches.
- **Where / why:** `h3_freevideo_t2v` / `_i2v` / `_flf2v` replace the H3 catalog graphs and `h3_flf2v` on a 96 GB Pod, because it is faster and cheaper per video. Not used for reference, draw or other format graphs.

### LTX-2.5 (Lightricks)

22B audio-video DiT, released 2026-08-11. Distilled int8 21.5 GB; graph about 40 GB. 32 GB class. LTX-2.x Community License (free under $10M revenue).

**Strengths**
- Fast: "well under a minute" per clip on an RTX PRO 6000 or H100. Two-stage recipe, 8 + 3 steps, cfg 1.
- Native multi-shot (the only open model with it), first/last frame and joint sound.
- Large IC-LoRA toolkit (clean plate, alpha matte, day-to-night, restore, HDR).
- Every core file on Cloud.

**Weaknesses**
- Ranks far below H3: AA text-to-video about 950, image-to-video #19 (985).
- Licence bars use in a product that "directly competes" with Lightricks without a separate licence; needs a legal read.
- The IC-LoRAs are gated with no mirror, so the Pod cannot fetch them.
- The multi-shot guide says "prefer 2–4 shots"; the format offers 6. Image-to-video prefers one continuous take.

**Where it runs:** `ltx25_t2v` / `ltx25_i2v` (picker, about 87 prompt-only effects, the 45 `effect-*` chains' default, `cinema-shot` option), `ltx25_multishot` (`multi-shot`, with the Gemma 4 E2B prompt enhancer), and the video stage of `klein_ltx`, `qwen_ltx`, `qwen_mockup_ltx`, `qwen2511_ltx`.

**Why there:** multi-shot because it is the only open model that has it. The `cinema-shot` option label is "Fastest drafts". The multi-shot graph adds a prompt enhancer because a shot list breaks LTX's "one chronological paragraph" rule. *The notes give no written reason why most effects run on LTX-2.5 instead of H3* (see §14).

### Wan 2.2 (Alibaba Wan)

A14B text-to-video and image-to-video, TI2V-5B. Graph about 38 GB, 24 GB class. Apache-2.0.

- **Strengths:** clean licence; native and on Cloud; first/last frame; LightX2V 4-step path (about 71 s per clip on a 24 GB card at 640²); the only effect-LoRA ecosystem that met the quality bar. Bernini-R, Wan Animate 2 and SCAIL-2 are all built on Wan.
- **Weaknesses:** absent from current AA boards; 16 fps and an 81-frame training length. Every Wan after 2.2 is closed.
- **Where / why:** `wan22_t2v` / `wan22_i2v` (picker; `cinema-shot` option labelled "Runs on smaller GPUs"), `wan22_lora_i2v` (10 LoRA effects, Pod). Kept as the clean-licence fallback and for its LoRAs.

### LTX Video 2B v0.9.5 (legacy)

2025 model, no sound, 30 steps. Still the **default** in the Create video picker (`comfy-ltx`, `video_ltx`) and `ltx_i2v`, because the picker takes the first catalog row. Some formats still label it "LTX-2.5". The notes recommend moving these to `ltx25_i2v`.

---

## 5. Video editing models

### Bernini-R (ByteDance)

Renderer fine-tuned from Wan2.2-T2V-A14B. Two fp8 experts of 15.6 GB; about 19 GB peak at 480p. Apache-2.0.

- **Strengths:** vendor scores EditVerse 7.99, OpenVE 3.78; "first tier" of closed editors in the authors' blind arena *(vendor claim)*. One model for v2v, multi-video, reference v2v and reference-to-video, up to 8 references (about 5 reliable). Core node since v0.25.0, every file on Cloud, 6-step turbo path.
- **Weaknesses:** not on AA; 81 frames max (3.4 s at 24 fps), 848×480 default; no mask input; partial strength needs an `ImageBlend` workaround.
- **Where:** `bernini_swap` / `_noref` (`swap-element`), `bernini_restyle`, `bernini_relight`, `bernini_grade` (`color-grade`, Change color palette tool), `bernini_mixed` (33 `mm-*` looks), `bernini_edit`, `bernini_clone_edit`, `bernini_recreate_ad`, `video_bg_change`.
- **Why:** "native core node, on Cloud, one model for v2v and rv2v edits, Apache-2.0, strongest published open edit scores". It is the open answer to Higgsfield's Genjutsu, and restyles need no LoRA.

### Bernini-R + BFS head-swap LoRA (Alissonerdx)

- **Strengths:** purpose-trained head swap, core nodes, reuses the Bernini files.
- **Weaknesses:** not on Cloud; trained at 73 frames and 640 px; needs a head-and-shoulders crop, 40 steps, CFG 4; not measured against Wan Animate.
- **Where / why:** `bernini_headswap` → `face-swap-video` (Pod). Recommended over Wan 2.2 Animate Mix.

### Wan Animate 2 (Alibaba Wan)

14B, int8 16.7 GB, about 24 GB VRAM. Apache-2.0.

- **Strengths:** no pose preprocessing; 10 steps, no CFG; native and on Cloud.
- **Weaknesses:** no benchmark; no replace mode; 81-frame segments; the prompt must describe looks only, and the current `edit.js` prompt breaks that rule.
- **Where / why:** `wan_animate2` → `motion-transfer`. The newest Wan character model, kept as the open answer to Kling Motion Control.

### SCAIL-2 (Z.ai)

Wan2.1-14B int8, 28.6 GB graph. MIT.

- **Strengths:** native nodes with SAM 3.1 tracking, on Cloud, swaps a character inside the filmed scene.
- **Weaknesses:** no benchmark; keeps the filmed background, so background options need a second step; one segment only.
- **Where / why:** `scail2_character_swap` → `video-character-swap`. "MIT, native with SAM3 tracking". Open answer to Higgsfield Recast.

### VOID (Netflix)

CogVideoX-Fun 5B, two passes. Apache-2.0 (base terms not checked).

- **Strengths:** removes objects together with their shadows and physical effects; native template; on Cloud.
- **Weaknesses:** heavy (README says 40 GB+; ComfyField classes it 32 GB at 117 frames, untested); SAM 3.1 on text overlays is untested.
- **Where / why:** `void_inpaint` → `video-erase` and `video-remove-text`. The LTX-2.5 Clean-Plate LoRA was the planned fallback but it is gated, not on Cloud, and removes people and vehicles, not text.

### ReCamMaster (Kling)

Wan 2.1 T2V 1.3B, 10 GB download. Apache-2.0.

- **Strengths:** "only commercially licensed open re-render model"; ICCV'25 best-paper finalist.
- **Weaknesses:** about 832×480, 81 frames; needs WanVideoWrapper; portrait input untested.
- **Where / why:** `recammaster` → `reshoot`. Every alternative was non-commercial, too heavy (43–51 GB), needed 4D reconstruction, or copied a reference camera instead of a named path.

### MiniMax H3 Fun ControlNet Union 2.0 (alibaba-pai)

- **Strengths:** canny, depth, pose, scribble, layout and masked inpaint; 2.0 blends better than 1.0.
- **Weaknesses:** no arrow or trajectory input; 2.0 not on Cloud.
- **Where / why:** `h3_draw` → `draw-to-video` (Pod), as an inpaint lock outside the drawn arrows. Whether H3 reads arrows as motion is untested.

---

## 6. Effect LoRAs and speed LoRAs

**The bar:** a card with a trigger, sample clips that were watched, ungated weights and a sha256. Only 11 of about 150 effects passed; the rest stay prompt-only. No effect LoRA is on Cloud, so these 11 run on a Pod.

| LoRA | Base | Licence | Formats |
|---|---|---|---|
| Explosion Redmond | Wan 2.2 | CC0 | `building-explosion`, `car-explosion` |
| Spontaneous Combustion Redmond | Wan 2.2 | CC0 | `set-on-fire`, `burning-figure` |
| Disintegration Redmond | Wan 2.2 | CC0 | `turn-to-sand` |
| Disappearing Redmond | Wan 2.2 | CC0 | `vanish` |
| Thunder Hero Redmond | Wan 2.2 | CC0 | `lightning-eyes` |
| Skin Morph Redmond | Wan 2.2 | CC0 | `morph-skin` |
| Metalcification Redmond | Wan 2.2 | CC0 | `turn-to-metal` (card says T2V, samples are I2V) |
| Pupil Transition | Wan 2.2 (high-noise only) | Apache-2.0 | `eyes-in` |
| 360 Orbit (pablodawson) | H3 pruned int8 | H3 | `frozen-in-motion` |

**Why Wan 2.2 carries the effects:** it is the only base with a LoRA ecosystem that met the bar. **No LTX-2.5 effect LoRA passed:** the official ones are gated control tools, and the community ones were the wrong task or had no downloads. The large Remade-AI set targets Wan 2.1 and is untested on Wan 2.2's two experts.

**Speed LoRAs:** H3 turbo 8-step v1.0 in every first-frame graph (the 4-step 768p file is not on Cloud); LightX2V for Wan, Bernini, SCAIL-2 and Animate; Qwen-Edit 2511 Lightning in every 2511 graph. Newer Cloud LightX2V files have no traced Hugging Face source, so they are not used.

---

## 7. Audio models

### Chatterbox Multilingual and Chatterbox VC (Resemble AI)

0.5B, 3.2 GB download. MIT.

- **Strengths:** 23 languages; exaggeration and cfg sliders for emotion; zero-shot cloning; on Cloud through the Fill-ChatterBox pack with official templates. VC accepts a video file as input.
- **Weaknesses:** the pack loads **v2**, not the V3 the lineup named. Uses only the first 6–10 s of a voice sample. About 40 s per run, no long-text split. 24 kHz. No accent control (the accent comes from the sample). **Silent failure:** on an error it returns silence and ComfyUI reports success, so the app should treat audio under about 0.1 s as a failure. Language labels must match exactly. VC crops input to 27 s.
- **Where:** `chatterbox_tts` (`tts`), `chatterbox_clone` (`voice-clone`), `chatterbox_vc` (`voice-change`), and inside `infinitetalk_tts`.
- **Why:** the lineup's "text to speech on Comfy Cloud" pick. The clone graph uses the multilingual node so the preview sounds like the final `tts` and `talking-head` output. Seed-VC was rejected for voice change (GPL, archived), and RVC needs per-voice training.

### Fish Audio Drama 3 (Fish Audio)

35B MoE, 3B active; 42 GB in FP8. 24 GB VRAM plus about 48 GB system RAM. Fish Audio Community License (commercial under $500k revenue).

- **Strengths:** **AA 1244, #10 overall and #1 open.** 83 languages, inline tags, up to 16 speakers, "actor" direction, 2–4x real time on 24 GB.
- **Weaknesses:** not on Cloud. The pack is GPL-3.0 and five days old. Pod RAM per GPU class is unchecked. A take falls silent if the voice transcript misses the clip's last words. Without a voice it invents a new one per seed.
- **Where / why:** `drama3_tts` (picker row with the "Top" badge). Best TTS on quality. Uses Qwen3-ASR 0.6B for voice transcripts because it matched 1.7B at half the time.

### Qwen3-TTS (Alibaba Qwen)

1.7B / 0.6B, Base, CustomVoice and VoiceDesign. 5.2 GB. Apache-2.0.

- **Strengths:** low error rates (Seed-TTS WER en 1.24); 10 languages; plain-language emotion; clones from 3 s; official fine-tuning.
- **Weaknesses:** not on Cloud (Cloud's "Qwen-TTS" pack is a paid API wrapper). The pack has no licence file and pins a conflicting `onnxruntime`. The graph needs a voice; emotion works only on CustomVoice and VoiceDesign.
- **Where / why:** `qwen3_tts` (picker). Voice design and cloning alternative.

### MiniMax Music 3 (MiniMax)

8B + 0.6B + 2.4B stages, 14 GB; about 22 GB VRAM with offload. Community licence (free under $20M; "MiniMax-Music3" must show in the UI).

- **Strengths:** **top open model on AA Music Arena**; songs up to 5 min, 32 kHz stereo; native core nodes, every file on Cloud.
- **Weaknesses:** an empty lyrics field must become `[Instrumental]`; works best with a structured caption; no fine-tuning scripts.
- **Where / why:** `minimax_music3` → `music`. Best open music model. ACE-Step 1.5 XL was the alternative (MIT, the biggest LoRA set), but most of its genre LoRAs are niche, unlicensed or non-commercial.

### Stable Audio 3 Medium (Stability AI)

15 GB graph. Stability Community License (free under $1M).

- **Strengths:** native on day 0, every file on Cloud; length set by one value; AA instrumental 996.
- **Weaknesses:** no vocals; the template's prompt rewrite (Qwen3.5 2B) may drop "no music" wording; no SFX adapters exist.
- **Where / why:** `stable_audio3` → `sound-effect` (2, 5 or 10 s). The sound-effect pick that runs on Cloud.

### HunyuanVideo-Foley XXL (Tencent)

15 GB graph, 20 GB VRAM (12 with offload). 48 kHz stereo. Tencent licence excludes the EU, UK and South Korea.

- **Strengths:** best published video-to-audio numbers; beats MMAudio.
- **Weaknesses:** no core node, no template, nothing on Cloud. Files must exist before ComfyUI loads the pack. 15 s cap, prompt cut to 77 tokens.
- **Where / why:** `hunyuan_foley` → `add-sound` (Pod). Quality pick. The chosen pack never self-downloads, so files can be sha-pinned; the other pack downloads from inside its node and was rejected. MMAudio is non-commercial and weaker.

---

## 8. Talking heads and lipsync

### InfiniteTalk (MeiGen), on Wan 2.1 I2V 14B

35.6 GB download, fits 24 GB with block swap *(est.)*. Apache-2.0.

- **Strengths:** talking heads and lipsync of any length, multi-speaker. The WanVideoWrapper sampler loops windows until the audio ends, so one graph can run Chatterbox then InfiniteTalk with no app-side length logic.
- **Weaknesses:** **Pod only** — Cloud stores the wav2vec2 file in the wrong folder (the lineup had said it runs on Cloud). About 480p. 30 s cap so a run fits the Pod's 30-minute job limit. Music under the voice moves the lips less well *(est.)*. Video-to-video at 24–30 fps is untested (trained at 25).
- **Where:** `infinitetalk` (`talking-head` with audio), `infinitetalk_tts` (`talking-head` with a script), `infinitetalk_v2v` (`lipsync`).
- **Why:** the lineup's default lipsync pick. WanVideoWrapper over core because the core node makes one 3.2 s window and no core node can read audio length. fp8 + block swap over the template's fp16 so it fits 24 GB.
- **Not used:** Wan 2.2 S2V (16 fps, official code needs 80 GB), LTX-2.3 IA2V, HuMo, LatentSync (mouth only, 512 px), and non-commercial or closed avatars.

---

## 9. Enhance: upscale, interpolate, matte

| Model | Strengths | Weaknesses | Where | Why |
|---|---|---|---|---|
| **SeedVR2 3B INT8** (ByteDance, Apache) | One-step, prompt-free, "stays faithful"; native, on Cloud; 4 GB | All-black output with FlashAttention; a 5 s 4K clip can hold about 50 GB system RAM *(est.)*; colour drift; page toggles (face, noise, flicker) have no graph input | `seedvr2_image` (`unblur`), `image_upscale` (Enhance mode, Upscale page), `seedvr2_video` (`video-upscale`), `qwen_restore` (7B) | Faithful default; LoRA redraws can change faces, so they stay opt-in |
| **RealESRGAN x4plus** (BSD-3) | Tiny (0.07 GB), fast, on Cloud | Always 4x, so the graph resizes down | `image_upscale_esrgan` ("Faithful" mode) | "RealESRGAN changes nothing, SeedVR2 adds detail" |
| **RIFE 4.26** (MIT) | Newest Practical-RIFE, 0.02 GB, native | Authors recommend 4.25 for most scenes; holds all frames in RAM (8x of 5 s 1080p ≈ 24 GB); drops audio | `rife_interpolate` (`slow-motion`, 2/4/8x) | The format names 4.26; MIT, core, Cloud |
| **BiRefNet** (MIT) | Hair-level edges, 0.44 GB, no pack needed | Pod lacks its folder and loader entry; newer HR variants not repacked | `birefnet_image` (`image-bg-remove`), video matte graphs, inside every TRELLIS.2 graph | The template's own model; TRELLIS.2 upstream uses it too |
| **SAM 3.1** (Meta, SAM License) | Tracks the subject across frames; on Cloud | No official template; GrowMask on CPU takes about 1 min per 121 frames; core `SaveVideo` cannot keep alpha | `birefnet_video_matte*`, `video_bg_change`, `void_inpaint`, `scail2_character_swap` | BiRefNet frame 1 seeds SAM tracking, which removes flicker and stray objects *(own design, untested)* |
| **GLSL shader** (core, no model) | No model download | EGL may be missing on RunPod; Cloud support *(unverified)* | `image_grade` (`photo-grade`) | Seven hand-written looks |

---

## 10. 3D

### TRELLIS.2-4B (Microsoft)

int8 5.3 GB, 9 GB graph. MIT (DINOv3 encoder under Meta's licence). Upstream needs 24 GB+.

- **Strengths:** image to PBR-textured GLB (base colour, ORM, normal) at 512³–1536³; about 3–60 s on an H100; native core.
- **Weaknesses:** **Pod only** — Cloud has the nodes but not the files. **Blockers before it can ship:** the Comfy API proxy drops the `3d` output key, the Pod lacks a `background_removal` folder, and the loader list lacks `LoadBackgroundRemovalModel`. Takes no text. No style LoRAs. `.glb` MIME type is generic, so the kind must come from the file name.
- **Where:** `trellis2_image` (`image-to-3d`), `flux_trellis2` (`text-to-3d`: Klein then TRELLIS.2), `trellis2_character` (`character-to-3d`: Klein edit to a full-body figure first), `trellis2_turntable` (`turntable`, core `RenderMesh`, no Blender).
- **Why:** the lineup's photo-to-3D pick; "open image model then TRELLIS.2" beats the weaker TRELLIS-text v1 for text-to-3D. For style, set it on the input image (for example a Klein "Low poly" look) rather than a LoRA.
- **Not used:** Pixal3D (no files on Cloud either), Hunyuan3D 2.1 (territory limits, 29 GB with texture), TripoSplat (splats, an alternative). HY-World 2.0 for `world-3d` was skipped: about 80B + 17B, multi-GPU, no real ComfyUI path.

---

## 11. Language models

| Model | Role | Status |
|---|---|---|
| **Gemini `gemini-flash-latest`** (Google, closed) | Every Writer step and "write prompts with AI" | **The only working prompt writer**; needs a Google key. The Router writer is a stub that returns 501 |
| **Qwen3.8-27B** (Apache, core node) | The lineup's in-ComfyUI single-GPU pick for scripts and planning (AA 34, best small model) | Named by hidden formats only (explainer, faceless, story, script-to-video and others). Cloud availability *(unverified)* |
| **Kimi K3** (via OpenRouter partner node) | Planning, scripts, code (AA 44, top-3 open) | Named by hidden formats only. Partner-node billing may conflict with the open-weights rule |
| **Gemma 4** (Apache, core node) | E4B as the Cloud dub translator; E2B as LTX-2.5's multi-shot prompt enhancer | E2B is used inside `ltx25_multishot`; dub is hidden |
| **Qwen3-VL 8B** (Apache, on Cloud) | Judge and caption | In `MODEL_FILES`; no shipped format uses it as a judge yet |
| **Qwen3.5-9B** (Apache) | FLUX 3 Klein prompt upsampler | Inside every Klein graph |
| **Qwen3.5 2B** | Stable Audio 3 prompt rewrite | Inside `stable_audio3` |
| **Qwen3-ASR 0.6B** | Voice transcripts | Inside `drama3_tts` |

---

## 12. Closed and API models still in the app

| Provider | Model | Where |
|---|---|---|
| fal | Nano Banana 2 edit | **Relight tool**, **Face swap tool**, `nine-shots` |
| fal | Flux Pro v1 Fill | `inpaint` |
| fal | Seedance 2.0 Fast, Kling 3 Std | melt, zero-gravity, claymation, city-giant recipes |
| fal | Qwen Edit 2511 Multiple-Angles, FASHN v1.6, Bria, SeedVR | `new-angle`, `outfit-swap`, `remove-background`, `upscale` recipes |
| fal | Seedance 1.5 Pro | Option on the 45 `effect-*` chains |
| fal | Nano Banana Pro, GPT Image 2, Flux 2 Pro, Seedance 2.5, Kling 3 Pro, hosted H3, Wan 3.0, Music 3 | Create pickers |
| Comfy Router | Flux 2 Pro, Seedance 2.5 | Create pickers (shown only when Router is connected), option on the 45 effect chains |
| Google | Nano Banana Pro / 2, Veo 3.1 / Fast / Lite, Gemini voice (**Audio default**), Gemini writer | Create pickers, Audio, all Writer steps |
| ElevenLabs | Voice, sound effects | Audio picker |

These are the teammate's fal recipes and the bring-your-own-key pickers. Open alternatives exist for most of them (see §14).

---

## 13. Models considered and not used

| Model | Why not |
|---|---|
| FLUX 3 Image / Video (API) | Closed; AA T2I 1115, T2V 1146, but partner nodes break the open-weights rule |
| Wan 2.5 / 2.6 / 2.7 / 3.0 | Closed; Wan 3.0 is AA T2V #1 (1174) and editing #1 |
| Qwen-Image 3.0 / 3.0-Pro | Closed (Router only) |
| Ideogram 4.0 | #2 open T2I (1023) but non-commercial |
| FLUX.2 [dev], FLUX.2 klein 9B | Non-commercial; superseded by FLUX 3 Klein |
| FLUX.2 klein 4B | Apache, but superseded by FLUX 3 Klein |
| FLUX 3 Klein Base | About 6x slower, meant for fine-tuning |
| Qwen-Image 2.1 Base | +18 Elo for 3–6x the steps |
| HiDream-O1 Dev | AA 808 against 973 |
| Krea 2 Raw | 13x the work, no template, no proof it is more lifelike |
| Ming-Image-0.1-Design | Best MIT T2I (998) but 43 GB and Cloud *(unverified)*; kept as the alternative above $5M revenue |
| HunyuanImage 3.0 | 80B MoE needs 3–8 × 80 GB; territory limits |
| ERNIE-Image, Qwen-Image-2512, GLM-Image, Cosmos3, Mage-Flow and others | Lower ranks, no template, multi-GPU, or unreachable repos |
| JoyAI-Image-Edit, SenseNova-U1.5, FireRed, LongCat-Edit, ChronoEdit | Unranked or custom packs |
| PuLID-FLUX, InstantID, InfiniteYou, UNO, USO | Non-commercial bases or InsightFace |
| HunyuanVideo 1.5 | Territory limits; Arena rank *(unverified)* |
| MAGI-2, Cosmos 3 video | No ComfyUI support, 8x H100 class |
| LTX-2.3 | Superseded by 2.5; its LoRAs are not proven on 2.5 |
| Bernini-v2 | Better OpenVE (3.96) but needs a community node and is not on Cloud |
| HoloCine, Lucy Edit, Ditto, RelightVid, MatAnyone, GIMM-VFI, RMBG-2.0 | Non-commercial |
| Breeze-TTS-2, Fish S2 Pro, Voxtral TTS, Higgs Audio v3 | Non-commercial or no node |
| VoxCPM2, IndexTTS 2.5, CosyVoice 3, Kokoro | Alternatives; Kokoro has no emotion or cloning |
| ACE-Step 1.5 XL, YuE2, HeartMuLa | Music alternatives: niche LoRAs, non-commercial, or no Cloud |
| MMAudio | Non-commercial; Foley scores higher |
| Pixal3D, Hunyuan3D 2.1, TripoSplat, HY-World 2.0 | See §10 |

---

## 14. Gaps and mismatches

The notes and the code disagree, or give no reason, in these places. Each one is worth a decision.

1. **Composer defaults are old models.** Create image opens on FLUX.1 dev, Create video on LTX Video 2B, Audio on Gemini voice. This comes from catalog order, not a decision. The flagship open models (Klein, H3, Chatterbox) are options lower down.
2. **Two Image tools run on closed models.** The Relight and Face swap tool pages use Nano Banana 2 on fal. Open alternatives already exist: `relight-photo` (Qwen Edit 2511, Cloud) and `klein_character_swap`.
3. **`inpaint` uses Flux Fill on fal.** The lineup's open pick was Qwen-Image InstantX Inpainting ControlNet with 2511 crop-and-stitch.
4. **Most effects run on LTX-2.5 with no written reason.** H3 ranks far higher. The only written reasons are speed ("Fastest drafts") and that no LTX effect LoRA passed the bar.
5. **No written reason for Klein vs Qwen 2.1 per format.** The 25 looks use Klein; three looks and all edits use Qwen 2.1.
6. **No written reason for Krea 2 on `ai-human`.**
7. **Page copy names different models than the formats run:** Moodboard says IP-Adapter (format uses Klein); Influencer says Z-Image and Wan Animate 2 (format uses Klein); Edit video and Reframe say Wan VACE (no VACE graph; erase uses VOID); Lipsync names Wan 2.2 S2V (no graph).
8. **Lineup claims the engine notes later corrected:** Klein and Qwen 2.1 are not on Cloud; InfiniteTalk is not on Cloud; Chatterbox runs v2, not V3; TRELLIS.2 files are not on Cloud.
9. **Licence conflicts parked until after submission:** Qwen 2.1 is non-commercial; H3 excludes the US, EU, UK and South Korea for local use; LTX-2.5 bars competing products; Krea 2 caps at $1M. Comfy Cloud's "cleared for commercial use" claim versus non-commercial weights is unresolved.
10. **`gap-matrix.md` is stale.** It says 3 workflow files exist; there are now about 105.

---

## 15. Open questions

These need live runs (with an approved budget) before they can be settled:

- Klein output quality, and whether it counts for the FLUX 3 bonus.
- Qwen 2.1 identity from references, logo alpha edges, outpaint alignment, relight vs 2511.
- H3 multi-shot, Ref2VA lipsync, `h3_draw` arrows, `h3_extend` continuity, 3 s clips.
- LTX-2.5 multi-shot with 5–6 shots.
- Effect LoRAs with the Lightning LoRA at ComfyField's 0.4 MP size.
- Bernini-R on 8–12 fps input; VOID on 32 GB; ReCamMaster on portrait clips.
- Chatterbox non-English quality; Drama 3 system RAM per Pod class.
- InfiniteTalk at 24–30 fps; TRELLIS.2 turntable framing.
- Every VRAM and speed figure marked *(est.)*.

---

## Sources

- `research_notes/Open weight model lineup/image_and_video.md`, `audio_3d_llm.md` (2026-10-16)
- `research_notes/engine/newest-models.md`, `newest-image-models.md`, `newest-video-models.md` (2026-10-17)
- `research_notes/engine/t2i/`, `klein/`, `qwen-edit/`, `video-gen/`, `i2v-chains/`, `video-edit/`, `effects-loras/`, `audio-talk/`, `enhance/`, `3d/` (README and check, 2026-10-19)
- `research_notes/engine/genjutsu.md`, `freevideo.md`
- `research_notes/LoRAs for ComfyField services/`
- `research_notes/Higgsfield feature audit/how-to-and-models.md`, `research_notes/gap-matrix.md`
- Code: `src/lib/tools.js`, `src/lib/catalog.js`, `src/lib/formats/*.js`, `src/lib/recipes.js`, `src/lib/usePicker.js`, `shared/modelFiles.js`, `server/core.js`
