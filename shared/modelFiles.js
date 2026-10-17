// Model files a Pod can download, by the filename a workflow's loader node names. A workflow lists
// nothing itself: its graph is the source of truth, and this list says where each file comes from.
// Public Hugging Face repos only; sizes and sha256 from the Hugging Face API on 2026-10-17. The Pod
// checks each download against its sha256, so a mirror can only deliver the original bytes.
// `cloud` marks files Comfy Cloud already has (its model listing, 2026-10-16/17), so a run can go there at once.
// `vramGb` is the GPU the Pod needs for the model; on the Pod's ComfyUI v0.33.1, MiniMax H3 needs 96 GB
// because the fixes for offloading it to a smaller card came later.
export const MODEL_FILES = {
  'flux1-dev-fp8.safetensors': { repo: 'Comfy-Org/flux1-dev', path: 'flux1-dev-fp8.safetensors', dir: 'checkpoints', gb: 17.25, vramGb: 24, cloud: true,
    sha256: '8e91b68084b53a7fc44ed2a3756d821e355ac1a7b6fe29be760c1db532f3d88a' },
  'flux1-schnell-fp8.safetensors': { repo: 'Comfy-Org/flux1-schnell', path: 'flux1-schnell-fp8.safetensors', dir: 'checkpoints', gb: 17.24, vramGb: 24, cloud: true,
    sha256: 'ead426278b49030e9da5df862994f25ce94ab2ee4df38b556ddddb3db093bf72' },
  'sd_xl_base_1.0.safetensors': { repo: 'stabilityai/stable-diffusion-xl-base-1.0', path: 'sd_xl_base_1.0.safetensors', dir: 'checkpoints', gb: 6.94, vramGb: 12, cloud: true,
    sha256: '31e35c80fc4829d14f90153f4c74cd59c90b779f6afe05a74cd6120b893f7e5b' },
  'ltx-video-2b-v0.9.5.safetensors': { repo: 'Lightricks/LTX-Video', path: 'ltx-video-2b-v0.9.5.safetensors', dir: 'checkpoints', gb: 6.34, vramGb: 16, cloud: true,
    sha256: '720d15c9f19f7d0f6b2a92bbbc34410e2cfb2f6856a100b38f734fbf973d4adf' },
  't5xxl_fp16.safetensors': { repo: 'comfyanonymous/flux_text_encoders', path: 't5xxl_fp16.safetensors', dir: 'text_encoders', gb: 9.79, vramGb: 0, cloud: true,
    sha256: '6e480b09fae049a72d2a8c5fbccb8d3e92febeb233bbe9dfe7256958a9167635' },
  // LTX-2.5: the official Lightricks/LTX-2.5 is gated, so these come from ungated mirrors whose
  // sha256 matches the official files exactly.
  'ltx-2.5-22b-distilled-transformer-comfy-int8-convrot.safetensors': { repo: 'comfyicu/LTX-2.5', path: 'diffusion_models/ltx-2.5-22b-distilled-transformer-comfy-int8-convrot.safetensors', dir: 'diffusion_models', gb: 21.50, vramGb: 32, cloud: true,
    sha256: 'c4279eeff115cbeaca494bd2183e7d768c38fe85a184dc6afbb7159157c44334' },
  'gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors': { repo: 'PulpCut/LTX-2.5-INT8-ConvRot-safetensors', path: 'text_encoders/gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors', dir: 'text_encoders', gb: 15.37, vramGb: 0, cloud: true,
    sha256: '6ce688a0aa98a5fa36a9f1e6c3f42152a498cc2b53ee8c15674c64244f91487f' },
  'ltx-2.5-video-vae-bf16.safetensors': { repo: 'comfyicu/LTX-2.5', path: 'vae/ltx-2.5-video-vae-bf16.safetensors', dir: 'vae', gb: 1.47, vramGb: 0, cloud: true,
    sha256: '847e14ca7f3355debca0cea4eaa24ac0fbcdf0061da054ac89ca638a869ddba3' },
  'ltx-2.5-audio-vae-bf16.safetensors': { repo: 'comfyicu/LTX-2.5', path: 'vae/ltx-2.5-audio-vae-bf16.safetensors', dir: 'vae', gb: 0.36, vramGb: 0, cloud: true,
    sha256: 'c52733d37f6a7fb7949c3dc0fb468c6cb2169e4d836983a73babb9f0d54837a5' },
  'ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors': { repo: 'comfyicu/LTX-2.5', path: 'latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors', dir: 'latent_upscale_models', gb: 1.00, vramGb: 0, cloud: true,
    sha256: 'eb5a71fe4068ee87ccdb1c3aa635e547ca76bd2d30ae20ae889f2c325c0677e8' },
  // MiniMax H3 open weights, repackaged by Comfy-Org (ungated).
  'minimax_h3_fl2va_pruned_int8_convrot.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors', dir: 'diffusion_models', gb: 20.97, vramGb: 96, cloud: true,
    sha256: 'e889202c41dafb67b10d67b97f0d8541508036a6090af23425a5c2615d03c47a' },
  'minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'loras/minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors', dir: 'loras', gb: 1.96, vramGb: 0, cloud: true,
    sha256: '2339acdf19bfe123f46b971ea35d367a84adb85de43627e1eceafa5a5b2b111e' },
  'qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors', dir: 'text_encoders', gb: 15.69, vramGb: 0, cloud: true,
    sha256: '35a88d51044231fe332301d7a62aa81e3f2cba62febeb446e2c1e3e0ef76f2c6' },
  'minimax_h3_video_vae_fp16.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'vae/minimax_h3_video_vae_fp16.safetensors', dir: 'vae', gb: 5.21, vramGb: 0, cloud: true,
    sha256: '7c1f131492e7eddacaac9069a61b81bdd39de5cc96561e677c5eab1cdce5e522' },
  'minimax_h3_audio_vae_fp32.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'vae/minimax_h3_audio_vae_fp32.safetensors', dir: 'vae', gb: 0.61, vramGb: 0, cloud: true,
    sha256: '8e505d95dd1561d47abd43d4238fd40d9bb1ae9e147ed0a4cba778d76ae4db48' },
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
