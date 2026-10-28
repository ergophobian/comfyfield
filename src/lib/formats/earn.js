// Formats that earn: short-form formats with a proven structure. The user brings one line about their product,
// topic or character; the writer turns it into the format's beats (the prompt on top of their prompt), a cheap
// opening frame is checked, and only then does the paid video render. See docs/formats-that-earn.md.
import { defineFormat } from './spec.js'
import { covers } from './parts.js'

const still = 'comfy-router-flux'
const motion = 'comfy-router-seedance'
const runsOn = 'Flux 2 Pro and Seedance 2.5 via Comfy Router'

// The families the Apps page splits the hub into, in this order.
export const earnGroups = [
  { name: 'Product ads', blurb: 'Your product in the formats that sell: stories, mascots, reveals and ratings.' },
  { name: 'Faceless series', blurb: 'A channel without a face. One topic in, a series of posts out.' },
  { name: 'Drama shorts', blurb: 'Episodes people follow, with your product as the payoff.' },
  { name: 'AI influencer', blurb: 'A fictional creator on white, then in every trend.' },
  { name: '3D explainers', blurb: 'A cute character explains it in its own voice.' },
]

// Every writer follows these, whatever the format.
const rules = 'Use only facts the user gives. Never invent prices, discounts, results, reviews, testimonials, awards, certifications or health and medical claims, and never mention doses. No real people, celebrities, public figures, accounts or brands other than the user\'s own product. No gore, sexual content, slurs or cruelty to real groups. Spoken lines are short, casual and lowercase in spirit, one sentence each, with no hashtags, emoji or em dashes.'
const look = 'Start with a line that begins "Look:" and describes, in one paragraph, every character (species or object, size, colors, face, outfit), the product exactly as in any photo given, the place, the light and the render style. Describe characters the same way every time so they stay identical.'
const oneClip = (shots) => `${look} Then write ${shots} lines, "Shot 1:" to "Shot ${shots}:", one per line, for a single vertical 9:16 clip: what we see, the camera move, the action, and any spoken line in double quotes. Shot 1 is the opening frame and must read as a still picture on its own. Return only the plan, under 1200 characters.`
const manyClips = (beats) => `${look} Then write ${beats} lines, "Beat 1:" to "Beat ${beats}:", one per line. Each beat is a separate five second vertical 9:16 clip that is joined to the next: describe its first frame, the action and camera, and one short spoken line in double quotes. Each beat must make sense on its own. Return only the plan, under 1600 characters.`
const slides = (n) => `${look} Then write ${n} lines, "Slide 1:" to "Slide ${n}:", one per line, for a vertical photo carousel: the picture, then the exact on-screen words in double quotes (a short headline and at most one short line under it). Return only the plan, under 1400 characters.`

const frameWrap = 'One vertical still frame: the first moment of the plan below, as Shot 1 or Beat 1 describes it. No captions, subtitles, speech bubbles or added words; the only lettering is what is printed on the product itself. Keep the product exactly as in its photo, if one is given. {written}'
const nextFrameWrap = 'One vertical still frame for the beat below. Keep every character, the product, the render style and the light exactly as in the first image. No captions, subtitles, speech bubbles or added words. {written}'
const clipWrap = '{written} Keep every character and the product exactly the same from start to end, with natural sound and the spoken lines voiced in the clip. No captions or on-screen text.'
const slideWrap = 'A vertical 9:16 carousel slide. Set the words in double quotes as large, clean, easy to read type, spelled exactly as written, and add no other words. {written}'
const nextSlideWrap = 'A vertical 9:16 carousel slide in the same font, colors and layout as the first image, with a new picture and new words. Set the words in double quotes exactly as written, and add no other words. {written}'

