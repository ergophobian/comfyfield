# Stitch clips locally

In **Flows**, add a **Stitch** node. Connect video results (through an Approve node if you want to choose takes), upload clips, or select videos from the Library. Select Stitch to change clip order, trim start/end in seconds, and add text to burn into each clip. Music loops to fill the joined video; volume and fade apply to the music while clip audio stays intact.

Choose 16:9, 9:16, 1:1 or 4:5. **Preview** renders a playable video. **Export to Library** saves that exact preview and enables download. After changing settings, render again before exporting. Run fills gaps; use Render again to replace an existing preview. All processing is local and makes no paid calls.

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

Core, CLI and MCP accept local paths, saved `/media/` URLs, or downloadable HTTP(S) media. CLI relative paths resolve from the current working directory. By default CLI/MCP export to the Library; `preview: true` (`--preview` in CLI) keeps the render as a preview. The MCP `export_stitch` tool promotes a preview by its returned URL without rendering again. Exported videos load into the app's Library on reload.

System ffmpeg is preferred; `ffmpeg-static` supplies the fallback for macOS, Windows and Linux. Captions use libass and a bundled Noto Sans font under the SIL Open Font License. Output is H.264/AAC at 30 fps with letterboxing to preserve framing. Uploads allow 40 MB per file and a stitch accepts up to 50 clips. Volume ranges from 0 to 2 (1 is the original music level). Fades are clamped to half the output duration. Caption brace and backslash characters use full-width equivalents to keep them literal rather than subtitle commands.

Media, previews and the export index live in the data folder (see [setup](setup.md#first-run-and-data)). Intermediate render folders are retained under `stitch/` in that folder for inspection; this version does not automatically clean them up. Validate offline with `node scripts/stitch-checks.mjs`, which generates synthetic clips and tests the core, CLI, MCP and HTTP paths. CI runs it on all three operating systems.

See [third-party notices](../NOTICE.md) for the ffmpeg license terms.
