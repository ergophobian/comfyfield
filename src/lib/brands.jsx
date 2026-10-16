// Company behind each model, for logos in the picker. Logos live in public/logos.
export const brands = {
  google: { name: 'Google', logo: '/logos/google.svg' },
  gemini: { name: 'Gemini', logo: '/logos/gemini.svg' },
  openai: { name: 'OpenAI', logo: '/logos/openai.svg' },
  bytedance: { name: 'ByteDance', logo: '/logos/bytedance.svg' },
  kling: { name: 'Kling', logo: '/logos/kling.png' },
  minimax: { name: 'MiniMax', logo: '/logos/minimax.png' },
  alibaba: { name: 'Alibaba', logo: '/logos/alibabacloud.svg' },
  bfl: { name: 'Black Forest Labs', logo: '/logos/bfl.png' },
  elevenlabs: { name: 'ElevenLabs', logo: '/logos/elevenlabs.svg' },
  comfy: { name: 'ComfyUI', logo: '/logos/comfy.png' },
  fal: { name: 'fal', logo: '/logos/fal.png' },
}

const rules = [
  [/kling/, 'kling'],
  [/flux|bfl|black-forest/, 'bfl'],
  [/nano-banana|gemini|imagen|g-tts|g-nano/, 'gemini'],
  [/veo|lyria|google/, 'google'],
  [/openai|gpt-image|sora|dall/, 'openai'],
  [/bytedance|seedance|seedream|omnihuman/, 'bytedance'],
  [/minimax|hailuo/, 'minimax'],
  [/alibaba|wan-|wan\/|qwen/, 'alibaba'],
  [/elevenlabs|^el-/, 'elevenlabs'],
  [/^comfy-/, 'comfy'],
]

export function brandOf(model) {
  const key = `${model.id} ${model.model || ''}`.toLowerCase()
  const hit = rules.find(([re]) => re.test(key))
  return hit ? hit[1] : model.provider === 'fal' ? 'fal' : model.provider
}

export function Logo({ brand, size = 16 }) {
  const b = brands[brand] || brands.fal
  return <img className="logo" src={b.logo} alt="" width={size} height={size} />
}