const product = { id: 'product', type: 'image', label: 'Product photo', optional: true, half: true }
const reference = { id: 'reference', type: 'image', label: 'Character or style reference', optional: true, half: true, main: false }
const length = { id: 'length', type: 'choice', label: 'Length', half: true, default: '10', options: [
  { id: '5', label: '5 seconds', params: { duration: 5 } },
  { id: '8', label: '8 seconds', params: { duration: 8 } },
  { id: '10', label: '10 seconds', params: { duration: 10 } },
] }
const pick = (id, label, options) => ({ id, type: 'choice', label, toWriter: true, half: true, default: options[0].id, options })
const idea = (label, placeholder) => ({ id: 'idea', type: 'longtext', label, rows: 2, placeholder })

const base = { engine: 'router', category: 'earn', hub: 'earn', layout: 'wide', shape: 'pipeline', settings: { aspect: '9:16' } }
const plan = (instructions, target = 'Shot plan') => ({ id: 'plan', type: 'writer', target, review: 'Review the plan', instructions: `${instructions} ${rules}` })

// One clip: the written plan, an opening frame to approve, then one clip that starts from it.
function clip({ writer, shots = 4, inputs, ...f }) {
  return defineFormat({
    ...base, runsOn, kind: 'video',
    output: 'A shot plan you can edit, an opening frame to approve, then one vertical clip with sound',
    inputs: [...inputs, length],
    steps: [
      plan(`${writer} ${oneClip(shots)}`),
      { id: 'frame', model: still, kind: 'image', beat: 1, wrap: frameWrap },
      { id: 'check', type: 'approve', from: ['frame'] },
      { id: 'clip', model: motion, kind: 'video', from: ['check', 'plan'], wrap: clipWrap, params: { generate_audio: true } },
    ],
    outputs: [{ step: 'clip', kind: 'video' }],
    ...f,
  })
}

// A short series of beats: one plan, a frame per beat (later frames match the first), an approval per beat
// before its clip is paid for, then one joined video.
function series({ writer, beats = 3, inputs, ...f }) {
  const n = Array.from({ length: beats }, (_, i) => i + 1)
  return defineFormat({
    ...base, runsOn, kind: 'video',
    output: `A ${beats} beat plan you can edit, a frame per beat to approve, then ${beats} five second clips joined into one video`,
    inputs,
    settings: { aspect: '9:16', duration: 5 },
    steps: [
      plan(`${writer} ${manyClips(beats)}`, 'Beat plan'),
      ...n.map((i) => ({ id: `frame${i}`, model: still, kind: 'image', beat: i, from: i === 1 ? ['plan'] : ['plan', 'frame1'], wrap: i === 1 ? frameWrap : nextFrameWrap })),
      ...n.map((i) => ({ id: `check${i}`, type: 'approve', from: [`frame${i}`] })),
      ...n.map((i) => ({ id: `clip${i}`, model: motion, kind: 'video', beat: i, from: [`check${i}`, 'plan'], wrap: clipWrap, params: { generate_audio: true } })),
      { id: 'join', type: 'stitch', from: n.map((i) => `clip${i}`) },
    ],
    outputs: [{ step: 'join', kind: 'video' }],
    ...f,
  })
}

// A photo carousel: one plan, then a slide per line in the first slide's style. Images only, so no approval.
function carousel({ writer, count = 5, inputs, ...f }) {
  const n = Array.from({ length: count }, (_, i) => i + 1)
  return defineFormat({
    ...base, runsOn: 'Flux 2 Pro via Comfy Router', kind: 'image',
    output: `A ${count} slide plan you can edit, then ${count} vertical slides ready to post as a carousel`,
    inputs,
    steps: [
      plan(`${writer} ${slides(count)}`, 'Slide plan'),
      ...n.map((i) => ({ id: `slide${i}`, model: still, kind: 'image', beat: i, from: i === 1 ? ['plan'] : ['plan', 'slide1'], wrap: i === 1 ? slideWrap : nextSlideWrap })),
    ],
    outputs: n.map((i) => ({ step: `slide${i}`, kind: 'image' })),
    ...f,
  })
}

