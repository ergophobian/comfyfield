# ComfyField

Make images, video and audio in one local-first, open-source studio with your own keys.

ComfyField runs the studio on your computer and sends generation jobs to connected providers. Start with Comfy Cloud and Comfy Router. Use one composer, save results in the Library, and connect steps in Flows. Cloud generation needs no GPU on your computer.

Built for Open Source Higgsfield using the Comfy Developer Platform.

![The real app: Explore, Create image and a starter flow](docs/screenshots/readme/hero.gif)

This interface recording and the screenshots below were captured from the real app without keys. They show setup and editing, not completed generations. They predate some current controls.

**TODO: Add the recorded demo video link before submission.**

## Quick start

1. Install Node.js 22 or newer and Git.
2. Clone the project:
   ```sh
   git clone https://github.com/ergophobian/comfyfield.git
   cd comfyfield
   ```
3. Install and start the studio:
   ```sh
   npm install
   npm run dev
   ```
4. Open the local address printed in the terminal. Get a Comfy key from [Comfy Platform](https://platform.comfy.org/profile/api-keys).
5. Open **Connections**, paste the key into the **ComfyUI** card, and choose **Save and test**. Open **Image**, pick an available Comfy model, enter a prompt and generate. Your Comfy account must have the access and credits the selected model requires.

You can browse without a key. Generating spends provider credits. Keep the local server running while using the studio. See [setup](docs/setup.md) for data paths, Windows commands and troubleshooting. `npm start` also provides an install/build launcher from a clone.

## What it does

- Generate images, video and audio through connected providers, with reference inputs where the model supports them.
- Run batches of prompts from the composer and open them as a flow.
- Chain prompts, models, editable Writer output and Approve gates in Flows.
- Keep generations and reusable characters, products, brand kits and voices in the Library.
- Join clips locally with ffmpeg, including trims, captions and music. See [Stitch](docs/stitch.md).
- Let agents use the same provider code through the command line and the model context protocol (MCP) server.

Available tools depend on the selected model, provider access and workflow requirements. Some pages and controls are still marked “Not wired yet”; a catalog entry is not proof of a successful live render.

### Create and batch

![Create image with an editable prompt, before generation](docs/screenshots/readme/create.webp)

![Batch composer with three prompts, before generation](docs/screenshots/readme/batch.webp)

### Flows and Library

![Image then animate starter flow with an Approve gate, before execution](docs/screenshots/readme/flows.webp)

![Library in its empty state, without generated media](docs/screenshots/readme/library.webp)

## Providers

Start with a Comfy key for **Comfy Cloud** workflows and **Comfy Router** hosted models. Optional connections use separate keys: **fal** for hosted media models, **Google AI** for media generation and prompt writing, **ElevenLabs** for speech and sound effects, and **RunPod** for a rented ComfyUI session. Provider logic lives in [server/core.js](server/core.js).

**Instant** uses Cloud workflow variants where available. **Session** uses a Pod. Model files and node requirements determine where a workflow can run; some Instant variants use a different model than the Session version. Check the model notes before generating.

## How it uses Comfy

The app, command line and agent server share these paths:

- **Comfy Router, API v2:** `GET https://api.comfy.org/v2/models` discovers models. Generation posts to `/v2/models/{provider}/{model}/requests` with `X-API-Key` and an `Idempotency-Key`. The server polls `/requests/{request_id}/status` and fetches `/requests/{request_id}` for results. Router media inputs are prepared by the shared mapping and upload code.
- **Comfy SDK on Cloud:** `@comfyorg/sdk` loads bundled API-format workflows with `client.workflows.fromFile`, binds media using `client.assets.fromBytes`, submits/runs the workflow, waits for completion and downloads output assets. Workflow templates live in [public/workflows](public/workflows).
- **Comfy SDK on a Pod:** the same workflow runner can target rented ComfyUI through the Pod proxy. RunPod compute is billed separately; partner nodes may also use Comfy credits.

These are implemented integration paths. Workflow availability, provider pricing and successful live output depend on the connected account and service; this README update did not run paid generations.

## Flows and agents

**Run** fills gaps. Model nodes with output run again only through **Rerun** or **Regenerate all**. Approve gates and Writer review wait for the user to press **Send**. Agent `run_flow` also stops at those review points.

Point an agent's MCP configuration at the source checkout:

```json
{
  "mcpServers": {
    "comfyfield": {
      "command": "node",
      "args": ["/absolute/path/to/comfyfield/bin/comfyfield.js", "mcp"]
    }
  }
}
```

Tools include model discovery, generation, prompt writing, stitching, and creating, editing and running saved flows. See [Flows through MCP](docs/flows-mcp.md). Agents use the connections saved on this machine. Generation tools spend credits.

![Skills page showing agent connection setup](docs/screenshots/readme/skills.webp)

The capture shows the Skills interface. Use the source configuration above; package-based setup requires a published npm package.

For the command line:

```sh
node bin/comfyfield.js models --kind video
node bin/comfyfield.js --help
```

## Costs and spend cap

ComfyField uses your provider accounts and keys. Generation costs depend on the provider and model; displayed prices are estimates.

Connections offers an optional session spend cap. It counts estimated costs for runs started in the current browser tab and asks before exceeding the cap. You can approve an over-cap run. Unknown prices pass without counting. This is not a provider billing limit and does not cover independent command-line or agent runs. Pod sessions have a separate daily cap and idle shutdown in the Pod manager; storage and partner-node charges can be separate.

## Docker

From the clone:

```sh
docker compose up -d
```

Open `http://localhost:5173`. Compose binds to loopback and keeps data in the `comfyfield-data` volume. Add connections in the app. See [Docker setup](docs/docker.md) for storage, updates and remote access through a tunnel.

## Contributing

Read [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md). They cover design, issue ownership and required checks. Keep keys and local data out of commits.

## License and credits

ComfyField is [MIT licensed](LICENSE). Providers and model weights have their own terms. ffmpeg and its optional binary package have separate licenses; see [third-party notices](NOTICE.md). The bundled caption font uses the [SIL Open Font License](server/fonts/OFL.txt).

Built with ComfyUI, Comfy Cloud, Comfy Router and the Comfy SDK; React, React Flow, Vite and ffmpeg. Higgsfield informs the product structure; ComfyField uses its own theme, copy and media. Flows follows PatchWork's Approve, Send and Run rules.
