# Stitch clips locally

Stitch joins video clips on your machine with ffmpeg. It makes no paid calls.

## In the app

In **Flows**, add a **Stitch** node. Connect video results (through an Approve node if you want to choose takes), upload clips, or select videos from the Library. Select Stitch to change clip order, trim start and end in seconds, and add text to burn into each clip. Music loops to fill the joined video; volume and fade apply to the music while clip audio stays intact.

Choose 16:9, 9:16, 1:1 or 4:5. **Preview** renders a playable video. **Export to Assets** saves that exact preview to the Library and enables **Download video**. After changing settings, render again before exporting. Run fills gaps; use **Render again** to replace an existing preview.

Cinema uses the same Stitch node for its approved shots (see [Cinema on LTX-2.5](cinema-ltx.md)).

## Core, MCP and CLI

The same operation works through `core.stitch()`, the `stitch` MCP tool, and the CLI:

```bash
node bin/comfyfield.js stitch first.mp4 second.mp4 --ratio 9:16 --music music.wav --volume 0.25 --fade 1 --out ./renders
node bin/comfyfield.js stitch --spec stitch.json --preview --json
```

`stitch.json` uses this shape (end is an absolute time within the source clip):

```json
{
  "clips": [
    { "url": "first.mp4", "start": 0.5, "end": 3, "caption": "The first shot" },
    { "url": "second.mp4", "caption": "The next shot" }
  ],
  "aspect": "16:9",
  "music": { "url": "music.wav", "volume": 0.25, "fade": 1 }
}
```

Core, CLI and MCP accept local paths, saved `/media/` URLs, or downloadable HTTP(S) media. CLI relative paths resolve from the current working directory. By default CLI and MCP export to the Library; `preview: true` (`--preview` in the CLI) keeps the render as a preview. The MCP `export_stitch` tool promotes a preview by its returned URL without rendering again. Exported videos load into the app's Library on reload.

## Output and limits

- System ffmpeg is preferred; `ffmpeg-static` supplies the fallback for macOS, Windows and Linux.
- Captions use libass and a bundled Noto Sans font under the [SIL Open Font License](../server/fonts/OFL.txt). Brace and backslash characters in captions use full-width equivalents, so they stay literal rather than becoming subtitle commands.
- Output is H.264/AAC at 30 fps, letterboxed to preserve framing.
- Uploads allow 40 MB per file, and a stitch accepts up to 50 clips.
- Volume ranges from 0 to 2 (1 is the original music level). Fades are clamped to half the output duration.

## Files

Media, previews and the export index live under `.comfyfield/`. Intermediate render folders stay under `.comfyfield/stitch/` for inspection; they are not cleaned up automatically.

## Checks

`node scripts/stitch-checks.mjs` generates synthetic clips and tests the core, CLI, MCP and HTTP paths offline. CI runs it on all three operating systems.
