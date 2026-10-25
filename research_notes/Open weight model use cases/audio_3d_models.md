# Open-weight audio and 3D models: real use cases (October 2026)

Scope: Chatterbox Multilingual / VC, Fish Audio Drama 3, Qwen3-TTS, MiniMax Music 3, Stable Audio 3 Medium, HunyuanVideo-Foley, TRELLIS.2. Extends `research_notes/model-strengths-and-mapping.md` sections 7 and 10; it does not repeat them.

Method note: web search reached vendor pages, reviews, Hugging Face (HF) cards and GitHub. It did **not** surface any Reddit thread, YouTube video, X post or Comfy template run count directly, so community evidence is thin and mostly second-hand (quoted in reviews). Research date: 2026-10-25.

## 1. TTS and voice: what people make, and which model wins for what

### Takeaway
The open TTS field splits by job: Chatterbox is the mass-market "clone a voice, make a voiceover or meme" model (largest ecosystem, MIT); Qwen3-TTS is the tinkerer's audiobook and podcast engine (Apache, 3 s cloning, many local apps); Fish Audio Drama 3 is the quality pick for acted, multi-character scripts (audio drama, games, short video) but is heavy and licence-capped. No source showed VTubing as a real use for any of them.

### Cited Findings
**Chatterbox (Resemble AI)**
- HF card lists its own uses as "memes, videos, games, and AI agents", plus localization and cross-language voice cloning. 23 languages in Multilingual; six community single-language finetunes (Chinese, LatAm Spanish, Brazilian Portuguese, Spain Spanish, Portugal Portuguese, Hindi) — [HF ResembleAI/chatterbox](https://huggingface.co/ResembleAI/chatterbox)
- Hosted resellers market it for podcasts, audiobooks, video narration and explainers (vendor claim) — [Segmind](https://www.segmind.com/models/chatterbox-tts)
- Community audiobook tooling exists: a Chatterbox TTS server that renders a whole book into one audio file, and an MLX-Audio guide that builds `.m4b` audiobooks with chapter markers — [GitHub Chatterbox-TTS-Server-mt](https://github.com/BrunBrand/Chatterbox-TTS-Server-mt); [mybyways](https://mybyways.com/blog/chatterbox-turbo-tts-with-mlx-audio/)
- Chatterbox Turbo (350M) claims up to 6x real time and sub-200 ms latency (vendor/reseller claim), which points at agents and live use — [tts.ai](https://tts.ai/voices/chatterbox-turbo-default/); [mybyways](https://mybyways.com/blog/chatterbox-turbo-tts-with-mlx-audio/)
- Outputs carry an inaudible watermark — [Segmind](https://www.segmind.com/models/chatterbox-tts)
- No source found on Chatterbox VC usage specifically (see Gaps).

**Fish Audio Drama 3**
- Released as open weights 13 Oct 2026 (API preview "drama-3-preview" from 23 Sep). 35B MoE, about 3B active — [eesel](https://www.eesel.ai/blog/fish-audio-drama-3); [MarkTechPost](https://www.marktechpost.com/2026/10/14/fish-audio-drama-3-open-weight-tts-model/)
- Reviewer-listed uses: audiobooks and audio drama (directions in the script, multi-character scenes in one pass, up to 16 characters); games and animation (per-line direction replaces re-recording); short video (the web app's "Auto Tag" writes first-draft directions) — [eesel review](https://www.eesel.ai/blog/fish-audio-drama-3-review)
- Good fit: "scripted lines you render once and keep". Poor fit: live voice at volume (takes vary), plain narration (the cheaper S2.1 Pro does it), and companies over the revenue cap — [eesel review](https://www.eesel.ai/blog/fish-audio-drama-3-review)
- Its clearest measured win is pronunciation: AA Pronunciation Robustness 93.2% vs Eleven v4 91.7%; best for scripts "full of brand names, codes and numbers" — [eesel review](https://www.eesel.ai/blog/fish-audio-drama-3-review); [orcarouter](https://www.orcarouter.ai/blog/fish-audio-drama-3-tops-open-weights-speech-arena)
- Voice preference: #10 on AA Provider Voice arena (Elo 1,243 over 1,857 matchups), #14 on Controlled Voice (Elo 1,058); #1 open on all three AA TTS boards. "Most emotive" is a vendor claim with no independent ranking behind it — [eesel review](https://www.eesel.ai/blog/fish-audio-drama-3-review)
- Cost reference for audiobook makers: a 90,000-word novel is about 500k characters, about $5 at the launch API price, $25 at list ($10/M chars reverts to $50 after 12 Nov) — [eesel review](https://www.eesel.ai/blog/fish-audio-drama-3-review)

**Qwen3-TTS (Alibaba)**
- Local audiobook and podcast apps are the visible use: Qwen3-Audiobook-Converter (PDF/EPUB/DOCX/TXT to audiobook, about 1,200-word chunks, clone from a reference WAV); MimikaStudio (macOS, 3 s clone, chapter queue, voice presets); qwen3-TTS-studio ("ElevenLabs-style voice cloning + NotebookLM-style podcast generation, but local"); Audify (EPUB CLI with preset voices) — [sourcepulse](https://www.sourcepulse.org/projects/23447569); [GitHub MimikaStudio](https://github.com/BoltzmannEntropy/MimikaStudio); [disroot thread](https://scribe.disroot.org/comment/9238150); [Audify docs](https://audify.readthedocs.io/en/stable/_sources/quickstart.md.txt)
- CustomVoice: nine built-in voices, instruction-based style control, streaming, latency "as low as 97 ms" (vendor), 10 languages — [HF Qwen3-TTS-12Hz-1.7B-CustomVoice](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)

### Inferences
- Which wins for what:
  - Faceless-channel voiceover and quick clones: Chatterbox (MIT, cheapest to run, biggest ecosystem).
  - Long audiobooks, local and free: Qwen3-TTS (the most audiobook tooling found; Apache).
  - Acted scenes, audio drama, game character lines, number-heavy ad scripts: Drama 3.
  - Dubbing: Chatterbox Multilingual's cross-language cloning is the only explicit dubbing-adjacent claim found; Drama 3's 83 languages may serve it too, but no source showed it.
- For ComfyField, a "voiceover" format should default to Chatterbox, and an "audiobook / audio drama" format should point at Drama 3 with Qwen3-TTS as the light fallback.

### Gaps
- No Reddit, YouTube or X evidence was reachable for any TTS model, so "what people post" rests on tools and reviews, not on counted posts.
- No source on Chatterbox VC usage (voice change on video, singing conversion, VTubing).
- No source found showing VTubing use for any of these models.
- No independent dubbing test (lip timing, cross-language voice retention) for any model.

## 2. Music: songs, background music, covers

### Takeaway
MiniMax Music 3 is the open pick for full songs with lyrics (up to 5 min), and Stable Audio 3 is the pick for instrumental beds, loops and ambience; neither has independent listening tests yet. The MiniMax Music 3 licence is reported two different ways, which ComfyField must settle before shipping.

### Cited Findings
**MiniMax Music 3**
- API release 16 Jul 2026; open weights 13 Aug 2026; complete songs up to 5 min with vocals, arrangement and production in one pass; lyrics with [Verse]/[Chorus] tags (API: 10–1,000 chars); 32 kHz stereo WAV locally — [NYU RITS](https://rits.shanghai.nyu.edu/ai/minimax-opens-music-3-0-weights-no-territorial-carve-out-this-time/)
- Limits: 9,000 acoustic frames ceiling, 5,000-token prompt limit, no streaming; about 57.4 GB weights; README says two CUDA GPUs, HF card says 24 GB+ (8 GB with offload) — the docs disagree — [mer.vin](https://mer.vin/news/minimax-music-3-is-open-weight-but-not-open-for-business/)
- Section tags are "guidance, not guarantees" (README, as quoted); no benchmark vs Suno, Udio, YuE or ACE-Step published — [mer.vin](https://mer.vin/news/minimax-music-3-is-open-weight-but-not-open-for-business/)
- Covers: the cover-song feature is on the hosted API, not the open weights — [mer.vin](https://mer.vin/news/minimax-music-3-is-open-weight-but-not-open-for-business/)
- **Licence conflict:** MiniMax-Music3 Community License (effective 6 Aug 2026), free, firms over $20M yearly revenue need written approval, no territory carve-out, and generated content in public must disclose its machine origin — [NYU RITS](https://rits.shanghai.nyu.edu/ai/minimax-opens-music-3-0-weights-no-territorial-carve-out-this-time/); **contradicted by** a report that the weights are CC BY-NC 4.0, no commercial use — [mer.vin](https://mer.vin/news/minimax-music-3-is-open-weight-but-not-open-for-business/); [opensourceforu](https://www.opensourceforu.com/2026/08/minimax-releases-minimax-music3-open-weight-model/). One report also said the weights were not yet downloadable on 13 Aug — [opensourceforu](https://www.opensourceforu.com/2026/08/minimax-releases-minimax-music3/)

**Stable Audio 3**
- Released 20 May 2026 (older than the focus window). Family: Small SFX (459M, CPU, up to about 2 min), Small Music (459M, CPU), Medium (1.4B, GPU, beyond 6 min; another source says 6 min 20 s), Large (2.7B, not open) — [Dubspot](https://blog.dubspot.com/stable-audio-3-review); [sonicfield](https://sonicfield.org/stable-audio-3)
- Best uses per review: ambient drones, foley and SFX, instrumental loops, atmospheric beds. Suits sound designers, instrumental producers and sketching. "No vocals and no lyrics" — [Dubspot](https://blog.dubspot.com/stable-audio-3-review)
- Medium does inpainting and continuation of short recordings; official ComfyUI templates need ComfyUI 0.22.0+; LoRA fine-tuning for Small and Medium; trained on licensed data (vendor claim) — [Dubspot](https://blog.dubspot.com/stable-audio-3-review); [Comfy docs](https://docs.comfy.org/tutorials/audio/stable-audio/stable-audio-3)
- Hosted text-to-music workflows exist on Floyo — [Floyo](https://www.floyo.ai/workflows/stable-audio-3-for-text-to-music-gykgronrwurk)

### Inferences
- Background music for videos is the job both models can serve; songs with lyrics are MiniMax only.
- Stable Audio 3 **Small SFX** is a dedicated SFX model; the app currently runs SFX on Medium. Small SFX may give better effects and runs on CPU (worth a check).
- The section 7 note "Community licence (free under $20M)" matches RITS; the CC BY-NC reports may describe an earlier or different file. Check the licence file on HF before launch.

### Gaps
- HF page for MiniMax Music 3 returned 401, so no download or like counts.
- No user posts or complaints found for MiniMax Music 3 (no Reddit access).
- No source on AI covers with open weights.

## 3. Sound effects and foley for AI video: is it still real demand?

### Takeaway
Yes, but it is shifting: native-audio video models (LTX-2.x, H3) reduce the need, yet LTX tends to output music instead of real effects, so vendors themselves now ship video-to-audio fixes. HunyuanVideo-Foley usage is visible only as many community ComfyUI wrappers from 2025; no 2026 usage data was found.

### Cited Findings
- LTX-2 native audio "often defaults to background music or rhythmic soundtrack material"; a Foley LoRA for LTX-2.3 (June 2026) redirects it to real-world effects and also adds sound to a muted clip — [comfyui-wiki](https://comfyui-wiki.com/en/news/2026-06-24-ltx-2-3-foley-lora); [LTX blog](https://ltx.io/blog/bring-silent-videos-to-life-foley-lora)
- LTX recommends the Foley LoRA for "LTX-2.3 or other pipelines" and says it is not a substitute for dialogue, music or final mixing (vendor) — [LTX blog](https://ltx.io/blog/bring-silent-videos-to-life-foley-lora)
- MMAudio is still marketed for "clips that came back silent" on hosted platforms — [eachlabs](https://www.eachlabs.ai/tr/meta/mm-audio); [Floyo](https://floyo.ai/workflows/mmaudio-v2-add-sound-effects-to-any--usrk10tbsgem)
- HunyuanVideo-Foley has at least four community ComfyUI wrappers (if-ai, Comfyui-HunyuanFoley, ComfyUI-HunyuanVideo-Foley, Vantage-HunyuanFoley) with **different model folder names** (`foley`, `hunyuanfoley`, `hunyuan_foley`). Tip from a guide: match the sampler fps to the Combine Video fps. Most guides date from Sep 2025 (older) — [stablediffusiontutorials](https://www.stablediffusiontutorials.com/2025/09/hunyuan-video-foley.html); [aistudynow](https://aistudynow.com/hunyuanvideo-foley-comfyui-workflow-turn-quiet-video-into-sound/); [RunComfy](https://www.runcomfy.com/comfyui-nodes/Comfyui-HunyuanFoley); [comfy.icu](https://comfy.icu/extension/vantagewithai__Vantage-HunyuanFoley)

### Inferences
- "Add sound" still matters for: silent clips from older or image-to-video models, and replacing native audio that came out as music. Keep `add-sound` in the app, framed as "Fix or add sound" rather than "make silent video speak".
- Wrapper fragmentation is itself a pain point and supports the section 7 choice of a pinned pack.

### Gaps
- No usage counts for HunyuanVideo-Foley in 2026, and no evidence of how many H3/LTX users strip and redo audio.
- No independent 2026 comparison of HunyuanVideo-Foley vs the LTX Foley LoRA.

## 4. 3D: game assets, printing, products; how usable TRELLIS.2 output is

### Takeaway
TRELLIS.2 is heavily downloaded (2.4M/month) and used for indie game props, concept blocking and product prototypes; the consistent caveat is that meshes need retopology before rigging and may have small holes before printing. No hands-on print test was found.

### Cited Findings
- HF card: 2,446,131 downloads last month, 1.4k likes, 100+ Spaces, 5 finetunes, 3 adapters, 3 quantizations; MIT — [HF microsoft/TRELLIS.2-4B](https://huggingface.co/microsoft/TRELLIS.2-4B)
- Official limitations: raw meshes "may occasionally contain small holes or minor topological discontinuities", so watertight output needs the provided post-processing scripts; base model "has not been aligned with human preferences". Also does shape-conditioned texturing of an input mesh — [HF microsoft/TRELLIS.2-4B](https://huggingface.co/microsoft/TRELLIS.2-4B)
- Review (4 Aug 2026, 8.5/10): uses are concept-art blocking, indie game props (crates, rocks, furniture), architecture fixtures, rapid prototyping, VR, product prototypes (sneaker from a side photo); export to Blender/Maya, render in UE5/Unity. Topology "rarely optimized" — retopology needed before rigging; complex mechanisms "merge into a single, solid mass"; "a generative tool, not a CAD program"; hard-surface edges sharper than before. Single editorial review, no benchmarks — [AI Indigo](https://aiindigo.com/blog/trellis-2-review-a-practical-look-at-microsoft-s-open-source-3d-engine)
- Vendor pages say outputs are ready for Blender, Unity or the printer, untested — [3D AI Studio](https://www.3daistudio.com/blog/3daistudio/trellis-2-create-stunning-3d-assets-in-just-seconds); 3D printing and game dev named as application areas without detail — [kocpc](https://en.kocpc.com.tw/?p=16053)
- Commercial 3D platforms host it (Scenario, 3D AI Studio) — [Scenario help](https://help.scenario.com/articles/8823711245-trellis-2-the-essentials); [3D AI Studio](https://www.3daistudio.com/Models/Trellis-2)

### Inferences
- The best fit is static props and product views (turntables), not rigged characters. `trellis2_character` should warn that the figure is not rig-ready.
- For a "3D print" format, a watertight / hole-fill pass is needed; upstream ships scripts for it.

### Gaps
- No polycount, manifold or wall-thickness figures; no printed-part reports; no r/blender or r/3Dprinting evidence reached.

## 5. Volume signals

### Takeaway
On HF, the three most-downloaded models in scope are close in monthly downloads: TRELLIS.2 about 2.45M, Chatterbox about 1.9M, Qwen3-TTS CustomVoice 1.7B about 1.9M. Drama 3 is too new for a signal, and no Comfy template run counts were found.

### Cited Findings
- Chatterbox: 1,899,707 downloads last month, 1.87k likes, 100+ Spaces, 83 finetunes, 38 quantizations, 22 adapters — [HF](https://huggingface.co/ResembleAI/chatterbox)
- Qwen3-TTS-12Hz-1.7B-CustomVoice (one variant of the family): about 1.9M downloads last month, about 2.17k likes — [HF](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)
- TRELLIS.2-4B: 2,446,131 downloads last month, 1.4k likes — [HF](https://huggingface.co/microsoft/TRELLIS.2-4B)
- Fish Audio, the company: $21M ARR and 15M+ users (company figures) — [eesel review](https://www.eesel.ai/blog/fish-audio-drama-3-review)
- Chatterbox GitHub: 286 open issues — [GitHub issues](https://github.com/resemble-ai/chatterbox/issues)

### Inferences
- Chatterbox's 83 finetunes is the strongest sign of a broad community (language and voice finetunes). Qwen3-TTS family totals are likely higher than the one variant counted.

### Gaps
- Downloads for MiniMax Music 3 (HF 401), Stable Audio 3, HunyuanVideo-Foley and Drama 3 were not retrieved.
- No Comfy template run counts, Reddit upvotes, YouTube view counts or AA Music Arena numbers found.

## 6. Top complaints and workflow pain points

### Takeaway
The common complaints are: licence caps (Drama 3, MiniMax Music 3, and the section 7 Tencent territory limit), heavy hardware (Drama 3, MiniMax), instability on long text (Chatterbox Turbo), unverified quality claims, and setup fragmentation (Foley wrappers).

### Cited Findings
- Chatterbox issues: vocoder hiss at about 4,900 Hz (#536); Turbo unstable after about 25–30 s (#543); 10 of 19 Turbo paralinguistic tags have no effect (#557); "V3 doesn't appear to work as well as V2" (#551); crash on text of 5 tokens or fewer (#548); Arabic hamza alefs silently dropped (#555); requests for IPA input (#550), Hebrew, Thai, Vietnamese; a dependency blocks Python 3.14 — [GitHub issues](https://github.com/resemble-ai/chatterbox/issues)
- Drama 3: Reddit quotes "barely better than breeze with nearly 10x the size" and "Lame license"; takes vary between renders; editing and audio inpainting are invite-only; a wrong API `model` header falls back silently to s2.1-pro. Hardware: a user ran it on two RTX 3090s at about 39 GB VRAM; the OP's bar is a 48 GB card; a community 4-bit quant needs 32 GB — [eesel review](https://www.eesel.ai/blog/fish-audio-drama-3-review). One source says CPU, Apple MPS and ROCm are not supported — [eesel](https://www.eesel.ai/blog/fish-audio-drama-3)
- MiniMax Music 3: licence confusion, doc disagreement on hardware, no published listening tests, loose structure control — [mer.vin](https://mer.vin/news/minimax-music-3-is-open-weight-but-not-open-for-business/); [NYU RITS](https://rits.shanghai.nyu.edu/ai/minimax-opens-music-3-0-weights-no-territorial-carve-out-this-time/)
- Stable Audio 3: rhythmic genres flatten; "correct without sounding interesting"; weak full-track structure; low seed variety (same prompt gives near-identical melodies) — [Dubspot](https://blog.dubspot.com/stable-audio-3-review)
- TRELLIS.2: messy topology, merged parts, high VRAM — [AI Indigo](https://aiindigo.com/blog/trellis-2-review-a-practical-look-at-microsoft-s-open-source-3d-engine); small holes — [HF](https://huggingface.co/microsoft/TRELLIS.2-4B)
- HunyuanVideo-Foley: no official ComfyUI node; inconsistent model folders between wrappers — [aistudynow](https://aistudynow.com/hunyuanvideo-foley-comfyui-workflow-turn-quiet-video-into-sound/); [stablediffusiontutorials](https://www.stablediffusiontutorials.com/2025/09/hunyuan-video-foley.html)

### Inferences
- **Correction to section 7:** Drama 3's VRAM is listed there as "24 GB VRAM plus about 48 GB system RAM". The sources here put the bar at 48 GB VRAM in FP8, or 32 GB with a community 4-bit quant. Check the Pod GPU class before shipping `drama3_tts`.
- Low seed variety in Stable Audio 3 means "4 takes" of one prompt may look like duplicates; the app could vary the prompt or seed spread.
- Chatterbox V3-vs-V2 complaints make the section 7 note (the pack loads v2) less of a problem.

### Gaps
- No first-hand complaint threads for Qwen3-TTS, HunyuanVideo-Foley (2026) or TRELLIS.2 found.
