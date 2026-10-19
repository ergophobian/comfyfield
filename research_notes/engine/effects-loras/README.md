# Effect LoRAs for the effect formats

Research date: 2026-10-19. Family: `effects-loras`. Scope: the video effects in `src/lib/formats/presetsx.js` (`vfx`, `action`, `hub`, `fresh`), the `effect()` list in `motion.js`, the video format in `fun.js` (`cloud-surfing`) and the 45 `effect-*` formats in `effects.js`.

Higgsfield's effects are trained effect LoRAs. Ours are prompts on `h3_i2v` (the paid MiniMax partner node) or `ltx_i2v` (LTX Video 2B). This note finds open effect LoRAs for MiniMax H3, LTX-2.5 and Wan 2.2 14B I2V on Hugging Face, keeps the ones whose card and samples hold up, and drafts one graph per base model that takes the LoRA as a parameter, so the Pod downloads whichever LoRA a run names.

Tags: **[Verified: source]** means I read it in a primary source today. **[Inference]** means my conclusion. No weights were downloaded, no API key was used and no graph was queued. I read safetensors headers with HTTP range requests and pulled a few sample clips from the LoRA cards to look at their frames.

## Summary

| Graph | Model | LoRAs (per run, one effect) | Base files on Comfy Cloud | Effect LoRA on Cloud | Node packs | GPU class | Download | Formats served |
|---|---|---|---|---|---|---|---|---|
| `wan22_lora_i2v` | Wan 2.2 14B I2V (fp8_scaled, two experts) + Lightning 4-step LoRA | `{{lora}}` on the high noise expert, `{{lora_low}}` on the low noise expert | yes (all 6) | **no**, so Pod only | none (core) | 24 GB | 38.03 GB base + 0.16 to 0.31 GB per effect | `building-explosion`, `car-explosion`, `set-on-fire`, `burning-figure`, `turn-to-sand`, `vanish`, `lightning-eyes`, `morph-skin`, `turn-to-metal`, `eyes-in` |
| `h3_lora_i2v` | MiniMax H3 FL2VA (pruned int8) | `{{lora}}` | yes (all 4) | **no**, so Pod only | none (core) | 32 GB | 42.48 GB base + 0.16 GB | `frozen-in-motion` |

- **LTX-2.5: no graph.** I found no LTX-2.5 image-to-video effect LoRA that meets the bar (section 4). The LTX effect formats keep a prompt-only graph.
- **Coverage:** 11 of about 150 effect formats get a LoRA. Every other effect keeps a prompt-only graph (section 5). [Verified: format files] The bar was quality, not count: each LoRA here has a card with a trigger, sample clips I looked at, ungated weights and a sha256 from the Hugging Face API.
- **Both graphs pass a static check** against ComfyUI at `45bf90d1` (0 problems), and a fill test with the app's own `fill` and `dropOptional` from `shared/mapping.js` (see `check.md`).
- **New files:** 21, all in `files.json` (5 Wan base files, 15 Wan effect LoRA files, 1 H3 effect LoRA). No new loader (`loaders.json` not needed) and no custom node pack (`packs.json` not needed).

## 1. The LoRAs and the format each one serves

Strength is per expert for Wan (high / low). Prompt change: add the trigger as its own sentence just before `{note}`, unless the row says otherwise.

