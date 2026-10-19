// One-purpose apps that match Higgsfield's /apps catalogue, one format per app.
// Each sets `hub`, so it lists on /apps under that hub and opens at /apps/:id.
import { open, photo, clip, note, covers } from './parts.js'
import { h3Sizes, ltx25Sizes } from '../catalog.js'

const product = { id: 'image', type: 'image', label: 'Product photo' }
const still = { aspect: 'auto' }
const moving = { aspect: 'auto', duration: 5 }

const qwen = { runsOn: 'Qwen-Image 2.1', workflow: 'qwen_edit' }
const klein = { runsOn: 'FLUX 3 Image Klein', workflow: 'klein_edit' }
const ltx = { runsOn: 'LTX-2.5', workflow: 'ltx25_i2v', sizes: ltx25Sizes }
const h3 = { runsOn: 'MiniMax H3', workflow: 'h3_open_i2v', sizes: h3Sizes }
// Product effects keep the product exact by passing it to H3 as a reference.
const productAd = { runsOn: 'MiniMax H3', workflow: 'h3_product_ad', sizes: h3Sizes }
// Bullet time is a product reference with the format's prompt, the same graph as the product ads.
const bulletTime = { runsOn: 'MiniMax H3', workflow: 'h3_product_ad', sizes: h3Sizes }
// Templates that restyle the still first, then animate it.
const kleinLtx = { runsOn: 'FLUX 3 Image Klein and LTX-2.5', workflow: 'klein_ltx' }
const qwenLtx = { runsOn: 'Qwen-Image 2.1 and LTX-2.5', workflow: 'qwen_ltx' }
const kleinH3 = { runsOn: 'FLUX 3 Image Klein and MiniMax H3', workflow: 'klein_h3' }

// A one-photo template that becomes a short clip.
const template = ({ id, name, hub = 'trending', category = 'effects', blurb, prompt, model = ltx, cover, ...rest }) => open({
  id, name, kind: 'video', category, hub, blurb, ...model,
  ...(category === 'effects' && { group: 'Trending' }),
  inputs: [photo, note],
  prompt: `${prompt} {note}`,
  settings: moving,
  cover,
  ...rest,
})

// A one-product ad beat: one product photo, a fixed commercial moment.
const adBeat = ({ id, name, blurb, prompt, model = productAd, cover, params }) => open({
  id, name, kind: 'video', category: 'ads', hub: 'ads', blurb, ...model, ...(params && { params }),
  inputs: [product, note],
  prompt: `${prompt} The product keeps its exact shape, label and colors in every frame. {note}`,
  settings: moving,
  cover,
})

const professional = [
  open({
    id: 'angles', name: 'Any angle', kind: 'image', category: 'image-edit', hub: 'professional',
    blurb: 'See your photo from any camera position, even from behind.',
    runsOn: 'Qwen-Image Edit 2511 with Multiple-Angles', workflow: 'qwen_multiangle',
    inputs: [
      photo,
      { id: 'turn', type: 'choice', label: 'Turn', half: true, default: 'right-45', options: [
        { id: 'front', label: 'Front', text: 'straight in front of the subject', params: { azimuth: 0 } },
        { id: 'left-45', label: '45 degrees left', text: '45 degrees around to the left', params: { azimuth: -45 } },
        { id: 'right-45', label: '45 degrees right', text: '45 degrees around to the right', params: { azimuth: 45 } },
        { id: 'left-90', label: 'Left side', text: 'to the left side, in profile', params: { azimuth: -90 } },
        { id: 'right-90', label: 'Right side', text: 'to the right side, in profile', params: { azimuth: 90 } },
        { id: 'back', label: 'Behind', text: 'all the way around behind the subject', params: { azimuth: 180 } },
      ] },
      { id: 'tilt', type: 'choice', label: 'Height', half: true, default: 'eye', options: [
        { id: 'eye', label: 'Eye level', text: 'at eye level', params: { elevation: 0 } },
        { id: 'high', label: 'High', text: 'raised high and looking down', params: { elevation: 35 } },
        { id: 'low', label: 'Low', text: 'down low and looking up', params: { elevation: -30 } },
        { id: 'top', label: 'Top down', text: 'directly overhead looking straight down', params: { elevation: 90 } },
      ] },
      { id: 'zoom', type: 'choice', label: 'Distance', half: true, default: 'same', options: [
        { id: 'close', label: 'Closer', text: 'moved in closer', params: { zoom: 1.5 } },
        { id: 'same', label: 'Same', text: 'at the same distance', params: { zoom: 1 } },
        { id: 'wide', label: 'Wider', text: 'pulled back wider', params: { zoom: 0.7 } },
      ] },
      { id: 'batch', type: 'choice', label: 'How many', half: true, default: 'one', options: [
        { id: 'one', label: 'This angle', params: { batch: 1 } },
        { id: 'twelve', label: '12 best angles', note: 'A full contact sheet', params: { batch: 12 } },
      ] },
    ],
    // The graph writes the Multiple-Angles LoRA's own prompt from the turn, tilt and zoom.
    prompt: '',
    output: 'One new angle, or a sheet of 12',
    settings: still,
    cover: covers.indigo,
  }),
  open({
    id: 'whats-next', name: 'What happens next', kind: 'image', category: 'image-edit', hub: 'professional',
    blurb: 'Eight ideas for the next moment of your scene.',
    runsOn: 'Qwen3.8 and FLUX 3 Image Klein', workflow: 'whats_next',
    inputs: [
      photo,
      { id: 'direction', type: 'choice', label: 'Where it goes', default: 'any', options: [
        { id: 'any', label: 'Surprise me', text: 'a mix of quiet, dramatic and unexpected turns' },
        { id: 'calm', label: 'Quiet', text: 'small, quiet story beats that follow on naturally' },
        { id: 'drama', label: 'Dramatic', text: 'big dramatic turns and reveals' },
        { id: 'funny', label: 'Funny', text: 'funny, light and absurd turns' },
      ] },
      note,
    ],
    prompt: 'Read this frame as one moment in a story and imagine eight different things that could happen next, leaning toward {direction}. Render each as a new still with the same people, outfits, place, light and camera style, so they could be the next shot in the same film. {note}',
    output: 'Eight next moments to pick from and upscale',
    settings: still,
    cover: covers.dusk,
  }),
  open({
    id: 'shots', name: 'Shot grid', kind: 'image', category: 'story', hub: 'professional',
    blurb: 'Nine cinematic angles of one scene on a single sheet.',
    runsOn: 'Qwen-Image Edit 2511 with Multiple-Angles', workflow: 'qwen_shots_grid',
    inputs: [photo],
    // Nine renders with the Multiple-Angles LoRA, each with its own fixed prompt, joined 3x3 with white gutters.
    prompt: '',
    output: 'A 3x3 sheet of shots to pick from and upscale',
    settings: still,
    cover: covers.sky,
  }),
  open({
    id: 'zooms', name: 'Zoom grid', kind: 'image', category: 'image-edit', hub: 'professional',
    blurb: 'Nine framings of one image, from a tiny detail to a wide view.',
    runsOn: 'Qwen-Image 2.1', workflow: 'qwen_zoom_grid',
    inputs: [
      photo,
      { id: 'focus', type: 'text', label: 'Detail to start on', optional: true, placeholder: 'The ring on her hand' },
    ],
    prompt: 'Nine framings of this image laid out as a 3x3 sheet from tightest to widest: three macro and close detail crops, three medium framings, and three pull backs that continue the scene past the original edges. The subject, light and style stay identical in every frame. Start the tightest crop on this detail: {focus}',
    output: 'A 3x3 sheet of framings to pick from and upscale',
    settings: still,
    cover: covers.mint,
  }),
  open({
    id: 'photo-grade', name: 'Photo grade', kind: 'image', category: 'image-edit', hub: 'professional',
    blurb: 'Grade a photo with film looks, then fine tune it.',
    runsOn: 'Color filters, no model', workflow: 'image_grade',
    inputs: [
      photo,
      { id: 'look', type: 'choice', label: 'Look', default: 'natural', options: [
        { id: 'natural', label: 'Natural', note: 'Clean and true', params: { preset: 'natural' } },
        { id: 'split-tone', label: 'Split tone', note: 'Teal shadows, warm highlights', params: { preset: 'split_tone' } },
        { id: 'soft-skin', label: 'Soft skin', note: 'Gentle and flattering', params: { preset: 'soft_skin' } },
        { id: 'old-lens', label: 'Old lens', note: 'Soft glow and vignette', params: { preset: 'old_lens' } },
        { id: '16mm', label: '16mm', note: 'Grain and lifted blacks', params: { preset: '16mm' } },
        { id: 'faded', label: 'Faded film', note: 'Matte and washed', params: { preset: 'faded' } },
        { id: 'mono', label: 'Black and white', note: 'Punchy contrast', params: { preset: 'mono' } },
        { id: 'warm-70s', label: 'Warm 70s', note: 'Golden and soft', params: { preset: 'warm_70s' } },
      ] },
      { id: 'warmth', type: 'choice', label: 'Temperature', half: true, default: 'neutral', options: [
        { id: 'cool', label: 'Cooler', params: { temperature: -20 } },
        { id: 'neutral', label: 'As is', params: { temperature: 0 } },
        { id: 'warm', label: 'Warmer', params: { temperature: 20 } },
      ] },
      { id: 'grain', type: 'choice', label: 'Grain', half: true, default: 'none', options: [
        { id: 'none', label: 'None', params: { grain: 0 } },
        { id: 'fine', label: 'Fine', params: { grain: 15 } },
        { id: 'heavy', label: 'Heavy', params: { grain: 40 } },
      ] },
    ],
    settings: still,
    cover: covers.peach,
  }),
]

