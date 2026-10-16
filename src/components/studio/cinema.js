// Option lists for Cinema studio. Lens, focal length, aperture and the still camera bodies
// come from the 'cinema-shot' format so the studio and the format speak the same language.
import { formatById } from '../../lib/formats/index.js'

const shotInputs = formatById('cinema-shot')?.inputs || []
const fromShot = (id) => (shotInputs.find((i) => i.id === id)?.options || []).map(({ id: oid, label, note }) => ({ id: oid, label, note }))

export const runsOn = {
  video: formatById('cinema-shot')?.runsOn || 'open weights',
  image: 'FLUX 3 Image Klein',
}

export const genres = [
  { id: 'general', label: 'General', note: 'No genre pull' },
  { id: 'action', label: 'Action', note: 'Kinetic, close to the hit' },
  { id: 'epic', label: 'Epic', note: 'Scale and grandeur' },
  { id: 'drama', label: 'Drama', note: 'Grounded and intimate' },
  { id: 'comedy', label: 'Comedy', note: 'Bright, timed for the laugh' },
  { id: 'horror', label: 'Horror', note: 'Dread in the shadows' },
  { id: 'noir', label: 'Noir', note: 'Hard light, deep black' },
]

export const eras = [
  { id: 'auto', label: 'Auto' },
  { id: '60s', label: '60s' },
  { id: '80s', label: '80s' },
  { id: '90s', label: '90s' },
  { id: '2000s', label: '2000s' },
  { id: '2020s', label: '2020s' },
]

export const tempos = [
  { id: 'single', label: 'Single shot', note: 'One unbroken take' },
  { id: 'calm', label: 'Calm', note: 'Long holds, few cuts' },
  { id: 'dynamic', label: 'Dynamic', note: 'Steady, motivated cuts' },
  { id: 'chaotic', label: 'Chaotic', note: 'Rapid cuts, raw energy' },
]

export const cameraTypes = [
  { id: 'modern', label: 'Modern', note: 'Clean digital cinema', art: 'modern' },
  { id: 'dv', label: 'DV camcorder', note: 'Early tape look', art: 'dv' },
  { id: '35mm', label: '35mm film', note: 'Grain and rich color', art: 'film' },
  { id: '8mm', label: '8mm film', note: 'Home movie texture', art: 'super8' },
]

const bodyArt = { digital: 'modern', '35mm': 'film', '16mm': 'film', super8: 'super8', vhs: 'dv', phone: 'phone' }
export const stillBodies = fromShot('camera').map((o) => ({ ...o, art: bodyArt[o.id] || 'modern' }))
export const lenses = fromShot('lens')
export const focals = fromShot('focal')
export const apertures = fromShot('aperture')

// Cinematic cameras 1.5 ships recommended rigs; each sets all four wheels at once.
export const rigPresets = [
  { id: 'portrait', label: 'Portrait', body: '35mm', lens: 'vintage', focal: '85mm', aperture: 'f1-4' },
  { id: 'landscape', label: 'Landscape', body: 'digital', lens: 'spherical', focal: '24mm', aperture: 'f11' },
  { id: 'street', label: 'Street', body: '16mm', lens: 'spherical', focal: '35mm', aperture: 'f5-6' },
  { id: 'epic', label: 'Epic wide', body: 'digital', lens: 'anamorphic', focal: '24mm', aperture: 'f2-8' },
  { id: 'home', label: 'Home movie', body: 'super8', lens: 'vintage', focal: '35mm', aperture: 'f5-6' },
  { id: 'detail', label: 'Detail', body: 'digital', lens: 'macro', focal: '50mm', aperture: 'f2-8' },
]

export const moves = [
  'Static', 'Handheld', 'Dolly in', 'Dolly out', 'Dolly left', 'Dolly right', 'Pan left', 'Pan right',
  'Tilt up', 'Tilt down', 'Crane up', 'Crane down', 'Jib up', 'Jib down', 'Arc left', 'Arc right',
  'Orbit', 'Zoom in', 'Zoom out', 'Crash zoom in', 'Crash zoom out', 'Dolly zoom', 'Tracking', 'Follow',
  'POV', 'Robot arm', 'Helicopter', 'FPV drone', 'Aerial pullback', 'Overhead', 'Dutch angle', 'Whip pan',
  'Bullet time', 'Car mount', 'Through an object', 'Focus pull', 'Body mount', 'Hyperlapse',
].map((label) => ({ id: label.toLowerCase().replace(/\s+/g, '-'), label }))

