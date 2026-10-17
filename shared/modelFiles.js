// Model files a Pod can download, by the filename a workflow's loader node names. A workflow lists
// nothing itself: its graph is the source of truth, and this list says where each file comes from.
// Public Hugging Face repos only; sizes checked on the Hugging Face API on 2026-10-17.
// `cloud` marks files Comfy Cloud already has (its model listing, 2026-10-16), so a run can go there at once.
export const MODEL_FILES = {
  'flux1-dev-fp8.safetensors': { repo: 'Comfy-Org/flux1-dev', path: 'flux1-dev-fp8.safetensors', dir: 'checkpoints', gb: 17.25, vramGb: 24, cloud: true },
  'flux1-schnell-fp8.safetensors': { repo: 'Comfy-Org/flux1-schnell', path: 'flux1-schnell-fp8.safetensors', dir: 'checkpoints', gb: 17.24, vramGb: 24, cloud: true },
  'sd_xl_base_1.0.safetensors': { repo: 'stabilityai/stable-diffusion-xl-base-1.0', path: 'sd_xl_base_1.0.safetensors', dir: 'checkpoints', gb: 6.94, vramGb: 12, cloud: true },
  'ltx-video-2b-v0.9.5.safetensors': { repo: 'Lightricks/LTX-Video', path: 'ltx-video-2b-v0.9.5.safetensors', dir: 'checkpoints', gb: 6.34, vramGb: 16, cloud: true },
  't5xxl_fp16.safetensors': { repo: 'comfyanonymous/flux_text_encoders', path: 't5xxl_fp16.safetensors', dir: 'text_encoders', gb: 9.79, vramGb: 0, cloud: true },
}

// Which input of which loader names a file, and the ComfyUI folder it loads from.
const LOADERS = {
  CheckpointLoaderSimple: { ckpt_name: 'checkpoints' },
  UNETLoader: { unet_name: 'diffusion_models' },
  VAELoader: { vae_name: 'vae' },
  CLIPLoader: { clip_name: 'text_encoders' },
  DualCLIPLoader: { clip_name1: 'text_encoders', clip_name2: 'text_encoders' },
  TripleCLIPLoader: { clip_name1: 'text_encoders', clip_name2: 'text_encoders', clip_name3: 'text_encoders' },
  LoraLoader: { lora_name: 'loras' },
  LoraLoaderModelOnly: { lora_name: 'loras' },
  UpscaleModelLoader: { model_name: 'upscale_models' },
  LatentUpscaleModelLoader: { model_name: 'latent_upscale_models' },
}

// Room on the volume for files later runs ask for, on top of the first run's.
const HEADROOM_GB = 30

// The files a filled API graph loads. Placeholders are skipped, so a template can be read before it is filled.
export function modelFilesOf(graph) {
  const out = new Map()
  for (const node of Object.values(graph || {})) {
    const inputs = LOADERS[node?.class_type]
    if (!inputs) continue
    for (const [input, dir] of Object.entries(inputs)) {
      const name = node.inputs?.[input]
      if (typeof name !== 'string' || name.includes('{{')) continue
      const f = MODEL_FILES[name]
      if (!f) throw Object.assign(new Error(`${name} is not in ComfyField's model list, so a Pod cannot download it.`), { status: 400 })
      if (f.dir !== dir) throw Object.assign(new Error(`${node.class_type} loads ${name} from ${dir}, but the model list keeps it in ${f.dir}.`), { status: 400 })
      out.set(`${dir}/${name}`, { ...f, name })
    }
  }
  return [...out.values()]
}

// Files a run needs that Comfy Cloud does not have.
export const notOnCloud = (files) => files.filter((f) => !f.cloud)

export const minVramOf = (files) => Math.max(0, ...files.map((f) => f.vramGb || 0))
export const volumeFor = (files) => Math.ceil(files.reduce((n, f) => n + f.gb, 0) + HEADROOM_GB)
