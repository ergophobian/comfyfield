// 3D models, scenes and small browser games. 3D has no composer, so these are the only way in.
import { open, photo, covers } from './parts.js'

const glb = 'A .glb model you can spin and download'

const models = [
  open({
    id: 'image-to-3d', name: 'Photo to 3D model', kind: '3d', category: 'models3d', featured: true,
    blurb: 'Turn a photo of one object into a 3D model.',
    runsOn: 'TRELLIS.2', workflow: 'trellis2_image',
    inputs: [
      photo,
      // TRELLIS.2's cascades: 1024 is its default, 1536 its finest. The upsample stage takes no less.
      { id: 'detail', type: 'choice', label: 'Detail', default: 'draft', options: [
        { id: 'draft', label: 'Draft', note: 'Quick shape and texture', params: { resolution: 1024 } },
        { id: 'final', label: 'Final', note: 'Full detail, takes longer', params: { resolution: 1536 } },
      ] },
    ],
    output: glb,
    cover: covers.indigo,
  }),
  open({
    id: 'text-to-3d', name: 'Text to 3D model', kind: '3d', category: 'models3d',
    blurb: 'Describe an object and get a 3D model of it.',
    runsOn: 'FLUX 3 Image Klein and TRELLIS.2', workflow: 'flux_trellis2',
    inputs: [
      { id: 'object', type: 'longtext', label: 'What to make', placeholder: 'A weathered wooden treasure chest with iron bands and a brass lock' },
      { id: 'style', type: 'choice', label: 'Style', default: 'realistic', options: [
        { id: 'realistic', label: 'Realistic', text: 'with realistic materials and fine surface detail' },
        { id: 'stylized', label: 'Stylized', text: 'as a stylized hand painted game asset with chunky proportions' },
        { id: 'low-poly', label: 'Low poly', text: 'as a clean low poly model with flat colored facets' },
      ] },
    ],
    // The first pass draws one clean reference image for TRELLIS.2 to lift into a mesh.
    prompt: 'A single {object} {style}, the whole object in view at a three quarter angle, centered on a plain white background, soft even studio light with no harsh shadows.',
    output: glb,
    cover: covers.lilac,
  }),
  open({
    id: 'character-to-3d', name: 'Character figure', kind: '3d', category: 'models3d',
    blurb: 'Turn a saved character into a 3D figure.',
    runsOn: 'FLUX 3 Image Klein and TRELLIS.2', workflow: 'trellis2_character',
    inputs: [
      { id: 'character', type: 'character', label: 'Character' },
      { id: 'pose', type: 'choice', label: 'Pose', default: 'standing', options: [
        { id: 'standing', label: 'Standing', text: 'standing in a relaxed neutral pose with arms at their sides' },
        { id: 'a-pose', label: 'Ready to rig', note: 'A pose', text: 'in an A pose with arms angled down and away from the body' },
        { id: 'action', label: 'Action', text: 'in a dynamic heroic action pose' },
        { id: 'sitting', label: 'Sitting', text: 'sitting cross-legged on the ground' },
      ] },
    ],
    // Klein draws the figure from the character's first picture, which it cannot tie to a name, and
    // TRELLIS.2 lifts that drawing into a mesh.
    prompt: 'Turn the character in the first image into a full body figure {pose}. Keep their face, hair, outfit and colors. Show the whole figure centered on a plain white background, in soft even light.',
    output: 'A .glb figure you can spin and download',
    cover: covers.rose,
  }),
  open({
    id: 'turntable', name: '3D turntable video', kind: '3d', category: 'models3d', hub: 'trending',
    blurb: 'Spin a product or object a full turn in 3D.',
    runsOn: 'TRELLIS.2', workflow: 'trellis2_turntable',
    inputs: [
      { id: 'image', type: 'image', label: 'Product or object photo' },
      // ComfyUI's mesh renderer draws the model's base color on a flat backdrop, with no lights.
      { id: 'background', type: 'choice', label: 'Background', default: 'white', options: [
        { id: 'white', label: 'White', params: { background: '#ffffff' } },
        { id: 'dark', label: 'Dark', params: { background: '#1c1c22' } },
        { id: 'soft', label: 'Soft blue', params: { background: '#e6e9f5' } },
      ] },
    ],
    // The graph takes no text: TRELLIS.2 builds the model from the photo and the camera orbits it.
    prompt: '',
    output: 'A 4 second turntable video of the model',
    cover: covers.slate,
  }),
]

