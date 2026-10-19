"""Checks API graphs against node schemas extracted from ComfyUI at the pinned commit.

Usage: python -I check_graphs.py <schemas.json> <modelFiles.js> <graph dir>
"""
import json, os, re, sys

sys.stdout.reconfigure(encoding='utf-8')
schemas = json.load(open(sys.argv[1], encoding='utf-8'))
mf_src = open(sys.argv[2], encoding='utf-8').read()
gdir = sys.argv[3]

# MODEL_FILES and LOADERS from shared/modelFiles.js, plus this family's files.json and loaders.json.
files = {m.group(1): {'dir': m.group(2), 'cloud': m.group(3) == 'true'}
         for m in re.finditer(r"'([^']+)':\s*\{[^}]*?dir:\s*'([^']+)'[^}]*?cloud:\s*(true|false)", mf_src)}
loaders = {}
lb = re.search(r'const LOADERS = \{(.*?)\n\}', mf_src, re.S).group(1)
for m in re.finditer(r'(\w+):\s*\{([^}]*)\}', lb):
    loaders[m.group(1)] = dict(re.findall(r"(\w+):\s*'([^']+)'", m.group(2)))
fam_files = json.load(open(os.path.join(gdir, 'files.json'), encoding='utf-8'))
fam_loaders = json.load(open(os.path.join(gdir, 'loaders.json'), encoding='utf-8'))
for k, v in fam_files.items():
    files.setdefault(k, {'dir': v['dir'], 'cloud': v['cloud'], 'new': True})
for k, v in fam_loaders.items():
    loaders.setdefault(k, {}).update(v)

# Autogrow templates (read from the node source at the pinned commit).
AUTOGROW = {
    ('ComfyMathExpression', 'values'): {'names': list('abcdefghijklmnopqrstuvwxyz'), 'min': 1, 'type': 'FLOAT,INT,BOOLEAN'},
    ('GLSLShader', 'images'): {'prefix': 'image', 'max': 5, 'min': 1, 'type': 'IMAGE'},
    ('GLSLShader', 'floats'): {'prefix': 'u_float', 'max': 20, 'min': 0, 'type': 'FLOAT'},
    ('GLSLShader', 'ints'): {'prefix': 'u_int', 'max': 20, 'min': 0, 'type': 'INT'},
    ('GLSLShader', 'bools'): {'prefix': 'u_bool', 'max': 10, 'min': 0, 'type': 'BOOLEAN'},
    ('GLSLShader', 'curves'): {'prefix': 'u_curve', 'max': 4, 'min': 0, 'type': 'CURVE'},
    ('TextEncodeQwenImage21', 'images'): {'names': [f'image_{i}' for i in range(1, 17)], 'min': 0, 'type': 'IMAGE'},
}
# Combos whose options come from code, not literals.
SAMPLERS = ['euler', 'euler_ancestral', 'res_multistep', 'lcm', 'er_sde']
SCHEDULERS = ['simple', 'sgm_uniform', 'karras', 'exponential', 'ddim_uniform', 'beta', 'normal', 'linear_quadratic', 'kl_optimal']
DYN_COMBOS = {('KSampler', 'sampler_name'): SAMPLERS, ('KSamplerSelect', 'sampler_name'): SAMPLERS, ('KSampler', 'scheduler'): SCHEDULERS}
# VideoHelperSuite VideoCombine at 4d907bee (videohelpersuite/nodes.py and video_formats/webm.json).
schemas['VHS_VideoCombine'] = {'v': 1, 'inputs': {
    'images': {'type': 'IMAGE,LATENT', 'optional': False}, 'frame_rate': {'type': 'FLOAT,INT', 'optional': False, 'min': 1},
    'loop_count': {'type': 'INT', 'optional': False, 'min': 0, 'max': 100}, 'filename_prefix': {'type': 'STRING', 'optional': False},
    'format': {'type': 'COMBO', 'optional': False, 'options': ['image/gif', 'image/webp', 'video/webm', 'video/h264-mp4', 'video/ProRes', 'video/av1-webm']},
    'pingpong': {'type': 'BOOLEAN', 'optional': False}, 'save_output': {'type': 'BOOLEAN', 'optional': False},
    'audio': {'type': 'AUDIO', 'optional': True}, 'meta_batch': {'type': 'VHS_BatchManager', 'optional': True}, 'vae': {'type': 'VAE', 'optional': True},
    # format widgets of video/webm, passed as kwargs
    'pix_fmt': {'type': 'COMBO', 'optional': True, 'options': ['yuv420p', 'yuva420p']}, 'crf': {'type': 'INT', 'optional': True, 'min': 0, 'max': 100},
    'save_metadata': {'type': 'BOOLEAN', 'optional': True}, 'trim_to_audio': {'type': 'BOOLEAN', 'optional': True},
}, 'outputs': ['VHS_FILENAMES']}

