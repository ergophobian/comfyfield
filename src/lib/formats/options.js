import { recipeOptions } from '../recipes.js'
import { models } from '../catalog.js'

export function selectedStep(format, step, values = {}) {
  const { targets, ...base } = step
  return { ...base, ...targets?.[values[step.targetInput] ?? format.inputs.find((i) => i.id === step.targetInput)?.default] }
}

export function bindingValue(values, binding) {
  if (Array.isArray(binding)) return binding.map((path) => bindingValue(values, path))
  return binding.split('.').reduce((value, key) => value?.[key], values)
}

export function stepModel(format, step, values) {
  step = selectedStep(format, step, values)
  if (step.model) {
    const model = models.find((m) => m.id === step.model)
    return model && { ...model, ...(step.cloudWorkflow && { cloudWorkflow: step.cloudWorkflow }) }
  }
  return { id: `format:${format.id}:${step.id}`, provider: step.provider, model: step.endpoint, workflow: step.workflow, ...(step.imageWorkflow && { imageWorkflow: step.imageWorkflow }), ...(step.cloudWorkflow && { cloudWorkflow: step.cloudWorkflow }), ...((step.sizes || format.sizes) && { sizes: step.sizes || format.sizes }), kind: step.kind || format.kind, name: format.runsOn || format.name }
}

export function stepOptions(format, step, values) {
  step = selectedStep(format, step, values)
  const opts = recipeOptions({ ...format, prompt: step.prompt ?? format.prompt ?? '', params: step.params || {}, settings: step.settings || format.settings || {} }, values)
  for (const [field, slot] of Object.entries(step.bindings || {})) {
    const value = bindingValue(values, slot)
    // An empty optional field can stand for a value the model reads, such as MiniMax's [Instrumental].
    const blank = typeof slot === 'string' ? format.inputs.find((i) => i.id === slot)?.blank : undefined
    if (blank != null && (value == null || (typeof value === 'string' && !value.trim()))) opts.fields[field] = blank
    else if (value != null) opts.fields[field] = value?.url ?? value
  }
  return opts
}
