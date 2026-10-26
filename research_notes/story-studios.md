# Story studios

## Evidence and scope

Reviewed the feature audit README, route index, sections 02 (tools and studios), 03 (apps), and 08 (platform). The detailed page evidence is in README lines 510–593 and matching section 02 entries. Explainer's captured page was blank: its controls are documented from the audit's blog and Supercomputer evidence, rather than an observed working generator. No signed-in page or paid generation was used. Read Stitch issues #32 and #41: ordered clips, captions, music, preview and local export, with system ffmpeg or the bundled binary.

## Shorts studio

Higgsfield: choose one of 40+ looks or create a reference preset, upload up to two minutes of footage, auto-detect language, choose vertical or horizontal output, generate at 720p and revisit History. This is footage editing rather than text-to-video. Models are undisclosed.

ComfyField: retain the look grid, upload, language, caption controls and ratio. Require an explicit transcript or footage description because the prompt writer cannot watch video. Write and edit the narration, approve it, then write and edit a JSON shot list and approve it. Footage shots use approved source ranges and default to the existing cloud-compatible Bernini-R restyling workflow. Its 81-frame limit is exposed as a maximum three-second range per approved shot. Turn off restyling to preserve the original footage. Generated cutaways use the same image pipeline as the other studios. Read each shot through the existing text-to-speech format, then stitch source ranges or generated visuals with narration, shot captions and optional uploaded music. Finished exports appear in History and the Library. Automatic transcription and reference-preset extraction remain unavailable and are disclosed on the page. Auto language falls back to English speech; select a language explicitly to override it.

## Faceless studio

Higgsfield: category (education, history, kids, stories), channel description, optional reference link or script upload; choose or write an episode topic; configure 1–5 minutes, landscape or portrait, full animation or still frames, style and narrator; generate script, scenes, voice, music and subtitles. My channels remembers the channel's style, voice and characters. Models are undisclosed.

ComfyField: keep the three-stage channel/topic/episode flow. Include uploaded script contents, category, description, episode topic, reference label, duration, style, ratio and narrator in writer context. Require script and shot-list approval. Generate each scene through Flux on Comfy Cloud; full animation adds LTX-2.5 image-to-video, while frame mode holds the generated image. Generate per-shot speech using the existing Chatterbox text-to-speech format, including the saved voice, language and delivery controls. Stitch in order and persist to the Library. Save channel settings locally for reuse after a finished episode. Episode count and cadence remain planning metadata; rendering creates one episode, without an automatic scheduler. Narrator cards guide text tone and delivery; actual voice identity requires a saved voice. Character continuity is prompt based.

## Explainer

Higgsfield: topic or script, source files or a link, visual style, landscape/portrait/square ratio, 20/30/60/180/300/600 seconds or manual duration, preset or custom narrator; output structured scenes with narration in one consistent style. Models are undisclosed.

ComfyField: retain the composer, style picker and outline preview. Topic, pasted script and actual text/Markdown attachment contents feed the writer. The outline remains a local planning preview; the approved shot list controls rendering. Review script, then shot list, before model generation. Render Flux stills, Chatterbox narration and Stitch assembly with captions and optional music. Source links are context labels: the page explicitly requires pasted source text and does not pretend to fetch URLs or parse office/PDF files. Duration is a writing target; actual narration determines final runtime.

## Shared execution contract

The review flow uses native Writer and Approve nodes through the existing engine, without changing engine semantics. Each approval action sends the edited writer output and then opens its explicit gate. Shot narration must preserve the approved script in order. Media work starts only after shot approval. Generation formats use the shared runner and queue, so intermediate images, motion and speech are Library items. Each shot runs sequentially; retries reuse completed outputs. A failed render stays retryable. Flux and LTX-2.5's existing model files and Chatterbox's pack are marked cloud compatible; provider availability is still determined by the existing routing contract.

Stitch extends `server/stitch.js`, rather than introducing another renderer. It accepts timed stills and per-shot narration, fits visuals to the selected 720p canvas, holds the final frame when speech outlasts a video, replaces clip audio with narration, applies clean/bold/boxed shot captions and mixes optional background music. Captions are scene-level, not word aligned. `/api/stitch/status` checks system or bundled ffmpeg before writer work and reports a missing dependency in the UI. Final Stitch exports use the existing server index and Library adapter.

## Validation

`story-checks.mjs` covers both approval gates, script conservation, attachment context, model/voice/language/aspect bindings, image-to-video chaining, source ranges, music and retry reuse. `story-ui-check.mjs` drives all three production pages with mock writer and Comfy endpoints, real synthetic media and the real Stitch renderer. It checks that model requests wait for both approvals, the final video plays and persists in the Library, missing ffmpeg prevents writer/model calls, and desktop/390px layouts fit. Screenshots in `screenshots/story-studios/` are labelled as mock provider evidence. No provider quality, real speech identity, live-cloud availability or paid runs are claimed by those checks.
