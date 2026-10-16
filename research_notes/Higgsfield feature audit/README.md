# Higgsfield feature audit

As of 2026-10-16 · prepared for the ComfyField team

Higgsfield is one product made of about 300 user-facing features. There are 58 tools and studios, 92 single-purpose apps, at least 259 motion presets, 45 effects and 33 mixed-media looks. Behind them sit 143 named models, almost all of them closed third-party models, and a large preset and template layer. Open-weight models can already match its video quality; the biggest gaps are in images and in how much one generation can do. This report is our full map: what each feature does, how it is used, which model runs it, a screenshot, and which open-weight model ComfyField should use to match it.

## How the site is organized

The top navigation is the product: Explore, Image, Video, Audio, MCP, API, Genjutsu, Katana, AI Influencer, ChatGPT plugin, Ads Studio, Pricing and Enterprise. The Image, Video and Audio menus each list tools first, then the models Higgsfield resells.

| Menu | Menu screenshot |
|---|---|
| Image: 24 entries (Create Image, Cinematic Cameras, Canvas, Soul Moodboard, Soul ID, AI Influencer, Photodump, Relight, Inpaint, Upscale, Face swap, Character swap, then 12 models) | ![Image menu](screenshots/nav_image.jpg) |
| Video: 26 entries (Create Video, Cinema Studio, Faceless Studio, 3D Jutsu, Shorts Studio, Explainer, Canvas, Mixed Media, Edit Video, Video Upscale, Reframe, Click to Ad, Change Color Palette, then 13 models) | ![Video menu](screenshots/nav_video.jpg) |
| Audio: 10 entries (Text to Speech, Voice Change, Translate, then 7 voice models) | ![Audio menu](screenshots/nav_audio.jpg) |

| What | Count | Where in this report |
|---|---|---|
| Tools, studios, agent surfaces and platform pages | 58 features on 144 routes, plus 41 MCP skills | [Tools and studios](#tools-and-studios) |
| Single-purpose apps | 92 apps in 8 hub categories | [Apps](#apps-100) |
| Motion presets | 229 pages, 134 distinct presets; hubs name at least 259 | [Presets](#presets-motion-effects-and-mixed-media) |
| Effects hub | 45 effects | [Presets](#presets-motion-effects-and-mixed-media) |
| Mixed-media looks | 33 | [Presets](#presets-motion-effects-and-mixed-media) |
| Models Higgsfield sells | 143 named models | [Model catalog](#model-catalog-and-landing-pages), [Open-weight models](#open-weight-models-to-match-higgsfield) |
| Landing and model pages | 135 | [Model catalog](#model-catalog-and-landing-pages) |
| Help center, blog and original series | 104, 272 and 43 pages | [How-to and models reference](how-to-and-models.md) |
| Every page captured | 1,060 pages, about 900 screenshots | [Route index](route-index.md) |

## Headline findings

- **The value is in packaging, not models.** Almost every feature is a preset, a template or a fixed prompt over a resold model. Apps and preset pages almost never name the model they run. The exceptions are Higgsfield's own DoP (motion presets), Soul (images) and Speak (talking heads).
- **Video dominates.** 55 of the 92 apps start in video mode. Image apps cost 1 to 2 credits, video effect and ad templates 15 to 26.
- **Open weights match the video quality but not the size of one generation.**
  - **Quality:** MiniMax H3 is #1 on Artificial Analysis image to video.
  - **Length and resolution:** the open version renders 15 s at 768p. Seedance 2.5 and Wan 3.0 on Higgsfield render 30 s at 1080p to 4K.
  - **References:** open models take 9 to 10. Cinema Studio takes 50.
- **Images are the real quality gap.** The best open text to image scores 1040 against 1218 for GPT Image 2.5 Sunburst. The best open editor scores 1083 against 1199.
- **Higgsfield already resells nine open-weight families**, including MiniMax H3, LTX-2.5, Wan 2.2, InfiniteTalk, Z-Image and Kimi K3. ComfyField can offer those same models with no quality loss.
- **Most missing features are cheap to add.**
  - **Apps:** 46 of the 92 have no ComfyField format, and 34 of those are one photo plus a fixed prompt.
  - **Presets:** about 106 motion presets and effects are missing, plus all 33 mixed-media looks.
- **37 of 45 capabilities can run on Comfy Cloud** with their best open-weight model. Seven more have a Cloud fallback but run best on a rented GPU: TTS, voice cloning, dubbing, foley, video judging, video re-angle and LoRA training. Only explorable 3D worlds is rented-GPU only.

## How this was captured

- **Pages:** every route in Higgsfield's sitemaps plus every item in the Image, Video and Audio menus (hovered open), rendered in a signed-out headless browser on 2026-10-16. Help center, blog and series pages were read as text.
- **Screenshots:** 1440×900, with non-essential cookies declined. Tool pages that need an account show their signed-out view. A few studios render only a frame or a loading state when signed out, and their how-to steps come from the help center and blog instead.
- **Models:** model names come from the pages themselves. Open-weight picks come from two research passes on primary sources (Hugging Face, GitHub, blog.comfy.org, Artificial Analysis), saved in `research_notes/Open weight model lineup/`.
- **Licenses:** picks are made on quality and capability. License notes are kept for after the 2026-10-30 submission, since Comfy is expected to cover them.
- **Limits:** text was cut at 12,000 to 15,000 characters per page, and the changelog has dates only from September 24 onward. Some counts disagree across Higgsfield's own pages; where they do, the sections give both values.

## Contents

1. [Tools and studios](#tools-and-studios)
2. [Apps](#apps-100)
3. [Presets: motion, effects and mixed media](#presets-motion-effects-and-mixed-media)
4. [Model catalog and landing pages](#model-catalog-and-landing-pages)
5. [Platform: plans, credits, API and community](#platform-plans-credits-api-and-community)
6. [Open-weight models to match Higgsfield](#open-weight-models-to-match-higgsfield)
7. Appendix: [How-to and models reference](how-to-and-models.md) (241 features, 134 models, launch timeline)
8. Appendix: [Every captured page](route-index.md) (1,060 pages with links and screenshots)

---

## Tools and studios

Higgsfield packs about 60 tools behind three dropdown menus and a long top bar. The Image menu lists 12 features and 12 model shortcuts, the Video menu 13 features and 13 model shortcuts, and the Audio menu 3 modes and 7 voice models. Canvas appears in both Image and Video, so that is 59 distinct menu entries. Every model shortcut opens the same generator (Create image, Create video or Audio) with that model already picked, so the "models" are presets of three composers, not separate tools. Next to the menus, the top bar links to standalone studios with their own layouts: Cinema Studio, Marketing Studio, Ads Studio, Genjutsu, AI Influencer, Effects, 3D Jutsu and Canvas. Lipsync Studio and Fashion Factory are linked only from the footer's Studios list. It also links to agent surfaces: Supercomputer, an in-app chat agent; MCP and the ChatGPT plugin and CLI, which connect outside agents; Katana and AI Motion Designer, workflows that run inside Claude or ChatGPT; and 41 MCP skill and bundle pages. The rest of the bar is platform pages: API, Plugins, Academy, Community, Contests, Originals, Pricing and Enterprise. This section covers all 144 captured routes in 58 entries. The model shortcuts are grouped into one family table per menu, and the MCP skills share one table. Most tool pages show only the app frame when signed out, so the step-by-step details come from Higgsfield's help center, blog and changelog where the page was thin. Each entry says where its details came from.

| Feature | Route | Menu | What it does | Model(s) | Screenshot |
|---|---|---|---|---|---|
| Create image | `/ai/image?model=gpt_image_2` (+1) | Image | One prompt bar for every image model, with references, ratio, quality and batch | GPT Image 2 by default; every image model | [shot](screenshots/tools/ai_image_model_gpt_image_2.jpg) |
| Cinematic cameras | `/generate?mode=image&imageModel=cinematic-v1` | Image | Cinema Studio image mode: build a still from a camera body, lens and focal length | cinematic-v1 (named only in the URL) | [shot](screenshots/tools/generate_mode_image_imageModel_cinematic_v1.jpg) |
| Canvas | `/canvas` | Image, Video | Node board that chains prompts, references and models into a pipeline | Every model as a node | [shot](screenshots/tools/canvas.jpg) |
| Soul moodboard | `/moodboard` | Image | Turns your reference images into a reusable style preset | Soul 2.0 | [shot](screenshots/tools/moodboard.jpg) |
| Soul ID character | `/character` | Image | Trains one face from 20 to 80 photos for reuse | Soul family; Seedance through Elements | [shot](screenshots/tools/character.jpg) |
| AI Influencer | `/ai-influencer-studio` | Image | Builds a persona from 19 menus, then animates it | Not stated; Genjutsu for motion | [shot](screenshots/tools/ai_influencer_studio.jpg) |
| Photodump | `/ai/image?model=soul-v2&modal-photo-dump=true` (+1) | Image | One click makes a preset photo set of your character | Soul 2.0 with Soul ID | [shot](screenshots/tools/ai_image_model_soul_v2_modal_photo_dump_true.jpg) |
| Relight | `/apps/relight` | Image | Moves a virtual light around a photo | Not stated | [shot](screenshots/tools/apps_relight.jpg) |
| Inpaint and Layers | `/layers?model=nano_banana_pro_inpaint` (+2) | Image | Mask-and-describe edits, and splitting an image into editable layers | Nano Banana Pro Inpaint | [shot](screenshots/tools/layers_model_nano_banana_pro_inpaint.jpg) |
| Image upscale | `/upscale` | Image | Upscales images or videos | Topaz, Topaz Generative, ByteDance Upscale (help) | [shot](screenshots/tools/upscale.jpg) |
| Face swap | `/apps/face-swap` | Image | Puts a source face onto a photo or video | Not stated ("Face Swap 2") | [shot](screenshots/tools/apps_face_swap.jpg) |
| Character swap | `/apps/character-swap` | Image | Replaces a whole character in a target image | Not stated ("Character Swap 2.0") | [shot](screenshots/tools/apps_character_swap.jpg) |
| Soul 2.0 and Soul Cinema | `/ai/image?model=soul-cinematic` (+2) | Image | Higgsfield's own image models | Soul 2.0, Soul Cinema | [shot](screenshots/tools/ai_image_model_soul_cinematic.jpg) |
| Partner image models | `/ai/image?model=…` (10 routes) | Image | Shortcuts that open Create image with a third-party model picked | 10 models, see table | [shot](screenshots/tools/ai_image_model_nano_banana_pro.jpg) |
| Fashion Factory | `/fashion-factory` | Studio | Template photoshoots that pair a product with a consistent character | Higgsfield Soul | [shot](screenshots/tools/fashion_factory.jpg) |
| Create video | `/ai/video` | Video | Prompt bar for every video model, plus DoP camera presets | DoP and every video model | [shot](screenshots/tools/ai_video.jpg) |
| Cinema Studio | `/generate?mode=video` (+2) | Video | Film-style studio with projects, elements and a director's panel | Seedance 2.5 under v4.0; all models | [shot](screenshots/tools/generate_mode_video.jpg) |
| Faceless Studio | `/faceless-studio` | Video | Animated faceless YouTube episodes from a one-line channel idea | Not stated | [shot](screenshots/tools/faceless_studio.jpg) |
| 3D Jutsu | `/3d-jutsu` | Video | An agent builds an editable 3D blocking scene, then it renders to video | Agent LLM (Auto) and Seedance 2.5 | [shot](screenshots/tools/3d_jutsu.jpg) |
| Shorts Studio | `/shorts-studio` | Video | Styles uploaded footage into a vertical short with a preset | Not stated | [shot](screenshots/tools/shorts_studio.jpg) |
| Explainer | `/explainer` | Video | Turns a topic, file or URL into a narrated explainer up to 10 minutes | Not stated | [shot](screenshots/tools/explainer.jpg) |
| Mixed Media | `/mixed-media` | Video | Applies a mixed media template to a 1 to 10 second clip | Not stated | [shot](screenshots/tools/mixed_media.jpg) |
| Edit video | `/ai/video/edit` (+1) | Video | Edits scenes, shots and elements of an existing clip | Kling 3.0 Omni Edit, Seedance 2.5 Edit | [shot](screenshots/tools/ai_video_edit.jpg) |
| Video upscale | `/ai/video/edit?tool=upscale` (+1) | Video | Upscales a clip, up to 8K | ByteDance Upscale, Topaz Video, FLUX.3 Upscale | [shot](screenshots/tools/ai_video_edit_tool_upscale.jpg) |
| Reframe | `/ai/video/reframe` | Video | Changes a finished video's aspect ratio | Not stated | [shot](screenshots/tools/ai_video_reframe.jpg) |
| Click to Ad | `/apps/link-to-video-ad` | Video | Turns a product URL into a video ad, inside Marketing Studio | Not stated | [shot](screenshots/tools/apps_link_to_video_ad.jpg) |
| Change color palette and video relight | `/apps/video-rehex` | Video | Regrades or relights an existing clip | Not stated | [shot](screenshots/tools/apps_video_rehex.jpg) |
| Genjutsu | `/ai/video?model=genjutsu` (+1) | Video | Motion transfer or object swap on a source clip | Higgsfield Genjutsu | [shot](screenshots/tools/higgsfield_genjutsu_presets.jpg) |
| Kling Motion Control | `/ai/video/motion` | Video | Drives a character image with a motion reference video | Kling 3.0 Motion Control | [shot](screenshots/tools/ai_video_motion.jpg) |
| Partner video models | `/ai/video?model=…` (9 routes) | Video | Shortcuts that open Create video with a model picked | 9 models, see table | [shot](screenshots/tools/ai_video_model_kling3_0.jpg) |
| Lipsync Studio | `/lipsync-studio` | Studio | Talking clips from an image or video plus speech | Wan 2.5, Kling, Veo 3.1, Speak 2.0, Infinite Talk, Sync | [shot](screenshots/tools/lipsync_studio.jpg) |
| Visual effects | `/effects` (+2) | Studio | One-click effect presets that turn a photo into an effect video | Not stated | [shot](screenshots/tools/effects.jpg) |
| Preset galleries | `/camera-controls` (+3) | Studio | Galleries of camera, UGC, commercial and viral motion presets | Higgsfield DoP | [shot](screenshots/tools/camera_controls.jpg) |
| Text to speech | `/audio?voiceMode=voiceover` (+1) | Audio | Script to speech with a preset or cloned voice | 7 audio models | [shot](screenshots/tools/audio_voiceMode_voiceover_audioModel_elevenlabs.jpg) |
| Voice change | `/audio?voiceMode=change-voice` | Audio | Swaps the voice in an existing video | Not stated | [shot](screenshots/tools/audio_voiceMode_change_voice.jpg) |
| Translate | `/audio?voiceMode=translate` | Audio | Translates and lip-syncs a video into another language | Not stated | [shot](screenshots/tools/audio_voiceMode_translate.jpg) |
| Audio models | `/audio?voiceMode=voiceover&audioModel=…` (7 routes) | Audio | Shortcuts that open Text to speech with a voice model picked | 7 models, see table | [shot](screenshots/tools/audio_voiceMode_voiceover_audioModel_elevenlabs.jpg) |
| Marketing Studio | `/marketing-studio` | Studio | 1,500+ ad templates filled from a product image or URL | Not stated | [shot](screenshots/tools/marketing_studio.jpg) |
| Ads Studio and Ad Multiplier | `/ads-studio` | Studio | Brand kit to batches of static ads; variations of a reference video ad | Not stated | [shot](screenshots/tools/ads_studio.jpg) |
| Higgsfield Apps | `/apps` | Studio | Catalog of one-click effect apps | Not stated | [shot](screenshots/tools/apps.jpg) |
| Supercomputer | `/supercomputer` (+2) | Agent | Chat agent that plans and runs multi-step jobs, apps and games | LLM picker plus every generation model | [shot](screenshots/tools/supercomputer.jpg) |
| Katana | `/katana` | Agent | Recreates a reference edit with your assets, inside Claude | Higgsfield models through MCP | [shot](screenshots/tools/katana.jpg) |
| AI Motion Designer | `/ai-motion-designer` | Agent | Chat-driven, editable After Effects motion design | GPT-6 Astra (page) | [shot](screenshots/tools/ai_motion_designer.jpg) |
| MCP, ChatGPT plugin and CLI | `/mcp` (+2) | Agent | Connects outside agents to a Higgsfield account through OAuth | 30+ models | [shot](screenshots/tools/mcp.jpg) |
| MCP skills | `/mcp/…` (41 routes) | Agent | Preset agent workflows and three bundles | Varies | [shot](screenshots/tools/mcp_ugc_flow.jpg) |
| Home | `/` | Platform | Explore feed of launches and tools | Many | [shot](screenshots/tools/home.jpg) |
| Creative app plugins | `/plugins/after-effects` | Platform | Panels for Adobe apps, DaVinci Resolve, Figma and Blender | Nano Banana 2, Seedance 2.0 defaults (help) | [shot](screenshots/tools/plugins_after_effects.jpg) |
| Higgsfield API | `/higgsfield-api` | Platform | Pay-per-use developer API with 50+ models | 50+ | [shot](screenshots/tools/higgsfield_api.jpg) |
| Pricing | `/pricing` | Platform | Plans, credits and unlimited windows | n/a | [shot](screenshots/tools/pricing.jpg) |
| Team plan | `/team-plan` | Platform | Shared workspace with pooled credits | n/a | [shot](screenshots/tools/team_plan.jpg) |
| Enterprise | `/enterprise` | Platform | Sales page for the enterprise workspace | n/a | [shot](screenshots/tools/enterprise.jpg) |
| Academy | `/academy` | Platform | Courses and a copyable prompt bank | n/a | [shot](screenshots/tools/academy.jpg) |
| Community | `/community` | Platform | Projects, shots, creators and grants | n/a | [shot](screenshots/tools/community.jpg) |
| Contests and Global Film Festival | `/contests` (+1) | Platform | Prize contests and a $1M film festival | n/a | [shot](screenshots/tools/contests.jpg) |
| Original Series | `/original-series` | Platform | Streaming page for AI series | Seedance 2.5 (promo) | [shot](screenshots/tools/original_series.jpg) |
| Earn | `/earn` | Platform | Pay-per-view creator campaigns | n/a | [shot](screenshots/tools/earn.jpg) |
| Creator Partnership Program | `/creator-partnership-program` | Platform | Application for sponsored creators | n/a | [shot](screenshots/tools/creator_partnership_program.jpg) |
| Draft landing pages | `/sandbox` (+1) | Platform | Unfinished CMS test pages that are live but not linked | Kling 3.0 Omni Edit, Nano Banana Pro | [shot](screenshots/tools/sandbox.jpg) |

**Not captured.** Three pages failed with status -1. `/ai/image?model=gpt_image_2` hit a bot check. `/generate?mode=image&imageModel=cinematic-v1` loaded only the Cinema Studio shell. `/canvas` returned -1 but still rendered its signed-out landing. Many pages rendered only the nav bar or a loading spinner, with no tool UI:
- Image: `/ai/image`, `/ai/image?model=soul-v2`, `?model=gpt-image-2-5-sunburst`, `?model=flux-3-image` and `/photodump-studio`
- Video: `/ai/video` and all nine `/ai/video?model=…` pages, plus `/ai/video/edit` with its upscale and Kling Omni Edit variants, `/ai/video/reframe`, `/ai/video/motion`, `/explainer`, `/apps/video-rehex` and `/effects/use`
- Audio: every audio route except Eleven v3

For these, the help center, blog and changelog fill in the details.

### Image: Create image

![Create image (bot check page)](screenshots/tools/ai_image_model_gpt_image_2.jpg)
![Create image, base route](screenshots/tools/ai_image.jpg)

- **What it does:** This is Higgsfield's general image generator. A prompt bar sits at the bottom of a results feed, and the chips on the bar change with the model you pick. Both captures failed: the first is a bot check and the second is a blank frame. The bar itself is visible on the model pages, for example [Nano Banana Pro](screenshots/tools/ai_image_model_nano_banana_pro.jpg).
- **How it works and how to use it** (help center, "first generation"):
  1. Open Image, then Create Image. It opens with GPT Image 2 picked.
  2. Type into "Describe the scene you imagine".
  3. Optionally attach references with the plus button, or pull a saved Element with the @ button.
  4. Switch the model from the picker, then set aspect ratio, resolution, quality and batch size.
  5. Press Generate. The cost in credits is printed on the button.
  6. Results appear in the feed above the bar and in Assets.
- **Inputs, settings and limits:**
  - The captured text of the failed page shows chips for Auto (ratio), High (quality), 2K, a 1/4 batch counter and a Generate button showing 8.5 then 6.5 credits, apparently a discount.
  - A View toggle switches the feed layout.
  - Promo banners sit above the bar: "Build your next hype machine" for AI Influencer, and an Academy nudge.
- **Models:** GPT Image 2 is the default. The picker holds every image model in the menu, plus others named in help and changelog: Soul, Popcorn, Nano Banana, Nano Banana 2 and 2 Lite, Ideogram 4.5 and Kontext.
- **Route(s):** `/ai/image?model=gpt_image_2` (failed), `/ai/image` (blank)
- **Notes for ComfyField:** Our Create page already has the composer and model picker. To match, it needs a batch counter, per-model chips (quality, resolution) and an @ picker for Library items.

### Image: Cinematic cameras

![Cinematic cameras (Cinema Studio shell)](screenshots/tools/generate_mode_image_imageModel_cinematic_v1.jpg)

- **What it does:** This menu item opens Cinema Studio in image mode. You compose a still the way a cinematographer would, by choosing a camera body, a lens and a focal length, instead of describing the look in words. According to the "How we built Cinema Studio" blog, the camera settings are saved with the image, so they carry over when the image is used as the start frame of a video.
- **How it works and how to use it** (blog and help):
  1. From Image, choose Cinematic Cameras. Cinema Studio opens, with the sidebar showing Home, My generations, My elements, My favorites, Community and Projects.
  2. Start a new project or use Home.
  3. In the switcher, roll the wheel to pick a camera, then a matching lens, focal length and aperture.
  4. Prompt, then generate.
  5. Send the still to video. The camera look travels with it.
- **Inputs, settings and limits:**
  - The shell loaded but the bar was still a skeleton, so no live controls were captured.
  - Per the blog, version 1 shipped with camera, lens and focal length, and version 1.5 added aperture and recommended presets.
  - Cinema Studio 4.0 offers four camera types (Modern, DV Camcorder, 35mm Film, 8mm Film) and five optically modeled lenses.
- **Models:** "cinematic-v1" appears only in the URL. The model is not stated on the page.
- **Route(s):** `/generate?mode=image&imageModel=cinematic-v1` (failed, shell only)
- **Notes for ComfyField:** We have a "Cinema shot" format. A camera, lens and focal-length picker that compiles into prompt text and stays attached to the asset would cover this.

### Image: Canvas

![Canvas](screenshots/tools/canvas.jpg)

- **What it does:** Canvas is an infinite node board. Prompts, references and generation nodes connect into one pipeline (prompt, then image, then video, then edit). You can run models in parallel, save a board as a template and edit it live with a team. It is listed in both the Image and Video menus.
- **How it works and how to use it** (help: "How to use Canvas"):
  1. Open Canvas, then New canvas. The signed-out landing shows All Canvases, Templates ("Quick Start") and a sign-in prompt.
  2. Click the board and add a Text Prompt node.
  3. Connect it to a generation node and choose the model.
  4. Drag that node's output into the input of the next node.
  5. Add reference nodes: uploaded images or audio, or a past generation from Assets.
  6. Press Generate on a single node, or trigger the chain in sequence.
  7. Save the board as a template. Invite collaborators from Share in the canvas settings.
- **Inputs, settings and limits:**
  - Building and wiring nodes is free. Credits are spent only when a node generates.
  - Unlimited plan access does not apply inside Canvas.
  - The board autosaves periodically, and a hard refresh restores the last autosave.
  - Seedance nodes need the reference's role stated at the start of the prompt.
  - Kling nodes treat a connected image as a start frame. To use a Kling character reference, create an Element and tag it in the prompt (for example @element-name).
  - Audio nodes can feed video nodes for voice reference or lip sync.
  - The Figma and FigJam plugin also offers Canvas Nodes.
- **Models:** every Higgsfield model is available as a node.
- **Route(s):** `/canvas` (status -1, but the landing rendered)
- **Notes for ComfyField:** Flows is our equivalent, with prompt, image, model and approve nodes. The gaps are a template gallery, audio reference nodes and shared editing.

### Image: Soul moodboard

![Soul moodboard](screenshots/tools/moodboard.jpg)
![Soul moodboard, curated grid](screenshots/tools/moodboard_2.jpg)

- **What it does:** Turns your own reference images into a reusable style that Soul 2.0 applies across generations. The page also shows a grid of curated moodboards, each with a Generate button.
- **How it works and how to use it** (page and help: "How to use Soul"):
  1. Open Soul Moodboard and press "Build your moodboard".
  2. Upload images from your device or from Assets.
  3. Save the moodboard. Alternatively, press Generate on a curated card.
  4. In Soul 2.0, open the moodboard icon in the bar, pick the moodboard and generate.
- **Inputs, settings and limits:**
  - Help advises 20 or more images in one coherent look, without faces, and no blurry or mixed styles.
  - There are 32 curated moodboards, among them Warm ambient, Y2K studio, Swag era, Theatrical light, Flash editorial, Old smartphone, Retro BW, Surreal solarization, Frutiger aero, 80s horror, Disposable camera, BW film and Muted cool film.
  - Moodboards work only in Soul 2.0, not in Soul or Soul Cinema.
- **Models:** Soul 2.0.
- **Route(s):** `/moodboard`
- **Notes for ComfyField:** We have a "Match a moodboard" format. To match this we would need saved moodboards as a Library type, applied through an IP-Adapter or style LoRA workflow on ComfyUI.

### Image: Soul ID character

![Soul ID character](screenshots/tools/character.jpg)

- **What it does:** Trains a reusable identity, so the same face appears in every Soul generation whatever the style, pose or light. The page reads "Make your own character" and has a single Create character button.
- **How it works and how to use it** (help: "Soul ID"):
  1. Go to Soul, then Train new character.
  2. Upload 20 or more photos of one person (up to 80).
  3. Start training. It takes a few minutes; one blog says 3 to 5.
  4. Name the character.
  5. When generating, select the character in the Character tab.
- **Inputs, settings and limits:**
  - Photo guidance: varied angles and expressions, good light, recent photos, at least one full-height shot, one person per photo, and nothing covering the face (sunglasses, hats).
  - A Soul ID holds one person and cannot be exported.
  - It shows up automatically as an Element, so Seedance can use it with @.
  - Marketing Studio uses Soul ID to keep a spokesperson consistent across ad variants.
  - Help asks for consent before uploading anyone else's likeness.
- **Models:** Soul, Soul 2.0 and Soul Cinema, plus Seedance through Elements.
- **Route(s):** `/character`
- **Notes for ComfyField:** The Library already has a Characters type, but it works from reference images. A trained identity would need a LoRA training workflow on ComfyUI with open weights (for example a FLUX LoRA).

### Image: AI Influencer

![AI Influencer](screenshots/tools/ai_influencer_studio.jpg)

- **What it does:** A game-style character creator that uses menus instead of prompts, with video in the same studio. The left panel has two tabs, Create Influencer and Motion. The right side has Explore and History, and feeds of AI Influencers, Higgsfield Presets and Community Trends, each card with a Recreate button.
- **How it works and how to use it** (page, blog "New AI Influencer", help):
  1. Open AI Influencer from the top bar.
  2. Optionally use "Upload your photo" so the character keeps your face.
  3. Pick options in each attribute group, or press the shuffle button to randomize every field.
  4. Press Generate. Each generation returns a close-up portrait and a full-body shot.
  5. From the result you can Recreate, use "Turn to motion with Genjutsu", Download, or save it with Create element.
  6. In the Motion tab, run Genjutsu Motion transfer or Objects swap at 480p, 720p or 1080p.
- **Inputs, settings and limits:**
  - The page shows 19 groups, with the number of options in each:

    | Group | Options | Group | Options |
    |---|---|---|---|
    | Character type | 9 | Proportions | 5 |
    | Gender | 5 | Head shape | 10 |
    | Build | 7 | Neck | 4 |
    | Hairstyle | 26 | Eye shape | 11 |
    | Hair color | 13 | Eye color | 8 |
    | Style | 8 | Features | 25 |
    | Ethnicity | 6 | Facial hair | 8 |
    | Age | 3 | Distinctive features | 14 |
    | Skin color | 8 | Accessories | 6 |
    | Height | 3 | | |

  - The Character type tiles are Average, Bold, Extreme, Insect, Frog, Cat, Dog, Rodent and Bird.
  - The blog prices a generation at 1.12 credits.
  - The changelog gives every user 5 free generations. Plans include 10 (Starter) or 30 (Plus and Ultra).
  - Finished characters also appear in Cinema Studio, in an AI Influencer tab.
- **Models:** not stated. Motion runs on Genjutsu.
- **Route(s):** `/ai-influencer-studio`
- **Notes for ComfyField:** This maps cleanly onto a format whose choice inputs compile into a prompt. We already have "AI influencer post" and "AI influencer video" formats.

### Image: Photodump

![Photodump preset modal](screenshots/tools/ai_image_model_soul_v2_modal_photo_dump_true.jpg)
![Photodump Studio route (blank)](screenshots/tools/photodump_studio.jpg)

- **What it does:** Generates a set of photos of one character across many scenes in one click, under the tagline "Different scenes. Same star." It opens as a modal over Soul 2.0.
- **How it works and how to use it** (modal and blog):
  1. Open Image, then Photodump.
  2. Step 1, Select preset: pick a preset card. Each card previews four scenes.
  3. Step 2, Create character: create a Soul ID, or pick an existing one.
  4. Step 3, Check image: review it.
  5. Press "Use this preset". The button carries a FREE badge.
  6. Sets are saved to your Soul page and to Assets.
- **Inputs, settings and limits:**
  - There are 9 presets: Sleepy Head, Zen, Candid Glow, Office dresscode, Surreal Self, Surreal Self II, Alter ego, Cool Girl Dump and Male Archive.
  - The bar behind the modal shows Soul 2.0, Color Transfer, 3:4, 2k, a wand toggle set to Off, 1/4 and Character, with Generate at 0.125 credits.
  - Blogs give different set sizes: 15 photos for Soul 2.0 (Feb 2026), and 26 shots for the older Photodump Studio, which needed 25 training photos (Sep 2025).
- **Models:** Soul 2.0 with Soul ID.
- **Route(s):** `/ai/image?model=soul-v2&modal-photo-dump=true`, `/photodump-studio` (redirects to the modal; captured blank)
- **Notes for ComfyField:** Could be a format that takes one character plus a pack of N scene prompts and runs them as a batch. Flows could also fan one character out to N prompts.

### Image: Relight

![Relight](screenshots/tools/apps_relight.jpg)

- **What it does:** Changes the lighting position, color temperature and brightness of a photo. A Relight panel sits on the right of the canvas. The blog says it uses depth mapping to place light in 3D.
- **How it works and how to use it** (page):
  1. Open Apps, then Relight, and press Upload media.
  2. Pick a direction under Quick select, or hold and drag on the pad to aim the light.
  3. Set Light settings: Soft or Hard, then Brightness and Color.
  4. Press Generate (2 credits).
- **Inputs, settings and limits:**
  - Quick select offers Top, Front, Right, Left, Back and Bottom.
  - Brightness defaults to 50% and color to #FFFFFF.
  - Below the tool, the page lists more apps: Virality Predictor, Expand image, Angles 2.0, Shots, Transitions, Color grading, What's Next, Behind the Scenes, Zooms and Skin Enhancer.
- **Models:** not stated.
- **Route(s):** `/apps/relight`
- **Notes for ComfyField:** Our Relight format offers five lighting presets. Adding direction, hardness, brightness and color as format inputs would match this.

### Image: Inpaint and Layers

![Higgsfield Layers via Inpaint](screenshots/tools/layers_model_nano_banana_pro_inpaint.jpg)

- **What it does:** Higgsfield Layers separates a flat image into editable layers that you can edit and rebuild. The hero carousel shows its modes: Relight, Inpaint, Layer decomposition, Edit text and Effects. The Inpaint menu item opens Layers with Nano Banana Pro Inpaint selected: you brush over a region and describe the change.
- **How it works and how to use it** (page and blog "Nano Banana Pro Inpaint"):
  1. Open Image, then Inpaint, and press Upload Media.
  2. To edit a region, brush a mask over it and describe the change: remove, replace, restyle, rewrite text, fix a face or change a material.
  3. For layers, decompose the image, then edit each element and rebuild.
  4. Every project is saved under My projects.
- **Inputs, settings and limits:**
  - Areas you do not mask are kept as they are.
  - Marketing Studio's Posters category edits its results through Layers.
  - The Photoshop plugin offers the same Layer Decompose.
- **Models:** Nano Banana Pro Inpaint.
- **Route(s):** `/layers?model=nano_banana_pro_inpaint`, `/layers` ([shot](screenshots/tools/layers.jpg)), `/edit?model=nano_banana_pro_inpaint` (redirects to Layers, [shot](screenshots/tools/edit_model_nano_banana_pro_inpaint.jpg))
- **Notes for ComfyField:** We have "Paint to change", "Erase an object" and "Split into layers" formats. What's missing is a mask brush canvas and a layered project view.

### Image: Image upscale

![Image upscale](screenshots/tools/upscale.jpg)

- **What it does:** Raises the resolution and quality of uploaded images or videos. The page is a drop zone with a before/after slider.
- **How it works and how to use it** (page and help: "video upscale stuck"):
  1. Open Upscale, or open any item in Assets and choose Upscale.
  2. Press Upload Media.
  3. Choose a model.
  4. Set the Scale factor. More options are under Advanced settings.
  5. Press Upscale. The cost updates on the button.
- **Inputs, settings and limits:**
  - Image models: Topaz is the default. ByteDance Upscale goes up to 4K. Topaz Generative is diffusion-based and invents detail.
  - Video models: ByteDance Upscale goes up to 8K. Topaz Video is diffusion-based.
  - Help recommends MP4 with H.264.
  - A video upscale takes 1 to 5 minutes. If a job sticks, cancel it from its Assets tile. Credits for failed jobs are refunded.
- **Models:** Topaz, Topaz Generative, Topaz Video and ByteDance Upscale (help). The page does not name them.
- **Route(s):** `/upscale`
- **Notes for ComfyField:** Our Upscale format (2x or 4x) and Video upscale format cover the basics. A "faithful or creative" choice mirrors Higgsfield's two model types.

### Image: Face swap

![Face swap](screenshots/tools/apps_face_swap.jpg)
![Face swap, lower page](screenshots/tools/apps_face_swap_2.jpg)

- **What it does:** Puts a source face onto a target photo or video. The breadcrumb is Apps / Face Swap.
- **How it works and how to use it** (page):
  1. Choose the Generation type: image or video.
  2. Upload the target, the photo or video to change.
  3. Upload a clear photo of the source face.
  4. Press Face Swap (2 credits).
- **Inputs, settings and limits:**
  - The meta description advertises 5 free swaps a day.
  - The FAQ covers multiple faces, commercial use and deepfakes, but the answers were not captured.
  - The marketing copy claims frame-by-frame tracking for video.
- **Models:** not stated.
- **Route(s):** `/apps/face-swap`
- **Notes for ComfyField:** Covered by our Face swap and Video face swap formats.

### Image: Character swap

![Character swap](screenshots/tools/apps_character_swap.jpg)
![Character swap, lower page](screenshots/tools/apps_character_swap_2.jpg)

- **What it does:** Replaces a whole character in a target image with the character from your photo, adapting to the scene's light and perspective. The breadcrumb reads Character Swap 2.0.
- **How it works and how to use it** (page):
  1. Your Photo: upload the character to insert.
  2. Target Image: upload the photo with the character to replace.
  3. Press Character Swap (2 credits).
- **Inputs, settings and limits:**
  - The page has a pricing block and a FAQ.
  - For video, the Apps catalog offers Recast and Video Face Swap instead.
- **Models:** not stated. The footer lists many models, but none is tied to this tool.
- **Route(s):** `/apps/character-swap`
- **Notes for ComfyField:** Covered by our Character swap format.

### Image: Soul 2.0 and Soul Cinema

![Soul Cinema in Create image](screenshots/tools/ai_image_model_soul_cinematic.jpg)
![Soul Cinema landing](screenshots/tools/soul_cinema.jpg)

- **What it does:** These are Higgsfield's own image models.
  - Soul 2.0 aims at fashion-aware, culture-native looks. It supports presets, moodboards, Soul HEX color transfer, Soul ID and reference images.
  - Soul Cinema has a cinematic, film-grain look built in, with no presets or moodboards. It keeps Soul HEX and Soul ID, and its landing page says it knows how different decades look.
- **How it works and how to use it** (help: "Soul", "Soul Cinema"):
  1. Open Image, then Soul 2.0 or Soul Cinema.
  2. Write a prompt. If you attach a reference image instead, the prompt field locks.
  3. Optionally press Color Transfer and upload a palette image or pick a built-in palette.
  4. Optionally pick a Soul ID under Character.
  5. Set ratio, quality and batch, then press Generate.
- **Inputs, settings and limits:**
  - Ratios: 9:16, 3:4, 2:3, 1:1, 4:3, 16:9 and 3:2. Quality: 1.5k or 2k. Batch: 1 to 4.
  - Built-in palettes: Film colors, Lime Jam, Candy pink, Nostalgic blue, Soft palette and Black gloss.
  - The Soul Cinema bar shows Camera, Color Transfer, 16:9, 2k, a wand toggle set to On (probably prompt enhancement), 1/4 and Character, with Generate at 0.125 credits.
  - The original Soul groups presets into General, TikTok Core, Instagram Aesthetics, Beauty, Mood, Camera Photo and Graphic Art.
  - The Plus plan advertises 5,000 free Soul 2.0 generations.
- **Models:** Soul 2.0 and Soul Cinema. The original Soul is still listed in help.
- **Route(s):** `/ai/image?model=soul-v2` (blank, [shot](screenshots/tools/ai_image_model_soul_v2.jpg)), `/ai/image?model=soul-cinematic`, `/soul-cinema` (landing)
- **Notes for ComfyField:** There is no in-house model to copy. The closest open path is an open-weights checkpoint with style LoRA presets. Soul HEX maps to our "Brand colors" format.

### Image: Partner image models

![Nano Banana Pro bar](screenshots/tools/ai_image_model_nano_banana_pro.jpg)
![Recraft V4.1 bar](screenshots/tools/ai_image_model_recraft_v4_1.jpg)
![GPT Image 2.5 Flare bar](screenshots/tools/ai_image_model_gpt_image_2_5_flare.jpg)

- **What it does:** Ten menu shortcuts that open Create image with a third-party model already picked. The chips on the bar change per model.
- **How it works and how to use it:** the same steps as Create image. Choose the model from the Image menu, prompt, set the chips and generate.
- **Inputs, settings and limits** ("menu" is the menu line; "bar seen" is the captured chips):

  | Model | Vendor | Menu says | Route | Bar seen and specs |
  |---|---|---|---|---|
  | GPT Image 2.5 Sunburst | OpenAI | Exceptional quality, precise edits | `/ai/image?model=gpt-image-2-5-sunburst` ([shot](screenshots/tools/ai_image_model_gpt_image_2_5_sunburst.jpg)) | Page blank. Blog: up to 16 refs, quality Low to Max, 1K/2K/4K, slower than Flare |
  | GPT Image 2.5 Flare | OpenAI | Stunning everyday images, fast | `/ai/image?model=gpt-image-2-5-flare` ([shot](screenshots/tools/ai_image_model_gpt_image_2_5_flare.jpg)) | Auto ratio, High, 2K, a second unlabeled Auto chip, 1/4. Blog: about 50% less latency than GPT Image 2 |
  | Nano Banana 2.1 | Google | Google's next-gen flagship image model | `/ai/image?model=nano-banana-2-1` ([shot](screenshots/tools/ai_image_model_nano_banana_2_1.jpg)) | 3:4, 1K, Medium, 1/4, 1.5 credits. Changelog: 14 refs, 4 characters plus 10 objects, 1K/2K/4K, 1:4 to 8:1 wide formats |
  | Seedream 5.0 Pro | ByteDance | Logically consistent images with visual reasoning | `/ai/image?model=seedream_v5_pro` ([shot](screenshots/tools/ai_image_model_seedream_v5_pro.jpg)) | 2K, Auto ratio, 1/4 |
  | Nano Banana Pro | Google | Best 4K image model | `/ai/image?model=nano-banana-pro` ([shot](screenshots/tools/ai_image_model_nano_banana_pro.jpg)) | 3:4, 1K, 1/4, Draw, 2 credits. Help: text-to-image, multi-reference and image-to-image modes, 14 refs, native 4K |
  | FLUX 3 Image | Black Forest Labs | Next-gen image generation and editing | `/ai/image?model=flux-3-image` ([shot](screenshots/tools/ai_image_model_flux_3_image.jpg)) | Page blank. Changelog: text-to-image and image-to-image, photo/illustration/poster/collage/editorial styles, 768p to 4K |
  | Recraft V4.1 | Recraft | Photorealistic and expressive image generation | `/ai/image?model=recraft-v4-1` ([shot](screenshots/tools/ai_image_model_recraft_v4_1.jpg)) | Vector mode toggle, Standard, 1:1, 1/4, Color transfer, 1.25 credits |
  | Grok Imagine 2.0 | xAI | High-resolution image generation | `/ai/image?model=grok-image-2-0` ([shot](screenshots/tools/ai_image_model_grok_image_2_0.jpg)) | Medium, 1K, Auto, 1/4, 2 credits |
  | FLUX.2 | Black Forest Labs | Speed-optimized detail | `/ai/image?model=flux_2` ([shot](screenshots/tools/ai_image_model_flux_2.jpg)) | The bar shows FLUX.2 Pro, 3:4, 1K, 1/4 |
  | Z-Image | Alibaba (Tongyi) | Instant lifelike portraits | `/ai/image?model=z-image` ([shot](screenshots/tools/ai_image_model_z_image.jpg)) | 3:4, 1/4, 0.15 credits |

  - Batch is always 1 to 4.
  - Models with references show the plus and @ buttons. Z-Image and Grok show only the plus button.
- **Models:** as in the table. The picker also holds models that are not in the menu: Ideogram 4.5, Nano Banana, Nano Banana 2 and 2 Lite, Seedream 4.5, Kontext, Popcorn and Soul.
- **Route(s):** the 10 routes in the table
- **Notes for ComfyField:** Our catalog has Nano Banana Pro and 2, GPT Image 2 and Flux 2 Pro, and the rest are reachable through fal search. Z-Image, Qwen Image and FLUX.2 dev are open weights we can run on ComfyUI.

### Image: Fashion Factory

![Fashion Factory modal](screenshots/tools/fashion_factory.jpg)

- **What it does:** Creates branded photoshoots by combining your product with a consistent character, starting from a template. It opens as a modal over Higgsfield Soul (the route redirects to `/ai/image?model=soul&modal-fashion-factory=true`). It sits under Studios in the footer, not in the Image menu.
- **How it works and how to use it** (page):
  1. Open Fashion Factory and press Select template.
  2. Upload the product image as the prompt, or describe the scene.
  3. Pick a Character.
  4. Press Generate (2 credits).
- **Inputs, settings and limits:** the bar behind the modal shows Higgsfield Soul, 3:4, 2k, On and a batch of 4/4.
- **Models:** Higgsfield Soul.
- **Route(s):** `/fashion-factory`
- **Notes for ComfyField:** Our "Product shot", "Place a product" and "Try on outfits" formats, combined with Library characters, cover this.

### Video: Create video

![Create video (blank frame)](screenshots/tools/ai_video.jpg)

- **What it does:** Higgsfield's general video generator. It uses the same prompt-bar layout as Create image, with a model picker and per-model chips. It is also where Higgsfield's own image-to-video model, DoP, applies camera and effect presets. The capture shows only a loading spinner.
- **How it works and how to use it** (help: "first generation", "DoP", "Seedance"):
  1. Open Video, then Create Video, and pick a model.
  2. For DoP, the model shows as Higgsfield Standard. Add a keyframe image: upload a PNG or JPG, paste one, or generate it in place. Then pick a preset.
  3. Write the prompt. The Enhance toggle expands it for you.
  4. Set duration, aspect ratio, resolution and other chips. Seedance shows duration, ratio (including Auto), resolution up to 4K, bitrate and a sound toggle.
  5. To keep a character consistent, add saved Elements through @ Elements, or by typing @ in the prompt.
  6. Press Generate. The cost is on the button, and results go to Assets.
- **Inputs, settings and limits:**
  - DoP preset categories: Effects, Basic Camera Control, Epic Camera Control, Catch the Pulse, plus New and Trending feeds. Top Choice marks curated picks, and Mix combines presets.
  - DoP advanced settings: 3 or 5 second clips, seed and steps.
  - The motion sitemap lists 229 preset pages.
  - Seedance 2.5 accepts up to 50 references: 30 images, 10 videos and 10 audio clips.
- **Models:** DoP (Higgsfield Standard) and every model in the Video menu. Older families stay under "All models" in the picker: Seedance 1.5 and Pro, Kling 2.x, Sora 2, Hailuo 2.3 and Wan 2.x.
- **Route(s):** `/ai/video` (blank)
- **Notes for ComfyField:** Create already does text-to-video and image-to-video. It runs LTX on ComfyUI, Seedance 2.5, Kling 3, MiniMax H3 and Wan 3.0 through fal, and Veo 3.1 through Google. A larger preset library is the gap, since our "Camera moves" and "Effects" formats are small.

### Video: Cinema Studio

![Cinema Studio](screenshots/tools/generate_mode_video.jpg)
![Cinema Studio, /generate](screenshots/tools/generate.jpg)

- **What it does:** A filmmaking app with its own shell. Its sidebar has Home, My generations, My elements, My favorites, Community and Projects, with a New project button, under the headline "Bring your stories to life". It offers structured camera, optics, light and color control, reusable Elements (characters, locations, props), multi-shot scenes and native audio. Version 4.0 loads by default, and a selector switches back to versions 2.0 through 3.5.
- **How it works and how to use it** (help: "How to use Cinema Studio", blog "Cinema Studio 4.0"):
  1. Open Cinema Studio and start a new project.
  2. Open the Director's Panel. Under Film Setup, pick a genre, an era and a tempo.
  3. Under Camera, pick a camera type, lens, aperture and camera move.
  4. Pick a Color Palette, then Lighting: one of 6 presets, or custom color, brightness, diffusion and angle.
  5. Add references (images, videos, Soul Cast actors, saved Elements). Set the emotion wheel for character performance.
  6. Choose a mode. References makes a new clip. Forward or Backward Extend continues an uploaded clip in either direction. Edit Video makes a regional change.
  7. Press Generate. Sound effects, speech and music come out in the same pass.
- **Inputs, settings and limits:**
  - Clips run up to 30 seconds, with up to 50 references.
  - Genres: General, Action, Epic, Drama, Comedy, Horror, Noir.
  - Eras: Auto, 60s, 80s, 90s, 2000s, 2020s.
  - Tempo: Single Shot, Calm, Dynamic, Chaotic.
  - 30+ camera moves (POV, Robot Arm, Helicopter Shot, Pan Left and more), four camera types, five lenses and 50+ color palettes.
  - The emotion wheel has 8+ types, including anger, joy, fear and trust.
  - Video upload limits by version: none in 2.5, 15 seconds in 3.0 and 3.5, 30 seconds in 4.0.
  - Version 3.5 adds a Claude chat AI director, which fills prompts and settings but never generates on its own, plus project-scoped Elements and shared projects.
  - Version 3.0 has 9 references and speed ramps (Linear, Auto, Flash In/Out, Slow-mo, Bullet Time, Impact, Ramp Up).
  - Version 2.5 has up to 3 Soul Cast actors and a Colorgrade panel (temperature, contrast, saturation, sharpness, grain, highlights, exposure).
  - Real faces and protected IP are blocked with "May contain protected content".
- **Models:** Version 4.0 runs on Seedance 2.5, and help says the studio can reach all image and video models.
- **Route(s):** `/generate?mode=video`, `/generate`, `/gallery/all` (redirects to `/generate`, [shot](screenshots/tools/gallery_all.jpg))
- **Notes for ComfyField:** We have "Cinema shot", "Multi-shot scene", "First and last frame" and "Extend video" formats. We are missing a project-level look (genre, era, tempo applied to every shot) and project Elements.

### Video: Faceless Studio

![Faceless Studio](screenshots/tools/faceless_studio.jpg)
![Faceless Studio, examples](screenshots/tools/faceless_studio_2.jpg)

- **What it does:** Builds a faceless animated YouTube channel. A guided flow turns a one-line channel idea into finished episodes with script, narration, animation, music and subtitles. Channels remember their style, voice and characters.
- **How it works and how to use it** (page and blog "Faceless Studio"):
  1. Pick a category: Education, History, Kids or Storytelling.
  2. Describe the channel in "Channel about". Optionally add a Reference (a YouTube link) or Upload script, then press Next.
  3. Pick one of four generated episode topics, refresh them, or type your own.
  4. Set the episode: 16:9 or 9:16, 1 to 5 minutes, and Fully animated or Frame by Frame.
  5. Pick one of 12 styles.
  6. Pick a narrator from voice previews, then press Generate. The price is on the button.
  7. Later episodes reuse the channel's saved settings, found under My Channels.
- **Inputs, settings and limits:**
  - The 12 styles: Editorial Motion Graphics, Stickman Cartoon, Fairy Tale & Myth, Paper Diorama, Hand Drawn, Mannequin, Poster Vector, Colorful 3D, Watercolor Chronicle, Paper Collage, Studio 3D and Pastel Flat 2D.
  - The blog prices episodes at 246 credits per minute.
  - The page has a "Made by Higgsfield" gallery and an "Or create with Higgsfield MCP" link.
  - The Supercomputer version goes up to 15 minutes.
- **Models:** not stated.
- **Route(s):** `/faceless-studio`
- **Notes for ComfyField:** We have a "Faceless video" format. To match, it needs channel memory (style, voice), multi-minute assembly and burned-in subtitles.

### Video: 3D Jutsu

![3D Jutsu](screenshots/tools/3d_jutsu.jpg)

- **What it does:** A browser 3D workspace for blocking and previz. An agent running on Supercomputer turns a prompt into an editable scene of objects, lights, cameras and animation. The take then renders to video through Seedance 2.5.
- **How it works and how to use it** (page and blog "3D Jutsu"):
  1. Describe the scene in "Describe the scene you want to block out…". Attach references if you have them.
  2. Set the model (Auto, free), the duration (15s) and the ratio.
  3. Press Generate. A draft appears in a 3D viewport: drag to orbit, scroll to zoom, right-drag to pan.
  4. Refine by hand: move, rotate, scale and duplicate objects. Add primitives, sun, point or spot lights, cameras, GLB assets and Mixamo characters. Animate on the timeline.
  5. Or ask the agent in chat, for example to move the car closer.
  6. Export to MP4, a still or GLB, or render the take with Seedance 2.5.
- **Inputs, settings and limits:**
  - Durations run from 1 to 60 seconds of scene time.
  - Ratios: 16:9, 9:16, 1:1, 4:3, 3:4, 21:9.
  - Agent modes: generate without asking, ask before generating, and an ask-only mode.
  - Every session saves a revision that you can restore.
  - Share roles: admin, collaborator or viewer.
  - Scenes are kept under My Scenes.
  - The LLM picker includes GPT 6 Astra, Claude Fable 5.1, Claude Opus 5, GPT 5.6 Sol and GLM-5.3 Flash.
- **Models:** Seedance 2.5 for the final render. The blog example takes reference images from Soul 2.0 and Soul Cinema.
- **Route(s):** `/3d-jutsu`
- **Notes for ComfyField:** Our "3D scene" format makes assets, but we have no viewport editor. A three.js blocking view could export a reference render for a video model.

### Video: Shorts Studio

![Shorts Studio](screenshots/tools/shorts_studio.jpg)

- **What it does:** Turns footage you upload into a styled short with overlaid graphics and text. It edits existing footage; it is not text-to-video.
- **How it works and how to use it** (page and blog "YouTube Shorts"):
  1. Pick a preset with Change, or from the grid. You can also make one with "Create a preset from references".
  2. Upload a video up to 2 minutes.
  3. The language is auto-detected.
  4. Choose Vertical or Horizontal output.
  5. Press Generate and check the History tab.
- **Inputs, settings and limits:**
  - 40+ presets, including Bold Urban, Green Contrast, Urban Serenity, Warm Glow, Yellow Frame, Monochrome and Claymation.
  - Output is 720p.
  - The blog estimates about $4 per 25 second clip.
  - A "How calculations work?" link sits under Generate.
- **Models:** not stated.
- **Route(s):** `/shorts-studio`
- **Notes for ComfyField:** We have nothing direct. It would be a flow that captions, styles and reformats footage the user uploads.

### Video: Explainer

![Explainer (blank frame)](screenshots/tools/explainer.jpg)

- **What it does:** Turns a topic, a file or a URL into a structured, narrated explainer up to 10 minutes long. The capture rendered nothing, so the details below come from the blog and Supercomputer's preset cards.
- **How it works and how to use it** (blog "Explainer"):
  1. Pick a style preset from the library.
  2. Fill in "What should the video explain?". Type a topic, use Attach files, or use Link to paste a URL.
  3. Set the ratio (16:9 by default, with vertical and square options) and the duration (20 seconds, 30 seconds, or 1, 3, 5 or 10 minutes, or Manual).
  4. Pick a voice: 40+ presets, or a custom voice.
  5. Press Generate.
- **Inputs, settings and limits:**
  - 10+ style presets: Pixel Art, Claymotion, Mixed Media, 3D Papercraft and 2D Illustrator.
  - Supercomputer's version adds whiteboard doodle, low-poly 3D, polished 3D, isometric and plush.
- **Models:** not stated.
- **Route(s):** `/explainer` (blank)
- **Notes for ComfyField:** We have an "Explainer video" format. To match, it needs URL and file ingestion, plus long-form assembly with narration.

### Video: Mixed Media

![Mixed Media](screenshots/tools/mixed_media.jpg)

- **What it does:** Applies a mixed media template to a short clip. The look mixes illustration with live action at a low frame rate. The page title promises "40+ AI video effects".
- **How it works and how to use it** (page):
  1. Select a template under Browse Templates.
  2. Upload the video to edit. It must be 1 to 10 seconds.
  3. Set FPS and Resolution.
  4. Press Generate. The tabs are All Presets, How it works and Community.
- **Inputs, settings and limits:**
  - FPS defaults to 8 and Resolution to 1K.
  - The site has 33 preset pages under `/mixed-media-presets/`.
- **Models:** not stated.
- **Route(s):** `/mixed-media`
- **Notes for ComfyField:** Our "Restyle video" format comes closest. A template set with frame rate and resolution choices would match.

### Video: Edit video

![Edit video (blank frame)](screenshots/tools/ai_video_edit.jpg)
![Kling 3.0 Omni Edit (blank frame)](screenshots/tools/ai_video_edit_model_kling_video_reference_o3.jpg)

- **What it does:** The menu line reads "Edit scenes, shots, elements". It changes part of an existing clip instead of generating it again. Kling 3.0 Omni Edit (early access) edits with text prompts, style transfer and local changes, while keeping the character's identity.
- **How it works and how to use it** (page titles, help "Kling", blog "edit without regenerating"):
  1. Open Edit Video and upload or pick a clip.
  2. Pick the edit model.
  3. Describe the change. Or use Draw to Edit to mark the region on the frame, then describe what happens inside it.
  4. Press Generate and compare the result with the source.
- **Inputs, settings and limits:**
  - Kling 3.0 Omni Edit: 1080p, 3 to 10 seconds.
  - Seedance 2.5 Edit: 480p to 720p, matches the length of the source, can also change audio, and takes up to 50 references.
  - Kling O1 Video Edit: 3 to 10 seconds.
- **Models:** Kling 3.0 Omni Edit, Seedance 2.5 Edit and Kling O1 Video Edit.
- **Route(s):** `/ai/video/edit` (blank), `/ai/video/edit?model=kling-video-reference-o3` (blank)
- **Notes for ComfyField:** We have "Swap an element" and "Restyle video" formats. The gap is a draw-on-frame mask input.

### Video: Video upscale

![Video upscale (blank frame)](screenshots/tools/ai_video_edit_tool_upscale.jpg)
![FLUX.3 Upscale (blank frame)](screenshots/tools/ai_video_edit_tool_upscale_toolModel_flux_video_upscale.jpg)

- **What it does:** Upscales a video. FLUX.3 Upscale, per the menu, lets you either keep the original or creatively enhance detail.
- **How it works and how to use it** (help: "video upscale"):
  1. Open Video Upscale, or open a video in Assets and choose Upscale.
  2. Pick a model.
  3. Set the Scale factor. More options are under Advanced settings.
  4. Press Upscale. It takes 1 to 5 minutes, and you can cancel from the Assets tile.
- **Inputs, settings and limits:**
  - ByteDance Upscale goes up to 8K and keeps the frame as it is.
  - Topaz Video is diffusion-based and adds detail.
  - Use MP4 with H.264.
  - Sources that are very low quality may fail.
- **Models:** ByteDance Upscale, Topaz Video and FLUX.3 Upscale.
- **Route(s):** `/ai/video/edit?tool=upscale`, `/ai/video/edit?tool=upscale&toolModel=flux-video-upscale` (both blank)
- **Notes for ComfyField:** Our "Video upscale" format covers this. Open-weight video upscalers on ComfyUI would avoid per-second fees.

### Video: Reframe

![Reframe (blank frame)](screenshots/tools/ai_video_reframe.jpg)

- **What it does:** Changes the aspect ratio of a finished video, for example from landscape to vertical, while keeping the subject framed. The menu calls it Higgsfield Reframe.
- **How it works and how to use it** (help: "lipsync, voiceover and aspect ratios"; plugin page):
  1. Open Edit, then Reframe, and pick a video.
  2. Choose the target ratio.
  3. Generate. The plugin version tracks the subject so it stays centered.
- **Inputs, settings and limits:**
  - The plugin lists 9:16, 16:9, 4:3, 3:4, 21:9 and 1:1.
  - MCP exposes the same tool as "expand video (reframe)".
  - For still images, Expand outpaints to a new ratio.
- **Models:** not stated.
- **Route(s):** `/ai/video/reframe` (blank)
- **Notes for ComfyField:** "Expand" covers images only. A video outpaint or reframe format is missing.

### Video: Click to Ad

![Click to Ad in Marketing Studio](screenshots/tools/apps_link_to_video_ad.jpg)

- **What it does:** Turns a product page URL into a video ad. The route redirects into Marketing Studio (`/marketing-studio?tool=url-to-ad`).
- **How it works and how to use it** (blogs "100+ ad creatives", "ads from URL"):
  1. Paste the product URL. Click to Ad pulls in the product name, description, up to 8 photos, brand colors and logo.
  2. Review the extracted assets and swap anything that's wrong.
  3. Pick a template.
  4. Generate, then re-run variants.
- **Inputs, settings and limits:**
  - Template tabs: UGC, Product shot, Motion, Ads, Posters, Marketplace, TikTok. You can also filter by All, Images or Videos.
  - Visible templates include Ice Cube Hover, Brushed Tin, Green Tea Macro, Chilled Can, Linen Lid Lift, Golden Dew, Before and After (UGC video) and Monospace Callouts.
- **Models:** not stated.
- **Route(s):** `/apps/link-to-video-ad`
- **Notes for ComfyField:** Covered by our "Ads from a link" and "Product to ad" formats.

### Video: Change color palette and video relight

![Change color palette (blank frame)](screenshots/tools/apps_video_rehex.jpg)

- **What it does:** The menu calls this route Change Color Palette, but the page title is "AI Video Relighting". The blog describes two standalone tools for footage you already have: Video Relight changes light direction, color and intensity, and Color Palette regrades the clip. The composition and motion stay as they are.
- **How it works and how to use it** (blog "Video Relight and Color Palette"):
  1. Upload a clip.
  2. For relight, pick a preset or build a custom light. For palette, pick a grading preset or upload a reference image to match.
  3. Generate. You can run the clip through both tools in turn.
- **Inputs, settings and limits:**
  - Relight presets: Practicals, Silhouette, Contre-jour, Soft Cross, Window, Overhead Fall and Auto.
  - Up to two custom lights, each with color, brightness, diffusion and angle, or described in a prompt.
  - 50+ palette presets: Film Colors, Black Gloss, Candy Pink, Lime Jam, Nostalgic Blue, Soft Palette, Overtime and more.
  - Each tool costs 135 credits per 15 second clip.
- **Models:** not stated.
- **Route(s):** `/apps/video-rehex` (blank)
- **Notes for ComfyField:** Covered by our "Relight video" and "Color grade" formats.

### Video: Genjutsu

![Genjutsu presets page](screenshots/tools/higgsfield_genjutsu_presets.jpg)
![Genjutsu presets, lower page](screenshots/tools/higgsfield_genjutsu_presets_2.jpg)

- **What it does:** Rebuilds part of an existing clip without reshooting it. Motion Transfer keeps the movement, timing and camera of the clip and recasts it with new characters, locations or styles. Object Swap replaces one element and leaves everything else as filmed. It works on real footage or generated video, and it is a top-bar item marked Top.
- **How it works and how to use it** (blog "Genjutsu", changelog):
  1. Open Video, then Higgsfield Genjutsu, and choose Motion Transfer or Object Swap.
  2. Upload one source clip of 4 to 30 seconds.
  3. Add up to 30 reference images: characters, products, outfits, locations or styles.
  4. Pick one of 30+ presets, or write a short description.
  5. For restyling, open Styles: 20+ animation styles, or build your own from reference images.
  6. Choose 480p, 720p or 1080p and generate.
- **Inputs, settings and limits:**
  - Prices for a 15 second clip: 40 credits at 480p, 104 at 720p, 144 at 1080p. Both modes cost the same.
  - The presets page has Higgsfield, Community trending and Community new tabs.
  - Genjutsu is also available through MCP and as a "Genjutsu API".
  - Free generations at 720p: 3 on Plus and Ultra, none on Starter.
- **Models:** Higgsfield Genjutsu.
- **Route(s):** `/ai/video?model=genjutsu` (blank, [shot](screenshots/tools/ai_video_model_genjutsu.jpg)), `/higgsfield-genjutsu-presets`
- **Notes for ComfyField:** Covered in concept by our "Motion transfer" and "Swap an element" formats. For open weights, Wan Animate and VACE-style workflows on ComfyUI fit.

### Video: Kling Motion Control

![Kling Motion Control (blank frame)](screenshots/tools/ai_video_motion.jpg)

- **What it does:** Copies the motion, timing and expressions from a reference video onto a still character image, keeping the character's look. Version 3.0 has been available since March 5, 2026.
- **How it works and how to use it** (help: "Kling"; blog "Kling Motion Control 3.0"):
  1. Open Video, then Kling Motion Control.
  2. Upload a character image with arms and hands visible, room around the body and a clear background.
  3. Upload a motion video: clean, one clear subject, framing that matches the image, and no camera cuts.
  4. Optionally prompt a new environment.
  5. Generate.
- **Inputs, settings and limits:**
  - Output is 3 to 30 seconds at 1080p.
  - It suits dance, sports, martial arts and hand motion.
  - Movement templates can stand in for your own recording.
  - The same tool is available through MCP.
- **Models:** Kling 3.0 Motion Control, with the older Kling Motion Control still listed.
- **Route(s):** `/ai/video/motion` (blank)
- **Notes for ComfyField:** Our "Motion transfer" format could run Kling motion control through fal, or Wan Animate on ComfyUI.

### Video: Partner video models

![Kling 3.0 page (blank frame)](screenshots/tools/ai_video_model_kling3_0.jpg)

- **What it does:** Menu shortcuts that open Create video with a model already picked. All nine pages captured only a spinner, so the specs below come from page titles and descriptions, help and the changelog.
- **How it works and how to use it:** the same steps as Create video.
- **Inputs, settings and limits:**

  | Model | Vendor | Menu says | Route | Specs seen |
  |---|---|---|---|---|
  | Seedance 2.5 | ByteDance | Cinematic videos up to 30 seconds | `/ai/video?model=seedance_2_5` ([shot](screenshots/tools/ai_video_model_seedance_2_5.jpg)) | 4 to 30 seconds, up to 1080p on Pro and Plus and above, 9:16 to 21:9, 50 refs (30 image, 10 video, 10 audio), native audio |
  | Gemini Omni Flash 1.1 | Google | Generate and edit video from any input | `/ai/video?model=gemini-omni-flash-1-1` ([shot](screenshots/tools/ai_video_model_gemini_omni_flash_1_1.jpg)) | Chat-style edits on a finished clip: background, relight, style, objects, physics |
  | FLUX.3 Video | Black Forest Labs | Text, image and video with synced audio | `/ai/video?model=flux_3_video` ([shot](screenshots/tools/ai_video_model_flux_3_video.jpg)) | 5 to 20 seconds, 720p/1080p, text-to-video, image-to-video, start and end frames, continuation, lip-synced dialogue |
  | Kling 3.0 | Kuaishou | Cinematic videos with audio | `/ai/video?model=kling3_0` ([shot](screenshots/tools/ai_video_model_kling3_0.jpg)) | Multi-shot scenes, up to 4K, 3 to 15 seconds, native audio, genres and speed ramps |
  | MiniMax H3 | MiniMax | 2K video from text, keyframes or multimodal refs | `/ai/video?model=minimax_h3` ([shot](screenshots/tools/ai_video_model_minimax_h3.jpg)) | 2K, up to 15 seconds, 24 fps, 9 image, 3 video and 3 audio refs, start and end frames, 21:9 to 9:16 |
  | Wan 3.0 | Alibaba | Video from text, keyframes or multimodal refs | `/ai/video?model=wan3_0` ([shot](screenshots/tools/ai_video_model_wan3_0.jpg)) | Up to 30 seconds, up to 1080p, image, video and audio refs, Wan 3.0 Prime variant |
  | Grok Imagine 1.5 Lite | xAI | Fast, affordable video from text or an image | `/ai/video?model=grok_video_v15_lite` ([shot](screenshots/tools/ai_video_model_grok_video_v15_lite.jpg)) | 1 to 15 seconds, 480p/720p/1080p, start image only |
  | Grok Imagine 1.5 | xAI | Cinematic video with synchronized audio | `/ai/video?model=grok_video_v15` ([shot](screenshots/tools/ai_video_model_grok_video_v15.jpg)) | 1 to 15 seconds, 24 fps, text-to-video, image-to-video, reference and extension modes, 7 refs, renders in under 20 seconds |
  | Google Veo 3.1 | Google | Advanced AI video with sound | `/ai/video?model=veo-3-1-preview` ([shot](screenshots/tools/ai_video_model_veo_3_1_preview.jpg)) | The page title says Preview. Native sound; no other specs captured |

  - Two more video models are in the menu but documented elsewhere: Kling 3.0 Omni Edit (under Edit video) and FLUX.3 Upscale (under Video upscale).
  - Plans unlock some models for a limited time without spending credits. Wan 3.0 and Kling 3.0 have 7-day unlimited windows, and Seedance 2.5 has 30 days on business plans. These windows apply on the web only.
- **Models:** as in the table.
- **Route(s):** the 9 routes in the table
- **Notes for ComfyField:** Our catalog has Seedance 2.5, Kling 3 Pro, MiniMax H3 and Wan 3.0 through fal, Veo 3.1, Fast and Lite through Google, and LTX on ComfyUI. Grok Imagine, Gemini Omni Flash and FLUX.3 Video are missing.

### Video: Lipsync Studio

![Lipsync Studio](screenshots/tools/lipsync_studio.jpg)

- **What it does:** Makes a character talk. You start from an image or video, add speech, and pick one of several lip sync models. It is listed under Studios. Help says to use it for talking mouths and to use Audio for voices alone.
- **How it works and how to use it** (page and help):
  1. Pick a scene template with Change: General, Selfie, Podcast, Car Talking and more.
  2. Upload an image or a video.
  3. Under Audio text, type what the character should say, or switch to Generate Audio.
  4. Add a prompt describing the scene.
  5. Pick a model and set Duration and Resolution.
  6. Press Generate (9 credits with the defaults).
- **Inputs, settings and limits:**
  - The defaults are Wan 2.5 Fast, 5 seconds and 720p.
  - Image to video: Veo 3.1, Kling 2.6 Lipsync (1080p), Wan 2.5 Speak (480 to 1080p), Kling Avatars 2.0 (longer clips), Higgsfield Speak 2.0 and Infinite Talk (long form).
  - Video to video: Kling Lipsync, and Sync Lipsync 3 (up to 4K).
- **Models:** as listed above.
- **Route(s):** `/lipsync-studio`
- **Notes for ComfyField:** Covered by our "Lipsync" and "Talking head" formats.

### Video: Visual effects

![Visual effects](screenshots/tools/effects.jpg)
![Visual effects, cards](screenshots/tools/effects_2.jpg)

- **What it does:** One-click effect presets that turn your photo into a short effect video: melting, earth zoom, clones and so on. Effects is a top-bar item, and it is also available in ChatGPT through the /effects command.
- **How it works and how to use it** (page):
  1. Open Effects and pick an effect chip or card ("Try for free" or "Generate").
  2. The editor at `/effects/use` loads. The capture shows only "Loading effects".
  3. Add your media and generate.
- **Inputs, settings and limits:**
  - `/effects` lists 45 named effects. Seven are marked new: Agamemnon, Fallen Angel, Bullet Time, Cyclope, Pigeons, Pearl Earring and Skatedog.
  - `/collection/effects` is an older catalog of about 100 effects, such as Earth zoom out, Turning metal + melting, Building explosion and Face punch, with a "Catch the pulse" set.
- **Models:** not stated. Help ties preset effects to DoP.
- **Route(s):** `/effects`, `/effects/use` (loading, [shot](screenshots/tools/effects_use.jpg)), `/collection/effects` ([shot](screenshots/tools/collection_effects.jpg))
- **Notes for ComfyField:** We have five Effects presets (Melt, Zero gravity, City giant, Neon outline, Claymation). Higgsfield shows 45 to 100.

### Video: Preset galleries

![Camera controls](screenshots/tools/camera_controls.jpg)
![Camera controls, cards](screenshots/tools/camera_controls_2.jpg)

- **What it does:** Four landing galleries of motion presets, grouped by purpose. Each card has Generate and View buttons, and some carry Top Choice or Mixed (combined presets) badges.
  - Camera Controls: "50+ cinematic AI-motion presets"
  - UGC: creator-style clips
  - Commercial: brand and product shots
  - Viral: trend effects
- **How it works and how to use it** (pages):
  1. Open a gallery and filter by chip.
  2. Press Generate on a card. It opens the generator with the preset picked.
  3. Add a keyframe image and generate.
- **Inputs, settings and limits:**
  - Camera controls lists 64 moves, from Crash Zoom In, Dolly Zoom, FPV Drone, Robo Arm and Snorricam to Whip Pan, 360 Orbit and 3D Rotation.
  - UGC has about 47 cards (Outfit Check, Morning Routine, Selfie and more).
  - Commercial has about 27 (Catwalk, Exploded View, Red Carpet, Yacht and more).
  - Viral has about 54 (Earth Zoom Out, Turning Metal + Eyes In and more).
- **Models:** Higgsfield DoP.
- **Route(s):** `/camera-controls`, `/ugc` ([shot](screenshots/tools/ugc.jpg), [shot 2](screenshots/tools/ugc_2.jpg)), `/commercial` ([shot](screenshots/tools/commercial.jpg), [shot 2](screenshots/tools/commercial_2.jpg)), `/viral` ([shot](screenshots/tools/viral.jpg))
- **Notes for ComfyField:** Our "Camera moves" format has five moves. A prompt-based move library with dozens of named presets is cheap to add.

### Audio: Text to speech

![Audio, Text to speech panel (Eleven v3 route)](screenshots/tools/audio_voiceMode_voiceover_audioModel_elevenlabs.jpg)
![Text to speech route (blank)](screenshots/tools/audio_voiceMode_voiceover.jpg)

- **What it does:** Generates speech from a script with a preset or cloned voice. Audio is one page with three tabs: Text to Speech, Voice Change and Translate. The only audio capture that rendered is the Eleven v3 route, shown above.
- **How it works and how to use it** (page and help: "lipsync, voiceover and aspect ratios"):
  1. Open Audio, then the Text to Speech tab.
  2. Pick a voice. This is required, and can be a preset or a voice you uploaded. To make a custom voice, go to Create custom voice, then Add Voice, and record or upload an MP3 or WAV.
  3. Write the Script: exactly what the voice should read. Type @ to reference attachments.
  4. Pick the Model, set the Batch size, then open Advanced settings for delivery and emotion sliders.
  5. Press Generate. Takes appear under History, and Filters sort them.
- **Inputs, settings and limits:**
  - The right pane explains the flow in two cards: "Pick or clone a voice" and "Write, describe and generate".
  - Batch size runs from 1 to 4.
  - Help asks you to clone only your own voice, or one you have permission to use.
  - Audio is reachable through Claude MCP, but not through the ChatGPT plugin.
  - The blog says there is no separate music or sound-effects generator. Ambience comes only as part of Seed Audio scenes.
- **Models:** the seven models listed under Audio models. Help and blog also name VibeVoice for long-form narration.
- **Route(s):** `/audio?voiceMode=voiceover` (blank), `/audio` ([shot](screenshots/tools/audio.jpg), blank)
- **Notes for ComfyField:** Covered by our "Text to speech" and "Voice clone" formats, using Gemini voice and ElevenLabs. We also already generate music (MiniMax Music 3) and sound effects (ElevenLabs), which Higgsfield Audio does not.

### Audio: Voice change

![Voice change (blank frame)](screenshots/tools/audio_voiceMode_change_voice.jpg)

- **What it does:** Replaces the voice in an existing video or clip, and leaves the picture alone.
- **How it works and how to use it** (help and blog "Higgsfield Audio"):
  1. Open Audio, then the Voice Change tab.
  2. Upload the video.
  3. Pick the new voice, a preset or a clone.
  4. Generate and review.
- **Inputs, settings and limits:**
  - No controls were captured.
  - Voice change is also exposed through MCP.
- **Models:** not stated.
- **Route(s):** `/audio?voiceMode=change-voice` (redirects to `/audio`, blank)
- **Notes for ComfyField:** Covered by our "Voice change" format.

### Audio: Translate

![Translate (blank frame)](screenshots/tools/audio_voiceMode_translate.jpg)

- **What it does:** Translates the speech in a video into another language, re-voices it and lip-syncs the result. Timing and visuals stay the same.
- **How it works and how to use it** (help):
  1. Open Audio, then the Translate tab.
  2. Upload the video.
  3. Pick the target language.
  4. Generate.
- **Inputs, settings and limits:**
  - Help says 18 languages.
  - MCP calls this "video dubbing".
- **Models:** not stated.
- **Route(s):** `/audio?voiceMode=translate` (blank)
- **Notes for ComfyField:** Covered by our "Dub into another language" format.

### Audio: Audio models

![Eleven v3 in Text to speech](screenshots/tools/audio_voiceMode_voiceover_audioModel_elevenlabs.jpg)

- **What it does:** Seven menu shortcuts that open Text to speech with a voice model picked. Only the Eleven v3 route rendered; the rest show the loading frame.
- **How it works and how to use it:** the same steps as Text to speech.
- **Inputs, settings and limits:**

  | Model | Vendor | Menu says | Route | Specs seen (blog, changelog) |
  |---|---|---|---|---|
  | Seed Audio 1.0 | ByteDance | Multi-speaker scenes with speech and ambience | `/audio?voiceMode=voiceover&audioModel=seed_audio` ([shot](screenshots/tools/audio_voiceMode_voiceover_audioModel_seed_audio.jpg)) | Prompt with @ attachments, 50+ voice presets, 8 to 48 kHz (24 kHz default), speed and volume, mp3/wav/opus; also handles cloning and dubbing |
  | Eleven v4 | ElevenLabs | Expressive narration with stability and similarity controls | `/audio?voiceMode=voiceover&audioModel=elevenlabs_v4` ([shot](screenshots/tools/audio_voiceMode_voiceover_audioModel_elevenlabs_v4.jpg)) | Multiple speakers, 90+ languages, up to 10,000 characters |
  | Eleven v4 Turbo | ElevenLabs | Fast expressive speech | `/audio?voiceMode=voiceover&audioModel=elevenlabs_v4_turbo` ([shot](screenshots/tools/audio_voiceMode_voiceover_audioModel_elevenlabs_v4_turbo.jpg)) | No specs captured |
  | Eleven v3 | ElevenLabs | Emotion and delivery control via inline tags | `/audio?voiceMode=voiceover&audioModel=elevenlabs` ([shot](screenshots/tools/audio_voiceMode_voiceover_audioModel_elevenlabs.jpg)) | Inline tags; the panel shows "ElevenLabs v3" |
  | Qwen Audio 3.0 | Alibaba | Natural speech with voice, style and emotion control | `/audio?voiceMode=voiceover&audioModel=qwen_audio` ([shot](screenshots/tools/audio_voiceMode_voiceover_audioModel_qwen_audio.jpg)) | Auto-detects 13+ languages, speed, volume and seed, mp3/wav/opus |
  | MiniMax Speech 2.8 HD | MiniMax | High-fidelity single-voice narration | `/audio?voiceMode=voiceover&audioModel=minimax` ([shot](screenshots/tools/audio_voiceMode_voiceover_audioModel_minimax.jpg)) | Voice and quality tier |
  | Seed Speech | ByteDance | Multilingual speech across 30+ languages | `/audio?voiceMode=voiceover&audioModel=seed_speech` ([shot](screenshots/tools/audio_voiceMode_voiceover_audioModel_seed_speech.jpg)) | 30+ languages |

  - Every route above starts with `/audio?voiceMode=voiceover&audioModel=`, and every one redirects to `/audio`.
  - Audio can feed Cinema Studio, Seedance 2.0 and Kling 3.0 as a reference input, so the motion is timed to the sound.
- **Models:** as in the table.
- **Route(s):** the 7 routes in the table
- **Notes for ComfyField:** Our catalog has Gemini TTS, ElevenLabs speech and sound effects, and MiniMax Music 3. Seed Audio, Qwen Audio, MiniMax Speech and Seed Speech are missing. Some are reachable through fal.

### Studio: Marketing Studio

![Marketing Studio](screenshots/tools/marketing_studio.jpg)

- **What it does:** A template-first workspace for ads, product shots, UGC and posters. You pick one of 1,500+ templates, connect a product by image or by URL, and get an on-brand result in one click. A free prompt path also exists. It has its own shell with an icon rail on the left.
- **How it works and how to use it** (help: "Marketing Studio", blog "New Marketing Studio"):
  1. Open Marketing Studio and browse Explore templates. Filter by All, Product shot, Motion, UGC, TikTok, Ads, Posters or Marketplace, and by Images or Videos.
  2. Pick a template.
  3. Connect the brand: upload a product image, or paste a site or product URL. The page is read for imagery, logo, colors and copy.
  4. Press Generate. The cost is on the button.
  5. Alternatively, take the prompt path: paste a URL or images, describe the shot and generate without a template.
- **Inputs, settings and limits:**
  - Product Shots come in three formats: Studio, Lifestyle and With Model.
  - UGC Videos come as Faceless, Talking Head or Silent, and can mirror a reference ad.
  - Motion includes Hypermotion, 2D Product Motion, Mixed Media and Motion Design. Motion Design builds from a logo or a website.
  - A Brand Kit holds the logo, colors, fonts, imagery and tone, extracted from a URL.
  - A Soul ID can serve as a consistent spokesperson.
  - Virality Predictor scores a clip before you publish.
  - Help caps each generation at 15 seconds. One blog says UGC and Motion reach 30.
  - Only Posters can be edited after generation, through Layers. Everything else is regenerated.
  - The template flow is not available through MCP or Supercomputer.
- **Models:** not stated.
- **Route(s):** `/marketing-studio`
- **Notes for ComfyField:** We have "Product to ad", "UGC ad", "Ad variants", "Ads from a link" and "Product shot" formats. The gaps are a browsable template library and a reusable brand kit.

### Studio: Ads Studio and Ad Multiplier

![Ads Studio](screenshots/tools/ads_studio.jpg)

- **What it does:** Ads Studio turns your website into batches of static ads that use your brand kit. Its tagline is "Everything you need to create ads that convert". Ad Multiplier, its second tool, makes variations of a reference video ad with your products, cast and locations.
- **How it works and how to use it** (page, blogs "Ads Studio" and "Ad Multiplier"):
  1. Create a brand kit. Paste the site URL and press "Create my brand", or fill it in by hand.
  2. Pick products from the imported catalog, or add them by link or upload.
  3. Choose up to 20 ads per product. The cost is shown first.
  4. Generate, review the copy and designs, then download.
  5. To get more, use "Mention a product" in chat with a short brief.
  6. For Ad Multiplier: upload a reference ad, add images, write a prompt that mentions files with @, pick a quality and generate. Results land in History.
- **Inputs, settings and limits:**
  - Brand kit fields: logo, palette (hex), fonts, tone of voice, audience, aesthetics, description, selling points and socials.
  - Static ads cost 4 credits each (about $0.05 per credit).
  - Ad Multiplier takes a reference of 4 to 30 seconds and up to 20 images, outputs at 480p, 720p or 1080p, and can change the hook, script or CTA.
  - Ad Multiplier costs about 140 credits at 720p, or 240 at 1080p, when you change both hook and CTA.
- **Models:** not stated.
- **Route(s):** `/ads-studio`
- **Notes for ComfyField:** Covered by our "Ad variants", "Recreate an ad" and "Ads from a link" formats. A Brand kit Library type would let every ad format reuse the same brand details.

### Studio: Higgsfield Apps

![Higgsfield Apps](screenshots/tools/apps.jpg)
![Higgsfield Apps, lower page](screenshots/tools/apps_2.jpg)

- **What it does:** A catalog of one-click effect apps. Most take one upload and a preset. The individual app pages are covered in the apps section of this report.
- **How it works and how to use it** (page):
  1. Search the catalog or filter by category.
  2. Press Try now on an app.
  3. Upload your media and generate.
- **Inputs, settings and limits:** categories and the apps shown in each:
  - Professional: Virality Predictor, Expand image, Angles 2.0, Shots, Transitions
  - Enhance & Style: Skin Enhancer, AI Stylist, Relight, Outfit Swap, Style Snap
  - Face & Identity: Face Swap, Headshot Generator, Character Swap 2.0, Recast, Video Face Swap
  - Video Editing: ClipCut, Urban Cuts, Video Background Remover, Breakdown, Japanese Show
  - Ads & Products: Click to Ad, Billboard Ad, Bullet Time Scene, Truck Ad, Bullet Time White
  - Games & Characters: Game Dump, Nano Strike, Nano Theft, Simlife, Plushies
  - Extras: AI Meme Generator, Background Remover, Micro-Beasts, Signboard, Paint App
  - Trending Templates: On Fire, Skibidi, Mukbang, Cloud Surf, Idol
- **Models:** not stated.
- **Route(s):** `/apps`
- **Notes for ComfyField:** Our fun, ads and edit formats already mirror many of these: Plush toy, Signboard, Billboard mockup, Truck ad, Life sim game, Game show contestant, Cloud surfing, Idol photocard and Behind the scenes.

### Agent: Supercomputer

![Supercomputer](screenshots/tools/supercomputer.jpg)

- **What it does:** A chat agent that takes a plain-language brief, plans the steps, routes each step to a model, generates, and assembles the result. It also builds apps, websites and browser games, and can act in outside apps through connectors. The home page says it is powered by GPT-6 Astra.
- **How it works and how to use it** (page and help: "Supercomputer"):
  1. Open Supercomputer and start a New chat (Ctrl+Enter).
  2. Type the brief. The placeholder reads "Turn my podcast into 9:16 Reel". Attach files with the plus button.
  3. Pick the LLM. Auto is free and the default; the changelog calls it Orchestrator.
  4. Decide whether to keep "Ask before generating" on.
  5. Optionally attach a Project, a Skill or a Connector.
  6. The agent proposes a plan, runs it and returns results in the chat.
  7. Reply to refine. Only the changed steps run again.
- **Inputs, settings and limits:**
  - The sidebar has New chat, Projects, Skills, Connectors, See more and Chats.
  - Help adds Apps, Games, Memory and a Faceless channel builder: videos up to 15 minutes in 12 styles.
  - Showcase tabs: All, Marketing, Explainer videos, Apps and Games.
  - Cards include Free Mode, Ad Multiplier, Editorial Motion Graphics, Higgsfield Faceless Video, Cartoon Faceless Video, SaaS UGC video, Physical UGC video, Brandkit, Shorts Maker and Website Building.
  - Connectors include Telegram, Slack, TikTok, Gmail, Google Drive and Notion.
  - Apps are built from one of three templates (App detail, Preset, Studio), deploy to a subdomain, and charge each user's own credits. You get git access and a read-only view of the app's database.
  - Games run on the Fable engine and cost more credits.
  - Storage is metered per plan.
  - Every generation step spends credits. Unlimited plan access does not apply here.
- **Models:** LLMs from Anthropic, OpenAI, Google, xAI, DeepSeek and others. The changelog names GPT-6.1 Sol and Claude Sonnet 5.5. The agent routes each generation step to any Higgsfield model.
- **Route(s):** `/supercomputer`, `/chat` (redirects, [shot](screenshots/tools/chat.jpg)), `/ai-assist` (redirects, [shot](screenshots/tools/ai_assist.jpg))
- **Notes for ComfyField:** We expose an MCP server and a CLI so outside agents can drive ComfyField, but there is no in-app agent. An agent that writes Flows would be our version of this.

### Agent: Katana

![Katana](screenshots/tools/katana.jpg)

- **What it does:** A Higgsfield skill for Claude that recreates a reference edit (its shot order, pacing, cuts and music) with your own characters, products or clothing. The page says it is "powered by Claude Motion", and its meta text credits Claude Opus 5.5.
- **How it works and how to use it** (page, blog "Katana", changelog):
  1. On the Katana page, add a reference video, or pick a preset from the library.
  2. Add your characters: up to 5 photos.
  3. Optionally turn on Instructions and say what to keep or change.
  4. Press "Send & Generate in Claude". The first time, use "Install Higgsfield in Claude".
  5. Alternatively, in Claude, type /katana to browse presets, /katana/<preset> to run one, or ask in plain words.
  6. Fix things in the chat. Only the affected shots regenerate.
- **Inputs, settings and limits:**
  - Presets fall into Personalized edits, Style transfer and Motion transfer, from Higgsfield or the community.
  - Publishing a community preset takes a 3 to 30 second motion video, up to 40 images and a prompt using @.
  - The output MP4 matches the reference's length, ratio and frame rate.
  - Instagram and TikTok profile links are not accepted.
  - A cost card appears in Claude before each generation.
- **Models:** Higgsfield models through MCP. The specific video model is not stated.
- **Route(s):** `/katana` (see `/mcp/katana` under MCP skills)
- **Notes for ComfyField:** Our "Clone an edit" format is the equivalent. Exposing it as an MCP prompt would let Claude run it.

### Agent: AI Motion Designer

![AI Motion Designer](screenshots/tools/ai_motion_designer.jpg)
![AI Motion Designer, lower page](screenshots/tools/ai_motion_designer_2.jpg)

- **What it does:** Chat-driven motion design. Titles, transitions, logo reveals and product promos are built as editable After Effects compositions from a prompt in ChatGPT. The meta description also mentions Premiere Pro.
- **How it works and how to use it** (page):
  1. In ChatGPT, open Plugins and install Higgsfield.
  2. Type @Higgsfield /use-after-effects and describe the animation.
  3. Run the first workflow. Layers, text, timing and keyframes stay editable.
- **Inputs, settings and limits:**
  - You can feed it images to restyle the rhythm and transitions of a reference.
  - "Watch how it works" plays a demo.
  - It shares the pricing block with the rest of the site.
- **Models:** GPT-6 Astra, according to the page. The generation models are not stated.
- **Route(s):** `/ai-motion-designer`
- **Notes for ComfyField:** Our "Motion graphics" format renders video. We have no editor integration, and there is no need to build one before the deadline.

### Agent: MCP, ChatGPT plugin and CLI

![MCP](screenshots/tools/mcp.jpg)
![MCP, lower page](screenshots/tools/mcp_2.jpg)

- **What it does:** Connects outside agents to a Higgsfield account through OAuth, with no API key. Agents can then generate images, video and audio, use Soul characters and Elements, run skills and check credits. The tabs are ChatGPT Plugin, Claude, Claude Code, CLI and Other.
- **How it works and how to use it** (page and help: "connect to Claude or ChatGPT", "CLI"):
  1. In Claude, open Settings, then Connectors, then Add custom connector. Paste `https://mcp.higgsfield.ai/mcp`, connect and authorize.
  2. In ChatGPT, add the Higgsfield plugin from the Plugins Directory.
  3. In Cursor, go to Customize, then Marketplace, then Higgsfield.
  4. In Claude Code, OpenClaw or Hermes: run `npm i -g @higgsfield/cli`, then `higgsfield auth login`, then `npx skills add higgsfield-ai/skills`.
  5. Check it works by asking "What is my Higgsfield credit balance?".
- **Inputs, settings and limits:**
  - The page shows three example prompts (Generate video, Generate image, Edit a photo), each with Try and Copy prompt.
  - The skill gallery filters by Popular, Paid Ads, Motion Design, Marketing, Production, UGC, Faceless, For After Effects and For Blender.
  - MCP can do: generation with all models, upscaling, background removal, outpainting and video reframe, Kling Motion Control, voiceover, cloning, voice change and dubbing, Personal Clipper, and listing generations and balance.
  - Files reach the agent through an upload window inside the conversation.
  - Every MCP generation costs credits; unlimited access and free generations do not apply.
  - ChatGPT gets no audio and no website building.
  - Blender Bridge (`bridge.higgsfield.ai/mcp`) lets an agent work inside the open Blender scene.
  - The CLI installs three skills: generate, soul and product-photoshoot.
  - The product-photoshoot skill has image presets product_shot, lifestyle_scene, pinterest_pin, hero_banner, social_carousel, ad_creative_pack, virtual_model_tryout, conceptual_product and restyle, and video presets UGC, Tutorial, Unboxing, Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On and Pro Virtual Try On.
- **Models:** "30+ models" (page meta). The featured list is Nano Banana Pro, Google Omni Flash, Seedance 2.5, Seedream 5.0 Lite, Seedance 2.0, Kling 3, GPT Image 2 and Soul 2.0.
- **Route(s):** `/mcp`, `/mcp?tab=chatgpt` ([shot](screenshots/tools/mcp_tab_chatgpt.jpg), [shot 2](screenshots/tools/mcp_tab_chatgpt_2.jpg)), `/mcp?tab=claude` ([shot](screenshots/tools/mcp_tab_claude.jpg), [shot 2](screenshots/tools/mcp_tab_claude_2.jpg))
- **Notes for ComfyField:** We already ship an MCP server (`server/mcp.js`) and a CLI (`bin/comfyfield.js`) that run on local keys. The gaps are a balance and cost tool, an upload helper and named skills.

### Agent: MCP skills

![Skill page: Product review UGC](screenshots/tools/mcp_ugc_flow.jpg)
![Skill page: Build 3D scenes in Blender](screenshots/tools/mcp_scene_builder.jpg)

- **What it does:** Ready-made agent workflows, each with its own page. A page has a slash command, category tags, an example prompt, "Start in 3 steps" or "Start in 4 steps" instructions, a demo video and related presets. There are 38 skills and 3 bundles.
- **How it works and how to use it** (skill pages):
  1. For marketing, UGC, faceless and After Effects skills, install the Higgsfield plugin in ChatGPT (Desktop for the After Effects and marketing skills). Prepare the brief and references, copy the example prompt and send it. These pages say "Try in ChatGPT".
  2. For production skills (Blender, Adobe, TouchDesigner, Resolve), open Codex on the same computer as the app, connect Higgsfield, install the app and press "Open in Codex". The prompt asks the agent to request source files and keep existing work.
- **Inputs, settings and limits:**

  | Skill (command) | What it does | Inputs | Route |
  |---|---|---|---|
  | Katana video remix (/katana) | Remixes a reference video with new subjects, styling and effects | Reference edit or preset, up to 5 photos, optional notes | `/mcp/katana` ([shot](screenshots/tools/mcp_katana.jpg)) |
  | Product review UGC (/ugc-flow) | Creator-style review, from concept and script to a 9:16 video | Product brief, reference images, creator image | `/mcp/ugc-flow` ([shot](screenshots/tools/mcp_ugc_flow.jpg), [shot 2](screenshots/tools/mcp_ugc_flow_2.jpg)) |
  | Ad Recreator (/marketing-adapt-video) | Original ad reusing a reference video's sales structure | Reference video, product | `/mcp/ad-adaptation` ([shot](screenshots/tools/mcp_ad_adaptation.jpg), [shot 2](screenshots/tools/mcp_ad_adaptation_2.jpg)) |
  | Ad Resizer (/marketing-resize-ads) | Adapts static ads to 1:1, 4:5 and 9:16 placements | Static ad | `/mcp/aspect-ratio-formatter` ([shot](screenshots/tools/mcp_aspect_ratio_formatter.jpg), [shot 2](screenshots/tools/mcp_aspect_ratio_formatter_2.jpg)) |
  | Ad Strategist (/marketing-research-to-ads) | Product and competitor research into static ads with distinct angles | Product, market | `/mcp/link-to-ads` ([shot](screenshots/tools/mcp_link_to_ads.jpg), [shot 2](screenshots/tools/mcp_link_to_ads_2.jpg)) |
  | Campaign Analyst (/marketing-campaign-manager) | Reviews results and says what to scale, pause and test | Campaign data (for example 14 days) | `/mcp/performance-marketing-operator` ([shot](screenshots/tools/mcp_performance_marketing_operator.jpg), [shot 2](screenshots/tools/mcp_performance_marketing_operator_2.jpg)) |
  | Customer Voice Ads (/marketing-feedback-to-ads) | Static ads built from customer language | Reviews, product evidence | `/mcp/voc-research-ad` ([shot](screenshots/tools/mcp_voc_research_ad.jpg), [shot 2](screenshots/tools/mcp_voc_research_ad_2.jpg)) |
  | Headline Multiplier (/marketing-headline-variants) | Copies of an ad with only the headline changed | One static ad | `/mcp/headlines-ab` ([shot](screenshots/tools/mcp_headlines_ab.jpg), [shot 2](screenshots/tools/mcp_headlines_ab_2.jpg)) |
  | Hook Multiplier (/marketing-hook-variants) | Full edits of a video with new opening hooks | One video | `/mcp/ad-hooks` ([shot](screenshots/tools/mcp_ad_hooks.jpg), [shot 2](screenshots/tools/mcp_ad_hooks_2.jpg)) |
  | Ad Localizer (/marketing-localize-ads) | Translates and adapts static ads, keeping offer and voice | Static ads, languages | `/mcp/localizations` ([shot](screenshots/tools/mcp_localizations.jpg)) |
  | Illustration Animation in After Effects | Animates illustrations with editable layers | Illustrations | `/mcp/illustration-animation` ([shot](screenshots/tools/mcp_illustration_animation.jpg), [shot 2](screenshots/tools/mcp_illustration_animation_2.jpg)) |
  | Localization Motion in After Effects | Localizes motion design, keeping layout and timing | After Effects project, languages | `/mcp/localization-motion` ([shot](screenshots/tools/mcp_localization_motion.jpg), [shot 2](screenshots/tools/mcp_localization_motion_2.jpg)) |
  | Motion Design in After Effects (/use-after-effects) | Motion sequence with type, keyframes and expressions | Brief, visual assets | `/mcp/use-after-effects` ([shot](screenshots/tools/mcp_use_after_effects.jpg), [shot 2](screenshots/tools/mcp_use_after_effects_2.jpg)) |
  | Paper Collage in After Effects | Collage animation from generated cutouts, with parallax | Story brief | `/mcp/paper-collage` ([shot](screenshots/tools/mcp_paper_collage.jpg), [shot 2](screenshots/tools/mcp_paper_collage_2.jpg)) |
  | Presentation Animation in After Effects | Animates slides, with transitions timed to music | Slides, brand assets, music | `/mcp/presentation-animation` ([shot](screenshots/tools/mcp_presentation_animation.jpg), [shot 2](screenshots/tools/mcp_presentation_animation_2.jpg)) |
  | SaaS Animation in After Effects | UI walkthrough animation with a logo reveal | App screens, brand assets | `/mcp/saas-animation` ([shot](screenshots/tools/mcp_saas_animation.jpg), [shot 2](screenshots/tools/mcp_saas_animation_2.jpg)) |
  | Whiteboard Animation in After Effects | Whiteboard with cursors, sticky notes and arrows | Whiteboard image | `/mcp/whiteboard-animation` ([shot](screenshots/tools/mcp_whiteboard_animation.jpg), [shot 2](screenshots/tools/mcp_whiteboard_animation_2.jpg)) |
  | Editorial Motion Graphics (/vox-mixed-media) | Faceless explainer in editorial mixed media | Subject, source facts | `/mcp/vox-mixed-media` ([shot](screenshots/tools/mcp_vox_mixed_media.jpg)) |
  | Stickman cartoon (/stickman-explainer) | Faceless explainer with stick figures | Topic, key points | `/mcp/stickman-explainer` ([shot](screenshots/tools/mcp_stickman_explainer.jpg), [shot 2](screenshots/tools/mcp_stickman_explainer_2.jpg)) |
  | Fairy Tale & Myth | Faceless video in a fairy-tale style | Topic or story | `/mcp/faceless-fairy-tale-myth` ([shot](screenshots/tools/mcp_faceless_fairy_tale_myth.jpg), [shot 2](screenshots/tools/mcp_faceless_fairy_tale_myth_2.jpg)) |
  | Paper Diorama | Faceless story in layered paper scenes | Topic, key events | `/mcp/faceless-paper-diorama` ([shot](screenshots/tools/mcp_faceless_paper_diorama.jpg), [shot 2](screenshots/tools/mcp_faceless_paper_diorama_2.jpg)) |
  | Pastel Flat 2D | Faceless explainer in pastel flat art | Topic, main points | `/mcp/faceless-pastel-flat-2d` ([shot](screenshots/tools/mcp_faceless_pastel_flat_2d.jpg)) |
  | Hand Drawn | Faceless video in a sketched storybook look | Topic or short script | `/mcp/faceless-hand-drawn` ([shot](screenshots/tools/mcp_faceless_hand_drawn.jpg), [shot 2](screenshots/tools/mcp_faceless_hand_drawn_2.jpg)) |
  | Mannequin | Faceless story with mannequin figures | Topic, key moments | `/mcp/faceless-mannequin` ([shot](screenshots/tools/mcp_faceless_mannequin.jpg), [shot 2](screenshots/tools/mcp_faceless_mannequin_2.jpg)) |
  | Physical UGC video | Creator tutorial showing how a product works | Product and presenter refs, steps | `/mcp/physical-ugc-skill` ([shot](screenshots/tools/mcp_physical_ugc_skill.jpg), [shot 2](screenshots/tools/mcp_physical_ugc_skill_2.jpg)) |
  | Unboxing UGC | Unboxing with a reveal and close-ups | Product and packaging refs, features | `/mcp/unboxing-ugc-skill` ([shot](screenshots/tools/mcp_unboxing_ugc_skill.jpg), [shot 2](screenshots/tools/mcp_unboxing_ugc_skill_2.jpg)) |
  | Try-on UGC | Try-on showing fit and styling | Product and presenter refs, styling notes | `/mcp/try-on-ugc-skill` ([shot](screenshots/tools/mcp_try_on_ugc_skill.jpg), [shot 2](screenshots/tools/mcp_try_on_ugc_skill_2.jpg)) |
  | Animate object assembly in Blender (/Exploded-view) | Exploded-view and assembly animation | Blender scene | `/mcp/exploded-view` ([shot](screenshots/tools/mcp_exploded_view.jpg), [shot 2](screenshots/tools/mcp_exploded_view_2.jpg)) |
  | Build 3D scenes in Blender (/Scene-Builder) | Editable scene with posed characters and camera options | Brief, reference images | `/mcp/scene-builder` ([shot](screenshots/tools/mcp_scene_builder.jpg), [shot 2](screenshots/tools/mcp_scene_builder_2.jpg)) |
  | Create cartoon materials in Blender (/Cartoon-shaders) | Toon shaders with outlines and controls | Blender scene, style reference | `/mcp/cartoon-shaders` ([shot](screenshots/tools/mcp_cartoon_shaders.jpg), [shot 2](screenshots/tools/mcp_cartoon_shaders_2.jpg)) |
  | Simulate destruction in Blender (/Destruction-Studio) | Fractures, debris, dust and a camera move | Scene, what breaks, trigger, duration | `/mcp/destruction-studio` ([shot](screenshots/tools/mcp_destruction_studio.jpg)) |
  | Organize footage in Premiere Pro (/Project-sorter) | Bins, audio sync and named sequences | Premiere project, media | `/mcp/project-sorter` ([shot](screenshots/tools/mcp_project_sorter.jpg), [shot 2](screenshots/tools/mcp_project_sorter_2.jpg)) |
  | Create VFX composites in After Effects (/Shot-Composer) | Composites with matched light, depth and grain | Footage, layers, target look | `/mcp/shot-composer` ([shot](screenshots/tools/mcp_shot_composer.jpg), [shot 2](screenshots/tools/mcp_shot_composer_2.jpg)) |
  | Remove unwanted objects in After Effects (/Shot-Cleanup) | Tracked cleanup of objects you name | Shot, objects to remove | `/mcp/shot-cleanup` ([shot](screenshots/tools/mcp_shot_cleanup.jpg), [shot 2](screenshots/tools/mcp_shot_cleanup_2.jpg)) |
  | Convert images to vectors in Illustrator (/Vectorize) | Raster art to an organized, editable AI file | Raster illustration | `/mcp/vectorize` ([shot](screenshots/tools/mcp_vectorize.jpg), [shot 2](screenshots/tools/mcp_vectorize_2.jpg)) |
  | Clean up images in Photoshop (/Image-fixer) | Masked retouching of generated locations, saved as PSD | Image, fixes wanted | `/mcp/image-fixer` ([shot](screenshots/tools/mcp_image_fixer.jpg), [shot 2](screenshots/tools/mcp_image_fixer_2.jpg)) |
  | Create visual effects in TouchDesigner | Editable effect network for an image or video | Source media, style reference, format, duration | `/mcp/use-touchdesigner` ([shot](screenshots/tools/mcp_use_touchdesigner.jpg), [shot 2](screenshots/tools/mcp_use_touchdesigner_2.jpg)) |
  | Color grade footage in DaVinci Resolve | Balanced grade with an organized node tree | Footage, visual references | `/mcp/color-grading` ([shot](screenshots/tools/mcp_color_grading.jpg), [shot 2](screenshots/tools/mcp_color_grading_2.jpg)) |
  | Paid Ads Bundle (/marketing) | Picks one of the 8 paid-ads workflows above for the brief | Product, audience, goals, assets | `/mcp/bundles/paid-ads-bundle` ([shot](screenshots/tools/mcp_bundles_paid_ads_bundle.jpg), [shot 2](screenshots/tools/mcp_bundles_paid_ads_bundle_2.jpg)) |
  | Production Skills Bundle | Picks one of the 11 production workflows above | Brief, assets, tools, format, duration | `/mcp/bundles/production-skills` ([shot](screenshots/tools/mcp_bundles_production_skills.jpg), [shot 2](screenshots/tools/mcp_bundles_production_skills_2.jpg)) |
  | Motion Design Bundle (/use-after-effects) | Picks one of the After Effects workflows above | Brief, assets, format, duration | `/mcp/bundles/motion-bundle` ([shot](screenshots/tools/mcp_bundles_motion_bundle.jpg), [shot 2](screenshots/tools/mcp_bundles_motion_bundle_2.jpg)) |

  - Supercomputer has its own skill catalog with names that are not on these pages: Product UGC, Higgsfield Faceless Video, Shorts Maker, YouTube Covers, Personal Clipper, Brandkit and Website Building.
  - Help says the CLI skills and Supercomputer skills are separate systems.
- **Models:** varies by skill. The pages do not name generation models.
- **Route(s):** the 41 routes in the table
- **Notes for ComfyField:** Our formats are a ready skill catalog. Publishing each format as an MCP prompt, with its own page, would match this at low cost.

### Platform: Home

![Home](screenshots/tools/home.jpg)
![Home, lower page](screenshots/tools/home_2.jpg)

- **What it does:** The Explore landing page. Its top row shows the current launches: Wan 3.0 Unlimited, Higgsfield Genjutsu, Genjutsu API, Higgsfield Katana and "Ads Studio: Ad Multiplier". Below that are tiles for Seedance 2.5, AI Influencer, Genjutsu, MCP for Claude, Cinema Studio 4.0 and Supercomputer. Long promo sections follow: AI Influencer, ChatGPT Dots with MCP, a visual effects strip, Genjutsu, projects, Supercomputer, "One canvas. Every workflow." and Photodump.
- **How it works and how to use it:**
  1. Browse the cards.
  2. Open a tool from its card, or from the top bar. The bar holds Explore, Image, Video, Audio, MCP, API, Genjutsu, Katana, AI Influencer, ChatGPT Plugin, Ads Studio, Effects, Cinema Studio, Contests, Marketing Studio, Supercomputer, 3D Jutsu, Edit, Academy, Community, Plugins, Canvas, Originals, Pricing and Enterprise.
- **Inputs, settings and limits:**
  - A sign-up offer promises an extra discount, unlimited Nano Banana Pro and access to Seedance 2.5.
  - The page claims 25 million creators.
- **Models:** 36 model names appear on the page, including Seedance 2.5, Wan 3.0, Nano Banana Pro, GPT Image 2, Kling, Veo 3.1 and Sora 2.
- **Route(s):** `/`
- **Notes for ComfyField:** None needed. Our Create page is the home page by design.

### Platform: Creative app plugins

![Plugins, After Effects](screenshots/tools/plugins_after_effects.jpg)
![Plugins, lower page](screenshots/tools/plugins_after_effects_2.jpg)

- **What it does:** Higgsfield panels inside Photoshop, After Effects, Premiere Pro, DaVinci Resolve, Figma and Blender, each with a tab on the page. The capture shows the After Effects tab.
- **How it works and how to use it** (page, After Effects tab):
  1. Download the .dmg for macOS or the .zxp for Windows. One installer covers all the plugins.
  2. Run the installer. It finds After Effects automatically.
  3. In After Effects, open Window, then Extensions, then Higgsfield.
- **Inputs, settings and limits:**
  - Premiere Pro and After Effects tools:
    - Generate video and Generate image, which drop into the timeline
    - Reframe to 9:16, 16:9, 4:3, 3:4, 21:9 or 1:1, with subject tracking
    - Remove background, with an alpha channel
    - Draw to edit: inpaint by sketching on the frame
    - Upscale to 4K or 8K
    - Edit Video by prompt
  - Help lists per-app features:
    - Photoshop: Realtime AI, Layer Decompose, Mockup Studio, Angles, Shots, Character Swap, Skin Enhancer and AI Stylist, with Cinema Studio and Marketing Studio inside
    - DaVinci Resolve: Color Match and Import to Resolve
    - Figma: SVG generation and Mockup Studio
    - Blender: Scene Builder, 3D Model, Character Animation, Camera and Asset tabs
    - Minecraft: a mod
  - The page also offers an MCP bridge (`bridge.higgsfield.ai/mcp`) and Supercomputer inside the plugins.
  - The page says Adobe 2025 or newer; help says 2024 or newer.
- **Models:** Defaults are Nano Banana 2 for images and Seedance 2.0 for video (help). The page also names Gemini Omni Flash and Seed Audio 1.0.
- **Route(s):** `/plugins/after-effects`
- **Notes for ComfyField:** We have no editor plugins. They are low priority; our MCP server lets any agent with editor access call us.

### Platform: Higgsfield API

![Higgsfield API](screenshots/tools/higgsfield_api.jpg)
![Higgsfield API, lower page](screenshots/tools/higgsfield_api_2.jpg)

- **What it does:** "Open Higgsfield", a developer API. One key gives access to 50+ video and image models, paid in US dollars from a prepaid balance, separate from any plan.
- **How it works and how to use it** (page and help: "Higgsfield API"):
  1. Sign up at open.higgsfield.ai and fund the balance (minimum $5).
  2. Create a key. It is shown only once, and it unlocks 20 concurrent requests.
  3. POST to a model endpoint such as `api.higgsfield.ai/bytedance/seedance-2.0/text-to-video`, with the header `Authorization: Key id:secret`. Python and TypeScript SDKs are available.
  4. Poll for status or receive a webhook, then download the output. Files are kept for at least 7 days.
- **Inputs, settings and limits:**
  - Video is billed per second, images per image, and DoP per generation.
  - An estimate endpoint returns the price before you run.
  - Failed jobs are refunded. Funds expire after one year.
  - The page shows code tabs for API, Claude Code, Codex, Cursor, MCP, TypeScript, Python and cURL.
  - Offers: "Pick any 4 models, save up to 50%", 15% off for new sign-ups, and $15 credit. The changelog adds tiered cashback.
  - Seedance 2.5 shows at $0.144 per second against a list price of $0.2057.
  - Template sections: Content factory, Fashion photoshoots, Cinematic pipeline.
  - There are no standalone audio models.
- **Models:** the catalog includes Seedance 2.5 and 2.0, Genjutsu, Kling 3.0, O3, 2.6, O1 and 2.5, MiniMax H3 and Hailuo 2.3, Wan 3.0, 3.0 Prime, 2.7 and 2.6, LTX 2.5 Fast and Pro, Grok Imagine Video 1.5 and 2.0, Happy Horse 1.0 and 1.1, PixVerse 6, Ideogram 4.0, Recraft 4.1, Qwen Image 3, Z-Image Turbo, Soul 2, Soul Standard, Cinema Studio 4.0, Marketing Studio Image and Ads Studio.
- **Route(s):** `/higgsfield-api`
- **Notes for ComfyField:** We are bring-your-own-key. Comfy API and Comfy Router are our equivalent pay-per-use path, and `estimateCost` already shows prices before a run.

### Platform: Pricing

![Pricing](screenshots/tools/pricing.jpg)
![Pricing, compare table](screenshots/tools/pricing_2.jpg)

- **What it does:** Shows plans, credits, free-generation pools and time-limited unlimited windows. A toggle switches between Individual and Business plans, and another between Monthly and Annual.
- **How it works and how to use it:**
  1. Pick Individual or Business, and monthly or annual (annual saves up to 30%).
  2. Optionally answer "Not sure which plan?": what you make, how many items a month, and which features you need. It then recommends a plan.
  3. Compare features in the table.
- **Inputs, settings and limits** (annual prices):

  | Plan | Price | Credits a month | Example output |
  |---|---|---|---|
  | Starter | €19/mo | 270 | 135 Nano Banana Pro images or about 15 Seedance 2.0 Fast videos |
  | Plus | €47/mo (€59 monthly) | 1,200 | 600 Nano Banana Pro images or about 80 Seedance 2.5 videos |
  | Ultra | €99/mo (€129 monthly) | 3,000 to 9,000 (slider) | 1,500 Nano Banana Pro images or about 200 Seedance 2.5 videos |
  | Teams | From €65 per seat | Pooled, up to 37,500 | 2 to 15 seats, 1,000 credits per seat |

  - Free generation pools: AI Influencer gives 10 on Starter and 30 on Plus and Ultra. Ads Studio gives 10 on every plan. Genjutsu gives 3 at 720p on Plus and Ultra.
  - Seven-day unlimited windows on Plus and Ultra: Wan 3.0, Nano Banana 2 at 2K and Kling 3.0. Ultra adds Nano Banana Pro at 2K.
  - Business plans add 30 days of unlimited Seedance 2.5, SLA capacity, SSO, analytics, admin spend control and a priority queue.
  - Starter allows 2 video and 4 image jobs at a time. Higher plans allow unlimited paid parallel jobs.
  - Unlimited and free generations apply only on higgsfield.ai, not in MCP, the CLI, Canvas or Supercomputer.
  - The recommender's examples cost about 14 credits for a Kling 3.0 clip (8 seconds, 720p) and 2 credits for a Nano Banana Pro image.
- **Models:** 42 model names appear in the compare table.
- **Route(s):** `/pricing`
- **Notes for ComfyField:** ComfyField is free, and users pay providers directly. Per-run cost estimates are our counterpart to the credit labels on Higgsfield's Generate buttons.

### Platform: Team plan

![Team plan](screenshots/tools/team_plan.jpg)
![Team plan, lower page](screenshots/tools/team_plan_2.jpg)

- **What it does:** A shared workspace for creative teams, with shared folders, roles and permissions, real-time collaboration on prompts and generations, and a pooled credit balance.
- **How it works and how to use it** (page):
  1. Create or join a team workspace.
  2. Invite colleagues.
  3. Share and organize content in personal or shared folders.
- **Inputs, settings and limits:**
  - The page claims SOC 2 and ISO 42001 alignment and GDPR compliance.
  - It also claims 100,000+ teams, "10X faster" production and $12K saved per piece.
  - It quotes OpenAI's head of startups about the Sora API.
- **Models:** the page names many models; there is nothing tool-specific.
- **Route(s):** `/team-plan`
- **Notes for ComfyField:** Out of scope for a local-first app.

### Platform: Enterprise

![Enterprise](screenshots/tools/enterprise.jpg)
![Enterprise, lower page](screenshots/tools/enterprise_2.jpg)

- **What it does:** The enterprise sales page. Its meta description promises unlimited seats, 10 times the concurrent capacity and SOC 2-aligned security. The page has sections on 50+ models, Marketing Studio, Cinema Studio, MCP and CLI, the agentic engine, Canvas, Character Studio, workspace admin, data and compliance, and dedicated support.
- **How it works and how to use it:**
  1. Read the case studies.
  2. Fill in the contact form: name, company, title, email, website and reason. The reasons are Enterprise plan, Partnership inquiry, API Integration and Customer support/Other.
- **Inputs, settings and limits:**
  - The page claims 390 of the Fortune 500.
  - Customer quotes come from studios behind Netflix, Nestlé, Lacoste, Toyota and Madonna campaigns.
- **Models:** 21 model names appear on the page.
- **Route(s):** `/enterprise`
- **Notes for ComfyField:** Out of scope.

### Platform: Academy

![Academy](screenshots/tools/academy.jpg)

- **What it does:** A learning hub with chaptered video courses and a copyable prompt bank. The page is organized by category: Movie making, UGC & Social Content, and Automate & Agents.
- **How it works and how to use it:**
  1. Pick a course and press Start now for free. Prompts appear as you watch.
  2. Or open the Prompt bank, copy a prompt, or press Recreate to run it.
- **Inputs, settings and limits:**
  - Courses:
    - Blockbuster 4K: 40 minutes, 10 modules
    - Ultra-Realistic Short Film in 4K: 33 minutes, 19 modules, using Claude Fable 5 and Seedance 2.0
    - Add AI VFX to Real Footage: 12 minutes, 11 modules
    - Make an AI Animated Short: 17 minutes, 11 modules
  - The prompt bank's Camera group alone has 46 examples (static, pan, tilt, zoom, dolly zoom, rack focus, crane, drone orbit and more).
- **Models:** 19 model names appear on the page.
- **Route(s):** `/academy`
- **Notes for ComfyField:** A prompt bank tied to formats would be cheap to add. `writePrompts` already drafts prompts.

### Platform: Community

![Community](screenshots/tools/community.jpg)

- **What it does:** A showcase and social layer. Its tabs are Discovery, Projects, Shots, Creators, Contests and Originals.
- **How it works and how to use it:**
  1. Browse the featured projects and creators.
  2. Open a project to see how it was made.
  3. Submit your own work for a grant.
- **Inputs, settings and limits:**
  - Featured creators carry ratings.
  - Higgsfield Grants give up to 200K credits a month to selected projects.
  - Open projects show view counts.
  - The page links to the Creator Partnership Program, Creator Hub and Discord, which has live Community Stage sessions.
- **Models:** Seedance 2.0 is named in a featured project.
- **Route(s):** `/community`
- **Notes for ComfyField:** Out of scope.

### Platform: Contests and Global Film Festival

![Contests](screenshots/tools/contests.jpg)
![Global Film Festival](screenshots/tools/contests_higgsfield_global_film_festival.jpg)

- **What it does:** Prize contests that keep creators generating. The current one is the Global Film Festival, with a $1,000,000 pool and 14 winners.
- **How it works and how to use it:**
  1. Open a contest and read its rules.
  2. Make your entry in a contest project, usually in Cinema Studio.
  3. Submit it, then watch the voting and the jury review.
- **Inputs, settings and limits:**
  - Recent contests: The Adathon ($85,000 in credits, July 27 to August 24), the Higgsfield Apps Contest ($100,000) and Make Your Action Scene ($500,000, 8,752 projects).
  - The festival page has General, Timeline, Rules and Submissions tabs and a Shortlist filter.
  - Festival voting is closed, and winners are due the last week of October.
- **Models:** not stated.
- **Route(s):** `/contests` (redirects to `/community/contests`), `/contests/higgsfield-global-film-festival`
- **Notes for ComfyField:** Out of scope.

### Platform: Original Series

![Original Series](screenshots/tools/original_series.jpg)
![Original Series, lower page](screenshots/tools/original_series_2.jpg)

- **What it does:** A streaming page for AI-made series. Rows are Higgsfield Choice, First Look, On Our Radar and Coming Soon, each with "Notify on release". Contest winners are invited to make full series with the Higgsfield team.
- **How it works and how to use it:**
  1. Watch the episodes.
  2. Follow upcoming series.
  3. Enter a contest for a chance to produce one.
- **Inputs, settings and limits:** the page lists the top three winners and honorable mentions, and carries a Seedance 2.5 discount banner.
- **Models:** Seedance 2.5, named in the promo.
- **Route(s):** `/original-series`
- **Notes for ComfyField:** Out of scope.

### Platform: Earn

![Earn](screenshots/tools/earn.jpg)
![Earn, lower page](screenshots/tools/earn_2.jpg)

- **What it does:** A creator program that pays for views of AI videos posted on social media. It is pitched at AI influencer accounts.
- **How it works and how to use it:**
  1. Log in and connect a social account. Ownership is verified instantly.
  2. Pick a campaign, download its assets and post a video.
  3. Paste the post link into the dashboard so it can be tracked.
  4. Get paid in three tiers: per approved video, plus a 24-hour bonus and a 7th-day bonus.
- **Inputs, settings and limits:**
  - Each campaign has guidelines and a payout cap.
  - The page claims a 130% earnings boost.
- **Models:** not stated.
- **Route(s):** `/earn`
- **Notes for ComfyField:** Out of scope.

### Platform: Creator Partnership Program

![Creator Partnership Program](screenshots/tools/creator_partnership_program.jpg)
![Creator Partnership Program, lower page](screenshots/tools/creator_partnership_program_2.jpg)

- **What it does:** An application page for sponsored creators. Partners get a full plan renewed monthly, extra credits for films, early model access, an affiliate program, features on Higgsfield channels, a dedicated contact and a partner community in 35+ countries.
- **How it works and how to use it:**
  1. Fill in the form: first name, Discord username, platforms, audience size and country.
  2. Wait for review.
- **Inputs, settings and limits:**
  - Platforms: YouTube, Instagram, X, TikTok, LinkedIn, Reddit, Blog or Other.
  - Audience buckets run from under 5K to 500K+.
- **Models:** none named.
- **Route(s):** `/creator-partnership-program`
- **Notes for ComfyField:** Out of scope.

### Platform: Draft landing pages

![Sandbox draft](screenshots/tools/sandbox.jpg)
![Previews draft](screenshots/tools/previews.jpg)

- **What it does:** Two live but unlinked landing-page drafts. They show what the CMS is testing.
  - Sandbox is titled "AI video generatorr", with a typo, lorem-ipsum community cards, placeholder headings such as "test title" and "TITTERWER", and a "Higgsfield for Good" student application form.
  - Previews is an image-editing landing ("Create anything you can imagine") with sections for object remover, background generator, photo restorer and upscaler.
- **How it works and how to use it:** both pages put a working-looking prompt bar on the hero: a prompt, a model chip, a duration or ratio chip and a Generate button.
- **Inputs, settings and limits:**
  - The Sandbox bar uses Kling 3.0 Omni Edit, with 3 to 10 second durations and 1:1, 16:9 or 9:16 ratios.
  - The Previews bar uses Nano Banana Pro, with ratios Auto, 1:1, 3:4, 4:3, 2:3, 3:2, 9:16, 16:9, 5:4, 4:5 and 21:9.
  - Both pages show a partner logo strip: Black Forest Labs, ByteDance, KlingAI, MiniMax, Wan, fal, Grok, Anthropic, OpenAI and Google. The fal logo suggests that some inference runs through fal, the same provider ComfyField uses.
- **Models:** Kling 3.0 Omni Edit and Nano Banana Pro. Previews also lists Seedream, FLUX, GPT Image, Kling O1 Image, Reve and Higgsfield Soul for editing.
- **Route(s):** `/sandbox` ([shot 2](screenshots/tools/sandbox_2.jpg)), `/previews` ([shot 2](screenshots/tools/previews_2.jpg))
- **Notes for ComfyField:** No product feature here, but it is a useful hint about Higgsfield's suppliers.

---

## Apps (100)

On Higgsfield an app is a single-purpose tool with its own page under `/apps/<name>`. Each does one job. You upload a photo, a product shot or a clip, sometimes pick a preset or type a line, and press one Generate button that shows the credit cost. Almost none ask for a prompt. The capture holds 100 pages: 92 app pages and 8 category hubs. The `/apps` catalog has a search box, an All tab and eight category tabs, and the hubs list 84 apps between them: Professional (route `/apps/camera-motion`, 9), Enhance and style (8), Face and identity (6), Video editing (6), Ads and products (20), Games and characters (10), Extras (5) and Trending templates (20). The hub lists Click to Ad as `/apps/link-to-video-ad`, and the captured `/apps/click-to-ad` redirects into Marketing Studio's link-to-ad tool. Eight captured apps sit on no hub. This section files ASMR Promo under Ads and products and the other seven (GTAI, 3D Rotation, Mugshot, Ghoulgao, Social Media Icon, Idol, Banana Eating) under Trending templates, because they use the template page and the creator chip. They are marked with an asterisk. That makes the working counts 9, 8, 6, 6, 21, 10, 5 and 27.

Outputs lean to video. 24 apps make only images, 11 make only video and 56 have a "Generation type" switch with image and video icons. Of those 56, 55 start on video and Face Swap starts on image. Virality Predictor returns a score, not media. In the Output column, "video / image" means that switch, starting on video. Credits follow the output: image apps cost 1 to 2 credits (Angles 0.2), the game-character videos 6, the effect and ad templates 15 to 26, the ASMR apps 23, and Sticker Match Cut and Video Face Swap 25. The tables write credits as "cr".

Nearly every app page uses the same two-column card. On the left are the title, a one-line pitch, dashed upload boxes that take a PNG, a JPG or a paste, and sometimes picker tiles (Select style, Choose game style, Select animal) or a text field (billboard text, what the character says). Below them sit the image or video switch and a lime Generate button with the credit cost. On the right an example plays, with its input as a small thumbnail in the corner, so the page works as a before and after. Further down the page come an "Explore more apps" grid, a three-step explainer, feature blurbs, an FAQ and pricing. Four layouts differ. Angles and Relight open a canvas with a control panel on the right: an orbit sphere and sliders, or a light grid and a drag pad. Shots, Zooms and What's Next run a three-step wizard: upload, pick from a grid, upscale to 4K. Meme Generator shows a character grid next to a text canvas, and Click to Ad opens Marketing Studio. Catalog cards carry PRO, NEW or TRENDING badges. Above the title, 30 template pages show a creator handle chip (velquix, zyvora or ombrika, for example), which suggests that named creators made those presets.

App pages almost never name a model. The only mentions are an example caption on Transitions (Kling), the Meme Generator characters (Soul Cinema), and Angles 2.0 and Recast, which are Higgsfield's own tool names. Blog images about the viral apps carry "nano banana pro" alt text, which is a hint, not a statement. Everywhere else the Model column says "not stated". Higgsfield's newer help and blog pages also use "Apps" for apps that users build in Supercomputer and publish at their own subdomain (the blog counts 500+). Those belong to Supercomputer, which the Tools and studios section covers. This section covers the first-party catalog under `/apps`.

The ComfyField column names the format in `src/lib/formats/` that does the same job. A note in brackets says where it falls short. "fal" means only the fal recipe covers the app, not open weights. "image only" means ComfyField makes a still where Higgsfield starts on video. "close" means a neighboring format does the job with a different framing. Covered means the format is defined. Most open formats are not wired yet: `readyWorkflows` lists only `image_flux`, `image_sdxl` and `video_ltx`.

### Every app

| Category | App | Output | What it does | Inputs and settings | Model | ComfyField coverage | Shot |
|---|---|---|---|---|---|---|---|
| Professional | Angles 2.0 | image | Re-renders a photo from a camera position you pick, back views included | Photo; orbit sphere; rotation, tilt and zoom sliders; "12 best angles" batch; 0.2 cr | not stated (own tool) | `new-angle` (fal) | [shot](screenshots/apps/apps_angles.jpg) |
| Professional | What's Next? | image | Suggests 8 possible next scenes for one still | Photo; wizard: upload, pick variations, upscale to 4K | not stated | missing | [shot](screenshots/apps/apps_whats_next.jpg) |
| Professional | Shots | image | Makes a 3x3 grid of cinematic angles of one scene | Photo; wizard: upload, grid, upscale to 4K | not stated | `nine-shots` (fal) | [shot](screenshots/apps/apps_shots.jpg) |
| Professional | Zooms | image | Makes 9 framings of one image, from close detail to wide | Photo; wizard: upload, grid, upscale | not stated | missing | [shot](screenshots/apps/apps_zooms.jpg) |
| Professional | Behind the Scenes | video / image | Pulls back to reveal a film crew and rigs around your photo | Photo; type switch; 6 cr | not stated | `behind-the-scenes` (image only) | [shot](screenshots/apps/apps_behind_the_scenes.jpg) |
| Professional | Transitions | video | Joins two clips or stills with a transition you choose | Two clips or images; effect library; ratio follows the first clip; 6 cr | Kling (example caption) | `transition` (stills only) | none |
| Professional | Expand image | image | Outpaints a picture to a wider or taller ratio | Photo; ratio picker (21:9 shown); 2 cr | not stated | `expand` | [shot](screenshots/apps/apps_expand_image.jpg) |
| Professional | Color grading | image | Grades a still with presets and sliders in a live preview | Photo; presets (Natural, Split Tone, Soft Skin, Old Lens, 16mm and more); temperature, contrast, saturation, highlights, exposure, sharpness, grain; free | not stated (browser preview) | `color-grade` (video only) | [shot](screenshots/apps/apps_color_grading.jpg) |
| Professional | Virality Predictor | score | Rates how well a short clip holds attention | Clip up to 15 s; returns a score, peak hook time, hold rate and a brain heatmap | not stated | `hook-check` | [shot](screenshots/apps/apps_virality_predictor.jpg) |
| Enhance and style | AI Stylist | image | Dresses you from outfit presets or item by item, with pose and background presets | Photo; whole outfit or six garment slots; pose preset; background preset | not stated | `try-on` (no presets) | [shot](screenshots/apps/apps_ai_stylist.jpg) |
| Enhance and style | Relight | image | Moves a virtual light around a photo | Photo; six quick positions; drag pad; soft or hard; brightness; hex color; 2 cr (blog) | not stated | `relight` (fal) | [shot](screenshots/apps/apps_relight.jpg) |
| Enhance and style | Skin Enhancer | image | Retouches skin and rebuilds face detail, keeping texture | Portrait; Soft, Realistic or Imperfect skin; optional filters | not stated | `skin-retouch` | [shot](screenshots/apps/apps_skin_enhancer.jpg) |
| Enhance and style | Outfit Swap | image | Moves the clothes from one photo onto the person in another | Your image; outfit image; 2 cr | not stated | `try-on`; `outfit-swap` (fal) | [shot](screenshots/apps/apps_outfit_swap.jpg) |
| Enhance and style | Style Snap | image | Swaps your outfit for a preset look, keeping pose and background | Photo; style picker (14 per blog); 2 cr | not stated | missing | [shot](screenshots/apps/apps_style_snap.jpg) |
| Enhance and style | Outfit Vending (`/apps/vending-machine`) | image | Lays out each item you wear inside a lit vending machine | Photo; 2 cr | not stated | missing | [shot](screenshots/apps/apps_vending_machine.jpg) |
| Enhance and style | Glitter Sticker | image | Cuts you out as a rainbow-foil sticker on a street surface | Photo; 2 cr | not stated | `sticker` (Holographic) | [shot](screenshots/apps/apps_glitter_sticker.jpg) |
| Enhance and style | Outfit Shot | video / image | Puts up to 3 garments on an AI model for a photoshoot | Up to 3 clothing images; type switch; 19 cr | not stated | missing | [shot](screenshots/apps/apps_outfit_shot.jpg) |
| Face and identity | Recast | video | Replaces the person in a video with your character | Video; character photo; per blog also character presets, voice clone, dubbing, backgrounds | Higgsfield Recast | `motion-transfer` (no voice or backgrounds) | none |
| Face and identity | Character Swap 2.0 | image | Puts your whole character into another photo's pose and scene | Your photo; target image; 2 cr | not stated | `character-swap` | [shot](screenshots/apps/apps_character_swap.jpg) |
| Face and identity | Face Swap | image / video | Puts a source face onto a target photo | Target image; face photo; type switch (starts on image); 2 cr | not stated | `face-swap` | [shot](screenshots/apps/apps_face_swap.jpg) |
| Face and identity | Commercial Faces | image | Signs you up to license your likeness to brands, from a selfie | Selfie; terms notice; 2 cr | not stated | missing | [shot](screenshots/apps/apps_commercial_faces.jpg) |
| Face and identity | Video Face Swap | video | Swaps a face across every frame of a clip | Target video; face photo; type switch; 25 cr | not stated | `face-swap-video` | [shot](screenshots/apps/apps_video_face_swap.jpg) |
| Face and identity | Headshot Generator (`/apps/ai-headshot-generator`) | image | Turns a selfie into a studio headshot | Selfie; 1 cr | not stated | `headshot` | [shot](screenshots/apps/apps_ai_headshot_generator.jpg) |
| Video editing | ClipCut | video | Turns one selfie into a beat-cut reel of several outfits | Selfie; no controls captured | not stated | missing | [shot](screenshots/apps/apps_clipcut.jpg) |
| Video editing | Urban Cuts | video | Builds a 10 s outfit video cut to the beat of a track | Photo; outfit image or 40+ presets; 30+ tracks or your own; five ratios | not stated | missing | [shot](screenshots/apps/apps_urban_cuts.jpg) |
| Video editing | Sticker Match Cut | video | Turns the person in a clip into a glittery sticker cutout | Video with one person; 25 cr | not stated | missing | [shot](screenshots/apps/apps_sticker_matchcut.jpg) |
| Video editing | Breakdown | image | Lays out a photo's parts with labels, or spots brands and prices | Photo; 2 cr | not stated | missing | [shot](screenshots/apps/apps_breakdown.jpg) |
| Video editing | Japanese Show | image | Puts you on a retro Japanese TV variety set with captions | Photo; 2 cr | not stated | `game-show` (close) | [shot](screenshots/apps/apps_japanese_show.jpg) |
| Video editing | Video Background Remover | video | Removes the background from every frame | MP4 or MOV; 1 cr | not stated | `video-bg-remove` | [shot](screenshots/apps/apps_video_background_remover.jpg) |
| Ads and products | Click to Ad (`/apps/link-to-video-ad`) | video or image | Turns a product link into ads and UGC inside Marketing Studio | Product URL; template tabs (Product shot, Motion, UGC, TikTok, Ads, Posters, Marketplace) | not stated | `link-to-ads` (images only) | [shot](screenshots/apps/apps_click_to_ad.jpg) |
| Ads and products | ASMR Add-On | video | Your character whispers about your product in an ASMR clip | Character image; product image; line to say; 23 cr | not stated | `ugc-ad` (close) | [shot](screenshots/apps/apps_asmr_add_on.jpg) |
| Ads and products | ASMR Classic | video | Animates a photo into a whispering ASMR clip, image unchanged | Photo; 23 cr | not stated | missing | [shot](screenshots/apps/apps_asmr_classic.jpg) |
| Ads and products | Poster | video / image | Recasts a product as a bold promo poster | Product image; type switch; 15 cr | not stated | missing | [shot](screenshots/apps/apps_poster.jpg) |
| Ads and products | Bullet Time Scene | video / image | Freezes and orbits the product in a background themed to it | Product image; type switch; 15 cr | not stated | `packshot` (Scene) | [shot](screenshots/apps/apps_bullet_time_scene.jpg) |
| Ads and products | Chameleon | video / image | A chameleon shifts its skin to your product's colors | Product image; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_chameleon.jpg) |
| Ads and products | ASMR Host | video | Turns a photo into a presenter whispering to camera in an ASMR studio | Photo; 23 cr | not stated | missing | [shot](screenshots/apps/apps_asmr_host.jpg) |
| Ads and products | Packshot | video / image | Makes a clean hero frame of the product to end an ad | Product image; type switch; 16 cr | not stated | `product-shot` (image only) | [shot](screenshots/apps/apps_packshot.jpg) |
| Ads and products | Macro Scene (`/apps/macroshot-scene`) | video / image | Shows product details in macro inside a generated lifestyle set | Product image; type switch; 15 cr | not stated | missing | [shot](screenshots/apps/apps_macroshot_scene.jpg) |
| Ads and products | Magic Button | video / image | Drops the product into a lively, whimsical commercial scene | Product image; type switch; 26 cr | not stated | missing | [shot](screenshots/apps/apps_magic_button.jpg) |
| Ads and products | Truck Ad | video / image | Wraps your product or logo on a truck driving through a city | Image; text field; type switch; 19 cr | not stated | `truck-ad` | [shot](screenshots/apps/apps_truck_ad.jpg) |
| Ads and products | Giant Product | video / image | Shows the product towering over a skyline from above | Product image; type switch; 19 cr | not stated | `street-giant` (close) | [shot](screenshots/apps/apps_giant_product.jpg) |
| Ads and products | Bullet Time White | video / image | Spins around the product in bullet time on white | Product image; type switch; 15 cr | not stated | `packshot` (White) | [shot](screenshots/apps/apps_bullet_time_white.jpg) |
| Ads and products | Kick Ad | video / image | Your product wins as a rival product gets kicked away | Product image; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_kick_ad.jpg) |
| Ads and products | Billboard Ad (`/apps/billboard`) | video / image | Puts the photo on a giant city billboard in a timelapse | Image; billboard text; type switch; 16 cr | not stated | `billboard` (image only) | [shot](screenshots/apps/apps_billboard.jpg) |
| Ads and products | Graffiti Ad | video / image | Sprays the product onto a city wall as graffiti | Product image; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_graffiti_ad.jpg) |
| Ads and products | Bullet Time Splash | video / image | Bursts the product into fragments in slow-motion bullet time | Product image; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_bullet_time_splash.jpg) |
| Ads and products | Fridge Ad | video / image | A fridge opens and a hand takes your product out | Product image; type switch; 15 cr | not stated | missing | [shot](screenshots/apps/apps_fridge_ad.jpg) |
| Ads and products | Volcano Ad | video / image | Sets the product against an erupting volcano | Product image; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_volcano_ad.jpg) |
| Ads and products | Macroshot Product | video / image | Films the product in extreme close-up | Product image; type switch; 15 cr | not stated | missing | [shot](screenshots/apps/apps_macroshot_product.jpg) |
| Ads and products | ASMR Promo* | video | Builds a scripted ASMR studio scene around your product | Character image; product image; script; 23 cr | not stated | `ugc-ad` (close) | [shot](screenshots/apps/apps_asmr_promo.jpg) |
| Games and characters | Game Dump | image | Recasts you as a hero in one of 12 game styles, or all 12 | Photo; game style tiles; "all 12" checkbox; 2 cr | not stated | `game-style` | [shot](screenshots/apps/apps_game_dump.jpg) |
| Games and characters | Nano Strike | video / image | Turns 1 to 5 people into a tactical-shooter squad | 1 to 5 photos; type switch; 6 cr | not stated | missing | [shot](screenshots/apps/apps_nano_strike.jpg) |
| Games and characters | Nano Theft | video / image | Renders you as an open-world crime game character | Photo; type switch; 6 cr | not stated | missing | [shot](screenshots/apps/apps_nano_theft.jpg) |
| Games and characters | Simlife | video / image | Shows you in a life-sim character creator, 3D rendered | Photo plus up to 2 garments; type switch; 6 cr | not stated | `life-sim` (image only) | [shot](screenshots/apps/apps_simlife.jpg) |
| Games and characters | Plushies | video / image | Turns the subject into a knitted plush toy, still or animated | Photo; type switch; Standard 768p (8 cr) or High 1080p (10 cr) | not stated | `plush-toy` (image only) | [shot](screenshots/apps/apps_plushies.jpg) |
| Games and characters | 3D Render | video / image | Renders the photo as a 3D object in a render scene | Photo; type switch; 16 cr | not stated | `turntable` (close) | [shot](screenshots/apps/apps_3d_render.jpg) |
| Games and characters | 3D Figure | video / image | Makes you a toy figure on a desk beside a 3D modeling screen | Photo; type switch; 15 cr | not stated | `figure-box` (image only) | [shot](screenshots/apps/apps_3d_figure.jpg) |
| Games and characters | Pixel Game | video / image | Your character runs through a retro 8-bit world | Photo; type switch; 16 cr | not stated | `game-style` 8-bit (image only) | [shot](screenshots/apps/apps_pixel_game.jpg) |
| Games and characters | Brick Cube | video / image | Rebuilds the photo as a colorful brick toy cube | Photo; type switch; 19 cr | not stated | `brick-toy` (image only) | [shot](screenshots/apps/apps_brick_cube.jpg) |
| Games and characters | Sketch-to-Real | video / image | Turns a drawing into a realistic scene | Sketch; type switch; 16 cr | not stated | `sketch-to-image` (image only) | [shot](screenshots/apps/apps_sketch_to_real.jpg) |
| Extras | Paint App | image | Frames your photo as a canvas in a 90s paint program on a CRT | Photo; 2 cr | not stated | missing | [shot](screenshots/apps/apps_paint_app.jpg) |
| Extras | Signboard | image | Shows your photo as a large mural on a city wall | Photo; 2 cr | not stated | `billboard` (close) | [shot](screenshots/apps/apps_signboard.jpg) |
| Extras | Micro-Beasts (`/apps/surrounded-by-animals`) | image | Surrounds you with small animals you pick | Photo; animal picker (15+); 1 cr | not stated | missing | [shot](screenshots/apps/apps_surrounded_by_animals.jpg) |
| Extras | AI Meme Generator | image | Builds a meme on a stock AI face or a prompt, with movable text and AI captions | Character tiles or prompt; text box; 5 caption ideas; free download | Soul Cinema (characters) | `meme` (your photo only) | [shot](screenshots/apps/apps_meme_generator.jpg) |
| Extras | Background Remover (`/apps/image-background-remover`) | image | Returns a transparent PNG cutout | Photo; 1 cr | not stated | `remove-background` (fal) | [shot](screenshots/apps/apps_image_background_remover.jpg) |
| Trending templates | Yes Kiss | video / image | A stranger plants a surreal meme kiss on the person in your photo | Photo; type switch; 19 cr | not stated | missing | [shot](screenshots/apps/apps_yes_kiss.jpg) |
| Trending templates | Latex | video / image | Restyles you in a glossy black latex outfit | Photo; type switch; 19 cr | not stated | missing | [shot](screenshots/apps/apps_latex.jpg) |
| Trending templates | J-Magazine | video / image | Puts you on a Japanese fashion magazine cover | Photo; type switch; 16 cr | not stated | `look-magazine-90s` (close) | [shot](screenshots/apps/apps_j_magazine.jpg) |
| Trending templates | Roller Coaster | video / image | Sends you down a roller coaster | Photo; type switch; 15 cr | not stated | `roller-coaster` | [shot](screenshots/apps/apps_roller_coaster.jpg) |
| Trending templates | 60s Cafe | video / image | Places you in a 1960s coffee shop | Photo; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_60s_cafe.jpg) |
| Trending templates | Victory Card | video / image | Prints you on a winning poker card | Photo; type switch; 15 cr | not stated | missing | [shot](screenshots/apps/apps_victory_card.jpg) |
| Trending templates | Sand Worm | video / image | Giant worms rise behind you in a desert | Photo; type switch; 26 cr | not stated | missing | [shot](screenshots/apps/apps_sand_worm.jpg) |
| Trending templates | Skibidi | video / image | Your head pops out of a toilet, meme style | Photo; type switch; 23 cr | not stated | missing | [shot](screenshots/apps/apps_skibidi.jpg) |
| Trending templates | J-Poster | video / image | Turns your photo into a Japanese-style poster with type | Photo; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_j_poster.jpg) |
| Trending templates | Mascot | video / image | Turns you into a football team mascot | Photo; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_mascot.jpg) |
| Trending templates | Storm Creature | video / image | A monster looms behind you in a lightning storm | Photo; type switch; 26 cr | not stated | missing | [shot](screenshots/apps/apps_storm_creature.jpg) |
| Trending templates | Burning Sunset | video / image | Sits you in a fiery sunset full of sparks | Photo; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_burning_sunset.jpg) |
| Trending templates | On Fire (`/apps/this-is-fine`) | video / image | Draws you calm in the burning-room meme | Photo; type switch; 19 cr | not stated | `all-fine` (image only) | [shot](screenshots/apps/apps_this_is_fine.jpg) |
| Trending templates | Comic Book | video / image | Tells a short comic story with panels and speech bubbles | Photo; type switch; 15 cr | not stated | `look-comic-book` (close) | [shot](screenshots/apps/apps_comic_book.jpg) |
| Trending templates | Cloud Surf | video / image | You surf across pink clouds | Photo; type switch; 16 cr | not stated | `cloud-surfing` | [shot](screenshots/apps/apps_cloud_surf.jpg) |
| Trending templates | Mukbang | video / image | You eat on camera with crash zooms | Photo; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_mukbang.jpg) |
| Trending templates | Melting Doodle | video / image | Your face melts away in hand-drawn doodle lines | Photo; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_melting_doodle.jpg) |
| Trending templates | Giallo Horror | video / image | A knife-wielding killer appears in a 70s Italian horror scene | Photo; type switch; 19 cr | not stated | missing | [shot](screenshots/apps/apps_giallo_horror.jpg) |
| Trending templates | Renaissance | video / image | Hangs you as a classical painting in a busy gallery | Photo; type switch; 15 cr | not stated | missing | [shot](screenshots/apps/apps_renaissance.jpg) |
| Trending templates | Rap God | video / image | Makes a rap video with generated lyrics and beat | Photo; type switch; 23 cr | not stated | missing | [shot](screenshots/apps/apps_rapgod.jpg) |
| Trending templates | GTAI* | video / image | You run, jump and take cars in an open-world game | Photo; type switch; 23 cr | not stated | missing | [shot](screenshots/apps/apps_gtai.jpg) |
| Trending templates | 3D Rotation* | video / image | Spins the photo as a 3D object through 360 degrees | Photo; type switch; 15 cr | not stated | `turntable` | [shot](screenshots/apps/apps_3d_rotation.jpg) |
| Trending templates | Mugshot* | video / image | Books you at a police station with height chart and placard | Photo; type switch; 16 cr | not stated | missing | [shot](screenshots/apps/apps_mugshot.jpg) |
| Trending templates | Ghoulgao* | video / image | Drops you into a ghoul horror clip | Photo; type switch; 15 cr | not stated | missing | [shot](screenshots/apps/apps_ghoulgao.jpg) |
| Trending templates | Social Media Icon* | video / image | Surrounds your photo with animated platform logos | Photo; type switch; 15 cr | not stated | missing | [shot](screenshots/apps/apps_social_media_icon.jpg) |
| Trending templates | Idol* | video / image | Puts you on stage as a pop idol | Photo; type switch; 15 cr | not stated | `photocard` (close) | [shot](screenshots/apps/apps_idol.jpg) |
| Trending templates | Banana Eating* | video / image | You calmly eat a banana in a plain scene | Photo; type switch; 15 cr | not stated | missing | [shot](screenshots/apps/apps_banana_eating.jpg) |

\* Not listed on any hub page; reachable by URL and from Higgsfield's marketing pages.

### Professional

These are nine camera and framing tools. The tab reads Professional although the route is `camera-motion`. Shots, Zooms and What's Next share one wizard that turns a still into a grid of options and then upscales your picks. Angles is a live 3D control. Transitions has a TRENDING badge, and no screenshot of its page was captured. It joins two clips or stills (photo to photo, video to video, or mixed) with an effect from a library, locks to the first clip's aspect ratio and costs 6 credits. Its examples carry the caption "Created with Kling Transition". ComfyField's `transition` covers stills with four styles (Morph, Whip pan, Zoom through, Match cut) but not video clips.

#### Angles 2.0

![Angles 2.0](screenshots/apps/apps_angles.jpg)

**What it does.** Re-renders a still from a camera position you choose, including side, top and back views, without a prompt. The output keeps the input's aspect ratio.

**How to use it.**
1. Upload a photo, a render or an AI image.
2. Set the view: drag the orbit sphere, move the Rotation, Tilt and Zoom sliders, or use a quick-select angle. The blog describes all three.
3. Optionally tick "Generate from 12 best angles" for a full set, and adjust brightness and color (added in version 2).
4. Press Generate. Past results stay in a history on the same page.

**Inputs and settings.** One image, orbit sphere, rotation and tilt in degrees, zoom, 12-angle batch, 0.2 credits.

**Model.** Not stated. Higgsfield calls the tool Angles 2.0.

**What ComfyField would need.** `new-angle` exists only as a fal recipe with six fixed angles. An open version would run `qwen_edit` with a camera-angle LoRA and take numeric azimuth, elevation and zoom from an orbit control. It would also need a batch option that saves a 12-angle contact sheet to the Library.

#### Shots

![Shots](screenshots/apps/apps_shots.jpg)

**What it does.** Turns one still into nine cinematic angles of the same scene, laid out as a grid, and upscales the frames you keep.

**How to use it.**
1. Upload one image.
2. Review the 3x3 grid.
3. Select your favorites and upscale them to 4K.

**Inputs and settings.** One image. No other settings or credit cost show when signed out.

**Model.** Not stated.

**What ComfyField would need.** `nine-shots` (fal, Nano Banana 2) returns the contact sheet but has no pick-and-upscale step. An open version could run `qwen_edit` once per shot size. The pick step fits Flows directly: an Approve node holds the grid and Send runs the upscale on the frames you chose.

#### What's Next?

![What's Next?](screenshots/apps/apps_whats_next.jpg)

**What it does.** Reads one frame and proposes eight different next moments in the story, with the same people and place.

**How to use it.**
1. Upload one image.
2. Browse the eight variations.
3. Select the ones you like and upscale them to 4K.

**Inputs and settings.** One image, then selection.

**Model.** Not stated.

**What ComfyField would need.** This is missing. `storyboard` starts from a text idea, not a frame. The pieces are already in the plan: Qwen3 (used by `explainer`) writes eight continuations from a caption, and `kontext_edit` renders each one with the cast kept. An Approve gate before upscaling would match the wizard.

#### Behind the Scenes

![Behind the Scenes](screenshots/apps/apps_behind_the_scenes.jpg)

**What it does.** Pulls back from your photo to show the set, with crew, cameras and rigs, as if it were a still from a film shoot. It makes a vertical video by default.

**How to use it.**
1. Upload or paste a photo.
2. Set Generation type to image or video.
3. Press Generate Video (6 credits).

**Inputs and settings.** One image and the type switch.

**Model.** Not stated.

**What ComfyField would need.** `behind-the-scenes` makes the still with `qwen_edit`. To match, it needs an optional video step that hands the still to `wan22_i2v` with the existing dolly-out move. ComfyField would gain the same image or video switch that 56 Higgsfield apps use.

#### Color grading

![Color grading](screenshots/apps/apps_color_grading_2.jpg)

**What it does.** Grades a still with film-style presets and fine sliders in a live preview. Higgsfield offers it free.

**How to use it.**
1. Upload a PNG or JPG.
2. Pick a preset (None, Natural, Split Tone, Soft Skin, Old Lens, 16mm and others).
3. Fine-tune temperature, contrast, saturation, highlights, exposure, sharpness and grain.
4. Download the graded image.

**Inputs and settings.** As above. The page meta mentions a real-time WebGL preview, and the FAQ says the same tool exists in Cinema Studio.

**Model.** None is named, and the live preview suggests no generative model.

**What ComfyField would need.** `color-grade` covers video through Wan VACE. Image grading needs no model at all: a canvas or WebGL filter on any Library image would match it locally and for free. The same preset names could seed `color-grade` so stills and clips share looks.

#### Virality Predictor

![Virality Predictor](screenshots/apps/apps_virality_predictor.jpg)

**What it does.** Scores a short clip's chance of holding viewers before you post it.

**How to use it.**
1. Drop in a clip up to 15 seconds long, vertical or horizontal.
2. The tool runs a modeled audience over it.
3. Read the virality score, the peak hook timestamp, an estimated hold rate and a brain-region heatmap.

**Inputs and settings.** One clip. No settings.

**Model.** Not stated. The page talks about modeled brain response across vision, sound, memory, attention and language.

**What ComfyField would need.** `hook-check` (Qwen3-VL) scores the first three seconds and suggests fixes. To match, it needs a per-second attention curve and one headline number. It should present the result as a model's opinion, not as a brain measurement.

### Enhance and style

These are eight image-first tools for faces, light and clothes. Relight, Skin Enhancer and AI Stylist did not render in the signed-out app capture. Relight's panel appears in the tools capture, and the steps for the other two come from Higgsfield's blog. Half the category is fashion: Outfit Swap takes a garment from a photo, Style Snap takes one from a preset, AI Stylist does both plus pose and background, and Outfit Shot puts garments on a generated model and starts on video.

#### Relight

![Relight](screenshots/tools/apps_relight.jpg)

**What it does.** Moves a virtual light around a photo and redraws the shadows to suit. The blog says it reads the scene's depth.

**How to use it.**
1. Upload a photo.
2. Pick a quick position (Top, Front, Right, Left, Back, Bottom), or drag on the pad to aim the light anywhere.
3. Choose Soft or Hard light.
4. Set brightness (0 to 100%, default 50%) and a light color by swatch or hex (default white).
5. Press Generate (2 credits, per Higgsfield's photo restoration post).

**Inputs and settings.** As above.

**Model.** Not stated.

**What ComfyField would need.** `relight` is a fal recipe on Nano Banana 2 with five mood presets (Golden hour, Studio softbox, Neon night, Window light, Moonlight). An open version needs an image relight workflow, such as IC-Light or a `qwen_edit` relight LoRA. Direction, softness, brightness and color controls would turn into prompt text or a light map. `video-relight` already covers clips.

#### AI Stylist

![AI Stylist card in the apps catalog](screenshots/tools/apps_2.jpg)

**What it does.** A virtual fitting room. It dresses you in a complete preset outfit or one garment at a time, then sets the pose and background.

**How to use it (from the blog).**
1. Open AI Stylist and upload your photo.
2. Pick a complete outfit preset, or build the look across six slots: headwear, outerwear, base, pants, footwear, accessories.
3. Optionally pick a pose preset.
4. Optionally pick a background preset.
5. Generate.

**Inputs and settings.** One photo, garment presets per slot, pose and background presets. The signed-out page did not render, so no credit cost was captured.

**Model.** Not stated.

**What ComfyField would need.** `try-on` (`qwen_edit_try_on`) takes a person, up to two garment photos and a fit. Matching AI Stylist means a garment Library type with body-zone slots, a set of outfit presets, and pose and background choices passed to the edit as text.

#### Skin Enhancer

![Skin Enhancer](screenshots/apps/apps_skin_enhancer.jpg)

**What it does.** Retouches portraits and rebuilds lost facial detail while keeping pores. It targets noise, blur, compression and uneven tone. The signed-out page showed only a loader, so these details come from the blog.

**How to use it.**
1. Open Skin Enhancer from Edit or Apps.
2. Upload a portrait with the face clearly visible.
3. Choose Soft skin, Realistic skin or Imperfect skin.
4. Optionally adjust filters such as softness, texture, lighting, color and eye clarity.
5. Generate, then compare with the before and after slider.

**Inputs and settings.** As above. No credit cost was captured.

**Model.** Not stated. The blog describes a diffusion model.

**What ComfyField would need.** `skin-retouch` (Kontext) offers Natural, Smooth and Glam. It needs a level that keeps imperfections, an upscale or restore pass first for blurry inputs, and a before and after compare in the Library.

#### Outfit Swap

![Outfit Swap](screenshots/apps/apps_outfit_swap.jpg)

**What it does.** Copies the clothes from one photo onto the person in another.

**How to use it.**
1. Upload "Your image".
2. Upload the "Character image" wearing the outfit you want.
3. Press Generate Image (2 credits).

**Inputs and settings.** Two images.

**Model.** Not stated.

**What ComfyField would need.** Two formats cover it: `try-on` (open, with a fit choice) and `outfit-swap` (fal, FASHN, with a garment part choice). The only gap is wiring `qwen_edit_try_on`.

#### Style Snap

![Style Snap](screenshots/apps/apps_style_snap.jpg)

**What it does.** Replaces your outfit with a preset look and keeps your face, pose and light. The blog counts 14 presets, among them streetwear, vintage, minimal, editorial, techwear and Y2K.

**How to use it.**
1. Upload a photo. The blog says mid-shots work best.
2. Open Select Style and pick a preset.
3. Press Generate Image (2 credits).

**Inputs and settings.** One photo and one style.

**Model.** Not stated.

**What ComfyField would need.** This is missing. A preset outfit choice on `try-on`, described in text instead of a garment photo, would cover it with the same workflow.

### Face and identity

These are six identity tools. Face swap and character swap each come as image and video versions, and the video swap costs far more (25 credits against 2). Commercial Faces is not a generator: it is a sign-up for licensing your likeness to brands, and the marketing pages list it with the Creator Partnership Program. Recast is the PRO flagship. No screenshot of its page was captured, but its card appears in the catalog capture.

#### Face Swap

![Face Swap](screenshots/apps/apps_face_swap.jpg)

**What it does.** Puts a source face onto a target photo, or onto a video when you switch the type.

**How to use it.**
1. Upload the target image whose face you want to replace.
2. Upload the face you want to insert.
3. Set Generation type to image or video.
4. Press Face Swap (2 credits for an image).

**Inputs and settings.** Two uploads and the type switch. The blog advises one clearly visible person, no pure white background and empty hands.

**Model.** Not stated.

**What ComfyField would need.** `face-swap` (`qwen_edit_face_swap`) and `face-swap-video` (Wan 2.2 Animate) cover both versions, and both also accept a saved Library character. Merging them behind one image or video switch would mirror Higgsfield.

#### Character Swap 2.0

![Character Swap 2.0](screenshots/apps/apps_character_swap.jpg)

**What it does.** Moves your whole character (face, hair, body and outfit) into another photo's pose, light and scene.

**How to use it.**
1. Upload "Your photo" with the character to insert.
2. Upload the "Target image" with the person to replace.
3. Press Character Swap (2 credits).

**Inputs and settings.** Two images.

**Model.** Not stated.

**What ComfyField would need.** Covered by `character-swap` (Kontext), which adds a choice to keep the target's outfit.

#### Recast

![Recast card in the apps catalog](screenshots/tools/apps_2.jpg)

**What it does.** Replaces the person in an existing video with a character from a photo. The blog adds 30+ character presets, voice cloning, dubbing that can change the voice's gender, and background presets including a green screen.

**How to use it.**
1. Upload the video with the person to replace.
2. Upload a clear photo of the new character.
3. Press Generate.
4. Continue in the studio for finer edits.

**Inputs and settings.** A video and a character photo. Presets and voice options come from the blog. No credit cost was captured.

**Model.** Higgsfield Recast.

**What ComfyField would need.** `motion-transfer` (Wan 2.2 Animate) does the core swap, but Wan Animate's replace mode is closer to Recast than its animate mode, so the format needs a mode choice. `voice-change`, `dub` and `video-bg-remove` cover the extras. A Flow can chain them: replace, then change the voice, then swap the background.

#### Video Face Swap

![Video Face Swap](screenshots/apps/apps_video_face_swap.jpg)

**What it does.** Swaps a face across every frame of a clip and follows head turns and motion.

**How to use it.**
1. Keep Generation type on video.
2. Upload the target video and the face photo.
3. Press Swap Now (25 credits).

**Inputs and settings.** A video, a face and the type switch.

**Model.** Not stated.

**What ComfyField would need.** Covered by `face-swap-video`.

#### Headshot Generator

![Headshot Generator](screenshots/apps/apps_ai_headshot_generator.jpg)

**What it does.** Turns a casual selfie into a lit studio headshot for profiles and resumes.

**How to use it.**
1. Upload a clear, front-facing selfie without sunglasses or hats.
2. Press Generate Image (1 credit).
3. Download the result.

**Inputs and settings.** One photo. There are no style options.

**Model.** Not stated.

**What ComfyField would need.** Covered. `headshot` (Kontext) goes further, with background and attire choices.

### Video editing

Despite the name, only two of these six edit a video you already have: Sticker Match Cut and Video Background Remover. ClipCut and Urban Cuts generate beat-cut fashion reels from a photo, and Breakdown and Japanese Show are image apps. Cutting to the beat of music is the one capability here that ComfyField has nothing for.

#### Urban Cuts

![Urban Cuts](screenshots/apps/apps_urban_cuts.jpg)

**What it does.** Makes a 10-second outfit video from one photo and lands each cut on the beat of a track. The page says it first cuts uploaded garments out of their background.

**How to use it.**
1. Upload a photo with your face clearly visible.
2. Upload an outfit image or pick one of 40+ preset outfits.
3. Pick one of 30+ preset tracks or upload your own.
4. Generate. The output is 9:16 by default, with 3:4, 1:1, 4:3 and 16:9 options.

**Inputs and settings.** As above. The page captured only the explainer section, so no credit cost was captured.

**Model.** Not stated.

**What ComfyField would need.** This is missing. The pipeline is `try-on` per outfit, short `wan22_i2v` clips, server-side beat detection and an ffmpeg pass that cuts on the beats. The track can be uploaded or made with `ace_step`. Ship it as one format with a music input.

#### ClipCut

![ClipCut](screenshots/apps/apps_clipcut.jpg)

**What it does.** The catalog pitches it as one selfie into an instant outfit reel, and the meta description calls it a beat-synced montage of several outfits. Signed out, the page showed only a gallery of results.

**How to use it.**
1. Upload a selfie.
2. Generate. The capture shows no outfit or music controls, so the app seems to choose them.

**Inputs and settings.** One selfie. No controls were captured.

**Model.** Not stated.

**What ComfyField would need.** The same pipeline as Urban Cuts with preset outfits. One format with an "outfits: mine or presets" choice could cover both apps.

#### Sticker Match Cut

![Sticker Match Cut](screenshots/apps/apps_sticker_matchcut.jpg)

**What it does.** Turns the person in a clip into a white-edged, glittering sticker that pops over the background in match cuts.

**How to use it.**
1. Upload a video with one person in it.
2. Press Generate Video (25 credits).

**Inputs and settings.** One video.

**Model.** Not stated.

**What ComfyField would need.** This is missing. `birefnet_video_matte` already produces the cutout. The rest is compositing: a white stroke, a holographic sparkle and cuts timed to the audio.

#### Breakdown

![Breakdown](screenshots/apps/apps_breakdown.jpg)

**What it does.** Analyzes a photo and lays out its parts with labels. The example breaks a pancake stack into ingredients with quantities. It can also identify brands, shop links and prices.

**How to use it.**
1. Upload a photo.
2. Press Generate Image (2 credits).

**Inputs and settings.** One image.

**Model.** Not stated.

**What ComfyField would need.** This is missing. `layers` splits objects but does not label them. A Qwen3-VL pass could list the parts and amounts, then `qwen_edit` could draw the labeled flat lay, since Qwen-Image renders text well. Shop lookups fall outside a local-first app.

#### Video Background Remover

![Video Background Remover](screenshots/apps/apps_video_background_remover.jpg)

**What it does.** Cuts the subject out of every frame of a clip without flicker.

**How to use it.**
1. Upload an MP4 or MOV.
2. Press Generate Video (1 credit).
3. Download the result for compositing.

**Inputs and settings.** One video.

**Model.** Not stated.

**What ComfyField would need.** Covered by `video-bg-remove` (BiRefNet), which also offers a solid color or a new background.

### Ads and products

This is the largest hub. Apart from Click to Ad and the four ASMR apps, each is a one-upload product effect: give it a product photo and it returns a short commercial beat, such as bullet time, a fridge, a volcano, a truck or a billboard, for 15 to 26 credits. Billboard Ad and Truck Ad add a text field. The ASMR apps (Classic, Host, Add-On, Promo) generate whispering video with sound for 23 credits each. ComfyField covers the spin, the bullet time, the truck and the billboard, and it has deeper ad tools elsewhere (`product-ad`, `ad-variants`, `recreate-ad`). Still, 12 of these 21 apps have no format.

#### Click to Ad

![Click to Ad](screenshots/apps/apps_click_to_ad.jpg)

**What it does.** The catalog entry opens Marketing Studio's link-to-ad tool. Paste a product link and get ad images, UGC videos and motion clips from a template gallery.

**How to use it.**
1. Paste the product URL into the input bar.
2. Pick a template tab (Product shot, Motion, UGC, TikTok, Ads, Posters, Marketplace) and filter by image or video.
3. Generate.

**Inputs and settings.** A URL and a template. The signed-out capture shows the gallery and an empty input bar.

**Model.** Not stated.

**What ComfyField would need.** `link-to-ads` makes static ads from a link, while `product-ad` and `ugc-ad` make video. A Flow from link to product Library item to video ad would close the gap. The Tools and studios section covers Marketing Studio itself.

#### ASMR Add-On

![ASMR Add-On](screenshots/apps/apps_asmr_add_on.jpg)

**What it does.** Keeps your character image as it is and adds your product to an ASMR clip in which the character whispers your line.

**How to use it.**
1. Upload the character image.
2. Upload the product image.
3. Type what the character should say.
4. Press Generate Video (23 credits).

**Inputs and settings.** Two images and a line of script. ASMR Promo works the same way with a scripted studio scene. ASMR Classic and ASMR Host take one photo and add whispering and sounds.

**Model.** Not stated.

**What ComfyField would need.** `ugc-ad` (Wan 2.2 and InfiniteTalk) already takes a character, a product, a script and a voice. Add a whisper emotion, a close-mic sound bed from `mmaudio` and a no-product mode, and it covers all four ASMR apps.

#### Billboard Ad

![Billboard Ad](screenshots/apps/apps_billboard.jpg)

**What it does.** Puts your photo or product on a giant city billboard while crowds, cars and clouds rush past in a timelapse.

**How to use it.**
1. Upload the image.
2. Type the billboard text.
3. Set Generation type.
4. Press Generate Video (16 credits).

**Inputs and settings.** One image, headline text and the type switch.

**Model.** Not stated.

**What ComfyField would need.** `billboard` (`qwen_edit_mockup`) makes the still with five placements. Add a headline input, a wall mural placement and an optional `ltx_i2v` timelapse step.

#### Truck Ad

![Truck Ad](screenshots/apps/apps_truck_ad.jpg)

**What it does.** Wraps your product or logo on the side of a truck driving down a city street.

**How to use it.**
1. Upload the product or logo.
2. Optionally fill the text field.
3. Set Generation type.
4. Press Generate Video (19 credits).

**Inputs and settings.** One image, text and the type switch.

**Model.** Not stated.

**What ComfyField would need.** Covered by `truck-ad` (Qwen-Image Edit then Wan 2.2) with a street choice.

#### Packshot

![Packshot](screenshots/apps/apps_packshot.jpg)

**What it does.** Makes a polished closing hero frame of the product to end an ad, as a short video or a still.

**How to use it.**
1. Upload or drag in the product image.
2. Set Generation type.
3. Press Generate Video (16 credits).

**Inputs and settings.** One image and the type switch.

**Model.** Not stated.

**What ComfyField would need.** The names clash. ComfyField's `packshot` is a bullet-time sweep, which matches Higgsfield's Bullet Time Scene and Bullet Time White. Higgsfield's Packshot is closer to `product-shot` (a still with five scene choices) plus a short settle-in move. Renaming ComfyField's format to Bullet time would avoid the confusion.

#### Kick Ad

![Kick Ad](screenshots/apps/apps_kick_ad.jpg)

**What it does.** Shows your product winning as a rival product gets kicked out of frame.

**How to use it.**
1. Upload or drag in the product image.
2. Set Generation type.
3. Press Generate Video (16 credits).

**Inputs and settings.** One image and the type switch.

**Model.** Not stated.

**What ComfyField would need.** This is missing, along with Fridge Ad, Volcano Ad, Magic Button, Graffiti Ad, Chameleon, Macro Scene, Macroshot Product and Bullet Time Splash. Each is one product photo plus a fixed prompt, so each becomes a style option on `product-ad` or a few lines of format data on `wan22_i2v`.

### Games and characters

These are ten game and toy transformations. Game Dump is image only and has 12 game looks. Nano Strike, Nano Theft and Simlife make a still first and can then animate it, and the blog says you choose an animation style after the still. They cost 6 credits for video, far below the 15 to 19 credits of the 3D toy templates. Plushies is the only template with a quality setting.

#### Game Dump

![Game Dump](screenshots/apps/apps_game_dump.jpg)

**What it does.** Recasts you as a hero in one of 12 video game styles, or in all 12 at once.

**How to use it.**
1. Upload a photo.
2. Open Choose Game Style and preview the tiles.
3. Optionally tick "Generate all 12 game styles".
4. Press Generate Image (2 credits per style).

**Inputs and settings.** One photo, a style and the batch checkbox.

**Model.** Not stated.

**What ComfyField would need.** Covered by `game-style` (Kontext) with 10 styles. The batch is worth copying as a general composer feature: run every option of a choice, as Angles does with its 12 angles.

#### Nano Strike

![Nano Strike](screenshots/apps/apps_nano_strike.jpg)

**What it does.** Turns 1 to 5 people into a tactical-shooter squad with armor and weapons. The video has the squad walking forward as something explodes behind them.

**How to use it.**
1. Upload 1 to 5 photos.
2. Set Generation type.
3. Press Generate Video (6 credits).

**Inputs and settings.** Up to five photos and the type switch.

**Model.** Not stated.

**What ComfyField would need.** This is missing. It needs a multi-photo input (`qwen_edit` accepts several images), a shooter style and a `wan22_i2v` step. Nano Theft and GTAI follow the same pattern with an open-world crime look.

#### Simlife

![Simlife](screenshots/apps/apps_simlife.jpg)

**What it does.** Shows you as a life-sim character in a character-creator screen, optionally wearing up to two garments you upload. The video has the character wave.

**How to use it.**
1. Upload your photo (the blog suggests a white background) plus up to two clothing items.
2. Set Generation type.
3. Press Generate Video (6 credits).

**Inputs and settings.** Up to three images and the type switch.

**Model.** Not stated.

**What ComfyField would need.** `life-sim` (`qwen_edit`) makes the still from one photo. Add two optional garment inputs and a video step.

#### Plushies

![Plushies](screenshots/apps/apps_plushies.jpg)

**What it does.** Turns the subject into a knitted plush toy, as a still or as a stop-motion style clip.

**How to use it.**
1. Upload a photo.
2. Choose image or video.
3. Choose Standard (768p, 8 credits) or High (1080p, 10 credits).
4. Press Generate.

**Inputs and settings.** One photo, the type switch and the quality setting.

**Model.** Not stated.

**What ComfyField would need.** `plush-toy` (Kontext) makes the still. Add an image-to-video step with a stop-motion prompt and a resolution choice.

#### 3D Figure

![3D Figure](screenshots/apps/apps_3d_figure.jpg)

**What it does.** Makes you a collectible figure standing on a desk next to a monitor that shows its 3D model.

**How to use it.**
1. Upload a photo.
2. Set Generation type.
3. Press Generate Video (15 credits).

**Inputs and settings.** One photo and the type switch.

**Model.** Not stated.

**What ComfyField would need.** `figure-box` makes a boxed figure still, and `character-to-3d` (Hunyuan3D 2.1) makes a real model you can spin. That goes beyond what Higgsfield offers here. The desk-and-monitor staging is a prompt variant on `figure-box`.

### Extras

These are five leftover tools. The hub's Background Remover card reuses the Headshot Generator's description, a small copy slip on Higgsfield's side.

#### AI Meme Generator

![AI Meme Generator](screenshots/apps/apps_meme_generator.jpg)

**What it does.** Starts from a library of AI-generated stock faces, or a face made from your prompt. You place text freely on it, and the app can suggest captions.

**How to use it.**
1. Pick a character tile, or choose New meme and write a prompt.
2. Add text, then drag and resize it on the canvas.
3. Optionally press Generate text for five caption ideas.
4. Download for free, without a watermark.

**Inputs and settings.** Character or prompt, text, AI captions.

**Model.** The page says the characters are built with Soul Cinema.

**What ComfyField would need.** `meme` adds top and bottom captions to your own photo. To match, it needs caption suggestions (a Qwen3-VL pass on the image), a text layer you can move freely and an optional stock face set.

#### Micro-Beasts

![Micro-Beasts](screenshots/apps/apps_surrounded_by_animals.jpg)

**What it does.** Surrounds you with small animals of your choice and leaves you unchanged. The page counts 15+ presets, such as deer, alpacas and kittens.

**How to use it.**
1. Upload a photo.
2. Open Select Animal and pick one.
3. Press Generate Image (1 credit).

**Inputs and settings.** One photo and an animal.

**Model.** Not stated.

**What ComfyField would need.** This is missing. `tiny-creature` shrinks a pet instead. The fix is a `kontext_edit` format with an animal choice.

#### Signboard

![Signboard](screenshots/apps/apps_signboard.jpg)

**What it does.** Shows your photo as a large mural on a city wall.

**How to use it.**
1. Upload a photo.
2. Press Generate Image (2 credits).

**Inputs and settings.** One photo.

**Model.** Not stated.

**What ComfyField would need.** The names clash again. ComfyField's `signboard` writes your words on a sign inside the picture. Higgsfield's Signboard is a mockup, closer to `billboard`, so adding a wall mural placement to `billboard` covers it.

#### Paint App

![Paint App](screenshots/apps/apps_paint_app.jpg)

**What it does.** Frames your photo as a canvas inside a 90s paint program on an old CRT monitor.

**How to use it.**
1. Upload a photo.
2. Press Generate Image (2 credits).

**Inputs and settings.** One photo.

**Model.** Not stated.

**What ComfyField would need.** This is missing. It is a single `qwen_edit` prompt format in the fun category.

#### Background Remover

![Background Remover](screenshots/apps/apps_image_background_remover.jpg)

**What it does.** Returns a clean transparent PNG cutout of a person, product or pet.

**How to use it.**
1. Upload a photo.
2. Press Generate Image (1 credit).
3. Download the PNG.

**Inputs and settings.** One photo.

**Model.** Not stated.

**What ComfyField would need.** `remove-background` exists only as a fal recipe (Bria). An image BiRefNet workflow, the same family as `video-bg-remove`, would make it free and local.

### Trending templates

There are 20 templates on the hub and 7 unlisted pages built the same way. Every one takes a single photo, has the type switch starting on video, costs 15 to 26 credits and offers no other settings. Most show a creator handle chip. In practice they are fixed prompts on an image-to-video model. ComfyField's `effect()` helper in `src/lib/formats/motion.js` defines exactly this shape (photo, optional note, `ltx_i2v`), so each missing template is a few lines of data. Of the 27, 7 have a ComfyField match.

#### Yes Kiss

![Yes Kiss](screenshots/apps/apps_yes_kiss.jpg)

**What it does.** Someone leans into the frame and kisses the person in your photo, an absurd meme moment.

**How to use it.**
1. Upload a photo.
2. Set Generation type.
3. Press Generate Video (19 credits).

**Inputs and settings.** One photo and the type switch.

**Model.** Not stated.

**What ComfyField would need.** This is missing. It is an `effect()` entry on `ltx_i2v`, or on `wan22_i2v` if a second person enters the frame.

#### Rap God

![Rap God](screenshots/apps/apps_rapgod.jpg)

**What it does.** Turns your photo into a rap music video with generated lyrics, a beat and a lip-synced performance.

**How to use it.**
1. Upload a photo.
2. Set Generation type.
3. Press Generate Video (23 credits).

**Inputs and settings.** One photo and the type switch.

**Model.** Not stated.

**What ComfyField would need.** This is missing, but every part is in the plan: Qwen3 writes the lyrics, `music` (ACE-Step) makes the track and `talking-head` (InfiniteTalk) sings it. A music video format or Flow would chain them.

#### On Fire

![On Fire](screenshots/apps/apps_this_is_fine.jpg)

**What it does.** Draws you sitting calmly in the cartoon burning room from the "this is fine" meme.

**How to use it.**
1. Upload a photo.
2. Set Generation type.
3. Press Generate Video (19 credits).

**Inputs and settings.** One photo and the type switch.

**Model.** Not stated.

**What ComfyField would need.** `all-fine` (Kontext) makes the still. An `ltx_i2v` step would add flickering flames and smoke.

#### Idol

![Idol](screenshots/apps/apps_idol.jpg)

**What it does.** Puts you on a lit stage as a glamorous pop idol in a styled outfit. The page is not listed on any hub.

**How to use it.**
1. Upload a photo.
2. Set Generation type.
3. Press Generate Video (15 credits).

**Inputs and settings.** One photo and the type switch.

**Model.** Not stated.

**What ComfyField would need.** `photocard` makes an idol photocard still. A stage clip is one more `wan22_i2v` effect.

### Missing from ComfyField

46 of the 92 apps have no ComfyField format. 34 of them are one upload plus a fixed prompt, so they cost little to add as data. The larger builds are the beat-cut reels (ClipCut, Urban Cuts), What's Next, Breakdown and the ASMR audio apps. Workflow names below are the ones the formats already plan to use.

**Professional (2)**
- What's Next?: image-edit, next to Storyboard. Qwen3 writes 8 continuations, `kontext_edit` renders each with the cast kept, and an Approve gate leads to upscale.
- Zooms: image-edit. `qwen_edit` for punch-ins and `qwen_edit_outpaint` for pull-backs, laid out as a 3x3 sheet like `nine-shots`.

**Enhance and style (3)**
- Style Snap: image-edit. `qwen_edit_try_on` with preset outfits described in text.
- Outfit Vending: fun. `qwen_edit`, optionally after `qwen_image_layered` to pull out each item.
- Outfit Shot: ads. `qwen_edit_try_on` onto a stock model, then `wan22_i2v`.

**Face and identity (1)**
- Commercial Faces: characters. This is not a workflow but a consent and licensing record on a Library character. Low priority.

**Video editing (4)**
- ClipCut and Urban Cuts: video-edit. `qwen_edit_try_on` per outfit, `wan22_i2v` clips, then beat detection and an ffmpeg cut. The track comes from an upload or `ace_step`.
- Sticker Match Cut: video-edit. A `birefnet_video_matte` cutout plus a stroke and sparkle composite.
- Breakdown: image-edit. A Qwen3-VL item list, then a labeled flat lay with `qwen_edit`.

**Ads and products (12)**
- ASMR Classic and ASMR Host: ads. `infinitetalk` with a whispered `chatterbox_tts` voice, plus `mmaudio` for tapping and crinkle sounds.
- Poster: ads. A `qwen_edit` poster layout with headline text, then `ltx_i2v`.
- Chameleon, Magic Button, Kick Ad, Fridge Ad, Volcano Ad, Macro Scene and Macroshot Product: ads. New style options on `product-ad` (`wan22_product_ad`), or `wan22_i2v` with a fixed prompt.
- Graffiti Ad: ads. `qwen_edit_mockup` with a wall placement, then `ltx_i2v`.
- Bullet Time Splash: ads. `wan22_bullet_time` (the `packshot` workflow) with a burst-apart prompt.

**Games and characters (2)**
- Nano Strike and Nano Theft: fun. New options on `game-style` (`kontext_edit`, or multi-image `qwen_edit` for squads), then `wan22_i2v`.

**Extras (2)**
- Paint App: fun. `qwen_edit`.
- Micro-Beasts: fun. `kontext_edit` with an animal choice.

**Trending templates (20)**
- Yes Kiss, Sand Worm, Storm Creature, Burning Sunset, Mukbang, Melting Doodle, Giallo Horror, Skibidi, Banana Eating and Ghoulgao: effects. `ltx_i2v` through the existing `effect()` helper.
- Latex, 60s Cafe, Mugshot, Renaissance and Mascot: fun. A restyle with `kontext_edit` or `qwen_edit`, then `ltx_i2v`.
- Victory Card, J-Poster and Social Media Icon: fun. `qwen_edit` (Qwen-Image draws the text and logos), then `ltx_i2v`.
- GTAI: fun. The same path as Nano Theft.
- Rap God: fun. Qwen3 lyrics, `ace_step` track and `infinitetalk` lip sync.

---

## Presets: motion, effects and mixed media

On Higgsfield a preset is a saved recipe that a user picks instead of writing a prompt. The help center calls a motion preset a "motion blueprint": it fixes the camera move or the effect, and the user mainly supplies the picture. We captured three libraries in full. The Motion library has 229 preset pages, which hold 134 distinct presets. The Effects hub, which Higgsfield also calls Effects 2.0 and Viral Presets, lists 45 effects. Mixed Media has 33 preset pages. Around them sit smaller libraries for Genjutsu, Katana, Soul, Cinema Studio, Sora 2 and others.

Applying a motion preset takes four steps. Open Video, then Create Video, and pick a preset; the model selector then shows Higgsfield Standard, which is Higgsfield's own DoP image-to-video model. Upload one keyframe image (PNG or JPG, pasted, or generated on the spot). Optionally add a prompt, with an Enhance toggle that expands it. Then generate. Advanced settings offer a 3 or 5 second duration, a seed and a step count, and the Generate button shows the credit cost before you confirm. Mix combines presets in one generation, and 16 ready-made pairs ship as their own pages (for example Turning Metal + Melting). None of the captured pages or help articles shows a strength or intensity slider. The closest thing is the category split, where Basic and Epic camera control are described as moves of increasing intensity. Pricing lists three DoP tiers at 720p: Lite at about 3 credits, Turbo at about 5 and Standard at about 7, each per 3 second clip. The API charges $0.125 per DoP generation. Presets are also exposed through Higgsfield MCP, so Claude and other agents can browse and run them.

Viral Presets in the Effects hub need even less input: upload a photo, choose a resolution (480p up to 4K on most) and an aspect ratio where offered, and generate. The animation, location and style are built in, and there is no prompt. Mixed Media works on video instead: upload a clip of 1 to 10 seconds, pick a look, set the frame rate and resolution, and generate.

### Motion presets (229)

#### How the library works

- One library, many shop windows. Every preset has its own page at `/motion/<uuid>` with a name, a two-line description, a Generate button and sample clips. Themed hub pages slice the same library: Camera controls (`/camera-controls`, 65 entries, billed as "50+"), Viral (`/viral`, 54), Visual effects (`/collection/effects`, 100, plus a link to the Catch the Pulse collection), UGC (`/ugc`, 45) and Commercial (`/commercial`, 27).
- Categories in the generator are Effects (VFX transformations), Basic Camera Control and Epic Camera Control (camera moves of rising intensity), Catch the Pulse (a curated theme), Mix, and New and Trending feeds. A Top choice badge marks curated highlights (25 of the 229 pages).
- Duplicates. 93 names appear on two pages and Innerlight on three, each with its own uuid and identical text. The data does not say why; the likely reason is that the same preset sits in more than one collection or version. 9 pages also carry an unexplained "Buralqy" badge, possibly a creator credit.
- The captured set is not the whole library. The hub pages name 205 distinct presets, and 125 of them had no captured page (for example Pan Left, Aerial Pullback, Timelapse Glam, Giant Grab, Money Rain and a family of named transitions). In the other direction, 54 captured presets appear on no hub list, among them all the sports moves, most Mix pairs and many VFX. Counting both, the library holds at least 259 distinct names.
- Models. The preset pages do not name a model. The help center ties presets to DoP, and Higgsfield describes DoP as its own cinematography layer: VFX and directed camera moves applied through presets. Credits follow the DoP tier (see above), and the help center says DoP is billed at standard rates.
- Input is always one image. DoP has no text-only mode, and the help center suggests making the keyframe in Soul or Nano Banana Pro first.

#### All 229 presets

Categories are our own, assigned from each name and description. Mix pairs are filed under the part that dominates the result.

| Category | Preset | What it does | Route | Shot |
| --- | --- | --- | --- | --- |
| Camera move | 360 Orbit | Camera circles all the way around the subject. | `/motion/866a58b8-46e2-4a09-bcd8-1aaaa489730c` | [shot](screenshots/motion/motion_866a58b8_46e2_4a09_bcd8_1aaaa489730c.jpg) |
| Camera move | 360 Orbit | Camera circles all the way around the subject. | `/motion/d7c180bc-793c-4d29-83ba-c2d5e84e53d4` | [shot](screenshots/motion/motion_d7c180bc_793c_4d29_83ba_c2d5e84e53d4.jpg) |
| Camera move | 3D Rotation | Subject or product spins in place for a full turn. Top choice. | `/motion/6f06f47e-922e-4660-9fe9-754e4be69696` | [shot](screenshots/motion/motion_6f06f47e_922e_4660_9fe9_754e4be69696.jpg) |
| Camera move | 3D Rotation | Subject or product spins in place for a full turn. Top choice. | `/motion/c2d8f36a-319f-40e4-b5d0-94d4ff9be304` | [shot](screenshots/motion/motion_c2d8f36a_319f_40e4_b5d0_94d4ff9be304.jpg) |
| Camera move | Arc Left | Camera curves around the subject to the left. | `/motion/2a5d8f86-aef3-4b34-b5ee-fb2020daa131` | [shot](screenshots/motion/motion_2a5d8f86_aef3_4b34_b5ee_fb2020daa131.jpg) |
| Camera move | Arc Left | Camera curves around the subject to the left. | `/motion/a5b35657-5a5f-47cb-8042-786381f47433` | [shot](screenshots/motion/motion_a5b35657_5a5f_47cb_8042_786381f47433.jpg) |
| Camera move | Arc Right | Camera curves around the subject to the right. Top choice. | `/motion/0bdbf318-f918-4f9b-829a-74cab681d806` | [shot](screenshots/motion/motion_0bdbf318_f918_4f9b_829a_74cab681d806.jpg) |
| Camera move | Arc Right | Camera curves around the subject to the right. Top choice. | `/motion/f0eca915-e819-4295-a3c5-a46ac6e63a2a` | [shot](screenshots/motion/motion_f0eca915_e819_4295_a3c5_a46ac6e63a2a.jpg) |
| Camera move | Buckle Up | Low shot from beneath, as if through a glass floor. | `/motion/4ef72175-227a-418b-923d-2831dcdf7d4f` | [shot](screenshots/motion/motion_4ef72175_227a_418b_923d_2831dcdf7d4f.jpg) |
| Camera move | Buckle Up | Low shot from beneath, as if through a glass floor. | `/motion/678f065d-cf5b-4d3d-8d49-9251c43e8653` | [shot](screenshots/motion/motion_678f065d_cf5b_4d3d_8d49_9251c43e8653.jpg) |
| Camera move | Car Chasing | Follows speeding cars from dynamic chase angles. | `/motion/2f2a541b-6ce5-4115-92fb-4d6473d8e3ae` | [shot](screenshots/motion/motion_2f2a541b_6ce5_4115_92fb_4d6473d8e3ae.jpg) |
| Camera move | Car Chasing | Follows speeding cars from dynamic chase angles. | `/motion/a76f2e99-0a41-4fdf-934d-9c95b0ee85bf` | [shot](screenshots/motion/motion_a76f2e99_0a41_4fdf_934d_9c95b0ee85bf.jpg) |
| Camera move | Car Grip | Camera rigged to a car for smooth driving shots. | `/motion/b7334ffd-a260-42a5-8911-714bcc541b16` | [shot](screenshots/motion/motion_b7334ffd_a260_42a5_8911_714bcc541b16.jpg) |
| Camera move | Car Grip | Camera rigged to a car for smooth driving shots. | `/motion/d4c62a9d-df77-4222-af4e-5645b81844e0` | [shot](screenshots/motion/motion_d4c62a9d_df77_4222_af4e_5645b81844e0.jpg) |
| Camera move | Crane Down | Camera lowers from above down to the subject. | `/motion/41d4241f-8e3a-4c72-bd1d-89e93f06b0f0` | [shot](screenshots/motion/motion_41d4241f_8e3a_4c72_bd1d_89e93f06b0f0.jpg) |
| Camera move | Crane Down | Camera lowers from above down to the subject. | `/motion/494db3c2-2297-4cf7-bef7-cba0cebe73ee` | [shot](screenshots/motion/motion_494db3c2_2297_4cf7_bef7_cba0cebe73ee.jpg) |
| Camera move | Crane Over The Head | Camera rises up and over the subject. | `/motion/f77584f2-7442-4128-91b5-095829b108c7` | [shot](screenshots/motion/motion_f77584f2_7442_4128_91b5_095829b108c7.jpg) |
| Camera move | Crane Over The Head + Crash Zoom In | Mix: overhead rise that ends in a sudden punch in. | `/motion/107cd0d5-62d4-476b-bf60-7461313bfa45` | [shot](screenshots/motion/motion_107cd0d5_62d4_476b_bf60_7461313bfa45.jpg) |
| Camera move | Crane Over The Head + Crash Zoom In | Mix: overhead rise that ends in a sudden punch in. | `/motion/cc664502-7fdc-412e-8fd7-6af310c8891b` | [shot](screenshots/motion/motion_cc664502_7fdc_412e_8fd7_6af310c8891b.jpg) |
| Camera move | Crane Up | Camera lifts on a crane to reveal the scene. | `/motion/2da63d27-94e0-48e0-8e2e-936274bd176e` | [shot](screenshots/motion/motion_2da63d27_94e0_48e0_8e2e_936274bd176e.jpg) |
| Camera move | Crane Up | Camera lifts on a crane to reveal the scene. | `/motion/45d7f47f-2c7b-4c5e-84b7-943758a39dcc` | [shot](screenshots/motion/motion_45d7f47f_2c7b_4c5e_84b7_943758a39dcc.jpg) |
| Camera move | Crash Zoom In | Fast, dramatic zoom into the subject. | `/motion/1cc27a2b-3b89-44d4-a7f9-d583454a8960` | [shot](screenshots/motion/motion_1cc27a2b_3b89_44d4_a7f9_d583454a8960.jpg) |
| Camera move | Crash Zoom In | Fast, dramatic zoom into the subject. | `/motion/a2dddb76-03fa-429e-9905-577bffdf9d38` | [shot](screenshots/motion/motion_a2dddb76_03fa_429e_9905_577bffdf9d38.jpg) |
| Camera move | Crash Zoom Out | Fast zoom out to reveal the whole scene. | `/motion/3972c090-a448-4fd4-b8f0-cb71b4b523ee` | [shot](screenshots/motion/motion_3972c090_a448_4fd4_b8f0_cb71b4b523ee.jpg) |
| Camera move | Crash Zoom Out | Fast zoom out to reveal the whole scene. | `/motion/d5cf181f-b75b-4827-8614-f08953b92e62` | [shot](screenshots/motion/motion_d5cf181f_b75b_4827_8614_f08953b92e62.jpg) |
| Camera move | Dolly In | Camera glides toward the subject. | `/motion/06463063-551a-4cbb-abc0-0ff1007784b3` | [shot](screenshots/motion/motion_06463063_551a_4cbb_abc0_0ff1007784b3.jpg) |
| Camera move | Dolly In | Camera glides toward the subject. | `/motion/8d582076-10e2-40f7-bbef-6384532147c2` | [shot](screenshots/motion/motion_8d582076_10e2_40f7_bbef_6384532147c2.jpg) |
| Camera move | Dolly Left | Camera slides sideways to the left. | `/motion/36186f21-e20f-479f-a7b9-f7f12354a4ab` | [shot](screenshots/motion/motion_36186f21_e20f_479f_a7b9_f7f12354a4ab.jpg) |
| Camera move | Dolly Left | Camera slides sideways to the left. | `/motion/b03fa9e3-8e69-4fa2-bcc2-b18e362f9fba` | [shot](screenshots/motion/motion_b03fa9e3_8e69_4fa2_bcc2_b18e362f9fba.jpg) |
| Camera move | Dolly Out | Camera pulls away to show more of the scene. | `/motion/96e95a3c-ad0e-49ee-84e3-a39e0f13b543` | [shot](screenshots/motion/motion_96e95a3c_ad0e_49ee_84e3_a39e0f13b543.jpg) |
| Camera move | Dolly Out | Camera pulls away to show more of the scene. | `/motion/c1a8c847-4ea8-4d31-9cec-ef62897a2d17` | [shot](screenshots/motion/motion_c1a8c847_4ea8_4d31_9cec_ef62897a2d17.jpg) |
| Camera move | Dolly Right | Camera slides sideways to the right. | `/motion/17a8f1d4-88a4-4bb5-a662-c28e8ea7d023` | [shot](screenshots/motion/motion_17a8f1d4_88a4_4bb5_a662_c28e8ea7d023.jpg) |
| Camera move | Dolly Right | Camera slides sideways to the right. | `/motion/22f946c2-ed60-44bf-bca3-2be92c07d261` | [shot](screenshots/motion/motion_22f946c2_ed60_44bf_bca3_2be92c07d261.jpg) |
| Camera move | Dolly Zoom In | Push in while zooming out, so the background warps. | `/motion/114245a3-93fb-434a-9299-44ca9e4656a3` | [shot](screenshots/motion/motion_114245a3_93fb_434a_9299_44ca9e4656a3.jpg) |
| Camera move | Dolly Zoom In | Push in while zooming out, so the background warps. | `/motion/7d1c4551-e7cb-4728-b473-6b0b85f82b44` | [shot](screenshots/motion/motion_7d1c4551_e7cb_4728_b473_6b0b85f82b44.jpg) |
| Camera move | Dolly Zoom Out | Pull back while zooming in for a vertigo warp. | `/motion/520a2d8d-f9b2-4d0a-9fdf-85d02a13c976` | [shot](screenshots/motion/motion_520a2d8d_f9b2_4d0a_9fdf_85d02a13c976.jpg) |
| Camera move | Dolly Zoom Out | Pull back while zooming in for a vertigo warp. | `/motion/e057dbd5-1734-4462-bb4c-7d64fe20795e` | [shot](screenshots/motion/motion_e057dbd5_1734_4462_bb4c_7d64fe20795e.jpg) |
| Camera move | Double Dolly | Camera and subject travel together while the background slides by. | `/motion/66ab5702-475d-4153-92a1-ff67cc3dec25` | [shot](screenshots/motion/motion_66ab5702_475d_4153_92a1_ff67cc3dec25.jpg) |
| Camera move | Double Dolly | Camera and subject travel together while the background slides by. | `/motion/e522bff4-da3b-4f7d-8c6e-f925b60979c5` | [shot](screenshots/motion/motion_e522bff4_da3b_4f7d_8c6e_f925b60979c5.jpg) |
| Camera move | Earth Zoom Out | Pulls back from the subject to the city, the continent, then Earth. Top choice. | `/motion/70e490b9-26b7-4572-8d9c-2ac8dcc9adc0` | [shot](screenshots/motion/motion_70e490b9_26b7_4572_8d9c_2ac8dcc9adc0.jpg) |
| Camera move | Eyes In | Pushes in close on the subject's eyes. Top choice. | `/motion/0ab33462-481e-4c78-8ffc-086bebd84187` | [shot](screenshots/motion/motion_0ab33462_481e_4c78_8ffc_086bebd84187.jpg) |
| Camera move | Eyes In | Pushes in close on the subject's eyes. Top choice. | `/motion/f226ac67-43d3-4726-ad9c-132608bda8b3` | [shot](screenshots/motion/motion_f226ac67_43d3_4726_ad9c_132608bda8b3.jpg) |
| Camera move | Flying | Smooth, gliding drone-style flight through the scene. | `/motion/3b83bad3-64bd-4baa-bf73-be886f19a10c` | [shot](screenshots/motion/motion_3b83bad3_64bd_4baa_bf73_be886f19a10c.jpg) |
| Camera move | Flying | Smooth, gliding drone-style flight through the scene. | `/motion/d5ec4a6e-d982-4245-92eb-971c74505c9a` | [shot](screenshots/motion/motion_d5ec4a6e_d982_4245_92eb_971c74505c9a.jpg) |
| Camera move | FPV Drone | Fast first-person drone flight through tight spaces. | `/motion/244dc358-abee-426c-8966-b735978421b3` | [shot](screenshots/motion/motion_244dc358_abee_426c_8966_b735978421b3.jpg) |
| Camera move | FPV Drone | Fast first-person drone flight through tight spaces. | `/motion/5eb82f94-2b98-4e4a-ab4b-ee6c872fb2c7` | [shot](screenshots/motion/motion_5eb82f94_2b98_4e4a_ab4b_ee6c872fb2c7.jpg) |
| Camera move | Glam | High-speed camera sweeps around the subject in slow motion. | `/motion/5763f4ec-ea6b-449d-9509-4596962668a8` | [shot](screenshots/motion/motion_5763f4ec_ea6b_449d_9509_4596962668a8.jpg) |
| Camera move | Glam | High-speed camera sweeps around the subject in slow motion. | `/motion/ae4a319d-a06f-4b30-8b67-55a35a22f24a` | [shot](screenshots/motion/motion_ae4a319d_a06f_4b30_8b67_55a35a22f24a.jpg) |
| Camera move | Handheld | Natural handheld shake for a raw feel. Top choice. | `/motion/15e8358d-335d-4e7a-8eaa-277325ab728f` | [shot](screenshots/motion/motion_15e8358d_335d_4e7a_8eaa_277325ab728f.jpg) |
| Camera move | Handheld | Natural handheld shake for a raw feel. Top choice. | `/motion/36e6e450-52d9-484f-bfbe-f069e06a1530` | [shot](screenshots/motion/motion_36e6e450_52d9_484f_bfbe_f069e06a1530.jpg) |
| Camera move | Head Tracking | Camera locked to the head while the background shifts. | `/motion/5a6b5390-6605-4786-86e6-c6703ce44bbe` | [shot](screenshots/motion/motion_5a6b5390_6605_4786_86e6_c6703ce44bbe.jpg) |
| Camera move | Head Tracking | Camera locked to the head while the background shifts. | `/motion/fe520e06-7971-4f28-9e10-e45911c57bb6` | [shot](screenshots/motion/motion_fe520e06_7971_4f28_9e10_e45911c57bb6.jpg) |
| Camera move | Jib Down | Camera moves gently down onto the subject. | `/motion/2057206c-09ef-40b2-9cc9-049e41a0b8bb` | [shot](screenshots/motion/motion_2057206c_09ef_40b2_9cc9_049e41a0b8bb.jpg) |
| Camera move | Jib Down | Camera moves gently down onto the subject. | `/motion/cd68bb84-f0f5-4e2a-bfbf-b06e7949fc43` | [shot](screenshots/motion/motion_cd68bb84_f0f5_4e2a_bfbf_b06e7949fc43.jpg) |
| Camera move | Jib Up | Camera lifts straight up to show height. | `/motion/c22b1586-837b-480f-a456-d4e8ba9c3a4b` | [shot](screenshots/motion/motion_c22b1586_837b_480f_a456_d4e8ba9c3a4b.jpg) |
| Camera move | Jib Up | Camera lifts straight up to show height. | `/motion/d6b43086-d5d1-415b-a239-016698b425d7` | [shot](screenshots/motion/motion_d6b43086_d5d1_415b_a239_016698b425d7.jpg) |
| Camera move | Lazy Susan | Camera turns around a still subject like a turntable. | `/motion/025866ff-677c-4af2-92ef-52d6ec3b035e` | [shot](screenshots/motion/motion_025866ff_677c_4af2_92ef_52d6ec3b035e.jpg) |
| Camera move | Lazy Susan | Camera turns around a still subject like a turntable. | `/motion/692c5527-3580-4c65-adfd-c47c6dc1f975` | [shot](screenshots/motion/motion_692c5527_3580_4c65_adfd_c47c6dc1f975.jpg) |
| Camera move | Lazy Susan + Super Dolly Out | Mix: rotates around the subject while pulling away. | `/motion/71e3e642-561f-46d9-b9af-8af420f99685` | [shot](screenshots/motion/motion_71e3e642_561f_46d9_b9af_8af420f99685.jpg) |
| Camera move | Lazy Susan + Super Dolly Out | Mix: rotates around the subject while pulling away. | `/motion/bf81db64-714e-4195-acd4-21065b317dd4` | [shot](screenshots/motion/motion_bf81db64_714e_4195_acd4_21065b317dd4.jpg) |
| Camera move | Mouth In | Quick zoom into the mouth for a comic or surreal beat. | `/motion/7351a8ad-9754-4844-94f1-00baf293d588` | [shot](screenshots/motion/motion_7351a8ad_9754_4844_94f1_00baf293d588.jpg) |
| Camera move | Mouth In | Quick zoom into the mouth for a comic or surreal beat. | `/motion/dfeb0656-5d12-474c-87cd-1c80e94abdf2` | [shot](screenshots/motion/motion_dfeb0656_5d12_474c_87cd_1c80e94abdf2.jpg) |
| Camera move | Object POV | Shows the scene from an object's point of view. | `/motion/76a7036d-2f69-4e0b-82fe-c91f9d7a71aa` | [shot](screenshots/motion/motion_76a7036d_2f69_4e0b_82fe_c91f9d7a71aa.jpg) |
| Camera move | Object POV | Shows the scene from an object's point of view. | `/motion/ab14b29d-f23e-449e-a40e-ebdbb4f7437a` | [shot](screenshots/motion/motion_ab14b29d_f23e_449e_a40e_ebdbb4f7437a.jpg) |
| Camera move | Overhead | Top-down camera that tracks the subject. | `/motion/b6395b91-a356-4bc6-9cda-fc2793b3d706` | [shot](screenshots/motion/motion_b6395b91_a356_4bc6_9cda_fc2793b3d706.jpg) |
| Camera move | Overhead | Top-down camera that tracks the subject. | `/motion/cdb0b964-5bd6-4a26-8ae6-7fe605a28dc9` | [shot](screenshots/motion/motion_cdb0b964_5bd6_4a26_8ae6_7fe605a28dc9.jpg) |
| Camera move | Rap Flex | Rap video moves: slides, low angles and slow zooms. | `/motion/809c1acb-6be5-4eb7-afde-dd08910f1e90` | [shot](screenshots/motion/motion_809c1acb_6be5_4eb7_afde_dd08910f1e90.jpg) |
| Camera move | Rap Flex | Rap video moves: slides, low angles and slow zooms. | `/motion/dc292dd4-12aa-431a-a576-48adb132dd55` | [shot](screenshots/motion/motion_dc292dd4_12aa_431a_a576_48adb132dd55.jpg) |
| Camera move | Robo Arm | Fast, precise robotic camera sweeps. | `/motion/1bd4363a-6e5a-4c57-90a5-30f0733a769b` | [shot](screenshots/motion/motion_1bd4363a_6e5a_4c57_90a5_30f0733a769b.jpg) |
| Camera move | Robo Arm | Fast, precise robotic camera sweeps. | `/motion/6fef255d-cdd6-4463-b025-a42646866c1c` | [shot](screenshots/motion/motion_6fef255d_cdd6_4463_b025_a42646866c1c.jpg) |
| Camera move | Snorricam | Camera rigged to the subject so the world bobs with each step. Top choice. | `/motion/505dec12-80c5-43bf-99b1-134e3f3e53a0` | [shot](screenshots/motion/motion_505dec12_80c5_43bf_99b1_134e3f3e53a0.jpg) |
| Camera move | Snorricam | Camera rigged to the subject so the world bobs with each step. Top choice. | `/motion/893cb65f-c528-40aa-83d8-c5aeb2bfe59f` | [shot](screenshots/motion/motion_893cb65f_c528_40aa_83d8_c5aeb2bfe59f.jpg) |
| Camera move | Static | Locked-off camera with no movement. Top choice. | `/motion/aab8440c-0d65-4554-b88a-7a9a5e084b6e` | [shot](screenshots/motion/motion_aab8440c_0d65_4554_b88a_7a9a5e084b6e.jpg) |
| Camera move | Static | Locked-off camera with no movement. Top choice. | `/motion/fffe5dfd-f63b-4659-b7dd-e45f9c7d4ea2` | [shot](screenshots/motion/motion_fffe5dfd_f63b_4659_b7dd_e45f9c7d4ea2.jpg) |
| Camera move | Super Dolly In | Long, straight push toward the subject. | `/motion/1c2140b0-0847-4a74-a3d9-f0298aec817d` | [shot](screenshots/motion/motion_1c2140b0_0847_4a74_a3d9_f0298aec817d.jpg) |
| Camera move | Super Dolly In | Long, straight push toward the subject. | `/motion/6a6fb1b9-28ea-44c8-9be4-e5d8c6ab1f3a` | [shot](screenshots/motion/motion_6a6fb1b9_28ea_44c8_9be4_e5d8c6ab1f3a.jpg) |
| Camera move | Super Dolly Out | Long, straight pull away from the subject. | `/motion/9dda3fb8-b917-457a-a995-72233031b1fd` | [shot](screenshots/motion/motion_9dda3fb8_b917_457a_a995_72233031b1fd.jpg) |
| Camera move | Super Dolly Out | Long, straight pull away from the subject. | `/motion/d66685ce-8c2b-4aeb-8d4a-195d474c7eca` | [shot](screenshots/motion/motion_d66685ce_8c2b_4aeb_8d4a_195d474c7eca.jpg) |
| Camera move | Through Object In | Camera passes through an object to reach the subject. | `/motion/2b353671-da2e-4c9e-841d-b7af200ceadb` | [shot](screenshots/motion/motion_2b353671_da2e_4c9e_841d_b7af200ceadb.jpg) |
| Camera move | Through Object In | Camera passes through an object to reach the subject. | `/motion/ae7a6c18-0db0-4c17-817b-fe73b10da520` | [shot](screenshots/motion/motion_ae7a6c18_0db0_4c17_817b_fe73b10da520.jpg) |
| Camera move | Through Object Out | Camera exits through an object to reveal the scene. | `/motion/0b75acee-a00e-4009-a7a3-8fe394f13864` | [shot](screenshots/motion/motion_0b75acee_a00e_4009_a7a3_8fe394f13864.jpg) |
| Camera move | Through Object Out | Camera exits through an object to reveal the scene. | `/motion/3e217f3c-5133-4e83-ab6c-afb35d1c5852` | [shot](screenshots/motion/motion_3e217f3c_5133_4e83_ab6c_afb35d1c5852.jpg) |
| Camera move | Tilt Down | Camera angles down to reveal what is below. | `/motion/1958a932-8ffb-4f1a-a5cd-480858f6ae84` | [shot](screenshots/motion/motion_1958a932_8ffb_4f1a_a5cd_480858f6ae84.jpg) |
| Camera move | Tilt up | Camera angles up so the subject feels grand. | `/motion/359bd4f6-252a-405e-bb5c-3807b3b9d9ec` | [shot](screenshots/motion/motion_359bd4f6_252a_405e_bb5c_3807b3b9d9ec.jpg) |
| Camera move | Tilt up | Camera angles up so the subject feels grand. | `/motion/9f127dad-0db0-4e3d-a440-3cfbffca30b6` | [shot](screenshots/motion/motion_9f127dad_0db0_4e3d_a440_3cfbffca30b6.jpg) |
| Camera move | Whip Pan | Very fast pan with heavy motion blur. | `/motion/7a144766-cdd2-4b73-8a27-67b35f2d4ba2` | [shot](screenshots/motion/motion_7a144766_cdd2_4b73_8a27_67b35f2d4ba2.jpg) |
| Camera move | Whip Pan | Very fast pan with heavy motion blur. | `/motion/a3f2c5eb-2fe1-493c-a4b0-b40c46a3a48b` | [shot](screenshots/motion/motion_a3f2c5eb_2fe1_493c_a4b0_b40c46a3a48b.jpg) |
| Camera move | Wiggle | Playful slight shake layered on a zoom or pan. | `/motion/cfbe9732-1b5a-4f59-9dbc-801f85f5c702` | [shot](screenshots/motion/motion_cfbe9732_1b5a_4f59_9dbc_801f85f5c702.jpg) |
| Camera move | Wiggle | Playful slight shake layered on a zoom or pan. | `/motion/fbc42e4f-222c-4c79-a5f2-b3a23d169376` | [shot](screenshots/motion/motion_fbc42e4f_222c_4c79_a5f2_b3a23d169376.jpg) |
| Camera move | YoYo Zoom | Rapid zoom in and straight back out. | `/motion/0da141c0-0d0a-4e70-928b-3f61888f067d` | [shot](screenshots/motion/motion_0da141c0_0d0a_4e70_928b_3f61888f067d.jpg) |
| Camera move | YoYo Zoom | Rapid zoom in and straight back out. | `/motion/702c6210-9798-4888-b7c9-e794c8fcaaef` | [shot](screenshots/motion/motion_702c6210_9798_4888_b7c9_e794c8fcaaef.jpg) |
| Camera move | Zoom In | Gradual zoom toward the subject. | `/motion/223929fa-99b1-4a61-a454-90226684901b` | [shot](screenshots/motion/motion_223929fa_99b1_4a61_a454_90226684901b.jpg) |
| Camera move | Zoom In | Gradual zoom toward the subject. | `/motion/a3a3db5d-d3c5-4d95-b429-235ae3d1ee82` | [shot](screenshots/motion/motion_a3a3db5d_d3c5_4d95_b429_235ae3d1ee82.jpg) |
| Camera move | Zoom Out | Gradual zoom out to show more of the scene. | `/motion/b731109c-5856-436f-b269-b44b75f20945` | [shot](screenshots/motion/motion_b731109c_5856_436f_b269_b44b75f20945.jpg) |
| Camera move | Zoom Out | Gradual zoom out to show more of the scene. | `/motion/f9e6792f-b385-4eca-87f6-f439e917a7aa` | [shot](screenshots/motion/motion_f9e6792f_b385_4eca_87f6_f439e917a7aa.jpg) |
| Camera effect | Bullet Time | Action freezes or slows while the camera moves around it. Top choice. | `/motion/855c5272-8f39-48b7-a362-e1337590387f` | [shot](screenshots/motion/motion_855c5272_8f39_48b7_a362_e1337590387f.jpg) |
| Camera effect | Bullet Time | Action freezes or slows while the camera moves around it. Top choice. | `/motion/9312c53a-f191-4aab-94fb-6b1dbdfdc946` | [shot](screenshots/motion/motion_9312c53a_f191_4aab_94fb_6b1dbdfdc946.jpg) |
| Camera effect | Dirty Lens | Smudges, dust or water drops on the lens. | `/motion/635e322f-f711-4a4b-98b8-c1b62d7befe9` | [shot](screenshots/motion/motion_635e322f_f711_4a4b_98b8_c1b62d7befe9.jpg) |
| Camera effect | Dirty Lens | Smudges, dust or water drops on the lens. | `/motion/86b3d8dd-78e2-4c84-9ca3-5a5b3c5a6382` | [shot](screenshots/motion/motion_86b3d8dd_78e2_4c84_9ca3_5a5b3c5a6382.jpg) |
| Camera effect | Dutch Angle | Tilted horizon for tension or unease. | `/motion/28a18555-b8ed-4cac-aad6-40ecaaad9345` | [shot](screenshots/motion/motion_28a18555_b8ed_4cac_aad6_40ecaaad9345.jpg) |
| Camera effect | Dutch Angle | Tilted horizon for tension or unease. | `/motion/b593944e-ae3e-47ce-8c6d-ea8dd87fe01f` | [shot](screenshots/motion/motion_b593944e_ae3e_47ce_8c6d_ea8dd87fe01f.jpg) |
| Camera effect | Fisheye | Wide, curved fisheye distortion. | `/motion/6c689fc3-e421-4ed5-892c-2092d1c60be0` | [shot](screenshots/motion/motion_6c689fc3_e421_4ed5_892c_2092d1c60be0.jpg) |
| Camera effect | Fisheye | Wide, curved fisheye distortion. | `/motion/a5915704-2b92-476b-b67b-3a1394c613cd` | [shot](screenshots/motion/motion_a5915704_2b92_476b_b67b_3a1394c613cd.jpg) |
| Camera effect | Focus Change | Focus shifts from one subject to another. | `/motion/0753d80c-7369-4682-b725-8729ab638224` | [shot](screenshots/motion/motion_0753d80c_7369_4682_b725_8729ab638224.jpg) |
| Camera effect | Focus Change | Focus shifts from one subject to another. | `/motion/390e084a-4a80-410b-a808-77411828c61d` | [shot](screenshots/motion/motion_390e084a_4a80_410b_a808_77411828c61d.jpg) |
| Camera effect | FPV Drone + Timelapse Landscape | Mix: drone flight over a landscape in sped-up time. | `/motion/4f016058-bdcf-450b-9ec1-273fb98c927c` | [shot](screenshots/motion/motion_4f016058_bdcf_450b_9ec1_273fb98c927c.jpg) |
| Camera effect | FPV Drone + Timelapse Landscape | Mix: drone flight over a landscape in sped-up time. | `/motion/7018b2c3-a855-4836-959c-44b6ca0097c8` | [shot](screenshots/motion/motion_7018b2c3_a855_4836_959c_44b6ca0097c8.jpg) |
| Camera effect | Hyperlapse | Moving time-lapse that travels through the scene. | `/motion/2dec4bb0-5d8d-4a2d-bd9f-242ec613a9fb` | [shot](screenshots/motion/motion_2dec4bb0_5d8d_4a2d_bd9f_242ec613a9fb.jpg) |
| Camera effect | Hyperlapse | Moving time-lapse that travels through the scene. | `/motion/f0f07997-34fe-4bef-84c1-ee9d4da94a1a` | [shot](screenshots/motion/motion_f0f07997_34fe_4bef_84c1_ee9d4da94a1a.jpg) |
| Camera effect | Incline | The world tilts steeply around the subject. | `/motion/342d9ac9-ecd1-4c7b-a3a2-ac6e3423d302` | [shot](screenshots/motion/motion_342d9ac9_ecd1_4c7b_a3a2_ac6e3423d302.jpg) |
| Camera effect | Incline | The world tilts steeply around the subject. | `/motion/b120f292-74e3-4878-817b-626e203f8a92` | [shot](screenshots/motion/motion_b120f292_74e3_4878_817b_626e203f8a92.jpg) |
| Camera effect | Lens Crack | Cracked lens with fractures and light distortion. | `/motion/a7984a1f-f2ed-41a8-8a4c-4a66606ac6bb` | [shot](screenshots/motion/motion_a7984a1f_f2ed_41a8_8a4c_4a66606ac6bb.jpg) |
| Camera effect | Lens Flare | Light streaks and spots across the lens. | `/motion/53384cbd-e077-4668-b3fe-1ff771564f56` | [shot](screenshots/motion/motion_53384cbd_e077_4668_b3fe_1ff771564f56.jpg) |
| Camera effect | Lens Flare | Light streaks and spots across the lens. | `/motion/97687e52-2cfc-4073-ae62-a00c057c2aa2` | [shot](screenshots/motion/motion_97687e52_2cfc_4073_ae62_a00c057c2aa2.jpg) |
| Camera effect | Low Shutter | Slow shutter blur and streaks. | `/motion/f7949a2f-2bcd-459a-96c0-80eb222abcdc` | [shot](screenshots/motion/motion_f7949a2f_2bcd_459a_96c0_80eb222abcdc.jpg) |
| Camera effect | Low Shutter | Slow shutter blur and streaks. | `/motion/fe85971a-92e3-4c85-ac20-b4ecebaf1567` | [shot](screenshots/motion/motion_fe85971a_92e3_4c85_ac20_b4ecebaf1567.jpg) |
| Camera effect | Snorricam + Low Shutter | Mix: subject locked in frame while the world smears. | `/motion/7c3b76f5-92b7-4629-8b6f-c8f9042635bf` | [shot](screenshots/motion/motion_7c3b76f5_92b7_4629_8b6f_c8f9042635bf.jpg) |
| Camera effect | Snorricam + Low Shutter | Mix: subject locked in frame while the world smears. | `/motion/a3ce0054-2745-40e9-99b8-29977324bff1` | [shot](screenshots/motion/motion_a3ce0054_2745_40e9_99b8_29977324bff1.jpg) |
| Camera effect | Timelapse Human | People move at high speed while the setting stays normal. | `/motion/b8789aa0-bced-4d69-9eca-7245ee9ce7db` | [shot](screenshots/motion/motion_b8789aa0_bced_4d69_9eca_7245ee9ce7db.jpg) |
| Camera effect | Timelapse Human | People move at high speed while the setting stays normal. | `/motion/c4ce82e4-1426-46b4-b184-db8f7fe41a5f` | [shot](screenshots/motion/motion_c4ce82e4_1426_46b4_b184_db8f7fe41a5f.jpg) |
| Camera effect | Timelapse Landscape | Clouds, light and crowds race by over time. | `/motion/128ab1d9-f6d3-4a06-8a5c-ba47f16e37ed` | [shot](screenshots/motion/motion_128ab1d9_f6d3_4a06_8a5c_ba47f16e37ed.jpg) |
| Camera effect | Timelapse Landscape | Clouds, light and crowds race by over time. | `/motion/51ef3ada-73fd-4663-a406-48f3ff6d2def` | [shot](screenshots/motion/motion_51ef3ada_73fd_4663_a406_48f3ff6d2def.jpg) |
| Transition | Roll Transition | Scene rolls forward like a wheel from the start frame to the end frame. | `/motion/8c4f184b-bccb-40ea-9c72-24793b8233ab` | [shot](screenshots/motion/motion_8c4f184b_bccb_40ea_9c72_24793b8233ab.jpg) |
| Transition | Roll Transition | Scene rolls forward like a wheel from the start frame to the end frame. | `/motion/a8e2bc3a-e78e-42aa-a0e6-79bc01141ed3` | [shot](screenshots/motion/motion_a8e2bc3a_e78e_42aa_a0e6_79bc01141ed3.jpg) |
| Character action | Action Run | Follows the subject sprinting with shaky, dynamic angles. | `/motion/89ee6db9-a56e-48e6-bdd4-806c528b3ba5` | [shot](screenshots/motion/motion_89ee6db9_a56e_48e6_bdd4_806c528b3ba5.jpg) |
| Character action | Action Run | Follows the subject sprinting with shaky, dynamic angles. | `/motion/c9feeb46-e10b-4199-a369-100bfd543725` | [shot](screenshots/motion/motion_c9feeb46_e10b_4199_a369_100bfd543725.jpg) |
| Character action | Baseball Kick | A powerful high kick with fast leg motion. | `/motion/c2ece0f5-8775-4f8e-924b-b134907b51ad` | [shot](screenshots/motion/motion_c2ece0f5_8775_4f8e_924b_b134907b51ad.jpg) |
| Character action | Basketball Dunks | Subject leaps and slams a basketball home. | `/motion/c7d10f77-969d-4145-bcaf-b373b6f0541d` | [shot](screenshots/motion/motion_c7d10f77_969d_4145_bcaf_b373b6f0541d.jpg) |
| Character action | Basketball Dunks | Subject leaps and slams a basketball home. | `/motion/ef9d53c6-1d26-4671-950e-ef2bd2a5b778` | [shot](screenshots/motion/motion_ef9d53c6_1d26_4671_950e_ef2bd2a5b778.jpg) |
| Character action | Boxing | Quick jabs, hooks and head movement. | `/motion/17a55db6-8775-4a9f-a2c9-d0d373bee590` | [shot](screenshots/motion/motion_17a55db6_8775_4a9f_a2c9_d0d373bee590.jpg) |
| Character action | Catwalk | Tracks a confident runway walk. | `/motion/a0a7c624-cf2a-4204-a9f8-60623d4a7383` | [shot](screenshots/motion/motion_a0a7c624_cf2a_4204_a9f8_60623d4a7383.jpg) |
| Character action | Crash Zoom In + Face Punch | Mix: zoom punches in as a blow lands. | `/motion/b58e69b3-a23a-4e5b-8901-f5b170a7755c` | [shot](screenshots/motion/motion_b58e69b3_a23a_4e5b_8901_f5b170a7755c.jpg) |
| Character action | Downhill POV | First-person ride down a slope with bumps and turns. | `/motion/67a2ba8e-7f5a-4969-95f8-1326f44ba784` | [shot](screenshots/motion/motion_67a2ba8e_7f5a_4969_95f8_1326f44ba784.jpg) |
| Character action | Face Punch | A punch lands on the subject's face. Top choice. | `/motion/91da0dd0-c8e1-4793-b77e-946e98bc7ebb` | [shot](screenshots/motion/motion_91da0dd0_c8e1_4793_b77e_946e98bc7ebb.jpg) |
| Character action | Face Punch | A punch lands on the subject's face. Top choice. | `/motion/cd5bfd11-5a1a-46e0-9294-b22b0b733b1e` | [shot](screenshots/motion/motion_cd5bfd11_5a1a_46e0_9294_b22b0b733b1e.jpg) |
| Character action | Kiss | An intimate kiss in soft focus or slow motion. | `/motion/38c80734-90b7-4fcb-8fc2-16a055d2b3ba` | [shot](screenshots/motion/motion_38c80734_90b7_4fcb_8fc2_16a055d2b3ba.jpg) |
| Character action | Kiss | An intimate kiss in soft focus or slow motion. | `/motion/ad85a3a8-919d-45a3-8fa6-0727fc7b7fe7` | [shot](screenshots/motion/motion_ad85a3a8_919d_45a3_8fa6_0727fc7b7fe7.jpg) |
| Character action | Moonwalk Left | Classic moonwalk gliding to the left. | `/motion/9ac92661-d0f7-4b5e-85b1-f3654cb4627b` | [shot](screenshots/motion/motion_9ac92661_d0f7_4b5e_85b1_f3654cb4627b.jpg) |
| Character action | Moonwalk Right | Classic moonwalk gliding to the right. | `/motion/c9da59da-aabd-4fd5-a7c8-f09a1d9f9f50` | [shot](screenshots/motion/motion_c9da59da_aabd_4fd5_a7c8_f09a1d9f9f50.jpg) |
| Character action | Push To Glass | Subject is squashed against an invisible pane of glass. | `/motion/aa555597-3d9b-4385-b9af-106fe7e995e2` | [shot](screenshots/motion/motion_aa555597_3d9b_4385_b9af_106fe7e995e2.jpg) |
| Character action | Push To Glass | Subject is squashed against an invisible pane of glass. | `/motion/d79c48c4-38ba-45d2-ae1c-70cd5924ccc3` | [shot](screenshots/motion/motion_d79c48c4_38ba_45d2_ae1c_70cd5924ccc3.jpg) |
| Character action | Skate Cruise | Relaxed street skating with no tricks. | `/motion/2f226790-7c90-4b17-be2b-b9f5ffe1510b` | [shot](screenshots/motion/motion_2f226790_7c90_4b17_be2b_b9f5ffe1510b.jpg) |
| Character action | Skateboard Glide | Board rolls along in a smooth glide. | `/motion/86f0a592-515a-4a10-bffe-910c6282cb44` | [shot](screenshots/motion/motion_86f0a592_515a_4a10_bffe_910c6282cb44.jpg) |
| Character action | Skateboard Ollie | Rider and board pop off the ground. | `/motion/ae714843-8507-42b3-9cdb-59661783fee5` | [shot](screenshots/motion/motion_ae714843_8507_42b3_9cdb_59661783fee5.jpg) |
| Character action | Ski Carving | A skier makes clean, fast turns. | `/motion/c7b26f66-9d34-44d7-9b18-c8e679e6a391` | [shot](screenshots/motion/motion_c7b26f66_9d34_44d7_9b18_c8e679e6a391.jpg) |
| Character action | Ski Powder | A skier cuts through deep powder. | `/motion/fbed32dc-6596-4abb-891e-73bfc21c8996` | [shot](screenshots/motion/motion_fbed32dc_6596_4abb_891e_73bfc21c8996.jpg) |
| Character action | Snowboard Carving | Deep snowboard turns that throw up spray. | `/motion/2b17efea-9ae2-4f68-a934-3e8722abb955` | [shot](screenshots/motion/motion_2b17efea_9ae2_4f68_a934_3e8722abb955.jpg) |
| Character action | Snowboard Powder | A snowboarder floats through fresh powder. | `/motion/c99c3417-31d0-47f0-8cc9-1b25dc5de023` | [shot](screenshots/motion/motion_c99c3417_31d0_47f0_8cc9_1b25dc5de023.jpg) |
| VFX | Action Run + Set on Fire | Mix: subject sprints while engulfed in flames. | `/motion/cb9fcdea-32f6-42e4-b2ba-ef7d51abe8e5` | [shot](screenshots/motion/motion_cb9fcdea_32f6_42e4_b2ba_ef7d51abe8e5.jpg) |
| VFX | Agent Reveal | Subject glitches and morphs into a suited agent. | `/motion/a5e7e831-c323-4f69-926f-74f31197809b` | [shot](screenshots/motion/motion_a5e7e831_c323_4f69_926f_74f31197809b.jpg) |
| VFX | Agent Reveal | Subject glitches and morphs into a suited agent. | `/motion/b6eb17bb-d336-46db-99c6-34f01ae754f3` | [shot](screenshots/motion/motion_b6eb17bb_d336_46db_99c6_34f01ae754f3.jpg) |
| VFX | Angel Wings | Wings unfold behind the shoulders. | `/motion/52ee95dd-087a-4f2a-b7e9-58f4d0abbef5` | [shot](screenshots/motion/motion_52ee95dd_087a_4f2a_b7e9_58f4d0abbef5.jpg) |
| VFX | Black Tears | Dark liquid streams from the eyes. | `/motion/6b49273d-2164-4af4-8e38-971ad7ab6516` | [shot](screenshots/motion/motion_6b49273d_2164_4af4_8e38_971ad7ab6516.jpg) |
| VFX | Bloom Mouth | Petals and flowers spill from an open mouth. | `/motion/32332330-5b5c-4dd1-913c-e39ed6dd4c43` | [shot](screenshots/motion/motion_32332330_5b5c_4dd1_913c_e39ed6dd4c43.jpg) |
| VFX | Building Explosion | A building blows up and debris flies. Top choice. | `/motion/0d53b135-337d-4918-aaf4-2af7ecf4f045` | [shot](screenshots/motion/motion_0d53b135_337d_4918_aaf4_2af7ecf4f045.jpg) |
| VFX | Building Explosion | A building blows up and debris flies. Top choice. | `/motion/e974bca9-c9eb-4cc8-9318-5676cc110f17` | [shot](screenshots/motion/motion_e974bca9_c9eb_4cc8_9318_5676cc110f17.jpg) |
| VFX | Building Explosion + Disintegration | Mix: a blast, then the structure crumbles to dust. | `/motion/816671cd-720b-4d90-a1d4-abbcb89be8ba` | [shot](screenshots/motion/motion_816671cd_720b_4d90_a1d4_abbcb89be8ba.jpg) |
| VFX | Car Chasing + Building Explosion | Mix: car chase as a building explodes beside it. | `/motion/54791805-4c3d-4878-ad38-eebded133f0b` | [shot](screenshots/motion/motion_54791805_4c3d_4878_ad38_eebded133f0b.jpg) |
| VFX | Car Explosion | A car bursts into flames and debris. | `/motion/41574f0a-2e5d-4b8c-8b9d-b3fef81151a5` | [shot](screenshots/motion/motion_41574f0a_2e5d_4b8c_8b9d_b3fef81151a5.jpg) |
| VFX | Car Explosion | A car bursts into flames and debris. | `/motion/e0394620-9694-441b-b3f8-a4230abcd9ac` | [shot](screenshots/motion/motion_e0394620_9694_441b_b3f8_a4230abcd9ac.jpg) |
| VFX | Clone Explosion | Subject splits into copies that burst outward. | `/motion/8b781031-3212-43bb-9fdd-02ea6098758c` | [shot](screenshots/motion/motion_8b781031_3212_43bb_9fdd_02ea6098758c.jpg) |
| VFX | Clone Explosion | Subject splits into copies that burst outward. | `/motion/9680aaf0-c5db-4204-833f-56f825bb350b` | [shot](screenshots/motion/motion_9680aaf0_c5db_4204_833f_56f825bb350b.jpg) |
| VFX | Crash Zoom In + Tentacles | Mix: fast zoom in as tentacles come out of the eyes. | `/motion/52862ad0-ca56-4a11-bb1d-cb0ca74f7971` | [shot](screenshots/motion/motion_52862ad0_ca56_4a11_bb1d_cb0ca74f7971.jpg) |
| VFX | Crash Zoom In + Tentacles | Mix: fast zoom in as tentacles come out of the eyes. | `/motion/6b658ac3-48a7-49a7-85cc-97af9ff50069` | [shot](screenshots/motion/motion_6b658ac3_48a7_49a7_85cc_97af9ff50069.jpg) |
| VFX | Diamond | Body turns into faceted, sparkling diamond. | `/motion/6acb0485-93c9-47ed-8320-868837022834` | [shot](screenshots/motion/motion_6acb0485_93c9_47ed_8320_868837022834.jpg) |
| VFX | Diamond | Body turns into faceted, sparkling diamond. | `/motion/8126eea1-263d-4e2a-9e27-da7296638522` | [shot](screenshots/motion/motion_8126eea1_263d_4e2a_9e27_da7296638522.jpg) |
| VFX | Disintegration | Subject breaks apart into dust or particles. Top choice. | `/motion/4e981984-1cdc-4b96-a2b1-1a7c1ecb822d` | [shot](screenshots/motion/motion_4e981984_1cdc_4b96_a2b1_1a7c1ecb822d.jpg) |
| VFX | Disintegration | Subject breaks apart into dust or particles. Top choice. | `/motion/eacdca06-1fe2-4402-b8d6-4dc32f2889c5` | [shot](screenshots/motion/motion_eacdca06_1fe2_4402_b8d6_4dc32f2889c5.jpg) |
| VFX | Duplicate | Subject splits into identical copies. | `/motion/20b46995-5991-48e0-8fcc-6b1f5dfb4c52` | [shot](screenshots/motion/motion_20b46995_5991_48e0_8fcc_6b1f5dfb4c52.jpg) |
| VFX | Duplicate | Subject splits into identical copies. | `/motion/44fb2e55-d1bf-4658-9281-55bb6317623a` | [shot](screenshots/motion/motion_44fb2e55_d1bf_4658_9281_55bb6317623a.jpg) |
| VFX | Fire Breathe | Subject breathes out a burst of flame. | `/motion/fe5d8fa7-a639-4167-a819-44877788300e` | [shot](screenshots/motion/motion_fe5d8fa7_a639_4167_a819_44877788300e.jpg) |
| VFX | Floating Fish | A pale blue fish swims through the air around the subject. | `/motion/66302844-ab6f-4c45-8171-807b6655148e` | [shot](screenshots/motion/motion_66302844_ab6f_4c45_8171_807b6655148e.jpg) |
| VFX | Flood | Water spreads and rises to fill the space. | `/motion/2a731e66-b6c9-472a-aa7b-aa0b90960245` | [shot](screenshots/motion/motion_2a731e66_b6c9_472a_aa7b_aa0b90960245.jpg) |
| VFX | Floral Eyes | Flowers blossom out of the face. | `/motion/15f877f1-ccf8-4cc3-8269-6c7cfb028259` | [shot](screenshots/motion/motion_15f877f1_ccf8_4cc3_8269_6c7cfb028259.jpg) |
| VFX | Flying + Set on Fire | Mix: subject flies through the air on fire. | `/motion/33a41f25-ef9d-4340-8d2d-be3e169e77d9` | [shot](screenshots/motion/motion_33a41f25_ef9d_4340_8d2d_be3e169e77d9.jpg) |
| VFX | Freezing | Subject frosts over and freezes solid. | `/motion/777f1604-afee-406d-a711-bf1e0ea23c86` | [shot](screenshots/motion/motion_777f1604_afee_406d_a711_bf1e0ea23c86.jpg) |
| VFX | Freezing | Subject frosts over and freezes solid. | `/motion/8b0ab021-b240-42bd-a6b5-4e28e8f19432` | [shot](screenshots/motion/motion_8b0ab021_b240_42bd_a6b5_4e28e8f19432.jpg) |
| VFX | Garden Bloom | Body gets covered in flowers and greenery. | `/motion/b25600ef-238e-448a-bb07-1ff74fd0207f` | [shot](screenshots/motion/motion_b25600ef_238e_448a_bb07_1ff74fd0207f.jpg) |
| VFX | Glowing Fish | Glowing fish swim around the subject. | `/motion/c1617bb8-2077-4a83-8448-f595fdea198c` | [shot](screenshots/motion/motion_c1617bb8_2077_4a83_8448_f595fdea198c.jpg) |
| VFX | Glowing Fish | Glowing fish swim around the subject. | `/motion/cc0d5c9a-4047-459f-acce-75811f0ba729` | [shot](screenshots/motion/motion_cc0d5c9a_4047_459f_acce_75811f0ba729.jpg) |
| VFX | Glowshift | A soft glow surrounds the subject as they become someone else. | `/motion/17539882-734b-4726-9e9a-1b1d92f4054c` | [shot](screenshots/motion/motion_17539882_734b_4726_9e9a_1b1d92f4054c.jpg) |
| VFX | Head Explosion | Head bursts in particles or fire. | `/motion/dbf3fbc1-f69c-4904-a063-104cf2998a40` | [shot](screenshots/motion/motion_dbf3fbc1_f69c_4904_a063_104cf2998a40.jpg) |
| VFX | Head Explosion | Head bursts in particles or fire. | `/motion/e0eb7a70-2fe7-4547-b3d6-dea44c41d41f` | [shot](screenshots/motion/motion_e0eb7a70_2fe7_4547_b3d6_dea44c41d41f.jpg) |
| VFX | Head Off | Head detaches and floats away while the body stands. | `/motion/645b3b79-f6f5-4e9b-83d7-f9dd526ac624` | [shot](screenshots/motion/motion_645b3b79_f6f5_4e9b_83d7_f9dd526ac624.jpg) |
| VFX | Innerlight | Light builds and shines from inside the subject. | `/motion/30d58d76-3149-4dee-9ffa-920a7ca6eb9e` | [shot](screenshots/motion/motion_30d58d76_3149_4dee_9ffa_920a7ca6eb9e.jpg) |
| VFX | Innerlight | Light builds and shines from inside the subject. | `/motion/5dacd377-f98b-4977-8603-714fe93231a8` | [shot](screenshots/motion/motion_5dacd377_f98b_4977_8603_714fe93231a8.jpg) |
| VFX | Innerlight | Light builds and shines from inside the subject. | `/motion/fda76db1-9720-4e24-a289-4cbf925987fd` | [shot](screenshots/motion/motion_fda76db1_9720_4e24_a289_4cbf925987fd.jpg) |
| VFX | Invisible | Subject vanishes, leaving only their movement behind. | `/motion/28a4d3d3-613a-4796-9f40-f68c7646ded5` | [shot](screenshots/motion/motion_28a4d3d3_613a_4796_9f40_f68c7646ded5.jpg) |
| VFX | Invisible | Subject vanishes, leaving only their movement behind. | `/motion/30802f12-3db4-49b8-b0ab-6f0c737b252e` | [shot](screenshots/motion/motion_30802f12_3db4_49b8_b0ab_6f0c737b252e.jpg) |
| VFX | Jelly Drift | Glowing jellyfish float in the air around the subject. | `/motion/61b802b1-4594-4758-9c4a-524f7bb39840` | [shot](screenshots/motion/motion_61b802b1_4594_4758_9c4a_524f7bb39840.jpg) |
| VFX | Levitation | Subject rises off the ground. | `/motion/52aa7be6-854f-45cb-930c-b98d64eb593c` | [shot](screenshots/motion/motion_52aa7be6_854f_45cb_930c_b98d64eb593c.jpg) |
| VFX | Levitation | Subject rises off the ground. | `/motion/b03ec615-8f3b-4058-a1b6-508ecaa27cb3` | [shot](screenshots/motion/motion_b03ec615_8f3b_4058_a1b6_508ecaa27cb3.jpg) |
| VFX | Levitation + Invisible | Mix: an unseen subject rises and only clothes float. | `/motion/68962439-c1e7-4e3f-a6b9-3efc967176c7` | [shot](screenshots/motion/motion_68962439_c1e7_4e3f_a6b9_3efc967176c7.jpg) |
| VFX | Medusa Gorgona | Skin hardens and cracks into grey stone. | `/motion/b157f3d0-f3d5-4b34-8fd1-ee034c43dd1c` | [shot](screenshots/motion/motion_b157f3d0_f3d5_4b34_8fd1_ee034c43dd1c.jpg) |
| VFX | Medusa Gorgona | Skin hardens and cracks into grey stone. | `/motion/b969c197-7906-48cb-bb06-313470ac1028` | [shot](screenshots/motion/motion_b969c197_7906_48cb_bb06_313470ac1028.jpg) |
| VFX | Melting | Subject softens and drips as if in great heat. | `/motion/d8c13031-7117-4a3d-9a30-6a00d0d408b4` | [shot](screenshots/motion/motion_d8c13031_7117_4a3d_9a30_6a00d0d408b4.jpg) |
| VFX | Melting | Subject softens and drips as if in great heat. | `/motion/ed15397e-0a3d-49e3-add4-b9529698a8ad` | [shot](screenshots/motion/motion_ed15397e_0a3d_49e3_add4_b9529698a8ad.jpg) |
| VFX | Morphskin | Skin ripples as the body morphs into a new identity. | `/motion/6308a9a6-877d-4fb1-be21-481638833983` | [shot](screenshots/motion/motion_6308a9a6_877d_4fb1_be21_481638833983.jpg) |
| VFX | Paint Splash | Subject bursts into splashing liquid paint. | `/motion/a1ee18d7-3705-4218-a05e-45b31badf04f` | [shot](screenshots/motion/motion_a1ee18d7_3705_4218_a05e_45b31badf04f.jpg) |
| VFX | Paint Splash | Subject bursts into splashing liquid paint. | `/motion/e520303a-70ed-4438-9306-830528fbdd29` | [shot](screenshots/motion/motion_e520303a_70ed_4438_9306_830528fbdd29.jpg) |
| VFX | Paparazzi | Camera flashes burst all around the subject. | `/motion/338774b2-47b1-4974-b0c6-ddc12488c468` | [shot](screenshots/motion/motion_338774b2_47b1_4974_b0c6_ddc12488c468.jpg) |
| VFX | Paparazzi | Camera flashes burst all around the subject. | `/motion/3d87df66-7d1e-4d1d-a3b1-faf901bdcaac` | [shot](screenshots/motion/motion_3d87df66_7d1e_4d1d_a3b1_faf901bdcaac.jpg) |
| VFX | Powder Explosion | Colored powder erupts around the subject. | `/motion/3ef68ba5-f61d-4e1b-8169-0910a10cf7b5` | [shot](screenshots/motion/motion_3ef68ba5_f61d_4e1b_8169_0910a10cf7b5.jpg) |
| VFX | Powder Explosion | Colored powder erupts around the subject. | `/motion/fc56f780-079b-4a4f-b135-09384440fe75` | [shot](screenshots/motion/motion_fc56f780_079b_4a4f_b135_09384440fe75.jpg) |
| VFX | Sand Storm | Sand blasts through and engulfs the scene. | `/motion/09b064d1-7a1e-4069-aca2-eca33ee06bca` | [shot](screenshots/motion/motion_09b064d1_7a1e_4069_aca2_eca33ee06bca.jpg) |
| VFX | Sand Storm | Sand blasts through and engulfs the scene. | `/motion/69f79677-5ca2-4481-99f0-562881316b7e` | [shot](screenshots/motion/motion_69f79677_5ca2_4481_99f0_562881316b7e.jpg) |
| VFX | Set on Fire | Subject bursts into flames. | `/motion/06b50d3a-65a9-432b-bf0b-493fc3dcc006` | [shot](screenshots/motion/motion_06b50d3a_65a9_432b_bf0b_493fc3dcc006.jpg) |
| VFX | Set on Fire | Subject bursts into flames. | `/motion/fdc223d4-9402-47c6-9e07-5801985b450e` | [shot](screenshots/motion/motion_fdc223d4_9402_47c6_9e07_5801985b450e.jpg) |
| VFX | Skin Surge | Hands, flowers or other forms push out through the skin. | `/motion/a03dfa10-3e92-43ed-a76a-fe9ba1395520` | [shot](screenshots/motion/motion_a03dfa10_3e92_43ed_a76a_fe9ba1395520.jpg) |
| VFX | Skin Surge | Hands, flowers or other forms push out through the skin. | `/motion/aae6a422-fee1-4b89-ac7a-aea5d484fc1b` | [shot](screenshots/motion/motion_aae6a422_fee1_4b89_ac7a_aea5d484fc1b.jpg) |
| VFX | Soul Jump | The soul leaps out of the body. | `/motion/2650aad0-190e-4574-bde6-8378071a4d7c` | [shot](screenshots/motion/motion_2650aad0_190e_4574_bde6_8378071a4d7c.jpg) |
| VFX | Soul Jump | The soul leaps out of the body. | `/motion/b8c1c065-2d00-4583-ac52-4e89ec2d2641` | [shot](screenshots/motion/motion_b8c1c065_2d00_4583_ac52_4e89ec2d2641.jpg) |
| VFX | Tentacles | Tentacles writhe out of the eyes. | `/motion/8fccea16-08b5-432c-8123-8456523e2d60` | [shot](screenshots/motion/motion_8fccea16_08b5_432c_8123_8456523e2d60.jpg) |
| VFX | Tentacles | Tentacles writhe out of the eyes. | `/motion/df6600e1-387d-44e8-a8cb-96762a6ee8de` | [shot](screenshots/motion/motion_df6600e1_387d_44e8_a8cb_96762a6ee8de.jpg) |
| VFX | Thunder God | Eyes glow and lightning flickers around the subject. | `/motion/52101885-ad45-4469-a885-ced767318452` | [shot](screenshots/motion/motion_52101885_ad45_4469_a885_ced767318452.jpg) |
| VFX | Thunder God | Eyes glow and lightning flickers around the subject. | `/motion/ca0568ee-6a0f-4134-a4ee-97dfe44753ba` | [shot](screenshots/motion/motion_ca0568ee_6a0f_4134_a4ee_97dfe44753ba.jpg) |
| VFX | Thunder God + Levitation | Mix: subject rises into the air amid lightning. | `/motion/8abe6573-591e-446a-9278-1f9bd274c03e` | [shot](screenshots/motion/motion_8abe6573_591e_446a_9278_1f9bd274c03e.jpg) |
| VFX | Thunder God + Turning Metal | Mix: subject turns to metal amid lightning. | `/motion/c839c180-cf06-4924-8ad5-ddea18c97122` | [shot](screenshots/motion/motion_c839c180_cf06_4924_8ad5_ddea18c97122.jpg) |
| VFX | Thunder God + Wind to Face | Mix: lightning eyes while wind blasts the face. | `/motion/4c43bd7f-9800-42ab-91c5-86afd3959080` | [shot](screenshots/motion/motion_4c43bd7f_9800_42ab_91c5_86afd3959080.jpg) |
| VFX | Turning Metal | Skin turns into reflective chrome, silver or gold. Top choice. | `/motion/46e23a6b-1047-40f1-9cf5-33f5f55ddf2e` | [shot](screenshots/motion/motion_46e23a6b_1047_40f1_9cf5_33f5f55ddf2e.jpg) |
| VFX | Turning Metal | Skin turns into reflective chrome, silver or gold. Top choice. | `/motion/ad8bffe9-17a9-493d-944d-7fe47275c663` | [shot](screenshots/motion/motion_ad8bffe9_17a9_493d_944d_7fe47275c663.jpg) |
| VFX | Turning Metal + Eyes In | Mix: metal spreads as the camera pushes into chrome eyes. | `/motion/7e7d313e-1fb1-44a4-bd89-ec66e1f17ec9` | [shot](screenshots/motion/motion_7e7d313e_1fb1_44a4_bd89_ec66e1f17ec9.jpg) |
| VFX | Turning Metal + Melting | Mix: subject liquefies into molten metal. | `/motion/017ae2b7-bcff-42ef-863e-6e198f96c3ec` | [shot](screenshots/motion/motion_017ae2b7_bcff_42ef_863e_6e198f96c3ec.jpg) |
| VFX | Wind to Face | Fierce wind whips hair, clothes and body. | `/motion/080d9f40-110d-4e74-bc93-bc4e9a9032d5` | [shot](screenshots/motion/motion_080d9f40_110d_4e74_bc93_bc4e9a9032d5.jpg) |
| VFX | Wind to Face | Fierce wind whips hair, clothes and body. | `/motion/52d0b18d-c098-4526-b576-b2838d34855e` | [shot](screenshots/motion/motion_52d0b18d_c098_4526_b576_b2838d34855e.jpg) |
| Style | Datamosh | Glitchy pixel smearing that bleeds between frames. | `/motion/007f9809-c63e-4f65-9976-3001cf699784` | [shot](screenshots/motion/motion_007f9809_c63e_4f65_9976_3001cf699784.jpg) |
| Style | Datamosh | Glitchy pixel smearing that bleeds between frames. | `/motion/1ec9ecaf-4e47-48c7-943c-5c2d651d7ad1` | [shot](screenshots/motion/motion_1ec9ecaf_4e47_48c7_943c_5c2d651d7ad1.jpg) |
| Other | General | All-purpose natural camera with no set move. Top choice. | `/motion/6e4e30fb-fe99-4df7-b3ab-10e16c6e0218` | [shot](screenshots/motion/motion_6e4e30fb_fe99_4df7_b3ab_10e16c6e0218.jpg) |
| Other | General | All-purpose natural camera with no set move. Top choice. | `/motion/d2389a9a-91c2-4276-bc9c-c9e35e8fb85a` | [shot](screenshots/motion/motion_d2389a9a_91c2_4276_bc9c_c9e35e8fb85a.jpg) |

#### Category counts

- Camera move: 95 pages, 49 distinct presets
- Camera effect: 27 pages, 14 distinct presets
- Transition: 2 pages, 1 distinct preset
- Character action: 24 pages, 19 distinct presets
- VFX: 77 pages, 49 distinct presets
- Style: 2 pages, 1 distinct preset
- Other: 2 pages, 1 distinct preset
- Total: 229 pages, 134 distinct presets, including 16 Mix pairs on 21 pages

### Effects hub

`/effects` (titled Visual Effects) is the current effects hub. The top navigation labels it Effects with a New badge, other pages' menus describe Effects 2.0 as "every viral preset and trending format", and the ChatGPT extension's `/effects` command opens Viral Presets. Each effect has a generator page at `/effects/use/<slug>` and a gallery at `/effects/examples/<slug>`. The generator page did not finish loading in our capture ("Loading effects"), so per-effect inputs come from the blog.

The hub lists 45 distinct effects. Some cards repeat (Infinite Clones three times; Eyes In, Cutout, Floating Fall and Vanish twice). Five slugs end in `-exported` (Earth Zoom, Mighty Fighter, Moonwalk, Blue Depth, Fairytale Castle), which suggests they were carried over from the older Motion library. Seven cards show Generate instead of Try for free, and all seven share their names with Mixed Media looks (Comic, Particles, Canvas, Tracking, LSD, Windows, Palette). So the hub mixes photo-to-video presets with video restyles. The hub gives no descriptions. Where a line below is marked as inferred from the name, we guessed from the title alone; descriptions for the newest batch come from the Viral Presets blog post.

| Effect | What it does | Type | Use | Examples |
| --- | --- | --- | --- | --- |
| Floating Fall | Subject drifts down through open sky. (inferred from the name) | Photo to video | `/effects/use/floating-fall` | `/effects/examples/floating-fall` |
| High Flip | Subject springs into a high flip. (inferred from the name) | Photo to video | `/effects/use/high-flip` | `/effects/examples/high-flip` |
| Burning Man | Subject catches fire. (inferred from the name) | Photo to video | `/effects/use/burning-man` | `/effects/examples/burning-man` |
| Scrapbook Collage | Photo becomes a cut and paste scrapbook collage. (inferred from the name) | Photo to video | `/effects/use/scrapbook-collage` | `/effects/examples/scrapbook-collage` |
| Comic | Illustrated comic book look. | Mixed media look | `/effects/use/comic` | `/effects/examples/comic` |
| Frozen in Motion | The moment freezes mid action. (inferred from the name) | Photo to video | `/effects/use/frozen-in-motion` | `/effects/examples/frozen-in-motion` |
| Particles | Luminous particles move through the shot. | Mixed media look | `/effects/use/particles` | `/effects/examples/particles` |
| Pigeons | Builds an absurd street scene around your photo. New badge. | Photo to video | `/effects/use/pigeons` | `/effects/examples/pigeons` |
| Pearl Earring | Puts you in Vermeer's Girl with a Pearl Earring, split screen with the original. New badge. | Photo to video | `/effects/use/pearl-earring` | `/effects/examples/pearl-earring` |
| Studio Slide | The background slides away to a photo studio. (inferred from the name) | Photo to video | `/effects/use/studio-slide` | `/effects/examples/studio-slide` |
| Incline | The world tilts steeply around the subject. (inferred from the name) | Photo to video | `/effects/use/incline` | `/effects/examples/incline` |
| Act Natural | Not described in the capture. | Photo to video | `/effects/use/act-natural` | `/effects/examples/act-natural` |
| Monster Dab | A monster appears and dabs. (inferred from the name) | Photo to video | `/effects/use/monster-dab` | `/effects/examples/monster-dab` |
| Clones | Subject multiplies into copies. (inferred from the name) | Photo to video | `/effects/use/clones` | `/effects/examples/clones` |
| Earth Zoom | Pulls back from the subject out to the whole Earth. (inferred from the name) | Photo to video | `/effects/use/earth-zoom-exported` | `/effects/examples/earth-zoom-exported` |
| Cutout | Subject is cut out as a flat shape. (inferred from the name) | Photo to video | `/effects/use/cutout` | `/effects/examples/cutout` |
| Mighty Fighter | Subject becomes a fighter character. (inferred from the name) | Photo to video | `/effects/use/mighty-fighter-exported` | `/effects/examples/mighty-fighter-exported` |
| Vanish | Subject disappears from the shot. (inferred from the name) | Photo to video | `/effects/use/vanish` | `/effects/examples/vanish` |
| Moonwalk | Subject moonwalks across the frame. (inferred from the name) | Photo to video | `/effects/use/moonwalk-exported` | `/effects/examples/moonwalk-exported` |
| Eyes In | Camera dives into an eye. (inferred from the name) | Photo to video | `/effects/use/eyes-in` | `/effects/examples/eyes-in` |
| Street Colossus | Subject towers over a street as a giant. (inferred from the name) | Photo to video | `/effects/use/street-colossus` | `/effects/examples/street-colossus` |
| Melting | Subject melts. (inferred from the name) | Photo to video | `/effects/use/melting` | `/effects/examples/melting` |
| Architecture Wave | Buildings ripple like a wave. (inferred from the name) | Photo to video | `/effects/use/architecture-wave` | `/effects/examples/architecture-wave` |
| Agamemnon | Subject steps out of a cinema screen as armored warriors storm the hall. New badge. | Photo to video | `/effects/use/agamemnon` | `/effects/examples/agamemnon` |
| Cyclope | Recreates Redon's The Cyclops with your subject. New badge. | Photo to video | `/effects/use/cyclope` | `/effects/examples/cyclope` |
| Canvas | Hand-drawn canvas artwork look. | Mixed media look | `/effects/use/canvas` | `/effects/examples/canvas` |
| Tracking | Tracking lines lock onto moving objects. | Mixed media look | `/effects/use/tracking` | `/effects/examples/tracking` |
| LSD | Waves of hallucinogenic color. | Mixed media look | `/effects/use/lsd` | `/effects/examples/lsd` |
| Blue Depth | Not described in the capture. | Photo to video | `/effects/use/blue-depth-exported` | `/effects/examples/blue-depth-exported` |
| Wild Ride | Not described in the capture. | Photo to video | `/effects/use/wild-ride` | `/effects/examples/wild-ride` |
| World Morphing | The world around the subject keeps changing. (inferred from the name) | Photo to video | `/effects/use/world-morphing` | `/effects/examples/world-morphing` |
| Stop World | Time stops around the subject. (inferred from the name) | Photo to video | `/effects/use/stop-world` | `/effects/examples/stop-world` |
| Bullet Time | Freezes an action scene for a 360 degree camera move. New badge. | Photo to video | `/effects/use/bullet-time` | `/effects/examples/bullet-time` |
| Infinite Clones | Endless copies of the subject. (inferred from the name) | Photo to video | `/effects/use/infinite-clones` | `/effects/examples/infinite-clones` |
| Superstar | Not described in the capture. | Photo to video | `/effects/use/superstar` | `/effects/examples/superstar` |
| Skatedog | A dachshund rolls down the street on a skateboard. New badge. | Photo to video | `/effects/use/skatedog` | `/effects/examples/skatedog` |
| Smash and Grab | Not described in the capture. | Photo to video | `/effects/use/smash-and-grab` | `/effects/examples/smash-and-grab` |
| Selfception | A picture inside a picture, again and again. (inferred from the name) | Photo to video | `/effects/use/selfception` | `/effects/examples/selfception` |
| Lacewalker | Not described in the capture. | Photo to video | `/effects/use/lacewalker` | `/effects/examples/lacewalker` |
| Boarding Pass | Not described in the capture. | Photo to video | `/effects/use/boarding-pass` | `/effects/examples/boarding-pass` |
| Lidar Transition | Transition through a lidar style point scan. (inferred from the name) | Photo to video | `/effects/use/lidar` | `/effects/examples/lidar` |
| Fallen Angel | Animates Cabanel's The Fallen Angel around your photo. New badge. | Photo to video | `/effects/use/fallen-angel` | `/effects/examples/fallen-angel` |
| Windows | Overlapping interface windows. | Mixed media look | `/effects/use/windows` | `/effects/examples/windows` |
| Fairytale Castle | Places the subject at a fairytale castle. (inferred from the name) | Photo to video | `/effects/use/fairytale-castle-exported` | `/effects/examples/fairytale-castle-exported` |
| Palette | Hand-painted color composition. | Mixed media look | `/effects/use/palette` | `/effects/examples/palette` |

How Effects 2.0 and Viral Presets relate:

- They are one library under two names. The blog calls it Viral Presets: more than 60 ready-made effects, each with built-in animation, location and style, refreshed to follow trends. Its latest update added 13. Seven of them carry a New badge on the hub (Agamemnon, Fallen Angel, Bullet Time, Cyclope, Pigeons, Pearl Earring, Skatedog). The other six (Monet Muse, Argus, Lost in a Book, Dolphin Ride, Penguin Ride, Puffin Ride) were not on the hub when we captured it. Another post also names Action Figure, Noir, Vintage and Knight's Diary as viral presets.
- Two families make up that update: living paintings (a split screen with the original painting below and your animated version above) and impossible rides (riding an animal that cannot be ridden), plus two cinematic reveals.
- Cost per 720p generation for the new batch runs from 27.5 credits (Pearl Earring) to 67.5 (Agamemnon, Bullet Time). Some presets stop at 720p and others go to 4K. Higgsfield pairs the library with a Virality Predictor app and with AI Influencer, which can drop a generated character straight into a viral preset.
- The older `/viral` page is a different thing: a 54-entry Motion collection that links to `/motion/<uuid>` pages. `/collection/effects` is likewise the older Motion effects collection. Higgsfield reuses the words "viral" and "effects" across both generations of the product.

### Mixed media presets (33)

Mixed Media restyles a video rather than animating a photo. The tool page (`/mixed-media`, titled "40+ AI Video Effects Library") has a template picker (Select a template, Browse Templates), an upload slot that accepts 1 to 10 seconds of video, an FPS setting (8 FPS shown), a Resolution setting (1K shown) and a Generate button, with tabs for All Presets, How it works and Community. The intro page (`/mixed-media-intro`) pitches it as an After Effects alternative for viral edits. It promises more than 40 looks across Neon, Doodle and Mixed Media styles, no prompts, and automated rotoscoping that applies the effect frame by frame. The steps are: upload a video, choose a preset, choose frame rate and resolution, optionally adjust advanced settings, then generate. Each preset page has only a name, a few-word tagline and sample clips; none names a model or a price. The look also appears as a Motion category in Marketing Studio, as an Explainer style, as an MCP skill (Editorial Motion Graphics) and, for seven looks, in the Effects hub.

Families are our own grouping: Color and light 11, Drawn and painted 8, Overlay and glitch 7, Paper and print 7.

| Family | Preset | Look | Route | Shot |
| --- | --- | --- | --- | --- |
| Color and light | Acid | Psychedelic neon color distortion. | `/mixed-media-presets/preset/b501a54d-7c2a-42f8-a47d-484cbdace0a6` | [shot](screenshots/mixed/mixed_media_presets_preset_b501a54d_7c2a_42f8_a47d_484cbdace0a6.jpg) |
| Color and light | Cold vision | Cold neon light and shadow. | `/mixed-media-presets/preset/d6ebc1b1-55b0-4379-8276-b46d47d8b056` | [shot](screenshots/mixed/mixed_media_presets_preset_d6ebc1b1_55b0_4379_8276_b46d47d8b056.jpg) |
| Color and light | Lava | Molten lava color in motion. | `/mixed-media-presets/preset/bb33da96-918c-4754-ba55-6d0dcbaf5173` | [shot](screenshots/mixed/mixed_media_presets_preset_bb33da96_918c_4754_ba55_6d0dcbaf5173.jpg) |
| Color and light | LSD | Hallucinogenic color waves. | `/mixed-media-presets/preset/c2b241c5-5239-4465-869f-fef60a06822e` | [shot](screenshots/mixed/mixed_media_presets_preset_c2b241c5_5239_4465_869f_fef60a06822e.jpg) |
| Color and light | Noir | Hard, cinematic noir lighting. | `/mixed-media-presets/preset/c92d1f34-8bc3-410a-99c4-4b8f387140ec` | [shot](screenshots/mixed/mixed_media_presets_preset_c92d1f34_8bc3_410a_99c4_4b8f387140ec.jpg) |
| Color and light | Ocean | Liquid sea-colored overlay. | `/mixed-media-presets/preset/19115d24-276e-4222-a23f-39cc23d9a326` | [shot](screenshots/mixed/mixed_media_presets_preset_19115d24_276e_4222_a23f_39cc23d9a326.jpg) |
| Color and light | Overexposed | Blown-out, extreme exposure. | `/mixed-media-presets/preset/1c79bffd-0839-42c3-90ab-2cd7e6ff4619` | [shot](screenshots/mixed/mixed_media_presets_preset_1c79bffd_0839_42c3_90ab_2cd7e6ff4619.jpg) |
| Color and light | Random Glow | Random bursts of glow. | `/mixed-media-presets/preset/f1706661-007e-424b-8734-b755d602d580` | [shot](screenshots/mixed/mixed_media_presets_preset_f1706661_007e_424b_8734_b755d602d580.jpg) |
| Color and light | Toxic | Radioactive neon color blast. | `/mixed-media-presets/preset/fd3ca94d-6c3d-443f-970b-a4e8dd7338da` | [shot](screenshots/mixed/mixed_media_presets_preset_fd3ca94d_6c3d_443f_970b_a4e8dd7338da.jpg) |
| Color and light | Two color | High-contrast two-tone grade. | `/mixed-media-presets/preset/ac3612ce-b1c9-4034-a04b-b46732c2d7a3` | [shot](screenshots/mixed/mixed_media_presets_preset_ac3612ce_b1c9_4034_a04b_b46732c2d7a3.jpg) |
| Color and light | Ultraviolet | Neon ultraviolet glow. | `/mixed-media-presets/preset/c9682e42-9891-4118-86bb-f8cf79c84055` | [shot](screenshots/mixed/mixed_media_presets_preset_c9682e42_9891_4118_86bb_f8cf79c84055.jpg) |
| Drawn and painted | Akrill | Layered acrylic color blocks. | `/mixed-media-presets/preset/73f9e01d-eb92-41d6-9119-53cc2686ecfa` | [shot](screenshots/mixed/mixed_media_presets_preset_73f9e01d_eb92_41d6_9119_53cc2686ecfa.jpg) |
| Drawn and painted | Canvas | Hand-drawn artwork on canvas. | `/mixed-media-presets/preset/1a722581-6ba0-48b2-b990-a177a3f26cc8` | [shot](screenshots/mixed/mixed_media_presets_preset_1a722581_6ba0_48b2_b990_a177a3f26cc8.jpg) |
| Drawn and painted | Comic | Illustrated comic book look. | `/mixed-media-presets/preset/94cd1315-c820-4314-806d-f1b0936e8a46` | [shot](screenshots/mixed/mixed_media_presets_preset_94cd1315_c820_4314_806d_f1b0936e8a46.jpg) |
| Drawn and painted | Flash comic | Punchy, high-energy comic panels. | `/mixed-media-presets/preset/3fbd5057-50e1-4d1d-9a6f-8655836711b8` | [shot](screenshots/mixed/mixed_media_presets_preset_3fbd5057_50e1_4d1d_9a6f_8655836711b8.jpg) |
| Drawn and painted | Hand paint | Loose, freehand brushwork. | `/mixed-media-presets/preset/ad8401a0-39a2-4c95-b65e-1634d41378ab` | [shot](screenshots/mixed/mixed_media_presets_preset_ad8401a0_39a2_4c95_b65e_1634d41378ab.jpg) |
| Drawn and painted | Palette | Hand-painted blocks of color. | `/mixed-media-presets/preset/15b97a49-9912-4a58-8424-b4ef1c302a05` | [shot](screenshots/mixed/mixed_media_presets_preset_15b97a49_9912_4a58_8424_b4ef1c302a05.jpg) |
| Drawn and painted | Sketch | Textured hand-drawn line work. | `/mixed-media-presets/preset/6377b231-5cea-4259-8a6b-0314728c1982` | [shot](screenshots/mixed/mixed_media_presets_preset_6377b231_5cea_4259_8a6b_0314728c1982.jpg) |
| Drawn and painted | Vintage | Hand-inked illustration style. | `/mixed-media-presets/preset/ee12f76c-ed17-4471-bf2e-52bda1bcae64` | [shot](screenshots/mixed/mixed_media_presets_preset_ee12f76c_ed17_4471_bf2e_52bda1bcae64.jpg) |
| Overlay and glitch | Broken mirror | Shattered mirror reflections. | `/mixed-media-presets/preset/5d89951e-ac83-4c7f-ac47-4d8db50c835e` | [shot](screenshots/mixed/mixed_media_presets_preset_5d89951e_ac83_4c7f_ac47_4d8db50c835e.jpg) |
| Overlay and glitch | Bubbles | Dreamy soap bubble texture. | `/mixed-media-presets/preset/dacdca94-27b2-417a-bc8c-6d4168e6109a` | [shot](screenshots/mixed/mixed_media_presets_preset_dacdca94_27b2_417a_bc8c_6d4168e6109a.jpg) |
| Overlay and glitch | Fragments | Abstract fragments layered over the image. | `/mixed-media-presets/preset/525fc0d7-abf1-49e5-a3e6-2f97eb50973c` | [shot](screenshots/mixed/mixed_media_presets_preset_525fc0d7_abf1_49e5_a3e6_2f97eb50973c.jpg) |
| Overlay and glitch | Multiverse | Layers of reality colliding. | `/mixed-media-presets/preset/c38c2630-3986-4e28-858f-596fd254e5e9` | [shot](screenshots/mixed/mixed_media_presets_preset_c38c2630_3986_4e28_858f_596fd254e5e9.jpg) |
| Overlay and glitch | Particles | Glowing particles moving through the shot. | `/mixed-media-presets/preset/386ebb9d-643f-4108-a12f-3f867f18fb36` | [shot](screenshots/mixed/mixed_media_presets_preset_386ebb9d_643f_4108_a12f_3f867f18fb36.jpg) |
| Overlay and glitch | Tracking | Tracking lines that follow objects. | `/mixed-media-presets/preset/9fa35d36-e5f4-4488-9068-8813bd232a22` | [shot](screenshots/mixed/mixed_media_presets_preset_9fa35d36_e5f4_4488_9068_8813bd232a22.jpg) |
| Overlay and glitch | Windows | Overlapping computer interface windows. | `/mixed-media-presets/preset/4f7a1589-c604-44e5-b0ec-bc87d3929906` | [shot](screenshots/mixed/mixed_media_presets_preset_4f7a1589_c604_44e5_b0ec_bc87d3929906.jpg) |
| Paper and print | Cannabis | Smoky psychedelic poster look. | `/mixed-media-presets/preset/c90cd302-d409-48fd-8643-36c34d7798e4` | [shot](screenshots/mixed/mixed_media_presets_preset_c90cd302_d409_48fd_8643_36c34d7798e4.jpg) |
| Paper and print | Layer mixed media | Stacked collage of mixed materials. | `/mixed-media-presets/preset/6ff15c8c-de78-459e-af32-e7a1266dc075` | [shot](screenshots/mixed/mixed_media_presets_preset_6ff15c8c_de78_459e_af32_e7a1266dc075.jpg) |
| Paper and print | Magazine | Printed magazine page look. | `/mixed-media-presets/preset/963c3300-8967-4880-b078-c956de4c1e12` | [shot](screenshots/mixed/mixed_media_presets_preset_963c3300_8967_4880_b078_c956de4c1e12.jpg) |
| Paper and print | Marble | Sculpted marble finish. | `/mixed-media-presets/preset/ff617894-b1bc-4931-85b3-1e5b159d2106` | [shot](screenshots/mixed/mixed_media_presets_preset_ff617894_b1bc_4931_85b3_1e5b159d2106.jpg) |
| Paper and print | Modern | Clean, geometric minimalism. | `/mixed-media-presets/preset/9196d356-1406-43ef-bc68-cb26e7eaf507` | [shot](screenshots/mixed/mixed_media_presets_preset_9196d356_1406_43ef_bc68_cb26e7eaf507.jpg) |
| Paper and print | Origami | Crisp folded-paper geometry. | `/mixed-media-presets/preset/8c88dac7-0314-40b4-b611-5dcd3fda004d` | [shot](screenshots/mixed/mixed_media_presets_preset_8c88dac7_0314_40b4_b611_5dcd3fda004d.jpg) |
| Paper and print | Paper | Handmade paper texture over the footage. | `/mixed-media-presets/preset/f63bf420-f98a-44e6-ba54-3f7eaa599d40` | [shot](screenshots/mixed/mixed_media_presets_preset_f63bf420_f98a_44e6_ba54_3f7eaa599d40.jpg) |

### Other preset libraries

| Library | Where | Count | What a preset sets | Notes |
| --- | --- | --- | --- | --- |
| Genjutsu presets | `/higgsfield-genjutsu-presets`, Video, Higgsfield Genjutsu | 30+ (blog) | A ready-made Motion transfer or Object swap applied to a source video of 4 to 30 seconds | Tabs for Higgsfield, Community trending and Community new. Up to 30 reference images, output up to 1080p. A 15 second clip costs 40, 104 or 144 credits at 480p, 720p or 1080p. Restyle (Sep 30, 2026) adds 20+ animation styles or custom styles built from references. Also sold as the Genjutsu API |
| Katana presets | `/katana`, and inside Claude through MCP (`/katana`, `/katana/<preset-name>`) | Not stated (10 cards in the capture) | A prepared reference edit: its motion, its style and a prompt that places your assets | Categories: Personalized edits, Style transfer, Motion transfer. Sources: Higgsfield or Community. The changelog names the styles Aura Farming, Motion and Clipping. Up to 5 photos per edit. A community preset needs a 3 to 30 second video, up to 40 images and a prompt that tags them with @; it goes live at once |
| Soul style presets | Image, Soul and Soul 2.0 | 20+ (21 named for Soul 2.0) | An aesthetic register for image generation | Soul groups presets as General, TikTok Core, Instagram Aesthetics, Beauty, Mood, Camera Photo and Graphic Art. Soul 2.0 names Warm Ambient, Retro BW, Y2K Street, Subtle Flash, Y2K Studio, Street Photography, Theatrical Light, Asian Nostalgia, Editorial Street Style, Surreal Solarization, Flash Editorial, Digital Camera, Siren, Swag Era, Mystique City, Balletcore, Candy Pop, 2000s Band, Frutiger Aero, Drain and Old Smartphone. Presets stack with Moodboard, Soul HEX and Soul ID. Soul Cinema has no presets |
| Camera controls | `/camera-controls` | 65 entries ("50+") | DoP camera moves | Part of the Motion library above |
| Cinema Studio presets | Cinema Studio | 30+ camera movement presets, 10 Camera MoveSet styles, 6 lighting presets, 50+ color palettes | The camera and lighting register of a shot | Named moves include POV, Robot Arm, Pan Left and Helicopter Shot. Lighting presets: Soft Cross, Overhead Fall, Contre-jour, Window, Practicals, Silhouette (plus Auto or a manual build). Genres such as Action, Epic and Noir. Users can save their own camera setups |
| Viral, UGC and Commercial collections | `/viral`, `/ugc`, `/commercial` | 54, 45, 27 | DoP presets themed for trends, creator-style clips and brand work | UGC adds names such as Outfit Check, Selfie Posing, Morning Routine and Plate Check; Commercial adds Yacht, Exploded View and Red Carpet |
| Catch the Pulse | `/collection/catch-the-pulse`, a DoP category | Not captured | A curated themed set of DoP presets | Linked from the Visual effects collection |
| Sora 2 presets | `/sora-2-ai-video-presets`, `/sora-trends/tiktok` | 10 named | Attach a photo, pick a preset, generate at 720p or 1080p | A blog post says the Sora app closed on April 26, 2026, the API retires on September 24, 2026, and these preset formats now run on Seedance 2.0. Named presets: Unpacking, Luxury Ad, Minimalist Corporate, Dynamic Sport Ad, First-Person POV with Product, Reaction, Gen-Z TikTok Edit, ASMR, Streamer Highlight, Epic Fail |
| Shorts Studio presets | `/shorts-studio` | 40+ | Pacing and visual treatment for cutting a video of up to 2 minutes into shorts | Users can build a preset from their own references |
| Explainer presets | `/explainer` | 6 named, more unnamed | Visual style and motion logic for a whole explainer | Pixel Art, Claymotion, Mixed Media, 3D Papercraft, 2D Illustrator, Whiteboard Doodle |
| Marketing Studio presets | Marketing Studio, and the product-photoshoot CLI skill | 10 image and 9 video in the skill | Ad formats | Image: product shot, lifestyle scene, close up with person, Pinterest pin, hero banner, social carousel, ad creative pack, virtual model try-on, conceptual product, restyle. Video: UGC, Tutorial, Unboxing, Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On, Pro Virtual Try On. On the web, the Motion category offers Hypermotion, 2D Product Motion, Mixed Media and Motion Design |
| Smaller pickers | AI Influencer, AI Motion Design, Lipsync Studio, Audio | Not counted | AI Influencer motion presets (Higgsfield Presets and Community Trends tabs), one-click Motion Presets for code-based motion graphics, Lipsync presets, and built-in voice presets | Higgsfield Apps, the one-click effect apps, are covered in the apps section; the app builder also offers a Preset App template |

### Coverage in ComfyField today

ComfyField's `src/lib/formats/motion.js` has 34 camera moves in three groups (Basic 12, Epic 12, Feel 10), a Mix two moves format with 12 move options, and 21 effects. Moves run on Wan 2.2 and effects on LTX Video, each from one photo plus an optional note. Cinema shot (lens and movement choices) and Transition (morph, whip pan, zoom through, match cut) cover a few more Higgsfield presets. The table compares the 134 distinct captured motion presets and the 45 Effects hub entries. Covered means a format with the same result; partial means a close format that lacks the direction, variant or subject the Higgsfield preset has.

| Higgsfield group | Covered in ComfyField | Partial | Missing |
| --- | --- | --- | --- |
| Motion, camera move (49) | 3D Rotation (Turntable), Car Grip (Car mount), Crane Down (Boom down), Crane Over The Head (Crane up), Crane Over The Head + Crash Zoom In (Mix two moves with Crane up and Crash zoom), Crane Up (Crane up), Crash Zoom In (Crash zoom), Dolly In (Dolly in), Dolly Out (Dolly out), Dolly Zoom In (Dolly zoom), Eyes In (Eyes in effect), Flying (Drone flyover), FPV Drone (FPV dive), Handheld (Handheld), Jib Down (Boom down), Jib Up (Crane up), Lazy Susan + Super Dolly Out (Mix two moves with Orbit and Dolly out), Robo Arm (Robo arm), Snorricam (Snorricam), Static (Still camera), Super Dolly In (Dolly in), Super Dolly Out (Dolly out), Through Object In (Through the window), Tilt Down (Tilt down), Tilt up (Tilt up), Whip Pan (Whip pan), Zoom In (Zoom in), Zoom Out (Zoom out) | 360 Orbit (closest: Orbit, half circle only), Arc Left (closest: Orbit, no direction choice), Arc Right (closest: Orbit, no direction choice), Car Chasing (closest: Car mount), Dolly Left (closest: Tracking shot, no direction choice), Dolly Right (closest: Tracking shot, no direction choice), Dolly Zoom Out (closest: Dolly zoom, push-in version only), Earth Zoom Out (closest: Sky pull back), Head Tracking (closest: Snorricam), Lazy Susan (closest: Orbit) | Buckle Up, Crash Zoom Out, Double Dolly, Glam, Mouth In, Object POV, Overhead, Rap Flex, Through Object Out, Wiggle, YoYo Zoom |
| Motion, camera effect (14) | Bullet Time (Bullet time), Fisheye (Cinema shot, Fisheye lens), Focus Change (Rack focus), Hyperlapse (Hyperlapse), Low Shutter (Slow shutter), Timelapse Landscape (Time lapse effect) | FPV Drone + Timelapse Landscape (closest: FPV dive and Time lapse exist, but Mix does not offer them), Lens Crack (closest: Shatter, which breaks the image rather than the lens), Lens Flare (closest: Cinema shot, anamorphic flares), Snorricam + Low Shutter (closest: Snorricam and Slow shutter exist, but Mix does not offer them) | Dirty Lens, Dutch Angle, Incline, Timelapse Human |
| Motion, transition (1) | None | Roll Transition (closest: Transition styles or 360 roll) | None |
| Motion, character action (19) | None | Downhill POV (closest: POV walk) | Action Run, Baseball Kick, Basketball Dunks, Boxing, Catwalk, Crash Zoom In + Face Punch, Face Punch, Kiss, Moonwalk Left, Moonwalk Right, Push To Glass, Skate Cruise, Skateboard Glide, Skateboard Ollie, Ski Carving, Ski Powder, Snowboard Carving, Snowboard Powder |
| Motion, VFX (49) | Disintegration (Turn to sand, Pixel dissolve), Freezing (Turn to ice), Paint Splash (Paint splash) | Garden Bloom (closest: Burst into petals), Levitation (closest: Floating fall, Balloon lift), Powder Explosion (closest: Paint splash) | Action Run + Set on Fire, Agent Reveal, Angel Wings, Black Tears, Bloom Mouth, Building Explosion, Building Explosion + Disintegration, Car Chasing + Building Explosion, Car Explosion, Clone Explosion, Crash Zoom In + Tentacles, Diamond, Duplicate, Fire Breathe, Floating Fish, Flood, Floral Eyes, Flying + Set on Fire, Glowing Fish, Glowshift, Head Explosion, Head Off, Innerlight, Invisible, Jelly Drift, Levitation + Invisible, Medusa Gorgona, Melting, Morphskin, Paparazzi, Sand Storm, Set on Fire, Skin Surge, Soul Jump, Tentacles, Thunder God, Thunder God + Levitation, Thunder God + Turning Metal, Thunder God + Wind to Face, Turning Metal, Turning Metal + Eyes In, Turning Metal + Melting, Wind to Face |
| Motion, style (1) | None | Datamosh (closest: Glitch out) | None |
| Motion, other (1) | General (Plain image to video in Create) | None | None |
| Effects hub (45) | Floating Fall (Floating fall), High Flip (High flip), Studio Slide (Studio slide), Eyes In (Eyes in), Street Colossus (Street giant), World Morphing (World morph), Bullet Time (Bullet time), Selfception (Selfception) | Comic (closest: Storyboard comic look, images only), Frozen in Motion (closest: Bullet time), Earth Zoom (closest: Sky pull back), Vanish (closest: Pixel dissolve, Turn to sand), Stop World (closest: Bullet time) | Burning Man, Scrapbook Collage, Particles, Pigeons, Pearl Earring, Incline, Act Natural, Monster Dab, Clones, Cutout, Mighty Fighter, Moonwalk, Melting, Architecture Wave, Agamemnon, Cyclope, Canvas, Tracking, LSD, Blue Depth, Wild Ride, Infinite Clones, Superstar, Skatedog, Smash and Grab, Lacewalker, Boarding Pass, Lidar Transition, Fallen Angel, Windows, Fairytale Castle, Palette |
| Mixed media (33) | None | Comic, Origami, Paper, Sketch (closest: still image looks in Storyboard, the Origami fold effect and the Explainer paper cutout style; none restyle an uploaded video) | All 33 as video-to-video looks |
| Hub-only motion names (125, not captured as pages) | Pan Left (Pan left), Pan Right (Pan right), Portal (Portal), Glitch (Glitch out), Balloon (Balloon lift) | Aerial Pullback (closest: Sky pull back), Rapid Zoom In (closest: Crash zoom), Road Rush (closest: Car mount), Sakura Petals (closest: Burst into petals), Seamless Transition (closest: Transition, morph), Flying Cam Transition (closest: Transition) | The other 114, for example Timelapse Glam, BTS, Hero Cam, Eating Zoom, Giant Grab, Money Rain, Point Cloud, Wireframe, X-ray, Werewolf and the transition family (Raven, Splash, Melt, Flame, Smoke, Hand, Hole, Jump, Display, Column Wipe) |

Totals: of 134 distinct motion presets, 38 are covered, 20 partial and 76 missing. Of 45 Effects hub entries, 8 are covered, 5 partial and 32 missing. That makes 108 captured presets with no ComfyField equivalent and 25 partial. Incline and Melting count twice, because Higgsfield runs each as a separate preset in both libraries; by unique name the figure is 106. Mixed Media (33) and the 114 uncovered hub-only names come on top.

Where the gaps cluster:

- Character actions: 18 of 19 are missing (fights, kisses, dance, ski, skate, snowboard, basketball). ComfyField has no action presets beyond High flip.
- Transformation and element VFX: 43 of 49 are missing (metal, diamond, fire, lightning, explosions, clones, creature growths).
- Direction and speed variants: Higgsfield ships Arc Left and Arc Right, Dolly Left and Dolly Right, both Dolly Zoom directions, Crash Zoom In and Out, and Super Dolly variants as separate presets, where ComfyField has one move each.
- Mix: Higgsfield's 16 pairs mix VFX with camera moves (Crash Zoom In + Tentacles). ComfyField's Mix two moves only chains its 12 camera moves.
- Video-to-video looks: nothing in ComfyField restyles an uploaded clip the way the 33 Mixed Media looks or the seven mixed-media cards in the Effects hub do.
- ComfyField formats with no captured Higgsfield twin: Tilt reveal, Spiral up, 360 roll, Earthquake shake, Snow globe, Origami fold, Hologram, Shatter, Pixel dissolve and Roller coaster (Higgsfield sells the last as a separate app).

---

## Model catalog and landing pages

Higgsfield's marketing site is built around 135 captured landing pages: 26 model intro pages covering 25 models, 6 model community galleries, 15 product intro pages, 84 use-case pages written for search, and 4 company pages. The model pages share one template: a hero with a Generate button, a three-step how-to (add a reference, write a prompt, generate), feature blocks, a "25 million users" testimonial wall, a copy of the plan cards and a FAQ. Nearly every model page links to two places: the shared generator with the model preselected (`/ai/video?model=...` or `/ai/image?model=...`) and a Supercomputer handoff (`/start/agent?model=...`). The use-case pages come off a single CMS template, and the drafts at `/sandbox` and `/previews` show its block types. Each page names a job ("AI hairstyle changer"), embeds a working prompt bar with a default model (Nano Banana Pro for images, Seedance 2.0 for video, Kling 3.0 Omni Edit for video edits, ElevenLabs v3 for audio), then repeats a fixed pattern: example prompts, a feature grid, "how to" steps, a "top AI models" list and a "why Higgsfield" block. Most of these pages send users to the same few composers, so the page count overstates how many distinct tools Higgsfield has. Two model pages are empty stubs (`/flux-3` and `/seedance-2-5` show only the footer), and the user count on these pages varies between 11, 24 and 25 million. Captured 2026-10-16.

### Models Higgsfield sells

One row per model. Specs are as Higgsfield pitches them on the intro page. Where the page left a gap, the help center and changelog fill it in, marked "(help)" or "(changelog)". Credit costs come from the pricing compare table.

| Model | Vendor | Type | Headline capabilities as pitched | Routes to | Route | Shot |
|---|---|---|---|---|---|---|
| Kling 3.0 | Kuaishou | Video | Up to 15 s with duration control; 4K; native dialogue, effects and ambience; voices bound to characters in 5 languages; up to 6 cuts per generation with shot size and camera set per segment; image references. Help adds Turbo, Motion Control (up to 30 s), Omni and Omni Edit variants. About 7 credits per 5 s at 720p, 30 at 4K | `/ai/video?model=kling3_0`; agent `/start/agent?model=kling3_0&mode=video` | `/kling-3.0` | [shot](screenshots/marketing/kling_3_0.jpg) |
| Seedance 2.5 | ByteDance | Video | 30 s in one take; native 1080p; up to 50 references (30 images, 10 clips, 10 audio files per help); audio made in the same pass; region edit that repaints one area; motion guidance from a reference; 9:16 to 21:9. Help: 4 to 30 s, Pro and Plus plans and above | `/ai/video?model=seedance_2_5` | `/seedance/2.5`, plus the empty stub `/seedance-2-5` | [shot](screenshots/marketing/seedance_2_5.jpg) (both routes save to this file) |
| Seedance 2.0 | ByteDance | Video | Native 4K; up to 15 s; multi-camera storytelling with audio sync; one-sentence recreation of trending clips; frame-level locking of characters and fonts. Help: 9 images, 3 clips and 3 audio refs; Fast and Mini variants at 480p to 720p. About 22 credits per 5 s at 720p, 110 at 4K | `/ai/video?model=seedance_2_0` | `/seedance/2.0` | [shot](screenshots/marketing/seedance_2_0.jpg) |
| Seedance Pro | ByteDance | Video presets | Multi-shot, fast generation with effects. The page is a gallery of 25 one-click motion presets (beach ride, flashback, outfit switch, red carpet and others) | 25 `/motion/<id>` preset pages | `/seedance` | [shot](screenshots/marketing/seedance.jpg) |
| Wan 3.0 | Alibaba | Video | Up to 30 s, double what earlier Wan models allowed; up to six linked shots from one prompt, one line per shot; faces held across cuts and across generations through Soul ID; native audio; up to 12 references at once. Changelog: up to 1080p; Wan 3.0 Prime variant | `/ai/image?model=wan3_0` and `/mobile/image/wan3_0` (the menu uses `/ai/video?model=wan3_0`) | `/wan-3-0` | [shot](screenshots/marketing/wan_3_0.jpg) |
| Wan 2.6 | Alibaba | Video | 15 s scenes; native audio with lip sync; the model handles camera transitions on its own; reshoots from a video reference with a new world; physics. 480p to 1080p | `/ai/video?model=wan2_6` | `/wan-2.6` | [shot](screenshots/marketing/wan_2_6.jpg) |
| Wan 2.5 | Alibaba | Video | HD with synced voice and lip motion; text-to-video and image reference; 480p, 720p and 1080p; pitched as a Veo 3 alternative with "unlimited" generations | `/ai/video?model=wan2_5_video` | `/wan-ai-video` | [shot](screenshots/marketing/wan_ai_video.jpg) |
| Wan 2.2 Animate | Alibaba | Video (character animation) | Animates a still character (photo, cartoon, mascot) by copying the motion of a reference video | Generate button only, no model link captured | `/wan-animate-ai-video` | [shot](screenshots/marketing/wan_animate_ai_video.jpg) |
| MiniMax H3 | MiniMax | Video | Up to 9 images, 3 clips and 3 audio tracks in one prompt, each cited by name; 2K with stereo sound mixed in; edits by instruction (swap a product, relight day to night); legible text and animated UI; physics. API: up to 15 s | `/ai/video?model=minimax_h3` | `/minimax/h3` | [shot](screenshots/marketing/minimax_h3.jpg) |
| MiniMax Hailuo 02 | MiniMax | Video presets | Presets and VFX that need no prompt: a gallery of 77 effects (explosion, vampire, money rain, X-ray and others). Pricing: 512p to 1080p in 6 s units | 77 `/motion/<id>` preset pages | `/minimax` | [shot](screenshots/marketing/minimax.jpg) |
| Veo 3.1 and Veo 3.1 Fast | Google | Video | 1080p, 8 s; three modes: start and end frame (2 images), up to 3 reference images, and text-to-video. The full model takes text and references, Fast takes text and start/end frames. The page does not mention audio. About 40 credits per 4 s (Fast about 16) | `/veo3.1-preview`, `/veo3.1-fast` (menu: `/ai/video?model=veo-3-1-preview`) | `/veo3.1` | [shot](screenshots/marketing/veo3_1.jpg) |
| Gemini Omni Flash 1.1 | Google | Video, generate and edit | 4K; extends a scene in 10 s steps using up to 10 s of prior context; start and end frames; recuts up to 30 s of real footage by plain-language direction; mixes clips, stills and audio; motion and style transfer; character swap from one image; sketch to video | `/ai/video?model=gemini-omni-flash-1-1` | `/gemini-omni-flash` | [shot](screenshots/marketing/gemini_omni_flash.jpg) |
| Sora 2 | OpenAI | Video | Synchronized sound; image reference; 480p, 720p and 1080p. Duration not stated. Pricing lists Sora 2, Pro, Max and Pro Max in 4 s units (about 10 to 54 credits). Five spin-off pages target YouTube, TikTok, Reels, Shorts and presets | `/ai/video?model=sora2_video` | `/sora-2` | [shot](screenshots/marketing/sora_2.jpg) |
| Grok Imagine | xAI | Video | Fastest generation pitch: 24 fps video in under 20 s (as little as 5 s); audio and picture in one pass; identity kept from a single photo; camera and lighting directed in plain language | `/ai/video?model=grok_video` | `/grok-imagine` | [shot](screenshots/marketing/grok_imagine.jpg) |
| Grok Imagine 1.5 | xAI | Video | Turns one frame into motion while keeping its detail and light; chain clips into longer scenes. Changelog: 1 to 15 s, 480p to 1080p, 24 fps, up to 7 references, extension mode; a Lite variant exists | `/ai/video?model=grok_video_v15` | `/grok-imagine-1.5` | [shot](screenshots/marketing/grok_imagine_1_5.jpg) |
| Flux 3 | Black Forest Labs | Image and video | The page is an empty stub. Changelog: FLUX 3 Image for text-to-image and image-to-image at 768p to 4K, in photo, illustration, poster, collage and editorial styles | Nothing on the page (menu: `/ai/image?model=flux-3-image`, `/ai/video?model=flux_3_video`) | `/flux-3` | [shot](screenshots/marketing/flux_3.jpg) |
| FLUX.2 | Black Forest Labs | Image | Structured JSON prompts for angle, lens, shot type and mood; exact HEX colors; native prompts in languages such as Korean or Thai; infographics; physics and world knowledge. Pricing: Pro 1, Flex 3 and Max 4 credits per image | `/ai/image?model=flux_2` | `/flux-2-intro` | [shot](screenshots/marketing/flux_2_intro.jpg) |
| GPT Image 2 | OpenAI | Image | Native 4K; over 95% text accuracy, including Chinese, Japanese and Korean on curved surfaces; posters, packaging and UI mockups; a character or product locked across a campaign; optional guide image | `/start/agent?model=imagegen_2_0` (nav: `/ai/image?model=gpt_image_2`) | `/gpt-2` | [shot](screenshots/marketing/gpt_2.jpg) |
| Nano Banana 2.1 | Google | Image | 1K, 2K or 4K, plus extreme ratios down to 1:8 and 8:1; up to 14 references (changelog: consistency for 4 characters and 10 objects); images generated from an uploaded video; multi-turn chat edits; thinking mode with web search; outputs signed with C2PA | No link on the page (menu: `/ai/image?model=nano-banana-2-1`) | `/nano-banana-2-1-intro` | [shot](screenshots/marketing/nano_banana_2_1_intro.jpg) |
| Seedream 5.0 Lite | ByteDance | Image | Up to 4K; pulls live web context into the image; multi-step reasoning; learns an edit from one before-and-after pair and applies it to a new image | `/ai/image?model=seedream_v5_lite` | `/seedream-5.0` | [shot](screenshots/marketing/seedream_5_0.jpg) |
| Seedream 5.0 Pro | ByteDance | Image | Up to 2K on the page (the meta description says 4K); single-instruction edits that leave the rest intact; web grounding on by default; one-pass infographics and charts; native text in 14 languages; 9 aspect ratios including Auto | `/ai/image?model=seedream_v5_pro` | `/seedream-5.0-pro` | [shot](screenshots/marketing/seedream_5_0_pro.jpg) |
| Ideogram 4.5 | Ideogram | Image, edit-first | Change color, material or one detail and keep the rest; sketch to finished image; product colorways; reframe from 1:1 to 16:9 or 9:16 with a generated background; small-area edits blended back. Changelog: 1K or 2K, up to 4 style references, text replace and translate, transparent backgrounds | No link on the page | `/ideogram-4-5-intro` | [shot](screenshots/marketing/ideogram_4_5_intro.jpg) |
| Recraft V4.1 Styles | Recraft | Image, style lock | Reads a style from 1 to 10 references, with no training; Precise or Flexible adherence per generation; consistent across a 50-frame batch; holds characters and IP; saved styles reused later; 1K shown | No link on the page (menu: `/ai/image?model=recraft-v4-1`) | `/recraft-v4-styles` | [shot](screenshots/marketing/recraft_v4_styles.jpg) |
| Soul 2.0 | Higgsfield | Image | Higgsfield's own photo model for fashion and culture; 20+ curated presets at launch; Soul ID keeps one face across styles; Soul HEX pulls colors from a reference; Soul Moodboard; text or image input. 0.12 credits per image | `/ai/image?model=soul-v2`, `/moodboard`, `/character` | `/soul-intro` | [shot](screenshots/marketing/soul_intro.jpg) |
| Soul (first version) | Higgsfield | Image presets | "First high-aesthetic photo model"; the meta description says 50+ presets, while the page shows about 120 preset tiles (selfie, CCTV, Y2K, quiet luxury and others). 0.25 credits per image | 120 `/soul/<id>` preset pages | `/soul` | [shot](screenshots/marketing/soul.jpg) |

**Model community galleries.** Five pages are thin galleries that sit next to a model page, and a sixth, Sora video, redirects to the main Community feed.

| Page | What it shows | Route | Shot |
|---|---|---|---|
| Kling 3.0 community | A "limited offer, exclusive access" banner and an Explore button; no gallery content captured | `/kling-30-community` | [shot](screenshots/marketing/kling_30_community.jpg) |
| Seedance 2.5 community | A copy of the Seedance 2.5 intro page | `/seedance-2-5-community` | [shot](screenshots/marketing/seedance_2_5_community.jpg) |
| Wan 2.5 community | A one-line pitch and a Generate button | `/wan-video` | [shot](screenshots/marketing/wan_video.jpg) |
| Soul community | A Soul image gallery with a link to Soul 2.0 | `/soul-community` | [shot](screenshots/marketing/soul_community.jpg) |
| Mixed Media gallery | About 35 Mixed Media style tiles (acid, comic, origami, noir and others) | `/mixed-media-community` | [shot](screenshots/marketing/mixed_media_community.jpg) |
| Sora video | Redirects to `/community`: featured projects, Higgsfield Grants and the Discord stage | `/sora-video` | [shot](screenshots/marketing/sora_video.jpg) |

**Linked but not captured.** Footers and "explore more" blocks also link to intro pages for Nano Banana Pro, Nano Banana, GPT Image 1.5, Sora 2 Upscale, Kling 3 (`/kling-3`), Kling 2.6, Seedream 5, Seedream 4.5, Seedance 1.5, FLUX Max, FLUX.2 Pro, Veo 3.1 Preview and Fast, Popcorn, OpenAI Hazel, GPT Astra, and "Claude AI" image and video generator pages. None of these pages were captured.

### Product intro pages

| Product | What the page promises | Route | Shot |
|---|---|---|---|
| Cinema Studio 4 | Direct a film scene by scene. Six genres that change how the model stages a scene; an era slider that regrades the film (1960 to 2020); camera moves as stackable `#` tags; up to 50 references, each checked for protected content; real-time co-directing with a team; the Mr. Higgs assistant for camera, light and shot breakdown; any video model per shot; AI Cast, project brief, emotions, subfolders and Canvas inside the project | `/cinematic-video-generator` (button to `/cinema-studio`) | [shot](screenshots/marketing/cinematic_video_generator.jpg) |
| Marketing Studio | Product shots, UGC videos, ads, marketplace images, posters and motion graphics built around one product. Recreate any template with your product; hundreds of looks in six formats; posters with editable layers; a product imported from a link; 100+ avatars or a custom one from Soul; closeup, faceless, full-body, editorial or UGC framing; 9 video modes (TV spot, UGC, tutorial, product review, unboxing, UGC try-on, hyper motion, pro try-on, wild card) | `/marketing-studio-intro` | [shot](screenshots/marketing/marketing_studio_intro.jpg) |
| Marketing automation | The same Marketing Studio pitched as automation, "powered by Hermes Agent". An e-commerce URL becomes product ads and an app URL becomes screen-demo UGC, with dozens of variations, 40+ avatars, the 9 modes and Seedance 2.0 | `/marketing-automation` (button to `/marketing-studio?tool=url-to-ad`) | [shot](screenshots/marketing/marketing_automation.jpg) |
| Ads Studio | A website becomes a batch of static ads. It researches how the category sells, turns each selling point into an ad angle, pulls the logo, colors, products and prices from the site, saves a reusable brand kit, and runs up to 10 products in one go (changelog: up to 20 ads per product) | `/ads-studio-intro` | [shot](screenshots/marketing/ads_studio_intro.jpg) |
| Genjutsu | Reshape an existing video. Motion transfer keeps the motion, camera and timing and rebuilds the cast, set and look from references. Object swap changes chosen elements and keeps the rest. Batch mode; before/after slider | `/genjutsu` (button to `/start/genjutsu`) | [shot](screenshots/marketing/genjutsu.jpg) |
| AI Influencer | Build a persona at Average, Bold or Extreme intensity from your face or from scratch. Pick a trending motion or upload a 3 to 30 s clip, and Genjutsu animates it. Swap outfit, product or place and keep the take. Also available inside ChatGPT | `/ai-influencer` | [shot](screenshots/marketing/ai_influencer.jpg) |
| Mixed Media | Pitched as an After Effects alternative for viral edits. Upload a video, pick one of 40+ looks (neon, doodle, sketch), set frame rate and resolution, and get a 10 s stylized scene. Rotoscoping is automatic, with no prompt needed | `/mixed-media-intro` (button to `/mixed-media`) | [shot](screenshots/marketing/mixed_media_intro.jpg) |
| AI Motion Design | A code-to-video engine. A chat prompt becomes animation code; you add logos, SVGs or footage, apply motion presets, tune colors, safe zones, easing and fonts in a visual inspector, and render up to 4K. Infographics, kinetic captions and logo reveals | `/ai-motion-design` | [shot](screenshots/marketing/ai_motion_design.jpg) |
| Higgsfield Layers | Split a flat image into editable layers, then retype text, edit a region, relight, remove the background or upscale, all on one canvas. Draw to edit and a skin enhancer. "Powered by Seedream 5.0" | `/higgsfield-layers` (tool at `/layers`) | [shot](screenshots/marketing/higgsfield_layers.jpg) |
| Explainer | Narrated 2D videos up to 10 minutes that keep the same characters, style and voice throughout, with 9:16 and 16:9 from one render. Available in the Explainer studio, in Supercomputer and through MCP. Use cases: episodic shorts, bedtime stories, brand explainers | `/explainer-intro` | [shot](screenshots/marketing/explainer_intro.jpg) |
| Supercomputer | One agent for the whole creative team. "AI employees" with skill packs (Cartoon Animator 24 skills, Motion Designer 43, Podcast Producer 4, Product Photographer 24); an Orchestrator that picks the model for each step; memory; 30+ connectors (Slack, Drive, Notion, Gmail, Figma); slash-command skills; project files; scheduled tasks; frontier text models (Claude Opus, GPT-5.5 Pro, Gemini 3.1 Pro); memory and skills imported from Claude, Claude Code, Codex and ChatGPT. Outputs include research docs, live sites and 5 to 10 minute films | `/supercomputer-intro` | [shot](screenshots/marketing/supercomputer_intro.jpg) |
| App Builder | Full-stack apps (design, code, database, sign-in) from one sentence, inside Supercomputer or through MCP. Apps call Higgsfield's photo, video and 3D models with no keys; end users sign in with Higgsfield and spend their own credits; SEO and a security check at publish; custom domains on paid plans; a marketplace where others remix apps. Claims Lovable cannot do this | `/app-builder-intro` | [shot](screenshots/marketing/app_builder_intro.jpg) |
| Games | Playable browser games from a prompt, through Supercomputer or MCP. Hosting and a share link are automatic, multiplayer rooms can be switched on, and 3D assets are generated from a sentence. The page names Opus 4.8 and Fable 5 as the best agents for it | `/games-intro` (button to `/supercomputer/gaming`) | [shot](screenshots/marketing/games_intro.jpg) |
| Academy webinar | A 75-minute live session on September 30, 2026, "from more ads to better ads", for performance and e-commerce teams: one brief into 50+ testable concepts, hooks and variants, and agents that learn from performance data. Registration form | `/academy-webinar-290926` | [shot](screenshots/marketing/academy_webinar_290926.jpg) |
| Higgsfield for Good | Free access for non-profits, students and professors: apply in 5 minutes, with review within 2 weeks. All three applications were closed at capture | `/higgsfield-for-good` | [shot](screenshots/marketing/higgsfield_for_good.jpg) |

**Company pages.** These are also captured and feed the platform section.

| Page | What it says | Route | Shot |
|---|---|---|---|
| About | Launched in 2025; 25M+ users, 850M+ generations (about 6M a day), 300M+ videos (about 2M a day); 200+ releases; headquartered in San Francisco | `/about` | [shot](screenshots/marketing/about.jpg) |
| Trust | 24M+ creators, a $1.3B valuation, Stripe payments, model-level content filtering, Earn payout figures (see section 8) | `/trust` | [shot](screenshots/marketing/trust.jpg) |
| Blog | The Creator Hub blog, 22 pages of guides, listicles and editorials; the newest post is dated Oct 14, 2026 | `/blog` | [shot](screenshots/marketing/blog.jpg) |
| Contact | Help Center, Discord and support@higgsfield.ai | `/contact` | [shot](screenshots/marketing/contact.jpg) |

### Use-case landing pages

All 84 search pages, grouped by theme. "Sends users to" combines the prompt bar's default model with the tools named in the page's how-to steps. "Dedicated tool elsewhere" says whether Higgsfield has a tool for this job beyond the generic composer. "None" means the job exists only as a landing page plus a prompt. These pages are the fullest list of jobs Higgsfield claims to do.

**Image editing (12)**

| Page | Use case | Sends users to | Dedicated tool elsewhere | Route |
|---|---|---|---|---|
| AI image editing | Inpaint by description: erase, fix lighting, reimagine part of a photo | Edit image with Nano Banana Pro inpaint | Inpaint (Edit image) | `/image-editing` |
| AI photo editor | Fill, remove, replace, enhance, restore and colorize photos by prompt | Create image (Nano Banana Pro), Upscale, Background Remover | Inpaint; restore and colorize are prompt-only | `/ai-image-editor` |
| AI hairstyle changer | New cut, color, braids or beard on your own photo, face kept | Create image (Nano Banana Pro; Seedream, FLUX, GPT Image 2, Soul 2.0 suggested) | None | `/ai-hairstyle-changer` |
| AI clothes changer | Swap an outfit by prompt or garment photo | Create image (Nano Banana Pro; mask with Nano Banana 2, Seedream 5.0 Pro or Ideogram) | Outfit swap app | `/ai-clothes-changer` |
| AI age progression | Older or younger you; use both as start and end frames to animate | Create image (Nano Banana Pro), then Create video | None | `/ai-age-progression` |
| AI object remover | Erase people, wires, clutter or your own watermarks from a photo | Create image edit (Nano Banana Pro, or a mask on Nano Banana 2 or Seedream 5.0 Pro) | Inpaint | `/ai-object-remover` |
| Remove text from image | Erase captions, signs, date stamps or your own watermarks | Create image edit (Nano Banana Pro, GPT Image, Seedream, Ideogram) | None (Layers has text editing) | `/remove-text-from-image` |
| AI background generator | Remove, replace or generate a photo background with matched light | Create image (Nano Banana Pro, GPT Image 2.5 transparent output), Image Background Remover | Background remover app | `/ai-background-generator` |
| AI image extender | Outpaint, uncrop, convert ratios, make panoramas | Create image (Nano Banana Pro), Expand image, Upscale | Expand image app | `/ai-image-extender` |
| AI unblur image | Sharpen a blurry photo, denoise, enhance faces, 2K or 4K | Upscale (ByteDance or Topaz) | Upscale | `/ai-unblur-image` |
| AI image enhancer | Lift overall photo quality with no prompt | Upscale (ByteDance 2K/4K or Topaz) | Upscale | `/ai-image-enhancer` |
| AI image upscaler | 2K, 4K or any size with Topaz sharpening and recovery | Upscale | Upscale | `/ai-image-upscaler` |

**Video editing (9)**

| Page | Use case | Sends users to | Dedicated tool elsewhere | Route |
|---|---|---|---|---|
| Video to video AI | Restyle a clip (anime, claymation, film) or swap objects, outfits and backgrounds, motion kept | Edit video (Kling 3.0 Omni Edit; FLUX 3 Video Edit) | Edit video, Genjutsu | `/video-to-video` |
| AI video editor | Edit footage by text: remove, replace, restyle, swap backgrounds, then reframe and upscale | Edit video (Kling 3.0 Omni Edit, Kling Motion Control) | Edit video | `/ai-video-editor` |
| Remove object from video | Name what to erase and the gap is filled frame by frame | Edit video (Kling 3.0 Omni Edit) | None beyond an Edit video prompt | `/remove-object-from-video` |
| Remove text from video | Erase subtitles, captions, your own logos and overlays | Edit video (Kling 3.0 Omni Edit std, pro or 4K, or FLUX 3 Video Edit) | None beyond an Edit video prompt | `/remove-text-from-video` |
| AI video background changer | Replace a background with no green screen | Edit video (Kling 3.0 Omni Edit) plus Video Background Remover | Video background remover | `/ai-video-background-changer` |
| Add text to video | Captions, titles, lower thirds and CTAs described in a prompt | Edit video (Kling 3.0 Omni Edit) | None beyond an Edit video prompt | `/add-text-to-video` |
| AI video extender | Add seconds before or after a clip, up to 30 s scenes | Cinema Studio 4.0 forward and backward extend | Cinema Studio extend | `/ai-video-extender` |
| AI video upscaler | 1080p, 2K or 4K at up to 60 fps, frame interpolation, presets | Upscale (ByteDance or Topaz) | Video upscale | `/ai-video-upscaler` |
| AI video sharpener | Make a soft clip crisp, up to 4K and 60 fps | Upscale (ByteDance or Topaz) | Video upscale | `/ai-video-sharpener` |

**Avatars and voice (10)**

| Page | Use case | Sends users to | Dedicated tool elsewhere | Route |
|---|---|---|---|---|
| AI avatar generator | 40+ stock presenters, or one generated from text with Soul 2.0, for ads and demos | Marketing Studio ("powered by Hermes Agent") | Marketing Studio avatar library | `/ai-avatar-generator` |
| AI talking avatar | A photo plus a script or audio becomes a lip-synced presenter; localize it | Lipsync Studio, voices from Audio (Eleven v4, Qwen Audio) | Lipsync Studio | `/ai-talking-avatar` |
| AI human generator | Fictional people, full body or close-up, for ads, UGC and fashion | Create image (Nano Banana Pro; Soul, Seedream 4.5, GPT Image 2.5) | AI Influencer, Soul ID | `/ai-human-generator` |
| AI human video generator | Lifelike people on camera with native sound | Create video (Seedance 2.0, Veo 3.1, Kling); Lipsync Studio for a script | None (generic video) | `/ai-human-video-generator` |
| AI voice generator | TTS, cloning, dubbing and multi-speaker dialogue in 74+ languages | Audio (ElevenLabs v3 default; MiniMax, Seed Speech, VibeVoice) | Audio | `/ai-voice-generator` |
| AI voice cloning | Clone your own voice from a short sample after a consent step | Audio (ElevenLabs v3) | Audio | `/voice-cloning` |
| AI text to speech | Any text read aloud; MP3, WAV or OGG | Audio voiceover (ElevenLabs v3) | Audio | `/text-to-speech` |
| AI voice changer | Swap the speaker's voice in a video; dub into 18 languages | Audio change voice (Seed Audio, Eleven v4) | Audio change voice | `/ai-voice-changer` |
| AI voice over | Narrate a script, sync to video, dub | Audio (ElevenLabs v3, Eleven v4, MiniMax Speech 2.8 HD) | Audio | `/ai-voice-over` |
| AI video translator | Translate, revoice and lip-sync a video into 18 languages | Audio translate (Seed Speech); Supercomputer localization | Audio translate | `/ai-video-translator` |

**Ads and marketing (13)**

| Page | Use case | Sends users to | Dedicated tool elsewhere | Route |
|---|---|---|---|---|
| AI ad generator | A product URL becomes a finished video ad in about 2 minutes, 9 formats, 40+ avatars | Marketing Studio | Marketing Studio | `/ai-ad-generator` |
| URL to video AI | A product page, site or social profile becomes a 12 to 15 s ad; dub into 18 languages; Reframe | Marketing Studio | Marketing Studio | `/url-to-video` |
| AI marketing video maker | A photo or link becomes ads, UGC with avatars, product shots and posters with a brand kit | Marketing Studio | Marketing Studio | `/ai-marketing-video-maker` |
| AI commercial generator | A link, image or prompt becomes UGC ads and spokesperson spots with hooks and voiceover | Marketing Studio | Marketing Studio | `/ai-commercial-generator` |
| AI product video generator | Ads, 360 spins, lifestyle scenes and demos from one product photo | Create video (Seedance, Kling, Veo), Reframe, Upscale | Marketing Studio | `/ai-product-video-generator` |
| AI product photography | Studio, lifestyle and on-model shots that keep the label | Create image (Nano Banana Pro, GPT Image 2, Seedream 4.5); Marketing Studio | Marketing Studio product shots, Packshot app | `/ai-product-photography` |
| AI brand video generator | Brand films, logo animations, voiceovers, campaign variants | Create video (Seedance 2.0); Cinema Studio presets | None (generic video) | `/ai-brand-video-generator` |
| AI business video maker | Presenter-led demos and announcements, localized to English, Spanish or French | Supercomputer (avatar presenter or narrated explainer) | Supercomputer skills | `/ai-business-video-generator` |
| AI banner generator | Web banners, display ads, social covers with headlines and CTAs | Create image (Nano Banana Pro) | None (Ads Studio covers static ads) | `/ai-banner-generator` |
| AI logo generator | A business name becomes icons, wordmarks and combination marks, up to 4K | Create image (Nano Banana Pro; FLUX 3, Ideogram, Recraft V4.1), Background Remover | None | `/ai-logo-generator` |
| AI design generator | Posters, social graphics and mockups, delivered as images rather than editable files | Create image (Nano Banana Pro, Recraft V4.1) | None | `/ai-design-generator` |
| AI thumbnail generator | YouTube thumbnails with bold text, face cutouts and variants | Create image (Nano Banana Pro) | None | `/ai-thumbnail-generator` |
| AI presentation maker | Slide images, 16:9 backgrounds, title art and short clips for PowerPoint, Keynote or Slides | Create image (Nano Banana Pro); Supercomputer for a video version | None | `/ai-presentation-maker` |

**Story and long-form (9)**

| Page | Use case | Sends users to | Dedicated tool elsewhere | Route |
|---|---|---|---|---|
| AI storyboard generator | Plan a sequence as storyboard frames with locked characters, then send it to Sora 2 | Higgsfield Popcorn (8 scenes, 16:9 in the demo) | Popcorn | `/storyboard-generator` |
| AI long video generator | Build a long video scene by scene, 30 s per generation, with extend and consistent references | Cinema Studio 4.0 | Cinema Studio | `/ai-long-video-generator` |
| AI movie maker | Direct each scene's genre, era, tempo, camera, lens and color with a fixed cast | Cinema Studio | Cinema Studio | `/ai-movie-generator` |
| AI story generator | An idea becomes a written, illustrated and narrated story video with subtitles | Supercomputer (Faceless Video skill) | Supercomputer skill | `/ai-story-generator` |
| AI explainer video maker | A topic or script becomes a narrated explainer with subtitles | Supercomputer (Faceless Video, Shorts Maker, Animated Infographics) | Explainer, Supercomputer | `/ai-explainer-video-maker` |
| Script to video AI | A pasted script becomes scenes in one style with one narrator and burned-in subtitles | Supercomputer | Supercomputer skill | `/script-to-video` |
| AI animation generator | 2D, 3D, anime, cartoon or claymation clips with lip sync and a steady cast | Create video (Seedance 2.0); Cinema Studio up to 30 s | None (generic video) | `/ai-animation-generator` |
| AI anime video generator | A prompt, photo or real footage becomes anime with voices and sound | Create video (Seedance 2.0); Edit video for footage | None (generic video) | `/ai-anime-video-generator` |
| AI podcast generator | An episode becomes 9:16 reels, talking-host clips, covers and dubbed versions | Supercomputer (Personal Clipper and others) | Supercomputer skills | `/ai-podcast-generator` |

**Social and fun (22)**

| Page | Use case | Sends users to | Dedicated tool elsewhere | Route |
|---|---|---|---|---|
| Sora 2 video presets | A photo plus a preset look becomes a Sora 2 clip | Sora 2 with Effects presets | Effects | `/sora-2-ai-video-presets` |
| Sora 2 YouTube generator | A prompt or preset becomes a YouTube video | Sora 2 ("create unlimited") | None | `/sora-2-youtube` |
| Sora 2 TikTok generator | Viral TikToks from a prompt or preset | Sora 2 | None | `/sora-2-tiktok` |
| Sora 2 Reels generator | Instagram Reels from presets | Sora 2 ("create unlimited") | None | `/sora-2-reels` |
| Sora 2 Shorts generator | YouTube Shorts from a prompt | Sora 2 ("create unlimited") | None | `/sora-2-shorts` |
| AI short video generator | Clip the best moment of a YouTube video, hook-led explainers, single shots | Supercomputer (Personal Clipper, Shorts Maker, Faceless Video) | Shorts Studio, Supercomputer skills | `/ai-short-video-generator` |
| AI event video maker | Narrated birthday, wedding or holiday video with subtitles; animate your photos | Supercomputer; Create video for photos | None | `/ai-event-video-maker` |
| AI anniversary video maker | Your years together as a narrated picture story | Supercomputer; Create video for photos | None | `/ai-anniversary-video-maker` |
| AI invitation video maker | Animated wedding, birthday or party invite from a prompt or photo | Create video (Seedance 2.0) | None | `/ai-invitation-video-maker` |
| AI profile picture generator | A few selfies become anime, cartoon, realistic or fantasy profile pictures | Create image (Nano Banana Pro), Outpaint, Upscale | Soul ID, headshot app | `/ai-profile-picture-generator` |
| AI portrait generator | A selfie becomes studio, editorial or painterly portraits up to 4K | Create image (Nano Banana Pro, Soul) | Soul, headshot app | `/ai-portrait-generator` |
| AI cartoon generator | Selfies, family photos and pets become 3D, 2D or comic characters | Create image (Nano Banana Pro) | None | `/ai-cartoon-generator` |
| AI anime generator | Shonen, shojo, chibi and manga panels from a selfie, prompt or sketch | Create image (Nano Banana Pro) | None | `/ai-anime-generator` |
| AI art generator | Paintings, drawings, anime and illustration from text, a photo or a sketch | Create image (Nano Banana Pro) | None (generic image) | `/ai-art-generator` |
| AI drawing generator | Illustrations, comics, tattoos, coloring pages, storyboards | Create image (Nano Banana Pro) | None | `/ai-drawing-generator` |
| AI sketch generator | Pencil, charcoal, pen and ink, marker or line art | Create image (Nano Banana Pro) | None | `/ai-sketch-generator` |
| AI wallpaper generator | Phone, desktop and 4K wallpapers, with space left for the clock | Create image (Nano Banana Pro), Expand, Upscale | None | `/ai-wallpaper-generator` |
| AI animal generator | Pets, wildlife, hybrids and fantasy creatures | Create image (Nano Banana Pro) | None | `/ai-animal-generator` |
| AI animal video generator | A pet photo becomes a cute or talking animal clip with sound | Create video (Seedance 2.0, Grok Imagine) | None | `/ai-animal-video-generator` |
| AI car video generator | One car photo becomes rolling shots, orbits or drifts with engine sound | Create video (Seedance 2.0) | None | `/ai-car-video-generator` |
| AI nature video generator | A landscape photo becomes a living scene with water, wind and camera moves | Create video (Seedance 2.0) | None | `/ai-nature-video-generator` |
| AI slow motion video maker | Slow-motion splashes, sports and product shots from text or a photo | Create video (Seedance 2.0) | None | `/ai-slow-motion-video-maker` |

**Utilities (9)**

| Page | Use case | Sends users to | Dedicated tool elsewhere | Route |
|---|---|---|---|---|
| AI image generator | Every image model in one place: text, 4K, consistency | Create image (Nano Banana Pro default); Cinema Studio pitch | Create image | `/ai-image` |
| AI video generator | Every video model, with camera and motion control | Create video (Seedance 2.0, 8 s, sound on by default); Cinema Studio | Create video | `/ai-video` |
| Text to video AI | Prompts or scripts become cinematic clips with voiceover | Create video (Seedance 2.0) | Create video | `/text-to-video-ai` |
| Image to video AI | Animate a photo, portrait or product with lip sync and camera moves | Create video (Seedance 2.0) | Create video | `/image-to-video-ai` |
| Sketch to video AI | Drawings, storyboard frames and doodles become short clips that keep the hand-drawn look | Create video (Seedance 2.0) | None in the web app (the plugins have Draw to video) | `/sketch-to-video-ai` |
| AI background video generator | Looping motion backdrops for websites, streams, slides and stages | Create video (Seedance 2.0), with the same image as start and end frame | None | `/ai-background-video-generator` |
| AI prompt generator | A rough idea becomes a model-ready prompt for any Higgsfield model | Supercomputer | None | `/ai-prompt-generator` |
| Nano Banana Pro prompt guide | Prompt templates for spatial layouts, negative constraints and physics | Nano Banana Pro (Recreate) | Not a tool (a guide) | `/nano-banana-pro-prompt-guide` |
| Sora 2 prompt guide | Short and high-control prompt sets for viral Sora 2 clips | Sora 2 | Not a tool (a guide) | `/sora-2-prompt-guide` |

**Jobs that exist only as a landing page.** 36 of the 84 pages have no tool of their own. They are a prompt-bar preset on Create image, Create video or Edit video, or a Supercomputer prompt.

- Image: hairstyle change, age progression, remove text from a photo, logos, banners, thumbnails, slide visuals, design mockups, cartoons, anime art, general art, drawings and coloring pages, sketches, wallpapers, animals.
- Video: remove an object or text from a video, add captions and titles, brand films, human video, animation and anime video, invitations, car, nature, animal and slow-motion clips, looping backgrounds, sketch to video, and the four Sora 2 platform pages.
- Agent jobs (Supercomputer prompts with no studio): event and anniversary videos, prompt writing.

For ComfyField, these are cheap formats: each is one default model plus a tuned prompt template and a ratio. Several already exist as ComfyField formats (Erase an object, Expand, Try on outfits, Slow motion, Coloring book page, Draw to video, Explainer video, Faceless video). The clear gaps are hairstyle change, age progression, logo, thumbnail, banner, wallpaper and looping background.

---

## Platform: plans, credits, API and community

Higgsfield sells one thing in several wrappers: credits. A subscription buys a monthly credit allowance, a parallel-job limit and time-boxed "unlimited" access to a few models. Credit packs, Auto-Refill, Concurrency Boost packs and an Unlimited Models Marketplace sell more of the same on top. A separate developer API bills in US dollars. Every automated surface (MCP, the ChatGPT plugin, the CLI, Canvas, Supercomputer and the editor plugins) always spends credits, even on models a plan marks as unlimited. Free generations and unlimited windows work only by hand on higgsfield.ai. The help center rules on this point more consistently than on anything else. Around the paid product sits a growth machine: a paid-campaign program (Earn), a sponsored creator program, a points-and-achievements community, monthly grants, contests up to a $1,000,000 film festival, an Academy, and an "Original Series" streaming page fed by contest winners. Prices below are as captured on 2026-10-16. They show in euros for the capture locale and exclude VAT. The help-center articles are dated July to October 2026. Section 2 covers the same pages at page level; this section adds the rules from the help center.

### Plans and credits

**Individual and team plans** (pricing page and the plan cards repeated on model pages)

| Plan | Price a month, annual billing | Monthly billing | Credits a month | Parallel jobs | Free generations (one-time pools) | Unlimited windows | Notes |
|---|---|---|---|---|---|---|---|
| Free | €0 | €0 | None; a small set of models | 1 | None | None | Every generation carries a visible watermark |
| Starter | €19 | €19 (the card says no difference from monthly) | 270 (about 135 Nano Banana Pro images or 15 Seedance 2.0 Fast clips) | 2 (card: up to 2 video and 4 image jobs) | AI Influencer 10, Ads Studio 10, Soul 2.0 and Soul Cinema 300 | 365 days: Seedream 5.0 Lite, FLUX.2 Pro at 1K | Seedance 2.0 Fast and Mini only, selected models; no Auto-Refill |
| Plus | €47 | €59 (saves €144 a year) | 1,200 (about 600 Nano Banana Pro images or 80 Seedance 2.5 clips) | 6 in the compare table; the card says unlimited paid parallel jobs | AI Influencer 30, Ads Studio 10, Genjutsu 3 at 720p, Soul 5,000 | 7 days: Wan 3.0 and 3.0 Prime, Nano Banana 2 at 2K, Kling 3.0. 365 days: Seedream 5.0 Lite, FLUX.2 Pro 1K, Seedream 4.5, Nano Banana, Kling O1 Image, GPT Image | All models; the plan picker recommends this plan |
| Ultra | €99 for 3,000 credits (slider to 6,000 or 9,000) | €129 (saves €360) | 3,000 to 9,000 (at 3,000: about 1,500 Nano Banana Pro images or 200 Seedance 2.5 clips) | 8 | As Plus, with Soul 10,000 | As Plus, plus Nano Banana Pro at 2K for 7 days and Seedream 4.5 at 4K | Marked best value. The banner offers Nano Banana 2, Pro and Kling 3.0 unlimited for 7 days at 30% off |
| Team | €65 a seat | €79 a seat | 1,000 a seat, pooled | 16 video and 16 image | Not listed | Business plans: 30 days unlimited Seedance 2.5 (or 2.0); 7 days of Nano Banana Pro 4K, Seedream 5.0 Pro 2K and Kling 3.0 | 2 to 9 seats (help) |
| Scale | Not captured | Not captured | More a seat; the "For teams" card says up to 37,500 pooled | 32 video and 32 image | Not listed | As Team | 5 to 15 seats, priority queue, SSO, spend controls |
| Enterprise | Through sales | Through sales | Custom, with rollover | Dedicated capacity | Not listed | Not listed | See Teams and enterprise |

- Annual billing is advertised as 30% off. Prices exclude tax, and Stripe adds VAT or sales tax at checkout.
- The help center and changelog also name "Basic" and "Pro" tiers, for example "Seedance 2.5 on Pro and Plus plans and above" or "Wan 3.0 offer from Pro and above". Neither tier appears on the pricing page at capture.
- Plan cards disagree with each other in places. The Team card equates 1,000 credits with 1,000 Nano Banana Pro images, while the other cards price that model at 2 credits.
- Every model, tool and feature can roll out gradually and may not reach every account at launch.
- One account can hold only one subscription, and there is no free trial.

**What a credit buys** (pricing compare table, approximate)

| Job | Credits |
|---|---|
| Image: Soul 2.0 / Soul (first version) | 0.12 / 0.25 |
| Image: GPT Image, Seedream, Nano Banana, FLUX.2 Pro | 1 each |
| Image: Popcorn, Flux Kontext, multi-reference | 1.5 |
| Image: Nano Banana Pro or Nano Banana 2 / Nano Banana Pro 4K | 2 / 4 |
| Image: FLUX.2 Flex / FLUX.2 Max | 3 / 4 |
| Image: face swap or character swap | about 2 |
| Video, 5 s: Kling 3.0 at 720p / 1080p / 4K | 7 / 8 / 30 |
| Video, 5 s: Seedance 2.0 at 720p / 1080p / 4K; Seedance 2.0 Fast at 720p | 22 / 60 / 110; 12 |
| Video, 5 s: Wan 3.0 at 480p / 720p / 1080p; Wan 3.0 Prime | 5 / 8.75 / 17.5; 7.5 / 15 / 30 |
| Video, 5 s: Seedance 1.5 at 480p; Grok video | about 1; about 7 |
| Video, 4 s: Sora 2 at 720p; Sora 2 Pro Max at 1080p | about 10; about 54 |
| Video, 4 s: Veo 3.1 Fast; Veo 3.1 | about 16; about 40 |
| Video, 6 s: Hailuo 02 or 2.3 at 1080p | about 10 |
| Plan picker example: one Kling 3.0 clip, 8 s at 720p | about 14 |

From these figures, a credit costs about €0.070 on Starter, €0.039 on Plus, €0.033 on Ultra and €0.065 on Team, and $0.056 through Auto-Refill. These are our calculations from the list prices.

**Credit types and expiry** (help: credits, top-ups, cancel)

| Credit type | Where it comes from | Resets | Expires | If you cancel |
|---|---|---|---|---|
| Subscription | The plan | Every cycle. On annual plans the reset is every 30 days, so the day drifts | Unused credits expire at reset | Usable to the end of the paid period, then gone |
| Credit Pack | One-time purchase | No | 90 days after purchase | Stays usable on free-plan models until it expires |
| Auto-Refill | Automatic top-up | No | 90 days | As Credit Pack |
| Promo | Promo codes, compensation | No | On the date shown | Stays until its date |
| Boost | Concurrency Boost packs | No | 90 days | As Credit Pack |

- Subscription credits are spent first. After that, whichever balance expires soonest goes first.
- Credits are spent on web, MCP, CLI, Canvas and Supercomputer generations, re-rolls and upscales. A batch of 2 to 4 outputs is charged per output.
- Most failed generations, and most generations blocked as NSFW or for IP, refund automatically within minutes. A usage log in Manage Account shows every deduction and refund, with its source tagged.
- Only Enterprise rolls credits over.

**Unlimited models, free generations and concurrency**

| Item | How it works |
|---|---|
| Unlimited access | Selected models stop deducting credits for a set window: 365 days for most included models and 7 days for new flagship ones. It is bought once, not as a recurring charge, but it works only while a subscription is active and on a plan that includes it. A toggle in the generation panel switches it on. Unlimited jobs run in the standard queue, and speed can vary at peak hours. Credit Mode on the same model runs in the priority queue |
| Fair use | Personal, human use only. Automation, scripts, shared logins and resale are banned. Unusual activity is slowed, moved to a lower queue or paused for manual review |
| Unlimited Models Marketplace | Bundles of unlimited access sold per model and resolution tier, outside the plan. Video bundles run 1 job at a time (up to 15 s), image bundles 2 at a time, and the all-models bundle 2 image jobs plus 1 video job |
| Free generations | A one-time pool granted with the plan (for example Soul 2.0, AI Influencer, Ads Studio). It does not renew and works on the website only |
| Concurrency Boost | A one-time pack that adds +4, +8, +12 or +16 parallel jobs above the plan limit, bundled with Boost Credits. Boost Credits are shared across all models and Supercomputer, are spent while the pack's toggle is on, and expire after 90 days. With several packs, the highest concurrency pack is drawn down first |
| Exclusive Offers | Personalized, time-limited deals for subscribers: a one-cycle upgrade at a promo price, or add-ons such as bonus credits, unlimited windows or priority. They are not available on request and cannot be reactivated |
| Promo codes and promo prices | Entered under Manage Account. A promo price applies to one payment, and the standard price returns at renewal. Support-issued codes lapse if not activated within 7 days |

**Top-ups**

| Top-up | Options | Rules |
|---|---|---|
| Credit Packs | Fixed: 100, 200, 500, 1,000, 2,000 or 4,000 credits. Adjustable: 5,000 to 25,000 in steps of 1,000 | Requires an active subscription. Does not change the plan or unlock models. Valid 90 days. Prices appear only at checkout and were not captured |
| Auto-Refill | $20, $40, $90, $150 or $300 per refill, at $1 = 18 credits | Off by default. Fires when the balance drops below a plan-specific threshold. Not available on entry-level plans. Pauses if the card fails. Stops when the subscription is canceled |

**Refunds, cancellation and billing**

| Topic | Rule |
|---|---|
| Refund window | First purchase only, within 7 days (or longer where local law requires) and with zero credits used. Using free generations or unlimited models does not count as use. Up to a 6% service fee. An approved refund cancels the plan at once. Processing takes up to 3 business days |
| Not refundable | Renewals. Partial or prorated refunds of annual time. Offers that unlock access or features (unlimited windows, upgrades, priority) once granted |
| Refundable on the same terms | Credit Packs, Auto-Refill charges, offers that add credits, and an upgrade's extra cost within 7 days if none of its credits were used |
| EU and UK | A 14-day withdrawal right that ends once you start using the purchase |
| Exceptions | A pro-rata refund if Higgsfield significantly degrades or shuts down a paid feature, or terminates an account through no fault of the user |
| Cancel | Turns off auto-renewal. Access lasts to the end of the period, then the account drops to the free tier. Generations are kept (long-inactive content may move to cold storage) |
| Upgrade or downgrade | An upgrade is immediate and prorated (unused credit value is deducted) and resets the billing date. A downgrade starts at the next cycle and is hidden in the compare section, not on the plan cards |
| Monthly and annual | Monthly to annual is possible at any time, prorated. Annual to monthly is not possible; you cancel auto-renewal and resubscribe after the year ends |
| Payment | Stripe Checkout only: Visa, Mastercard, Amex, JCB, Apple Pay and bank payments where supported. No PayPal or crypto. Tax is added at checkout. VAT IDs on all paid plans. Invoices for every charge. At least 30 days' notice before a price rise |
| Failed payment | The account goes past due. Generations are limited and unlimited access paused. Stripe retries, and you have about 14 days before cancellation. A chargeback can permanently restrict the account |
| Watermark | Free accounts get a visible Higgsfield watermark on every generation. Any paid plan removes it for new generations, and old ones must be regenerated. There is no toggle and no one-off removal. Invisible machine-readable AI markers may be embedded on every plan |

**Offers running at capture (October 2026):** 30% off annual plans; Ultra with 7 days of unlimited Nano Banana 2, Pro and Kling 3.0 at 30% off; 7 free days of Wan 3.0 for subscribers from October 13, with 60% off Wan 3.0 on the API until October 31; up to 30% off Seedance 2.5; a credit top-up to the full monthly amount that ended September 30.

### Teams and enterprise

| Feature | Team | Scale | Enterprise |
|---|---|---|---|
| Price | From €65 a seat a month on annual billing (€79 monthly), 1,000 credits a seat | Self-service; price not captured | Negotiated with sales |
| Seats | 2 to 9 | 5 to 15 | Custom; the enterprise page claims unlimited seats |
| Parallel jobs (image / video) | 16 / 16 | 32 / 32 | Dedicated capacity; the page claims 10 times more concurrency |
| Queue | Standard | Priority | Highest priority |
| SSO | No | Yes | Yes (SSO/SAML, role-based access) |
| Member spend controls | None | Pause a member's spending | Per-user caps, pause, usage reports, groups with their own limits |
| SOC 2 and legal indemnification | No | No | Yes |
| No training on your data | No | No | Yes (written into Terms section 4.4 since July 2026) |
| Dedicated account manager | No | No | Yes, plus a Slack or Teams channel and creative onboarding |
| Credits | Pooled across seats | More a seat, pooled | Custom volume with rollover; pooling and allocation across teams |
| Billing | Card | Card | Invoice or purchase order |
| Unlimited windows | 30 days of Seedance 2.5 on business plans, plus 7-day image and Kling windows | Same | Not listed |

- Team workspaces share Assets and folders, and roles and permissions are set from one admin view. The page pitches real-time work on prompts with built-in chat, video calls and comments, and claims SOC 2 and ISO 42001 alignment, GDPR compliance and "100,000+ teams".
- The enterprise page adds sub-workspaces, approvals and comments, Adobe and Figma integrations, 180 hours of Academy training for the team, "390 of the Fortune 500" and quotes from studios that worked for Netflix, Nestlé, Toyota, Lacoste and Madonna.
- The Creator Hub carries 16 customer stories (VertexCGI, Adopt Parfums, Double Shots, Purga, Brilliance, BITT, Sinecera, AdQUA, Big Purple, Levector, Boxel Studio, Gaia, One of One and others).
- Admins can see members' content on every business plan. Browsing all member assets is an Enterprise permission.
- Seats cannot be cut mid-cycle without support. The Owner cancels through a request form.
- Compliance paperwork (SOC 2 report, DPA, security questionnaires, W-9, W-8BEN, tax residency certificates) is Enterprise-only. Public trust material lives at trust.higgsfield.ai.

### Developer and agent surfaces

| Surface | What it does | How you connect | Billing and limits | Route |
|---|---|---|---|---|
| Higgsfield API ("Open Higgsfield") | One key for 50+ video and image models from Higgsfield and partners, including Soul 2, Soul Cinema, DoP, Marketing Studio Image, Cinema Studio 4.0, Genjutsu and AI Influencer. The API catalog differs from the web lineup and has no standalone audio models | Console at open.higgsfield.ai, docs at docs.higgsfield.ai, REST at api.higgsfield.ai. Python and TypeScript SDKs, plus setup prompts for Claude Code, Cursor and Codex | Prepaid US dollars with a $5 minimum top-up. Video is billed per second, images per image. An estimate endpoint prices a request first. Only successful jobs are charged. Funds expire after a year. A key unlocks 20 concurrent requests. Jobs are async, tracked by polling or webhook, and outputs are kept at least 7 days. Team organizations are supported. Offers: 15% off sale models, up to 50% off 4 picked models, $15 credit, and cashback of 5 to 20% for $5,000 to $50,000 spent in 30 days | `/higgsfield-api` ([shot](screenshots/tools/higgsfield_api.jpg)) |
| Higgsfield MCP | Generates image, video, audio and characters from Claude or any MCP client. It also upscales, removes backgrounds, expands images and video, runs Kling 3.0 Motion Control, uses Soul characters and Elements, runs Personal Clipper and checks the balance | Connector URL `mcp.higgsfield.ai/mcp`, authorized with OAuth and no API key. Claude adds it as a custom connector, Cursor through its marketplace. OpenClaw, Hermes Agent and NemoClaw are named. Reference files go through an upload window the agent opens | Plan credits at standard rates. No unlimited or free generations. Requires a paid plan. No native credit cap, so the help center suggests telling the agent to ask before spending. Results land in Assets, tagged MCP, within about 60 s | `/mcp`, `/mcp?tab=claude` ([shot](screenshots/tools/mcp.jpg)) |
| ChatGPT plugin and extension | The same tools inside ChatGPT, with slash commands /effects, /product, /motion, /marketing-studio and /genjutsu. It also builds sites and browser games. OpenAI's always-on "Dots" agents can call it | Plugins Directory, or a button on `/mcp` | Credits. Audio and the website skill are not available in ChatGPT | `/mcp?tab=chatgpt` ([shot](screenshots/tools/mcp_tab_chatgpt.jpg)) |
| CLI and skills | For coding agents: `npm i -g @higgsfield/cli`, `higgsfield auth login`, then `npx skills add higgsfield-ai/skills`. That installs three skills: generate, soul (train a character) and product-photoshoot, with 10 image presets and 9 video ad presets. Pitched as using fewer tokens than MCP | Claude Code, Cursor, Codex, OpenClaw, Hermes | Credits, no unlimited. Falls under the Developer Terms, so the user answers for what the agent does | Help: "access via CLI" |
| MCP skill pages and Katana | 41 skill and bundle pages for agents (section 2). Katana is a Claude skill that edits video in Aura Farming, Motion or Clipping style from up to 5 reference images, with community presets | `/mcp/<skill>`, then Recreate in Claude | Credits | `/katana`, `/mcp/*` |
| Creative app plugins | Panels for Photoshop, Premiere Pro and After Effects, DaVinci Resolve, Figma and FigJam, Blender 5.1+ and Minecraft 1.21.1 (NeoForge). Blender Bridge lets an agent work inside the open scene | Installers from `/plugins/*`. Bridge connector `bridge.higgsfield.ai/mcp` | Credits. Defaults are Nano Banana 2 and Seedance 2.0 | `/plugins/after-effects` ([shot](screenshots/tools/plugins_after_effects.jpg)) |
| Supercomputer | The in-app agent, with skills (Ad Multiplier, Editorial Motion Graphics, Faceless Video, Cartoon Faceless, SaaS UGC, Physical UGC, Brandkit, Shorts Maker, Website Building), 30+ connectors, projects, scheduled tasks and an "ask before generating" toggle. Orchestrator routes each step to a model. Frontier text models are listed: Claude Opus and Sonnet, GPT-5.5 Pro, GPT-6.1 Sol and Gemini 3.1 Pro. Memory and skills can be imported from Claude, Codex and ChatGPT | higgsfield.ai | Credits always. Separate pricing at `/supercomputer/pricing` (not captured) | `/supercomputer` ([shot](screenshots/tools/supercomputer.jpg)) |
| Chat and AI assist | Both redirect to Supercomputer | — | — | `/chat`, `/ai-assist` |
| App Builder | Full-stack apps built in chat that call Higgsfield models. Published apps sign users in with Higgsfield, and users pay with their own credits. Custom domains on paid plans; a remixable marketplace | Supercomputer or MCP | Building costs the creator's credits | `/app-builder-intro` |
| Games (Higgsfield Gaming) | Browser games with art, sound, music and multiplayer, in 6 genres and 6 styles. Listed in the Games marketplace only after Publish, and remixable | Supercomputer (Fable engine) or an MCP gaming skill | The Fable engine costs "significantly more" credits and shows a warning first | `/games-intro` |
| AI Motion Designer | Editable After Effects motion graphics typed in ChatGPT (`@higgsfield /use-after-effects`), powered by GPT-6 Astra | ChatGPT plugin | Credits | `/ai-motion-designer` |

**Sample API rates** (sale price, list price in brackets)

| Model | Rate |
|---|---|
| Seedance 2.5 | $0.144 a second ($0.2057) |
| Seedance 2.0 | $0.0985 a second ($0.1407) |
| Kling 3.0, Kling O3, Kling O1 | $0.042 a second ($0.084) |
| Wan 3.0 / Wan 3.0 Prime | $0.02 ($0.05) / $0.0272 ($0.068) a second |
| MiniMax H3 / Hailuo 2.3 | $0.065 ($0.13) / $0.0117 ($0.0467) a second |
| LTX 2.5 Fast / Pro | $0.09 / $0.12 a second |
| Grok Imagine Video 1.5 | $0.08 a second |
| Genjutsu | $0.159 a second ($0.318) |
| Cinema Studio 4.0 | $0.2057 a second |
| Soul 2 / Soul Standard | $0.0032 / $0.0938 an image |
| Ideogram 4.0 / Recraft 4.1 / Qwen Image 3 / Z-Image Turbo | $0.03 / $0.035 / $0.04 / $0.015 an image |
| AI Influencer character sheet | $0.05 |

**Official surfaces.** The help center says the only official places are higgsfield.ai, open.higgsfield.ai, docs.higgsfield.ai, the MCP connector at `mcp.higgsfield.ai/mcp`, the Discord and its social accounts. It adds that there is no mobile or desktop app, and that the platform and its models are not open source. It calls anything presented as an "open-source Higgsfield" a copy that Higgsfield neither releases nor maintains.

### Community and growth

| Program | What it is | How it works | Numbers stated | Route |
|---|---|---|---|---|
| Higgsfield Earn | Paid campaigns for posting promotional AI videos, pitched at AI influencer accounts | Sign up at creators.higgsfield.ai and connect Instagram (automatic) or YouTube and X (verified by a code). Accept a matched campaign with a set format, hashtags and minimum length, then post and submit the link. Each campaign pays a guaranteed fee plus a performance bonus judged about a week later (the page says 24-hour and 7th-day bonuses). Payouts go through Garna with KYC. Access depends on region, rates are confidential, and each rejection gets one appeal | 10,000+ creators commissioned, $1M+ paid out, 90% approval rate (trust page); "boost earnings by 130%" | `/earn` ([shot](screenshots/tools/earn.jpg)) |
| Creator Partnership Program | Sponsored creators | Apply with platforms, audience size, country and a link to work. A person reviews every application, with no follower minimum. Partners get a full plan renewed monthly, extra credits for films, early model access, an affiliate program, features on Higgsfield channels, a dedicated contact and a partner community in 35+ countries, and in return tag Higgsfield. Job offers are marked as coming soon | 9 partners profiled | `/creator-partnership-program` ([shot](screenshots/tools/creator_partnership_program.jpg)) |
| Collab karma | Points earned inside the app through the Collab feature that convert into credits | Shown under Manage Account | Not stated | Help: account |
| Community feed | Discovery, Projects, Shots, Creators, Contests and Originals tabs. Open Projects publish the result, brief, folders, models and credits, with prompts optional. Anyone can Recreate a shot or project that shows its prompts | Publish from a profile in four steps: details, assets (feature, series or carousel), cover, access. Browsing needs no account | Featured creators show ratings | `/community` ([shot](screenshots/tools/community.jpg)) |
| Rating and achievements | Points shown on public profiles, with achievements that pay credits | Points: profile complete +3, first Open Project +4, first remix +2, verified project +30 (needs 30 likes and 30 generations), each paid remix +1 (15 a month cap), approved blog post with 20+ likes +20, featured work +50. Credit rewards: 5,000 at 100 points, 75,000 at 500, 200,000 at 1,000, up to 200,000 for a feature and up to 5,000 for a blog post. Rewards must be claimed but never expire | Up to 3 badges per profile | Help: community |
| Higgsfield Grants | Credits for published Open Projects | Apply from the Grants page. Entries are reviewed monthly | Up to 200,000 credits a project | `/grants` (linked) |
| Contests | Prize contests made in contest projects, usually in Cinema Studio | Submit, then community voting and jury review | Global Film Festival: $1,000,000 pool and 14 winners. Audience Choice ($100,000) was decided by paid accounts with 5 votes each from October 8 to 15; the jury ran October 9 to 14; winners are due in the last week of October. Earlier: The Adathon ($85,000 in credits, July 27 to August 24), Apps Contest ($100,000), Make Your Action Scene ($500,000, 8,752+ projects). Discord 200K contest: 200,000 credits, entries closed October 14 | `/contests` (redirects to `/community/contests`), `/contests/higgsfield-global-film-festival` ([shot](screenshots/tools/contests_higgsfield_global_film_festival.jpg)) |
| Discord | Support, prompt sharing and live "Community Stage" streams; the source of promo codes | discord.com/invite/higgsfield | 200,000 members (changelog) | Help: community |
| Academy | Free chaptered courses (Movie making, UGC and social content, Automate and agents), a copyable prompt bank and live webinars | Start a course, or copy and Recreate a prompt | 4 headline courses of 12 to 40 minutes; 46 camera prompts; 180 hours of training promised to enterprise teams | `/academy` ([shot](screenshots/tools/academy.jpg)), `/academy-webinar-290926` |
| Gallery | No standalone gallery: `/gallery/all` redirects to the Cinema Studio 4.0 composer. Public work lives in Community and the Explore page | — | — | `/gallery/all` ([shot](screenshots/tools/gallery_all.jpg)) |
| Original Series | A streaming page for Higgsfield Studio films and series, with rows for Higgsfield Choice, First Look, On Our Radar and Coming Soon, plus "notify on release". The best contest entrants are invited to make full series with the team | Watch; sign in to see the next episode. Each title links to its Open Project with view and generation counts and a license tag (such as OWL-P-NL-1.0 or HOL-RO) | 30 titles; top 3 and 20 honorable mentions from the last contest | `/original-series` ([shot](screenshots/tools/original_series.jpg)) |
| Previews and sandbox | Unlinked CMS drafts of landing pages, with placeholder text | — | — | `/previews`, `/sandbox` ([shot](screenshots/tools/sandbox.jpg)) |
| Higgsfield for Good | Free access for non-profits, students and professors | Application forms (all closed at capture) | Review within 2 weeks | `/higgsfield-for-good` |

**Original Series titles** (43 captured pages: the index, 30 titles, and empty or locked pages for later episodes of Arena Zero, Mork and Zephyr). View counts are as shown on each page.

| Title | Format | Premise | Views |
|---|---|---|---|
| Arena Zero | Series, episode 1 live, episodes 2 to 5 locked | A slacker gamer is drafted to fight for Earth in an alien tournament | 1,226,452 |
| Hell Grind | Series, episode 1 | Four street kids plan a museum job that goes wrong | 613,703 |
| The Cully Hill Boys | Full film | Three struggling London rappers fall into a drug war | 301,765 |
| Zephyr | Series, episode 1 (later pages empty) | A squad of glamorous heroines defends a city from alien bugs | 241,832 |
| Mork | Series, episode 1, episodes 2 to 5 coming soon | A Viking raid survivor returns with blades for hands | 181,643 |
| Oneiric | Full film | Students debate a technology that drops your mind into any time and place | 156,481 |
| The Trigger | Full film | A hitman's next target is the man who once saved him | 129,642 |
| Zephyr: Special | Full film | A mystery pilot rescues a Zephyr member in mech combat | 125,575 |
| Kok Boru | Full film | A nomad mother loses a child to wolves in a blizzard | 80,211 |
| If you stop loving me, I'll die | Full film | A silent, deadpan animated comedy about a man whose one talent is dying | 78,633 |
| Adiliada | Full film | A dark sci-fi comedy about love and betrayal | 73,685 |
| Bucket List | Series, trailer | Two friends spend Earth's last days on adventures before an asteroid hits | 65,889 |
| Spit & Glow | Series, episode 1 | DNA that reverses aging is turned into a global beauty brand | 65,690 |
| Red Flag | Full film | A Hong Kong neo-noir about romance and self-defense | 64,820 |
| Huntress's Tale | Series, episode 1 | A monster hunter is hunted in a gothic ruin | 57,190 |
| Behind the scenes of Mork | Making-of | The cast and set of Mork | 48,974 |
| Vermin Control Unit | Series, episode 1 | A team rescues its boss from a moving train | 45,849 |
| Alright Alright Alright | Series, trailer | Two crypto hustlers rob the cartel that hired them | 42,828 |
| Mother Trucker | Series, trailer | A mother enters a war-machine battle with only a truck | 41,842 |
| Buddy | Series, episode 1 | A quiet friendship between two famous animal characters | 41,038 |
| Tails of Steel | Series, episode 1 | Gangs in a 1990s megacity rally behind a supervillain cat | 39,104 |
| Dinoforce | Series, trailer | Dinosaurs return and humanity loses the top of the food chain | 38,415 |
| Frozen Monster | Series, episode 1 | An ice beast kidnaps a figure skater and is won over | 28,346 |
| Passport Rush | Full film | A traveler races across town for a forgotten passport | 27,468 |
| DEM: Arena Zero music video | Music video | A wasteland crew digs up a cassette tape | 25,164 |
| Anerneq | Full film | An Arctic drama about love and letting go | 22,071 |
| Peter Pan | Series, episode 1 | The classic story retold for today | 20,527 |
| Viking Courier | Series, episode 1 | A courier crosses a battlefield on foot to deliver a package | 20,372 |
| Misfortune | Series, episode 1 | A live bomb rolls loose during a pirate battle | 18,965 |
| Vengeance Is Mine | Full film | A silent stranger starts killing in a 19th-century Texas town | 502 |

### Safety and content rules

| Topic | What the help center and trust page say |
|---|---|
| Where filtering happens | Higgsfield checks prompts and uploaded references. Each outside provider (Nano Banana, Seedream, Kling, Sora 2, MiniMax, Wan, Veo) runs its own filter on top, and Higgsfield cannot see those providers' rules. The trust page says moderation runs per model, so what passes depends on the model |
| NSFW false positives | Swimwear, fitness, medical images, borderline references and vague wording are the usual triggers. The fixes offered: rephrase, swap the reference, add text to an image-only input, or try another model. Credits return for most models. Support cannot override a classifier, and bypassing filters breaks the terms |
| IP blocks | Named franchise characters (Disney, Marvel, DC, Pixar, Nintendo), sports teams and leagues, living artists' names used as a style, and brand logos are blocked. Seedance runs its own IP check as well. If the blocked input is yours, an "I own the rights" button may unblock it. Blocks apply platform-wide with no per-account exceptions, and rights holders apply through support. Cinema Studio says it checks each of its 50 references |
| Likeness and consent | Images of another person need that person's permission (Terms 5.3), and an upload agreement confirms the user holds the rights. Voice cloning asks the user to confirm the voice is theirs or licensed. Reported non-consensual intimate images, and known copies, come down within 48 hours |
| Ownership and training | Users own inputs and outputs, commercial use is allowed on every plan, and no credit to Higgsfield is required. Outputs are not exclusive. Higgsfield may train on user content except under Enterprise agreements, and deleting content stops future use. Users may not train other AI models on outputs |
| Watermarks and provenance | Free accounts get a visible watermark. Invisible AI markers may be added on any plan. Nano Banana 2.1 outputs are signed with C2PA. Work Higgsfield commissions is labeled #HiggsfieldPartner |
| Public content | Automated filters scan everything posted to Community. Anyone can report by email, and outcomes run up to removal and account termination |
| Unlimited fair use | Human use only. Automation and resale get the account slowed, queued lower or paused |
| Agents | MCP and CLI use falls under the Developer Terms: the account owner answers for anything an agent generates |
| Legal channels | DMCA notices go to support@higgsfield.ai, acknowledged within 48 hours, with counter-notices allowed. GDPR and CCPA requests go to privacy@higgsfield.ai. Law enforcement requests are prioritized |
| Copies and scams | Only the official domains are real. There are no apps, no resellers and no lifetime plans. Accounts and "unlimited access" sold on Telegram or Discord are fake |

### Notes for ComfyField

| Platform feature | For the contest demo? | Why, and what to do |
|---|---|---|
| Cost shown before every run | Yes | Higgsfield prints the credit cost on every Generate button and in the plan picker. ComfyField already estimates cost per run, so show it in Create and as a total for a Flow run |
| Agents through MCP and CLI | Yes | This is Higgsfield's fastest-growing surface, and it always spends credits with no native cap. ComfyField already ships an MCP server and CLI with the user's own keys. Demo one agent run, and add an "ask before spending" or per-session budget limit, which Higgsfield lacks |
| Comfy Developer Platform | Yes (required) | At least one demo path must run through Comfy Router, Comfy API v2 or the Comfy SDK |
| No watermark, local files | Yes, one line | Higgsfield watermarks every free generation and keeps files in its cloud. ComfyField never watermarks, and outputs stay on disk |
| Open Projects with prompts and Recreate | Maybe | Recreate from a shared prompt is Higgsfield's main community loop. A Library "run again with these settings" action and Flow export cover most of it cheaply |
| Prompt bank | Maybe | 46 copyable camera prompts in the Academy. ComfyField's camera moves format could ship the same list |
| Plans, credits, unlimited windows, boosts, refunds | Out | ComfyField is free and bring-your-own-key; none of this applies |
| Teams, SSO, enterprise | Out | Local-first, single user |
| Dollar-billed API | Out | The CLI, the MCP server and the Comfy API already cover developers |
| Editor plugins, App Builder, Games | Out | Large surfaces with no demo value for us |
| Earn, partner program, contests, Originals, Academy courses, Discord | Out | Growth programs, not product |
| Safety filters | Partly | Rely on each provider's filter. Show a provider's block reason plainly in the run log, and offer no IP override |
| Provenance (C2PA) | Out for the demo | Worth a later issue |
| Positioning | Yes | The help center says Higgsfield is not open source and calls any "open-source Higgsfield" a copy. Present ComfyField as its own product with no Higgsfield names, logos or styling |

---

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
