// Looks: style presets for a whole picture. You describe the subject and the look does the rest.
import { open, covers } from './parts.js'

const subject = (placeholder) => ({ id: 'subject', type: 'longtext', label: 'What is in the picture', placeholder })
// A picked character travels as a ref, so the prompt never names them.
const character = { id: 'character', type: 'character', label: 'Character', optional: true }
const shape = (initial = 'portrait') => ({ id: 'shape', type: 'choice', label: 'Shape', default: initial, options: [
  { id: 'portrait', label: 'Portrait', note: '4:5', params: { aspect: '4:5' } },
  { id: 'square', label: 'Square', note: '1:1', params: { aspect: '1:1' } },
  { id: 'wide', label: 'Wide', note: '16:9', params: { aspect: '16:9' } },
] })

const look = ({ slug, name, group, blurb, placeholder, style, cover, initial, runsOn = 'FLUX 3 Image Klein', ...rest }) => open({
  id: `look-${slug}`, name, kind: 'image', category: 'looks', group, blurb,
  runsOn, workflow: 'flux_look',
  inputs: [subject(placeholder), character, shape(initial)],
  prompt: `{subject}. ${style}`,
  cover,
  ...rest,
})

const photoLooks = [
  look({
    slug: 'phone-flash', name: 'Phone flash at night', group: 'Photo', featured: true,
    blurb: 'Light a candid night shot with a harsh phone flash.',
    placeholder: 'Two friends laughing on the curb outside a corner store late at night',
    style: 'A candid snapshot taken on a phone at night with the built-in flash firing straight on. Hard frontal light flattens faces and makes skin and fabric glow, bright hot spots bounce off shiny surfaces, the background drops into near black a few steps behind, faint motion blur from the ambient light, digital noise in the shadows, casual slightly tilted framing, the raw unretouched feel of a photo posted the same night.',
    cover: covers.night,
  }),
  look({
    slug: 'golden-hour', name: 'Golden hour editorial', group: 'Photo',
    blurb: 'Warm low sun and polished magazine framing.',
    placeholder: 'A woman in a linen dress walking through tall grass by the sea',
    style: 'An editorial photograph at golden hour. Low warm sun just above the horizon rakes across the scene, glowing rim light on hair and shoulders, long soft shadows, a gentle lens flare, honey and amber tones with softly lifted shadows, shot on a full frame camera with an 85mm lens at f/1.8, creamy background blur, considered styling and composition like a fashion magazine spread, natural skin texture.',
    cover: covers.sun,
  }),
  look({
    slug: 'studio-fashion', name: 'Studio fashion', group: 'Photo',
    blurb: 'Shoot on a clean backdrop with crisp fashion lighting.',
    placeholder: 'A model in an oversized tailored coat and a bold color blocked scarf',
    style: 'A high end studio fashion photograph on a seamless paper backdrop. A large softbox key light from one side with subtle fill, a clean rim light separating the subject from the background, crisp detail in fabric and texture, a confident editorial pose, precise true color, a smooth gradient falloff on the backdrop, medium format sharpness, a minimal set styled like a lookbook campaign.',
    cover: covers.slate,
  }),
  look({
    slug: 'street-style', name: 'Street style', group: 'Photo',
    blurb: 'Catch the subject mid stride on a busy sidewalk.',
    placeholder: 'A guy in a cropped puffer jacket and wide trousers crossing the street with a coffee',
    style: 'A street style photograph caught on a city sidewalk on a busy afternoon. Shot from across the street with a 135mm lens, the subject mid stride and in sharp focus while passersby and traffic melt into soft background blur, natural daylight in open shade, true to life color with a slight cool cast, candid but stylish, the look of a fashion week street photographer.',
    cover: covers.sky,
  }),
  look({
    slug: 'magazine-90s', name: '90s magazine', group: 'Photo', runsOn: 'Qwen-Image 2.1', workflow: 'qwen_image',
    blurb: 'Put the subject on a glossy 1990s cover, masthead and all.',
    placeholder: 'A skateboarder in a bright windbreaker grinning at the camera',
    style: 'Styled as a glossy 1990s magazine cover. A bold invented masthead in heavy serif letters across the top, short stacked cover lines in condensed sans serif type down one side, a small price and issue tag in the corner. Bright direct flash, saturated primary colors, slightly overexposed skin, a playful confident pose against a solid color backdrop, visible print texture and a subtle halftone in the shadows.',
    cover: covers.rose,
  }),
  look({
    slug: 'cctv', name: 'CCTV still', group: 'Photo', runsOn: 'Qwen-Image 2.1', workflow: 'qwen_image', initial: 'wide',
    blurb: 'Turn the scene into a grainy security camera frame.',
    placeholder: 'A raccoon pushing a shopping cart down an empty grocery aisle at 3am',
    style: 'A still frame from a ceiling mounted security camera. A high angle wide view with barrel distortion, a washed out low resolution image with blocky compression, muted greenish gray color, flat fluorescent light, a slight smear on anything moving, a white monospace timestamp and camera number in the top corner, the cold matter of fact look of surveillance footage.',
    cover: covers.slate,
  }),
  look({
    slug: 'drone-top-down', name: 'Drone top down', group: 'Photo', initial: 'square',
    blurb: 'Look straight down from high above.',
    placeholder: 'A lone swimmer in a turquoise pool surrounded by striped sun loungers',
    style: 'An aerial photograph shot from a drone looking straight down at ninety degrees. A flat graphic composition of strong shapes, lines and repeating patterns, long shadows that reveal the time of day, tiny people and objects for scale, crisp detail across the whole frame, rich natural color, no horizon in view.',
    cover: covers.mint,
  }),
  look({
    slug: 'tilt-shift', name: 'Tilt shift miniature', group: 'Photo', initial: 'wide',
    blurb: 'Make a real scene look like a tiny model.',
    placeholder: 'A busy harbor with fishing boats, cranes and stacked shipping containers',
    style: 'A tilt shift photograph that makes the scene look like a tabletop miniature. Seen from a high vantage point, a thin band of sharp focus across the middle with strong blur above and below, boosted saturation and contrast, bright toy-like colors, people and vehicles that look like tiny painted figures, clear midday sun.',
    cover: covers.peach,
  }),
]

