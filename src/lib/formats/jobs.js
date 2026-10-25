// The jobs people come for. Every format belongs to exactly one, and galleries show jobs first, then formats.
// The first six are the ones Higgsfield's audience asks for; Photo, Audio and 3D cover the rest of the catalog.
export const jobs = [
  { id: 'ugc', name: 'UGC', blurb: 'Talking clips and reviews that feel filmed on a phone.' },
  { id: 'ads', name: 'Ads from your link', blurb: 'Product shots, ads and variants for your business.' },
  { id: 'influencer', name: 'AI influencer', blurb: 'One face, posted anywhere.' },
  { id: 'cinematic', name: 'Cinematic', blurb: 'Camera moves, shots and scenes like a film set.' },
  { id: 'effects', name: 'Effects', blurb: 'One photo in, a short effect clip out.' },
  { id: 'edit', name: 'Edit', blurb: 'Change, fix or upscale a picture or a video.' },
  { id: 'photo', name: 'Photo', blurb: 'Looks, portraits and playful pictures.' },
  { id: 'audio', name: 'Audio', blurb: 'Voices, music and sound.' },
  { id: '3d', name: '3D', blurb: 'Objects, scenes and small games.' },
]

export const jobIds = jobs.map((j) => j.id)
export const jobById = (id) => jobs.find((j) => j.id === id)

// Most formats take their job from their category. A few read as a different job than their neighbours.
const byCategory = {
  voice: 'ugc', explainer: 'ugc', ads: 'ads', characters: 'influencer',
  cinema: 'cinematic', story: 'cinematic', camera: 'cinematic',
  effects: 'effects', mixed: 'effects', looks: 'photo',
  'image-edit': 'edit', 'video-edit': 'edit', enhance: 'edit',
  sound: 'audio', models3d: '3d', scenes3d: '3d',
}
const byId = {
  'ugc-ad': 'ugc', 'hook-check': 'ugc', 'asmr-add-on': 'ugc', 'asmr-classic': 'ugc', 'asmr-host': 'ugc', 'asmr-promo': 'ugc',
  'podcast-clips': 'ugc', 'clip-to-shorts': 'ugc',
  headshot: 'photo', 'profile-picture': 'photo', portrait: 'photo', 'age-progression': 'photo',
  'add-sound': 'audio',
}

// A format that names a known job keeps it.
export function jobFor(format) {
  if (jobIds.includes(format.job)) return format.job
  if (byId[format.id]) return byId[format.id]
  if (format.kind === 'audio') return 'audio'
  if (format.kind === '3d') return '3d'
  if (format.category === 'fun') return format.kind === 'video' ? 'effects' : 'photo'
  return byCategory[format.category] || (format.kind === 'video' ? 'effects' : 'photo')
}
