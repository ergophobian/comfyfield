# Instant model ports

104 runnable formats now have Instant alternates: 55 using Klein and 49 using Qwen. There are 39 new graphs; 37 have every file on the public Cloud listing. The two Trellis variants still need files Cloud does not list, so `text-to-3d` and `character-to-3d` remain Session-only.

Explicit Instant selects `cloudWorkflow` / `cloudImageWorkflow` or the format mapping in `src/lib/catalog.js` before loading the graph. Session and the existing automatic/unselected routing keep the original graphs. `comfyTarget` is unchanged. Original workflow files and the Pod manager are unchanged.

Flux 3 Klein becomes Flux.2 Klein 4B with the Qwen 3 4B encoder (`flux2`), the Flux.2 VAE, Euler sampling and the resolution-aware Flux.2 scheduler at four steps. The Flux 3 prompt upsampler is removed; reference conditioning uses VAE encoding and reference latents following the official distilled Klein examples.

Qwen-Image 2.1 edits/references become Edit 2511 with the Lightning four-step adapter, shift 3.1, guidance normalization, guidance 1 and Euler/simple sampling. Text-to-image becomes Image 2512 at 50 steps and guidance 4. Both use the Qwen 2.5 VL encoder and Qwen Image VAE; image latents use the matching 16-channel contract.

## Quality risk and unverified behavior

These are different models, so prompt following, text rendering, identity, fine detail and editing fidelity can differ. Klein no longer expands prompts. Edit 2511 references are encoded at its native resolution rather than Qwen 2.1 resolution. `qwen_multi_h3` and `qwen_try_on_h3` keep all references as ordered contact sheets to fit the older encoder; this may weaken identity and garment separation. Image 2512 does not generate alpha, so the logo variant uses the existing BiRefNet cutout model; edges and internal cutouts need visual review.

Nothing is verified live: no paid generations, authenticated Cloud requests, Pod provisioning or model downloads were performed. Public file listings and offline core-node contracts do not prove runtime availability or output quality. Run time and memory estimates are estimates, not measurements.

## Public evidence

The unauthenticated listing checks, Hugging Face large-file hashes and pinned official workflow URLs are recorded in [public-evidence.json](public-evidence.json). Existing encoder, VAE and Edit 2511 entries already matched those hashes; only the Klein 4B and Image 2512 diffusion entries were added to `shared/modelFiles.js`.

