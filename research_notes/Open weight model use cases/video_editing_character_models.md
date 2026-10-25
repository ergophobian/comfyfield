# Open-weight video editing, character and enhance models: real use cases (October 2026)

Scope: Wan Animate 2, SCAIL-2, Bernini-R (+ BFS head swap), VOID, ReCamMaster, InfiniteTalk, SeedVR2. Extends sections 5, 8 and 9 of `research_notes/model-strengths-and-mapping.md`; facts already there (file sizes, ComfyField graph names, Cloud status) are not repeated.

Method note: researched 2026-10-25 with web search and page fetches. Reddit, X and YouTube view counts did not come back in any search (site-restricted Reddit queries returned no threads), and Civitai returned HTTP 403. So community sentiment comes mostly from blogs, hands-on posts, Hugging Face (HF) pages and vendor pages. Vendor claims are marked *(vendor claim)*.

## 1. What do people make and post with each model, and who makes it?

### Takeaway
The character models (Wan Animate 2, SCAIL-2) are used for dance and motion remixes and for swapping a person in a filmed clip; Bernini-R is used for instruction edits (outfit, hair, season, background) and restyles; InfiniteTalk for dubbing and podcast-style avatars; SeedVR2 for upscaling old family and phone footage. VOID and ReCamMaster have almost no evidence of creator posts yet; their visible use is demos and VFX prototyping.

### Cited Findings

