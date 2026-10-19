# Static checker for API-format graphs against ComfyUI source at a pinned commit.
# Usage: python -I check.py <comfy_src_dir> <graphs_dir> <modelFiles.js> <files.json>
# <comfy_src_dir> holds raw files from Comfy-Org/ComfyUI at 45bf90d1: nodes.py, comfy_extras/*.py,
# comfy_api/latest/_io.py, comfy/samplers.py, comfy_execution/validation.py. Needs Python 3.10+.
# It only parses the source; the one thing it executes is validate_loops, lifted from validation.py.
import ast, glob, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import schema as S  # noqa: E402

SRC, GRAPHS, MODEL_FILES_JS, FILES_JSON = sys.argv[1:5]
sys.stdout.reconfigure(encoding='utf-8')

# --- io type names, from @comfytype(io_type=...) in comfy_api/latest/_io.py
io_src = open(os.path.join(SRC, 'comfy_api', 'latest', '_io.py'), encoding='utf8').read()
IOTYPE = {m.group(2): m.group(1) for m in re.finditer(r'@comfytype\(io_type="([^"]+)"\)\s*\nclass (\w+)', io_src)}
IOTYPE['ShapeSubdivides'] = 'SHAPE_SUBDIVIDES'  # io.Custom("SHAPE_SUBDIVIDES") in nodes_trellis2.py
IOTYPE['Aud'] = 'AUDIO'
IOTYPE['MatchType'] = '*'  # resolved per link at run time


def io_type(spec):
    head = spec['io'].split('.')[0]
    return IOTYPE.get(head, head)


# --- V3 schemas from every comfy_extras file
files = sorted(glob.glob(os.path.join(SRC, 'comfy_extras', '*.py')))
V3 = {}
for f in files:
    try:
        V3.update({k: v for k, v in S.main([f]).items() if not k.startswith('V1:')})
    except Exception as e:  # a file the static reader cannot follow
        print('schema read failed', os.path.basename(f), type(e).__name__)

# --- V1 nodes this family uses, transcribed from nodes.py / comfy_extras/nodes_model_advanced.py at the pin
SAMPLERS = re.search(r'KSAMPLER_NAMES = \[(.*?)\]', open(os.path.join(SRC, 'comfy', 'samplers.py'), encoding='utf8').read(), re.S).group(1)
SAMPLERS = re.findall(r'"([^"]+)"', SAMPLERS) + ['ddim', 'uni_pc', 'uni_pc_bh2']
SCHEDULERS = re.findall(r'^\s+"(\w+)": SchedulerHandler', open(os.path.join(SRC, 'comfy', 'samplers.py'), encoding='utf8').read(), re.M)
CLIP_TYPES = ['stable_diffusion', 'stable_cascade', 'sd3', 'stable_audio', 'mochi', 'ltxv', 'pixart', 'cosmos', 'lumina2', 'wan', 'hidream', 'chroma', 'ace', 'omnigen2', 'qwen_image', 'hunyuan_image', 'flux2', 'ovis', 'longcat_image', 'cogvideox', 'lens', 'pixeldit', 'ideogram4', 'boogu', 'krea2', 'joyimage', 'mage', 'minimax', 'yue2', 'flux3']


def I(name, t, optional=False, **kw):
    return dict(name=name, t=t, optional=optional, **kw)


V1 = {
    'KSampler': ([I('model', 'MODEL'), I('seed', 'INT', min=0, max=18446744073709551615), I('steps', 'INT', min=1, max=10000),
                  I('cfg', 'FLOAT', min=0.0, max=100.0), I('sampler_name', 'COMBO', options=SAMPLERS), I('scheduler', 'COMBO', options=SCHEDULERS),
                  I('positive', 'CONDITIONING'), I('negative', 'CONDITIONING'), I('latent_image', 'LATENT'), I('denoise', 'FLOAT', min=0.0, max=1.0)], ['LATENT']),
    'LoadImage': ([I('image', 'COMBO', upload=True)], ['IMAGE', 'MASK']),
    'UNETLoader': ([I('unet_name', 'COMBO', folder='diffusion_models'), I('weight_dtype', 'COMBO', options=['default', 'fp8_e4m3fn', 'fp8_e4m3fn_fast', 'fp8_e5m2'])], ['MODEL']),
    'VAELoader': ([I('vae_name', 'COMBO', folder='vae')], ['VAE']),
    'CLIPVisionLoader': ([I('clip_name', 'COMBO', folder='clip_vision')], ['CLIP_VISION']),
    'CLIPLoader': ([I('clip_name', 'COMBO', folder='text_encoders'), I('type', 'COMBO', options=CLIP_TYPES), I('device', 'COMBO', optional=True, options=['default', 'cpu'])], ['CLIP']),
    'CLIPTextEncode': ([I('text', 'STRING'), I('clip', 'CLIP')], ['CONDITIONING']),
    'VAEDecode': ([I('samples', 'LATENT'), I('vae', 'VAE')], ['IMAGE']),
    'ConditioningZeroOut': ([I('conditioning', 'CONDITIONING')], ['CONDITIONING']),
    'ModelSamplingSD3': ([I('model', 'MODEL'), I('shift', 'FLOAT', min=0.0, max=100.0)], ['MODEL']),
    'RescaleCFG': ([I('model', 'MODEL'), I('multiplier', 'FLOAT', min=0.0, max=1.0)], ['MODEL']),
}

