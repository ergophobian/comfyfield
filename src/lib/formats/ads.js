// Product videos, UGC and ad variants.
import { open, note, covers } from './parts.js'
import { h3Sizes } from '../catalog.js'

// The angles a set of static ads can take. Ads from a link makes each picked angle as its own step on
// FLUX 3 Klein, with the product photo from the page as the reference.
export const adAngles = [
  { id: 'offer', label: 'Price or offer', note: 'Lead with the deal', text: 'lead with the price or the offer in a big, bold headline, with a small call to action' },
  { id: 'ingredient', label: 'What is inside', note: 'Materials or ingredients', text: 'show what it is made of, with the product beside its key materials or ingredients and two or three short labels' },
  { id: 'how', label: 'How to use', note: 'Show it in three steps', text: 'show how to use it in three numbered steps, each with a small picture and a few words' },
  { id: 'lifestyle', label: 'Lifestyle', note: 'The product in real life', text: 'show the product in use in a real, sunlit everyday scene, like an iPhone photo, with a short headline' },
  { id: 'proof', label: 'Social proof', note: 'Reviews and ratings', text: 'lead with a five star rating and a short customer quote next to the product' },
  { id: 'compare', label: 'Side by side', note: 'You against the rest', text: 'compare the product side by side with a generic plain alternative, with check marks for the product' },
  { id: 'fix', label: 'Problem and fix', note: 'The pain, then the product', text: 'show the everyday problem on one side and the product as the fix on the other, with a short headline' },
]
export const defaultAngles = ['offer', 'lifestyle', 'proof', 'fix']

// Ads from a link, for any set of angles. The gallery entry uses defaultAngles; the Ads studio builds
// one for the angles the user picks. Read page (the url input's `reads`) fills the page text and photo.
export function linkToAds(angleIds) {
  const picked = adAngles.filter((a) => angleIds.includes(a.id))
  return open({
    id: 'link-to-ads', name: 'Ads from a link', kind: 'image', category: 'ads', hub: 'ads', shape: 'pipeline',
    blurb: 'Paste a product page and get a set of ready ads.',
    runsOn: 'FLUX 3 Image Klein',
    inputs: [
      { id: 'url', type: 'text', label: 'Product page link', optional: true, placeholder: 'https://yourshop.com/products/linen-tote', reads: { text: 'page', image: 'image' } },
      { id: 'page', type: 'longtext', label: 'What the page says', rows: 3, placeholder: 'Linen tote, $48. A roomy everyday tote in washed linen with a leather base.' },
      { id: 'image', type: 'image', label: 'Product photo' },
      { id: 'count', type: 'count', label: 'Ads per angle', options: [1, 2, 3, 4], default: 1, unit: 'ads', half: true },
      { id: 'size', type: 'choice', label: 'Size', half: true, default: 'square', options: [
        { id: 'square', label: 'Square', note: 'Feed, 1:1', text: 'square feed ad', params: { aspect: '1:1' } },
        { id: 'portrait', label: 'Portrait', note: 'Feed, 4:5', text: 'portrait feed ad', params: { aspect: '4:5' } },
        { id: 'story', label: 'Story', note: 'Tall, 9:16', text: 'vertical story ad', params: { aspect: '9:16' } },
        { id: 'banner', label: 'Banner', note: 'Wide, 16:9', text: 'wide banner ad', params: { aspect: '16:9' } },
      ] },
      { id: 'brand', type: 'brand', label: 'Brand', optional: true },
    ],
    settings: { aspect: '1:1' },
    steps: picked.map((angle) => ({
      id: angle.id, provider: 'comfy', workflow: 'klein_edit_canvas', kind: 'image', from: [],
      prompt: `A {size} for the product in the first image. The product page says: {page}. This ad should ${angle.text}. Keep the product exactly as it is in the photo, with the same shape, label and colors. Clean layout, sharp commercial light, every word spelled right and easy to read. In the colors of the brand {brand}, if one is named.`,
      bindings: { count: 'count' }, settings: { aspect: '1:1' },
    })),
    outputs: picked.map((angle) => ({ step: angle.id, kind: 'image' })),
    cover: covers.mint,
  })
}

