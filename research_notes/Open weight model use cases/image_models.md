# Open-weight image models: what people actually use them for (Aug-Oct 2026)

Scope: FLUX 3 Image Klein, Qwen-Image 2.1 / 2.1 Turbo, Qwen-Image-Edit 2511 (+ Lightning, Multiple-Angles), Qwen-Image-Layered, Z-Image Turbo, Krea 2 Turbo / Raw. Extends `research_notes/model-strengths-and-mapping.md` section 3 (specs, AA rankings, ComfyField placement, Comfy template run counts are there and not repeated).

Method note: Hugging Face (HF) figures were pulled from the HF public API on 2026-10-25. The API `downloads` field is a rolling ~30-day count, so it is a "current demand" signal, not all-time. Adapter lists use the HF `base_model:adapter:` filter, so they only count LoRAs that declare their base. Civitai pages returned HTTP 403 to the fetcher, and no Reddit thread surfaced through search, so Reddit and Civitai coverage is thin (see Gaps).

## 1. What do people make with each model?

### Takeaway
The demand split is clear from the LoRAs people download. Z-Image Turbo and Krea 2 are realism / people / AI-influencer bases with a large NSFW share. Qwen-Image-Edit 2511 is the editing workhorse (speed, pose, angle, "anything to real", relight, object add/remove, upscale). Qwen-Image 2.1 is used as a base for face swap, speed and camera-angle LoRAs. Qwen-Image-Layered is a niche design tool. FLUX 3 Klein is mostly being downloaded and tested, not yet fine-tuned.

### Cited Findings

