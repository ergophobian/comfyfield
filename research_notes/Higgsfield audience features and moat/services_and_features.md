# Higgsfield AI: complete product surface and feature inventory (as of 2026-10-16)

Scope note: Higgsfield ships very fast. Its official changelog alone has about 100 entries between 2 June and 13 October 2026 ([Changelog](https://higgsfield.ai/creator-hub/changelog)). Dates in the changelog's visible list and its structured data can differ by 1 to 4 days for the same entry (for example, Cinema Studio 4.0 shows as 11 Aug in one and 12 Aug in the other; Seedance 2.5 as 3 Aug and 7 Aug) ([Changelog](https://higgsfield.ai/creator-hub/changelog)). Treat any changelog date as accurate to within a few days. Many sources below are Higgsfield's own marketing pages, so their claims are self-reported.

## 1. Video features: what exists, inputs/outputs, models, and UI surface

### Takeaway
Higgsfield's video surface has grown in layers. The base is the 2025 camera-motion preset library (DoP) and one-click viral effects. On top sit pro studios (Cinema Studio 4.0, Popcorn storyboards), identity tools (Recast, Genjutsu), talking-head and lipsync tools (Speak, Lipsync Studio), ad builders (UGC Builder, Click to Ad, Ads Studio, Ad Multiplier) and, in 2026, agentic production (Supercomputer, MCP skills). Almost all raw generation runs on third-party models (Kling, Seedance, Veo, Sora, Wan, MiniMax, Grok, Gemini Omni). Higgsfield's value is mostly in the preset, camera, reference and workflow layer on top.

### Cited Findings

#### Camera control and motion presets ("DoP", the original moat)
- Higgsfield launched "DoP I2V-01-preview", an image-to-video model whose highlighted camera moves include Bullet Time, Crash Zoom In and Robo Arm. The announcement cites "50+ camera motions" — [Higgsfield blog via search snippet](https://higgsfield.ai/blog/Introducing-Higgsfield-DoP-preview) (page body returned 404 on direct fetch).
- A third-party listing dates the DoP release to 2025-03-31, lists 20+ presets, three quality tiers (Lite, Turbo, Preview) and a 0 to 1 motion-strength slider — [Clipia](https://clipia.ai/en/video-models/higgsfield-dop). Segmind's API listing names the same Lite/Turbo/Preview tiers — [Segmind](https://www.segmind.com/models/higgsfield-image2video).
- Preset counts conflict: 50+ (Higgsfield), "well over 100" ([Kolbo](https://kolbo.ai/blog/higgsfield-suite-100-camera-presets)), 20+ ([Clipia](https://clipia.ai/en/video-models/higgsfield-dop)).
- The help center groups motion presets into Effects, Basic Camera Control, Epic Camera Control and Catch the Pulse, with a "Mix" option for combining presets — [Higgsfield help center](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-dop). An April 2025 newsletter said the motion options could not be combined, unlike Luma's — [Heather Cooper Substack](https://heatherbcooper.substack.com/p/midjourney-v7-is-finally-here). Mix probably came later (inferred).
- Higgsfield's guidance says the preset, not the prompt wording, sets the camera logic, and that output quality depends on how sharp the input image is — [Higgsfield help center](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-dop).
- Kling 3.0 on Higgsfield is sold with "Cinema Studio tools with 50+ camera presets", so the camera preset layer is applied across third-party models — [Higgsfield Kling 3.0 page](https://higgsfield.ai/kling-3.0).

#### Core text-to-video and image-to-video (model picker)
- The video generator lives at `/ai/video?model=<id>`. The homepage deep-links to `model=wan3_0`, `model=genjutsu` and `model=seedance_2_5&resolution=1080p` — [Higgsfield homepage](https://higgsfield.ai).
- Third-party video models added or updated on Higgsfield in 2026 include Wan 3.0 and Wan 3.0 Prime (up to 30 s, 1080p, audio sync; 23 Aug 2026), Seedance 2.5 (up to 30 s, synced audio, region-level edits; 3 to 7 Aug 2026), Seedance 2.5 Draft Mode (480p preview, then a 1080p render with the same settings; 22 Sep), Seedance 2.0 in 4K and Seedance 2.0 Mini (June 2026), Kling 3.0 Turbo (June), Grok Video 1.5 (June) and Grok Imagine Video 1.5 (synced sound, extension, 1080p; 1 Oct), Gemini Omni Flash (26 Jun) and Gemini Omni 1.1 Flash (first and last frames, draft mode; 28 Aug), and MiniMax H3 Max (768p; 31 Aug) — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Kling 3.0 on Higgsfield offers multi-shot (up to 6 camera cuts per generation, each with its own shot size, perspective and camera move), native audio (dialogue, SFX, ambience) with "Voice Binding", up to 15 s at a custom length, native 4K, native lipsync and "Element Consistency" for characters from reference images or video — [Higgsfield Kling 3.0 page](https://higgsfield.ai/kling-3.0).
- The Kling 3.0 page's "explore" links also name Sora 2, Sora 2 Upscale, Wan 2.6, Wan Animate, Grok Imagine, Seedance, Seedance 2.0, Veo 3.1, MiniMax and MiniMax H3 — [Higgsfield Kling 3.0 page](https://higgsfield.ai/kling-3.0).
- Earlier model guides on the Higgsfield blog: Veo 3.1 (14 Oct 2025), MiniMax Hailuo 2.3 (26 Oct 2025), Kling O1 video and edit model (30 Nov 2025), Wan 2.6 (14 Dec 2025), Kling 3.0 (12 Feb 2026) — [Higgsfield blog index](https://higgsfield.ai/blog).
- Start/end frame control is exposed where the model supports it, for example Gemini Omni 1.1 Flash "with first and last frames" — [Changelog](https://higgsfield.ai/creator-hub/changelog).

#### Cinema Studio (pro camera tool, in-house UX on interchangeable models)
- Version 1.0 shipped on 18 Dec 2025 with camera body, lens, focal length, camera movement and slow motion. Settings and metadata are saved with each image, so a still's look carries into video — [Inside Higgsfield: How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio).
- 1.5 added aperture and recommended camera presets. 2.0/2.5 added Elements, 3D Scene, Character Motions, locations and "Soul Cinema". 3.0 came in about April 2026 (its post is dated 30 Mar 2026). 3.5 came ten days later with genre-based camera movement, video-first generation, Projects for consistent style, and "AI Director", which later became Supercomputer. Older versions can still be selected (users asked for 2.5) — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio).
- 4.0 (11 to 12 Aug 2026): generations of up to 30 s (up from 15), up to 50 references, emotion and camera controls, Montage Pacing, AI Cast, Cinematic Locations, Soul Cinema models, multi-model support, an "anti-slop camera pipeline", and team tools organised around Genre, Camera Settings and Pacing. The FAQ lists resolution as "up to 720p" — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio); [Changelog](https://higgsfield.ai/creator-hub/changelog); [Cinema Studio 4.0 post](https://higgsfield.ai/blog/cinema-studio-4-0).
- UI pattern: you pick a camera from a curated pool through a switcher that mimics loading a real rig, then a lens, then a focal length. Lenses were hand-tuned, and lenses the model couldn't reproduce were dropped. A prompt "enhancer" rewrites the user's prompt — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio).
- Cinema Studio became a dedicated workspace with projects and element tagging on 6 to 8 Jun 2026 — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- The camera, lens and craft layer is "not tied to any one model", and Cinema Studio is "built on top of interchangeable video models" — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio).

#### Viral effects and preset templates
- The Effects hub (`/effects`, `/effects/use/{slug}`, `/effects/examples/{slug}`) currently features presets such as Floating fall, High flip, Burning man, Studio slide, Incline, Act natural, Eyes in, Street colossus, Melting, Wild ride, Cutout, World morphing, Smash and grab, Selfception and Lacewalker — [Higgsfield homepage](https://higgsfield.ai).
- "Viral Presets": 13 new short-form trend styles generated from an uploaded image (6 to 8 Aug 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- "Effects 2.0" (10 Sep 2026) applies viral-style video presets to a photo inside ChatGPT — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- SaaStr calls the core concept "Click-to-Video": upload an image, pick a preset (for example Roller Coaster, Billboard Ad, Bullet Time Scene) and get a clip of about 5 s with no prompt — [SaaStr](https://www.saastr.com/saastr-ai-app-of-the-week-higgsfield-the-video-ai-platform-thats-crushing-it-where-everyone-else-is-still-prompting/).

#### Storyboards and multi-shot: Popcorn, Shots, Transitions, Angles
- Popcorn is a storyboard and image-sequence tool. You start from a prompt and/or up to 4 reference images. A sequence holds up to 8 frames that keep characters, style and atmosphere consistent. Manual mode means one prompt per frame; Auto mode means one prompt plus a frame count (4, 6 or 8). Aspect ratios are 3:4, 2:3, 3:2, 1:1 and 9:16. Longer stories chain the last frame in as the next reference. Approved boards export to Sora 2 to become video — [Higgsfield Popcorn post, 23 Oct 2025](https://higgsfield.ai/blog/The-AI-Storyboard-Generator-That-Feels-Like-Directing); [Popcorn storyboard guide, 22 Oct 2025](https://higgsfield.ai/blog/How-to-Use-AI-for-Storyboards-Higgsfield-Popcorn).
- Popcorn also supports "recasting" a role (identity replacement in movie scenes) — [Higgsfield blog](https://higgsfield.ai/blog/AI-Tool-That-Allows-You-to-Replace-Faces-in-a-Movie-Scene).
- Apps "Shots" (9 different shots from one image), "Angles 2.0" (alternate angle views, Pro) and "Transitions" (seamless transitions between shots, marked Trending) — [Higgsfield Apps](https://higgsfield.ai/apps).

#### Character swap, motion transfer and video edits: Recast, Genjutsu, Katana, Omni VFX
- Recast is "character swap for video" (Pro) and Video Face Swap is a separate app — [Higgsfield Apps](https://higgsfield.ai/apps). Coverage describes Recast as replacing the person in existing footage with an AI character doing the same movements ("Recast Studio") — [TikTok creator post](https://www.tiktok.com/@brightchuksm/video/7572681171851693330); [AI Haus community](https://www.skool.com/the-ai-haus-5388/testing-higgsfields-new-recast-feature).
- Genjutsu (31 Aug to 1 Sep 2026) rebuilds one element of a real video (the person, setting or an object) and leaves the rest as filmed. Inputs are one video of 4 to 30 s, up to 30 reference images and an optional short description or preset. Output is up to 1080p. Modes are Motion Transfer and Object Swap, with 30+ presets. A 15 s clip costs 40/104/144 credits (about $2.00/$5.20/$7.20) at 480p/720p/1080p — [Meet Higgsfield Genjutsu](https://higgsfield.ai/blog/higgsfield-genjutsu).
- Genjutsu Restyle (30 Sep 2026) restyles a whole video and keeps the motion — [Changelog](https://higgsfield.ai/creator-hub/changelog). The homepage promotes a "Genjutsu API" at open.higgsfield.ai/explore and a Genjutsu presets page — [Higgsfield homepage](https://higgsfield.ai).
- Katana (8 to 12 Oct 2026) is a Claude skill used over the Higgsfield MCP connector. It recreates a reference edit (your own or from the Katana preset library) with up to 5 photos of your characters, products or clothing, keeping the reference's shot order, pacing, cuts, duration, aspect ratio and frame rate. Preset categories are Personalized edits, Style transfer and Motion transfer. You invoke it with `/katana` or `/katana/<preset>`, and output is saved to Assets. It "runs on Higgsfield models", which are not named — [Higgsfield Meets Katana](https://higgsfield.ai/blog/higgsfield-katana); [Changelog](https://higgsfield.ai/creator-hub/changelog).
- "Omni VFX": editing real footage with Gemini Omni Flash — [Higgsfield blog](https://higgsfield.ai/blog/Higgsfield-Omni-VFX). Shorts Studio (29 Jun to 1 Jul 2026) restyles uploaded footage with 44 presets or a custom moodboard, powered by Gemini Omni Flash — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Relight and Color Palette/HEX (20 to 21 Aug 2026) are standalone video lighting presets and 50+ color-grading presets — [Changelog](https://higgsfield.ai/creator-hub/changelog).

#### Talking heads, lipsync and avatars: Speak, Lipsync Studio, AI Influencer
- Higgsfield Speak makes "cinematic talking-head videos" — [Higgsfield Speak post](https://higgsfield.ai/blog/The-Fastest-Way-to-Create-Cinematic-Talking-Head-Videos). It was reported as available to Pro and Ultimate subscribers and producing lip-synced digital-human videos — [AIbase](https://news.aibase.com/news/18695).
- A speech flow described in a Higgsfield guide: pick from 40+ templates, upload an image, type the line, then set voice, emotion, language and accent (accent options adapt to the image) — [Higgsfield guide (attribution from search snippet; verify)](https://higgsfield.ai/blog/Create-Selling-Content-Using-Higgsfield).
- Lipsync Studio was announced on X on 18 Sep 2025, with engines Speak 2.0, InfiniteTalk, Sync.so, Kling Lipsync and Veo 3 — [Higgsfield X account (via search summary)](https://x.com/higgsfield_ai?lang=en); demo at [YouTube](https://www.youtube.com/watch?v=0hDrFCx_iU8).
- A 2026 lipsync guide covers avatars, voice and consistency — [Higgsfield blog, 7 Jul 2026](https://higgsfield.ai/blog/make-ai-lipsync-videos).
- AI Influencer (2 to 3 Oct 2026): build AI characters and place them into videos, from the AI Influencer studio at `/ai-influencer-studio` — [Changelog](https://higgsfield.ai/creator-hub/changelog); [Introducing the new AI Influencer](https://higgsfield.ai/blog/new-ai-influencer); [Higgsfield homepage](https://higgsfield.ai).

#### Ads, UGC and product video
- UGC Builder (about 16 Jul 2025): upload a face or pick an avatar, choose a camera motion, then add an action prompt, emotion, accent and background sound. It was powered by Veo 3 at launch — [Higgsfield UGC Builder post](https://higgsfield.ai/blog/Higgsfield-UGC-Builder-Gives-You-the-Director-Every-Scene); [Higgsfield X post](https://x.com/higgsfield_ai/status/1945568179637686619). A 2026 review says it now runs on Veo 3 and Seedance 2.0 — [McStarters review (via search summary)](https://mcstarters.com/blog/higgsfield-ai-review/).
- "Click to Ad" (Pro) turns a product link into UGC or video ads. Billboard Ad, Truck Ad, Bullet Time Scene and Bullet Time White are product-placement and packshot templates — [Higgsfield Apps](https://higgsfield.ai/apps).
- Marketing Studio was relaunched on 18 Aug 2026 — [Higgsfield blog](https://higgsfield.ai/blog/new-marketing-studio-higgsfield). A community skill describes it as a top-level nav item — [skills.sh](https://www.skills.sh/osidemedia/higgsfield-ai-prompt-skill/higgsfield-canvas).
- Ads Studio (30 Sep to 1 Oct 2026) turns a website link into branded static ad creatives. Ad Multiplier (6 Oct 2026) recreates a video ad with your own characters, products and locations, and an earlier Claude MCP skill version (24 to 25 Aug) keeps pacing and audio — [Changelog](https://higgsfield.ai/creator-hub/changelog); [Ads Studio post](https://higgsfield.ai/blog/higgsfield-ads-studio); [Ad Multiplier post](https://higgsfield.ai/blog/ad-multiplier-ads-studio).
- "Virality Predictor" app predicts how viral a video hook is before you post — [Higgsfield Apps](https://higgsfield.ai/apps).

#### Draw-to-Video (sketch control)
- Announced 13 Aug 2025: sketch shapes, text and arrows on top of a still and generate motion. At launch it worked with MiniMax, Veo 3 and Seedance Pro, and was promoted as "possible ONLY in Higgsfield" — [Higgsfield X post](https://x.com/higgsfield_ai/status/1955742643704750571). A later update lets you insert products, outfits or objects into a frame without a text prompt — [Curious Refuge](https://curiousrefuge.com/blog/how-to-use-higgsfield-draw-to-animation).

#### Long-form and explainer formats
- Higgsfield Explainer and Video Explainer skill (1 to 3 Jul 2026): narrative stylised videos with one voiceover, with visual style, voice and motion controls — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Faceless Studio (19 to 20 Aug 2026): animated faceless videos from a topic, style and narrator voice — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Motion graphics: Vibe Motion is a Claude-powered, no-code tool that turns plain-English prompts into editable motion graphics and the animation code behind them, at 8 to 60 credits per generation — [Let's Data Science](https://letsdatascience.com/news/higgsfield-launches-vibe-motion-for-no-code-motion-graphics-2a75ae89); [Postium](https://postium.ru/higgsfield-zapustil-vibe-motion/). AI Motion Designer (11 Sep 2026) builds motion graphics in an open After Effects composition, and Presets for After Effects (15 Sep 2026) adds 7 motion workflows — [Changelog](https://higgsfield.ai/creator-hub/changelog).

#### Upscaling, extension, background removal
- Video upscalers: ByteDance Upscale (to 4K, with frame interpolation up to 60 fps; 14 to 16 Jun 2026) and FLUX 3 Video Upscaler (1080p/2K/4K in precise or creative modes; 27 to 28 Aug 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog). "Sora 2 Upscale" is listed as a separate page — [Higgsfield Kling 3.0 page](https://higgsfield.ai/kling-3.0).
- Extension is model-dependent, for example Grok Imagine Video 1.5 "with... extension" — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- The Video Background Remover app — [Higgsfield Apps](https://higgsfield.ai/apps).

#### 3D, games and apps
- 3D Jutsu (4 to 5 Sep 2026): an AI 3D workspace that turns prompts into editable scenes with cameras, lighting and animation — [Changelog](https://higgsfield.ai/creator-hub/changelog); [3D Jutsu post](https://higgsfield.ai/blog/higgsfield-3d-jutsu).
- Higgsfield Gaming (10 to 11 Jun 2026; browser-playable games from prompts) and Games 2.0 on GPT-6 Astra (6 to 7 Sep 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog); [Games 2.0 post](https://higgsfield.ai/blog/higgsfield-mcp-gpt6-astra-games-2).

#### Audio
- Audio redesign (10 Aug 2026): a new Qwen-based model with TTS, voice change and lipsync translation — [Changelog](https://higgsfield.ai/creator-hub/changelog). The audio guide covers voice, music and sound effects for AI video — [Higgsfield Audio](https://higgsfield.ai/blog/higgsfield-audio).
- Seed Audio 1.0 (ByteDance; speech, SFX and music in one pass; 25 to 27 Jun 2026) and Eleven v4 (ElevenLabs; multi-speaker TTS in 90+ languages; 28 Sep 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Higgsfield Audio in MCP (25 to 26 Jun 2026): voiceover, voice cloning and translation from Claude — [Changelog](https://higgsfield.ai/creator-hub/changelog).

### Inferences
- The best-supported in-house video assets are UX and data layers: curated camera/lens/motion presets, prompt enhancers, viral templates, reference/element management and agent skills. The raw pixel generators are mostly licensed third-party models (inferred from [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio) and the model attributions in the [Changelog](https://higgsfield.ai/creator-hub/changelog)).
- Recast probably launched around mid-November 2025 (inferred from the TikTok post ID timestamp in the [TikTok post](https://www.tiktok.com/@brightchuksm/video/7572681171851693330); not confirmed by Higgsfield).
- Speak 1.0 predates Lipsync Studio (Sep 2025), since Lipsync Studio already shipped "Speak 2.0" (inferred).
- Recurring 2026 pattern: features ship first as a Claude/ChatGPT MCP skill, then as a standalone web studio, or the other way round (Ad Multiplier: MCP skill in Aug, Ads Studio feature in Oct; Effects 2.0 inside ChatGPT). Inferred from the [Changelog](https://higgsfield.ai/creator-hub/changelog).

### Gaps
- No official launch date found for Speak, Recast, Higgsfield "Assist"/Copilot, or Higgsfield's own video upscaler. The site navigation references a "Copilot" product, but its function was not confirmed (search snippet only).
- No confirmed current count of the camera-motion preset library or the Effects library. Counts in sources range from 20+ to 100+.
- The full current video model picker was not visible: `/ai/video` and `/pricing` returned only metadata to the fetch tool, because the pages are client-rendered.
- Could not confirm whether DoP is still a selectable model in 2026 or has been folded into camera presets over third-party models.

## 2. Image features: Soul, Soul ID, editing, swaps, product and fashion

### Takeaway
Soul, now Soul 2.0 plus "Soul Cinema", is Higgsfield's flagship in-house image model. It is preset-driven, has a fashion/editorial look, and ships with Soul ID character training. Most other image features are apps or third-party editors (Nano Banana, Seedream, GPT Image, FLUX, Ideogram, Recraft) wrapped in task-specific apps: face swap, outfit swap, headshots, relight, expand, upscale and background removal.

### Cited Findings
- **Soul (v1)** launched about 25 to 26 Jun 2025. It is built around realism, cultural relevance and style, offers 50+ curated presets (for example iPhone flash, Dune-core, masked looks, giant hands), returns 4 images per request, adds dust, flash and grain for a camera-like look, and was free across all plans at launch — [Higgsfield SOUL post](https://higgsfield.ai/blog/Higgsfield-SOUL-Turns-Prompts-Into-Fashion-Ready-Shots); [Higgsfield post, 26 Jun 2025](https://higgsfield.ai/posts/50ogWiu9kVYbWw3spQjWIR).
- 20 "experimental" presets (Escalator, Library, Subway and others) were added on about 16 to 17 Jul 2025, when paid plans started at $9 — [Introducing 20 New Experimental Presets](https://higgsfield.ai/blog/Introducing-20-New-Experimental-Presets).
- **Soul ID** (character consistency and custom identity training) was released on 10 Jul 2025 — [Design Offset](https://design-offset.com/20250710-higgsfield-soul-id-release/). Higgsfield guides cover Soul ID consistency across images and video — [Soul ID guide](https://higgsfield.ai/blog/Soul-ID-AI-Character-Consistency); [Keep AI character consistent](https://higgsfield.ai/blog/keep-ai-character-consistent). Training photo requirements conflict: a minimum of 20 photos (Higgsfield FAQ) vs 20 to 80 (third-party guide) (search snippet; not independently verified).
- **Soul 2.0** existed by February 2026 (Higgsfield guides dated 23 and 26 Feb 2026 cover HEX-code color control and "photodump" generation) and launched with 20+ presets — [HEX color control with Soul](https://higgsfield.ai/blog/hex-codes-ai-image-generation-color-control-soul); [Photodump with Soul 2.0](https://higgsfield.ai/blog/how-to-create-ai-photodump-higgsfield-soul); [Soul 2.0 intro](https://higgsfield.ai/soul-intro). Soul 2.0 has curated "Moodboards" (a fix was logged in July 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Higgsfield compares Soul 2.0 head to head with Nano Banana Pro — [Soul 2.0 vs Nano Banana Pro](https://higgsfield.ai/blog/soul-2-vs-nano-banana-pro). A BGR article covers combining Soul images with Veo 3 for viral video — [BGR](https://bgr.com/tech/higgsfield-soul-and-google-veo-3-combine-to-make-the-ultimate-viral-ai-video-generator/).
- **Soul Cinema** models are part of Cinema Studio 2.0/2.5 and later 4.0 — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio). A "Soul Cinema failures fixed" entry appears on 21 to 26 Jun 2026 — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- **Nano Banana integrations**: "Banana Placement" (product insertion) was announced 9 Sep 2025. Other surfaces are Nano Banana Pro Inpaint (structure-preserving local edits) and multi-reference composition — [Higgsfield Nano Banana page](https://higgsfield.ai/nano-banana-intro). Nano Banana Pro guide dated 18 Nov 2025 — [Higgsfield blog](https://higgsfield.ai/blog/Nano-Banana-Pro-is-Here-Full-Review-and-Guide). Nano Banana 2 Lite (fast 1K; 29 to 30 Jun 2026) and Nano Banana 2.1 (up to 4K, 14 references, better text; 5 to 6 Oct 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog); [ABAB News](https://www.ababnews.com/news/80c1eab3-8ed8-4950-8533-61026a47066b).
- Other third-party image models added in 2026: Seedream 5.0 Pro (infographics, point-level editing, multilingual text; 7 to 8 Jul), Seedream 5.0 Flash (multi-reference blending and editing; 23 Sep), GPT Image 2.5 Flare (speed) and Sunburst (precise edits) (22 Sep), FLUX 3 Image (up to 4K, text rendering; 1 Oct), Ideogram 4.5 (text replacement, transparent backgrounds; 30 Sep), Recraft v4.1 (native SVG vectors; 2 to 3 Jun) and Recraft V4 Styles and Utility (27 Aug) — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- **Layers** (11 Aug 2026) splits flat images into independently editable elements — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- **Image apps** — [Higgsfield Apps](https://higgsfield.ai/apps):
  - Face & Identity: Face Swap, Headshot Generator, Character Swap 2.0, Recast (video), Video Face Swap.
  - Enhance & Style: Skin Enhancer (Pro), AI Stylist (virtual fitting room, New), Relight (light position, color and brightness, Pro), Outfit Swap (try on from one photo), Style Snap.
  - Professional: Expand image (outpainting), Angles 2.0, Shots.
  - Utility: Background Remover, Breakdown (split an image into components).
  - Novelty: Game Dump (12 video-game styles), Nano Strike, Nano Theft, Simlife, Plushies, AI Meme Generator, Micro-Beasts, Signboard, Paint App, Japanese Show, On Fire ("This is fine"), Skibidi, Mukbang, Cloud Surf, Idol.
  - Listed in JSON-LD but not shown as cards: 3D Rotation, 3D Render, Mugshot, Sticker Match Cut, 3D Figure, Behind the Scenes.
- The homepage metadata summarises the feature set as "Face swap, virtual try-on, cinema studio, motion transfer, object swap, 40+ creative AI tools" — [Higgsfield homepage](https://higgsfield.ai).
- In the Photoshop plugin, Higgsfield exposes "AI Image, Mockup Studio, and Cinema Studio" (15 Jun 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Scale plans include unlimited Nano Banana Pro and Seedream 5.0 Pro (3 Sep 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog).

### Inferences
- The image feature set maps cleanly onto "one generator plus many single-purpose apps". Each app is effectively a fixed prompt or pipeline over a general editor model such as Nano Banana or Seedream (inferred; the apps page names no models — [Higgsfield Apps](https://higgsfield.ai/apps)).
- Soul ID is the identity primitive reused across Popcorn, Speak, AI Influencer and Cinema Studio "AI Cast" (inferred from naming and the consistency guides).

### Gaps
- How Soul ID is trained (LoRA vs reference-only), its cost, and its turnaround time were not confirmed.
- The underlying model for each app (Face Swap, Outfit Swap, Skin Enhancer, image upscaler) is not disclosed.
- The exact Soul 2.0 launch date was not found. Blog posts show it existed by 23 Feb 2026.
- The "Steal" feature (import a look from any web image) could not be confirmed in any source.

## 3. Third-party model integrations, speed to market, and exclusive deals

### Takeaway
Higgsfield aggregates 50+ third-party models across video, image, audio and LLMs and markets "Day 0" access. Its only clearly claimed special relationship is an official ByteDance partnership for Seedance, including the Higgsfield-only "Seedance 2.0 Enhanced Fast" and "Seedance 2.0 Mini" variants. Speed to market is fast but not always proven to be day zero.

### Cited Findings
- Higgsfield's Kling page claims "Day 0 access to every Kling model plus Sora 2, WAN 2.5, and more - all under one subscription" — [Higgsfield Kling 3.0 page](https://higgsfield.ai/kling-3.0).
- Kuaishou launched Kling 3.0 (Video 3.0, Video 3.0 Omni, Image 3.0, Image 3.0 Omni) in early February 2026; the press-release copy is dated 6 Feb 2026 — [Bernama press release](https://web11.bernama.com/en/press/news.php?id=2520757); other sources give 4 or 5 Feb — [aiwiki](https://aiwiki.ai/wiki/kling_3); [howaiworks](https://howaiworks.ai/models/kling). Higgsfield's Kling 3.0 guide is dated 12 Feb 2026 — [Higgsfield blog](https://higgsfield.ai/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation).
- Veo 3.1: Higgsfield's guide is dated 14 Oct 2025 — [Higgsfield blog](https://higgsfield.ai/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model). A Vietnamese review of "Veo 3.1 on Higgsfield" is dated 17 Oct 2025 — [DICloak](https://dicloak.com/vn/video-insights-detail/veo-3-1-on-higgsfield-is-a-whole-different-level). No Google press release naming Higgsfield as a launch partner was found.
- Seedance: Higgsfield says it is "the only platform with an official ByteDance partnership and access to Seedance 2.0 Enhanced Fast", sold as a separate paid add-on — [Best platforms to access Seedance 2.0](https://higgsfield.ai/blog/best-platforms-to-access-seedance-2-0); [Seedance 2.0 pricing](https://higgsfield.ai/blog/seedance-2-0-pricing-2026). Seedance 2.0 Mini is labelled "Higgsfield-exclusive" (22 Jun 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog). An older page said Seedance 2.0 required business-email verification outside the US and Japan — [Higgsfield Seedance 2.0](https://higgsfield.ai/seedance/2.0) (via search snippet).
- Higgsfield for Enterprise (14 to 19 Aug 2026) offers "Dedicated Seedance access on US infrastructure with SOC 2 and SSO" and unlimited seats. Seedance 2.5 1080p was in early access for Plus plans and above — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Sora 2: Higgsfield offers Sora 2 and Sora 2 Upscale. A late-October 2025 blog claimed Sora 2 and Veo 3.1 were "unlimited" — [Sora 2 vs Veo 3.1](https://higgsfield.ai/blog/7o7Yhqfq8Atqmt8HTppC8W); [Sora 2 product post](https://higgsfield.ai/blog/How-to-Make-Your-Product-Go-Viral-in-2025-with-Sora-2). Popcorn exports storyboards to Sora 2 — [Popcorn post](https://higgsfield.ai/blog/The-AI-Storyboard-Generator-That-Feels-Like-Directing).
- In 2026 the LLMs available in Supercomputer and MCP include Claude Opus 5.5, Sonnet 5, Sonnet 5.5, Fable 5 and Fable 5.1 (Anthropic); GPT-5.6, GPT-6 Astra, GPT-6 Sol, GPT-6 Luna and GPT-6.1 Sol (OpenAI); Grok 4.5 and 4.7 (xAI); and GLM-5.3 Flash (Zhipu; first shown anonymously as "Ox Alpha") — [Changelog](https://higgsfield.ai/creator-hub/changelog). The July 2026 Supercomputer guide lists Claude Opus 4.6, Sonnet 4.6, Gemini 3.1 Pro, Gemini 3.5 Flash, Gemini 3.0 Flash, GPT-5.5, Grok 4.3, Kimi K2.6 and DeepSeek V4 Pro — [Supercomputer guide](https://higgsfield.ai/blog/higgsfield-supercomputer-guide).
- OpenAI "Dots" (29 Sep 2026) are always-on ChatGPT agents that can generate with Higgsfield tools. The homepage lists Dots agents named Character Creator, Cinematic Director, Content Lead and Motion Designer — [Changelog](https://higgsfield.ai/creator-hub/changelog); [Higgsfield homepage](https://higgsfield.ai). Grok Bot in MCP (21 to 22 Aug 2026) is an always-on xAI agent on its own cloud computer — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Model inventory seen across sources, by provider:
  - Video:
    - ByteDance: Seedance Pro, Seedance 2.0 (plus Mini, 4K, Enhanced Fast) and Seedance 2.5.
    - Kuaishou: Kling (O1, 3.0, 3.0 Turbo, Motion Control, Lipsync).
    - Google: Veo 3 and Veo 3.1, Gemini Omni Flash and Gemini Omni 1.1 Flash.
    - OpenAI: Sora 2.
    - Alibaba: Wan 2.5, Wan 2.6, Wan Animate, Wan 3.0 and Wan 3.0 Prime.
    - MiniMax: Hailuo 2.3, H3 and H3 Max.
    - xAI: Grok Video 1.5 and Grok Imagine Video 1.5.
    - Lipsync engines: InfiniteTalk and Sync.so.
  - Image:
    - Google: Nano Banana, Nano Banana Pro, Nano Banana 2, 2 Lite and 2.1.
    - ByteDance: Seedream 5.0 Pro and 5.0 Flash.
    - OpenAI: GPT Image 2.5.
    - Black Forest Labs: FLUX 3.
    - Ideogram: Ideogram 4.5.
    - Recraft: V4 and V4.1.
  - Audio: ElevenLabs Eleven v4, ByteDance Seed Audio 1.0, and Qwen (Alibaba).
  - Upscalers: ByteDance Upscale and FLUX 3 Video Upscaler.
  - Sources: [Changelog](https://higgsfield.ai/creator-hub/changelog); [Kling 3.0 page](https://higgsfield.ai/kling-3.0); [Higgsfield blog index](https://higgsfield.ai/blog); [Draw-to-Video X post](https://x.com/higgsfield_ai/status/1955742643704750571); [Lipsync Studio via X](https://x.com/higgsfield_ai?lang=en).
- "Unlimited" carries caveats. Unlimited applies only to standard generation on higgsfield.ai, and all Canvas generations use credits — [Higgsfield help center: Canvas](https://higgsfield.ai/creator-hub/help-center/tools-and-workflows/how-do-i-use-canvas). Third-party reviews say "unlimited" covers specific, often lower-tier, models or time-boxed windows (for example 7 days) — [Krea](https://www.krea.ai/blog/what-is-higgsfield-ai-pricing-free-plan-and-alternatives-in-2026); [aiimagetovideo.pro](https://aiimagetovideo.pro/blog/higgsfield-unlimited/); [Creatify](https://creatify.ai/blog/higgsfield-vs-kling-ai-quality-cost-per-second-and-which-to-use-for-ads-in-2026).
- Higgsfield runs time-boxed "Unlimited" promotions: Seedance Unlimited at 480p/720p (16 to 17 Jun 2026), the Unlimited Models Marketplace (26 to 27 Jun), All Unlimited (20 to 21 Jul), 33 days of Unlimited Seedance 2.5 (activate before 9 Aug), and a free week of Wan 3.0 plus 60% off the API until 31 Oct — [Changelog](https://higgsfield.ai/creator-hub/changelog); [33 days unlimited Seedance 2.5](https://higgsfield.ai/blog/33-days-unlimited-seedance-2-5).

### Inferences
- "Day 0" is mostly marketing. Kling 3.0 appears to have been available within about a week of Kuaishou's launch. Same-day availability could not be verified because Higgsfield blog dates may lag actual availability.
- The ByteDance relationship (exclusive variants, dedicated enterprise capacity, many Seedance promotions) looks like Higgsfield's deepest supplier tie in 2026 (inferred from the [Changelog](https://higgsfield.ai/creator-hub/changelog) and Seedance pages).
- An open-source competitor that adds models through community-maintained mappings (as ComfyField does through `shared/mapping.js` and Comfy API) can compete on breadth but not on exclusive variants (inferred).

### Gaps
- No provider-side press release (Google, OpenAI, Kuaishou, ByteDance, Alibaba, MiniMax) naming Higgsfield as a launch partner was found.
- The exact day Sora 2 became available on Higgsfield was not found (Sora 2 itself launched at the end of September 2025, per secondary roundups).
- Contract terms behind "exclusive" claims are not public.

## 4. Workflow and UX features: apps, presets, community, library, teams, mobile, API, integrations, agents

### Takeaway
By October 2026 Higgsfield is a multi-surface platform: web studios (Image, Video, Cinema Studio, Marketing/Ads Studio, Canvas, Apps, Effects), an agent (Supercomputer, with Projects, memory, skills and AI Employees), MCP connectors for Claude and ChatGPT, plugins for creative tools (Photoshop, Figma/FigJam, After Effects, DaVinci Resolve, Blender, even Minecraft), a standalone pay-per-generation API, team and enterprise features, mobile, and a heavy community and contest layer.

### Cited Findings
- **Apps library**: 40 app cards in 8 sections (Professional, Enhance & Style, Face & Identity, Video Editing, Ads & Products, Games & Characters, Extras, Trending Templates), with Pro, New and Trending badges. There are no filter controls, only section "See all" links — [Higgsfield Apps](https://higgsfield.ai/apps). SaaStr lists one-click app templates including ASMR Add-On, Banana Eating, Billboard Ad, Bullet Time Scene, Graffiti Ad, Idol, Mugshot, Mukbang, Packshot and Roller Coaster — [SaaStr](https://www.saastr.com/saastr-ai-app-of-the-week-higgsfield-the-video-ai-platform-thats-crushing-it-where-everyone-else-is-still-prompting/).
- **Generative "Higgsfield Apps"** built via Supercomputer (7 to 8 Jul 2026) are user-built no-code apps using image, video and 3D, with a $100,000 App Contest — [Changelog](https://higgsfield.ai/creator-hub/changelog); [Introducing Higgsfield Apps](https://higgsfield.ai/blog/introducing-higgsfield-apps). App Builder (26 to 27 Jun 2026) turns a prompt into a deployed full-stack site — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- **Canvas** is a "node-based infinite board for multi-model visual production". Node types are Text Prompt, Generation (pick any model), Reference (image or audio upload, or pull from Assets) and Audio. It supports parallel runs with side-by-side comparison, saving a whole workflow as a reusable template, real-time multi-user collaboration via Share, and autosave. Building is free and credits are charged only when a node generates. Canvas nodes are also available in FigJam. The path is higgsfield.ai → Canvas → New canvas (the help article was published 1 Aug 2026) — [Higgsfield help center: Canvas](https://higgsfield.ai/creator-hub/help-center/tools-and-workflows/how-do-i-use-canvas). A review notes the learning curve and that large graphs get unwieldy — [CapCut/Dreamina review](https://dreamina.capcut.com/ai-video/higgsfield-canvas).
- **Supercomputer** (launched about 13 to 14 May 2026) is a "cloud-native AI agent that unifies every model, tool, and creative workflow into one system. It can research, write, design, generate video, and ship campaigns end-to-end" — [Higgsfield X post](https://x.com/higgsfield_ai/status/2054989169446023181); [Product Hunt via hunted.space](https://hunted.space/dashboard/higgsfield). Its features:
  - A single chat that plans the steps, picks models and presets, and shows the credit cost, model, quality, duration and aspect ratio before you approve each step.
  - Slash skills (`/montage`, `/cinematic`) and a Skill Marketplace.
  - Persistent memory of brand, audience, references and palettes, shown as a graph.
  - 30+ connectors (Slack, Google Drive, Notion, Gmail, Figma).
  - Scheduled CronJobs and up to 10 parallel chats on Ultra.
  - Outputs from 480p to 4K, in 16:9, 9:16, 4:3, 1:1, 3:4 and 21:9.
  - Source: [Supercomputer guide](https://higgsfield.ai/blog/higgsfield-supercomputer-guide).
  - Secondary sources add browser or Telegram access and three-layer memory, and say it is built on an "enhanced Hermes Agent" — [Promethean on X](https://x.com/PrometheanAIX/status/2054722772106928189); [explainx.ai](https://explainx.ai/blog/higgsfield-ai-supercomputer-hermes-agent-2026).
  - Later additions: AI Employees (ready-made agents called with @; 2 to 3 Jun 2026), AI Employees 2.0 (memory, connectors, marketplace; 16 to 20 Jun), onboarding with 3 starting paths (16 to 17 Jun), Free/Smart/Manual modes with zero-credit text (17 to 18 Jul), 20GB storage expandable to 1TB (4 to 9 Jul), and Projects as shared workspaces with their own memory and assets (22 to 23 Aug) — [Changelog](https://higgsfield.ai/creator-hub/changelog).
  - Cinema Studio's "AI Director" became Supercomputer — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio). Users of agentic products grew 42-fold in the three months after the May 2026 Supercomputer rollout — [Series B press release](https://www.prnewswire.com/news-releases/higgsfield-raises-400-million-series-b-financing-at-5-4-billion-valuation-with-annualized-revenue-reaching-700-million-302852430.html).
- **MCP**: the official hosted MCP server is at `mcp.higgsfield.ai/mcp`. It is added in Claude under Settings → Connectors, uses your Higgsfield subscription credits and needs no API key — [Katana post](https://higgsfield.ai/blog/higgsfield-katana). A secondary source dates the launch to 30 Apr 2026 with 30+ models — [mcp.directory](https://mcp.directory/blog/higgsfield-mcp-guide). Official guides: [Generate AI videos from Claude with Higgsfield MCP](https://higgsfield.ai/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP) and [Unlimited MCP, 28 Jul 2026](https://higgsfield.ai/blog/unlimited-mcp). MCP additions:
  - Reference upload widget and five new tools, including Kling Motion Control and Upscale (Jun 2026).
  - The Production Skills Bundle: 11 MCP workflows that run inside Blender, Adobe apps and others (23 Sep).
  - The ChatGPT extension with slash commands (30 Sep).
  - Source: [Changelog](https://higgsfield.ai/creator-hub/changelog). Claude can build editable After Effects projects through MCP — [AlphaSignal](https://alphasignal.ai/news/higgsfield-lets-claude-build-fully-editable-after-effects-projects).
- **Plugins and integrations** — [Changelog](https://higgsfield.ai/creator-hub/changelog); [DaVinci Resolve post](https://higgsfield.ai/blog/higgsfield-davinci-resolve); [After Effects post](https://higgsfield.ai/blog/higgsfield-after-effects); [Figma post](https://higgsfield.ai/blog/higgsfield-figma-plugin):
  - Figma and FigJam: 2 to 4 Jun 2026.
  - Minecraft: 3 to 6 Jun.
  - DaVinci Resolve (generation, editing and LUT creation in the timeline): 7 to 8 Jun.
  - Photoshop: 13 to 15 Jun.
  - After Effects (via Supercomputer and MCP): 13 to 14 Jul.
  - Blender: 21 Aug.
- **Developer API**: an earlier API existed through third-party resellers (Segmind lists "Higgsfield Image 2 Video") — [Segmind](https://www.segmind.com/models/higgsfield-image2video); [APIFrame guide](https://apiframe.ai/guides/higgsfield-api-guide). The official standalone Higgsfield API launched 16 Sep 2026: one key for 50+ image, video and audio models, billed per generation. The developer portal is open.higgsfield.ai, and API promotions include cashback and a $15 bonus — [Meet the Higgsfield API](https://higgsfield.ai/blog/higgsfield-api); [Changelog](https://higgsfield.ai/creator-hub/changelog); [Higgsfield homepage](https://higgsfield.ai).
- **Community and contests**: there is a Community feed (`/community`), model communities (Seedance 2.0 and 2.5 community pages, Kling 3.0 Community) and showcase projects under `/@higgsfield.studio/projects/` — [Higgsfield homepage](https://higgsfield.ai); [Seedance 2.0 Community](https://higgsfield.ai/seedance-2-community); [Kling 3.0 page](https://higgsfield.ai/kling-3.0). Contests and events — [Changelog](https://higgsfield.ai/creator-hub/changelog):
  - Higgsfield Global Film Festival with a $1,000,000 prize pool (Aug 2026), plus "Create in Public" for festival work in progress and Audience Choice voting.
  - Discord 200K credit contest.
  - App Contest.
- **Education and growth loops** — [Changelog](https://higgsfield.ai/creator-hub/changelog):
  - Higgsfield Academy (14 to 15 Jul 2026), with interactive courses, certificates and a path to a Filmmaker Grant; video lessons followed in August.
  - Activity Rewards, a referral program and an Affiliate Program paying up to 25%.
- **Library and assets**: generations are saved to "Assets" and can be pulled into Canvas — [Canvas help](https://higgsfield.ai/creator-hub/help-center/tools-and-workflows/how-do-i-use-canvas); [Katana post](https://higgsfield.ai/blog/higgsfield-katana). Storage management with cache clearing and a 20GB default arrived 4 to 7 Jul 2026 — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- **Teams and enterprise** — [Changelog](https://higgsfield.ai/creator-hub/changelog); [Higgsfield homepage](https://higgsfield.ai):
  - A Team Plan (`/team-plan`) and an Enterprise offering (`/enterprise`).
  - Enterprise sub-workspaces to split credits (5 to 7 Jun 2026) and admin view of members' assets (10 to 14 Jun).
  - Per-seat unlimited bundles for Team and Scale (4 to 5 Jul).
  - Enterprise with SOC 2, SSO and unlimited seats (Aug).
  - A similarity-scoring tool (March 2026) flags possible resemblance to celebrities, characters and brand logos for Team Plan customers — [PR Newswire](https://www.prnewswire.com/news-releases/higgsfield-launches-similarity-scoring-tool-for-responsible-ai-use-in-media-and-entertainment-302713321.html).
- **Mobile**: the first app, Diffuse (2024), was mobile-first on iOS and Android — [TechCrunch 2024](https://techcrunch.com/2024/04/03/former-snap-ai-chief-launches-higgsfield-to-take-on-openais-sora-video-generator/). A mobile redesign on 24 Sep 2026 made mobile open on the prompt bar with navigation in a sidebar — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- **Localisation**: a Spanish-language site launched 10 to 11 Aug 2026 — [Changelog](https://higgsfield.ai/creator-hub/changelog).

### Inferences
- Higgsfield treats distribution surfaces (MCP in Claude and ChatGPT, creative-tool plugins, mobile) as growth channels as much as features. In 2026 roughly half of its launches are integrations or agent features rather than new generation capabilities (inferred from the [Changelog](https://higgsfield.ai/creator-hub/changelog)).
- Canvas, Supercomputer Projects, and team sharing put collaboration ahead of the single-user studios (inferred).

### Gaps
- Current App Store and Google Play listings for the 2026 Higgsfield app (name, rating, feature parity) were not found. Only the 2024 Diffuse app is confirmed.
- No reliable count was found for the full preset library across Effects, camera motions, Soul presets, Genjutsu, Katana and Shorts Studio.
- Exact current plan prices and credit allowances could not be fetched: `/pricing` is client-rendered.
- Whether the community feed supports one-click remix (reuse prompt and settings) is not confirmed. Cinema Studio saves settings and metadata with every image ([How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio)), which suggests it.

## 5. Proprietary models vs wrappers: what Higgsfield claims as its own

### Takeaway
Higgsfield's own model claims are narrow. They cover the 2024 custom text-to-video model behind Diffuse, the DoP I2V-01-preview model (2025), the Soul image family (Soul, Soul 2.0, Soul Cinema, Soul ID), Popcorn ("Higgsfield's core model architecture"), and Speak 1 and 2. Everything else is explicitly third-party or unnamed. The company frames its moat as the craft and tool layer on top of interchangeable models.

### Cited Findings
- 2024: Diffuse ran on a "custom text-to-video model" built by a 16-person team in under nine months on a 32-GPU cluster. TechCrunch did not say it was trained from scratch, and the training data was described only as "multiple publicly available" sources — [TechCrunch, 3 Apr 2024](https://techcrunch.com/2024/04/03/former-snap-ai-chief-launches-higgsfield-to-take-on-openais-sora-video-generator/).
- 2025: Higgsfield named its image-to-video model "DoP I2V-01-preview" — [Higgsfield DoP announcement (search snippet)](https://higgsfield.ai/blog/Introducing-Higgsfield-DoP-preview). A 2026 aggregator lists Higgsfield's proprietary models as Soul 2.0 (image) and DoP (cinematic video) — [Creatify review (attribution via search summary)](https://creatify.ai/fr/blog/higgsfield-ai-review-(2026)-is-it-worth-it).
- Higgsfield says it "builds its own tools" and "its own models, such as Soul", while Cinema Studio is "built on top of interchangeable video models" — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio).
- Popcorn quality is attributed to "Higgsfield's core model architecture" — [Popcorn post](https://higgsfield.ai/blog/The-AI-Storyboard-Generator-That-Feels-Like-Directing). SaaStr calls the "Higgsfield Popcorn image model" proprietary and the platform an aggregator of mostly Chinese video models — [SaaStr](https://www.saastr.com/saastr-ai-app-of-the-week-higgsfield-the-video-ai-platform-thats-crushing-it-where-everyone-else-is-still-prompting/).
- Lipsync Studio lists "Speak 2.0" next to third-party engines (InfiniteTalk, Sync.so, Kling Lipsync, Veo 3) — [Higgsfield X via search summary](https://x.com/higgsfield_ai?lang=en).
- Katana "runs on Higgsfield models", which are not named — [Katana post](https://higgsfield.ai/blog/higgsfield-katana). Genjutsu does not say whether it is in-house — [Genjutsu post](https://higgsfield.ai/blog/higgsfield-genjutsu).
- Explicitly third-party pieces include the Audio redesign (a Qwen model), Shorts Studio (Gemini Omni Flash), Supercomputer's LLMs (Anthropic, OpenAI, xAI, Zhipu, Google, Moonshot, DeepSeek) and every upscaler — [Changelog](https://higgsfield.ai/creator-hub/changelog); [Supercomputer guide](https://higgsfield.ai/blog/higgsfield-supercomputer-guide).
- The Series B press release and the $1B run-rate post make no specific claims about proprietary models. They describe "video, image, and audio models combined with our own creative tools in one workspace" — [Series B PR](https://www.prnewswire.com/news-releases/higgsfield-raises-400-million-series-b-financing-at-5-4-billion-valuation-with-annualized-revenue-reaching-700-million-302852430.html); [$1B run-rate post](https://higgsfield.ai/blog/higgsfield-1b-annualized-revenue-run-rate).

### Inferences
- Higgsfield is primarily an orchestration, UX and distribution company with a few fine-tuned in-house models (Soul family, DoP, Speak). Even its marquee 2026 launches (Cinema Studio 4.0, Genjutsu, Katana) emphasise model-agnostic layers (inferred).
- For an open-source competitor, the reproducible parts are the preset, camera vocabulary and reference layers, skills, workflows and Canvas. The parts that aren't reproducible are exclusive model variants and negotiated "unlimited" capacity (inferred).

### Gaps
- No technical paper or model card was found for DoP, Soul or Popcorn, so base model, fine-tuning method and training data are unknown. Whether DoP or Soul are fine-tunes of open models (for example Wan or FLUX) is not established by any source found.
- Whether Soul Cinema, Genjutsu and Katana are in-house models or pipelines over third-party models was not confirmed.

## 6. Dated timeline of major launches (2023 to Oct 2026)

### Takeaway
The arc runs from a mobile consumer app (Diffuse, 2024), to a preset-first web platform (DoP, Soul, apps, 2025), to pro studios and broad model aggregation (Cinema Studio, Popcorn, late 2025), to an agentic, multi-surface creative OS (Supercomputer, MCP, plugins, API, 2026). Funding and revenue grew in parallel.

### Cited Findings

#### 2023
- Sep 2023: Alex Mashrabov leaves Snap to found Higgsfield — [aiwiki (secondary)](https://www.aiwiki.ai/wiki/higgsfield/raw). Co-founder: Yerzat Dulat — [TechCrunch 2024](https://techcrunch.com/2024/04/03/former-snap-ai-chief-launches-higgsfield-to-take-on-openais-sora-video-generator/).

#### 2024
- 3 Apr 2024: Diffuse launches (iOS and Android, gradual rollout). It makes videos from scratch or from a selfie, and supports motion mimicry such as dance moves. About $8M raised so far, mostly a Menlo-led seed — [TechCrunch](https://techcrunch.com/2024/04/03/former-snap-ai-chief-launches-higgsfield-to-take-on-openais-sora-video-generator/).

#### 2025
- Mar 2025: public web platform launches — [aiwiki (secondary)](https://www.aiwiki.ai/wiki/higgsfield/raw). Higgsfield later dates the "launch of its AI video platform" to about 18 months before Sep 2026 — [$1B post](https://higgsfield.ai/blog/higgsfield-1b-annualized-revenue-run-rate).
- 31 Mar 2025: DoP I2V-01-preview with camera-motion presets — [Clipia](https://clipia.ai/en/video-models/higgsfield-dop); [Higgsfield](https://higgsfield.ai/blog/Introducing-Higgsfield-DoP-preview).
- 25 to 26 Jun 2025: Soul image model with 50+ presets — [Higgsfield](https://higgsfield.ai/blog/Higgsfield-SOUL-Turns-Prompts-Into-Fashion-Ready-Shots).
- 10 Jul 2025: Soul ID — [Design Offset](https://design-offset.com/20250710-higgsfield-soul-id-release/).
- About 16 Jul 2025: UGC Builder (Veo 3) — [X](https://x.com/higgsfield_ai/status/1945568179637686619); and 20 experimental Soul presets — [Higgsfield](https://higgsfield.ai/blog/Introducing-20-New-Experimental-Presets).
- 13 Aug 2025: Draw-to-Video — [X](https://x.com/higgsfield_ai/status/1955742643704750571).
- 9 Sep 2025: Banana Placement (Nano Banana) — [Higgsfield](https://higgsfield.ai/nano-banana-intro).
- Sep 2025: $50M Series A led by GFT Ventures — [SaaStr](https://www.saastr.com/saastr-ai-app-of-the-week-higgsfield-the-video-ai-platform-thats-crushing-it-where-everyone-else-is-still-prompting/); [Webull/press](https://www.webull.com/news/13481912673129472).
- 18 Sep 2025: Lipsync Studio — [X via search summary](https://x.com/higgsfield_ai?lang=en).
- 14 Oct 2025: Veo 3.1 on Higgsfield — [Higgsfield blog](https://higgsfield.ai/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model).
- 22 to 23 Oct 2025: Popcorn storyboards — [Higgsfield](https://higgsfield.ai/blog/The-AI-Storyboard-Generator-That-Feels-Like-Directing).
- 26 Oct 2025: MiniMax Hailuo 2.3 — [Higgsfield](https://higgsfield.ai/blog/Minimax-Hailuo-2.3-A-Creative-Guide).
- About mid-Nov 2025: Recast (inferred date) — [TikTok](https://www.tiktok.com/@brightchuksm/video/7572681171851693330).
- 18 Nov 2025: Nano Banana Pro — [Higgsfield](https://higgsfield.ai/blog/Nano-Banana-Pro-is-Here-Full-Review-and-Guide).
- 30 Nov 2025: Kling O1 — [Higgsfield](https://higgsfield.ai/blog/Kling-01-is-Here-A-Complete-Guide-to-Video-Model).
- 14 Dec 2025: Wan 2.6 — [Higgsfield](https://higgsfield.ai/blog/WAN-2.6-by-Alibaba-User-Guide-on-Higgsfield).
- 18 Dec 2025: Cinema Studio 1.0 — [Higgsfield](https://higgsfield.ai/blog/how-we-built-cinema-studio).

#### 2026
- 15 Jan 2026: $80M Series A extension (total Series A $130M) at a $1.3B+ valuation. The company claimed 15M+ users and a $200M run rate nine months in. Controversy: the "Island Holiday" video depicting people named in the Epstein files — [TechCrunch](https://techcrunch.com/2026/01/15/ai-video-startup-higgsfield-founded-by-ex-snap-exec-lands-1-3b-valuation).
- 12 Feb 2026: Kling 3.0 on Higgsfield — [Higgsfield](https://higgsfield.ai/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation).
- By 23 Feb 2026: Soul 2.0 — [Higgsfield](https://higgsfield.ai/blog/hex-codes-ai-image-generation-color-control-soul).
- Mar 2026: similarity-scoring tool — [PR Newswire](https://www.prnewswire.com/news-releases/higgsfield-launches-similarity-scoring-tool-for-responsible-ai-use-in-media-and-entertainment-302713321.html).
- 30 Mar to Apr 2026: Cinema Studio 3.0, then 3.5 (AI Director) — [Higgsfield](https://higgsfield.ai/blog/how-we-built-cinema-studio).
- 30 Apr 2026: hosted MCP server — [mcp.directory (secondary)](https://mcp.directory/blog/higgsfield-mcp-guide).
- 13 to 14 May 2026: Supercomputer — [X](https://x.com/higgsfield_ai/status/2054989169446023181).
- Jun 2026 — [Changelog](https://higgsfield.ai/creator-hub/changelog):
  - Integrations: Figma and FigJam, Minecraft, DaVinci Resolve, Photoshop.
  - Supercomputer: AI Employees 1.0 and 2.0, Higgsfield Gaming, App Builder.
  - Cinema Studio workspace.
  - Models: Seedance 2.0 4K and Mini, ByteDance Upscale, Kling 3.0 Turbo, Grok Video 1.5, Recraft v4.1, Gemini Omni Flash, Seed Audio 1.0, Nano Banana 2 Lite.
  - Offers: Seedance Unlimited, Unlimited Models Marketplace.
  - Shorts Studio.
  - Reported $500M revenue (30 Jun 2026) — [Tech Times](https://www.techtimes.com/articles/319394/20260630/ai-video-startup-higgsfield-hits-500m-revenue-eyes-5b-funding-round.htm).
- Jul 2026 — [Changelog](https://higgsfield.ai/creator-hub/changelog):
  - Higgsfield Explainer, Higgsfield Apps and App Contest.
  - Models: Seedream 5.0 Pro, GPT-5.6, Grok 4.5.
  - Supercomputer and growth: storage management, Activity Rewards, After Effects integration, Academy, Free Mode, All Unlimited.
- Aug 2026 — [Changelog](https://higgsfield.ai/creator-hub/changelog):
  - Studios: Seedance 2.5, Global Film Festival ($1M), Viral Presets, Audio redesign (Qwen), Spanish site, Layers, Cinema Studio 4.0, Marketing Studio relaunch, Faceless Studio.
  - Video tools: Relight and HEX, Blender plugin.
  - Supercomputer: Projects, Grok Bot in MCP, Ox Alpha and GLM-5.3 Flash.
  - Models: Wan 3.0 and Prime, Recraft V4, FLUX 3 Video Upscaler, Gemini Omni 1.1 Flash, MiniMax H3 Max.
  - Business: Enterprise (SOC 2, SSO), Ad Multiplier MCP skill, Affiliate Program.
  - 17 Aug 2026: $400M Series B at $5.4B led by DST Global. The release claims 30M+ users in 238 countries, $700M annualized revenue, 20M+ generations per month, and 390 of the Fortune 500 — [PR Newswire](https://www.prnewswire.com/news-releases/higgsfield-raises-400-million-series-b-financing-at-5-4-billion-valuation-with-annualized-revenue-reaching-700-million-302852430.html).
- Sep 2026 — [Changelog](https://higgsfield.ai/creator-hub/changelog):
  - Genjutsu (1 Sep).
  - Supercomputer LLMs: Claude Fable 5.1, GPT-6 Astra, Claude Opus 5.5, GPT-6 Sol and Luna, Grok 4.7, Claude Sonnet 5.5, GPT-6.1 Sol.
  - 3D Jutsu and Games 2.0.
  - ChatGPT and After Effects: Effects 2.0 in ChatGPT, AI Motion Designer, After Effects presets.
  - Higgsfield API (16 Sep), Production Skills Bundle.
  - Models: Seedream 5.0 Flash, GPT Image 2.5, Seedance 2.5 Draft Mode, Eleven v4, Ideogram 4.5.
  - Mobile redesign (24 Sep).
  - OpenAI Dots and the ChatGPT extension (29 to 30 Sep), Genjutsu Restyle, Ads Studio.
  - 29 Sep: $1B+ annualized run rate, 32M+ users, nearly 1M paying subscribers, cash-flow breakeven reported — [Higgsfield](https://higgsfield.ai/blog/higgsfield-1b-annualized-revenue-run-rate).
  - Higgsfield For Good (for schools and nonprofits) was slated for September 2026 — [Series B PR](https://www.prnewswire.com/news-releases/higgsfield-raises-400-million-series-b-financing-at-5-4-billion-valuation-with-annualized-revenue-reaching-700-million-302852430.html).
- Oct 2026 (to the 13th) — [Changelog](https://higgsfield.ai/creator-hub/changelog):
  - Models: Grok Imagine Video 1.5 and FLUX 3 Image (1 Oct), Nano Banana 2.1 (5 to 6 Oct).
  - Studios: AI Influencer (2 to 3 Oct), Ad Multiplier in Ads Studio (6 Oct), Katana (8 to 12 Oct).
  - Unlimited Wan 3.0 week plus 60% off the API until 31 Oct (13 Oct).

#### Renamed and discontinued (labelled)
- Diffuse (2024 mobile app): no 2026 references found. Probably superseded by the Higgsfield web and mobile app (inferred; not confirmed discontinued).
- Cinema Studio "AI Director" was renamed or spun out as Supercomputer — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio).
- The "Ox Alpha" anonymous LLM was revealed as GLM-5.3 Flash — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Academy's old courses were replaced by video lessons — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- Older Cinema Studio versions (2.5) are kept selectable — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio).
- The 2025 DoP model and Soul v1: still present in 2026 help docs and model pages, but current selectability is unconfirmed (see gaps).

### Inferences
- Shipping cadence rose from about 1 to 3 notable launches a month in 2025 to about 25 to 30 changelog entries a month by mid-2026 (inferred from the [Changelog](https://higgsfield.ai/creator-hub/changelog) density).
- Revenue claims grew from $200M run rate (Jan 2026) to $500M (Jun) to $700M (Aug) to $1B (Sep). All of these are self-reported.

### Gaps
- No changelog entries before June 2026 could be read (the page loads a limited window). The January to May 2026 detail, beyond the items above (Kling 3.0, Soul 2.0, Seedance 2.0, Cinema Studio 3.x, MCP, Supercomputer), is incomplete.
- Exact dates for Seedance 2.0's arrival on Higgsfield, Sora 2's arrival, Speak, Vibe Motion, Canvas and Cinema Studio 2.0/2.5 were not found.

## 7. UI organisation, entry points, and UX patterns worth copying

### Takeaway
Higgsfield feels simple because it puts presets ahead of prompts. The entry points are visual galleries (effects, apps, presets) where each card shows a preview and runs in one click on an uploaded photo. Deep controls (camera rigs, references, Canvas nodes, agent chats) sit behind separate studios. In 2026 the default entry, especially on mobile, moved to a single prompt bar and agent.

### Cited Findings
- **Top-level navigation** (homepage links): About, Pricing, Apps, Cinema Studio, Community, Enterprise, Academy and Team, plus the Effects hub, Supercomputer, MCP (Claude and ChatGPT tabs), AI Influencer studio, Ads Studio, Katana and Genjutsu — [Higgsfield homepage](https://higgsfield.ai). A community skill lists Canvas as a top-level nav item alongside Image, Video, Cinema Studio and Marketing Studio — [skills.sh](https://www.skills.sh/osidemedia/higgsfield-ai-prompt-skill/higgsfield-canvas). The Help Center lives under "Creator Hub" — [Canvas help](https://higgsfield.ai/creator-hub/help-center/tools-and-workflows/how-do-i-use-canvas).
- **URL-addressable state**: model and settings live in query strings (`/ai/video?model=seedance_2_5&resolution=1080p`, `/start/agent?model=wan3_0&mode=video`, `/supercomputer?model=openai/gpt-6-astra`), which makes marketing deep links trivial — [Higgsfield homepage](https://higgsfield.ai).
- **Preset-first, prompt-optional**: "Click-to-Video" means uploading an image, picking a preset and getting a clip. The CEO claims "zero cognitive load", and most users prefer presets and templates to writing prompts — [SaaStr](https://www.saastr.com/saastr-ai-app-of-the-week-higgsfield-the-video-ai-platform-thats-crushing-it-where-everyone-else-is-still-prompting/). Draw-to-Video was promoted as "RIP Prompts" — [X](https://x.com/higgsfield_ai/status/1955742643704750571). Genjutsu presets "can drive a transformation without a prompt" — [Genjutsu post](https://higgsfield.ai/blog/higgsfield-genjutsu).
- **Preset galleries with example pages**: every effect has `/effects/examples/{slug}` and `/effects/use/{slug}` pages — [Higgsfield homepage](https://higgsfield.ai). Apps are grouped into themed rows with badges (Pro, New, Trending) and "See all" links — [Higgsfield Apps](https://higgsfield.ai/apps).
- **Real-world vocabulary instead of model parameters**: Cinema Studio picks camera body → lens → focal length → aperture → movement, with a rig-loading switcher, genre presets and recommended camera presets — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio).
- **Settings travel with assets**: saved metadata carries an image's look into video — [How we built Cinema Studio](https://higgsfield.ai/blog/how-we-built-cinema-studio).
- **Draft-then-final**: Seedance 2.5 Draft Mode (480p preview, then 1080p with the same settings) and Kling 3.0 Turbo for test shots — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- **Cost shown before every run**: Supercomputer shows credit cost, model, quality, duration and aspect ratio and waits for Approve — [Supercomputer guide](https://higgsfield.ai/blog/higgsfield-supercomputer-guide). Canvas builds are free and only node runs cost credits — [Canvas help](https://higgsfield.ai/creator-hub/help-center/tools-and-workflows/how-do-i-use-canvas).
- **Mobile**: opens on the prompt bar, with navigation in a sidebar (Sep 2026) — [Changelog](https://higgsfield.ai/creator-hub/changelog).
- **Popcorn**: a Manual/Auto toggle, up to 4 reference slots, a frame-count picker and "export to video" — [Popcorn post](https://higgsfield.ai/blog/The-AI-Storyboard-Generator-That-Feels-Like-Directing).
- **Slash skills in agents**: `/montage`, `/cinematic` and `/katana/<preset>` — [Supercomputer guide](https://higgsfield.ai/blog/higgsfield-supercomputer-guide); [Katana post](https://higgsfield.ai/blog/higgsfield-katana).
- **Known UX weak points**: Canvas has a learning curve and large graphs get messy — [CapCut/Dreamina review](https://dreamina.capcut.com/ai-video/higgsfield-canvas). Weaker results on complex prompts, plus non-rolling credits — [SaaStr](https://www.saastr.com/saastr-ai-app-of-the-week-higgsfield-the-video-ai-platform-thats-crushing-it-where-everyone-else-is-still-prompting/). "Unlimited" is confusing, as covered in section 3.

### Inferences
Checklist of patterns worth copying for an open-source competitor (all inferred from the findings above):
1. **Preset gallery with preview video on every card.** Each card runs in one click on an uploaded photo. Templates are just saved prompt, model and settings bundles, and each gets its own example and use page.
2. **Camera and lens vocabulary as a model-agnostic layer.** Map camera move, lens, focal length, aperture and genre onto each model's prompt and parameters (ComfyField's `shared/mapping.js` is the natural home).
3. **References as first-class objects** (characters, products, locations, "Elements"), reusable across image, video, storyboard and lipsync. Character consistency (a Soul ID equivalent) underpins many formats.
4. **Storyboard format**: N consistent frames from one prompt (Auto) or per-frame prompts (Manual), last-frame chaining, then send to video.
5. **Settings travel with outputs.** Every asset stores its full recipe so "use as start frame" or "remix" keeps the look.
6. **Draft-then-final rendering** at low resolution with locked seed and settings.
7. **Cost preview and an approve gate before any paid run.** This matches ComfyField's Flows approve-node rule.
8. **Node canvas** with free building, pay-per-run, parallel compare and save-as-template.
9. **Agent and MCP surface**: expose formats as slash skills to Claude and ChatGPT. Higgsfield's fastest-growing 2026 surface is agentic (42x in three months).
10. **Task apps as thin wrappers**: face swap, outfit swap, relight, expand, background removal, upscale, angles, shots, transitions, product spin (bullet time) and billboard/truck mockups.
11. **Video-to-video edits**: object/character swap and motion transfer (Genjutsu/Recast), restyle (Shorts Studio and Genjutsu Restyle), and reference-edit cloning (Katana/Ad Multiplier).
12. **Ad formats**: link to ad (Click to Ad, Ads Studio), UGC talking head with emotion and accent, and an ad variant multiplier.
13. **Audio**: TTS, voice clone, voice change, translation with lipsync, music and SFX, attachable to video nodes.
14. **URL-addressable model and settings state** for shareable deep links.
15. **Prompt-bar-first mobile layout** with navigation in a sidebar.

### Gaps
- No first-hand screenshots or UI walkthrough of the 2026 desktop layout were captured. `/ai/video`, `/pricing` and other app pages are client-rendered and returned only metadata to the fetch tool. A browser session or YouTube walkthroughs (for example [Cinema Studio 4.0 test](https://www.youtube.com/watch?v=T4NxZguv2dg)) would be needed to document the exact panel layout, history and library UI, and remix flow.
- No information was found on keyboard shortcuts, batch generation UI, or how history and asset folders are organised.
