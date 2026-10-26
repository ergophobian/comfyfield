// Camera moves, effects, cinema, storyboards and explainers.
import { open, photo, note, covers, wanLora } from './parts.js'
import { h3Sizes, ltx25Sizes, wanSizes } from '../catalog.js'

// Every camera move is the same image to video job, only the move changes.
// Each move sets its own pace, so a shaky move is not told to be smooth.
const cam = (slug, name, blurb, move, cover) => open({
  id: `cam-${slug}`, name, kind: 'video', category: 'camera', blurb,
  runsOn: 'MiniMax H3', workflow: 'h3_open_i2v', sizes: h3Sizes,
  inputs: [photo, note],
  prompt: `${move} The subject, scene and lighting stay true to the photo, with cinematic, physically plausible motion. {note}`,
  settings: { aspect: 'auto', duration: 5 },
  cover,
})

const inGroup = (group, list) => list.map((f) => ({ ...f, group }))

// `own` swaps the model for one effect, such as a trained effect LoRA.
const effect = (id, name, blurb, prompt, cover, own) => open({
  id, name, kind: 'video', category: 'effects', blurb,
  runsOn: 'LTX-2.5', workflow: 'ltx25_i2v', sizes: ltx25Sizes, ...own,
  inputs: [photo, note],
  prompt,
  settings: { aspect: 'auto', duration: 5 },
  cover,
})

const basicMoves = inGroup('Basic camera control', [
  cam('dolly-in', 'Dolly in', 'The camera glides slowly toward your subject.',
    'Slow, smooth dolly in toward the subject on a track, the frame tightens and the background gently falls away.', covers.indigo),
  cam('dolly-out', 'Dolly out', 'The camera pulls back to reveal the whole scene.',
    'Slow, smooth dolly out away from the subject on a track, pulling back to reveal more of the surroundings.', covers.sky),
  cam('pan-left', 'Pan left', 'The camera turns to sweep left across the scene.',
    'The camera stays in place on a tripod and pans slowly and smoothly to the left, sweeping across the scene to reveal what lies beside the subject.', covers.mint),
  cam('pan-right', 'Pan right', 'The camera turns to sweep right across the scene.',
    'The camera stays in place on a tripod and pans slowly and smoothly to the right, sweeping across the scene to reveal what lies beside the subject.', covers.peach),
  cam('tilt-up', 'Tilt up', 'The camera tilts up from your subject to what is above.',
    'The camera stays in place and tilts slowly and steadily upward, starting on the subject and rising to the sky or ceiling above them.', covers.sun),
  cam('tilt-down', 'Tilt down', 'The camera tilts down from above to land on your subject.',
    'The camera stays in place and starts pointed at the sky or the top of the scene, then tilts slowly and steadily down to settle on the subject.', covers.lilac),
  cam('tilt-reveal', 'Tilt reveal', 'The camera tilts up from the ground to reveal the subject.',
    'The camera starts pointed at the ground in front of the subject and slowly tilts up to reveal the subject and the scene behind them.', covers.rose),
  cam('zoom-in', 'Zoom in', 'The lens zooms in slowly on your subject.',
    'The camera stays still while the lens zooms in slowly and steadily on the subject, the perspective flattening as the frame tightens to a close up.', covers.dusk),
  cam('zoom-out', 'Zoom out', 'The lens zooms out to show the wider scene.',
    'The camera stays still while the lens zooms out slowly and steadily from the subject, widening the frame to take in the whole scene around them.', covers.slate),
  cam('tracking', 'Tracking shot', 'The camera moves alongside your subject.',
    'Tracking shot: the camera travels sideways alongside the subject at walking pace, keeping them in frame while the foreground and background slide past with parallax.', covers.sky),
  cam('handheld', 'Handheld', 'A loose camera that feels shot on the spot.',
    'Handheld camera with natural subtle shake, small drifting reframes and breathing, documentary feel, the operator stands close to the subject.', covers.slate),
  cam('static', 'Still camera', 'The camera holds still while the scene comes alive.',
    'Locked off camera on a tripod with no camera movement at all. Only the scene moves: hair and fabric stir in the air, light shifts softly and the background has subtle natural motion.', covers.mint),
])

