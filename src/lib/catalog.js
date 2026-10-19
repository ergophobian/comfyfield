// Google prices are list-price estimates; check ai.google.dev/pricing. fal prices come live from fal.
// Each model's own canvas; formats on that model use the same. Qwen-Image 2.1 and MiniMax H3 want
// multiples of 32 (H3 a 768 px short edge), LTX-2.5 multiples of 64, Wan 2.2 multiples of 16.
export const qwenImageSizes = { '16:9': [1664, 928], '9:16': [928, 1664], '1:1': [1344, 1344], '4:5': [1152, 1440] }
export const h3Sizes = { '16:9': [1344, 768], '9:16': [768, 1344], '1:1': [768, 768], '4:5': [768, 960], '21:9': [1536, 672] }
export const ltx25Sizes = { '16:9': [1280, 704], '9:16': [704, 1280], '1:1': [960, 960], '4:5': [768, 960] }
export const wanSizes = { '16:9': [1280, 720], '9:16': [720, 1280], '1:1': [960, 960], '4:5': [768, 960] }

// Pinned models in the composer. Any other fal model can be picked from the Models page.
// provider 'comfy' runs public/workflows/<workflow>.json; 'fal' fills inputs from the model's schema.
export const models = [
  // Router prices: docs.comfy.org/development/comfy-router/pricing, checked 2026-10-19.
  { id: 'comfy-router-flux', kind: 'image', provider: 'comfyRouter', name: 'Flux 2 Pro', note: 'Images and edits with up to nine references. Uses Comfy credits.', model: 'bfl/flux-2-pro', maxImages: 9, price: { amount: 0.266 / 211, unit: 'gpu-second' } },
  { id: 'comfy-router-flux-max', kind: 'image', provider: 'comfyRouter', name: 'Flux 2 max', note: 'Detailed images and edits with up to nine references.', model: 'bfl/flux-2-max', maxImages: 9, price: { amount: 0.266 / 211, unit: 'gpu-second' } },
  { id: 'comfy-router-kontext', kind: 'image', provider: 'comfyRouter', name: 'Flux Kontext pro', note: 'Prompted edits with up to four references.', model: 'bfl/flux-kontext-pro', maxImages: 4, aspects: ['1:1', '16:9', '9:16', '4:5'], price: { amount: 0.04, unit: 'image' } },
  { id: 'comfy-router-photon', kind: 'image', provider: 'comfyRouter', name: 'Photon flash', note: 'Low cost images from a text prompt.', model: 'luma/photon-flash-1', aspects: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'], price: { amount: 0.5733 / 211, unit: 'image' } },
  { id: 'comfy-router-seedream', kind: 'image', provider: 'comfyRouter', name: 'Seedream 5.0 flash', note: 'Low cost images and edits with up to ten references.', model: 'byteplus/seedream-5-0-flash-260915', maxImages: 10, price: { amount: 5.4311 / 211, unit: 'image' } },
  { id: 'comfy-router-seedance', kind: 'video', provider: 'comfyRouter', name: 'Seedance 2.5', note: 'Video from text, a start image or multiple references. Uses Comfy credits.', model: 'byteplus/dreamina-seedance-2-5-260628', maxImages: 9, aspects: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'], durations: [5, 8, 10], price: { amount: 15.301, unit: '1m tokens', estimate: true } },
  { id: 'comfy-router-seedance-fast', kind: 'video', provider: 'comfyRouter', name: 'Seedance 1.0 pro fast', note: 'Low cost video from text or a start image, at 720p.', model: 'byteplus/seedance-1-0-pro-fast-251015', maxImages: 1, aspects: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'], durations: [5, 8, 10], price: { amount: 1, unit: '1m tokens', estimate: true } },
  { id: 'comfy-router-ltx', kind: 'video', provider: 'comfyRouter', name: 'Ltx 2.5 fast', note: 'Video with sound from a text prompt, at 720p.', model: 'ltx/ltx-2-5-fast', aspects: ['16:9', '9:16'], durations: [2, 3, 4, 5, 6, 8, 10], price: { amount: 0.1287, unit: 'second' } },
  { id: 'comfy-router-speech', kind: 'audio', provider: 'comfyRouter', name: 'ElevenLabs v4 turbo', note: 'Low cost speech in the Rachel voice. Uses Comfy credits.', model: 'elevenlabs/eleven_v4_turbo', mode: 'speech', price: { amount: 0.0572, unit: '1000 characters' } },
  { id: 'comfy-router-sfx', kind: 'audio', provider: 'comfyRouter', name: 'ElevenLabs sound effects', note: 'Describe a sound. Creates a five second clip.', model: 'elevenlabs/eleven_sfx_v2', mode: 'sfx', price: { amount: 0.14 / 60, unit: 'second' } },
  { id: 'comfy-ltx-i2v', kind: 'video', provider: 'comfy', name: 'LTX image to video', note: 'LTX Video 2B on Comfy Cloud or a Pod. Attach a start image.', workflow: 'ltx_i2v', durations: [3, 5, 8] },
  { id: 'comfy-h3-i2v', kind: 'video', provider: 'comfy', name: 'MiniMax H3 image to video', note: 'Comfy partner node. Attach a start image. Uses Comfy credits.', workflow: 'h3_i2v', durations: [5, 8, 10] },
  { id: 'comfy-flux', kind: 'image', provider: 'comfy', name: 'FLUX', note: 'On Comfy Cloud or a Pod', workflow: 'image_flux' },
  { id: 'comfy-sdxl', kind: 'image', provider: 'comfy', name: 'SDXL', note: 'On Comfy Cloud or a Pod', workflow: 'image_sdxl' },
  // Session keeps the newest image weights; Instant uses the compatible Cloud alternates below.
  // `pod`: a model file is not on Comfy Cloud (pod-checks keeps this in step with shared/modelFiles.js).
  { id: 'comfy-flux3-klein', kind: 'image', provider: 'comfy', name: 'FLUX 3 Klein', note: 'Session uses Flux 3 Klein. Instant uses Flux.2 Klein 4B.', workflow: 'flux3_klein_t2i', cloudWorkflow: 'flux3_klein_t2i_cloud', pod: true },
  { id: 'comfy-qwen-image21', kind: 'image', provider: 'comfy', name: 'Qwen-Image 2.1', note: 'Session uses Qwen-Image 2.1. Instant uses Qwen Image 2512 or Edit 2511.', workflow: 'qwen_image21_t2i', imageWorkflow: 'qwen_edit', cloudWorkflow: 'qwen_image21_t2i_cloud', cloudImageWorkflow: 'qwen_edit_cloud', pod: true,
    sizes: qwenImageSizes },
  // On Comfy Cloud too: every file is in its listing. HiDream-O1 was trained at about 4 MP, so it keeps its own canvas.
  { id: 'comfy-z-image-turbo', kind: 'image', provider: 'comfy', name: 'Z-Image Turbo', note: 'Open weights from Alibaba Tongyi. On Comfy Cloud or a Pod.', workflow: 'z_image' },
  { id: 'comfy-hidream-o1', kind: 'image', provider: 'comfy', name: 'HiDream-O1', note: 'Open weights from HiDream. On Comfy Cloud or a Pod.', workflow: 'hidream',
    sizes: { '16:9': [2560, 1440], '9:16': [1440, 2560], '1:1': [2048, 2048], '4:5': [1792, 2304] } },
  { id: 'comfy-qwen-image-edit-2511', kind: 'image', provider: 'comfy', name: 'Qwen-Image Edit 2511', note: 'Open weights from Alibaba Qwen. Attach an image to edit it. On Comfy Cloud or a Pod.', workflow: 'qwen2511_edit', imageWorkflow: 'qwen2511_edit' },
  { id: 'fal:fal-ai/nano-banana-pro', kind: 'image', provider: 'fal', name: 'Nano Banana Pro', note: 'Google, via fal', model: 'fal-ai/nano-banana-pro' },
  { id: 'fal:openai/gpt-image-2', kind: 'image', provider: 'fal', name: 'GPT Image 2', note: 'OpenAI, via fal', model: 'openai/gpt-image-2' },
  { id: 'fal:fal-ai/flux-2-pro', kind: 'image', provider: 'fal', name: 'Flux 2 Pro', note: 'Black Forest Labs, via fal', model: 'fal-ai/flux-2-pro' },

  { id: 'g-nano-banana-pro', kind: 'image', provider: 'google', name: 'Nano Banana Pro', note: 'Gemini 3 Pro Image, your Google key', model: 'gemini-3-pro-image', mode: 'image', price: { amount: 0.134, unit: 'image', estimate: true } },
  { id: 'g-nano-banana-2', kind: 'image', provider: 'google', name: 'Nano Banana 2', note: 'Gemini 3.1 Flash Image, your Google key', model: 'gemini-3.1-flash-image', mode: 'image', price: { amount: 0.067, unit: 'image', estimate: true } },

  { id: 'comfy-ltx', kind: 'video', provider: 'comfy', name: 'LTX Video', note: 'Open weights on Comfy Cloud or a Pod', workflow: 'video_ltx', durations: [3, 5, 8] },
  // Newest open video models: Comfy Cloud has every file, so they run at once, or on a ready Pod.
  // Sizes follow each model's canvas: multiples of 64 for LTX-2.5, a 768 px short edge for H3.
  // podWorkflow: the graph a big enough Pod runs instead. H3 runs on FreeVideo on a 96 GB Pod.
  { id: 'comfy-ltx25', kind: 'video', provider: 'comfy', name: 'LTX-2.5', note: 'Open weights with sound. Attach an image to start from it.', workflow: 'ltx25_t2v', imageWorkflow: 'ltx25_i2v', durations: [5, 8, 10],
    sizes: ltx25Sizes },
  { id: 'comfy-h3', kind: 'video', provider: 'comfy', name: 'MiniMax H3 (open weights)', note: 'Top open video model with sound. Attach an image to start from it. A 96 GB Pod runs it on FreeVideo.', workflow: 'h3_open_t2v', imageWorkflow: 'h3_open_i2v', podWorkflow: 'h3_freevideo_t2v', podImageWorkflow: 'h3_freevideo_i2v', durations: [5, 8, 10],
    sizes: h3Sizes },
  { id: 'comfy-wan22', kind: 'video', provider: 'comfy', name: 'Wan 2.2', note: 'Open weights from Alibaba Wan. Attach a start image, and a last frame to end on. On Comfy Cloud or a Pod.', workflow: 'wan22_t2v', imageWorkflow: 'wan22_i2v', durations: [5],
    sizes: wanSizes },
  { id: 'fal:bytedance/seedance-2.5/text-to-video', kind: 'video', provider: 'fal', name: 'Seedance 2.5', note: 'ByteDance, via fal', model: 'bytedance/seedance-2.5/text-to-video' },
  { id: 'fal:fal-ai/kling-video/v3/pro/text-to-video', kind: 'video', provider: 'fal', name: 'Kling 3 Pro', note: 'Kling, via fal', model: 'fal-ai/kling-video/v3/pro/text-to-video' },
  { id: 'fal:minimax/h3/text-to-video', kind: 'video', provider: 'fal', name: 'MiniMax H3', note: 'MiniMax, via fal', model: 'minimax/h3/text-to-video' },
  { id: 'fal:alibaba/wan-3.0/text-to-video', kind: 'video', provider: 'fal', name: 'Wan 3.0', note: 'Alibaba, via fal', model: 'alibaba/wan-3.0/text-to-video' },

  { id: 'g-veo', kind: 'video', provider: 'google', name: 'Veo 3.1', note: 'Video with sound, your Google key', model: 'veo-3.1-generate-preview', mode: 'video', durations: [4, 6, 8], price: { amount: 0.4, unit: 'second', estimate: true } },
  { id: 'g-veo-fast', kind: 'video', provider: 'google', name: 'Veo 3.1 Fast', note: 'Cheaper and quicker', model: 'veo-3.1-fast-generate-preview', mode: 'video', durations: [4, 6, 8], price: { amount: 0.15, unit: 'second', estimate: true } },
  { id: 'g-veo-lite', kind: 'video', provider: 'google', name: 'Veo 3.1 Lite', note: 'Lowest cost Veo', model: 'veo-3.1-lite-generate-preview', mode: 'video', durations: [4, 6, 8], price: { amount: 0.05, unit: 'second', estimate: true } },

  { id: 'g-tts', kind: 'audio', provider: 'google', name: 'Gemini voice', note: 'Text to speech, your Google key', model: 'gemini-3.8-flash-tts', mode: 'speech' },
  { id: 'el-speech', kind: 'audio', provider: 'elevenlabs', name: 'ElevenLabs voice', note: 'Text to speech with your key', mode: 'speech' },
  { id: 'el-sfx', kind: 'audio', provider: 'elevenlabs', name: 'ElevenLabs sound effects', note: 'Describe a sound', mode: 'sfx' },
  { id: 'fal:minimax/music-3', kind: 'audio', provider: 'fal', name: 'MiniMax Music 3', note: 'Songs, via fal', model: 'minimax/music-3' },
]

// A writer is a text service, separate from the media picker.
export const routerWriterModel = 'openai/gpt-4.1-nano'

// Format graphs a big enough Pod runs on FreeVideo instead, as the catalog's H3 rows do.
export const podWorkflows = { h3_flf2v: 'h3_freevideo_flf2v' }

// Instant alternates. Session keeps the original graph and its newer model weights.
export const cloudWorkflows = {
  birefnet_qwen_background: 'birefnet_qwen_background_cloud',
  birefnet_video_matte_scene: 'birefnet_video_matte_scene_cloud',
  flux3_klein_t2i: 'flux3_klein_t2i_cloud',
  flux_character_set: 'flux_character_set_cloud',
  flux_look: 'flux_look_cloud',
  flux_look_ref: 'flux_look_ref_cloud',
  flux_trellis2: 'flux_trellis2_cloud',
  h3_loop: 'h3_loop_cloud',
  h3_truck_ad: 'h3_truck_ad_cloud',
  klein_character: 'klein_character_cloud',
  klein_character_swap: 'klein_character_swap_cloud',
  klein_edit: 'klein_edit_cloud',
  klein_edit_canvas: 'klein_edit_canvas_cloud',
  klein_h3: 'klein_h3_cloud',
  klein_headshot: 'klein_headshot_cloud',
  klein_ltx: 'klein_ltx_cloud',
  klein_moodboard: 'klein_moodboard_cloud',
  klein_retouch: 'klein_retouch_cloud',
  qwen_character_sheet: 'qwen_character_sheet_cloud',
  qwen_edit: 'qwen_edit_cloud',
  qwen_edit_mockup: 'qwen_edit_mockup_cloud',
  qwen_edit_outpaint: 'qwen_edit_outpaint_cloud',
  qwen_edit_place_product: 'qwen_edit_place_product_cloud',
  qwen_edit_style_ref: 'qwen_edit_style_ref_cloud',
  qwen_edit_try_on: 'qwen_edit_try_on_cloud',
  qwen_edit_variants: 'qwen_edit_variants_cloud',
  qwen_h3: 'qwen_h3_cloud',
  qwen_image21_t2i: 'qwen_image21_t2i_cloud',
  qwen_image_logo: 'qwen_image_logo_cloud',
  qwen_image_ref: 'qwen_image_ref_cloud',
  qwen_ltx: 'qwen_ltx_cloud',
  qwen_mockup_ltx: 'qwen_mockup_ltx_cloud',
  qwen_multi_h3: 'qwen_multi_h3_cloud',
  qwen_restore: 'qwen_restore_cloud',
  qwen_try_on_h3: 'qwen_try_on_h3_cloud',
  qwen_zoom_grid: 'qwen_zoom_grid_cloud',
  storyboard: 'storyboard_cloud',
  storyboard_ref: 'storyboard_ref_cloud',
  trellis2_character: 'trellis2_character_cloud',
}

// fal catalog categories the composer can run from a text prompt.
export const falCategories = [
  { id: 'text-to-image', label: 'Image', kind: 'image' },
  { id: 'text-to-video', label: 'Video', kind: 'video' },
  { id: 'text-to-speech', label: 'Speech', kind: 'audio' },
  { id: 'text-to-audio', label: 'Sound and music', kind: 'audio' },
]

export const providerInfo = {
  comfy: { name: 'ComfyUI', blurb: 'Your Comfy API key runs open models on Comfy Cloud in seconds, on a paid Comfy plan. For a long session, add your RunPod key on the RunPod card and start a Pod from the top bar: while it runs, ComfyUI runs use it. The key also unlocks hosted models through Comfy Router.', fields: [
    { id: 'key', label: 'Comfy API key', placeholder: 'From platform.comfy.org', secret: true },
  ], link: 'https://platform.comfy.org/profile/api-keys' },
  // page: where the rest of this service's settings live.
  runpod: { name: 'RunPod', blurb: 'Your RunPod key starts a Pod: a GPU that runs ComfyUI for you, billed by the minute. It suits long sessions; Comfy Cloud covers a couple of runs. Pick the GPU, the daily cap and the idle shutdown on the Pods page.', fields: [
    { id: 'key', label: 'API key', placeholder: 'RunPod API key', secret: true },
  ], link: 'https://www.runpod.io/console/user/settings', page: { to: '/pods', label: 'Open the Pods page' } },
  fal: { name: 'fal', blurb: 'One key for hosted FLUX, Kling, Seedance, Veo and more. Pay per run.', fields: [
    { id: 'key', label: 'API key', placeholder: 'fal key', secret: true },
  ], link: 'https://fal.ai/dashboard/keys' },
  google: { name: 'Google AI', blurb: 'Gemini API key from AI Studio. Veo 3.1, Nano Banana and Gemini voices.', fields: [
    { id: 'key', label: 'API key', placeholder: 'Gemini API key', secret: true },
  ], link: 'https://aistudio.google.com/apikey' },
  elevenlabs: { name: 'ElevenLabs', blurb: 'Your ElevenLabs key for voices and sound effects.', fields: [
    { id: 'key', label: 'API key', placeholder: 'xi-api-key', secret: true },
  ], link: 'https://elevenlabs.io/app/settings/api-keys' },
}

// Account sign-ins for later. These need each site's own login, not an API key.
export const plannedAccounts = [
  { name: 'ChatGPT', how: 'Sign in through the local Codex CLI to use your ChatGPT plan for image generation.' },
  { name: 'Higgsfield', how: 'Higgsfield API key from their developer platform.' },
  { name: 'Kling', how: 'Kling developer access key and secret. Separate from the Kling app subscription.' },
  { name: 'Google Flow', how: 'No public API. Would need a browser extension driving your own Flow tab.' },
]

export const aspects = ['1:1', '16:9', '9:16', '4:5']
export const defaultDurations = [5, 8, 10]
// Formats also ask for 4:3 and 21:9; both are multiples of 32, as Qwen and FLUX like.
export const aspectSize = { '1:1': [1024, 1024], '16:9': [1280, 720], '9:16': [720, 1280], '4:5': [896, 1120], '4:3': [1152, 864], '21:9': [1568, 672] }

export const styles = [
  { group: 'Camera', items: [
    { id: 'dolly-in', name: 'Dolly in', prompt: 'slow dolly in toward the subject, shallow depth of field' },
    { id: 'crane-up', name: 'Crane up', prompt: 'camera cranes up revealing the landscape' },
    { id: 'orbit', name: 'Orbit', prompt: 'smooth 180 degree orbit around the subject' },
    { id: 'fpv', name: 'FPV dive', prompt: 'fpv drone dive through the scene at high speed' },
    { id: 'handheld', name: 'Handheld', prompt: 'handheld documentary camera, subtle shake, natural light' },
  ] },
  { group: 'Effects', items: [
    { id: 'melt', name: 'Melt', prompt: 'the subject slowly melts into liquid chrome' },
    { id: 'float', name: 'Zero gravity', prompt: 'everything begins to float weightlessly upward' },
    { id: 'giant', name: 'City giant', prompt: 'the subject grows to a giant towering over the city' },
    { id: 'neon', name: 'Neon outline', prompt: 'the subject is traced in glowing neon outlines' },
    { id: 'clay', name: 'Claymation', prompt: 'the scene turns into stop motion claymation' },
  ] },
]