// Palette swatches are content, like a brand kit's colors, so they live here as data.
export const palettes = [
  { id: 'auto', label: 'Auto', colors: [] },
  { id: 'teal-orange', label: 'Teal and orange', colors: ['#1f4e5a', '#2f8f9d', '#f2a65a', '#d9622b'] },
  { id: 'bleach', label: 'Bleach bypass', colors: ['#2b2d2f', '#6b7072', '#b9bcb8', '#e6e4dc'] },
  { id: 'warm-film', label: 'Warm film', colors: ['#3b2418', '#8c5a3c', '#d9a066', '#f2e3c6'] },
  { id: 'green-film', label: 'Green film', colors: ['#1e2b22', '#4f6b4a', '#a3b18a', '#e8e2c8'] },
  { id: 'mono', label: 'Mono', colors: ['#0d0d0d', '#3a3a3a', '#8a8a8a', '#e0e0e0'] },
  { id: 'neon', label: 'Neon night', colors: ['#120b2e', '#ff2e88', '#2ee6ff', '#f9f871'] },
  { id: 'pastel', label: 'Pastel dream', colors: ['#f7d6e0', '#c5d7f2', '#d8f3dc', '#fff1c1'] },
  { id: 'desert', label: 'Desert sun', colors: ['#5a3a22', '#c2703d', '#e8b26a', '#f6e3b4'] },
  { id: 'arctic', label: 'Arctic blue', colors: ['#0b2545', '#13315c', '#8da9c4', '#eef4ed'] },
  { id: 'golden', label: 'Golden hour', colors: ['#4a2c1a', '#c96f2b', '#f2b134', '#ffe6a7'] },
  { id: 'moss', label: 'Moss and rust', colors: ['#2f3e2b', '#6b7f3a', '#a4512b', '#d9c2a7'] },
  { id: 'candy', label: 'Candy pop', colors: ['#ff4f9a', '#ffb3d1', '#7ad7f0', '#fff275'] },
  { id: 'faded', label: 'Faded summer', colors: ['#e9c46a', '#f4a261', '#e76f51', '#a8dadc'] },
  { id: 'cyber', label: 'Cyber magenta', colors: ['#1a0933', '#7b2cbf', '#e0aaff', '#ff4d6d'] },
  { id: 'earth', label: 'Muted earth', colors: ['#4a4036', '#8a7a64', '#c2b59b', '#ece4d4'] },
  { id: 'sepia', label: 'Sepia', colors: ['#3e2a1c', '#7a5a3c', '#b8956a', '#eadbc2'] },
  { id: 'ocean', label: 'Deep ocean', colors: ['#03045e', '#0077b6', '#00b4d8', '#caf0f8'] },
  { id: 'rose-gold', label: 'Rose gold', colors: ['#6d3b47', '#b76e79', '#e8b4b8', '#f6e7e4'] },
  { id: 'forest', label: 'Forest fog', colors: ['#1b2d2a', '#3c5a52', '#8fa89b', '#dfe7e2'] },
  { id: 'velvet', label: 'Velvet red', colors: ['#2b0a0f', '#6a0f1d', '#b3202f', '#e8c4c4'] },
  { id: 'citrus', label: 'Citrus', colors: ['#2d6a4f', '#95d5b2', '#ffd166', '#ff9f1c'] },
  { id: 'lavender', label: 'Lavender haze', colors: ['#3d3266', '#7d6fb3', '#c3b8e8', '#f1edfb'] },
  { id: 'steel', label: 'Cold steel', colors: ['#1c2733', '#3d5368', '#8899aa', '#d5dde5'] },
  { id: 'technicolor', label: 'Technicolor', colors: ['#c1121f', '#fdf0d5', '#003049', '#f4a261'] },
  { id: 'sodium', label: 'Sodium street', colors: ['#1a1208', '#7a4a12', '#e08e1b', '#ffcc66'] },
  { id: 'overcast', label: 'Overcast', colors: ['#3c4448', '#6f7a80', '#a9b3b8', '#e3e7e9'] },
  { id: 'blossom', label: 'Cherry blossom', colors: ['#5c2a3d', '#d66b8e', '#f6b8cb', '#fdeef2'] },
  { id: 'copper', label: 'Copper', colors: ['#2e1a12', '#7c3f22', '#c36f3f', '#f0c9a6'] },
  { id: 'mint', label: 'Mint chrome', colors: ['#0f3d3e', '#3fb8af', '#b8f2e6', '#f2f7f6'] },
  { id: 'midnight', label: 'Midnight', colors: ['#050816', '#141b41', '#306bac', '#98b9f2'] },
  { id: 'sandstone', label: 'Sandstone', colors: ['#6b4f3a', '#b08968', '#ddb892', '#f2e6d8'] },
  { id: 'ink', label: 'Ink and paper', colors: ['#111111', '#444444', '#d8d2c4', '#f6f1e7'] },
  { id: 'jungle', label: 'Jungle', colors: ['#081c15', '#1b4332', '#52b788', '#d8f3dc'] },
  { id: 'sunset', label: 'Sunset pink', colors: ['#3a0ca3', '#b5179e', '#f72585', '#ffb4a2'] },
  { id: 'retro-tv', label: 'Retro TV', colors: ['#264653', '#2a9d8f', '#e9c46a', '#e76f51'] },
  { id: 'piano', label: 'Piano black', colors: ['#000000', '#1c1c1e', '#3a3a3c', '#c7c7cc'] },
  { id: 'custom', label: 'Custom', colors: [] },
]
export const customPalette = ['#22303c', '#5b7a8c', '#e0b07a', '#f4ede1']

