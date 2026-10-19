import { readFileSync } from 'node:fs'
import { fill, dropOptional } from '../../shared/mapping.js'
import { podNeedsOf, notOnCloud, minVramOf, archOf } from '../../shared/modelFiles.js'

// Test-only metadata. Never loads the provider core, environment keys or a network client.
export function offlineRequirements(workflows) {
  return {
    connections: Object.fromEntries(['fal', 'google', 'elevenlabs', 'comfy', 'comfyRouter', 'runpod'].map((id) => [id, { connected: true }])),
    writerProviders: ['google'], cloudConnected: true, runType: 'session', pod: { phase: 'ready', vramGb: 128 },
    requirements: workflows.map(({ workflow, vars }) => {
      const graph = JSON.parse(readFileSync(new URL(`../../public/workflows/${workflow}.json`, import.meta.url)))
      const needs = podNeedsOf(fill(dropOptional(graph, vars), vars))
      return { workflow, notOnCloud: notOnCloud(needs), minVramGb: minVramOf(needs), arch: archOf(needs) }
    }),
  }
}
