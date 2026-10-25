# Cinema on LTX-2.5

Cinema studio turns one idea into a short multi-shot scene. LTX-2.5 is its video engine, and it runs on Comfy Cloud with your Comfy key. You do not need a GPU or a Pod.

## The workflow

1. **Idea.** Open **Cinema studio** (Video). Write an idea, or press **Try the portal effect** to load a built-in example at no cost.
2. **Shot plan.** **Plan shots** sends the idea to the prompt writer (Comfy Router or Google, from Connections). It returns 2 to 6 shots. Each shot has a prompt, one camera move, a duration of 5, 8 or 10 seconds, and continuity notes that repeat the subject, wardrobe, place, light and screen direction. You can edit every field, and add a start frame to any shot.
3. **Estimate.** The plan shows the cost of the whole scene before anything renders: about $0.08 per 5-second clip on Comfy Cloud. Planning and retries are extra.
4. **Generate scene.** ComfyField saves the plan as a Flow and renders every shot with LTX-2.5:
   - a shot with no start frame runs `public/workflows/ltx25_t2v.json` (text to video, with sound)
   - a shot with a start frame runs `public/workflows/ltx25_i2v.json` (image to video)
   - the shot prompt is the plan's prompt, then `Camera: <move>` and `Continuity: <notes>`
5. **Review.** Each shot goes into its own Approve gate. **Approve and Send** passes that shot to the scene. **Rerun shot** replaces only that shot; the other shots and their approvals stay.
6. **Stitch.** The approved clips meet in a Stitch node. Order, trim and caption them, add music, then **Preview**. Stitch runs locally with ffmpeg and makes no paid calls. **Export to Library** saves the preview to Library > Generations.

The scene is a normal Flow. **Open saved Flow** shows the same nodes on the Flows canvas, and agents can read it through the MCP flow tools (see [flows-mcp.md](flows-mcp.md)).

## Where LTX-2.5 runs

LTX-2.5 runs on Comfy Cloud by default. Every file it loads is on Comfy Cloud, so a Comfy key on a paid plan is enough.

- With **Instant**, LTX-2.5 always runs on Comfy Cloud.
- With no run type set, LTX-2.5 runs on Comfy Cloud. If a Pod is ready and has enough memory, the run uses that Pod instead.
- With **Session**, LTX-2.5 runs on your Pod. The Pod needs a 32 GB GPU and downloads the files from `shared/modelFiles.js` on its first run, each checked against its sha256.

## The LTX-2.5 graph

Both graphs use the distilled 22B LTX-2.5 transformer (int8), the Gemma text encoder for LTX-2.5, and the LTX-2.5 video and audio VAEs. They render in two passes:

1. A first pass samples video and audio latents together at half size, in 8 steps.
2. A latent upscaler doubles the size, and a second pass refines it in 3 steps.
3. The graph decodes the video with tiles, decodes the audio, and saves an H.264 MP4 at 24 fps.

ComfyField fills these placeholders for each shot:

| Placeholder | Value |
| --- | --- |
| `{{prompt}}` | The shot prompt with its camera move and continuity notes |
| `{{width}}`, `{{height}}` | 1280 x 704 for 16:9 (Cinema scenes are 16:9) |
| `{{frames}}` | Duration x 24 + 1, so 121 frames for 5 seconds |
| `{{seed}}` | A new random seed per take |
| `{{image}}` | The start frame, `ltx25_i2v` only |

## The Cinema shot format

The **Cinema shot** format makes one shot with camera, lens, focal length, aperture, movement, shot size and look. Its model choice is LTX-2.5 by default, on the same two graphs. MiniMax H3 and Wan 2.2 stay as options.

## Code

- `src/lib/cinema.js`: the planner instructions, plan checks, the cost estimate, and `cinemaFlow()`, which builds the scene Flow on the `comfy-ltx25` model
- `src/components/studio/CinemaScene.jsx`: the idea, plan, render, review and stitch screens
- `src/lib/formats/motion.js`: the `cinema-shot` format
- `src/lib/catalog.js`: the `comfy-ltx25` model, its durations and sizes
- `shared/modelFiles.js`: the LTX-2.5 files a Pod downloads

## Checks

`node scripts/cinema-checks.mjs` checks the plan rules, the scene Flow, the text-to-video and image-to-video inputs, the gates, Rerun and Stitch. It also checks that LTX-2.5 is the default and that a Comfy key routes it to Comfy Cloud. `node scripts/cinema-ui-check.mjs` runs the whole journey in a browser at 1440px and 390px. Both checks use fake renders and make no paid calls.
