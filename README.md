# ComfyField

An open-source, Higgsfield-style creative suite built on ComfyUI. Every tool in the app (image, video, effects and cinema camera moves) runs an API-format ComfyUI workflow from `public/workflows/`.

Entry for the [Open Source Higgsfield](https://comfy.org/open-source-higgsfield) competition.

## Run locally

1. Start ComfyUI (default `http://127.0.0.1:8188`) with these models installed:
   - `flux1-dev-fp8.safetensors` in `models/checkpoints` (FLUX image)
   - `sd_xl_base_1.0.safetensors` in `models/checkpoints` (SDXL image)
   - `ltx-video-2b-v0.9.5.safetensors` in `models/checkpoints` and `t5xxl_fp16.safetensors` in `models/text_encoders` (LTX video)
2. Copy `.env.example` to `.env` and point `COMFY_URL` at your ComfyUI, or at a hosted endpoint with `COMFY_API_KEY`.
3. Run the app:

```bash
npm install
npm run dev
```

The dev server proxies `/comfy/*` to `COMFY_URL`, so API keys never reach the browser.

## How it works

- `src/lib/comfy.js` fills `{{placeholders}}` in a workflow, queues it with `POST /prompt`, polls `/history/{id}` and shows the outputs from `/view`.
- `src/lib/catalog.js` holds models, effects and camera moves. An effect or camera move appends its prompt fragment to yours.
- To add a tool, export a workflow from ComfyUI with "Save (API)", swap in placeholders such as `{{prompt}}`, `{{seed}}`, `{{width}}` and `{{height}}`, and register it in the catalog.

## License

MIT