const enhanceAndStyle = [
  open({
    id: 'ai-stylist', name: 'Virtual stylist', kind: 'image', category: 'image-edit', hub: 'enhance', layout: 'wide',
    blurb: 'Dress yourself in a full look or piece by piece, then set the pose and backdrop.',
    ...qwen,
    inputs: [
      { id: 'image', type: 'image', label: 'Your photo', half: true },
      { id: 'look', type: 'choice', label: 'Outfit', half: true, default: 'smart', options: [
        { id: 'smart', label: 'Smart casual', text: 'a smart casual look: an unstructured blazer, a fine knit tee, tapered trousers and clean leather sneakers' },
        { id: 'street', label: 'Streetwear', text: 'a streetwear look: an oversized hoodie, loose cargo trousers, a cap and chunky sneakers' },
        { id: 'minimal', label: 'Minimal', text: 'a minimal look in neutral tones: a crisp white shirt, wide trousers and simple loafers' },
        { id: 'vintage', label: 'Vintage', text: 'a vintage look: a suede jacket, a patterned shirt, high waisted jeans and boots' },
        { id: 'outdoor', label: 'Outdoor', text: 'an outdoor look: a shell jacket, a fleece, hiking trousers and trail shoes' },
        { id: 'evening', label: 'Evening', text: 'an evening look: a tailored dark suit or a long satin dress with polished shoes' },
        { id: 'tech', label: 'Techwear', text: 'a techwear look: a black waterproof shell, utility straps, cargo pants and sleek runners' },
        { id: 'resort', label: 'Resort', text: 'a resort look: a linen shirt, light shorts or a flowing skirt and sandals' },
        { id: 'pieces', label: 'Piece by piece', text: 'an outfit built from the pieces listed below' },
      ] },
      { id: 'pieces', type: 'longtext', label: 'Pieces, one per line', when: ['look', 'pieces'], placeholder: 'A wool beanie\nA camel overcoat\nA white tee\nStraight black jeans\nWhite sneakers\nA silver chain' },
      { id: 'pose', type: 'choice', label: 'Pose', half: true, default: 'keep', options: [
        { id: 'keep', label: 'Keep my pose', text: 'in the same pose as the photo' },
        { id: 'stand', label: 'Standing', text: 'standing tall with relaxed arms' },
        { id: 'walk', label: 'Walking', text: 'mid stride, walking toward the camera' },
        { id: 'seated', label: 'Seated', text: 'seated on a simple stool' },
        { id: 'lean', label: 'Leaning', text: 'leaning against a wall' },
        { id: 'pockets', label: 'Hands in pockets', text: 'standing with hands in pockets' },
      ] },
      { id: 'background', type: 'choice', label: 'Background', half: true, default: 'keep', options: [
        { id: 'keep', label: 'Keep my background', text: 'the original background' },
        { id: 'studio', label: 'Studio', text: 'a seamless light gray studio backdrop' },
        { id: 'street', label: 'City street', text: 'a sunny city street, softly blurred' },
        { id: 'cafe', label: 'Cafe', text: 'a warm cafe interior, softly blurred' },
        { id: 'park', label: 'Park', text: 'a green park in open shade' },
        { id: 'runway', label: 'Runway', text: 'a lit fashion runway' },
      ] },
    ],
    prompt: 'Dress the person in this photo in {look}, and show them {pose} against {background}. Match every garment\'s fabric, color and fit with natural folds, and keep their face, hair, body and skin tone exactly the same. {pieces}',
    settings: still,
    cover: covers.rose,
  }),
  open({
    id: 'relight-photo', name: 'Move the light', kind: 'image', category: 'image-edit', hub: 'enhance',
    blurb: 'Move a light around your photo and redraw the shadows.',
    // Relight is built into Edit 2511, so no relight LoRA.
    runsOn: 'Qwen-Image Edit 2511', workflow: 'qwen2511_relight',
    inputs: [
      photo,
      { id: 'from', type: 'choice', label: 'Light from', half: true, default: 'left', options: [
        { id: 'top', label: 'Top', text: 'from directly above' },
        { id: 'front', label: 'Front', text: 'from straight in front' },
        { id: 'left', label: 'Left', text: 'from the left side' },
        { id: 'right', label: 'Right', text: 'from the right side' },
        { id: 'back', label: 'Back', text: 'from behind, as a rim light' },
        { id: 'bottom', label: 'Bottom', text: 'from below' },
      ] },
      { id: 'quality', type: 'choice', label: 'Light', half: true, default: 'soft', options: [
        { id: 'soft', label: 'Soft', text: 'a soft, diffused light with gentle shadow edges' },
        { id: 'hard', label: 'Hard', text: 'a hard, direct light with crisp shadow edges' },
      ] },
      { id: 'brightness', type: 'choice', label: 'Brightness', half: true, default: 'medium', options: [
        { id: 'low', label: 'Dim', text: 'dim and moody' },
        { id: 'medium', label: 'Medium', text: 'balanced' },
        { id: 'high', label: 'Bright', text: 'bright and punchy' },
      ] },
      { id: 'color', type: 'text', label: 'Light color', optional: true, half: true, placeholder: 'Warm white, or #ffb070' },
    ],
    prompt: 'Relight this photo with {quality} coming {from}, {brightness}. Redraw the highlights and shadows to follow the scene\'s depth and shapes, and keep the people, objects, colors and composition exactly the same. Light color: {color}',
    settings: still,
    cover: covers.sun,
  }),
  open({
    id: 'style-snap', name: 'Ready-made outfits', kind: 'image', category: 'image-edit', hub: 'enhance',
    blurb: 'Swap your outfit for a ready-made look, same pose and light.',
    ...qwen,
    inputs: [
      photo,
      { id: 'style', type: 'choice', label: 'Style', default: 'street', options: [
        { id: 'street', label: 'Streetwear', text: 'oversized streetwear with a graphic hoodie, baggy cargos and chunky sneakers' },
        { id: 'vintage', label: 'Vintage', text: 'a thrifted vintage outfit with a corduroy jacket, a patterned shirt and worn denim' },
        { id: 'minimal', label: 'Minimal', text: 'a minimal outfit in cream and black with clean lines and no logos' },
        { id: 'editorial', label: 'Editorial', text: 'an editorial fashion look with a sculptural coat and bold tailoring' },
        { id: 'techwear', label: 'Techwear', text: 'black techwear with a waterproof shell, straps, buckles and utility pockets' },
        { id: 'y2k', label: 'Y2K', text: 'a playful early 2000s look with a cropped top, low rise flared jeans and tinted glasses' },
        { id: 'preppy', label: 'Preppy', text: 'a preppy look with a cable knit sweater over a collared shirt and chinos' },
        { id: 'boho', label: 'Boho', text: 'a flowing boho look with layered prints, fringe and woven accessories' },
        { id: 'sporty', label: 'Sporty', text: 'a sporty look with a track jacket, joggers and running shoes' },
        { id: 'workwear', label: 'Workwear', text: 'rugged workwear with a canvas chore jacket, sturdy trousers and boots' },
        { id: 'mono', label: 'All black', text: 'an all black outfit with layered textures' },
        { id: 'grunge', label: 'Grunge', text: 'a grunge look with a flannel shirt, a band style tee without real names, ripped jeans and boots' },
        { id: 'quiet-luxury', label: 'Quiet luxury', text: 'a quiet luxury look in cashmere, camel and soft gray with no visible logos' },
        { id: 'cottage', label: 'Cottagecore', text: 'a cottagecore look with a floral dress or linen shirt, a knit cardigan and a straw bag' },
      ] },
    ],
    prompt: 'Change only the clothes of the person in this photo to {style}. Keep their face, hair, body, pose, hands, the lighting and the background exactly the same, with a natural fit and folds.',
    settings: still,
    cover: covers.lilac,
  }),
  open({
    id: 'outfit-vending', name: 'Vending machine outfit', kind: 'image', category: 'fun', hub: 'enhance',
    blurb: 'Every piece you wear on display in a glowing vending machine.',
    ...qwen, workflow: 'qwen_edit_mockup',
    inputs: [photo, note],
    prompt: 'Lay out each piece this person is wearing, from the hat to the shoes and every accessory, as separate items behind the glass of a brightly lit vending machine, one item per coil slot with a small price tag and a keypad code under each. The person stands beside the machine in the same outfit. A street at night, the machine glowing, crisp product detail. {note}',
    settings: { aspect: '4:5' },
    cover: covers.night,
  }),
  open({
    id: 'outfit-shot', name: 'Garment photoshoot', kind: 'video', category: 'ads', hub: 'enhance', layout: 'wide',
    blurb: 'Put up to three garments on a model for a quick photoshoot clip.',
    runsOn: 'Qwen-Image 2.1 and MiniMax H3', workflow: 'qwen_try_on_h3',
    inputs: [
      { id: 'garment', type: 'image', label: 'Garment', half: true },
      { id: 'garment2', type: 'image', label: 'Second garment', optional: true, half: true },
      { id: 'garment3', type: 'image', label: 'Third garment', optional: true, half: true },
      { id: 'model', type: 'choice', label: 'Model', half: true, default: 'new', options: [
        { id: 'new', label: 'A new model', text: 'a professional fashion model wearing the garments shown in the images' },
        { id: 'character', label: 'Saved character', text: 'the person in the first image, with the same face, hair and body, wearing the garments shown in the other images' },
      ] },
      { id: 'character', type: 'character', label: 'Character', when: ['model', 'character'] },
      { id: 'set', type: 'choice', label: 'Set', default: 'studio', options: [
        { id: 'studio', label: 'Studio', text: 'in a bright studio on a seamless backdrop with soft key light' },
        { id: 'street', label: 'Street', text: 'on a sunny city street with the camera tracking alongside' },
        { id: 'loft', label: 'Loft', text: 'in a sunlit industrial loft with large windows' },
        { id: 'beach', label: 'Beach', text: 'on a beach at golden hour with a light breeze' },
      ] },
    ],
    prompt: 'A vertical full-length fashion photo of {model}. Combine the garments into one outfit and match each garment\'s fabric, color, print and cut exactly. The shoot is {set}.',
    params: { motion: 'The video opens exactly on <Picture 1>. The model turns, takes a step toward the camera and poses, and the fabric moves naturally with each step while the camera moves smoothly with them. The outfit, face and setting stay the same. Audio: a light fashion beat.' },
    settings: { aspect: '9:16', duration: 5 },
    cover: covers.peach,
  }),
]