const epicMoves = inGroup('Epic camera control', [
  cam('crane-up', 'Crane up', 'The camera rises high above the scene.',
    'Crane shot: the camera rises smoothly from eye level and tilts down, ending high above the subject looking down over the scene.', covers.dusk),
  cam('boom-down', 'Boom down', 'The camera drops from high above to eye level.',
    'The camera starts high above the scene looking down, then booms smoothly down on a crane to eye level and settles face on with the subject.', covers.sun),
  cam('fpv-dive', 'FPV dive', 'A drone dives down and races through the scene.',
    'FPV drone shot: the camera dives steeply from high above, pulls out low and races fast through the scene past the subject, fluid banking turns.', covers.night),
  cam('drone-flyover', 'Drone flyover', 'A drone sweeps over the scene from high above.',
    'Aerial drone shot: the camera glides steadily forward high over the subject and the land around them, the ground sliding past below to reveal the full scale of the place.', covers.sky),
  cam('orbit', 'Orbit', 'The camera circles around your subject.',
    'The camera orbits in a smooth half circle around the subject, which stays centered while the background sweeps past behind it with strong parallax.', covers.lilac),
  cam('bullet-time', 'Bullet time', 'Time freezes while the camera sweeps around.',
    'Bullet time: the moment freezes mid action with hair, fabric and particles hanging in the air while the camera sweeps smoothly around the frozen subject.', covers.mint),
  cam('crash-zoom', 'Crash zoom', 'A sudden punch in on your subject.',
    'A sudden, fast crash zoom straight into the subject, snapping from the full frame to a tight close up, abrupt and dramatic.', covers.rose),
  cam('dolly-zoom', 'Dolly zoom', 'The background stretches while the subject stays put.',
    'Dolly zoom vertigo effect: the camera moves toward the subject while zooming out, so the subject holds the same size while the background stretches and warps behind it.', covers.dusk),
  cam('robo-arm', 'Robo arm', 'A fast robotic sweep that stops dead on a new angle.',
    'Motion control robot arm shot: the camera swoops fast and precisely around the subject in a tight arc, then brakes to a crisp, exact stop on a new angle, slick high speed commercial feel.', covers.slate),
  cam('spiral-up', 'Spiral up', 'The camera circles and rises above your subject.',
    'The camera spirals upward around the subject, circling and climbing at the same time in one smooth move until it looks straight down on them from high above.', covers.indigo),
  cam('roll-360', '360 roll', 'The frame rolls a full turn as the camera pushes in.',
    'The camera pushes slowly toward the subject while rolling a full 360 degrees around the lens axis, the horizon turning all the way over and coming back level, smooth and hypnotic.', covers.peach),
  cam('sky-pullback', 'Sky pull back', 'The camera rockets back until your subject is a speck.',
    'The camera starts close on the subject, then pulls back and up at great speed, flying away into the sky until the subject is a tiny speck in a vast landscape.', covers.night),
])

const feelMoves = inGroup('Catch the pulse', [
  cam('whip-pan', 'Whip pan', 'A fast pan that streaks into the next moment.',
    'The camera holds on the subject, then whips sideways in a very fast pan with streaking motion blur and snaps to a stop on a new part of the scene.', covers.peach),
  cam('snorricam', 'Snorricam', 'The camera rides on your subject as the world sways.',
    'Snorricam shot: the camera is rigged to the subject\'s body facing them, so they stay locked in the center of the frame while the world behind them sways and bobs with every step, intimate and disorienting.', covers.rose),
  cam('pov-walk', 'POV walk', 'See the scene through the eyes of someone walking in.',
    'First person point of view: the camera walks forward through the scene at eye level with a gentle natural head bob and small glances, as if seen through the eyes of someone exploring it.', covers.mint),
  cam('car-mount', 'Car mount', 'A camera rigged to a car with the world streaming past.',
    'The camera rides on a car mount, gliding low and fast alongside the subject, the subject held steady in frame while the road and background stream past in motion blur.', covers.slate),
  cam('earthquake', 'Earthquake shake', 'The ground rumbles and the frame shakes hard.',
    'The camera holds on the scene, then shakes hard as if the ground is rumbling, with sharp jolts and rattling vibration, dust and small objects trembling, before it slowly settles.', covers.sun),
  cam('hyperlapse', 'Hyperlapse', 'The camera moves forward while time races past.',
    'Hyperlapse: the camera moves steadily forward through the scene in stabilized steps while time races, clouds streak across the sky, light changes and passersby blur into trails.', covers.dusk),
  cam('rack-focus', 'Rack focus', 'Focus shifts from the foreground onto your subject.',
    'The camera stays still. Focus starts on something in the foreground with the subject soft and blurred, then smoothly racks to bring the subject into crisp focus as the foreground melts into bokeh.', covers.lilac),
  cam('turntable', 'Turntable', 'Your subject turns in place as if on a lazy susan.',
    'The camera stays still while the subject turns slowly on the spot as if standing on a lazy susan, rotating smoothly to show every side, the background steady behind them.', covers.indigo),
  cam('window-push', 'Through the window', 'The camera pushes through a window into the scene.',
    'The camera starts outside looking in through a window or doorway framing the subject, pushes smoothly forward through the opening and carries on into the scene toward the subject.', covers.sky),
  cam('slow-shutter', 'Slow shutter', 'Motion smears into dreamy streaks around your subject.',
    'Slow shutter look: the camera drifts slightly while moving lights and figures smear into long dreamy motion trails, the subject stays mostly sharp, woozy step printed feel.', covers.night),
])

// Short phrases so two moves read as one sentence in the mix prompt.
const mixMoves = [
  { id: 'dolly-in', label: 'Dolly in', text: 'a slow dolly in toward the subject' },
  { id: 'dolly-out', label: 'Dolly out', text: 'a slow dolly out that reveals the surroundings' },
  { id: 'pan-left', label: 'Pan left', text: 'a smooth pan to the left across the scene' },
  { id: 'pan-right', label: 'Pan right', text: 'a smooth pan to the right across the scene' },
  { id: 'tilt-up', label: 'Tilt up', text: 'a slow tilt up from the subject to what is above' },
  { id: 'zoom-in', label: 'Zoom in', text: 'a steady lens zoom in on the subject' },
  { id: 'tracking', label: 'Tracking', text: 'a tracking move sideways alongside the subject' },
  { id: 'handheld', label: 'Handheld', text: 'a loose handheld drift with natural shake' },
  { id: 'crane-up', label: 'Crane up', text: 'a crane up that rises high above the scene' },
  { id: 'orbit', label: 'Orbit', text: 'an orbit around the subject with strong parallax' },
  { id: 'crash-zoom', label: 'Crash zoom', text: 'a sudden crash zoom into a tight close up' },
  { id: 'dolly-zoom', label: 'Dolly zoom', text: 'a dolly zoom where the background stretches while the subject holds its size' },
]

