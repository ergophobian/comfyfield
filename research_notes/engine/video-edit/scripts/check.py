"""Check API graphs against node schemas read from ComfyUI v0.41.1 (and pack) sources.

Checks: class exists; input names exist (incl. DynamicCombo/Autogrow children); links point at an existing
node and an output index that exists, with a matching type; required inputs are set; literal combo values are
valid; literal numbers within min/max; optional loaders (_meta.optional) feed only optional inputs.
Usage: python -I check.py <schemas.json>[,<schemas2.json>] <graph.json> [...]
"""
import json, re, sys, os, io as _io
sys.stdout = _io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

S = {}
for p in sys.argv[1].split(','):
    S.update(json.load(open(p, encoding='utf-8')))

CUSTOM = {'SAM3TrackData': 'SAM3_TRACK_DATA', 'OpticalFlow': 'OPTICAL_FLOW', 'BoundingBox': 'BOUNDING_BOX',
          'FrameInterpolationModel': 'FRAME_INTERPOLATION_MODEL', 'ICLoRAParameters': 'ICLORA_PARAMETERS'}
def canon(t):
    if t is None: return None
    if t in CUSTOM: return CUSTOM[t]
    if t.isupper() or '_' in t: return t
    return re.sub(r'(?<!^)(?=[A-Z])', '_', t).upper()

# SaveVideo's codec helpers are not literal Input calls; describe them by hand from nodes_video.py.
S['SaveVideo']['inputs'] = [
    {'name': 'video', 'type': 'Video', 'optional': False},
    {'name': 'filename_prefix', 'type': 'String', 'optional': False},
    {'name': 'format', 'type': 'DynamicCombo', 'optional': False, 'options': [
        {'key': k, 'inputs': [{'name': 'codec', 'type': 'Combo', 'optional': False, 'options': ['auto', 'h264', 'av1'] if k != 'webm' else ['auto', 'av1']}]}
        for k in ('auto', 'mp4', 'mkv', 'webm')]},
    {'name': 'codec', 'type': 'Combo', 'optional': True, 'options': ['auto', 'h264', 'av1']},
]
# ComfyMathExpression builds its autogrow template in a variable (nodes_math.py): names a..z, MultiType Float/Int/Boolean, min 1.
for i in S['ComfyMathExpression']['inputs']:
    if i['name'] == 'values':
        i.update({'template': 'TemplateNames', 'names': list('abcdefghijklmnopqrstuvwxyz'), 'min': 1,
                  'item': {'name': 'value', 'type': 'MultiType', 'types': ['Float', 'Int', 'Boolean'], 'optional': True}})
# Classic combos whose option lists are module variables (nodes.py v0.41.1).
CLASSIC_OPTS = {('ImageScale', 'upscale_method'): ['nearest-exact', 'bilinear', 'area', 'bicubic', 'lanczos'],
                ('ImageScale', 'crop'): ['disabled', 'center']}

def out_types(cls):
    sch = S.get(cls)
    return [canon(o['type']) for o in sch['outputs']] if sch else None

