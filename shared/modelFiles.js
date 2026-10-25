// Model files a Pod can download, by the filename a workflow's loader node names. A workflow lists
// nothing itself: its graph is the source of truth, and this list says where each file comes from.
// Public Hugging Face repos only; sizes and sha256 from the Hugging Face API on 2026-10-17. The Pod
// checks each download against its sha256, so a mirror can only deliver the original bytes.
// `cloud` marks files Comfy Cloud already has (its model listing, 2026-10-16/17), so a run can go there at once.
// `vramGb` is the GPU the Pod needs for the model, with ComfyUI offloading what does not fit.
// `refSec` is a typical job's run time on the reference GPU (RTX PRO 6000) for the Session tiers' estimates.
// LTX-2.5's is measured (PatchWork run log, 2026-10-19) and H3's comes from PatchWork's fitted model; the
// rest are estimates. `arch` marks a file only one GPU architecture runs: NVFP4 needs Blackwell.
export const MODEL_FILES = {
  'flux1-dev-fp8.safetensors': { refSec: 15, repo: 'Comfy-Org/flux1-dev', path: 'flux1-dev-fp8.safetensors', dir: 'checkpoints', gb: 17.25, vramGb: 24, cloud: true,
    sha256: '8e91b68084b53a7fc44ed2a3756d821e355ac1a7b6fe29be760c1db532f3d88a' },
  'flux1-schnell-fp8.safetensors': { refSec: 4, repo: 'Comfy-Org/flux1-schnell', path: 'flux1-schnell-fp8.safetensors', dir: 'checkpoints', gb: 17.24, vramGb: 24, cloud: true,
    sha256: 'ead426278b49030e9da5df862994f25ce94ab2ee4df38b556ddddb3db093bf72' },
  'sd_xl_base_1.0.safetensors': { refSec: 6, repo: 'stabilityai/stable-diffusion-xl-base-1.0', path: 'sd_xl_base_1.0.safetensors', dir: 'checkpoints', gb: 6.94, vramGb: 12, cloud: true,
    sha256: '31e35c80fc4829d14f90153f4c74cd59c90b779f6afe05a74cd6120b893f7e5b' },
  'ltx-video-2b-v0.9.5.safetensors': { refSec: 20, repo: 'Lightricks/LTX-Video', path: 'ltx-video-2b-v0.9.5.safetensors', dir: 'checkpoints', gb: 6.34, vramGb: 16, cloud: true,
    sha256: '720d15c9f19f7d0f6b2a92bbbc34410e2cfb2f6856a100b38f734fbf973d4adf' },
  't5xxl_fp16.safetensors': { repo: 'comfyanonymous/flux_text_encoders', path: 't5xxl_fp16.safetensors', dir: 'text_encoders', gb: 9.79, vramGb: 0, cloud: true,
    sha256: '6e480b09fae049a72d2a8c5fbccb8d3e92febeb233bbe9dfe7256958a9167635' },
  // LTX-2.5: the official Lightricks/LTX-2.5 is gated, so these come from ungated mirrors whose
  // sha256 matches the official files exactly.
  'ltx-2.5-22b-distilled-transformer-comfy-int8-convrot.safetensors': { refSec: 63, repo: 'comfyicu/LTX-2.5', path: 'diffusion_models/ltx-2.5-22b-distilled-transformer-comfy-int8-convrot.safetensors', dir: 'diffusion_models', gb: 21.50, vramGb: 32, cloud: true,
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
  'minimax_h3_fl2va_pruned_int8_convrot.safetensors': { refSec: 45, repo: 'Comfy-Org/MiniMax-H3', path: 'diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors', dir: 'diffusion_models', gb: 20.97, vramGb: 32, cloud: true,
    sha256: 'e889202c41dafb67b10d67b97f0d8541508036a6090af23425a5c2615d03c47a' },
  'minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'loras/minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors', dir: 'loras', gb: 1.96, vramGb: 0, cloud: true,
    sha256: '2339acdf19bfe123f46b971ea35d367a84adb85de43627e1eceafa5a5b2b111e' },
  'qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors': { arch: 'blackwell', repo: 'Comfy-Org/MiniMax-H3', path: 'text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors', dir: 'text_encoders', gb: 15.69, vramGb: 0, cloud: true,
    sha256: '35a88d51044231fe332301d7a62aa81e3f2cba62febeb446e2c1e3e0ef76f2c6' },
  'minimax_h3_video_vae_fp16.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'vae/minimax_h3_video_vae_fp16.safetensors', dir: 'vae', gb: 5.21, vramGb: 0, cloud: true,
    sha256: '7c1f131492e7eddacaac9069a61b81bdd39de5cc96561e677c5eab1cdce5e522' },
  'minimax_h3_audio_vae_fp32.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'vae/minimax_h3_audio_vae_fp32.safetensors', dir: 'vae', gb: 0.61, vramGb: 0, cloud: true,
    sha256: '8e505d95dd1561d47abd43d4238fd40d9bb1ae9e147ed0a4cba778d76ae4db48' },
  // FLUX 3 Image Klein (distilled, with BFL's prompt upsampler). Comfy Cloud has only the text encoder
  // and the VAE, so it runs on a Pod. The official black-forest-labs repo is gated; these copies have
  // its exact sha256. The FLUX Kommunity License still applies to the weights.
  'flux3-image-klein-bf16.safetensors': { refSec: 10, repo: 'unsloth/flux-3-image-klein', path: 'model.safetensors', dir: 'diffusion_models', gb: 11.1, vramGb: 24, cloud: false,
    sha256: 'c3e9813cdd049c831c836b2e9db61150e49a93fc1a4c63b256494642fee0bd7c' },
  'qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors': { repo: 'ml-resources/flux-3-image-klein-comfy', path: 'text_encoders/qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors', dir: 'text_encoders', gb: 6.72, vramGb: 0, cloud: false,
    sha256: 'e5d85a7421d197bf5a12474511936ecabce19a833252f16e9310a983194a4458' },
  'qwen3vl_4b_bf16.safetensors': { repo: 'Comfy-Org/Qwen3-VL', path: 'text_encoders/qwen3vl_4b_bf16.safetensors', dir: 'text_encoders', gb: 8.88, vramGb: 0, cloud: true,
    sha256: '36f3ff447ef59201722e8f9ce6020c9819fdcfba6aa2608c4e09b1c0ce114e34' },
  'flux2-vae.safetensors': { repo: 'Comfy-Org/vae-text-encorder-for-flux-klein-4b', path: 'split_files/vae/flux2-vae.safetensors', dir: 'vae', gb: 0.34, vramGb: 0, cloud: true,
    sha256: '868fe7b343cc8f3a19dbcfcafbc3d5f888802be3f89bd81b65b3621a066ce8f3' },
  // Qwen-Image 2.1 Turbo, repackaged by Comfy-Org (ungated). Comfy Cloud lacks the model and its VAE.
  'qwen_image_2.1_turbo_bf16.safetensors': { refSec: 10, repo: 'Comfy-Org/Qwen-Image-2.1', path: 'diffusion_models/qwen_image_2.1_turbo_bf16.safetensors', dir: 'diffusion_models', gb: 14.23, vramGb: 24, cloud: false,
    sha256: '8b74237a7f505773e2c66726fa696444b4c704585c93a347cff9044937f7914a' },
  'qwen3vl_8b_bf16.safetensors': { repo: 'Comfy-Org/Qwen-Image-2.1', path: 'text_encoders/qwen3vl_8b_bf16.safetensors', dir: 'text_encoders', gb: 17.53, vramGb: 0, cloud: true,
    sha256: '68bdc82bc1b66851162ae656225e7e2068166b603db19bd5d5a3b90eb12669a9' },
  'qwen_image_2.1_vae_bf16.safetensors': { repo: 'Comfy-Org/Qwen-Image-2.1', path: 'vae/qwen_image_2.1_vae_bf16.safetensors', dir: 'vae', gb: 0.68, vramGb: 0, cloud: false,
    sha256: 'bb21f7473051e1ac368515dd3f2e15cd44d7a11748ee8823e1ddca3e4876b7c9' },
  // Image adapters for issue 181, sizes and sha256 from the Hugging Face API on 2026-10-25. Comfy Cloud lists none of them.
  // BFS head swap V1.1 on Qwen-Image 2.1 (MIT): V1 with the skin-softening MLP modules cut from blocks 16-31.
  'bfs_head_v1.1_qwen_2.1.safetensors': { repo: 'Alissonerdx/BFS-Best-Face-Swap', path: 'bfs_head_v1.1_qwen_2.1.safetensors', dir: 'loras', gb: 0.26, vramGb: 0, cloud: false,
    label: 'The BFS face swap LoRA', sha256: 'd1d748d5601077f3b6d05766f6823510e901970d916afa404a97e85dc92fa88e' },
  // Anything2Real 2601 A and AnyPose (base plus helper) on Qwen-Image-Edit 2511, Apache 2.0.
  'anything2real_2601_A_final_patched.safetensors': { repo: 'lrzjason/Anything2Real', path: 'anything2real_2601_A_final_patched.safetensors', dir: 'loras', gb: 0.61, vramGb: 0, cloud: false,
    label: 'The Anything2Real LoRA', sha256: 'd4cbbabf5610a8f0ea3f530dc0bc9e8a254be6563c4738795bea45d247903528' },
  '2511-AnyPose-base-000006250.safetensors': { repo: 'lilylilith/AnyPose', path: '2511-AnyPose-base-000006250.safetensors', dir: 'loras', gb: 0.30, vramGb: 0, cloud: false,
    label: 'The AnyPose LoRA', sha256: '0396314e43b94f7520cf5242e6aa6e8e9095d784f7e87ee45980c2e541ee8c4d' },
  '2511-AnyPose-helper-00006000.safetensors': { repo: 'lilylilith/AnyPose', path: '2511-AnyPose-helper-00006000.safetensors', dir: 'loras', gb: 0.30, vramGb: 0, cloud: false,
    label: 'The AnyPose helper LoRA', sha256: '674340c62fff3cf981d0cfc55daf2f0e6f51c56b50159e241d931748200cf1eb' },
  // Krea2-realism-V2 on Krea 2 Turbo (MIT), a LoKr with native block names, so ComfyUI maps it as is.
  'Krea2-realism-V2.safetensors': { repo: 'RudySen/Krea2-realism-V2', path: 'Krea2-realism-V2.safetensors', dir: 'loras', gb: 1.56, vramGb: 0, cloud: false,
    label: 'The Krea 2 realism LoRA', sha256: 'fb0048ce3340adc2842ccfcc1a9a61a9773b6628b01ae5a2e139ca9c679e715d' },
  // Video edits (research_notes/engine/genjutsu.md), checked against the Hugging Face API on 2026-10-18.
  // Bernini-R (ByteDance) swaps, restyles, relights and, with the BFS LoRAs, swaps heads.
  'wan2.2_bernini_r_high_noise_fp8_scaled.safetensors': { refSec: 120, repo: 'Comfy-Org/Bernini-R', path: 'diffusion_models/wan2.2_bernini_r_high_noise_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 15.57, vramGb: 24, cloud: true,
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
  'wan_animate_2_distill_int8_convrot.safetensors': { refSec: 120, repo: 'Comfy-Org/Wan-Animate-2', path: 'diffusion_models/wan_animate_2_distill_int8_convrot.safetensors', dir: 'diffusion_models', gb: 16.65, vramGb: 24, cloud: true,
    sha256: 'd2e566ecac3f164cb1a6b63dc7d868d6678c9affa49fbceb3abe4f9458f89c8a' },
  'clip_vision_h.safetensors': { repo: 'Comfy-Org/Wan-Animate-2', path: 'clip_vision/clip_vision_h.safetensors', dir: 'clip_vision', gb: 1.26, vramGb: 0, cloud: true,
    sha256: '64a7ef761bfccbadbaa3da77366aac4185a6c58fa5de5f589b42a65bcc21f161' },
  // Image services (research_notes/engine/t2i and qwen-edit), checked against the Hugging Face API and the Comfy Cloud listing on 2026-10-19.
  'krea2_turbo_fp8_scaled.safetensors': { repo: 'Comfy-Org/Krea-2', path: 'diffusion_models/krea2_turbo_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 13.14, vramGb: 24, cloud: true,
    label: 'Krea 2 Turbo', sha256: 'eb4dd8c612cfd10f64f25b057e6e6bbcb5737c94a7372177e456dbf7579502f1' },
  'qwen_image_vae.safetensors': { repo: 'Comfy-Org/Qwen-Image_ComfyUI', path: 'split_files/vae/qwen_image_vae.safetensors', dir: 'vae', gb: 0.25, vramGb: 0, cloud: true,
    sha256: 'a70580f0213e67967ee9c95f05bb400e8fb08307e017a924bf3441223e023d1f' },
  'z_image_turbo_bf16.safetensors': { repo: 'Comfy-Org/z_image_turbo', path: 'split_files/diffusion_models/z_image_turbo_bf16.safetensors', dir: 'diffusion_models', gb: 12.31, vramGb: 24, cloud: true,
    label: 'Z-Image Turbo', sha256: '2407613050b809ffdff18a4ac99af83ea6b95443ecebdf80e064a79c825574a6' },
  'qwen_3_4b.safetensors': { repo: 'Comfy-Org/z_image_turbo', path: 'split_files/text_encoders/qwen_3_4b.safetensors', dir: 'text_encoders', gb: 8.04, vramGb: 0, cloud: true,
    sha256: '6c671498573ac2f7a5501502ccce8d2b08ea6ca2f661c458e708f36b36edfc5a' },
  'ae.safetensors': { repo: 'Comfy-Org/z_image_turbo', path: 'split_files/vae/ae.safetensors', dir: 'vae', gb: 0.34, vramGb: 0, cloud: true,
    sha256: 'afc8e28272cd15db3919bacdb6918ce9c1ed22e96cb12c4d5ed0fba823529e38' },
  'hidream_o1_image_bf16.safetensors': { repo: 'Comfy-Org/HiDream-O1-Image', path: 'checkpoints/hidream_o1_image_bf16.safetensors', dir: 'checkpoints', gb: 16.37, vramGb: 24, cloud: true,
    label: 'HiDream-O1-Image', sha256: '0520134a47e5b2bacea25804b2a6021413eb95945344b5a953aa14170edff1aa' },
  'birefnet.safetensors': { repo: 'Comfy-Org/BiRefNet', path: 'background_removal/birefnet.safetensors', dir: 'background_removal', gb: 0.44, vramGb: 0, cloud: true,
    label: 'BiRefNet', sha256: '9ab37426bf4de0567af6b5d21b16151357149139362e6e8992021b8ce356a154' },
  'qwen_image_edit_2511_int8_convrot.safetensors': { repo: 'Comfy-Org/Qwen-Image-Edit_ComfyUI', path: 'split_files/diffusion_models/qwen_image_edit_2511_int8_convrot.safetensors', dir: 'diffusion_models', gb: 20.50, vramGb: 24, cloud: true,
    sha256: '11b5af5ac601821d73930c84846c9a158e67177356daf927ce1c8d10f3963829' },
  'qwen_2.5_vl_7b_fp8_scaled.safetensors': { repo: 'Comfy-Org/Qwen-Image_ComfyUI', path: 'split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors', dir: 'text_encoders', gb: 9.38, vramGb: 0, cloud: true,
    sha256: 'cb5636d852a0ea6a9075ab1bef496c0db7aef13c02350571e388aea959c5c0b4' },
  'Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors': { repo: 'lightx2v/Qwen-Image-Edit-2511-Lightning', path: 'Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors', dir: 'loras', gb: 0.85, vramGb: 0, cloud: true,
    label: 'The Qwen-Image-Edit 2511 Lightning LoRA', sha256: '22226e8d05d354bb356627d428809f5afd7819399b077238a2b70a82883a904f' },
  'qwen-image-edit-2511-multiple-angles-lora.safetensors': { repo: 'fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA', path: 'qwen-image-edit-2511-multiple-angles-lora.safetensors', dir: 'loras', gb: 0.30, vramGb: 0, cloud: true,
    label: 'The Multiple-Angles LoRA', sha256: '42426ded4e25fd22879d9e198b857556445ef4ca56e8da3246d0345155bb6765' },
  'qwen_image_layered_fp8mixed.safetensors': { repo: 'Comfy-Org/Qwen-Image-Layered_ComfyUI', path: 'split_files/diffusion_models/qwen_image_layered_fp8mixed.safetensors', dir: 'diffusion_models', gb: 20.53, vramGb: 24, cloud: true,
    sha256: 'e68c406b1bc08c97382a46dce6ed46699bc18a0f50422d97952ee4e8b63ad50a' },
  'qwen_image_layered_vae.safetensors': { repo: 'Comfy-Org/Qwen-Image-Layered_ComfyUI', path: 'split_files/vae/qwen_image_layered_vae.safetensors', dir: 'vae', gb: 0.25, vramGb: 0, cloud: true,
    sha256: 'c5320595fc61859ccdd0282184208f7b781c983b8ce4c6bc3e7723a807d3d28d' },
  'seedvr2_7b_int8_convrot.safetensors': { repo: 'Comfy-Org/SeedVR2', path: 'diffusion_models/seedvr2_7b_int8_convrot.safetensors', dir: 'diffusion_models', gb: 8.33, vramGb: 24, cloud: true,
    sha256: '5aa0d25fc9d35e449b659d0c9a5dcb22e2a4fa04032101b95a39da42b32c1be6' },
  'seedvr2_ema_vae_fp16.safetensors': { repo: 'Comfy-Org/SeedVR2', path: 'vae/seedvr2_ema_vae_fp16.safetensors', dir: 'vae', gb: 0.50, vramGb: 0, cloud: true,
    sha256: '20678548f420d98d26f11442d3528f8b8c94e57ee046ef93dbb7633da8612ca1' },
  // Video services (research_notes/engine/video-gen and effects-loras), checked against the Hugging Face API and the Comfy Cloud listing on 2026-10-19. Comfy Cloud has no effect LoRA.
  'minimax_h3_ref2va_pruned_int8_convrot.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors', dir: 'diffusion_models', gb: 20.97, vramGb: 32, cloud: true,
    label: 'MiniMax H3 Reference to Video', sha256: '9255f52b6677845ad238f20dfaafa94727053694127ab7f255c048f0f9365779' },
  // FastVideo's 8-step FastH3 Omni (2026-10-20), on H3's text encoder and VAEs. Not on Comfy Cloud yet.
  'fasth3_omniref_8step_pruned_int8_convrot.safetensors': { repo: 'FastVideo/FastH3-Omni-Comfy', path: 'diffusion_models/fasth3_omniref_8step_pruned_int8_convrot.safetensors', dir: 'diffusion_models', gb: 22.21, vramGb: 32, cloud: false,
    label: 'FastH3 Omni', sha256: '851b2dc9670ed864b7f1e951ac9da047d83b1c04ded9bfcc1a9e5bba0ee33f80' },
  'minimax_h3_fun_controlnet_union_2.0_pruned_int8_convrot.safetensors': { repo: 'Comfy-Org/MiniMax-H3', path: 'model_patches/minimax_h3_fun_controlnet_union_2.0_pruned_int8_convrot.safetensors', dir: 'model_patches', gb: 4.53, vramGb: 0, cloud: false,
    label: 'The MiniMax H3 Fun ControlNet 2.0 patch', sha256: '890af58bb350f0c2f6c409b1c67ea8f4196654297d037769b72de1e6f504c612' },
  'gemma4_e2b_it_int8_convrot.safetensors': { repo: 'Comfy-Org/gemma-4', path: 'text_encoders/gemma4_e2b_it_int8_convrot.safetensors', dir: 'text_encoders', gb: 5.20, vramGb: 0, cloud: true,
    label: 'The LTX-2.5 prompt enhancer', sha256: 'efeca0fcad2f863e5ed0a75e3af952b72bc963604c1dda6d20aee87a32b17566' },
  'wan2.2_i2v_high_noise_14B_fp8_scaled.safetensors': { repo: 'Comfy-Org/Wan_2.2_ComfyUI_Repackaged', path: 'split_files/diffusion_models/wan2.2_i2v_high_noise_14B_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 14.29, vramGb: 24, cloud: true,
    label: 'Wan 2.2 image to video', sha256: '6122e79d55e0f235698d11d657f3b196c5273c830da00b2b013c5a048d5e6a42' },
  'wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors': { repo: 'Comfy-Org/Wan_2.2_ComfyUI_Repackaged', path: 'split_files/diffusion_models/wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 14.29, vramGb: 24, cloud: true,
    label: 'Wan 2.2 image to video', sha256: '5471a457b6ac404202a5fbe6c11595a3d5641fc766b00f38763f72303fffc21e' },
  'wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors': { repo: 'Comfy-Org/Wan_2.2_ComfyUI_Repackaged', path: 'split_files/diffusion_models/wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 14.29, vramGb: 24, cloud: true,
    label: 'Wan 2.2 text to video', sha256: 'cad711ae211c8b23455ec68cd6a190a33a3d874234a77eb57266d73f8f0e6c9f' },
  'wan2.2_t2v_low_noise_14B_fp8_scaled.safetensors': { repo: 'Comfy-Org/Wan_2.2_ComfyUI_Repackaged', path: 'split_files/diffusion_models/wan2.2_t2v_low_noise_14B_fp8_scaled.safetensors', dir: 'diffusion_models', gb: 14.29, vramGb: 24, cloud: true,
    label: 'Wan 2.2 text to video', sha256: 'e71b96d7c82e638694c5e7fb98fac4bfb0e4ddc5fbbb4b1df40da8f0f1278a97' },
  'wan2.2_i2v_lightx2v_4steps_lora_v1_high_noise.safetensors': { repo: 'Comfy-Org/Wan_2.2_ComfyUI_Repackaged', path: 'split_files/loras/wan2.2_i2v_lightx2v_4steps_lora_v1_high_noise.safetensors', dir: 'loras', gb: 1.23, vramGb: 0, cloud: true,
    sha256: 'd176c808d6fc461999b68e321efcb7501b20b8c3797523ed0df14f7d1deff11e' },
  'wan2.2_i2v_lightx2v_4steps_lora_v1_low_noise.safetensors': { repo: 'Comfy-Org/Wan_2.2_ComfyUI_Repackaged', path: 'split_files/loras/wan2.2_i2v_lightx2v_4steps_lora_v1_low_noise.safetensors', dir: 'loras', gb: 1.23, vramGb: 0, cloud: true,
    sha256: '024f21de095bc8fad9809ded3e9e49a2e170dcf27075da8145ba7d60d8aab7f9' },
  'wan2.2_t2v_lightx2v_4steps_lora_v1.1_high_noise.safetensors': { repo: 'Comfy-Org/Wan_2.2_ComfyUI_Repackaged', path: 'split_files/loras/wan2.2_t2v_lightx2v_4steps_lora_v1.1_high_noise.safetensors', dir: 'loras', gb: 1.23, vramGb: 0, cloud: true,
    sha256: '698321cb86bd30c4af06c9b84e656a1048c8cb54e06d50694536fb5de37fde41' },
  'wan2.2_t2v_lightx2v_4steps_lora_v1.1_low_noise.safetensors': { repo: 'Comfy-Org/Wan_2.2_ComfyUI_Repackaged', path: 'split_files/loras/wan2.2_t2v_lightx2v_4steps_lora_v1.1_low_noise.safetensors', dir: 'loras', gb: 1.23, vramGb: 0, cloud: true,
    sha256: 'ec95216e614b3c132c11bfb387b11feedf62163150ccc9068bca8a189771e75a' },
  'wan_2.1_vae.safetensors': { repo: 'Comfy-Org/Wan_2.2_ComfyUI_Repackaged', path: 'split_files/vae/wan_2.1_vae.safetensors', dir: 'vae', gb: 0.25, vramGb: 0, cloud: true,
    sha256: '2fc39d31359a4b0a64f55876d8ff7fa8d780956ae2cb13463b0223e15148976b' },
  'wan22_i2v_explosion_redmond_high_noise.safetensors': { repo: 'artificialguybr/Explosion-Redmond-WAN2-I2V-14B', path: '[WAN2.2-I2V]EXPLOSION_REDMOND_high_noise.safetensors', dir: 'loras', gb: 0.08, vramGb: 0, cloud: false,
    label: 'The explosion LoRA', sha256: '51b20f2b4f713d1021c1da78c5bdcebc273efa9a2c7c18992d93e3cebabba604' },
  'wan22_i2v_explosion_redmond_low_noise.safetensors': { repo: 'artificialguybr/Explosion-Redmond-WAN2-I2V-14B', path: '[WAN2.2-I2V]EXPLOSION_REDMOND_low_noise.safetensors', dir: 'loras', gb: 0.08, vramGb: 0, cloud: false,
    label: 'The explosion LoRA', sha256: '9630953d9830ea072f7698e6fc13d943f7f8da7f2d75edf5266a784255152774' },
  'wan22_i2v_spontaneous_combustion_redmond_high_noise.safetensors': { repo: 'artificialguybr/Spontaneous-Combustion-Redmond-WAN2-I2V-14B', path: '[WAN2.2]Spontaneous_Combustion_Redmond_high_noise.safetensors', dir: 'loras', gb: 0.08, vramGb: 0, cloud: false,
    label: 'The fire LoRA', sha256: 'ce3608af487c769d66b9efb654c5645c72dbdfeb3809472b9bc0cacaa0e53193' },
  'wan22_i2v_spontaneous_combustion_redmond_low_noise.safetensors': { repo: 'artificialguybr/Spontaneous-Combustion-Redmond-WAN2-I2V-14B', path: '[WAN2.2]Spontaneous_Combustion_Redmond_low_noise.safetensors', dir: 'loras', gb: 0.08, vramGb: 0, cloud: false,
    label: 'The fire LoRA', sha256: 'd74c4061ff0d736d17df987c1120a8017499c9ec4cfb2c95d83cd1cf6a97b459' },
  'wan22_i2v_disintegration_redmond_high_noise.safetensors': { repo: 'artificialguybr/Disintegration-Redmond-WAN2-I2V-14B', path: '[Wan2.2]Disintegration_Redmond_high_noise.safetensors', dir: 'loras', gb: 0.08, vramGb: 0, cloud: false,
    label: 'The disintegration LoRA', sha256: '555d2d39913a829820d844a9c9082fbaeaa8ca4d963087ad0cbf67f09d0fa606' },
  'wan22_i2v_disintegration_redmond_low_noise.safetensors': { repo: 'artificialguybr/Disintegration-Redmond-WAN2-I2V-14B', path: '[Wan2.2]Disintegration_Redmond_low_noise.safetensors', dir: 'loras', gb: 0.08, vramGb: 0, cloud: false,
    label: 'The disintegration LoRA', sha256: 'c71b0aabae6c73fee423f35f5ed088e082196ca41cddb9265424af5c6a3608a8' },
  'wan22_i2v_metalcification_redmond_high_noise.safetensors': { repo: 'artificialguybr/Metalcification-Redmond-WAN2-I2V-14B', path: '[WAN2.2]Metalcification_Redmond_high_noise.safetensors', dir: 'loras', gb: 0.15, vramGb: 0, cloud: false,
    label: 'The metal skin LoRA', sha256: '3cc5fcf17722c0e709a432c05b2041e54109651d50766e44a4083388b8766971' },
  'wan22_i2v_metalcification_redmond_low_noise.safetensors': { repo: 'artificialguybr/Metalcification-Redmond-WAN2-I2V-14B', path: '[WAN2.2]Metalcification_Redmond_low_noise.safetensors', dir: 'loras', gb: 0.15, vramGb: 0, cloud: false,
    label: 'The metal skin LoRA', sha256: '9956951204e347a4c5636189eed2961d686c2a8665bb0ef4847c881dc5520128' },
  'wan22_i2v_thunderhero_redmond_high_noise.safetensors': { repo: 'artificialguybr/ThunderHero-Redmond-WAN2-I2V-14B', path: '[WAN2.2]ThunderHero_Redmond_high_noise.safetensors', dir: 'loras', gb: 0.15, vramGb: 0, cloud: false,
    label: 'The lightning LoRA', sha256: '8a7066ecdec71e3639596fd7adbffdfe1d19519c564601b730f834658b7ce458' },
  'wan22_i2v_thunderhero_redmond_low_noise.safetensors': { repo: 'artificialguybr/ThunderHero-Redmond-WAN2-I2V-14B', path: '[WAN2.2]ThunderHero_Redmond_low_noise.safetensors', dir: 'loras', gb: 0.15, vramGb: 0, cloud: false,
    label: 'The lightning LoRA', sha256: 'f7c6b47ae93f1f4c2722345c47d9cafa3a69ff3ca442982ecdd0a767e6843b45' },
  'wan22_i2v_skinmorph_redmond_high_noise.safetensors': { repo: 'artificialguybr/SkinMorph-Redmond-WAN2-I2V-14B', path: '[WAN2.2]SkinMorph_Redmond_high_noise.safetensors', dir: 'loras', gb: 0.15, vramGb: 0, cloud: false,
    label: 'The skin morph LoRA', sha256: '10659116ab688105b704ac0fefec3aca12f5e52f2189f49ff9d581f064fb1563' },
  'wan22_i2v_skinmorph_redmond_low_noise.safetensors': { repo: 'artificialguybr/SkinMorph-Redmond-WAN2-I2V-14B', path: '[WAN2.2]SkinMorph_Redmond_low_noise.safetensors', dir: 'loras', gb: 0.15, vramGb: 0, cloud: false,
    label: 'The skin morph LoRA', sha256: '5f4a808e68428ff4db002853f4c02e625042a0f9ea28084245b59368e4f604f9' },
  'wan22_i2v_disappearing_redmond_high_noise.safetensors': { repo: 'artificialguybr/Disappearing-Redmond-WAN2-I2V-14B', path: '[Wan2.2]Disappearing_Redmond_high_noise.safetensors', dir: 'loras', gb: 0.15, vramGb: 0, cloud: false,
    label: 'The vanish LoRA', sha256: '3b3277144099e161ad4ec409363141d5507fb5bded919e49790f3b9a0c9e55ce' },
  'wan22_i2v_disappearing_redmond_low_noise.safetensors': { repo: 'artificialguybr/Disappearing-Redmond-WAN2-I2V-14B', path: '[Wan2.2]Disappearing_Redmond_low_noise.safetensors', dir: 'loras', gb: 0.15, vramGb: 0, cloud: false,
    label: 'The vanish LoRA', sha256: '92ac4a839e7fdc6ec73e1bba7481adc75c10091202d0425aef42166ebd3b6ab2' },
  'wan_22_high_noise_pupil_transition.safetensors': { repo: 'p4ss3r2/wan22_Pupil_Transition_LoRa', path: 'wan_22_high_noise_pupil_transition.safetensors', dir: 'loras', gb: 0.31, vramGb: 0, cloud: false,
    label: 'The pupil transition LoRA', sha256: 'a1601f2f36e3dec7908cabe865fed710f9fe2e9a87a33bcecef28d928b7a6c36' },
  'minimax_h3_360_orbit_flf2v_lora_v1.safetensors': { repo: 'pablodawson/MiniMax-H3-360-Orbit-LoRA', path: 'minimax_h3_flf2v_lora_v1.safetensors', dir: 'loras', gb: 0.16, vramGb: 0, cloud: false,
    label: 'The 360 orbit LoRA', sha256: '14f13e3effaf3e729fdc0c97680344aa63f473be0c55963f963d718b3db2a4d4' },
  // Video edits and enhance tools (research_notes/engine/video-edit and enhance), checked against the Hugging Face API and the Comfy Cloud listing on 2026-10-19.
  'sam3.1_multiplex_fp16.safetensors': { repo: 'Comfy-Org/sam3.1', path: 'checkpoints/sam3.1_multiplex_fp16.safetensors', dir: 'checkpoints', gb: 1.75, vramGb: 0, cloud: true,
    label: 'SAM 3.1', sha256: '9ba99c92703c2e8b4f47de2d34a539bb8e18923049e238b780d70dbe6368eb03' },
  'void_pass1.safetensors': { repo: 'Comfy-Org/void-model', path: 'diffusion_models/void_pass1.safetensors', dir: 'diffusion_models', gb: 11.14, vramGb: 32, cloud: true,
    label: 'VOID', sha256: 'f3fff936d57008c39054e37ae0db6a3fd3f48ccaf1291a186e28d8760d68e6f3' },
  'void_pass2.safetensors': { repo: 'Comfy-Org/void-model', path: 'diffusion_models/void_pass2.safetensors', dir: 'diffusion_models', gb: 11.14, vramGb: 32, cloud: true,
    label: 'VOID', sha256: '884d96ae3be9e2c899f15446aee69260f56e21496c1005400fc6676701e67704' },
  'cogvideox_vae.safetensors': { repo: 'Comfy-Org/void-model', path: 'vae/cogvideox_vae.safetensors', dir: 'vae', gb: 0.43, vramGb: 0, cloud: true,
    sha256: 'bd47d57ad948ff80da0af0cb2e4dcdef65073aba59bccfd383ada9a7d1c02024' },
  'raft_large_C_T_SKHT_V2-ff5fadd5.safetensors': { repo: 'Comfy-Org/void-model', path: 'optical_flow/raft_large_C_T_SKHT_V2-ff5fadd5.safetensors', dir: 'optical_flow', gb: 0.02, vramGb: 0, cloud: true,
    sha256: 'aac3561dbbb49a30853bc7d9bb1bf39ce59cc260f670911d43c900ba27a4a8bb' },
  'wan2.1_14B_SCAIL_2_int8_convrot.safetensors': { repo: 'Comfy-Org/SCAIL-2', path: 'diffusion_models/wan2.1_14B_SCAIL_2_int8_convrot.safetensors', dir: 'diffusion_models', gb: 16.65, vramGb: 24, cloud: true,
    label: 'SCAIL-2', sha256: 'a2114c18a811243185f103765cd5004b61652141aa55a9016d3bdceebceb5ac0' },
  'wan2.1_SCAIL_2_DPO_lora_bf16.safetensors': { repo: 'Comfy-Org/SCAIL-2', path: 'loras/wan2.1_SCAIL_2_DPO_lora_bf16.safetensors', dir: 'loras', gb: 1.23, vramGb: 0, cloud: true,
    sha256: 'b106522036f64e50f5f8ae3b808973515ff442cc2fac27b65d875eafb95b89e2' },
  'lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors': { repo: 'Comfy-Org/Wan-Animate-2', path: 'loras/lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors', dir: 'loras', gb: 0.74, vramGb: 0, cloud: true,
    sha256: '85c4a61c30e0497aa44b91d93a893b624708461a56fe5485183b28fa07e2dfb3' },
  'Wan2_1_kwai_recammaster_1_3B_step20000_bf16.safetensors': { repo: 'Kijai/WanVideo_comfy', path: 'Wan2_1_kwai_recammaster_1_3B_step20000_bf16.safetensors', dir: 'diffusion_models', gb: 2.98, vramGb: 24, cloud: true,
    label: 'ReCamMaster', sha256: 'f0dcfbae828750e611286308e743b011aba93e2643b86cdae9ddfb6bbc9c84ca' },
  'seedvr2_3b_int8_convrot.safetensors': { repo: 'Comfy-Org/SeedVR2', path: 'diffusion_models/seedvr2_3b_int8_convrot.safetensors', dir: 'diffusion_models', gb: 3.46, vramGb: 24, cloud: true,
    label: 'SeedVR2 3B', sha256: 'c3dec8bcc5916843a8a858572970597462e1f2dc598d6dfd818f6cd40f53a157' },
  'RealESRGAN_x4plus.safetensors': { repo: 'Comfy-Org/Real-ESRGAN_repackaged', path: 'RealESRGAN_x4plus.safetensors', dir: 'upscale_models', gb: 0.07, vramGb: 24, cloud: true,
    label: 'RealESRGAN', sha256: '37f9a931c215f040aa6d50f711f2cb115f713c46df1d0d6469a8bd7bfe9a60bb' },
  'rife_v4.26.safetensors': { repo: 'Comfy-Org/frame_interpolation', path: 'frame_interpolation/rife_v4.26.safetensors', dir: 'frame_interpolation', gb: 0.02, vramGb: 24, cloud: true,
    label: 'RIFE 4.26', sha256: '151874592c877740e5db11522f4514df569eeafb0a0fcb2696f16e9e8d317c94' },
  // Audio, talking heads (research_notes/engine/audio-talk/) and TRELLIS.2 3D (research_notes/engine/3d/), 2026-10-19.
  'minimax_music3_dit_fp16.safetensors': { repo: 'Comfy-Org/MiniMax-Music-3', path: 'diffusion_models/minimax_music3_dit_fp16.safetensors', dir: 'diffusion_models', gb: 4.91, vramGb: 24, cloud: true,
    label: 'MiniMax Music 3', sha256: '45494a2b6b69af115902ff28eaf54118d19067aa54da01000f3e3efce7ba0e34' },
  'minimax_music3_text_encoder_pruned_int8_convrot.safetensors': { repo: 'Comfy-Org/MiniMax-Music-3', path: 'text_encoders/minimax_music3_text_encoder_pruned_int8_convrot.safetensors', dir: 'text_encoders', gb: 9.20, vramGb: 0, cloud: true,
    sha256: '010b7416d2336a08c711bc22ee65849c9623069ddb7d89bec011a75699e52014' },
  'minimax_music3_dav.safetensors': { repo: 'Comfy-Org/MiniMax-Music-3', path: 'vae/minimax_music3_dav.safetensors', dir: 'vae', gb: 0.22, vramGb: 0, cloud: true,
    sha256: '2a32155b769be01445fcc2a8663b910fc9e1751e18dc1c3ec528064512d9ef0c' },
  'stable_audio_3_medium.safetensors': { repo: 'Comfy-Org/stable-audio-3', path: 'checkpoints/stable_audio_3_medium.safetensors', dir: 'checkpoints', gb: 9.22, vramGb: 24, cloud: true,
    label: 'Stable Audio 3 Medium', sha256: '48d9c65e290e7bcd5194e0633bfc2424a59ee9683f5c2d58762d997b7d8ce0b5' },
  't5gemma_b_b_ul2.safetensors': { repo: 'Comfy-Org/stable-audio-3', path: 'text_encoders/t5gemma_b_b_ul2.safetensors', dir: 'text_encoders', gb: 1.19, vramGb: 0, cloud: true,
    sha256: '1e1eba25be8872edb0d3c6335c6658fd6388e7b14b60da6e454e404cfcd8150e' },
  'qwen3.5_2b_bf16.safetensors': { repo: 'Comfy-Org/Qwen3.5', path: 'text_encoders/qwen3.5_2b_bf16.safetensors', dir: 'text_encoders', gb: 4.55, vramGb: 0, cloud: true,
    sha256: 'aa33250c4fc64891ddfaba3a314fd9542ea371843c387178b425fbcc5ed680b1' },
  'Wan2_1-I2V-14B-480p_fp8_e4m3fn_scaled_KJ.safetensors': { repo: 'Kijai/WanVideo_comfy_fp8_scaled', path: 'I2V/Wan2_1-I2V-14B-480p_fp8_e4m3fn_scaled_KJ.safetensors', dir: 'diffusion_models', gb: 16.64, vramGb: 24, cloud: true,
    label: 'InfiniteTalk', sha256: '2ff922282cd84589702e6e8c26e083d1160bfc2b217dd44e1ae2688441dc495d' },
  'Wan2_1-InfiniTetalk-Single_fp16.safetensors': { repo: 'Kijai/WanVideo_comfy', path: 'InfiniteTalk/Wan2_1-InfiniTetalk-Single_fp16.safetensors', dir: 'diffusion_models', gb: 5.13, vramGb: 0, cloud: true,
    label: 'InfiniteTalk', sha256: 'bf212c5c647eaf1c019b2158d2edf4a360d97e38b746c4bac994fee485e09fc3' },
  'umt5-xxl-enc-bf16.safetensors': { repo: 'Kijai/WanVideo_comfy', path: 'umt5-xxl-enc-bf16.safetensors', dir: 'text_encoders', gb: 11.36, vramGb: 0, cloud: true,
    sha256: '4fa971faf306cad919033d5bbe192e571dc08452f800cbf2ec3c73977c01b2cc' },
  'wav2vec2-chinese-base_fp16.safetensors': { repo: 'Kijai/wav2vec2_safetensors', path: 'wav2vec2-chinese-base_fp16.safetensors', dir: 'wav2vec2', gb: 0.19, vramGb: 0, cloud: false,
    label: 'The wav2vec2 audio encoder', sha256: '000813e441020f18cff844c969d2d5d4adc2a5ce46b2db1f23950b05d88805b4' },
  'hunyuanvideo_foley.pth': { repo: 'tencent/HunyuanVideo-Foley', path: 'hunyuanvideo_foley.pth', dir: 'hunyuan_foley', gb: 10.30, vramGb: 24, cloud: false,
    label: 'HunyuanVideo-Foley', sha256: '2900021f8ee562a8175b2f1a3fafb06b9e9e848f11f4c6d4d5d72e126f7c0475' },
  'vae_128d_48k.pth': { repo: 'tencent/HunyuanVideo-Foley', path: 'vae_128d_48k.pth', dir: 'vae', gb: 1.49, vramGb: 0, cloud: false,
    label: 'HunyuanVideo-Foley', sha256: '07e6139ff33bd21ba8a7a7f40ed24aab13ac0d100cd686f8a9f3e03dc5251cb1' },
  'drama3_fp8experts_bf16.safetensors': { repo: 'PedroMarinhoDev/Drama-3-ComfyUI', path: 'drama3_fp8experts_bf16.safetensors', dir: 'diffusion_models', gb: 38.58, vramGb: 24, cloud: false,
    label: 'Fish Audio Drama 3', sha256: '5d053a200cf0f77faa13c087c78ef200c3b53f288451a6b9e7a8fa421c03a67b' },
  'drama3_codec.safetensors': { repo: 'PedroMarinhoDev/Drama-3-ComfyUI', path: 'drama3_codec.safetensors', dir: 'vae', gb: 1.57, vramGb: 0, cloud: false,
    label: 'Fish Audio Drama 3', sha256: '4fecf102907a48414230da9a74d72d07c3a92368eab53fab655797837bddf5ae' },
  'qwen3_asr_0.6b_bf16.safetensors': { repo: 'PedroMarinhoDev/Qwen3-ASR-ComfyUI', path: 'qwen3_asr_0.6b_bf16.safetensors', dir: 'asr', gb: 1.56, vramGb: 0, cloud: false,
    label: 'Qwen3-ASR', sha256: 'eb350ce7510a538eb136d8320db470a0761713c47de6e12b0fca090d4fc15ecf' },
  'trellis_2_int8_convrot.safetensors': { repo: 'Comfy-Org/TRELLIS.2', path: 'diffusion_models/trellis_2_int8_convrot.safetensors', dir: 'diffusion_models', gb: 5.25, vramGb: 24, cloud: false,
    label: 'TRELLIS.2', sha256: 'd01952ad137213f6a868f86b6b877026276f84af5eec23069217475a0bad3a31' },
  'trellis_2_shape_vae_bf16.safetensors': { repo: 'Comfy-Org/TRELLIS.2', path: 'vae/trellis_2_shape_vae_bf16.safetensors', dir: 'vae', gb: 1.10, vramGb: 0, cloud: false,
    label: 'TRELLIS.2', sha256: 'de0cb4949a76c59ee5c091a995a69bcc8c51d5aeda939f0c641a50d2a72341f4' },
  'trellis_2_texture_vae_bf16.safetensors': { repo: 'Comfy-Org/TRELLIS.2', path: 'vae/trellis_2_texture_vae_bf16.safetensors', dir: 'vae', gb: 0.95, vramGb: 0, cloud: false,
    label: 'TRELLIS.2', sha256: '714e5ebf094a610e12a8e3b5175c18a62f37f6ea4218acb6073644456b73ab0e' },
  'dino_v3_vit_l.safetensors': { repo: 'Comfy-Org/TRELLIS.2', path: 'clip_vision/dino_v3_vit_l.safetensors', dir: 'clip_vision', gb: 1.21, vramGb: 0, cloud: false,
    label: 'TRELLIS.2', sha256: '5cb785e458de7c460579082418af81f5c62380c181599344bdc60898c63468ee' },
}

