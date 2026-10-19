# Builds the 3D family's API-format graphs from the official templates' values.
# Usage: python build.py <repo root> <folder with pup_prompts.json>, where pup_prompts.json is
# system_prompts.json from huggingface.co/black-forest-labs/flux-3-image-klein-pup (ungated).
import json, sys, os
REPO = sys.argv[1]
OUT = os.path.join(REPO, 'research_notes', 'engine', '3d')
SCRATCH = sys.argv[2]


def L(node, idx=0):
    return [str(node), idx]


def trellis(g, image_link, *, target='{{resolution}}', texture=4096, full_pbr=True, prefix='comfyfield/trellis2'):
    """TRELLIS.2 branch of templates/3d_pixal3d_trellis2_image_to_model.json (switch = TRELLIS.2)."""
    g['2'] = {'class_type': 'LoadBackgroundRemovalModel', 'inputs': {'bg_removal_name': 'birefnet.safetensors'}}
    g['3'] = {'class_type': 'RemoveBackground', 'inputs': {'bg_removal_model': L(2), 'image': image_link}}
    g['4'] = {'class_type': 'ImageCropToMask', 'inputs': {'images': image_link, 'masks': L(3), 'width': 1024, 'height': 1024,
              'pad_factor': 1.0, 'grow_mask': 0, 'background': '#000000'}}
    g['5'] = {'class_type': 'CLIPVisionLoader', 'inputs': {'clip_name': 'dino_v3_vit_l.safetensors'}}
    g['6'] = {'class_type': 'Trellis2Conditioning', 'inputs': {'clip_vision_model': L(5), 'image': L(4)}}
    g['7'] = {'class_type': 'UNETLoader', 'inputs': {'unet_name': 'trellis_2_int8_convrot.safetensors', 'weight_dtype': 'default'}}
    g['8'] = {'class_type': 'VAELoader', 'inputs': {'vae_name': 'trellis_2_shape_vae_bf16.safetensors'}}
    g['9'] = {'class_type': 'VAELoader', 'inputs': {'vae_name': 'trellis_2_texture_vae_bf16.safetensors'}}
    # Sparse structure stage: guidance off for the last third, rescale 0.7, shift 5 (upstream rescale_t 5).
    g['10'] = {'class_type': 'CFGOverride', 'inputs': {'model': L(7), 'cfg': 1.0, 'start_percent': 0.667, 'end_percent': 1.0}}
    g['11'] = {'class_type': 'RescaleCFG', 'inputs': {'model': L(10), 'multiplier': 0.7}}
    g['12'] = {'class_type': 'ModelSamplingSD3', 'inputs': {'model': L(11), 'shift': 5.0}}
    # Shape stages: guidance off for the last 23 %, rescale 0.5.
    g['13'] = {'class_type': 'CFGOverride', 'inputs': {'model': L(7), 'cfg': 1.0, 'start_percent': 0.769, 'end_percent': 1.0}}
    g['14'] = {'class_type': 'RescaleCFG', 'inputs': {'model': L(13), 'multiplier': 0.5}}
    g['15'] = {'class_type': 'EmptyTrellis2LatentStructure', 'inputs': {'batch_size': 1}}

    def ks(model, pos, neg, lat, steps, cfg, sched):
        return {'class_type': 'KSampler', 'inputs': {
            'seed': '{{seed}}', 'steps': steps, 'cfg': cfg, 'sampler_name': 'euler', 'scheduler': sched, 'denoise': 1.0,
            'model': model, 'positive': pos, 'negative': neg, 'latent_image': lat}}
    g['16'] = ks(L(12), L(6, 0), L(6, 1), L(15), 12, 7.5, 'normal')
    g['17'] = {'class_type': 'VaeDecodeStructureTrellis2', 'inputs': {'samples': L(16), 'vae': L(8), 'resolution': '32'}}
    g['18'] = {'class_type': 'Trellis2ShapeStage', 'inputs': {'positive': L(6, 0), 'negative': L(6, 1), 'voxel': L(17)}}
    g['19'] = ks(L(14), L(18, 0), L(18, 1), L(18, 2), 20, 7.5, 'normal')
    g['20'] = {'class_type': 'Trellis2UpsampleStage', 'inputs': {'positive': L(18, 0), 'negative': L(18, 1), 'shape_latent': L(19),
               'vae': L(8), 'target_resolution': target}}
    g['21'] = ks(L(14), L(20, 0), L(20, 1), L(20, 2), 12, 7.5, 'simple')
    g['22'] = {'class_type': 'VaeDecodeShapeTrellis', 'inputs': {'samples': L(21), 'vae': L(8)}}
    g['23'] = {'class_type': 'Trellis2TextureStage', 'inputs': {'positive': L(20, 0), 'negative': L(20, 1), 'shape_latent': L(21)}}
    g['24'] = ks(L(7), L(23, 0), L(23, 1), L(23, 2), 12, 1.0, 'normal')
    g['25'] = {'class_type': 'VaeDecodeTextureTrellis', 'inputs': {'samples': L(24), 'vae': L(9), 'shape_subdivides': L(22, 1)}}
    # Mesh post-processing, as the template: remesh, decimate to 700k faces, unwrap, bake PBR.
    g['26'] = {'class_type': 'RemeshMesh', 'inputs': {'mesh': L(22, 0), 'resolution': 768, 'sign_mode': 'udf',
               'sign_mode.qef': False, 'sign_mode.drop_inverted_components': False, 'sign_mode.drop_enclosed_components': False,
               'band': 1.0, 'project_back': 0.0, 'fix_poles': False, 'smooth_iters': 20, 'drop_small_components': 0.01,
               'precluster_max_verts': 20000000}}
    g['27'] = {'class_type': 'DecimateMesh', 'inputs': {'mesh': L(26), 'target_face_count': 700000, 'placement_mode': 'midpoint'}}
    g['28'] = {'class_type': 'MeshSmoothNormals', 'inputs': {'mesh': L(27), 'crease_angle': 180.0}}
    g['29'] = {'class_type': 'UnwrapMesh', 'inputs': {'mesh': L(28), 'segmenter': 'pec', 'resolution': texture, 'padding': 1, 'weld_distance': 0.0002}}
    g['30'] = {'class_type': 'BakeTextureFromVoxel', 'inputs': {'mesh': L(29), 'voxel_colors': L(25), 'texture_size': texture, 'reference_mesh': L(22, 0)}}
    if full_pbr:
        g['31'] = {'class_type': 'BakeNormalMapFromMesh', 'inputs': {'low_poly': L(29), 'high_poly': L(26), 'resolution': 2048,
                   'cage_distance': 0.05, 'ignore_backfaces': True}}
        g['32'] = {'class_type': 'BakeAmbientOcclusion', 'inputs': {'low_poly': L(29), 'high_poly': L(26), 'resolution': 1024,
                   'samples': 64, 'max_distance': 0.71, 'strength': 1.0, 'bias': 0.01}}
        g['33'] = {'class_type': 'ApplyTextureToMesh', 'inputs': {'mesh': L(29), 'base_color': L(30, 0), 'metallic': L(30, 1),
                   'roughness': L(30, 2), 'occlusion': L(32), 'normal_map': L(31)}}
        g['34'] = {'class_type': 'MeshSmoothNormals', 'inputs': {'mesh': L(33), 'crease_angle': 180.0}}
        g['35'] = {'class_type': 'SaveGLB', 'inputs': {'mesh': L(34), 'filename_prefix': prefix}}
    else:
        g['33'] = {'class_type': 'ApplyTextureToMesh', 'inputs': {'mesh': L(29), 'base_color': L(30, 0)}}
    return g