const camMix = open({
  id: 'cam-mix', name: 'Mix two moves', kind: 'video', category: 'camera', group: 'Mix',
  blurb: 'Chain two camera moves into one continuous shot.',
  runsOn: 'MiniMax H3', workflow: 'h3_open_i2v', sizes: h3Sizes,
  inputs: [
    photo,
    { id: 'first', type: 'choice', label: 'First move', default: 'dolly-in', options: mixMoves },
    { id: 'second', type: 'choice', label: 'Then', default: 'orbit', options: mixMoves },
    note,
  ],
  prompt: 'One continuous shot from the photo. The camera opens with {first}, then flows into {second} without a cut. The subject, scene and lighting stay true to the photo, with cinematic, physically plausible motion. {note}',
  settings: { aspect: 'auto', duration: 5 },
  cover: covers.lilac,
})

const cameraMoves = [...basicMoves, ...epicMoves, ...feelMoves, camMix]

// Effects that Higgsfield lists on its Effects hub read as Trending, the rest as Effects.
const hubEffects = new Set(['floating-fall', 'high-flip', 'studio-slide', 'eyes-in', 'street-giant', 'world-morph', 'selfception', 'roller-coaster'])
const grouped = (list) => list.map((f) => ({ ...f, group: hubEffects.has(f.id) ? 'Trending' : 'Effects' }))

const effects = grouped([
  effect('turn-to-sand', 'Turn to sand', 'Your subject crumbles into drifting sand.',
    'The subject slowly turns to fine sand and crumbles away from the edges, grains pouring down and blowing off in the wind while the background stays still, locked camera. Disintegration. {note}', covers.sun, wanLora('wan22_i2v_disintegration_redmond_high_noise')),
  effect('origami-fold', 'Origami fold', 'The scene folds itself into paper origami.',
    'The whole scene transforms into folded paper origami: every surface creases along crisp lines and folds into clean paper shapes, soft matte paper texture, locked camera. {note}', covers.slate),
  effect('snow-globe', 'Snow globe', 'The scene shrinks into a snow globe.',
    'The camera pulls back to reveal the whole scene as a tiny world sealed inside a glass snow globe on a wooden table, snowflakes swirling around it, warm soft light. {note}', covers.sky),
  effect('time-lapse', 'Time lapse', 'Hours pass in seconds around your subject.',
    'Time lapse: clouds race across the sky, daylight turns to dusk, shadows sweep across the ground and passersby blur while the subject and camera stay perfectly still. {note}', covers.dusk),
  effect('burst-into-petals', 'Burst into petals', 'The subject bursts into a swirl of flower petals.',
    'The subject bursts apart into thousands of soft pink and white flower petals that swirl outward on a breeze and drift through the frame, gentle slow motion. {note}', covers.rose),
  effect('paint-splash', 'Paint splash', 'Bright paint splashes across the frame.',
    'Thick paint in vivid colors splashes across the scene in slow motion, coating the subject in flowing streaks and flying droplets, high speed camera look. {note}', covers.peach),
  effect('floating-fall', 'Floating fall', 'Your subject drifts down through the sky like a feather.',
    'The subject floats slowly down through an open sky in calm slow motion, hair and clothes rippling upward, soft clouds drifting past around and below them, the camera falling gently alongside, serene and weightless. {note}', covers.sky),
  effect('high-flip', 'High flip', 'Your subject springs up into a high backflip.',
    'The subject crouches and springs high into the air, turns a clean athletic backflip at the peak in slow motion and lands on their feet in the same spot, the camera tilting up to follow the jump, realistic body mechanics. {note}', covers.peach),
  effect('studio-slide', 'Studio slide', 'The background slides away to reveal a photo studio.',
    'The background behind the subject slides sideways out of frame like a stage set on rails, revealing a bright photo studio with a seamless white backdrop and softbox lights, the subject stays in place and is now lit like a studio portrait. {note}', covers.slate),
  effect('eyes-in', 'Eyes in', 'The camera dives into an eye and out into another world.',
    'skyrimprey pupil transition, the camera zooms in to complete a pupil transition, shifting the scene to a vast glowing galaxy of stars and color, one continuous move. {note}', covers.lilac, wanLora('wan_22_high_noise_pupil_transition', 1, 'wan_22_high_noise_pupil_transition', 0)),
  effect('street-giant', 'Street giant', 'Your subject towers over a busy street.',
    'The camera pulls back and tilts up to reveal the subject grown to giant size, towering over a busy city street, cars and tiny pedestrians moving around their feet, the buildings reaching only to their waist, realistic scale, shadows and lighting. {note}', covers.dusk),
  effect('world-morph', 'World morph', 'The world around your subject changes again and again.',
    'The subject stays still and in place while the surroundings morph seamlessly from one world into the next: a sunny desert, a coral reef underwater, a snowy pine forest and a glowing city at night, the light on the subject shifting to match each one. {note}', covers.mint),
  effect('selfception', 'Selfception', 'The camera pulls back to find the photo inside itself.',
    'The camera pulls back to reveal that the photo is a framed picture hanging inside the very same scene, then keeps pulling back to find that scene framed again inside itself, an endless picture within a picture, one smooth continuous pull back. {note}', covers.indigo),
  { ...effect('roller-coaster', 'Roller coaster', 'Your subject rides the front car of a roller coaster.',
    'The subject sits in the front car of a roller coaster as it crests the top of the lift hill and plunges down a steep drop, wind whipping past, the track and sky rushing by, the camera mounted on the car facing them, thrilling and joyful. {note}', covers.sun), hub: 'trending' },
  effect('glitch-out', 'Glitch out', 'The frame breaks into digital glitches.',
    'The image glitches out in sharp bursts: the red, green and blue channels split apart, blocks of pixels smear and tear sideways, scan lines and digital noise flicker across the subject, then the picture snaps back clean, locked camera. {note}', covers.night),
  effect('turn-to-hologram', 'Hologram', 'Your subject flickers into a glowing hologram.',
    'The subject turns into a translucent blue hologram projected from a glowing disc below them, thin scan lines rolling upward through the figure, light flicker and brief glitches, while the scene around them stays real, locked camera. {note}', covers.sky),
  effect('turn-to-ice', 'Turn to ice', 'Frost creeps over your subject until it freezes solid.',
    'Frost spreads across the subject from the ground up, ice crystals growing and crackling until the subject is frozen into a clear, glistening ice sculpture, cold mist curling off the surface, locked camera. {note}', covers.slate),
  effect('shatter', 'Shatter', 'The picture cracks like glass and bursts apart.',
    'Cracks race across the image as if it were a pane of glass, then it shatters into hundreds of sharp shards that fly toward the camera in slow motion, each shard still showing a piece of the subject, revealing darkness behind. {note}', covers.indigo),
  effect('portal', 'Portal', 'A glowing portal opens and your subject steps through.',
    'A swirling ring of glowing light opens in the air in front of the subject, crackling at its edges and showing a sunlit fantasy landscape on the other side, the subject steps through and the camera follows them into the new world. {note}', covers.lilac),
  effect('pixel-dissolve', 'Pixel dissolve', 'Your subject breaks apart into floating pixels.',
    'The subject breaks apart into small glowing cubes of pixels, starting at one edge and spreading across the whole figure, the cubes floating up and drifting away into the air while the background stays still, locked camera. {note}', covers.mint),
  effect('balloon-lift', 'Balloon lift', 'A bunch of balloons lifts your subject into the sky.',
    'A huge bunch of colorful balloons tied to the subject tugs them gently off the ground and lifts them higher and higher into a bright blue sky, the camera tilting up to follow as the scene shrinks below, whimsical and light. {note}', covers.rose),
])

