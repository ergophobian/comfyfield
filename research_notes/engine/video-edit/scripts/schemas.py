"""Extract node schemas (inputs in order, types, optional, combo options, outputs) from ComfyUI sources.

V3 nodes: io.Schema(node_id=..., inputs=[io.X.Input("name", ...)], outputs=[io.Y.Output(...)]).
Classic nodes: INPUT_TYPES dict literals + RETURN_TYPES, mapped by NODE_CLASS_MAPPINGS.
Usage: python -I schemas.py out.json <dir or file> [...]
"""
import ast, json, os, sys

def const(n):
    try:
        return ast.literal_eval(n)
    except Exception:
        return None

def attr_chain(f):
    parts = []
    while isinstance(f, ast.Attribute):
        parts.append(f.attr); f = f.value
    if isinstance(f, ast.Name): parts.append(f.id)
    return list(reversed(parts))

def parse_input(call):
    ch = attr_chain(call.func)
    if len(ch) < 2 or ch[-1] != 'Input':
        return None
    typ = ch[-2]
    kw = {k.arg: k.value for k in call.keywords}
    name = const(call.args[0]) if call.args else None
    if call.args and isinstance(call.args[0], ast.Call):
        inner = parse_input(call.args[0])
        name = inner['name'] if inner else None
        d0 = inner or {}
    else:
        d0 = {}
    if name is None and 'id' in kw: name = const(kw['id'])
    d = {'name': name, 'type': typ}
    if typ == 'MultiType':
        tl = kw.get('types') or (call.args[1] if len(call.args) > 1 else None)
        d['types'] = [attr_chain(e)[-1] for e in tl.elts] if isinstance(tl, ast.List) else None
        if d0.get('type'): d['types'] = [d0['type']] + (d['types'] or [])
    
    d['optional'] = bool(const(kw['optional'])) if 'optional' in kw else False
    if 'default' in kw: d['default'] = const(kw['default'])
    for k in ('min', 'max'):
        if k in kw: d[k] = const(kw[k])
    if typ == 'Combo':
        opts = kw.get('options') or (call.args[1] if len(call.args) > 1 else None)
        d['options'] = const(opts) if opts is not None else None
    if typ == 'DynamicCombo':
        opts = []
        o = kw.get('options')
        if isinstance(o, ast.List):
            for e in o.elts:
                if isinstance(e, ast.Call):
                    key = const(e.args[0]) if e.args else None
                    sub = []
                    if len(e.args) > 1 and isinstance(e.args[1], ast.List):
                        for s in e.args[1].elts:
                            if isinstance(s, ast.Call):
                                p = parse_input(s)
                                if p: sub.append(p)
                    opts.append({'key': key, 'inputs': sub})
        d['options'] = opts
    if typ == 'Autogrow':
        t = kw.get('template')
        if isinstance(t, ast.Call):
            tk = {k.arg: k.value for k in t.keywords}
            d['template'] = attr_chain(t.func)[-1]
            if 'prefix' in tk: d['prefix'] = const(tk['prefix'])
            if 'names' in tk: d['names'] = const(tk['names'])
            inp = tk.get('input') or (t.args[0] if t.args else None)
            if isinstance(inp, ast.Call):
                d['item'] = parse_input(inp)
            for k in ('min', 'max'):
                if k in tk: d[k] = const(tk[k])
    if 'extra_dict' in kw:
        d['extra'] = 'set'
    return d

def parse_output(call):
    ch = attr_chain(call.func)
    if len(ch) < 2 or ch[-1] != 'Output':
        return None
    kw = {k.arg: k.value for k in call.keywords}
    return {'type': ch[-2], 'is_list': bool(const(kw['is_output_list'])) if 'is_output_list' in kw else False}

def v3(tree, out, src):
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and attr_chain(node.func)[-1:] == ['Schema']:
            kw = {k.arg: k.value for k in node.keywords}
            nid = const(kw.get('node_id')) if 'node_id' in kw else None
            if not nid: continue
            ins = []
            if isinstance(kw.get('inputs'), ast.List):
                for e in kw['inputs'].elts:
                    if isinstance(e, ast.Call):
                        p = parse_input(e)
                        if p: ins.append(p)
                    else:
                        ins.append({'name': None, 'type': 'UNPARSED'})
            outs = []
            if isinstance(kw.get('outputs'), ast.List):
                for e in kw['outputs'].elts:
                    if isinstance(e, ast.Call):
                        p = parse_output(e)
                        if p: outs.append(p)
            out[nid] = {'src': src, 'kind': 'v3', 'inputs': ins, 'outputs': outs,
                        'is_input_list': bool(const(kw['is_input_list'])) if 'is_input_list' in kw else False}

def classic(tree, out, src):
    classes = {n.name: n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)}
    mapping = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'NODE_CLASS_MAPPINGS' for t in node.targets):
            if isinstance(node.value, ast.Dict):
                for k, v in zip(node.value.keys, node.value.values):
                    if isinstance(v, ast.Name): mapping[const(k)] = v.id
    for key, cname in mapping.items():
        c = classes.get(cname)
        if not c: continue
        ins, outs = [], []
        for item in c.body:
            if isinstance(item, ast.FunctionDef) and item.name == 'INPUT_TYPES':
                for r in ast.walk(item):
                    if isinstance(r, ast.Return) and isinstance(r.value, ast.Dict):
                        for sk, sv in zip(r.value.keys, r.value.values):
                            sect = const(sk)
                            if sect not in ('required', 'optional') or not isinstance(sv, ast.Dict): continue
                            for ik, iv in zip(sv.keys, sv.values):
                                name = const(ik)
                                d = {'name': name, 'optional': sect == 'optional'}
                                t = iv.elts[0] if isinstance(iv, ast.Tuple) and iv.elts else iv
                                tv = const(t)
                                if isinstance(t, ast.Attribute): d['type'] = t.attr
                                elif isinstance(tv, str): d['type'] = tv
                                elif isinstance(tv, list): d['type'] = 'COMBO'; d['options'] = tv
                                else: d['type'] = 'COMBO'; d['options'] = None
                                if isinstance(iv, ast.Tuple) and len(iv.elts) > 1:
                                    opt = const(iv.elts[1])
                                    if isinstance(opt, dict):
                                        for k in ('default', 'min', 'max'):
                                            if k in opt: d[k] = opt[k]
                                ins.append(d)
                        break
            if isinstance(item, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'RETURN_TYPES' for t in item.targets):
                if isinstance(item.value, ast.Tuple):
                    outs = [{'type': (e.attr if isinstance(e, ast.Attribute) else const(e)), 'is_list': False} for e in item.value.elts]
        out[key] = {'src': src, 'kind': 'classic', 'class': cname, 'inputs': ins, 'outputs': outs}

def main():
    out = {}
    paths = []
    for p in sys.argv[2:]:
        if os.path.isdir(p):
            for root, _, files in os.walk(p):
                paths += [os.path.join(root, f) for f in files if f.endswith('.py')]
        else:
            paths.append(p)
    for f in paths:
        try:
            tree = ast.parse(open(f, encoding='utf-8').read())
        except Exception as e:
            print('skip', f, e); continue
        v3(tree, out, os.path.basename(f))
        classic(tree, out, os.path.basename(f))
    json.dump(out, open(sys.argv[1], 'w', encoding='utf-8'), indent=1)
    print(len(out), 'schemas')

main()
