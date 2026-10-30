"""Measure a piece of music: the reference film's soundtrack (to study it) or the BGM you rendered (to grade it).

    python analyze_audio.py <audio or video> [--out DIR] [--stems] [--cues cues.json] [--label ref]

Uses whatever is installed and says what it skipped:
  - librosa (required): tempo, onsets, loudness every 0.5 s, brightness, a key/mode estimate, how much repeats
  - Beat This! (optional, `pip install beat_this`): beats and downbeats, so the metre (3s or 4s, 6/8)
  - Demucs (optional, `pip install demucs`, with --stems): splits drums / bass / other / vocals, each measured alone
  - Basic Pitch (optional, `pip install basic-pitch`, with --stems): the notes of the bass and "other" stems ->
    which pitches the tune uses, its range, how busy it is
  - --cues: the film's cue list (render.mjs music writes cues into score-summary.json; or any [{t, label}]) ->
    for every cue, how far the nearest musical onset is (the sync, measured on the real sound, not the score)
Writes DIR/analysis.md (read this) and DIR/analysis.json.
"""
import argparse, json, os, subprocess, sys, tempfile
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')  # Windows consoles can't print ♯ otherwise
except Exception:
    pass

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('--out', default=None)
ap.add_argument('--stems', action='store_true')
ap.add_argument('--cues', default=None)
ap.add_argument('--label', default='audio')
a = ap.parse_args()
out = a.out or os.path.splitext(a.src)[0] + '-analysis'
os.makedirs(out, exist_ok=True)
notes, report, data = [], [], {}

try:
    import numpy as np
    import librosa
except ImportError:
    sys.exit('librosa is required: pip install librosa')

# any input -> 44.1 kHz stereo wav
wav = os.path.join(out, 'audio.wav')
subprocess.run([os.environ.get('FFMPEG', 'ffmpeg'), '-hide_banner', '-loglevel', 'error', '-y', '-i', a.src, '-vn', '-ac', '2', '-ar', '44100', wav], check=True)
y, sr = librosa.load(wav, sr=22050, mono=True)
dur = len(y) / sr
report += [f'# Analysis — {a.label}', '', f'- length {dur:.2f} s']

# ---- the mix
tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
onsets = librosa.onset.onset_detect(y=y, sr=sr, units='time', backtrack=False)
hop = int(sr * 0.5)
rms = librosa.feature.rms(y=y, frame_length=hop, hop_length=hop)[0]
rms_db = [round(float(20 * np.log10(max(v, 1e-5))), 1) for v in rms]
cent = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
flat = librosa.feature.spectral_flatness(y=y)[0]
chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
pc = chroma.mean(axis=1)
# key/mode estimate (Krumhansl profiles), plus how strongly it holds
maj = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
mnr = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
scores = [(np.corrcoef(np.roll(maj, k), pc)[0, 1], names[k] + ' major') for k in range(12)] + [(np.corrcoef(np.roll(mnr, k), pc)[0, 1], names[k] + ' minor') for k in range(12)]
scores.sort(reverse=True)
# repetition: how alike the bars of chroma are to each other (1 = a loop, low = through-composed)
sim = None
if beat_frames is not None and len(beat_frames) > 8:
    sync = librosa.util.sync(chroma, beat_frames)
    S = librosa.segment.recurrence_matrix(sync, mode='affinity', sym=True)
    sim = round(float(S.mean()), 3)
data.update(tempo=float(np.atleast_1d(tempo)[0]), onsets=[round(float(t), 3) for t in onsets], rms_half_s=rms_db,
            centroid_hz=round(float(cent.mean())), flatness=round(float(flat.mean()), 4),
            key=scores[0][1], key_conf=round(float(scores[0][0]), 3), key_runner_up=scores[1][1],
            pitch_class_profile={names[i]: round(float(pc[i]), 3) for i in range(12)}, repetition=sim)
report += [
    f'- tempo (librosa) {data["tempo"]:.1f} bpm · {len(onsets)} onsets ({len(onsets) / dur:.1f} a second)',
    f'- key estimate {data["key"]} (fit {data["key_conf"]}), next {data["key_runner_up"]} — a low fit means modal or chromatic, not wrong',
    f'- pitch classes used (0–1): ' + ' '.join(f'{n}:{data["pitch_class_profile"][n]:.2f}' for n in names),
    f'- brightness (spectral centroid) {data["centroid_hz"]} Hz · noisiness (flatness) {data["flatness"]}',
    f'- repetition {sim} (bar-to-bar likeness; above ~0.5 sounds like a loop)' if sim is not None else '- repetition: too short to measure',
    f'- loudness every 0.5 s (dBFS RMS): ' + ' '.join(str(round(v)) for v in rms_db),
]

