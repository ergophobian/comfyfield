"""Static extractor of ComfyUI node schemas (V1 INPUT_TYPES and V3 io.Schema) via AST.

Usage: python -I schemas.py <ComfyUI root> <out.json>
Writes {class_type: {"inputs": {name: {"type", "optional", "options"?}}, "outputs": [types], "file": path, "v": 1|3, "dynamic": [...]}}
"""
import ast, json, os, sys

sys.stdout.reconfigure(encoding='utf-8')
root, out_path = sys.argv[1], sys.argv[2]

def lit(node):
    try:
        return ast.literal_eval(node)
    except Exception:
        return None

def kw(call, name):
    for k in call.keywords:
        if k.arg == name:
            return k.value
    return None

def attr_chain(n):
    parts = []
    while isinstance(n, ast.Attribute):
        parts.append(n.attr)
        n = n.value
    if isinstance(n, ast.Name):
        parts.append(n.id)
    return list(reversed(parts))

# V3 type names: io.Image.Input -> IMAGE
V3_TYPES = {
    'Image': 'IMAGE', 'Mask': 'MASK', 'Latent': 'LATENT', 'Model': 'MODEL', 'Vae': 'VAE', 'Clip': 'CLIP',
    'Conditioning': 'CONDITIONING', 'Int': 'INT', 'Float': 'FLOAT', 'Boolean': 'BOOLEAN', 'String': 'STRING',
    'Combo': 'COMBO', 'Video': 'VIDEO', 'Audio': 'AUDIO', 'Sampler': 'SAMPLER', 'Sigmas': 'SIGMAS', 'Noise': 'NOISE',
    'Guider': 'GUIDER', 'UpscaleModel': 'UPSCALE_MODEL', 'BackgroundRemoval': 'BACKGROUND_REMOVAL', 'BoundingBox': 'BOUNDING_BOX',
    'ClipVision': 'CLIP_VISION', 'ClipVisionOutput': 'CLIP_VISION_OUTPUT', 'Curve': 'CURVE', 'LatentUpscaleModel': 'LATENT_UPSCALE_MODEL',
}

def v3_input(call, consts):
    """Parse io.X.Input(...) or io.DynamicCombo.Input / io.Autogrow.Input / io.MatchType.Input / io.MultiType.Input / Custom.Input"""
    f = attr_chain(call.func)
    if not f or f[-1] != 'Input':
        return None
    typ = f[-2] if len(f) >= 2 else '?'
    name = lit(call.args[0]) if call.args else lit(kw(call, 'id'))
    opt = lit(kw(call, 'optional')) is True
    d = {'type': V3_TYPES.get(typ, typ), 'optional': opt}
    for b in ('min', 'max'):
        v = lit(kw(call, b))
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            d[b] = v
    if typ == 'Combo':
        o = kw(call, 'options')
        if o is not None:
            v = lit(o)
            if v is None and isinstance(o, ast.Name) and o.id in consts:
                v = consts[o.id]
            if v is None and isinstance(o, ast.Attribute):
                v = consts.get(o.attr)
            d['options'] = v if isinstance(v, list) else '<dynamic>'
    if typ == 'DynamicCombo':
        opts = {}
        o = kw(call, 'options')
        if isinstance(o, ast.List):
            for el in o.elts:
                if isinstance(el, ast.Call):
                    key = el.args[0] if el.args else None
                    keyv = lit(key)
                    if keyv is None and isinstance(key, ast.Attribute):
                        keyv = consts.get('ENUM:' + key.attr, key.attr)
                    subs = {}
                    if len(el.args) > 1 and isinstance(el.args[1], ast.List):
                        for s in el.args[1].elts:
                            if isinstance(s, ast.Call):
                                sd = v3_input(s, consts)
                                if sd:
                                    subs[sd[0]] = sd[1]
                            elif isinstance(s, ast.Name) and s.id in consts.get('__vars__', {}):
                                sd = consts['__vars__'][s.id]
                                subs[sd[0]] = sd[1]
                    opts[keyv] = subs
        d['dynamic_options'] = opts
    if typ == 'Autogrow':
        d['autogrow'] = True
    if typ in ('MatchType', 'MultiType'):
        d['type'] = '*'
    if typ == 'Input' or f[0] not in ('io', 'IO'):
        # Custom types e.g. FrameInterpolationModel.Input
        d['type'] = consts.get('CUSTOM:' + f[0], f[0])
    return (name, d)

def v3_output(call, consts):
    f = attr_chain(call.func)
    if not f or f[-1] != 'Output':
        return None
    typ = f[-2] if len(f) >= 2 else f[0]
    if f[0] not in ('io', 'IO'):
        return consts.get('CUSTOM:' + f[0], f[0])
    if typ in ('MatchType', 'MultiType'):
        return '*'
    return V3_TYPES.get(typ, typ)

out = {}

