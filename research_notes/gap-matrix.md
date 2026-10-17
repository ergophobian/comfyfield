# Higgsfield to ComfyField gap matrix

As of 2026-10-16, read from the code on branch agent/gap-audit (based on b638647). Higgsfield side comes from `research_notes/Higgsfield feature audit/` (241 features, 92 apps, presets, models) and `research_notes/Higgsfield audience features and moat/`. ComfyField side comes from the code, not page titles.

## How to read this

- **Working**: a real path exists from the UI to a provider call and back to a file. The provider is named in the "Where" column.
- **UI only**: a page or format exists but its run button is disabled ("Not wired yet") or it points at a ComfyUI workflow that is not in `public/workflows/`.
- **Missing**: nothing in the code.
- **Not planned**: billing, credits, community programs, enterprise and similar things that do not apply to a bring-your-own-key local app, plus Higgsfield's own proprietary models.
- **Size**: S is a recipe entry on an endpoint we already call, or a small page hookup. M is a new ComfyUI workflow JSON, a new input type, or a two-step chain. L is a new capability (training, long pipelines, hosting, 3D).
- **Example media**: what Higgsfield shows for the feature, and what we must generate ourselves. Our cards today use gradient covers (`cover: gradient(...)` in `src/lib/recipes.js`, `covers` in `src/lib/formats/parts.js`), so no feature has real preview media yet.

## Headline findings

- **Only the generic composers are wired.** Create image, Create video, Audio (speech, sound effects, music), Canvas flows, the Models browser, the Library, MCP and the CLI run end to end. Of 434 formats, only 10 run (all on fal). The other 424 are UI only.
- **The wiring gap is small in kind and large in count.** The formats point at 109 distinct ComfyUI workflow ids, and `public/workflows/` holds 3 JSON files (`image_flux`, `image_sdxl`, `video_ltx`). None of the 3 is used by a format; `readyWorkflows` in `src/lib/formats/index.js` lists them for the composers only.
- **Two workflows unlock about 195 formats.** `ltx_i2v` backs 98 and `h3_i2v` backs 97 (camera moves, viral effects, trending templates). `bernini_restyle` backs 34 more (mixed media, restyle).
- **Seventeen studio and tool pages are shells.** Cinema, Influencer, Character training, Moodboard, Photodump, Fashion, Marketing, Ads, Faceless, Explainer, Shorts, 3D, Lipsync, Edit image, Edit video, Upscale and Reframe all show "Not wired yet" (or a disabled Generate button). Cinema is the most valuable to fix first because its controls are fully built.
- **The audit's coverage column is stale.** The Higgsfield audit's app table marks 46 of 92 apps "missing" from the earlier tree; the current tree has a format or a close neighbor for 91 of 92 (only Commercial Faces has none), but only 5 run.
- **Required for the competition and absent:** a demo path through Comfy Router, Comfy API v2 or the Comfy SDK. The code only calls a ComfyUI URL directly.

## Summary table

| Section | Working | UI only | Missing | Not planned | Total |
|---|---|---|---|---|---|
| Image | 9 | 12 | 2 | 1 | 24 |
| Video | 5 | 10 | 0 | 0 | 15 |
| Audio | 3 | 6 | 0 | 0 | 9 |
| Apps hubs | 5 | 86 | 1 | 0 | 92 |
| Studios | 2 | 13 | 2 | 0 | 17 |
| Effects and presets | 1 | 11 | 3 | 0 | 15 |
| Effects hub (45 effects) | 2 | 43 | 0 | 0 | 45 |
| Mixed media looks (33) | 0 | 4 | 0 | 0 | 4 |
| Models | 10 | 2 | 2 | 1 | 15 |
| Canvas and flows | 4 | 0 | 1 | 1 | 6 |
| Supercomputer and agents | 0 | 4 | 2 | 1 | 7 |
| MCP, CLI, API and plugins | 2 | 0 | 6 | 1 | 9 |
| Explore and community | 3 | 0 | 2 | 4 | 9 |
| Account, billing and enterprise | 4 | 0 | 0 | 6 | 10 |
| **Total** | **50** | **191** | **21** | **15** | **277** |

Rows are features as Higgsfield groups them. Apps, effects and mixed media rows are one per Higgsfield item (92, 45 and 4 family rows covering 33 looks). Motion presets are grouped by Higgsfield category.

Format inventory (src/lib/formats): 434 formats, 10 wired (fal), 424 UI only. By workflow, the biggest unlocks are: `ltx_i2v` 98, `h3_i2v` 97, `bernini_restyle` 34, `flux_look` 25, `qwen_edit` 17, `klein_edit` 13, `h3_product_ad` 9, `qwen_ltx` 7.

## Top 15 gaps for the 10/30 competition demo

Ranked by demo value: what a judge sees in two minutes, what the competition requires, and how much existing code it reuses.

| # | Gap | Size | Why it matters |
|---|---|---|---|
| 1 | Demo path through Comfy Router, Comfy API v2 or the Comfy SDK | M | Required by the competition; nothing in the code calls them today (server/core.js talks to a ComfyUI URL only). Comfy Router already hosts H3, LTX 2.5 and SeedVR2 |
| 2 | Build the `ltx_i2v` and `h3_i2v` ComfyUI workflows | M | Two JSON files turn on about 195 of the 424 UI-only formats (camera moves, effects, trending templates) |
| 3 | Cinema Studio Generate button | S | The controls (camera, lens, director panel, emotion wheel) are fully built; compiling them into a prompt for an already wired model makes Higgsfield's flagship studio real |
| 4 | Real preview media on every card | S | Every Explore, Apps, Effects and Motion card is a gradient today; about 20 hero clips and stills make the product look finished (list below) |
| 5 | Eight hero camera moves with real clips | S | Higgsfield's moat is DoP camera presets; a Motion page with eight working, previewed moves answers it directly |
| 6 | Eight hero viral effects (Effects hub) | S | One photo in, one clip out is the most shareable demo; four fal effects run now (melt, zero gravity, city giant, claymation) and need only previews plus four more |
| 7 | AI Influencer plus Photodump | M | Higgsfield's "New" headline product; both can ride the existing image path with character references, batch rows and the character library |
| 8 | Click to Ad with an approval gate | M | Ads are Higgsfield's revenue story. Product link import, brand kits and the "Ad variants" flow template already exist; wiring the page to that flow shows approval gates, which Higgsfield lacks |
| 9 | Assistant that builds and runs a Flow | M | Answers Supercomputer. writePrompts, flow templates and cost estimates exist; the plan card with an Approve button becomes real, with "ask before spending" built in |
| 10 | Face swap and Character swap | M | Two of the most used apps; both are the first two entries in Higgsfield's Image menu |
| 11 | Inpaint and Edit image | M | Basic table stakes in the Image menu; a draw input type already exists |
| 12 | Lipsync studio and talking head | M | Higgsfield's Speak and Lipsync Studio are heavily promoted; speech already works, so image plus speech into a talking clip completes the chain |
| 13 | Voice change and Translate (dub) | M | Two of the three Audio modes are disabled; filling them makes the Audio menu complete |
| 14 | Video upscale and Reframe | S | Both are in the Video menu and disabled; fal has a SeedVR video endpoint that matches the image recipe already running |
| 15 | MCP tools for recipes and flows, plus a spend cap | M | Agents are Higgsfield's fastest-growing surface and it has no spend cap; README already lists `list_recipes`, `run_recipe`, `run_flow` as TODO, and a per-session budget is a clear edge |

Runners-up: Moodboard (M), Mixed media restyle via `bernini_restyle` (M, 33 looks from one workflow), Motion control (M), "Recreate with these settings" in the Library (S), prompt bank page (S).

## What ComfyField has that Higgsfield does not