const productAds = [
  series({
    id: 'earn-chaotic-product-story', name: 'Chaotic product story', group: 'Product ads', featured: true,
    blurb: 'Real people play an absurd situation straight, then your product saves it.',
    job: 'A deadpan three beat product story that ends on your product',
    inputs: [
      idea('What you sell and who it is for', 'A pocket espresso maker for people who commute by train'),
      pick('setup', 'Story', [
        { id: 'interrupt', label: 'Chaotic interruption', text: 'a calm, ordinary review or conversation is interrupted by a crisis far bigger than it, and the product is what gets everyone through it' },
        { id: 'glowup', label: 'Glow-up comeback', text: 'someone is brushed off or underestimated, finds the product, and comes back changed while the doubters react' },
        { id: 'mentor', label: 'Unlikely mentor', text: 'a defeated character asks for help and an unlikely, oddly serious guide appears with the product as the answer' },
        { id: 'awkward', label: 'Awkward pitch', text: 'a socially awkward conversation keeps drifting toward the product at the worst possible moment, and the plug lands anyway' },
      ]),
      reference, product,
    ],
    writer: 'Write a short product story in the deadpan, escalating style that does well on short-form video. Pick one familiar setup, one visual mismatch and one escalation, and have every character play the absurd premise completely straight, never acknowledging it is strange. Beat 1 opens on the conflict with no product in sight. Beat 2 escalates fast to bigger, sillier stakes. Beat 3 brings the product in as the thing that resolves it, and ends on a payoff that calls back to the opening. Realistic people and places, natural phone-video look.',
    cover: covers.sun,
  }),
  clip({
    id: 'earn-problem-mascot', name: 'Problem mascot', group: 'Product ads', featured: true,
    blurb: 'The problem becomes a cute, annoying creature. Your product shows up and fixes it.',
    job: 'A problem character that your product sends packing',
    inputs: [
      idea('What you sell and the problem it fixes', 'A lint roller that gets pet hair off a couch in one pass'),
      pick('mood', 'Mascot', [
        { id: 'grumpy', label: 'Grumpy', text: 'a grumpy, scheming little creature that thinks it owns the place' },
        { id: 'whiny', label: 'Whiny', text: 'a whiny, dramatic little creature that complains about everything' },
        { id: 'smug', label: 'Smug', text: 'a smug little creature that is sure nothing can beat it' },
      ]),
      product,
    ],
    writer: 'Write a short ad where the everyday problem is a cute 3D animated creature in a bright Pixar-like style, living in a real setting. Shot 1 shows the creature causing the problem, clearly, before anyone speaks. Next it talks in first person about how it is never leaving. Then a hand or a person brings in the product and uses it the way it is really used. The last shot shows the problem gone and the creature dramatically defeated, with one funny parting line.',
    cover: covers.mint,
  }),
  clip({
    id: 'earn-before-after', name: 'Before and after reveal', group: 'Product ads',
    blurb: 'Show the before, the switch and an honest after, in one vertical clip.',
    job: 'A before and after built around your product',
    inputs: [
      idea('What you sell and what it changes', 'A cable organizer box for a messy desk'),
      pick('reveal', 'Reveal', [
        { id: 'split', label: 'Split screen', text: 'a split screen with the before on the left and the after on the right, the line sweeping across' },
        { id: 'wipe', label: 'Hand wipe', text: 'a hand swipes across the camera and the before turns into the after' },
        { id: 'days', label: 'Day by day', text: 'the same spot shown on day 1, day 7 and day 30, with the change building slowly' },
      ]),
      product,
    ],
    writer: 'Write a before and after ad. The before is specific and relatable, filmed like a real phone video. The switch is the product being used, the way it is really used. The after is believable and the same place, angle and light as the before, so the only change is what the product does. Never exaggerate the result and never show a body, face or skin result.',
    cover: covers.sky,
  }),
  clip({
    id: 'earn-ingredient-parade', name: 'Ingredient parade', group: 'Product ads',
    blurb: 'What is inside your product marches in, each part a character with a name.',
    job: 'The parts or ingredients of your product as a parade of characters',
    inputs: [
      idea('Your product and what is in it', 'A trail mix with almonds, dark chocolate, dried cherries and pumpkin seeds'),
      product,
    ],
    writer: 'Write a short ad where each ingredient or part named by the user is a cute 3D animated character in a bright Pixar-like style. They march in one after another like a parade, each says its own name in one short line and does one visible thing, and they all jump into the product at the end. Only use ingredients or parts the user lists. Every character must be easy to tell apart and readable on a phone.',
    shots: 5,
    cover: covers.peach,
  }),
  clip({
    id: 'earn-unboxing-hook', name: 'Unboxing hook', group: 'Product ads',
    blurb: 'A tactile, close-up unboxing that holds the viewer to the reveal.',
    job: 'A close-up unboxing that ends on your product',
    inputs: [
      idea('What you sell and the one detail to show off', 'A ceramic pour-over set, show the matte glaze'),
      pick('feel', 'Feel', [
        { id: 'asmr', label: 'Quiet and tactile', text: 'quiet and tactile, every sound crisp: tape, paper, the lid' },
        { id: 'fast', label: 'Fast cuts', text: 'quick, punchy cuts on every layer of the box' },
        { id: 'gift', label: 'Gift moment', text: 'a gift being opened, with a surprised hand reaction at the reveal' },
      ]),
      product,
    ],
    writer: 'Write a close-up unboxing. Shot 1 is the closed box in hands, top down, with a hint of what is inside so the viewer has to wait. Each shot opens one more layer. The reveal shows the product exactly as in its photo, then the one detail the user named in an extreme close-up. Hands only, no faces.',
    cover: covers.lilac,
  }),
  clip({
    id: 'earn-price-knockout', name: 'Price knockout', group: 'Product ads',
    blurb: 'Your product takes on the pricey option in a boxing ring, and wins on value.',
    job: 'An underdog matchup between your product and the expensive alternative',
    inputs: [
      idea('What you sell and what people usually pay for instead', 'A refillable water filter jug against buying bottled water every week'),
      product,
    ],
    writer: 'Write an underdog matchup in a 3D animated boxing ring in a bright Pixar-like style. The usual, pricier alternative is a big, flashy, generic character with no brand or logo. The user\'s product is the small, confident challenger. The bell rings, the big one shows off, the small one wins with one clever move tied to the real reason it is better. Only use the reason the user gives, and never state prices the user did not give.',
    cover: covers.rose,
  }),
  carousel({
    id: 'earn-rated-carousel', name: 'Rated carousel', group: 'Product ads',
    blurb: 'I rated 4 ways to fix a problem. Yours wins on merit, slide by slide.',
    job: 'A five slide rating carousel where your product comes out on top',
    inputs: [
      idea('The problem, the usual fixes, and your product', 'Keeping coffee hot on a commute: a paper cup, a thermos, a car mug, and our travel mug'),
      { ...reference, label: 'Style reference' }, product,
    ],
    writer: 'Write an honest rating carousel. Slide 1 is the cover: "i rated 4 ways to" plus the problem, over a clear photo of the problem. Slides 2 to 4 each rate one usual fix the user lists, with a photo of it in use and a rating out of 5 with one honest reason. Slide 5 rates the user\'s product last and highest, with its photo and the real reason it wins. Ratings must be fair: give the other fixes credit where they earn it.',
    cover: covers.slate,
  }),
]

