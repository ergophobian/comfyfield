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
