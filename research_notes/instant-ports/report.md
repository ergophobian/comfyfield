# Instant model ports

Runnable Klein and Qwen formats now have Instant alternates. All alternate graphs except the two Trellis variants have every file on the public Cloud listing. The two Trellis variants still need files Cloud does not list, so `text-to-3d` and `character-to-3d` remain Session-only.

Before `comfyTarget` evaluates a run, Instant selects a fully Cloud-compatible `cloudWorkflow` / `cloudImageWorkflow` or the format mapping in `src/lib/catalog.js`. An unset run type does the same when no ready Pod fits the original graph. Session and unset runs with a fitting ready Pod keep the original graphs. Alternates with missing Cloud files stay blocked, and missing Comfy keys retain the existing error. `comfyTarget` is unchanged. Original workflow files and the Pod manager are unchanged.

Flux 3 Klein becomes Flux.2 Klein 4B with the Qwen 3 4B encoder (`flux2`), the Flux.2 VAE, Euler sampling and the resolution-aware Flux.2 scheduler at four steps. The Flux 3 prompt upsampler is removed; reference conditioning uses VAE encoding and reference latents following the official distilled Klein examples.

Qwen-Image 2.1 edits/references become Edit 2511 with the Lightning four-step adapter, shift 3.1, guidance normalization, guidance 1 and Euler/simple sampling. Text-to-image becomes Image 2512 at 50 steps and guidance 4. Both use the Qwen 2.5 VL encoder and Qwen Image VAE; image latents use the matching 16-channel contract.

## Quality risk and unverified behavior

These are different models, so prompt following, text rendering, identity, fine detail and editing fidelity can differ. Klein no longer expands prompts. Edit 2511 references are encoded at its native resolution rather than Qwen 2.1 resolution. `qwen_multi_h3_cloud` and `qwen_try_on_h3_cloud` now use separate reference inputs instead of contact sheets. The pinned `TextEncodeQwenImageEditPlus` contract takes at most three vision images, each resized independently to about 384 × 384 pixels, with separate reference latents at about 1024 × 1024. Extra references append as separate latents through `ReferenceLatent` on both positive and negative conditioning. They have no vision-encoder representation: person four/five in multi and garment three in try-on therefore still need identity/garment-fidelity review. Optional references preserve the original supplied order; no reference is dropped or put into a contact sheet. Klein already uses separate `ReferenceLatent` chains, so it needs no contact-sheet change. Image 2512 does not generate alpha, so the logo variant uses the existing BiRefNet cutout model; edges and internal cutouts need visual review.

Nothing is verified live: no paid generations, authenticated Cloud requests, Pod provisioning or model downloads were performed. Public file listings and offline core-node contracts do not prove runtime availability or output quality. Run time and memory estimates are estimates, not measurements.

Live-test priorities: `klein_character_swap_cloud`, `qwen_multi_h3_cloud` (image stage), `qwen_image_logo_cloud`.

## Public evidence

The unauthenticated listing checks, Hugging Face large-file hashes and pinned official workflow URLs are recorded in [public-evidence.json](public-evidence.json). Existing encoder, VAE and Edit 2511 entries already matched those hashes; only the Klein 4B and Image 2512 diffusion entries were added to `shared/modelFiles.js`.

Pinned reference contracts: [Qwen encoder](https://github.com/Comfy-Org/ComfyUI/blob/45bf90d1c91eecd782643346dcfb73cb0017667f/comfy_extras/nodes_qwen.py#L48-L97), [reference latent append](https://github.com/Comfy-Org/ComfyUI/blob/45bf90d1c91eecd782643346dcfb73cb0017667f/comfy_extras/nodes_edit_model.py#L8-L28). Public source GETs only. These contracts establish graph compatibility, not live quality.

Official contracts: [Klein guide](https://docs.comfy.org/tutorials/flux/flux-2-klein), [Comfy workflow templates](https://github.com/Comfy-Org/workflow_templates).

## Formats with Instant alternates

### Klein formats

`all-fine`, `animal`, `anime-me`, `brand-colors`, `brick-toy`, `cafe-60s`, `cartoon-me`, `character-scene`, `character-swap`, `coloring-page`, `drawing`, `game-style`, `glossy-vinyl`, `headshot`, `idol-stage`, `influencer-post`, `look-anime-cel`, `look-claymation`, `look-disposable`, `look-drone-top-down`, `look-film-70s`, `look-film-noir`, `look-fisheye-skate`, `look-golden-hour`, `look-ink-sketch`, `look-instant`, `look-low-poly`, `look-oil-painting`, `look-phone-flash`, `look-pixel-art`, `look-street-style`, `look-studio-fashion`, `look-tilt-shift`, `look-vaporwave`, `look-watercolor`, `loop-background`, `mascot`, `micro-beasts`, `moodboard`, `open-world`, `open-world-hero`, `pixel-game`, `plush-toy`, `portrait`, `profile-picture`, `renaissance`, `render-3d`, `restyle`, `sketch`, `skin-retouch`, `slide-visuals`, `sticker`, `storyboard`, `tiny-creature`, `wallpaper`.

### Qwen formats

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

## Red-team fixes

- Default routing: unset runs without a fitting ready Pod evaluate the Cloud alternate before target selection. Session and fitting ready Pods use original graphs/files. `comfyTarget` is unchanged; the variant catalog import and pre-target block are marked separately from provider/routing work.
- Output canvas: `qwen_multi_h3_cloud` now creates an empty 16-channel latent using the first reference's aspect at roughly one megapixel, rounded to 32 pixels as in the original. One or five square references produce the same 1024 × 1024 canvas. `qwen_try_on_h3_cloud`, the only other contact-sheet graph, already derived its canvas from the requested format aspect and retains that behavior. No alternate graph retains a contact sheet.
- Reference quality: separate images use all three available vision inputs, and additional ordered reference latents remain separate. The encoder limit and unverified extra-reference fidelity are documented above. Synthetic checks trace positive/negative reference order and canvas independence for every optional-reference subset.

## Validation

Rebased `instant-ports` onto `origin/main`; Git reported it already up to date at parent `7ee3b1c`. Implementation started from `f59bef0`.

Validation runs in a fresh isolated Windows scratch clone. No heavy checks run on the Mac. No paid runs, keys from the environment, authenticated provider requests or Pod changes.

Build and full verification results will be recorded after the Windows pass.
