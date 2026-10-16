import { recipeOptions } from '../recipes.js'
import { models } from '../catalog.js'

export function stepModel(format, step) {
  if (step.model) return models.find((m) => m.id === step.model)
  return { id: `format:${format.id}:${step.id}`, provider: step.provider, model: step.endpoint, workflow: step.workflow, kind: step.kind || format.kind, name: format.runsOn || format.name }
}

export function stepOptions(format, step, values) {
  const opts = recipeOptions({ ...format, prompt: step.prompt ?? format.prompt ?? '', params: step.params || {}, settings: step.settings || format.settings || {} }, values)
  for (const [field, slot] of Object.entries(step.bindings || {})) {
    const value = values[slot]
    if (value != null) opts.fields[field] = value?.url ?? value
  }
  return opts
}
