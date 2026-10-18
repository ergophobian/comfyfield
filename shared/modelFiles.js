// Model files a Pod can download, by the filename a workflow's loader node names. A workflow lists
// nothing itself: its graph is the source of truth, and this list says where each file comes from.
// Public Hugging Face repos only; sizes and sha256 from the Hugging Face API on 2026-10-17. The Pod
// checks each download against its sha256, so a mirror can only deliver the original bytes.
// `cloud` marks files Comfy Cloud already has (its model listing, 2026-10-16/17), so a run can go there at once.
// `vramGb` is the GPU the Pod needs for the model, with ComfyUI offloading what does not fit.
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
  'minimax_h3_fl2va_pruned_int8_convrot.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors', dir: 'diffusion_models', gb: 20.97, vramGb: 32, cloud: true,
    sha256: 'e889202c41dafb67b10d67b97f0d8541508036a6090af23425a5c2615d03c47a' },
  'minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'loras/minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors', dir: 'loras', gb: 1.96, vramGb: 0, cloud: true,
    sha256: '2339acdf19bfe123f46b971ea35d367a84adb85de43627e1eceafa5a5b2b111e' },
  'qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors', dir: 'text_encoders', gb: 15.69, vramGb: 0, cloud: true,
    sha256: '35a88d51044231fe332301d7a62aa81e3f2cba62febeb446e2c1e3e0ef76f2c6' },
  'minimax_h3_video_vae_fp16.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'vae/minimax_h3_video_vae_fp16.safetensors', dir: 'vae', gb: 5.21, vramGb: 0, cloud: true,
    sha256: '7c1f131492e7eddacaac9069a61b81bdd39de5cc96561e677c5eab1cdce5e522' },
  'minimax_h3_audio_vae_fp32.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'vae/minimax_h3_audio_vae_fp32.safetensors', dir: 'vae', gb: 0.61, vramGb: 0, cloud: true,
    sha256: '8e505d95dd1561d47abd43d4238fd40d9bb1ae9e147ed0a4cba778d76ae4db48' },
  // FLUX 3 Image Klein (distilled, with BFL's prompt upsampler). Comfy Cloud has only the text encoder
  // and the VAE, so it runs on a Pod. The official black-forest-labs repo is gated; these copies have
  // its exact sha256. The FLUX Kommunity License still applies to the weights.
  'flux3-image-klein-bf16.safetensors': { repo: 'unsloth/flux-3-image-klein', path: 'model.safetensors', dir: 'diffusion_models', gb: 11.1, vramGb: 24, cloud: false,
    sha256: 'c3e9813cdd049c831c836b2e9db61150e49a93fc1a4c63b256494642fee0bd7c' },
  'qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors': { repo: 'ml-resources/flux-3-image-klein-comfy', path: 'text_encoders/qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors', dir: 'text_encoders', gb: 6.72, vramGb: 0, cloud: false,
    sha256: 'e5d85a7421d197bf5a12474511936ecabce19a833252f16e9310a983194a4458' },
  'qwen3vl_4b_bf16.safetensors': { repo: 'Comfy-Org/Qwen3-VL', path: 'text_encoders/qwen3vl_4b_bf16.safetensors', dir: 'text_encoders', gb: 8.88, vramGb: 0, cloud: true,
    sha256: '36f3ff447ef59201722e8f9ce6020c9819fdcfba6aa2608c4e09b1c0ce114e34' },
  'flux2-vae.safetensors': { repo: 'Comfy-Org/vae-text-encorder-for-flux-klein-4b', path: 'split_files/vae/flux2-vae.safetensors', dir: 'vae', gb: 0.34, vramGb: 0, cloud: true,
    sha256: '868fe7b343cc8f3a19dbcfcafbc3d5f888802be3f89bd81b65b3621a066ce8f3' },
  // Qwen-Image 2.1 Turbo, repackaged by Comfy-Org (ungated). Comfy Cloud lacks the model and its VAE.
  'qwen_image_2.1_turbo_bf16.safetensors': { repo: 'Comfy-Org/Qwen-Image-2.1', path: 'diffusion_models/qwen_image_2.1_turbo_bf16.safetensors', dir: 'diffusion_models', gb: 14.23, vramGb: 24, cloud: false,
    sha256: '8b74237a7f505773e2c66726fa696444b4c704585c93a347cff9044937f7914a' },
  'qwen3vl_8b_bf16.safetensors': { repo: 'Comfy-Org/Qwen-Image-2.1', path: 'text_encoders/qwen3vl_8b_bf16.safetensors', dir: 'text_encoders', gb: 17.53, vramGb: 0, cloud: true,
    sha256: '68bdc82bc1b66851162ae656225e7e2068166b603db19bd5d5a3b90eb12669a9' },
  'qwen_image_2.1_vae_bf16.safetensors': { repo: 'Comfy-Org/Qwen-Image-2.1', path: 'vae/qwen_image_2.1_vae_bf16.safetensors', dir: 'vae', gb: 0.68, vramGb: 0, cloud: false,
    sha256: 'bb21f7473051e1ac368515dd3f2e15cd44d7a11748ee8823e1ddca3e4876b7c9' },
  // Video edits (research_notes/engine/genjutsu.md), checked against the Hugging Face API on 2026-10-18.
  // Bernini-R (ByteDance) swaps, restyles, relights and, with the BFS LoRAs, swaps heads.
  'wan2.2_bernini_r_high_noise_fp8_scaled.safetensors': { repo: 'Comfy-Org/Bernini-R', path: 'diffusion_models/wan2.2_bernini_r_high_noise_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 15.57, vramGb: 24, cloud: true,
    sha256: '9ff3d7369da98f8eaf71045f7d0e99d5e344eea5e7dc934a930608786fe73f52' },
  'wan2.2_bernini_r_low_noise_fp8_scaled.safetensors': { repo: 'Comfy-Org/Bernini-R', path: 'diffusion_models/wan2.2_bernini_r_low_noise_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 15.57, vramGb: 24, cloud: true,
    sha256: 'ce35c070f345c91abe43d6bf29b0eccb8687e4026fadc0e0a70a73c9afb7bbb3' },
  'umt5_xxl_fp8_e4m3fn_scaled.safetensors': { repo: 'Comfy-Org/Wan_2.1_ComfyUI_repackaged', path: 'split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors', dir: 'text_encoders', gb: 6.74, vramGb: 0, cloud: true,
    sha256: 'c3355d30191f1f066b26d93fba017ae9809dce6c627dda5f6a66eaa651204f68' },
  'Wan2_1_VAE_bf16.safetensors': { repo: 'Comfy-Org/Wan-Animate-2', path: 'vae/Wan2_1_VAE_bf16.safetensors', dir: 'vae', gb: 0.25, vramGb: 0, cloud: true,
    sha256: '1ab9a32cc2c740f6e39d80d367ce5dcc28db8c71b79b28670546b8973e9d75f9' },
  // The turbo LoRA the swap runs at 6 steps with.
  'lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors': { repo: 'Kijai/WanVideo_comfy', path: 'Lightx2v/lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors', dir: 'loras', gb: 0.63, vramGb: 0, cloud: true,
    sha256: '37d49218544b9e0bfb8e831d1399f451fbc5068aff6474f42a90c928363c3573' },
  // Head swap LoRAs for Bernini-R's two experts. Comfy Cloud does not have them, so a face swap runs on a Pod.
  'headswap_bernini_r64_73f640_step3000_high_noise.safetensors': { repo: 'Alissonerdx/BFS-Best-Face-Swap-Video', path: 'wan22/headswap_bernini_r64_73f640_step3000_high_noise.safetensors', dir: 'loras', gb: 0.61, vramGb: 0, cloud: false,
    label: 'The head swap LoRA', sha256: 'd7e541b7913c31625fb9808ae7d58803b10ec3dd512ba64cfde987c62ad74f50' },
  'headswap_bernini_r64_73f640_step3000_low_noise.safetensors': { repo: 'Alissonerdx/BFS-Best-Face-Swap-Video', path: 'wan22/headswap_bernini_r64_73f640_step3000_low_noise.safetensors', dir: 'loras', gb: 0.61, vramGb: 0, cloud: false,
    label: 'The head swap LoRA', sha256: 'b2d142a3bd97331f73bc06a95f0a1ed0b9d83461d0191c95d5c931edd5665b90' },
  // Wan Animate 2 Distilled moves the character in a photo like the person in a video.
  'wan_animate_2_distill_int8_convrot.safetensors': { repo: 'Comfy-Org/Wan-Animate-2', path: 'diffusion_models/wan_animate_2_distill_int8_convrot.safetensors', dir: 'diffusion_models', gb: 16.65, vramGb: 24, cloud: true,
    sha256: 'd2e566ecac3f164cb1a6b63dc7d868d6678c9affa49fbceb3abe4f9458f89c8a' },
  'clip_vision_h.safetensors': { repo: 'Comfy-Org/Wan-Animate-2', path: 'clip_vision/clip_vision_h.safetensors', dir: 'clip_vision', gb: 1.26, vramGb: 0, cloud: true,
    sha256: '64a7ef761bfccbadbaa3da77366aac4185a6c58fa5de5f589b42a65bcc21f161' },
}