// Which input of which loader names a file, and the ComfyUI folder it loads from.
export const LOADERS = {
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
  MultiTalkModelLoader: { model: 'diffusion_models' },
  WanVideoLoraSelect: { lora: 'loras' },
  WanVideoTextEncodeCached: { model_name: 'text_encoders' },
  Wav2VecModelLoader: { model: 'wav2vec2' },
  HunyuanFoleyModelLoader: { foley_checkpoint_name: 'hunyuan_foley' },
  LoadDACHunyuanVAE: { vae_name: 'vae' },
  Drama3Loader: { model_name: 'diffusion_models' },
  Drama3CodecLoader: { codec_name: 'vae' },
  Qwen3ASRLoader: { model_name: 'asr' },
  OpticalFlowLoader: { model_name: 'optical_flow' },
  WanVideoModelLoader: { model: 'diffusion_models' },
  WanVideoVAELoader: { model_name: 'vae' },
  FrameInterpolationModelLoader: { model_name: 'frame_interpolation' },
  ModelPatchLoader: { name: 'model_patches' },
  LoadBackgroundRemovalModel: { bg_removal_name: 'background_removal' },
}

// Runtimes a Pod installs for nodes that need more than model files. Comfy Cloud has no FreeVideo.
// FreeVideo runs MiniMax H3 as OpenVDN's 8-step VDN-H3 in its own Python env, with its own weights
// (research_notes/engine/freevideo.md). It runs on 8 GB, but ComfyField uses it only on the 96 GB card
// FreeVideo tests on, where it is faster and cheaper per video than stock H3. `gb` is the free disk
// its installer asks for on a first install; `minutes` is the first install, a re-run is shorter.
const ENVS = {
  // Its attention kernel is compiled for the Blackwell RTX PRO 6000 (sm_120).
  freevideo: { name: 'FreeVideo', nodes: /^FreeVideo/, vramGb: 96, gb: 96, minutes: [15, 40], arch: 'blackwell', refSec: 30 },
}

