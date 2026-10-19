"""Write the video-edit family graphs (API format) into the output folder.

Usage: python -I make_graphs.py <out_dir>
"""
import json, os, sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

NEG_WAN = "色调艳丽，过曝，静态，细节模糊不清，字幕，风格，作品，画作，画面，静止，整体发灰，最差质量，低质量，JPEG压缩残留，丑陋的，残缺的，多余的手指，画得不好的手部，画得不好的脸部，畸形的，毁容的，形态畸形的肢体，手指融合，静止不动的画面，杂乱的背景，三条腿，背景人很多，倒着走"
# The restyle graph's negative: the Wan list without the words that fight a look change.
NEG_LOOK = "细节模糊不清，字幕，最差质量，低质量，JPEG压缩残留，丑陋的，残缺的，多余的手指，画得不好的手部，画得不好的脸部，畸形的，毁容的，形态畸形的肢体，手指融合，静止不动的画面"
V2V = "You are a helpful assistant specialized in video editing."
RV2V = "You are a helpful assistant specialized in video editing with reference."


def n(cls, inputs, meta=None):
    d = {"class_type": cls, "inputs": inputs}
    if meta:
        d["_meta"] = meta
    return d


def L(node, out=0):
    return [str(node), out]


def clip_in(g):
    """LoadVideo -> Trim -> components, as the shipped graphs."""
    g["1"] = n("LoadVideo", {"file": "{{video}}"})
    g["2"] = n("Video Slice", {"video": L(1), "start_time": "{{start}}", "duration": "{{duration}}", "strict_duration": False})
    g["3"] = n("GetVideoComponents", {"video": L(2)})


def size_len(g, frames_src, size_src, cap, long_edge, step=16, rnd="round"):
    """80-84: frame count capped to a legal 4n+1, and width/height from the clip with a long-edge cap."""
    g["80"] = n("GetImageSize", {"image": size_src})
    if frames_src is not None:
        g["79"] = n("GetImageSize", {"image": frames_src})
        count = L(79, 2)
    else:
        count = L(80, 2)
    g["81"] = n("PrimitiveInt", {"value": cap})
    g["82"] = n("ComfyMathExpression", {"expression": "min(4 * floor((a - 1) / 4) + 1, b)", "values.a": count, "values.b": L(81)})
    f = f"max({step}, {step} * {rnd}(%s * min(1, {long_edge} / max(a, b)) / {step}))"
    g["83"] = n("ComfyMathExpression", {"expression": f % "a", "values.a": L(80, 0), "values.b": L(80, 1)})
    g["84"] = n("ComfyMathExpression", {"expression": f % "b", "values.a": L(80, 0), "values.b": L(80, 1)})


def bernini(g, source, prefix, neg, refs=(), latent=None):
    """Bernini-R Turbo block from the template (nodes 4-18). refs: list of (node id, optional key)."""
    g["4"] = n("CLIPLoader", {"clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors", "type": "wan", "device": "default"})
    g["5"] = n("VAELoader", {"vae_name": "Wan2_1_VAE_bf16.safetensors"})
    g["6"] = n("UNETLoader", {"unet_name": "wan2.2_bernini_r_high_noise_fp8_scaled.safetensors", "weight_dtype": "default"})
    g["7"] = n("UNETLoader", {"unet_name": "wan2.2_bernini_r_low_noise_fp8_scaled.safetensors", "weight_dtype": "default"})
    g["8"] = n("LoraLoaderModelOnly", {"model": L(6), "lora_name": "lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors", "strength_model": 3.0})
    g["9"] = n("LoraLoaderModelOnly", {"model": L(7), "lora_name": "lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors", "strength_model": 1.5})
    g["10"] = n("CLIPTextEncode", {"text": prefix + "{{prompt}}", "clip": L(4)})
    g["11"] = n("CLIPTextEncode", {"text": neg, "clip": L(4)})
    cond = {"positive": L(10), "negative": L(11), "vae": L(5), "width": L(83, 1), "height": L(84, 1), "length": L(82, 1),
            "batch_size": 1, "source_video": source, "ref_max_size": 848}
    for i, ref in enumerate(refs):
        cond[f"reference_images.reference_image_{i}"] = L(ref)
    g["12"] = n("BerniniConditioning", cond)
    g["13"] = n("KSamplerSelect", {"sampler_name": "res_multistep"})
    g["14"] = n("BasicScheduler", {"model": L(7), "scheduler": "simple", "steps": 6, "denoise": 1.0})
    g["15"] = n("SplitSigmas", {"sigmas": L(14), "step": 3})
    g["16"] = n("SamplerCustom", {"model": L(8), "add_noise": True, "noise_seed": "{{seed}}", "cfg": 1.0, "positive": L(12, 0), "negative": L(12, 1),
                                  "sampler": L(13), "sigmas": L(15, 0), "latent_image": L(12, 2)})
    g["17"] = n("SamplerCustom", {"model": L(9), "add_noise": False, "noise_seed": 0, "cfg": 1.0, "positive": L(12, 0), "negative": L(12, 1),
                                  "sampler": L(13), "sigmas": L(15, 1), "latent_image": L(16)})
    g["18"] = n("VAEDecode", {"samples": L(17), "vae": L(5)})


