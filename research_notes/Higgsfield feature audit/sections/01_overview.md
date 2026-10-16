# Higgsfield feature audit

As of 2026-10-16 · prepared for the ComfyField team

Higgsfield is one product made of about 300 user-facing features. There are 58 tools and studios, 92 single-purpose apps, at least 259 motion presets, 45 effects and 33 mixed-media looks. Behind them sit 143 named models, almost all of them closed third-party models, and a large preset and template layer. Open-weight models can already match its video quality; the biggest gaps are in images and in how much one generation can do. This report is our full map: what each feature does, how it is used, which model runs it, a screenshot, and which open-weight model ComfyField should use to match it.

## How the site is organized

The top navigation is the product: Explore, Image, Video, Audio, MCP, API, Genjutsu, Katana, AI Influencer, ChatGPT plugin, Ads Studio, Pricing and Enterprise. The Image, Video and Audio menus each list tools first, then the models Higgsfield resells.

| Menu | Menu screenshot |
|---|---|
| Image: 24 entries (Create Image, Cinematic Cameras, Canvas, Soul Moodboard, Soul ID, AI Influencer, Photodump, Relight, Inpaint, Upscale, Face swap, Character swap, then 12 models) | ![Image menu](screenshots/nav_image.jpg) |
| Video: 26 entries (Create Video, Cinema Studio, Faceless Studio, 3D Jutsu, Shorts Studio, Explainer, Canvas, Mixed Media, Edit Video, Video Upscale, Reframe, Click to Ad, Change Color Palette, then 13 models) | ![Video menu](screenshots/nav_video.jpg) |
| Audio: 10 entries (Text to Speech, Voice Change, Translate, then 7 voice models) | ![Audio menu](screenshots/nav_audio.jpg) |

| What | Count | Where in this report |
|---|---|---|
| Tools, studios, agent surfaces and platform pages | 58 features on 144 routes, plus 41 MCP skills | [Tools and studios](#tools-and-studios) |
| Single-purpose apps | 92 apps in 8 hub categories | [Apps](#apps-100) |
| Motion presets | 229 pages, 134 distinct presets; hubs name at least 259 | [Presets](#presets-motion-effects-and-mixed-media) |
| Effects hub | 45 effects | [Presets](#presets-motion-effects-and-mixed-media) |
| Mixed-media looks | 33 | [Presets](#presets-motion-effects-and-mixed-media) |
| Models Higgsfield sells | 143 named models | [Model catalog](#model-catalog-and-landing-pages), [Open-weight models](#open-weight-models-to-match-higgsfield) |
| Landing and model pages | 135 | [Model catalog](#model-catalog-and-landing-pages) |
| Help center, blog and original series | 104, 272 and 43 pages | [How-to and models reference](how-to-and-models.md) |
| Every page captured | 1,060 pages, about 900 screenshots | [Route index](route-index.md) |

## Headline findings

- **The value is in packaging, not models.** Almost every feature is a preset, a template or a fixed prompt over a resold model. Apps and preset pages almost never name the model they run. The exceptions are Higgsfield's own DoP (motion presets), Soul (images) and Speak (talking heads).
- **Video dominates.** 55 of the 92 apps start in video mode. Image apps cost 1 to 2 credits, video effect and ad templates 15 to 26.
- **Open weights match the video quality but not the size of one generation.**
  - **Quality:** MiniMax H3 is #1 on Artificial Analysis image to video.
  - **Length and resolution:** the open version renders 15 s at 768p. Seedance 2.5 and Wan 3.0 on Higgsfield render 30 s at 1080p to 4K.
  - **References:** open models take 9 to 10. Cinema Studio takes 50.
- **Images are the real quality gap.** The best open text to image scores 1040 against 1218 for GPT Image 2.5 Sunburst. The best open editor scores 1083 against 1199.
- **Higgsfield already resells nine open-weight families**, including MiniMax H3, LTX-2.5, Wan 2.2, InfiniteTalk, Z-Image and Kimi K3. ComfyField can offer those same models with no quality loss.
- **Most missing features are cheap to add.**
  - **Apps:** 46 of the 92 have no ComfyField format, and 34 of those are one photo plus a fixed prompt.
  - **Presets:** about 106 motion presets and effects are missing, plus all 33 mixed-media looks.
- **37 of 45 capabilities can run on Comfy Cloud** with their best open-weight model. Seven more have a Cloud fallback but run best on a rented GPU: TTS, voice cloning, dubbing, foley, video judging, video re-angle and LoRA training. Only explorable 3D worlds is rented-GPU only.

## How this was captured

- **Pages:** every route in Higgsfield's sitemaps plus every item in the Image, Video and Audio menus (hovered open), rendered in a signed-out headless browser on 2026-10-16. Help center, blog and series pages were read as text.
- **Screenshots:** 1440×900, with non-essential cookies declined. Tool pages that need an account show their signed-out view. A few studios render only a frame or a loading state when signed out, and their how-to steps come from the help center and blog instead.
- **Models:** model names come from the pages themselves. Open-weight picks come from two research passes on primary sources (Hugging Face, GitHub, blog.comfy.org, Artificial Analysis), saved in `research_notes/Open weight model lineup/`.
- **Licenses:** picks are made on quality and capability. License notes are kept for after the 2026-10-30 submission, since Comfy is expected to cover them.
- **Limits:** text was cut at 12,000 to 15,000 characters per page, and the changelog has dates only from September 24 onward. Some counts disagree across Higgsfield's own pages; where they do, the sections give both values.

## Contents

1. [Tools and studios](#tools-and-studios)
2. [Apps](#apps-100)
3. [Presets: motion, effects and mixed media](#presets-motion-effects-and-mixed-media)
4. [Model catalog and landing pages](#model-catalog-and-landing-pages)
5. [Platform: plans, credits, API and community](#platform-plans-credits-api-and-community)
6. [Open-weight models to match Higgsfield](#open-weight-models-to-match-higgsfield)
7. Appendix: [How-to and models reference](how-to-and-models.md) (241 features, 134 models, launch timeline)
8. Appendix: [Every captured page](route-index.md) (1,060 pages with links and screenshots)
