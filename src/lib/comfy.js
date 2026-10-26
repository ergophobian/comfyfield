import { runJob } from './jobs.js'

// Runs a bundled ComfyUI workflow through the local API, which sends it to Comfy Cloud or the Pod.
// A failed job keeps the server's code, reason and fit, so needs_pod and pod_too_small still reach the caller.
export function generate(workflow, vars, hooks = {}) {
  return runJob('/api/comfy/run', { workflow, vars }, hooks)
}