# ---- Beat This!: beats and downbeats -> the metre
try:
    from beat_this.inference import File2Beats
    import torch
    f2b = File2Beats(checkpoint_path='final0', device='cuda' if torch.cuda.is_available() else 'cpu', dbn=False)
    beats, downs = f2b(wav)
    beats, downs = [float(b) for b in beats], [float(d) for d in downs]
    per_bar = []
    for i in range(len(downs) - 1):
        per_bar.append(sum(1 for b in beats if downs[i] <= b < downs[i + 1] - 1e-3))
    from collections import Counter
    meter = Counter(per_bar).most_common(2)
    ibi = float(np.median(np.diff(beats))) if len(beats) > 2 else 0
    data.update(beats=beats, downbeats=downs, beats_per_bar=per_bar)
    report += [f'- Beat This!: {len(beats)} beats, {len(downs)} downbeats · beat every {ibi:.3f} s ({60 / ibi if ibi else 0:.1f} bpm) · beats per bar: {meter}']
except ImportError:
    notes.append('Beat This! not installed (pip install beat_this) — no downbeats/metre')
except Exception as e:
    notes.append(f'Beat This! failed: {e}')

# ---- the cues: is the music doing something where the picture does?
if a.cues:
    cj = json.load(open(a.cues, encoding='utf8'))
    cues = cj.get('sync') if isinstance(cj, dict) else cj
    cues = [{'t': c['t'], 'label': c.get('cue') or c.get('label', '')} for c in cues]
    on = np.array(onsets)
    rows, hit = [], 0
    for c in cues:
        d = float((on - c['t'])[np.argmin(np.abs(on - c['t']))]) if len(on) else 99
        ok = abs(d) <= 0.05
        hit += ok
        rows.append(f'  - {c["t"]:6.2f} s {c["label"]}: nearest onset {d * 1000:+.0f} ms {"" if ok else "  <- nothing here"}')
    report += ['', f'## Sync on the real sound: {hit}/{len(cues)} cues have an onset within 50 ms', *rows]
    data['sync_hits'] = [hit, len(cues)]

# ---- Demucs stems + Basic Pitch notes
if a.stems:
    try:
        sd = os.path.join(out, 'stems')
        subprocess.run([sys.executable, '-m', 'demucs', '-n', 'htdemucs', '-o', sd, wav], check=True, capture_output=True)
        base = os.path.join(sd, 'htdemucs', 'audio')
        report += ['', '## Stems (Demucs)']
        for stem in ['drums', 'bass', 'other', 'vocals']:
            p = os.path.join(base, stem + '.wav')
            if not os.path.exists(p):
                continue
            ys, _ = librosa.load(p, sr=22050, mono=True)
            level = 20 * np.log10(max(float(np.sqrt(np.mean(ys ** 2))), 1e-6))
            ons = librosa.onset.onset_detect(y=ys, sr=sr, units='time')
            line = f'- {stem}: level {level:.1f} dBFS · {len(ons)} onsets ({len(ons) / dur:.1f}/s)'
            if stem in ('bass', 'other'):
                try:
                    from basic_pitch.inference import predict
                    _, _, ev = predict(p)
                    if ev:
                        ps = [e[2] for e in ev]
                        hist = [0] * 12
                        for q in ps: hist[q % 12] += 1
                        top = sorted(range(12), key=lambda i: -hist[i])[:7]
                        line += f' · {len(ev)} notes, range {librosa.midi_to_note(min(ps))}–{librosa.midi_to_note(max(ps))}, most used: ' + ' '.join(names[i] for i in top)
                        data[f'notes_{stem}'] = [[round(e[0], 3), round(e[1], 3), int(e[2])] for e in ev]
                except ImportError:
                    if 'basic' not in ' '.join(notes): notes.append('Basic Pitch not installed (pip install basic-pitch) — no notes from the stems')
            report.append(line)
    except Exception as e:
        notes.append(f'Demucs not run ({e}); pip install demucs for stems')

if notes:
    report += ['', '## Skipped'] + [f'- {n}' for n in notes]
json.dump(data, open(os.path.join(out, 'analysis.json'), 'w'), indent=1)
open(os.path.join(out, 'analysis.md'), 'w', encoding='utf8').write('\n'.join(report) + '\n')
print('\n'.join(report))
