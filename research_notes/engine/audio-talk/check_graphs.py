"""Checks the audio-talk graphs against node schemas read from the pinned sources.
Run: python -I check_graphs.py <graph_dir>"""
import json, os, sys, re

D = sys.argv[1]

def I(t, req=True, opts=None, lo=None, hi=None):
    return {'type': t, 'req': req, 'opts': opts, 'lo': lo, 'hi': hi}

F = 'FLOAT'; N = 'INT'; S = 'STRING'; B = 'BOOLEAN'; C = 'COMBO'
FILE = 'FILE'  # a combo of file names, filled by a loader folder or a placeholder

# Schemas, from ComfyUI 45bf90d1 (v0.41.1) and the pinned packs. Outputs in index order.
SCHEMAS = {
  # --- core: comfy_extras/nodes_audio.py
  'LoadAudio': ({'audio': I(FILE)}, ['AUDIO']),
  'SaveAudioAdvanced': ({'audio': I('AUDIO'), 'filename_prefix': I(S), 'format': I(C, opts=['flac', 'mp3', 'opus'])}, ['AUDIO']),
  'TrimAudioDuration': ({'audio': I('AUDIO'), 'start_index': I(F), 'duration': I(F, lo=0.0)}, ['AUDIO']),
  'EmptyLatentAudio': ({'seconds': I(F, lo=1.0, hi=1000.0), 'batch_size': I(N, lo=1, hi=4096)}, ['LATENT']),
  'VAEDecodeAudio': ({'samples': I('LATENT'), 'vae': I('VAE')}, ['AUDIO']),
  'VAEDecodeAudioTiled': ({'samples': I('LATENT'), 'vae': I('VAE'), 'tile_size': I(N, lo=32, hi=8192), 'overlap': I(N, lo=0, hi=1024)}, ['AUDIO']),
  # --- core: comfy_extras/nodes_minimax_music.py
  'MiniMaxMusic3TextEncode': ({'clip': I('CLIP'), 'caption': I(S), 'lyrics': I(S), 'seed': I(N, lo=0), 'max_duration': I(F, lo=0.04, hi=360.0), 'cfg_scale': I(F, lo=0.0, hi=100.0), 'top_k': I(N, lo=1, hi=16384)}, ['CONDITIONING', F]),
  'EmptyMiniMaxMusic3LatentAudio': ({'seconds': I(F, lo=0.04, hi=360.0), 'batch_size': I(N, lo=1, hi=4096)}, ['LATENT']),
  # --- core: nodes.py
  'UNETLoader': ({'unet_name': I(FILE), 'weight_dtype': I(C, opts=['default', 'fp8_e4m3fn', 'fp8_e4m3fn_fast', 'fp8_e5m2'])}, ['MODEL']),
  'CLIPLoader': ({'clip_name': I(FILE), 'type': I(C, opts=['stable_diffusion', 'stable_audio', 'minimax', 'wan', 'ltxv', 'ace', 'flux3', 'qwen_image']), 'device': I(C, req=False, opts=['default', 'cpu'])}, ['CLIP']),
  'VAELoader': ({'vae_name': I(FILE)}, ['VAE']),
  'CheckpointLoaderSimple': ({'ckpt_name': I(FILE)}, ['MODEL', 'CLIP', 'VAE']),
  'CLIPVisionLoader': ({'clip_name': I(FILE)}, ['CLIP_VISION']),
  'CLIPTextEncode': ({'text': I(S), 'clip': I('CLIP')}, ['CONDITIONING']),
  'ConditioningZeroOut': ({'conditioning': I('CONDITIONING')}, ['CONDITIONING']),
  'KSampler': ({'model': I('MODEL'), 'seed': I(N, lo=0), 'steps': I(N, lo=1, hi=10000), 'cfg': I(F, lo=0.0, hi=100.0),
                'sampler_name': I(C, opts=['euler', 'lcm', 'res_multistep', 'er_sde', 'dpmpp_2m']), 'scheduler': I(C, opts=['simple', 'normal', 'sgm_uniform', 'karras', 'beta']),
                'positive': I('CONDITIONING'), 'negative': I('CONDITIONING'), 'latent_image': I('LATENT'), 'denoise': I(F, lo=0.0, hi=1.0)}, ['LATENT']),
  'LoadImage': ({'image': I(FILE)}, ['IMAGE', 'MASK']),
  'ImageScale': ({'image': I('IMAGE'), 'upscale_method': I(C, opts=['nearest-exact', 'bilinear', 'area', 'bicubic', 'lanczos']), 'width': I(N, lo=0), 'height': I(N, lo=0), 'crop': I(C, opts=['disabled', 'center'])}, ['IMAGE']),
  # --- core: comfy_extras/nodes_images.py, nodes_math.py, nodes_video.py, nodes_textgen.py
  'GetImageSize': ({'image': I('IMAGE')}, [N, N, N]),
  'ImageFromBatch': ({'image': I('IMAGE'), 'batch_index': I(N), 'length': I(N, lo=1, hi=4096)}, ['IMAGE']),
  'ComfyMathExpression': ({'expression': I(S)}, [F, N, B]),
  'LoadVideo': ({'file': I(FILE)}, ['VIDEO']),
  'Video Slice': ({'video': I('VIDEO'), 'start_time': I(F, lo=-1e5, hi=1e5), 'duration': I(F, lo=0.0), 'strict_duration': I(B)}, ['VIDEO']),
  'GetVideoComponents': ({'video': I('VIDEO')}, ['IMAGE', 'AUDIO', F, C, C]),
  'CreateVideo': ({'images': I('IMAGE'), 'fps': I(F, lo=1.0, hi=120.0), 'audio': I('AUDIO', req=False)}, ['VIDEO']),
  'SaveVideo': ({'video': I('VIDEO'), 'filename_prefix': I(S), 'format': I(C, opts=['auto', 'mp4', 'mkv', 'webm']), 'format.codec': I(C, opts=['auto', 'h264', 'av1']), 'codec': I(C, req=False, opts=['auto', 'h264', 'av1'])}, []),
  'TextGenerate': ({'clip': I('CLIP'), 'prompt': I(S), 'max_length': I(N, lo=1, hi=32768), 'sampling_mode': I(C, opts=['on', 'off']),
                    'sampling_mode.temperature': I(F, req=False, lo=0.01, hi=2.0), 'sampling_mode.top_k': I(N, req=False, lo=0, hi=1000), 'sampling_mode.top_p': I(F, req=False, lo=0.0, hi=1.0),
                    'sampling_mode.min_p': I(F, req=False, lo=0.0, hi=1.0), 'sampling_mode.repetition_penalty': I(F, req=False, lo=0.0, hi=5.0), 'sampling_mode.seed': I(N, req=False, lo=0),
                    'sampling_mode.presence_penalty': I(F, req=False, lo=0.0, hi=5.0), 'thinking': I(B, req=False), 'use_default_template': I(B, req=False),
                    'mtp': I(C, req=False, opts=['auto', 'off', '2', '3', '4', '5']), 'image': I('IMAGE', req=False), 'video': I('IMAGE', req=False), 'audio': I('AUDIO', req=False), 'system_prompt': I(S, req=False)}, [S, S]),
  # --- Fill-ChatterBox f7d7a161 (chatterbox_node.py)
  'FL_ChatterboxMultilingualTTS': ({'text': I(S), 'language': I(C, opts=[f'{n} ({c})' for c, n in [('ar','Arabic'),('da','Danish'),('de','German'),('el','Greek'),('en','English'),('es','Spanish'),('fi','Finnish'),('fr','French'),('he','Hebrew'),('hi','Hindi'),('it','Italian'),('ja','Japanese'),('ko','Korean'),('ms','Malay'),('nl','Dutch'),('no','Norwegian'),('pl','Polish'),('pt','Portuguese'),('ru','Russian'),('sv','Swedish'),('sw','Swahili'),('tr','Turkish'),('zh','Chinese')]]),
                                    'exaggeration': I(F, lo=0.0, hi=2.0), 'cfg_weight': I(F, lo=0.0, hi=1.0), 'temperature': I(F, lo=0.05, hi=2.0), 'repetition_penalty': I(F, lo=1.0, hi=5.0),
                                    'min_p': I(F, lo=0.0, hi=1.0), 'top_p': I(F, lo=0.1, hi=1.0), 'seed': I(N, lo=0, hi=4294967295),
                                    'audio_prompt': I('AUDIO', req=False), 'use_cpu': I(B, req=False), 'keep_model_loaded': I(B, req=False)}, ['AUDIO', S]),
  'FL_ChatterboxVC': ({'input_audio': I('AUDIO'), 'target_voice': I('AUDIO'), 'seed': I(N, lo=0, hi=4294967295), 'use_cpu': I(B, req=False), 'keep_model_loaded': I(B, req=False)}, ['AUDIO', S]),
  # --- ComfyUI-HunyuanVideo_Foley b94f7aca (hunyuan_foley.py)
  'HunyuanFoleyModelLoader': ({'model_path_name': I(C, opts=['hunyuan_foley']), 'foley_checkpoint_name': I(C, opts=['hunyuanvideo_foley.pth', 'hunyuanvideo_foley_xl.pth'])}, ['FOLEY_MODEL']),
  'LoadDACHunyuanVAE': ({'vae_name': I(FILE)}, ['VAE']),
  'HunyuanFoleySampler': ({'foley_model': I('FOLEY_MODEL'), 'video_frames': I('IMAGE'), 'fps': I(F, lo=1.0, hi=240.0), 'prompt': I(S), 'negative_prompt': I(S),
                           'guidance_scale': I(F, lo=1.0, hi=10.0), 'steps': I(N, lo=10, hi=100), 'seed': I(N, lo=0)}, ['LATENT']),
  'DACHunyuanVAEDecode': ({'samples': I('LATENT'), 'vae': I('VAE'), 'unload_models_after_use': I(B, req=False)}, ['AUDIO']),
  # --- ComfyUI-WanVideoWrapper 088128b2 (nodes.py, nodes_model_loading.py, nodes_sampler.py, multitalk/nodes.py)
  'WanVideoModelLoader': ({'model': I(FILE), 'base_precision': I(C, opts=['fp32', 'bf16', 'fp16', 'fp16_fast']),
                           'quantization': I(C, opts=['disabled', 'fp8_e4m3fn', 'fp8_e4m3fn_fast', 'fp8_e4m3fn_scaled', 'fp8_e4m3fn_scaled_fast', 'fp8_e5m2', 'fp8_e5m2_fast', 'fp8_e5m2_scaled', 'fp8_e5m2_scaled_fast']),
                           'load_device': I(C, opts=['main_device', 'offload_device']), 'attention_mode': I(C, req=False, opts=['sdpa', 'flash_attn_2', 'flash_attn_3', 'sageattn']),
                           'compile_args': I('WANCOMPILEARGS', req=False), 'block_swap_args': I('BLOCKSWAPARGS', req=False), 'lora': I('WANVIDLORA', req=False),
                           'vram_management_args': I('VRAM_MANAGEMENTARGS', req=False), 'extra_model': I('VACEPATH', req=False), 'fantasytalking_model': I('FANTASYTALKINGMODEL', req=False),
                           'multitalk_model': I('MULTITALKMODEL', req=False), 'fantasyportrait_model': I('FANTASYPORTRAITMODEL', req=False), 'rms_norm_function': I(C, req=False, opts=['default', 'pytorch'])}, ['WANVIDEOMODEL']),
  'WanVideoVAELoader': ({'model_name': I(FILE), 'precision': I(C, req=False, opts=['fp16', 'fp32', 'bf16']), 'compile_args': I('WANCOMPILEARGS', req=False), 'use_cpu_cache': I(B, req=False), 'verbose': I(B, req=False)}, ['WANVAE']),
  'WanVideoLoraSelect': ({'lora': I(FILE), 'strength': I(F, lo=-1000.0, hi=1000.0), 'prev_lora': I('WANVIDLORA', req=False), 'blocks': I('SELECTEDBLOCKS', req=False), 'low_mem_load': I(B, req=False), 'merge_loras': I(B, req=False)}, ['WANVIDLORA']),
  'WanVideoBlockSwap': ({'blocks_to_swap': I(N, lo=0, hi=48), 'offload_img_emb': I(B), 'offload_txt_emb': I(B), 'use_non_blocking': I(B, req=False), 'vace_blocks_to_swap': I(N, req=False, lo=0, hi=15), 'prefetch_blocks': I(N, req=False, lo=0, hi=40), 'block_swap_debug': I(B, req=False)}, ['BLOCKSWAPARGS']),
  'WanVideoTextEncodeCached': ({'model_name': I(FILE), 'precision': I(C, opts=['fp32', 'bf16']), 'positive_prompt': I(S), 'negative_prompt': I(S), 'quantization': I(C, opts=['disabled', 'fp8_e4m3fn']),
                                'use_disk_cache': I(B), 'device': I(C, opts=['gpu', 'cpu']), 'extender_args': I('WANVIDEOPROMPTEXTENDER_ARGS', req=False)}, ['WANVIDEOTEXTEMBEDS', 'WANVIDEOTEXTEMBEDS', S]),
  'WanVideoClipVisionEncode': ({'clip_vision': I('CLIP_VISION'), 'image_1': I('IMAGE'), 'strength_1': I(F, lo=0.0, hi=10.0), 'strength_2': I(F, lo=0.0, hi=10.0), 'crop': I(C, opts=['center', 'disabled']),
                                'combine_embeds': I(C, opts=['average', 'sum', 'concat', 'batch']), 'force_offload': I(B), 'image_2': I('IMAGE', req=False), 'negative_image': I('IMAGE', req=False),
                                'tiles': I(N, req=False, lo=0, hi=16), 'ratio': I(F, req=False, lo=0.0, hi=1.0)}, ['WANVIDIMAGE_CLIPEMBEDS']),
  'WanVideoImageToVideoMultiTalk': ({'vae': I('WANVAE'), 'width': I(N, lo=64, hi=2048), 'height': I(N, lo=64, hi=29048), 'frame_window_size': I(N, lo=1, hi=10000), 'motion_frame': I(N, lo=1, hi=10000),
                                     'force_offload': I(B), 'colormatch': I(C, opts=['disabled', 'mkl', 'hm', 'reinhard', 'mvgd', 'hm-mvgd-hm', 'hm-mkl-hm']), 'start_image': I('IMAGE', req=False),
                                     'tiled_vae': I(B, req=False), 'clip_embeds': I('WANVIDIMAGE_CLIPEMBEDS', req=False), 'mode': I(C, req=False, opts=['auto', 'multitalk', 'infinitetalk']), 'output_path': I(S, req=False)}, ['WANVIDIMAGE_EMBEDS', S]),
  'WanVideoSampler': ({'model': I('WANVIDEOMODEL'), 'image_embeds': I('WANVIDIMAGE_EMBEDS'), 'steps': I(N, lo=1), 'cfg': I(F, lo=0.0, hi=30.0), 'shift': I(F, lo=0.0, hi=1000.0), 'seed': I(N, lo=0),
                       'force_offload': I(B), 'scheduler': I(C, opts=['unipc', 'unipc/beta', 'dpm++', 'dpm++/beta', 'dpm++_sde', 'dpm++_sde/beta', 'euler', 'euler/beta', 'lcm', 'res_multistep', 'er_sde']),
                       'riflex_freq_index': I(N, lo=0, hi=1000), 'text_embeds': I('WANVIDEOTEXTEMBEDS', req=False), 'samples': I('LATENT', req=False), 'denoise_strength': I(F, req=False, lo=0.0, hi=1.0),
                       'batched_cfg': I(B, req=False), 'rope_function': I(C, req=False, opts=['default', 'comfy', 'comfy_chunked']), 'multitalk_embeds': I('MULTITALK_EMBEDS', req=False),
                       'start_step': I(N, req=False, lo=0, hi=10000), 'end_step': I(N, req=False, lo=-1, hi=10000), 'add_noise_to_samples': I(B, req=False)}, ['LATENT', 'LATENT']),
  'WanVideoDecode': ({'vae': I('WANVAE'), 'samples': I('LATENT'), 'enable_vae_tiling': I(B), 'tile_x': I(N, lo=40, hi=2048), 'tile_y': I(N, lo=40, hi=2048), 'tile_stride_x': I(N, lo=32, hi=2040), 'tile_stride_y': I(N, lo=32, hi=2040),
                      'normalization': I(C, req=False, opts=['default', 'minmax', 'none'])}, ['IMAGE']),
  'WanVideoEncode': ({'vae': I('WANVAE'), 'image': I('IMAGE'), 'enable_vae_tiling': I(B), 'tile_x': I(N, lo=64, hi=2048), 'tile_y': I(N, lo=64, hi=2048), 'tile_stride_x': I(N, lo=32, hi=2048), 'tile_stride_y': I(N, lo=32, hi=2048),
                      'noise_aug_strength': I(F, req=False, lo=0.0, hi=10.0), 'latent_strength': I(F, req=False, lo=0.0, hi=10.0), 'mask': I('MASK', req=False)}, ['LATENT']),
  'MultiTalkModelLoader': ({'model': I(FILE)}, ['MULTITALKMODEL']),
  'Wav2VecModelLoader': ({'model': I(FILE), 'base_precision': I(C, opts=['fp32', 'bf16', 'fp16']), 'load_device': I(C, opts=['main_device', 'offload_device'])}, ['WAV2VECMODEL']),
  'MultiTalkWav2VecEmbeds': ({'wav2vec_model': I('WAV2VECMODEL'), 'audio_1': I('AUDIO'), 'normalize_loudness': I(B), 'num_frames': I(N, lo=1, hi=10000), 'fps': I(F, lo=1.0, hi=60.0),
                              'audio_scale': I(F, lo=0.0, hi=100.0), 'audio_cfg_scale': I(F, lo=0.0, hi=100.0), 'multi_audio_type': I(C, opts=['para', 'add']),
                              'audio_2': I('AUDIO', req=False), 'audio_3': I('AUDIO', req=False), 'audio_4': I('AUDIO', req=False), 'ref_target_masks': I('MASK', req=False),
                              'add_noise_floor': I(B, req=False), 'smooth_transients': I(B, req=False)}, ['MULTITALK_EMBEDS', 'AUDIO', N]),
  # --- ComfyUI-Drama3 67a733a9 (nodes.py)
  'Drama3Loader': ({'model_name': I(FILE), 'experts': I(C, opts=['in RAM', 'in VRAM']), 'expert_cache_gb': I(F, lo=0.0, hi=256.0), 'second_gpu': I(C, opts=['none']), 'split_layer': I(N, lo=0, hi=39)}, ['DRAMA3_MODEL']),
  'Drama3CodecLoader': ({'codec_name': I(FILE)}, ['DRAMA3_CODEC']),
  'Drama3EncodeVoice': ({'codec': I('DRAMA3_CODEC'), 'audio': I('AUDIO'), 'transcript': I(S)}, ['DRAMA3_VOICE']),
  'Drama3Generate': ({'model': I('DRAMA3_MODEL'), 'text': I(S), 'voices.voice0': I('DRAMA3_VOICE', req=False), 'seed': I(N, lo=0), 'temperature': I(F, lo=0.0, hi=2.0), 'top_p': I(F, lo=0.05, hi=1.0),
                      'top_k': I(N, lo=0, hi=4096), 'max_frames': I(N, lo=1, hi=8192), 'split_long_text': I(B),
                      'speakers': I(C, opts=['one take per line', 'one take per line, hearing the line before', 'one take per speaker', 'together'])}, ['DRAMA3_CODES']),
  'Drama3Decode': ({'codec': I('DRAMA3_CODEC'), 'codes': I('DRAMA3_CODES'), 'shorten_long_pauses': I(B)}, ['AUDIO']),
  'Qwen3ASRLoader': ({'model_name': I(FILE)}, ['QWEN3_ASR']),
  'Qwen3ASRTranscribe': ({'model': I('QWEN3_ASR'), 'audio': I('AUDIO'), 'language': I(C, opts=['auto']), 'context': I(S), 'max_new_tokens': I(N, lo=1, hi=32768)}, [S, S]),
  # --- ComfyUI-Qwen-TTS a1328c8a (nodes.py, __init__.py)
  'FB_Qwen3TTSVoiceClone': ({'target_text': I(S), 'model_choice': I(C, opts=['0.6B', '1.7B']), 'device': I(C, opts=['auto', 'cuda', 'xpu', 'mps', 'cpu']), 'precision': I(C, opts=['bf16', 'fp32']),
                             'language': I(C, opts=['Auto', 'Chinese', 'English', 'Japanese', 'Korean', 'French', 'German', 'Spanish', 'Portuguese', 'Russian', 'Italian']),
                             'ref_audio': I('AUDIO', req=False), 'ref_text': I(S, req=False), 'voice_clone_prompt': I('VOICE_CLONE_PROMPT', req=False), 'seed': I(N, req=False, lo=0),
                             'max_new_tokens': I(N, req=False, lo=512, hi=4096), 'top_p': I(F, req=False, lo=0.0, hi=1.0), 'top_k': I(N, req=False, lo=0, hi=100),
                             'temperature': I(F, req=False, lo=0.1, hi=2.0), 'repetition_penalty': I(F, req=False, lo=1.0, hi=2.0), 'x_vector_only': I(B, req=False), 'instruct': I(S, req=False),
                             'attention': I(C, req=False, opts=['auto', 'sage_attn', 'flash_attn', 'sdpa', 'eager']), 'unload_model_after_generate': I(B, req=False), 'custom_model_path': I(S, req=False)}, ['AUDIO']),
}
# Custom V3 output types are class-scoped names in the packs; the checker compares them by these labels.