const faceless = [
  series({
    id: 'earn-what-if', name: 'What if', group: 'Faceless series', featured: true,
    blurb: 'What happens if you never do the thing? Three beats of rising stakes.',
    job: 'A what if hypothetical that escalates over time',
    inputs: [
      idea('The what if question', 'What happens if you never clean your phone screen'),
      pick('style', 'Style', [
        { id: 'skeleton', label: 'Skeleton host', text: 'a friendly 3D animated skeleton host in a clean studio who reacts to each stage' },
        { id: 'holo', label: 'Hologram', text: 'glowing blue hologram wireframes floating in a dark room' },
        { id: 'macro', label: 'Real macro', text: 'real, photographic macro close-ups' },
      ]),
      reference,
    ],
    writer: 'Write a what if short with loss-aversion pull. Beat 1 asks the question and shows day 1, the harmless start. Beat 2 jumps ahead in time and the consequence is now visible. Beat 3 is the furthest point, scary enough to keep watching but never gross or graphic, and ends on one line telling the viewer what to do instead. Keep every fact general and true; if a fact is uncertain, leave it out.',
    cover: covers.night,
  }),
  carousel({
    id: 'earn-countdown', name: 'Countdown list', group: 'Faceless series',
    blurb: 'Five things people get wrong about your topic, counted down to number one.',
    job: 'A countdown carousel people save and share',
    inputs: [
      idea('The topic and who it is for', 'Houseplant mistakes for people who just bought their first plant'),
      pick('look', 'Look', [
        { id: 'editorial', label: 'Clean editorial', text: 'white background, bold black serif headline, one red accent' },
        { id: 'dark', label: 'Dark and moody', text: 'dark, moody photos with white text' },
        { id: 'notes', label: 'Phone notes', text: 'a phone notes app screenshot look over a soft photo' },
      ]),
      reference,
    ],
    count: 6,
    writer: 'Write a countdown list carousel. Slide 1 is the hook: the number of things and who should care, with a photo that shows the topic. Slides 2 to 5 count down from 5 to 2, each one thing with a photo and one practical line. Slide 6 is number 1, the most useful one, and ends with a line asking viewers to save it.',
    cover: covers.indigo,
  }),
  clip({
    id: 'earn-science-narrator', name: 'Science narrator', group: 'Faceless series',
    blurb: 'A calm narrator explains why something happens with one clear visual metaphor.',
    job: 'A one question science short with a visual metaphor',
    inputs: [
      idea('The question', 'Why does bread go stale faster in the fridge'),
      pick('style', 'Style', [
        { id: 'pixar', label: '3D animated', text: 'a bright Pixar-like 3D animated world' },
        { id: 'real', label: 'Real footage', text: 'real, cinematic photographic shots' },
        { id: 'chalk', label: 'Chalkboard', text: 'hand-drawn chalk on a dark board, drawn on as we watch' },
      ]),
    ],
    writer: 'Write a short explainer for one question. Shot 1 opens the information gap: the question, shown, not just said. Then explain the answer with one simple visual metaphor that the camera follows, so the motion does the explaining. End on the one surprising takeaway. A calm, warm narrator voices it. Only include facts that are well established; leave out anything uncertain.',
    cover: covers.sky,
  }),
  clip({
    id: 'earn-timeline', name: 'Timeline transformation', group: 'Faceless series',
    blurb: 'Day 1 to day 100 of one place, thing or habit, in one clip.',
    job: 'A day counter transformation of one subject',
    inputs: [
      idea('What changes over time', 'An empty balcony turned into a small vegetable garden'),
      reference,
    ],
    writer: 'Write a timeline transformation. Every shot is the same place from the same camera angle and light, so only the subject changes. Shot 1 is day 1. Each next shot jumps further ahead (for example day 7, day 30, day 100), with the change visible and gradual, never instant magic. The narrator says the day out loud in each shot. End on a satisfying final look.',
    cover: covers.mint,
  }),
  clip({
    id: 'earn-big-question', name: 'Big question', group: 'Faceless series',
    blurb: 'One question nobody thinks about, three reveals, and an ending that lingers.',
    job: 'A curiosity short that opens a question and keeps raising the stakes',
    inputs: [
      idea('The big question', 'Could a planet ever be alive'),
    ],
    writer: 'Write a curiosity short that makes the viewer think "I have never thought about that". Shot 1 shows the question as a striking image. Each next shot reveals one fact that makes the question bigger. End on a quiet, open line that leaves the viewer thinking, not a call to action. Cinematic space and nature imagery, a slow, calm narrator. Only use well established facts and say plainly when something is unknown.',
    cover: covers.dusk,
  }),
]

