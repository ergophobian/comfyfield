"""Writes the enhance-family API graphs. Usage: python -I build_graphs.py <shader dir> <out dir>"""
import json, os, sys

shader_dir, out_dir = sys.argv[1], sys.argv[2]
read = lambda f: open(os.path.join(shader_dir, f), encoding='utf-8').read()
LOOKS, COLOR_ADJUST, FILM_GRAIN = read('looks.frag'), read('color_adjust.frag'), read('film_grain.frag')

SEEDVR2_DIT = 'seedvr2_3b_int8_convrot.safetensors'
SEEDVR2_VAE = 'seedvr2_ema_vae_fp16.safetensors'
QWEN_DIT = 'qwen_image_2.1_turbo_bf16.safetensors'
QWEN_TE = 'qwen3vl_8b_bf16.safetensors'
QWEN_VAE = 'qwen_image_2.1_vae_bf16.safetensors'
QWEN_SIGMAS = '1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0'
GREEN, WHITE = 0x00FF00, 0xFFFFFF


class G:
    def __init__(self):
        self.nodes = {}
        self.n = 0

    def add(self, class_type, **inputs):
        self.n += 1
        nid = str(self.n)
        self.nodes[nid] = {'class_type': class_type, 'inputs': {k.replace('__', '.'): v for k, v in inputs.items()}}
        return nid

    def save(self, name):
        with open(os.path.join(out_dir, name + '.json'), 'w', encoding='utf-8', newline='\n') as f:
            json.dump(self.nodes, f, indent=2, ensure_ascii=False)
            f.write('\n')


L = lambda nid, i=0: [nid, i]


def save_video(g, video, prefix):
    return g.add('SaveVideo', video=L(video), filename_prefix=f'comfyfield/{prefix}', format='mp4', codec='h264', format__codec='h264')


def clip_frames(g):
    """LoadVideo -> trim -> components. Returns (components node)."""
    v = g.add('LoadVideo', file='{{video}}')
    s = g.add('Video Slice', video=L(v), start_time='{{start}}', duration='{{duration}}', strict_duration=False)
    return g.add('GetVideoComponents', video=L(s))


def cap_long_edge(g, images, size, longest):
    """Scale frames down to `longest` px on the long edge only when they are larger. Returns a node whose output 0 is IMAGE."""
    big = g.add('ComfyMathExpression', expression=f'max(a, b) > {longest}', values__a=L(size, 0), values__b=L(size, 1))
    small = g.add('ResizeImageMaskNode', input=L(images), resize_type='scale longer dimension', resize_type__longer_size=longest, scale_method='lanczos')
    return g.add('ComfySwitchNode', switch=L(big, 2), on_true=L(small), on_false=L(images))


def seedvr2_image_core(g, resized, prefix):
    unet = g.add('UNETLoader', unet_name=SEEDVR2_DIT, weight_dtype='default')
    vae = g.add('VAELoader', vae_name=SEEDVR2_VAE)
    pre = g.add('SeedVR2Preprocess', resized_images=L(resized))
    enc = g.add('VAEEncodeTiled', pixels=L(pre), vae=L(vae), tile_size=512, overlap=128, temporal_size=4096, temporal_overlap=8)
    cond = g.add('SeedVR2Conditioning', model=L(unet), vae_conditioning=L(enc))
    ks = g.add('KSampler', model=L(unet), seed='{{seed}}', steps=1, cfg=1, sampler_name='euler', scheduler='simple',
               positive=L(cond, 0), negative=L(cond, 1), latent_image=L(enc), denoise=1)
    dec = g.add('VAEDecodeTiled', samples=L(ks), vae=L(vae), tile_size=512, overlap=128, temporal_size=4096, temporal_overlap=8)
    post = g.add('SeedVR2PostProcessing', images=L(dec), original_resized_images=L(resized), color_correction_method='none')
    g.add('SaveImage', images=L(post), filename_prefix=f'comfyfield/{prefix}')


