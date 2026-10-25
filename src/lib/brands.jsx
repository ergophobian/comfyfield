import { routerBrand } from '../../shared/routerModels.js'
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
  // No logo file yet: these show a letter mark.
  luma: { name: 'Luma AI' },
  lightricks: { name: 'Lightricks' },
  runway: { name: 'Runway' },
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

// A brand's display name, also for a Router partner the app has no entry for.
export const brandName = (brand) => brands[brand]?.name || (brand ? brand.replace(/^\w/, (c) => c.toUpperCase()) : '')

export function brandOf(model) {
  // Router ids start with the partner, which names the company better than the model name does.
  if (model.provider === 'comfyRouter' && model.model) return routerBrand(model.model)
  const key = `${model.id} ${model.model || ''}`.toLowerCase()
  const hit = rules.find(([re]) => re.test(key))
  return hit ? hit[1] : model.provider === 'fal' ? 'fal' : model.provider
}

export function Logo({ brand, size = 16 }) {
  const b = brands[brand] || (brand && brand !== 'fal' && brand !== 'comfyRouter' ? {} : brands.fal)
  if (!b.logo) return <span className="logo logo-mark" aria-hidden="true" style={{ width: size, height: size, '--logo-size': `${size}px` }}>{brandName(brand).slice(0, 1)}</span>
  return <img className="logo" src={b.logo} alt="" width={size} height={size} />
}