const drama = [
  series({
    id: 'earn-object-drama', name: 'Object drama', group: 'Drama shorts', featured: true,
    blurb: 'Fruit, food or everyday objects in a soap opera, with your product as the twist.',
    job: 'A four beat soap opera with a late product payoff',
    beats: 4,
    inputs: [
      idea('Your product or topic, and the cast', 'A blender, starring fruit in a kitchen'),
      pick('arc', 'Story', [
        { id: 'betrayal', label: 'Betrayal', text: 'a betrayal is discovered, the others react, a vow is made, and the comeback arrives' },
        { id: 'glowup', label: 'Glow-up revenge', text: 'the hero is mocked, works on themselves, and returns changed while the mockers stare' },
        { id: 'rejected', label: 'Rejected, then wanted', text: 'the hero is left out in public, keeps going alone, and ends up the one everyone wants' },
        { id: 'rescue', label: 'Rescue', text: 'someone hits rock bottom, an ally finds them, and a fix turns everything around' },
      ]),
      reference, product,
    ],
    writer: 'Write a cartoon soap opera starring anthropomorphic characters from the cast the user names, in a bright, readable 3D animated style. Beat 1 opens on a visible violation (an insult, a betrayal clue, a rejection) that is clear before anyone speaks; no product. Beat 2 makes it public: someone reacts. Beat 3 is the turn: a vow, a plan, a first attempt. Beat 4 is the payoff, where the product arrives late as the answer to the story problem, never as an opener, and ends on a cliffhanger look or a reply-bait line. One emotional action and one location per beat.',
    cover: covers.rose,
  }),
  series({
    id: 'earn-challenge-vlog', name: 'Challenge vlog', group: 'Drama shorts',
    blurb: 'A challenge vlog parody with one host and one impossible detail per beat.',
    job: 'A surreal take on a classic challenge vlog',
    inputs: [
      idea('The challenge', '24 hours eating only food from a vending machine'),
      reference, product,
    ],
    writer: 'Write a parody of a classic challenge vlog. One host, the same look in every beat, films selfie style with real vlog energy. Beat 1 states the challenge to camera. Beat 2 and Beat 3 each add exactly one impossible, surreal detail that the host treats as completely normal. If a product photo is given, it appears naturally as part of the challenge. End on a deadpan reaction.',
    cover: covers.peach,
  }),
  series({
    id: 'earn-hero-villain', name: 'Hero and villains', group: 'Drama shorts',
    blurb: 'The problems are villains. Your product is the hero who says its name.',
    job: 'A 3D hero story where your product beats the problems',
    inputs: [
      idea('Your product and the problems it beats', 'A robot vacuum against crumbs, pet hair and dust bunnies'),
      reference, product,
    ],
    writer: 'Write a 3D animated hero story in a bright Pixar-like style. Beat 1 is the villain showcase: each problem the user names is a villain with a personality who laughs, brags or threatens. Beat 2: the hero, the user\'s product as a character, arrives and says its name. Beat 3: the hero wins with one move tied to what the product really does, and ends holding up a glowing sign that says "link in bio" instead of saying it.',
    cover: covers.indigo,
  }),
]