// x and y place the light in the little diagram, as a percentage of the box.
export const lights = [
  { id: 'auto', label: 'Auto', note: 'Lit to suit the scene', x: 30, y: 20 },
  { id: 'silhouette', label: 'Silhouette', note: 'Bright behind, dark subject', x: 50, y: 50, back: true },
  { id: 'practicals', label: 'Practicals', note: 'Lamps and screens in frame', x: 82, y: 70 },
  { id: 'window', label: 'Window', note: 'Soft side light', x: 6, y: 40 },
  { id: 'top', label: 'Top light', note: 'Hard fall from above', x: 50, y: 0 },
  { id: 'backlight', label: 'Backlight', note: 'Rim of light from behind', x: 70, y: 8, back: true },
  { id: 'cross', label: 'Soft cross', note: 'Two soft sides', x: 10, y: 30, second: true },
  { id: 'custom', label: 'Custom', note: 'Set it yourself', x: 50, y: 20 },
]
export const customLight = { color: '#ffd9a8', brightness: 70, diffusion: 50, angle: 45 }

export const emotions = ['Joy', 'Trust', 'Fear', 'Surprise', 'Sadness', 'Disgust', 'Anger', 'Hope']
  .map((label) => ({ id: label.toLowerCase(), label }))
export const intensities = [
  { id: 'subtle', label: 'Subtle' },
  { id: 'clear', label: 'Clear' },
  { id: 'strong', label: 'Strong' },
]

export const modes = [
  { id: 'refs', label: 'From references', note: 'A new clip from your references', placeholder: 'Describe the scene. Type @ to cast a character' },
  { id: 'forward', label: 'Extend forward', note: 'Continue a clip', clip: 'Clip to extend', placeholder: 'Describe what happens next' },
  { id: 'backward', label: 'Extend backward', note: 'Show what came before a clip', clip: 'Clip to extend', placeholder: 'Describe what happened just before' },
  { id: 'edit', label: 'Edit video', note: 'Change one part of a clip', clip: 'Clip to edit', placeholder: 'Describe the change, like swap the red car for a bicycle' },
]

export const versions = [
  { id: '4.0', label: 'Cinema studio 4.0', note: 'Up to 30s, 50 references, extend and edit', refs: 50, cast: 50, duration: 30, modes: ['refs', 'forward', 'backward', 'edit'], clip: 30 },
  { id: '3.5', label: 'Cinema studio 3.5', note: 'Up to 15s, 9 references', refs: 9, cast: 9, duration: 15, modes: ['refs', 'forward'], clip: 15 },
  { id: '3.0', label: 'Cinema studio 3.0', note: 'Native audio and speed ramps', refs: 9, cast: 9, duration: 15, modes: ['refs', 'forward'], clip: 15 },
  { id: '2.5', label: 'Cinema studio 2.5', note: 'Up to 3 cast members, no clip uploads', refs: 9, cast: 3, duration: 12, modes: ['refs'], clip: 0 },
]
export const stillVersions = [
  { id: '1.5', label: 'Cinematic cameras 1.5', note: 'Aperture and recommended rigs', refs: 9, cast: 4, aperture: true },
  { id: '1.0', label: 'Cinematic cameras 1.0', note: 'Camera, lens and focal length', refs: 9, cast: 4, aperture: false },
]

export const durations = [5, 8, 10, 12, 15, 20, 30]
export const resolutions = ['720p', '1080p']
export const videoRatios = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16']
export const stillRatios = ['21:9', '16:9', '3:2', '4:3', '1:1', '3:4', '2:3', '9:16']

export const blankShot = {
  prompt: '',
  genre: 'general', era: 'auto', tempo: 'single',
  camera: 'modern', body: 'digital', lens: 'spherical', focal: '35mm', aperture: 'f2-8', move: 'static',
  palette: 'auto', custom: customPalette,
  light: 'auto', lightCustom: customLight,
  refs: [], cast: [],
  mode: 'refs', clip: null,
  version: '4.0', stillVersion: '1.5',
  duration: 5, resolution: '1080p', ratio: '16:9', stillRatio: '16:9', sound: true, batch: 1,
}

export const byId = (list, id) => list.find((o) => o.id === id) || list[0]