const faceAndIdentity = [
  open({
    id: 'video-character-swap', name: 'Video character swap', kind: 'video', category: 'video-edit', hub: 'face', layout: 'wide',
    blurb: 'Replace the person in a video with your character, same moves and timing.',
    runsOn: 'SCAIL-2', workflow: 'scail2_character_swap',
    inputs: [
      clip,
      { id: 'source', type: 'choice', label: 'New character', half: true, default: 'photo', options: [
        { id: 'photo', label: 'A photo' },
        { id: 'character', label: 'Saved character' },
      ] },
      { id: 'face', type: 'image', label: 'Character photo', half: true, when: ['source', 'photo'] },
      { id: 'character', type: 'character', label: 'Saved character', half: true, when: ['source', 'character'] },
    ],
    prompt: 'The character from the reference image, with their own face, hair, body and outfit, performing the movements of the original video in the original scene.',
    settings: still,
    cover: covers.dusk,
  }),
  open({
    id: 'likeness-record', name: 'Likeness consent', kind: 'image', category: 'characters', hub: 'face',
    blurb: 'Record how your face may be used, saved with your character.',
    runsOn: 'No model', workflow: 'likeness_record',
    inputs: [
      { id: 'image', type: 'image', label: 'Selfie' },
      { id: 'character', type: 'character', label: 'Save to character', optional: true },
      { id: 'use', type: 'choice', label: 'Allowed use', default: 'personal', options: [
        { id: 'personal', label: 'My own projects only', params: { scope: 'personal' } },
        { id: 'brand', label: 'My own brand and clients', params: { scope: 'commercial_own' } },
        { id: 'approved', label: 'Projects I approve one by one', params: { scope: 'approved' } },
      ] },
      { id: 'valid', type: 'choice', label: 'Valid for', default: 'revoke', options: [
        { id: '6m', label: '6 months', params: { months: 6 } },
        { id: '1y', label: '1 year', params: { months: 12 } },
        { id: 'revoke', label: 'Until I revoke it', params: { months: 0 } },
      ] },
    ],
    output: 'A usage record saved with your character, no new image',
    settings: still,
    cover: covers.slate,
  }),
]