- **Bring your own keys, no credit markup.** Keys live in `.comfyfield/keys.json` (mode 0600) or environment variables; you pay fal, Google, ElevenLabs or your own ComfyUI directly (server/core.js).
- **Local-first and open source (MIT).** Files stay on your disk, there is no watermark, no account and no cloud lock-in. Higgsfield is closed, watermarks free output and keeps files in its cloud.
- **Any model, not a curated list.** The Models page browses fal's whole catalog, and any endpoint runs as `fal:<endpoint>` with inputs mapped from its OpenAPI schema (shared/mapping.js), so new models need no code.
- **Several vendors in one place.** fal, Google (Veo 3.1, Nano Banana), ElevenLabs and ComfyUI side by side; Higgsfield is its own reseller only.
- **Flows with approval gates.** Prompt, image, model, approve, output and note nodes; the approve node holds expensive stages until you pick takes (src/lib/flowEngine.js). Higgsfield Canvas has no gate and its agents always spend.
- **Batch boards.** Prompt rows, takes per prompt, CSV prompt import, an AI prompt writer, approve picks, "Open as flow" from Create, and three-way parallel runs (Batch.jsx, Board.jsx, useGenerations.js).
- **Live cost and balance in provider dollars.** Estimates before every run (src/lib/cost.js, estimateCost) and live balance for fal and ElevenLabs.
- **Open weights on your own ComfyUI.** Workflow-JSON path with `{{prompt}}`, `{{seed}}`, `{{width}}`, `{{height}}` placeholders; Higgsfield offers no open weights.
- **MCP and CLI on local keys.** No OAuth, no credits: `comfyfield mcp` and `comfyfield generate` work in Claude Code, Codex and Cursor.
- **Use-in chaining.** Any finished image or video opens straight into a format with the result attached (`useIn` in src/lib/formats/index.js).
- **Library with link import.** Characters, products and brand kits that fill from a pasted product link (server/plugin.js importUrl).
- **No ComfyField-side moderation layer**, so only the chosen provider's own filter applies; Higgsfield adds its own classifier and IP block on top.

## Example media we must generate ourselves

Higgsfield shows three kinds of media: a static tool screenshot (studios and tools), a before/after example beside a small input thumbnail (every app page), and sample clips (every motion preset and every effect page). Our `cover` fields are gradients, so all of it is ours to make. In priority order:

1. **Hero set for the demo (about 20 items):** 8 camera move clips (one photo), 8 effect clips (melt, zero gravity, city giant, claymation plus four more), 4 ad or product clips.
2. **Apps (92):** one input photo plus one output (image or 5 s clip) each. Reuse one shared set of input photos (a person, a product, a pet, a room) across all apps to keep it to about 6 inputs.
3. **Mixed media (33):** one source clip and 33 restyled thumbnails (a single contact sheet is enough).
4. **Studios (about 17):** one real screenshot of our page after a run, instead of Higgsfield's loading shell.
5. **Audio:** 6 voice sample clips and 1 clone result.

These can be produced with the wired composers once keys are connected. This audit made no paid calls.

## Gap matrix by section

## Image

Higgsfield Image menu: 12 tools and 12 model shortcuts.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Create image | One prompt bar for every image model; references, ratio, quality, 1 to 4 batch, @ elements | Working | src/pages/ImageStudio.jsx, src/lib/providers.js run(), server/core.js runFal / runGoogle / runComfy. Providers: fal, Google (Gemini key), your ComfyUI (FLUX, SDXL) | - | HF: tool screenshot only (capture hit a bot check). Need: 1 hero screenshot of our feed with 4 results |
| Batch counter and prompt list | Batch of 1 to 4 per prompt | Working | src/components/Batch.jsx, ImageStudio.jsx go() (takes, count, prompt rows, AI prompt writer) | - | None |
| @ elements in a prompt | Pull a saved Element or Soul ID with @ | Working | src/components/generate/Library.jsx, src/lib/useLibrary.js, server/plugin.js libraryRoute (characters, products, brands) | - | None |
| Cinematic cameras (Cinema Studio image mode) | Pick camera body, lens, focal length, aperture; settings travel with the still | UI only | src/pages/CinemaStudio.jsx, src/components/studio/CinemaComposer.jsx (GoButton disabled, "Not wired yet"), format cinema-shot (cinema_shot) | S | HF: shell screenshot only (skeleton). Need: 4 stills of one scene on different camera and lens settings |
| Canvas (image side) | Node board shared with Video | Working | See the Canvas and flows section | - | See Canvas |
| Soul Moodboard | Turn your references into a reusable style preset | UI only | src/pages/Moodboard.jsx (NotWired), format moodboard (klein_moodboard) | M | HF: tool screenshot. Need: a set of 4 reference images and 3 results in that style |
| Soul ID, character library | Saved character used across generations | Working | src/pages/Character.jsx, src/components/library/Assets.jsx, server/plugin.js library API. Consistency comes from up to 6 reference images passed to the model | - | None |
| Soul ID, character training | Train one face from 20 to 80 photos | UI only | Assets.jsx "Train a character model" button is disabled; Character.jsx NotWired | L | HF: tool screenshot. Need: 1 character sheet (6 views) as the sample |
| AI Influencer builder | Persona from 19 menus, then animate it (New) | UI only | src/pages/Influencer.jsx (NotWired); formats influencer-post (flux_character_set), ai-influencer-video (influencer_video) | M | HF: screenshot plus preset gallery. Need: 1 persona with 6 posts and 1 short motion clip |
| Photodump | One click makes a preset photo set of your character | UI only | src/pages/Photodump.jsx (NotWired). Reuse ImageStudio batch rows with a prompt pack and character refs | S | HF: screenshot only (page rendered blank). Need: 1 character and a 6 photo set |
| Instadump and Popcorn modes | One portrait into a social photo set; up to 8 consistent storyboard frames | UI only | Formats storyboard (storyboard), nine-shots is wired via fal; Popcorn frame chaining not built | M | HF: blog images only. Need: 1 portrait and an 8 frame strip |
| Soul Cast (actor builder) | Casting studio for consistent AI actors inside Cinema Studio | Missing | None. Closest: Influencer.jsx builder (UI only) | M | HF: not captured. Need: 1 actor card with 4 views |
| Relight | Move a virtual light around a photo | Working | src/lib/recipes.js relight (fal nano-banana-2/edit), opened at /apps/relight. Provider: fal | - | HF: before/after in app. Need: 1 photo and 3 lit versions |
| Inpaint | Mask and describe an edit (Nano Banana Pro Inpaint) | UI only | src/pages/EditImage.jsx (NotWired), format inpaint (qwen_edit_inpaint). The "draw" input type exists in src/lib/recipes.js | M | HF: tool screenshot. Need: before, mask and after pair |
| Layers (split into editable layers) | Decompose an image into layers | UI only | EditImage.jsx, format layers (qwen_image_layered) | M | HF: screenshot. Need: 1 image and 4 layer PNGs |
| Edit text in an image | Change words in a picture and keep the look | Missing | None. Closest: remove-text (UI only) | S | HF: help article only. Need: before and after of a poster |
| Image upscale | Topaz, Topaz Generative, ByteDance Upscale | Working | Recipe upscale (fal-ai/seedvr/upscale/image, 2x or 4x) in src/lib/recipes.js. The /upscale page itself (src/pages/Upscale.jsx) is NotWired; hook it to the recipe | S | HF: screenshot. Need: 1 soft photo and the upscaled result |
| Remove background | Cut out a subject | Working | Recipe remove-background (fal-ai/bria/background/remove) | - | HF: app example. Need: 1 photo and cutout |
| Face swap | Source face onto a photo or video | UI only | Format face-swap (qwen_edit_face_swap), tool route /apps/face-swap | M | See Apps hub |
| Character swap | Replace a whole character in a target image | UI only | Format character-swap (klein_character_swap), tool route /apps/character-swap | M | See Apps hub |
| Soul 2.0 and Soul Cinema (house models) | Higgsfield-only photo models with 20+ style presets | Not planned | Proprietary. Closest open pick: FLUX.2 / Nano Banana Pro (pinned in src/lib/catalog.js) | - | None |
| Soul style presets, Soul HEX, Soul Reference | 20+ style packs, palette transfer, reference-guided variation | UI only | 27 Looks formats in src/lib/formats/looks.js (flux_look, qwen_image); brand-colors for palette | S | HF: ~120 preset tiles on the Soul page. Need: 1 subject rendered in 8 looks as tile art |
| Partner image models picker | GPT Image 2, Nano Banana family, Seedream, FLUX.2, Ideogram, Recraft, Z-Image, Kling O1, Grok | Working | Pinned: Nano Banana Pro, GPT Image 2, Flux 2 Pro (fal); Nano Banana Pro and 2 (Google). Any other fal image model through src/pages/Models.jsx | - | HF: model logos and sample grids. Need: none (fal supplies thumbnails via falMeta) |
| Fashion Factory | Template photoshoots pairing a product with a consistent character | UI only | src/pages/FashionFactory.jsx (NotWired) | M | HF: screenshot. Need: 1 character, 1 garment, 4 shoot results |