| Format id (file) | Base | LoRA (repo) | Files (local name in `files.json`) | Strength | Trigger | Prompt change |
|---|---|---|---|---|---|---|
| `building-explosion` (presetsx `vfx`) | Wan 2.2 | Explosion Redmond (`artificialguybr/Explosion-Redmond-WAN2-I2V-14B`) | `wan22_i2v_explosion_redmond_high_noise` / `_low_noise` | 1.0 / 1.0 | `EXPLOSION` | add `EXPLOSION.` |
| `car-explosion` (presetsx `vfx`) | Wan 2.2 | same | same | 1.0 / 1.0 | `EXPLOSION` | add `EXPLOSION.` |
| `set-on-fire` (presetsx `vfx`) | Wan 2.2 | Spontaneous Combustion Redmond (`artificialguybr/Spontaneous-Combustion-Redmond-WAN2-I2V-14B`) | `wan22_i2v_spontaneous_combustion_redmond_high_noise` / `_low_noise` | 1.0 / 1.0 | `Spontaneous Combustion` | add `Spontaneous Combustion.` |
| `burning-figure` (presetsx `hub`) | Wan 2.2 | same | same | 1.0 / 1.0 | `Spontaneous Combustion` | add `Spontaneous Combustion.` |
| `turn-to-sand` (motion.js `effect`) | Wan 2.2 | Disintegration Redmond (`artificialguybr/Disintegration-Redmond-WAN2-I2V-14B`) | `wan22_i2v_disintegration_redmond_high_noise` / `_low_noise` | 1.0 / 1.0 | `Disintegration` | add `Disintegration.`; drop "golden" from "fine golden sand", because the LoRA keeps the subject's colors |
| `vanish` (presetsx `hub`) | Wan 2.2 | Disappearing Redmond (`artificialguybr/Disappearing-Redmond-WAN2-I2V-14B`) | `wan22_i2v_disappearing_redmond_high_noise` / `_low_noise` | 1.0 / 1.0 | `Disappearing` | add `Disappearing.` |
| `lightning-eyes` (presetsx `vfx`) | Wan 2.2 | Thunder Hero Redmond (`artificialguybr/ThunderHero-Redmond-WAN2-I2V-14B`) | `wan22_i2v_thunderhero_redmond_high_noise` / `_low_noise` | 1.0 / 1.0 | `Thunder Hero` | add `Thunder Hero.` |
| `morph-skin` (presetsx `vfx`) | Wan 2.2 | Skin Morph Redmond (`artificialguybr/SkinMorph-Redmond-WAN2-I2V-14B`) | `wan22_i2v_skinmorph_redmond_high_noise` / `_low_noise` | 1.0 / 1.0 | `Skin morph` | open with the card's form, `The subject morphs into a new person.`, keep the ripple sentence, end with `Skin morph.` |
| `turn-to-metal` (presetsx `vfx`) | Wan 2.2 | Metalcification Redmond (`artificialguybr/Metalcification-Redmond-WAN2-I2V-14B`) | `wan22_i2v_metalcification_redmond_high_noise` / `_low_noise` | 1.0 / 1.0 | `Metalcification` | add `Metalcification.` |
| `eyes-in` (motion.js `effect`) | Wan 2.2 | Pupil Transition (`p4ss3r2/wan22_Pupil_Transition_LoRa`), high noise only | `wan_22_high_noise_pupil_transition` | 1.0 / **0** (the low slot names the same file at 0, which ComfyUI skips) | `skyrimprey pupil transition` | start with `skyrimprey pupil transition,` and use the card's wording for the move: "The camera zooms in to complete a pupil transition, shifting the scene to a vast glowing galaxy of stars and color." |
| `frozen-in-motion` (presetsx `hub`) | MiniMax H3 | 360 Orbit (`pablodawson/MiniMax-H3-360-Orbit-LoRA`) | `minimax_h3_360_orbit_flf2v_lora_v1` | 1.0 | the card's whole instance prompt | replace the prompt with the card's prompt, word for word (section 3), and drop `{note}` and the `note` input; set duration 3 s; bind `image2` to the photo |