// Custom node packs a Pod installs for graphs that use their nodes, pinned by commit, as model files
// are pinned by sha256: a graph's node classes decide its packs, as its loaders decide its files.
// `cloud` marks packs Comfy Cloud preinstalls (comfy.org/cloud/supported-nodes), so a graph that needs
// only those still runs there at once. `classes` are the nodes ComfyField's graphs use; the Pod counts
// a pack ready once ComfyUI lists them. Ids are lower-case letters and digits (they travel in the Pod env).
// `files` are model files a pack reads from its own folder under ComfyUI/models instead of a loader's,
// keyed by folder and name; a Pod links that folder to the volume and downloads them with the pack.
// A file with `for` downloads only for graphs that use that node.
// `before` lists files that must be on the disk before ComfyUI loads the pack. `pip` adds pinned
// packages its requirements leave out; `skip` drops requirements it must not install.
export const NODE_PACKS = {
  vhs: { name: 'VideoHelperSuite', repo: 'Kosinkadink/ComfyUI-VideoHelperSuite', commit: '4d907bee61e92c2e65af3bd6383a4e4d356126d1', date: '2026-09-02',
    folder: 'ComfyUI-VideoHelperSuite', classes: ['VHS_SelectEveryNthImage', 'VHS_DuplicateImages', 'VHS_GetImageCount', 'VHS_VideoCombine'], cloud: true },
  kjnodes: { name: 'KJNodes', repo: 'kijai/ComfyUI-KJNodes', commit: '17195fcfa8a05f601b766a0f09c9733284f47416', date: '2026-10-15',
    folder: 'ComfyUI-KJNodes', classes: ['ColorMatch'], cloud: true },
  // ReCamMaster and InfiniteTalk's loop run only in this wrapper. Newest commit on main (no tags), five
  // months older than ComfyUI v0.41.1, so the first reshoot and talking head on a Pod are its test.
  // The MultiTalk nodes are an optional module of it, so the Pod waits for them by name.
  wanvideo: { name: 'WanVideoWrapper', repo: 'kijai/ComfyUI-WanVideoWrapper', commit: '088128b224242e110d3906c6750e9a3a348a659b', date: '2026-05-24',
    folder: 'ComfyUI-WanVideoWrapper', classes: ['WanVideoModelLoader', 'WanVideoVAELoader', 'WanVideoEncode', 'WanVideoDecode', 'WanVideoTextEmbedBridge', 'WanVideoReCamMasterDefaultCamera', 'WanVideoReCamMasterGenerateOrbitCamera', 'WanVideoReCamMasterCameraEmbed', 'WanVideoSampler',
      'WanVideoLoraSelect', 'WanVideoBlockSwap', 'WanVideoTextEncodeCached', 'WanVideoClipVisionEncode', 'WanVideoImageToVideoMultiTalk', 'MultiTalkModelLoader', 'Wav2VecModelLoader', 'MultiTalkWav2VecEmbeds'], cloud: true },
  // The audio packs (research_notes/engine/audio-talk/). Chatterbox and Qwen-TTS would download their
  // files themselves on first use, unpinned; files placed first are used as they are.
  chatterbox: { name: 'Fill-ChatterBox', repo: 'filliptm/ComfyUI_Fill-ChatterBox', commit: 'f7d7a16187430abcaf91a3039b9c83aa9960816a', date: '2026-08-24',
    folder: 'ComfyUI_Fill-ChatterBox', classes: ['FL_ChatterboxMultilingualTTS', 'FL_ChatterboxVC'], cloud: true,
    // Its tokenizer skips Japanese and Mandarin text normalization without these, which the formats offer.
    pip: ['pykakasi==2.3.0', 'spacy-pkuseg==1.0.1'],
    files: {
      'chatterbox/chatterbox_multilingual/ve.pt': { for: 'FL_ChatterboxMultilingualTTS', repo: 'ResembleAI/chatterbox', path: 've.pt', gb: 0.01, bytes: 5698626,
        sha256: '4b16d836bc598509860f6fa068165a8bb5e9ac84f05582dfcf278a5a372879f1' },
      'chatterbox/chatterbox_multilingual/t3_mtl23ls_v2.safetensors': { for: 'FL_ChatterboxMultilingualTTS', repo: 'ResembleAI/chatterbox', path: 't3_mtl23ls_v2.safetensors', gb: 2.14, bytes: 2143989752,
        sha256: 'b1237586127ce98e7800a68e49938eb5092846862aabcb6e17b2fda7889a6c75' },
      'chatterbox/chatterbox_multilingual/s3gen.pt': { for: 'FL_ChatterboxMultilingualTTS', repo: 'ResembleAI/chatterbox', path: 's3gen.pt', gb: 1.06, bytes: 1057165844,
        sha256: '9b9ff07e60b20c136e2b1b3d7563a24604e8d2c4c267888d1ee929dd0151d2a3' },
      'chatterbox/chatterbox_multilingual/grapheme_mtl_merged_expanded_v1.json': { for: 'FL_ChatterboxMultilingualTTS', repo: 'ResembleAI/chatterbox', path: 'grapheme_mtl_merged_expanded_v1.json', gb: 0.00, bytes: 69989,
        sha256: '69632f47220a788a52ce2661d096453c5655e9bf25289d89a8d832c46ee07dbf' },
      'chatterbox/chatterbox_multilingual/conds.pt': { for: 'FL_ChatterboxMultilingualTTS', repo: 'ResembleAI/chatterbox', path: 'conds.pt', gb: 0.00, bytes: 107374,
        sha256: '6552d70568833628ba019c6b03459e77fe71ca197d5c560cef9411bee9d87f4e' },
      'chatterbox/chatterbox_multilingual/Cangjie5_TC.json': { for: 'FL_ChatterboxMultilingualTTS', repo: 'ResembleAI/chatterbox', path: 'Cangjie5_TC.json', gb: 0.00, bytes: 1920163,
        sha256: '7073fd9de919443ae88e0bd2449917a65fe54898a4413ed1edcc4b67f28bce8c' },
      'chatterbox/chatterbox_vc/s3gen.pt': { for: 'FL_ChatterboxVC', repo: 'ResembleAI/chatterbox', path: 's3gen.pt', gb: 1.06, bytes: 1057165844,
        sha256: '9b9ff07e60b20c136e2b1b3d7563a24604e8d2c4c267888d1ee929dd0151d2a3' },
      'chatterbox/chatterbox_vc/conds.pt': { for: 'FL_ChatterboxVC', repo: 'ResembleAI/chatterbox', path: 'conds.pt', gb: 0.00, bytes: 107374,
        sha256: '6552d70568833628ba019c6b03459e77fe71ca197d5c560cef9411bee9d87f4e' },
    } },
  foley: { name: 'ComfyUI-HunyuanVideo_Foley', repo: 'BobRandomNumber/ComfyUI-HunyuanVideo_Foley', commit: 'b94f7aca877ff2be5bc264b057abee3dac682c1b', date: '2026-02-18',
    folder: 'ComfyUI-HunyuanVideo_Foley', classes: ['HunyuanFoleyModelLoader', 'LoadDACHunyuanVAE', 'HunyuanFoleySampler', 'DACHunyuanVAEDecode'], cloud: false,
    // Its loaders list their files when ComfyUI loads the pack, and keep that list.
    before: ['hunyuan_foley/hunyuanvideo_foley.pth', 'vae/vae_128d_48k.pth'],
    files: {
      'hunyuan_foley/synchformer_state_dict.pth': { repo: 'tencent/HunyuanVideo-Foley', path: 'synchformer_state_dict.pth', gb: 0.95, bytes: 950058171,
        sha256: '8aff082f2df5c3bc52759db0c865c7ee772ae6400b860d1b7e90413f2defb67c' },
      'hunyuan_foley/siglip2/model.safetensors': { repo: 'google/siglip2-base-patch16-512', path: 'model.safetensors', gb: 1.50, bytes: 1503344520,
        sha256: 'fe0e601c625e69eed8e73500d39e9b6164403fe03db8048e87913c3cefbbb3fe' },
      'hunyuan_foley/siglip2/config.json': { repo: 'google/siglip2-base-patch16-512', path: 'config.json', gb: 0.00, bytes: 276,
        sha256: 'a15bc39fbcd92498dea6d5d3cb2b0d8b9ba389d6a3f2b565ea66128a2d141934' },
      'hunyuan_foley/siglip2/preprocessor_config.json': { repo: 'google/siglip2-base-patch16-512', path: 'preprocessor_config.json', gb: 0.00, bytes: 394,
        sha256: '63ff380d3e424f93e6fbca5cc8e74eeed882e96fd6be2b7728aed308f3ad1513' },
      'hunyuan_foley/clap/pytorch_model.bin': { repo: 'laion/larger_clap_general', path: 'pytorch_model.bin', gb: 0.78, bytes: 776444665,
        sha256: '314eb00cce6ad68d25237b8446b659ccdb136ed4672c1bca470f142f72455026' },
      'hunyuan_foley/clap/config.json': { repo: 'laion/larger_clap_general', path: 'config.json', gb: 0.00, bytes: 643,
        sha256: '6268f76a067e3104bf9001e97d7dcc0fcfb16f3086cfb478ee72d95900d7fc1d' },
      'hunyuan_foley/clap/merges.txt': { repo: 'laion/larger_clap_general', path: 'merges.txt', gb: 0.00, bytes: 456318,
        sha256: '1ce1664773c50f3e0cc8842619a93edc4624525b728b188a9e0be33b7726adc5' },
      'hunyuan_foley/clap/vocab.json': { repo: 'laion/larger_clap_general', path: 'vocab.json', gb: 0.00, bytes: 798293,
        sha256: 'ed19656ea1707df69134c4af35c8ceda2cc9860bf2c3495026153a133670ab5e' },
    } },
  drama3: { name: 'ComfyUI-Drama3', repo: 'PedroMarinhoDev/ComfyUI-Drama3', commit: '67a733a96890637dc27b1914974ad00c569405fb', date: '2026-10-17',
    folder: 'ComfyUI-Drama3', classes: ['Drama3Loader', 'Drama3CodecLoader', 'Drama3EncodeVoice', 'Drama3Generate', 'Drama3Decode', 'Qwen3ASRLoader', 'Qwen3ASRTranscribe'], cloud: false },
  qwentts: { name: 'ComfyUI-Qwen-TTS', repo: 'flybirdxx/ComfyUI-Qwen-TTS', commit: 'a1328c8a731eff82cf4c205b31bdfb7f29d817f4', date: '2026-09-22',
    folder: 'ComfyUI-Qwen-TTS', classes: ['FB_Qwen3TTSVoiceClone'], cloud: false,
    // It would replace the onnxruntime other packs use, and its speech nodes never import it.
    skip: ['onnxruntime-openvino'],
    files: {
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/model.safetensors': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'model.safetensors', gb: 3.86, bytes: 3857413744,
        sha256: '38fc7fc51c5e776e840414b6fd443962e9411b9654888fd7913e4da643cb857c' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/config.json': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'config.json', gb: 0.00, bytes: 4494,
        sha256: 'b4f01752d15a488abde3e1ab44723ae4f4b9e68a4037257b098b3737893cc1f9' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/generation_config.json': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'generation_config.json', gb: 0.00, bytes: 245,
        sha256: 'f1b90b4513f3b34c62851049e2492d7b4c5940daf1276f89c82b8ef04127f3aa' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/merges.txt': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'merges.txt', gb: 0.00, bytes: 1671839,
        sha256: '599bab54075088774b1733fde865d5bd747cbcc7a547c5bc12610e874e26f5e3' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/preprocessor_config.json': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'preprocessor_config.json', gb: 0.00, bytes: 127,
        sha256: 'efdde1022ea9d76928bf7a9cd53139138f5ba2e466e837f08f6105ab1af1c119' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/tokenizer_config.json': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'tokenizer_config.json', gb: 0.00, bytes: 7344,
        sha256: 'dc3c31c3bdaedd5016382bb3cbe07323026775ad51f5a4fb564505992ae4a670' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/vocab.json': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'vocab.json', gb: 0.00, bytes: 2776833,
        sha256: 'ca10d7e9fb3ed18575dd1e277a2579c16d108e32f27439684afa0e10b1440910' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/speech_tokenizer/model.safetensors': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'speech_tokenizer/model.safetensors', gb: 0.68, bytes: 682293092,
        sha256: '836b7b357f5ea43e889936a3709af68dfe3751881acefe4ecf0dbd30ba571258' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/speech_tokenizer/config.json': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'speech_tokenizer/config.json', gb: 0.00, bytes: 2336,
        sha256: 'ee65bb901c876664ab8707c487157aa1a6ee57c65969b28fb5ec9dc211e68167' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/speech_tokenizer/configuration.json': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'speech_tokenizer/configuration.json', gb: 0.00, bytes: 76,
        sha256: '6bc26d64eb5024b4d1dab5a52371958b429256d6c9d59787f1f5294a54e0cebd' },
      'qwen-tts/Qwen3-TTS-12Hz-1.7B-Base/speech_tokenizer/preprocessor_config.json': { repo: 'Qwen/Qwen3-TTS-12Hz-1.7B-Base', path: 'speech_tokenizer/preprocessor_config.json', gb: 0.00, bytes: 234,
        sha256: 'fcb3805e597e786d4067706e602f6688524640f8d3396790e2e09b5942fcbdfb' },
      'qwen-tts/Qwen3-TTS-Tokenizer-12Hz/model.safetensors': { repo: 'Qwen/Qwen3-TTS-Tokenizer-12Hz', path: 'model.safetensors', gb: 0.68, bytes: 682293092,
        sha256: '836b7b357f5ea43e889936a3709af68dfe3751881acefe4ecf0dbd30ba571258' },
      'qwen-tts/Qwen3-TTS-Tokenizer-12Hz/config.json': { repo: 'Qwen/Qwen3-TTS-Tokenizer-12Hz', path: 'config.json', gb: 0.00, bytes: 2336,
        sha256: 'ee65bb901c876664ab8707c487157aa1a6ee57c65969b28fb5ec9dc211e68167' },
      'qwen-tts/Qwen3-TTS-Tokenizer-12Hz/configuration.json': { repo: 'Qwen/Qwen3-TTS-Tokenizer-12Hz', path: 'configuration.json', gb: 0.00, bytes: 76,
        sha256: '6bc26d64eb5024b4d1dab5a52371958b429256d6c9d59787f1f5294a54e0cebd' },
      'qwen-tts/Qwen3-TTS-Tokenizer-12Hz/preprocessor_config.json': { repo: 'Qwen/Qwen3-TTS-Tokenizer-12Hz', path: 'preprocessor_config.json', gb: 0.00, bytes: 234,
        sha256: 'fcb3805e597e786d4067706e602f6688524640f8d3396790e2e09b5942fcbdfb' },
    } },
}