# SaveVideo's codec inputs come from _save_video_codec_input() in comfy_extras/nodes_video.py, which the
# extractor does not follow: each format option holds a required `codec` DynamicCombo, and a hidden
# optional top-level `codec` exists too.
_codec = {'type': 'COMBO', 'optional': False, 'options': ['auto', 'h264', 'av1']}
sv = schemas['SaveVideo']['inputs']
for opt in ('auto', 'mp4', 'mkv'):
    sv['format']['dynamic_options'][opt] = {'codec': dict(_codec)}
sv['format']['dynamic_options']['webm'] = {'codec': {'type': 'COMBO', 'optional': False, 'options': ['auto', 'av1']}}
sv['codec'] = dict(_codec, optional=True)

PRIM = {'INT', 'FLOAT', 'STRING', 'BOOLEAN'}

def types_ok(out_t, in_t):
    if out_t in ('*', None) or in_t in ('*', None):
        return True
    a, b = set(str(out_t).split(',')), set(str(in_t).split(','))
    return bool(a & b)

def expand_inputs(ct, node_inputs):
    """Returns {key: spec} for every allowed key given the chosen DynamicCombo options, and the required keys."""
    sch = schemas[ct]['inputs']
    allowed, required = {}, set()
    for name, spec in sch.items():
        t = spec['type']
        if t == 'DynamicCombo':
            allowed[name] = {'type': 'COMBO', 'optional': spec['optional'], 'options': list(spec['dynamic_options'].keys())}
            if not spec['optional']:
                required.add(name)
            chosen = node_inputs.get(name)
            for sub, ss in spec['dynamic_options'].get(chosen, {}).items():
                allowed[f'{name}.{sub}'] = ss
                if not ss['optional']:
                    required.add(f'{name}.{sub}')
        elif t == 'Autogrow':
            tpl = AUTOGROW.get((ct, name))
            if not tpl:
                allowed[f'{name}.*'] = {'type': '*', 'optional': True}
                continue
            names = tpl.get('names') or [f"{tpl['prefix']}{i}" for i in range(tpl['max'])]
            for i, n in enumerate(names):
                allowed[f'{name}.{n}'] = {'type': tpl['type'], 'optional': i >= tpl['min']}
                if i < tpl['min']:
                    required.add(f'{name}.{n}')
        else:
            allowed[name] = spec
            if not spec['optional']:
                required.add(name)
    return allowed, required

