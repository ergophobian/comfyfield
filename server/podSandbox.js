// A fake RunPod and a fake Pod behind the Pod manager's fetch seam, so the Pod UI can be built and
// checked without spending money. Turn it on with COMFYFIELD_POD_SANDBOX=1, or =nogpu to see a refusal.
// Time runs fast: a Pod answers in 4 s, is ready in 15 s, and downloads a model in 8 s.
import fs from 'node:fs'
import path from 'node:path'

const PRICES = {
  'NVIDIA RTX PRO 4000 Blackwell': 0.5,
  'NVIDIA RTX PRO 4500 Blackwell': 0.7,
  'NVIDIA RTX PRO 6000 Blackwell Server Edition': 1.69,
  'NVIDIA RTX PRO 6000 Blackwell Workstation Edition': 1.69,
}
// Secure cloud costs a little more, as on RunPod. The quote and the Pod use the same price.
const price = (gpu, secure) => Math.round(((PRICES[gpu] || 1) + (secure ? 0.2 : 0)) * 100) / 100
const ANSWERS = 4000
const READY = 15000
const DOWNLOAD = 8000

export function sandboxFetch({ file, now = Date.now, mode = process.env.COMFYFIELD_POD_SANDBOX } = {}) {
  const load = () => { try { return JSON.parse(fs.readFileSync(file(), 'utf8')) } catch { return {} } }
  const save = (pods) => { fs.mkdirSync(path.dirname(file()), { recursive: true }); fs.writeFileSync(file(), JSON.stringify(pods, null, 2)) }
  const json = (data, status = 200) => new Response(data == null ? null : JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

  function podStatus(pod) {
    const t = now()
    const up = t - pod.bootAt
    const downloads = {}
    const models = []
    let lastWork = pod.bootAt + READY
    for (const [k, d] of Object.entries(pod.downloads || {})) {
      const done = Math.min(1, (t - d.at) / DOWNLOAD)
      const total = Math.round(d.gb * 1e9)
      downloads[k] = { state: done >= 1 ? 'done' : 'downloading', bytes: Math.round(total * done), total, error: null }
      lastWork = Math.max(lastWork, d.at + DOWNLOAD)
      if (done >= 1) models.push({ dir: k.split('/')[0], name: k.split('/')[1], bytes: total })
    }
    const ready = up >= READY
    return {
      stage: ready ? 'ready' : up >= READY / 2 ? 'comfy' : 'boot', ready, fatal: null,
      idleSec: ready ? Math.max(0, Math.round((t - lastWork) / 1000)) : 0, uptimeSec: Math.round(up / 1000), queue: ready ? 0 : null,
      heartbeatAgeSec: pod.hb ? Math.round((t - pod.hb) / 1000) : null, gpu: ready ? { util: 0, memUsedMb: 900, memTotalMb: pod.vram * 1024 } : null,
      diskFreeGb: pod.volumeInGb - models.reduce((n, f) => n + f.bytes / 1e9, 0), ending: null, models, downloads,
    }
  }

  return async (url, init = {}) => {
    const u = new URL(url)
    const method = init.method || 'GET'
    const body = init.body ? JSON.parse(init.body) : null
    const pods = load()

    if (u.host === 'rest.runpod.io') {
      const [, , id, verb] = u.pathname.replace('/v1', '').split('/')
      if (u.pathname === '/v1/pods' && method === 'GET') return json(Object.values(pods).filter((p) => p.desiredStatus !== 'TERMINATED'))
      if (u.pathname === '/v1/pods' && method === 'POST') {
        if (mode === 'nogpu') return json({ error: 'create pod: There are no instances currently available' }, 500)
        const pod = {
          id: `sandbox${now().toString(36)}`, name: body.name, desiredStatus: 'RUNNING', costPerHr: price(body.gpuTypeIds[0], body.cloudType === 'SECURE'),
          createdAt: new Date(now()).toISOString(), env: body.env, volumeInGb: body.volumeInGb, machine: { gpuTypeId: body.gpuTypeIds[0] },
          vram: body.gpuTypeIds[0].includes('6000') ? 96 : body.gpuTypeIds[0].includes('4500') ? 32 : 24, bootAt: now(), downloads: {}, secure: body.cloudType === 'SECURE',
        }
        save({ ...pods, [pod.id]: pod })
        return json(pod, 201)
      }
      const pod = pods[id]
      if (!pod || pod.desiredStatus === 'TERMINATED') return json({ error: 'pod not found' }, 404)
      if (method === 'GET') return json(pod)
      if (method === 'DELETE') { pod.desiredStatus = 'TERMINATED'; save(pods); return json(null, 204) }
      if (verb === 'stop') { pod.desiredStatus = 'EXITED'; pod.costPerHr = 0; save(pods); return json(pod) }
      if (verb === 'start') { pod.desiredStatus = 'RUNNING'; pod.costPerHr = price(pod.machine.gpuTypeId, pod.secure); pod.bootAt = now() - READY / 2; pod.hb = null; save(pods); return json(pod) }
      return json({ error: 'not found' }, 404)
    }

    if (u.host === 'api.runpod.io') {
      const q = body?.query || ''
      if (q.includes('myself')) return json({ data: { myself: { id: 'sandbox-user' } } })
      const data = {}
      for (const [, alias, id, secure] of q.matchAll(/(\w+): gpuTypes\(input: \{id: "([^"]+)"\}\) \{ lowestPrice\(input: \{gpuCount: 1, secureCloud: (true|false)\}\)/g)) {
        data[alias] = [{ lowestPrice: { uninterruptablePrice: price(id, secure === 'true'), availableGpuCounts: mode === 'nogpu' ? [] : [1, 2], stockStatus: 'High' } }]
      }
      return json({ data })
    }

    const pm = /^(.+)-8190\.proxy\.runpod\.net$/.exec(u.host)
    const pod = pm && pods[pm[1]]
    if (!pod || pod.desiredStatus !== 'RUNNING' || now() - pod.bootAt < ANSWERS) return json({ error: 'not reachable' }, 502)
    if (init.headers?.Authorization !== `Bearer ${pod.env.POD_TOKEN}`) return json({ error: 'unauthorized' }, 401)
    if (u.pathname === '/status') return json(podStatus(pod))
    if (u.pathname === '/heartbeat') { pod.hb = now(); save(pods); return json(null, 204) }
    if (u.pathname === '/download') {
      for (const f of body.files || []) {
        const k = `${f.dir}/${f.name}`
        if (!pod.downloads[k]) pod.downloads[k] = { at: now(), gb: f.gb || 6 }
      }
      save(pods)
      return json({ downloads: podStatus(pod).downloads }, 202)
    }
    return json({ error: 'not found' }, 404)
  }
}
