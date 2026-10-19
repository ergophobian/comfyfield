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

// A graph node marked `"_meta": { "optional": "<key>" }` exists only for that file (a second garment,
// an optional reference). Without the file it drops out, with every input linked to it, so those
// inputs must be optional in ComfyUI.
export function dropOptional(graph, vars) {
  const gone = new Set(Object.entries(graph).filter(([, n]) => {
    const key = n?._meta?.optional
    return key && (vars[key] == null || vars[key] === '')
  }).map(([id]) => id))
  if (!gone.size) return graph
  return Object.fromEntries(Object.entries(graph).filter(([id]) => !gone.has(id)).map(([id, node]) => [id, {
    ...node, inputs: Object.fromEntries(Object.entries(node.inputs || {}).filter(([, v]) => !(Array.isArray(v) && gone.has(String(v[0]))))),
  }]))
}

// Upload slots a graph can take besides `image` and `video`.
export const PICTURE_SLOTS = ['image', 'image2', 'image3', 'image4', 'image5']

// `sizes` lets a model use its own canvas per aspect ratio, for example multiples of 64 for LTX-2.5.
// A video edit reads the trimmed part of its clip: `start` and `duration` in seconds. A format's
// pictures fill image, image2, ... in the order it lists them (`slots`, from recipeOptions), and a
// saved character stands in with its first image. Without slots (the composer) attached images fill them.
export function comfyVars(kind, o, sizes) {
  const [width, height] = sizes?.[o.aspect] || (kind === 'video' ? videoSize(o.aspect) : aspectSize[o.aspect])
  const trim = o.trim && o.trim.end > o.trim.start ? o.trim : null
  const seconds = (n) => Math.round(n * 1000) / 1000
  const pictures = o.slots?.pictures || [o.images?.[0] || o.image || o.refs?.find((r) => r.images?.length)?.images[0], ...(o.images || []).slice(1)]
  return {
    prompt: o.prompt, width, height, count: o.count || 1, frames: (o.duration || 5) * 24 + 1,
    duration: trim ? seconds(trim.end - trim.start) : o.duration || 5, start: trim ? seconds(trim.start) : 0,
    ...Object.fromEntries(PICTURE_SLOTS.map((key, i) => [key, pictures[i] || undefined])),
    mask: o.mask || undefined, video: o.video || o.media?.video, audio: o.slots?.audio || o.media?.audio || o.audio || undefined, voice: o.slots?.voice || undefined,
    seed: Math.floor(Math.random() * 2 ** 31), ...o.params, ...o.fields,
  }
}

export function comfyRouterInput(model, o) {
  if (model === 'bfl/flux-2-pro') {
    const [width, height] = aspectSize[o.aspect || '16:9']
    return { prompt: o.prompt, width, height, ...o.params }
  }
  if (model === 'byteplus/dreamina-seedance-2-5-260628') {
    const image = o.images?.[0] || o.image
    return { content: [{ type: 'text', text: o.prompt }, ...(image ? [{ type: 'image_url', image_url: { url: image }, role: 'first_frame' }] : [])], duration: o.duration || 5, resolution: '720p', ...(image ? {} : { ratio: o.aspect || '16:9' }), ...o.params }
  }
  throw new Error('This Router model needs its native input body. Call runComfyRouter with input.')
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

export const hasImageInput = (props) => [...singleImage, ...manyImages].some((k) => props[k])

export async function falEndpointFor(model, hasImage, schema) {
  const own = model.model
  if (!hasImage || model.provider !== 'fal') return own
  if (hasImageInput((await schema(own)).properties)) return own
  const tries = own.endsWith('text-to-video') ? [own.replace(/text-to-video$/, 'image-to-video')]
    : own.endsWith('text-to-image') ? [own.replace(/text-to-image$/, 'image-to-image'), `${own}/edit`]
    : [`${own}/edit`]
  for (const id of tries) if (Object.keys((await schema(id)).properties).length) return id
  throw new Error(`${model.name} does not take an image. Pick an image-to-video or edit model.`)
}

export function falInput(props, o) {
  const input = {}
  if (o.prompt) input[props.prompt || !props.text ? 'prompt' : 'text'] = o.prompt
  const images = o.images || (o.image ? [o.image] : [])
  const face = o.face?.faceUrl || o.face?.url
  const references = face && !images.includes(face) ? [...images, face] : images
  if (references.length) {
    const many = manyImages.find((k) => props[k])
    const one = singleImage.find((k) => props[k])
    if (many && (!one || references.length > 1 || many === 'image_urls')) input[many] = references
    else if (one) input[one] = references[0]
  }
  for (const [field, value] of Object.entries({ mask_url: o.mask, video_url: o.video, start_time: o.trim?.start, end_time: o.trim?.end, crop: o.crop })) {
    if (props[field] && value != null) input[field] = value
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