const cinemaShot = open({
  id: 'cinema-shot', name: 'Cinema shot', kind: 'video', category: 'cinema', layout: 'wide', featured: true,
  blurb: 'Pick the camera, lens and move, then describe the scene.',
  runsOn: 'LTX-2.5 on Comfy Cloud, or MiniMax H3 or Wan 2.2',
  inputs: [
    { id: 'image', type: 'image', label: 'Start frame', optional: true },
    { id: 'scene', type: 'longtext', label: 'Scene', placeholder: 'A lighthouse keeper climbs the spiral stairs at dusk while rain streaks the windows' },
    { id: 'camera', type: 'choice', label: 'Camera', half: true, default: 'digital', options: [
      { id: 'digital', label: 'Digital cinema', note: 'Clean and sharp', text: 'a digital cinema camera, clean sharp image, wide dynamic range' },
      { id: '35mm', label: '35mm film', note: 'Classic film grain', text: '35mm film, fine organic grain, rich film color' },
      { id: '16mm', label: '16mm film', note: 'Gritty and textured', text: '16mm film, visible grain, soft halation, slightly lifted blacks' },
      { id: 'super8', label: 'Super 8', note: 'Home movie', text: 'Super 8 film, heavy grain, warm faded color, light leaks and gate weave' },
      { id: 'vhs', label: 'VHS camcorder', note: 'Retro tape', text: 'a VHS camcorder, soft low resolution, color bleed, tape noise and scan lines' },
      { id: 'phone', label: 'Phone', note: 'Everyday footage', text: 'a phone camera, crisp everyday look, slight digital sharpening' },
    ] },
    { id: 'lens', type: 'choice', label: 'Lens', half: true, default: 'spherical', options: [
      { id: 'spherical', label: 'Spherical', note: 'Clean and natural', text: 'spherical lenses with natural geometry' },
      { id: 'anamorphic', label: 'Anamorphic', note: 'Wide flares, oval bokeh', text: 'anamorphic lenses, oval bokeh, horizontal lens flares, subtle edge distortion' },
      { id: 'vintage', label: 'Vintage', note: 'Soft and glowing', text: 'vintage lenses, soft contrast, gentle glow and swirly bokeh' },
      { id: 'macro', label: 'Macro', note: 'Tiny details up close', text: 'a macro lens, extreme detail, razor thin focus' },
      { id: 'fisheye', label: 'Fisheye', note: 'Curved and very wide', text: 'a fisheye lens, strong barrel distortion, curved horizon' },
    ] },
    { id: 'focal', type: 'choice', label: 'Focal length', half: true, default: '35mm', options: [
      { id: '14mm', label: '14mm', note: 'Very wide', text: '14mm ultra wide focal length' },
      { id: '24mm', label: '24mm', note: 'Wide', text: '24mm wide focal length' },
      { id: '35mm', label: '35mm', note: 'Storytelling', text: '35mm focal length' },
      { id: '50mm', label: '50mm', note: 'Natural', text: '50mm standard focal length' },
      { id: '85mm', label: '85mm', note: 'Portrait', text: '85mm portrait focal length, flattering compression' },
      { id: '135mm', label: '135mm', note: 'Tight and compressed', text: '135mm telephoto focal length, strong background compression' },
    ] },
    { id: 'aperture', type: 'choice', label: 'Aperture', half: true, default: 'f2-8', options: [
      { id: 'f1-4', label: 'f/1.4', note: 'Very shallow focus', text: 'f/1.4 aperture, very shallow depth of field, creamy background blur' },
      { id: 'f2-8', label: 'f/2.8', note: 'Soft background', text: 'f/2.8 aperture, shallow depth of field' },
      { id: 'f5-6', label: 'f/5.6', note: 'Balanced', text: 'f/5.6 aperture, moderate depth of field' },
      { id: 'f11', label: 'f/11', note: 'Everything sharp', text: 'f/11 aperture, deep focus, everything sharp' },
    ] },
    { id: 'movement', type: 'choice', label: 'Movement', half: true, default: 'dolly-in', options: [
      { id: 'static', label: 'Static', text: 'Locked off static camera on a tripod' },
      { id: 'dolly-in', label: 'Dolly in', text: 'Slow dolly in toward the subject' },
      { id: 'dolly-out', label: 'Dolly out', text: 'Slow dolly out revealing the surroundings' },
      { id: 'pan', label: 'Pan', text: 'Smooth horizontal pan across the scene' },
      { id: 'tilt', label: 'Tilt', text: 'Slow vertical tilt up through the scene' },
      { id: 'crane-up', label: 'Crane up', text: 'Crane up rising above the scene' },
      { id: 'orbit', label: 'Orbit', text: 'The camera orbits around the subject' },
      { id: 'handheld', label: 'Handheld', text: 'Handheld camera with natural subtle shake' },
      { id: 'tracking', label: 'Tracking', text: 'Tracking shot moving alongside the subject' },
      { id: 'dolly-zoom', label: 'Dolly zoom', text: 'Dolly zoom, the background stretches while the subject holds its size' },
    ] },
    { id: 'shot', type: 'choice', label: 'Shot size', half: true, default: 'medium', options: [
      { id: 'wide', label: 'Wide', text: 'Wide shot' },
      { id: 'medium', label: 'Medium', text: 'Medium shot' },
      { id: 'close', label: 'Close up', text: 'Close up' },
      { id: 'extreme', label: 'Extreme close up', text: 'Extreme close up' },
      { id: 'ots', label: 'Over the shoulder', text: 'Over the shoulder shot' },
    ] },
    { id: 'look', type: 'choice', label: 'Look', half: true, default: 'drama', options: [
      { id: 'drama', label: 'Drama', text: 'naturalistic dramatic lighting from motivated practical sources, grounded color' },
      { id: 'noir', label: 'Noir', text: 'film noir look, hard low key light, deep shadows, high contrast' },
      { id: 'scifi', label: 'Sci-fi', text: 'science fiction look, cool teal tones, glowing practical lights, atmospheric haze' },
      { id: 'western', label: 'Western', text: 'western look, dusty amber sunlight, sun bleached color' },
      { id: 'documentary', label: 'Documentary', text: 'documentary look, available light, honest natural color' },
      { id: 'music-video', label: 'Music video', text: 'music video look, bold saturated colored light, stylized and energetic' },
      { id: 'commercial', label: 'Commercial', text: 'polished commercial look, bright clean lighting, glossy highlights, crisp color' },
    ] },
    // LTX-2.5 is the Cinema engine: it runs on Comfy Cloud with no Pod, and Cinema studio's scenes use it too.
    { id: 'model', type: 'choice', label: 'Model', half: true, default: 'ltx', options: [
      { id: 'ltx', label: 'LTX-2.5', note: 'Default. Comfy Cloud, with sound' },
      { id: 'minimax', label: 'MiniMax H3', note: 'Highest quality, with sound' },
      { id: 'wan', label: 'Wan 2.2', note: 'Runs on smaller GPUs' },
    ] },
    { id: 'quality', type: 'choice', label: 'Quality', half: true, default: 'draft', options: [
      { id: 'draft', label: 'Draft', note: 'Low resolution and cheap, for picking a take', params: { scale: 0.6 } },
      { id: 'final', label: 'Final', note: 'Full resolution', params: { scale: 1 } },
    ] },
  ],
  prompt: '{shot}. {scene}. {movement}. Shot on {camera}, {lens}, {focal}, {aperture}, {look}.',
  settings: { aspect: '16:9', duration: 5 },
  // The model choice picks the graph, and each model draws on its own canvas. A start frame runs the image graph.
  steps: [{ id: 'generate', provider: 'comfy', kind: 'video', targetInput: 'model', settings: { aspect: '16:9', duration: 5 }, targets: {
    ltx: { workflow: 'ltx25_t2v', imageWorkflow: 'ltx25_i2v', sizes: ltx25Sizes },
    minimax: { workflow: 'h3_open_t2v', imageWorkflow: 'cinema_shot', sizes: h3Sizes },
    wan: { workflow: 'wan22_t2v', imageWorkflow: 'wan22_i2v', sizes: wanSizes },
  } }],
  cover: covers.night,
})

