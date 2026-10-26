// Mixed media: restyle a short clip of your own with a hand-made look, frame by frame.
// Families follow the audit: color and light, drawn and painted, overlay and glitch, paper and print.
import { open, clip, covers } from './parts.js'

const strength = { id: 'strength', type: 'choice', label: 'Strength', half: true, default: 'balanced', options: [
  { id: 'subtle', label: 'Subtle', note: 'The real footage shows through', text: 'lightly, so the real footage still shows through', params: { strength: 0.45 } },
  { id: 'balanced', label: 'Balanced', note: 'Look and footage share the frame', text: 'with balanced strength', params: { strength: 0.65 } },
  { id: 'full', label: 'Full', note: 'The look takes over', text: 'at full strength, so the look takes over the whole frame', params: { strength: 0.85 } },
] }

// Fewer frames per second reads as hand-made animation.
const frameRate = { id: 'fps', type: 'choice', label: 'Frame sampling', half: true, default: '12', options: [
  { id: '8', label: 'Every third frame', note: 'Source rate ÷ 3, e.g. 10 fps from 30 fps', params: { stride: 3 } },
  { id: '12', label: 'Every second frame', note: 'Source rate ÷ 2, e.g. 15 fps from 30 fps', params: { stride: 2 } },
  { id: '24', label: 'Every frame', note: 'Source rate, e.g. 30 fps from 30 fps', params: { stride: 1 } },
] }

const look = (slug, name, blurb, style, cover) => open({
  id: `mm-${slug}`, name, kind: 'video', category: 'mixed', group: 'Mixed media', blurb,
  // Core nodes sample every first, second or third source frame and preserve its timing.
  runsOn: 'Bernini-R', workflow: 'bernini_mixed',
  inputs: [{ ...clip, label: 'Your video' }, strength, frameRate],
  prompt: `Restyle the whole video in this look: ${style} Apply it {strength}, frame by frame, with the subject rotoscoped so the look tracks every movement, and keep the original motion, timing and framing.`,
  settings: { aspect: 'auto' },
  cover,
})

const colorAndLight = [
  look('acid', 'Acid', 'Psychedelic neon color that warps and bleeds.',
    'psychedelic acid graphics, neon green, hot pink and electric yellow bleeding and warping across the frame, with chromatic edges and liquid color distortion.', covers.mint),
  look('cold-vision', 'Icy neon', 'Cold neon light and deep shadow.',
    'cold cyan and violet neon light carving the subject out of blue black shadow, an icy rim light and a faint scan line texture.', covers.night),
  look('lava', 'Lava', 'Molten lava color flowing through the shot.',
    'molten lava, glowing orange and red magma textures flowing across every surface, cracked black crust and a bright heat glow along the subject\'s edges.', covers.peach),
  look('color-trip', 'Color trip', 'Waves of shifting rainbow color.',
    'waves of rainbow color rippling outward in concentric bands, kaleidoscope patterns breathing in the background and color trails following every movement.', covers.lilac),
  look('noir', 'Noir', 'Hard, cinematic black and white.',
    'high contrast black and white film noir, hard low key light, deep inky shadows, venetian blind stripes and smoky haze.', covers.slate),
  look('ocean', 'Ocean', 'Liquid sea color washing over the footage.',
    'a liquid ocean overlay in aqua and deep teal, caustic light patterns rippling over everything and soft bubbles drifting upward.', covers.sky),
  look('overexposed', 'Overexposed', 'Blown out, extreme exposure.',
    'extreme overexposure, blown out whites blooming around the subject, washed pastel color, heavy halation and only the darkest outlines holding detail.', covers.sun),
  look('random-glow', 'Glow bursts', 'Bursts of glow pop across the frame.',
    'random bursts of soft colored glow popping on and off across the frame, light orbs and bloom flares flickering around the subject in rhythm.', covers.lilac),
  look('toxic', 'Toxic', 'Radioactive neon color blasts.',
    'radioactive green and acid yellow, glowing slime highlights tracing the subject\'s outline, a dark background and pulsing neon haze.', covers.mint),
  look('two-color', 'Duotone', 'A bold, high contrast two-tone print.',
    'a bold duotone print with only two flat inks, a deep color for the shadows and a bright one for the highlights, with crisp posterized edges.', covers.rose),
  look('ultraviolet', 'Ultraviolet', 'A neon blacklight glow.',
    'blacklight ultraviolet, purple darkness with whites and bright clothing fluorescing neon blue and pink, and glowing outlines.', covers.dusk),
]