**Z-Image Turbo (Tongyi-MAI, Apache-2.0)**
- HF: 697,001 downloads (last ~30 days), 5.51k likes, 880 adapters, 173 finetunes, 100 quantizations. Model card pitch: photorealism, bilingual (EN/ZH) text, fits 16 GB VRAM. — [HF Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)
- Top HF adapters by downloads: `ostris/zimage_turbo_training_adapter` (39.6k, a LoRA-training aid), an NSFW "master" LoRA (15.9k), DeJPEG (15.3k), pixel art (13.4k), Realism LoRA (4.4k), Shakker-Labs AWPortrait-Z (3.8k, 489 likes), classic painting, coloring book, detailed eyes, "Lenovo UltraReal". Of the top 20, about 8 are explicit NSFW LoRAs. — [HF API, Z-Image-Turbo adapters](https://huggingface.co/api/models?filter=base_model:adapter:Tongyi-MAI/Z-Image-Turbo&sort=downloads&limit=20)
- Themes by usage: (1) photoreal people / portraits / "snapshot" realism, (2) NSFW, (3) art styles (pixel art, painting, coloring book), (4) image cleanup (DeJPEG), (5) LoRA training itself. — inferred from the adapter list above.
- Civitai: "Realistic Snapshot (Z-Image-Turbo)" photoreal LoRA has 1,929 reviews ("Overwhelmingly Positive"); "EFFECTS - Z Image Turbo" lists about 149.5k downloads and 16.5k likes (page updated 2026-04-23, older than the focus window); a community "Z-Image Turbo Lightning" speed LoRA and a "workflow for realistic images when creating people with LoRAs" also rank. — [Civitai Realistic Snapshot](https://civitai.com/models/2268008/realistic-snapshot-z-image-turbo); [Civitai EFFECTS](https://civitai.com/models/2202300/effects-z-image-turbo); [Civitai Lightning](https://civitai.com/models/2409672/z-image-turbo-lightning); [Civitai people workflow](https://civitai.com/models/2275497/z-image-turbo-workflow-for-realistic-images-when-creating-people-with-loras)
- Community comparison (anecdotal, about FLUX.2 Klein, not FLUX 3): Z-Image Turbo is seen as the strongest for photorealism and speed; FLUX.2 Klein has slightly better prompt adherence and range; Qwen 2512 is slower. — [HF Z-Image discussion 135](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/discussions/135); [Diffusion Doodles summary](https://diffusiondoodles.substack.com/p/open-source-diffusion-model-summary)

**Krea 2 Turbo / Raw (Krea, community licence)**
- HF: `krea/Krea-2-Turbo` 77,642 downloads / 1,767 likes; `krea/Krea-2-Raw` 85,571 / 1,165 (both created 2026-06-18). The Comfy repackage `Comfy-Org/Krea-2` has 3,583,280 downloads in the window, by far the largest figure in this report (a ComfyUI-pull signal; it may include repeat pulls by cloud services). — [HF API, krea-2 search](https://huggingface.co/api/models?search=krea-2&sort=downloads&limit=10)
- Top Raw-based adapters: `Krea2_Asian_Character` (607,164 downloads, 39 likes; the download/like ratio suggests automated or service pulls, unverified), `krea2-identity-edit` (182,590 / 895 likes), `girlslike-krea2` (47k), a Turbo NSFW all-in-one (18.8k), Realism LoRA (13.8k), pixel art, an 8-step distill LoRA, outfit transfer, inpaint edit, lineart edit, a Danbooru (anime) finetune. — [HF API, Krea-2-Raw adapters](https://huggingface.co/api/models?filter=base_model:adapter:krea/Krea-2-Raw&sort=downloads&limit=15)
- So the community is bolting editing onto a T2I-only model (identity edit, outfit transfer, inpaint), which points to unmet demand for edit on Krea. — inferred from the list above.
- Usage pattern is "train on Raw, run on Turbo"; Civitai offers Krea 2 LoRA training without a local GPU. Civitai shows a smaller LoRA ecosystem (10K+) than FLUX.1 or SDXL. — [Krea open-source page](https://www.krea.ai/krea-2-open-source); [Krea 2 LoRA ecosystem write-up](https://www.dreampixelforge.com/blog/krea-2) (third-party; ecosystem count unverified)

**Qwen-Image-Edit 2511 (+ Lightning, Multiple-Angles; Apache-2.0)**
- HF: 191,017 downloads, 1.5k likes, 193 adapters, 99 finetunes, 32 quantizations, 100 Spaces. Note the older 2509 still out-downloads it (479,336). — [HF Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511); [HF API, Qwen models](https://huggingface.co/api/models?author=Qwen&search=Qwen-Image&sort=downloads&limit=20)
- 2511 itself folds in popular community LoRAs (lighting, new viewpoints) and pitches character consistency incl. group shots, industrial design and material replacement. *Vendor claim.* — [HF Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)
- Top 2511 adapters by downloads: Lightning 4-step (380,863), an NSFW LoRA (124,016), Anything2Real (103,049, illustration/anime to photo), AnyPose (74,330, pose transfer), Multiple-Angles (68,889 / 1,601 likes, the most liked), Ultra-Realistic Portrait (25.5k), Hyper-Realistic Portrait (18k), Upscale2K (12.1k), Unblur-Upscale (10.4k), AnyLight (9.6k), style transfer, SYSTMS Action, object adder (7.4k), object remover (7.0k), studio de-light, extract outfit, polaroid, anime, INFL8 inflate effect. — [HF API, 2511 adapters](https://huggingface.co/api/models?filter=base_model:adapter:Qwen/Qwen-Image-Edit-2511&sort=downloads&limit=20)
- Comfy.org lists 18 Qwen-Image-Edit workflows. Themes: SYSTMS Action ("Most Popular"), multiple angles with the 3D camera node, 1-click character angles, 1-click scene angles, material replacement, image-to-3D, illustration to realism, 5 relight variants (image, portrait, composited product, light migration, environment merge), INFL8 effect, Qwen multi-angle into Wan 2.2 video, illustration/anime editing. No workflow is labelled try-on. No run counts on that page. — [Comfy workflows, Qwen-Image-Edit](https://comfy.org/workflows/model/qwen-image-edit/)
- Multiple-Angles uses: turnaround / 3-view sheets for 3D modelling and 3D print, extra product angles from one photo, consistent character viewpoints, staging a start frame for video. 96 poses (8 azimuths x 4 elevations x 3 distances), trained on Gaussian Splatting renders (fal). — [fal on X](https://x.com/fal/status/2008954582018248755); [Criet note.com 3-view guide](https://note.com/snapreplica/n/nbaafc4e308eb?hl=en); [Stable Diffusion Art guide](https://stable-diffusion-art.com/qwen-image-edit-multiple-angle-lora/); [Ordinary Animator](https://ordinaryanimator.com/blog/qwen-image-edit-2511-camera-angles)
- Multiple-Angles lineage: 2509 version (dx8152) 70,225 downloads; 2511 fal version 68,889; a new Qwen-Image 2.1 port (akhaliq, 2026-10-06) 3,009 already. — [HF API, Multiple-Angles search](https://huggingface.co/api/models?search=Multiple-Angles&sort=downloads&limit=10)

**Qwen-Image 2.1 / 2.1 Turbo (Qwen Research Licence, non-commercial)**
- HF: Qwen-Image-2.1 184,227 downloads / 3,451 likes (created 2026-09-14; the most-liked Qwen image repo); 2.1-Turbo 33,479 / 1,051 (created 2026-10-09). Prompt-enhancer repos PE-I2I 15,090 and PE-T2I 8,060. — [HF API, Qwen models](https://huggingface.co/api/models?author=Qwen&search=Qwen-Image&sort=downloads&limit=20)
- Top 2.1 adapters: Pruna compressed build (512,163), Viggle 2.1 turbo (463,610 / 775 likes; Viggle is a commercial app, so this signals service use), **BFS Best Face Swap (290,070 / 1,458 likes)**, Lightning (247,762), community LoRA packs, Turbo8, "Fix" LoRA, natural-exposure (anti-AI-look) LoRA, alibaba-pai Fun acceleration LoRAs, camera-angle LoRA (8,760), Next-Scene LoRA (4,370), plus several NSFW / uncensoring LoRAs. — [HF API, 2.1 adapters](https://huggingface.co/api/models?filter=base_model:adapter:Qwen/Qwen-Image-2.1&sort=downloads&limit=15)
- So the main real-world 2.1 jobs within 6 weeks: face swap, speed-ups, realism fixes, camera angles and next-scene (story/storyboard continuity) ported from the 2509/2511 ecosystem. — inferred from the list above.
- Praised for native 2K, transparent (RGBA) output and multi-reference editing. — [HF discussion 39](https://huggingface.co/Qwen/Qwen-Image-2.1/discussions/39)

**Qwen-Image-Layered (Apache-2.0)**
- HF: 89,108 downloads, 1,180 likes (created 2025-12-17, older than the window). — [HF API, Qwen models](https://huggingface.co/api/models?author=Qwen&search=Qwen-Image&sort=downloads&limit=20)
- Stated uses: split an image into RGBA layers, then recolour, resize, move, swap a subject or edit text in one layer (with Qwen-Image-Edit on that layer); layers can be split again. Blogs add thumbnail variations, social posts, product photo before/after. fal hosts it at $0.05 per image. *Mostly vendor and promotional sources.* — [HF Runware README mirror](https://huggingface.co/Runware/Qwen-Image-Layered/blob/main/README.md); [HackerNoon](https://hackernoon.com/meet-qwen-image-layered-the-photoshop-layers-trick-that-makes-ai-editing-finally-behave); [fal model page](https://fal.ai/models/fal-ai/qwen-image-layered)
- HN framing: value is "layers the way pros work in Photoshop or Figma". — [Hacker News](https://news.ycombinator.com/item?id=46321972)

### Inferences
- Portraits / AI influencers / NSFW drive the T2I bases (Z-Image Turbo, Krea 2). Realism LoRAs and NSFW LoRAs dominate both lists.
- The most popular edit jobs, ranked by 2511 adapter downloads: speed (Lightning), NSFW, illustration-to-real, pose transfer, camera angles, realistic portrait retouch, upscale/unblur, relight, object add/remove, outfit extraction.
- Face swap is the single biggest specialised job on Qwen 2.1 (BFS, 290k). ComfyField already uses a BFS head-swap LoRA for video (section 5 of the strengths doc); an image face-swap format on 2.1 matches demand.
- Typography/logos/posters: the models are praised for text, but no top-20 LoRA targets typography. Text looks like a base-model feature people rely on, not a fine-tuning theme.
- Anime is a minor theme on these bases (Danbooru finetune on Krea, anime LoRA on 2511, illustration editing workflow). Anime users likely remain on older SDXL/Illustrious bases (not verified here).

### Gaps
- Civitai counts per base model and NSFW share could not be read (403). The NSFW share above is only counted from HF top-20 lists.
- No Reddit r/StableDiffusion or r/comfyui thread surfaced via search for any of these models in Aug-Oct 2026.
- No Comfy template run counts beyond those already in the strengths doc.
- No figures for YouTube tutorial counts or X trends.

## 2. Volume signals (summary table, HF API, 2026-10-25, ~30-day downloads)

### Takeaway
By current downloads: Krea 2 (via Comfy-Org repackage) > Z-Image Turbo > FLUX 3 Klein (10 days old, already huge) > Qwen-Edit 2509 > Qwen-Edit 2511 ~ Qwen-Image 2.1 > Layered. By LoRA ecosystem: Z-Image Turbo (880 adapters) far ahead; Klein has almost none.

### Cited Findings
| Model | Main repo downloads / likes | Notable other repos | Adapters |
|---|---|---|---|
| FLUX 3 Klein | `flux-3-image-klein-comfy` 660,874 / 1,579; distilled 115,503 / 692; base 109,220 / 179 | `klein-pup` 48,762; Unsloth FP8 65,556 and GGUF 61,507; a third-party Comfy mirror 267,447 | Top base adapter: angles LoRA 667 downloads |
| Z-Image Turbo | 697,001 / 5.51k | | 880 |
| Krea 2 | Turbo 77,642 / 1,767; Raw 85,571 / 1,165 | `Comfy-Org/Krea-2` 3,583,280 / 747 | Asian character 607k; identity edit 183k |
| Qwen-Image-Edit 2511 | 191,017 / 1.5k | 2509: 479,336 | 193; Lightning 380,863 |
| Qwen-Image 2.1 | 184,227 / 3,451 | Turbo 33,479 / 1,051 | BFS face swap 290,070 |
| Qwen-Image-Layered | 89,108 / 1,180 | | n/a |

Sources: [HF API FLUX.3 search](https://huggingface.co/api/models?search=FLUX.3&sort=downloads&limit=15); [HF Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo); [HF API krea-2](https://huggingface.co/api/models?search=krea-2&sort=downloads&limit=10); [HF API Qwen](https://huggingface.co/api/models?author=Qwen&search=Qwen-Image&sort=downloads&limit=20); [HF 2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)

### Inferences
- The Comfy-Org repackage downloads (Krea 2 at 3.58M, Klein comfy at 661k) are much larger than the vendor repos. ComfyUI is the main way people run these models, which supports building on Comfy templates.
- Download counts can include cloud services pulling weights on each cold start, so treat the largest figures as an upper bound.

### Gaps
- Comfy Cloud per-template run counts for Klein (released 10 days ago) were not found.

## 3. Which edit workflows are most popular?

### Takeaway
Ranked by evidence: (1) Lightning speed-up as a base for everything, (2) illustration/anime-to-real, (3) pose transfer (AnyPose), (4) Multiple-Angles camera control (most liked edit LoRA and the most templated), (5) relight (5 Comfy templates; built into 2511), (6) face swap (on Qwen 2.1), (7) upscale/unblur and object add/remove. Try-on and next-scene are smaller than expected.

### Cited Findings
- Download ranks on 2511: Lightning 380,863; Anything2Real 103,049; AnyPose 74,330; Multiple-Angles 68,889 (1,601 likes); AnyLight 9,625; object adder 7,384; object remover 7,048; extract outfit 5,199. — [HF API, 2511 adapters](https://huggingface.co/api/models?filter=base_model:adapter:Qwen/Qwen-Image-Edit-2511&sort=downloads&limit=20)
- Relight in 2511: built into the base; the prompt must include "Relight"; users report the subject drifts and use padding plus a second pass as a fix. — [MyAIForce relight guide](https://myaiforce.com/qwen-image-edit-2511-relighting/)
- Comfy.org has 5 relight workflows and 4 angle workflows for Qwen-Edit, and none for try-on. — [Comfy workflows, Qwen-Image-Edit](https://comfy.org/workflows/model/qwen-image-edit/)
- Try-on: found only as a feature of a 2509 workflow pack (dx8152), no 2511 try-on LoRA. Outfit extraction (2511) and outfit transfer (Krea 2) LoRAs exist. — [dx8152 Qwen-Edit-2509 workflow](https://huggingface.co/dx8152/Qwen-Edit-2509-workflow); [HF API, Krea-2-Raw adapters](https://huggingface.co/api/models?filter=base_model:adapter:krea/Krea-2-Raw&sort=downloads&limit=15)
- Next-scene: a Qwen-Image 2.1 Next-Scene LoRA has 4,370 downloads; a 2.1 camera-angle LoRA 8,760. — [HF API, 2.1 adapters](https://huggingface.co/api/models?filter=base_model:adapter:Qwen/Qwen-Image-2.1&sort=downloads&limit=15)
- Face swap: BFS Best Face Swap on Qwen 2.1, 290,070 downloads / 1,458 likes, the most liked 2.1 adapter. — same source.
- Multi-angle into video: a Comfy.org workflow chains Qwen multi-angle into Wan 2.2. — [Comfy workflows, Qwen-Image-Edit](https://comfy.org/workflows/model/qwen-image-edit/)

### Inferences
- ComfyField's `qwen_multiangle` and `qwen2511_relight` match the two most templated 2511 edit jobs. Gaps vs demand: illustration-to-real, pose transfer (AnyPose), face swap on images, upscale/unblur via 2511 LoRAs.
- The community is porting 2511 LoRAs (angles, next-scene) to Qwen 2.1. Expect 2.1 to absorb the edit ecosystem over the coming months, licence permitting.

### Gaps
- No usage share data for try-on specifically; no Reddit top-post evidence for any workflow.

## 4. Is FLUX 3 Klein getting traction in its first 10 days?

### Takeaway
Yes on downloads, no on fine-tuning yet. The Comfy repackage reached 660,874 downloads in about 10 days, close to Z-Image Turbo's monthly figure, and Unsloth and others shipped FP8/GGUF builds within a day. But the top base-model LoRA has only 667 downloads, and reviews mostly restate vendor claims.

### Cited Findings
- Download and quant uptake: listed in section 2. Unsloth FP8 and GGUF appeared 2026-10-16, one day after release; at least 6 GGUF repos exist. — [HF API FLUX.3 search](https://huggingface.co/api/models?search=FLUX.3&sort=downloads&limit=15)
- LoRAs: the top base adapters are an angles LoRA (667), a style LoRA (299), SimpleTuner test LoRAs, a tarot LoRA, a skin-restore LoRA (71); ausboss outpaint, consistency and restore LoRAs and a 4-step distil exist with 0 counted downloads so far. — [HF API, Klein base adapters](https://huggingface.co/api/models?filter=base_model:adapter:black-forest-labs/flux-3-image-klein-base&sort=downloads&limit=15)
- Early reviews: provisional scores 3.9-4.1/5; mostly based on BFL docs, not hands-on tests. Reported issues: edits change background texture when told to preserve it, distorted anatomy, wrong small text (one tester got correct poster text). API about $0.014 per 2K image (one review). — [eesel review](https://www.eesel.ai/blog/flux-3-klein-review); [aireiter review](https://aireiter.com/blog/flux-3-image-klein-review-tested); [Oasis review](https://joinoasis.com/blog/flux-3-image-klein-review); [NeuralPaws review](https://neuralpaws.com/flux-3-klein-review-2026/)
- Kompozy (2026-10-16): strong for local private high-volume generation, brand-look LoRA fine-tuning and 4K hero stills; not for non-technical creators or consistent persona content. It states BFL published no independent benchmarks at release. Kompozy sells a competing product. — [Kompozy review](https://kompozy.io/reviews/flux-3-image-klein)
- LoRA training support at launch: Diffusers, Ostris AI Toolkit, NVIDIA NeMo AutoModel. *Vendor/reviewer listing.* — [Kompozy review](https://kompozy.io/reviews/flux-3-image-klein)
- Prior-generation sentiment (FLUX.2 Klein, older): some users called it weak on anatomy and "heavily censored"; others preferred its editing over Qwen. — [HF Z-Image discussion 135](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/discussions/135)

### Inferences
- People are trying Klein through ComfyUI in large numbers, but the community has not yet decided to build on it. The censorship and anatomy reputation of FLUX.2 Klein may slow LoRA adoption, if it carries over (unverified for FLUX 3).

### Gaps
- No Reddit or X reaction threads found; no independent benchmark.

## 5. Top complaints and workflow pain points

### Takeaway
Licences are the loudest complaint (Qwen 2.1 most of all), then the AI look / plastic skin (Z-Image, addressed by realism LoRAs), edit drift (2511 relight, Klein backgrounds), and setup weight (big graphs, quant hunting).

### Cited Findings
- **Qwen 2.1 licence:** multiple HF threads ask Alibaba to return to Apache-2.0 ("License renders this model useless"); debate on whether outputs are restricted; HN calls it "weights-available". Commenters expect lax enforcement against hobbyists; unconfirmed talk of a revenue cap. — [HF discussion 6](https://huggingface.co/Qwen/Qwen-Image-2.1/discussions/6); [HF discussion 9](https://huggingface.co/Qwen/Qwen-Image-2.1/discussions/9); [HF discussion 24](https://huggingface.co/Qwen/Qwen-Image-2.1/discussions/24); [HF discussion 39](https://huggingface.co/Qwen/Qwen-Image-2.1/discussions/39); [Hacker News](https://news.ycombinator.com/item?id=49775499); [ExplainX](https://explainx.ai/blog/qwen-image-2-1-transparent-image-generation-license-2026)
- **Krea 2 licence:** sources conflict on the threshold (under 50 seats vs under $1M ARR); the official repo only says "community licence" and to contact Krea for commercial licences. — [Krea 2 GitHub](https://github.com/krea-ai/krea-2); [LocalAIMaster guide](https://localaimaster.com/blog/krea-2-local-guide)
- **FLUX 3 Klein licence:** free commercial use under $5M revenue. — [Kompozy review](https://kompozy.io/reviews/flux-3-image-klein)
- **Plastic skin / AI look (Z-Image Turbo):** default prior is glossy beauty-stock portraits; "realistic" in the prompt does little; naming camera, lens, film stock and non-idealised features helps (a photographer's test on r/StableDiffusion, as reported). Tutorials use alternative samplers (RES4LYF), inpaint and face swap to fix smooth skin. — [Fliki prompting guide](https://fliki.ai/blog/z-image-turbo-prompting-guide); [YouTube, Stop the AI plastic look](https://www.youtube.com/watch?v=GPbDPFuU7ys)
- The same complaint shows in LoRA demand: realism/portrait LoRAs rank high on every base (Z-Image Realism, AWPortrait-Z, Lenovo UltraReal; 2511 Ultra- and Hyper-Realistic Portrait; Krea 2 Realism; Qwen 2.1 Natural-Exposure and "Fix"). — [Z-Image adapters](https://huggingface.co/api/models?filter=base_model:adapter:Tongyi-MAI/Z-Image-Turbo&sort=downloads&limit=20); [2511 adapters](https://huggingface.co/api/models?filter=base_model:adapter:Qwen/Qwen-Image-Edit-2511&sort=downloads&limit=20); [2.1 adapters](https://huggingface.co/api/models?filter=base_model:adapter:Qwen/Qwen-Image-2.1&sort=downloads&limit=15)
- **Edit drift:** 2511 relight shifts the subject; Klein edits alter backgrounds meant to stay. — [MyAIForce](https://myaiforce.com/qwen-image-edit-2511-relighting/); [eesel review](https://www.eesel.ai/blog/flux-3-klein-review)
- **VRAM / setup:** the many FP8 / GGUF / compressed repos (Pruna 2.1 at 512k downloads; 6+ Klein GGUFs; Krea FP8 and GGUFs) show most users cannot run bf16 weights. Qwen is described as "hefty" and slow next to Z-Image. — [HF API FLUX.3](https://huggingface.co/api/models?search=FLUX.3&sort=downloads&limit=15); [HF API 2.1 adapters](https://huggingface.co/api/models?filter=base_model:adapter:Qwen/Qwen-Image-2.1&sort=downloads&limit=15); [Diffusion Doodles](https://diffusiondoodles.substack.com/p/open-source-diffusion-model-summary)
- **Prompt adherence:** Klein reviewers cite small-text errors; FLUX.2 Klein users called it restrictive with prompts (older model). — [eesel review](https://www.eesel.ai/blog/flux-3-klein-review); [HF Z-Image discussion 135](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/discussions/135)
- **Layered:** promotional coverage only; no complaint data found.

### Inferences
- For a hosted studio, the pain points users solve by hand (quant choice, realism LoRA stacking, relight padding passes, licence checks) are good candidates for one-click formats.
- A "less AI look" default (realism LoRA on, camera/film vocabulary in the prompt writer) matches the most common complaint.

### Gaps
- No VRAM complaint threads with numbers found for Aug-Oct 2026.
- No complaint data for Qwen-Image-Layered or Krea 2 output quality.
