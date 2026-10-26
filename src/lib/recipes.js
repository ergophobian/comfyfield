import { defineFormat } from './formats/spec.js'

import { widgetOptions, widgetReady, widgetTypes } from '../../shared/widgetInputs.js'
// A recipe is a saved generation setup with a few exposed inputs.
//   model     fal endpoint id (or one of our catalog model ids)
//   inputs    image | text | choice. An image can name the fal `field` it fills; a choice option can carry `params` and `text`.
//   prompt    template, {id} is replaced by the input's value (a choice uses its option text or label)
//   params    extra raw inputs sent to the endpoint
//   settings  aspect, duration. Aspect 'auto' keeps the shape of the source image.
const photo = { id: 'image', type: 'image', label: 'Photo' }
const note = { id: 'note', type: 'text', label: 'Extra direction', optional: true, placeholder: 'Optional' }

const gradient = (a, b, c) => `linear-gradient(135deg, ${a}, ${b}${c ? `, ${c}` : ''})`

export const recipes = [
  {
    id: 'melt', name: 'Melt', kind: 'video', blurb: 'Your subject slowly melts into liquid chrome.',
    model: 'bytedance/seedance-2.0/fast/image-to-video',
    inputs: [photo, note],
    prompt: 'The subject slowly melts into flowing liquid chrome, dripping and pooling, smooth cinematic motion, locked camera. {note}',
    params: { generate_audio: false },
    settings: { aspect: 'auto', duration: 5 },
    cover: gradient('#c9d4ff', '#8ea0ff', '#e8ecff'),
  },
  {
    id: 'zero-gravity', name: 'Zero gravity', kind: 'video', blurb: 'Everything in the frame floats weightlessly upward.',
    model: 'bytedance/seedance-2.0/fast/image-to-video',
    inputs: [photo, note],
    prompt: 'Gravity switches off. The subject, hair, clothes and every object in the scene drift weightlessly upward and rotate slowly, soft floating motion. {note}',
    params: { generate_audio: false },
    settings: { aspect: 'auto', duration: 5 },
    cover: gradient('#dfe6ff', '#a9b8ff', '#7d8cf2'),
  },
  {
    id: 'city-giant', name: 'City giant', kind: 'video', blurb: 'The subject grows into a giant towering over a city.',
    model: 'fal-ai/kling-video/v3/standard/image-to-video',
    inputs: [photo, note],
    prompt: 'The subject grows rapidly into a colossal giant that towers over a modern city skyline, buildings shaking, dramatic low camera tilting up. {note}',
    params: { generate_audio: false },
    settings: { aspect: 'auto', duration: 5 },
    cover: gradient('#b9c6f5', '#6f7fd8', '#3c49b8'),
  },
  {
    id: 'claymation', name: 'Claymation', kind: 'video', blurb: 'The scene turns into handmade stop motion clay.',
    model: 'bytedance/seedance-2.0/fast/image-to-video',
    inputs: [photo, note],
    prompt: 'The whole scene becomes stop motion claymation: fingerprints in the clay, chunky handmade textures, jittery frame-by-frame movement, warm studio lamp. {note}',
    params: { generate_audio: false },
    settings: { aspect: 'auto', duration: 5 },
    cover: gradient('#ffe3d3', '#f5b79a', '#e9906f'),
  },
  {
    id: 'nine-shots', name: '9 shots from one image', kind: 'image', blurb: 'A 3 by 3 contact sheet of cinematic angles of the same scene.',
    model: 'fal-ai/nano-banana-2/edit',
    inputs: [photo],
    prompt: 'Create a 3x3 grid contact sheet of nine different cinematic shots of this exact subject and scene: wide establishing, medium, close up, extreme close up, low angle, high angle, over the shoulder, profile and a dutch angle. Keep the same person, outfit, lighting and style in every frame, thin white gutters between frames.',
    settings: { aspect: 'auto' },
    cover: gradient('#e4e9ff', '#b8c4ff', '#9aa8fb'),
  },
  {
    id: 'new-angle', name: 'New angle', kind: 'image', blurb: 'See the same image from another camera position.',
    model: 'fal-ai/qwen-image-edit-2511-multiple-angles',
    inputs: [
      photo,
      { id: 'angle', type: 'choice', label: 'Camera', default: 'left', options: [
        { id: 'left', label: 'From the left', params: { horizontal_angle: 315, vertical_angle: 0, zoom: 5 } },
        { id: 'right', label: 'From the right', params: { horizontal_angle: 45, vertical_angle: 0, zoom: 5 } },
        { id: 'behind', label: 'From behind', params: { horizontal_angle: 180, vertical_angle: 0, zoom: 5 } },
        { id: 'above', label: 'From above', params: { horizontal_angle: 0, vertical_angle: 60, zoom: 5 } },
        { id: 'low', label: 'Low angle', params: { horizontal_angle: 0, vertical_angle: -25, zoom: 5 } },
        { id: 'close', label: 'Close up', params: { horizontal_angle: 0, vertical_angle: 0, zoom: 9 } },
      ] },
    ],
    prompt: '',
    settings: { aspect: 'auto' },
    cover: gradient('#d8e0ff', '#98a8ff', '#5c6cf0'),
  },
  {
    id: 'relight', name: 'Relight', kind: 'image', blurb: 'Keep everything, change only the light.',
    model: 'fal-ai/nano-banana-2/edit',
    inputs: [
      photo,
      { id: 'light', type: 'choice', label: 'Lighting', default: 'golden', options: [
        { id: 'golden', label: 'Golden hour', text: 'warm low golden hour sunlight from the side, long soft shadows' },
        { id: 'studio', label: 'Studio softbox', text: 'clean studio softbox lighting, soft even highlights, gentle falloff' },
        { id: 'neon', label: 'Neon night', text: 'night time with pink and cyan neon light spilling across the subject' },
        { id: 'window', label: 'Window light', text: 'soft daylight from a large window on one side, moody shadows on the other' },
        { id: 'moon', label: 'Moonlight', text: 'cool blue moonlight with deep shadows and a subtle rim light' },
      ] },
    ],
    prompt: 'Relight this image with {light}. Keep the subject, composition, colors of objects, pose and every detail exactly the same. Change only the lighting.',
    settings: { aspect: 'auto' },
    cover: gradient('#fff1d6', '#ffd49a', '#ffb870'),
  },
  {
    id: 'outfit-swap', name: 'Outfit swap', kind: 'image', blurb: 'Put a garment from one photo onto the person in another.',
    model: 'fal-ai/fashn/tryon/v1.6',
    inputs: [
      { id: 'person', type: 'image', label: 'Person', field: 'model_image' },
      { id: 'garment', type: 'image', label: 'Garment', field: 'garment_image' },
      { id: 'part', type: 'choice', label: 'Garment type', default: 'auto', options: [
        { id: 'auto', label: 'Detect it', params: { category: 'auto' } },
        { id: 'tops', label: 'Top', params: { category: 'tops' } },
        { id: 'bottoms', label: 'Bottom', params: { category: 'bottoms' } },
        { id: 'one', label: 'Dress or one piece', params: { category: 'one-pieces' } },
      ] },
    ],
    prompt: '',
    settings: { aspect: 'auto' },
    cover: gradient('#e9e4ff', '#c4b8ff', '#9b8cf5'),
  },
  {
    id: 'remove-background', name: 'Background remove', kind: 'image', blurb: 'A clean cutout with a transparent background.',
    model: 'fal-ai/bria/background/remove',
    inputs: [photo],
    prompt: '',
    settings: { aspect: 'auto' },
    cover: gradient('#eef1ff', '#dfe4fb', '#cfd6f5'),
  },
  {
    id: 'upscale', name: 'Upscale', kind: 'image', blurb: 'More resolution and detail, same picture.',
    model: 'fal-ai/seedvr/upscale/image',
    inputs: [
      photo,
      { id: 'factor', type: 'choice', label: 'Scale', default: '2', options: [
        { id: '2', label: '2x', params: { upscale_factor: 2 } },
        { id: '4', label: '4x', params: { upscale_factor: 4 } },
      ] },
    ],
    prompt: '',
    settings: { aspect: 'auto' },
    cover: gradient('#d4e4ff', '#9cc0ff', '#6a98f5'),
  },
].map(defineFormat)