PLACEHOLDER = re.compile(r'^\{\{(\w+)\}\}$')
NUMERIC_PH = {'seed', 'width', 'height', 'count', 'frames', 'duration', 'start', 'exaggeration', 'cfg_weight'}
TEXT_PH = {'prompt', 'lyrics', 'script', 'language', 'image', 'video', 'audio', 'voice'}

def check(name, g):
    problems, notes = [], []
    optional_nodes = {nid for nid, n in g.items() if (n.get('_meta') or {}).get('optional')}
    for nid, node in g.items():
        ct = node['class_type']
        if ct not in SCHEMAS:
            problems.append(f'{nid}: unknown class {ct}')
            continue
        spec, outs = SCHEMAS[ct]
        inputs = node['inputs']
        for k, v in inputs.items():
            if ct == 'ComfyMathExpression' and k.startswith('values.'):
                if isinstance(v, list):
                    src = g.get(v[0])
                    if not src: problems.append(f'{nid}.{k}: links to missing node {v[0]}'); continue
                    t = SCHEMAS[src['class_type']][1][v[1]]
                    if t not in (F, N, B): problems.append(f'{nid}.{k}: {t} is not a number')
                continue
            if k not in spec:
                problems.append(f'{nid} {ct}: unknown input {k}')
                continue
            s = spec[k]
            if isinstance(v, list):
                src = g.get(v[0])
                if src is None:
                    problems.append(f'{nid}.{k}: links to missing node {v[0]}'); continue
                souts = SCHEMAS[src['class_type']][1]
                if v[1] >= len(souts):
                    problems.append(f'{nid}.{k}: output {v[1]} out of range for {src["class_type"]}'); continue
                if souts[v[1]] != s['type']:
                    problems.append(f'{nid}.{k}: expects {s["type"]}, gets {souts[v[1]]} from {v[0]}:{v[1]}')
                if v[0] in optional_nodes and s['req'] and nid not in optional_nodes:
                    problems.append(f'{nid}.{k}: required input linked to optional node {v[0]}')
                continue
            ph = PLACEHOLDER.match(v) if isinstance(v, str) else None
            if ph:
                key = ph.group(1)
                notes.append(f'{nid}.{k} <- {{{{{key}}}}}')
                if s['type'] in (F, N) and key not in NUMERIC_PH:
                    problems.append(f'{nid}.{k}: numeric input gets non-numeric placeholder {key}')
                continue
            if s['type'] == C and s['opts'] is not None and v not in s['opts']:
                problems.append(f'{nid}.{k}: {v!r} not in {s["opts"]}')
            if s['type'] in (F, N):
                if not isinstance(v, (int, float)) or isinstance(v, bool):
                    problems.append(f'{nid}.{k}: {v!r} is not a number')
                else:
                    if s['type'] == N and not float(v).is_integer(): problems.append(f'{nid}.{k}: {v} is not an int')
                    if s['lo'] is not None and v < s['lo']: problems.append(f'{nid}.{k}: {v} < min {s["lo"]}')
                    if s['hi'] is not None and v > s['hi']: problems.append(f'{nid}.{k}: {v} > max {s["hi"]}')
            if s['type'] == B and not isinstance(v, bool): problems.append(f'{nid}.{k}: {v!r} is not a boolean')
            if s['type'] == S and not isinstance(v, str): problems.append(f'{nid}.{k}: {v!r} is not a string')
        for k, s in spec.items():
            if s['req'] and k not in inputs:
                problems.append(f'{nid} {ct}: required input {k} missing')
        if ct == 'TextGenerate' and inputs.get('sampling_mode') == 'on':
            for sub in ['temperature', 'top_k', 'top_p', 'min_p', 'repetition_penalty', 'seed']:
                if f'sampling_mode.{sub}' not in inputs: problems.append(f'{nid}: sampling_mode.{sub} missing')
        # Inline placeholders inside longer strings
        for k, v in inputs.items():
            if isinstance(v, str) and not PLACEHOLDER.match(v):
                for m in re.findall(r'\{\{(\w+)\}\}', v):
                    notes.append(f'{nid}.{k} contains {{{{{m}}}}}')
    # Optional-loader rule: when the marked nodes are removed, nothing left may miss a required input.
    for nid, node in g.items():
        if nid in optional_nodes: continue
        spec = SCHEMAS[node['class_type']][0]
        for k, v in node['inputs'].items():
            if isinstance(v, list) and v[0] in optional_nodes and k in spec and spec[k]['req']:
                problems.append(f'{nid}.{k}: removing optional {v[0]} would drop a required input')
    # Output nodes
    outs = [n['class_type'] for n in g.values() if n['class_type'] in ('SaveAudioAdvanced', 'SaveVideo')]
    if len(outs) != 1: problems.append(f'expected one save node, found {outs}')
    # Every non-output node feeds something
    used = {v[0] for n in g.values() for v in n['inputs'].values() if isinstance(v, list)}
    for nid, n in g.items():
        if nid not in used and n['class_type'] not in ('SaveAudioAdvanced', 'SaveVideo'):
            problems.append(f'{nid} {n["class_type"]}: output unused')
    return problems, notes, outs, optional_nodes

ok = True
for f in sorted(os.listdir(D)):
    if not f.endswith('.json') or f in ('files.json', 'loaders.json', 'packs.json'):
        continue
    g = json.load(open(os.path.join(D, f), encoding='utf-8'))
    problems, notes, outs, opt = check(f, g)
    ok &= not problems
    print(f'== {f}: {len(g)} nodes, {len(problems)} problems, output {outs[0] if outs else None}, optional {sorted(opt) or "none"}')
    for p in problems: print('   PROBLEM', p)
    print('   placeholders:', '; '.join(sorted(set(notes))))
print('ALL OK' if ok else 'PROBLEMS FOUND')
