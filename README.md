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

## How it works

- `server/plugin.js` is the local API, running inside the Vite dev server: key storage, the fal queue, the fal catalog and schemas, ElevenLabs, and a ComfyUI proxy.
- `src/lib/providers.js` maps the composer's settings (aspect, count, duration) onto each fal model's own input schema, so new fal models work without code changes.
- `src/lib/catalog.js` lists pinned models, styles and providers. To add a ComfyUI tool, export a workflow with "Save (API)", swap in `{{prompt}}`, `{{seed}}`, `{{width}}` and `{{height}}`, and add an entry.

## License

MIT