def video_out(g, images, fps, prefix, audio=None):
    g["19"] = n("CreateVideo", {"images": images, "audio": audio or L(3, 1), "fps": fps})
    g["20"] = n("SaveVideo", {"video": L(19), "filename_prefix": f"comfyfield/{prefix}", "format": "mp4", "codec": "h264", "format.codec": "h264"})


def every_nth(g, ids, frames, step_expr_node):
    """Core-only frame drop: split the batch into chunks of n frames, keep each chunk's first frame,
    and join them again. RebatchImages takes and returns lists; ImageFromBatch runs once per chunk."""
    a, b, c = ids
    g[a] = n("RebatchImages", {"images": frames, "batch_size": L(step_expr_node, 1)})
    g[b] = n("ImageFromBatch", {"image": L(a), "batch_index": 0, "length": 1})
    g[c] = n("RebatchImages", {"images": L(b), "batch_size": 4096})


def save(name, g):
    path = os.path.join(OUT, name + ".json")
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(g, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(name, len(g), "nodes")


# ---------------------------------------------------------------- bernini_mixed
g = {}
clip_in(g)
g["85"] = n("PrimitiveInt", {"value": "{{fps}}"})
# Keep every n-th frame, n = floor(source fps / target fps), so the result is never choppier than asked.
g["86"] = n("ComfyMathExpression", {"expression": "max(1, floor(a / b))", "values.a": L(3, 2), "values.b": L(85)})
every_nth(g, ("87", "88", "89"), L(3, 0), "86")
g["90"] = n("ComfyMathExpression", {"expression": "a / b", "values.a": L(3, 2), "values.b": L(86, 1)})
size_len(g, None, L(89), 81, 848)
bernini(g, L(89), V2V, NEG_LOOK)
# Strength: mix the look over the same frames of the real footage, resized and cropped as Bernini does.
g["91"] = n("ImageFromBatch", {"image": L(89), "batch_index": 0, "length": L(82, 1)})
g["92"] = n("ImageScale", {"image": L(91), "upscale_method": "area", "width": L(83, 1), "height": L(84, 1), "crop": "center"})
g["93"] = n("ImageBlend", {"image1": L(92), "image2": L(18), "blend_factor": "{{strength}}", "blend_mode": "normal"})
video_out(g, L(93), L(90, 0), "bernini_mixed")
save("bernini_mixed", g)

# ---------------------------------------------------------------- bernini_grade
g = {}
clip_in(g)
# Bernini sees up to 81 frames spread over the whole clip, so its look covers every scene of the clip.
g["85"] = n("ComfyMathExpression", {"expression": "max(1, ceil(a / 81))", "values.a": L(80, 2)})
every_nth(g, ("86", "87", "88"), L(3, 0), "85")
size_len(g, L(88), L(3, 0), 81, 848)
bernini(g, L(88), V2V, NEG_LOOK)
# One Lab transform from the clip's colors to Bernini's, applied to every original frame at full size.
g["90"] = n("ColorTransfer", {"image_target": L(3, 0), "image_ref": L(18), "method": "mkl_lab", "source_stats": "uniform", "strength": 1.0})
video_out(g, L(90), L(3, 2), "bernini_grade")
save("bernini_grade", g)

# ---------------------------------------------------------------- bernini_edit (+ _ref)
for name, prefix, refs in (("bernini_edit", V2V, ()), ("bernini_edit_ref", RV2V, ("21",))):
    g = {}
    clip_in(g)
    size_len(g, None, L(3, 0), 81, 848)
    if refs:
        g["21"] = n("LoadImage", {"image": "{{image}}"})
    bernini(g, L(3, 0), prefix, NEG_WAN, refs)
    video_out(g, L(18), L(3, 2), name)
    save(name, g)

# ---------------------------------------------------------------- bernini_clone_edit
g = {}
clip_in(g)
size_len(g, None, L(3, 0), 81, 848)
g["21"] = n("LoadImage", {"image": "{{image}}"}, {"title": "Cast 1"})
g["22"] = n("LoadImage", {"image": "{{image2}}"}, {"title": "Cast 2", "optional": "image2"})
g["23"] = n("LoadImage", {"image": "{{image3}}"}, {"title": "Cast 3", "optional": "image3"})
bernini(g, L(3, 0), RV2V, NEG_WAN, ("21", "22", "23"))
video_out(g, L(18), L(3, 2), "bernini_clone_edit")
save("bernini_clone_edit", g)

# ---------------------------------------------------------------- bernini_recreate_ad
g = {}
clip_in(g)
size_len(g, None, L(3, 0), 81, 848)
g["21"] = n("LoadImage", {"image": "{{image}}"}, {"title": "Product"})
g["22"] = n("LoadImage", {"image": "{{image2}}"}, {"title": "Character", "optional": "image2"})
bernini(g, L(3, 0), RV2V, NEG_WAN, ("21", "22"))
video_out(g, L(18), L(3, 2), "bernini_recreate_ad")
save("bernini_recreate_ad", g)

# ---------------------------------------------------------------- video_bg_change
g = {}
clip_in(g)
size_len(g, None, L(3, 0), 81, 848)
bernini(g, L(3, 0), V2V, NEG_WAN)
g["90"] = n("ImageFromBatch", {"image": L(3, 0), "batch_index": 0, "length": L(82, 1)})
g["91"] = n("ImageScale", {"image": L(90), "upscale_method": "area", "width": L(83, 1), "height": L(84, 1), "crop": "center"})
g["92"] = n("CheckpointLoaderSimple", {"ckpt_name": "sam3.1_multiplex_fp16.safetensors"})
g["93"] = n("CLIPTextEncode", {"text": "person", "clip": L(92, 1)})
g["94"] = n("SAM3_VideoTrack", {"images": L(91), "model": L(92, 0), "conditioning": L(93), "detection_threshold": 0.5, "max_objects": 4, "detect_interval": 1})
g["95"] = n("SAM3_TrackToMask", {"track_data": L(94), "object_indices": ""})
g["96"] = n("GrowMask", {"mask": L(95), "expand": 16, "tapered_corners": True})
g["97"] = n("LoadBackgroundRemovalModel", {"bg_removal_name": "birefnet.safetensors"})
g["98"] = n("RemoveBackground", {"bg_removal_model": L(97), "image": L(91)})
# BiRefNet gives the fine edge (hair), SAM 3.1 keeps it to the tracked people.
g["99"] = n("MaskComposite", {"destination": L(98), "source": L(96), "x": 0, "y": 0, "operation": "multiply"})
g["100"] = n("ImageCompositeMasked", {"destination": L(18), "source": L(91), "x": 0, "y": 0, "resize_source": False, "mask": L(99)})
video_out(g, L(100), L(3, 2), "video_bg_change")
save("video_bg_change", g)

# ---------------------------------------------------------------- void_inpaint
g = {}
clip_in(g)
g["80"] = n("GetImageSize", {"image": L(3, 0)})
g["81"] = n("PrimitiveInt", {"value": 121})
# VOID needs an even latent frame count: 4 * (2k) - 3 frames, capped near the template's 5 s.
g["82"] = n("ComfyMathExpression", {"expression": "(max(2, 2 * floor((floor((min(a, b) - 1) / 4) + 1) / 2)) - 1) * 4 + 1", "values.a": L(80, 2), "values.b": L(81)})
f = "max(16, 16 * round(%s * min(1, 672 / max(a, b)) / 16))"
g["83"] = n("ComfyMathExpression", {"expression": f % "a", "values.a": L(80, 0), "values.b": L(80, 1)})
g["84"] = n("ComfyMathExpression", {"expression": f % "b", "values.a": L(80, 0), "values.b": L(80, 1)})
g["90"] = n("ImageFromBatch", {"image": L(3, 0), "batch_index": 0, "length": L(82, 1)})
g["91"] = n("CheckpointLoaderSimple", {"ckpt_name": "sam3.1_multiplex_fp16.safetensors"})
g["92"] = n("CLIPTextEncode", {"text": "{{target}}", "clip": L(91, 1)})
g["93"] = n("SAM3_VideoTrack", {"images": L(90), "model": L(91, 0), "conditioning": L(92), "detection_threshold": 0.5, "max_objects": 4, "detect_interval": 1})
g["94"] = n("SAM3_TrackToMask", {"track_data": L(93), "object_indices": ""})
g["4"] = n("CLIPLoader", {"clip_name": "t5xxl_fp16.safetensors", "type": "cogvideox", "device": "default"})
g["5"] = n("VAELoader", {"vae_name": "cogvideox_vae.safetensors"})
g["6"] = n("CLIPTextEncode", {"text": "{{prompt}}", "clip": L(4)})
g["7"] = n("CLIPTextEncode", {"text": "", "clip": L(4)})
g["10"] = n("VOIDInpaintConditioning", {"positive": L(6), "negative": L(7), "vae": L(5), "video": L(90), "quadmask": L(94),
                                        "width": L(83, 1), "height": L(84, 1), "length": L(82, 1), "batch_size": 1})
g["11"] = n("UNETLoader", {"unet_name": "void_pass1.safetensors", "weight_dtype": "default"})
g["12"] = n("UNETLoader", {"unet_name": "void_pass2.safetensors", "weight_dtype": "default"})
g["13"] = n("VOIDSampler", {})
g["14"] = n("RandomNoise", {"noise_seed": "{{seed}}"})
g["15"] = n("CFGGuider", {"model": L(11), "positive": L(10, 0), "negative": L(10, 1), "cfg": 6.0})
g["16"] = n("BasicScheduler", {"model": L(11), "scheduler": "simple", "steps": 30, "denoise": 1.0})
g["17"] = n("SamplerCustomAdvanced", {"noise": L(14), "guider": L(15), "sampler": L(13), "sigmas": L(16), "latent_image": L(10, 2)})
g["18"] = n("VAEDecode", {"samples": L(17, 0), "vae": L(5)})
g["21"] = n("OpticalFlowLoader", {"model_name": "raft_large_C_T_SKHT_V2-ff5fadd5.safetensors"})
g["22"] = n("VOIDWarpedNoise", {"optical_flow": L(21), "video": L(18), "width": L(83, 1), "height": L(84, 1), "length": L(82, 1), "batch_size": 1})
g["23"] = n("VOIDWarpedNoiseSource", {"warped_noise": L(22)})
g["24"] = n("CFGGuider", {"model": L(12), "positive": L(10, 0), "negative": L(10, 1), "cfg": 6.0})
g["25"] = n("BasicScheduler", {"model": L(12), "scheduler": "simple", "steps": 30, "denoise": 1.0})
g["26"] = n("SamplerCustomAdvanced", {"noise": L(23), "guider": L(24), "sampler": L(13), "sigmas": L(25), "latent_image": L(10, 2)})
g["27"] = n("VAEDecode", {"samples": L(26, 0), "vae": L(5)})
video_out(g, L(27), L(3, 2), "void_inpaint")
save("void_inpaint", g)

# ---------------------------------------------------------------- scail2_character_swap
g = {}
clip_in(g)
size_len(g, None, L(3, 0), 81, 896, step=32)
g["4"] = n("LoadImage", {"image": "{{image}}"})
g["5"] = n("UNETLoader", {"unet_name": "wan2.1_14B_SCAIL_2_int8_convrot.safetensors", "weight_dtype": "default"})
g["6"] = n("LoraLoaderModelOnly", {"model": L(5), "lora_name": "wan2.1_SCAIL_2_DPO_lora_bf16.safetensors", "strength_model": 1.0})
g["7"] = n("LoraLoaderModelOnly", {"model": L(6), "lora_name": "lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors", "strength_model": 0.8})
g["8"] = n("ModelSamplingSD3", {"model": L(7), "shift": 5.0})
g["9"] = n("CLIPLoader", {"clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors", "type": "wan", "device": "default"})
g["10"] = n("VAELoader", {"vae_name": "Wan2_1_VAE_bf16.safetensors"})
g["11"] = n("CLIPVisionLoader", {"clip_name": "clip_vision_h.safetensors"})
g["12"] = n("CLIPVisionEncode", {"clip_vision": L(11), "image": L(4), "crop": "none"})
g["13"] = n("CLIPTextEncode", {"text": "{{prompt}}", "clip": L(9)})
g["14"] = n("CLIPTextEncode", {"text": "", "clip": L(9)})
g["15"] = n("ImageFromBatch", {"image": L(3, 0), "batch_index": 0, "length": L(82, 1)})
g["16"] = n("ImageScale", {"image": L(15), "upscale_method": "area", "width": L(83, 1), "height": L(84, 1), "crop": "center"})
g["17"] = n("CheckpointLoaderSimple", {"ckpt_name": "sam3.1_multiplex_fp16.safetensors"})
g["18"] = n("CLIPTextEncode", {"text": "human", "clip": L(17, 1)})
g["21"] = n("SAM3_VideoTrack", {"images": L(16), "model": L(17, 0), "conditioning": L(18), "detection_threshold": 0.5, "max_objects": 4, "detect_interval": 1})
g["22"] = n("CLIPTextEncode", {"text": "human", "clip": L(17, 1)})
g["23"] = n("SAM3_VideoTrack", {"images": L(4), "model": L(17, 0), "conditioning": L(22), "detection_threshold": 0.5, "max_objects": 4, "detect_interval": 1})
# The main person: the biggest one in each track, so only one identity is swapped.
g["24"] = n("SCAIL2ColoredMask", {"driving_track_data": L(21), "ref_track_data": L(23), "object_indices": "0", "sort_by": "area", "replacement_mode": True})
g["25"] = n("WanSCAILToVideo", {"positive": L(13), "negative": L(14), "vae": L(10), "width": L(83, 1), "height": L(84, 1), "length": L(82, 1),
                                "batch_size": 1, "pose_video": L(16), "pose_video_mask": L(24, 0), "replacement_mode": True,
                                "pose_strength": 1.0, "pose_start": 0.0, "pose_end": 1.0, "reference_image": L(4), "reference_image_mask": L(24, 1),
                                "clip_vision_output": L(12), "video_frame_offset": 0, "previous_frame_count": 5})
g["26"] = n("KSamplerSelect", {"sampler_name": "euler"})
g["27"] = n("BasicScheduler", {"model": L(7), "scheduler": "simple", "steps": 6, "denoise": 1.0})
g["28"] = n("SamplerCustom", {"model": L(8), "add_noise": True, "noise_seed": "{{seed}}", "cfg": 1.0, "positive": L(25, 0), "negative": L(25, 1),
                              "sampler": L(26), "sigmas": L(27), "latent_image": L(25, 2)})
g["29"] = n("VAEDecode", {"samples": L(28, 1), "vae": L(10)})
video_out(g, L(29), L(3, 2), "scail2_character_swap")
save("scail2_character_swap", g)

# ---------------------------------------------------------------- recammaster
g = {}
clip_in(g)
size_len(g, None, L(3, 0), 81, 832)
g["90"] = n("ImageFromBatch", {"image": L(3, 0), "batch_index": 0, "length": L(82, 1)})
g["91"] = n("ImageScale", {"image": L(90), "upscale_method": "lanczos", "width": L(83, 1), "height": L(84, 1), "crop": "center"})
g["4"] = n("CLIPLoader", {"clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors", "type": "wan", "device": "default"})
g["5"] = n("CLIPTextEncode", {"text": "{{prompt}}", "clip": L(4)})
g["6"] = n("CLIPTextEncode", {"text": NEG_WAN, "clip": L(4)})
g["7"] = n("WanVideoTextEmbedBridge", {"positive": L(5), "negative": L(6)})
g["8"] = n("WanVideoVAELoader", {"model_name": "Wan2_1_VAE_bf16.safetensors", "precision": "bf16"})
g["9"] = n("WanVideoModelLoader", {"model": "Wan2_1_kwai_recammaster_1_3B_step20000_bf16.safetensors", "base_precision": "bf16",
                                   "quantization": "disabled", "load_device": "offload_device", "attention_mode": "sdpa"})
g["10"] = n("WanVideoEncode", {"vae": L(8), "image": L(91), "enable_vae_tiling": False, "tile_x": 272, "tile_y": 272,
                               "tile_stride_x": 144, "tile_stride_y": 128, "noise_aug_strength": 0.0, "latent_strength": 1.0})
g["11"] = n("WanVideoReCamMasterDefaultCamera", {"camera_type": "{{trajectory}}", "latents": L(10)})
g["12"] = n("WanVideoReCamMasterGenerateOrbitCamera", {"num_frames": L(82, 1), "degrees": 90})
g["13"] = n("ComfySwitchNode", {"switch": "{{orbit}}", "on_false": L(11), "on_true": L(12)})
g["14"] = n("WanVideoReCamMasterCameraEmbed", {"camera_poses": L(13), "latents": L(10)})
g["15"] = n("WanVideoSampler", {"model": L(9), "image_embeds": L(14, 0), "steps": 20, "cfg": 6.0, "shift": 5.0, "seed": "{{seed}}",
                                "force_offload": True, "scheduler": "unipc", "riflex_freq_index": 0, "text_embeds": L(7),
                                "denoise_strength": 1.0, "batched_cfg": False, "rope_function": "comfy"})
g["16"] = n("WanVideoDecode", {"vae": L(8), "samples": L(15, 0), "enable_vae_tiling": False, "tile_x": 272, "tile_y": 272,
                               "tile_stride_x": 144, "tile_stride_y": 128, "normalization": "default"})
video_out(g, L(16), L(3, 2), "recammaster")
save("recammaster", g)
