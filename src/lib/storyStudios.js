import { ltx25Sizes } from './catalog.js'
import { createEngine } from './flowEngine.js'
import { covers } from './formats/parts.js'
import { formatById } from './formats/index.js'

export const scriptInstructions = 'Write only a finished narration script, in short paragraphs. Respect the requested language, duration, channel, style, and narrator. Preserve supplied script facts. Source links are context labels only: do not claim to have read or watched them. Do not invent a transcript of uploaded footage. Use only the supplied description or transcript.'
export const shotInstructions = 'Turn the approved narration into a shot list. Return only a JSON array of 1 to 50 objects with title, narration, visual, and seconds (positive number). Preserve all approved narration verbatim and in order across the shots. Each shot should contain at most 45 words. Use the requested visual style. For uploaded footage use source "footage" and numeric start and end within its selected trim, in chronological order. When restyle is true, each footage range must be at most 3 seconds long. Otherwise use source "generate". No markdown fences or commentary.'

export function parseShots(text, values, approvedScript) {
  let shots
  try { shots = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '')) } catch { throw new Error('Shot list must be a valid JSON array. Edit it or write it again.') }
  if (!Array.isArray(shots) || !shots.length || shots.length > 50) throw new Error('Use between 1 and 50 shots.')
  if (approvedScript && shots.map((shot) => shot?.narration || '').join(' ').replace(/\s+/g, ' ').trim() !== approvedScript.replace(/\s+/g, ' ').trim()) throw new Error('The shot narration must preserve the approved script in order.')
  return shots.map((shot, i) => {
    if (!shot || !['title', 'narration', 'visual'].every((key) => typeof shot[key] === 'string' && shot[key].trim())) throw new Error(`Shot ${i + 1} needs a title, narration and visual.`)
    if (!Number.isFinite(shot.seconds) || shot.seconds <= 0 || shot.seconds > 120) throw new Error(`Shot ${i + 1} needs a duration between 0 and 120 seconds.`)
    const source = shot.source || 'generate'
    if (!['footage', 'generate'].includes(source)) throw new Error(`Shot ${i + 1} has an unknown source.`)
    if (source === 'footage' && (!values.video?.url || !Number.isFinite(shot.start) || !Number.isFinite(shot.end) || shot.start < (values.video.trim?.start || 0) || shot.end <= shot.start || shot.end > (values.video.trim?.end ?? values.video.duration))) throw new Error(`Shot ${i + 1} needs a valid range inside the uploaded footage.`)
    if (source === 'footage' && values.restyle && shot.end - shot.start > 3.01) throw new Error(`Shot ${i + 1} exceeds the 3-second restyling limit. Split it into shorter shots or turn off Restyle footage.`)
    return { ...shot, source }
  })
}

export function storyNote(values) {
  return JSON.stringify(values, (key, value) => ['url', 'image', 'images'].includes(key) ? undefined : value)
}

export function reviewStory(values, writePrompt, onChange) {
  const flow = {
    id: 'story-review',
    nodes: [
      { id: 'script', type: 'writer', data: { instructions: scriptInstructions, note: storyNote(values), target: 'Narration script' } },
      { id: 'approve-script', type: 'approve', data: {} },
      { id: 'shots', type: 'writer', data: { instructions: shotInstructions, note: storyNote(values), target: 'Shot list' } },
      { id: 'approve-shots', type: 'approve', data: {} },
    ],
    edges: [{ source: 'script', target: 'approve-script' }, { source: 'approve-script', target: 'shots' }, { source: 'shots', target: 'approve-shots' }],
  }
  const engine = createEngine({ writePrompt, onChange, concurrency: 1 })
  return { flow, engine }
}