Card facts behind the table [Verified: each repo's README and the HF API, 2026-10-19]:

- **Redmond LoRAs** (artificialguybr, sponsored by reDMOND AI): trained with ai-toolkit (`ss_base_model_version: wan_2.2_14b` in the safetensors metadata), one file per expert, license CC0-1.0, not gated. Each card states its trigger. Six cards say "0.8-1.0 is a good starting point" for `strength_model`; the Explosion card gives no strength. Each card has 4 to 8 sample clips (664x1000 or about 1100x800, 81 frames, 16 fps) with the prompt used. I chose 1.0 for all, the top of the stated range. [Inference: drop to 0.8 if an effect overcooks next to the Lightning LoRA]
- **Metalcification** is the one card with a conflict: the repo name and every sample clip are image to video, but the card's `base_model` tag says `Wan2.2-T2V-A14B`. The keys and shapes cannot tell T2V from I2V (both experts are 5120 wide). I kept it because the samples show a real photo turning to gold metal. [Verified: sample frames; header] [Inference: it behaves as an I2V LoRA]
- **Pupil Transition**: trained only on the high noise expert with musubi-tuner (kohya `lora_unet_` keys, rank 32, `ss_discrete_flow_shift 5.0`), license Apache-2.0. The author says it "seems to well adapt to lightx2v accelerating lora", supports real and anime faces, and is "extremely suitable for first-last-frame". No strength given; I use 1.0. [Verified: card, header]
- **360 Orbit**: ai-toolkit `minimax_h3`, partition `fl2va_pruned` on the Comfy-Org int8 ConvRot repack (the same `minimax_h3_fl2va_pruned_int8_convrot.safetensors` ComfyField loads), rank 16, 3000 steps, 28 human Gaussian splat orbits, one caption for every clip. Recommended: same image as first and last frame, 768x768, 73 frames, 28 steps, no CFG, strength 1.0, audio off. Limits: "the domain is narrow" (human subjects, square, 73 frames) and "you may still get some subtle movements, blinks". License: MiniMax H3 Community License, so the H3 territory rules apply. 27,620 downloads, 515 likes. [Verified: card, HF API]

What I looked at: one sample clip per Wan LoRA and one orbit clip, six frames each. Explosion: a harbor house erupts in a fireball with debris. Disintegration: a bauble crumbles into red particles. Thunder Hero: eyes glow and arcs of lightning cross the face. Skin Morph: a man's skin ripples into scales and he becomes a woman in a new jacket. Disappearing: a girl dissolves into white smoke and the scene is empty. Spontaneous Combustion: a man's face and body become a figure of fire. Metalcification: a woman turns into polished gold. Pupil Transition: the camera pushes into one eye and the pupil opens onto a new scene. 360 Orbit: the camera circles a man who holds still and lands on the first frame. Each matches the format's prompt closely. [Verified: frames from the card samples] Quality at our 0.4 MP size and with the Lightning LoRA is not measured. [Inference]

## 2. Graph `wan22_lora_i2v.json` (Wan 2.2 14B image to video)

- **Template:** `video_wan2_2_14B_i2v` (Comfy-Org/workflow_templates, last change e7cd011d, 2026-09-28), subgraph "Image to Video (Wan2.2)", with its "Enable 4steps LoRA?" switch on. That switch is the template's fast path, so the graph uses its values: Lightning LoRA at 1.0 on each expert, 4 steps split at 2, CFG 1, `euler`, `simple`, ModelSamplingSD3 shift 5.0 on both experts, 16 fps. [Verified: template nodes 85, 86, 101 to 104, 116 to 131, 161 to 163]
- **Nodes:** LoadImage `{{image}}` → GetImageSize → two ComfyMathExpression (width, height) → WanImageToVideo; PrimitiveFloat `{{duration}}` → ComfyMathExpression (length); UNETLoader high and low (`wan2.2_i2v_{high,low}_noise_14B_fp8_scaled`); CLIPLoader `umt5_xxl_fp8_e4m3fn_scaled` (`wan`); VAELoader `wan_2.1_vae`; LoraLoaderModelOnly effect high (`{{lora}}`, `{{lora_strength}}`) and effect low (`{{lora_low}}`, `{{lora_low_strength}}`); LoraLoaderModelOnly Lightning high and low; ModelSamplingSD3 ×2; CLIPTextEncode `{{prompt}}` and the template's negative; KSamplerAdvanced high (add noise, `{{seed}}`, steps 0 to 2, leftover noise on) → KSamplerAdvanced low (no noise, steps 2 to 4); VAEDecode → CreateVideo 16 fps → SaveVideo (mp4, h264, the `ltx25_i2v.json` keys).
- **Placeholders:** `{{image}}`, `{{prompt}}`, `{{seed}}`, `{{duration}}`, `{{lora}}`, `{{lora_strength}}`, `{{lora_low}}`, `{{lora_low_strength}}`. No `{{width}}`, `{{height}}` or `{{frames}}`.
- **Two experts, two LoRA slots.** Wan 2.2 A14B samples with a high noise and a low noise model, and the Redmond LoRAs ship one file for each. A LoRA trained on one expert only (Pupil Transition) names the same file in both slots with `lora_low_strength: 0`: `LoraLoader.load_lora` returns the model untouched when the strength is 0, and the file is already on disk from the high slot, so the combo check passes. [Verified: `nodes.py` lines 740 to 742]
- **Deviations from the template:**
  - Size comes from the photo, not `{{width}}`/`{{height}}`: the photo's shape at about 399,360 pixels (832x480), in multiples of 16. The formats use `aspect: 'auto'`, which the runner turns into 1:1 for Comfy, and WanImageToVideo center-crops the start image to the canvas, so a fixed 1:1 canvas would crop every portrait. Examples: 1000x664 → 768x512, 1080x1920 → 480x848, square → 624x624 (template 640x640). [Verified: `runner.js` line 79, `nodes_wan.py` line 47] For 720p, change 399360 to 921600 and plan a 32 GB card. [Inference]
  - Length is `min(81, 4 * floor(duration * 4) + 1)` instead of the template's `floor(duration * 16 + 1)`: the same 81 frames at 5 s, but always 4n+1 for any duration, and never past the 81 frames Wan 2.2 is trained on. [Inference]
  - The effect LoRA sits before the Lightning LoRA on each expert. LoRA patches add up, so the order does not change the result. [Inference]
- **License:** Wan 2.2 and the Comfy-Org repack are Apache-2.0; the Redmond LoRAs are CC0-1.0; Pupil Transition is Apache-2.0. [Verified: HF API `cardData.license`]
- **Runtime:** the template note measures fp8 + 4-step LoRA at 640x640 on an RTX 4090D 24 GB: 83% VRAM, about 97 s first run and 71 s after. [Verified: template note "VRAM Usage"] Each expert is 14.29 GB and ComfyUI holds one at a time, so the 24 GB class fits. [Inference]

## 3. Graph `h3_lora_i2v.json` (MiniMax H3 FL2VA)

- **Base:** the shipped `public/workflows/h3_open_i2v.json`, which follows `video_minimax_h3_i2v`. Same files, sampler `res_multistep`, scheduler `simple`, `BasicGuider` (CFG-distilled, no negative), 24 fps, audio decoded. [Verified: shipped graph, template]
- **Nodes:** UNETLoader → LoraLoaderModelOnly `{{lora}}` / `{{lora_strength}}` → BasicScheduler and BasicGuider; CLIPLoader (`minimax`); two VAELoaders; LoadImage `{{image}}` → GetImageSize → two ComfyMathExpression → MiniMaxH3ImageToVideo `width`/`height`; optional LoadImage `{{image2}}` → `last_frame`; RandomNoise `{{seed}}`; SamplerCustomAdvanced; VAEDecode + VAEDecodeAudio → CreateVideo → SaveVideo.
- **Placeholders:** `{{image}}`, `{{image2}}` (optional), `{{prompt}}`, `{{seed}}`, `{{frames}}`, `{{lora}}`, `{{lora_strength}}`.
- **Optional end frame.** Node 20 carries `"_meta": { "optional": "image2" }` and feeds only `last_frame`, which is optional in `MiniMaxH3ImageToVideo`. With no `image2` the app drops it and the graph is plain first-frame image to video. The orbit LoRA needs the start photo as the end frame too, so `frozen-in-motion` binds `image2` to its photo. [Verified: `nodes_minimax_h3.py` lines 132 to 154; fill test in `check.md`]
- **Deviations:**
  - No turbo LoRA, 20 steps: the template's default ("Enable Lightning LoRA" off, 20 steps). The orbit LoRA was trained and shown without turbo at 28 steps. I kept the template's 20 for cost. [Verified: template widgets; card] [Inference: 20 is enough; use 28 to match the card exactly. The 8-step turbo path of `h3_open_i2v` is untested with this LoRA]
  - Size comes from the photo: H3's 768 px short edge, 1344 px long edge cap, multiples of 32 (square → 768x768, the orbit's training size; 1000x664 → 1152x768). The first frame is stretched to the canvas, so a 1:1 canvas would squash a portrait. [Verified: Comfy docs "768px short edge, capped at 768x1344"; node comment "plain stretch to canvas"]
  - Audio stays on, as in `h3_open_i2v`; the orbit card generated with audio off. [Inference: harmless; a frozen moment gets ambient sound]