# 1. seedvr2_image (unblur): long edge = target, or source long edge * upscale_factor when target is 0.
g = G()
img = g.add('LoadImage', image='{{image}}')
rgba = g.add('JoinImageWithAlpha', image=L(img, 0), alpha=L(img, 1))
size = g.add('GetImageSize', image=L(img))
factor = g.add('PrimitiveFloat', value='{{upscale_factor}}')
target = g.add('PrimitiveInt', value='{{target}}')
edge = g.add('ComfyMathExpression', expression='max(16, c if c > 0 else round(max(a, b) * d))',
             values__a=L(size, 0), values__b=L(size, 1), values__c=L(target), values__d=L(factor))
resized = g.add('ResizeImageMaskNode', input=L(rgba), resize_type='scale longer dimension', resize_type__longer_size=L(edge, 1), scale_method='lanczos')
seedvr2_image_core(g, resized, 'seedvr2_image')
g.save('seedvr2_image')

# 2. image_upscale (SeedVR2 path): the template's scale-by-multiplier, capped at a 4096 px long edge.
g = G()
img = g.add('LoadImage', image='{{image}}')
rgba = g.add('JoinImageWithAlpha', image=L(img, 0), alpha=L(img, 1))
size = g.add('GetImageSize', image=L(img))
factor = g.add('PrimitiveFloat', value='{{upscale_factor}}')
mult = g.add('ComfyMathExpression', expression='max(1, min(c, 4096 / max(a, b)))', values__a=L(size, 0), values__b=L(size, 1), values__c=L(factor))
resized = g.add('ResizeImageMaskNode', input=L(rgba), resize_type='scale by multiplier', resize_type__multiplier=L(mult, 0), scale_method='lanczos')
seedvr2_image_core(g, resized, 'image_upscale')
g.save('image_upscale')

# 3. image_upscale_esrgan (RealESRGAN path): 4x model, then down to the chosen factor, same 4096 px cap.
g = G()
img = g.add('LoadImage', image='{{image}}')
size = g.add('GetImageSize', image=L(img))
factor = g.add('PrimitiveFloat', value='{{upscale_factor}}')
mult = g.add('ComfyMathExpression', expression='max(1, min(c, 4096 / max(a, b))) / 4', values__a=L(size, 0), values__b=L(size, 1), values__c=L(factor))
model = g.add('UpscaleModelLoader', model_name='RealESRGAN_x4plus.safetensors')
up = g.add('ImageUpscaleWithModel', upscale_model=L(model), image=L(img))
down = g.add('ResizeImageMaskNode', input=L(up), resize_type='scale by multiplier', resize_type__multiplier=L(mult, 0), scale_method='area')
rgba = g.add('JoinImageWithAlpha', image=L(down), alpha=L(img, 1))
g.add('SaveImage', images=L(rgba), filename_prefix='comfyfield/image_upscale_esrgan')
g.save('image_upscale_esrgan')

# 4. seedvr2_video: the template with temporal chunking on (auto), output long edge capped at 3840.
g = G()
comp = clip_frames(g)
size = g.add('GetImageSize', image=L(comp))
factor = g.add('PrimitiveFloat', value='{{upscale_factor}}')
mult = g.add('ComfyMathExpression', expression='max(1, min(c, 3840 / max(a, b)))', values__a=L(size, 0), values__b=L(size, 1), values__c=L(factor))
resized = g.add('ResizeImageMaskNode', input=L(comp, 0), resize_type='scale by multiplier', resize_type__multiplier=L(mult, 0), scale_method='lanczos')
unet = g.add('UNETLoader', unet_name=SEEDVR2_DIT, weight_dtype='default')
vae = g.add('VAELoader', vae_name=SEEDVR2_VAE)
pre = g.add('SeedVR2Preprocess', resized_images=L(resized))
enc = g.add('VAEEncodeTiled', pixels=L(pre), vae=L(vae), tile_size=512, overlap=128, temporal_size=64, temporal_overlap=8)
chunk = g.add('SeedVR2TemporalChunk', latent=L(enc), temporal_overlap=1, chunking_mode='auto')
cond = g.add('SeedVR2Conditioning', model=L(unet), vae_conditioning=L(chunk, 0))
ks = g.add('KSampler', model=L(unet), seed='{{seed}}', steps=1, cfg=1, sampler_name='euler', scheduler='simple',
           positive=L(cond, 0), negative=L(cond, 1), latent_image=L(chunk, 0), denoise=1)
