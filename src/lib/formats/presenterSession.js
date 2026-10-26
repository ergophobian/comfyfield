import { compileFormat, nearestAspect } from './runner.js'
import { createEngine } from '../flowEngine.js'
import { podNeedsOf, minVramOf, notOnCloud } from '../../../shared/modelFiles.js'

export const isPresenterFormat = (format) => format.id.startsWith('ugc-') || format.id === 'influencer-motion'
export const speechWords = (text) => text.trim().split(/\s+/).filter(Boolean).length
export const speechProblem = (text) => speechWords(text) > 60 ? 'Keep the script to 60 words or fewer for the 30-second speech limit.' : null
export const motionFrames = (seconds) => Math.max(1, Math.min(81, 4 * Math.floor((seconds * 16 - 1) / 4) + 1))
export const motionSeconds = (video) => motionFrames(video?.trim ? video.trim.end - video.trim.start : Math.min(video?.duration || 5, 5)) / 16

export async function presenterRequirements(flow, loadGraph) {
  const requirements = await Promise.all(flow.nodes.filter((node) => node.type === 'model').map(async (node) => {
    const workflow = node.data.model.workflow
    const needs = podNeedsOf(await loadGraph(workflow))
    return { workflow, vram: minVramOf(needs), session: notOnCloud(needs).length > 0 }
  }))
  return { steps: requirements, vram: Math.max(0, ...requirements.map((r) => r.vram)), session: requirements.some((r) => r.session) }
}

export function presenterBlock(requirements, status, runType) {
  const needsSession = requirements.session || requirements.vram > 24
  const fits = status?.pod?.vramGb >= requirements.vram
  if ((needsSession && runType !== 'session') || (runType === 'session' && (status?.phase !== 'ready' || !fits))) {
    const message = requirements.vram > 24 ? `This format needs a Session with a ${requirements.vram} GB GPU` : requirements.session ? 'Speech videos need a Session' : 'This format needs a Session'
    return { message, workflow: requirements.steps.reduce((a, b) => b.vram > a.vram || (b.vram === a.vram && b.session) ? b : a).workflow }
  }
  return null
}

// Own the engine before running: the shared runner currently throws before returning its session.
export function createPresenterSession(format, values, { run, writePrompt, guard = async () => {} }) {
  if (values.rights !== 'confirmed') throw new Error('Confirm the presenter consent and asset rights before preparing.')
  const flow = compileFormat(format, values)
  const batch = crypto.randomUUID()
  const engine = createEngine({
    concurrency: 1,
    writePrompt: (input) => writePrompt({ ...input, inputs: flow.values, format }),
    run: (model, unit) => {
      const { formatStep, ...target } = model
      const options = { ...formatStep.options, count: unit.count, caption: format.name }
      if (formatStep.written && unit.prompt) {
        const problem = speechProblem(unit.prompt)
        if (problem) throw new Error(problem)
        options.prompt = unit.prompt
      }
      if (formatStep.from.length && unit.image) {
        options.images = [unit.image]
        if (options.slots) options.slots = { ...options.slots, pictures: [unit.image, ...options.slots.pictures.slice(1)] }
      }
      if (options.aspect === 'auto') options.aspect = nearestAspect(options.shape)
      return Promise.resolve(run(target, options, { formatId: format.id, stepId: formatStep.id, formatRunId: batch, prompt: options.prompt })).then((files) => {
        if (target.kind === 'video' && formatStep.written) session.renderedScript = options.prompt
        return files
      })
    },
  })
  const checked = async (fn) => {
    await guard(flow)
    const result = await fn()
    const failed = Object.values(engine.state).flatMap((s) => s.items || []).find((i) => i.status === 'failed')
    if (failed) throw Object.assign(new Error(failed.error), { session })
    return result
  }
  const session = { flow, engine, formatRunId: batch, scriptLimits: format.id.startsWith('ugc-'),
    results: () => flow.outputs.flatMap((out) => engine.itemsOf(flow, out.step) || []),
    resume: () => checked(() => engine.runNew(flow)),
    send: (id) => checked(() => engine.send(flow, id)),
    sendWriter: (id) => checked(() => engine.sendWriter(flow, id)),
    rerun: (id) => checked(() => engine.rerun(flow, id)),
  }
  return session
}