const filmLooks = [
  look({
    slug: 'disposable', name: 'Disposable camera', group: 'Film',
    blurb: 'Add point and shoot flash and cheap film grain.',
    placeholder: 'Friends piled onto a couch at a backyard birthday party',
    style: 'Shot on a cheap disposable film camera. On camera flash that lights the foreground and leaves the background dim, a soft plastic lens with vignetting and corner blur, coarse film grain, warm slightly off color with cyan shadows, a faint light leak along one edge, a touch of overexposure, an orange date stamp in the bottom corner, the carefree feel of a summer snapshot fresh from the photo lab.',
    cover: covers.sun,
  }),
  look({
    slug: 'film-noir', name: 'Film noir', group: 'Film', initial: 'wide',
    blurb: 'Hard shadows and smoky black and white.',
    placeholder: 'A detective in a trench coat waiting under a streetlight in the rain',
    style: 'A black and white film noir still. Hard low key light from a single source, deep inky shadows, venetian blind shadows striped across walls and faces, wet pavement reflecting streetlights, drifting haze, high contrast silver tones with fine grain, a dramatic low camera angle, the tense moody atmosphere of a 1940s detective story.',
    cover: covers.night,
  }),
  look({
    slug: 'film-70s', name: '70s film stock', group: 'Film', initial: 'wide',
    blurb: 'Warm faded color and soft grain from the seventies.',
    placeholder: 'A family on a road trip stopped at a roadside diner, station wagon parked out front',
    style: 'Photographed on 1970s color film stock. A warm faded palette of mustard, burnt orange, olive and brown, soft contrast with milky lifted blacks, gentle halation around the highlights, visible organic grain, slightly soft focus, natural window or late afternoon light, period styling and set dressing, the nostalgic look of a print from a family photo album.',
    cover: covers.peach,
  }),
  look({
    slug: 'instant', name: 'Instant photo', group: 'Film', initial: 'square',
    blurb: 'Print the moment as an instant photo with a white border.',
    placeholder: 'A cat curled up on a sunny windowsill next to a potted fern',
    style: 'An instant film photograph shown as the whole print with its thick white border, wider at the bottom. Soft dreamy focus, gentle overexposure, creamy pastel color with a slight green and magenta shift, low contrast, faint chemical streaks near the edges, a direct flash look, a square image area, the intimate feel of a snapshot pinned to a corkboard.',
    cover: covers.lilac,
  }),
  look({
    slug: 'fisheye-skate', name: 'Fisheye skate video', group: 'Film', initial: 'square',
    blurb: 'Get low, close and warped like an old skate tape.',
    placeholder: 'A skater popping an ollie over a set of concrete stairs in a plaza',
    style: 'A still from a skate video shot with an extreme fisheye lens. A low angle right up close to the action, heavy barrel distortion bending the horizon and buildings, dark rounded vignetting in the corners, soft standard definition video, punchy saturated color, interlaced video texture, motion blur on the feet and board, the raw energy of a 1990s street skating tape.',
    cover: covers.dusk,
  }),
]