merge = g.add('SeedVR2TemporalMerge', latents=L(ks), temporal_overlap=L(chunk, 1))
dec = g.add('VAEDecodeTiled', samples=L(merge), vae=L(vae), tile_size=512, overlap=128, temporal_size=64, temporal_overlap=8)
post = g.add('SeedVR2PostProcessing', images=L(dec), original_resized_images=L(resized), color_correction_method='none')
vid = g.add('CreateVideo', images=L(post), audio=L(comp, 1), fps=L(comp, 2))
save_video(g, vid, 'seedvr2_video')
g.save('seedvr2_video')

# 5. rife_interpolate: RIFE 4.26 in-betweens, source fps kept so the clip plays `multiplier` times slower.
g = G()
comp = clip_frames(g)
size = g.add('GetImageSize', image=L(comp))
mult = g.add('PrimitiveInt', value='{{multiplier}}')
# Every output frame sits in RAM, so 8x keeps at most a 1280 px long edge and 2x/4x at most 1920 px.
edge = g.add('ComfyMathExpression', expression='1920 if a <= 4 else 1280', values__a=L(mult))
big = g.add('ComfyMathExpression', expression='max(a, b) > (1920 if c <= 4 else 1280)', values__a=L(size, 0), values__b=L(size, 1), values__c=L(mult))
small = g.add('ResizeImageMaskNode', input=L(comp, 0), resize_type='scale longer dimension', resize_type__longer_size=L(edge, 1), scale_method='lanczos')
frames = g.add('ComfySwitchNode', switch=L(big, 2), on_true=L(small), on_false=L(comp, 0))
model = g.add('FrameInterpolationModelLoader', model_name='rife_v4.26.safetensors')
interp = g.add('FrameInterpolate', interp_model=L(model), images=L(frames), multiplier=L(mult))
vid = g.add('CreateVideo', images=L(interp), fps=L(comp, 2))
save_video(g, vid, 'rife_interpolate')
g.save('rife_interpolate')

# 6. birefnet_image: BiRefNet cut-out; output alpha (RGBA PNG), white or green.
g = G()
img = g.add('LoadImage', image='{{image}}')
bg = g.add('LoadBackgroundRemovalModel', bg_removal_name='birefnet.safetensors')
mask = g.add('RemoveBackground', bg_removal_model=L(bg), image=L(img, 0))
inv = g.add('InvertMask', mask=L(mask))
cut = g.add('JoinImageWithAlpha', image=L(img, 0), alpha=L(inv))
size = g.add('GetImageSize', image=L(img))
is_green = g.add('StringCompare', string_a='{{output}}', string_b='green', mode='Equal', case_sensitive=True)
green = g.add('PrimitiveInt', value=GREEN)
white = g.add('PrimitiveInt', value=WHITE)
color = g.add('ComfySwitchNode', switch=L(is_green), on_true=L(green), on_false=L(white))
plate = g.add('EmptyImage', width=L(size, 0), height=L(size, 1), batch_size=1, color=L(color))
solid = g.add('ImageCompositeMasked', destination=L(plate), source=L(img, 0), x=0, y=0, resize_source=False, mask=L(mask))
is_alpha = g.add('StringCompare', string_a='{{output}}', string_b='alpha', mode='Equal', case_sensitive=True)
out = g.add('ComfySwitchNode', switch=L(is_alpha), on_true=L(cut), on_false=L(solid))
g.add('SaveImage', images=L(out), filename_prefix='comfyfield/birefnet_image')
g.save('birefnet_image')


