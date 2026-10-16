// Option lists for the AI influencer builder, Photodump sets and Fashion factory templates.
import { covers } from '../../lib/formats/parts.js'

const opts = (labels) => labels.map((label) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), label }))
const swatch = (pairs) => pairs.map(([label, color]) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label, color }))

// Nineteen groups, in the order the builder shows them. kind: 'type' picture cards, 'swatch' color chips, or plain pills.
export const builder = [
  { id: 'type', label: 'Character type', kind: 'type', options: opts(['Average', 'Bold', 'Extreme', 'Insect', 'Frog', 'Cat', 'Dog', 'Rodent', 'Bird']) },
  { id: 'gender', label: 'Gender', options: opts(['Woman', 'Man', 'Non-binary', 'Androgynous', 'Any']) },
  { id: 'build', label: 'Build', options: opts(['Slim', 'Lean', 'Athletic', 'Average', 'Curvy', 'Muscular', 'Heavy']) },
  { id: 'hair', label: 'Hairstyle', options: opts(['Bald', 'Buzz cut', 'Crew cut', 'Pixie', 'Bob', 'Lob', 'Shoulder length', 'Long straight', 'Long wavy', 'Curly', 'Coily', 'Afro', 'Braids', 'Box braids', 'Cornrows', 'Locs', 'Bun', 'Top knot', 'Ponytail', 'High ponytail', 'Pigtails', 'Curtain bangs', 'Mullet', 'Undercut', 'Pompadour', 'Slicked back']) },
  { id: 'hairColor', label: 'Hair color', kind: 'swatch', options: swatch([['Black', '#1b1b1f'], ['Dark brown', '#3b2a20'], ['Light brown', '#8a6243'], ['Auburn', '#7f3524'], ['Red', '#b23a22'], ['Copper', '#c56a2d'], ['Blonde', '#e2c27a'], ['Platinum', '#efe6cf'], ['Gray', '#9a9a9e'], ['White', '#f4f2ee'], ['Pink', '#f2a3c0'], ['Blue', '#5b8fe0'], ['Green', '#5fae7a']]) },
  { id: 'style', label: 'Style', options: opts(['Streetwear', 'Minimal', 'Y2K', 'Preppy', 'Business', 'Athleisure', 'Boho', 'Gothic']) },
  { id: 'ethnicity', label: 'Ethnicity', options: opts(['African', 'East Asian', 'South Asian', 'European', 'Latin American', 'Middle Eastern']) },
  { id: 'age', label: 'Age', options: opts(['Young adult', 'Adult', 'Senior']) },
  { id: 'skin', label: 'Skin color', kind: 'swatch', options: swatch([['Porcelain', '#f6e3d6'], ['Fair', '#efd2bd'], ['Light', '#e2b896'], ['Medium', '#c99671'], ['Olive', '#a8805a'], ['Tan', '#8e6142'], ['Brown', '#6a4430'], ['Deep', '#3e2820']]) },
  { id: 'height', label: 'Height', options: opts(['Short', 'Average', 'Tall']) },
  { id: 'proportions', label: 'Proportions', options: opts(['Natural', 'Elongated', 'Compact', 'Heroic', 'Cartoon']) },
  { id: 'head', label: 'Head shape', options: opts(['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong', 'Triangle', 'Rectangle', 'Pear', 'Wide']) },
  { id: 'neck', label: 'Neck', options: opts(['Short', 'Average', 'Long', 'Thick']) },
  { id: 'eyes', label: 'Eye shape', options: opts(['Almond', 'Round', 'Hooded', 'Monolid', 'Upturned', 'Downturned', 'Deep set', 'Wide set', 'Close set', 'Prominent', 'Cat eye']) },
  { id: 'eyeColor', label: 'Eye color', kind: 'swatch', options: swatch([['Dark brown', '#3a2416'], ['Brown', '#6b4226'], ['Hazel', '#8a7240'], ['Amber', '#b9822e'], ['Green', '#4f7d4a'], ['Blue', '#4f7fb8'], ['Gray', '#8b949c'], ['Violet', '#7d62a8']]) },
  { id: 'features', label: 'Features', multi: true, options: opts(['Full lips', 'Thin lips', 'Button nose', 'Roman nose', 'Wide nose', 'Upturned nose', 'High cheekbones', 'Dimples', 'Strong jaw', 'Soft jaw', 'Cleft chin', 'Pointed chin', 'Thick brows', 'Thin brows', 'Arched brows', 'Straight brows', 'Long lashes', 'Gap teeth', 'Wide smile', 'Prominent ears', 'Pointed ears', 'Rosy cheeks', 'Broad forehead', 'Hollow cheeks', 'Heavy lids']) },
  { id: 'facialHair', label: 'Facial hair', options: opts(['None', 'Stubble', 'Mustache', 'Goatee', 'Short beard', 'Full beard', 'Long beard', 'Sideburns']) },
  { id: 'marks', label: 'Distinctive features', multi: true, options: opts(['Freckles', 'Beauty mark', 'Scar', 'Tattoos', 'Face tattoo', 'Nose ring', 'Vitiligo', 'Birthmark', 'Heterochromia', 'Gold teeth', 'Braces', 'Eye patch', 'Laugh lines', 'Face paint']) },
  { id: 'accessories', label: 'Accessories', multi: true, options: opts(['Glasses', 'Sunglasses', 'Earrings', 'Necklace', 'Hat', 'Headphones']) },
]