const firstLastFrame = open({
  id: 'first-last-frame', name: 'First and last frame', kind: 'video', category: 'cinema',
  blurb: 'Set the first and last frame, get the shot in between.',
  runsOn: 'MiniMax H3', workflow: 'h3_flf2v',
  inputs: [
    { id: 'first', type: 'image', label: 'First frame' },
    { id: 'last', type: 'image', label: 'Last frame' },
    { id: 'motion', type: 'text', label: 'How it moves', optional: true, placeholder: 'The camera drifts left as the subject turns around' },
  ],
  prompt: 'One continuous shot that starts exactly on the first frame and ends exactly on the last frame, with natural, physically plausible motion in between. {motion}',
  settings: { aspect: 'auto', duration: 5 },
  cover: covers.lilac,
})

const drawToVideo = open({
  id: 'draw-to-video', name: 'Draw to video', kind: 'video', category: 'cinema',
  blurb: 'Draw arrows on a frame to show what moves where.',
  runsOn: 'MiniMax H3 Fun ControlNet', workflow: 'h3_draw',
  inputs: [
    { id: 'image', type: 'draw', mode: 'motion', label: 'Start frame, then draw arrows where things should move' },
    { ...note, placeholder: 'The boat drifts left while the gulls lift off' },
  ],
  prompt: 'Animate the start frame so each object under an arrow moves along that arrow, following its path, direction and length, while everything unmarked stays steady. Natural, physically plausible motion, and the arrows never appear in the video. {note}',
  settings: { aspect: 'auto', duration: 5 },
  cover: covers.sun,
})