# 7-9. birefnet_video_matte: shared matte (BiRefNet per frame, gated and filled by a SAM 3.1 track of the
# subject BiRefNet finds in the first frame), then one output per format choice.
def video_matte(g):
    comp = clip_frames(g)
    size0 = g.add('GetImageSize', image=L(comp))
    frames = cap_long_edge(g, comp, size0, 1920)
    size = g.add('GetImageSize', image=L(frames))
    bg = g.add('LoadBackgroundRemovalModel', bg_removal_name='birefnet.safetensors')
    soft = g.add('RemoveBackground', bg_removal_model=L(bg), image=L(frames))
    first = g.add('ImageFromBatch', image=L(frames), batch_index=0, length=1)
    first_mask = g.add('RemoveBackground', bg_removal_model=L(bg), image=L(first))
    seed_mask = g.add('ThresholdMask', mask=L(first_mask), value=0.5)
    sam = g.add('CheckpointLoaderSimple', ckpt_name='sam3.1_multiplex_fp16.safetensors')
    track = g.add('SAM3_VideoTrack', images=L(frames), model=L(sam, 0), initial_mask=L(seed_mask), detection_threshold=0.5, max_objects=1, detect_interval=1)
    tracked = g.add('SAM3_TrackToMask', track_data=L(track), object_indices='')
    gate = g.add('GrowMask', mask=L(tracked), expand=16, tapered_corners=True)
    gated = g.add('MaskComposite', destination=L(soft), source=L(gate), x=0, y=0, operation='multiply')
    core = g.add('GrowMask', mask=L(tracked), expand=-8, tapered_corners=True)
    matte = g.add('MaskComposite', destination=L(gated), source=L(core), x=0, y=0, operation='add')
    return comp, frames, size, first, matte


g = G()
comp, frames, size, first, matte = video_matte(g)
plate = g.add('EmptyImage', width=L(size, 0), height=L(size, 1), batch_size=L(size, 2), color=GREEN)
keyed = g.add('ImageCompositeMasked', destination=L(plate), source=L(frames), x=0, y=0, resize_source=False, mask=L(matte))
vid = g.add('CreateVideo', images=L(keyed), audio=L(comp, 1), fps=L(comp, 2))
save_video(g, vid, 'birefnet_video_matte')
g.save('birefnet_video_matte')

g = G()
comp, frames, size, first, matte = video_matte(g)
inv = g.add('InvertMask', mask=L(matte))
rgba = g.add('JoinImageWithAlpha', image=L(frames), alpha=L(inv))
g.add('VHS_VideoCombine', images=L(rgba), frame_rate=L(comp, 2), loop_count=0, filename_prefix='comfyfield/birefnet_video_matte_alpha',
      format='video/webm', pingpong=False, save_output=True, audio=L(comp, 1), pix_fmt='yuva420p', crf=20, save_metadata=True, trim_to_audio=False)
g.save('birefnet_video_matte_alpha')

g = G()
comp, frames, size, first, matte = video_matte(g)
unet = g.add('UNETLoader', unet_name=QWEN_DIT, weight_dtype='default')
te = g.add('CLIPLoader', clip_name=QWEN_TE, type='qwen_image', device='default')
qvae = g.add('VAELoader', vae_name=QWEN_VAE)
enc = g.add('TextEncodeQwenImage21', clip=L(te), prompt='An empty background plate with no people and no main subject, for compositing a person in front of it: {{background}}',
            negative_prompt='', resolution=1024)
w = g.add('ComfyMathExpression', expression='round(sqrt(1048576 * a / b) / 32) * 32', values__a=L(size, 0), values__b=L(size, 1))
h = g.add('ComfyMathExpression', expression='round(sqrt(1048576 * b / a) / 32) * 32', values__a=L(size, 0), values__b=L(size, 1))
lat = g.add('EmptyLatentImage', width=L(w, 1), height=L(h, 1), batch_size=1)
guider = g.add('CFGGuider', model=L(unet), positive=L(enc, 0), negative=L(enc, 1), cfg=1)
sampler = g.add('KSamplerSelect', sampler_name='euler')
sigmas = g.add('ManualSigmas', sigmas=QWEN_SIGMAS)
noise = g.add('RandomNoise', noise_seed='{{seed}}')
sample = g.add('SamplerCustomAdvanced', noise=L(noise), guider=L(guider), sampler=L(sampler), sigmas=L(sigmas), latent_image=L(lat))
dec = g.add('VAEDecode', samples=L(sample), vae=L(qvae))
rgb = g.add('SplitImageWithAlpha', image=L(dec))
fit = g.add('ResizeImageMaskNode', input=L(rgb, 0), resize_type='match size', resize_type__match=L(first), resize_type__crop='center', scale_method='lanczos')
plates = g.add('RepeatImageBatch', image=L(fit), amount=L(size, 2))
comp_v = g.add('ImageCompositeMasked', destination=L(plates), source=L(frames), x=0, y=0, resize_source=False, mask=L(matte))
vid = g.add('CreateVideo', images=L(comp_v), audio=L(comp, 1), fps=L(comp, 2))
save_video(g, vid, 'birefnet_video_matte_scene')
g.save('birefnet_video_matte_scene')