export function shotFormat(shot, values) {
  return {
    id: `story-${values.studio.toLowerCase().replace(/[^a-z]+/g, '-')}-shot`, job: 'Render an approved story shot', cover: covers.sky, name: `${values.studio} shot`, shape: 'chain', kind: values.animation === 'full' ? 'video' : 'image',
    inputs: [{ id: 'visual', type: 'longtext', label: 'Visual' }],
    steps: [
      { id: 'image', provider: 'comfy', workflow: 'image_flux', kind: 'image', prompt: '{visual}', settings: { aspect: values.ratio } },
      ...(values.animation === 'full' ? [{ id: 'motion', provider: 'comfy', workflow: 'ltx25_i2v', sizes: ltx25Sizes, kind: 'video', prompt: '{visual}', settings: { aspect: values.ratio, duration: 5 } }] : []),
    ],
    outputs: [{ step: values.animation === 'full' ? 'motion' : 'image', kind: values.animation === 'full' ? 'video' : 'image' }],
  }
}

export function footageFormat() {
  const base = formatById('restyle-video')
  return {
    ...base, id: 'story-footage', name: 'Style a story shot', shape: 'pipeline',
    inputs: [{ id: 'video', type: 'video', label: 'Footage' }, { id: 'style', type: 'longtext', label: 'Look' }],
    steps: [{ id: 'restyle', provider: 'comfy', workflow: 'bernini_restyle', kind: 'video', prompt: 'Restyle this footage in the following look: {style}. Preserve the subject, action and composition.', settings: { aspect: 'auto' } }],
    outputs: [{ step: 'restyle', kind: 'video' }],
  }
}

// Runs one shot at a time through the shared queue and Library adapter. Keep completed shots on retry.
export async function renderStory(shots, values, { generateFormat, stitch, onProgress = () => {}, cache = new Map() }) {
  const clips = []
  for (const [i, shot] of shots.entries()) {
    const cached = async (key, work) => {
      if (!cache.has(key)) cache.set(key, await work())
      return cache.get(key)
    }
    onProgress(`Shot ${i + 1} of ${shots.length}: visuals`)
    const restyled = shot.source === 'footage' && values.restyle
    const visual = shot.source === 'footage' && !restyled ? values.video : await cached(`visual-${i}`, async () => {
      const run = restyled
        ? await generateFormat(footageFormat(), { video: { ...values.video, trim: { start: shot.start, end: shot.end } }, style: `${values.style}. ${shot.visual}` })
        : await generateFormat(shotFormat(shot, values), { visual: `${values.style}. ${shot.visual}` })
      const file = run.results()[0]
      if (!file?.url) throw new Error(`Shot ${i + 1} returned no visual.`)
      return file
    })
    onProgress(`Shot ${i + 1} of ${shots.length}: voiceover`)
    const audio = await cached(`voice-${i}`, async () => {
      const run = await generateFormat(formatById('tts'), { script: shot.narration, voice: values.voice, language: values.language === 'auto' ? 'en' : values.language || 'en', emotion: values.emotion || 'neutral' })
      const file = run.results()[0]
      if (!file?.url) throw new Error(`Shot ${i + 1} returned no voiceover.`)
      return file
    })
    clips.push({ url: visual.url, kind: shot.source === 'footage' ? 'video' : visual.kind, start: shot.source === 'footage' && !restyled ? shot.start : undefined, end: shot.source === 'footage' && !restyled ? shot.end : undefined, duration: shot.seconds, narration: { url: audio.url }, caption: values.captions ? shot.narration : '' })
  }
  onProgress('Join shots, narration, captions and music')
  return stitch({ clips, aspect: values.ratio, captionStyle: values.captionStyle || 'clean', music: values.music?.url ? { url: values.music.url, volume: 0.15 } : undefined })
}

export function readStoryChannels(storage = globalThis.localStorage) {
  try {
    const channels = JSON.parse(storage.getItem('comfyfield.story-channels') || '[]')
    return Array.isArray(channels) ? channels.filter((channel) => channel && typeof channel.id === 'string') : []
  } catch { return [] }
}
