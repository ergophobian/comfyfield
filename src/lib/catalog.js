// Google prices are list-price estimates; check ai.google.dev/pricing. fal prices come live from fal.
// Pinned models in the composer. Any other fal model can be picked from the Models page.
// provider 'comfy' runs public/workflows/<workflow>.json; 'fal' fills inputs from the model's schema.
export const models = [
  { id: 'comfy-router-flux', kind: 'image', provider: 'comfyRouter', name: 'Flux 2 Pro', note: 'Hosted through Comfy Router', model: 'bfl/flux-2-pro' },
  { id: 'comfy-router-seedance', kind: 'video', provider: 'comfyRouter', name: 'Seedance 2.5', note: 'Hosted through Comfy Router', model: 'byteplus/dreamina-seedance-2-5-260628', durations: [5, 8, 10] },
  { id: 'comfy-ltx-i2v', kind: 'video', provider: 'comfy', name: 'LTX image to video', note: 'LTX Video 2B on Local or Comfy Cloud. Attach a start image.', workflow: 'ltx_i2v', durations: [3, 5, 8] },
  { id: 'comfy-h3-i2v', kind: 'video', provider: 'comfy', name: 'MiniMax H3 image to video', note: 'Comfy partner node on Local or Comfy Cloud. Attach a start image. Uses Comfy credits.', workflow: 'h3_i2v', durations: [5, 8, 10] },
  { id: 'comfy-flux', kind: 'image', provider: 'comfy', name: 'FLUX', note: 'On your ComfyUI', workflow: 'image_flux' },
  { id: 'comfy-sdxl', kind: 'image', provider: 'comfy', name: 'SDXL', note: 'On your ComfyUI', workflow: 'image_sdxl' },
  { id: 'fal:fal-ai/nano-banana-pro', kind: 'image', provider: 'fal', name: 'Nano Banana Pro', note: 'Google, via fal', model: 'fal-ai/nano-banana-pro' },
  { id: 'fal:openai/gpt-image-2', kind: 'image', provider: 'fal', name: 'GPT Image 2', note: 'OpenAI, via fal', model: 'openai/gpt-image-2' },
  { id: 'fal:fal-ai/flux-2-pro', kind: 'image', provider: 'fal', name: 'Flux 2 Pro', note: 'Black Forest Labs, via fal', model: 'fal-ai/flux-2-pro' },

  { id: 'g-nano-banana-pro', kind: 'image', provider: 'google', name: 'Nano Banana Pro', note: 'Gemini 3 Pro Image, your Google key', model: 'gemini-3-pro-image', mode: 'image', price: { amount: 0.134, unit: 'image', estimate: true } },
  { id: 'g-nano-banana-2', kind: 'image', provider: 'google', name: 'Nano Banana 2', note: 'Gemini 3.1 Flash Image, your Google key', model: 'gemini-3.1-flash-image', mode: 'image', price: { amount: 0.067, unit: 'image', estimate: true } },

  { id: 'comfy-ltx', kind: 'video', provider: 'comfy', name: 'LTX Video', note: 'Open weights on your ComfyUI', workflow: 'video_ltx', durations: [3, 5, 8] },
  // Newest open video models: Comfy Cloud has every file, so they run at once, or on a ready Pod.
  // Sizes follow each model's canvas: multiples of 64 for LTX-2.5, a 768 px short edge for H3.
  { id: 'comfy-ltx25', kind: 'video', provider: 'comfy', name: 'LTX-2.5', note: 'Open weights with sound. Attach an image to start from it.', workflow: 'ltx25_t2v', imageWorkflow: 'ltx25_i2v', durations: [5, 8, 10],
    sizes: { '16:9': [1280, 704], '9:16': [704, 1280], '1:1': [960, 960], '4:5': [768, 960] } },
  { id: 'comfy-h3', kind: 'video', provider: 'comfy', name: 'MiniMax H3 (open weights)', note: 'Top open video model with sound. Attach an image to start from it.', workflow: 'h3_open_t2v', imageWorkflow: 'h3_open_i2v', durations: [5, 8, 10],
    sizes: { '16:9': [1344, 768], '9:16': [768, 1344], '1:1': [768, 768], '4:5': [768, 960] } },
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

// fal catalog categories the composer can run from a text prompt.
export const falCategories = [
  { id: 'text-to-image', label: 'Image', kind: 'image' },
  { id: 'text-to-video', label: 'Video', kind: 'video' },
  { id: 'text-to-speech', label: 'Speech', kind: 'audio' },
  { id: 'text-to-audio', label: 'Sound and music', kind: 'audio' },
]

export const providerInfo = {
  comfy: { name: 'ComfyUI', blurb: 'Run workflows on your own ComfyUI, or on Comfy Cloud in seconds. For a long session, start a Pod from the top bar: while it runs, ComfyUI runs use it. Your Comfy key also unlocks hosted models through Comfy Router.', fields: [
    { id: 'mode', label: 'Run workflows on', options: [{ value: 'local', label: 'Local' }, { value: 'cloud', label: 'Comfy Cloud + Pod' }] },
    { id: 'url', label: 'Server URL', placeholder: 'http://127.0.0.1:8188' },
    { id: 'key', label: 'Comfy API key', placeholder: 'Required for Cloud, Router and partner nodes', secret: true },
  ], link: 'https://docs.comfy.org' },
  runpod: { name: 'RunPod', blurb: 'Your RunPod key starts a Pod: a GPU that runs ComfyUI for you, billed by the minute. It suits long sessions; Comfy Cloud covers a couple of runs. Once the spend today reaches the daily cap, no new Pod starts.', fields: [
    { id: 'key', label: 'API key', placeholder: 'RunPod API key', secret: true },
    { id: 'cap', label: 'Daily cap in dollars', placeholder: '20' },
  ], link: 'https://www.runpod.io/console/user/settings' },
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
export const aspectSize = { '1:1': [1024, 1024], '16:9': [1280, 720], '9:16': [720, 1280], '4:5': [896, 1120] }

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