// Every runtime: FreeVideo's own env, and the node packs. A pack is small and installs in a minute or two.
export const RUNTIMES = {
  ...ENVS,
  ...Object.fromEntries(Object.entries(NODE_PACKS).map(([id, p]) => [id, { name: p.name, pack: true, nodes: p.classes, vramGb: 0, gb: 1, minutes: [1, 3], cloud: p.cloud }])),
}
const usesRuntime = (runtime, type) => (Array.isArray(runtime.nodes) ? runtime.nodes.includes(type) : runtime.nodes.test(type))

// The models folders a Pod makes and points ComfyUI at: every loader's folder and every file's.
// A new loader brings its folder with it, so the boot script and the status server never lag.
export const MODEL_DIRS = [...new Set([...Object.values(LOADERS).flatMap((inputs) => Object.values(inputs)), ...Object.values(MODEL_FILES).map((f) => f.dir)])]

// A pack's own files, shaped like a loader's: Comfy Cloud has them when it has the pack.
const packFiles = (id) => Object.entries(NODE_PACKS[id]?.files || {}).map(([key, f]) => {
  const at = key.lastIndexOf('/')
  return { ...f, dir: key.slice(0, at), name: key.slice(at + 1), vramGb: 0, cloud: NODE_PACKS[id].cloud, label: NODE_PACKS[id].name }
})
// The folders packs read themselves, subfolders included. The Pod links each top folder from
// ComfyUI/models to the volume; ComfyUI's own folder list never names them.
export const PACK_DIRS = [...new Set(Object.keys(NODE_PACKS).flatMap((id) => packFiles(id).map((f) => f.dir)))]
export const PACK_ROOTS = [...new Set(PACK_DIRS.map((d) => d.split('/')[0]))]

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
    for (const [id, e] of Object.entries(RUNTIMES)) if (usesRuntime(e, node?.class_type || '')) out.add(id)
  }
  return [...out].map((id) => {
    const e = RUNTIMES[id]
    return { runtime: id, name: e.name, gb: e.gb, vramGb: e.vramGb, minutes: e.minutes, cloud: Boolean(e.cloud), ...(e.pack ? { pack: true } : {}),
      arch: e.arch || null, refSec: e.refSec || 0 }
  })
}

// Everything a Pod needs for a graph: model files to download, its packs' own files, and runtimes to install.
export function podNeedsOf(graph) {
  const runtimes = runtimesOf(graph)
  const classes = new Set(Object.values(graph || {}).map((n) => n?.class_type))
  const files = new Map(modelFilesOf(graph).map((f) => [`${f.dir}/${f.name}`, f]))
  for (const r of runtimes) {
    for (const f of packFiles(r.runtime)) if ((!f.for || classes.has(f.for)) && !files.has(`${f.dir}/${f.name}`)) files.set(`${f.dir}/${f.name}`, f)
  }
  return [...files.values(), ...runtimes]
}

// Files a run needs that Comfy Cloud does not have.
export const notOnCloud = (files) => files.filter((f) => !f.cloud)

export const minVramOf = (files) => Math.max(0, ...files.map((f) => f.vramGb || 0))
// The GPU architecture a run needs, or null when any will do.
export const archOf = (files) => files.find((f) => f.arch)?.arch || null
export const volumeFor = (files) => Math.ceil(files.reduce((n, f) => n + f.gb, 0) + HEADROOM_GB)