# 10. birefnet_qwen_background: BiRefNet RGBA cut-out into a Qwen-Image 2.1 Turbo edit.
g = G()
img = g.add('LoadImage', image='{{image}}')
bg = g.add('LoadBackgroundRemovalModel', bg_removal_name='birefnet.safetensors')
mask = g.add('RemoveBackground', bg_removal_model=L(bg), image=L(img, 0))
inv = g.add('InvertMask', mask=L(mask))
cut = g.add('JoinImageWithAlpha', image=L(img, 0), alpha=L(inv))
size = g.add('GetImageSize', image=L(img))
res = g.add('ComfyMathExpression', expression='min(2048, max(512, round(sqrt(a * b) / 32) * 32))', values__a=L(size, 0), values__b=L(size, 1))
unet = g.add('UNETLoader', unet_name=QWEN_DIT, weight_dtype='default')
te = g.add('CLIPLoader', clip_name=QWEN_TE, type='qwen_image', device='default')
qvae = g.add('VAELoader', vae_name=QWEN_VAE)
enc = g.add('TextEncodeQwenImage21', clip=L(te), prompt='{{prompt}}', negative_prompt='', vae=L(qvae), resolution=L(res, 1), images__image_1=L(cut))
guider = g.add('CFGGuider', model=L(unet), positive=L(enc, 0), negative=L(enc, 1), cfg=1)
sampler = g.add('KSamplerSelect', sampler_name='euler')
sigmas = g.add('ManualSigmas', sigmas=QWEN_SIGMAS)
noise = g.add('RandomNoise', noise_seed='{{seed}}')
sample = g.add('SamplerCustomAdvanced', noise=L(noise), guider=L(guider), sampler=L(sampler), sigmas=L(sigmas), latent_image=L(enc, 2))
dec = g.add('VAEDecode', samples=L(sample), vae=L(qvae))
rgb = g.add('SplitImageWithAlpha', image=L(dec))
g.add('SaveImage', images=L(rgb, 0), filename_prefix='comfyfield/birefnet_qwen_background')
g.save('birefnet_qwen_background')

# 11. image_grade: three core GLSL passes (look, then Comfy's Color Adjustment for temperature, then Comfy's Film Grain).
g = G()
img = g.add('LoadImage', image='{{image}}')
looks = ['split_tone', 'soft_skin', 'old_lens', '16mm', 'faded', 'mono', 'warm_70s']
flags = [g.add('StringCompare', string_a='{{preset}}', string_b=name, mode='Equal', case_sensitive=True) for name in looks]
look = g.add('GLSLShader', fragment_shader=LOOKS, size_mode='from_input', images__image0=L(img, 0), **{f'bools__u_bool{i}': L(f) for i, f in enumerate(flags)})
temp = g.add('PrimitiveFloat', value='{{temperature}}')
warm = g.add('GLSLShader', fragment_shader=COLOR_ADJUST, size_mode='from_input', images__image0=L(look, 0),
             floats__u_float0=L(temp), floats__u_float1=0.0, floats__u_float2=0.0, floats__u_float3=0.0)
grain = g.add('PrimitiveFloat', value='{{grain}}')
amount = g.add('ComfyMathExpression', expression='max(a, 25 * b) / 100', values__a=L(grain), values__b=L(flags[looks.index('16mm')]))
grained = g.add('GLSLShader', fragment_shader=FILM_GRAIN, size_mode='from_input', images__image0=L(warm, 0),
                floats__u_float0=L(amount, 0), floats__u_float1=1.5, floats__u_float2=0.0, floats__u_float3=0.5, ints__u_int0=0)
rgb = g.add('SplitImageWithAlpha', image=L(grained, 0))
g.add('SaveImage', images=L(rgb, 0), filename_prefix='comfyfield/image_grade')
g.save('image_grade')

print('wrote', sorted(f for f in os.listdir(out_dir) if f.endswith('.json')))