export const recipesFor = (kind) => recipes.filter((r) => r.kind === kind)

const textual = ['text', 'longtext']
const libraryPicks = ['character', 'product', 'brand', 'voice']

const startValue = (i) => {
  if (i.confirmation) return null
  if (i.type === 'choice') return i.default ?? i.options[0].id
  if (i.type === 'count') return i.default ?? i.options[0]
  return textual.includes(i.type) ? '' : null
}

export const initialValues = (recipe) => Object.fromEntries(recipe.inputs.map((i) => [i.id, startValue(i)]))

// Inputs with `when: [choiceId, optionId]` only show, and only count, while that option is picked.
export const visibleInputs = (recipe, values) => recipe.inputs.filter((i) => !i.when || values[i.when[0]] === i.when[1])

// A motion drawing needs its arrows too: the graph reads them as its mask.
export const missingInputs = (recipe, values) => visibleInputs(recipe, values)
  .filter((i) => !i.optional && (widgetTypes.includes(i.type) || (i.type === 'draw' && i.mode !== 'motion')
    ? !widgetReady(i.type === 'draw' ? 'mask' : i.type, values[i.id])
    : i.type === 'voice' ? !values[i.id]?.sample
    : i.type === 'draw' ? !values[i.id]?.url || !values[i.id]?.strokes
      : textual.includes(i.type) ? !values[i.id]?.trim() : values[i.id] == null || values[i.id] === ''))

