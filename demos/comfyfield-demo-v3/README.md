# ComfyField demo v3

The 33 s hand-drawn ComfyField demo, synced to the owner's song (`assets/song.mp3`). Made in code with the
`hand-drawn-video` skill (`skills/hand-drawn-video/`). Two cuts share the same picture and code; only the way the
song was measured differs:

- **A (volume)**: a hit wherever the volume jumps. `index-A.html`, `song-A.js`.
- **B (notes)**: a hit per note, with its MIDI pitch. `index-B.html`, `song-B.js`.

The finished videos are in `video/`: `comfyfield-demo-v3-A-volume.mp4` and `comfyfield-demo-v3-B-notes.mp4`.

To re-render, install the engine once (`npm install` in `skills/hand-drawn-video/engine/`) and follow
`skills/hand-drawn-video/SKILL.md`. `BRIEF-v3.md` describes the song sync, and `review/` holds the judges' notes
from each round.
