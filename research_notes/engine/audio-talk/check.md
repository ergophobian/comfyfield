# How the audio-talk graphs were checked

Date: 2026-10-19. Nothing was queued on ComfyUI, Comfy Cloud or a Pod. The checks are static: every class, input name, combo value, range and output index was read from the pinned source, then a script compared each graph against those schemas.

## Sources the schemas come from

| Classes | Source (pinned) |
|---|---|
| `LoadAudio`, `SaveAudioAdvanced`, `TrimAudioDuration`, `EmptyLatentAudio`, `VAEDecodeAudio`, `VAEDecodeAudioTiled` | ComfyUI `45bf90d1` `comfy_extras/nodes_audio.py` |
| `MiniMaxMusic3TextEncode`, `EmptyMiniMaxMusic3LatentAudio` | `comfy_extras/nodes_minimax_music.py`, constants in `comfy/ldm/minimax_music/ar.py` (`MAX_AUDIO_FRAMES` 9000, 25 per second) |
| `UNETLoader`, `CLIPLoader`, `VAELoader`, `CheckpointLoaderSimple`, `CLIPVisionLoader`, `CLIPTextEncode`, `ConditioningZeroOut`, `KSampler`, `LoadImage`, `ImageScale` | `nodes.py`; sampler and scheduler names from `comfy/samplers.py` (`KSAMPLER_NAMES`, `SCHEDULER_HANDLERS`) |
| `GetImageSize`, `ImageFromBatch` | `comfy_extras/nodes_images.py` |
| `ComfyMathExpression` | `comfy_extras/nodes_math.py` (autogrow `values.a`…`values.z`, Float/Int/Boolean; outputs FLOAT, INT, BOOL) |
| `LoadVideo`, `Video Slice`, `GetVideoComponents`, `CreateVideo`, `SaveVideo` | `comfy_extras/nodes_video.py` |
| `TextGenerate` | `comfy_extras/nodes_textgen.py` (dynamic combo `sampling_mode` with `sampling_mode.*` keys) |
| `FL_ChatterboxMultilingualTTS`, `FL_ChatterboxVC` | filliptm/ComfyUI_Fill-ChatterBox `f7d7a161` `chatterbox_node.py`; language labels from `local_chatterbox/chatterbox/mtl_tts.py` `SUPPORTED_LANGUAGES` |
| `HunyuanFoleyModelLoader`, `LoadDACHunyuanVAE`, `HunyuanFoleySampler`, `DACHunyuanVAEDecode` | BobRandomNumber/ComfyUI-HunyuanVideo_Foley `b94f7aca` `hunyuan_foley.py` |
| `WanVideoModelLoader`, `WanVideoVAELoader`, `WanVideoLoraSelect`, `WanVideoBlockSwap` | kijai/ComfyUI-WanVideoWrapper `088128b2` `nodes_model_loading.py` |
| `WanVideoTextEncodeCached`, `WanVideoClipVisionEncode`, `WanVideoDecode`, `WanVideoEncode` | same, `nodes.py` |
| `WanVideoSampler` | same, `nodes_sampler.py`; scheduler list from `wanvideo/schedulers/__init__.py` |
| `MultiTalkModelLoader`, `Wav2VecModelLoader`, `MultiTalkWav2VecEmbeds`, `WanVideoImageToVideoMultiTalk` | same, `multitalk/nodes.py` |
| `Drama3Loader`, `Drama3CodecLoader`, `Drama3EncodeVoice`, `Drama3Generate`, `Drama3Decode`, `Qwen3ASRLoader`, `Qwen3ASRTranscribe` | PedroMarinhoDev/ComfyUI-Drama3 `67a733a9` `nodes.py` |
| `FB_Qwen3TTSVoiceClone` | flybirdxx/ComfyUI-Qwen-TTS `a1328c8a` `nodes.py` (`VoiceCloneNode`), key from `__init__.py` `NODE_CLASS_MAPPINGS` |

Validation rules taken from ComfyUI itself: a widget value of a combo must be in the list (`execution.py` `value_not_in_list`); a link must give the input's type (`comfy_execution/validation.py` `validate_node_input`; a `COMBO` output into a V1 list-typed combo fails); a required input must be present (`required_input_missing`); `min`/`max` apply to widget values. Loop and dynamic-combo inputs use dotted names (`format.codec`, `sampling_mode.temperature`, `voices.voice0`, `values.a`), as the shipped graphs do.

## The script

`check_graphs.py` in this folder (`python -I check_graphs.py .`) holds the schemas above and checks, per graph:

1. every `class_type` is known;
2. every input name exists on the class;
3. every link points at an existing node, an output index in range, and an output of the input's type;
4. every required input is set (dynamic-combo children too, for `TextGenerate`);
5. every literal combo value is in the list, every number is in range and an int where the input is INT, every boolean is a boolean;
6. whole-string placeholders go only into inputs that accept their type (numeric placeholders: `seed`, `duration`, `start`, `exaggeration`, `cfg_weight`);
7. nodes marked `_meta.optional` feed only optional inputs of nodes that stay, so removing them leaves no required input empty;
8. exactly one save node, and no node whose output goes nowhere.

