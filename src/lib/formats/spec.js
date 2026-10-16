// Keep the existing catalog copy and controls while giving each entry an executable shape.
export function defineFormat(format) {
  return {
    job: format.blurb || format.name,
    shape: 'preset',
    ...format,
    steps: format.steps || [{
      id: 'generate',
      ...(format.engine === 'comfy' ? { provider: 'comfy', workflow: format.workflow } : { provider: 'fal', endpoint: format.model }),
      kind: format.kind,
      prompt: format.prompt || '',
      params: format.params || {},
      settings: format.settings || {},
    }],
    outputs: format.outputs || [{ step: 'generate', kind: format.kind }],
  }
}