const scenes = [
  open({
    id: 'scene-3d', name: '3D scene', kind: '3d', category: 'scenes3d', layout: 'wide',
    blurb: 'Describe a place and get a 3D scene you can edit.',
    runsOn: 'Qwen3.8 and Blender', workflow: 'qwen3_blender_scene',
    inputs: [
      { id: 'scene', type: 'longtext', label: 'Scene', placeholder: 'A cozy cabin with a fireplace, a reading chair, full bookshelves and snow falling outside the window' },
      { id: 'camera', type: 'choice', label: 'Camera path', half: true, default: 'orbit', options: [
        { id: 'orbit', label: 'Orbit', text: 'a slow orbit around the center of the scene', params: { path: 'orbit' } },
        { id: 'fly', label: 'Fly through', text: 'a smooth fly through that weaves between the objects', params: { path: 'fly_through' } },
        { id: 'dolly', label: 'Dolly', text: 'a slow dolly push toward the focal point', params: { path: 'dolly' } },
      ] },
      { id: 'lighting', type: 'choice', label: 'Lighting', half: true, default: 'day', options: [
        { id: 'day', label: 'Daylight', text: 'bright natural daylight and a soft sky' },
        { id: 'golden', label: 'Golden hour', text: 'warm low sun with long soft shadows' },
        { id: 'night', label: 'Night', text: 'cool moonlight with warm practical lamps' },
        { id: 'studio', label: 'Studio', text: 'clean three point studio lighting' },
      ] },
    ],
    // Qwen3 writes the Blender script, so the prompt reads as instructions to it.
    prompt: 'Build this 3D scene in Blender: {scene}. Model each object as its own named part with simple clean materials so the scene stays easy to edit. Light it with {lighting}, then animate the camera on {camera} and render a short clip.',
    output: 'An editable scene and a rendered clip',
    cover: covers.dusk,
  }),
  open({
    id: 'game', name: 'Game from a prompt', kind: '3d', category: 'scenes3d',
    blurb: 'Describe a game idea and play it in your browser.',
    runsOn: 'Qwen3.8 or Kimi K3', workflow: 'qwen3_coder_game',
    inputs: [
      { id: 'idea', type: 'longtext', label: 'Game idea', placeholder: 'A paper airplane drifts through a messy office, dodging desk fans and collecting paper clips' },
      { id: 'genre', type: 'choice', label: 'Genre', default: 'platformer', options: [
        { id: 'platformer', label: 'Platformer', text: 'a side scrolling platformer with jumps, moving platforms and collectibles' },
        { id: 'puzzle', label: 'Puzzle', text: 'a grid based puzzle game with levels that get harder' },
        { id: 'runner', label: 'Endless runner', text: 'an endless runner that speeds up over time, with obstacles to jump and slide past' },
        { id: 'shooter', label: 'Top-down shooter', note: 'Cartoon targets', text: 'a top-down arcade shooter where the player pops cartoon balloons and paper targets' },
        { id: 'racing', label: 'Racing', text: 'a top-down racing game on a looping track against simple rival cars' },
      ] },
    ],
    prompt: 'Write a small, complete browser game as a single HTML file using plain JavaScript and a canvas, with no external files or libraries. Make it {genre}. The idea: {idea}. Include a title screen, a score, keyboard and touch controls, a clear way to win or lose and a restart button. Draw everything in code with simple shapes and bright colors, and keep it friendly for all ages.',
    output: 'A small game that runs in the browser',
    cover: covers.sun,
  }),
  open({
    id: 'world-3d', name: 'Explorable world', kind: '3d', category: 'scenes3d',
    blurb: 'Describe a place and look around it in 360 degrees.',
    runsOn: 'HY-World 2.0', workflow: 'hyworld2',
    inputs: [
      { id: 'image', type: 'image', label: 'Start from a photo', optional: true },
      { id: 'world', type: 'longtext', label: 'Describe the world', placeholder: 'A misty bamboo forest with a stone path, paper lanterns and a small shrine' },
    ],
    prompt: 'A seamless 360 degree explorable world: {world}. A continuous horizon and consistent lighting all the way around, rich detail in every direction and a clear ground to stand on.',
    output: 'A 360 world you can look around in',
    cover: covers.mint,
  }),
]

export const three = [...models, ...scenes]