A negative test (a wrong scheduler, an AUDIO link into IMAGE, a missing `fps`, an INT link into a STRING, and a Drama 3 chain node without the optional marker) produced the 9 expected problems.

Result today:

```
chatterbox_clone.json: 3 nodes, 0 problems, SaveAudioAdvanced
chatterbox_tts.json: 3 nodes, 0 problems, SaveAudioAdvanced, optional 1
chatterbox_vc.json: 5 nodes, 0 problems, SaveAudioAdvanced
drama3_tts.json: 9 nodes, 0 problems, SaveAudioAdvanced, optional 3 4 5 6
hunyuan_foley.json: 10 nodes, 0 problems, SaveVideo
infinitetalk.json: 23 nodes, 0 problems, SaveVideo
infinitetalk_tts.json: 24 nodes, 0 problems, SaveVideo, optional 50
infinitetalk_v2v.json: 29 nodes, 0 problems, SaveVideo
minimax_music3.json: 9 nodes, 0 problems, SaveAudioAdvanced
qwen3_tts.json: 3 nodes, 0 problems, SaveAudioAdvanced
stable_audio3.json: 10 nodes, 0 problems, SaveAudioAdvanced
ALL OK
```

A second script resolved every loader input through `MODEL_FILES` + `files.json` and `LOADERS` + `loaders.json`, as `modelFilesOf` does: every name resolves, every folder matches. Graphs with no loader files (the three Chatterbox graphs and `qwen3_tts`) route by their pack alone, so `NODE_PACKS` must carry `cloud: true` for `chatterbox` and `cloud: false` for `qwentts`, or `qwen3_tts` would be sent to Cloud.

## Per graph

### chatterbox_tts
- Classes: `LoadAudio`, `FL_ChatterboxMultilingualTTS`, `SaveAudioAdvanced`. Inputs as in `chatterbox_node.py` lines 686–707.
- Links: 1:0 AUDIO → `audio_prompt` (optional AUDIO); 2:0 AUDIO → save.
- Required inputs: text, language, exaggeration, cfg_weight, temperature, repetition_penalty, min_p, top_p, seed: all set. Literals in range (temperature 0.8 in 0.05–2.0, repetition_penalty 2.0 in 1–5, min_p 0.05, top_p 1.0 in 0.1–1.0).
- Combo: `{{language}}` must be a full label such as `English (en)`; bare codes fail `value_not_in_list`.
- Optional: node 1 (`voice`) links only into the optional `audio_prompt`.

### chatterbox_clone
- Same node, `language` literal `English (en)` (in the list), exaggeration and cfg_weight 0.5. Node 1 is required here (`{{audio}}`).

