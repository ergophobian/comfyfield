import { ltx25Sizes } from './catalog.js'
import { createEngine } from './flowEngine.js'
import { covers } from './formats/parts.js'
import { formatById } from './formats/index.js'

export const scriptInstructions = 'Write only a finished narration script, in short paragraphs. Respect the requested language, duration, channel, style, and narrator. Preserve supplied script facts. Source links are context labels only: do not claim to have read or watched them. Do not invent a transcript of uploaded footage. Use only the supplied description or transcript.'
export const shotInstructions = 'Turn the approved narration into a shot list. Return only a JSON array of 1 to 50 objects with title, narration, visual, and seconds (positive number). Preserve all approved narration verbatim and in order across the shots. Each shot should contain at most 45 words. For fully animated generated shots, use at most 5 seconds and at most 10 narration words per shot. Use the requested visual style. For uploaded footage use source "footage" and numeric start and end within its selected trim, in chronological order. When restyle is true, each footage range must fit at most 81 source frames, using video.fps from the settings. Otherwise use source "generate". No markdown fences or commentary.'

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
    if (source === 'generate' && values.animation === 'full' && (shot.seconds > 5 || shot.narration.trim().split(/\s+/).length > 10)) throw new Error(`Shot ${i + 1} exceeds the animated limit of 5 seconds or 10 narration words. Split it into shorter shots before approval.`)
    if (source === 'footage' && values.restyle && (!(values.video.fps > 0) || Math.ceil((shot.end - shot.start) * values.video.fps - 1e-6) > 81)) throw new Error(`Shot ${i + 1} exceeds the 81-frame restyling limit (${values.video.fps ? (81 / values.video.fps).toFixed(2) : 'unknown'} seconds at the source frame rate). Split it into shorter shots or turn off Restyle footage.`)
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

export function storyWorkflows(shot, values) {
  const visual = shot.source === 'footage'
    ? (values.restyle ? footageFormat().steps : [])
    : shotFormat(shot, values).steps
  return [...visual, ...formatById('tts').steps].map((step) => step.workflow)
}

// Each successful model step is a separate Library run, so a later failure cannot rebuy it.
export async function renderStory(shots, values, { generateFormat, stitch, preflight, onProgress = () => {}, cache = new Map() }) {
  shots = parseShots(JSON.stringify(shots), values)
  await preflight?.(values, shots)
  const clips = []
  for (const [i, shot] of shots.entries()) {
    const cached = async (key, format, inputs) => {
      if (!cache.has(key)) {
        const run = await generateFormat(format, inputs)
        const file = run.results()[0]
        if (!file?.url) throw new Error(`Shot ${i + 1} returned no ${key.split('-')[0]}.`)
        cache.set(key, file)
      }
      return cache.get(key)
    }
    onProgress(`Shot ${i + 1} of ${shots.length}: visuals`)
    const restyled = shot.source === 'footage' && values.restyle
    let visual = values.video
    if (restyled) {
      visual = await cached(`restyle-${i}`, footageFormat(), { video: { ...values.video, trim: { start: shot.start, end: shot.end } }, style: `${values.style}. ${shot.visual}` })
    } else if (shot.source !== 'footage') {
      const format = shotFormat(shot, values)
      const image = { ...format, kind: 'image', steps: [format.steps[0]], outputs: [{ step: 'image', kind: 'image' }] }
      visual = await cached(`image-${i}`, image, { visual: `${values.style}. ${shot.visual}` })
      if (values.animation === 'full') {
        const motion = { ...format, inputs: [...format.inputs, { id: 'image', type: 'image', label: 'First frame' }], steps: [format.steps[1]], outputs: [{ step: 'motion', kind: 'video' }] }
        visual = await cached(`motion-${i}`, motion, { visual: `${values.style}. ${shot.visual}`, image: visual })
      }
    }
    onProgress(`Shot ${i + 1} of ${shots.length}: voiceover`)
    const audio = await cached(`voice-${i}`, formatById('tts'), { script: shot.narration, voice: values.voice, language: values.language === 'auto' ? 'en' : values.language || 'en', emotion: values.emotion || 'neutral' })
    clips.push({ url: visual.url, kind: shot.source === 'footage' ? 'video' : visual.kind, start: shot.source === 'footage' && !restyled ? shot.start : undefined, end: shot.source === 'footage' && !restyled ? shot.end : undefined, duration: shot.seconds, maxDuration: shot.source !== 'footage' && values.animation === 'full' ? 5 : undefined, narration: { url: audio.url }, caption: values.captions ? shot.narration : '' })
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

export async function readStoryDocuments(selected, existing = []) {
  const files = [...selected]
  if (files.length + existing.length > 5) throw new Error('Attach at most 5 text files.')
  if (files.some((file) => !/\.(txt|md)$/i.test(file.name) || !['', 'text/plain', 'text/markdown'].includes(file.type))) throw new Error('Choose only .txt or .md text files.')
  if (files.some((file) => file.size > 100 * 1024)) throw new Error('Each text file must be at most 100 KB.')
  if ([...files, ...existing].reduce((n, file) => n + file.size, 0) > 200 * 1024) throw new Error('Text attachments must total at most 200 KB.')
  let remaining = Math.max(0, 50000 - existing.reduce((n, file) => n + file.text.length, 0))
  let truncated = existing.some((file) => file.truncated)
  const documents = [...existing]
  for (const file of files) {
    const text = await file.text()
    const cut = text.length > remaining
    documents.push({ name: file.name, size: file.size, text: text.slice(0, remaining), truncated: cut })
    truncated ||= cut
    remaining = Math.max(0, remaining - text.length)
  }
  return { documents, truncated }
}

export async function storyPlan(values, shots) {
  const response = await fetch('/api/story/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ values, shots }) })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Could not check pipeline requirements and cost.')
  return data
}