const videoEditing = [
  open({
    id: 'outfit-reel', name: 'Outfit reel', kind: 'video', category: 'video-edit', hub: 'video-edit',
    blurb: 'One selfie in, a beat-cut reel of different outfits out.',
    runsOn: 'Qwen-Image 2.1, MiniMax H3 and MiniMax Music 3', workflow: 'beat_cut_reel',
    inputs: [
      { id: 'image', type: 'image', label: 'Selfie' },
      { id: 'outfits', type: 'count', label: 'Outfits', options: [3, 4, 6], default: 4, unit: 'outfits' },
    ],
    prompt: 'Make a vertical outfit reel of the person in the selfie: pick {outfits} contrasting outfits that suit them, dress them in each with their face kept, film a short pose for each look and cut the clips together so every outfit change lands on a beat of an upbeat track.',
    settings: { aspect: '9:16', duration: 10 },
    cover: covers.rose,
  }),
  open({
    id: 'beat-cut-outfits', name: 'Beat cut outfits', kind: 'video', category: 'video-edit', hub: 'video-edit', layout: 'wide',
    blurb: 'A 10 second outfit video cut to the beat of a track.',
    runsOn: 'Qwen-Image 2.1, MiniMax H3 and MiniMax Music 3', workflow: 'beat_cut_reel',
    inputs: [
      { id: 'image', type: 'image', label: 'Photo with your face clearly visible', half: true },
      { id: 'outfits', type: 'choice', label: 'Outfits', half: true, default: 'presets', options: [
        { id: 'presets', label: 'Pick for me', text: 'a run of bold street outfits chosen to suit them' },
        { id: 'mine', label: 'My own', text: 'the outfits from the outfit images' },
      ] },
      { id: 'outfit1', type: 'image', label: 'Outfit', half: true, when: ['outfits', 'mine'] },
      { id: 'outfit2', type: 'image', label: 'Outfit', optional: true, half: true, when: ['outfits', 'mine'] },
      { id: 'outfit3', type: 'image', label: 'Outfit', optional: true, half: true, when: ['outfits', 'mine'] },
      { id: 'track', type: 'choice', label: 'Track', half: true, default: 'hiphop', options: [
        { id: 'hiphop', label: 'Hip hop', text: 'a punchy hip hop beat made for the reel' },
        { id: 'house', label: 'House', text: 'a driving house track made for the reel' },
        { id: 'pop', label: 'Pop', text: 'a bright pop track made for the reel' },
        { id: 'funk', label: 'Funk', text: 'a groovy funk track made for the reel' },
        { id: 'upload', label: 'My own audio', text: 'the uploaded track' },
      ] },
      { id: 'audio', type: 'audio', label: 'Your track', when: ['track', 'upload'] },
      { id: 'shape', type: 'choice', label: 'Shape', half: true, default: 'tall', options: [
        { id: 'tall', label: '9:16', params: { aspect: '9:16' } },
        { id: 'portrait', label: '3:4', params: { aspect: '3:4' } },
        { id: 'square', label: '1:1', params: { aspect: '1:1' } },
        { id: 'classic', label: '4:3', params: { aspect: '4:3' } },
        { id: 'wide', label: '16:9', params: { aspect: '16:9' } },
      ] },
    ],
    prompt: 'A 10 second outfit video of the person in the photo wearing {outfits}, cut out cleanly and styled on a city backdrop. Cut between outfits on every beat of {track}, each look with a confident pose or step, and keep their face the same throughout.',
    settings: { aspect: '9:16', duration: 10 },
    cover: covers.night,
  }),
  open({
    id: 'sticker-match-cut', name: 'Sticker pop cuts', kind: 'video', category: 'video-edit', hub: 'video-edit',
    blurb: 'Turn the person in a clip into a glittering sticker that pops on each cut.',
    runsOn: 'SAM 3.1 and BiRefNet', workflow: 'sticker_match_cut',
    inputs: [
      { ...clip, label: 'Video with one person' },
      { id: 'finish', type: 'choice', label: 'Finish', default: 'glitter', options: [
        { id: 'glitter', label: 'Glitter', text: 'a sparkling glitter edge' },
        { id: 'holo', label: 'Holographic', text: 'a shimmering holographic rainbow edge' },
        { id: 'white', label: 'Plain white', text: 'a clean thick white edge' },
      ] },
    ],
    prompt: 'Cut the person out of every frame as a die-cut sticker with {finish}, and on each beat cut to a new matching pose that pops over a frozen background with a small bounce and a sparkle burst.',
    settings: still,
    cover: covers.lilac,
  }),
  open({
    id: 'breakdown', name: 'Labeled flat lay', kind: 'image', category: 'image-edit', hub: 'video-edit',
    blurb: 'Lay out everything in a photo with labels, like a flat lay.',
    runsOn: 'Qwen3-VL 8B and Qwen-Image 2.1', workflow: 'breakdown',
    inputs: [
      photo,
      { id: 'mode', type: 'choice', label: 'Break it into', default: 'parts', options: [
        { id: 'parts', label: 'Ingredients or parts', text: 'each ingredient or part with its rough amount' },
        { id: 'outfit', label: 'Outfit pieces', text: 'each garment and accessory the person is wearing' },
        { id: 'gear', label: 'Objects', text: 'each object in the scene' },
      ] },
    ],
    prompt: 'Identify {mode} in this photo and lay them all out as a neat flat lay on a plain light background, each item apart from the others with a thin line to a short handwritten label, every word spelled correctly and no brand names.',
    settings: { aspect: '4:5' },
    cover: covers.slate,
  }),
]

