"""Check klein API graphs against ComfyUI v0.41.1 (45bf90d1) node schemas.

Usage: python -I check_klein.py <comfyui_src_dir> <modelFiles.js> <graph.json> [...]

Specs below were read by hand from the pinned source; every class id, input name and combo value is also
looked up in that source text, so a typo in a spec fails too.
"""
import json
import os
import re
import sys
import io as _io

sys.stdout = _io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
args = sys.argv[1:]
FIXTURE = None
if '--nodes' in args:  # optional: scripts/fixtures/comfy-nodes.json, a real object_info dump of v0.41.1
    i = args.index('--nodes')
    FIXTURE = json.load(open(args[i + 1], encoding='utf-8'))['nodes']
    del args[i:i + 2]
SRC, MODEL_FILES_JS, GRAPHS = args[0], args[1], args[2:]

R, O = True, False  # required, optional
F, I, S, B = 'FLOAT', 'INT', 'STRING', 'BOOLEAN'
MATCH, ANY = 'MATCH', '*'

SAMPLERS_FILE = os.path.join(SRC, 'comfy', 'samplers.py')

# class: (source file, inputs {name: (type, required, combo or range)}, dynamic, outputs)
SPECS = {
    'UNETLoader': ('nodes.py', {'unet_name': ('FILE:diffusion_models', R, None), 'weight_dtype': ('COMBO', R, ['default', 'fp8_e4m3fn', 'fp8_e4m3fn_fast', 'fp8_e5m2'])}, {}, ['MODEL']),
    'CLIPLoader': ('nodes.py', {'clip_name': ('FILE:text_encoders', R, None), 'type': ('COMBO', R, ['flux3']), 'device': ('COMBO', O, ['default', 'cpu'])}, {}, ['CLIP']),
    'VAELoader': ('nodes.py', {'vae_name': ('FILE:vae', R, None)}, {}, ['VAE']),
    'LoadImage': ('nodes.py', {'image': ('UPLOAD', R, None)}, {}, ['IMAGE', 'MASK']),
    'CLIPTextEncode': ('nodes.py', {'text': (S, R, None), 'clip': ('CLIP', R, None)}, {}, ['CONDITIONING']),
    'ConditioningZeroOut': ('nodes.py', {'conditioning': ('CONDITIONING', R, None)}, {}, ['CONDITIONING']),
    'KSampler': ('nodes.py', {'model': ('MODEL', R, None), 'seed': (I, R, (0, 0xffffffffffffffff)), 'steps': (I, R, (1, 10000)), 'cfg': (F, R, (0, 100)),
                              'sampler_name': ('COMBO', R, 'SAMPLERS'), 'scheduler': ('COMBO', R, 'SCHEDULERS'), 'positive': ('CONDITIONING', R, None),
                              'negative': ('CONDITIONING', R, None), 'latent_image': ('LATENT', R, None), 'denoise': (F, R, (0, 1))}, {}, ['LATENT']),
    'VAEDecode': ('nodes.py', {'samples': ('LATENT', R, None), 'vae': ('VAE', R, None)}, {}, ['IMAGE']),
    'SaveImage': ('nodes.py', {'images': ('IMAGE', R, None), 'filename_prefix': (S, R, None)}, {}, ['IMAGE']),
    'EmptyImage': ('nodes.py', {'width': (I, R, (1, 16384)), 'height': (I, R, (1, 16384)), 'batch_size': (I, R, (1, 4096)), 'color': (I, R, (0, 0xFFFFFF))}, {}, ['IMAGE']),
    'TextGenerate': ('comfy_extras/nodes_textgen.py', {
        'clip': ('CLIP', R, None), 'prompt': (S, R, None), 'image': ('IMAGE', O, None), 'video': ('IMAGE', O, None), 'audio': ('AUDIO', O, None),
        'max_length': (I, R, (1, 32768)), 'sampling_mode': ('DYNCOMBO', R, ['on', 'off']), 'thinking': (B, O, None), 'use_default_template': (B, O, None),
        'mtp': ('COMBO', O, ['auto', 'off', '2', '3', '4', '5']), 'system_prompt': (S, O, None)},
        {'sampling_mode': {'on': {'temperature': (F, R, (0.01, 2.0)), 'top_k': (I, R, (0, 1000)), 'top_p': (F, R, (0, 1)), 'min_p': (F, R, (0, 1)),
                                  'repetition_penalty': (F, R, (0, 5)), 'seed': (I, R, (0, 0xffffffffffffffff)), 'presence_penalty': (F, O, (0, 5))}, 'off': {}}},
        [S, S]),
    'ReferenceMultiLatent': ('comfy_extras/nodes_edit_model.py', {
        'positive': ('CONDITIONING', R, None), 'negative': ('CONDITIONING', O, None), 'vae': ('VAE', O, None),
        'resolution': ('DYNCOMBO', R, ['keep resolution', 'resize']), 'images': ('AUTOGROW', O, ('prefix', 'image', 0, 100, 'IMAGE', O))},
        {'resolution': {'keep resolution': {}, 'resize': {'megapixels': (F, R, (0.01, 16.0))}}},
        ['CONDITIONING', 'CONDITIONING', 'LATENT']),
    'EmptyFlux2LatentImage': ('comfy_extras/nodes_flux.py', {'width': (I, R, (16, 16384)), 'height': (I, R, (16, 16384)), 'batch_size': (I, R, (1, 4096))}, {}, ['LATENT']),
    'ImageScaleToTotalPixels': ('comfy_extras/nodes_post_processing.py', {'image': ('IMAGE', R, None), 'upscale_method': ('COMBO', R, ['nearest-exact', 'bilinear', 'area', 'bicubic', 'lanczos']),
                                                                         'megapixels': (F, R, (0.01, 16.0)), 'resolution_steps': (I, R, (1, 256))}, {}, ['IMAGE']),
    'BatchImagesNode': ('comfy_extras/nodes_post_processing.py', {'images': ('AUTOGROW', R, ('prefix', 'image', 1, 50, 'IMAGE', R))}, {}, ['IMAGE']),
    'GetImageSize': ('comfy_extras/nodes_images.py', {'image': ('IMAGE', R, None)}, {}, [I, I, I]),
    'ResizeAndPadImage': ('comfy_extras/nodes_images.py', {'image': ('IMAGE', R, None), 'target_width': (I, R, (1, 16384)), 'target_height': (I, R, (1, 16384)),
                                                           'padding_color': ('COMBO', R, ['white', 'black']), 'interpolation': ('COMBO', R, ['area', 'bicubic', 'nearest-exact', 'bilinear', 'lanczos'])}, {}, ['IMAGE']),
    'ComfySwitchNode': ('comfy_extras/nodes_logic.py', {'switch': (B, R, None), 'on_false': (MATCH, O, None), 'on_true': (MATCH, O, None)}, {}, [MATCH]),
    'ComfyMathExpression': ('comfy_extras/nodes_math.py', {'expression': (S, R, None), 'values': ('AUTOGROW', R, ('names', 'abcdefghijklmnopqrstuvwxyz', 1, 26, 'FLOAT,INT,BOOLEAN', R))}, {}, [F, I, B]),
    'PrimitiveString': ('comfy_extras/nodes_primitive.py', {'value': (S, R, None)}, {}, [S]),
    'PrimitiveStringMultiline': ('comfy_extras/nodes_primitive.py', {'value': (S, R, None)}, {}, [S]),
    'PrimitiveInt': ('comfy_extras/nodes_primitive.py', {'value': (I, R, None)}, {}, [I]),
    'StringFormat': ('comfy_extras/nodes_string.py', {'values': ('AUTOGROW', R, ('names', 'abcdefghijklmnopqrstuvwxyz', 0, 26, ANY, R)), 'f_string': (S, R, None)}, {}, [S]),
    'StartLoop': ('comfy_extras/nodes_loop.py', {'mode': ('DYNCOMBO', R, ['simple', 'For', 'List']), 'cache_iterations': (B, R, None), 'parent_iteration': (I, O, None), 'initial_iteration_value': (MATCH, O, None)},
                  {'mode': {'simple': {'num_iterations': (I, R, (0, 2 ** 63))}, 'For': {'start_iteration_index': (I, R, None), 'max_iteration': (I, R, None), 'step': (I, R, (1, 2 ** 63))}, 'List': {'list': (MATCH, R, None)}}},
                  [I, B, B, MATCH, MATCH]),
    'EndLoop': ('comfy_extras/nodes_loop.py', {'output_value': (MATCH, O, None), 'next_iteration_value': (MATCH, O, None), 'accumulate': (B, R, None),
                                               'terminations': ('AUTOGROW', O, ('prefix', 'termination', 0, 50, ANY, R))}, {}, [MATCH]),
    'CreateList': ('comfy_extras/nodes_toolkit.py', {'inputs': ('AUTOGROW', R, ('prefix', 'input', 1, 10, ANY, R))}, {}, [ANY]),
}
OUTPUT_NODES = {'SaveImage'}
LOOP_START, LOOP_END = 'StartLoop', 'EndLoop'


