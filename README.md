# ComfyField

An open-source creative studio you run on your own machine. Make images, video and audio with any model, using your own keys.

- **ComfyUI**: local or hosted. Runs the open workflows in `public/workflows/`.
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

- `flux1-dev-fp8.safetensors` and `sd_xl_base_1.0.safetensors` in `models/checkpoints`
- `ltx-video-2b-v0.9.5.safetensors` in `models/checkpoints` and `t5xxl_fp16.safetensors` in `models/text_encoders`

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

Cursor and ChatGPT desktop take the same command: `npx comfyfield mcp`. Keys are read from `.comfyfield/keys.json` in `COMFYFIELD_HOME` (default: the working directory), then from `FAL_KEY`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `COMFY_URL` and `COMFY_API_KEY`.

Tools: `list_models`, `generate`, `get_model_schema`, `balance`, `write_prompts`. Any fal endpoint works as `fal:<endpoint>`.

Recipes and flows are not in this tree yet. TODO: add `list_recipes`, `run_recipe` and `run_flow` once `src/lib/recipes.js` and flows land.

CLI:

```bash
npx comfyfield models --kind video
npx comfyfield connect fal --key $FAL_KEY
npx comfyfield generate "a fox in fresh snow, dolly in" --model fal:fal-ai/kling-video/v3/pro/text-to-video --ratio 16:9 --duration 5 --out ./renders
npx comfyfield balance
npx comfyfield dev
```

`generate` spends your credits and prints an estimated cost first. Run `comfyfield --help` for every option.

## How it works

- `server/core.js` holds all provider logic: key storage, the fal queue, the fal catalog and schemas, Google, ElevenLabs and ComfyUI. `server/plugin.js` is thin HTTP wiring for the Vite dev server; `server/mcp.js` and `bin/comfyfield.js` reuse the same core.
- `shared/mapping.js` is the input mapping used by both the browser and the core.
- `shared/mapping.js` maps the composer's settings (aspect, count, duration) onto each fal model's own input schema, so new fal models work without code changes.
- `src/lib/catalog.js` lists pinned models, styles and providers. To add a ComfyUI tool, export a workflow with "Save (API)", swap in `{{prompt}}`, `{{seed}}`, `{{width}}` and `{{height}}`, and add an entry.

## License

MIT
