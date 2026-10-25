# Long video chains run on the server

Status: accepted (2026-10-25). Issue #182.

SCAIL-2 and Wan Animate 2 render at most 81 frames a run, and MiniMax H3 about 10 seconds. A longer video renders in segments, and the generation engine (`runChain` in `server/core.js`, plans in `shared/longVideo.js`) chains them: it cuts the clip by frame number with ffmpeg, runs the same graph once per segment with the segment before as `{{previous}}`, and joins the results in `server/stitch.js`. The graphs stay one segment long. The models' own continuation inputs (`previous_frames`, `continue_motion`, `h3_extend`'s guide frames) blend each seam, and SCAIL-2's 5 overlap frames also crossfade. The app, the CLI and MCP get the same chain from one `runComfy` call, and a format needs no new steps. We give up progress per segment in the UI: the run shows as one job until it ends.

## Considered options

- Unroll the segments inside one graph. Rejected: the segment count depends on the clip, ComfyUI has no loops without a node pack, and one prompt that runs for an hour has no retry point.
- Chain in the app as format steps. Rejected: format steps are fixed and the Flows engine passes only images between model nodes, so it needs engine changes and still cannot size the chain to the clip.
