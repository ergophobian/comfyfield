// Pinned models in the composer. Any other fal model can be picked from the Models page.
// provider 'comfy' runs public/workflows/<workflow>.json; 'fal' fills inputs from the model's schema.
export const models = [
  { id: 'comfy-flux', kind: 'image', provider: 'comfy', name: 'FLUX', note: 'On your ComfyUI', workflow: 'image_flux' },
  { id: 'comfy-sdxl', kind: 'image', provider: 'comfy', name: 'SDXL', note: 'On your ComfyUI', workflow: 'image_sdxl' },
  { id: 'fal:fal-ai/nano-banana-pro', kind: 'image', provider: 'fal', name: 'Nano Banana Pro', note: 'Google, via fal', model: 'fal-ai/nano-banana-pro' },
  { id: 'fal:openai/gpt-image-2', kind: 'image', provider: 'fal', name: 'GPT Image 2', note: 'OpenAI, via fal', model: 'openai/gpt-image-2' },
  { id: 'fal:fal-ai/flux-2-pro', kind: 'image', provider: 'fal', name: 'Flux 2 Pro', note: 'Black Forest Labs, via fal', model: 'fal-ai/flux-2-pro' },

  { id: 'comfy-ltx', kind: 'video', provider: 'comfy', name: 'LTX Video', note: 'Open weights on your ComfyUI', workflow: 'video_ltx', durations: [3, 5, 8] },
  { id: 'fal:bytedance/seedance-2.5/text-to-video', kind: 'video', provider: 'fal', name: 'Seedance 2.5', note: 'ByteDance, via fal', model: 'bytedance/seedance-2.5/text-to-video' },
  { id: 'fal:fal-ai/kling-video/v3/pro/text-to-video', kind: 'video', provider: 'fal', name: 'Kling 3 Pro', note: 'Kling, via fal', model: 'fal-ai/kling-video/v3/pro/text-to-video' },
  { id: 'fal:minimax/h3/text-to-video', kind: 'video', provider: 'fal', name: 'MiniMax H3', note: 'MiniMax, via fal', model: 'minimax/h3/text-to-video' },
  { id: 'fal:alibaba/wan-3.0/text-to-video', kind: 'video', provider: 'fal', name: 'Wan 3.0', note: 'Alibaba, via fal', model: 'alibaba/wan-3.0/text-to-video' },

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
  comfy: { name: 'ComfyUI', blurb: 'Your own ComfyUI, local or hosted. Runs the open workflows in this repo.', fields: [
    { id: 'url', label: 'Server URL', placeholder: 'http://127.0.0.1:8188' },
    { id: 'key', label: 'Comfy API key (optional)', placeholder: 'Needed for partner nodes like Kling, Veo and Seedance', secret: true },
  ], link: 'https://docs.comfy.org' },
  fal: { name: 'fal', blurb: 'One key for hosted FLUX, Kling, Seedance, Veo and more. Pay per run.', fields: [
    { id: 'key', label: 'API key', placeholder: 'fal key', secret: true },
  ], link: 'https://fal.ai/dashboard/keys' },
  google: { name: 'Google AI', blurb: 'Gemini API key from AI Studio, for Veo and Gemini image models.', fields: [
    { id: 'key', label: 'API key', placeholder: 'Gemini API key', secret: true },
  ], link: 'https://aistudio.google.com/apikey', soon: true },
  elevenlabs: { name: 'ElevenLabs', blurb: 'Your ElevenLabs key for voices and sound effects.', fields: [
    { id: 'key', label: 'API key', placeholder: 'xi-api-key', secret: true },
  ], link: 'https://elevenlabs.io/app/settings/api-keys' },
}

// Account sign-ins we want next. None of these offer third-party OAuth today; see the README.
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