// Which input of which loader names a file, and the ComfyUI folder it loads from.
const LOADERS = {
  CheckpointLoaderSimple: { ckpt_name: 'checkpoints' },
  UNETLoader: { unet_name: 'diffusion_models' },
  VAELoader: { vae_name: 'vae' },
  CLIPLoader: { clip_name: 'text_encoders' },
  CLIPVisionLoader: { clip_name: 'clip_vision' },
  DualCLIPLoader: { clip_name1: 'text_encoders', clip_name2: 'text_encoders' },
  TripleCLIPLoader: { clip_name1: 'text_encoders', clip_name2: 'text_encoders', clip_name3: 'text_encoders' },
  LoraLoader: { lora_name: 'loras' },
  LoraLoaderModelOnly: { lora_name: 'loras' },
  UpscaleModelLoader: { model_name: 'upscale_models' },
  LatentUpscaleModelLoader: { model_name: 'latent_upscale_models' },
  FreeVideoLoRA: { lora: 'loras' },
}

// Runtimes a Pod installs for nodes that need more than model files. Comfy Cloud has none of them.
// FreeVideo runs MiniMax H3 as OpenVDN's 8-step VDN-H3 in its own Python env, with its own weights
// (research_notes/engine/freevideo.md). It runs on 8 GB, but ComfyField uses it only on the 96 GB card
// FreeVideo tests on, where it is faster and cheaper per video than stock H3. `gb` is the free disk
// its installer asks for on a first install; `minutes` is the first install, a re-run is shorter.
export const RUNTIMES = {
  freevideo: { name: 'FreeVideo', nodes: /^FreeVideo/, vramGb: 96, gb: 96, minutes: [15, 40] },
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
      if (typeof name !== 'string' || name.includes('{{') || name === 'None') continue
      const f = MODEL_FILES[name]
      if (!f) throw Object.assign(new Error(`${name} is not in ComfyField's model list, so a Pod cannot download it.`), { status: 400 })
      if (f.dir !== dir) throw Object.assign(new Error(`${node.class_type} loads ${name} from ${dir}, but the model list keeps it in ${f.dir}.`), { status: 400 })
      out.set(`${dir}/${name}`, { ...f, name })
    }
  }
  return [...out.values()]
}

// The runtimes a graph's nodes need, shaped like files so the Cloud, GPU and disk rules count them too.
export function runtimesOf(graph) {
  const out = new Set()
  for (const node of Object.values(graph || {})) {
    for (const [id, e] of Object.entries(RUNTIMES)) if (e.nodes.test(node?.class_type || '')) out.add(id)
  }
  return [...out].map((id) => ({ runtime: id, name: RUNTIMES[id].name, gb: RUNTIMES[id].gb, vramGb: RUNTIMES[id].vramGb, minutes: RUNTIMES[id].minutes, cloud: false }))
}

// Everything a Pod needs for a graph: model files to download and runtimes to install.
export const podNeedsOf = (graph) => [...modelFilesOf(graph), ...runtimesOf(graph)]

// Files a run needs that Comfy Cloud does not have.
export const notOnCloud = (files) => files.filter((f) => !f.cloud)

export const minVramOf = (files) => Math.max(0, ...files.map((f) => f.vramGb || 0))
export const volumeFor = (files) => Math.ceil(files.reduce((n, f) => n + f.gb, 0) + HEADROOM_GB)
