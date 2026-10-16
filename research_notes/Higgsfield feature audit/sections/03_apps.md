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