def read(rel):
    return open(os.path.join(SRC, rel), encoding='utf-8').read()


def block_of(cls, rel):
    text = read(rel)
    m = re.search(r'node_id="%s"' % re.escape(cls), text)
    if m:
        start = text.rfind('\nclass ', 0, m.start())
        end = text.find('\nclass ', m.end())
        return text[start:end if end > 0 else None]
    m = re.search(r'\nclass %s[:(]' % re.escape(cls), text)
    if m and re.search(r'"%s"\s*:\s*%s\b' % (re.escape(cls), re.escape(cls)), text):
        end = text.find('\nclass ', m.end())
        return text[m.start():end]
    return None


def registered(cls, rel, blk):
    """A class must be listed, not commented out, in its extension's get_node_list or in NODE_CLASS_MAPPINGS."""
    m = re.search(r'class (\w+)\s*[(:]', blk)
    py = m.group(1) if m else cls
    text = read(rel)
    if re.search(r'^\s*"%s"\s*:\s*%s\b' % (re.escape(cls), re.escape(py)), text, re.M):
        return True
    for body in re.findall(r'def get_node_list\(self\)[^:]*:\s*return \[(.*?)\]', text, re.S):
        if any(line.strip().rstrip(',') == py for line in body.splitlines() if not line.strip().startswith('#')):
            return True
    return False