- **Prompt for `frozen-in-motion`, word for word from the card:** "One frozen instant. Only the camera moves. In a continuous 360 orbit. Preserve every person and object in exactly the same world position, orientation, shape and pose throughout the shot. Airborne objects remain suspended at the captured height and angle: no wobbling, shaking, spinning, drifting, falling or continued action. Keep faces, hands, clothing, liquids and the background motionless while retaining their natural appearance. Camera parallax is the only source of apparent movement. No cuts, zoom, morphing or added objects." [Verified: card "Use this prompt verbatim"]
- **Frames:** `{{frames}}` is duration × 24 + 1, so 3 s gives 73, the orbit's training length and already on H3's 17k+5 grid. [Verified: `align_frame_count` in `nodes_minimax_h3.py`]

## 4. Why no LTX-2.5 graph, and what else I rejected

LTX-2.5 [Verified: HF API, `author=Lightricks&search=LTX-2.5` and `base_model:adapter:Lightricks/LTX-2.5`, 37 adapters]:

- The official Lightricks LoRAs are gated "auto" and are tools, not effects: IC-LoRAs that need a control video (Water-Simulation, Day-To-Night, Clean-Plate and others), Cinemagraph, Slow-Motion-Control.
- Community: `AInVFX/ainvfx-fluid` is an IC-LoRA that turns painted color blobs in a control video into smoke or fire, a VFX tool, not a photo effect. `WepeNerd/LTX-Ripple` carries a first-frame edit through an existing video (video to video). `DigitalByte/LTX-2.5-Exploded-View-XPLDV` is a product exploded-view diagram (0 downloads, no format). The rest are styles, characters or speed LoRAs.
- The squish, inflate, cakeify, crush and atomic explosion LoRAs that Comfy Cloud lists (`ltx2-*`) and the LTX-2.3 LoRAs are for LTX-2 19B and LTX-2.3, not LTX-2.5. [Verified: Cloud `loras` listing] Whether LTX-2.3 LoRAs load on LTX-2.5 is untested. [Inference]