const adsAndProducts = [
  open({
    id: 'asmr-add-on', name: 'ASMR product whisper', kind: 'video', category: 'ads', hub: 'ads', layout: 'wide',
    blurb: 'Your character whispers your line about your product, ASMR style.',
    runsOn: 'Qwen-Image 2.1, Chatterbox, InfiniteTalk and HunyuanVideo-Foley', workflow: 'asmr_product',
    inputs: [
      { id: 'character', type: 'image', label: 'Character photo', half: true },
      { id: 'image', type: 'image', label: 'Product photo', half: true },
      { id: 'line', type: 'text', label: 'What they whisper', placeholder: 'This little jar fixed my whole morning routine' },
    ],
    prompt: 'Keep the character image as it is and place the product in their hands. Close up, they lean toward a studio microphone and whisper: {line} A soft breathy voice, gentle taps and crinkles on the product, slow hand movements, warm dim light and an intimate ASMR mood.',
    settings: { aspect: '9:16', duration: 8 },
    cover: covers.peach,
  }),
  open({
    id: 'asmr-classic', name: 'ASMR moment', kind: 'video', category: 'ads', hub: 'ads',
    blurb: 'Bring a photo to life with soft whispers and tingly sounds, picture unchanged.',
    runsOn: 'MiniMax H3 with native audio', workflow: 'h3_i2v_audio',
    inputs: [
      photo,
      { id: 'sounds', type: 'choice', label: 'Sounds', default: 'tapping', options: [
        { id: 'tapping', label: 'Tapping', text: 'soft fingertip tapping on wood and glass' },
        { id: 'brushing', label: 'Brushing', text: 'a soft brush sweeping across a microphone' },
        { id: 'crinkle', label: 'Crinkling', text: 'gentle paper and foil crinkles' },
        { id: 'whisper', label: 'Whispering', text: 'quiet, slow whispering' },
        { id: 'rain', label: 'Rain', text: 'light rain on a window' },
      ] },
    ],
    prompt: 'The photo comes gently to life without changing how it looks: the person leans close and whispers softly to the camera while the scene fills with {sounds}, recorded close and crisp in stereo. Slow, calm movements and no music.',
    settings: { aspect: 'auto', duration: 8 },
    cover: covers.mint,
  }),
  open({
    id: 'poster', name: 'Promo poster', kind: 'video', category: 'ads', hub: 'ads',
    blurb: 'Recast your product as a bold promo poster that comes alive.',
    // qwen_h3 draws on the format's 9:16 canvas; qwen_ltx would keep the photo's shape.
    runsOn: 'Qwen-Image 2.1 and MiniMax H3', workflow: 'qwen_h3',
    inputs: [
      product,
      { id: 'headline', type: 'text', label: 'Headline', placeholder: 'Summer, bottled' },
      { id: 'style', type: 'choice', label: 'Style', default: 'bold', options: [
        { id: 'bold', label: 'Bold color', text: 'flat saturated color blocks and oversized type' },
        { id: 'retro', label: 'Retro print', text: 'a retro screen print look with grain and off register ink' },
        { id: 'luxury', label: 'Luxury', text: 'a minimal luxury layout on deep black with thin elegant type' },
        { id: 'festival', label: 'Festival', text: 'a loud festival poster with stickers, stars and layered type' },
      ] },
    ],
    prompt: 'Design a vertical promo poster around the product in this photo: {style}, with the product large and exactly as it is, and the headline "{headline}" in big clean type, spelled exactly.',
    params: { motion: 'The video opens exactly on <Picture 1>. The poster comes to life with a subtle push in, light sweeping across the type and small graphic shapes drifting. The product and the headline stay sharp and unchanged. Audio: a short upbeat music sting.' },
    settings: { aspect: '9:16', duration: 5 },
    cover: covers.sun,
  }),
  adBeat({
    id: 'bullet-time-scene', name: 'Frozen product scene', model: bulletTime,
    blurb: 'Freeze time and orbit your product in a scene built around it.',
    prompt: 'Build a styled scene that suits this product and what it is for, then freeze time: droplets, crumbs, petals or sparks related to the product hang in mid air while the camera sweeps in a smooth arc around it, crisp commercial light.',
    cover: covers.dusk,
  }),
  adBeat({
    id: 'chameleon', name: 'Color match chameleon',
    blurb: 'A chameleon shifts its skin to match your product.',
    prompt: 'A chameleon clings to a branch beside the product from this photo. It turns its head, studies the product, and its skin ripples and shifts until it matches the product\'s colors and patterns, then it settles proudly beside it. Macro lens, soft natural light.',
    cover: covers.mint,
  }),
  open({
    id: 'asmr-host', name: 'ASMR studio host', kind: 'video', category: 'ads', hub: 'ads',
    blurb: 'Turn a photo into a host whispering to camera in an ASMR studio.',
    // The photo is who hosts, not the first frame: a new set around the same person.
    runsOn: 'MiniMax H3 with native audio', workflow: 'h3_t2v', sizes: h3Sizes,
    inputs: [photo, note],
    prompt: 'The person in the photo becomes an ASMR host in a cozy studio with foam panels, a fairy light glow and a pair of ear shaped binaural microphones in front of them. They lean in and whisper a soft welcome, tap lightly on the microphones and brush them with a soft brush, close stereo sound and no music. Keep their face and outfit. {note}',
    settings: { aspect: '9:16', duration: 8 },
    cover: covers.lilac,
  }),
  adBeat({
    id: 'macro-scene', name: 'Macro lifestyle set',
    blurb: 'Your product in macro detail inside a lifestyle set.',
    prompt: 'Build a small lifestyle set that suits this product, then glide a macro lens across it: razor thin focus slides over its textures, edges, label and finish while the set stays softly blurred around it and gentle light catches every detail.',
    cover: covers.sky,
  }),
  adBeat({
    id: 'magic-button', name: 'Button press reveal',
    blurb: 'Drop your product into a whimsical commercial moment.',
    prompt: 'A hand presses a big glowing button and the product from the photo pops into a playful, whimsical commercial scene: confetti bursts, bright props spring up around it and the camera swoops in for a hero close up. Cheerful and high energy.',
    cover: covers.rose,
  }),
  adBeat({
    id: 'giant-product', name: 'Skyline giant',
    blurb: 'Your product towers over a city skyline.',
    prompt: 'An aerial shot over a city at golden hour reveals the product from the photo standing as tall as the skyscrapers, in true scale with the street grid below, tiny cars streaming past its base and clouds drifting around its top, as the camera circles slowly from above.',
    cover: covers.night,
  }),
  adBeat({
    id: 'kick-ad', name: 'Rival kick',
    blurb: 'Your product wins as a plain rival gets kicked out of frame.',
    prompt: 'The product from the photo stands beside a plain, unbranded look-alike on a clean surface. A foot swings in and kicks the plain one out of frame in slow motion, and the camera pushes in on the product, still standing and lit like a winner. Playful and punchy.',
    cover: covers.peach,
  }),
  adBeat({
    id: 'graffiti-ad', name: 'Graffiti wall', model: { runsOn: 'Qwen-Image 2.1 and LTX-2.5', workflow: 'qwen_mockup_ltx' },
    blurb: 'Your product sprayed onto a city wall as graffiti.',
    prompt: 'Paint the product from the photo as a large, colorful graffiti piece on a brick wall in a city alley, true to its shape, label and colors, with spray drips and bold outlines, in afternoon light with a few people walking past.',
    // The chain paints the mural, then the bare wall, and LTX-2.5 runs from one to the other.
    params: { motion: 'Use the provided start image as the first frame and the provided end image as the final frame anchor. Time lapse: a street artist sprays the mural onto the bare brick wall, outlines first, then the color fills, highlights and drips, until it matches the finished piece, while the afternoon light shifts and people walk past. Spray can hiss and street sounds.' },
    cover: covers.sun,
  }),
  adBeat({
    id: 'bullet-time-splash', name: 'Product burst', model: bulletTime,
    blurb: 'Your product bursts apart in slow motion bullet time.',
    prompt: 'Time slows to a crawl as the product from the photo bursts apart into floating fragments, splashes and droplets hanging around its core, while the camera sweeps around in bullet time. The pieces then pull back together into the whole product. Dark studio and a crisp rim light.',
    cover: covers.indigo,
  }),
  adBeat({
    id: 'fridge-ad', name: 'Fridge grab',
    blurb: 'A fridge opens and a hand reaches for your product.',
    prompt: 'A fridge door swings open into soft cool light. Shelves of fresh food frame the product from the photo, chilled with a light frost and droplets. A hand reaches in, takes the product and pulls it toward the camera for a crisp close up.',
    cover: covers.sky,
  }),
  adBeat({
    id: 'volcano-ad', name: 'Volcano hero',
    blurb: 'Your product stands firm before an erupting volcano.',
    prompt: 'The product from the photo stands on dark volcanic rock in the foreground while a volcano erupts behind it, glowing lava fountaining into the night sky, embers drifting past and heat haze shimmering. The camera pushes slowly in as the orange glow lights the product.',
    cover: covers.peach,
  }),
  adBeat({
    id: 'macroshot-product', name: 'Extreme close up',
    blurb: 'Film your product in extreme close up.',
    prompt: 'Extreme macro shots of the product from the photo: the camera glides slowly across its surface, textures, edges and label in razor thin focus, a soft light sweep catches the finish, and at the end it pulls back to reveal the whole product. A dark seamless background and a premium commercial look.',
    cover: covers.slate,
  }),
  open({
    id: 'asmr-promo', name: 'ASMR product scene', kind: 'video', category: 'ads', hub: 'ads', layout: 'wide',
    blurb: 'A scripted ASMR studio scene built around your product.',
    runsOn: 'Qwen-Image 2.1, Chatterbox, InfiniteTalk and HunyuanVideo-Foley', workflow: 'asmr_product',
    inputs: [
      { id: 'character', type: 'image', label: 'Character photo', half: true },
      { id: 'image', type: 'image', label: 'Product photo', half: true },
      { id: 'script', type: 'longtext', label: 'Script', placeholder: 'Okay, let\'s open this slowly. Listen to that lid. Feel how soft the texture is.' },
    ],
    prompt: 'An ASMR studio scene: the character sits at a felt covered table with two binaural microphones under a warm lamp, and slowly unboxes, taps, opens and shows the product while whispering this script: {script} Close mic sounds for every touch, slow deliberate hand movements and a soft focus background.',
    settings: { aspect: '9:16', duration: 10 },
    cover: covers.dusk,
  }),
]

