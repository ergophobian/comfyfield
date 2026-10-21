# Novel and unusual LoRAs for ComfyField services (released or updated 2025-10 to 2026-10)

Scope: capability scouting across all open models, not the standard style LoRAs per model. Every LoRA below had its model page opened (Hugging Face card or Civitai model page through the Civitai API) on 2026-10-19.

Conventions used in these notes:

- "dl30" is the Hugging Face download count for the last 30 days, as reported by `https://huggingface.co/api/models/<id>` on 2026-10-19. Some repos report 0 even when they clearly have users; treat 0 as "not counted", not "unused".
- Civitai "dl" is the all-time download count and "thumbs" is the thumbs-up count, from `https://civitai.com/api/v1/models/<id>` on 2026-10-19.
- "We run" means the base model is in the ComfyField open-model list or used by a format in [00 service inventory.md](00%20service%20inventory.md). ComfyField runs Qwen-Image 2.1, Qwen-Image-Edit 2511, FLUX 3 Image Klein, Z-Image Turbo, HiDream-O1, MiniMax H3, LTX-2.5, Wan 2.2, Wan Animate 2, and uses Krea 2 Raw in the "AI human" format.
- Higgsfield facts come from [Higgsfield feature audit/README.md](../Higgsfield%20feature%20audit/README.md) (keyword search of the 390 KB audit).
- Lines marked "(inference)" are my proposals, not source facts.

## Which LoRAs in these areas are genuinely good?

### Takeaway

The genuinely new capabilities of the past year are concentrated on Hugging Face, in three families: Lightricks' official LTX-2.5 IC-LoRAs (transparent video, layout-to-render, cinemagraph, day-to-night, restore, HDR), community MiniMax H3 LoRAs that repurpose the video model for new outputs (frozen 360 orbits that loop, five-view turnarounds, VR180 stereo video, character swap), and Qwen-Image-Edit 2511 / Qwen-Image 2.1 edit LoRAs (pose copy, expression slider, sprite sheets, character sheets, next scene). Civitai's yearly top lists are almost all style, character and slider LoRAs for anime bases, so capability LoRAs there are found by search, not by ranking.

### Cited Findings

#### Where the capability LoRAs are

- Of Civitai's 500 highest-rated LoRAs for the past year, 191 are on Anima, 101 on Illustrious, 93 on Krea 2, 58 on Z-Image Turbo, 9 on MiniMax H3, 3 on Qwen 2.1 and 1 each on Flux.3 and Flux.3 Klein; the most-downloaded 500 are similar (Anima 152, Krea 2 116, Z-Image Turbo 68, Illustrious 63, MiniMax H3 13) — [Civitai API, highest rated](https://civitai.com/api/v1/models?types=LORA&sort=Highest%20Rated&period=Year&nsfw=false&limit=100); [Civitai API, most downloaded](https://civitai.com/api/v1/models?types=LORA&sort=Most%20Downloaded&period=Year&nsfw=false&limit=100)
- Lightricks published 15 LTX-2.5 22B LoRA repos between 2026-08-11 and 2026-09-28 (Alpha-Gen, Layout-To-Render, Ingredients, Clean-Plate, Refine-Details, Restore, SDR-To-HDR, Deblur, Decompression, Colorization, Day-To-Night, Water-Simulation, Cinemagraph, Slow-Motion-Control and Pixel-Spatial-Upscaler) — [Hugging Face, Lightricks models](https://huggingface.co/Lightricks)
- FLUX 3 Image Klein was published 2026-10-13 (base) and 2026-10-14 (Comfy repack); on 2026-10-19 its adapter trees list only 9 (distilled) and 16 (base) adapters, so almost no FLUX 3 Klein LoRAs exist yet — [HF API, flux-3-image-klein adapters](https://huggingface.co/api/models?filter=base_model:adapter:black-forest-labs/flux-3-image-klein); [HF API, flux-3-image-klein-base adapters](https://huggingface.co/api/models?filter=base_model:adapter:black-forest-labs/flux-3-image-klein-base)
- The `wildminder/awesome-ltx2` list (601 GitHub stars, updated 2026-10-18) catalogues LTX-2 models, LoRAs and workflows for ComfyUI — [GitHub search](https://api.github.com/search/repositories?q=lora+comfyui+workflow+pushed:%3E2026-06-01+stars:%3E200&sort=stars)

#### Ranked records (rank = how much it would impress a user next to Higgsfield; see the third question for the ranking table)

##### 1. LTX-2.5 IC-LoRA Alpha-Gen: transparent video from any clip

- Link: [Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen)
- Base: LTX-2.5 22B; inference on the distilled checkpoint — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen)
- Does: takes an ordinary RGB video and generates a matching grayscale alpha matte, with no green screen, masks or prompt; handles hair, fur, smoke, fire, sheer fabric, glass and water; matte is frame-aligned with the input — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen)
- Limits: up to 145 frames and 1920×1088; no control over which object is matted; pad (do not stretch) to sizes divisible by 32 and 8n+1 frames — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen)
- Prompt: always empty; the RGB clip is the only guide — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen)
- Popularity 2026-10-19: 196 likes, 12,705 dl30; created 2026-09-28 — [HF API](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen)
- License: LTX-2.x community license; gated with automatic approval — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen)
- ComfyUI: copy `ltx-2.5-22b-ic-lora-alpha-gen-0.9.safetensors` to `models/loras`, load the LTX-2.5 22B distilled base, use the IC-LoRA video-to-video workflow; stage-1-only inference at native resolution; composite with `out = rgb * alpha + background * (1 - alpha)` — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen)
- Proposed service (inference): upgrade "Video background remove" (now SAM 3.1 and BiRefNet); add a "Transparent clip" Library type and a Flows node "Pull alpha"; feeds "Sticker pop cuts" and "Video background changer".
- Higgsfield: a Video Background Remover app ("Removes the background from every frame", MP4 or MOV, 1 credit) and its editor plugins list "Remove background, with an alpha channel"; neither claims soft or semi-transparent edges — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high (official release, strong uptake).

##### 2. LTX-2.5 IC-LoRA Layout-To-Render: grey 3D blocking in, finished shot out

- Link: [Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render)
- Base: LTX-2.5 22B (distilled, two-stage workflow shipped as `LTX-2.5_ICLoRA_Layout_To_Render_Two_Stage_Distilled.json`) — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render)
- Does: turns a 3D viewport animation (grey clay viewport or blocky playblast from Blender, Unreal or similar) plus a first frame that sets the art direction into a video that moves like the layout and looks like the first frame; keeps the camera path and object placement — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render)
- Prompt: a scene description plus continuity lines, for example "Match the first frame: ... Keep the same well, bucket, posts, and camera as the driver. Photoreal" — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render)
- Popularity 2026-10-19: 97 likes, 9,406 dl30; created 2026-09-22 — [HF API](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render)
- License: LTX-2.x community license — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render)
- Proposed service (inference): the render engine for the "3D studio (/3d)" tool and the "3D scene" format (Qwen3.8 and Blender); a Flows node "Render layout".
- Higgsfield: 3D Jutsu, "An agent builds an editable 3D blocking scene, then it renders to video", runs on an agent LLM and Seedance 2.5 — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high.

##### 3. LTX-2.5 LoRA Cinemagraph: a still that moves in one place and loops

- Links: [Lightricks/LTX-2.5-22b-LoRA-Cinemagraph](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph); earlier [LTX-2.3 version](https://huggingface.co/Lightricks/LTX-2.3-22b-LoRA-Cinemagraph)
- Base: LTX-2.5 22B, image-to-video, standard LoRA (not IC) — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph)
- Does: transforms still images into smooth, looping cinemagraphs with selective motion while the rest of the scene stays frozen — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph)
- Prompt: "CINEMAGRAPH_MOTION, tripod locked-off static camera, zero camera movement, [everything that stays frozen] remain completely frozen, only [element] moves ..., seamless natural loop" — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph)
- Popularity 2026-10-19: 25 likes, 2,254 dl30 (LTX-2.5); 54 likes, 468 dl30 (LTX-2.3) — [HF API 2.5](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph); [HF API 2.3](https://huggingface.co/api/models/Lightricks/LTX-2.3-22b-LoRA-Cinemagraph)
- License: LTX-2.x community license — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph)
- ComfyUI: `ltx-2.5-22b-lora-cinemagraph-0.9.safetensors` on the distilled LTX-2.5 text/image-to-video pipeline — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph)
- Proposed service (inference): new Cinema format "Cinemagraph"; upgrade "Looping background" (FLUX 3 Klein and MiniMax H3) and the "Living portrait" effect.
- Higgsfield: no cinemagraph feature (0 hits); its "AI background video generator" makes loops by giving Seedance 2.0 the same start and end frame — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high.

##### 4. MiniMax-H3 360° Orbit LoRA: frozen-time orbit that lands back on frame one