// Picture slots: an upstream frame takes the first slot, so a style reference goes before the product and the
// product stays with every later frame and clip.

// The look of a fictional influencer, and the rights line every swap format shows.
const persona = { id: 'persona', type: 'longtext', label: 'Who they are', rows: 2, placeholder: 'A 25 year old surfer with sun bleached curls, freckles and a gap-toothed grin' }
const features = { id: 'features', type: 'text', label: 'What makes them memorable', placeholder: 'A yellow bucket hat and one silver earring' }
const rights = { id: 'rights', type: 'choice', confirmation: true, label: 'Footage rights', options: [{ id: 'confirmed', label: 'I confirm', note: 'Use footage you own or have permission to use. The character is fictional and not a real person.' }] }
const trend = { id: 'video', type: 'video', label: 'Trend clip', half: true }
const swapLength = { ...length, default: '8', label: 'Length' }
const swapPrompt = 'Replace the person in the reference video with the fictional character in the reference picture. Keep the video\'s moves, timing, camera, framing, setting and light. Keep the character\'s face, hair, body and outfit exactly as in the picture, and never copy the original performer\'s face. {note}'
const note = { id: 'note', type: 'text', label: 'Extra direction', optional: true, placeholder: 'Keep the original song playing' }
const sheetPrompt = 'A character reference sheet of one fictional adult on a pure white background: {persona}. Distinctive, memorable features: {features}. Four views side by side: front full body, three-quarter, back and a close-up of the face. The same face, hair, body, outfit and colors in every view, even soft studio light, a realistic photo look, no text or labels.'
const readyPrompt = 'A full body photo of the same fictional character as the first image, standing on a pure white background, facing the camera, head to toe in frame. Keep their face, hair, skin tone, build and distinctive features exactly the same. {outfit}'

