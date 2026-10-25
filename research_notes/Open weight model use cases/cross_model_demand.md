# Cross-model demand signals for open-weight generative AI (as of 2026-10-25)

Method note. Collected 2026-10-25. The main sources:
- **Comfy Registry API.** `api.comfy.org/nodes`: I pulled all 6,211 node packs (63 pages of 100) and sorted them by the `downloads` field. Downloads are lifetime totals, not counts for the last 3 months. To get a recent signal, I also ranked the packs created on or after 2026-05-01 (1,992 packs).
- **comfy.org/workflows template gallery.** Default "Most Popular" sort, first 30 of 662 templates. The page shows no counts, so the order is the only signal.
- **CivArchive.** A third-party mirror of Civitai rankings: "Top safe models in the past quarter" and "in the past month". The count next to each entry has no label (it is likely downloads), and the page shows no snapshot date. "Safe" lists leave out NSFW entries, so they understate adult demand.
- **YouTube search results.** I scraped them on 2026-10-25 with the "this year" filter, then recorded view counts and ages. Results come from a US, logged-out search, so they are a sample, not a full ranking.
- **Reddit.** I could not reach it. `reddit.com/r/*/top.json` returned a bot wall, and the search tool does not index it. All Reddit questions are gaps.

Do not repeat: Higgsfield's own audience, pricing and X posts are in `research_notes/Higgsfield audience features and moat/` and `research_notes/higgsfield-top-x-posts.md`. These notes cover open-model demand across all models only.

## Overall: which jobs people do most with open models, ranked

### Takeaway
Across the sources, the top open-model jobs are: (1) image-to-video and text-to-video generation, (2) a consistent character or identity across images and clips, (3) character, face and person swap and motion transfer in video, (4) image editing (instruction edit, inpaint, outpaint, outfit swap), and (5) upscale and restore. "Run it faster on a smaller GPU" sits under all five. UGC ads, product video and music videos have the largest YouTube audiences, but tutorials teach them mostly on closed tools. That makes them high-demand jobs where open models are underused, and a good gap for an easy app.

### Cited Findings
Ranked view (my synthesis; the evidence for each rank is in the questions below):

