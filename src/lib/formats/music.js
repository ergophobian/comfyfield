// Music videos: shots that follow a song on LTX-2.5 audio-to-video, joined into one video with the song.
// Each shot hears its own slice of the song (`shot` n starts n clip lengths in), so cuts land on time
// and the joined clips play the song through.
import { open, covers } from './parts.js'
import { ltx25Sizes } from '../catalog.js'

// One line per shot, in song order. Performance shots start from the artist photo when there is one.
const shots = [
  { role: 'Wide establishing shot that sets the world of the song, the camera drifting slowly in.' },
  { role: 'Medium shot of the artist performing the opening lines to the camera, lips and breathing in sync with the vocal.', artist: true },
  { role: 'Close up details that match the mood of the lyrics: hands, light, textures and small movements cut on the beat.' },
  { role: 'Tracking shot moving alongside the artist through the scene as the energy of the song rises.', artist: true },
  { role: 'Close up of the artist singing straight into the lens, lights pulsing with the rhythm.', artist: true },
  { role: 'The camera pulls back to a wide final shot as the music resolves.' },
]
const shotIds = shots.map((_, i) => `shot${i + 1}`)

const story = { id: 'story', type: 'text', label: 'What the video shows', optional: true, placeholder: 'A singer walks home through a rainy neon city at night' }
const artist = { id: 'artist', type: 'image', label: 'Artist photo', optional: true }
const look = { id: 'look', type: 'choice', label: 'Look', default: 'neon', options: [
  { id: 'neon', label: 'Neon night', text: 'Night city look with neon signs, wet streets, deep blues and magentas' },
  { id: 'film', label: 'Golden hour film', text: 'Warm golden hour light on 35mm film, soft grain and lens flares' },
  { id: 'mono', label: 'Black and white', text: 'High contrast black and white with hard light and deep shadows' },
  { id: 'dream', label: 'Dreamy pastel', text: 'Soft pastel colors, haze and slow floating movement' },
  { id: 'stage', label: 'Concert stage', text: 'Big concert stage with moving spotlights, haze and a crowd in silhouette' },
] }
const shape = { id: 'shape', type: 'choice', label: 'Shape', default: 'wide', options: [
  { id: 'wide', label: 'Wide 16:9', params: { aspect: '16:9' } },
  { id: 'tall', label: 'Vertical 9:16', params: { aspect: '9:16' } },
] }

const shotSteps = (from) => shots.map((shot, i) => ({
  id: shotIds[i], kind: 'video', provider: 'comfy', workflow: 'ltx25_a2v', ...(shot.artist && { imageWorkflow: 'ltx25_ia2v' }), sizes: ltx25Sizes,
  ...(from && { from }),
  prompt: `Music video, shot ${i + 1} of ${shots.length}. ${shot.role} {look}. The movement follows the rhythm of the song. {story}`,
  params: { shot: i },
}))
const join = { id: 'join', type: 'stitch', from: shotIds }

export const music = [
  open({
    id: 'music-video', name: 'Music video', kind: 'video', category: 'sound', hub: 'trending', featured: true,
    blurb: 'Add a song and get a music video cut to it.',
    job: 'A music video cut to your song', shape: 'pipeline',
    runsOn: 'LTX-2.5 audio to video',
    output: 'Six shots that follow the song, joined into one video with it (18 to 30 seconds)',
    inputs: [
      { id: 'song', type: 'audio', label: 'Song' },
      artist, story, look,
      { id: 'pace', type: 'choice', label: 'Cut every', default: '5', options: [
        { id: '3', label: '3 seconds', params: { duration: 3 } },
        { id: '4', label: '4 seconds', params: { duration: 4 } },
        { id: '5', label: '5 seconds', params: { duration: 5 } },
      ] },
      shape,
    ],
    settings: { aspect: '16:9', duration: 5 },
    steps: [...shotSteps([]), join],
    outputs: [{ step: 'join', kind: 'video' }],
    cover: covers.night,
  }),
  open({
    id: 'song-music-video', name: 'Song to music video', kind: 'video', category: 'sound', hub: 'trending',
    blurb: 'Describe a song. Get the song and a music video cut to it.',
    job: 'A new song and its music video', shape: 'pipeline',
    runsOn: 'MiniMax Music 3 and LTX-2.5 audio to video',
    output: 'A 30 second song, then six shots that follow it, joined into one video',
    inputs: [
      { id: 'brief', type: 'longtext', label: 'Describe the song', placeholder: 'Dreamy synth pop, airy female vocal, 100 bpm, about summer nights' },
      // MiniMax's own section tag stands for no lyrics.
      { id: 'lyrics', type: 'longtext', label: 'Lyrics', optional: true, blank: '[Instrumental]', placeholder: 'Leave empty for an instrumental' },
      artist, story, look, shape,
    ],
    settings: { aspect: '16:9', duration: 5 },
    steps: [
      { id: 'song', kind: 'audio', provider: 'comfy', workflow: 'minimax_music3', prompt: '{brief}', bindings: { lyrics: 'lyrics' }, settings: { duration: 30 } },
      ...shotSteps(['song']),
      join,
    ],
    outputs: [{ step: 'join', kind: 'video' }],
    cover: covers.dusk,
  }),
]
