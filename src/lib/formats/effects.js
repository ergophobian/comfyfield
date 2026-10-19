import research from '../../../research_notes/effect-specs.json' with { type: 'json' }
import { defineFormat } from './spec.js'
import { covers } from './parts.js'
import { ltx25Sizes } from '../catalog.js'

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
  workflow: 'ltx25_i2v',
  runsOn: 'LTX-2.5, with Seedance alternatives',
  inputs: [
    ...spec.inputs.map((input) => ({ id: input.slot, type: 'image', label: input.label })),
    { id: 'note', type: 'text', label: 'Extra direction', optional: true },
    { id: 'renderer', type: 'choice', label: 'Render with', default: 'ltx', options: [
      { id: 'ltx', label: 'LTX-2.5 on Comfy' },
      { id: 'fal', label: 'Seedance via fal' },
      { id: 'router', label: 'Seedance via Comfy Router' },
    ] },
  ],
  settings: { aspect: spec.video_settings.aspect_ratio, duration: spec.video_settings.duration_seconds },
  steps: [
    { id: 'writer', type: 'writer', instructions: spec.writer_instructions, target: 'Video' },
    { id: 'video', kind: 'video', targetInput: 'renderer', provider: 'comfy', workflow: 'ltx25_i2v', targets: {
      ltx: { provider: 'comfy', workflow: 'ltx25_i2v', sizes: ltx25Sizes },
      fal: { provider: 'fal', endpoint: 'fal-ai/bytedance/seedance/v1.5/pro/image-to-video' },
      router: { model: 'comfy-router-seedance' },
    } },
  ],
  outputs: [{ step: 'video', kind: 'video' }],
  cover: covers.indigo,
}))
