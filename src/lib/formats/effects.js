import research from '../../../research_notes/effect-specs.json' with { type: 'json' }
import { defineFormat } from './spec.js'
import { covers } from './parts.js'

export const effects = research.specs.map((spec) => defineFormat({
  id: `effect-${spec.id}`,
  name: spec.name,
  job: spec.job,
  shape: 'chain',
  kind: 'video',
  category: 'effects',
  hub: 'trending',
  blurb: `Turn your references into ${spec.name.toLowerCase()}. Review the prompt before rendering.`,
  engine: 'comfy',
  workflow: 'ltx_i2v',
  runsOn: 'LTX Video 2B, with Seedance alternatives',
  inputs: [
    ...spec.inputs.map((input) => ({ id: input.slot, type: 'image', label: input.label })),
    { id: 'note', type: 'text', label: 'Extra direction', optional: true },
    { id: 'renderer', type: 'choice', label: 'Render with', default: 'ltx', options: [
      { id: 'ltx', label: 'LTX Video 2B on Comfy' },
      { id: 'fal', label: 'Seedance via fal' },
      { id: 'router', label: 'Seedance via Comfy Router' },
    ] },
  ],
  settings: { aspect: spec.video_settings.aspect_ratio, duration: spec.video_settings.duration_seconds },
  steps: [
    { id: 'writer', type: 'writer', instructions: spec.writer_instructions, target: 'Video' },
    { id: 'video', kind: 'video', targetInput: 'renderer', provider: 'comfy', workflow: 'ltx_i2v', targets: {
      ltx: { provider: 'comfy', workflow: 'ltx_i2v' },
      fal: { provider: 'fal', endpoint: 'fal-ai/bytedance/seedance/v1.5/pro/image-to-video' },
      router: { model: 'comfy-router-seedance' },
    } },
  ],
  outputs: [{ step: 'video', kind: 'video' }],
  cover: covers.indigo,
}))
