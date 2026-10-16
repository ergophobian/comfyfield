// Gradients stand in for preview media until we have our own example outputs.
export const imageModels = [
  { id: 'flux', name: 'FLUX', note: 'Sharp, prompt-faithful stills', workflow: 'image_flux' },
  { id: 'sdxl', name: 'SDXL', note: 'Fast open-weights baseline', workflow: 'image_sdxl' },
]

export const videoModels = [
  { id: 'ltx', name: 'LTX Video', note: 'Open-weights text and image to video', workflow: 'video_ltx' },
]

export const aspects = ['1:1', '16:9', '9:16', '4:5']
export const durations = [3, 5, 8]

export const aspectSize = {
  '1:1': [1024, 1024],
  '16:9': [1280, 720],
  '9:16': [720, 1280],
  '4:5': [896, 1120],
}

export const cameraMoves = [
  { id: 'dolly-in', name: 'Dolly in', prompt: 'slow dolly in toward the subject, shallow depth of field' },
  { id: 'crane-up', name: 'Crane up', prompt: 'camera cranes up and over the scene revealing the landscape' },
  { id: 'orbit', name: 'Orbit', prompt: 'smooth 180 degree orbit around the subject' },
  { id: 'whip-pan', name: 'Whip pan', prompt: 'fast whip pan with motion blur into the next shot' },
  { id: 'fpv', name: 'FPV dive', prompt: 'fpv drone dive through the scene at high speed' },
  { id: 'handheld', name: 'Handheld', prompt: 'handheld documentary camera, subtle shake, natural light' },
  { id: 'push-tilt', name: 'Push and tilt', prompt: 'push in while tilting up to reveal the subject' },
  { id: 'static', name: 'Locked off', prompt: 'locked off tripod shot, subject moves through frame' },
]

export const effects = [
  { id: 'melt', name: 'Melt down', tag: 'Hot', prompt: 'the subject slowly melts into liquid chrome', hue: [14, 340] },
  { id: 'paper', name: 'Paper fold', prompt: 'the scene folds up like origami paper', hue: [40, 200] },
  { id: 'giant', name: 'City giant', tag: 'New', prompt: 'the subject grows to a giant towering over the city', hue: [210, 260] },
  { id: 'float', name: 'Zero gravity', prompt: 'everything begins to float weightlessly upward', hue: [190, 280] },
  { id: 'shatter', name: 'Glass shatter', prompt: 'the frame shatters into glass shards around the subject', hue: [180, 320] },
  { id: 'bloom', name: 'Flower bloom', prompt: 'flowers bloom rapidly across every surface', hue: [320, 60] },
  { id: 'clay', name: 'Claymation', prompt: 'the scene turns into stop motion claymation', hue: [24, 90] },
  { id: 'ink', name: 'Ink spill', prompt: 'black ink spills and redraws the scene as a sketch', hue: [250, 0] },
  { id: 'neon', name: 'Neon outline', tag: 'New', prompt: 'the subject is traced in glowing neon outlines', hue: [290, 170] },
  { id: 'storm', name: 'Storm brew', prompt: 'a storm forms overhead with lightning strikes', hue: [220, 30] },
  { id: 'pixel', name: 'Pixelate', prompt: 'the subject dissolves into 8 bit pixels', hue: [150, 300] },
  { id: 'portal', name: 'Portal step', prompt: 'the subject steps through a glowing portal into another world', hue: [270, 20] },
]

export const featured = [
  { title: 'Cinema studio', body: 'Direct the shot: pick a camera move and let it roll.', to: '/cinema', hue: [16, 290] },
  { title: 'Effects', body: 'One photo in, a share-ready effect out.', to: '/effects', hue: [330, 40] },
  { title: 'Image', body: 'Open models, studio-grade stills.', to: '/image', hue: [200, 260] },
  { title: 'Video', body: 'Text and image to video with LTX.', to: '/video', hue: [160, 220] },
]

export function gradient([a, b], seed = 0) {
  return `radial-gradient(120% 90% at ${20 + (seed * 13) % 60}% 0%, hsl(${a} 90% 60% / .9), transparent 60%),
    radial-gradient(100% 80% at 100% 100%, hsl(${b} 85% 55% / .85), transparent 55%),
    linear-gradient(160deg, hsl(${a} 40% 14%), hsl(${b} 45% 10%))`
}