Rejected on the other two bases:

| Candidate | Would serve | Why not |
|---|---|---|
| Remade-AI effect LoRAs (Fire, Explode, Electrify, Tsunami, Super-Saiyan, matrix-shot, kissing, Boxing, 360-Orbit and 60 more) | `set-on-fire`, `building-explosion`, `lightning-eyes`, `kiss`, `boxing` | All are Wan 2.1 (T2V 14B or I2V 14B 480P), single file, from 2025-03 to 2025-05. On Wan 2.2's two experts they are untested. [Verified: HF API `base_model`] |
| `ThirdTimesTheCiarc/dissolve-to-petals` (Wan 2.2 I2V) | `burst-into-petals` | A repost of a ModelScope LoRA: no trigger, no settings, one GIF, 17 downloads. |
| `LeechTM/SMACK` (H3) | `stage-punch`, `boxing` | Ref2VA checkpoint only, not FL2VA; merges a blood-effects LoRA. |
| `JOKER141` combat, gun-fu and fight-flow LoRAs (H3) | `boxing`, `high-kick` | Two-person fight interaction, and the author calls Fight Flow experimental. Our moves are one person. |
| `Jojocodex/wushu-action-v7` (H3) | `high-kick` | Trained on the unpruned 34 GB FL2VA with AdaLN layers, not our pruned base; the author writes (in Chinese) that it still falls short of his expectations, and that it blurs at low step counts. |
| `starsfriday/Wan2.2-I2V-KungFu`, `-Fly` | `high-kick`, `levitation` | A whole kung fu routine, not one kick; Fly ships the high noise file only, with three samples. |
| `Alex995647/loras-minimax-h3` and `loras-wan-2.2` (mirrors of Civitai) | `street-giant` (Height Growth), `invisible` (Living Clothes), `powder-burst` (Holi), `time-lapse`, `pressed-to-glass` | Third-party archives. The archive's own notes say the authors gave no settings and that Civitai flags these as NSFW; Height Growth is giantess content. |
| `siraxe/Venom_transformation_H3` | none | A Marvel character, test-quality card. |
| `systms/SYSTMS-INFL8-LoRA-Wan22`, `Ashmotv/exploded_effect_wan`, `artificialguybr/Atomic-Explosion-...` | none | No matching format (inflate, exploded view, nuclear blast); Atomic Explosion's file name also has a space. |

