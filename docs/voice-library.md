# Voice library integration

The Library at `/assets?tab=voices` saves named, consented voice samples. Upload wav, mp3, flac or m4a (11 MB maximum, 6–60 seconds), or record with the microphone. Keep a 6–10 second segment of clean speech from one speaker. Chatterbox's pinned node requires at least six seconds; the same minimum applies across the Library. The server decodes, validates and trims to a 24 kHz mono wav, then checks the final trimmed length. Temporary uploads are removed after decoding. No generation or provider key is needed to save a voice. No starter voices are included.

Samples stay in the app's media directory. Metadata joins characters, products and brands in `library.json`. All four Library routes share an in-process update queue; they read inside the transaction after request bodies and decoding finish, then write a temporary file and rename it atomically. This protects concurrent requests in one server process, not independent server processes sharing a home directory.

Deleting removes the Library record. The confirmation explicitly says that the sample file stays available to existing flows. A retained file cannot authorize a new voice imitation after its consent record is deleted; the caller must confirm consent again.

The structure follows the local Higgsfield audit: `sections/kb_howto_models.md`, “Custom voice and consistent AI voice,” and `sections/02_tools_and_studios.md`, “Text to speech.” These document naming, upload or recording, consent, reuse and previews. The segment length is a local model input policy.

## Shared control and generation contract

```jsx
import VoicePicker from '../components/generate/Voices.jsx'
import { useVoices, voiceValue } from '../lib/useLibrary.js'

<VoicePicker value={voice} onChange={setVoice} optional />
```

Use `optional={false}` for a required voice. Model default emits `null`; initialize new selection state to `null`. `useVoices()` returns `{ voices, ready, error, refresh, toValue }`. `toValue(item)`, `voiceValue(item)` and `toRef('voice', item)` return `{ type: 'voice', id, name, sample, url, duration, notes }`, with identical `sample` and `url` media URLs.

The picker also supports a temporary upload. It emits `{ type: 'voice', name, sample, url, consent: false }` and shows an unchecked permission checkbox. Checking it sets `consent: true` for that selection; replacing the upload resets consent. Temporary samples must decode to 6–60 seconds. Saving a Library sample separately requires its own consent checkbox.

Pass the whole value, rather than its display name:

```js
gens.generateFormat(formatById('tts'), { script, voice })
gens.generateFormat(formatById('voice-change'), { audio: recording, voice })
gens.generateFormat(formatById('voice-clone'), { audio: voice, name: voice.name })
```

`voice-clone` retains an `audio` slot, marked `voiceSample: true` to render the picker; its `url` feeds `vars.audio`. Voice slots feed `slots.voice`, then `vars.voice`. `recipeOptions` forwards checked sample consent through `options.voiceConsent`; `comfyVars` carries it as `vars.voiceConsent`. Library values need no client consent flag because the server checks the saved record.

`runComfy` enforces this before reading provider configuration or starting work, covering the app, CLI and model server. A graph with a `voice` placeholder, or `chatterbox_clone`'s `audio` input, requires either a matching Library id/sample URL with `consent: true`, or `vars.voiceConsent === true`. Ids resolve to the saved sample. Explicit uploads must be local media and decode to at least six seconds. This applies to Chatterbox, Qwen3-TTS and Drama 3, including identifiable voice imitation under Drama 3's consent requirement. Optional default voices need no permission flag. Direct callers use `{ slots: { voice: selected.sample }, voiceConsent: selected.consent === true }` with `comfyVars`, or `{ voice: sampleUrl, voiceConsent: true }` with `runComfy` after user confirmation. Do not infer consent from an upload, a name, presenter rights or a truthy string.

## Studio handoff

No studio page was edited. These instructions were checked against the fetched branch tips below; they describe integration work for those branch owners, not completed studio verification.

