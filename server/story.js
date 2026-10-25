import * as core from './core.js'
import { minVramOf, notOnCloud, archOf } from '../shared/modelFiles.js'
import { estimate } from '../shared/mapping.js'
import { GPU_SPEED, jobSecondsOf, speedOf } from '../shared/gpuTiers.js'
import { parseShots, storyWorkflows } from '../src/lib/storyStudios.js'
import { inspectStoryFootage } from './stitch.js'

const refuse = (message) => { throw Object.assign(new Error(message), { status: 409 }) }

// Read-only: never starts a Session, downloads models or submits a generation.
export async function planStory({ values, shots }, {
  needs = core.workflowNeeds,
  status = () => { const p = core.pod(); const s = p.status(); return { ...s, pod: s.pod && { ...s.pod, arch: p.arch() } } },
  connection = () => ({ ...core.config('comfy'), run: core.runType() }),
  inspect = (url, range) => inspectStoryFootage(url, { mediaPath: core.mediaPath, range }),
} = {}) {
  const config = connection()
  const pod = status()
  let fps
  if (values.restyle && values.video?.url) fps = (await inspect(values.video.url)).fps
  values = { ...values, video: values.video && { ...values.video, fps } }
  if (shots) {
    shots = parseShots(JSON.stringify(shots), values)
    for (const [i, shot] of shots.entries()) {
      if (shot.source !== 'footage' || !values.restyle) continue
      const info = await inspect(values.video.url, { start: shot.start, end: shot.end })
      if (!(info.frames > 0 && info.frames <= 81)) refuse(`Shot ${i + 1} exceeds the 81-frame restyling limit or its frames could not be read. Split it before approval.`)
    }
  }
  // Before drafting, include both footage and generated cutaways so the writer cannot
  // introduce a more demanding workflow after it has already charged.
  const planned = shots || [{ source: 'generate' }, ...(values.video?.url ? [{ source: 'footage' }] : [])]
  const workflows = [...new Set(planned.flatMap((shot) => storyWorkflows(shot, values)))]
  const files = (workflow) => { const n = needs(workflow); return [...n.files, ...n.runtimes] }
  const byWorkflow = new Map(workflows.map((workflow) => [workflow, files(workflow)]))
  const all = [...byWorkflow.values()].flat()
  const minVramGb = minVramOf(all)
  const missing = notOnCloud(all)
  const arch = archOf(all)
  const session = config.run === 'session' || (config.run !== 'instant' && pod.phase === 'ready')
  if (session) {
    if (pod.phase !== 'ready') refuse(`This pipeline needs a ready Session with at least ${minVramGb} GB of GPU memory. Start it from the top bar before writing.`)
    if (!(pod.pod?.vramGb >= minVramGb)) refuse(`This pipeline needs a ${minVramGb} GB GPU; this Session has ${pod.pod?.vramGb ?? 'unknown'} GB. Choose a larger Session before writing or rendering.`)
    if (arch && pod.pod?.arch !== arch) refuse(`This pipeline needs a ${arch} GPU. Choose a compatible Session before writing or rendering.`)
  } else {
    if (missing.length) refuse(`This pipeline needs a Session with at least ${minVramGb} GB: ${[...new Set(missing.map((f) => f.label || f.name))].join(', ')} is unavailable on Comfy Cloud. Choose Session in the top bar before writing.`)
    if (!config.key) refuse('Connect Comfy Cloud or start a compatible Session before writing.')
  }
  const rate = session ? pod.pod.costPerHr / 3600 : core.CLOUD_USD_PER_GPU_SEC
  const gpuTypeId = session && (pod.pod.gpuTypeId || Object.keys(GPU_SPEED).find((key) => key.startsWith(`NVIDIA ${pod.pod.gpu} `) || key === `NVIDIA ${pod.pod.gpu}`))
  const speed = session ? speedOf({ ...pod.pod, gpuTypeId }) : 1
  const perShot = shots?.map((shot) => {
    const steps = storyWorkflows(shot, values).map((workflow) => {
      const seconds = jobSecondsOf(byWorkflow.get(workflow)) / speed
      const price = Number.isFinite(rate) ? estimate({ kind: 'video' }, { price: { amount: rate, unit: 'second', estimate: true } }, { duration: seconds }) : null
      return { workflow, seconds, usd: price?.usd ?? null }
    })
    return { title: shot.title, steps, usd: steps.every((s) => s.usd != null) ? steps.reduce((n, s) => n + s.usd, 0) : null }
  })
  return { minVramGb, fps, target: session ? 'Session' : 'Comfy Cloud', perShot,
    usd: perShot?.every((s) => s.usd != null) ? perShot.reduce((n, s) => n + s.usd, 0) : null }
}