def klein_t2i(g, base):
    """Nodes 1-10 of public/workflows/flux3_klein_t2i.json, renumbered, one 1024x1024 image."""
    src = json.load(open(os.path.join(REPO, 'public', 'workflows', 'flux3_klein_t2i.json'), encoding='utf8'))
    m = {k: str(base + int(k)) for k in src if k != '11'}
    for k, node in src.items():
        if k == '11':
            continue
        node = json.loads(json.dumps(node))
        for name, v in node['inputs'].items():
            if isinstance(v, list) and len(v) == 2 and isinstance(v[0], str):
                node['inputs'][name] = [m[v[0]], v[1]]
        g[m[k]] = node
    lat = g[m['8']]['inputs']
    lat['width'], lat['height'], lat['batch_size'] = 1024, 1024, 1
    return [m['10'], 0]


def klein_edit(g, image_link):
    """templates/image_flux3_klein_distilled_image_edit.json, one reference, square 1024 output."""
    i2i = json.load(open(os.path.join(SCRATCH, 'pup_prompts.json'), encoding='utf8'))['i2i']
    g['60'] = {'class_type': 'UNETLoader', 'inputs': {'unet_name': 'flux3-image-klein-bf16.safetensors', 'weight_dtype': 'default'}}
    g['61'] = {'class_type': 'CLIPLoader', 'inputs': {'clip_name': 'qwen3vl_4b_bf16.safetensors', 'type': 'flux3', 'device': 'default'}}
    g['62'] = {'class_type': 'VAELoader', 'inputs': {'vae_name': 'flux2-vae.safetensors'}}
    g['63'] = {'class_type': 'CLIPLoader', 'inputs': {'clip_name': 'qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors', 'type': 'flux3', 'device': 'default'}}
    g['64'] = {'class_type': 'TextGenerate', 'inputs': {
        'clip': L(63), 'image': image_link,
        'prompt': 'Reference images follow in order (the first image, the second image, ...).\nUser request: {{prompt}}\nOutput the caption.',
        'max_length': 3584, 'sampling_mode': 'on', 'sampling_mode.temperature': 1, 'sampling_mode.top_k': 1,
        'sampling_mode.top_p': 0.95, 'sampling_mode.min_p': 0, 'sampling_mode.repetition_penalty': 1.05,
        'sampling_mode.seed': 0, 'sampling_mode.presence_penalty': 0, 'thinking': False, 'use_default_template': True,
        'mtp': 'off', 'system_prompt': i2i}}
    g['65'] = {'class_type': 'CLIPTextEncode', 'inputs': {'text': L(64, 0), 'clip': L(61)}}
    g['66'] = {'class_type': 'ConditioningZeroOut', 'inputs': {'conditioning': L(65)}}
    g['67'] = {'class_type': 'ReferenceMultiLatent', 'inputs': {'positive': L(65), 'negative': L(66), 'vae': L(62),
               'resolution': 'resize', 'resolution.megapixels': 1.0, 'images.image0': image_link}}
    g['68'] = {'class_type': 'EmptyFlux2LatentImage', 'inputs': {'width': 1024, 'height': 1024, 'batch_size': 1}}
    g['69'] = {'class_type': 'KSampler', 'inputs': {'seed': '{{seed}}', 'steps': 16, 'cfg': 1, 'sampler_name': 'euler', 'scheduler': 'simple',
               'denoise': 1, 'model': L(60), 'positive': L(67, 0), 'negative': L(67, 1), 'latent_image': L(68)}}
    g['70'] = {'class_type': 'VAEDecode', 'inputs': {'samples': L(69), 'vae': L(62)}}
    return L(70)


