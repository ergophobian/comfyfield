import { open, covers } from './parts.js'
import { ltx25Sizes } from '../catalog.js'

const presenter = { id: 'character', type: 'character', label: 'Fictional presenter from Library', half: true }
const product = { id: 'product', type: 'product', label: 'Product from Library', half: true }
const brief = { id: 'brief', type: 'longtext', label: 'Product facts and direction', placeholder: 'What it does, who it helps, and one thing to show. Use verified facts only.' }

const ugc = (id, name, job, scene, action, cover) => open({
  id, name, job, blurb: job, shape: 'pipeline', kind: 'video', category: 'ads', hub: 'ads', layout: 'wide',
  runsOn: action ? 'Qwen Image Edit, LTX 2.5, Chatterbox and InfiniteTalk' : 'Qwen Image Edit, Chatterbox and InfiniteTalk',
  inputs: [presenter, product, brief],
  settings: { aspect: '9:16', duration: 5 },
  output: 'A presenter still and a short spoken video, saved to Library. Review the script before rendering. Final speech video needs a Session. Use generated fictional adults only.',
  steps: [
    {
      id: 'stage', from: [], provider: 'comfy', workflow: 'qwen2511_edit', kind: 'image',
      prompt: `A vertical phone photograph of the generated fictional adult in image 1 with the product from image 2. Preserve the fictional character identity and the exact product design, label and colors. ${scene} Natural daylight, realistic hands, no captions. Product facts and direction: {brief}`,
    },
    {
      id: 'script', type: 'writer', from: ['stage'], target: 'Short creator script',
      instructions: `Write only 8 to 12 spoken English words for a five-second ${name.toLowerCase()} by a generated fictional adult presenter. Use the supplied product facts and direction. ${job}. Never invent a personal testimonial, product claim, price, discount or certification. Do not impersonate a real person. No scene directions, headings, quotes or captions. Return only the words to speak.`,
    },
    { id: 'approve-script', type: 'approve', from: ['script'] },
    {
      id: 'perform', from: ['approve-script', 'stage'], provider: 'comfy', kind: 'video',
      workflow: action ? 'ugc_presenter_demo' : 'ugc_presenter_talk',
      ...(action ? { params: { action }, sizes: ltx25Sizes } : {}),
    },
  ],
  outputs: [{ step: 'stage', kind: 'image' }, { step: 'perform', kind: 'video' }],
  cover,
})

export const presenterFormats = [
  ugc('ugc-product-review', 'Product review', 'Show one product detail and explain its practical use',
    'Seated at a tidy desk, the presenter holds the product beside their face with its key detail visible.', null, covers.peach),
  ugc('ugc-unboxing', 'Unboxing', 'Introduce a product as it comes out of a plain box',
    'The presenter sits behind an open, unbranded box with the product visible inside, hands ready to lift it.',
    'The fictional adult presenter gently lifts the product out of the open box and holds it toward the camera. One continuous medium shot, modest hand movement. Keep the product design and label unchanged.', covers.sun),
  ugc('ugc-tutorial', 'Product tutorial', 'Explain one simple step for using a product',
    'The presenter faces the camera at a bright worktop, with the product upright and ready to demonstrate one simple use.',
    'The fictional adult presenter points to one product detail, then demonstrates one simple use at the worktop. One continuous medium shot, restrained motion. Keep the product design and label unchanged.', covers.mint),
  ugc('ugc-talking-head', 'Presenter talking head', 'Introduce the product directly to the viewer',
    'A chest-up presenter faces a phone camera at eye level in a bright home, holding the product beside them.', null, covers.lilac),
  open({
    id: 'influencer-motion', name: 'Influencer motion', shape: 'tool', kind: 'video', category: 'characters', hub: 'face',
    blurb: 'Your saved fictional character performs the moves from a reference clip.',
    runsOn: 'Wan Animate 2', workflow: 'wan_animate2',
    inputs: [
      presenter,
      { id: 'video', type: 'video', label: 'Reference motion clip' },
      { id: 'scene', type: 'text', label: 'Scene direction', optional: true, placeholder: 'Soft daylight, a simple studio backdrop' },
    ],
    prompt: 'The generated fictional adult character from the reference image performs the body movements from the reference video. Preserve the fictional identity and outfit. Use the clip only for motion, never copy its performer identity. {scene}',
    settings: { aspect: '9:16', duration: 5 },
    output: 'A motion-transfer video saved to Library. Uses the selected trim, or the first five seconds. Use a generated fictional adult with a clear full-body image.',
    cover: covers.indigo,
  }),
]
