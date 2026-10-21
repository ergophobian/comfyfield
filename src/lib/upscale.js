// Upscale in Create video: the model makes the clip at a source resolution, then SeedVR2 takes it to a
// target resolution. With nothing picked both are chosen here; Advanced lets the person pick either.
// Resolutions are named by their short side, so 720p is 1280 × 720 at 16:9 and 720 × 1280 at 9:16.
import { videoSize } from '../../shared/mapping.js'
import { aspectSize } from './catalog.js'

export const targets = [
  { id: '1080p', label: '1080p', short: 1080 },
  { id: '1440p', label: '1440p', short: 1440 },
  { id: '4k', label: '4K', short: 2160 },
]
// Auto skips 1440p: 1080p and 4K are the sizes people deliver.
const autoTargets = ['1080p', '4k']

export const upscalers = [
  { id: 'seedvr2-3b', name: 'SeedVR2 3B', note: 'Faster', workflow: 'seedvr2_video' },
  { id: 'seedvr2-7b', name: 'SeedVR2 7B', note: 'More detail', workflow: 'seedvr2_video_7b' },
]

// The graphs cap the long side at 4K width.
export const MAX_LONG = 3840

export const upscalerModel = (id) => {
  const u = upscalers.find((x) => x.id === id) || upscalers[0]
  return { id: `upscale:${u.id}`, provider: 'comfy', kind: 'video', name: u.name, workflow: u.workflow }
}

// '720p' → 720, '1080P' → 1080, '4k' → 2160. Anything else has no short side we can plan with.
export function shortOf(value) {
  const v = String(value).trim().toLowerCase()
  if (v === '4k') return 2160
  if (v === '2k') return 1440
  const m = /^(\d{3,4})p$/.exec(v)
  return m ? Number(m[1]) : null
}

// Draft scales for open models: comfyVars shrinks the canvas in multiples of 64.
const drafts = [1, 0.75, 0.5]
const scaled = (n, s) => (s === 1 ? n : Math.max(64, Math.round((n * s) / 64) * 64))

// The resolutions a model can make, smallest first. A fal model lists its `resolution` choices; an open
// model on ComfyUI makes its own canvas, or a smaller draft of it. Other models have no choice.
export function sourcesFor(model, inputs, aspect) {
  if (inputs?.resolutions?.length) {
    return inputs.resolutions.map((r) => ({ id: r, label: r, short: shortOf(r), resolution: r }))
      .filter((s) => s.short).sort((a, b) => a.short - b.short)
  }
  if (model.provider === 'comfy' && model.sizes) {
    // The canvas comfyVars picks for the run.
    const [w, h] = model.sizes[aspect] || videoSize(aspectSize[aspect] ? aspect : '1:1')
    return drafts.map((s) => {
      const short = Math.min(scaled(w, s), scaled(h, s))
      return { id: `x${s}`, label: `${short}p`, short, scale: s, native: s === 1 }
    }).sort((a, b) => a.short - b.short)
  }
  return []
}

// The source and target for a run. A pick that no longer fits (another model, or a target at or under
// the source) falls back to the automatic choice: the largest source under the target, and the first
// of 1080p and 4K above the source.
export function planUpscale(sources, pick = {}) {
  let source = sources.find((s) => s.id === pick.source) || null
  let target = targets.find((t) => t.id === pick.target) || null
  if (!source && sources.length) {
    const cap = target?.short ?? 1080
    source = [...sources].reverse().find((s) => s.short < cap) || (target ? sources[0] : sources.at(-1))
  }
  const floor = source?.short ?? 0
  if (!target || target.short <= floor) {
    target = autoTargets.map((id) => targets.find((t) => t.id === id)).find((t) => t.short > floor)
      || targets.find((t) => t.short > floor) || targets.at(-1)
  }
  return { source, target }
}

// The SeedVR2 run for one finished clip: its scale factor and how many seconds to read. `size` is the
// clip as the browser measured it; without it the planned source stands in. Null when the clip is
// already at the target, so nothing runs.
export function upscaleJob(target, size, { short: plannedShort, seconds: plannedSeconds } = {}) {
  const short = size ? Math.min(size.width, size.height) : plannedShort || 720
  let factor = target.short / short
  if (size) factor = Math.min(factor, MAX_LONG / Math.max(size.width, size.height))
  if (factor < 1.05) return null
  const seconds = size?.seconds > 0 && Number.isFinite(size.seconds) ? size.seconds : plannedSeconds || 5
  // Video Slice reads up to `duration` seconds, so one spare second keeps the last frames.
  return { factor: Math.round(factor * 1000) / 1000, duration: Math.ceil(seconds) + 1 }
}

// Width, height and length of a clip, read from its metadata. Null when the browser cannot read it.
export function measureVideo(url, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    const done = (value) => {
      clearTimeout(timer)
      v.removeAttribute('src')
      v.load()
      resolve(value)
    }
    const timer = setTimeout(() => done(null), timeoutMs)
    v.preload = 'metadata'
    v.muted = true
    v.onloadedmetadata = () => done(v.videoWidth ? { width: v.videoWidth, height: v.videoHeight, seconds: v.duration } : null)
    v.onerror = () => done(null)
    v.src = url
  })
}
