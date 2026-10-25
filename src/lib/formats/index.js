// Preserve the full catalog and expose only formats whose targets validate to galleries.
import { falFormats } from './fal.js'
import { motion } from './motion.js'
import { edits } from './edit.js'
import { people } from './people.js'
import { ads } from './ads.js'
import { looks } from './looks.js'
import { fun } from './fun.js'
import { three } from './three.js'
import { apps2 } from './appsx.js'
import { presets } from './presetsx.js'
import { mixedLooks } from './mixedx.js'
import { jobs as useCases } from './jobsx.js'
import { jobs } from './jobs.js'
import { validateFormat } from './validate.js'
import { effects } from './effects.js'

export const categories = [
  { id: 'camera', name: 'Camera moves', blurb: 'One photo, one camera move.' },
  { id: 'effects', name: 'Effects', blurb: 'One click visual effects for a photo.' },
  { id: 'cinema', name: 'Cinema', blurb: 'Direct a shot like a film set.' },
  { id: 'story', name: 'Storyboards', blurb: 'Plan a sequence of consistent shots.' },
  { id: 'explainer', name: 'Explainers', blurb: 'A topic in, a narrated video out.' },
  { id: 'looks', name: 'Looks', blurb: 'Style presets for a whole picture.' },
  { id: 'image-edit', name: 'Image edits', blurb: 'Change part of a picture, keep the rest.' },
  { id: 'video-edit', name: 'Video edits', blurb: 'Change a real video without reshooting it.' },
  { id: 'characters', name: 'Characters', blurb: 'The same face in every shot.' },
  { id: 'voice', name: 'Voice and avatars', blurb: 'Faces that talk, lipsync and speech.' },
  { id: 'sound', name: 'Music and sound', blurb: 'Songs, loops and sound effects.' },
  { id: 'ads', name: 'Ads', blurb: 'Product videos and ad variants.' },
  { id: 'fun', name: 'Just for fun', blurb: 'Toys, stickers and game styles from a photo.' },
  { id: 'mixed', name: 'Mixed media', blurb: 'Restyle a clip with a hand-made look.' },
  { id: 'models3d', name: '3D models', blurb: 'Turn a photo or a prompt into an object you can spin.' },
  { id: 'scenes3d', name: 'Scenes and games', blurb: 'Whole 3D scenes and small browser games from a prompt.' },
  { id: 'enhance', name: 'Enhance', blurb: 'Sharper, smoother, cleaner.' },
]

// Category and model label for each fal format, kept here so fal.js stays as its author wrote it.
const falInfo = {
  melt: ['effects', 'Seedance 2.0'],
  'zero-gravity': ['effects', 'Seedance 2.0'],
  'city-giant': ['effects', 'Kling 3'],
  claymation: ['effects', 'Seedance 2.0'],
  'nine-shots': ['story', 'Nano Banana 2'],
  'new-angle': ['image-edit', 'Qwen Image Edit'],
  relight: ['image-edit', 'Nano Banana 2'],
  'outfit-swap': ['image-edit', 'FASHN'],
  'remove-background': ['enhance', 'Bria'],
  upscale: ['enhance', 'SeedVR'],
}

const fromFal = falFormats.map((r) => {
  const [category, model] = falInfo[r.id] || ['effects', 'fal']
  return { ...r, engine: 'fal', category, runsOn: `${model} via fal` }
})

// Any single camera move can go into "Mix two moves". The mix keeps its hand-written phrases;
// the other moves read from their blurb, e.g. "a whip pan (a fast pan that streaks into the next moment)".
const singleMoves = [...motion, ...presets].filter((f) => f.category === 'camera' && f.group !== 'Mix')
const phrase = (f) => {
  const name = f.name.toLowerCase()
  const blurb = f.blurb.replace(/\.$/, '').replace(/\byour\b/g, 'the')
  return `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name} (${blurb.charAt(0).toLowerCase()}${blurb.slice(1)})`
}
const widenMix = (f) => ({
  ...f,
  inputs: f.inputs.map((i) => {
    if (i.type !== 'choice') return i
    const have = new Set(i.options.map((o) => `cam-${o.id}`))
    const more = singleMoves.filter((m) => !have.has(m.id)).map((m) => ({ id: m.id.replace(/^cam-/, ''), label: m.name, text: phrase(m) }))
    return { ...i, options: [...i.options, ...more] }
  }),
})

export const allFormats = [...motion, ...presets, ...looks, ...edits, ...people, ...ads, ...fun, ...apps2, ...mixedLooks, ...useCases, ...three, ...fromFal, ...effects]
  .map((f) => (f.id === 'cam-mix' ? widenMix(f) : f))

export const formatProblems = new Map(allFormats.map((f) => [f.id, validateFormat(f)]))
export const formats = allFormats.filter((f) => !formatProblems.get(f.id).length)

export { jobs, jobById } from './jobs.js'

