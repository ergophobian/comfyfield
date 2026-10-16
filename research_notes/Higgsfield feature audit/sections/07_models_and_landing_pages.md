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
