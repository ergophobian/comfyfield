# Long video chains run on the server

Status: planned; multi-part execution disabled pending durable retry checkpoints (2026-10-25). Issue #182.

Merge review for #209 found that a failure after a completed segment could resubmit and charge for earlier segments. Multi-segment clips, H3 extensions beyond 10 seconds and split speech now return `multipart_unavailable` before the first provider submission. Short single-part runs remain available. The design below describes the deferred path; it must not be re-enabled until completed outputs and provider job ids survive retries and restarts.

SCAIL-2 and Wan Animate 2 render at most 81 frames a run, and MiniMax H3 about 10 seconds. A longer video renders in segments, and the generation engine (`runChain` in `server/core.js`, plans in `shared/longVideo.js`) chains them: it cuts the clip by frame number with ffmpeg, runs the same graph once per segment with the segment before as `{{previous}}`, and joins the results in `server/stitch.js`. The graphs stay one segment long. The models' own continuation inputs (`previous_frames`, `continue_motion`, `h3_extend`'s guide frames) blend each seam, and SCAIL-2's 5 overlap frames also crossfade. The app, the CLI and MCP get the same chain from one `runComfy` call, and a format needs no new steps. We give up progress per segment in the UI: the run shows as one job until it ends.

## Considered options

- Unroll the segments inside one graph. Rejected: the segment count depends on the clip, ComfyUI has no loops without a node pack, and one prompt that runs for an hour has no retry point.
- Chain in the app as format steps. Rejected: format steps are fixed and the Flows engine passes only images between model nodes, so it needs engine changes and still cannot size the chain to the clip.