const gamesAndCharacters = [
  open({
    id: 'squad-strike', name: 'Squad strike', kind: 'video', category: 'fun', hub: 'games', layout: 'wide',
    blurb: 'Turn up to five people into a tactical game squad.',
    runsOn: 'Qwen-Image 2.1 and MiniMax H3', workflow: 'qwen_multi_h3',
    inputs: [
      { id: 'person1', type: 'image', label: 'Person', half: true },
      { id: 'person2', type: 'image', label: 'Person', optional: true, half: true },
      { id: 'person3', type: 'image', label: 'Person', optional: true, half: true },
      { id: 'person4', type: 'image', label: 'Person', optional: true, half: true },
      { id: 'person5', type: 'image', label: 'Person', optional: true, half: true },
      { ...note, half: true },
    ],
    prompt: 'Turn the people in these photos into a tactical team game squad in matching armor, helmets and gear, each keeping their own face, standing together in a dusty arena. A game cinematic look with no gore. {note}',
    params: { motion: 'The video opens exactly on <Picture 1>. The squad walks toward the camera in slow motion across the dusty arena while a burst of colored smoke goes off behind them. Audio: heavy footsteps, rattling gear and a deep boom.' },
    settings: moving,
    cover: covers.slate,
  }),
  open({
    id: 'open-world-hero', name: 'Open world hero', kind: 'video', category: 'fun', hub: 'games',
    blurb: 'See yourself as the hero of an open world city game.',
    ...kleinH3,
    inputs: [photo, note],
    prompt: 'Redraw the person in this photo as the hero of an open world city game: a painted loading screen illustration with bold outlines, saturated sunset color and palm lined streets behind. Keep their face recognizable. {note}',
    params: { motion: 'The video opens exactly on <Picture 1>. The hero turns to the camera with a confident look as a sports car rolls up beside them. The painted illustration style holds in every frame. Audio: an engine rumble and a short synth sting.' },
    settings: moving,
    cover: covers.sun,
  }),
  open({
    id: 'render-3d', name: '3D viewport render', kind: 'video', category: 'fun', hub: 'games',
    blurb: 'Render your photo as a 3D object inside a modeling scene.',
    ...kleinLtx,
    inputs: [photo, note],
    prompt: 'Turn the main subject of this photo into a clean 3D model with smooth stylized materials, shown inside a 3D modeling viewport with a gray grid floor, a soft studio light rig and a move gizmo beside it. Keep its shape, colors and character. {note}',
    params: { motion: 'Use the provided start image as the first frame. The 3D model turns slowly on the grid while a thin wireframe overlay sweeps across it and fades, and the viewport camera eases around it a little. The interface stays still. Soft interface clicks.' },
    settings: moving,
    cover: covers.indigo,
  }),
  open({
    id: 'pixel-game', name: '8-bit runner', kind: 'video', category: 'fun', hub: 'games',
    blurb: 'Your character runs through a retro 8-bit world.',
    ...kleinLtx,
    inputs: [photo, note],
    prompt: 'Turn the person in this photo into an 8-bit pixel art character with chunky pixels and a tiny palette, keeping their hair and outfit colors, standing at the start of a side scrolling level with blocks, coins and a little enemy. A retro console look. {note}',
    params: { motion: 'Use the provided start image as the first frame. The pixel character runs and jumps through the side scrolling level, bouncing on blocks, grabbing coins and hopping over the little enemy as the level scrolls past. The pixel art look stays the same. Chiptune music and coin sounds.' },
    settings: moving,
    cover: covers.mint,
  }),
]

const extras = [
  open({
    id: 'paint-app', name: 'Retro paint program', kind: 'image', category: 'fun', hub: 'extras',
    blurb: 'Frame your photo inside an old paint program on a CRT.',
    ...qwen, workflow: 'qwen_edit_mockup',
    inputs: [photo, note],
    prompt: 'Show this photo as the open canvas in a 1990s desktop paint program on a bulky CRT monitor: a gray window frame with a title bar, a tool palette of pencils, buckets and spray cans down the left, a row of color swatches along the bottom, a few rough brush strokes painted over the photo and a pixel cursor. The monitor sits on a desk beside a beige keyboard, with slight screen curve, scan lines and glare. {note}',
    settings: { aspect: '4:3' },
    cover: covers.slate,
  }),
  open({
    id: 'mural', name: 'Wall mural', kind: 'image', category: 'fun', hub: 'extras',
    blurb: 'See your photo as a huge mural on a city wall.',
    runsOn: 'Qwen-Image 2.1', workflow: 'qwen_edit_mockup',
    inputs: [photo, note],
    prompt: 'Paint this exact photo as a huge mural across the side wall of a city building, following the brick texture, windows and drainpipes with correct perspective from street level. People walk past at the base for scale in afternoon light, and the image stays clearly recognizable. {note}',
    settings: { aspect: '4:5' },
    cover: covers.peach,
  }),
  open({
    id: 'micro-beasts', name: 'Tiny animal crowd', kind: 'image', category: 'fun', hub: 'extras',
    blurb: 'Surround yourself with tiny animals of your choice.',
    ...klein,
    inputs: [
      photo,
      { id: 'animal', type: 'choice', label: 'Animal', default: 'kittens', options: [
        { id: 'kittens', label: 'Kittens', text: 'kittens' },
        { id: 'puppies', label: 'Puppies', text: 'puppies' },
        { id: 'bunnies', label: 'Bunnies', text: 'bunnies' },
        { id: 'deer', label: 'Deer', text: 'fawns and deer' },
        { id: 'alpacas', label: 'Alpacas', text: 'fluffy alpacas' },
        { id: 'ducklings', label: 'Ducklings', text: 'ducklings' },
        { id: 'piglets', label: 'Piglets', text: 'piglets' },
        { id: 'hedgehogs', label: 'Hedgehogs', text: 'hedgehogs' },
        { id: 'otters', label: 'Otters', text: 'otters' },
        { id: 'penguins', label: 'Penguins', text: 'penguins' },
        { id: 'owls', label: 'Owls', text: 'owls' },
        { id: 'foxes', label: 'Foxes', text: 'foxes' },
        { id: 'lambs', label: 'Lambs', text: 'lambs' },
        { id: 'red-pandas', label: 'Red pandas', text: 'red pandas' },
        { id: 'frogs', label: 'Frogs', text: 'little green frogs' },
        { id: 'hamsters', label: 'Hamsters', text: 'hamsters' },
      ] },
    ],
    prompt: 'Surround the person in this photo with a crowd of tiny {animal}, each small enough to sit in a hand, perched on their shoulders, peeking from pockets and gathered around their feet. Leave the person, their pose, outfit and the background exactly as they are, and light the animals to match.',
    settings: still,
    cover: covers.mint,
  }),
  open({
    id: 'image-bg-remove', name: 'Cut out the background', kind: 'image', category: 'enhance', hub: 'extras',
    blurb: 'Cut out a person, product or pet on a clean background.',
    runsOn: 'BiRefNet', workflow: 'birefnet_image',
    inputs: [
      photo,
      { id: 'result', type: 'choice', label: 'Result', default: 'transparent', options: [
        { id: 'transparent', label: 'Transparent', note: 'A PNG for any design', params: { output: 'alpha' } },
        { id: 'white', label: 'White', note: 'Clean product listing', params: { output: 'white' } },
        { id: 'green', label: 'Green screen', note: 'Solid chroma green', params: { output: 'green' } },
      ] },
    ],
    output: 'A transparent PNG cutout when you pick transparent',
    settings: still,
    cover: covers.sky,
  }),
]

