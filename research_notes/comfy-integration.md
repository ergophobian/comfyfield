# Comfy Router and Cloud

Issue #49 adds the Comfy platform path without making live generations during development.

In Connections, choose Local or Comfy Cloud. Local keeps the existing ComfyUI HTTP API and URL. Cloud runs bundled API graphs through `@comfyorg/sdk` and stores downloaded results under local `/media/` URLs. Cloud requires an eligible subscription, sufficient credits and the workflow's models/nodes. The SDK honors `COMFY_BASE_URL` if explicitly set; leave it unset for Comfy Cloud.

A saved Comfy API key also exposes Flux 2 Pro and Seedance 2.5 through Router in the model picker. Router uses the same key in either workflow mode. These are the two composer mappings implemented here. `listComfyRouterModels({ limit, cursor })` returns the native paginated catalog, and `runComfyRouter({ model, input, idempotencyKey })` accepts a model's native input and returns normalized image/video/audio files. The HTTP equivalents are `GET /api/comfy/router/models`, `POST /api/comfy/router` and `POST /api/comfy/run` (`{ workflow, vars }`). Keys stay in the server core.

Router submits once with an Idempotency-Key, honors Retry-After on submit/poll/result responses, checks completed requests for error_type, and collects the native result. It does not automatically resubmit an ambiguous failure. An explicit idempotencyKey can be reused by an API caller; Router replays the original queued request under that key. Cloud's SDK handles its own different single-use submission contract. Neither runner retries a new generation after a timeout.

## Workflow contracts for the format runner lane

- `ltx_i2v`: `{ image, prompt, width, height, frames, seed }`. LTX Video 2B v0.9.5, T5 XXL, built-in LTX nodes, CreateVideo and SaveVideo. Dimensions must be multiples of 32 and frames must be 8n + 1. This builds on the existing LTX 2B graph; it does not claim to be LTX 2.5.
- `h3_open_i2v`: `{ image, prompt, width, height, frames, seed }`. The open-weights MiniMax H3 fl2va graph (`MiniMaxH3ImageToVideo`, turbo LoRA, 8 steps), with the start frame center-cropped to the canvas. It replaced `h3_i2v`, the paid partner node `MinimaxHailuo03FirstLastFrameNode`, which #123 removed.
- `image` accepts an app `/media/` URL, a base64 data URI or an HTTP image URL. The runner uploads it into Local ComfyUI or binds it to the Cloud SDK's LoadImage asset input. CLI `generate` also accepts a local path.
- Format registration/readiness and format execution are owned by #46. This lane supplies the workflow names and variable contracts; it leaves `readyWorkflows` to that lane.

Run `node scripts/comfy-format-check.mjs` to validate both graphs' placeholders, links and key node contracts. This is separate from #46's broader format-check inventory to avoid an overlapping file. It validates graph structure, not server model availability or rendered quality.

## Validation and later live test

Offline checks (no provider keys read and all network calls mocked):

```sh
node scripts/comfy-checks.mjs
node scripts/comfy-format-check.mjs
npx vite build
node scripts/flow-checks.mjs
node scripts/theme-check.mjs
```

When Kyle's key and a live-generation budget are available, configure `COMFY_API_KEY` and run one of these commands. These commands were not executed for #49:

```sh
node scripts/comfy-live.mjs models
node scripts/comfy-live.mjs router --allow-paid
# With COMFY_MODE=cloud and a start image at least 256px in each dimension:
node scripts/comfy-live.mjs cloud ./start.png --allow-paid
# On Local or Cloud, with LTX checkpoint and T5 installed:
node scripts/comfy-live.mjs ltx ./start.png --allow-paid
```

Actual provider execution, Cloud's installed model/node versions, generated quality and billing remain unverified until the needs-keys follow-up. No live API spend was incurred.

Headless Chrome UI checks exercised mode switching, save/refresh, keyed Router visibility, the H3 required-image gate, and a 390px viewport with no horizontal overflow or page errors. These screenshots use a fake Comfy connection and mocked provider requests:

- [Desktop Connections](screenshots/issue-49/connections-desktop.png)
- [390px Connections](screenshots/issue-49/connections-mobile.png)
- [Router in the picker](screenshots/issue-49/router-picker.png)

## Primary references

- [Router quickstart](https://docs.comfy.org/development/comfy-router/quickstart)
- [Router queue contract](https://docs.comfy.org/development/comfy-router/queue)
- [Router catalog and pagination](https://docs.comfy.org/development/comfy-router/discover-models)
- [Cloud SDK guide](https://docs.comfy.org/development/api-development/sdks)
- [Cloud read-only connection check](https://docs.comfy.org/api-reference/cloud/user/get-current-user-information)
- [LTX node definitions](https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_extras/nodes_lt.py)
- [H3 partner node definitions](https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_minimax.py)