for dirpath, _, files in os.walk(root):
    if any(p in dirpath for p in ('comfy_api_nodes', 'tests', 'custom_nodes', '.git', 'app', 'alembic')):
        continue
    for fn in files:
        if not fn.endswith('.py'):
            continue
        path = os.path.join(dirpath, fn)
        try:
            src = open(path, encoding='utf-8').read()
            tree = ast.parse(src)
        except Exception:
            continue
        consts = {}
        # module-level and class-level list constants, enum members, custom io types
        for n in ast.walk(tree):
            if isinstance(n, ast.Assign) and len(n.targets) == 1:
                t = n.targets[0]
                if isinstance(t, ast.Name):
                    v = lit(n.value)
                    if isinstance(v, list):
                        consts[t.id] = v
                    if isinstance(n.value, ast.Call):
                        f = attr_chain(n.value.func)
                        if f[-1:] == ['Custom'] and n.value.args:
                            consts['CUSTOM:' + t.id] = lit(n.value.args[0])
                        if f and f[-1] == 'Input':
                            consts.setdefault('__vars__', {})
                elif isinstance(t, ast.Attribute):
                    pass
            if isinstance(n, ast.ClassDef):
                for b in n.body:
                    if isinstance(b, ast.Assign) and len(b.targets) == 1 and isinstance(b.targets[0], ast.Name):
                        v = lit(b.value)
                        if isinstance(v, str):
                            consts['ENUM:' + b.targets[0].id] = v
                        if isinstance(v, list):
                            consts[b.targets[0].id] = v
        # local variables holding Inputs (e.g. crop_combo = io.Combo.Input(...))
        for n in ast.walk(tree):
            if isinstance(n, ast.Assign) and len(n.targets) == 1 and isinstance(n.targets[0], ast.Name) and isinstance(n.value, ast.Call):
                f = attr_chain(n.value.func)
                if f and f[-1] == 'Input':
                    r = v3_input(n.value, consts)
                    if r:
                        consts.setdefault('__vars__', {})[n.targets[0].id] = r
        for cls in [n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]:
            # V3
            for call in [c for c in ast.walk(cls) if isinstance(c, ast.Call) and attr_chain(c.func)[-1:] == ['Schema']]:
                nid = lit(kw(call, 'node_id'))
                if not nid:
                    continue
                ins = {}
                i_list = kw(call, 'inputs')
                if isinstance(i_list, ast.List):
                    for el in i_list.elts:
                        if isinstance(el, ast.Call):
                            r = v3_input(el, consts)
                            if r:
                                ins[r[0]] = r[1]
                        elif isinstance(el, ast.Name) and el.id in consts.get('__vars__', {}):
                            r = consts['__vars__'][el.id]
                            ins[r[0]] = r[1]
                        elif isinstance(el, ast.Starred):
                            ins['<starred>'] = {'type': '?', 'optional': True}
                outs = []
                o_list = kw(call, 'outputs')
                if isinstance(o_list, ast.List):
                    for el in o_list.elts:
                        if isinstance(el, ast.Call):
                            outs.append(v3_output(el, consts))
                out[nid] = {'v': 3, 'file': os.path.relpath(path, root), 'inputs': ins, 'outputs': outs,
                            'list_input': lit(kw(call, 'is_input_list')) is True}
            # V1
            it = [b for b in cls.body if isinstance(b, ast.FunctionDef) and b.name == 'INPUT_TYPES']
            rt = [b for b in cls.body if isinstance(b, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'RETURN_TYPES' for t in b.targets)]
            if it:
                ins = {}
                for r in [x for x in ast.walk(it[0]) if isinstance(x, ast.Return)]:
                    if isinstance(r.value, ast.Dict):
                        for k, v in zip(r.value.keys, r.value.values):
                            sect = lit(k)
                            if sect not in ('required', 'optional') or not isinstance(v, ast.Dict):
                                continue
                            for k2, v2 in zip(v.keys, v.values):
                                name = lit(k2)
                                typ = None
                                options = None
                                if isinstance(v2, ast.Tuple) and v2.elts:
                                    first = v2.elts[0]
                                    typ = lit(first)
                                    if isinstance(typ, list):
                                        options, typ = typ, 'COMBO'
                                    elif typ is None:
                                        typ, options = 'COMBO', '<dynamic>'
                                ins[name] = {'type': typ, 'optional': sect == 'optional'}
                                if isinstance(v2, ast.Tuple) and len(v2.elts) > 1 and isinstance(v2.elts[1], ast.Dict):
                                    for kk, vv in zip(v2.elts[1].keys, v2.elts[1].values):
                                        kn = lit(kk)
                                        if kn in ('min', 'max'):
                                            vl = lit(vv)
                                            if isinstance(vl, (int, float)) and not isinstance(vl, bool):
                                                ins[name][kn] = vl
                                if options is not None:
                                    ins[name]['options'] = options
                outs = list(lit(rt[0].value) or []) if rt else []
                out.setdefault('__v1__', {})[cls.name] = {'v': 1, 'file': os.path.relpath(path, root), 'inputs': ins, 'outputs': outs}

# map V1 classes through NODE_CLASS_MAPPINGS in every file
v1 = out.pop('__v1__', {})
for dirpath, _, files in os.walk(root):
    if any(p in dirpath for p in ('comfy_api_nodes', 'tests', 'custom_nodes', '.git')):
        continue
    for fn in files:
        if not fn.endswith('.py'):
            continue
        path = os.path.join(dirpath, fn)
        try:
            tree = ast.parse(open(path, encoding='utf-8').read())
        except Exception:
            continue
        for n in ast.walk(tree):
            if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'NODE_CLASS_MAPPINGS' for t in n.targets) and isinstance(n.value, ast.Dict):
                for k, v in zip(n.value.keys, n.value.values):
                    key = lit(k)
                    if isinstance(v, ast.Name) and v.id in v1:
                        out.setdefault(key, v1[v.id])

json.dump(out, open(out_path, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(len(out), 'node classes')