const multiShot = open({
  id: 'multi-shot', name: 'Multi-shot scene', kind: 'video', category: 'cinema', layout: 'wide',
  blurb: 'Describe a scene and get one video cut into several shots.',
  runsOn: 'LTX-2.5', workflow: 'ltx25_multishot',
  inputs: [
    { id: 'scene', type: 'longtext', label: 'Scene', placeholder: 'A cyclist races a storm home along a coast road and reaches the door just as the rain starts' },
    { id: 'shots', type: 'count', label: 'Shots', options: [2, 3, 4, 6], default: 3, unit: 'shots', half: true },
    { id: 'pacing', type: 'choice', label: 'Pacing', half: true, default: 'steady', options: [
      { id: 'slow', label: 'Slow', text: 'slow pacing with long held shots and gentle camera moves' },
      { id: 'steady', label: 'Steady', text: 'steady pacing with even shot lengths and motivated camera moves' },
      { id: 'fast', label: 'Fast cuts', text: 'fast pacing with short punchy shots and energetic camera moves' },
    ] },
    { id: 'character', type: 'character', label: 'Character', optional: true, half: true },
    { id: 'list', type: 'longtext', label: 'Shot by shot', optional: true, placeholder: 'Wide: the street at dawn\nMedium: the cyclist pedals hard into the wind\nClose up: the first raindrops hit the handlebars' },
  ],
  prompt: 'One scene told in {shots} shots with clean hard cuts between them: {scene}. Use {pacing}, and vary shot size and angle from cut to cut. {list} Keep the same characters, outfits, setting, lighting and time of day consistent in every shot.',
  settings: { aspect: '16:9', duration: 10 },
  cover: covers.dusk,
})

// H3 renders up to 10 seconds a run. A longer run opens with 10 seconds, then h3_extend continues the
// last second of each part on the server (shared/longVideo.js), so one prompt makes the whole video.
const longVideo = open({
  id: 'long-video', name: 'Long video', kind: 'video', category: 'cinema', layout: 'wide',
  blurb: 'One prompt, one continuous video up to a minute long.',
  runsOn: 'MiniMax H3', workflow: 'h3_open_t2v', imageWorkflow: 'h3_open_i2v', sizes: h3Sizes,
  inputs: [
    { id: 'scene', type: 'longtext', label: 'What happens', placeholder: 'A lone hiker crosses a misty ridge at dawn, stops at the edge, and watches the sun break through the clouds over the valley' },
    { id: 'length', type: 'choice', label: 'Length', half: true, default: '30', options: [
      { id: '20', label: '20 seconds', params: { duration: 20 } },
      { id: '30', label: '30 seconds', params: { duration: 30 } },
      { id: '45', label: '45 seconds', params: { duration: 45 } },
      { id: '60', label: '1 minute', params: { duration: 60 } },
    ] },
    { id: 'shape', type: 'choice', label: 'Shape', half: true, default: 'wide', options: [
      { id: 'wide', label: 'Wide, 16:9', params: { aspect: '16:9' } },
      { id: 'tall', label: 'Tall, 9:16', params: { aspect: '9:16' } },
    ] },
    { id: 'image', type: 'image', label: 'Start from a photo', optional: true },
  ],
  prompt: '{scene} One continuous take that keeps the same characters, outfits, setting, lighting and sound from start to end.',
  settings: { aspect: '16:9', duration: 30 },
  cover: covers.night,
})