Out of scope but ready for camera formats: the same 360 Orbit LoRA fits `cam-orbit-360` and `cam-lazy-susan`, and the `h3_bullet_time` family (`bullet-time-scene`, `packshot`) could run it through `h3_lora_i2v`. On Wan, `ostris/wan22_i2v_14b_orbit_shot_lora` (trigger `orbit 360`, 76 likes) is the matching orbit. [Verified: HF API] [Inference: untested here]

## 5. Effects that keep a prompt-only graph

No open LoRA met the bar for these. They stay prompt-only.

- **presetsx `vfx` singles:** `agent-reveal`, `angel-wings`, `black-tears`, `bloom-mouth`, `clone-burst`, `turn-to-diamond`, `duplicate`, `fire-breath`, `floating-fish`, `flood`, `floral-eyes`, `glowing-fish`, `glowshift`, `confetti-head`, `floating-head`, `inner-light`, `invisible`, `jelly-drift`, `stone-skin`, `melting`, `paparazzi`, `sandstorm`, `skin-surge`, `spirit-leap`, `tentacle-eyes`, `wind-blast`, `garden-bloom`, `levitation`, `powder-burst`, `datamosh`.
- **presetsx `vfx` mixes:** `blast-to-dust`, `invisible-float`, `storm-rise`, `storm-metal`, `storm-wind`, `molten-metal`. Each mixes two effects; the graph takes one LoRA, and Explosion + Disintegration (or Thunder Hero + Metalcification) stacked would need a second slot pair. [Inference: possible later]
- **presetsx `action` (H3):** all 17 (`action-run`, `high-kick`, `slam-dunk`, `boxing`, `catwalk`, `stage-punch`, `kiss`, `moonwalk-left`, `moonwalk-right`, `pressed-to-glass`, `skate-cruise`, `skate-glide`, `skate-ollie`, `ski-carve`, `ski-powder`, `snowboard-carve`, `snowboard-powder`).
- **presetsx `hub` and `fresh`:** `scrapbook`, `pigeon-street`, `pearl-portrait`, `act-natural`, `monster-dab`, `clones`, `cutout`, `mighty-fighter`, `moonwalk`, `architecture-wave`, `out-of-the-screen`, `one-eyed-giant`, `blue-depth`, `wild-ride`, `infinite-clones`, `superstar`, `skate-dog`, `smash-and-grab`, `lacewalker`, `boarding-pass`, `lidar-scan`, `fallen-angel`, `fairytale-castle`, `stop-world`.
- **motion.js `effect()`:** `origami-fold`, `snow-globe`, `time-lapse`, `burst-into-petals`, `paint-splash`, `floating-fall`, `high-flip`, `studio-slide`, `street-giant`, `world-morph`, `selfception`, `roller-coaster`, `glitch-out`, `turn-to-hologram`, `turn-to-ice`, `shatter`, `portal`, `pixel-dissolve`, `balloon-lift`.
- **fun.js:** `cloud-surfing`.
- **effects.js:** all 45 `effect-*` formats. They are writer-driven, 4 to 15 s, 9:16, with up to three reference images and several timed beats for a Seedance-class model. A one-effect LoRA does not fit them. The closest is `effect-dive-into-the-eye` with the Pupil Transition LoRA, but that format wants a 7 s clip built from a face and a location. [Verified: `research_notes/effect-specs.json`]

