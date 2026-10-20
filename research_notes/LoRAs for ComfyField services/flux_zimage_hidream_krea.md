# LoRAs for FLUX 3 Image Klein, Z-Image Turbo / Z-Image, HiDream-O1 and Krea 2, mapped to ComfyField services (as of 2026-10-19)

Method note (read first):
- All numbers were fetched on 2026-10-19. Each listed LoRA's page was opened through the page's own data: the Civitai model API (`civitai.com/api/v1/models/<id>`, which returns the page description, versions, trigger words, files, stats and licence flags) or the Hugging Face model card (`huggingface.co/<id>/raw/main/README.md`) plus the HF model API (file sizes). Search snippets were not used as sources.
- "Civ v: 42,241 / 2,178" = downloads / thumbs-up of the version for that base model. "Civ m" = totals of the whole Civitai model page across all base models. "HF 30d" = the `downloads` field of the HF API (a rolling 30-day count) and likes.
- Base model is written exactly as the page states it: Civitai base strings are `Flux.3 Klein`, `Flux.3 Klein-base`, `Flux.3`, `ZImageTurbo`, `ZImageBase`, `Krea 2`, `HiDream-O1`; HF strings are repo ids such as `black-forest-labs/flux-3-image-klein-base`, `Tongyi-MAI/Z-Image-Turbo`, `krea/Krea-2-Raw`, `krea/Krea-2-Turbo`.
- Licence column: base-model licence, then the LoRA page's terms. Civitai flags (`allowCommercialUse`) are shortened: **Img** = may sell generated images, **Svc** = may run the LoRA on other generation services (the flag that matters for a hosted ComfyField), **Civ-only** = only on Civitai's generator. Base licences: Z-Image Apache-2.0; HiDream-O1 MIT; FLUX 3 Image Klein FLUX Kommunity v1.0 (commercial outputs under $5M revenue; commercial fine-tune distribution excluded); Krea 2 Community License (commercial only under $1M company revenue; content filtering mandatory) ([lineup notes, licence table](../Open%20weight%20model%20lineup/image_and_video.md), [krea.ai licensing](https://www.krea.ai/krea-2-licensing)).
- Excluded and not listed (per brief): NSFW-focused LoRAs, LoRAs of real identifiable people, LoRAs named after living artists. I also left out LoRAs whose own files or triggers show a single living artist as the source (for example Adel_AI's Z-Image and Krea 2 packs, where version file names such as `Lovering_E15` and `Romain_Bonnet_E10` sit behind coded triggers), and LoRAs whose file names or tags are pornographic although the page is marked SFW.
- Scope models in ComfyField: FLUX 3 Image Klein runs 24 of 27 Looks, 11 Just-for-fun formats, 6 Characters formats, Storyboard, Slide visuals and the Explainer/Faceless frames; Krea 2 Raw runs "AI human"; Z-Image Turbo is listed as an open model ("Instant lifelike portraits") but no format runs on it yet; HiDream-O1 is listed as an open model but no format runs on it yet ([service inventory](00%20service%20inventory.md)).

---

## Q1. Does a LoRA ecosystem exist yet for FLUX 3 Image Klein, and what is in it?

### Takeaway
Barely. FLUX 3 Image Klein came out on 2026-10-15, four days ago. On 2026-10-19 there are 25 HF adapters and 19 SFW Civitai LoRAs, and none passes a few hundred downloads. Most are tools: outpaint, consistency, restore, camera angles, 360 panorama, and distill/speed. A few are hackathon style LoRAs. No realism, influencer, anime or film-stock LoRA of note exists yet. For those looks, the honest substitute is Z-Image Turbo or Krea 2 with their mature LoRAs (Q2, Q3), or FLUX 3 Klein's own multi-reference input (up to 10 images).

### Cited Findings
Ecosystem facts
- BFL: "The base checkpoint is built for fine-tuning: Diffusers and Ostris's AI Toolkit support LoRA training from day one", and "Serving a LoRA adds around 5% to generation time" — [BFL blog, FLUX 3 Image Klein, 2026-10-15](https://bfl.ai/blog/flux-3-image-klein)
- Release has a base checkpoint (for fine-tuning) and a step-distilled checkpoint (low latency), plus FP8/INT8/NVFP4 builds — [BFL blog](https://bfl.ai/blog/flux-3-image-klein); Comfy calls the distilled one a "turbo" variant — [Comfy blog](https://blog.comfy.org/p/flux-3-image-klein-in-comfyui-56b)
- FLUX 3 Klein is a 5.6B model; BFL compares it with FLUX.2 [klein] 9B ("38% fewer parameters") — [BFL blog](https://bfl.ai/blog/flux-3-image-klein). In ComfyUI it uses a Qwen3-VL-4B text encoder (`CLIPLoader` type `flux3`) and "the FLUX.2 VAE" (`flux2-vae.safetensors`) — [Comfy docs](https://docs.comfy.org/tutorials/flux/flux-3-klein.md)
- HF adapter counts on 2026-10-19: 9 adapters tagged `black-forest-labs/flux-3-image-klein` and 16 tagged `black-forest-labs/flux-3-image-klein-base` — [HF API, distilled](https://huggingface.co/api/models?filter=base_model:adapter:black-forest-labs/flux-3-image-klein), [HF API, base](https://huggingface.co/api/models?filter=base_model:adapter:black-forest-labs/flux-3-image-klein-base)
- Civitai SFW LoRA counts on 2026-10-19: 11 under `Flux.3 Klein`, 6 under `Flux.3 Klein-base`, 2 under `Flux.3` — [Civitai API](https://civitai.com/api/v1/models?types=LORA&baseModels=Flux.3%20Klein&nsfw=false)
- ai-toolkit lists `black-forest-labs/flux-3-image-klein-base (FLUX.3 Image Klein)` as a supported training model — [ai-toolkit README](https://github.com/ostris/ai-toolkit)
- A veteran style-LoRA author (ArsMachina, 43,537 total downloads on the page) on his FLUX 3 Klein version: "I really hope that there is some issue with the training/img generation in AIToolkit/ComfyUI, because I am not liking what I see so far... dont expect miracles" — [80s Fantasy Movie, Flux3Klein version](https://civitai.com/models/789313?modelVersionId=3411299)
- Train-on-base, run-on-distilled is the working pattern: ausboss "trained it on the base model and tested it on the distilled one (16 steps, CFG 1)" — [ausboss Outpaint](https://huggingface.co/ausboss/FLUX-3-Image-Klein-Outpaint-LoRA); AIImageStudio: "This Lora supports both base and step distilled model" — [Radiance Chrome Voluptuous F3K](https://civitai.com/models/2323765?modelVersionId=3410965)

FLUX.1 / FLUX.2 LoRA compatibility
- No page I found tested loading a FLUX.2 [klein] LoRA on FLUX 3 Klein. Indirect evidence:
  - Within FLUX.2, LoRAs from FLUX.1, FLUX.2 Dev and Klein variants are "incompatible by default"; a wrong base gives "missing-key or shape-mismatch errors, or a LoRA that silently does nothing", and a 9B Klein LoRA cannot be put on 4B — [RunComfy FLUX.2 Klein 9B LoRA workflow](https://www.runcomfy.com/comfyui-workflows/flux2-klein-9b-ai-toolkit-lora-inference-in-comfyui-training-matched-results), [lilting.ch Klein write-up](https://lilting.ch/en/articles/flux2-klein-nsfw-lora-local-feasibility)
  - Authors who already had FLUX.2 Klein LoRAs re-trained new files for FLUX 3: denrakeiw's "360 Flux 2/3 Klein Seamfix" ships a separate `F_3_seamfix.safetensors` for `Flux.3 Klein` — [Civitai 2709848](https://civitai.com/models/2709848?modelVersionId=3409354); ArsMachina re-trained 80s Fantasy Movie — [Civitai 789313](https://civitai.com/models/789313?modelVersionId=3411299)
  - FLUX 3 Klein is 5.6B with a Qwen3-VL-4B encoder; FLUX.2 klein is 4B or 9B — [BFL blog](https://bfl.ai/blog/flux-3-image-klein), [lineup notes](../Open%20weight%20model%20lineup/image_and_video.md)

Catalog: FLUX 3 Image Klein LoRAs (all usable SFW entries; most are tools)

| LoRA | Exact base (page) | What it does | Trigger / prompt pattern | Strength, steps | Popularity (2026-10-19) | Licence | ComfyUI loading | Size | ComfyField services, why | Conf. |
|---|---|---|---|---|---|---|---|---|---|---|
| FLUX 3 Image Klein Outpaint LoRA (ausboss / AusBoss) — [HF](https://huggingface.co/ausboss/FLUX-3-Image-Klein-Outpaint-LoRA), [Civitai](https://civitai.com/models/3003865) | HF: `black-forest-labs/flux-3-image-klein-base`; Civitai: `Flux.3 Klein` | Extends a picture on any side; pad with flat gray `#808080`, model fills the gray, original stays in place. Without it Klein zoomed or slid the picture in 36 of 40 test runs; with it the original moved 0.1–1.5 px | Instruction: "Outpaint the image: replace the solid gray areas with a seamless continuation of the scene, keeping the existing picture unchanged." | 1.5 on distilled (1.0 slips more), 16 steps, CFG 1 | Civ v 508 / 35; HF 17 likes | FLUX Kommunity (HF); Civ-only flag on Civitai | Standard LoRA on distilled model; author workflow pads, edits via reference latent, pastes original back with Stitch Inpaint | 153.3 MB | Expand (FLUX path), Wallpaper (re-ratio), Thumbnail (portrait to 16:9), Looping background | High (measured by author) |
| FLUX 3 Image Klein Consistency LoRA (ausboss) — [HF](https://huggingface.co/ausboss/FLUX-3-Image-Klein-Consistency-LoRA) | `black-forest-labs/flux-3-image-klein-base` | Makes an edit without moving the picture. Author: helped weather and light, hurt hair colour and pose, outfits mixed | No trigger; write the edit as usual | 1.0 on distilled, 16 steps, CFG 1, euler/simple | HF 4 likes, 0 (30d) | FLUX Kommunity | Standard LoRA ("Loads onto the FLUX 3 Image Klein files in ComfyUI") | 153.3 MB (card: 161 MB) | Restyle, Character swap, Skin retouch, Relight-type edits | Low ("Early release, only lightly tested") |
| FLUX 3 Image Klein Restore LoRA (ausboss) — [HF](https://huggingface.co/ausboss/FLUX-3-Image-Klein-Restore-LoRA) | `black-forest-labs/flux-3-image-klein-base` | Keeps faces and colours closer to the source when FLUX 3 redraws a small or worn photo in tiles (after SeedVR2 3B enlarge) | Trigger is a sentence (given on card) | 1.0 on distilled, 8 steps, CFG 1, euler/simple, denoise 1 | HF 2 likes | FLUX Kommunity | Standard LoRA; optional row in author's upscale workflow (`Set Reference Multi Latent`) | 153.3 MB | Restore an old photo, Image upscale, Unblur a photo (a FLUX 3 path for the contest bonus) | Low–medium |
| Multiple Angles LoRA (akhaliq) — [HF](https://huggingface.co/akhaliq/flux-3-image-klein-angles-lora) | `black-forest-labs/flux-3-image-klein-base` | Re-renders a subject from a new camera pose: 8 azimuths × 5 elevations × optional distance, same `<mva>` grammar as the Qwen-Image multiple-angles LoRAs | e.g. `<mva> right side view, elevated shot`; turn off the prompt upsampler ("LoRA expects raw prompts") | 50 steps on base (card example) | HF 30d 239, 2 likes | FLUX Kommunity | Diffusers PEFT file (`pytorch_lora_weights.safetensors`); ComfyUI use not stated | 76.7 MB | Any angle, New angle, Shot grid, Character sheet, Storyboard | Medium–low |
| 360 Degree [Flux] + 360 Seamfix (denrakeiw / DenRakEiw) — [HF](https://huggingface.co/DenRakEiw/Flux_3_klein_360_Degree), [Civitai 360](https://civitai.com/models/682349?modelVersionId=3409330), [Civitai Seamfix](https://civitai.com/models/2709848) | Civitai: `Flux.3 Klein` ("Trained on Flux 3 Image Klein (base)"); HF tag: `black-forest-labs/flux-3-image-klein` | Equirectangular 360° panoramas; second LoRA repairs the wrap-around seam | `create a 360 hdr`; Seamfix: `seamfix` | Keep 2:1 (2048×1024, 4096×2048); workflow 30 steps, CFG 4 | Civ v 122 / 21 (Civ m 14,492 / 1,277); Seamfix v 89 / 9 | FLUX Kommunity; Civ flags Img+Svc (Seamfix also Sell) | Standard LoRAs; needs ComfyUI 0.41.2+, CLIPLoader type `flux3`, `flux2-vae` | 153.3 MB each | Looping background, Explorable world (backdrop input), Wallpaper, 3D studio skies | Medium |
| Flux 3 Klein Distilled LoRA (SD Extract) (WAS) — [Civitai](https://civitai.com/models/3005103), [HF](https://huggingface.co/WAS/flux3_klein) | Civitai: `Flux.3 Klein-base`; HF: base + distilled | Distilled-minus-base at ranks 16/32/64/256; gives the base the distilled look in 16 steps while the base still takes CFG | No trigger | ~1.0 (0.9 with extra steps), 16 steps, CFG 1–3.5 | Civ v 101 / 9 | FLUX Kommunity; Civ flags Img+Svc+Sell | **Special:** needs the **Flux 3 Flow Map Patch** node (WAS Node Suite v3), which copies the ~20 MB `ref_time_in` layer from the distilled checkpoint; without it: grain every 4 px and a blue cast | 80.5 / 161 / 321.8 / 1,284.6 MB | Speed path when a format needs the base model (style LoRAs trained on base + CFG) | Medium |
| FLUX 3 Image Klein Extracted Distilled LoRA (terminusresearch) — [HF](https://huggingface.co/terminusresearch/flux-3-klein-image-distilled-lora-extract) | base + distilled | Low-rank base→distilled difference incl. the destination-timestep embedding | none | — | HF 0 | FLUX Kommunity | **Special:** "Use the included FLUX 3 Distilled Extract Loader node, not the ordinary Load LoRA node" | 1,304 MB (r256), 663 MB (r128) | Same as above | Low–medium |
| FLUX.3 Klein 4-step distill LoRA (Muinez) — [HF](https://huggingface.co/Muinez/flux3-klein-distil-4step) | `black-forest-labs/flux-3-image-klein-base` | Base model in 2–4 steps without CFG | none | 1.0; 4 steps (2–3 work), CFG 1, shift 3 (`ModelSamplingFlux` max_shift = base_shift = 1.0986) | HF 11 likes | FLUX Kommunity | Standard: "ComfyUI format, load with `LoraLoaderModelOnly`" | 160.9 MB | Faster previews on base-model LoRA stacks | Low ("Experimental... trained only briefly") |
| MoreReal (NO8D) — [Civitai](https://civitai.com/models/2904424?modelVersionId=3414035) | `Flux.3 Klein` | "A2R": converts any image (anime, render, drawing) into a photograph | `Convert this image into a photograph` | 0.6–0.9, 16 steps (INT8) | Civ v 175 / 27 (Civ m 2,840 / 274) | Author: "Do not use it for any commercial activities"; Civ-only flag | Edit workflow, standard LoRA | 76.7 MB | AI human (from a sketch or render), reverse of Cartoon yourself | Medium–low |
| 80s Fantasy Movie (ArsMachina) — [Civitai](https://civitai.com/models/789313?modelVersionId=3411299) | `Flux.3 Klein` | Early-80s fantasy film still | `ArsMovieStill, 80s Fantasy Movie Still` | not stated for F3K | Civ v 87 / 17 | Civ flags Img | Standard | 153.3 MB | Cinematic cameras, 70s film stock-type Looks | Low (author unhappy with F3K results) |
| 炭笔素描 Charcoal sketch (updatemp) — [Civitai](https://civitai.com/models/2460411) | `Flux.3 Klein` | Charcoal sketch style | `炭笔素描` | not stated | Civ v 52 / 6 | Civ flags Img+Svc+Sell | Standard | 153.3 MB | Sketch, Ink sketch Looks | Low |
| FLUX.3 Tarot LoRA (diffusers-modular) — [HF](https://huggingface.co/diffusers-modular/flux3-tarot-lora) | `black-forest-labs/flux-3-image-klein-base` | Rider-Waite tarot card style | `a trtcrd of {subject}, tarot style` | 28 steps on base (example) | HF 30d 66 | "other" (FLUX Kommunity base) | Diffusers PEFT; ranks 8 / 32 / default | 76.7 MB (r32: 153.3) | Winning card, Idol photocard-type cards, Looks | Low–medium |
| Dissolve Style (RalFinger) — [Civitai](https://civitai.com/models/245889) | `Flux.3` | Subject tearing/dissolving into fragments | `ral-dissolve` | not stated | Civ v 42 / 13 (Civ m 27,167 / 2,356) | Civ flags Img | Standard | 76.8 MB | Effects stills (start frame for Turn to sand, Pixel dissolve), Thumbnail | Low–medium |
| Pastel_flux3 (Aikimi) — [Civitai](https://civitai.com/models/3004857) | `Flux.3 Klein-base` ("probably works on the non-base too") | Pale pastel colour style | `pastelstyle` | not stated | Civ v 65 / 3 | Civ flags Img | Standard | 306.5 MB | Looks (soft pastel), Wallpaper | Low |
| Balthazar Style LoRA (jurecerkez) — [HF](https://huggingface.co/jurecerkez/baltazar-style-lora) | `black-forest-labs/flux-3-image-klein-base` | 1960s Zagreb Film "Professor Balthazar" flat cartoon look | `... bltzr style` | 16 steps, guidance 1.0 on distilled | HF 30d 9 | not stated | Diffusers example; rank 32 | 153.3 MB | Cartoon yourself, Story video frames | Low |
| Tholpavakoothu shadow-puppet LoRA (Barath) — [HF](https://huggingface.co/Barath/tholpavakoothu-flux3-lora) | `black-forest-labs/flux-3-image-klein-base` (trained), run on `flux-3-image-klein` | Kerala leather shadow-puppet look; trained on 20 credited Wikimedia Commons photos (CC BY-SA / CC BY) | `thlpvk style` | 0.75, 16 steps on distilled | HF 30d 4 | not stated (data CC-licensed) | rank 32 | 153.3 MB | Story video, Explainer frames (see Novel) | Low |
| 沙雕动画 meme-cartoon character (updatemp) — [Civitai](https://civitai.com/models/2146978) | `Flux.3 Klein` | Chinese "shadiao" meme cartoon style | `shadiaodonghua` | not stated | Civ v 24 / 0 | Civ flags Img+Svc+Sell | Standard | 153.3 MB | Meme maker, Cartoon yourself | Low |
| Radiance Chrome Voluptuous (AIImageStudio) — [Civitai](https://civitai.com/models/2323765?modelVersionId=3410965) | `Flux.3 Klein-base` (base and distilled) | Slide-film colour, strong sunlight. Page warns: female figures skew to "large breasts, slim waist, and wide hips"; "NSFW supported" | none | 1.0, euler/simple | Civ v 235 / 17 | FLUX Kommunity; Civ flags Svc | Standard | 153.3 MB | Not recommended for ComfyField (body bias) | — |
| SimpleTuner photo-aesthetics (distilled-assisted) — [HF](https://huggingface.co/SimpleTuner/flux-3-klein-image-photo-aesthetics-distilled-assisted-1024) | `black-forest-labs/flux-3-image-klein` | Trainer experiment for photo aesthetics | none | CFG 1, 16 steps | HF 30d 628 | "other" | PEFT | 64.5 MB | Test only | Low |

### Inferences
- Treat FLUX 3 Klein as "LoRA-poor" for the contest window. The only production-grade picks are tools: Outpaint (Expand, Wallpaper, Thumbnail), 360 + Seamfix (Looping background), Restore (old photos), and Multiple Angles (if a ComfyUI loader works).
- FLUX.2 [klein] LoRAs should be assumed not to load on FLUX 3 Klein. The transformer differs (5.6B vs 4B/9B), the text encoder differs, and authors re-train separate FLUX 3 files. Only the VAE is shared. This is an inference; no page tested it directly.
- For FLUX 3 Klein Looks, the practical substitutes are: (a) FLUX 3 Klein multi-reference with 1–10 style reference images from ComfyField's own media; (b) switch the format to Z-Image Turbo or Krea 2 Turbo plus a proven LoRA (picks in Q6); (c) train ComfyField's own FLUX 3 Klein LoRAs with ai-toolkit on the base model and run them on the distilled model. The FLUX Kommunity licence excludes commercial distribution of fine-tunes, so (c) is for internal use only.
- Base-trained LoRAs run on the distilled model in the author tests. ComfyField can keep the fast distilled checkpoint for every format.

### Gaps
- No direct test found of a FLUX.2 [klein] LoRA loaded on FLUX 3 Klein (expected: key or shape mismatch).
- akhaliq's Multiple Angles LoRA: ComfyUI loading not stated (diffusers PEFT key names).
- Quality of early FLUX 3 Klein style LoRAs is not reviewed anywhere beyond one author's negative note. Download counts are too low for a signal.
- FLUX 3 Klein is not yet in Civitai's or fal's LoRA trainers as far as the pages show (not checked further).

---

## Q2. Which Z-Image Turbo / Z-Image LoRAs are most used and best regarded?

### Takeaway
Z-Image has a deep, mature LoRA ecosystem: about 5,400 SFW Turbo LoRAs and 715 SFW Base LoRAs on Civitai, and 879 + 152 adapters on HF. The strongest areas are amateur and phone realism, skin texture, film emulation, cinematic grading, character sheets, sliders and pixel art. Anime and illustration exist but are weaker than on Krea 2. Most LoRAs load with the standard ComfyUI LoRA loader. Turbo LoRAs often also work on Base, but not always.

### Cited Findings
Ecosystem facts
- Civitai SFW LoRA counts on 2026-10-19: `ZImageTurbo` 5,376; `ZImageBase` 715 — [Civitai API](https://civitai.com/api/v1/models?types=LORA&baseModels=ZImageTurbo&nsfw=false)
- HF adapter counts: 879 for `Tongyi-MAI/Z-Image-Turbo`, 152 for `Tongyi-MAI/Z-Image` — [HF API](https://huggingface.co/api/models?filter=base_model:adapter:Tongyi-MAI/Z-Image-Turbo)
- The most-downloaded Z-Image adapter repo on HF (240,613 in 30 days) is a pack of real-person look-alike LoRAs (excluded) — [HF API list](https://huggingface.co/api/models?filter=base_model:adapter:Tongyi-MAI/Z-Image&sort=downloads)
- Z-Image (Base) is "a full-capacity, undistilled transformer... a good base for LoRA training"; Turbo is the 8-step distilled model — [Tongyi-MAI/Z-Image card](https://huggingface.co/Tongyi-MAI/Z-Image)
- Training directly on Turbo breaks the step distillation quickly; ostris's de-distill training adapter slows this — [ostris/zimage_turbo_training_adapter](https://huggingface.co/ostris/zimage_turbo_training_adapter) (HF 30d 39,026, 148 likes)
- Turbo↔Base cross-use: "TURBO LoRA works with BOTH the Z-Image Base and Turbo models! Z-IMAGE BASE ONLY works on BASE ONLY!" — [RebelReal page](https://civitai.com/models/2181922); OB Instant camera v5.1 "Compatible with both Base and Turbo" — [Civitai 785013](https://civitai.com/models/785013); RunComfy: Base-trained LoRAs on Turbo are "not guaranteed to match" (strength, colour, background can shift) — [RunComfy Z-Image base vs turbo](https://www.runcomfy.com/trainer/ai-toolkit/z-image-base-vs-turbo-lora-training)
- Trainers: ai-toolkit (Z-Image Turbo, Z-Image, Z-Image De-Turbo) — [ai-toolkit README](https://github.com/ostris/ai-toolkit); musubi-tuner (Z-Image) — [musubi-tuner README](https://github.com/kohya-ss/musubi-tuner); SimpleTuner ("Base/Turbo LoRA with assistant adapter"; saves ComfyUI-style `diffusion_model.*` keys and auto-detects them for Z-Image) — [SimpleTuner README](https://github.com/bghira/SimpleTuner)
- Loader quirk: Luneva says ComfyUI after 0.3.77 changed the default UNET dtype and "FlowMatch... works best with fp32" (`--fp32-unet`) — [Midjourney Luneva Cinematic](https://civitai.com/models/2185167)

Catalog A: realism, skin, amateur/phone (for influencer formats, see Q4 for ranking)

| LoRA | Exact base | What it does | Trigger / prompt | Strength, steps | Popularity | Licence | Load | Size | Services | Conf. |
|---|---|---|---|---|---|---|---|---|---|---|
| Realistic Snapshot (MonkeyForever) — [Civitai](https://civitai.com/models/2268008?modelVersionId=2617751) | `ZImageTurbo` (ZIT v5 "Real Life") | Casual smartphone/digicam snapshot realism | none | 0.6–0.7 "maybe lower" | Civ v 42,241 / 2,178; Civ m 98,606 / 4,067 | Apache base; Civ flags Img+Svc+Sell. Page: "better at NSFW as well" | Standard | 162.2 MB | AI influencer page, Photodump, AI influencer post, Phone flash at night | High |
| Lenovo UltraReal (Danrisi) — [Civitai](https://civitai.com/models/1662740?modelVersionId=2452071) | `ZImageTurbo` (also `ZImageBase` v 4,241 / 199) | Phone-camera realism with dramatic light | `l3n0v0` | not stated for ZIT | Civ v 31,115 / 1,455; Civ m 199,829 / 5,548 | Civ flags Img+Svc+Sell (no derivatives) | Standard | 81.2 MB | AI influencer page, Photodump, Create image | High |
| NiceGirls UltraReal (Danrisi) — [Civitai](https://civitai.com/models/1862761?modelVersionId=2465980) | `ZImageTurbo`; Asian edition 18,717 / 935; `ZImageBase` 6,465 / 259 | Natural-looking young-women portraits ("beauty, character") | none | (Krea: 0.6–0.8) | Civ v 29,849 / 1,470; Civ m 141,369 / 4,512 | Civ flags Img+Svc+Sell | Standard | 162.2 MB (Asian 648.8) | AI human, AI influencer (narrow demographic) | Medium |
| Realistic Skin Texture style (EauDeNoire) — [Civitai](https://civitai.com/models/580857?modelVersionId=2674760) | `ZImageTurbo` v4.5; also `ZImageBase` v2.1 11,504 / 393 | Pores and fine skin texture, cinematic | `incredibly lifelike, cinematic, detailed, sharp, fine texture, Hyperrealistic, photorealistic` | "lower or raise" | Civ v 21,379 / 943 (ZIT v2.1 17,119 / 849); Civ m 191,226 / 7,584 | Civ-only flag | Standard | 162.2 MB | Skin retouch, Professional headshot, Portrait styles, AI human | High |
| Amateur Photography (peterkickasspeter) — [Civitai](https://civitai.com/models/652699?modelVersionId=2524532) | `ZImageTurbo` v1; `ZImageBase` "Nano banana at home" 6,646 / 458 | Raw, unedited amateur photos | `A photo taken by the photographer Deedeemegadoodo, raw, unedited` | res_2s for Base | Civ v 11,330 / 626; Civ m 84,967 / 4,251 | Civ-only flag | Standard; optional custom upscale node by author | 324.4 MB (Base 558.4) | Photodump, AI influencer page | Medium–high (one Base test build has "huge dark skin bias") |
| Ultra Real – Amateur Selfies (bloodforce88) — [Civitai](https://civitai.com/models/2233658) | `ZImageTurbo` | Smartphone selfies: close-ups, casual poses, varied bodies and skin tones | `amateur_selfie` | Euler/Normal or Simple-Beta, 832×1216 | Civ v 4,617 / 254 | Civ flags Img | Standard | 60.9 MB | AI influencer post, Profile picture, Photodump | Medium |
| AWPortrait-Z (Shakker-Labs) — [HF](https://huggingface.co/Shakker-Labs/AWPortrait-Z) | `Tongyi-MAI/Z-Image-Turbo` | Polished beauty portraits; removes Z-Image's skin "grain", tames HDR | none stated | not stated | HF 30d 3,294; 488 likes | Apache-2.0 | Standard | 648.8 MB | Professional headshot, Portrait styles, Skin retouch | Medium–high |
| Z-Image-Turbo-Realism-LoRA (suayptalha) — [HF](https://huggingface.co/suayptalha/Z-Image-Turbo-Realism-LoRA) | `Tongyi-MAI/Z-Image-Turbo` | Ultra-real images, trained on a CC12M realistic subset | `Realism` | not stated | HF 30d 4,120; 34 likes | Apache-2.0 | Standard | 81.2 MB | Create image (photo mode) | Medium |
| ZepiCRealism (epinikion) — [Civitai](https://civitai.com/models/2283998) | `ZImageTurbo` (Turbo / Beauty / High) | Natural realism; "All LoRAs reduce the default Asian look" | none | optimised for 1.0 (0.5–1.0) | Civ v 2,780 / 200 | Civ flags Svc | Standard | 162.3 MB | Create image, AI human (more diverse faces) | Medium |
| ANTI-PLASTIC (Anti_Plastic) — [Civitai](https://civitai.com/models/2213166) | `ZImageTurbo` | "Cure for plastic skin": analog texture, fabric, noise | none | not stated | Civ v 3,733 / 273 | Civ flags Img+Svc | Standard | 162.2 MB | Skin retouch, AI influencer | Medium |
| Olympus UltraReal (Danrisi) — [Civitai](https://civitai.com/models/2212121) | `ZImageTurbo` | Trained on the author's own 2002 Olympus C-5050 photos: early-digicam look | none | not stated | Civ v 3,297 / 274 | Civ flags Img+Svc+Sell | Standard | 162.2 MB | Photodump (Y2K digicam), Disposable camera Look | Medium |
| DeJPEG LoRA (wcde) — [HF](https://huggingface.co/wcde/Z-Image-Turbo-DeJPEG-Lora) | `Tongyi-MAI/Z-Image-Turbo` | Removes JPEG-like artifacts; lite / strong / detailed / v2 / v3 | none | not stated | HF 30d 15,093; 52 likes | none stated | Standard | 162.2–648.8 MB | Quality add-on for every Z-Image format | Medium |

Catalog B: film emulation and cinematic

| LoRA | Exact base | What it does | Trigger / prompt | Strength, steps | Popularity | Licence | Load | Size | Services | Conf. |
|---|---|---|---|---|---|---|---|---|---|---|
| Midjourney Luneva Cinematic (luneva) — [Civitai](https://civitai.com/models/2185167) | `ZImageTurbo` | Cinematic vibe plus detail across themes | none | R128 file; author tip `--fp32-unet` | Civ v 16,184 / 1,483 | Civ flags Img | Standard | 648.8 MB | Cinematic cameras, Faceless frames | High |
| Cinematic Shot ✨ (ZyloO) — [Civitai](https://civitai.com/models/432586?modelVersionId=2454927) | `ZImageTurbo` | Boosts cinematic grading; trained on landscapes | none ("cinematic, cinematic still image" helps) | not stated | Civ v 11,632 / 883; Civ m 60,052 / 4,373 | Civ flags Img | Standard | 162.2 MB | Cinematic cameras, Explainer and Faceless frames | High |
| GrainScape UltraReal (Danrisi) — [Civitai](https://civitai.com/models/1332651) | `ZImageTurbo` | Analog film grain (Kodak), 80s/90s colour; works in black and white | none | 0.85–0.9, res2s/res2m + beta, guidance 3.5 | Civ v 8,801 / 685 | Civ flags Img+Svc+Sell | Standard | 81.2 MB | 70s film stock, Disposable camera, Film noir Looks | High |
| 2000s Analog Core (Danrisi) — [Civitai](https://civitai.com/models/1134895) | `ZImageTurbo` | 2000s camcorder/CRT/VHS look with on-screen timestamps | none | 0.9, res_2s_ode + beta | Civ v 8,044 / 686; Civ m 35,965 / 2,543 | Civ flags Img+Svc+Sell | Standard | 81.2 MB | CCTV still, Photodump (Y2K), Disposable camera | High |
| Melancholy (zidius) — [Civitai](https://civitai.com/models/2334593) | `ZImageTurbo` | Restrained, melancholic cinematic realism, shallow depth of field | `zidiusArt` | start 0.5, never above 1.0; ~1328×1944; needs film grain | Civ v 6,756 / 853 | Civ-only flag | Standard | 162.2 MB | Faceless frames, Cinematic cameras | Medium–high |
| AfterDark (HackAfterDark) — [Civitai](https://civitai.com/models/2176378) | `ZImageTurbo` v2.0 (also Krea 2 Turbo; ZIB LoKr) | Punch, contrast, depth of field; low-key, noir and fashion photo data | `4ft3rd4rk` | 0.3–0.8 (ZIT) | Civ v 5,865 / 434 | Civ flags Img+Svc | Standard (ZIB file is LoKr) | 162.2 MB | Film noir Look, Studio fashion Look | Medium–high |
| Technically Color Z (renderartist) — [HF](https://huggingface.co/renderartist/Technically-Color-Z-Image-Turbo) | `Tongyi-MAI/Z-Image-Turbo` | Classic three-strip-era film stills: saturated palettes, dramatic light | `t3chnic4lly` | not stated | HF 30d 1,314; 90 likes | Apache-2.0 | Standard | 243.3 MB | 70s film stock / classic film Looks, Cinematic cameras | Medium–high |
| Movie Wide Angle (oleshevakatya) — [Civitai](https://civitai.com/models/2186574) | `ZImageTurbo` | Ultra-wide lens with distortion and odd angles; for 16:9 / 4:3 | none; boost with `ultra-wide angle with extreme lens distortion` | not stated | Civ v 4,077 / 341 | Civ flags Img+Svc+Sell | Standard | 162.2 MB | Cinematic cameras (12 mm lens), Fisheye skate video Look | Medium |
| Cinematic Photography Style (EauDeNoire) — [Civitai](https://civitai.com/models/214956) | `ZImageTurbo` v1.5 | Cinematic DSLR film style | `cinematic film style, cinematic dslr photography style, cinematic photography` | "lower or raise" | Civ v 3,374 / 290 | Civ-only flag | Standard | 162.2 MB | Golden hour editorial, Cinematic cameras | Medium |
| 35mm Photo (ConflictX) — [Civitai](https://civitai.com/models/660731) | `ZImageTurbo` v0.2 | 35 mm photo light and aesthetics (landscapes, objects, buildings) | `35mm Photo, film grain` | not stated | Civ v 4,172 / 284 | Civ flags Img | Standard | 162.2 MB | 70s film stock, Disposable camera | Medium |
| Purple Grainy (purplelady) — [Civitai](https://civitai.com/models/2329053) | `ZImageTurbo` | Post-processing look: film grain, edge blur, muted moody grade | none | 1.0, euler/simple ("hands are a little broken") | Civ v 4,392 / 553 | Civ flags Img | Standard | 162.2 MB | Moodboard presets, Faceless frames | Medium |
| ArsMachina period movie stills (ZIB): 80s Fantasy / 70s Horror / 30s Technicolor / 90s Indie / 50s Panavision / 50s Noir — [80s](https://civitai.com/models/789313?modelVersionId=2649848), [70s Horror](https://civitai.com/models/863136), [30s Technicolor](https://civitai.com/models/886686), [90s Indie](https://civitai.com/models/881194), [50s Panavision](https://civitai.com/models/1025360), [50s Noir](https://civitai.com/models/804984) | `ZImageBase` (80s Fantasy also `ZImageTurbo`: v 3,655 / 253 and 2,199 / 362) | Era-specific film still looks (trained on the author's Midjourney images) | `ArsMovieStill, movie still from a 1970s horror movie` (pattern repeats per era; noir: `ArsMovieStill, 50s Noir Movie Still`) | ZIT version "up to 1.5 without issues" | ZIB v: 2,392 / 272; 917 / 118; 804 / 95; 749 / 95; 686 / 60; 678 / 76 | Civ flags Img (no derivatives) | Standard | 81.2 MB | Film noir, 70s film stock Looks; Cinematic cameras film-stock menu; Storyboard | Medium |
| 90s VHS (jeffjjang) — [Civitai](https://civitai.com/models/2358489) | `ZImageBase` | Home-VHS look from the author's digitised family tapes; timestamps can appear | `vh5` | raise for more distortion | Civ v 1,079 / 107 | Civ flags Img | Standard | 243.3 MB | CCTV still, Photodump (90s) | Medium |
| OB Instant camera portrait (1jiliguala1) — [Civitai](https://civitai.com/models/785013) | `ZImageTurbo` v4.0; `ZImageBase` v5.1 (Base and Turbo) | Polaroid filter looks on portraits | v5: `OBbllai` | ≤0.5 when stacked | ZIT v 4,742 / 514; ZIB v5.1 3,645 / 255 | Civ flags Img+Svc+Sell | Standard | 223.1 / 351.6 MB | Instant photo Look | Medium |
| POLAROID PHOTO STYLE – REDMOND (artificialguybr) — [Civitai](https://civitai.com/models/2422652) | `ZImageTurbo` | Polaroid photo | `Polaroid Photo`, `PolaroidRedAF` | not stated | Civ v 409 / 35 | Civ flags Img+Svc | Standard | 81.2 MB | Instant photo Look | Low–medium |
| Historic Color (AlekseyCalvin) — [HF](https://huggingface.co/AlekseyCalvin/HistoricColor_Z-image-Turbo-LoRA) | `Tongyi-MAI/Z-Image-Turbo` | Early colour photography, trained on 150 Prokudin-Gorsky photos (1900s–1910s) | `HST photo` | not stated | HF 30d 344; 8 likes | Apache-2.0 | Standard | 324.4 MB | New Look (see Novel) | Low–medium |

Catalog C: anime, illustration, drawing, pixel art, 3D, product, characters

| LoRA | Exact base | What it does | Trigger / prompt | Strength, steps | Popularity | Licence | Load | Size | Services | Conf. |
|---|---|---|---|---|---|---|---|---|---|---|
| Character Design Sheet (HELPER) (YeiYeiArt) — [Civitai](https://civitai.com/models/100435?modelVersionId=2500612) | `ZImageTurbo` | 3-view character sheet with colour palette; anime, semi-real or cartoon | `CharacterDesignIZT` + natural-language character description | not stated | Civ v 11,936 / 1,355; Civ m 102,052 / 11,495 | Civ flags Img+Svc+Sell | Standard | 162.2 MB | Character sheet, Characters, 3D models (Character figure input) | High |
| blueprint data sheet slider (oosayam) — [Civitai](https://civitai.com/models/264505) | `ZImageTurbo` | Multi-view design sheets or blueprints | `Industrial design, reference sheet, multiple views,` (characters: `Character Design Sheet, character reference sheet, character turn around`) | 1.5–2.5 | Civ v 3,246 / 284 | Civ flags Img | Standard | 162.2 MB | Character sheet, Text to 3D model input | Medium |
| [Z Image Turbo] Anime Style (hinablue) — [Civitai](https://civitai.com/models/2186398) | `ZImageTurbo` v2.52 | Anime illustration | `anime style, illustrious style` | not stated | Civ v 3,900 / 166 | Civ flags Img | Standard | 162.2 MB | Anime yourself, Anime cel Look | Medium |
| Retro Sci-fi 90's anime style (zura_janai) — [Civitai](https://civitai.com/models/912942) | `ZImageTurbo` | 90s sci-fi cel anime | `retro_scifi_90s, retro_artstyle, retro, cyberpunk,` | 0.6–0.8, best 0.8 | Civ v 3,780 / 400; Civ m 25,080 / 3,090 | Civ flags Img+Svc | Standard | 162.2 MB | Anime cel Look, Anime yourself | Medium–high |
| Neurocore Anime Shadow Circuit (ChronoKnight) — [Civitai](https://civitai.com/models/938811) | `ZImageTurbo` | Inked sci-fi anime illustration | `in the style of cksc,` | 0.9 | Civ v 5,859 / 729 | Civ-only flag | Standard | 162.2 MB | Anime cel Look, Wallpaper | Medium |
| Flat Color – Style (motimalu) — [Civitai](https://civitai.com/models/1132089) | `ZImageBase` v2.1 | Flat colour, no lineart, little depth | `flat color, no lineart` | not stated | Civ v 2,968 / 400; Civ m 54,206 / 6,054 | Civ flags Img+Svc | Standard | 166 MB | Explainer and Faceless frames, Slide visuals, Drawing Look | Medium–high |
| Saturday Morning Z (renderartist) — [HF](https://huggingface.co/renderartist/Saturday-Morning-Z-Image-Turbo) | `Tongyi-MAI/Z-Image-Turbo` | Modern American TV animation characters | `saturd4ym0rning` | not stated | HF 30d 456; 14 likes | Apache-2.0 | Standard | 71 MB | Cartoon yourself, Story video | Medium |
| Classic Painting Z (renderartist) — [HF](https://huggingface.co/renderartist/Classic-Painting-Z-Image-Turbo-LoRA) | `Tongyi-MAI/Z-Image-Turbo` | Old-master painting textures from public-domain Art Institute of Chicago works ("Artist names were not trained on") | none | 1,750-step file | HF 30d 3,517; 20 likes | Apache-2.0 | Standard | 162.2 MB | Oil painting Look, Gallery masterpiece | Medium |
| Eldritch Oil Painting / Sketch Painting (eldritchadam) — [Oil](https://civitai.com/models/2346929), [Sketch](https://civitai.com/models/2348587) | `ZImageBase` | Loose, realist oil painting; gestural sketch painting | `oil painting`; `Sketch Painting` | not stated | Civ v 817 / 109; 584 / 72 | Civ flags Img | Standard | 98.9 MB | Oil painting, Sketch Looks | Medium |
| Pencil sketch (Ttio2) — [HF](https://huggingface.co/Ttio2/Z-Image-Turbo-pencil-sketch) | `Tongyi-MAI/Z-Image-Turbo` | Pencil sketch art | none | not stated | HF 30d 426; 8 likes | Apache-2.0 | Standard | 162.2 MB | Sketch Look | Low–medium |
| Hyperdetailed Colored Pencil (ArsMachina) — [Civitai](https://civitai.com/models/1155749) | `ZImageTurbo` | Detailed coloured-pencil portraits | `ArsMJStyle, Colored pencil hyperdetailed realism` | ~0.8 | Civ v 3,229 / 317; Civ m 43,060 / 3,353 | Civ flags Img | Standard | 162.2 MB | Drawing, Portrait styles | Medium |
| Coloring Book Z (renderartist) — [HF](https://huggingface.co/renderartist/Coloring-Book-Z-Image-Turbo-LoRA) | `Tongyi-MAI/Z-Image-Turbo` | Coloring-book line art (synthetic dataset) | `c0l0ringb00k` | not stated | HF 30d 1,461; 24 likes | Apache-2.0 | Standard | 30.5 MB | Coloring book page | Medium |
| Children's Drawings (ostris) — [HF](https://huggingface.co/ostris/z_image_turbo_childrens_drawings) | `Tongyi-MAI/Z-Image-Turbo` | Any prompt as a child's drawing | none | not stated | HF 30d 2,166; 41 likes | Apache-2.0 | Standard | 162.2 MB | Just for fun (kid-drawing format) | Medium |
| Ink Wash – CE (CreativeEdge) — [Civitai](https://civitai.com/models/1464261) | `ZImageTurbo` (also `Krea 2`) | Ink wash painting | none | not stated | Civ v 731 / 73 | Civ flags Img | Standard | 162.2 MB | Ink sketch Look | Medium |
| Pixel Art Style (tarn59) — [HF](https://huggingface.co/tarn59/pixel_art_style_lora_z_image_turbo), [Civitai](https://civitai.com/models/1770073) | `Tongyi-MAI/Z-Image-Turbo` | Pixel art; lower strength gives finer pixels | `Pixel art style.` (prompts: scene, portrait, sprite) | 0.6–1.0 | HF 30d 12,905, 57 likes; Civ v 1,985 / 134 | Apache-2.0; Civ flags Img+Svc+Sell | Standard | 162.2 MB | Pixel art Look, 8-bit runner start frame | High |
| Pixel Art Refiner (luisa_caotica) — [Civitai](https://civitai.com/models/10706) | `ZImageTurbo` | Pixel-art filter | `pixel art` (at 1.2 no token needed) | 1.2 | Civ v 2,206 / 201 | Civ flags Img+Svc+Sell | Standard | 20.3 MB | Pixel art Look | Medium |
| Stickers.Redmond (artificialguybr) — [Civitai](https://civitai.com/models/144142) | `ZImageTurbo` | Sticker designs | `Sticker`, `Stickers` | not stated | Civ v 1,047 / 48 (Civ m 20,597 / 1,213) | Civ flags Img+Svc | Standard | 81.2 MB | Die-cut sticker | Medium |
| Clay Animation Redmond (artificialguybr) — [HF](https://huggingface.co/artificialguybr/ClayAnimation-Redmond-ZIMAGE); British Claymation (anyMODE) — [Civitai](https://civitai.com/models/2294777) | `Tongyi-MAI/Z-Image-Turbo`; `ZImageTurbo` | Clay animation stills | `Clay animation. Clay.`; `A claymation scene of ...` (+`toothy grin`) | not stated | HF 30d 196; Civ v 577 / 66 | Apache-2.0; Civ flags Img | Standard | 81.2 / 40.6 MB | Claymation still Look | Medium |
| 3D Render Style / Icons / Logo / Mockups – Redmond (artificialguybr) — [3D](https://huggingface.co/artificialguybr/3DRenderStyle-REDMOND-ZIMAGE), [Icons](https://huggingface.co/artificialguybr/ICONS-REDMOND-ZIMAGETURBO), [Logo](https://huggingface.co/artificialguybr/LOGO-REDMOND-ZIMAGETURBO), [Mockups](https://huggingface.co/artificialguybr/MOCKUPS-REDMOND-ZIMAGE) | `Tongyi-MAI/Z-Image-Turbo` | 3D render style; app icons; logos; product mockups | `3D Render Style. 3DRenderAF.`; `ICONS. ICREDM.`; `Logo`, `logoredmaf`; `Mockup.` | not stated | HF 30d 253 / 231 / 176 / 193 | Apache-2.0 | Standard ("recommend... ComfyUI") | 81.2 MB each | Logo, Product shot, Slide visuals, Low poly Look | Low–medium |
| Low Poly Style (PrettyAIGirls) — [Civitai](https://civitai.com/models/2204336) | `ZImageTurbo` | Low-poly 3D | `l0wp0ly` | not stated | Civ v 394 / 66 | Civ flags Img+Svc+Sell | Standard | 162.2 MB | Low poly Look | Low–medium |
| Retro 80s Vaporwave (ArsMachina) — [Civitai](https://civitai.com/models/1989095) | `ZImageTurbo` | VHS-cover vaporwave, grain and print texture ("a little bit overtrained") | `Retro 80s Vaporwave` | lower for cleaner | Civ v 1,535 / 195 | Civ flags Img | Standard | 162.2 MB | Vaporwave Look | Medium |
| Tilt Shift Photography Style (ThuckMaBaws) — [Civitai](https://civitai.com/models/2724424) | `ZImageTurbo` | Tilt-shift miniature; strength sets focus band | `tilt shift miniature style` | varies | Civ v 178 / 18 | Civ flags Img+Svc+Sell | Standard | 162.2 MB | Tilt shift miniature Look | Low |
| FISH EYE LENS – REDMOND; Telephoto / Fisheye Slider (Loraholic) — [Redmond](https://civitai.com/models/2424791), [Slider](https://civitai.com/models/2672837) | `ZImageTurbo` | Fisheye; slider from telephoto to fisheye | `Fish Eye Lens`; slider: no trigger ("fisheye" in prompt helps) | slider weight | Civ v 403 / 29; 654 / 45 | Civ flags Img+Svc; Img | Standard | 81.2 / 5.2 MB | Fisheye skate video Look, Cinematic cameras | Low–medium |

Catalog D: control sliders and helpers (ZIT)

| LoRA | Base | What | Use | Popularity | Licence | Size | Services |
|---|---|---|---|---|---|---|---|
| [ZIT] Detail Slider (alcaitiff) — [Civitai](https://civitai.com/models/2234266) | `ZImageTurbo` | More/less detail | −2…+2 ("Over 2 it may start to darken") | Civ v 25,836 / 1,407 | Img+Svc+Sell | 20.3 MB | Any Z-Image format |
| PhotoBOX_ZIT (vjleoliu) — [Civitai](https://civitai.com/models/2275756) | `ZImageTurbo` | Separate slider LoRAs: camera angle up/down, zoom in/out, aperture, low/high key, warm/cool, dark/light | e.g. angle −10 (low) … +10 (high) | angle v 2,492 / 182; Civ m 11,493 / 427 | Civ-only | 20–40.6 MB | Cinematic cameras (see Novel) |
| Facial Expressions (EauDeNoire) — [Civitai](https://civitai.com/models/541620) | `ZImageTurbo` v2.1 | Detailed emotions | add e.g. `worried`, `surprised`, `crying`, `Duck Face` | Civ v 5,278 / 321 | Civ-only | 162.2 MB | Character sheet (expressions), Thumbnail faces |
| Teeny Moody (AiMetatron) — [Civitai](https://civitai.com/models/2205459) | `ZImageTurbo` | Small "moody" expressions (pouts, sulks) of young adults (20+) | per page | Civ v 8,960 / 620 | Img+Svc | 324.4 MB | AI influencer post |
| ZIT Age Slider (adabot007) / THE age slider (Loraholic) — [1](https://civitai.com/models/2240908), [2](https://civitai.com/models/2533032) | `ZImageTurbo` | Age control | −2 … 1.0 (adabot) | Civ v 10,334 / 371; 4,476 / 214 | Svc; Img | 20.3 MB | Age progression (alt to Qwen). Caution: negative values reach child faces |
| Qinglong Detailed Eyes (bdsqlsz) — [HF](https://huggingface.co/bdsqlsz/qinglong_DetailedEyes_Z-Image) | `Tongyi-MAI/Z-Image-Turbo` | Eye detail | — | HF 30d 1,267; 38 likes | Apache-2.0 | — | Headshot, Portrait styles |

### Inferences
- Z-Image Turbo is the best-supported family here for realism, film looks and pixel art. If ComfyField wants LoRA-backed Looks before FLUX 3 Klein's ecosystem grows, Z-Image Turbo is the safest licence (Apache-2.0 base) and the cheapest runtime (8 steps, "fits 16 GB" per the lineup notes).
- Load: every Z-Image entry above is a plain LoRA file for `LoraLoaderModelOnly` unless marked. No Z-Image style LoRA page I opened asks for a special node. The exceptions are the alibaba-pai originals, which need their "-ComfyUI" converted files (Q5), and the LoKr file of AfterDark ZIB.
- Licence caution for a hosted product: many top Civitai Z-Image LoRAs do not set the "Svc" flag (Skin Texture, Amateur Photography, Melancholy, Cinematic Photography, PhotoBOX, Facial Expressions). Prefer Img+Svc entries (Realistic Snapshot, Lenovo, GrainScape, 2000s Analog Core, Character Design Sheet, Detail Slider, pixel art) or HF Apache-2.0 entries (renderartist, artificialguybr, AWPortrait-Z, ostris).

### Gaps
- No Z-Image typography or infographic LoRA surfaced in the keyword search; Z-Image's native text rendering was not tested here.
- No dedicated plush, brick-toy, game-show or product-photography LoRA for Z-Image surfaced (searches returned none).
- Turbo vs Base cross-compatibility is author-by-author; no systematic test exists.
- HF's `downloads` field is a 30-day count; Civitai counts are lifetime. They are not comparable.

---

## Q3a. Which Krea 2 (Raw / Turbo) LoRAs exist?

### Takeaway
Krea 2 has the deepest ecosystem of the four families, only four months after release. Civitai lists 7,842 SFW LoRAs, HF lists 1,000+ adapters each for Raw and Turbo, there are 9 official style LoRAs, and fal published a 1,503-LoRA style series. Uniquely, Krea 2 also has a community editing stack: identity edit, outfit transfer, style reference, inpaint, outpaint, lineart, pose, camera angles and storyboard grids. Many of these need Ostris's or lbouaraba's custom nodes. Train on Raw, run on Turbo is the official pattern. Two warnings apply: the Krea 2 licence caps commercial use at $1M revenue, and the best editing LoRA (Identity Edit) is non-commercial without the author's licence.

### Cited Findings
Ecosystem facts
- Comfy docs: "train LoRAs on RAW, run inference on Turbo... LoRAs trained on RAW apply seamlessly to Turbo"; RAW is 52 steps, Turbo 8 steps; the official template has a "CustomCombo (LoRA selector)" that pairs official style LoRAs with their trigger words — [Comfy Krea 2 docs](https://docs.comfy.org/tutorials/image/krea/krea-2.md)
- Counter-example: Danrisi on 2000s Analog Core (Krea 2): "works with raw and seems like doesnt work with turbo" — [Civitai 1134895](https://civitai.com/models/1134895)
- Civitai SFW LoRAs under `Krea 2` on 2026-10-19: 7,842 — [Civitai API](https://civitai.com/api/v1/models?types=LORA&baseModels=Krea%202&nsfw=false)
- HF adapters: the API returns its 1,000-item cap for both `krea/Krea-2-Raw` and `krea/Krea-2-Turbo` (true count higher) — [HF API Raw](https://huggingface.co/api/models?filter=base_model:adapter:krea/Krea-2-Raw), [HF API Turbo](https://huggingface.co/api/models?filter=base_model:adapter:krea/Krea-2-Turbo)
- fal series: "1503 style LoRAs for Krea 2, trained on fal", each with a ComfyUI-compatible file; index repo has 201 likes — [ilkerzgi/fal-Krea-2-Style-LoRAs](https://huggingface.co/ilkerzgi/fal-Krea-2-Style-LoRAs) (one member card says "One of 1600+" — [grainy-nineties-film](https://huggingface.co/ilkerzgi/krea-2-grainy-nineties-film-lora); counts conflict)
- Official Krea collection has 9 LoRAs (retroanime, sunsetblur, vintagetarot, rainywindow, darkbrush, dotmatrix, neondrip, kidsdrawing, softwatercolor) — [HF collection API](https://huggingface.co/api/collections/krea/krea-2-loras)
- Trainers: ai-toolkit (Krea 2, Krea 2 Turbo, and "Krea 2 Edit Training") — [ai-toolkit README](https://github.com/ostris/ai-toolkit); musubi-tuner (Krea 2 with `--turbo_lora`, ConvRot int8) — [musubi-tuner README](https://github.com/kohya-ss/musubi-tuner); SimpleTuner lists Krea2 with licence "Yes (under $1M revenue; safeguards required)" — [SimpleTuner README](https://github.com/bghira/SimpleTuner)
- Many of the most-downloaded Krea 2 Raw adapters on HF are real-person packs (excluded) — [HF API list](https://huggingface.co/api/models?filter=base_model:adapter:krea/Krea-2-Raw&sort=downloads)

Catalog A: official Krea 2 style LoRAs (all: base "To be used on `krea/Krea-2-Turbo`", "Trained on `krea/Krea-2-Raw`"; previews at Turbo 8 steps, guidance 0.0, weight 1.0; Krea 2 Community License; 447.6 MB each; standard LoRA, and the Comfy template has a trigger selector) — [example card](https://huggingface.co/krea/Krea-2-LoRA-retroanime)

| LoRA | Trigger | HF 30d / likes | ComfyField services |
|---|---|---|---|
| [retroanime](https://huggingface.co/krea/Krea-2-LoRA-retroanime) | `Purple retro anime style` | 2,605 / 66 | Anime cel Look, Anime yourself |
| [darkbrush](https://huggingface.co/krea/Krea-2-LoRA-darkbrush) | `monochrome ink wash style` | 2,414 / 27 | Ink sketch Look |
| [softwatercolor](https://huggingface.co/krea/Krea-2-LoRA-softwatercolor) | `Art Deco watercolor style` | 1,652 / 16 | Watercolor Look, Explainer frames |
| [vintagetarot](https://huggingface.co/krea/Krea-2-LoRA-vintagetarot) | `vintage tarot style` | 1,167 / 30 | Winning card, card formats |
| [rainywindow](https://huggingface.co/krea/Krea-2-LoRA-rainywindow) | `rainy window style` | 1,097 / 10 | Moodboard presets, Wallpaper |
| [kidsdrawing](https://huggingface.co/krea/Krea-2-LoRA-kidsdrawing) | `naive expressive sketch style` | 990 / 14 | Just for fun |
| [neondrip](https://huggingface.co/krea/Krea-2-LoRA-neondrip) | `Textured abstract style` | 904 / 17 | Wallpaper |
| [sunsetblur](https://huggingface.co/krea/Krea-2-LoRA-sunsetblur) | `ethereal motion blur style` | 776 / 17 | Slow shutter-type stills |
| [dotmatrix](https://huggingface.co/krea/Krea-2-LoRA-dotmatrix) | `Monochrome stippling style` | 743 / 14 | Drawing, Ink sketch |

Catalog B: editing and control adapters (mostly custom nodes)

| Adapter | Exact base | What it does | Prompt / settings | Popularity | Licence | ComfyUI loading | Size | Services | Conf. |
|---|---|---|---|---|---|---|---|---|---|
| Krea 2 Identity Edit V2 + General Edit V2 (conradlocke) — [HF](https://huggingface.co/conradlocke/krea2-identity-edit), [Civitai](https://civitai.com/models/2761113) | `krea/Krea-2-Raw` | Identity: "one photo of a person in, that person anywhere out". General: remove, recolor, relight, swap backgrounds, rewrite text, change outfits. v1.2 adds character sheets, head/face swap, outpaint, inpaint, try-on | plain-language edit; nodes add `ref_boost` (try 2–6) and reference placement; "Use one LoRA per task" | HF 30d 153,255, 867 likes; Civ v1.2 24,289 / 1,083; v2.0 (2026-10-16) 2,251 / 232; Civ m 31,081 / 1,372 | **"free for personal / non-commercial use; commercial use needs a license from me"** (Civitai flags say Img+Svc: conflict) | **Special:** needs `comfyui-krea2edit` ≥ 2.0.0 ([repo](https://github.com/lbouaraba/comfyui-krea2edit)) | 1,743.6 MB (r128 871.8, r64 435.9) | Character in any scene, AI influencer post, Character swap, Face swap, Professional headshot, Profile picture, Fashion factory, Background changer, Inpaint, Relight | High quality signal; licence blocks commercial use |
| Krea 2 Edit Outfit Transfer (AliveAi) — [HF](https://huggingface.co/AliveAi/Krea-2-Edit-Outfit-Transfer) | `krea/Krea-2-Raw` | Transfers clothing from a reference image, keeps the character | trigger phrase `edit, outfit, clothes` | HF 30d 3,270; 97 likes | not stated | **Special:** `comfyui-krea2edit` or `ComfyUI-Krea2-Ostris-Edit` | 1,089.7 MB | Fashion factory, Try on outfits, Outfit swap, Virtual stylist | Medium |
| Krea 2 Style Reference (ostris) — [HF](https://huggingface.co/ostris/krea2_turbo_style_reference) | `krea/Krea-2-Turbo` | Generates in the style of a reference image; "thousands of hand curated style pairs" | no trigger; image + prompt | HF 30d 6,116; 127 likes | Krea 2 Community | **Special:** "you will need this custom node. [ComfyUI-Krea2-Ostris-Edit]" | 435.9 MB | Moodboard, Match a moodboard, Copy a style | Medium–high |
| Krea 2 AnyPaint (yijunwang2) — [HF](https://huggingface.co/yijunwang2/krea2-anypaint) | `krea/Krea-2-Turbo` | Arbitrary-mask inpaint, outpaint and edit | original prompts | HF 30d 9,115; 38 likes | Krea 2 Community | **Special:** "LoRA importers are not compatible with this functional adapter"; own ComfyUI nodes | 218 MB | Inpaint, Expand, Erase an object | Medium |
| Krea 2 ReID Reference (yijunwang2) — [HF](https://huggingface.co/yijunwang2/krea2-reid) | `krea/Krea-2-Turbo` (works with Raw) | Keeps a reference identity; prompt changes clothes, pose, scene | — | HF 30d 2,679; 40 likes | Krea 2 Community (+Apache code) | **Special:** Ostris custom nodes with reference K/V caching on | 218 MB | Character in any scene (alt to Identity Edit) | Medium |
| Krea 2 Anygles (yijunwang2) — [HF](https://huggingface.co/yijunwang2/krea2-anygles) | `krea/Krea-2-Turbo` | New camera view of a person (orbit, elevation, distance) from one image, keeping pose, clothes and scene; uses an aligned 3D human normal | short camera instruction | HF 30d 2,275; 22 likes | Krea 2 Community | **Special:** "LoRA loaders do not provide the spatial-control input"; own nodes | 218.7 MB | Any angle (people), Character sheet, Shot grid | Medium |
| Krea 2 Registered Outpaint (yijunwang2) — [HF](https://huggingface.co/yijunwang2/krea2-outpaint) | `krea/Krea-2-Turbo` | Outpaint with registration | — | HF 30d 1,849; 49 likes | Krea 2 Community | **Special** (as above) | 218 MB | Expand | Medium |
| Krea 2 inpaint edit (Cierpliwy) — [HF](https://huggingface.co/Cierpliwy/krea2-inpaint-edit) | `krea/Krea-2-Raw` | Inpaint by filling the region black + prompt; v2 also outpaints | — | HF 30d 2,718; 30 likes | Krea 2 Community | Edit workflow (Ostris nodes per family) | 435.9 MB (rank 64) | Inpaint, Erase an object | Medium |
| Krea 2 lineart edit (Cierpliwy) — [HF](https://huggingface.co/Cierpliwy/krea2_lineart_edit) | `krea/Krea-2-Raw` | Lineart sketch to finished image, follows the lines | prompt = final look | HF 30d 1,518; 26 likes | Krea 2 Community | **Special:** `ComfyUI-Krea2-Ostris-Edit` + Realistic Lineart preprocessor | 435.9 MB | Sketch to image, Sketch to video first frame | Medium |
| Krea2 Turbo OpenPose ControlNet LoRA (thedeoxen) — [HF](https://huggingface.co/thedeoxen/Krea-2-pose-controlnet) | `krea/Krea-2-Turbo` | Follows an OpenPose/DWPose skeleton | no trigger | 0.8–1.0 (0.6–0.8 if rigid), ~10 steps, CFG ~1, euler/simple | HF 30d 12,445; 120 likes | Apache-2.0 | **Special:** Krea2 Ostris Edit nodes + DWPose (comfyui_controlnet_aux) | 218 MB | Character sheet (poses), Fashion factory poses, Photodump poses | Medium–high |
| Anime to Realism (MengY_Madrigal) — [Civitai](https://civitai.com/models/2783657) | `Krea 2` (Krea2Edit) | Converts anime images to adult cosplay photos, same composition | long instruction (on page) | Civ v 4,106 / 321 | Civ flags Img+Svc+Sell | **Special:** Ostris edit node, `kv_cache` ON | 218 MB | Reverse of Anime yourself | Medium |
| Cinematic Storyboard Generator `sbgrid` (peculiar) — [HF](https://huggingface.co/peculiar/sbgrid) | `krea/Krea-2-Raw` | Coherent 6- or 8-panel cinematic storyboards from character, environment and visual references | `sbgrid`, `eight panel storyboard` / `6 panel storyboard` | not stated | HF 30d 88; 23 likes | not stated | Needs a reference-capable workflow per card | 218 MB | Storyboard, 9 shots from one image, Shot grid | Low–medium |

Catalog C: realism, influencer, film, cinematic (Krea 2)

| LoRA | Exact base | What it does | Trigger / prompt | Strength, steps | Popularity | Licence | Load | Size | Services | Conf. |
|---|---|---|---|---|---|---|---|---|---|---|
| Phone Photography (2000–2025) (vizsumit) — [Civitai](https://civitai.com/models/2537408) | `Krea 2` (4 versions: 2025, 2020, 2007, 2000) | Phone photos by era: 2025 modern AI-enhanced; 2020 low-end phone; 2007/2000 noisy early camera phones. "All have basic NSFW capabilities" | 2025: `This is a candid photograph taken with a smartphone of ...`; 2020: `This is a candid photograph taken with a low-end smartphone of ...`; 2007: `An amateur low-quality photo with visible noise, soft focus and dull colors.` | not stated | Civ v 2025: 7,905 / 386; 2020: 4,023 / 192; 2007: 2,520 / 137; 2000: 1,713 / 91 | Civ flags Img+Svc+Sell | Standard | 218 MB each | AI influencer page, Photodump, Phone flash at night, AI influencer post | High |
| Realistic Snapshot – Krea 2 (MonkeyForever) — [Civitai](https://civitai.com/models/2268008?modelVersionId=3371723) | `Krea 2` v1.0 (2026-10-05); v0.5 37,888 / 1,692 | Smartphone snapshot realism, retrained on 600 images ("leans more on modern iPhone photos and includes a lot more NSFW material") | none | 1.5 best, up to 2.0 ("1.0 does little") | Civ v 8,901 / 564 | Civ flags Img+Svc+Sell | Standard | 1,490 MB (v0.5: 218) | AI influencer page, Photodump | High (needs content filter) |
| Lenovo UltraReal – Krea2 (Danrisi) — [Civitai](https://civitai.com/models/1662740?modelVersionId=3075606) | `Krea 2` | Phone realism | (Z version used `l3n0v0`) | 0.8 on Raw (CFG 4); 1.2–2 on Turbo; fast: Raw CFG 1 + turbo LoRA | Civ v 38,060 / 1,514 | Civ flags Img+Svc+Sell | Standard | 109 MB | AI human, AI influencer, Photodump | High |
| Krea 2 Realism LoRA (gokaygokay) — [HF](https://huggingface.co/gokaygokay/Krea-2-Realism-LoRA) | `krea/Krea-2-Raw`, `krea/Krea-2-Turbo` | Natural, candid, true-to-life photos without "8k/DSLR" keywords | no trigger; one long descriptive sentence | Turbo 8 steps, guidance 0.0 | HF 30d 13,587; 100 likes | Krea 2 Community | Standard (also fal endpoint) | 447.5 MB | AI human, Create image | High |
| Krea2-realism-V2 (RudySen) — [HF](https://huggingface.co/RudySen/Krea2-realism-V2) | `krea/Krea-2-Turbo` | Better texture, light, faces ("no more death stares") | natural language, 4–5 sentence paragraph | 1.0; author prefers 1.5–2.0 | HF 30d 23,454; 207 likes | MIT tag (Krea base licence still applies) | Standard | 1,490 MB | AI human, AI influencer | High |
| Canon UltraReal (Danrisi) — [Civitai](https://civitai.com/models/2783143) | `Krea 2` | Canon 1Ds colour and bokeh from the author's own photos (28/50/100/500 mm) | `c2n0n` + detailed prompt | not stated for Krea | Civ v 7,381 / 416 | Civ flags Img+Svc+Sell | Standard | 109 MB | Cinematic cameras (lens look), Golden hour editorial | Medium–high |
| PureLens Realism (goldennyks76) — [Civitai](https://civitai.com/models/2728005) | `Krea 2` | Clean natural realism from RAW-converted (DNG/ARW/CR2/NEF) photos, not studio | `purelens` | not stated | Civ v 9,143 / 392 | Civ flags Img+Svc+Sell | Standard | 327 MB | AI human, Create image | Medium |
| [KREA 2] Amateur Slider (alcaitiff) — [Civitai](https://civitai.com/models/2773343) | `Krea 2` | −2 clean professional … +2 amateur noise and compression | slider | −2…3 (+2 typical) | Civ v 9,328 / 454 | Civ flags Img+Svc+Sell | Standard | 6.4 MB | AI influencer page "phone" dial, Photodump | High |
| Smartphone Photography Slider (reverentelusarca) — [Civitai](https://civitai.com/models/2796343) | `Krea 2` | Pushes toward amateur phone photos and natural skin | slider | 1.0–2.0 | Civ v 5,518 / 335 | Civ flags Svc | Standard | 27.3 MB | AI influencer page | Medium |
| Candid Slider (Loraholic) — [Civitai](https://civitai.com/models/2774295) | `Krea 2` | Less posed ("beta"; author unsure) | slider | per page | Civ v 9,305 / 469 | Civ flags Img | Standard | 13.7 MB | Photodump | Low–medium |
| Krea 2 Natural Expressions v2 (Guillaume127) — [Civitai](https://civitai.com/models/2877049) | `Krea 2` (for Turbo) | Micro-expressions (laughs, smirks, tired looks) and candid framing; fixes "stiff, robotic face" | none | 0.6–1.0 | Civ v 3,568 / 236 | Civ flags Img+Svc | Standard | 218 MB | AI influencer post, Photodump, AI human | Medium–high |
| Disposable Camera (MyNameIsThis) — [Civitai](https://civitai.com/models/2764401) | `Krea 2` | 35 mm disposable scan: grain, harsh flash, blown highlights | `DisposableCamera, Film grain, Heavy Film grain` | not stated | Civ v 2,719 / 190 | Civ flags Img+Svc+Sell | Standard | 218 MB | Disposable camera Look, Phone flash at night | Medium |
| The Lightbox – photography styles (LolTurdFerguson) — [Civitai](https://civitai.com/models/2909179) | `Krea 2` (one LoRA per version) | Grain 35 (90s–2000s consumer 35 mm, hard flash) `gr@in35`; Ruin flash photography `ruin flash photography`; Kodacolor II `k0dacolor2`; Autochrome `aut0chr0me`; Warm Vintage `w@rmvint@g3`; Infrared `infr4red style`; Cinematic Concept `cinem@shot`; Silverlight Studio `qxbrume` | as listed | Ruin: 1.0, 8–10 steps Turbo, er_sde or euler/simple; Atmospheric Hybrid 0.75 | Civ v Grain 35 782 / 89; Cinematic Concept 545 / 71; Kodacolor II 626 / 59; Ruin 430 / 45 | Civ flags Img | Standard | 218 MB each | 70s film stock, Disposable camera, Instant photo, Film noir Looks; Cinematic cameras film menu | Medium |
| Retro Vintage Photo (patrik) — [Civitai](https://civitai.com/models/2380695) | `Krea 2` (and `ZImageBase`) | 1950s–early-90s found-photo look from Internet Archive amateur and pro photos | none | Krea 0.7–1.2; ZIB 0.7–1.0 | Civ v 3,172 / 243 | Civ flags Img+Svc+Sell | Standard | 223.8 MB | 70s film stock, Photodump (vintage) | Medium |
| Polaroid Spirit (uncropped) — [Civitai](https://civitai.com/models/1045356) | `Krea 2` | Vintage Polaroid | `Polaroid` in prompt | 0.5–1.0 | Civ v 650 / 68 | Civ flags Svc | Standard | 218 MB | Instant photo Look | Medium |
| Cinematic Shot ✨ – Krea 2 (ZyloO) — [Civitai](https://civitai.com/models/432586?modelVersionId=3085969) | `Krea 2` | Cinematic grade | `zy_cinematic` (or "cinematic, cinematic still image") | not stated | Civ v 9,709 / 782 | Civ flags Img | Standard | 218 MB | Cinematic cameras, Faceless frames | High |
| [KREA 2] Afterlight (alcaitiff) — [Civitai](https://civitai.com/models/2776767) | `Krea 2` | Low warm sun, glow, creamy blur, haze | none | low = polish, high = dreamy | Civ v 6,432 / 507 | Civ flags Img+Svc+Sell | Standard | 109 MB | Golden hour editorial Look | High |
| Grainy Nineties Film (ilkerzgi, fal series) — [HF](https://huggingface.co/ilkerzgi/krea-2-grainy-nineties-film-lora) | `krea/Krea-2-Turbo` | 90s film grain | `... grainy nineties film style` (end of prompt) | 1.0–1.25 | HF 30d 480; 4 likes | Krea 2 Community | Standard (`-comfy` file) | 223.8 MB | 70s film stock-type Looks | Medium |
| 80s Fantasy Movie – Krea2 (ArsMachina) — [Civitai](https://civitai.com/models/789313?modelVersionId=3091396) | `Krea 2` (trained on Raw) | 80s fantasy film stills | `ArsMovieStill, 80s Fantasy Movie Still,` | not stated | Civ v 3,127 / 344 | Civ flags Img | Standard | 218 MB | Cinematic cameras, Storyboard | Medium |
| V0id (skbv0) — [Civitai](https://civitai.com/models/2559636) | `Krea 2` | Moody, poster-like light, haze, flare | none | not stated | Civ v 3,140 / 278 | Civ flags Img+Svc+Sell | Standard | 435.9 MB | Thumbnail backgrounds, Posters | Medium |
| M87 (mgwr) — [HF](https://huggingface.co/mgwr/M87), [Civitai](https://civitai.com/models/2761579) | `krea/Krea-2-Turbo` | Early-preview aesthetic: composition, light, atmosphere | `--preview` | not stated | HF 30d 782, 221 likes; Civ v 3,815 / 367 | Apache-2.0 tag; Civ flags Img+Svc | Standard | 218 MB | Create image (aesthetic default) | Medium |

Catalog D: illustration, anime, toys, stickers, pixel, 3D, sheets, sliders (Krea 2)

| LoRA | Exact base | What | Trigger / prompt | Strength | Popularity | Licence | Load | Size | Services |
|---|---|---|---|---|---|---|---|---|---|
| Aesthetic Quality Modifiers – Masterpiece (motimalu) — [Civitai](https://civitai.com/models/929497) | `Krea 2` (trained on Raw with diffusion-pipe) | General aesthetic boost, anime-leaning | `masterpiece, very aesthetic` | 1.5 on Turbo | Civ v 13,349 / 953; Civ m 172,985 / 12,278 | Civ flags Img+Svc | Standard | 204.8 MB | Anime cel, Drawing |
| Niji Sweet Spot (ZaeY) — [Civitai](https://civitai.com/models/2554999) | `Krea 2` v2_A | Semi-real anime portraits, emissive eyes (from MJ Niji v7 images) | `@NJSW33T` | not stated | Civ v 3,631 / 342 | Civ flags Img+Svc | Standard | 218 MB | Anime yourself (portraits) |
| Line Art Anime Flat (nnegret) — [Civitai](https://civitai.com/models/2741033) | `Krea 2` v2 / v3 (2026-10-19) | Flat anime with clean lines | v3 `linanime` (v2 `线条动漫`) | 0.6–0.9, CFG 1, 8–10 steps, ErSde; add `平涂` if too glossy | Civ v2 2,413 / 181 | Civ flags Img+Svc+Sell | Standard | 218 MB | Anime cel Look, Coloring-book style |
| ta86_inkriot (tehalex86) — [Civitai](https://civitai.com/models/2827717) | `Krea 2` | Bold-outline cel shading, game-inspired | `ta86_inkriot, graphic cel shading, bold black outlines` | 0.7–1.0 (2.0 without trigger) | Civ v 3,676 / 588 | Civ flags Svc | Standard | 218 MB | Video game style, Comic book |
| Nix Comic v2 (xFennec777) — [Civitai](https://civitai.com/models/2836231) | `Krea 2` | Comic base mixing 90s animation and 2000s comics looks | none | 0.7–0.85 | Civ v 2,084 / 185 | Civ flags Svc | Standard | 218 MB | Comic book Look, Comic story |
| Friendly Sketch (arsibalt) — [Civitai](https://civitai.com/models/2756662) | `Krea 2` Painter.V2 | Warm, friendly illustration; v2 looks at the viewer | none | 1.0 | Civ v 1,891 / 131 | Civ flags Img+Svc+Sell | Standard | 218 MB | Drawing, Cartoon yourself, Explainer frames |
| Cartoon World (Daalis) — [Civitai](https://civitai.com/models/2841962) | `Krea 2` | Odd storybook cartoon world | `ToonDaal` | not stated | Civ v 956 / 145 | Civ flags Img | Standard | 218 MB | Cartoon yourself, Story video |
| Hyperdetailed Colored Pencil – Krea2 (ArsMachina) — [Civitai](https://civitai.com/models/1155749) | `Krea 2` | Coloured pencil portraits | `ArsMJStyle, Colored pencil hyperdetailed realism,` | ~0.8 (Z) | Civ v 2,835 / 288 | Civ flags Img | Standard | 218 MB | Drawing, Portrait styles |
| Purple Graphics – Poster (purplelady) — [Civitai](https://civitai.com/models/2326705) | `Krea 2` (ZIT version too, 0.8–1.2) | Graphic poster style | none | not stated for Krea | Civ v 4,135 / 546 | Civ flags Img | Standard | 218 MB | Posters and social graphics, Thumbnail backgrounds |
| Typnosis – Typography (skbv0) — [Civitai](https://civitai.com/models/2840653) | `Krea 2` | 3D, material and experimental type | none | low = subtle | Civ v 409 / 40 | Civ flags Img+Svc | Standard | 435.9 MB | Thumbnail titles, Posters, Banner |
| Krea 2 Pixel Art 32/64/128 (e-n-v-y) — [HF](https://huggingface.co/e-n-v-y/Krea-2-Pixel-Art) | `krea/Krea-2-Raw` | Pixel art at three grid sizes | `pixel art` (64 best without) | generate at 1024×1024; post-process with [Krea2 Pixel Art Refiner node](https://github.com/envy-ai/ComfyUI-Krea2-Pixel-Art-Refiner) | HF 30d 3,478; 43 likes | MIT tag | Standard (+optional node) | 71 MB | Pixel art Look, 8-bit runner |
| Krea 2 PixelArt 16x16 (Angais) — [HF](https://huggingface.co/Angais/Krea-2-PixelArt-16x16) | `krea/Krea-2-Raw` (run on Turbo) | One 16×16 game icon per image on flat magenta for colour-key removal | `pixel art 16x16 game icon, <item>, dark outline, plain magenta background` | 512×512, 8 steps (6 ok), guidance 0 | HF 30d 92; 5 likes | Krea 2 Community | Standard | 218 MB | Game from a prompt assets (see Novel) |
| Krea 2 Emoji (linoyts) — [HF](https://huggingface.co/linoyts/Krea2-emoji-LoRA) | `krea/Krea-2-Turbo` (trained on Raw) | Glossy 3D emoji isolated on white | end prompt with `3d emoji` | 8 steps, guidance 0 | HF 30d 458; 1 like | "other" | Standard | 183 MB | Die-cut sticker, Tiny creature |
| [KREA 2] Sticker (alcaitiff) — [Civitai](https://civitai.com/models/2811890) | `Krea 2` | Stickers from subject + "sticker" | `sticker` | not stated | Civ v 977 / 90 | Civ flags Img+Svc+Sell | Standard | 218 MB | Die-cut sticker |
| Isometric skeuomorphic 3D (linoyts) — [HF](https://huggingface.co/linoyts/krea2-isometric-3d-lora) | `krea/Krea-2-Raw` | Isometric 3D icon style (default look) | `isometric skeuomorphic 3D` (not required) | run on Turbo | HF 30d 288; 8 likes | Apache-2.0 | Standard | 95.5 MB | Slide visuals, Low poly / 3D Looks, Tiny creature |
| 3D Render Style (goofyai) — [HF](https://huggingface.co/goofyai/3D-Render-Style-Krea2) | `krea/Krea-2-Raw` | 3D render style | `3d render of` | 0.7–1.0 | HF 30d 212 | "krea2" | Standard | 218 MB | Plush / toy-type Just for fun |
| PSX Style (ExtraChromosome) — [Civitai](https://civitai.com/models/707972) | `Krea 2` (trained on Raw) | Late-90s low-poly game look | `3D low-poly CGI-render` (+`3D, low-poly, render, pixelated`) | 1.3 (tested 1–1.5) | Civ v 897 / 67 | Civ flags Img+Svc | Standard | 109 MB | Low poly Look, Video game style |
| Claymation Style (AiMamis) — [Civitai](https://civitai.com/models/2803827) | `Krea 2` | Stop-motion clay | `Claymation style` | not stated | Civ v 356 / 33 | Civ flags Img+Svc+Sell | Standard | 435.9 MB | Claymation still Look |
| CRT Vaporwave (HackAfterDark); Retro 80s Vaporwave (ArsMachina) — [CRT](https://civitai.com/models/2856432), [80s](https://civitai.com/models/1989095) | `Krea 2` | CRT/RGB-split vaporwave; VHS-cover vaporwave | `crtvaporwave`; `Retro 80s Vaporwave,` | not stated | Civ v 855 / 151; 676 / 93 | Img+Svc; Img | Standard | 218 MB | Vaporwave Look |
| V67 Tilt-Shift and Diorama (angelomaiota) — [Civitai](https://civitai.com/models/2560633) | `Krea 2` | Miniature, selective focus | `(Tilt-shift:1.4), miniature effect, tilt-shift lens, ...` | not stated | Civ v 176 / 24 | Civ flags Img+Svc+Sell | Standard | 218 MB | Tilt shift miniature Look |
| Krea 2 Fisheye Perspective Slider (baizuobusi) — [Civitai](https://civitai.com/models/2981004) | `Krea 2` | Flat perspective → strong fisheye | slider | weight | Civ v 462 / 46 | Civ-only | Standard | 27.3 MB | Fisheye skate video Look |
| Character sheet Helper (LOREVER) — [Civitai](https://civitai.com/models/2933017) | `Krea 2` | Same character from several angles (full body) | `FBcs` + precise description, neutral pose | start 0.6; trained at 2048×1363 | Civ v 3,614 / 259 | Civ-only | Standard | 218 MB | Character sheet, Character figure (3D input) |
| [KREA 2] Detail / Realism / Warm Light sliders (alcaitiff) — [Detail](https://civitai.com/models/2729908), [Realism](https://civitai.com/models/2781697) | `Krea 2` | Detail; illustration (−) to realism (+); warm light | slider | — | Civ v 24,493 / 1,150; 10,985 / 544; Warm Light 2,911 / 179 | Img+Svc+Sell | Standard | 6.4–11 MB | Any Krea format; Realism slider = "AI human" vs "drawing" dial |

### Inferences
- For a ComfyField that already uses Krea 2 Raw ("AI human"), Krea 2 can host most influencer, film and illustration Looks today. Its editing adapters could replace several Qwen-based edit formats. The catch: nearly all editing adapters need Ostris's or lbouaraba's nodes, so Comfy Cloud support must be checked.
- The single most powerful Krea 2 asset for ComfyField (Identity Edit) cannot be used commercially without a licence from its author. A cheaper path is yijunwang2 ReID (Krea 2 Community licence) or FLUX 3 Klein multi-reference.

### Gaps
- Not checked: whether Comfy Cloud has `ComfyUI-Krea2-Ostris-Edit`, `comfyui-krea2edit` or yijunwang2's nodes (likely not, given Cloud's custom-node limits). This decides whether the editing adapters are usable on Cloud or only on a RunPod Pod.
- The top HF Krea 2 Raw adapter by 30-day downloads (`fidel1234/Krea2_Asian_Character`, 479,671) was not opened; its content is unknown.
- AliveAi Outfit Transfer and peculiar sbgrid state no licence.
- Krea 2 Raw vs Turbo LoRA transfer: official docs say "seamless", but at least one author reports a LoRA that fails on Turbo.

---

## Q3b. Which HiDream-O1 LoRAs exist?

### Takeaway
Almost none of value. HF has zero adapters tagged to `HiDream-ai/HiDream-O1-Image` (one empty-download adapter on Dev). Civitai has 30 SFW `HiDream-O1` LoRAs, and none passes 200 version downloads. The only useful ones are Kijai's Dev-distillation LoRAs (speed and strength control), plus a handful of experimental realism and anime styles. HiDream-O1 should be used as a base model, not a LoRA platform.

### Cited Findings
- HF: 0 adapters for `HiDream-ai/HiDream-O1-Image`; 1 for `HiDream-ai/HiDream-O1-Image-Dev` (`CompiwerAI/Mtrini-Imagine-1.0-7B`, 0 downloads) — [HF API](https://huggingface.co/api/models?filter=base_model:adapter:HiDream-ai/HiDream-O1-Image); HF search shows only quantised repacks (Comfy-Org, drbaph, mlx-community) — [HF search](https://huggingface.co/api/models?search=hidream-o1&sort=downloads)
- A separate `HiDream-ai/HiDream-O1-Image-Dev-2604` checkpoint exists (created 2026-05-13, 95 likes) — [HF search](https://huggingface.co/api/models?search=hidream-o1&sort=downloads); a LoRA author warns "HIDREAM LORA DOES NOT WORK WITH 2604" — [RebelReal](https://civitai.com/models/2181922)
- Comfy docs: "the Dev distillation can also be applied to the Full model as a LoRA, allowing you to adjust the distillation strength (by Kijai)": `hidream_o1_dev_lora_rank_64_bf16` (full), a pruned variant, and `hidream_o1_image_dev_2604_lora_avg_rankg_224_bf16` ("Alternative checkpoint-based distillation") — [Comfy HiDream-O1 docs](https://docs.comfy.org/tutorials/image/hidream/hidream-o1.md); sizes 418.5 / 334.6 / 1,269 MB; repo 26 likes — [Kijai/hidream-O1-image_comfy](https://huggingface.co/Kijai/hidream-O1-image_comfy)
- Civitai SFW count under `HiDream-O1`: 30 — [Civitai API](https://civitai.com/api/v1/models?types=LORA&baseModels=HiDream-O1&nsfw=false)
- Trainers: ai-toolkit lists `HiDream-ai/HiDream-O1-Image (HiDream O1)` — [ai-toolkit README](https://github.com/ostris/ai-toolkit); musubi-tuner has `docs/hidream_o1.md` — [musubi-tuner README](https://github.com/kohya-ss/musubi-tuner)

Catalog: HiDream-O1 (all `HiDream-O1` on Civitai, MIT base)

| LoRA | What | Trigger / prompt | Strength / settings | Popularity (Civ v) | Licence flags | Size | Services | Conf. |
|---|---|---|---|---|---|---|---|---|
| Kijai HiDream-O1 Dev distill LoRAs — [HF](https://huggingface.co/Kijai/hidream-O1-image_comfy) | Dev distillation as a LoRA on Full; adjustable strength | none | per Comfy template | repo 26 likes | MIT (base) | 418.5 / 334.6 / 1,269 MB | Speed for any HiDream-O1 format | High (official docs) |
| Wanderer's Detailed Portraits – HiDream-O1 (ImWanderer) — [Civitai](https://civitai.com/models/1501328?modelVersionId=2965718) | Detailed portraits | `D3tailedP0rtraits` | 0.5–1.0 | 106 / 8 | Img+Svc+Sell | 168.3 MB | Portrait styles, Headshot | Low |
| RebelReal – HiDream-O1 (realrebelai) — [Civitai](https://civitai.com/models/2181922?modelVersionId=2971945) | Aesthetic booster and enhancer, slight dynamic light | none | 0.2–0.8 (0.4–0.7 sweet spot); "INCREDIBLE" at 2048×2048; not for Dev-2604 | 99 / 5 | Img+Svc+Sell | 168.3 MB | Create image | Low |
| RebelMidjourney – HiDream-O1 (realrebelai) — [Civitai](https://civitai.com/models/2224836?modelVersionId=2974125) | Midjourney-like aesthetic | none | 0.2–0.8; 2048×2048 | 60 / 3 | Img+Svc+Sell | 168.3 MB | Create image | Low |
| AIM – Clear Anime (aimann) — [Civitai](https://civitai.com/models/2639335) | Clean anime (author's first LoRA) | v3: `cl34ran1m3` | not stated | v3 39 / 2; v2.07 44 / 5 | Img+Svc+Sell | 342.9 MB | Anime cel Look | Low |
| HiDream O1 – noir lighting style (mymax) — [Civitai](https://civitai.com/models/2647859) | High contrast, crushed shadows, vivid colour, depth of field (65 images) | `vivid-noir-depth` | not stated | 45 / 3 | no commercial flags set | 168.3 MB | Film noir Look | Low |
| Stained-Glass Cloth / Holographic Cloth (shadeling1972394) — [1](https://civitai.com/models/2744436), [2](https://civitai.com/models/2749581) | "World morph" material concepts | `Stained-Glass Cloth` / `Holographic Cloth` | not stated | 25 / 1; 28 / 0 | Civ-only | 168.3 MB | Effects start frames | Low |
| 沙雕动画 – HiDream-O1 (updatemp) — [Civitai](https://civitai.com/models/2146978?modelVersionId=2945295) | Meme cartoon character style | `shadiaodonghua` | not stated | 24 / 4 | Img+Svc+Sell | 336.6 MB | Meme maker | Low |

### Inferences
- HiDream-O1's strengths (readable text, editing, subject personalisation, 2048 px, MIT) should come from the base model, not LoRAs. Use the Kijai distill LoRA for speed and nothing else in production.
- Its pixel-level, VAE-free design means HiDream-I1 LoRAs cannot carry over. I found no page that states this directly.

### Gaps
- No HiDream-O1 LoRA has enough downloads or reviews to judge quality.
- ComfyUI LoRA loading for community HiDream-O1 LoRAs (Civitai on-site trained files) is not documented on the pages; the Kijai LoRAs are documented by Comfy.

---

## Q4. Which LoRAs best reproduce Higgsfield-style influencer photos and cinematic film looks?

### Takeaway
For the "Soul"-style amateur phone look, Krea 2 is strongest. The best mix is the Phone Photography (2025/2020) LoRA plus the Amateur slider and Natural Expressions, with Realistic Snapshot or Lenovo UltraReal for skin and light. Z-Image Turbo is a close, cheaper second: Realistic Snapshot v5 at 0.6–0.7, Lenovo UltraReal, Amateur Selfies, Skin Texture. For cinematic film looks, use Z-Image Turbo (Luneva Cinematic, Cinematic Shot, GrainScape, Technically Color, ArsMachina period stills) or Krea 2 (Cinematic Shot, Lightbox stocks, Afterlight, Canon UltraReal). FLUX 3 Klein has nothing comparable yet.

### Cited Findings
- Phone Photography (2000–2025) recreates "smartphone photography styles from 2000 to 2025, capturing the shift from noisy, low-res images to modern AI-enhanced clarity" — [Civitai 2537408](https://civitai.com/models/2537408)
- Realistic Snapshot Krea 2 v1.0: "same smartphone-snapshot look, now more stable"; strength 1.5 best — [Civitai](https://civitai.com/models/2268008?modelVersionId=3371723); ZIT v5: 42,241 downloads, keep strength ~0.60–0.70 — [Civitai](https://civitai.com/models/2268008?modelVersionId=2617751)
- Amateur slider: "+2 is typically a good balance" for noise and compression; −2 for clean pro images — [Civitai 2773343](https://civitai.com/models/2773343)
- Natural Expressions fixes "the stiff, robotic face look and generic centering" with "dynamic framing... and candids" — [Civitai 2877049](https://civitai.com/models/2877049)
- Krea 2 Realism LoRA: "natural, candid, true-to-life photography — everyday people, places, and light" — [HF gokaygokay](https://huggingface.co/gokaygokay/Krea-2-Realism-LoRA)
- Amateur Selfies (ZIT): "authentic amateur selfies... close-up shots, relaxed smiles, playful faces, or casual poses" — [Civitai 2233658](https://civitai.com/models/2233658)
- Film: GrainScape ("analog, grain, kodak"), 2000s Analog Core (timestamps, camcorder), Technically Color ("classic film... vibrant palettes"), Lightbox Grain 35 ("consumer 35mm film from the 90's - 2000's... hard flash") — [GrainScape](https://civitai.com/models/1332651), [Analog Core](https://civitai.com/models/1134895), [Technically Color](https://huggingface.co/renderartist/Technically-Color-Z-Image-Turbo), [Lightbox](https://civitai.com/models/2909179)
- Several top realism LoRAs are NSFW-capable (Realistic Snapshot's Krea 2 dataset "includes a lot more NSFW material"; Phone Photography "All have basic NSFW capabilities") — [Realistic Snapshot](https://civitai.com/models/2268008), [Phone Photography](https://civitai.com/models/2537408). The Krea 2 licence makes content filtering mandatory — [krea.ai licensing](https://www.krea.ai/krea-2-licensing)

Recommended stacks (from the page settings above; the stacks themselves are untested)
- Krea 2 Turbo "Soul" stack: Phone Photography 2025 (trigger sentence) + Amateur Slider +1.5…+2 + Natural Expressions 0.6–0.8; optional Realistic Snapshot 1.0–1.5 for older-phone grit, or Lenovo UltraReal 1.2–2 on Turbo.
- Z-Image Turbo "Soul" stack: Realistic Snapshot v5 0.6 + Amateur Selfies (`amateur_selfie`) for selfies, or Lenovo UltraReal (`l3n0v0`) for scene shots; Skin Texture for close-ups; Detail Slider −1…+1.
- Film looks: Z-Image Turbo GrainScape 0.85 or Technically Color; Krea 2 Lightbox (Grain 35 / Kodacolor II / Ruin flash) or Disposable Camera; cinematic grade via Cinematic Shot on either.

### Inferences
- A "phone era" selector (2000 / 2007 / 2020 / 2025) is the closest LoRA analogue to Higgsfield's camera presets in the influencer flow.
- Character identity across a Photodump should come from a character LoRA or reference editing (Identity Edit on Krea 2, multi-reference on FLUX 3 Klein), not from these style LoRAs.

### Gaps
- No side-by-side test against Higgsfield Soul outputs was found.
- Stacking behaviour (style + identity LoRA) is described only anecdotally on author pages; no systematic test was found.
- Several high-download "Instagram realism" LoRAs for Z-Image and Krea 2 were left out because their main versions are NSFW-oriented.

---

## Q5. Which speed / distill LoRAs exist, and which need special loading?

### Takeaway
All four families have speed LoRAs. Krea 2 has the most polished: lvladikov's 4-step and 2-step Turbo LoRAs load in the standard loader. Z-Image Base has alibaba-pai's official 2/4/8-step Fun Distill, but use the "-ComfyUI" files. FLUX 3 Klein has three distill extracts, and two of them need special nodes. HiDream-O1 has Kijai's Dev-distill LoRA, documented by Comfy.

### Cited Findings

| LoRA | Base (page) | Effect | Settings | Popularity | Licence | Loader | Size |
|---|---|---|---|---|---|---|---|
| Krea2 Turbo 4-step (lvladikov) — [HF](https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA) | `krea/Krea-2-Turbo` | 8 → 4 steps, ~1.6× faster; "teacher preferred on only 6 of 45 judged renders" | 1.0; 0.75 if too strong (0.6–0.9) | HF 30d 15,708; 189 likes | Krea 2 Community | Standard: "plain LoRA... No custom nodes, no patched sampler" | 417.8 MB |
| Krea2 Turbo 2-step (lvladikov) — [HF](https://huggingface.co/lvladikov/Krea2-Turbo-Distill-2step-LoRA) | `krea/Krea-2-Turbo` | 8 → 2 steps, "4× faster denoising"; teacher preferred on 12 of 66 | stock Euler | HF 30d 4,962; 42 likes | Krea 2 Community | Standard ("Drop-in, no exceptions") | 417.8 MB |
| Krea-2 Turbo Distillation LoRA, SVD extract (TheDivergentAI) — [HF](https://huggingface.co/TheDivergentAI/krea2-turbo-distill-lora) | `krea/Krea-2-Raw` | Raw → Turbo behaviour; r128 "recommended starting point" | 8 steps, CFG 0, mu 1.15 | HF 30d 5,038; 37 likes | Krea 2 Community | Standard | 447.6 / 893.5 / 1,785.5 MB |
| Krea 2 Turbo LoRA 256dim (_Envy_) — [Civitai](https://civitai.com/models/2727641) | `Krea 2` | Base→Turbo difference at dim 256 | — | Civ v 5,513 / 184 | Civ flags all | "For ComfyUI, you MUST download the optional Comfy lora" | 1,638.1 MB |
| Krea 2 Turbo LoRA – Low Mottle (rockerBOO) — [HF](https://huggingface.co/rockerBOO/Krea-2-Turbo-LoRA-Low-Mottle) | `krea/Krea-2-Raw`, `krea/Krea-2-Turbo` | Drop-in replacement for "the Krea 2 turbo LoRA" with ~70% less blotchy noise in smooth areas | 8 steps, CFG 1; "Do not load both" | HF 30d 325 | Krea 2 Community | Standard | 447.7 MB |
| Krea 2 Turbo SDA Diversity LoRA (F16) — [HF](https://huggingface.co/F16/krea2-turbo-sda) | `krea/Krea-2-Turbo` | Restores seed diversity lost in distillation; adherence "statistically indistinguishable" | rank 32 | HF 30d 6,605; 110 likes | Krea 2 Community | Standard (`_comfy` file) | 447.6 MB |
| Z-Image-Fun-Lora-Distill (alibaba-pai) — [HF](https://huggingface.co/alibaba-pai/Z-Image-Fun-Lora-Distill) | Z-Image (Base) | Distils steps and CFG: 2-, 4- and 8-step versions (2602, 2603) | per file; 2603 suits sigmas < 0.5 | HF 30d 6,697; 179 likes | Apache-2.0 | Use the `-ComfyUI` files | 541.9 MB |
| Z-Image Fun Distill, UDCAI edit — [Civitai](https://civitai.com/models/2362961), [HF](https://huggingface.co/UDCAI/Z-Image-Fun-Distill-ComfyUI) | `ZImageBase` | Merge of 2603 2-step and edited 2602 8-step; "great outputs from 4-10 steps"; removes feed-forward keys that caused grid artifacts | 8 steps CFG 1; avoid sageattention | Civ v 3,017 / 165; Civ m 8,168 / 307; HF 29 likes | Civ flags all | Standard (ComfyUI-converted) | 239.1 MB |
| Z-Image (base) Distilled LoRA, extracted RedZDX (anyMODE) — [Civitai](https://civitai.com/models/2359857) | `ZImageBase` | Extracted from `GuangyuanSD/Z-Image-Distilled` | CFG 1.0–1.8, 10–20 steps, Euler/simple | Civ v r64 1,030 / 62 | Civ flags Img | Standard | 410.7 MB (r64) |
| Z-Image Turbo Lightning (Felldude) — [Civitai](https://civitai.com/models/2409672) | `ZImageTurbo` | Fewer steps on Turbo; "In some cases Turbo will effect text accuracy" | 0.5–1.0, Euler/Normal, 4–8 steps | Civ v 4,148 / 210 | Civ flags Img | Standard | 33.6 MB |
| FLUX.3 Klein 4-step (Muinez) | see Q1 | 2–4 steps on base | 1.0, CFG 1, shift 3 | HF 11 likes | FLUX Kommunity | Standard `LoraLoaderModelOnly` | 160.9 MB |
| WAS FLUX 3 Klein distill (SD extract) | see Q1 | Base → distilled look in 16 steps, keeps CFG | ~1.0 | Civ v 101 / 9 | FLUX Kommunity | **Needs Flux 3 Flow Map Patch (WAS Node Suite v3)** | 80.5–1,284.6 MB |
| terminusresearch FLUX 3 distilled extract | see Q1 | Same, with destination-time embedder | — | HF 0 | FLUX Kommunity | **Needs FLUX 3 Distilled Extract Loader** | 663–1,304 MB |
| Kijai HiDream-O1 Dev distill | see Q3b | Dev distillation on Full, adjustable | — | 26 likes | MIT base | Documented in Comfy HiDream-O1 tutorial | 334.6–1,269 MB |

### Inferences
- The FLUX 3 Klein distilled checkpoint is already fast (4–16 steps), so ComfyField does not need FLUX 3 speed LoRAs unless a format runs the base model.
- On Krea 2, the 4-step LoRA on Turbo is the clear cost lever, and the SDA diversity LoRA suits Photodump-style sets where seed variety matters.

### Gaps
- No independent benchmark of these speed LoRAs; all quality numbers are the authors' own.

---

## Q6. What is the best pick per ComfyField service, and where are the gaps?

### Takeaway
Most services have a strong LoRA today on Z-Image Turbo or Krea 2, but not on FLUX 3 Klein, which runs most Looks and Just-for-fun formats. The pragmatic plan has three parts:
- Keep FLUX 3 Klein for formats that rely on its multi-reference editing. Use its tool LoRAs: Outpaint, 360, Restore and Angles.
- Point LoRA-dependent Looks and influencer formats at Krea 2 Turbo or Z-Image Turbo.
- Re-check FLUX 3 Klein LoRAs after the contest.

### Cited Findings
(Each pick is cited in the catalogs above; licence notes repeat the key blocker.)

| ComfyField service / format | Current base (inventory) | Best pick now (family) | Runner-up | FLUX 3 Klein option today | Note |
|---|---|---|---|---|---|
| AI influencer page ("Soul") | tool page; AI influencer post = FLUX 3 Klein | Krea 2: Phone Photography 2025 + Amateur Slider + Natural Expressions | Z-Image Turbo: Realistic Snapshot v5 + Amateur Selfies | none (prompt + references only) | NSFW-capable LoRAs, so keep the content filter on |
| Photodump | tool page | Krea 2: Phone Photography (era picker) + F16 SDA diversity | Z-Image Turbo: Lenovo UltraReal, 2000s Analog Core, Olympus UltraReal | none | Identity via Identity Edit / ReID or FLUX 3 multi-reference |
| AI human | Krea 2 Raw | Krea 2: Krea2-realism-V2 (RudySen) or Realism LoRA (gokaygokay) + Realism slider | Lenovo UltraReal Krea2 (0.8 on Raw, CFG 4) | — | Right family already |
| Professional headshot / Portrait styles / Profile picture | FLUX 3 Klein | Z-Image Turbo: AWPortrait-Z + Skin Texture | Krea 2 Identity Edit (non-commercial licence) | none | Headshot needs identity: FLUX 3 multi-reference stays the engine |
| Character sheet | Qwen-Image-Edit 2511 | Z-Image Turbo: Character Design Sheet (`CharacterDesignIZT`) | Krea 2: Character sheet Helper (`FBcs`) + pose ControlNet LoRA | Multiple Angles LoRA (akhaliq) | For one-photo sheets keep Qwen Edit 2511 |
| Character in any scene / Character swap / Face swap | FLUX 3 Klein / Nano Banana | Krea 2 Identity Edit V2 (licence needed) or ReID | — | Consistency LoRA (low confidence) | FLUX 3 native multi-reference is the licence-safe default |
| Fashion factory / Try on / Virtual stylist | tool page / Qwen-Image 2.1 | Krea 2: Outfit Transfer (AliveAi) | Identity Edit "change outfits" | none | Custom nodes needed |
| Moodboard / Match a moodboard / Copy a style | FLUX 3 Klein / Qwen-Image 2.1 | Krea 2: ostris Style Reference | Krea 2: DeverStyle KSTRANSFER (Ostris nodes) | FLUX 3 multi-reference (no LoRA) | |
| Looks: Phone flash at night / Disposable camera / Instant photo | FLUX 3 Klein | Krea 2: Lightbox Ruin flash / Disposable Camera / Polaroid Spirit | Z-Image Turbo: 2000s Analog Core, OB Instant camera, Polaroid Redmond | none | |
| Looks: Film noir / 70s film stock / Golden hour editorial | FLUX 3 Klein | Z-Image Turbo: GrainScape, Technically Color; ZIB: 50s Noir, 70s Horror | Krea 2: Kodacolor II, Afterlight, AfterDark | none | |
| Looks: Studio fashion / Street style | FLUX 3 Klein | Z-Image Turbo: AfterDark (fashion/low-key) | Krea 2: Canon UltraReal | none | No dedicated studio-fashion LoRA found |
| Looks: Tilt shift / Fisheye skate / Drone top down | FLUX 3 Klein | Z-Image Turbo: Telephoto/Fisheye slider, Movie Wide Angle | Krea 2: Fisheye slider, V67 Tilt-Shift | none | No drone/top-down LoRA found |
| Looks: Watercolor / Oil painting / Ink sketch / Sketch / Drawing | FLUX 3 Klein | Krea 2 official: softwatercolor, darkbrush, dotmatrix; Friendly Sketch | Z-Image: Classic Painting Z, Eldritch Oil, Pencil sketch | Charcoal sketch (F3K, low) | |
| Looks: Anime cel | FLUX 3 Klein | Krea 2: retroanime (official), Line Art Anime Flat, Masterpiece | Z-Image Turbo: Retro Sci-fi 90s anime | none | |
| Looks: Claymation / Pixel art / Low poly / Vaporwave | FLUX 3 Klein | Pixel: Z-Image Turbo tarn59 Pixel Art (or Krea 2 e-n-v-y); Clay: Krea 2 Claymation Style / ZIT British Claymation; Low poly: Krea 2 PSX Style; Vaporwave: Krea 2 CRT Vaporwave | ZIT Low Poly, Retro 80s Vaporwave | none | |
| Looks: Wallpaper | FLUX 3 Klein | FLUX 3 Klein Outpaint (re-ratio) + 360 LoRA | Krea 2 official neondrip / rainywindow | Outpaint, 360 | Weak "WALLPAPER STYLE" Krea LoRA not recommended |
| Looks: Brand colors | FLUX 3 Klein | none (no palette LoRA found) | — | — | Gap: palette control stays prompt/reference based |
| Just for fun: Cartoon yourself / Anime yourself | FLUX 3 Klein | Krea 2 (Identity Edit + style LoRA) or FLUX 3 multi-reference + prompt | Z-Image: Saturday Morning Z, Anime Style (hinablue) | Balthazar style (low) | Photo→style transfer needs an edit model, not a T2I LoRA |
| Just for fun: Die-cut sticker / Tiny creature | FLUX 3 Klein | Krea 2: Sticker (alcaitiff), Emoji (linoyts) | ZIT Stickers.Redmond | none | |
| Just for fun: Video game style / 8-bit runner / Open world hero | FLUX 3 Klein | Krea 2: ta86_inkriot, PSX Style; Pixel Art 32/64/128 | ZIT Pixel Art (tarn59) | none | |
| Just for fun: Plush toy / Brick toy | FLUX 3 Klein | none found | Krea 2 3D Render Style (goofyai) as partial | none | Gap |
| Just for fun: Coloring book page | FLUX 3 Klein | Z-Image Turbo: Coloring Book Z (`c0l0ringb00k`) | Krea 2 Line Art Anime Flat | none | |
| Create image | FLUX 3 Klein default | Krea 2: M87 / Krea2_Enhancer; Z-Image: DeJPEG + Detail Slider | — | none | |
| Cinematic cameras (lens and film looks) | tool page, image mode (base not stated in inventory) | Z-Image Turbo: PhotoBOX sliders (angle, zoom, aperture) + Movie Wide Angle + Cinematic Shot | Krea 2: Canon UltraReal lenses, Lightbox Cinematic Concept, Cinematic Shot | none | |
| Explainer / Faceless still frames | FLUX 3 Klein in pipeline | Krea 2 official softwatercolor / kidsdrawing; ZIB Flat Color; Z-Image Cinematic Shot / Melancholy (faceless realism) | Friendly Sketch | Tholpavakoothu (novelty) | Consistency across frames needs one LoRA per video |
| Storyboard / 9 shots / Shot grid | FLUX 3 Klein / Qwen Edit | Krea 2: sbgrid | FLUX 3 Multiple Angles | Angles LoRA | |
| Thumbnail | Qwen-Image 2.1 (out of scope) | Krea 2: Typnosis (type) + V0id (background) + Facial Expressions (ZIT) for faces | FLUX 3 Klein Outpaint to 16:9 | Outpaint | No thumbnail LoRA exists on any of the four families |
| Expand / Restore an old photo / Upscale | Qwen-Image 2.1 / SeedVR2 | FLUX 3 Klein Outpaint; FLUX 3 Restore + SeedVR2 | Krea 2 AnyPaint / Registered Outpaint | Outpaint, Restore | FLUX 3 path supports the "Built with FLUX" bonus |

### Inferences
- Moving many FLUX 3 Klein formats to LoRA-backed Krea 2 or Z-Image would weaken the "FLUX 3 as core model" story for the contest. Keep FLUX 3 Klein where its multi-reference matters (characters, restyle) and the tool LoRAs exist.
- Prefer Z-Image Turbo over Krea 2 where licence risk matters: Apache-2.0 vs Krea's $1M revenue cap plus mandatory filtering.

### Gaps
- No LoRA found in these families for: plush/brick toys, brand palettes, drone top-down, infographics/slide layouts, game-show/TV, thumbnails.
- Custom-node availability on Comfy Cloud for Krea 2 editing adapters is unverified.

---

## Q7. How deep is each family's LoRA ecosystem (honest read)?

### Takeaway
Krea 2 is deep and growing fast. Z-Image is deep and mature. FLUX 3 Image Klein is newborn: about 40 files, mostly tools. HiDream-O1 is effectively empty.

### Cited Findings

| Family | Released | Civitai SFW LoRAs (2026-10-19) | HF adapters | Top LoRA usage | Character of ecosystem | Sources |
|---|---|---|---|---|---|---|
| FLUX 3 Image Klein | 2026-10-15 | 19 (11 `Flux.3 Klein`, 6 `Flux.3 Klein-base`, 2 `Flux.3`) | 25 (9 distilled + 16 base) | ≤ 628 downloads (HF 30d); Civitai top version 508 | Tools (outpaint, consistency, restore, angles, 360, distill), hackathon styles; one veteran author unhappy with results | [BFL](https://bfl.ai/blog/flux-3-image-klein), [Civitai API](https://civitai.com/api/v1/models?types=LORA&baseModels=Flux.3%20Klein&nsfw=false), [HF API](https://huggingface.co/api/models?filter=base_model:adapter:black-forest-labs/flux-3-image-klein-base) |
| Z-Image Turbo / Base | Turbo 2025-11-25; Base 2026-01-23 | 5,376 ZIT + 715 ZIB | 879 + 152 | Version downloads up to 42,241 (Realistic Snapshot v5); HF repo up to 240,613 / 30d (a real-person pack) | Realism, film, cinematic, sliders, character sheets, pixel art; heavy share of real-person and NSFW content | [Civitai API](https://civitai.com/api/v1/models?types=LORA&baseModels=ZImageTurbo&nsfw=false), [HF API](https://huggingface.co/api/models?filter=base_model:adapter:Tongyi-MAI/Z-Image-Turbo) |
| Krea 2 Raw / Turbo | 2026-06-18 | 7,842 | ≥1,000 Raw + ≥1,000 Turbo (API cap); +1,503 fal style LoRAs; 9 official | HF up to 153,255 / 30d (Identity Edit); Civitai version up to 38,060 (Lenovo Krea2) | Broadest: styles, realism, and a full edit/control stack via custom nodes | [Civitai API](https://civitai.com/api/v1/models?types=LORA&baseModels=Krea%202&nsfw=false), [fal index](https://huggingface.co/ilkerzgi/fal-Krea-2-Style-LoRAs), [Krea collection](https://huggingface.co/api/collections/krea/krea-2-loras) |
| HiDream-O1 | 2026-05-08 | 30 | 0 (base), 1 (Dev) | Civitai version ≤ 179 | A few experiments; Kijai distill LoRA is the only solid item | [Civitai API](https://civitai.com/api/v1/models?types=LORA&baseModels=HiDream-O1&nsfw=false), [Comfy docs](https://docs.comfy.org/tutorials/image/hidream/hidream-o1.md) |

### Inferences
- FLUX 3 Klein will likely grow quickly: BFL ships a base for fine-tuning, there is day-one ai-toolkit and diffusers support, and LoRA serving costs only ~5% more time. But it will not reach Z-Image or Krea 2 depth before the 2026-10-30 deadline.
- HiDream-O1's thin ecosystem after five months suggests it will stay a base-model choice.

### Gaps
- Civitai counts use the API's `nsfw=false` filter, which still lets some NSFW-oriented LoRAs through (I found several), so true SFW counts are lower.
- HF counts include only adapters that declare a `base_model` tag.

---

## Q8. Novel or interesting: capabilities that could become new ComfyField services

### Takeaway
Several LoRAs enable services ComfyField does not have yet. The strongest candidates are 360 panoramas (FLUX 3 Klein), game-icon sprite packs (Krea 2), camera-control sliders (Z-Image), phone-era photo presets (Krea 2), HDR environment maps (Krea 2, non-commercial), SVG logo output (Z-Image), and cultural-craft styles (FLUX 3 Klein).

### Cited Findings
- **360 panorama → new format "360 backdrop"** (Scenes and games or Cinema). FLUX 3 Klein 360 LoRA (`create a 360 hdr`, 2:1) + Seamfix; feeds Explorable world, Looping background, 3D studio skies — [DenRakEiw HF](https://huggingface.co/DenRakEiw/Flux_3_klein_360_Degree). A FLUX 3-core format, good for the contest's FLUX bonus.
- **Game icon packs → new format "Game assets"** (pairs with Game from a prompt). Krea 2 PixelArt 16x16 draws one icon per image on magenta for colour-key cut-out — [Angais](https://huggingface.co/Angais/Krea-2-PixelArt-16x16); Pixel Art 32/64/128 for sprites — [e-n-v-y](https://huggingface.co/e-n-v-y/Krea-2-Pixel-Art)
- **Camera sliders → "camera dial" controls in Cinematic cameras (image mode)**. PhotoBOX_ZIT ships separate slider LoRAs for angle, zoom, aperture, warm/cool and light — [Civitai 2275756](https://civitai.com/models/2275756); Krea 2 Fisheye slider — [Civitai 2981004](https://civitai.com/models/2981004). LoRA weight maps directly onto a UI slider.
- **Phone-era presets → "Phone era" picker in AI influencer / Photodump**: 2000, 2007, 2020, 2025 versions — [Civitai 2537408](https://civitai.com/models/2537408)
- **Scene-linear HDR / EXR → "HDRI sky" export for 3D studio**: Krea 2 LoRA generates LogC4 code that decodes to float radiance (>1.0) for `.exr` — [LAXMAYDAY](https://huggingface.co/LAXMAYDAY/krea2-scene-linear-hdr-lora) (CC BY-NC 4.0, needs `comfyui_krea_hdr` nodes)
- **SVG output → "Vector logo"**: Z-Image LoRA plus a flow-matching model that produce SVG graphics (Base 50 steps / Turbo 9 steps) — [JosefKuchar/svg-generator](https://huggingface.co/JosefKuchar/svg-generator) (MIT)
- **Cultural-craft styles from licensed data → "Folk art" Looks**: Tholpavakoothu shadow-puppet LoRA on FLUX 3 Klein trained on 20 CC-licensed Wikimedia photos — [Barath](https://huggingface.co/Barath/tholpavakoothu-flux3-lora); a model for licence-clean, FLUX 3-native ComfyField Looks
- **Early colour photography → "Time machine photo"**: Historic Color (Prokudin-Gorsky) on Z-Image Turbo — [AlekseyCalvin](https://huggingface.co/AlekseyCalvin/HistoricColor_Z-image-Turbo-LoRA); Lightbox Autochrome on Krea 2 — [Civitai 2909179](https://civitai.com/models/2909179)
- **Storyboard grids from references → upgrade Storyboard**: Krea 2 sbgrid makes 6–8 panel boards with deliberate camera changes — [peculiar/sbgrid](https://huggingface.co/peculiar/sbgrid)
- **People camera orbit → "Any angle" for people**: Krea 2 Anygles uses a 3D human normal for orbit/elevation/distance — [yijunwang2/krea2-anygles](https://huggingface.co/yijunwang2/krea2-anygles)
- **Lineart to render → "Sketch to image" on Krea**: [Cierpliwy/krea2_lineart_edit](https://huggingface.co/Cierpliwy/krea2_lineart_edit)
- **Restore with FLUX 3 → "Restore an old photo" on a FLUX core**: SeedVR2 3B enlarge + FLUX 3 tiled redraw + Restore LoRA — [ausboss Restore](https://huggingface.co/ausboss/FLUX-3-Image-Klein-Restore-LoRA)
- **Segmentation map to photo → "Remix layout"** (ControlNet patch, not a LoRA): Z-Image SAM ControlNet turns SAM-style colour segments into photoreal images — [neuralvfx/Z-Image-SAM-ControlNet](https://huggingface.co/neuralvfx/Z-Image-SAM-ControlNet)

### Inferences
- The 360, Restore and Outpaint ideas run on FLUX 3 Image Klein, so they strengthen the contest's "FLUX 3 as core model" story at no extra licence risk beyond FLUX Kommunity.
- The phone-era picker and camera sliders are low-cost UI wins: each is one LoRA file with a weight or a trigger.

### Gaps
- None of these were run; quality claims are the authors'.
- The HDR LoRA is non-commercial (CC BY-NC 4.0).