const influencer = [
  defineFormat({
    ...base, shape: 'preset', kind: 'image', group: 'AI influencer', featured: true, runsOn: 'Flux 2 Pro via Comfy Router',
    id: 'earn-influencer-sheet', name: 'Influencer character sheet',
    blurb: 'A fictional influencer on a white background, four views, ready to drop into trends.',
    job: 'A character sheet for a new AI influencer',
    output: 'One sheet with a front, three-quarter, back and face view on white. Save it to Assets as a character',
    inputs: [persona, features],
    settings: { aspect: '16:9' },
    steps: [{ id: 'sheet', model: still, kind: 'image', prompt: sheetPrompt, settings: { aspect: '16:9' } }],
    outputs: [{ step: 'sheet', kind: 'image' }],
    cover: covers.peach,
  }),
  defineFormat({
    ...base, kind: 'video', group: 'AI influencer', runsOn,
    id: 'earn-influencer-trend', name: 'Put them in a trend',
    blurb: 'Your character takes over a trend clip: same moves, same timing. Use footage you own or have permission to use.',
    job: 'Your fictional influencer performing a trend clip',
    output: 'A clean full body picture of your character to approve, then the trend clip with them in it',
    inputs: [
      { id: 'source', type: 'choice', label: 'Character', half: true, default: 'photo', options: [
        { id: 'photo', label: 'A picture' },
        { id: 'character', label: 'Saved character' },
      ] },
      { id: 'image', type: 'image', label: 'Character picture', half: true, when: ['source', 'photo'] },
      { id: 'character', type: 'character', label: 'Saved character', half: true, when: ['source', 'character'] },
      trend,
      { id: 'outfit', type: 'text', label: 'Outfit for the trend', optional: true, half: true, placeholder: 'Dressed in a white tennis outfit' },
      swapLength, note, rights,
    ],
    steps: [
      { id: 'ready', model: still, kind: 'image', from: [], prompt: readyPrompt },
      { id: 'check', type: 'approve', from: ['ready'] },
      { id: 'swap', model: motion, kind: 'video', from: ['check'], prompt: swapPrompt, params: { generate_audio: true } },
    ],
    outputs: [{ step: 'swap', kind: 'video' }],
    cover: covers.lilac,
  }),
  defineFormat({
    ...base, kind: 'video', group: 'AI influencer', runsOn,
    id: 'earn-influencer-start', name: 'Influencer from scratch',
    blurb: 'Describe a character, approve them on white, and put them straight into a trend clip.',
    job: 'A new fictional influencer and their first trend video',
    output: 'Your character on a white background to approve, then the trend clip with them in it',
    inputs: [persona, features, trend, swapLength, note, rights],
    steps: [
      { id: 'ready', model: still, kind: 'image', from: [], prompt: 'A full body photo of one fictional adult standing on a pure white background, facing the camera, head to toe in frame: {persona}. Distinctive, memorable features: {features}. Even soft studio light, a realistic photo look, no text.' },
      { id: 'check', type: 'approve', from: ['ready'] },
      { id: 'swap', model: motion, kind: 'video', from: ['check'], prompt: swapPrompt, params: { generate_audio: true } },
    ],
    outputs: [{ step: 'swap', kind: 'video' }],
    cover: covers.sun,
  }),
  clip({
    id: 'earn-influencer-product', name: 'Influencer product post', group: 'AI influencer',
    blurb: 'Your fictional influencer films a casual selfie video with your product.',
    job: 'A selfie style product post by your AI influencer',
    inputs: [
      { id: 'character', type: 'image', label: 'Character picture', half: true },
      { ...product, optional: false },
      idea('What you sell and one true thing to say about it', 'A foldable phone stand, it fits in a jeans pocket'),
    ],
    shots: 3,
    writer: 'Write a casual selfie style creator video. The fictional character in the first picture films themselves at arm\'s length in a real, bright everyday place, holding the product in the second picture. Shot 1 is a scroll-stopping first line said to camera. Shot 2 shows the product doing the one thing the user named. Shot 3 is an easy, honest sign-off. Never invent a personal result or testimonial.',
    cover: covers.sun,
  }),
]

