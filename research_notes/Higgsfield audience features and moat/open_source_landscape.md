# Open-source landscape: why no open-source Higgsfield has won yet, and the Comfy Developer Platform (as of 2026-10-16)

Method note: GitHub metrics below were pulled from the public GitHub REST API (`api.github.com/repos/<owner>/<repo>`) on 2026-10-16 at about 14:15 UTC, unless a different date is given. "Last push" is the repo's `pushed_at` field, which measures activity, not releases. Reddit could not be searched: the search tool returns "reddit.com is not accessible to our user agent" and Reddit's JSON API returned no data, so Reddit sentiment is a gap (see question 3). Hacker News was searched with the Algolia API and the official HN item API.

## 1. Inventory: open-source and self-hosted creative studios, and what happened to each

### Takeaway
ComfyUI won the open-source engine layer (about 138K stars, a $500M company behind it), but none of the open-source "studio" layers has a Higgsfield-sized audience. The first wave of friendly UIs (A1111, Fooocus, Forge, FramePack) has stalled or gone into maintenance because each was tied to one model generation. The 2026 wave of "open Higgsfield" repos (Open-Generative-AI, open-higgsfield, HeliosGen, ArtCraft) has lots of stars, but most of them are thin frontends that send every request through one paid gateway (Muapi, kie.ai, or Higgsfield's own API).

### Cited Findings

**Engines and frontends (Comfy ecosystem)**
- Comfy-Org/ComfyUI: 137,860 stars, 16,413 forks, last push 2026-10-16, GPL-3.0. The old `comfyanonymous/ComfyUI` path now redirects to `Comfy-Org/ComfyUI` — [GitHub](https://github.com/Comfy-Org/ComfyUI)
- Comfy-Org/ComfyUI-Manager: 16,477 stars, last push 2026-10-16 (the `ltdrdata/ComfyUI-Manager` path redirects here, so Manager is now owned by Comfy Org) — [GitHub](https://github.com/Comfy-Org/ComfyUI-Manager)
- Comfy-Org/ComfyUI_frontend: 2,071 stars, last push 2026-10-16 — [GitHub](https://github.com/Comfy-Org/ComfyUI_frontend)
- Comfy-Org/desktop: 2,348 stars, archived, described as "[ARCHIVED] Superseded by Comfy-Org/Comfy-Desktop", last push 2026-06-26. Its successor, Comfy-Org/Comfy-Desktop, has 576 stars and was last pushed 2026-10-16 — [GitHub desktop](https://github.com/Comfy-Org/desktop), [GitHub Comfy-Desktop](https://github.com/Comfy-Org/Comfy-Desktop)
- Comfy-Org/workflow_templates: 1,318 stars, MIT; Comfy-Org/comfy-cli: 1,016 stars; Comfy-Org/comfy-python-sdk: 15 stars, MIT, last push 2026-10-16. The SDKs are very new — [GitHub templates](https://github.com/Comfy-Org/workflow_templates), [GitHub comfy-cli](https://github.com/Comfy-Org/comfy-cli), [GitHub python SDK](https://github.com/Comfy-Org/comfy-python-sdk)
- kijai/ComfyUI-WanVideoWrapper: 6,735 stars, last push 2026-05-24 — [GitHub](https://github.com/kijai/ComfyUI-WanVideoWrapper)
- ComfyWorkflows/ComfyUI-Launcher ("Run any ComfyUI workflow w/ ZERO setup"): 897 stars, last push 2024-08-18, which makes it a stalled attempt at easy ComfyUI — [GitHub](https://github.com/ComfyWorkflows/ComfyUI-Launcher)
- Comfy Org reports 4 million community users, 150,000+ daily downloads and 60,000+ community-built nodes (Apr 24, 2026) — [Comfy blog](https://blog.comfy.org/p/comfyui-raises-30m-to-scale-open)

**First-wave friendly UIs (image era)**
- AUTOMATIC1111/stable-diffusion-webui: 165,067 stars (the most-starred repo here), last push 2026-03-02. The newest CHANGELOG entry is still 1.10.1, a bug-fix release — [GitHub](https://github.com/AUTOMATIC1111/stable-diffusion-webui), [CHANGELOG](https://raw.githubusercontent.com/AUTOMATIC1111/stable-diffusion-webui/master/CHANGELOG.md)
- lllyasviel/Fooocus: 53,538 stars, last push 2025-12-01. README: "Project Status: Limited Long-Term Support (LTS) with Bug Fixes Only… built entirely on the Stable Diffusion XL architecture", and it sends users who want Flux to Forge or ComfyUI/SwarmUI — [GitHub README](https://github.com/lllyasviel/Fooocus)
- lllyasviel/stable-diffusion-webui-forge: 13,071 stars, last push 2025-07-31. Community forks carry it on: Haoming02/sd-webui-forge-classic (1,824 stars, active 2026-10-16) and Panchovix/reForge (1,038 stars, last push 2026-04-14) — [GitHub Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge), [GitHub forge-classic](https://github.com/Haoming02/sd-webui-forge-classic), [GitHub reForge](https://github.com/Panchovix/stable-diffusion-webui-reForge)
- invoke-ai/InvokeAI: 28,683 stars, Apache-2.0, last push 2026-10-16 (still active) — [GitHub](https://github.com/invoke-ai/InvokeAI). Aggregators say Adobe acquired Invoke in October 2025 alongside its "AI Foundry". I found no Adobe or major-outlet confirmation — [Dealroom](https://app.dealroom.co/news/feed/adobe-acquires-invoke-ai-for-3-8m), [Techleap](https://finder.techleap.nl/news/feed/adobe-acquires-invoke-ai-for-3-8m)
- mcmonkeyprojects/SwarmUI: 4,674 stars, MIT, last push 2026-10-16 (active, small) — [GitHub](https://github.com/mcmonkeyprojects/SwarmUI)
- Acly/krita-ai-diffusion: 10,726 stars, GPL-3.0, last push 2026-10-03 (active; a plugin for an existing open-source painting app, running on a ComfyUI backend) — [GitHub](https://github.com/Acly/krita-ai-diffusion)
- pinokiocomputer/pinokio ("AI Browser", one-click installer for local AI apps): 8,261 stars, MIT, last push 2026-09-02 — [GitHub](https://github.com/pinokiocomputer/pinokio)
- cocktailpeanut/fluxgym (LoRA training UI): 3,257 stars, last push 2026-07-28 — [GitHub](https://github.com/cocktailpeanut/fluxgym)

**Open video models and local video tooling**
- deepbeepmeep/WanGP (renamed from Wan2GP; the API redirects): 10,563 stars, last push 2026-10-16. Tagline: "The best Open Source Generative Models Accessible to the GPU Poor". Supports Wan 2.1/2.2, MiniMax H3, LTX-2/2.3/2.5, Hunyuan Video 1/1.5 and more, with "as little as 6 GB of VRAM" for select models. It ships very often: v18.00 on 11 Oct 2026, v18.10 on 15 Oct 2026 — [GitHub README](https://github.com/deepbeepmeep/Wan2GP)
- lllyasviel/FramePack: 17,298 stars, last push 2025-10-16 (a year without a push). It claims a 60 s, 30 fps video from a 13B model needs at least 6 GB of GPU memory — [GitHub README](https://github.com/lllyasviel/FramePack)
- Lightricks/LTX-Video: 11,115 stars, last push 2026-01-05. Lightricks/LTX-2 ("audio–video generative" model, inference and LoRA trainer): 9,765 stars, last push 2026-10-13 — [GitHub LTX-Video](https://github.com/Lightricks/LTX-Video), [GitHub LTX-2](https://github.com/Lightricks/LTX-2)
- hpcaitech/Open-Sora: 29,871 stars, last push 2026-04-09. The newest README news item is Open-Sora 2.0 (11B), dated 2025-03-12, "training with only $200K", so the project has stalled as a frontier contender — [GitHub README](https://github.com/hpcaitech/Open-Sora)
- Tencent-Hunyuan/HunyuanVideo: 12,628 stars, last push 2026-10-08. HunyuanVideo-1.5: 4,570 stars, last push 2026-04-10 — [GitHub](https://github.com/Tencent-Hunyuan/HunyuanVideo), [GitHub 1.5](https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5)
- Wan-Video/Wan2.1: 17,220 stars (last push 2026-03-05). Wan-Video/Wan2.2: 17,962 stars (last push 2026-09-21), Apache-2.0 — [GitHub 2.1](https://github.com/Wan-Video/Wan2.1), [GitHub 2.2](https://github.com/Wan-Video/Wan2.2)
- genmoai/mochi: 3,750 stars, last push 2026-10-06 — [GitHub](https://github.com/genmoai/mochi)

**Repos explicitly positioned as "open Higgsfield" or Higgsfield alternatives**
- Anil-matcha/Open-Generative-AI: 30,531 stars, 5,617 forks, MIT, last push 2026-10-15. `Anil-matcha/Open-Higgsfield-AI` redirects here, so it is the renamed "Open-Higgsfield-AI". Description: "Unrestricted Open-source alternative to AI video platforms". All cloud generation runs through the Muapi.ai gateway with a user-supplied Muapi key. The desktop app can also run sd.cpp and Wan2GP locally. It sells a "MuAPI White Label" from $49/mo and claims "No content filters". Model counts conflict inside the README (200+ / 400+ / 420+ / 600+). The macOS and Windows builds are unsigned — [GitHub README](https://github.com/Anil-matcha/Open-Generative-AI)
- In early 2026 a GitHub-tracking feed listed Open-Higgsfield-AI at about 2.7K stars and 464 forks (updated 01 Apr 2026). That implies growth to about 30.5K by October 2026, though how real the stars are was not checked — [Telegram githubfeedx](https://t.me/s/githubfeedx?after=506)
- Copies and forks of it: sunnychase/open-higgsfield-ai (229 stars, last push 2026-02-17), ClabstreamTeam/Open-Higgsfield-AI (202 stars, last push 2026-04-19), plus Autom8AI and clearsolid copies — [GitHub sunnychase](https://github.com/sunnychase/open-higgsfield-ai), [GitHub Clabstream](https://github.com/ClabstreamTeam/Open-Higgsfield-AI), [GitHub topic open-higgsfield](https://github.com/topics/open-higgsfield)
- wide-trace/open-higgsfield: 4,376 stars, 945 forks, last push 2026-09-17, but only 3 commits visible. It is a Next.js 16 studio with "one prompt bar, each model's own settings", a gallery, and 38 models including Higgsfield's own Soul 2 and Soul Cinema. Every request goes to one generation API (`HF_API_BASE_URL`) using a BYOK key in `id:secret` format. It is hosted at openhiggsfield.ai — [GitHub README](https://github.com/wide-trace/open-higgsfield)
- SegFault42/HeliosGen: 3,132 stars, created 2026-04-12, last push 2026-09-17. A Tauri desktop app with an infinite-canvas pipeline. Only a macOS build exists ("looking for a contributor" for Windows and Linux). It needs a kie.ai API key (the README link carries a referral code) and keeps data in local SQLite. The README says MIT; the API detects no license — [GitHub README](https://github.com/SegFault42/HeliosGen)
- BeatAPI/BeatDesign: 166 stars, Apache-2.0, created 2026-08-20. "Your local Higgsfield alternative": infinite canvas, browser-native editor, and "any MCP-capable Agent work in the same Project" — [GitHub README](https://github.com/BeatAPI/BeatDesign)
- storytold/artcraft: 30,065 stars, Apache-2.0 (README: dual MIT/Apache), last push 2026-10-15. "The IDE for artists": 2D canvas, 3D staging and posing, image-to-video, and 62 catalog models across image, video, music, 3D meshes and Gaussian splats. Desktop builds for Windows and macOS — [GitHub README](https://github.com/storytold/artcraft). HN user "possibilistic" (ArtCraft founder, previously FakeYou) wrote on 2026-08-22: "We're in use by a few film studios… It's at $5M ARR and growing 65% month-on-month" (self-reported, unverified) — [HN](https://news.ycombinator.com/item?id=49403840). HN user "echelon", who links storytold repos, wrote on 2026-10-05 that they are building "a source available (soon to be open source) Higgsfield and OpenRouter/FAL" — [HN](https://news.ycombinator.com/item?id=49961382), [HN](https://news.ycombinator.com/item?id=49959781)
- nodetool-ai/nodetool ("Agent-first Creative Workspace", node canvas): 570 stars, AGPL-3.0, last push 2026-10-16 — [GitHub](https://github.com/nodetool-ai/nodetool)
- mikefutia/no-more-higgsfield: 71 stars, created and last pushed 2026-08-10 (single-day project) — [GitHub](https://github.com/mikefutia/no-more-higgsfield)
- Minicut AI was posted to HN on 2026-09-27 as "Higgsfield but for AI Drama and Film" (1 point) — [HN](https://news.ycombinator.com/item?id=49862980)

**Higgsfield's own open-source and agent footprint**
- higgsfield-ai/higgsfield: 6,054 stars, Apache-2.0, last push 2026-10-07. It is "Fault-tolerant, highly scalable GPU orchestration, and a machine learning framework" for training, not the video product — [GitHub](https://github.com/higgsfield-ai/higgsfield)
- higgsfield-ai/skills: 1,304 stars, MIT, created 2026-04-09. higgsfield-ai/cli: 659 stars, MIT, created 2026-04-29, last push 2026-10-16. higgsfield-ai/higgsfield-client (Python SDK): 132 stars. So Higgsfield already ships CLI, agent skills and MCP for coding agents — [GitHub skills](https://github.com/higgsfield-ai/skills), [GitHub cli](https://github.com/higgsfield-ai/cli), [GitHub search](https://api.github.com/search/repositories?q=higgsfield+in:name,description&sort=stars)
- Community Claude skills built on top of Higgsfield: OSideMedia/higgsfield-ai-prompt-skill (748 stars), AKCodez/higgsfield-claude-skills (432), charlesdove977/UGC-Factory ("AI UGC video ad factory for Claude Code. Higgsfield Elements + Seedance 2.0", 88), Hikhakk/higgsfield-mcp-unified (95) — [GitHub search](https://api.github.com/search/repositories?q=higgsfield+in:name,description&sort=stars)

**Closed node and canvas competitors**
- Figma acquired Weavy (node-based canvas combining Sora, Veo, Flux and editing tools) on 2025-10-30. About 20 employees joined, terms were undisclosed, and it is being folded in as "Figma Weave". Weavy was founded in 2024 and raised a $4M seed in June 2025 — [TechCrunch](https://techcrunch.com/2025/10/30/figma-acquires-ai-powered-media-generation-company-weavy). A Luma blog puts the price at $200M (competitor source, unconfirmed) — [Luma](https://lumalabs.ai/news/weave-alternatives)
- Flora and Weavy are not open source. Chase Jarvis writes that "Weavy and Flora wouldn't exist without ComfyUI" — [Chase Jarvis](https://chasejarvis.com/blog/the-best-weavy-alternatives-for-creative-pros-free-and-paid/), [AlternativeTo Flora](https://alternativeto.net/software/flora/?p=2)

### Inferences
- The pattern is "engine wins, studios churn". The open-source projects that last (ComfyUI, Krita AI Diffusion, WanGP, InvokeAI, SwarmUI) are either model-agnostic engines or plugins with an active maintainer who ships support for new models within days. Single-model studios (Fooocus on SDXL, FramePack, Open-Sora) stall once their model is no longer the newest.
- Most 2026 "open Higgsfield" repos are open-source frontends to closed gateways (Muapi, kie.ai, the Higgsfield API). Users still pay a single middleman and get no local or privacy benefit. Some also look like a funnel for that gateway: a referral link in HeliosGen, a white-label upsell in Open-Generative-AI, Higgsfield's own Soul models in wide-trace. That likely explains why their stars have not turned into a movement.
- Very high star and fork counts with few commits (wide-trace: 4.4K stars, 945 forks, 3 visible commits) suggest promotional or inflated stars. Star counts in this category are a weak signal of real users.
- ArtCraft (storytold) is the strongest independent open-source commercial attempt: 30K stars, a desktop app, a self-reported $5M ARR, and an explicit plan to open-source "Higgsfield + OpenRouter/FAL". That is a direct competitor to ComfyField.

### Gaps
- No reliable user or MAU numbers exist for any open-source studio except Comfy's company-reported 4M users.
- I could not confirm the Adobe–Invoke acquisition from a primary source.
- The release date of A1111 1.10.1 is not shown in the output I fetched. From prior knowledge it is mid-2024; unverified here.
- No star-history time series was pulled (only point-in-time counts), apart from the single early-2026 data point for Open-Higgsfield-AI.
- I could not check Pinokio's app-install counts or Krita AI Diffusion's download numbers.

## 2. Structural barriers to an open-source Higgsfield

### Takeaway
The main barrier is model access. On the main October 2026 text-to-video arena, only one open-weights model (MiniMax H3) is in the top 20. Even that one needs about 24–42 GB of memory, ships under a restrictive license, and its 2K mode is cloud-only. An open-source studio that wants frontier quality therefore has to route to paid closed APIs, which brings back BYOK and billing friction. Higgsfield turns aggregation, presets and creator distribution into $500M ARR. Open-source projects have no funded equivalent of its daily preset R&D or its paid creator network.

### Cited Findings

**Quality gap: frontier video models are closed**
- Artificial Analysis AA-Video-T2V v2.1 leaderboard: #1 Wan 3.0 (Alibaba, Elo 1174, not open weights), #2 Utopai X (1169), #3 Seedance 2.5 (1160), #4 MiniMax H3 768p (1159, the only open-weights model in the top 15), #8 Gemini Omni Flash 1.1 (1132), #15 Kling 3.0 Omni (1019). The next open-weights entries are LTX-2.5 Fast (rank 22, Elo 950), LTX-2.5 Pro (rank 23, 948) and LTX-2.3 Pro (rank 26, 893) — [Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- On that board Alibaba's newest Wan models (Wan 3.0, Wan2.7) are not marked open weights, while Wan 2.1/2.2 were released under Apache-2.0 — [Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video), [GitHub Wan2.2](https://github.com/Wan-Video/Wan2.2)
- Higgsfield's CEO said that within weeks of launching its own model as "open source plus plus plus", the team saw a new video model released almost every week and concluded no single lab would win every use case, so it pivoted to running many third-party models side by side — [SaaStr](https://www.saastr.com/500m-arr-60-engineers-cash-flow-positive-how-higgsfield-actually-runs-with-ceo-alex-mashrabov/)

**VRAM and hardware**
- MiniMax H3 (released 2026-08-03 with day-0 ComfyUI support): footprint cut from 123.6 GB at full precision to 42.5 GB for the smallest variants by pruning about 40% of parameters, int8 weights and offloading. Comfy claims it "can run locally on a 3060" — [Comfy blog](https://blog.comfy.org/p/minimax-h3-day-0-support-in-comfyui)
- Community reports put the comfortable tier for H3 at 24 GB+. One guide measured a peak of about 46 GB VRAM on an RTX 4090 with raw weights and about 6 minutes per 20 s clip. Third-party guides say local output is 768p while "2K" is a hosted stage, and that the H3 Community License does not cover some regions (US/EU/UK/South Korea per one roundup). These are third-party claims, not verified against the license — [MindStudio](https://www.mindstudio.ai/blog/minimax-h3-run-locally-guide), [MiniMax H3 requirements](https://minimaxh3.video/minimax-h3-requirements), [Pinggy](https://pinggy.io/blog/best_video_generation_ai_models/)
- WanGP and FramePack advertise 6 GB VRAM for select models, but WanGP measures "20s of 480p" LTX 2 video in about 28 s on an RTX 5090 — [GitHub WanGP](https://github.com/deepbeepmeep/Wan2GP), [GitHub FramePack](https://github.com/lllyasviel/FramePack)
- A search summary of canvas-app roundups quoted an estimate of a "$4,000+ setup" for smooth local ComfyUI use. The exact page was not verified and may be one of these — [Chase Jarvis](https://chasejarvis.com/blog/best-generative-ai-canvas-apps/), [Chase Jarvis](https://chasejarvis.com/blog/the-best-weavy-alternatives-for-creative-pros-free-and-paid/) (treat as a rough, unverified figure)

**Cloud GPU cost vs credits**
- Comfy Cloud prices an RTX PRO 6000 at 957.94 credits/hour. At 211 credits per $1 (monthly billing) that is about $4.54/hour (my arithmetic). Standard at $20/mo buys about 4.4 GPU hours a month — [Comfy pricing](https://comfy.org/pricing)

**BYOK and billing friction**
- Comfy Router BYOK is only "available for select models on Enterprise, by request". The default is Comfy credits — [Comfy Router page](https://comfy.org/platform/router)
- Each open-source "Higgsfield" clone binds the user to one key from one gateway: Muapi in Open-Generative-AI, kie.ai in HeliosGen, a Higgsfield-format key in wide-trace — [GitHub Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI), [GitHub HeliosGen](https://github.com/SegFault42/HeliosGen), [GitHub open-higgsfield](https://github.com/wide-trace/open-higgsfield)
- A Higgsfield review notes that standalone Kling or Sora subscriptions cost about $10–$30/mo each, so one bundle can be cheaper than several direct subscriptions — [Creatify](https://creatify.ai/blog/higgsfield-vs-kling-ai-quality-cost-per-second-and-which-to-use-for-ads-in-2026)

**UX complexity of node tools**
- On 2026-03-10 ComfyUI launched App Mode, App Builder and ComfyHub so that "anyone" can run workflows "without touching a node graph". In App Mode "the node graph is replaced by a clean interface showing only the inputs and outputs relevant to the end user" — [GlobeNewswire](https://www.globenewswire.com/news-release/2026/03/10/3253141/0/en/comfyui-launches-app-mode-app-builder-and-comfyhub-enabling-anyone-to-run-ai-workflows-without-touching-a-node-graph.html)
- A developer write-up says ComfyUI "has a higher learning curve but offers more flexible workflow customization" — [DEV Community](https://dev.to/shawn95618/how-to-use-comfyui-api-with-python-a-complete-guide-4b97)

**Presets, R&D and distribution (Higgsfield's machine)**
- Higgsfield runs 100+ cinematic templates with ten new presets a day, cutting weak ones on engagement data. Higgsfield Earn has commissioned 10,000+ creators and paid out $1M+; the company claims 3B+ social impressions. It hired its first salesperson in October 2025 and relied on creator distribution rather than performance marketing. New models are integrated within about 24 hours — [ProductGrowth teardown](https://www.productgrowth.blog/p/higgsfield-growth-teardown)
- Higgsfield has about 150 staff: about 60 in core engineering and product, plus a 70+ person creative team who test outputs and find where models fail. It crossed $500M annualized run rate in June 2026 (from $200M at end-2025), is cash-flow positive, and about 70% of revenue comes from agencies — [SaaStr](https://www.saastr.com/500m-arr-60-engineers-cash-flow-positive-how-higgsfield-actually-runs-with-ceo-alex-mashrabov/)
- ARR timeline: $10M (Apr 2025), $50M (Aug 2025), $100M (Nov 2025), $200M (Jan 2026), $300M (Feb 2026). 20M+ users, 300K paying subscribers, 5M videos per day. Gross margins are "well below 80-90%" — [ProductGrowth teardown](https://www.productgrowth.blog/p/higgsfield-growth-teardown)
- Valuation: $1.3B after an $80M Series A extension (Jan 2026), then a $400M Series B at $5.4B (announced Aug 17, 2026) — [TechCrunch](https://techcrunch.com/2026/01/15/ai-video-startup-higgsfield-founded-by-ex-snap-exec-lands-1-3b-valuation/), [WION](https://www.wionews.com/world/is-unlimited-a-scam-higgsfield-is-making-customers-wait-for-days-to-generate-even-1-video-1787006158862)

**Business model to fund development**
- Open-Sora 2.0 cost about $200K to train, and its README shows no newer model since March 2025 — [GitHub Open-Sora](https://github.com/hpcaitech/Open-Sora)
- Fooocus's maintainer moved it to bug-fix-only LTS when the SDXL generation passed — [GitHub Fooocus](https://github.com/lllyasviel/Fooocus)
- Comfy itself only reached sustainability through VC: $30M at a $500M valuation (Apr 2026; total about $47M per Comfy's blog, $48M per the press release) — [Comfy blog](https://blog.comfy.org/p/comfyui-raises-30m-to-scale-open), [GlobeNewswire](https://www.globenewswire.com/news-release/2026/04/24/3281014/0/en/ComfyUI-Raises-30M-at-500M-Valuation-to-Scale-Open-Source-AI-for-Creative-Production.html)

**Legal and safety**
- The Comfy competition requires entries to be "lawful, SFW, and must not contain unlicensed IP or likenesses" — [Comfy](https://comfy.org/open-source-higgsfield)
- Forbes reported nonconsensual celebrity deepfakes and offensive marketing content from Higgsfield (as summarized by ProductGrowth) — [ProductGrowth teardown](https://www.productgrowth.blog/p/higgsfield-growth-teardown)
- The best-starred "open Higgsfield" repo markets itself as "Unrestricted" with "No content filters" and links a "Best Spicy AI Video" video — [GitHub Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI)

### Inferences
- The quality gap among open models is now mostly about licensing and access, not raw capability: H3 is close to the top, but restrictive terms and a 42 GB+ footprint keep it out of reach for most users. Because Wan 3.0 is closed, the open-weights pipeline may be getting thinner at the top, not thicker.
- Higgsfield's moat is operational, not technical. Daily preset R&D by 70+ creatives, 24-hour model integration and a paid creator network are expensive, ongoing work that volunteers cannot sustain. An open-source project cannot copy that cadence, so it needs presets the community can contribute and share as files.
- BYOK is the main tax on open-source studios. Users have to sign up with fal, Google, ElevenLabs and others. A single aggregated key (Comfy Router credits) removes the friction, but it routes users through one vendor's billing again.
- "Unrestricted" positioning by open-source clones is a reputational and legal liability. It confirms why careful maintainers and sponsors (NVIDIA, BFL) avoid the space, and why the competition enforces SFW rules.

### Gaps
- No primary-source text of the MiniMax H3 Community License was fetched. The regional restriction and the claim that Comfy is the "only official reseller" of commercial licenses come from third-party sites only.
- No quantitative data on how many ComfyUI users drop out because of UX complexity.
- No disclosed Higgsfield marketing spend.

## 3. What ComfyUI users and creators say about why they still use Higgsfield, or left it

### Takeaway
Reviews credit Higgsfield with best-in-class camera-motion presets, many models under one subscription, and a fast path to finished social ads. The reasons people leave are about trust: throttled "unlimited" plans, slow support, payment disputes in its creator program, and ethics scandals. No source I could reach documents a migration from Higgsfield to ComfyUI specifically. Reddit was not accessible to the tools.

### Cited Findings
- Reviewers rate Higgsfield's camera-motion presets "genuinely best in class" (counts vary from 20+ to 70+ presets), and it bundles 15+ video models (Sora 2, Veo 3.1, Kling 3.0) under one plan. They also say Kling direct wins on resolution and credit rollover, and is the better deal if you use one model — [Creatify](https://creatify.ai/blog/higgsfield-vs-kling-ai-quality-cost-per-second-and-which-to-use-for-ads-in-2026), [Layer3Labs](https://www.layer3labs.io/comparisons/higgsfield-ai-vs-kling), [Pollo](https://pollo.ai/hub/higgsfield-ai-review)
- Hands-on reviewer: "good for camera effects but not better than Kling & Runway" — [Pollo](https://pollo.ai/hub/higgsfield-ai-review)
- Credits "eat up fast". Estimated at 33–56 usable Kling 3.0 videos on the Plus plan, at $0.61–$1.03 each once a 3–5x iteration rate is included; credits do not roll over — [Yangsweb](https://www.yangsweb.com/blog/higgsfield-ai-review-alternatives-pricing) (affiliate-style review; numbers may differ)
- Most of these review sites are affiliate-style blogs, and their numbers conflict — [search summary of reviews incl. Makerstack](https://makerstack.co/reviews/higgsfield-review/)
- HN, 2026-08-29: "check higgsfield cinema studio 4; they already provide amazing tech for the cinematic experience" — [HN](https://news.ycombinator.com/item?id=49494070)
- HN, 2026-09-23: a user runs an "Astra+Higgsfield setup" that makes product walkthrough videos from a GitHub repo, so Higgsfield is also used through agents — [HN](https://news.ycombinator.com/item?id=49818213). Another user, 2026-09-14, "tried the Higgsfield MCP" but saw "hallucinations on product dimensions" — [HN](https://news.ycombinator.com/item?id=49705458)
- "Unlimited" complaints (WION, Aug 18, 2026, quoting Higgsfield's public Discord). After a 33-day unlimited Seedance 2.5 offer launched Aug 7, users reported "almost impossible to generate anything" for three days and generations taking "2 hours++" (previously about 20 minutes). Moderators gave timeouts and deleted messages. Higgsfield refunded $1.35M, blaming bot accounts and peak demand. Its terms (s.10.6) allow throttling — [WION](https://www.wionews.com/world/is-unlimited-a-scam-higgsfield-is-making-customers-wait-for-days-to-generate-even-1-video-1787006158862)
- Higgsfield's X account was suspended in February 2026. A July 23 terms-of-service update drew new criticism — [Bottle Rocket](https://www.bottlerocketcontent.com/higgsfield-tos-controversy-explained/), [Qazinform](https://qazinform.com/news/scam-claims-and-backlash-hit-kazakhstans-ai-unicorn-higgsfield-b311a7)
- Backlash after Higgsfield boasted its AI motion design tool "ended" 20+ creative jobs; the post was removed (Feb 6, 2026) — [The Register](https://www.theregister.com/2026/02/06/higgsfield_ai_job_loss/)
- Allegations of racist and sexist promotional content given to creators — [Times of Central Asia](https://timesca.com/kazakh-startup-higgsfield-ai-from-unicorn-to-racism-and-sexism-scandal/)
- Trustpilot ratings conflict: about 3.2/5 across 1,200+ reviews (WION, Aug 2026) vs 4.0 across about 1,700 reviews (ProductGrowth, updated Aug 11, 2026) — [WION](https://www.wionews.com/world/is-unlimited-a-scam-higgsfield-is-making-customers-wait-for-days-to-generate-even-1-video-1787006158862); contradicted by [ProductGrowth](https://www.productgrowth.blog/p/higgsfield-growth-teardown)
- An advocacy site, higgsfieldsucks.com, documents alleged "deceptive practices" (one-sided) — [HiggsfieldSucks](https://higgsfieldsucks.com/)
- HN, 2026-08-22: "Higgsfield is a very unethical player in AI video… they're a psychotic warlord… growth at all costs". The author ("echelon") is affiliated with competitor storytold/ArtCraft, so this is a conflict of interest — [HN](https://news.ycombinator.com/item?id=49401031). In the same thread, another user calls a Higgsfield film post a "submarine ad" and points to Corridor Crew as "far more honest" — [HN](https://news.ycombinator.com/item?id=49401117)
- HN, 2026-07-06: "Ask HN: Open-source website builders for animated sites like Higgsfield?" shows demand for open-source versions of Higgsfield-style output — [HN](https://news.ycombinator.com/item?id=48802983)
- A YouTube reviewer says of the "Higgsfield open-sourced" claim: "all you get is a thin UI that calls their paid API" — [YouTube](https://www.youtube.com/watch?v=qTYOCXSnWR0) (via search snippet)

### Inferences
- People stay with Higgsfield for convenience: presets, bundled models, and ready-made ad formats. People leave over trust and value: throttling, opaque credits, bans, and ethics. An open-source entrant can compete on trust (transparent per-generation pricing, no throttling, owned files) while copying the convenience (presets).
- The heaviest Higgsfield users are agencies (about 70% of revenue). They are price-sensitive about volume and burned by "unlimited" throttling, so they are a plausible open-source/BYOK segment, but no source confirms that they switch.

### Gaps
- Reddit (r/comfyui, r/StableDiffusion, r/aivideo) could not be accessed: Anthropic's crawler is blocked, and the unauthenticated JSON API returned nothing. A human should skim Reddit for direct "switched from Higgsfield to ComfyUI" quotes.
- X and YouTube creator commentary was only found through search snippets. No creator video transcripts were fetched.
- No survey data on ComfyUI users who also pay for Higgsfield.

## 4. The Comfy Developer Platform (Comfy Router, Comfy API / API v2, Comfy SDK), pricing, auth, and Comfy Org's consumer moves

### Takeaway
The Comfy Developer Platform (console at platform.comfy.org) has four parts. Comfy Router (launched 2026-09-23) is one API and key for 213 partner models across Comfy, fal, Higgsfield, Runware and WaveSpeed. Comfy API (live 2026-09-30) deploys a ComfyUI workflow as an autoscaling endpoint. Comfy API v2 is the versioned HTTP contract for running workflows on Comfy Cloud, a deployment, or self-hosted ComfyUI through `comfy-api-proxy`. The Comfy SDK (Python `comfy-sdk`, TypeScript `@comfyorg/sdk`, v0.5.0) wraps both. Everything bills in Comfy credits at about 211 credits per $1. Higgsfield itself is a Router provider.

### Cited Findings

**Comfy Router**
- Launched Sep 23, 2026 as "One API for Frontier Media Models" on the Comfy Developer Platform. Day-one models: Seedance 2.5, MiniMax H3, Nano Banana Pro, GPT Image 2, Kling, and Black Forest Labs. Billed in Comfy credits shared with Partner Nodes and Comfy Cloud runs, "There is no subscription required". Inputs and outputs are deleted after 24 hours — [Comfy blog](https://blog.comfy.org/p/introducing-comfy-router-one-api)
- Routing is explicit: "When you name a provider, Comfy does not switch the route… There is no silent substitution, and every job reports the provider that ran it." Jobs that hit 429s or transient errors are retried in a queue — [Comfy blog](https://blog.comfy.org/p/introducing-comfy-router-one-api), [ComfyUI on X](https://x.com/ComfyUI/status/2102790982286839867)
- Providers: Comfy (default), fal, Higgsfield, Runware, WaveSpeed, selected with `model_provider`. Availability examples: GPT Image 2/2.5 and Nano Banana 2/Pro on Comfy, fal, Runware and WaveSpeed (not Higgsfield); Seedance 2.0/2.5 on all five; Kling 3.0 Turbo, Kling V3 and Wan 3.0 Video on Comfy and Higgsfield; MiniMax H3, FLUX 2 Pro and Grok Imagine Video 1.5 on Comfy only. The catalog lists 213 models — [Comfy Router page](https://comfy.org/platform/router)
- Roadmap (not yet available): routing strategies `reliable`, `fast_start`, `fast_finish`, `lowest_cost`; routing by use case; running ComfyUI workflows through Router; ordered fallback. BYOK is "available for select models on Enterprise, by request" — [Comfy Router page](https://comfy.org/platform/router), [Comfy blog](https://blog.comfy.org/p/introducing-comfy-router-one-api)
- Endpoint: `https://api.comfy.org`, route `/v2/models/{provider}/{model}`. Auth via `COMFY_API_KEY` or `comfy.config({ credentials })`. No streaming or preview events for Router — [Comfy SDK docs](https://docs.comfy.org/development/api-development/sdks)
- Python snippet: `from comfy_sdk import Comfy; client = Comfy(api_key="comfyui-..."); client.models.run("openai/gpt-image-2", {"prompt": ...})`. `submit` returns a request ID; `subscribe` polls until completion. Keys are created at platform.comfy.org/profile/api-keys — [Comfy Router page](https://comfy.org/platform/router)
- The API v2 overview still calls Router "not generally available yet" and tells readers to review its limitations — [Comfy API v2 docs](https://docs.comfy.org/api-reference/v2/overview)
- Third-party coverage calls it "a content generation version of OpenRouter" — [GIGAZINE](https://gigazine.net/gsc_news/en/20260927-comfy-router/)
- Comfy's Purz: "build whatever you want without ever touching a node graph. Your agent can already use it: just point it to the router page and give it a Comfy API key." — [X](https://x.com/PurzBeats/status/2102791986692465133)

**Comfy API (workflow deployment) and Comfy API v2**
- "Comfy API is live for everyone on a paid Comfy plan" (Sep 30, 2026). It packages a workflow with its custom nodes, LoRAs, models and dependencies into a Build, then an immutable release, then an autoscaling endpoint. It is managed in platform.comfy.org from the browser, comfy-cli (`comfy build init`, `comfy build push --release`) or a coding agent. Billing is per GPU-second plus hourly prorated storage, and it can scale to zero — [Comfy blog](https://blog.comfy.org/p/comfy-api-is-live-deploy-comfyui), [Comfy support](https://support.comfy.org/articles/2703236295-comfy-api-deploy-your-comfyui-workflow-as-an-api)
- API v2 is "the official, versioned HTTP API for running ComfyUI workflows from external applications"; changes are additive and breaking changes go to v3. Base URLs: Comfy Cloud `https://cloud.comfy.org`, deployments `https://{deployment}.run.comfy.app`, self-hosted `http://127.0.0.1:8189` via comfy-api-proxy. Auth: `Authorization: Bearer <api-key>` (none by default for self-hosted). Resources are Assets (content-addressed, blake3-deduplicated) and Jobs (durable, pollable, cancelable, optional SSE). Signed output URLs last about 6 hours and should not be stored. Credits, model browsing and queue management live in the v1 Cloud API — [Comfy API v2 docs](https://docs.comfy.org/api-reference/v2/overview)

**Comfy SDK**
- Python `comfy-sdk` (3.10+, `pip install comfy-sdk`, optional `[pil]` extra) and TypeScript `@comfyorg/sdk` (Node 22+), released together, current 0.5.0. Two surfaces: Router (`client.models`) and Cloud/v2 (`client.workflows`, `client.assets`, `client.jobs`). One API key works for both — [Comfy SDK docs](https://docs.comfy.org/development/api-development/sdks)
- SDK features: lazy content-addressed asset upload, `run()` and `submit()`, `job.events()` streaming with polling fallback, typed errors (`JobFailed`, `Unauthorized`, `InsufficientCredits`, `QueueFull`, `IdempotencyKeyReuse`), and cancellation. A naive retry loop can duplicate charges because each `submit()` mints a new idempotency key. Concurrency depends on plan tier — [Comfy SDK docs](https://docs.comfy.org/development/api-development/sdks)
- Repos: github.com/Comfy-Org/comfy-python-sdk (15 stars, MIT) and github.com/Comfy-Org/comfy-typescript-sdk. Feedback goes to the `#developer-platform` Discord channel — [Comfy SDK docs](https://docs.comfy.org/development/api-development/sdks), [GitHub](https://github.com/Comfy-Org/comfy-python-sdk)

**Pricing and credits**
- 211 credits = $1 on monthly billing (about 262–264 per $1 on yearly Standard/Creator/Pro). Plans: Standard $20/mo (50,400 credits a year, about 4.4 RTX PRO 6000 hours a month, API concurrency 1), Creator $35 (concurrency 3, custom LoRA import), Pro $100 (concurrency 5, runs up to 1 hr), Team from $700 (concurrency 25, up to 50 members). All paid plans include Comfy Cloud, Comfy API and Partner Nodes. Comfy Desktop is free; credits work there only for Partner Nodes. Free tier: 5 free GPU runs plus Comfy Agent credits — [Comfy pricing](https://comfy.org/pricing)
- Partner Nodes examples: flux-dev 5.28 credits per run (about $0.025), flux-kontext-pro 8.44, flux-kontext-max 16.88 — [Comfy docs pricing](https://docs.comfy.org/tutorials/partner-nodes/pricing.md), [Comfy support](https://support.comfy.org/articles/1982697177-partner-nodes-pricing)

**Docs URLs**
- Router quickstart https://docs.comfy.org/development/comfy-router/quickstart; Router model catalog https://docs.comfy.org/development/comfy-router/models/; Router queue and errors /development/comfy-router/queue and /errors; Developer platform overview https://docs.comfy.org/development/overview; SDKs https://docs.comfy.org/development/api-development/sdks; API v2 https://docs.comfy.org/api-reference/v2/overview; API key https://docs.comfy.org/development/api-development/getting-an-api-key; Comfy API (serverless) https://docs.comfy.org/development/serverless/overview; self-hosted proxy /development/comfyui-server/api-proxy; Partner Nodes concurrency https://docs.comfy.org/tutorials/partner-nodes/concurrency-limits — [Comfy SDK docs](https://docs.comfy.org/development/api-development/sdks), [Comfy Router page](https://comfy.org/platform/router), [Comfy blog](https://blog.comfy.org/p/comfy-api-is-live-deploy-comfyui)

**Comfy Org consumer moves and funding**
- Comfy Cloud: private beta Sep 2025, public beta Nov 2025 at $20/mo with no waitlist, since out of beta. Comfy Agent (builds workflows from text) is in beta on Comfy Cloud — [Comfy blog](https://blog.comfy.org/p/comfy-cloud-is-now-in-public-beta), [Comfy blog](https://blog.comfy.org/p/comfy-cloud), [CompleteAITraining](https://completeaitraining.com/news/comfy-agent-launches-in-comfy-cloud-as-the-first-agent-for/)
- App Mode, App Builder, shareable app URLs and ComfyHub launched Mar 10, 2026; ComfyHub started as a curated preview — [GlobeNewswire](https://www.globenewswire.com/news-release/2026/03/10/3253141/0/en/comfyui-launches-app-mode-app-builder-and-comfyhub-enabling-anyone-to-run-ai-workflows-without-touching-a-node-graph.html)
- Comfy Desktop moved to a new repo, Comfy-Org/Comfy-Desktop, described as "One App for Local, Remote, Portable, and Cloud ComfyUI" by a third-party guide — [GitHub](https://github.com/Comfy-Org/Comfy-Desktop), [RunAIHome](https://runaihome.com/blog/comfy-desktop-local-remote-setup-guide-2026/)
- Funding: $30M led by Craft at a $500M valuation (Apr 24, 2026), with Pace Capital, Chemistry and TruArrow. Cofounder Yannik Marek: "We want to live in a world where the best tool is open source." The company commits to keeping ComfyUI open source and runnable locally — [Comfy blog](https://blog.comfy.org/p/comfyui-raises-30m-to-scale-open), [TechCrunch](https://techcrunch.com/2026/04/24/comfyui-hits-500m-valuation-as-creators-seek-more-control-over-ai-generated-media/)
- Comfy is hiring a "Sr./Staff Product Designer, Developer Platform" — [Ashby](https://jobs.ashbyhq.com/comfy-org/2bb20277-7e2a-43df-82f2-48bf77881c50)

### Inferences
- Router is Comfy's answer to BYOK friction: one key, one credit balance, many providers. An open-source studio built on it can drop the "sign up with five providers" step. The trade-off is dependence on Comfy credits, since BYOK through Router is Enterprise-only.
- Higgsfield being a Router provider means Comfy and Higgsfield are partners at the API layer while Comfy runs a competition framed against Higgsfield. A ComfyField entry could route some models (Kling 3.0, Wan 3.0) through Higgsfield's own infrastructure via Router.
- API v2 plus comfy-api-proxy lets the same client code target local ComfyUI (free, private), Comfy Cloud, or a deployed endpoint. That is the technical basis for a "local-first, cloud when needed" open-source studio.

### Gaps
- Per-model Router prices (in the catalog at comfy.org/models and docs) were not fetched model by model.
- Router concurrency limits by tier were not fetched.
- Comfy has not disclosed revenue, Cloud subscriber counts or Router usage.
- The status of the TypeScript SDK repo (stars, activity) was not checked because the GitHub API rate limit was exhausted.

## 5. The "Open Source Higgsfield" competition

### Takeaway
Comfy Org runs it: a two-week online build challenge, with signups opening 10/15/2026 and submissions closing October 30, 2026 at 9am PT. About $25K in prizes ($10K grand prize, three RTX 5090s, $250 credits for 10 runners-up, sponsor bonuses from LTX, BFL and MiniMax). Entries must use the Comfy Developer Platform (Comfy API, Comfy Router and/or Comfy SDK), ship an open-source repo that runs locally, and include a demo video of up to 2 minutes. The premise ("Higgsfield promised to open source their entire platform") rests on a viral claim that fact-checkers say is false.

### Cited Findings
- Official page: "Open Source Higgsfield · Comfy". The challenge is to rebuild Higgsfield's popular apps "and more" on the Comfy Developer Platform in two weeks — [Comfy](https://comfy.org/open-source-higgsfield)
- Announcement post: "Higgsfield promised to open source their entire platform. They didn't, so let's help them." by Allyson Toy, Oct 15, 2026. It offers "$25,000 worth of prizes" for "the best open-source builds made on the Comfy Developer Platform", and asks for "open-source rebuilds of Genjutsu, Cinema Studio" or another creative app: "Publish the repo. Let anyone run it, fork it, and make it better." Also: "We believe creative tools get better when they're open." — [Comfy blog](https://blog.comfy.org/p/higgsfield-promised-to-open-source)
- Prizes: Best Overall $10,000 (every entry considered); Most Innovative, an RTX 5090 ("An app that's never been done, novel custom node packs or uses of ComfyUI"; the demo must explain why it is innovative); Most Viral, an RTX 5090 ("Delightful to use and made to be shared"); Open Weights Only, an RTX 5090 (no partner nodes or APIs); 10 runners-up get $250 in Comfy Credits. Bonuses: VFX Workflow Built with LTX ($2,000 cash, LTX core video model); Built with FLUX ($1,000/$500/$250 in FLUX API credits, FLUX 3 core); Built with MiniMax H3 ($1,000 API credits). An entry can win a main prize and a bonus — [Comfy](https://comfy.org/open-source-higgsfield)
- Eligibility: built with the Comfy Developer Platform ("Comfy API, Comfy Router, and/or Comfy SDK"); the repo must include an open-source license and local setup instructions; other tools are allowed but must be explained in the demo; "lawful, SFW, and must not contain unlicensed IP or likenesses"; one submission per person; partner models are allowed except in Open Weights Only. ComfyUI, NVIDIA, Runpod, LTX, BFL and MiniMax may feature entries — [Comfy](https://comfy.org/open-source-higgsfield)
- Judging: "we're judging the work, not your video editing or quality". No formal rubric is published beyond the category descriptions — [Comfy](https://comfy.org/open-source-higgsfield)
- Submission through Typeform (form.typeform.com/to/V1dSQrkS): GitHub repo (code, workflow files, OSS license, local run instructions), demo video of 2 min max, optional try-it link, and a social post on Reddit, X, IG, LinkedIn, YouTube or TikTok tagged #OpenSourceHiggsfield. Winners are featured on comfy.org/hub — [Comfy](https://comfy.org/open-source-higgsfield)
- Timeline: signups 10/15; build 10/15–10/30, closing Oct 30 9am PT; Build Night SF 10/28 (Frontier Tower, hosted by Comfy); Build Night LA 10/29 (with AI On The Lot); winners 11/6. Build Nights register on Luma and are separate from the online competition. A NYC event is named without a date — [Comfy](https://comfy.org/open-source-higgsfield), [Comfy blog](https://blog.comfy.org/p/higgsfield-promised-to-open-source)
- Inspiration apps listed: Cinematic Studio ("Direct your shot like a film set"), Re-shoot a video (from any angle), Openjutsu ("Coming soon") — [Comfy](https://comfy.org/open-source-higgsfield)
- Partners: NVIDIA AI, Runpod, LTX, Black Forest Labs, MiniMax — [Comfy blog](https://blog.comfy.org/p/higgsfield-promised-to-open-source)
- Premise dispute: a viral post claimed Higgsfield's CEO "just open sourced his entire $5.4B startup on GitHub". Nowrap reports that only the training framework is open source and the video platform stays proprietary — [Nowrap](https://nowrap.ai/news/higgsfield-open-source-claim-github) (via search snippet; the page returned 429). A September 2026 analysis says Higgsfield's help center states the platform and models are proprietary — [BigBangIndex](https://bigbangindex.com/blog/higgsfield-open-source-claim-2026) (search snippet only; the page returned 404). Mashrabov's own LinkedIn says Higgsfield open-sources "key frameworks" it builds along the way — [LinkedIn](https://www.linkedin.com/posts/amashrabov_github-higgsfield-aihiggsfield-fault-tolerant-activity-7130240128819601409-S6Vj)
- HN, 2026-09-17: "Why Suddenly higgsfield made its core repo Opensource?" (no answers) — [HN](https://news.ycombinator.com/item?id=49744855)
- An older Comfy "Open Call: Comfy Dev Platform Challenge" post shows up in search, but the URL now returns 404 — [Comfy blog (404)](https://blog.comfy.org/p/open-call-comfy-dev-platform-challenge)

### Inferences
- The judging copy ("judging the work, not your video editing") and the categories reward working, novel, shareable apps over polish. Open Weights Only is a separate track, so a hybrid local + Router entry competes for Best Overall, Most Innovative or Most Viral.
- Because the competition is SFW and bans unlicensed likenesses, Higgsfield's celebrity-style and "spicy" presets are off-limits. Entries should show cinematic, product or ad, and VFX formats instead.
- The sponsor bonuses (LTX for VFX, FLUX 3, MiniMax H3) are cheap extra chances if one format uses each as its core model.

### Gaps
- No public submissions or entry list was found yet; signups opened one day before this research.
- The Key Dates graphic in the blog post could not be read; dates come from the comfy.org page.
- No Devpost, lablab.ai or Luma listing was fetched directly.
- Whether Higgsfield ever explicitly promised to open-source its platform could not be confirmed. No primary Higgsfield statement was found.

## 6. What an open-source entrant would need to do differently to win

### Takeaway
The evidence points to a product that is model-agnostic, aggregates access (one key or local), and is built around presets, while being trustworthy where Higgsfield is not. Concretely: presets and formats as shareable, forkable files (copying Higgsfield's preset cadence through the community rather than a 70-person team); one-click install plus a hosted try-it link; Comfy Router for one-key access to closed frontier models alongside local open weights for privacy and cost; MCP/agent integration (Higgsfield already ships CLI, skills and MCP); and transparent per-generation pricing with no throttling. Adjacent open-source winners (Blender, Krita, ComfyUI) won through project-level funding and an extension ecosystem, not by out-marketing incumbents.

### Cited Findings
- Model churn: a new video model "nearly every week" (Higgsfield CEO) — [SaaStr](https://www.saastr.com/500m-arr-60-engineers-cash-flow-positive-how-higgsfield-actually-runs-with-ceo-alex-mashrabov/). Higgsfield integrates new models within about 24 hours — [ProductGrowth](https://www.productgrowth.blog/p/higgsfield-growth-teardown). WanGP shipped two major versions in five days (v18.00 Oct 11, v18.10 Oct 15, 2026) — [GitHub WanGP](https://github.com/deepbeepmeep/Wan2GP)
- Presets are the product: 100+ templates, ten new a day, cut by engagement data — [ProductGrowth](https://www.productgrowth.blog/p/higgsfield-growth-teardown). Reviewers single out camera presets as the main differentiator — [Creatify](https://creatify.ai/blog/higgsfield-vs-kling-ai-quality-cost-per-second-and-which-to-use-for-ads-in-2026)
- Higgsfield's CEO says the moat is not the model; it is collaboration, network effects and helping brands sell — [SaaStr](https://www.saastr.com/500m-arr-60-engineers-cash-flow-positive-how-higgsfield-actually-runs-with-ceo-alex-mashrabov/). ProductGrowth: "if you don't own the model, you don't own the moat" — [ProductGrowth](https://www.productgrowth.blog/p/higgsfield-growth-teardown)
- Comfy's ecosystem effect: 60,000+ community nodes and 4M users — [Comfy blog](https://blog.comfy.org/p/comfyui-raises-30m-to-scale-open). Chase Jarvis credits ComfyUI as "the open-source engine that started the node-based revolution" that Weavy and Flora build on — [Chase Jarvis](https://chasejarvis.com/blog/the-best-weavy-alternatives-for-creative-pros-free-and-paid/)
- Comfy's own move to App Mode and ComfyHub (hide the graph, share apps by URL) shows the market wants simple apps on top of open workflows — [GlobeNewswire](https://www.globenewswire.com/news-release/2026/03/10/3253141/0/en/comfyui-launches-app-mode-app-builder-and-comfyhub-enabling-anyone-to-run-ai-workflows-without-touching-a-node-graph.html)
- Agents are a distribution channel: Higgsfield's official skills (1,304 stars) and CLI (659 stars) on GitHub, community MCP servers and Claude skills, and HN users running Higgsfield through agents — [GitHub skills](https://github.com/higgsfield-ai/skills), [GitHub cli](https://github.com/higgsfield-ai/cli), [HN](https://news.ycombinator.com/item?id=49818213). BeatDesign makes "any MCP-capable Agent" a headline feature — [GitHub BeatDesign](https://github.com/BeatAPI/BeatDesign). Comfy says agents can use Router directly with a Comfy key — [X](https://x.com/PurzBeats/status/2102791986692465133)
- Ready-to-run desktop builds matter: Open-Generative-AI ships macOS, Windows and Linux installers; ArtCraft ships Windows and macOS; HeliosGen is macOS-only and asks for contributors for other platforms — [GitHub Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI), [GitHub ArtCraft](https://github.com/storytold/artcraft), [GitHub HeliosGen](https://github.com/SegFault42/HeliosGen)
- Open source can make money: ArtCraft self-reports $5M ARR with 65% month-on-month growth — [HN](https://news.ycombinator.com/item?id=49403840) (self-reported). Comfy reached a $500M valuation while committing to keep ComfyUI open — [TechCrunch](https://techcrunch.com/2026/04/24/comfyui-hits-500m-valuation-as-creators-seek-more-control-over-ai-generated-media/)
- Blender Development Fund: €284,352 a month from 7,652 individual and 46 corporate members (incl. NVIDIA, Netflix Animation Studios, Microsoft, AMD, Intel, Adobe, Meta). It pays developers for features, bug fixes and releases (snapshot date not shown) — [Blender Fund](https://fund.blender.org/)
- Blender, LibreOffice and Krita avoided capture because "it is the project itself that is funded", and volunteer committers still outnumber paid developers in Blender (Krita developer, 2019 opinion) — [Calligra/valdyas](https://calligra.org/2019/10/25/back_from_the_blender_conference_2019/). Early on, Blender funded itself with open-movie pre-sales and Krita with training DVDs (Inkscape list, 2015) — [Inkscape list](https://lists.inkscape.org/hyperkitty/list/inkscape-devel@lists.inkscape.org/message/HRKGBCXBXFI6H6GBQ2Q6LH2HIZ5M6NOX), [Krita](https://krita.org/en/posts/2015/funding-krita/)
- The Krita AI Diffusion plugin (10.7K stars, active) shows "AI inside an existing open-source creative tool" lasting longer than standalone studios — [GitHub](https://github.com/Acly/krita-ai-diffusion)
- Trust is the incumbent's weak point: throttled unlimited plans, Discord moderation, X suspension, deepfake and racism reporting — [WION](https://www.wionews.com/world/is-unlimited-a-scam-higgsfield-is-making-customers-wait-for-days-to-generate-even-1-video-1787006158862), [ProductGrowth](https://www.productgrowth.blog/p/higgsfield-growth-teardown), [The Register](https://www.theregister.com/2026/02/06/higgsfield_ai_job_loss/)

### Inferences
What an open-source entrant like ComfyField would need, derived from the findings above:
1. **Formats and presets as plain shareable files** (JSON plus ComfyUI API-format workflows) that anyone can fork, rate and contribute. This replaces Higgsfield's ten-presets-a-day creative team with community supply, as ComfyUI's 60K nodes replaced in-house R&D.
2. **One key, many models, plus local.** Use Comfy Router as the default (one credit balance, explicit provider choice, no silent fallback) and API v2 with comfy-api-proxy to run the same formats on local open weights (H3, LTX-2.5, Wan 2.2) at no cost and in private. Show the estimated cost per run before Send, as a direct contrast to opaque "unlimited" credits.
3. **Model-agnostic adapters.** A mapping layer (like `shared/mapping.js`) so new models are a config change, not a rewrite. This avoids the Fooocus/FramePack failure mode and roughly matches Higgsfield's 24-hour integration.
4. **No-graph UX by default, graph one click away**, matching the direction of Comfy App Mode. Non-experts see a composer; power users can open the workflow.
5. **Agent-native from day one** (MCP server and CLI), since Higgsfield already competes there.
6. **Trust as positioning:** SFW defaults, no likeness or celebrity presets, files owned locally, no throttling. This also meets the competition's legal rules, unlike "unrestricted" clones.
7. **One-click install plus a hosted try-it link**, because unsigned or single-platform desktop builds are a visible weakness of current clones.
8. **A funding path** (sponsor-backed formats, a Blender-style fund, or hosted convenience) so the project does not stall when the maintainer's attention moves on.
- The main competitive threats to ComfyField are ArtCraft (funded, 30K stars, planning an open-source "Higgsfield + OpenRouter") and Comfy's own App Mode and ComfyHub, which may absorb the "simple apps on Comfy" niche.

### Gaps
- No measured comparison (market share, user counts) of Blender, OBS or Krita against commercial incumbents was found; sources were opinion and funding pages.
- OBS-specific evidence was not gathered.
- No data on whether shareable preset marketplaces (e.g. ComfyHub, Civitai workflows) produce sustained usage.
- No evidence yet on how judges weigh the Developer Platform integration depth.