const drawnAndPainted = [
  look('acrylic', 'Acrylic blocks', 'Layered blocks of acrylic color.',
    'layered acrylic paint, flat opaque color blocks with visible brush edges and bold simplified shapes stacked in layers.', covers.peach),
  look('canvas', 'Canvas', 'Hand-drawn artwork on canvas.',
    'hand drawn artwork on stretched canvas, a visible weave texture, a charcoal underdrawing and loose painted fills.', covers.sun),
  look('comic', 'Comic', 'An illustrated comic book look.',
    'an illustrated comic book, bold black ink outlines, flat colors, halftone dot shading and dramatic shadows.', covers.sky),
  look('flash-comic', 'Comic panels', 'Punchy, high energy comic panels.',
    'punchy high energy comic panels, the frame splitting into dynamic panels with speed lines and impact bursts, with no readable words.', covers.rose),
  look('hand-paint', 'Gouache', 'Loose, freehand brushwork.',
    'loose freehand gouache brushwork, visible strokes that shift a little every frame, soft painted edges and a warm handmade feel.', covers.mint),
  look('palette', 'Palette knife', 'Hand-painted blocks of color.',
    'a hand painted color study, the scene broken into palette knife dabs and blocks of mixed color.', covers.lilac),
  look('sketch', 'Sketch', 'Textured hand-drawn line work.',
    'textured pencil line work on paper, hatching for the shadows, lines that boil and redraw every frame and smudged graphite.', covers.slate),
  look('vintage', 'Inked vintage', 'A hand-inked vintage illustration.',
    'a hand inked vintage illustration, fine pen lines, cross hatching, aged cream paper and muted sepia washes.', covers.peach),
]

const overlayAndGlitch = [
  look('broken-mirror', 'Shattered mirror', 'Shattered mirror reflections.',
    'a shattered mirror, the frame split into jagged shards that each reflect a slightly shifted angle of the subject, with sharp glints along the cracks.', covers.slate),
  look('bubbles', 'Bubbles', 'A dreamy soap bubble texture.',
    'dreamy soap bubbles, an iridescent rainbow film swirling over surfaces and translucent bubbles floating and popping around the subject.', covers.sky),
  look('fragments', 'Fragments', 'Abstract fragments layered over the footage.',
    'abstract fragments, torn geometric shards of the image offset and layered over each other, shifting a little on each beat.', covers.indigo),
  look('multiverse', 'Layered worlds', 'Layers of reality colliding.',
    'colliding layers of reality, several offset copies of the scene in different color worlds overlapping and sliding through each other.', covers.dusk),
  look('particles', 'Light particles', 'Glowing particles moving through the shot.',
    'glowing light particles streaming through the shot, the subject\'s outline shedding drifting sparks and dust that follow their movement.', covers.night),
  look('tracking', 'Motion tracking', 'Tracking lines lock onto moving objects.',
    'a motion tracking interface, thin boxes, crosshairs and small data labels locking onto moving objects and following them, with technical lines joining the points.', covers.mint),
  look('windows', 'Pop-up windows', 'Overlapping computer interface windows.',
    'overlapping retro computer windows popping open over the footage, each one framing a piece of the scene, with title bars and pixel cursors.', covers.lilac),
]

const paperAndPrint = [
  look('smoke-poster', 'Smoke poster', 'A smoky psychedelic poster look.',
    'a smoky psychedelic concert poster, swirling smoke shapes, warm green and orange screen print inks and wavy hand drawn borders with no readable words.', covers.sun),
  look('collage', 'Layered collage', 'A stacked collage of mixed materials.',
    'a stacked mixed media collage, cutouts of paper, fabric, newsprint and paint layered over each other with tape and rough torn edges.', covers.peach),
  look('magazine', 'Magazine', 'A printed magazine page.',
    'a printed glossy magazine page, visible print dots, a slight paper texture, layout margins and bold graphic blocks.', covers.rose),
  look('marble', 'Marble', 'A sculpted marble finish.',
    'sculpted white marble, the subject and surroundings carved in veined stone under soft museum light with fine chisel detail.', covers.slate),
  look('modern', 'Swiss minimal', 'Clean, geometric minimalism.',
    'clean geometric minimalism, flat shapes, a restrained palette, thin lines and generous empty space like a Swiss poster.', covers.indigo),
  look('origami', 'Origami', 'Crisp folded paper geometry.',
    'crisp folded paper origami, every surface creased into sharp paper facets with soft matte shading.', covers.sky),
  look('paper', 'Paper', 'Handmade paper texture over the footage.',
    'handmade paper, a fibrous grain over everything, torn edges and cut paper layers casting small shadows.', covers.mint),
]

export const mixedLooks = [...colorAndLight, ...drawnAndPainted, ...overlayAndGlitch, ...paperAndPrint]