const storyboard = open({
  id: 'storyboard', name: 'Storyboard', kind: 'image', category: 'story', featured: true, layout: 'wide',
  blurb: 'Turn a story idea into a set of consistent shots.',
  runsOn: 'FLUX 3 Image Klein', workflow: 'storyboard', imageWorkflow: 'storyboard_ref',
  bindings: { count: 'shots' },
  inputs: [
    { id: 'idea', type: 'longtext', label: 'Story idea', placeholder: 'A small delivery robot gets lost in a night market and finds its way home' },
    { id: 'shots', type: 'count', label: 'Shots', options: [4, 6, 8], default: 6, unit: 'shots', half: true },
    { id: 'character', type: 'character', label: 'Character', optional: true, half: true },
    { id: 'mode', type: 'choice', label: 'Planning', default: 'auto', options: [
      { id: 'auto', label: 'Write the shots for me', text: 'Plan the shots yourself, varying shot size and angle so the story reads clearly from frame to frame.' },
      { id: 'manual', label: 'I will write each shot', text: 'Follow this shot list, one frame per line:' },
    ] },
    { id: 'list', type: 'longtext', label: 'Shot list, one per line', when: ['mode', 'manual'], placeholder: 'Wide: the robot rolls into the crowded market\nClose up: its screen flickers with a question mark\nMedium: a kid points the way' },
    { id: 'look', type: 'choice', label: 'Look', default: 'cinematic', options: [
      { id: 'cinematic', label: 'Cinematic', text: 'cinematic film stills, natural light, shallow depth of field' },
      { id: 'anime', label: 'Anime', text: 'hand drawn anime frames, clean line art, cel shading, painted backgrounds' },
      { id: 'comic', label: 'Comic', text: 'comic book panels, bold ink lines, halftone shading, flat color' },
      { id: 'watercolor', label: 'Watercolor', text: 'loose watercolor illustrations, soft washes, visible paper texture' },
      { id: 'claymation', label: 'Claymation', text: 'stop motion claymation stills, handmade clay textures, miniature sets' },
    ] },
  ],
  prompt: 'A storyboard of {shots} shots telling this story: {idea}. {mode} {list} Keep the same characters, outfits, setting and lighting consistent across every frame. Style: {look}.',
  settings: { aspect: '16:9' },
  cover: covers.indigo,
})

const transition = open({
  id: 'transition', name: 'Transition', kind: 'video', category: 'story', hub: 'professional',
  blurb: 'Carry one shot into the next without a hard cut.',
  runsOn: 'MiniMax H3', workflow: 'h3_flf2v',
  inputs: [
    { id: 'from', type: 'image', label: 'From' },
    { id: 'to', type: 'image', label: 'To' },
    { id: 'style', type: 'choice', label: 'Style', default: 'morph', options: [
      { id: 'morph', label: 'Morph', text: 'a seamless morph where the shapes and colors of the first image flow and reshape into the second' },
      { id: 'whip-pan', label: 'Whip pan', text: 'a fast whip pan with heavy motion blur that lands on the second image' },
      { id: 'zoom-through', label: 'Zoom through', text: 'a rapid zoom into a detail of the first image that pushes through it and opens onto the second' },
      { id: 'match-cut', label: 'Match cut', text: 'a match cut where a shape or movement in the first image lines up with the same shape in the second' },
    ] },
  ],
  prompt: 'Transition from the first frame to the last frame using {style}. Both images stay faithful to the originals at the start and end.',
  // H3 is trained on about 5 to 15 s; 3 s falls short of it.
  settings: { aspect: 'auto', duration: 5 },
  cover: covers.mint,
})