Official contracts: [Klein guide](https://docs.comfy.org/tutorials/flux/flux-2-klein), [Comfy workflow templates](https://github.com/Comfy-Org/workflow_templates).

## Formats with Instant alternates

### Klein formats (55)

`all-fine`, `animal`, `anime-me`, `brand-colors`, `brick-toy`, `cafe-60s`, `cartoon-me`, `character-scene`, `character-swap`, `coloring-page`, `drawing`, `game-style`, `glossy-vinyl`, `headshot`, `idol-stage`, `influencer-post`, `look-anime-cel`, `look-claymation`, `look-disposable`, `look-drone-top-down`, `look-film-70s`, `look-film-noir`, `look-fisheye-skate`, `look-golden-hour`, `look-ink-sketch`, `look-instant`, `look-low-poly`, `look-oil-painting`, `look-phone-flash`, `look-pixel-art`, `look-street-style`, `look-studio-fashion`, `look-tilt-shift`, `look-vaporwave`, `look-watercolor`, `loop-background`, `mascot`, `micro-beasts`, `moodboard`, `open-world`, `open-world-hero`, `pixel-game`, `plush-toy`, `portrait`, `profile-picture`, `renaissance`, `render-3d`, `restyle`, `sketch`, `skin-retouch`, `slide-visuals`, `sticker`, `storyboard`, `tiny-creature`, `wallpaper`.

### Qwen formats (49)

`ad-variants`, `age-progression`, `ai-stylist`, `banner`, `behind-the-scenes`, `billboard`, `booking-photo`, `character-sheet`, `comic-story`, `copy-style`, `design-graphic`, `erase`, `expand`, `figure-box`, `game-show`, `graffiti-ad`, `hairstyle`, `invitation-video`, `japanese-poster`, `life-sim`, `logo`, `look-cctv`, `look-comic-book`, `look-magazine-90s`, `meme`, `mural`, `new-background`, `outfit-shot`, `outfit-vending`, `paint-app`, `photo-restore`, `photocard`, `place-product`, `poster`, `product-shot`, `remove-text`, `replace`, `signboard`, `sketch-to-image`, `social-icons`, `squad-strike`, `style-snap`, `thumbnail`, `tokyo-cover`, `truck-ad`, `try-on`, `victory-card`, `video-bg-remove`, `zooms`.

## Workflow coverage

- `birefnet_qwen_background` → `birefnet_qwen_background_cloud`: `new-background`.
- `birefnet_video_matte_scene` → `birefnet_video_matte_scene_cloud`: `video-bg-remove`.
- `flux3_klein_t2i` → `flux3_klein_t2i_cloud`: Composer model only.
- `flux_character_set` → `flux_character_set_cloud`: `influencer-post`.
- `flux_look` → `flux_look_cloud`: `animal`, `brand-colors`, `drawing`, `look-anime-cel`, `look-claymation`, `look-disposable`, `look-drone-top-down`, `look-film-70s`, `look-film-noir`, `look-fisheye-skate`, `look-golden-hour`, `look-ink-sketch`, `look-instant`, `look-low-poly`, `look-oil-painting`, `look-phone-flash`, `look-pixel-art`, `look-street-style`, `look-studio-fashion`, `look-tilt-shift`, `look-vaporwave`, `look-watercolor`, `sketch`, `slide-visuals`, `wallpaper`.
- `flux_look_ref` → `flux_look_ref_cloud`: `look-anime-cel`, `look-claymation`, `look-disposable`, `look-drone-top-down`, `look-film-70s`, `look-film-noir`, `look-fisheye-skate`, `look-golden-hour`, `look-ink-sketch`, `look-instant`, `look-low-poly`, `look-oil-painting`, `look-phone-flash`, `look-pixel-art`, `look-street-style`, `look-studio-fashion`, `look-tilt-shift`, `look-vaporwave`, `look-watercolor`.
- `flux_trellis2` → `flux_trellis2_cloud`: `text-to-3d`; still Session-only because Trellis files are missing from Cloud.
- `h3_loop` → `h3_loop_cloud`: `loop-background`.
- `h3_truck_ad` → `h3_truck_ad_cloud`: `truck-ad`.
- `klein_character` → `klein_character_cloud`: `character-scene`.
- `klein_character_swap` → `klein_character_swap_cloud`: `character-swap`.
- `klein_edit` → `klein_edit_cloud`: `anime-me`, `brick-toy`, `cartoon-me`, `coloring-page`, `micro-beasts`, `plush-toy`, `restyle`, `tiny-creature`.
- `klein_edit_canvas` → `klein_edit_canvas_cloud`: `all-fine`, `game-style`, `portrait`, `profile-picture`, `sticker`.
- `klein_h3` → `klein_h3_cloud`: `idol-stage`, `open-world`, `open-world-hero`.
- `klein_headshot` → `klein_headshot_cloud`: `headshot`.
- `klein_ltx` → `klein_ltx_cloud`: `cafe-60s`, `glossy-vinyl`, `mascot`, `pixel-game`, `renaissance`, `render-3d`.
- `klein_moodboard` → `klein_moodboard_cloud`: `moodboard`.
- `klein_retouch` → `klein_retouch_cloud`: `skin-retouch`.
- `qwen_character_sheet` → `qwen_character_sheet_cloud`: `character-sheet`.
- `qwen_edit` → `qwen_edit_cloud`: `age-progression`, `ai-stylist`, `erase`, `hairstyle`, `meme`, `product-shot`, `remove-text`, `replace`, `signboard`, `sketch-to-image`, `style-snap`.
- `qwen_edit_mockup` → `qwen_edit_mockup_cloud`: `behind-the-scenes`, `billboard`, `figure-box`, `game-show`, `life-sim`, `mural`, `outfit-vending`, `paint-app`, `photocard`.
- `qwen_edit_outpaint` → `qwen_edit_outpaint_cloud`: `expand`.
- `qwen_edit_place_product` → `qwen_edit_place_product_cloud`: `place-product`.
- `qwen_edit_style_ref` → `qwen_edit_style_ref_cloud`: `copy-style`.
- `qwen_edit_try_on` → `qwen_edit_try_on_cloud`: `try-on`.
- `qwen_edit_variants` → `qwen_edit_variants_cloud`: `ad-variants`.
- `qwen_h3` → `qwen_h3_cloud`: `invitation-video`, `poster`.
- `qwen_image21_t2i` → `qwen_image21_t2i_cloud`: `banner`, `design-graphic`, `look-cctv`, `look-comic-book`, `look-magazine-90s`, `thumbnail`.
- `qwen_image_logo` → `qwen_image_logo_cloud`: `logo`.
- `qwen_image_ref` → `qwen_image_ref_cloud`: `banner`, `design-graphic`, `look-cctv`, `look-comic-book`, `look-magazine-90s`, `thumbnail`.
- `qwen_ltx` → `qwen_ltx_cloud`: `booking-photo`, `comic-story`, `japanese-poster`, `social-icons`, `tokyo-cover`, `victory-card`.
- `qwen_mockup_ltx` → `qwen_mockup_ltx_cloud`: `graffiti-ad`.
- `qwen_multi_h3` → `qwen_multi_h3_cloud`: `squad-strike`.
- `qwen_restore` → `qwen_restore_cloud`: `photo-restore`.
- `qwen_try_on_h3` → `qwen_try_on_h3_cloud`: `outfit-shot`.
- `qwen_zoom_grid` → `qwen_zoom_grid_cloud`: `zooms`.
- `storyboard` → `storyboard_cloud`: `storyboard`.
- `storyboard_ref` → `storyboard_ref_cloud`: `storyboard`.
- `trellis2_character` → `trellis2_character_cloud`: `character-to-3d`; still Session-only because Trellis files are missing from Cloud.

## Validation

Checks run in the isolated Windows scratch clone `C:/comfyfield-instant-afa17030`, based on `7ee3b1c`. Dependencies, the production build, verification and headless browsers run there. No heavy checks run on the Mac.

The format checks compare every alternate’s required and optional placeholders with its original graph. The Comfy format checks validate core node contracts, sampler settings, public model hashes, links and every optional-reference subset. Synthetic execution checks exercise all 39 pairs: Instant, Session, missing references, missing keys, unavailable models and undersized Sessions. No synthetic check calls a provider.

The production build passed in 2.28 seconds. Vite reported its existing chunk-size warning (bundle over 500 kB). The full verification passed with Git Bash first on the Windows path. An initial run selected WSL Bash and failed existing shell-path checks; correcting the test environment resolved those failures without repository changes. The Pod suite passed all 82 tests with none skipped.

```text
39 alternate pairs: Instant selects Cloud graphs, Session preserves original graphs/files, optional uploads and target guards pass. Synthetic clients only; no live generations.
39 Cloud alternates: core node contracts, links, placeholders and optional references valid; two Trellis graphs retain other Pod-only files. No live runs.
Format check ok: 450 runnable, 29 hidden, 10 migrated recipes. No generation calls.
Graph check: 147/147 graphs fit ComfyUI v0.41.1 and the listed packs.
17/17 check scripts passed
```
