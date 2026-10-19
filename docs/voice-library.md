# Voice library integration

The Library at `/assets?tab=voices` saves named, consented voice samples. Upload wav, mp3, flac or m4a (11 MB maximum, 3–60 seconds), or record with the microphone. Keep a 3–10 second segment of clean speech from one speaker; aim for the longer end when there is enough clear speech. The server decodes, validates and trims it to a 24 kHz mono wav. Temporary uploads also stay in that media directory and are removed after decoding. No generation or provider key is needed to save a voice. No starter voices are included.

Samples use the existing media writer and stay in the app's media directory. Metadata joins characters, products and brands in `library.json`. Deleting a voice removes its Library record; its sample remains available to existing flows, matching the other Library media lifecycle.

The structure follows the local Higgsfield audit: `sections/kb_howto_models.md`, “Custom voice and consistent AI voice,” and `sections/02_tools_and_studios.md`, “Text to speech.” Those document naming, upload or recording, consent, reusing a voice, and previews. The shorter reference segment is a local model input policy rather than Higgsfield's upload limit.

## Shared control and hook

From a studio page, import:

```jsx
import VoicePicker from '../components/generate/Voices.jsx'
import { useVoices, voiceValue } from '../lib/useLibrary.js'
```

A page with existing selection state adopts the picker in one line:

```jsx
<VoicePicker value={voice} onChange={setVoice} optional />
```

Use `optional={false}` for a required voice. Choosing the model default emits `null`. The old `defaultVoice` export remains compatible with existing imports; new state should start at `null`.

`useVoices()` returns `{ voices, ready, error, refresh, toValue }`. `voices` holds saved metadata. Use `toValue(item)` or `voiceValue(item)` to select a Library record. `useLibrary().voices` and `toRef('voice', item)` also work.

The value is `{ type: 'voice', id, name, sample, url, duration, notes }`, where `sample` and `url` are the same app media URL. Pass the whole value, never its display name, to the format input:

```js
gens.generateFormat(formatById('tts'), { script, voice })
gens.generateFormat(formatById('voice-change'), { audio: recording, voice })
gens.generateFormat(formatById('voice-clone'), { audio: voice, name: voice.name })
```

`voice-clone` uses an `audio` input, so the saved value's `url` supplies that graph's `audio` variable. Other voice slots use `sample`: recipe options place it in `slots.voice`, and existing mapping supplies `vars.voice`. Chatterbox, Qwen3-TTS and Drama 3 graphs load that media URL. Direct model callers use `{ slots: { voice: voice?.sample || null } }` for workflows with a `voice` placeholder; providers without that contract cannot use a saved sample implicitly.

## Studio handoff

No studio page was edited in this lane. Existing `Field` controls with `type: 'voice'` now use the shared picker automatically.

| Page | Exact adoption point |
| --- | --- |
| `FacelessStudio.jsx` | Existing `voice` / `setVoice` and voice `Field` already work. Include `{ voice }` in the `faceless` format values. |
| `Explainer.jsx` | Existing `ownVoice` / `setOwnVoice` and voice `Field` already work. Include `{ voice: ownVoice }` in the `explainer` format values. |
| Creator ads (`ugc-ad`, including a future Ads/Marketing studio caller) | The format's existing voice field works automatically. A custom studio uses `<VoicePicker value={voice} onChange={setVoice} optional />` and passes `{ voice }` to `ugc-ad`. |
| `AudioStudio.jsx` | Both existing `VoicePicker` controls load saved samples and preview them. Pass `{ voice: voice?.sample ? voice : null }` to `tts`, and `{ voice: newVoice, audio: recording }` to `voice-change`. Its current direct generation handler does not forward the selection; the studio owner must connect it. |
| `LipsyncStudio.jsx` | Its existing voice `Field` already works. Pass `{ voice }` to `talking-head` when using the script target. The recorded-audio `lipsync` format has no voice slot. |
| `AppPage.jsx` | Format fields adopt this automatically, including `tts`, `voice-change` and `ugc-ad`; no page edit needed. |
| Shorts, Marketing, Influencer and other custom studio forms | Use the shared picker line above and pass the selected value under the target format's `voice` input. Only add it to a format whose bundled workflow supports a voice sample. |

## Verification

Run `npx vite build` then `node scripts/verify.mjs` on Windows. The auto-discovered `scripts/voice-library-check.mjs` uses the real voice API/storage/decoder in an isolated fixture, without loading provider routes, keys or environment files. It checks save/list/rename/delete/reload, rejection without leftover uploads, four codecs, duration/trim limits, consent, graph variables and mocked format execution. Headless Chrome checks upload, synthetic microphone recording, playback, picker selection, persistence and 390px layout.

Screenshots in `research_notes/screenshots/voice-library/` use an explicitly named synthetic tone fixture. They show the actual built interface and local persistence, not a generated voice or a paid clone result.
