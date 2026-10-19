# Audio and talking-head graphs (family `audio-talk`)

Research date: 2026-10-19. Scope: the graph ids `chatterbox_tts`, `chatterbox_clone`, `chatterbox_vc`, `minimax_music3`, `stable_audio3`, `hunyuan_foley`, `infinitetalk`, `infinitetalk_v2v`, and the `openModels` rows `drama3_tts` and `qwen3_tts` in `src/lib/tools.js`. The formats are `tts`, `voice-clone`, `voice-change`, `music`, `sound-effect`, `add-sound`, `talking-head` and `lipsync` in `src/lib/formats/people.js`. The pages are `src/pages/AudioStudio.jsx` and `src/pages/LipsyncStudio.jsx`.

Tags: **[Verified: source]** means I read it in a primary source today. **[Inference]** means my conclusion. No weights were downloaded (I hashed only small config and tokenizer files), no ComfyUI was run, no keys were used.

Sources pinned for every check:

- ComfyUI `45bf90d1c91eecd782643346dcfb73cb0017667f` (v0.41.1), read through `raw.githubusercontent.com/comfyanonymous/ComfyUI/<commit>/...`. Comfy Cloud runs the same version (`cloud_version` v0.480.0, templates 0.7.64). [Verified: https://cloud.comfy.org/api/system_stats]
- Comfy-Org/workflow_templates at `59a3b48bf369c5a15f29a1308bae3e279fa15505` (2026-10-18). [Verified: GitHub API]
- Comfy Cloud model listing `https://cloud.comfy.org/api/experiment/models/<folder>` and `https://comfy.org/cloud/supported-nodes.md`, read 2026-10-19.
- Hugging Face API `api/models/<repo>` and `.../tree/main?recursive=true` for gating, licenses, sizes and sha256 (`lfs.oid`).

## Summary

| Graph | Model | LoRAs | Every file on Comfy Cloud | Node packs | GPU class | Download | Formats |
|---|---|---|---|---|---|---|---|
| `chatterbox_tts` | Chatterbox Multilingual (v2 checkpoint, 23 languages) | none | yes (the pack's own folders) | Fill-ChatterBox (on Cloud) | 24 | 3.21 GB | `tts`, AudioStudio speech, `chatterbox-multilingual` model row |
| `chatterbox_clone` | Chatterbox Multilingual | none | yes | Fill-ChatterBox | 24 | 3.21 GB | `voice-clone` |
| `chatterbox_vc` | Chatterbox VC (S3Gen) | none | yes | Fill-ChatterBox | 24 | 1.06 GB | `voice-change`, AudioStudio change |
| `minimax_music3` | MiniMax Music 3 (DiT fp16, int8 text encoder) | none | **yes** | none (core) | 24 | 14.33 GB | `music`, `minimax-music-3` row |
| `stable_audio3` | Stable Audio 3 Medium, with the template's Qwen3.5 2B prompt rewrite | none | **yes** | none (core) | 24 | 14.96 GB | `sound-effect`, `stable-audio-3` row |
| `hunyuan_foley` | HunyuanVideo-Foley XXL | none | **no** | ComfyUI-HunyuanVideo_Foley (not on Cloud) | 24 | 15.02 GB | `add-sound` |
| `infinitetalk` | InfiniteTalk single on Wan 2.1 I2V 14B (fp8 scaled) | LightX2V I2V 480p rank 64 | no: all but `wav2vec2-chinese-base_fp16` in folder `wav2vec2` | ComfyUI-WanVideoWrapper (on Cloud) | 24 | 35.58 GB | `talking-head` with recorded audio |
| `infinitetalk_tts` | Chatterbox Multilingual, then InfiniteTalk | LightX2V | no: same one file | WanVideoWrapper + Fill-ChatterBox | 24 | 38.79 GB | `talking-head` with a typed script |
| `infinitetalk_v2v` | InfiniteTalk single, video to video | LightX2V | no: same one file | WanVideoWrapper | 24 | 35.58 GB | `lipsync` |
| `drama3_tts` | Fish Audio Drama 3 (FP8 experts), Qwen3-ASR 0.6B for the voice transcript | none | **no** | ComfyUI-Drama3 (not on Cloud) | 24, plus about 48 GB system RAM | 41.71 GB | `fish-drama-3` row |
| `qwen3_tts` | Qwen3-TTS 12Hz 1.7B Base (voice clone) | none | **no** | ComfyUI-Qwen-TTS by flybirdxx (not on Cloud) | 24 | 5.23 GB | `qwen3-tts` row |

Skipped: none. Every graph checked clean against the pinned sources (`check.md`). None has been queued.

How each graph saves its result: the audio graphs end in core **`SaveAudioAdvanced`** with `"format": "flac"`; the video graphs end in core **`SaveVideo`** (`mp4`, `h264`, same keys as `ltx25_i2v.json`). `SaveAudio`, `SaveAudioMP3` and `SaveAudioOpus` are marked deprecated in v0.41.1, and `SaveAudioAdvanced` is the replacement. [Verified: `comfy_extras/nodes_audio.py`] I chose FLAC because ComfyField's `mimeExt('audio/flac')` gives `flac`, which is in `mediaTypes`, while an MP3 output (`audio/mpeg`) would be stored as `.mpeg`, which `mediaTypes` does not know, so it would be read back as `image/png`. [Verified: `server/core.js` `mimeExt`, `mediaTypes`] [Inference: Cloud and the Pod report the content type from the file name] On the Cloud and Pod path, `runComfy` keeps any output whose content type starts with `audio/` as audio. The local `collectComfy` path reads only `images`, `gifs` and `videos`, so it would drop audio. [Verified: `server/core.js`]

## Shared contract notes

- **Uploads.** `{{audio}}` and `{{voice}}` go into `LoadAudio.audio`; `{{image}}` into `LoadImage.image`; `{{video}}` into `LoadVideo.file`. The uncommitted working tree of 2026-10-19 already uploads `LoadAudio` for `audio` and `voice` (`UPLOAD_KEYS` in `server/core.js`) and sets `audio` and `voice` in `comfyVars` (`shared/mapping.js`). `script` and `lyrics` reach a graph only through format `bindings`, and `language` through choice `params`. [Verified: working tree] `LoadAudio` accepts audio and video files and decodes the first audio stream with PyAV. [Verified: `nodes_audio.py` `LoadAudio`, `load`]
- **Optional voice.** `chatterbox_tts`, `infinitetalk_tts` and `drama3_tts` mark their voice loader with `"_meta": {"optional": "voice"}`. Chatterbox links it only into `audio_prompt`, which is optional, so without a voice it speaks in its built-in voice (`conds.pt`). [Verified: `chatterbox_node.py` INPUT_TYPES, `mtl_tts.py` `from_local`] `drama3_tts` carries the same marker on the four nodes of its voice chain (load, ASR loader, transcribe, encode). The working tree's `dropOptional` removes every node with the marker, not only loaders, before the unset check, so this works as drafted. The chain's last link goes into `voices.voice0`, an optional autogrow input. [Verified: `shared/mapping.js` `dropOptional`, `server/core.js` `runComfy`; Drama3 `nodes.py`]
- **Model downloads by packs.** Fill-ChatterBox, the Foley pack and the Qwen-TTS pack read fixed folders under the ComfyUI root, not `folder_paths` keys. On the Pod, ComfyUI lives on the container disk (`/root/h3/ComfyUI`), which a resume wipes, and models live on `/workspace/models`. [Verified: `server/podBoot.js`] So the Pod should link `<ComfyUI>/models/chatterbox`, `<ComfyUI>/models/hunyuan_foley` and `<ComfyUI>/models/qwen-tts` to folders on the volume, and download into them. `packs.json` lists every such file with repo, path, size and sha256. Their names collide (`conds.pt`, `s3gen.pt` and `config.json` exist in two folders each), so they need keys by `dir/name`, not the flat `MODEL_FILES` key. The Pod downloader accepts only flat `dir` names from `DIRS` and `SAFE_NAME` file names, and fetches `resolve/main`. [Verified: `server/pod-statusd.py` `valid`, `fetch`] [Inference: Python keeps the symlinked path in `__file__`, because ComfyUI joins `custom_nodes/<folder>` without `realpath`; verified in `nodes.py` `init_external_custom_nodes`]
- **New folders.** `wav2vec2` (registered by WanVideoWrapper) and `asr` (registered by ComfyUI-Drama3) need entries in the Pod's `DIRS` and `extra_model_paths.yaml`; `hunyuan_foley` needs the link above. [Verified: `multitalk/nodes.py` line 14, Drama3 `nodes.py` `register_folder("asr", ...)`]

---

## 1. Chatterbox: `chatterbox_tts`, `chatterbox_clone`, `chatterbox_vc`

### The pack

- **Repo:** https://github.com/filliptm/ComfyUI_Fill-ChatterBox. No tags or releases. Pin: newest commit `f7d7a16187430abcaf91a3039b9c83aa9960816a` (2026-08-24, "Fix optional Perth imports"), pyproject version 1.0.5, no license field. [Verified: GitHub API]
- **On Cloud:** yes, "Fill-ChatterBox" with FL Chatterbox TTS, Multilingual TTS, Turbo TTS, VC and Dialog TTS. [Verified: supported-nodes.md] Cloud also has the model folders `chatterbox/chatterbox`, `chatterbox_multilingual`, `chatterbox_turbo` and `chatterbox_vc`, with files renamed with a prefix (for example `chatterbox_multilingual_t3_mtl23ls_v2.safetensors`). [Verified: Cloud listing] [Inference: Cloud runs its own copy of the pack that reads those names; the node classes and inputs match the official templates]
- **Nodes used:** `FL_ChatterboxMultilingualTTS` (text, language, exaggeration 0 to 2, cfg_weight 0 to 1, temperature, repetition_penalty, min_p, top_p, seed up to 4294967295; optional `audio_prompt`, `use_cpu`, `keep_model_loaded`) and `FL_ChatterboxVC` (input_audio, target_voice, seed; optional use_cpu, keep_model_loaded). Both return `AUDIO, STRING`. [Verified: `chatterbox_node.py`]
- **requirements.txt:** numpy, resampy, librosa, s3tokenizer, transformers, diffusers, omegaconf, conformer, safetensors, soundfile; `resemble-perth` (watermark) is commented out. [Verified] The multilingual tokenizer also imports `pykakasi` (Japanese), `spacy_pkuseg` (Mandarin), `dicta_onnx` (Hebrew) and `russian_text_stresser` (Russian), and only logs a warning and skips that language's text normalization when one is missing. The formats offer Japanese and Mandarin, so the Pod should also install `pykakasi` and `spacy-pkuseg`. [Verified: `models/tokenizers/tokenizer.py`] [Inference: quality, not a crash]
- **Models it downloads by itself:** on first use, `hf_hub_download` from `ResembleAI/chatterbox` (MIT, ungated) into `<ComfyUI root>/models/chatterbox/<sub>/`, a path the node computes from its own file, so `extra_model_paths.yaml` does not apply. [Verified: `chatterbox_node.py` `get_chatterbox_models_dir`, `load_multilingual_model`, `load_vc_model`]
  - `chatterbox_multilingual/`: `ve.pt`, `t3_mtl23ls_v2.safetensors` (2.14 GB), `s3gen.pt` (1.06 GB), `grapheme_mtl_merged_expanded_v1.json`, `conds.pt`, `Cangjie5_TC.json`: 3.21 GB.
  - `chatterbox_vc/`: `s3gen.pt`, `conds.pt` (the same bytes as above): 1.06 GB.
  - sha256 for all eight in `packs.json`. LFS files from the HF API; the three JSON files hashed from a download today (sizes match the API). [Verified]
- **Version:** the pack loads Multilingual **v2** (`t3_mtl23ls_v2`). ResembleAI's repo also has `t3_mtl23ls_v3.safetensors` and `s3gen_v3`, but no pack commit loads them, and Cloud has only the v2 files. [Verified: HF tree, pack code, Cloud listing] The lineup note's "Multilingual V3" is not what runs.
- **Limits:** the reference voice uses only its first 6 s (T3, 16 kHz) and first 10 s (S3Gen, 24 kHz). [Verified: `ENC_COND_LEN`, `DEC_COND_LEN` in `mtl_tts.py`, `vc.py`] Generation stops at 1000 speech tokens (25 per second), so about 40 s per run; the node does not split long text. [Verified: `max_new_tokens=1000`] [Inference: 40 s] Output is 24 kHz.
- **Failure mode:** on an exception the TTS node returns one sample of silence (`zeros((1, 2, 1))`) and the reason only in its STRING output; the VC node can return its input unchanged. ComfyUI sees success. [Verified: `chatterbox_node.py` except paths] The app should treat an audio result under about 0.1 s as a failure. [Inference]
- **License:** MIT; outputs are watermarked only when `resemble-perth` is installed. [Verified: HF API, `tts.py`]

### `chatterbox_tts.json`

- **Template:** `audio-chatterbox_tts_multilingual` (2026-01-22): LoadAudio → FL Chatterbox Multilingual TTS (`English (en)`, exaggeration 0.5, cfg_weight 0.5, temperature 0.8, repetition_penalty 2, min_p 0.05, top_p 1) → save. [Verified: template JSON]
- **Nodes:** `LoadAudio {{voice}}` (optional) → `FL_ChatterboxMultilingualTTS` → `SaveAudioAdvanced` (flac).
- **Placeholders:** `{{prompt}}` (the format prompt is `{script}`), `{{language}}`, `{{exaggeration}}`, `{{cfg_weight}}`, `{{seed}}`, `{{voice}}`.
- **Deviations:** saves FLAC through `SaveAudioAdvanced` instead of the deprecated `SaveAudioMP3`. `keep_model_loaded` stays false as in the template, so a shared Pod gets the VRAM back. [Inference]
- **Format change:** `tts` needs a `language` choice whose params are the node's exact labels, because the combo rejects bare codes: `{ language: 'English (en)' }`, `'Spanish (es)'`, `'French (fr)'`, `'German (de)'`, `'Japanese (ja)'`, `'Portuguese (pt)'`, `'Hindi (hi)'`, `'Korean (ko)'`, `'Chinese (zh)'` (23 in all). [Verified: `SUPPORTED_LANGUAGES` in `mtl_tts.py`; `validate_inputs` "value_not_in_list" in `execution.py`] A STRING-to-COMBO bridge (`ConvertStringToComboNode`) would not help: validation rejects a `COMBO` link into a V1 node's list-typed input. [Verified: `comfy_execution/validation.py` `validate_node_input`] AudioStudio's "Auto detect" has no Chatterbox equivalent; default to English. The existing `exaggeration` / `cfg_weight` params fit the node's ranges.

### `chatterbox_clone.json`

- **Template:** `audio-chatterbox_tts` ("Voice Cloning with TTS"), which uses the English `FL_ChatterboxTTS`. [Verified]
- **Nodes:** `LoadAudio {{audio}}` → `FL_ChatterboxMultilingualTTS` (`English (en)`, 0.5 / 0.5) → save. Reads the format's preview line (`{{prompt}}`) in the new voice.
- **Deviation:** the multilingual node instead of the English one, so the preview sounds like what `tts` and `talking-head` will make with the saved voice, and a Pod downloads one model set. [Inference]
- **Format note:** Chatterbox clones zero-shot: the saved voice is just the sample clip, and the graph only proves it. The `name` input is for the app, not the graph. Only the first 10 s of the sample matter, so the app could keep the first 10 to 15 s of clean speech as the voice clip. [Verified: cond lengths above] [Inference: advice]

### `chatterbox_vc.json`

- **Template:** `audio-chatterbox_vc`: LoadAudio (target voice), LoadAudio (input) → AudioCrop `0:00`–`0:27` (audio-separation-nodes pack) → FL Chatterbox VC → save. [Verified]
- **Nodes:** `LoadAudio {{audio}}` → core `TrimAudioDuration` (0 to 27 s) → `FL_ChatterboxVC` ← `LoadAudio {{voice}}` → save.
- **Deviation:** core `TrimAudioDuration` replaces the custom `AudioCrop`, same 27 s. [Verified: core schema] The template does not say why it crops; S3Gen tokenizes the whole input in one pass. [Inference: keep the crop until a longer run is tested]
- **Format note:** `voice-change` should say "up to 27 seconds", or the app should cut longer recordings into pieces. A video with speech works as the recording, because `LoadAudio` reads its audio stream.

---

## 2. Music: `minimax_music3.json`

- **Model:** MiniMax Music 3 (8B global LLM, 0.6B local LLM, flow-matching synthesis; songs up to 5 min; 32 kHz stereo). Open weights `MiniMaxAI/MiniMax-Music3`, created 2026-08-07, not gated. Repack `Comfy-Org/MiniMax-Music-3`, not gated. [Verified: HF card, HF API] Native core nodes `MiniMaxMusic3TextEncode` and `EmptyMiniMaxMusic3LatentAudio`, not the partner API node `comfy_api_nodes/nodes_minimax.py`. [Verified: `comfy_extras/nodes_minimax_music.py`]
- **Template:** `audio_minimax_music_3` (2026-08-13), subgraph "Text to Music (MiniMax Music 3)", same as the core blueprint. [Verified]
- **Nodes:** UNETLoader `minimax_music3_dit_fp16` → KSampler (30 steps, cfg 1.7, `euler`, `simple`, denoise 1); CLIPLoader `minimax_music3_text_encoder_pruned_int8_convrot` (type `minimax`) → `MiniMaxMusic3TextEncode` (caption, lyrics, seed, max_duration, cfg_scale 1.7, top_k 50) → positive, and `ConditioningZeroOut` → negative; `EmptyMiniMaxMusic3LatentAudio` takes its length from the encoder's `seconds` output (the AR model decides when the song ends); VAELoader `minimax_music3_dav` → `VAEDecodeAudioTiled` (1536, 64, the template's "tiled decode" switch on) → save. One `{{seed}}` feeds the encoder and the sampler, as the template's single seed node does. [Verified: template widgets]
- **Placeholders:** `{{prompt}}` (the brief), `{{lyrics}}`, `{{duration}}` (30, 60 or 120 from the `length` choice; the node allows up to 360), `{{seed}}`.
- **Deviations:** none besides FLAC.
- **Format changes:** `music` needs `bindings: { lyrics: 'lyrics' }`. The lyrics input is optional, but `runComfy` refuses a run with an empty placeholder (`unsetInput`), so an empty field must become `[Instrumental]`, MiniMax's own section tag. [Verified: `server/core.js` `unsetInput`; HF card lists `[Instrumental]`] [Inference: a lyrics text of only `[Instrumental]` gives an instrumental] MiniMax recommends a structured caption (Global Metadata, Vocal Details, Arrangement), but a short description works. [Verified: HF card "Prompt Enhancement"]
- **VRAM:** about 14 GB of weights; the card gives about 22 GB with CPU offload at full precision. 24 GB class. [Verified: HF card] [Inference: class]
- **License:** MiniMax-Music3 Community License. A commercial product must show "MiniMax-Music3" in its UI, and larger companies need a separate license. [Verified: LICENSE, sections 3.1 and 3.2] The Comfy-Org repack is tagged apache-2.0, but the original license governs the weights. [Inference]

## 3. Sound effects: `stable_audio3.json`

- **Model:** Stable Audio 3 Medium, `stable_audio_3_medium.safetensors` from `Comfy-Org/stable-audio-3`, with the T5Gemma text encoder `t5gemma_b_b_ul2`. Native core support. [Verified: template, Cloud listing] The official `stabilityai/stable-audio-3-medium` is gated (`auto`); the Comfy-Org repack is not. [Verified: HF API]
- **Template:** `audio_stable_audio_3_medium` (2026-05-20), subgraph "Audio Generation (Stable Audio 3 Medium)", with `use_reprompt` on and four category system prompts. [Verified]
- **Nodes:** CheckpointLoaderSimple (model and VAE); CLIPLoader `t5gemma_b_b_ul2` (type `stable_audio`) → CLIPTextEncode positive and empty negative; CLIPLoader `qwen3.5_2b_bf16` (type `stable_diffusion`) → `TextGenerate` (max_length 256, sampling on, temperature 0.7, top_k 64, top_p 0.95, min_p 0.05, repetition_penalty 1.05, seed 0, presence_penalty 0, thinking off, default template on) whose text becomes the positive prompt; `EmptyLatentAudio` (`{{duration}}` s) → KSampler (8 steps, cfg 1, `lcm`, `simple`) → `VAEDecodeAudio` → save. All values are the template's. [Verified: template widgets]
- **The rewrite prompt:** the template builds `<category system prompt>\n\nInput: <user text>\nTarget audio length: <seconds> seconds.\nOutput:` with `StringReplace` and `JsonExtractString` nodes. The graph holds the same string as one literal with the **SFX** system prompt pasted in and `{{prompt}}` and `{{duration}}` inside it, which the app fills in place. [Verified: template nodes 38, 39, 40, 49]
- **Length:** `EmptyLatentAudio` makes a 2048-sample latent; ComfyUI rescales an empty latent to the model's 4096 ratio and 256 channels before sampling, and Stable Audio 3 takes `seconds_total` from the latent length. So `{{duration}}` alone sets the length. [Verified: `comfy/sample.py` `fix_empty_latent_channels`, `latent_formats.StableAudio3`, `model_base.StableAudio3.extra_conds`]
- **Deviation:** the template's PreviewAny and switch nodes are dropped (UI only); the category is fixed to SFX.
- **Format:** `sound-effect` works as it is (`duration` 2, 5 or 10; the node's minimum is 1 s). The rewrite may drop the format's "Clean, isolated recording, no music." [Inference]
- **Optional saving:** turning the rewrite off saves the 4.55 GB Qwen3.5 2B file (10.41 GB total), at the cost of short prompts. [Inference]
- **License:** Stability AI Community License (free under US$1M revenue, per the lineup note). [Verified: HF `license_name: stable-audio-community`]

## 4. Sound for a video: `hunyuan_foley.json`

- **Model:** HunyuanVideo-Foley XXL (`hunyuanvideo_foley.pth`, 10.30 GB) with Synchformer, the DAC VAE `vae_128d_48k.pth`, SigLIP2 base-patch16-512 and LAION CLAP. Tencent: 20 GB VRAM for XXL (12 GB with offload), 16 GB for XL. 48 kHz stereo. [Verified: GitHub README, HF tree] No core node, no Comfy template, and no Cloud folder or pack for it. [Verified: ComfyUI tree at the pin, template list, Cloud listing and supported-nodes]
- **Pack:** https://github.com/BobRandomNumber/ComfyUI-HunyuanVideo_Foley, pin `b94f7aca877ff2be5bc264b057abee3dac682c1b` (2026-02-18, v0.4.2). Nodes `HunyuanFoleyModelLoader`, `LoadDACHunyuanVAE`, `HunyuanFoleySampler`, `DACHunyuanVAEDecode` (V3 nodes; IMAGE frames, FLOAT fps, LATENT, AUDIO). requirements: diffusers, timm, transformers>=4.49.0, descript-audiotools, omegaconf. [Verified: repo files]
  - Why this pack: it never downloads by itself (`local_files_only`), so the Pod can place every file with a pinned sha256, and it takes frames and fps from core `GetVideoComponents`, as its own example does. [Verified: `hunyuan_foley.py`, `example_workflows/Hunyuan-Foley.json`] The pack Tencent's README links, `if-ai/ComfyUI_HunyuanVideoFoley` (180 stars, last commit 2025-09-08), downloads models itself and writes files from inside its generator node. [Verified: Tencent README, `nodes.py`]
- **Files the pack reads:** `<ComfyUI>/models/hunyuan_foley/` holds `hunyuanvideo_foley.pth`, `synchformer_state_dict.pth`, `siglip2/{model.safetensors, config.json, preprocessor_config.json}` and `clap/{model weights, config.json, merges.txt, vocab.json}`; the VAE combo lists `vae` files whose name contains `vae_128d_48k`. [Verified: `hunyuan_foley.py`, README]
- **Order matters on the Pod:** the loader's schema lists the folder only if a checkpoint is already there, and returns a schema with no outputs otherwise. ComfyUI caches a V3 node's `RETURN_TYPES` the first time it builds the schema. So the files must be in place before ComfyUI loads the pack, or ComfyUI must restart after the download. [Verified: `HunyuanFoleyModelLoader.define_schema`; `comfy_api/latest/_io.py` `GET_SCHEMA`]
- **Graph:** LoadVideo `{{video}}` → Video Slice (`{{start}}`, `min({{duration}}, 15)`) → GetVideoComponents → `HunyuanFoleySampler` (prompt, negative `noisy, harsh`, guidance 4.5, 50 steps, seed) → `DACHunyuanVAEDecode` → `CreateVideo` (original frames and fps, new audio) → SaveVideo. Model `hunyuan_foley` / `hunyuanvideo_foley.pth`, VAE `vae_128d_48k.pth`. Defaults are Tencent's and the pack example's. [Verified: `constants.py`, example]
- **Deviations:** the 15 s cap is `MAX_VIDEO_DURATION_SECONDS` in the pack's constants; the node itself does not enforce it. [Verified] `unload_models_after_use` is true (the example has false) because the pack keeps its models in VRAM outside ComfyUI's model management, which would starve the next graph on a shared Pod. [Verified: `unload_foley_models`] [Inference: the reason]
- **CLAP file:** the pack README asks for `model.safetensors` from `laion/larger_clap_general` branch `refs/pr/2` (commit `16c8cc3159a3c8a31e8ff5ef1f66b0d9ab3667db`, sha256 `c3d0e564...`). The Pod downloader fetches `resolve/main` only, so `packs.json` lists main's `pytorch_model.bin` (sha256 `314eb00c...`), which transformers also loads from that folder. [Verified: HF API, HEAD of the PR file] [Inference: transformers prefers safetensors and falls back to the .bin]
- **Format changes:** `add-sound` reads `{{start}}` and `{{duration}}`, and `comfyVars` sets `duration` to 5 when there is no trim. The format should send the clip's length (cut at 15 s) or show a trim. [Verified: `shared/mapping.js` `comfyVars`] The prompt goes to CLAP (77 tokens) and is truncated there. [Verified: config `text_length: 77`]
- **License:** Tencent Hunyuan Community License; the lineup note records that it excludes the EU, UK and South Korea. SigLIP2 and CLAP are Apache-2.0. [Verified: HF API `license_name: tencent-hunyuan-community`, apache-2.0 tags]

## 5. Talking heads and lipsync: `infinitetalk`, `infinitetalk_tts`, `infinitetalk_v2v`

### Why WanVideoWrapper and not the core nodes

- ComfyUI has InfiniteTalk in core: `WanInfiniteTalkToVideo` with `ModelPatchLoader` (`wan2.1_infiniteTalk_single_fp16`) and `AudioEncoderLoader` / `AudioEncoderEncode` (`wav2vec2-chinese-base_fp16`), and the official template `video_wan2_1_infinitetalk` (2026-01-26). All its files are on Cloud. [Verified: `nodes_wan.py`, template, Cloud listing]
- But one core node makes one 81-frame window (3.24 s at 25 fps). The template chains a base window and one extend by hand, and its note tells the user to copy the extend group per 3 s of audio. [Verified: template MarkdownNote] Core has no node that reads an audio clip's length, so a static graph cannot size the chain or a `StartLoop` to the audio. [Verified: every `comfy_extras` file at the pin] The template also joins the extend window without dropping its 9 motion frames, although `WanInfiniteTalkToVideo` returns `trim_image` for that. [Verified: template links; `InfiniteTalkOuterSampleWrapper` puts the motion frames back before decode]
- WanVideoWrapper's `WanVideoSampler` loops the windows itself until the audio ends: `MultiTalkWav2VecEmbeds` takes `num_frames` as a maximum and uses the audio length when it is shorter. This is the official Comfy template `templates-wan2_1_infinitetalk_music` ("Audio-Driven Character Lip Sync Video", 2026-02-19) and Kijai's own I2V and V2V examples. [Verified: `multitalk/nodes.py`, template, example notes] The wrapper is on Cloud. [Verified: supported-nodes.md]
- This also answers the format's question: **yes, one graph should run Chatterbox and then InfiniteTalk** (`infinitetalk_tts`). The wrapper measures the speech inside the graph, so the app does not need to know its length first. Chatterbox runs first and frees its model (`keep_model_loaded` false), then the 14B model loads. [Inference]

### The pack

- **Repo:** https://github.com/kijai/ComfyUI-WanVideoWrapper, Apache-2.0, no tags. Pin: newest commit `088128b224242e110d3906c6750e9a3a348a659b` (2026-05-24). [Verified: GitHub API]
- **Nodes:** WanVideoModelLoader, WanVideoVAELoader, WanVideoLoraSelect, WanVideoBlockSwap, WanVideoTextEncodeCached, WanVideoClipVisionEncode, WanVideoImageToVideoMultiTalk, WanVideoSampler, WanVideoDecode, WanVideoEncode (V2V only), MultiTalkModelLoader, Wav2VecModelLoader, MultiTalkWav2VecEmbeds. MultiTalk nodes are an optional module of the pack, so check for them by name. [Verified: `__init__.py`, sources]
- **requirements.txt:** ftfy, accelerate>=1.2.1, einops, diffusers>=0.33.0, peft>=0.17.0, sentencepiece>=0.2.0, protobuf, pyloudnorm, gguf>=0.17.1, opencv-python, scipy. [Verified]
- **Downloads by itself:** none in these graphs. `Wav2VecModelLoader` reads the folder `wav2vec2` the pack registers (`<ComfyUI>/models/wav2vec2`). [Verified]
- **Why the graphs are Pod-only:** Cloud has every file except that the wav2vec2 file sits in Cloud's `audio_encoders` folder, and Cloud lists no `wav2vec2` folder. [Verified: Cloud listing] The template's `DownloadAndLoadWav2VecModel` (`TencentGameMate/chinese-wav2vec2-base`, `fp16`, `main_device`) snapshots the HF repo into `<ComfyUI>/models/transformers/` at run time; swapping node "Wav2VecModelLoader" for it would leave only Cloud files in the graph, but I could not check that Cloud allows that download. [Verified: `fantasytalking/nodes.py`] [Inference: untested on Cloud]

### Graph details

- **Model files:** `Wan2_1-I2V-14B-480p_fp8_e4m3fn_scaled_KJ` (16.64 GB, quantization `disabled`, which auto-detects scaled fp8), `Wan2_1-InfiniTetalk-Single_fp16` (Kijai's spelling; same sha256 as Comfy-Org's `wan2.1_infiniteTalk_single_fp16`), `umt5-xxl-enc-bf16`, `Wan2_1_VAE_bf16`, `clip_vision_h`, LoRA `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16` at 1.0 (unmerged, as the template), `wav2vec2-chinese-base_fp16`. [Verified: HF API, template, Kijai tooltips]
- **Template values kept:** WanVideoModelLoader `fp16_fast`, `offload_device`, `sdpa`; TextEncodeCached bf16, no disk cache, `gpu`; ClipVisionEncode 1, 1, `center`, `average`, offload, tiles 0, ratio 0.5; MultiTalk embeds loudness normalize on, 25 fps, audio_scale 1, audio_cfg 1, `para`; ImageToVideoMultiTalk window 81, motion frames 9, colormatch off, mode `infinitetalk`; sampler 7 steps, cfg 1, shift 11, `dpm++_sde`, `comfy` RoPE; decode untiled; CreateVideo 25 fps. [Verified: template widgets]
- **Deviations, all graphs:**
  - fp8 scaled 14B model instead of the template's `wan2.1_i2v_480p_14B_fp16` (32.79 GB) plus **WanVideoBlockSwap** 20 blocks (non-blocking, prefetch 1), from Kijai's examples, so it runs on the 24 GB card. [Verified: Kijai examples] [Inference: fits 24 GB]
  - Size from the photo or clip: about 832×480 pixels at the source's aspect, multiples of 16 (`16*round(sqrt(399360*w/h)/16)`), instead of the template's fixed 480×832 crop through KJNodes `ImageResizeKJv2`. `WanVideoImageToVideoMultiTalk` stretches `start_image` to the size without cropping, so the graph scales with core `ImageScale` first. [Verified: `multitalk/nodes.py` `common_upscale(..., "disabled")`]
  - `num_frames` 750 (30 s), the template's value, so a run fits the Pod's 30-minute job timeout. The output is cut to the generated frame count with `ImageFromBatch` (the sampler pads the last window), and the audio to 30 s with `TrimAudioDuration`. [Verified: `runComfy` `timeoutMs: 30*60*1000`; sampler note on padding] [Inference: timing]
  - No `AudioSeparation` (vocal isolation, audio-separation-nodes pack): speech from Chatterbox or a voice recording is clean. Recorded audio with music under it would move the lips less well. [Inference]
- **`infinitetalk.json`:** LoadImage `{{image}}`, LoadAudio `{{audio}}`, `{{prompt}}`, `{{seed}}`.
- **`infinitetalk_tts.json`:** the same with `FL_ChatterboxMultilingualTTS` (`{{script}}`, `{{language}}`, `{{exaggeration}}`, `{{cfg_weight}}`, `{{seed}}`, optional `{{voice}}`) as the audio source.
- **`infinitetalk_v2v.json`:** follows Kijai's `wanvideo_2_1_14B_V2V_InfiniteTalk_example_02`: the trimmed clip's frames are `start_image` (the loop takes each window's reference from the source frames), the first frame feeds CLIP vision, `WanVideoEncode` of the frames feeds `samples`, and the sampler runs 4 steps from step 2 with noise added (half denoise), audio_scale 1.5. [Verified: example widgets; `multitalk_loop.py` takes `multitalk_start_image[current_condframe_index]` and slices `samples` per window] Deviation: the embeds and the output use the clip's own fps (at most 30) instead of the example's fixed 25, so all source frames are used and the clip keeps its speed. A clip above 30 fps plays slower. [Inference: InfiniteTalk was trained at 25 fps; 24 to 30 fps should hold up, untested]
- **VRAM and RAM:** 24 GB with block swap; system RAM for the swapped blocks and the fp8 model. [Inference]
- **License:** InfiniteTalk Apache-2.0 (MeiGen-AI); Wan 2.1 Apache-2.0. [Verified: HF API]

### Format and page changes

- `talking-head`: use step `targets` on `source`: `script` → `infinitetalk_tts`, `audio` → `infinitetalk`. Add `bindings: { script: 'script' }`. Change the `language` params to Chatterbox labels (`'English (en)'` ... `'Chinese (zh)'` for Mandarin). Drop `{script}` from the video prompt; it describes the scene, and the script goes to Chatterbox. Chatterbox has **no accent control**, so the `accent` choice does nothing; the accent comes from the voice sample. Remove it, or turn it into sample voices. Keep scripts to about 30 s (the cap).
- `lipsync`: the prompt should describe the scene ("A person talks to the camera."), not give an instruction, because UMT5 conditioning is descriptive. `{{duration}}` should be the clip's length (or 0, which `Video Slice` reads as "whole clip"), not the default 5 s. [Verified: Video Slice tooltip] If the audio is longer than the clip, the wrapper continues from the last frame. [Verified: example note]
- LipsyncStudio: the 720p pill needs the 720p I2V model (`Wan2_1-I2V-14B-720p_fp8_e4m3fn_scaled_KJ`, on Cloud) and more VRAM; the graphs make about 480p. "Match the audio" is what the graphs do, up to 30 s. The Wan 2.2 S2V engine has no graph here.

---

## 6. `drama3_tts.json` (Fish Audio Drama 3)

- **A ComfyUI path now exists.** The lineup note (2026-10-16) found none, but `PedroMarinhoDev/ComfyUI-Drama3` (created 2026-10-14, 82 stars, GPL-3.0) runs the open weights natively, with experts kept in system RAM and a VRAM cache, from 8 GB of VRAM. Fish Audio also published `fishaudio/drama-3-int4` on 2026-10-14. [Verified: GitHub API, README, HF API]
- **Pin:** `67a733a96890637dc27b1914974ad00c569405fb` (2026-10-17). No requirements file ("nothing to pip install"); CUDA kernels compile through PyTorch's NVRTC with a fallback. Tested on ComfyUI v0.41.0 and on master after v0.41.2; minimum v0.40. [Verified: README, `drama3/kernels.py`] Five days old and changing daily: re-read `nodes.py` before moving the pin. [Inference]
- **Files:** `drama3_fp8experts_bf16.safetensors` (38.58 GB, Fish Audio's FP8 experts byte for byte, `diffusion_models`), `drama3_codec.safetensors` (1.57 GB, `vae`), `qwen3_asr_0.6b_bf16.safetensors` (1.56 GB, folder `asr` the pack registers), from `PedroMarinhoDev/Drama-3-ComfyUI` and `PedroMarinhoDev/Qwen3-ASR-ComfyUI`, both ungated. [Verified: HF API] The README says to start with FP8 and to take int8 (38.70 GB) on cards under 24 GB; W4A8 (24.60 GB) "falls silent more often". [Verified]
- **Graph:** Drama3Loader (FP8, experts `in RAM`, cache 0 = what is free, no second GPU) and Drama3CodecLoader; optional voice chain LoadAudio `{{voice}}` → Qwen3ASRLoader → Qwen3ASRTranscribe (auto language) → Drama3EncodeVoice (clip and its transcript); Drama3Generate (`{{prompt}}`, `voices.voice0`, seed, temperature 1.0, top_p 0.9, top_k 0, max_frames 600, split long text, one take per line) → Drama3Decode (shorten long pauses) → save. These are the pack's defaults, which it documents as Fish Audio's server and Space settings. [Verified: `nodes.py` tooltips, `drama3_voice_clone.json`]
- **Deviations:** the 0.6B ASR instead of the example's 1.7B; the README measured nearly the same transcripts at half the time. [Verified: README] Without a voice, Drama 3 invents a voice per seed. [Verified: README]
- **Limits:** about 48 GB of system RAM for the FP8 file with experts in RAM; 24 GB-class VRAM gives 2 to 4 times real time. [Verified: README table] The Pod's RAM per GPU class is not in the repo. [Inference: check before shipping] The README warns that a transcript missing the clip's last words is the most common reason a take falls silent, so saved voices should end on a sentence break. [Verified]
- **License:** weights under the Fish Audio Community License v1.0 (2026-10-13), which allows research and non-commercial use and limited commercial use; the HF card still tags `fish-audio-research-license`. [Verified: LICENSE, HF API]

## 7. `qwen3_tts.json` (Qwen3-TTS)

- **ComfyUI path:** `flybirdxx/ComfyUI-Qwen-TTS` (1,949 stars, newest commit `a1328c8a731eff82cf4c205b31bdfb7f29d817f4`, 2026-09-22, no license file) runs the open weights. [Verified: GitHub API] It is **not** the Cloud pack of the same name: Cloud's "ComfyUI-Qwen-TTS" is `mailzwj/ComfyUI-Qwen-TTS`, whose `Qwen3TTS` node calls Alibaba's paid DashScope API. [Verified: supported-nodes.md, `QwenTTS.py`] Cloud does list `qwen-tts/Qwen3-TTS-12Hz-*` model folders, but no node pack that reads them. [Verified: Cloud listing] [Inference: not usable on Cloud today]
- **Graph:** LoadAudio `{{voice}}` → `FB_Qwen3TTSVoiceClone` (1.7B, bf16, language Auto, `x_vector_only` true, sampling defaults top_p 1, top_k 50, temperature 0.9, repetition_penalty 1.05, max_new_tokens 2048, unload after) → save. [Verified: `nodes.py` INPUT_TYPES, `__init__.py` mapping]
- **Deviations and limits:** `x_vector_only` true clones from the speaker embedding alone, because saved voices have no transcript; full in-context cloning needs `ref_text`. [Verified: tooltip] `unload_model_after_generate` true frees the GPU for the next graph. The graph **requires** a voice (`ref_audio` or a prompt is mandatory); a voice-less run needs the pack's `FB_Qwen3TTSVoiceDesign` (1.7B VoiceDesign model) in a second graph. [Verified: `generate` raises without a reference]
- **Downloads by itself:** `snapshot_download` of `Qwen/Qwen3-TTS-12Hz-1.7B-Base` and `Qwen/Qwen3-TTS-Tokenizer-12Hz` (Apache-2.0, ungated) into `<ComfyUI>/models/qwen-tts/<repo name>/` when the folder is missing; the model is matched by folder name. All 15 files with sha256 in `packs.json`. [Verified: `nodes.py` `download_model_if_needed`, `check_and_download_tokenizer`; HF API; small files hashed today]
- **requirements.txt** pins `transformers>=4.57.0` and `onnxruntime-openvino`, which can replace `onnxruntime-gpu` that other packs use. [Verified] [Inference: install without it; the TTS path does not import onnxruntime]

---

## Changes the app and the Pod need (beyond the formats)

1. Audio uploads, the `audio` and `voice` vars and the optional-node rule are already in the uncommitted working tree; the formats still need the bindings and params listed above (`script`, `lyrics`, `language`).
2. A saved voice must reach `comfyVars` as `slots.voice` (its sample clip URL).
3. `shared/modelFiles.js`: the 16 entries of `files.json` and the 11 loaders of `loaders.json`; `NODE_PACKS` entries from `packs.json` (`chatterbox` and `wanvideo` are on Cloud; `foley`, `drama3`, `qwentts` are not).
4. Pod: `DIRS` and `extra_model_paths.yaml` gain `wav2vec2` and `asr`; links from `<ComfyUI>/models/{chatterbox,hunyuan_foley,qwen-tts}` to the volume; a way to download pack files into nested folders by `dir/name`; the Foley files before the Foley pack loads; `pykakasi` and `spacy-pkuseg` for Chatterbox's Japanese and Mandarin.
5. Treat an audio result under about 0.1 s as a failed Chatterbox run.
6. If MP3 output is ever wanted, map `audio/mpeg` to `mp3` in `mimeExt`.
