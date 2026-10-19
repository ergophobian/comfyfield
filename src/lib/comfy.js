// Runs a bundled ComfyUI workflow through the local API, which sends it to Comfy Cloud or the Pod.
export async function generate(workflow, vars) {
  const res = await fetch('/api/comfy/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow, vars }),
  })
  const data = await res.json()
  if (!res.ok) throw Object.assign(new Error(data.error || `Comfy request failed (${res.status})`), { code: data.code, reason: data.reason })
  return data.files
}
