import { jobFor } from './jobs.js'

// Keep the existing catalog copy and controls while giving each entry an executable shape.
export function defineFormat(format) {
  return {
    shape: format.prompt ? 'preset' : 'tool',
    ...format,
    steps: format.steps || [{
      id: 'generate',
      ...(format.engine === 'comfy' ? { provider: 'comfy', workflow: format.workflow, ...(format.imageWorkflow && { imageWorkflow: format.imageWorkflow }) } : { provider: 'fal', endpoint: format.model }),
      kind: format.kind,
      prompt: format.prompt || '',
      params: format.params || {},
      settings: format.settings || {},
      ...(format.bindings && { bindings: format.bindings }),
      ...(format.sizes && { sizes: format.sizes }),
    }],
    outputs: format.outputs || [{ step: 'generate', kind: format.kind }],
    job: jobFor(format),
  }
}
