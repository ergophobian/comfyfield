"""Optimize built-in generated masters on Windows without provider access."""
import json
import hashlib
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'research_notes/placeholder-assets-sources.json').read_text())
report = root / 'research_notes/placeholder-assets-sizes.json'
previous = {r['path']: r for r in json.loads(report.read_text())} if report.exists() else {}
records = []
for entry in manifest:
    source = root / 'outputs/art-masters' / (entry['id'] + '.png')
    if not source.exists():
        continue
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        outputs = [(f"covers/{entry['id']}", 768, 80000)]
        outputs.extend((f'heroes/{page}', 1600, 200000) for page in entry.get('heroes', []))
        for name, edge, budget in outputs:
            output = root / 'public/art' / (name + '.webp')
            output.parent.mkdir(parents=True, exist_ok=True)
            relative = str(output.relative_to(root)).replace('\\', '/')
            old = previous.get(relative)
            if old and old.get('sourceSha256') == digest and output.exists() and output.stat().st_size == old['bytes']:
                records.append(old)
                continue
            sized = image.copy()
            sized.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            for quality in [80, 74, 68, 62, 56, 50]:
                sized.save(output, 'WEBP', quality=quality, method=6)
                if output.stat().st_size <= budget:
                    break
            if output.stat().st_size > budget:
                raise RuntimeError(f'{output} exceeds {budget} bytes')
            records.append({'path': relative, 'width': sized.width, 'height': sized.height, 'bytes': output.stat().st_size, 'quality': quality, 'source': entry['id'], 'sourceSha256': digest})
report.write_text(json.dumps(records, indent=2) + '\n')
print(f'{len(records)} optimized images, {sum(r["bytes"] for r in records):,} bytes')
