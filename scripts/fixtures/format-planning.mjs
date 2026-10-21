import { readFileSync } from 'node:fs'
import { models, cloudWorkflows } from '../../src/lib/catalog.js'
import { fill, dropOptional } from '../../shared/mapping.js'
import { podNeedsOf, notOnCloud, minVramOf, archOf } from '../../shared/modelFiles.js'

// Test-only metadata. Never loads the provider core, environment keys or a network client.
export function offlineRequirements(workflows, { runType = 'session', pod = { phase: 'ready', vramGb: 128 } } = {}) {
  return {
    connections: Object.fromEntries(['fal', 'google', 'elevenlabs', 'comfy', 'comfyRouter', 'runpod'].map((id) => [id, { connected: true }])),
    writerProviders: ['google', 'comfyRouter'], cloudConnected: true, runType, pod,
    requirements: workflows.map(({ workflow, vars }) => {
      const metadata = (name) => {
        const graph = JSON.parse(readFileSync(new URL(`../../public/workflows/${name}.json`, import.meta.url)))
        const needs = podNeedsOf(fill(dropOptional(graph, vars), vars))
        return { workflow: name, notOnCloud: notOnCloud(needs), minVramGb: minVramOf(needs), arch: archOf(needs) }
      }
      const own = metadata(workflow)
      const model = models.find((m) => m.workflow === workflow || m.imageWorkflow === workflow)
      const alternate = (workflow === model?.imageWorkflow ? model?.cloudImageWorkflow : model?.cloudWorkflow) || cloudWorkflows[workflow]
      const cloud = alternate ? metadata(alternate) : own
      const fits = (pod.vramGb == null || pod.vramGb >= own.minVramGb) && (!own.arch || !pod.arch || own.arch === pod.arch)
      const ready = runType !== 'instant' && pod.phase === 'ready' && fits
      const available = runType !== 'session' && !cloud.notOnCloud.length
      const target = ready || (runType !== 'instant' && ['starting', 'resuming'].includes(pod.phase) && fits && !available) ? 'pod' : available ? 'cloud' : null
      const code = runType !== 'instant' && !fits && pod.phase !== 'none' ? 'pod_too_small' : 'needs_pod'
      return { ...own, cloud, target, selectedWorkflow: target === 'cloud' ? cloud.workflow : workflow,
        ...(!target && { reason: { code, message: `Fixture ${workflow} ${code}` } }) }
    }),
  }
}
