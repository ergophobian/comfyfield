# Extract V3 node schemas (IO.Schema) from ComfyUI source files, statically via AST.
import ast, sys, json

_seen=set()
def lit(n, env):
    try:
        return ast.literal_eval(n)
    except Exception:
        pass
    if isinstance(n, ast.Name) and n.id in env:
        if n.id in _seen: return '<%s>' % n.id
        _seen.add(n.id)
        try:
            return lit(env[n.id], env)
        finally:
            _seen.discard(n.id)
    if isinstance(n, ast.Call):
        return call(n, env)
    if isinstance(n, (ast.List, ast.Tuple)):
        return [lit(e, env) for e in n.elts]
    if isinstance(n, ast.BinOp) and isinstance(n.op, ast.Add):
        a, b = lit(n.left, env), lit(n.right, env)
        if isinstance(a, list) and isinstance(b, list): return a + b
    if isinstance(n, ast.ListComp):
        return '<listcomp:%s>' % ast.unparse(n)[:200]
    return '<%s>' % ast.unparse(n)[:120]

def dotted(f):
    parts = []
    while isinstance(f, ast.Attribute):
        parts.append(f.attr); f = f.value
    if isinstance(f, ast.Name): parts.append(f.id)
    return '.'.join(reversed(parts))

def call(n, env):
    name = dotted(n.func)
    args = [lit(a, env) for a in n.args]
    kw = {k.arg: lit(k.value, env) for k in n.keywords if k.arg}
    if name.endswith('.Input') or name.endswith('.Output'):
        d = {'io': name[3:] if name[:3] in ('IO.', 'io.') else name}
        if args: d['name'] = args[0]
        for k in ('default', 'min', 'max', 'step', 'options', 'optional', 'display_name', 'force_input', 'multiline', 'types', 'template', 'advanced'):
            if k in kw: d[k] = kw[k]
        if len(args) > 1: d['args'] = args[1:]
        return d
    if name.endswith('DynamicCombo.Option'):
        return {'option': args[0] if args else kw.get('key'), 'inputs': args[1] if len(args) > 1 else kw.get('inputs')}
    if name.endswith('TemplatePrefix') or name.endswith('TemplateNames'):
        return {'template': name, 'args': args, 'kw': kw}
    if name.endswith('Schema'):
        return {'schema': kw}
    return {'call': name, 'args': args, 'kw': {k: v for k, v in kw.items()}}

def main(paths, want=None):
    out = {}
    for p in paths:
        tree = ast.parse(open(p, encoding='utf-8-sig').read())
        for cls in [n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]:
            for fn in cls.body:
                if isinstance(fn, ast.FunctionDef) and fn.name in ('define_schema',):
                    env = {}
                    for st in ast.walk(fn):
                        if isinstance(st, ast.Assign) and len(st.targets) == 1 and isinstance(st.targets[0], ast.Name):
                            env[st.targets[0].id] = st.value
                    for st in ast.walk(fn):
                        if isinstance(st, ast.Return) and isinstance(st.value, ast.Call):
                            s = call(st.value, env)
                            if 'schema' in s:
                                kw = s['schema']
                                nid = kw.get('node_id')
                                if want and nid not in want: continue
                                out[nid] = {'file': p, 'class': cls.name, 'inputs': kw.get('inputs'), 'outputs': kw.get('outputs'), 'is_output_node': kw.get('is_output_node'), 'hidden': kw.get('hidden')}
                # V1 nodes: INPUT_TYPES / RETURN_TYPES
                if isinstance(fn, ast.FunctionDef) and fn.name == 'INPUT_TYPES':
                    for st in ast.walk(fn):
                        if isinstance(st, ast.Return):
                            out.setdefault('V1:' + cls.name, {})['INPUT_TYPES'] = ast.unparse(st.value)[:1500]
            for st in cls.body:
                if isinstance(st, ast.Assign) and isinstance(st.targets[0], ast.Name) and st.targets[0].id in ('RETURN_TYPES', 'RETURN_NAMES', 'FUNCTION', 'OUTPUT_NODE'):
                    if 'V1:' + cls.name in out:
                        out['V1:' + cls.name][st.targets[0].id] = ast.unparse(st.value)
    return out

if __name__ == '__main__':
    want = set(sys.argv[2].split(',')) if len(sys.argv) > 2 and sys.argv[2] else None
    files = sys.argv[1].split(',')
    res = main(files, want)
    sys.stdout.reconfigure(encoding='utf-8')
    print(json.dumps(res, indent=1, ensure_ascii=False, default=str))
