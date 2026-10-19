import { topoOrder } from '../flowEngine.js'
import { comfyVars, estimate } from '../../../shared/mapping.js'

async function loadRequirements(workflows, { runType } = {}) {
  const response = await fetch('/api/comfy/requirements', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workflows, runType }),
  })
  const data = await response.json()
  if (!response.ok) throw Object.assign(new Error(data.error || 'Could not check pipeline requirements.'), { code: 'preflight_failed' })
  return data
}

// Uses the compiled selection, including image variants and steps behind closed gates.
export async function preflightFlow(flow, { runType, pod, requirements = loadRequirements, prices = {} } = {}) {
  const workflows = []
  const imageSource = (id) => {
    const node = flow.nodes.find((n) => n.id === id)
    return node.type === 'image' || node.data.model?.kind === 'image' || (node.type === 'approve' && flow.edges.some((e) => e.target === id && imageSource(e.source)))
  }
  const steps = topoOrder(flow).map((id) => flow.nodes.find((n) => n.id === id)).filter((n) => ['model', 'writer', 'approve'].includes(n.type)).map((node) => {
    if (node.type !== 'model') return { stepId: node.id, type: node.type }
    const model = node.data.model
    const options = model.formatStep.options
    const entry = { stepId: node.id, type: 'model', provider: model.provider, model: model.id, options }
    if (model.provider === 'comfy') {
      const vars = comfyVars(model.kind, options, model.sizes)
      // An upstream image will occupy the first image slot at execution time.
      const upstreamImage = flow.edges.some((e) => e.target === node.id && imageSource(e.source))
      if (upstreamImage) vars.image ||= 'preflight://upstream-image'
      if (model.formatStep.written) vars.prompt ||= 'preflight://writer-prompt'
      entry.workflow = vars.image && model.imageWorkflow ? model.imageWorkflow : model.workflow
      entry.requirementIndex = workflows.length
      workflows.push({ workflow: entry.workflow, vars })
    }
    return entry
  })
  const context = typeof requirements === 'function' ? await requirements(workflows, { runType, pod }) : requirements
  if (!context?.connections || !Array.isArray(context.requirements)) throw Object.assign(new Error('Pipeline requirements are unavailable.'), { code: 'preflight_failed' })
  pod = pod ?? context.pod ?? { phase: 'none' }
  runType = runType ?? context.runType
  if (typeof prices === 'function') prices = await prices(flow.nodes.filter((n) => n.type === 'model').map((n) => n.data.model))
  const reasons = []
  const counts = new Map()
  const costs = []
  for (const step of steps) {
    const node = flow.nodes.find((n) => n.id === step.stepId)
    const fail = (code, message, extra = {}) => reasons.push({ code, stepId: step.stepId, message, ...extra })
    if (step.type === 'approve') {
      counts.set(node.id, flow.edges.filter((e) => e.target === node.id).reduce((n, e) => n + (counts.get(e.source) || 0), 0))
      costs.push({ stepId: step.stepId, usd: 0, approx: false })
      continue
    }
    if (step.type === 'writer') {
      step.providers = context.writerProviders || ['google']
      step.connected = step.providers.some((p) => context.connections[p]?.connected)
      if (!step.connected) fail('missing_key', 'Connect a prompt writer before running.', { providers: step.providers })
      costs.push({ stepId: step.stepId, usd: null, approx: false })
      continue
    }
    const model = node.data.model
    const options = step.options
    const count = flow.edges.filter((e) => e.target === node.id).reduce((n, e) => n + (counts.get(e.source) || 0), 0) || 1
    counts.set(node.id, model.kind === 'image' ? count * (node.data.takes || 1) * (options.count || 1) : 0)
    const meta = prices[model.model] || { price: model.price }
    const unknownText = model.formatStep.written && /character/i.test(meta.price?.unit || '')
    const cost = unknownText ? null : estimate(model, meta, { ...options, chars: options.prompt?.length, takes: count * (node.data.takes || 1) })
    costs.push({ stepId: step.stepId, usd: cost?.usd ?? null, approx: Boolean(cost?.approx) })
    if (step.provider !== 'comfy') {
      step.connected = Boolean(context.connections[step.provider]?.connected)
      if (!step.connected) fail('missing_key', `Connect ${step.provider} before running.`, { provider: step.provider })
      continue
    }
    const own = context.requirements[step.requirementIndex]
    if (!own || !Array.isArray(own.notOnCloud)) throw Object.assign(new Error(`Requirements missing for ${step.workflow}.`), { code: 'preflight_failed' })
    Object.assign(step, { notOnCloud: own.notOnCloud, minVramGb: own.minVramGb, arch: own.arch,
      cloud: own.cloud, target: own.target, selectedWorkflow: own.selectedWorkflow })
    if (own.reason) fail(own.reason.code, own.reason.message, { ...own.reason, stepId: step.stepId })
    else if (!own.target) throw Object.assign(new Error(`Target missing for ${step.workflow}.`), { code: 'preflight_failed' })
  }
  const known = costs.every((c) => c.usd != null)
  return { ok: !reasons.length, reason: reasons[0] || null, reasons, steps, runType, pod,
    cost: { steps: costs, total: known ? { usd: costs.reduce((n, c) => n + c.usd, 0), approx: costs.some((c) => c.approx) } : null } }
}