const explainers = [
  clip({
    id: 'earn-body-explainer', name: 'Body part explainer', group: '3D explainers', featured: true,
    blurb: 'A cute 3D body part talks you through what it needs, in its own voice.',
    job: 'A first person body part character explaining a general wellness topic',
    inputs: [
      idea('The body part and the topic', 'Your eyes, after a whole day of screens'),
      pick('mood', 'Mood', [
        { id: 'tired', label: 'Tired', text: 'exhausted and dramatic, but funny' },
        { id: 'grateful', label: 'Grateful', text: 'grateful and warm, cheering the viewer on' },
        { id: 'scolding', label: 'Scolding', text: 'fed up and scolding the viewer, like a strict friend' },
      ]),
      product,
    ],
    writer: 'Write a short explainer starring a cute, rounded 3D body part character in a bright Pixar-like style, inside a soft, clean macro body world. It speaks in first person about the topic, shows one simple everyday cause, and ends with one practical, general habit. This is entertainment and general wellness, not medical advice: no diagnoses, cures, treatments, doses or product health claims. If a product photo is given, it can appear only as an everyday object, with no claim about what it does to the body.',
    cover: covers.rose,
  }),
  clip({
    id: 'earn-object-explainer', name: 'Object explainer', group: '3D explainers',
    blurb: 'Your product or any object speaks for itself: what it is, what it needs, why it matters.',
    job: 'A first person 3D object character explainer',
    inputs: [
      idea('The object and what it should explain', 'A cast iron pan explaining why you should never soak it'),
      product,
    ],
    writer: 'Write a short explainer starring the object as a cute 3D animated character in a bright Pixar-like style, in its real setting. It introduces itself in first person in Shot 1 with a visible action, explains one thing people get wrong about it, shows the right way, and ends with a one line takeaway. If a product photo is given, the character is that exact product.',
    cover: covers.slate,
  }),
  series({
    id: 'earn-tiny-worker', name: 'Tiny worker', group: '3D explainers',
    blurb: 'A tiny rounded worker shows the job your product or topic does, from the inside.',
    job: 'A three beat inside-the-machine explainer with one tiny worker',
    inputs: [
      idea('What the worker does, and where', 'Inside a dishwasher, the worker that gets the grease off'),
      reference, product,
    ],
    writer: 'Write a three beat explainer starring one cute, rounded blob worker character with big eyes and a tiny hard hat, already busy at work inside the place the user names, shown in macro scale. Beat 1: the worker introduces itself by what it does and shows the mess or problem. Beat 2: it does the job, step by step, with visible effort. Beat 3: the result, and one cheerful sign-off line. The same worker, colors and voice in every beat; a cute high-pitched voice. No health or medical claims.',
    cover: covers.mint,
  }),
]

export const earn = [...productAds, ...faceless, ...drama, ...influencer, ...explainers]