def order(g):
    return {k: g[k] for k in sorted(g, key=int)}


def write(name, g):
    with open(os.path.join(OUT, name + '.json'), 'w', encoding='utf8', newline='\n') as f:
        json.dump(order(g), f, indent=2, ensure_ascii=False)
        f.write('\n')


# 1. Photo to 3D model
g = {'1': {'class_type': 'LoadImage', 'inputs': {'image': '{{image}}'}}}
write('trellis2_image', trellis(g, L(1)))

# 2. Text to 3D model: FLUX 3 Image Klein draws the reference, TRELLIS.2 lifts it.
g = {}
img = klein_t2i(g, 50)
write('flux_trellis2', trellis(g, img, target=1536, prefix='comfyfield/flux_trellis2'))

# 3. Character figure: FLUX 3 Image Klein redraws the saved character full body on white, TRELLIS.2 lifts it.
g = {'1': {'class_type': 'LoadImage', 'inputs': {'image': '{{image}}'}}}
img = klein_edit(g, L(1))
write('trellis2_character', trellis(g, img, target=1536, prefix='comfyfield/trellis2_character'))

# 4. Turntable video: TRELLIS.2 mesh, base color only, rendered by core RenderMesh on an orbit, 96 frames at 24 fps.
g = {'1': {'class_type': 'LoadImage', 'inputs': {'image': '{{image}}'}}}
trellis(g, L(1), target=1024, texture=2048, full_pbr=False)
FRAMES = 96
g['40'] = {'class_type': 'StartLoop', 'inputs': {'mode': 'simple', 'mode.num_iterations': FRAMES, 'cache_iterations': False}}
g['41'] = {'class_type': 'ComfyMathExpression', 'inputs': {'expression': f'a * 360 / {FRAMES}', 'values.a': L(40, 0)}}
g['42'] = {'class_type': 'CreateCameraInfo', 'inputs': {'mode': 'orbit', 'mode.yaw': L(41, 0), 'mode.pitch': 15.0, 'mode.distance': 2.4,
           'target_x': 0.0, 'target_y': 0.0, 'target_z': 0.0, 'roll': 0.0, 'fov': 35.0, 'zoom': 1.0, 'camera_type': 'perspective'}}
g['43'] = {'class_type': 'RenderMesh', 'inputs': {'mesh': L(33), 'mode': 'texture', 'width': 1024, 'height': 1024,
           'background': '{{background}}', 'camera_info': L(42)}}
g['44'] = {'class_type': 'EndLoop', 'inputs': {'output_value': L(43, 0), 'accumulate': True}}
g['45'] = {'class_type': 'RebatchImages', 'inputs': {'images': L(44, 0), 'batch_size': FRAMES}}
g['46'] = {'class_type': 'CreateVideo', 'inputs': {'images': L(45), 'fps': 24.0}}
g['47'] = {'class_type': 'SaveVideo', 'inputs': {'video': L(46), 'filename_prefix': 'comfyfield/trellis2_turntable',
           'format': 'mp4', 'codec': 'h264', 'format.codec': 'h264'}}
write('trellis2_turntable', g)
print('ok')