# --- model files the Pod can fetch
mf = open(MODEL_FILES_JS, encoding='utf8').read()
KNOWN = {m.group(1): m.group(2) for m in re.finditer(r"'([^']+\.(?:safetensors|pth|onnx|pt|bin))': \{[^}]*?dir: '([^']+)'", mf)}
NEW = json.load(open(FILES_JSON, encoding='utf8'))
KNOWN.update({k: v['dir'] for k, v in NEW.items()})


def v3_inputs(spec_list, values, prefix=''):
    """Flatten V3 inputs for the given graph values: selected DynamicCombo options and Autogrow slots."""
    out = []
    for spec in spec_list or []:
        if not isinstance(spec, dict) or 'io' not in spec:
            if isinstance(spec, dict) and spec.get('call') == '_save_video_codec_input':
                spec = codec_spec(spec)
            else:
                out.append(dict(name='?', t='?', unknown=spec))
                continue
        inner_input = spec['name'] if isinstance(spec.get('name'), dict) else None
        name = prefix + (inner_input['name'] if inner_input else spec['name'])
        kind = spec['io'].split('.')[0]
        if kind == 'DynamicCombo':
            opts = [o['option'] for o in spec['options']]
            out.append(dict(name=name, t='COMBO', options=opts, optional=bool(spec.get('optional'))))
            chosen = values.get(name)
            for o in spec['options']:
                if o['option'] == chosen:
                    out.extend(v3_inputs(o['inputs'], values, name + '.'))
        elif kind == 'Autogrow':
            tmpl = spec['template']
            kw = tmpl.get('kw', {})
            if tmpl['template'].endswith('TemplatePrefix'):
                inner = tmpl['args'][0] if tmpl['args'] else kw.get('input')
                pre = kw.get('prefix')
                slots = [k for k in values if re.fullmatch(re.escape(name + '.' + pre) + r'\d+', k)]
            else:
                inner = kw.get('input')
                slots = [k for k in values if re.fullmatch(re.escape(name + '.') + r'[a-z]', k)]
            if not slots and not spec.get('optional') and kw.get('min', 0) > 0:
                out.append(dict(name=name + '.<slot>', t=io_type(inner), optional=False))
            for k in slots:
                t = io_type(inner)
                types = None
                if inner['io'].startswith('MultiType'):
                    types = [IOTYPE.get(x.strip('<>').split('.')[-1], x) for x in inner['args'][0]]
                out.append(dict(name=k, t=t, types=types, optional=True))
        else:
            d = dict(name=name, t=io_type(spec), optional=bool(spec.get('optional')))
            for k in ('options', 'min', 'max'):
                if k in spec and not (isinstance(spec[k], str) and spec[k].startswith('<')):
                    d[k] = spec[k]
            opts = d.get('options')
            if isinstance(opts, dict):  # sorted(folder_paths.get_filename_list(<folder>)): a models folder
                folder = re.search(r"get_filename_list', 'args': \['(\w+)'", str(opts).replace('"', "'"))
                d.pop('options')
                if folder:
                    d['folder'] = folder.group(1)
            if kind == 'MultiType':
                first = [io_type(inner_input)] if inner_input else []
                d['types'] = first + [IOTYPE.get(x.strip('<>').split('.')[-1], x) for x in spec.get('types', [])]
                if inner_input and inner_input.get('optional'):
                    d['optional'] = True
            out.append(d)
    return out


def codec_spec(call):
    supported = call['args'][0]
    opts = []
    for c in supported:
        inner = [] if c == 'auto' else [{'io': 'DynamicCombo.Input', 'name': 'encoding', 'optional': True,
                                         'options': [{'option': 'auto', 'inputs': []}, {'option': 're-encode', 'inputs': [{'io': 'Float.Input', 'name': 'crf'}]}]}]
        opts.append({'option': c, 'inputs': inner})
    return {'io': 'DynamicCombo.Input', 'name': 'codec', 'options': opts, 'optional': bool(call['kw'].get('optional'))}


def outputs_of(cls):
    if cls in V1:
        return V1[cls][1]
    outs = []
    for o in V3[cls]['outputs'] or []:
        outs.append(io_type(o) if isinstance(o, dict) and 'io' in o else '?')
    return outs