**Wan Animate 2 (motion transfer)**
- Released 7 August 2026 (inference scripts, Base and Distillation weights); paper arXiv 2608.06009 dated 8 August. Distinct from the September 2025 Wan 2.2 Animate — sites mix the names — [HF model card](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B); [search summary of naming confusion, voor.ai](https://voor.ai/wan-animate/)
- Claimed uses: animate a reference image from a driving video with no pose extractor; text-driven viewpoint control that decouples the output camera from the driving video; a "Lite" real-time streaming variant that is announced but not in the download links *(vendor claim)* — [HF model card](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B)
- Comfy markets it as "the new state of the art model for character animation": a reference image plus a motion video, three steps, runs on Comfy Cloud, Desktop or the Developer Platform API *(vendor claim)* — [comfy.org/wan-animate-2](https://comfy.org/wan-animate-2/)
- Comfy-Org repackaged the weights for ComfyUI — [HF Comfy-Org/Wan-Animate-2](https://huggingface.co/Comfy-Org/Wan-Animate-2)
- The predecessor (Wan 2.2 Animate) was promoted on TikTok by marketers as "Character Swap replaces any character in existing videos with YOU", matching lighting and colour — this sets the expected use: put yourself or your character into a viral clip — [TikTok @adamstewartmarketing](https://www.tiktok.com/@adamstewartmarketing/video/7553913072746892552)

**SCAIL-2 (character swap in a filmed scene)**
- Paper published 9 June 2026; core ComfyUI nodes (`WanSCAILToVideo`, `SCAIL2ColoredMask`) merged June 2026; official template `video_wan21_scail2_character_replacement` — [comfyui-wiki news 2026-06-09](https://comfyui-wiki.com/en/news/2026-06-09-scail-2-character-animation); [Comfy docs tutorial](https://docs.comfy.org/tutorials/video/zai/scail2)
- One boolean `replace_mode` switches between replacement (person swapped inside the filmed scene) and animation (reference character performs the motion) — [Comfy docs](https://docs.comfy.org/tutorials/video/zai/scail2)
- Claimed uses on the HF card: animation from a driving video, cross-identity replacement, multi-character scenes, animal driving, and SAM3D-Body mesh as a control *(vendor claim)*. One community Space is named "scail2-full-dance" — [HF zai-org/SCAIL-2](https://huggingface.co/zai-org/SCAIL-2)
- RunComfy hosts a "SCAIL 2 multi-role reference action transfer" workflow (coordinated motion for several characters) — [RunComfy](https://www.runcomfy.com/comfyui-workflows/scail-2-multi-role-reference-action-transfer-in-comfyui-coordinated-motion-transfer)
- Hands-on test (3 July 2026): a boxer in a gym clip replaced by a streetwear character; gym, framing, walk and punch motion kept; author names content creation and VFX prototyping as targets — [comfylab.dev](https://comfylab.dev/blog/workflows/scail-2-character-replacement-comfyui-workflow/)
- A Civitai workflow "SCAIL2 – Long videos + High-res fix + NVIDIA VSR + Interpolation" exists, which shows users chain segments, upscale and interpolate to get postable length (page content not readable, 403) — [Civitai](https://civitai.com/models/2704602/scail2-long-videos-high-res-fix-nvidia-vsr-interpolation)

**Bernini-R (video restyle and edit)**
- Official Comfy docs list v2v restyling and reference-guided editing such as relighting and subject insertion — [Comfy docs Bernini-R](https://docs.comfy.org/tutorials/video/bytedance/bernini-r)
- Hands-on test (23 July 2026, 1.3B vs 14B): the four edits a user chose were season/lighting restyle, outfit swap, local hair recolour and background replacement — [note.com, Kamimoto](https://note.com/sepiablue/n/n8e868c192702?hl=en)
- The community 1.3B bundle is "close to the 14B on simpler edits (style transfer, watermark/subtitle removal, local editing)" — which shows watermark and subtitle removal is a use people want from it — [HF neuregex/Bernini-1.3B-ComfyUI](https://huggingface.co/neuregex/Bernini-1.3B-ComfyUI)
- Community tooling that signals real demand: a prompt-helper node with presets and Ollama/vLLM enhancement (ComfyUI-BerniniStudio), and a chunked long-video pack for edits up to 30 s (experimental, "GPU validation pending") — [CCpt5/ComfyUI-BerniniStudio](https://github.com/CCpt5/ComfyUI-BerniniStudio); [DrakenDrop/ComfyUI-Bernini-LongVideo](https://github.com/DrakenDrop/ComfyUI-Bernini-LongVideo)
- YouTube tutorial "Bernini-R ComfyUI Workflow: Precise Video Editing & Subject Swaps" (view count not retrieved) — [YouTube](https://www.youtube.com/watch?v=3-fVYx3Vc-s)

**BFS head swap (Alissonerdx)**
- The BFS family covers face, head and body swaps on Qwen Image 2.1, Qwen-Image-Edit 2509/2511, FLUX 2 Klein, Krea 2 and LTX-2; the video repo lists LTX-2.3 as base, plus LTX-2.5 LoRAs. No Bernini variant was found on the public pages fetched — [HF BFS-Best-Face-Swap](https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap); [HF BFS-Best-Face-Swap-Video](https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video)
- Users post consistent face-plus-hair swaps; a Patreon creator ships a free "BFS Character Swap LoRA & Qwen-Image 2.1" workflow (Turbo update 13 Oct 2026); a YouTube tutorial shows "LTX-2.3 Head Swap on 8GB VRAM" — [Patreon TheLocalLab](https://www.patreon.com/TheLocalLab/posts/free-bfs-swap-2-170951104); [YouTube](https://www.youtube.com/watch?v=MjAd46x1DP4)

**VOID (Netflix, object removal)**
- Released early April 2026 on HF and GitHub; launch demos: remove one car from a head-on collision and the other car drives on with no debris; remove a diver and the pool stays still — [resultsense](https://www.resultsense.com/news/2026-04-06-netflix-void-video-object-removal-model/); [gHacks](https://www.ghacks.net/2026/04/04/netflix-introduces-void-ai-model-for-editing-video-scenes-without-reshooting/)
- Framed as "editing scenes without reshooting" (post-production fix) — [gHacks](https://www.ghacks.net/2026/04/04/netflix-introduces-void-ai-model-for-editing-video-scenes-without-reshooting/); [Forbes](https://www.forbes.com/sites/jonmarkman/2026/04/07/netflix-launches-void-ai-that-rewrites-video-scenes-after-filming/)
- A Comfy workflow page lets users pick what to erase by a text cue (T5-XXL), a hand-drawn mask, or both; a community node pack exists — [comfy.org workflow](https://comfy.org/workflows/fa1f01a51d17-fa1f01a51d17/); [jaskirat05/ComfyUI-NetflixVoid](https://github.com/jaskirat05/ComfyUI-NetflixVoid)
- No source tested text or watermark removal with VOID — [search result summary; no source found]

**ReCamMaster (new camera path)**
- Official uses: re-capture in-the-wild videos along a new camera path, ten fixed presets (pan, tilt, zoom, translate, arc), multi-camera and 4D research. The repo does not mention ComfyUI — [GitHub KlingAIResearch/ReCamMaster](https://github.com/KlingAIResearch/ReCamMaster)
- ThinkDiffusion pitches it as "pro-level camera moves easy for everyone" — [ThinkDiffusion](https://learn.thinkdiffusion.com/how-recammaster-makes-pro-level-camera-moves-easy-for-everyone/)

**InfiniteTalk (talking heads and lipsync)**
- HF card uses: sparse-frame video dubbing (lips, head, posture, expression), infinite-length video, image+audio to video — [HF MeiGen-AI/InfiniteTalk](https://huggingface.co/MeiGen-AI/InfiniteTalk)
- Hosted listings name podcast visualisation and a two-person dialogue mode; claim up to 10 min at 480p/720p *(vendor/reseller claim)* — [WaveSpeedAI](https://wavespeed.ai/models/wavespeed-ai/infinitetalk); [infinitetalk.net](https://www.infinitetalk.net/ai-lipsync)
- Users stack it on other long-video models: a community user refined lip alignment with InfiniteTalk on top of Stable Video Infinity output — [Stable-Video-Infinity README](https://github.com/vita-epfl/Stable-Video-Infinity)

**SeedVR2 (upscale and restore)**
- Target footage named by guides: compressed 2014 phone clips, soft camcorder transfers, scanned VHS with tracking lines and colour drift, 300 DPI photo scans (vendor-authored, 18 Oct 2026) — [seedvr2.net](https://seedvr2.net/blog/seedvr2-vs-topaz-old-family-videos-2026)
- Comfy's own upscaling guide frames it as faithful restoration that avoids exaggerated features — [Comfy docs video upscale](https://docs.comfy.org/tutorials/utility/video-upscale)
- Offered as a model inside commercial platforms next to Topaz and Runway (Scenario) — [Scenario help](https://help.scenario.com/en/articles/enhance-videos-in-scenario/)
- Also used as the finishing pass after character models (see the SCAIL2 "high-res fix" workflow) — [Civitai](https://civitai.com/models/2704602/scail2-long-videos-high-res-fix-nvidia-vsr-interpolation)

### Inferences
- Who makes what (inferred from the use cases above, not from creator surveys): dance and trend remixers and AI-influencer accounts use Wan Animate 2 and SCAIL-2; UGC ad makers and marketers use Wan Animate "put yourself in the clip" and BFS face/head swaps; dubbing and podcast/explainer channels use InfiniteTalk; hobby filmmakers and VFX prototypers use SCAIL-2 replacement, Bernini-R and VOID; families and archivists use SeedVR2.
- SCAIL-2 and Wan Animate 2 overlap heavily. SCAIL-2 is the one with "replace" built in, multi-character support and a core template, which suits the "swap a person in a filmed scene" job. Wan Animate 2's new edge is text camera control.
- Watermark and subtitle removal is a real demand on Bernini-R, so ComfyField's `video-remove-text` could route to Bernini-R if VOID fails on text.
- ReCamMaster has the weakest creator footprint of the set; it is a research baseline more than a creator tool.

### Gaps
- No Reddit, X or TikTok posts were retrievable, so the share of "dance remix" vs "film clip swap" vs "ad" content is unknown.
- No source showed a VTuber workflow on any of these models.
- No creator posts using VOID or ReCamMaster output in published work were found.
- No public BFS head-swap LoRA for Bernini-R was found on the BFS HF pages fetched; ComfyField's section 5 entry may point to a file not on those pages. Check the exact repo the Pod pins.

## 2. Volume signals

### Takeaway
SeedVR2 is by far the most downloaded (about 659k a month for one ComfyUI repack), then InfiniteTalk (about 62k a month). The 2026 character models have modest numbers: SCAIL-2 about 5.3k a month, Wan Animate 2 untracked, BFS video 478 a month. Comfy template run counts were not public in any page found.

### Cited Findings
- SeedVR2 ComfyUI repack (numz/SeedVR2_comfyUI): 659,024 downloads last month, 327 likes; 3B and 7B in FP16, FP8, GGUF Q4/Q8; last dated changelog 2025-11-09 (v2.5.5) — [HF numz/SeedVR2_comfyUI](https://huggingface.co/numz/SeedVR2_comfyUI)
- InfiniteTalk: 62,203 downloads last month, 246 likes, 2 quantisations, 17+ Spaces listed (plus more), 9 discussions — [HF MeiGen-AI/InfiniteTalk](https://huggingface.co/MeiGen-AI/InfiniteTalk)
- SCAIL-2: 5,328 downloads last month, 348 likes, 3 quantisations, 5 finetunes, 1 adapter, 6+ Spaces — [HF zai-org/SCAIL-2](https://huggingface.co/zai-org/SCAIL-2)
- Wan Animate 2 (Wan2.2-Animate-2-14B): "Downloads are not tracked"; 359 likes, 1 finetune, 3 quantisations, 13 discussions — [HF](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B). Most ComfyUI users likely download the Comfy-Org repack instead (its count not retrieved) — [HF Comfy-Org/Wan-Animate-2](https://huggingface.co/Comfy-Org/Wan-Animate-2)
- BFS-Best-Face-Swap-Video: 478 downloads last month, 470 likes, 28 discussions — [HF](https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video)
- ReCamMaster GitHub: 1.9k stars, 98 forks, 68 open issues; last dated news 2025-04-15 (old, no 2026 activity shown) — [GitHub](https://github.com/KlingAIResearch/ReCamMaster)
- VOID got mainstream press coverage at launch (TechSpot, eWeek, Forbes, MarkTechPost; April 2026, older than the focus window) — [TechSpot](https://www.techspot.com/news/111966-netflix-void-ai-model-removes-objects-videos-predicts.html); [Forbes](https://www.forbes.com/sites/jonmarkman/2026/04/07/netflix-launches-void-ai-that-rewrites-video-scenes-after-filming/); [MarkTechPost](https://www.marktechpost.com/2026/04/04/netflix-ai-team-just-open-sourced-void-an-ai-model-that-erases-objects-from-videos-physics-and-all/)
- Bernini-R ecosystem breadth: native Comfy nodes, at least three community packs (neuregex, BerniniStudio, LongVideo), a 1.3B community distil, Japanese hands-on blogs — [Comfy docs](https://docs.comfy.org/tutorials/video/bytedance/bernini-r); [neuregex/ComfyUI-BerniniR](https://github.com/neuregex/ComfyUI-BerniniR); [note.com kongo_jun](https://note.com/kongo_jun/n/nf21b451aaf1c?hl=en)
- SCAIL-2 ecosystem breadth: core template, at least five third-party guides (InstaSD, nomadoor, earngenix, comfylab, RunComfy), an "Easy" node pack and a Civitai long-video workflow — [InstaSD](https://www.instasd.com/post/scail-2-comfyui-character-animation-replacement); [RunComfy Easy nodes](https://www.runcomfy.com/comfyui-nodes/ComfyUI-SCAIL2-Easy); [nomadoor](https://comfyui.nomadoor.net/en/basic-workflows/scail-2/)

### Inferences
- HF downloads understate the native-template models (SCAIL-2, Wan Animate 2, Bernini-R, VOID) because ComfyUI users pull the Comfy-Org repacks and Comfy Cloud users download nothing.
- SeedVR2 and InfiniteTalk numbers reflect a year-plus of use and API resale; they are the "evergreen" utilities. The 2026 character models are still in the early-adopter phase.
- SCAIL-2 has more third-party guides than Wan Animate 2 despite releasing two months earlier; that suggests the "replace a person" job draws more interest than plain animation.

### Gaps
- Comfy template run counts, Comfy Cloud usage, YouTube views, Civitai downloads and Reddit upvotes: none retrievable.
- Downloads for the Comfy-Org repacks (Wan Animate 2, SCAIL-2, Bernini-R, VOID) not fetched.
- VOID HF download count not fetched.

## 3. Comparisons with closed tools

### Takeaway
Head-to-head evidence is almost all vendor-authored. SCAIL-2's paper claims it beats Wan-Animate and is close to Kling 3.0 Motion Control; VOID's paper claims a 64.8% vs 18.4% preference over Runway; SeedVR2 vs Topaz is "close on general footage, Topaz better on badly degraded archive". No independent test against Higgsfield Recast, HeyGen or Runway Aleph was found.

### Cited Findings
- SCAIL-2 paper: blind human ratings favour SCAIL-2 over Wan-Animate on cross-identity dance (higher imaging quality and appearance consistency, temporal consistency only slightly higher); single-character results "close to Kling 3.0 Motion Control" *(vendor claim)* — [arXiv 2606.10804](https://arxiv.org/html/2606.10804v3); [project page](https://teal024.github.io/SCAIL-2/)
- Wan Animate 2 is reported as beating "proprietary platforms" without a skeleton *(press framing of vendor claims)*; the HF card itself shows no closed-tool comparison — [AlphaSignal](https://alphasignal.ai/news/alibaba-s-wan-animate-2-beats-proprietary-platforms-without-a-single-skeleton); [HF](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B)
- Older comparison (Kling 2.6 vs Wan 2.2 Animate, not the 2026 models): Kling is "motion-first", Wan better at character-and-scene integration; Kling's own benchmarks claim large wins *(vendor claim)* — [WanVideoGenerator](https://wanvideogenerator.com/blog/ai-motion-control-kling26-vs-wan22-animate); [MindStudio](https://www.mindstudio.ai/blog/what-is-kling-2-6-pro-motion-control-video)
- VOID: 25-reviewer study, VOID preferred 64.8% vs Runway 18.4%; preprint not peer reviewed *(vendor claim)* — [resultsense](https://www.resultsense.com/news/2026-04-06-netflix-void-video-object-removal-model/); [arXiv 2604.02296](https://arxiv.org/pdf/2604.02296)
- SeedVR2 vs Topaz: one hands-on found both keep fine texture, Topaz smoother and sometimes softer; another found SeedVR2 recovered slightly more detail on one clip; Topaz favoured on badly degraded archive footage (Starlight; Dione for interlaced; VHS and grain presets) and on ease of use. Several sources are SeedVR2 hosts, so biased — [WaveSpeed](https://wavespeed.ai/blog/posts/seedvr2-vs-topaz/); [Fora Soft](https://www.forasoft.com/blog/article/ai-video-enhancement-tools); [seedvr2.net](https://seedvr2.net/seedvr2-vs-topaz)
- SeedVR2 cost on a host: a 30 s clip is about $6.30 at 1080p and about $23.10 at 4K; Topaz is a licence with no per-job meter (vendor page) — [seedvr2.net](https://seedvr2.net/blog/seedvr2-vs-topaz-old-family-videos-2026)
- Bernini-R: the authors' blind arena puts it in the "first tier" of closed editors (already in section 5); no independent Runway Aleph comparison found — [Comfy docs](https://docs.comfy.org/tutorials/video/bytedance/bernini-r)
- ReCamMaster: the open-source Wan2.1 1.3B release "may not achieve the same performance" as the paper's model; the authors offer their best version only via an upload link — [GitHub](https://github.com/KlingAIResearch/ReCamMaster)

### Inferences
- ComfyField's "open answer to X" pairs hold on paper: SCAIL-2 ↔ Higgsfield Recast / Kling Motion Control, VOID ↔ Runway object removal, SeedVR2 ↔ Topaz. Users will judge them on the closed tools' ease of use, not only quality.
- For old family video, SeedVR2 alone is not the full job; a restore flow needs deinterlace, denoise and colour steps before it (Topaz bundles these).
- ReCamMaster's open weights are a weaker cut than the paper; marketing it as matching closed re-angle tools would overclaim.

### Gaps
- No independent test of any of these against Higgsfield Recast, HeyGen, Runway Aleph or Kling 3.0.
- No InfiniteTalk vs HeyGen/Hedra comparison found.

## 4. Top complaints and workflow pain points

### Takeaway
The common pains are short segments (81 frames) that need chaining with visible seams, 24 GB VRAM and multi-minute renders per clip, identity leakage and drift, hand and occlusion failures, and setup friction (filename mismatches, community-only packs, dependency conflicts, masks). Diffusion upscalers can change faces.

### Cited Findings

**Length and seams**
- SCAIL-2: 81 frames per Base segment; Extend subgraph uses 76-frame segments with 5-frame anchors; the tester did not check seams — [comfylab.dev](https://comfylab.dev/blog/workflows/scail-2-character-replacement-comfyui-workflow/); [Comfy docs](https://docs.comfy.org/tutorials/video/zai/scail2)
- Bernini-R long edits need a third-party chunking pack, still experimental — [DrakenDrop/ComfyUI-Bernini-LongVideo](https://github.com/DrakenDrop/ComfyUI-Bernini-LongVideo)
- Wan Animate (2.2 era): "sliding window of 81 frames at least" recommended for continuity — [search summary, Wan2GP defaults](https://huggingface.co/vidfom/ltx2/blob/main/Wan2GP/defaults/animate.json)
- VOID: default 384×672, max 197 frames — [HF void-model README](https://huggingface.co/netflix/void-model/blob/main/README.md)
- ReCamMaster: input needs at least 81 frames; trained at 480×832; ten fixed camera presets only — [GitHub](https://github.com/KlingAIResearch/ReCamMaster)

**VRAM and speed**
- SCAIL-2 on RTX 3090: peak under 24 GB, 22 GB of 32 GB system RAM, 571 s for one 81-frame segment at 896×512 — [comfylab.dev](https://comfylab.dev/blog/workflows/scail-2-character-replacement-comfyui-workflow/)
- Bernini-R 14B GGUF Q4 on 12 GB: about 430 s per 25-frame edit at 384×672, spills to RAM, "a configuration on the edge"; 1.3B about 66 s at 10 GB; "trial-and-error rerolling is impractical with 14B"; bf16 14B is about 126 GB — [note.com Kamimoto](https://note.com/sepiablue/n/n8e868c192702?hl=en)
- Wan Animate 2 official defaults are tuned for 8× A800; 480p tested on 2× A800; no VRAM figure published — [HF](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B)
- VOID: model card says 40 GB+ (A100); unverified secondary figures: about 18 GB at 384×672×49 frames, about 32 GB at 512×896×49, about 40 GB at 197 frames — [HF README](https://huggingface.co/netflix/void-model/blob/main/README.md); [explainx.ai](https://explainx.ai/blog/netflix-void-model-video-object-deletion-hugging-face)
- ReCamMaster's frame concatenation doubles the input tokens, so compute rises — [paper notes](https://en.papernotes.org/ICCV2025/video_generation/recammaster_camera-controlled_generative_rendering_from_a_single_video/)
- SeedVR2: one roundup says self-hosting "wants H100-class GPUs"; the repack offers GGUF, BlockSwap and VAE tiling for low VRAM; VAE encode/decode is a bottleneck at high resolution; batch must be 4n+1 — [Fora Soft](https://www.forasoft.com/blog/article/ai-video-enhancement-tools); [HF numz](https://huggingface.co/numz/SeedVR2_comfyUI)

**Identity drift, hands and quality failures**
- Wan Animate replacement failure modes listed by a ComfyUI guide: identity drift, deforming hands, sliding feet, face and lip issues, clothing changes, flickering backgrounds, scale changes; replacement is harder because it must keep camera, background, occlusion and lighting — [media.io guide](https://www.media.io/video-tips/wan-2-2-animate.html); [animatephotoai](https://animatephotoai.com/wan-2-2-animate-replace)
- Fast hands, crossed limbs and props crossing the body are hard first tests for any replacement model; upscaling cannot fix an extra hand — [deAPI](https://deapi.ai/blog/wan-2-2-animate-ai-character-replacement-in-video-via-api); [imagine.art](https://www.imagine.art/blogs/wan-2-2-overview)
- BFS video head swap: identity leakage (guide hair returns), hard cuts reset identity, portrait and wide shots are worse, detailed prompts have no effect (V1); the guide face must be fully covered by a magenta mask (V2); a second pass "may alter identity" — [HF BFS-Best-Face-Swap-Video](https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video)
- Bernini-R over-edits: 1.3B replaced a whole indoor scene with snow for a "winter" prompt; 14B put snow indoors; the tie stayed over the swapped sweater; red hair colour bled onto the jacket — [note.com Kamimoto](https://note.com/sepiablue/n/n8e868c192702?hl=en)
- ReCamMaster inherits poor hand quality from its base T2V model — [paper notes](https://en.papernotes.org/ICCV2025/video_generation/recammaster_camera-controlled_generative_rendering_from_a_single_video/)
- SeedVR2 can sharpen a face while changing its features (nose shape, eye spacing); "neither upscaler is a restoration suite" — [seedvr2.net](https://seedvr2.net/blog/seedvr2-vs-topaz-old-family-videos-2026)
- InfiniteTalk claims "unlimited duration" but publishes no tested maximum or drift figure; it claims less hand/body distortion than MultiTalk *(vendor claim)* — [HF](https://huggingface.co/MeiGen-AI/InfiniteTalk)

**Setup pain**
- SCAIL-2 template: two filename mismatches (VAE name, LoRA subfolder) blocked runs until fixed by hand; "Value not in list" errors; "Could not load subgraphs" toast; needs about 21.4 GB of new downloads and ComfyUI PR #14373 — [comfylab.dev](https://comfylab.dev/blog/workflows/scail-2-character-replacement-comfyui-workflow/); [search summary of guides](https://www.earngenix.com/workflows/scail-2-character-replacement-comfyui)
- SCAIL-2 masks: replacement needs a white driving-mask background, animation needs black; guides advise testing animation mode first to validate masks — [Comfy docs](https://docs.comfy.org/tutorials/video/zai/scail2); [InstaSD](https://www.instasd.com/post/scail-2-comfyui-character-animation-replacement)
- Bernini-R community route: GGUF text encoder needs a newer protobuf that can break other nodes; sample workflows in UI format needed conversion; the loader took only webp/gif, not MP4 — [note.com Kamimoto](https://note.com/sepiablue/n/n8e868c192702?hl=en)
- VOID community node: no fallback for missing checkpoint, VAE or text-encoder paths — [jaskirat05/ComfyUI-NetflixVoid](https://github.com/jaskirat05/ComfyUI-NetflixVoid)
- Wan Animate 2: an LLM captioning step is recommended before inference — [HF](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B)
- SeedVR2 repack: licence conflict on the page (metadata Apache-2.0, README says MIT); config.json parse warning — [HF numz](https://huggingface.co/numz/SeedVR2_comfyUI)

### Inferences
- The pains ComfyField can remove for users: segment chaining (do Extend automatically and hide seams), mask setup (auto SAM 3.1 with the right white/black background per mode), filename and pack drift (pinned files), and a cheap preview pass before a slow full render (for example Bernini-R 1.3B or a short segment first).
- Any "replace" or head-swap page should warn users about fast hands, crossed limbs, hard cuts and portrait framing, and should default to landscape close-ups for BFS.
- SeedVR2 on faces needs a "faithful" default and a side-by-side compare, since face changes are the top family-video risk.

### Gaps
- No user complaints from Reddit or GitHub issues for Wan Animate 2 or SCAIL-2 were retrievable; complaints above come from guides and single hands-on tests.
- No measured InfiniteTalk drift, lipsync accuracy or speed data from users in August-October 2026.
- No VOID quality reports from users beyond launch demos.