- `origin/issue-101-studio-wiring` at `673d629`: `AudioStudio.jsx` already uses `FormatWorkspace` for `tts`, `drama3-tts`, `qwen3-tts` and `voice-change`. There are no two direct voice pickers to wire. Keep the workspace's values-to-`generateFormat` path. In its version of `components/formats/Fields.jsx`, an earlier `type === 'voice'` dispatch to `VoiceField` would shadow a later Library picker case. Resolve that shared component in favor of this lane's first voice dispatch to `VoicePicker`; remove the obsolete `VoiceField` dispatch. This lane checks `/apps/tts` and `/apps/voice-clone` for reachable Library pickers. After merging, add workspace checks for each Audio mode and assert the selected sample and consent reach `/api/comfy/run`.
- On the same branch, `LipsyncStudio.jsx` uses `FormatWorkspace` with `talking-head` for Photo and `lipsync` for Video. The script target of `talking-head` has a voice slot and adopts the shared picker automatically. Recorded-audio `lipsync` has no imitation voice slot. Keep those target-specific contracts and check the script target after merging; do not add a voice sample to the recorded-audio target.
- `origin/story-studios` at `ca8a788`: `FacelessStudio.jsx` uses `VoiceSample` with `voice` / `setVoice`; `Explainer.jsx` uses it with `ownVoice` / `setOwnVoice`. Both already pass the value to `StoryPipeline`; `src/lib/storyStudios.js:renderStory` already forwards `values.voice` to `generateFormat(formatById('tts'), ...)` for each narration. Replace or wrap `components/story/VoiceSample.jsx` with `VoicePicker`, preserving `value` / `onChange` and busy-lock behavior (`onBusyChange`). Keep both existing page bindings and the pipeline forwarding. The old upload-only `VoiceSample` has no consent checkbox, so its raw uploads now fail with a permission error until the shared component is adopted. Narrator cards remain writing-tone controls. Check both pages and channel restoration with a Library selection; test every narration request carries the sample, and temporary uploads require checked consent.
- `origin/ugc-influencer` at `d91961c`: `ugc-ad` in `src/lib/formats/ads.js` references missing `ugc_ad.json`; it is hidden and cannot be claimed runnable by adding a picker. Its owner must supply and schema-check a real workflow before exposing it. The runnable creator formats in `src/lib/formats/presenters.js` (`ugc-product-review`, `ugc-unboxing`, `ugc-tutorial`, `ugc-talking-head`) currently have no voice input, although `ugc_presenter_talk.json` and `ugc_presenter_demo.json` accept optional `voice`. Add `{ id: 'voice', type: 'voice', label: 'Voice', optional: true }` to the shared `ugc` inputs. `Influencer.jsx:PresenterFields` delegates ordinary inputs to `Field`, and `createPresenterSession` already uses compiled step options, so the new slot should reach the perform step through `recipeOptions`; verify this with both presenter graphs. Keep fictional-presenter/asset rights separate from speaker permission, and keep script approval before paid work. `influencer-motion` is silent motion transfer and needs no voice slot.
- `AppPage.jsx` already uses the shared `Field`; `tts`, `voice-change` and the marked `voice-clone` audio slot adopt the picker without a page edit. Qwen3-TTS and Drama 3 formats from the studio-wiring branch do the same once merged. Check their request variables after integration; graph-variable checks here do not prove those branch pages ran.
- Shorts, Marketing and other custom forms: first identify a runnable format and workflow with a supported voice slot. Use the shared picker and pass the whole value under that format's voice input; preserve pipeline forwarding and explicit approval. Do not assume a studio name or a planned format supplies that contract.

## Verification

Run `npx vite build` then `node scripts/verify.mjs` on Windows, one command at a time. `scripts/voice-policy-checks.mjs` isolates configuration and forbids provider-key reads and network calls during policy checks. It reproduces a delayed character body overlapping a newer voice save, exercises every asset mutation route and the shared queue, checks atomic-write cleanup/recovery, and validates both consent paths for five bundled workflows, including raw-upload rejection and six-second duration enforcement.

`scripts/voice-library-ui-check.mjs` uses real isolated voice storage and decoding with a mock generation API, without loading provider routes, keys or environment files. Its browser-check filename is compatible with the discovery pattern on `origin/verify-browser-pattern`; this lane does not modify `scripts/verify.mjs`. It checks four codecs, trim boundaries, save/list/rename/delete/reload, format/graph values, upload, synthetic recording, playback, reachable pickers, permission checkbox/reset, persistence and 390px layout. Browser checks use the repository's headless Chrome workflow.

Screenshots under `research_notes/screenshots/voice-library/` show synthetic tone fixtures in the actual built interface. They do not prove a paid clone or a live provider result.