const artLooks = [
  look({
    slug: 'watercolor', name: 'Watercolor', group: 'Art',
    blurb: 'Paint in soft washes and blooms on textured paper.',
    placeholder: 'A little seaside village with pastel houses climbing a hill',
    style: 'A watercolor painting on cold press paper. Loose transparent washes that bleed and bloom into each other, soft wet edges with a few crisp dry brush details, granulating pigment in the shadows, untouched white paper for the highlights, a limited harmonious palette, a light pencil underdrawing showing through, delicate and airy.',
    cover: covers.sky,
  }),
  look({
    slug: 'oil-painting', name: 'Oil painting', group: 'Art',
    blurb: 'Rich color and thick, visible brush strokes.',
    placeholder: 'An old fisherman mending a net by lantern light',
    style: 'A classical oil painting on canvas. Thick impasto brush strokes you can almost feel, rich layered color with warm glazes, dramatic chiaroscuro with a soft glowing key light, subtle canvas weave texture, painterly edges that soften into the background, the depth and gravity of an old master gallery portrait.',
    cover: covers.dusk,
  }),
  look({
    slug: 'ink-sketch', name: 'Ink sketch', group: 'Art',
    blurb: 'Draw it in loose pen lines and hatching.',
    placeholder: 'A cafe terrace on a narrow cobbled street with bicycles leaning on the wall',
    style: 'A pen and ink sketch on off white sketchbook paper. Confident loose line work with varied line weight, cross hatching and stippling for the shadows, a few unfinished edges where the drawing fades out, an occasional ink spatter, black ink with a light gray wash, the immediacy of an artist drawing on location.',
    cover: covers.slate,
  }),
  look({
    slug: 'anime-cel', name: 'Anime cel', group: 'Art', initial: 'wide',
    blurb: 'A hand painted frame from a classic anime film.',
    placeholder: 'A girl on a bicycle riding past rice fields under a huge summer sky',
    style: 'A frame from a hand drawn anime film in the classic cel style. Clean expressive line art, flat cel shading with one or two shadow tones, a soft hand painted background with towering clouds and glowing light, gentle film grain, warm nostalgic color, expressive eyes and natural poses, the cinematic composition of a 1990s feature anime.',
    cover: covers.rose,
  }),
  look({
    slug: 'comic-book', name: 'Comic book', group: 'Art', runsOn: 'Qwen-Image 2.1', workflow: 'qwen_image',
    blurb: 'Bold inks, halftone dots and a speech bubble.',
    placeholder: 'A kid in a homemade cape leaping off a backyard fence',
    style: 'A comic book panel. Bold black ink outlines with dynamic line weight, flat bright colors with a halftone dot texture, a dramatic angle with speed lines for energy, a hand lettered caption box at the top and a speech bubble with a short exclamation, slightly off register print color, the punchy look of a classic printed comic page.',
    cover: covers.sun,
  }),
  look({
    slug: 'claymation', name: 'Claymation still', group: 'Art', initial: 'wide',
    blurb: 'Sculpt the scene as handmade clay figures on a tiny set.',
    placeholder: 'A penguin chef flipping pancakes in a tiny kitchen',
    style: 'A still from a stop motion claymation film. Everything sculpted from soft plasticine with visible fingerprints and tool marks, slightly lumpy rounded shapes, bright matte colors, a handmade miniature set with felt, cardboard and wire details, warm practical lighting with soft shadows, shallow depth of field like a macro lens on a tabletop set.',
    cover: covers.peach,
  }),
  look({
    slug: 'pixel-art', name: 'Pixel art', group: 'Art', initial: 'square',
    blurb: 'Crisp pixels and a limited retro palette.',
    placeholder: 'A cozy wizard tower library with floating candles and a sleeping cat',
    style: 'Pixel art in a 16-bit style. Crisp square pixels with no anti-aliasing, a limited palette of about 32 colors, careful dithering in gradients and shadows, clean readable silhouettes, a detailed layered background, soft ambient light picked out in highlight pixels, the charm of a retro console game scene.',
    cover: covers.mint,
  }),
  look({
    slug: 'low-poly', name: 'Low poly', group: 'Art', initial: 'square',
    blurb: 'Build it from faceted 3D shapes with soft flat shading.',
    placeholder: 'A small floating island with a windmill, pine trees and a waterfall',
    style: 'A low poly 3D render. Simple geometric shapes built from visible flat triangular facets, flat shaded color in a soft gradient palette, gentle ambient occlusion where shapes meet, soft directional light and shadows, minimal detail and a calm stylized look like an indie game diorama.',
    cover: covers.indigo,
  }),
  look({
    slug: 'vaporwave', name: 'Vaporwave', group: 'Art', initial: 'square',
    blurb: 'Neon pink, teal sunsets and retro computer dreams.',
    placeholder: 'A lone dolphin leaping over a pastel ocean at dusk',
    style: 'A vaporwave aesthetic. A neon pink, purple and teal palette, a glowing gradient sunset sliced by horizontal stripes, a chrome grid floor stretching to the horizon, marble statues, palm trees, floating retro computer windows and glitch effects, soft VHS scan lines, a dreamy surreal composition with a nostalgic late 1980s shopping mall mood.',
    cover: covers.lilac,
  }),
]