export const ads = [
  open({
    id: 'product-ad', name: 'Product to ad', kind: 'video', category: 'ads', featured: true,
    blurb: 'Turn a product into a short vertical ad.',
    runsOn: 'MiniMax H3', workflow: 'h3_product_ad',
    inputs: [
      { id: 'product', type: 'product', label: 'Product' },
      { id: 'brand', type: 'brand', label: 'Brand', optional: true },
      { id: 'style', type: 'choice', label: 'Style', default: 'spin', options: [
        { id: 'spin', label: 'Studio spin', text: 'the product turns slowly on a turntable in a clean studio with a soft key light and a glossy reflection while the camera pushes in on the details' },
        { id: 'lifestyle', label: 'Lifestyle', text: 'the product in use in a bright, lived-in everyday setting with natural light, a hand reaching in to pick it up' },
        { id: 'unboxing', label: 'Unboxing', text: 'hands open a clean box and lift the product out, top down view, soft daylight, a satisfying reveal' },
        { id: 'bold', label: 'Bold text', text: 'the product pops in against a bold solid color background with fast punchy camera moves and open space for large headline text' },
      ] },
    ],
    prompt: 'A vertical product ad for {product}: {style}. Keep the product shape, label and colors exactly the same in every frame, crisp commercial lighting. In the colors of the brand {brand}, if one is named.',
    settings: { aspect: '9:16', duration: 5 },
    cover: covers.sun,
  }),
  open({
    id: 'ugc-ad', name: 'UGC ad', kind: 'video', category: 'ads', layout: 'wide',
    blurb: 'Your character talks about your product to camera.',
    // H3 makes the speech with the picture, so the ad needs no separate voice step. A voice sample
    // becomes <Audio 1>, the voice H3 copies; without one, H3 picks a voice that fits the character.
    runsOn: 'MiniMax H3', workflow: 'ugc_ad', sizes: h3Sizes,
    inputs: [
      { id: 'character', type: 'character', label: 'Character', half: true },
      { id: 'product', type: 'product', label: 'Product', half: true },
      { id: 'camera', type: 'choice', label: 'Camera', half: true, default: 'selfie', options: [
        { id: 'selfie', label: 'Selfie handheld', text: 'films a casual selfie video at arm\'s length in a bright home, with an authentic handheld feel' },
        { id: 'tripod', label: 'Tripod', text: 'sits in front of a phone on a tripod at eye level in a bright home, framed from the chest up' },
        { id: 'walking', label: 'Walking', text: 'films a walk and talk selfie video down a sunny street, with a natural bounce in the frame' },
        { id: 'car', label: 'Car dashboard', text: 'films from a phone on the dashboard while sitting in the driver seat of a parked car' },
      ] },
      { id: 'emotion', type: 'choice', label: 'Emotion', half: true, default: 'excited', options: [
        { id: 'excited', label: 'Excited', text: 'excited and bubbly, like sharing a great find with a friend' },
        { id: 'warm', label: 'Warm', text: 'warm and friendly, with an easy smile' },
        { id: 'honest', label: 'Honest', text: 'calm and matter of fact, like an honest review' },
        { id: 'surprised', label: 'Surprised', text: 'pleasantly surprised, like they did not expect it to work this well' },
        { id: 'playful', label: 'Playful', text: 'playful and funny, with quick expressive reactions' },
      ] },
      { id: 'script', type: 'longtext', label: 'Script', placeholder: 'Okay, I did not expect to love this as much as I do. Here is why it lives in my bag now.' },
      { id: 'voice', type: 'audio', label: 'Voice sample', optional: true, half: true, text: 'They speak in the voice from <Audio 1>.' },
      { id: 'length', type: 'choice', label: 'Length', half: true, default: '10', options: [
        { id: '5', label: '5 seconds', note: 'One line', params: { duration: 5, seconds: 5 } },
        { id: '10', label: '10 seconds', note: 'Two or three lines', params: { duration: 10, seconds: 10 } },
        { id: '15', label: '15 seconds', note: 'A short review', params: { duration: 15, seconds: 15 } },
      ] },
      { id: 'sound', type: 'text', label: 'Background sound', optional: true, placeholder: 'In the background, soft cafe chatter and an espresso machine' },
    ],
    prompt: 'A vertical iPhone UGC ad. The person in <Picture 1> ({character}) {camera}, holding the product in <Picture 2> ({product}) and talking straight to the camera, {emotion}. Keep their face and the product shape, label and colors exactly the same in every frame. They say: "{script}" {voice} {sound}',
    settings: { aspect: '9:16', duration: 10 },
    cover: covers.peach,
  }),
  open({
    id: 'ad-variants', name: 'Ad variants', kind: 'image', category: 'ads',
    blurb: 'Spin one ad into many versions to test.',
    runsOn: 'Qwen-Image 2.1', workflow: 'qwen_edit_variants',
    inputs: [
      { id: 'image', type: 'image', label: 'Your ad' },
      { id: 'variants', type: 'count', label: 'Variants', options: [4, 8, 12], default: 4, unit: 'variants' },
      { id: 'change', type: 'choice', label: 'Change', default: 'headline', options: [
        { id: 'headline', label: 'Headline', text: 'rewrite only the headline with a different angle, keeping the same font style and layout' },
        { id: 'background', label: 'Background', text: 'change only the background scene, keeping the product, text and layout' },
        { id: 'color', label: 'Color', text: 'change only the color palette, keeping the layout, product and text' },
        { id: 'everything', label: 'Everything', text: 'try a fresh layout, background, palette and headline while the product stays recognizable' },
      ] },
    ],
    prompt: 'Make a new variant of this ad: {change}. Keep the product exactly as it is and all text legible.',
    bindings: { count: 'variants' },
    settings: { aspect: 'auto' },
    cover: covers.indigo,
  }),
  linkToAds(defaultAngles),
  open({
    id: 'recreate-ad', name: 'Recreate an ad', kind: 'video', category: 'ads', layout: 'wide',
    blurb: 'Remake an ad shot for shot with your own product.',
    runsOn: 'Bernini-R', workflow: 'bernini_recreate_ad',
    inputs: [
      { id: 'reference', type: 'video', label: 'Ad to recreate' },
      { id: 'product', type: 'product', label: 'Product', half: true },
      { id: 'brand', type: 'brand', label: 'Brand', optional: true, half: true },
      { id: 'character', type: 'character', label: 'Character', optional: true, half: true },
      { ...note, half: true },
    ],
    prompt: 'Recreate the reference ad shot for shot with the product in image 0 ({product}) in place of the original product, in the colors of the brand {brand} if one is named. Keep the cuts, pacing, camera moves, length and structure, replace any presenter with the person in image 1 when one is given, and keep the product shape, label and colors exact in every frame. {note}',
    settings: { aspect: 'auto' },
    cover: covers.dusk,
  }),
  open({
    id: 'product-spin', name: 'Product spin', kind: 'video', category: 'ads',
    blurb: 'A smooth 360 degree turn of your product.',
    runsOn: 'MiniMax H3', workflow: 'h3_open_i2v', sizes: h3Sizes,
    inputs: [
      { id: 'image', type: 'image', label: 'Product photo' },
      { id: 'background', type: 'choice', label: 'Background', default: 'white', options: [
        { id: 'keep', label: 'Keep the photo', text: 'the original background from the photo' },
        { id: 'white', label: 'White studio', text: 'a seamless white studio background with a soft floor shadow' },
        { id: 'dark', label: 'Dark studio', text: 'a dark studio background with a soft rim light and a glossy reflection' },
        { id: 'pastel', label: 'Soft color', text: 'a soft pastel color backdrop' },
        { id: 'pedestal', label: 'Pedestal', text: 'a round stone pedestal under a gentle spotlight' },
      ] },
    ],
    prompt: 'The product makes one smooth, full 360 degree turn on a turntable against {background}. The camera stays still and the product keeps its exact shape, label and colors from every side, even studio light.',
    settings: { aspect: 'auto', duration: 5 },
    cover: covers.slate,
  }),
  open({
    id: 'packshot', name: 'Bullet time packshot', kind: 'video', category: 'ads', hub: 'ads',
    blurb: 'Freeze time and sweep the camera around your product.',
    runsOn: 'MiniMax H3', workflow: 'h3_product_ad', sizes: h3Sizes,
    inputs: [
      { id: 'image', type: 'image', label: 'Product photo' },
      { id: 'background', type: 'choice', label: 'Background', default: 'white', options: [
        { id: 'white', label: 'White', text: 'a seamless white studio background' },
        { id: 'color', label: 'Bold color', text: 'a bold solid color backdrop that complements the product' },
        { id: 'scene', label: 'Scene', text: 'a styled scene that suits the product, softly lit with depth behind it' },
      ] },
    ],
    prompt: 'A bullet time packshot: time freezes with splashes, droplets and particles hanging in mid air around the product while the camera sweeps in a fast, smooth arc around it against {background}. The product keeps its exact shape, label and colors, with crisp commercial lighting and a glossy finish.',
    settings: { aspect: 'auto', duration: 5 },
    cover: covers.rose,
  }),
  open({
    id: 'billboard', name: 'Billboard mockup', kind: 'image', category: 'ads', hub: 'ads',
    blurb: 'See your ad out in the world before you print it.',
    runsOn: 'Qwen-Image 2.1', workflow: 'qwen_edit_mockup',
    inputs: [
      { id: 'image', type: 'image', label: 'Your ad' },
      { id: 'place', type: 'choice', label: 'Place', default: 'city', options: [
        { id: 'city', label: 'City billboard', text: 'a large billboard above a busy city street at golden hour, seen from street level' },
        { id: 'bus', label: 'Bus side', text: 'the side panel of a city bus parked at a stop in daylight' },
        { id: 'subway', label: 'Subway poster', text: 'a backlit poster on a subway platform wall with commuters blurred in motion' },
        { id: 'phone', label: 'Phone in hand', text: 'the screen of a phone held in a hand, with a softly blurred cafe behind' },
        { id: 'magazine', label: 'Magazine page', text: 'a full page of an open glossy magazine lying on a wooden table' },
      ] },
    ],
    prompt: 'Place this exact ad onto {place}. Fit it to the surface with correct perspective, lighting, reflections and texture so it looks photographed in place. Keep every word, logo and color of the ad unchanged.',
    settings: { aspect: '16:9' },
    cover: covers.sky,
  }),
  open({
    id: 'truck-ad', name: 'Truck ad', kind: 'video', category: 'ads', hub: 'ads',
    blurb: 'Watch your ad roll down a city street on the side of a truck.',
    runsOn: 'Qwen-Image 2.1 and MiniMax H3', workflow: 'h3_truck_ad',
    inputs: [
      { id: 'image', type: 'image', label: 'Your ad' },
      { id: 'street', type: 'choice', label: 'Street', default: 'day', options: [
        { id: 'day', label: 'Day', text: 'a busy city street on a bright, sunny day' },
        { id: 'night', label: 'Night', text: 'a city street at night, with glowing shop signs and wet reflections on the road' },
      ] },
    ],
    prompt: 'A box truck drives slowly past the camera down {street}, with this exact ad wrapped across its side panel. The ad keeps every word, logo and color, follows the panel with correct perspective and catches the street light naturally, while traffic and people move in the background.',
    settings: { aspect: '16:9', duration: 5 },
    cover: covers.night,
  }),
  open({
    id: 'hook-check', name: 'Hook check', kind: 'video', category: 'ads', hub: 'professional',
    blurb: 'Score the first three seconds of your ad and learn how to fix them.',
    runsOn: 'Qwen3-VL 8B', workflow: 'qwen3_vl_hook_check',
    inputs: [
      { id: 'video', type: 'video', label: 'Your ad or short' },
      { ...note, placeholder: 'Who it is for, or what to look at' },
    ],
    prompt: 'Watch the first three seconds of this video and score from 1 to 10 how well the hook stops the scroll. Say what works and what loses attention, then give three specific changes to the opening shot, text or sound that would make it stronger. {note}',
    output: 'A score for the first three seconds and notes on how to improve it',
    settings: { aspect: 'auto' },
    cover: covers.lilac,
  }),
]