## Video

Higgsfield Video menu tools (studios are in their own section).

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Create video | Prompt bar for every video model; start and end frame, multi-shot, camera presets | Working | src/pages/VideoStudio.jsx, providers.js run(). Providers: fal (Seedance 2.5, Kling 3 Pro, MiniMax H3, Wan 3.0, any fal video model), Google Veo 3.1 / Fast / Lite, ComfyUI LTX | - | HF: screenshot (page was a loading shell). Need: 1 hero screenshot plus 1 finished clip |
| Start and end frame | Image to video with last frame | Working | VideoStudio.jsx Slot components; end frame only when the model schema has one (useModelInputs) | - | None |
| Multi-shot in one clip | Up to 6 cuts per generation (Kling 3) | Working | VideoStudio.jsx ShotList compiles shots into one prompt; real per-shot control depends on the model | - | None |
| Camera presets in Create (DoP) | Pick a camera or VFX preset; one keyframe | Working | VideoStudio.jsx PresetPicker appends preset text to the prompt on any wired model. The named formats (cam-*, 72) are UI only, see Effects and presets | - | See Effects and presets |
| Motion control (Kling Motion Control) | Drive a character image with a motion reference video | UI only | VideoStudio.jsx "Motion control" tab uses open model Wan Animate 2 (not wired); formats motion-transfer (wan_animate2) | M | HF: screenshot. Need: 1 character image, 1 motion clip, 1 result |
| Edit video | Edit scenes, shots and elements (Kling Omni Edit, Seedance 2.5 Edit) | UI only | src/pages/EditVideo.jsx (NotWired); formats edit-video (bernini_edit), swap-element, video-erase | M | HF: loading shell. Need: 1 clip, before/after of one swap |
| Video upscale | Up to 8K (ByteDance, Topaz, FLUX.3) | UI only | src/pages/Upscale.jsx ?kind=video (NotWired); format video-upscale (seedvr2_video). fal has a SeedVR video endpoint to point at | S | HF: loading shell. Need: 1 soft clip and the upscaled clip |
| Reframe | Change a finished video to another aspect ratio | UI only | src/pages/Reframe.jsx (NotWired) | M | HF: loading shell. Need: 16:9 clip and 9:16 result |
| Change color palette and video relight | Regrade or relight a clip | UI only | Formats color-grade (bernini_grade), video-relight (bernini_relight) | M | HF: loading shell. Need: 1 clip and 3 grades |
| Extend video | Forward or backward extension up to 30 s | UI only | Format extend-video (h3_extend) | M | None |
| Draw to video / draw to edit | Sketch on a frame to direct motion or an edit | UI only | Format draw-to-video (h3_draw); "draw" input type already exists | M | HF: blog. Need: sketch frame and result |
| Genjutsu (motion transfer, object swap, restyle) | Rebuild part of a real video; 30+ presets; 4 to 30 s source | UI only | Formats motion-transfer, swap-element (bernini_swap), restyle-video (bernini_restyle). The name Genjutsu is proprietary | M | HF: preset gallery clips. Need: 1 source clip and 3 restyles |
| Katana (reference edit with your assets) | Recreates a reference edit with up to 5 of your photos, in Claude | UI only | Format clone-edit (bernini_clone_edit). Could be exposed as an MCP prompt | M | HF: preset cards. Need: 1 reference clip and result |
| Mixed media (video restyle) | 33 looks on a 1 to 10 s clip | UI only | src/pages/MixedMedia.jsx and 36 mm-* formats (bernini_restyle). See Effects and presets | M | See Effects and presets |
| Kling, Seedance, Wan, MiniMax, Veo shortcuts | Nine to thirteen video model shortcuts | Working | Pinned in src/lib/catalog.js; others through Models page. See Models | - | None |

## Audio

Higgsfield Audio menu: three modes and seven voice models.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Text to speech | Script to speech with a preset or cloned voice; 7 models | Working | src/pages/AudioStudio.jsx; providers: Google (Gemini voice), ElevenLabs (fixed voice id unless chosen). server/core.js runElevenLabs / runGoogle | - | HF: Eleven v3 page only. Need: 3 short sample clips for voice cards |
| Sound effects | Describe a sound (inside Audio) | Working | ElevenLabs sound-generation (model el-sfx) | - | None |
| Music | Songs with vocals (MiniMax Music, Seed Audio) | Working | fal minimax/music-3 pinned in src/lib/catalog.js | - | None |
| Voice preview in picker | Hear a voice before using it | UI only | src/components/generate/Voices.jsx play button disabled | S | Need: 6 voice sample clips |
| Custom voice and cloning | Save a cloned voice, use it everywhere | UI only | src/components/library/Voices.jsx ("Saving voices comes with the backend"); format voice-clone (chatterbox_clone) | M | HF: help text. Need: 1 sample and a clone result |
| Voice change | Swap the voice in a recording or video | UI only | AudioStudio.jsx ?mode=change (note says not wired); format voice-change (chatterbox_vc) | M | HF: loading shell. Need: 1 clip, 1 swapped result |
| Translate (dub with lipsync) | Translate and lip-sync a video into another language | UI only | AudioStudio.jsx ?mode=translate; format dub (dub) | L | HF: loading shell. Need: 1 speech clip and the dubbed version |
| Add sound to a video (foley) | Native audio co-generation | UI only | Format add-sound (hunyuan_foley). Google Veo 3.1 already returns audio natively | M | Need: 1 silent clip and sound-added clip |
| Speak 2.0, Kling Avatars, Wan Speak (talking heads) | Talking clips from an image plus speech | UI only | See Studios: Lipsync studio | M | See Lipsync studio |

## Apps hubs

