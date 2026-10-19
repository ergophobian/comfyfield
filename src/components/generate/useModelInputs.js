import { useEffect, useState } from 'react'
import { aspects } from '../../lib/catalog.js'
import { endpointFor, falSchema } from '../../lib/providers.js'

// fal names the last frame differently per model.
const endKeys = ['end_image_url', 'last_frame_url', 'tail_image_url', 'end_frame_url', 'last_image_url']
const ratioOk = (r) => r === 'auto' || /^\d+:\d+$/.test(r)
const choices = (p) => (p?.enum?.length > 1 ? p.enum.map(String) : null)

// What the open-weight models will offer once wired, so their chips read complete.
const openSpec = {
  image: { ratios: aspects, qualities: ['standard', 'high'], resolutions: ['1K', '2K'] },
  video: { ratios: aspects, resolutions: ['720p', '1080p'] },
  audio: { ratios: aspects },
}

// The chips a model gets, read from its fal schema the way Higgsfield's bar changes per model.
// A chip is only shown when the model takes that input, and `params` only carries values the person changed,
// so a default run sends exactly what it always has.
export function useModelInputs(model, framed) {
  const [schema, setSchema] = useState({ own: {}, i2v: {}, ready: false })

  useEffect(() => {
    let live = true
    setSchema({ own: {}, i2v: {}, ready: model.provider !== 'fal' })
    if (model.provider !== 'fal') return
    falSchema(model.model).then(async (s) => {
      // The image-to-video or edit sibling a run switches to once a frame or reference is attached.
      const i2v = model.kind !== 'audio'
        ? await endpointFor(model, true).then(falSchema).then((x) => x.properties || {}).catch(() => ({}))
        : {}
      if (live) setSchema({ own: s.properties || {}, i2v, ready: true })
    })
    return () => { live = false }
  }, [model.id])

  if (model.open) {
    const spec = openSpec[model.kind] || {}
    return { ready: true, ratios: spec.ratios || aspects, qualities: spec.qualities || null, resolutions: spec.resolutions || null,
      sound: /audio/i.test(model.blurb) ? { fixed: false, default: true } : null, endFrame: model.kind === 'video', manyImages: true, numImages: true }
  }

  if (model.provider !== 'fal') {
    return { ready: true, ratios: model.aspects || aspects, qualities: null, resolutions: null,
      // Veo renders sound on its own; there is no switch for it on the Google route.
      sound: model.provider === 'google' && model.kind === 'video' ? { fixed: true, default: true } : null,
      endFrame: false, numImages: true }
  }

  const { own, i2v, ready } = schema
  // With a frame or reference attached the run goes to that sibling, so its inputs decide.
  const active = framed && Object.keys(i2v).length ? i2v : own
  const ratios = (choices(active.aspect_ratio) || []).filter(ratioOk)
  const audio = active.generate_audio
  return {
    ready,
    ratios: ratios.length ? ratios : aspects,
    qualities: choices(active.quality),
    resolutions: choices(active.resolution),
    qualityDefault: active.quality?.default,
    resolutionDefault: active.resolution?.default,
    sound: audio ? { fixed: false, default: audio.default ?? true } : null,
    endFrame: endKeys.find((k) => i2v[k] || own[k]) || false,
    // Unknown until the schema loads; treat it as taking a count so nothing changes before then.
    numImages: !ready || Boolean(active.num_images),
  }
}

// Values the person changed from the model's defaults, sent through to fal as extra inputs.
export function paramsFor(inputs, { quality, resolution, sound, endFrame }) {
  const p = {}
  if (quality && inputs.qualities?.includes(quality) && quality !== String(inputs.qualityDefault)) p.quality = quality
  if (resolution && inputs.resolutions?.includes(resolution) && resolution !== String(inputs.resolutionDefault)) p.resolution = resolution
  if (inputs.sound && !inputs.sound.fixed && sound != null && sound !== inputs.sound.default) p.generate_audio = sound
  if (endFrame && typeof inputs.endFrame === 'string') p[inputs.endFrame] = endFrame
  return p
}

export const label = (v) => (/^[a-z]/.test(v) ? v[0].toUpperCase() + v.slice(1).replace(/_/g, ' ') : v)