// Picture-like inputs, in the order a ComfyUI graph's image, image2, ... slots take them.
export const pictureTypes = ['image', 'draw', 'mask', 'face', 'crop', 'character', 'product']

// The files a ComfyUI graph takes by slot: one picture per picture-like input, in the order the format
// lists them, so an empty optional input keeps its slot (a saved character or product gives its first
// picture, or its first `pictures` ones, which is how a reference set reaches the graph); the first audio
// input; a saved voice's sample. Null when the format has none of them.
export function fileSlots(recipe, values) {
  const shown = new Set(visibleInputs(recipe, values).map((i) => i.id))
  const value = (i) => (shown.has(i.id) ? values[i.id] : null)
  const picture = (i) => {
    const v = value(i)
    if (!v) return null
    if (i.type === 'character' || i.type === 'product') return v.images?.[0] || null
    if (widgetTypes.includes(i.type) || (i.type === 'draw' && i.mode !== 'motion')) {
      const type = i.type === 'draw' ? 'mask' : i.type
      return widgetReady(type, v) ? widgetOptions(type, v).image || null : null
    }
    return v.url || null
  }
  const pictures = recipe.inputs.filter((i) => pictureTypes.includes(i.type)).flatMap((i) => {
    if (!(i.pictures > 1)) return [picture(i)]
    const images = value(i)?.images || []
    return Array.from({ length: i.pictures }, (_, n) => images[n] || null)
  })
  const audio = recipe.inputs.filter((i) => i.type === 'audio').map((i) => value(i)?.url).find(Boolean) || null
  const voice = recipe.inputs.filter((i) => i.type === 'voice').map((i) => value(i)?.sample).find(Boolean) || null
  if (!pictures.length && !recipe.inputs.some((i) => i.type === 'audio' || i.type === 'voice')) return null
  return { pictures, audio, voice }
}