The prompt-only graphs themselves need a fix. The `ltx` helper in presetsx and `effect()` in motion.js say `runsOn: 'LTX-2.5'` but point at `ltx_i2v`, which is LTX Video 2B. The `h3` helper points at `h3_i2v`, a paid partner node that cannot run on a Pod. For open weights on the Pod they should move to `ltx25_i2v` and `h3_open_i2v`. [Verified: format files, `public/workflows/ltx_i2v.json`, `h3_i2v.json`]

## 6. Format and engine changes needed

1. **Workflow and params per LoRA format.** Point the 11 formats at the new graph and give them `params`, which `defineFormat` already passes to the step and `comfyVars` spreads into the graph. A presetsx sketch:

   ```js
   const wanLora = (name, strength = 1, low = name.replace('_high_noise', '_low_noise'), lowStrength = strength) => ({
     runsOn: 'Wan 2.2 with an effect LoRA', workflow: 'wan22_lora_i2v',
     params: { lora: `${name}.safetensors`, lora_strength: strength, lora_low: `${low}.safetensors`, lora_low_strength: lowStrength },
   })
   // vfx('building-explosion', ...) gets ...wanLora('wan22_i2v_explosion_redmond_high_noise')
   // eyes-in gets ...wanLora('wan_22_high_noise_pupil_transition', 1, 'wan_22_high_noise_pupil_transition', 0)
   ```

   `frozen-in-motion` gets `runsOn: 'MiniMax H3 with the 360 orbit LoRA'`, `workflow: 'h3_lora_i2v'`, `params: { lora: 'minimax_h3_360_orbit_flf2v_lora_v1.safetensors', lora_strength: 1 }`, `settings: { aspect: 'auto', duration: 3 }`, the card prompt, and no `note` input. [Verified: `spec.js`, `recipes.js` `recipeOptions`, `mapping.js` `comfyVars`]
2. **Prompts:** as in the table in section 1.
3. **A binding for `frozen-in-motion`:** `bindings: { image2: 'image' }`, so the start photo is also the end frame. `defineFormat` does not copy `bindings` into the step it builds, so either give the format an explicit `steps` entry, or add `...(format.bindings && { bindings: format.bindings })` to the default step in `spec.js`. The validator already counts step bindings as supplied. [Verified: `spec.js`, `options.js` `stepOptions`, `validate.js` line 149]
4. **Validator, later:** `scripts/format-schemas.mjs` lists every placeholder, including `{{image2}}` on the optional loader. A future H3 LoRA format without the binding would fail "Unmapped workflow placeholder image2". Placeholders that only appear on `_meta.optional` nodes should count as optional. [Verified: `format-schemas.mjs` line 14, `validate.js` line 150]
5. **Model list:** add the 21 entries of `files.json` to `MODEL_FILES`. No `LOADERS` change. Local names follow the Pod's `[\w.+-]+` rule; 15 Hugging Face paths contain `[` and `]` (for example `[WAN2.2]ThunderHero_Redmond_high_noise.safetensors`). The Pod fetches `path` without encoding it. A Python `urllib` HEAD on both the raw and the percent-encoded path returned 200, and the redirect's `X-Linked-ETag` equals the API sha256. So no Pod change is needed. [Verified: `pod-statusd.py` `fetch`, local test with Python 3.9] [Inference: Python 3.12 on the Pod behaves the same]
6. **Sizes:** both graphs ignore `{{width}}`/`{{height}}`, so the runner's `auto` → `1:1` has no effect on them. No `sizes` entry is needed for these graphs.
7. **Cloud:** every effect LoRA is missing from Comfy Cloud, so these 11 formats run only on a Pod (or on Cloud after a model import). [Verified: Cloud `loras` listing, 652 files]

