# ComfyField

One idea. A finished scene.

ComfyField is an open-source creative studio for images, video and audio. It runs on your computer, with your own keys, on the Comfy Developer Platform. Built for [Open Source Higgsfield](https://comfy.org/open-source-higgsfield).

**Site:** https://comfyfield.com

[![The folded alley: a courier in a silver raincoat watches a violet portal fold an alley open onto a sunlit ocean](site/assets/scene.jpg)](https://comfyfield.com)

<!-- DEMO VIDEO -->
Demo video: link coming with the submission.

## Cinema

Cinema turns one idea into a short scene you can edit.

1. **Idea.** Open **Cinema studio** and write an idea, or press **Try the portal effect** to load the built-in example for free.
2. **Plan.** **Plan shots** returns 2 to 6 shots. Each has a prompt, a camera move, a length of 5, 8 or 10 seconds, and continuity notes. Edit any field, add a start frame to any shot, and see the cost of the whole scene before anything renders.
3. **Render.** **Generate scene** renders every shot with LTX-2.5 on Comfy Cloud, sound included.
4. **Review.** **Approve and Send** passes a shot to the scene. **Rerun shot** replaces only that shot; the others keep their approval.
5. **Stitch.** The approved clips join on your machine with ffmpeg. Order, trim and caption them, add music, preview, then export the MP4.

Every scene is saved as a Flow, so you can open it on the canvas and agents can edit it through MCP. Details: [Cinema on LTX-2.5](docs/cinema-ltx.md).

The scene above, shot by shot. Real LTX-2.5 renders on Comfy Cloud:

| Shot 1 | Shot 2 | Shot 3 |
| --- | --- | --- |
| [![Shot 1: the courier stops as a violet ring of sparks traces itself on the wet street](site/assets/shot1.jpg)](site/assets/shot1.mp4) | [![Shot 2: the portal glows while the alley bends upward around the courier](site/assets/shot2.jpg)](site/assets/shot2.mp4) | [![Shot 3: the courier walks toward a portal that opens onto a bright ocean](site/assets/shot3.jpg)](site/assets/shot3.mp4) |
| Slow dolly toward the ring | Low orbit around the forming portal | Track right behind the courier |

## What it does

- **Create** images, video and audio from one composer. Pick any connected model, add references, run one prompt or a batch.
- **Flows** chain prompts, models, Writer nodes and Stitch on a canvas. Approve gates hold each step until you press Send. Agents build and edit the same flows through MCP, and you watch their cursor move node to node.
- **Library** (Assets) keeps every generation next to the characters, products, brand kits and voices you reuse across tools.
- **Studios and formats.** Apps, effects and presets are plain data that run through the same engine and land in the same Library.
- **Motion transfer** (Wan Animate 2) and **character swap** (SCAIL-2) render a short draft first. Approve it and the final runs.
- **Stitch** joins clips locally with trims, captions and music, at no cost. See [Stitch](docs/stitch.md).

Multi-part runs, such as long speech or long video, show "not available yet". Use one segment or a short script per run.

## Quick start

You need Git and [Node.js 22 or newer](https://nodejs.org/en/download).

```sh
git clone https://github.com/ergophobian/comfyfield.git
cd comfyfield
npm install
npm run dev
```

Open the address the terminal prints (usually http://localhost:5173). Get a Comfy key from [platform.comfy.org](https://platform.comfy.org/profile/api-keys), then open **Connections**, paste it into the **ComfyUI** card and choose **Save and test**.

Windows commands, data folders and fixes: [setup guide](docs/setup.md).

## How it uses Comfy

One Comfy key covers both paths. The app, CLI and MCP server share them through [server/core.js](server/core.js).

- **Comfy Router API v2.** `GET https://api.comfy.org/v2/models` lists hosted models. A run posts to `/v2/models/{provider}/{model}/requests` with `X-API-Key` and an `Idempotency-Key`, polls `/requests/{id}/status`, then fetches `/requests/{id}` for the result. [shared/mapping.js](shared/mapping.js) maps the composer's settings onto each model's inputs.
- **Comfy SDK on Comfy Cloud.** `@comfyorg/sdk` loads a bundled API-format workflow from [public/workflows](public/workflows) with `client.workflows.fromFile`, attaches uploads with `client.assets.fromBytes`, waits for the job and saves its outputs to the Library. The LTX-2.5 graphs behind Cinema run this way. The same runner can target your own RunPod Pod for long sessions.

Optional keys add fal, Google AI, ElevenLabs and RunPod.

## Agents and CLI

The MCP server and CLI use the keys saved in Connections. Point your agent at your clone:

```sh
claude mcp add comfyfield -- node /absolute/path/to/comfyfield/bin/comfyfield.js mcp
```

Other clients take the same command, `node /absolute/path/to/comfyfield/bin/comfyfield.js mcp`, in their MCP config.

- Generation: `list_models`, `get_model_schema`, `generate`, `write_prompts`, `balance`
- Stitch: `stitch`, `export_stitch`
- Flows: `list_flows`, `get_flow`, `create_flow`, `add_node`, `connect_nodes`, `update_node`, `remove_node`, `run_flow`
- Teamwork: `list_agents`, `assign_agent`, `my_tasks`

`run_flow` fills gaps and stops at every Approve gate; only you can press Send. See [Flows through MCP](docs/flows-mcp.md).

```sh
node bin/comfyfield.js models --kind video
node bin/comfyfield.js generate "a fox in fresh snow, dolly in" --model <id> --ratio 16:9 --out ./renders
node bin/comfyfield.js stitch /media/first.mp4 /media/second.mp4 --ratio 9:16 --out ./renders
node bin/comfyfield.js --help
```

The Stitch example uses files already uploaded or generated in the app. Replace the `/media/` paths with your Library file URLs, or use public HTTP(S) media URLs. Local filesystem paths are not accepted.

## Costs

Every run uses your own provider credits; ComfyField bills nothing. Prices in the app are estimates, and Cinema shows the cost of a whole scene before it renders. Connections has an optional spend cap that asks before a run takes this session past it. Pods have their own daily cap and idle shutdown on the Pods page.

## Docker

On a home server, `docker compose up -d` serves the studio at http://localhost:5173 with data in a named volume. See [Docker](docs/docker.md).

## Contributing

Read [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md) before you pick up an issue.

## License

[MIT](LICENSE). Third-party licenses for ffmpeg, model weights, node packs and provider logos are in [NOTICE.md](NOTICE.md).