def check(path):
    g = json.load(open(path, encoding='utf8'))
    lines, problems = [], []
    for nid, node in g.items():
        cls = node['class_type']
        vals = node['inputs']
        if cls in V1:
            specs = V1[cls][0]
            where = 'V1 (transcribed)'
        elif cls in V3:
            specs = v3_inputs(V3[cls]['inputs'], vals)
            where = os.path.relpath(V3[cls]['file'], SRC).replace('\\', '/')
        else:
            problems.append(f'{nid} {cls}: class not found at the pin')
            continue
        names = {s['name']: s for s in specs}
        for s in specs:
            if s.get('unknown'):
                problems.append(f'{nid} {cls}: schema entry not read statically: {s["unknown"]}')
            if not s.get('optional') and s['name'] not in vals:
                problems.append(f'{nid} {cls}: required input {s["name"]} is not set')
        for k, v in vals.items():
            s = names.get(k)
            if s is None:
                problems.append(f'{nid} {cls}: input {k} is not in the schema')
                continue
            if isinstance(v, list):
                src, idx = v
                if src not in g:
                    problems.append(f'{nid} {cls}.{k}: links to missing node {src}')
                    continue
                outs = outputs_of(g[src]['class_type'])
                if idx >= len(outs):
                    problems.append(f'{nid} {cls}.{k}: output {idx} out of range for {g[src]["class_type"]} ({len(outs)} outputs)')
                    continue
                ot, it = outs[idx], s['t']
                ok = ot == it or '*' in (ot, it) or (s.get('types') and ot in s['types']) or it == 'COMFY_MULTITYPED_V3'
                if not ok:
                    problems.append(f'{nid} {cls}.{k}: {g[src]["class_type"]} output {idx} is {ot}, input wants {it}')
                continue
            if isinstance(v, str) and '{{' in v:
                continue
            if 'options' in s and v not in s['options']:
                problems.append(f'{nid} {cls}.{k}: {v!r} not in {s["options"]}')
            if 'min' in s and isinstance(v, (int, float)) and not isinstance(v, bool) and v < s['min']:
                problems.append(f'{nid} {cls}.{k}: {v} below min {s["min"]}')
            if 'max' in s and isinstance(v, (int, float)) and not isinstance(v, bool) and v > s['max']:
                problems.append(f'{nid} {cls}.{k}: {v} above max {s["max"]}')
            if s.get('folder'):
                if v not in KNOWN:
                    problems.append(f'{nid} {cls}.{k}: {v} is in neither MODEL_FILES nor files.json')
                elif KNOWN[v] != s['folder']:
                    problems.append(f'{nid} {cls}.{k}: {v} is listed in {KNOWN[v]}, loader reads {s["folder"]}')
        lines.append(f'| {nid} | `{cls}` | {where} | {len(vals)} |')
        if cls == 'LoadBackgroundRemovalModel':
            v = vals['bg_removal_name']
            if KNOWN.get(v) != 'background_removal':
                problems.append(f'{nid} {cls}: {v} not listed in background_removal')
    for nid, node in g.items():
        if node.get('_meta', {}).get('optional'):
            problems.append(f'{nid}: optional loader present (check its links)')
    return g, lines, problems


# --- loop pairing and body, with ComfyUI's own validate_loops (comfy_execution/validation.py at the pin)
vsrc = open(os.path.join(SRC, 'comfy_execution', 'validation.py'), encoding='utf8').read()
tree = ast.parse(vsrc)
keep = [n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.ClassDef)) and n.name in ('LoopValidationError', '_walk_graph', '_loop_validation_error', 'validate_loops')]
ns = {'is_link': lambda v: isinstance(v, list) and len(v) == 2 and isinstance(v[0], str) and isinstance(v[1], int)}
exec(compile(ast.Module(body=keep, type_ignores=[]), 'validation.py', 'exec'), ns)

OUTPUT_NODES = {k for k, v in V3.items() if v.get('is_output_node')}
for path in sorted(glob.glob(os.path.join(GRAPHS, '*.json'))):
    name = os.path.basename(path)
    if name in ('files.json', 'loaders.json', 'packs.json'):
        continue
    g, lines, problems = check(path)
    print(f'### {name}')
    print(f'{len(g)} nodes. Problems: {len(problems)}')
    for p in problems:
        print('-', p)
    classes = {}
    for nid, node in g.items():
        cls = node['class_type']
        src = 'nodes.py / nodes_model_advanced.py (V1)' if cls in V1 else os.path.relpath(V3[cls]['file'], SRC).replace(os.sep, '/') if cls in V3 else 'MISSING'
        classes.setdefault((cls, src), []).append(nid)
    print('classes:', '; '.join(f"{c} ({s}): {','.join(ids)}" for (c, s), ids in sorted(classes.items())))
    links = sum(1 for n in g.values() for v in n['inputs'].values() if isinstance(v, list))
    print('links checked:', links)
    starts = {k for k, v in g.items() if v['class_type'] == 'StartLoop'}
    ends = {k for k, v in g.items() if v['class_type'] == 'EndLoop'}
    outs = {k for k, v in g.items() if v['class_type'] in OUTPUT_NODES}
    print('output nodes:', sorted(outs, key=int), [g[k]['class_type'] for k in sorted(outs, key=int)])
    if starts:
        pairs = ns['validate_loops'](json.loads(json.dumps(g)), outs, set(g), starts, ends)
        gg = json.loads(json.dumps(g))
        ns['validate_loops'](gg, outs, set(g), starts, ends)
        for s in starts:
            print(f'loop: StartLoop {s} -> EndLoop {pairs[s]}, body {gg[s]["_loop_body"]}')
    print()