// Turns a recipe and the sheet's values into options for gens.generate().
export function recipeOptions(recipe, values) {
  const images = []
  const fields = {}
  const media = {}
  const refs = []
  const inputs = {}
  let widgets = {}
  let voiceConsent = false
  let params = { ...recipe.params }
  const fill = {}
  for (const input of visibleInputs(recipe, values)) {
    const v = values[input.id]
    if ((input.type === 'voice' || input.voiceSample) && v?.consent === true) voiceConsent = true
    if (widgetTypes.includes(input.type) || (input.type === 'draw' && input.mode !== 'motion')) {
      const type = input.type === 'draw' ? 'mask' : input.type
      if (!widgetReady(type, v)) continue
      const opts = widgetOptions(type, v)
      widgets = { ...widgets, ...opts }
      inputs[input.id] = v
      if (opts.image) images.push(opts.image)
      if (opts.mask) media[`${input.id}Strokes`] = opts.mask
      if (opts.video) media[input.id] = opts.video
      if (input.field) fields[input.field] = opts.image || opts.video
      fill[input.id] = v.name || ''
    } else if (input.type === 'image') {
      if (!v) continue
      if (input.field) fields[input.field] = v.url
      else images.push(v.url)
    } else if (input.type === 'video' || input.type === 'audio') {
      // `text` names an attached file in the prompt only when there is one, e.g. 'the voice from <Audio 1>'.
      if (v) { media[input.id] = v.url; if (input.text) fill[input.id] = input.text }
    } else if (input.type === 'draw') {
      if (v) { images.push(v.url); if (v.strokes) media[`${input.id}Strokes`] = v.strokes }
    } else if (libraryPicks.includes(input.type)) {
      if (v) { refs.push(v); fill[input.id] = v.name }
    } else if (input.type === 'choice') {
      const opt = input.options.find((o) => o.id === v)
      fill[input.id] = opt?.text || opt?.label || ''
      params = { ...params, ...opt?.params }
    } else if (input.type === 'count') {
      fill[input.id] = String(v)
    } else fill[input.id] = (v || '').trim()
  }
  // Collapse spaces but keep line breaks, so shot lists stay one shot per line.
  let prompt = recipe.prompt.replace(/\{(\w+)\}/g, (_, k) => fill[k] ?? '').replace(/[^\S\n]+/g, ' ').replace(/ *\n\s*/g, '\n').trim()
  const first = recipe.inputs.find((i) => i.type === 'image' || i.type === 'draw' || widgetTypes.includes(i.type))
  const slots = fileSlots(recipe, values)
  // A shape, length or quality choice sets the run's canvas or length; none is an input of the model.
  const { aspect: shaped, duration: timed, scale, clipsound, ...rest } = params
  if (recipe.refTags && slots) {
    // MiniMax H3 numbers its references in the order they arrive, so an empty slot would shift every
    // later <Picture n>. Pack the pictures and renumber the user's tags to match.
    const filled = slots.pictures.map((url, i) => [url, i + 1]).filter(([url]) => url)
    const picture = Object.fromEntries(filled.map(([, n], i) => [n, i + 1]))
    slots.pictures = filled.map(([url]) => url)
    // A clip sent with its sound gets the first <Audio> label, so the user's audio moves up one and
    // <Video 1 sound> names the clip's.
    const sound = clipsound && (widgets.video || media.video)
    prompt = prompt.replace(/<(Picture|Audio) (\d+)>/g, (tag, type, n) => type === 'Picture' ? (picture[n] ? `<Picture ${picture[n]}>` : tag) : sound ? `<Audio ${Number(n) + 1}>` : tag)
      .replace(/<Video 1 sound>/g, sound ? '<Audio 1>' : 'the sound of <Video 1>')
    if (sound) {
      rest.clipvideo = sound
      delete widgets.video
      delete media.video
    }
  }
  return {
    ...widgets, prompt, caption: recipe.name, images, fields, params: rest, count: 1,
    ...(slots && { slots }),
    ...(voiceConsent && { voiceConsent: true }),
    ...(Object.keys(inputs).length && { inputs }),
    ...(Object.keys(media).length && { media }), ...(refs.length && { refs }),
    aspect: shaped || recipe.settings.aspect, duration: timed || recipe.settings.duration, ...(scale && { scale }), shape: first ? values[first.id]?.ratio : undefined,
  }
}

// Recipes run on a fal endpoint unless `model` names one of our catalog ids.
// Open-weight formats run their workflow on Comfy.
export const recipeModel = (recipe, catalog) => (recipe.engine === 'comfy'
  ? { id: `format:${recipe.id}`, provider: 'comfy', kind: recipe.kind, name: recipe.runsOn || recipe.name, workflow: recipe.workflow }
  : catalog.find((m) => m.id === recipe.model) || { id: `recipe:${recipe.id}`, provider: 'fal', kind: recipe.kind, name: recipe.name, model: recipe.model })