// Explainers chain a script, pictures, motion and a voice, so each runs a multi-step workflow.
const explainers = [
  open({
    id: 'explainer', name: 'Explainer video', kind: 'video', category: 'explainer',
    blurb: 'Type a topic and get a narrated explainer.',
    runsOn: 'Qwen3.8, FLUX 3 Image Klein, MiniMax H3 and Chatterbox', workflow: 'explainer',
    inputs: [
      { id: 'topic', type: 'longtext', label: 'Topic', placeholder: 'How bees turn nectar into honey' },
      { id: 'style', type: 'choice', label: 'Style', default: 'whiteboard', options: [
        { id: 'whiteboard', label: 'Whiteboard', note: 'Drawn by hand as you watch', text: 'whiteboard animation, black marker line drawings sketched by hand on a clean white board, a few accent colors' },
        { id: 'flat', label: 'Flat illustration', note: 'Clean vector shapes', text: 'flat vector illustration, bold simple shapes, a friendly limited palette, smooth motion' },
        { id: 'paper', label: 'Paper cutout', note: 'Handmade paper layers', text: 'paper cutout animation, layered textured paper shapes with soft shadows, stop motion feel' },
        { id: '3d', label: '3D render', note: 'Soft rounded models', text: 'clean 3D render, rounded stylized models, soft studio lighting' },
      ] },
      { id: 'voice', type: 'voice', label: 'Narrator voice', optional: true },
      { id: 'length', type: 'choice', label: 'Length', default: '60', options: [
        { id: '30', label: '30 seconds', text: 'about 30 seconds', params: { duration: 30 } },
        { id: '60', label: '60 seconds', text: 'about 60 seconds', params: { duration: 60 } },
        { id: '90', label: '90 seconds', text: 'about 90 seconds', params: { duration: 90 } },
      ] },
    ],
    prompt: 'An explainer video about {topic}, {length} long. Write a clear, friendly narration script for a curious beginner, split it into short scenes, illustrate each scene as {style}, animate the visuals to follow the narration and read the script in a warm, clear voice.',
    settings: { aspect: '16:9' },
    output: 'A narrated video with a script you can edit',
    cover: covers.mint,
  }),
  open({
    id: 'faceless', name: 'Faceless video', kind: 'video', category: 'explainer',
    blurb: 'Turn a topic into a narrated short with no one on camera.',
    runsOn: 'Qwen3.8, FLUX 3 Image Klein, MiniMax H3 and Chatterbox', workflow: 'faceless',
    inputs: [
      { id: 'topic', type: 'longtext', label: 'Topic', placeholder: 'Five strange facts about the deep sea' },
      { id: 'look', type: 'choice', label: 'Look', default: 'cinematic', options: [
        { id: 'cinematic', label: 'Cinematic', note: 'Moody film footage', text: 'cinematic footage, natural light, slow camera moves, shallow depth of field' },
        { id: 'documentary', label: 'Documentary', note: 'Real world b-roll', text: 'documentary style b-roll, honest natural color, steady handheld moves' },
        { id: 'mystery', label: 'Mystery', note: 'Dark and atmospheric', text: 'dark atmospheric visuals, deep shadows, drifting fog, slow pushes in' },
        { id: 'anime', label: 'Anime', note: 'Painted animated scenes', text: 'anime style animated scenes, painted backgrounds, soft cel shading' },
        { id: 'storybook', label: 'Storybook', note: 'Soft painted pages', text: 'storybook illustrations, soft brush texture, warm gentle color' },
        { id: 'retro', label: 'Retro', note: 'Faded film and grain', text: 'retro film look, warm faded color, heavy grain and light leaks' },
      ] },
      { id: 'voice', type: 'voice', label: 'Narrator voice', optional: true, half: true },
      { id: 'format', type: 'choice', label: 'Format', half: true, default: 'vertical', options: [
        { id: 'vertical', label: 'Vertical', note: '9:16 for shorts and reels', text: 'a vertical short', params: { aspect: '9:16' } },
        { id: 'horizontal', label: 'Horizontal', note: '16:9 for long form', text: 'a horizontal video', params: { aspect: '16:9' } },
      ] },
    ],
    prompt: 'Make {format} about {topic}. Write a punchy narration script that opens with a strong hook, cut it into short scenes, cover each scene with {look}, add bold captions synced to the words and narrate it in an engaging voice. No one speaks to camera.',
    settings: { aspect: '9:16' },
    output: 'A narrated video with captions, no presenter',
    cover: covers.night,
  }),
  open({
    id: 'motion-graphics', name: 'Motion graphics', kind: 'video', category: 'explainer',
    blurb: 'Describe animated titles, charts or shapes and get them rendered.',
    runsOn: 'Qwen3.8', workflow: 'motion_graphics',
    inputs: [
      { id: 'brief', type: 'longtext', label: 'Brief', placeholder: 'A bar chart grows to show sales tripling over three years, then a big 3x pops in the center' },
      { id: 'brand', type: 'brand', label: 'Brand', optional: true },
      { id: 'style', type: 'choice', label: 'Style', default: 'clean', options: [
        { id: 'clean', label: 'Clean', note: 'Simple and modern', text: 'a clean modern style, generous white space, smooth eased motion' },
        { id: 'bold', label: 'Bold type', note: 'Big words, bright color', text: 'bold kinetic typography, big type, saturated color, punchy snappy motion' },
        { id: 'playful', label: 'Playful', note: 'Bouncy rounded shapes', text: 'a playful style, rounded shapes, bouncy springy motion, a cheerful palette' },
        { id: 'tech', label: 'Tech', note: 'Dark with glowing lines', text: 'a dark tech style, thin glowing lines, grids and data readouts, precise motion' },
        { id: 'paper', label: 'Paper', note: 'Flat cutouts and texture', text: 'a flat paper style, cutout shapes with soft shadows and subtle paper texture' },
      ] },
    ],
    prompt: 'Write code for an animated motion graphic: {brief}. Use {style}. Use the brand colors, fonts and logo when a brand is given, keep every word legible and on screen long enough to read, and render it to video.',
    settings: { aspect: '16:9', duration: 10 },
    output: 'Animated graphics rendered to video',
    cover: covers.lilac,
  }),
]

export const motion = [...cameraMoves, ...effects, cinemaShot, firstLastFrame, drawToVideo, multiShot, longVideo, storyboard, transition, ...explainers]