All 92 Higgsfield apps, in Higgsfield's eight hubs. Status is read from the format code (isWired in src/lib/formats/index.js), not from the page title.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Angles 2.0 (Professional) | Re-renders a photo from a camera position you pick, back views included | Working | `new-angle` (fal fal-ai/qwen-image-edit-2511-multiple-angles) in src/lib/recipes.js; `angles` (qwen_multiangle) in src/lib/formats/appsx.js | - | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| What's Next? (Professional) | Suggests 8 possible next scenes for one still | UI only | `whats-next` (whats_next) in src/lib/formats/appsx.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Shots (Professional) | Makes a 3x3 grid of cinematic angles of one scene | Working | `nine-shots` (fal fal-ai/nano-banana-2/edit) in src/lib/recipes.js; `shots` (qwen_shots_grid) in src/lib/formats/appsx.js | - | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Zooms (Professional) | Makes 9 framings of one image, from close detail to wide | UI only | `zooms` (qwen_zoom_grid) in src/lib/formats/appsx.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Behind the Scenes (Professional) | Pulls back to reveal a film crew and rigs around your photo | UI only | `behind-the-scenes` (qwen_edit) in src/lib/formats/fun.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Transitions (Professional) | Joins two clips or stills with a transition you choose | UI only | `transition` (h3_flf2v) in src/lib/formats/motion.js | S | HF: before/after example clip with input thumbnail (HF page not captured). Need: 1 input photo + 1 clip, 5 s |
| Expand image (Professional) | Outpaints a picture to a wider or taller ratio | UI only | `expand` (qwen_edit_outpaint) in src/lib/formats/edit.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Color grading (Professional) | Grades a still with presets and sliders in a live preview | UI only | `photo-grade` (image_grade) in src/lib/formats/appsx.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Virality Predictor (Professional) | Rates how well a short clip holds attention | UI only | `hook-check` (qwen3_vl_hook_check) in src/lib/formats/ads.js | M | HF: score card screenshot. Need: 1 score card from a real run |
| AI Stylist (Enhance and style) | Dresses you from outfit presets or item by item, with pose and background presets | UI only | `ai-stylist` (qwen_edit_try_on) in src/lib/formats/appsx.js; `try-on` (qwen_edit_try_on) in src/lib/formats/edit.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Relight (Enhance and style) | Moves a virtual light around a photo | Working | `relight` (fal fal-ai/nano-banana-2/edit) in src/lib/recipes.js; `relight-photo` (qwen2511_relight) in src/lib/formats/appsx.js | - | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Skin Enhancer (Enhance and style) | Retouches skin and rebuilds face detail, keeping texture | UI only | `skin-retouch` (klein_retouch) in src/lib/formats/edit.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Outfit Swap (Enhance and style) | Moves the clothes from one photo onto the person in another | Working | `outfit-swap` (fal fal-ai/fashn/tryon/v1.6) in src/lib/recipes.js; `try-on` (qwen_edit_try_on) in src/lib/formats/edit.js | - | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Style Snap (Enhance and style) | Swaps your outfit for a preset look, keeping pose and background | UI only | `style-snap` (qwen_edit) in src/lib/formats/appsx.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Outfit Vending (Enhance and style) | Lays out each item you wear inside a lit vending machine | UI only | `outfit-vending` (qwen_edit) in src/lib/formats/appsx.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Glitter Sticker (Enhance and style) | Cuts you out as a rainbow-foil sticker on a street surface | UI only | `sticker` (klein_edit) in src/lib/formats/fun.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Outfit Shot (Enhance and style) | Puts up to 3 garments on an AI model for a photoshoot | UI only | `outfit-shot` (qwen_try_on_h3) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Recast (Face and identity) | Replaces the person in a video with your character | UI only | `motion-transfer` (wan_animate2) in src/lib/formats/edit.js; `video-character-swap` (scail2_character_swap) in src/lib/formats/appsx.js | M | HF: before/after example clip with input thumbnail (HF page not captured). Need: 1 input photo + 1 clip, 5 s |
| Character Swap 2.0 (Face and identity) | Puts your whole character into another photo's pose and scene | UI only | `character-swap` (klein_character_swap) in src/lib/formats/people.js | M | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Face Swap (Face and identity) | Puts a source face onto a target photo | UI only | `face-swap` (qwen_edit_face_swap) in src/lib/formats/people.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Commercial Faces (Face and identity) | Signs you up to license your likeness to brands, from a selfie | Missing | None | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Video Face Swap (Face and identity) | Swaps a face across every frame of a clip | UI only | `face-swap-video` (wan22_animate_face_swap) in src/lib/formats/edit.js | M | HF: before/after example clip with input thumbnail. Need: 1 input photo + 1 clip, 5 s |
| Headshot Generator (Face and identity) | Turns a selfie into a studio headshot | UI only | `headshot` (klein_headshot) in src/lib/formats/people.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| ClipCut (Video editing) | Turns one selfie into a beat-cut reel of several outfits | UI only | `outfit-reel` (beat_cut_reel) in src/lib/formats/appsx.js | M | HF: before/after example clip with input thumbnail. Need: 1 input photo + 1 clip, 5 s |
| Urban Cuts (Video editing) | Builds a 10 s outfit video cut to the beat of a track | UI only | `beat-cut-outfits` (beat_cut_reel) in src/lib/formats/appsx.js | M | HF: before/after example clip with input thumbnail. Need: 1 input photo + 1 clip, 5 s |
| Sticker Match Cut (Video editing) | Turns the person in a clip into a glittery sticker cutout | UI only | `sticker-match-cut` (sticker_match_cut) in src/lib/formats/appsx.js | M | HF: before/after example clip with input thumbnail. Need: 1 input photo + 1 clip, 5 s |
| Breakdown (Video editing) | Lays out a photo's parts with labels, or spots brands and prices | UI only | `breakdown` (breakdown) in src/lib/formats/appsx.js | M | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Japanese Show (Video editing) | Puts you on a retro Japanese TV variety set with captions | UI only | `game-show` (qwen_edit) in src/lib/formats/fun.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Video Background Remover (Video editing) | Removes the background from every frame | UI only | `video-bg-remove` (birefnet_video_matte) in src/lib/formats/edit.js | M | HF: before/after example clip with input thumbnail. Need: 1 input photo + 1 clip, 5 s |
| Click to Ad (Ads and products) | Turns a product link into ads and UGC inside Marketing Studio | UI only | `link-to-ads` (link_to_ads) in src/lib/formats/ads.js; `url-to-video` (link_to_video) in src/lib/formats/jobsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| ASMR Add-On (Ads and products) | Your character whispers about your product in an ASMR clip | UI only | `asmr-add-on` (asmr_product) in src/lib/formats/appsx.js | M | HF: before/after example clip with input thumbnail. Need: 1 input photo + 1 clip, 5 s |
| ASMR Classic (Ads and products) | Animates a photo into a whispering ASMR clip, image unchanged | UI only | `asmr-classic` (h3_i2v_audio) in src/lib/formats/appsx.js | M | HF: before/after example clip with input thumbnail. Need: 1 input photo + 1 clip, 5 s |
| Poster (Ads and products) | Recasts a product as a bold promo poster | UI only | `poster` (qwen_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Bullet Time Scene (Ads and products) | Freezes and orbits the product in a background themed to it | UI only | `bullet-time-scene` (h3_bullet_time) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Chameleon (Ads and products) | A chameleon shifts its skin to your product's colors | UI only | `chameleon` (h3_product_ad) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| ASMR Host (Ads and products) | Turns a photo into a presenter whispering to camera in an ASMR studio | UI only | `asmr-host` (h3_i2v_audio) in src/lib/formats/appsx.js | M | HF: before/after example clip with input thumbnail. Need: 1 input photo + 1 clip, 5 s |
| Packshot (Ads and products) | Makes a clean hero frame of the product to end an ad | UI only | `packshot` (h3_bullet_time) in src/lib/formats/ads.js; `product-shot` (qwen_edit) in src/lib/formats/edit.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Macro Scene (Ads and products) | Shows product details in macro inside a generated lifestyle set | UI only | `macro-scene` (h3_product_ad) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Magic Button (Ads and products) | Drops the product into a lively, whimsical commercial scene | UI only | `magic-button` (h3_product_ad) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Truck Ad (Ads and products) | Wraps your product or logo on a truck driving through a city | UI only | `truck-ad` (h3_truck_ad) in src/lib/formats/ads.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Giant Product (Ads and products) | Shows the product towering over a skyline from above | UI only | `giant-product` (h3_product_ad) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Bullet Time White (Ads and products) | Spins around the product in bullet time on white | UI only | `packshot` (h3_bullet_time) in src/lib/formats/ads.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Kick Ad (Ads and products) | Your product wins as a rival product gets kicked away | UI only | `kick-ad` (h3_product_ad) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Billboard Ad (Ads and products) | Puts the photo on a giant city billboard in a timelapse | UI only | `billboard` (qwen_edit_mockup) in src/lib/formats/ads.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Graffiti Ad (Ads and products) | Sprays the product onto a city wall as graffiti | UI only | `graffiti-ad` (qwen_mockup_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Bullet Time Splash (Ads and products) | Bursts the product into fragments in slow-motion bullet time | UI only | `bullet-time-splash` (h3_bullet_time) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Fridge Ad (Ads and products) | A fridge opens and a hand takes your product out | UI only | `fridge-ad` (h3_product_ad) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Volcano Ad (Ads and products) | Sets the product against an erupting volcano | UI only | `volcano-ad` (h3_product_ad) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Macroshot Product (Ads and products) | Films the product in extreme close-up | UI only | `macroshot-product` (h3_product_ad) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| ASMR Promo (Ads and products) | Builds a scripted ASMR studio scene around your product | UI only | `asmr-promo` (asmr_product) in src/lib/formats/appsx.js | M | HF: before/after example clip with input thumbnail. Need: 1 input photo + 1 clip, 5 s |
| Game Dump (Games and characters) | Recasts you as a hero in one of 12 game styles, or all 12 | UI only | `game-style` (klein_edit) in src/lib/formats/fun.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Nano Strike (Games and characters) | Turns 1 to 5 people into a tactical-shooter squad | UI only | `squad-strike` (qwen_multi_h3) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Nano Theft (Games and characters) | Renders you as an open-world crime game character | UI only | `open-world-hero` (klein_h3) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Simlife (Games and characters) | Shows you in a life-sim character creator, 3D rendered | UI only | `life-sim` (qwen_edit) in src/lib/formats/fun.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Plushies (Games and characters) | Turns the subject into a knitted plush toy, still or animated | UI only | `plush-toy` (klein_edit) in src/lib/formats/fun.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| 3D Render (Games and characters) | Renders the photo as a 3D object in a render scene | UI only | `render-3d` (klein_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| 3D Figure (Games and characters) | Makes you a toy figure on a desk beside a 3D modeling screen | UI only | `figure-box` (qwen_edit) in src/lib/formats/fun.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Pixel Game (Games and characters) | Your character runs through a retro 8-bit world | UI only | `pixel-game` (klein_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Brick Cube (Games and characters) | Rebuilds the photo as a colorful brick toy cube | UI only | `brick-toy` (klein_edit) in src/lib/formats/fun.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Sketch-to-Real (Games and characters) | Turns a drawing into a realistic scene | UI only | `sketch-to-image` (qwen_edit) in src/lib/formats/edit.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Paint App (Extras) | Frames your photo as a canvas in a 90s paint program on a CRT | UI only | `paint-app` (qwen_edit) in src/lib/formats/appsx.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Signboard (Extras) | Shows your photo as a large mural on a city wall | UI only | `signboard` (qwen_edit) in src/lib/formats/fun.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Micro-Beasts (Extras) | Surrounds you with small animals you pick | UI only | `micro-beasts` (klein_edit) in src/lib/formats/appsx.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| AI Meme Generator (Extras) | Builds a meme on a stock AI face or a prompt, with movable text and AI captions | UI only | `meme` (qwen_edit) in src/lib/formats/fun.js | S | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Background Remover (Extras) | Returns a transparent PNG cutout | Working | `remove-background` (fal fal-ai/bria/background/remove) in src/lib/recipes.js; `image-bg-remove` (birefnet_image) in src/lib/formats/appsx.js | - | HF: example beside a small input thumbnail. Need: 1 input photo + 1 output image |
| Yes Kiss (Trending templates) | A stranger plants a surreal meme kiss on the person in your photo | UI only | `surprise-kiss` (h3_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Latex (Trending templates) | Restyles you in a glossy black latex outfit | UI only | `glossy-vinyl` (klein_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| J-Magazine (Trending templates) | Puts you on a Japanese fashion magazine cover | UI only | `tokyo-cover` (qwen_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Roller Coaster (Trending templates) | Sends you down a roller coaster | UI only | `roller-coaster` (ltx_i2v) in src/lib/formats/motion.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| 60s Cafe (Trending templates) | Places you in a 1960s coffee shop | UI only | `cafe-60s` (klein_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Victory Card (Trending templates) | Prints you on a winning poker card | UI only | `victory-card` (qwen_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Sand Worm (Trending templates) | Giant worms rise behind you in a desert | UI only | `sand-worm` (ltx_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Skibidi (Trending templates) | Your head pops out of a toilet, meme style | UI only | `toilet-pop` (ltx_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| J-Poster (Trending templates) | Turns your photo into a Japanese-style poster with type | UI only | `japanese-poster` (qwen_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Mascot (Trending templates) | Turns you into a football team mascot | UI only | `mascot` (klein_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Storm Creature (Trending templates) | A monster looms behind you in a lightning storm | UI only | `storm-creature` (ltx_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Burning Sunset (Trending templates) | Sits you in a fiery sunset full of sparks | UI only | `burning-sunset` (ltx_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| On Fire (Trending templates) | Draws you calm in the burning-room meme | UI only | `all-fine` (klein_edit) in src/lib/formats/fun.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Comic Book (Trending templates) | Tells a short comic story with panels and speech bubbles | UI only | `comic-story` (qwen_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Cloud Surf (Trending templates) | You surf across pink clouds | UI only | `cloud-surfing` (h3_i2v) in src/lib/formats/fun.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Mukbang (Trending templates) | You eat on camera with crash zooms | UI only | `mukbang` (h3_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Melting Doodle (Trending templates) | Your face melts away in hand-drawn doodle lines | UI only | `melting-doodle` (ltx_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Giallo Horror (Trending templates) | A knife-wielding killer appears in a 70s Italian horror scene | UI only | `giallo-scene` (ltx_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Renaissance (Trending templates) | Hangs you as a classical painting in a busy gallery | UI only | `renaissance` (klein_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Rap God (Trending templates) | Makes a rap video with generated lyrics and beat | UI only | `rap-video` (rap_video) in src/lib/formats/appsx.js | L | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| GTAI (Trending templates) | You run, jump and take cars in an open-world game | UI only | `open-world` (klein_h3) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| 3D Rotation (Trending templates) | Spins the photo as a 3D object through 360 degrees | UI only | `cam-turntable` (h3_i2v) in src/lib/formats/motion.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Mugshot (Trending templates) | Books you at a police station with height chart and placard | UI only | `booking-photo` (qwen_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Ghoulgao (Trending templates) | Drops you into a ghoul horror clip | UI only | `ghoul-night` (ltx_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Social Media Icon (Trending templates) | Surrounds your photo with animated platform logos | UI only | `social-icons` (qwen_ltx) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Idol (Trending templates) | Puts you on stage as a pop idol | UI only | `idol-stage` (klein_h3) in src/lib/formats/appsx.js | M | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |
| Banana Eating (Trending templates) | You calmly eat a banana in a plain scene | UI only | `banana-snack` (ltx_i2v) in src/lib/formats/appsx.js | S | HF: before/after example (clip, image switch). Need: 1 input photo + 1 clip, 5 s + 1 still |

## Studios

Cinema, Influencer, Ads, Marketing and the other standalone studios.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Cinema Studio (video) | Projects, Elements, Director panel, AI Director, 50 references, 4.0 | UI only | src/pages/CinemaStudio.jsx, components/studio/* (Wheel, EmotionWheel, DirectorPanel, PhotoGrid are built; Generate is disabled) | M | HF: shell screenshot. Need: 1 hero scene as 3 shots and a 5 s clip |
| Cinema Studio Elements | Reusable characters, locations, props referenced with @ | Working | Library characters, products and brands (server/plugin.js, useLibrary.js), pulled in with @ | - | None |
| Cinema Studio projects | Project brief holds one look across every shot | Missing | No project container; Flows are the nearest thing | M | None |
| AI Director (script into shots) | Paste a script, get shots with camera parameters | Missing | None. writePrompts (server/core.js) already turns an idea into N prompts | M | None |
| AI Influencer studio | See Image | UI only | src/pages/Influencer.jsx | M | See Image |
| Fashion Factory | See Image | UI only | src/pages/FashionFactory.jsx | M | See Image |
| Marketing Studio | 1,500+ ad templates from a product image or URL; image and video ads | UI only | src/pages/MarketingStudio.jsx (Generate disabled); Library products with link import (server/plugin.js importUrl) is real | M | HF: screenshot plus template tiles. Need: 1 product and 6 ad templates rendered |
| Ads Studio and Ad Multiplier | Brand kit into batches of static ads; variations of a reference video ad | UI only | src/pages/AdsStudio.jsx; Library brand kits are real; flowStore template "Ad variants" runs the same idea | M | HF: screenshot. Need: 1 brand kit and 6 ad variants |
| Click to Ad | Product URL into video ads inside Marketing Studio | UI only | Formats link-to-ads, url-to-video; AdsStudio.jsx. URL import for products exists in Library | M | HF: before/after in app page. Need: 1 product page and 2 ads |
| Brand kit | Logo, colors, voice reused across ads | Working | src/components/library/Assets.jsx brands (name, logo, colors, voice notes), server library API | - | None |
| Faceless Studio | Animated faceless YouTube episodes from a one-line idea | UI only | src/pages/FacelessStudio.jsx; formats faceless, story-video, script-to-video | L | HF: loading screenshot. Need: 1 episode of 30 s as the sample |
| Explainer | Topic, file or URL into a narrated explainer up to 10 min | UI only | src/pages/Explainer.jsx (Generate disabled); formats explainer, motion-graphics | L | HF: loading shell. Need: 1 explainer clip of 20 s in a named style |
| Shorts Studio | Uploaded footage into vertical shorts, 40+ presets | UI only | src/pages/ShortsStudio.jsx; formats clip-to-shorts, podcast-clips | L | HF: screenshot. Need: 1 source video and 3 shorts |
| 3D Jutsu / 3D studio | Agent builds an editable 3D blocking scene, then renders to video | UI only | src/pages/ThreeD.jsx; formats scene-3d, game, world-3d, image-to-3d | L | HF: screenshot. Need: 1 blocked scene and its render |
| Lipsync Studio | Talking clips from image or video plus speech; six engines | UI only | src/pages/LipsyncStudio.jsx; formats talking-head, lipsync (infinitetalk) | M | HF: screenshot. Need: 1 portrait, 1 line of audio, 1 talking clip |
| Virality predictor / similarity scoring | Score a short clip for hold rate and hook | UI only | Format hook-check (qwen3_vl_hook_check). Gemini key could run it today as a text and image call | M | HF: score card screenshot. Need: 1 score card mock from a real run |
| Ad localization workflow | Translate, lipsync and reframe an ad | UI only | Combination of dub, lipsync and reframe formats (all UI only) | L | None |

## Effects and presets

Motion library (229 pages, 134 distinct), Effects hub (45), Mixed media (33), and the smaller preset libraries.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Motion presets: camera moves (49 distinct) | DoP camera moves from one keyframe; Basic and Epic | UI only | src/lib/formats/motion.js and presetsx.js: 72 cam-* formats (h3_i2v), plus Mix two moves with 12+ options. Only text presets inside VideoStudio actually run | S | HF: each preset page has sample clips. Need: 8 hero clips (dolly in, orbit, crash zoom, FPV, bullet time, whip pan, crane, hyperlapse) from one photo |
| Motion presets: camera effects (14) | Lens crack, flare, slow shutter, hyperlapse | UI only | cam-lens-crack, cam-lens-flare, cam-slow-shutter, cam-hyperlapse, cam-dirty-lens (h3_i2v) | S | Need: 3 clips |
| Motion presets: character actions (19) | Boxing, kiss, skate, ski, snowboard, catwalk, moonwalk | UI only | effects category in motion.js / presetsx.js: boxing, kiss, catwalk, moonwalk-left/right, skate-*, ski-*, snowboard-*, slam-dunk, high-kick, action-run (h3_i2v). 17 of 19 present | S | Need: 4 clips |
| Motion presets: VFX (49) | Transformations: fire, metal, diamond, explosions, clones | UI only | effects formats on ltx_i2v: set-on-fire, turn-to-metal, turn-to-diamond, building-explosion, car-explosion and about 40 more | S | Need: 6 clips |
| Motion presets: wired today (fal) | Melting, Zero gravity, Giant, Claymation equivalents | Working | src/lib/recipes.js melt, zero-gravity, city-giant, claymation (Seedance 2.0 Fast, Kling 3 via fal) | - | Need: 4 clips (covers are gradients, not real previews) |
| Motion presets: Mix pairs (16) | Combine a VFX with a camera move | UI only | cam-mix and 8 cam-mix-* formats (h3_i2v) | S | Need: 2 clips |
| Motion presets: hub-only names (125 more) | Timelapse Glam, Giant Grab, Money Rain and others | Missing | Not individually present. Add as prompt-only formats | S | HF: not captured. Need: only for those we ship |
| Viral, UGC, Commercial collections | 54, 45 and 27 themed DoP presets | UI only | Trending hub in src/lib/formats/appsx.js (28); ads formats in ads.js. No UGC pack (Outfit Check, Plate Check) | S | Need: 4 clips |
| Cinema Studio presets | 30+ moves, 10 MoveSets, 6 lighting presets, 50+ palettes | UI only | src/components/studio/presets.js and cinema.js (data present, Generate disabled) | M | Need: 6 lighting stills |
| Soul style presets | 20+ named styles (Warm Ambient, Y2K Street, Siren...) | UI only | 27 formats in looks.js | S | Need: 8 tile images |
| Sora 2 presets (now on Seedance 2.0) | Unpacking, Luxury Ad, ASMR, Epic Fail and 6 more | Missing | Not present | S | Need: 4 clips if added |
| Genjutsu presets | 30+ ready motion transfer or object swap presets | UI only | restyle-video / swap-element formats without presets | M | Need: 3 clips |
| Shorts Studio presets | 40+ pacing and visual treatments | Missing | ShortsStudio.jsx has style tiles but no generation | L | Need: 3 clips |
| Explainer presets | Pixel Art, Claymotion, Mixed Media, 3D Papercraft, 2D Illustrator, Whiteboard | UI only | style choice in format explainer (src/lib/formats/motion.js); page src/pages/Explainer.jsx | L | Need: 6 style stills |
| Marketing Studio presets | 10 image and 9 video ad formats | UI only | ads.js (27 video, 8 image ad formats, all UI only) | M | Need: 4 stills, 3 clips |

## Effects hub (45 effects)

Higgsfield /effects, also called Effects 2.0 and Viral Presets. Each is one photo in, one clip out, no prompt. Street Colossus and Melting point at the closest fal recipes that already run (city-giant, melt), which are different looks of the same idea.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Floating Fall | Photo to video | UI only | `floating-fall` in src/lib/formats/motion.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| High Flip | Photo to video | UI only | `high-flip` in src/lib/formats/motion.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Burning Man | Photo to video | UI only | `burning-figure` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Scrapbook Collage | Photo to video | UI only | `scrapbook` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Comic | Mixed media look on a clip | UI only | `mm-comic` in src/lib/formats (bernini_restyle) | M | HF: /effects/examples page with sample clip. Need: 1 source clip + 1 restyled clip, 5 s |
| Frozen in Motion | Photo to video | UI only | `frozen-in-motion` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Particles | Mixed media look on a clip | UI only | `mm-particles` in src/lib/formats (bernini_restyle) | M | HF: /effects/examples page with sample clip. Need: 1 source clip + 1 restyled clip, 5 s |
| Pigeons | Photo to video | UI only | `pigeon-street` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Pearl Earring | Photo to video | UI only | `pearl-portrait` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Studio Slide | Photo to video | UI only | `studio-slide` in src/lib/formats/motion.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Incline | Photo to video | UI only | `cam-incline` in src/lib/formats/presetsx.js (h3_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Act Natural | Photo to video | UI only | `act-natural` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Monster Dab | Photo to video | UI only | `monster-dab` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Clones | Photo to video | UI only | `clones` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Earth Zoom | Photo to video | UI only | `cam-earth-zoom-out` in src/lib/formats/presetsx.js (h3_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Cutout | Photo to video | UI only | `cutout` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Mighty Fighter | Photo to video | UI only | `mighty-fighter` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Vanish | Photo to video | UI only | `vanish` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Moonwalk | Photo to video | UI only | `moonwalk` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Eyes In | Photo to video | UI only | `eyes-in` in src/lib/formats/motion.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Street Colossus | Photo to video | Working | `city-giant` in src/lib/recipes.js (fal fal-ai/kling-video/v3/standard/image-to-video) | - | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Melting | Photo to video | Working | `melt` in src/lib/recipes.js (fal bytedance/seedance-2.0/fast/image-to-video) | - | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Architecture Wave | Photo to video | UI only | `architecture-wave` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Agamemnon | Photo to video | UI only | `out-of-the-screen` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Cyclope | Photo to video | UI only | `one-eyed-giant` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Canvas | Mixed media look on a clip | UI only | `mm-canvas` in src/lib/formats (bernini_restyle) | M | HF: /effects/examples page with sample clip. Need: 1 source clip + 1 restyled clip, 5 s |
| Tracking | Mixed media look on a clip | UI only | `mm-tracking` in src/lib/formats (bernini_restyle) | M | HF: /effects/examples page with sample clip. Need: 1 source clip + 1 restyled clip, 5 s |
| LSD | Mixed media look on a clip | UI only | `mm-color-trip` in src/lib/formats (bernini_restyle) | M | HF: /effects/examples page with sample clip. Need: 1 source clip + 1 restyled clip, 5 s |
| Blue Depth | Photo to video | UI only | `blue-depth` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Wild Ride | Photo to video | UI only | `wild-ride` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| World Morphing | Photo to video | UI only | `world-morph` in src/lib/formats/motion.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Stop World | Photo to video | UI only | `stop-world` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Bullet Time | Photo to video | UI only | `cam-bullet-time` in src/lib/formats/motion.js (h3_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Infinite Clones | Photo to video | UI only | `infinite-clones` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Superstar | Photo to video | UI only | `superstar` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Skatedog | Photo to video | UI only | `skate-dog` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Smash and Grab | Photo to video | UI only | `smash-and-grab` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Selfception | Photo to video | UI only | `selfception` in src/lib/formats/motion.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Lacewalker | Photo to video | UI only | `lacewalker` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Boarding Pass | Photo to video | UI only | `boarding-pass` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Lidar Transition | Photo to video | UI only | `lidar-scan` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Fallen Angel | Photo to video | UI only | `fallen-angel` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Windows | Mixed media look on a clip | UI only | `mm-windows` in src/lib/formats (bernini_restyle) | M | HF: /effects/examples page with sample clip. Need: 1 source clip + 1 restyled clip, 5 s |
| Fairytale Castle | Photo to video | UI only | `fairytale-castle` in src/lib/formats/presetsx.js (ltx_i2v) | S | HF: /effects/examples page with sample clips. Need: 1 input photo + 1 clip, 5 s |
| Palette | Mixed media look on a clip | UI only | `mm-palette` in src/lib/formats (bernini_restyle) | M | HF: /effects/examples page with sample clip. Need: 1 source clip + 1 restyled clip, 5 s |

## Mixed media looks (33)

Higgsfield Mixed Media restyles a 1 to 10 s clip. All 33 look names have an mm-* format here (we ship 33). They all share one workflow, bernini_restyle, so one build unlocks all of them.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Color and light (11): Acid, Cold vision, Lava, LSD, Noir, Ocean, Overexposed, Random glow, Toxic, Two color, Ultraviolet | Restyle a clip | UI only | mm-acid ... mm-ultraviolet in src/lib/formats/mixedx.js (bernini_restyle) | M | HF: /mixed-media-community gallery of ~35 tiles. Need: 1 source clip + 11 restyled thumbnails |
| Drawn and painted (8): Akrill, Canvas, Comic, Flash comic, Hand paint, Palette, Sketch, Vintage | Restyle a clip | UI only | mm-acrylic, mm-canvas, mm-comic, mm-flash-comic, mm-hand-paint, mm-palette, mm-sketch, mm-vintage | M | Need: 8 restyled thumbnails |
| Overlay and glitch (7): Broken mirror, Bubbles, Fragments, Multiverse, Particles, Tracking, Windows | Restyle a clip | UI only | mm-broken-mirror, mm-bubbles, mm-fragments, mm-multiverse, mm-particles, mm-tracking, mm-windows | M | Need: 7 restyled thumbnails |
| Paper and print (7): Cannabis, Layer mixed media, Magazine, Marble, Modern, Origami, Paper | Restyle a clip | UI only | mm-smoke-poster (for Cannabis), mm-collage, mm-magazine, mm-marble, mm-modern, mm-origami, mm-paper | M | Need: 7 restyled thumbnails |

## Models

Higgsfield resells 143 named models. ComfyField reaches models through fal, Google, ElevenLabs and ComfyUI; any fal endpoint works as fal:<endpoint>.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Seedance 2.5 / 2.0 / 2.0 Fast | ByteDance video, 15 to 30 s, up to 50 references | Working | Pinned fal bytedance/seedance-2.5/text-to-video; Seedance 2.0 Fast image-to-video in recipes.js | - | None |
| Kling 3.0 and Kling Motion Control | Kling video, 15 s, 4K, multi-shot | Working | Pinned fal Kling 3 Pro text-to-video; Kling 3 Standard image-to-video in recipes.js. Motion Control not wired | - | None |
| Veo 3.1 / Fast / Lite | Google video with audio | Working | Google key, server/core.js runGoogle predictLongRunning (text or one start image; no end frame or references) | - | None |
| MiniMax H3 / Hailuo | Video with references | Working | Pinned fal minimax/h3/text-to-video. The open H3 workflow (h3_i2v) is not built | - | None |
| Wan 3.0 / 2.7 / 2.6 / 2.5 | Alibaba video | Working | Pinned fal alibaba/wan-3.0/text-to-video. Wan 2.2 and Wan Animate on ComfyUI listed but not built | - | None |
| LTX 2.5 | Lightricks video | UI only | Only the LTX 2B workflow public/workflows/video_ltx.json runs (comfy-ltx). LTX 2.5 on ComfyUI is listed, not built; reachable on fal if hosted | M | None |
| Sora 2, Grok Imagine, Gemini Omni Flash, Happy Horse, PixVerse | Other closed video models | Missing | Not pinned. Run through the Models page if fal hosts them. Sora 2 API retires 2026-09-24 | S | None |
| GPT Image 2 / 2.5 | OpenAI image | Working | Pinned fal openai/gpt-image-2. 2.5 not pinned | - | None |
| Nano Banana, 2, Pro, 2.1 | Google image | Working | Pinned via fal (Pro) and Google key (Pro, 2). Also used by recipes (nano-banana-2/edit) | - | None |
| FLUX.2 / FLUX 3 | Black Forest Labs image | Working | Pinned fal Flux 2 Pro and ComfyUI FLUX (image_flux.json). FLUX 3 Klein listed as open model, not built | - | None |
| Seedream, Ideogram, Recraft, Z-Image, Qwen Image | Other image models | Working | Through src/pages/Models.jsx fal browser; schema-driven inputs (shared/mapping.js falInput) | - | None |
| Soul, DoP, Speak, Genjutsu, Cinema Studio 4.0 (house models) | Higgsfield-only | Not planned | Proprietary; open equivalents are listed in src/lib/tools.js openModels | - | None |
| Eleven v3 / v4, Qwen Audio, MiniMax Speech, Seed Speech, VibeVoice | Voice models | Working | ElevenLabs (multilingual v2) and Gemini voice are wired. The rest only if fal hosts them | S | None |
| Open-weight lineup (Wan 2.2, LTX 2.5, H3, Qwen Image 2.1, Klein, Chatterbox, Fish Drama...) | Not offered as open weights | UI only | src/lib/tools.js openModels: 16 entries, all marked "Not wired yet" in ModelPicker. Only 3 workflow JSON files exist in public/workflows | L | None |
| Comfy Cloud, Comfy Router, Comfy API v2, Comfy SDK | No equivalent (Higgsfield API is its own) | Missing | Not in code. The comfy provider talks to a ComfyUI URL with an optional X-API-Key (server/core.js runComfy). Required for the competition demo path | M | None |

## Canvas and flows

Higgsfield Canvas: infinite node board, parallel runs, templates, live team editing.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Node board with prompt, reference and model nodes | Chain prompt, image, video and edit nodes | Working | src/pages/Flows.jsx, src/components/flow/nodes.jsx, src/lib/flowEngine.js. Nodes: prompt, image, model, approve, output, note. Any provider, any pinned or fal model | - | HF: board screenshot. Need: 1 board screenshot with a finished run |
| Run chain in sequence or in parallel | Trigger one node or the whole chain | Working | flowEngine.js createEngine (topological order, concurrency 3, rerun, downstream invalidation) | - | None |
| Board templates | Save a board as a template; Quick Start list | Working | src/lib/flowStore.js templates (Ad variants, Storyboard to video, Draft then final); export and import JSON | - | None |
| Audio and video reference nodes | Audio nodes feed video nodes | Missing | Image nodes only; video and audio inputs are not in flowEngine yet (note in flowStore "Draft then final") | M | None |
| Live team editing and sharing | Invite collaborators from Share | Not planned | Local-first single user. Export and import of flow JSON covers hand-off | - | None |
| Autosave and restore | Board autosaves; hard refresh restores | Working | flowStore.js saveFlows / loadFlows (browser localStorage) | - | None |

## Supercomputer and agents

Higgsfield in-app agents and creative-app agents.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Supercomputer chat agent | Plans a brief, routes steps to models, runs and refines; LLM picker; "ask before generating" | UI only | src/pages/Assistant.jsx shows a sample plan with costs; Approve is NotWired | M | HF: screenshot. Need: 1 brief, its plan card and the run output |
| Plan with cost estimate and approval | Plan lists steps, models and credits before running | UI only | Assistant.jsx plan card; src/lib/cost.js estimate and flow approve nodes are real | M | None |
| Skills / templates inside the agent | Ad Multiplier, Faceless, Shorts Maker, Brandkit, Website Building | UI only | Flow templates in flowStore.js are the equivalent; no agent skills | M | None |
| Connectors, scheduled tasks, memory, projects | Telegram, Slack, TikTok, Gmail, Drive, Notion | Missing | None | L | None |
| App Builder and Games | Agent-built apps and browser games that charge users credits | Missing | Format game (qwen3_coder_game) is UI only; no builder or hosting | L | None |
| Katana (Claude skill) | See Video | UI only | clone-edit format | M | See Video |
| AI Motion Designer | Editable After Effects motion design from chat | Not planned | Needs After Effects; ComfyField has Motion graphics format (UI only) | - | None |

## MCP, CLI, API and plugins

Where outside agents and apps plug in.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| MCP server | OAuth connector with 30+ models, upscaling, voice, characters, balance | Working | server/mcp.js: list_models, generate, get_model_schema, balance, write_prompts (stdio). Works in Claude Code, Codex, Cursor, ChatGPT desktop | - | HF: page screenshot and example prompts. Need: 1 recorded agent run |
| MCP: recipes, formats and flows as tools | Skills, presets, generation history | Missing | README TODO: list_recipes, run_recipe, run_flow. src/lib/recipes.js and flowEngine.js are browser-side | M | None |
| MCP skill pages (41) | Slash commands with example prompts and demo video | Missing | None. Formats could publish as MCP prompts | M | HF: demo video per skill. Need: 3 skill pages with a clip |
| Spend guard for agents | None (Higgsfield agents always spend credits) | Missing | estimateCost exists (server/core.js). A per-session budget cap and "ask before spending" is not built | S | None |
| CLI | npm i -g @higgsfield/cli with generate, soul, product-photoshoot skills | Working | bin/comfyfield.js: models, generate, connect, balance, mcp, dev | - | None |
| Public API and SDKs | REST at api.higgsfield.ai, Python and TypeScript SDKs, 50+ models | Missing | Local HTTP routes in server/plugin.js are internal and undocumented; no SDK | M | None |
| ChatGPT plugin and extension | Slash commands /effects /product /motion | Missing | MCP works in ChatGPT desktop per README; no plugin | M | None |
| Creative app plugins (Photoshop, Premiere, AE, Resolve, Figma, Blender, Minecraft) | Panels and bridges | Not planned | Out of scope for a local app | - | None |
| n8n / Make / no-code automation | Workflows over the API | Missing | None. CLI is scriptable | S | None |

## Explore and community

Higgsfield Home/Explore plus the community programs.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Explore / Home feed | Launches and tools, carousel and rows | Working | src/pages/Explore.jsx (hero slides, rows of tools, effects, apps, models). Local catalog, not a community feed. Covers are gradients | S | HF: feed of real clips. Need: ~20 hero clips and stills for card covers |
| My generations / Assets | History, elements, favorites | Working | src/pages/Library.jsx, components/library/Generations.jsx (browser storage; download, copy, delete, approve), characters, products, brands, voices tabs | - | None |
| Mega menu navigation | Image, Video, Audio menus with models second | Working | src/components/nav/MegaMenu.jsx, TopBar.jsx, MobileNav.jsx | - | None |
| Recreate a shot with its prompt | Main community loop | Missing | No "run again with these settings" action in Generations.jsx | S | None |
| Community feed, Open Projects, Shots, Creators | Public projects with prompts | Not planned | Needs a hosted backend; local-first by design | - | None |
| Contests, Global Film Festival, Earn, Grants, Creator Partnership | Prize and pay programs | Not planned | Business programs | - | None |
| Original Series streaming page | 30 AI series and films | Not planned | None | - | None |
| Academy and prompt bank | Courses; 46 copyable camera prompts | Missing | Camera moves formats carry the prompts but no course or bank page | S | None |
| Discord, rating and achievements | Community and points | Not planned | None | - | None |

## Account, billing and enterprise

Mostly not applicable to a bring-your-own-key local app.

| Feature | Higgsfield | ComfyField status | Where in our code | Size | Example media needed |
|---|---|---|---|---|---|
| Plans, credits, credit packs, auto-refill, promo codes | Subscription tiers and credits | Not planned | Users pay providers directly | - | None |
| Unlimited models, concurrency boost, referral | Unlimited windows and add-ons | Not planned | None | - | None |
| Cost shown before a run | Credits on every Generate button | Working | src/lib/cost.js, shared/mapping.js estimate, GoButton cost text; provider balance via /api/balance | - | None |
| Watermark on free plans | Visible watermark | Working | ComfyField never watermarks (an advantage, see below) | - | None |
| Team plan, Scale plan, roles, enterprise, case studies | Shared workspaces, pooled credits | Not planned | None | - | None |
| Sign in, recovery, deletion, billing, refunds | Account lifecycle | Not planned | No accounts; keys in .comfyfield/keys.json | - | None |
| Provider connections | Not applicable | Working | src/pages/Connections.jsx, server/core.js saveConnection / testConnection (comfy, fal, google, elevenlabs) | - | None |
| NSFW and IP blocking | Platform-wide classifier and IP blocks | Not planned | No ComfyField layer; each provider filters on its own | - | None |
| Mobile interface | Responsive web (no native app) | Working | src/components/nav/MobileNav.jsx | - | None |
| Commercial rights and ownership | Users own outputs | Not planned | Outputs are the user's files; provider terms apply | - | None |