const customLooks = [
  open({
    id: 'moodboard', name: 'Match a moodboard', kind: 'image', category: 'looks', group: 'Custom',
    blurb: 'Borrow the look of your own reference images.',
    runsOn: 'FLUX 3 Image Klein', workflow: 'klein_moodboard',
    inputs: [
      subject('A barista pulling a shot of espresso in a small corner cafe'),
      { id: 'ref1', type: 'image', label: 'Reference' },
      { id: 'ref2', type: 'image', label: 'Reference', optional: true },
      { id: 'ref3', type: 'image', label: 'Reference', optional: true },
      shape(),
    ],
    prompt: '{subject}. Match the visual style of the reference images: their color palette, lighting, contrast, grain, lens feel, styling and overall mood. Borrow only the look, not the people, objects or layout shown in them.',
    cover: covers.indigo,
  }),
  open({
    id: 'brand-colors', name: 'Brand colors', kind: 'image', category: 'looks', group: 'Custom',
    blurb: 'Put your brand palette into any picture.',
    runsOn: 'FLUX 3 Image Klein', workflow: 'flux_look',
    inputs: [
      subject('A runner stretching on a rooftop track at sunrise'),
      { id: 'brand', type: 'brand', label: 'Brand' },
      { id: 'usage', type: 'choice', label: 'Color use', default: 'subtle', options: [
        { id: 'subtle', label: 'Subtle', note: 'Accents on a calm scene', text: 'the brand colors appear as quiet accents in wardrobe, props and light while the rest of the scene stays neutral' },
        { id: 'bold', label: 'Bold', note: 'Color fills the frame', text: 'the brand colors fill the frame in large confident blocks across the background, set and wardrobe' },
      ] },
      shape(),
    ],
    prompt: '{subject}. Art directed around the {brand} color palette: {usage}. The colors feel intentional and consistent across the whole picture, with no logos or text added.',
    cover: covers.rose,
  }),
]

export const looks = [...photoLooks, ...filmLooks, ...artLooks, ...customLooks]