### chatterbox_vc
- `TrimAudioDuration` (start 0.0, duration 27.0 ≥ min 0) between the recording and `input_audio`; `target_voice` from node 3. Both AUDIO. `seed` ≤ 4294967295 (the app's seed is below 2^31).

### minimax_music3
- UNETLoader `weight_dtype` `default`; CLIPLoader `type` `minimax` (in the v0.41.1 list); KSampler `euler` / `simple`, steps 30, cfg 1.7, denoise 1.0.
- Links: 4:0 CONDITIONING → positive and → `ConditioningZeroOut`; 4:1 FLOAT (`seconds`) → `EmptyMiniMaxMusic3LatentAudio.seconds`; 7:0 LATENT → `VAEDecodeAudioTiled` (tile 1536 in 32–8192, overlap 64).
- `max_duration` from `{{duration}}` (30/60/120 ≤ 360). `top_k` 50 ≤ 16384, `cfg_scale` 1.7.

### stable_audio3
- CLIPLoader types `stable_audio` and `stable_diffusion` (both in the list, as the template). CheckpointLoaderSimple outputs MODEL (0) and VAE (2) used; its CLIP (1) is unused, as in the template.
- `TextGenerate`: `sampling_mode` `on` with all six children, presence_penalty 0.0; output 0 STRING → `CLIPTextEncode.text`.
- KSampler `lcm` / `simple`, 8 steps, cfg 1.0. `EmptyLatentAudio.seconds` from `{{duration}}` (2/5/10, min 1.0).
- The rewrite prompt is one literal string; it contains `{{prompt}}` and `{{duration}}`, which `fill()` replaces inside the string.

### hunyuan_foley
- `ComfyMathExpression` `min(a, 15)` with `values.a` = `{{duration}}` (a number) → FLOAT (0) → `Video Slice.duration`.
- `GetVideoComponents` outputs: IMAGE (0) → `video_frames` and `CreateVideo.images`; FLOAT (2) → sampler `fps` (1–240) and `CreateVideo.fps`.
- `HunyuanFoleyModelLoader` combos: `model_path_name` `hunyuan_foley` (listed only once a checkpoint is in `<ComfyUI>/models/hunyuan_foley`), `foley_checkpoint_name` `hunyuanvideo_foley.pth` (fixed list). `LoadDACHunyuanVAE.vae_name` `vae_128d_48k.pth` from folder `vae`.
- Sampler: guidance 4.5 (1–10), steps 50 (10–100). Custom types `FOLEY_MODEL`, LATENT, VAE (the DAC object travels as VAE), AUDIO match.
- `SaveVideo` keys `format` `mp4`, `format.codec` `h264`, hidden `codec` `h264` (as `ltx25_i2v.json`).

### infinitetalk
- Size: `GetImageSize` INT (0, 1) → two `ComfyMathExpression` → INT (1) → `ImageScale` and `WanVideoImageToVideoMultiTalk` width/height (64–2048; results are multiples of 16).
- Wrapper types: `CLIP_VISION` → `WanVideoClipVisionEncode` → `WANVIDIMAGE_CLIPEMBEDS` → `clip_embeds`; `WANVAE` → image-to-video and decode; `MULTITALKMODEL`, `WANVIDLORA`, `BLOCKSWAPARGS` → `WanVideoModelLoader` optional inputs; `WANVIDEOMODEL`, `WANVIDIMAGE_EMBEDS`, `WANVIDEOTEXTEMBEDS` (output 0), `MULTITALK_EMBEDS` → `WanVideoSampler`; LATENT → `WanVideoDecode` → IMAGE.
- Combos: base_precision `fp16_fast`, quantization `disabled`, load_device `offload_device`, attention_mode `sdpa`, rms_norm `default`; text precision `bf16`, quantization `disabled`, device `gpu`; crop `center`, combine `average`; colormatch `disabled`, mode `infinitetalk`; scheduler `dpm++_sde`; rope `comfy`; normalization `default`; wav2vec precision `fp16`, `main_device`; multi_audio_type `para`.
- Ranges: blocks_to_swap 20 (0–48), prefetch 1 (0–40), frame_window 81, motion_frame 9, num_frames 750 (1–10000), fps 25.0 (1–60), steps 7, cfg 1.0 (0–30), shift 11.0, end_step −1 (min −1), decode tiles 272/144/128 (and `VALIDATE_INPUTS` tile > stride holds).
- `ImageFromBatch.length` takes INT output 2 of `MultiTalkWav2VecEmbeds` (≤ 750 ≤ 4096). `TrimAudioDuration` 30.0 s. `CreateVideo` fps 25.0.

### infinitetalk_tts
- As `infinitetalk`, with node 2 `FL_ChatterboxMultilingualTTS` (AUDIO output 0 → `audio_1` and `TrimAudioDuration`) and optional node 50 (`voice`) into its optional `audio_prompt`.

### infinitetalk_v2v
- `Video Slice` → `GetVideoComponents`; frames IMAGE (0) → `GetImageSize`, `ImageScale` (all frames) → `start_image` and `WanVideoEncode.image`; `ImageFromBatch` (0, 1) → CLIP vision.
- `ComfyMathExpression` `min(30, a)` on fps FLOAT (2) → FLOAT (0) → embeds `fps` and `CreateVideo.fps`; `750 / a` → FLOAT → `TrimAudioDuration.duration`.
- `WanVideoEncode` (tiles 272/144/128, noise_aug 0.0, latent_strength 1.0) LATENT → sampler `samples`; sampler steps 4, start_step 2, add_noise true, audio_scale 1.5.

### drama3_tts
- Combos: experts `in RAM`; `second_gpu` `none` (always first in `gpu_choices()`); speakers `one take per line`; ASR language `auto`.
- Ranges: expert_cache_gb 0.0 (0–256), split_layer 0 (0–39), temperature 1.0 (0–2), top_p 0.9 (0.05–1), top_k 0 (0–4096), max_frames 600 (1–8192), max_new_tokens 4096.
- Types: `DRAMA3_MODEL`, `DRAMA3_CODEC` (→ encode and decode), `QWEN3_ASR` → transcribe → STRING (0) → `transcript`; `DRAMA3_VOICE` → `voices.voice0` (autogrow, min 0, so optional); `DRAMA3_CODES` → decode → AUDIO.
- Optional: nodes 3, 4, 5 and 6 carry `optional: voice`; the only link from the chain to a node that stays is 6 → `voices.voice0`, which is optional.

### qwen3_tts
- Combos: model_choice `1.7B`, device `auto`, precision `bf16`, language `Auto`, attention `auto`.
- Ranges: max_new_tokens 2048 (512–4096), top_p 1.0, top_k 50 (0–100), temperature 0.9 (0.1–2.0), repetition_penalty 1.05 (1.0–2.0).
- `ref_audio` (optional AUDIO) from node 1, which is required here because the node raises without a reference.

## Not checked

- No graph was executed, so runtime behavior (VRAM, speed, model loading, the wrapper with fp8 scaled weights and an fp16 InfiniteTalk patch, Chatterbox's non-English text processing) is unverified.
- Cloud's own copies of Fill-ChatterBox and WanVideoWrapper: their commits are not published, and Cloud's `object_info` needs a key (401), so the node inputs there are assumed equal to the pinned sources.
- Pack schemas whose combo lists depend on files on disk (`HunyuanFoleyModelLoader.model_path_name`, every loader's file list) were checked against the names the Pod will place, not against a live listing.