def combo_list(name):
    text = open(SAMPLERS_FILE, encoding='utf-8').read()
    if name == 'SAMPLERS':
        m = re.search(r'KSAMPLER_NAMES = \[(.*?)\]', text, re.S)
        return re.findall(r'"([^"]+)"', m.group(1)) + ['ddim', 'uni_pc', 'uni_pc_bh2']
    m = re.search(r'SCHEDULER_HANDLERS = \{(.*?)\n\}', text, re.S)
    return re.findall(r'"([^"]+)":', m.group(1))


# Model list: file name -> dir, from shared/modelFiles.js.
mf = open(MODEL_FILES_JS, encoding='utf-8').read()
MODEL_FILES = dict(re.findall(r"'([^']+\.safetensors)': \{[^}]*?dir: '([^']+)'", mf))

problems = []


def bad(graph, msg):
    problems.append(f'{graph}: {msg}')


# 1. Every spec matches the source.
source_ok = set()
for cls, (rel, inputs, dynamic, outputs) in SPECS.items():
    blk = block_of(cls, rel)
    if blk is None:
        bad('spec', f'{cls} not found in {rel}')
        continue
    if not registered(cls, rel, blk):
        bad('spec', f'{cls} is defined in {rel} but not registered (get_node_list / NODE_CLASS_MAPPINGS)')
    if FIXTURE is not None and cls not in FIXTURE:
        bad('spec', f'{cls} is not in the object_info fixture')
    for name, (typ, req, extra) in inputs.items():
        if f'"{name}"' not in blk:
            bad('spec', f'{cls}.{name} not in source')
        if typ == 'COMBO' and isinstance(extra, list):
            for v in extra:
                if f'"{v}"' not in blk and v not in ('flux3',):
                    bad('spec', f'{cls}.{name} combo {v!r} not in source')
    for parent, options in dynamic.items():
        for opt, children in options.items():
            if f'"{opt}"' not in blk:
                bad('spec', f'{cls}.{parent} option {opt!r} not in source')
            for child in children:
                if f'"{child}"' not in blk:
                    bad('spec', f'{cls}.{parent}.{child} not in source')
    source_ok.add(cls)
if '"flux3"' not in block_of('CLIPLoader', 'nodes.py'):
    bad('spec', 'CLIPLoader type flux3 not in source')


def expected_inputs(cls, node_inputs):
    """Flatten a node's schema for the keys it was given: name -> (type, required, extra)."""
    _, inputs, dynamic, _ = SPECS[cls]
    flat = {}
    for name, (typ, req, extra) in inputs.items():
        if typ == 'AUTOGROW':
            kind, names, lo, hi, t, treq = extra
            slots = [f'{names}{i}' for i in range(hi)] if kind == 'prefix' else list(names)[:hi]
            for i, slot in enumerate(slots):
                flat[f'{name}.{slot}'] = (t, req and treq and i < lo, None)
            continue
        flat[name] = (typ, req, extra)
        if typ == 'DYNCOMBO':
            chosen = node_inputs.get(name)
            for child, spec in dynamic[name].get(chosen, {}).items():
                flat[f'{name}.{child}'] = spec
    return flat