// Starting builds for the Explore feed. Recreate copies these picks into the builder.
export const influencerPresets = [
  { id: 'runner', name: 'Rooftop runner', cover: covers.sun, picks: { type: 'average', gender: 'woman', build: 'athletic', hair: 'high-ponytail', hairColor: 'black', style: 'athleisure', age: 'young-adult', accessories: ['headphones'] } },
  { id: 'chef', name: 'Silver fox chef', cover: covers.peach, picks: { type: 'average', gender: 'man', build: 'average', hair: 'slicked-back', hairColor: 'gray', style: 'business', age: 'senior', facialHair: 'short-beard', marks: ['laugh-lines'] } },
  { id: 'poet', name: 'Goth poet', cover: covers.night, picks: { type: 'bold', gender: 'non-binary', build: 'slim', hair: 'long-straight', hairColor: 'black', style: 'gothic', marks: ['nose-ring', 'tattoos'] } },
  { id: 'frog', name: 'Frog crooner', cover: covers.mint, picks: { type: 'frog', gender: 'man', build: 'heavy', style: 'preppy', accessories: ['hat'] } },
  { id: 'cat', name: 'Cat couture', cover: covers.rose, picks: { type: 'cat', gender: 'woman', build: 'slim', style: 'y2k', accessories: ['sunglasses', 'earrings'] } },
  { id: 'bird', name: 'Bird on the decks', cover: covers.sky, picks: { type: 'bird', gender: 'any', style: 'streetwear', accessories: ['headphones'] } },
  { id: 'lifter', name: 'Big lift energy', cover: covers.dusk, picks: { type: 'extreme', gender: 'man', build: 'muscular', hair: 'buzz-cut', style: 'athleisure', features: ['strong-jaw'] } },
  { id: 'gamer', name: 'Cozy streamer', cover: covers.lilac, picks: { type: 'average', gender: 'woman', build: 'average', hair: 'bob', hairColor: 'pink', style: 'minimal', accessories: ['glasses', 'headphones'], marks: ['freckles'] } },
]

export const motionModes = [
  { id: 'transfer', label: 'Motion transfer', note: 'Copy the moves from a video' },
  { id: 'swap', label: 'Swap objects', note: 'Put your influencer into a video' },
]
export const motionResolutions = ['480p', '720p', '1080p']

