import { topoOrder } from '../flowEngine.js'
import { comfyVars, estimate } from '../../../shared/mapping.js'

async function loadRequirements(workflows) {
  const response = await fetch('/api/comfy/requirements', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workflows }),
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
      entry.workflow = vars.image && model.imageWorkflow ? model.imageWorkflow : model.workflow
      entry.requirementIndex = workflows.length
      workflows.push({ workflow: entry.workflow, vars })
      if (model.cloudWorkflow) {
        entry.cloudWorkflow = model.cloudWorkflow
        entry.cloudRequirementIndex = workflows.length
        workflows.push({ workflow: model.cloudWorkflow, vars })
      }
    }
    return entry
  })
  const context = typeof requirements === 'function' ? await requirements(workflows) : requirements
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
    const cloud = context.requirements[step.cloudRequirementIndex] || own
    if (!own || !cloud || !Array.isArray(own.notOnCloud) || !Array.isArray(cloud.notOnCloud)) throw Object.assign(new Error(`Requirements missing for ${step.workflow}.`), { code: 'preflight_failed' })
    Object.assign(step, { notOnCloud: own.notOnCloud, minVramGb: own.minVramGb, arch: own.arch, cloud: { ...cloud } })
    const vram = pod.vramGb ?? pod.pod?.vramGb
    const fits = (vram == null || vram >= own.minVramGb) && (!own.arch || !pod.arch || own.arch === pod.arch)
    if (context.local) { step.target = 'local'; continue }
    const cloudConnected = context.cloudConnected ?? context.connections.comfyRouter?.connected ?? false
    if (runType !== 'instant' && pod.phase === 'ready' && fits) { step.target = 'pod'; continue }
    if (runType !== 'session' && cloudConnected && !cloud.notOnCloud.length) { step.target = 'cloud'; continue }
    if (runType !== 'instant' && !fits && pod.phase && pod.phase !== 'none') {
      fail('pod_too_small', `This pipeline needs a Session with ${own.minVramGb} gigabytes of graphics memory and a compatible architecture.`, { minVramGb: own.minVramGb, podVramGb: vram, arch: own.arch })
    } else if (runType !== 'instant' && ['starting', 'resuming'].includes(pod.phase) && fits) step.target = 'pod'
    else if (!cloudConnected && runType !== 'session' && !cloud.notOnCloud.length) fail('missing_key', 'Connect Comfy Cloud or run as a Session.', { provider: 'comfyRouter' })
    else fail('needs_pod', 'Run as a Session to finish this pipeline.', { minVramGb: own.minVramGb, notOnCloud: cloud.notOnCloud })
  }
  const known = costs.every((c) => c.usd != null)
  return { ok: !reasons.length, reason: reasons[0] || null, reasons, steps, runType, pod,
    cost: { steps: costs, total: known ? { usd: costs.reduce((n, c) => n + c.usd, 0), approx: costs.some((c) => c.approx) } : null } }
}
