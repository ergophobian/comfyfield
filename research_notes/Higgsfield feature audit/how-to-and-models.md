# Higgsfield how-to and model reference

Internal competitive research for ComfyField. One `###` entry per Higgsfield feature: what it does, how to use it, inputs and limits, the models behind it, cost, launch date and source routes. Built on Oct 16, 2026 from local captures only, with no live browsing: 104 help-center and changelog pages, 272 blog posts, the site's Image, Video and Audio menus, and logged-out captures of product pages.

Coverage: 241 feature entries; 134 models in the model table (34 image, 60 video, 8 audio, 6 upscaler, 1 3d, 25 llm).

How to read it:
- Routes in brackets are higgsfield.ai paths. The help center lives under /creator-hub/help-center/, the blog under /blog/, the changelog at /creator-hub/changelog, and product pages at paths like /ai/video?model=seedance_2_5.
- "(inferred)" marks anything a page does not state. "Blog post date" is the date of the post that announced or first described a feature; it is not a changelog date.
- When pages disagree, both values are given with their routes. Blog listicles and promo posts drift on numbers, so prefer the help center and changelog when they conflict.
- Credits: several pages work at about 20 credits per US dollar (Plus at $49 for 1,000 credits) [/blog/build-website-with-ai] [/blog/automate-ai-video-n8n-make]. "Generate 1.5" means the product page's Generate button showed 1.5 credits.
- Gaps: each captured page was cut at 15,000 characters, so long posts lose their endings. The changelog capture has dated entries only from Sep 24 to Oct 13, 2026, with older entries kept as titles. Most /ai/video and /audio captures are logged-out shells with no controls.

## Feature index

- Image creation and editing tools: Create Image (image composer); Higgsfield Layers and Edit Image; Inpaint (Nano Banana Pro Inpaint); Layer decomposition; Edit text; Remove background; Expand image (Expand & crop); Color grading (image); Image upscale; Relight (image app); Face swap; Character swap; Angles 2.0; Skin enhancer; AI Stylist (Try-On); Urban Cuts; Higgsfield Apps catalog (viral apps); Photo restoration workflow
- Soul, characters and image studios: Higgsfield Soul (original Soul model); Higgsfield Soul 2.0; Soul Reference; Higgsfield Soul Cinema; Soul HEX and color transfer; Soul Moodboard; Soul ID Character; Photodump Studio; Photodump (Soul 2.0 photodump modal); Instadump; AI Influencer (AI Influencer Studio, Character Builder); Soul Cast; Higgsfield Popcorn; Fashion Factory
- Video studios: Cinema Studio; Cinema Studio 4.0 Director's Panel; Cinema Studio projects, Elements and AI Director; Cinematic Cameras (Cinema Studio image mode); Cinema Studio version history; Higgsfield DoP; Canvas; Faceless Studio; Shorts Studio; Higgsfield Explainer; 3D Jutsu; Mixed Media; Higgsfield Genjutsu; Genjutsu Restyle; Katana; Draw to video
- Video creation and editing tools: Create video; Edit video; Video upscale; FLUX 3 Video Upscaler (FLUX.3 Upscale); Higgsfield Reframe; Video relight and color palette; Kling Motion Control; Kling 3.0 Omni Edit; Visual effects and viral presets
- Marketing and ads: Marketing Studio; Marketing Studio product shots; Marketing Studio UGC videos; Marketing Studio motion; Marketing Studio ads, posters, marketplace and TikTok templates; Marketing Studio prompt formats (pre-relaunch); Click to Ad; Brand kit; Virality predictor; Ads Studio; Ad Multiplier; UGC Factory and marketing skills; Similarity scoring (content scoring); Ad localization workflow (Translate, Lipsync Studio, Reframe)
- Audio and lipsync: Higgsfield Audio; Text to speech (voiceover); Voice change; Translate (video translation with lip sync); Custom voice and consistent AI voice; Lipsync Studio; Higgsfield Speak 2.0; Recast; Native audio co-generation; Seed Audio 1.0; Eleven v4; Eleven v4 Turbo; Eleven v3; Qwen Audio 3.0; MiniMax Speech 2.8 HD; Seed Speech; VibeVoice
- Image models: GPT Image 2; GPT Image 2.5 (Flare and Sunburst); GPT Image 1.5; Nano Banana; Nano Banana 2; Nano Banana 2 Lite; Nano Banana 2.1; Nano Banana Pro; Seedream 5.0 Pro; Seedream 5.0 Lite; Seedream 5.0 Flash; Seedream 4.5; FLUX 3 Image; FLUX.2 (Pro); Recraft V4 (V4.1, Styles, Utility); Grok Imagine 2.0 (image); Z-Image; Ideogram 4.5; Kling O1 Image; Qwen Image 3 (API only); Legacy image models linked in the site footer
- Video models: Seedance 2.5; Seedance 2.5 Edit; Seedance 2.0; Seedance 2.0 Fast (Enhanced Seedance 2.0 Fast); Seedance 2.0 Mini; Seedance 4K; Older Seedance models (Seedance 1.5 Pro, Seedance Pro, Seedance Pro Fast); Kling 3.0; Kling 3.0 Turbo; Kling 3.0 Omni; Kling O1 (Video and Video Edit); Kling 2.6; Older Kling models (Kling 2.5 Turbo, Kling 2.1, Kling 2.1 Master); Kling Avatars 2.0 and Kling Lipsync; Gemini Omni Flash; Gemini Omni Flash 1.1; Omni VFX (edit real footage with Gemini Omni Flash); FLUX.3 Video; MiniMax H3 (Hailuo 3.0); MiniMax H3 Max; MiniMax Hailuo 2.3; Wan 3.0; Wan 3.0 Prime; Wan 2.7; WAN 2.6; WAN camera control; Older Wan versions (Wan 2.5, Wan 2.5 Speak, Wan 2.5 Fast, Wan 2.2); Grok Imagine Video 1.5; Grok Imagine 1.5 Lite; Grok Imagine (earlier video model); Google Veo 3.1; OpenAI Sora 2; Sora 2 API shutdown and migration to the Higgsfield API; Happy Horse; LTX 2.5 Pro (API catalog); PixVerse 6 (API catalog)
- Agents, MCP, API and plugins: Supercomputer; Supercomputer LLM roster and Orchestrator; Supercomputer skills and AI employees; Connectors and scheduled tasks; Memory, projects and storage in Supercomputer; Faceless channel (Faceless Content Factory skill); Higgsfield Apps (Supercomputer app builder); Website Building skill; Higgsfield Games; Higgsfield MCP; MCP vs web differences; Unlimited MCP; Higgsfield skills for Claude and agents; Downloadable Claude skill files; Claude workflow guides; Higgsfield extension for ChatGPT (Higgsfield plugin); Effects 2.0 viral presets in ChatGPT; OpenAI Dots; Higgsfield CLI and skills; Higgsfield API; Higgsfield API cashback and discounts; Genjutsu API; Hermes Agent; Cursor; OpenClaw, NemoClaw, Cowork and other MCP clients; Grok Bot in MCP; n8n and Make automation; No-code automation; Premiere Pro and After Effects plugin; Presets for After Effects; AI Motion Designer; Higgsfield Bridge (MCP bridge); DaVinci Resolve plugin; Figma and FigJam plugin; Photoshop plugin; Blender plugin; Minecraft mod; Reference Extension
- Plans, credits and unlimited: Individual plans; Free plan and free trials; Monthly and annual billing; Upgrade and downgrade; Subscription renewal; Promo prices; Exclusive offers; Credits; Credit costs per generation; Credit packs; Auto-refill; Promo codes; Free generations; Credit reset offer; Concurrency boost; Unlimited models; Credit mode and the unlimited queue; All Unlimited; New Unlimited; Unlimited models marketplace; Seedance Unlimited (30-day add-on); Referral program (Unlimited Seedance 2.0); Seedance 4K Unlimited and free Seedance 2.0 4K generations; Unlimited Seedance 2.5 (33 days); Unlimited Wan 3.0 (7 days); Watermark; Commercial rights and ownership of generations
- Teams, enterprise and creator programs: Team plan; Scale plan; Higgsfield for Enterprise; Team workspace roles and sub-workspaces; Enterprise case studies (Gaia, Boxel); Creator partnership program; Affiliate program; Higgsfield Earn
- Community, contests and platform: Higgsfield Community; Open projects and shots; Creator profile; Community rating and achievements; Higgsfield Grants; Explore and auto-publish; Higgsfield Chat; Higgsfield Discord; Contests; Higgsfield Global Film Festival; Higgsfield Discord 200K Contest; Higgsfield Apps Contest; Higgsfield Original Series; Academy; Official Higgsfield platforms; Mobile interface redesign; Manage account and account menu; Account sign-in, recovery and deletion; Business milestones; Content flagged as NSFW; Generations blocked for copyright or IP; Billing and invoices; Refunds and cancellation

## Image creation and editing tools

### Create Image (image composer)
- What it does: the single prompt bar for all image models at /ai/image; pick a model, type a prompt or attach references, set a few knobs, generate. The nav's Create Image link opens it with GPT Image 2 preselected [/ai/image?model=gpt_image_2].
- How to use: 1. Image in the top nav 2. Pick a model or feature (or keep the default) 3. Write a prompt 4. Upload a reference if the model supports it 5. Adjust aspect ratio / resolution 6. Generate; results land in the section and in Assets [/creator-hub/help-center/getting-started/how-do-i-create-my-first-generation].
- Inputs and settings: the bar changes per model. Seen on captures:
  - aspect ratio (Auto, 3:4, 1:1 defaults) [/ai/image?model=nano-banana-2-1] [/ai/image?model=recraft-v4-1]
  - resolution 1K / 2K / 4K [/ai/image?model=nano-banana-pro] [/ai/image?model=seedream_v5_pro]
  - quality tier (High on GPT Image 2, Medium on Nano Banana 2.1 and Grok Imagine 2.0, Standard on Recraft V4.1) [/ai/image?model=gpt_image_2] [/ai/image?model=grok-image-2-0]
  - batch "1/4" (1 to 4 outputs per run)
  - a Draw toggle on Nano Banana Pro (purpose not stated on the page) [/ai/image?model=nano-banana-pro]
  - Vector mode and Color transfer on Recraft V4.1 [/ai/image?model=recraft-v4-1]
  - input modes Text-to-Image, Multi-reference, Image-to-Image (Nano Banana family) [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana]
- After generation: Turn to video, Recreate and Reference buttons on every asset [/creator-hub/help-center/getting-started/whats-in-my-higgsfield-account]. One review counts six follow-up edit tools in the image view: Color Grading, Upscale, Enhancer, Relight, Inpaint, Angles [/blog/best-platforms-seedream-5].
- Limits: each batch output is charged separately [/creator-hub/help-center/credits/what-uses-my-credits]. An Unlimited toggle appears only when the selected model is covered by your plan or a bundle, and Unlimited works only on higgsfield.ai, never via MCP, CLI, Canvas or Supercomputer [/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them]. A Jul 28, 2026 post describes a 24-hour Unlimited MCP trial that did work in Claude and ChatGPT [/blog/unlimited-mcp]. Free accounts get a visible watermark; paid plans do not [/creator-hub/help-center/credits/watermark-and-how-to-remove]. Image generation for all models is available via MCP [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent]. On mobile, Create Image is a scenario in the Agent tab (changelog Sep 24, 2026) [/creator-hub/changelog].
- Models: the Image nav lists GPT Image 2.5 Sunburst and Flare, Nano Banana 2.1, Seedream 5.0 Pro, Nano Banana Pro, FLUX 3 Image, Recraft V4.1, Grok Imagine 2.0, FLUX.2, Z-Image, plus Soul 2.0 and Soul Cinema (nav menu). The help center says a family auto-upgrades to its newest version as default [/creator-hub/help-center/ai-models/which-ai-model-should-i-use]. Plugins default to Nano Banana 2 for images [/creator-hub/help-center/integrations/external-integrations-higgsfield]. Related nav item "Cinematic Cameras" (image generation with camera controls) lives in Cinema Studio [/generate?mode=image&imageModel=cinematic-v1].
- Credits and cost: the cost always shows on the Generate button before you confirm [/creator-hub/help-center/credits/how-credits-work]. Per-model numbers are in the model entries below.
- Launched: not stated. Sources: [/ai/image] [/ai/image?model=gpt_image_2] [/creator-hub/help-center/getting-started/how-do-i-create-my-first-generation] [/creator-hub/help-center/credits/what-uses-my-credits] [/blog/best-platforms-seedream-5]

### Higgsfield Layers and Edit Image
- What it does: the image editor hub. You upload a flat image, it can split it into editable layers, and you edit or rebuild each element. The page has tabs for Relight, Inpaint, Layer decomposition, Edit text and Effects [/layers].
- How to use: 1. Open Layers, or open an image asset and choose Edit Image 2. Pick a tool 3. Set that tool's options 4. Generate. A prompt bar at the bottom handles custom edits outside the listed tools [/blog/edit-photos-with-ai-higgsfield].
- Inputs and settings: the nine Edit Image tools are Layer Decomposition, Edit Text, Remove Background, Expand & Crop, Upscale, Color Grading, Enhancer (AI Skin Enhancer), Relight and Angles. The same post contradicts itself on which three are new: in one place Layer Decomposition, Edit Text and Remove Background; in another the "New" tag sits on Layer Decomposition, Edit Text and Expand & Crop [/blog/edit-photos-with-ai-higgsfield]. Every project is saved under My projects [/layers].
- Limits: in a Sep 2026 test, an edit made in the separate Edit interface cost 1.5 credits even with Unlimited active, while reference-based generation in the composer ran free inside the window [/blog/unlimited-nano-banana-2-plans]. The Effects tab has no detail in the corpus.
- Models: the Inpaint tab runs Nano Banana Pro Inpaint [/layers?model=nano_banana_pro_inpaint]. The models behind the other tabs are not stated.
- Credits and cost: priced per tool (see the tool entries) [/blog/edit-photos-with-ai-higgsfield].
- Launched: the three new tools were announced Aug 17, 2026 (blog post date) [/blog/edit-photos-with-ai-higgsfield].
- Sources: [/layers] [/layers?model=nano_banana_pro_inpaint] [/edit?model=nano_banana_pro_inpaint] [/blog/edit-photos-with-ai-higgsfield] [/blog/unlimited-nano-banana-2-plans]

### Inpaint (Nano Banana Pro Inpaint)
- What it does: mask-based editing. You paint over a region, describe the change, and only the masked area is rebuilt; the rest stays pixel-exact. Use it to remove, replace, restyle clothing, rewrite text, fix faces, change lighting or add objects (nav: "Select an area, describe the change") [/blog/Top-Editing-Tool-in-2025-Nano-Banana-Pro-Inpaint].
- How to use: 1. Edit → Nano Banana Pro Inpaint (now Image → Inpaint, which opens Layers) 2. Upload an image 3. Brush the area (keep edges clean; expand slightly when replacing) 4. Write the prompt (e.g. remove, replace, "match original shadows") 5. Pick quality 6. Generate [/blog/Top-Editing-Tool-in-2025-Nano-Banana-Pro-Inpaint].
- Inputs and settings: one image plus a mask and a prompt; output quality Low / Medium / High [/blog/Top-Editing-Tool-in-2025-Nano-Banana-Pro-Inpaint].
- Limits: the blog advises small iterative edits and not over-masking faces. No hard caps stated.
- Models: Nano Banana Pro Inpaint, built on Nano Banana Pro's reasoning engine [/blog/Top-Editing-Tool-in-2025-Nano-Banana-Pro-Inpaint] [/layers?model=nano_banana_pro_inpaint].
- Credits and cost: about 3 credits ($0.15) per generation [/blog/restore-old-photos-ai].
- Launched: Dec 11, 2025 (blog post date).
- Sources: [/blog/Top-Editing-Tool-in-2025-Nano-Banana-Pro-Inpaint] [/layers?model=nano_banana_pro_inpaint] [/edit?model=nano_banana_pro_inpaint] [/blog/restore-old-photos-ai]

### Layer decomposition
- What it does: splits a flat image (product shot, poster, multi-object scene) into separate editable layers: background, subject and other elements, each shown as a thumbnail [/blog/edit-photos-with-ai-higgsfield].
- How to use: 1. Open an image asset → Edit Image → Layer Decomposition 2. Set resolution, mode, layer count 3. Generate.
- Inputs and settings: resolution 1K / 1.5K / 2K; mode Standard or Fast; layer count is a number field, default 5.
- Limits: not stated. A Photoshop plugin version exists ("Layer Decompose") [/creator-hub/help-center/integrations/external-integrations-higgsfield].
- Models: not stated.
- Credits and cost: the post gives two numbers: 24 credits ($1.20) for 2K with 8 layers in its price table, and "15 credits" for separating layers in its notes [/blog/edit-photos-with-ai-higgsfield].
- Launched: Aug 17, 2026 (blog post date).
- Sources: [/blog/edit-photos-with-ai-higgsfield] [/layers]

### Edit text
- What it does: replaces text already baked into an image (price, headline, label, translation) and matches the original font, color and placement. It is not meant for adding new text [/blog/edit-photos-with-ai-higgsfield].
- How to use: 1. Image asset → Edit Image → Edit text 2. Run Detect text (lists every line found) 3. Change any line 4. Generate.
- Inputs and settings: the detected lines, edited one by one.
- Limits: replacement only.
- Models: not stated.
- Credits and cost: 3.5 credits ($0.18) for detection plus editing; detection alone is 0.5 credits.
- Launched: Aug 17, 2026 (blog post date).
- Sources: [/blog/edit-photos-with-ai-higgsfield] [/layers]

### Remove background
- What it does: strips the background in one step and drops the result straight into the project, so there is no download and re-upload before the next edit [/blog/edit-photos-with-ai-higgsfield].
- How to use: 1. Image asset → Edit Image → Remove background 2. Generate.
- Inputs and settings: none beyond the image.
- Limits: also available in the Figma, Photoshop, Premiere/After Effects and DaVinci plugins and via MCP (image and video) [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent]. Recommended as prep for Marketing Studio product photos [/blog/how-to-make-ai-product-photos-without-a-studio].
- Models: not stated.
- Credits and cost: 1 credit ($0.05).
- Launched: Aug 17, 2026 (blog post date).
- Sources: [/blog/edit-photos-with-ai-higgsfield] [/blog/how-to-make-ai-product-photos-without-a-studio]

### Expand image (Expand & crop)
- What it does: extends or crops the canvas and fills new space with generated content, i.e. outpainting. The apps catalog lists it as "Expand any image beyond its edges" [/blog/edit-photos-with-ai-higgsfield] [/apps/relight].
- How to use: not stated beyond picking it under Edit Image.
- Inputs and settings: not stated.
- Limits: available via MCP ("Expand image (outpaint)") and in the Figma plugin [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/creator-hub/help-center/integrations/external-integrations-higgsfield].
- Models: not stated. Credits and cost: not stated.
- Launched: carried a "New" tag in Aug 2026 (blog post date Aug 17, 2026).
- Sources: [/blog/edit-photos-with-ai-higgsfield] [/apps/relight] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent]

### Color grading (image)
- What it does: color controls for any image: temperature, contrast, grain and mood [/apps/relight].
- How to use: from the apps catalog, or from Edit Image on an asset [/blog/edit-photos-with-ai-higgsfield].
- Inputs and settings: temperature, contrast, grain, mood (catalog blurb).
- Limits: also in the Figma plugin [/creator-hub/help-center/integrations/external-integrations-higgsfield]. For video, see Video relight and color palette.
- Models: not stated.
- Credits and cost: the apps catalog says "for free" [/apps/relight].
- Launched: not stated. Sources: [/apps/relight] [/blog/edit-photos-with-ai-higgsfield]

### Image upscale
- What it does: raises the resolution and quality of an image. The same /upscale page also takes videos ("Upload your images or videos") [/upscale].
- How to use: 1. Image → Image Upscale, or open any asset → Upscale 2. Pick a model 3. Pick a scale factor (plus Advanced settings) 4. Upscale [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do].
- Inputs and settings: three image models:
  - Topaz, the general-purpose default
  - ByteDance Upscale, up to 4K
  - Topaz Generative, diffusion-based, which invents fine detail; avoid it for product shots or text-heavy images
- Reported ranges: the restoration guide gives "Topaz High-Resolution Upscaler" scale factors x1 to x16, no prompt, removing scratches and sharpening in one pass [/blog/restore-old-photos-ai]. The Edit post says Upscale covers 2x to 16x, "1080p through 8K" across engines, photo and video [/blog/edit-photos-with-ai-higgsfield].
- Limits: works on any asset, however it was generated (MCP, Supercomputer) [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do]. Image upscaling is available via MCP [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent]. A case study calls Topaz Labs Upscaling "Higgsfield's integrated upscaling" tool [/creator-hub/case-studies/double-shots-music-videos-cinema-studio-higgsfield].
- Models: Topaz, ByteDance Upscale, Topaz Generative.
- Credits and cost: about 3 credits ($0.15) per image with Topaz High-Resolution Upscaler [/blog/restore-old-photos-ai]. The cost updates live on the Upscale button.
- Launched: not stated.
- Sources: [/upscale] [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do] [/blog/restore-old-photos-ai] [/blog/edit-photos-with-ai-higgsfield]

### Relight (image app)
- What it does: re-lights an existing photo. You set light position, softness, brightness and color, and the image is re-rendered with depth-aware, 3D lighting [/apps/relight] [/blog/Relight-Director-Style-Cinematic-Lighting].
- How to use: 1. Open Relight and upload 2. Pick a quick-select direction or drag the light pad 3. Choose Soft or Hard 4. Set brightness and color 5. Generate [/blog/Relight-Director-Style-Cinematic-Lighting].
- Inputs and settings:
  - Quick select: Top, Front, Right, Left, Back, Bottom
  - "Hold and drag" 3D light-direction pad for off-axis angles
  - Soft / Hard
  - Brightness 0 to 100%, default 50%
  - Color as hex, default #FFFFFF [/apps/relight]
- Limits: one image per run. Also in the Figma plugin [/creator-hub/help-center/integrations/external-integrations-higgsfield]. Video Relight became a separate product in Aug 2026 (see Video relight and color palette) [/blog/video-relight-color-palette-higgsfield].
- Models: not stated.
- Credits and cost: Generate 2 on the page; about 2 credits ($0.10) [/apps/relight] [/blog/restore-old-photos-ai].
- Launched: Jan 6, 2026 (blog post date).
- Sources: [/apps/relight] [/blog/Relight-Director-Style-Cinematic-Lighting] [/blog/restore-old-photos-ai]

### Face swap
- What it does: puts a source face onto a target photo or video, matching lighting, geometry and skin tone; no prompt or mask needed [/apps/face-swap] [/blog/a-simple-guide-to-face-swap].
- How to use: 1. Upload the target (photo or video) 2. Upload a clear source face 3. Generate [/apps/face-swap].
- Inputs and settings: generation type "Face Swap 2"; two images (or image plus video) [/apps/face-swap].
- Limits:
  - one face per operation, no multi-face swaps [/blog/a-simple-guide-to-face-swap]
  - with several faces in frame, the face closest to camera is swapped [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide]
  - 30 seconds to 2 minutes per run depending on plan and queue
  - 5 free swaps per day, reset about 24 hours after the first swap
  - commercial use on paid plans; strict policy against non-consensual or harmful use
  - also in the Figma and Photoshop plugins [/creator-hub/help-center/integrations/external-integrations-higgsfield]
- Models: Face Swap 2 (Higgsfield).
- Credits and cost: beyond the 5 free daily swaps, it uses plan credits; amount not stated.
- Launched: Oct 28, 2025 (blog post date, "next-gen" Face Swap).
- Sources: [/apps/face-swap] [/blog/a-simple-guide-to-face-swap] [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide]

### Character swap
- What it does: moves a whole character (face, body, skin tone, expression), not just a face, into a target image and re-renders it to fit the scene's style, light and perspective [/apps/character-swap] [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide].
- How to use: 1. Upload "Your Photo" (the character to insert) 2. Upload the "Target Image" (the character to replace) 3. Generate [/apps/character-swap].
- Inputs and settings: generation type "Character Swap 2" (page title "Character Swap 2.0"); outputs are pitched as "animation-ready" exports [/apps/character-swap].
- Limits: one clearly visible person works best; with several, the closest is swapped. Tips from the engineer post: avoid pure white backgrounds, keep hands empty, match the color palettes, avoid big body-size mismatches, keep the face unobstructed [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide]. Also in the Photoshop plugin [/creator-hub/help-center/integrations/external-integrations-higgsfield].
- Models: Character Swap 2. The Nov 2025 post calls the image version "Character Swap (Instadump)"; the video version (Character Video Swap / Recast) is under Recast [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide].
- Credits and cost: not stated.
- Launched: described as "newly released" on Nov 5, 2025 (blog post date).
- Sources: [/apps/character-swap] [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide]

### Angles 2.0
- What it does: generates new camera angles of an object, scene, product or person from one photo, with no re-prompting [/apps/angles] [/blog/Change-the-Angle-of-Any-Image].
- How to use: 1. Upload a photo, generation or render (any aspect ratio; the output matches it) 2. Use 3D drag rotation, sliders or quick select 3. Optionally "Generate from 12 best angles" 4. Adjust lighting brightness and color 5. Generate [/blog/Change-the-Angle-of-Any-Image].
- Inputs and settings: Rotation (degrees), Tilt (degrees), Zoom; "hold and drag to change camera angle"; full 360° including behind the subject; 12 auto-views; generation history on the same page [/apps/angles] [/blog/Change-the-Angle-of-Any-Image].
- Limits: shown with a "Pro" badge in the apps catalog (meaning not stated) [/apps/relight]. Also in Figma and Photoshop and as an Edit Image tool [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/blog/edit-photos-with-ai-higgsfield].
- Models: Angles 2.0 (Higgsfield; underlying model not stated).
- Credits and cost: Generate 0.2 on the page [/apps/angles].
- Launched: the Angles V2 update was described Nov 11, 2025 (blog post date).
- Sources: [/apps/angles] [/blog/Change-the-Angle-of-Any-Image] [/blog/edit-photos-with-ai-higgsfield]

### Skin enhancer
- What it does: portrait retouching that rebuilds facial detail and skin texture instead of blurring. It fixes noise, blur, compression, uneven tone and old scans [/blog/The-Skin-Enhancer-How-to-Retouch-Pictures-with-AI].
- How to use: 1. Edit → Skin Enhancer (also in the apps catalog) 2. Upload a portrait with a visible face 3. Pick a strength mode 4. Optional filters 5. Generate and compare with the before/after slider [/blog/The-Skin-Enhancer-How-to-Retouch-Pictures-with-AI].
- Inputs and settings: three modes, Soft Skin, Realistic Skin and Imperfect Skin [/blog/The-Skin-Enhancer-How-to-Retouch-Pictures-with-AI]; the Edit post likewise says three enhancement modes [/blog/edit-photos-with-ai-higgsfield]. Optional filters cover softness, texture, lighting, color, eye clarity and highlight/shadow. The pages disagree: another post says "no sliders" and one-click only [/blog/AI-Skin-Enhancer-How-AI-Retouching-Works-in-Editing], and a third suggests 70 to 85% intensity [/blog/How-AI-Skin-Enhancer-Retouches-Low-Quality-Photos-Images].
- Limits: works best on mid-shots and close-ups; crop multi-face photos one face at a time. One post claims "no censorship" and "unlimited use" with no plan detail [/blog/How-AI-Skin-Enhancer-Retouches-Low-Quality-Photos-Images]. "Pro" badge in the catalog [/apps/relight]. Also in the Photoshop plugin [/creator-hub/help-center/integrations/external-integrations-higgsfield].
- Models: not stated.
- Credits and cost: not stated.
- Launched: Dec 6, 2025 (blog post date, three posts).
- Sources: [/blog/The-Skin-Enhancer-How-to-Retouch-Pictures-with-AI] [/blog/AI-Skin-Enhancer-How-AI-Retouching-Works-in-Editing] [/blog/How-AI-Skin-Enhancer-Retouches-Low-Quality-Photos-Images] [/apps/relight]

### AI Stylist (Try-On)
- What it does: virtual try-on. It re-dresses the person in your photo without regenerating the scene, then sets pose and background from presets [/blog/AI-Stylist-Recreate-Any-Outfit-with-Try-On] [/blog/ai-fashion-photo-generator].
- How to use: 1. Apps → AI Stylist 2. Upload your image 3. Pick a full outfit preset or build the look piece by piece 4. Pick a pose preset 5. Pick a background preset 6. Generate [/blog/AI-Stylist-Recreate-Any-Outfit-with-Try-On].
- Inputs and settings: outfit categories Headwear, Outerwear, Base, Pants, Footwear, Accessories; pose presets; background presets; you can also upload your own outfit combination [/blog/ai-fashion-photo-generator].
- Limits: needs a clean, well-lit, sharp source photo. Also in the Photoshop plugin [/creator-hub/help-center/integrations/external-integrations-higgsfield]. Outfit swapping with AI Stylist is listed among the Supercomputer apps marketplace apps [/blog/introducing-higgsfield-apps].
- Models: not stated.
- Credits and cost: about $0.10 per generation ("10 looks for $1") [/blog/ai-fashion-photo-generator].
- Launched: Jan 5, 2026 (blog post date).
- Sources: [/blog/AI-Stylist-Recreate-Any-Outfit-with-Try-On] [/blog/ai-fashion-photo-generator] [/blog/introducing-higgsfield-apps]

### Urban Cuts
- What it does: turns one photo plus an outfit plus a music track into a beat-synced outfit video; cuts land on the audio peaks. The post's conclusion also calls it "BeatFit" [/blog/UrbanCuts-Create-Audio-Synced-Outfit-AI-Videos].
- How to use: 1. Upload a photo with the face visible (a full-length photo, per the fashion post) 2. Upload your outfit or pick a preset 3. Upload audio or pick a preset track 4. Generate [/blog/UrbanCuts-Create-Audio-Synced-Outfit-AI-Videos] [/blog/ai-fashion-photo-generator].
- Inputs and settings: 40+ outfit presets; 30+ preset audios or your own track (moods from "Tokyo Dust" to "Vapor Skin"); outputs 9:16, 1:1, 3:4, 4:3, 16:9.
- Limits: not stated.
- Models: not stated.
- Credits and cost: $1.70 per generation [/blog/ai-fashion-photo-generator].
- Launched: Nov 25, 2025 (blog post date).
- Sources: [/blog/UrbanCuts-Create-Audio-Synced-Outfit-AI-Videos] [/blog/ai-fashion-photo-generator]

### Higgsfield Apps catalog (viral apps)
- What it does: single-purpose, mostly prompt-free tools. You upload a photo, pick a preset and generate; each app copies a viral visual trend [/blog/The-Complete-Guide-to-Viral-Higgsfield-Apps].
- How to use: 1. Higgsfield → Apps 2. Choose an app 3. Upload an image 4. Optionally add outfit references 5. Choose a preset 6. Generate. Video-capable apps then offer Generate Video with an animation style.
- Current "Explore more apps" rail on the app pages [/apps/relight] [/apps/angles]:
  - Virality Predictor: scores a video hook before posting; detailed in Marketing Studio as a virality / engagement / retention estimate, not a guarantee [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads]
  - Expand image
  - Angles 2.0 (Pro badge)
  - Shots: 9 unique shots from one image ("a storyboard of framing options" in Photoshop) [/creator-hub/help-center/integrations/external-integrations-higgsfield]
  - Transitions (Trending badge): seamless transitions between shots
  - Color grading: free
  - What's Next? (New badge): 8 narrative possibilities from 1 scene
  - Behind the Scenes: photos into behind-the-scenes videos
  - Zooms: 9 zoom levels from one image
  - Skin Enhancer (Pro badge)
- Also under Apps routes: Relight, Face Swap, Character Swap [/apps/relight] [/apps/face-swap] [/apps/character-swap]; AI Stylist and Urban Cuts [/blog/AI-Stylist-Recreate-Any-Outfit-with-Try-On].
- Nov 2025 viral wave [/blog/The-Complete-Guide-to-Viral-Higgsfield-Apps]:
  - Style Snap: outfit restyle with 14 presets; best on mid-shots
  - Outfit Vending: "fashion vending machine"
  - Glitter Sticker: kawaii sticker sheet
  - Signboard: billboard or shop-sign mockup
  - Paint App: re-draws your photo in a computer Paint app
  - Nano Strike: Counter-Strike-style poster, up to 5 people, image or video
  - Nano Theft: GTA-style poster, several people, image or video
  - Simlife: Sims-style character, white background recommended, up to 2 clothing photos, waving video
  - Japanese Show: 90s to 2000s Japanese TV look
- Limits: none stated per app. Do not confuse this catalog with "Higgsfield Apps" in Supercomputer, the no-code builder whose user-made apps run on users' own credits (see Higgsfield Apps (Supercomputer app builder)) [/blog/introducing-higgsfield-apps] [/creator-hub/help-center/tools/what-are-higgsfield-apps]. The changelog title "Higgsfield Apps. Back online" is undated and does not say which product it means [/creator-hub/changelog].
- Models: not stated. The app names Nano Strike and Nano Theft suggest Nano Banana (inferred).
- Credits and cost: per app, mostly not stated (Relight 2, Angles 0.2, Color grading free).
- Launched: viral-apps guide Nov 21, 2025 (blog post date).
- Sources: [/apps/relight] [/apps/angles] [/blog/The-Complete-Guide-to-Viral-Higgsfield-Apps] [/creator-hub/help-center/integrations/external-integrations-higgsfield]

### Photo restoration workflow
- What it does: a documented recipe for fixing old or damaged photos (scratches, creases, fading, blur, low resolution, bad exposure, scan dust) while keeping the person's likeness [/blog/restore-old-photos-ai].
- How to use, by need:
  1. Resolution or wear only: Topaz High-Resolution Upscaler, upload, scale x1 to x16, one click, no prompt
  2. Damage or color: Nano Banana Pro or GPT Image 2 with a restoration prompt (the post supplies one), output 1K / 2K / 4K
  3. Exposure: Relight
  4. One damaged area: Inpaint [/blog/restore-old-photos-ai]
- Inputs and settings: as for each tool. The FAQ suggests x8 or x16 for tiny sources and testing a few photos before batching.
- Limits: not stated.
- Models: Topaz High-Resolution Upscaler, Nano Banana Pro, GPT Image 2, Relight, Nano Banana Pro Inpaint. Face Swap is also pitched for rebuilding damaged faces from a clean reference photo [/blog/a-simple-guide-to-face-swap].
- Credits and cost: Topaz 3 credits ($0.15); Relight 2 ($0.10); Inpaint 3 ($0.15); Nano Banana Pro 2K 2 ($0.10) / 4K 4 ($0.20); GPT Image 2 2K 7 ($0.35) / 4K 12 ($0.60) [/blog/restore-old-photos-ai].
- Launched: Aug 2, 2026 (blog post date).
- Sources: [/blog/restore-old-photos-ai] [/blog/a-simple-guide-to-face-swap]

## Soul, characters and image studios

### Higgsfield Soul (original Soul model)
- What it does: Higgsfield's first in-house image model for fashion-forward, realistic shots driven by presets instead of long prompts; adds camera-like dust, flash and grain.
- How to use: 1. Image → Soul 2. Pick a preset (or an avatar from the Character section plus a preset) 3. Write a prompt or leave it empty 4. Set batch size and aspect ratio 5. Generate.
- Inputs and settings: preset categories General, TikTok Core, Instagram Aesthetics, Beauty, Mood, Camera Photo, Graphic Art; launch post cites looks like iPhone flash, Dune-core, masked looks, giant hands. Preset count differs: 50+ at launch [/blog/Higgsfield-SOUL-Turns-Prompts-Into-Fashion-Ready-Shots], 100+ one-click presets for the "lighter Soul model" [/blog/best-midjourney-alternatives]. Launch post: 4 shots per generation.
- Limits: no Moodboards and no Soul HEX (those are Soul 2.0 / Soul Cinema only); prompt field is disabled when a reference image is attached. Not in the current Image nav menu (only Soul 2.0 and Soul Cinema are), though "Soul" still sits in the site footer [/].
- Models: Higgsfield Soul (in-house). The Fashion Factory page runs on it [/fashion-factory].
- Credits and cost: launch post says free access on all plans (Jun 2025). Fashion Factory bar shows "Higgsfield Soul, 2k, 4/4, Generate 2", i.e. about 0.5 credits per image (inferred). Help center: standard rates, cost on the Generate button.
- Launched: Jun 25, 2025 (blog post date).
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images] [/blog/Higgsfield-SOUL-Turns-Prompts-Into-Fashion-Ready-Shots] [/blog/best-midjourney-alternatives] [/fashion-factory] [/]

### Higgsfield Soul 2.0
- What it does: Higgsfield's own foundation image model, "fashion-aware, culture-native"; the flagship of the Soul family. One generation can combine a prompt, a preset or Moodboard, a Soul ID character and a Soul HEX palette.
- How to use: 1. Image → Soul 2.0 [/ai/image?model=soul-v2] 2. Write a prompt (or attach a reference image) 3. Optionally pick a preset or Moodboard, a Character and Color Transfer 4. Set ratio, quality, batch 5. Generate.
- Inputs and settings: aspect ratios 9:16, 3:4, 2:3, 1:1, 4:3, 16:9, 3:2; quality 1.5k (fastest, cheapest) or 2k (best fidelity); batch 1 to 4; built-in prompt enhance; reads photographic cues like phone flash or disposable camera.
  - Presets: "20+" named looks (Warm Ambient, Retro BW, Y2K Street, Subtle Flash, Y2K Studio, Street Photography, Theatrical Light, Asian Nostalgia, Editorial Street Style, Surreal Solarization, Flash Editorial, Digital Camera, Siren, Swag Era, Mystique City, Balletcore, Candy Pop, 2000s Band, Frutiger Aero, Drain, Old Smartphone) per most pages; "30+" per [/blog/best-midjourney-alternatives]. Presets are now also surfaced as curated Moodboards.
  - Reference image: when attached, the prompt field is disabled; Soul ID and Soul HEX still apply.
- Limits: output tops out at 2K (upscale is a separate step); weaker at text rendering, object editing and crowds (the trained face can be cloned onto background people) [/blog/soul-2-vs-nano-banana-pro]. Available on web, MCP/CLI (Claude, ChatGPT, Cursor, Claude Code) and the Higgsfield API as "Soul 2".
- Models: Soul 2.0 (also labelled Soul V2 on pricing, Soul 2 in the API).
- Credits and cost: 0.125 credits (~$0.006) per 2K image; Photodump modal bar shows "Generate 0.125" at 2k, 1/4 [/ai/image?model=soul-v2&modal-photo-dump=true]. One page says a 2K character sheet cost 0.5 credits [/blog/generate-ai-videos-from-chatgpt]. API: $0.0032 per image. Included in All Unlimited at up to 2K. One-time free pools for "Soul V2 & Cinema": 300 (Starter), 5,000 (Plus), 10,000 (Ultra) on the pricing panel [/apps/character-swap]; blogs say 3,000 to 10,000 by plan. Free gens do not renew [/creator-hub/help-center/credits/how-credits-work].
- Launched: not stated; earliest dated mention Feb 23, 2026 (blog post date, Soul HEX launch).
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images] [/blog/soul-2-vs-nano-banana-pro] [/blog/ai-fashion-photo-generator] [/blog/best-ai-image-generators-2026] [/blog/Why-Does-Your-AI-Characters-Face-Keep-Changing] [/blog/higgsfield-api] [/blog/higgsfield-all-unlimited-explained] [/apps/character-swap] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent]

### Soul Reference
- What it does: the guided mode of Soul 2.0: upload one image and the model reads its composition, lighting, pose and mood, then generates variations on it.
- How to use: 1. Open Soul 2.0 2. Attach a reference image 3. Optionally add a Soul ID character and Soul HEX palette 4. Generate.
- Inputs and settings: one reference image; prompt becomes unavailable while a reference is attached.
- Limits: anchors one generation only; drifts across many separate generations (Soul ID is the fix for faces).
- Models: Soul 2.0; reference also works in Soul and Soul Cinema per the help center.
- Credits and cost: standard Soul 2.0 rates (not separately stated).
- Launched: not stated (named as an existing core feature on Feb 24, 2026, blog post date).
- Sources: [/blog/Why-Does-Your-AI-Characters-Face-Keep-Changing] [/blog/create-custom-ai-moodboard-soul-2] [/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images]

### Higgsfield Soul Cinema
- What it does: a separate Soul model for cinematic stills: deep texture, atmosphere, a "spontaneous" look; the cinematic style is built in, so there are no presets or Moodboards. Often used for video keyframes and location plates.
- How to use: 1. Image → Soul Cinema [/ai/image?model=soul-cinematic] 2. Write a prompt (scene, subject, mood) 3. Optionally Color Transfer (Soul HEX) and a Soul ID character 4. Set ratio, quality, batch 5. Generate.
- Inputs and settings: tool bar shows Camera, Color Transfer (marked New), 16:9 default, 2k, an On/Off toggle (likely prompt enhance, inferred), batch 1/4, Character. Up to 4 images per generation. Reference image disables the prompt.
- Limits: no preset panel, no Moodboards. Existing Soul 2.0 characters may need an "update" in the Character panel before they appear in Soul Cinema. Strongest on close-ups.
- Models: Soul Cinema (launched as "Soul Cinema Preview"). Pages pair it with Kling 3.0 or Seedance 2.0 for animation; also on the API.
- Credits and cost: four images cost half a credit (0.125 each) [/blog/marketing-studio-video-1]; API $0.0032 per image; shares the "Soul V2 & Cinema" free pools (300 / 5,000 / 10,000 by plan). Preview post calls it cheaper than other models.
- Launched: Mar 4, 2026 as Soul Cinema Preview (blog post date), with the full version promised "next week"; help center (Aug 1, 2026) lists it as Soul Cinema.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-soul-cinema] [/blog/soul-cinema-preview] [/ai/image?model=soul-cinematic] [/blog/marketing-studio-video-1] [/blog/higgsfield-api] [/blog/seedance4k-breakdown]

### Soul HEX and color transfer
- What it does: color control for Soul generations: extracts the dominant palette from a reference photo (or a built-in palette) and applies it; Color Transfer can also apply a finished grade from one image across a series.
- How to use: 1. In Soul 2.0 or Soul Cinema click Color Transfer in the generation bar 2. Upload a reference (or pick a built-in palette) 3. Optionally add a Soul ID and preset 4. Generate.
- Inputs and settings: up to 20 reference photos in the "Color signature" section, 1 is enough [/blog/hex-codes-ai-image-generation-color-control-soul]; built-in palettes Film colors, Lime Jam, Candy pink, Nostalgic blue, Soft palette, Black gloss. Recraft V4.1 and Utility expose Soul HEX with 50+ preset palettes [/blog/recraft-v4-higgsfield].
- Limits: Soul 2.0 and Soul Cinema only within the Soul family (not original Soul). Video recoloring is a separate standalone tool, Color Palette [/apps/video-rehex].
- Models: Soul 2.0, Soul Cinema; Recraft V4.1 (and Utility).
- Credits and cost: not stated as a separate charge.
- Launched: Feb 23, 2026 (blog post date); on Recraft V4.1 Aug 26, 2026 (blog post date); video Color Palette Aug 20, 2026 (blog post date; changelog title "Relight and HEX for videos standalone", undated).
- Sources: [/blog/hex-codes-ai-image-generation-color-control-soul] [/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images] [/blog/ai-fashion-photo-generator] [/blog/recraft-v4-higgsfield] [/blog/video-relight-color-palette-higgsfield] [/creator-hub/changelog]

### Soul Moodboard
- What it does: reusable custom style presets built from your own reference images; Soul 2.0 analyzes lighting, texture, contrast and color and applies that style to every generation. Positioned as the evolution of Soul 2.0 presets.
- How to use: 1. Soul 2.0 → Moodboard icon (or /moodboard) → Build your moodboard 2. Upload images from device or Assets 3. Soul 2.0 builds it; keep or edit the auto name 4. Apply it when generating, with Soul ID or a reference image if wanted.
- Inputs and settings: two types, Curated (built-in) and Personal. Image counts differ: up to 80 images, about 10 is enough, 20 to 30 better [/blog/create-custom-ai-moodboard-soul-2]; aim for 20+ [/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images]. One cohesive style, no faces, no blurry or mixed-style images. The /moodboard page lists 32 curated boards (Warm ambient, Y2K studio, Swag era, Double exposure, Extraterrestrial, Underwater, 80s horror, Disposable camera, several "film" looks and more).
- Limits: Soul 2.0 only (not Soul or Soul Cinema).
- Models: Soul 2.0.
- Credits and cost: not stated (each curated board has its own Generate button on /moodboard).
- Launched: Feb 24, 2026 (blog post date).
- Sources: [/blog/create-custom-ai-moodboard-soul-2] [/moodboard] [/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images] [/blog/ai-fashion-photo-generator]

### Soul ID Character
- What it does: a trained identity layer: train once on photos of one person and the same face appears across every Soul generation regardless of preset, light or angle; nav label "Soul ID Character".
- How to use: 1. Soul → Train new character (or /character → Create character) 2. Upload 20+ photos of one person 3. Wait a few minutes 4. Name it 5. Select it in the Character tab when generating.
- Inputs and settings: 20+ photos, up to 80; 960px+ per photo optimal (rated "Perfect"); varied angles and expressions, at least one full-height shot, recent photos (last 4 to 5 months), no sunglasses, hats, heavy shadows, crops or group shots. Training 3 to 5 minutes. Photo minimums differ: 25+ for Photodump Studio (2025) [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot]; "around 10 or more" in one guide [/blog/keep-ai-character-consistent].
- Limits: one person per Soul ID (use Elements for multi-character scenes); "clearly the same person", not pixel-identical; stronger on close and mid shots; not exportable; multiple personas per account allowed. Real people only with permission; invented characters need generated portraits first. Pages disagree on video: carries into Seedance as an auto-created Element and into Kling, Veo, Lipsync Studio, Marketing Studio per most pages, but one page calls it image-only [/blog/how-to-turn-photo-into-consistent-ai-persona-creator]. Usable from MCP agents and the CLI "soul" skill (upload, train, name); one page says the API adds Soul ID [/blog/ai-video-api-pricing-vs-subscriptions].
- Models: Soul, Soul 2.0, Soul Cinema (shared across the family); as Elements in Seedance.
- Credits and cost: 25 credits (~$1.25) per character training. Plan gate differs: "any paid plan" [/blog/keep-ai-character-consistent], entry plan includes it [/blog/ai-tiktok-pipeline-2026], first character free during the Photodump Studio launch (Sep 2025).
- Launched: not stated (already live by Sep 18, 2025, blog post date).
- Sources: [/creator-hub/help-center/ai-models/how-do-i-create-and-use-a-soul-id-character] [/character] [/blog/Soul-ID-AI-Character-Consistency] [/blog/keep-ai-character-consistent] [/blog/how-to-turn-photo-into-consistent-ai-persona-creator] [/blog/Why-Does-Your-AI-Characters-Face-Keep-Changing] [/blog/best-ai-video-consistent-characters] [/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/blog/best-midjourney-alternatives]

### Photodump Studio
- What it does: the 2025 standalone studio: one trained Soul ID character produces a 26-shot photoshoot in a single run, then shots can be animated or made to talk.
- How to use: 1. Open /photodump-studio 2. Train a Soul ID with at least 25 photos (include 3 to 4 clear front views, face to chest) 3. Generate 4. Results save to your Soul page 5. Download and post.
- Inputs and settings: 26 shots per run; mix of settings, lighting and angles in the training set.
- Limits: the /photodump-studio capture today shows only Login and Sign up; the nav "Photodump" entry now opens the Soul 2.0 Photodump modal instead (see next entry).
- Models: Soul ID on Soul; refine in Nano Banana; animate with Veo 3 or Kling; talk via Lipsync Studio (Kling Speak 720p, Kling Lipsync, InfiniteTalk, Sync Lipsync 2 Pro, Speak 2.0, Veo 3 Fast).
- Credits and cost: launch promo: first Soul ID character and a full Photodump set free; bonus unlimited Kling Speak (720p), Kling Lipsync and InfiniteTalk plus a one-time trial of each listed lipsync model.
- Launched: Sep 18, 2025 (blog post date).
- Sources: [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] [/photodump-studio] [/]

### Photodump (Soul 2.0 photodump modal)
- What it does: a Soul 2.0 mode that turns one Soul ID character into a ready-to-post carousel set across scenes, outfits and moods ("Different Scenes. Same Star").
- How to use: 1. Image → Photodump [/ai/image?model=soul-v2&modal-photo-dump=true] 2. Select a preset 3. Create or select a Soul ID character 4. Check image 5. Generate, then download and curate.
- Inputs and settings: launch post: 15 photos per set, 2 presets (Male Archive, Cool Girl Dump) [/blog/how-to-create-ai-photodump-higgsfield-soul]. Current modal lists 9 presets: Sleepy Head, Zen, Candid Glow, Office dresscode, Surreal Self, Surreal Self II, Alter ego, Cool Girl Dump, Male Archive. Bar defaults 3:4, 2k, 1/4.
- Limits: needs a trained Soul ID; output quality tracks the Soul ID photo set.
- Models: Soul 2.0 with Soul ID.
- Credits and cost: modal button reads "Use this preset" with a Free label; the Soul 2.0 bar shows Generate 0.125. Per-set cost not stated.
- Launched: Feb 26, 2026 (blog post date) as Soul Photodump.
- Sources: [/blog/how-to-create-ai-photodump-higgsfield-soul] [/ai/image?model=soul-v2&modal-photo-dump=true]

### Instadump
- What it does: turns one uploaded portrait into a set of realistic, social-style photos in new scenes and lighting, styled by a preset pack or your own references, with no prompt and no training.
- How to use: help center (now a Popcorn mode): 1. Choose a pack or create one 2. Add your photo 3. Get your Instadump. Launch post: 1. Upload a clear portrait 2. Pick a preset or upload references 3. Format adapts 4. Generate.
- Inputs and settings: one photo of the subject; 20+ curated presets (Meme styles, For Women, For Men, Neutral and thematic); custom packs of up to 15 reference photos (PNG or JPG, or pasted from clipboard) with a name; aspect ratio follows the input.
- Limits: realism only (stylized or anime inputs not recommended); best when subject types match (woman to woman, man to man); frontal or 3/4 poses.
- Models: not stated; runs inside Popcorn per the help center. An engineer post calls it "Character Swap (Instadump)" on images [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide].
- Credits and cost: not stated.
- Launched: Oct 27, 2025 (blog post date).
- Sources: [/blog/Create-Ai-Photoshoots-With-Instadump] [/creator-hub/help-center/ai-models/how-do-i-use-popcorn] [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide]

### AI Influencer (AI Influencer Studio, Character Builder)
- What it does: a game-style, menu-only character builder for virtual personas (human or not), saved to a character library and turned into video in the same studio.
- How to use (Oct 2026 update): 1. Open AI Influencer → Character Builder [/ai-influencer-studio] 2. Optionally Add your face / Upload your photo 3. Set Character type 4. Work through the settings (or Shuffle / Randomize) 5. Generate 6. Review Character Parameters, Recreate, or save as an element 7. Use in Genjutsu for video.
- Inputs and settings:
  - Update: 19 categories; start from scratch, a reference, or your own photo. Character type grades Average, Bold, Extreme (capture also lists Insect, Frog, Cat, Dog, Rodent, Bird: 9 options). Capture counts: Gender 5, Build 7, Hairstyle 26, Hair color 13, Style 8, Ethnicity 6, Age 3, Skin color 8, Height 3, Proportions 5, Head shape 10, Neck 4, Eye shape 11, Eye color 8, Features 25, Facial hair 8, Distinctive features 14, Accessories 6. Blog counts differ (21 hairstyles, 7 head shapes, 6 builds, 7 styles) [/blog/new-ai-influencer]. Output: a close-up portrait plus a full-body shot.
  - Before the update: Builder panel plus Advanced tabs Face, Body, Style; species types (humans, mammals, reptiles, fish, hybrids, aliens) that can blend; single image up to 4K; text Edit field (costs credits) [/creator-hub/help-center/tools/how-do-i-use-ai-influencer].
  - Video: Use in Genjutsu / Turn to motion with Genjutsu, with Motion transfer or Objects swap; reference video 4 to 30 s, up to 30 images, 480p, 720p or 1080p, Style field, prompt optional. Earlier routes: video button, Kling Motion Control, lipsync; 50+ Viral Presets [/blog/ai-content-for-tiktok-2026].
  - Reuse: Explore feed (AI Influencers, Higgsfield Presets, Community Trends with Recreate) and History; an AI Influencer tab in the Cinema Studio media picker; Create element / Assign to element.
- Limits: for a locked face across generations, train a Soul ID on 20+ of its portraits. Use only your own face or one you have permission for. Platform disclosure rules for synthetic media apply.
- Models: Genjutsu (Motion tab); Kling Motion Control (pre-update); Soul ID / Soul 2.0 / Soul Cinema for reuse. Image model behind the builder: not stated.
- Credits and cost: 1.12 credits (~$0.06) per character at 20 credits per $1; Motion cost shown on Generate; 5 free generations per user as of Oct 3, 2026 [/creator-hub/changelog]. Plans quoted: Starter $15/mo, Plus $49/mo ($39 annual), Ultra $129/mo ($99 annual).
- Launched: rebuilt version Oct 2, 2026 (changelog); blog post Oct 3, 2026. Original builder launch date not stated (help article Aug 1, 2026; guide Jun 13, 2026).
- Sources: [/creator-hub/changelog] [/blog/new-ai-influencer] [/ai-influencer-studio] [/creator-hub/help-center/tools/how-do-i-use-ai-influencer] [/blog/how-to-create-ai-influencer] [/blog/ai-content-for-tiktok-2026] [/creator-hub/help-center/tools/which-higgsfield-tool-should-i-use]

### Soul Cast
- What it does: a casting studio for customizable AI actors that stay consistent across Cinema Studio generations, pitched against the "plastic", waxy AI look.
- How to use: 1. Cinema Studio → Cast tab 2. Set genre, budget, era, archetype, identity, appearance, details, outfit 3. Generate the actor 4. Save to Elements 5. Use up to 3 in a Cinema Studio 2.5 keyframe, or as references in 4.0.
- Inputs and settings: Genre (14: Action, Adventure, Comedy, Drama, Thriller, Horror, Detective, Romance, Sci-Fi, Fantasy, War, Western, Historical, Sitcom); Budget in millions; Era by decade from the 1900s; Archetype (12, e.g. Hero, Rebel, Sage, Jester); Gender (Male, Female); Race (White, Black, Asian, Latino, Indigenous, Mixed); Age slider from 20; Build (6), Height, Eye color, Hair style, texture, color, Facial hair; Details (scar, freckles, tattoos, eye patch, or Manual text); Outfit (casual, formal, high fashion, military, sporty, workwear, vintage).
- Limits: up to 3 Soul Cast characters per Cinema Studio 2.5 keyframe; Cinema Studio 4.0 takes up to 50 references including Soul Cast characters. Lives inside Cinema Studio.
- Models: not stated.
- Credits and cost: not stated.
- Launched: Mar 9, 2026 (blog post date); Cinema Studio 2.5 integration Mar 18, 2026 (blog post date).
- Character sheet: generation returns front, side and back views; 4.0-era pages mention "AI Cast", likely the same feature (inferred) [/blog/cinema-studio-3.0] [/blog/how-we-built-cinema-studio].
- Sources: [/blog/soul-cast-ai-filmmaking] [/blog/cinema-studio-2-5-ai-video-generator] [/creator-hub/help-center/tools/how-do-i-use-cinema-studio] [/blog/best-veo-alternatives-character-consistency]

### Higgsfield Popcorn
- What it does: an AI storyboard generator and editor: produces up to 8 connected frames in one pass where face, body, clothing, lighting and spatial logic persist; also used to replace faces or characters and move subjects to new locations.
- How to use: 1. Image → Popcorn (Create → Image → Popcorn in some posts) 2. Input a prompt, image references, or both 3. Choose Manual (direct each frame) or Auto (one prompt, pick 4, 6 or 8 frames) 4. Generate 5. Edit any frame and regenerate; chain the last frame as a new reference for longer stories.
- Inputs and settings: up to 4 image references (portrait, location, prop, mood), referenced by number in the prompt; third mode Instadump; aspect ratios 3:4, 2:3, 3:2, 4:3, 16:9, 1:1, 9:16 or Auto (help center; older posts list 5). Prompt structure: subject, setting, style, action, atmosphere.
- Limits: max 8 frames per generation; consistency holds within one generation, not across runs unless a frame is fed back; celebrities only via uploaded photos; avoid low-res inputs. Not in the current Image nav menu, but listed under Studios in the footer [/].
- Models: not stated ("Higgsfield's core model architecture"); frames go on to Kling, Veo or Cinema Studio; Oct 2025 FAQ mentions export to Sora 2.
- Credits and cost: depends on frame count, shown on Generate; one estimate ~5 credits (~$0.25) per scene of up to 8 frames [/blog/ai-short-film-pipeline]; free daily credits can test it (Oct 2025).
- Launched: Oct 19, 2025 (blog post date); help article Aug 2, 2026.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-popcorn] [/blog/AI-Tool-That-Allows-You-to-Replace-Faces-in-a-Movie-Scene] [/blog/The-AI-Storyboard-Generator-That-Feels-Like-Directing] [/blog/How-to-Use-AI-for-Storyboards-Higgsfield-Popcorn] [/blog/how-to-keep-ai-persona-consistent-higgsfield-popcorn] [/blog/Next-Gen-AI-Photo-Editing-Tool-Higgsfield-Popcorn] [/blog/ai-storyboard-higgsfield-popcorn-best-tool] [/blog/script-to-storyboard-ai] [/blog/consistent-characters-locations] [/blog/ai-short-film-pipeline]

### Fashion Factory
- What it does: product-photoshoot studio that combines your product with a consistent character to make branded, model-style shots for e-commerce, ads and social.
- How to use: 1. Open /fashion-factory 2. Upload an image as the prompt or describe the scene 3. Pick a Character (Change) and a template (Select template) 4. Generate.
- Inputs and settings: bar shows Higgsfield Soul, 3:4, 2k, On, batch 4/4, Character.
- Limits: no help or blog page describes it; listed under Studios in the footer, not in the Image nav menu.
- Models: Higgsfield Soul (per the tool bar); character presumably a Soul ID (inferred).
- Credits and cost: Generate 2 credits at 2k for a batch of 4 (as shown on the button).
- Launched: not stated.
- Sources: [/fashion-factory] [/]

## Video studios

### Cinema Studio
- What it does: Higgsfield's AI filmmaking environment, where camera, lens, light, color, pacing and cast are set as explicit controls before a multi-shot clip with native audio is generated. Higgsfield calls it a tool built on interchangeable video models, not a model; version 4.0 is current [/blog/how-we-built-cinema-studio] [/creator-hub/help-center/ai-models/which-ai-model-should-i-use].
- How to use (4.0): 1. Open Cinema Studio (4.0 loads by default; a selector at the top switches between 2.0 and 4.0) 2. Start or open a project 3. Add references: uploads, Elements, Soul Cast or AI Influencer characters, past generations 4. Set the Director's Panel (genre, era, tempo, camera, lens, aperture, palette, lighting) 5. Tag a character's emotion with @name 6. Write a prompt that describes only the scene 7. Generate [/creator-hub/help-center/tools/how-do-i-use-cinema-studio] [/blog/cinema-studio-4-0].
- Inputs and settings:
  - Video modes: References (new clip), Forward / Backward Extend (continues an uploaded video of up to 30 s in either direction), Edit Video (regional edit of an object or a face, no full regeneration) [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
  - Up to 50 references per generation (images, videos, Soul Cast characters); clips up to 30 s; a generated audio clip can be attached as a reference [/blog/higgsfield-audio]; a clip can come back already cut into several shots, depending on tempo [/blog/make-ai-video-from-script].
  - Resolution: "up to 720p" per the FAQ in [/blog/how-we-built-cinema-studio]; "up to 1080p" per [/blog/ai-video-camera-control] [/blog/how-studios-scale-ai-video-production] [/blog/best-veo-alternatives-character-consistency].
  - Workspace on the live page: Home, My generations, My elements, My favorites, Community, Projects, New project, Explore. The page says you can edit each scene on its own and extend the story in any direction [/generate] [/generate?mode=video]. Media picker tabs: Uploads, Elements, Generations, AI Influencer [/blog/new-ai-influencer].
  - All settings are listed under "Cinema Studio 4.0 Director's Panel" below.
- Limits:
  - Content protection blocks real faces and protected IP with "May contain protected content" [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
  - Video upload caps: 2.5 takes none, 3.0 and 3.5 take up to 15 s, 4.0 takes up to 30 s [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
  - Where it runs: on the web. Cinema Studio 4.0 is in the Higgsfield API catalog [/blog/best-ai-video-generation-apis] [/blog/automate-ai-video-n8n-make]. Claude can call it over MCP [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP]. It is also available to OpenAI Dots [/creator-hub/changelog] and from the DaVinci Resolve panel [/blog/higgsfield-davinci-resolve].
  - The Discord 200K contest ran inside Cinema Studio contest projects, with entries up to 60 s [/creator-hub/changelog].
- Models: 4.0 "runs on Seedance 2.5" [/creator-hub/help-center/tools/how-do-i-use-cinema-studio]. The 4.0 FAQ lists "multi-model support" and "Soul Cinema models" [/blog/how-we-built-cinema-studio]. Its camera logic applies across Seedance 2.0, Veo 3.1, Kling 3.0 and WAN 2.6 [/blog/keep-ai-character-consistent] [/blog/best-ai-video-consistent-characters]. Kling 3.0 is reachable inside Cinema Studio [/blog/ai-human-motion-2026], and Seedance 2.0 was run "through Cinema Studio" [/blog/ai-video-hands-faces].
- Credits and cost:
  - 4.0: a 10 s clip at 720p with native audio costs 70 credits (about $3.43 at the Plus rate), and 160 credits at 1080p, as of Oct 2026 [/blog/best-adobe-firefly-alternatives-ai-video] [/blog/how-to-generate-ai-video-all-in-one-platforms] [/blog/higgsfield-vs-runway-2026].
  - 3.5: 8 s at 720p costs 40 credits ($2) [/blog/photo-to-ai-video]. An Aug 2026 table that names no version: 5 s/720p 25 credits, 5 s/1080p 50, 10 s/720p 50, 10 s/1080p 100 [/blog/ai-video-credits-explained].
  - Unlimited, sources disagree: the help center says generations are free on higgsfield.ai if Cinema Studio models are on the plan's Unlimited list [/creator-hub/help-center/tools/how-do-i-use-cinema-studio]. Other pages say Cinema Studio "aren't covered by Unlimited" [/blog/best-veo-alternatives-character-consistency] and that Studios always deduct credits [/blog/higgsfield-all-unlimited-explained].
- Launched: first version Dec 18, 2025, as stated in [/blog/how-we-built-cinema-studio] (blog post date Aug 12, 2026); 4.0 on Aug 12, 2026 (blog post date) [/blog/cinema-studio-4-0]. Release dates per version are in "Cinema Studio version history".
- Sources: [/creator-hub/help-center/tools/how-do-i-use-cinema-studio] [/blog/cinema-studio-4-0] [/blog/how-we-built-cinema-studio] [/blog/ai-video-camera-control] [/generate] [/generate?mode=video] [/blog/best-veo-alternatives-character-consistency] [/blog/how-to-generate-ai-video-all-in-one-platforms] [/blog/photo-to-ai-video] [/blog/ai-video-credits-explained] [/blog/higgsfield-all-unlimited-explained] [/creator-hub/help-center/tools/which-higgsfield-tool-should-i-use]

### Cinema Studio 4.0 Director's Panel
- What it does: one control surface that fixes the look of a film (genre, decade, cut speed, camera body, glass, depth of field, grade, light, performance) as generation parameters instead of prompt text [/blog/cinema-studio-4-0] [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
- How to use: 1. Pick a genre 2. Pick camera, lens, aperture and palette 3. Set tempo 4. Tag emotions with @character_name Joy (or another emotion) 5. Prompt only the scene, then Generate [/blog/cinema-studio-4-0].
- Inputs and settings:
  - Film Setup: Genre (General, Action, Epic, Drama, Comedy, Horror, Noir); Era (Auto, 60s, 80s, 90s, 2000s, 2020s; the help center says "from the 60s to the 2020s"); Tempo (Auto, Chaotic, Dynamic, Calm, Single Shot) [/blog/ai-video-camera-control].
  - Camera: Auto, Modern, 35mm Film, 8mm Film, DV Camcorder. Lens: Auto, Clean Sharp, Anamorphic, Vintage Anamorphic, Warm Vintage, Halation Vintage. Aperture: Auto, f/1.4 Wide Open, f/4 Moderate, f/11 Deep Focus [/blog/ai-video-camera-control].
  - Camera movement: 30+ presets, including POV, Robot Arm, Pan Left, Helicopter Shot, tracking and pedestal down [/blog/cinema-studio-4-0], each with a visual preview [/blog/why-ai-video-credits-run-out].
  - Colour Palette: 50+ templates (Film Colors, Black Gloss, Candy Pink, Lime Jam, Nostalgic Blue, and more), or a custom palette [/blog/ai-wedding-invitation-photo-video].
  - Lighting: Auto plus 6 presets (Silhouette, Practicals, Window, Overhead Fall, Contre-jour, Soft Cross), or a manual build with color, brightness, diffuse and angle.
  - Emotion Wheel: Hope, Anger, Joy, Trust, Fear, Surprise, Sadness, Disgust, applied by @-tagging a character. The help center calls it a "character emotion slider" for intensity [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
- Limits: counts differ between pages. Palettes are "50+" in the body text, "45+ templates in total" in the list and "30+ color templates" in the post description. Lenses are "five lenses" in one place and "six lens options" (with Auto) in another [/blog/cinema-studio-4-0].
- Models: Seedance 2.5, the same as Cinema Studio 4.0 [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
- Credits and cost: no separate price; see Cinema Studio.
- Launched: Aug 12, 2026 (blog post date) [/blog/cinema-studio-4-0].
- Sources: [/blog/cinema-studio-4-0] [/blog/ai-video-camera-control] [/creator-hub/help-center/tools/how-do-i-use-cinema-studio] [/blog/why-ai-video-credits-run-out] [/blog/ai-wedding-invitation-photo-video] [/blog/how-studios-scale-ai-video-production]

### Cinema Studio projects, Elements and AI Director
- What it does: the production layer around generation. Projects hold one look and brief across every shot. Elements store reusable characters, locations and props. The AI Director chat drafts shots, and teams generate in the same project [/creator-hub/help-center/tools/how-do-i-use-cinema-studio] [/blog/how-we-built-cinema-studio].
- How to use: 1. New project 2. Fill in the Project Brief 3. Create Elements, or click Save to Elements on a generation 4. Reference them with @ 5. Paste the script into the AI Director chat, which splits it into shots with camera parameters filled in 6. Review the prompts it puts in the prompt box 7. Generate [/blog/make-ai-video-from-script] [/blog/keep-ai-character-consistent].
- Inputs and settings:
  - Projects work like an equipment package chosen once: light, optics and tempo hold across every generation in the project [/blog/how-we-built-cinema-studio]. The AI Director reads the Project Brief [/blog/keep-ai-character-consistent]. Projects can be published to Community as Open Projects, with prompts shown or hidden [/creator-hub/help-center/community/how-do-projects-work].
  - Elements: Characters, Locations and Props. They are scoped to a project but can be pulled into other projects. Soul ID characters show up in Elements automatically; add one through "@ Elements" under the prompt field, or by typing @ [/blog/keep-ai-character-consistent].
  - AI Director (Claude Chat, from 3.5): changes Genre, Style and Camera from the conversation, sees the project's @tags, and breaks a script into shots [/blog/cinema-studio-3.5-full-tutorial].
  - Collaboration: team members generate at the same time in shared projects (3.5). In 4.0 this is "Live Multi-User Generation", and Elements are shared instantly [/blog/how-studios-scale-ai-video-production].
- Limits: Claude never starts a generation, so you always click Generate yourself. Known issue: AI Director missing, or the "Pin" action firing on its own; fix with a refresh, then log out and back in [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
- Models: the AI Director is "Claude Chat" (Claude version not stated) [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
- Credits and cost: not stated for the AI Director or Elements.
- Launched: Elements arrived in 2.0/2.5. The AI Director, the Elements system and shared projects came with 3.5. The AI Director later "outgrew" Cinema Studio and became Supercomputer [/blog/how-we-built-cinema-studio] [/blog/how-we-built-supercomputer].
- Sources: [/creator-hub/help-center/tools/how-do-i-use-cinema-studio] [/blog/how-we-built-cinema-studio] [/blog/cinema-studio-3.5-full-tutorial] [/blog/keep-ai-character-consistent] [/blog/make-ai-video-from-script] [/blog/how-studios-scale-ai-video-production] [/blog/how-we-built-supercomputer] [/creator-hub/case-studies/sinecera-hybrid-production-higgsfield]

### Cinematic Cameras (Cinema Studio image mode)
- What it does: image generation with camera controls. It sits in the Image menu with a "Top" badge (nav menu) and opens the Cinema Studio 4.0 page in image mode with imageModel=cinematic-v1 [/generate?mode=image&imageModel=cinematic-v1]. Sinecera credits "Cinematic Cameras" for "real camera language" [/creator-hub/case-studies/sinecera-hybrid-production-higgsfield].
- How to use (inferred from the 2.0 "Hero Frame" workflow): 1. Choose a camera sensor 2. Mount a lens 3. Set focal length and aperture 4. Write a prompt 5. Generate a batch 6. Use the chosen still as the video's start frame [/blog/cinema-studio-guide].
- Inputs and settings (earlier versions; inferred to carry over):
  - Camera sensor, lens character (e.g. Cooke), focal length 8 to 50 mm, aperture, plus recommended and saved camera presets [/blog/cinema-studio-guide].
  - Create 3D scene (move the image on three axes to pick a keyframe) and 2x2, 3x3 or 4x4 grids for storyboards [/blog/cinema-studio-guide].
  - Colorgrade on the keyframe (2.5) [/blog/cinema-studio-2-5-ai-video-generator].
  - "Tracing" saves a frame's settings and metadata, so the look carries over when it becomes a video start frame [/blog/how-we-built-cinema-studio].
- Limits: the 3.5 tutorial says Elements "replaces image mode entirely" [/blog/cinema-studio-3.5-full-tutorial], yet the current nav still lists Cinematic Cameras as an Image tool. The page capture shows no controls because it sits behind a login.
- Models: "cinematic-v1" (route parameter only); not otherwise stated.
- Credits and cost: not stated.
- Launched: the camera, lens and focal-length frame builder was Cinema Studio's first version, Dec 18, 2025 [/blog/how-we-built-cinema-studio]; the date of the current route is not stated.
- Sources: [/generate?mode=image&imageModel=cinematic-v1] [/blog/cinema-studio-guide] [/blog/how-we-built-cinema-studio] [/blog/cinema-studio-2-5-ai-video-generator] [/blog/cinema-studio-3.5-full-tutorial] [/creator-hub/case-studies/sinecera-hybrid-production-higgsfield]

### Cinema Studio version history
- What it does: five versions shipped in the first six months. The team kept old versions selectable because users asked to keep generating on 2.5 [/blog/how-we-built-cinema-studio].
- How to use: use the version selector at the top of Cinema Studio (2.0 to 4.0) [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
- Inputs and settings by version:
  - Origin (Nov 2025): a 21:9 kangaroo fight clip with real camera names in the prompt passed 1M views in days [/blog/how-we-built-cinema-studio].
  - 1.0 (Dec 18, 2025): three controls (camera, lens, focal length), lenses hand-tuned to exaggerate their character, tracing, then camera movement and slow motion [/blog/how-we-built-cinema-studio].
  - 1.5 (date not stated): aperture added as a fourth control, plus recommended camera presets [/blog/how-we-built-cinema-studio].
  - 2.0 (Feb 17, 2026): "Hero Frame First"; 3D Scene; grids; genres Action, Horror, Comedy, Western, Suspense, Intimate, Spectacle (Musical) and Auto; multi-shot with up to 6 shots, 1 to 12 s per shot and 12 s total, at 1080p, in auto or manual mode; speed ramp; up to 3 characters with emotions; start and end frames (end frame not available with characters in multi-shot) [/blog/cinema-studio-guide].
  - 2.5 (Mar 18, 2026): Soul Cast with up to 3 actors; Colorgrade (temperature, contrast, saturation, sharpness, film grain, highlights, exposure); no video uploads [/blog/cinema-studio-2-5-ai-video-generator].
  - 3.0 (Mar 30, 2026): physics-aware motion; a "reasoning engine" that takes up to 9 references and needs no start or end frames; native audio (sound effects, speech, music); 7 genres; 8 speed ramps (Linear, Auto, Flash In, Flash Out, Slow-mo, Bullet Time, Impact, Ramp Up); continue an uploaded @video and change the location of existing footage [/blog/cinema-studio-3] [/blog/cinema-studio-3.0].
  - 3.5 (ten days after 3.0): video-first. Per shot: Camera (Raw 16mm, Fine Film, Clean Digital), Lens (Clinical Sharp, Extreme Macro, Anamorphic, Warm Halation, Vintage Haze), Focal length (8, 14, 35, 50, 75 mm) and Aperture. Per project: Genre, 8 palettes, 10 Camera MoveSet styles named after cinematographers, 6 lighting presets. Also the Elements system, the Claude AI Director and shared projects; clips up to 15 s, 9 references [/blog/cinema-studio-3.5-full-tutorial] [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
  - 4.0 (Aug 12, 2026): Seedance 2.5; 30 s clips; 50 references; Tempo; 30+ moves; 4 camera types; lenses "optically modeled at generation time" where 3.5 applied them "as filters"; Extend; Edit Video; 50+ palettes; Emotion Wheel; Era. The FAQ adds AI Cast, Cinematic Locations and an "anti-slop camera pipeline" [/blog/cinema-studio-4-0] [/blog/how-we-built-cinema-studio].
- Limits: the team calls 3.0 "the most turbulent release" in the product's history [/blog/how-we-built-cinema-studio]. Counts for 3.5 movement presets differ: 9 in [/blog/cinema-studio-4-0], 10 in the help center.
- Models: 3.0 shipped on a new state-of-the-art video model that came out in April (not named in the post). 4.0 runs on Seedance 2.5 [/blog/how-we-built-cinema-studio] [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
- Credits and cost: see Cinema Studio.
- Launched: dates above are blog post dates, except 1.0 (stated in the Aug 12, 2026 post). Conflict: the 3.0 launch post is dated Mar 30, 2026, while the build story places the 3.0 release in April [/blog/cinema-studio-3] [/blog/how-we-built-cinema-studio]. The 3.5 launch date is not stated; its tutorial is dated Jul 15, 2026.
- Sources: [/blog/how-we-built-cinema-studio] [/blog/cinema-studio-guide] [/blog/cinema-studio-2-5-ai-video-generator] [/blog/cinema-studio-3] [/blog/cinema-studio-3.0] [/blog/cinema-studio-3.5-full-tutorial] [/blog/cinema-studio-4-0] [/creator-hub/help-center/tools/how-do-i-use-cinema-studio]

### Higgsfield DoP
- What it does: Higgsfield's own proprietary image-to-video model ("Director of Photography"). One keyframe plus a preset that defines the camera move or VFX produces a directed shot [/creator-hub/help-center/ai-models/how-do-i-use-dop].
- How to use: 1. Video, Create Video; choose a DoP preset (the model appears as "Higgsfield Standard" in the selector) 2. Add a keyframe: upload a PNG or JPG, paste it, or use "generate it" 3. Pick a preset 4. Describe the scene; the Enhance toggle expands the prompt 5. Open Advanced if needed 6. Generate [/creator-hub/help-center/ai-models/how-do-i-use-dop].
- Inputs and settings: one keyframe image (required). Preset categories: Effects, Basic Camera Control, Epic Camera Control, Catch the Pulse, and New and Trending feeds; "Top Choice" picks; "Mix" combines presets. Duration 3 or 5 s; seed; steps [/creator-hub/help-center/ai-models/how-do-i-use-dop].
- Limits: no text-only generation. The preset catalog is available through MCP. DoP is also in the Higgsfield API [/creator-hub/help-center/integrations/what-is-the-higgsfield-api].
- Models: Higgsfield DoP (in-house), with keyframes suggested from Soul or Nano Banana Pro [/creator-hub/help-center/ai-models/how-do-i-use-dop]. The model guide describes it as Higgsfield's "native cinematography layer" [/creator-hub/help-center/ai-models/which-ai-model-should-i-use].
- Credits and cost: standard rates, shown on the Generate button. API price: $0.125 per generation, the only model priced per generation rather than per second [/blog/higgsfield-api] [/blog/generate-ai-videos-higgsfield-api] [/creator-hub/help-center/integrations/what-is-the-higgsfield-api].
- Launched: not stated (help article dated Aug 2, 2026).
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-dop] [/creator-hub/help-center/ai-models/which-ai-model-should-i-use] [/creator-hub/help-center/integrations/what-is-the-higgsfield-api] [/blog/higgsfield-api] [/blog/generate-ai-videos-higgsfield-api]

### Canvas
- What it does: a node-based infinite board where a prompt feeds an image, the image feeds a video and the video feeds an edit. You can run models in parallel, compare outputs, save pipelines as templates and work with a team in real time. The home page pitches moodboarding, chained workflows and team sharing on "one canvas" [/creator-hub/help-center/tools/how-do-i-use-canvas] [/].
- How to use: 1. Canvas, New canvas 2. Add a Text Prompt node 3. Connect it to a generation node and pick the model 4. Drag outputs into the next node 5. Add reference nodes (images, audio, or Assets) 6. Generate per node or in sequence 7. Save as a template [/creator-hub/help-center/tools/how-do-i-use-canvas].
- Inputs and settings:
  - Every Higgsfield model is available as a node, e.g. Kling 3.0, Seedance 2.0, Veo 3.1, WAN 2.7, Soul 2.0, GPT Image 2.0, Nano Banana Pro, Seedream 5.0 Lite [/blog/ai-batch-generation-tools-2026].
  - Seedance nodes read connected images, but the reference's role must be stated at the start of the prompt.
  - Kling nodes treat a connected image as a start frame; character references need an @element-name tag.
  - Audio nodes supply voice references, voiceover or audio sync.
  - The page offers All Canvases, Templates and Quick Start [/canvas]. Invite collaborators through Share; Canvas autosaves.
  - A Canvas agent builds workflows from plain language [/blog/how-we-built-supercomputer]. FigJam gets Canvas Nodes through the Figma plugin.
- Limits: Unlimited never applies, so every Canvas generation deducts credits [/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them]. It can load slowly on low-end hardware; a hard refresh restores the last autosave [/creator-hub/help-center/troubleshooting/higgsfield-site-wont-load].
- Models: all platform models, as above.
- Credits and cost: building and connecting nodes is free; credits are charged only when a node generates [/creator-hub/help-center/tools/how-do-i-use-canvas].
- Launched: not stated. The home page labels it "New feature" [/]; help article dated Aug 1, 2026. Case studies: Big Purple delivered a brand film in 10 to 12 days against a roughly two-month estimate (about 80% faster) [/creator-hub/case-studies/big-purple-turkiye-wealth-fund-anniversary-film-higgsfield]; Fantasmagorie used Canvas as its working environment [/creator-hub/case-studies/fantasmagorie-adopt-dont-touch-my-mini-higgsfield].
- Sources: [/creator-hub/help-center/tools/how-do-i-use-canvas] [/canvas] [/] [/blog/ai-batch-generation-tools-2026] [/blog/how-we-built-supercomputer] [/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them] [/creator-hub/help-center/troubleshooting/higgsfield-site-wont-load] [/creator-hub/case-studies/big-purple-turkiye-wealth-fund-anniversary-film-higgsfield] [/creator-hub/case-studies/fantasmagorie-adopt-dont-touch-my-mini-higgsfield]

### Faceless Studio
- What it does: a guided workspace for animated faceless YouTube episodes. Pick a script, a style and a narrator, and get back one file with an AI script, narration, 2D/3D animation, music and subtitles. Channels save their style, voice and characters, so new episodes match the old ones [/blog/faceless-youtube-videos-faceless-studio].
- How to use: 1. Describe the channel in one line; it names the channel and suggests 4 episode topics (Generate new refreshes them) 2. Set format, length and animation mode 3. Pick 1 of 12 styles 4. Pick a narrator from the voice library (with previews) 5. Generate. Later episodes start from Create new episode on the channel page [/blog/faceless-youtube-videos-faceless-studio].
- Inputs and settings:
  - Categories: Education, History, Kids, Storytelling. Optional Reference (a YouTube link) and Upload script [/faceless-studio].
  - 16:9 or 9:16; 1 to 5 minutes per episode; Fully animated or Frame by Frame.
  - 12 styles: Editorial Motion Graphics, Stickman Cartoon, Fairy Tale & Myth, Paper Diorama, Hand Drawn, Mannequin, Poster Vector, Colorful 3D, Watercolor Chronicle, Paper Collage, Studio 3D, Pastel Flat 2D.
  - A "Hot Right Now" feed of trending formats; a My Channels tab [/blog/faceless-youtube-videos-faceless-studio].
- Limits: 5 minutes per episode and no cap on episodes per channel. Generation takes up to about 30 minutes. Longer videos go through the Supercomputer/MCP skill: up to 10 minutes per [/blog/faceless-youtube-videos-faceless-studio] [/blog/faceless-videos-ugc-ads-2026], up to 15 minutes per [/creator-hub/help-center/tools/how-do-i-use-supercomputer]. The page also offers "Or create with Higgsfield MCP" [/faceless-studio].
- Models: not stated.
- Credits and cost: 246 credits per minute ($12.30 at 20 credits per $1); a 5-minute episode costs 1,230 credits ($61.50). Every voice costs the same [/blog/faceless-youtube-videos-faceless-studio].
- Launched: Aug 21, 2026 (blog post date). The changelog has the title "Faceless Studio. Out now" with no date. It began as a Supercomputer skill [/blog/faceless-youtube-videos-faceless-studio] [/creator-hub/changelog].
- Sources: [/faceless-studio] [/blog/faceless-youtube-videos-faceless-studio] [/blog/ai-video-generators-faceless-youtube-2026] [/blog/faceless-videos-ugc-ads-2026] [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/creator-hub/changelog]

### Shorts Studio
- What it does: turns footage you upload into styled short-form clips, with preset graphics, text and visual treatment applied automatically. It does not generate from text [/blog/how-to-make-youtube-shorts-with-ai].
- How to use: 1. Trim the clip 2. Open /shorts-studio 3. Pick a preset, or "Create a preset from references" 4. Choose the output ratio 5. Generate (it runs in the background, and more clips can be queued) 6. Review and export an MP4 [/blog/how-to-make-youtube-shorts-with-ai] [/shorts-studio].
- Inputs and settings: one uploaded video up to 2 min; language auto-detected; output Vertical or Horizontal; 40+ presets (e.g. Bold Urban, Green Contrast, Urban Serenity, Warm Glow) plus custom presets built from references; History tab [/shorts-studio] [/blog/how-to-make-youtube-shorts-with-ai].
- Limits: output 720p; uploaded footage only. Unlimited does not apply [/blog/new-unlimited-more-models]. From Claude over MCP, a one-line request to cut the video into shorts with Shorts Studio returned about 20 shorts [/blog/faceless-channel-one-prompt].
- Models: not stated.
- Credits and cost: about $4 per 25 s clip at 720p; "Basic from $9/mo" (July 2026) [/blog/how-to-make-youtube-shorts-with-ai]. The page links "How calculations work?" [/shorts-studio].
- Launched: not stated; guide dated Jul 2, 2026 (blog post date).
- Sources: [/shorts-studio] [/blog/how-to-make-youtube-shorts-with-ai] [/blog/ai-content-for-tiktok-2026] [/blog/ai-tiktok-pipeline-2026] [/blog/new-unlimited-more-models] [/blog/faceless-channel-one-prompt]

### Higgsfield Explainer
- What it does: turns a topic, file or URL into a complete structured video (script, scenes and synced narration in one pass), from 20 s to 10 min, in one visual style throughout [/blog/ai-video-from-text-and-url].
- How to use: 1. Pick a preset 2. Answer "What should the video explain?" with a typed topic, Attach files, or a link 3. Set aspect ratio, duration and voice 4. Generate [/blog/ai-video-from-text-and-url].
- Inputs and settings:
  - 10+ presets: Pixel Art, Claymotion, Mixed Media, 3D Papercraft, 2D Illustrator, Whiteboard Doodle, and more.
  - Duration: 20 s, 30 s, 1, 3, 5 or 10 min, or Manual. Aspect ratio 16:9 by default, with vertical and square options.
  - 40+ voice presets, or a custom voice [/blog/ai-video-from-text-and-url].
- Limits: 10 minutes maximum. Reachable from Claude over MCP [/blog/full-ad-campaign-inside-claude]. A "higgsfield-explainer" Claude skill builds 10-minute explainers from one prompt [/blog/faceless-channel-one-prompt]. The tool page capture is empty (behind login) [/explainer].
- Models: not stated.
- Credits and cost: about 72 credits (~$3.60) for 20 s; cost scales with duration, and 3 min and up "typically exceed $20" [/blog/ai-video-from-text-and-url].
- Launched: Jul 14, 2026 (blog post date).
- Sources: [/explainer] [/blog/ai-video-from-text-and-url] [/blog/faceless-channel-one-prompt] [/blog/full-ad-campaign-inside-claude]

### 3D Jutsu
- What it does: an AI-native 3D workspace in the browser for scene blocking and previz. An agent on Supercomputer builds an editable 3D scene (objects, layout, light, cameras, animation) from a prompt or reference, and the shot then renders to video [/blog/higgsfield-3d-jutsu].
- How to use: 1. Build the set: describe it, and props, layout and light arrive as grabbable objects 2. Stage it: add people and cameras and move them by hand 3. Export: Seedance 2.5 renders the 3D take as the finished shot [/3d-jutsu]. In the blog's example, the previz render plus a Soul 2.0 character and a Soul Cinema location are combined in the same chat [/blog/higgsfield-3d-jutsu].
- Inputs and settings:
  - Agent model (Auto is the free default); duration 1 to 60 s of scene time (15 s default); aspect ratios 16:9, 9:16, 1:1, 4:3, 3:4, 21:9 [/blog/higgsfield-3d-jutsu] [/3d-jutsu].
  - Editor: primitives, sun, point and spot lights, and cameras; a curated GLB library and Mixamo characters; timeline with playhead; camera presets and trajectories; revision history with restore.
  - Agent modes: "generate without asking", "ask before generating", and an ask-only mode.
  - Export: MP4, a still frame, or GLB. Sharing roles: admin, collaborator, viewer, or anyone with the link. Scenes are saved in My Scenes.
- Limits: none stated beyond the above. It appears in the site nav captured on the Claude MCP page [/mcp?tab=claude]; whether it runs over MCP is not stated.
- Models: Seedance 2.5 renders the output [/3d-jutsu]. Agent LLMs: Auto, GPT 6 Astra, Claude Fable 5.1, Claude Opus 5, GPT 5.6 Sol, GLM-5.3 Flash [/blog/higgsfield-3d-jutsu].
- Credits and cost: agent on Auto is "Free" [/3d-jutsu]; render cost not stated.
- Launched: Sep 5, 2026 (blog post date). The changelog title "Introducing 3D Jutsu" has no date in the capture [/creator-hub/changelog].
- Sources: [/3d-jutsu] [/blog/higgsfield-3d-jutsu] [/blog/best-ai-tools-motion-designers] [/creator-hub/changelog]

### Mixed Media
- What it does: a template library of AI video effects applied to an uploaded clip; the page title says "40+ AI Video Effects Library" [/mixed-media].
- How to use: 1. Select a template (Browse Templates) 2. Upload the video to edit 3. Generate [/mixed-media].
- Inputs and settings: uploaded video 1 to 10 s ("Duration required"); 8 FPS; 1K resolution; All Presets; Community feed [/mixed-media].
- Limits: clips must be 1 to 10 s. Not the same thing as the "Mixed Media" style in Explainer [/blog/ai-video-from-text-and-url] or the Mixed Media motion category in Marketing Studio [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads].
- Models: not stated.
- Credits and cost: not stated.
- Launched: not stated; a Feb 24, 2026 post already points to "our Mixed Media tool" [/blog/create-custom-ai-moodboard-soul-2].
- Sources: [/mixed-media] [/] [/blog/create-custom-ai-moodboard-soul-2] [/blog/ai-video-from-text-and-url] [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads]

### Higgsfield Genjutsu
- What it does: rebuilds part of an existing real or generated video and keeps the rest as filmed. Motion transfer applies a clip's movement, timing and camera to a new character or scene. Object swap (shown as "Objects swap" in some UI) replaces one element: a product, outfit, prop or face [/blog/higgsfield-genjutsu] [/blog/new-ai-influencer].
- How to use: 1. Video, Higgsfield Genjutsu; choose Motion transfer or Object swap 2. Upload one source video 3. Add reference images 4. Pick a preset or write a short description 5. Generate and compare with the source [/blog/higgsfield-genjutsu].
- Inputs and settings: one clip of 4 to 30 s; up to 30 reference images; prompt optional; 30+ presets; output 480p, 720p or 1080p; a Style field (Restyle, below) [/blog/higgsfield-genjutsu] [/blog/keep-ai-character-consistent] [/blog/new-ai-influencer].
- Limits:
  - One output per generation and no batch button; scale runs through Supercomputer or Canvas [/blog/100-plus-ad-variations-ai] [/blog/best-ai-ad-generators].
  - Use footage you own or have rights to [/blog/two-characters-one-scene-ai-video].
  - Where it runs: web [/ai/video?model=genjutsu]; MCP [/blog/higgsfield-katana]; the API, which the home page pitches as motion transfer and object swap "with one API call" [/] [/blog/ai-video-api-pricing-vs-subscriptions]; ChatGPT via /genjutsu, OpenAI Dots, and the mobile sidebar and Agent tab [/creator-hub/changelog]; AI Influencer's Motion tab ("Use in Genjutsu") [/blog/new-ai-influencer].
- Models: "Higgsfield Genjutsu", labeled "New model" on the home page [/]. Another page refers to "the Genjutsu models" (one for swap, one for motion) [/blog/claude-ad-production-end-to-end].
- Credits and cost:
  - Motion transfer and Object swap cost the same: 15 s at 480p 40 credits ($2.00), 720p 104 ($5.20), 1080p 144 ($7.20) [/blog/higgsfield-genjutsu] [/blog/best-ai-ad-generators].
  - One Object swap pass in a sample workflow cost 99 credits ($4.95) [/blog/generate-voice-edit-ai-video-one-place].
  - Plan cards: Starter "No free gens"; Plus and Ultra "720p 3 free gens" [/apps/character-swap].
- Launched: Aug 31, 2026 (blog post date). The changelog title "Introducing Genjutsu" has no date in the capture [/creator-hub/changelog].
- Sources: [/blog/higgsfield-genjutsu] [/ai/video?model=genjutsu] [/] [/blog/edit-ai-video-without-regenerating] [/blog/keep-ai-character-consistent] [/blog/new-ai-influencer] [/blog/best-ai-ad-generators] [/blog/100-plus-ad-variations-ai] [/blog/generate-voice-edit-ai-video-one-place] [/blog/claude-ad-production-end-to-end] [/apps/character-swap] [/creator-hub/changelog]

### Genjutsu Restyle
- What it does: redraws a whole video in a new visual style and keeps the original motion, timing and camera work [/creator-hub/changelog].
- How to use: 1. Video, Higgsfield Genjutsu, Styles 2. Upload the reference video 3. Pick a style, or build one from reference images 4. Generate [/creator-hub/changelog].
- Inputs and settings: works inside Motion transfer mode; reference video 4 to 30 s; 20+ animation styles or custom ones; up to 30 images of characters, products or clothing; 480p, 720p or 1080p [/creator-hub/changelog] [/blog/keep-ai-character-consistent].
- Limits: available on the web and via MCP [/creator-hub/changelog].
- Models: Higgsfield Genjutsu.
- Credits and cost: not stated separately (Genjutsu rates apply, inferred).
- Launched: Sep 30, 2026 (changelog). A page dated Jun 29, 2026 already describes it, so that page was likely updated after publication [/blog/keep-ai-character-consistent].
- Sources: [/creator-hub/changelog] [/blog/keep-ai-character-consistent]

### Katana
- What it does: a Higgsfield skill for Claude that recreates a reference edit (shot order, cut lengths, cuts on the music, typography) with your own characters, products or clothing, through Higgsfield MCP. Results land in the chat and in Assets. The page tagline credits Higgsfield and Claude Opus 5.5 ("aura-farming machine") [/blog/higgsfield-katana] [/katana].
- How to use: from the page: 1. Add a reference video 2. Add your characters (photos and other details) 3. Optional Instructions toggle 4. Send & Generate in Claude. Or ask Claude directly with /katana (opens the catalog), /katana/<preset-name>, or a plain request. Refine with follow-up messages; only the affected shots regenerate [/blog/higgsfield-katana] [/creator-hub/changelog].
- Inputs and settings:
  - Reference: your own video or a library preset.
  - Up to 5 photos per edit. The changelog's first line says "from one reference photo" and its references line says up to 5 images [/creator-hub/changelog].
  - Preset categories: Personalized edits, Style transfer, Motion transfer; sources Higgsfield and Community [/katana]. The changelog instead describes the styles as Aura Farming, Motion and Clipping.
  - Community presets: a 3 to 30 s motion video, up to 40 images, and a prompt that mentions them with @. They go live immediately and can be taken down after reports.
- Limits:
  - Needs an active Higgsfield subscription and the MCP connector (https://mcp.higgsfield.ai/mcp); no API key.
  - Images attached in the Claude chat are not passed through, so Katana opens a Higgsfield upload window; direct media links work, Instagram or TikTok profile links do not.
  - Moderation may decline a generation. Use references you own or have permission to use [/blog/higgsfield-katana].
- Models: "Higgsfield models" through MCP (not named); Claude handles the chat side; "Powered by Claude" [/katana].
- Credits and cost: plan credits, with no separate MCP billing or markup. Claude shows the exact cost on a card before each generation, and corrections that need new generations cost extra. Output is an MP4 with the reference's duration, aspect ratio and frame rate [/blog/higgsfield-katana].
- Launched: Oct 8, 2026 (changelog); blog post Oct 12, 2026.
- Sources: [/katana] [/blog/higgsfield-katana] [/creator-hub/changelog] [/]

### Draw to video
- What it does: change or create video by sketching on a frame instead of rewriting the prompt. Higgsfield uses the name for different things on different surfaces [/blog/seedance-2-5-on-higgsfield-2026] [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model].
- How to use: Seedance 2.5 Edit, "Draw to Edit": 1. Mark the region on the frame 2. Describe what happens inside it 3. Generate [/blog/edit-ai-video-without-regenerating]. On Veo 3.1: sketch the concept and Veo turns it into footage [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model].
- Inputs and settings:
  - Veo 3.1 "Draw-to-Video": a sketch becomes "cinematic 1080p footage" [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model].
  - Seedance 2.5 on Higgsfield, "Draw to Video": mark up a frame by hand to remove, move or add [/blog/seedance-2-5-on-higgsfield-2026].
  - Seedance 2.5 Edit, "Draw to Edit": video up to 30 s, up to 50 references, output up to 1080p [/blog/edit-ai-video-without-regenerating] [/blog/100-plus-ad-variations-ai].
  - Plugins: the DaVinci Resolve panel lists "Draw to Video" (sketch on a frame to generate a video change); the Premiere Pro and After Effects panels list "Draw to Edit" [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/plugins/after-effects].
- Limits: not stated.
- Models: Veo 3.1; Seedance 2.5 / Seedance 2.5 Edit.
- Credits and cost: not stated.
- Launched: Veo 3.1 Draw-to-Video, Oct 14, 2025 (blog post date); Seedance 2.5 on Higgsfield, Aug 6, 2026 (blog post date).
- Sources: [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model] [/blog/seedance-2-5-on-higgsfield-2026] [/blog/edit-ai-video-without-regenerating] [/blog/100-plus-ad-variations-ai] [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/plugins/after-effects] [/blog/higgsfield-davinci-resolve]

## Video creation and editing tools

### Create video
- What it does: the main video composer at /ai/video ("Generate AI videos" in the Video nav). You pick a model in the model selector, write a prompt, attach references or frames, set duration, ratio and resolution, then generate.
- How to use: 1. Top nav → Video → Create Video 2. Pick a model or feature 3. Write a prompt and upload a reference if the model supports it 4. Set duration, aspect ratio and resolution 5. Click Generate. The result lands in Assets [/creator-hub/help-center/getting-started/how-do-i-create-my-first-generation].
- Inputs and settings (vary by model):
  - Modes seen: text-to-video, image-to-video, start frame, end frame or both, multi-reference (@character, @style, @motion, @audio tags), video-to-video, video extension [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation] [/creator-hub/changelog].
  - Seedance generation bar: clip duration, aspect ratio (including Auto, which reads the ratio from the input), resolution up to 4K, bitrate, sound toggle [/creator-hub/help-center/ai-models/how-do-i-use-seedance].
  - Kling extras: multi-shot toggle (Auto or Custom), Elements via @, audio on/off, genre and speed-ramp pickers [/creator-hub/help-center/ai-models/how-do-i-use-kling].
  - Aspect ratios offered across tools: 9:16, 16:9, 1:1, 4:3, 3:4, 21:9; not every model supports every ratio; some support Auto [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
  - Elements: saved characters, products or locations pulled into any generation with @ [/creator-hub/help-center/ai-models/how-do-i-use-seedance].
  - Unlimited toggle in the model menu when the model is covered. Off means Credit Mode, which uses the priority queue [/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them].
- Limits: parallel jobs depend on plan. Starter allows up to 2 videos and 4 images at once. Plus and Ultra list "Unlimited paid parallel generations". Team allows 16 video and 16 image (pricing block captured on [/apps/character-swap] and [/ai-motion-designer]). Unlimited mode runs 1 job at a time in the shared standard queue [/blog/seedance-unlimited]. Contact support if a job is stuck for more than 10 hours [/creator-hub/help-center/ai-models/how-do-i-use-kling]. Median total time for an 8 s 720p clip is about 1.5 min on Kling and 3.5 to 4 min on Seedance [/blog/how-long-ai-video-generation-takes]. The mobile Agent tab includes Create Video [/creator-hub/changelog].
- Models (Video nav): Seedance 2.5, Higgsfield Genjutsu, Gemini Omni Flash 1.1, FLUX.3 Video, Kling 3.0, Kling Motion Control, MiniMax H3, Wan 3.0, Grok Imagine 1.5 Lite, Grok Imagine 1.5, Kling 3.0 Omni Edit, Google Veo 3.1 (nav-menus.json). Higgsfield DoP shows up as "Higgsfield Standard" in the selector [/creator-hub/help-center/ai-models/how-do-i-use-dop]. Older versions such as Seedance 1.5 Pro sit under All models. Inside each family Higgsfield defaults to the newest version [/creator-hub/help-center/ai-models/which-ai-model-should-i-use]. Seedream 5.0 Pro's Turn to Video sends a still to Seedance 2.0, Kling 3.0, Veo 3.1, WAN 2.7, MiniMax Hailuo 2.3 and others [/blog/photo-to-ai-video].
- Credits and cost: the Generate button shows the exact cost, which depends on model, resolution and duration [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/why-ai-video-credits-run-out]. Per-model numbers are in the model entries below.
- Launched: not stated.
- Sources: [/ai/video] [/creator-hub/help-center/getting-started/how-do-i-create-my-first-generation] [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/creator-hub/help-center/ai-models/how-do-i-use-dop] [/blog/how-long-ai-video-generation-takes] [/blog/photo-to-ai-video]

### Edit video
- What it does: an editing workspace at /ai/video/edit ("Edit scenes, shots, elements" in the nav). It changes existing footage from a prompt instead of regenerating it. The Upscale tool and the Kling 3.0 Omni Edit model both live under this route.
- How to use: not described step by step for the web route. In the editor plugins, you select the active clip and describe the change [/creator-hub/help-center/integrations/external-integrations-higgsfield].
- Inputs and settings: query parameters seen are `tool=upscale`, `toolModel=flux-video-upscale` and `model=kling-video-reference-o3` (nav-menus.json). Related editing methods: prompt edits, Draw to Edit or Draw to Video (sketch or mark a frame region), region edits [/blog/edit-ai-video-without-regenerating] [/creator-hub/help-center/integrations/external-integrations-higgsfield].
- Limits: Edit Video, Draw to Edit, Reframe and Upscale are also in the Premiere Pro, After Effects and DaVinci Resolve plugins. Those plugins always use credits, even for models that are Unlimited on the web, per [/creator-hub/help-center/integrations/external-integrations-higgsfield] and [/blog/higgsfield-davinci-resolve]. [/blog/higgsfield-after-effects] says the opposite: Unlimited models generate free in the AE plugin.
- Models: Kling 3.0 Omni Edit (stated by route). Seedance 2.5 Edit, Kling O1 Video Edit and Genjutsu are the other editing models the pages name (inferred to sit in this workspace). Cinema Studio has its own Edit Video mode on Seedance 2.5 [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
- Credits and cost: not stated for the route itself. Per model: Seedance 2.5 Edit costs 66 credits for 10 s at 720p [/blog/100-plus-ad-variations-ai].
- Launched: not stated.
- Sources: [/ai/video/edit] [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/blog/higgsfield-after-effects] [/blog/higgsfield-davinci-resolve] [/blog/edit-ai-video-without-regenerating]

### Video upscale
- What it does: raises the resolution and quality of a video, or an image in the same tool. Routes: /ai/video/edit?tool=upscale ("Video Upscale Enhance video quality") and /upscale (images or videos).
- How to use: 1. Explore → Video → Upscale, or open any video in Assets → Upscale 2. Choose a model 3. Set the Scale factor plus Advanced settings 4. Click Upscale (the cost is shown on the button) [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do].
- Inputs and settings:
  - ByteDance Upscale: model version Standard or Pro, up to 8K, 30 or 60 fps, presets such as Common.
  - Topaz Video: scale factor, enhancement toggle, presets such as Starlight Precise, Auto or Manual parameters, frame interpolation.
  - FLUX.3 Upscale: see its own entry [/blog/ai-video-restoration-high-quality].
  - Image side: Topaz (default), ByteDance Upscale (up to 4K), Topaz Generative.
- Limits:
  - A job normally takes 1 to 5 minutes. Past 5 minutes, hover the tile in Assets, Cancel and retry.
  - Failures usually come from a non-standard format (use MP4 with H.264), a source too low in quality, or queue overload.
  - Failed jobs refund automatically (check Manage Account → Usage).
  - Any video in Assets can be upscaled, including MCP and Supercomputer output [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do].
  - The Resolve plugin lists Upscale up to 4K [/creator-hub/help-center/integrations/external-integrations-higgsfield].
- Models: the help article (Aug 1, 2026) lists 2 video models, ByteDance Upscale and Topaz Video. The Sep 3, 2026 blog lists 3 by adding FLUX.3 Upscale. Diffusion-based options (Topaz Video, Topaz Generative) can invent detail and are not advised for approved deliverables [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do] [/blog/ai-video-restoration-high-quality].
  - Older branding: the 2025 posts call the tool "Higgsfield Upscale", a one-click deflicker, stabilize, denoise and upscale pass with a side-by-side compare. The pages label it "Sora 2 Max" and use the buttons "Try Sora 2 Enhancer!" and "Try Sora Max" (likely the Sora 2 Upscale in nav history) [/blog/Upgrade-the-Quality-of-Old-Videos-using-Upscale] [/blog/Restore-Your-Old-Video-With-Higgsfield-Upscale] [/blog/Higgsfield-Upscale-Phone-vs-Camera].
- Credits and cost: for 10 s to 4K, ByteDance costs 8 credits (about $0.40), FLUX.3 132 (about $6.60) and Topaz 35 (about $1.75) [/blog/ai-video-restoration-high-quality]. Higher targets and Advanced options cost more [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do].
- Launched: Higgsfield Upscale guide on Oct 14, 2025 (blog post date). The three-model lineup appears in the Sep 3, 2026 blog post. Changelog title "FLUX 3 Video Upscaler. Now on Higgsfield" (undated).
- Sources: [/ai/video/edit?tool=upscale] [/upscale] [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do] [/blog/ai-video-restoration-high-quality] [/blog/Upgrade-the-Quality-of-Old-Videos-using-Upscale] [/blog/Restore-Your-Old-Video-With-Higgsfield-Upscale] [/blog/Higgsfield-Upscale-Phone-vs-Camera] [/creator-hub/changelog]

### FLUX 3 Video Upscaler (FLUX.3 Upscale)
- What it does: one of three engines in the Video Upscale tool; either stays close to the source (Precise) or adds detail beyond it (Creative). Nav label "Preserve the original or creatively enhance detail".
- How to use: 1. Open Video Upscale and upload 2. Pick FLUX.3 3. Set output resolution, Creativity and an optional prompt 4. Generate and review [/blog/ai-video-restoration-high-quality].
- Inputs and settings: up to 13.75 MP per frame; Creativity Precise or Creative; optional prompt; targets low resolution and compression artifacts [/blog/ai-video-restoration-high-quality].
- Limits: ByteDance or Topaz fit heavily damaged sources better [/blog/ai-video-restoration-high-quality].
- Models: FLUX.3 Upscale; siblings in the same tool are ByteDance Upscale (up to 8K) and Topaz Video.
- Credits and cost: 10 s at 4K = 132 credits ($6.60) vs ByteDance 8 ($0.40) and Topaz 35 ($1.75) [/blog/ai-video-restoration-high-quality].
- Launched: changelog title "FLUX 3 Video Upscaler. Now on Higgsfield", undated, next to Gemini Omni 1.1 Flash, so about late Aug 2026 (inferred); restoration guide Sep 3, 2026 (blog post date) [/creator-hub/changelog].
- Sources: [/ai/video/edit?tool=upscale&toolModel=flux-video-upscale] [/blog/ai-video-restoration-high-quality] [/creator-hub/changelog]

### Higgsfield Reframe
- What it does: changes the aspect ratio of a finished video (nav: resize videos to any aspect ratio). The plugins describe it as switching ratio without cropping. For images, Expand does the same job.
- How to use: 1. higgsfield.ai → Edit → Reframe 2. Upload the clip 3. Pick the target ratio 4. Generate, then check framing, captions, product visibility and safe areas [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/ai-video-ad-localization].
- Inputs and settings: the ratios named are 9:16 (TikTok, Reels), 1:1 (feed) and 16:9 (YouTube) [/blog/ai-video-ad-localization] [/blog/100-plus-ad-variations-ai]. It makes vertical, horizontal and square versions [/blog/automate-ecommerce-catalog-video-ai].
- Limits: it does not update captions, prices or on-screen text, so fix those first [/blog/ai-video-ad-localization]. It is available in the Premiere Pro, After Effects and DaVinci Resolve plugins [/creator-hub/help-center/integrations/external-integrations-higgsfield].
- Models: not stated.
- Credits and cost: 70 credits for a 15 s 720p clip (about $3.50 at $0.05 per credit) [/blog/ai-video-ad-localization].
- Launched: not stated.
- Sources: [/ai/video/reframe] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/ai-video-ad-localization] [/blog/100-plus-ad-variations-ai] [/blog/automate-ecommerce-catalog-video-ai] [/creator-hub/help-center/integrations/external-integrations-higgsfield]

### Video relight and color palette
- What it does: two standalone tools for existing footage. Video Relight re-renders light direction, color and intensity. Color Palette regrades color from a preset or a reference image. Both keep motion and composition. The /apps/video-rehex page is titled "AI Video Relighting", and the nav calls it Change Color Palette (palette, tones and mood).
- How to use:
  - Relight: 1. Open Video Relight and upload a clip 2. Pick a preset or build a custom light 3. Generate 4. Review and adjust.
  - Color Palette: 1. Upload a clip 2. Pick one of 50+ grades or build a custom one, or upload a reference image 3. Generate [/blog/video-relight-color-palette-higgsfield].
- Inputs and settings:
  - Relight presets: Practicals, Silhouette, Contre-jour, Soft Cross, Window, Overhead Fall, plus Auto. Up to 2 custom lights, each with color, brightness, diffuse and angle, or described by prompt.
  - Color Palette: 50+ presets, for example Film Colors, Black Gloss, Candy Pink, Lime Jam, Nostalgic Blue, Soft Palette, Overtime and Crimson Vigi, plus reference-image recolor [/blog/video-relight-color-palette-higgsfield] [/blog/100-plus-ad-variations-ai].
- Limits: the two tools can run in either order. They use the same lighting and color systems as Cinema Studio 4.0 [/blog/video-relight-color-palette-higgsfield]. They are separate from the image Relight app at /apps/relight [/blog/Relight-Director-Style-Cinematic-Lighting].
- Models: not stated.
- Credits and cost: 135 credits ($6.75) for each 15 s clip, per tool [/blog/video-relight-color-palette-higgsfield]. Relight at 10 s, any resolution, costs 90 credits ($4.50) [/blog/100-plus-ad-variations-ai].
- Launched: Aug 20, 2026 (blog post date). Changelog title "Higgsfield Relight and HEX for videos. Now standalone products" (undated).
- Sources: [/apps/video-rehex] [/blog/video-relight-color-palette-higgsfield] [/blog/100-plus-ad-variations-ai] [/creator-hub/changelog]

### Kling Motion Control
- What it does: transfers movement, expression and timing from a reference video onto a still character image, keeping the character's identity. The tool lives at /ai/video/motion ("Transfer motion from video to image").
- How to use: 1. Video tab → Kling Motion Control 3.0 2. Upload the motion reference video 3. Upload the character photo with face and body visible 4. Set quality and scene source 5. Optionally add a prompt and orientation under Advanced Settings 6. Generate [/blog/kling-motion-control-3].
- Inputs and settings:
  - Output 720p or 1080p.
  - Scene source: the background comes from either the video or the image.
  - Advanced prompt for background, lighting and atmosphere.
  - Orientation matches either the video or the image [/blog/kling-motion-control-3].
  - Duration 3 to 30 s [/creator-hub/help-center/ai-models/how-do-i-use-kling].
  - Tips: limbs and hands visible, space around the body, a clean reference with no camera cuts and matching framing. You can record your own motion as the reference [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/Kling-2.6-Motion-Control-Full-Guide].
- Limits: also offered as a tool in Higgsfield MCP [/creator-hub/help-center/ai-models/how-do-i-use-kling]. All Unlimited caps it at 1080p and 8 s [/blog/higgsfield-all-unlimited-explained].
- Models: Kling Motion Control (2.6) and Kling 3.0 Motion Control. Version 3.0 improves facial consistency and motion capture [/blog/kling-motion-control-3].
- Credits and cost: not stated ("depend on your plan"). The 2.6 launch was marketed as Unlimited Kling Motion Control [/blog/Kling-2.6-Motion-Control-Full-Guide]. Kling 3.0 Motion Control is in the All Unlimited set but cannot be bought on its own in the Marketplace [/blog/higgsfield-all-unlimited-explained].
- Launched: 2.6 guide on Dec 20, 2025 (blog post date). 3.0 on Mar 5, 2026 with day-0 access (blog post date).
- Sources: [/ai/video/motion] [/blog/kling-motion-control-3] [/blog/Kling-2.6-Motion-Control-Full-Guide] [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/higgsfield-all-unlimited-explained]

### Kling 3.0 Omni Edit
- What it does: edits existing footage with text prompts, style transfer and local changes while keeping character identity. The page is labelled early access.
- How to use: open /ai/video/edit?model=kling-video-reference-o3, upload the video and describe the edit (inferred from the page description).
- Inputs and settings: input clips of 3 to 10 s, up to 1080p [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Limits: early access per the page title.
- Models: Kling 3.0 Omni Edit, model ID `kling-video-reference-o3`. Its sibling Kling 3.0 Omni covers generation.
- Credits and cost: not stated.
- Launched: not stated.
- Sources: [/ai/video/edit?model=kling-video-reference-o3] [/creator-hub/help-center/ai-models/how-do-i-use-kling]

### Visual effects and viral presets
- What it does: a library of ready-made effects at /effects ("Higgsfield Visual Effects") that turn one photo into a short trend-style video. Animation, location and style are built in, so no prompt is needed.
- How to use: 1. Pick a preset (new ones are flagged) 2. Upload a photo with a clear subject 3. Choose resolution and, where offered, aspect ratio 4. Generate. You can optionally check the result with Virality Predictor [/blog/how-to-make-viral-videos-viral-presets].
- Inputs and settings:
  - Library size: 60+ presets [/blog/how-to-make-viral-videos-viral-presets], or 50+ [/blog/ai-content-for-tiktok-2026].
  - Resolution from 480p up to 4K on most presets. Vertical ratio on some.
  - The Aug 2026 batch added 13 presets in three styles: living paintings, impossible rides and cinematic reveals.
  - About 45 effects appear on /effects, including Earth Zoom, Bullet Time, Agamemnon, Pearl Earring, Infinite Clones, Lidar Transition, Melting and Skatedog.
- Limits: also in ChatGPT through the /effects slash command (changelog Sep 30, 2026). The /effects page shows a "Now in ChatGPT" banner and "Try for free" labels. AI Influencer characters can go straight into presets [/blog/ai-content-for-tiktok-2026].
- Models: not stated. Higgsfield DoP has an "Effects" preset category for VFX transformations, which may be related (inferred) [/creator-hub/help-center/ai-models/how-do-i-use-dop].
- Credits and cost: 27.5 to 67.5 credits per 720p generation for the new batch. Examples: Pearl Earring 27.5, Dolphin Ride 28, Monet Muse 33.5, Argus 43.5, Agamemnon and Bullet Time 67.5 [/blog/how-to-make-viral-videos-viral-presets].
- Launched: Viral Presets update of 13 presets on Aug 14, 2026 (blog post date). Changelog title "Effects 2.0. Viral presets in ChatGPT" (undated). ChatGPT extension with /effects on Sep 30, 2026 (changelog).
- Sources: [/effects] [/effects/use] [/blog/how-to-make-viral-videos-viral-presets] [/blog/ai-content-for-tiktok-2026] [/creator-hub/changelog] [/creator-hub/help-center/ai-models/how-do-i-use-dop]

## Marketing and ads

### Marketing Studio
- What it does: Higgsfield's ad workspace for product ads, UGC videos, product creative and other commercial content. Since the relaunch it is template-first: pick a template, connect a product, get a finished ad in one click. A prompt path is still there.
- How to use: 1. Open higgsfield.ai, then Marketing Studio 2. Pick a template (sorted by task) 3. Connect the brand: upload a product image or paste a website or product page link 4. Generate. The credit cost shows on the Generate button first [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads]. Prompt path: skip templates, paste a URL or upload images, write the prompt, generate [/blog/new-marketing-studio-higgsfield].
- Inputs and settings:
  - Template library of 1,500+, in six categories: Product Shots, Ads, Marketplace, Posters, UGC Videos, Motion. The help center adds a "Ref → Video" row (video from a reference) [/blog/new-marketing-studio-higgsfield] [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads].
  - The live page has tabs for Ads, Motion, UGC, Product shot, TikTok, Posters, Marketplace, plus All / Images / Videos filters and Browse templates. TikTok shows up only on the live page [/marketing-studio].
  - Inputs: a product image, a site or product page URL (the page is read for imagery, logo, colors and copy), a reference ad (UGC only), or a text prompt [/blog/new-marketing-studio-higgsfield].
  - Generation panel: a Product slot (save the product once, with several angles, a name and a description), an Avatar slot, Ad Reference, quantity up to 4 per run, and 9 aspect ratios (auto, 1:1, 3:2, 2:3, 4:3, 3:4, 9:16, 16:9, 21:9) [/blog/how-to-make-ai-ugc-videos] [/blog/how-to-make-ai-product-photos-without-a-studio].
  - Styles: 32 styles across five categories, set directly in the panel. Product shot has 9, Ads 3, Marketplace 5, Motion 7, UGC 8 [/blog/how-to-make-ai-ugc-videos].
  - Recreate: open any template, upload your product in Replace product, and the template's look is regenerated around it. It works on every preset [/blog/how-to-make-ai-product-photos-without-a-studio].
  - Soul ID (trained on 20+ photos) keeps the same spokesperson face across variations [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads].
- Limits:
  - Clip length: the help center gives 15 s max per generation, and most posts agree [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads] [/blog/best-ai-ad-generators]. A later listicle says UGC Videos and Motion reach 30 s [/blog/best-ai-platforms-create-ads-from-url].
  - Only Posters can be edited after generation. Every other category is regenerated [/blog/new-marketing-studio-higgsfield].
  - UGC voiceover and pacing vary by generation [/blog/new-marketing-studio-higgsfield].
  - Agent access, pages disagree:
    - The Aug 1 help article says the template version isn't available through Supercomputer, MCP or other agent channels [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads].
    - Later pages say the template gallery opens inside Claude through MCP [/blog/claude-ad-production-end-to-end], and the ChatGPT extension adds /marketing-studio, /product and /motion commands [/creator-hub/changelog]. OpenAI Dots lists Marketing Studio among its tools [/creator-hub/changelog].
  - Older posts call it web only with no public API [/blog/best-ai-ad-generators-2026] [/blog/ai-product-videos-no-studio].
  - Unlimited plans do not cover it. Marketing Studio always runs on credits [/blog/annual-unlimited-ai-video-plans].
- Models: Product Shots runs on "MS Image", and Product Motion runs on Higgsfield Motion [/blog/new-marketing-studio-higgsfield]. Older posts name Seedance 2.0 as the video engine, with up to 9 references per call [/blog/make-100-creative-ads] [/blog/ai-product-videos-no-studio]. The API sells "Marketing Studio Image" [/blog/higgsfield-api].
- Credits and cost:
  - Video: 8 s at 720p is 47.62 credits (about $2.38), 15 s at 720p is 89.2 credits (about $4.46) [/blog/new-marketing-studio-higgsfield] [/blog/ai-avatars-vs-ugc-creators-2026].
  - Images: a 2K product shot is 1.5 credits and a 2K poster is 7.5 credits [/blog/new-marketing-studio-higgsfield]. Other pages give 2 to 4 credits per product shot and 8 per poster or marketplace image [/blog/how-to-make-ai-ugc-videos].
  - Other quotes: a 10 s 720p base ad is 60 credits [/blog/100-plus-ad-variations-ai]. A 15 s 720p clip is 90 credits [/blog/ai-video-ad-localization]. A 15 s product video is 90 and a 15 s UGC video is 108 [/blog/sports-product-video-ads-ai-2026].
  - Rate: about 20 credits per $1 [/blog/how-to-make-ai-ugc-videos].
- Launched: first seen Apr 26, 2026 (blog post date, prompt-based version) [/blog/marketing-studio-video-1]. The template-first "new Marketing Studio" with 1,500+ templates is Aug 18, 2026 (blog post date) [/blog/new-marketing-studio-higgsfield]. ChatGPT slash commands came Sep 30, 2026 (changelog).
- Sources: [/marketing-studio] [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads] [/blog/new-marketing-studio-higgsfield] [/blog/how-to-make-ai-ugc-videos] [/blog/how-to-make-ai-product-photos-without-a-studio] [/creator-hub/help-center/tools/which-higgsfield-tool-should-i-use] [/blog/claude-ad-production-end-to-end] [/creator-hub/changelog] [/blog/best-ai-platforms-create-ads-from-url] [/blog/annual-unlimited-ai-video-plans] [/creator-hub/case-studies/brilliance-higgsfield-marketing-studio]

### Marketing Studio product shots
- What it does: studio-grade product photos from one clean product photo, as a full set: hero, lifestyle, shots with a model, and marketplace covers [/blog/how-to-make-ai-product-photos-without-a-studio].
- How to use: 1. Clean the base photo (Remove Background in Higgsfield Layers if needed) 2. Add the product once in the Product slot 3. Optionally pick or create an avatar 4. Generate the set in Product shot 5. Switch to Marketplace for listing covers [/blog/how-to-make-ai-product-photos-without-a-studio].
- Inputs and settings:
  - Help center formats: Studio, Lifestyle, With Model [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads].
  - Blog styles (9): Closeup, Faceless, Full body, Editorial, UGC, Studio white, Color pop, Natural, Usage [/blog/how-to-make-ai-ugc-videos].
  - Scene reference images can sit next to the product [/blog/how-to-make-ai-product-photos-without-a-studio].
  - Avatars only appear in the people formats (Closeup, Full body, Editorial, UGC). Three sources: the library, Create avatar from your own photos, or a Soul 2.0 character [/blog/how-to-make-ai-product-photos-without-a-studio].
  - Avatar library size: 20 avatar templates [/blog/new-marketing-studio-higgsfield] vs 40 avatars "at the time of writing" [/blog/how-to-make-ai-product-photos-without-a-studio].
- Limits: compare each output with the real product (shape, color, packaging text) [/blog/how-to-make-ai-product-photos-without-a-studio].
- Models: MS Image [/blog/new-marketing-studio-higgsfield]. Through the API it is sold as Marketing Studio Image [/blog/generate-ai-videos-higgsfield-api].
- Credits and cost: 1.5 credits per 2K shot [/blog/new-marketing-studio-higgsfield], or 2 to 4 credits ($0.10 to $0.20) per shot [/blog/how-to-make-ai-product-photos-without-a-studio]. A set of 8 to 10 images costs $1.60 to $2.40. API: $0.0059 per image [/blog/generate-ai-videos-higgsfield-api].
- Launched: covered in the Aug 18, 2026 relaunch (blog post date).
- Sources: [/blog/how-to-make-ai-product-photos-without-a-studio] [/blog/new-marketing-studio-higgsfield] [/blog/how-to-make-ai-ugc-videos] [/blog/generate-ai-videos-higgsfield-api] [/blog/higgsfield-api]

### Marketing Studio UGC videos
- What it does: creator-style ads that look shot on a phone, with script, video, native audio and lip sync made in one pass [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads] [/blog/how-to-make-ai-ugc-videos].
- How to use: 1. Select UGC Videos 2. Pick a Faceless, Talking Head or Silent template 3. Upload a product image 4. Generate, no prompt needed [/blog/new-marketing-studio-higgsfield]. For hook tests, keep product, creator, preset and setting fixed and change only the opening line [/blog/how-to-make-ai-ugc-videos].
- Inputs and settings:
  - Needs a product image or a reference ad [/blog/new-marketing-studio-higgsfield].
  - UGC styles (8): Shopping, At home, Delivery, Review, Try-on, Unboxing, Tutorial, Before/after [/blog/how-to-make-ai-ugc-videos].
  - Ad Reference: drop in a reference ad you have rights to, and its structure and format are rebuilt around your product [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads].
  - Avatar: pick from the library, generate one from a prompt, or upload a permitted photo [/blog/how-to-make-ai-ugc-videos].
  - Use 9:16 for TikTok, Reels and Shorts.
  - A Recreate button reruns a generation with one input changed [/blog/how-to-make-ai-ugc-videos].
- Limits: up to 15 s per generation, and voiceover and pacing are still "being polished" [/blog/new-marketing-studio-higgsfield]. Don't present AI presenters as real customers [/blog/video-ads-small-business-ai].
- Models: not stated for the new version. Seedance 2.0 per older posts [/blog/make-100-creative-ads].
- Credits and cost: 52 to 142 credits ($2.60 to $7.10) per UGC video [/blog/how-to-make-ai-ugc-videos]. 108 credits for 15 s [/blog/sports-product-video-ads-ai-2026].
- Launched: part of the Aug 18, 2026 relaunch (blog post date). The older UGC format dates from Apr 2026 [/blog/marketing-studio-video-2].
- Sources: [/blog/new-marketing-studio-higgsfield] [/blog/how-to-make-ai-ugc-videos] [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads] [/blog/video-ads-small-business-ai] [/blog/best-ai-ad-generators]

### Marketing Studio motion
- What it does: product video with no presenter. Covers Hypermotion, 2D Product Motion, Mixed Media and Motion Design. Motion Design builds motion graphics for software or apps from a logo or website [/blog/new-marketing-studio-higgsfield].
- How to use: 1. Pick a Motion template 2. Add a product image (or a logo or URL for Motion Design) 3. Generate [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads].
- Inputs and settings: 7 Motion styles: 2D product motion, Hypermotion, Typography, Dark Minimalism, Color pop, Mixed media, SaaS [/blog/how-to-make-ai-ugc-videos]. It also makes animated banners and posters from saved product images [/blog/how-to-make-ai-product-photos-without-a-studio].
- Limits: up to 15 s per generation [/blog/new-marketing-studio-higgsfield]. Up to 30 s per a later listicle [/blog/best-ai-platforms-create-ads-from-url].
- Models: Product Motion runs on Higgsfield Motion [/blog/new-marketing-studio-higgsfield].
- Credits and cost: 30 to 31 credits ($1.50 to $1.55) per animated banner [/blog/how-to-make-ai-product-photos-without-a-studio].
- Launched: Aug 18, 2026 relaunch (blog post date). "Hyper Motion" existed as a preset by Apr 30, 2026 [/blog/marketing-studio-video-2].
- Sources: [/blog/new-marketing-studio-higgsfield] [/blog/how-to-make-ai-ugc-videos] [/blog/how-to-make-ai-product-photos-without-a-studio] [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads]

### Marketing Studio ads, posters, marketplace and TikTok templates
- What it does: still image categories.
  - Ads: image ads sized for Meta and Google placements.
  - Posters: banners and posters you can edit afterward.
  - Marketplace: listing images [/blog/new-marketing-studio-higgsfield].
- How to use: 1. Pick the category and a template 2. Connect the product 3. Generate. For Posters, edit layout, text and elements in Higgsfield Layers [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads].
- Inputs and settings: Ads styles are Social proof, Comparison and Problem → Solution. Marketplace styles are Dark, 3D surreal, Color pop, Pastel and Clean Studio [/blog/how-to-make-ai-ugc-videos]. Sample template names on the live page include Ice cube hover, Brushed tin, Green tea macro, Chilled can, Before and after (UGC video), and Monospace callouts [/apps/link-to-video-ad].
- Limits: Marketplace makes no claim of official partnership or compliance [/blog/new-marketing-studio-higgsfield]. Posters is the only editable category. The TikTok tab appears on the live page and no page describes it [/marketing-studio]. An older post (prompt version) said Marketing Studio had no static output and pointed to "DTC Ads" instead [/blog/make-100-creative-ads] [/blog/how-studios-scale-ai-video-production].
- Models: not stated (MS Image likely, inferred).
- Credits and cost: 7.5 credits per 2K poster [/blog/new-marketing-studio-higgsfield]. 8 credits ($0.40) per poster or marketplace image [/blog/how-to-make-ai-ugc-videos].
- Launched: Aug 18, 2026 relaunch (blog post date).
- Sources: [/blog/new-marketing-studio-higgsfield] [/blog/how-to-make-ai-ugc-videos] [/marketing-studio] [/apps/link-to-video-ad] [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads]

### Marketing Studio prompt formats (pre-relaunch)
- What it does: the earlier prompt-first Marketing Studio. You picked one of 9 formats and wrote a description, optionally pointing it at a URL [/blog/new-marketing-studio-higgsfield] [/blog/make-100-creative-ads].
- How to use: 1. Paste a product URL (images, name, features and pricing are pulled) 2. Review or edit the generated script 3. Pick a format 4. Attach a Soul ID 5. Set the aspect ratio and generate [/blog/make-100-creative-ads] [/blog/best-ai-ad-generators-2026].
- Inputs and settings:
  - Formats: UGC, Tutorial, Unboxing, Product Review, TV Spot, Hyper Motion, Wild Card, UGC Virtual Try On, Pro Virtual Try On. "Product Showcase" also appears [/blog/make-100-creative-ads] [/blog/food-product-video-ad-ai-2026].
  - Hook and Setting fields are an alternative to Ad Reference: use one or the other per ad [/blog/make-100-creative-ads].
  - App vs product mode, an app type such as mobile, a 15 s duration, and an avatar [/blog/marketing-studio-video-2].
  - A free "Marketing Studio Skill" for Claude writes the prompts [/blog/marketing-studio-video-2].
- Limits: 15 s max, web interface only, no static output [/blog/make-100-creative-ads].
- Models: Seedance 2.0, up to 9 reference inputs [/blog/make-100-creative-ads].
- Credits and cost: about $2 per 8 s 720p clip, so 100 clips is about $200 [/blog/make-100-creative-ads].
- Launched: Apr 26, 2026 (blog post date). Replaced by the template-first flow Aug 18, 2026.
- Sources: [/blog/make-100-creative-ads] [/blog/marketing-studio-video-1] [/blog/marketing-studio-video-2] [/blog/best-ai-ad-generators-2026] [/blog/ai-product-videos-no-studio] [/blog/how-studios-scale-ai-video-production]

### Click to Ad
- What it does: turns a single product URL into a finished video ad. It scans the page and builds the ad from preset templates. Part of Marketing Studio [/blog/how-to-make-100-creative-ads].
- How to use: 1. Paste a single-product link 2. Review what it extracted 3. Swap images, rewrite the description, adjust colors, upload a logo 4. Pick a template and generate [/blog/how-to-make-100-creative-ads].
- Inputs and settings: it pulls the product name, description, up to 8 photos, brand colors and logo. There are 10 preset templates with different structure and pacing [/blog/how-to-make-100-creative-ads] [/blog/best-ai-platforms-create-ads-from-url].
- Limits: needs at least one clear product photo. Photos with people reduce clarity, and cluttered pages pull the wrong assets. Tuned for physical goods. Template-bound [/blog/how-to-make-100-creative-ads]. Nav label: "Turn product URLs into video ads". The route /apps/link-to-video-ad now loads the Marketing Studio page [/apps/link-to-video-ad].
- Models: not stated.
- Credits and cost: per-ad cost not stated. Runs on the subscription: Starter $15/mo (200 credits), Plus $49/mo (1,000 credits, or $39/mo billed annually) [/blog/how-to-make-100-creative-ads].
- Launched: first described Jun 21, 2026 (blog post date).
- Sources: [/blog/how-to-make-100-creative-ads] [/apps/link-to-video-ad] [/blog/best-ai-platforms-create-ads-from-url] [/blog/sports-product-video-ads-ai-2026] [nav-menus.json]

### Brand kit
- What it does: stores a brand's identity once so generated ads stay on brand, in Marketing Studio and in Ads Studio [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads] [/blog/higgsfield-ads-studio].
- How to use: 1. Paste the website URL and click Create my brand (or Create brand kit manually) 2. Review and correct the fields 3. Save. Later batches reuse it [/blog/higgsfield-ads-studio].
- Inputs and settings:
  - Marketing Studio pulls logo, colors, fonts, imagery and tone of voice [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads].
  - Ads Studio fields: logo, color palette (main color plus hex colors), display and body fonts, tone of voice, audience, aesthetics, description, selling points, and social links (Instagram, TikTok, Facebook, Pinterest, YouTube) [/blog/higgsfield-ads-studio].
  - A "Brandkit" skill exists in MCP and Supercomputer [/blog/claude-ad-production-end-to-end] [/supercomputer].
- Limits: none stated.
- Models: not stated.
- Credits and cost: not stated.
- Launched: in the Marketing Studio help by Aug 1, 2026. In Ads Studio Sep 30, 2026 (changelog).
- Sources: [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads] [/blog/higgsfield-ads-studio] [/ads-studio] [/blog/ai-product-videos-no-studio] [/blog/claude-ad-production-end-to-end]

### Virality predictor
- What it does: scores a generated video before it goes live, so you can rank variations. It rates virality potential, expected engagement and how well the clip holds attention [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads]. Through the connector it scores hook strength, retention risk and engagement [/blog/claude-ad-production-end-to-end].
- How to use: generate the ad, run it through Virality Predictor, compare scores, publish the strongest [/blog/how-to-make-ai-ugc-videos] [/blog/how-to-make-viral-videos-viral-presets].
- Inputs and settings: a finished video.
- Limits: the score is an estimate and no guarantee [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads]. Available on the web and through the Higgsfield MCP connector [/blog/claude-ad-production-end-to-end].
- Models: not stated.
- Credits and cost: not stated.
- Launched: mentioned from Jul 7, 2026 (blog post date) [/blog/best-ai-ad-generators-2026].
- Sources: [/creator-hub/help-center/tools/how-do-i-use-marketing-studio-to-create-video-ads] [/blog/make-100-creative-ads] [/blog/how-to-make-ai-ugc-videos] [/blog/claude-ad-production-end-to-end] [/blog/how-to-make-viral-videos-viral-presets]

### Ads Studio
- What it does: turns your website into finished static ads with copy, visuals and brand style. Each ad is built around a selling angle such as price or offer, ingredients, usage, or lifestyle [/blog/higgsfield-ads-studio].
- How to use: 1. Create the brand kit from a URL or by hand 2. Pick products from the imported catalog, or add them by link or upload 3. Choose up to 20 ads per product and check the total cost 4. Generate and review 5. Ask for more in chat with "Mention a product" 6. Download [/blog/higgsfield-ads-studio] [/creator-hub/changelog].
- Inputs and settings: the brand kit, products, and the number of ads per batch. Chat follow-ups describe new angles [/blog/higgsfield-ads-studio]. Landing-page tools are Create ads and Ad multiplier [/ads-studio].
- Limits: static images only. Video goes to Marketing Studio. No website needed [/blog/higgsfield-ads-studio]. Batches cap at 20 ads per product [/creator-hub/changelog].
- Models: not stated.
- Credits and cost: 4 credits per ad (about $0.20). 20 ads cost 80 credits ($4.00) at $0.05 per credit [/blog/higgsfield-ads-studio].
- Launched: Sep 30, 2026 (changelog), blog Oct 1, 2026.
- Sources: [/ads-studio] [/blog/higgsfield-ads-studio] [/creator-hub/changelog] [/blog/video-ads-small-business-ai]

### Ad Multiplier
- What it does: rebuilds one reference video ad with your own characters, products, outfits and locations. Original motion, framing, cuts and timing are kept, and hook, script or CTA can change per version [/blog/ad-multiplier-ads-studio] [/creator-hub/changelog].
- How to use: 1. Ads Studio, then Explore tools, then Ad multiplier 2. Upload a 4 to 30 s reference 3. Add up to 20 images 4. Write the prompt, tagging files with @ 5. Pick quality 6. Check the cost on Generate 7. Review versions in History [/blog/ad-multiplier-ads-studio].
- Inputs and settings: one video of 4 to 30 s plus up to 20 images. What can change: product, cast, clothing, location, script, hook, CTA. Hooks and CTAs can be retried without re-uploading. Output 480p, 720p or 1080p [/creator-hub/changelog] [/blog/ad-multiplier-ads-studio].
- Limits: trim longer videos first. Use only material you have rights or consent for. Several versions per run [/blog/ad-multiplier-ads-studio].
- Availability: Ads Studio "in the Extension", a skill through Higgsfield MCP (Claude), and Supercomputer, where an "Ad Multiplier Skill" is featured [/blog/ad-multiplier-ads-studio] [/supercomputer]. Also in the ChatGPT extension [/creator-hub/changelog].
- Models: not stated.
- Credits and cost: no fixed price.
  - Hook + CTA: up to 140 credits at 720p (up to $7.00), up to 240 at 1080p (up to $12.00).
  - CTA only: up to 35 at 720p, up to 60 at 1080p.
  - Based on the Plus plan ($49 for 1,000 credits) [/blog/ad-multiplier-ads-studio].
- Launched: first released as a Claude skill (changelog title only, date not in the text). Visual interface in Ads Studio Oct 6, 2026 (changelog and blog).
- Sources: [/blog/ad-multiplier-ads-studio] [/creator-hub/changelog] [/ads-studio] [/supercomputer] [/blog/claude-ad-production-end-to-end] [/]

### UGC Factory and marketing skills
- What it does: agent skills that turn a product idea, photo or store page into a creator-led vertical ad with script and captions, keeping one avatar consistent for the whole clip [/blog/faceless-videos-ugc-ads-2026] [/blog/mcp-for-marketers].
- How to use: 1. Connect Higgsfield MCP (Claude or ChatGPT), or open Supercomputer 2. Attach a creator photo and a product photo 3. Describe the ad in plain language 4. The skill generates video, audio, montage and subtitles [/blog/faceless-videos-ugc-ads-2026].
- Inputs and settings:
  - UGC Factory templates (6): Unboxing, Product Review, SaaS, Try-On, Tutorial, Localization [/blog/faceless-videos-ugc-ads-2026].
  - Other skill groups: Marketing (Physical UGC Video, Ad Multiplier, Brandkit, TV Commercials) and Utility (Voiceover, Subtitles, Localization) [/blog/claude-ad-production-end-to-end].
- Limits: needs MCP setup, except in Supercomputer. Output can run past the 15 s single-generation cap because it is stitched from segments. A web version of UGC Factory exists with Image Stage and keyframe control [/blog/faceless-videos-ugc-ads-2026]. Agent generations always deduct credits [/blog/mcp-for-marketers].
- Models: not stated.
- Credits and cost: same rates as the website. A 15 s 1080p UGC video cost 165.72 credits ($8.30) including storyboard and "de-slop" passes [/blog/faceless-videos-ugc-ads-2026]. A 20 s Product Review UGC cost 270 credits ($13.50) [/blog/mcp-for-marketers].
- Launched: Aug 17, 2026 (blog post date).
- Sources: [/blog/faceless-videos-ugc-ads-2026] [/blog/mcp-for-marketers] [/blog/claude-ad-production-end-to-end] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/supercomputer]

### Similarity scoring (content scoring)
- What it does: checks generated images and video for likely overlap with known characters, celebrity likenesses, brand logos and similar protected references before publishing. It only gives guidance and never blocks output [/blog/content-scoring-higgsfield].
- How to use: a four-step pipeline. 1. Analysis of frames and audio 2. Pattern matching 3. A percentage score 4. Creator review, then publish or revise [/blog/content-scoring-higgsfield].
- Inputs and settings: each result shows the type of similarity, the likely source, where it occurs in the media, and the score. Categories (10): Actor Likeness, Brand / Trademark, Design Assets, Fictional Character, Film / Movie Frame, Cinematics & Direction, Aesthetic DNA, Real Person, Biometrics & Identity, Audio [/blog/content-scoring-higgsfield].
- Limits: Team Plan customers only [/blog/content-scoring-higgsfield].
- Models: Higgsfield's own (unnamed). On video it scored 86.6% accuracy vs 48.5% for a third-party tool, with 13.3% vs 73.8% false positives (internal benchmark) [/blog/content-scoring-higgsfield].
- Credits and cost: not stated.
- Launched: Mar 16, 2026 (blog post date).
- Sources: [/blog/content-scoring-higgsfield]

### Ad localization workflow (Translate, Lipsync Studio, Reframe)
- What it does: localizes one approved ad. Translate and re-voice in Audio, sync lips in Lipsync Studio, then Reframe for each platform [/blog/ai-video-ad-localization].
- How to use: 1. Build the master in Marketing Studio 2. Adapt the script for timing 3. Audio, then Translate: upload the video and pick a language, or upload your own voice track 4. Sync in Lipsync Studio 5. Update captions, prices and CTAs, then Reframe to 9:16, 1:1 or 16:9 [/blog/ai-video-ad-localization].
- Inputs and settings: language count, pages disagree. 18+ languages [/blog/ai-video-ad-localization], "18 languages across seven models" [/blog/100-plus-ad-variations-ai], and the Localization skill in UGC Factory keeps voice and pacing [/blog/faceless-videos-ugc-ads-2026].
- Limits: captions, on-screen text and prices don't update automatically. Line length can hurt sync quality. Clone voices only with consent [/blog/ai-video-ad-localization]. Lipsync Studio, Genjutsu and Seedance 2.5 Edit have no batch button, so scale runs through Supercomputer or Canvas [/blog/100-plus-ad-variations-ai].
- Models: Lipsync Studio models (see below). Variant tools: Genjutsu Object Swap / Motion Transfer, Seedance 2.5 Edit, Relight [/blog/100-plus-ad-variations-ai].
- Credits and cost: for 15 s, Marketing Studio 90 + Audio translation 45 + Lipsync (Google Veo 3, 720p) 58 + Reframe 70 = 263 credits ($13.15) [/blog/ai-video-ad-localization]. 10 s variants run about $3 to $4.50 each [/blog/100-plus-ad-variations-ai].
- Launched: Sep 23, 2026 (blog post date, workflow guide).
- Sources: [/blog/ai-video-ad-localization] [/blog/100-plus-ad-variations-ai] [/blog/automate-ecommerce-catalog-video-ai] [/blog/faceless-videos-ugc-ads-2026] [/blog/claude-ad-production-end-to-end]

## Audio and lipsync

### Higgsfield Audio
- What it does: voice generation and dubbing inside Higgsfield. Three modes: Text to Speech (voiceover), Voice Change, and Translate (with lip sync) [nav-menus.json] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
- How to use: 1. Open the Audio tab 2. Pick a mode from the bottom-left switch 3. Pick a model 4. Enter text or upload video 5. Pick a preset or custom voice 6. Generate [/blog/higgsfield-audio-ai-voice-tools] [/blog/higgsfield-audio].
- Inputs and settings:
  - Model count grew over time: 3 at launch (Eleven v3, MiniMax Speech 2.8 HD, VibeVoice) [/blog/higgsfield-audio-ai-voice-tools], 6 by Jul 31 [/blog/higgsfield-audio], and the nav now lists 7. VibeVoice is no longer listed; Eleven v4 and v4 Turbo were added [nav-menus.json].
  - Help also mentions emotion sliders [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
  - Audio-first workflow: make audio in Seed Audio 1.0, then attach it as a reference in Cinema Studio, Seedance 2.0 or Kling 3.0 [/blog/higgsfield-audio].
- Limits:
  - Music and effects, pages disagree. One post says there is no standalone music or effects generator, with ambience only inside multi-speaker scenes [/blog/higgsfield-audio]. The help center and a later post say Seed Audio makes music and effects [/creator-hub/help-center/ai-models/which-ai-model-should-i-use] [/blog/ai-music-video-real-artist-2026].
  - Agents: works in Claude through MCP (voiceover, voice change, dubbing) and in Cursor and CLI agents. Not in ChatGPT [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent].
  - The Higgsfield API has no standalone audio models [/creator-hub/help-center/integrations/what-is-the-higgsfield-api].
- Models: Seed Audio 1.0, Eleven v4, Eleven v4 Turbo, Eleven v3, Qwen Audio 3.0, MiniMax Speech 2.8 HD, Seed Speech. VibeVoice earlier [nav-menus.json] [/blog/higgsfield-audio].
- Credits and cost: same credit balance as video, no separate subscription. About $0.02 to $0.30 per 15 s depending on model [/blog/consistent-ai-voice-across-videos]. Five audio models (Seed Audio 1.0, Eleven v3, MiniMax Speech 2.8 HD, VibeVoice, Seed Speech) were in the All Unlimited offer [/blog/higgsfield-all-unlimited-explained] and the 24 h Unlimited MCP trial, which covered audio on web and Claude only [/blog/unlimited-mcp].
- Launched: Mar 2, 2026 (blog post date). Six-model guide Jul 31, 2026 (blog post date).
- Sources: [/audio] [/blog/higgsfield-audio-ai-voice-tools] [/blog/higgsfield-audio] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/creator-hub/help-center/ai-models/which-ai-model-should-i-use] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/creator-hub/help-center/integrations/what-is-the-higgsfield-api] [nav-menus.json]

### Text to speech (voiceover)
- What it does: makes a voice track from text. The nav calls it "Text to Speech" (route voiceMode=voiceover), and blogs call it Voiceover [nav-menus.json] [/audio?voiceMode=voiceover].
- How to use: 1. Choose Voiceover 2. Write the text and pick a model 3. Pick a preset or custom voice and click Generate [/blog/higgsfield-audio-ai-voice-tools].
- Inputs and settings: a full written script rather than a description of tone [/blog/higgsfield-audio]. Voice presets "40+" male and female, or 21 in the FAQ of the same post, plus up to 3 custom voices. Input in 70+ languages [/blog/higgsfield-audio-ai-voice-tools].
- Limits: typed scripts up to 500 characters per one listicle [/blog/best-ai-avatar-generators-talking-videos]. Eleven v4 allows 10,000 characters [/creator-hub/changelog].
- Models: any Audio model (see the model entries).
- Credits and cost: per model, starting below one credit [/blog/best-ai-avatar-generators-talking-videos].
- Launched: Mar 2, 2026 (blog post date).
- Sources: [/audio?voiceMode=voiceover] [/blog/higgsfield-audio-ai-voice-tools] [/blog/higgsfield-audio] [/blog/best-ai-avatar-generators-talking-videos] [nav-menus.json]

### Voice change
- What it does: swaps the voice in an existing video for a preset or custom voice without regenerating the picture [/blog/higgsfield-audio] [nav-menus.json].
- How to use: 1. Choose Change Voice 2. Add the video 3. Pick a preset or custom voice and Generate [/blog/higgsfield-audio-ai-voice-tools].
- Inputs and settings: 21 preset voices (e.g. "Roman", "Vesper") or a custom voice. The FAQ claims 70+ languages [/blog/higgsfield-audio-ai-voice-tools].
- Limits: available through MCP in Claude [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent].
- Models: not stated per mode.
- Credits and cost: not stated.
- Launched: Mar 2, 2026 (blog post date).
- Sources: [/audio?voiceMode=change-voice] [/blog/higgsfield-audio-ai-voice-tools] [/blog/higgsfield-audio] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios]

### Translate (video translation with lip sync)
- What it does: translates and re-voices a video's dialogue into another language, and lip-syncs the output (nav: "Translate and lip-sync your video") [nav-menus.json] [/blog/higgsfield-audio-ai-voice-tools].
- How to use: 1. Choose Translate 2. Add the video 3. Pick the language and Generate [/blog/higgsfield-audio-ai-voice-tools].
- Inputs and settings: language count, pages disagree. 10 at launch (English, Mandarin Chinese, French, Hindi, Italian, Japanese, Korean, Portuguese, Russian, Turkish), with Spanish, Arabic and German "coming" [/blog/higgsfield-audio-ai-voice-tools]. 18 languages later [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
- Limits: keep the face clearly visible throughout [/blog/higgsfield-audio-ai-voice-tools]. Later guides sync the translated track through Lipsync Studio as a separate step [/blog/ai-video-ad-localization]. Available as "video dubbing" in Claude through MCP.
- Models: not stated.
- Credits and cost: 45 credits ($2.25) for 15 s of translation plus voice track [/blog/ai-video-ad-localization].
- Launched: Mar 2, 2026 (blog post date).
- Sources: [/audio?voiceMode=translate] [/blog/higgsfield-audio-ai-voice-tools] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/ai-video-ad-localization]

### Custom voice and consistent AI voice
- What it does: clones a voice from a sample into a reusable, named voice, or saves an exact preset setup so a voice sounds the same across clips [/blog/consistent-ai-voice-across-videos].
- How to use:
  - Clone: 1. Voice Preset, then Add Voice (or Create custom voice), and name it 2. Upload or record a sample 3. Clone voice 4. Pick it like any other voice [/blog/higgsfield-audio-ai-voice-tools] [/blog/consistent-ai-voice-across-videos].
  - Preset: 1. Pick a Seed Audio preset 2. Set expression intensity, the mood slider (angry to happy), speed, pitch and volume 3. Turn on Save settings 4. Generate [/blog/consistent-ai-voice-across-videos].
- Inputs and settings: MP3 or WAV up to 11MB, or a live recording up to 2 minutes, with a sample script provided [/blog/consistent-ai-voice-across-videos]. Via MCP, a recording of 10 s to 3 min [/blog/talking-ai-avatar-inside-claude].
- Limits: up to 3 custom voices (Mar 2026) [/blog/higgsfield-audio-ai-voice-tools]. Clone only your own voice or one you have permission for [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios]. Changing model, preset or settings breaks consistency [/blog/consistent-ai-voice-across-videos].
- Models: Add Voice on "any of the five models" [/blog/consistent-ai-voice-across-videos]. The example uses MiniMax Speech 2.8 HD. Seed Audio also clones [/creator-hub/help-center/ai-models/which-ai-model-should-i-use].
- Credits and cost: 40 credits ($2.00) per clone [/blog/consistent-ai-voice-across-videos].
- Launched: cloning since Mar 2, 2026. Save settings guide Aug 7, 2026 (blog post dates).
- Sources: [/blog/consistent-ai-voice-across-videos] [/blog/higgsfield-audio-ai-voice-tools] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/talking-ai-avatar-inside-claude] [/blog/still-image-to-talking-video]

### Lipsync Studio
- What it does: makes a character talk. It animates an image (image-to-video) or re-syncs footage (video-to-video) to audio, and hosts several lipsync models in one place [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/lipsync-studio].
- How to use: 1. Video, then Lipsync Studio 2. Upload an image or video 3. Type Audio text and Generate Audio, or upload audio 4. Pick model, scene preset, duration and resolution 5. Generate [/lipsync-studio] [/blog/still-image-to-talking-video].
- Inputs and settings:
  - Page controls: image upload, Audio text, Generate Audio, Prompt, Model (default Wan 2.5 Fast), Duration (5s), Resolution (720p) [/lipsync-studio].
  - Scene templates: General, Selfie, Podcast, Car Talking and more. Veo 3 and Wan 2.5 Speak each have 15+ presets [/blog/100-plus-ad-variations-ai].
  - Model count, pages disagree:
    - Help lists 8: Google Veo 3.1, Kling 2.6 Lipsync (up to 1080p), Wan 2.5 Speak (480p to 1080p), Kling Avatars 2.0, Higgsfield Speak 2.0, Infinite Talk, Kling Lipsync (video to video), Sync Lipsync 3 (video to video, up to 4K) [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
    - Other counts: 7 [/blog/ai-video-ad-localization], 8 [/blog/higgsfield-vs-runway-2026], 10 [/blog/make-ai-lipsync-videos].
  - Languages: 18 or 18+ [/blog/still-image-to-talking-video], or 8+ in older listicles [/blog/best-ai-video-consistent-characters].
- Limits: clip length depends on the engine, from 8 s to 5 min [/blog/best-ai-avatar-generators-talking-videos]. Multi-speaker shots and clips over 30 s degrade [/blog/make-ai-lipsync-videos]. One post said there was no video-to-video dubbing [/blog/make-ai-lipsync-videos], but help lists video-to-video models. No batch button [/blog/100-plus-ad-variations-ai]. Works with Soul ID stills.
- Models: as listed above. Older lineups (Sep 2025) had Kling Speak, Kling Lipsync, InfiniteTalk, Veo 3 Fast, Sync Lipsync 2 Pro and Speak 2.0 [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot]. A Jun 2026 listicle names Kling 3.0 Lipsync and Veo 3.1 [/blog/best-ai-video-consistent-characters].
- Credits and cost:
  - Wan 2.5 Fast, 5 s 720p: Generate shows 9 [/lipsync-studio].
  - Wan 2.5 Speak, 10 s 1080p: 40 credits [/blog/still-image-to-talking-video].
  - Veo 3: 58 credits per 1080p clip [/blog/make-ai-lipsync-videos], or 58 at 720p for 10 s or 15 s [/blog/100-plus-ad-variations-ai] [/blog/ai-video-ad-localization].
  - 20 s performance shot: 67 credits [/blog/ai-music-video-real-artist-2026].
  - 10 s 1080p: 20 credits, and engines range from $0.50 to $9.65 [/blog/best-ai-avatar-generators-talking-videos].
  - Unlimited Kling Speak, Kling Lipsync and InfiniteTalk came with Photodump in Sep 2025.
- Launched: first seen Sep 18, 2025 (blog post date) [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot].
- Sources: [/lipsync-studio] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/still-image-to-talking-video] [/blog/make-ai-lipsync-videos] [/blog/ai-video-ad-localization] [/blog/100-plus-ad-variations-ai] [/blog/best-ai-avatar-generators-talking-videos] [/creator-hub/help-center/ai-models/how-do-i-use-kling]

### Higgsfield Speak 2.0
- What it does: Higgsfield's own image-to-video talking model in Lipsync Studio. Help notes it runs at "priority-queue speed" [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
- How to use: Lipsync Studio, then model Higgsfield Speak 2.0, then upload an image and audio, then Generate.
- Inputs and settings: one image plus audio or Audio text [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
- Limits: not stated.
- Models: Higgsfield Speak 2.0. An earlier "Speak" was used to "narrate" Soul images in Jun 2025 [/blog/Higgsfield-SOUL-Turns-Prompts-Into-Fashion-Ready-Shots].
- Credits and cost: not stated. It was in a free trial bundle in Sep 2025 [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot].
- Launched: Speak mentioned Jun 25, 2025, Speak 2.0 by Sep 18, 2025 (blog post dates).
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/lipsync-studio] [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] [/blog/Higgsfield-SOUL-Turns-Prompts-Into-Fashion-Ready-Shots] [/blog/ai-video-ad-localization]

### Recast
- What it does: character swap for any video, adding perfect A/V sync, background change, dubbing and voice cloning. Aimed at streamers, creators and marketers [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide].
- How to use: 1. Pick a character (your own reference or a preset) 2. Clone a voice from a clean audio clip, or pick a character voice 3. Pick a background or Green Screen 4. Generate [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide].
- Inputs and settings: 30+ character presets. Background presets: Cozy Minimalist, Pink Room, Luxury Masculine, Green Screen. Dubbing can also change the voice's gender while keeping tone. "Recast a Movie" places you into film scenes [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide].
- Limits: best with one person in frame, since the closest face is swapped. Keep the face clear and the hands empty, avoid fast motion, and match proportions [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide]. Missing from the current nav menus [nav-menus.json].
- Models: not stated. The post's tips target the "WAN 2.2 engine" for swaps (inferred link to Recast).
- Credits and cost: not stated.
- Launched: Nov 5, 2025 (blog post date).
- Sources: [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide]

### Native audio co-generation
- What it does: some video models make speech, lip sync, effects and ambience in the same pass as the picture, instead of dubbing afterward [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
- How to use: generate with a supporting model. Cinema Studio does native audio in all versions [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios]. Through MCP, Seedance 2.5 renders talking clips from a start frame, an audio file and a prompt [/blog/talking-ai-avatar-inside-claude].
- Inputs and settings: varies by model.
- Limits: help contrasts it with Lipsync Studio, which adds a mouth to existing media after the fact.
- Models: Seedance 2.5, Kling 3.0, Seedance 2.0, Flux 3, MiniMax Hailuo 3.0, Wan 2.5 [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
- Credits and cost: per video model. Not stated here.
- Launched: not stated.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/talking-ai-avatar-inside-claude] [/blog/higgsfield-audio]

### Seed Audio 1.0
- What it does: multi-speaker scenes with speech and ambience generated together [nav-menus.json] [/blog/higgsfield-audio]. Help calls it all-in-one: dialogue, emotional delivery, ambience, music and effects from one prompt, plus TTS, cloning and dubbing [/creator-hub/help-center/ai-models/which-ai-model-should-i-use].
- How to use: Audio, then Text to Speech, then select Seed Audio 1.0 (audioModel=seed_audio). Write the prompt and use @ for attachments [/blog/higgsfield-audio].
- Inputs and settings: 50+ voice presets. Sample rate 8,000 to 48,000 Hz (default 24,000). Speed 0.5 and volume 1.0 by default. Output mp3, wav (default) or opus. Expression, mood, pitch, and a Save settings toggle [/blog/higgsfield-audio] [/blog/consistent-ai-voice-across-videos].
- Limits: available in MCP and the Adobe Premiere and DaVinci Resolve plugins [/creator-hub/help-center/ai-models/which-ai-model-should-i-use]. Music: see the disagreement under Higgsfield Audio.
- Models: vendor not stated (ByteDance Seed, inferred).
- Credits and cost: pages disagree.
  - 5.7 credits per 15 s ($0.30) [/blog/consistent-ai-voice-across-videos].
  - 1.2 credits per 10 s [/blog/still-image-to-talking-video].
  - 1.5 credits per 20 s [/blog/ai-music-video-real-artist-2026].
  - 12 credits for 10 s as MP3 [/blog/generate-voice-edit-ai-video-one-place].
  - About 6 credits per 30 s [/blog/ai-short-film-pipeline].
  - About 1 credit per 10 s via MCP [/blog/talking-ai-avatar-inside-claude].
  - Was in All Unlimited (Jul 2026) [/blog/higgsfield-all-unlimited-explained].
- Launched: by Jul 22, 2026 (blog post date) [/blog/higgsfield-all-unlimited-explained]. Not in the Mar 2 launch lineup.
- Sources: [/audio?voiceMode=voiceover&audioModel=seed_audio] [/blog/higgsfield-audio] [/blog/consistent-ai-voice-across-videos] [/creator-hub/help-center/ai-models/which-ai-model-should-i-use] [/blog/ai-music-video-real-artist-2026] [/blog/start-faceless-channel-with-ai]

### Eleven v4
- What it does: ElevenLabs' new TTS model. Adapts delivery to the text (dramatic, soft, urgent, humorous) while keeping the voice consistent [/creator-hub/changelog].
- How to use: Audio, then the model selector, then Eleven v4 [/creator-hub/changelog].
- Inputs and settings: several speakers in one generation. Follows tags and delivery prompts more closely than earlier ElevenLabs models. Stability and similarity controls [/creator-hub/changelog] [nav-menus.json].
- Limits: 90+ languages, up to 10,000 characters per generation [/creator-hub/changelog].
- Models: Eleven v4 (ElevenLabs).
- Credits and cost: not stated.
- Launched: Sep 28, 2026 (changelog). Tagged "NEW" in the nav.
- Sources: [/creator-hub/changelog] [/audio?voiceMode=voiceover&audioModel=elevenlabs_v4] [nav-menus.json]

### Eleven v4 Turbo
- What it does: fast, expressive speech with stability and similarity controls [nav-menus.json].
- How to use: Audio, then Text to Speech, then Eleven v4 Turbo (audioModel=elevenlabs_v4_turbo).
- Inputs and settings: stability and similarity [nav-menus.json].
- Limits: not stated.
- Models: ElevenLabs (inferred from name).
- Credits and cost: not stated.
- Launched: not stated. Tagged "NEW" in the nav.
- Sources: [/audio?voiceMode=voiceover&audioModel=elevenlabs_v4_turbo] [nav-menus.json]

### Eleven v3
- What it does: controls emotion and delivery through inline tags (sarcasm, hesitation, urgency, warmth) [/blog/higgsfield-audio] [nav-menus.json].
- How to use: Audio, then Text to Speech, then Eleven v3 (audioModel=elevenlabs). Add inline emotion tags to the script.
- Inputs and settings: inline emotion tags, delivery style, voice selection [/blog/higgsfield-audio].
- Limits: check that tags produce the intended tone [/blog/higgsfield-audio].
- Models: ElevenLabs Eleven v3.
- Credits and cost: 2.55 credits ($0.15) per 15 s [/blog/consistent-ai-voice-across-videos]. Was in All Unlimited [/blog/higgsfield-all-unlimited-explained].
- Launched: in the Mar 2, 2026 launch lineup (blog post date).
- Sources: [/audio?voiceMode=voiceover&audioModel=elevenlabs] [/blog/higgsfield-audio] [/blog/higgsfield-audio-ai-voice-tools] [/blog/consistent-ai-voice-across-videos]

### Qwen Audio 3.0
- What it does: general natural speech, with voice, style and emotion controlled together. The suggested default [/blog/higgsfield-audio].
- How to use: Audio, then Text to Speech, then Qwen Audio 3.0 (audioModel=qwen_audio).
- Inputs and settings: auto-detects 13+ languages. Voice preset. Numeric speed, volume and seed. Output mp3 (default), wav or opus. 8,000 to 48,000 Hz, default 24,000 [/blog/higgsfield-audio].
- Limits: not in the All Unlimited audio list.
- Models: Qwen (vendor not stated, Alibaba inferred).
- Credits and cost: 0.37 credits ($0.02) per 15 s, the cheapest listed [/blog/consistent-ai-voice-across-videos].
- Launched: by Jul 31, 2026 (blog post date).
- Sources: [/audio?voiceMode=voiceover&audioModel=qwen_audio] [/blog/higgsfield-audio] [/blog/consistent-ai-voice-across-videos] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios]

### MiniMax Speech 2.8 HD
- What it does: high-fidelity narration in a single voice, for voiceovers and presentations where audio carries the piece [/blog/higgsfield-audio].
- How to use: Audio, then Text to Speech, then MiniMax Speech 2.8 HD (audioModel=minimax). Create Custom Voice clones from here [/blog/consistent-ai-voice-across-videos].
- Inputs and settings: voice selection, fidelity and quality tier [/blog/higgsfield-audio].
- Limits: one voice per generation.
- Models: MiniMax (inferred from name).
- Credits and cost: 2.55 credits ($0.15) per 15 s [/blog/consistent-ai-voice-across-videos]. Was in All Unlimited [/blog/higgsfield-all-unlimited-explained].
- Launched: in the Mar 2, 2026 launch lineup (blog post date).
- Sources: [/audio?voiceMode=voiceover&audioModel=minimax] [/blog/higgsfield-audio] [/blog/consistent-ai-voice-across-videos] [/blog/higgsfield-audio-ai-voice-tools]

### Seed Speech
- What it does: ByteDance's multilingual TTS, covering 30+ languages from one script [/blog/start-faceless-channel-with-ai] [nav-menus.json].
- How to use: Audio, then Text to Speech, then Seed Speech (audioModel=seed_speech). Pick language and voice.
- Inputs and settings: language and voice selection [/blog/higgsfield-audio].
- Limits: not stated.
- Models: ByteDance Seed Speech.
- Credits and cost: 1.7 credits ($0.10) per 15 s [/blog/consistent-ai-voice-across-videos]. Was in All Unlimited [/blog/higgsfield-all-unlimited-explained].
- Launched: by Jul 22, 2026 (blog post date).
- Sources: [/audio?voiceMode=voiceover&audioModel=seed_speech] [/blog/higgsfield-audio] [/blog/start-faceless-channel-with-ai] [/blog/consistent-ai-voice-across-videos]

### VibeVoice
- What it does: long-form narration for audiobooks and podcasts that stays natural over 10 to 20 minutes [/blog/higgsfield-audio].
- How to use: Audio, then Voiceover, then VibeVoice.
- Inputs and settings: voice selection, narration pacing, long-form consistency controls [/blog/higgsfield-audio].
- Limits: missing from the current Audio nav menu (possibly retired) [nav-menus.json].
- Models: vendor not stated (Microsoft, inferred).
- Credits and cost: not stated. Was in All Unlimited [/blog/higgsfield-all-unlimited-explained].
- Launched: in the Mar 2, 2026 launch lineup (blog post date).
- Sources: [/blog/higgsfield-audio] [/blog/higgsfield-audio-ai-voice-tools] [/blog/start-faceless-channel-with-ai] [/blog/higgsfield-all-unlimited-explained]

## Image models

### GPT Image 2
- What it does: OpenAI image model and the preselected model behind the nav's Create Image link; the home page pitches it as "4K images with near-perfect text rendering" [/ai/image?model=gpt_image_2] [/].
- How to use: Image → GPT Image 2 → prompt or reference → set aspect, quality, resolution → Generate.
- Inputs and settings: composer defaults Auto (aspect), High (quality), 2K, batch 1/4 [/ai/image?model=gpt_image_2]. The help center sends readable text and true-color accuracy to the GPT Image family [/creator-hub/help-center/ai-models/which-ai-model-should-i-use].
- Limits: inside Unlimited windows it is capped at 2K, High [/blog/higgsfield-all-unlimited-explained].
- Models: GPT Image 2 (OpenAI). Higgsfield uses it for product sheets, edits, schematic maps and final clean sheets in its film prompt libraries [/blog/cinematic_headphones] [/blog/case4k], and for restoration [/blog/restore-old-photos-ai].
- Credits and cost: the Generate button shows "8.5 6.5" at High/2K, likely a list price and a discounted price (inferred) [/ai/image?model=gpt_image_2]. The restoration guide gives 2K at 7 credits ($0.35) and 4K at 12 ($0.60) [/blog/restore-old-photos-ai]. Marketplace Unlimited for 1 day at 2K cost $20 (Jul 2026) [/blog/higgsfield-all-unlimited-explained]. Part of the All Unlimited and Unlimited MCP lists [/blog/unlimited-mcp].
- Launched: no launch post; the earliest mention is Jun 14, 2026 (blog post date) [/blog/cinematic].
- Sources: [/ai/image?model=gpt_image_2] [/] [/blog/restore-old-photos-ai] [/blog/higgsfield-all-unlimited-explained] [/blog/cinematic_headphones]

### GPT Image 2.5 (Flare and Sunburst)
- What it does: OpenAI's next image model, shipped as two variants with identical settings and pricing [/blog/gpt-image-2-5-higgsfield]:
  - Flare ("stunning everyday images, fast"): the default pick, higher quality than GPT Image 2 at about 50% less latency
  - Sunburst ("exceptional quality, precise edits"): slower, for production campaigns and multi-step edits (nav menu)
- How to use: 1. Open the image generator, pick Flare or Sunburst 2. Add up to 16 references 3. Prompt 4. Set resolution and quality 5. Generate [/blog/gpt-image-2-5-higgsfield].
- Inputs and settings: up to 16 reference images; aspect Auto plus supported ratios; quality Low, Medium, High, Extra High, Max; resolution 1K, 2K, 4K.
- Claims: edits change only what was asked; stacked multi-step edits do not degrade; lighting and camera choices carry between generations.
- Limits: not stated. The /ai/image?model=gpt-image-2-5-* captures came back empty.
- Models: GPT Image 2.5 Flare, GPT Image 2.5 Sunburst (OpenAI).
- Credits and cost: same for both: 1K Low 1.5 credits ($0.075); 2K High 5.5 ($0.275); 4K Max 26.5 ($1.325).
- Launched: Sep 8, 2026 (blog post date); also a changelog title "GPT Image 2.5. Now on Higgsfield" with no date [/creator-hub/changelog].
- Sources: [/blog/gpt-image-2-5-higgsfield] [/ai/image?model=gpt-image-2-5-flare] [/ai/image?model=gpt-image-2-5-sunburst] [/creator-hub/changelog]

### GPT Image 1.5
- What it does: OpenAI model tuned for structured, logic-driven images: infographics, diagrams, concept layouts. The launch post calls it by the codename "Hazelnut" throughout [/blog/GPT-Image-1.5-by-OpenAI-is-on-Higgsfield-A-Complete-Guide].
- How to use: 1. Image → find Hazelnut / GPT Image 1.5 2. Choose multimodal or text-only 3. Optionally upload 5 to 6 references 4. Write a structured prompt 5. Pick quality 6. Pick aspect 7. Generate.
- Inputs and settings: up to 1.5K; quality Low / Medium / High; aspect 1:1, 2:3, 3:2; references: "up to 5–6 recommended".
- Limits: positioned as moderate quality, not high-fidelity art.
- Models: GPT Image 1.5. Plan cards list a "GPT Image" model with 365-day Unlimited, and Unlimited lists show "GPT Image (High)"; both are likely this model (inferred) [/apps/character-swap] [/blog/higgsfield-all-unlimited-explained].
- Credits and cost: "GPT Image" is 365-day Unlimited on Plus and Ultra plan cards [/apps/character-swap] [/blog/annual-unlimited-ai-video-plans].
- Launched: Dec 8, 2025 (blog post date).
- Sources: [/blog/GPT-Image-1.5-by-OpenAI-is-on-Higgsfield-A-Complete-Guide] [/apps/character-swap] [/blog/higgsfield-all-unlimited-explained]

### Nano Banana
- What it does: the original Google model. It edits an existing image by short instruction (swap a background, change clothing, insert text) and keeps characters consistent [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana].
- How to use: 1. Image → Nano Banana 2. Upload or create a base image 3. Write a short instruction 4. Add references with a role for each 5. Generate.
- Inputs and settings: up to 8 reference images.
- Limits: Google is shutting the original down in its API on Oct 2, 2026 [/blog/unlimited-nano-banana-2-plans]; its status on Higgsfield after that date is not stated.
- Models: Nano Banana (Google).
- Credits and cost: 365-day Unlimited on Plus and Ultra [/apps/character-swap] [/blog/unlimited-nano-banana-2-plans].
- Launched: not stated.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana] [/blog/unlimited-nano-banana-2-plans] [/apps/character-swap]

### Nano Banana 2
- What it does: Gemini 3.1 Flash Image. Pro-level quality at Flash speed, with web grounding, better text and localization, and multi-subject consistency; Higgsfield's pick for fast bulk work [/blog/Nano-Banana-2-Gemini-3.1-Flash-AI-Image-Generation] [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana].
- How to use: Image → Nano Banana 2 → Text-to-Image, Multi-reference or Image-to-Image → prompt → resolution and aspect → Generate [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana].
- Inputs and settings: up to 14 references; up to 5 consistent characters plus 14 stable objects; resolution up to native 4K; multiple aspect ratios.
- Limits: Unlimited windows run at up to 2K; 4K needs credits [/blog/unlimited-nano-banana-2-plans]. Default image model in all plugins [/creator-hub/help-center/integrations/external-integrations-higgsfield].
- Models: Nano Banana 2 (Google, Gemini 3.1 Flash Image).
- Credits and cost: 2 credits (about $0.10) at 1K or 2K, 4 credits at 4K, in Credit Mode. Plus and Ultra include one 7-day 2K Unlimited window per plan purchase. Edits in the separate Edit tool cost 1.5 credits even while Unlimited is on [/blog/unlimited-nano-banana-2-plans]. Plan cards: Plus and Ultra "Nano Banana 2 2K Unlimited"; Starter has none [/apps/character-swap].
- Launched: Feb 25, 2026 (blog post date).
- Sources: [/blog/Nano-Banana-2-Gemini-3.1-Flash-AI-Image-Generation] [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana] [/blog/unlimited-nano-banana-2-plans]

### Nano Banana 2 Lite
- What it does: the fastest Nano Banana tier, for high-volume drafts and batches (about 4 seconds per image) [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana].
- How to use: Image → Nano Banana 2 Lite → pick aspect ratio and Thinking level → Generate; rerun finals on Nano Banana 2 or Pro.
- Inputs and settings: 1K only (no resolution picker); Thinking level High or Minimal; up to 14 references.
- Limits: 1K cap.
- Models: Nano Banana 2 Lite (Google).
- Credits and cost: not stated on Higgsfield; Google's API rate is $0.0336 at 1K [/blog/unlimited-nano-banana-2-plans].
- Launched: not stated (present in Aug 2, 2026 help).
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana] [/blog/unlimited-nano-banana-2-plans]

### Nano Banana 2.1
- What it does: Google's update to Nano Banana 2, at the same speed. Per Google it improves quality, prompt adherence, consistency across edits and text rendering [/creator-hub/changelog].
- How to use: Image → model selector → Nano Banana 2.1.
- Inputs and settings: up to 14 references, with consistency for up to 4 characters and 10 objects; text edits by description (e.g. "change shirt color"); resolution 1K default, 2K, 4K; fixed tiling artifacts on 1:4, 4:1, 1:8 and 8:1 at 2K/4K [/creator-hub/changelog]. Composer defaults: 3:4, 1K, Medium, batch 1/4 [/ai/image?model=nano-banana-2-1].
- Limits: not stated.
- Models: Nano Banana 2.1 (Google).
- Credits and cost: Generate 1.5 at the 1K default [/ai/image?model=nano-banana-2-1].
- Launched: Oct 6, 2026 (changelog). Nav label: "Google's next-gen flagship image model", with a New badge (nav menu).
- Sources: [/creator-hub/changelog] [/ai/image?model=nano-banana-2-1]

### Nano Banana Pro
- What it does: Gemini 3 Pro Image. A reasoning core plans the scene (counts, layout, text, faces, perspective) before rendering, up to native 4K. Nav label: "Best 4K image model ever" (Top badge) [/blog/Nano-Banana-Pro-is-Here-Full-Review-and-Guide] [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana].
- How to use: Image → Nano Banana Pro → input mode → specific prompt (exact text in quotes) → up to 14 references with roles → 1K to iterate, then 2K or 4K → Generate [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana].
- Inputs and settings: modes Text-to-Image, Multi-reference, Image-to-Image; up to 14 references; 1K / 2K / 4K; composer defaults 3:4, 1K, batch 1/4, plus a Draw toggle [/ai/image?model=nano-banana-pro]. Supports multi-image fusion, pose control and object-level edits [/blog/soul-2-vs-nano-banana-pro].
- Limits: face identity drifts over long series without Soul ID [/blog/soul-2-vs-nano-banana-pro]. References must be JPG, PNG or WebP. If 2K/4K looks blurry, retry or upscale [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana]. The Unlimited window is 2K only.
- Models: Nano Banana Pro (Google). It also powers Nano Banana Pro Inpaint and restoration [/blog/Top-Editing-Tool-in-2025-Nano-Banana-Pro-Inpaint] [/blog/restore-old-photos-ai].
- Credits and cost: Generate 2 at 1K [/ai/image?model=nano-banana-pro]; 2K 2 credits ($0.10), 4K 4 credits ($0.20) [/blog/soul-2-vs-nano-banana-pro]. Starter's 270 credits equal "135 Nano Banana Pro generations" [/apps/character-swap]. A 7-day 2K Unlimited window comes with Ultra only. Marketplace windows: 2K $5 / $12 / $23 and 4K $7 / $16 / $32 for 1 / 3 / 7 days [/blog/unlimited-nano-banana-2-plans].
- Launched: Nov 18, 2025 (blog post date).
- Sources: [/blog/Nano-Banana-Pro-is-Here-Full-Review-and-Guide] [/blog/How-Nano-Banana-Pro-Changing-The-Game] [/blog/Nano-Banana-Pro-Expert-Use-Cases] [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana] [/blog/soul-2-vs-nano-banana-pro] [/blog/unlimited-nano-banana-2-plans]

### Seedream 5.0 Pro
- What it does: ByteDance's precision model ("logically consistent images with intelligent visual reasoning", nav menu). It handles infographics in one pass, point-level edits, group shots from several reference photos with unified lighting, and multilingual native text [/blog/best-platforms-seedream-5].
- How to use: Create → Image → Seedream 5.0 Pro → prompt plus references → Generate → optionally Turn to Video into Seedance 2.0, Kling 3.0, Veo 3.1, WAN 2.7, MiniMax Hailuo 2.3 and others [/blog/photo-to-ai-video].
- Inputs and settings: up to 10 references; native text in 15 languages per one post [/blog/best-platforms-seedream-5], "10+" per another [/blog/best-ai-image-generators-2026]; 2K output is 1760x2352; composer defaults 2K, Auto, batch 1/4 [/ai/image?model=seedream_v5_pro].
- Limits: Unlimited lists cap it at 2K [/blog/new-unlimited-more-models].
- Models: Seedream 5.0 Pro (ByteDance).
- Credits and cost: 2K = 3 credits [/blog/photo-to-ai-video]; about $0.09 per 2K image [/blog/best-ai-image-generators-2026]; about 7 generations per dollar at 2K [/blog/best-platforms-seedream-5].
- Launched: no launch post; first mentioned Jul 19, 2026 (blog post date) [/blog/best-platforms-seedream-5].
- Sources: [/ai/image?model=seedream_v5_pro] [/blog/best-platforms-seedream-5] [/blog/photo-to-ai-video] [/blog/best-ai-image-generators-2026]

### Seedream 5.0 Lite
- What it does: ByteDance's context-aware model. It reads intent behind short prompts, uses real-time web search for current events, does generation and editing in one model, and lays out bilingual English/Chinese text [/blog/Seedream-5.0-Lite-Review-How-to-Comparison].
- How to use: 1. Create Image 2. Select Seedream 5.0 3. Choose text-to-image, multi-reference or image editing 4. Generate.
- Inputs and settings: up to 14 references [/blog/best-platforms-seedream-5]; brush/mask selection for local edits; native 2K/4K output (post description).
- Limits: not stated.
- Models: Seedream 5.0 Lite (ByteDance).
- Credits and cost: Unlimited at 2K and 3K on Plus, Ultra and Business [/blog/best-platforms-seedream-5]. Plan cards show "Seedream 5.0 Lite 365 Unlimited", including on Starter [/apps/character-swap].
- Launched: Feb 23, 2026 (blog post date).
- Sources: [/blog/Seedream-5.0-Lite-Review-How-to-Comparison] [/blog/best-platforms-seedream-5] [/apps/character-swap]

### Seedream 5.0 Flash
- What it does: not stated; only a changelog title exists.
- How to use / Inputs and settings / Limits: not stated.
- Models: Seedream 5.0 Flash (ByteDance).
- Credits and cost: not stated.
- Launched: undated changelog entry. Its place in the list (newer than GPT Image 2.5, older than the Sep 24, 2026 entries) puts it between about Sep 8 and Sep 24, 2026 (inferred) [/creator-hub/changelog].
- Sources: [/creator-hub/changelog]

### Seedream 4.5
- What it does: the previous Seedream generation. It is instruction-based with better keyword adherence and spatial awareness than 4.0, but has no dedicated reasoning layer [/blog/Seedream-5.0-Lite-Review-How-to-Comparison].
- How to use: Image → Seedream 4.5. Also reachable from Claude through MCP [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP].
- Inputs and settings: not stated beyond the comparison.
- Limits: 2K in Unlimited lists [/blog/new-unlimited-more-models].
- Models: Seedream 4.5 (ByteDance).
- Credits and cost: 365-day Unlimited on Plus; "Seedream 4.5 4K 365 Unlimited" on Ultra [/apps/character-swap].
- Launched: not stated; earliest mention Feb 17, 2026 (blog post date) [/blog/cinema-studio-guide].
- Sources: [/blog/Seedream-5.0-Lite-Review-How-to-Comparison] [/apps/character-swap] [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP]

### FLUX 3 Image
- What it does: Black Forest Labs' image model from the multimodal FLUX 3 family. Per BFL it follows complex prompts more closely, renders multilingual text better and edits more precisely [/creator-hub/changelog].
- How to use: Image → model selector → FLUX 3 Image.
- Inputs and settings: text-to-image and image-to-image; styles photo, illustration, poster, collage, editorial; resolution 768p, 1K, 1.5K, 2K or 4K, with native rendering at 2K and 4K.
- Limits: not stated (the composer capture was empty) [/ai/image?model=flux-3-image].
- Models: FLUX 3 Image (Black Forest Labs). The Aug 2026 FLUX 3 post had said only Video was live, with Image still to roll out [/blog/flux-3-higgsfield].
- Credits and cost: not stated.
- Launched: Oct 1, 2026 (changelog).
- Sources: [/creator-hub/changelog] [/ai/image?model=flux-3-image] [/blog/flux-3-higgsfield]

### FLUX.2 (Pro)
- What it does: BFL image model (nav: "Speed-optimized detail"); the help center routes speed-optimized detail to the FLUX family, and Supercomputer uses "Flux for detail" [/creator-hub/help-center/ai-models/which-ai-model-should-i-use] [/blog/agentic-ai-for-content-creation].
- How to use: Image → FLUX.2 (the composer labels it FLUX.2 Pro) → prompt → Generate.
- Inputs and settings: composer defaults 3:4, 1K, batch 1/4 [/ai/image?model=flux_2].
- Limits: plan Unlimited covers 1K only ("Flux.2 Pro (1K)"); All Unlimited caps it at 2K [/apps/character-swap] [/blog/higgsfield-all-unlimited-explained].
- Models: FLUX.2 Pro (Black Forest Labs). Image-only; it never generated video [/blog/flux-3-higgsfield]. Brand teams use it in production (Fantasmagorie, with Nano Banana Pro and GPT Image 2) [/creator-hub/case-studies/fantasmagorie-adopt-dont-touch-my-mini-higgsfield].
- Credits and cost: 365-day Unlimited at 1K on plan cards (shown on Starter, Plus and Ultra) [/apps/character-swap].
- Launched: not stated; already on Higgsfield by Dec 1, 2025 (blog post date) [/blog/Z-Image-New-from-Alibaba-in-AI-Image-Generation].
- Sources: [/ai/image?model=flux_2] [/apps/character-swap] [/blog/higgsfield-all-unlimited-explained] [/blog/flux-3-higgsfield]

### Recraft V4 (V4.1, Styles, Utility)
- What it does: design-focused image family (photoreal, illustration, typography, 3D, product) with strong art-direction control. It arrived as three models [/blog/recraft-v4-higgsfield]:
  - V4.1: exploration and concepts (nav: "Photorealistic and expressive image generation")
  - Styles: match an existing look from references
  - Utility: simple, controlled product shots and mockups
- How to use: 1. Image → pick the Recraft model 2. V4.1: prompt, Standard or Pro, optional Soul HEX color 3. Styles: upload 1 to 10 references, Precise or Flexible, 1K or 2K, then prompt 4. Utility: prompt 5. Generate and iterate.
- Inputs and settings: V4.1 and Utility offer Standard/Pro, raster or vector output, and Soul HEX palettes (from a reference image or 50+ presets). Styles offers 1 to 10 references, Precise/Flexible matching and 1K/2K, with no color settings. The V4.1 composer shows Vector mode, Standard, 1:1, 1/4 and Color transfer [/ai/image?model=recraft-v4-1].
- Limits: not stated.
- Models: Recraft V4.1, Recraft Styles, Recraft Utility (Recraft). The API lists "Recraft 4.1" [/blog/generate-ai-videos-higgsfield-api].
- Credits and cost: V4.1 and Utility: Standard 1.25 credits ($0.06), Standard vector 2.5 ($0.13), Pro 8 ($0.40), Pro vector 10 ($0.50). Styles: 1K 0.75 ($0.04), 2K 1.75 ($0.09) (Aug 2026) [/blog/recraft-v4-higgsfield]. Another post prices V4.1 at "4K" for 4 credits ($0.20) [/blog/generate-voice-edit-ai-video-one-place]. API: $0.035/image.
- Launched: Aug 26, 2026 (blog post date); also the undated changelog title "Recraft V4. Now on Higgsfield" [/creator-hub/changelog].
- Sources: [/blog/recraft-v4-higgsfield] [/ai/image?model=recraft-v4-1] [/blog/generate-ai-videos-higgsfield-api] [/blog/generate-voice-edit-ai-video-one-place]

### Grok Imagine 2.0 (image)
- What it does: xAI image model, "High-resolution image generation by xAI" (nav menu).
- How to use: Image → Grok Imagine 2.0 → prompt → Generate.
- Inputs and settings: composer defaults Medium (quality), 1K, Auto (aspect), batch 1/4 [/ai/image?model=grok-image-2-0].
- Limits: not stated.
- Models: Grok Imagine 2.0 (xAI). Not to be confused with Grok Imagine Video 1.5 (see Video models).
- Credits and cost: not shown on the web capture; API $0.06/image [/blog/generate-ai-videos-higgsfield-api].
- Launched: not stated; first seen in the Sep 16, 2026 API post (blog post date).
- Sources: [/ai/image?model=grok-image-2-0] [/blog/generate-ai-videos-higgsfield-api]

### Z-Image
- What it does: Alibaba's lightweight open-source text-to-image model for fast drafts (nav: "Instant lifelike portraits"); often 1 to 3 seconds per image [/blog/Z-Image-New-from-Alibaba-in-AI-Image-Generation].
- How to use: Create Image → Z-Image → concise prompt → optional face, outfit or moodboard images → pick format → Generate, then send on to video or enhancement tools.
- Inputs and settings: composer defaults 3:4, batch 1/4 [/ai/image?model=z-image]; optional reference images.
- Limits: pitched as "uncensored" with less model-side filtering, while Higgsfield's platform safety rules still apply [/blog/Z-Image-New-from-Alibaba-in-AI-Image-Generation].
- Models: Z-Image (Alibaba), open-source per the post. Also selectable in the Blender plugin ("Z Image") [/blog/higgsfield-blender-plugin].
- Credits and cost: Generate 0.15 at defaults [/ai/image?model=z-image].
- Launched: Dec 1, 2025 (blog post date).
- Sources: [/blog/Z-Image-New-from-Alibaba-in-AI-Image-Generation] [/ai/image?model=z-image]

### Ideogram 4.5
- What it does: an image model built for repeated editing; per Ideogram, colors, textures and details hold across edits [/creator-hub/changelog].
- How to use: Image → model selector → Ideogram 4.5.
- Inputs and settings: transfer style or elements from up to 4 references; replace or translate text while keeping the layout; add "transparent background" to the prompt for no background; 1K or 2K.
- Limits: 2K max.
- Models: Ideogram 4.5 (Ideogram), listed under Image Models in the site footer [/apps/relight]. The API catalog lists Ideogram 4.0 at $0.06/image [/blog/generate-ai-videos-higgsfield-api].
- Credits and cost: not stated for web.
- Launched: Sep 30, 2026 (changelog).
- Sources: [/creator-hub/changelog] [/apps/relight] [/blog/generate-ai-videos-higgsfield-api]

### Kling O1 Image
- What it does: Kuaishou's image model; one post credits it with "its own distinct look" [/blog/unlimited-mcp].
- How to use / Inputs and settings: not stated.
- Limits: 2K in Unlimited lists [/blog/new-unlimited-more-models].
- Models: Kling O1 Image (Kling). For the video model, see Kling O1 (Video and Video Edit).
- Credits and cost: 365-day Unlimited on Plus and Ultra [/apps/character-swap] [/blog/unlimited-nano-banana-2-plans].
- Launched: not stated; earliest mention Jul 22, 2026 (blog post date) [/blog/free-unlimited-ai-video-generation-2026].
- Sources: [/apps/character-swap] [/blog/unlimited-mcp] [/blog/unlimited-nano-banana-2-plans]

### Qwen Image 3 (API only)
- What it does: an image model in the Higgsfield API catalog. The API catalog is curated separately and can differ from higgsfield.ai [/blog/generate-ai-videos-higgsfield-api].
- How to use: API request with its model identifier.
- Inputs and settings / Limits: not stated; not seen on the web composer.
- Models: Qwen Image 3 (Alibaba Qwen).
- Credits and cost: $0.03/image (API).
- Launched: listed in the Sep 16, 2026 API post (blog post date).
- Sources: [/blog/generate-ai-videos-higgsfield-api]

### Legacy image models linked in the site footer
- What it does: older entries in the "Explore more AI features" footer: Seedream 4.0, Flux Kontext, Wan 2.2 Image, GPT Image, Topaz, plus features "Banana Placement", "Multi Reference" and "Edit Image" [/apps/face-swap] [/].
- How to use / settings / limits: not stated. Flux Kontext is named as a reference/edit-based consistency tool next to Nano Banana Pro [/blog/Why-Does-Your-AI-Characters-Face-Keep-Changing].
- Models: Seedream 4.0 (ByteDance), Flux Kontext (Black Forest Labs), Wan 2.2 Image (Alibaba).
- Credits and cost: not stated. Launched: not stated.
- Sources: [/apps/face-swap] [/] [/blog/Why-Does-Your-AI-Characters-Face-Keep-Changing]

## Video models

### Seedance 2.5
- What it does: ByteDance's flagship video model and the top pick in the Video nav ("Create cinematic videos up to 30 seconds"). It makes long single takes with audio in the same pass, uses up to 50 references and supports region-level fixes. Cinema Studio 4.0 runs on it [/creator-hub/help-center/tools/how-do-i-use-cinema-studio].
- How to use: 1. Upload references first 2. Set era, genre, lighting and physics 3. Set camera body, lens and emotional tone 4. Write a short action-focused prompt 5. Generate [/blog/seedance-2-5-on-higgsfield-2026]. The prompting guide recommends labelled sections: global style, scene, characters, location, first frame and blocking, numbered shots, optics and camera, physics, lighting, audio [/blog/seedance-2-5-prompting-guide].
- Inputs and settings:
  - Clips run 4 to 30 s, in any ratio from 9:16 to 21:9.
  - References: up to 50 per generation (30 images, 10 videos, 10 audio) [/creator-hub/help-center/ai-models/how-do-i-use-seedance].
  - Selectors: era (1960s to 2020s), genre, lighting, physics, lens and body, emotional control, montage cuts and pacing, Soul Hex Engine color lock.
  - Motion tools: motion control (camera path), R2V motion guidance, region edit, shot re-generate, Draw to Video, Extend, Transition, Reverse, web 3D scene builder [/blog/seedance-2-5-on-higgsfield-2026]. Many of these overlap with Cinema Studio 4.0 (inferred).
  - Video-to-video needs at least 4 s of input [/blog/ai-vs-vfx].
- Limits:
  - Resolution sources disagree. Native 480p, 720p or 1080p with 4K by upscaling [/blog/seedance-2-5-on-higgsfield-2026] [/blog/best-5-platforms-seedance-2-5-2026]. Native up to 1080p [/blog/seedance-2-5-prompting-guide]. 480p and 720p only [/blog/seedance-2-5-pricing-2026]. "Native 4K output" in a pre-launch post [/blog/seedance-4k-unlimited-11-days]. Up to 1080p on Pro and Plus plans and above [/creator-hub/help-center/ai-models/how-do-i-use-seedance].
  - Plan gate: not on Starter or Basic. The help says Pro and Plus and up [/creator-hub/help-center/ai-models/how-do-i-use-seedance]. The pricing blog says the entry is the $49 plan with 1,000 credits [/blog/seedance-2-5-pricing-2026].
  - Available in Canvas, MCP, CLI and Supercomputer, always on credits [/creator-hub/help-center/ai-models/how-do-i-use-seedance].
  - A provider-side issue delayed 2.5 generations (resolved Sep 30, 2026). Draft Mode failures were resolved Oct 3, 2026 [/creator-hub/changelog].
- Models: Seedance 2.5. Seedance 2.5 Draft Mode is a variant named in a changelog title and in the Oct 3 incident. Its details were not captured, but it is probably a cheaper draft tier (inferred).
- Credits and cost:
  - 10 s clips: 480p 30, 720p 70, 1080p 120 credits [/blog/seedance-2-5-on-higgsfield-2026].
  - 8 s clips: 480p 24, 720p 52 credits ($2.55) [/blog/seedance-2-5-pricing-2026]; 1080p 72 credits [/blog/credits-vs-unlimited-ai-video-generation].
  - Other figures: 10 s at 1080p for 90 credits [/blog/generate-voice-edit-ai-video-one-place]; 5 s with audio for 33 credits [/blog/best-affordable-ai-video-generators]; a 30 s take via ChatGPT for 540 credits [/blog/generate-ai-videos-from-chatgpt].
  - Plan cards: about 80 videos on Plus (1,200 credits), about 200 on Ultra and about 133 per 1,000-credit Team seat ([/apps/character-swap] pricing block).
  - API: $0.0738 per second [/blog/higgsfield-api].
- Launched: Aug 6, 2026 (blog post date, "Higgsfield has launched Seedance 2.5"). Posts from Aug 2 called it coming soon. Draft Mode is a changelog title (undated).
- Sources: [/ai/video?model=seedance_2_5] [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/seedance-2-5-on-higgsfield-2026] [/blog/seedance-2-5-prompting-guide] [/blog/seedance-2-5-pricing-2026] [/blog/seedance-2-5] [/blog/best-5-platforms-seedance-2-5-2026] [/blog/ai-vs-vfx] [/blog/credits-vs-unlimited-ai-video-generation] [/blog/generate-voice-edit-ai-video-one-place] [/blog/best-affordable-ai-video-generators] [/blog/generate-ai-videos-from-chatgpt] [/blog/higgsfield-api] [/creator-hub/changelog]

### Seedance 2.5 Edit
- What it does: a separate model for editing a clip you already have. It handles region-level changes (object, face, background, clothing, props, atmosphere) and audio, and keeps the core action.
- How to use: 1. Upload the clip 2. Either describe the change, or use Draw to Edit to mark the region first 3. Generate and review [/blog/edit-ai-video-without-regenerating] [/blog/ai-video-restoration-high-quality].
- Inputs and settings: source video up to 30 s. Up to 50 references (images, audio or video, depending on the page). Native audio. Six core capabilities, including Recolor and Restyle, Smart Clean Up and Relight and Atmosphere [/blog/ai-video-restoration-high-quality] [/blog/100-plus-ad-variations-ai].
- Limits: output is 480p to 720p and matches the source length per the help [/creator-hub/help-center/ai-models/how-do-i-use-seedance]. The blogs say up to 1080p [/blog/edit-ai-video-without-regenerating] [/blog/ai-video-restoration-high-quality]. One result at a time, with no batch button [/blog/100-plus-ad-variations-ai].
- Models: Seedance 2.5 Edit.
- Credits and cost: 66 credits for 10 s at 720p ($3.30) [/blog/100-plus-ad-variations-ai]. 92 credits for 10 s at 1080p ($4.60) [/blog/ai-video-restoration-high-quality].
- Launched: not stated. First seen in the Aug 1, 2026 help table.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/edit-ai-video-without-regenerating] [/blog/ai-video-restoration-high-quality] [/blog/100-plus-ad-variations-ai] [/blog/automate-ecommerce-catalog-video-ai] [/blog/best-veo-alternatives-character-consistency]

### Seedance 2.0
- What it does: ByteDance's multimodal model for realistic human motion. It takes text, images, video and audio in one pass and returns video with native sound and lip sync in 8+ languages. The help calls it the "most forgiving" starting point for video [/creator-hub/help-center/ai-models/which-ai-model-should-i-use].
- How to use: 1. Video → Seedance 2.0 2. Start with image-to-video at 720p 3. Prompt in this order: subject and action, setting and lighting, camera move, mood 4. Watch the full clip, since problems show around 5 to 8 s 5. Change one thing per pass 6. Re-run at 1080p or 4K [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/generating-with-seedance-2-0].
- Inputs and settings: 480p, 720p, 1080p or 4K; 4 to 15 s; up to 9 images, 3 videos and 3 audio files; @character, @style, @motion and @audio tags; first-and-last-frame; ratio including Auto; bitrate [/creator-hub/help-center/ai-models/how-do-i-use-seedance]. It understands camera terms such as dolly in, truck left, arc shot and crane up [/blog/generating-with-seedance-2-0].
- Limits:
  - At the Apr 2 launch, access required business email verification and excluded the US and Japan [/blog/seedance-2-on-higgsfield]. From Apr 13 it was global with no waitlist [/blog/seedance-prompting-guide].
  - Moderation is described as strict [/blog/5-Best-AI-Video-Models-2026-Tested-Compared].
  - Higgsfield is described as web-only with no API [/blog/seedance-2-0-pricing-2026]. A later post prices it on the API [/blog/higgsfield-api].
  - Default video model in the editor plugins [/creator-hub/help-center/integrations/external-integrations-higgsfield].
  - Failure incidents were resolved Sep 30 and Oct 3, 2026 [/creator-hub/changelog].
- Models: Seedance 2.0. A listicle also mentions a "Pro version" tier [/blog/best-platforms-to-access-seedance-2-0].
- Credits and cost:
  - 8 s at 720p: 36 credits, quoted as $1.55 [/blog/seedance-2-0-pricing-2026] and as $1.76 [/blog/seedance-2-5-pricing-2026].
  - 15 s at 720p: about 90 credits [/blog/5-Best-AI-Video-Models-2026-Tested-Compared].
  - 1080p: about $2.00 on Plus [/blog/generating-with-seedance-2-0].
  - Audio cost is disputed. The help says the audio toggle does not change cost [/creator-hub/help-center/ai-models/how-do-i-use-seedance]. A blog says audio adds 50 to 100% [/blog/generating-with-seedance-2-0].
  - API: $0.9332 per second [/blog/higgsfield-api].
- Launched: Apr 2, 2026 (blog post date) with verification, then global on Apr 13, 2026 (blog post date). 4K came Jun 25, 2026 (see Seedance 4K).
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/seedance-2-on-higgsfield] [/blog/seedance-prompting-guide] [/blog/generating-with-seedance-2-0] [/blog/seedance-2-0-pricing-2026] [/blog/best-platforms-to-access-seedance-2-0] [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] [/blog/higgsfield-api] [/creator-hub/changelog]

### Seedance 2.0 Fast (Enhanced Seedance 2.0 Fast)
- What it does: a speed-tuned Seedance 2.0 model for volume and iteration. BytePlus supplied it to Higgsfield as "Enhanced Seedance 2.0 Fast", and the app shows it as "Seedance 2.0 Fast" [/blog/seedance-unlimited].
- How to use: 1. Activate the add-on or a qualifying plan 2. Pick Seedance 2.0 Fast in the model list 3. Prompt as for Seedance 2.0 4. Use 480p or 720p 5. Generate [/blog/generating-with-seedance-2-0].
- Inputs and settings: 480p or 720p; 4 to 15 s [/creator-hub/help-center/ai-models/how-do-i-use-seedance]; multi-shot, native audio and character consistency like 2.0 [/blog/seedance-unlimited].
- Limits: no 1080p. Unlimited runs 1 job at a time in the standard queue, web only [/blog/seedance-unlimited]. Starter gets 2.0 Fast and 2.0 Mini but not the full model ([/apps/character-swap] pricing block, [/blog/5-Best-AI-Video-Models-2026-Tested-Compared]). Higgsfield claims the Enhanced variant is exclusive to it [/blog/seedance-2-0-pricing-2026].
- Models: Seedance 2.0 Fast, also called Enhanced Seedance 2.0 Fast. The pricing post describes Enhanced Fast as faster than the standard Fast tier [/blog/seedance-2-0-pricing-2026].
- Credits and cost: 8 s at 720p for 28 credits ($1.20) [/blog/seedance-2-0-pricing-2026]. Starter's 270 credits cover about 15 videos ([/apps/character-swap]). The 30-day unlimited add-on was sold separately [/blog/seedance-unlimited].
- Launched: June 2026 with the 30-day add-on [/blog/free-unlimited-ai-video-generation-2026]. First blog coverage Jun 24, 2026 (blog post date). Average generation under 5 minutes across 23,913 runs in the first 7 hours [/blog/seedance-unlimited].
- Sources: [/blog/seedance-unlimited] [/blog/generating-with-seedance-2-0] [/blog/seedance-2-0-pricing-2026] [/blog/best-platforms-to-access-seedance-2-0] [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/apps/character-swap]

### Seedance 2.0 Mini
- What it does: the lightest Seedance 2.0 tier, for maximum speed and short-form drafts.
- How to use: select it in the Seedance model picker (inferred).
- Inputs and settings: 480p to 720p; 4 to 15 s [/creator-hub/help-center/ai-models/how-do-i-use-seedance].
- Limits: included on Starter with 2.0 Fast ([/apps/character-swap] pricing block). In the All Unlimited set at 720p and 8 s [/blog/higgsfield-all-unlimited-explained]. Failure incident resolved Oct 3, 2026 [/creator-hub/changelog].
- Models: Seedance 2.0 Mini. Higgsfield pairs it with Seedance 2.0 as a draft-then-final pattern [/blog/why-ai-video-credits-run-out].
- Credits and cost: not stated per clip on Higgsfield. A 1-day Marketplace pass for 2.0 Fast and Mini cost $35 in Jul 2026 [/blog/higgsfield-all-unlimited-explained].
- Launched: not stated. Mentioned from Jun 24, 2026 [/blog/seedance-2-0-pricing-2026].
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/seedance-2-0-pricing-2026] [/blog/higgsfield-all-unlimited-explained] [/blog/why-ai-video-credits-run-out] [/creator-hub/changelog]

### Seedance 4K
- What it does: Seedance 2.0 generating natively at 4K. Higgsfield markets it for hyper-real cinematic shots and VFX over your own phone footage, with no green screen or rotoscoping.
- How to use: for VFX, 1. Shoot clean reference footage 2. Have Claude analyze the motion, camera, lens and lighting 3. Describe the new world to Claude 4. Paste the generated prompt over the uploaded clip in Seedance 4K and generate [/blog/VFX-with-Seedance-4k].
- Inputs and settings: text-to-video or video-to-video. Prompts lock the source camera and performance, for example by referencing `<<<video_1>>>` [/blog/Seedance-4k] [/blog/VFX-with-Seedance-4k]. Higgsfield shares a Claude "prompt-builder.skill" file [/blog/Seedance-4k].
- Limits: in unlimited windows 4K was capped at 8 s, and it was not available on Plus monthly [/blog/seedance-4k-unlimited-11-days]. Max and Ultra annual only for the 7-day window [/blog/new-unlimited-more-models]. The free 4K page allowed up to 10 s per clip on any plan [/blog/seedance-4k-unlimited-11-days].
- Models: Seedance 2.0 at 4K.
- Credits and cost: not stated per clip.
- Launched: Jun 25, 2026 (blog post date, "Seedance 2.0 just launched 4K").
- Sources: [/blog/Seedance-4k] [/blog/VFX-with-Seedance-4k] [/blog/seedance4k-breakdown] [/blog/seedance-4k-unlimited-11-days] [/blog/new-unlimited-more-models]

### Older Seedance models (Seedance 1.5 Pro, Seedance Pro, Seedance Pro Fast)
- What it does: earlier Seedance versions that are still selectable. Seedance 1.5 set the baseline for coherent short-form clips [/blog/seedance-2-on-higgsfield].
- How to use: model picker → All models [/creator-hub/help-center/ai-models/how-do-i-use-seedance].
- Inputs and settings: not stated.
- Limits: not stated.
- Models: Seedance 1.5 Pro, Seedance Pro, Seedance Pro Fast.
- Credits and cost: not stated.
- Launched: not stated.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/seedance-2-on-higgsfield]

### Kling 3.0
- What it does: Kuaishou's model for scene-based, multi-shot filmmaking with native audio. It is Higgsfield's choice for stylized, cinematic or longer clips and for character-driven stories [/creator-hub/help-center/ai-models/which-ai-model-should-i-use].
- How to use: 1. Video → model picker → Kling 3.0 2. Write the prompt (subject, action, camera, style) 3. Set duration, resolution, ratio and audio 4. Add a start frame, end frame or both if needed 5. Generate and iterate [/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation]. To chain scenes, use the last frame of one as the start frame of the next [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Inputs and settings:
  - Basics: 3 to 15 s; 720p, 1080p or 4K; 16:9, 9:16 or 1:1; audio on or off; 8 shot-style presets [/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation].
  - Multi-shot in Auto or Custom mode. Custom allows up to 5 shots, each with its own prompt and duration [/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation]. Another post says up to 6 cuts [/blog/5-Best-AI-Video-Models-2026-Tested-Compared].
  - @elements per shot.
  - Genres: General, Action, Horror, Comedy, Noir, Drama, Epic. Speed ramps: Linear, Auto, Flash In/Out, Slow-mo, Bullet Time, Impact, Ramp Up [/creator-hub/help-center/ai-models/how-do-i-use-kling].
  - Voice Binding holds one voice per character in 5 languages [/blog/5-Best-AI-Video-Models-2026-Tested-Compared].
- Limits: Starter has no Kling 3.0 unlimited. Plus and Ultra include a 7-day unlimited window ([/apps/character-swap] pricing block). All Unlimited caps it at 1080p and 8 s [/blog/higgsfield-all-unlimited-explained]. Queues can be long at peak, so use Turbo for drafts [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Models: Kling 3.0. Variants are Turbo, Motion Control, Omni and Omni Edit (separate entries).
- Credits and cost: figures vary widely by page.
  - About 6 credits per video [/blog/5-Best-AI-Video-Models-2026-Tested-Compared]; 6 to 7 credits per clip [/blog/how-to-create-ai-influencer].
  - 5 s with audio for 10 credits [/blog/best-affordable-ai-video-generators].
  - About 150 clips per 1,000 credits [/blog/best-runway-ml-alternatives]; 40 to 50 clips per 1,000 credits [/blog/ai-video-credits-explained]; 4 to 5 clips per 120 credits [/blog/ai-tiktok-pipeline-2026].
  - API: $0.112 per second, so a 10 s clip costs $1.12 [/blog/higgsfield-api].
  - Marketplace 1-day pass at 1080p: $35 [/blog/higgsfield-all-unlimited-explained].
- Launched: Feb 12, 2026 (blog post date).
- Sources: [/ai/video?model=kling3_0] [/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation] [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] [/blog/higgsfield-all-unlimited-explained] [/blog/higgsfield-api] [/blog/best-affordable-ai-video-generators] [/blog/how-long-ai-video-generation-takes]

### Kling 3.0 Turbo
- What it does: a speed-tuned Kling 3.0 for drafts and prompt tests before a full render.
- How to use: draft on Turbo, then switch to Kling 3.0 for the final [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Inputs and settings: text-to-video and image-to-video; up to 1080p; 3 to 15 s [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Limits: available on higgsfield.ai, Supercomputer, MCP and CLI [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Models: Kling 3.0 Turbo.
- Credits and cost: not stated.
- Launched: not stated.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/why-ai-video-credits-run-out]

### Kling 3.0 Omni
- What it does: Higgsfield's highest-end Kling model, combining generation and editing in one model.
- How to use: not stated.
- Inputs and settings: up to 4K; 3 to 15 s [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Limits: not stated.
- Models: Kling 3.0 Omni. See Kling 3.0 Omni Edit under Tools for the editing model.
- Credits and cost: not stated on Higgsfield.
- Launched: not stated.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-kling]

### Kling O1 (Video and Video Edit)
- What it does: a unified model for generating and editing video, built on Kuaishou's MVL (Multimodal Visual Language) architecture. Video mode animates references. Edit mode changes real footage: camera-motion transfer, background swap, color grade and relighting.
- How to use:
  - Video mode: 1. Create Video → Kling O1 2. Upload one image, up to 7 images, or start and end frames 3. Prompt 4. Pick duration 5. Generate.
  - Edit mode: 1. Choose Edit 2. Upload the source video 3. Add up to 4 image references 4. Optionally add a motion reference 5. Prompt 6. Generate [/blog/Kling-01-is-Here-A-Complete-Guide-to-Video-Model].
- Inputs and settings: Video outputs 5 or 10 s from up to 7 image references or start and end frames. Edit takes 3 to 10 s input clips with up to 4 image references [/blog/Kling-01-is-Here-A-Complete-Guide-to-Video-Model]. Both run up to 1080p (Video 5 to 10 s, Edit 3 to 10 s) [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Limits: not stated.
- Models: Kling O1 Video, Kling O1 Video Edit. Kling O1 Image is the image model in the 365-day unlimited sets [/apps/character-swap] [/blog/new-unlimited-more-models].
- Credits and cost: the launch post says Higgsfield offers unlimited Kling O1 use [/blog/Kling-01-is-Here-A-Complete-Guide-to-Video-Model]. The unlimited lists in 2026 show "Kling O1" or Kling O1 Image as image models up to 2K [/blog/higgsfield-all-unlimited-explained].
- Launched: Nov 30, 2025 (blog post date).
- Sources: [/blog/Kling-01-is-Here-A-Complete-Guide-to-Video-Model] [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/higgsfield-all-unlimited-explained]

### Kling 2.6
- What it does: the previous Kling generation, for cinematic clips with native audio. It also powers Kling 2.6 Lipsync and the first Kling Motion Control.
- How to use: select it in the model picker (inferred).
- Inputs and settings: up to 1080p; 5 to 10 s; native audio [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Limits: not stated.
- Models: Kling 2.6, Kling 2.6 Lipsync (Lipsync Studio, up to 1080p with audio) [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios], Kling Motion Control 2.6.
- Credits and cost: API $0.07 per second, so a 10 s clip costs $0.70 [/blog/higgsfield-api]. Starter's 120 credits cover about 20 short Kling 2.6 LipSync clips, and Plus's 1,000 cover about 100 [/blog/make-ai-lipsync-videos].
- Launched: not stated. Kling 2.6 Motion Control guide dated Dec 20, 2025 (blog post date).
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/higgsfield-api] [/blog/make-ai-lipsync-videos] [/blog/Kling-2.6-Motion-Control-Full-Guide]

### Older Kling models (Kling 2.5 Turbo, Kling 2.1, Kling 2.1 Master)
- What it does: legacy Kling models. Kling 2.5 Turbo is for fast generation, Kling 2.1 for quick HD from an image, and 2.1 Master for higher-fidelity 2.1 output.
- How to use: select them in the model picker (inferred).
- Inputs and settings: all up to 1080p; 5 to 10 s [/creator-hub/help-center/ai-models/how-do-i-use-kling].
- Limits: not stated.
- Models: Kling 2.5 Turbo (listed as "Kling 2.5" in the API), Kling 2.1, Kling 2.1 Master.
- Credits and cost: Kling 2.5 on the API costs $0.042 per second [/blog/higgsfield-api].
- Launched: not stated.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/higgsfield-api]

### Kling Avatars 2.0 and Kling Lipsync
- What it does: Kling's talking-video models inside Lipsync Studio. Kling Avatars 2.0 turns one image plus audio into a talking avatar and handles longer clips. Kling Lipsync is video-to-video lip sync on existing footage. (See Lipsync Studio for the studio itself.)
- How to use: Video → Lipsync Studio → upload an image or video → enter or generate audio → pick a model and scene template → generate [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
- Inputs and settings: Kling Avatars 2.0 is image-to-video. Kling Lipsync is video-to-video. Kling 2.6 Lipsync is image-to-video up to 1080p with audio [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
- Limits: part of the 7-model, 18-language localization stack [/blog/ai-video-ad-localization].
- Models: Kling Avatars 2.0, Kling Lipsync, Kling 2.6 Lipsync.
- Credits and cost: not stated per model.
- Launched: not stated.
- Sources: [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/ai-video-ad-localization] [/blog/100-plus-ad-variations-ai]

### Gemini Omni Flash
- What it does: Google DeepMind's multimodal video model that reasons over text, images, audio and video in one pass, then edits the finished clip through plain-language follow-ups instead of a full re-render ("conversational multi-turn editing").
- How to use: 1. Prepare inputs (text only, text + character photo, text + character + location, or video + text for an edit) 2. Write a structured prompt (subject and action, then setting and constraints, then camera) and label references, e.g. "@character_photo" 3. Open /ai/video, pick Gemini Flash, upload references, paste prompt 4. Generate at 720p and check composition 5. Edit in plain language, one change per pass 6. Export [/blog/how-to-use-gemini-omni-flash-multi-shot-video].
- Inputs and settings: up to 7 reference images per prompt plus text and video at the same time; output with synchronized audio (SFX, dialogue, ambience) in the same pass; up to 10 s per clip; 720p only; landscape or portrait [/blog/gemini-omni-flash-vfx-video-editing] [/blog/best-ways-to-access-gemini-omni-flash-2026].
- Higgsfield add-ons: Cinema Studio camera layer (7 genres, 9 color palettes, 7 lighting presets, 10 camera moveset styles, 5 lens options) applied before the model runs; Soul ID for a face that persists across sessions and models [/blog/gemini-omni-flash-vfx-video-editing].
- Use cases named: multi-reference scene assembly, iterative dialogue and layout edits, brand-constrained ads, presenter video from photo plus voice sample, video analysis (pick strongest segments, edit points) [/blog/how-to-use-gemini-omni-flash-multi-shot-video].
- Limits: real identifiable faces and named public figures blocked at the model level; voice editing of real people's footage restricted; edits strongest on single-element changes, multi-element interaction edits weaker; lower peak quality than Veo 3.1, positioned for the revision phase rather than final delivery [/blog/best-ways-to-access-gemini-omni-flash-2026] [/blog/gemini-omni-flash-vfx-video-editing].
- Availability: web Video section, MCP and CLI; the Jun 30 post says Higgsfield is "web interface only" with no public API for it [/blog/best-ways-to-access-gemini-omni-flash-2026]. Listed as "Google Omni Flash" on the MCP pages [/mcp] [/mcp?tab=claude] and as a new engine in the Premiere Pro / After Effects plugins [/plugins/after-effects]. Not in the API catalog lists (not stated as an API model) [/blog/higgsfield-api].
- Models: Gemini Omni Flash (Google API model ID gemini-omni-flash-preview, preview status) [/blog/gemini-omni-flash-vfx-video-editing].
- Credits and cost: $1.50 per 10 s clip on Higgsfield vs $1 on Google AI Studio, $1.30 on fal.ai, $1.80 Artlist, $2.30 DaVinci AI [/blog/best-ways-to-access-gemini-omni-flash-2026]; about $0.15 per second at 720p [/blog/gemini-omni-flash-vfx-video-editing]. Google bills each conversational edit as a full generation.
- Unlimited: in All Unlimited (one of 7 video models): 7 s on trial and Plus monthly, 10 s on Plus annual, 15 s on Max/Ultra, "standard" resolution; not sold separately in the Unlimited Models Marketplace [/blog/new-unlimited-more-models] [/blog/higgsfield-all-unlimited-explained] [/blog/free-unlimited-ai-video-generation-2026]; 7 s on web, Claude and ChatGPT in the Unlimited MCP trial [/blog/unlimited-mcp].
- Launched: Google released it Jun 30, 2026; Higgsfield posts dated Jun 30, 2026 (blog post date); Artlist integrated it the same day [/blog/best-ways-to-access-gemini-omni-flash-2026].
- Sources: [/blog/how-to-use-gemini-omni-flash-multi-shot-video] [/blog/best-ways-to-access-gemini-omni-flash-2026] [/blog/gemini-omni-flash-vfx-video-editing] [/blog/new-unlimited-more-models] [/blog/higgsfield-all-unlimited-explained] [/blog/unlimited-mcp] [/mcp] [/plugins/after-effects] [/creator-hub/case-studies/how-bitt-animation-runs-hybrid-ai-production]

### Gemini Omni Flash 1.1
- What it does: the current Omni Flash version in the Video model selector; nav label "Generate and edit video from any input" [/ai/video?model=gemini-omni-flash-1-1].
- How to use: Video, then model selector, then Gemini Omni Flash 1.1 (route /ai/video?model=gemini-omni-flash-1-1); same flow as Gemini Omni Flash (inferred).
- Inputs and settings: not stated separately from 1.0 (inferred same 720p / 10 s / 7 image references).
- Tested behavior: in a one-prompt adherence test it gave the strongest stylized, VFX-style output but more variance on literal object and color instructions; Cinema Studio 4.0 kept the most constraints, Veo 3.1 had the best physics [/blog/ai-video-prompt-adherence-comparison].
- Limits: not stated beyond 1.0 limits.
- Models: Gemini Omni Flash 1.1 (Google).
- Credits and cost: about $1.50 per 720p 10 s clip on Higgsfield vs $1.25 on Runway (Runway is cheaper for this model only) [/blog/higgsfield-vs-runway-2026].
- Launched: changelog title "Gemini Omni 1.1 Flash. Now on Higgsfield", undated; it sits between Genjutsu (blog Aug 31, 2026) and Recraft V4 (blog Aug 26, 2026), so about late Aug 2026 (inferred). First dated mention: Aug 30, 2026 (blog post date) [/creator-hub/changelog] [/blog/ai-video-prompt-adherence-comparison].
- Sources: [/ai/video?model=gemini-omni-flash-1-1] [/creator-hub/changelog] [/blog/ai-video-prompt-adherence-comparison] [/blog/higgsfield-vs-runway-2026] [/blog/how-to-generate-ai-video-all-in-one-platforms]

### Omni VFX (edit real footage with Gemini Omni Flash)
- What it does: a video-to-video VFX pass on your own filmed clip: the model adds or swaps one element while keeping the plate (actor, camera move, cuts, lighting) "source-locked".
- How to use: 1. Film or upload a clip 2. Open a ready prompt on the blog page and press Copy or Recreate 3. Describe only the change, with timing by seconds 4. Generate [/blog/Higgsfield-Omni-VFX].
- Inputs and settings: ready prompts named Bringing a character off the screen, Object swap, Material swap, When props come to life; prompts target ~10 s, 16:9, 30 fps, refer to the clip as video_1, and list locks, forbidden changes and diegetic SFX [/blog/Higgsfield-Omni-VFX].
- Supported edit types: background replacement, relighting, style transfer, object replacement, physics or environment changes (material, weather) [/blog/gemini-omni-flash-vfx-video-editing].
- Worked example: kingfisher on a monitor flies out onto a hand, then through the office, from one instruction [/blog/gemini-omni-flash-vfx-video-editing].
- Limits: single-element edits work best; multi-element interaction edits need testing [/blog/gemini-omni-flash-vfx-video-editing].
- Models: Gemini Omni Flash.
- Credits and cost: not stated beyond the model's ~$1.50 per 10 s clip.
- Launched: VFX guide Jul 13, 2026 (blog post date); the Omni VFX page is undated.
- Sources: [/blog/Higgsfield-Omni-VFX] [/blog/gemini-omni-flash-vfx-video-editing] [/creator-hub/case-studies/how-bitt-animation-runs-hybrid-ai-production]

### FLUX.3 Video
- What it does: Black Forest Labs' first video model (part of the multimodal FLUX 3 family trained on images, video and audio); makes clips with optional synchronized audio.
- How to use: 1. Select FLUX.3 Video in the model list 2. Choose text-to-video, image-to-video or video continuation 3. Add references and optional Start Frame / End Frame 4. Write the prompt incl. dialogue, on-screen text, style 5. Toggle audio on or off 6. Generate [/blog/flux-3-higgsfield].
- Inputs and settings: 5 to 20 s; 720p or 1080p; up to 10 reference frames (images, video, audio); video continuation extends a clip from its final seconds of picture and sound; multilingual dialogue with lip sync; readable moving text; style (camcorder, animation, cinematic) set in the prompt [/blog/flux-3-higgsfield]. Page description: text, image references, start and end frames, or an existing video [/ai/video?model=flux_3_video].
- Limits: early access; does not use Cinema Studio's genre, lens or lighting controls, so direction goes in the prompt [/blog/flux-3-higgsfield].
- Models: FLUX.3 Video (Flux 3 Video); Image, Action and Dev parts are part of the wider rollout [/blog/flux-3-higgsfield].
- Credits and cost: 5 s 720p 27.5 credits ($1.35); 5 s 1080p 45 ($2.25); 20 s 720p 110 ($5.50); 20 s 1080p 180 ($9.00); turning audio off while testing lowers cost [/blog/flux-3-higgsfield].
- Launched: BFL announced Jul 23, 2026; on Higgsfield Aug 16, 2026 (blog post date) [/blog/flux-3-higgsfield].
- Sources: [/blog/flux-3-higgsfield] [/ai/video?model=flux_3_video] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios]

### MiniMax H3 (Hailuo 3.0)
- What it does: MiniMax's third-generation Hailuo model; 2K video with native stereo sound, built from text plus image, video and audio references in one shot (face from a photo, camera move from a video, voice from audio).
- How to use: 1. Select Hailuo 3.0 / MiniMax H3 2. Pick text-to-video or image-to-video, add references 3. Set Start/End Frame if needed 4. Prompt and say what each reference is for (for example "Video 1 for camera, Image 2 for character") 5. Generate (audio in the same pass) 6. Refine with an edit instruction [/blog/minimax-h3-higgsfield].
- Inputs and settings: up to 9 images, 3 videos, 3 audio clips (12 files total); 2K; up to 15 s (4 to 15 s per [/blog/best-veo-alternatives-character-consistency]); 24 fps; 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 or adaptive; instruction-based editing; multi-shot storytelling; voice transfer; prompts up to 7,000 characters [/blog/minimax-h3-higgsfield] [/blog/best-veo-alternatives-character-consistency].
- Higgsfield-specific: Start/End Frame control is called out as available on Higgsfield's implementation [/blog/minimax-h3-higgsfield].
- Limits: access depends on plan; 15 s cap; 2K is the top (vendor tiers 480p / 768p / 2K, no 1080p; H3-Base 768p, H3-Regenerate-2K for 2K) [/blog/minimax-h3-higgsfield] [/blog/best-ai-video-generation-apis] [/blog/best-veo-alternatives-character-consistency].
- Models: MiniMax H3 = MiniMax Hailuo 3.0.
- Credits and cost: 5 s 2K 20 credits ($1); 10 s 40 ($2); 15 s 60 ($3) [/blog/minimax-h3-higgsfield]; Higgsfield API $0.13/s [/blog/generate-ai-videos-higgsfield-api]. Unlimited status on Higgsfield not stated (on MiniMax's own Hailuo app H3 is credits-only) [/blog/best-unlimited-ai-video-generators].
- Launched: Aug 16, 2026 (blog post date).
- Sources: [/blog/minimax-h3-higgsfield] [/ai/video?model=minimax_h3] [/blog/best-veo-alternatives-character-consistency] [/blog/generate-ai-videos-higgsfield-api] [/blog/higgsfield-api] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios]

### MiniMax H3 Max
- What it does: a MiniMax H3 variant added to Higgsfield; Higgsfield's own description not captured.
- How to use: not stated (no H3 Max route in the captured nav).
- Inputs and settings: on MiniMax's own API, H3-Max runs 5 to 15 s at 480p or 768p [/blog/best-ai-video-generation-apis].
- Limits: not stated for Higgsfield.
- Models: MiniMax H3 Max (H3-Max).
- Credits and cost: not stated on Higgsfield; MiniMax API lists $0.05/s at 480p and $0.08/s at 768p [/blog/best-ai-video-generation-apis].
- Launched: changelog title "MiniMax H3 Max. Now on Higgsfield", undated, right after Genjutsu (blog Aug 31, 2026), so about late Aug 2026 (inferred) [/creator-hub/changelog].
- Sources: [/creator-hub/changelog] [/blog/best-ai-video-generation-apis]

### MiniMax Hailuo 2.3
- What it does: fast image-to-video model known for transformations, physics, anime-style consistency and sharp logos/text; Higgsfield's pick for cheap fast drafts ("high-dynamic video at fast speeds").
- How to use: 1. Video Generation, choose Minimax 2.3 2. Upload an image 3. Optional short physical prompt ("melt", "ignite") 4. Pick a preset 5. Choose Fast 2.3 or Standard 2.3 6. Set duration and resolution 7. Generate Video [/blog/Minimax-Hailuo-2.3-A-Creative-Guide].
- Inputs and settings: one image + text; 6 or 10 s; 768p or 1080p (1080p only up to 6 s per [/blog/minimax-h3-higgsfield]); aspect ratio follows the input image; 70+ presets in Camera Control, UGC, Action Movement, Commercial, Viral, Emotion and Effects [/blog/Minimax-Hailuo-2.3-A-Creative-Guide].
- Limits: silent, no native audio [/blog/minimax-h3-higgsfield] [/blog/how-to-make-ai-videos-beginners-guide]; tuned for speed over cinematic control or 4K [/blog/5-Best-AI-Video-Models-2026-Tested-Compared].
- Speed: most clips in 30 to 90 s [/blog/how-to-make-ai-videos-beginners-guide].
- Models: Fast 2.3 (iteration) and Standard 2.3 (finals); successor to Hailuo 02 ("Hailuo 0.2" in the post), which still has a footer link [/].
- Credits and cost: ~$0.60 per 10 s 1080p draft; Basic's 120 credits cover about 10 drafts [/blog/ai-tiktok-pipeline-2026]; ~$0.70 per 8 s 720p clip [/blog/how-to-make-ai-videos-beginners-guide].
- Also used by: Supercomputer for fast drafts [/blog/agentic-ai-for-content-creation]; reachable through MCP [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP].
- Launched: Oct 26, 2025 (blog post date).
- Sources: [/blog/Minimax-Hailuo-2.3-A-Creative-Guide] [/blog/minimax-h3-higgsfield] [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] [/blog/how-to-make-ai-videos-beginners-guide] [/blog/ai-tiktok-pipeline-2026] [/creator-hub/help-center/ai-models/which-ai-model-should-i-use]

### Wan 3.0
- What it does: long clips (up to 30 s) from text, keyframes, or mixed image, video and audio references; nav label: video from text, keyframes or multimodal references. Home banner: "Wan 3.0 Unlimited" [/].
- How to use: Video, then model selector, then Wan 3.0 [/creator-hub/changelog].
- Inputs and settings: up to 30 s; up to 1080p; aspect 16:9, 4:3, 1:1, 3:4, 9:16 or adaptive; native audio; API endpoints text-to-video, image-to-video, reference-to-video [/blog/sora-api-migration-guide]. Wan family strength per help center: first and last frame control [/creator-hub/help-center/ai-models/which-ai-model-should-i-use].
- Limits: unlimited week runs in a shared queue (speed depends on load), clips up to 30 s at up to 1080p [/creator-hub/changelog].
- Unlimited and plan gates: Oct 13, 2026 offer gives subscribers a free week of Wan 3.0 and Wan 3.0 Prime, on individual plans "from Pro and above"; upgrading from Basic or Starter starts the 7 days then [/creator-hub/changelog]. Pricing cards: Starter "No unlimited", Plus and Ultra "Unlimited" in the 7-day block [/apps/character-swap].
- Models: Wan 3.0 (Alibaba Wan line, inferred from the WAN 2.6 page).
- Credits and cost: about $1.25 per 720p 10 s clip on Higgsfield vs $1.50 on Runway [/blog/higgsfield-vs-runway-2026]; Higgsfield API $0.20/s, 60% off until Oct 31, 2026 [/blog/generate-ai-videos-higgsfield-api] [/creator-hub/changelog].
- Launched: changelog title "Wan 3.0 and Wan 3.0 Prime. Now on Higgsfield", undated, between Affiliate Program (blog Aug 24, 2026) and Higgsfield in Blender (blog Aug 20, 2026), so about Aug 20 to 24, 2026 (inferred); unlimited week Oct 13, 2026 (changelog).
- Sources: [/ai/video?model=wan3_0] [/] [/creator-hub/changelog] [/apps/character-swap] [/blog/sora-api-migration-guide] [/blog/higgsfield-vs-runway-2026] [/blog/generate-ai-videos-higgsfield-api] [/blog/higgsfield-api]

### Wan 3.0 Prime
- What it does: a second Wan 3.0 tier launched with Wan 3.0; how it differs is not stated.
- How to use: not stated (inferred: Wan 3.0 model selector).
- Inputs and settings: not stated.
- Limits: included in the same 7-day unlimited offer as Wan 3.0 (30 s, 1080p, shared queue) [/creator-hub/changelog].
- Models: Wan 3.0 Prime.
- Credits and cost: not stated; unlimited on Plus and Ultra cards, not on Starter [/apps/character-swap].
- Launched: same changelog title as Wan 3.0, about Aug 20 to 24, 2026 (inferred).
- Sources: [/creator-hub/changelog] [/apps/character-swap]

### Wan 2.7
- What it does: Wan version used for restyles and "reshoots": video-reference style transfer keeps the performance in a supplied clip and changes the world around it; also named for physics-accurate camera moves.
- How to use: pick it in Video, or send a still via Seedream 5.0 Pro's Turn to Video handoff [/blog/photo-to-ai-video]; also available in Canvas [/blog/ai-batch-generation-tools-2026].
- Inputs and settings: native audio and lip sync; best results need a reference clip or image [/blog/5-Best-AI-Video-Models-2026-Tested-Compared].
- Limits: weaker from text alone [/blog/5-Best-AI-Video-Models-2026-Tested-Compared].
- Unlimited: one of 7 All Unlimited video models: 1080p, 8 s on trial and Plus monthly, 10 s Plus annual, 15 s Max/Ultra; not sold separately in the marketplace; 1080p 8 s in the Unlimited MCP trial on web, Claude and ChatGPT [/blog/new-unlimited-more-models] [/blog/higgsfield-all-unlimited-explained] [/blog/unlimited-mcp].
- Models: Wan 2.7 (the 5-best post heads the section "WAN 2.7" but its body describes "Higgsfield WAN 2.6") [/blog/5-Best-AI-Video-Models-2026-Tested-Compared].
- Credits and cost: 5 s 720p 8 credits ($0.40); 5 s 1080p 13 ($0.65); 10 s 720p 15 ($0.75); 10 s 1080p 25 ($1.25); Plus's 1,000 credits cover about 40 to 50 clips [/blog/ai-video-credits-explained].
- Launched: not stated; first seen Jun 9, 2026 (blog post date).
- Sources: [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] [/blog/ai-video-credits-explained] [/blog/new-unlimited-more-models] [/blog/higgsfield-all-unlimited-explained] [/blog/unlimited-mcp] [/blog/photo-to-ai-video]

### WAN 2.6
- What it does: Alibaba's Wan model, pitched as the "camera-first" model and for first-and-last-frame control and instruction-based edits; still listed under Video Models in the site footer [/].
- How to use: 1. Go to Video 2. Select WAN 2.6 from the model list and confirm 3. Set duration and input method (text, voiceover upload, or images) and a theme 4. Preview, then Generate Full Video 5. Download (MP4 or MOV; 1080p or 4K per the post) [/blog/WAN-2.6-by-Alibaba-User-Guide-on-Higgsfield].
- Inputs and settings: up to 15 s; first-and-last-frame control; instruction-based editing; video-reference restyle; multi-shot with automatic camera transitions [/blog/how-to-make-ai-videos-beginners-guide] [/blog/5-Best-AI-Video-Models-2026-Tested-Compared].
- Audio: pages disagree: native audio with lip sync [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] [/blog/how-to-make-ai-videos-beginners-guide] vs "add audio in a second pass" [/blog/turn-your-video-into-cinema-using-wan-camera-control].
- Limits: raw quality below Veo 3.1 and Kling 3.0 on single-clip benchmarks [/blog/how-to-make-ai-videos-beginners-guide].
- Models: WAN 2.6; open source under Apache 2.0, can run locally [/blog/how-to-make-ai-videos-beginners-guide].
- Credits and cost: ~$0.75 per 8 s 720p clip [/blog/how-to-make-ai-videos-beginners-guide].
- Availability: MCP lists Wan 2.6 [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP].
- Launched: Dec 14, 2025 (blog post date).
- Sources: [/blog/WAN-2.6-by-Alibaba-User-Guide-on-Higgsfield] [/blog/how-to-make-ai-videos-beginners-guide] [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] [/blog/best-ai-video-generators-2026] [/blog/turn-your-video-into-cinema-using-wan-camera-control]

### WAN camera control
- What it does: describe a camera move and the Wan model executes it at generation time (dolly, crane, orbit, tracking, depth-of-field shifts) with simulated inertia and speed curves.
- How to use: 1. Plan the scene's mood 2. Write a prompt with the move ("slow dolly around perfume bottle") 3. Turn on WAN Camera Controls and pick a motion pattern 4. Pick a virtual lens (35 / 50 / 85 mm) 5. Set focus shifts 6. Test, adjust speed or angle, regenerate [/blog/turn-your-video-into-cinema-using-wan-camera-control].
- Inputs and settings: camera path (dolly-in, orbit, crane-up, side pan), focus and depth of field, lens behavior (ultra-wide to macro), speed and motion weight, stabilization or handheld shake [/blog/turn-your-video-into-cinema-using-wan-camera-control].
- Limits: validate at 720p before 1080p; avoid conflicting camera paths in short sequences [/blog/turn-your-video-into-cinema-using-wan-camera-control].
- Models: WAN 2.6; Cinema Studio carries the same camera language to other models [/blog/turn-your-video-into-cinema-using-wan-camera-control].
- Credits and cost: not stated.
- Launched: guide dated Jun 29, 2026 (blog post date).
- Sources: [/blog/turn-your-video-into-cinema-using-wan-camera-control]

### Older Wan versions (Wan 2.5, Wan 2.5 Speak, Wan 2.5 Fast, Wan 2.2)
- What it does: earlier Wan models that now live inside other tools: Wan 2.5 for audio-synced video, Wan 2.5 Speak and Wan 2.5 Fast for talking clips in Lipsync Studio, Wan 2.2 as the face and character swap engine.
- How to use (Wan 2.5 Speak): 1. Video, then Lipsync Studio 2. Upload character image 3. Type Audio text or upload audio 4. Choose General preset, 1080p, 10 s 5. Generate [/blog/still-image-to-talking-video].
- Inputs and settings: Wan 2.5 Speak image-to-video 480p to 1080p with audio [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios]; 15+ presets [/blog/100-plus-ad-variations-ai]; Wan 2.5 Fast default in Lipsync Studio: 5 s, 720p, button "Generate 9" [/lipsync-studio]; Wan 2.5 audio described as "sound sync with camera movements" [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios].
- Limits: not stated.
- Models: Wan 2.5, Wan 2.5 Speak, Wan 2.5 Fast; WAN 2.2 engine for swap [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide]; footer also links "Wan 2.2 Image" and "Wan 2.5" [/].
- Credits and cost: Wan 2.5 Fast 5 s 720p = 9 credits (Generate button) [/lipsync-studio]; Wan 2.5 Speak 10 s 1080p = 40 credits ($2.00) [/blog/still-image-to-talking-video].
- Launched: Wan 2.2 swap guide Nov 5, 2025 (blog post date); others not stated.
- Sources: [/lipsync-studio] [/blog/still-image-to-talking-video] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/100-plus-ad-variations-ai] [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide] [/]

### Grok Imagine Video 1.5
- What it does: xAI's video model that generates sound in the same pass as motion; page title "Fast AI Video with Audio", clips in "under 20 seconds" [/ai/video?model=grok_video_v15].
- How to use: Video, then model selector, then Grok Imagine Video 1.5 [/creator-hub/changelog].
- Inputs and settings: image-to-video, text-to-video, reference-to-video and video extension (continue from the last frame keeping character, light, motion); up to 7 reference images; 480p, 720p or 1080p; 1 to 15 s; 24 fps; native SFX and music [/creator-hub/changelog] [/ai/video?model=grok_video_v15].
- Limits: not stated.
- Models: Grok Imagine Video 1.5 (site label "Grok Imagine 1.5"); help center maps the Grok Imagine family to "video with synchronized audio" [/creator-hub/help-center/ai-models/which-ai-model-should-i-use].
- Credits and cost: website credits not stated; Higgsfield API $0.25/s (listed in a Sep 16, 2026 post, before the website changelog date) [/blog/generate-ai-videos-higgsfield-api].
- Launched: Oct 1, 2026 (changelog).
- Sources: [/creator-hub/changelog] [/ai/video?model=grok_video_v15] [/blog/generate-ai-videos-higgsfield-api] [/]

### Grok Imagine 1.5 Lite
- What it does: cheaper, faster Grok tier; nav label: fast, low-cost video from text or one image, tagged new.
- How to use: Video, model selector, Grok Imagine 1.5 Lite (route /ai/video?model=grok_video_v15_lite).
- Inputs and settings: text or a single start image; 1 to 15 s; 480p, 720p or 1080p; "any popular aspect ratio" [/ai/video?model=grok_video_v15_lite].
- Limits: one start image only (no multi-reference stated).
- Models: Grok Imagine 1.5 Lite (xAI).
- Credits and cost: not stated.
- Launched: not stated (no changelog entry captured; marked new in the nav).
- Sources: [/ai/video?model=grok_video_v15_lite]

### Grok Imagine (earlier video model)
- What it does: xAI's first video model on Higgsfield; strengths named are natural voiceover that follows the script, emotional facial expressions, grounded physics, motivated camera moves and steady framing.
- How to use: 1. Open Video Generation 2. Choose Grok 3. Enter a prompt and upload a reference image 4. Generate and preview [/blog/Grok-Imagine-AI-Video-Best-Use-Cases].
- Inputs and settings: text prompts and images or reference visuals; outputs adapted to vertical, horizontal or square [/blog/Grok-Imagine-AI-Video-Best-Use-Cases].
- Limits: best for short to medium clips [/blog/Grok-Imagine-AI-Video-Best-Use-Cases].
- Models: Grok Imagine (version not stated).
- Credits and cost: not stated.
- Launched: Jan 28, 2026 (blog post date).
- Sources: [/blog/Grok-Imagine-AI-Video-Best-Use-Cases]

### Google Veo 3.1
- What it does: Google's model, used on Higgsfield for the most realistic shots (physics, light, weather, wide outdoor scenes) with native audio; often named the "final delivery" model. Route title "Google Veo 3.1 Video Preview"; nav label "Advanced AI video with sound".
- How to use: 1. Video tab, select Google Veo 3.1 2. Pick Standard or Fast 3. Give text, one or more images, or Start and End frames 4. Generate [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model].
- Inputs and settings (Oct 2025 guide): 4, 6 or 8 s; 720p or 1080p at 24 fps; 16:9 or 9:16; first/last frame, reference-to-video, draw-to-video, Multi Reference mode (up to 4 linked scenes); Standard = text-to-video + Multi Reference, subject consistency from 1 to 3 references, dialogue with lip sync; Fast = text-to-video + Start & End frame, quicker [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model].
- Tiers later named: Lite, Fast and Quality, all with native audio; draft in Fast or Lite, finish in Quality [/blog/best-ai-video-generators-2026].
- Limits: 8 s cap per generation [/blog/best-ai-video-generators-2026]; pages disagree on max length and resolution: "4K, 8 sec" [/blog/gemini-omni-flash-vfx-video-editing] vs "4K, clips up to 60 seconds" [/blog/most-reliable-ai-video-generators-2026]. Softer on close-up faces [/blog/5-Best-AI-Video-Models-2026-Tested-Compared]; needs shot-list-level prompts.
- Plan gates and surfaces: from Plus ($49/mo) per [/blog/best-ai-video-generators-2026], "from the Pro plan" per [/blog/best-sora-alternatives-2026]; on the website, MCP and CLI but not in the Higgsfield API catalog [/blog/automate-ai-video-n8n-make] [/blog/sora-api-migration-guide] [/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli]; also in Canvas and in Lipsync Studio ("Google Veo 3.1" cinematic talking video in help; "Google Veo 3" with 15+ presets in blogs) [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/100-plus-ad-variations-ai].
- Credits and cost: 8 s Veo 3.1 Lite 8 credits silent or 12 with audio ($0.60 to $0.90) [/blog/best-affordable-ai-video-generators]; ~58 credits per 8 s clip on Ultra (~$2.5) [/blog/best-ai-video-generators-2026]; ~40 to 70 credits per video [/blog/5-Best-AI-Video-Models-2026-Tested-Compared]; ~$4 per 8 s 720p vs Runway $5 [/blog/higgsfield-vs-runway-2026]; ~$2.50 per 8 s 720p [/blog/how-to-make-ai-videos-beginners-guide]. The Oct 2025 guide is titled around "Unlimited Veo 3.1"; Veo is not in the Jul 2026 All Unlimited list.
- Speed: 8 s at 1080p ~3 s queue + ~127 s generation, ~2 min total (30-day median) [/blog/how-long-ai-video-generation-takes].
- Launched: Oct 14, 2025 (blog post date).
- Sources: [/ai/video?model=veo-3-1-preview] [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model] [/blog/best-ai-video-generators-2026] [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] [/blog/best-affordable-ai-video-generators] [/blog/higgsfield-vs-runway-2026] [/blog/how-long-ai-video-generation-takes] [/blog/automate-ai-video-n8n-make] [/blog/ai-video-prompt-adherence-comparison]

### OpenAI Sora 2
- What it does: OpenAI's video model that Higgsfield offered ("Generate with Sora 2") for memes, game mashups and realistic bodycam or documentary-style clips; the Sora 2 Trends presets and the Popcorn storyboard export ran on it.
- How to use: not stated in steps; Popcorn storyboards could be exported to Sora 2 [/blog/The-AI-Storyboard-Generator-That-Feels-Like-Directing].
- Inputs and settings: up to 20 s at 720p; Sora 2 Pro reached 1080p; 16:9 and 9:16 [/blog/sora-api-migration-guide]. Claimed gains: world consistency, object permanence, finer camera and depth-of-field control [/blog/7yl97OfLfW8LCpOD41wU2Q].
- Limits: retired. Deprecation notice Mar 24, 2026; web and apps closed Apr 26, 2026; API and all sora-2 / sora-2-pro models removed Sep 24, 2026; Higgsfield kept Sora 2 until Sep 24 [/blog/sora-api-migration-guide] [/blog/best-ai-video-generators-2026].
- After retirement: Sora 2 Trends presets now run on Seedance 2.0 [/blog/Product-Videos-TikTok-Reels-Without-Filming]; suggested replacements Seedance 2.0 and Veo 3.1 [/blog/5-Best-AI-Video-Models-2026-Tested-Compared]. Footer still links Sora 2, Sora 2 Presets, Sora 2 Upscale and Sora 2 Introduction [/]; upscale posts carry "Sora 2 Max" captions and "Try Sora 2 Enhancer" buttons [/blog/Upgrade-the-Quality-of-Old-Videos-using-Upscale] [/blog/Higgsfield-Upscale-Phone-vs-Camera].
- Models: Sora 2, Sora 2 Pro.
- Credits and cost: not stated.
- Launched: Oct 8, 2025 (blog post date); removed Sep 24, 2026.
- Sources: [/blog/7yl97OfLfW8LCpOD41wU2Q] [/blog/sora-api-migration-guide] [/blog/best-sora-alternatives-2026] [/blog/best-ai-video-generators-2026] [/blog/Product-Videos-TikTok-Reels-Without-Filming] [/]

### Sora 2 API shutdown and migration to the Higgsfield API
- What it does: Higgsfield's guide for moving a /v1/videos integration to the Higgsfield API after the Sora API shutdown.
- How to use: 1. Create an API account and key (key ID + secret, $5 minimum top-up) 2. Rewrite the request: model moves into the URL, Bearer becomes "Key id:secret", form fields become JSON 3. Switch to status_url polling or the per-request hf_webhook 4. Save video.url to your storage and use the estimate endpoint for cost [/blog/sora-api-migration-guide].
- Model mapping: Seedance 2.5 for long clips with sound (30 s, 1080p); Kling 3.0 for multi-shot and 4K endpoints (15 s); Wan 3.0 for reference-driven clips (30 s, 1080p, native audio) [/blog/sora-api-migration-guide].
- Field mapping: seconds (text) becomes duration (number); size in pixels becomes resolution + aspect_ratio; input_reference becomes image_url (plus optional end_image_url); extensions and edits map to video-extend and video-edit endpoints [/blog/sora-api-migration-guide].
- Limits: extra final statuses nsfw and canceled; files kept at least 7 days (Sora links lasted 1 hour); webhooks need a 2xx within 10 s, retried up to 2 hours; Unlimited does not apply to the API [/blog/sora-api-migration-guide].
- Models: Seedance 2.5, Kling 3.0, Wan 3.0; MiniMax, LTX, PixVerse and Grok families also in the catalog; Veo 3.1 only through MCP [/blog/sora-api-migration-guide].
- Credits and cost: per-second rates on API model pages; failed generations not billed [/blog/sora-api-migration-guide].
- Launched: Oct 3, 2026 (blog post date).
- Sources: [/blog/sora-api-migration-guide]

### Happy Horse
- What it does: Alibaba video model with synchronized audio in one pass, ~38 s for 1080p on one H100; reached #1 on Artificial Analysis text-to-video and image-to-video boards.
- How to use: not stated.
- Inputs and settings: not stated beyond 1080p with audio.
- Limits: in beta; open weights claimed (Apache 2.0) but not shipped as of mid-2026 [/blog/best-ai-video-generators-2026].
- Availability: one post says it runs on Higgsfield with the other "worth watching" models [/blog/best-ai-video-generators-2026]; no Higgsfield route, nav entry or changelog entry captured, so treat as unconfirmed. Also on the Runway API [/blog/best-ai-video-generation-apis].
- Models: Happy Horse (Alibaba).
- Credits and cost: not stated.
- Launched: appeared about Apr 7, 2026 (per blog); Higgsfield date not stated.
- Sources: [/blog/best-ai-video-generators-2026] [/blog/best-ai-video-generation-apis]

### LTX 2.5 Pro (API catalog)
- What it does: LTX family video model in the Higgsfield API catalog.
- How to use: call its model endpoint through the Higgsfield API (REST, Python or TypeScript SDK) [/blog/generate-ai-videos-higgsfield-api].
- Inputs and settings: native audio as a per-model option for the LTX family [/creator-hub/help-center/integrations/what-is-the-higgsfield-api].
- Limits: website availability not stated; API catalog may differ from the website lineup [/creator-hub/help-center/integrations/what-is-the-higgsfield-api].
- Models: LTX 2.5 Pro (vendor Lightricks, inferred).
- Credits and cost: $0.17 per second [/blog/higgsfield-api].
- Launched: with the Higgsfield API, Sep 16, 2026 (blog post date).
- Sources: [/blog/higgsfield-api] [/blog/generate-ai-videos-higgsfield-api] [/creator-hub/help-center/integrations/what-is-the-higgsfield-api]

### PixVerse 6 (API catalog)
- What it does: PixVerse family video model in the Higgsfield API catalog.
- How to use: call its model endpoint through the Higgsfield API.
- Inputs and settings: native audio as a per-model option for the PixVerse family [/creator-hub/help-center/integrations/what-is-the-higgsfield-api].
- Limits: website availability not stated.
- Models: PixVerse 6.
- Credits and cost: $0.115 per second [/blog/higgsfield-api].
- Launched: with the Higgsfield API, Sep 16, 2026 (blog post date).
- Sources: [/blog/higgsfield-api] [/blog/generate-ai-videos-higgsfield-api]

## Agents, MCP, API and plugins

### Supercomputer
- What it does: Higgsfield's agentic workspace: one chat that plans a multi-step task, routes each step to image, video, audio and text models, runs them, and assembles the result. It also researches, writes code, works with files (PDFs, presentations), builds sites, apps and games, and acts in connected apps.
- How to use: 1. Open higgsfield.ai, then Supercomputer 2. Describe the deliverable in plain language (optionally attach a file, image, video, document or URL) 3. Review the proposed plan and the credit cost 4. Approve 5. Refine by replying; the agent re-runs only what changed. [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/blog/higgsfield-supercomputer-guide]
- Inputs and settings: page controls include New chat (Ctrl Enter), Projects, Skills, Connectors, an "Ask before generating" toggle, a project picker ("No project"), Free Mode, Try MCP, and use-case tabs All, Marketing, Explainer videos, Apps, Games, each with Recreate cards. Sidebar areas per help center: New chat and Search, Apps, Games, Skills, Connectors, Memory, Faceless channel. Parallel chats: 10 on Ultra, 3 on Plus. [/supercomputer] [/blog/ai-batch-generation-tools-2026]
- Limits: paid plans only; guide says most meaningful actions need Plus or above; a listicle says it is not on Starter; help center says availability depends on plan. Web only (not inside Claude or ChatGPT); the agentic blog also says it runs in Telegram. Not a frame-level editor. Pause or stop mid-task; only completed steps are charged. Out of credits: agent stops and offers a top-up in chat, then resumes. [/blog/higgsfield-supercomputer-guide] [/blog/automate-ai-video-no-code] [/blog/agentic-ai-for-content-creation]
- Models: generation models are picked automatically (Soul, Cinema Studio, Seedance, Nano Banana, and others per help; Veo, Kling, Seedance, Flux, Nano Banana, GPT Image, MiniMax Hailuo per the agentic blog), with Cinema Studio, Soul ID and Marketing Studio as driven features. LLM is chosen by Orchestrator or manually (see LLM roster entry). Home page tile calls it "Agent powered by GPT-6 Astra". [/] [/blog/agentic-ai-for-content-creation]
- Credits and cost: each generation step deducts standard credits; running cost shown as the task proceeds. Free Mode makes text interaction cost zero credits (generation still paid). Example: 4K character image plus Seedance 2.0 10 s 1080p animation is about 90 credits (~$4.50); a full end-to-end production about 200 credits (~$10). Unlimited models never apply. One brand-launch case cost $121 in credits. [/blog/how-we-built-supercomputer] [/blog/higgsfield-supercomputer-guide] [/blog/make-many-with-ai]
- Launched: earliest dated mention May 31, 2026 (blog post date); Inside Higgsfield build story Sep 16, 2026 (blog post date).
  - Build history: first harness took about six weeks; precursors were AI Director in Cinema Studio 3.5 and the Canvas agent; the system now also runs inside Cinema Studio and Canvas, and the Adobe plugin page advertises "Supercomputer inside the plugins". Mobile redesign (Sep 24, 2026, changelog) added an Agent tab with scenarios such as Genjutsu and GPT-6 Astra. [/blog/how-we-built-supercomputer] [/plugins/after-effects] [/creator-hub/changelog]
- Aliases: the /ai-assist and /chat routes now serve the Supercomputer page, so AI Assist and the newer Higgsfield Chat appear folded into it (inferred) [/ai-assist] [/chat].
- Sources: [/supercomputer] [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/blog/how-we-built-supercomputer] [/blog/higgsfield-supercomputer-guide] [/blog/agentic-ai-for-content-creation] [/creator-hub/help-center/tools/which-higgsfield-tool-should-i-use] [/blog/make-many-with-ai]

### Supercomputer LLM roster and Orchestrator
- What it does: the chat LLM can be left to Orchestrator (the default router that sends each step to a best-fit model, pitched as cheaper and faster than one flagship) or picked in the model selector. Help center lists vendors Anthropic, OpenAI, Google, xAI, DeepSeek "and others".
- How to use: 1. Open Supercomputer 2. Model selector 3. Pick a model or leave Auto/Orchestrator. Changelog: Orchestrator is default, so newer models such as GPT-6.1 Sol must be selected manually. [/creator-hub/changelog]
- Inputs and settings: selector is switchable per chat; Sep 5, 2026 selector (3D Jutsu agent on Supercomputer) showed Auto (default, free), GPT 6 Astra, Claude Fable 5.1, Claude Opus 5, GPT 5.6 Sol, GLM-5.3 Flash. Games builder showed Kimi K3 as default (Jul 28). [/blog/higgsfield-3d-jutsu] [/blog/higgsfield-ai-games]
- Models (every LLM the pages call selectable):
  - Claude Sonnet 5.5: Sep 27, 2026 (changelog); over 30% faster output than Claude Sonnet 5; for well-defined tasks.
  - Claude Opus 5.5: undated changelog title; recommended for complex, open-ended work. Katana page credits "Claude Opus 5.5". 3D Jutsu post instead lists "Claude Opus 5".
  - Claude Fable 5.1: undated changelog title "Now in Supercomputer"; in Sep 5 selector.
  - GPT-6.1 Sol: Sep 29, 2026 (changelog); text model for code and agentic tasks.
  - GPT-6 Sol and GPT-6 Luna: undated changelog title "Now in Supercomputer and MCP".
  - GPT-6 Astra: two undated titles, "Now in Supercomputer" then "Now in Higgsfield MCP and Supercomputer"; Games 2.0 post Sep 7, 2026 (blog post date).
  - GPT 5.6 Sol: in Sep 5 selector.
  - Grok 4.7: undated changelog title "Grok 4.7 in Supercomputer".
  - Ox Alpha: undated title "Free in Supercomputer"; replaced per later undated title "GLM-5.3 Flash replaces Ox Alpha in Supercomputer".
  - Older roster (Jul 3, 2026 guide): Claude Opus 4.6 (long-form), Claude Sonnet 4.6 (practical default), Gemini 3.1 Pro (multimodal), Gemini 3.5 Flash and Gemini 3.0 Flash (speed), GPT-5.5 (multi-step), Grok 4.3 (research), Kimi K2.6 and DeepSeek V4 Pro (coding). [/blog/higgsfield-supercomputer-guide]
- Limits: Claude Fable 5 is never listed in the selector; it appears as the external Claude model in MCP how-tos and as the "Fable engine" behind Supercomputer games (help center). [/creator-hub/help-center/integrations/external-integrations-higgsfield]
- Credits and cost: text cost not itemised per LLM; Auto is free (3D Jutsu post) and Free Mode text is free; but a website build billed 1,072.32 credits for "the agent's own reasoning and code". [/blog/build-website-with-ai]
- Launched: per model, dates above.
- Sources: [/creator-hub/changelog] [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/blog/agentic-ai-for-content-creation] [/blog/higgsfield-supercomputer-guide] [/blog/higgsfield-3d-jutsu] [/blog/higgsfield-mcp-gpt6-astra-games-2] [/katana] [/]

### Supercomputer skills and AI employees
- What it does: a skill is packaged know-how (ordered steps, prompting rules for specific models) the agent applies to a task, e.g. product brief to UGC video. The team defines a skill as know-how a person has and the LLM lacks.
- How to use: 1. Sidebar, Skills 2. Browse Skills by Higgsfield, Made by community, or My skills 3. Trigger with "/" in chat or by name. Supercomputer also builds skills from your chats; Create new builds one by hand. [/creator-hub/help-center/tools/how-do-i-use-supercomputer]
- Inputs and settings: official skills named: Product UGC, Higgsfield Faceless Video, Shorts Maker, YouTube Covers, Personal Clipper; use cases TV Commercials, Animated Infographics, Localization. Page cards: Ad Multiplier, Editorial Motion Graphics, Higgsfield Faceless Video, Cartoon Faceless Video, SaaS UGC video, Physical UGC video, Brandkit, Shorts Maker, Website Building. Older guide cites /montage and /cinematic and a Skill Marketplace. [/supercomputer] [/blog/higgsfield-supercomputer-guide]
  - AI Employees: pre-built agents in the Supercomputer Marketplace, each with installable skills: Cartoon Animator (24 skills, 3.4M users), Motion Designer (43 skills, 1.3M), Podcast Producer (4 skills, 3.1M), Product Photographer (24 skills, 5.2M). Home page also shows Character Creator, Cinematic Director, Content Lead, Motion Designer. [/blog/agentic-ai-for-content-creation] [/]
- Limits: Supercomputer skills and CLI skills are separate systems and not interchangeable. Skills also run through MCP in Claude and the ChatGPT plugin. Memory and skills can be imported from Claude, Claude Code, Codex and ChatGPT. [/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli] [/blog/agentic-ai-for-content-creation]
- Models: per skill; not stated.
- Credits and cost: a skill runs multiple generation steps, each at standard rates; longer outputs cost more.
- Launched: not stated (present by Jun 15, 2026 blog post date).
- Sources: [/supercomputer] [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/blog/how-we-built-supercomputer] [/blog/agentic-ai-for-content-creation] [/blog/higgsfield-supercomputer-guide]

### Connectors and scheduled tasks
- What it does: connectors link Supercomputer to outside apps so a task can pull briefs in and push results out; Scheduled Tasks (CronJobs) rerun a brief on a schedule.
- How to use: 1. Supercomputer, Connectors 2. Press + next to an app and sign in once 3. Write the brief naming where output goes 4. Run once manually and approve the cost 5. Ask the agent to repeat it (e.g. every weekday); it takes a schedule slot. [/blog/automate-ai-video-no-code]
- Inputs and settings: 30+ connectors (one guide says Slack, Google Drive, Notion, Gmail, Figma and 25+ others). Named: Telegram, Slack, TikTok, Gmail, Google Drive, Notion, Dropbox, Google Sheets, LinkedIn, X, Threads, Instagram (select regions), Figma. "Add custom MCP" connects your own MCP server. Schedules: daily, weekly, or once at a set time. [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/blog/claude-ad-production-end-to-end]
- Limits: scheduled task slots: Plus 2, Ultra 10 (checked Oct 10, 2026). Connectors on all paid plans. No scheduling from Claude or ChatGPT; only in Supercomputer. [/blog/automate-ai-video-no-code] [/blog/ai-batch-generation-tools-2026]
- Models: n/a.
- Credits and cost: each run deducts standard credits; cost shown before each run. Plus $49/month, Ultra $129/month cited.
- Launched: not stated.
- Sources: [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/blog/automate-ai-video-no-code] [/blog/agentic-ai-for-content-creation] [/blog/higgsfield-supercomputer-guide] [/blog/claude-ad-production-end-to-end] [/blog/start-faceless-channel-with-ai] [/blog/best-automated-content-creation-tools]

### Memory, projects and storage in Supercomputer
- What it does: Memory keeps brand, audience, references and palettes between chats; Projects give several chats shared context; workspace storage holds task files.
- How to use: 1. Pick a project in the chat bar 2. Refer to earlier assets by name (e.g. a character saved as "heroine") 3. Ask the agent in chat to delete memories 4. Manage Storage to buy more space. [/blog/how-we-built-supercomputer] [/blog/higgsfield-supercomputer-guide]
- Inputs and settings: memory is shown as a graph and can be selectively deleted; @elements references (Soul ID) keep a character across scheduled runs.
- Limits: storage is measured against the plan allowance; extra storage cost shown before confirming (amount not stated).
- Models: n/a. The harness keeps visual memory without reloading all images and video into the LLM.
- Credits and cost: extra storage is paid in credits; price not stated.
- Launched: "Projects. Now in Supercomputer" undated changelog title (listed just after "Grok Bot. Now in Higgsfield MCP").
- Sources: [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/blog/higgsfield-supercomputer-guide] [/blog/how-we-built-supercomputer] [/creator-hub/changelog] [/blog/automate-ai-video-no-code]

### Faceless channel (Faceless Content Factory skill)
- What it does: turns a topic into a finished animated faceless YouTube video with AI script, voiceover, 2D animation, music and subtitles.
- How to use: in Supercomputer: 1. Sidebar, Faceless channel 2. Pick a visual style 3. Enter a topic 4. Approve. Via MCP: 1. Connect Higgsfield 2. Name the style and topic in one sentence 3. Watch stages (video, narration, montage, subtitles) 4. Review one combined file. [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/blog/faceless-videos-ugc-ads-2026]
- Inputs and settings: styles include Stickman Cartoon, Editorial Motion Graphics, Claymotion, Paper Diorama, Watercolor Chronicle, Fairy Tale & Myth, Whiteboard Doodle, Pixel Art. MCP skill slugs /vox-mixed-media (Editorial Motion Graphics) and /stickman-explainer. [/mcp]
- Limits: pages disagree: help center says up to 15 minutes and 12 styles; Aug 17 blog says up to 10 minutes and 13 styles. Output exceeds the 15 s single MCP generation cap because it stitches segments.
- Models: not named per step (inferred: Higgsfield video, voice and music models).
- Credits and cost: 1-minute 1080p example: 12 credits reference images, 180 credits video (6 blocks x 30), 12 credits narration, 17.5 credits upscale = 221.5 credits ($11.08). Same rates as the website.
  - Related: a Jul 9 guide uses a downloadable higgsfield-explainer skill in Claude to make a 10-minute video (~100 scenes), a Spanish version, 3 titles and 3 thumbnails, about 20 shorts via Shorts Studio, and a 30-day plan. Faceless Studio is a separate web tool. [/blog/faceless-channel-one-prompt]
- Launched: Aug 17, 2026 (blog post date, "two new skills").
- Sources: [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/blog/faceless-videos-ugc-ads-2026] [/blog/faceless-channel-one-prompt] [/blog/faceless-channel] [/supercomputer] [/mcp]

### Higgsfield Apps (Supercomputer app builder)
- What it does: full generative web apps built from a chat prompt inside Supercomputer, with design, code, database, sign-in and Higgsfield models wired in; app users sign in with their own Higgsfield accounts and pay with their own credits.
- How to use: 1. Supercomputer, Products, Apps (higgsfield.ai/supercomputer/apps) 2. Describe the app in one sentence 3. Pick type/layout, style and mode 4. Answer follow-ups (incl. whether to list in the community feed) 5. Ask for changes in chat 6. Publish. [/blog/introducing-higgsfield-apps] [/creator-hub/help-center/tools/what-are-higgsfield-apps]
- Inputs and settings: launch post: 4 app types (Custom, Simple App, Studio, Preset App), 4 styles (Custom, Higgsfield, Y2K, Modern), modes Efficient and Smart, 15+ generation models (image, video, 3D). Help center: 3 templates (App detail, Preset, Studio).
- Limits: up to 20 app builds per day; publish runs an LLM check for malicious intent, NSFW and IP, then SEO and security checks; URL name.higgsfield.app; custom domains only via contact. Code is a React app on one server with database and file storage, git access, read-only DB view, env-var secrets, renamable subdomain. Listed apps can be remixed. Games post says Apps, Websites and Games share one monthly publish cap. Also buildable from Claude or Cursor via MCP. [/blog/higgsfield-ai-games]
- Models: "15+ generation models"; not named.
- Credits and cost: building spends the creator's credits (text steps plus any generations); usage is billed to app users. Example app Plushies: $1 for 20 photos or two videos. My Apps shows Credit Spend per app.
- Launched: Jul 9, 2026 (blog post date) with a $100,000 App Contest (1st $25k, 2nd $15k, 3rd $10k, 10 x $5k) open until Jul 21, winners Jul 28; 500+ apps at launch. "Higgsfield Apps. Back online" is an undated changelog title.
  - Naming note: a Nov 21, 2025 post used "Higgsfield Apps" for older one-photo viral apps (Style Snap, Glitter Sticker, Signboard). [/blog/The-Complete-Guide-to-Viral-Higgsfield-Apps]
- Sources: [/blog/introducing-higgsfield-apps] [/creator-hub/help-center/tools/what-are-higgsfield-apps] [/creator-hub/changelog] [/blog/higgsfield-ai-games]

### Website Building skill
- What it does: Supercomputer (or an MCP agent) designs, codes and publishes a website or landing page from a brief, optionally with an on-page generator for visitors.
- How to use: 1. Make product images first (e.g. Nano Banana Pro) 2. Describe how the site should behave and feel, not the layout 3. Answer the agent's questions 4. Check for invented facts 5. Fix one problem per message 6. Publish to a subdomain and wait for deploy. [/blog/build-website-with-ai]
- Inputs and settings: the agent asks only where answers change the build (2 questions in the test); offers a full code export (175 files); adds database, OG image, favicon, reduced-motion fallbacks unprompted.
- Limits: deploy takes a minute or two and the live URL shows the old version until done; republishing without deploy does nothing. Visitors must sign in with a Higgsfield account to use the generator. Not in ChatGPT per help center (Claude, Cursor, CLI agents only), but the Sep 30 ChatGPT extension entry says websites can be built in ChatGPT, and an Aug 17 blog says Claude and ChatGPT. [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/creator-hub/changelog] [/blog/faceless-videos-ugc-ads-2026]
- Models: Nano Banana Pro for product images in the test; LLM not stated.
- Credits and cost: test build: under 2 hours, 8 messages, 5 build passes, 1,479.32 credits (~$74): text 1,072.32, video 324, images 83, audio 0; 197 credits discarded. Rate: 20 credits per dollar. A May case built a live landing page within a $121 run. [/blog/make-many-with-ai]
- Launched: not stated (guide Aug 9, 2026, blog post date).
- Sources: [/blog/build-website-with-ai] [/supercomputer] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/blog/mcp-for-marketers] [/blog/make-many-with-ai]

### Higgsfield Games
- What it does: builds and auto-deploys a playable browser game from a prompt, with generated art, sound, music, characters and optional multiplayer (lobbies and real-time sync); games can be published to a marketplace and remixed.
- How to use: Supercomputer: 1. Open Games/Gaming 2. Pick genre, style, setting 3. Toggle multiplayer before generating 4. Describe the mechanic 5. Approve each stage (visuals, then audio) 6. Deploy, then optionally Publish. Claude: add the MCP connector (plus a gaming skill) and ask. ChatGPT: install the plugin in the desktop app. [/blog/higgsfield-ai-games] [/blog/higgsfield-mcp-gpt6-astra-games-2]
- Inputs and settings: Jul 28 and Sep 7 posts: genres Shooter, Platformer, Novella, Hypercasual, Racing, Horror; styles Pixel Art, Minimalistic, ASCII, Voxel, Anime, 3D; settings Medieval, Cyberpunk, Retro, Modern, Space, Fantasy. Help center lists different options: genres incl. Action; styles Minimal, Cartoon, Isometric, Realistic 3D, Simple 2D. Per-project model selector. [/creator-hub/help-center/integrations/external-integrations-higgsfield]
- Limits: deploy is not publish; marketplace listing needs Publish. Shares the monthly publish cap with Apps and Websites. Unlimited does not apply.
- Models: first version (Jun 19 post) used Claude Fable 5 in Claude plus a downloadable Game Studio skill; Jul 28 builder default Kimi K3; help center calls the Supercomputer path the "Fable engine"; Games 2.0 runs on GPT-6 Astra (logic, orchestration) with Higgsfield generating assets.
- Credits and cost: from about 70 credits ($3.50) per game, more if stages are regenerated; credits deducted per stage. Fable engine "significantly more" credits with a warning first. Jun test: 3 multiplayer games for $68 total, about 4,000 plays, 121 remixes, up to 22 players in one arena.
- Launched: first games post Jun 19, 2026 (blog post date; marketplace "launched this week"); Supercomputer Games Jul 28, 2026 (blog post date; team says it shipped in two days); Games 2.0 on GPT-6 Astra Sep 7, 2026 (blog post date); browser games in ChatGPT extension Sep 30, 2026 (changelog).
- Sources: [/blog/Higgsfield-Games] [/blog/higgsfield-ai-games] [/blog/higgsfield-mcp-gpt6-astra-games-2] [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/blog/how-we-built-supercomputer] [/creator-hub/changelog]

### Higgsfield MCP
- What it does: an MCP server that lets Claude or any MCP client generate images, video, characters and audio on the user's Higgsfield account, run skills, browse history and check balance, with no API key (OAuth).
- How to use (Claude): 1. Settings (or Customize), Connectors 2. Add custom connector named Higgsfield 3. URL https://mcp.higgsfield.ai/mcp 4. Connect and authorize 5. Test with "What is my Higgsfield credit balance?" [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent]
- Inputs and settings: operations: image and video generation on all models, image/video upscaling, background removal, outpaint and video reframe, Kling 3.0 Motion Control, Soul characters and reference Elements, audio (voiceover, cloning, voice change, dubbing), Personal Clipper, balance and generation/upload lists. Reference files go through an in-chat Higgsfield upload window (agent cannot read chat attachments) or a direct URL. n8n test exposed tools incl. batch variants, Marketing Studio and jobs_wait, with a get_cost parameter. MCP can post to TikTok (direct or drafts) and run Virality Predictor; Marketing Studio's template gallery opens in Claude. [/blog/automate-ai-video-n8n-make] [/blog/claude-ad-production-end-to-end]
- Limits: active paid subscription required (May post said free signup credits work). Up to 4K and clips up to 15 s per generation. Results land in Assets tagged MCP within about 60 s. No native credit cap; use prompt instructions. Free Claude plan allows one custom connector; on Team/Enterprise an owner adds it first. Falls under Developer Terms. Errors: "Authorization with the MCP server failed" (reconnect), "MCP HTTP exchange failed" (retry).
  - URL note: help center says the only official URL is mcp.higgsfield.ai/mcp; the May post gives https://mcp.higgsfield.ai and a Jun post gives https://higgsfield.ai/mcp. [/creator-hub/help-center/getting-started/official-higgsfield-platforms]
- Models: "30+ models"; page lists Nano Banana Pro, Google Omni Flash, Seedance 2.5, Seedream 5.0 Lite, Seedance 2.0, Kling 3, GPT Image 2, Soul 2.0. May post listed Veo 3.1, Sora 2, Kling 3.0, Seedance 2.0, Wan 2.6, MiniMax Hailuo, Soul, Soul Cinema, Cinema Studio, Nano Banana Pro, Flux 2.0, Seedream 4.5. n8n post: MCP includes Veo 3.1 (API does not). [/mcp]
- Credits and cost: plan credits at standard rates (see next entry).
- Launched: earliest guide May 8, 2026 (blog post date); "Higgsfield MCP. Fixed" undated changelog title.
- Sources: [/mcp] [/mcp?tab=claude] [/creator-hub/help-center/integrations/what-is-higgsfield-mcp] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP] [/blog/claude-higgsfield-mcp-creative-studio] [/blog/mcp-for-marketers] [/blog/MCP-For-Motion-Designers]

### MCP vs web differences
- What it does: the rules for how credits and access differ between higgsfield.ai, MCP, CLI, plugins, Supercomputer, Canvas and the API. Core rule: Unlimited model access and free generations apply only to manual use on higgsfield.ai; MCP, CLI, Canvas, Supercomputer, the ChatGPT plugin and other automated tools always deduct credits at the same standard rates. Generations from every surface land in Assets. [/creator-hub/help-center/integrations/what-is-higgsfield-mcp] [/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them]
- How to use: to generate on an Unlimited model without spending credits, do it manually on higgsfield.ai.
- Inputs and settings (surface comparisons):
  - Supercomputer vs MCP: Supercomputer runs on the web in Higgsfield's chat for full agentic tasks; MCP runs in your own assistant for generating from it. [/creator-hub/help-center/tools/how-do-i-use-supercomputer]
  - MCP vs CLI: MCP suits chat agents (Claude web, Cowork) with full schema per call and free parameter choice; CLI + Skills suits coding agents with minimal tokens and structured output. [/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli]
  - MCP and CLI vs API: MCP/CLI use the higgsfield.ai account and plan credits, no key; the API is a separate account, key and US dollar balance; neither balance transfers. [/creator-hub/help-center/integrations/what-is-the-higgsfield-api]
- Limits (conflicts): the Supercomputer help table puts "Web only (higgsfield.ai)" under Supercomputer in the Unlimited row (ambiguous), while other help pages say Supercomputer always deducts. Jul 28 Unlimited MCP trial made unlimited work in Claude and ChatGPT; Jul 21 After Effects post says Unlimited-list models generate free in that plugin; Aug 1 help center and later posts say no surface outside the web gets Unlimited. [/blog/unlimited-mcp] [/blog/higgsfield-after-effects]
- Models: all models available on each surface; Veo 3.1 is in MCP but not the API. [/blog/automate-ai-video-n8n-make]
- Credits and cost: $1 = 20 credits (n8n and website posts). Web parallel generation: up to 2 videos on Starter, 6 on Plus, unlimited paid parallel on Ultra. [/blog/ai-video-api-pricing-vs-subscriptions]
- Launched: rule documented Aug 1, 2026 (help center date).
- Sources: [/creator-hub/help-center/integrations/what-is-higgsfield-mcp] [/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them] [/creator-hub/help-center/credits/what-uses-my-credits] [/creator-hub/help-center/tools/how-do-i-use-supercomputer] [/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli] [/creator-hub/help-center/integrations/what-is-the-higgsfield-api] [/blog/ai-video-api-pricing-vs-subscriptions] [/blog/higgsfield-after-effects]

### Unlimited MCP
- What it does: a 24-hour free trial that made unlimited generation work inside Claude and ChatGPT via MCP, as well as on the web.
- How to use: 1. Connect MCP in Claude or the plugin in ChatGPT 2. Accept the trial offer shown 3. Add a card (not charged that day) 4. Generate; cancel by typing "I want to cancel the trial" in chat or via Manage Account, Subscription.
- Inputs and settings: 11 image models (Seedream 5.0 Pro, Seedream 5.0 Lite, Seedream 4.5, Nano Banana Pro, Nano Banana 2, Nano Banana, Kling O1 Image, GPT Image 2, GPT Image (High), Soul 2.0, Flux.2 Pro), 5 audio (Seed Audio 1.0, Eleven v3, MiniMax Speech 2.8 HD, VibeVoice, Seed Speech), 7 video (Seedance 2.0 1080p 8 s, Seedance 2.0 Mini 8 s, Seedance 2.0 Fast 8 s, Kling 3.0 1080p 8 s, Kling 3.0 Motion Control 1080p 8 s, Wan 2.7 1080p 8 s, Gemini Omni Flash 7 s).
- Limits: new users only, until Jul 31; images up to 2K; one generation at a time; audio on web and Claude only, not ChatGPT. Converts to Plus monthly after 24 hours unless cancelled. Existing web-only offers (All Unlimited on Plus and above, Unlimited Models Marketplace) never included MCP.
- Credits and cost: free during trial; then Plus monthly.
- Launched: Jul 28, 2026 (blog post date). Superseded by the Aug 1 help-center rule that MCP always deducts credits.
- Sources: [/blog/unlimited-mcp] [/creator-hub/help-center/integrations/what-is-higgsfield-mcp]

### Higgsfield skills for Claude and agents
- What it does: preset multi-step workflows (concept, script, generations) callable from Claude, ChatGPT, Cursor, CLI agents and Supercomputer; catalog at higgsfield.ai/skills and on the MCP page with Recreate buttons.
- How to use: 1. Connect MCP 2. Name the skill in the request (e.g. "Using the Product Review UGC skill...") or press Try in Claude/ChatGPT on the MCP page.
- Inputs and settings: categories: Marketing (Physical UGC Video, Ad Multiplier, Brandkit, TV Commercials), UGC Factory (Product Review, Unboxing, Try-on, Tutorial, SaaS UGC), Faceless Content Factory (Stickman Cartoon, Editorial Motion Graphics, Whiteboard Doodle, Watercolor Chronicle, Pixel Art, Claymotion), Utility (Localization, Subtitles, Voiceover, Personal Clipper, Shorts Maker), Motion & Design (Brandkit, Animated Infographics, Motion Design), Website Building. MCP page skills with slash slugs: Recreate aura edits /katana, Product review UGC /ugc-flow, Ad Recreator /marketing-adapt-video, Ad Strategist /marketing-research-to-ads, Hook Multiplier /marketing-hook-variants, Editorial Motion Graphics /vox-mixed-media, Stickman cartoon /stickman-explainer. Filters: Popular, Paid Ads, Motion Design, Marketing, Production, UGC, Faceless, For After Effects, For Blender. [/mcp]
- Limits: Website Building not in ChatGPT per help center. Audio skills not in ChatGPT.
- Models: per skill; not stated.
- Credits and cost: standard credits per generation step.
- Launched: "Production Skills Bundle" is an undated changelog title (just before the Sep 24, 2026 entries); Claude creative studio post (Sep 2, 2026) describes "full production skills" via MCP: a complete ad, a faceless explainer, a multi-variation campaign.
- Sources: [/mcp] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/blog/mcp-for-marketers] [/blog/claude-ad-production-end-to-end] [/blog/claude-higgsfield-mcp-creative-studio] [/creator-hub/changelog]

### Downloadable Claude skill files
- What it does: blog tutorials ship skill files to drop into a Claude chat alongside the Higgsfield MCP connector.
- How to use: 1. Connect Higgsfield MCP in Claude 2. Download the file from the post 3. Drop it into the chat (or install it like the connector) 4. Prompt in one line, e.g. "Make a motion design video".
- Inputs and settings: game-studio.md (interviews you, writes a design doc, builds, deploys, offers marketplace publish); SKILL_MOTION.md (Motion Design Skill: storyboard, then "Approve and generate" on Seedance 2.0); client-finder.md (scrapes Google Maps, Kickstarter, Amazon/Shopify for leads, then Gmail connector outreach); higgsfield-explainer.skill (topic research, retention-first script, 10-minute render). [/blog/Higgsfield-Games] [/blog/MCP-For-Motion-Designers] [/blog/faceless-channel-one-prompt]
- Limits: these are blog downloads, not the official catalog.
- Models: Claude Fable 5 as the planner in all three posts; Seedance 2.0 for motion design video.
- Credits and cost: games $68 for three; others not stated.
- Launched: Jun 10, Jun 19 and Jul 9, 2026 (blog post dates).
- Sources: [/blog/Higgsfield-Games] [/blog/MCP-For-Motion-Designers] [/blog/faceless-channel-one-prompt] [/blog/faceless-channel]

### Claude workflow guides
- What it does: step-by-step recipes for running production inside Claude with MCP.
- How to use: connect MCP, then follow each recipe's prompts in one conversation, approving each stage before the next.
- Inputs and settings:
  - Talking AI avatar: Soul 2.0 character set, Soul ID training on 20 to 80 photos (~10 min, in-chat upload), Seed Audio voice (20 presets, e.g. Delia, or clone from 10 s to 3 min), Seedance 2.5 lip-synced clip from start frame plus audio. [/blog/talking-ai-avatar-inside-claude]
  - Full ad campaign: one product into UGC (15 to 30 s), product video (8 to 15 s), social ad (8 to 15 s) and explainer (15 to 30 s); Marketing Studio takes up to 9 reference inputs per call; still frame approved before motion. [/blog/full-ad-campaign-inside-claude]
  - End-to-end ad production: Higgsfield MCP for creatives and TikTok posting; Meta Ads MCP (mcp.facebook.com/ads) for Ad Library search, campaigns built paused, and reporting; finished video uploaded to Ads Manager by hand. Three autonomy levels: assistant, operator, agent. Verified Sep 17, 2026. [/blog/claude-ad-production-end-to-end]
- Limits: research beyond Meta Ad Library stays manual; no credit cap; paid activation needs review; two connectors need a paid Claude plan.
- Models: Soul 2.0, Soul ID, Seed Audio, Seedance 2.5, Marketing Studio, Higgsfield Explainer.
- Credits and cost: speech ~1 credit for 10 s, ~2.3 for 20 s, ~3.8 for 26 s; character sheet 4 Soul 2.0 iterations at 0.125 credits each (0.5 total). [/blog/mcp-for-marketers]
- Launched: Aug 12, 2026 to Sep 2026 (blog post dates).
- Sources: [/blog/talking-ai-avatar-inside-claude] [/blog/full-ad-campaign-inside-claude] [/blog/claude-ad-production-end-to-end] [/blog/mcp-for-marketers] [/blog/claude-higgsfield-mcp-creative-studio]

### Higgsfield extension for ChatGPT (Higgsfield plugin)
- What it does: official ChatGPT plugin/extension that lets ChatGPT generate images, video, branded content, ads, websites, web apps and games on the user's Higgsfield account.
- How to use: 1. ChatGPT Plugins Directory (or higgsfield.ai/mcp, Add Higgsfield plugin, or chatgpt.com/plugins/higgsfield, Open plugin) 2. Add 3. Sign in to Higgsfield 4. Mention Higgsfield or pick it from tools 5. Describe the shot; ask for the cost first if wanted. Reconnect via Settings, Plugins, Higgsfield. [/blog/generate-ai-videos-chatgpt-2026] [/blog/automate-ai-video-no-code]
- Inputs and settings: slash commands /effects (Viral Presets), /product, /motion, /marketing-studio (Marketing Studio), /genjutsu (Genjutsu), /use-after-effects (AI Motion Designer). Sidebar items Create Image, Create Video, Genjutsu, Visual Effects. Attach images up to 20 MiB via paperclip. Ad Multiplier variations, UGC, product ads. [/creator-hub/changelog] [/ai-motion-designer]
- Limits: audio generation not available; Website Building skill unavailable per help center (conflicts with Sep 30 changelog, which lists sites and games). Plugin availability varies by plan, region and workspace; OpenAI lists plugins on Free, Go, Plus and Pro. Active Higgsfield subscription required.
- Models: catalog shown: Nano Banana Pro, Google Omni Flash, Seedance 2.5, Seedream 5.0 Lite, Seedance 2.0, Kling 3, GPT Image 2, Soul 2.0; "35+ models and tools" incl. Cinema Studio 4.0. [/mcp?tab=chatgpt]
- Credits and cost: standard credits; examples: 30 s Seedance 2.5 cinematic shot 540 credits (+0.5 for Soul 2.0 character sheet at 2K); 15 s 9:16 1080p UGC ad 270 credits. [/blog/generate-ai-videos-from-chatgpt]
- Launched: plugin in use by Jul 28, 2026 (blog post date); "Higgsfield extension for ChatGPT" on OpenAI's new extensions feature Sep 30, 2026 (changelog). Context: OpenAI ended Sora web/app Apr 26, 2026 and the Sora API Sep 24, 2026.
- Sources: [/mcp?tab=chatgpt] [/creator-hub/changelog] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/blog/generate-ai-videos-chatgpt-2026] [/blog/generate-ai-videos-from-chatgpt] [/blog/automate-ai-video-no-code]

### Effects 2.0 viral presets in ChatGPT
- What it does: brings Higgsfield viral effect presets into ChatGPT; in the later extension they are reached with /effects ("Viral Presets") and the Visual Effects item.
- How to use: install the plugin, then type /effects. [/creator-hub/changelog]
- Inputs and settings: not stated beyond the slash command.
- Limits: not stated.
- Models: not stated.
- Credits and cost: standard credits (plugin rule).
- Launched: "Effects 2.0. Viral presets in ChatGPT" undated changelog title (listed between "GPT-6 Astra. Now in Higgsfield MCP and Supercomputer" and "Introducing AI Motion Designer").
- Sources: [/creator-hub/changelog] [/blog/automate-ai-video-no-code]

### OpenAI Dots
- What it does: always-on AI agents in ChatGPT ("dots") that can generate video and images on Higgsfield through the plugin; home page pitches "Higgsfield Dots in ChatGPT" for step-by-step creative projects.
- How to use: 1. Install the Higgsfield plugin 2. Set up the first dot on desktop 3. Chat with it in ChatGPT, Slack or Teams.
- Inputs and settings: Higgsfield tools exposed: Cinema Studio, Genjutsu, Marketing Studio and more.
- Limits: ChatGPT Pro and Business Premium in supported regions, plus Enterprise, Edu and Healthcare when an admin enables Dots.
- Models: each dot runs on GPT-6.1 Sol with its own cloud computer, per OpenAI.
- Credits and cost: not stated (inferred: standard Higgsfield credits per plugin rule).
- Launched: Sep 29, 2026 (changelog).
- Sources: [/creator-hub/changelog] [/]

### Higgsfield CLI and skills
- What it does: a command-line client plus a skills pack that lets coding agents (Claude Code, Cursor, Codex, OpenClaw, Hermes) generate on the user's Higgsfield account with structured, low-token calls.
- How to use: 1. npm i -g @higgsfield/cli 2. higgsfield auth login (browser sign-in) 3. npx skills add higgsfield-ai/skills 4. In the agent, call /higgsfield:generate or ask in plain language. The agent can run all three itself from a pasted setup message. [/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli]
- Inputs and settings: three skills: generate (any model, up to 4K; agent picks or you name one), soul (trains a Soul character: upload, training, naming), product-photoshoot (product link or images to shots and video ads). Image presets: product_shot, lifestyle_scene, closeup_product_with_person, pinterest_pin (2:3), hero_banner, social_carousel (3 to 10 slides), ad_creative_pack, virtual_model_tryout, conceptual_product, restyle. Video presets: UGC, Tutorial, Unboxing, Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On, Pro Virtual Try On.
- Limits: no API key; Developer Terms apply; Unlimited and free gens do not apply. Older versions failed to pass references; re-run the skills install to update. Disconnect by logging out in the CLI.
- Models: all Higgsfield models (Soul, Nano Banana Pro for images; Seedance, Kling, Veo for video named).
- Credits and cost: plan credits at standard rates.
- Launched: not stated (help article Aug 1, 2026).
- Sources: [/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/blog/generate-ai-videos-ai-agents-2026] [/blog/create-ai-videos-hermes-agent-higgsfield] [/mcp]

### Higgsfield API
- What it does: self-serve developer API: one key opens a curated catalog of video and image models, paid per generation from a prepaid US dollar balance, separate from higgsfield.ai plans. Console is called Open Higgsfield.
- How to use: 1. Sign up as individual or company 2. Add a payment method and fund the balance 3. Create a key in the console (open.higgsfield.ai; one post says console.higgsfield.ai); key is ID plus secret, shown once 4. Call api.higgsfield.ai via Python or TypeScript SDK or REST (header Authorization: Key KEY_ID:SECRET) 5. Submit, then poll status_url or receive a webhook, then download. Docs at docs.higgsfield.ai. [/creator-hub/help-center/integrations/what-is-the-higgsfield-api] [/blog/automate-ai-video-n8n-make]
- Inputs and settings: async lifecycle returns request_id, status_url, cancel_url; statuses queued, in_progress, completed, failed, nsfw, canceled; webhook via hf_webhook query parameter per request, retried up to 2 hours; poll every 2 to 10 s. Estimate endpoint returns cost before running. Each model page lists rate, resolutions, durations, release date, sample code, "Copy for agent", comparison table, and setup prompts for Claude Code, Cursor and ChatGPT (Codex). Organizations (personal, team), Analytics with CSV export, Billing, auto top-up. Example endpoint /bytedance/seedance-2.5/text-to-video.
- Limits: minimum top-up $5; funds expire 1 year after adding; balance cannot go negative (requests wait). Files kept at least 7 days. Concurrency: help says creating a key unlocks 20; Oct posts say 2 below $25 added in last 28 days, 10 from $25, 20 from $100, 40 from $1,000, more via sales. No standalone audio models (native audio as an option on Seedance, Kling, LTX, PixVerse). Veo 3.1 not in the API. Max length up to 30 s, up to 4K, by model. API access cannot be resold or exposed as a standalone service; keys cannot be shared. No first-party n8n/Make node.
- Models: "50+" models (one Oct 13 post says 35+ models and tools): Seedance, Kling, Wan, MiniMax, PixVerse, LTX, Grok (video); Ideogram, Recraft, Qwen (image); Higgsfield's Soul 2, Soul Cinema, DoP, Marketing Studio Image, plus Genjutsu and Cinema Studio 4.0 per Oct posts. New models land on release day. [/blog/best-ai-video-generation-apis] [/blog/ai-video-api-pricing-vs-subscriptions]
- Credits and cost: Sep 16 list rates: Marketing Studio Image $0.0059/image; Soul 2 and Soul Cinema $0.0032/image; DoP $0.125/generation; Kling 2.5 $0.042/s; Kling 2.6 $0.07/s; Seedance 2.5 $0.0738/s; Kling 3.0 $0.112/s; PixVerse 6 $0.115/s; MiniMax H3 $0.13/s; LTX 2.5 Pro $0.17/s; Wan 3.0 $0.20/s; Grok Imagine Video 1.5 $0.25/s; Seedance 2.0 $0.9332/s; Grok Imagine 2.0 $0.06/image; Ideogram 4.0 $0.06; Recraft 4.1 $0.035; Qwen Image 3 $0.03. Later posts: Kling 3.0 Standard 720p audio off $0.084/s ($0.84 per 10 s); Seedance 2.5 "from $0.2057 per second"; Soul ID from $2.50 per request. Failed and NSFW requests not billed. Soul 2 + Soul Cinema + 10 s Kling 3.0 pipeline under $1.30. [/blog/higgsfield-api] [/blog/generate-ai-videos-higgsfield-api] [/blog/automate-ai-video-n8n-make]
- Launched: Sep 16, 2026 (blog post date); "Higgsfield API is here" undated changelog title.
- Sources: [/creator-hub/help-center/integrations/what-is-the-higgsfield-api] [/blog/higgsfield-api] [/blog/generate-ai-videos-higgsfield-api] [/blog/ai-video-api-pricing-vs-subscriptions] [/blog/best-ai-video-generation-apis] [/blog/automate-ai-video-n8n-make] [/blog/sora-api-migration-guide] [/creator-hub/help-center/getting-started/official-higgsfield-platforms]

### Higgsfield API cashback and discounts
- What it does: spend-based rebates and model promotions for API users.
- How to use: track progress and level on the cashback page; discounts apply automatically.
- Inputs and settings: Sep 24, 2026: $1 cashback per $1 of API usage until Sep 30, 23:59 UTC. Oct 2, 2026: $15 bonus after the first $100 of spend from topped-up balance, then tiered cashback set by 30-day spend: $5,000 gives 5%, $10,000 8%, $20,000 12%, $50,000 20% for the next 30 days; cycles start at sign-up, everyone starts at 0%. Oct 13, 2026: 60% off Wan 3.0 and Wan 3.0 Prime for all API users until Oct 31, 2026.
- Limits: cashback earned on usage paid from the main balance, not on top-ups; cashback-paid generations do not count toward spend; cashback pays only when it covers a full generation.
- Models: Wan 3.0, Wan 3.0 Prime (discount).
- Credits and cost: as above (US dollars, not credits).
- Launched: Sep 24, Oct 2 and Oct 13, 2026 (changelog).
- Sources: [/creator-hub/changelog]

### Genjutsu API
- What it does: home page tile advertises motion transfer and object swap "with one API call"; Genjutsu is listed in the Higgsfield API catalog.
- How to use: not stated beyond the API flow.
- Inputs and settings: modes Motion transfer and Object swap (inferred from the Genjutsu product).
- Limits: not stated.
- Models: Higgsfield Genjutsu.
- Credits and cost: not stated.
- Launched: not stated (tile present on the Oct 2026 home page; "Introducing Genjutsu" undated changelog title; Genjutsu blog Aug 31, 2026).
- Sources: [/] [/blog/best-ai-video-generation-apis] [/blog/ai-video-api-pricing-vs-subscriptions] [/creator-hub/changelog]

### Hermes Agent
- What it does: Nous Research's open-source autonomous agent; generates Higgsfield images and video through CLI + Skills as part of larger tasks.
- How to use: 1. Install Node.js and npm 2. npm i -g @higgsfield/cli 3. higgsfield auth login 4. npx skills add higgsfield-ai/skills 5. Describe the video, format, duration, references 6. Ask for the cost and approve 7. Refine with follow-ups.
- Inputs and settings: reference images Hermes can access; model named or auto-picked.
- Limits: paid Higgsfield subscription; Hermes model provider or host may bill separately. The /mcp page and a May post say Hermes connects to the MCP server; help center says via CLI. [/mcp] [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP]
- Models: any Higgsfield model.
- Credits and cost: standard plan credits; no Hermes fee from Higgsfield.
- Launched: guide Oct 13, 2026 (blog post date). Supercomputer's harness borrowed self-improvement ideas from Hermes. [/blog/how-we-built-supercomputer]
- Sources: [/blog/create-ai-videos-hermes-agent-higgsfield] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/blog/generate-ai-videos-ai-agents-2026]

### Cursor
- What it does: Higgsfield is installable from Cursor's marketplace for generation inside coding workflows; Cursor can also use CLI + Skills.
- How to use: 1. Customize, Marketplace 2. Find Higgsfield, Add 3. Sign in 4. Ask for an image or video.
- Inputs and settings: image/video, Soul characters, audio, Website Building skill all available; Apps can be built from Cursor via MCP.
- Limits: "MCP HTTP exchange failed" is transient; retry or reconnect.
- Models: all Higgsfield models.
- Credits and cost: standard plan credits.
- Launched: not stated (help article Aug 1, 2026).
- Sources: [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/blog/generate-ai-videos-ai-agents-2026] [/blog/introducing-higgsfield-apps]

### OpenClaw, NemoClaw, Cowork and other MCP clients
- What it does: any MCP-compatible client can use the same server URL; the MCP page names Claude, OpenClaw, Hermes Agent and NemoClaw; a May post adds Cowork and Claude on web, desktop, mobile and Claude Code.
- How to use: add https://mcp.higgsfield.ai/mcp in the client's settings; OpenClaw and Claude Code may instead install the CLI. Codex uses CLI + Skills.
- Limits: third-party agents follow their own terms; the user is responsible for agent actions. Same account can be connected in several agents at once.
- Models: all Higgsfield models.
- Credits and cost: standard plan credits.
- Launched: named by May 8, 2026 (blog post date). OpenClaw and Hermes were cited as "superagents" that shaped Supercomputer; NVIDIA enterprise controls were also an influence. [/blog/how-we-built-supercomputer]
- Sources: [/mcp] [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli]

### Grok Bot in MCP
- What it does: xAI's Grok Bot can use Higgsfield via a plugin.
- How to use: 1. Install Grok Bot 2. Add the Higgsfield plugin 3. Sign in with Higgsfield.
- Inputs and settings: not stated.
- Limits: not stated.
- Models: not stated.
- Credits and cost: standard credits (agent rule).
- Launched: "Grok Bot. Now in Higgsfield MCP" undated changelog title (listed just after "Higgsfield. Now in Blender"); guide Sep 28, 2026.
- Sources: [/creator-hub/changelog] [/blog/generate-ai-videos-ai-agents-2026]

### n8n and Make automation
- What it does: connects Higgsfield to the n8n and Make orchestrators by two routes: the API through HTTP requests, or MCP through each tool's MCP Client.
- How to use:
  - API in n8n: 1. Header Auth credential (Authorization: Key KEY_ID:SECRET) 2. HTTP Request POST to the model endpoint 3. Wait node resumed by webhook, passing {{ $execution.resumeUrl }} in hf_webhook 4. Read the output URL. In Make: one scenario submits, a second Custom webhook scenario receives; or Sleep plus polling.
  - MCP: n8n MCP Client node, HTTP Streamable transport, MCP OAuth2 with Dynamic Client Registration; Make MCP Client app, Call a tool, empty token, OAuth. Pass tool args as one JSON field (e.g. model "soul_2", get_cost true); then jobs_wait for the result.
- Inputs and settings: API account requires a funded balance ($5 minimum); MCP route requires an active paid subscription; n8n can self-host, Make is cloud only.
- Limits: no first-party node; Make sometimes failed to refresh argument fields; Unlimited never applies; Make meters its own operations. Outputs can be resold to clients; API access cannot.
- Models: API catalog (50+) or website lineup incl. Veo 3.1 via MCP.
- Credits and cost: API: Kling 3.0 from $0.084/s, Seedance 2.5 from $0.2057/s; MCP: plan credits, $1 = 20 credits; plans Starter $15/mo, Plus $49/mo ($39 annual), Ultra $129/mo ($99 annual). get_cost and jobs_wait did not consume credits in testing.
- Launched: guide Oct 2, 2026 (blog post date).
- Sources: [/blog/automate-ai-video-n8n-make]

### No-code automation
- What it does: three Higgsfield routes to more clips per hour of effort: batch requests in ChatGPT (extension) or Claude (MCP), scheduled tasks in Supercomputer, or the API for developers.
- How to use: batch: describe a set of variants in one message (e.g. five 9:16 8 s clips with different hooks). Schedule: connect apps, brief once, run once, then ask to repeat (see Connectors and scheduled tasks).
- Limits: chat batches need a manual send each time and no delivery to other apps; schedules only in Supercomputer; slots Plus 2, Ultra 10. Plan details checked Oct 10, 2026.
- Models: "35+ models and tools".
- Credits and cost: plan credits for extension, MCP and Supercomputer; API separate dollar balance. A batch listicle estimates a 50-clip Seedance 2.0 720p batch at about $90 in credits. [/blog/ai-batch-generation-tools-2026]
- Launched: guide Oct 12, 2026 (blog post date).
- Sources: [/blog/automate-ai-video-no-code] [/blog/ai-batch-generation-tools-2026] [/blog/best-automated-content-creation-tools]

### Premiere Pro and After Effects plugin
- What it does: one panel in Premiere Pro and After Effects that generates video and images into the timeline and runs finishing tools; can be driven by an agent.
- How to use: 1. Download from higgsfield.ai/plugins/after-effects (or /plugins/premiere-pro) 2. macOS: open the .dmg, drag to Applications, run the installer (Apple Silicon and Intel); Windows: install aescripts ZXP Installer, drag the .zxp on it 3. Quit Adobe apps first 4. Window, Extensions, Higgsfield.
- Inputs and settings: Generate Video, Generate Image, Reframe (9:16, 16:9, 4:3, 3:4, 21:9, 1:1 with subject tracking), Remove Background (alpha), Draw to Edit (inpaint by brush), Upscale (up to 4K or 8K), Edit Video (prompt edit of the active clip).
  - Agent mode: Supercomputer detects the installed plugin automatically; Claude connects through the Higgsfield Bridge (see below). The agent can build effects and animations, recreate designs from image or video references, write expressions, and import generations into the composition.
- Limits: version 2024 (24.0) or newer per help center and blog; plugin page says Premiere Pro 2025+ or After Effects 2025+. Windows 10/11 64-bit or macOS. Internet required. Unlimited: Jul 21 blog says Unlimited-list models generate free in the plugin; help center says no.
- Models: help says plugins default to Nano Banana 2 (images) and Seedance 2.0 (video); plugin page promotes Gemini Omni Flash and Seed Audio 1.0.
- Credits and cost: same credits as the web, no markup.
- Launched: Jul 21, 2026 (blog post date).
- Sources: [/plugins/after-effects] [/blog/higgsfield-after-effects] [/creator-hub/help-center/integrations/external-integrations-higgsfield]

### Presets for After Effects
- What it does: changelog title only; the MCP page also has a "For After Effects" skill filter.
- How to use: not stated.
- Inputs and settings: not stated.
- Limits: not stated.
- Models: not stated.
- Credits and cost: not stated.
- Launched: "Presets for After Effects" undated changelog title (listed between "Higgsfield API is here" and "Introducing AI Motion Designer").
- Sources: [/creator-hub/changelog] [/mcp]

### AI Motion Designer
- What it does: an agent that builds titles, transitions, logo reveals and product promos inside an open After Effects (and Premiere Pro, per page) composition from chat, as native editable layers.
- How to use: 1. In ChatGPT open Plugins and add Higgsfield 2. Type @Higgsfield /use-after-effects 3. Describe the animation. Also runs through MCP from Claude, Cursor or other agents.
- Inputs and settings: input images and your own text, visuals and colors; recreate rhythm and transitions from a reference. Blog claims no fixed cap on resolution (1080p, 4K or 8K), runtime (5 to 30 minutes or more) or reference count, only longer waits.
- Limits: needs active Higgsfield, ChatGPT (or other agent) and After Effects subscriptions; no After Effects skill required.
- Models: "Powered by GPT 6 Astra".
- Credits and cost: Higgsfield generations at standard credit rates; ChatGPT/MCP costs depend on that plan.
- Launched: Sep 10, 2026 (blog post date); "Introducing AI Motion Designer" undated changelog title.
- Sources: [/ai-motion-designer] [/blog/ai-motion-designer-after-effects-gpt] [/blog/best-ai-tools-motion-designers]

### Higgsfield Bridge (MCP bridge)
- What it does: a second MCP endpoint that lets an assistant drive the installed Adobe or Blender add-on in the open project (compositions, layers, keyframes, scenes), unlike the regular MCP that only generates assets.
- How to use: 1. Install the plugin 2. In the assistant's connector settings add a custom connector named Higgsfield Bridge 3. URL bridge.higgsfield.ai/mcp 4. Sign in 5. Ask, e.g. "Build a logo reveal with a bounce ease" or "Build me a calibration bay blockout in Blender".
- Inputs and settings: plugin page bridge prompt also references chatgpt.com/plugins/higgsfield; examples include a camera modeled in 1,025 parts and an exploded engine showcase.
- Limits: requires the plugin installed locally.
- Models: per plugin.
- Credits and cost: standard credits.
- Launched: by Jul 21, 2026 (blog post date).
- Sources: [/plugins/after-effects] [/blog/higgsfield-after-effects] [/blog/higgsfield-blender-plugin] [/creator-hub/help-center/integrations/external-integrations-higgsfield]

### DaVinci Resolve plugin
- What it does: a Resolve panel with seven AI tools, an AI LUT creator, and access to Cinema Studio and Marketing Studio, with results imported to the Media Pool or Timeline.
- How to use: 1. Download from higgsfield.ai/plugins/davinci (macOS native installer or Windows .exe); help center says place it in the plugins folder 2. Run installer 3. Workspace, Workflow Integrations (or Workspace, Scripts).
- Inputs and settings: Generate Video (with references), Generate Image, Edit Video, Draw to Edit/Draw to Video, Reframe (6 ratios), Remove Background, Upscale (up to 4K per help; 4K or 8K per blog), AI LUT Creator / Color Match (source plus reference frame, exports .cube or color nodes), Last Generations, Import to Resolve.
- Limits: Resolve 19+; App Store build unsupported; internet required; Unlimited does not apply; clips 4 to 15 s.
- Models: Nano Banana 2 (image default), Seedance 2.0 (video default), more under the hood.
- Credits and cost: plan credits.
- Launched: Jul 28, 2026 (blog post date).
- Sources: [/blog/higgsfield-davinci-resolve] [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/plugins/after-effects]

### Figma and FigJam plugin
- What it does: generates and conforms brand visuals on the Figma canvas.
- How to use: 1. Plugins, Find more plugins, search "Higgsfield AI" by Higgsfield Inc (or Figma Community) 2. Sign in 3. Select a frame or image 4. Generate or refine; drag, Insert, or enable auto-insert.
- Inputs and settings: blog lists 7 tools: Generate AI Image, Generate AI Video, Remove Background, Relight, Color Grading, Expand, Angles. Help center adds Vector Generation (SVG), Mockup Studio, Face Swap, animation, and in FigJam Higgsfield Canvas Nodes with chained pipelines.
- Limits: internet required; desktop (macOS, Windows) and browser.
- Models: Generate AI Image runs on Soul 2.0 (blog); help center says image generation across all Higgsfield models.
- Credits and cost: same credits as the web.
- Launched: Jul 23, 2026 (blog post date).
- Sources: [/blog/higgsfield-figma-plugin] [/creator-hub/help-center/integrations/external-integrations-higgsfield]

### Photoshop plugin
- What it does: Higgsfield panel inside Photoshop with generation and edit tools, plus Cinema Studio and Marketing Studio.
- How to use: 1. Download the .UXP installer from higgsfield.ai/plugins/photoshop 2. Window, Extensions, Higgsfield.
- Inputs and settings: Generate AI Image, Realtime AI (syncs to each brush stroke), Mockup Studio, Layer Decompose, Angles, Shots (framing storyboard), Character Swap, Remove Background, Face Swap, Upscale, Skin Enhancer, AI Stylist.
- Limits: Photoshop 2024+, macOS or Windows.
- Models: defaults Nano Banana 2 / Seedance 2.0 (help, all plugins).
- Credits and cost: plan credits; no Unlimited.
- Launched: not stated.
- Sources: [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/plugins/after-effects]

### Blender plugin
- What it does: a floating bar over the Blender viewport that generates editable scenes, meshes, rigged animation, images and video into the open file.
- How to use: 1. Download the signed .zip from higgsfield.ai/plugins/blender 2. Drag onto Blender (or Edit, Preferences, Add-ons, Install; keep it zipped) 3. Sign in 4. Pick a tab, prompt or drop a reference, choose model, resolution and fps, check the cost on the Generate button.
- Inputs and settings: seven tabs: Scene Builder (real editable geometry, lights), 3D Model (mesh at 3D cursor, quads, UVs, PBR), Character Animation (fitted weighted rig, keyframes on standard bones), Image (native 4K), Video (Seedance 2.5 from viewport, Anti-Slop mode, about a minute), Camera (phone motion drives the scene camera), Asset (library). Variants counter multiplies cost.
  - Agent mode: Blender Bridge at bridge.higgsfield.ai/mcp lets an assistant work in the open scene.
- Limits: Blender 5.1+, Windows or macOS; internet and account required; cloud generation, no GPU needed.
- Models: Nano Banana 2, Nano Banana Pro, GPT Image, Seedream 5.0 Pro, Z Image (images), Seedance 2.5 (video), Meshy 5 (3D), plus upscalers.
- Credits and cost: credit price on the Generate button; plan credits.
- Launched: Aug 20, 2026 (blog post date); "Higgsfield. Now in Blender" undated changelog title.
- Sources: [/blog/higgsfield-blender-plugin] [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/creator-hub/changelog]

### Minecraft mod
- What it does: Higgsfield generation inside Minecraft.
- How to use: 1. Install NeoForge for Minecraft 1.21.1 2. Put the .jar in mods/ 3. Launch and type /higgsfield auth 4. Authorize in the browser.
- Inputs and settings: Prompt to Build (structures block by block), Image Generation (Photo Slide item), Video Generation (Video Screen or Projector), Camera (in-game reference capture), Generation Archive.
- Limits: Minecraft 1.21.1 with NeoForge only.
- Models: not stated.
- Credits and cost: plan credits.
- Launched: not stated.
- Sources: [/creator-hub/help-center/integrations/external-integrations-higgsfield]

### Reference Extension
- What it does: not found in the corpus; no page mentions a "Reference Extension". Official plugins and extensions are said to install only from the official plugin page. [/creator-hub/help-center/getting-started/official-higgsfield-platforms]
- Sources: [/creator-hub/help-center/getting-started/official-higgsfield-platforms]

## Plans, credits and unlimited

### Individual plans
- What it does: Self-serve subscriptions for solo creators; tiers differ by model access, monthly credits, parallel generations and included Unlimited models. One active subscription per account.
- How to use: 1. Open the Pricing page (higgsfield.ai/pricing) 2. Toggle Monthly or Annual 3. Pick a plan (an interactive plan picker and a side-by-side table are on the page) 4. Pay through Stripe Checkout; the plan activates instantly.
- Inputs and settings: tier, billing cycle, and on some tiers a credit-volume slider (Ultra 3,000 / 6,000 / 9,000). Tier ladder as named across pages:

| Tier | Price as stated | Credits per month | Notes | Sources |
|---|---|---|---|---|
| Free | $0 | none included | small model set, visible watermark | [/creator-hub/help-center/plans/how-do-higgsfield-plans-work] [/creator-hub/help-center/credits/watermark-and-how-to-remove] |
| Basic | "from $9/mo" | 120 (one post says entry credits range 120 to 270) | entry plan; no Auto-Refill on entry-level plans; no referral link | [/blog/ai-tiktok-pipeline-2026] [/blog/best-all-in-one-subscription-ai-images-video] [/blog/ai-previsualization-tools] |
| Starter | $15/mo in most posts; $9/mo with 120 credits in others; €19/mo billed annually in the plan widget ("no difference" vs monthly) | 200 (posts); 270 (widget) | Seedance 2.0 Fast and 2.0 Mini only, "selected models"; up to 2 video + 4 image parallel; no Supercomputer | [/blog/higgsfield-vs-runway-2026] [/blog/best-affordable-ai-video-generators] [/blog/make-ai-lipsync-videos] [/apps/character-swap] [/blog/ai-batch-generation-tools-2026] |
| Pro | $29/mo [/blog/best-pika-alternatives]; one post calls the $49 tier "Pro" [/blog/best-sora-alternatives-2026] | 600 or 900 (annual Pro rows) | grouped with Plus as "Plus / Pro"; Wan 3.0 week is "Pro and above" | [/blog/33-days-unlimited-seedance-2-5] [/blog/how-to-get-free-unlimited-seedance-2] [/creator-hub/changelog] |
| Plus | $49/mo; $39/mo annual; widget €59, €47/mo billed annually (save €144) | 1,000 (posts) or 1,200 (widget); tables list "Plus 1000" and "Plus 1200" | all models incl. all Seedance; up to 6 video + 8 image parallel; Supercomputer 3 parallel chats, 2 scheduled tasks | [/blog/best-unlimited-ai-video-generators] [/blog/top-tier-ai-video-plans-filmmakers-2026] [/apps/character-swap] [/blog/ai-batch-generation-tools-2026] |
| Max | not stated | 1,800 / 3,600 / 5,400 | appears only in Unlimited tables; Max annual unlocks Seedance 2.0 4K in New Unlimited | [/blog/new-unlimited-more-models] [/blog/33-days-unlimited-seedance-2-5] |
| Ultra | $129/mo; $99/mo annual (save €360 in widget, €129 to €99) | 3,000 base, slider to 6,000 or 9,000 | "unlimited paid parallel generations"; "lowest cost per credit"; Supercomputer 10 parallel chats, 10 scheduled tasks | [/blog/top-tier-ai-video-plans-filmmakers-2026] [/blog/annual-unlimited-ai-video-plans] [/apps/character-swap] [/blog/ai-batch-generation-tools-2026] |

- Limits: no trial period per help center (but see Free plan and trials); no multiple subscriptions per account; parallel limits conflict: Plus "up to 6 videos and 8 images" [/blog/higgsfield-vs-runway-2026] vs widget showing "unlimited paid parallel generations" on Plus [/apps/character-swap]; Ultra "up to 8 videos and 8 images" [/blog/best-ai-video-consistent-characters] vs "unlimited paid parallel" [/blog/top-tier-ai-video-plans-filmmakers-2026]. "Creator" and "Ultimate" are not Higgsfield tier names in the corpus; "Business plans" is the tab for Team, Scale, Enterprise.
- Models: not applicable (entry tiers get "core generation models"; higher plans unlock every model).
- Credits and cost: widget equivalents: Starter 270 credits = 135 Nano Banana Pro images or ~15 Seedance 2.0 Fast videos; Plus 1,200 = 600 Nano Banana Pro images or ~80 Seedance 2.5 videos; Ultra 3,000 = 1,500 Nano Banana Pro images or ~200 Seedance 2.5 videos. Discount badges seen: Starter 30% off, Plus 20% off, Ultra 23% off, Team 18% off [/apps/character-swap]. Seedance 2.5 starts on the $49 plan [/blog/seedance-2-5-pricing-2026].
- Launched: not stated (help article dated Aug 1, 2026).
- Sources: [/creator-hub/help-center/plans/how-do-higgsfield-plans-work] [/apps/character-swap] [/ai-motion-designer] [/blog/higgsfield-vs-runway-2026] [/blog/credits-vs-unlimited-ai-video-generation] [/blog/ai-video-api-pricing-vs-subscriptions] [/blog/best-ai-tools-motion-designers]

### Free plan and free trials
- What it does: Free accounts can generate on a small model set with no credit allowance and a visible watermark; time-boxed trials have been run as promotions.
- How to use: 1. Sign up at higgsfield.ai 2. For a trial, go through checkout with a card ($0 charged) 3. Cancel auto-renewal in Manage Account → Subscription before it converts.
- Inputs and settings: 1-Day Free Trial of All Unlimited (24 hours), then auto-renews into monthly Plus with 7 more Unlimited days; Unlimited MCP 24-hour trial converts to Plus monthly; email warning 6 hours before the $49 charge.
- Limits: help center says "There's no trial period" [/creator-hub/help-center/plans/how-do-higgsfield-plans-work], while July 2026 posts describe 1-day trials (one per account, new accounts with no subscription history only; Support cannot reset it). Help also states "Higgsfield plans are paid" [/creator-hub/help-center/getting-started/official-higgsfield-platforms].
- Models: trial covers the 23 All Unlimited models (see All Unlimited).
- Credits and cost: trial $0 with card on file; converts to Plus at $49.
- Launched: Jul 22, 2026 (blog post date, trial ended Jul 23 1:30 PM UTC); Unlimited MCP trial Jul 28, 2026 (blog post date, until Jul 31).
- Sources: [/blog/free-unlimited-ai-video-generation-2026] [/blog/new-unlimited-more-models] [/blog/higgsfield-all-unlimited-explained] [/blog/unlimited-mcp]

### Monthly and annual billing
- What it does: Every individual plan is sold monthly or annually; annual costs less per month.
- How to use: 1. Pricing page 2. Switch the toggle from Monthly to Annual 3. Select Change Commitment on your plan.
- Inputs and settings: monthly to annual takes effect immediately, billing date resets, prorated charge with unused monthly value deducted, no fee.
- Limits: annual to monthly is not available on any tier; cancel auto-renewal and buy monthly after the paid year. Annual credits reset every 30 days, not on the calendar date (subscribed May 11 → next reset June 10).
- Models: not applicable.
- Credits and cost: annual examples: Plus $39/mo, Ultra $99/mo (posts); widget Plus €47, Ultra €99, Team €65 per seat.
- Launched: not stated (help article dated Aug 1, 2026).
- Sources: [/creator-hub/help-center/plans/can-i-switch-between-monthly-and-annual-billing] [/creator-hub/help-center/plans/when-does-my-subscription-renew]

### Upgrade and downgrade
- What it does: Changes tier; upgrades apply now, downgrades at next cycle.
- How to use: Upgrade: 1. Pricing page 2. Select target plan 3. Confirm the prorated charge. Downgrade: 1. Pricing page 2. Scroll to the detailed comparison 3. Select Downgrade (not on the main plan cards).
- Inputs and settings: upgrade proration subtracts unused value (unused credits plus unused annual months); billing date resets to upgrade moment.
- Limits: refund of the upgrade amount only within 7 days and with no credits used from the new plan; Credit Packs, promo and Auto-Refill credits unaffected (90-day validity continues).
- Models: not applicable.
- Credits and cost: prorated charge shown before paying.
- Launched: not stated (help article dated Aug 1, 2026).
- Sources: [/creator-hub/help-center/plans/how-do-i-upgrade-or-downgrade-my-plan]

### Subscription renewal
- What it does: Auto-renews through Stripe on the purchase anniversary (monthly or yearly).
- How to use: 1. Avatar → Manage Account 2. Subscription 3. Read "Your plan renews [date]" under the plan name; invoices under Upcoming Invoice → All invoices.
- Inputs and settings: monthly credits reset when the renewal invoice is paid; annual allowance resets every 30 days.
- Limits: unused subscription credits expire at renewal; failed renewal enters past due, typically 14 days to fix before cancellation; billing date only changes on upgrade or monthly-to-annual switch; at least 30 days' email notice before any price increase, never mid-term.
- Models: not applicable.
- Credits and cost: not stated.
- Launched: not stated (help article dated Aug 1, 2026).
- Sources: [/creator-hub/help-center/plans/when-does-my-subscription-renew] [/creator-hub/help-center/billing/how-does-billing-work]

### Promo prices
- What it does: One-time discount on a subscription payment from promocodes or Exclusive Offers; renews at standard price next cycle.
- How to use: 1. Redeem a code in Manage Account → Promocode, or 2. Buy an offer shown on higgsfield.ai.
- Inputs and settings: discount on first payment or stated period; bonuses (Unlimited, bonus credits, priority) are time-limited.
- Limits: does not extend term; cannot be reactivated after expiry; credit-based promo purchases refundable within 7 days if unused; access/feature promos non-refundable once granted; checkout adds local tax.
- Models: not applicable.
- Credits and cost: examples seen: affiliate referral up to 50% off for 3 hours [/blog/higgsfield-affiliate-program-2026]; referral friend up to 60% off [/blog/how-to-get-free-unlimited-seedance-2]; "Pricing 30% off" banner [/supercomputer]; "up to 30% off" Seedance 2.5 [/original-series]; sign-up "extra discount" on Nano Banana Pro unlimited [/].
- Launched: not stated (help article dated Aug 1, 2026).
- Sources: [/creator-hub/help-center/plans/how-do-promo-prices-work] [/] [/original-series]

### Exclusive offers
- What it does: Personalized, limited-time deals for active subscribers: a discounted one-cycle upgrade or an add-on (bonus credits, temporary Unlimited on specific models, priority processing).
- How to use: 1. Offers appear automatically on higgsfield.ai with a countdown 2. Buy within the window; benefit period starts at purchase.
- Inputs and settings: two types: Upgrade offer (higher tier for one billing cycle, then standard price of that tier) and Add-on offer (plan unchanged, bonuses expire).
- Limits: vary per account and moment; not available on request; never re-shown in the same form; example: 7 days of Unlimited bought July 16 runs to July 23.
- Models: model-specific Unlimited as stated per offer.
- Credits and cost: only credit-adding offers are refundable (7 days, unused).
- Launched: not stated (help article dated Aug 1, 2026).
- Sources: [/creator-hub/help-center/plans/what-are-exclusive-offers]

### Credits
- What it does: The currency for generations; cost depends on model, resolution and duration and is shown on the Generate button before confirming.
- How to use: 1. Check balance in the top nav 2. For detail, Manage Account → Subscription (Credits card) 3. Manage Account → Usage for Credits Usage History (each generation, model, deductions, refunds, per-model breakdown).
- Inputs and settings: five credit types: Subscription (resets each cycle), Credit Pack (90 days), Auto-Refill (90 days), Promo (expiry shown at issue), Boost Credits (90 days). Spend order: subscription first, then whichever balance expires soonest.
- Limits: all generations on web, MCP, CLI, Canvas and Supercomputer deduct credits (images, videos, re-rolls, upscaling); Unlimited and free generations are web-only; batch size 2/3/4 charges each output; failed generations usually refunded automatically within minutes (some models may not refund); no rollover on individual plans (Enterprise has volume rollover); generations from connected agents are tagged with source in history.
- Models: not applicable.
- Credits and cost: dollar rates stated: "$1 = 18 credits" for Auto-Refill [/creator-hub/help-center/credits/how-does-auto-refill-work]; "20 credits per $1" reference rate in many posts [/blog/unlimited-nano-banana-2-plans] [/blog/how-studios-scale-ai-video-production]; Starter $15/200 = $0.075 per credit [/blog/best-affordable-ai-video-generators].
- Launched: not stated (help article dated Aug 3, 2026).
- Sources: [/creator-hub/help-center/credits/how-credits-work] [/creator-hub/help-center/credits/what-uses-my-credits] [/creator-hub/help-center/credits/top-up-credits-expire]

### Credit costs per generation
- What it does: Reference table of per-generation credit costs stated in UI Generate labels and blog posts (UI labels converted to sentence case, e.g. "Generate 1.5").
- How to use: read the Generate button before confirming; costs scale with resolution, duration, audio and batch size.
- Inputs and settings: see table.
- Limits: figures come from different dates and plans; pages sometimes disagree (both shown).
- Models: as listed.
- Credits and cost:

| Model or tool | Settings | Credits | Source |
|---|---|---|---|
| GPT Image 2 | Auto, High, 2K, batch 1 | label shows 8.5 and 6.5 (discounted price, inferred) | [/ai/image?model=gpt_image_2] |
| GPT Image 2 | 2K / 4K | 7 / 12 | [/blog/restore-old-photos-ai] |
| Nano Banana 2.1 | 3:4, 1K, Medium | 1.5 | [/ai/image?model=nano-banana-2-1] |
| Nano Banana Pro | 1K | 2 (label) | [/ai/image?model=nano-banana-pro] |
| Nano Banana Pro | 2K / 4K | 2 / 4 | [/blog/restore-old-photos-ai] [/blog/soul-2-vs-nano-banana-pro] |
| Nano Banana 2 | 1K or 2K / 4K; Edit tool | 2 / 4; 1.5 per edit | [/blog/unlimited-nano-banana-2-plans] |
| Recraft V4.1 | Standard / Vector / Pro / Pro Vector | 1.25 / 2.5 / 8 / 10 (label 1.25) | [/ai/image?model=recraft-v4-1] [/blog/recraft-v4-higgsfield] |
| Recraft Styles | 1K / 2K | 0.75 / 1.75 | [/blog/recraft-v4-higgsfield] |
| Soul 2.0 | 2K image | 0.125 (label, Photodump); 0.5 for a 2K character sheet in one post | [/ai/image?model=soul-v2&modal-photo-dump=true] [/blog/best-ai-image-generators-2026] [/blog/generate-ai-videos-from-chatgpt] |
| Higgsfield Soul (Fashion Factory) | 3:4, 2K, batch 4 | 2 | [/fashion-factory] |
| Z-Image | 3:4 | 0.15 | [/ai/image?model=z-image] |
| Seedream 5.0 Pro | 2K | 3 | [/blog/photo-to-ai-video] |
| Angles 2.0 | 12 angles | 0.2 | [/apps/angles] |
| Relight (image) | default | 2 | [/apps/relight] [/blog/restore-old-photos-ai] |
| Topaz upscaler / Inpaint | per image | 3 / 3 | [/blog/restore-old-photos-ai] |
| Layer Decomposition / Edit Text / Remove Background | 2K, 8 layers / detection plus edit / detection plus removal | 24 (15 per separation) / 3.5 / 1 | [/blog/edit-photos-with-ai-higgsfield] |
| Soul ID | character training | 25 | [/blog/best-midjourney-alternatives] |
| AI Influencer | one character | 1.12 | [/blog/new-ai-influencer] |
| Ads Studio | one static ad | 4 | [/blog/higgsfield-ads-studio] |
| Seedance 2.5 | 8 s 720p / 8 s 480p | 52 / 24 | [/blog/seedance-2-5-pricing-2026] |
| Seedance 2.5 | 10 s 480p / 720p / 1080p | 30 / 70 / 120 | [/blog/seedance-2-5-on-higgsfield-2026] |
| Seedance 2.5 | 8 s 1080p; 5 s with audio | 72; 33 | [/blog/credits-vs-unlimited-ai-video-generation] [/blog/best-affordable-ai-video-generators] |
| Seedance 2.0 | 8 s 720p standard / Fast | 36 / 28 | [/blog/seedance-2-0-pricing-2026] [/blog/consistent-characters-locations] |
| Seedance 2.0 | 5 s 720p / 5 s 1080p / 10 s 720p / 10 s 1080p | 23 / 45 / 45 / 90 | [/blog/ai-video-credits-explained] |
| Seedance 2.0 | 15 s 720p | ~90 | [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] |
| Kling 3.0 | 5 s 720p / 5 s 1080p / 10 s 720p / 10 s 1080p | 10 / 12.5 / 20 / 25 | [/blog/ai-video-credits-explained] |
| Kling 3.0 | 8 s 720p; 8 s 1080p; 5 s with audio | 16; 20; 10 (one post says ~6 per video) | [/blog/ai-video-api-pricing-vs-subscriptions] [/blog/credits-vs-unlimited-ai-video-generation] [/blog/best-affordable-ai-video-generators] [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] |
| Wan 2.7 | 5 s 720p / 5 s 1080p / 10 s 720p / 10 s 1080p | 8 / 13 / 15 / 25 | [/blog/ai-video-credits-explained] |
| Veo 3.1 | 1080p clip (8 s) | 58 | [/blog/best-runway-ml-alternatives] [/blog/best-ai-video-generators-2026] |
| Veo 3.1 Lite | 8 s silent / with audio | 8 / 12 | [/blog/best-affordable-ai-video-generators] |
| MiniMax H3 | 2K 5 s / 10 s / 15 s | 20 / 40 / 60 | [/blog/minimax-h3-higgsfield] |
| FLUX 3 Video | 5 s 720p / 5 s 1080p / 20 s 720p / 20 s 1080p | 27.5 / 45 / 110 / 180 | [/blog/flux-3-higgsfield] |
| Cinema Studio 4.0 | 10 s 720p with audio / 1080p | 70 / 160 | [/blog/how-to-generate-ai-video-all-in-one-platforms] [/blog/higgsfield-vs-runway-2026] |
| Cinema Studio (version not stated) | 5 s 720p / 10 s 1080p | 25 / 100 | [/blog/ai-video-credits-explained] |
| Cinema Studio 3.5 | 8 s 720p | 40 | [/blog/photo-to-ai-video] |
| Marketing Studio video | 8 s 720p / 15 s 720p | 47.62 / 89.2 | [/blog/ai-avatars-vs-ugc-creators-2026] [/blog/how-studios-scale-ai-video-production] |
| Genjutsu | 15 s 720p | 104 | [/blog/best-ai-ad-generators] |
| Lipsync Studio (Wan 2.5 Fast) | 5 s 720p | 9 (label) | [/lipsync-studio] |
| Lipsync talking clip | 10 s 1080p | 20 | [/blog/best-ai-avatar-generators-talking-videos] |
| Shorts Studio | 8 s 720p | 33 | [/blog/ai-tiktok-pipeline-2026] |
| Video Relight / Color Palette | 15 s clip | 135 each | [/blog/video-relight-color-palette-higgsfield] |
| Faceless Studio | per minute of episode | 246 | [/blog/faceless-youtube-videos-faceless-studio] |
| Viral presets | one 720p generation | 27.5 to 67.5 | [/blog/how-to-make-viral-videos-viral-presets] |
| Popcorn | per scene | 5 | [/blog/consistent-characters-locations] |
| Supercomputer | two-step workflow / full production | ~90 / ~200 | [/blog/higgsfield-supercomputer-guide] |

- Launched: not applicable.
- Sources: routes in the table.

### Credit packs
- What it does: One-time purchase of extra credits on top of a subscription; no plan or model changes.
- How to use: 1. Select Buy Credits in the top nav, or account menu → Top-up credits 2. Open the Top-up Credits tab 3. Pick a fixed or adjustable size and check out.
- Inputs and settings: fixed 100, 200, 500, 1,000, 2,000, 4,000 credits; adjustable 5,000 to 25,000 in 1,000 steps; several packs can be combined.
- Limits: active subscription required to buy; valid 90 days; survive cancellation (usable on free-plan models while the timer runs); no auto-renew; no Unlimited unlock.
- Models: not applicable.
- Credits and cost: prices shown only at checkout; refundable within 7 days if unspent.
- Launched: not stated (help article dated Aug 3, 2026).
- Sources: [/creator-hub/help-center/credits/how-credit-packs-work] [/blog/ai-video-team-plans-compared]

### Auto-refill
- What it does: Optional automatic top-up when the balance drops below the plan's refill threshold.
- How to use: 1. Avatar → Manage Account 2. Subscription → Credits auto-refill 3. Set-up & Enable and choose an amount.
- Inputs and settings: refill amount $20, $40, $90, $150 or $300; threshold set per plan and shown in the set-up window; a separate Auto-refill credits counter appears.
- Limits: off by default; not available on entry-level plans; needs a saved payment method; failed charge means no credits added; stops after cancellation; credits valid 90 days.
- Models: not applicable.
- Credits and cost: $1 = 18 credits; refundable within 7 days if unspent.
- Launched: not stated (help article dated Aug 3, 2026).
- Sources: [/creator-hub/help-center/credits/how-does-auto-refill-work] [/creator-hub/help-center/billing/what-should-i-do-if-my-payment-failed]

### Promo codes
- What it does: Codes give a plan discount or bonus credits.
- How to use: 1. Avatar → Manage Account 2. Promocode 3. Enter code; applied instantly with a summary of what was added.
- Inputs and settings: marketing promos (announced first on official social channels), Discord streams and events, Support compensation codes.
- Limits: one activation per code; some limited by time or number of uses; Support promos expire if not activated within 7 days; promo credits keep their own expiry and survive cancellation.
- Models: not applicable.
- Credits and cost: varies per code.
- Launched: not stated (help article dated Aug 3, 2026).
- Sources: [/creator-hub/help-center/credits/how-promo-codes-work] [/creator-hub/help-center/getting-started/higgsfield-community-on-discord]

### Free generations
- What it does: One-time pools of no-credit generations on specific models granted at plan purchase, plus occasional promo pools.
- How to use: 1. Check the "Unlimited & Free Gens" section of a plan card on Pricing 2. Generate on higgsfield.ai.
- Inputs and settings: Soul V2 and Soul Cinema pools: Starter 300, Plus 5,000, Ultra 10,000 [/apps/character-swap]; posts say "3,000 to 10,000 by plan" [/blog/credits-vs-unlimited-ai-video-generation]; Genjutsu 720p 3 free gens on Plus and Ultra 7-day windows [/apps/character-swap]; AI Influencer 5 free generations for every user (as of Oct 3, 2026) [/creator-hub/changelog].
- Limits: do not renew at renewal; web only (not MCP/CLI); watermark-free on paid plans; don't count against refund eligibility.
- Models: Soul 2.0 (Soul V2), Soul Cinema, Higgsfield Genjutsu, AI Influencer.
- Credits and cost: zero credits.
- Launched: not stated.
- Sources: [/creator-hub/help-center/credits/how-credits-work] [/apps/character-swap] [/creator-hub/changelog]

### Credit reset offer
- What it does: Topped subscribers' balances up to their plan's full monthly amount (up to 2,000 free credits).
- How to use: 1. Manage Account → Subscription 2. Claim bonus credits.
- Inputs and settings: bonus credits shown separately and spent first.
- Limits: paid plans from Basic and above; upgrades add no bonus; canceled-but-active plans could resume to qualify; unused bonus expired Sep 30, 2026 23:59 UTC.
- Models: not applicable.
- Credits and cost: up to 2,000 free credits.
- Launched: Sep 29, 2026 (changelog).
- Sources: [/creator-hub/changelog]

### Concurrency boost
- What it does: One-time purchase that raises how many generations run in parallel above the plan's base limit, bundled with a separate Boost Credits balance.
- How to use: 1. Account menu → Boost speed or Increase Concurrent (same product), or Manage Account → Usage → Buy boost credits 2. Pick a pack 3. Toggle the pack on to run boosted.
- Inputs and settings: +4, +8, +12 or +16 concurrency (max +16); per-pack toggle; multiple packs: highest concurrency drawn first, same-level packs pooled.
- Limits: Boost Credits valid 90 days; shared across all models and Supercomputer tasks; no plan or model change; toggle off returns to subscription credits and base limit.
- Models: all models.
- Credits and cost: pack prices not stated.
- Launched: not stated (help article dated Aug 3, 2026).
- Sources: [/creator-hub/help-center/credits/how-does-concurrency-boost-work] [/creator-hub/help-center/getting-started/whats-in-my-higgsfield-account]

### Unlimited models
- What it does: Specific models where web generations deduct no credits for a set period; layered as plan-included 365-day sets, 7-day flagship windows, Marketplace bundles and promos.
- How to use: 1. Pick a covered model on higgsfield.ai 2. Switch on the Unlimited toggle in the generation panel 3. Check Manage Account → Subscription → Active unlimited models (start, expiry, status).
- Inputs and settings: 365-day set on Plus and Ultra: Seedream 5.0 Lite, Flux.2 Pro (1K), Seedream 4.5, Nano Banana, Kling O1 Image, GPT Image (six image models); Ultra lists Seedream 4.5 at 4K. 7-day windows at purchase (widget): Plus: Wan 3.0 and 3.0 Prime, Nano Banana 2 at 2K, Kling 3.0; Ultra adds Nano Banana Pro 2K; posts (Sep 2026) say Plus gets a Nano Banana 2 window, Ultra Nano Banana Pro plus Nano Banana 2, and annual adds Kling 3.0.
- Limits: higgsfield.ai only (MCP, CLI, Canvas, Supercomputer, plugins, Presets, Apps, Studios, Marketing Studio, Shorts Studio always use credits); requires an active subscription (paused on cancel, resumes if period not over); period does not restart at renewal; standard queue; personal human use only (no automation, scripting, credential sharing or resale; may be slowed or paused for review). Starter: widget shows Seedream 5.0 Lite and Flux.2 Pro (1K) as 365-day Unlimited [/apps/character-swap], while posts say Starter has "no 365-day set" [/blog/annual-unlimited-ai-video-plans].
- Models: as listed above.
- Credits and cost: zero credits while active; Unlimited access is a one-time inclusion, not a recurring charge.
- Launched: not stated; earlier promo "Unlimited Kling Motion Control" on Kling 2.6 (Dec 20, 2025, blog post date) [/blog/Kling-2.6-Motion-Control-Full-Guide].
- Sources: [/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them] [/apps/character-swap] [/blog/annual-unlimited-ai-video-plans] [/blog/unlimited-nano-banana-2-plans] [/blog/new-unlimited-more-models]

### Credit mode and the unlimited queue
- What it does: Switching the Unlimited toggle off runs a covered model in Credit Mode, which deducts credits but uses the priority queue at maximum speed.
- How to use: 1. Open the model menu 2. Toggle Unlimited off for that generation.
- Inputs and settings: per-generation choice; both modes available at the same time.
- Limits: Unlimited runs in the standard (shared, "relaxed") queue; speed and concurrency can vary at peak; Unlimited concurrency stated as 1 image + 1 video + 1 audio at a time [/blog/new-unlimited-more-models], one concurrent generation per format across all models [/blog/higgsfield-all-unlimited-explained], or "one video or two images at a time" [/blog/annual-unlimited-ai-video-plans].
- Models: any Unlimited-covered model.
- Credits and cost: normal per-generation credits in Credit Mode.
- Launched: not stated.
- Sources: [/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them] [/blog/seedance-unlimited] [/blog/higgsfield-all-unlimited-explained]

### All Unlimited
- What it does: Time-boxed offer that unlocks 23 image, video and audio models with no credit deduction for 1 to 7 days.
- How to use: three routes: 1. New users: 1-Day Free Trial 2. Buy Plus or higher (7 days included; starts at $49/mo) 3. Existing subscribers: buy the Unlimited Bundle in the Marketplace (profile menu → Unlimited Models); then turn on the Unlimited toggle.
- Inputs and settings: images capped at 2K (GPT Image 2 "High, 2K"); video baseline Seedance 2.0 720p 8 s, Kling 3.0 and Wan 2.7 1080p 8 s, Gemini Omni Flash 7 s; higher tiers, annual billing and the Bundle extend video to 15 s (top tiers: Seedance 2.0 15 s at 720p or 1080p at 8 s).
- Limits: no daily cap or counter; 1 concurrent generation per format; web only; 4K and higher-end modes excluded; Starter and Basic excluded.
- Models: image: Nano Banana Pro, Nano Banana 2, Nano Banana, Seedream 5.0 Pro, Seedream 5.0 Lite, Seedream 4.5, GPT Image 2, GPT Image, Kling O1, Higgsfield Soul 2.0, FLUX.2 Pro; video: Seedance 2.0, 2.0 Fast, 2.0 Mini, Kling 3.0, Kling 3.0 Motion Control, Gemini Omni Flash, Wan 2.7; audio: Seed Audio 1.0, Eleven v3, MiniMax Speech 2.8 HD, VibeVoice, Seed Speech.
- Credits and cost: Unlimited Bundle 1 day $99 or 3 days $250 (about $83/day); comparison: same day bought per model costs $168 for 6 models (Seedance 2.0 720p $73, Seedance 2.0 Fast and Mini $35, Kling 3.0 1080p $35, GPT Image 2 2K $20, Nano Banana Pro 2K $5), prices as of July 2026.
- Launched: Jul 22, 2026 (blog post date).
- Sources: [/blog/higgsfield-all-unlimited-explained] [/blog/free-unlimited-ai-video-generation-2026] [/blog/ai-video-credits-explained]

### New Unlimited
- What it does: Expansion of Unlimited to more models at higher resolutions, via trial, 7-day plan window, or Marketplace bundle; ran until Jul 29, 2026 1:30 PM UTC.
- How to use: 1. Trial activates on signup, 7-day window activates with a Plus, Max or Ultra purchase, or buy a 1 or 3 day Marketplace bundle 2. Generate on higgsfield.ai with the toggle on 3. Check Active unlimited models.
- Inputs and settings: images 2K across all paths; video 8 s on Trial and Plus monthly, 10 s on Plus annual, 15 s on Max/Ultra; Seedance 2.0 at 1080p, but 4K at 8 s on Max annual and Ultra annual only.
- Limits: outside covered resolution or duration, credits are drawn; free trial one per account; 1 image + 1 video + 1 audio concurrently.
- Models: same 23 models as All Unlimited (Kling O1 Image, GPT Image (High), Soul 2.0 named this way).
- Credits and cost: trial converts to Plus at $49 unless canceled (email 6 hours before charge).
- Launched: Jul 27, 2026 (blog post date).
- Sources: [/blog/new-unlimited-more-models]

### Unlimited models marketplace
- What it does: Sells Unlimited access to individual models (or all models) as time-boxed bundles, separate from the plan.
- How to use: 1. Buy Credits → Unlimited Models tab, or Manage Account → Subscription → Get Unlimited 2. Pick model, resolution tier (quality toggle) and 1, 3 or 7 days 3. Pay once; window starts on purchase.
- Inputs and settings: resolution tier per bundle (highest tier includes lower ones); bundles for different models run independently.
- Limits: video bundles 1 generation at a time up to 15 s; image bundles 2 at a time; All Models bundle 2 image + 1 video; web only; fair use applies; the route for users already at top tiers (Ultra, Max max tier, Team) during Seedance promos.
- Models: per-model bundles named include Seedance 2.0, Seedance 2.0 Fast and Mini, Kling 3.0, GPT Image 2, Nano Banana Pro; Seedance and Kling video bundles appear in the store.
- Credits and cost: Nano Banana Pro 2K: 1 day $5, 3 days $12, 7 days $23; 4K: $7, $16, $32 [/blog/unlimited-nano-banana-2-plans]; from $7 per model up to $1,035 for a 7-day all-models pass [/blog/annual-unlimited-ai-video-plans].
- Launched: not stated (help article dated Aug 3, 2026).
- Sources: [/creator-hub/help-center/credits/what-are-unlimited-models-and-which-plans-include-them] [/blog/unlimited-nano-banana-2-plans] [/blog/higgsfield-all-unlimited-explained] [/blog/seedance-4k-unlimited-11-days]

### Seedance Unlimited (30-day add-on)
- What it does: Separate paid add-on with 30 days of no-credit generation on Enhanced Seedance 2.0 Fast (shown in the app as "Seedance 2.0 Fast").
- How to use: 1. Pricing page shows the offers available to your account 2. Buy the add-on 3. Generate with the Unlimited toggle on.
- Inputs and settings: 480p and 720p; multi-shot, native audio and character consistency.
- Limits: purchasable until Jul 12; 1 concurrent generation, standard queue; no 1080p; web only; average generation under 5 minutes (23,913 generations in first 7 hours).
- Models: Enhanced Seedance 2.0 Fast via Higgsfield's BytePlus partnership.
- Credits and cost: add-on price not stated.
- Launched: June 2026 per [/blog/free-unlimited-ai-video-generation-2026]; guide Jul 30, 2026 (blog post date).
- Sources: [/blog/seedance-unlimited] [/blog/free-unlimited-ai-video-generation-2026]

### Referral program (Unlimited Seedance 2.0)
- What it does: Invite friends; when they subscribe and generate, you earn days of Unlimited Seedance 2.0 and they get a discount.
- How to use: 1. Open the referral modal (shown if eligible) and generate a link (24-hour countdown starts) 2. Friend follows link, buys Plus or Pro monthly or higher, and makes one credit-paid generation, all within 24 hours 3. Receive a result modal.
- Inputs and settings: 1 friend = 3 days, 2 = 5 days, 3 = 7 days (max).
- Limits: invite open before Jul 17; only Pro and Plus and above; Starter, Basic and B2B plans excluded; Unlimited covers Seedance 2.0 at 720p, 8 s clips.
- Models: Seedance 2.0.
- Credits and cost: friends get up to 60% off.
- Launched: Jul 14, 2026 (blog post date).
- Sources: [/blog/how-to-get-free-unlimited-seedance-2] [/blog/free-unlimited-ai-video-generation-2026]

### Seedance 4K Unlimited and free Seedance 2.0 4K generations
- What it does: Plan-based Unlimited Seedance window (4 days Seedance 2.0 at 4K, then 7 days on another Seedance model) plus a free Seedance 2.0 4K page for every plan, including free.
- How to use: 1. Free: open the dedicated Free Seedance 2.0 4K page (card for verification, nothing charged) 2. Plan offer: upgrade, or use the Marketplace if already at top tier (max Ultra, max Max, Team) 3. Days 1-4 on Seedance 2.0 4K, from day 5 switch model.
- Inputs and settings: free page: 4K, up to 10 s, 1 concurrent; plan days 1-4: 720p 15 s, 1080p 8 s (Plus monthly) or 15 s, 4K 8 s (not on Plus monthly); week two choices: Seedance 2.5, 2.0 Mini, 2.0 Fast.
- Limits: free page outputs are visible to other users during the promo; 4K elsewhere still uses credits. Structure conflict: "11 days total, 4 + 7" [/blog/seedance-4k-unlimited-11-days] vs 14 days total (7 days of Seedance 2.0 at 4K, then 7 more) [/blog/seedance-unlimited].
- Models: Seedance 2.0 (4K), Seedance 2.5, Seedance 2.0 Mini, Seedance 2.0 Fast.
- Credits and cost: free page at no cost.
- Launched: Aug 2, 2026 (blog post date).
- Sources: [/blog/seedance-4k-unlimited-11-days] [/blog/seedance-unlimited]

### Unlimited Seedance 2.5 (33 days)
- What it does: Up to 33 days of Unlimited Seedance 2.5 at up to 720p, plus a separate Seedance 2.0 window up to 1080p on some plans.
- How to use: 1. Activate before Aug 9 on a qualifying plan (or Marketplace if at top tier) 2. Turn on the Unlimited toggle 3. Use 2.5 and 2.0 windows on separate clocks.
- Inputs and settings: Seedance 2.5 max clip monthly: Plus 1000/1200 10 s, Max 1800 10 s, Max 3600/5400 15 s, Ultra 3000/6000 20 s, Ultra 9000 25 s; annual: Pro 600/900 10 s (22 days), Plus and Max 20 s, Ultra 3000/6000 25 s, Ultra 9000 30 s. Seedance 2.0: 15 s clips; Ultra monthly 7 days; annual Plus and Max 14 days, Ultra 33 days.
- Limits: Pro monthly excluded; resolution fixed at 720p for 2.5.
- Models: Seedance 2.5, Seedance 2.0.
- Credits and cost: zero credits during windows; Unlimited window "usually 33 days" per [/blog/seedance-2-5-pricing-2026].
- Launched: Aug 6, 2026 (blog post date).
- Sources: [/blog/33-days-unlimited-seedance-2-5] [/blog/seedance-2-5-on-higgsfield-2026] [/blog/seedance-2-5-pricing-2026]

### Unlimited Wan 3.0 (7 days)
- What it does: Free week of Unlimited Wan 3.0 and Wan 3.0 Prime for subscribers, plus 60% off the same model on the API until Oct 31, 2026.
- How to use: 1. Video → model selector → Wan 3.0 2. Generate; developers see rates on Higgsfield API.
- Inputs and settings: clips up to 30 s, up to 1080p.
- Limits: individual plans from Pro and above (monthly or annual); shared queue; upgrading from Basic or Starter starts the 7 days at upgrade.
- Models: Wan 3.0, Wan 3.0 Prime.
- Credits and cost: zero credits for 7 days; API discount 60%. Home page promotes "Wan 3.0 Unlimited" [/].
- Launched: Oct 13, 2026 (changelog).
- Sources: [/creator-hub/changelog] [/]

### Watermark
- What it does: Free accounts get a visible Higgsfield watermark; any paid plan removes it.
- How to use: 1. Subscribe at higgsfield.ai/pricing 2. Regenerate older watermarked items.
- Inputs and settings: no toggle; depends only on account type, not model or credits.
- Limits: watermark embedded at generation; not sold per file; old files unchanged after cancellation; invisible machine-readable AI markers may be embedded on all plans. Film Festival entries must carry Higgsfield's watermark and packshot [/blog/higgsfield-global-film-festival].
- Models: all.
- Credits and cost: paid plan required.
- Launched: not stated (help article dated Aug 3, 2026).
- Sources: [/creator-hub/help-center/credits/watermark-and-how-to-remove]

### Commercial rights and ownership of generations
- What it does: Users own inputs and outputs; commercial use is not restricted on any plan, including free (Terms of Use Section 4.4).
- How to use: point clients to Section 4.4; Enterprise for formal IP indemnification.
- Inputs and settings: Higgsfield holds a limited hosting/processing license (Section 4.3) and may train on content (Section 4.4); deleting content or account stops training going forward; Enterprise content is not used for training (written into 4.4 since July 2026).
- Limits: no attribution required; outputs not guaranteed unique; outputs may not be used to train or fine-tune any AI model (Sections 5.1(iii), 5.2(iv)); no contests or sweepstakes run through the service without consent; users responsible for third-party IP and likeness; marketing uses only public or consented content; rights survive cancellation and can be sublicensed to clients.
- Models: not applicable.
- Credits and cost: no separate commercial license; indemnification Enterprise only.
- Launched: Terms update announced Jul 25, 2026 (blog post date), effective Aug 27, 2026.
- Sources: [/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially] [/blog/terms-of-use-privacy-policy-update] [/creator-hub/help-center/business/how-do-i-submit-a-dmca-notice-or-legal-inquiry] [/blog/best-ai-video-platforms-agencies]

## Teams, enterprise and creator programs

### Team plan
- What it does: Self-serve shared workspace with pooled credits and shared Assets for small teams.
- How to use: 1. Pricing → Business plans tab → Team 2. Invite: Manage Account → Members → Invites&Seats → Invite members.
- Inputs and settings: 2 to 9 seats; 1,000 credits per seat per month pooled; parallel 16 image / 16 video; standard queue; basic analytics; VAT/Tax ID supported.
- Limits: no SSO, no member spend controls, no sub-workspaces; seats cannot be lowered mid-cycle (Support updates next renewal).
- Models: all features and models, including Supercomputer.
- Credits and cost: $79 per seat per month (Oct 2026: 5 seats $395 for 5,000 credits) [/blog/team-collaboration-access-ai-video] [/blog/ai-video-team-plans-compared]; $69/seat/mo, $65 annual (Sep 22, 2026) [/blog/best-ai-video-platforms-agencies]; widget €79, €65 per seat billed annually, 2 seats default, ~133 Seedance 2.5 videos per 1,000 credits [/apps/character-swap]; "Team $79/mo (1,000 pooled credits)" [/blog/best-ai-video-generators-marketing-ads-2026].
- Launched: not stated (help article dated Aug 2, 2026).
- Sources: [/creator-hub/help-center/business/team-and-business-higgsfield] [/blog/team-collaboration-access-ai-video] [/blog/ai-video-team-plans-compared] [/blog/how-studios-scale-ai-video-production]

### Scale plan
- What it does: Self-serve business tier with more credits per seat, priority queue, SSO and admin spend controls.
- How to use: 1. Pricing → Business plans tab → Scale 2. Manage members in Manage Account.
- Inputs and settings: 5 to 15 seats; 2,500 credits per seat per month pooled; detailed analytics; admins can pause an individual member's credit spend.
- Limits: 5-seat minimum; parallel limits conflict: 32 image / 32 video [/creator-hub/help-center/business/team-and-business-higgsfield] [/blog/ai-video-team-plans-compared] vs 20 videos / 24 images "as of August 2026" [/blog/how-studios-scale-ai-video-production]; no SOC 2, indemnification or no-training clause.
- Models: all, including Supercomputer.
- Credits and cost: $215 per seat per month (5 seats $1,075 for 12,500 credits; Oct 2026) [/blog/team-collaboration-access-ai-video]; $169/seat/mo, $150 annual (Sep 22, 2026) [/blog/best-ai-video-platforms-agencies]; 13 seats = 32,500 credits [/blog/ai-video-api-pricing-vs-subscriptions].
- Launched: undated changelog title "Scale plans. Updated".
- Sources: [/creator-hub/help-center/business/team-and-business-higgsfield] [/blog/team-collaboration-access-ai-video] [/blog/best-ai-video-platforms-agencies] [/creator-hub/changelog]

### Higgsfield for Enterprise
- What it does: Custom contract for organizations (15+ users, compliance, custom credit volume, dedicated capacity).
- How to use: 1. Pricing → Business plans (Team) tab 2. Contact Sales under Enterprise 3. Submit company details; also via the "Enterprise" top-nav item.
- Inputs and settings: custom seats, credits and concurrent tasks; dedicated generation capacity with SLA; volume rollover credits; role-based permissions, user groups with per-group limits and model restrictions; per-user credit caps; CSV bulk import and usage export; "View member assets" (off by default); sub-workspaces with credit allocation once, daily, weekly or monthly; audit logs; SSO; dedicated account manager; Slack or Teams channel; creative onboarding.
- Limits: inputs and outputs excluded from training and treated as confidential; SOC 2, DPA, W-9/W-8BEN/TRC and VAT certificates only under Enterprise; trust.higgsfield.ai for public compliance info.
- Models: all.
- Credits and cost: negotiated with sales; legal indemnification against third-party IP claims Enterprise only.
- Launched: undated changelog title "Higgsfield for Enterprise".
- Sources: [/creator-hub/help-center/business/team-and-business-higgsfield] [/blog/team-collaboration-access-ai-video] [/blog/best-ai-video-platforms-agencies] [/creator-hub/help-center/business/how-do-i-submit-a-dmca-notice-or-legal-inquiry] [/creator-hub/changelog]

### Team workspace roles and sub-workspaces
- What it does: One Owner manages workspace and billing; invited members need a paid seat but no personal subscription.
- How to use: 1. Manage Account → Members → Invites&Seats → Invite members 2. Grant Admin permissions 3. Enterprise: Manage Account → Sub-workspaces → Add (name, credits, allocation period, owner email).
- Inputs and settings: roles Owner, Member, Admin; Admin permissions (by plan): manage members and seats, pause spend, manage groups, top up and auto top-up, view/export analytics, view member assets.
- Limits: removing a member does not reduce seats; shared assets (folders, Soul ID characters, Reference Elements) stay in workspace; under the Terms admins on any plan may access members' content; cancellation only by Owner via the Subscription Cancellation Request Form (Manage Account → Organization).
- Models: not applicable.
- Credits and cost: sub-workspace credits come from the shared pool; sub-workspaces Active or Paused.
- Launched: Oct 8, 2026 (blog post date of guide).
- Sources: [/blog/team-collaboration-access-ai-video] [/creator-hub/help-center/business/team-and-business-higgsfield]

### Enterprise case studies (Gaia, Boxel)
- What it does: Published proof points for Enterprise use.
- How to use: not applicable.
- Inputs and settings: Gaia: prompts written in Claude, sent via MCP, Supercomputer for shot runs, stills on a Premiere timeline before animation; bespoke privacy agreement first.
- Limits: not applicable.
- Models: Gaia used Seedance 2.0 and 2.5 (video), GPT Image 2, Seedream and Nano Banana Pro (stills).
- Credits and cost: Gaia quote that failed takes "eat into your credits"; five 12-second animations in 20 to 30 minutes; 3+ AI-heavy shows run concurrently. Boxel: uploaded data not used for training, strict deletion protocols.
- Launched: Gaia Sep 16, 2026; Boxel Jun 30, 2026 (case study dates).
- Sources: [/creator-hub/case-studies/gaia-cut-animation-time-with-higgsfield-enterprise] [/creator-hub/case-studies/boxel-studio-higgsfield-case-study]

### Creator partnership program
- What it does: Partnership for AI creators: a full plan renewed monthly, extra credits for bigger projects, early model access, direct team line, private partner community, featuring on Higgsfield channels.
- How to use: 1. Apply on the CPP page (platforms, total audience, country, recent work) 2. Human review 3. Email decision either way.
- Inputs and settings: no follower-count filter; creators in 35+ countries.
- Limits: tag or mention Higgsfield when tools are used and engage with relevant launches; no posting quotas or exclusivity; partners keep ownership. Name varies: "Creator Partnership Program", "Creator Partner Program", "Creative Partner Program", footer "Creative Partners".
- Models: early access to new models.
- Credits and cost: free for accepted partners.
- Launched: Jul 18, 2026 (blog post date of program guide).
- Sources: [/blog/creator-partnership-program] [/creator-hub/help-center/business/how-do-i-join-a-partnership-or-creator-program] [/community] [/blog/higgsfield-discord-200k-contest]

### Affiliate program
- What it does: Personal referral link paying recurring commission on referred subscriptions.
- How to use: 1. Apply on the affiliate page (channel, audience, platform) 2. Link is live immediately 3. Share organically 4. Earn on purchases, renewals and upgrades.
- Inputs and settings: commission up to 25%, rising with qualifying revenue; for up to 12 months per referral; any paid plan including Basic; built-in tracking; calculator example: 10 referrals/month at $100 = $19,500 over 12 months at 25%.
- Limits: no commission on refunded purchases; no paid ads, brand bidding, coupon or cashback sites; established creators can email affiliate@higgsfield.ai.
- Models: not applicable.
- Credits and cost: referrals get up to 50% off for 3 hours after login via link.
- Launched: undated changelog title "Affiliate Program. Now live"; guide Aug 24, 2026 (blog post date).
- Sources: [/blog/higgsfield-affiliate-program-2026] [/creator-hub/changelog]

### Higgsfield Earn
- What it does: a standalone paid-campaign platform: creators (including AI influencer accounts) post promotional content for brand campaigns and get paid, with no follower minimum.
- How to use: 1. Go to creators.higgsfield.ai (help center) or higgsfield.ai/earn (CPP post) 2. Log in (account auto-created) 3. Link a social account in My Accounts with a verification code in your bio or channel description, then Verify My Account 4. Browse and join Active Campaigns 5. Post or submit the video 6. Track earnings and withdraw.
- Inputs and settings: campaign briefs list type, requirements (format, hashtags, mentions, minimum length), payout, deadline, guidelines; some include Generate Your Promo Code. Payout = guaranteed amount plus a performance bonus calculated about a week later.
- Limits: platforms Instagram and YouTube (Jan 2026 blog); help center adds Twitter (X) and says Instagram authorizes automatically. One YouTube account, permanently linked. Campaigns are matched by audience and country, so lists vary or may be empty. Rates and correspondence confidential; one appeal per rejected submission, decisions final. Separate from the Creator Partnership Program and from in-app karma (Collab).
- Models: not applicable; existing characters or AI Influencer Studio characters can be used.
- Credits and cost: payouts via Garna (Claim Money); joining cost not stated.
- Launched: Jan 18, 2026 (blog post date).
- Sources: [/blog/Higgsfield-Earn-Talent-And-Collaboration-Monetization] [/creator-hub/help-center/business/how-do-i-join-a-partnership-or-creator-program] [/blog/creator-partnership-program]

## Community, contests and platform

### Higgsfield Community
- What it does: Public space on higgsfield.ai where creators publish Shots, Open Projects and Blog posts, follow, like, and earn Community rating.
- How to use: 1. Select Community in the top nav 2. Browse Discovery, Projects, Shots, Creators (plus Contests and Originals tabs) 3. Publish from your profile or a project.
- Inputs and settings: Discovery shows Higgsfield Selected projects, featured creators, Grants banner, Global Film Festival entries and Higgsfield Originals by Higgsfield Studio; Projects feed filters contest/non-contest/favorites; Shots filter images/videos/favorites; likes (heart on Shots, thumbs up/down on projects).
- Limits: everything private by default; published works visible without an account; account needed to like, follow, publish.
- Models: Shots show prompt, model and settings for Recreate.
- Credits and cost: not stated.
- Launched: help articles dated Oct 8, 2026.
- Sources: [/creator-hub/help-center/community/what-is-higgsfield-community] [/community]

### Open projects and shots
- What it does: Open Projects share a whole pipeline (result, brief, folders, models, optionally prompts); Shots are single published generations.
- How to use: 1. Publish button on profile or project 2. Details (title, description, link higgsfield.ai/@username/projects/project-name, co-authors, tags) 3. Assets layout: Feature, Series or Carousel 4. Cover (optional) 5. Access: With prompts or Prompts hidden 6. Open preview → Publish.
- Inputs and settings: project page shows views, generation count, credits spent (if shared), creation date, Stack (tool/model share), brief, folders.
- Limits: Recreate unavailable with prompts hidden; verification is manual and automatic at 30 likes and 30 generations; unpublishing keeps assets private in Assets.
- Models: any.
- Credits and cost: verified project +30 rating points.
- Launched: help article dated Oct 8, 2026.
- Sources: [/creator-hub/help-center/community/how-do-projects-work]

### Creator profile
- What it does: Public portfolio at higgsfield.ai/@username.
- How to use: 1. Open profile → Edit profile 2. Add photo, username, name (hidden until Show publicly), headline/specialty, bio, location, socials (Instagram, YouTube, TikTok, X, Discord) 3. Preview.
- Inputs and settings: tabs All works, Projects, Shots, Blog, Ranking, Achievements; counters followers, following, views, likes; join date; optional "Show spent credits on profile" (off by default); up to three badges (Creative Partners, official accounts, top contest results).
- Limits: drafts, email, subscription and balance stay private.
- Models: not applicable.
- Credits and cost: completing profile +3 points.
- Launched: help article dated Oct 8, 2026.
- Sources: [/creator-hub/help-center/community/how-do-i-set-up-my-profile] [/creator-hub/help-center/getting-started/whats-in-my-higgsfield-account]

### Community rating and achievements
- What it does: Points shown with your avatar that grow from specific actions; achievements mark milestones, some with credits.
- How to use: 1. Earn an achievement 2. Select Claim in the notification 3. Pin or share from the Achievements tab.
- Inputs and settings: points: complete profile +3; first Open Project +4; first remix +2; verified project +30 each; remix of your verified project by a paying creator +1 (max 15/month); approved blog post with 20+ likes +20; featured by Higgsfield +50. Named achievements: First Spark, Open Source, Verified Project, Ripple Effect, Knowledge Keeper, Spotlight, Rising Star, Creator Momentum, Creative Force.
- Limits: views, likes received, followers and generating earn no points; rating never decreases; unclaimed rewards never expire.
- Models: not applicable.
- Credits and cost: approved blog post up to 5,000 credits; featured work up to 200,000; 100 points = 5,000; 500 points = 75,000; 1,000 points = 200,000.
- Launched: help article dated Oct 8, 2026.
- Sources: [/creator-hub/help-center/community/how-do-achievements-work]

### Higgsfield Grants
- What it does: Awards generation credits to selected published Open Projects.
- How to use: 1. Publish a project made with Higgsfield 2. Apply from the Grants page or the Discovery banner.
- Inputs and settings: entries reviewed every month.
- Limits: not stated.
- Models: not applicable.
- Credits and cost: up to 200,000 credits per project.
- Launched: not stated.
- Sources: [/creator-hub/help-center/community/what-is-higgsfield-community] [/community]

### Explore and auto-publish
- What it does: Published works can be featured on the Explore page; an account toggle controls whether new generations auto-publish.
- How to use: 1. Assets → open asset → three-dot menu → Publish 2. Manage Account → Personal Profile → Auto-publish new generations toggle.
- Inputs and settings: bulk Publish all in Assets.
- Limits: works with many likes can be featured; Higgsfield markets only public or consented content.
- Models: not applicable.
- Credits and cost: not stated.
- Launched: help article dated Jul 30, 2026.
- Sources: [/creator-hub/help-center/getting-started/higgsfield-community-on-discord] [/creator-hub/help-center/account/how-do-i-submit-a-gdpr-ccpa-or-privacy-request]

### Higgsfield Chat
- What it does: a collaboration and social layer (Mar 2026): shared projects where several people generate in real time, with live streaming, chat, calls, a public feed and karma.
- How to use: 1. Open Higgsfield Chat from the navigation 2. Create or open a project 3. Set Private (invite link) or Public (in feed) 4. Generate, chat, call, publish.
- Inputs and settings: live view of prompts, model choices and outputs with no viewer cap; Active Now; text chat with reactions and replies; audio and video calls with no participant limit; feed post types (text, image/video with generation trace, project posts); Recreate button preloads prompt and model; feed sorts Hot, Rising, Controversial (coming soon).
- Limits: feed browsable without login; creating needs an account. The /chat route now serves the Supercomputer page, so Chat appears folded into Supercomputer (inferred).
- Models: n/a.
- Credits and cost: karma converts to credits: up to 200 credits a month; FAQ says 20,000 karma = 375 credits and "300+ bonus credits" for Pro users (pages disagree). Karma was "in development".
- Launched: Mar 24, 2026 (blog post date).
- Karma today: Manage Account shows a Collab karma history; karma is earned through Collab and exchanged for credits [/creator-hub/help-center/getting-started/whats-in-my-higgsfield-account].
- Sources: [/blog/higgsfield-chat-social-network] [/chat]

### Higgsfield Discord
- What it does: Official Discord server (discord.com/invite/higgsfield) for community chat, streams, workshops, challenges and support; 200,000 members as of Oct 2026.
- How to use: 1. Join via the Join Community/Discord link in account menu or socials 2. Optionally verify in #verification with Verify with Higgsfield.
- Inputs and settings: channel groups Start here, Updates, Community hub, Create and share, Recognition, Support and feedback; international language hubs; roles Higgsfield Team, Moderators, Ambassadors, Power Users, Bug Hunters, Allies, CPP, Verified [Plan]; verified hub with separate contests.
- Limits: verification optional; email never shown.
- Models: Daily Soul Challenge requires Soul, Soul 2.0 or Soul Cinema.
- Credits and cost: Weekly Challenge, Daily Soul (3 winners daily) and monthly awards give credits; promocodes at events.
- Launched: help article dated Jul 30, 2026.
- Sources: [/creator-hub/help-center/getting-started/higgsfield-community-on-discord] [/blog/higgsfield-discord-200k-contest] [/creator-hub/help-center/getting-started/official-higgsfield-platforms]

### Contests
- What it does: Contests hub listing active and past contests with cash or credit prize pools.
- How to use: 1. Open /contests (or the Contests tab in Community) 2. View details, submissions or winners.
- Inputs and settings: listed: Global Film Festival ($1,000,000, jury review); The Adathon ($85,000 credits pool, Jul 27 – Aug 24, ended); Higgsfield Apps Contest ($100,000, winners announced); Make Your Action Scene ($500,000, Feb 09 – Mar 01, 8,752+ projects).
- Limits: Terms forbid users running contests through the service without consent.
- Models: per contest.
- Credits and cost: prizes as listed.
- Launched: not stated.
- Sources: [/contests] [/blog/blog-original-series] [/blog/introducing-higgsfield-apps]

### Higgsfield Global Film Festival
- What it does: $1,000,000 short-film contest; every film generated on Higgsfield.
- How to use: 1. Shape the idea (solo or team up to 4, one Team Leader) 2. Build everything in the Cinema Studio submission project 3. Submit with Higgsfield watermark and packshot and post publicly on Instagram, YouTube, X or Reddit 4. Screening, shortlist, jury.
- Inputs and settings: min 3 min (recommended max 5 min); 16:9 or 21:9; MP4 or MOV up to 4K; any language with English subtitles or voice-over; unlimited entries.
- Limits: 18+ with a registered account (no paid plan needed); no real person's face or voice as input; AI-generated music, voice, sound; generate from scratch in the Generation Window; one prize per participant/team; Audience Choice voting requires a paid plan, max 5 votes, one per film after watching fully, not your own film.
- Models: any model on the platform.
- Credits and cost: 1st $500,000; 2nd $200,000; 3rd $100,000; Audience Choice $100,000; 10 honorable mentions $10,000 each (14 winners). Jury: Edwin Catmull, Phedon Papamichael, Paul W.S. Anderson.
- Launched: opened Aug 10, 2026 (blog post date); deadline Sep 15; dates updated Oct 5 (shortlist and voting Oct 8, jury Oct 9-14, winners last week of October); Audience Choice voting Oct 8 to Oct 15, 11:59 PM UTC (changelog); undated "Deadlines extended" title.
- Sources: [/blog/higgsfield-global-film-festival] [/contests/higgsfield-global-film-festival] [/creator-hub/changelog]

### Higgsfield Discord 200K Contest
- What it does: Community contest for 200,000 Discord members: recreate a viral video trend with your own twist.
- How to use: 1. Join Discord and link account in #verification 2. Click Apply 3. Higgsfield creates your contest project in Cinema Studio 4. Make the video there 5. Submit title, trend and description.
- Inputs and settings: one video up to 60 s, any aspect ratio; open community templates and presets allowed; outside edits allowed if re-uploaded; optional #HiggsfieldDiscord200K.
- Limits: 18+; one entry (replaceable before deadline); SFW/PG-13; no unauthorized third-party IP or real people without permission; no voice cloning of real people; project, prompt and settings become public; voting needs an active paid plan, unlimited votes, one per entry.
- Models: models available in the contest project.
- Credits and cost: 200,000 credits: 1st 50,000; 2nd 32,000; 3rd 20,000; 4th-10th 14,000 each; promotional credits valid 90 days, non-transferable.
- Launched: Oct 7, 2026 (changelog); entries closed Oct 14 17:00 UTC; voting Oct 15-17; winners Oct 19.
- Sources: [/blog/higgsfield-discord-200k-contest] [/creator-hub/changelog]

### Higgsfield Apps Contest
- What it does: $100,000 contest to build and publish generative apps on Higgsfield Apps.
- How to use: 1. Build an app on Higgsfield models 2. Publish it 3. Post with #HiggsfieldApp.
- Inputs and settings: apps browsable at higgsfield.ai/supercomputer/apps (500+ apps).
- Limits: open until Jul 21; winners Jul 28.
- Models: Higgsfield's own generation models.
- Credits and cost: 1st $25,000; 2nd $15,000; 3rd $10,000; ten honorable mentions $5,000.
- Launched: Jul 9, 2026 (blog post date).
- Sources: [/blog/introducing-higgsfield-apps] [/contests]

### Higgsfield Original Series
- What it does: AI-native streaming destination for fully AI-generated series; audience votes on what gets made next.
- How to use: 1. Open /original-series 2. Watch (free) or set Notify on Release 3. Enter contests to be considered for a series.
- Inputs and settings: launched with Arena Zero (10-minute sci-fi episode) and twelve trailers (Bucket List, Vermin Control Unit, Misfortune, Mother Trucker and more); page rows Higgsfield Choice, First Look, On Our Radar, Coming Soon; contest Top-3 winners listed.
- Limits: creator entry currently only through contests; best entries get sponsored production and distribution.
- Models: Cinema Studio as primary tool.
- Credits and cost: free to watch; page promotes Seedance 2.5 at up to 30% off.
- Launched: Mar 20, 2026 (blog post date).
- Sources: [/blog/blog-original-series] [/original-series]

### Academy
- What it does: Free learning hub with courses, guides, videos, PDFs and a prompt bank.
- How to use: 1. Open /academy 2. Browse by category 3. Start a course ("Start now for free") 4. Copy prompts or Recreate.
- Inputs and settings: categories Movie making, UGC & Social Content, Automate & Agents; courses incl. Blockbuster 4K (10 modules, 40 min), Ultra-Realistic Short Film in 4K (19 modules, 33 min), Add AI VFX to Real Footage (11 modules, 12 min, Advanced), AI Animated Short (11 modules, 17 min); prompt bank Camera 46 examples; quiz and hands-on step after each section.
- Limits: not stated.
- Models: courses name Claude Fable 5, Seedance 2.0 4K.
- Credits and cost: free to start.
- Launched: not stated.
- Sources: [/academy]

### Official Higgsfield platforms
- What it does: Defines the only official surfaces and warns about copies.
- How to use: check the address is higgsfield.ai; report copies to Support with a link and screenshot.
- Inputs and settings: higgsfield.ai (sign in, generate, pay); Open Higgsfield API console at open.higgsfield.ai; docs.higgsfield.ai; MCP setup higgsfield.ai/mcp with connector mcp.higgsfield.ai/mcp; Discord; X, Instagram, YouTube, LinkedIn, TikTok; plugins only from the official plugin page.
- Limits: no mobile apps and no desktop app (browser on any device); not open source, platform and models proprietary; no lifetime plans, resold accounts or reseller subscriptions; purchases elsewhere can't be refunded. One studio post points API sign-up to cloud.higgsfield.ai [/blog/how-studios-scale-ai-video-production].
- Models: Higgsfield's own models stated as proprietary.
- Credits and cost: not applicable.
- Launched: help article dated Sep 5, 2026.
- Sources: [/creator-hub/help-center/getting-started/official-higgsfield-platforms] [/creator-hub/help-center/integrations/what-is-the-higgsfield-api]

### Mobile interface redesign
- What it does: Mobile web opens on the prompt bar with navigation moved to a sidebar; features unchanged.
- How to use: 1. Open higgsfield.ai on a phone 2. Tap the top-left icon for the sidebar.
- Inputs and settings: Agent tab with popular scenarios (Genjutsu, GPT-6 Astra, Create Image, Create Video); sidebar New Chat, Explore, MCP, Higgsfield Genjutsu, Community, Library; Recent Chats; profile with credit balance at bottom.
- Limits: browser only (no native apps).
- Models: not applicable.
- Credits and cost: not applicable.
- Launched: Sep 24, 2026 (changelog).
- Sources: [/creator-hub/changelog] [/]

### Manage account and account menu
- What it does: Account menu (avatar) shows plan and credits with purchase shortcuts; Manage Account (higgsfield.ai/me/settings) holds subscription, usage and codes.
- How to use: 1. Click avatar top right 2. Choose an item.
- Inputs and settings: menu: Credits, Top-up credits, Boost speed, Unlimited models, View profile, Manage Account, Increase Concurrent, Join Community, Sign Out; Manage Account sections Personal profile, Gifts, Subscription, Usage, Promocode; main page shows usage chart and Collab karma history.
- Limits: balance and plan private.
- Models: not applicable.
- Credits and cost: not applicable.
- Launched: help article dated Jul 30, 2026.
- Sources: [/creator-hub/help-center/getting-started/whats-in-my-higgsfield-account]

### Account sign-in, recovery and deletion
- What it does: Account lifecycle and data rights.
- How to use: sign up with Google, Apple, Microsoft or email (6-digit code); delete via Manage Account → Personal Profile → Manage Account Deletion → confirm checklist → Delete Account.
- Inputs and settings: 30-day recovery window by signing back in; GDPR/UK export via privacy@higgsfield.ai (30 days GDPR, 45 days CCPA).
- Limits: 18+; email cannot be changed; no transfers between accounts; deletion cancels subscription and loses credits; content already used in training can't be removed; faceprints/voiceprints not stored.
- Models: not applicable.
- Credits and cost: remaining credits lost on deletion.
- Launched: help articles dated Jul 29 to Aug 2, 2026.
- Sources: [/creator-hub/help-center/getting-started/create-an-account-and-sign-in] [/creator-hub/help-center/account/how-do-i-permanently-delete-my-account] [/creator-hub/help-center/account/how-do-i-recover-access-to-my-account] [/creator-hub/help-center/account/how-do-i-submit-a-gdpr-ccpa-or-privacy-request]

### Business milestones
- What it does: Company-reported scale metrics.
- How to use: not applicable.
- Inputs and settings: $1B+ annualized revenue run rate (last 4 weeks × 13) 18 months after launch; 32M+ users in 238 countries; nearly 1M paying subscribers; contracted business revenue 10× since June; run rate ~20× since Sep 2025; subscriptions fell from 90%+ to just over 60% of revenue as on-demand usage grew; 390 of the Fortune 500; $400M Series B at $5.4B valuation (August, led by DST Global); cash-flow breakeven recently; support team 40+. Tool pages cite "25 million creators" [/apps/face-swap].
- Limits: run rate is not trailing revenue.
- Models: not applicable.
- Credits and cost: not applicable.
- Launched: Sep 29, 2026 (blog post date). A creator survey "The Global State of AI Video" (4,214 responses, 125 countries) published Jun 22, 2026 [/blog/ai-video-report].
- Sources: [/blog/higgsfield-1b-annualized-revenue-run-rate] [/blog/ai-video-report]

### Content flagged as NSFW
- What it does: Safety filters at prompt processing and at image upload/reference input, plus each external provider's own filter.
- How to use: 1. Rephrase neutrally 2. Adjust or replace the reference image 3. Add a text prompt to image-only inputs 4. Try another model.
- Inputs and settings: common false positives: swimwear, fitness, medical imagery, borderline references, ambiguous wording.
- Limits: Higgsfield can't see provider rules or override classifiers; bypassing moderation is prohibited.
- Models: provider filters named for Nano Banana, Seedream, Kling, Sora 2, MiniMax, Wan, Veo.
- Credits and cost: credits returned automatically for most models; if missing, contact Support with time, model and prompt (no Assets page or ID for flagged items).
- Launched: help article dated Aug 1, 2026.
- Sources: [/creator-hub/help-center/troubleshooting/content-flagged-as-nsfw]

### Generations blocked for copyright or IP
- What it does: Blocks prompts or references with recognizable characters, franchises, brands, logos, sports leagues or named living artists.
- How to use: 1. Rephrase descriptively (for example "a hero in a red and blue suit" instead of a name) 2. Remove branded references 3. If the input is yours, try "I own the rights for this image" (lower right of the generation).
- Inputs and settings: DMCA notices and IP reports to support@higgsfield.ai (six required elements, acknowledgment within 48 hours, counter-notification possible); non-consensual intimate images removed within 48 hours; rights-holder verification handled case by case.
- Limits: blocks are platform-wide and not overridable per account; Seedance runs its own IP check.
- Models: Seedance named.
- Credits and cost: credits returned automatically in most cases.
- Launched: help articles dated Aug 1, 2026.
- Sources: [/creator-hub/help-center/troubleshooting/my-generation-blocked-for-copyright-or-ip] [/creator-hub/help-center/business/how-do-i-submit-a-dmca-notice-or-legal-inquiry]

### Billing and invoices
- What it does: Stripe-processed payments with automatic invoices for every charge.
- How to use: 1. Manage Account → Subscription 2. Payment methods → Add new payment method 3. Billing information → Manage (Stripe portal: company, address, Tax/VAT ID) 4. Upcoming Invoice → All invoices → Download.
- Inputs and settings: Visa, Mastercard, Amex, JCB, Apple Pay, Stripe bank payments; no PayPal or crypto; local tax added at checkout; VAT/Tax ID on all paid plans.
- Limits: invoices can't be edited after issue; failed renewal limits generations and Unlimited until paid (pay unpaid invoice or Try to charge now; ~14 days before cancellation); chargebacks can permanently restrict accounts; Support can't charge cards.
- Models: not applicable.
- Credits and cost: not applicable.
- Launched: help articles dated Aug 1, 2026.
- Sources: [/creator-hub/help-center/billing/how-does-billing-work] [/creator-hub/help-center/billing/how-do-i-download-my-invoice-or-receipt] [/creator-hub/help-center/billing/how-do-i-add-a-vat-or-tax-id-to-my-invoices] [/creator-hub/help-center/billing/what-should-i-do-if-my-payment-failed]

### Refunds and cancellation
- What it does: All-or-nothing refunds for unused initial purchases; cancellation stops auto-renewal.
- How to use: Cancel: Manage Account → Subscription → Plan Settings → Manage Subscription → Show → Cancel Subscription (Team/Scale via Owner form). Refund: contact Support with account email, date, amount, reason.
- Inputs and settings: eligible: initial purchase within 7 days (or longer by law), zero credits used; Credit Packs, Auto-Refill and credit-adding offers on the same terms; EEA/UK 14-day withdrawal ends once content is used.
- Limits: renewals, partial annual refunds and access/feature offers are non-refundable; approved refund cancels the plan immediately; free and Unlimited generations don't affect eligibility; exceptions for major plan degradation or no-fault termination.
- Models: not applicable.
- Credits and cost: service fee up to 6%; processed within 3 business days.
- Launched: help articles dated Aug 1, 2026.
- Sources: [/creator-hub/help-center/refunds/how-do-i-request-a-refund] [/creator-hub/help-center/refunds/how-do-i-cancel-my-subscription] [/creator-hub/help-center/refunds/can-i-get-a-partial-refund-for-unused-annual-time] [/creator-hub/help-center/refunds/how-do-i-get-a-refund-for-an-accidental-charge] [/creator-hub/help-center/refunds/why-didnt-i-receive-a-refund-after-canceling-my-subscription] [/creator-hub/help-center/refunds/can-i-get-a-refund-for-a-subscription-i-never-used]

## Model table

Every model the pages say Higgsfield offers now or offered before, 134 rows (34 image, 60 video, 8 audio, 6 upscaler, 1 3d, 25 llm). Weights: the pages almost never discuss licensing, so "closed (inferred)" means a commercial API model by general knowledge; Higgsfield's own models are marked closed because the official platforms page calls the platform and its models proprietary [/creator-hub/help-center/getting-started/official-higgsfield-platforms]. Competitor-only models (Runway, Luma, Pika, Midjourney and others) are excluded and listed below the table.

| Model | Type | Vendor | Weights (per pages) | What Higgsfield uses it for | Routes |
|---|---|---|---|---|---|
| Cinematic Cameras (cinematic-v1) | image | Higgsfield | closed (stated) | Cinema Studio image mode with camera and lens controls | [/generate?mode=image&imageModel=cinematic-v1] |
| Face Swap 2, Character Swap 2, Angles 2.0 (app engines) | image | Higgsfield | closed (stated) | Engines behind the Face Swap, Character Swap and Angles apps | [/apps/face-swap] [/apps/character-swap] [/apps/angles] |
| FLUX 3 Image | image | Black Forest Labs | not stated | Generation and editing, 768p to 4K; photo, illustration, poster and editorial styles | [/creator-hub/changelog] [/ai/image?model=flux-3-image] |
| Flux Kontext | image | Black Forest Labs | not stated | Legacy footer link; reference-based edits | [/apps/face-swap] [/blog/Why-Does-Your-AI-Characters-Face-Keep-Changing] [/blog/how-to-create-ai-influencer] |
| FLUX.2 Pro | image | Black Forest Labs | closed (inferred) | Speed-optimized detail; 365-day Unlimited at 1K | [/ai/image?model=flux_2] [/apps/character-swap] [/blog/tools-for-consistent-ai-characters] [/creator-hub/case-studies/fantasmagorie-adopt-dont-touch-my-mini-higgsfield] |
| GPT Image 1.5 (GPT Image, GPT Image High) | image | OpenAI | closed (inferred) | Infographics, diagrams; 365-day Unlimited on Plus/Ultra | [/blog/GPT-Image-1.5-by-OpenAI-is-on-Higgsfield-A-Complete-Guide] [/apps/character-swap] [/blog/unlimited-mcp] [/blog/higgsfield-blender-plugin] |
| GPT Image 2 | image | OpenAI | closed (inferred) | Default Create Image model; text rendering, product sheets, edits, restoration | [/ai/image?model=gpt_image_2] [/blog/restore-old-photos-ai] [/blog/cinematic_headphones] [/blog/case4k] |
| GPT Image 2.5 Flare | image | OpenAI | closed (inferred) | Fast everyday generation, 16 references, up to 4K | [/blog/gpt-image-2-5-higgsfield] [/ai/image?model=gpt-image-2-5-flare] |
| GPT Image 2.5 Sunburst | image | OpenAI | closed (inferred) | Precise multi-step edits for campaign work | [/blog/gpt-image-2-5-higgsfield] [/ai/image?model=gpt-image-2-5-sunburst] |
| Grok Imagine 2.0 (image) | image | xAI | closed (inferred) | High-resolution image generation; API $0.06 | [/ai/image?model=grok-image-2-0] [/blog/generate-ai-videos-higgsfield-api] |
| Higgsfield Popcorn | image | Higgsfield | closed (stated) | Storyboards of up to 8 consistent frames, face and location replacement, Instadump mode | [/creator-hub/help-center/ai-models/how-do-i-use-popcorn] [/blog/script-to-ai-storyboard-shot-list] |
| Higgsfield Soul (original) | image | Higgsfield | closed (stated) | Preset-driven fashion images; Fashion Factory | [/blog/Higgsfield-SOUL-Turns-Prompts-Into-Fashion-Ready-Shots] [/fashion-factory] |
| Ideogram 4.0 | image | Ideogram | closed (inferred) | API catalog only ($0.06) | [/blog/generate-ai-videos-higgsfield-api] |
| Ideogram 4.5 | image | Ideogram | closed (inferred) | Repeated edits, text replace and translate, transparent backgrounds, 1K or 2K | [/creator-hub/changelog] |
| Kling O1 Image | image | Kuaishou | closed (inferred) | 365-day Unlimited image model | [/apps/character-swap] [/blog/unlimited-mcp] [/blog/annual-unlimited-ai-video-plans] [/blog/new-unlimited-more-models] |
| Marketing Studio Image (MS Image) | image | Higgsfield | closed (stated) | Marketing Studio product shots; API at $0.0059 per image | [/blog/new-marketing-studio-higgsfield] [/blog/higgsfield-api] |
| Nano Banana | image | Google | closed (inferred) | Instruction editing, up to 8 references; 365-day Unlimited | [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana] [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] [/blog/ai-storyboard-higgsfield-popcorn-best-tool] [/blog/unlimited-mcp] |
| Nano Banana 2 | image | Google | closed (inferred) | Fast bulk generation, 14 references, 4K; default image model in plugins | [/blog/Nano-Banana-2-Gemini-3.1-Flash-AI-Image-Generation] [/blog/unlimited-nano-banana-2-plans] [/creator-hub/help-center/integrations/external-integrations-higgsfield] [/blog/unlimited-mcp] |
| Nano Banana 2 Lite | image | Google | closed (inferred) | Fastest draft tier, 1K, Thinking level | [/creator-hub/help-center/ai-models/how-do-i-use-nano-banana] |
| Nano Banana 2.1 | image | Google | closed (inferred) | Newest Nano Banana: 14 references, text edits, up to 4K | [/creator-hub/changelog] [/ai/image?model=nano-banana-2-1] |
| Nano Banana Pro | image | Google | closed (inferred) | Reasoning-first precision generation up to 4K; restoration | [/ai/image?model=nano-banana-pro] [/blog/Nano-Banana-Pro-is-Here-Full-Review-and-Guide] [/blog/soul-2-vs-nano-banana-pro] [/creator-hub/help-center/ai-models/how-do-i-use-dop] |
| Nano Banana Pro Inpaint | image | Google (via Higgsfield) | closed (inferred) | Mask-based inpainting in Layers | [/layers?model=nano_banana_pro_inpaint] [/blog/Top-Editing-Tool-in-2025-Nano-Banana-Pro-Inpaint] |
| Qwen Image 3 | image | Alibaba (Qwen) | not stated | API catalog only ($0.03) | [/blog/generate-ai-videos-higgsfield-api] |
| Recraft V4.1 (also V4, Styles, Utility) | image | Recraft | closed (inferred) | Design/concept generation, vector mode, Soul HEX color | [/blog/recraft-v4-higgsfield] [/ai/image?model=recraft-v4-1] [/blog/generate-voice-edit-ai-video-one-place] [/blog/generate-ai-videos-higgsfield-api] |
| Seedream 4.0 | image | ByteDance | not stated | Legacy footer link | [/apps/face-swap] |
| Seedream 4.5 | image | ByteDance | closed (inferred) | Older Seedream; 365-day Unlimited (4K on Ultra) | [/apps/character-swap] [/blog/Seedream-5.0-Lite-Review-How-to-Comparison] [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP] [/blog/unlimited-mcp] |
| Seedream 5.0 Flash | image | ByteDance | not stated | Changelog title only (undated, about mid Sep 2026) | [/creator-hub/changelog] |
| Seedream 5.0 Lite | image | ByteDance | closed (inferred) | Intent-aware generation and editing with web search; on plan Unlimited lists | [/blog/Seedream-5.0-Lite-Review-How-to-Comparison] [/blog/ai-batch-generation-tools-2026] [/mcp] [/blog/unlimited-mcp] |
| Seedream 5.0 Pro | image | ByteDance | closed (inferred) | Infographics, group shots, multilingual text; Turn to Video handoff | [/ai/image?model=seedream_v5_pro] [/blog/best-platforms-seedream-5] [/blog/unlimited-mcp] [/blog/higgsfield-blender-plugin] |
| Soul 2.0 | image | Higgsfield | closed (stated) | Flagship image model; presets, Moodboards, HEX, Soul ID, Photodump | [/ai/image?model=soul-v2] [/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images] [/blog/soul-2-vs-nano-banana-pro] [/blog/higgsfield-api] |
| Soul Cinema | image | Higgsfield | closed (stated) | Cinematic stills, video keyframes, location plates | [/ai/image?model=soul-cinematic] [/creator-hub/help-center/ai-models/how-do-i-use-soul-cinema] [/blog/soul-cinema-preview] [/blog/higgsfield-3d-jutsu] |
| Soul ID | image | Higgsfield | closed (stated) | Trained character identity from 20+ photos (25 credits), applied across Soul models and as Elements in video; API from $2.50 per request | [/character] [/creator-hub/help-center/ai-models/how-do-i-create-and-use-a-soul-id-character] [/blog/automate-ai-video-n8n-make] |
| Wan 2.2 Image | image | Alibaba | not stated | Legacy footer link | [/apps/face-swap] |
| Z-Image | image | Alibaba | open (stated: open-source) | Fast, lightly filtered drafts (0.15 credits) | [/blog/Z-Image-New-from-Alibaba-in-AI-Image-Generation] [/ai/image?model=z-image] [/blog/higgsfield-blender-plugin] |
| FLUX.3 Video | video | Black Forest Labs | not stated | Create Video option: text, image references, start and end frames, video input, with audio | [/ai/video?model=flux_3_video] [/blog/flux-3-higgsfield] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] |
| Gemini Omni Flash | video | Google (DeepMind) | closed (inferred) | Multimodal generation plus conversational editing, VFX on real footage, 720p / 10 s | [/blog/how-to-use-gemini-omni-flash-multi-shot-video] [/blog/gemini-omni-flash-vfx-video-editing] [/mcp] [/blog/unlimited-mcp] |
| Gemini Omni Flash 1.1 | video | Google | closed (inferred) | Create Video option: generate and edit from any input | [/ai/video?model=gemini-omni-flash-1-1] [/blog/ai-video-prompt-adherence-comparison] [/blog/generate-voice-edit-ai-video-one-place] [/blog/higgsfield-vs-runway-2026] |
| Grok Imagine (earlier video) | video | xAI | closed (inferred) | Voice-driven short narrative clips | [/blog/Grok-Imagine-AI-Video-Best-Use-Cases] |
| Grok Imagine 1.5 Lite | video | xAI | closed (inferred) | Create Video option: cheap 480p to 1080p, 1 to 15 s | [/ai/video?model=grok_video_v15_lite] |
| Grok Imagine Video 1.5 | video | xAI | closed (inferred) | Create Video option: 1 to 15 s with synced audio | [/ai/video?model=grok_video_v15] [/creator-hub/changelog] [/blog/generate-ai-videos-higgsfield-api] |
| Higgsfield DoP | video | Higgsfield | closed (stated) | Preset-driven image-to-video, 3 or 5 s, including an Effects preset category | [/creator-hub/help-center/ai-models/how-do-i-use-dop] [/blog/higgsfield-api] |
| Higgsfield Genjutsu | video | Higgsfield | closed (stated) | Motion transfer, object swap and Restyle on an existing 4 to 30 s clip with up to 30 references; web, MCP, ChatGPT and API | [/ai/video?model=genjutsu] [/blog/higgsfield-genjutsu] [/creator-hub/changelog] |
| Higgsfield Motion | video | Higgsfield | closed (stated) | Marketing Studio Product Motion | [/blog/new-marketing-studio-higgsfield] |
| Higgsfield Speak 2.0 | video | Higgsfield | closed (stated) | Lipsync Studio image-to-video, priority-queue speed | [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] |
| InfiniteTalk | video | not stated (MeiGen, inferred) | open (inferred) | Long-form talking video in Lipsync Studio | [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/lipsync-studio] [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] |
| Kling 2.1 | video | Kuaishou | closed (inferred) | Legacy quick HD image-to-video | [/creator-hub/help-center/ai-models/how-do-i-use-kling] |
| Kling 2.1 Master | video | Kuaishou | closed (inferred) | Legacy higher-fidelity 2.1 | [/creator-hub/help-center/ai-models/how-do-i-use-kling] |
| Kling 2.5 Turbo | video | Kuaishou | closed (inferred) | Legacy fast generation; API "Kling 2.5" | [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/higgsfield-api] |
| Kling 2.6 | video | Kuaishou | closed (inferred) | Cinematic clips with audio, 5 to 10 s | [/creator-hub/help-center/ai-models/how-do-i-use-kling] [/blog/higgsfield-api] |
| Kling 2.6 Lipsync | video | Kuaishou | closed (inferred) | Image-to-video lip sync in Lipsync Studio | [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/make-ai-lipsync-videos] |
| Kling 2.6 Motion Control | video | Kuaishou | closed (inferred) | Motion transfer from a reference video onto a character image (2.6 generation; unlimited promo Dec 2025) | [/blog/Kling-2.6-Motion-Control-Full-Guide] |
| Kling 3.0 | video | Kuaishou | closed (inferred) | Multi-shot scenes with audio, up to 4K, 3 to 15 s | [/ai/video?model=kling3_0] [/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation] [/blog/ai-human-motion-2026] [/creator-hub/help-center/tools/how-do-i-use-canvas] |
| Kling 3.0 Lipsync | video | Kuaishou (inferred) | closed (inferred) | Named as a Lipsync Studio model in one Jun 2026 listicle only | [/blog/best-ai-video-consistent-characters] |
| Kling 3.0 Motion Control | video | Kuaishou | closed (inferred) | Motion transfer from video to character image, 720p and 1080p | [/ai/video/motion] [/blog/kling-motion-control-3] [/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent] [/blog/unlimited-mcp] |
| Kling 3.0 Omni | video | Kuaishou | closed (inferred) | Top-quality 4K generation and editing | [/creator-hub/help-center/ai-models/how-do-i-use-kling] |
| Kling 3.0 Omni Edit | video | Kuaishou | closed (inferred) | Prompt, style and local edits on existing footage, early access | [/ai/video/edit?model=kling-video-reference-o3] |
| Kling 3.0 Turbo | video | Kuaishou | closed (inferred) | Fast drafts at 1080p | [/creator-hub/help-center/ai-models/how-do-i-use-kling] |
| Kling Avatars 2.0 | video | Kuaishou | closed (inferred) | Talking avatar from one image and audio | [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/creator-hub/help-center/ai-models/how-do-i-use-kling] |
| Kling Lipsync | video | Kuaishou | closed (inferred) | Video-to-video lip sync | [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] |
| Kling O1 Video | video | Kuaishou | closed (inferred) | Unified generation from up to 7 images or start and end frames | [/blog/Kling-01-is-Here-A-Complete-Guide-to-Video-Model] |
| Kling O1 Video Edit | video | Kuaishou | closed (inferred) | Edit mode: motion transfer, background, grade, light | [/blog/Kling-01-is-Here-A-Complete-Guide-to-Video-Model] [/creator-hub/help-center/ai-models/how-do-i-use-kling] |
| Kling Speak | video | Kuaishou (inferred) | closed (inferred) | Older Lipsync Studio model (unlimited 720p, Sep 2025) | [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] |
| LTX 2.5 Pro | video | Lightricks (inferred) | not stated | Higgsfield API catalog, $0.17/s | [/blog/higgsfield-api] |
| MiniMax H3 (Hailuo 3.0) | video | MiniMax | closed (inferred) | Create Video option: 2K video from text, keyframes or references | [/ai/video?model=minimax_h3] [/blog/minimax-h3-higgsfield] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] [/blog/higgsfield-api] |
| MiniMax H3 Max | video | MiniMax | closed (inferred) | Higher H3 tier (changelog title; details not stated) | [/creator-hub/changelog] [/blog/best-ai-video-generation-apis] |
| MiniMax Hailuo 02 | video | MiniMax | closed (inferred) | Older version, footer link only | [/blog/Minimax-Hailuo-2.3-A-Creative-Guide] |
| MiniMax Hailuo 2.3 | video | MiniMax | closed (inferred) | Turn to Video target from Seedream | [/blog/photo-to-ai-video] [/blog/Minimax-Hailuo-2.3-A-Creative-Guide] [/blog/ai-tiktok-pipeline-2026] |
| MiniMax Hailuo 2.3 Fast | video | MiniMax | closed (inferred) | Fast, cheap drafts | [/blog/Minimax-Hailuo-2.3-A-Creative-Guide] [/blog/5-Best-AI-Video-Models-2026-Tested-Compared] |
| PixVerse 6 | video | PixVerse | closed (inferred) | Higgsfield API catalog, $0.115/s | [/blog/higgsfield-api] |
| Seedance 1.5 Pro | video | ByteDance | not stated | Older version under All models | [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/seedance-2-on-higgsfield] |
| Seedance 2.0 | video | ByteDance | closed (inferred) | Realistic multimodal video, 480p to 4K, 4 to 15 s; plugin default video model | [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/generating-with-seedance-2-0] [/blog/ai-video-hands-faces] [/blog/ai-batch-generation-tools-2026] |
| Seedance 2.0 Fast (Enhanced Seedance 2.0 Fast) | video | ByteDance (via BytePlus) | closed (inferred) | High-throughput 480p and 720p drafts; Unlimited add-on model; Starter access | [/blog/seedance-unlimited] [/blog/seedance-2-0-pricing-2026] [/blog/unlimited-mcp] |
| Seedance 2.0 Mini | video | ByteDance | closed (inferred) | Fastest, cheapest short-form drafts, 480p and 720p | [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/blog/unlimited-mcp] [/blog/higgsfield-all-unlimited-explained] [/apps/character-swap] |
| Seedance 2.5 | video | ByteDance | closed (inferred) | Flagship 4 to 30 s video with audio, 50 references; engine of Cinema Studio 4.0 | [/ai/video?model=seedance_2_5] [/blog/seedance-2-5-on-higgsfield-2026] [/creator-hub/help-center/ai-models/how-do-i-use-seedance] [/creator-hub/help-center/tools/how-do-i-use-cinema-studio] |
| Seedance 2.5 Draft Mode | video | ByteDance | not stated | Draft variant of 2.5 (title and incident mention only) | [/creator-hub/changelog] |
| Seedance 2.5 Edit | video | ByteDance | closed (inferred) | Region or prompt edits and Draw to Edit on clips up to 30 s | [/blog/edit-ai-video-without-regenerating] [/blog/ai-video-restoration-high-quality] [/blog/100-plus-ad-variations-ai] |
| Seedance 4K (Seedance 2.0 at 4K) | video | ByteDance | closed (inferred) | Native 4K cinematic and VFX-over-footage generation | [/blog/Seedance-4k] [/blog/VFX-with-Seedance-4k] |
| Seedance Pro | video | ByteDance | not stated | Older version under All models | [/creator-hub/help-center/ai-models/how-do-i-use-seedance] |
| Seedance Pro Fast | video | ByteDance | not stated | Older version under All models | [/creator-hub/help-center/ai-models/how-do-i-use-seedance] |
| Sora 2 | video | OpenAI | closed (inferred) | Memes, bodycam-style clips, Sora 2 Trends presets and Popcorn export until Sep 24, 2026 (retired); presets moved to Seedance 2.0 | [/blog/7yl97OfLfW8LCpOD41wU2Q] [/blog/sora-api-migration-guide] [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP] [/blog/The-AI-Storyboard-Generator-That-Feels-Like-Directing] |
| Sync Lipsync 2 Pro | video | not stated (Sync, inferred) | closed (inferred) | Older Lipsync Studio model (Sep 2025 trial) | [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] |
| Sync Lipsync 3 | video | not stated (Sync, inferred) | closed (inferred) | Video-to-video lip sync up to 4K | [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] |
| Veo 3 / Veo 3 Fast | video | Google | closed (inferred) | Talking clips in Lipsync Studio | [/blog/100-plus-ad-variations-ai] [/blog/ai-video-ad-localization] [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] [/blog/make-ai-lipsync-videos] |
| Veo 3.1 | video | Google | closed (inferred) | Create Video option: video with sound | [/ai/video?model=veo-3-1-preview] [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model] [/blog/ai-batch-generation-tools-2026] [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] |
| Veo 3.1 Fast | video | Google | closed (inferred) | Faster tier with Start and End frame | [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model] |
| Veo 3.1 Lite | video | Google | closed (inferred) | Cheapest drafts, 8 s for 8 to 12 credits | [/blog/best-affordable-ai-video-generators] |
| Wan 2.2 | video | Alibaba (inferred) | open (inferred) | Engine behind the 2025 face and character swap tools | [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide] |
| Wan 2.5 | video | Alibaba (inferred) | not stated | Audio-synced video (help table) | [/creator-hub/help-center/ai-models/how-do-i-use-lipsync-voiceover-and-aspect-ratios] |
| Wan 2.5 Fast | video | Alibaba | not stated | Default Lipsync Studio model, 5 s 720p for 9 credits | [/lipsync-studio] |
| Wan 2.5 Speak | video | Alibaba (inferred) | not stated | Talking clips in Lipsync Studio, 480p to 1080p | [/blog/still-image-to-talking-video] [/lipsync-studio] |
| Wan 2.6 | video | Alibaba | open (Apache 2.0 per pages) | First/last frame, camera control, restyle | [/blog/WAN-2.6-by-Alibaba-User-Guide-on-Higgsfield] [/blog/turn-your-video-into-cinema-using-wan-camera-control] [/blog/keep-ai-character-consistent] [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP] |
| Wan 2.7 | video | Alibaba | not stated | Turn to Video target from Seedream | [/blog/photo-to-ai-video] [/blog/ai-video-credits-explained] [/blog/new-unlimited-more-models] [/blog/ai-batch-generation-tools-2026] |
| Wan 3.0 | video | Alibaba | not stated | Create Video option: up to 30 s from text, keyframes or references | [/ai/video?model=wan3_0] [/creator-hub/changelog] [/blog/higgsfield-api] [/apps/character-swap] |
| Wan 3.0 Prime | video | Alibaba | not stated | Higher Wan 3.0 tier; unlimited for 7 days on Pro and up from Oct 13, 2026 | [/creator-hub/changelog] [/apps/character-swap] |
| Eleven v3 | audio | ElevenLabs | closed (inferred) | Emotion via inline tags | [/audio?voiceMode=voiceover&audioModel=elevenlabs] [/blog/higgsfield-audio] [/blog/unlimited-mcp] [/blog/higgsfield-all-unlimited-explained] |
| Eleven v4 | audio | ElevenLabs | closed (inferred) | Expressive TTS, multi-speaker, 90+ languages, 10,000 characters | [/audio?voiceMode=voiceover&audioModel=elevenlabs_v4] [/creator-hub/changelog] |
| Eleven v4 Turbo | audio | ElevenLabs (inferred) | closed (inferred) | Fast expressive TTS with stability and similarity | [/audio?voiceMode=voiceover&audioModel=elevenlabs_v4_turbo] |
| MiniMax Speech 2.8 HD | audio | MiniMax | closed (inferred) | High-fidelity single-voice narration, voice cloning | [/audio?voiceMode=voiceover&audioModel=minimax] [/blog/consistent-ai-voice-across-videos] [/blog/unlimited-mcp] [/blog/higgsfield-all-unlimited-explained] |
| Qwen Audio 3.0 | audio | not stated (Alibaba Qwen, inferred) | not stated | General natural speech, 13+ languages, cheapest TTS | [/audio?voiceMode=voiceover&audioModel=qwen_audio] [/blog/higgsfield-audio] |
| Seed Audio 1.0 | audio | ByteDance | closed (inferred) | Multi-speaker speech with ambience, 50+ presets, cloning, dubbing; music and effects per some pages | [/audio?voiceMode=voiceover&audioModel=seed_audio] [/blog/higgsfield-audio] [/creator-hub/help-center/ai-models/which-ai-model-should-i-use] [/blog/talking-ai-avatar-inside-claude] |
| Seed Speech | audio | ByteDance | closed (inferred) | Multilingual TTS, 30+ languages | [/audio?voiceMode=voiceover&audioModel=seed_speech] [/blog/start-faceless-channel-with-ai] [/blog/unlimited-mcp] [/blog/higgsfield-all-unlimited-explained] |
| VibeVoice | audio | not stated (Microsoft, inferred) | open (inferred) | Long-form narration (audiobooks, podcasts); not in current nav | [/blog/higgsfield-audio] [/blog/unlimited-mcp] [/blog/higgsfield-all-unlimited-explained] [/blog/start-faceless-channel-with-ai] |
| ByteDance Upscale | upscaler | ByteDance | not stated | Video upscale up to 8K (image up to 4K), fidelity-first | [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do] [/blog/ai-video-restoration-high-quality] |
| FLUX.3 Upscale | upscaler | Black Forest Labs | not stated | Precise or Creative video upscale, up to 13.75 MP per frame | [/ai/video/edit?tool=upscale&toolModel=flux-video-upscale] [/blog/ai-video-restoration-high-quality] |
| Higgsfield Upscale (Sora 2 Upscale, 2025) | upscaler | not stated | not stated | 2025 one-click restore: deflicker, stabilize, denoise, upscale | [/blog/Upgrade-the-Quality-of-Old-Videos-using-Upscale] [/blog/Higgsfield-Upscale-Phone-vs-Camera] [/blog/Restore-Your-Old-Video-With-Higgsfield-Upscale] |
| Topaz Generative | upscaler | Topaz | closed (inferred) | Diffusion image upscaler | [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do] |
| Topaz High-Resolution Upscaler | upscaler | Topaz Labs | closed (inferred) | Default image upscale, x1 to x16, 3 credits | [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do] [/blog/restore-old-photos-ai] |
| Topaz Video | upscaler | Topaz | closed (inferred) | Diffusion-based video upscale that adds detail | [/creator-hub/help-center/troubleshooting/my-video-upscale-is-stuck-or-failed-what-should-i-do] |
| Meshy 5 | 3d | Meshy (inferred) | closed (inferred) | Blender 3D Model tab | [/blog/higgsfield-blender-plugin] |
| Claude (version not stated) | llm | Anthropic | closed (inferred) | Claude Chat AI Director in Cinema Studio: writes prompts and adjusts genre, style and camera settings | [/creator-hub/help-center/tools/how-do-i-use-cinema-studio] |
| Claude Fable 5 | llm | Anthropic | closed (inferred) | External planner in Claude with MCP (games, faceless, motion design); "Fable engine" for Supercomputer games | [/blog/Higgsfield-Games] [/blog/MCP-For-Motion-Designers] [/blog/faceless-channel-one-prompt] [/creator-hub/help-center/integrations/external-integrations-higgsfield] |
| Claude Fable 5.1 | llm | Anthropic | closed (inferred) | Supercomputer selector option | [/creator-hub/changelog] [/blog/higgsfield-3d-jutsu] |
| Claude Opus 4.6 | llm | Anthropic | closed (inferred) | Older Supercomputer pick for long-form creative work | [/blog/higgsfield-supercomputer-guide] |
| Claude Opus 5 | llm | Anthropic | closed (inferred) | Supercomputer selector option (3D Jutsu agent) | [/blog/higgsfield-3d-jutsu] |
| Claude Opus 5.5 | llm | Anthropic | closed (inferred) | Supercomputer LLM for complex open-ended work; Katana branding | [/creator-hub/changelog] [/katana] |
| Claude Sonnet 4.6 | llm | Anthropic | closed (inferred) | Older Supercomputer default suggestion for most video jobs | [/blog/higgsfield-supercomputer-guide] |
| Claude Sonnet 5.5 | llm | Anthropic | closed (inferred) | Supercomputer LLM for well-defined tasks | [/creator-hub/changelog] |
| DeepSeek V4 Pro | llm | DeepSeek | open (inferred) | Supercomputer coding-focused option | [/blog/higgsfield-supercomputer-guide] [/creator-hub/help-center/tools/how-do-i-use-supercomputer] |
| Gemini 3.0 Flash | llm | Google | closed (inferred) | Older Supercomputer pick for fast drafts | [/blog/higgsfield-supercomputer-guide] |
| Gemini 3.1 Pro | llm | Google | closed (inferred) | Older Supercomputer pick for multimodal briefs | [/blog/higgsfield-supercomputer-guide] |
| Gemini 3.5 Flash | llm | Google | closed (inferred) | Older Supercomputer pick for fast drafts | [/blog/higgsfield-supercomputer-guide] |
| GLM-5.3 Flash | llm | Zhipu AI (inferred) | open (inferred) | Replaced Ox Alpha in Supercomputer | [/creator-hub/changelog] [/blog/higgsfield-3d-jutsu] |
| GPT-5.5 | llm | OpenAI | closed (inferred) | Older Supercomputer pick for sequential multi-step work | [/blog/higgsfield-supercomputer-guide] |
| GPT-5.6 Sol | llm | OpenAI | closed (inferred) | Supercomputer selector option; Astra comparison baseline | [/blog/higgsfield-3d-jutsu] [/blog/higgsfield-mcp-gpt6-astra-games-2] |
| GPT-6 Astra | llm | OpenAI | closed (inferred) | Supercomputer and MCP; Games 2.0 logic; AI Motion Designer; home "Supercomputer agent" | [/creator-hub/changelog] [/blog/higgsfield-mcp-gpt6-astra-games-2] [/ai-motion-designer] [/blog/higgsfield-3d-jutsu] |
| GPT-6 Luna | llm | OpenAI | closed (inferred) | Supercomputer and MCP | [/creator-hub/changelog] |
| GPT-6 Sol | llm | OpenAI | closed (inferred) | Supercomputer and MCP | [/creator-hub/changelog] |
| GPT-6.1 Sol | llm | OpenAI | closed (inferred) | Supercomputer (manual pick); runs OpenAI Dots per OpenAI | [/creator-hub/changelog] |
| Grok 4.3 | llm | xAI | closed (inferred) | Older Supercomputer pick for research-first briefs | [/blog/higgsfield-supercomputer-guide] |
| Grok 4.7 | llm | xAI | closed (inferred) | Supercomputer LLM | [/creator-hub/changelog] |
| Kimi K2.6 | llm | Moonshot AI (inferred) | open (inferred) | Older Supercomputer coding-focused option | [/blog/higgsfield-supercomputer-guide] |
| Kimi K3 | llm | Moonshot AI (inferred) | open (inferred) | Default model shown in the Games builder | [/blog/higgsfield-ai-games] |
| Orchestrator (Auto) | llm | Higgsfield | not applicable (router) | Default Supercomputer router that sends each step to a suitable model; Auto is free | [/creator-hub/changelog] [/blog/agentic-ai-for-content-creation] [/blog/higgsfield-3d-jutsu] |
| Ox Alpha | llm | not stated | not stated | Free Supercomputer LLM, later replaced by GLM-5.3 Flash | [/creator-hub/changelog] |

Competitor models the pages mention but Higgsfield does not offer:

- Runway Gen-4.5 and Gen-4 Turbo, plus Aleph 2.0 and Act-Two tools (Gen-4.5 "isn't listed on Higgsfield") [/blog/higgsfield-vs-runway-2026] [/blog/ai-video-api-pricing-vs-subscriptions]
- Pika 2.5 (Pikaffects, Pikaswaps, Pikadditions) [/blog/best-veo-alternatives-character-consistency]
- Luma Ray3.2 and Ray 3.14 (Dream Machine) [/blog/best-veo-alternatives-character-consistency] [/blog/best-sora-alternatives-2026]
- PixVerse and Vidu own model lines on their own apps [/blog/best-affordable-ai-video-generators]
- Hailuo 1.0 / 2.0 unlimited on MiniMax's Hailuo app [/blog/best-unlimited-ai-video-generators]
- Veo 2 and LTX-2.3 on other all-in-one platforms [/blog/all-in-one-ai-video-tools]
- Adobe Firefly Video Model, Midjourney video (Relax mode) [/blog/best-ai-tools-motion-designers] [/blog/annual-unlimited-ai-video-plans]
- No pages mention Hunyuan, Moonvalley/Marey or other open models as available on Higgsfield.

## Launch timeline from the changelog

Dated entries in the captured changelog, newest first [/creator-hub/changelog]. The capture stops partway through the Sep 24, 2026 entries.

| Date | Entry | Type | Area | What shipped |
|---|---|---|---|---|
| Oct 13, 2026 | Unlimited Wan 3.0 for 7 days and 60% off on the API | Feature | Models | A free week of Wan 3.0 and Wan 3.0 Prime on Pro and higher plans (clips up to 30 s at 1080p, shared queue); 60% off for API users until Oct 31 |
| Oct 8, 2026 | Katana | Release | MCP and integrations | Claude skill for Aura Farming, Motion and Clipping edits from up to 5 reference images; community presets |
| Oct 8, 2026 | Film Festival Audience Choice voting is open | Announcement | Platform | Voting until Oct 15 for a $100,000 prize; up to 5 votes per paid account |
| Oct 7, 2026 | Higgsfield Discord 200K Contest | Announcement | Platform | 200,000-credit prize pool for viral-trend remakes made in a Cinema Studio contest project |
| Oct 6, 2026 | Ad Multiplier | Release | Video tools | Visual interface in Ads Studio: one 4 to 30 s reference ad plus up to 20 images, 480p to 1080p |
| Oct 6, 2026 | Nano Banana 2.1 | Feature | Models | Google's Nano Banana 2 update: up to 14 references, text edits, 1K to 4K |
| Oct 5, 2026 | Higgsfield Global Film Festival dates updated | Announcement | Platform | Shortlist Oct 8, jury review Oct 9 to 14, winners in the last week of October |
| Oct 3, 2026 | Seedance generation failures resolved | Fix | Models | Provider-side failures on Seedance 2.0, 2.0 Mini, 2.0 Fast and 2.5 Draft Mode; credits refunded automatically |
| Oct 2, 2026 | AI Influencer | Release | Image tools | Character Builder (19 categories), Add your face, Use in Genjutsu; 5 free generations per user |
| Oct 2, 2026 | Higgsfield API cashback | Release | Platform | $15 bonus after the first $100 of API spend; 5% to 20% cashback set by 30-day spend |
| Oct 1, 2026 | Grok Imagine Video 1.5 | Feature | Models | xAI video with sound in the same pass; image, text, reference (up to 7 images) and extension modes; 1 to 15 s, up to 1080p |
| Oct 1, 2026 | FLUX 3 Image | Feature | Models | Black Forest Labs text-to-image and image-to-image, 768p to 4K |
| Sep 30, 2026 | Ads Studio | Release | Image tools | Static ad creatives from a website link with a reusable brand setup; up to 20 ads per product per batch |
| Sep 30, 2026 | Ideogram 4.5 | Feature | Models | Edit-focused image model: up to 4 reference images, text replace and translate, transparent background, 1K or 2K |
| Sep 30, 2026 | Genjutsu Restyle | Release | Video tools | Redraws a 4 to 30 s video in 20+ preset styles or a custom one; up to 30 references; web and MCP |
| Sep 30, 2026 | Higgsfield extension for ChatGPT | Feature | MCP and integrations | Slash commands /effects, /product, /motion, /marketing-studio and /genjutsu; ads, UGC, sites and games inside ChatGPT |
| Sep 30, 2026 | Seedance 2.0 generation failures and Seedance 2.5 delays resolved | Fix | Models | Provider-side issue cleared |
| Sep 29, 2026 | OpenAI Dots | Feature | MCP and integrations | Always-on ChatGPT agents (GPT-6.1 Sol) use Cinema Studio, Genjutsu and Marketing Studio through the plugin |
| Sep 29, 2026 | GPT-6.1 Sol | Feature | Supercomputer | OpenAI LLM added to Supercomputer as a manual pick; Orchestrator stays the default |
| Sep 29, 2026 | Credit reset: up to 2,000 free credits | Release | Billing and plans | Paid plans topped up to the full monthly amount until Sep 30 |
| Sep 28, 2026 | Eleven v4 | Feature | Audio | ElevenLabs TTS: several speakers, 90+ languages, up to 10,000 characters |
| Sep 27, 2026 | Claude Sonnet 5.5 | Feature | Supercomputer | Anthropic LLM in Supercomputer for well-defined tasks |
| Sep 24, 2026 | Mobile interface redesign | Improvement | Platform | Mobile opens on the prompt bar, with sidebar navigation and an Agent tab |
| Sep 24, 2026 | Higgsfield API cashback (launch promo) | not captured | Platform | $1 back for every $1 of API spend until Sep 30 |

Older changelog entries survive only as titles, in page order (newest first). The nearest dated evidence is a blog post on the same launch; those dates are blog post dates, not changelog dates. Taken together the titles span roughly mid-August to Sep 24, 2026.

| Order | Changelog title | Nearest dated evidence | Source |
|---|---|---|---|
| 1 | Production Skills Bundle | Full production skills over MCP described Sep 2, 2026 | [/blog/claude-higgsfield-mcp-creative-studio] |
| 2 | Seedream 5.0 Flash | none | not stated |
| 3 | Claude Opus 5.5 | none (the Katana page credits Opus 5.5) | [/katana] |
| 4 | Seedance 2.5 Draft Mode | named in the Oct 3, 2026 fix entry | [/creator-hub/changelog] |
| 5 | GPT Image 2.5. Now on Higgsfield | blog post Sep 8, 2026 (dated earlier than the API post, though this title sits above it) | [/blog/gpt-image-2-5-higgsfield] |
| 6 | GPT-6 Sol and GPT-6 Luna. Now in Supercomputer and MCP | none | not stated |
| 7 | Grok 4.7 in Supercomputer | none | not stated |
| 8 | Higgsfield API is here | blog post Sep 16, 2026 | [/blog/higgsfield-api] |
| 9 | Presets for After Effects | none | not stated |
| 10 | Introducing AI Motion Designer | blog post Sep 10, 2026 | [/blog/ai-motion-designer-after-effects-gpt] |
| 11 | Effects 2.0. Viral presets in ChatGPT | none | not stated |
| 12 | GPT-6 Astra. Now in Higgsfield MCP and Supercomputer | blog post Sep 7, 2026 (Games 2.0) | [/blog/higgsfield-mcp-gpt6-astra-games-2] |
| 13 | Introducing 3D Jutsu | blog post Sep 5, 2026 | [/blog/higgsfield-3d-jutsu] |
| 14 | GPT-6 Astra. Now in Supercomputer | in the Supercomputer selector by Sep 5, 2026 | [/blog/higgsfield-3d-jutsu] |
| 15 | Scale plans. Updated | none | not stated |
| 16 | Claude Fable 5.1. Now in Supercomputer | in the Supercomputer selector by Sep 5, 2026 | [/blog/higgsfield-3d-jutsu] |
| 17 | Introducing Genjutsu | blog post Aug 31, 2026 | [/blog/higgsfield-genjutsu] |
| 18 | MiniMax H3 Max. Now on Higgsfield | base H3 blog post Aug 16, 2026 | [/blog/minimax-h3-higgsfield] |
| 19 | Gemini Omni 1.1 Flash. Now on Higgsfield | first dated mention Aug 30, 2026 | [/blog/ai-video-prompt-adherence-comparison] |
| 20 | FLUX 3 Video Upscaler. Now on Higgsfield | in the Sep 3, 2026 upscale guide | [/blog/ai-video-restoration-high-quality] |
| 21 | Higgsfield MCP. Fixed | none | not stated |
| 22 | Recraft V4. Now on Higgsfield | blog post Aug 26, 2026 | [/blog/recraft-v4-higgsfield] |
| 23 | Higgsfield Apps. Back online | none | not stated |
| 24 | GLM-5.3 Flash replaces Ox Alpha in Supercomputer | in the Supercomputer selector by Sep 5, 2026 | [/blog/higgsfield-3d-jutsu] |
| 25 | Higgsfield Global Film Festival. Deadlines extended | festival announced Aug 10, 2026 | [/blog/higgsfield-global-film-festival] |
| 26 | Ad Multiplier. New skill for Claude | none | not stated |
| 27 | Affiliate Program. Now live | blog post Aug 24, 2026 | [/blog/higgsfield-affiliate-program-2026] |
| 28 | Ox Alpha. Free in Supercomputer | none | not stated |
| 29 | Wan 3.0 and Wan 3.0 Prime. Now on Higgsfield | API rate listed Sep 16, 2026 | [/blog/higgsfield-api] |
| 30 | Projects. Now in Supercomputer | none | not stated |
| 31 | Grok Bot. Now in Higgsfield MCP | agents guide Sep 28, 2026 | [/blog/generate-ai-videos-ai-agents-2026] |
| 32 | Higgsfield. Now in Blender | blog post Aug 20, 2026 | [/blog/higgsfield-blender-plugin] |
| 33 | Higgsfield Relight and HEX for videos. Now standalone products | blog post Aug 20, 2026 | [/blog/video-relight-color-palette-higgsfield] |
| 34 | Faceless Studio. Out now | blog post Aug 21, 2026 | [/blog/faceless-youtube-videos-faceless-studio] |
| 35 | Higgsfield for Enterprise | none | not stated |

## Earlier launches by blog post date

Not in the captured changelog. Dates are blog post dates (when the launch or first guide was published), newest first.

| Date | Launch | Source |
|---|---|---|
| Aug 18, 2026 | New template-first Marketing Studio (1,500+ templates) | [/blog/new-marketing-studio-higgsfield] |
| Aug 17, 2026 | Edit Image tools: Layer Decomposition, Edit Text, Remove Background | [/blog/edit-photos-with-ai-higgsfield] |
| Aug 17, 2026 | Faceless Content Factory and UGC Factory skills in MCP and Supercomputer | [/blog/faceless-videos-ugc-ads-2026] |
| Aug 16, 2026 | FLUX.3 Video | [/blog/flux-3-higgsfield] |
| Aug 16, 2026 | MiniMax H3 (Hailuo 3.0) | [/blog/minimax-h3-higgsfield] |
| Aug 14, 2026 | 13 new Viral Presets | [/blog/how-to-make-viral-videos-viral-presets] |
| Aug 12, 2026 | Cinema Studio 4.0 | [/blog/cinema-studio-4-0] |
| Aug 10, 2026 | Higgsfield Global Film Festival ($1,000,000 prize pool) | [/blog/higgsfield-global-film-festival] |
| Aug 6, 2026 | Seedance 2.5 with Draw to Video; 33-day Unlimited Seedance 2.5 offer | [/blog/seedance-2-5-on-higgsfield-2026] [/blog/33-days-unlimited-seedance-2-5] |
| Aug 2, 2026 | 11-day Seedance 4K Unlimited and a free Seedance 2.0 4K page | [/blog/seedance-4k-unlimited-11-days] |
| Jul 31, 2026 | Six-model Audio lineup, adding Qwen Audio 3.0 | [/blog/higgsfield-audio] |
| Jul 28, 2026 | DaVinci Resolve plugin | [/blog/higgsfield-davinci-resolve] |
| Jul 28, 2026 | Games inside Supercomputer | [/blog/higgsfield-ai-games] |
| Jul 28, 2026 | Unlimited MCP 24-hour trial | [/blog/unlimited-mcp] |
| Jul 27, 2026 | New Unlimited: higher resolutions, more models | [/blog/new-unlimited-more-models] |
| Jul 23, 2026 | Figma and FigJam plugin | [/blog/higgsfield-figma-plugin] |
| Jul 22, 2026 | All Unlimited and a 1-day free trial | [/blog/higgsfield-all-unlimited-explained] |
| Jul 21, 2026 | Premiere Pro and After Effects plugin | [/blog/higgsfield-after-effects] |
| Jul 14, 2026 | Higgsfield Explainer | [/blog/ai-video-from-text-and-url] |
| Jul 14, 2026 | Referral program for Unlimited Seedance 2.0 | [/blog/how-to-get-free-unlimited-seedance-2] |
| Jul 9, 2026 | Higgsfield Apps (Supercomputer app builder) and a $100,000 App Contest | [/blog/introducing-higgsfield-apps] |
| Jul 2, 2026 | Shorts Studio guide | [/blog/how-to-make-youtube-shorts-with-ai] |
| Jun 30, 2026 | Gemini Omni Flash | [/blog/best-ways-to-access-gemini-omni-flash-2026] |
| Jun 25, 2026 | Seedance 2.0 at 4K (Seedance 4K) | [/blog/Seedance-4k] |
| June 2026 (month only) | 30-day Seedance Unlimited add-on on Enhanced Seedance 2.0 Fast | [/blog/free-unlimited-ai-video-generation-2026] |
| Jun 19, 2026 | Multiplayer games via MCP and the Games marketplace | [/blog/Higgsfield-Games] |
| Jun 15, 2026 | Supercomputer Orchestrator, AI Employees, connectors and scheduled tasks described | [/blog/agentic-ai-for-content-creation] |
| May 31, 2026 | Supercomputer, earliest dated mention | [/blog/make-many-with-ai] |
| May 8, 2026 | Higgsfield MCP for Claude, earliest guide | [/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP] |
| Apr 26, 2026 | Marketing Studio, earliest post (prompt-based formats) | [/blog/marketing-studio-video-1] |
| Apr 13, 2026 | Seedance 2.0 available globally, with 7 days unlimited | [/blog/seedance-prompting-guide] |
| Apr 2, 2026 | Seedance 2.0 on Higgsfield (business verification; not in the US or Japan) | [/blog/seedance-2-on-higgsfield] |
| Mar 30, 2026 | Cinema Studio 3.0 | [/blog/cinema-studio-3] |
| Mar 24, 2026 | Higgsfield Chat | [/blog/higgsfield-chat-social-network] |
| Mar 20, 2026 | Higgsfield Original Series | [/blog/blog-original-series] |
| Mar 18, 2026 | Cinema Studio 2.5 with Soul Cast | [/blog/cinema-studio-2-5-ai-video-generator] |
| Mar 16, 2026 | Similarity Scoring for Team plans | [/blog/content-scoring-higgsfield] |
| Mar 9, 2026 | Soul Cast | [/blog/soul-cast-ai-filmmaking] |
| Mar 5, 2026 | Kling Motion Control 3.0 | [/blog/kling-motion-control-3] |
| Mar 4, 2026 | Soul Cinema Preview | [/blog/soul-cinema-preview] |
| Mar 2, 2026 | Higgsfield Audio: voiceover, voice change, translate, voice cloning | [/blog/higgsfield-audio-ai-voice-tools] |
| Feb 26, 2026 | Soul 2.0 Photodump | [/blog/how-to-create-ai-photodump-higgsfield-soul] |
| Feb 25, 2026 | Nano Banana 2 | [/blog/Nano-Banana-2-Gemini-3.1-Flash-AI-Image-Generation] |
| Feb 24, 2026 | Soul Moodboards | [/blog/create-custom-ai-moodboard-soul-2] |
| Feb 23, 2026 | Soul HEX; Seedream 5.0 Lite | [/blog/hex-codes-ai-image-generation-color-control-soul] [/blog/Seedream-5.0-Lite-Review-How-to-Comparison] |
| Feb 17, 2026 | Cinema Studio 2.0 | [/blog/cinema-studio-guide] |
| Feb 12, 2026 | Kling 3.0 | [/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation] |
| Jan 28, 2026 | Grok Imagine (video) | [/blog/Grok-Imagine-AI-Video-Best-Use-Cases] |
| Jan 18, 2026 | Higgsfield Earn | [/blog/Higgsfield-Earn-Talent-And-Collaboration-Monetization] |
| Jan 6, 2026 | Relight | [/blog/Relight-Director-Style-Cinematic-Lighting] |
| Jan 5, 2026 | AI Stylist (Try-On) | [/blog/AI-Stylist-Recreate-Any-Outfit-with-Try-On] |
| Dec 20, 2025 | Unlimited Kling Motion Control (2.6) | [/blog/Kling-2.6-Motion-Control-Full-Guide] |
| Dec 18, 2025 | First Cinema Studio (date given in the build story) | [/blog/how-we-built-cinema-studio] |
| Dec 14, 2025 | WAN 2.6 | [/blog/WAN-2.6-by-Alibaba-User-Guide-on-Higgsfield] |
| Dec 11, 2025 | Nano Banana Pro Inpaint | [/blog/Top-Editing-Tool-in-2025-Nano-Banana-Pro-Inpaint] |
| Dec 8, 2025 | GPT Image 1.5 | [/blog/GPT-Image-1.5-by-OpenAI-is-on-Higgsfield-A-Complete-Guide] |
| Dec 6, 2025 | Skin Enhancer | [/blog/The-Skin-Enhancer-How-to-Retouch-Pictures-with-AI] |
| Dec 1, 2025 | Z-Image | [/blog/Z-Image-New-from-Alibaba-in-AI-Image-Generation] |
| Nov 30, 2025 | Kling O1 | [/blog/Kling-01-is-Here-A-Complete-Guide-to-Video-Model] |
| Nov 25, 2025 | Urban Cuts | [/blog/UrbanCuts-Create-Audio-Synced-Outfit-AI-Videos] |
| Nov 21, 2025 | Viral apps wave (Style Snap, Nano Strike and others) | [/blog/The-Complete-Guide-to-Viral-Higgsfield-Apps] |
| Nov 18, 2025 | Nano Banana Pro | [/blog/Nano-Banana-Pro-is-Here-Full-Review-and-Guide] |
| Nov 11, 2025 | Angles | [/blog/Change-the-Angle-of-Any-Image] |
| Nov 5, 2025 | Character Swap and Recast | [/blog/AI-Face-Character-Swap-in-Video-Photo-PRO-Guide] |
| Oct 28, 2025 | Next-generation Face Swap | [/blog/a-simple-guide-to-face-swap] |
| Oct 27, 2025 | Instadump | [/blog/Create-Ai-Photoshoots-With-Instadump] |
| Oct 26, 2025 | MiniMax Hailuo 2.3 | [/blog/Minimax-Hailuo-2.3-A-Creative-Guide] |
| Oct 19, 2025 | Higgsfield Popcorn | [/blog/AI-Tool-That-Allows-You-to-Replace-Faces-in-a-Movie-Scene] |
| Oct 14, 2025 | Veo 3.1 with Draw-to-Video; Higgsfield Upscale for old video | [/blog/How-to-Use-Google-Veo-3.1-Complete-Guide-for-the-New-Model] [/blog/Upgrade-the-Quality-of-Old-Videos-using-Upscale] |
| Oct 8, 2025 | Sora 2 | [/blog/7yl97OfLfW8LCpOD41wU2Q] |
| Sep 18, 2025 | Photodump Studio, bundled with Lipsync Studio models | [/blog/Higgsfield-Photodump-Studio-Your-Viral-Photoshoot] |
| Jun 25, 2025 | Higgsfield Soul | [/blog/Higgsfield-SOUL-Turns-Prompts-Into-Fashion-Ready-Shots] |