// Nine Photodump sets. Each lists its scenes; a bigger set walks the list again from new angles.
export const photodumpSets = [
  { id: 'nap', name: 'Nap anywhere', blurb: 'Fast asleep where nobody sleeps', cover: covers.sky,
    scenes: ['Sand dunes at noon', 'An empty train car', 'A field under lightning', 'A drained pool', 'A museum bench', 'A rooftop at sunrise', 'A laundromat at night', 'A rowboat on a lake'] },
  { id: 'calm', name: 'Calm everywhere', blurb: 'Cross-legged and serene in wild places', cover: covers.lilac,
    scenes: ['An old town rooftop', 'A stormy beach', 'The hood of a snowy car', 'A ring of standing stones', 'A busy crosswalk', 'A frozen lake', 'A neon arcade', 'A cliff edge at dawn'] },
  { id: 'glow', name: 'Golden candids', blurb: 'Warm, soft, caught in the moment', cover: covers.sun,
    scenes: ['Laughing at a cafe window', 'Biking down a leafy street', 'Reading on a sunlit bed', 'A picnic in the park', 'A balcony at golden hour', 'A market street', 'Dancing in the kitchen', 'A car window at sunset'] },
  { id: 'office', name: 'Office wear', blurb: 'Sharp workwear, everyday office scenes', cover: covers.slate,
    scenes: ['A glass meeting room', 'Coffee by the elevators', 'A desk with two screens', 'A lobby with a city view', 'A call on the stairs', 'A whiteboard session', 'Late at the office', 'The morning commute'] },
  { id: 'surreal', name: 'Surreal me', blurb: 'Dream logic, played straight', cover: covers.indigo,
    scenes: ['Floating above a bed', 'A room full of balloons', 'Walking up a wall', 'Flowers raining indoors', 'Sitting in a giant teacup', 'Clouds in a hallway', 'An upside down city', 'A doorway in the sea'] },
  { id: 'surreal-2', name: 'Surreal me, part two', blurb: 'More impossible rooms', cover: covers.dusk,
    scenes: ['A melting staircase', 'Fish swimming through the air', 'A moon in the living room', 'Grass growing on a piano', 'A desert of mirrors', 'Snow in a library', 'A boat in the sky', 'Stars on the kitchen floor'] },
  { id: 'alter', name: 'Alter ego', blurb: 'You, living another life', cover: covers.peach,
    scenes: ['A rock star backstage', 'An astronaut in a capsule', 'A chess champion', 'A racing driver in the pits', 'An opera singer on stage', 'A detective in the rain', 'A chef at the pass', 'A pilot in the cockpit'] },
  { id: 'roll', name: 'Cool camera roll', blurb: 'Easy shots for the feed', cover: covers.rose,
    scenes: ['A flash mirror selfie', 'Sunglasses by the pool', 'A night out in a taxi', 'A thrift store fitting room', 'In a concert crowd', 'A street corner at dusk', 'The skate park', 'Ice cream on the curb'] },
  { id: 'archive', name: 'Menswear archive', blurb: 'Classic menswear, editorial frames', cover: covers.night,
    scenes: ['A tailored coat in fog', 'Leather on a motorbike', 'Knitwear in a library', 'Linen by the sea', 'Workwear in a garage', 'An overcoat on a platform', 'Denim on a rooftop', 'A suit at the barber'] },
]
export const setSizes = [4, 8, 15, 26]
export const photoRatios = ['3:4', '4:5', '2:3', '1:1', '9:16']
export const qualities = ['1.5k', '2k']

// Fashion factory lookbook templates.
export const fashionTemplates = [
  { id: 'studio', name: 'Studio lookbook', note: 'Seamless backdrop, front and side', cover: covers.slate },
  { id: 'street', name: 'Street editorial', note: 'City sidewalks, candid stride', cover: covers.dusk },
  { id: 'runway', name: 'Runway', note: 'Catwalk lights and a crowd', cover: covers.night },
  { id: 'catalog', name: 'Catalog', note: 'Clean e-commerce frames', cover: covers.sky },
  { id: 'campaign', name: 'Campaign', note: 'Bold color, big attitude', cover: covers.rose },
  { id: 'mirror', name: 'Mirror selfie', note: 'Fitting room, phone in hand', cover: covers.lilac },
  { id: 'resort', name: 'Resort', note: 'Sun, pool and sea air', cover: covers.sun },
  { id: 'night', name: 'Night out', note: 'Flash, neon and a taxi', cover: covers.indigo },
]
// Each mix lists the frames one look gets, in order.
export const lookbookShots = [
  { id: 'hero', label: 'Hero shots', note: 'Full body and three quarter', frames: ['Full body', 'Three quarter'] },
  { id: 'full', label: 'Full lookbook', note: 'Front, side, back and a detail', frames: ['Front', 'Side', 'Back', 'Detail'] },
  { id: 'detail', label: 'Details', note: 'Close ups of fabric and fit', frames: ['Detail'] },
  { id: 'single', label: 'Full body only', note: 'One clean frame per look', frames: ['Full body'] },
]
export const lookbookPoses = [
  { id: 'natural', label: 'Natural' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'walking', label: 'Walking' },
  { id: 'seated', label: 'Seated' },
]