def out_type(g, link, seen=None):
    """Type of a link's source output, resolving MatchType through its inputs."""
    seen = seen or set()
    nid, idx = link
    node = g[nid]
    cls = node['class_type']
    if cls not in SPECS:
        return ANY  # an unknown class is reported where that node is checked
    t = SPECS[cls][3][idx] if idx < len(SPECS[cls][3]) else None
    if t not in (MATCH, ANY) or (nid, idx) in seen:
        return t
    seen.add((nid, idx))
    ins = node['inputs']
    cands = []
    if cls == 'ComfySwitchNode':
        cands = [ins[k] for k in ('on_false', 'on_true') if isinstance(ins.get(k), list)]
    elif cls == 'StartLoop' and idx == 4:
        cands = [ins['initial_iteration_value']] if isinstance(ins.get('initial_iteration_value'), list) else []
        cands += [n['inputs']['next_iteration_value'] for n in g.values() if n['class_type'] == LOOP_END and isinstance(n['inputs'].get('next_iteration_value'), list)]
    elif cls == 'EndLoop':
        cands = [ins['output_value']] if isinstance(ins.get('output_value'), list) else []
    elif cls == 'CreateList':
        cands = [v for k, v in ins.items() if k.startswith('inputs.') and isinstance(v, list)]
    types = {out_type(g, c, seen) for c in cands}
    types.discard(None)
    if len(types) > 1:
        return 'CONFLICT:' + ','.join(sorted(types))
    return types.pop() if types else t


def type_ok(got, want):
    if got is None or want is None:
        return False
    if ANY in (got, want) or MATCH in (got, want):
        return True
    if want.startswith('FILE') or want in ('COMBO', 'DYNCOMBO', 'UPLOAD'):
        return False
    return bool(set(got.split(',')) & set(want.split(',')))