const trending = [
  template({
    id: 'surprise-kiss', name: 'Surprise kiss', model: h3,
    blurb: 'Someone pops into frame and plants a quick kiss on your cheek.',
    prompt: 'A cheerful stranger leans into the frame from the side and plants a quick, playful kiss on the cheek of the person in the photo, who freezes in comic surprise and then bursts out laughing. Lighthearted meme energy, the scene and person unchanged.',
    cover: covers.rose,
  }),
  template({
    id: 'glossy-vinyl', name: 'Glossy vinyl', category: 'fun', model: kleinLtx,
    blurb: 'Restyle your look in sleek, glossy black vinyl.',
    prompt: 'Restyle the person in this photo in a sleek high fashion outfit of glossy black vinyl, a fitted jacket with a high collar and matching wide trousers, with mirror shine highlights and tasteful runway styling, in a clean studio. Keep their face and hair.',
    params: { motion: 'Use the provided start image as the first frame. They turn slowly toward the camera as studio light glides across the glossy vinyl and the highlights slide over the folds. Their face, hair and outfit stay the same. Soft studio ambience.' },
    cover: covers.night,
  }),
  template({
    id: 'tokyo-cover', name: 'Tokyo magazine', category: 'fun', model: qwenLtx,
    blurb: 'Put yourself on the cover of a Japanese street fashion magazine.',
    prompt: 'Turn this photo into the cover of a Japanese street fashion magazine: the person styled in layered street fashion, a bold invented masthead, stacked vertical cover lines, small badges and a barcode, bright pastel color and a crisp studio look. Keep their face.',
    params: { motion: 'Use the provided start image as the first frame. The cover comes alive: the person makes a small pose change and a wink while the camera pushes in slowly. Every piece of text and graphics stays sharp and unchanged. Upbeat city pop.' },
    cover: covers.rose,
  }),
  template({
    id: 'cafe-60s', name: '1960s coffee shop', category: 'fun', model: kleinLtx,
    blurb: 'Step into a 1960s coffee shop.',
    prompt: 'Place the person from this photo in a 1960s coffee shop with a chrome counter, red vinyl stools, a glowing jukebox in the corner, a checkered floor and a cup of coffee in front of them, in period hair and clothes, with warm faded film color and soft grain. Keep their face.',
    params: { motion: 'Use the provided start image as the first frame. They lift the cup, sip the coffee and glance out the window as a waitress passes behind them. Warm faded film look throughout. Jukebox music and quiet cafe chatter.' },
    cover: covers.peach,
  }),
  template({
    id: 'victory-card', name: 'Winning card', category: 'fun', model: qwenLtx,
    blurb: 'Print yourself on the winning card of a poker hand.',
    prompt: 'Turn the person in this photo into the face of a royal playing card, their portrait mirrored top and bottom with ornate gold borders and corner letters. The card lies face up on green felt among stacks of poker chips as the winning card of a hand. Keep their face recognizable.',
    params: { motion: 'Use the provided start image as the first frame. The card lifts off the felt, spins once in slow motion and lands face up again as the chips scatter. The card art stays the same. Chips clatter.' },
    cover: covers.mint,
  }),
  template({
    id: 'sand-worm', name: 'Desert worms',
    blurb: 'Giant worms rise out of the dunes behind you.',
    prompt: 'In a vast desert behind the person in the photo, the dunes ripple and colossal sand worms burst up out of the ground, their ringed bodies towering into the sky as sand pours off them like waterfalls. The person stays in place with their hair whipping in the wind as the camera pulls back to show the epic scale.',
    cover: covers.sun,
  }),
  template({
    id: 'toilet-pop', name: 'Toilet pop up',
    blurb: 'Your head pops up out of a toilet, meme style.',
    prompt: 'A clean white toilet sits in a bright bathroom. The lid flips up and the head of the person from the photo pops out of the bowl, bobbing side to side and singing a silly tune with big exaggerated expressions. Absurd internet meme humor, everything clean and cartoonish, their face recognizable.',
    cover: covers.sky,
  }),
  template({
    id: 'japanese-poster', name: 'Japanese poster', category: 'fun', model: qwenLtx,
    blurb: 'Turn your photo into a Japanese style poster with bold type.',
    prompt: 'Design a Japanese style poster around the person in this photo: a striking cutout of them over flat color blocks, big vertical Japanese headline type, small English captions, halftone textures and a bold red circle. Keep their face.',
    params: { motion: 'Use the provided start image as the first frame. The poster comes alive with a slow drift: the color blocks and the red circle pulse gently and the halftone shimmers, while all the type stays sharp and unchanged. A soft synth pad.' },
    cover: covers.rose,
  }),
  template({
    id: 'mascot', name: 'Team mascot', category: 'fun', model: kleinLtx,
    blurb: 'Become the mascot of a made-up sports team.',
    prompt: 'Turn the person in this photo into a big furry sports mascot costume with an oversized head that looks like a cartoon version of them, in invented team colors with a made-up crest, on the sidelines of a stadium with fans in the stands behind.',
    params: { motion: 'Use the provided start image as the first frame. The mascot dances and pumps up the crowd, waving its arms, while the fans cheer and wave in the stands. Stadium crowd noise and a drum beat.' },
    cover: covers.sun,
  }),
  template({
    id: 'storm-creature', name: 'Lightning monster',
    blurb: 'A huge creature looms behind you in a lightning storm.',
    prompt: 'Dark storm clouds roll in behind the person in the photo and a colossal shadowy creature rises out of the mist, its silhouette revealed for a split second by each flash of lightning. Rain lashes down, the person stays calm in the foreground and the camera slowly tilts up to the creature. Epic and moody, no gore.',
    cover: covers.night,
  }),
  template({
    id: 'burning-sunset', name: 'Ember sunset',
    blurb: 'Sit in a fiery sunset full of drifting sparks.',
    prompt: 'The sky behind the person in the photo blazes into a fiery orange and magenta sunset with a huge sun on the horizon, and glowing sparks and embers drift up through the air around them like fireflies. Warm light washes over their face, a breeze moves their hair and the camera eases slowly in.',
    cover: covers.peach,
  }),
  open({
    id: 'comic-story', name: 'Comic story', kind: 'video', category: 'fun', hub: 'trending',
    blurb: 'Star in a short comic story with panels and speech bubbles.',
    ...qwenLtx,
    inputs: [
      photo,
      { id: 'plot', type: 'text', label: 'What happens', optional: true, placeholder: 'Saving a cat from a tree' },
    ],
    prompt: 'Turn the person in this photo into the hero of a short comic book page told in four panels, with bold ink lines, halftone shading, caption boxes and speech bubbles with short exclamations spelled correctly. The story: {plot} Keep their face recognizable.',
    params: { motion: 'Use the provided start image as the first frame. The camera glides from panel to panel across the comic page, and each panel comes to life with small movements as the camera passes. The ink lines, panel borders and lettering stay the same. Page turn and comic sound effects.' },
    settings: moving,
    cover: covers.sun,
  }),
  template({
    id: 'mukbang', name: 'Eating show', model: h3,
    blurb: 'Eat on camera mukbang style with snappy crash zooms.',
    prompt: 'The person in the photo sits at a table piled with colorful food in front of a phone camera, takes a big bite, eats with delighted reactions and gives a thumbs up, while the camera crash zooms into their face and the food on every bite. Bright ring light and playful energy.',
    cover: covers.peach,
  }),
  template({
    id: 'melting-doodle', name: 'Doodle melt',
    blurb: 'Your face melts away into hand-drawn doodle lines.',
    prompt: 'The person in the photo slowly dissolves into hand drawn doodle lines: their outline wobbles, the colors drain to black marker on white paper, and the lines droop, drip and melt down the page in loose squiggles until only a scribbled puddle remains. A playful animated sketchbook style with a locked camera.',
    cover: covers.slate,
  }),
  template({
    id: 'giallo-scene', name: '70s thriller',
    blurb: 'A 1970s Italian thriller scene with a mysterious figure behind you.',
    prompt: 'The scene turns into a 1970s Italian thriller with saturated red and green light, film grain and a slow zoom. A mysterious figure in a black coat, black gloves and a wide brimmed hat appears in the shadows behind the person in the photo, who senses something and turns. Suspense only, nothing violent shown.',
    cover: covers.rose,
  }),
  template({
    id: 'renaissance', name: 'Gallery masterpiece', category: 'fun', model: kleinLtx,
    blurb: 'Hang as a classical painting in a busy gallery.',
    prompt: 'Turn the person in this photo into a Renaissance oil portrait in an ornate gold frame, with soft hazy light, a rich dark background, period clothing and fine cracks in the varnish. The painting hangs in a crowded museum gallery with visitors in front of it.',
    params: { motion: 'Use the provided start image as the first frame. Visitors gather in front of the painting, point and take photos with their phones, and the painted figure subtly blinks and smiles. The frame and the painting stay in place. Quiet gallery murmur.' },
    cover: covers.dusk,
  }),
  open({
    id: 'rap-video', name: 'Rap video', kind: 'video', category: 'fun', hub: 'trending',
    blurb: 'Your photo performs a rap with fresh lyrics and a beat.',
    runsOn: 'Qwen3.8, MiniMax Music 3 and InfiniteTalk', workflow: 'rap_video',
    inputs: [
      photo,
      { id: 'topic', type: 'text', label: 'What the verse is about', optional: true, placeholder: 'Being the first one up on a Monday' },
      { id: 'beat', type: 'choice', label: 'Beat', default: 'boom-bap', options: [
        { id: 'boom-bap', label: 'Boom bap', text: 'a dusty boom bap' },
        { id: 'trap', label: 'Trap', text: 'a hard hitting trap' },
        { id: 'old-school', label: 'Old school', text: 'a bouncy old school' },
        { id: 'lofi', label: 'Lo-fi', text: 'a mellow lo-fi' },
      ] },
    ],
    prompt: 'Write a short, clean, playful rap verse about {topic}, produce {beat} beat with the vocal on it, and make the person in the photo perform it to the camera with accurate lip sync, head nods and hand gestures in a moody music video set with colored lights.',
    output: 'A music video with lyrics and a beat',
    settings: { aspect: '9:16', duration: 15 },
    cover: covers.night,
  }),
  template({
    id: 'open-world', name: 'Open world run', category: 'fun', model: kleinH3,
    blurb: 'Run, jump and drive through an open world game as yourself.',
    prompt: 'Turn the person in this photo into the player character of a third person open world game on a sunny city street, seen from over the shoulder with a minimap and a health bar on screen. Game engine graphics, their face, hair and outfit recognizable.',
    params: { motion: 'The video opens exactly on <Picture 1>. The character sprints down the street, vaults a low wall and hops into an open top car that drives off, the camera following over the shoulder. The minimap and health bar stay fixed on screen. Audio: footsteps, an engine and city sounds.' },
    cover: covers.sky,
  }),
  template({
    id: 'booking-photo', name: 'Booking photo', category: 'fun', model: qwenLtx,
    blurb: 'A tongue-in-cheek police booking photo, height chart and all.',
    prompt: 'Turn this photo into a playful police booking photo: the person stands against a height chart holding a placard with a made-up number and today\'s date, under flat, harsh light. Lighthearted, with nothing incriminating written.',
    params: { motion: 'Use the provided start image as the first frame. They turn to the side for the profile shot and back to the camera with a cheeky smile as the flash pops. The placard text stays the same. Camera shutter and flash sounds.' },
    cover: covers.slate,
  }),
  template({
    id: 'ghoul-night', name: 'Ghoul night',
    blurb: 'Pale ghouls creep out of the dark around you.',
    prompt: 'Night falls over the scene in the photo and pale, hollow eyed ghouls creep slowly out of the darkness toward the person, lit by flickering cold light and drifting fog. The person glances over their shoulder as the camera pushes in. A spooky horror short mood, no gore.',
    cover: covers.night,
  }),
  template({
    id: 'social-icons', name: 'Notification swarm', category: 'fun', model: qwenLtx,
    blurb: 'Surround your photo with floating app-style icons.',
    prompt: 'Surround the person in this photo with glossy 3D icons of hearts, thumbs up, chat bubbles, play buttons, bells and stars, all generic with no real logos, floating around them with small notification counters.',
    params: { motion: 'Use the provided start image as the first frame. The icons float and orbit around the person, pop with little bursts and stack up like notifications as the counters tick upward. Bright pops and chimes.' },
    cover: covers.lilac,
  }),
  template({
    id: 'idol-stage', name: 'Idol stage', category: 'fun', model: kleinH3,
    blurb: 'Take the stage as a pop idol.',
    prompt: 'Restyle the person in this photo as a pop idol in a sparkling stage outfit, standing on a big concert stage under spotlights with a sea of light sticks in the crowd. Keep their face.',
    params: { motion: 'The video opens exactly on <Picture 1>. They hit a pose, dance a short routine and wave to the crowd while spotlights sweep, confetti falls and a crane camera glides past. Audio: an upbeat pop track and a cheering crowd.' },
    cover: covers.rose,
  }),
  template({
    id: 'banana-snack', name: 'Banana break',
    blurb: 'Calmly eat a banana in a plain scene.',
    prompt: 'The person in the photo peels a banana slowly and eats it with a completely calm, deadpan expression, looking straight into the camera between bites. A plain still background and a locked camera, with the dry humor of a meme video.',
    cover: covers.sun,
  }),
]

export const apps2 = [...professional, ...enhanceAndStyle, ...faceAndIdentity, ...videoEditing, ...adsAndProducts, ...gamesAndCharacters, ...extras, ...trending]