problems_total = 0
report = {}
for fn in sorted(os.listdir(gdir)):
    if not fn.endswith('.json') or fn in ('files.json', 'loaders.json', 'packs.json'):
        continue
    g = json.load(open(os.path.join(gdir, fn), encoding='utf-8'))
    probs, notes = [], []
    placeholders = sorted(set(re.findall(r'\{\{(\w+)\}\}', json.dumps(g))))
    loaded = []
    for nid, node in g.items():
        ct = node['class_type']
        if ct not in schemas:
            probs.append(f'#{nid} {ct}: class not found at the pinned commit')
            continue
        allowed, required = expand_inputs(ct, node['inputs'])
        for k, v in node['inputs'].items():
            spec = allowed.get(k)
            if spec is None:
                probs.append(f'#{nid} {ct}: unknown input {k}')
                continue
            if isinstance(v, list) and len(v) == 2 and isinstance(v[0], str):
                src = g.get(v[0])
                if src is None:
                    probs.append(f'#{nid} {ct}.{k}: links to missing node {v[0]}')
                    continue
                outs = schemas.get(src['class_type'], {}).get('outputs', [])
                if v[1] >= len(outs):
                    probs.append(f'#{nid} {ct}.{k}: output {v[1]} of {src["class_type"]} does not exist ({len(outs)} outputs)')
                    continue
                if not types_ok(outs[v[1]], spec['type']):
                    probs.append(f'#{nid} {ct}.{k}: {src["class_type"]} output {v[1]} is {outs[v[1]]}, input wants {spec["type"]}')
            else:
                if isinstance(v, str) and re.fullmatch(r'\{\{\w+\}\}', v):
                    continue  # filled at run time
                t = spec['type']
                opts = spec.get('options')
                if (ct, k) in DYN_COMBOS:
                    opts = DYN_COMBOS[(ct, k)]
                if t == 'COMBO' and isinstance(opts, list) and v not in opts:
                    probs.append(f'#{nid} {ct}.{k}: {v!r} not in {opts}')
                if t == 'COMBO' and opts == '<dynamic>' and ct in loaders and k in loaders[ct]:
                    f = files.get(v)
                    if not f:
                        probs.append(f'#{nid} {ct}.{k}: file {v} not in MODEL_FILES or files.json')
                    elif f['dir'] != loaders[ct][k]:
                        probs.append(f'#{nid} {ct}.{k}: file {v} is in {f["dir"]}, loader reads {loaders[ct][k]}')
                    else:
                        loaded.append((v, f['dir'], f['cloud'], 'new' if f.get('new') else 'MODEL_FILES'))
                elif t == 'COMBO' and opts == '<dynamic>':
                    if (ct, k) not in DYN_COMBOS:
                        probs.append(f'#{nid} {ct}.{k}: dynamic combo {v!r} not checked')
                if t in ('INT', 'FLOAT') and isinstance(v, (int, float)):
                    if 'min' in spec and v < spec['min']:
                        probs.append(f'#{nid} {ct}.{k}: {v} < min {spec["min"]}')
                    if 'max' in spec and v > spec['max']:
                        probs.append(f'#{nid} {ct}.{k}: {v} > max {spec["max"]}')
                if t == 'INT' and isinstance(v, float) and not v.is_integer():
                    probs.append(f'#{nid} {ct}.{k}: {v} is not an INT')
                if t == 'BOOLEAN' and not isinstance(v, bool):
                    probs.append(f'#{nid} {ct}.{k}: {v!r} is not a BOOLEAN')
        for r in required:
            if r not in node['inputs']:
                probs.append(f'#{nid} {ct}: required input {r} not set')
        if ct in loaders:
            for k in loaders[ct]:
                if k not in node['inputs']:
                    probs.append(f'#{nid} {ct}: loader input {k} missing')
        if node.get('_meta', {}).get('optional'):
            notes.append(f'#{nid} optional loader')
    # GLSL uniforms are bound by list position, so each autogrow group must be contiguous from 0.
    for nid, node in g.items():
        if node['class_type'] == 'GLSLShader':
            for grp, pre in (('floats', 'u_float'), ('ints', 'u_int'), ('bools', 'u_bool'), ('images', 'image')):
                idx = sorted(int(k.split('.')[1][len(pre):]) for k in node['inputs'] if k.startswith(grp + '.'))
                if idx != list(range(len(idx))):
                    probs.append(f'#{nid} GLSLShader {grp} not contiguous from 0: {idx}')
    outs = [n['class_type'] for n in g.values() if n['class_type'] in ('SaveImage', 'SaveVideo', 'VHS_VideoCombine', 'SaveAudio')]
    report[fn] = {'nodes': len(g), 'classes': sorted({n['class_type'] for n in g.values()}), 'placeholders': placeholders,
                  'files': sorted(set(loaded)), 'outputs': outs, 'problems': probs, 'notes': notes}
    problems_total += len(probs)

for fn, r in report.items():
    print(f'== {fn}: {r["nodes"]} nodes, outputs {r["outputs"]}, placeholders {r["placeholders"]}')
    for f in r['files']:
        print('   file', f)
    print('   classes', ', '.join(r['classes']))
    for p in r['problems']:
        print('   PROBLEM', p)
print('TOTAL PROBLEMS', problems_total)
json.dump(report, open(os.path.join(os.path.dirname(sys.argv[1]), 'check_report.json'), 'w', encoding='utf-8'), indent=1)