def check_graph(name, g, removed=None):
    tag = name + (f' (without {removed})' if removed else '')
    for nid, node in g.items():
        cls = node.get('class_type')
        if cls not in SPECS:
            bad(tag, f'#{nid} {cls}: no spec / unknown class')
            continue
        ins = node['inputs']
        flat = expected_inputs(cls, ins)
        for key, val in ins.items():
            if key not in flat:
                bad(tag, f'#{nid} {cls}: unknown input {key}')
                continue
            typ, req, extra = flat[key]
            if isinstance(val, list):
                if len(val) != 2 or val[0] not in g:
                    bad(tag, f'#{nid} {cls}.{key}: link to missing node {val}')
                    continue
                src = g[val[0]]['class_type']
                if src not in SPECS:
                    continue  # reported where that node is checked
                if val[1] >= len(SPECS[src][3]):
                    bad(tag, f'#{nid} {cls}.{key}: {src} has no output {val[1]}')
                    continue
                got = out_type(g, val)
                if got and got.startswith('CONFLICT'):
                    bad(tag, f'#{nid} {cls}.{key}: MatchType sides disagree {got}')
                elif not type_ok(got, typ):
                    bad(tag, f'#{nid} {cls}.{key}: gets {got}, wants {typ}')
                continue
            if isinstance(val, str) and re.fullmatch(r'\{\{\w+\}\}', val):
                continue  # whole placeholder, typed by the app
            if typ.startswith('FILE:'):
                folder = typ.split(':', 1)[1]
                if val not in MODEL_FILES:
                    bad(tag, f'#{nid} {cls}.{key}: {val} not in MODEL_FILES')
                elif MODEL_FILES[val] != folder:
                    bad(tag, f'#{nid} {cls}.{key}: {val} is in {MODEL_FILES[val]}, loader reads {folder}')
            elif typ in ('COMBO', 'DYNCOMBO'):
                allowed = combo_list(extra) if isinstance(extra, str) else extra
                if val not in allowed:
                    bad(tag, f'#{nid} {cls}.{key}: {val!r} not a valid option')
            elif typ in (I, F):
                if isinstance(val, bool) or not isinstance(val, (int, float)) or (typ == I and not isinstance(val, int)):
                    bad(tag, f'#{nid} {cls}.{key}: {val!r} is not {typ}')
                elif isinstance(extra, tuple) and not (extra[0] <= val <= extra[1]):
                    bad(tag, f'#{nid} {cls}.{key}: {val} outside {extra}')
            elif typ == B and not isinstance(val, bool):
                bad(tag, f'#{nid} {cls}.{key}: {val!r} is not BOOLEAN')
            elif typ == S and not isinstance(val, str):
                bad(tag, f'#{nid} {cls}.{key}: {val!r} is not STRING')
            elif typ in ('IMAGE', 'CONDITIONING', 'LATENT', 'MODEL', 'CLIP', 'VAE', MATCH, 'AUDIO') or ',' in typ:
                if not (typ == MATCH or ',' in typ):
                    bad(tag, f'#{nid} {cls}.{key}: {typ} needs a link')
        for key, (typ, req, extra) in flat.items():
            if req and key not in ins:
                bad(tag, f'#{nid} {cls}: required input {key} missing')
    # Optional loaders link only into optional inputs, and their placeholder matches.
    for nid, node in g.items():
        opt = node.get('_meta', {}).get('optional')
        if not opt:
            continue
        if node['inputs'].get('image') != '{{%s}}' % opt:
            bad(tag, f'#{nid}: optional {opt} but loads {node["inputs"].get("image")}')
        for tid, t in g.items():
            if t['class_type'] not in SPECS:
                continue
            flat = expected_inputs(t['class_type'], t['inputs'])
            for key, val in t['inputs'].items():
                if isinstance(val, list) and val[0] == nid and key in flat and flat[key][1]:
                    bad(tag, f'optional loader #{nid} feeds required input #{tid}.{key}')
    # Loops: everything reachable from a Start Loop must close at its End Loop before any output node.
    children = {k: set() for k in g}
    for tid, t in g.items():
        for v in t['inputs'].values():
            if isinstance(v, list) and len(v) == 2 and v[0] in g:
                children[v[0]].add(tid)
    for sid, s in g.items():
        if s['class_type'] != LOOP_START:
            continue
        seen, stack, ends = set(), list(children[sid]), set()
        while stack:
            n = stack.pop()
            if n in seen:
                continue
            seen.add(n)
            if g[n]['class_type'] == LOOP_END:
                ends.add(n)
                continue
            if g[n]['class_type'] in OUTPUT_NODES or not children[n]:
                bad(tag, f'loop #{sid} escapes through #{n} {g[n]["class_type"]}')
            stack.extend(children[n])
        if len(ends) != 1:
            bad(tag, f'loop #{sid} closes at {sorted(ends)}')
    # Every node feeds an output (ComfyUI only runs and validates what an output needs).
    outputs = [k for k, v in g.items() if v['class_type'] in OUTPUT_NODES]
    if not outputs:
        bad(tag, 'no output node')
    need, stack = set(), list(outputs)
    while stack:
        n = stack.pop()
        if n in need:
            continue
        need.add(n)
        stack.extend(v[0] for v in g[n]['inputs'].values() if isinstance(v, list) and len(v) == 2 and v[0] in g)
    for k in g:
        if k not in need:
            bad(tag, f'#{k} {g[k]["class_type"]} feeds no output')


def without(g, nid):
    """What the app sends when the optional media is absent: the node and every input that links to it removed."""
    out = {}
    for k, v in g.items():
        if k == nid:
            continue
        out[k] = {**v, 'inputs': {ik: iv for ik, iv in v['inputs'].items() if not (isinstance(iv, list) and len(iv) == 2 and iv[0] == nid)}}
    return out


for path in GRAPHS:
    name = os.path.basename(path)
    g = json.load(open(path, encoding='utf-8'))
    check_graph(name, g)
    optional = [k for k, v in g.items() if v.get('_meta', {}).get('optional')]
    for k in optional:
        check_graph(name, without(g, k), removed=g[k]['_meta']['optional'])
    if len(optional) > 1:
        h = g
        for k in optional:
            h = without(h, k)
        check_graph(name, h, removed='+'.join(g[k]['_meta']['optional'] for k in optional))
    text = json.dumps(g)
    holders = sorted(set(re.findall(r'\{\{(\w+)\}\}', text)))
    classes = sorted({v['class_type'] for v in g.values()})
    files = sorted({v['inputs'][k] for v in g.values() for k in ('unet_name', 'clip_name', 'vae_name') if k in v['inputs']})
    print(f'{name}: {len(g)} nodes; placeholders {holders}; optional {[g[k]["_meta"]["optional"] for k in optional]}')
    print(f'  classes: {", ".join(classes)}')
    print(f'  files: {", ".join(files)}')

print(f'spec classes checked against source: {len(source_ok)}')
print('problems:', len(problems))
for p in problems:
    print('  ' + p)
