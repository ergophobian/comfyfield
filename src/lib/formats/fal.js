import { defineFormat } from './spec.js'

// The teammate's fal formats: saved generation setups with a few exposed inputs.
//   model     fal endpoint id (or one of our catalog model ids)
//   inputs    image | text | choice. An image can name the fal `field` it fills; a choice option can carry `params` and `text`.
//   prompt    template, {id} is replaced by the input's value (a choice uses its option text or label)
//   params    extra raw inputs sent to the endpoint
//   settings  aspect, duration. Aspect 'auto' keeps the shape of the source image.
const photo = { id: 'image', type: 'image', label: 'Photo' }
const note = { id: 'note', type: 'text', label: 'Extra direction', optional: true, placeholder: 'Optional' }

const gradient = (a, b, c) => `linear-gradient(135deg, ${a}, ${b}${c ? `, ${c}` : ''})`

export const falFormats = [
  {
    id: 'melt', job: 'effects', name: 'Melt', kind: 'video', blurb: 'Your subject slowly melts into liquid chrome.',
    model: 'bytedance/seedance-2.0/fast/image-to-video',
    inputs: [photo, note],
    prompt: 'The subject slowly melts into flowing liquid chrome, dripping and pooling, smooth cinematic motion, locked camera. {note}',
    params: { generate_audio: false },
    settings: { aspect: 'auto', duration: 5 },
    cover: gradient('#c9d4ff', '#8ea0ff', '#e8ecff'),
  },
  {
    id: 'zero-gravity', job: 'effects', name: 'Zero gravity', kind: 'video', blurb: 'Everything in the frame floats weightlessly upward.',
    model: 'bytedance/seedance-2.0/fast/image-to-video',
    inputs: [photo, note],
    prompt: 'Gravity switches off. The subject, hair, clothes and every object in the scene drift weightlessly upward and rotate slowly, soft floating motion. {note}',
    params: { generate_audio: false },
    settings: { aspect: 'auto', duration: 5 },
    cover: gradient('#dfe6ff', '#a9b8ff', '#7d8cf2'),
  },
  {
    id: 'city-giant', job: 'effects', name: 'City giant', kind: 'video', blurb: 'The subject grows into a giant towering over a city.',
    model: 'fal-ai/kling-video/v3/standard/image-to-video',
    inputs: [photo, note],
    prompt: 'The subject grows rapidly into a colossal giant that towers over a modern city skyline, buildings shaking, dramatic low camera tilting up. {note}',
    params: { generate_audio: false },
    settings: { aspect: 'auto', duration: 5 },
    cover: gradient('#b9c6f5', '#6f7fd8', '#3c49b8'),
  },
  {
    id: 'claymation', job: 'effects', name: 'Claymation', kind: 'video', blurb: 'The scene turns into handmade stop motion clay.',
    model: 'bytedance/seedance-2.0/fast/image-to-video',
    inputs: [photo, note],
    prompt: 'The whole scene becomes stop motion claymation: fingerprints in the clay, chunky handmade textures, jittery frame-by-frame movement, warm studio lamp. {note}',
    params: { generate_audio: false },
    settings: { aspect: 'auto', duration: 5 },
    cover: gradient('#ffe3d3', '#f5b79a', '#e9906f'),
  },
  {
    id: 'nine-shots', job: 'cinematic', name: '9 shots from one image', kind: 'image', blurb: 'A 3 by 3 contact sheet of cinematic angles of the same scene.',
    model: 'fal-ai/nano-banana-2/edit',
    inputs: [photo],
    prompt: 'Create a 3x3 grid contact sheet of nine different cinematic shots of this exact subject and scene: wide establishing, medium, close up, extreme close up, low angle, high angle, over the shoulder, profile and a dutch angle. Keep the same person, outfit, lighting and style in every frame, thin white gutters between frames.',
    settings: { aspect: 'auto' },
    cover: gradient('#e4e9ff', '#b8c4ff', '#9aa8fb'),
  },
  {
    id: 'new-angle', job: 'edit', name: 'New angle', kind: 'image', blurb: 'See the same image from another camera position.',
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
    id: 'relight', job: 'edit', name: 'Relight', kind: 'image', blurb: 'Keep everything, change only the light.',
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
    id: 'outfit-swap', job: 'edit', name: 'Outfit swap', kind: 'image', blurb: 'Put a garment from one photo onto the person in another.',
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
    id: 'remove-background', job: 'edit', name: 'Background remove', kind: 'image', blurb: 'A clean cutout with a transparent background.',
    model: 'fal-ai/bria/background/remove',
    inputs: [photo],
    prompt: '',
    settings: { aspect: 'auto' },
    cover: gradient('#eef1ff', '#dfe4fb', '#cfd6f5'),
  },
  {
    id: 'upscale', job: 'edit', name: 'Upscale', kind: 'image', blurb: 'More resolution and detail, same picture.',
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