// Featured first, then open weights before fal. There is no usage data yet, so featured stands in for popular.
export const popularFirst = (list) => {
  const rank = (f) => (f.featured ? 0 : 2) + (isOpen(f) ? 0 : 1)
  return [...list].sort((a, b) => rank(a) - rank(b))
}
export const formatsForJob = (job) => popularFirst(formats.filter((f) => f.job === job))
// Jobs in their fixed order, each with how many formats it has. A job with none stays out of the list.
export const jobRail = () => jobs.map((j) => ({ ...j, count: formats.filter((f) => f.job === j.id).length })).filter((j) => j.count)

// Higgsfield's app hubs. A format with `hub` set shows on /apps under that hub and opens at /apps/:id.
export const hubs = [
  { id: 'professional', name: 'Professional', blurb: 'Angles, shots, zooms and color for working creators.' },
  { id: 'enhance', name: 'Enhance and style', blurb: 'Relight, retouch, restyle and try on.' },
  { id: 'face', name: 'Face and identity', blurb: 'Your own face or a saved character, anywhere.' },
  { id: 'video-edit', name: 'Video editing', blurb: 'Change a real video without reshooting it.' },
  { id: 'ads', name: 'Ads and products', blurb: 'Packshots, billboards and product videos.' },
  { id: 'games', name: 'Games and characters', blurb: 'Game styles, figures and characters.' },
  { id: 'extras', name: 'Extras', blurb: 'Handy one-click utilities.' },
  { id: 'trending', name: 'Trending templates', blurb: 'The templates everyone is making this week.' },
]
export const appsIn = (hub) => formats.filter((f) => f.hub === hub)

export const isWired = (f) => !(formatProblems.get(f.id) || validateFormat(f)).length
export const isOpen = (f) => f.engine === 'comfy'

// Studio scaffolds still read controls from planned formats; galleries use the validated list.
export const formatById = (id) => allFormats.find((f) => f.id === id)

export const filterFormats = ({ category = 'all', openOnly = true, query = '' } = {}) => {
  const q = query.trim().toLowerCase()
  return formats.filter((f) => (category === 'all' || f.category === category)
    && (!openOnly || isOpen(f))
    && (!q || `${f.name} ${f.blurb} ${f.runsOn}`.toLowerCase().includes(q)))
}

// The three media the studio rail is organized by.
export const kinds = [
  { id: 'image', name: 'Image', title: 'Make an image', blurb: 'Describe a picture, or pick a format from the left to start from a photo.' },
  { id: 'video', name: 'Video', title: 'Make a video', blurb: 'Describe a shot, or pick a format from the left to bring a photo to life.' },
  { id: 'audio', name: 'Audio', title: 'Make audio', blurb: 'Type a line to voice, or pick a format for music and sound.' },
  // No composer models yet, so 3D opens on its first category instead of a prompt.
  { id: '3d', name: '3D', title: 'Make 3D', blurb: 'Objects, scenes and small games.', prompt: false },
]

// A category can read differently under one medium.
const kindNames = { audio: { voice: 'Voice' } }
export const categoryOf = (id, kind) => {
  const c = categories.find((x) => x.id === id)
  return c && { ...c, name: kindNames[kind]?.[id] || c.name }
}

export const formatsFor = ({ kind, category, openOnly = true }) => formats.filter((f) => f.kind === kind
  && (!category || f.category === category) && (!openOnly || isOpen(f)))

// Rail entries for one medium: each category with at least one format of that kind, in category order.
export const railFor = (kind, openOnly) => categories
  .map((c) => ({ ...categoryOf(c.id, kind), count: formatsFor({ kind, category: c.id, openOnly }).length }))
  .filter((c) => c.count)

// Featured first, open weights before fal.
export function featuredFor(kind, n = 4, openOnly = false) {
  const rank = (f) => (f.featured ? 0 : 2) + (isOpen(f) ? 0 : 1)
  return formatsFor({ kind, openOnly }).sort((a, b) => rank(a) - rank(b)).slice(0, n)
}

// "Use in" targets for a finished generation: [format id, input id it fills, menu label].
export const useIn = {
  image: [
    ['cinema-shot', 'image', 'Animate as a cinema shot'],
    ['cam-dolly-in', 'image', 'Add a camera move'],
    ['talking-head', 'image', 'Make it talk'],
    ['expand', 'image', 'Expand'],
    ['restyle', 'image', 'Restyle'],
    ['upscale', 'image', 'Upscale'],
  ],
  video: [
    ['extend-video', 'video', 'Extend'],
    ['restyle-video', 'video', 'Restyle'],
    ['swap-element', 'video', 'Swap an element'],
    ['add-sound', 'video', 'Add sound'],
    ['video-upscale', 'video', 'Upscale'],
  ],
  audio: [],
}

// Opens a format with a finished generation already attached.
export const prefill = (inputId, item) => ({ [inputId]: { url: item.url, name: item.caption || item.model || 'Generation', ratio: item.aspect } })
