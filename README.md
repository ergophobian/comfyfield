# ComfyField

An open-source creative studio you run on your own machine. Make images, video and audio with any model, using your own keys.

- **ComfyUI**: the open workflows in `public/workflows/` run on Comfy Cloud with your Comfy key, or on your own RunPod Pod for long sessions. No GPU of your own is needed.
- **fal**: browse fal's catalog in the app and use any text-to-image, video, speech or music model with one key.
- **ElevenLabs**: voices and sound effects with your own key.

Entry for the [Open Source Higgsfield](https://comfy.org/open-source-higgsfield) competition.

## Run it

```bash
npm install
npm run dev
```

Open the local URL, go to **Connections**, and paste your keys. Keys are saved to `.comfyfield/keys.json` on your machine (gitignored) and only the local server reads them. You can use `.env` instead; see `.env.example`.

### ComfyUI models for the bundled workflows

Comfy Cloud already has the files most workflows load. A Pod downloads what a run needs on its first run, from `shared/modelFiles.js`, and checks each file against its sha256.

## Use from your agent

ComfyField ships an MCP server and a CLI that run on your own keys from Connections, so any agent can generate through it. Nothing is billed by ComfyField; you pay your providers directly.

```bash
claude mcp add comfyfield -- npx comfyfield mcp
```

Codex (`~/.codex/config.toml`):

```toml
[mcp_servers.comfyfield]
command = "npx"
args = ["comfyfield", "mcp"]
env = { COMFYFIELD_HOME = "/path/to/your/comfyfield" }
```

Cursor and ChatGPT desktop take the same command: `npx comfyfield mcp`. Keys are read from `.comfyfield/keys.json` in `COMFYFIELD_HOME` (default: the working directory), then from `FAL_KEY`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `COMFY_API_KEY` and `RUNPOD_API_KEY`.

Tools: `list_models`, `generate`, `get_model_schema`, `balance`, `write_prompts`, `stitch`, `export_stitch`. Any fal endpoint works as `fal:<endpoint>`.

Flow tools: `list_flows`, `get_flow`, `create_flow`, `add_node`, `connect_nodes`, `update_node`, `remove_node`, `run_flow`. Flows are saved in `.comfyfield/flows.json`, so the app shows what an agent builds (switch back to the tab to reload). `run_flow` fills gaps and stops at Approve gates; only you can press Send in Flows. See [docs/flows-mcp.md](docs/flows-mcp.md).

The Skills page (`/skills`) lists ready-made jobs to run from your agent, each with a prompt to copy. Their slash commands are not wired into the MCP server yet.

Recipes are not wired into the MCP server yet. TODO: add `list_recipes` and `run_recipe`.

CLI:

```bash
npx comfyfield models --kind video
npx comfyfield connect fal --key $FAL_KEY
npx comfyfield generate "a fox in fresh snow, dolly in" --model fal:fal-ai/kling-video/v3/pro/text-to-video --ratio 16:9 --duration 5 --out ./renders
npx comfyfield balance
npx comfyfield dev
```

`generate` spends your credits and prints an estimated cost first. Run `comfyfield --help` for every option.

## Stitch clips locally

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

Media, previews and the export index live under `.comfyfield/`. Intermediate render folders are retained under `.comfyfield/stitch/` for inspection; this version does not automatically clean them up. Validate offline with `node scripts/stitch-checks.mjs`, which generates synthetic clips and tests the core, CLI, MCP and HTTP paths. CI runs it on all three operating systems.

## How it works

- `server/core.js` holds all provider logic: key storage, the fal queue, the fal catalog and schemas, Google, ElevenLabs and ComfyUI. `server/plugin.js` is thin HTTP wiring for the Vite dev server; `server/mcp.js` and `bin/comfyfield.js` reuse the same core.
- `shared/mapping.js` is the input mapping used by both the browser and the core.
- `shared/mapping.js` maps the composer's settings (aspect, count, duration) onto each fal model's own input schema, so new fal models work without code changes.
- `src/lib/catalog.js` lists pinned models, styles and providers. To add a ComfyUI tool, export a workflow with "Save (API)", swap in `{{prompt}}`, `{{seed}}`, `{{width}}` and `{{height}}`, and add an entry.

## License

MIT