def check(path):
    g = json.load(open(path, encoding='utf-8'))
    name = os.path.basename(path)
    probs = []
    placeholders = set()
    for nid, node in g.items():
        for v in node['inputs'].values():
            if isinstance(v, str):
                placeholders.update(re.findall(r'\{\{(\w+)\}\}', v))
    for nid, node in g.items():
        ct = node['class_type']
        sch = S.get(ct)
        if not sch:
            probs.append(f'#{nid} {ct}: class not found'); continue
        decl = {i['name']: i for i in sch['inputs'] if i.get('name')}
        given = node['inputs']
        # Expand dynamic children.
        allowed = dict(decl)
        for i in sch['inputs']:
            if i['type'] == 'DynamicCombo':
                sel = given.get(i['name'])
                for o in i.get('options') or []:
                    if o.get('key') is None or o.get('key') == sel or sel is None or (isinstance(sel, str) and '{{' in sel):
                        for c in o['inputs']:
                            allowed[i['name'] + '.' + c['name']] = c
            if i['type'] == 'Autogrow':
                item = i.get('item') or {}
                names = i.get('names') or (list('abcdefghijklmnopqrstuvwxyz') if i.get('template') == 'TemplateNames' else None)
                if names:
                    for nm in names:
                        allowed[i['name'] + '.' + nm] = dict(item, name=nm, optional=True)
                if i.get('prefix'):
                    for k in range(i.get('max') or 8):
                        allowed[i['name'] + '.' + i['prefix'] + str(k)] = dict(item, name=i['prefix'] + str(k), optional=True)
        for k, v in given.items():
            spec = allowed.get(k)
            if spec is None:
                probs.append(f'#{nid} {ct}: unknown input {k}'); continue
            if isinstance(v, list) and len(v) == 2 and isinstance(v[0], str):
                src = g.get(v[0])
                if not src:
                    probs.append(f'#{nid}.{k}: link to missing node {v[0]}'); continue
                ots = out_types(src['class_type'])
                if ots is None:
                    probs.append(f'#{nid}.{k}: source class {src["class_type"]} unknown'); continue
                if v[1] >= len(ots):
                    probs.append(f'#{nid}.{k}: {src["class_type"]} has {len(ots)} outputs, link asks [{v[1]}]'); continue
                ot = ots[v[1]]
                want = spec['type']
                if want in ('MatchType', 'COMFY_MATCHTYPE_V3'):
                    pass
                elif want == 'MultiType':
                    ok = ot in [canon(t) for t in (spec.get('types') or [])]
                    if not ok: probs.append(f'#{nid}.{k}: wants one of {spec.get("types")}, gets {ot} from #{v[0]}')
                elif ot in ('COMFY_MATCHTYPE_V3', 'MATCH_TYPE'):
                    pass
                else:
                    w = canon(want)
                    if w == 'COMBO' and ot in ('COMBO',): pass
                    elif w != ot:
                        probs.append(f'#{nid}.{k}: wants {w}, gets {ot} from #{v[0]} {src["class_type"]}[{v[1]}]')
                # Optional loader rule.
                opt = (src.get('_meta') or {}).get('optional')
                if opt and not spec.get('optional'):
                    probs.append(f'#{nid}.{k}: optional loader #{v[0]} ({opt}) feeds a required input')
            else:
                if isinstance(v, str) and '{{' in v:
                    continue
                opts = spec.get('options')
                if (ct, k) in CLASSIC_OPTS: opts = CLASSIC_OPTS[(ct, k)]
                t = spec['type']
                if t in ('Combo', 'COMBO') and isinstance(opts, list) and opts and not isinstance(opts[0], dict):
                    if v not in opts: probs.append(f'#{nid}.{k}: {v!r} not in {opts}')
                if t == 'DynamicCombo':
                    keys = [o.get('key') for o in opts or []]
                    if keys and None not in keys and v not in keys: probs.append(f'#{nid}.{k}: {v!r} not in {keys}')
                if t in ('Int', 'INT', 'Float', 'FLOAT') and isinstance(v, (int, float)) and not isinstance(v, bool):
                    mn, mx = spec.get('min'), spec.get('max')
                    if isinstance(mn, (int, float)) and v < mn: probs.append(f'#{nid}.{k}: {v} below min {mn}')
                    if isinstance(mx, (int, float)) and v > mx: probs.append(f'#{nid}.{k}: {v} above max {mx}')
                    if t in ('Int', 'INT') and isinstance(v, float): probs.append(f'#{nid}.{k}: float {v} for INT')
                if t in ('Boolean', 'BOOLEAN') and not isinstance(v, bool): probs.append(f'#{nid}.{k}: {v!r} is not a boolean')
                if t in ('String', 'STRING') and not isinstance(v, str): probs.append(f'#{nid}.{k}: {v!r} is not a string')
        # Required inputs.
        for i in sch['inputs']:
            nm = i.get('name')
            if not nm or i.get('optional'): continue
            if i['type'] == 'Autogrow':
                if (i.get('min') or 0) > 0 and not any(k.startswith(nm + '.') for k in given):
                    probs.append(f'#{nid} {ct}: autogrow {nm} needs at least {i.get("min")} entries')
                continue
            if nm not in given:
                probs.append(f'#{nid} {ct}: required input {nm} missing')
            if i['type'] == 'DynamicCombo' and nm in given:
                for o in i.get('options') or []:
                    if o.get('key') == given[nm]:
                        for c in o['inputs']:
                            if not c.get('optional') and f'{nm}.{c["name"]}' not in given:
                                probs.append(f'#{nid} {ct}: required child {nm}.{c["name"]} missing')
    print(f'{name}: {len(g)} nodes, placeholders {sorted(placeholders)}, problems {len(probs)}')
    for p in probs: print('   ', p)
    return len(probs)

total = sum(check(p) for p in sys.argv[2:])
print('total problems:', total)