- Links: [pablodawson/MiniMax-H3-360-Orbit-LoRA](https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA); also [MATLOWAI/MiniMax-H3-ORB360-CardSpin](https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin)
- Base: MiniMax H3, FL2VA (first-last frame) variant; CardSpin is for H3 Ref2VA — [card](https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA); [CardSpin card](https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin)
- Does: give the same photo as first and last keyframe; the camera orbits all the way around the frozen subject and the clip closes on its own first frame, so orbits chain or stitch without a seam; the base model alone "barely moves" in this setup — [card](https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA)
- Also: CardSpin gives a clockwise 360 orbit (`ORB360_CW`) or turns the photo in space like a thin physical card (`ORB360_CARDSPIN`); rank 32, trained on Blender orbits — [CardSpin card](https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin)
- Popularity 2026-10-19: 515 likes, 27,620 dl30 (Orbit); 47 likes, 4,765 dl30 (CardSpin) — [HF API Orbit](https://huggingface.co/api/models/pablodawson/MiniMax-H3-360-Orbit-LoRA); [HF API CardSpin](https://huggingface.co/api/models/MATLOWAI/MiniMax-H3-ORB360-CardSpin)
- License: "other" (MiniMax H3 derivative) — [HF API](https://huggingface.co/api/models/pablodawson/MiniMax-H3-360-Orbit-LoRA)
- Proposed service (inference): upgrade the MiniMax H3 camera-move formats "360 orbit", "Orbit", "Bullet time", "Lazy susan", and the Ads formats "Product spin", "Bullet time packshot" and "Frozen product scene"; new fun format "Photo card spin".
- Higgsfield: "360 Orbit" camera preset and a "3D Rotation" app that "Spins the photo as a 3D object through 360 degrees" (15 credits) — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high.

##### 5. H3 Turnaround LoRA: five consistent views from one image in one pass

- Link: [matlod/minimax-h3-turnaround](https://huggingface.co/matlod/minimax-h3-turnaround)
- Base: MiniMax H3, `ref2va_pruned` partition — [card](https://huggingface.co/matlod/minimax-h3-turnaround)
- Does: one reference image plus one instruction gives five coherent, progressively rotated views of the same subject, jointly denoised as if they were video frames ("Contact-Sheet diffusion"); about 10 s at 512² and 57 s at 1024² on one RTX PRO 6000; trained only on H3-generated subjects but works on real photos — [card](https://huggingface.co/matlod/minimax-h3-turnaround)
- Prompt and settings: strength 1.0 for rotation; around 0.7 trades rotation for fidelity — [card](https://huggingface.co/matlod/minimax-h3-turnaround)
- Popularity 2026-10-19: 41 likes, dl30 reported as 0; created 2026-08-08 — [HF API](https://huggingface.co/api/models/matlod/minimax-h3-turnaround)
- License: "other" — [HF API](https://huggingface.co/api/models/matlod/minimax-h3-turnaround)
- ComfyUI: a dedicated node, ComfyUI-H3-ContactSheet (matlowai) — [card](https://huggingface.co/matlod/minimax-h3-turnaround)
- Also: an H3 character-sheet workflow, [PoopMan333/H3_Character_Sheet_Generator](https://huggingface.co/PoopMan333/H3_Character_Sheet_Generator) (211 likes), adds a facial-expression sheet maker (2026-09-22) — [card](https://huggingface.co/PoopMan333/H3_Character_Sheet_Generator)
- Proposed service (inference): upgrade the "Character sheet" format and the "Character" tool; give "Character figure" (TRELLIS.2) multi-view input.
- Higgsfield: no turnaround or sprite feature (0 hits for "turnaround", "sprite"); "character sheet" appears only as an AI Influencer price line — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium (clever, few public numbers).

##### 6. Character Sheet Edit LoRA for Qwen-Image 2.1: one photo to a 3×2 sheet

- Links: [Civitai 2995608](https://civitai.com/models/2995608); also [Alissonerdx/CharacterSheet](https://huggingface.co/Alissonerdx/CharacterSheet) and [Character Design Sheet HELPER, Civitai 100435](https://civitai.com/models/100435)
- Base: Qwen-Image 2.1 (base only; "Turbo wrecks the grid") — [Civitai API](https://civitai.com/api/v1/models/2995608)
- Does: one photo in, a 3×2 sheet on grey out: a face close-up plus five body shots, same person and outfit; two modes, angles (front, back, side, two three-quarter turns) or poses — [Civitai API](https://civitai.com/api/v1/models/2995608)
- Settings: LoRA 1.0, 25 steps, CFG 1; standing photo from head to at least mid-thigh; workflow zip needs KJNodes — [Civitai API](https://civitai.com/api/v1/models/2995608)
- Popularity 2026-10-19: 1,119 dl, 58 thumbs; published 2026-10-10 — [Civitai API](https://civitai.com/api/v1/models/2995608)
- License: Civitai commercial use "None" — [Civitai API](https://civitai.com/api/v1/models/2995608)
- Also: Alissonerdx/CharacterSheet (332 likes) has TripleView and QuadView for FLUX.2 Klein 9B, and QuadView plus an experimental DynamicCharacterSheet (hero pose, turnaround, action poses, silhouette, expressions, detail crops) for Krea 2, trained on about 300 sheets, with a Qwen3-VL prompt node — [card](https://huggingface.co/Alissonerdx/CharacterSheet)
- Also: Character Design Sheet HELPER for Z-Image Turbo (text-to-image design sheet with three perspectives and a color-palette swatch; trigger `CharacterDesignIZT`) has 102,053 dl and 11,495 thumbs, and allows selling images — [Civitai API](https://civitai.com/api/v1/models/100435)
- Proposed service (inference): upgrade "Character sheet" (now Qwen-Image Edit 2511); add "Character design sheet" (text to sheet) on Z-Image Turbo.
- Higgsfield: none (see rank 5).
- Confidence: high (several independent LoRAs, one very popular).

##### 7. VR180 stereo video for MiniMax H3

- Links: [rehan-fal/minimax-h3-vr180-sbs-lora](https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora); also [Real Stereo Depth Video - H3, Civitai 2969930](https://civitai.com/models/2969930) and [Stereoscopic-SBS-3D-Image, Civitai 2720663](https://civitai.com/models/2720663)
- Base: MiniMax H3, text-to-video — [card](https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora)
- Does: makes H3 shoot VR180 stereo video: left-eye view on the left, right-eye view on the right, each a 180°×180° half-equirectangular hemisphere, 24 fps, with H3's native audio; un-squeeze 21:9 to 2:1, add spherical metadata, and it plays in a Quest, DeoVR or Skybox — [card](https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora)
- Prompt: trigger `vr180sbs` plus the layout sentence ("Stereoscopic VR180 video shown side by side: the left half is the left-eye view ...") then the scene; 21:9, 768P, scale 1.0 — [card](https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora)
- Cost note: trained on fal's hosted H3 trainer, 2,500 steps, about 3.9 h on one H200, US$12.50 — [card](https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora)
- Popularity 2026-10-19: 41 likes, dl30 reported as 0; created 2026-09-03 — [HF API](https://huggingface.co/api/models/rehan-fal/minimax-h3-vr180-sbs-lora)
- License: MiniMax Community License (attribution) — [card](https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora)
- Also: Real Stereo Depth Video (H3) makes stereo 3D video from a single image, with the ComfyUI-StereoPack nodes, strength 1.5, trigger sentence starting "st3r30 footage"; 490 dl, 57 thumbs — [Civitai API](https://civitai.com/api/v1/models/2969930)
- Also: Stereoscopic-SBS-3D-Image (FLUX.2 Klein 9B and Krea 2) makes side-by-side stereo stills from a prompt or a reference; 508 dl, 44 thumbs — [Civitai API](https://civitai.com/api/v1/models/2720663)
- Proposed service (inference): new tool page "VR and 3D" (or a Cinema format "VR180 clip") plus "3D photo" from a still.
- Higgsfield: no VR or stereo video; "stereo" appears only for audio — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 8. 360 Degree LoRA for FLUX 3 Image Klein: equirectangular panoramas

- Links: [Civitai 682349](https://civitai.com/models/682349); also [nomadoor/flux-2-klein-9B-360-erp-outpaint-lora](https://huggingface.co/nomadoor/flux-2-klein-9B-360-erp-outpaint-lora) and [ProGamerGov/qwen-360-diffusion](https://huggingface.co/ProGamerGov/qwen-360-diffusion)
- Base: Flux.3 Klein version (trained on FLUX 3 Image Klein base), published 2026-10-16 — [Civitai API](https://civitai.com/api/v1/models/682349)
- Does: 2:1 equirectangular 360 images (2048×1024, or 4096×2048 with enough VRAM); the wrap is close but leaves a visible seam, fixed by a separate Seamfix LoRA and a ComfyUI 360 workflow — [Civitai API](https://civitai.com/api/v1/models/682349)
- Prompt: trigger "create a 360 hdr" — [Civitai API](https://civitai.com/api/v1/models/682349)
- Popularity 2026-10-19: 14,492 dl, 1,277 thumbs, 49 comments (all versions) — [Civitai API](https://civitai.com/api/v1/models/682349)
- License: Civitai commercial use for images and rental; no derivatives — [Civitai API](https://civitai.com/api/v1/models/682349)
- Also: the FLUX.2 Klein 9B ERP outpaint LoRA places your reference photos on an empty equirectangular canvas and outpaints the rest (56 likes, 1,168 dl30), with the ComfyUI-Panorama-Stickers node (176 GitHub stars) — [card](https://huggingface.co/nomadoor/flux-2-klein-9B-360-erp-outpaint-lora); [GitHub API](https://api.github.com/repos/nomadoor/ComfyUI-Panorama-Stickers)
- Also: Qwen 360 Diffusion, rank 128 on Qwen-Image, trained on tens of thousands of equirectangular images (59 likes, 7,294 dl30, MIT) — [card](https://huggingface.co/ProGamerGov/qwen-360-diffusion)
- Proposed service (inference): new format "360 panorama" (Create image and Looks); feed "Explorable world" (HY-World 2.0) and the VR page; "Put my photo in a 360 world" via ERP outpaint.
- Higgsfield: only "make panoramas" as a use case of its AI image extender (Nano Banana Pro plus Expand) — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high (on a base we run, popular).

##### 9. 360 video: equirectangular LoRAs for MiniMax H3 and LTX-2.3

- Links: [shamanic/minimax-h3-equi360-lora](https://huggingface.co/shamanic/minimax-h3-equi360-lora); [TheBurgstall/Seamless-Equirectangular-LTX2.3-LoRA](https://huggingface.co/TheBurgstall/Seamless-Equirectangular-LTX2.3-LoRA)
- Base: MiniMax H3 (equi360); LTX-2.3 (Seamless-Equirectangular) — [H3 card](https://huggingface.co/shamanic/minimax-h3-equi360-lora); [LTX card](https://huggingface.co/TheBurgstall/Seamless-Equirectangular-LTX2.3-LoRA)
- Does: full-sphere monoscopic equirectangular video with native audio (H3; v2 trained on a reviewed 57-clip set from 36 sources); the LTX LoRA plus the ComfyUI-Seamless-Equirectangular node pack fixes seams and poles, and also drives flat-video to 360 outpainting — [H3 card](https://huggingface.co/shamanic/minimax-h3-equi360-lora); [LTX card](https://huggingface.co/TheBurgstall/Seamless-Equirectangular-LTX2.3-LoRA)
- Prompt: trigger `equirect360` (H3) or `Equirectangular` (LTX) — same cards
- Popularity 2026-10-19: 30 likes (H3); 9 likes (LTX); node pack 49 GitHub stars — [HF API H3](https://huggingface.co/api/models/shamanic/minimax-h3-equi360-lora); [GitHub API](https://api.github.com/repos/Burgstall-labs/ComfyUI-Seamless-Equirectangular)
- License: "other" for both — same HF API
- Proposed service (inference): new format "360 video" next to rank 7.
- Higgsfield: none found.
- Confidence: low to medium (small uptake).

##### 10. LTX Ripple: edit the first frame, the whole video follows

- Links: [WepeNerd/LTX-Ripple](https://huggingface.co/WepeNerd/LTX-Ripple); also [EditAnything, Civitai 2553102](https://civitai.com/models/2553102)
- Base: LTX-2.5 — [card](https://huggingface.co/WepeNerd/LTX-Ripple)
- Does: a "First Frame All Frames" IC-LoRA: input a video, replace its first frame with an edited one, and the LoRA carries the edit through the video; listed uses include effects, retexturing, style change, time of day, character attributes, background, weather, title or logo replacement, and object add, remove or replace — [card](https://huggingface.co/WepeNerd/LTX-Ripple)
- Prompt: optional short description of the change; recommended strength 1.35 — [card](https://huggingface.co/WepeNerd/LTX-Ripple)
- Popularity 2026-10-19: 76 likes, 409 dl30; updated 2026-10-17 — [HF API](https://huggingface.co/api/models/WepeNerd/LTX-Ripple)
- License: "other" — [HF API](https://huggingface.co/api/models/WepeNerd/LTX-Ripple)
- Also: EditAnything for LTX-2.5 (experimental) does replace, remove, add and restyle in one prompt with a prompt enhancer; 7,930 dl, 480 thumbs; commercial use allowed — [Civitai API](https://civitai.com/api/v1/models/2553102)
- Proposed service (inference): upgrade "Edit a video by text" and "Swap an element" (Bernini-R); a Flows pattern where any image-edit format feeds a "Ripple to video" node.
- Higgsfield: Edit Video with Kling 3.0 Omni Edit, by prompt or "Draw to Edit" — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 11. LTX-2.5 IC-LoRA Day-To-Night

- Link: [Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night)
- Base: LTX-2.5 22B — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night)
- Does: re-renders a daytime video as the same shot at night, keeping composition, framing, camera movement and subject motion frame for frame — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night)
- Prompt: "A realistic nighttime scene. [lighting description] Only the lighting changes from day to night; identical composition, framing, camera movement and motion." — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night)
- Popularity 2026-10-19: 26 likes, 2,778 dl30 — [HF API](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night)
- License: LTX-2.x community license — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night)
- Proposed service (inference): new Video edits format "Day to night"; a real-estate "Twilight tour" preset.
- Higgsfield: only as an instruction to a partner model ("edits by instruction (swap a product, relight day to night)") — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high.

##### 12. Cameraman IC-LoRA v2: copy the camera move of any reference video

- Links: [Cseti/LTX2.3-22B_IC-LoRA-Cameraman_v2](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-Cameraman_v2); [v1](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-Cameraman_v1); [Civitai 2525197](https://civitai.com/models/2525197)
- Base: LTX-2.3 22B — [card](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-Cameraman_v2)
- Does: generates a new scene that replicates the camera movement of a reference video; works in text-to-video or image-to-video — [card](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-Cameraman_v2)
- Prompt and settings: no trigger word; at least 960×512 on the first pass; image strength 0.5 or 0.7 for more motion; the prompt strongly affects the result — [card](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-Cameraman_v2)
- Popularity 2026-10-19: 52 likes (v2), 62 likes (v1); Civitai 3,132 dl, 174 thumbs — [HF API](https://huggingface.co/api/models/Cseti/LTX2.3-22B_IC-LoRA-Cameraman_v2); [Civitai API query](https://civitai.com/api/v1/models?types=LORA&query=IC-LoRA)
- License: v1 Apache-2.0; v2 has no license tag — [HF API v1](https://huggingface.co/api/models/Cseti/LTX2.3-22B_IC-LoRA-Cameraman_v1)
- ComfyUI: example workflow in Cseti's ComfyUI-Workflows dataset; a separate node, ComfyUI-CameraReference3D, generates parametric camera-motion reference clips for this LoRA — [card](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-Cameraman_v2); [GitHub search](https://api.github.com/search/repositories?q=IC-LoRA+pushed:%3E2025-10-01&sort=stars)
- Proposed service (inference): new format "Copy a camera move" under Motion control or Cinema studio; also powers "Clone an edit".
- Higgsfield: Kling Motion Control copies a character's motion, not the camera; no camera-from-video tool found — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium (LTX-2.3 base).

##### 13. Pixel sprite sheets from one character (Qwen-Image-Edit 2511)

- Links: [svntax-dev/pixel_spritesheet_4walk_combat_32x48_v1](https://huggingface.co/svntax-dev/pixel_spritesheet_4walk_combat_32x48_v1); also [Lah Animation Sheet, Civitai 2177558](https://civitai.com/models/2177558) and [fal/flux-2-klein-4b-spritesheet-lora](https://huggingface.co/fal/flux-2-klein-4b-spritesheet-lora)
- Base: Qwen-Image-Edit 2511 — [card](https://huggingface.co/svntax-dev/pixel_spritesheet_4walk_combat_32x48_v1)
- Does: a pixel-art sheet for small 32×48 characters with walk frames for up, down, left and right, two attack frames and one hurt frame — [card](https://huggingface.co/svntax-dev/pixel_spritesheet_4walk_combat_32x48_v1)
- Settings: 768×768; downscale by 4 with k-centroid scaling for pixel-perfect output; add a LoRA loader to the default Qwen Image Edit 2511 subgraph — [card](https://huggingface.co/svntax-dev/pixel_spritesheet_4walk_combat_32x48_v1)
- Popularity 2026-10-19: 19 likes, 671 dl30 — [HF API](https://huggingface.co/api/models/svntax-dev/pixel_spritesheet_4walk_combat_32x48_v1)
- License: Apache-2.0 — [HF API](https://huggingface.co/api/models/svntax-dev/pixel_spritesheet_4walk_combat_32x48_v1)
- Also: Lah Animation Sheet (Qwen-Image-Edit 2509) makes 3×3 or 3×2 action sheets (hit, kick, spin, earth slam, saw dive, X-cross slash) in a 2D anime style; 1,090 dl, 136 thumbs; commercial use allowed — [Civitai API](https://civitai.com/api/v1/models/2177558)
- Also: fal's 2×2 sprite-sheet LoRA (FLUX.2 Klein 4B) turns one object into four views (two isometric, side, top-down); prompt "2x2 sprite sheet", scale 1.1; 107 likes — [card](https://huggingface.co/fal/flux-2-klein-4b-spritesheet-lora)
- Proposed service (inference): new tool page "Game assets" (sprite sheets, animated sprites, textures, tiles).
- Higgsfield: no sprite feature (0 hits); its "Pixel Game" app makes a video of "Your character runs through a retro 8-bit world" — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 14. Animated pixel sprites (Wan 2.2 I2V)

- Links: [styly-agents/Wan2-2-pixel-animate](https://huggingface.co/styly-agents/Wan2-2-pixel-animate); [Civitai 2085866 (attack)](https://civitai.com/models/2085866); [Civitai 2172038 (walk)](https://civitai.com/models/2172038)
- Base: Wan2.2-I2V-A14B — [card](https://huggingface.co/styly-agents/Wan2-2-pixel-animate)
- Does: pixel-art sprite animations from a static image; trained on 226 sprite animations (characters, magic effects, explosions, smoke, attack cycles); rank 256 — [card](https://huggingface.co/styly-agents/Wan2-2-pixel-animate)
- Also: the Civitai attack LoRA wants a 64×64 pixel character upscaled to 512×512 facing right, with high- and low-noise LoRAs as a pair (1,037 dl, 174 thumbs); the walk LoRA uses "pix3lwalk, side view character walk animation", weight 0.7–0.9, 24 frames, 16 fps (965 dl, 149 thumbs) — [Civitai API 2085866](https://civitai.com/api/v1/models/2085866); [Civitai API 2172038](https://civitai.com/api/v1/models/2172038)
- Popularity 2026-10-19: 22 likes, 16,141 dl30 (styly) — [HF API](https://huggingface.co/api/models/styly-agents/Wan2-2-pixel-animate)
- License: Apache-2.0 (styly); Civitai attack LoRA allows rental only, walk LoRA allows selling — same sources
- Proposed service (inference): "Animate a sprite" on the Game assets page; upgrade the "8-bit runner" format.
- Higgsfield: Pixel Game app only (see rank 13).
- Confidence: medium.

##### 15. PixelSmile: fine-grained facial expression slider (Qwen-Image-Edit 2511)

- Link: [PixelSmile/PixelSmile](https://huggingface.co/PixelSmile/PixelSmile)
- Base: Qwen-Image-Edit 2511 — [HF API](https://huggingface.co/api/models/PixelSmile/PixelSmile)
- Does: fine-grained facial expression editing with continuous control; paper arXiv 2603.25728, benchmark FFE-Bench, demo Space — [card](https://huggingface.co/PixelSmile/PixelSmile); [GitHub API](https://api.github.com/repos/Ammmob/PixelSmile)
- Popularity 2026-10-19: 93 likes, 869 dl30; GitHub 446 stars — [HF API](https://huggingface.co/api/models/PixelSmile/PixelSmile); [GitHub API](https://api.github.com/repos/Ammmob/PixelSmile)
- License: Apache-2.0 — [HF API](https://huggingface.co/api/models/PixelSmile/PixelSmile)
- ComfyUI: community node ComfyUI-PixelSmile-Conditioning-Interpolation (74 stars) — [GitHub API](https://api.github.com/repos/judian17/ComfyUI-PixelSmile-Conditioning-Interpolation)
- Proposed service (inference): an "Expression" slider in the Character tool and Character sheet; a fun format "Make them smile".
- Higgsfield: no expression editor found ("expression" appears only in photo guidance and motion copy) — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium to high.

##### 16. AnyPose: copy the pose of any photo (Qwen-Image-Edit 2511)

- Link: [lilylilith/AnyPose](https://huggingface.co/lilylilith/AnyPose)
- Base: Qwen-Image-Edit 2511, designed for the 4-step Lightning LoRA — [card](https://huggingface.co/lilylilith/AnyPose)
- Does: one reference image as a pose guide makes the subject follow that pose, with no OpenPose or ControlNet — [card](https://huggingface.co/lilylilith/AnyPose)
- Popularity 2026-10-19: 513 likes, 70,309 dl30 — [HF API](https://huggingface.co/api/models/lilylilith/AnyPose)
- License: Apache-2.0 — [HF API](https://huggingface.co/api/models/lilylilith/AnyPose)
- Proposed service (inference): "Pose like this photo" inside "Character in any scene", "Virtual stylist" (set the pose), "Fashion factory" and "AI influencer post".
- Higgsfield: no pose-from-reference feature found in the audit.
- Confidence: high.

##### 17. Audio-reactive LoRA for LTX-2.3: visuals that hit on the beat

- Link: [fal/ltx2.3-audio-reactive-lora](https://huggingface.co/fal/ltx2.3-audio-reactive-lora)
- Base: LTX-2.3, audio-to-video and image-plus-audio-to-video — [card](https://huggingface.co/fal/ltx2.3-audio-reactive-lora)
- Does: beat-locked motion (cubic forms, particles, light pulses, camera pushes, material deformation) in sync with kicks, bass, snares, hi-hats and synth changes; V2 (2026-06-15) adds heavier beat impact — [card](https://huggingface.co/fal/ltx2.3-audio-reactive-lora)
- Popularity 2026-10-19: 65 likes, 2,424 dl30 — [HF API](https://huggingface.co/api/models/fal/ltx2.3-audio-reactive-lora)
- License: "other" — [HF API](https://huggingface.co/api/models/fal/ltx2.3-audio-reactive-lora)
- ComfyUI: plain LoRA files (`ltx2.3_audio_reactive_lora_v2.safetensors`); hosted on fal at `fal-ai/ltx-2.3-quality/audio-to-video/lora` — [card](https://huggingface.co/fal/ltx2.3-audio-reactive-lora)
- Proposed service (inference): new Music and sound format "Music visualizer" (MiniMax Music 3 track in, reactive video out); a beat video option in Shorts.
- Higgsfield: no audio-reactive feature (0 hits); its beat-cut apps (Urban Cuts, ClipCut) cut to the beat rather than animate to it — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 18. Garment packshots: ghost mannequin and virtual try-off

- Links: [nhathoangfoto/FLUX.2-klein-ghost-mannequin](https://huggingface.co/nhathoangfoto/FLUX.2-klein-ghost-mannequin); [fal/virtual-tryoff-lora](https://huggingface.co/fal/virtual-tryoff-lora); [Extract Product Image, Civitai 2366596](https://civitai.com/models/2366596)
- Base: FLUX.2 Klein 9B base (ghost mannequin); FLUX.2 Klein 9B (try-off); Qwen-Image-Edit 2509 and Klein (Extract Product Image) — [HF API](https://huggingface.co/api/models/nhathoangfoto/FLUX.2-klein-ghost-mannequin); [HF API](https://huggingface.co/api/models/fal/virtual-tryoff-lora); [Civitai API](https://civitai.com/api/v1/models/2366596)
- Does: ghost mannequin turns flat or mannequin-worn clothing into a floating "invisible mannequin" e-commerce shot (rank 256, 50 pairs, 6,000 steps); try-off takes a photo of a person plus a garment category and outputs the garment alone; Extract Product Image makes a product shot of any sitting, held or worn object ("make a product image for <object>", add "mannequin" to show it on one) — [ghost card](https://huggingface.co/nhathoangfoto/FLUX.2-klein-ghost-mannequin); [try-off card](https://huggingface.co/fal/virtual-tryoff-lora); [Civitai API](https://civitai.com/api/v1/models/2366596)
- Popularity 2026-10-19: 42 likes, 2,221 dl30 (ghost); 52 likes, 4,026 dl30 (try-off); 3,589 dl, 177 thumbs (Extract) — same sources
- License: Apache-2.0 (both HF); Civitai rental only for Extract — same sources
- ComfyUI: try-off ships `virtual-tryoff-lora_comfy.safetensors` — [card](https://huggingface.co/fal/virtual-tryoff-lora)
- Proposed service (inference): new Ads format "Garment packshot"; a Flows chain try-off → try-on; an input step for Fashion factory.
- Higgsfield: no ghost-mannequin feature; "Mannequin" exists only as a faceless video style — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium (FLUX.2 base needs a port).

##### 19. Ref2Font: a full font from one "Aa" reference

- Links: [SnJake/Ref2Font](https://huggingface.co/SnJake/Ref2Font); also [dx8152/Qwen-Image-2.1-Font](https://huggingface.co/dx8152/Qwen-Image-2.1-Font) and [Logo.Redmond, Civitai 124609](https://civitai.com/models/124609)
- Base: FLUX.2 Klein 9B — [card](https://huggingface.co/SnJake/Ref2Font)
- Does: generates 1280×1280 font atlases from a single reference image of "Aa" (Latin) or "Аа" (Cyrillic); V3 adds glyphs and straighter letters; ships a ComfyUI workflow and vectorization scripts; "works well, but not perfectly" — [card](https://huggingface.co/SnJake/Ref2Font)
- Popularity 2026-10-19: 37 likes; GitHub repo 99 stars — [HF API](https://huggingface.co/api/models/SnJake/Ref2Font); [GitHub API](https://api.github.com/repos/SnJake/Ref2Font)
- License: MIT — [HF API](https://huggingface.co/api/models/SnJake/Ref2Font)
- Also: Qwen-Image-2.1-Font LoRA improves text layout and poster design (trigger `font`, 0.3–0.4 general, about 0.6 for posters, CFG 3 for posters); 7 likes, created 2026-10-17 — [card](https://huggingface.co/dx8152/Qwen-Image-2.1-Font)
- Also: Logo.Redmond for Z-Image Turbo (trigger `Logo`) has 74,860 dl and 4,169 thumbs — [Civitai API](https://civitai.com/api/v1/models/124609)
- Proposed service (inference): new Ads format "Make a font" (atlas → vectorize → font file) for brand kits; upgrade the "Logo" format with Logo.Redmond on Z-Image Turbo.
- Higgsfield: a Brand Kit stores fonts extracted from a URL; no font generator found — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 20. Seamless tileable textures and albedo maps

- Links: [Stylized Textures (Game Asset) ZIT, Civitai 503877](https://civitai.com/models/503877); [paom/texture2albedo-v2](https://huggingface.co/paom/texture2albedo-v2); [lilylilith/QIE-2511-To_Material_Preview_Render](https://huggingface.co/lilylilith/QIE-2511-To_Material_Preview_Render)
- Base: Z-Image Turbo (textures); FLUX.2 Klein 9B (albedo); Qwen-Image-Edit 2511 (material preview) — same sources
- Does: seamless tileable 2D textures; pure unlit albedo from a texture; decomposes an image into a Blender-like "material preview" without scene lights — [Civitai API](https://civitai.com/api/v1/models/503877); [albedo card](https://huggingface.co/paom/texture2albedo-v2); [material card](https://huggingface.co/lilylilith/QIE-2511-To_Material_Preview_Render)
- Prompt: "A seamless tileable 2D texture pattern of [subject] top-down flat view, perfectly tileable without edges ..."; albedo: "Unlit flat-shaded albedo map. Remove all shadows, reflections, highlights, and specularity ..."; material: "Turn the image into a preview render." — same sources
- Popularity 2026-10-19: 4,822 dl, 610 thumbs (textures); 44 likes (albedo); 11 likes (material) — same sources
- License: Civitai image and rental use, no derivatives (textures); Apache-2.0 (albedo, material) — same sources
- Proposed service (inference): Game assets page "Seamless texture"; Flows nodes "Albedo map" and "Material preview"; texturing for 3D studio.
- Higgsfield: no texture tool (0 hits for "seamless" as a texture) — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 21. Restore and colorize old video (LTX-2.5 Restore and Colorization)

- Links: [Lightricks/LTX-2.5-22b-IC-LoRA-Restore](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Restore); [Lightricks/LTX-2.5-22b-IC-LoRA-Colorization](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Colorization); also [oumoumad/ltx-2.3-dearchive-lora](https://huggingface.co/oumoumad/ltx-2.3-dearchive-lora)
- Base: Restore was trained on LTX-2.3 and "works well unchanged" on LTX-2.5; Colorization is LTX-2.5 22B — [Restore card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Restore); [Colorization card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Colorization)
- Does: Restore renders archive video (low-res rips, tape, sepia or black-and-white film) as a clean, colour, high-resolution capture, removing compression damage, casts, flicker, dirt and scratches; Colorization restores natural colour to grayscale video without changing identity, framing or geometry — same cards
- Prompt: Restore uses a plain scene description with "natural colour"; Colorization: "Reference shows ... Edited shows the same scene with natural colors restored. COLORIZE ..." — same cards
- Popularity 2026-10-19: 77 likes, 7,109 dl30 (Restore); 15 likes, 1,894 dl30 (Colorization); 46 likes (dearchive) — [HF API Restore](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-IC-LoRA-Restore); [HF API Colorization](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-IC-LoRA-Colorization)
- License: tagged "other" on the HF API and gated; the other Lightricks cards I opened name the LTX-2 community license — same HF API links
- Proposed service (inference): new Enhance format "Restore old video" (pairs with "Restore an old photo"); old family clips for "Event video" and "Anniversary video".
- Higgsfield: photo restore only (a "photo restorer" landing section and prompt-only colorize in its photo editor); no video restore found — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high.

##### 22. Optical Illusion Generator (Qwen-Image 2.1 edit, plus an H3 video version)

- Link: [Civitai 2432921](https://civitai.com/models/2432921)
- Base: Qwen 2.1 (Qwen-Image 2.1 edit mode); a MiniMax H3 Ref2V version also exists — [Civitai API](https://civitai.com/api/v1/models/2432921)
- Does: turns your image into an optical illusion (QR-Code-Monster style) where the outlines of the source hide inside a new scene; QR codes are "hit or miss" — [Civitai API](https://civitai.com/api/v1/models/2432921)
- Prompt: "Transform the entire image into <your prompt here> while preserving the outlines and shapes of the original image"; strength 1.0 (image), 0.8–1.2 (H3) — [Civitai API](https://civitai.com/api/v1/models/2432921)
- Popularity 2026-10-19: 2,703 dl, 270 thumbs; published 2026-10-03 — [Civitai API](https://civitai.com/api/v1/models/2432921)
- License: Civitai image use and on-site rental — [Civitai API](https://civitai.com/api/v1/models/2432921)
- Proposed service (inference): Just for fun format "Hidden image"; Ads format "Hidden logo".
- Higgsfield: none (0 hits for "illusion").
- Confidence: medium.

##### 23. H3 Character Swap LoRA: replace a performer with your character

- Link: [akatz-ai/MiniMax-H3-Character-Swap-LoRA](https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA)
- Base: MiniMax H3 (Comfy-Org repack), reference conditioning — [card](https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA)
- Does: replaces a selected person in a source performance with a character from an image reference; V1.5 recommended at strength 1.0 — [card](https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA)
- Popularity 2026-10-19: 538 likes, 80,295 dl30; updated 2026-10-17 — [HF API](https://huggingface.co/api/models/akatz-ai/MiniMax-H3-Character-Swap-LoRA)
- License: "other" — [HF API](https://huggingface.co/api/models/akatz-ai/MiniMax-H3-Character-Swap-LoRA)
- ComfyUI: workflow uses native H3 loading, SAM masking and the H3 Relay 2.0 node pack (30 GitHub stars) for long clips — [card](https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA); [GitHub API](https://api.github.com/repos/akatz-ai/h3-relay)
- Proposed service (inference): upgrade "Video character swap" (now SCAIL-2) onto our own H3 stack.
- Higgsfield: Recast and Character Swap 2.0 (image) — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high (parity, not novelty).

##### 24. CrossView Warp (MiniMax H3 Ref2VA): re-shoot a video from a new angle

- Link: [Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1](https://huggingface.co/Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1); LTX-2.3 version [CrossView-Warp_v2](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-CrossView-Warp_v2)
- Base: MiniMax H3 Ref2VA — [card](https://huggingface.co/Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1)
- Does: given a video and a camera offset (azimuth, elevation), generates the same scene from that viewpoint, reading a depth-warp of the clip for geometry and the clip itself for appearance — [card](https://huggingface.co/Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1)
- Prompt: trigger `crossview`; strength 0.8; you can prompt what fills unseen (magenta) areas — [card](https://huggingface.co/Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1)
- Popularity 2026-10-19: 75 likes, 4,729 dl30; ComfyUI-CrossViewWarp node 71 stars — [HF API](https://huggingface.co/api/models/Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1); [GitHub API](https://api.github.com/repos/cseti007/ComfyUI-CrossViewWarp)
- License: "other" — [HF API](https://huggingface.co/api/models/Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1)
- Proposed service (inference): upgrade "Re-shoot from a new angle" (now ReCamMaster).
- Higgsfield: Angles 2.0 re-renders a photo from a picked camera position (image only) — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium to high.

##### 25. LTX-2.5 IC-LoRA Ingredients: a reference sheet keeps the cast, props and set consistent

- Link: [Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients); LTX-2.3 version [here](https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Ingredients)
- Base: LTX-2.5 22B — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients)
- Does: conditions video on a reference sheet, one composite image listing the characters, props and location, so they stay consistent — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients)
- Prompt: a "Reference Sheet Description" naming each cell (setting, character, props), then the shot — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients)
- Popularity 2026-10-19: 70 likes, 10,425 dl30 (2.5); 213 likes (2.3); a sheet-builder node exists (gregowahoo/comfyui-ingredients-sheet-builder) — [HF API](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients); [GitHub search](https://api.github.com/search/repositories?q=IC-LoRA+pushed:%3E2025-10-01&sort=stars)
- License: LTX-2.x community license — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients)
- Proposed service (inference): upgrade "Multi-shot scene" and Cinema studio elements; Ads with a brand mascot, product and store.
- Higgsfield: Cinema Studio 3.0 takes 9 references — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high (parity).

##### 26. Art-directable water, smoke and fire (LTX-2.5)

- Links: [Lightricks/LTX-2.5-22b-IC-LoRA-Water-Simulation](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Water-Simulation); [AInVFX/ainvfx-fluid](https://huggingface.co/AInVFX/ainvfx-fluid)
- Base: LTX-2.5 22B (both) — same cards
- Does: Water Simulation adds rivers, surf, rain, waterfalls, floods, splashes and wet surfaces to a clip while keeping identity, pose, framing and background geometry; ainvfx-fluid replaces flat colour blobs painted on first and last frames with smoke, steam or fire and animates between keyframes — [water card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Water-Simulation); [fluid card](https://huggingface.co/AInVFX/ainvfx-fluid)
- Prompt: water "Reference shows ... Edited shows the same scene with water added. ADD WATER ..."; fluid trigger `ainvfxfluid` — same cards
- Popularity 2026-10-19: 24 likes, 2,380 dl30 (water); 24 likes, 560 dl30 (fluid) — [HF API water](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-IC-LoRA-Water-Simulation); [HF API fluid](https://huggingface.co/api/models/AInVFX/ainvfx-fluid)
- License: LTX community license; "other" — same sources
- Proposed service (inference): Flows node "Paint VFX"; upgrade the fixed LTX Video 2B effects "Flood", "Set on fire" and "Sandstorm" into art-directable versions on LTX-2.5.
- Higgsfield: effects are fixed presets ("/effects lists 45 named effects") — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 27. H3 Keyframe Animation adapters: hand-drawn timing

- Link: [alvdansen/h3-keyframe-animation](https://huggingface.co/alvdansen/h3-keyframe-animation)
- Base: MiniMax H3 — [HF API](https://huggingface.co/api/models/alvdansen/h3-keyframe-animation)
- Does: three adapters teach H3 to move a drawing the way a hand-drawn animator does, with a consistent cadence; "hero" (1 reference) draws the next key, "tween" (2 references) draws the next in-between; companion to the paper "Animating on Twos" (Alvdansen Labs, August 2026) — [card](https://huggingface.co/alvdansen/h3-keyframe-animation)
- Popularity 2026-10-19: 105 likes; gated; dl30 reported as 0 — [HF API](https://huggingface.co/api/models/alvdansen/h3-keyframe-animation)
- License: "other" — [HF API](https://huggingface.co/api/models/alvdansen/h3-keyframe-animation)
- Proposed service (inference): upgrade "Animation" and "Sketch to video" (MiniMax H3).
- Higgsfield: none found.
- Confidence: medium.

##### 28. Next-Scene for Qwen-Image 2.1, and storyboard grids

- Links: [akhaliq/Qwen-Image-2.1-Next-Scene-LoRA](https://huggingface.co/akhaliq/Qwen-Image-2.1-Next-Scene-LoRA); original [lovis93/next-scene-qwen-image-lora-2509](https://huggingface.co/lovis93/next-scene-qwen-image-lora-2509); also [peculiar/sbgrid](https://huggingface.co/peculiar/sbgrid) and [Krea2 StoryFlow, Civitai 2891699](https://civitai.com/models/2891699)
- Base: Qwen-Image 2.1 — [card](https://huggingface.co/akhaliq/Qwen-Image-2.1-Next-Scene-LoRA)
- Does: an input image plus a director-style instruction gives the next scene (camera moves, reveals, lighting shifts) with the same world, characters and style; outputs chain into storyboards — [card](https://huggingface.co/akhaliq/Qwen-Image-2.1-Next-Scene-LoRA)
- Popularity 2026-10-19: 62 likes, 3,672 dl30 (2.1 port); the original 2509 LoRA has 665 likes and 13,686 dl30, and the port's card claims 313K downloads for it — [HF API port](https://huggingface.co/api/models/akhaliq/Qwen-Image-2.1-Next-Scene-LoRA); [HF API original](https://huggingface.co/api/models/lovis93/next-scene-qwen-image-lora-2509); [port card](https://huggingface.co/akhaliq/Qwen-Image-2.1-Next-Scene-LoRA)
- License: Apache-2.0 (port); MIT (original) — same sources
- Also: sbgrid (Krea 2) makes coherent 8-panel cinematic storyboards from character, environment and visual references (23 likes); StoryFlow (Krea 2) is a 3-frame in-context LoRA at 512×1536 with `[SHOT-SEQUENCE] [FRAME-1] [FRAME-2] [FRAME-3]` prompts (399 dl, 48 thumbs) — [sbgrid card](https://huggingface.co/peculiar/sbgrid); [Civitai API](https://civitai.com/api/v1/models/2891699)
- Proposed service (inference): upgrade "What happens next" (now Qwen3.8 and FLUX 3 Klein) and "Storyboard" (so it can start from a frame).
- Higgsfield: "What's Next?" app suggests 8 next scenes for one still — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high (parity plus).

##### 29. Manga page colorizer (Qwen-Image 2.1)

- Links: [Civitai 2968883](https://civitai.com/models/2968883); also [thedeoxen/FLUX.2-klein-9B-manga-colorization-by-reference-LORA](https://huggingface.co/thedeoxen/FLUX.2-klein-9B-manga-colorization-by-reference-LORA)
- Base: Qwen-Image 2.1 edit mode — [Civitai API](https://civitai.com/api/v1/models/2968883)
- Does: colorizes black-and-white manga pages, optionally from a colour reference; v0.1 "early, rough"; trained on about 1,600 real manga pairs including officially coloured One Piece, Bleach, Naruto and JoJo chapters — [Civitai API](https://civitai.com/api/v1/models/2968883)
- Prompt: "color <image1> manga panel" or "color <image1> manga panel. <image2> is color reference"; strength 0.7–1.0 — [Civitai API](https://civitai.com/api/v1/models/2968883)
- Popularity 2026-10-19: 499 dl, 37 thumbs; Klein version 57 likes, 1,323 dl30 — [Civitai API](https://civitai.com/api/v1/models/2968883); [HF API](https://huggingface.co/api/models/thedeoxen/FLUX.2-klein-9B-manga-colorization-by-reference-LORA)
- License: Civitai allows image use and sale; Klein version Apache-2.0 — same sources
- Proposed service (inference): new format "Color a manga page".
- Higgsfield: manga panels from a selfie (AI anime generator) and prompt-only colorize in the photo editor — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium (copyrighted training data is a risk).

##### 30. Light placement upgrades: Sun Direction and AnyLight

- Links: [eric-venti-seeds/Sun-Direction-Lora-Flux2Klein9B](https://huggingface.co/eric-venti-seeds/Sun-Direction-Lora-Flux2Klein9B); [lilylilith/QIE-2511-MP-AnyLight](https://huggingface.co/lilylilith/QIE-2511-MP-AnyLight)
- Base: FLUX.2 Klein 9B (Sun Direction); Qwen-Image-Edit 2511 (AnyLight) — same sources
- Does: Sun Direction moves the sun to a set elevation and rotation relative to the camera, guided by a rendered ball image (exteriors only; make the image overcast first); AnyLight places complex lights using a semi-3D "material preview" of the scene — [sun card](https://huggingface.co/eric-venti-seeds/Sun-Direction-Lora-Flux2Klein9B); [AnyLight card](https://huggingface.co/lilylilith/QIE-2511-MP-AnyLight)
- Prompt: trigger "match the sun direction from the reference" — [sun card](https://huggingface.co/eric-venti-seeds/Sun-Direction-Lora-Flux2Klein9B)
- Popularity 2026-10-19: 166 likes (Sun Direction); 33 likes, 12,019 dl30 (AnyLight) — [HF API sun](https://huggingface.co/api/models/eric-venti-seeds/Sun-Direction-Lora-Flux2Klein9B); [HF API AnyLight](https://huggingface.co/api/models/lilylilith/QIE-2511-MP-AnyLight)
- License: Apache-2.0 (both) — same sources
- ComfyUI: Sun Direction comes with a Sphere Render node — [sun card](https://huggingface.co/eric-venti-seeds/Sun-Direction-Lora-Flux2Klein9B)
- Proposed service (inference): upgrade "Move the light" and the Relight tool; real-estate "Golden hour exterior".
- Higgsfield: Relight moves a virtual light around a photo with presets and reads scene depth — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 31. AnyAngle (Qwen-Image 2.1): free camera through a 3D proxy

- Links: [lilylilith/QI_2.1_AnyAngle](https://huggingface.co/lilylilith/QI_2.1_AnyAngle); also [dx8152/Qwen-Image-Edit-2511-Gaussian-Splash](https://huggingface.co/dx8152/Qwen-Image-Edit-2511-Gaussian-Splash)
- Base: Qwen-Image 2.1 (AnyAngle); Qwen-Image-Edit 2511 (Gaussian-Splash) — same sources
- Does: turn the photo into a Gaussian splat (Tripo Splat) or 3D model (Trellis 2), set any camera in Blender, and the LoRA redraws that view in the original style; Gaussian-Splash repairs perspective and empty areas of an Apple ml-sharp rotated view — [AnyAngle card](https://huggingface.co/lilylilith/QI_2.1_AnyAngle); [Splash card](https://huggingface.co/dx8152/Qwen-Image-Edit-2511-Gaussian-Splash)
- Popularity 2026-10-19: 167 likes (AnyAngle, created 2026-09-28); 208 likes, 782 dl30 (Splash); viewer node comfyui-GaussianViewer 113 stars — [HF API](https://huggingface.co/api/models/lilylilith/QI_2.1_AnyAngle); [HF API](https://huggingface.co/api/models/dx8152/Qwen-Image-Edit-2511-Gaussian-Splash); [GitHub API](https://api.github.com/repos/CarlMarkswx/comfyui-GaussianViewer)
- License: Apache-2.0 — same sources
- Proposed service (inference): upgrade "Any angle" (Qwen-Image Edit 2511 Multiple-Angles) with a 3D viewport camera picker.
- Higgsfield: Angles 2.0 has an orbit sphere, rotation, tilt and zoom sliders and a "12 best angles" batch — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 32. Krea 2 Identity Edit: one photo of a person into any scene

- Link: [conradlocke/krea2-identity-edit](https://huggingface.co/conradlocke/krea2-identity-edit)
- Base: Krea 2 Raw — [HF API](https://huggingface.co/api/models/conradlocke/krea2-identity-edit)
- Does: V2 ships two LoRAs, Identity Edit (put a person from one photo into any scene, pose, outfit and lighting) and General Edit (remove, recolor, relight, swap backgrounds, add objects, change text and outfits, restyle, flat lays) — [card](https://huggingface.co/conradlocke/krea2-identity-edit)
- Popularity 2026-10-19: 867 likes, 153,255 dl30 (the most-liked edit LoRA in this scan); ComfyUI nodes lbouaraba/comfyui-krea2edit 722 stars — [HF API](https://huggingface.co/api/models/conradlocke/krea2-identity-edit); [GitHub search](https://api.github.com/search/repositories?q=lora+comfyui+workflow+pushed:%3E2026-06-01+stars:%3E200&sort=stars)
- License: free for personal and non-commercial use; commercial use needs a license from the author, case by case — [card](https://huggingface.co/conradlocke/krea2-identity-edit)
- Proposed service (inference): upgrade "Character in any scene", "AI influencer post" and "Photodump" (ComfyField already uses Krea 2 Raw for "AI human").
- Higgsfield: Soul ID trains one face from 20 to 80 photos — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high on quality; license is the blocker.

##### 33. Open virtual try-on (FLUX.2 Klein 9B and Qwen-Image 2.1)

- Links: [fal/flux-klein-9b-virtual-tryon-lora](https://huggingface.co/fal/flux-klein-9b-virtual-tryon-lora); [ArtmeScienceLab/Garments2Look-LoRA](https://huggingface.co/ArtmeScienceLab/Garments2Look-LoRA); [Attach Outfit & Try On, Civitai 2367983](https://civitai.com/models/2367983)
- Does: fal's LoRA takes three images (person, top, bottom) and outputs the person wearing them, up to 1024 px; Garments2Look (CVPR 2026) is outfit-level try-on with accessories, including a Qwen-Image 2.1 inpainting adapter trained on 97,068 samples — [fal card](https://huggingface.co/fal/flux-klein-9b-virtual-tryon-lora); [Garments2Look card](https://huggingface.co/ArtmeScienceLab/Garments2Look-LoRA)
- Popularity 2026-10-19: 156 likes, 7,421 dl30 (fal); 1 like, 112 dl30 (Garments2Look); 3,346 dl, 158 thumbs (Attach Outfit, non-commercial) — same sources and [Civitai API](https://civitai.com/api/v1/models/2367983)
- License: Apache-2.0 (fal); no tag (Garments2Look) — same sources
- Proposed service (inference): replace "Outfit swap" (FASHN via fal) with an open model; upgrade "Try on outfits" and "Virtual stylist".
- Higgsfield: Outfit Swap app and UGC and Pro Virtual Try On presets — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium (parity).

##### 34. SDR to HDR (video and stills)

- Links: [Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR); [oumoumad/LumiPic](https://huggingface.co/oumoumad/LumiPic)
- Base: LTX-2.5 22B distilled (video); Qwen-Image-Edit 2511 among three bases (LumiPic) — same sources
- Does: converts 8-bit SDR video to 16-bit HDR, writing EXR frames in ACEScg plus an HLG MP4; LumiPic converts SDR images to float HDR EXR, with a V11 ACEScct LoRA added 2026-10-03 — [video card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR); [LumiPic card](https://huggingface.co/oumoumad/LumiPic)
- Prompt: none (video LoRA ships a precomputed scene-embedding file) — [video card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR)
- Popularity 2026-10-19: 37 likes, 10,024 dl30 (video); 80 likes, 2,152 dl30 (LumiPic) — [HF API](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR); [HF API](https://huggingface.co/api/models/oumoumad/LumiPic)
- License: tagged "other" on the HF API (video); MIT (LumiPic) — same sources
- Proposed service (inference): an "HDR master" option on Video upscale and Image upscale.
- Higgsfield: none (only billing hits for "HDR") — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: high, but it impresses pros more than casual users.

##### 35. Sound and dubbing on LTX: Foley V2A and DubIt

- Links: [Lightricks/LTX-2.3-22b-LoRA-Foley-V2A](https://huggingface.co/Lightricks/LTX-2.3-22b-LoRA-Foley-V2A); [Lightricks/LTX-2.3-22b-IC-LoRA-DubIt](https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-DubIt)
- Base: LTX-2.3 22B — same cards
- Does: Foley generates synchronized, music-free sound effects from silent video; DubIt is an IC-LoRA for lip dubbing (JUST-DUB-IT paper, arXiv 2601.22143) — same cards
- Prompt: Foley prompts describe the sounds and end "No speech is present. No music is present." — [Foley card](https://huggingface.co/Lightricks/LTX-2.3-22b-LoRA-Foley-V2A)
- Popularity 2026-10-19: 36 likes, 536 dl30 (Foley); 151 likes, 2,457 dl30 (DubIt) — [HF API](https://huggingface.co/api/models/Lightricks/LTX-2.3-22b-LoRA-Foley-V2A); [HF API](https://huggingface.co/api/models/Lightricks/LTX-2.3-22b-IC-LoRA-DubIt)
- License: LTX-2 community license — same cards
- ComfyUI: Foley ships `ltx-2.3-foley-v2a.json`; DubIt uses the official dub-it workflow in the LTX-2 ComfyUI repo — same cards
- Proposed service (inference): upgrade "Add sound to video" (HunyuanVideo-Foley) and "Dub into another language" / "Lipsync" (InfiniteTalk).
- Higgsfield: "No standalone tool found; native audio only" for foley; Translate for dubbing — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 36. LTX-2.5 Slow-Motion Control

- Link: [Lightricks/LTX-2.5-22b-LoRA-Slow-Motion-Control](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Slow-Motion-Control)
- Base: LTX-2.5 22B, image-to-video — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Slow-Motion-Control)
- Does: turns physical motion speed into a knob, from real time to extreme slow motion, while output fps stays the same; ships `LTX-2.5_I2V_Speed_Control_flow.json` — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Slow-Motion-Control)
- Popularity 2026-10-19: 18 likes, 2,084 dl30 — [HF API](https://huggingface.co/api/models/Lightricks/LTX-2.5-22b-LoRA-Slow-Motion-Control)
- License: LTX-2 community license — [card](https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Slow-Motion-Control)
- Proposed service (inference): upgrade "Slow motion" (RIFE 4.26 interpolation) to generative slow motion; a speed control in Cinema studio.
- Higgsfield: Cinema Studio 3.0 speed ramps (Linear, Auto, Flash In/Out, Slow-mo, Bullet Time, Impact, Ramp Up) — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 37. XPLDV exploded-view LoRA (LTX-2.5)

- Link: [DigitalByte/LTX-2.5-Exploded-View-XPLDV](https://huggingface.co/DigitalByte/LTX-2.5-Exploded-View-XPLDV)
- Base: LTX-2.5 22B distilled — [card](https://huggingface.co/DigitalByte/LTX-2.5-Exploded-View-XPLDV)
- Does: turns a source image into an animated exploded view that separates exterior parts to reveal components, for product showcases, mechanical reveals and architectural breakdowns; strength 0.5; BASIC and COMPLEX prompt templates and a workflow included — [card](https://huggingface.co/DigitalByte/LTX-2.5-Exploded-View-XPLDV)
- Popularity 2026-10-19: 6 likes; updated 2026-10-08 — [HF API](https://huggingface.co/api/models/DigitalByte/LTX-2.5-Exploded-View-XPLDV)
- License: "other" — [HF API](https://huggingface.co/api/models/DigitalByte/LTX-2.5-Exploded-View-XPLDV)
- Proposed service (inference): new Ads format "Exploded view".
- Higgsfield: an "Exploded View" preset in its Commercial camera-control set and an MCP skill that animates object assembly in Blender — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: low to medium.

##### 38. Remove things from video: H3 Person Remover, Obscura Remova, LensRemover

- Links: [akatz-ai/MiniMax-H3-Person-Remover-LoRA](https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA); [WepeNerd/Obscura_Remova](https://huggingface.co/WepeNerd/Obscura_Remova); [JanKanta/ltx-2.3-22b-ic-lora-lens_remover](https://huggingface.co/JanKanta/ltx-2.3-22b-ic-lora-lens_remover)
- Base: MiniMax H3 Ref2VA (Person Remover); LTX-2.3 (the other two) — same cards
- Does: removes a selected person and rebuilds the background (SAM 3.1 tracking, green fill, overlapping windows; needs a clean first frame); removes occlusions, haze and foreground objects (strength about 1.5); removes lens flares, veiling glare and lens dirt for sRGB or ARRI LogC3 footage — same cards
- Popularity 2026-10-19: 76 likes, 1,828 dl30; 63 likes, 660 dl30; 20 likes — [HF API](https://huggingface.co/api/models/akatz-ai/MiniMax-H3-Person-Remover-LoRA); [HF API](https://huggingface.co/api/models/WepeNerd/Obscura_Remova); [HF API](https://huggingface.co/api/models/JanKanta/ltx-2.3-22b-ic-lora-lens_remover)
- License: "other" for all three — same sources
- Proposed service (inference): upgrade "Remove an object from a video" (VOID with SAM 3.1); add "Remove haze or lens flare" in Enhance.
- Higgsfield: video edits by prompt (Kling 3.0 Omni Edit); its object remover pages are for photos — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Confidence: medium.

##### 39. Depth, normals, pose and segmentation as image edits

- Links: [nomadoor/flux-2-klein-9B-schematic-lora](https://huggingface.co/nomadoor/flux-2-klein-9B-schematic-lora); [huawei-bayerlab/marigold-v2-0](https://huggingface.co/huawei-bayerlab/marigold-v2-0); [Longxiang-ai/TransNormal-2](https://huggingface.co/Longxiang-ai/TransNormal-2)
- Base: FLUX.2 Klein 9B base (schematic, TransNormal-2); Qwen-Image-Edit 2509 (Marigold v2) — same sources
- Does: six task LoRAs (relative depth, surface normal, body pose, full pose, binary segmentation, amodal segmentation) that output RGB schematic images, "not production-ready"; Marigold v2 is monocular depth on a diffusion transformer (SIGGRAPH Asia 2026); TransNormal-2 estimates surface normals in one step — same cards
- Popularity 2026-10-19: 87 likes (schematic); 114 likes and 918 GitHub stars (Marigold v2); 3 likes (TransNormal-2) — [HF API](https://huggingface.co/api/models/nomadoor/flux-2-klein-9B-schematic-lora); [HF API](https://huggingface.co/api/models/huawei-bayerlab/marigold-v2-0); [GitHub API](https://api.github.com/repos/huawei-bayerlab/marigold-v2)
- License: "other"; Apache-2.0; "other" — same sources
- Proposed service (inference): Flows nodes "Depth map", "Normal map", "Pose", "Segment"; inputs for relight, 3D studio and IC-LoRA controls. A dedicated model (Depth Anything 3, Comfy-Org repack, 42,218 dl30) may be the practical choice for depth — [HF search](https://huggingface.co/api/models?search=depth&sort=likes)
- Higgsfield: none as user outputs.
- Confidence: medium.

##### 40. H3-World: drive a scene with the keyboard

- Link: [DANNY621/H3-World](https://huggingface.co/DANNY621/H3-World)
- Base: MiniMax H3 — [HF API](https://huggingface.co/api/models/DANNY621/H3-World)
- Does: "the first interactive world model built on MiniMax-H3": an initial frame plus keyboard controls (W, A, S, D for the character, I, J, K, L for the camera) gives action-controlled video; trained on 8,000 gameplay clips; 65.6M LoRA parameters (0.199% of the 33B backbone) — [card](https://huggingface.co/DANNY621/H3-World)
- Popularity 2026-10-19: 94 likes — [HF API](https://huggingface.co/api/models/DANNY621/H3-World)
- License: "other" — [HF API](https://huggingface.co/api/models/DANNY621/H3-World)
- Proposed service (inference): upgrade "Explorable world" and "Game from a prompt" with "Walk around inside your photo".
- Higgsfield: none found.
- Confidence: low (research release).

#### Also checked, ranked below the top 40

- WindowSeat reflection removal (Qwen-Image-Edit 2509; 47 likes; 143 GitHub stars; NTIRE workshop at CVPR 2026): single-image reflection removal, a fit for an Enhance "Remove window reflections" — [card](https://huggingface.co/huawei-bayerlab/windowseat-reflection-removal-v1-0); [GitHub API](https://api.github.com/repos/huawei-bayerlab/windowseat-reflection-removal)
- LTX-2.3 IC-LoRA Motion Track Control (72 likes): guide object motion with sparse coloured spline tracks; a trajectory drawing node exists; fits "Draw to video" — [card](https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Motion-Track-Control)
- LTX-2.5 IC-LoRA BBox Control (22 likes, GPL-3.0): bounding-box control and regional prompting via ComfyUI-LTX-BBox-Animator — [card](https://huggingface.co/yuvraj108c/LTX-2.5-22b-IC-LoRA-BBox-Control)
- valiantcat LTX-2.3 Transition LoRA (166 likes, 14,855 dl30, Apache-2.0): first-last frame transitions and scene transformations; fits "Transition" — [card](https://huggingface.co/joyfox/LTX-2.3-Transition-LORA)
- Loopy (Wan2.2-T2V-A14B, TOG-26, Apache-2.0): seamless loops, also RGBA with semi-transparent effects; fits "Looping background" — [card](https://huggingface.co/htdong/Loopy)
- ASMR Trigger and Audio LoRA for MiniMax H3 (30 likes, 504 dl30, Apache-2.0): whisper acoustics; prompt "she is holding mic in one hand, she leans her head close to the mic and whispers: '...'", weight 0.6–0.8; fits the ASMR Ads formats — [card](https://huggingface.co/vpakarinen/asmr-trigger-audio-h3-lora)
- Qwen-Image 2.1 Doodle-in (19 likes, 1,268 dl30): a magenta scribble plus an object name gives that object in the scribble's shape and pose; fits "Sketch to image" and "Paint to change" — [card](https://huggingface.co/ML-Intern-lab/Qwen-Image-2.1-doodle-in-LoRA)
- PlateExtract (Qwen-Image 2.1, 14 likes): foreground as a transparent PNG from a composite plus its clean background; "Native RGBA ... with no custom VAE" — [card](https://huggingface.co/trmz/plate-extract-qwen-image-2.1)
- MCSkin (FLUX.2 Klein 9B, 402 dl30): a 64×64 Minecraft skin texture map from a character image — [card](https://huggingface.co/d1ngdongji/MCSkin)
- ROOMS: Cutaway Worlds (Krea 2, 328 dl): dollhouse cutaway scenes with per-room prompts; rental only — [Civitai API](https://civitai.com/api/v1/models/2980144)
- INFL8 (Qwen-Image-Edit 2511, 3,252 dl30): "inflate the [subject]" meme effect, also as start or end frames for video — [card](https://huggingface.co/systms/SYSTMS-INFL8-LoRA-Qwen-Image-Edit-2511)
- BUNNY General Motion Continuity Repair (MiniMax H3; 8,250 dl, 473 thumbs) and Spatial and Physics LoRA (MiniMax H3; 135 likes, 23,990 dl30): quality boosters for fast action and object physics, not new features — [Civitai API](https://civitai.com/api/v1/models/2890788); [card](https://huggingface.co/Jojocodex/minimax-h3-spatial-physics-lora)
- Cinematic Hard Cut (Wan 2.2 I2V; 8,461 dl, 461 thumbs): "the camera makes a hard cut to ..." for multi-shot clips — [Civitai API](https://civitai.com/api/v1/models/2088559)
- MMH3 Locked Stabilization (MiniMax H3; 1,992 dl, 131 thumbs): camera locked to a subject, good for dance — [Civitai API](https://civitai.com/api/v1/models/2975645)
- Manga Tone Rendering (MiniMax H3; 486 dl): monochrome screentone animation; trigger "manga-tone rendering" — [Civitai API](https://civitai.com/api/v1/models/2930172)
- Replace Hair Style (FLUX.2 Klein; 819 dl): copy a hairstyle from a second image or a wig photo; fits "Hairstyle changer" — [Civitai API](https://civitai.com/api/v1/models/2533253)
- LTX2.3 Greenscreen Avatar IC-LoRA (MIT, 2,372 dl30): vertical talking heads on chroma green — [card](https://huggingface.co/OmerHagage/ltx2-greenscreen-avatar-ic-lora-vertical-v1)

### Inferences

- The strongest picks share one pattern: a video model repurposed to make a different kind of output (alpha mattes, loops, stereo pairs, five-view sheets, HDR). These are hard to fake with prompting, so they are where an open stack can visibly beat Higgsfield's closed presets.
- Lightricks' official IC-LoRAs are the most dependable group: one base we already run, consistent cards, shipped ComfyUI workflows and real download numbers.
- Community MiniMax H3 LoRAs all date from after H3's open release (the MiniMaxAI/MiniMax-H3 repo was created 2026-07-28) and many report 0 downloads, so likes are the better popularity signal for them.

### Gaps

- I tested none of these LoRAs; quality claims come from the authors' own selected examples.
- Hugging Face gives no ratings, and its 30-day download counter reports 0 for several clearly used repos (for example matlod turnaround, VR180, keyframe animation); popularity for those rests on likes only.
- No good current-base LoRAs were found for UI or app mockups, infographics or charts, packaging and label mockups, tattoo design, makeup transfer, face aging (only sliders), pets, food shots, interior design or virtual staging. Hits were FLUX.1 or SDXL reuploads with near-zero downloads, or full models rather than LoRAs (for example SenseNova-U1 Infographic) — [HF search infographic](https://huggingface.co/api/models?search=infographic&sort=likes)
- Civitai keyword search mixes in many anime character LoRAs (for example "UI", "twilight", "normal map" returned character names), so capability LoRAs on Civitai may be under-counted.

## What exact base model does each need, and does ComfyField already run it?

### Takeaway

About four in five of the top 40 have their main LoRA on a base ComfyField already has (LTX-2.5, MiniMax H3, Qwen-Image-Edit 2511, Qwen-Image 2.1, FLUX 3 Klein, Z-Image Turbo, Wan 2.2, Krea 2 Raw). The rest need LTX-2.3, FLUX.2 Klein 9B or 4B, or Qwen-Image-Edit 2509; FLUX 3 Klein is too new (released 2026-10-13) to have ports yet.

### Cited Findings

- Already on our bases:
  - LTX-2.5: Alpha-Gen, Layout-To-Render, Cinemagraph, Day-To-Night, Ingredients, Water-Simulation, Slow-Motion-Control, SDR-To-HDR, Colorization, LTX Ripple, ainvfx-fluid, XPLDV, BBox Control, EditAnything v2 — see each card above; for example [Alpha-Gen card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen), [Ripple card](https://huggingface.co/WepeNerd/LTX-Ripple), [Civitai API 2553102](https://civitai.com/api/v1/models/2553102)
  - MiniMax H3: 360 Orbit (FL2VA variant), ORB360 CardSpin (Ref2VA), Turnaround (`ref2va_pruned`), VR180 (text-to-video), equi360, Character Swap, Person Remover (Ref2VA), CrossView Warp (Ref2VA), Keyframe Animation, H3-World, Real Stereo Depth Video, ASMR audio — [Orbit card](https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA); [CardSpin card](https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin); [Turnaround card](https://huggingface.co/matlod/minimax-h3-turnaround); [Person Remover card](https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA)
  - Qwen-Image-Edit 2511: AnyPose, PixelSmile, AnyLight, Material Preview, pixel sprite sheet, LumiPic, Gaussian-Splash, INFL8 — [HF API adapter tree](https://huggingface.co/api/models?filter=base_model:adapter:Qwen/Qwen-Image-Edit-2511)
  - Qwen-Image 2.1: Character Sheet Edit, Next-Scene, AnyAngle, Manga Colorizer, Optical Illusion, Doodle-in, PlateExtract, Garments2Look, Font — [HF API adapter tree](https://huggingface.co/api/models?filter=base_model:adapter:Qwen/Qwen-Image-2.1); [Civitai API 2995608](https://civitai.com/api/v1/models/2995608)
  - FLUX 3 Image Klein: 360 Degree (Flux.3 Klein version, 2026-10-16) — [Civitai API](https://civitai.com/api/v1/models/682349)
  - Z-Image Turbo: Character Design Sheet, Stylized Textures, Logo.Redmond — [Civitai API 100435](https://civitai.com/api/v1/models/100435)
  - Wan 2.2 I2V A14B: pixel animate, pixel attack and walk — [card](https://huggingface.co/styly-agents/Wan2-2-pixel-animate)
  - Krea 2 Raw (used today only in the "AI human" format): Identity Edit, sbgrid, CharacterSheet QuadView and Dynamic — [HF API](https://huggingface.co/api/models/conradlocke/krea2-identity-edit); [inventory](00%20service%20inventory.md)
- Not on our bases:
  - LTX-2.3: Cameraman, audio-reactive, Foley V2A, DubIt, dearchive, Obscura Remova, LensRemover, Motion Track Control, Transition, Seamless-Equirectangular — see cards above
  - FLUX.2 Klein 9B or 4B: Ref2Font, ghost mannequin, try-off, try-on, Sun Direction, schematic, ERP outpaint, 2×2 sprite sheet (4B), texture2albedo, MCSkin, TransNormal-2 — see cards above
  - Qwen-Image-Edit 2509: Lah Animation Sheet, Extract Product Image, WindowSeat, Marigold v2 — [Civitai API 2177558](https://civitai.com/api/v1/models/2177558); [WindowSeat card](https://huggingface.co/huawei-bayerlab/windowseat-reflection-removal-v1-0)
- Cross-version evidence: the Restore IC-LoRA "was trained on the LTX-2.3 foundation model and has been tested on LTX-2.5, where it works well unchanged" — [Restore card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Restore)
- Cross-version evidence: the Gaussian-Splash author says the 2509 workflow reproduces perspective better and the 2511 workflow gives better consistency, so one LoRA ran on both Qwen-Image-Edit versions — [Splash card](https://huggingface.co/dx8152/Qwen-Image-Edit-2511-Gaussian-Splash)
- MiniMax H3 LoRAs target specific variants (FL2VA, Ref2VA, T2V); for example the VR180 author warns that fal's 8-step `minimax/h3-max` LoRA route degrades the stereo pair — [VR180 card](https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora)
- Training a new H3 LoRA is cheap: the VR180 LoRA cost US$12.50 on fal's hosted trainer — [VR180 card](https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora)

### Inferences

- LTX-2.3 IC-LoRAs are worth trying on LTX-2.5 before writing them off, because Lightricks shows one that works unchanged.
- FLUX.2 Klein LoRAs should be treated as "needs a port" to FLUX 3 Klein; the VR180 cost shows that retraining a small capability LoRA can be cheap, and most of these FLUX.2 LoRAs used small datasets (for example 50 pairs for ghost mannequin).
- Qwen-Image-Edit 2509 LoRAs probably load on 2511, but quality may shift.

### Gaps

- I found no source that tests FLUX.2 Klein LoRAs on FLUX 3 Image Klein.
- LTX-2.3 to LTX-2.5 compatibility is confirmed for only one LoRA (Restore).
- I did not check whether Comfy Cloud allows loading arbitrary third-party LoRAs, or how gated Lightricks repos are fetched in a cloud worker.

## What ComfyField service would each become, and does Higgsfield offer anything like it?

### Takeaway

Six finds would be new tool pages or formats with no Higgsfield equivalent at all (cinemagraph, VR180 and 360 video, sprite and game assets, font from a reference, music visualizer, hidden-image illusion). Several more beat a Higgsfield feature on quality (soft-edge alpha video, a 360 orbit that loops, five-view turnarounds). The rest bring parity on an open stack (3D blocking to render, character swap, try-on, next scene, re-angle).

### Cited Findings

- Higgsfield has no hits for "sprite", "turnaround", "cinemagraph", "illusion", "cutaway" or "audio reactive" in the audit — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Higgsfield's transparent outputs are the image Background Remover ("Returns a transparent PNG cutout"), the Video Background Remover app, and "Remove background, with an alpha channel" in its editor plugins — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Higgsfield's 3D Jutsu builds an editable 3D blocking scene with an agent, then renders to video with Seedance 2.5 — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Higgsfield's camera controls list 64 moves including 360 Orbit and 3D Rotation, and its Commercial set includes Exploded View — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Higgsfield's Professional apps are Virality Predictor, Expand image, Angles 2.0, Shots, Transitions, Color grading, What's Next, Behind the Scenes, Zooms and Skin Enhancer — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- Higgsfield's Face and Identity apps include Character Swap 2.0, Recast and Video Face Swap — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- The audit records no standalone Higgsfield foley tool ("native audio only") — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)
- The audit already names "LTX-2.5 SDR-To-HDR and Colorization IC-LoRAs" in the ComfyField column for color grading — [Higgsfield audit](../Higgsfield%20feature%20audit/README.md)

### Inferences

Ranking table (impress = how much a user would notice it next to Higgsfield; "New" = new page or format, "Upgrade" = better engine for an existing ComfyField service from the inventory):

| Rank | LoRA (base) | ComfyField service | Higgsfield equivalent | Confidence |
|---|---|---|---|---|
| 1 | Alpha-Gen (LTX-2.5) | Upgrade "Video background remove"; new "Transparent clip" Library type and Flows node | Video Background Remover, plugin alpha; no soft-edge claim | High |
| 2 | Layout-To-Render (LTX-2.5) | Engine for "3D studio" and "3D scene" | 3D Jutsu (Seedance 2.5) | High |
| 3 | Cinemagraph (LTX-2.5) | New Cinema format "Cinemagraph"; upgrade "Looping background" | None | High |
| 4 | 360 Orbit, ORB360 CardSpin (H3) | Upgrade "360 orbit", "Bullet time", "Product spin", "Frozen product scene"; new "Photo card spin" | 360 Orbit preset, 3D Rotation app | High |
| 5 | Turnaround (H3) | Upgrade "Character sheet" and "Character" | None | Medium |
| 6 | Character Sheet Edit (Qwen-Image 2.1), CharacterSheet, Design Sheet (Z-Image Turbo) | Upgrade "Character sheet"; new "Character design sheet" | None | High |
| 7 | VR180 SBS, Real Stereo Depth (H3) | New page "VR and 3D": "VR180 clip", "3D photo" | None | Medium |
| 8 | 360 Degree (FLUX 3 Klein), ERP outpaint | New "360 panorama"; feeds "Explorable world" | Image extender "make panoramas" | High |
| 9 | equi360 (H3), Seamless-Equirectangular (LTX-2.3) | New "360 video" | None | Low to medium |
| 10 | LTX Ripple, EditAnything (LTX-2.5) | Upgrade "Edit a video by text", "Swap an element"; Flows "Ripple to video" | Edit Video (Kling 3.0 Omni Edit) | Medium |
| 11 | Day-To-Night (LTX-2.5) | New Video edits "Day to night", "Twilight tour" | Only as a partner-model instruction | High |
| 12 | Cameraman v2 (LTX-2.3) | New "Copy a camera move"; "Clone an edit" | None (Motion Control copies character motion) | Medium |
| 13 | Pixel sprite sheet (Qwen-Edit 2511), Lah sheet, 2×2 sheet | New page "Game assets" | Pixel Game app (video only) | Medium |
| 14 | Pixel animate (Wan 2.2) | "Animate a sprite"; upgrade "8-bit runner" | Pixel Game app | Medium |
| 15 | PixelSmile (Qwen-Edit 2511) | "Expression" slider in Character tools | None found | Medium to high |
| 16 | AnyPose (Qwen-Edit 2511) | "Pose like this photo" in "Character in any scene", "Virtual stylist" | None found | High |
| 17 | Audio-reactive (LTX-2.3) | New "Music visualizer" | None (beat-cut apps only) | Medium |
| 18 | Ghost mannequin, try-off (FLUX.2 Klein), Extract Product Image | New Ads "Garment packshot" | None | Medium |
| 19 | Ref2Font (FLUX.2 Klein), Qwen-Image 2.1 Font, Logo.Redmond | New "Make a font"; upgrade "Logo" | Brand Kit stores fonts only | Medium |
| 20 | Stylized Textures (Z-Image Turbo), albedo, material preview | "Seamless texture" on Game assets; Flows "Albedo map" | None | Medium |
| 21 | Restore, Colorization (LTX-2.5) | New Enhance "Restore old video" | Photo restore only | High |
| 22 | Optical Illusion (Qwen-Image 2.1, H3) | New "Hidden image", "Hidden logo" | None | Medium |
| 23 | Character Swap (H3) | Upgrade "Video character swap" | Recast | High |
| 24 | CrossView Warp (H3) | Upgrade "Re-shoot from a new angle" | Angles 2.0 (image only) | Medium to high |
| 25 | Ingredients (LTX-2.5) | Upgrade "Multi-shot scene", Cinema elements | Cinema Studio 3.0, 9 references | High |
| 26 | Water-Simulation, ainvfx-fluid (LTX-2.5) | Flows "Paint VFX"; upgrade "Flood", "Set on fire" | Fixed effect presets | Medium |
| 27 | Keyframe Animation (H3) | Upgrade "Animation", "Sketch to video" | None | Medium |
| 28 | Next-Scene (Qwen-Image 2.1), sbgrid, StoryFlow | Upgrade "What happens next", "Storyboard" | What's Next? | High |
| 29 | Manga Colorizer (Qwen-Image 2.1) | New "Color a manga page" | Prompt-only colorize | Medium |
| 30 | Sun Direction (FLUX.2 Klein), AnyLight (Qwen-Edit 2511) | Upgrade "Move the light", Relight | Relight | Medium |
| 31 | AnyAngle (Qwen-Image 2.1), Gaussian-Splash | Upgrade "Any angle" with a 3D camera picker | Angles 2.0 | Medium |
| 32 | Krea 2 Identity Edit | Upgrade "Character in any scene", "AI influencer post" | Soul ID | High (license blocker) |
| 33 | Try-on (FLUX.2 Klein), Garments2Look (Qwen-Image 2.1) | Replace "Outfit swap" (FASHN via fal) | Outfit Swap, Virtual Try On presets | Medium |
| 34 | SDR-To-HDR (LTX-2.5), LumiPic | "HDR master" on upscalers | None | High |
| 35 | Foley V2A, DubIt (LTX-2.3) | Upgrade "Add sound to video", "Dub into another language" | No foley tool; Translate | Medium |
| 36 | Slow-Motion Control (LTX-2.5) | Upgrade "Slow motion" | Speed ramps | Medium |
| 37 | XPLDV (LTX-2.5) | New Ads "Exploded view" | Exploded View preset | Low to medium |
| 38 | Person Remover (H3), Obscura Remova, LensRemover | Upgrade "Remove an object from a video" | Prompt edits only | Medium |
| 39 | Schematic, Marigold v2, TransNormal-2 | Flows "Depth map", "Normal map", "Pose", "Segment" | None | Medium |
| 40 | H3-World (H3) | Upgrade "Explorable world" | None | Low |

- A "Game assets" tool page (ranks 13, 14, 20, plus MCSkin) and a "VR and 3D" page (ranks 7, 8, 9) are the two clearest whole new product features; each mirrors Higgsfield's page structure while covering ground Higgsfield does not.
- For the contest window, ranks 1, 2, 3, 4, 11 and 21 are the cheapest wins: official or well-documented LoRAs on bases already wired (LTX-2.5, MiniMax H3), each mapping onto one existing page.

### Gaps

- The Higgsfield comparison is a keyword search of the audit; a Higgsfield feature under a different name could be missed (for example a pose-copy option inside Fashion Factory templates).
- I did not check prices or credit costs on the Higgsfield side for the features I list as parity.
- License terms were recorded as tags only; I did not read the LTX-2 community license or the MiniMax Community License text.