| Rank | Job (cross-model) | Strongest evidence | Main user groups |
|---|---|---|---|
| 1 | Image/text to video (base generation, with I2V first) | 20 of the top 30 Comfy templates are video. MiniMax H3 packs hold 6+ of the top 30 Registry packs created since May 2026. "How To Use MiniMax H3 in ComfyUI" has 258,875 views in 2 months | Hobbyists, AI filmmakers, content creators |
| 2 | Consistent character / identity (AI influencer, character sheets, RefMod, "no LoRA training") | The #2 monthly Civitai entry is a Qwen 2.1 Consistency LoRA (6K). "Create FULL Character Sheet" workflow (3K). Several RefMod workflows. YouTube: "Long AI Videos with Consistent Characters" 170,311 views. IPAdapter Plus 1.6M lifetime Registry downloads | AI influencer / "OFM" operators, storytellers, UGC makers |
| 3 | Character, face and person swap; motion transfer / dance | Civitai: Qwen Person Swap (3K, #4 monthly), FaceSwap MiniMax REF2VA (3K), H3 Character Swap (2K). Gallery: Wan Animate 2 Motion Transfer. Registry: ReActor 0.93M, AdvancedLivePortrait 0.49M. YouTube: many H3 character swap tutorials at 10K to 37K views each, uploaded in the last month | AI influencer operators, meme and short-form creators, VFX hobbyists |
| 4 | Image editing (instruction edit, inpaint, outpaint, outfit swap / try-on) | The top new Registry pack since May 2026 is `comfyui-krea2edit` (110,151). Inpaint Crop and Stitch 0.93M lifetime. Civitai: Qwen Outpaint (2K), Inpaint Click to Mask, Outfit Swap / Virtual Try-On (2K). Qwen Image 2.1 Image Edit is #2 in the gallery | Designers, e-commerce sellers, photographers |
| 5 | Upscale, restore, frame interpolation | Registry lifetime: frame interpolation 1.95M, Ultimate SD Upscale 1.88M, SeedVR2 1.12M, SUPIR 0.39M. YouTube: "STOP Paying for AI Upscaling" 169,250. SeedVR 2.5 tutorial 108,335. LTX Refine and Restore 109,898 | Everyone as a finishing step; video editors |
| 6 | Realism / photoreal look and style control (sliders, film texture, anime-to-real) | Civitai: [MMH3] Realism Slider (#3 monthly), MiniMax H3 Photorealistic (5K), Krea 2 Photorealism workflow (3K), 35mm film texture LoRA, 3D animation style, anime styles | AI influencer operators, artists |
| 7 | Long video / multi-shot / continuation | Civitai: "H3 Infinite Video Continuation" (2K), "H3 Long Video, One Prompt, Any Length". Registry: `comfyui-h3-multishot`, `minimaxh3-director`, `comfyui-minimaxh3-contex-loop` (11K to 14K each) | AI filmmakers, YouTube storytellers |
| 8 | UGC ads and product ads | Highest YouTube views of any job: "How To Create AI UGC Ads" 185,650; "Create Cinematic AI Ads with Seedance 2.5" 181,308; Higgsfield's "3-Step Workflow" 724,470. Tutorials use closed tools (Seedance, Higgsfield, CapCut). Comfy "Product & Ads" templates are 94% cloud API | Marketers, dropshippers, freelancers who sell ads |
| 9 | Audio: voice clone / TTS, stems, video sound | YouTube: "ElevenLabs just got nuked by open source" 683,770; open voice cloning videos at 74K to 124K. Registry: audio-separation 376,940, MMAudio 241,229. MiniMax H3 makes video and audio together | Narrators, faceless YouTube, dubbing |
| 10 | Music video | YouTube: VidMuse tutorial 611,514; "Create AI Music Video for FREE" 334,208. Tools taught are mostly closed (Suno plus hosted video) | Independent musicians |
| 11 | Talking avatar / lip sync | YouTube: "Ultra Realistic Talking AI Avatars for FREE" 112,654; ElevenLabs lip sync guide 80,481. Few open-specific packs in the Registry top 80 | Educators, UGC, faceless channels |
| 12 | Niche verticals (real estate walkthroughs, fashion try-on video) | Real estate: Higgsfield + Kling tutorial 105,722 (closed). Try-on tutorials are under 60K views | Realtors, fashion brands |

- Adult / "uncensored" use is a large hidden driver that the "safe" lists hide. The past-week CivArchive list with all ratings is "heavily NSFW-tagged" — [CivArchive hot models](https://civarchive.com/hot-models?rating=all) (per search summary). Even the safe quarterly list ranks "uncensored" and "abliterated" text encoders, a "Refusal-Reduction LoRA" and a "PornMaster" age slider in its top 30 — [CivArchive top models](https://civitaiarchive.com/top-models). YouTube: "My $300k/mo Full AI OFM Content Pipeline (ComfyUI)" (6,397 views, 2 months; "OFM" is OnlyFans management), and "Local Uncensored (Character-Workflow)" (33,089 views in 12 hours) — YouTube search, 2026-10-25.

### Inferences
- ComfyField already covers rank 1. The next biggest gaps for an easy app are ranks 2 to 5: a character / identity library, swap and motion transfer, edit, and upscale. These are the jobs open users do most after the first generation.
- Ranks 8, 10 and 11 (ads, music video, avatars) have the largest mainstream audiences, but tutorials teach them on closed tools. An open app that makes these jobs one click wins users whom ComfyUI does not reach today.
- The competition is SFW only ([Comfy](https://comfy.org/open-source-higgsfield), cited in the existing notes). The adult share of open demand is real but out of scope. The "realism" and "AI influencer" demand that sits next to it is in scope.

### Gaps
- No source gives counts across sites in the same unit. The ranking combines different metrics: lifetime Registry downloads, unlabeled Civitai counts, and YouTube views.
- No Comfy Cloud run counts per template are public.

## Which ComfyUI templates, workflows and node packs are run or downloaded most?

### Takeaway
The official gallery's popular order is mostly video (20 of 30), led by new model launches (FastH3, Qwen Image 2.1 Edit, Seedance 2.5, Wan 3.0, MiniMax H3, LTX-2.5). Lifetime Registry downloads are led by utility packs and video helpers, then face detailing, ControlNet, low-VRAM GGUF, and upscalers. Recent Registry growth is all in MiniMax H3 and Krea 2 Edit packs.

### Cited Findings
- **Comfy template gallery, "Most Popular" sort, top 30 of 662** — [comfy.org/workflows](https://comfy.org/workflows/):
  1. FastVideo FastH3: Image to Video
  2. Qwen Image 2.1: Image Edit
  3. Gemini Omni 1.1 Flash: Image to Video
  4. Wan3.0: Reference to Video
  5. Qwen Image 2.1: Text to Image
  6. HY Image 3.5 Preview: Image Edit
  7. Seedance2.5 1080P: I2V
  8. LTX-2.5: I2V
  9. Seedance 2.5: Reference to Video
  10. Nano Banana 2.1: Image Edit
  11. ...then FLUX 3 Video, MiniMax Music 3 (the only audio entry, #12), MiniMax H3 I2V / R2V / T2V, Seedance 2.5 Video Editing (#22), "Product Advertisement Video" by community creator Rob (#23, the only non-Comfy entry), Wan Animate 2: Motion Transfer (#26), Topaz Image Enhance (#29).
  - The mix is 20 video, 8 image, 1 audio and 1 other. The page shows no run counts.
- **Template catalogue by group (snapshot 2026-09-28, 660 templates)**: Video 203, Image 187, Image Tools 53, 3D 44, Video Tools 42, Audio 37, Character & Fashion 29, LLM 20, Product & Ads 16, Brand & Design 15, Vector 7, Node Basics 7. 56% (368) need a cloud API. Product & Ads is 94% API and Brand & Design 93% — [bestfreewebresources](https://www.bestfreewebresources.com/comfyui-templates-guide-2026). This counts what exists, not what people use.
- **Registry, top packs by lifetime downloads (pulled 2026-10-25)** — [Comfy Registry API](https://api.comfy.org/nodes):
  - Utility and UI packs: KJNodes 4,685,203; rgthree 4,257,720; Easy Use 3,756,239; Custom Scripts 3,112,437; Essentials 3,097,212.
  - Video: VideoHelperSuite 3,630,125; WanVideoWrapper 2,021,205; Frame Interpolation 1,952,645; AnimateDiff Evolved 650,208; HunyuanVideoWrapper 275,693.
  - Face detail and face identity: Impact Pack 3,557,851; Impact Subpack 2,330,908; IPAdapter Plus 1,595,845; ReActor face swap 932,539; AdvancedLivePortrait 489,243; PuLID Flux 411,328; InstantID 383,328.
  - Control: ControlNet Aux 2,774,116; Advanced ControlNet 732,796; DepthAnythingV2 355,753.
  - Low VRAM and speed: ComfyUI-GGUF 2,724,514; gguf 1,062,372; Nunchaku 834,028; TeaCache 619,485; memory cleanup 559,462; WanBlockSwap 397,001; WaveSpeed 280,821.
  - Upscale and restore: Ultimate SD Upscale 1,884,963; SeedVR2 video upscaler 1,116,337; SUPIR 388,343.
  - Editing and compositing: LayerStyle (Photoshop-like) 2,227,363; RMBG background removal 943,356; Inpaint Crop and Stitch 929,603; Inpaint Nodes 524,740; IC-Light relighting 254,765; Qwen edit utils 364,545.
  - Captioning and prompting: Florence2 1,680,025; WD14 tagger 614,241; Ollama 504,562; QwenVL 482,039.
  - Audio: audio separation 376,940; MMAudio (sound for video) 241,229.
  - LoRA management: LoRA Manager 878,753.
- **Registry, top packs created since 2026-05-01 (recent demand)** — [Comfy Registry API](https://api.comfy.org/nodes):
  - Krea 2 Identity Edit (`comfyui-krea2edit`, 110,151)
  - Image and mask resize (94,286)
  - Identity preservation / upscale-pass nodes (`10s-comfy-nodes`, 71,836)
  - MiniMax H3 4-step turbo + LoRA loader (65,107)
  - Spectrum speed-up for H3 (63,052)
  - Krea 2 conditioning (50,303)
  - AI Video Builder nodes (46,450)
  - Prompt-chain / 3D posing suite (45,358)
  - Agent panel, "bring any LLM" (44,153)
  - Krea 2 Ostris edit for ai-toolkit LoRAs (35,355)
  - Further down: H3 Ultimate Upscale for VRAM-limited GPUs (22,422), Krea2 style transfer (17,833), H3 RefMod reference extraction (16,538), H3 prompt IDE (14,717), H3 latent upscaler (13,935), H3 Director timeline (13,643), H3 easy T2V/I2V/R2V (13,389), H3 context loop (12,801), SAM3 auto face inpaint (12,117), H3 multi-shot identity and voice carry (11,229), LTX Director motion brush (10,941), subject-tracked video mask (10,557), body ratio / pose mapper (9,804).
- The PromptZone blog (2026-07-01) says Impact Pack is "the most-downloaded pack after Manager", for face fixing (FaceDetailer) — [PromptZone](https://www.promptzone.com/tara_suzuki/best-comfyui-custom-nodes-in-2026-the-ones-actually-worth-installing-75d). My Registry pull ranks it fifth by lifetime downloads, so this claim is unverified or out of date. Manager itself is not in the Registry list.
- Third-party marketplace MimicPC's "Popular & HOT" list is led by LTX 2.3 T2V, Z-Image base T2I and FLUX.2 Klein editing (older models, own metrics) — [MimicPC](https://www.mimicpc.com/workflows) (per search summary, not fetched).
- OpenArt workflow rankings: I found no public ranking — [search summary](https://openart.ai/de/blog/best-ai-face-swap-tools/).

### Inferences
- Lifetime Registry totals show the jobs people have always run locally: video assembly, face fix, ControlNet pose and depth, low-VRAM tricks, upscaling, background removal and inpainting. Recent packs show the same jobs moving to new models (H3, Krea 2): identity edit, turbo speed, upscale, multi-shot, RefMod identity.
- Packs for speed and low VRAM rank this high because local hardware is the main pain. In a hosted app (Comfy Cloud or a Pod) users skip this whole category.
- Many top new H3 packs add a timeline, director, multi-shot or long-video layer. Users build these UIs by hand inside ComfyUI, so a Flows / storyboard surface meets a demand that already exists.

### Gaps
- No public run counts for templates or Comfy Cloud workflows. The gallery order is the only signal, and its sort rule is not documented.
- Registry downloads are lifetime totals. The API has no 3-month window, so new packs are hard to compare with old ones.
- OpenArt and Civitai workflow-tab rankings were not reachable.

## What are the top Civitai categories and LoRA themes in the last 3 months?

### Takeaway
On the "safe" lists, the top themes are character consistency and person / face / character swap, realism (sliders, photoreal workflows, film texture), editing workflows (outpaint, inpaint, outfit try-on), speed and low-VRAM workflows, and upscale / restore. Base-model activity centres on Qwen Image 2.1, MiniMax H3, Krea 2 and MOSS Image. Sliders (age, realism, lighting, day/night, line weight, camera) are a frequent LoRA format.

### Cited Findings
- **Past quarter, safe, top 40** — [CivArchive top models](https://civitaiarchive.com/top-models):
  - The top 10 includes MOSS Image SFT checkpoint (11K), an uncensored Qwen 2.1 text encoder (7K), Qwen 2.1 Consistency LoRA (6K), Qwen 2.1 age slider (5K), MiniMax H3 Photorealistic LoRA + workflow (5K), H3 "Speed x 6" workflow (5K), Anima line-weight slider (4K) and Krea 2 Photorealism workflow (3K).
  - Ranks 11 to 40 include: Krea2 refusal-reduction LoRA, Qwen detail enhancer, FaceSwap MiniMax REF2VA, MMH3 Realism Slider, Krea2 Anything2RealCharacters, Qwen Person Swap, "Create FULL Character Sheet & Location Sheets" (H3), Qwen 2K Upscale, Qwen Outpaint, H3 Restore Enhance, Krea 2 Camera Sliders, H3 Spectrum speed / memory workflow, LTX-2.5 INT8 low-VRAM workflow, Krea2 prompt-writing LLM system prompt, 2D anime LoRA, H3 Character Swap, H3 Infinite Video Continuation, Qwen Outfit Swap / Virtual Try-On, H3 ref2va checkpoint, camera_motion_h3 LoRA and H3 Turbo.
- **Past month, safe, top 40** — [CivArchive trending](https://civitaiarchive.com/trending-models):
  1. MOSS Image SFT (11K)
  2. Qwen 2.1 Consistency LoRA (6K)
  3. MMH3 Realism Slider (3K)
  4. Qwen Person Swap (3K)
  5. MOSS Base (2K)
  6. Qwen Outpaint Auto Prompt (2K)
  7. H3 Restore Enhance (2K)
  - Further down: H3 Character Swap, Qwen Outfit Swap / Try-On, H3 2D anime-to-realism slider, 3D Animation Style H3, Qwen EditFlow, Qwen Inpaint Click to Mask, Krea2 35mm film realism, "MiniMax-H3 is Secretly an INCREDIBLE Image Generator", H3 RefMod "the same face in every clip, no LoRA" (636), H3 Long Video "One Prompt, Any Length" (607), FLUX 3 Klein Edit (605), Day & Night slider (593) and Basic RefMod Creator (562).
- Theme counts in the monthly top 40 (my tally from the list above):
  - Consistency / character / swap: about 7
  - Realism / style / look: about 9
  - Editing (outpaint, inpaint, try-on, edit flows): about 7
  - Speed / turbo: about 3
  - Restore / detail: about 3
  - Long video: 1
  - Lighting sliders: 2
- An unsourced blog claims "~400,000+" LoRAs on Civitai in 2026 — [Flowith](https://flowith.io/blog/civitai-2026-ecosystem-loras-checkpoints-define-indie-ai-art/) (unverified).
- A practitioner guide lists the common LoRA types as realism enhancement, outfit / clothing, style / aesthetic and pose, and says pose LoRAs are less common — [aiofm](https://aiofm.info/en/guides/civitai-best-practices).

### Inferences
- The Civitai "workflow" type now ranks next to LoRAs. Many top entries are full workflows for one job (person swap, outpaint, try-on, character sheet). People share jobs, not just weights. This maps directly to ComfyField formats.
- "No LoRA training" consistency (RefMod, consistency LoRAs) is rising. Users want identity without a training step.
- Sliders are a popular control pattern (realism, age, lighting, camera). In an app they map to a simple slider control.

### Gaps
- CivArchive counts have no label and no snapshot date, and the site is a mirror, not Civitai. The live Civitai site was not checked.
- The NSFW share of downloads is not measured. The safe lists leave it out by design.

## What are the top-voted posts on r/StableDiffusion, r/comfyui and r/aivideo (Aug to Oct 2026), by use case?

### Takeaway
No data. Reddit blocked every access path I tried.

### Cited Findings
- `https://www.reddit.com/r/{StableDiffusion,comfyui,aivideo}/top.json?t=month` returned an HTML bot-wall page, not JSON (tested 2026-10-25). The web search tool returned no Reddit results for these queries. The earlier open-source landscape notes had the same block.

### Inferences
- YouTube and Civitai cover some of the same audience and show the same themes (H3 character swap, consistency, long video, low VRAM). Reddit would most likely confirm these themes, but this is not verified.

### Gaps
- A human should open each subreddit with Top / Past month and Past year, and tally the top 50 posts by use case. Then compare the tally with the ranking above.

## What do YouTube creators teach most, and how many views do they get?

### Takeaway
By views, the biggest tutorial topics in 2026 are ComfyUI basics (up to 962K), UGC / product ads (130K to 185K per video, plus Higgsfield's 724K), music videos (334K to 611K), consistent characters and long videos (170K), and open voice cloning (684K). The MiniMax H3 setup (259K), upscaling (108K to 169K) and character swap (10K to 37K each, many new uploads) lead the open-model-specific videos. Ads and music video tutorials mostly use closed tools. Talking avatar, try-on and real estate are smaller.

### Cited Findings
All figures are from a YouTube search results scrape on 2026-10-25 with the "this year" filter. Views and ages are as shown on that date.

- **ComfyUI basics:**
  - pixaroma "ComfyUI Course, Full 5 Hour Course" 962,285 (9 months)
  - Kevin Stratvert "How to Use ComfyUI" 357,939 (4 months)
  - Max Novak "Ultimate Beginner Guide (2026)" 123,845
  - official ComfyUI "Node Graph Basics (2026)" 74,093
- **UGC ads:**
  - 100x Engineers "How To Create AI UGC Ads" 185,650 (5 months)
  - ElevenLabs "Viral AI UGC Ads in 2026" 133,200
  - Youri van Hofwegen courses: 84,700 and 77,301 (3 weeks)
  - Nafay 3D "Sell AI UGC Ads for $500 (Free, No Higgsfield)" 71,487 in 4 days
  - Miko 59,263
  - Roboverse "1,000 UGC Ads from ONE Product Image" 32,415
- **Product ads:**
  - Higgsfield AI "3-Step Workflow To Make Ultra-Realistic AI Ads" 724,470
  - Dan Kieft "Cinematic AI Ads with Seedance 2.5" 181,308 (1 month)
  - Mevesa CapCut "One Product Image into a Full Ad" 84,024 (2 days)
  - Thomas Creates "AI Product Ads With Seedance 2.5" 15,445 (4 days)
- **Music video:**
  - FILM CRUX VidMuse tutorial 611,514
  - AI Simplified "AI Music Video for FREE" 334,208, and two more at about 130K
  - Roboverse "Full AI Music Video for Suno Songs" 99,521
  - "Perfect Lip Sync" music video 67,716
- **Consistent character / long video:**
  - Isa does AI "Long AI Videos with Consistent Characters (2026)" 170,311
  - Promptvara "Consistent AI Characters With Seedance 2.5" 53,018 (5 days)
  - consistent AI influencer step-by-step 21,834
  - Curious Refuge consistency hack 20,230
- **AI influencer (ComfyUI):**
  - Dream OFM "Realistic AI Videos With ComfyUI WAN 2.2" 73,993
  - smallzero "ComfyUI AI Influencer Starter Guide (2026)" 20,873
  - Json "AI Influencer Dataset Workflow (FREE and Local)" 19,010 (11 days)
  - Tensor Works "AI influencer with ComfyUI WAN 2.2" 14,228
- **Motion control / dance (open):**
  - AxiomGraph "Transfer Motion From Video to AI Character LTX 2.3" 22,483
  - SCAIL-2 motion transfer 9,819, 4,269 and 3,244 ("No GPU Needed")
  - The views are much lower than for ads or character videos.
- **Character swap (open, MiniMax H3), mostly uploaded in the last 2 to 4 weeks:**
  - The Ai Blueprint 36,573
  - MDMZ "Replace Anyone in Any Video with MiniMax H3" 35,711 (3 days)
  - Patrick Sheedy 15,745 and 9,591
  - Veteran AI "H3 Character Swap 1.5" 10,684
- **Talking avatar / lip sync:**
  - Hindi AI Gyaan "Ultra Realistic Talking AI Avatars for FREE" 112,654
  - ElevenLabs "Lip Sync any Audio to Video" 80,481
  - most other "free avatar" videos have under 2K views
- **Upscaling:**
  - Mickmumpitz "STOP Paying for AI Upscaling, This FREE Tool is BETTER" 169,250
  - Matt Hallett "LTX Refine & Restore" 109,898 (3 weeks)
  - MDMZ "SeedVR 2.5 FREE AI Video Upscaler to 4K" 108,335
- **Model setup (open):**
  - MDMZ "How To Use MiniMax H3 in ComfyUI: Best FREE AI Video Model of 2026" 258,875 (2 months)
  - pixaroma Krea 2 Edit + H3 68,373; Krea 2 workflows 56,598; Krea 2 LoRA training 32,064
  - FutuTek LTX 2.5 all-in-one 46,436
  - smallzero LTX 2.5 43,831
  - "Fastest MiniMax H3 Setup on 12GB VRAM" 8,497
  - "4K AI Videos on a 6GB GPU? MiniMax H3" 2,871
- **Audio:**
  - Jeff Geerling "ElevenLabs just got nuked by open source" 683,770
  - Better Stack Voicebox 124,534 and VoxCPM 81,437
  - mikbes "Clone Your Voice for FREE, Open-Source Alternative to ElevenLabs" 74,289
- **Virtual try-on:** the top is The New Black at 55,214 (8 months). Most are under 15K.
- **Real estate:**
  - Market U "Real Estate Photos Into a Cinematic Walkthrough (Higgsfield + Kling)" 105,722
  - other videos at 16K to 21K

### Inferences
- **Open-model creators** teach three things most: setup (install, low VRAM), swap / consistency, and upscale. Their titles sell "FREE", "local", "no GPU", "no LoRA training" and "STOP paying".
- **Mainstream creators** teach finished jobs, such as an ad from one product image or a music video from a song, on hosted tools. ComfyField can give those jobs the open-model price advantage without the setup.
- "Sell AI UGC Ads for $500 (Free, No Higgsfield)" reached 71K in 4 days. It shows an audience that wants the Higgsfield job without the Higgsfield subscription, which is exactly ComfyField's pitch.

### Gaps
- Logged-out US search results give a sample, not a full ranking. No total view count per topic exists.
- I found no reliable channel-level analytics (for example, Social Blade by topic).

## What do marketers and UGC / ad agencies use open models for, compared with closed tools, and why choose open?

### Takeaway
I found no survey of marketers. The evidence is indirect. Ad tutorials use closed tools (Seedance, Kling, Higgsfield, HeyGen, CapCut), and Comfy's own Product & Ads templates are 94% cloud API. The reasons to choose open come from tutorial framing and vendor guides: lower per-second cost, no subscription, uncensored output, LoRAs and identity control, local privacy, and no vendor lock-in.

### Cited Findings
- Comfy templates: Product & Ads 15 of 16 are API (closed) and Brand & Design 14 of 15 are API. Only 1 local template exists in each group — [bestfreewebresources](https://www.bestfreewebresources.com/comfyui-templates-guide-2026).
- The only community entry in the gallery's top 30 is "Product Advertisement Video" (Rob, #23) — [comfy.org/workflows](https://comfy.org/workflows/). comfy.org also lists "Swap Product in Character's Hand, UGC Style" and an LTX-2.3 IC LoRA product placement workflow — [search summary of comfy.org tag pages](https://comfy.org/es/workflows/tag/replacement/).
- **Vendor cost claims** (all vendor-written, so treat them as list prices):
  - LTX-2.5 is the "best free open-source model", with open weights free for most small companies.
  - MiniMax H3 hosted costs about $0.08/s at 768p.
  - Kling 3.0 costs from $0.07/s at 1080p.
  - HeyGen's own model costs $0.03/s at 768p with audio.
  - Arcads costs $11+ per video.
  - Sources: [HeyGen blog](https://www.heygen.com/blog/cheapest-video-models), [Pickaxe](https://pickaxe.co/post/top-ai-video-generators), [adlibrary](https://adlibrary.com/posts/best-ai-ugc-video-generators) (per search summary).
- **Reasons to choose open** (vendor and analyst arguments, not marketer surveys):
  - LoRA fine-tuning for consistent brand output, as small portable adapters.
  - Self-hosting so data does not leave the company.
  - No vendor pricing or lifecycle risk.
  - Sources: [Layer3 Labs](https://www.layer3labs.io/open-weights/fine-tuning-open-weights-models), [perform.digital](https://perform.digital/blogs/open-vs-closed-models/).
- **Creator framing on YouTube** (2026-10-25 scrape): "Free, No Higgsfield" (UGC ads, 71,487 in 4 days), "STOP Paying for AI Upscaling" (169,250), "Open-Source Alternative to ElevenLabs" (74,289), "Local Uncensored" (33,089 in 12 hours), "No LoRA Training! Create Consistent AI Characters with RefMod" ([YouTube](https://www.youtube.com/watch?v=-CfyYOcsnVw)).
- AI influencer / OFM operators run open pipelines in ComfyUI for realism and identity control: "My $300k/mo Full AI OFM Content Pipeline (ComfyUI)" (6,397 views), "Dream OFM" channel 73,993 (YouTube scrape). The revenue figure is the creator's own unverified claim.

### Inferences
- Marketers use closed tools for the finished ad (avatar UGC, product hero shots, cinematic B-roll). They reach for open models for parts of the pipeline: identity / likeness consistency, swap, upscale, background removal and voice. An open app that ships ready ad formats (product-in-hand, URL-to-ad, UGC testimonial) on open or Router models fills a gap that even Comfy's own templates leave to closed APIs.
- Cost alone is a weak reason to choose open, because hosted open-model prices are close to Kling's. The stronger reasons are control (LoRA, identity, no refusals) and no subscription.

### Gaps
- No 2026 survey or agency case study compares open and closed stacks with real spend.
- A Similarweb traffic split for AI creative tools in 2026 was not found. The Similarweb connector needs authorization in this session.
- The a16z Top 100 (6th edition, March 2026) lists CapCut and Canva, but I could not read its creative-tools ranking — [a16z](https://a16z.com/100-gen-ai-apps-6/). It is also older than the Aug to Oct window.

## What pain points push users from ComfyUI to hosted apps?

### Takeaway
The main pain points:
- **Hardware and memory.** VRAM limits and 2026 dynamic-VRAM out-of-memory regressions.
- **Download size and model management.** A median 23.4 GB per local template, and missing-model detection that fails.
- **Graph complexity.** Comfy itself answered it with App Mode in March 2026.
- **Two types of templates.** Half the templates need paid API keys anyway.

Each of these is a gap that a hosted, job-first app removes.

### Cited Findings
- Local templates need a median of 23.4 GB of downloads (mean 26.6 GB), and the full local set is about 7.2 TB. Only 13 local templates are under 2 GB. ComfyUI looks for model files only in the top-level folder, so it can ask users to re-download files they have. "Free to load is not the same as free to run" (snapshot 2026-09-28) — [bestfreewebresources](https://www.bestfreewebresources.com/comfyui-templates-guide-2026).
- A regression after the 2026-08-03 update crashes all generations with a `HostBuffer.read_file_slice` error that leads to CUDA OOM. The workaround is `--disable-dynamic-vram` — [GitHub issue #15255](https://github.com/Comfy-Org/ComfyUI/issues/15255?timeline_page=1%3Ftimeline_page%3D1).
- A March 2026 change made dynamic VRAM the default. Some users got device-mismatch errors and had to rewrite nodes — [GitHub discussion #12699](https://github.com/Comfy-Org/ComfyUI/discussions/12699).
- A third-party guide reports an over-pinning bug in comfy-aimdo 0.4.9 that caused OOM during LTX 2.3 runs (fixed in 0.4.10) — [localaimaster](https://localaimaster.com/blog/comfyui-out-of-memory-dynamic-vram) (third-party, unverified).
- Demand for low-VRAM workarounds in the Registry (lifetime): GGUF 2.72M, gguf 1.06M, Nunchaku 0.83M, TeaCache 0.62M, memory cleanup 0.56M, WanBlockSwap 0.40M, unload-model 0.28M. Recent packs: H3 Ultimate Upscale "on a VRAM-limited GPU" (22,422), uniblockswap "for 4 to 6 GB users" (18,859), H3 sparse-attention memory optimizations (9,944) — [Comfy Registry API](https://api.comfy.org/nodes).
- YouTube titles that sell around hardware: "Fastest MiniMax H3 Setup on 12GB VRAM", "4K AI Videos on a 6GB GPU?", "SCAIL-2 Motion Transfer FREE (No GPU Needed)", "LTX 2.5 on RTX 3060" (YouTube scrape 2026-10-25).
- Civitai top lists include speed and low-VRAM workflows: H3 "Speed x 6" (5K), H3 Spectrum "Memory Optimized" (2K), LTX-2.5 INT8 "Low Vram" (2K) — [CivArchive](https://civitaiarchive.com/top-models).
- Comfy launched App Mode and ComfyHub (2026-03-10) so that people can run workflows "without touching a node graph". This is Comfy's own admission of the complexity pain point, already cited in `open_source_landscape.md`.
- Registry packs that rebuild a simple UI inside ComfyUI: "comfyui-minimaxh3-easy" (13,389), "XB_ToolBox ... streamlines workflow generation" (18,885), "comfyui-agent-panel" autonomous agent in the sidebar (44,153), "h3-prompt-ide" (14,717) — [Comfy Registry API](https://api.comfy.org/nodes).

### Inferences
- The gaps an easy app can fill, in order of evidence strength:
  1. No GPU, no VRAM tuning (a hosted Pod or Cloud).
  2. No model downloads or missing-file hunts.
  3. Job-first screens in place of graphs (swap, consistency, upscale, ad from product).
  4. Built-in prompt help (prompt IDE and LLM prompt-writer packs are popular).
  5. Long-video and multi-shot tools that users now patch together with many custom nodes.
- ComfyField's Pod / Cloud-only rule fits the strongest pain points directly.

### Gaps
- No numbers on how many ComfyUI users leave for hosted apps, or why. Reddit, where most of these complaints are posted, was not reachable.