## Sources

- Hugging Face API (`/api/models/<repo>`, `/tree/main?recursive=true`), model cards and sample clips: `artificialguybr/{Explosion,Spontaneous-Combustion,Disintegration,Metalcification,ThunderHero,SkinMorph,Disappearing,Atomic-Explosion,360Rotation}-Redmond-WAN2-I2V-14B`, `p4ss3r2/wan22_Pupil_Transition_LoRa`, `pablodawson/MiniMax-H3-360-Orbit-LoRA`, `Comfy-Org/Wan_2.2_ComfyUI_Repackaged`, `Comfy-Org/MiniMax-H3`, the Lightricks LTX-2.5 list, `AInVFX/ainvfx-fluid`, `WepeNerd/LTX-Ripple`, `DigitalByte/LTX-2.5-Exploded-View-XPLDV`, the Remade-AI list, `LeechTM/SMACK`, `JOKER141/*`, `Jojocodex/wushu-action-v7-minimax-h3-fl2va-ref2va-lora`, `starsfriday/Wan2.2-I2V-{KungFu,Fly}`, `ThirdTimesTheCiarc/dissolve-to-petals`, `systms/*`, `Ashmotv/exploded_effect_wan`, `ostris/wan22_i2v_14b_orbit_shot_lora`, `siraxe/Venom_transformation_H3`, `Alex995647/loras-minimax-h3` and `loras-wan-2.2` (`CATALOG.md`, `info.txt`). Searches: `base_model:adapter:` for `MiniMaxAI/MiniMax-H3`, `Comfy-Org/MiniMax-H3`, `Lightricks/LTX-2.5`, `Wan-AI/Wan2.2-I2V-A14B`, `Wan-AI/Wan2.2-T2V-A14B`, plus 57 effect keywords.
- Comfy-Org/workflow_templates: `templates/video_wan2_2_14B_i2v.json`, `templates/video_minimax_h3_i2v.json` (both last changed in e7cd011d, 2026-09-28), `templates/index.json`.
- ComfyUI at `45bf90d1c91eecd782643346dcfb73cb0017667f`: `nodes.py`, `comfy/lora.py`, `comfy/samplers.py`, `folder_paths.py`, `comfy_extras/nodes_wan.py`, `nodes_minimax_h3.py`, `nodes_model_advanced.py`, `nodes_video.py`, `nodes_custom_sampler.py`, `nodes_math.py`, `nodes_primitive.py`, `nodes_images.py`, `nodes_audio.py`.
- Comfy Cloud: `/api/system_stats` (v0.41.1), `/api/experiment/models/{loras,diffusion_models,vae,text_encoders}`.
- Comfy docs: `tutorials/video/ltx/ltx-2-5.md`.
- Repo: `shared/modelFiles.js`, `shared/mapping.js`, `server/core.js`, `server/pod-statusd.py`, `src/lib/formats/{spec,parts,options,runner,validate,presetsx,motion,fun,effects}.js`, `scripts/format-schemas.mjs`, `scripts/pod-checks.mjs`, `research_notes/effect-specs.json`, `research_notes/engine/newest-video-models.md`, `research_notes/engine/genjutsu.md`.
