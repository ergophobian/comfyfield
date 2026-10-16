// Pure input mapping shared by the browser and the Node core (server, CLI, MCP).
import { aspectSize, defaultDurations } from '../src/lib/catalog.js'

// LTX wants dimensions divisible by 32 and frame counts of 8n + 1.
export const videoSize = (a) => aspectSize[a].map((n) => Math.round((n * 0.6) / 32) * 32)
export const falSize = { '1:1': 'square_hd', '16:9': 'landscape_16_9', '9:16': 'portrait_16_9', '4:5': 'portrait_4_3' }

export const num = (v) => parseFloat(String(v))

// Fills {{name}} placeholders in a ComfyUI workflow graph.
export function fill(node, vars) {
  if (typeof node === 'string') {
    const whole = node.match(/^\{\{(\w+)\}\}$/)
    if (whole) return vars[whole[1]]
    return node.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k])
  }
  if (Array.isArray(node)) return node.map((n) => fill(n, vars))
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, fill(v, vars)]))
  }
  return node
}

export function comfyVars(kind, o) {
  const [width, height] = kind === 'video' ? videoSize(o.aspect) : aspectSize[o.aspect]
  return { prompt: o.prompt, width, height, count: o.count, frames: o.duration * 24 + 1, seed: Math.floor(Math.random() * 2 ** 31), ...o.params, ...o.fields }
}

// Durations a model accepts, in seconds, from its fal schema properties.
export function durationsFromProps(props) {
  const d = props.duration
  if (!d) return []
  return d.enum ? d.enum.map(num).filter((n) => !Number.isNaN(n)) : defaultDurations
}

// Maps the composer's settings onto whatever inputs this fal model declares.
const singleImage = ['image_url', 'start_image_url', 'first_frame_url', 'input_image_url', 'image']
const manyImages = ['image_urls', 'input_image_urls', 'reference_image_urls']

export function falInput(props, o) {
  const input = {}
  if (o.prompt) input[props.prompt || !props.text ? 'prompt' : 'text'] = o.prompt
  const images = o.images || (o.image ? [o.image] : [])
  if (images.length) {
    const many = manyImages.find((k) => props[k])
    const one = singleImage.find((k) => props[k])
    if (many && (!one || images.length > 1 || many === 'image_urls')) input[many] = images
    else if (one) input[one] = images[0]
  }
  Object.assign(input, o.fields)
  if (props.aspect_ratio) {
    const e = props.aspect_ratio.enum
    if (!e || e.includes(o.aspect)) input.aspect_ratio = o.aspect
  }
  if (props.image_size && !props.aspect_ratio) {
    const e = props.image_size.enum
    if (!e || e.includes(falSize[o.aspect])) input.image_size = falSize[o.aspect]
  }
  if (props.num_images) input.num_images = o.count
  if (props.duration && o.duration) {
    const d = props.duration
    const numeric = d.enum?.filter((v) => !Number.isNaN(num(v)))
    if (numeric?.length) {
      input.duration = numeric.reduce((best, v) => (Math.abs(num(v) - o.duration) < Math.abs(num(best) - o.duration) ? v : best))
    } else {
      input.duration = d.type === 'string' ? String(o.duration) : o.duration
    }
  }
  return { ...input, ...o.params }
}

// Price per run in USD, or null when the unit can't be estimated from the settings.
export function estimate(model, meta, o) {
  const price = meta?.price
  if (!price) return null
  const unit = price.unit.toLowerCase()
  const [w, h] = aspectSize[o.aspect] || [1024, 1024]
  const takes = o.takes || 1
  let usd = null
  let approx = Boolean(price.estimate)
  if (unit.includes('megapixel')) usd = price.amount * (w * h) / 1e6 * (o.count || 1)
  else if (unit.includes('image')) usd = price.amount * (o.count || 1)
  else if (unit.includes('second')) usd = price.amount * (o.duration || 5)
  else if (unit.includes('video') || unit.includes('request') || unit.includes('generation')) usd = price.amount
  else if (unit.includes('token') && model.kind === 'video') {
    const [vw, vh] = w >= h ? [1280, 720] : [720, 1280]
    usd = price.amount * (vw * vh * 24 * (o.duration || 5)) / 1024 / 1000
    approx = true
  } else if (unit.includes('character')) {
    usd = price.amount * (o.chars || 0) / (unit.includes('1000') ? 1000 : 1)
    approx = true
  }
  return usd == null ? null : { usd: usd * takes, approx }
}
